# primitive-ai/Laguna-S-2.1-mixed-NVFP4-MXFP8

## Resumen

Laguna-S-2.1-mixed-NVFP4-MXFP8 es una cuantizacion mixta de precision del modelo poolside/Laguna-S-2.1, desarrollada por primitive-ai para permitir servir el modelo completo en una sola GPU de 96 GiB. El modelo original en BF16 ocupa 219 GB y requiere un host multi-GPU; esta version reduce el peso a 64 GiB con 4,67 bits por peso, lo que supone una reduccion de 3,4× respecto al BF16. Es la unica build del modelo que primitive-ai ha conseguido servir en una sola tarjeta.

El modelo base es un Mixture-of-Experts (MoE) de 118B parametros totales con 8B parametros activos por token, disenado para coding agéntico y trabajo de ingenieria de software de horizonte largo. Soporta una ventana de contexto de hasta 1M tokens en modos de razonamiento (thinking) y sin razonamiento (no-thinking), con atencion mixta global/sliding window a lo largo de 48 capas.

La cuantizacion aplica NVFP4 a las proyecciones de expertos enrutados y MXFP8 a las proyecciones de atencion y expertos compartidos, manteniendo embeddings, lm_head y router en BF16. El proceso es weights-only round-to-nearest sin datos de calibracion, lo que lo hace reproducible y data-free. Se sirve con vLLM estandar sin parches, usando el formato compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con atencion mixta global/sliding window, 48 capas |
| Parametros totales | 118B (modelo base); 60,8B almacenados en este repo cuantizado (segun safetensors) |
| Parametros activos | 8B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (grupo 16) en expertos enrutados; MXFP8 (grupo 32) en atencion, expertos compartidos y primera capa densa; BF16 en embeddings, lm_head, router, gates de atencion y normas |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base poolside/Laguna-S-2.1 es un MoE de 118B parametros totales con 8B activos por token, construido con 48 capas que combinan atencion global y sliding window. Esta disenado para razonamiento intercalado nativo y trabajo agéntico de horizonte largo, con soporte de hasta 1M tokens de contexto en modos de pensamiento y sin pensamiento.

La cuantizacion de primitive-ai aplica NVFP4 con grupo de 16 a las proyecciones de expertos enrutados, MXFP8 con grupo de 32 a las proyecciones de atencion, expertos compartidos y la primera capa densa, y mantiene en BF16 los embeddings, lm_head, router, gates de atencion y normas. El proceso es weights-only round-to-nearest sin datos de calibracion, lo que elimina la necesidad de datasets de calibracion y garantiza reproducibilidad. La conversion se realiza por streaming, shard a shard, permitiendo cuantizar un modelo de 219 GB en un host con 176 GB de RAM.

## Capacidades

- Razonamiento intercalado nativo con modos de pensamiento (thinking) y sin pensamiento (no-thinking)
- Coding agéntico y trabajo de ingenieria de software de horizonte largo
- Ventana de contexto de 1M tokens para procesar repositorios completos o conversaciones extensas
- Generacion de texto conversacional (tag "conversational" en el repositorio)
- Inferencia eficiente en una sola GPU de 96 GiB gracias a la cuantizacion mixta
- Compatible con vLLM estandar sin parches, usando compressed-tensors
- Compatible con endpoints de inferencia (tag "endpoints_compatible")

## Casos de uso

- Ingenieria de software agéntica: el modelo puede abordar tareas de programacion de horizonte largo, navegando por repositorios completos gracias a su ventana de 1M tokens y razonando de forma intercalada antes de generar codigo.
- Analisis de codebases extensos: la ventana de contexto de 1M tokens permite cargar repositorios enteros o archivos de gran tamano en una sola pasada, facilitando refactorizaciones, revisiones de codigo y deteccion de bugs.
- Despliegue de LLM en produccion con coste reducido: al caber en una sola GPU de 96 GiB, esta cuantizacion reduce el coste de infraestructura frente a los 219 GB del BF16, que exige un host multi-GPU, o frente al NVFP4 oficial de 93 GB, que hace OOM en tarjetas de 95 GiB.
- Razonamiento multi-paso en tareas complejas: el modo de pensamiento intercalado permite resolver problemas que requieren cadenas de razonamiento largas antes de emitir una respuesta final, con un rendimiento medido de 750,8 tok/s a concurrencia 32.
- Automatizacion de tareas de desarrollo: integracion en pipelines de CI/CD para generacion de codigo, revision automatica de pull requests o resolucion de issues, aprovechando el soporte de vLLM para servir con alta concurrencia.
- Investigacion en eficiencia de inferencia: la cuantizacion mixta NVFP4/MXFP8 sirve como referencia para estudiar el impacto de la precision reducida en modelos MoE de gran tamano, con un proceso de conversion reproducible y sin calibracion.

