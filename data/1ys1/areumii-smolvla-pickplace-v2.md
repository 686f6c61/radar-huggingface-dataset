# 1ys1/areumii-smolvla-pickplace-v2

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v2` es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, adaptado específicamente para una tarea de pick-and-place en el robot manipulador `areumii_c1`. El autor, `1ys1`, ha entrenado esta política sobre el modelo base `lerobot/smolvla_base` utilizando el framework LeRobot, con un dataset propio de 80 episodios que captura la tarea "coger el cubo rojo y colocarlo en la cesta azul". Con 450 millones de parámetros, este modelo demuestra que es posible ejecutar políticas robóticas avanzadas en hardware de consumo, reduciendo los costes computacionales frente a VLA de mayor tamaño como OpenVLA (7B). Su relevancia radica en la accesibilidad del fine-tuning y la inferencia en entornos de investigación y prototipado, sin necesidad de clústeres de GPU de alta gama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, basada en transformer) |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, diseñado para ser lo suficientemente compacto como para ejecutarse en GPUs de consumo. El modelo base `lerobot/smolvla_base` ya incorpora las capacidades de razonamiento visual y lingüístico, y este fine-tuning adapta esas capacidades a la tarea concreta de manipulación robótica. El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `1ys1/areumii_pickplace-v2`, que contiene 80 episodios y 5669 frames a 20 FPS, con tres cámaras (frontal, muñeca izquierda y muñeca derecha) y observaciones de estado de 6 dimensiones. La configuración de entrenamiento incluyó 30.000 pasos, batch size de 8, optimizador AdamW con learning rate 0.0001 y semilla 1000. No se especifica el uso de RLHF o DPO; se trata de un fine-tuning supervisado de imitación.

## Capacidades

- Generación de acciones de control para un robot manipulador de 6 grados de libertad, a partir de observaciones visuales y de estado.
- Procesamiento de tres flujos de imagen simultáneos (frontal, muñeca izquierda, muñeca derecha) a resolución 256x256.
- Ejecución de la tarea específica de pick-and-place: detectar un cubo rojo y colocarlo en una cesta azul.
- Inferencia en tiempo real a 20 FPS, compatible con el bucle de control del robot.
- Integración nativa con el ecosistema LeRobot, permitiendo despliegue mediante `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios de robótica: el modelo puede ejecutar la tarea de pick-and-place de forma repetitiva y consistente, sirviendo como base para experimentos de aprendizaje por imitación.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido, permite iterar sobre el dataset y la configuración de entrenamiento en una sola GPU, acelerando el ciclo de desarrollo.
- Investigación en VLA compactos: sirve como punto de partida para estudiar el equilibrio entre rendimiento y coste computacional en modelos de visión-lenguaje-acción.
- Demostraciones educativas: al ser un modelo pequeño y con licencia Apache-2.0, es adecuado para cursos y talleres de robótica con IA, donde los estudiantes pueden fine-tunear y desplegar la política en hardware asequible.
- Benchmarking de hardware robótico: permite evaluar el rendimiento de diferentes GPUs o configuraciones de inferencia en tareas de control en tiempo real.
- Base para fine-tuning en tareas similares: el modelo puede adaptarse a otras tareas de manipulación (apilar, insertar, etc.) con un dataset adicional, aprovechando el conocimiento previo de la tarea de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos en la tarea concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros, el modelo en FP32 ocupa aproximadamente 1,8 GB, y en FP16 alrededor de 0,9 GB. Se estima que una GPU con al menos 2 GB de VRAM puede ejecutar la inferencia, aunque se recomienda 4 GB para margen con las entradas de imagen.
- GPU recomendadas: cualquier GPU moderna de consumo con soporte CUDA, como NVIDIA GTX 1650 (4 GB), RTX 3060 (12 GB) o superiores. También es viable en Apple Silicon con Metal.
- Cabe en GPUs de consumo: sí, es uno de los puntos fuertes de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia mediante `lerobot-rollout`. También puede exportarse a formatos como ONNX o TensorRT para optimización, aunque no se documenta en la model card.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño y la resolución de entrada, se espera una latencia inferior a 50 ms en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Pick-and-place específico | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulación general | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Manipulación general | Propietaria | No público |

SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA, con un coste de inferencia significativamente menor, aunque con un alcance de tareas más limitado al ser un fine-tuning específico. No se dispone de datos de rendimiento comparativo en la misma tarea, por lo que no es posible cuantificar la diferencia en tasa de éxito.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea de pick-and-place con el robot `areumii_c1` y las cámaras específicas. No es generalizable a otros robots, configuraciones de cámara o tareas sin un nuevo fine-tuning.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real en condiciones de producción es desconocido.
- El dataset de entrenamiento es pequeño (80 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Al ser un modelo de imitación, puede presentar comportamientos no deseados si las condiciones de inferencia difieren del entorno de entrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno controlado, puede fallar en escenarios no vistos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del robot y del hardware, por lo que su uso en producción requiere validación adicional.
- No se proporcionan instrucciones sobre cuantización, por lo que el despliegue en dispositivos con VRAM muy limitada puede requerir trabajo adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/1ys1/areumii-smolvla-pickplace-v2)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/1ys1/areumii_pickplace-v2)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Demo de fine-tuning de SmolVLA en GitHub](https://github.com/HuanYitiao/smolvla-pickplace-demo)
