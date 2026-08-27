# MrDuarte/act-warehousepick-test-v3

## Resumen

El modelo `MrDuarte/act-warehousepick-test-v3` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollado por MrDuarte y entrenado con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. Este modelo concreto está especializado en la tarea de levantar todos los paquetes y colocarlos en una caja verde, utilizando un robot tipo `so101_follower` con tres cámaras.

El modelo tiene 51,67 millones de parámetros y se ha entrenado sobre un dataset de 60 episodios teleoperados (57.829 frames a 30 FPS). Su arquitectura combina codificadores visuales para las tres cámaras y un transformer que genera acciones de 6 dimensiones. Aunque es un modelo pequeño en comparación con los LLM actuales, su relevancia radica en que demuestra cómo aplicar transformers a la robótica de manipulación con un pipeline accesible y reproducible. La licencia Apache 2.0 permite su uso comercial y su integración en sistemas robóticos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de chunking) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir una secuencia de acciones futuras (chunk) a partir de observaciones actuales. En este modelo, las observaciones consisten en el estado del robot (6 dimensiones) y tres imágenes de cámaras: `innomaker` (720x1280), `intel_rgb` (424x240) y `front` (720x1280). La salida es un vector de acción de 6 dimensiones, probablemente correspondiente a posiciones o velocidades del efector final.

El entrenamiento se realizó con el dataset `MrDuarte/WarehousePick-test-v3`, que contiene 60 episodios de teleoperación a 30 FPS, con la tarea "Lift all parcels and put them in the Green Box". La configuración de entrenamiento incluye 100.000 pasos, batch size de 2, optimizador AdamW con learning rate de 1e-5 y semilla 1000. Se utilizó LeRobot versión 0.6.0. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so101_follower`, permitiendo tareas de pick-and-place.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (cámara principal, cámara Intel y cámara frontal) junto con el estado del robot.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad, gracias a la predicción de chunks de acciones.
- Específico de tarea: está entrenado exclusivamente para la tarea de recoger paquetes y colocarlos en una caja verde; no es un modelo generalista.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de almacenes: el modelo puede controlar un brazo robótico para recoger paquetes de una superficie y depositarlos en un contenedor designado, reduciendo la intervención humana en tareas repetitivas.
- Pruebas de concepto en robótica de imitación: sirve como ejemplo reproducible para investigadores que quieran implementar ACT con LeRobot, ya que incluye dataset, configuración y código de entrenamiento.
- Despliegue en robots SO-101: el modelo está diseñado para el robot `so101_follower`, por lo que puede usarse directamente en este hardware para validar políticas de control.
- Benchmarking de métodos de aprendizaje por imitación: al ser un modelo pequeño y con dataset público, permite comparar el rendimiento de ACT frente a otras arquitecturas en tareas de manipulación.
- Educación en robótica: los estudiantes pueden cargar el modelo en un robot simulado o real para entender cómo funcionan los transformers en el control de agentes físicos.
- Investigación en generalización de tareas: aunque el modelo es específico, puede servir como punto de partida para estudiar la transferencia a variantes de la tarea (diferentes posiciones de paquetes, iluminación, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño del modelo (51,7M parámetros) y la entrada de imágenes de alta resolución, se estima que una GPU con al menos 8 GB de VRAM podría ejecutar la inferencia, aunque no hay datos confirmados.
- El entrenamiento se realizó presumiblemente con una GPU de gama media-alta (por ejemplo, RTX 3090 o superior), pero no se indica.
- Para el despliegue, LeRobot ofrece soporte para inferencia en tiempo real con robots SO-101, requiriendo una máquina con CUDA y las cámaras configuradas.
- No se mencionan opciones de cuantización ni despliegue en CPU; se recomienda usar GPU para latencias aceptables.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica con ACT). La búsqueda web no arrojó resultados relevantes para este modelo específico. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (levantar paquetes y colocarlos en una caja verde) y no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras y del robot `so101_follower`; cualquier cambio en la disposición de las cámaras o en el robot puede degradar el rendimiento.
- No se han proporcionado resultados de evaluación en el robot real, por lo que se desconoce la tasa de éxito real.
- El dataset de entrenamiento es relativamente pequeño (60 episodios), lo que puede limitar la robustez frente a variaciones en la posición de los objetos o condiciones de iluminación.
- Al ser un modelo de imitación, puede heredar sesgos del operador humano que realizó la teleoperación.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar el método ACT y LeRobot según la política de atribución.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/MrDuarte/act-warehousepick-test-v3)
- [Dataset de entrenamiento](https://huggingface.co/datasets/MrDuarte/WarehousePick-test-v3)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
