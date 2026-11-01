# lenawngr/ACT_pick-place_L_nv_cs47_v3

## Resumen

ACT_pick-place_L_nv_cs47_v3 es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario lenawngr en HuggingFace Hub y se ha entrenado y subido con LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica. Está especializado en una tarea concreta de pick-and-place sobre el brazo SO-101, a partir del dataset `lenawngr/pick-place_so101`.

El modelo no es un LLM ni un modelo de propósito general: es un checkpoint de política visuomotora de 51,6 millones de parámetros que mapea observaciones (imágenes de cámara y estado de las articulaciones) a secuencias de acciones de control del robot. Su relevancia es práctica: permite reproducir y desplegar una política de manipulación entrenada con datos de teleoperación en un robot de bajo coste, siguiendo el flujo estándar de LeRobot.

La ficha se basa únicamente en los metadatos del repositorio y en la model card del autor. No hay información publicada sobre composición del dataset, hiperparámetros de entrenamiento ni resultados de evaluación, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.614.342 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que fusiona las observaciones visuales y el estado de las articulaciones, y un decodificador que genera un *chunk* de acciones futuras de una sola pasada. Predecir varios pasos de acción a la vez reduce el error de acumulación típico de las políticas que actúan paso a paso y suaviza el comportamiento del robot.

El entrenamiento se realiza por imitación supervisada sobre episodios de teleoperación. En este caso, el dataset de origen es `lenawngr/pick-place_so101`, asociado al brazo SO-101, y el sufijo del nombre (`L_nv_cs47_v3`) sugiere una variante de configuración y una versión concreta del entrenamiento, aunque el autor no documenta el significado de esas etiquetas. No se dispone de datos sobre número de episodios, número de tokens o pasos de entrenamiento, composición del dataset, ni sobre uso de RLHF o DPO (no aplicables en este paradigma). Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT.

## Capacidades

- Control visuomotor para manipulación robótica: genera secuencias de acciones articulares a partir de observaciones de cámara y del estado del robot.
- Ejecución de la tarea pick-and-place sobre el brazo SO-101, para la que fue entrenado específicamente.
- Predicción de *action chunks*: emite varios pasos de acción por inferencia, lo que mejora la estabilidad del movimiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo *thinking*.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT sobre el mismo dataset y robot, cargándolo con `--policy.path` en `lerobot-record`.
- Despliegue de pick-and-place en un SO-101 de bajo coste: la política ejecuta la tarea aprendida de teleoperación en el brazo físico, adecuada para prototipos de laboratorio y docencia.
- Evaluación comparativa de políticas: al estar entrenada sobre `pick-place_so101`, permite medir tasas de éxito frente a otros checkpoints del mismo autor o de la comunidad con el mismo protocolo de episodios.
- Base para *fine-tuning*: al ser un checkpoint ACT de 51,6 M de parámetros y 0,2 GB, se puede reentrenar con datos propios de otra tarea de manipulación con recursos modestos.
- Docencia y formación en robótica: ejemplo completo del flujo LeRobot (dataset, entrenamiento, evaluación) para enseñar aprendizaje por imitación de extremo a extremo.
- Pruebas de integración de pipelines robóticos: validar cámaras, calibración del SO-101 y latencia de inferencia antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la política cabe holgadamente en cualquier GPU con al menos 4-6 GB libres, incluyendo el codificador visual y los buffers de inferencia.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia. Para entrenamiento se recomienda al menos una RTX 3090/4090 o una A100 si se aumenta el tamaño de lote.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch y dispositivo `cuda` o `cpu`. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control y del hardware; el método ACT está diseñado para inferencia en tiempo real en robots de sobremesa.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_L_nv_cs47_v3 | 51,6 M | Pick-and-place en SO-101 | no aplica | Apache 2.0 | HuggingFace (lenawngr) |
| Otras políticas ACT de LeRobot | variable (decenas de M) | Manipulación según dataset | no aplica | Apache 2.0 en la mayoría | HuggingFace Hub |
| Diffusion Policy | variable (mayor que ACT típicamente) | Manipulación visuomotora | no aplica | según implementación | Repositorios académicos y LeRobot |
| VQ-BeT | variable | Manipulación y acción discreta | no aplica | según implementación | Investigación |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con las alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (pick-and-place) y un único robot (SO-101); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que el rendimiento real es desconocido hasta que se evalúe con `lerobot-record`.
- Dependencia del entorno: el rendimiento depende de la iluminación, la posición de las cámaras, la calibración del robot y la distribución de objetos similar a la del dataset de entrenamiento.
- Riesgo de sobreajuste al dataset: con 25 descargas y sin documentación del dataset, no se puede descartar que la política memorice posiciones concretas de los episodios de teleoperación.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin capacidades de lenguaje: no debe presentarse como un modelo conversacional ni usarse para tareas de texto.
- Sesgos: no documentados; en robótica los sesgos provienen de la distribución del dataset (posiciones, objetos, condiciones de luz), que no se describe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_cs47_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
