# nuntasha/act_omx_left_red

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `nuntasha/act_omx_left_red`, es una política ACT entrenada con LeRobot sobre el dataset `nuntasha/omx_left_red`, presumiblemente capturado mediante teleoperación. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras desplegables en hardware modesto.

La relevancia de ACT radica en su formulación: al predecir chunks de acciones, el modelo reduce el error de acumulación típico de las políticas paso a paso y mitiga el problema de la varianza en la predicción de acciones individuales, lo que se traduce en tasas de éxito más altas en tareas de manipulación. Este checkpoint particular está orientado a un robot OMX (brazo izquierdo, variante "red" según la nomenclatura del autor), aunque la model card no detalla la morfología exacta ni el entorno de entrenamiento.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está empaquetado en formato safetensors dentro del ecosistema LeRobot. No obstante, la información pública disponible es muy limitada: no se documentan benchmarks, composición del dataset ni detalles del entrenamiento más allá de la referencia al paper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (típicamente ResNet) para procesar las observaciones de cámara con un transformer encoder-decoder que genera chunks de acciones. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir secuencias de acciones de longitud fija en lugar de una sola acción por paso, lo que estabiliza el entrenamiento y mejora la consistencia temporal. El modelo emplea además una técnica de "temporal ensembling" durante la inferencia para suavizar las predicciones entre chunks solapados.

En cuanto al entrenamiento, este checkpoint se ha generado con LeRobot a partir del dataset `nuntasha/omx_left_red`, pero la model card no especifica el número de episodios de teleoperación, la composición de las observaciones (número y tipo de cámaras), la frecuencia de control ni si se aplicaron aumentos de datos. Tampoco se documenta si hubo ajuste fino posterior ni qué hiperparámetros se usaron (tamaño de chunk, dimensión latente, etc.). Toda esta información se considera no disponible.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación, orientado a tareas de imitación aprendidas de demostraciones teleoperadas.
- Procesamiento de observaciones visuales (imágenes de cámara) y estado proprioceptivo del robot, según la configuración estándar de ACT en LeRobot.
- Ejecución de políticas de imitación en tiempo real mediante `lerobot-record` y el pipeline de evaluación de LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots tipo SO-100/SO-101 y similares.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política motora, no un modelo de lenguaje.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones, adecuado porque ACT está diseñado específicamente para imitación de habilidades motoras finas con chunks de acción que reducen la varianza.
- Automatización de tareas repetitivas en línea de montaje: al ser una política ligera (51,7 M de parámetros), puede ejecutarse en un PC con GPU consumer junto al robot, sin necesidad de infraestructura cloud.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, ya que el pipeline de LeRobot permite reentrenar y evaluar con comandos estandarizados.
- Prototipado rápido de políticas con datasets propios: el flujo `lerobot-train` con `--policy.type=act` permite adaptar la arquitectura a nuevos datasets de teleoperación en horas, no semanas.
- Evaluación de robustez visual: al procesar observaciones de cámara, permite estudiar cómo afectan cambios de iluminación o posición de objetos a la tasa de éxito, útil para validar pipelines de aumento de datos.
- Despliegue en robots educativos o de bajo coste (SO-100/SO-101): el tamaño reducido del checkpoint (0,2 GB) y la licencia Apache 2.0 facilitan su uso en entornos docentes y de investigación sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El paper original de ACT (arXiv:2304.13705) reporta resultados en tareas simuladas y reales, pero no son atribuibles a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el consumo depende del backbone visual y del tamaño de las imágenes de entrada, pero es holgadamente compatible con GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; para inferencia en tiempo real basta una GPU consumer de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU para evaluación offline, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la frecuencia de control del robot y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuntasha/act_omx_left_red | 51,7 M | no disponible | Imitación robótica (ACT) | Apache 2.0 | Hugging Face |
| ACT original (paper) | no disponible | no disponible | Imitación robótica | no disponible | Paper + código de referencia |
| Diffusion Policy | no disponible | no disponible | Imitación robótica | no disponible | Repositorios públicos |
| Políticas LeRobot (otras) | variable | no disponible | Imitación robótica | variable | Hugging Face |

La comparación cuantitativa con Diffusion Policy u otras políticas de imitación no está disponible para este checkpoint. A nivel cualitativo, ACT se distingue por su simplicidad y por predecir chunks de acción, mientras que Diffusion Policy modela la distribución de acciones mediante difusión, con mayor coste computacional en inferencia.

## Limitaciones y advertencias

- Específico del robot y del dataset de entrenamiento: la política está entrenada para la morfología OMX (brazo izquierdo) y el entorno del dataset `omx_left_red`; su transferencia a otros robots o entornos no está garantizada.
- Sin documentación de sesgos: no se dispone de análisis de sesgos, pero al ser un modelo de imitación hereda los sesgos y errores de las demostraciones teleoperadas.
- Riesgo de fallo fuera de distribución: cambios en iluminación, posición de objetos o fondo pueden degradar la tasa de éxito, un problema conocido en políticas de imitación visual.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento para este checkpoint concreto, por lo que no debe asumirse una tasa de éxito determinada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Modelo de robótica, no de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- Fecha de creación futura (2026-11-19): el repositorio muestra una fecha anómala, lo que puede indicar metadatos inconsistentes; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nuntasha/act_omx_left_red
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/nuntasha/omx_left_red
