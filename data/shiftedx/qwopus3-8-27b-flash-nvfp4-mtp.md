# Shiftedx/Qwopus3.8-27B-Flash-NVFP4-MTP

## Resumen

Qwopus3.8-27B-Flash NVFP4 + MTP es una cuantización en formato NVFP4 del modelo multimodal Jackrong/Qwopus3.8-27B-Flash, empaquetada por Shiftedx para ejecutarse en una única GPU NVIDIA RTX 5090 de 32 GB mediante SGLang. Esta versión elimina deliberadamente los 333 tensores de visión del modelo original para reservar memoria VRAM al modelo de lenguaje de 27B, a su capa nativa de predicción multi-token (MTP) y a la caché KV. El resultado es un artefacto exclusivamente de texto, pero con soporte de decodificación especulativa EAGLE/NEXTN gracias a la conservación bit a bit de los tensores MTP originales.

El modelo se basa en la arquitectura de la familia Qwen3.8, con una capa MTP nativa que permite generar varios tokens por paso de decodificación. La cuantización fue realizada con NVIDIA ModelOpt 0.46, usando NVFP4 para pesos y activaciones con un grupo de tamaño 16, y metadatos KV en FP8 E4M3. La calibración se hizo con el dataset CNN/DailyMail (512 muestras, longitud 512, batch 1). El checkpoint resultante tiene 14.732.516.864 parámetros según los metadatos de safetensors, aunque el nombre del modelo indica 27B, y ocupa 19,7 GB en disco. Su contexto lógico es de 131.072 tokens, con un pool físico de 129.241 tokens.

Esta ficha está pensada para desarrolladores e investigadores que necesiten desplegar un modelo de lenguaje de gran tamaño en una GPU de consumo de 32 GB con alta velocidad de decodificación y soporte de contexto largo. La ausencia de visión es una limitación importante, pero el rendimiento medido en RTX 5090 es notable: hasta 138,7 tokens por segundo en streaming.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 con capa MTP nativa |
| Parametros totales | 14.732.516.864 (según metadatos de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (lógico); pool físico de 129.241 tokens |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones, group size 16); KV metadata FP8 E4M3 |
| Idiomas soportados | inglés, chino, español, ruso, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, 19.671.389.312 bytes) |

## Arquitectura y entrenamiento

