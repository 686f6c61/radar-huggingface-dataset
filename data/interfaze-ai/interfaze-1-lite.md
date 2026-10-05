# interfaze-ai/interfaze-1-lite

## Resumen

Interfaze 1 Lite es un modelo multimodal desarrollado por Interfaze AI (interfaze-ai) que se presenta como el primer modelo de pesos abiertos orientado a "trabajo determinista": lectura de documentos, transcripcion de voz, localizacion de objetos y elementos de interfaz, y respuesta estructurada sobre todo ello. A diferencia de un transformer monolítico, se construye como un modelo de mezcla de arquitecturas (MoA, no MoE): un nucleo de razonamiento vision-lenguaje coordina un conjunto de arquitecturas especialistas, cada una escogida para una tarea perceptiva concreta.

El nucleo es un decodificador de atencion hibrida con codificador de vision, cuantizado en FP8 y con una ventana de contexto de 131.072 tokens. Entre los especialistas figuran un lector de documentos, un detector de geometria de linea, un detector de layout, un reconocedor de voz encoder-decoder con diarizacion de hablantes, un modelo de segmentacion promptable, un modelo fundacional de series temporales y un clasificador de seguridad. Todo el conjunto, segun el autor, se ejecuta en una unica GPU de 80 GB sin servicios externos.

Es relevante ahora porque empaqueta en un solo repositorio y bajo licencia Apache 2.0 un elenco de capacidades que normalmente exigen encadenar varios modelos especializados (OCR, ASR, deteccion, segmentacion, forecasting, guardrails), con soporte declarado para 15 idiomas y salida estructurada mediante JSON schema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-architectures (MoA): nucleo decodificador de atencion hibrida con codificador de vision (FP8) mas especialistas por tarea |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE; es MoA con componentes especialistas) |
| Longitud de contexto | 131.072 tokens (131k) |
| Tipos de cuantizacion | FP8 declarado para el nucleo de razonamiento; resto no disponible |
| Idiomas soportados | en, zh, es, fr, de, it, pt, ja, ko, ar, hi, bn, id, sw, yo (15 idiomas); traduccion a mas de 160 idiomas; ASR en 99 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos de interes: pipeline declarado `image-text-to-image`, libreria `transformers`, tamano del repositorio 44,3 GB, requiere `custom_code`. Fecha de creacion 2026-10-03, ultima actualizacion 2026-10-05.

## Arquitectura y entrenamiento

Interfaze 1 Lite no es una sola red. Se compone de un nucleo de razonamiento y varios especialistas conectados por llamadas de herramienta. El nucleo lee la peticion, decide que especialistas ejecutar y compone la respuesta final. Los componentes declarados son: nucleo de razonamiento (decodificador de atencion hibrida con codificador de vision, FP8, contexto de 131k), lector de documentos (VLM entrenado para lectura de pagina), geometria de linea (detector y reconocedor de texto), layout (detector de estructura de documento con cajas para titulos, parrafos, tablas y figuras), voz (reconocedor encoder-decoder con marcas de tiempo en 99 idiomas), diarizacion (segmentacion de hablantes y pipeline de embeddings), segmentacion (modelo promptable para contornos y mascaras), forecasting (modelo fundacional de series temporales) y guardrails (clasificador de seguridad de 14 categorias textuales).

El autor describe tres mecanismos de combinacion. Primero, el OCR se obtiene de dos vistas de la misma pagina: el lector de documentos aporta el texto y el detector de lineas aporta la geometria, asignando a cada linea detectada las palabras del lector, de modo que las cajas son exactas y el texto completo. Segundo, la atribucion de hablantes se hace palabra por palabra, por maxima superacion con los turnos de cada hablante, y despues se agrupa en fragmentos. Tercero, la deteccion de objetos y el grounding de GUI se ejecutan en el nucleo de razonamiento, que devuelve cajas sobre una rejilla 0-1000, mientras que los contornos proceden del modelo de segmentacion. Ademas, existe un modo "run task" que omite la fase de planificacion: nombrar una capacidad (`task="ocr"`, `"speech_to_text"`, etc.) ejecuta ese especialista directamente y devuelve su resultado crudo.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la innovacion de attention linear o decodificacion especulativa mas alla del uso de atencion hibrida en el nucleo.

