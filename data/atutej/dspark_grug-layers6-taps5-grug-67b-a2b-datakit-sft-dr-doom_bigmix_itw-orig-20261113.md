# atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-orig-20261113

## Resumen

Este repositorio contiene un drafter de decodificación especulativa DSpark para el modelo objetivo open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom. No es un modelo de lenguaje autónomo: es un modelo auxiliar de 751 millones de parámetros que predice bloques de tokens candidatos para acelerar la generación del modelo grande, que el modelo objetivo verifica en paralelo. Lo desarrolla el usuario atutej dentro del ecosistema de la librería `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`).

La arquitectura es un drafter de 6 capas Grug densas (sin expertos, `grug_num_experts: 0`) con FFN de 7.936, cinco capas del objetivo muestreadas (2, 7, 12, 17, 22 más la salida final), tamaño de bloque 8, vocabulario de borrador reducido a 32.000 tokens, cabeza Markov vanilla de rango 1024 y cabeza de confianza. Se entrenó con estados ocultos del objetivo servidos en streaming por vLLM a través de Mooncake, sobre un pool de 2,93 millones de filas y 4,37B tokens (2,64B supervisados).

El checkpoint publicado corresponde al paso 95.146 de un schedule de 382.747 pasos (aproximadamente 24 horas en 2 nodos GB200), con la tasa de aprendizaje aún al 75% de su pico, por lo que no está annealing. Es un snapshot intermedio de un entrenamiento más largo, no un drafter finalizado. Su relevancia es práctica: mide la aceptación de tokens especulativos sobre el modelo Grug-67B-A2B en cargas reales (matemáticas, código, agentes, contexto largo) y sirve como referencia reproducible de entrenamiento de drafters.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter especulativo DSpark: 6 capas Grug densas, 5 capas del objetivo muestreadas (2, 7, 12, 17, 22 + salida final), cabeza Markov vanilla rango 1024, cabeza de confianza |
| Parámetros totales | 751.156.225 |
| Parámetros activos | no aplica (capas densas, `grug_num_experts: 0`) |
| Longitud de contexto | 32.768 tokens durante entrenamiento (secuencia); contexto de servicio limitado por el modelo objetivo |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |
| Tamaño de bloque de borrador | 8 tokens |
| Vocabulario de borrador | 32.000 tokens (los más frecuentes del pool supervisado) |
| FFN | 7.936 (`--grug-qk-mult 1.75`) |
| Función de pérdida | 0.1 CE + 0.9 TV |
| Modelo base / objetivo | open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom |
| Paso de checkpoint | 95.146 de 382.747 (no annealed) |
| Tamaño del repo | 1,5 GB |

## Arquitectura y entrenamiento

El drafter sigue el diseño DSpark de decodificación especulativa con predicción por bloques: en lugar de proponer un único token, genera un bloque de 8 tokens candidatos que el modelo objetivo verifica en una sola pasada. Para ello consume los estados ocultos de cinco capas intermedias del objetivo (2, 7, 12, 17, 22) más su capa de salida final, y los combina mediante 6 capas Grug densas con FFN de 7.936 y multiplicador QK de 1,75. Incluye una cabeza Markov de rango 1024 para modelar dependencias entre tokens del bloque y una cabeza de confianza que estima la probabilidad de aceptación.

El entrenamiento se realizó en línea: vLLM servía los estados ocultos del objetivo en streaming vía Mooncake, con secuencias de 32.768 tokens y hasta 12.288 anclas por fila. Los datos son el pool BigMix con las respuestas propias del objetivo (sin regeneración): mlabonne/open-perfectblend (1.358.785 filas), nvidia/Nemotron-Terminal-Corpus (174.064) y nvidia/Nemotron-Post-Training-Dataset-v2 en sus splits chat (627.389), code (175.000), math (239.467) y STEM (355.000), totalizando 2.929.705 filas, 4,37B tokens y 2,64B supervisados. La tasa de aprendizaje parte de 3e-4 con decaimiento lineal hasta cero a lo largo de 382.747 pasos (11,2 épocas); el checkpoint publicado ha visto el pool unas 2,8 veces. El vocabulario de borrador se construyó con los 32.000 tokens supervisados más frecuentes del pool.

