# ranjith3567/pick_yellow_cube_v5_chunk30

## Resumen

`pick_yellow_cube_v5_chunk30` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura SmolVLA (Vision-Language-Action compacta), publicada por el usuario `ranjith3567` en Hugging Face. El modelo resuelve una única tarea manipulativa concreta: "pick the yellow block and place it in brown box" (coger el bloque amarillo y colocarlo en la caja marrón), ejecutada por un robot tipo `so_follower` con dos cámaras (`Top` y `Side`).

SmolVLA, descrito en el paper arXiv:2506.01844, es un modelo visión-lenguaje-acción compacto diseñado para lograr rendimiento competitivo con costes computacionales reducidos y poder desplegarse en hardware de consumo. Este checkpoint concreto tiene 450.046.176 parámetros (dato real de los pesos safetensors) y un tamaño de repositorio de 0,9 GB.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general, sino de un artefacto de investigación reproducible que demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento de política y despliegue en robot real). Es útil como referencia técnica para quienes trabajan en imitación robótica de bajo coste, no como modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action), implementada en LeRobot 0.6.2 |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `Top`, `Side` (más `empty_camera_0`) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Entrada visual | `observation.images.camera1/2/3` `(3, 256, 256)` y `observation.images.empty_camera_0` `(3, 480, 640)` |
| Salida de acción | `action` con forma `(6,)` |
| Dataset de entrenamiento | `ranjith3567/pick_yellow_cube_v5_20261105_191046` |
| Episodios / frames | 100 episodios, 63.143 frames a 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es una política SmolVLA, es decir, un modelo visión-lenguaje-acción que combina un codificador visual (procesa las imágenes de las cámaras a 256×256 y 480×640), un componente lingüístico que interpreta la instrucción de tarea y un cabezal de acción que emite un vector de 6 dimensiones por paso. La arquitectura está pensada para ser compacta y desplegable en hardware de consumo, según la descripción del paper referenciado (arXiv:2506.01844). No se dispone en la información proporcionada de detalles adicionales sobre el número de capas, el mecanismo de atención ni la composición exacta del backbone.

El entrenamiento se realizó mediante imitación (behavior cloning) sobre el dataset `pick_yellow_cube_v5_20261105_191046`, compuesto por 100 episodios y 63.143 frames grabados a 30 FPS, todos correspondientes a la tarea de recoger el bloque amarillo y depositarlo en la caja marrón. Se ejecutaron 100.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. El sufijo `chunk30` del nombre sugiere configuración de action chunking con horizonte 30, aunque este dato no se confirma explícitamente en la model card. No se documenta el uso de RLHF, DPO ni de innovaciones de decodificación especulativa.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Ejecución de una tarea concreta de pick-and-place: "pick the yellow block and place it in brown box".
- Fusión multimodal: integra tres flujos visuales (dos cámaras de 256×256 y una de 480×640) más el estado proprioceptivo de 6 dimensiones.
- Seguimiento de instrucciones de tarea en lenguaje natural (en inglés), conforme al paradigma VLA.
- Despliegue en hardware de consumo, según las características de SmolVLA descritas por sus autores.
- No soporta tool calling ni function calling: es una política de control, no un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento (thinking), visión general, audio ni capacidades multilingües documentadas.
- No se documentan capacidades de agente multi-paso más allá de la secuencia de acciones de la tarea entrenada.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como checkpoint de referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) en un robot `so_follower` con dos cámaras.
- Automatización de una celda de pick-and-place de laboratorio: el modelo ejecuta la tarea de recoger un bloque amarillo y colocarlo en una caja marrón de forma autónoma durante sesiones de hasta 60 segundos mediante `lerobot-rollout`.
- Base para fine-tuning en tareas similares: al estar entrenado con 100 episodios y 63.143 frames, puede servir de inicialización para variantes de la misma tarea con distintos objetos o posiciones.
- Docencia y formación en robótica de imitación: permite mostrar a estudiantes el ciclo completo de entrenamiento de una política VLA compacta con hardware asequible.
- Benchmark interno de infraestructura: útil para medir latencia y throughput del stack LeRobot en GPUs de consumo antes de escalar a políticas mayores.
- Pruebas de integración de cámaras y calibración: el modelo exige claves de observación concretas (`camera1`, `camera2`, `camera3`, `empty_camera_0`), por lo que sirve para validar la configuración de sensores de un robot `so_follower`.
- Validación de pipelines de evaluación en robot real: aunque no hay resultados publicados, el checkpoint permite ejecutar trials y medir tasas de éxito propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros y pesos en safetensors de 0,9 GB, la inferencia en FP32 requeriría del orden de 1,8 GB solo para pesos, más overhead de activaciones y codificadores visuales.
- GPU recomendadas: no especificadas por el autor. SmolVLA está diseñado para hardware de consumo según el paper, por lo que una GPU consumer con suficiente VRAM debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint (0,9 GB) y la orientación de SmolVLA a hardware asequible; no se confirma con datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ranjith3567/pick_yellow_cube_v5_chunk30`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/pick_yellow_cube_v5_chunk30` | 450.046.176 | SmolVLA (LeRobot) | Pick-and-place de bloque amarillo | no disponible | Hugging Face, 0 descargas, 0 likes |
| SmolVLA (modelo base de referencia) | no disponible en esta información | VLA compacto | Propósito general robótico | no disponible | Hugging Face / paper arXiv:2506.01844 |
| Otras políticas LeRobot (ACT, Diffusion Policy, etc.) | no disponible | Políticas de imitación | Tareas manipulativas | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 100 episodios de una única tarea, el modelo está fuertemente sesgado hacia la posición, iluminación y apariencia del entorno de grabación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización pobre fuera de la distribución de entrenamiento (nuevos objetos, posiciones o condiciones de luz).
- Limitación de tarea: solo ejecuta "pick the yellow block and place it in brown box"; no es un modelo de propósito general.
- Limitación de idioma: las instrucciones de tarea están en inglés; no se documentan capacidades multilingües.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card indica "[More Information Needed]", por lo que no se puede garantizar el uso comercial.
- Sin evaluación publicada: no hay tasas de éxito en robot real, lo que impide estimar su fiabilidad en producción.
- Dependencia de hardware específico: requiere un robot `so_follower` y cámaras con nombres y resoluciones concretas (`camera1`, `camera2`, `camera3` a 256×256 y `empty_camera_0` a 480×640); un desajuste en las claves de observación rompe la inferencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-11), lo que conviene verificar antes de usarlo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk30
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
