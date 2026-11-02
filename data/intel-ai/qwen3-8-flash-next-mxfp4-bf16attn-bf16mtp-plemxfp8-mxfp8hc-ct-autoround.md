# intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-BF16MTP-PLEMXFP8-MXFP8HC-CT-AutoRound

## Resumen

Este modelo es una compilación cuantizada en precisión mixta del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el equipo intel-ai. Se ha generado con la herramienta Intel auto-round mediante cuantización RTN (round-to-nearest) en modo `--model_free`, aplicando un esquema que combina MXFP4 y MXFP8 sobre distintas partes de la red. El resultado es un checkpoint de aproximadamente 180 000 millones de parámetros totales que ocupa 133,1 GB en el repositorio, unas 2,7 veces menos que su equivalente en BF16, y que mantiene una calidad prácticamente idéntica a la del modelo original según las evaluaciones publicadas.

La relevancia de esta ficha radica en que muestra una estrategia de cuantización granular y selectiva: los expertos enrutados del MoE se comprimen a MXFP4 (W4A4, grupo 32, escalas E8M0), la tabla de embeddings n-gram PLE y las tres GEMM de hiper-conexión se llevan a MXFP8 (W8A8, grupo 32), mientras que la capa MTP de borrador, la atención, el indexador disperso QSA, el router MoE, los embeddings de tokens, el `lm_head`, la torre de visión y todas las normas se conservan en BF16. La caché KV no se cuantiza.

Es un modelo multimodal de tipo image-text-to-text (pipeline `image-text-to-text`) orientado a despliegue en vLLM, con soporte de decodificación especulativa mediante la capa MTP y con un parche obligatorio para que las GEMM de hiper-conexión se ejecuten realmente como MXFP8. La licencia es `qwen-community-1.0`, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (self_attn y linear_attn), indexador disperso QSA, hiper-conexiones y capa MTP de borrador; pipeline image-text-to-text |
| Parametros totales | 179 999 981 459 (aprox. 180 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A4, grupo 32, escalas E8M0) en expertos enrutados; MXFP8 (W8A8, grupo 32) en tabla PLE y GEMM de hiper-conexión; BF16 en atención, MTP, router, embeddings, lm_head, torre de visión y normas; caché KV sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo Mixture-of-Experts con 48 capas de decodificador. Cada capa combina atención (`self_attn` y `linear_attn`), un indexador disperso QSA, un router MoE (`mlp.gate`), un experto compartido con su compuerta y 512 expertos enrutados por capa, además de tres proyecciones de hiper-conexión (`input_mix_weight_down`, `input_mix_weight_up`, `block_inject_weight`). Incluye además una torre de visión, una tabla de embeddings n-gram PLE de 128 fragmentos y una capa MTP (`Qwen4ExpMTP`) que actúa como modelo borrador para decodificación especulativa.

Esta compilación concreta no reentrena el modelo: aplica cuantización post-entrenamiento con auto-round 0.16.1 y compressed-tensors 0.17.0. Los 73 728 tensores de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) se cuantizan a MXFP4, lo que representa el 67 % de los parámetros y explica la mayor parte de la reducción de tamaño. La tabla PLE (28 % de los parámetros) y las 294 tensores de hiper-conexión se cuantizan a MXFP8 con escalas UE8M0 por cada 32 columnas. La capa MTP, con sus 512 expertos enrutados (1 536 tensores), se restaura a BF16 para evitar un defecto de swizzle de escalas en vLLM cuando se usa TP>1. La innovación técnica destacable es el uso de MXFP8 real (códigos FP8 con escalas UE8M0) en las GEMM de hiper-conexión, que requieren un parche específico sobre vLLM para ejecutarse como tales; sin el parche, esas proyecciones se omiten como BF16 sin cuantizar.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Razonamiento con modo thinking, controlable mediante `enable_thinking` y con parser `qwen3` en vLLM.
- Razonamiento matemático y resolución de problemas (evaluado en GSM8K).
- Conocimiento general y respuesta a preguntas (evaluado en MMLU).
- Decodificación especulativa mediante la capa MTP en BF16, con `num_speculative_tokens` configurable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de gran tamaño en una sola GPU: gracias a que la tabla PLE reside en memoria de host fijada, solo unos 70 GiB de pesos van a la GPU, lo que permite servir el modelo con `--tensor-parallel-size 1` en hardware de gama alta sin necesidad de particionar.
- Asistente conversacional con imágenes: la torre de visión en BF16 y el pipeline image-text-to-text permiten construir un asistente que recibe capturas, diagramas o documentos escaneados y responde en lenguaje natural con contexto multi-turno.
- Razonamiento matemático y tutoría automatizada: los resultados en GSM8K (96,66 en strict-match) lo hacen adecuado para generar explicaciones paso a paso y resolver problemas aritméticos en entornos educativos.
- Evaluación comparativa de cuantización en investigación: sirve como referencia reproducible para estudiar el impacto de MXFP4/MXFP8 selectivo frente a BF16, con cifras publicadas de PIQA, HellaSwag, MMLU y GSM8K.
- Generación aumentada con recuperación (RAG) multimodal: la ventana de contexto no está documentada, pero la combinación de visión y texto permite indexar documentos con figuras y responder preguntas sobre ellos.
- Servicio de inferencia de baja latencia con decodificación especulativa: la capa MTP en BF16 permite activar `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` para reducir la latencia por token en producción.
- Prototipado de pipelines de agentes con razonamiento: el modo thinking y el parser `qwen3` permiten separar la traza de razonamiento de la respuesta final en aplicaciones de agentes.

