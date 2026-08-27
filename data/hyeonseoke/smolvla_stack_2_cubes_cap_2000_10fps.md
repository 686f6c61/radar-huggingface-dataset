# HyeonseokE/smolvla_stack_2_cubes_cap_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_stack_2_cubes_cap_2000_10fps`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de apilado de dos cubos, grabado a 10 FPS con un robot tipo `so101_follower`. El modelo fue entrenado con la librería LeRobot y publica sus pesos en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve una tarea de manipulación robótica concreta: apilar un cubo verde sobre un cubo rojo a partir de instrucciones en lenguaje natural y observaciones visuales de dos cámaras. Con 450 millones de parámetros, es una de las implementaciones más ligeras de un VLA, lo que permite su despliegue en GPUs de gama media sin sacrificar la capacidad de razonamiento visual-lingüístico. Su relevancia radica en demostrar que los modelos de control robótico pueden ser entrenados y ejecutados de forma accesible, sin necesidad de infraestructura de alto coste.

El repositorio incluye la configuración completa de entrenamiento (29 050 pasos, batch de 64, learning rate de 1e-4) y los scripts de inferencia mediante LeRobot, lo que facilita la reproducción y la adaptación a otros entornos robóticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + action expert con flow matching) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (la tarea está en inglés, pero no se especifica soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado y compacto con un "action expert" entrenado mediante *flow matching*. Dado un conjunto de imágenes y una instrucción en lenguaje natural, el modelo genera un fragmento de acciones (action chunk) que controla el robot. Esta arquitectura permite aprovechar el conocimiento visual y lingüístico de modelos preentrenados a gran escala sin necesidad de entrenar desde cero.

Este repositorio concreto es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `HyeonseokE/stack_2_cubes_cap_10fps`, que contiene 100 episodios y 37 245 fotogramas de demostraciones de apilado de cubos. El entrenamiento se realizó con LeRobot 0.6.0, usando el optimizador AdamW con una tasa de aprendizaje de 1e-4, un tamaño de lote de 64 y una semilla de 2000, durante 29 050 pasos. Las observaciones incluyen el estado del robot (6 dimensiones) y tres imágenes de cámaras (aunque la model card menciona dos cámaras físicas: `top` y `left_wrist`), y la salida es una acción de 6 grados de libertad.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un robot tipo `so101_follower`.
- Percepción visual multi-cámara: procesa imágenes de hasta tres cámaras (resolución 256x256) para guiar la manipulación.
- Comprensión de instrucciones en lenguaje natural: interpreta la tarea "Stack the green block on the red block" y ejecuta la secuencia de acciones correspondiente.
- Generación de fragmentos de acciones (action chunking): produce secuencias de acciones de forma autoregresiva, lo que mejora la fluidez del movimiento.
- Entrenamiento por imitación: aprende de demostraciones humanas o teleoperadas, sin necesidad de recompensas explícitas.
- Inferencia asíncrona: la arquitectura SmolVLA incluye un stack de inferencia asíncrona que aumenta la tasa de control efectiva.

## Casos de uso

- Automatización de tareas de apilado en entornos de laboratorio: el modelo puede controlar un brazo robótico para apilar objetos de forma fiable, útil en investigación de manipulación.
- Prototipado rápido de políticas robóticas: al ser un fine-tune ligero, permite validar algoritmos de aprendizaje por imitación en hardware de consumo antes de escalar a modelos mayores.
- Educación en robótica: estudiantes pueden desplegar el modelo en un robot de bajo coste para aprender sobre VLA, *flow matching* y control basado en visión.
- Benchmarking de VLA en tareas de precisión: sirve como referencia para comparar el rendimiento de modelos compactos frente a alternativas más grandes en tareas de manipulación.
- Integración en pipelines de LeRobot: el modelo se puede cargar directamente con `lerobot-rollout` para ejecutar la política en un robot real, facilitando la experimentación reproducible.
- Investigación en generalización de tareas: al ser un fine-tune específico, puede usarse como punto de partida para estudiar técnicas de adaptación a nuevas tareas o entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales, pero con 450 millones de parámetros en precisión fp32 se necesitarían aproximadamente 1,8 GB de VRAM solo para los pesos; en fp16, alrededor de 0,9 GB. Sin embargo, el modelo no se distribuye en formatos cuantizados, por lo que se recomienda al menos 4 GB de VRAM para inferencia con margen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. SmolVLA está diseñado para hardware de consumo.
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos principales del modelo base.
- Opciones de despliegue: LeRobot (oficial), con soporte para inferencia en tiempo real mediante `lerobot-rollout`. También se puede integrar en frameworks de robótica que usen PyTorch.
- Latencia y throughput: no disponibles. El paper de SmolVLA menciona un stack de inferencia asíncrona para mejorar la tasa de control, pero no se dan cifras concretas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_stack_2_cubes_cap_2000_10fps | 450M | No disponible | Apilado de cubos | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (aprox.) | No disponible | Base general VLA | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | No disponible | Manipulación general | MIT | Hugging Face |

SmolVLA se posiciona como una alternativa mucho más ligera que OpenVLA (7B), con un coste computacional significativamente menor y apta para hardware de consumo. Sin embargo, este fine-tune concreto está especializado en una única tarea, mientras que OpenVLA ofrece mayor generalidad. No se dispone de benchmarks comparativos entre ambos en esta tarea específica.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado únicamente para apilar un cubo verde sobre uno rojo; no generaliza a otras tareas u objetos sin un nuevo fine-tune.
- Sin evaluación publicada: no hay métricas de éxito en el mundo real, por lo que su fiabilidad en producción no está verificada.
- Riesgo de sobreajuste: entrenado con solo 100 episodios, puede fallar ante variaciones de iluminación, posición de objetos o distracciones no presentes en el dataset.
- Dependencia de la configuración de cámaras: las observaciones requieren exactamente las mismas cámaras y disposición que en el entrenamiento; cambios en la calibración degradan el rendimiento.
- Idiomas limitados: no se especifica soporte multilingüe; la instrucción está en inglés y probablemente el modelo solo entienda ese idioma.
- Licencia permisiva pero sin garantías: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías de rendimiento o seguridad en entornos reales.
- Requisitos de sincronización: la inferencia en tiempo real requiere una configuración cuidadosa de las cámaras y del robot para evitar latencias que rompan el control.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_cap_2000_10fps
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Versión HTML del paper: https://arxiv.org/html/2506.01844v1
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/stack_2_cubes_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
