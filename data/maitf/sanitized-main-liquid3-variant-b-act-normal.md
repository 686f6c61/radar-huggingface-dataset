# maitf/sanitized-main-liquid3-variant-b-act-normal

## Resumen

El modelo `maitf/sanitized-main-liquid3-variant-b-act-normal` es una política de robótica basada en el método **Action Chunking with Transformers (ACT)**, desarrollado por el usuario `maitf` y entrenado con la librería [LeRobot](https://github.com/huggingface/lerobot) de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica teleoperadas.

Este checkpoint concreto se ha entrenado sobre un dataset propio (`maitf/sanitized-main-liquid3-variant-b`) que contiene 76 episodios y 78.153 frames a 30 FPS, correspondientes a la tarea "coger una taza, verterla y dejarla en una posición neutra usando un palo". El modelo tiene 51.668.614 parámetros y está disponible bajo licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas de imitación con LeRobot, y sirve como referencia para desarrolladores e investigadores que trabajan en manipulación robótica con brazos tipo `so_follower`. Al ser un modelo relativamente pequeño (≈51 M parámetros), puede ejecutarse en hardware de consumo, lo que facilita la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión y estado, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura **ACT**, descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT combina un codificador visual (típicamente una ResNet preentrenada) para procesar imágenes de dos cámaras (`topdown` y `wrist`), junto con un transformer que genera secuencias de acciones de longitud fija (chunks). La entrada al modelo incluye dos imágenes de 480x640 píxeles y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y 100.000 pasos de entrenamiento. El dataset de entrenamiento contiene 76 episodios teleoperados (78.153 frames a 30 FPS) de la tarea de manipulación mencionada. No se han publicado detalles sobre el uso de técnicas adicionales como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado.

## Capacidades

- **Control de robot manipulador**: genera comandos de acción de 6 grados de libertad (posición y orientación) para el brazo `so_follower`.
- **Manipulación con visión**: integra dos cámaras (vista superior y muñeca) para percibir el entorno y guiar las acciones.
- **Aprendizaje de tareas complejas**: capaz de ejecutar una secuencia de manipulación multi-etapa (coger, verter, soltar) aprendida por demostración.
- **Predicción por chunks**: produce secuencias de acciones coherentes y suaves, reduciendo la acumulación de errores frente a políticas de un solo paso.
- **Despliegue en tiempo real**: diseñado para inferencia a 30 FPS en robots reales, con soporte en el ecosistema LeRobot.
- **No aplica**: no tiene capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico, al ser un modelo puramente motor.

## Casos de uso

- **Automatización de pick-and-place en líneas de montaje**: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, gracias a su entrenamiento en tareas de manipulación con precisión.
- **Manipulación de líquidos (vertido)**: la tarea entrenada incluye verter una taza, lo que lo hace útil para aplicaciones de laboratorio, cocina robótica o dispensado de sustancias.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar el efecto de la predicción por chunks, el número de cámaras o la arquitectura ACT en tareas reales.
- **Prototipado de políticas robóticas con LeRobot**: los desarrolladores pueden clonar este modelo y adaptarlo a nuevas tareas mediante fine-tuning con datasets propios, aprovechando la infraestructura de LeRobot.
- **Educación y demostraciones**: al ser un modelo pequeño y con licencia permisiva, es ideal para cursos de robótica donde se necesite un ejemplo funcional de política entrenada.
- **Benchmark de control de robots**: puede utilizarse como baseline para comparar otras arquitecturas (diffusion policies, etc.) en la misma tarea o en variaciones de ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas cuantitativas de éxito, tasa de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene ~51,7 M parámetros, lo que en FP32 ocupa aproximadamente 207 MB. Con las imágenes de entrada (2 × 480×640×3) y el overhead de activaciones, se estima un consumo de VRAM inferior a 2 GB, incluso en FP32.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores pueden ejecutarlo sin problemas. También es viable en GPU integradas con soporte CUDA.
- **Cabe en GPU de consumo**: sí, es un modelo ligero que puede ejecutarse en hardware de gama baja-media.
- **Opciones de despliegue**: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También se puede integrar con PyTorch directamente. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no hay datos publicados. Dado el tamaño y la naturaleza del modelo, se espera una inferencia en tiempo real (30 FPS) en una GPU moderna, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos comparables en el mismo repositorio o con la misma configuración. LeRobot publica múltiples checkpoints de políticas ACT entrenadas en diferentes datasets, pero no hay una tabla comparativa oficial. Se recomienda consultar el [hub de LeRobot](https://huggingface.co/lerobot) para encontrar políticas similares, aunque los datos de rendimiento no están disponibles para este modelo concreto.

## Limitaciones y advertencias

- **Especialización en una única tarea**: el modelo fue entrenado para una tarea específica ("coger taza, verter y soltar") y no generaliza a otras tareas sin fine-tuning.
- **Dependencia del hardware**: la política asume el robot `so_follower` y las cámaras con las posiciones exactas usadas en el dataset. Cambios en la configuración física pueden degradar el rendimiento.
- **Sesgos del dataset**: el dataset fue recopilado por un único operador, por lo que puede reflejar sesgos en las demostraciones (estilos de agarre, trayectorias, etc.).
- **Riesgo de alucinación**: no aplica, ya que no genera texto, pero sí puede producir acciones erróneas si las observaciones difieren de las del entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el dataset subyacente (`maitf/sanitized-main-liquid3-variant-b`) también tiene licencia Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Sin evaluación en robot real**: la model card indica que no se han proporcionado resultados de evaluación, por lo que el rendimiento real no está verificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maitf/sanitized-main-liquid3-variant-b-act-normal)
- [Dataset de entrenamiento](https://huggingface.co/datasets/maitf/sanitized-main-liquid3-variant-b)
- [Dataset original (maitf/main-liquid3-variant-b)](https://huggingface.co/datasets/maitf/main-liquid3-variant-b)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
