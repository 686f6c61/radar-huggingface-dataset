# seriintan/multitaskdit_frazier

## Resumen

El modelo `seriintan/multitaskdit_frazier` es una política robótica basada en el arquitectura Multi-Task Diffusion Transformer (DiT), publicada en el paper arXiv:2507.05331. Ha sido entrenado con el framework LeRobot de Hugging Face para controlar un robot seguidor SO (so_follower) en una tarea concreta de manipulación: recoger y colocar un objeto denominado "Frazier" en una cesta azul. El modelo combina condicionamiento por texto y por visión para generar acciones de control de 6 grados de libertad a partir de observaciones de estado y dos cámaras (frontal y pinza).

Con 248,8 millones de parámetros y un tamaño de 1 GB en formato safetensors, representa una implementación de tamaño medio dentro de la familia DiT, que en su configuración original alcanza ~450M de parámetros. Su relevancia radica en que demuestra el uso de diffusion transformers para aprendizaje por imitación multi-tarea en robótica, con soporte tanto para objetivos de difusión como de flow-matching. Aunque el modelo publica una sola tarea, la arquitectura subyacente está diseñada para escalar a múltiples tareas con condicionamiento textual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento de texto y visión |
| Parametros totales | 248.855.302 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un Diffusion Transformer (DiT) que extiende Diffusion Policy con un transformer de gran tamaño y condicionamiento multimodal. La política procesa observaciones de estado (vector de 6 dimensiones) y dos imágenes RGB (frontal y pinza, ambas de 480x640) para generar acciones de 6 dimensiones. El entrenamiento utiliza un objetivo de difusión (o flow-matching, según configuración) y está condicionado por texto para especificar la tarea, lo que permite en principio generalizar a múltiples tareas con un único conjunto de pesos.

El entrenamiento se realizó con el dataset `seriintan/frazier_dataset_20260901_151518`, que contiene 100 episodios y 52.442 frames a 30 FPS, capturados con el robot SO follower. Se usó el optimizador Adam con una tasa de aprendizaje de 2e-5, batch size de 8, durante 50.000 pasos, con semilla 1000. La versión de LeRobot empleada fue la 0.6.2. No se especifica si se aplicaron técnicas adicionales como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control robótico de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones de estado e imágenes.
- Aprendizaje por imitación: reproduce una tarea demostrada ("Pick and place Frazier to blue basket").
- Condicionamiento por texto para especificar la tarea, lo que habilita potencialmente multi-tarea.
- Procesamiento de visión: dos cámaras (frontal y gripper) con resolución 640x480.
- Soporte de difusión y flow-matching como objetivos de entrenamiento.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos específicos y colocarlos en ubicaciones designadas, como se demuestra con la tarea de Frazier. Es adecuado porque combina visión y control en una sola red, simplificando el pipeline.
- Prototipado rápido de políticas de manipulación: investigadores pueden entrenar y desplegar este modelo con LeRobot en pocas horas, usando el dataset y los scripts proporcionados, para validar algoritmos de imitación.
- Evaluación de arquitecturas de diffusion transformer en robótica: sirve como baseline de referencia para comparar con otras políticas como ACT o Diffusion Policy.
- Investigación en multi-tarea robótica: aunque el checkpoint publicado es de tarea única, la arquitectura soporta condicionamiento textual, por lo que puede extenderse a múltiples tareas con datasets más amplios.
- Desarrollo de sistemas de demostración para ferias o laboratorios: el modelo se puede ejecutar en tiempo real con un robot SO follower, mostrando capacidades de manipulación autónoma.
- Benchmark de rendimiento en entornos simulados o reales: al tener un tamaño moderado y licencia Apache-2.0, es útil para comparar métricas de éxito, latencia y consumo de recursos frente a otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre o tiempo de ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB, considerando los 248,8M de parámetros y las entradas de imagen (dos cámaras de 480x640). Con precisión FP32, el modelo ocupa ~1 GB en memoria; la activación y las imágenes adicionales pueden elevar el consumo a ~2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3070/3080, RTX 4060 Ti, o A100 para mayor velocidad).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, etc. La inferencia es factible incluso en GPUs integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: el modelo se usa principalmente a través de LeRobot, que proporciona scripts `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Depende del hardware y de si se usa difusión con múltiples pasos de denoising (típicamente 10-50 pasos). En una GPU media, se puede esperar una frecuencia de control de 10-30 Hz, suficiente para tareas de manipulación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| `seriintan/multitaskdit_frazier` | Multi-Task DiT | 248,8M | No aplica | Pick-and-place | Apache-2.0 |
| Diffusion Policy (original) | U-Net + difusión | ~10-100M | No aplica | Manipulación | MIT |
| ACT (Action Chunking with Transformers) | Transformer + CVAE | ~80-100M | No aplica | Manipulación | MIT |
| RDT (Robotics Diffusion Transformer) | DiT + visión | ~1.2B | No aplica | Manipulación multi-tarea | Apache-2.0 |

La comparativa es aproximada, basada en arquitecturas típicas de la literatura. El modelo aquí presentado es más pequeño que RDT (1.2B) pero más grande que Diffusion Policy clásica. Su ventaja es la integración nativa con LeRobot y el condicionamiento multimodal.

## Limitaciones y advertencias

- Entrenado para una única tarea concreta ("Pick and place Frazier to blue basket"); no se garantiza generalización a otras tareas u objetos sin reentrenamiento.
- Dataset limitado: solo 100 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o perturbaciones.
- Sin evaluación reportada: no hay datos de tasa de éxito en robot real, por lo que su rendimiento real es desconocido.
- Dependencia de calibración de cámaras y del robot SO follower específico; el modelo puede no funcionar en otros robots sin adaptación.
- No es un modelo de lenguaje, por lo que no aplican consideraciones de sesgo lingüístico o alucinación textual.
- Licencia Apache-2.0, permisiva para uso comercial, pero el usuario es responsable del cumplimiento de las leyes de robótica y seguridad en su aplicación.
- El tamaño del repositorio es de 1 GB, lo que puede suponer un problema de almacenamiento en despliegues con múltiples políticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/seriintan/multitaskdit_frazier)
- [Dataset asociado](https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518)
- [Paper del Multi-Task DiT](https://huggingface.co/papers/2507.05331)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para multi_task_dit](https://huggingface.co/docs/lerobot/main/en/multi_task_dit)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_20260901_151518)
