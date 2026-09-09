# Kaz55/act-v6-blue89-180ep-gs320-ac60

## Resumen

El modelo `act-v6-blue89-180ep-gs320-ac60` es una política de manipulación robótica basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada por Kaz55 y publicada en HuggingFace bajo la librería `lerobot`. Está diseñada para controlar un brazo robótico UR5e utilizando retroalimentación multimodal, combinando el estado articular del robot, dos cámaras Intel RealSense y dos sensores táctiles GelSight. Su propósito es ejecutar tareas de manipulación de precisión mediante aprendizaje por imitación a partir de demostraciones teleoperadas.

La arquitectura transforma las observaciones en secuencias de acciones de bajo nivel. Concretamente, predice bloques de 60 pasos de acción (`chunk_size=60`), lo que permite una ejecución reactiva sin re-planificación continua. El modelo fue entrenado sobre un dataset de 180 episodios (208.109 frames) durante 100.000 pasos de optimización, con `batch size` 8 y `seed` 1000. Tiene 51.668.634 parámetros y un tamaño de repositorio de 0,2 GB en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica; es una politica de robotica sin ventana de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Resolucion GelSight | 320x240 |
| Resolucion RealSense | 640x480 |
| Chunk size | 60 |
| N accion paso por chunk | 60 |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Seed | 1000 |
| Episodios del dataset | 180 |
| Frames del dataset | 208.109 |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT, un transformer de aprendizaje por imitación que genera secuencias completas de acciones en lugar de una sola acción por inferencia. En este caso, recibe como entrada un vector de estado del robot de 26 dimensiones, dos imágenes RGB de cámaras RealSense a 640x480 y dos imágenes de sensores táctiles GelSight a 320x240. La salida es un bloque de 60 pasos de acción, los cuales se ejecutan secuencialmente en el brazo robótico antes de una nueva predicción.

El entrenamiento se realizó mediante *behavior cloning* sobre un dataset de 180 episodios teleoperados, con un total de 208.109 frames. Se emplearon 100.000 pasos de optimización, con `batch size` 8 y `seed` 1000. Cabe destacar que las señales de `observation.velocity` y `observation.effort` presentes en el dataset fueron deliberadamente excluidas del entrenamiento, según indica el autor, para evitar que la auto-derivación de características las alimentara a la política y añadiera una diferencia entre ejecuciones. No se menciona uso de RLHF, DPO ni cualquier otra técnica de alineación posterior al entrenamiento.

El autor también realizó un *sweep* comparando la resolución táctil de 320x240 con 500x375: el modelo de 320x240 obtuvo una pérdida de entrenamiento de 0,134, frente a 0,132 del modelo de 500x375. Sin embargo, el propio autor advierte que las pérdidas no son comparables con otros *sweeps* y que no deben interpretarse como evidencia sobre la resolución táctil, ya que en un *sweep* relacionado la pérdida fue idéntica en todas las resoluciones de GelSight, incluida la ausencia de GelSight. Por tanto, la pérdida de entrenamiento se debe tratar como una comprobación de cordura y el rendimiento real debe evaluarse en el robot.

## Capacidades

- Genera secuencias de bajo nivel de 60 pasos de acción para el brazo robótico UR5e.
- Procesa entrada multimodal: estado articular de 26 dimensiones, dos imágenes RGB de cámaras RealSense y dos imágenes táctiles de sensores GelSight.
- Aplica aprendizaje por imitación para replicar demostraciones teleoperadas de manipulación.
- No soporta tool calling ni function calling (no aplica).
- No soporta razonamiento multi-step de tipo agente ni generación de texto (no es un modelo de lenguaje).
- No ofrece capacidades de lenguaje natural.

## Casos de uso

- Manipulación de precisión con feedback táctil: el modelo puede utilizarse para tareas que requieren detectar contacto y ajustar la fuerza, como la inserción de conectores o el ensamblaje de piezas. La entrada GelSight 320x240 proporcional información táctil espacial, mientras que el `chunk_size` de 60 permite ejecutar movimientos completos sin re-planificación continua.

