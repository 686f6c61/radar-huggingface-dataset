# hossain0909/Keural-Nova-v1.2-experimental-NVFP4-unsloth

## Resumen

Keural Nova v1.2 experimental NVFP4 (unsloth) es una cuantización en precisión mixta NVFP4 del modelo Keural Nova v1.2, desarrollado por MKD y cuantizado por el usuario hossain0909 siguiendo exactamente la receta del checkpoint público `unsloth/Qwen3.6-35B-A3B-NVFP4`. El modelo base es un MoE de la familia Qwen3.5/Qwen3.6 con 22.171 millones de parámetros totales, orientado a generación de texto conversacional y a tareas de imagen-texto-a-texto (multimodal).

El objetivo de esta versión es servir el modelo con alto rendimiento en GPUs NVIDIA Blackwell (B200, GB200, RTX 50xx) mediante vLLM, reduciendo el tamaño de 67 GB en bf16 a 24,8 GB sin sacrificar demasiada precisión. Para lograrlo, se mantiene FP8 en capas sensibles (atención, lm_head, expertos de las últimas 8 capas) y bf16 en componentes críticos como las puertas del router, la torre de visión y el módulo MTP, mientras que el grueso de los expertos se cuantiza a FP4.

Es relevante porque demuestra el flujo de trabajo de cuantización NVFP4 con `llm-compressor` sobre arquitecturas MoE híbridas con atención lineal, y porque ofrece una ventana de contexto nativa de 256K tokens con soporte de tool calling en formato XML de Qwen, lo que lo hace atractivo para agentes y aplicaciones de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (qwen3_5_moe) con atención lineal, torre de visión y MTP |
| Parametros totales | 22.171.948.400 (~22,2 B, dato real de safetensors) |
| Parametros activos | no disponible (el modelo base Qwen3.6-35B-A3B sugiere ~3B activos, pero no consta en la ficha) |
| Longitud de contexto | 262.144 tokens (256K nativos; YaRN solo para >256K) |
| Tipos de cuantizacion | NVFP4 (FP4) en expertos de las primeras 32 capas; FP8 en atención, lm_head y expertos de las capas 32-39; bf16 en router, proyecciones line-attn a/b/norm, torre de visión y MTP |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 (hereda la licencia del base Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors con esquema compressed-tensors (mixed-precision), servible nativamente por vLLM |

## Arquitectura y entrenamiento

El modelo base, Keural Nova v1.2 experimental, es un modelo de mezcla de expertos (MoE) de la familia Qwen3.5/3.6 con 40 capas (índices 0-39), atención híbrida que combina atención estándar con proyecciones de atención lineal (in_proj_qkv/z, out_proj, in_proj_a/b/norm), una torre de visión para capacidades multimodales y un módulo MTP (multi-token prediction). La cuantización aplica un esquema dinámico de precisión mixta: los expertos de las capas 0-31 y los expertos compartidos, que concentran la mayor parte de los parámetros, se cuantizan a NVFP4; la atención (q/k/v/o), las proyecciones de atención lineal, el lm_head y los expertos de las capas 32-39 permanecen en FP8; y las puertas del router, las proyecciones a/b/norm de la atención lineal, la torre de visión y el MTP se mantienen en bf16.

No se han publicado detalles del proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible. La cuantización se realizó con la herramienta `llm-compressor` (formato compressed-tensors), calibrando con 512 muestras de la mezcla SFT de Keural Nova v1.2 con longitud de secuencia 2048, replicando exactamente los `config_groups` y la lista `ignore` de la receta de unsloth.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, modo non-thinking por defecto).
- Capacidades multimodales de imagen-texto-a-texto: la torre de visión se mantiene en bf16, por lo que la entrada de imágenes funciona tras la cuantización.
- Tool calling / function calling en formato XML de Qwen (`qwen3_xml`), con `--enable-auto-tool-choice` en vLLM.
- Contexto nativo de 256K tokens, adecuado para agentes y razonamiento multi-paso sobre documentos largos.
- Soporte de idiomas coreano e inglés.
- Modo thinking disponible (el modo por defecto es non-thinking, según la model card).
- MTP (multi-token prediction), que puede acelerar la decodificación en serving.

## Casos de uso

