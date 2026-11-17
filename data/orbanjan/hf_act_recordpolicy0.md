# orbanjan/hf_act_recordpolicy0

## Resumen

`orbanjan/hf_act_recordpolicy0` es una política de imitación robótica basada en Action Chunking with Transformers (ACT), un método presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real y simulada. Desarrollado por el usuario orbanjan, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La política está especializada en una única tarea de manipulación bimanual sobre el robot simulado ALOHA: "Pick up the cube with the right arm and transfer it to the left arm". Consume una imagen de cámara superior de 480x640 píxeles y un vector de estado de 14 dimensiones, y produce un vector de acción de 14 dimensiones. Con 51.685.006 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a control robótico, no a generación de lenguaje.

Su relevancia es acotada: se trata de una política de referencia para experimentación con ACT y LeRobot sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, útil para reproducir el pipeline de entrenamiento e inferencia, pero sin resultados de evaluación publicados ni licencia declarada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | aloha |
| Cámaras | top |
| Entrada visual | observation.images.top, shape (3, 480, 640) |
| Entrada de estado | observation.state, shape (14,) |
| Salida de acción | action, shape (14,) |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso de tiempo, predice un chunk de acciones futuras. Esta formulación reduce el error de composición acumulado típico de las políticas paso a paso y permite alcanzar tasas de éxito elevadas con datos de teleoperación, según el paper de referencia. La arquitectura es un transformer que procesa conjuntamente la observación visual (imagen de cámara superior) y el estado proprioceptivo del robot (14 dimensiones) para emitir el chunk de acciones de 14 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `lerobot/aloha_sim_transfer_cube_human`: 50 episodios, 20.000 frames a 50 FPS, correspondientes a la tarea de recoger un cubo con el brazo derecho y transferirlo al izquierdo. La configuración fue de 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni innovaciones adicionales más allá del propio action chunking.

## Capacidades

- Control robótico de manipulación bimanual sobre el robot ALOHA en simulación.
- Ejecución de una tarea concreta: recoger un cubo con el brazo derecho y transferirlo al brazo izquierdo.
- Predicción de chunks de acción de 14 dimensiones a partir de observación visual y de estado.
- Procesamiento de imagen de cámara superior a resolución 480x640.
- Integración con el stack LeRobot para rollout y entrenamiento (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de visión general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Reproducción de experimentos ACT: ejecutar la política con `lerobot-rollout` sobre un ALOHA simulado para validar el pipeline de inferencia de LeRobot de extremo a extremo.
- Línea base para comparación de políticas: usar esta política como referencia al evaluar variantes de ACT, otros métodos de imitación o cambios en la configuración de entrenamiento sobre la misma tarea.
- Aprendizaje del flujo de entrenamiento: servir de ejemplo de configuración completa (dataset, hiperparámetros, semilla) para formar a nuevos usuarios en `lerobot-train`.
- Transferencia bimanual en simulación: estudiar el comportamiento de una política que coordina dos brazos en una tarea de paso de objeto, útil para investigar sincronización bimanual.
- Docencia y talleres de robótica: demostrar el ciclo teleoperación-dataset-entrenamiento-despliegue con un modelo pequeño (0,2 GB) que cabe en cualquier equipo.
- Pruebas de integración de hardware: adaptar el comando de rollout a un ALOHA físico para comprobar la correspondencia entre claves de observación (cámara `top`, estado de 14 dimensiones) y el robot real.
- Prototipado de pipelines de evaluación: usar la política para construir y depurar scripts de evaluación de tasas de éxito antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella en memoria es del orden de cientos de MB, holgada en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte CUDA es suficiente por el tamaño del modelo. El comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por tamaño (menos de 1 GB de pesos); no se detalla compatibilidad específica con modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 50 FPS y el ejemplo de rollout configura cámaras a 30 FPS, pero no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orbanjan/hf_act_recordpolicy0 | 51.685.006 | no aplica | ACT sobre ALOHA, transferencia de cubo | no disponible | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | ACT sobre distintos datasets | no disponible | Hugging Face (varias) |
| Otros métodos de imitación en LeRobot (p. ej. Diffusion Policy) | no disponible | no aplica | Manipulación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia de tasa de éxito ni de robustez de la política.
- Especialización extrema: entrenada para una única tarea, un único tipo de robot (ALOHA) y una única cámara (`top`); no generaliza a otras tareas ni configuraciones sin reentrenamiento.
- Dataset pequeño: 50 episodios y 20.000 frames, lo que limita la variedad de posiciones, iluminación y distractores vistos durante el entrenamiento.
- Licencia no declarada: no se puede confirmar el uso comercial; la model card marca la licencia como "More Information Needed".
- Riesgo de sobreajuste al entorno simulado: el dataset es de simulación (`aloha_sim_transfer_cube_human`), por lo que el comportamiento en un robot físico no está validado.
- Sin evaluación de sesgos ni de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es el fallo de la política ante condiciones fuera de distribución.
- Dependencia del stack LeRobot 0.7.1: cambios de versión en la librería pueden afectar a la compatibilidad de configuración y rollout.
- Repositorio sin tracción (0 descargas, 0 likes): no hay comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orbanjan/hf_act_recordpolicy0
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_transfer_cube_human
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
