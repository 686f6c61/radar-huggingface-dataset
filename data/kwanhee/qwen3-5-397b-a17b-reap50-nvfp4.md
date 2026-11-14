# kwanhee/Qwen3.5-397B-A17B-REAP50-NVFP4

## Resumen

Qwen3.5-397B-A17B-REAP50-NVFP4 es una variante podada y cuantizada del modelo MoE Qwen/Qwen3.5-397B-A17B, publicada por el usuario kwanhee en Hugging Face. Se trata de un checkpoint experimental orientado a investigación: aplica REAP (expert pruning) sobre los expertos enrutados del modelo base, conservando 256 de los 512 expertos por capa (top-10 routing), y cuantiza los expertos restantes a NVFP4 denso (W4A4, group size 16) mediante compressed-tensors. El resto de componentes (atención, linear attention, shared experts, gates del router, normas, embeddings y `lm_head`) permanece en BF16.

El resultado es un modelo de 203.465.917.936 parámetros reales en safetensors (frente a los 397B nominales del base), con un repositorio de 129,2 GB y pipeline image-text-to-text, lo que confirma capacidades multimodales heredadas del modelo original. La motivación declarada por el autor es servir como checkpoint de referencia para la réplica de un artículo sobre MoE-SQ (arXiv 2610.02241), con un coste aproximado de 2,25 bits por peso de experto original.

Su relevancia es fundamentalmente metodológica: demuestra una ruta de compresión agresiva (poda del 50% de expertos más cuantización FP4) sobre un MoE multimodal de gran escala, con una pérdida medida de 2,54 puntos en el promedio OpenLLM v1 respecto al checkpoint podado sin cuantizar. No es un modelo pensado para producción general, sino una pieza de evaluación para técnicas de compresión de MoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe) con atención y linear attention; expertos enrutados podados y cuantizados a NVFP4 |
| Parámetros totales | 203.465.917.936 (safetensors reales); base nominal 397B |
| Parámetros activos | no disponible (el base es A17B; tras poda y cuantización no se publica el recuento activo exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 denso W4A4 (group size 16, `nvfp4-pack-quantized` de compressed-tensors) en expertos enrutados; BF16 en atención, linear attention, shared experts, router gates, normas, embeddings y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), cargable con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 512 expertos enrutados por capa y routing top-k, que combina capas de atención con capas de linear attention y shared experts. Sobre esa arquitectura, esta variante aplica dos etapas de compresión. La primera es una selección de expertos con `REAPPruningModifier` de llm-compressor (sparsity 0.5), calibrada con 512 muestras de 4.096 tokens, que reduce a 256 expertos por capa y ajusta el routing a top-10. La segunda es una cuantización NVFP4 densa del modelo podado mediante el pipeline MoE-SQ, con 8.192 muestras de 4.096 tokens.

Ambas etapas de calibración usan el mismo corpus mixto: 10% de `neuralmagic/LLM_compression_calibration`, 45% de `open-thoughts/OpenThoughts-114k` y 45% de una muestra de `HuggingFaceFW/fineweb-edu` (sample-10BT), con las mismas semillas y renderizadores. No se documenta entrenamiento adicional ni RLHF/DPO específico para este checkpoint: es una transformación post-entrenamiento del modelo base. El autor advierte que las evaluaciones se realizaron antes de un arreglo de vLLM (2026-10-01) para checkpoints MoE NVFP4 con escalas globales gate/up no atadas; dado que llm-compressor normalmente ata esas escalas, se espera que este checkpoint no esté afectado, pero no se ha reverificado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5.
- Procesamiento image-text-to-text: entrada conjunta de imágenes y texto, según el pipeline declarado.
- Razonamiento multi-paso y matemáticas, presumiblemente reforzado por el corpus de calibración OpenThoughts.
- Generación de código, aunque no se documenta explícitamente en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes: no documentado.
- Modo thinking: no documentado.
- Despliegue en vLLM como MoE NVFP4 de compressed-tensors, con backend `flashinfer_cutedsl_batched` (DP8 + EP sobre DeepEP low-latency).

## Casos de uso

