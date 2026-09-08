# imstevenpmwork/dit_super_chatton_main

## Resumen

El modelo `imstevenpmwork/dit_super_chatton_main` es una política de robótica basada en un *Multi-Task Diffusion Transformer* (DiT), desarrollada por Steven Palma (imstevenpmwork) sobre el framework LeRobot de Hugging Face. Extiende *Diffusion Policy* con un transformer de difusión de gran tamaño y condicionamiento multimodal (texto y visión), lo que permite aprender tareas de manipulación robótica a partir de demostraciones humanas. El modelo está diseñado para controlar un robot tipo `omx_follower` con dos cámaras (frontal y muñeca) y ejecutar una tarea concreta de *pick-and-place*: recoger un cubo azul y uno amarillo y dejarlos en una caja verde.

La arquitectura soporta tanto objetivos de difusión como de *flow-matching*, y el model card indica que alcanza una alta destreza con aproximadamente 450 millones de parámetros; sin embargo, los pesos reales en formato `safetensors` suman 248.855.302 parámetros (unos 249 millones). El modelo está publicado bajo licencia Apache 2.0 y su peso total en el repositorio es de 1.0 GB. Al ser un modelo de política robótica y no un modelo de lenguaje, no dispone de longitud de contexto ni de capacidades lingüísticas en el sentido convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento de texto y visión |
| Parametros totales | 248.855.302 (~249M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de política robótica, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un *Multi-Task Diffusion Transformer* (DiT), una extensión de *Diffusion Policy* que sustituye el tradicional UNet por un transformer de difusión de gran tamaño. Incorpora condicionamiento por texto y por imágenes, lo que le permite manejar múltiples tareas de manipulación a partir de descripciones textuales y observaciones visuales. Soporta entrenamiento tanto con objetivos de difusión como de *flow-matching*, una innovación que mejora la estabilidad y la calidad de las acciones generadas.

El entrenamiento se realizó con el dataset `imstevenpmwork/super_chatton`, que contiene 100 episodios y 73.842 fotogramas grabados a 30 FPS. La tarea supervisada es: *"Pick up the blue cube, and the yellow cube, and drop them in the green box one by one."* La configuración de entrenamiento incluye 30.000 pasos, *batch size* de 80, optimizador Adam con tasa de aprendizaje 0.0001 y semilla 1000. El modelo se entrenó y subió al Hub usando LeRobot en su versión 0.6.2.

## Capacidades

- Generación de acciones de robot (6 dimensiones) a partir de observaciones de estado y dos imágenes de cámara (frontal y muñeca).
- Aprendizaje multi-tarea gracias al condicionamiento por texto, que permite seleccionar la tarea a ejecutar mediante una descripción.
- Soporte de objetivos de difusión y *flow-matching* durante el entrenamiento.
- Integración nativa con el ecosistema LeRobot: puede cargarse y ejecutarse con `lerobot-rollout` y entrenarse con `lerobot-train`.
- Entrenado específicamente para una tarea de manipulación de cubos en un entorno controlado con dos cámaras.
- Compatible con el robot `omx_follower` y con cámaras configuradas a 640x480 píxeles y 30 FPS.

## Casos de uso

- Manipulación robótica en laboratorios de investigación: el modelo controla un robot `omx_follower` para ejecutar tareas de *pick-and-place* definidas por texto, usando las cámaras frontal y de muñeca. Es adecuado para validar algoritmos de aprendizaje por imitación en el framework LeRobot.
- Automatización de tareas repetitivas en entornos industriales: entrenado con demostraciones, puede replicar tareas como recoger y colocar piezas en una caja, reduciendo la necesidad de programación manual de trayectorias.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden cargar el modelo con `lerobot-rollout` y probarlo en un robot real en minutos, sin necesidad de reentrenar desde cero.
- Investigación en políticas multi-tarea: el condicionamiento por texto permite experimentar con la selección de tareas en un mismo modelo, útil para estudiar la generalización en manipulación robótica.
- Educación en robótica: sirve como ejemplo de aplicación de transformers de difusión a la generación de acciones, con un tamaño de pesos moderado que facilita su estudio y despliegue en GPUs de consumo.
- Integración en pipelines de datos de LeRobot: el modelo puede usarse como referencia para comparar el rendimiento de nuevas políticas entrenadas con el mismo dataset y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explícitamente que no se proporcionan resultados de evaluación: *"No evaluation results have been provided for this policy yet."* Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de ~249M parámetros y un peso de 1.0 GB, se estima que el modelo puede ejecutarse en GPUs de consumo con al menos 6-8 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizó en CUDA (`--policy.device=cuda`), por lo que se requiere una GPU compatible con CUDA.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño moderado del modelo, aunque no está confirmado por el autor.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot, usando `lerobot-rollout` para inferencia en robot y `lerobot-train` para reentrenamiento. No aplica a vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Los resultados de búsqueda no proporcionan datos sobre otros modelos de políticas robóticas comparables, por lo que la comparativa se indica como no disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en robot no está verificado y no debe asumirse que la tarea se ejecuta con éxito.
- El modelo fue entrenado en un dataset de solo 100 episodios y una única tarea (recoger cubos), lo que limita su generalización a otros objetos, entornos o tareas.
- Depende de la configuración específica del robot `omx_follower` y de las cámaras frontal y de muñeca. Cambios en la posición de las cámaras o en el tipo de robot pueden degradar el rendimiento.
- No es un modelo de lenguaje: no soporta generación de texto, conversación ni razonamiento lingüístico, y no debe usarse como tal.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una política robótica y su utilidad está limitada al ámbito de la manipulación con LeRobot.
- El dataset de entrenamiento puede contener sesgos derivados de las demostraciones humanas (posiciones iniciales, iluminación, orden de acciones), lo que puede afectar a la robustez en condiciones variables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imstevenpmwork/dit_super_chatton_main
- Paper de referencia: https://huggingface.co/papers/2507.05331
- Dataset de entrenamiento: https://huggingface.co/datasets/imstevenpmwork/super_chatton
- Guía de LeRobot para multi_task_dit: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
