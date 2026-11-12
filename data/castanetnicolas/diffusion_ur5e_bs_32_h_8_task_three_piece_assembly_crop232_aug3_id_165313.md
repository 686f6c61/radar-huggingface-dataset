# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_165313

## Resumen

El modelo `castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_165313` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy y distribuida a través de la librería LeRobot de Hugging Face. Lo desarrolla el usuario castanetnicolas y resuelve una tarea concreta de manipulación robótica: insertar dos piezas en una base dentro de un entorno de ensamblaje tipo MimicGen. No es un modelo de lenguaje: es una política de imitación que mapea observaciones (estado del robot e imágenes de dos cámaras) a acciones de 7 dimensiones.

La arquitectura subyacente es Diffusion Policy, que trata el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción suaves y multimodales, adecuadas para tareas con contacto rico. El checkpoint contiene 278.014.919 parámetros en formato safetensors y ocupa 1,1 GB en el repositorio. Se entrenó sobre 220 episodios y 73.864 fotogramas a 20 FPS del dataset `mimicgen_three_piece_assembly_d1_image256`.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible para la tarea de ensamblaje de tres piezas, con licencia Apache 2.0 y sin resultados de evaluación publicados. Resulta útil como referencia para reproducir el pipeline de LeRobot o como punto de partida para fine-tuning en robots Panda, pero no como componente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 8 pasos según el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir una única acción de forma determinista, el modelo aprende a denoizar una secuencia de acciones condicionada por las observaciones. Esto permite representar distribuciones multimodales de comportamiento y generar trayectorias suaves y coherentes, lo que resulta especialmente útil en tareas de manipulación con contacto rico como el ensamblaje de piezas. La política consume un vector de estado de 9 dimensiones y dos imágenes RGB de 256x256 (`agentview` y `robot0_eye_in_hand`), y produce una acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` (220 episodios, 73.864 fotogramas, 20 FPS). La configuración registrada incluye 300.000 pasos, batch size 32, optimizador Adam, learning rate 1e-4 y semilla 1000. El nombre del checkpoint sugiere un horizonte de predicción de 8 pasos (`H_8`) y un recorte de imagen a 232 píxeles (`crop232`) con aumentación (`aug3`), aunque estos detalles no se documentan explícitamente en la model card. No se indica si hubo RLHF, DPO ni fine-tuning posterior; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control visuomotor para una tarea concreta de ensamblaje: insertar la primera pieza en la base y después la segunda encima.
- Generación de trayectorias de acción multimodales y suaves mediante difusión, adecuadas para manipulación con contacto.
- Fusión de estado propioceptivo (9 dimensiones) con dos vistas de cámara (exterior y ojo en la mano).
- Ejecución en bucle cerrado sobre un robot Panda mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, visión general, audio ni modo de pensamiento.
- No es un modelo generalista: su competencia está limitada a la distribución de la tarea entrenada.

## Casos de uso

- Reproducción de la tarea de ensamblaje de tres piezas: ejecutar la política sobre un robot Panda con dos cámaras configuradas como `agentview` y `robot0_eye_in_hand` para validar el pipeline de LeRobot de extremo a extremo.
- Baseline para investigación en imitación: servir como referencia de Diffusion Policy en tareas de contacto rico y comparar frente a otros algoritmos (ACT, VQ-BeT) sobre el mismo dataset.
- Fine-tuning sobre datos propios: reentrenar la política con `lerobot-train` sobre un dataset propio de ensamblaje para adaptar el comportamiento a nuevas piezas o posiciones.
- Generación de datos sintéticos de evaluación: usar las trayectorias generadas para estudiar la robustez frente a cambios de iluminación o posiciones de objetos en simulación.
- Docencia y formación en robótica: ejemplo reproducible de aprendizaje por imitación con difusión para cursos y talleres.
- Integración en pipelines de simulación MimicGen: evaluar la política en entornos simulados antes de transferirla a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros en fp32, el peso ronda 1,1 GB, por lo que una GPU consumer con 8 GB debería ser suficiente para inferencia en fp32.
- GPU recomendadas: no especificadas; cualquier GPU NVIDIA con CUDA y al menos 8 GB de VRAM es razonable para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` sobre el robot Panda; el entrenamiento se realiza con `lerobot-train --policy.device=cuda`.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Diffusion Policy, ensamblaje 3 piezas) | 278 M | Ensamblaje de tres piezas en Panda | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy original (Cheng et al., 2023) | no disponible | Manipulación visuomotora general | no disponible | Paper y código en el repositorio original |
| Políticas ACT de LeRobot | no disponible | Imitación visuomotora | Apache 2.0 (LeRobot) | Hugging Face Hub |
| Políticas VQ-BeT de LeRobot | no disponible | Imitación visuomotora | Apache 2.0 (LeRobot) | Hugging Face Hub |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de una única tarea: solo se ha entrenado para "Insert the first piece into the base, then insert the second piece on top of it".
- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce su robustez.
- Dependencia estricta de las cámaras y del robot: los nombres y la configuración de las cámaras deben coincidir con las observaciones de entrenamiento (`agentview`, `robot0_eye_in_hand`).
- Posible sobreajuste a la distribución del dataset MimicGen: cambios de iluminación, posiciones de objetos o un robot distinto pueden degradar el rendimiento.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de generar acciones inválidas fuera de la distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre del checkpoint incluye parámetros (`crop232`, `aug3`, `H_8`) que no están documentados en la model card, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_165313
- Dataset: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
