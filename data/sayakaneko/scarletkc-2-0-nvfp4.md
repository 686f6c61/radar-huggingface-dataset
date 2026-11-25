# SayakaNeko/ScarletKc-2.0-NVFP4

## Resumen

ScarletKc-2.0-NVFP4 es un checkpoint cuantizado en precisión mixta NVFP4/FP8 del modelo multimodal ScarletKc-2.0, publicado por el usuario SayakaNeko. Se ha generado mediante cuantización post-entrenamiento (PTQ) con ModelOpt Local Hessian directamente desde los pesos BF16 del modelo base, sin reentrenamiento. El modelo resultante conserva la arquitectura Qwen3.5 multimodal (image-text-to-text) con 18.164.649.200 parámetros totales y una ventana de contexto de 262.144 tokens.

La relevancia de esta versión radica en la reducción de tamaño: pasa de 51,75 GiB en BF16 a 20,42 GiB en tres shards de safetensors, manteniendo en BF16 los 333 tensores de visión y los 15 tensores de MTP (multi-token prediction). Está pensado para despliegue en GPUs Blackwell con soporte NVFP4 mediante vLLM con ModelOpt, lo que permite servir un modelo multimodal de contexto largo en hardware de una sola unidad, como la DGX Spark (GB10) empleada en la validación.

El modelo soporta chino, inglés y japonés, y hereda del modelo base un comportamiento de rechazo reducido. La licencia es Apache 2.0. No se han publicado comparativas de calidad (perplejidad o precisión de tarea) frente a la versión BF16, por lo que las comprobaciones disponibles son funcionales, no de rendimiento de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text) con MTP (multi-token prediction) |
| Parametros totales | 18.164.649.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 / FP8 en precisión mixta (ModelOpt Local Hessian PTQ); visión y MTP en BF16 |
| Idiomas soportados | zh, en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tres shards, 20,42 GiB) |

## Arquitectura y entrenamiento

El modelo base ScarletKc-2.0 emplea la arquitectura Qwen3.5 multimodal, con torre de visión y capacidad de predicción multi-token (MTP). Esta versión no reentrena: aplica cuantización post-entrenamiento con la receta de NVIDIA `nvfp4_w4a4_mlp_fp8_attn_local_hessian`, que usa NVFP4 con activaciones de 4 bits (W4A4) para las capas MLP y `lm_head`, y FP8 para las proyecciones de atención cubiertas por la receta. En total se cuantizan 193 módulos en NVFP4 y 208 en FP8; los 333 tensores de visión y los 15 de MTP se mantienen en BF16 y coinciden por SHA-256 con el modelo fuente.

La calibración se realizó con 512 muestras de datasets Nemotron renderizadas con la plantilla de chat original de ScarletKc, limitadas a 2.048 tokens cada una y con batch size 1: 256 muestras de seguimiento de instrucciones y 256 muestras de código, matemáticas y STEM en chino y japonés. El método Local Hessian estima cómo se propaga el error de pesos a la salida de cada capa usando las activaciones de calibración, y ajusta la escala de cada bloque de pesos en consecuencia. La receta fue validada por NVIDIA sobre el Qwen3.8-27B base, pero no se ha evaluado por separado frente al ScarletKc-2.0 en BF16. La herramienta empleada fue ModelOpt 0.48.0 dentro del contenedor NVIDIA vLLM 26.10, en una única DGX Spark (GB10).

## Capacidades

- Generación de texto conversacional multi-turno en chino, inglés y japonés.
- Comprensión de imágenes (pipeline image-text-to-text), con la torre de visión intacta en BF16.
- Razonamiento y matemáticas, con control de modo thinking heredado del modelo base.
- Seguimiento de instrucciones en los tres idiomas soportados.
- Tool calling / function calling, con parser `qwen3_coder` en vLLM.
- Decodificación especulativa mediante MTP con hasta 3 tokens borrador.
- Recuperación de información en contextos muy largos (comprobación de single-needle a 262.112 tokens superada).
- Generación de código (el conjunto de calibración incluye muestras de código en chino y japonés).

## Casos de uso

- Asistente multimodal de contexto largo: el modelo puede procesar documentos extensos junto con imágenes en una ventana de 262.144 tokens, adecuado para análisis de informes con figuras o capturas.
- Atención al cliente en chino, inglés y japonés: conversaciones multi-turno con contexto amplio y soporte de tool calling para consultar sistemas externos.
- Procesamiento de documentación técnica con imágenes: extracción y razonamiento sobre diagramas, tablas y texto en un mismo prompt.
- Generación de código asistida: integrable en pipelines mediante tool calling y el parser `qwen3_coder` de vLLM, con la ventaja de un checkpoint de 20,42 GiB que reduce requisitos de memoria frente al BF16.
- Despliegue en hardware Blackwell de una sola unidad: la validación en DGX Spark (GB10) demuestra que puede servirse con `--gpu-memory-utilization 0.60` y una sola secuencia, útil para prototipos y entornos de borde con GPU Blackwell.
- Recuperación aumentada sobre corpus largos: la comprobación de single-needle a 262.112 tokens respalda su uso en tareas de retrieval con contextos masivos.
- Inferencia con decodificación especulativa: el uso de MTP con 3 tokens borrador eleva la velocidad de decodificación de 11,6 a 17,9–28,3 tok/s en la validación, útil en entornos interactivos de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que las comprobaciones son funcionales y que no se ha ejecutado comparación de perplejidad ni de precisión de tarea frente al modelo BF16.

