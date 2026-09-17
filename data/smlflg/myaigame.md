# smlflg/MyAIGame

## Resumen

MyAIGame, publicado por el usuario smlflg (Samuel, @smlfg en GitHub), no es un modelo de lenguaje entrenado ni un repositorio de pesos, sino un toolkit de flujo de trabajo para desarrollo asistido por IA construido sobre Claude Code. Recopila 29 «skills» (comandos de barra como /chef, /research o /test), archivos complementarios de configuración y hooks en shell que automatizan la orquestación de varios modelos: Claude Opus para planificación, Sonnet vía OpenCode para escritura de código, Gemini Flash para investigación web y Haiku para tareas en segundo plano.

El problema que aborda es el coste y la coordinación en flujos multiagente: la idea central es que un modelo caro (entorno a 15 USD por millón de tokens en Opus) planifique y delegue, mientras que el trabajo pesado se ejecuta en modelos de entre 0,10 y 3 USD por millón de tokens. Incluye además una categoría de skills orientados a usuarios con TDAH (/quickwin, /focus, /checkpoint, /recap) y una capa de documentación de «lecciones aprendidas» para evitar repetir errores en sesiones sucesivas.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 «likes», no declara licencia ni idiomas soportados, y no publica pesos, benchmarks ni especificaciones de arquitectura. Debe evaluarse, por tanto, como documentación y automatización de flujos, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible: el repositorio no contiene una red neuronal, sino comandos de barra, archivos Markdown y scripts shell para Claude Code |
| Parametros totales | no disponible (no hay pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; la ventana efectiva depende de los modelos externos invocados (Opus, Sonnet, Gemini Flash, Haiku) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible oficialmente; la documentacion del repositorio esta redactada en aleman |
| Licencia | no disponible |
| Formato de pesos | no disponible; los artefactos son Markdown (CLAUDE.md, Skilluebersicht.md) y scripts shell (.sh) |
| Tipo de artefacto | toolkit de orquestacion de agentes y prompts |
| Autor | smlflg (Samuel, @smlfg en GitHub) |
| Construido con | Claude Code |
| Numero de skills | 29 skills en 6 categorias (coding y delegacion, research, testing, flujo TDAH, multiagente, utilidades) |
| Fecha de publicacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-16 (segun metadatos de HuggingFace) |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste de pesos: el repositorio es una capa de orquestacion sobre modelos propietarios consumidos por API. La arquitectura funcional descrita en la model card es jerarquica: Claude Code (Opus) actua como planificador y orquestador; OpenCode sobre Sonnet ejecuta la escritura de codigo, refactorizacion y tests; Gemini Flash realiza investigacion web y verificacion de hechos; y Haiku ejecuta tareas de fondo. Cada capa tiene un coste declarado por millon de tokens, y el objetivo explicito es enrutar cada tarea al modelo mas barato capaz de resolverla.

La coordinacion se implementa mediante 29 comandos de barra agrupados en seis categorias (delegacion, research, testing, flujo TDAH, multiagente y utilidades) y tres hooks en shell que recopilan contexto sin gasto de tokens: `gather-context.sh` (git status, estructura, archivos relevantes, invocado automaticamente por /chef), `gather-context-enhanced.sh` (deteccion automatica de archivos por palabras clave de la tarea) y `session-extract.sh` (extraccion de los ultimos N mensajes de una sesion de Claude Code en JSONL para /recap). El estado persistente se reparte entre CLAUDE.md (~86 lineas) y cinco archivos complementarios: WieArbeitestDuMitSamuel.md, WelcheFehlerVermeiden.md, Skilluebersicht.md y ADHD_TEMPLATE.md. No se documentan innovaciones de inferencia (atencion lineal, decodificacion especulativa, etc.) porque no hay inferencia propia.

## Capacidades

- Orquestacion multiagente con reparto de tareas entre cuatro modelos de distinto coste y capacidad.
- Delegacion de escritura de codigo con tres variantes: sincrona (/chef), sin recogida de contexto (/chef-lite) y no bloqueante (/chef-async).
- Agrupacion de varias tareas en una sola llamada para ahorrar tokens (/batch) y seleccion automatica de la mejor estrategia de delegacion (/auto).
- Investigacion web profunda con Gemini Flash (/research), en segundo plano con Haiku (/research-subagent) y en paralelo con tres agentes (/research-swarm).
- Testing con pipeline en cascada y bucle de autocorreccion (/test), alternativa economica con Gemini y OpenCode (/test-crew) y depuracion iterativa de hasta cinco ciclos (/debug-loop).
- Analisis de documentos en paralelo con tres analizadores Haiku (/swarm) y orquestacion tipo CrewAI con workers Gemini y MiniMax (/crew).
- Revision de codigo de los cambios actuales (/review) y exploracion paralela de una base de codigo antes de implementar (/explore-first).
- Gestion de sesiones y contexto: /recap genera SESSION_LOG.md como puente de contexto y /checkpoint produce un snapshot de git con resumen de progreso.
- Flujos especificos para TDAH: /quickwin (tres tareas pequenas inmediatas), /bigwin, /focus (un unico objetivo por sesion) y /learn (explicar codigo generado por «vibe coding»).
- Utilidades de mantenimiento: /check-state, /snapshot, /validate-config (validacion de configuracion con copia de seguridad), /setup-git y /selfimprove (mejora de CLAUDE.md y archivos asociados).
- Soporte de tool calling y function calling: indirecto, heredado de las capacidades de Claude Code, OpenCode y los modelos subyacentes; no se especifica en el repositorio.
- Capacidades multilingues: no disponibles; la documentacion esta en aleman y no se declara soporte de idiomas.

## Casos de uso

- Escritura de codigo delegada en produccion: mediante /chef, el agente recoge el contexto del repositorio con gather-context.sh (git status, estructura, archivos relevantes) y lanza la tarea a OpenCode sobre Sonnet, de modo que el modelo caro solo interviene en la planificacion. Es adecuado cuando se quiere reducir el coste por tarea manteniendo la calidad del codigo generado.
- Investigacion tecnica de bajo coste: /research delega la busqueda web y la verificacion de hechos en Gemini Flash a aproximadamente 0,10 USD por millon de tokens, dos ordenes de magnitud por debajo de Opus. Encaja en flujos de documentacion, comparativas de librerias o validacion de APIs antes de implementar.
- Integracion en pipelines de CI/CD: /test y /test-crew permiten encadenar ejecucion de tests y correccion automatica, y /debug-loop itera hasta cinco veces sobre el ciclo diagnostico-correccion-test. Se puede invocar tras cada push para reparar fallos triviales sin intervencion humana.
- Revision de codigo automatizada: /review analiza los cambios actuales y devuelve comentarios antes de abrir una pull request, usando el modelo de ejecucion en lugar del de estrategia para contener el coste.
- Analisis de documentacion extensa en paralelo: /swarm reparte el documento entre tres analizadores Haiku (aproximadamente 0,75 USD por ejecucion), lo que resulta util para resumir especificaciones largas o auditar contratos y normativas.
- Continuidad en sesiones largas de desarrollo: /recap extrae los ultimos mensajes de la sesion con session-extract.sh y los condensa en SESSION_LOG.md, de forma que al dia siguiente el agente recupera el hilo sin repetir contexto completo.
- Incorporacion a bases de codigo heredadas: /explore-first lanza una exploracion paralela antes de implementar y /learn explica que se construyo, lo que reduce la barrera de entrada en proyectos desconocidos.
- Gestion de proyectos para perfiles con deficit de atencion: /quickwin propone tres tareas pequenas inmediatas, /focus fija un unico objetivo por sesion y /checkpoint genera evidencia visible de progreso mediante un snapshot de git.
- Endurecimiento de configuraciones: /validate-config comprueba archivos de configuracion y crea copias de seguridad antes de aplicar cambios, util en entornos donde un error de configuracion bloquea el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y tampoco hay datos de latencia o throughput.

El unico dato cuantitativo disponible es la tabla de costes declarada por el autor para cada capa del flujo:

| Capa | Modelo | Coste por 1M de tokens (USD) | Tarea asignada |
|---|---|---|---|
| Estrategia | Opus | ~15 | Planificacion, decisiones, orquestacion |
| Ejecucion | Sonnet (OpenCode) | ~3 | Escritura de codigo, refactorizacion, tests |
| Research | Flash (Gemini) | ~0,10 | Busqueda web, verificacion de hechos |
| Subagentes | Haiku | ~0,25 | Tareas de fondo, analisis |

Coste estimado por skill segun la model card: /chef, /chef-lite, /chef-async, /batch, /test, /debug-loop y /review en torno a 3 USD; /chef-subagent en torno a 3,25 USD; /swarm en torno a 0,75 USD; /crew en torno a 0,60 USD; /explore-first en torno a 0,50 USD; /research-swarm en torno a 0,30 USD; /test-crew y /research-subagent en torno a 0,25-0,27 USD; /research en torno a 0,10 USD; y los skills de la categoria TDAH, ademas de /check-state, /snapshot, /validate-config, /setup-git y /selfimprove, con coste 0.

## Requisitos de hardware

- No requiere GPU local: el toolkit no ejecuta inferencia propia, sino que consume modelos propietarios mediante API (Opus, Sonnet, Gemini Flash, Haiku).
- No cabe ni deja de caber en GPU de consumo: al no existir pesos, no aplica ningun requisito de VRAM. No hay estimaciones de memoria para cuantizaciones de 4, 8 o 16 bits.
- Entorno necesario: Claude Code instalado, shell compatible (bash/zsh), git, acceso a OpenCode y a Gemini, y Python para el skill /crew (CrewAI). Se requieren claves de API de los proveedores correspondientes.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir. El despliegue consiste en copiar los archivos Markdown y los scripts a un proyecto y disponer de las credenciales de API.
- Latencia y throughput: no disponible.
- Coste operativo: el unico parametro de rendimiento declarado es economico, con un rango de 0 a 3,25 USD por ejecucion de skill segun la tabla anterior.
- Almacenamiento: irrelevante en terminos de modelo; el repositorio es texto y scripts ligeros.

## Comparativa con modelos similares

No se proporciona informacion sobre toolkits o modelos comparables, por lo que la comparativa externa no esta disponible. Tampoco hay datos de rendimiento que permitan situar este flujo frente a alternativas.

La unica comparacion posible con la informacion disponible es interna, entre las cuatro capas del propio sistema:

| Capa | Modelo | Coste por 1M de tokens (USD) | Papel en el flujo |
|---|---|---|---|
| Estrategia | Opus | ~15 | Planificacion y orquestacion; el mas caro y el mas capaz |
| Ejecucion | Sonnet | ~3 | Trabajo principal de codigo |
| Subagentes | Haiku | ~0,25 | Analisis y tareas de fondo |
| Research | Gemini Flash | ~0,10 | Busqueda y verificacion; el mas economico |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, arquitectura, tokenizador ni pipeline de inferencia, por lo que no puede desplegarse con vLLM, llama.cpp, Ollama o TGI ni evaluarse con benchmarks convencionales.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial, la modificacion o la redistribucion estan permitidos. Debe tratarse como no autorizado hasta que el autor lo aclare.
- Dependencia de terceros: el funcionamiento depende de Claude Code, Opus, Sonnet, Haiku, Gemini y OpenCode, todos propietarios y sujetos a cambios de precio, cuotas, disponibilidad o condiciones de uso. La tabla de costes es una estimacion del autor y puede quedar obsoleta rapidamente.
- Idiomas: la documentacion esta redactada en aleman y no se declaran idiomas soportados; los prompts y comandos pueden requerir adaptacion para equipos hispanohablantes.
- Ausencia de benchmarks: no hay ninguna metrica de calidad, latencia o tasa de exito de las tareas delegadas, lo que impide cuantificar el ahorro real frente a usar un unico modelo.
- Riesgo de alucinacion: heredado de los modelos subyacentes, especialmente en la capa de research (/research, /research-swarm), donde las respuestas de Gemini Flash a 0,10 USD por millon de tokens no incorporan verificacion automatica adicional.
- Documentacion incompleta: la model card de HuggingFace esta truncada (termina en una seccion sin desarrollar, «4. ai-Command inst»), por lo que la descripcion funcional no esta cerrada.
- Adopcion nula y fechas anomalas: 0 descargas y 0 «likes», y las fechas de creacion y actualizacion (2026-09-16) son posteriores a la fecha habitual de consulta, lo que sugiere metadatos inconsistentes o generados automaticamente.
- Coste en cascada: los skills mas usados (/chef, /test, /review, /debug-loop) se situan en torno a 3 USD por ejecucion, por lo que un uso intensivo puede acumular gasto rapido pese a la estrategia de delegacion.
- Acoplamiento a un unico entorno: los comandos dependen de la interfaz de Claude Code; migrarlos a otro agente exigiria reescribir la capa de skills y los hooks.
- La busqueda web realizada no devolvio ningun resultado relacionado con este repositorio; los enlaces obtenidos tratan exclusivamente sobre YouTube y no aportan informacion tecnica util para evaluar el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/MyAIGame
- GitHub del autor: https://github.com/smlfg
- Busqueda web: no se encontraron enlaces relevantes sobre este repositorio. Los resultados devueltos (foros de YouTube, conversion de audio y soporte de suscripciones) no guardan relacion con el modelo ni aportan documentacion tecnica.
