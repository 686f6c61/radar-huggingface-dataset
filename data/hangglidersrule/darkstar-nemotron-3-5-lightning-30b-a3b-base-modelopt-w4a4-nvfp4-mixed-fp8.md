# HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8

## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8 es una cuantización publicada por el usuario HangGlidersRule sobre los pesos BF16 de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (revisión `d468880b6ad3c6e0d21377ce7242adaea4cc884d`). No introduce ninguna modificación de comportamiento: es una conversión con NVIDIA ModelOpt `0.48.0rc1` que aplica NVFP4 (W4A4) a los expertos enrutados y compartidos de las 23 capas MoE, FP8 E4M3 a las proyecciones Mamba, NVFP4 weight-only al `lm_head` y caché KV en FP8, dejando en BF16 router, convoluciones Mamba, proyecciones de atención, embeddings, normas y cabeza MTP.

El objetivo es doble. Por un lado, reducir la huella de memoria del checkpoint (20,1 GiB en cuatro shards) para que quepa en GPUs de 32 GB manteniendo una ventana de 131.072 tokens. Por otro, ejecutar matemática FP4 real en los expertos sobre hardware Blackwell (SM120), lo que se traduce en mejoras de prefill de 1,21-1,49x frente al checkpoint W4A16 de NVIDIA en una RTX PRO 4500, con decodificación monostream prácticamente neutra (0,99-1,03x).