## Capacidades

- Predicción especulativa de bloques de 8 tokens para el modelo objetivo Grug-67B-A2B-Datakit-SFT-262K.
- Estimación de confianza por token mediante cabeza dedicada, útil para decidir cuántos tokens del bloque aceptar.
- Modelado de dependencias intra-bloque mediante cabeza Markov de rango 1024.
- Funcionamiento sobre contextos largos: entrenado con secuencias de 32.768 tokens y evaluado en escenarios de hasta 128k tokens de contexto del objetivo.
- Cobertura de dominios diversos gracias al pool de entrenamiento: matemáticas, código, STEM, terminal/agentes y conversación.
- No genera texto de forma autónoma ni responde prompts por sí mismo; requiere el modelo objetivo para verificar y aceptar los tokens.
- No dispone de tool calling, visión, audio ni modos de razonamiento propios: esas capacidades pertenecen al modelo objetivo.

## Casos de uso

- Aceleración de inferencia del Grug-67B-A2B en producción: el drafter propone bloques de 8 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación. La longitud de aceptación media de 3,131 en los seis benchmarks de referencia indica que, de media, se aceptan unos 2 tokens adicionales por paso más el bono.
- Razonamiento matemático con contexto largo: en GSM8K y MATH-500 la aceptación alcanza 3,657 y 3,840 respectivamente, por lo que es adecuado para servir cargas de matemáticas con 2.048 tokens de salida donde el coste por token es crítico.
- Generación de código en pipelines: con HumanEval (2,906) y MBPP (3,070) el drafter mantiene una aceptación razonable, útil para asistentes de código que generan funciones completas y necesitan baja latencia.
- Agentes SWE-bench con contextos de hasta 128k tokens: en la repetición Snowball de 1.366 turnos de agente la aceptación es 3,212, lo que lo hace apto para bucles de agente que reenvían contexto largo repetidamente y donde cada token cuenta.
- Servicio de prompts financieros de aproximadamente 30k tokens: con `finance_v1` (256 prompts) la aceptación es 3,057, adecuado para análisis documental de contexto largo donde el objetivo procesa informes extensos.
- Evaluación y ajuste de infraestructura de decodificación especulativa: al ser un snapshot reproducible con scripts públicos, sirve para comparar configuraciones de vLLM, concurrencia y plantillas de prompt antes de desplegar un drafter final.
- Investigación sobre entrenamiento de drafters: el par ITW/targetgen y los logs de W&B permiten estudiar el efecto de entrenar con respuestas propias del pool frente a respuestas regeneradas por el objetivo.

## Benchmarks y rendimiento

Resultados de longitud de aceptación (AL, incluye el token de bono, máximo 9) servidos en el fork Marin de vLLM con 8 tokens borrador, temperatura 1, concurrencia de cliente 16, una ejecución por celda, en nodos GB200. La aceleración frente a decodificación plana no se midió para este checkpoint.

| Conjunto de prompts | AL | Tokens nuevos máx. |
|---|---|---|
| GSM8K | 3,657 | 2.048 |
| MATH-500 | 3,840 | 2.048 |
| HumanEval | 2,906 | 2.048 |
| MBPP | 3,070 | 2.048 |
| MT-Bench (turno 1) | 2,671 | 2.048 |
| SPEED-Bench qualitative | 2,640 | 4.096 |
| Media de los seis anteriores | 3,131 | — |
| AIME 2024 + 2025 (240 respuestas) | 3,091 | 32.000 |
| Datakit held-out (1.024 prompts) | 2,993 | 4.096 |
| Datakit con filas largas (512 prompts hasta 31k tokens) | 3,003 | 4.096 |
| Big-mix held-out (1.024 prompts) | 2,829 | 4.096 |
| `finance_v1` (256 prompts de ~30k tokens) | 3,057 | 4.096 |
| Snowball SWE-bench replay (1.366 turnos de agente, hasta 128k) | 3,212 | 2.048 |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval del objetivo, etc.) en la información disponible; los datos anteriores miden exclusivamente aceptación especulativa.