- Agentes con contexto largo: la ventana nativa de 256K tokens permite mantener historiales de conversación extensos y documentos completos sin RAG, con soporte de tool calling en XML para orquestar herramientas en flujos multi-paso.
- Serving de alto rendimiento en Blackwell: el formato NVFP4/FP8 mixed-precision reduce el footprint de 67 GB a 24,8 GB, permitiendo servir el modelo en 2 GPUs con tensor parallelism y alto throughput en vLLM.
- Chatbots bilingües coreano-inglés: el modelo está etiquetado para ko y en, adecuado para asistentes conversacionales en ambos mercados.
- Análisis de documentos con imágenes: al conservar la torre de visión en bf16, puede procesar capturas, gráficos y documentos escaneados combinados con texto.
- Integración en pipelines de automatización: el parser de tool calls de Qwen3 XML permite conectarlo a APIs y funciones internas en flujos de trabajo automatizados.
- Investigación en cuantización: sirve como referencia reproducible de la receta NVFP4 mixed-precision de unsloth sobre arquitecturas MoE híbridas, con script de verificación incluido (`scripts/nvfp4_verify_vllm.py`).
- Despliegue económico en estaciones de trabajo con RTX 50xx: los 24,8 GB del modelo pueden alojarlo en configuraciones de consumidor de gama alta con FP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la precisión mixta FP8/FP4 "típicamente pierde menos" que la variante NVFP4 pura, y recomienda validar contra el modelo base en bf16 con `scripts/nvfp4_verify_vllm.py` sobre hardware Blackwell.

## Requisitos de hardware

- VRAM estimada: 24,8 GB solo de pesos; con contexto de 256K tokens y KV cache, se recomienda al menos 48 GB totales (2 GPUs con tensor-parallel-size 2 según la propia model card).
- GPUs recomendadas: NVIDIA Blackwell con núcleos tensor FP4 — B200, GB200, RTX 5090 / serie RTX 50xx. Las GPUs Hopper (H100, A100) carecen de kernels FP4, por lo que no obtienen el beneficio de velocidad/memoria.
- Consumer GPUs: cabe en una RTX 5090 (32 GB) para inferencia con contexto moderado; para el contexto máximo de 262K tokens se recomienda multi-GPU (2x RTX 5090 o superior).
- Despliegue: vLLM con formato compressed-tensors (servido nativamente). No consta soporte para llama.cpp, Ollama o TGI; el formato NVFP4 mixed-precision está orientado específicamente a vLLM.
- Comando de serving documentado: `vllm serve ... --tensor-parallel-size 2 --max-model-len 262144 --tool-call-parser qwen3_xml --enable-auto-tool-choice`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keural Nova v1.2 NVFP4 (unsloth, este) | ~22,2 B totales | FP4/FP8/bf16 mixed | 256K | Apache-2.0 | HuggingFace, vLLM en Blackwell |
| Keural Nova v1.2 experimental (base bf16) | ~22,2 B totales | bf16 (67 GB) | 256K | Apache-2.0 | HuggingFace |
| Keural Nova v1.2 experimental NVFP4 (puro) | ~22,2 B totales | NVFP4 puro | 256K | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.6-35B-A3B-NVFP4 | ~35 B totales (~3 B activos) | FP4/FP8 mixed | no disponible | no disponible | HuggingFace |

La variante unsloth de este modelo es ligeramente mayor (24,8 GB) que la NVFP4 pura porque conserva capas sensibles en FP8, a cambio de una mejor preservación de la precisión.

## Limitaciones y advertencias

- Idiomas limitados: el modelo está etiquetado solo para coreano e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Requiere hardware Blackwell: sin GPUs con núcleos tensor FP4 (B200, GB200, RTX 50xx) no hay beneficio de FP4; en Hopper o Ampere el modelo puede no ser servible o perder la ventaja de la cuantización.
- Pérdida de precisión no cuantificada: no hay benchmarks publicados que midan la degradación respecto al bf16; es obligatorio validar con el script de verificación antes de producción.
- Es una cuantización experimental de un tercero (hossain0909) sobre un modelo experimental de MKD, con muy poca tracción comunitaria (178 descargas, 1 like): el soporte y la fiabilidad son limitados.
- Riesgo de alucinación y sesgos: no disponible información específica; al heredar de la familia Qwen3.6, aplican las cautelas habituales de LLMs generativos.
- El modo por defecto es non-thinking; si se necesita razonamiento extendido hay que habilitarlo explícitamente.
- Contexto >256K requiere YaRN, lo que puede degradar la calidad; la ventana nativa garantizada es de 256K tokens.
- Licencia Apache-2.0: permite uso comercial, pero hereda la licencia del base Qwen/Qwen3.6-35B-A3B; conviene revisar los términos del modelo base original.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hossain0909/Keural-Nova-v1.2-experimental-NVFP4-unsloth
- Modelo base (bf16): https://huggingface.co/mkd-hossain/Keural-Nova-v1.2-experimental
- Variante NVFP4 pura: https://huggingface.co/mkd-hossain/Keural-Nova-v1.2-experimental-NVFP4
- Receta de referencia (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio de MKD: https://mkd.kr
