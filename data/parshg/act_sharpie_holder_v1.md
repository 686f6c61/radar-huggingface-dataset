# ParshG/act_sharpie_holder_v1

## Resumen

`ParshG/act_sharpie_holder_v1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicada en Hugging Face por el usuario ParshG mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que, a partir de observaciones visuales y del estado del robot, predice un fragmento («chunk») de acciones futuras en lugar de un único paso, lo que le permite ejecutar tareas de manipulación fina de forma más estable.

El modelo está especializado en una única tarea: introducir un rotulador Sharpie en un soporte de bolígrafos («Put the Sharpie in the pen holder»). Se entrenó sobre el dataset `ParshG/so101_sharpie_holder_20261006_112937`, con 50 episodios y 35.964 fotogramas grabados a 30 FPS, sobre un robot de tipo `so_follower` equipado con dos cámaras (`front` y `wrist`).

Su relevancia es la de un ejemplo práctico y reproducible del flujo de trabajo de LeRobot: un checkpoint pequeño (51.668.614 parámetros, ~0,2 GB) que puede ejecutarse en hardware modesto y que sirve como referencia para quien quiera entrenar o desplegar políticas ACT en robots de bajo coste. No incluye resultados de evaluación publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y codificadores de imagen, entrenado por imitación |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no usa ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y puede cargarse en fp32/fp16 segun LeRobot |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

Especificaciones adicionales de la política:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist` |
| Entradas | `observation.state` (6,); `observation.images.front` (3, 480, 640); `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea | "Put the Sharpie in the pen holder" |
| Dataset de entrenamiento | ParshG/so101_sharpie_holder_20261006_112937 (50 episodios, 35.964 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es el método descrito en el paper con identificador arXiv:2304.13705, referenciado en las etiquetas del repositorio. La arquitectura es un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE): las observaciones (estado de las articulaciones y dos imágenes RGB de 480×640) se codifican conjuntamente y el decodificador genera un fragmento de acciones futuras en lugar de una sola acción. Esta predicción por chunks, junto con el objetivo variacional, es lo que reduce el error de composición acumulado típico del behavior cloning paso a paso. Los parámetros del modelo (~51,7 M) son compatibles con este esquema, que combina codificadores visuales convolucionales con el transformer.

El entrenamiento siguió el flujo estándar de LeRobot 0.6.2: 50.000 pasos de optimización con AdamW, batch size de 32, learning rate de 1e-05 y semilla 1000, sobre el dataset de demostraciones teleoperadas de la tarea del Sharpie (50 episodios, 35.964 fotogramas a 30 FPS). No se documenta en la información disponible ningún uso de RLHF, DPO ni ajuste por refuerzo; se trata de aprendizaje por imitación supervisado. Tampoco se detalla la composición exacta del dataset más allá de la tarea, el número de episodios y la frecuencia de captura.

## Capacidades

- Generación de acciones de manipulación robótica: predice chunks de acciones de dimensión 6 (grado de libertad del `so_follower`) a partir del estado y de dos vistas de cámara.
- Control visomotor: usa simultáneamente una cámara frontal (`front`) y una de muñeca (`wrist`), lo que permite guiar la aproximación y el agarre del objeto.
- Ejecución de una tarea concreta de pick-and-place: colocar un Sharpie en un soporte de bolígrafos.
- Funcionamiento en bucle cerrado a 30 FPS, en línea con la frecuencia de captura del dataset de entrenamiento.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje ni un agente conversacional.
- No dispone de razonamiento multi-paso simbólico ni de capacidades multilingües.
- No dispone de visión general (captioning, VQA) ni de audio: la visión se usa únicamente como entrada de control.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede integrarse en una celda con un `so_follower` para colocar repetidamente objetos alargados en soportes, aprovechando la política entrenada específicamente para esa tarea.
- Banco de pruebas para pipelines de LeRobot: sirve para validar el comando `lerobot-rollout` con `--strategy.type=base`, comprobando la integración de cámaras, puertos y política antes de escalar a otras tareas.
- Referencia para entrenamiento de políticas propias: al usar el mismo esquema (`--policy.type=act`), el checkpoint sirve como punto de comparación de hiperparámetros (learning rate, batch size, pasos) en nuevos datasets.
- Investigación en imitation learning: permite reproducir el comportamiento de ACT con un modelo pequeño (~51,7 M) y medir su sensibilidad a cambios de posición del objeto, iluminación o distracciones, tal como sugiere la propia model card.
- Docencia y demos de robótica de bajo coste: al caber en hardware modesto y ocupar 0,2 GB, es adecuado para talleres donde se muestre entrenamiento y despliegue de políticas en robots SO-101.
- Prototipado de interfaces humano-robot: puede emplearse para validar teleoperación, calibración de cámaras y cinemática del `so_follower` antes de añadir más tareas o grados de libertad.
- Evaluación de robustez de políticas visomotoras: dado que no hay resultados de éxito publicados, el modelo es un buen punto de partida para ejecutar experimentos controlados (número de ensayos frente a éxitos) y reportarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, los pesos ocupan unos 0,2 GB en fp32 (~0,1 GB en fp16); con dos imágenes de 480×640 procesadas por los codificadores visuales, la inferencia en batch 1 debería caber holgadamente en GPU de consumo con 4 GB o más. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y 4 GB o más de VRAM para inferencia cómoda; una RTX 4090, A100 o H100 ofrecen margen sobrado, pero están muy por encima de lo necesario para este modelo. También puede ejecutarse en CPU o en Apple Silicon (MPS) a través de PyTorch/LeRobot.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo (51,7 M de parámetros) permite ejecutarlo en tarjetas de gama media y baja, e incluso en CPU para pruebas lentas.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` con `--policy.path=ParshG/act_sharpie_holder_v1`; el entrenamiento se realiza con `lerobot-train`. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia, el control se realiza a 30 FPS, la misma frecuencia del dataset, pero no se documenta latencia medida en hardware concreto.
- Requisitos de sistema: puerto serie para el robot (`--robot.port`), dos cámaras OpenCV configuradas a 640×480 y 30 FPS, y nombres de cámara que coincidan con las claves de observación (`front`, `wrist`).

