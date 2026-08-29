# maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal

## Resumen

Este repositorio contiene una cuantización NVFP4 (W4A4) calibrada del modelo draft DFlash 2, diseñado para la decodificación especulativa del modelo Qwen3.8-27B. El draft original en BF16 ocupa 3,53 GB de VRAM; la versión cuantizada aquí presentada reduce ese consumo a 1,37 GB, lo que libera espacio para ampliar la caché KV del modelo objetivo de 90K a 130K tokens en una RTX 5090 (32 GB) con SGLang. La calibración de las escalas de activación recupera la tasa de aceptación del draft BF16 (3,60 frente a 3,71 tokens aceptados por bloque de 8), mientras que una cuantización sin calibrar la degrada hasta 3,26.

El modelo es un componente auxiliar, no un modelo generativo independiente: actúa como generador de candidatos en el esquema de decodificación especulativa DFlash 2, donde el modelo objetivo verifica cada token propuesto. Está desarrollado por maurienne-ai y empaquetado en el formato ModelOpt que SGLang carga de forma nativa. Su relevancia actual radica en permitir servir Qwen3.8-27B con ventanas de contexto largas en hardware de consumo de gama alta, manteniendo la velocidad de decodificación y la calidad de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (block-diffusion draft model), 5 capas, 35 proyecciones lineales cuantizadas |
| Parametros totales | 1.124.865.280 (draft model) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Depende del modelo objetivo; con Qwen3.8-27B NVFP4 y caché KV FP8, hasta 130K tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, group size 16, escalas de bloque FP8-E4M3, escala global FP32 por tensor) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout ModelOpt) |

## Arquitectura y entrenamiento

El modelo es un draft model para decodificación especulativa basado en la arquitectura DFlash 2, que genera bloques de 8 tokens candidatos. Consta de 5 capas con proyecciones lineales de atención y MLP (35 en total), además de proyecciones de características, convoluciones dinámicas y codebooks que permanecen en BF16. La cuantización NVFP4 se aplica a las 35 proyecciones lineales, con activaciones cuantificadas en tiempo de ejecución por SGLang usando escalas estáticas por tensor almacenadas en el checkpoint.

La calibración se realizó con datos on-policy: 460 conversaciones generadas por el propio modelo objetivo a través de SGLang, abarcando 6 dominios (chat multilingüe, francés, código, tool calling, matemáticas y salida estructurada), con un total de 281.649 tokens generados. Se capturaron las entradas reales de las capas cuantizables mediante pre-hooks y se calcularon escalas de activación por tensor. Los pesos se redondearon al vecino más cercano en la rejilla NVFP4. Se probaron alternativas como GPTQ con Hessianas completas o SmoothQuant, pero no produjeron mejoras medibles.

## Capacidades

- Decodificación especulativa: genera 8 tokens candidatos por bloque, verificados por el modelo objetivo.
- Cuantización NVFP4 calibrada que mantiene la tasa de aceptación del draft BF16 original.
- Compatible con SGLang (a partir del commit `ecbadf0b`) y con el backend de atención FlashInfer.
- Soporta contextos largos: libera VRAM para ampliar la caché KV hasta 130K tokens con el modelo objetivo en NVFP4.
- Integración con caché jerárquica (HiCache) y memoria diferida para optimizar el uso de VRAM.
- No es un modelo generativo autónomo; requiere el modelo objetivo Qwen3.8-27B y el algoritmo DFLASH de SGLang.

## Casos de uso

- Servir Qwen3.8-27B en una RTX 5090 (32 GB) con ventanas de contexto de hasta 130K tokens, aprovechando la reducción de VRAM del draft.
- Acelerar la inferencia de agentes de codificación con razonamiento largo y tool calling, donde la decodificación especulativa reduce la latencia por token.
- Despliegue de asistentes conversacionales multilingües con contexto prolongado, manteniendo la calidad de salida gracias a la verificación del modelo objetivo.
- Procesamiento de documentos extensos o análisis de código fuente en sesiones interactivas, con caché de prefijo reutilizable.
- Evaluación de esquemas de decodificación especulativa en hardware Blackwell, comparando el rendimiento del draft cuantizado frente al BF16.
- Integración en pipelines de inferencia con SGLang que requieran reducir el consumo de VRAM sin sacrificar la tasa de aceptación.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, medidos con 5 prompts mixtos (código, matemáticas, prosa francesa, JSON y ensayo) × 600 tokens generados, 3 ejecuciones cada uno, temperatura 0,7:

