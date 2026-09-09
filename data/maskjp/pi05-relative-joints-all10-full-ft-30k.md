# maskjp/pi05-relative-joints-all10-full-ft-30k

## Resumen

El modelo `maskjp/pi05-relative-joints-all10-full-ft-30k` es un fine-tuning completo de `lerobot/pi05_base`, un modelo de política robótica vision-language-action (VLA) desarrollado por LeRobot. Está entrenado para controlar un brazo robótico u850 sobre una base móvil, mediante acciones en el espacio articular de 10 dimensiones (6 articulaciones del brazo, gripper, base_x, base_y y base_yaw), condicionadas por instrucciones en lenguaje natural y con entrada visual de tres cámaras (izquierda, derecha y muñeca).

El modelo se entrena sobre 11 tareas de manipulación y 1499 episodios (3.089.476 frames, 17.2 horas a 50 fps). La innovación principal es el uso de acciones relativas al estado de observación al inicio de cada chunk, con la excepción del gripper, que se mantiene absoluto. La normalización se realiza con QUANTILES calculados sobre los offsets relativos, y la rotación del efector final se almacena en su forma 6D continua.

Este checkpoint concreto es el paso 30K de un run de 100K. La pérdida en validación (eval_loss) en este paso es un 12% superior al mínimo del run, que se alcanza en el paso 20K. Por tanto, no son los mejores pesos; se publican para comparaciones por pasos con rondas anteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica VLA (visión-lenguaje-acción) basada en lerobot/pi05_base |
| Parametros totales | 4.143.404.816 (4.14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de políticas robóticas; genera acciones en chunks de 50 pasos y ejecuta 10) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de `lerobot/pi05_base`, que combina un codificador de visión, un modelo de lenguaje y un experto de acciones. No se detalla en la información disponible si emplea attention lineal u otras innovaciones arquitectónicas más allá de las heredadas del modelo base. El proceso de entrenamiento utilizó un batch efectivo de 63 (21 por rank en 3 ranks), tasa de aprendizaje 2.5e-5 con decaimiento coseno a 2.5e-6 sobre 100K pasos y 1000 pasos de warmup. La torre de visión se entrena a un 0.1x de la tasa de aprendizaje. La precisión es bfloat16 y se activó gradient checkpointing.

La representación de acciones es relativa al estado de observación en el inicio de cada chunk, excepto el gripper. El procesador resta el estado ancla en tiempo de ejecución y lo vuelve a sumar a la salida, por lo que la política emite acciones absolutas durante la inferencia. La normalización QUANTILES se calcula sobre los offsets relativos, no sobre las acciones absolutas. La rotación del efector final se almacena como forma 6D continua (dos primeras columnas de la matriz de rotación), porque en este robot el gripper apunta hacia abajo y una representación axis-angle provocaría saltos de 2π en el ángulo.

Los datos de entrenamiento provienen de los datasets `L5vel/*-eef-merged-v30` e incluyen 11 tareas condicionadas por lenguaje. La mezcla de tareas está desequilibrada: las cuatro tareas más grandes representan aproximadamente el 82% de los frames, y el muestreo es uniforme sobre frames, sin rebalanceo.

## Capacidades

- Generación de acciones de control en espacio articular: 10 dimensiones (6 articulaciones del brazo, gripper, base_x, base_y, base_yaw).
- Condicionamiento por lenguaje natural: las tareas se especifican mediante instrucciones textuales.
- Entrada visual multi-cámara: utiliza tres cámaras (izquierda, derecha y muñeca).
- Generación de acciones por chunks: predice 50 pasos de acción y ejecuta 10.
- No es un modelo de lenguaje generativo: no produce texto, no soporta tool calling, ni agentes conversacionales, ni razonamiento simbólico.

## Casos de uso

- Robótica de almacén para recogida de paquetes: el modelo puede recibir instrucciones como "pick up the grocery bag from the ground" y ejecutar la secuencia completa para recoger una bolsa del suelo y colocarla sobre una mesa. Es adecuado porque fue entrenado con esta tarea y con datos de un brazo móvil con base.
- Apertura de puertas y navegación en interiores: la tarea "open the door and move inside" permite a un robot móvil abrir una puerta y atravesarla, útil en entornos domésticos o instalaciones industriales.
- Gestión de bebidas en refrigeradores: la tarea "grab a drink from the fridge" es la más representada (968.523 frames) y capacita al robot para acceder al interior de una nevera y recoger bebidas.
- Limpieza de superficies: la tarea "clean the table with the green towel" entrena al robot para limpiar mesas con un paño, aplicable en limpieza doméstica o de oficinas.
- Preparación de alimentos y servicios de mesa: la tarea "move the croissant to the empty plate" habilita la manipulación de objetos delicados, como alimentos, en cocinas automatizadas o robots de servicio.
- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para fine-tuning en nuevas tareas, dada su licencia Apache-2.0 y su representación de acciones relativas.
- Comparación de checkpoints en investigación: este checkpoint (30K) está publicado para análisis de la curva de pérdida en validación y para comparar el efecto del número de pasos en el rendimiento, junto con el checkpoint de 20K.

