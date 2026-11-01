# ketiholo/demo4_chunk_size100

## Resumen

El modelo `ketiholo/demo4_chunk_size100` es una política de imitación robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario ketiholo y entrenada con el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones (imágenes de cámara y estado del robot), predice fragmentos cortos de acciones ("action chunks") en lugar de comandos paso a paso, lo que reduce el error de composición acumulado típico del aprendizaje por imitación.

El modelo tiene 51.670.663 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y está asociado al dataset de demostraciones `ketiholo/demo4`, con el sufijo `chunk_size100` que sugiere un horizonte de predicción de 100 pasos por chunk. Se distribuye bajo licencia Apache 2.0 y la etiqueta de pipeline es `robotics`.

Su relevancia es acotada: se trata de un checkpoint experimental de un único usuario, con 40 descargas y sin likes, orientado a reproducir una tarea concreta de manipulación sobre un robot tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`). No debe confundirse con un modelo fundacional de robótica de propósito general; es una política entrenada para un entorno y una tarea específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; el horizonte de acción es de 100 pasos por chunk segun el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer que procesa las observaciones (típicamente imágenes de una o varias cámaras más el estado de las articulaciones) con un decodificador que genera un chunk de acciones de longitud fija. La predicción por chunks mitiga el sesgo de composición de los métodos de cloning behavior paso a paso y suaviza las transiciones. El nombre del checkpoint (`chunk_size100`) indica que el horizonte configurado es de 100 pasos de acción por inferencia.

El entrenamiento se realizó con LeRobot sobre el dataset `ketiholo/demo4`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron aumentos de datos. Tampoco hay datos sobre el número de tokens o pasos de entrenamiento, la función de pérdida concreta (ACT usa habitualmente pérdida L1 sobre las acciones más una pérdida auxiliar de reconstrucción VAE) ni sobre ajuste fino con RLHF/DPO, que no aplica en este paradigma.

## Capacidades

- Predicción de acciones robóticas en forma de chunks de 100 pasos a partir de observaciones visuales y propioceptivas.
- Control visuomotor para manipulación de objetos en entornos de laboratorio o escritorio.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Integración nativa con el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- Ejecución sobre robots de bajo coste tipo SO-100 (`so100_follower` en los ejemplos de la model card).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de una tarea de manipulación concreta: cargar el checkpoint con `--policy.path` en `lerobot-record` y ejecutar la política sobre el robot SO-100 para replicar la tarea demostrada en `ketiholo/demo4`. Es adecuado porque el modelo fue entrenado exactamente sobre ese dataset.
- Evaluación de políticas de imitación en investigación: sirve como referencia para comparar el efecto del tamaño de chunk (100 frente a horizontes menores) en la tasa de éxito de una tarea.
- Prototipado rápido de pipelines de robot learning: al estar integrado en LeRobot, permite montar un ciclo completo de entrenamiento, evaluación y despliegue en pocas horas con hardware de bajo coste.
- Docencia y formación: útil para ilustrar el flujo de ACT con un ejemplo reproducible y de tamaño reducido (0,2 GB), sin necesidad de GPUs de gran capacidad.
- Benchmark interno de infraestructura: con 51,7 M de parámetros, es un candidato ligero para medir latencia de inferencia en un robot real o en simulación antes de escalar a políticas mayores.
- Base para fine-tuning en una tarea nueva: partir de estos pesos y reentrenar con un dataset propio del mismo robot y dominio, aprovechando que la licencia Apache 2.0 permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica el cuello de botella es el codificador visual y el tamaño de las imágenes de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura. Para entrenamiento se recomienda una RTX 3090/4090 o una A100 si se aumenta el tamaño de batch.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para inferencia.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de la resolución de cámara y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_chunk_size100 (ACT) | 51,7 M | Imitación con chunks de acción | 100 pasos por chunk | Apache 2.0 | Hugging Face, 40 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | Imitación con chunks de acción | configurable | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | Imitación generativa con difusión | configurable | no disponible | Repositorios de investigación |
| RT-1 / RT-2 (modelos fundacionales de robótica) | cientos de M a miles de M | Transformers visión-lenguaje-acción | no disponible | no disponible | Principalmente investigación |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado métricas de éxito, latencia ni comparaciones directas para este checkpoint.

## Limitaciones y advertencias

- Es una política específica de tarea y robot: no generaliza a entornos, objetos o morfologías distintas de las del dataset `ketiholo/demo4`.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de cámara y configuración física exactas de la grabación.
- No hay información sobre sesgos demográficos ni de otro tipo, pero al ser un modelo visuomotor puede heredar sesgos de las demostraciones (por ejemplo, posiciones iniciales o trayectorias particulares).
- No es un modelo de lenguaje: no genera texto ni admite instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; es un checkpoint experimental con 40 descargas y sin validación externa.
- No se documentan métricas de tasa de éxito ni protocolos de evaluación reproducibles, por lo que su rendimiento real en producción es incierto.
- La fecha de creación indicada (2026-10-29) es futura respecto a la información habitual de repositorios; conviene verificar la integridad y procedencia del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo4_chunk_size100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo4
