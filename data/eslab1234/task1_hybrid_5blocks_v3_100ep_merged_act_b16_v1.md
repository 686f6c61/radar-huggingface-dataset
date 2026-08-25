# eslab1234/task1_hybrid_5blocks_v3_100ep_merged_act_b16_v1

## Resumen

El modelo `eslab1234/task1_hybrid_5blocks_v3_100ep_merged_act_b16_v1` es una política de manipulación robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario eslab1234 y entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que permite al robot ejecutar movimientos fluidos y precisos a partir de datos teleoperados. Este modelo concreto está entrenado para realizar una tarea específica: recoger cinco bloques de colores (rojo, amarillo, madera, verde y azul) en secuencia y colocarlos en una zona objetivo. La relevancia de este modelo radica en su enfoque práctico para la robótica de manipulación, ya que demuestra cómo un modelo relativamente pequeño (51,7 millones de parámetros) puede resolver tareas complejas con datos de demostración limitados, y su integración con LeRobot facilita la reproducción y el despliegue en robots reales.

La arquitectura de ACT combina un codificador de visión (basado en Vision Transformer) con un transformador de acción, y en este caso se utilizan dos cámaras (cámara superior y cámara de muñeca) junto con el estado del robot (posición de las articulaciones). El modelo se entrenó durante 50 000 pasos con un tamaño de lote de 16 y una tasa de aprendizaje de 1e-5, sobre un conjunto de datos de 100 episodios (138 387 fotogramas) a 30 FPS. El repositorio incluye los pesos en formato safetensors y está preparado para ejecutarse en un robot tipo `so_follower` mediante el CLI de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51 668 614 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; procesa imágenes y estado) |
| Tipos de cuantización | No disponible (pesos completos en safetensors) |
| Idiomas soportados | No aplicable (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers) propuesta en el paper [arXiv:2304.13705](https://huggingface.co/papers/2304.13705). ACT utiliza un codificador de visión basado en Vision Transformer (ViT) para procesar las imágenes de dos cámaras (cámara superior y cámara de muñeca) y un codificador de estado para el vector de 6 dimensiones de las articulaciones. Estos datos se combinan y se pasan a un transformador que predice un *chunk* de acciones (una secuencia de acciones futuras) en lugar de una sola acción. Este enfoque reduce la acumulación de errores y permite movimientos más suaves y precisos en tareas de manipulación.

El entrenamiento se realizó con LeRobot versión 0.5.2, usando el optimizador AdamW con una tasa de aprendizaje de 1e-5, un tamaño de lote de 16 y 50 000 pasos de entrenamiento. El conjunto de datos `eslab1234/task1_hybrid_5blocks_v3_100ep_merged` contiene 100 episodios teleoperados con 138 387 fotogramas a 30 FPS, correspondientes a la tarea de recoger y colocar bloques en orden. No se menciona el uso de RLHF ni técnicas de ajuste fino adicionales; es un entrenamiento de imitación estándar.

## Capacidades

- **Manipulación robótica**: es capaz de ejecutar una secuencia de acciones de agarre y colocación de objetos en un entorno físico, utilizando entradas de visión y estado.
- **Predicción de acciones en chunks**: produce secuencias de acciones de longitud fija, lo que mejora la fluidez y la estabilidad del movimiento.
- **Percepción multimodal**: procesa simultáneamente imágenes de dos cámaras (cámara superior y cámara de muñeca) y el estado de las articulaciones (6 dimensiones).
- **Aprendizaje por imitación**: aprendida a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas ni refuerzo.
- **Soporte de herramientas**: No aplica, no es un modelo de lenguaje ni de tool calling.
- **Capacidades multilingües**: No aplica, no procesa texto.

## Casos de uso

- **Manipulación de objetos en entornos industriales**: El modelo puede controlar un brazo robótico para tareas de recogida y colocación (pick-and-place) de piezas en una línea de montaje. Gracias a su capacidad de predecir chunks de acciones, es adecuado para movimientos repetitivos y precisos.
- **Automatización de tareas de clasificación**: Puede integrarse en un sistema de clasificación de objetos por color o forma, como el entrenado para distinguir bloques rojos, amarillos, de madera, verdes y azules. Su uso reduce la intervención humana en tareas monótonas.
- **Investigación en aprendizaje por imitación**: Es un ejemplo práctico de cómo entrenar una política ACT con LeRobot, útil para estudiar la transferencia de habilidades de demostraciones humanas a robots.
- **Prototipado rápido de políticas robóticas**: Los investigadores pueden clonar este modelo y adaptarlo a nuevas tareas con pocos datos, gracias a la simplicidad del flujo de LeRobot.
- **Educación en robótica**: Puede usarse en cursos de robótica para mostrar el pipeline completo desde la recopilación de datos hasta la ejecución en un robot real, sin necesidad de diseñar controladores manuales.
- **Evaluación de hardware robótico**: Permite validar el rendimiento de un brazo robótico `so_follower` y de sus cámaras en condiciones de tarea controlada, midiendo la tasa de éxito en la manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación proporcionados. No se reportan métricas como tasa de éxito en el robot real ni comparaciones con otros métodos.

## Requisitos de hardware

- **VRAM estimada**: Dado que el modelo tiene ~51,7 millones de parámetros y se ejecuta en PyTorch con LeRobot, se estima que la inferencia requiere al menos 2-4 GB de VRAM en una GPU de consumo (por ejemplo, RTX 3060 o superior) para un lote pequeño. El entrenamiento completo (50k pasos) puede requerir entre 8 y 16 GB de VRAM dependiendo del tamaño de lote y la resolución de las imágenes (480x640).
- **GPU recomendadas**: Para inferencia en tiempo real, una GPU NVIDIA con al menos 6 GB de VRAM (RTX 2060 o superior) es suficiente. Para entrenamiento, se recomienda una GPU con 16 GB o más (RTX 4080, A100, etc.).
- **Cabe en consumer GPU**: Sí, tanto para inferencia como para entrenamiento con ajustes de lote reducidos.
- **Opciones de despliegue**: El modelo se ejecuta con la librería LeRobot, que ofrece scripts de rollout para robots reales (`lerobot-rollout`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de lenguaje.
- **Latencia y throughput**: No se proporcionan datos de latencia en la documentación. En una GPU de gama media, se espera una frecuencia de control de 30 Hz (el mismo FPS de los datos de entrenamiento), suficiente para la tarea de manipulación.

## Comparativa con modelos similares

No hay información suficiente para comparar este modelo con otras políticas de manipulación robótica en la información disponible. ACT es un método conocido en el campo del aprendizaje por imitación, pero no se proporcionan comparaciones numéricas con otras implementaciones o variantes. Se podría comparar con otros modelos de LeRobot entrenados para tareas similares, pero no se han encontrado datos públicos en la búsqueda.

## Limitaciones y advertencias

- **Especificidad de la tarea**: El modelo está entrenado para una tarea concreta (recoger 5 bloques en orden y colocarlos en una zona). No generaliza a otras tareas o disposiciones de objetos sin reentrenamiento.
- **Dependencia de las cámaras**: La política requiere las mismas cámaras (top y wrist) con la misma posición y orientación que en el entrenamiento. Cambios en el entorno (iluminación, fondo, posición de cámara) pueden degradar el rendimiento.
- **Riesgo de alucinación**: Aunque no es un modelo de texto, la predicción de acciones puede ser incorrecta en situaciones no vistas, llevando a movimientos erráticos. La falta de evaluación en el robot real aumenta este riesgo.
- **Datos de entrenamiento limitados**: Con solo 100 episodios, la generalización a variaciones de la tarea es limitada.
- **Licencia y uso comercial**: La licencia Apache-2.0 permite uso comercial y modificación, pero no hay garantías de rendimiento ni soporte.
- **Requisitos de hardware**: Aunque cabe en GPUs de consumo, el despliegue en un robot real requiere además el hardware físico (brazo `so_follower`, cámaras, controlador) que no está incluido.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/eslab1234/task1_hybrid_5blocks_v3_100ep_merged_act_b16_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_100ep_merged)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