## Benchmarks y rendimiento

No se han publicado benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica proporcionada es la pérdida en validación (eval_loss) durante el entrenamiento, en un conjunto de 77 episodios retenidos de un total de 1499:

| Paso | eval_loss |
|---|---|
| 5K | 0.0263 |
| 10K | 0.0238 |
| 15K | 0.0245 |
| 20K | 0.0237 (mínimo) |
| 25K | 0.0256 |
| 30K | 0.0266 (este checkpoint) |

La curva aumenta después del paso 20K, por lo que este checkpoint de 30K tiene una pérdida en validación un 12% superior al mínimo del run.

## Requisitos de hardware

- Pesos en safetensors en bfloat16: ~8.3 GB en memoria (4.143.404.816 parámetros × 2 bytes). El repositorio ocupa 9.4 GB en disco, incluidas las metadata.
- Para inferencia en tiempo real se recomienda una GPU con al menos 16 GB de VRAM, aunque el autor no proporciona datos confirmados.
- El entrenamiento se realizó con 3 ranks y batch efectivo de 63, con bfloat16 y gradient checkpointing; se requieren GPUs de gama alta (el modelo exacto no se especifica).
- Despliegue: mediante LeRobot, cargando con `PI05Policy.from_pretrained`. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Paso | eval_loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| maskjp/pi05-relative-joints-all10-full-ft-30k | 4.14B | 10 datasets, 11 tareas, 1499 episodios | 30K | 0.0266 | Apache-2.0 | HuggingFace |
| maskjp/pi05-relative-joints-all10-full-ft-20k | 4.14B | Mismo dataset | 20K | 0.0237 (mínimo) | Apache-2.0 | HuggingFace |
| maskjp/pi05-relative-joints-full-ft-30k | 4.14B | 7 datasets / 949 episodios | 30K | No disponible | Apache-2.0 | HuggingFace |
| lerobot/pi05_base | 4.14B | No disponible (modelo base) | — | No disponible | Apache-2.0 | HuggingFace |

El checkpoint de 30K de la ronda anterior (7 datasets) no es un reemplazo directo, porque fue entrenado con datos diferentes. El checkpoint de 20K de este mismo run es preferible para despliegue, ya que alcanza el mínimo de pérdida en validación.

## Limitaciones y advertencias

- Este checkpoint (30K) no es el mejor de su run: la pérdida en validación es un 12% mayor que el mínimo obtenido en el paso 20K. Para producción se recomienda usar `maskjp/pi05-relative-joints-all10-full-ft-20k`.
- La curva de pérdida en validación aumenta después del paso 20K, lo que sugiere sobreajuste o degradación del modelo en los datos de validación.
- La mezcla de datos de entrenamiento está desequilibrada: las cuatro tareas más grandes representan ~82% de los frames, sin rebalanceo. Esto puede limitar la generalización a tareas menos representadas.
- El preprocesamiento de acciones relativas no es una reescritura de datos, sino un transform del procesador. Si se carga el modelo con stock LeRobot y la metadata aplanada, el gripper podría relativizarse silenciosamente, produciendo comportamientos incorrectos.
- La rotación del efector final se almacena en forma 6D continua. Convertirla a axis-angle puede causar saltos de 2π, dificultando el control fino del gripper.
- No se han publicado benchmarks de rendimiento en tareas de referencia ni comparaciones con otros modelos de manipulación robótica.
- El idioma de las instrucciones no se especifica; los nombres de las tareas están en inglés, pero no se confirma el conjunto de idiomas soportados.

## Enlaces

- Modelo principal: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-30k
- Checkpoint de 20K: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-20k
- Ronda anterior (7 datasets): https://huggingface.co/maskjp/pi05-relative-joints-full-ft-30k
- Modelo relacionado de ronda anterior: https://huggingface.co/maskjp/pi05-relative-joints-full-ft
- Checkpoint de 15K de la ronda anterior: https://huggingface.co/maskjp/pi05-relative-joints-full-ft-15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
