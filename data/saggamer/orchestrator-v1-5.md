# saggamer/orchestrator-v1.5

## Resumen

Orchestrator v1.5 es un paquete de modelo publicado en HuggingFace por el usuario saggamer, desarrollado como parte de Kira Superapp. No es un modelo de lenguaje independiente al uso: se trata de un bundle de investigacion (etiquetado como research-preview) que combina el modelo base de instrucciones google/gemma-4-E4B-it, una conversion local a MLX y varios adaptadores enrutados por tarea, junto con el controlador de ejecucion acotada de Kira. El objetivo declarado es la asistencia cotidiana, el trabajo en navegador y las tareas agenticas de varios pasos en Apple Silicon.

El problema que aborda es la orquestacion de acciones reales en un navegador y en aplicaciones: el modelo propone acciones, Kira las ejecuta mediante sus manejadores de herramientas y devuelve las observaciones al modelo antes de continuar. Segun la model card, cubre lectura de paginas, navegacion, busqueda, relleno de formularios, desplazamiento, comparacion y captura de pantalla a traves de Diagonal Browser, ademas de enrutar peticiones de aplicacion, agentes de codigo, navegador y presentaciones a sus rutas de control correspondientes.

La relevancia actual del lanzamiento es acotada y experimental: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, la model card advierte que los adaptadores estan pensados para el runtime de Kira y no para generacion de texto autonoma, y no se publican especificaciones detalladas de arquitectura, parametros ni contexto. La licencia declarada es Apache 2.0, el unico idioma soportado es ingles y el repositorio ocupa 5,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; bundle con adaptadores enrutados por tarea sobre conversion MLX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio de 5,9 GB contiene pesos en safetensors y artefactos MLX; no se especifica el esquema de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX (libreria declarada: mlx) |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repositorio | 5,9 GB |
| Tipo de publicacion | research-preview, no standalone |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card indica que el bundle incorpora una conversion local a MLX del modelo de instrucciones Gemma 4 E4B como base, sobre la que se anaden adaptadores enrutados por tarea y el controlador de ejecucion acotada de Kira. El manifiesto de la release registra los hashes exactos del modelo base y de los adaptadores, asi como el enrutamiento por tarea, lo que sugiere un esquema de mezcla de adaptadores especializados (navegador, aplicacion, agente de codigo, presentaciones) en lugar de un unico conjunto de pesos.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de ajuste como RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas propias mas alla del mecanismo de orquestacion: el modelo evalua propuestas de accion independientes contra la evidencia observada dentro de un presupuesto finito de pasos, y Kira se encarga de la ejecucion de herramientas devolviendo las observaciones al modelo antes de que continue. El bundle incluye una carpeta runtime_overlay con el controlador y los ficheros de navegador correspondientes a esta preview.

## Capacidades

- Ejecucion agentica en navegador: lectura de paginas, navegacion, busqueda, relleno de formularios, desplazamiento, comparacion y captura de pantalla mediante Diagonal Browser.
- Encadenamiento de investigacion a accion: lee fuentes enlazadas, completa formularios observados, guarda una sola vez y comprueba el resultado visible.
- Evaluacion de propuestas de accion contra evidencia observada dentro de un presupuesto finito de pasos (modo Diagonal).
- Continuidad conversacional con historial de chat local y preferencias recuperadas, tratando el texto recordado como contexto y no como instruccion nueva.
- Enrutamiento de peticiones por dominio: aplicacion, agente de codigo, navegador y presentaciones hacia sus rutas de control correspondientes en Kira.
- Descubrimiento de herramientas mediante una conexion MCP aprobada de Kira y uso de herramientas de solo lectura anunciadas con argumentos validados contra esquema.
- Soporte de tool calling y function calling, sujeto al controlador de Kira.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Vision, audio, modo de razonamiento explicito o generacion de codigo autonoma: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion web con verificacion posterior: el modelo puede leer varias fuentes enlazadas, extraer una recomendacion y confirmar el resultado observable en la pagina; la model card documenta una tarea de recomendacion con tres fuentes resuelta en 53,05 segundos y ocho acciones de navegador.
- Relleno de formularios a partir de documentacion publica: el flujo documentado parte de documentacion web y termina en un formulario completado en 112,73 segundos con siete acciones, lo que encaja en tareas de alta de datos o tramitacion guiada.
- Automatizacion de tareas repetitivas de navegador: navegacion, busqueda, desplazamiento y captura de pantalla encadenadas dentro de una misma sesion, util para monitorizacion de paginas o extraccion puntual de informacion.
- Asistente local en Apple Silicon: al ejecutarse sobre MLX en hardware de Apple, permite mantener conversaciones y ejecutar acciones sin enviar datos a servicios externos, siempre dentro del runtime de Kira.
- Integracion de herramientas de solo lectura via MCP: conexion a aplicaciones estilo Notes para consultar informacion con argumentos validados contra esquema, con la suite aislada de lectura MCP superada 1/1 segun la model card.
- Enrutado de peticiones heterogeneas en una superapp: derivar solicitudes de codigo, presentaciones, aplicacion o navegador a la ruta de control adecuada, reduciendo la necesidad de seleccion manual por parte del usuario.
- Base para prototipos de agentes en investigacion: al ser una research-preview con manifiesto de hashes, sirve para reproducir y auditar el comportamiento de un pipeline modelo mas controlador en tareas de navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta evaluaciones de las suites de tareas locales de Kira, que miden el flujo completo modelo mas controlador, no el modelo aislado.

