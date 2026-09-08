# Kaz55/act-blue-90ep-gs88-chunk60

## Resumen

Kaz55/act-blue-90ep-gs88-chunk60 es un modelo de política robótica basado en ACT (Action Chunking with Transformers), desarrollado por Kaz55 para la tarea de inserción de un cable azul con un brazo UR5e equipado con una pinza DG-5F. El modelo se entrenó con LeRobot y forma parte de un barrido sistemático de resoluciones del sensor táctil GelSight, con el objetivo de aislar el efecto de la resolución táctil en el rendimiento de la política.

El modelo recibe como entrada el estado del robot (26 dimensiones), dos imágenes de cámaras RealSense a 640x480 y dos imágenes táctiles de GelSight a 88x66. Genera secuencias de acciones de 60 pasos (chunk_size=60). Con 51.668.634 parámetros y un tamaño de 0.2 GB en formato safetensors, es un modelo compacto, adecuado para experimentos de investigación en manipulación robótica.

Su relevancia radica en que sirve como punto de comparación dentro de un estudio de ablación sobre la resolución de sensores táctiles. El autor advierte explícitamente que la pérdida de entrenamiento no mostró diferencias entre resoluciones, por lo que los resultados deben interpretarse con cautela hasta disponer de evaluación en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de política robótica; chunk_size=60) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que utiliza un transformer para predecir secuencias de acciones (chunks) a partir de observaciones. En este caso, la política genera 60 pasos de acción por inferencia. Las entradas incluyen el estado del robot, dos imágenes de RealSense y dos imágenes táctiles de GelSight. Las señales de velocidad y esfuerzo del robot están presentes en el dataset, pero se excluyeron deliberadamente para mantener la ablación limpia.

El entrenamiento se realizó sobre el dataset Kaz55/dg5f_ur5e_blue_90ep_gs88, compuesto por 90 episodios y 98.812 frames. Se ejecutaron 100.000 pasos de entrenamiento (aproximadamente 8.1 épocas), con batch size 8 y seed 1000. La innovación técnica destacable es el diseño del barrido de resolución de GelSight: todos los modelos del sweep comparten el resto de parámetros y datos, de modo que cualquier diferencia de rendimiento sea atribuible únicamente a la resolución táctil.

## Capacidades

- Ejecuta políticas de manipulación robótica de bajo nivel, generando comandos de acción para un brazo UR5e con pinza DG-5F.
- Integra percepción multimodal: dos cámaras RealSense a 640x480 y dos sensores táctiles GelSight a 88x66.
- Genera secuencias de acciones de 60 pasos (chunk_size=60), lo que permite un control más suave y reducción de la frecuencia de inferencia.
- Está entrenado específicamente para la tarea de inserción de un cable azul mediante aprendizaje por imitación (behavior cloning).
- No soporta generación de texto, tool calling, razonamiento simbólico ni tareas de lenguaje; es un modelo de política puramente robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: este checkpoint permite comparar políticas ACT entrenadas con diferentes resoluciones de sensores táctiles, facilitando estudios de ablación controlados.
- Ablación de sensores táctiles: al pertenecer a un sweep de resoluciones GelSight, es útil para evaluar si la resolución táctil influye en el éxito de la tarea de inserción, siempre que se realice una evaluación física en el robot.
- Despliegue en robots UR5e: el modelo puede integrarse en un pipeline de control con LeRobot para ejecutar la inserción de cable azul, siempre que el entorno y la calibración coincidan con los del entrenamiento.
- Benchmarking de políticas ACT: sirve como referencia para comparar variantes de ACT (cambios en chunk size, número de episodios, etc.) sobre el mismo dataset.
- Estudio de generalización: permite probar la robustez de la política ante variaciones de posición inicial, iluminación o condiciones del sensor, aunque se requiere reentrenamiento para tareas distintas.
- Educación y demostración: es un ejemplo práctico de cómo entrenar una política de manipulación con LeRobot y ACT, útil para cursos o tutoriales de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que los pesos ocupan 0.2 GB en safetensors, la inferencia es factible en GPUs de consumo, aunque el pipeline de procesamiento de imágenes (RealSense y GelSight) incrementa el consumo de memoria.
- GPU recomendadas: no disponible; se espera que una GPU con al menos 4-6 GB de VRAM sea suficiente para la inferencia del modelo.
- Si cabe en consumer GPU: sí, por tamaño de pesos, siempre que el pipeline de visión no exija memoria adicional elevada.
- Opciones de despliegue: LeRobot (librería principal), PyTorch, y posiblemente ROS para integración en sistemas robóticos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolución GelSight | Chunk size | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-blue-90ep-gs88-chunk60 | 51.668.634 | 88x66 | 60 | No disponible | HuggingFace |
| act-blue-90ep-gs320-chunk60 | No disponible | 320x240 | 60 | No disponible | HuggingFace |
| act-blue-90ep-gs160-chunk60 | No disponible | 160x120 | 60 | No disponible | HuggingFace |
| act-blue-90ep-raw-chunk60 | No disponible | 500x375 | 60 | No disponible | HuggingFace |

Los tres modelos adicionales pertenecen al mismo sweep de resoluciones GelSight y comparten el mismo dataset, arquitectura y configuración de entrenamiento, por lo que son comparables directamente en términos de ablación.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de inserción de cable azul con un UR5e y una pinza DG-5F; no generaliza a otras tareas sin reentrenamiento.
- El autor señala que la pérdida de entrenamiento fue prácticamente idéntica entre resoluciones táctiles, lo que sugiere que el modelo podría no estar aprovechando la entrada táctil; se necesita evaluación en robot para confirmarlo.
- No se ha publicado evaluación en robot en la información disponible, por lo que el rendimiento real es desconocido.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución.
- Requiere un entorno físico concreto (UR5e, DG-5F, GelSight, RealSense) y calibración adecuada para su despliegue.
- No es un modelo de lenguaje; no aplica para tareas de texto, generación de contenido o razonamiento simbólico.

## Enlaces

- Modelo: https://huggingface.co/Kaz55/act-blue-90ep-gs88-chunk60
- Dataset: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_blue_90ep_gs88
- Perfil del autor: https://huggingface.co/Kaz55
