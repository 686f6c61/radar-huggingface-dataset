# aailabkaist/pi05_coffee_NorRec_RW_10k_PositionalShift

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado a LeRobot desde su repositorio OpenPI. El checkpoint aquí descrito, `pi05_coffee_NorRec_RW_10k_PositionalShift`, es un fine-tuning realizado por el usuario `aailabkaist` sobre el modelo base π₀.₅, orientado a una tarea concreta de manipulación robótica en el dominio del café (coffee). El modelo combina percepción visual, comprensión del lenguaje y generación de acciones motoras en un único transformer de aproximadamente 3.600 millones de parámetros.

La relevancia de π₀.₅ radica en su objetivo de generalización en entornos abiertos: a diferencia de políticas robóticas entrenadas para un único escenario controlado, el modelo base está diseñado para transferir a situaciones y entornos no vistos durante el entrenamiento. Este checkpoint concreto aplica ese modelo generalista a un conjunto de datos específico de 10.000 episodios (según el sufijo `10k`), con modificaciones de aumento de datos (`PositionalShift`) y sin recurrencia (`NorRec`).

El modelo se distribuye en formato safetensors con licencia Apache 2.0, con un tamaño de repositorio de 7,5 GB, y se integra en el ecosistema LeRobot de Hugging Face para entrenamiento, evaluación e inferencia sobre robots tipo SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, implementación LeRobot de π₀.₅ (OpenPI) |
| Parametros totales | 3.616.757.520 (~3,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 7,5 GB |
| Dataset de entrenamiento | aailabkaist/pi05_coffee_NorRec_RW_10k_PositionalShift_training_data |
| Descargas | 24 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo Vision-Language-Action que fusiona un backbone de visión-lenguaje con un cabezal de generación de acciones. La implementación disponible es la adaptación de LeRobot del repositorio OpenPI, lo que implica que los pesos son compatibles con el pipeline de entrenamiento e inferencia de LeRobot (`lerobot-train`, `lerobot-record`).

El checkpoint ha sido entrenado sobre el dataset `pi05_coffee_NorRec_RW_10k_PositionalShift_training_data`, que por su nombre sugiere 10.000 episodios de una tarea de café, con variantes de aumento (`PositionalShift`) y sin componente recurrente (`NorRec`). No se dispone de información detallada sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card no documenta innovaciones técnicas adicionales más allá de las propias del modelo base π₀.₅.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural (política VLA).
- Percepción visual del entorno para manipulación robótica.
- Comprensión de instrucciones en lenguaje natural para guiar la ejecución de tareas.
- Generalización a entornos abiertos, según el diseño del modelo base π₀.₅.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Ejecución sobre robots tipo `so100_follower` según la documentación de LeRobot.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio especial: no disponible.

## Casos de uso

- Manipulación robótica en tareas de café: el modelo puede ejecutar secuencias de preparación de café (manipulación de utensilios, vertido, etc.) a partir de observaciones visuales, aprovechando el fine-tuning específico sobre el dataset de café.
- Investigación en generalización de políticas VLA: sirve como punto de partida para estudiar cómo el modelo base π₀.₅ se adapta a dominios concretos mediante fine-tuning.
- Evaluación comparativa de aumentos de datos: el sufijo `PositionalShift` permite analizar el efecto de variaciones posicionales en el entrenamiento sobre el rendimiento final.
- Despliegue en robots de bajo coste tipo SO-100: la integración con LeRobot permite ejecutar la política en hardware accesible mediante `lerobot-record`.
- Reproducción de experimentos: investigadores pueden reentrenar o evaluar la política con el dataset asociado para replicar resultados.
- Prototipado de pipelines de imitación robótica: sirve como referencia para construir flujos de entrenamiento con LeRobot y validar la cadena completa de datos, entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~3,6 B parámetros, en fp16 se requieren aproximadamente 7,2 GB solo para pesos, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM para inferencia en precisión completa, aunque no se confirma.
- ¿Cabe en consumer GPU?: probablemente en GPUs consumer de gama alta (p. ej. RTX 3090/4090 con 24 GB) en fp16, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el ecosistema Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_coffee_NorRec_RW_10k_PositionalShift | ~3,6 B | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| aailabkaist/pi05_coffee_NorRec_R_10k | no disponible | no disponible | no disponible | Hugging Face |
| π₀.₅ base (Physical Intelligence / OpenPI) | no disponible | no disponible | no disponible | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una tarea concreta (café); su rendimiento fuera de ese dominio no está documentado.
- No se han publicado benchmarks que permitan validar su rendimiento objetivo.
- Riesgo de sobreajuste al dataset de entrenamiento específico, dado el fine-tuning sobre 10.000 episodios de una única tarea.
- No se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinación en la interpretación de instrucciones o escenas no vistas.
- Limitaciones de contexto e idioma no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base π₀.₅ y del dataset asociado.
- Para producción, es necesario validar el comportamiento en el robot y entorno concretos, ya que la model card no ofrece garantías de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/aailabkaist/pi05_coffee_NorRec_RW_10k_PositionalShift
- Dataset de entrenamiento: https://huggingface.co/datasets/aailabkaist/pi05_coffee_NorRec_RW_10k_PositionalShift_training_data
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado: https://huggingface.co/aailabkaist/pi05_coffee_NorRec_R_10k
