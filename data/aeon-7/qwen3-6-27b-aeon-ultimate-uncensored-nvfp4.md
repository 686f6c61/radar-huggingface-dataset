# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4 es una cuantizacion de hardware en formato NVFP4 del modelo AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored, un fine-tune "abliterated" y sin censura sobre la arquitectura Qwen3.5. Lo publica el usuario AEON-7 y esta pensado para exprimir el rendimiento nativo de tensor cores FP4 en hardware Blackwell (DGX Spark / GB10, B100/B200, RTX PRO 6000 Blackwell), reduciendo el peso en disco de 51 GB en BF16 a 26 GB.

El modelo conserva la torre de vision en BF16 y mantiene intactas las 48 capas de atencion lineal (GatedDeltaNet/Mamba) del stack hibrido, aplicando la cuantizacion FP4 unicamente a las proyecciones de salida de las 16 capas de atencion completa y a las MLP. Con 27.356 millones de parametros y licencia Apache 2.0, es relevante para quienes despliegan inferencia multimodal de gran tamano en hardware Blackwell con vLLM y decodificacion especulativa.

La model card marca esta version como "superseded" por una release posterior (Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED); esta ficha se mantiene en linea para descargas existentes y uso historico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + atencion lineal GatedDeltaNet/Mamba), multimodal image-text-to-text (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (E2M1, block_size=16, escalas FP8 E4M3 por bloque, escala FP32 por tensor, simetrica con signo); pesos BF16 preservados en vision, linear_attn, normas, lm_head y embed_tokens |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 27.7 GB de repo |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con 16 capas de atencion completa y 48 capas de atencion lineal basadas en GatedDeltaNet (familia Mamba/SSM), con una torre de vision que lo convierte en un modelo image-text-to-text. La cuantizacion se realizo con llm-compressor 0.10.1.dev107 mediante `QuantizationModifier(scheme="NVFP4")` en modo post-training, con pipeline `sequential` y `sequential_targets=["Qwen3_5DecoderLayer"]` para no saltarse capas del stack hibrido. La calibracion uso open-platypus, 512 muestras de 4096 tokens.

El proceso preserva en BF16 la torre de vision (333 claves `visual.*`), las 432 claves `linear_attn.*` (48 capas x 9 modulos), las 319 claves de normas, `lm_head` y `embed_tokens`, y cuantiza 64 proyecciones de atencion completa (16 capas x 4 q/k/v/o). La verificacion reporta 1952 claves en un shard, pesos NVFP4 empaquetados presentes y magnitudes de `input_global_scale` entre 142 y 346. El tiempo de cuantizacion fue de aproximadamente 57 minutos en una RTX PRO 6000 Blackwell de 96 GB. No se detallan en la informacion disponible el volumen de tokens de preentrenamiento del modelo base ni las etapas de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento en ingles, chino y otros idiomas (etiqueta multilingual).
- Procesamiento multimodal image-text-to-text con torre de vision preservada en BF16.
- Modelo "abliterated" y "uncensored": la model card declara una tasa de rechazo de 0/50.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Compatibilidad con decodificacion especulativa mediante el drafter externo z-lab/Qwen3.6-27B-DFlash (`num_speculative_tokens: 10`).
- Inferencia con kernels nativos FP4 (CUTLASS) en sm_121a y fallback Marlin en builds estandar de vLLM.

## Casos de uso

- Despliegue multimodal en DGX Spark / GB10: el modelo permite servir texto e imagen en un unico nodo Blackwell con 26 GB de pesos NVFP4, aprovechando los tensor cores FP4 nativos mediante el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate`.
- Asistentes conversacionales sin filtros editoriales: la tasa de rechazo declarada de 0/50 lo hace adecuado para entornos de investigacion que necesitan respuestas sin bloqueos de seguridad, siempre con las cautelas legales correspondientes.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision en BF16, puede emplearse en tareas de extraccion y descripcion de contenido visual combinado con texto largo.
- Investigacion sobre cuantizacion hibrida: sirve como referencia reproducible de receta NVFP4 con preservacion selectiva de capas SSM y vision, util para estudiar el impacto de FP4 en arquitecturas Mamba.
- Inferencia de baja latencia con decodificacion especulativa: integrado con el drafter DFlash y vLLM, reduce el coste por token en cargas interactivas.
- Evaluacion comparativa de modelos abliterated: permite medir capacidades preservadas tras cuantizacion frente al original BF16, con una divergencia KL esperada inferior a 0.001 segun la model card.
- Servicio multi-modelo en produccion: el contenedor admite nombres servidos multiples (`aeon-ultimate`, `qwen36-ultimate`, `aeon-fas...`) para enrutar peticiones en un mismo endpoint compatible con la API de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la divergencia KL esperada frente al modelo BF16 (≤0.001) y la tasa de rechazo heredada (0/50, pendiente de verificar tras el despliegue).

## Requisitos de hardware

- VRAM estimada: aproximadamente 26 GB de pesos NVFP4, mas overhead de KV cache y activaciones; el presupuesto real depende de la longitud de contexto, que no se especifica.
- GPU objetivo: DGX Spark (GB10, sm_121a), B100/B200 y RTX PRO 6000 Blackwell con soporte nativo FP4.
- La cuantizacion se genero en una RTX PRO 6000 Blackwell de 96 GB; no se confirma que quepa en GPU de consumo con FP4 nativo (por ejemplo, RTX 50xx) en la informacion disponible.
- Despliegue recomendado: vLLM con el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark/GB10) o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta), con drafter z-lab/Qwen3.6-27B-DFlash.
- Variables de entorno indicadas: `TORCH_CUDA_ARCH_LIST=12.1a`, `ENABLE_NVFP4_SM100=0`, `VLLM_USE_FLASHINFER_MOE_FP4=0`, `VLLM_USE_FLASHINFER_SAMPLER=1`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- No se debe forzar `VLLM_NVFP4_GEMM_BACKEND=marlin` con el contenedor parcheado: la ruta CUTLASS nativa rinde mejor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4 | 27,36 B | no disponible | NVFP4 (26 GB) | Apache 2.0 | Version de esta ficha, objetivo Blackwell |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored (BF16) | 27,36 B | no disponible | BF16 (51 GB) | Apache 2.0 | Modelo base sin cuantizar, objetivo A100/H100 |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 27 B (aproximado) | no disponible | NVFP4 + FP8 mixta | Apache 2.0 | Release sucesora recomendada por el autor |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no incorpora los filtros de seguridad habituales, lo que implica riesgo de generar contenido danino, ilegal o sesgado; el despliegue en produccion exige moderacion externa.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion FP4 puede introducir degradaciones adicionales no medidas publicamente.
- La tasa de rechazo 0/50 es un dato declarado por el autor y pendiente de verificacion tras el despliegue.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de contexto largo con precision.
- La cuantizacion depende de hardware Blackwell con FP4 nativo; en GPUs sin esa capacidad el rendimiento puede degradarse al fallback Marlin.
- El autor marca esta release como obsoleta frente a Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, por lo que no recibira mejoras.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros recae en el desplegador.
- Los resultados de busqueda web disponibles no aportan informacion tecnica adicional sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored
- Release sucesora: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de recetas: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- Drafter especulativo: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Contenedor vLLM (Spark/GB10): ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor vLLM (RTX): ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
