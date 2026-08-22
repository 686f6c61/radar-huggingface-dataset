# masondx/diff_new_tension_cut_rope_highq_zero

## Resumen

El modelo `masondx/diff_new_tension_cut_rope_highq_zero` es un policy de control visuomotor basado en Diffusion Policy, entrenado con el framework LeRobot. Diffusion Policy (publicado en el paper arXiv:2303.04137) modela el control de robots como un proceso generativo de difusión que produce trayectorias de acción suaves y multi-paso, especialmente adecuadas para tareas de manipulación que requieren contacto físico, como cortar una cuerda bajo tensión. El modelo ha sido entrenado sobre el dataset `masondx/new_tension_cut_rot_zero` y publicado bajo licencia Apache 2.0. Con 275,7 millones de parámetros y un tamaño de repositorio de 1,1 GB, está diseñado para ejecutarse en robots tipo SO-100 (follower) y se integra con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.

Este modelo no es un LLM ni un modelo de visión general: es un policy de difusión para robótica, lo que significa que su entrada es una observación del estado (imágenes y/o estados del robot) y su salida es una secuencia de acciones. Su relevancia actual radica en la creciente adopción de Diffusion Policy para tareas de manipulación de precisión, y en su publicación como modelo abierto y reproducible dentro del framework LeRobot, lo que permite a la comunidad robótica replicar y adaptar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (CNN + MLP, basada en el paper 2303.04137) |
| Parametros totales | 275.762.164 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precision float32) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1.1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Diffusion Policy, que trata el control visuomotor como un proceso de difusión denoising. Dado un estado observado (imágenes y/o estados de articulaciones), el modelo genera una secuencia de acciones futuras (por ejemplo, 16 pasos) mediante un proceso iterativo de denoising. Esto produce trayectorias suaves y coherentes, evitando los problemas de no suavidad típicos de los policies de un solo paso. La implementación está realizada con LeRobot, que proporciona el pipeline de entrenamiento y evaluación.

No se dispone de detalles sobre el dataset de entrenamiento (número de episodios, composición exacta, si se usó RLHF o DPO). El dataset asociado es `masondx/new_tension_cut_rot_zero`, cuyo contenido específico no está documentado en la model card. El entrenamiento se realizó con la librería LeRobot, que utiliza PyTorch y soporta entrenamiento en GPU con CUDA.

## Capacidades

- Control visuomotor: el modelo toma imágenes de una cámara y/o estados de articulaciones como entrada y produce acciones de control para el robot.
- Generación de trayectorias multi-paso: genera secuencias de acciones (típicamente 16 pasos) que permiten un movimiento suave y coordinado.
- Manipulación con contacto: diseñado para tareas que requieren contacto físico, como cortar una cuerda bajo tensión.
- Integración con LeRobot: puede ser cargado y ejecutado con las herramientas de LeRobot (`lerobot-record`, `lerobot-train`).
- No tiene capacidades de lenguaje, tool calling, ni razonamiento simbólico.

## Casos de uso

- **Manipulación de cables y cuerdas**: el modelo puede controlar un brazo robótico para cortar una cuerda tensada, tarea que requiere precisión y manejo de contacto.
- **Tareas de ensamblaje de precisión**: por su naturaleza de difusión, es adecuado para insertar piezas, atornillar o realizar ajustes que requieren múltiples pasos de acción.
- **Investigación en aprendizaje por demostración**: sirve como base para estudiar cómo los policies de difusión se comportan en tareas de contacto, comparándolos con otras arquitecturas.
- **Evaluación de políticas robóticas**: se puede cargar en un robot real (tipo SO-100) para evaluar su rendimiento en episodios reales usando `lerobot-record`.
- **Transferencia de políticas**: los usuarios pueden partir de este checkpoint para fine-tune en tareas similares, gracias a la licencia Apache 2.0.
- **Educación en robótica**: permite a estudiantes e investigadores reproducir un pipeline completo de entrenamiento de Diffusion Policy con LeRobot sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas, métricas de precisión o comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no hay datos publicados. Dado el tamaño de 275M parámetros y 1,1 GB de pesos en float32, se estima que la inferencia en batch pequeño puede requerir entre 2 y 4 GB de VRAM (por ejemplo, en una GPU como RTX 3060 o superior).
- **GPU recomendadas**: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (e.g., GTX 1660, RTX 2060, RTX 3060, A10, L4). Para entrenamiento se recomienda al menos 8 GB.
- **¿Cabe en GPU consumer?** Sí, una GPU de gama media (RTX 3060 12GB) es suficiente para inferencia y entrenamiento de tamaño moderado.
- **Opciones de despliegue**: el modelo está diseñado para usarse con LeRobot, que soporta ejecución en GPU con PyTorch. No se ha documentado integración con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. Dependen de la GPU y del número de pasos de denoising (típicamente 10-100 iteraciones).

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de Diffusion Policy para la misma tarea (corte de cuerda). No hay datos de rendimiento comparables. La comparativa general con otras arquitecturas de control robótico (como ACT, VAE, etc.) no está documentada en la información disponible.

## Limitaciones y advertencias

- **Especialización**: el modelo está entrenado para una tarea concreta (corte de cuerda con tensión) y no es generalizable a otras tareas sin reentrenamiento.
- **Riesgo de sobreajuste**: al no disponer de detalles del dataset, es posible que el modelo esté sobreajustado a las condiciones específicas de captura (iluminación, posición de cámara, tipo de robot).
- **Alucinación**: no aplica, al no ser un modelo de lenguaje.
- **Sesgos**: el dataset puede contener sesgos de la configuración física del robot y del entorno de entrenamiento; no hay evaluación de sesgos publicada.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe atribuir y mantener los avisos de copyright.
- **Producción**: para uso en producción es necesario validar el rendimiento en el robot real, ya que no se han reportado métricas de éxito.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/masondx/diff_new_tension_cut_rope_highq_zero)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