| Suite de evaluacion local de Kira | Resultado |
|---|---|
| Everyday Diagonal Browser suite | 16/16 superados |
| Long Diagonal workflows | 6/6 superados |
| Research followed by verified browser execution | 2/2 superados |
| Isolated Notes-like MCP read task over stdio | 1/1 superados |

Datos de tiempo declarados en la suite de investigacion a ejecucion: la tarea de recomendacion con tres fuentes finalizo en 53,05 segundos con ocho acciones de navegador; la tarea de documentacion web publica a formulario finalizo en 112,73 segundos con siete acciones.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon, mediante la libreria MLX y el runtime de Kira Superapp.
- Memoria unificada estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 5,9 GB e incluye pesos y artefactos de runtime, por lo que se puede estimar un minimo practico en torno a 8-10 GB de memoria unificada y 16 GB recomendados. Son estimaciones derivadas del tamano del repositorio, no cifras confirmadas por el autor.
- GPU recomendadas: no disponibles; el modelo esta pensado para GPU integradas de Apple, no para CUDA.
- Compatibilidad con GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (cifra exacta no confirmada).
- Opciones de despliegue: runtime de Kira Superapp con MLX (unica opcion documentada). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card indica que los adaptadores estan destinados al runtime de Kira y no a generacion de texto autonoma.
- Procedimiento de ejecucion documentado: mantener el bundle descargado en un disco local, revisar y aplicar la carpeta runtime_overlay sobre un checkout de Kira Superapp, instalar requirements-orchestrator-v15.txt y ejecutar export KIRA_V15_MANIFEST_PATH="/path/to/orchestrator-v1.5/manifest.json" seguido de .venv-orchestrator-v15/bin/python interface.py.
- Latencia y throughput: no disponibles como metricas de inferencia aislada; los unicos tiempos publicados son de tareas completas (53,05 s y 112,73 s) e incluyen la ejecucion de acciones de navegador.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas, ya que la informacion proporcionada no incluye especificaciones del modelo base ni de otros bundles agenticos equivalentes. La comparacion se limita a lo siguiente:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saggamer/orchestrator-v1.5 | no disponible | no disponible | suites locales de Kira: 16/16, 6/6, 2/2, 1/1 | apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de agentes en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo no autonomo: la model card advierte explicitamente que los adaptadores estan pensados para el runtime correspondiente de Kira y no para generacion de texto independiente. Sin Kira, el bundle no es utilizable como modelo de chat convencional.
- Cifras de rendimiento no extrapolables: los resultados 16/16, 6/6, 2/2 y 1/1 proceden de suites internas de Kira que miden el flujo completo modelo mas controlador; no son comparables con benchmarks publicos.
- Idiomas: soporte declarado unicamente de ingles. No hay evidencia de capacidades en castellano u otros idiomas.
- Especificaciones incompletas: se desconocen arquitectura interna, numero de parametros, longitud de contexto y esquema de cuantizacion, lo que dificulta planificar despliegues en produccion.
- Madurez: etiquetado como research-preview, con 0 descargas y 0 likes en el momento de la consulta y sin historial de mantenimiento.
- Riesgo de alucinacion y de acciones erroneas: al tratarse de un agente con capacidad de proponer acciones de navegador y de rellenar formularios, un error de interpretacion puede provocar envios o modificaciones no deseadas. El propio diseno mitiga esto con un presupuesto finito de pasos, verificacion del resultado visible y herramientas de solo lectura via MCP, pero conviene mantener supervision humana.
- Dependencia de plataforma: requiere Apple Silicon y el runtime de Kira, lo que excluye despliegues en servidores con GPU NVIDIA o AMD.
- Licencia: el bundle se declara bajo Apache 2.0, pero la model card indica que el modelo base y los componentes de terceros conservan sus propios avisos de atribucion y licencia, por lo que es necesario revisar las condiciones de google/gemma-4-E4B-it antes de un uso comercial.
- Fecha de publicacion inusal: el repositorio figura creado y actualizado el 2026-10-15, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saggamer/orchestrator-v1.5
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Runtime Kira Superapp: https://github.com/saggamer/KIRA-Superapp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al autor ni al proyecto; los resultados devueltos corresponden a sitios sin relacion con la ficha y se han descartado.
