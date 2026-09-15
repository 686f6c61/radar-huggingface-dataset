# mattewg/pi05-so101-grab-ballincup-5k

## Resumen

pi05-so101-grab-ballincup-5k es un modelo de política de robótica desarrollado por mattewg, basado en el checkpoint base pi0.5 de Physical Intelligence. Está fine-tuneado para controlar el brazo robótico SO-101 en la tarea de agarrar una pelota y depositarla en una taza. El modelo se entrenó exclusivamente con la fase "ball-into-cup" de un conjunto de datos de demostración, lo que lo convierte en un especialista para ese subproblema concreto.

El modelo es relevante porque demuestra cómo se puede adaptar un modelo de política generalista (pi0.5) a una tarea específica mediante fine-tuning con un subconjunto de datos seleccionado por índices, sin re-encodear los vídeos. El checkpoint se publica a mitad de un schedule de entrenamiento de 15.000 pasos, con 5.000 pasos completados, lo que puede tener implicaciones sobre el rendimiento final.

No se proporcionan detalles sobre la arquitectura interna, el tamaño del modelo ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tarea | Agarrar la pelota y ponerla en la taza (ball-into-cup) |
| Modelo base | pi0.5 (checkpoint `gs://openpi-assets/checkpoints/pi05_base`) |
| Dataset de entrenamiento | endoard/grab_cup_ball_2cam, 50 episodios, `task_index == 1`, 49.377 frames |
| Prompt | "Grab the ball and put it in the cup" |
| Pasos de entrenamiento | 5.000 (de un schedule de 15.000) |
| Batch | 24 |
| Tasa de aprendizaje | 2.5e-5 pico, warmup de 1.000 pasos, coseno hacia 2.5e-6 |
| EMA | deshabilitado |
| Acciones | objetivos absolutos de articulación 6-D a 15 Hz, `action_horizon=16` |
| Cámaras | `fixed`, `handeye` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base pi0.5 para el brazo SO-101. Se entrenó sobre un subconjunto del dataset `endoard/grab_cup_ball_2cam`, compuesto por 50 episodios originales de los que se extrajeron solo los frames con `task_index == 1`, resultando en 49.377 frames. La selección se realizó a nivel de índices, sin re-encodear los vídeos, de modo que las secuencias se corresponden con la fase de poner la pelota en la taza.

Los hiperparámetros de entrenamiento incluyen un batch de 24, una tasa de aprendizaje pico de 2.5e-5 con warmup de 1.000 pasos y decaimiento coseno hacia 2.5e-6. El EMA está deshabilitado. Las acciones se predicen como objetivos absolutos de articulación 6-D a 15 Hz, con un horizonte de acción de 16. El modelo utiliza dos cámaras: `fixed` y `handeye`. Las estadísticas de normalización se calcularon sobre el subconjunto exclusivo de "ball-into-cup" y se almacenan en `assets/so101/grab_cup_ball_2cam/norm_stats.json`; difieren de las del dataset completo (por ejemplo, la media de shoulder-pan es 7.71 frente a 0.14), por lo que no deben sustituirse.

El checkpoint publicado corresponde al paso 5.000 de un schedule de 15.000, es decir, un checkpoint intermedio en el que la tasa de aprendizaje aún no había sido anealed.

## Capacidades

- Control del brazo robótico SO-101 para la tarea específica de agarrar una pelota y colocarla en una taza.
- Generación de acciones de articulación 6-D en tiempo real a 15 Hz, con un horizonte de 16 pasos.
- Integración con dos entradas de cámara (`fixed` y `handeye`) para la percepción visual de la tarea.
- Capacidad de ejecutar la fase "ball-into-cup" de forma aislada, sin necesidad de la fase previa de colocación de la taza.
- No se documentan capacidades de tool calling, generación de texto, razonamiento simbólico ni soporte de agentes, al tratarse de un modelo de política de robótica.
- No se documentan capacidades multilingües ni modos de pensamiento extendido.

## Casos de uso

- Ensamblaje automatizado en entornos industriales: el modelo puede controlar un brazo robótico para recoger un objeto y depositarlo en un contenedor, replicando la dinámica de la tarea de pelota en taza.
- Robótica de laboratorio: manipulación de muestras sólidas o líquidas, transfiriendo objetos a recipientes específicos, gracias a su entrenamiento en colocación precisa.
- Recogida y colocación en almacenes: tareas de picking de objetos ligeros y su posterior colocación en ubicaciones determinadas, con el brazo SO-101.
- Investigación en fine-tuning de VLA: este checkpoint sirve como referencia para estudiar cómo el entrenamiento en un subconjunto de una tarea afecta al rendimiento de un modelo base pi0.5.
- Demostraciones educativas de robótica: uso en entornos académicos para mostrar el control de un brazo robótico con entrada visual y salida de articulaciones.
- Integración en pipelines de manipulación con dos cámaras: el modelo aprovecha las vistas `fixed` y `handeye` para tareas que requieren coordinación entre perspectiva global y local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se indica si el modelo puede ejecutarse en GPU de consumo.
- Opciones de despliegue: no disponible. El repositorio utiliza la librería LeRobot, por lo que se espera que se integre en ese ecosistema.
- Latencia y throughput estimados: no disponibles.
- Tamaño del repositorio: 12.4 GB, lo que da una referencia del espacio en disco necesario para los pesos.

## Comparativa con modelos similares

| Modelo | Tarea | Dataset | Pasos | Base | Licencia |
|---|---|---|---|---|---|
| pi05-so101-grab-ballincup-5k | Ball-into-cup | endoard/grab_cup_ball_2cam (`task_index == 1`, 49.377 frames) | 5.000 | pi0.5 | Apache 2.0 |
| pi05-so101-grab-ball-30k | Agarrar la pelota (grab_ball_2cam_v1) | distinto, 30.000 pasos | 30.000 | pi0.5 | Apache 2.0 |
| pi0.5 base | Generalista | no disponible | no disponible | pi0.5 | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado únicamente para la fase "ball-into-cup"; no cubre la fase previa de colocación de la taza ni otras tareas de manipulación.
- Es un checkpoint intermedio (5.000 de 15.000 pasos) en el que la tasa de aprendizaje no había sido anealed, lo que puede afectar a la convergencia y al rendimiento final.
- Las estadísticas de normalización son específicas del subconjunto "ball-into-cup" y no deben sustituirse por las del dataset completo, ya que difieren significativamente (por ejemplo, shoulder-pan mean 7.71 vs 0.14).
- No se han publicado métricas de rendimiento ni benchmarks, por lo que no se puede evaluar su eficacia de forma objetiva.
- El dataset de entrenamiento es reducido (50 episodios originales), lo que puede limitar la generalización a variaciones de la tarea.
- El rendimiento depende de la configuración de cámaras (`fixed` y `handeye`); cambios en la disposición pueden degradar la precisión.
- Al ser un modelo de política de robótica, no es aplicable a tareas de lenguaje, tool calling ni agentes conversacionales.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de idoneidad para un propósito particular.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattewg/pi05-so101-grab-ballincup-5k
- Dataset de entrenamiento: https://huggingface.co/datasets/endoard/grab_cup_ball_2cam
- Modelo relacionado (pi05-so101-grab-ball-30k): https://huggingface.co/mattewg/pi05-so101-grab-ball-30k
- Checkpoint base pi0.5: `gs://openpi-assets/checkpoints/pi05_base`
