# seriintan/multi_task_dit_frazier

## Resumen

`seriintan/multi_task_dit_frazier` es un modelo de robótica basado en la arquitectura Multi-Task Diffusion Transformer (DiT), una evolución de Diffusion Policy que incorpora un transformer de difusión de gran tamaño con condicionamiento por texto y visión para aprendizaje multitarea. Desarrollado por el usuario seriintan y publicado bajo licencia Apache 2.0, este modelo está entrenado específicamente para la tarea de "Pick and place Frazier to blue basket" sobre un robot tipo `so_follower` con dos cámaras (frontal y de pinza). Con 248,8 millones de parámetros, es una versión reducida del DiT original de ~450M descrito en el paper arXiv 2507.05331, y se distribuye a través de la librería LeRobot en formato safetensors.

El modelo resuelve el problema del control robótico por imitación: dado un estado del robot (6 dimensiones) y dos imágenes RGB (480×640), genera una acción de 6 dimensiones que permite ejecutar la tarea de manipulación. Su relevancia radica en que combina las ventajas de los transformers de difusión con el condicionamiento multimodal (lenguaje + visión), lo que lo hace adecuado para tareas que requieren comprensión semántica y destreza fina. El repositorio incluye el modelo entrenado, pero no se han publicado resultados de evaluación en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) |
| Parametros totales | 248.855.302 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por texto en inglés, según la tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un Diffusion Transformer (DiT) que extiende Diffusion Policy. La arquitectura procesa observaciones multimodales: un vector de estado de 6 dimensiones y dos imágenes RGB de 480×640 píxeles (cámaras `front` y `gripper`). El condicionamiento por texto se realiza mediante instrucciones en lenguaje natural (en este caso, la tarea "Pick and place Frazier to blue basket"). El modelo soporta tanto el objetivo de difusión clásico como el de flow-matching para la generación de acciones, lo que permite flexibilidad en el entrenamiento y la inferencia.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 100 episodios y 52.442 frames a 30 FPS. Se usaron 50.000 pasos de entrenamiento con batch size 8, optimizador Adam y learning rate 2e-5, con semilla 1000. No se especifica si se aplicaron técnicas de RLHF o DPO, ya que es un modelo de imitación pura. El dataset está disponible en `seriintan/frazier_dataset_20260901_151518`.

## Capacidades

- Generación de acciones de 6 dimensiones para control robótico (posición y orientación del efector final).
- Condicionamiento por visión: procesa dos cámaras RGB simultáneamente (frontal y de pinza) para percibir el entorno.
- Condicionamiento por lenguaje: acepta instrucciones textuales para seleccionar la tarea a ejecutar.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Soporte de difusión y flow-matching como objetivos de generación de acciones.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Capacidad de ejecución en tiempo real (30 FPS) gracias a la arquitectura DiT optimizada.

## Casos de uso

- Automatización de tareas de pick and place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos y colocarlos en ubicaciones específicas, como cestas o contenedores, basándose en la percepción visual y la instrucción textual.
- Investigación en aprendizaje por imitación: sirve como baseline para estudiar el rendimiento de los Diffusion Transformers en robótica, comparando con Diffusion Policy clásica u otras arquitecturas.
- Desarrollo de políticas multitarea: aunque este modelo está entrenado para una sola tarea, la arquitectura DiT permite extenderlo a múltiples tareas con condicionamiento por texto, lo que lo hace útil para prototipar sistemas de manipulación versátiles.
- Benchmarking de hardware robótico: al ser un modelo de tamaño moderado (248M parámetros), puede usarse para evaluar el rendimiento de GPUs embebidas o de bajo consumo en inferencia robótica en tiempo real.
- Entrenamiento de políticas en simulación y transferencia a real: el repositorio hermano `seriintan/multitask-dit-frazier-sim-v3` sugiere que el mismo modelo puede entrenarse en simulación y luego transferirse al robot real, lo que permite reducir costes de recolección de datos.
- Integración en pipelines de LeRobot: los usuarios pueden cargar el modelo directamente con `lerobot-rollout` y ejecutarlo en su propio hardware, lo que facilita la reproducción de experimentos y la validación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión de agarre o tiempo de ejecución. Tampoco hay comparativas con otros modelos en el repositorio.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. A partir del tamaño del modelo (248,8M parámetros) y de las prácticas habituales en robótica con LeRobot, se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 1 GB de memoria; en FP16, unos 0,5 GB. Con las imágenes de entrada (dos cámaras de 480×640), se recomienda al menos 4 GB de VRAM para un funcionamiento fluido.
- GPU recomendadas: una GPU de gama media como NVIDIA RTX 3060 (12 GB) o superior es suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A100 o similar).
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo como la RTX 3060, RTX 4060 o RTX 4090, siempre que se utilice FP16 o cuantización (aunque no se han publicado cuantizaciones oficiales).
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la carga del modelo y la interfaz con el robot. También es posible exportar el modelo a otros formatos (ONNX, TensorRT) mediante conversión manual, aunque no hay guías oficiales.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, se espera que la inferencia sea inferior a 50 ms por paso, lo que permitiría operar a 30 FPS, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. A continuación se indican alternativas de la misma categoría (políticas de aprendizaje por imitación para robótica) con sus características generales, basadas en documentación pública:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `multi_task_dit_frazier` (este) | DiT | 248M | Imágenes + estado + texto | Apache 2.0 | HuggingFace |
| Diffusion Policy (original) | U-Net con difusión | ~10-100M | Imágenes + estado | MIT | GitHub |
| ACT (Action Chunking with Transformers) | Transformer con chunking | ~80M | Imágenes + estado | MIT | GitHub |

Nota: los datos de Diffusion Policy y ACT son aproximados y provienen de sus respectivos repositorios; no se ha realizado una comparación directa con este modelo.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real del modelo es desconocido. Es necesario validarlo en el hardware objetivo antes de usarlo en producción.
- El dataset de entrenamiento es pequeño (100 episodios) y está limitado a una única tarea ("Pick and place Frazier to blue basket"). La generalización a otras tareas u objetos no está garantizada.
- El modelo depende de dos cámaras específicas (frontal y de pinza) con resoluciones fijas (480×640). Cambiar la configuración de cámaras o la resolución puede degradar el rendimiento.
- No se especifican los idiomas soportados para el condicionamiento por texto. La tarea está en inglés, por lo que el modelo puede no responder correctamente a instrucciones en otros idiomas.
- Al ser un modelo de imitación, hereda los sesgos del dataset de demostración (por ejemplo, posiciones de objetos, iluminación, variaciones de agarre). Si el dataset no es representativo, el modelo puede fallar en entornos no vistos.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones no válidas o inestables si las observaciones están fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la librería LeRobot y del dataset asociado para asegurar el cumplimiento.
- El modelo no incluye mecanismos de seguridad o verificación de movimientos. En aplicaciones reales, se debe implementar un supervisor de seguridad externo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/seriintan/multi_task_dit_frazier
- Paper del Multi-Task DiT: https://huggingface.co/papers/2507.05331
- Documentación de LeRobot sobre multi_task_dit: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Implementación alternativa de MultiTask DiT: https://github.com/brysonjones/multitask_dit_policy
- Página del proyecto MultiTask-DiT: https://aierlab.tech/MultiTask-DiT/
- Repositorio hermano en simulación: https://huggingface.co/seriintan/multitask-dit-frazier-sim-v3
