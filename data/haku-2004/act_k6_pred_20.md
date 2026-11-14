# Haku-2004/act_k6_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6_pred_20`, es un checkpoint de política ACT entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicado por el usuario Haku-2004.

El modelo tiene 51.672.714 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. No es un modelo de lenguaje: su salida son acciones de robot (posiciones articulares o comandos de efector final), y su pipeline en Hugging Face es `robotics`.

Su relevancia es práctica: proporciona un punto de partida reproducible para tareas de manipulación teleoperada con el robot SO-100/SO-101 del ecosistema LeRobot, con licencia Apache 2.0 y flujo de entrenamiento y evaluación documentado mediante los comandos `lerobot-train` y `lerobot-record`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones con chunking |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un encoder de observaciones (imágenes de cámaras y estado de las articulaciones) con un decoder que genera chunks de acciones de longitud fija, en lugar de predecir una única acción por paso. Esta formulación, descrita en el paper arXiv:2304.13705, reduce el horizonte efectivo de predicción y mitiga el problema de acumulación de errores típico de las políticas paso a paso. El modelo emplea además una técnica de ensamblado temporal (temporal ensembling) durante la inferencia para suavizar las predicciones entre chunks solapados.

En cuanto al entrenamiento, el checkpoint se ha generado con LeRobot mediante aprendizaje por imitación supervisada sobre el dataset `Haku-2004/k6_4seg`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de RLHF o DPO (no aplicable en este paradigma). Tampoco se documentan innovaciones adicionales más allá de las propias del método ACT original.

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores teleoperados.
- Aprendizaje por imitación a partir de demostraciones (no requiere recompensa explícita).
- Procesamiento de observaciones multimodales: imágenes de cámaras y estado de articulaciones.
- Control de robots del ecosistema LeRobot, incluido el SO-100 follower mencionado en la model card.
- Inferencia en tiempo real mediante `lerobot-record` con integración directa en el bucle de control.
- Entrenamiento reproducible desde cero con `lerobot-train` sobre datasets propios.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que permiten ejecutar tareas de pick-and-place con trayectorias suaves, aprovechando el ensamblado temporal para reducir vibraciones en el efector final.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o estrategias de aumento de datos, dado su tamaño reducido y su licencia permisiva.
- Prototipado rápido con SO-100: al integrarse con `lerobot-record` y el robot `so100_follower`, permite validar una política en pocas horas desde la teleoperación hasta la evaluación autónoma.
- Evaluación de datasets de teleoperación: el checkpoint puede usarse para medir la calidad de `Haku-2004/k6_4seg` mediante tasas de éxito en episodios de evaluación, ayudando a decidir si conviene recopilar más demostraciones.
- Despliegue en hardware de borde: con 51,7 M de parámetros y 0,2 GB de pesos, es viable ejecutar la inferencia en una GPU de consumo o incluso en CPU para tareas de baja frecuencia de control.
- Educación y formación en robótica: permite a estudiantes entrenar y desplegar una política ACT completa con comandos de línea de comandos, sin necesidad de infraestructura de gran escala.
- Automatización de tareas repetitivas en laboratorio: tareas de recogida y colocación de objetos en entornos controlados donde se dispone de demostraciones teleoperadas previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en FP32 ocupan aproximadamente 207 MB); con overhead de activaciones y buffers de imagen, un presupuesto de 1-2 GB es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento, se recomienda una RTX 3090/4090 o una A100 si se procesan datasets grandes con aumento de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a TorchScript/ONNX no documentada en la información disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen de la frecuencia de control del robot y del número de cámaras de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6_pred_20 (ACT) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (Chi et al.) | no disponible | no aplica | no disponible | MIT (implementación de referencia) | Repositorios de investigación |
| VQ-BeT | no disponible | no aplica | no disponible | MIT (implementación de referencia) | Repositorios de investigación |
| SmolVLA (Hugging Face) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el dataset `Haku-2004/k6_4seg`; su generalización a otras tareas, objetos o entornos no está garantizada y probablemente sea nula fuera de la distribución de entrenamiento.
- No se documentan sesgos específicos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones teleoperadas, incluidos sesgos de posición, velocidad y preferencias del operador.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: el modelo puede generar trayectorias que parecen válidas pero fallan en el contacto físico con objetos.
- Sin soporte de lenguaje natural ni contexto textual; no es adecuado para tareas de razonamiento, código o conversación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad del modelo en producción.
- No se han publicado métricas de tasa de éxito, número de episodios de entrenamiento ni detalles del dataset, lo que dificulta evaluar su calidad antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- Para producción, es imprescindible validar la política en el robot objetivo con episodios de evaluación y establecer límites de seguridad (paradas de emergencia, límites de par y velocidad).

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6_pred_20
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
