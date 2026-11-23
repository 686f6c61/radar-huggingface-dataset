# skundu42/sarvam-105b-1711-dspark-fast

## Resumen

`sarvam-105b-1711-dspark-fast` es un checkpoint borrador (draft) de decodificación especulativa para el modelo `sarvamai/sarvam-105b-1711`, publicado por el usuario `skundu42`. No es un modelo generativo autónomo: se trata de un cabezal DSpark de 931 millones de parámetros que se acopla al modelo objetivo mediante el motor de inferencia vLLM 0.34.0 para acelerar la generación sin alterar la distribución de salida. Su relevancia radica en que consigue aceleraciones medibles de throughput (hasta +65,4 % en total y reducciones de TTFT de 25,8x en el escenario B=32) manteniendo una fidelidad del 100 % respecto al baseline oficial.

El artefacto se distribuye en formato MXFP8 con un tamaño de 1,21 GB, frente a los 5,51 GB del DSpark oficial, gracias a la eliminación de las copias duplicadas de `embed_tokens` y `lm_head` en BF16 (4,3 GB) y a la reutilización de los pesos del modelo objetivo mediante alias en vLLM. Está diseñado específicamente para GPUs NVIDIA Blackwell (B200) con tensor-parallel size 1 y una ventana de contexto máxima de 131.072 tokens.