La relevancia actual está en que es una de las pocas celdas W4A4 con Mixed-FP8 documentadas con validación fail-closed, métricas de calidad (GPQA Diamond 136/198, idéntico al build W4A16) y divergencia KL frente a BF16 (0,0358). El autor distingue explícitamente el caso de uso: en tarjetas de 96 GB conviene la celda W4A4 sin Mixed-FP8 (KL 0,0246), mientras que en tarjetas de 32 GB esta variante es la adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida (capas MoE con expertos enrutados + proyecciones Mamba + atención), con cabeza MTP |
| Parametros totales | 17.820.207.680 (~17,8 B según safetensors); el nombre comercial del modelo base indica 30B-A3B |
| Parametros activos | 3B (según la nomenclatura A3B del modelo base; no verificado en la información disponible) |
| Longitud de contexto | 131.072 tokens (ventana soportada en la RTX PRO 4500 de 32 GB) |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1, grupo 16, escalas de bloque FP8 E4M3) en expertos; FP8 E4M3 en proyecciones Mamba; NVFP4 W4A16 en `lm_head`; caché KV FP8 E4M3; BF16 en router, conv Mamba, proyecciones de atención, embeddings, normas y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (4 shards, 20,1 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Nemotron-H: 23 capas MoE con 128 expertos enrutados y un experto compartido por capa, 6 capas de atención y proyecciones Mamba (`in_proj`/`out_proj`) en el resto del stack, más una cabeza MTP (multi-token prediction). Esta ficha no cubre el entrenamiento del modelo base: la información disponible solo describe el proceso de cuantización.

La conversión se realizó con ModelOpt `0.48.0rc1` (commit `ff2450c15eb5f1697ec0471704d5421d54fce4f4`) usando la receta de operadores `nvfp4_experts_w4a4-mamba_fp8-lmhead_nvfp4-kv_fp8` (SHA-256 `188e78f46099740cc1b7b4d60301ea79279ff912100ba3fccc1d01c0631be3e6`). Se cuantizaron 5.934 lineales en W4A4 NVFP4 (proyecciones up y down de los 128 expertos enrutados y del experto compartido en las 23 capas MoE), 46 lineales Mamba en FP8 E4M3 con escalas por tensor, el `lm_head` en NVFP4 weight-only y la caché KV en FP8 con escalas k/v calibradas por capa en las 6 capas de atención. Las escalas de pesos son estáticas, obtenidas mediante un barrido MSE de escalas FP8; la calibración usó 1.024 textos (SHA-256 `0a1be3fb7fd44f745213f61f45fb4ce61a69d85a4bf39f0adf4e8957c5d87840`). Las escalas de activación de los expertos se fijaron con la regla pre-registrada para la celda W4A4 de la familia: por stream, la escala global con el menor error NVFP4 simulado sobre activaciones BF16.

La validación es fail-closed sobre los ficheros publicados: el conjunto de módulos cuantizados coincide exactamente con el diseño, no hay NaN ni escalas de bloque FP8 a cero, los 532 tensores no cuantizados son idénticos byte a byte a BF16 y las configuraciones son idénticas salvo metadatos de cuantización. Respecto a la celda W4A4 sin Mixed-FP8, los pesos de expertos y las escalas de activación son bit-idénticos; la diferencia está en que las proyecciones Mamba, el `lm_head` y la caché KV usan el layout de NVIDIA, reduciendo la memoria leída en cada paso de decodificación.

## Capacidades

- Generación de texto conversacional y continuaciones de texto sobre el modelo base `base` (sin ajuste de instrucciones propio de esta conversión).
- Razonamiento con modo thinking, tal como se evaluó en GPQA Diamond con `--reasoning-parser nemotron_v3`.
- Razonamiento matemático y científico de nivel GPQA (68,7% en Diamond con el arnés indicado).
- Decodificación especulativa mediante el drafter DSpark con 3 tokens especulativos, soportada en el despliegue con vLLM.
- Inferencia eficiente en GPUs Blackwell (SM120) con matemática FP4 real en los expertos.
- Ventana de contexto larga de 131.072 tokens en tarjetas de 32 GB.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, uso como agente y visión/audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en GPUs de 32 GB: la celda está pensada para tarjetas como la RTX PRO 4500, donde mantiene la ventana de 131.072 tokens a una fracción de memoria menor que el checkpoint W4A16 de NVIDIA. Es el escenario principal documentado por el autor.
- Servicio de inferencia con vLLM en producción: el checkpoint está preparado para vLLM `v0.32.0` con flags de servicio comunes, incluyendo drafter DSpark y caché KV FP8, lo que permite estandarizar el stack sin cambios de configuración entre celdas.
- Prefill intensivo en Blackwell: con mejoras de 1,21-1,49x frente al W4A16 en prefill sobre RTX PRO 4500, encaja en cargas con prompts largos (análisis de documentos, resumen de contexto extenso) donde el coste dominante es el prefill.
- Evaluación comparativa de cuantizaciones: sirve como celda de referencia W4A4 con Mixed-FP8 para medir degradación frente a BF16 (KL 0,0358, top-1 92,81%) en pipelines internos de validación.
- Razonamiento científico asistido: con GPQA Diamond 136/198 y modo thinking activado, es adecuado para tareas de pregunta-respuesta experta donde se tolera latencia de decodificación monostream neutra.
- Convivencia con otros modelos en la misma GPU: el autor lo probó compartiendo una RTX PRO 4500 de 32 GB con un modelo de voz pequeño, un patrón realista para asistentes multimodales ligeros.
- Base para fine-tuning o destilación: al ser una cuantización del checkpoint `base`, puede servir como punto de partida para adaptaciones posteriores, aunque la cuantización complica el reentrenamiento directo.

## Benchmarks y rendimiento

| Metrica | Valor | Base |
|---|---|---|
| GPQA Diamond | 136/198 (68,7%) | denominador completo; 11 no parseables, 12 truncados sin respuesta, 0 errores de petición |
| GPQA, BF16 upstream | 138/198 y 141/198 (dos ejecuciones) | las dos ejecuciones discrepan en 37 ítems (banda de ruido de 11,9 preguntas) |
| GPQA, build W4A16 | 136/198 (68,7%) | mismo arnés |
| Delta GPQA vs build W4A16 | 0 preguntas (IC 95% −0,056 a +0,056) | barra pre-registrada −0,060: PASS |
| KL de siguiente token vs BF16, KV FP8 tal como se publica | 0,0358; acuerdo top-1 92,81% | 64 prompts reservados, 37.727 posiciones |
| KL de siguiente token vs BF16, KV BF16 | 0,0352; acuerdo top-1 92,98% | mismos prompts; la caché KV FP8 añade 0,0006 |
| KL de siguiente token, otras celdas | W4A4 sin Mixed-FP8: 0,0246; W4A16: 0,0189 | mismos prompts |
| Prefill vs W4A16 de NVIDIA (RTX PRO 4500) | 1,21-1,49x | mismos flags de servicio |
| Decodificación monostream vs W4A16 de NVIDIA (RTX PRO 4500) | 0,99-1,03x | mismos flags de servicio |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 20,1 GiB en disco; en la RTX PRO 4500 de 32 GB cabe con la ventana de 131.072 tokens a una fracción de memoria menor que el W4A16 de NVIDIA.
- GPU validadas: RTX PRO 6000 Blackwell (SM120) para evaluación de calidad y RTX PRO 4500 de 32 GB (SM120) para servicio.
- Matemática FP4 real en expertos: requiere GPUs Blackwell (SM120). En generaciones anteriores la ventaja de velocidad no está documentada.
- Cabe en GPU consumer: no hay datos publicados sobre RTX 4090 u otras consumer en la información disponible.
- Despliegue: vLLM `v0.32.0` con drafter DSpark (3 tokens especulativos) y caché KV FP8; el autor usa los mismos flags en todas las celdas comparadas.
- Latencia y throughput: prefill 1,21-1,49x y decodificación monostream 0,99-1,03x frente al W4A16 de NVIDIA en RTX PRO 4500; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (GPQA Diamond) | Licencia |
|---|---|---|---|---|---|
| Darkstar W4A4 NVFP4 Mixed-FP8 (esta ficha) | ~17,8 B (30B-A3B nominal) | 131.072 | NVFP4 W4A4 + FP8 Mamba + KV FP8 | 136/198 (68,7%) | OpenMDW 1.1 |
| Darkstar W4A4 NVFP4 (sin Mixed-FP8) | ~17,8 B (30B-A3B nominal) | 131.072 | NVFP4 W4A4 | no disponible | OpenMDW 1.1 |
| Darkstar W4A16 NVFP4 | ~17,8 B (30B-A3B nominal) | 131.072 | NVFP4 W4A16 | 136/198 (68,7%) | OpenMDW 1.1 |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B NVFP4 (W4A16) | 30B-A3B nominal | no disponible | NVFP4 W4A16 | no disponible | no disponible |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B BF16 (base) | 30B-A3B nominal | no disponible | BF16 | 138/198 y 141/198 | no disponible |

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del checkpoint BF16 de NVIDIA, que no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; la KL de 0,0358 frente a BF16 implica divergencia medible en la distribución de siguiente token.
- La caché KV en FP8 añade 0,0006 de KL respecto a KV BF16, un coste pequeño pero no nulo.
- En GPQA Diamond, 11 ítems no fueron parseables y 12 se truncaron sin respuesta; se contabilizaron como incorrectos, lo que puede infravalorar ligeramente la calidad real.
- La banda de ruido del BF16 en GPQA es amplia (11,9 preguntas entre dos ejecuciones), por lo que las diferencias de pocos ítems no son concluyentes.
- El checkpoint está pensado para GPUs Blackwell (SM120); el rendimiento en otras arquitecturas no está documentado.
- La elección de celda importa: en tarjetas de 96 GB el autor recomienda la W4A4 sin Mixed-FP8 por su menor KL (0,0246 frente a 0,0358).
- Licencia OpenMDW 1.1: es una licencia con términos propios; conviene revisar las condiciones de uso comercial en el enlace oficial antes de desplegar en producción.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá de lo observado en el modelo base.
- El repositorio tiene 32 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4-Mixed-FP8
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Checkpoint W4A16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Celda W4A4 sin Mixed-FP8: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4
- Build W4A16 de la familia: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4
- Model card de origen: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/model-card/base-w4a4-nvfp4-mixed-fp8.md
- Registro de la familia: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/README.md
- Receta de construcción: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3.5-lightning/darkstar-nemotron-3.5-lightning-30b-a3b-base-modelopt-w4a4-nvfp4-mixed-fp8.yaml
- Resultados de la puerta de validación: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/results/nvl-gate-summary.json
- Issue de la campaña: https://github.com/HangGlidersRule/model-forge/issues/25
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
