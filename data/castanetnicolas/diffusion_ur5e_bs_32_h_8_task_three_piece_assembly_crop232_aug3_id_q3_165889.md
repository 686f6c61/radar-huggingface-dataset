# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q3_165889

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el método Diffusion Policy, una aproximación que trata el control robótico como un proceso generativo de difusión. En lugar de predecir una única acción de forma determinista, el modelo genera trayectorias de acción multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto rico. Lo publica el usuario castanetnicolas mediante la librería LeRobot de Hugging Face, y está pensado para ejecutarse sobre un brazo robótico tipo panda/UR5e en la tarea concreta de ensamblaje de tres piezas.

El modelo no es un LLM ni un modelo de lenguaje: es una política de imitación (imitation learning) que consume observaciones del robot (estado articular de 9 dimensiones y dos cámaras RGB de 256×256) y produce un vector de acción de 7 dimensiones. Su relevancia es acotada y experimental: se trata de un checkpoint de investigación con 278 millones de parámetros, entrenado sobre un dataset MimicGen de 220 episodios y 73.864 frames a 20 FPS, sin resultados de evaluación publicados.

Conviene subrayar que el identificador del repositorio menciona UR5e mientras que la model card declara `robot type: panda`, y que el nombre incluye parámetros de entrenamiento (BS_32, H_8, crop232, aug3, ID_q3) que no están documentados en la ficha. Es, por tanto, un artefacto de experimentación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión, implementada en LeRobot) |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el paradigma Diffusion Policy descrito en el paper arXiv:2303.04137: el control visuomotor se modela como un proceso de difusión generativo que produce trayectorias de acción de varios pasos. La entrada combina `observation.state` con forma `(9,)` y dos flujos visuales `observation.images.agentview` y `observation.images.robot0_eye_in_hand`, ambos de `(3, 256, 256)`. La salida es un vector `action` de `(7,)`. El nombre del checkpoint sugiere un horizonte de predicción de 8 pasos (`H_8`), batch size 32 y algún tipo de recorte/aumento de imagen (`crop232`, `aug3`), aunque estos detalles no se documentan en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con optimizador Adam, learning rate 0,0001, batch size 32 y semilla 1000. El dataset es `castanetnicolas/mimicgen_three_piece_assembly_d1_image256`, con 220 episodios, 73.864 frames y 20 FPS, correspondiente a la tarea "Insert the first piece into the base, then insert the second piece on top of it". No se especifica el número total de tokens ni composición del dataset más allá de estas cifras, ni si hubo RLHF/DPO (no aplica en este paradigma). No se documentan innovaciones técnicas adicionales más allá del propio método Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para control robótico de manipulación.
- Ejecución de una tarea concreta de ensamblaje de tres piezas sobre un brazo robótico.
- Procesamiento de observaciones visuales desde dos cámaras (vista externa `agentview` y vista de muñeca `robot0_eye_in_hand`).
- Fusión de estado propioceptivo (9 dimensiones) con información visual.
- Control a 20 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales fuera del control visuomotor.

## Casos de uso

- Ensamblaje de precisión en línea de montaje: el modelo ejecuta la secuencia "insertar la primera pieza en la base e insertar la segunda encima", adecuado por su entrenamiento específico en esa tarea con contacto rico.
- Investigación en imitation learning: sirve como checkpoint de referencia para reproducir experimentos de Diffusion Policy con LeRobot sobre datasets MimicGen.
- Benchmarking de políticas visuomotoras: permite comparar variantes de hiperparámetros (batch size, horizonte, aumentos) frente a otros checkpoints del mismo autor.
- Prototipado de pipelines de robot learning: útil para validar el flujo `lerobot-train` → `lerobot-rollout` antes de escalar a tareas propias.
- Docencia y demostraciones de robótica: ejemplo funcional de política de difusión entrenada con datos sintéticos de MimicGen sobre un brazo tipo panda/UR5e.
- Generación de datos aumentados: las trayectorias generadas pueden emplearse para estudiar la variabilidad del modelo en tareas de ensamblaje con contacto.
- Evaluación de robustez ante cambios de cámara o iluminación: al depender de dos vistas RGB de 256×256, permite analizar sensibilidad a perturbaciones visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parámetros en safetensors (fp32) el peso ronda 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del pipeline de LeRobot y de los dos flujos de imagen de 256×256.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política, y para entrenamiento se recomienda una GPU con CUDA (el comando de ejemplo usa `--policy.device=cuda`).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 o superiores, aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el dataset opera a 20 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (castanetnicolas, Diffusion Policy, three_piece_assembly) | 278 M | Horizonte 8 (según nombre del checkpoint, no confirmado) | Ensamblaje de tres piezas, robot panda/UR5e | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot Diffusion Policy | no disponible | no disponible | Varía por dataset | Apache 2.0 habitualmente | Hugging Face (hub LeRobot) |
| ACT (Action Chunking Transformer) en LeRobot | no disponible | no disponible | Manipulación por imitación | Apache 2.0 habitualmente | Hugging Face (hub LeRobot) |
| π0 / políticas VLA de gran escala | no disponible | no disponible | Control generalista | varía | varía |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- Entrenada para una única tarea ("Insert the first piece into the base, then insert the second piece on top of it") y un único tipo de robot; no generaliza a otras tareas sin reentrenamiento.
- Posible inconsistencia entre el nombre del repositorio (UR5e) y la model card (`robot type: panda`); conviene verificar la plataforma antes de desplegar.
- Depende de dos cámaras con nombres y calibración específicos (`agentview`, `robot0_eye_in_hand`); cambios de montaje, iluminación o resolución pueden degradar el comportamiento.
- Riesgo de alucinación en el sentido de generar trayectorias plausibles pero incorrectas en estados fuera de distribución; no hay mecanismo de verificación interno.
- Sesgos conocidos: no documentados; al entrenarse con datos MimicGen sintéticos, puede heredar sesgos de la simulación y del proceso de generación de datos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación previa.
- 0 descargas y 0 likes en el momento de la consulta: es un artefacto experimental sin validación por parte de la comunidad.
- No aplica a tareas de lenguaje, código, matemáticas ni visión general; su ámbito es exclusivamente el control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop232_aug3_ID_q3_165889
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
