# SargeDev/Solar-JEV-27B

## Resumen

Solar-JEV-27B es un modelo de lenguaje de 26.896 millones de parámetros (aproximadamente 27B) desarrollado por SargeDev, derivado por fine-tuning del modelo abliterated `huihui-ai/Huihui-Qwen3.8-27B-abliterated`. Está orientado a la toma de decisiones cotidianas ("decision-model", "system-one") con salidas tipadas: elección múltiple (`choice`), puntuación ordinal (`score`) y decisión binaria (`noul`). El modelo incorpora un adaptador LoRA de rango 16 sobre el `lm_head`, de forma que la lectura de decisión se produce en un único forward pass con `max_tokens=1`, sin cabeza adicional en tiempo de inferencia.

La relevancia del modelo está en su planteamiento metodológico: el autor publica una tabla de ablación que compara dónde debe residir la lectura de decisión (dentro del modelo vía LoRA en `lm_head` frente a una proyección separada en tiempo de lectura), y reconoce abiertamente que esta variante r16 queda por debajo de la referencia publicada de AutoTrust en las métricas de decisión tipada. El propio autor recomienda la variante hermana `Solar-JEV-27B-R32`, que obtiene resultados sustancialmente mejores (choice top-1 0.8693 frente a 0.5054).

La arquitectura es un transformer denso (no MoE) con licencia Apache 2.0, pesos en safetensors y bf16 completo (unos 51 GB, repositorio de 54.7 GB). El modelo está desbloqueado (abliterated), sin censura de rechazo, y se sirve directamente en vLLM y transformers bajo la clase `Qwen3_5ForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (clase `Qwen3_5ForCausalLM`), fine-tuning con LoRA r=16 sobre el `lm_head` |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de despliegue usa `--max-model-len 8192` |
| Tipos de cuantizacion | No disponible (el autor publica pesos bf16 completos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 51 GB) |

## Arquitectura y entrenamiento

El modelo parte de `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, un Qwen3.8 de 27B al que se le ha aplicado abliteration (eliminación de la dirección de rechazo en el espacio de activaciones). Sobre esa base se entrena un LoRA de rango 16 durante 1.219 pasos sobre el corpus JEV System-1 (`SargeDev/jev-distill-corpus-v3` y `SargeDev/solar-decisions-corpus-v4`). La innovación técnica clave es que la lectura de decisión se entrena dentro del propio modelo mediante el LoRA en `lm_head`, de modo que la distribución de decisión tipada se obtiene en un solo paso hacia delante con `max_tokens=1`, sin necesidad de ejecutar una cabeza separada.

El autor documenta explícitamente el hallazgo central de su ablación: una proyección separada sobre el estado oculto final (la variante "solar r16" sin LoRA en `lm_head`) solo alcanza 0.5054 de top-1 en `choice`, mientras que el mismo backbone con LoRA en `lm_head` entrenado en el bucle alcanza 0.8693 en las mismas filas. Además, añadir un segundo adaptador sin lectura sobre el merge r32 empeora la precisión de decisión tipada (0.8162 de top-1, entre los dos progenitores) en lugar de mejorarla; los deltas de ambos LoRA son casi ortogonales (coseno medio de 0.003), por lo que no se cancelan, pero el delta de solar degrada la lectura que r32 había entrenado.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat compatible con vLLM y transformers.
- Toma de decisiones tipadas: elección múltiple (`choice`), puntuación ordinal (`score`) y decisión binaria (`noul`), con probabilidades calibradas (ECE bajo en las tres categorías).
- Lectura de decisión en un único forward pass (`max_tokens=1`) gracias al LoRA integrado en `lm_head`.
- Modo "uncensored"/abliterated: tasa de rechazo reducida, medida y publicada por el autor en lugar de asumida.
- Modo thinking desactivable mediante `default-chat-template-kwargs '{"enable_thinking": false}'`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Gate de decisión automática en pipelines: el modelo puede clasificar entradas en una de varias opciones (`choice`) con una sola pasada y `max_tokens=1`, lo que lo hace adecuado para enrutamiento de bajo coste por token en sistemas de producción.
- Puntuación ordinal calibrada: útil para tareas de ranking o valoración (por ejemplo, prioridad de tickets o calidad de respuestas) donde se necesita una distribución de probabilidad calibrada (`score`) y no solo una etiqueta.
- Filtro binario de seguridad o relevancia (`noul`): con AUROC de 0.9449 en el conjunto de prueba, puede emplearse como primera etapa de descarte antes de invocar un modelo mayor.
- Asistente conversacional sin restricciones de rechazo: para aplicaciones donde el abliterated es un requisito (investigación sobre sesgos, red teaming controlado, generación creativa sin bloqueos), el modelo mantiene conversación multi-turno con plantilla de chat estándar.
- Servicio en una sola máquina clase GB10/Spark: el ejemplo oficial de vLLM con `--gpu-memory-utilization 0.85` y contexto de 8192 indica que el autor lo despliega en hardware de una sola unidad, lo que facilita prototipado y demos internas.
- Investigación sobre calibración y lectura de decisiones: la publicación de la tabla de ablación y del harness de validación (reproducibilidad a 0.001 en todas las métricas) lo convierte en una referencia útil para estudiar dónde debe residir la cabeza de decisión en modelos fine-tuneados.

