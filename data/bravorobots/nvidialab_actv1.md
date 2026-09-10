# BravoRobots/nvidialab_actv1

## Resumen

`BravoRobots/nvidialab_actv1` es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), publicado por el usuario BravoRobots y entrenado con la librería LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice bloques («chunks») cortos de acciones futuras, lo que reduce el error acumulado y suele alcanzar tasas de éxito altas partiendo de datos de teleoperación.

El modelo cuenta con 51.668.614 parámetros, se distribuye en formato safetensors y está etiquetado con la licencia Apache 2.0. Fue entrenado sobre el dataset `BravoRobots/nvidialab_v1` y su `pipeline_tag` es `robotics`, por lo que su ámbito de aplicación es el control de robots manipuladores y no la generación de texto o el procesamiento de lenguaje natural.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de LeRobot: cualquiera puede entrenar una política ACT sobre su propio dataset de demostraciones y publicarla en el Hub con un único comando. No obstante, el repositorio presenta 0 descargas y 0 «likes» en el momento de redactar esta ficha, y no se ha publicado documentación adicional sobre el robot, las tareas o los resultados obtenidos, por lo que debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cuello de botella de autoencoder variacional (VAE), propia de ACT |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv:2304.13705) es un método de aprendizaje por imitación de tipo *behavior cloning* que combina un codificador de observaciones (típicamente una CNN tipo ResNet para las imágenes de cámara y una proyección para el estado del robot) con un transformer encoder-decoder. La innovación principal es la predicción de *chunks* de acciones: el modelo emite una secuencia de `k` acciones futuras de una sola pasada, lo que mitiga el problema del horizonte de predicción y mejora la estabilidad del control. La variante con VAE introduce una variable latente que modela la variabilidad de las demostraciones humanas, útil cuando los datos de teleoperación contienen estilos o trayectorias ligeramente distintas para una misma tarea.

En este caso no se dispone de información sobre el número de tokens o episodios de entrenamiento, la composición exacta del dataset `BravoRobots/nvidialab_v1`, la morfología del robot empleado, el número de cámaras ni si se aplicaron fases de ajuste fino, RLHF o DPO (estos dos últimos no son habituales en ACT). El entrenamiento se realizó con `lerobot-train` y `--policy.type=act`, según el procedimiento documentado en la model card del autor.

## Capacidades

- Generación de comandos de control de bajo nivel para robots manipuladores a partir de observaciones visuales y del estado de las articulaciones.
- Predicción de *chunks* de acciones, lo que permite ejecutar secuencias cortas de movimiento sin recalcular en cada paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensas ni entorno simulado, aunque puede combinarse con ellos).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios mediante `lerobot-train` y `lerobot-record`.
- Compatible con robots tipo SO-100/SO-101 segun los ejemplos de la model card (el ejemplo de evaluación usa `robot.type=so100_follower`).
- No dispone de soporte de *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.
- No se documentan capacidades de visión-lenguaje, audio ni *thinking mode*.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede reproducir tareas de pick-and-place aprendidas de demostraciones humanas sobre un robot de bajo coste tipo SO-100, aprovechando la predicción por *chunks* para suavizar la ejecución.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT frente a otras políticas de LeRobot (Diffusion Policy, SmolVLA) sobre el mismo dataset.
- Automatización de tareas repetitivas en entornos controlados: clasificación, apilado o inserción de piezas donde la variabilidad del entorno es baja y las demostraciones cubren la mayoría de situaciones.
- Prototipado rápido de políticas personalizadas: al entrenarse con `lerobot-train`, un equipo puede adaptar la política a su propio robot y dataset en cuestión de horas con una sola GPU.
- Evaluación de modelos de robótica en simulación o en banco de pruebas: el checkpoint permite medir tasas de éxito por episodio con `lerobot-record` y comparar configuraciones.
- Formación y docencia: como ejemplo didáctico de un *pipeline* completo de teleoperación, entrenamiento y despliegue en robótica de bajo coste.
- Base para *fine-tuning* sobre dominios específicos: dado su tamaño reducido (51,7 M de parámetros), es viable reentrenarlo o ajustarlo en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16; sumando activaciones y buffers de imagen, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El cuello de botella real suele ser la latencia del bucle de control, no la memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria, aunque para control en tiempo real se recomienda una GPU dedicada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con PyTorch; al no ser un modelo de lenguaje no aplican vLLM, TGI ni llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de frecuencia de control ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| BravoRobots/nvidialab_actv1 | 51.668.614 | ACT (imitation learning) | apache-2.0 | Hugging Face, 0 descargas |
| ACT de referencia (lerobot/act) | no disponible | ACT | apache-2.0 | Hugging Face |
| Diffusion Policy | no disponible | Política por difusión | no disponible | Repositorios de investigación |
| SmolVLA | no disponible | VLA (vision-language-action) | no disponible | Hugging Face |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa fiable con estas alternativas. La comparación debe entenderse como cualitativa: ACT es más ligero y sencillo de entrenar que las políticas de difusión, mientras que los modelos VLA incorporan comprensión semántica del lenguaje que ACT no ofrece.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de imitación, hereda los sesgos y la distribución de las demostraciones del dataset `BravoRobots/nvidialab_v1`; generaliza mal fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo de generar acciones erráticas o inseguras cuando la observación se aleja de lo visto en entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; no procesa texto ni admite instrucciones verbales.
- La model card no especifica el robot objetivo, el tipo de tareas, el número de episodios de entrenamiento ni las condiciones de captura; sin esa información, la reproducibilidad es limitada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos reales.
- Con 0 descargas y 0 «likes», no hay evidencia externa de que el modelo funcione correctamente; debe validarse antes de cualquier uso en producción.
- En robótica real, un fallo de política puede provocar daños físicos o a personas; se recomienda ejecutar con límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BravoRobots/nvidialab_actv1
- Dataset de entrenamiento: https://huggingface.co/datasets/BravoRobots/nvidialab_v1
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sobre el bróker OANDA, sin relación con el modelo. No se han encontrado enlaces adicionales relevantes (blogs, demos o repositorios del autor) más allá de los listados anteriormente.
