# castanetnicolas/diffusion_UR5e_BS_64_H_16_TASK_tool_hang_crop232_aug3_ID_q5_164510

## Resumen

`diffusion_UR5e_BS_64_H_16_TASK_tool_hang_crop232_aug3_ID_q5_164510` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante LeRobot. El modelo resuelve una tarea concreta de manipulación robótica contact-rich (contacto intenso): insertar un gancho en una base para construir un marco y colgar una llave inglesa en el gancho. Lo desarrolla el usuario `castanetnicolas` como artefacto de investigación reproducible, no como modelo de propósito general.

Técnicamente no es un LLM, sino una red de difusión condicionada por observaciones (estado articular de 9 dimensiones más dos cámaras RGB de 256×256) que genera secuencias de acciones de 7 dimensiones. Tiene 278.014.919 parámetros (dato real de los safetensors) y un repo de 1,1 GB. Se entrenó con 200 episodios y 95.962 fotogramas a 20 FPS sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`.

Es relevante como ejemplo práctico de imitation learning con Diffusion Policy sobre robots tipo Panda/UR5e, útil para quien quiera reproducir el pipeline de LeRobot 0.6.1, evaluar generalización en tareas de ensamblaje o servir de base para fine-tuning en manipulación con contacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para control visuomotor) sobre LeRobot |
| Parámetros totales | 278.014.919 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción H=16 según el nombre del repo) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso generativo: en lugar de predecir una acción puntual, el modelo aprende a denoizar una trayectoria de acciones de varios pasos condicionada por las observaciones. La entrada son `observation.state` (9 dimensiones), `observation.images.sideview` (3×256×256) y `observation.images.robot0_eye_in_hand` (3×256×256); la salida es `action` (7 dimensiones). El nombre del repositorio sugiere un horizonte de predicción de 16 pasos, batch size 64 y un crop de 232 píxeles con aumentación (`aug3`), aunque estos detalles no se detallan en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, optimizador Adam, learning rate 1e-4, batch size 64 y semilla 1000, sobre 200 episodios (95.962 fotogramas a 20 FPS) del dataset `robomimic_tool_hang_ph_image256`. La tarea es «Insert the hook into the base to build a frame, then hang the wrench on the hook». No se documenta RLHF, DPO ni ningún proceso de ajuste posterior; es aprendizaje por imitación puro supervisado con demostraciones.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación robótica contact-rich.
- Control visuomotor a partir de dos cámaras RGB (vista lateral y cámara en la muñeca) más estado articular.
- Ejecución de la tarea específica de ensamblaje: insertar gancho y colgar llave inglesa.
- Integración con el stack LeRobot (`lerobot-rollout`, `lerobot-train`) y con robots tipo Panda.
- No soporta tool calling, function calling ni razonamiento multi-step simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales fuera del control motor.

## Casos de uso

- Reproducción de investigación en Diffusion Policy: ejecutar la política con `lerobot-rollout` sobre un Panda para validar el pipeline completo de LeRobot 0.6.1 y comparar curvas de éxito en la tarea tool_hang.
- Benchmark de manipulación contact-rich: usar la tarea de insertar gancho y colgar llave como referencia para medir robustez frente a posiciones iniciales, iluminación y distractores.
- Base para fine-tuning: partir de estos pesos (278 M parámetros, apache-2.0) y reentrenar con `lerobot-train` sobre un dataset propio de ensamblaje para adaptar la política a otra pieza o robot.
- Docencia y formación en imitation learning: ejemplo autocontenido y reproducible de entrenamiento con 200 episodios y 100.000 pasos que ilustra el flujo completo de datos, entrenamiento y despliegue.
- Pruebas de integración hardware-software: validar cámaras `sideview` y `robot0_eye_in_hand`, calibración y frecuencia de 20 FPS en una celda de laboratorio antes de escalar a producción.
- Generación de datos sintéticos de trayectorias: usar las predicciones multimodales del modelo de difusión para estudiar la distribución de acciones en tareas de ensamblaje y alimentar análisis de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet.»

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-2 GB en FP32 para los 278 M parámetros, más el coste de las dos imágenes de 256×256; en la práctica, menos de 4 GB en una GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento, se recomienda RTX 4090 o A100 por el batch size 64 y los 100.000 pasos.
- Cabe en GPU consumer: sí, en RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con el robot Panda vía el CLI de LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de control).
- Latencia y throughput: no disponibles; la frecuencia de control del dataset es 20 FPS, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`diffusion_UR5e_...tool_hang`) | 278 M | H=16 (según nombre) | tool_hang (Panda) | apache-2.0 | Hugging Face, 0 descargas |
| Otras políticas LeRobot Diffusion Policy | no disponible | no disponible | diversas tareas | normalmente apache-2.0 | Hugging Face |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | no disponible | imitación diversa | apache-2.0 | Hugging Face / LeRobot |
| π0 / π0.5 (Physical Intelligence) | no disponible en esta búsqueda | no disponible | control generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para este modelo ni para alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica de una única tarea; no generaliza a otras tareas de manipulación sin reentrenamiento.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot.
- Depende de la configuración exacta de cámaras (`sideview`, `robot0_eye_in_hand`) y de la frecuencia de 20 FPS; cambios de calibración o iluminación pueden degradar el rendimiento.
- Entrenado con solo 200 episodios, lo que limita la diversidad de posiciones y condiciones cubiertas.
- Riesgo de sobreajuste al dataset `robomimic_tool_hang_ph_image256` y a la morfología del robot Panda.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar en el hardware objetivo antes de producción.
- Sin información sobre sesgos (no aplica en el sentido de LLM) ni sobre robustez frente a fallos de percepción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_16_TASK_tool_hang_crop232_aug3_ID_q5_164510
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
