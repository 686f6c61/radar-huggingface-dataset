# ngocthuong2212/act_sim2real_mujoco_36sim_v2

## Resumen

El modelo `act_sim2real_mujoco_36sim_v2` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario ngocthuong2212 y publicada en Hugging Face bajo licencia Apache 2.0. ACT es un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto ha sido entrenado con el framework LeRobot para controlar un robot tipo `so_follower` (un brazo robótico de bajo coste) en una tarea de recoger un objeto y colocarlo en una caja, utilizando dos cámaras (superior y frontal) y el estado del robot como entradas.

El modelo tiene aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors. Está diseñado para ejecutarse en tiempo real sobre el robot, consumiendo imágenes de 480x640 píxeles y un vector de estado de 6 dimensiones, y produciendo comandos de acción de 6 dimensiones. Su relevancia radica en que demuestra la viabilidad de entrenar políticas de manipulación en simulación (MuJoCo) y transferirlas al mundo real (sim2real), un problema clave en robótica. Aunque no se han publicado resultados de evaluación en el mundo real, el modelo está listo para ser desplegado mediante las herramientas de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT utiliza un codificador de visión (típicamente ResNet) para procesar las imágenes de las cámaras, junto con un codificador del estado del robot, y un decodificador Transformer que genera un chunk de acciones futuras (por ejemplo, 64 pasos) de forma autoregresiva. Esta predicción por chunks reduce la acumulación de errores y mejora la estabilidad del control en comparación con políticas que predicen un solo paso.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 200 episodios (141.526 frames a 30 FPS) recopilado en simulación MuJoCo, con la tarea "Pick the object and place it into the box". La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se especifica si se aplicaron técnicas de RLHF o DPO, ya que es un método de imitación supervisada. El dataset está disponible en Hugging Face y contiene variaciones de posición del objeto (mezcla de 36, 64 y 200 configuraciones), lo que sugiere un esfuerzo por mejorar la generalización sim2real.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y del estado.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (superior y frontal) con resolución 480x640.
- Aprendizaje por imitación: reproduce comportamientos demostrados, en este caso la tarea de recoger y colocar un objeto.
- Ejecución en tiempo real: diseñado para inferencia en bucle cerrado sobre el robot, con una frecuencia de 30 FPS.
- Transferencia sim2real: entrenado en simulación MuJoCo, con el objetivo de ser desplegado en un robot físico `so_follower`.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de rollout y entrenamiento.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en una caja, una operación común en líneas de montaje. Su entrenamiento en simulación permite iterar rápidamente sobre nuevas configuraciones sin necesidad de datos reales.
- Investigación en sim2real: sirve como punto de partida para estudiar la transferencia de políticas de simulación a robots reales, evaluando la brecha de realidad y técnicas de regularización como la mezcla de configuraciones de entrenamiento.
- Prototipado de robots de bajo coste: al estar diseñado para el robot `so_follower` (un brazo de bajo coste), puede usarse en laboratorios académicos o makerspaces para implementar manipulación autónoma sin hardware caro.
- Benchmarking de algoritmos de imitación: el modelo y su dataset asociado permiten comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en una tarea estandarizada, facilitando la reproducibilidad.
- Educación en robótica: puede utilizarse en cursos de robótica y aprendizaje automático para demostrar el flujo completo de entrenamiento y despliegue de una política con LeRobot.
- Desarrollo de asistentes robóticos domésticos: aunque la tarea es simple, el enfoque puede extenderse a tareas como ordenar objetos o preparar bandejas, siempre que se recopilen datos de demostración adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito, ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamaño del modelo (51,7M parámetros) y la entrada de imágenes, se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en FP32. Con cuantización (no publicada) podría reducirse.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA RTX 3060, RTX 4090, o GPUs de datacenter como A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio-alto. El modelo es pequeño en comparación con LLMs.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan sobre el robot. También es posible exportar a otros formatos (ONNX, TensorRT) para optimización, aunque no se documenta en la model card.
- Latencia y throughput: no disponible. Depende del hardware y de la optimización. En una GPU moderna, se espera que la inferencia sea inferior a 50 ms por paso, permitiendo el control a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica entrenadas con LeRobot para tareas sim2real). El modelo ACT original (del paper arXiv:2304.13705) es la referencia metodológica, pero no se publican pesos oficiales comparables. Otros modelos de LeRobot en el Hub (por ejemplo, políticas de Diffusion Policy) podrían ser alternativas, pero no hay datos de rendimiento para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de que el modelo funcione correctamente en un robot real. El usuario debe validar su rendimiento antes de cualquier uso en producción.
- Sesgos del dataset: el dataset de entrenamiento proviene de simulación MuJoCo con un objeto específico (bloque verde) y una tarea concreta. El modelo puede no generalizar a otros objetos, colores, posiciones o condiciones de iluminación.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones no seguras si las observaciones difieren de las del entrenamiento. Es imprescindible implementar salvaguardas de seguridad (límites de velocidad, parada de emergencia).
- Limitaciones de contexto: al ser un modelo de robótica, no maneja lenguaje natural ni razonamiento simbólico. Su "contexto" se limita a las observaciones actuales y al chunk de acciones predicho.
- Dependencia de la configuración del robot: las cámaras y el estado deben coincidir exactamente con los utilizados en el entrenamiento (nombres de cámaras, resolución, calibración). Cambios en la disposición física invalidan la política.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de los datasets asociados (el dataset `vasco281204/so101_sim2real_baseline_green_block_mix_36_64_200` puede tener su propia licencia).
- Fecha de creación futura: el modelo fue creado en septiembre de 2026, lo que sugiere que es un artefacto reciente y posiblemente experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocthuong2212/act_sim2real_mujoco_36sim_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_sim2real_baseline_green_block_mix_36_64_200
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vasco281204/so101_sim2real_baseline_green_block_mix_36_64_200
