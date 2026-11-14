# Muhammad241198/act_dsub_90

## Resumen

`act_dsub_90` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario Muhammad241198 en Hugging Face y se ha entrenado y subido mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Está asociado al dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, lo que sugiere una tarea concreta de manipulación (posiblemente instalación) grabada mediante teleoperación.

Se trata de un modelo pequeño, de 51.674.759 parámetros (unos 51,7 millones), con pesos en formato safetensors y un repositorio de 0,2 GB. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de acción para un robot. Su relevancia radica en que ejemplifica el flujo actual de políticas robóticas reproducibles y ligeras, desplegables en hardware modesto y entrenables con LeRobot.

La licencia es Apache 2.0, lo que permite uso comercial y modificación. El modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.674.759 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (habitualmente un ResNet preentrenado) con un transformer que genera chunks de acciones, es decir, secuencias cortas de comandos predichas de una sola vez en lugar de un único paso. Esta estrategia reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. El modelo incluye una cabeza de estilo CVAE (variable latente) durante el entrenamiento para capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realiza a partir de datos de teleoperación, en este caso el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, cuyo contenido, número de episodios y composición no se detallan en la información disponible. No se especifica el número de tokens ni de muestras, ni si hubo ajuste fino adicional. La política se ha entrenado y publicado con LeRobot, lo que implica el pipeline estándar de esta librería (normalización de observaciones, aumento de datos y configuración por defecto de ACT salvo que el autor indique lo contrario).

## Capacidades

- Control robótico por imitación: genera comandos de acción para un robot a partir de observaciones visuales y de estado.
- Predicción por chunks de acciones, lo que permite movimientos más suaves y coherentes que la predicción paso a paso.
- Integración con LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-record`).
- Compatible con robots tipo SO-100/SO-101 segun los ejemplos de la model card (`so100_follower`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni lenguaje natural; su entrada es sensorial (imágenes y estado proprioceptivo).

## Casos de uso

- Automatización de una tarea de instalación concreta: la política se entrenó sobre el dataset `DSUB-installnew2026`, por lo que puede replicar la secuencia de manipulación demostrada en un banco de trabajo con un robot de bajo coste.
- Prototipado rápido en robótica de investigación: al tener 51,7 M de parámetros y 0,2 GB de pesos, se puede entrenar y evaluar en una sola GPU de consumo en horas, lo que facilita iterar sobre nuevas demostraciones.
- Evaluación reproducible de políticas: el flujo `lerobot-record` con `--policy.path` permite comparar esta política con otras sobre el mismo robot y conjunto de episodios.
- Educación y docencia en aprendizaje por imitación: sirve como ejemplo completo de pipeline ACT (dataset, entrenamiento, checkpoint y evaluación) para cursos de robótica.
- Despliegue en robots de bajo coste tipo SO-100: el tamaño reducido permite ejecutar la inferencia en una GPU modesta o incluso en CPU con latencias aceptables para tareas de manipulación lenta.
- Base para ajuste fino en tareas similares: al estar en Apache 2.0 y en formato safetensors, se puede reentrenar con nuevos datos de teleoperación para variantes de la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos) y menos aún en FP16 (~103 MB); el codificador visual puede añadir algo de memoria, pero el conjunto cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para entrenamiento ligero; para entrenamiento con lotes mayores se recomienda RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a otros runtimes no documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_dsub_90 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | resultados en tareas ALBERT/Sim | investigación | paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | no disponible | según implementación | múltiples checkpoints en LeRobot |
| Políticas VLA tipo OpenVLA | ~7 B | no aplica | no disponible | según modelo | Hugging Face |

La comparación cuantitativa no es posible con la información disponible; los modelos VLA de gran tamaño difieren en escala y propósito (incluyen lenguaje), mientras que ACT y Diffusion Policy son políticas de imitación específicas por tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sin datos de evaluación: no hay métricas de éxito publicadas, por lo que se desconoce su fiabilidad real.
- Dataset opaco: no se detalla el número de episodios, la cámara utilizada ni las condiciones de recogida, lo que dificulta reproducir el entrenamiento.
- Riesgo de sobreajuste a las condiciones de iluminación, posición de objetos y hardware del dataset original.
- Sin capacidades de lenguaje ni de razonamiento simbólico; no apto para tareas que requieran interpretar instrucciones en texto.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del robot en producción recae en el integrador.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_90
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/rbtrprjkt/DSUB-installnew2026_20261026_033023
