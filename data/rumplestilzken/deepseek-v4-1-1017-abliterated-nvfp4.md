# rumplestilzken/DeepSeek-V4.1-1017-abliterated-NVFP4

## Resumen

DeepSeek-V4.1-1017-abliterated-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo multimodal DeepSeek-V4.1-Flash-1017 de DeepSeek AI, publicado por el usuario rumplestilzken sobre el trabajo previo de NVIDIA. El modelo base es un Mixture-of-Experts (MoE) nativamente multimodal con arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), disenado para contextos de hasta un millon de tokens. La cuantizacion se realizo con NVIDIA Model Optimizer (nvidia-modelopt v0.48.0rc0) y almacena los pesos en FP4/FP8, lo que reduce el espacio en disco y acelera la inferencia en hardware Blackwell.

El checkpoint incluye 664.898.390.994 parametros segun los metadatos de safetensors, aunque la model card del modelo base declara 552B en el backbone (8B activos en prefill, 16B en decode) mas 196B de memoria condicional Engram. El repositorio ocupa 429 GB. La etiqueta "abliterated" indica que se ha aplicado una modificacion de pesos orientada a eliminar rechazos de seguridad, lo que tiene implicaciones importantes para su uso en produccion.

Su relevancia actual radica en que permite desplegar un modelo de escala frontera con capacidades multimodales y contexto de 1M en infraestructura Blackwell con requisitos de VRAM reducidos respecto al modelo original en BF16, aunque sigue exigiendo hardware de centro de datos (GB300 o similar) y una build de vLLM con soporte MXFP4 para las tablas Engram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal, Causal Encoder-Decoder (CED) con Compressed Sparse Attention 2 (CSA2) |
| Parametros totales | 664.898.390.994 (safetensors); 552B backbone + 196B Engram segun model card |
| Parametros activos | 8B en prefill, 16B en decode (mas memoria Engram condicional) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4) para pesos, FP8, tablas Engram en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizado con ModelOpt) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Transformer de tipo Mixture-of-Experts con Causal Encoder-Decoder y Compressed Sparse Attention 2, una variante de atencion dispersa comprimida orientada a mantener eficiencia con contextos de hasta 1M tokens. Incorpora ademas un modulo de memoria condicional denominado Engram de 196B parametros, que actua como almacenamiento de conocimiento recuperable de forma condicional. La activacion es dispersa: 8B parametros en fase de prefill y 16B en decode sobre un backbone de 552B.

La informacion sobre el entrenamiento del modelo base no esta disponible en la documentacion proporcionada (modalidad, composicion y metodos de etiquetado aparecen como "Undisclosed"). Lo que si se documenta es el proceso de cuantizacion post-entrenamiento: se aplico nvidia-modelopt v0.48.0rc0 con calibracion sobre 512 muestras de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2 (subconjuntos stem, chat, math y code), con longitud de secuencia 512, batch size 4 y seleccion determinista de muestras. Las tablas Engram se almacenan en MXFP4, lo que requiere una build de vLLM con el soporte correspondiente.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 1M tokens.
- Comprension de imagenes (entrada image-text-to-text): acepta cadenas de texto e imagenes RGB.
- Razonamiento cientifico y matematico (evaluado en GPQA Diamond y AA-LCR).
- Generacion de codigo cientifico y de proposito general (evaluado en SciCode).
- Seguimiento de instrucciones complejas (evaluado en IFBench).
- Tareas de agente en terminal y multi-step reasoning (evaluado en Terminal-Bench 2.1).
- Comprension visual avanzada (evaluado en MMMU-Pro).
- Memoria condicional Engram para recuperacion de conocimiento a gran escala.
- Soporte de tool calling / function calling: no disponible en la documentacion.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible en la documentacion.

## Casos de uso

