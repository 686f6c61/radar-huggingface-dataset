# fanqi-robo/pi0_insert_gear_in_gripper_lr0p5x_s1000

## Resumen

Este repositorio contiene un ajuste fino del modelo de visión-lenguaje-acción (VLA) pi0, en concreto de `lerobot/pi0_base`, entrenado por el usuario `fanqi-robo` para una única tarea robótica: insertar un engranaje en la pinza (*insert_gear_in_gripper*) con un robot bimanual YAM. El modelo conserva la arquitectura de pi0 (backbone PaliGemma, compuesto por un codificador visual y un modelo de lenguaje, más un *action expert* que genera acciones mediante *flow matching*) y tiene 4.028.019.472 parámetros, todos ellos entrenables durante el ajuste.

El entrenamiento se realizó sobre 50 episodios y 27.228 fotogramas del dataset `fanqi-robo/insert_gear_in_gripper`, con 20.000 actualizaciones a *batch* efectivo 32 en una NVIDIA H100 de 80 GB durante 13,5 horas de GPU. El modelo predice y ejecuta bloques (*chunks*) de 50 acciones a partir de un estado conjunto de 14 dimensiones y tres cámaras de 720x1280, con una latencia de inferencia declarada de 227,6 ms.

Su interés es fundamentalmente metodológico: se publica como punto de comparación de un banco de pruebas interno (learning rate 0,5x, semilla 1000) y permite estudiar el efecto de un ajuste fino completo de un VLA de 4B sobre un dataset muy reducido, así como el desajuste observado entre la pérdida de validación y el error de acción medido fuera de línea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0: backbone PaliGemma (codificador visual + modelo de lenguaje) con *action expert* y generación de acciones por *flow matching* |
| Parámetros totales | 4.028.019.472 (todos entrenables) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el checkpoint se distribuye en bfloat16 y no se publican variantes cuantizadas (GGUF, AWQ, etc.) |
| Idiomas soportados | no disponible; el modelo está especializado en una tarea robótica y no declara capacidades lingüísticas evaluadas |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El punto de partida es `lerobot/pi0_base` (revisión `26b99b94`), un VLA preentrenado con backbone PaliGemma y un *action expert*. La política se entrena con un objetivo de *flow matching*: la pérdida de validación reportada es el MSE de *flow matching* de `policy.forward` en modo evaluación, con un único muestreo de ruido por lote bajo semilla fija, y los pasos de acción rellenados (*padding*) cuentan como objetivos porque pi0 no dispone de máscara de *padding*.

El ajuste fino es completo: `freeze_vision_encoder=false` y `train_expert_only=false`, en bfloat16 y con *gradient checkpointing*. Se usó AdamW con decaimiento coseno y *warmup* (preset 1000/30000 reescalado por lerobot a *warmup* 666 / decaimiento 20000), con `optimizer_lr=1.25e-05` y `scheduler_decay_lr=1.25e-06`, 20.000 actualizaciones a *batch* efectivo 32 (32 x 1, una sola GPU) y semilla 1000. No se aplicó aumento de imagen. La normalización de estado y acción usa media y desviación típica del conjunto de entrenamiento, y las imágenes se reescalan dentro del modelo. La entrada incluye estado y acción conjuntos de 14 dimensiones (YAM bimanual) y tres cámaras de 720x1280; la salida es un bloque de 50 acciones predichas y 50 ejecutadas. No se conoce preentrenamiento específico del *embodiment* para el YAM bimanual.

## Capacidades

- Generación de acciones robóticas en bloques de 50 pasos (*action chunking*) mediante *flow matching*.
- Percepción visual a partir de tres cámaras simultáneas de resolución 720x1280.
- Manejo de estado y acción conjuntos de 14 dimensiones para un robot bimanual YAM.
- Ejecución de una tarea de manipulación de precisión: insertar un engranaje en la pinza.
- Inferencia en modo evaluación con latencia declarada de 227,6 ms por bloque de 50 acciones.
- No se documenta soporte de *tool calling*, *function calling*, uso como agente conversacional, razonamiento multi-paso genérico, ni capacidades de audio o de diálogo multilingüe: no disponible.