## Capacidades

- Generacion de texto y razonamiento multimodal: nucleo vision-lenguaje con contexto de 131k tokens.
- Comprension de documentos: extraccion de texto, orden de lectura, tablas y layout desde imagenes, PDF de hasta 50 paginas por llamada y ficheros Word, con caja y confianza por cada linea y palabra.
- OCR: lectura de texto en imagenes (OCRBench v2) y benchmark olmOCR.
- Reconocimiento de voz: transcripcion con marcas de tiempo y diarizacion de hablantes; grabaciones largas se cortan en pausas y se decodifican en lotes (una grabacion de 95 minutos transcribe en unos 90 segundos, segun el autor).
- Grounding visual: deteccion de objetos de vocabulario abierto con contornos y grounding de elementos de GUI para agentes de uso de ordenador.
- Salida estructurada: respuestas restringidas a un JSON schema proporcionado por el usuario, leyendo cualquier combinacion de texto, imagenes, documentos y audio.
- Traduccion: mas de 160 idiomas.
- Prediccion de series temporales: forecasting desde CSV o JSON.
- Guardrails: comprobaciones de seguridad sobre texto e imagen, con 14 categorias de seguridad textual.
- Razonamiento multilingue: ciencia, matematicas, SQL y conocimiento general en 14+ idiomas.
- Capacidades de agente: planificacion y llamada a especialistas; modo "run task" para ejecucion directa de una capacidad.
- Text-to-SQL: evaluado en Spider 2.0-Lite (SQLite).
- Autocontenido: un unico repositorio, una GPU, funciona offline.

## Casos de uso

- Automatizacion de back-office documental: digitalizacion de facturas, contratos o formularios en PDF (hasta 50 paginas por llamada) y Word, obteniendo texto, orden de lectura, tablas y cajas por linea para reconstruir la estructura y volcar los campos a un JSON schema validado.
- Atencion al cliente con analisis de documentos adjuntos: conversaciones multi-turno en las que el usuario envia capturas o PDFs y el modelo responde con contexto de 131k tokens, combinando lectura de documentos y salida estructurada para registrar incidencias.
- Transcripcion y analisis de reuniones: ASR con marcas de tiempo y diarizacion (quien hablo y cuando) para generar actas, atribuir intervenciones por hablante y procesar grabaciones largas en lotes en tiempos del orden de 90 segundos para 95 minutos, segun el autor.
- Agentes de uso de ordenador (computer use): grounding de elementos de GUI para que un agente identifique botones, campos y menus en pantalla y ejecute acciones de automatizacion RPA.
- Vision por computador de proposito general: deteccion de objetos de vocabulario abierto con contornos (segmentacion promptable) y grounding por referring expression, util para inspeccion, inventario o moderacion visual.
- Traduccion a escala: localizacion de contenido a mas de 160 idiomas dentro de un mismo pipeline, con razonamiento multilingue en 14+ idiomas para revisar coherencia.
- Prediccion de series temporales: carga de CSV/JSON y generacion de valores futuros para prevision de demanda, metricas o sensores en entornos donde no se quiere depender de un servicio externo.
- Moderacion y guardrails: clasificacion de seguridad sobre texto e imagen (14 categorias) integrada en la misma llamada que el resto del flujo.
- Text-to-SQL: generacion de consultas SQLite a partir de lenguaje natural para asistentes de analitica o herramientas internas.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. Interfaze 1 Lite fue puntuado, segun el autor, con el scorer oficial de cada benchmark; el resto de puntuaciones provienen de la tabla de clasificacion de Interfaze. Mayor es mejor salvo en WER (menor es mejor).