Datos de validación funcional en DGX Spark (GB10), vLLM 26.10, FlashInfer CUTLASS NVFP4 GEMM, `--max-model-len 262144`, `--gpu-memory-utilization 0.60`, una secuencia, modo eager:

| Comprobacion | MTP desactivado | MTP (3 tokens borrador) |
|---|---|---|
| Entrada de imagen (orden de dos colores, 2 prompts) | 2 / 2 | 2 / 2 |
| Velocidad de decodificación, salidas de 192 tokens, 3 prompts x 2 ejecuciones | 11,6 tok/s | 17,9–28,3 tok/s (aceptación de borrador 32–72 %) |
| TTFT, prompt corto | 0,16 s | 0,19–0,22 s |
| Recuperación single-needle, prompt de 262.112 tokens, aguja en el token 131.056 | Superado | Superado |
| Tiempo de prefill para el prompt de 262.112 tokens | 386 s | 403 s |
| Capacidad de caché KV | 776.349 tokens | 696.994 tokens |

Comprobaciones adicionales con contexto de 8K: respuesta de identidad de ScarletKc en chino tradicional, seguimiento de instrucciones en japonés y aritmética en inglés.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 20,42 GiB en safetensors; la validación se ejecutó con `--gpu-memory-utilization 0.60` en una DGX Spark (GB10), lo que deja margen para caché KV y activaciones.
- GPU recomendadas: se requiere una GPU Blackwell con soporte NVFP4 (la validación usa GB10). No se indica compatibilidad con arquitecturas anteriores.
- Cabe en GPU consumer: no disponible; la model card solo documenta GB10, no se confirma funcionamiento en RTX 4090 u otras consumer.
- Opciones de despliegue: vLLM con soporte ModelOpt de precisión mixta (probado con el contenedor `nvcr.io/nvidia/vllm:26.10-py3`). El formato se detecta desde `hf_quant_config.json`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 0,16 s (MTP off) y 0,19–0,22 s (MTP on) para prompt corto; decodificación de 11,6 tok/s sin MTP y 17,9–28,3 tok/s con MTP; prefill de 386–403 s para 262.112 tokens.
- Capacidad de caché KV: 776.349 tokens sin MTP y 696.994 con MTP, en la configuración validada.
- Requiere `--mamba-cache-mode align`, `--enforce-eager` y `--kernel-config '{"enable_flashinfer_autotune":false}'` según la receta de despliegue documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScarletKc-2.0-NVFP4 (este) | 18,16 B | 262.144 | NVFP4/FP8 mixta, visión y MTP en BF16 | Apache 2.0 | Hugging Face, requiere vLLM + Blackwell |
| ScarletKc-2.0 (BF16) | 18,16 B | 262.144 | BF16 (51,75 GiB) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (referencia de la receta) | no disponible | no disponible | BF16 base; receta validada por NVIDIA | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad entre estas variantes. La comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Comportamiento de rechazo reducido heredado de `JonathanColetti/Qwen3.8-27B-Uncensored`; se recomienda moderación externa antes de exponer el modelo a usuarios no confiables.
- La cuantización de 4 bits puede introducir pérdida de calidad adicional que las comprobaciones funcionales no miden; no se ha comparado perplejidad ni precisión de tarea frente al BF16.
- Solo se soportan chino, inglés y japonés; el rendimiento en otros idiomas no está documentado.
- Requiere GPU Blackwell con NVFP4 y vLLM con soporte ModelOpt; no es desplegable en hardware sin esa capacidad.
- La validación se realizó con una sola secuencia (`--max-num-seqs 1`); el comportamiento con alta concurrencia no está documentado.
- El prefill de contextos de 262.112 tokens tarda 386–403 s, lo que limita su uso interactivo con prompts masivos.
- Riesgo de alucinación: no se han publicado evaluaciones específicas para esta versión cuantizada.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse `LICENSE` y `NOTICE` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SayakaNeko/ScarletKc-2.0-NVFP4
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Revisión del modelo base usada para la cuantización: https://huggingface.co/ScarletKc/ScarletKc-2.0/tree/ddebd3b2d5f6a91e1d9491c3dc2982551ffb3340
- Modelo de referencia de la receta de cuantización: `JonathanColetti/Qwen3.8-27B-Uncensored` (referenciado en la model card; sin URL directa en la información disponible)
- Contenedor de despliegue: `nvcr.io/nvidia/vllm:26.10-py3` (NVIDIA NGC)