| Draft | VRAM | KV context* | Decode (end-to-end) | Accepted / 8 |
|---|---|---|---|---|
| BF16 (upstream) | 3,53 GB | 90K | 215 tok/s | 3,71 |
| **NVFP4, calibrado (este repo)** | **1,37 GB** | **130K** | **228 tok/s** | **3,60** |
| NVFP4, round-to-nearest, sin calibrar | 1,37 GB | 130K | 210 tok/s | 3,26 |

\* Con el modelo objetivo `gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090`, caché KV FP8, `--mem-fraction-static 0.90`, HiCache activado.

También se incluye un benchmark agentic de sesión de agente de codificación sobre el árbol fuente de SGLang, con 3 turnos por tamaño de contexto:

| Contexto | Decode BF16 → NVFP4 cal. (turno 1, thinking) | Decode BF16 → NVFP4 cal. (turno 2) | Accepted/8 BF16 → NVFP4 cal. |
|---|---|---|---|
| 8K | 166 → 200 tok/s | 202 → 183 | 3,12 → 3,03 |
| 32K | 168 → 196 | 217 → 235 | 3,18 → 3,32 |
| 64K | 174 → 180 | 203 → 229 | 3,44 → 3,19 |
| 85K | 157 → 166 | 178 → 218 | 3,18 → 3,21 |
| 110K | excede contexto BF16 → 207 | — → 226 | — → 3,63 |

Las llamadas a herramientas se emitieron correctamente en 10/10 turnos con este draft, frente a 6/8 con BF16 (las diferencias se atribuyen a ruido de muestreo a T=0,7).

## Requisitos de hardware

- GPU Blackwell (sm120) obligatoria para las GEMMs NVFP4; la RTX 5090 (32 GB) es la plataforma de referencia.
- CUDA 13 y SGLang compilado desde `main` en o después del commit `ecbadf0b`.
- VRAM del draft: 1,37 GB en NVFP4 (frente a 3,53 GB en BF16).
- El modelo objetivo Qwen3.8-27B en NVFP4 también requiere GPU Blackwell; con 32 GB de VRAM se alcanzan 130K tokens de contexto con caché KV FP8.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH` y `--speculative-draft-model-quantization modelopt_fp4`.
- No se dispone de datos de latencia o throughput para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | VRAM draft | Contexto KV* | Decode (end-to-end) | Accepted / 8 | Licencia |
|---|---|---|---|---|---|
| DFlash 2 BF16 (upstream) | 3,53 GB | 90K | 215 tok/s | 3,71 | Apache-2.0 |
| **DFlash 2 NVFP4 calibrado (este repo)** | **1,37 GB** | **130K** | **228 tok/s** | **3,60** | Apache-2.0 |
| DFlash 2 NVFP4 sin calibrar | 1,37 GB | 130K | 210 tok/s | 3,26 | Apache-2.0 |

No se dispone de comparativas con otros draft models de decodificación especulativa (p. ej., EAGLE o Medusa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Qwen3.8-27B y el algoritmo DFLASH de SGLang para funcionar.
- Exclusivo de GPU Blackwell (sm120); no es compatible con arquitecturas anteriores (Ampere, Ada, etc.).
- La cuantización sin calibración degrada la tasa de aceptación (~13 % menos); la calibración aquí incluida es esencial para mantener el rendimiento.
- Depende de una versión específica de SGLang (commit `ecbadf0b` o posterior) y de CUDA 13.
- El tamaño del bloque de decodificación está fijado en 8 tokens (`--speculative-num-draft-tokens 8`) y no puede aumentarse.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este draft; los datos disponibles se limitan a métricas de decodificación especulativa.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones; se recomienda verificar la licencia del modelo objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal
- Modelo base (draft BF16): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Foro NVIDIA sobre despliegue con SGLang y DFlash2: https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-single-dual-dgx-spark-sglang-dflash2-fully-openai-compatible/380732
