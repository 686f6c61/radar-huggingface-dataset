# fsafaw34r/ui2vibe-mcp

## Resumen

`ui2vibe-mcp` no es un modelo de lenguaje, sino un servidor del Model Context Protocol (MCP) desarrollado por KR-PRO-Labs y publicado en Hugging Face bajo el identificador `fsafaw34r/ui2vibe-mcp`. Su funcion es actuar como capa de absorcion de interfaces de usuario: recibe referencias frontend (HTML, CSS, Tailwind, JSX/TSX, SFC de Vue o instantaneas del DOM computado) y las destila en tokens de diseno, esqueletos de layout responsivos, ecuaciones fisicas de movimiento y componentes listos para produccion en multiples frameworks.

El proyecto se presenta como la contraparte frontend de `clonevibe-mcp`, orientada al flujo de trabajo que el autor denomina "vibe coding": absorcion rapida de referencias visuales para integrarlas en un proyecto anfitrion sin dependencias externas de librerias de UI. Esta implementado en Node.js (version estricta ESM, requiere Node >= 20) y expone seis herramientas MCP y dos recursos integrados.

La relevancia actual del proyecto reside en su encaje en el ecosistema MCP 1.0.4, el estandar impulsado por Anthropic para conectar asistentes de IA con herramientas externas. No obstante, la ficha de Hugging Face no contiene pesos, configuracion de modelo ni datos de entrenamiento: es un repositorio de codigo, no un modelo entrenado, por lo que las secciones de arquitectura neuronal, benchmarks y requisitos de GPU no aplican en sentido estricto y se documentan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP (Model Context Protocol) en Node.js con ESM estricto; no es un modelo neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica; el contexto lo aporta el cliente MCP) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en la ficha de Hugging Face; la documentacion del proyecto esta en ingles y coreano |
| Licencia | MIT (segun el README del proyecto); la ficha de Hugging Face no declara licencia |
| Formato de pesos | no disponible (no hay pesos; el artefacto es codigo TypeScript/JavaScript compilado a `dist/index.js`) |

## Arquitectura y entrenamiento

El proyecto no entrena ningun modelo. Su arquitectura es la de un servidor MCP que implementa un pipeline de seis etapas sobre referencias de UI: `capture_ui_reference` (normalizacion de AST de DOM y estilos), `extract_design_tokens` (conversion de color a OKLCH, emparejamiento claro/oscuro, escala tipografica modular, cuantizacion de espaciado a rejilla de 8 puntos, sombras multicapa y tokens de glassmorphism), `decompose_layout_skeleton` (poda de cadenas de `div` redundantes hacia landmarks HTML5 semanticos y resolucion de ejes Flex/Grid y breakpoints `sm`, `md`, `lg`, `xl`), `extract_motion_physics` (parseo de `transition`, `@keyframes` y `cubic-bezier` para resolver parametros equivalentes de oscilador armonico: `stiffness`, `damping`, `mass`, `settlingTimeMs`), `synthesize_vibe_component` (generacion de componentes sin dependencias para `react-tailwind`, `react-css-vars`, `vanilla-css`, `vue-tailwind` y `svelte-css`) y `audit_ui_fidelity` (verificacion WCAG 2.1 AA >= 4.5:1 y AAA >= 7.0:1, objetivos tactiles minimos de 44x44 px, guardrails `prefers-reduced-motion` y estabilidad CLS, con puntuacion global de 0 a 100).

No se documentan datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia neuronal, porque el artefacto es determinista y basado en reglas y transformaciones algoritmicas. La innovacion tecnica destacable es la traduccion de curvas `cubic-bezier` a parametros fisicos de muelle sin dependencia de librerias de animacion, y la conversion perceptual de color a OKLCH para generar paletas coherentes en modo claro y oscuro.

## Capacidades