El checkpoint es una conversión cuantizada del modelo Jackrong/Qwopus3.8-27B-Flash, un modelo multimodal de la familia Qwen3.8. La arquitectura subyacente es un transformer con una capa de predicción multi-token (MTP) nativa, que se conserva bit a bit en esta versión para habilitar la decodificación especulativa EAGLE/NEXTN. La cuantización fue realizada con NVIDIA ModelOpt 0.46, aplicando NVFP4 a pesos y activaciones con un grupo de tamaño 16, y almacenando los metadatos de la caché KV en FP8 E4M3. La calibración se realizó sobre el dataset CNN/DailyMail con 512 muestras, una longitud de secuencia de 512 y batch size 1. El proceso eliminó 333 tensores de visión para reducir el uso de VRAM, dejando únicamente el modelo de lenguaje. No se proporcionan detalles sobre el entrenamiento original del modelo base (tokens, composición del dataset, RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto en cinco idiomas: inglés, chino, español, ruso y japonés.
- Soporte de tool calling / function calling mediante el parser `qwen3_coder` en SGLang.
- Soporte de razonamiento con el parser `qwen3` para salidas de tipo thinking.
- Decodificación especulativa EAGLE/NEXTN usando la capa MTP nativa conservada, con hasta 4 tokens de borrador por paso.
- Procesamiento de contexto largo de hasta 131.072 tokens, con un pool físico de 129.241 tokens.
- No soporta entrada de imagen o vídeo: es un checkpoint exclusivamente de texto.

## Casos de uso

- Servicio de chat multilingüe en local: el modelo puede gestionar conversaciones en español, inglés, chino, ruso y japonés con contexto largo, ideal para aplicaciones de atención al cliente en una RTX 5090.
- Generación de código asistida por tool calling: gracias al parser `qwen3_coder`, se puede integrar en pipelines de desarrollo donde el modelo invoca funciones externas para ejecutar pruebas o consultar repositorios.
- Análisis de documentos extensos: con una ventana de 131K tokens, permite resumir contratos, informes o artículos completos sin necesidad de fragmentar el texto.
- Razonamiento con modo thinking: el soporte del parser `qwen3` permite activar cadenas de razonamiento explícitas para tareas de análisis complejo o planificación.
- Despliegue de bajo coste en GPU de consumo: al caber en 32 GB VRAM, es una opción viable para laboratorios o equipos sin acceso a GPUs de datacenter.
- Investigación en decodificación especulativa: la conservación de la capa MTP nativa permite experimentar con EAGLE/NEXTN y medir mejoras de latencia en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones de rendimiento de inferencia realizadas en una RTX 5090 con una única petición activa. Estos valores dependen del prompt y de la tasa de aceptación de MTP, y no constituyen garantías universales de rendimiento.

| Workload | Resultado |
|---|---|
| Harness de prosa emparejada, decodificación streaming mediana (3 ejecuciones) | 138,7 tokens/s |
| Ejecuciones sintéticas de 512 tokens tras warm-up, end-to-end | 121,3–128,3 tokens/s |
| Prompt de 100.008 tokens + 8 tokens de salida | 26,143 s |
| Prompt de 128.008 tokens + 8 tokens de salida | 40,365 s |
| Pool físico de tokens residentes | 129.241 tokens |

## Requisitos de hardware

- VRAM estimada: aproximadamente 27,6 GB en el perfil cualificado de 131K.
- GPU recomendada: NVIDIA RTX 5090 de 32 GB. No se ha validado en otras GPUs.
- Sin offload de pesos a CPU; el modelo completo reside en VRAM.
- Despliegue con SGLang, usando el backend de atención FlashInfer, caché KV en FP8 E4M3 y estrategia de prefill fragmentado (`chunked-prefill-size 1024`).
- Se requiere el build de SGLang fijado en el repositorio `shiftedx/Qwen3.8-27B-RTX5090-SGLang-DFlash`; no usar la opción `--language-only` porque es incompatible con esta configuración.
- Memoria host: aproximadamente 4,9 GiB de RAM para el contenedor SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Visión | Licencia |
|---|---|---|---|---|---|
| Jackrong/Qwopus3.8-27B-Flash (base) | No disponible | No disponible | Sin cuantizar (original) | Sí | Apache 2.0 |
| Shiftedx/Qwopus3.8-27B-Flash-NVFP4-MTP (este) | 14.732.516.864 | 131.072 | NVFP4 + MTP | No | Apache 2.0 |
| Shiftedx Qwen3.8-27B MLX (colección MLX) | No disponible | No disponible | MXFP4 / MXFP8 | No | Apache 2.0 |

La comparativa se basa únicamente en la información disponible. El modelo base es multimodal, mientras que esta versión y la colección MLX son solo texto. No hay datos de rendimiento comparables publicados para el base ni para las conversiones MLX.

## Limitaciones y advertencias

- El checkpoint no soporta entrada de imagen o vídeo; el encoder de visión ha sido eliminado intencionadamente.
- La cuantización NVFP4 es experimental y requiere el perfil SGLang fijado; cualquier otro runtime puede fallar o producir resultados incorrectos.
- No se ha completado una evaluación amplia de calidad post-cuantización. Es necesario validar la calidad en el caso de uso concreto antes de producción.
- SGLang informa de que no hay factores de escala KV FP8 explícitos, por lo que se usa un fallback de 1.0. Esto puede afectar a la calidad en contextos largos.
- El pool físico de tokens es de 129.241, inferior al contexto lógico de 131.072. La suma de prompt y salida generada debe caber en ese pool.
- Se recomienda usar el repositorio de scripts reproducibles y el build de SGLang fijado para evitar incompatibilidades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shiftedx/Qwopus3.8-27B-Flash-NVFP4-MTP
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Repositorio de despliegue y scripts: https://github.com/shiftedx/Qwen3.8-27B-RTX5090-SGLang-DFlash
- Colección de conversiones MLX de Shiftedx: https://huggingface.co/collections/Shiftedx/qwen38-27b-mlx-and-mtplx
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
