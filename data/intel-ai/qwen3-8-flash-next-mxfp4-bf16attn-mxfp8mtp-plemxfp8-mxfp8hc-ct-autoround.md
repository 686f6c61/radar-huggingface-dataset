# intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-MXFP8MTP-PLEMXFP8-MXFP8HC-CT-AutoRound

## Resumen

Este repositorio contiene una compilación en precisión mixta del modelo Qwen3.8-Flash-Next, publicada por intel-ai mediante la herramienta Intel auto-round en modo RTN (round-to-nearest) sin calibración de datos (`--model_free`). El modelo base es un transformer multimodal de tipo image-text-to-text desarrollado por Qwen, con aproximadamente 180 000 millones de parámetros totales, y esta build aplica cuantización MXFP4 a los expertos enrutados del MoE y MXFP8 a las proyecciones MTP, a la tabla de embeddings n-gram PLE y a las tres GEMM de hyper-connection, manteniendo en BF16 la atención, el indexador disperso QSA, el router, el experto compartido, el tower de visión y `lm_head`.

La relevancia de esta ficha radica en que demuestra una ruta práctica para reducir el peso del checkpoint a unos 130,6 GB (frente a la huella BF16 del modelo base) sin degradar de forma apreciable las métricas de evaluación: la media de PIQA, HellaSwag, MMLU y GSM8K se sitúa en 83,51 frente a 83,62 del BF16 de referencia. Es, por tanto, un artefacto orientado a despliegue en producción con vLLM, no un modelo nuevo entrenado desde cero.

Conviene subrayar que se trata de una cuantización de terceros (Intel) sobre un modelo de Qwen, con licencia comunitaria qwen-community-1.0 y requisitos de runtime muy específicos: vLLM 0.32.1rc1.dev253 o superior con soporte `qwen4_exp`, TP=1 obligatorio y, opcionalmente, un parche para ejecutar las GEMM de hyper-connection como MXFP8 real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (48 capas decodificadoras), atención híbrida (`self_attn` + `linear_attn`), indexador disperso QSA, hyper-connections y bloque MTP |
| Parametros totales | 179 999 981 459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A4, grupo 32, escalas E8M0) en expertos enrutados `gate_proj`/`up_proj`/`down_proj`; MXFP8 (W8A8, grupo 32) en proyecciones MTP, tabla PLE y GEMM de hyper-connection; BF16 en atención, QSA, experto compartido, router, embeddings, `lm_head`, visión y normas; KV cache sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors con metadatos `compressed-tensors`; sidecar `hc_mxfp8_true_fp8_sidecar.safetensors` con códigos FP8 y escalas UE8M0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer decoder-only multimodal con mezcla de expertos. La build cuantizada conserva 48 capas decodificadoras en las que los expertos enrutados (73 728 tensores, el 67 % de los parámetros) se almacenan en MXFP4, lo que explica que el checkpoint ocupe aproximadamente 2,8 veces menos que su equivalente BF16. Las proyecciones del bloque MTP (1 536 tensores), la tabla de embeddings n-gram PLE (128 shards en `float8_e4m3fn` con escalas UE8M0 por cada 32 columnas, el 28 % de los parámetros) y las tres GEMM de hyper-connection (`input_mix_weight_down`, `input_mix_weight_up`, `block_inject_weight`, 294 tensores en total) se cuantizan a MXFP8.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica destacable de esta build es el tratamiento de las hyper-connections: como vLLM construye esas proyecciones con `quant_config=None` y fusiona down+inject en un `MergedColumnParallelLinear`, el checkpoint almacena los valores BF16 tras un round-trip cuantizar-descuantizar que reproduce exactamente el error de la cuantización MXFP8, y ofrece una variante `quantized_hc_fp8/` que, con un parche sobre vLLM, ejecuta GEMM MXFP8 reales mediante FlashInfer CuTeDSL.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con parser de razonamiento `qwen3` disponible en vLLM.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), gracias al tower de visión conservado en BF16.
- Razonamiento matemático y resolución de problemas tipo GSM8K, con 96,82 de strict-match en la evaluación publicada.
- Conocimiento general y sentido común medidos vía MMLU (86,84) y PIQA (82,05).
- Soporte de decodificación especulativa mediante el bloque MTP (multi-token prediction) incluido en el checkpoint.
- Atención híbrida con capas `linear_attn` e indexador disperso QSA para eficiencia en contextos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo acepta imagen y texto y mantiene diálogo multi-turno, por lo que encaja en interfaces de atención al usuario donde se adjuntan capturas, diagramas o documentos escaneados junto a la consulta.
- Análisis de documentos técnicos con componente visual: la conservación del tower de visión en BF16 permite extraer información de planos, gráficos o tablas sin la degradación que sufriría una cuantización agresiva de esa torre.
- Razonamiento matemático asistido: con 96,82 en GSM8K, es adecuado para tutores o validadores de problemas aritméticos y de varios pasos en entornos educativos o financieros.
- Despliegue en una sola GPU de gama alta: al requerir TP=1 y mantener solo ~70 GiB de pesos en GPU (la tabla PLE reside en memoria host pinned), puede servirse en un nodo con una H100 de 80 GB o similar, sin necesidad de multi-GPU.
- Generación aumentada por recuperación (RAG) sobre corpus extensos: la atención híbrida con capas lineales y el indexador QSA están pensados para contextos largos, lo que favorece la inyección de muchos fragmentos recuperados.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de MXFP4/MXFP8 frente a BF16 en un modelo de 180 B, con cifras publicadas de PIQA, HellaSwag, MMLU y GSM8K.
- Servicio de inferencia con vLLM en producción: la integración con `compressed-tensors` y el parser de razonamiento `qwen3` permiten levantar un endpoint compatible con la API de OpenAI para aplicaciones internas.