| Benchmark | Que mide | Interfaze 1 Lite | Interfaze | GPT-5.4-Mini | Claude-Sonnet-4.6 | Gemini-3-Flash | Grok-4.3 |
|---|---|---|---|---|---|---|---|
| GPQA Diamond | Ciencia nivel posgrado | 85,9 | 92,4 | 82,8 | 89,9 | 88,5 | 73,6 |
| MMMLU | Conocimiento en 14 idiomas | 87,8 | 90,9 | 75,3 | 84,9 | 88,7 | 89,7 |
| MMMU-Pro | Razonamiento multimodal | 73,2 | 71,1 | 40,4 | 46,3 | 67,6 | 68,7 |
| olmOCR-Bench | OCR de documentos | 83,8 | 85,7 | 80,1 | 73,9 | 75,3 | 81,9 |
| OCRBench v2 (ingles) | Texto en imagenes | 60,9 | 70,7 | 52,7 | 54,7 | 55,8 | 54,7 |
| RefCOCO (Acc@0.5) | Grounding por referring expression | 83,8 | 82,1 | – | – | – | – |
| VoxPopuli-Cleaned (WER menor mejor) | Reconocimiento de voz | 3,01 | 2,4 | – | – | 4,0 | – |
| SOB (value accuracy) | Salida estructurada desde texto, imagenes y audio | 81,5 | 80,5 | – | 77,9 | 77,3* | – |
| Spider 2.0-Lite (SQLite) | Text-to-SQL | 48,9 | 52,9 | 26,7 | 49,6 | 45,2 | 45,9 |

Notas del autor: GPQA Diamond con las 198 preguntas; MMMLU-lite con las 19.950 (1.425 por idioma en 14 idiomas); MMMU-Pro con las 1.730 preguntas por track, media de los tracks estandar y vision. El asterisco en Gemini-3-Flash corresponde a Gemini-3-Flash-Preview. No se han publicado en la informacion disponible otros detalles de metodos de evaluacion ni resultados adicionales.

## Requisitos de hardware

- VRAM: el autor indica que el modelo completo se ejecuta en una sola GPU de 80 GB, sin servicios externos. La cuantizacion declarada del nucleo es FP8. No se especifica desglose de VRAM por componente ni requisitos para cuantizaciones menores (GGUF, 4-bit, etc.).
- GPU recomendadas: por la VRAM requerida (80 GB), encajan acceleradores como A100 80 GB, H100 80 GB o equivalentes. No se detallan modelos concretos en la informacion disponible.
- Consumer GPU: no disponible. Con 80 GB declarados, no cabe en GPU de consumo habitual (RTX 4090/3090 de 24 GB) segun los datos aportados.
- Opciones de despliegue: requiere `transformers` con `custom_code` y safetensors. La model card menciona despliegue autocontenido en una GPU; tambien se ofrece via API en el sitio del autor. No se confirma soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: el unico dato concreto aportado es que una grabacion de 95 minutos se transcribe en unos 90 segundos. No hay cifras de throughput de tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

La model card compara Interfaze 1 Lite con modelos propietarios de referencia en los benchmarks reportados. A falta de datos de parametros, contexto y licencia de esos modelos en la informacion disponible, la comparativa se limita a lo publicado.

