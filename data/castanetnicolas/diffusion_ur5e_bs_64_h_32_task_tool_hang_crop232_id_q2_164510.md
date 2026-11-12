# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_ID_q2_164510

## Resumen

`castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_ID_q2_164510` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada mediante LeRobot, la librería de aprendizaje por imitación para robótica real de Hugging Face. El modelo resuelve una única tarea de manipulación concreta: insertar un gancho en una base para construir un marco y colgar una llave inglesa en él (tarea `tool_hang` del entorno RoboMimic). No es un modelo de lenguaje: es un generador de trayectorias de acción que se ejecuta en bucle cerrado sobre un brazo robótico.

La arquitectura sigue el planteamiento de Diffusion Policy (Chi et al., 2023), que trata el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción multimodales y suaves, especialmente adecuadas para tareas con contacto físico rico. El modelo consume el estado articular de 9 dimensiones y dos cámaras de 256x256 píxeles (`sideview` y `robot0_eye_in_hand`), y emite vectores de acción de 7 dimensiones. Cuenta con 278.014.919 parámetros en formato safetensors y un repositorio de 1,1 GB.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de imitación (dataset, entrenamiento, checkpoint y comando de despliegue) para quien quiera reproducir o adaptar Diffusion Policy en robótica de manipulación con LeRobot. No se han publicado resultados de evaluación, por lo que su utilidad es la de un artefacto de entrenamiento verificable, no la de un modelo validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción de acciones, valor no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Librería | lerobot (versión de entrenamiento 0.6.1) |
| Pipeline | robotics |
| Tipo de robot declarado | `panda` (el identificador del repo menciona `UR5e`) |
| Entradas | `observation.state` (9,), `observation.images.sideview` (3, 256, 256), `observation.images.robot0_eye_in_hand` (3, 256, 256) |
| Salida | `action` (7,) |
| Dataset de entrenamiento | `castanetnicolas/robomimic_tool_hang_ph_image256` |
| Episodios / frames | 200 episodios, 95.962 frames a 20 FPS |
| Tarea | "Insert the hook into the base to build a frame, then hang the wrench on the hook." |
| Pasos de entrenamiento | 100.000 |
| Batch size | 64 |
| Optimizador / LR | adam / 0,0001 |
| Semilla | 1000 |
| Tamaño del repo | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que formula el control visuomotor como un proceso de difusión condicionado por observaciones. En lugar de predecir una acción única de forma determinista, el modelo aprende a generar secuencias de acciones mediante un proceso iterativo de eliminación de ruido, lo que permite representar distribuciones multimodales de comportamiento y producir trayectorias suaves y coherentes en el tiempo. Esta formulación es particularmente robusta en tareas con contacto, como la inserción y el colgado de objetos que aborda este checkpoint.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 frames capturados a 20 FPS con dos cámaras (vista lateral y cámara en la muñeca del robot). La configuración reportada incluye 100.000 pasos, batch size de 64, optimizador Adam con tasa de aprendizaje 1e-4 y semilla 1000. La model card no especifica el número de pasos de difusión, el tipo de ruido, la composición exacta del dataset ni si se aplicaron técnicas adicionales de regularización o aumento de datos.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control de un brazo robótico de 7 grados de libertad.
- Control visuomotor a partir de dos cámaras RGB de 256x256 y del estado articular de 9 dimensiones.
- Ejecución de una tarea de manipulación con contacto: inserción de un gancho en una base y colgado de una llave inglesa.
- Producción de acciones multimodales y temporalmente consistentes gracias al proceso de difusión.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitación completo: sirve como ejemplo verificable de entrenamiento de Diffusion Policy con LeRobot, desde el dataset hasta el checkpoint, para equipos que quieran montar su propio flujo de aprendizaje por imitación.
- Benchmark interno de manipulación con contacto: la tarea de inserción y colgado es representativa de operaciones de ensamblaje, por lo que el checkpoint puede usarse como línea base al comparar variantes de Diffusion Policy o de otras políticas de imitación.
- Despliegue en un brazo Panda con dos cámaras: mediante `lerobot-rollout` con `--robot.type=panda`, el modelo puede ejecutarse en bucle cerrado durante un tiempo acotado (`--duration=60`) para validar la integración hardware-software.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de ejecución y entrenamiento listos para usar, lo que facilita prácticas guiadas sobre recogida de datos, entrenamiento y evaluación de políticas.
- Punto de partida para fine-tuning en tareas de ensamblaje similares: el checkpoint puede reentrenarse con `lerobot-train --policy.type=diffusion` sobre datasets propios de inserción de piezas, aprovechando la inicialización aprendida.
- Investigación en generación de trayectorias multimodales: permite estudiar cómo la difusión modela la incertidumbre en tareas con contacto y comparar la suavidad y estabilidad de las trayectorias generadas frente a políticas deterministas.
- Validación de infraestructura de datos y cámaras: útil para comprobar que la calibración, los nombres de cámara y las tasas de captura del montaje coinciden con las claves de observación esperadas por la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, por lo que no existen tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 278 millones de parámetros en safetensors, el peso de los parámetros ronda 1,1 GB en precisión de entrenamiento, pero no se especifica el consumo real en ejecución.
- GPU recomendadas: no disponible. El entrenamiento se configuró con `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros es plausible en GPUs de consumo con memoria suficiente, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 20 FPS, pero no se reporta la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_64_H_32_TASK_tool_hang (este modelo) | 278.014.919 | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face |
| Políticas basadas en VLA (p. ej. pi0) | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos comparativos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en la tarea, incluso en el entorno de entrenamiento.
- Especialización extrema: el modelo solo ha sido entrenado para la tarea `tool_hang` con la instrucción textual indicada; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del montaje: los nombres de cámara (`sideview`, `robot0_eye_in_hand`), la resolución de 256x256, el estado de 9 dimensiones y el robot declarado (`panda`) deben coincidir con el hardware de despliegue.
- Inconsistencia en la denominación: el identificador del repositorio menciona `UR5e` mientras que la model card declara `panda`; conviene verificar el robot real antes de desplegar.
- Riesgo de sobreajuste al dataset: con 200 episodios y 100.000 pasos de entrenamiento, es posible que la política se adapte en exceso a las condiciones de captura (posiciones, iluminación, objetos).
- Sin información sobre sesgos: no se documentan sesgos de comportamiento ni análisis de robustez ante cambios de iluminación, distractores u objetos nuevos.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de latencia: no se puede garantizar el cumplimiento de requisitos de tiempo real en un lazo de control.
- Popularidad nula (0 descargas, 0 likes) y fecha de creación futura en los metadatos: tratar el artefacto con cautela y validarlo antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_crop232_ID_q2_164510
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
