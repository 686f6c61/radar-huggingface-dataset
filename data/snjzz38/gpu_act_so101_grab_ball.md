# snjzz38/gpu_act_so101_grab_ball

## Resumen

El modelo `snjzz38/gpu_act_so101_grab_ball` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto está especializado en la tarea "grab the ball" (agarrar una pelota) con el brazo robótico SO-101 (SO-ARM100), un robot de código abierto de bajo coste.

El modelo consume observaciones de estado del robot (posición de las articulaciones) y dos flujos de imagen (cámara frontal y cámara en la muñeca), y produce comandos de acción de 6 dimensiones. Con aproximadamente 51,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Fue entrenado con 80 episodios teleoperados (19 078 frames a 30 FPS) durante 20 000 pasos. Su relevancia radica en que demuestra cómo un método de imitación relativamente simple puede lograr manipulación robótica efectiva con pocos datos, y sirve como punto de partida para desarrolladores que trabajan con el ecosistema LeRobot y el brazo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) con variacional autoencoder condicional (CVAE) |
| Parametros totales | 51 617 414 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un transformer encoder-decoder con un CVAE (Conditional Variational Autoencoder). El encoder procesa las observaciones (estado del robot e imágenes) y el decoder genera un chunk de acciones futuras de longitud fija. El CVAE introduce una variable latente que captura la variabilidad multimodal de las demostraciones, permitiendo que la política genere comportamientos diversos pero coherentes. Esta arquitectura es especialmente adecuada para tareas de manipulación donde las demostraciones pueden tener múltiples soluciones válidas.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 80 episodios teleoperados con el robot SO-101, grabados a 30 FPS (19 078 frames en total). La configuración de entrenamiento incluyó 20 000 pasos, batch size de 8, optimizador AdamW y learning rate de 1e-5. No se aplicaron técnicas de RLHF ni DPO, ya que es un método de aprendizaje por imitación supervisado. El modelo fue entrenado en una GPU (según el nombre del repositorio, "gpu_act") y posteriormente subido al Hub de Hugging Face.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición y orientación del efector final) para el brazo SO-101.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y muñeca) junto con el estado de las articulaciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de trayectorias.
- Generación de chunks de acciones: predice secuencias de acciones (típicamente 10-100 pasos) en lugar de acciones individuales, lo que reduce la acumulación de errores.
- Generalización limitada a la tarea entrenada: está especializado en "grab the ball", aunque la arquitectura ACT permite reentrenar para otras tareas con nuevos datasets.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar la tarea de agarrar una pelota en un entorno controlado, sirviendo como banco de pruebas para investigar aprendizaje por imitación.
- Prototipado rápido de políticas robóticas: desarrolladores pueden usar este modelo como referencia para entrenar sus propias políticas con LeRobot, adaptando el dataset y la tarea.
- Educación en robótica: el brazo SO-101 es de bajo coste y código abierto, lo que permite a estudiantes y aficionados experimentar con control robótico basado en aprendizaje.
- Automatización de tareas repetitivas de pick-and-place: aunque el modelo está entrenado para una tarea específica, la arquitectura ACT puede extenderse a tareas similares de agarre y colocación.
- Investigación en generalización de políticas: al ser un modelo pequeño y entrenado con pocos datos, es útil para estudiar la transferencia entre entornos o la robustez frente a variaciones de iluminación y posición.
- Benchmarking de frameworks de robótica: sirve como caso de uso para evaluar el rendimiento de LeRobot, la integración con el robot SO-101 y los flujos de trabajo de entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan tasas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~51,6 millones de parámetros, la inferencia es ligera. Con pesos en FP32, el modelo ocupa aproximadamente 206 MB (51,6 M × 4 bytes). Cualquier GPU con al menos 2 GB de VRAM es suficiente, aunque también puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, etc.) es válida. El entrenamiento se realizó en GPU, pero la inferencia puede hacerse incluso en CPU con latencias aceptables.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual. No requiere hardware especializado.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible exportar el modelo a otros formatos (ONNX, TensorRT) para despliegue en edge.
- Latencia y throughput estimados: no se han publicado mediciones. Dado el tamaño del modelo y la entrada de imágenes de 480×640, se espera una latencia de inferencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Dataset | Licencia | Estado |
|---|---|---|---|---|---|
| snjzz38/gpu_act_so101_grab_ball | Agarrar pelota | 51,6 M | 80 episodios (19 078 frames) | Apache 2.0 | Sin evaluación publicada |
| CnLori/act_so101_grab_cube | Agarrar cubo | no disponible | no disponible | Apache 2.0 | Sin evaluación publicada |
| Otros modelos ACT en LeRobot Hub | Varias tareas | típicamente 20-100 M | variable | Apache 2.0 | Variable |

Ambos modelos usan la misma arquitectura ACT y el mismo robot SO-101, pero están entrenados para tareas distintas (pelota vs. cubo). No se dispone de datos de rendimiento comparativo. La principal diferencia es el dataset de entrenamiento y la tarea específica.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card indica que no hay resultados de evaluación en el robot real, por lo que la tasa de éxito real es desconocida.
- Especialización limitada: el modelo solo ha sido entrenado para la tarea "grab the ball" con un robot y configuración de cámaras concretos. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posición de la pelota, fondo o calibración de cámaras.
- Datos de entrenamiento limitados: 80 episodios es un dataset pequeño; la robustez frente a variaciones no está garantizada.
- Requiere el robot SO-101 y el software LeRobot: el despliegue depende de la infraestructura específica (puerto serie, cámaras, calibración).
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- No es un modelo de lenguaje: no procesa texto ni instrucciones; la tarea está fijada en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snjzz38/gpu_act_so101_grab_ball
- Dataset de entrenamiento: https://huggingface.co/datasets/snjzz38/so101_grab_ball
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware (SO-101): https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Repositorio del brazo SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Guía de entrenamiento ACT para SO101 (SOLO CLI): https://github.com/omkarputti/SO101_ACT_Training
