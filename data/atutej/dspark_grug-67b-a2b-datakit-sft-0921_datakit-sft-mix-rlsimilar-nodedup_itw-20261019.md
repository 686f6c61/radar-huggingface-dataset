# atutej/dspark_grug-67b-a2b-datakit-sft-0921_datakit-sft-mix-rlsimilar-nodedup_itw-20261019

## Resumen

`atutej/dspark_grug-67b-a2b-datakit-sft-0921_datakit-sft-mix-rlsimilar-nodedup_itw-20261019` es un *drafter* de decodificación especulativa construido con la técnica DSpark, no un modelo de lenguaje de propósito general. Su única función es proponer bloques de tokens candidatos que el modelo objetivo —`open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21`, un MoE de 67B de parámetros totales y 2B activos con 262.144 tokens de contexto— verifica después en paralelo. El drafter tiene 280.416.257 parámetros, 3 capas, tamaño de bloque 8 y un vocabulario de borrador reducido a 32.000 entradas.

Lo publica el usuario `atutej` y se entrenó con la librería `speculators` (fork propio, rama `grug-dspark-gate`). El interés práctico está en que la decodificación especulativa es una de las pocas vías para reducir la latencia de un MoE de 67B sin tocar sus pesos: si el drafter acierta una media de 4,38 tokens por bloque de 8, el número de pasos de verificación del modelo grande cae aproximadamente a la mitad.

El detalle menos habitual es el diseño del dataset: en lugar de entrenar con datos genéricos, se seleccionaron las filas del mixture SFT del modelo objetivo cuya primera interacción era más similar a los *prompts* de RL de Snowball, sin deduplicar. El resultado es un drafter muy ajustado a una distribución concreta de prompts, con un 70,2 % de filas repetidas en el conjunto de entrenamiento y una validación medida únicamente en esa misma distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DSpark: 3 capas, cabeza Markov de rango 256 (vanilla), cabeza de confianza, tamano de bloque 8, vocabulario de borrador reducido a 32.000 |
| Parametros totales | 280.416.257 |
| Parametros activos | No procede (el drafter no es MoE); el modelo objetivo es un MoE A2B con 2B de parametros activos |
| Longitud de contexto | 32.768 tokens de secuencia de entrenamiento (32768 de longitud de secuencia, 12288 anclas maximas); el objetivo soporta 262.144 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no documentado; el drafter hereda el tokenizador y el vocabulario del objetivo) |
| Licencia | No disponible |
| Formato de pesos | safetensors, con `custom_code` (requiere el codigo del repo y la libreria `speculators`) |

Otros datos: tamano del repositorio 0,6 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-19. Modelo base declarado: `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21`.

## Arquitectura y entrenamiento

El drafter es una red pequena de 3 capas que consume los estados ocultos del modelo objetivo en las capas [2, 12, 22] mas la capa final, servidos en streaming por vLLM a traves de Mooncake durante el entrenamiento. Sobre esa entrada predice un bloque de 8 tokens con una cabeza Markov de rango 256 y una cabeza de confianza que estima la probabilidad de aceptacion de cada posicion. La perdida combina entropia cruzada y *total variation* con pesos 0,1 y 0,9 respectivamente. Se entreno con longitud de secuencia 32.768, un maximo de 12.288 anclas, tasa de aprendizaje 0,0003 con decaimiento lineal hasta cero y una sola epoca (80.098 pasos, aproximadamente 9,7B de tokens), repartida en dos segmentos porque el primero choco con el limite de 12 horas de trabajo.

Los datos son la parte mas discutible del diseno. Se partio de las 84.403 filas de entrenamiento de `open-athena/Nemotron-RL-Ultra-RLVR1-Cleaned-v3-2026-09-30`, se embebio el mensaje de sistema mas el primer turno de usuario con `google/embeddinggemma-2` (bf16, truncado a 8.192 tokens) y se calculo el top-64 exacto por similitud coseno sobre las 6.471.159 filas del mixture SFT del objetivo. Se tomaron rondas sucesivas (la r-esima fila mas cercana de cada prompt) hasta agotar un presupuesto de 9,7B tokens: 16 rondas completas mas una 17 parcial con subconjunto aleatorio (semilla 0). Sin umbral de similitud y sin deduplicar: se seleccionaron 1.379.901 filas, de las que solo 411.172 son distintas (968.729 repeticiones, 70,2 %); esas filas distintas aportan 2,50B de los 9,70B tokens. La similitud coseno media de la fila mas cercana es 0,942 y baja a 0,900 en el rango 17. El 0,1 % final de filas se reserva para validacion, de modo que una misma fila repetida puede caer a la vez en entrenamiento y validacion.

