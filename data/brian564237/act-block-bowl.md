# brian564237/act-block-bowl

## Resumen

`brian564237/act-block-bowl` es un modelo de política robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado con el framework LeRobot de Hugging Face para controlar un robot de tipo `so_follower` (probablemente un brazo robótico SO-101 de bajo coste) en una tarea de manipulación denominada "block-bowl", consistente en colocar un bloque en un cuenco. Utiliza una cámara frontal como entrada visual y produce comandos de acción de 6 dimensiones.

Este modelo resulta relevante porque demuestra la aplicación práctica de transformers a la robótica de bajo coste, con una licencia Apache 2.0 que permite uso comercial y modificación. Con apenas 51,7 millones de parámetros, es un ejemplo de política ligera entrenable en hardware modesto, orientada a investigación y prototipado. No obstante, se trata de un modelo de demostración sin resultados de evaluación publicados, por lo que su rendimiento real en el robot no está verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de política, no LLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El modelo recibe observaciones de estado (6 dimensiones) e imágenes de una cámara frontal (resolución 720×1280, aunque en inferencia puede reducirse) y genera una secuencia de acciones futuras de 6 dimensiones. El CVAE permite modelar la variabilidad multimodal de las demostraciones, capturando múltiples estrategias válidas para una misma tarea.

El entrenamiento se realizó con LeRobot (versión 0.6.2) sobre el dataset `brian564237/so101-block-bowl-test`, que contiene 50 episodios teleoperados con un total de 14.946 fotogramas a 30 FPS. La configuración de entrenamiento incluye 3.000 pasos, batch size de 1, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas adicionales como RLHF o DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de 6 grados de libertad: genera comandos de acción para el brazo robot SO-101 a partir de observaciones de estado e imágenes.
- Percepción visual: procesa imágenes de cámara frontal en color (3 canales) para guiar la manipulación.
- Aprendizaje por imitación: reproduce comportamientos demostrados sin necesidad de diseñar funciones de recompensa.
- Generación de secuencias de acciones: predice chunks de acciones (ventana temporal) en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Específico para la tarea "block-bowl": entrenado exclusivamente para colocar un bloque en un cuenco, aunque podría adaptarse a tareas similares con reentrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño del dataset, el número de pasos de entrenamiento o la arquitectura ACT en tareas de manipulación.
- Prototipado de tareas de pick-and-place: la tarea block-bowl es un caso representativo de manipulación de objetos; el modelo puede evaluarse en variaciones de posición del bloque y del cuenco.
- Educación en robótica: permite a estudiantes universitarios experimentar con políticas neuronales en hardware de bajo coste (SO-101) sin necesidad de grandes infraestructuras.
- Benchmarking de algoritmos de imitación: puede compararse con otras políticas (Diffusion Policy, etc.) en el mismo robot y tarea para medir tasas de éxito y robustez.
- Automatización de procesos repetitivos en laboratorio: tareas como clasificación de piezas o colocación de componentes pueden automatizarse mediante demostración, sin programación explícita.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede usarse como asistente que completa movimientos parciales iniciados por un operador humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluación en robot real ni métricas de éxito. No existen datos de MMLU, HumanEval u otros benchmarks, ya que se trata de un modelo de política robótica y no de un LLM. Se recomienda al usuario ejecutar sus propias evaluaciones en el robot para determinar la tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al procesar imágenes de 720×1280, se recomienda al menos 4 GB de VRAM en GPU. Con cuantización o reducción de resolución podría funcionar con 2 GB, pero no está documentado.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para entrenamiento; para inferencia, una GTX 1650 o similar podría ser suficiente si se reduce la resolución de imagen.
- Compatibilidad con GPU de consumo: sí, el modelo es pequeño (51,7 M de parámetros) y cabe en cualquier GPU moderna, incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que proporciona los comandos `lerobot-rollout` para inferencia en el robot. No se menciona soporte para vLLM, Ollama o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende del hardware y de la resolución de entrada; con una GPU media se espera una frecuencia de control de al menos 10-30 Hz, suficiente para tareas de manipulación lenta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Resultados |
|---|---|---|---|---|---|
| `brian564237/act-block-bowl` (este) | ACT + CVAE | 51,7 M | Block-bowl (SO-101) | Apache 2.0 | Sin evaluación publicada |
| ACT original (Zhao et al., 2023) | ACT + CVAE | ~80 M (configuración típica) | Varias tareas de manipulación | MIT (paper) | Tasas de éxito del 80-100% en entornos simulados y reales |
| Diffusion Policy (Chi et al., 2023) | Diffusion sobre acciones | Variable | Manipulación y navegación | MIT | Tasas de éxito altas en benchmarks estándar |

No se dispone de comparaciones cuantitativas directas con estos modelos en la misma tarea y hardware. El modelo de este repositorio es una implementación concreta de ACT sobre LeRobot, con un tamaño menor al típico y entrenamiento breve (3.000 pasos). Los autores del paper ACT reportan mejores resultados con más datos y pasos de entrenamiento.

## Limitaciones y advertencias

- Sin evaluación verificada: no hay resultados de éxito en robot real; el modelo podría no completar la tarea de forma fiable.
- Dataset de entrenamiento pequeño: solo 50 episodios, lo que limita la generalización a variaciones de posición, iluminación o texturas.
- Tarea específica: el modelo está entrenado para un único escenario (block-bowl) y no es transferible a otras tareas sin reentrenamiento completo.
- Dependencia del hardware: el comportamiento está calibrado para el robot SO-101 y la cámara frontal; cambios en la configuración pueden degradar el rendimiento.
- Riesgo de alucinación motora: como todo modelo de imitación, puede generar movimientos no seguros si las observaciones difieren del dominio de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el código subyacente de LeRobot y las dependencias tienen sus propias licencias (principalmente Apache 2.0 también).
- Formato de pesos: solo safetensors; no se ofrecen versiones cuantizadas ni compatibilidad con otros runtimes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/brian564237/act-block-bowl)
- [Dataset de entrenamiento](https://huggingface.co/datasets/brian564237/so101-block-bowl-test)
- [Paper ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot sobre ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Perfil del autor en Hugging Face](https://huggingface.co/brian564237)
