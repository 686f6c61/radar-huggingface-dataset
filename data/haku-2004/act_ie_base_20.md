# Haku-2004/act_ie_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_ie_base_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/i_20261126_110221` y publicada en Hugging Face con licencia Apache 2.0.

El modelo resuelve el problema del control visuomotor a partir de demostraciones teleoperadas: dado el estado de las articulaciones y las imágenes de las cámaras, genera comandos de acción para el robot. Frente a políticas que predicen una acción por paso, ACT predice un chunk de acciones, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación.

Es relevante para quien trabaja en robótica de imitación con hardware asequible (el ecosistema LeRobot está orientado a brazos como SO-100/SO-101) porque ofrece un checkpoint listo para evaluar con `lerobot-record` y un pipeline reproducible de entrenamiento. El modelo tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, lo que lo hace desplegable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder con un cuello de botella latente de estilo VAE (CVAE). El encoder procesa las observaciones (imágenes de cámaras e información del estado de las articulaciones) junto con una variable latente, y el decoder genera un chunk de acciones futuras. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la varianza en la predicción de acciones y permite imitar con éxito demostraciones humanas ruidosas.

El entrenamiento se realizó con LeRobot mediante aprendizaje por imitación supervisado sobre el dataset `Haku-2004/i_20261126_110221`, compuesto por episodios teleoperados. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco hay datos publicados sobre RLHF, DPO ni otras fases de ajuste.

## Capacidades

- Control visuomotor de robots manipuladores a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente a errores acumulados.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatible con robots del ecosistema LeRobot, como el `so100_follower` mencionado en la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Manipulación robótica de pick-and-place: la política ACT predice chunks de acciones que permiten al brazo acercarse, agarrar y depositar objetos de forma estable, reduciendo las correcciones erráticas típicas de políticas paso a paso.
- Tareas de inserción y ensamblaje de precisión: el chunking de acciones suaviza la trayectoria final y mejora la tolerancia en tareas que requieren alineación fina, como insertar una pieza en una ranura.
- Evaluación de datasets de teleoperación: sirve como política de referencia para validar la calidad y la cantidad de episodios de un dataset antes de escalar la recolección de datos.
- Prototipado rápido en laboratorio: con 51,7 M de parámetros y 0,2 GB de pesos, se puede entrenar y evaluar en una GPU de consumo, lo que facilita iteraciones en investigación académica.
- Automatización de tareas repetitivas en entornos controlados: apilado de objetos, clasificación de piezas o carga y descarga de bandejas en celdas de trabajo con iluminación y disposición estables.
- Base para fine-tuning en nuevos robots o tareas: al ser un checkpoint Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios para adaptar la política a otra morfología o a otra tarea.
- Docencia y formación en robótica de imitación: el pipeline completo de LeRobot permite reproducir el entrenamiento y la inferencia en un entorno didáctico sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 51,7 M de parámetros (unos 207 MB en fp32); en la práctica, el consumo vendrá dominado por los buffers de las cámaras y el resto del pipeline de LeRobot.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en hardware integrado para inferencia si el backend lo permite.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA o CPU según la configuración del pipeline.
- Latencia y throughput: no disponibles. Dependen del número de cámaras, la resolución de entrada y el hardware del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_ie_base_20 | 51,7 M | ACT (imitación) | No aplica | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | ACT (imitación) | No aplica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy | No disponible | Política por difusión | No aplica | No disponible | Repositorios de investigación |
| VQ-BeT | No disponible | Política discretizada | No aplica | No disponible | Repositorios de investigación |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; los datos de parámetros de Diffusion Policy y VQ-BeT dependen de la configuración concreta y no se han verificado aquí.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos; su rendimiento fuera de la distribución del dataset de entrenamiento (nuevos objetos, iluminación o posiciones) puede degradarse severamente.
- Riesgo de sobreajuste a las condiciones de recolección: cambios en la cámara, la mesa o el fondo pueden provocar fallos de la política.
- No hay información publicada sobre sesgos, robustez ni tasas de éxito; no debe asumirse un comportamiento fiable en producción sin una evaluación propia.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; se trata de un checkpoint reciente sin validación comunitaria.
- No dispone de capacidades de lenguaje, por lo que no puede sustituir a un LLM en tareas de razonamiento o conversación.
- La ausencia de datos sobre el dataset de entrenamiento impide auditar la diversidad de las demostraciones y evaluar el riesgo de comportamientos indeseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_ie_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
