# Kay52333/JEV-27B-VL

## Resumen

JEV-27B-VL es un adaptador LoRA multimodal sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario Kay52333 bajo el identificador Kay52333/JEV-27B-VL. El modelo se presenta como un "decision model" que combina dos modos de razonamiento: un System 1 rapido y calibrado que emite decisiones tipadas (typed decisions) con probabilidades calibradas, y un System 2 que reutiliza el modelo base sin modificar para razonar antes de decidir. La propuesta central es sustituir equipos de ranking y recomendacion por un unico modelo de decision, con una latencia de aproximadamente medio segundo por decision en el modo System 1.

El modelo esta orientado a tareas de image-text-to-text, con soporte declarado para vision, razonamiento encarnado (embodied reasoning), busqueda y recomendacion. Segun la model card, alcanza un 61,5% en el benchmark ERQA de Google DeepMind con thinking activado en nivel medio, y un 53,8% en una sola pasada sin thinking. El autor afirma que no se incluyeron datos de robots ni embodied en el entrenamiento de decision (solo texto), y que el System 2 es el Qwen3.8-27B sin modificar.

El modelo tiene 27.781.427.952 parametros totales segun los pesos en safetensors, un repositorio de 56 GB y licencia Apache 2.0. Esta publicado con muy poca traccion (0 descargas, 0 likes en el momento de la consulta) y con fecha de creacion de noviembre de 2026, lo que conviene tener en cuenta al evaluar su madurez y el respaldo de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con adaptador LoRA sobre Qwen/Qwen3.8-27B; esquema de decision System 1 / System 2 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA (base_model_relation: adapter) sobre Qwen/Qwen3.8-27B, un transformer multimodal de unos 27,8 mil millones de parametros. La innovacion declarada no es la arquitectura del transformer en si, sino el esquema de decision en dos sistemas: un System 1 que produce decisiones tipadas con probabilidades calibradas en una sola pasada, y un System 2 que corresponde al modelo base sin modificar y que razona antes de emitir la respuesta. La salida de ambos se combina en una distribucion 50/50 cuando se activa el thinking, segun describe la model card.

El entrenamiento de decision se realizo sobre el dataset SargeDev/jev-distill-corpus-v3, que segun el autor contiene solo texto (sin datos de robots ni embodied). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un "decision index" y un endpoint `/v1/decide` para emitir decisiones de tipo `choice`, lo que sugiere una capa de servicio especifica para el modo System 1. Tampoco se especifican innovaciones como decodificacion especulativa o attention linear.

## Capacidades

- Generacion de texto y razonamiento multimodal image-text-to-text.
- Decisiones tipadas con probabilidades calibradas mediante el endpoint `/v1/decide`.
- Modo System 1 (una pasada, baja latencia) y modo System 2 (thinking, razonamiento previo con el modelo base).
- Control del thinking mediante parametros (`thinking: "on"`, `"auto"`, niveles `low` y `medium`); el modo `auto` activa el razonamiento solo por debajo de 0,8 de confianza del System 1.
- Razonamiento encarnado y comprension del mundo fisico (evaluado en ERQA): razonamiento espacial, de accion, de trayectoria, estimacion de estado, razonamiento de tarea, multi-vista y pointing.
- Capacidades de busqueda y recomendacion: ranking de titulares y re-ranking de resultados de buscadores con respuesta corta y citas, segun la demo GuruSearch.
- Soporte declarado para vLLM y endpoints compatibles.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se declara soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Re-ranking de resultados de busqueda: el modelo puede recibir un conjunto de resultados y emitir una decision de relevancia por candidato con probabilidad calibrada, lo que permite ordenar y filtrar sin un equipo de ranking separado.
- Recomendacion de contenidos: ranking de titulares o articulos por importancia, como en la demo GuruSearch con seis feeds de noticias, usando el modo System 1 para obtener decisiones en torno a medio segundo.
- Respuesta corta con citas: combinacion de busqueda y generacion de una respuesta breve fundamentada en las fuentes recuperadas, adecuada para asistentes de informacion.
- Razonamiento encarnado y robotica: respuesta a preguntas de opcion multiple sobre escenas fisicas (estado de objetos, trayectorias, acciones) para planificacion de alto nivel en robots, con 61,5% en ERQA en modo thinking medium.
- Clasificacion y decision con umbral de confianza: uso del modo `thinking: "auto"` para derivar solo los casos de baja confianza al System 2, optimizando coste y latencia en pipelines de decision.
- Moderacion o triaje de contenido visual y textual: decision tipada sobre categorias predefinidas con probabilidades calibradas, aprovechando la entrada multimodal.
- Evaluacion comparativa de modelos de decision: el esquema System 1/System 2 y el endpoint `/v1/decide` facilitan la integracion en pipelines de evaluacion automatizada.

