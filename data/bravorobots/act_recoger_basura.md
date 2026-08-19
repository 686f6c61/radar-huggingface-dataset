# BravoRobots/act_recoger_basura

## Resumen

El modelo `BravoRobots/act_recoger_basura` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario BravoRobots y entrenado con el framework LeRobot de Hugging Face. El modelo está especializado en la tarea de recoger basura, utilizando observaciones de dos cámaras (superior y pinza) y el estado del robot para generar comandos de acción de 6 dimensiones.

Con 51,67 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots manipuladores. Su relevancia radica en que demuestra cómo el aprendizaje por imitación con transformers puede aplicarse a tareas domésticas o industriales de manipulación con un coste computacional reducido. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, listo para su uso con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un codificador visual (basado en ResNet) con un transformer que procesa secuencias de observaciones y genera chunks de acciones. El modelo consume dos imágenes de 480x640 píxeles (cámara superior y cámara de la pinza) junto con un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones que se ejecuta en el robot. El entrenamiento se realizó mediante aprendizaje por imitación con datos teleoperados, utilizando el dataset `BravoRobots/nvidialab_recogida` que contiene 91 episodios y 36.971 fotogramas a 30 FPS.

La configuración de entrenamiento incluye 100.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5 y semilla 1000, todo ello con LeRobot versión 0.6.0. No se mencionan técnicas adicionales como RLHF o DPO, ya que es un modelo puramente de imitación. La innovación principal es el uso de chunks de acciones, que reduce la acumulación de errores y mejora la estabilidad del movimiento.

## Capacidades

- Generación de acciones de manipulación robótica en tiempo real (6 dimensiones: posición, orientación y apertura de pinza).
- Procesamiento de observaciones visuales desde dos cámaras (RGB, 480x640) y estado propioceptivo del robot.
- Ejecución de tareas de recogida de objetos (en este caso, basura) mediante aprendizaje por imitación.
- Soporte para inferencia continua con LeRobot (`lerobot-rollout`).
- Capacidad de entrenamiento personalizado sobre nuevos datasets con `lerobot-train`.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico.

## Casos de uso

- Recogida de residuos en entornos controlados: el modelo puede integrarse en un robot tipo `so_follower` para recoger objetos del suelo o de superficies, utilizando las cámaras para localizar y agarrar la basura.
- Automatización de tareas domésticas: aplicable a robots de asistencia que necesitan recoger objetos pequeños (papeles, latas, plásticos) en interiores.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT con pocos episodios (91) y comparar con otros métodos.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño, puede desplegarse en GPUs de gama media para pruebas en laboratorio.
- Benchmarking de algoritmos de manipulación: al estar disponible públicamente, permite comparar métricas de éxito con otros modelos de LeRobot.
- Educación en robótica: útil para demostrar el flujo completo de LeRobot (captura de datos, entrenamiento y despliegue) en cursos universitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas de éxito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~51M parámetros, requiere menos de 1 GB de VRAM en FP32, y mucho menos en cuantización (aunque no se publican pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, etc.).
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: LeRobot (con `lerobot-rollout`), también puede exportarse a ONNX o TensorRT para inferencia optimizada, aunque no está documentado.
- Latencia y throughput: no disponible, pero por el tamaño del modelo se espera inferencia en tiempo real (más de 30 FPS) en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Al ser una política de robótica específica, no existen benchmarks estándar comparables con otros modelos de lenguaje o visión. Se podría comparar con otros modelos ACT de LeRobot, pero no hay información pública sobre sus métricas. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo ha sido entrenado con solo 91 episodios, lo que puede limitar su generalización a nuevas posiciones, iluminación o tipos de objetos no vistos.
- No hay resultados de evaluación en robot real, por lo que su rendimiento real no está verificado.
- La tarea descrita en el dataset es genérica ("My task description"), lo que sugiere una documentación incompleta.
- El modelo está especializado en la tarea de recogida de basura y no es transferible directamente a otras tareas sin reentrenamiento.
- Riesgo de alucinación de acciones: como todo modelo de imitación, puede generar movimientos erráticos ante observaciones fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de seguridad para aplicaciones críticas sin validación adicional.
- Depende del hardware específico (robot `so_follower`) y de las cámaras configuradas; cambios en la configuración requieren reentrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BravoRobots/act_recoger_basura
- Dataset de entrenamiento: https://huggingface.co/datasets/BravoRobots/nvidialab_recogida
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
