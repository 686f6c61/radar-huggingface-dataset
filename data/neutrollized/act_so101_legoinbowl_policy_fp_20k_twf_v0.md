# Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf_v0

## Resumen

El modelo `Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf_v0` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario Neutrollized y entrenada con el framework LeRobot. Su objetivo es controlar un robot manipulador de tipo `so_follower` para realizar la tarea concreta de recoger una pieza de lego y depositarla en un recipiente. Se trata de un modelo de robótica que predice acciones de seis grados de libertad a partir de observaciones de estado y de tres imágenes (cámara superior, muñeca y frontal).

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto y ligero, diseñado para ejecutarse en tiempo real en entornos robóticos. El entrenamiento se realizó sobre un dataset teleoperado de 50 episodios con 21.529 fotogramas a 30 FPS, y el modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a un problema de manipulación con imágenes de alta resolución, fácilmente reproducible con LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), introducida en el artículo arXiv:2304.13705. ACT es un método de aprendizaje por imitación que predice secuencias (chunks) de acciones futuras en lugar de una sola acción, lo que permite una ejecución más estable y robusta. La política se compone de un codificador visual basado en ResNet para procesar las tres imágenes de entrada, un módulo de transformador para modelar la relación entre estado y observaciones, y un decodificador que genera las acciones de seis dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `Neutrollized/lego-in-bowl-fps30-640x480-tfw_20260818_102156`, que contiene 50 episodios de teleoperación con 21.529 fotogramas a 30 FPS y una resolución de 640×480. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, un tamaño de lote de 32 y una semilla 1000, durante 20.000 pasos de entrenamiento. No se ha informado de técnicas de RLHF ni DPO, al ser un modelo puramente de imitación.

## Capacidades

- **Manipulación robótica**: el modelo es capaz de controlar un brazo robótico de tipo `so_follower` para agarrar y colocar objetos, en concreto piezas de lego en un recipiente.
- **Percepción multimodal**: procesa tres flujos de imagen en paralelo (cámara superior, cámara de muñeca y cámara frontal) junto con el estado del robot (6 dimensiones).
- **Predicción de acciones**: genera acciones de 6 dimensiones (posición y orientación) en forma de chunks de acciones, lo que permite un control más suave y estable.
- **Ejecución en tiempo real**: al ser un modelo pequeño (51M parámetros), es adecuado para inferencia de baja latencia en hardware robótico.
- **Sin capacidades de lenguaje**: no soporta generación de texto, tool calling, razonamiento simbólico ni funciones de agente.

## Casos de uso

- **Automatización de tareas de pick-and-place**: el modelo puede integrarse en líneas de ensamblaje para recoger piezas pequeñas de una superficie y colocarlas en un contenedor, como piezas de lego, tornillos o componentes electrónicos. Su capacidad de predecir chunks de acciones permite movimientos fluidos y precisos.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudios sobre transferencia de políticas, adaptación a variaciones de iluminación o posición, o comparación con otros métodos como Diffusion Policy.
- **Entrenamiento de robots en entornos de laboratorio**: en universidades o centros de investigación, el modelo se puede desplegar en un robot SO-101 para reproducir la tarea de recoger y colocar bloques, como base para experimentos de generalización.
- **Demostraciones de robótica en educación**: gracias a su licencia abierta y su pequeño tamaño, es adecuado para cursos de robótica y aprendizaje automático donde se enseña a entrenar y ejecutar políticas de manipulación.
- **Desarrollo de sistemas de manipulación flexible**: se puede adaptar para tareas similares de agarre de objetos de pequeño tamaño cambiando el dataset de entrenamiento y reentrenando la política.
- **Pruebas de robustez frente a perturbaciones**: dado que el modelo se entrena con datos teleoperados, puede ser evaluado ante cambios en la posición de los objetos, iluminación o presencia de distractores, para medir su robustez.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". Por tanto, no se presentan datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

No se han especificado requisitos oficiales de hardware en la documentación. Sin embargo, dado que el modelo tiene 51,7 millones de parámetros y procesa tres imágenes de 640×480, se puede estimar razonablemente que:

- **VRAM estimada**: al ser un modelo pequeño, es probable que quepa en una GPU con al menos 4 GB de VRAM, aunque no se ha confirmado.
- **GPUs compatibles**: se puede ejecutar en GPUs de consumo como la serie RTX 3060 o superiores, o en GPUs profesionales como la A10 o A100, aunque no se documentan.
- **Despliegue**: el modelo está diseñado para ejecutarse con LeRobot, por lo que se recomienda usar el entorno de LeRobot con soporte CUDA. No se mencionan opciones como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- **Latencia**: no hay datos. Dado el tamaño, es probable que la inferencia sea muy rápida (menos de 50 ms), pero no se confirma.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la misma tarea y arquitectura. Existen otras políticas ACT entrenadas con LeRobot (por ejemplo, `Thytu/act-so101-object-in-box_v0.4-fixed-7d`), pero no se tienen datos de rendimiento ni especificaciones para establecer una comparación rigurosa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Especificidad de la tarea**: el modelo está entrenado exclusivamente para la tarea de recoger un bloque de lego y ponerlo en un cuenco. No es generalizable a otras tareas sin reentrenamiento.
- **Dependencia del entorno**: requiere la misma configuración de cámaras (top, wrist, front) y el mismo tipo de robot (`so_follower`). Cambios en la iluminación, posición de la cámara o el tipo de objeto pueden degradar el rendimiento.
- **Sin evaluación**: no hay datos de éxito en pruebas reales, por lo que no se puede conocer su fiabilidad en producción.
- **Riesgo de errores de ejecución**: como todo modelo de aprendizaje, puede cometer errores si el entorno difiere de los datos de entrenamiento, lo que puede provocar fallos en la manipulación.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar los términos de la licencia de los modelos de base, si los hubiera.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/Neutrollized/act_so101_legoinbowl_policy_fp_20k_twf_v0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Neutrollized/lego-in-bowl-fps30-640x480-tfw_20260818_102156)
- [Paper ACT (arXiv)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
