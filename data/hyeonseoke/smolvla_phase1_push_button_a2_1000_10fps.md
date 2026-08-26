# HyeonseokE/smolvla_phase1_push_button_A2_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el equipo de Hugging Face y presentado en el artículo arXiv 2506.01844. Su objetivo es ofrecer un rendimiento competitivo en tareas de robótica con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` para la tarea de presionar un botón rojo, entrenado con el framework LeRobot sobre un dataset propio de 100 episodios.

El modelo tiene 450 millones de parámetros y está especializado en control robótico: recibe observaciones de estado y tres imágenes de cámaras, y genera acciones de 6 dimensiones. Está pensado para ser ejecutado en robots tipo `so101_follower` y se distribuye bajo licencia Apache 2.0. Al ser un modelo pequeño, es adecuado para entornos de investigación y prototipado con GPUs de gama media, aunque no se han publicado resultados de evaluación en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. En esta implementación, el modelo base `lerobot/smolvla_base` ha sido fine-tuneado mediante aprendizaje por imitación (behavior cloning) sobre un dataset de 100 episodios grabados a 10 FPS, con un total de 11.359 frames. La tarea consiste en presionar un botón rojo, y el modelo recibe como entrada el estado del robot (6 dimensiones) y tres imágenes de 256x256 píxeles procedentes de cámaras (aunque la model card menciona dos cámaras: `top` y `left_wrist`). La salida es una acción de 6 dimensiones.

El entrenamiento se realizó con el optimizador AdamW, un batch size de 64, una tasa de aprendizaje de 0.0001 y 8.850 pasos, utilizando la versión 0.6.0 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Control robótico de 6 grados de libertad: genera acciones de posición/velocidad para las articulaciones del robot.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Press the red button") y el modelo asocia la instrucción con las observaciones visuales.
- Aprendizaje por imitación: el modelo puede ser fine-tuneado para nuevas tareas con datasets de demostraciones.
- Procesamiento multimodal: combina imágenes de múltiples cámaras y estado del robot para decidir la acción.
- Despliegue en hardware de consumo: gracias a su tamaño reducido, es viable en GPUs de gama media sin necesidad de servidores dedicados.

## Casos de uso

- Automatización de tareas de manipulación en entornos controlados: el modelo puede ejecutar la tarea de presionar un botón de forma repetitiva y fiable, útil en líneas de producción o laboratorios.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar técnicas de fine-tuning de VLA en tareas específicas, gracias a su bajo coste de entrenamiento.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar en un robot `so101_follower` en pocas horas, ideal para validar ideas.
- Educación y formación en robótica: al ser un modelo pequeño y con licencia abierta, es adecuado para cursos y talleres donde se necesite un ejemplo funcional de VLA.
- Benchmarking de algoritmos de control: se puede utilizar como baseline para comparar con otros modelos o métodos de aprendizaje.
- Integración en sistemas de robótica asistida: por ejemplo, en entornos de accesibilidad donde un robot debe ejecutar acciones simples bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- Al ser un modelo de 450M parámetros, la VRAM estimada para inferencia en FP32 sería de aproximadamente 1.8 GB, aunque en la práctica con safetensors y posiblemente cuantización podría reducirse. No se proporcionan datos oficiales.
- El paper de SmolVLA afirma que puede desplegarse en hardware de consumo, por lo que GPUs como RTX 3060, RTX 4060 o superiores serían suficientes.
- Para entrenamiento, se recomienda al menos una GPU con 8-12 GB de VRAM, aunque no se especifica.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en PyTorch. También podría convertirse a otros formatos (GGUF, ONNX) pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos VLA en este contexto. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no se han proporcionado datos de otros modelos comparables.

## Limitaciones y advertencias

- No hay resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot físico.
- El modelo está entrenado para una tarea muy específica (presionar un botón rojo) y no generaliza a otras tareas sin un nuevo fine-tuning.
- Depende de la configuración exacta de cámaras y robot; cambios en la iluminación, posición de la cámara o tipo de robot pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede limitar la robustez frente a variaciones del entorno.
- No se especifican los idiomas soportados; aunque la instrucción está en inglés, no se garantiza el soporte multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y del dataset asociado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A2_1000_10fps)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_push_button_A2_10fps)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