## Benchmarks y rendimiento

Los datos publicados por primitive-ai se midieron sobre una suite mixta de 1.170 muestras de 9 benchmarks publicos, con concurrencia 32, cap de 8.192 tokens y sampling con temperatura 1.0, top_k 20 y top_p 1.0, en una RTX PRO 6000 Blackwell:

| Configuracion | Bits/peso | Tamano | Sirve en 1×96 GiB? | Precision | tok/s @ conc 32 | tok/s @ conc 1 |
|---|---|---|---|---|---|---|
| BF16 original | 16,000 | 219 GB | No | — | — | — |
| NVFP4 oficial | ~6,8 | 93 GB | No (OOM a 95 GiB) | — | — | — |
| Este repo | 4,672 | 64 GiB | Si | 79,1% | 750,8 | 118,2 |

La cifra de precision del 79,1% es un limite inferior. Con el cap de 8.192 tokens, 125 de las 1.170 respuestas (10,7%) se cortaron a mitad del razonamiento y se puntuaron como incorrectas. Sobre las 1.045 respuestas completadas, la precision es del 88,6%. El valor real se situa entre ambos numeros; para mantener la tasa de truncamiento por debajo del 5% se necesita un cap de 16k tokens. Las filas de referencia (BF16 y NVFP4 oficial) no llevan puntuaciones porque ninguna de las dos configuraciones pudo cargarse en la tarjeta donde se midio este repo.

## Requisitos de hardware

- VRAM estimada: 64 GiB para los pesos, con margen para activaciones y KV cache en una GPU de 96 GiB a `--gpu-memory-utilization 0.90`
- GPU recomendada: RTX PRO 6000 Blackwell o cualquier GPU con 96 GiB de VRAM con soporte para NVFP4
- No cabe en GPUs de consumo (RTX 4090 con 24 GiB, por ejemplo) dado el tamano del modelo
- Despliegue: vLLM estandar sin parches, con `vllm serve primitive-ai/Laguna-S-2.1-mixed-NVFP4-MXFP8`
- Rendimiento medido: 750,8 tok/s a concurrencia 32 y 118,2 tok/s en single-stream sobre una RTX PRO 6000 Blackwell
- Se recomienda un `--max-model-len` generoso, ya que el modelo razona extensamente y un cap corto corta las respuestas a mitad del razonamiento

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | GPU unica 96 GiB |
|---|---|---|---|---|---|
| poolside/Laguna-S-2.1 (BF16) | 118B total / 8B activos | 1M tokens | 219 GB | openmdw-1.1 | No |
| poolside/Laguna-S-2.1 (NVFP4 oficial) | 118B total / 8B activos | 1M tokens | 93 GB | openmdw-1.1 | No (OOM a 95 GiB) |
| Este repo (NVFP4+MXFP8) | 118B total / 8B activos | 1M tokens | 64 GiB | openmdw-1.1 | Si |
| poolside/Laguna-XS-2.1 | menor que S-2.1 | no disponible | no disponible | openmdw-1.1 | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos MoE de la misma categoria (118B con 8B activos orientados a coding agéntico) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia openmdw-1.1 no es una licencia open source estandar (Apache/MIT); es necesario revisar sus terminos antes de uso comercial.
- Con un cap de tokens de 8.192, el 10,7% de las respuestas se cortan a mitad del razonamiento; para uso en produccion se recomienda un cap de al menos 16k tokens.
- La precision publicada (79,1%) es un limite inferior; el rendimiento real con respuestas completas es del 88,6%, pero el valor exacto depende del cap de tokens configurado.
- La cuantizacion es weights-only round-to-nearest sin calibracion, lo que puede introducir degradacion frente a metodos con calibracion en tareas sensibles a la precision numerica.
- No se han publicado datos sobre idiomas soportados ni sobre sesgos del modelo.
- El modelo requiere hardware Blackwell (RTX PRO 6000 o similar) con soporte nativo para NVFP4; en GPUs sin soporte para esta precision el rendimiento puede verse afectado o la carga puede fallar.
- La diferencia entre los 60,8B parametros almacenados en safetensors y los 118B del modelo base sugiere que parte de los pesos podrian estar compartidos o almacenados de forma optimizada; verificar la integridad del modelo antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Laguna-S-2.1-mixed-NVFP4-MXFP8
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Blog de poolside sobre Laguna S 2.1: https://poolside.ai/blog/introducing-laguna-s-2-