- Extraccion de tokens de diseno desde HTML, CSS, Tailwind, JSX/TSX, SFC de Vue o instantaneas de DOM computado.
- Conversion de color entre sRGB, Hex y HSL hacia OKLCH, con sintesis automatica de contrapartidas para modo oscuro.
- Clasificacion semantica de roles de token: `background`, `surface`, `text-primary`, `accent`, `border`, `glass`.
- Cuantizacion de espaciado a rejilla de 8 puntos y construccion de escalas tipograficas modulares.
- Poda de "div-soup" y generacion de esqueletos semanticos HTML5 (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`).
- Resolucion de ejes Flexbox y CSS Grid, y de breakpoints responsivos.
- Extraccion de fisica de movimiento desde `transition`, `@keyframes` y `cubic-bezier`, con parametros de muelle (`stiffness`, `damping`, `mass`, `settlingTimeMs`).
- Sintesis de componentes sin dependencias en cinco targets: `react-tailwind`, `react-css-vars`, `vanilla-css`, `vue-tailwind`, `svelte-css`, con variables CSS `:root`/`.dark` y extensiones de tema para `tailwind.config`.
- Auditoria de accesibilidad WCAG 2.1 AA/AAA, objetivos tactiles de 44x44 px, `prefers-reduced-motion` y CLS, con puntuacion de fidelidad de UI.
- Soporte de hooks de pseudoestado (`:hover`, `:focus-visible`, `:active`, modo oscuro).
- Recursos MCP integrados: `ui2vibe://presets/motion-curves` y `ui2vibe://guide/ui-absorption-workflow`.
- No soporta tool calling generativo ni agentes por si mismo: es la herramienta que un cliente MCP invoca.

## Casos de uso

- Migracion de un design system a tokens: dado un fragmento de CSS o Tailwind existente, `extract_design_tokens` produce una paleta OKLCH con roles semanticos y contrapartidas de modo oscuro, lista para inyectar como variables CSS en el proyecto anfitrion.
- Reconstruccion de un layout heredado: `decompose_layout_skeleton` colapsa cadenas de `div` anidadas en landmarks HTML5 y resuelve los ejes Flex/Grid, util para refactorizar maquetas antiguas hacia HTML semantico accesible.
- Portabilidad entre frameworks: `synthesize_vibe_component` permite tomar una referencia en JSX y emitir el equivalente en Vue o Svelte con el mismo tema de tokens, lo que reduce el trabajo de reescritura en equipos multi-framework.
- Armonizacion de animaciones: `extract_motion_physics` traduce las curvas `cubic-bezier` de una referencia a parametros de muelle fisicos, lo que permite reproducir la sensacion de movimiento en librerias de animacion basadas en fisica sin copiar el CSS original.
- Auditoria de accesibilidad previa a produccion: `audit_ui_fidelity` verifica ratios de contraste WCAG AA/AAA, tamanos tactiles de 44x44 px y guardrails de movimiento reducido, y devuelve una puntuacion de 0 a 100 util como gate en CI.
- Integracion en asistentes de codigo con MCP: configurando el servidor en un cliente MCP (por ejemplo, un IDE con soporte MCP), el asistente puede invocar las herramientas para absorber una referencia visual y generar el componente en el proyecto del desarrollador.
- Estandarizacion de temas claro/oscuro: la generacion automatica de pares de tokens permite mantener coherencia entre ambos modos sin duplicar definiciones manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no es un modelo de lenguaje y no reporta metricas de MMLU, HumanEval, GSM8K ni similares. Tampoco se documentan latencias ni throughput del servidor MCP.

## Requisitos de hardware

- VRAM: no aplica; no se ejecuta inferencia neuronal.
- CPU y memoria: suficiente con un entorno Node.js >= 20; el README no especifica minimos de RAM ni CPU.
- GPU: no requiere GPU dedicada.
- Despliegue: ejecucion local como proceso Node (`node /path/to/ui2vibe-mcp/dist/index.js`) configurado en el fichero de cliente MCP; tambien puede desplegarse en cualquier entorno con Node.js disponible.
- Instalacion: clonar el repositorio, `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ui2vibe-mcp` | Servidor MCP (Node.js) | Absorcion de UI frontend: tokens, layout, movimiento y sintesis multi-framework | MIT | Hugging Face y GitHub (KR-PRO-Labs) |
| `clonevibe-mcp` | Servidor MCP (Node.js) | Extraccion de algoritmos backend/core desde codigo de referencia | no disponible en la informacion proporcionada | GitHub (KR-PRO-Labs) |
| Servidores MCP de diseno generico | Servidor MCP | Generacion de componentes o temas sin pipeline de absorcion | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estos proyectos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni razona; sus salidas son transformaciones deterministas sobre referencias de UI.
- La ficha de Hugging Face no declara licencia, idiomas ni pipeline; la licencia MIT figura unicamente en el README del repositorio de GitHub, por lo que conviene verificar la procedencia exacta del artefacto publicado.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-06), lo que sugiere un proyecto muy reciente y sin validacion externa.
- La calidad de la absorcion depende de la calidad de la referencia de entrada; referencias incompletas o con estilos computados parciales pueden producir tokens o esqueletos imprecisos.
- La conversion de `cubic-bezier` a fisica de muelle es una aproximacion; no reproduce exactamente todos los comportamientos de animacion complejos.
- El pipeline de auditoria cubre WCAG 2.1 AA/AAA, objetivos tactiles y CLS, pero no sustituye una auditoria de accesibilidad completa (lectores de pantalla, navegacion por teclado, ARIA).
- Requiere Node.js >= 20 y ESM estricto; entornos con CommonJS o versiones antiguas de Node pueden no ser compatibles.
- No hay datos publicos de benchmarks, latencia ni cobertura de pruebas mas alla del badge de CI del repositorio.
- Riesgo de dependencia de un unico mantenedor (KR-PRO-Labs / @sjdhfjdj30-hash) para un componente que se integra en el flujo de desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/fsafaw34r/ui2vibe-mcp
- Repositorio GitHub: https://github.com/KR-PRO-Labs/ui2vibe-mcp
- Proyecto hermano `clonevibe-mcp`: https://github.com/KR-PRO-Labs/clonevibe-mcp
- Especificacion MCP: https://modelcontextprotocol.io/
- Organizacion KR-PRO-Labs: https://github.com/KR-PRO-Labs
- Perfil del autor en GitHub: https://github.com/sjdhfjdj30-hash
- Node.js: https://nodejs.org/
