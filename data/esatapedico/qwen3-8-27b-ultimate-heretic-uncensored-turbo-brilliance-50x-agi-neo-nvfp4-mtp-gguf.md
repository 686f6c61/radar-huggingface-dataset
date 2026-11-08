# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino una familia de siete conversiones a GGUF del tune comunitario `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO`, derivado a su vez de un modelo Qwen3.8-27B de 27.000 millones de parámetros. El autor, esatapedico, parte de su propio checkpoint NVFP4 y construye una escalera de precisión sobre los tensores que más afectan a la calidad de salida y a la velocidad de decodificación: la cabeza LM (`output.weight`), el embedding de tokens y la cabeza MTP de decodificación especulativa.

La particularidad técnica es que los siete ficheros comparten un backbone NVFP4 de 448 tensores byte a byte idéntico (verificado con SHA-256 por tensor), y solo varían en la precisión de esas tres familias de tensores, con tamaños que van de 14,86 GB a 19,69 GB. La cabeza MTP va integrada en cada fichero, de modo que no hace falta un drafter separado. Se distribuye además un proyector de visión en BF16 de 0,93 GB para emparejar con cualquier tier.

El interés para el ecosistema open source es doble: por un lado, demuestra una estrategia de cuantización selectiva que mantiene la perplejidad dentro de un 1,3 % del modelo sin cuantizar; por otro, está orientado explícitamente a GPUs Blackwell (sm_120) con NVFP4, un formato de cuantización de 4 bits con escalas de bloque pensado para el hardware de NVIDIA más reciente. El modelo está pensado para texto, multilingüe, y sin censura en el tune de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: Gated DeltaNet más Gated Attention cada cuarta capa, con cabeza MTP de decodificación especulativa embebida |
| Parametros totales | 27B (modelo base); el dato de safetensors del repo indica 460.730.096 parámetros, probablemente correspondiente solo a un subconjunto de tensores |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone NVFP4 (4 bits); cabezas en Q2_K, Q3_K, Q4_K, Q5_0, IQ4_XS, Q6_K, Q8_0 y BF16 según tier; vectores `ssm_alpha` en F32 |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (siete tiers) más un `mmproj-BF16.gguf` para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 27B parámetros que combina capas Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atención con compuerta cada cuarta capa. Incorpora una cabeza MTP (multi-token prediction) embebida que actúa como drafter para decodificación especulativa dentro del propio fichero, invocable con `--spec-type draft-mtp` en llama.cpp. El repo de conversión no documenta el entrenamiento del modelo original: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO. El nombre del tune de origen ("Heretic", "Uncensored") sugiere un ajuste orientado a eliminar el alineamiento y la censura del modelo base, pero no hay detalles técnicos publicados en la información disponible.

La innovación del repositorio es puramente numérica. Cada tier contiene 1.122 tensores: un backbone NVFP4 compartido de 448 tensores (256 cuantizados en la pasada de conversión NVFP4 más 192 normalizados a NVFP4 al construir los tiers) y 48 vectores `ssm_alpha` que se mantienen en F32. La escalera de precisión se aplica solo a `output.weight`, `token_embd` y el bloque MTP (blk.64), de modo que el coste en calidad de la cuantización se concentra donde menos impacta. El resultado es una perplejidad entre 3,2441 y 3,2874 frente a 3,2445 del modelo sin cuantizar.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo Qwen3.8-27B subyacente.
- Decodificación especulativa integrada mediante cabeza MTP, sin necesidad de un modelo drafter externo.
- Visión: el repo incluye `mmproj-BF16.gguf` para emparejar con cualquier tier mediante `--mmproj`; la validación del servicio de visión está pendiente según el autor.
- Multilingüe, con inglés como idioma principal declarado.
- Compatible con llama.cpp como runtime de referencia.
- Sin censura en el tune de origen (etiqueta "Heretic/Uncensored"), lo que implica ausencia de rechazos por contenido en el ajuste.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Despliegue en GPUs Blackwell con VRAM limitada: el tier VERY-LOW (14,86 GB) permite cargar un modelo de 27B en tarjetas de 16 GB gracias al backbone NVFP4, un escenario inviable con cuantizaciones de 8 bits.
- Servicio de inferencia de baja latencia: la cabeza MTP embebida permite activar decodificación especulativa sin desplegar un drafter aparte, lo que simplifica la infraestructura y reduce el coste por token generado.
- Evaluación de cuantización selectiva: la escalera de siete tiers con backbone idéntico permite medir el impacto aislado de la precisión de la cabeza LM, el embedding y el MTP sobre la perplejidad, útil para investigación en compresión de modelos.
- Generación de texto creativo sin restricciones de alineamiento: el tune "Heretic/Uncensored" está pensado para escenarios donde se requiere ausencia de rechazos, como escritura de ficción o roleplay, con la advertencia de los riesgos asociados.
- Procesamiento de documentos con imagen: emparejando cualquier tier con `mmproj-BF16.gguf` se obtiene un pipeline multimodal de OCR o descripción de imágenes, aunque el autor indica que la validación de visión está pendiente.
- Inferencia local en estaciones de trabajo: los tiers MEDIUM y MID-HIGH (16,38 y 16,91 GB) caben en GPUs consumer de 24 GB como la RTX 4090, permitiendo ejecutar un modelo de 27B con cabezas en Q8_0 en hardware de escritorio.
- Reproducibilidad y auditoría: los SHA-256 por fichero y por tensor del backbone permiten verificar la integridad de la conversión en pipelines de CI, algo relevante para despliegues en producción.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad sobre un corpus diverso (menor es mejor). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Tier | Tamano | Perplejidad |
|---|---|---|
| VERY-LOW | 14,86 GB | 3,2874 ± 0,07455 |
| COMPACT-LOW | 15,16 GB | 3,2841 ± 0,07468 |
| LOW | 15,53 GB | 3,2751 ± 0,07442 |
| MEDIUM | 16,38 GB | 3,2596 ± 0,07381 |
| MID-HIGH | 16,91 GB | 3,2569 ± 0,07359 |
| HIGH | 17,57 GB | 3,2602 ± 0,07384 |
| VERY-HIGH | 19,69 GB | 3,2441 ± 0,07320 |
| Sin cuantizar (referencia) | no disponible | 3,2445 |

