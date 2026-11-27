# Haku-2004/act_is120e_c50_input_20

## Resumen

`act_is120e_c50_input_20` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario Haku-2004 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción individual por paso, predice fragmentos cortos de acciones (action chunks), lo que reduce el error de composición acumulado y suele elevar la tasa de éxito en tareas de manipulación. El modelo está pensado para controlar robots tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`) a partir de demostraciones teleoperadas.

El checkpoint tiene 51.619.974 parámetros (dato real de los safetensors) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la franja de políticas ligeras que se pueden ejecutar en tiempo real en una GPU de consumo. Se distribuye en formato safetensors y con licencia Apache 2.0, lo que facilita su reutilización y modificación. El nombre del modelo sugiere una configuración concreta de entrenamiento (is120e, c50, input_20), probablemente episodios, chunk size y horizonte de entrada, aunque el autor no documenta estos parámetros.

La relevancia actual es doble: por un lado, ACT es una referencia consolidada en el estado del arte de imitación robótica de bajo coste (paper arXiv 2304.13705); por otro, el ecosistema LeRobot estandariza el entrenamiento, la evaluación y el despliegue de estas políticas, lo que permite reproducir el pipeline completo con pocos comandos. No obstante, la información publicada por el autor es mínima y no incluye detalles del dataset, resultados de evaluación ni especificaciones del robot objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual y decodificador de acciones (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.619.974 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; opera sobre observaciones y chunks de acciones, no sobre texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/i_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación compuesta por un backbone visual (codificador de imágenes, típicamente ResNet) y un transformer encoder-decoder que fusiona las observaciones visuales con el estado de las articulaciones y genera un chunk de acciones futuras de una sola pasada. La innovación principal del método es precisamente esa predicción por chunks: en lugar de emitir una acción por paso de control, el modelo predice una secuencia corta y la ejecuta de forma abierta, lo que mitiga el problema de la varianza en las predicciones paso a paso y mejora la estabilidad del control. Además, ACT incorpora una técnica de agregación temporal (temporal ensembling) que combina predicciones solapadas de chunks consecutivos para suavizar la trayectoria.

El entrenamiento se realiza por imitación supervisada sobre demostraciones teleoperadas, sin refuerzo ni RLHF. En este caso concreto, el autor indica que el modelo se entrenó con el dataset `Haku-2004/i_4seg` y lo subió a Hugging Face mediante LeRobot, pero no detalla el número de episodios, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni si se aplicaron aumentos de datos. El nombre del checkpoint (`is120e_c50_input_20`) sugiere 120 episodios, un chunk size de 50 y una ventana de entrada de 20, pero son inferencias no confirmadas por la documentación.

## Capacidades

- Control robótico por imitación: genera comandos de articulaciones a partir de observaciones visuales y del estado del robot.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales, lo que estabiliza la ejecución.
- Aprendizaje a partir de demostraciones teleoperadas: no requiere definición manual de recompensas ni ingeniería de control clásica.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100: la model card muestra un ejemplo de evaluación con `so100_follower`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos con robots de bajo coste: el modelo aprende a recoger, mover y colocar objetos a partir de demostraciones teleoperadas, lo que permite desplegar tareas de pick-and-place en brazos SO-100 sin programación explícita de trayectorias.
- Evaluación de políticas de imitación en laboratorio: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (número de episodios, chunk size, horizonte de observación) dentro de un mismo dataset.
- Prototipado rápido de tareas nuevas: con LeRobot, se puede reentrenar la política sobre un dataset propio y validar el éxito de la tarea con `lerobot-record` en pocas horas, gracias al reducido tamaño del modelo (51,6 M de parámetros).
- Investigación en aprendizaje por imitación: permite reproducir experimentos de ACT y estudiar el efecto del chunking y del ensamblado temporal en la estabilidad del control.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede ejecutar secuencias de manipulación en celdas de trabajo con iluminación y posiciones de objeto relativamente estables.
- Educación y formación en robótica: su licencia Apache 2.0 y su tamaño contenido lo hacen adecuado para cursos y talleres donde se enseña el pipeline completo de imitación, desde la teleoperación hasta el despliegue.
- Integración en pipelines de evaluación automatizada: al ser un checkpoint safetensors estándar, se puede cargar desde scripts de Python y ejecutar en bucles de evaluación con métricas de éxito por episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas, y el autor no documenta el número de episodios de evaluación ni las condiciones del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 51,6 M de parámetros; en la práctica, el consumo vendrá dominado por el codificador visual y el buffer de imágenes, por lo que se recomienda al menos 2-4 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100. Para control en tiempo real, una RTX 3060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), scripts de Python con PyTorch y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia dependerá de la frecuencia de control del robot, la resolución de las cámaras y el hardware; con 51,6 M de parámetros, la inferencia por chunk debería ser del orden de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_is120e_c50_input_20 (este modelo) | 51,6 M | no disponible | ACT, imitación con chunks | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no disponible | ACT, imitación con chunks | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible | no disponible | Políticas de difusión para imitación | no disponible | Repositorios públicos |
| VQ-BeT | no disponible | no disponible | Tokenización vectorial de comportamientos | no disponible | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta el dataset, el robot objetivo, la frecuencia de control, la resolución de las cámaras ni los resultados de evaluación, lo que dificulta valorar su calidad real.
- Sesgos de los datos de demostración: al entrenarse con teleoperación de un operador concreto, la política puede heredar sesgos de estilo, velocidad y trayectorias que no generalicen a otros operadores o entornos.
- Riesgo de sobreajuste al entorno: sin datos de evaluación, no se puede descartar que el modelo funcione solo en condiciones muy similares a las del dataset (iluminación, posición de objetos, fondo).
- Alucinación en sentido robótico: puede generar acciones plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento, con riesgo de colisiones o fallos de agarre.
- Limitaciones de idioma y contexto: no aplica, al no ser un modelo lingüístico; no soporta instrucciones en lenguaje natural ni razonamiento textual.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset `Haku-2004/i_4seg` antes de reutilizarlo.
- Caveat para producción: no se recomienda desplegar en entornos reales sin una validación exhaustiva en el robot objetivo y sin mecanismos de parada de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_is120e_c50_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
