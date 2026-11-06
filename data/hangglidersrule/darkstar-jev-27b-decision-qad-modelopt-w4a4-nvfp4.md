# HangGlidersRule/Darkstar-JEV-27B-Decision-QAD-ModelOpt-W4A4-NVFP4

## Resumen

Darkstar-JEV-27B-Decision-QAD-ModelOpt-W4A4-NVFP4 es un checkpoint cuantizado en NVFP4 (W4A4) del modelo de decisión JEV-27B, publicado por el usuario HangGlidersRule. No es un modelo generativo al uso: se trata de un modelo de clasificación de texto orientado a "System 1", es decir, a emitir decisiones tipadas en una sola pasada hacia delante con una lectura de un único token. Devuelve tres tipos de salida como probabilidades calibradas: `noul` (sí/no), `choice` (hasta 16 opciones nativas) y `score` (escala 0-5).

El modelo parte de Qwen/Qwen3.8-27B como base y del adaptador LoRA de autotrust/JEV-27B, fusionado en los pesos del backbone. Sobre esa fusión se aplica una cuantización NVFP4 de NVIDIA ModelOpt con destilación consciente de cuantización (QAD), en la que solo se entrenan las escalas de bloque FP4 de los pesos. El resultado es una build optimizada para latencia: según la model card, su latencia p50 es entre un 15 % y un 32 % inferior a la de la build mixta de la misma familia, a costa de un pequeño deterioro de calibración.

Es relevante ahora porque representa un patrón creciente: modelos de decisión especializados, cuantizados agresivamente a FP4 y empaquetados para vLLM, orientados a servir como cabezas de decisión de baja latencia dentro de pipelines de agentes. Aunque el nombre sugiere 27B, el recuento real de parámetros en safetensors es de 15.193.246.960 (unos 15,2 mil millones), dato que conviene tener en cuenta al planificar el despliegue. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal Gated DeltaNet) derivado de Qwen3.8-27B, con torre de visión y cabeza MTP |
| Parametros totales | 15.193.246.960 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas de bloque FP8 E4M3); BF16 en `lm_head`, embeddings, norms, `in_proj_a`/`in_proj_b`, `conv1d`, torre de visión, MTP y KV cache |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estándar de exportación de NVIDIA ModelOpt) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.8-27B, un transformer híbrido que combina capas de self-attention completa con capas de atención lineal basadas en Gated DeltaNet. La model card detalla que la cuantización NVFP4 cubre 192 lineales de MLP, 64 proyecciones de self-attention y 144 proyecciones de atención lineal (Gated DeltaNet). Permanecen en BF16 el `lm_head` (que actúa como cabeza de decisión), los embeddings, las normas, `in_proj_a`/`in_proj_b`, `conv1d`, la torre de visión y la cabeza MTP. El KV cache también es BF16.

El proceso de construcción tiene tres fases. Primero, se fusiona el adaptador LoRA `adapter_vllm` de JEV-27B (rango 32, alpha 64, 401 pares) en Qwen3.8-27B mediante `W + 2·(B·A)` calculado en FP32 y redondeado una sola vez a BF16; el par correspondiente al `lm_head` constituye la cabeza de decisión. Segundo, se aplica la receta de cuantización de ModelOpt 0.48.0rc1 con escalas estáticas de pesos obtenidas por Local-Hessian y un barrido de escalas FP8, calibrando con 512 muestras (256 prompts de decisión de `SargeDev/jev-distill-corpus-v3` y 256 muestras de chat de `nvidia/Nemotron-SFT-Instruction-Following-Chat-v2`). Tercero, se ejecuta QAD entrenando únicamente las escalas de bloque NVFP4 de los pesos (aproximadamente 1,52 mil millones de escalas FP8), con todos los demás parámetros congelados: objetivo de pérdida KL de vocabulario completo entre el modelo BF16 fusionado (profesor) y el estudiante NVFP4, AdamW con lr 1e-4, 596 pasos de unos 16k tokens de prompt (9,8 M tokens, 5,8 horas en una RTX PRO 6000), seleccionando el checkpoint del paso 500 por menor KL de validación (de 0,0245 a 0,0222). El resultado final modifica el 23,6 % de las escalas de bloque respecto al punto de partida.

## Capacidades

- Emisión de decisiones tipadas en una sola pasada: `noul` (sí/no), `choice` (hasta 16 opciones nativas) y `score` (0-5), devueltas como probabilidades calibradas.
- Lectura de un único token sobre la cabeza de decisión, lo que permite latencias muy bajas en comparación con la generación autoregresiva.
- Clasificación de texto como tarea principal (`pipeline_tag: text-classification`).
- Conserva la torre de visión del modelo base (copiada sin cambios), aunque la model card no documenta su uso en el modo de decisión.
- Conserva la cabeza MTP (multi-token prediction) del modelo base, copiada sin cambios.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo está construido y medido exclusivamente para decisiones System 1.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking": desactivado explícitamente en la evaluación (thinking off, single pass).

## Casos de uso

