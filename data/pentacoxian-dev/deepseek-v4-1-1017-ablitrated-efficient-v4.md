# pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v4

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient-v4 es una versión "abliterated" (sin mecanismos de rechazo) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario pentacoxian-dev. No se trata de un modelo entrenado desde cero, sino de una cirugía de pesos en tiempo de inferencia sobre un derivado con licencia MIT de DeepSeek. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con pesos en FP8, identificado en el repositorio como `deepseek_v41`, con 763.205.315.794 parámetros totales y un tamaño de repositorio de 515,1 GB.

El cambio principal respecto a su predecesor (Efficient-v3) consiste en sustituir únicamente la cabeza del modelo por la variante v7b, que modifica 55 filas del token embedding de salida (el arranque en primera persona "I" y una familia de términos de rechazo y matización). El resto de tensores modificados (159 en total) restauran valores de la atención y de los expertos compartidos provenientes de la línea V3.1. El objetivo declarado es reducir el comportamiento de rechazo y las matizaciones excesivas manteniendo el rendimiento en tareas de razonamiento y matemáticas.

La relevancia del modelo es fundamentalmente de investigación: demuestra que un ajuste quirúrgico de la cabeza de salida puede alterar de forma medible las tasas de rechazo (0 % en XSTest y HarmBench) con un coste acotado en MMLU-Pro (64,5 % frente al 68,3 % del base sin abliterar). Se distribuye como pesos completos en 48 shards y, de forma más práctica, como delta relativo al modelo base (3,46 GB) para evitar la descarga de 500 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (model_type: deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (layout nativo del checkpoint); tag 8-bit; no se documentan otras cuantizaciones |
| Idiomas soportados | en, ja |
| Licencia | MIT (heredada de DeepSeek) |
| Formato de pesos | safetensors (48 shards, 96.085 tensores); delta en safetensors |
| Tamano del repositorio | 515,1 GB (pesos completos); delta base-relativo 3,46 GB; delta v3-relativo 1,32 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con pesos en FP8 y 763.205 millones de parámetros totales. El repositorio no documenta el número de parámetros activos por token, la composición del dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base DeepSeek-V4.1-Flash-1017; esa información corresponde al autor original y no se incluye en esta ficha. La innovación técnica de esta publicación no está en el entrenamiento, sino en la modificación de pesos: el autor declara explícitamente que "no se realizó entrenamiento; es cirugía de pesos en tiempo de inferencia".

El cambio respecto a Efficient-v3 afecta a 159 tensores, todos con el layout `bf16`/`fp8` preservado. La cabeza (`head.weight`) modifica 55 filas de tokens: se reescala ×1,15 la fila del arranque en primera persona "I" y se reducen a ×0,4–0,9 las filas de aperturas de rechazo y matización (`sorry`, `unfortunately`, `caution`, `warning`, `clarify`, `disclaimer`, `apologize`, entre otras). Además, 80 tensores de `layers.*.attn.wo_b.weight`/`.scale` y 78 de `layers.*.ffn.shared_experts.w2.weight`/`.scale` recuperan valores de la línea V3.1. El modelo se distribuye con dos deltas: uno relativo al base 1017 (159 tensores, 3,46 GB, aplicable con `delta/apply_delta.py`) y otro relativo a v3 (1 tensor, 1,32 GB, aplicable en caliente vía `apply_weight_delta` en vLLM con TP4, con la advertencia de que los deltas se pierden al reiniciar).

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento y matemáticas: 97,2 % en GSM8K (n=600) y 64,5 % en MMLU-Pro (n=600) según los resultados publicados por el autor.
- Comportamiento sin rechazo: 0 % de rechazo en XSTest normal (n=450), HarmBench estándar (n=200) y prompts agénticos (n=20); 0,2 % en SORRY-bench (n=450).
- Respuesta directa en prompts agénticos: 100 % de respuestas directas (n=20).
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento extendido (thinking mode): no documentado.
- Compatibilidad con endpoints y vLLM (tag `endpoints_compatible`, `vllm`).

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo sirve como caso de estudio reproducible de cómo una modificación de 55 filas en la cabeza de salida altera las tasas de rechazo medidas con XSTest, HarmBench y SORRY-bench, con deltas aplicables sobre el base para aislar el efecto.
- Generación de código y razonamiento matemático: con 97,2 % en GSM8K y 64,5 % en MMLU-Pro, es adecuado para pipelines de resolución de problemas y generación de código, aunque el autor no publica resultados de HumanEval.
- Evaluación comparativa de variantes abliterated: los dos deltas (base-relativo y v3-relativo) permiten reproducir exactamente los shards publicados y comparar contra el base 1017 sin descargar 500 GB.
- Despliegue en vLLM con tensor parallelism: el delta v3-relativo se aplica en caliente vía `collective_rpc` con `apply_weight_delta` en configuraciones TP4, útil para experimentación en clústeres con GPUs de alta memoria.
- Conversación multilingüe inglés-japonés: el modelo declara soporte de ambos idiomas, adecuado para asistentes conversacionales en esos mercados.
- Investigación sobre prompts agénticos: con 100 % de respuestas directas en la muestra de 20 prompts agénticos, sirve para estudiar el comportamiento de agentes sin capas de rechazo, aunque el tamaño muestral es reducido.

## Benchmarks y rendimiento

Resultados publicados por el autor (TP4, greedy, seed 7):

| Suite | n | Rechazo | Soft | Notas al pie | Directo | Reprimenda |
|---|---:|---:|---:|---:|---:|---:|
| XSTest normal | 450 | 0 % | 1 | 2 | 162 (36 %) | 15 (3,3 %) |
| HarmBench estándar | 200 | 0 % | 0 | 0 | 92 % | 4 % |
| Prompts agénticos | 20 | 0 % | 0 | 0 | 100 % | 20 % |
| SORRY-bench | 450 | 0,2 % | 0 | — | 86 % | — |
| MMLU-Pro | 600 | — | — | — | 64,5 % | — |
| GSM8K | 600 | — | — | — | 97,2 % | — |

Comparación con el delta anterior (`…-v4x06`):

| Eje | v4x06 | v4 (v7b) | Δ |
|---|---:|---:|---:|
| XSTest-450 rechazo / soft | 0 / 0 | 0 / 1 | soft +1 |
| XSTest notas al pie | 9 | 2 | −7 |
| Agéntico directo | 75 % | 100 % | +25 pp |
| MMLU-Pro 600 | 57,0 | 64,5 | +7,5 pp |
| GSM8K 600 | 96,8 | 97,2 | +0,4 pp |

Prueba de McNemar emparejada sobre los mismos ítems de MMLU frente a v4x06: +15 / −63, p < 1e-4. Frente al padre v7b inmediatamente anterior (HB4, 64,7): +10 / −9, p = 1,0, lo que indica que MMLU es plano entre ejecuciones y que la mejora real de HB4 a HB5 está en las notas al pie.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 763.205 millones de parámetros en FP8, el checkpoint completo ronda los 500 GB de pesos, por lo que requiere agregación de memoria en múltiples GPUs.
- GPU recomendadas: el autor reporta ejecución en TP4 (tensor parallelism de 4 GPUs) con vLLM; no especifica el modelo exacto de GPU. Por tamaño, configuraciones con 4×H100 80 GB o 4×A100 80 GB son el mínimo razonable para FP8 completo.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090, 24 GB) en precisión nativa; no se documentan cuantizaciones GGUF ni versiones para llama.cpp u Ollama.
- Opciones de despliegue: vLLM (documentado, con `apply_weight_delta` y `reset_prefix_cache`), transformers (librería declarada), endpoints compatibles (tag `endpoints_compatible`). No se documentan TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.
- Espacio en disco: ~300 GB libres para aplicar el delta base-relativo con `apply_delta.py` (hardlinks de los shards no modificados y reescritura de 41 shards).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-1017-Ablitrated-Efficient-v4 | 763,2 B (MoE, FP8) | no disponible | 64,5 % (n=600) | 97,2 % (n=600) | MIT | Pesos completos (515 GB) + delta (3,46 GB) |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | ~68,3 % (implícito: 3,8 pp por encima) | no disponible | MIT | Pesos completos |
| DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 | no disponible | no disponible | no disponible | no disponible | MIT | Pesos completos + delta v3-relativo |
| …-v4x06 (delta previo) | mismo base | no disponible | 57,0 % (n=600) | 96,8 % (n=600) | MIT | Delta |

