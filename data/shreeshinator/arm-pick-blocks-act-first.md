# shreeshinator/arm-pick-blocks-act-first

## Resumen

Este modelo es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada por el autor `shreeshinator` con el framework LeRobot para una tarea de pick-and-place: un brazo robótico real debe recoger bloques y colocarlos en un recipiente ("place the block in the bowl"). Se trata de un modelo de aprendizaje por imitación que aprende de demostraciones teleoperadas y predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más estable y robusto en robots reales.

La política consume una imagen de la cámara frontal (480x640) y un vector de estado de 5 dimensiones, y produce un vector de acción de 5 dimensiones. El modelo tiene 51.666.565 parámetros, fue entrenado con 50 episodios (13.507 frames a 15 FPS) y está publicado con licencia Apache-2.0. Es relevante porque demuestra un caso práctico de entrenamiento de políticas de manipulación con LeRobot sobre un brazo robótico real, con un pipeline completo desde la recolección de datos hasta la ejecución en hardware.

La arquitectura se basa en el paper ACT (arXiv:2304.13705) y el entrenamiento se realizó con el optimizador AdamW, una tasa de aprendizaje de 1e-5 y un batch de 16, durante 20.000 pasos. No se han publicado resultados de evaluación en el entorno real, por lo que el rendimiento cuantitativo no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.666.565 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política de robótica, no procesa texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje de imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. El modelo se compone de un codificador de visión (para procesar la imagen frontal de 480x640), un codificador de estado (que recibe el vector de observación de 5 dimensiones) y un decodificador transformador que genera la secuencia de acciones. Esta arquitectura permite que el modelo tenga una mayor consistencia temporal en la ejecución, ya que genera varios pasos de acción de una vez.

El entrenamiento se realizó con LeRobot v0.6.1 sobre un dataset de 50 episodios teleoperados (13.507 fotos a 15 FPS) de la tarea de pick-and-place. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-05, un tamaño de batch de 16 y un total de 20.000 pasos de entrenamiento, con una semilla de 1000. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; el modelo se entrena exclusivamente mediante aprendizaje de imitación supervisado sobre las demostraciones.

## Capacidades

- Manipulación robótica de pick-and-place: recoge bloques y los coloca en un recipiente.
- Aprendizaje de imitación a partir de demostraciones teleoperadas de un brazo real.
- Procesamiento visual en tiempo real de una cámara frontal (480x640, 3 canales).
- Control basado en estado: recibe un vector de estado de 5 dimensiones y produce un vector de acción de 5 dimensiones.
- Predicción de secuencias de acciones (action chunking) para mayor estabilidad en la ejecución.
- Ejecución en tiempo real sobre el robot (compatible con LeRobot rollout).
- Integración con el ecosistema LeRobot para entrenamiento y despliegue.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de fabricación: el modelo puede integrarse en una célula de montaje para clasificar o reubicar piezas, aprovechando su capacidad de ejecutar la tarea de forma autónoma a partir de imágenes y estado del brazo.
- Investigación en aprendizaje de imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas reales, comparar con otros métodos o probar variaciones del pipeline de entrenamiento.
- Prototipado de sistemas robóticos educativos: el modelo puede usarse en laboratorios de robótica para enseñar conceptos de aprendizaje por imitación, control y visión por computador en un brazo real.
- Pruebas de integración de LeRobot: el repositorio sirve como ejemplo de referencia para quienes quieren entrenar y desplegar políticas con LeRobot en su propio hardware.
- Sistema de clasificación de objetos en laboratorio: el modelo puede adaptarse para separar bloques de distintos colores o formas, siempre que se reentrene con datos de la tarea específica.
- Validación de controladores de brazo robótico: se puede usar para evaluar la repetibilidad y precisión del hardware (SO-101 u otros) en condiciones controladas, comparando la ejecución de la política con trayectorias de referencia.
- Desarrollo de sistemas de asistencia en entornos de investigación: el modelo puede encargarse de tareas repetitivas de manipulación, liberando tiempo del personal para tareas de mayor valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay datos de tasa de éxito, número de pruebas ni comparación con otros modelos en la tarea de pick-and-place.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parámetros, el modelo en sí ocupa alrededor de 200 MB en fp32. Sin embargo, el procesamiento de imágenes (480x640x3) y la ejecución del transformer requieren memoria adicional; se estima un uso total inferior a 2 GB de VRAM en inferencia.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM es suficiente para ejecutar la política en tiempo real. Modelos como la RTX 3060, RTX 4060 o superiores son adecuadas. En el caso de no disponer de GPU, la CPU puede ejecutar la inferencia, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo (serie RTX 30/40) sin problemas.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con robots de tipo `real_arm` y cámaras OpenCV. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. La latencia dependerá del hardware y de la configuración de la cámara (30 FPS recomendados en el ejemplo de rollout).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Evaluación |
|---|---|---|---|---|---|
| shreeshinator/arm-pick-blocks-act-first | ACT | 51,6 M | Pick-and-place de bloques | Apache-2.0 | No publicada |
| Otros modelos ACT del ecosistema LeRobot | ACT | Variable | Variable (depende del dataset) | Apache-2.0 (generalmente) | Depende del autor |

No se dispone de datos específicos de otros modelos ACT entrenados con LeRobot para comparar rendimiento. La comparación directa no es posible sin datos de evaluación publicados. Se recomienda consultar el hub de LeRobot para encontrar políticas similares.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: no hay evidencia cuantitativa de éxito en la tarea, por lo que no se puede garantizar la fiabilidad del modelo en producción.
- El dataset es pequeño: solo 50 episodios y 13.507 fotos, lo que puede limitar la generalización a nuevas posiciones, iluminación o variaciones del entorno.
- Tarea específica: el modelo está entrenado únicamente para la tarea "place the block in the bowl"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación de robustez: no se ha probado el modelo con distracciones, cambios de iluminación o variaciones en la posición de los objetos, tal como se menciona en la model card.
- Dependencia de la configuración del robot: los nombres de cámaras y la configuración del puerto son específicos del hardware del autor; es necesario adaptarlos al propio entorno.
- No es un modelo de lenguaje: no se puede usar para procesamiento de texto, generación de código o cualquier tarea de NLP.
- Fecha de creación en el futuro (agosto de 2026): el modelo fue publicado con fecha posterior a la actual, lo que puede indicar un error de reloj en el sistema de publicación o una prepublicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreeshinator/arm-pick-blocks-act-first
- Dataset de entrenamiento: https://huggingface.co/datasets/shreeshinator/arm-picking-blocks-real
- Paper ACT (arXiv): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot (guía ACT): https://huggingface.co/docs/lerobot/main/en/act
- Documentación de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shreeshinator/arm-picking-blocks-real
