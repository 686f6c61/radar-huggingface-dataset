# smlflg/My-Agentic-Timeline

## Resumen

El repositorio smlflg/My-Agentic-Timeline no contiene un modelo de inteligencia artificial en el sentido habitual: no hay pesos, ni arquitectura de red neuronal, ni tokenizador, ni pipeline de inferencia. Se trata de un artefacto web estatico compuesto por una pagina index.html y un fichero de datos congelados timeline-data.js, que documenta de forma interactiva la evolucion del trabajo de su autor con agentes de IA entre enero y julio de 2026. El repositorio ocupa 0,0 GB, no registra descargas ni likes y solo lleva la etiqueta region:us.

El contenido describe una retrospectiva estructurada en 10 arcos de evolucion aceptados, 3 transferencias entre harness verificadas, 3 metricas de contexto recalculadas, 11 reglas HAI aplicadas como lente retroactiva y 7 tarjetas mensuales, de las cuales enero y febrero permanecen marcadas explicitamente como NO_EVIDENCE. La interfaz separa dos lecturas independientes, STORY e INSIGHTS, y permite combinar rutas asociadas a Claude Code, Codex, OpenCode, Hermes/HAI y transferencias agnosticas de harness.

Su relevancia no es la de un modelo desplegable, sino la de una metodologia reproducible de auditoria de evidencia sobre sesiones de agentes: define cuatro clases de evidencia (A, B, C y D), un ledger inmutable, un manifiesto de build congelado y un contrato de privacidad local-first. Para un desarrollador o investigador, el interes esta en el formato de trazabilidad y en el corpus de metadatos, no en capacidades de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Artefacto web estatico (HTML + JavaScript con datos congelados en `timeline-data.js`) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica; no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no hay ventana de contexto de inferencia) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en los metadatos del repositorio; el contenido de la model card y de la interfaz esta redactado en aleman |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene `index.html` y `timeline-data.js`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto se compone de una pagina HTML que se abre directamente mediante el protocolo file://, sin build, sin servidor y sin dependencias externas, y de un fichero JavaScript que entrega los datos congelados de forma sincrona. La pagina no realiza busquedas propias ni evalua sesiones en bruto: toda la informacion mostrada procede de una copia inmutable e integrada en el repositorio.

La capa de datos sigue un contrato de evidencia explicito con cuatro clases: A (afirmacion directa fechada), B (aplicacion o artefacto fechado), C (reconstruccion retrospectiva) y D (mera correlacion de actividad). La clase D nunca justifica por si sola un paso de aprendizaje. Las fuentes declaradas incluyen un Computer-Day-Audit de sesiones de agentes, un snapshot inmutable de PromptGarage con IDs de prompt concretos, los artefactos Sidecar V1-V8 y NG, los contratos y artefactos de rol de HAI V1.x/V2 y HAI-OS, y artefactos Git verificados con hashes cortos de commit. Cada arco referencia su entrada del ledger mediante un ARC-ID, las transferencias usan TR-IDs y las metricas M-IDs.

## Capacidades

- Visualizacion interactiva de una cronologia de evolucion profesional distribuida en 10 arcos aceptados.
- Dos modos de lectura independientes: STORY (relato cronologico de los arcos) e INSIGHTS (transferencias, principios y retrospectiva HAI interactiva).
- Barra mensual fija con 7 tarjetas, de enero a julio, que muestran intencion del propietario, forma de pensar y trabajar, ganancias, costes, trazas de prompt, goal, hooks y permisos, intervencion HAI actual, evidencia e incertidumbre.
- Filtrado combinable por rutas de harness (Claude Code, Codex, OpenCode, Hermes/HAI y agnostico de harness) bajo logica ODER / Union.
- Filtrado adicional por concepto, nivel de desarrollo y seguridad de la evidencia; la opcion Todos es neutra y solo elimina los filtros de ruta concretos.
- Cinco zooms de puntos de inflexion desplegables con resolucion de dia, fase multi-dia o semana, y once reglas HAI desplegables.
- Persistencia de estado en el hash de la URL (vista, rutas, concepto, nivel de desarrollo y seguridad de evidencia) con restauracion tras recarga; los hashes desconocidos o incompletos cargan la vista por defecto segura.
- Accesibilidad: todos los controles son botones o selects nativos, operables por teclado, con cierre del detalle mediante Escape y retorno del foco al elemento que lo activo; prefers-reduced-motion elimina la animacion de entrada.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico propio.

## Casos de uso