## Limitaciones y advertencias

- El conjunto agéntico es n=20: ±1 prompt equivale a 5 pp; el 20 % de reprimendas está en el suelo de ruido estadístico.
- HarmBench directo está 5 pp por debajo de v4x06; el residuo es prosa creativa que el clasificador de apertura de carta no contabiliza, presente en todos los conjuntos de pesos probados.
- MMLU-Pro está 3,8 pp por debajo del base sin abliterar. Restaurar `q/kv/wo_a` del base para las capas 20–39 fue neutro (64,0 frente a 64,7, p = 0,52) y no se incluye.
- El checkpoint completo ocupa 500 GB; el delta es el artefacto práctico. Los deltas aplicados en caliente en vLLM se pierden al reiniciar.
- La abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino o inapropiado sin las salvaguardas del base. No es apto para producción sin capas de moderación externas.
- Solo se declaran inglés y japonés; el rendimiento en otros idiomas no está documentado.
- No se documentan sesgos conocidos, número de parámetros activos, longitud de contexto ni proceso de alineación del base.
- La licencia MIT se hereda de DeepSeek; la abliteración y el merge son obra de pentacoxian-dev, que lo publica como "research release".

## Enlaces

- Hugging Face: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Predecesor v3: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3
- Delta base-relativo: `delta/v4-vs-base-1017.safetensors` (en el repositorio)
- Delta v3-relativo: `delta/v4-vs-v3.safetensors` (en el repositorio)
- Escalas por fila e ids de token: `delta/deltas.json` (en el repositorio)
- Script de aplicación: `delta/apply_delta.py` (en el repositorio)
