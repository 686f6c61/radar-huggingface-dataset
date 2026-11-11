# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164485

## Resumen

`diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164485` es una política de imitación visuomotora entrenada con LeRobot y basada en Diffusion Policy (arXiv:2303.04137), un método que modela el control visuomotor como un proceso generativo de difusión para producir trayectorias de acción suaves y multimodales. El modelo lo publica el usuario `castanetnicolas` en Hugging Face y está orientado a una tarea concreta de ensamblaje robótico: insertar una primera pieza en una base e insertar una segunda pieza encima.

No es un modelo de lenguaje: es un checkpoint de robótica (pipeline `robotics`, librería `lerobot`) de 278.014.699 parámetros que consume estado propioceptivo de 9 dimensiones y dos imágenes RGB de 84x84 píxeles (`agentview` y `robot0_eye_in_hand`), y emite un vector de acción de 7 dimensiones. Su relevancia es la de un ejemplo reproducible de entrenamiento de Diffusion Policy con datos MimicGen para manipulación rica en contactos.

El entrenamiento se realizó sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image84` (200 episodios, 67.101 frames a 20 FPS) durante 300.000 pasos con batch de 32 y optimizador Adam a una tasa de aprendizaje de 1e-4. La model card no incluye resultados de evaluación en robot real ni métricas de éxito, por lo que su rendimiento efectivo no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa por difusión, LeRobot) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; observación por frame, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy: en lugar de regresar directamente una acción, aprende a generar la secuencia de acciones como un proceso de difusión condicionado por las observaciones (estado de 9 dimensiones e imágenes de 84x84 de cámara de agente y de muñeca). Este enfoque produce trayectorias multimodales y suaves, adecuadas para tareas de manipulación con contactos ricos, como el ensamblaje de piezas. La model card no detalla el número de pasos de difusión, la arquitectura exacta del denoiser (típicamente una CNN o transformer condicionado) ni la composición de la red más allá del recuento de parámetros.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 200 episodios (67.101 frames a 20 FPS) del dataset MimicGen `three_piece_assembly`, con 300.000 pasos, batch de 32, optimizador Adam, learning rate 1e-4 y semilla 1000. La tarea es «Insert the first piece into the base, then insert the second piece on top of it». No se documenta uso de RLHF/DPO ni aumentos de datos más allá de lo que sugiere el sufijo `aug3` en el nombre del checkpoint (no confirmado en la model card).

## Capacidades

- Control visuomotor de manipulación robótica a partir de dos cámaras RGB y estado propioceptivo.
- Generación de trayectorias de acción multimodales y suaves mediante difusión, útil en tareas con contactos.
- Ejecución de una tarea específica de ensamblaje de dos piezas sobre una base (three-piece assembly).
- Entrada de estado de 9 dimensiones y salida de acción de 7 dimensiones (típico de un brazo de 6 DoF más pinza).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de lenguaje.
- No dispone de capacidades multilingües, visión general, audio ni modo «thinking».

## Casos de uso

- Ensamblaje de precisión en línea de montaje: la política ejecuta la inserción secuencial de dos piezas sobre una base, tarea con contactos que se beneficia de la generación de trayectorias suaves de Diffusion Policy.
- Investigación en imitación visuomotora: sirve como checkpoint de referencia para reproducir y comparar variantes de Diffusion Policy con LeRobot sobre datos MimicGen.
- Benchmark de manipulación con contactos: permite evaluar tasas de éxito en una tarea de ensamblaje estandarizada y comparar con otras políticas (ACT, VQ-BeT, etc.).
- Prototipado rápido en laboratorio: con `lerobot-rollout` y un robot Panda/UR5e configurado con las cámaras `agentview` y `robot0_eye_in_hand`, se puede desplegar en minutos para validar el pipeline.
- Generación de datos sintéticos y aumento: el dataset MimicGen asociado y la política pueden usarse para estudiar transferencia sim-a-real en tareas de ensamblaje.
- Docencia y formación en robótica de imitación: ejemplo completo y reproducible de entrenamiento (300k pasos, batch 32) y despliegue con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet».

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M de parámetros en FP32 el peso ronda 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (8-12 GB) junto con el resto del pipeline.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 3060/4070 o superior es suficiente para inferencia; para entrenamiento con batch 32 y 300k pasos se recomienda una GPU con al menos 16-24 GB (RTX 4090, A100, H100) según resolución y aumentos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Diffusion Policy, LeRobot) | 278 M | Estado 9 + 2 imagenes 84x84 | Ensamblaje de tres piezas | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación diversa | típicamente apache-2.0 | Hugging Face |
| ACT (Action Chunking Transformer) en LeRobot | no disponible | no disponible | Manipulación por imitación | típicamente apache-2.0 | Hugging Face |
| VQ-BeT en LeRobot | no disponible | no disponible | Manipulación por imitación | típicamente apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot.
- Es una política específica de tarea y de configuración de robot; no generaliza a otras tareas ni a otros montajes sin reentrenamiento.
- Depende de la correspondencia exacta de nombres y calibración de cámaras (`agentview`, `robot0_eye_in_hand`) y del estado de 9 dimensiones; un desajuste invalida el despliegue.
- Entrenada con 200 episodios y 67.101 frames; puede ser sensible a cambios de iluminación, posiciones de objetos o distracciones no presentes en el dataset.
- Riesgo de sobreajuste al simulador MimicGen y brecha sim-a-real no cuantificada.
- La model card menciona robot type `panda` aunque el nombre del checkpoint alude a UR5e; conviene verificar la correspondencia real antes de desplegar.
- Licencia apache-2.0 permite uso comercial, pero sin garantías de idoneidad para producción.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código ni tareas cognitivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_aug3_ID_164485
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
