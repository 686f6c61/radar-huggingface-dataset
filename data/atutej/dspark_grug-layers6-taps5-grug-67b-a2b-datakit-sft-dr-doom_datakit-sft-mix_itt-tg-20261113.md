# atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itt-tg-20261113

## Resumen

`dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itt-tg-20261113` es un modelo *drafter* de decodificación especulativa (speculative decoding) del ecosistema DSpark, publicado por el usuario `atutej` en Hugging Face. No es un modelo de lenguaje generalista: es un cabezal auxiliar de 751 millones de parámetros que predice bloques de tokens para acelerar la generación del modelo objetivo `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom`, un modelo MoE de 67B parámetros totales con 2B activos y 262K de contexto.

El drafter emplea seis capas Grug densas (FFN de 7.936, `grug-qk-mult` 1.75) que consumen los estados ocultos de cinco capas del objetivo (2, 7, 12, 17 y 22, más la salida final), con tamaño de bloque 8, vocabulario de borrador reducido a 32.000 tokens, cabeza de Markov de rango 1024 y cabeza de confianza. Se entrenó con la librería `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`) sobre respuestas generadas por el propio modelo objetivo a prompts del conjunto Datakit SFT.

Su relevancia es práctica: la decodificación especulativa permite reducir la latencia de inferencia de modelos grandes sin alterar la distribución de salida, y este checkpoint publica métricas de longitud de aceptación (AL) por conjunto de prompts. El checkpoint corresponde al final de la primera época (paso 22.472 de un calendario de 382.747 pasos), por lo que no está anealed y su tasa de aprendizaje seguía en torno a 0,94 del pico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter DSpark con 6 capas Grug densas, 5 taps sobre capas del objetivo (2, 7, 12, 17, 22) mas salida final, cabeza Markov de rango 1024 y cabeza de confianza |
| Parametros totales | 751.156.225 |
| Parametros activos | no disponible (las capas son densas, `grug_num_experts: 0`) |
| Longitud de contexto | no disponible para el drafter; el objetivo soporta 262K y el entrenamiento uso secuencias de 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El drafter es un modelo auxiliar de decodificación especulativa con tamaño de bloque 8: propone hasta 8 tokens por paso, que el modelo objetivo verifica en paralelo. Su arquitectura son seis capas Grug densas con FFN de 7.936 y multiplicador QK de 1.75, que toman como entrada los estados ocultos de cinco capas intermedias del objetivo más su capa final. Sobre esa representación opera una cabeza de Markov de rango 1024 (variante vanilla) y una cabeza de confianza que estima la probabilidad de aceptación de cada token propuesto. El vocabulario de borrador se reduce a los 32.000 tokens supervisados más frecuentes del texto de entrenamiento, lo que reduce el coste de la softmax del drafter.

El entrenamiento se realizó en línea: vLLM sirvió los estados ocultos de las capas [2, 7, 12, 17, 22] y de la capa final del objetivo, transmitidos mediante Mooncake. Los datos son 281.000 filas con respuestas del propio modelo objetivo a temperatura 1 sobre prompts SFT de Datakit (subconjunto aleatorio de una regeneración de 400.000 filas), con unas 9,5k tokens y 6,2k tokens supervisados por fila. La pérdida combina entropía cruzada y distancia de variación total con pesos `{"ce": 0.1, "tv": 0.9}`, 12.288 anclas por fila de 32.768 tokens, semilla 0, y una sola época (22.472 pasos) sin repetición de filas. El 0,5% final de las filas se reservó para validación. El coste total fue de unas 25 horas en dos nodos GB200: 17,2 h generando respuestas y 8,1 h de entrenamiento.

## Capacidades

- Predicción especulativa de bloques de hasta 8 tokens para el modelo objetivo Grug-67B-A2B-Datakit-SFT.
- Estimación de confianza por token propuesto mediante cabeza dedicada, útil para el mecanismo de aceptación del servidor.
- Aceptación condicionada a los estados ocultos intermedios del objetivo (no funciona como modelo autónomo).
- Especialización en el estilo de respuesta del objetivo: se entrenó sobre sus propias generaciones a temperatura 1, no sobre respuestas humanas del dataset.
- Cobertura de dominios variada según los conjuntos evaluados: matemáticas (GSM8K, MATH-500, AIME), código (HumanEval, MBPP), conversación (MT-Bench), agentes (replay de SWE-bench) y prompts largos de hasta 31k tokens.
- No soporta tool calling, agentes ni generación multilingüe por sí mismo: hereda las capacidades del objetivo a través de la verificación.
- No dispone de modo thinking propio; los prompts de evaluación se renderizaron con la plantilla de chat del objetivo (`/think`).

## Casos de uso

- Aceleración de inferencia en producción del modelo Grug-67B-A2B: desplegar el drafter junto al objetivo en vLLM para reducir la latencia por token generado, con una longitud de aceptación media de 3,162 en los seis conjuntos de referencia (máximo teórico 9).
- Razonamiento matemático de cadena larga: en GSM8K y MATH-500 la AL alcanza 3,508 y 3,901 respectivamente, por lo que es adecuado para servir generaciones de hasta 2.048 tokens en cargas de matemáticas.
- Generación de código asistida: con AL de 3,053 en HumanEval y 3,141 en MBPP, encaja en asistentes de autocompletado y revisión de código donde el objetivo genera bloques predecibles.
- Agentes de ingeniería de software: en el replay de Snowball SWE-bench (1.366 turnos de agente, contextos de hasta 128k tokens) la AL es 3,632, lo que lo hace útil para pipelines agénticos con contexto muy largo.
- Prompts largos y documentos extensos: en `finance_v1` (256 prompts de unos 30k tokens) la AL sube a 4,022, el mejor resultado de la tabla, adecuado para análisis de documentos financieros.
- Atención al cliente multi-turno: en el conjunto Datakit held-out (1.024 prompts, primer turno y turnos posteriores) la AL es 3,114, lo que respalda su uso en conversaciones con historial.
- Evaluación e investigación en decodificación especulativa: el repositorio `atutej/spec-experiments` incluye scripts de entrenamiento y de evaluación de aceptación (`eval_matrix.sh`, `speedup_report.py`) reproducibles en el commit `1ab0d79`.