La variación total entre el tier más pequeño y el modelo sin cuantizar es de aproximadamente un 1,3 %, lo que indica que la escalera de cabezas apenas afecta a la perplejidad incluso en el extremo inferior.

## Requisitos de hardware

- VRAM estimada: entre 15 y 20 GB para los pesos según tier; hay que sumar el espacio de contexto KV y, si se usa visión, los 0,93 GB del proyector.
- GPU recomendadas: NVIDIA Blackwell (sm_120) es el objetivo declarado del formato NVFP4; el soporte en arquitecturas anteriores depende del backend de llama.cpp y no está documentado en la información disponible.
- GPU consumer: los tiers de 14,86 a 16,91 GB caben en tarjetas de 16 GB (VERY-LOW, COMPACT-LOW, LOW) y de 24 GB (MEDIUM, MID-HIGH e incluso HIGH con margen ajustado); VERY-HIGH (19,69 GB) requiere 24 GB o más.
- Despliegue: llama.cpp es el runtime de referencia, con la opción `--spec-type draft-mtp` para activar la decodificación especulativa y `--mmproj` para visión. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP debería mejorar el throughput de decodificación, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Qwen3.8-27B tune, GGUF NVFP4) | 27B denso | no disponible | NVFP4 + cabezas Q2_K a BF16 | Apache 2.0 | Hugging Face, 7 tiers + proyector visión |
| Checkpoint NVFP4 original (esatapedico) | 27B denso | no disponible | NVFP4, 256 tensores | Apache 2.0 | Hugging Face, safetensors |
| Checkpoint W4A16 T400 (esatapedico) | 27B denso | no disponible | W4A16, 400 tensores | Apache 2.0 | Hugging Face, safetensors |
| Tune GGUF de DavidAU | 27B denso | no disponible | GGUF (sin detallar) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la perplejidad del presente repo, por lo que la comparación de rendimiento queda limitada a esa métrica.

## Limitaciones y advertencias

- El modelo es un tune "Heretic/Uncensored": no aplica filtros de alineamiento, por lo que puede generar contenido dañino, ofensivo o inexacto sin rechazo. Requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la ausencia de benchmarks de fiabilidad publicados.
- La validación del pipeline de visión está pendiente según el propio autor; no debe asumirse que funciona en producción.
- El formato NVFP4 está orientado a GPUs Blackwell (sm_120); en hardware anterior el rendimiento o la compatibilidad pueden degradarse o no estar soportados.
- No se documenta la longitud de contexto del modelo base en la información disponible, lo que impide planificar despliegues con ventanas largas.
- El idioma principal declarado es el inglés; el soporte multilingüe no está cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo subyacente Qwen3.8-27B y el tune de DavidAU deberían verificarse por separado para confirmar la cadena de licencias.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni informes independientes de calidad.
- El dato de parámetros en safetensors (460.730.096) no cuadra con un modelo de 27B, lo que sugiere que corresponde a un subconjunto de tensores o a un error de metadatos; conviene no usarlo como referencia de tamaño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-MTP-GGUF
- Checkpoint NVFP4 original: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Checkpoint W4A16 T400: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Modelo base del tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- GGUF del tune de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Sitio del autor: https://www.esatapedico.com