## Comparativa con modelos similares

No se dispone de datos numéricos publicados para esta política ni para alternativas directas en la documentación consultada. La comparación se ofrece a nivel cualitativo:

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParshG/act_sharpie_holder_v1 | ACT (imitation learning) | 51,7 M | Chunk de acciones; sin ventana de texto | no disponible | Hugging Face (libreria lerobot) |
| Otras politicas ACT de LeRobot | ACT (imitation learning) | no disponible | Chunk de acciones | depende del repositorio | Hugging Face / LeRobot |
| Diffusion Policy (referencia del ecosistema LeRobot) | Imitation learning basado en difusion | no disponible | Prediccion de secuencias de acciones | no disponible | Implementacion en LeRobot |
| SmolVLA / modelos VLA | Vision-language-action | no disponible | depende del modelo | no disponible | Hugging Face / LeRobot |

Nota: los campos marcados como "no disponible" no se han encontrado en la información proporcionada; no se han estimado ni inferido.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada solo para la tarea "Put the Sharpie in the pen holder" en un robot `so_follower`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin resultados de evaluación: no hay tasa de éxito publicada, por lo que se desconoce su robustez real ante variaciones de posición, iluminación o distracciones.
- Sensibilidad al entorno: al depender de dos cámaras (`front` y `wrist`), cambios en la calibración, la iluminación o la posición de las cámaras pueden degradar el comportamiento.
- Dependencia de la configuración: los nombres de cámara deben coincidir con las claves de observación usadas en el entrenamiento (`observation.images.front`, `observation.images.wrist`) y el puerto serie debe configurarse correctamente; una discrepancia impide la ejecución.
- Licencia no declarada: la model card indica "[More Information Needed]", por lo que no se puede confirmar el uso comercial ni las condiciones de redistribución. Debe consultarse con el autor antes de cualquier uso en producción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en entornos reales; se recomienda supervisión y barreras de seguridad físicas.
- Sesgos de los datos: al proceder de demostraciones teleoperadas (50 episodios, 35.964 fotogramas), el modelo hereda los sesgos de posiciones, velocidades y condiciones presentes en esas grabaciones.
- Idiomas: no aplica; el modelo no procesa lenguaje natural pese a que la tarea se describa con una cadena de texto (`--task`).
- Fecha de creación futura en los metadatos (2026-10-08): conviene verificar la coherencia del repositorio antes de confiar en las fechas indicadas por la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParshG/act_sharpie_holder_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ParshG/so101_sharpie_holder_20261006_112937
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ParshG/so101_sharpie_holder_20261006_112937
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