## Capacidades

- Redaccion especulativa de tokens: propone bloques de hasta 8 tokens para que el modelo objetivo los verifique en una sola pasada.
- Estimacion de confianza por posicion, usada para truncar el bloque borrador cuando la probabilidad de aceptacion decae (posicion 0: 0,8512 de acierto; posicion 7: 0,5004).
- Integracion con el objetivo Grug-67B-A2B via `lm_head` y *gated final norm* del propio objetivo, con vocabulario de borrador restringido a 32.000 entradas.
- Funciona con *prompts* de tipo RL y reasoning (thinking activado en la evaluacion), que es la distribucion con la que se entreno.
- No genera texto de forma autonoma: no es un modelo servible sin el objetivo.
- No hay soporte documentado de *tool calling*, capacidades de agente, vision, audio ni multilingueismo propio.

## Casos de uso

- Aceleracion del serving de Grug-67B-A2B en produccion: desplegar el drafter junto al objetivo en vLLM para reducir el numero de pasos de decodificacion; con una longitud aceptada de 4,38 sobre 8, el objetivo verifica en torno a la mitad de pasos que en decodificacion autoregresiva pura.
- Chat interactivo de baja latencia sobre el modelo de 262K de contexto: el coste dominante en un MoE con 2B activos es la latencia por token, y el drafter ataca directamente ese cuello de botella.
- RAG de documentos largos: al mantenerse la ventana de 262.144 tokens del objetivo, el drafter acelera la generacion de respuestas largas sobre contextos extensos sin cambiar la arquitectura.
- Bucles de agente con muchos turnos cortos: cada turno implica generar pocos cientos de tokens; reducir pasos por token abarata el coste total del bucle.
- Generacion por lotes en pipelines offline: con DP=4 y concurrencia 16 (la configuracion reportada), el ahorro de pasos se traduce en mayor throughput por nodo.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para estudiar el efecto de la seleccion de datos por similitud, la deduplicacion y el tamano de bloque en la tasa de aceptacion.
- Entrenamiento de drafters para dominios concretos: el pipeline (embeddings de `embeddinggemma-2`, top-k por coseno, rondas hasta presupuesto de tokens) es reutilizable para otras distribuciones de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un drafter. La validacion es *teacher-forced* y sobre filas de la propia distribucion de entrenamiento:

| Metrica | Valor |
|---|---|
| loss_epoch | 0,4068 |
| ce_loss_epoch | 0,6245 |
| tv_loss_epoch | 0,1476 |
| accept_rate_epoch | 0,6325 |
| accept_len_epoch | 4,3802 |
| eal_epoch | 4,6406 |
| full_acc_epoch | 0,6515 |
| confidence_loss_epoch | 0,2115 |
| confidence_abs_error_epoch | 0,1657 |
| confidence_pred_mean_epoch | 0,6325 |
| confidence_cumprod_bias_epoch | -0,0118 |
| position_0_acc_epoch | 0,8512 |
| position_1_acc_epoch | 0,7754 |
| position_2_acc_epoch | 0,7113 |
| position_3_acc_epoch | 0,6570 |
| position_4_acc_epoch | 0,6103 |
| position_5_acc_epoch | 0,5707 |
| position_6_acc_epoch | 0,5348 |
| position_7_acc_epoch | 0,5004 |

El autor reporta ademas un experimento de serving contra `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom` (un fine-tune anti-bucle del objetivo del 09.21), en un nodo de 4 GB200 con TP=1, DP=4 y *expert parallel*, concurrencia 16, temperatura 1, 8 tokens borradorados y verificacion estandar; los valores numericos de ese experimento no estan disponibles en la informacion proporcionada (el texto de la model card aparece truncado).

## Requisitos de hardware

- VRAM del drafter: en bf16, 280M de parametros ocupan aproximadamente 0,56 GB, mas overhead de activaciones y de la cabeza Markov; cabe holgadamente en cualquier GPU consumer.
- Requisito real: el drafter no funciona solo. Necesita el objetivo Grug-67B-A2B cargado, lo que domina por completo el presupuesto de memoria (67B en bf16 superan los 130 GB y exigen varios aceleradores o cuantizacion, esta ultima no documentada).
- Configuracion reportada por el autor: un nodo de 4 GPU GB200, TP=1, DP=4, *expert parallel*, concurrencia 16.
- GPU consumer: el drafter en si cabe en una RTX 4090 o similar, pero el objetivo no; no tiene sentido desplegarlo aislado en hardware de consumo.
- Despliegue: fork de vLLM fijado por Marin (el usado en la evaluacion) y la libreria `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`). No hay soporte documentado para llama.cpp, Ollama, GGUF ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; la metrica relevante es `accept_len_epoch` = 4,3802 tokens aceptados por bloque de 8.

