# go234/act_chunk50

## Resumen

`go234/act_chunk50` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv 2304.13705 por Zhao et al. (2023). No es un modelo de lenguaje: es un modelo de control robótico entrenado para una tarea concreta de manipulación ("Pick up the cube and put it in the box") sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot). El autor, `go234`, lo ha publicado en Hugging Face mediante la librería LeRobot, con licencia Apache 2.0.

El modelo consume dos flujos de imagen de 3x480x640 píxeles (cámaras `cam1` y `cam2`) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Su particularidad frente a políticas que predicen una acción por paso es que genera *chunks* de acciones (secuencias cortas), lo que reduce el error de acumulación y produce movimientos más suaves y estables. El nombre del repositorio, `act_chunk50`, sugiere un tamaño de chunk de 50 pasos, aunque este dato no se explicita en la model card.

Es relevante en el contexto actual de robótica open source porque ejemplifica el flujo completo de LeRobot: dataset teleoperado, entrenamiento con `lerobot-train`, publicación en el Hub y despliegue con `lerobot-rollout`. Con 51,6 millones de parámetros y un repo de 0,2 GB, es un modelo ligero, ejecutable en hardware modesto, pero de alcance muy limitado: una única tarea, un único tipo de robot y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la configuración ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice secuencias de acciones (chunks) en lugar de pasos individuales. La arquitectura combina un backbone visual (típicamente ResNet) que codifica las imágenes de las cámaras con un encoder-decoder transformer que fusiona la observación del estado del robot y genera el chunk de acciones. El mecanismo de chunking, junto con el *temporal ensembling* en inferencia, mitiga el error compounding típico de las políticas paso a paso.

El entrenamiento se realizó sobre el dataset `go234/cube-box_20261013_041703`: 50 episodios teleoperados, 24.423 frames a 30 FPS, una única tarea. La configuración reportada es 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.0. No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables en este paradigma). El nombre del checkpoint sugiere chunk size 50, pero no se confirma en la model card.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multi-cámara: procesa simultáneamente `cam1` y `cam2` a 480x640.
- Predicción de chunks de acciones, lo que produce trayectorias más suaves que políticas de acción única.
- Ejecución de una tarea específica: recoger un cubo y depositarlo en una caja.
- Integración con el ecosistema LeRobot: entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como referencia para validar un pipeline LeRobot completo (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Prototipado de manipulación pick-and-place: punto de partida para un sistema de recogida y depósito de objetos con un brazo SO-100/SO-101 en laboratorio.
- Benchmark interno de infraestructura: con 51,6 M de parámetros y 0,2 GB, permite medir latencia de inferencia y throughput en GPUs de consumo sin cuellos de botella de memoria.
- Docencia y formación en robótica: ejemplo didáctico de aprendizaje por imitación con datos teleoperados y arquitectura transformer.
- Base para *fine-tuning*: reentrenar sobre un dataset propio con la misma morfología de robot y tarea similar para adaptar la política.
- Pruebas de integración hardware-software: validar cámaras, calibración y puertos del robot con una política ya entrenada antes de invertir en datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 51,6 M de parámetros (unos 206 MB de pesos); en la práctica, el consumo lo dominan las activaciones de las dos imágenes 3x480x640, por lo que se recomienda al menos 4-8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM; una RTX 3060/4060 o superior es más que suficiente. A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada reciente; también es viable en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), o carga directa del checkpoint con la API de LeRobot en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La frecuencia de control está condicionada por el bucle de inferencia y las cámaras a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| go234/act_chunk50 | 51,6 M | ACT | Pick-and-place cubo en caja, robot SO follower | Apache 2.0 | No |
| Políticas ACT de referencia (LeRobot, p. ej. `lerobot/act_*`) | ~50 M (orden de magnitud) | ACT | Distintas tareas de manipulación | Apache 2.0 | Variable según checkpoint |
| Diffusion Policy (LeRobot) | no disponible | Diffusion | Manipulación | Apache 2.0 | Variable según checkpoint |
| SmolVLA (LeRobot) | no disponible | VLA | Manipulación generalista | no disponible | no disponible |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Alcance restringido a una única tarea y morfología: la política solo se ha entrenado para "Pick up the cube and put it in the box" con un robot `so_follower` y dos cámaras concretas.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de las cámaras: los nombres y la configuración (`cam1`, `cam2`, 640x480, 30 FPS) deben coincidir con los del entrenamiento; cambios de calibración o iluminación pueden degradar el comportamiento.
- Sensibilidad al dominio: cambios en posiciones de objetos, fondo, iluminación o un robot distinto del mismo tipo pueden reducir el rendimiento (no cuantificado).
- Riesgo de alucinación en sentido figurado: puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de seguridad intrínseco.
- Sin capacidades lingüísticas ni de razonamiento: no es adecuado para tareas de texto, código o agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Requiere supervisión humana en despliegues reales: al no haber métricas de seguridad ni de éxito, debe operarse con límites de par y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/act_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