- Enrutamiento y triaje de baja latencia: el modelo puede clasificar peticiones entrantes en hasta 16 categorías nativas (`choice`) con una sola pasada, lo que permite construir un router de peticiones dentro de un sistema de agentes con latencias p50 de 64-210 ms según longitud de prompt.
- Moderación y filtrado binario: la salida `noul` (sí/no) con probabilidad calibrada sirve como clasificador de admisión o rechazo en pipelines de contenido, con la ventaja de que la calibración permite fijar umbrales de forma explícita.
- Puntuación de calidad o riesgo: la salida `score` en escala 0-5 permite ordenar candidatos (respuestas, documentos, propuestas) sin necesidad de generar texto, reduciendo coste frente a un juez generativo.
- Cabecera de decisión en pipelines de agentes: al ser un checkpoint sin LoRA en tiempo de servicio y con pesos NVFP4, se puede desplegar en vLLM junto a un modelo generativo grande que delegue las decisiones discretas en esta cabeza, reservando el modelo grande para la generación.
- Evaluación automática de sistemas LLM: el modelo puede actuar como juez binario u ordinal en pipelines de evaluación continua, con la ventaja de que su latencia (64 ms en prompts de ~314 tokens a 600 W) permite evaluar grandes volúmenes sin cuello de botella.
- Clasificación sobre contextos largos: con prompts de ~3,8k tokens mantiene latencias p50 de 210 ms a 600 W (253 ms a 450 W), lo que lo hace viable para decisiones sobre documentos o conversaciones de longitud media.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Publica métricas de calibración y latencia frente a la build mixta de la misma familia:

| Metrica | Esta build (NVFP4 W4A4 QAD) | Build mixta (NVFP4 W4A4 + FP8) |
|---|---|---|
| Latencia p50, prompt ~314 tokens, 600 W | 64 ms | 94 ms |
| Latencia p50, prompt ~3,8k tokens, 600 W | 210 ms | 250 ms |
| Latencia p50, prompt ~314 tokens, 450 W | 78 ms | 100 ms |
| Latencia p50, prompt ~3,8k tokens, 450 W | 253 ms | 302 ms |
| KL al profesor en test (relativo) | +2,0 % frente a la mixta | referencia |
| KL al profesor fuera de distribución (relativo) | +17 % frente a la mixta | referencia |
| Acuerdo top-1 en distribución | dentro de 0,15 pt de la mixta | referencia |
| Acuerdo top-1 fuera de distribución | dentro de 0,5 pt de la mixta | referencia |

Condiciones de medición: RTX PRO 6000 Blackwell (SM120), vLLM v0.32.0, script `serve_decide.py` con thinking desactivado y pasada única. Conjunto de test: las 29.955 filas de `test_set_30k` de `SargeDev/jev-distill-corpus-v3`.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 20,6 GB en safetensors; con overhead de runtime de vLLM (KV cache BF16, buffers de activación) se debe prever un margen adicional. No se publica una cifra oficial de VRAM.
- GPU recomendadas: la model card documenta mediciones en RTX PRO 6000 Blackwell (SM120). El soporte NVFP4 requiere hardware con soporte de FP4 nativo; no se documenta compatibilidad con generaciones anteriores.
- GPU de consumo: no se documenta soporte en GPUs de consumo; NVFP4 está orientado a arquitecturas Blackwell de centro de datos y workstation profesional.
- Opciones de despliegue: vLLM v0.32.0 es el runtime documentado y validado. No se mencionan llama.cpp, Ollama ni TGI; el formato NVFP4 de ModelOpt está orientado a TensorRT-LLM y vLLM.
- Latencia y throughput: latencias p50 de 64 ms (prompt corto, 600 W) a 253 ms (prompt largo, 450 W) en single request. No se publica throughput agregado ni métricas bajo batching concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Notas |
|---|---|---|---|---|---|
| Darkstar-JEV-27B-Decision-QAD-W4A4-NVFP4 (este) | 15,2B | no disponible | NVFP4 W4A4 con QAD | Apache 2.0 | Optimizado para latencia; +2 % KL en test frente a la mixta |
| Darkstar-JEV-27B-Decision-ModelOpt-W4A4-NVFP4-Mixed-FP8 | no disponible | no disponible | NVFP4 en MLP, FP8 en atención | Apache 2.0 | Build más fiel al profesor; 15-32 % más lenta en p50 |
| autotrust/JEV-27B | no disponible | no disponible | BF16 (con adaptador LoRA) | no disponible | Modelo de decisión original del que derivan ambas builds |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 | no disponible | Modelo base generativo; no es un modelo de decisión |

## Limitaciones y advertencias

- El modelo está construido y medido exclusivamente para decisiones System 1; la calidad de generación de texto (System 2) no está medida ni se reclama. La fusión del LoRA del `lm_head` en el backbone altera la generación de texto plano del modelo base.
- La model card reconoce explícitamente que esta build no supera el umbral de no inferioridad congelado de la familia; se publicó junto a la build mixta bajo una tolerancia más laxa a cambio de velocidad.
- El KL al profesor fuera de distribución es un 17 % superior al de la build mixta, lo que indica mayor deriva en dominios alejados de los datos de calibración y entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración de las probabilidades de decisión puede degradarse fuera de distribución; conviene validar los umbrales sobre datos propios.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible; las mediciones llegan hasta ~3,8k tokens de prompt.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador JEV-27B, cuyas licencias no se detallan en la información disponible.
- Dependencia de hardware: NVFP4 requiere soporte FP4 nativo; el despliegue validado es vLLM v0.32.0 sobre Blackwell. No hay garantía de funcionamiento en otras combinaciones.
- El recuento real de parámetros (15,2B) difiere del "27B" del nombre, lo que puede inducir a error en la planificación de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-JEV-27B-Decision-QAD-ModelOpt-W4A4-NVFP4
- Build mixta de la familia: https://huggingface.co/HangGlidersRule/Darkstar-JEV-27B-Decision-ModelOpt-W4A4-NVFP4-Mixed-FP8
- Modelo base de decisión: https://huggingface.co/autotrust/JEV-27B
- Modelo base generativo: https://huggingface.co/Qwen/Qwen3.8-27B
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/model-card/decision-qad-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/jev-27b/darkstar-jev-27b-decision-qad-modelopt-w4a4-nvfp4.yaml
- Resultados QAD: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/results/qad-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/20
