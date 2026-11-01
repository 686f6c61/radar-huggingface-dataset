# fecasado/giava-kitchen-tomato-multi

## Resumen

Giava Kitchen Tomato Multi es una política robótica entrenada mediante aprendizaje por imitación y publicada en Hugging Face por el usuario fecasado. El modelo se distribuye con la librería LeRobot y el pipeline `robotics`, y su nombre interno (`gaze_flow_matching`) indica que emplea una variante de flow matching condicionada por la mirada (gaze) para generar acciones motrices. Resuelve el problema de control de un brazo robótico en una tarea concreta de manipulación en cocina: trasladar un tomate a un plato, según el dataset de entrenamiento `fecasado/tomato-to-plate-320x240`.

El checkpoint contiene 235.899.950 parámetros en formato safetensors y ocupa 0,9 GB en el repositorio. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que mapea observaciones (imágenes de 320x240 y estado del robot) a comandos de actuación. Su relevancia es acotada pero práctica para quien trabaja con LeRobot y SO-100/SO-101, ya que sirve como ejemplo reproducible de entrenamiento de políticas de imitación con flow matching y de despliegue en un robot de bajo coste.

La información pública es escasa: la model card es prácticamente la plantilla por defecto de LeRobot y no documenta arquitectura detallada, datos de entrenamiento ni resultados de evaluación. Todo lo que sigue se limita a lo verificable en los metadatos y en el README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación; nombre interno `gaze_flow_matching`, probable flow matching condicionado por gaze) |
| Parametros totales | 235.899.950 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo robótico, no lingüístico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

No se dispone de documentación arquitectónica más allá del nombre del modelo (`gaze_flow_matching`) y de la etiqueta `gaze_flow_matching` en los tags. Por el nombre cabe inferir una política de flow matching —modelo generativo de acciones por integración de un campo de velocidades— con condicionamiento por información de mirada, pero el autor no detalla la composición exacta de la red, el número de capas ni el diseño del encoder visual. El tamaño de 235,9 M de parámetros es coherente con una política de imitación con backbone visual y cabeza de acción, no con un transformer lingüístico.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/tomato-to-plate-320x240`, que fija la resolución de las observaciones visuales en 320x240. No se especifican el número de episodios, el número de tokens o frames, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste posterior. La model card indica que el modelo fue entrenado y subido al Hub mediante LeRobot y remite a la guía de entrenamiento de imitación de la documentación oficial.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones a partir de observaciones visuales y del estado del robot para ejecutar la tarea de trasladar un tomate a un plato.
- Política condicionada por mirada: el nombre `gaze_flow_matching` sugiere el uso de señal de gaze como entrada adicional de condicionamiento, aunque el autor no lo documenta explícitamente.
- Integración con LeRobot: compatible con el flujo `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Despliegue en robots de bajo coste: el ejemplo de la model card emplea `so100_follower`, lo que indica compatibilidad con la familia SO-100/SO-101.
- Generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes y capacidades multilingües: no disponibles; el modelo no es lingüístico.

## Casos de uso

- Manipulación pick-and-place en cocina: el modelo ejecuta la secuencia de coger un tomate y depositarlo en un plato, replicando las demostraciones del dataset de entrenamiento. Es adecuado para prototipos de robot de mesa con cámara cenital o frontal a 320x240.
- Base para fine-tuning con nuevos datasets: al estar en formato LeRobot y licencia Apache 2.0, sirve como punto de partida para reentrenar con `lerobot-train` sobre otras tareas de manipulación y comparar curvas de aprendizaje.
- Evaluación reproducible de políticas de imitación: con `lerobot-record` y `--episodes=10` se puede medir la tasa de éxito en el robot real y comparar contra políticas ACT u otras variantes.
- Docencia y laboratorio: ejemplo completo y ligero (0,9 GB) para enseñar el ciclo demostración-entrenamiento-despliegue en robótica de imitación sin requerir hardware de gama alta.
- Investigación en condicionamiento por gaze: si se confirma el uso de señal de mirada, permite estudiar cómo la atención humana en las demostraciones mejora la generalización de la política.
- Integración en pipelines de robótica doméstica: como componente de una pila mayor donde un planificador de alto nivel selecciona la política adecuada para cada subtarea de cocina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 235,9 M de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 0,94 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o RTX 4090 funcionan sin problema. El ejemplo de la model card usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales con soporte CUDA.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor. No se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| giava-kitchen-tomato-multi | 235,9 M | Manipulación tomate-plato (LeRobot) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | Imitación visual-motora genérica | Apache 2.0 | Hugging Face / GitHub |
| Políticas Diffusion Policy | no disponible | Imitación visual-motora genérica | MIT (repo original) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (tomate a plato) y un único montaje; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Documentación insuficiente: la model card es la plantilla por defecto de LeRobot y no describe arquitectura, datos, hiperparámetros ni evaluación, lo que dificulta la reproducibilidad.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de la tasa de éxito ni de la robustez ante variaciones de iluminación o posición.
- Dependencia del dataset y del robot: los resultados dependen de la cámara, la resolución 320x240 y la morfología del SO-100; cambios de hardware pueden degradar el comportamiento.
- Riesgo de sobreajuste a las demostraciones: con un único dataset y sin datos de validación publicados, es probable que la política memorice trayectorias y falle ante perturbaciones.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Sesgos: no aplica en el sentido lingüístico; el sesgo relevante es el de las demostraciones humanas recogidas en el dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-tomato-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
