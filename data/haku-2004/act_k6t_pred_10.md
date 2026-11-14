# Haku-2004/act_k6t_pred_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este checkpoint concreto, `Haku-2004/act_k6t_pred_10`, ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `Haku-2004/k6_4seg`. El modelo resuelve el problema de control robótico a partir de demostraciones teleoperadas, reduciendo el error de composición que aparece cuando se encadenan predicciones paso a paso.

El modelo tiene 51.672.714 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, lo que refleja un tamaño compacto orientado a inferencia en tiempo real sobre hardware modesto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

Es relevante porque ejemplifica el flujo estándar de LeRobot para políticas robóticas: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue sobre brazos como el SO-100. No se dispone de información sobre idiomas, benchmarks publicados ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que recibe observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y genera un chunk de acciones futuras de longitud fija. La innovación principal del método, descrita en el paper arXiv:2304.13705, es predecir varios pasos de acción de forma conjunta, lo que mitiga el error acumulado del control paso a paso y permite políticas más estables con menos datos. El modelo incorpora habitualmente un mecanismo de agregación temporal (temporal ensembling) durante la inferencia para suavizar las predicciones entre chunks consecutivos.

Este checkpoint concreto ha sido entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, presumiblemente grabaciones teleoperadas de una tarea concreta. No se dispone de información sobre el número de episodios, la composición del dataset, el número de tokens de entrenamiento (concepto no aplicable directamente aquí) ni si se aplicaron técnicas de RLHF o DPO, que no forman parte del pipeline estándar de ACT. Tampoco se detalla la configuración exacta de cámaras, frecuencia de control ni dimensión del espacio de acciones.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y propioceptivas.
- Predicción de secuencias de acción de longitud fija, con agregación temporal para suavizar la transición entre chunks.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con comandos estándar.
- Compatible con robots tipo SO-100/SO-101 mediante `lerobot-record` y `--robot.type=so100_follower`.
- Ejecución de políticas entrenadas sobre un dataset específico de una tarea concreta (no es un modelo generalista).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de una tarea concreta: el modelo reproduce la tarea aprendida del dataset `k6_4seg` sobre un brazo SO-100, adecuado para prototipos de laboratorio y demostraciones reproducibles.
- Investigación en aprendizaje por imitación: sirve como línea base para comparar variantes de ACT, cambios en la longitud del chunk o estrategias de ensembling temporal.
- Evaluación de pipelines LeRobot: útil para validar el flujo completo de entrenamiento e inferencia con `lerobot-train` y `lerobot-record` antes de escalar a datasets mayores.
- Docencia y formación: ejemplo compacto (51,7 M de parámetros, 0,2 GB) para explicar cómo se entrena y despliega una política robótica de extremo a extremo.
- Prototipado rápido en hardware de consumo: su tamaño reducido permite inferencia en GPU de gama media o incluso CPU para pruebas no críticas.
- Reentrenamiento con nuevos datos: punto de partida para fine-tuning sobre tareas similares dentro del mismo robot y configuración de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño del checkpoint (51,7 M de parámetros, ~0,2 GB en safetensors); el consumo real depende de los buffers de imagen y del tamaño del batch.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o A100 funcionan sin problema, aunque el modelo no aprovecha el exceso de cómputo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para evaluación no crítica.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) es la vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6t_pred_10 (este) | 51,7 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no disponible | resultados en el paper, no comparables directamente | MIT (código de referencia) | Repositorio de los autores |
| Diffusion Policy | no disponible | no disponible | método alternativo de imitación, sin datos comparativos aquí | no disponible | Implementaciones en LeRobot |
| VQ-BeT | no disponible | no disponible | método alternativo de imitación, sin datos comparativos aquí | no disponible | Implementaciones en LeRobot |

No se dispone de datos de rendimiento comparables para este checkpoint concreto; la comparación se limita a categoría de método y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito en la información disponible.
- Dataset de entrenamiento no documentado en detalle: se desconoce el número de episodios, la variabilidad de condiciones y la cobertura de casos límite.
- Riesgo de sobreajuste a las condiciones de captura (iluminación, posiciones iniciales, fondo), típico en aprendizaje por imitación con datasets pequeños.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Sin información sobre sesgos: no aplica el concepto habitual de sesgo lingüístico, pero sí puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, trayectorias subóptimas del operador).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6t_pred_10
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset asociado: https://huggingface.co/datasets/Haku-2004/k6_4seg