## Casos de uso

- Automatización de una celda de montaje: el modelo ejecuta directamente la inserción del engranaje en la pinza a partir de las tres cámaras y del estado conjunto, sin necesidad de programación explícita de trayectorias.
- Banco de pruebas (*baseline*) para comparar futuros ajustes finos de pi0 sobre la misma tarea: el repositorio `main` (actualización 20000) se define explícitamente como punto de comparación del benchmark.
- Estudio de hiperparámetros en VLA: al haberse entrenado con learning rate 0,5x y semilla 1000, sirve como una de las condiciones de una comparativa sistemática de tasa de aprendizaje y semilla.
- Investigación sobre sobreajuste en políticas robóticas: con solo 27.228 fotogramas de entrenamiento y una pérdida de validación mucho mejor en la actualización 851 (0,0659696) que en la final (0,216177), es un caso útil para analizar la divergencia entre pérdida de validación y error de acción real.
- Evaluación fuera de línea de políticas: el modelo se puede puntuar con MAE@10 y MAE@30 sobre el conjunto de validación `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5) sin necesidad de ejecución física.
- Despliegue en robótica de manipulación bimanual de precisión: con 227,6 ms por bloque de 50 acciones, encaja en bucles de control de baja frecuencia (del orden de 4,4 bloques por segundo).
- Reproducción de experimentos: el repositorio incluye `benchmark_run.json`, `metrics.jsonl` y `run_summary.json`, lo que permite reproducir y auditar la configuración de entrenamiento.
- Generación de datos y evaluación comparativa de políticas en pipelines de LeRobot 0.5.1, integrando el checkpoint como una política más dentro del ecosistema.

## Benchmarks y rendimiento

Evaluación fuera de línea sobre los episodios reservados (`villekuosmanen/insert_gear_in_gripper_val`, revisión `7c4d62f3`, 423 consultas, un fotograma de cada 5), en las unidades de articulación del dataset. La referencia `hold` (mantener la pose actual) obtiene MAE@30 = 2,60.

| Actualización | MAE@10 | MAE@30 | k=1 | k=30 | brazo (arm) | rec. pinza (grip rec) | dt pinza (grip dt) |
|---|---|---|---|---|---|---|---|
| 851 | 1,31 | 2,17 +/- 0,38 | 0,83 | 3,36 | 0,95 | 0,46 | 4,5 |
| 1702 | 1,28 | 2,15 +/- 0,68 | 0,79 | 3,26 | 0,97 | 0,51 | 4,7 |
| 2553 | 1,15 | 1,90 +/- 0,46 | 0,77 | 2,94 | 0,95 | 0,60 | 4,2 |
| 3404 | 1,09 | 1,79 +/- 0,42 | 0,71 | 2,77 | 0,94 | 0,63 | 4,7 |
| 4000 | 1,08 | 1,81 +/- 0,46 | 0,72 | 2,85 | 0,97 | 0,68 | 3,8 |
| 4255 | 1,08 | 1,78 +/- 0,48 | 0,70 | 2,77 | 0,97 | 0,68 | 4,1 |
| 5106 | 1,02 | 1,67 +/- 0,42 | 0,67 | 2,60 | 0,99 | 0,62 | 3,1 |
| 5957 | 1,07 | 1,78 +/- 0,54 | 0,70 | 2,76 | 0,96 | 0,70 | 3,7 |
| 6808 | 1,10 | 1,84 +/- 0,61 | 0,71 | 2,84 | 0,96 | 0,59 | 3,2 |
| 7659 | 1,07 | 1,77 +/- 0,50 | 0,69 | 2,75 | 0,95 | 0,71 | 3,4 |
| 8000 | 1,04 | 1,74 +/- 0,46 | 0,68 | 2,71 | 0,95 | 0,67 | 3,1 |
| 8510 | 1,02 | 1,70 +/- 0,46 | 0,65 | 2,66 | 0,97 | 0,70 | 3,3 |
| 9361 | 1,03 | 1,74 +/- 0,51 | 0,66 | 2,74 | 0,96 | 0,68 | 4,3 |
| 10212 | 1,01 | 1,72 +/- 0,48 | 0,65 | 2,70 | 0,96 | 0,71 | 4,0 |
| 11063 | 1,01 | 1,72 +/- 0,49 | 0,64 | 2,70 | 0,96 | 0,70 | 3,8 |
| 11914 | 1,02 | 1,74 +/- 0,53 | 0,64 | 2,74 | 0,96 | 0,70 | 4,3 |
| 12000 | 1,00 | 1,73 +/- 0,54 | 0,63 | 2,74 | 0,97 | 0,70 | 3,7 |
| 12765 | 1,01 | 1,72 +/- 0,51 | 0,64 | 2,70 | 0,95 | 0,71 | 4,2 |
| 13616 | 1,02 | 1,72 +/- 0,48 | 0,66 | 2,71 | 0,96 | 0,70 | 3,5 |
| 14467 | 0,98 | 1,68 +/- 0,46 | 0,62 | 2,65 | 0,96 | 0,70 | 3,6 |
| 15318 | 1,00 | 1,70 +/- 0,49 | 0,63 | 2,68 | 0,96 | 0,68 | 3,9 |
| 16000 | 1,00 | 1,69 +/- 0,47 | 0,63 | 2,66 | 0,96 | 0,70 | 3,6 |
| 16169 | 1,00 | 1,70 +/- 0,50 | 0,63 | 2,68 | 0,96 | 0,70 | 3,9 |
| 17020 | 1,00 | 1,70 +/- 0,49 | 0,63 | 2,68 | 0,96 | 0,68 | 4,1 |
| 17871 | 1,00 | 1,70 +/- 0,50 | 0,63 | 2,68 | 0,96 | 0,68 | 4,2 |
| 18722 | 0,99 | 1,68 +/- 0,46 | 0,64 | 2,65 | 0,96 | 0,68 | 3,9 |
| 19573 | 0,99 | 1,68 +/- 0,47 | 0,62 | 2,66 | 0,96 | 0,70 | 3,9 |
| 20000 (final) | 0,99 | 1,68 +/- 0,46 | 0,63 | 2,65 | 0,96 | 0,68 | 3,8 |

Otras cifras declaradas: pérdida de validación 0,216177 en la actualización final y mejor valor de 0,0659696 en la actualización 851; pérdida de entrenamiento (última ventana) 0,00913936; latencia de inferencia 227,6 ms. El autor advierte que la pérdida de validación sirve para ordenar los checkpoints de esta misma ejecución y no es comparable entre políticas distintas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros): no disponible.

## Requisitos de hardware

- Entrenamiento documentado: 1 x NVIDIA H100 80GB HBM3, VRAM pico de 44,4 GB y 13,5 horas de GPU para 20.000 actualizaciones a batch efectivo 32 en bfloat16 con *gradient checkpointing*.
- VRAM de inferencia: no publicada. Como estimación derivada del recuento de parámetros, los pesos en bfloat16 ocupan unos 8,06 GB y en fp32 unos 16,1 GB, a lo que hay que sumar activaciones y el preprocesado de tres imágenes de 720x1280.
- GPU recomendadas: la única configuración validada en la documentación es la H100 de 80 GB para entrenamiento. Para inferencia no se indica ninguna GPU concreta: no disponible.
- GPU de consumo: no confirmado. Una GPU con 24 GB (por ejemplo, RTX 4090) podría alojar los pesos en bfloat16 según la estimación anterior, pero no hay ningún resultado publicado que lo verifique.
- Opciones de despliegue: la vía documentada es la librería `lerobot` 0.5.1, con los ficheros `benchmark_run.json`, `metrics.jsonl` y `run_summary.json` para reproducir la ejecución. No se documentan exportaciones a vLLM, TGI, llama.cpp, Ollama ni ONNX.
- Latencia y *throughput*: 227,6 ms por inferencia (un bloque de 50 acciones). Como cálculo derivado, esto equivale a unos 4,4 bloques por segundo y a unos 220 pasos de acción por segundo si se ejecuta el bloque completo. El *throughput* con lotes mayores no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi0_insert_gear_in_gripper_lr0p5x_s1000` (este) | 4.028.019.472 | no disponible | `insert_gear_in_gripper`, YAM bimanual, 14-D | Gemma Terms of Use | HuggingFace, 11 descargas, 0 *likes* |
| `lerobot/pi0_base` | mismo recuento (4.028.019.472), ya que el ajuste entrena todos los parámetros | no disponible | VLA preentrenado generalista (PaliGemma + *action expert*) | Gemma Terms of Use | HuggingFace |
| Otros VLA del ecosistema LeRobot (SmolVLA, pi0-FAST) o alternativas como GR00T N1 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: el autor advierte además que la pérdida de validación no es comparable entre políticas distintas, y el único punto de referencia numérico del repositorio es el *baseline* `hold` (mantener la pose actual), con MAE@30 = 2,60 frente a 1,68 del modelo final.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para una única tarea (`insert_gear_in_gripper`), un único *embodiment* (YAM bimanual, estado y acción de 14 dimensiones) y una configuración concreta de tres cámaras de 720x1280. No es reutilizable en otros robots o tareas sin un nuevo ajuste fino.
- Dataset de entrenamiento muy pequeño: 50 episodios y 27.228 fotogramas. La pérdida de entrenamiento final (0,00913936) frente a la de validación (0,216177) y el hecho de que el mejor valor de validación se alcanzase en la actualización 851 (0,0659696) apuntan a sobreajuste.
- Desajuste entre métricas: la pérdida de validación de *flow matching* no correlaciona con el error de acción fuera de línea (en la actualización 851 la pérdida de validación es mucho menor, pero su MAE@30 de 2,17 es peor que el 1,68 final). El propio autor señala que esa pérdida solo ordena checkpoints de esta ejecución.
- Riesgo de acciones incorrectas fuera de distribución: en robótica el equivalente a la alucinación es una secuencia de acciones que no completa la tarea o que fuerza la pinza; los datos apuntan a un reconocimiento de pinza imperfecto (`grip rec` = 0,68 en el checkpoint final, con un máximo de 0,71 en varias actualizaciones intermedias).
- Sin máscara de *padding*: la propia model card indica que pi0 no dispone de máscara de *padding*, por lo que los pasos de acción rellenados cuentan como objetivos durante la evaluación.
- Sin aumento de imagen ni evaluación en el robot: toda la evidencia publicada es fuera de línea (error de bloque de acciones en bucle abierto); no se reportan tasas de éxito en ejecución real.
- Licencia: uso sujeto a las Gemma Terms of Use del modelo base. Hay que revisar esas condiciones antes de cualquier uso comercial.
- Idiomas y contexto: la ficha no declara idiomas soportados ni longitud de contexto, por lo que no se pueden asumir capacidades multilingües ni conversacionales.
- Madurez baja en la comunidad: 11 descargas, 0 *likes* y publicación reciente, sin validación externa independiente.
- No se documentan métodos de cuantización ni formatos alternativos de pesos, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi0_insert_gear_in_gripper_lr0p5x_s1000
- Ejecución de W&B: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/k5n551wd
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validación: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- LeRobot: https://github.com/huggingface/lerobot
- Papers específicos sobre este ajuste fino: no disponible en la información proporcionada.