- Investigación en compresión de MoE: servir como checkpoint de referencia para reproducir y contrastar los resultados de la réplica de MoE-SQ (arXiv 2610.02241), comparando REAP50 NVFP4 frente a REAP50 BF16.
- Evaluación de técnicas de poda de expertos: analizar el impacto de conservar 256 de 512 expertos por capa con top-10 routing en tareas de razonamiento y conocimiento general.
- Estudio de cuantización FP4 en modelos de gran escala: medir la degradación de NVFP4 W4A4 con group size 16 sobre expertos enrutados mientras el resto del modelo permanece en BF16.
- Benchmarking de serving con vLLM: validar el backend `flashinfer_cutedsl_batched` con paralelismo DP8 + EP sobre DeepEP en despliegues multi-GPU.
- Experimentos de eficiencia memoria/throughput: comparar el repo de 129,2 GB frente al base BF16 para estimar ahorros de VRAM en clústeres con H100/H200.
- Investigación multimodal con modelos comprimidos: evaluar si las capacidades image-text-to-text del base se preservan tras poda y cuantización agresivas.
- Reproducibilidad de pipelines de calibración: reutilizar la receta de dos etapas (REAP + MoE-SQ) sobre otros MoE con corpus mixto similar.

## Benchmarks y rendimiento

| Modelo | OpenLLM v1 average (vLLM) |
|---|---|
| REAP50 NVFP4 (este checkpoint) | 76,90 (3 semillas: 77,16 / 76,74 / 76,80) |
| REAP50 BF16 (podado, sin cuantizar) | 79,44 |

No se han publicado en la información disponible resultados desagregados por tarea (MMLU, HumanEval, GSM8K u otras), ni comparaciones con el modelo base sin podar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 129,2 GB en safetensors; se requiere al menos esa cantidad agregada de VRAM para cargar los pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: clústeres multi-GPU con H100/H200 o B200; el autor indica servir con DP8 + EP sobre DeepEP low-latency, lo que implica al menos 8 GPUs de datacenter.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer típicas; no se documenta una variante GGUF.
- Opciones de despliegue: vLLM con backend `flashinfer_cutedsl_batched` (recomendado por el autor); carga con transformers/compressed-tensors. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OpenLLM v1 avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-REAP50-NVFP4 (este) | 203,5B reales (base 397B) | no disponible | 76,90 | no disponible | Hugging Face (kwanhee) |
| Qwen3.5-397B-A17B-REAP50 BF16 (podado) | no disponible | no disponible | 79,44 | no disponible | Referenciado en la model card |
| Qwen/Qwen3.5-397B-A17B (base) | 397B nominales (A17B) | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

No se dispone de datos de benchmarks del modelo base en la información proporcionada, por lo que no es posible cuantificar la pérdida total respecto al original.

## Limitaciones y advertencias

- Pérdida medible de calidad: 2,54 puntos en OpenLLM v1 promedio respecto al checkpoint podado sin cuantizar (76,90 frente a 79,44).
- Evaluaciones no reverificadas tras el arreglo de vLLM del 2026-10-01 para checkpoints MoE NVFP4 con escalas gate/up no atadas; el autor espera que no afecte, pero no lo ha confirmado.
- Licencia no disponible: no se puede verificar si permite uso comercial; hereda presumiblemente las condiciones del modelo base Qwen, que deben consultarse por separado.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Tool calling, agentes y modo thinking no documentados para este checkpoint.
- Riesgo de alucinación no cuantificado; al ser un modelo comprimido, puede amplificarse respecto al base.
- Sesgos conocidos no documentados.
- Checkpoint experimental con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Requiere infraestructura multi-GPU de datacenter y un backend específico de vLLM; no apto para entornos consumer.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/kwanhee/Qwen3.5-397B-A17B-REAP50-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Artículo referenciado (MoE-SQ): arXiv 2610.02241
- llm-compressor (REAPPruningModifier): no disponible en la información proporcionada
- Repositorio de calibración `neuralmagic/LLM_compression_calibration`: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- Dataset `open-thoughts/OpenThoughts-114k`: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset `HuggingFaceFW/fineweb-edu`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
