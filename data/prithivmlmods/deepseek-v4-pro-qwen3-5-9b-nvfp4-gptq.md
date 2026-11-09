# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ es una compilación cuantizada a 4 bits en formato NVFP4 mediante GPTQ del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de 9B parámetros construido sobre Qwen3.5-9B y destilado de DeepSeek-V4-Pro. Lo publica prithivMLmods y su objetivo es reducir el uso de memoria y acelerar la inferencia en hardware con soporte nativo de NVFP4 (arquitecturas Blackwell: SM120, GB202, B200, B300, RTX Pro 6000), manteniendo la precisión lo más cerca posible de los pesos en precisión completa.

El modelo base se entrenó en dos fases: SFT seguido de una etapa ligera de RL con GSPO, sobre aproximadamente 250.000 muestras de matemáticas y STEM (sin datos de código), destiladas de DeepSeek-V4-Pro en modo Max Effect. El resultado es un modelo orientado a razonamiento matemático y científico, con soporte declarado de tool calling, function calling y decodificación especulativa mediante un cabezal auxiliar de Multi-Token Prediction (MTP).

La relevancia actual reside en dos factores: por un lado, demuestra un pipeline de cuantización NVFP4 con GPTQ (usando `llm-compressor` y `GPTQModifier`) aplicable a modelos de ~9B para despliegue en GPUs Blackwell; por otro, la model card reporta mejoras medibles frente a Qwen3.5-9B en MMLU-Pro de matemáticas, física y química, con un consumo de tokens de razonamiento notablemente menor. Conviene subrayar que ninguna de las cifras publicadas se midió sobre esta compilación GPTQ concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text, con cabezal auxiliar MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) con GPTQ; block_size 128, actorder static, weight_observer imatrix_mse; capas Linear cuantizadas, `lm_head` y capas visuales excluidas |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards: 4,99 GB + 3,89 GB), más `model_mtp.safetensors` (487 MB); comprimido con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 de 9B parámetros, adaptado a modalidad image-text-to-text (procesador multimodal incluido). Sobre esa base, Jackrong aplicó un fine-tune de razonamiento destilado de DeepSeek-V4-Pro en modo Max Effect, usando aproximadamente 250.000 muestras de matemáticas y STEM, sin datos de código. El entrenamiento consta de una fase de SFT seguida de una etapa ligera de RL con GSPO (Group Sequence Policy Optimization). El dataset declarado en los metadatos incluye HuggingFaceH4/ultrachat_200k.

La innovación técnica principal de esta compilación es la cuantización NVFP4 con GPTQ: se aplica `GPTQModifier` sobre todas las capas `Linear` (excluyendo `lm_head` y las capas visuales, mediante el patrón `re:.*visual.*`), con calibración obligatoria, `block_size` de 128, `dampening_frac` de 0,01 y `actorder` estático. El objetivo es estabilizar la compresión a 4 bits y conservar la precisión. Además, el repositorio incluye un modelo auxiliar MTP (`model_mtp.safetensors`) que habilita decodificación especulativa y acelera la generación. El pipeline se construyó con `llm-compressor` del proyecto vLLM.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en matemáticas y disciplinas STEM.
- Capacidad multimodal image-text-to-text (procesador y capas visuales presentes; las capas visuales no se cuantizan).
- Tool calling y function calling, según los tags del modelo.
- Soporte de agentes y razonamiento encadenado (tags `reasoning`, `tool-use`).
- Decodificación especulativa mediante cabezal MTP auxiliar.
- Multilingüe en seis idiomas: inglés, chino, coreano, japonés, español y ruso.
- Modo de respuesta concisa: la model card del autor original afirma que responde con una sola letra el 97,2 % de las veces cuando se le pide.
- No incluye entrenamiento específico en código (el autor original declara ausencia de datos de programación).

## Casos de uso