La licencia es Apache 2.0 y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto muy reciente y de nicho, orientado a despliegues de producción de alta concurrencia sobre hardware Blackwell más que a uso general por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft head (decodificacion especulativa) sobre backbone transformer del modelo objetivo; compatible con MLA y FlashAttention |
| Parametros totales | 931.189.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (segun la receta de servicio `--max-model-len 131072`) |
| Tipos de cuantizacion | MXFP8 (pesos del draft); KV cache en `fp8_e4m3`; el modelo objetivo se sirve en su formato original |
| Idiomas soportados | no disponible en la model card; la evaluacion incluye un conjunto "Unseen 8-Lang Indic" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors`, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El checkpoint es un cabezal DSpark de 931 M de parámetros que actúa como modelo borrador en un esquema de decodificación especulativa con muestreo probabilístico y rechazo por bloques (`draft_sample_method: probabilistic`, `rejection_sample_method: block`). Se sirve junto al modelo objetivo `sarvam-105b-1711` mediante vLLM 0.34.0 y la librería `speculators==0.9.0`. La innovación principal es la compartición de pesos: se eliminan las copias BF16 de `embed_tokens` y `lm_head` del DSpark original (4,3 GB) y vLLM las aliasea directamente desde el modelo objetivo, reduciendo el checkpoint de 5,51 GB a 1,21 GB y liberando 4,0 GiB de VRAM. Al no fijar `--gpu-memory-utilization`, la caché KV extensible recupera otros 11,4 GiB, lo que se traduce en 558 K tokens KV adicionales.

El entrenamiento se realizó mediante destilación on-policy TV+CE sobre 2.400 rollouts de `sarvam-105b-1711` generados con los datasets `CodeFeedback-Filtered-Instruction`, `openai/gsm8k` y `CohereLabs/aya_dataset`, con una pérdida fusionada `{"ce": 0.1, "tv": 0.9}` que maximiza directamente la aceptación del muestreo por rechazo (`1 - d_TV`). Posteriormente los pesos se recuantizaron a MXFP8 con error de ida y vuelta de 0,000000. La receta de servicio incluye además `torch.compile` con Inductor `mode=3`, particionado de grafos (`use_inductor_graph_partition=true`), fusión de operadores (`fuse_rope_kvcache_cat_mla`, `fuse_attn_quant`, `enable_qk_norm_rope_fusion`) y CUDA graphs `FULL_AND_PIECEWISE` con `VLLM_USE_BREAKABLE_CUDAGRAPH=0`. Se ofrece una variante con backend `TOKENSPEED_MLA` y drafting dinámico por tamaño de batch (`[[1,8,7],[9,256,5]]`) para eliminar los picos de TTFT de `FLASHINFER_MLA`.

## Capacidades

- Aceleración de inferencia sin pérdida: mantiene una concordancia top-1 del 12/12 y una diferencia máxima de logprob top-1 de 0,00000 frente al baseline oficial.
- Decodificación especulativa con drafting dinámico por tamaño de batch (K=7 para batches de 1 a 8, K=5 para batches de 9 a 256).
- Servicio de texto de alta concurrencia: soporta hasta `--max-num-seqs 256` y `--max-num-batched-tokens` de 8.192 o 16.384 según la configuración.
- Soporte de tool calling y parsing de herramientas mediante `--enable-auto-tool-choice --tool-call-parser glm45`.
- Soporte de razonamiento estructurado mediante `--reasoning-parser glm45`.
- Multilingüismo heredado del modelo objetivo: la model card reporta evaluación sobre un conjunto "Unseen 8-Lang Indic" (ocho idiomas índicos no vistos durante el entrenamiento del draft).
- Compatibilidad con caché KV en FP8 (`fp8_e4m3`) y con atención MLA.
- No implementa visión, audio ni modalidades adicionales: es exclusivamente text-generation.

## Casos de uso

- Despliegue de alto throughput en una sola B200: con la configuración de máximo rendimiento se alcanzan 13.224 tok/s totales a B=128 en cargas de razonamiento de 1.024 tokens, lo que permite servir a decenas de usuarios concurrentes desde una única GPU.
- Reducción de latencia de primer token en servicios interactivos: la variante `TOKENSPEED_MLA` baja el p90 TTFT de 2.822,8 ms a 109,4 ms en B=32, adecuada para asistentes conversacionales con SLA estrictos.
- Atención al cliente multilingüe en la India: el checkpoint se evaluó sobre ocho idiomas índicos no vistos, con ganancias del +8,4 % (B=1) y +8,1 % (B=16), lo que lo hace apto para despliegues regionales con contexto largo de 131 K tokens.
- Generación de código en pipelines de CI/CD: el entrenamiento incluyó `CodeFeedback-Filtered-Instruction` y el modelo soporta tool calling, por lo que puede integrarse en flujos de revisión y autocompletado con aceleración de decodificación.
- Razonamiento matemático por lotes: con 13.224 tok/s a B=128 en prompts de razonamiento de 1.024 tokens, es viable procesar grandes volúmenes de problemas GSM8K en modo batch para evaluación o generación de datos sintéticos.
- Serving económico en hardware Blackwell: el recorte de 5,51 GB a 1,21 GB del draft y la recuperación de 558 K tokens KV permiten aumentar la densidad de usuarios por GPU sin adquirir hardware adicional.
- Investigación en decodificación especulativa: sirve como referencia reproducible de destilación on-policy TV+CE y cuantización MXFP8 con error de ida y vuelta nulo para estudiar el impacto de la aceptación del draft en la latencia final.

## Benchmarks y rendimiento

Resultados A/B en el mismo contenedor sobre 1x NVIDIA B200 con vLLM 0.34.0, comparando el baseline oficial (DSpark de 5,51 GB) con las dos configuraciones propuestas:

| Escenario | Baseline oficial | Balanced zero-stall (TOKENSPEED_MLA) | Peak throughput (Inductor mode=3) | Mejor ganancia |
|---|---:|---:|---:|---:|
| Mixed B=1 total / por usuario | 423,6 / 484,6 tok/s | 456,4 / 488,8 tok/s | 563,2 / 613,0 tok/s | +33,0 % total / +26,5 % usuario |
| Mixed B=16 total / por usuario | 3.061,9 / 228,9 tok/s | 3.304,0 / 238,8 tok/s | 3.283,6 / 234,2 tok/s | +7,9 % total / +4,3 % usuario |
| Mixed B=32 total (p90 TTFT) | 3.334,7 tok/s (2.822,8 ms) | 5.515,9 tok/s (109,4 ms) | 5.236,4 tok/s (490,8 ms) | +65,4 % total, 25,8x menor TTFT |
| Mixed B=64 total / por usuario | 7.042,4 / 153,7 tok/s | 8.335,9 / 167,2 tok/s | 8.793,3 / 170,0 tok/s | +24,9 % total / +10,6 % usuario |
| Mixed B=128 total / por usuario | 11.343,6 / 114,2 tok/s | 12.506,2 / 121,6 tok/s | 12.873,6 / 129,3 tok/s | +13,5 % total / +13,2 % usuario |
| Reasoning 1.024 tok, B=128 | 11.570,3 / 110,7 tok/s | 12.821,3 / 121,6 tok/s | 13.224,1 / 126,0 tok/s | +14,3 % total / +13,8 % usuario |
| Unseen 8-Lang Indic B=1 / B=16 | 412,2 / 3.132,5 tok/s | 392,9 / 3.183,5 tok/s | 446,8 / 3.385,1 tok/s | +8,4 % / +8,1 % |
| GPU KV cache (1x B200) | 3.257.344 tok (24,9x @ 128K) | 3.629.952 tok (27,7x) | 3.815.616 tok (29,1x) | +17,1 % (+558 K tokens KV) |
| Verificación lossless (12 prompts) | Referencia | 12/12 (0,00000 diff) | 12/12 (0,00000 diff) | 100 % lossless |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; las métricas reportadas son exclusivamente de rendimiento y fidelidad de inferencia.

## Requisitos de hardware

- GPU objetivo: 1x NVIDIA B200 (Blackwell). Las optimizaciones descritas (`mxfp8`, `TOKENSPEED_MLA`, Inductor `mode=3`) dependen de esta arquitectura.
- VRAM del draft: 1,21 GB en MXFP8 (frente a 5,51 GB del DSpark oficial), con 4,0 GiB liberados por la compartición de pesos.
- VRAM total: el modelo objetivo `sarvam-105b-1711` debe residir en la misma GPU; con la caché KV extensible se alcanzan 3.815.616 tokens KV (29,1x a 128 K de contexto).
- Tensor parallel: 1 (`--tensor-parallel-size 1`).
- No cabe en GPUs consumer (RTX 4090, etc.): el requisito de B200 y de MXFP8/Blackwell lo excluye.
- Motor de despliegue: vLLM 0.34.0 con `speculators==0.9.0`; requiere `--trust-remote-code`.
- Variables de entorno recomendadas: `VLLM_USE_V2_MODEL_RUNNER=1`, `VLLM_USE_BREAKABLE_CUDAGRAPH=0`, `FLASH_ATTENTION_CUTE_DSL_CACHE_ENABLED=1`.
- Throughput estimado: 563,2 tok/s (B=1), 8.793,3 tok/s (B=64) y 13.224,1 tok/s (B=128 en razonamiento) en la configuración de máximo rendimiento.
- Latencia: p90 TTFT de 109,4 ms a B=32 con `TOKENSPEED_MLA`; 490,8 ms con Inductor `mode=3`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| `skundu42/sarvam-105b-1711-dspark-fast` | 931 M (draft) | 131.072 | Hasta +65,4 % throughput y 25,8x menor TTFT frente al baseline DSpark | Apache 2.0 | Hugging Face, 0 descargas |
| DSpark oficial de `sarvam-105b-1711` | no disponible (checkpoint de 5,51 GB) | 131.072 | Baseline de referencia; 423,6 tok/s a B=1 y 11.343,6 tok/s a B=128 | Apache 2.0 (heredada del modelo base) | Incluido en el ecosistema del modelo base |
| Modelos draft EAGLE/Medusa genéricos | no disponible | no disponible | no disponible | variable | Amplia disponibilidad en la comunidad |

La comparación con alternativas de la misma categoría (drafts EAGLE, Medusa u otros cabezales especulativos) no está disponible en la información proporcionada; el único punto de comparación documentado es el DSpark oficial del propio modelo base.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo `sarvamai/sarvam-105b-1711` y no puede usarse de forma independiente para generar texto.
- Dependencia estricta de hardware: las optimizaciones están validadas únicamente sobre 1x NVIDIA B200 con vLLM 0.34.0 y `speculators==0.9.0`; no hay garantías en otras GPUs, versiones de vLLM o backends.
- Requiere `--trust-remote-code` y código personalizado (`custom_code`), lo que implica revisar el código antes de desplegarlo en entornos productivos.
- Sesgos: no se documentan análisis de sesgo en la model card; al heredar el comportamiento del modelo objetivo, los sesgos de `sarvam-105b-1711` se trasladan al resultado.
- Riesgo de alucinación: no evaluado en la información disponible; la verificación lossless solo garantiza fidelidad respecto al baseline, no corrección factual.
- Idiomas: la lista oficial de idiomas soportados no está disponible; la única evidencia es la evaluación sobre ocho idiomas índicos no vistos.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue está condicionado por la licencia y los términos del modelo base.
- Madurez: 0 descargas y 0 likes, creado y actualizado el 2026-11-23; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- Los benchmarks reportados son de rendimiento, no de calidad; no se han publicado métricas de MMLU, HumanEval o GSM8K para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/skundu42/sarvam-105b-1711-dspark-fast
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
- Librería vLLM: https://github.com/vllm-project/vllm
- Librería speculators: no disponible (referenciada como `speculators==0.9.0` sin URL en la información proporcionada)
- Paper o blog de DSpark: no disponible
- Repositorio o demo adicional: no disponible
