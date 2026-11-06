# chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F10

## Resumen

`act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F10` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv 2304.13705 por Tony Z. Zhao et al. El modelo lo publica el usuario `chenproject35` en Hugging Face y está entrenado y empaquetado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Resuelve una tarea muy concreta: coger un objeto denominado `inreach2` y colocarlo en un soporte (`jig`) con un brazo robótico de tipo `rebot_b601_follower`.

La política consume dos cámaras (`cam_front` y `cam_wrist`) a resolución 640x480 y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones. El modelo tiene 51.670.663 parámetros, un tamaño modesto que lo hace ejecutable en hardware de consumo, y se distribuye en formato safetensors (8,7 GB de repositorio, incluyendo checkpoints y artefactos de entrenamiento).

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de una política visuomotora con datos de teleoperación (60 episodios, 58.148 frames a 30 FPS), útil para quienes trabajan con LeRobot y quieren estudiar el pipeline completo desde la grabación de datos hasta el despliegue en un robot físico. El nombre del repositorio sugiere variantes de evaluación (out-of-distribution `ood_cell4`, human-in-the-loop `hil`, y un parámetro `F10`), aunque la model card no documenta estos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de horizonte de acción, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice "trozos" (chunks) de acciones de corto horizonte en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad de ejecución. La arquitectura combina un codificador visual (procesa las dos cámaras, `cam_front` y `cam_wrist`, cada una con entrada (3, 480, 640)) con un transformer que fusiona la observación de estado (7 dimensiones) y genera la secuencia de acciones (7 dimensiones por paso). El paper original también introduce una variante con ensamblado temporal (temporal ensembling) para suavizar las transiciones entre chunks.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `chenproject35/pick-and-place-b601-60ep-yaw0-v2`: 60 episodios, 58.148 frames a 30 FPS, tarea única "Pick up inreach2 and place it in the jig." La configuración reportada incluye 70.000 pasos de entrenamiento, batch size 4, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni datos adicionales fuera del dataset citado; el nombre del repositorio (`ood_cell4`, `hil`, `rac`, `r1`, `F10`) apunta a experimentos de robustez o ajuste fino, pero su significado no se explica.

## Capacidades

- Control visuomotor de un brazo robótico `rebot_b601_follower` para la tarea de pick-and-place especificada.
- Procesamiento de dos cámaras simultáneas (`cam_front` y `cam_wrist`) a 640x480 y 30 FPS.
- Predicción de acciones de 7 dimensiones (típicamente 6 grados de libertad más pinza) en forma de chunks.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere recompensas ni entorno simulado.
- Ejecución mediante `lerobot-rollout` con la estrategia `base`, sin grabación de episodios.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento explícito: es una política motora, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo coge el objeto `inreach2` y lo inserta en el `jig`, tarea para la que fue entrenado específicamente; adecuado para celdas de fabricación con posiciones y objetos fijos.
- Estudio y reproducción del pipeline LeRobot: sirve como referencia para validar la instalación, la calibración del robot y la grabación de datos antes de entrenar políticas propias.
- Base para ajuste fino (fine-tuning) en tareas similares: al estar en formato LeRobot y Apache-2.0, se puede reentrenar con `lerobot-train` sobre nuevos datasets de pick-and-place.
- Evaluación de robustez out-of-distribution: el sufijo `ood_cell4` del repositorio sugiere que el modelo se ha usado para medir comportamiento en celdas o configuraciones distintas de las de entrenamiento; útil para investigadores que estudian generalización.
- Pruebas de human-in-the-loop (HIL): el sufijo `hil` indica posibles experimentos de corrección humana durante la ejecución, aprovechables para estudiar estrategias de intervención.
- Docencia y demostraciones de aprendizaje por imitación: el tamaño de 51,7 M parámetros y la licencia permisiva permiten desplegarlo en laboratorios con hardware modesto.
- Benchmark interno de políticas ACT: comparar éxito y estabilidad frente a otras políticas entrenadas con el mismo dataset o configuraciones cercanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M parámetros y entradas visuales 640x480, la huella es modesta y cabe con holgura en GPUs de consumo, pero no se aporta una cifra oficial.
- GPU recomendadas: no disponible; LeRobot admite `--policy.device=cuda`, por lo que se espera funcionamiento en GPUs NVIDIA con CUDA.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo; no se especifican modelos concretos (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el repositorio usa la librería `lerobot`, no vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la ejecución está limitada por la frecuencia de control del robot y por el FPS de las cámaras (30 FPS en entrenamiento), pero no se publican medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT u otros métodos de imitación, ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up inreach2 and place it in the jig.") y un único tipo de robot (`rebot_b601_follower`); no generaliza a otras tareas, objetos o brazos sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez, pese a los sufijos `ood_cell4` y `hil` en el nombre.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`cam_front`, `cam_wrist`), y la calibración del robot afecta al comportamiento.
- Riesgo de sobreajuste al dataset de 60 episodios: la variabilidad de posiciones, iluminación y distractores no está documentada.
- Posible degradación fuera de distribución: el propio nombre del repositorio señala escenarios OOD, pero no se cuantifica la caída de rendimiento.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene citar el paper de ACT y LeRobot según las indicaciones del autor; no se documentan restricciones adicionales.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de lenguaje, agente conversacional ni herramienta de propósito general.
- El repositorio ocupa 8,7 GB, probablemente por checkpoints intermedios; para despliegue conviene descargar solo los pesos finales necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F10
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset relacionado: https://www.datacombats.com/datasets/chenproject35/pick-and-place-b601-30ep-v3