| Modelo | Tipo y licencia | Puntuaciones destacadas |
|---|---|---|
| Interfaze 1 Lite | Pesos abiertos, Apache 2.0, contexto 131k | GPQA Diamond 85,9; MMMLU 87,8; MMMU-Pro 73,2; olmOCR 83,8; OCRBench v2 60,9; VoxPopuli WER 3,01; SOB 81,5; Spider 2.0-Lite 48,9 |
| Interfaze (modelo mayor del mismo autor) | no disponible (referencia de la tabla) | GPQA Diamond 92,4; MMMLU 90,9; MMMU-Pro 71,1; olmOCR 85,7; OCRBench v2 70,7; VoxPopuli WER 2,4; SOB 80,5; Spider 2.0-Lite 52,9 |
| GPT-5.4-Mini | propietario; parametros, contexto y licencia no disponibles | GPQA Diamond 82,8; MMMLU 75,3; MMMU-Pro 40,4; olmOCR 80,1; OCRBench v2 52,7; Spider 2.0-Lite 26,7 |
| Claude-Sonnet-4.6 | propietario; parametros, contexto y licencia no disponibles | GPQA Diamond 89,9; MMMLU 84,9; MMMU-Pro 46,3; olmOCR 73,9; OCRBench v2 54,7; SOB 77,9; Spider 2.0-Lite 49,6 |
| Gemini-3-Flash | propietario; parametros, contexto y licencia no disponibles | GPQA Diamond 88,5; MMMLU 88,7; MMMU-Pro 67,6; olmOCR 75,3; OCRBench v2 55,8; VoxPopuli WER 4,0; SOB 77,3*; Spider 2.0-Lite 45,2 |
| Grok-4.3 | propietario; parametros, contexto y licencia no disponibles | GPQA Diamond 73,6; MMMLU 89,7; MMMU-Pro 68,7; olmOCR 81,9; OCRBench v2 54,7; Spider 2.0-Lite 45,9 |

No se dispone en la informacion proporcionada de una comparativa con otros modelos de pesos abiertos de la misma categoria (por ejemplo, alternativas tipo Qwen-VL, InternVL o Llama con vision), por lo que no se incluye.

## Limitaciones y advertencias

- Sesgos: no se documentan en la informacion disponible. El propio autor senala que en MMMLU los idiomas de bajos recursos (swahili, yoruba, bengali) son donde el modelo pierde mas rendimiento.
- Alucinacion: no se aporta una evaluacion especifica de tasas de alucinacion. Como modelo generativo multimodal, mantiene riesgo de inventar contenido, especialmente en OCR de documentos degradados o en grounding ambiguo.
- Limitaciones de contexto: ventana de 131k tokens; los PDF se limitan a 50 paginas por llamada segun la model card, lo que impone truncado en documentos mayores.
- Idioma: aunque declara 15 idiomas y traduccion a mas de 160, el rendimiento multilingue no es uniforme y cae en lenguas de bajos recursos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, sujeto a los terminos habituales de la licencia (atribucion y aviso de cambios). No se declaran restricciones adicionales de uso en la informacion disponible.
- Caveats de produccion: el repositorio pesa 44,3 GB y requiere `custom_code` en `transformers`, lo que complica su integracion en frameworks de inferencia estandar (vLLM, TGI, llama.cpp) que no esten verificados. Los requisitos de 80 GB de VRAM limitan el despliegue en hardware de consumo. No se documentan tasas de error por especialista, latencias por peticion ni comportamiento bajo carga concurrente.
- Compatibilidad de pipeline: el pipeline declarado es `image-text-to-image`, lo que puede generar confusion al integrarlo, ya que el grueso de las capacidades es vision-lenguaje y comprension, no generacion de imagen desde texto.
- Los modelos de comparacion (GPT-5.4-Mini, Claude-Sonnet-4.6, Gemini-3-Flash, Grok-4.3) son propietarios y sus datos de arquitectura, contexto y licencia no estan disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/interfaze-ai/interfaze-1-lite
- Sitio web: https://interfaze.ai
- Documentacion del modelo: https://interfaze.ai/docs/models/interfaze-1-lite
- Run tasks (documentacion de tareas): https://interfaze.ai/docs/run-tasks
- Blog de presentacion: https://interfaze.ai/blog/the-first-open-weight-model-for-deterministic-work-interfaze-1-lite
- Repositorio GitHub: https://github.com/InterfazeAI/interfaze-1-lite
- Tabla de clasificacion (leaderboard): https://interfaze.ai/leaderboards
