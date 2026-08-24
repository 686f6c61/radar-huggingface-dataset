# barozp/Qwen3.8-27B-Opus-Distill-v2-MTPLX-3bit

## Resumen

El modelo `barozp/Qwen3.8-27B-Opus-Distill-v2-MTPLX-3bit` es una conversión cuantizada a 3 bits del modelo de razonamiento multimodal `Qwen3.8-27B-Opus-Distill-v2`, desarrollado por el usuario barozp. Se trata de un modelo denso de 27 000 millones de parámetros (3 825 044 720 según los pesos safetensors) con arquitectura `qwen3_next` (64 capas, híbrido Gated-DeltaNet y atención completa), capaz de procesar texto e imágenes (pipeline `image-text-to-text`). La conversión está realizada con la librería `mtplx` (versión 2.9.1) y está diseñada específicamente para ejecutar decodificación especulativa (speculative decoding) en Apple Silicon, aprovechando un cabezal MTP (multi-token prediction) en bf16 que propone tokens mientras el tronco cuantizado los verifica.

La versión v2 corrige un bug determinista de la versión v1 que provocaba bucles de auto-verificación sin salida visible cuando se combinaban ciertas restricciones de formato (por ejemplo, `"no prose"` + `"no markdown"`). El retrenado se hizo sobre un dataset reconstruido con trazas verificadas de fuentes genuinas, y se validó con un proceso de juicio LLM paralelo de 30 vías. Con un tamaño en disco de ~13,6 GB (12,6 GiB), el modelo cabe en Macs con 24 GB de memoria unificada y conserva la capacidad de visión integrada, sin necesidad de archivos adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_next` (dense 27B, 64 capas, híbrido Gated-DeltaNet / atención completa) |
| Parámetros totales | 3 825 044 720 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 3-bit (MTPLX, este repositorio), 4-bit (MTPLX), 8-bit (MLX), FP8, GGUF (Q6_K, Q8_0, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards + `model-vision.safetensors` + `mtp.safetensors`), también GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B-Opus-Distill-v2` es un fine-tuning de destilación (distill) sobre un modelo de la familia Qwen3.5 de 27B, según la información de su model card. La arquitectura es `qwen3_next`, un modelo denso con 64 capas y una mezcla de atención Gated-DeltaNet y atención completa, lo que permite un equilibrio entre eficiencia y capacidad de modelado de secuencias largas. El modelo incluye un codificador de visión integrado en los pesos (`model-vision.safetensors`), que se carga automáticamente mediante `mtplx` al pasar el flag `--image`.

La versión v2 se entrenó sobre un dataset reconstruido, donde cada fila fue rastreada hasta una fuente genuina de Opus y pasó un escaneo de 30 vías con LLM-judge para eliminar patrones patológicos de auto-verificación. No se especifican el número de tokens de entrenamiento ni el uso de RLHF/DPO. La conversión MTPLX se realizó directamente desde los pesos safetensors bf16 (sin pasar por GGUF), evitando la deriva de dequantize-requantize. La receta de cuantización usa `body_bits=3`, `body_group_size=64`, `body_mode=affine` y `mtp_policy=keep_bf16`, con el tronco cuantizado y el cabecero MTP en bf16 como sidecar.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos (reasoning), con soporte de modo de pensamiento (thinking mode) típico de la familia Qwen3.
- Comprensión de imágenes (image-text-to-text): el codificador de visión está integrado en los pesos, por lo que el modelo puede describir, analizar y responder preguntas sobre imágenes sin necesidad de archivos externos.
- Decodificación especulativa integrada: el cabecero MTP en bf16 propone tokens mientras el tronco cuantizado los verifica, mejorando la velocidad de generación en Apple Silicon.
- Capacidad de manejar restricciones de formato en la salida (por ejemplo, "no prose", "no markdown") sin entrar en bucles, tras la corrección de v2.
- Uso de imágenes de alta resolución: expande a muchos tokens visuales (~12k observados), con opción de limitar la resolución mediante `max-pixels`.
- No se indica explícitamente soporte de tool calling o function calling, ni de agentes multi-paso, aunque la arquitectura Qwen3.5 suele permitirlo; no hay datos concretos en la información proporcionada.

## Casos de uso

- **Asistente local de razonamiento en Mac con 24 GB**: el modelo cabe en memoria unificada y puede usarse para tareas de razonamiento complejo (matemáticas, lógica) sin depender de servicios en la nube.
- **Análisis de imágenes en local**: con el flag `--image` de `mtplx`, se pueden describir o analizar fotografías, diagramas o capturas de pantalla directamente en el dispositivo.
- **Generación de código con restricciones de formato**: al manejar bien restricciones de salida (sin bucles), puede generar código limpio con instrucciones como "sin comentarios" o "sin Markdown" en entornos de desarrollo.
- **Investigación sobre alineación y seguridad**: el modelo se describe como un experimento de investigación de seguridad y alineación, por lo que puede usarse para estudiar el comportamiento de modelos destilados con datos de Opus.
- **Despliegue en pipelines de inferencia especulativa**: integrable con `mtplx` para acelerar la generación en tareas de streaming o chat en tiempo real en hardware Apple.
- **Prototipado de aplicaciones multimodales**: al incluir visión, permite construir demos de asistentes que responden a imágenes sin necesidad de un servicio externo de visión.