## Benchmarks y rendimiento

Resultados de longitud de aceptación (AL, incluyendo el token bonus; máximo 9) servidos en el fork de vLLM de Marin con 8 tokens drafteados, temperatura 1 y concurrencia de cliente 16, sobre nodos GB200. La velocidad (speedup) frente a decodificación plana no se midió para este checkpoint.

| Conjunto de prompts | AL | Max new tokens |
|---|---|---|
| GSM8K | 3,508 | 2.048 |
| MATH-500 | 3,901 | 2.048 |
| HumanEval | 3,053 | 2.048 |
| MBPP | 3,141 | 2.048 |
| MT-Bench (turno 1) | 2,729 | 2.048 |
| SPEED-Bench qualitative | 2,640 | 4.096 |
| Media de los seis anteriores | 3,162 | — |
| AIME 2024 + 2025 (240 respuestas) | 3,362 | 32.000 |
| Datakit held-out (1.024 prompts) | 3,114 | 4.096 |
| Datakit con filas largas (512 prompts, hasta 31k tokens) | 3,128 | 4.096 |
| Big-mix held-out (1.024 prompts) | 2,743 | 4.096 |
| `finance_v1` (256 prompts de ~30k tokens) | 4,022 | 4.096 |
| Snowball SWE-bench replay (1.366 turnos) | 3,632 | 2.048 |

## Requisitos de hardware

- El drafter pesa 751M parámetros y el repositorio ocupa 1,5 GB, por lo que en precisión nativa cabe holgadamente en cualquier GPU consumer con 8 GB o más de VRAM.
- El requisito real lo impone el modelo objetivo: un MoE de 67B totales y 2B activos requiere, como mínimo, varios aceleradores de datacenter para servirse con comodidad. El autor reporta despliegues en nodos GB200.
- GPU recomendadas para el conjunto drafter + objetivo: GB200 (usadas en el entrenamiento y la evaluación), H100 o A100 de 80 GB en configuraciones multi-GPU.
- El drafter por sí solo puede ejecutarse en una RTX 4090, pero sin el objetivo no produce generaciones útiles.
- Opciones de despliegue: vLLM con el soporte Grug DSpark del PR `marin-community/vllm#128` (rama `grug-dspark-layers-main` de `atutej/vllm`), todavía no incluido en una release. No hay soporte indicado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publicó la ganancia de velocidad (speedup) de este checkpoint; solo se dispone de la longitud de aceptación por conjunto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AL media | Licencia |
|---|---|---|---|---|---|
| Este drafter (`itt-tg`) | Drafter DSpark Grug, 6 capas | 751M | n/a (objetivo 262K) | 3,162 | no disponible |
| `dspark_..._datakit-sft-mix_itw-20261108` | Drafter DSpark Grug, 6 capas, contraparte con respuestas originales del dataset | no disponible | n/a | no disponible en la informacion | no disponible |
| Objetivo `Grug-67B-A2B-Datakit-SFT-262K` | MoE de lenguaje | 67B totales / 2B activos | 262K | n/a | no disponible |

No se dispone de datos de otros drafters o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona acoplado al objetivo `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom` y requiere el soporte Grug DSpark de vLLM, aún no fusionado en una release estable.
- El checkpoint no está anealed: corresponde al paso 22.472 de un calendario de 382.747 pasos, con la tasa de aprendizaje en torno a 0,94 del pico (3e-4). No se publicó un mejor checkpoint seleccionado por validación.
- Entrenado sobre las respuestas del propio objetivo a temperatura 1, no sobre respuestas humanas del dataset; la contraparte `itw` cubre ese otro régimen y conviene elegir según el estilo de generación esperado.
- La licencia no está declarada, lo que impide confirmar condiciones de uso comercial.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del drafter; al verificar el objetivo, la calidad final del texto depende de este.
- La velocidad de decodificación no se midió: la AL es un proxy, pero no garantiza un speedup proporcional en todos los despliegues.
- Los resultados provienen de una sola ejecución por celda, con concurrencia 16 y en GB200; pueden no extrapolarse a otras configuraciones de hardware o de servidor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (13 de noviembre de 2026), por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itt-tg-20261113
- Modelo objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Contraparte con respuestas originales del dataset: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108
- Repositorio de experimentos (commit `1ab0d79`): https://github.com/atutej/spec-experiments/tree/1ab0d79
- Carpeta de entrenamiento: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/experiments/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_targetgen
- Herramientas de evaluación de aceptación: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/tools/eval_acceptance
- Entrenador `speculators` (rama `grug-dspark-gate`): https://github.com/atutej/speculators
- PR de soporte Grug DSpark en vLLM: https://github.com/marin-community/vllm/pull/128
- Logs de entrenamiento (job 1): https://wandb.ai/atutej/marin_speculator/runs/8xse7mvw
- Logs de entrenamiento (job 2): https://wandb.ai/atutej/marin_speculator/runs/sxlledzs