## Benchmarks y rendimiento

Evaluación con `lm_eval` + vLLM, TP=1, `enable_thinking=false`, `language_model_only=true`, semilla 42; PIQA, HellaSwag y MMLU por loglikelihood; GSM8K con plantilla de chat y 5-shot.

| Benchmark | Esta build (HC = MXFP8) | Referencia MXFP4 (HC = BF16) | Base BF16 |
|---|---:|---:|---:|
| PIQA (acc) | 82,05 | 81,83 | 81,94 |
| HellaSwag (acc) | 68,32 | 68,32 | 69,27 |
| MMLU (acc) | 86,84 | 86,56 | 86,52 |
| GSM8K (strict-match) | 96,82 | 96,36 | 96,74 |
| **Media** | **83,51** | **83,27** | **83,62** |

Con el parche y el checkpoint de hyper-connection en FP8 real, los resultados se mantienen dentro del ruido (82,48 / 68,27 / 86,75 / 96,74; media 83,56) y la huella en GPU baja 0,63 GiB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 70 GiB de pesos en GPU según la model card; la tabla PLE (28 % de los parámetros) se mantiene en memoria host pinned (`weight_device=cpu, pinned=True`), por lo que el total de memoria del sistema debe cubrir el checkpoint completo de 130,6 GB.
- GPU recomendadas: H100 de 80 GB para un único dispositivo; A100 de 80 GB como alternativa; no se documenta soporte en GPUs consumer de 24 GB.
- Cabe en consumer GPU: no, según los requisitos publicados (≈70 GiB en GPU más la tabla PLE en host).
- Opciones de despliegue: vLLM 0.32.1rc1.dev253 o nightly posterior con `qwen4_exp` y `Qwen4ExpPLEMxfp8EmbeddingMethod`; no se documenta soporte en llama.cpp, Ollama ni TGI.
- Tensor parallelism: TP=1 obligatorio tal como se distribuye, por un defecto de scale-swizzle en el MoE MXFP8 del bloque MTP con TP>1.
- Variables de entorno relevantes: `NCCL_NVLS_ENABLE=0` si no se puede enlazar NVLink-SHARP; `CUDA_HOME` apuntando al toolkit CUDA 13 incluido en el venv; `VLLM_DISABLED_KERNELS=FlashInferCutedslMxfp8LinearKernel` para evitar el JIT de CuTeDSL.
- Latencia y throughput: no disponibles; se advierte de un pico de latencia en el primer token con la variante FP8 real por compilación JIT de CuTeDSL por forma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (intel-ai) | ~180 B | no disponible | safetensors, MXFP4/MXFP8/BF16 mixto | qwen-community-1.0 | Hugging Face, 0 descargas |
| intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-MXFP8MTP-PLEMXFP8-CT-AutoRound | ~180 B | no disponible | safetensors, MXFP4/MXFP8/BF16 (HC en BF16) | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (base) | ~180 B | no disponible | safetensors, BF16 | qwen-community-1.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos alternativos de otros fabricantes con arquitectura y tamaño equiparables.

## Limitaciones y advertencias

- Licencia `qwen-community-1.0`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la model card remite explícitamente a la licencia del modelo original.
- Sesgos: no se documentan en la información proporcionada; al derivar de un modelo base de Qwen, hereda los sesgos de sus datos de entrenamiento, no auditados aquí.
- Riesgo de alucinación: no cuantificado en la model card; las métricas publicadas no incluyen evaluaciones de factualidad ni de calibración.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe más allá de lo que ofrezca el modelo base.
- Restricción de despliegue: TP=1 obligatorio; con TP>1 el MoE MXFP8 del bloque MTP provoca `RuntimeError: shape '[2560, 10]' is invalid for input of size 30720`.
- Dependencia de versiones concretas de vLLM y de un método de embedding PLE específico; builds estándar no podrán cargar la tabla MXFP8.
- La variante de hyper-connection en FP8 real requiere aplicar un parche al paquete vLLM instalado y provoca un pico de latencia por compilación JIT de CuTeDSL en el primer uso de cada forma.
- El checkpoint almacena las GEMM de hyper-connection como valores BF16 round-tripped, no como FP8 nativo, salvo que se use el sidecar y el parche; conviene tenerlo en cuenta al auditar la precisión efectiva.
- Sin descargas ni likes en el momento de la consulta, y creado el 2026-11-02: no hay evidencia de comunidad ni de validación independiente.
- No se han publicado resultados de benchmarks de tool calling, agentes, visión o multilingüismo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-MXFP8MTP-PLEMXFP8-MXFP8HC-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de referencia (HC en BF16): https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16Attn-MXFP8MTP-PLEMXFP8-CT-AutoRound
- Intel auto-round: https://github.com/intel/auto-round
- Paper de referencia citado en los tags (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
- Licencia: LICENSE dentro del repositorio de Hugging Face
