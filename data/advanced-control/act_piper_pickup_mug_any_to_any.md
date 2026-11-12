# advanced-control/act_piper_pickup_mug_any_to_any

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `advanced-control/act_piper_pickup_mug_any_to_any`, es una política entrenada con LeRobot sobre el robot Piper para la tarea de recoger una taza. El modelo aprende de datos de teleoperación y transforma observaciones multimodales (estado articular y tres cámaras) en comandos de acción de 7 dimensiones.

El modelo resuelve un problema clásico en robótica manipulativa: la generación de trayectorias estables a partir de demostraciones humanas. En lugar de predecir una acción por paso, ACT predice un chunk de acciones, lo que reduce el error acumulado y mejora la consistencia temporal. Es relevante para desarrolladores que quieran desplegar políticas de imitación en robots de bajo coste como el Piper, con un pipeline reproducible en LeRobot.

La política tiene 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB. Está entrenada con 89 episodios y 56.962 frames a 15 FPS, con 100.000 pasos de entrenamiento, batch size 8 y learning rate 1e-5. La licencia es Apache 2.0 y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación en robótica. La arquitectura combina un codificador de observaciones (estado articular de 7 dimensiones y tres cámaras RGB de 360x640) con un decodificador que genera chunks de acciones de 7 dimensiones. El modelo se entrena de forma supervisada sobre pares observación-acción extraídos de demostraciones teleoperadas, sin RLHF ni DPO.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000. El dataset contiene 89 episodios y 56.962 frames a 15 FPS para la tarea "pickup mug". Las cámaras utilizadas son `camera_hand`, `camera_chest` y `camera_top`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de comandos de acción de 7 dimensiones para control robótico.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones para reducir el error acumulado.
- Procesamiento multimodal: estado articular y tres cámaras RGB.
- Ejecución de la tarea de recoger una taza con el robot Piper.
- Integración con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Recogida de objetos en laboratorio: la política se despliega sobre el robot Piper para recoger una taza, usando las tres cámaras y el estado articular como entrada. Es adecuada por su entrenamiento específico en esta tarea y su pipeline reproducible en LeRobot.
- Prototipado de políticas de imitación: sirve como punto de partida para entrenar variantes con nuevos datasets, gracias a la CLI `lerobot-train` y a la configuración documentada.
- Evaluación de hardware de bajo coste: permite validar el robot Piper y el conjunto de cámaras en un flujo completo de teleoperación, entrenamiento y rollout.
- Docencia e investigación en robótica: el modelo y el dataset asociado permiten reproducir experimentos de ACT con 89 episodios y 56.962 frames.
- Benchmarking de métodos de imitación: útil como referencia para comparar ACT con otras políticas sobre el mismo dataset y robot.
- Integración en pipelines de automatización: mediante `lerobot-rollout` se puede ejecutar la política durante un tiempo determinado (`--duration`) en entornos controlados.
- Generación de datos sintéticos de trayectorias: las predicciones de chunks de acciones pueden usarse para analizar la estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,67 M de parámetros y pesos safetensors de 0,2 GB, la inferencia es viable en GPUs consumer.
- GPU recomendadas: no disponible; por tamaño, cabría en RTX 3060, RTX 4090, A100 o H100, pero no se documenta oficialmente.
- Cabe en GPU consumer: sí, por el tamaño del repositorio (0,2 GB) y el número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| advanced-control/act_piper_pickup_mug_any_to_any | 51.670.663 | no aplica | Recogida de taza con Piper | apache-2.0 | Hugging Face |
| Políticas ACT genéricas en LeRobot | no disponible | no aplica | Imitación robótica | según repositorio | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Imitación robótica | según repositorio | Hugging Face |
| Políticas VQ-BeT | no disponible | no aplica | Imitación robótica | según repositorio | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para la tarea "pickup mug" con el robot Piper; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación en robot real; el éxito de la política no está verificado.
- Depende de la configuración exacta de cámaras (`camera_hand`, `camera_chest`, `camera_top`) y del estado articular de 7 dimensiones.
- Dataset pequeño (89 episodios, 56.962 frames); posible sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Sin capacidades lingüísticas, de razonamiento o de tool calling.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones incorrectas o inseguras en entornos reales.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni garantías.
- No se documentan sesgos conocidos; al ser un modelo robótico, los sesgos provienen de los datos de teleoperación.

## Enlaces

- [Hugging Face: advanced-control/act_piper_pickup_mug_any_to_any](https://huggingface.co/advanced-control/act_piper_pickup_mug_any_to_any)
- [Dataset: advanced-control/piper_pickup_mug_any_to_any](https://huggingface.co/datasets/advanced-control/piper_pickup_mug_any_to_any)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualizar dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pickup_mug_any_to_any)
- [Instalación LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia](https://huggingface.co/docs/lerobot/main/en/inference)
