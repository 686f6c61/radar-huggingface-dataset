# eh-cosmos-ai/omx_act_policy

## Resumen

El modelo `eh-cosmos-ai/omx_act_policy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario eh-cosmos-ai y publicada en Hugging Face bajo licencia Apache-2.0. Está diseñada para tareas de manipulación fina, concretamente para la tarea de pick-and-place, y ha sido entrenada con el framework LeRobot de Hugging Face, que facilita el entrenamiento y despliegue de políticas de imitación en robots reales.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo en particular tiene 51,6 millones de parámetros, un tamaño moderado que lo hace adecuado para ejecutarse en hardware de consumo. Su relevancia radica en que representa un ejemplo práctico de cómo aplicar transformadores al control robótico con un coste computacional reducido, siendo uno de los primeros modelos recomendados por LeRobot para iniciarse en robótica de imitación.

El repositorio incluye los pesos en formato safetensors y está integrado con el ecosistema LeRobot, lo que permite entrenar, evaluar y desplegar la política en robots como el SO100 o el OMX mediante comandos sencillos. No se dispone de información sobre el contexto, idiomas o cuantizaciones, ya que la model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza una arquitectura transformer para predecir secuencias de acciones de longitud fija (chunks) a partir de observaciones del estado del robot y de la cámara. A diferencia de los métodos que predicen una sola acción por paso, ACT genera un bloque de acciones que el robot ejecuta de forma autónoma, reduciendo la frecuencia de inferencia y mejorando la consistencia del movimiento. El modelo se entrena con datos teleoperados, es decir, demostraciones realizadas por un humano que controla el robot, y utiliza una pérdida de regresión sobre las acciones junto con una pérdida de reconstrucción de las observaciones (similar a un autoencoder) para mejorar la representación latente.

El entrenamiento se ha realizado con el framework LeRobot, que gestiona el dataset, el bucle de entrenamiento y la evaluación. El dataset utilizado es `eh-cosmos-ai/pick_and_place`, que contiene demostraciones de tareas de recoger y colocar objetos. No se especifica el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal de ACT es su eficiencia: es ligero, rápido de entrenar y requiere pocos recursos, lo que lo hace ideal para prototipado en robótica.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones para que un brazo robótico realice tareas de pick-and-place.
- Aprendizaje por imitación: aprende de demostraciones teleoperadas y reproduce comportamientos similares.
- Predicción por chunks: emite bloques de acciones (por ejemplo, 50 pasos) que permiten movimientos suaves y coordinados.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots como SO100, OMX o Koch.
- Bajo coste computacional: con solo 51,6 millones de parámetros, puede ejecutarse en GPUs de consumo y en tiempo real.
- Sin capacidades de lenguaje: no procesa texto ni mantiene conversaciones; es exclusivamente una política de control.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios de robótica: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, replicando las demostraciones humanas. Es adecuado por su tamaño reducido y su entrenamiento específico en esta tarea.
- Prototipado rápido de políticas de imitación: investigadores pueden usar este modelo como punto de partida para entrenar sus propias políticas con LeRobot, gracias a su integración nativa y a su bajo coste de entrenamiento.
- Evaluación de algoritmos de control en robots de bajo coste: al ser ligero, puede desplegarse en robots como el SO100 (un brazo de bajo coste) para validar algoritmos de manipulación sin necesidad de hardware de gama alta.
- Investigación en action chunking: sirve como ejemplo de referencia para estudiar los efectos de la predicción por chunks en la estabilidad y precisión de movimientos robóticos.
- Demostraciones educativas en robótica: en cursos o talleres, se puede utilizar para enseñar conceptos de aprendizaje por imitación y control basado en transformadores, ya que su instalación y ejecución son sencillas con LeRobot.
- Benchmarking de políticas de control: al estar disponible en Hugging Face con pesos abiertos, puede usarse como baseline para comparar con otras políticas (por ejemplo, Diffusion Policy) en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el paper original de ACT (arxiv:2304.13705) para conocer el rendimiento general del método, pero no hay datos específicos de este modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parámetros, en FP32 el modelo ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1060 hasta una RTX 4090. También puede ejecutarse en CPU para inferencia no en tiempo real.
- Compatibilidad con GPU de consumo: sí, es perfectamente viable en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot ofrece scripts de entrenamiento y evaluación (`lerobot-train`, `lerobot-record`). También puede integrarse con vLLM o TGI, aunque no es lo habitual para políticas robóticas; lo más común es usar el propio framework de LeRobot.
- Latencia y throughput: no se dispone de datos medidos, pero dado el tamaño del modelo, la inferencia debería ser de pocos milisegundos en una GPU moderna, permitiendo control en tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de políticas robóticas. Sin embargo, se puede comparar cualitativamente con otras políticas del ecosistema LeRobot:

| Modelo | Parametros | Arquitectura | Tarea tipica | Licencia |
|---|---|---|---|---|
| eh-cosmos-ai/omx_act_policy | 51,7 M | ACT (Transformer) | Pick-and-place | Apache-2.0 |
| Diffusion Policy (referencia) | no disponible | Diffusion | Manipulacion general | no disponible |
| VQ-BeT (referencia) | no disponible | Transformer + VQ | Manipulacion | no disponible |

ACT es conocido por ser más ligero y rápido de entrenar que Diffusion Policy, aunque puede ser menos robusto ante variaciones del entorno. No se dispone de datos concretos de este modelo específico para comparar.

## Limitaciones y advertencias

- Es un modelo especializado en una tarea concreta (pick-and-place) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- No tiene capacidades de procesamiento de lenguaje ni de razonamiento simbólico; es exclusivamente una política de control.
- Depende de la calidad de las demostraciones teleoperadas; si los datos de entrenamiento son limitados o sesgados, el comportamiento reflejará esos sesgos.
- No se han publicado métricas de rendimiento ni estudios de robustez, por lo que su fiabilidad en entornos no controlados es desconocida.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el dataset `eh-cosmos-ai/pick_and_place` tenga una licencia compatible.
- Al ser un modelo de robótica, cualquier despliegue en robots físicos requiere medidas de seguridad adecuadas para evitar daños o accidentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eh-cosmos-ai/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/act
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/eh-cosmos-ai/pick_and_place
