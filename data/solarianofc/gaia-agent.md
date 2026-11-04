# solarianofc/gaia-agent

## Resumen

`solarianofc/gaia-agent` no es un modelo de lenguaje en sentido estricto, sino un agente construido con `smolagents` (el framework de agentes de Hugging Face) para resolver el subconjunto de nivel 1 del benchmark GAIA. El repositorio contiene el codigo de un `CodeAgent` que orquesta un modelo remoto, `deepseek/deepseek-v4-flash-0731`, servido a traves de OpenRouter, junto con un conjunto de herramientas especializadas (busqueda web, Wikipedia, lectura de ficheros, transcripciones de YouTube) que el agente invoca para responder preguntas.

El proyecto nace como entrega final de la Unidad 4 del curso de agentes de Hugging Face y su interes es fundamentalmente didactico y de referencia: demuestra como montar un agente con tool calling, cache de respuestas y scoring local sobre GAIA. El autor reporta una puntuacion local de 17/20 (85%) contra las respuestas de validacion del benchmark.

Es relevante para desarrolladores que quieran ver un ejemplo completo y funcional de agente con `smolagents`, especialmente por su diseno de herramientas y su estrategia de cacheo de consultas y respuestas. No debe confundirse con un modelo entrenado: no hay pesos publicados, no hay arquitectura propia ni datos de entrenamiento en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente `smolagents` CodeAgent sobre un LLM remoto (no es un modelo propio) |
| Parametros totales | no disponible (depende del modelo subyacente, no publicado en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica (repositorio de codigo; no se distribuyen pesos) |

## Arquitectura y entrenamiento

El componente central es un `CodeAgent` de la libreria `smolagents`, que genera y ejecuta codigo Python como mecanismo de accion en lugar de limitarse a llamadas de funcion estructuradas. El agente se construye mediante `build_gaia_agent` en `alfred/gaia/runner.py`, que ensambla el modelo (via factorias en `common/models.py`, con soporte para OpenRouter y Ollama) y el conjunto de herramientas definidas en `alfred/gaia/tools.py`.

Las herramientas cubren las necesidades tipicas de GAIA: `web_search` (Tavily con cache y fallback a DuckDuckGo), `wiki_search` y `wiki_page` (busqueda de texto completo y recuperacion de paginas o revisiones historicas de Wikipedia), `visit_webpage` (conversion de paginas a Markdown compacto), `read_file` (CSV, XLSX, texto, audio con faster-whisper e imagenes mediante un modelo de vision) y `youtube_transcript`. No hay entrenamiento, ajuste fino ni RLHF en este repositorio: el comportamiento depende enteramente del LLM subyacente y del diseno de las herramientas y del prompt.

## Capacidades

- Razonamiento multi-paso y descomposicion de preguntas complejas mediante generacion de codigo ejecutable.
- Tool calling a traves de las seis herramientas integradas (busqueda web, Wikipedia, lectura de paginas, ficheros, audio, video).
- Busqueda web con cache de consultas y fallback entre proveedores (Tavily a DuckDuckGo).
- Busqueda y navegacion de Wikipedia, incluyendo recuperacion de revisiones historicas (`as_of`).
- Lectura y extraccion de datos de adjuntos en multiples formatos: CSV, XLSX, texto, codigo.
- Transcripcion de audio con faster-whisper y descripcion de imagenes mediante un modelo de vision.
- Obtencion de subtitulos de YouTube mediante `youtube-transcript-api`.
- Cache de respuestas para evitar repetir computo en el scoring local.
- Capacidades multilingues: no documentadas explicitamente; dependen del LLM subyacente.

## Casos de uso

- Evaluacion de agentes sobre GAIA: el repositorio sirve como implementacion de referencia para medir un agente contra el subconjunto de nivel 1, con scoring local ya integrado en `alfred/gaia/scoring.py`.
- Prototipado de agentes con `smolagents`: util como plantilla para construir agentes que combinan busqueda web, lectura de documentos y ejecucion de codigo en un unico flujo.
- Investigacion web asistida: el agente puede responder preguntas que requieren consultar multiples fuentes (Tavily, Wikipedia, paginas arbitrarias) y sintetizar la respuesta en una sola pasada.
- Extraccion de datos de documentos: con `read_file` puede procesar adjuntos CSV o XLSX y responder preguntas sobre su contenido, util en tareas de analisis rapido.
- Analisis de contenido audiovisual: mediante `youtube_transcript` y la transcripcion de audio con faster-whisper, permite resumir o consultar videos y grabaciones.
- Docencia y formacion en agentes: el codigo modular (runner, tools, api, scoring) facilita explicar cada componente de un agente en un curso o taller.
- Automatizacion de tareas de Q&A sobre corpus cerrados: el cache de respuestas y consultas reduce coste y latencia en ejecuciones repetidas del mismo conjunto de preguntas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GAIA validation (nivel 1, subconjunto) | 17/20 (85%) | Puntuacion local reportada por el autor |

No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio no requiere GPU para ejecutarse: el LLM se invoca de forma remota via OpenRouter. El coste computacional local es minimo.
- El modelo subyacente (`deepseek/deepseek-v4-flash-0731`) se ejecuta en la infraestructura del proveedor, por lo que no hay requisitos de VRAM para el usuario.
- Si se configura el proveedor Ollama (`common/models.py` incluye factorias para Ollama), los requisitos de VRAM dependeran del modelo local elegido; no se especifican en el repositorio.
- La transcripcion de audio con faster-whisper y la descripcion de imagenes con un modelo de vision pueden requerir GPU local si se procesan ficheros grandes; no se documentan requisitos concretos.
- Opciones de despliegue: ejecucion directa con Python (`python -m alfred.gaia.runner`). No se mencionan vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles; dependen del proveedor remoto y de la tasa de aciertos del cache.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo subyacente | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| solarianofc/gaia-agent | Agente `smolagents` | deepseek/deepseek-v4-flash-0731 via OpenRouter | GAIA nivel 1: 17/20 local | MIT | HuggingFace (codigo) |
| Agentes GAIA de referencia (p. ej. smolagents examples) | Agente `smolagents` | Configurable | no disponible en esta ficha | Variable | HuggingFace / GitHub |
| OpenHands | Agente de codigo | Multiples LLM | SWE-bench (no comparable directamente) | MIT | GitHub |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa con alternativas equivalentes; la comparacion anterior es meramente categorica.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, arquitectura propia ni datos de entrenamiento. El rendimiento depende integramente del LLM subyacente y del prompt.
- La puntuacion de 17/20 es local y sobre un subconjunto reducido (nivel 1, validacion); no es directamente comparable con resultados publicados de GAIA sobre el conjunto completo.
- Dependencia de servicios externos: OpenRouter, Tavily (o DuckDuckGo como fallback), `youtube-transcript-api` y el dataset gated `gaia-benchmark/GAIA` (requiere `HF_TOKEN`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni mantenedores adicionales.
- Riesgo de alucinacion inherente al LLM subyacente; el agente mitiga parcialmente con busqueda web y Wikipedia, pero no elimina el problema.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo remoto.
- La licencia MIT cubre el codigo del repositorio, pero el uso del modelo subyacente y de las APIs de terceros esta sujeto a sus propias condiciones.
- No hay informacion sobre sesgos, limitaciones de contexto ni evaluaciones de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/solarianofc/gaia-agent
- Curso de agentes de Hugging Face (Unidad 4): https://huggingface.co/learn/agents-course
- Framework smolagents: https://github.com/huggingface/smolagents
- Benchmark GAIA: https://huggingface.co/datasets/gaia-benchmark/GAIA
- OpenRouter: https://openrouter.ai
- Tavily: https://tavily.com
- `youtube-transcript-api`: https://pypi.org/project/youtube-transcript-api/
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
