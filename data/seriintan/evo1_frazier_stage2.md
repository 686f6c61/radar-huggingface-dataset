# seriintan/evo1_frazier_stage2

## Resumen

El modelo `seriintan/evo1_frazier_stage2` es una política de Vision-Language-Action (VLA) desarrollada por el usuario `seriintan` y entrenada con el framework LeRobot. Está basada en el modelo [EVO1](https://github.com/MINT-SJTU/Evo-1), que combina un backbone InternVL3 para procesar imágenes y lenguaje, con una cabeza de predicción de acciones basada en flow-matching continuo. El modelo está diseñado para controlar un brazo robótico tipo `so_follower` a partir de dos cámaras (frontal y pinza) y del estado del robot, generando acciones de control en 6 dimensiones.

El modelo fue entrenado en un dataset propio de demostraciones teleoperadas, con 100 episodios y 52.442 frames a 30 FPS, para la tarea específica "Pick and place Frazier to blue basket". Se trata de un modelo de imitación de propósito específico, no de un modelo de lenguaje de propósito general. Con 776.139.440 parámetros y un peso en safetensors de 1.8 GB, está orientado a entornos de robótica de investigación y aplicaciones industriales de manipulación sencilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone InternVL3 y cabeza de flow-matching continuo |
| Parametros totales | 776.139.440 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en lenguaje natural, sin especificar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EVO1, que integra un backbone InternVL3 para la codificación de imágenes y texto, y una cabeza de predicción de acciones basada en flow-matching. La entrada del modelo consiste en el estado del robot (`observation.state`, dimensión 6), la imagen de la cámara frontal (`observation.images.front`, 3x480x640) y la imagen de la cámara de la pinza (`observation.images.gripper`, 3x480x640). La salida es una acción de control de 6 dimensiones (`action`), que se predice como un chunk de acciones continuas.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `seriintan/frazier_dataset_20260901_151518`, compuesto por 100 episodios y 52.442 frames capturados a 30 FPS. La configuración de entrenamiento incluye 50.000 pasos, batch size de 4, optimizador AdamW, learning rate de 1e-5 y seed 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de control para un brazo robótico en 6 dimensiones, a partir de observaciones visuales y del estado del robot.
- Comprensión de instrucciones en lenguaje natural para guiar la tarea entrenada.
- Procesamiento de imágenes de 480x640 de dos cámaras simultáneas (frontal y pinza).
- Predicción de chunks de acciones mediante flow-matching continuo.
- Integración nativa con el framework LeRobot para entrenamiento y despliegue.
- No soporta tool calling, razonamiento multi-step, generación de código ni tareas de lenguaje de propósito general.
- Capacidades multilingües no disponibles.

## Casos de uso

- Automatización de pick-and-place en almacenes: el modelo puede controlar un brazo robótico para recoger objetos y colocarlos en una cesta, utilizando las cámaras para localizar el objeto y el estado del robot para ajustar el movimiento.
- Robótica de laboratorio: manejo de muestras, placas o tubos en un entorno controlado, gracias a su capacidad para ejecutar tareas repetitivas de manipulación.
- Ensamblaje ligero: colocación de piezas en posiciones precisas, aprovechando la predicción de acciones de 6 dimensiones y la información visual de la cámara de la pinza.
- Agricultura de precisión: recogida de frutas u hortalizas en configuraciones similares a la tarea entrenada, siempre que se adapte el dataset y el robot.
- Investigación en imitación learning: como referencia para estudiar políticas VLA entrenadas con LeRobot y comparar arquitecturas de flow-matching.
- Automatización de procesos industriales con tareas repetitivas de manipulación: el modelo puede integrarse en celdas de trabajo donde la tarea de recoger y colocar está bien definida y el entorno es estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en robot real ni métricas de éxito. El autor indica explícitamente que no se han proporcionado resultados de evaluación.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- El modelo tiene 776.139.440 parámetros y el repositorio ocupa 1.8 GB en safetensors, lo que sugiere que la inferencia puede ejecutarse en GPUs de consumo con 4-8 GB de VRAM, aunque debe validarse con el framework LeRobot.
- El despliegue se realiza mediante LeRobot, utilizando el comando `lerobot-rollout` con el tipo de robot `so_follower` y las cámaras configuradas.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con alternativas externas. El único modelo comparable conocido es `seriintan/evo1_frazier_stage1`, que corresponde a una etapa anterior del mismo entrenamiento. No se han publicado especificaciones técnicas de este modelo en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| seriintan/evo1_frazier_stage2 | 776.139.440 | No disponible | Apache-2.0 | Hugging Face |
| seriintan/evo1_frazier_stage1 | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Pick and place Frazier to blue basket" con un robot `so_follower` y cámaras concretas; no generaliza a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito y la robustez del modelo.
- Depende de la configuración de cámaras (frontal y pinza) y de la posición del robot; cambios en iluminación, apariencia del objeto o distracciones pueden degradar el rendimiento.
- Existe riesgo de sobreajuste al dataset de 100 episodios (52.442 frames), lo que limita la capacidad de generalización.
- Riesgo de predicciones de acción erróneas en entornos no vistos durante el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no garantiza el rendimiento ni la seguridad del modelo en entornos de producción.
- No es un modelo de propósito general; no soporta tool calling, razonamiento abstracto ni generación de texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/evo1_frazier_stage2
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Repositorio EVO1: https://github.com/MINT-SJTU/Evo-1
- Guía de LeRobot para EVO1: https://huggingface.co/docs/lerobot/main/en/evo1
- Perfil del autor: https://huggingface.co/seriintan
- Modelo relacionado (stage1): https://huggingface.co/seriintan/evo1_frazier_stage1
