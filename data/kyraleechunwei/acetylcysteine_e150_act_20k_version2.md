# KyraLeeChunWei/Acetylcysteine_e150_ACT_20K_version2

## Resumen

Acetylcysteine_e150_ACT_20K_version2 es una política de robótica entrenada con el algoritmo ACT (Action Chunking with Transformers) mediante la librería LeRobot de Hugging Face. El modelo ha sido publicado por el usuario KyraLeeChunWei y está diseñado para control robótico por imitación: aprende de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación.

El checkpoint contiene 51.678.855 parámetros en formato safetensors, ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0. Está asociado al dataset `KyraLeeChunWei/e150_Acetylcysteine`, presumiblemente una colección de episodios de teleoperación de un robot tipo SO-100 (el ejemplo de la model card usa `so100_follower`). El identificador "20K" sugiere 20.000 pasos de entrenamiento y "e150" podría referirse a un identificador de experimento o de robot.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un artefacto de investigación reproducible para una tarea concreta de manipulación robótica. Resulta útil para quienes trabajan con LeRobot y quieren evaluar o reutilizar una política ACT ya entrenada, o como referencia de pipeline de entrenamiento e inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | KyraLeeChunWei/e150_Acetylcysteine |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un codificador de imágenes (típicamente ResNet) que procesa las observaciones visuales, un codificador de estado proprioceptivo y un transformer que genera secuencias de acciones en forma de chunks. La predicción por chunks permite al modelo comprometerse con una secuencia de movimientos coherente, lo que mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso.

El entrenamiento se realizó con LeRobot sobre el dataset `KyraLeeChunWei/e150_Acetylcysteine`, que contiene episodios de teleoperación. No se dispone de información sobre el número de episodios, la composición exacta de las observaciones (cámaras, resolución, frecuencia de control) ni sobre si se aplicaron técnicas adicionales como aumento de datos o regularización temporal. El nombre del checkpoint ("20K") sugiere 20.000 pasos de optimización, pero este dato no está confirmado en la información disponible.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado del robot.
- Predicción de action chunks: emite bloques de acciones de longitud fija, lo que estabiliza la ejecución frente a errores acumulados.
- Manipulación de un solo brazo: el ejemplo de la model card usa el robot `so100_follower`, un brazo de bajo coste.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo de texto, visión general ni audio.

## Casos de uso

- Replicación de experimentos de imitación: cargar la política con `--policy.path` en `lerobot-record` para reproducir la tarea entrenada y comparar tasas de éxito con otras configuraciones de ACT.
- Base para fine-tuning en tareas similares: reutilizar los pesos como inicialización y reentrenar con un dataset propio de teleoperación del mismo robot, reduciendo el tiempo de convergencia.
- Evaluación de pipelines de LeRobot: usar el checkpoint como referencia para validar la instalación, la configuración de hardware y el flujo de grabación de episodios de evaluación.
- Manipulación de objetos en laboratorio: ejecutar tareas de pick-and-place o apilado sobre el robot SO-100 para las que fue entrenado, con la ventaja de la predicción por chunks en movimientos de precisión.
- Docencia e investigación en robótica: servir como ejemplo reproducible de política ACT entrenada, útil en cursos y talleres sobre aprendizaje por imitación.
- Benchmark interno de hardware de bajo coste: medir latencia de inferencia y tasa de éxito en GPUs de consumo para dimensionar despliegues con brazos SO-100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros (unos 0,2 GB de pesos), más el coste del codificador visual y de los buffers de inferencia; en la práctica, menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el cuello de botella real será la latencia de las cámaras y del bus del robot.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplica).
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la resolución de las cámaras, del tamaño del chunk y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acetylcysteine_e150_ACT_20K_version2 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (referencia del paper) | ~80 M (configuración típica, no confirmado) | no disponible | tasas de éxito publicadas en el paper | MIT (código de referencia) | GitHub, pesos no publicados oficialmente |
| Diffusion Policy | variable, típicamente decenas de millones | no disponible | comparativas publicadas frente a ACT en el paper original | MIT | repositorios de investigación |
| Políticas VLA tipo OpenVLA | ~7 B | varios miles de tokens | benchmarks publicados en su paper | distinta según versión | Hugging Face |

La comparación cuantitativa no está disponible para este checkpoint concreto, ya que no se han publicado métricas. Las alternativas citadas son referencias de la literatura, no evaluaciones directas contra este modelo.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones independientes, por lo que su rendimiento real es desconocido.
- Dependencia del dataset: el comportamiento está limitado por la distribución del dataset `e150_Acetylcysteine`; fuera de ella, el riesgo de fallo es alto.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de texto, visión general ni agente conversacional.
- Riesgo de sobreajuste: con 51,7 M de parámetros y un único dataset, es probable que la política memorice trayectorias; conviene validar en condiciones ligeramente distintas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar la procedencia de los datos de teleoperación si se reutiliza en producción.
- Advertencia de seguridad física: cualquier despliegue en un robot real debe incluir límites de par, paradas de emergencia y validación en entorno simulado antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Acetylcysteine_e150_ACT_20K_version2
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/e150_Acetylcysteine
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
