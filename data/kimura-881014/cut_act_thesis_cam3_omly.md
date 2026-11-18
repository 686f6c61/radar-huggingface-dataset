# Kimura-881014/cut_act_thesis_cam3_omly

## Resumen

`cut_act_thesis_cam3_omly` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y distribuida a través del ecosistema LeRobot de Hugging Face. El modelo lo publica el usuario Kimura-881014 y resuelve una tarea concreta de manipulación: cortar chips entrelazados ("cut entangle chips") sobre un robot `so101_follower` equipado con dos cámaras (`wrist` y `side`). No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones e imágenes de 480x640) a acciones de 6 dimensiones.

La relevancia de esta ficha es acotada y muy específica. Se trata de un artefacto de investigación con 51,7 millones de parámetros, pensado para reproducir un experimento de tesis sobre una plataforma SO-101. Su valor práctico depende por completo de disponer del mismo robot, la misma configuración de cámaras y el mismo entorno físico que el autor. No hay métricas de éxito publicadas ni licencia declarada, lo que limita su uso fuera del contexto académico original.

Arquitectónicamente es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones (secuencias cortas) en lugar de pasos individuales, la innovación central del paper ACT (arXiv:2304.13705). El contexto, los idiomas y los formatos de pesos distintos de safetensors no aplican en el sentido habitual de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so101_follower` |
| Camaras | `wrist`, `side` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.side` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Tamano del repo | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que predice *chunks* de acciones en lugar de un único paso por inferencia. La arquitectura combina un codificador de imágenes (para las dos cámaras de 480x640) con un transformer que fusiona la observación visual y el estado articular de 6 dimensiones, y un decodificador que emite secuencias de acciones de 6 dimensiones. Esta predicción por bloques reduce el error de acumulación típico de las políticas paso a paso y suaviza el comportamiento en tareas de manipulación fina.

El entrenamiento se realizó sobre el dataset `Kimura-881014/cut_entangled_chips_after_deletion`, con 103 episodios, 72.725 fotogramas a 30 FPS y la tarea "cut entangle chips". La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.1. No se documentan detalles sobre aumentación de datos, composición exacta del dataset ni técnicas de regularización; tampoco hay indicios de RLHF o DPO, lo cual es esperable en una política de imitación supervisada.

## Capacidades

- Control visuomotor de un robot `so101_follower` para la tarea específica "cut entangle chips".
- Fusión de dos flujos visuales (`wrist` y `side`) con el estado articular de 6 dimensiones.
- Predicción de *chunks* de acciones de 6 dimensiones, lo que permite ejecutar movimientos coordinados y suavizados.
- Aprendizaje por imitación a partir de datos de teleoperación (103 episodios, 72.725 fotogramas).
- Ejecución en bucle mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni *thinking mode*.

## Casos de uso

- Reproducción de experimentos de tesis: el modelo permite replicar el pipeline de entrenamiento e inferencia descrito en la model card sobre un SO-101 con dos cámaras, útil para validar resultados académicos.
- Manipulación fina de objetos entrelazados: la tarea de cortar chips entrelazados requiere coordinación visomotora precisa, y el *chunking* de acciones ayuda a mantener trayectorias estables.
- Base para *fine-tuning* en tareas similares: al ser una política ACT entrenada con LeRobot 0.7.1, sirve como punto de partida para reentrenar con nuevos datasets de manipulación.
- Docencia en robótica de imitación: ejemplo completo y reproducible de un flujo LeRobot de extremo a extremo (grabación, entrenamiento, despliegue).
- Evaluación comparativa de métodos de imitación: puede usarse como referencia ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en el mismo *benchmark* físico.
- Prototipado de *rollouts* controlados: el comando `lerobot-rollout` con `--duration` permite ejecuciones acotadas para inspeccionar el comportamiento antes de integrarlo en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 51,7 millones de parámetros y pesos safetensors, el modelo es muy pequeño y cabe holgadamente en GPUs de consumo, pero no se aporta una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder cargarlo; se desconoce si el autor validó CPU.
- ¿Cabe en GPU de consumo? Sí, por el reducido número de parámetros, aunque no hay confirmación oficial del autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y `lerobot-train` para reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La inferencia está ligada a la frecuencia de control del robot (30 FPS en los datos de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cut_act_thesis_cam3_omly` (este) | 51,7 M | no aplica | Manipulación "cut entangle chips" en SO-101 | no disponible | Hugging Face, 0 descargas |
| ACT (paper original, arXiv:2304.13705) | no disponible | no aplica | Manipulación general por imitación | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | Políticas de imitación con difusión | no disponible | Implementaciones públicas |
| VQ-BeT | no disponible | no aplica | Políticas de imitación discretizadas | no disponible | Implementaciones públicas |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de éxito en robot real; se desconoce la tasa de acierto de la política.
- La licencia no está declarada, lo que impide asumir uso comercial o redistribución sin contactar al autor.
- El modelo está entrenado exclusivamente para la tarea "cut entangle chips" y el robot `so101_follower`; no generaliza a otras tareas ni plataformas.
- Requiere exactamente la misma configuración de cámaras (`wrist`, `side`, 480x640, 30 FPS) y las mismas claves de observación; cualquier cambio invalida la política.
- Riesgo de sobreajuste al entorno físico del autor: iluminación, posiciones de objetos y fondo pueden afectar al comportamiento.
- No hay información sobre sesgos, robustez ante distracciones ni comportamiento fuera de distribución.
- El repositorio tiene 0 descargas y 0 *likes*, y no incluye demo en vídeo ni resultados de evaluación.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kimura-881014/cut_act_thesis_cam3_omly
- Dataset de entrenamiento: https://huggingface.co/datasets/Kimura-881014/cut_entangled_chips_after_deletion
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kimura-881014/cut_entangled_chips_after_deletion
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