## Requisitos de hardware

- El drafter tiene 751M parámetros (1,5 GB en safetensors), por lo que en precisión de entrenamiento ocupa aproximadamente 1,5 GB y en fp16 unos 1,5 GB; la VRAM adicional para cachés y estados es modesta frente al modelo objetivo.
- El coste real de hardware lo domina el modelo objetivo Grug-67B-A2B, que requiere GPUs de centro de datos; el drafter se sirve junto a él en el mismo nodo.
- Entrenamiento realizado en 2 nodos GB200 durante aproximadamente 24 horas para el checkpoint publicado.
- Evaluación servida en nodos GB200 con el fork Marin de vLLM.
- No se dispone de datos de que el drafter pueda ejecutarse de forma aislada en GPU de consumo, ya que necesita los estados ocultos del objetivo; el objetivo de 67B-A2B no cabe en una RTX 4090.
- Opciones de despliegue: fork Marin de vLLM (usado en la evaluación) y la librería `speculators` para entrenamiento; no se documentan soportes para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publicaron medidas de speedup para este checkpoint; solo longitudes de aceptación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AL media (seis benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este drafter (ITW, BigMix, paso 95.146) | 751M | 32.768 (entrenamiento) | 3,131 | no disponible | Hugging Face |
| dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108 | mismo diseño (6 capas Grug) | 32.768 (entrenamiento) | no disponible en la información | no disponible | Hugging Face |
| dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-tg-20261113 | mismo diseño (contraparte targetgen) | 32.768 (entrenamiento) | no disponible en la información | no disponible | Hugging Face |

No se dispone de datos de otros drafters comparables (EAGLE, Medusa, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: paso 95.146 de 382.747, con la tasa de aprendizaje al 75% del pico y sin annealing; no es un drafter final y su aceptación mejorará probablemente al completar el schedule.
- No existe checkpoint seleccionado por validación para esta ejecución.
- No es un modelo autónomo: no puede responder prompts ni generar texto sin el modelo objetivo Grug-67B-A2B, del que depende para verificar tokens.
- La aceleración real no se midió; la longitud de aceptación no se traduce linealmente en speedup y depende del hardware, la concurrencia y la carga.
- Las cifras de aceptación provienen de una sola ejecución por celda, sin intervalos de confianza.
- Vocabulario de borrador limitado a 32.000 tokens: los tokens fuera de ese conjunto no pueden proponerse y reducen la aceptación en dominios con vocabulario especializado.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; el pool de entrenamiento está dominado por datasets en inglés (open-perfectblend, Nemotron), por lo que el rendimiento en castellano u otros idiomas no está caracterizado.
- Riesgo de sesgos heredados de los datasets de entrenamiento (open-perfectblend, Nemotron) no evaluado en la información disponible.
- Requiere infraestructura específica: fork Marin de vLLM, Mooncake para streaming de estados ocultos y nodos GB200 en la evaluación; no hay soporte documentado para stacks ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-orig-20261113
- Modelo objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Contraparte targetgen: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-tg-20261113
- Drafter Datakit previo: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108
- Repositorio de experimentos: https://github.com/atutej/spec-experiments/tree/1ab0d79
- Carpeta del experimento: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/experiments/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_open-perfectblend-nemotron-terminal-nemotron-v2_itw
- Herramientas de evaluación de aceptación: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/tools/eval_acceptance
- Entrenador (fork): https://github.com/atutej/speculators (rama `grug-dspark-gate`)
- Log W&B, primer job: https://wandb.ai/atutej/marin_speculator/runs/6oc0zw39
- Log W&B, job reanudado: https://wandb.ai/atutej/marin_speculator/runs/ybr8eodk
- Dataset open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
