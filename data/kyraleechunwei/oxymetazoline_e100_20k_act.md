# KyraLeeChunWei/Oxymetazoline_e100_20K_ACT

## Resumen

Oxymetazoline_e100_20K_ACT es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en HuggingFace Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su propósito es controlar un robot manipulador a partir de observaciones visuales, prediciendo secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El modelo cuenta con 51.678.855 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Está asociado al dataset KyraLeeChunWei/Oxymetazoline_e100 y entrenado presumiblemente durante 20.000 pasos, según sugiere el sufijo "20K" del identificador. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante en el contexto actual de robótica de código abierto porque LeRobot está democratizando el acceso a políticas de imitación que antes requerían infraestructura propietaria. Sin embargo, se trata de un modelo muy específico, entrenado para una tarea y un robot concretos, sin documentación pública sobre el hardware objetivo, los datos de entrenamiento ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un backbone de visión (habitualmente ResNet) que procesa las imágenes de las cámaras del robot con un transformer encoder-decoder que fusiona las observaciones visuales con el estado de las articulaciones y genera un chunk de acciones futuras. La innovación principal del método es predecir varios pasos de acción de golpe, lo que reduce el error de compounding y mejora la suavidad del movimiento. Además, ACT incorpora una cabeza de estilo CVAE durante el entrenamiento para modelar la variabilidad humana en los datos de teleoperación.

El entrenamiento se realiza por imitación supervisada sobre episodios de teleoperación recogidos con LeRobot. En este caso concreto, el modelo se ha entrenado sobre el dataset KyraLeeChunWei/Oxymetazoline_e100, presumiblemente durante 20.000 pasos según el sufijo del nombre. No se dispone de información pública sobre el número de episodios, la composición del dataset, el robot utilizado ni si se aplicaron técnicas de aumento de datos o regularización específicas.

## Capacidades

- Control robótico por imitación: genera chunks de acciones articulares a partir de observaciones visuales y del estado del robot.
- Manipulación visual: procesa imágenes de cámaras para guiar el movimiento del efector final.
- Ejecución de tareas de pick-and-place y manipulación aprendidas de demostraciones humanas.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Inferencia en tiempo real sobre hardware consumer con GPU CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de manipulación repetitivas: el modelo puede ejecutar secuencias de pick-and-place aprendidas de teleoperación, sustituyendo al operador humano en cadenas de montaje ligeras o laboratorios.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, ajustar hiperparámetros o evaluar nuevas estrategias de chunking sobre el mismo dataset.
- Prototipado rápido de políticas robóticas: con LeRobot, un equipo puede entrenar y desplegar una política funcional en pocas horas sobre un robot SO-100 u otro compatible, validando la viabilidad de una tarea antes de invertir en desarrollo propio.
- Evaluación de datasets de teleoperación: al estar vinculado a un dataset concreto, permite medir la calidad de los datos de demostración y su impacto en la tasa de éxito.
- Educación y formación en robótica: adecuado para cursos y talleres donde se enseña aprendizaje por imitación con hardware asequible y herramientas open source.
- Benchmarking de infraestructura de inferencia: con 51,7 M de parámetros, es útil para medir latencia y throughput de pipelines de robótica en GPUs consumer.
- Despliegue en entornos de laboratorio con robot SO-100: el comando `lerobot-record` con `--robot.type=so100_follower` sugiere compatibilidad con esta plataforma de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,7 M de parámetros), por lo que cabe holgadamente en cualquier GPU con al menos 2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es lo suficientemente pequeño como para no requerir hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en algunas integradas con soporte CUDA.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oxymetazoline_e100_20K_ACT | 51,7 M | no aplica | no disponible | Apache 2.0 | HuggingFace Hub |
| ACT original (paper 2304.13705) | no disponible | no aplica | reportado en paper | no disponible | Repositorio de investigación |
| Diffusion Policy | no disponible | no aplica | reportado en paper | no disponible | Repositorio de investigación |
| VQ-BeT | no disponible | no aplica | reportado en paper | no disponible | Repositorio de investigación |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación se limita a la categoría (políticas de imitación para robótica) y a la licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado sobre un único dataset (Oxymetazoline_e100) y presumiblemente para un robot concreto; no generaliza a otras tareas, entornos o morfologías sin reentrenamiento.
- Sin documentación sobre el hardware objetivo: se desconoce la configuración de cámaras, el robot exacto y la frecuencia de control, lo que dificulta su reutilización directa.
- Riesgo de sobreajuste al dataset: con 20.000 pasos de entrenamiento y un dataset no documentado, existe riesgo de que la política memorice trayectorias y falle ante variaciones de iluminación, posición de objetos o ruido visual.
- Sin métricas de evaluación publicadas: no hay tasas de éxito, curvas de aprendizaje ni comparaciones con baselines, por lo que no se puede evaluar su calidad objetivamente.
- Sin información sobre sesgos: al ser un modelo robótico, los sesgos relevantes serían los del dataset de teleoperación (posiciones, objetos, condiciones de iluminación), no documentados.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías ni soporte.
- Sin capacidades lingüísticas: no debe confundirse con un LLM; no procesa texto ni responde a instrucciones en lenguaje natural.
- Advertencia de producción: antes de desplegar en un entorno real, es imprescindible validar la política en el robot objetivo y con condiciones de seguridad adecuadas, dado que no hay evidencia pública de su robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KyraLeeChunWei/Oxymetazoline_e100_20K_ACT
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Oxymetazoline_e100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
