# Davilood/act_cuchara_cambuena_110

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este repositorio concreto, `Davilood/act_cuchara_cambuena_110`, es una política entrenada con LeRobot sobre el dataset `Davilood/cuchara_cambuena` para la tarea "Pick up the spoon and place it next to the plate" (coger la cuchara y colocarla junto al plato) con un robot `so_follower`.

El modelo no es un LLM ni un modelo de lenguaje: es una política visomotora de 51.668.614 parámetros que consume el estado articular de 6 dimensiones y dos flujos de imagen (cámara `top` a 362x436 y cámara `wrist` a 480x640) para producir un vector de acción de 6 dimensiones. Se entrenó durante 10.000 pasos con batch de 8, optimizador AdamW y learning rate 1e-5 sobre 110 episodios y 77.042 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación en LeRobot (grabación con robot real, entrenamiento y despliegue con `lerobot-rollout`) para una única tarea de pick-and-place. No hay resultados de evaluación publicados, por lo que su utilidad práctica debe validarse en el robot destino antes de cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política por imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador visual (procesa las imágenes de las cámaras `top` y `wrist`) con un codificador de estado y un decodificador que genera *chunks* de acciones, es decir, secuencias cortas de comandos articulares en lugar de una única acción por paso. Esta predicción por fragmentos es la innovación central del método: reduce el horizonte efectivo de decisión y mitiga el error de composición típico de las políticas paso a paso. La entrada de estado es `observation.state` con forma `(6,)` y la salida es `action` con forma `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Davilood/cuchara_cambuena`: 110 episodios, 77.042 fotogramas a 30 FPS, una única tarea de manipulación. Configuración: 10.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún refinamiento posterior al aprendizaje por imitación supervisado; tampoco se detalla la composición exacta del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones visomotrices (estado articular + dos cámaras).
- Aprendizaje por imitación de una tarea concreta de pick-and-place: coger una cuchara y colocarla junto a un plato.
- Predicción de *action chunks*: emite secuencias cortas de acciones, no pasos aislados.
- Fusión de dos vistas visuales (`top` y `wrist`) con el estado del robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad fuera del dominio robótico para el que fue entrenado.

## Casos de uso

- Reproducción de un pipeline de imitación en LeRobot: sirve como referencia completa (dataset, configuración de entrenamiento y política publicada) para equipos que quieran montar su primer flujo de *learning from demonstration* con un robot `so_follower`.
- Automatización de una tarea de pick-and-place en laboratorio: el modelo ejecuta "coger la cuchara y colocarla junto al plato" mediante `lerobot-rollout`, adecuado para validar hardware y calibración de cámaras antes de escalar a tareas más complejas.
- Benchmark interno de políticas ACT: al tener configuración de entrenamiento explícita (10.000 pasos, batch 8, lr 1e-5, semilla 1000), permite comparar variantes de hiperparámetros o de composición del dataset sobre la misma tarea.
- Docencia y formación en robótica: ejemplo mínimo y de licencia permisiva (Apache 2.0) para explicar action chunking, fusión visomotriz y despliegue con LeRobot.
- Base para *fine-tuning* en tareas similares: al ser una política pequeña (51,7 M de parámetros) y con pesos en safetensors, se puede reentrenar o adaptar con un dataset propio de manipulación de objetos alargados.
- Prueba de integración de cámaras y robot: útil para verificar que los nombres de cámara (`top`, `wrist`), resoluciones (362x436 y 480x640) y frecuencia (30 FPS) coinciden con la configuración esperada por la política antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en safetensors, el peso de los pesos es del orden de 0,2 GB (tamaño del repo), por lo que la inferencia es ligera, pero no se documenta el consumo real con los buffers visuales.
- GPU recomendadas: no disponible. No se especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del modelo es plausible en GPUs de consumo, pero no está confirmado en la documentación.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Davilood/act_cuchara_cambuena_110 | 51.668.614 | no aplica | sin evaluación publicada | apache-2.0 | HuggingFace (30 descargas) |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | no disponible | variable | HuggingFace |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | variable | HuggingFace |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas de la misma categoría; la comparación se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni protocolo de validación, por lo que no se puede afirmar que la política funcione de forma fiable.
- Sesgo de dominio: entrenada con un único robot (`so_follower`), dos cámaras concretas y una única tarea; no generaliza a otros robots, disposiciones de cámara ni objetos.
- Sensibilidad a condiciones de captura: cambios de iluminación, posiciones de objetos, distracciones o resolución de cámara pueden degradar el comportamiento, ya que no se documentan pruebas de robustez.
- Riesgo de sobreajuste al dataset: 110 episodios y 10.000 pasos de entrenamiento con batch 8 son una muestra limitada; la política puede memorizar trayectorias.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse fuera del dominio robótico ni como sustituto de un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y citar el método ACT y LeRobot.
- Para producción: es imprescindible validar en el robot destino, con un protocolo de ensayos repetidos y métricas de éxito, antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Davilood/act_cuchara_cambuena_110
- Dataset de entrenamiento: https://huggingface.co/datasets/Davilood/cuchara_cambuena
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Davilood/cuchara_cambuena
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
