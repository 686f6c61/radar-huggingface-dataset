# Haku-2004/act_k6s45e_c50_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6s45e_c50_base_20`, es un checkpoint entrenado con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente compuesto por demostraciones de teleoperación.

El modelo tiene 51.617.414 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en hardware modesto. Está pensado para ejecutar políticas de control en robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`) y se integra en el ecosistema LeRobot de Hugging Face.

Su relevancia es práctica: permite reproducir el pipeline completo de entrenamiento y evaluación de una política de imitación con dos comandos (`lerobot-train` y `lerobot-record`), sin necesidad de infraestructura propietaria. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento real depende enteramente de la calidad y cobertura del dataset de entrenamiento, que no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación basada en transformer que combina un codificador de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un decodificador que genera chunks de acciones de longitud fija. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir varios pasos de acción de forma conjunta mediante una formulación de regresión por chunks, lo que mitiga el error compuesto típico de las políticas que predicen un único paso y reduce el ruido temporal.

El entrenamiento se realiza con LeRobot a partir de un dataset de teleoperación (`Haku-2004/k6_20_20261113_173939`). No se dispone de información sobre el número de episodios, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni si se aplicaron técnicas de aumento de datos. Tampoco hay datos sobre el número de tokens o pasos de entrenamiento, la función de pérdida exacta empleada en este checkpoint ni si hubo ajuste fino posterior.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, condicionada al dataset de entrenamiento.
- Ejecución de políticas en robots del ecosistema LeRobot, con ejemplo explícito para `so100_follower`.
- Integración con el flujo de entrenamiento y evaluación de LeRobot (`lerobot-train`, `lerobot-record`).
- No soporta generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso en el sentido de LLM; la "planificación" se limita al horizonte del chunk de acciones.
- Capacidades multilingües: no aplicables.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del uso de imágenes como observación.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar secuencias de agarre y colocación aprendidas del dataset de teleoperación, adecuado porque ACT está diseñado precisamente para tareas de manipulación con demostraciones.
- Control de un robot SO-100 de bajo coste: el ejemplo de la model card usa `so100_follower`, por lo que es directamente desplegable en esa plataforma con `lerobot-record`.
- Investigación en aprendizaje por imitación: sirve como checkpoint base para comparar variantes de ACT, cambios en el dataset o hiperparámetros, dado su tamaño reducido (51,6 M de parámetros).
- Prototipado rápido de políticas robóticas: al ocupar 0,2 GB, se puede cargar y evaluar en una estación de trabajo con una sola GPU consumer, acelerando iteraciones.
- Reproducción de experimentos: el pipeline de LeRobot permite reentrenar desde cero con el mismo dataset y comparar curvas de éxito frente a este checkpoint.
- Docencia y formación: útil para demostrar el ciclo completo de teleoperación, entrenamiento y evaluación de una política de imitación sin infraestructura costosa.
- Automatización de tareas repetitivas de mesa: si el dataset cubre una tarea acotada y repetible, el modelo puede ejecutarla de forma autónoma dentro del entorno entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, números de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros; en la práctica, el consumo depende del codificador visual y del tamaño de las imágenes de entrada, no disponible.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4090 o A100 pueden ejecutar la inferencia sin problema.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot, la resolución de cámara y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6s45e_c50_base_20 (este) | 51,6 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no disponible | tasas de éxito reportadas en el paper, no comparables directamente | no disponible | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos suficientes para una comparación cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- El rendimiento está acotado al dataset `k6_20_20261113_173939`; fuera de la distribución de demostraciones, la política probablemente fallará.
- No hay información sobre sesgos, pero al ser un modelo de control robótico, los sesgos se manifiestan como comportamientos inseguros o erráticos ante situaciones no vistas.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de acciones incorrectas o inseguras en el robot.
- Sin datos sobre el número de episodios ni la variabilidad del dataset, no se puede estimar la robustez ni la generalización.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No se documentan requisitos de seguridad física para el robot; deben establecerse límites de par, velocidad y espacio de trabajo de forma externa.
- No hay información sobre idiomas ni sobre el formato exacto de las observaciones esperadas más allá de lo que infiere LeRobot.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6s45e_c50_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
