/* ==========================================================
   DR. JAIR KAUTZMANN - INTERAÇÕES
   Preencha apenas o número abaixo para ativar WhatsApp.
   Formato: 55 + DDD + número, somente dígitos.
   ========================================================== */
const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Olá! Encontrei o Dr. Jair pelo site e gostaria de saber mais sobre uma avaliação odontológica.";

(() => {
  "use strict";

  const root = document.documentElement;
  const preloader = document.getElementById("preloader");
  const loaderBar = document.getElementById("preloader-progress");
  const loaderCount = document.getElementById("preloader-count");
  const startedAt = performance.now();
  const minTime = 950;
  let loaded = document.readyState === "complete";
  let progress = 0;
  let finishing = false;

  const finishLoader = () => {
    if (finishing) return;
    finishing = true;
    const wait = Math.max(0, minTime - (performance.now() - startedAt));
    window.setTimeout(() => {
      progress = 100;
      if (loaderBar) loaderBar.style.width = "100%";
      if (loaderCount) loaderCount.textContent = "100";
      window.setTimeout(() => {
        preloader?.classList.add("is-done");
        root.classList.remove("preloading");
        window.setTimeout(() => preloader?.remove(), 950);
      }, 160);
    }, wait);
  };

  const tick = () => {
    if (!preloader || preloader.classList.contains("is-done")) return;
    const target = loaded ? 100 : 88;
    progress += Math.max(.35, (target - progress) * .06);
    progress = Math.min(progress, target);
    if (loaderBar) loaderBar.style.width = `${progress}%`;
    if (loaderCount) loaderCount.textContent = String(Math.floor(progress)).padStart(2,"0");
    if (loaded && progress >= 96) finishLoader();
    else requestAnimationFrame(tick);
  };

  window.addEventListener("load", () => { loaded = true; }, { once:true });
  if (preloader) requestAnimationFrame(tick);

  document.querySelectorAll("[data-wa]").forEach((link) => {
    const message = link.dataset.waMessage || WHATSAPP_MESSAGE;
    if (WHATSAPP_NUMBER) {
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.href = "#";
      link.addEventListener("click", (e) => e.preventDefault());
    }
  });

  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (e) => e.preventDefault());
  });

  const header = document.querySelector(".hd");
  const pageProgress = document.getElementById("page-progress");
  const onScroll = () => {
    header?.classList.toggle("stuck", window.scrollY > 24);
    if (pageProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pageProgress.style.width = `${(max > 0 ? Math.min(1, window.scrollY / max) : 0) * 100}%`;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", onScroll, { passive:true });

  const burger = document.querySelector(".burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    const first = nav.querySelector("a");
    const setMenu = (open, restore=false) => {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.textContent = open ? "Fechar" : "Menu";
      document.body.classList.toggle("menu-open", open);
      if (open) window.setTimeout(() => first?.focus(), 30);
      else if (restore) burger.focus();
    };
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") setMenu(false,true); });
    const desktop = window.matchMedia("(min-width:1081px)");
    desktop.addEventListener?.("change", (e) => { if (e.matches) setMenu(false); });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = document.querySelectorAll(".rv");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold:.1, rootMargin:"0px 0px -4% 0px" });
    reveal.forEach((el) => io.observe(el));
  } else reveal.forEach((el) => el.classList.add("in"));

  const fab = document.querySelector(".wa-fab");
  const quiet = document.querySelectorAll("#agendar, .ft");
  if (fab && "IntersectionObserver" in window) {
    const active = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target));
      fab.classList.toggle("off", active.size > 0);
    });
    quiet.forEach((zone) => io.observe(zone));
  }



  /* Visualizador interativo de alinhamento */
  const range = document.getElementById("align-range");
  const output = document.getElementById("align-output");
  const model = document.getElementById("dental-model");
  const stage = document.getElementById("dental-stage");
  if (range && model) {
    const upper = [...model.querySelectorAll(".arch--upper .tooth")];
    const lower = [...model.querySelectorAll(".arch--lower .tooth")];
    const crookedUpper = [
      [-10,8,-16],[4,-2,10],[-3,9,-8],[2,-1,4],[-2,3,-3],[7,8,9],[-4,-3,-9],[9,7,15]
    ];
    const crookedLower = [
      [8,5,14],[-6,-2,-10],[5,8,8],[-3,-2,-4],[2,4,4],[-7,7,-7],[5,-1,11],[-8,5,-15]
    ];
    const aligned = [
      [-4,5,-8],[-2,2,-5],[-1,0,-2],[0,-1,0],[0,-1,0],[1,0,2],[2,2,5],[4,5,8]
    ];
    const lerp = (a,b,t) => a + (b-a)*t;
    const apply = (nodes, from, t, lowerArch=false) => {
      nodes.forEach((el,i) => {
        const [x0,y0,r0] = from[i];
        const [x1,y1,r1] = aligned[i];
        const x = lerp(x0,x1,t);
        const y = lerp(y0,y1,t);
        const r = lerp(r0,r1,t);
        const z = Math.sin((i/(nodes.length-1))*Math.PI)*18;
        el.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateZ(${r}deg)`;
        el.style.filter = `brightness(${1 + t*.03})`;
      });
    };
    const update = () => {
      const t = Number(range.value)/100;
      apply(upper,crookedUpper,t,false);
      apply(lower,crookedLower,t,true);
      if (output) output.textContent = `${Math.round(t*100)}%`;
    };
    range.addEventListener("input", update);
    update();

    if (stage && !reduceMotion) {
      const setTilt = (clientX, clientY) => {
        const r = stage.getBoundingClientRect();
        const x = (clientX-r.left)/r.width - .5;
        const y = (clientY-r.top)/r.height - .5;
        model.style.setProperty("--ry", `${x*16}deg`);
        model.style.setProperty("--rx", `${-8-y*10}deg`);
      };
      stage.addEventListener("pointermove", (e) => setTilt(e.clientX,e.clientY));
      stage.addEventListener("pointerleave", () => {
        model.style.setProperty("--ry","0deg");
        model.style.setProperty("--rx","-8deg");
      });
    }
  }

  document.querySelectorAll(".media img").forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop, { once:true });
  });
})();
