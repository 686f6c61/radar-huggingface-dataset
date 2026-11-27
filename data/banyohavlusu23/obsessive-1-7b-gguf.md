# banyohavlusu23/Obsessive-1.7B-GGUF

## Resumen

Obsessive-1.7B es un ajuste fino (LoRA, rango 16) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario banyohavlusu23 y publicado en formato GGUF para su uso con llama.cpp y Ollama. El modelo está especializado en una tarea muy concreta: la investigación web con citación estricta de fuentes. Dada una pregunta y acceso a una herramienta de búsqueda web, el modelo busca, lee los resultados y responde con un valor corto, una cita literal y la URL de la fuente; si no encuentra la prueba en los resultados, responde "Not found in the search results." en lugar de inventar.

Con 1.728.801.600 parámetros y un archivo Q4_K_M de 1,1 GB, el modelo está diseñado para ejecutarse en GPU de portátil y responder en torno a 2 segundos por pregunta (RTX 4060 laptop, según el autor). Su caso de uso previsto es el de subagente dentro de un sistema mayor: un agente principal le delega una pregunta factual cada vez y el modelo devuelve una respuesta verificable y citada.

La relevancia actual del modelo reside en su enfoque en la reducción de alucinaciones mediante un formato de salida estructurado (Answer / Evidence / Source) y en su entrenamiento explícito para abstenerse cuando la información no está presente en los resultados de búsqueda. Es un modelo monolingüe (inglés) y con limitaciones claras de contexto conversacional, pensado para una sola pregunta por conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de LiquidAI; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en el comando de ejemplo con `-c 16384`); el máximo del modelo base no se especifica |
| Tipos de cuantizacion | GGUF; el autor publica Q4_K_M (1,1 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (uso comercial no licenciado para entidades con ingresos anuales de 10 M USD o más) |
| Formato de pesos | GGUF (llama.cpp / Ollama); compatible con endpoints OpenAI |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (rango 16) sobre LiquidAI/LFM3-1.7B. El entrenamiento se realizó sobre aproximadamente 9.000 conversaciones de tool calling, cada una compuesta por una pregunta, una llamada de búsqueda, los resultados de búsqueda y una respuesta. Cada respuesta y cada cita fue verificada para aparecer literalmente en los resultados correspondientes; alrededor de una cuarta parte de las conversaciones enseñan el comportamiento de "not found" (se elimina de la página la información que responde a la pregunta). Los formatos de los resultados, los nombres de las herramientas y los system prompts se variaron deliberadamente para que el modelo no quede atado a un arnés concreto.

Los datos de entrenamiento provienen de páginas de Wikipedia (CC BY-SA 4.0) y FineWeb (ODC-By 1.0) usadas como resultados de búsqueda, hechos de Wikidata (CC0) y preguntas generadas por Qwen3.8-Flash-Next y Ling-3.0-tiny ejecutados localmente. SimpleQA (MIT) se usó únicamente para evaluación. No se emplearon datos de APIs de búsqueda comerciales en el entrenamiento. La innovación principal no es arquitectónica sino de comportamiento: el formato de salida estructurado con cita literal y la abstención explícita ante la ausencia de evidencia.

## Capacidades

- Generación de texto conversacional en inglés con formato de respuesta estructurado: `Answer`, `Evidence` (cita literal) y `Source` (URL).
- Tool calling estilo OpenAI para una herramienta de búsqueda web (`web_search`) proporcionada por el arnés del usuario.
- Respuesta con abstención explícita ("Not found in the search results.") cuando la respuesta no está en los resultados.
- Manejo de peticiones multi-hecho en una sola consulta (por ejemplo, "encuentra estos hechos sobre Spotify: fundación, sede, CEO"), con 40/40 resueltas en la evaluación del autor.
- Copia literal de citas de los resultados de búsqueda (100% de las citas verificadas en la evaluación con búsqueda en vivo).
- Uso como subagente delegado por un agente mayor.
- No soporta visión, audio, matemáticas avanzadas ni razonamiento analítico prolongado según la model card.

## Casos de uso

- Subagente de investigación factual: un agente principal (por ejemplo, un orquestador multi-agente) delega preguntas puntuales a Obsessive-1.7B, que devuelve una respuesta corta con cita y URL verificables. Es adecuado por su bajo coste computacional y su formato de salida predecible.
- Verificación de datos con trazabilidad: en pipelines de control de calidad de contenido, el modelo puede comprobar afirmaciones factuales contra resultados de búsqueda y devolver la evidencia literal, lo que permite auditar cada respuesta.
- Asistente de atención al cliente con base factual: para consultas que requieren un dato concreto (horarios, direcciones, cifras), el modelo responde con la fuente y se abstiene si no la encuentra, reduciendo el riesgo de información inventada.
- Enriquecimiento de bases de conocimiento: extracción de hechos puntuales (año de fundación, sede, galardonados) desde resultados de búsqueda con cita de origen, integrable en scripts sin framework mediante `examples/research.py`.
- Automatización de research en CI/CD o cron jobs: al ejecutarse en una GPU de portátil con ~2 s por pregunta (Q4_K_M), puede procesar lotes de preguntas factuales de forma económica.
- Integración en asistentes de código o IDE (OpenCode, Pi, Hermes): el repositorio incluye configuraciones listas para usar como subagente `researcher` dentro de estos arneses.
- Respuesta a peticiones multi-hecho en una sola llamada: útil para fichas de empresa o entidad donde se necesitan varios datos con sus fuentes en una única interacción.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (benchmark propio `web-qa-1`, no es la puntuación oficial de SimpleQA):

| Metrica (web-qa-1, 131 preguntas) | LFM3-1.7B (base) | Obsessive-1.7B |
|---|---|---|
| Encuentra la respuesta cuando está en los resultados | 50% | 94% |
| Sus respuestas son correctas | 87% | 98% |
| Dice "not found" cuando la respuesta no está | 0% | 100% |
| Respuestas inventadas (no presentes en los resultados) | 10% | 0% |
| Usa el formato Answer / Evidence / Source | 0% | 100% |
| Mediana de segundos por pregunta (RTX 4060 laptop) | 5,1 | 2,0 |

| Metrica (búsqueda en vivo, 120 preguntas + 40 multi-hecho) | LFM3-1.7B (base) | Obsessive-1.7B |
|---|---|---|
| Devuelve alguna respuesta (no vacía) | 38% | 100% |
| Respuesta correcta en algún punto de la respuesta | 37/120 | 24/120 |
| Citas copiadas literalmente de los resultados | n/a (sin citas) | 100% |
| Peticiones multi-hecho respondidas | 1/40 | 40/40 |
| Valores de hechos no encontrados en los resultados (inventados) | 4 de 4 | 3 de 52 |
| Mediana de segundos por pregunta | 14,8 | 4,9 |

## Requisitos de hardware

- VRAM estimada: en torno a 1,1 GB para el archivo Q4_K_M; el modelo completo en precisión superior requeriría aproximadamente 3,5 GB (1,73 B parámetros a 16 bits).
- GPU recomendadas: el autor cita una RTX 4060 laptop como referencia (2,0 s por pregunta en web-qa-1, 4,9 s en búsqueda en vivo). Cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Para despliegue en servidor, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` obligatorio), Ollama, endpoints compatibles con la API de OpenAI (`http://127.0.0.1:8080/v1`). El repositorio incluye configuraciones para Pi, OpenCode y Hermes.
- Latencia y throughput: mediana de 2,0 s por pregunta en web-qa-1 y 4,9 s en búsqueda en vivo sobre RTX 4060 laptop, según el autor. No se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Obsessive-1.7B | 1,73 B | 16.384 (uso recomendado) | Investigación web con citas y abstención | LFM Open License v1.0 (restricción comercial a partir de 10 M USD de ingresos) | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | Modelo conversacional general | LFM Open License v1.0 | safetensors / GGUF |
| Modelos pequeños de research con tool calling de la misma franja (1-3 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada; la comparación con el modelo base se limita a los resultados del benchmark propio del autor recogidos en la sección anterior.

## Limitaciones y advertencias

- Una sola pregunta por conversación: las conversaciones largas con muchos seguimientos confunden al modelo; se recomienda iniciar una conversación nueva por pregunta o usarlo como subagente.
- Reporta afirmaciones como hechos: si las fuentes dicen "X afirma haber resuelto Y", el modelo puede responder "Sí"; hay que leer la línea de evidencia.
- A veces es demasiado cauteloso: responde "not found" en aproximadamente 1 de cada 10 casos en los que la respuesta sí está en los resultados.
- Puede devolver un hecho vecino (por ejemplo, el ganador de otro año): la cita es real pero responde a una pregunta ligeramente distinta.
- Busca una sola vez y rara vez refina la consulta; solo inglés; no es adecuado para análisis, opiniones o informes largos.
- En la evaluación con búsqueda en vivo encontró la respuesta correcta en 24/120 casos, frente a 37/120 del modelo base (que, no obstante, devolvía respuesta vacía en la mayoría de los casos).
- Licencia: uso comercial no licenciado para entidades con ingresos anuales de 10 M USD o más. Los pesos son una versión modificada de LiquidAI/LFM3-1.7B; LFM3 y Liquid AI son marcas de Liquid AI, Inc.
- Riesgo de alucinación reducido pero no nulo: 3 de 52 valores de hechos en la evaluación de búsqueda en vivo no aparecían en los resultados.
- Requiere `--jinja` en llama.cpp para que la plantilla de chat gestione las llamadas a herramientas; sin ello, el tool calling no funciona correctamente.
- Temperatura 0 recomendada para un comportamiento determinista y citación fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/Obsessive-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio (`LICENSE`)
- Herramienta de búsqueda para Pi: https://www.npmjs.com/package/pi-web-access
- SimpleQA (evaluación): https://github.com/openai/simple-evals
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Wikipedia (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
- Wikidata: https://www.wikidata.org
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
