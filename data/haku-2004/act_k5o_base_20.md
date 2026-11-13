# Haku-2004/act_k5o_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación. El modelo `Haku-2004/act_k5o_base_20` es una política concreta entrenada con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, compuesta por 51.668.614 parámetros en formato safetensors y publicada bajo licencia Apache 2.0.

Se trata de un modelo de robótica orientado a control de brazos manipuladores (el pipeline de evaluación de la model card referencia el robot `so100_follower`), no de un modelo de lenguaje. Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y despliegue de políticas de imitación con LeRobot, la librería de Hugging Face para robótica de bajo coste, y en que el enfoque ACT permite obtener políticas competentes a partir de datos de teleoperación relativamente modestos.

La información pública disponible es escasa: el repositorio tiene 0 descargas y 0 likes, el tamaño total es de 0,2 GB y no se han publicado benchmarks, idiomas soportados ni detalles del dataset de entrenamiento más allá de su identificador. Esta ficha recoge únicamente los datos verificables de la model card y del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_20261110_143202 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-11-13 |
| Fecha de actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en Transformer que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso de tiempo. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la acumulación de errores en políticas autoregresivas paso a paso y suele traducirse en tasas de éxito más altas con datos de teleoperación. La política se entrena de forma supervisada sobre demostraciones humanas y se ejecuta en bucle cerrado sobre el robot.

En este caso concreto, el modelo se ha entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para robótica, siguiendo el flujo estándar `lerobot-train` con `--policy.type=act`. No se dispone de información pública sobre el número de tokens o episodios de entrenamiento, la composición del dataset `k5_20261110_143202`, el robot exacto de recogida de datos ni si se aplicaron técnicas adicionales de regularización o aumento de datos. Tampoco se documentan innovaciones técnicas específicas más allá de las propias del método ACT original.

## Capacidades

- Control robótico por imitación: genera acciones de control (posiciones articulares o del efector final) a partir de observaciones visuales y de estado del robot.
- Predicción de action chunks: emite secuencias cortas de acciones por inferencia, lo que reduce el error acumulado y mejora la suavidad del movimiento.
- Ejecución en bucle cerrado: la política se re-ejecuta periódicamente con observaciones actualizadas durante la evaluación.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo `so100_follower` según el ejemplo de evaluación de la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Manipulación robótica de laboratorio: entrenar una política ACT sobre demostraciones teleoperadas para tareas de pick-and-place con un brazo `so100`, aprovechando el chunking de acciones para obtener trayectorias más estables.
- Investigación en aprendizaje por imitación: usar este checkpoint como referencia o punto de partida para comparar variantes de ACT, cambios en el dataset o hiperparámetros de entrenamiento con LeRobot.
- Reproducción de experimentos: el repositorio incluye los comandos exactos de entrenamiento y evaluación, lo que facilita replicar el pipeline sobre el dataset `Haku-2004/k5_20261110_143202`.
- Prototipado rápido en robótica de bajo coste: desplegar la política en un robot de sobremesa compatible con LeRobot para validar tareas sencillas antes de invertir en datasets mayores.
- Evaluación comparativa de datasets: al ser una política entrenada sobre un dataset concreto, sirve para medir la calidad de las demostraciones teleoperadas mediante la tasa de éxito en `lerobot-record`.
- Formación y docencia: ejemplo didáctico de entrenamiento de una política de imitación con Transformer, con un tamaño de modelo (51,7 M de parámetros) manejable en hardware de consumo.
- Base para fine-tuning: reentrenar o ajustar la política sobre nuevos datasets de la misma tarea o robot para adaptarla a variaciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 51,7 M de parámetros en precisión completa (fp32) el peso ocupa aproximadamente 0,2 GB, y en fp16 alrededor de 0,1 GB. El cuello de botella real es el modelo visual de la política, no el Transformer de acciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; se ha documentado entrenamiento con `--policy.device=cuda`. Para entrenamiento se recomienda una RTX 3060/4060 o superior.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU NVIDIA moderna (RTX 20xx en adelante) e incluso en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5o_base_20 | 51,7 M | ACT (action chunking) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (checkpoints de referencia) | variable | ACT | no aplica | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable | difusión de acciones | no aplica | Apache 2.0 | Hugging Face / LeRobot |
| Políticas VQ-BeT / TDMPC (LeRobot) | variable | cuantización de acciones / modelo world | no aplica | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot: la política está entrenada sobre el dataset `Haku-2004/k5_20261110_143202` y probablemente no generaliza a otros robots, cámaras o entornos sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia pública de tasa de éxito, robustez ni generalización; el repositorio tiene 0 descargas y 0 likes.
- Dataset no documentado: se desconoce el número de episodios, la calidad de las demostraciones y las condiciones de recogida, lo que impide evaluar el riesgo de sobreajuste.
- Riesgo de fallo en producción: como toda política de imitación, puede fallar ante distribuciones de observación no vistas (iluminación, posiciones iniciales, objetos nuevos) y requiere supervisión humana.
- Sin capacidades lingüísticas ni multimodales generales: no debe emplearse para tareas de texto, visión general o agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del dataset de entrenamiento por si impusieran restricciones adicionales (no disponibles).
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5o_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
