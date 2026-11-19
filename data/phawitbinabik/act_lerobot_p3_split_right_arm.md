# phawitbinabik/act_lerobot_p3_split_right_arm

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice bloques de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, publicado por el usuario phawitbinabik, contiene una política ACT entrenada con LeRobot sobre el dataset `lerobot_p3_split_right_arm`, orientada al control de un brazo robótico derecho en una configuración de robot tipo SO100.

El modelo se distribuye como un checkpoint de política (policy) para el ecosistema LeRobot, con 51.672.712 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones (típicamente imágenes de cámaras e información de estado de las articulaciones) a secuencias de comandos de acción para el robot.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de entrenamiento de políticas de imitación con LeRobot y como base para experimentar con control de brazos robóticos mediante aprendizaje supervisado a partir de demostraciones teleoperadas. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control robotico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (codificador de imágenes) con un transformer que fusiona las observaciones visuales y el estado de las articulaciones para predecir un chunk de acciones futuras de forma conjunta. Esta predicción por bloques, introducida en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso, y permite un control más suave y consistente.

El entrenamiento se realizó con LeRobot mediante aprendizaje por imitación supervisado sobre el dataset `phawitbinabik/lerobot_p3_split_right_arm`, compuesto por demostraciones teleoperadas del brazo derecho. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de comandos de acción para un brazo robótico derecho a partir de observaciones sensoriales.
- Predicción de chunks de acciones (secuencias cortas de comandos) para control estable.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el pipeline de LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes basados en lenguaje.
- No tiene capacidades multilingües ni de procesamiento de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Control de un brazo robótico derecho en tareas de manipulación: la política genera comandos de acción a partir de las observaciones de cámara y el estado de las articulaciones, adecuada para tareas repetitivas aprendidas de demostraciones.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT y reproducir experimentos con LeRobot.
- Prototipado rápido de políticas robóticas: al estar entrenado y publicado con LeRobot, permite evaluar el flujo completo de entrenamiento e inferencia con `lerobot-record`.
- Docencia y formación: ejemplo práctico de entrenamiento de políticas con datasets teleoperados y despliegue en robots de bajo coste tipo SO100.
- Benchmarking interno de hardware: útil para medir latencia y estabilidad de políticas ACT en un brazo concreto antes de escalar a configuraciones bimanuales.
- Base para fine-tuning: punto de partida para adaptar la política a nuevas tareas del mismo brazo mediante entrenamiento adicional con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 51,7 millones de parámetros, el checkpoint en safetensors ocupa aproximadamente 0,2 GB, por lo que la inferencia es ligera y cabe en GPUs de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no se documenta oficialmente.
- Cabe en GPU consumer: sí, por el tamaño del modelo (0,2 GB en disco), aunque no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA según la guía de entrenamiento.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phawitbinabik/act_lerobot_p3_split_right_arm | 51.672.712 | no aplica | no disponible | apache-2.0 | Hugging Face |
| Otros checkpoints ACT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | no disponible | variable | Hugging Face / repositorios |
| Políticas VQ-BeT | no disponible | no aplica | no disponible | variable | Hugging Face / repositorios |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con demostraciones teleoperadas de un operador concreto, la política puede heredar sesgos de estilo y trayectoria del demostrador.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero la política puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; su ámbito es exclusivamente el control del brazo derecho para el que fue entrenado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos reales.
- Caveats para producción: no hay benchmarks publicados, el repositorio tiene 0 descargas y 0 likes, y no se documentan episodios de entrenamiento ni métricas de éxito; se recomienda validación exhaustiva en entorno controlado antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/phawitbinabik/act_lerobot_p3_split_right_arm
- Dataset: https://huggingface.co/datasets/phawitbinabik/lerobot_p3_split_right_arm
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
