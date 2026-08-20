# eemin/Qwen3.8-27B-NVFP4-MTP-2x16GB

## Resumen

Este modelo es una cuantización NVFP4 del Qwen3.8-27B de Alibaba, creada por eemin con NVIDIA ModelOpt con el objetivo de ejecutar un LLM de 27B parámetros en dos GPU de consumo de 16 GB (RTX 5070 Ti) mediante tensor parallelism en vLLM. El despliegue documentado alcanza una ventana de contexto real de 150.000 tokens (160k en builds anteriores de vLLM) sobre un total de ~32 GB de VRAM repartida entre dos tarjetas, algo que normalmente requeriría una GPU de 40-80 GB. La relevancia del proyecto reside en la receta de despliegue completa: cuantización NVFP4 W4A16 en capas MLP, FP8 en atención y cache KV, preservación de la cabeza MTP (multi-token prediction) en BF16 para decodificación especulativa, y ajustes finos de vLLM (workspace de FlashInfer reducido a 64 MiB, cache mamba en bf16) que permiten alcanzar el contexto máximo en hardware de consumo.

El modelo base es un transformer denso de 27B parámetros con arquitectura híbrida: 48 capas con atención lineal Gated-DeltaNet y 16 capas de atención completa, con `head_dim=256` y una cabeza MTP nativa para decodificación especulativa. El checkpoint cuantizado ocupa ~21 GB en safetensors (18,59B parámetros almacenados) y se distribuye en ~9,9 GiB por tarjeta en configuración TP2. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated-DeltaNet (attention lineal) + 16 capas de attention completa, head_dim=256, cabeza MTP nativa |
| Parametros totales | 18.589.348.592 (safetensors cuantizado); 27B en el modelo base |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 150.000 tokens en el despliegue documentado (vLLM nightly); 262.262 tokens nativos del modelo base |
| Tipos de cuantizacion | NVFP4 W4A16 (MLP, group size 16), FP8 (attention y linear_attn), FP8 KV cache, cabeza MTP en BF16 |
| Idiomas soportados | en (según model card; el modelo base es multimodal y probablemente multilingue, pero no se declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de 27B parámetros con arquitectura híbrida de atención: 48 de sus 64 capas usan attention lineal Gated-DeltaNet y las 16 restantes usan attention completa con `head_dim=256`. Incluye una torre de visión (el modelo base es multimodal) y una cabeza MTP nativa que actúa como draft head para decodificación especulativa. La ventana de contexto nativa es de 262.262 tokens y se puede extender hasta 1M según la documentación de vLLM Recipes.

La cuantización se realizó con NVIDIA ModelOpt siguiendo la receta `huggingface/qwen3_5/ptq/w4a16_nvfp4-fp8_attn-kv_fp8_cast`, la misma familia que la de `nvidia/Qwen3.6-27B-NVFP4`. El proceso cuantiza 401 capas: MLP en NVFP4 W4A16 (group size 16), attention y linear_attn en FP8, lm_head en NVFP4 y cache KV en FP8. La calibración se realiza con el dataset cnn_dailymail (el mix por defecto de 0.45 tokens falla con `DatasetNotFoundError`). La cabeza MTP (15 tensores) se excluye de la cuantización y se mantiene en BF16, ya que una cabeza MTP cuantizada no carga en vLLM. El checkpoint final se ensambla con los tensores MTP dentro de los shards del modelo.

## Capacidades

- Generación de texto con decodificación especulativa MTP nativa (K=4), con `accept_len` de 2.5 a 3.4 tokens según el contenido.
- Soporte de tool calling mediante parser `qwen3_xml` y auto-tool-choice en vLLM.
- Soporte de razonamiento con parser `qwen3` (thinking mode).
- Ventana de contexto de 150.000 tokens en el despliegue documentado, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multimodales del modelo base (visión) no activadas en este despliegue (`--language-model-only`).
- Rendimiento de 120-130 tokens/s en generación de código en single-stream con TP2.

## Casos de uso

- Despliegue de un LLM de 27B en hardware de consumo: dos RTX 5070 Ti de 16 GB unidas por tensor parallelism permiten ejecutar el modelo sin GPUs de datacenter, con un coste de hardware muy inferior a una A100 o H100.
- Generación de código en producción local: con 120-130 tokens/s y soporte de tool calling, el modelo puede integrarse en IDE o pipelines de CI/CD para autocompletado, revisión de código y generación de tests.
- Agentes conversacionales con contexto largo: la ventana de 150k tokens permite mantener conversaciones multi-turno con historial extenso y documentos de contexto, algo crítico en asistentes de soporte técnico o análisis de documentación.
- Automatización de oficina y agentic workflows: el modelo base está optimizado para tareas de agente y automatización, y esta cuantización permite ejecutarlo en equipos de escritorio.
- Razonamiento matemático: con un resultado de 29/30 en AIME 2026 pass@1 (medición propia, single-stream), el modelo es adecuado para tareas de razonamiento matemático y resolución de problemas.
- Decodificación especulativa sin modelo draft externo: la cabeza MTP nativa en BF16 reduce la latencia percibida sin necesidad de un draft model adicional, simplificando el despliegue.

## Benchmarks y rendimiento

La model card reporta un único benchmark autoejecutado:

| Benchmark | Resultado | Condiciones |
|---|---|---|
| AIME 2026 pass@1 | 29/30 | Medición propia, single-stream, sin herramientas |

Velocidad medida en el despliegue documentado (2× RTX 5070 Ti, vLLM nightly, TP2):

| Metrica | Valor |
|---|---|
| Throughput | 120-130 tokens/s en generación de código (single-stream) |
| accept_len (MTP K=4) | 2.5-3.4 tokens |
| KV pool | 150.000 tokens a util=0.94 (177.254 en build original) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- 2× GPU de 16 GB VRAM con soporte sm_120 (RTX 5070 Ti documentadas; cualquier Blackwell de 16 GB debería funcionar).
- Peso de ~9.9 GiB por tarjeta en configuración TP2 (total ~21 GB).
- No cabe en una sola GPU de 16 GB; se requiere tensor parallelism TP2.
- Runtime: vLLM nightly con flags específicos (`--tensor-parallel-size 2`, `--kv-cache-dtype fp8`, `--mamba-cache-dtype bfloat16`, `--gpu-memory-utilization 0.94`, `--attention-backend TRITON_ATTN`, `VLLM_FLASHINFER_WORKSPACE_BUFFER_SIZE=67108864`).
- En el build original se alcanzaron 160k tokens de contexto; en nightly actuales se reduce a 150k con la misma configuración.
- La concurrencia está limitada a 3 secuencias simultáneas (`--max-num-seqs 3`) con chunked prefill para mantener el presupuesto de memoria.
- No se requieren GPUs de datacenter (A100, H100, 48 GB), es el objetivo principal del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| eemin/Qwen3.8-27B-NVFP4-MTP-2x16GB | 27B (18.6B cuantizado) | NVFP4 + FP8 | 150k | 2× 16 GB (TP2) | Apache 2.0 |
| PassingByPixels/Qwen3.8-27B-NVFP4 | 27B (18.6B cuantizado) | NVFP4 | 262k | 1× 128 GB (DGX Spark) | Apache 2.0 |
| a2genesis/Qwen3.8-27B-NVFP4 | 27B (18.6B cuantizado) | NVFP4 | 262k | No especificado | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27B | BF16 | 262k | 40-80 GB VRAM | Apache 2.0 |

La diferencia principal de esta variante es la optimización específica para dos GPU de 16 GB con MTP head preservada en BF16, mientras que la de PassingByPixels se centra en una sola DGX Spark de 128 GB y la de a2genesis es una cuantización comunitaria sin receta de despliegue. La versión de eemin es la única de las tres que documenta la configuración completa para hardware de consumo.

## Limitaciones y advertencias

- La model card declara solo idioma `en`; aunque el modelo base de Qwen es multilingüe, no se garantiza el soporte de otros idiomas en esta cuantización.
- El despliegue requiere una versión nightly de vLLM (no estable), y la configuración puede cambiar entre versiones; el flag `--attention-backend TRITON_ATTN` se ignora silenciosamente en la versión verificada (`v0.27.2rc1.dev150`), que usa FLASHINFER.
- Con `--gpu-memory-utilization 0.96` el modelo falla en la primera generación por el workspace de FlashInfer; es necesario reducir el workspace a 64 MiB y usar util=0.94.
- La ventana de 262k tokens del modelo base no es alcanzable en este diseño; el máximo documentado es 150k (160k en el build original).
- La cuantización NVFP4 puede degradar la calidad respecto al modelo base en BF16, especialmente en tareas de precisión numérica o matemática avanzada.
- La concurrencia está limitada a 3 secuencias simultáneas, lo que limita el uso en entornos de producción con múltiples usuarios.
- No se han publicado evaluaciones de sesgos, alucinación o robustez para esta cuantización específica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eemin/Qwen3.8-27B-NVFP4-MTP-2x16GB
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha vLLM Recipes del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Foro de NVIDIA sobre NVFP4 en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-a-single-dgx-spark-up-to-1m-context-vllm-mtp-measurements/380244
- Cuantización alternativa de PassingByPixels: https://huggingface.co/PassingByPixels/Qwen3.8-27B-NVFP4
- Cuantización alternativa de a2genesis: https://huggingface.co/a2genesis/Qwen3.8-27B-NVFP4
