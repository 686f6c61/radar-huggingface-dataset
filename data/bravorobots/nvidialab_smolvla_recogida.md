# BravoRobots/nvidialab_smolvla_recogida

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto, `BravoRobots/nvidialab_smolvla_recogida`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario BravoRobots sobre un dataset propio de demostraciones robóticas (`BravoRobots/nvidialab_recogida`). El modelo implementa una política de control para un robot tipo `so_follower` con dos cámaras (superior y pinza), entrenada mediante aprendizaje por imitación con la librería LeRobot.

La relevancia de este modelo radica en que demuestra el flujo práctico de adaptar SmolVLA a una tarea específica de manipulación robótica con un coste computacional reducido. Aunque no se han publicado resultados de evaluación, su existencia sirve como referencia para desarrolladores que deseen replicar el proceso de fine-tuning con LeRobot. La licencia Apache 2.0 permite uso comercial sin restricciones, y el tamaño del modelo (450M parámetros) lo hace viable en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`, que a su vez es un VLA compacto con 450M parámetros. La arquitectura interna combina un codificador de visión, un modelo de lenguaje y una cabeza de acción, todo integrado en un transformer multimodal. En este caso, el fine-tuning se realizó con la librería LeRobot sobre un dataset de 91 episodios y 36.971 frames, con imágenes de 480×640 píxeles de dos cámaras y un vector de estado de 6 dimensiones. El entrenamiento se ejecutó durante 150.000 pasos con batch size 32, optimizador AdamW y learning rate 1e-4. No se mencionan técnicas como RLHF o DPO; es un entrenamiento supervisado de imitación. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias del modelo base.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posición y orientación de la pinza) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente dos flujos de imagen (cámara superior y cámara de pinza) junto con el estado del robot.
- Especialización en tareas de recogida: el modelo está entrenado para una tarea concreta de manipulación, aunque la descripción de la tarea en el dataset es genérica ("My task description").
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No es un modelo de lenguaje conversacional: no genera texto ni responde a prompts; su salida es exclusivamente una secuencia de acciones.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede controlar un robot seguidor para recoger objetos de una superficie y colocarlos en otra posición, aprovechando su entrenamiento en 91 episodios de demostración.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de SmolVLA, sirve como plantilla para que otros desarrolladores adapten el modelo a sus propias tareas con el flujo de LeRobot.
- Investigación en aprendizaje por imitación: el repositorio documenta un caso real de entrenamiento con LeRobot, útil para estudiar el efecto del número de episodios, la configuración de cámaras y los hiperparámetros.
- Despliegue en robots de bajo coste: gracias a sus 450M parámetros, puede ejecutarse en hardware de consumo (por ejemplo, una RTX 3060), lo que lo hace accesible para makers y pequeñas empresas.
- Base para fine-tuning adicional: el checkpoint puede servir como punto de partida para nuevas tareas de manipulación mediante transferencia de aprendizaje, aunque no se han publicado resultados que lo confirmen.
- Evaluación de VLA en entornos reales: aunque este modelo no tiene métricas publicadas, puede utilizarse como referencia para comparar el rendimiento de SmolVLA frente a otros VLA en tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". No hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450M parámetros, en fp32 ocuparía aproximadamente 1,8 GB, en fp16 unos 0,9 GB y en int8 unos 0,45 GB. Sin embargo, no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería poder ejecutar el modelo en fp16. En la práctica, una RTX 3060 o superior es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, el paper original de SmolVLA enfatiza el despliegue en hardware de consumo, y este modelo hereda esa característica.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) para ejecutar la política en robots reales. También es posible usar la librería directamente en Python.
- Latencia y throughput: no disponibles; dependerán del hardware y de la optimización del código.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. A nivel cualitativo, SmolVLA (450M) es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace más ligero y adecuado para despliegue local, pero a costa de un rendimiento potencialmente menor en tareas complejas. No hay información sobre el contexto de este fine-tuning específico, y la licencia Apache 2.0 es más permisiva que las de otros modelos propietarios. No se puede establecer una comparativa rigurosa sin datos de evaluación.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para una única tarea (recogida) con un robot concreto (`so_follower`) y dos cámaras fijas. No generaliza a otras tareas, robots o configuraciones de sensores sin un nuevo fine-tuning.
- Falta de evaluación: no se han proporcionado resultados de éxito ni métricas de rendimiento, por lo que se desconoce su fiabilidad en producción.
- Descripción de tarea genérica: el dataset etiqueta la tarea como "My task description", lo que sugiere una documentación deficiente y dificulta la reproducibilidad.
- Dependencia de la calidad del dataset: el rendimiento está limitado por los 91 episodios de demostración; un dataset pequeño puede provocar sobreajuste o comportamientos frágiles ante variaciones del entorno.
- Riesgo de alucinación de acciones: como cualquier modelo de aprendizaje automático, puede generar acciones incorrectas en situaciones fuera de la distribución de entrenamiento, sin mecanismos de verificación.
- Licencia Apache 2.0: permite uso comercial, pero no incluye garantías ni responsabilidad por parte de los autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BravoRobots/nvidialab_smolvla_recogida
- Dataset de entrenamiento: https://huggingface.co/datasets/BravoRobots/nvidialab_recogida
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Web oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