- Sistemas de agentes autonomos: el modelo esta disenado explicitamente para su uso en AI Agent systems, con soporte de tareas de terminal (Terminal-Bench 2.1) y contexto de 1M tokens que permite mantener el estado de tareas largas sin truncar.
- RAG sobre corpus masivos: la ventana de 1M tokens y la memoria Engram permiten inyectar documentacion extensa o bien recuperar conocimiento condicionalmente, reduciendo la necesidad de pipelines de retrieval agresivos.
- Analisis de documentos cientificos con figuras: la entrada multimodal image-text-to-text combinada con GPQA Diamond y MMMU-Pro lo hace adecuado para interpretar papers con graficos, tablas e imagenes junto al texto.
- Asistentes de codigo en pipelines de CI/CD: su rendimiento en SciCode y el soporte de contexto largo permiten analizar repositorios completos y generar parches con visibilidad del codigo circundante.
- Chatbots de atencion al cliente multi-turno: el contexto de 1M tokens permite conservar historiales extensos y documentacion de producto en la misma ventana.
- Analisis de imagenes medicas o tecnicas asistido: la combinacion de vision y razonamiento cientifico permite describir y razonar sobre imagenes tecnicas, siempre con supervision humana dado el caracter abliterated del checkpoint.
- Despliegue en infraestructura Blackwell con VRAM limitada: la cuantizacion NVFP4 reduce el footprint respecto a BF16, permitiendo servir el modelo en nodos GB300 con vLLM o SGLang.

## Benchmarks y rendimiento

La model card del checkpoint cuantizado lista los datasets de evaluacion (GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro, Terminal-Bench 2.1) y menciona que los resultados se obtuvieron con `vllm/vllm-openai:v0.31.0` parcheado con el PR de Engram, pero no incluye los valores numericos en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond | no disponible |
| AA-LCR | no disponible |
| SciCode | no disponible |
| IFBench | no disponible |
| MMMU-Pro | no disponible |
| Terminal-Bench 2.1 | no disponible |

No se han publicado los valores numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 429 GB en disco en formato NVFP4/FP8; la inferencia requiere un nodo multi-GPU con al menos ~450-500 GB de memoria agregada para cargar pesos y cache KV, aunque la cifra exacta no esta disponible.
- GPU recomendadas: NVIDIA Blackwell, con GB300 como hardware de referencia en las pruebas del autor.
- Compatibilidad con GPU de consumo: no. El tamano (429 GB) y la arquitectura Blackwell requerida excluyen RTX 4090 y similares.
- Motores de despliegue: vLLM (obligatorio con soporte MXFP4 Engram, PR vllm-project/vllm#61530) y SGLang.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-1017-abliterated-NVFP4 (este) | 664,9B (8B/16B activos) | 1M | MIT | Blackwell (GB300) | Hugging Face, 37 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 552B backbone + 196B Engram | 1M | no disponible | no disponible | Hugging Face |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 | mismos que el base | 1M | MIT | Blackwell (GB300) | Hugging Face |

La diferencia principal frente al checkpoint de NVIDIA es la modificacion "abliterated" aplicada por rumplestilzken, que elimina los rechazos de seguridad del modelo original. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El checkpoint es "abliterated": se han modificado los pesos para eliminar comportamientos de rechazo, lo que degrada o elimina los filtros de seguridad del modelo original. No es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo elevado de generar contenido danino, sesgado o inapropiado al haberse suprimido los rechazos.
- Riesgo de alucinacion inherente a los modelos de gran escala; la memoria Engram puede recuperar conocimiento incorrecto de forma convincente.
- Requiere una build especifica de vLLM con soporte MXFP4 Engram; las imagenes oficiales de vLLM no cargan el checkpoint.
- Solo funciona en hardware NVIDIA Blackwell; no hay soporte para arquitecturas anteriores ni para GPU de consumo.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- La licencia MIT se aplica al checkpoint, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no reflejadas.
- El modelo base declara el entrenamiento como "Undisclosed", lo que impide auditar la composicion de datos y los sesgos de origen.
- El autor del checkpoint es un usuario individual, no NVIDIA ni DeepSeek; no hay garantias de mantenimiento ni soporte.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/rumplestilzken/DeepSeek-V4.1-1017-abliterated-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint NVFP4 original de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR de vLLM para soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