- Auditoria metodologica de trabajo con agentes: el artefacto sirve como plantilla para registrar que se hizo, cuando y con que evidencia, separando afirmacion directa, artefacto, reconstruccion retrospectiva y correlacion de actividad. Es adecuado porque el contrato de evidencia esta explicitado y es verificable.
- Documentacion de portafolio tecnico: un desarrollador puede publicar su historial de adopcion de harnesses (Claude Code, Codex, OpenCode) con rutas combinables y filtros por nivel de desarrollo, sin exponer prompts completos ni sesiones.
- Analisis de evolucion del prompting: las trazas de prompt, goal, hooks y permisos por mes permiten estudiar cuando se introdujeron determinadas practicas. El material cita un caso concreto: el primer uso de /goal inequivocamente documentado en el corpus es el prompt ID 11931 de PromptGarage, confirmado por el 11932, con hora de comprobacion en base de datos 19.05.2026 23:08:59.
- Formacion interna sobre disciplina de evidencia: las cuatro clases A-D y la regla de que la clase D no sostiene por si sola un paso de aprendizaje se pueden reutilizar como criterio en equipos que documentan ensayos con LLM.
- Demostracion de front-end sin dependencias: el proyecto ilustra un patron de sitio estatico local-first, sin red, sin analitica y sin fuentes remotas, util como referencia para artefactos que deben funcionar offline desde file://.
- Plantilla de reporte de retroalimentacion de producto: las tarjetas mensuales con ganancia, coste, intervencion y evidencia abierta son reutilizables para retrospectivas de equipos que miden adopcion de herramientas de IA.
- Archivo personal reproducible: al congelar el ledger y el manifiesto de build, el repositorio permite reproducir exactamente el mismo estado de datos pasados, lo que resulta util para estudios longitudinales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen MMLU, HumanEval, GSM8K ni ninguna otra metrica de modelo, porque el repositorio no contiene un modelo. Los unicos valores numericos presentes son de actividad y contexto, y la propia documentacion advierte que no son puntuaciones de competencia: 3.011 sesiones de agentes visibles, 13.115 lineas de prompt, 10 arcos de evolucion, 3 transferencias entre harness, 11 reglas HAI, 7 tarjetas mensuales y 5 zooms de puntos de inflexion.

## Requisitos de hardware

- VRAM: no aplica. No hay inferencia ni pesos que cargar.
- GPU: no aplica. No se requiere GPU de ningun tipo (A100, H100, RTX 4090 u otras).
- Ejecucion en hardware de consumo: si, en cualquier equipo con un navegador moderno capaz de renderizar HTML y ejecutar JavaScript; el coste es el de una pagina estatica y un fichero de datos.
- Opciones de despliegue: apertura directa de index.html desde el gestor de ficheros o mediante el comando xdg-open index.html en la carpeta del proyecto. No hay build, servidor ni dependencias. Cualquier servidor estatico servira el contenido, pero no es necesario.
- Latencia y throughput: no disponibles como metricas publicadas. Al no existir consultas en tiempo de ejecucion ni dependencia de activos remotos, la carga se limita a la lectura local del HTML y del JavaScript de datos.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo de IA: no tiene parametros, contexto, licencia de pesos ni rendimiento medible en tareas de lenguaje. Tampoco se dispone de datos publicados de otros artefactos de cronologia basados en evidencia que permitan una comparacion cuantitativa honesta. Cualquier tabla comparativa con modelos de lenguaje seria, en este caso, una comparacion de categorias distintas.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no ejecuta codigo y no puede desplegarse como servicio de inferencia.
- La licencia no esta declarada en los metadatos del repositorio, lo que impide determinar las condiciones de uso comercial, redistribucion o modificacion.
- El contenido y la interfaz estan redactados en aleman; no hay declaracion de idiomas soportados ni traducciones.
- El alcance temporal de los datos llega hasta el 11.07.2026 y el mes de julio queda marcado como incompleto por ser un mes en curso. El snapshot de PromptGarage se evaluo de forma inmutable hasta created_at=2026-07-11 06:33:57.
- Enero y febrero permanecen explicitamente como NO_EVIDENCE, es decir, sin evidencia aceptada.
- Para prompts importados, created_at suele ser la fecha de comprobacion en base de datos y no el momento original de entrada; la documentacion distingue entre ORIGINALZEIT, DB-NACHWEISZEIT, artefacto fechado y retrospectiva.
- La ausencia de un hallazgo temprano no implica ausencia de conocimiento, y el artefacto declara que no puede fijar el primer momento exacto de aprendizaje de un concepto. El primer uso de /goal citado corresponde al corpus revisado, no a la totalidad del equipo del autor.
- La documentacion reconoce que las consultas semanticas al grafo de conocimiento no produjeron ninguna afirmacion aceptada en esa ejecucion, y que el snapshot actual de PromptGarage y un grafo de prompt anterior no son el mismo snapshot.
- Las cifras de actividad (sesiones, lineas de prompt) son contexto, no puntuaciones de competencia, y no deben interpretarse como medida de habilidad.
- Las conclusiones mensuales son una lente aplicada hoy, declarada como contrafactual, y no una calificacion retroactiva.
- La comparacion entre harnesses se apoya en rutas combinables con logica ODER, lo que puede dar una impresion de cobertura mayor que la evidencia individual de cada ruta.
- El repositorio no publica resultados de benchmarks ni evaluaciones externas, por lo que no existe validacion independiente del metodo.
- El proyecto se declara local-first y de solo lectura: la interfaz no ofrece mutacion, sincronizacion, aprobacion ni publicacion.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/My-Agentic-Timeline
- Ruta de documentacion de investigacion citada en la model card: analysis/prompt-evolution/ (dentro del repositorio)
- No se han encontrado en la busqueda web enlaces relevantes al proyecto, al autor ni a publicaciones asociadas. Los resultados devueltos corresponden a servicios de iCloud y no guardan relacion con este repositorio.
