# shivan00/doosan_gripper_direct_v3_continue5k

## Resumen

`shivan00/doosan_gripper_direct_v3_continue5k` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario `shivan00` y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que facilita el entrenamiento y despliegue de políticas de control robótico a partir de datos de teleoperación.

El modelo está especializado en el control de un gripper Doosan, según se deduce del nombre del repositorio y del dataset asociado `shivan00/doosan_gripper_direct_v3`. Con 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, se trata de una política compacta orientada a inferencia en tiempo real sobre hardware de robótica, no a generación de texto ni a tareas de lenguaje natural.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas con LeRobot: un modelo ACT entrenado sobre un dataset propio, con licencia Apache 2.0 y pesos en formato safetensors, listo para ser evaluado con `lerobot-record` sobre un robot SO-100 follower. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitación |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, el modelo predice un fragmento (chunk) de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. La arquitectura se basa en un transformer que procesa observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y genera secuencias de acciones.

El modelo se ha entrenado con LeRobot sobre el dataset `shivan00/doosan_gripper_direct_v3`, compuesto presumiblemente por episodios de teleoperación del gripper Doosan. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este tipo de políticas). El sufijo `continue5k` sugiere un entrenamiento continuado de 5.000 pasos o episodios adicionales, aunque este dato no está confirmado en la model card.

## Capacidades

- Control robótico de un gripper Doosan mediante aprendizaje por imitación a partir de datos de teleoperación.
- Predicción de fragmentos de acción (action chunking) para tareas de manipulación.
- Inferencia sobre observaciones visuales y de estado del robot (según el pipeline de LeRobot para ACT).
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue sobre robots tipo SO-100 follower.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes multi-paso.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Control de un gripper Doosan en tareas de pick-and-place: el modelo genera secuencias de acciones a partir de observaciones visuales y de estado, adecuado para manipulación repetitiva en entornos industriales o de laboratorio.
- Investigación en aprendizaje por imitación: sirve como punto de partida para reproducir el pipeline ACT de LeRobot y comparar con otras políticas entrenadas sobre el mismo dataset.
- Evaluación de datasets de teleoperación: permite validar la calidad del dataset `doosan_gripper_direct_v3` ejecutando la política con `lerobot-record` y midiendo la tasa de éxito en episodios de evaluación.
- Prototipado rápido de políticas robóticas: al ser un modelo compacto (51,7 M de parámetros, 0,2 GB), se puede entrenar y desplegar en estaciones de trabajo con GPU consumer.
- Fine-tuning sobre nuevas tareas del mismo robot: el modelo puede servir como inicialización para entrenamientos continuados (como sugiere el sufijo `continue5k`) en variantes del gripper Doosan.
- Docencia y formación en robótica: ejemplo práctico de un flujo completo de LeRobot, desde el dataset hasta la inferencia sobre un robot SO-100 follower.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión FP32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) es suficiente para la inferencia.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia sobre CUDA según la documentación de LeRobot.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shivan00/doosan_gripper_direct_v3_continue5k | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Otros modelos de robótica con pipeline `robotics` en Hugging Face | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos comparativos publicados para este modelo concreto frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado en una tarea y un robot concretos (gripper Doosan); no es un modelo de propósito general ni transferible sin reentrenamiento.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se han publicado métricas de éxito, benchmarks ni detalles del dataset de entrenamiento, lo que dificulta evaluar su robustez.
- Riesgo de sobreajuste al dataset de teleoperación `doosan_gripper_direct_v3`; el rendimiento en condiciones distintas a las de entrenamiento es desconocido.
- Posible alucinación en el sentido de acciones no válidas fuera de la distribución de entrenamiento; en robótica esto se traduce en movimientos erróneos o inseguros.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente impide verificar la procedencia y los derechos de los datos de teleoperación.
- No apto para producción sin una evaluación exhaustiva en el robot objetivo y con protocolos de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivan00/doosan_gripper_direct_v3_continue5k
- Dataset asociado: https://huggingface.co/datasets/shivan00/doosan_gripper_direct_v3
- Artículo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
