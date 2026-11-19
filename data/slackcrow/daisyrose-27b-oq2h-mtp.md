# slackcrow/DaisyRose-27B-oQ2h-mtp

## Resumen

DaisyRose-27B-oQ2h-mtp es una cuantización de 2 bits del modelo multimodal RadixArk/DaisyRose-27B, publicada por el usuario slackcrow. El modelo base es un modelo de razonamiento multimodal construido sobre Qwen3.8-27B y afinado exclusivamente con aprendizaje por refuerzo. Esta versión concreta traslada ese modelo a formato MLX nativo para Apple Silicon, reduciendo el peso en disco de 52 GB (BF16) a aproximadamente 11 GB, con una media de 3,4 bits por peso, y conservando la cabeza de predicción multi-token (MTP) del modelo original para decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, documenta una de las builds más ligeras de un modelo de 27.800 millones de parámetros con ventana de contexto de 262.144 tokens y capacidades de visión; por otro, ilustra el estado del arte en cuantización mixta de precisión (oQ2h) calibrada con imatrix sobre datos de código, una técnica pensada para preservar calidad en capas sensibles mientras se comprime agresivamente el resto de la red.

El modelo está pensado para ejecutarse con el runtime OMLX en equipos Apple Silicon, no en GPUs NVIDIA, y se distribuye bajo licencia Apache-2.0. No se han publicado evaluaciones propias de esta cuantización; las referencias de rendimiento remiten al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: 64 capas de decoder en patrón 3:1 de Gated DeltaNet (atención lineal) y atención completa, hidden size 5.120, encoder de visión de 27 capas, 1 capa de predicción multi-token |
| Parametros totales | 27,8 mil millones (incluye 0,46 mil millones del encoder de visión y 0,42 mil millones de la cabeza MTP); el repo safetensors reporta 5.722.724.080 parámetros almacenados tras la cuantización |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ2h mixta de precisión afín, media de 3,4 bits por peso; capas lineales por defecto a 2 bits / grupo 64, `embed_tokens` a 3 bits, proyecciones de atención y MLP de la capa MTP a 4 bits, `lm_head` a 5 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, librería MLX), ~11 GB en disco |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida de atención: 64 capas de decoder organizadas en un patrón 3:1 que alterna capas de Gated DeltaNet (atención lineal) con capas de atención completa, con un tamaño oculto de 5.120. Incorpora un encoder de visión de 27 capas para entrada de imágenes y una capa adicional de predicción multi-token (MTP) que actúa como cabeza de decodificación especulativa, acelerando la generación. El modelo es multimodal de entrada (texto e imagen) y de salida exclusivamente textual.

Según la model card, el modelo base se entrenó únicamente con aprendizaje por refuerzo (RL) sobre Qwen3.8-27B, sin detallar el volumen de tokens ni la composición del dataset. La cuantización oQ2h de esta versión se calibró con imatrix sobre el dataset `oqe_code_multilingual` (128 muestras de 512 tokens), con asignación de bits diferenciada por módulo para proteger capas sensibles (embedding, MTP y `lm_head`). El informe completo de calibración está disponible en `oq_imatrix_report.json` dentro del repositorio.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Modo "thinking" (razonamiento explícito antes de responder), indicado en los tags del repositorio.
- Comprensión de imágenes mediante encoder de visión de 27 capas.
- Decodificación especulativa gracias a la cabeza MTP conservada.
- Capacidades de código y tareas de ingeniería de software: la model card del modelo base referencia evaluaciones en Terminal Bench, SWE Bench Pro v2 y DeepSWE.
- Razonamiento científico y de conocimiento: el modelo base reporta resultados en GPQA Diamond y HLE.
- Seguimiento de instrucciones: el modelo base reporta IFBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque las evaluaciones de tipo SWE/terminal del modelo base sugieren uso agéntico.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede integrarse en editores o terminales de equipos Apple Silicon para autocompletado, refactorización y explicación de código, aprovechando el calibrado imatrix sobre datos de código y el contexto de 262.144 tokens para incluir repositorios completos.
- Agentes de ingeniería de software: dado que el modelo base se evalúa en SWE Bench Pro v2, Terminal Bench y DeepSWE, esta cuantización sirve para prototipar flujos agénticos de resolución de issues y ejecución de comandos en entornos controlados sin depender de GPUs dedicadas.
- Análisis de documentos con imágenes: la combinación de encoder de visión y contexto largo permite procesar capturas, diagramas o páginas escaneadas junto con texto extenso en un mismo contexto.
- Razonamiento técnico y científico asistido: el modo thinking y los resultados del modelo base en GPQA Diamond lo hacen adecuado para borradores de análisis en dominios STEM, siempre con verificación humana.
- Despliegue en portátiles Apple Silicon con memoria unificada limitada: con ~11 GB en disco, es viable en equipos de 16-24 GB de memoria unificada, lo que permite llevar un modelo de 27,8 mil millones de parámetros a estaciones de trabajo personales.
- Evaluación e investigación de cuantización: el repositorio incluye el informe de calibración imatrix, lo que lo convierte en un caso de estudio útil para medir el impacto de la cuantización de 2 bits en tareas de código y razonamiento.
- Procesamiento por lotes de documentación multimodal en local: gracias al contexto de 262.144 tokens, se pueden encadenar múltiples documentos e imágenes en una sola pasada para extracción de información estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card indica explícitamente que no se han ejecutado nuevas evaluaciones y remite a los resultados del modelo base RadixArk/DaisyRose-27B (Terminal Bench, SWE Bench Pro v2, DeepSWE, HLE, IFBench, GPQA Diamond), cuyos valores numéricos no se incluyen en la información proporcionada.

