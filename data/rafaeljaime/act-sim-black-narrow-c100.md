# RafaelJaime/act-sim-black-narrow-c100

## Resumen

ACT-sim-black-narrow-c100 es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), entrenada por RafaelJaime con la librería LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación muy concreta: "grasp the seed below the gripper" (agarrar la semilla situada bajo la pinza). Se entrenó sobre el dataset de simulación `RafaelJaime/smartseed-sim-grasp-black-v3-narrow`, con 300 episodios y 88.617 fotogramas a 30 FPS, y se publica como checkpoint de 51.668.614 parámetros en formato safetensors. El repositorio ocupa 2,5 GB.

A diferencia de los modelos de lenguaje, esta ficha describe una política visuomotora: consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (vista superior y vista de muñeca), y emite un vector de acción de 6 dimensiones. Su relevancia es acotada y práctica: sirve como punto de partida reproducible para el hackathon robotekin y para el robot SO-101 (so_follower) de BraboRobots, y como ejemplo de entrenamiento ACT en simulación con LeRobot 0.6.2.

La arquitectura es ACT, un transformer que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado en tareas de imitación. No dispone de resultados de evaluación publicados en la model card, por lo que su rendimiento real no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salida | `action` (6,) |
| Robot objetivo | `so_follower` (SO-101) |
| Frecuencia de datos de entrenamiento | 30 FPS |
| Librería | lerobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) condicionadas por observaciones visuales y propioceptivas. La política combina un codificador visual para las dos cámaras (top y wrist), un codificador del estado articular y un transformer que genera el chunk de acciones. Esta formulación mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso, y permite un control más estable en tareas de agarre.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, con batch size 32, optimizador AdamW, learning rate de 1e-05 y semilla 1000. El dataset de origen contiene 300 episodios y 88.617 fotogramas a 30 FPS, todos generados en simulación para la tarea de agarre de semilla. La model card no especifica composición del dataset, aumentación de datos, ni si hubo fases de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) a partir de dos cámaras RGB y el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones para ejecución en bucle cerrado.
- Ejecución de una única tarea especializada: agarrar la semilla situada bajo la pinza.
- Aprendizaje por imitación a partir de datos teleoperados en simulación.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción del entrenamiento ACT en simulación: sirve como referencia para validar pipelines de LeRobot 0.6.2 con el robot SO-101 antes de trasladar el flujo a hardware real.
- Base para el hackathon robotekin: el checkpoint permite arrancar una demo de agarre sin entrenar desde cero, usando los comandos `lerobot-rollout` documentados en la model card.
- Punto de partida para fine-tuning en tareas de agarre: al estar entrenado en simulación con 300 episodios, se puede reentrenar con datos reales del mismo robot y ampliar la variabilidad de posiciones y objetos.
- Evaluación de infraestructura de inferencia robótica: el modelo permite medir latencia de un pipeline con dos cámaras a 640x480 y 30 FPS en una GPU consumer, útil para dimensionar hardware.
- Docencia y experimentación con aprendizaje por imitación: el tamaño reducido (51,7 M de parámetros) y la licencia Apache 2.0 facilitan su uso en cursos y talleres sin restricciones de distribución.
- Pruebas de integración con LeRobot CLI: valida el flujo `lerobot-rollout` con `--strategy.type=base`, útil para comprobar la configuración de puertos y cámaras antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 200 MB en fp32; el consumo real depende de los codificadores visuales y de los buffers de dos cámaras a 640x480.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y al menos 4-8 GB de VRAM debería ser suficiente para inferencia, aunque no hay cifras publicadas.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, pero el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=RafaelJaime/act-sim-black-narrow-c100` y `--strategy.type=base`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-sim-black-narrow-c100 | 51.668.614 | Agarre de semilla en SO-101 | no aplica | apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | Tareas de manipulación diversas | no aplica | variable | Hugging Face |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | Manipulación visuomotora | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo se entrenó para la tarea "grasp the seed below the gripper"; no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento exclusivamente en simulación: el salto a hardware real (sim-to-real) puede degradar el rendimiento por diferencias de iluminación, calibración y dinámica.
- Sin evaluación publicada: no hay tasa de éxito medida, ni en simulación ni en robot real.
- Dependencia de configuración: requiere que los nombres de cámara coincidan con `observation.images.top` y `observation.images.wrist`, y que el robot sea `so_follower`.
- Riesgo de sobreajuste al dataset de 300 episodios, con variabilidad limitada de posiciones y objetos.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos ni riesgos éticos específicos más allá de los habituales en robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-sim-black-narrow-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-black-v3-narrow
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-black-v3-narrow
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
