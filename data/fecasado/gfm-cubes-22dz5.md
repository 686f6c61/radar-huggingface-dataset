# fecasado/gfm-cubes-22dZ5

## Resumen

GFM-cubes-22dZ5 es una política robótica (policy) entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El autor, fecasado, la publica bajo el identificador `gaze_flow_matching`, lo que indica que el método de entrenamiento se basa en *gaze flow matching*: una variante de flow matching condicionada por la mirada (gaze) del operador humano durante la teleoperación. El modelo resuelve el problema de mapear observaciones visuales y estados del robot a acciones de control continuas, y es relevante porque aplica una técnica generativa relativamente reciente (flow matching) al dominio de la manipulación robótica con datos de demostración.

El modelo tiene 75.241.434 parámetros (unos 75,2 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,3 GB. Está asociado al dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que sugiere una tarea de manipulación de cubos a cestas con imágenes de 320x240 píxeles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La información pública disponible es escasa: la model card es una plantilla sin completar por el autor, no se especifican idiomas, contexto ni detalles de arquitectura más allá de las etiquetas. Esta ficha se limita a los datos verificables del repositorio y del ecosistema LeRobot, e indica explícitamente "no disponible" en todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación robótica basada en flow matching condicionado por gaze (según tag `gaze_flow_matching`); detalles de capas y encoder visual no disponibles |
| Parametros totales | 75.241.434 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones por paso de control) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Tamano del repositorio | 0,3 GB |
| Descargas | 58 |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de políticas de imitación de LeRobot. La etiqueta `gaze_flow_matching` indica que el método de generación de acciones emplea flow matching, un paradigma de modelos generativos que aprende un campo de velocidades que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones expertas. A diferencia de las políticas ACT o diffusion policy clásicas, flow matching suele requerir menos pasos de integración en inferencia, lo que reduce la latencia de control. El condicionamiento por gaze sugiere que las demostraciones incluyen la dirección de mirada del operador como señal auxiliar, lo que puede ayudar al modelo a focalizar la atención en las regiones relevantes de la imagen durante la manipulación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste fino posterior. La model card es una plantilla genérica de LeRobot y no documenta innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El dataset asociado, `Ncubes-to-Nbaskets-320x240`, apunta a una tarea de trasvase de cubos a cestas con resolución de imagen 320x240, pero no se detalla el número de episodios ni la plataforma robótica empleada (aunque los ejemplos de la model card mencionan `so100_follower`, un brazo de bajo coste compatible con LeRobot).

## Capacidades

- Control robótico por imitación: genera secuencias de acciones continuas (posiciones articulares o del efector final) a partir de observaciones visuales y del estado del robot.
- Manipulación visual guiada por gaze: el condicionamiento por mirada del operador puede mejorar la selección de objetos y la precisión en tareas de pick-and-place.
- Ejecución de políticas entrenadas con LeRobot: compatible con el flujo `lerobot-record` para evaluación en robot real.
- Aprendizaje a partir de demostraciones: no requiere recompensas explícitas; se entrena con el dataset de teleoperación asociado.
- Tarea específica: trasvase de cubos a cestas (Ncubes-to-Nbaskets) según el dataset enlazado.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general, audio ni modos de pensamiento. Es un modelo puramente motor y perceptivo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de trasvase de cubos a cestas para la que fue entrenado, integrándose en un brazo SO-100 u otro robot compatible con LeRobot. Es adecuado porque la política está especializada en esa distribución de objetos y resolución de imagen.
- Investigación en flow matching para robótica: sirve como referencia reproducible para comparar políticas de flow matching frente a ACT o diffusion policy en una tarea de manipulación concreta, dado que los pesos y el dataset son públicos.
- Evaluación de condicionamiento por gaze: permite estudiar si la señal de mirada mejora la robustez frente a oclusiones o distracciones visuales en entornos con múltiples objetos.
- Prototipado rápido de pipelines de imitación: con `lerobot-train` y `lerobot-record` se puede reentrenar o evaluar la política en pocas horas en una GPU de consumo, lo que facilita iteraciones de investigación.
- Benchmark de políticas en robótica de bajo coste: al estar pensado para plataformas tipo SO-100, es útil para comparar técnicas de imitación en hardware asequible frente a configuraciones con robots industriales.
- Educación y docencia: el repositorio de 0,3 GB y la licencia Apache 2.0 permiten usarlo en cursos de aprendizaje por imitación sin restricciones de distribución.
- Base para fine-tuning en tareas similares: se puede adaptar a otras tareas de manipulación con objetos pequeños y cámaras de baja resolución, siempre que se disponga de demostraciones teleoperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de finalización de tarea, ni comparaciones con otras políticas. Tampoco se documentan latencias de inferencia ni throughput de control.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,2 millones de parámetros en fp32, los pesos ocupan aproximadamente 0,3 GB; en fp16, unos 0,15 GB. A ello hay que sumar el encoder visual y los buffers de activaciones, por lo que una GPU con 4-8 GB de VRAM es suficiente en la práctica.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para control en tiempo real se recomienda una GPU dedicada, no CPU.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores. También es viable en GPUs integradas con CUDA si la latencia no es crítica.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia depende del número de pasos de integración del flow matching y de la frecuencia de control del robot, que el autor no especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GFM-cubes-22dZ5 (este) | 75,2 M | No aplica | Manipulación cubes-to-baskets con gaze flow matching | Apache 2.0 | Hugging Face, 58 descargas |
| ACT (Action Chunking Transformer, políticas LeRobot) | Variable (típicamente 10-80 M) | No aplica | Imitación robótica general | Apache 2.0 (implementación LeRobot) | Hugging Face / GitHub |
| Diffusion Policy | Variable (típicamente 10-100 M) | No aplica | Imitación robótica con acciones multimodales | MIT / Apache 2.0 según implementación | GitHub / Hugging Face |
| SmolVLA | ~450 M | Contexto visual por paso | Política VLA generalista | Apache 2.0 | Hugging Face |

La comparación es cualitativa: no hay métricas públicas de este modelo que permitan contrastar rendimiento con ACT, Diffusion Policy o SmolVLA. La principal diferencia es el uso de flow matching condicionado por gaze y su especialización en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea concreta (cubos a cestas) y un dataset específico; no generaliza a otras tareas sin reentrenamiento.
- Sesgos de los datos de demostración: al depender de teleoperación humana, hereda los sesgos del operador (trayectorias, velocidades, posiciones preferidas) y puede fallar ante configuraciones de objetos no vistas.
- Riesgo de alucinación motora: en políticas de imitación, el equivalente es la generación de acciones no válidas o inseguras ante observaciones fuera de distribución; se recomienda supervisión humana y límites de par/velocidad en el robot.
- Limitaciones de contexto e idioma: no aplica como modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue en entornos físicos.
- Documentación insuficiente: la model card es una plantilla sin completar; no se especifican hiperparámetros, número de episodios, plataforma robótica exacta ni métricas de éxito, lo que dificulta la reproducibilidad.
- Fecha de creación futura (2026-10-29): el repositorio muestra una fecha posterior a la actual, lo que puede indicar un error de metadatos o una programación de publicación; conviene verificar la integridad de los pesos antes de usarlos.
- Sin garantías de seguridad: no se documentan paradas de emergencia, límites articulares ni protocolos de evaluación en robot real; el despliegue debe hacerse en entornos controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dZ5
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
