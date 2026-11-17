# SamerAyyad/VLA_Samer_08.11.2026_400eps_policy_GR00T

## Resumen

VLA_Samer_08.11.2026_400eps_policy_GR00T es una política de imitación robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. Se trata de un modelo visión-lenguaje-acción (VLA) especializado en una única tarea de manipulación: recoger una CPU con una ventilara de succión y depositarla en una caja. El autor, SamerAyyad, ha publicado tanto el dataset de entrenamiento (400 episodios, 259.635 fotogramas a 30 FPS) como los pesos resultantes del ajuste fino.

El modelo parte de la arquitectura GR00T N1.7, que combina un backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) con un transformer de acciones basado en flow matching. La política consume una imagen RGB de 480x640 y un vector de estado de 7 dimensiones (típico de un UR5), y produce una acción de 7 dimensiones por paso. Con 3.144.016.000 parámetros totales y un repositorio de 12,6 GB en safetensors, es un modelo grande para los estándares de políticas de imitación, lo que refleja que incluye el backbone VLA completo.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de LeRobot 0.6.2 para ajustar modelos fundacionales de robótica a tareas concretas; por otro, sirve como ejemplo reproducible de un pipeline completo (dataset, entrenamiento, rollout) para un robot UR5 con una tarea de pick-and-place. No obstante, no se han publicado resultados de evaluación en robot real ni benchmarks, y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la tarea está definida en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7 de NVIDIA: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa la observación visual y la instrucción en lenguaje natural, y un transformer de acciones que genera las acciones mediante flow matching, condicionado por visión, lenguaje y propiocepción. La política está integrada en LeRobot como tipo `groot` y consume `observation.images.camera` (3, 480, 640) y `observation.state` (7,), produciendo `action` (7,).

El ajuste fino se realizó sobre el dataset SamerAyyad/VLA_Samer_08.11.2026_400eps (400 episodios, 259.635 fotogramas, 30 FPS) con la tarea "Pick up the CPU with the suction gripper and place it in the box". La configuración de entrenamiento reportada es: 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4, semilla 42 y LeRobot 0.6.2. No se especifica el número de tokens de entrenamiento del backbone original ni si hubo RLHF/DPO; el ajuste es de imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones condicionadas por una imagen RGB y el estado del robot.
- Comprensión de instrucciones en lenguaje natural para condicionar la política (la tarea se pasa como texto en el rollout).
- Percepción visual mediante backbone VLA (Cosmos-Reason2/Qwen3-VL).
- Ejecución de una tarea concreta de pick-and-place con ventosa de succión sobre un UR5.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recoger una CPU con ventosa y depositarla en una caja, adecuada para tareas repetitivas de clasificación en entornos controlados.
- Base para ajuste fino en tareas similares: al estar entrenada sobre GR00T N1.7 con LeRobot, sirve como punto de partida para reentrenar con nuevos datasets de manipulación sobre UR5.
- Prototipado rápido de políticas VLA: permite validar el pipeline completo (grabación de datos, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigación en imitación robótica: útil para estudiar el comportamiento de un backbone VLA grande (3,1B parámetros) en tareas de manipulación de corto horizonte.
- Demostración educativa de LeRobot: ejemplo reproducible de cómo ajustar un modelo fundacional de robótica con la CLI de LeRobot 0.6.2.
- Pruebas de integración hardware-software: validación de la cadena UR5 + cámara OpenCV + política GR00T en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.144.016.000 parámetros en safetensors (12,6 GB), la inferencia en FP16 requeriría aproximadamente 6,3 GB solo para pesos, más overhead del backbone visual y del transformer de acciones.
- GPU recomendadas: no disponible; por el tamaño del modelo se recomienda una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100, H100), aunque no se confirma en la documentación.
- ¿Cabe en consumer GPU? Probablemente en GPUs de gama alta con 24 GB o más, pero no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA_Samer_08.11.2026_400eps_policy_GR00T | 3.144.016.000 | no disponible | Pick-and-place UR5 con ventosa | Apache 2.0 | Hugging Face (0 descargas) |
| GR00T N1.7 (modelo base NVIDIA) | no disponible | no disponible | Fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea ("Pick up the CPU with the suction gripper and place it in the box"); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación en robot real: no hay tasa de éxito reportada, por lo que se desconoce su fiabilidad.
- Entrenado para un robot UR5 con una cámara concreta y un estado de 7 dimensiones; cambios de hardware, cámara o calibración pueden degradar el rendimiento.
- El dataset tiene 400 episodios y 259.635 fotogramas; la diversidad de posiciones, iluminación y distractores no está documentada.
- Riesgo de sobreajuste al entorno de grabación y de fallo ante objetos o configuraciones no vistas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de GR00T N1.7 conviene revisar las condiciones del modelo base de NVIDIA.
- Sin información sobre sesgos, alucinación en el componente de lenguaje ni limitaciones idiomáticas.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_08.11.2026_400eps_policy_GR00T
- Dataset: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_08.11.2026_400eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_08.11.2026_400eps
- GR00T N1.7 (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