- Recogida y colocación de objetos en un UR5e: la combinación de dos cámaras RealSense y el estado articular permite generar trayectorias de agarre y desplazamiento, siendo adecuado para automatizar ciclos repetitivos en entornos de laboratorio.

- Evaluación de resoluciones táctiles en políticas ACT: al existir una variante con GelSight 500x375, este modelo sirve como referencia para investigar si la resolución del sensor táctil influye en el rendimiento final. El propio autor señala que se necesita evaluación en robot para llegar a conclusiones.

- Desarrollo de sistemas de teleoperación a imitación: si se dispone de un dataset de demostraciones teleoperadas con la misma configuración de sensores, el modelo puede replicar la tarea en el brazo UR5e, lo que resulta útil para validar nuevas metodologías de captura de datos.

- Investigación en control robótico multimodal: el modelo integra visión artificial y tacto en un único *policy* transformer, por lo que puede emplearse como línea base para estudiar la fusión de señales visuales y táctiles en el control de bajo nivel.

- Automatización de tareas repetitivas en investigación: para laboratorios que dispongan de un UR5e con cámaras RealSense y sensores GelSight, el modelo puede ejecutar secuencias de manipulación de forma autónoma, permitiendo liberar tiempo de operadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta una pérdida de entrenamiento de 0,134 para el modelo con GelSight 320x240, pero advierte que esta métrica no debe interpretarse como un indicador fiable del rendimiento táctil y que se necesita evaluación en el robot. Las pérdidas tampoco son comparables con las de otros *sweeps* de entrenamiento. No hay datos de éxito de tareas, latencia ni simulación disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información no especifica ningún requisito de memoria.
- GPU recomendada: no disponible. No se indica una GPU concreta.
- El modelo tiene 51.668.634 parámetros y ocupa 0,2 GB en formato `safetensors`, lo que sugiere que puede ejecutarse en GPUs de consumo o incluso en CPU, aunque no hay datos confirmados de latencia ni throughput.
- Opciones de despliegue: no se especifican. Dado que el modelo está construido con la librería `lerobot`, es probable que se integre directamente con el flujo de trabajo de esa librería, pero no se dispone de más detalles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos de la misma categoría. Lo único disponible es la comparación interna entre dos variantes del mismo modelo, basadas en la resolución del sensor táctil:

| Modelo | Resolucion GelSight | Acciones por chunk | Perdida de entrenamiento |
|---|---|---|---|
| act-v6-blue89-180ep-gs320-ac60 | 320x240 | 60 | 0,134 |
| act-v6-blue89-180ep-gs500-ac60 | 500x375 | 60 | 0,132 |

Estas pérdidas no son comparables con otros *sweeps* y no evidencian una mejora por resolución táctil, tal como advierte el autor.

## Limitaciones y advertencias

- Licencia no disponible: no existe información sobre los términos de uso, lo que introduce un riesgo para cualquier uso comercial.
- La pérdida de entrenamiento no distingue entre resoluciones de GelSight (ni siquiera ante la ausencia de GelSight), por lo que el modelo no ha demostrado mejorar la tarea mediante la resolución táctil. Se requiere una evaluación física en el robot.
- Las señales de `observation.velocity` y `observation.effort` se excluyeron deliberadamente, lo que puede limitar la capacidad de la política para seguir trayectorias dinámicas o adaptarse a cambios bruscos en la interacción.
- El modelo está entrenado exclusivamente con un dataset específico para un brazo UR5e con dos cámaras RealSense y dos sensores GelSight. Es probable que no generalice a otros robots, configuraciones de sensores o tareas diferentes.
- No hay evaluación de robustez, sesgos ni comportamiento ante entradas ruidosas o fallos de sensores.
- No aplica el riesgo de alucinación propio de los modelos de lenguaje, al no generar texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-v6-blue89-180ep-gs320-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_v6_blue89_180ep_gs320