- Tutoría y resolución de problemas matemáticos: el modelo está destilado sobre 250K muestras de matemáticas y STEM y reporta un 94,50 % en GSM8K, lo que lo hace adecuado para asistentes de resolución paso a paso con verificación posterior.
- Razonamiento científico en química y física: el 90,53 % de media en MMLU-Pro Math/Physics/Chemistry (muestra de 1.500 preguntas) lo sitúa por encima de Qwen3.5-9B en esas áreas, útil para asistentes de laboratorio o estudio.
- Despliegue en GPUs Blackwell con VRAM limitada: al ocupar ~8,9 GB en pesos NVFP4, cabe en una RTX Pro 6000 o B200 y permite servir el modelo con vLLM en entornos de producción con presupuesto de memoria ajustado.
- Agentes con tool calling: los tags `tool-use` y `function-calling` permiten integrarlo en flujos que consultan APIs, calculadoras simbólicas o bases de datos científicas.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer y razonar sobre gráficos, tablas o figuras en informes técnicos.
- Generación con latencia reducida: el cabezal MTP habilita decodificación especulativa, útil en aplicaciones interactivas donde importa el throughput por token.
- Atención multilingüe: cubre inglés, chino, coreano, japonés, español y ruso, adecuado para soporte o documentación en esos idiomas.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor original y no se midieron sobre esta compilación GPTQ. Se presentan tal cual, con la advertencia de que son muestras aleatorias y no subconjuntos completos.

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K | 94,50 % | Media de cuatro ejecuciones sobre el checkpoint NVFP4 propio bajo vLLM |
| MMLU-Pro (Math, Physics, Chemistry) | 90,53 % de media | Muestra de 1.500 preguntas; +0,93 puntos frente a Qwen3.5-9B; ~36 % menos tokens de razonamiento por respuesta correcta; medido con MTP-Q8_0 GGUF |
| Respuesta de una sola letra | 97,2 % | Afirmación de la model card del autor original |

No se han publicado resultados de benchmarks específicos para esta compilación GPTQ en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 suman aproximadamente 8,9 GB (4,99 + 3,89 GB), más 487 MB del cabezal MTP; con overhead de activaciones y KV cache, se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: arquitecturas con soporte nativo NVFP4, es decir, NVIDIA Blackwell (SM120, GB202, B200, B300, RTX Pro 6000). En GPUs sin soporte NVFP4 la compilación no es utilizable de forma eficiente.
- ¿Cabe en GPU consumer? No hay datos que confirmen compatibilidad con GPUs consumer; los tags apuntan exclusivamente a hardware Blackwell profesional y de datacenter.
- Opciones de despliegue: transformers, vLLM (con `llm-compressor` y compressed-tensors), text-generation-inference; los tags mencionan llama-cpp y unsloth, aunque la cuantización NVFP4 es específica del stack de vLLM/compressed-tensors.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP debería mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ (este) | 9,65B | no disponible | NVFP4 + GPTQ | Apache 2.0 | Solo hardware Blackwell; benchmarks del autor original no medidos en esta build |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9B | no disponible | Precisión completa | Apache 2.0 | Modelo de referencia; benchmarks reportados aquí |
| Qwen/Qwen3.5-9B | 9B | no disponible | Múltiples | Apache 2.0 | Base original; el fine-tune reporta +0,93 puntos en MMLU-Pro Math/Physics/Chemistry |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El autor original califica el modelo como experimental y de comunidad, con salidas que requieren verificación.
- Los benchmarks publicados no se midieron sobre esta compilación GPTQ; la degradación por cuantización NVFP4 no está cuantificada.
- Los resultados de benchmarks proceden de muestras aleatorias, no de subconjuntos completos, y son del propio autor.
- Sin datos de entrenamiento en código: no es adecuado como modelo principal para generación de programación.
- Riesgo de alucinación inherente a modelos de razonamiento destilados; el modo de respuesta de una sola letra puede ocultar razonamiento erróneo.
- Dependencia de hardware Blackwell: inutilizable en GPUs sin soporte NVFP4 (Ampere, Ada, etc.).
- Longitud de contexto no documentada; no se puede garantizar comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones de la licencia del modelo base original.
- Idiomas limitados a seis; no hay soporte declarado para otras lenguas.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-NVFP4-GPTQ
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
- Dataset de referencia: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
