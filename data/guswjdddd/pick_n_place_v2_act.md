# guswjdddd/pick_n_place_v2_act

## Resumen

`pick_n_place_v2_act` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo lo ha entrenado y publicado el usuario `guswjdddd` utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. La política resuelve una tarea concreta de manipulación: coger un cubo rojo y colocarlo encima de un cubo verde.

El modelo consume el estado articular del robot (vector de 6 dimensiones) y tres cámaras RGB de 480x640 píxeles (muñeca, superior y frontal) y produce un vector de acción de 6 dimensiones. Está entrenado sobre un dataset propio de 100 episodios y 45.282 fotogramas a 30 FPS, con un total de 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB.

Es relevante como ejemplo reproducible de un pipeline completo de imitación en robótica con LeRobot: desde la teleoperación y grabación del dataset hasta el entrenamiento y el despliegue en un robot `so_follower`. No es un modelo de propósito general ni un LLM, sino una política visomotora especializada en una única tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de manipulación. La política recibe `observation.state` (6 dimensiones), tres cámaras (`wrist`, `top`, `belly`) de 3x480x640 y emite `action` de 6 dimensiones. El robot objetivo es `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.1 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset `guswjdddd/pick_n_place_v2_20261118_135308` contiene 100 episodios, 45.282 fotogramas a 30 FPS y la tarea "Pick up the red cube and place it on the green cube". No se documenta composición adicional del dataset, uso de RLHF/DPO ni innovaciones técnicas más allá del propio método ACT.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de 6 dimensiones a partir de estado articular y tres vistas de cámara.
- Aprendizaje por imitación a partir de datos teleoperados.
- Predicción de action chunks para ejecución suave y estable.
- Ejecución autónoma de la tarea "coger el cubo rojo y colocarlo sobre el cubo verde".
- Integración con LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la política sobre un `so_follower` con las tres cámaras configuradas para reproducir la tarea de apilado de cubos.
- Base para fine-tuning en tareas similares: reentrenar con `lerobot-train` sobre un dataset propio y `--policy.type=act` para adaptar la política a nuevos objetos o posiciones.
- Validación de pipelines de imitación: usar el modelo como referencia reproducible de un entrenamiento ACT de 50.000 pasos con hiperparámetros documentados.
- Demostraciones educativas: ilustrar el flujo completo teleoperación, grabación, entrenamiento y despliegue con LeRobot.
- Evaluación de robustez visomotora: probar la política ante cambios de iluminación, posiciones u objetos distractores para medir su generalización.
- Prototipado de células robóticas de bajo coste: desplegar en hardware `so_follower` con cámaras OpenCV a 640x480 y 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y tres cámaras de 480x640, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el entrenamiento se realizó con `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con robot `so_follower` y cámaras OpenCV a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `guswjdddd/pick_n_place_v2_act` | 51.668.614 | no aplica | Pick-and-place de cubos con `so_follower` | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación variable | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especializada en una única tarea: "coger el cubo rojo y colocarlo sobre el cubo verde"; no generaliza a otras tareas sin reentrenamiento.
- Entrenada para el robot `so_follower` con cámaras `wrist`, `top` y `belly`; requiere hardware y configuración de cámara equivalentes.
- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito en robot real.
- Dataset pequeño (100 episodios, 45.282 fotogramas): riesgo de sobreajuste y baja robustez ante cambios de iluminación, posiciones u objetos.
- No procesa lenguaje natural ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones incorrectas o inseguras en entornos reales.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- Sin información sobre sesgos; al ser una política visomotora, puede verse afectada por sesgos en los datos de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guswjdddd/pick_n_place_v2_act
- Dataset de entrenamiento: https://huggingface.co/datasets/guswjdddd/pick_n_place_v2_20261118_135308
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=guswjdddd/pick_n_place_v2_20261118_135308