| Benchmark | Este modelo (oQ2h) | Modelo base (BF16) |
|---|---|---|
| Terminal Bench | no disponible | no disponible en la información proporcionada |
| SWE Bench Pro v2 | no disponible | no disponible en la información proporcionada |
| DeepSWE | no disponible | no disponible en la información proporcionada |
| HLE | no disponible | no disponible en la información proporcionada |
| IFBench | no disponible | no disponible en la información proporcionada |
| GPQA Diamond | no disponible | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~11 GB para los pesos en disco; en la práctica se necesita margen adicional para caché KV y contexto, por lo que se recomienda un mínimo de 16 GB de memoria unificada y 24 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (runtime OMLX). No compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada suficiente (Mac con chip M-series de 16 GB o superior). No aplica a GPUs de consumo NVIDIA por el formato MLX.
- Opciones de despliegue: runtime OMLX sobre Apple Silicon; existen variantes relacionadas del mismo autor en 4 bits (`slackcrow/DaisyRose-27B-oQ4h-mtp`, ~16 GB). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere decodificación especulativa para mejorar la velocidad de generación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ2h-mtp (este) | 27,8 B | 262.144 | oQ2h, 3,4 bpw, ~11 GB | Apache-2.0 | Apple Silicon (MLX/OMLX) |
| DaisyRose-27B-oQ4h-mtp | 27,8 B | 262.144 | 4 bits, ~16 GB | Apache-2.0 | Apple Silicon (MLX/OMLX) |
| RadixArk/DaisyRose-27B (BF16) | 27,8 B | 262.144 | BF16, 52 GB | Apache-2.0 | GPU / servidor |
| RadixArk/DaisyRose-27B (FP8 / NVFP4) | 27,8 B | 262.144 | FP8 29 GB / NVFP4 23 GB | Apache-2.0 | GPU NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits en la mayoría de capas lineales puede degradar la calidad respecto al modelo base BF16, especialmente en tareas de razonamiento profundo y generación de código; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El calibrado imatrix se realizó únicamente sobre un dataset de código multilingüe, por lo que la preservación de calidad está sesgada hacia ese dominio y puede ser menor en otros tipos de contenido.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo thinking no elimina este riesgo y requiere verificación en producción.
- Idiomas soportados no documentados; no se garantiza un rendimiento homogéneo fuera de los idiomas mayoritarios del entrenamiento del modelo base.
- Compatibilidad limitada al runtime OMLX en Apple Silicon; no es desplegable directamente en infraestructura NVIDIA ni en frameworks estándar de servidor sin conversión adicional.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en el repositorio por si incorpora condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- El número de parámetros reportado por safetensors (5.722.724.080) corresponde a los tensores almacenados tras la cuantización y no debe interpretarse como el total del modelo (27,8 mil millones).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/slackcrow/DaisyRose-27B-oQ2h-mtp
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Variante de 4 bits: https://huggingface.co/slackcrow/DaisyRose-27B-oQ4h-mtp
- Informe de calibración imatrix: `oq_imatrix_report.json` (incluido en el repositorio)