## Benchmarks y rendimiento

Los resultados de calidad se midieron sobre el modelo fuente en safetensors (no sobre la cuantización 3-bit) con `lm-evaluation-harness` (0-shot, loglikelihood, chat template off, `--limit 500`). La columna "Delta" compara v2 con el modelo base (no con v1).

| Tarea | Métrica | Base | v2 | Delta |
|---|---:|---:|---:|---:|
| wikitext | perplexity (menor mejor) | 8,4335 | 8,3788 | -0,055 |
| mmlu | acc | 0,8494 | 0,8476 | -0,002 |
| hellaswag | acc_norm | 0,7420 | 0,7500 | +0,008 |
| arc_challenge | acc_norm | 0,5880 | 0,6220 | +0,034 |
| gpqa_diamond | acc_norm | 0,2323 | 0,4697 | +0,237 |

En cuanto al rendimiento de decodificación especulativa, la model card indica un factor de aceleración de **1,63× a nivel D2** para la versión 3-bit (y 2,39× a D3 para la versión 4-bit), aunque no se proporcionan valores absolutos de latencia o throughput.

## Requisitos de hardware

- **VRAM / memoria**: ~13,6 GB en disco (12,6 GiB), cabe en Macs con 24 GB de memoria unificada.
- **GPU recomendadas**: Apple Silicon con al menos 24 GB de memoria unificada (por ejemplo, Apple M5 Pro 18 CPU / 20 GPU, usado en la conversión).
- **Compatibilidad con GPU de consumo**: no está diseñado para GPUs NVIDIA; es específico para MLX (Apple Silicon). La versión GGUF permite usar llama.cpp en CPUs y GPUs NVIDIA, pero este repositorio concreto es para MLX.
- **Opciones de despliegue**: `mtplx` (recomendado), `llama.cpp` con los GGUF hermanos, `Ollama`, `LM Studio` (vía GGUF), y MLX sin MTP (repos MLX-4bit/8bit).
- **Latencia**: no hay datos absolutos, solo el factor de aceleración de decodificación especulativa (1,63× a D2).

## Comparativa con modelos similares

El modelo se compara con sus formatos hermanos y con el modelo base sin cuantizar. No se dispone de comparativa con otros modelos de la misma familia (p. ej., Qwen3.8-27B original) en la información proporcionada.

| Modelo / formato | Bits | Tamaño en disco | Uso principal |
|---|---|---|---|
| Este repositorio (MTPLX 3-bit) | 3 | ~13,6 GB | Inferencia especulativa en 24 GB Mac |
| `Qwen3.8-27B-Opus-Distill-v2-MTPLX-4bit` | 4 | ~16,9 GB | Mejor equilibrio calidad/velocidad |
| `Qwen3.8-27B-Opus-Distill-v2-MLX-4bit` | 4 | 14,97 GB | MLX sin MTP |
| `Qwen3.8-27B-Opus-Distill-v2-MLX-8bit` | 8 | 27,49 GB | Casi sin pérdida, requiere más memoria |
| `Qwen3.8-27B-Opus-Distill-v2-GGUF` (Q6_K, Q8_0) | 6/8 | no disponible | Uso con llama.cpp / Ollama / LM Studio |

## Limitaciones y advertencias

- **Cuenta de cuantización**: la versión 3-bit puede degradar la calidad respecto a las versiones 4-bit u 8-bit, especialmente en tareas de razonamiento complejo. La model card recomienda la 4-bit para mejor calidad.
- **Bug de v1 corregido en v2**: la v1 tenía un problema de bucles de auto-verificación con restricciones combinadas de salida. La v2 lo corrige, pero no se garantiza que no existan otros patrones problemáticos.
- **Sesgos y alineación**: el modelo se describe como un experimento de investigación de seguridad y alineación (según la fuente `hfviewer`), lo que puede implicar sesgos o comportamientos no deseados en ciertos dominios.
- **Idiomas**: no se dispone de información sobre los idiomas soportados; la familia Qwen3.5 es multilingüe, pero no está confirmado para este modelo.
- **Contexto largo**: no se especifica la longitud de contexto máxima; se recomienda limitar la resolución de imagen para evitar exceder el presupuesto de tokens visuales.
- **Licencia**: Apache-2.0 permite uso comercial, pero hay que verificar que la licencia del modelo base (Qwen) no imponga restricciones adicionales.
- **Dependencia de hardware**: el formato MTPLX es específico de Apple Silicon; para otras plataformas hay que usar los GGUF u otras cuantizaciones.

## Enlaces

- [Repositorio HuggingFace de este modelo (3-bit MTPLX)](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-MTPLX-3bit)
- [Modelo base `Qwen3.8-27B-Opus-Distill-v2`](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2)
- [Modelo base `Qwen3.8-27B-Opus-Distill` (v1)](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill)
- [Versión 4-bit MTPLX](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-MTPLX-4bit)
- [Colección GGUF](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF)
- [Versión FP8](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-FP8)
- [Repositorio de `mtplx` en GitHub](https://github.com/mtplx/mtplx)
