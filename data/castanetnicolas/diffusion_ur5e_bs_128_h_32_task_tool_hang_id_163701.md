# castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_163701

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el método Diffusion Policy (Chi et al., 2023), publicada en Hugging Face Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de imitación para robótica manipulativa que transforma observaciones (estado articular de 9 dimensiones y dos imágenes RGB de 256x256) en trayectorias de acción de 7 dimensiones. El modelo está especializado en una única tarea del benchmark RoboMimic: insertar un gancho en una base y colgar una llave inglesa.

La arquitectura subyacente es una red de difusión que modela la distribución de secuencias de acciones como un proceso generativo, lo que produce trayectorias suaves y multimodales adecuadas para manipulación con contacto rico. El checkpoint tiene 278.014.919 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors. Se entrenó con 200 episodios (95.962 fotogramas a 20 FPS) durante 200.000 pasos con batch de 128 y optimizador Adam a una tasa de aprendizaje de 1e-4.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible para la tarea `tool_hang`, útil como referencia de entrenamiento con LeRobot 0.6.1 y como punto de partida para experimentos de imitación en robots Panda, pero sin evaluación publicada ni resultados de éxito reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 278.014.919 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; horizonte de predicción H=32 según el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (política robótica; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir una acción única de forma regresiva, aprende a denoizar una secuencia de acciones condicionada por las observaciones, lo que permite representar distribuciones multimodales de comportamiento y generar trayectorias suaves de varios pasos. La entrada combina un vector de estado de 9 dimensiones con dos cámaras (`sideview` y `robot0_eye_in_hand`) a resolución 256x256; la salida es un vector de acción de 7 dimensiones. El nombre del checkpoint indica un horizonte de predicción de 32 pasos y batch de 128.

El entrenamiento se realizó sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`, con 200 episodios y 95.962 fotogramas a 20 FPS, correspondientes a la tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook". La configuración reportada es de 200.000 pasos, optimizador Adam, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior; es entrenamiento de imitación supervisado puro sobre demostraciones.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para un robot Panda en la tarea `tool_hang`.
- Control visuomotor a partir de dos cámaras RGB (vista lateral y cámara en el efector) más estado articular de 9 dimensiones.
- Producción de trayectorias multimodales y suaves gracias al proceso de difusión, adecuadas para manipulación con contacto.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- Reentrenamiento y ajuste con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea `tool_hang` en un robot Panda: ejecutar la política con `lerobot-rollout` y las dos cámaras configuradas para validar el pipeline completo de LeRobot antes de entrenar políticas propias.
- Línea base para experimentos de imitación: comparar variantes de Diffusion Policy (distinto horizonte, resolución o número de cámaras) contra este checkpoint de referencia entrenado con 200.000 pasos.
- Docencia y formación en aprendizaje por imitación: usar el repositorio como ejemplo canónico de flujo LeRobot (grabación de datos, entrenamiento, despliegue) con una tarea de contacto rico bien delimitada.
- Pruebas de infraestructura robótica: validar latencia, sincronización de cámaras y calibración de un Panda antes de invertir en datasets mayores, dado que la política es ligera (1,1 GB) y de inferencia rápida en GPU consumer.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulador o en robot real para recolectar trayectorias y analizar modos de fallo en inserción de gancho y colgado de objeto.
- Punto de partida para fine-tuning en tareas de ensamblaje similares: reentrenar sobre un dataset propio con la misma estructura de observaciones (estado de 9 dimensiones y dos vistas de 256x256) para tareas de inserción o ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._", por lo que no existe tasa de éxito reportada para la tarea `tool_hang` ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,1 GB en safetensors; con activaciones y dos cámaras a 256x256, la inferencia cabe holgadamente en GPUs con 8 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento con batch 128 se recomienda 24 GB o más.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4070/4090 y equivalentes.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La tasa de control del dataset es de 20 FPS, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (diffusion, tool_hang) | 278 M | H=32 (según nombre) | `tool_hang` en RoboMimic | Apache 2.0 | Hugging Face Hub |
| Otras políticas LeRobot Diffusion Policy | no disponible | no disponible | distintas tareas | Apache 2.0 (habitual) | Hugging Face Hub |
| Políticas ACT (Action Chunking Transformer) en LeRobot | no disponible | no disponible | imitación visuomotora | Apache 2.0 (habitual) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea `tool_hang`; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni análisis de fallos, por lo que no puede recomendarse para producción sin validación propia.
- Dependencia de la configuración de sensores: requiere exactamente las observaciones `observation.state` (9,), `observation.images.sideview` (3, 256, 256) y `observation.images.robot0_eye_in_hand` (3, 256, 256); cambios de cámara, resolución o calibración degradan el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento simbólico; no es adecuado para tareas de texto, código o agentes conversacionales.
- Riesgo de sobreajuste al dataset de 200 episodios y a las condiciones de iluminación y posiciones de objeto del mismo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace necesaria una validación exhaustiva antes de cualquier despliegue real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_163701
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
