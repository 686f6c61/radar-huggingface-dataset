# FYPlerobot/act_us_probe_policy

## Resumen

`act_us_probe_policy` es una política de imitación robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. La desarrolla el usuario FYPlerobot y se publica en Hugging Face a través de la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. El modelo resuelve la predicción de acciones motoras a partir de observaciones visuales: en lugar de predecir un único paso de control, genera trozos (chunks) de acciones de corto horizonte, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors. Está entrenado sobre el dataset `FYPlerobot/us_probe_grab_demo_merged`, un conjunto de demostraciones teleoperadas orientado a una tarea concreta de agarre con sonda (probe grab). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

Es relevante ahora porque ejemplifica el flujo actual de LeRobot: políticas pequeñas, entrenadas con pocos datos y publicadas directamente en el Hub, que pueden desplegarse en robots de bajo coste como el SO-100. No es un modelo de lenguaje general, sino un controlador especializado para una tarea física concreta, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. La arquitectura combina un codificador de observaciones (típicamente imágenes de cámara y estado del robot) con un decodificador que emite un chunk de acciones, y emplea un mecanismo de agregación temporal para suavizar la ejecución. El paper original reporta que este enfoque alcanza tasas de éxito altas en tareas de manipulación con datos teleoperados, superando a métodos que predicen un solo paso.

El entrenamiento se realizó con LeRobot sobre el dataset `FYPlerobot/us_probe_grab_demo_merged`, compuesto por demostraciones teleoperadas de la tarea de agarre con sonda. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de las propias de ACT (predicción por chunks y agregación temporal).

## Capacidades

- Control robótico por imitación: genera comandos de acción a partir de observaciones visuales y de estado del robot.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad.
- Ejecución de una tarea específica de agarre con sonda (probe grab) para la que fue entrenado.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100 follower, según el ejemplo de evaluación de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de una tarea de agarre con sonda en un banco de pruebas: el modelo ejecuta la política entrenada sobre el robot SO-100 follower, reproduciendo la secuencia de agarre aprendida de las demostraciones teleoperadas.
- Prototipado rápido de políticas de imitación: sirve como punto de partida para reentrenar con nuevos datasets y comparar tasas de éxito frente a otras políticas de LeRobot.
- Evaluación comparativa de métodos de imitación: al ser una política ACT publicada, puede usarse como línea base en experimentos con el mismo dataset o con variantes.
- Docencia y formación en robótica de imitación: permite reproducir el flujo completo de LeRobot (entrenamiento, grabación de evaluación y despliegue) con un modelo pequeño de 0,2 GB.
- Investigación en manipulación con datos teleoperados: útil para estudiar el efecto del tamaño de los chunks de acción y de la agregación temporal en tareas de agarre.
- Despliegue en hardware de bajo coste: sus 51,7 millones de parámetros permiten inferencia en GPUs de consumo, lo que facilita pruebas en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en safetensors, el peso en precisión completa ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento de la model card usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA compatible con CUDA.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FYPlerobot/act_us_probe_policy | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | no disponible | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | no disponible | variable | Hugging Face |
| Políticas VQ-BeT en LeRobot | variable | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (agarre con sonda) y un dataset concreto; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación publicados: no hay tasas de éxito, curvas de aprendizaje ni métricas que permitan valorar su calidad real.
- Sesgos de los datos de demostración: el comportamiento refleja las condiciones, el robot y el operador que generaron las demostraciones; cambios de iluminación, posición de objetos o hardware pueden degradar el rendimiento.
- Riesgo de fallo físico: al controlar un robot real, errores de la política pueden causar colisiones o daños; se recomienda supervisión y límites de seguridad.
- Idiomas: no aplica; no es un modelo lingüístico.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías del autor.
- Repositorio con 0 descargas y 0 likes: modelo reciente y sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FYPlerobot/act_us_probe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/FYPlerobot/us_probe_grab_demo_merged
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