## Benchmarks y rendimiento

Resultados declarados por el autor en ERQA (400 preguntas de opcion multiple, azar aproximado del 26%):

| Tipo de pregunta | Preguntas | Una pasada | Thinking (low) | Thinking (medium) |
|---|---:|---:|---:|---:|
| Todas | 400 | 53,8% | 60,0% | 61,5% |
| Razonamiento espacial | 84 | 53,6% | 59,5% | 58,3% |
| Razonamiento de accion | 72 | 58,3% | 54,2% | 59,7% |
| Razonamiento de trayectoria | 66 | 51,5% | 65,2% | 63,6% |
| Estimacion de estado | 55 | 65,5% | 72,7% | 63,6% |
| Razonamiento de tarea | 38 | 55,3% | 65,8% | 60,5% |
| Razonamiento multi-vista | 37 | 32,4% | 37,8% | 54,1% |
| Pointing | 34 | 67,6% | 73,5% | 88,2% |
| Otros | 14 | 14,3% | 28,6% | 28,6% |

Datos adicionales declarados: mediana de 687 tokens de thinking en low y 814 en medium; mediana de 1,15 s por pregunta en una pasada con 16 peticiones paralelas, 12,1 s (low) y 13,9 s (medium) con thinking y 8 peticiones paralelas; con `thinking: "auto"` (305 de 400 preguntas) se obtiene 59,5% (low) y 61,0% (medium). El autor indica que el thinking anade 7,7 puntos con p = 0,002 en test pareado.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 27,8 mil millones de parametros, en FP16 se requieren aproximadamente 55-56 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimaciones a partir del tamano, no confirmadas por el autor).
- GPU recomendadas: el autor menciona una B200 para sus ejecuciones. Por tamano, cabria esperar A100 80 GB, H100 80 GB y B200; en consumer, RTX 4090 (24 GB) solo con cuantizacion agresiva y posible offload.
- Cabe en consumer GPU: no en FP16; posible en 4 bits en GPUs de 24 GB con margen limitado, sujeto a verificacion.
- Opciones de despliegue: transformers, vLLM (declarado en los tags) y `serve.sh` propio del autor con endpoint `/v1/decide`; no se confirman llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1,15 s por decision en una pasada con 16 peticiones paralelas en una B200; 12,1-13,9 s con thinking y 8 peticiones paralelas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ERQA | Entrenamiento robot/embodied | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JEV-27B-VL | 27,8B | no disponible | 61,5% (thinking medium) / 53,8% (una pasada) | ninguno (solo texto) | apache-2.0 | Hugging Face |
| GEV-26B-Decide | ~26B | no disponible | 56,8% (thinking on) | ninguno (solo texto) | no disponible | no disponible |
| Hy-Embodied-VLM-1.0 | 30B-A3B | no disponible | 56,3% (thinking) | si | no disponible | no disponible |
| PhysBrain 1.5 | 8B | no disponible | 52,8% | si | no disponible | no disponible |
| JEV-35B | ~35B | no disponible | 51,3% (una pasada) | ninguno (solo texto) | no disponible | no disponible |

Los datos de ERQA de los modelos comparables provienen del informe PhysBrain 1.5 o de mediciones del propio autor, segun la model card. No se dispone de comparativas en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con muy poca traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente.
- Los benchmarks ERQA son mediciones del propio autor, no verificadas por terceros; con 400 preguntas el intervalo de confianza al 95% es de aproximadamente ±5 puntos.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- No se especifican la longitud de contexto, los tipos de cuantizacion ni el proceso exacto de entrenamiento (tokens, RLHF/DPO), lo que dificulta reproducir o auditar el modelo.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en el modo System 2 y en tareas de respuesta con citas.
- El modo thinking incrementa la latencia de forma notable (de 1,15 s a 12-14 s por pregunta en la configuracion declarada).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del dataset de destilacion.
- El esquema de decision depende de un endpoint propio (`/v1/decide`) y de un `serve.sh` especifico, lo que puede complicar la portabilidad a otros stacks de inferencia.
- No se declaran sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kay52333/JEV-27B-VL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Blog del autor: https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo GuruSearch: https://news.guru.so/ui
- Benchmark ERQA: https://github.com/embodiedreasoning/ERQA
- Paper referenciado (arXiv 2609.14973): https://arxiv.org/abs/2609.14973
- Paper referenciado (arXiv 2512.16899): https://arxiv.org/abs/2512.16899
- DOI: https://doi.org/10.57967/hf/11493
