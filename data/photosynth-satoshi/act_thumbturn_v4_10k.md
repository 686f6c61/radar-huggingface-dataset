# photosynth-satoshi/act_thumbturn_v4_10k

## Resumen

El modelo `act_thumbturn_v4_10k` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario photosynth-satoshi y entrenada con el framework LeRobot. Está diseñada para que un robot seguidor (tipo `so_follower`) realice la tarea de desbloquear un pestillo de giro (thumbturn) mediante aprendizaje por imitación a partir de datos teleoperados. El modelo predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de gama media. Utiliza dos cámaras RGB (base y muñeca izquierda) y el estado del robot como entradas, y genera acciones de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT y LeRobot en un escenario de manipulación real, con un dataset propio de 230 episodios y 71.583 fotogramas a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. En este caso, el modelo procesa dos imágenes RGB de 480x640 píxeles (cámara base y cámara de muñeca izquierda) junto con un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. La arquitectura combina un codificador visual (típicamente ResNet) con un transformer que genera las acciones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `photosynth-satoshi/so101_unlock_thumbturn_v4`, que contiene 230 episodios y 71.583 fotogramas a 30 FPS de la tarea "Unlock the thumbturn". La configuración de entrenamiento incluyó 10.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de un robot seguidor (tipo `so_follower`) para la tarea específica de desbloquear un pestillo de giro.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (base y muñeca izquierda) a 480x640 píxeles.
- Predicción de acciones en chunks, lo que permite movimientos más suaves y coordinados en comparación con predicciones paso a paso.
- Integración con el ecosistema LeRobot: puede ejecutarse mediante `lerobot-rollout` y entrenarse con `lerobot-train`.
- Entrada de estado del robot (6 dimensiones) para incorporar información proprioceptiva.
- Salida de acciones de 6 dimensiones, adecuada para control de posición o esfuerzo en el robot.

## Casos de uso

- Automatización de desbloqueo de puertas: el modelo puede controlar un brazo robótico para girar un pestillo de puerta, una tarea común en entornos domésticos o industriales. Su capacidad de procesar imágenes de cámara base y de muñeca permite localizar y manipular el pestillo con precisión.
- Manipulación fina en entornos de investigación: al ser un modelo entrenado con aprendizaje por imitación, es útil para probar algoritmos de control en tareas de contacto físico, como girar perillas o interruptores.
- Desarrollo de políticas robóticas con LeRobot: sirve como punto de partida para investigadores que quieran entrenar sus propios modelos ACT sobre tareas similares, reutilizando la configuración de entrenamiento y el flujo de trabajo.
- Evaluación de robustez en visión robótica: al depender de dos cámaras, puede usarse para estudiar el efecto de cambios de iluminación, oclusiones o puntos de vista en el rendimiento de la política.
- Teleoperación asistida: el modelo puede complementar sistemas de teleoperación, sugiriendo acciones o actuando como respaldo cuando el operador no interviene.
- Benchmarking de métodos de imitación: al estar disponible públicamente con su dataset, permite comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado que el modelo tiene 51,7 millones de parámetros y un tamaño de 0,2 GB, es razonable estimar que puede ejecutarse en GPUs con al menos 2-4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque esta es una estimación no confirmada.
- El framework LeRobot soporta inferencia en GPU (CUDA) y también en CPU, aunque con menor rendimiento.
- Para el despliegue se recomienda seguir las guías de LeRobot: `lerobot-rollout` para ejecutar la política en el robot, y `lerobot-train` para entrenamiento.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (políticas robóticas ACT para tareas de manipulación) con los que establecer una comparación directa.

## Limitaciones y advertencias

- No se han realizado evaluaciones en robot real, por lo que se desconoce la tasa de éxito real y la robustez ante variaciones del entorno (iluminación, posición del pestillo, etc.).
- El modelo está entrenado exclusivamente para la tarea "Unlock the thumbturn" con un robot específico (`so_follower`); no es generalizable a otras tareas o robots sin reentrenamiento.
- Depende de dos cámaras fijas; cambios en la configuración de las cámaras o en el entorno pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos del dataset de teleoperación (por ejemplo, trayectorias subóptimas o movimientos inconsistentes del operador).
- No se han documentado riesgos de alucinación (no aplica a un modelo de control), pero sí existe riesgo de comportamientos imprevistos si las observaciones difieren mucho de las del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/photosynth-satoshi/act_thumbturn_v4_10k)
- [Dataset de entrenamiento](https://huggingface.co/datasets/photosynth-satoshi/so101_unlock_thumbturn_v4)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