## Benchmarks y rendimiento

Evaluación con `lm_eval` + vLLM, TP=1, `enable_thinking=false`, `language_model_only=true`, semilla 42. PIQA, HellaSwag y MMLU usan loglikelihood; GSM8K usa la plantilla de chat con 5-shot.

| Benchmark | Este modelo (MTP = BF16) | Base BF16 |
|---|---:|---:|
| PIQA (acc) | 82,26 | 81,94 |
| HellaSwag (acc) | 68,28 | 69,27 |
| MMLU (acc) | 86,63 | 86,52 |
| GSM8K (strict-match) | 96,66 | 96,74 |
| **Media** | **83,46** | **83,62** |

La capa MTP es un modelo borrador separado (`Qwen4ExpMTP`) que solo se instancia al activar decodificación especulativa, por lo que no participa en estas cifras. Las puntuaciones miden la ruta principal con atención en BF16, expertos en MXFP4, PLE en MXFP8 e hiper-conexión en MXFP8.

## Requisitos de hardware

- VRAM estimada: unos 70 GiB de pesos en GPU, ya que la tabla PLE (128 fragmentos MXFP8) reside en memoria de host fijada.
- GPU recomendadas: no se especifican modelos concretos en la información; por el volumen de pesos en GPU se requiere hardware de gama alta con al menos 80 GB de memoria (A100 80 GB, H100 80 GB o similar).
- Cabe en GPU de consumo: no disponible; el volumen de pesos en GPU (~70 GiB) excede la memoria de las GPU de consumo habituales.
- Topología validada: `--tensor-parallel-size 1` obligatorio tal como se distribuye; con TP>1 la MoE MXFP8 de la capa MTP provoca un `RuntimeError: shape '[2560, 10]' is invalid for input of size 30720` por un defecto de swizzle de escalas en vLLM.
- Despliegue: vLLM 0.32.1rc1.dev253 o superior con soporte `qwen4_exp`; requiere el método `Qwen4ExpPLEMxfp8EmbeddingMethod` y el parche `patches/vllm_qwen4exp_hc_mxfp8_linear.patch` para las GEMM de hiper-conexión.
- Entorno validado: torch 2.14.0+cu130, auto-round 0.16.1, compressed-tensors 0.17.0, lm-eval 0.4.13.
- Latencia: las GEMM MXFP8 de hiper-conexión pasan por FlashInfer CuTeDSL, que compila JIT por forma en el primer uso y provoca un pico de latencia en el primer token; se recomienda calentar formas representativas o definir `VLLM_DISABLED_KERNELS=FlashInferCutedslMxfp8LinearKernel` para usar Cutlass.
- En hosts sin NVLink-SHARP multicast disponible, exportar `NCCL_NVLS_ENABLE=0`.
- FlashInfer JIT requiere un toolkit CUDA compatible con torch cu130; apuntar `CUDA_HOME` al toolkit CUDA 13 incluido en el entorno virtual si el `nvcc` del sistema es más antiguo.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (intel-ai, MXFP4/MXFP8) | ~180 000 M | no disponible | qwen-community-1.0 | HuggingFace, vLLM con parche | Cuantización mixta, ~2,7x más pequeño que BF16, media de 83,46 en los benchmarks publicados |
| Qwen/Qwen3.8-Flash-Next (base BF16) | ~180 000 M | no disponible | qwen-community-1.0 | HuggingFace | Referencia de calidad; media de 83,62 en los mismos benchmarks |
| intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-PLEMXFP8-CT-AutoRound | ~180 000 M | no disponible | qwen-community-1.0 | HuggingFace | Variante previa sin cuantización MXFP8 de las GEMM de hiper-conexión y con MTP en BF16 |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Requiere un parche específico sobre vLLM para que las GEMM de hiper-conexión se ejecuten como MXFP8; sin él, esas proyecciones se omiten como BF16 sin cuantizar y el checkpoint no se aprovecha por completo.
- La topología validada es TP=1; con TP>1 se produce un fallo conocido en la MoE MXFP8 de la capa MTP, lo que limita el escalado horizontal en la versión distribuida.
- El primer token tras el arranque puede sufrir un pico de latencia por la compilación JIT de CuTeDSL; es necesario calentar formas o recurrir al kernel Cutlass.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un riesgo inherente a los modelos generativos de esta escala.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de lo que indique el modelo base.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con documentos largos sin verificación previa.
- Licencia `qwen-community-1.0`: es una licencia de tipo "other" con términos comunitarios; deben revisarse las condiciones de uso comercial en el archivo LICENSE antes de un despliegue en producción.
- El modelo es una cuantización post-entrenamiento: no se ha reentrenado ni ajustado, por lo que hereda las limitaciones y sesgos del modelo base.
- La tabla PLE en memoria de host fijada implica que el rendimiento depende del ancho de banda PCIe y de la configuración del host, no solo de la GPU.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-BF16MTP-PLEMXFP8-MXFP8HC-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante previa de referencia: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-PLEMXFP8-CT-AutoRound
- Repositorio de Intel auto-round: https://github.com/intel/auto-round
- Paper de referencia citado en los tags: https://arxiv.org/abs/2309.05516
- Licencia: archivo LICENSE en el repositorio del modelo
