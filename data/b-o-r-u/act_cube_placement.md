# b-o-r-u/act_cube_placement

## Resumen

`b-o-r-u/act_cube_placement` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub con LeRobot, la librería de Hugging Face para machine learning en robótica real. Resuelve una tarea concreta de manipulación: agarrar un cubo dorado y depositarlo en una cesta azul, sobre un robot de tipo `so_follower`.

A diferencia de los modelos de lenguaje, esta política consume observaciones multimodales del robot (estado de las articulaciones y dos cámaras) y produce directamente comandos de acción de 6 dimensiones. ACT predice "chunks" de acciones cortas en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en ejecución. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB.

Es relevante como ejemplo práctico y reproducible de un pipeline completo de imitación en robótica: dataset de teleoperación, entrenamiento con LeRobot 0.6.2 y despliegue con `lerobot-rollout`. No obstante, se trata de una política específica de tarea, entrenada con solo 50 episodios, sin resultados de evaluación publicados y sin licencia declarada, por lo que su uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` (3, 640, 480) y `side` (3, 480, 640) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `wrist` y `side`), un codificador del estado del robot (vector de 6 dimensiones) y un transformer que predice secuencias de acciones (chunks) en lugar de un único paso. Esta predicción por chunks es la innovación central del método: reduce el horizonte efectivo de error y suaviza la ejecución. La política se entrenó con teleoperación sobre el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.2 durante 23.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de entrenamiento (`b-o-r-u/cube_placement_20261127_204131`) contiene 50 episodios y 20.529 frames a 30 FPS, con una única tarea: "Grab the gold cube and put it into the blue basket". No se documenta el uso de RLHF, DPO ni otras técnicas de ajuste posteriores; es imitación supervisada pura sobre datos de teleoperación.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones para el robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente las cámaras de muñeca (`wrist`) y lateral (`side`).
- Ejecución de una tarea específica de pick-and-place: agarrar el cubo dorado y colocarlo en la cesta azul.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensa explícita).
- Predicción de chunks de acciones para ejecución suave y estable.
- Integración nativa con el ecosistema LeRobot (entrenamiento, rollout y visualización de dataset).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recoger el cubo y depositarlo en la cesta sobre un robot `so_follower`, útil como referencia reproducible para validar un setup de hardware y cámaras.
- Base para fine-tuning en tareas similares: al ser una política ACT entrenada con LeRobot, sirve como punto de partida para reentrenar con un dataset propio de manipulación de objetos pequeños.
- Prototipado rápido de pipelines de imitación: permite recorrer el flujo completo (grabación con teleoperación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en un caso acotado y con bajo coste computacional.
- Docencia y divulgación: ejemplo didáctico de ACT con dataset, configuración de entrenamiento y comandos de ejecución documentados, adecuado para cursos de robótica e IA.
- Benchmark interno de hardware: sirve para comparar latencia y estabilidad de distintos robots o configuraciones de cámara bajo una misma política y tarea.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de episodios (50 en este caso) y de la predicción por chunks en la tasa de éxito, siempre que se realice una evaluación propia.
- Integración en entornos controlados de demostración: útil en demos de ferias o vídeos donde la tarea está fijada y el entorno es conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la inferencia es muy ligera y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; se espera que funcione en RTX 3060, RTX 4090, A100 o H100. La model card no especifica requisitos mínimos.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; el cuello de botella real es el robot y las dos cámaras a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot), con `--policy.path=b-o-r-u/act_cube_placement` y `--robot.type=so_follower`. Entrenamiento con `lerobot-train`.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se documenta la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| b-o-r-u/act_cube_placement | ACT (LeRobot) | 51,7 M | Pick-and-place de cubo en cesta | no disponible | Hugging Face Hub |
| Políticas ACT de referencia de LeRobot | ACT (LeRobot) | variable | Tareas de manipulación diversas | según repositorio | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | variable | Manipulación visomotora | según repositorio | Hugging Face Hub / papers |
| Políticas basadas en VLA (p. ej. RT-2, OpenVLA) | VLA | miles de millones | Manipulación generalista | según modelo | Papers / Hub |

La comparación cuantitativa de rendimiento no está disponible porque este modelo no publica evaluación. Frente a políticas VLA de gran escala, esta ACT es mucho más pequeña y específica de tarea, pero también más fácil de entrenar y desplegar en un robot de sobremesa.

## Limitaciones y advertencias

- Específica de tarea: solo se ha entrenado para "Grab the gold cube and put it into the blue basket"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 50 episodios y 20.529 frames, lo que limita la robustez ante variaciones de posición, iluminación o distractores.
- Sin evaluación publicada: no hay tasa de éxito ni condiciones de prueba documentadas; cualquier uso en producción requiere validación propia.
- Licencia no declarada: la model card indica "[More Information Needed]" y el Hub no muestra licencia; el uso comercial es incierto y debe consultarse con el autor.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres e índices exactos (`wrist`, `side`) y resoluciones (640x480 y 480x640).
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo o posición de objetos pueden degradar el comportamiento.
- Sin capacidades de lenguaje, tool calling ni razonamiento: no debe confundirse con un modelo conversacional.
- Sesgos y alucinaciones: no aplican en el sentido habitual de LLM, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b-o-r-u/act_cube_placement
- Dataset de entrenamiento: https://huggingface.co/datasets/b-o-r-u/cube_placement_20261127_204131
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=b-o-r-u/cube_placement_20261127_204131
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
