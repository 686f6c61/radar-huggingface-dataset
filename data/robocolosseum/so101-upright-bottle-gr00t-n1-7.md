# RoboColosseum/so101-upright-bottle-gr00t-n1.7

## Resumen

`RoboColosseum/so101-upright-bottle-gr00t-n1.7` es una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, especializada en una única tarea de manipulación: recoger un bote de zumo caído y ponerlo de pie sobre la mesa. El modelo consume observaciones multimodales (estado propioceptivo de 6 dimensiones y dos cámaras RGB de 480x640) y produce acciones de 6 dimensiones para un robot `so_follower` (SO-101). Está publicado con licencia Apache 2.0 y un total de 3.144.016.000 parámetros según los pesos en safetensors.

GR00T N1.7 es un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. Combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. Esta ficha concreta es un fine-tuning de esa base sobre 100 episodios y 35.934 frames grabados a 30 FPS.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot para adaptar un modelo fundacional a un robot de bajo coste como el SO-101; por otro, sirve como referencia de cómo se publica una política de imitación con su dataset, su configuración de entrenamiento y sus comandos de despliegue. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front`, `wrist` (RGB 3x480x640) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Dataset de entrenamiento | `Jiamo0912/so101-upright-bottle` (100 episodios, 35.934 frames, 30 FPS) |
| Tarea | "Pick up the fallen juice bottle and stand it upright on the table." |
| Pasos de entrenamiento | 40.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 102,2 GB |

## Arquitectura y entrenamiento

La política se construye sobre GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA. La arquitectura combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las trayectorias de acción condicionadas por la representación multimodal y por el estado propioceptivo del robot. Esta separación permite reutilizar un modelo de razonamiento visual general y adaptar solo la cabeza de acciones a la morfología y tarea concretas.

El fine-tuning se realizó con LeRobot 0.6.1 sobre el dataset `Jiamo0912/so101-upright-bottle`, compuesto por 100 episodios de demostración teleoperada (35.934 frames a 30 FPS) de la tarea de enderezar un bote de zumo. Se entrenaron 40.000 pasos con batch size 32, AdamW y learning rate 1e-4. No se especifica en la información disponible si hubo RLHF, DPO ni ninguna fase de ajuste por preferencias; se trata de aprendizaje por imitación supervisado sobre demostraciones. Tampoco se detalla la composición del dataset más allá de la tarea y las métricas de episodios y frames.

## Capacidades

- Manipulación robótica de una sola tarea: recoger un bote de zumo caído y dejarlo vertical sobre la mesa.
- Percepción visual multimodal mediante dos cámaras RGB (frontal y de muñeca) a 480x640.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como prompt de texto).
- Fusión de visión, lenguaje y propiocepción (estado de 6 dimensiones) para predecir acciones de 6 dimensiones.
- Control de un robot SO-101 (`so_follower`) mediante el stack de LeRobot.
- Ejecución de políticas en bucle cerrado con `lerobot-rollout` a 30 FPS.
- Reentrenamiento y adaptación a otros datasets o robots mediante `lerobot-train --policy.type=groot`.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo general ni otras modalidades (audio, vídeo) en la información disponible.

## Casos de uso

- Automatización de una celda de picking de laboratorio: la política ejecuta la tarea de enderezar botes caídos en un entorno controlado con el SO-101, útil para validar flujos de manipulación de objetos cilíndricos antes de escalar a producción.
- Base para fine-tuning en tareas de enderezado de objetos: al estar entrenada sobre GR00T N1.7 con LeRobot, sirve como punto de partida para adaptar la misma morfología a otros objetos (latas, botellas, vasos) con un dataset propio de 50-100 episodios.
- Docencia y formación en aprendizaje por imitación: el repositorio incluye dataset, configuración de entrenamiento y comandos de despliegue, lo que permite reproducir el pipeline completo en un curso de robótica con hardware de bajo coste.
- Benchmark interno de políticas VLA: sirve como referencia base para comparar nuevas políticas sobre la misma tarea y el mismo robot, midiendo tasas de éxito con el protocolo de evaluación del propio equipo.
- Prototipado de pipelines de datos: el dataset de 35.934 frames a 30 FPS y la configuración de entrenamiento permiten experimentar con aumentos de datos, cambios de resolución o variaciones de batch size y learning rate.
- Integración en flujos de investigación con LeRobot: la política se puede lanzar con `lerobot-rollout` y combinarse con el resto de herramientas del ecosistema (visualización de datasets, CLI de entrenamiento) para estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 6-7 GB solo para pesos, más overhead del backbone visual y del transformer de acciones; sin embargo, el autor no publica requisitos oficiales.
- GPU recomendadas: no disponible. Para entrenamiento con 40.000 pasos y batch 32 sobre un modelo de este tamaño, se requeriría una GPU con al menos 24-40 GB de VRAM en función de la precisión y del uso de checkpointing; el autor no especifica el hardware empleado.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, una RTX 4090 (24 GB) podría albergar la inferencia en FP16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), y entrenamiento con `lerobot-train --policy.type=groot --policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/so101-upright-bottle-gr00t-n1.7` | 3.144.016.000 | no disponible | Enderezar bote con SO-101 | Apache 2.0 | HuggingFace, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Imitación sobre SO-101 | Apache 2.0 (LeRobot) | HuggingFace, ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a aspectos estructurales: esta política es un fine-tuning de GR00T N1.7, mientras que ACT y Diffusion Policy son arquitecturas de imitación más ligeras y habituales en el ecosistema LeRobot para robots SO-101.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable fuera del dataset de entrenamiento.
- Tarea única y estrecha: solo se ha entrenado para enderezar un bote de zumo caído; no generaliza a otras tareas ni objetos sin fine-tuning adicional.
- Dependencia de la morfología: está ajustada a un robot `so_follower` con dos cámaras concretas (`front`, `wrist`); cambiar la configuración de cámaras o el robot invalida la política.
- Dataset pequeño: 100 episodios y 35.934 frames son una base limitada; es probable que la política sea sensible a variaciones de iluminación, posición del objeto, fondo y distractores.
- Riesgo de sobreajuste al entorno de grabación: sin aumentos de datos ni evaluación cruzada, el comportamiento fuera de las condiciones del dataset es incierto.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset reducido y una tarea concreta, su comportamiento está fuertemente condicionado por esas demostraciones.
- Riesgo de alucinación de acciones: como todo modelo generativo de acciones, puede producir trayectorias no válidas o inseguras ante entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar también las licencias del modelo base GR00T N1.7 y del dataset.
- Tamaño del repositorio: 102,2 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para descarga y despliegue.
- Idiomas: no se especifican; la instrucción de tarea está en inglés y no hay evidencia de soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/so101-upright-bottle-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-upright-bottle
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-upright-bottle
- Repositorio GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