## Comparativa con modelos similares

No hay datos publicados de alternativas en la informacion disponible; la comparacion es cualitativa y los valores numericos de los otros drafters no se han verificado aqui.

| Modelo | Tipo | Parametros | Contexto | Tasa de aceptacion | Licencia |
|---|---|---|---|---|---|
| Este drafter (DSpark) | Drafter con cabeza Markov y de confianza, bloque 8 | 280,4M | 32.768 (entrenamiento) | 4,38 tokens/bloque (teacher-forced) | No disponible |
| Drafters estilo EAGLE-3 | Drafter de 1 capa sobre estados ocultos | No disponible | Depende del objetivo | No disponible | No disponible |
| Cabezas Medusa | Cabezas multiples sobre el objetivo | No disponible | Depende del objetivo | No disponible | No disponible |
| Lookup decoding / n-gramas | Sin entrenamiento, basado en coincidencia de secuencias | 0 | Depende del objetivo | No disponible | No aplica |

La diferencia practica frente a Medusa es que aqui no se modifica el modelo objetivo: el drafter es un artefacto separado que se acopla por los estados ocultos y el `lm_head`. Frente a EAGLE, el autor anade una cabeza de confianza explicitamente entrenada y un vocabulario de borrador reducido a 32.000.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Grug-67B-A2B cargado no produce nada util.
- Rendimiento medido solo *teacher-forced* y sobre la distribucion de entrenamiento; no hay evaluacion en prompts fuera de ese dominio. La tasa de aceptacion caera en dominios alejados del mixture SFT y de los prompts de RL.
- El 70,2 % de las filas seleccionadas son repeticiones (1.379.901 filas para 411.172 distintas); el modelo ha visto efectivamente 2,50B tokens unicos repartidos en 9,70B. Riesgo de sobreajuste a los prompts mas cercanos.
- La validacion usa el 0,1 % final de filas sin deduplicar, de modo que filas repetidas pueden estar simultaneamente en entrenamiento y validacion; las metricas de validacion estan probablemente optimistas.
- Solo se evaluo contre el objetivo `...-dr-doom`, un fine-tune del objetivo del 09.21: es transferencia a un objetivo distinto del usado para extraer estados ocultos, y no hay resultados contra el objetivo original.
- Licencia no declarada: no hay autorizacion explicita de uso comercial. Verificar antes de cualquier despliegue en produccion.
- Requiere `custom_code` y una version concreta de la libreria `speculators` y del fork de vLLM; la compatibilidad con versiones estandar de vLLM no esta documentada.
- Vocabulario de borrador limitado a 32.000 entradas: el drafter no puede proponer tokens fuera de ese subconjunto, lo que recorta la tasa de aceptacion en textos con tokens raros o de otros idiomas.
- Idiomas no documentados; no hay evidencia de comportamiento multilingue.
- 0 descargas y 0 likes: sin validacion por terceros.
- Riesgo de alucinacion y sesgos: heredados integramente del modelo objetivo, ya que el drafter no introduce conocimiento propio; la verificacion del objetivo garantiza que el texto final es el que el objetivo habria generado con esa semilla, salvo diferencias por no determinismo numerico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft-0921_datakit-sft-mix-rlsimilar-nodedup_itw-20261019
- Modelo objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21
- Objetivo evaluado (Dr. Doom): https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Dataset de prompts de RL: https://huggingface.co/datasets/open-athena/Nemotron-RL-Ultra-RLVR1-Cleaned-v3-2026-09-30
- Modelo de embeddings: https://huggingface.co/google/embeddinggemma-2
- Parametros de seleccion de datos: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft-0921_datakit-sft-mix-rlsimilar-nodedup_itw-20261019/blob/main/training_data_selection.json
- Filas seleccionadas: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft-0921_datakit-sft-mix-rlsimilar-nodedup_itw-20261019/blob/main/training_data_selection_rows.npz
- Mixture SFT del objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21/blob/main/training_data_mix.json
- Mixture de referencia en Marin: https://github.com/marin-community/marin/blob/82620ad62bbe23b9b12a89d656c24e6f80aff91a/experiments/grug_sft/special_token_1000_mix.json
- Logs de entrenamiento, segmento 1: https://wandb.ai/atutej/marin_speculator/runs/zqrn30f3
- Logs de entrenamiento, segmento 2: https://wandb.ai/atutej/marin_speculator/runs/3n9ot2bv
- Libreria `speculators` (fork del autor, rama `grug-dspark-gate`): no se proporciona URL en la informacion disponible
- Paper de DSpark: no disponible
