# jaheroth/act_pusht_bs64_dec7_seed1001_200k

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1001_200k` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face sobre el dataset `lerobot/pusht`, que consiste en demostraciones teleoperadas de un brazo robótico empujando un objeto hasta una posición objetivo. El modelo está pensado para ser evaluado y utilizado en entornos de simulación o robots reales compatibles con LeRobot.

Con 83,97 millones de parámetros y un tamaño de repositorio de 0,3 GB, se trata de un modelo compacto, adecuado para experimentación en robótica y para servir como punto de partida en tareas de manipulación por imitación. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en que ACT es uno de los métodos de imitación más utilizados en la comunidad de robótica open source, y este modelo ofrece un ejemplo reproducible de entrenamiento con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer |
| Parametros totales | 83.969.428 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador y un decodificador transformer. El codificador procesa observaciones (imágenes y estado del robot) y el decodificador genera un chunk de acciones futuras, lo que reduce la acumulación de errores frente a predicciones paso a paso. El modelo fue entrenado con el framework LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones de la tarea PushT. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El nombre del repositorio sugiere un batch size de 64, 7 capas de decodificador, semilla 1001 y 200.000 pasos de entrenamiento, aunque estos hiperparámetros no están confirmados en la documentación oficial.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para manipulación de objetos, específicamente la tarea PushT.
- Integración con LeRobot: puede cargarse y ejecutarse mediante las herramientas de inferencia y evaluación de LeRobot.
- Reproducibilidad: al estar publicado en el Hub con safetensors, permite replicar experimentos y comparar resultados.
- No incluye capacidades de lenguaje natural, visión general, tool calling ni razonamiento simbólico; su ámbito es exclusivamente el control motor en robótica.

## Casos de uso

- Evaluación de políticas de imitación en el benchmark PushT: el modelo puede ejecutarse en el entorno simulado de PushT para medir su tasa de éxito frente a otras políticas entrenadas con el mismo dataset.
- Investigación en aprendizaje por imitación: sirve como baseline para estudiar el efecto del chunking de acciones, la arquitectura transformer o los hiperparámetros en tareas de manipulación.
- Desarrollo de robots reales con LeRobot: la política puede transferirse a un brazo robótico compatible (por ejemplo, SO-100) mediante el script de evaluación de LeRobot, siempre que el espacio de observación y acción coincida.
- Comparación de frameworks de entrenamiento: al estar entrenado con LeRobot, permite contrastar su rendimiento con políticas entrenadas con otras librerías (por ejemplo, robomimic) sobre el mismo dataset.
- Estudio de generalización: se puede evaluar el modelo en variantes de la tarea PushT (diferentes posiciones iniciales, obstáculos) para analizar su robustez.
- Formación y docencia: como ejemplo de modelo ACT publicado en el Hub, es útil para enseñar el flujo completo de entrenamiento, publicación y evaluación de políticas robóticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como tasa de éxito en PushT, ni comparaciones con otros modelos en la documentación del repositorio.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del modelo. Dado su tamaño (84M parámetros, 0,3 GB), es razonable esperar que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay datos confirmados. Para inferencia con LeRobot, se recomienda una GPU NVIDIA con soporte CUDA. Las opciones de despliegue incluyen el uso directo con LeRobot (que utiliza PyTorch) y la posibilidad de exportar a otros formatos, aunque no se documentan en este repositorio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros modelos ACT entrenados sobre PushT en el Hub (por ejemplo, `arclabmit/pusht_act_model`), pero no se han encontrado datos de rendimiento ni especificaciones detalladas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea PushT; no es generalizable a otras tareas de robótica sin reentrenamiento.
- Sin capacidades de lenguaje o visión general: no procesa texto ni imágenes fuera del contexto de la tarea.
- Dependencia del entorno de entrenamiento: el rendimiento puede degradarse si las condiciones del entorno (iluminación, calibración de cámaras, dinámica del robot) difieren de las del dataset.
- Sin datos de robustez: no se han publicado estudios sobre alucinación de acciones, sesgos del dataset o comportamiento ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero es responsabilidad del usuario verificar que el dataset `lerobot/pusht` y las herramientas asociadas cumplen con sus propias licencias.
- Fecha de creación futura (2026): el modelo fue subido con fecha posterior a la actual, lo que puede indicar un error en el registro o un repositorio de prueba; se recomienda verificar su validez antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1001_200k
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
