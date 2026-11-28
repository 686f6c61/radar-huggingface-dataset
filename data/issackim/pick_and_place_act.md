# IssacKIM/pick_and_place_act

## Resumen

`IssacKIM/pick_and_place_act` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Ha sido entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

El modelo consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de imagen RGB de 480x640 píxeles procedentes de cámaras de muñeca y cenital, y produce un vector de acción de 6 dimensiones. Está especializado en la tarea concreta de "pick_and_place" sobre un robot de tipo `omx_follower`, entrenado con 50 episodios de teleoperación que suman 22.117 fotogramas a 30 FPS.

Con 51.668.614 parámetros y un repositorio de 1,0 GB en formato safetensors, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo. Su relevancia radica en ser un ejemplo reproducible de política visuomotora entrenada de extremo a extremo con LeRobot 0.7.1, útil como referencia para pipelines de imitación en robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salida | `action` (6,) |
| Tipo de robot | `omx_follower` |
| Camaras | `wrist`, `top` |
| Tarea | `pick_and_place` |
| Libreria | lerobot 0.7.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en cada paso de inferencia el modelo emite un bloque de acciones futuras en lugar de una única acción, lo que mitiga el problema de acumulación de errores típico de las políticas paso a paso. La arquitectura integra dos cámaras RGB (muñeca y cenital) junto con el estado propioceptivo del robot para producir comandos de 6 grados de libertad.

El entrenamiento se realizó sobre el dataset `IssacKIM/pick_and_place_20261112_143943`, compuesto por 50 episodios y 22.117 fotogramas capturados a 30 FPS durante teleoperación de la tarea "pick_and_place". La configuración reportada incluye 50.000 pasos de entrenamiento, batch size de 32, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se documentan detalles sobre composición del dataset, aumentos de datos, regularización ni procesos de RLHF o DPO (no aplicables a este tipo de política).

## Capacidades

- Control visuomotor de un robot `omx_follower` para la tarea específica de recoger y colocar objetos.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado propioceptivo y dos vistas RGB.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Inferencia en tiempo real mediante el comando `lerobot-rollout` de LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en entornos controlados: la política ejecuta la tarea para la que fue entrenada sobre un robot `omx_follower` con dos cámaras; adecuada para líneas de montaje sencillas o laboratorios de robótica.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint ACT de 51,7 M de parámetros, puede reentrenarse con nuevos datasets LeRobot para adaptar la política a otras posiciones de objetos o variantes de la tarea.
- Referencia docente en cursos de aprendizaje por imitación: el pipeline completo (grabación, entrenamiento, rollout) está documentado en LeRobot y sirve como ejemplo reproducible de extremo a extremo.
- Prototipado rápido de políticas visuomotoras: el tamaño compacto permite iterar sobre hardware de consumo sin necesidad de clústeres GPU.
- Evaluación comparativa de métodos de imitación: sirve como baseline ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en experimentos académicos.
- Despliegue en robots de bajo coste: al requerir únicamente dos cámaras USB y un robot `omx_follower`, el coste de hardware es reducido frente a configuraciones con sensores adicionales.
- Investigación en robustez visual: permite estudiar cómo afectan cambios de iluminación, posición de cámara o distractores al rendimiento de una política ACT entrenada con 50 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 207 MB, por lo que cualquier GPU con 2 GB o más es suficiente en la práctica.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060, RTX 4060 o superior es más que suficiente; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `IssacKIM/pick_and_place_act` | 51,7 M | no aplica | pick_and_place (omx_follower) | no disponible | Hugging Face |
| ACT (paper original, arXiv:2304.13705) | no disponible | no aplica | Manipulación general (ALOHA) | no disponible | Paper + código |
| Diffusion Policy (referencia metodológica) | no disponible | no aplica | Manipulación visuomotora | no disponible | Repos públicos |
| Otras políticas LeRobot en el Hub | variable | no aplica | Tareas diversas | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible al no haberse publicado métricas de éxito en robot real para este checkpoint.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "pick_and_place" sobre un robot `omx_follower`; no generaliza a otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dataset pequeño: 50 episodios y 22.117 fotogramas son una base limitada; es probable que la política sea sensible a cambios de iluminación, posición de objetos o distractores.
- Dependencia de la configuración de cámaras: los nombres y la resolución (`wrist`, `top`, 480x640) deben coincidir exactamente con los usados en entrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; el autor deja el campo como "More Information Needed".
- Riesgo de sobreajuste al entorno de captura: sin datos de aumentación ni validación cruzada, el rendimiento fuera del setup original es incierto.
- Sin capacidades lingüísticas, de razonamiento simbólico ni de tool calling; no es un modelo de propósito general.
- Sin información sobre sesgos: al ser una política robótica, los sesgos relevantes serían de distribución visual y de dinámica del robot, no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/IssacKIM/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/IssacKIM/pick_and_place_20261112_143943
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IssacKIM/pick_and_place_20261112_143943
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
