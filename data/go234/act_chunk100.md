# go234/act_chunk100

## Resumen

`go234/act_chunk100` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), implementada en la librería LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación concreta mediante aprendizaje por imitación: coger un cubo y depositarlo en una caja. No es un modelo de lenguaje ni un modelo de propósito general; es una política visuomotora específica para un robot de tipo `so_follower` equipado con dos cámaras.

El modelo consume observaciones compuestas por el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51,67 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto, incluyendo GPUs de consumo.

Es relevante como ejemplo práctico del flujo de trabajo de LeRobot 0.6.0 para entrenamiento de políticas robóticas con datos teleoperados: 50 episodios, 24.423 fotogramas a 30 FPS y 100.000 pasos de entrenamiento. Su licencia Apache 2.0 facilita la reutilización y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones por chunks |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como prompt de texto fijo: "Pick up the cube and put it in the box.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y facilita movimientos suaves. La arquitectura combina un codificador visual (procesa `observation.images.cam1` y `cam2`, ambas 3x480x640), un codificador del estado propioceptivo (`observation.state`, 6 dimensiones) y un transformador que genera secuencias de acciones (`action`, 6 dimensiones). El nombre `act_chunk100` sugiere un tamaño de chunk de 100, aunque este dato no se confirma explícitamente en la model card.

El entrenamiento se realizó sobre el dataset `go234/cube-box_20261013_041703`, con 50 episodios y 24.423 fotogramas a 30 FPS, todos correspondientes a la tarea "Pick up the cube and put it in the box." La configuración reportada incluye 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.0. No se documentan detalles sobre aumentación de datos, composición exacta del dataset ni técnicas de regularización.

## Capacidades

- Control visuomotor para una tarea de manipulación concreta: coger un cubo y colocarlo en una caja.
- Procesamiento de dos flujos de imagen RGB (480x640) simultáneos como entrada visual.
- Lectura del estado articular del robot (6 dimensiones) como entrada propioceptiva.
- Generación de acciones continuas de 6 dimensiones por chunk (predicción por tramos, no paso a paso).
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-rollout`.
- Aprendizaje por imitación a partir de datos teleoperados.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia de coger un cubo y depositarlo en una caja sobre un robot `so_follower`, útil como base para tareas de clasificación de objetos pequeños.
- Prototipado rápido de políticas robóticas: sirve como referencia de flujo LeRobot (grabación de datos, entrenamiento y despliegue) para equipos que quieran validar su pipeline antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT con un dataset público y comparar configuraciones de chunking o aumentación.
- Benchmark de hardware robótico: al ser un modelo de 51,7 M de parámetros y 0,2 GB, es adecuado para medir latencia de inferencia en distintas GPUs o incluso en CPU.
- Educación y demostraciones: ejemplo didáctico de entrenamiento de una política visuomotora con dos cámaras y estado articular de 6 dimensiones.
- Base para fine-tuning en tareas similares: con Apache 2.0, puede adaptarse a otras tareas de manipulación con datasets propios mediante `lerobot-train`.
- Validación de calibración de cámaras y robots: el hecho de que las claves de observación deban coincidir estrictamente (`cam1`, `cam2`) lo convierte en una prueba de integración del sistema de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB (asumiendo fp32) o menos en fp16/bf16. La memoria adicional depende del tamaño de las dos imágenes de entrada (480x640x3) y de los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; se puede ejecutar en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin problemas de capacidad, aunque el rendimiento en tiempo real dependerá de los requisitos de control.
- Cabe en GPU de consumo: sí, prácticamente en cualquier GPU de consumo moderna.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para PyTorch y CUDA (`--policy.device=cuda`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamaño de chunk y de la frecuencia de control del robot (30 FPS según el dataset).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `go234/act_chunk100` | 51.668.614 | Estado 6D + 2 imágenes 480x640 | Apache 2.0 | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (genéricas) | variable (típicamente decenas de millones) | Estado + cámaras según robot | Apache 2.0 | Hugging Face, LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable (mayor que ACT habitualmente) | Estado + cámaras | Apache 2.0 | Hugging Face, LeRobot |
| Políticas VQ-BeT / otros métodos de IL | variable | Estado + cámaras | variable según repo | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo (tasas de éxito, tiempos de convergencia) en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: solo está entrenado para la tarea "Pick up the cube and put it in the box." y para el robot `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni análisis de robustez; se desconoce su fiabilidad en condiciones distintas a las del dataset.
- Dependencia estricta de la configuración de percepción: las cámaras deben llamarse `cam1` y `cam2` y respetar las resoluciones de entrenamiento (480x640, 30 FPS). Cambios en la iluminación, la posición de las cámaras o el robot degradarán el rendimiento.
- Dataset pequeño: 50 episodios y 24.423 fotogramas son suficientes para una tarea simple, pero limitan la diversidad de posiciones, objetos y condiciones.
- Riesgo de sobreajuste al entorno de entrenamiento: no se documentan técnicas de aumentación ni validación cruzada.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no debe integrarse en pipelines que esperen un LLM.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia y cumplimiento de las normas de seguridad robótica aplicables.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/go234/act_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