## Benchmarks y rendimiento

Resultados del gate de decisión AutoTrust-style sobre `test_set_30k` (27.695 filas, placeholders D1 de yuri_v1 excluidos), comparados con el merge hermano r32 y la referencia publicada de AutoTrust:

| Metrica | n | Solar-JEV-27B (r16, este modelo) | Solar-JEV-27B-R32 | AutoTrust (referencia publicada) |
|---|---|---|---|---|
| noul.AUROC | 9969 | 0.9449 | 0.9919 | 0.9961 |
| noul.top-1 | 9969 | 0.8657 | 0.9486 | n/a |
| noul.ECE | 9969 | 0.0143 | 0.0122 | n/a |
| noul.KL | 9969 | 0.0448 | 0.0081 | n/a |
| choice.top-1 | 9199 | 0.5054 | 0.8693 | 0.9041 |
| choice.ECE | 9199 | 0.0338 | 0.0051 | n/a |
| choice.KL | 9199 | 0.4994 | 0.0530 | n/a |
| score.top-1 | 8527 | 0.5369 | 0.8135 | 0.8910 |
| score.ECE | 8527 | 0.0368 | 0.0367 | n/a |
| score.KL | 8527 | 0.4699 | 0.0619 | 0.0210 |
| overall.top-1 | 27695 | 0.6448 | 0.8807 | n/a |
| overall.ECE | 27695 | 0.0211 | 0.0090 | 0.0011 |
| overall.KL | 27695 | 0.3267 | 0.0396 | 0.0185 |

Ablación sobre dónde debe residir la lectura de decisión (mismas 27.695 filas, mismo harness y misma cabeza + calibración):

| Modelo | Lectura de decisión | choice top-1 | score top-1 | score KL | noul AUROC | overall ECE |
|---|---|---|---|---|---|---|
| AutoTrust (referencia) | integrada en el modelo (lm_head LoRA) | 0.9041 | 0.8910 | 0.0210 | 0.9961 | 0.0011 |
| r32 + lm_head LoRA | integrada en el modelo | 0.8693 | 0.8135 | 0.0619 | 0.9919 | 0.0090 |
| solar r16 (sin lm_head LoRA) | proyección separada en lectura | 0.5054 | 0.5369 | 0.4699 | 0.9449 | 0.0211 |
| r32 + lm_head LoRA + solar (combinado) | integrada en el modelo | 0.8162 | 0.7192 | 0.1332 | 0.9810 | 0.0625 |

Validación del harness: al re-evaluar el merge r32 se reprodujeron las cifras de referencia con desviación inferior a 0.001 en todas las métricas (choice top-1 0.8704 → 0.8693, score KL 0.0623 → 0.0619, noul AUROC 0.9920 → 0.9919).

## Requisitos de hardware

- Pesos completos en bf16 de aproximadamente 51 GB (repositorio de 54.7 GB), por lo que la inferencia en precisión nativa requiere una GPU con al menos 60-80 GB de VRAM (A100 80 GB, H100 80 GB) o varias GPUs.
- El autor documenta despliegue en una máquina clase GB10/Spark con `--gpu-memory-utilization 0.85` y `--max-model-len 8192`, lo que sugiere que cabe en aceleradores de memoria unificada de gama alta.
- En GPUs de consumo (RTX 4090, 24 GB) no cabe en bf16; sería necesaria cuantización, para la que no se han publicado pesos oficiales.
- Opciones de despliegue documentadas: vLLM (`vllm serve` con `--trust-remote-code`) y transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | choice top-1 | score top-1 | noul AUROC | Licencia |
|---|---|---|---|---|---|---|
| Solar-JEV-27B (este) | 27B | no disponible (ejemplo a 8192) | 0.5054 | 0.5369 | 0.9449 | Apache 2.0 |
| Solar-JEV-27B-R32 | 27B | no disponible | 0.8693 | 0.8135 | 0.9919 | Apache 2.0 |
| AutoTrust (referencia publicada) | no disponible | no disponible | 0.9041 | 0.8910 | 0.9961 | no disponible |
| Huihui-Qwen3.8-27B-abliterated (base) | 27B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento en decisión tipada claramente por debajo de la referencia AutoTrust: choice top-1 0.5054 frente a 0.9041, score top-1 0.5369 frente a 0.8910. El propio autor lo califica como resultado abierto, no resuelto.
- El autor recomienda explícitamente la variante R32 sobre esta r16 para el gate de decisión; esta release es inferior en todas las métricas de decisión tipada.
- El modelo es abliterated/uncensored: la ausencia de rechazos es una decisión de diseño que puede producir contenido inapropiado y requiere filtros externos en producción.
- Riesgo de alucinación no cuantificado en la información proporcionada; al ser un modelo conversacional de 27B, es esperable en tareas factuales sin verificación.
- Idiomas soportados no documentados; no se garantiza calidad fuera de los idiomas presentes en los corpus de entrenamiento.
- Contexto máximo no declarado formalmente; el valor de 8192 aparece solo como ejemplo de despliegue.
- No se han publicado pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en GPUs de consumo.
- El modelo requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio del autor.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia abliterated de la base y los corpus de destilación deben evaluarse por separado según el caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Solar-JEV-27B
- Variante recomendada R32: https://huggingface.co/SargeDev/Solar-JEV-27B-R32
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
