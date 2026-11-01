# mim-chess-vlas/train_800_complex__bbox__blackout__sim__all_cameras__live__groot__seed_0

## Resumen

`mim-chess-vlas/train_800_complex__bbox__blackout__sim__all_cameras__live__groot__seed_0` es una política robótica entrenada con LeRobot sobre el backbone GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment orientado a razonamiento y habilidades en robots humanoides. El modelo combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. El repositorio corresponde a un checkpoint concreto (semilla 0) de un experimento de manipulación sobre un robot Franka Panda en simulación.

La política está especializada en una única tarea de pick-and-place: recoger objetos geométricos complejos (descritos mediante prompts de lenguaje muy detallados) y depositarlos en una caja. Consume tres cámaras (vista del agente y dos cámaras en la muñeca), un vector de estado de 9 dimensiones y produce un vector de acción de 7 dimensiones. El dataset de entrenamiento contiene 790 episodios y 157.904 frames a 20 FPS.

Su relevancia es acotada pero clara: sirve como referencia reproducible de cómo se entrena y publica una política GR00T con LeRobot sobre un dataset concreto, con semilla fija y configuración documentada. No es un modelo de propósito general ni un asistente conversacional; es un artefacto de investigación en robótica con 3.144.016.000 parámetros y un repositorio de 12,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en inglés en el dataset de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y las instrucciones de lenguaje, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. La salida es un vector de acción de 7 dimensiones, típico de un efector final de robot manipulador (posición, orientación y pinza). La entrada de estado es un vector de 9 dimensiones y las tres cámaras aportan imágenes de 3×224×224 píxeles.

El entrenamiento se realizó con LeRobot sobre el dataset `train_800_complex__bbox__blackout__sim__all_cameras__live`, con 790 episodios y 157.904 frames a 20 FPS, sobre un robot Panda en simulación. Las tareas son instrucciones de pick-and-place con descripciones geométricas muy específicas de cada objeto (forma, textura, protuberancias, oquedades) y destino en una caja. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el nombre del repositorio sugiere variantes de aumentación (bbox, blackout, sim, all_cameras, live) y una semilla fija (seed 0).

## Capacidades

- Manipulación robótica pick-and-place: recoger objetos descritos por lenguaje y colocarlos en una caja, con una política entrenada específicamente para esta tarea.
- Percepción multivista: procesa tres cámaras simultáneas (agentview, eye_in_hand, eye_in_hand_2) a resolución 224×224.
- Condicionamiento por lenguaje: acepta instrucciones textuales detalladas que describen el objeto objetivo.
- Fusión de propiocepción y visión: integra un vector de estado de 9 dimensiones con las observaciones visuales.
- Generación de acciones continuas de 7 dimensiones mediante flow matching.
- Ejecución en bucle cerrado a 20 FPS, la frecuencia del dataset de entrenamiento.
- Capacidades generales de lenguaje, razonamiento o tool calling: no disponibles en este checkpoint, que es una política de acción y no un modelo conversacional.

## Casos de uso

- Investigación en manipulación robótica: reproducir el experimento con semilla fija (seed 0) para comparar variantes de aumentación (bbox, blackout, all_cameras) sobre el mismo dataset y arquitectura.
- Benchmark de políticas GR00T en LeRobot: usar este checkpoint como línea base de referencia para evaluar cambios en el backbone, el transformer de acciones o la configuración de cámaras.
- Pick-and-place de objetos geométricos complejos en simulación: el modelo está entrenado para objetos con formas irregulares (lóbulos, ranuras, protuberancias) descritos por lenguaje, un escenario más exigente que el pick-and-place de objetos simples.
- Estudio de condicionamiento por lenguaje en robótica: analizar cómo las descripciones geométricas detalladas de los prompts afectan a la selección del objeto y a la trayectoria.
- Evaluación de robustez ante oclusiones y cambios de cámara: las variantes blackout y all_cameras del dataset permiten estudiar el efecto de la disponibilidad de vistas.
- Transferencia sim-to-real como línea de trabajo: aunque el checkpoint se entrena en simulación, sirve de punto de partida para experimentos de adaptación al robot físico con el mismo formato de observaciones y acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros, en FP16 el peso de los parámetros ronda los 6,3 GB, y en BF16 un valor similar; a ello hay que sumar el coste del backbone vision-lenguaje y de las tres cámaras de entrada, por lo que el requisito real será superior y no está documentado.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que quepa en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en precisión reducida, pero no hay confirmación en la información disponible.
- Despliegue: LeRobot (librería declarada en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para una política de acción de este tipo.
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento es de 20 FPS, pero no se publican medidas de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, seed 0) | 3.144.016.000 | no disponible | Pick-and-place en simulación (Panda) | apache-2.0 | HuggingFace, 20 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | Repositorio Isaac-GR00T en GitHub |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | Variantes del mismo dataset (bbox, blackout, all_cameras) | apache-2.0 (presumible) | HuggingFace, mismo espacio `mim-chess-vlas` |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única familia de tareas de pick-and-place sobre objetos concretos; no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento en simulación: el checkpoint se entrena sobre datos simulados (`sim` en el nombre del dataset), por lo que el rendimiento en un robot físico no está garantizado.
- Sin benchmarks publicados: no hay métricas de éxito, robustez o generalización en la información disponible.
- Sin datos de sesgo, alucinación o comportamiento fuera de distribución: no disponibles; en robótica, los fallos se manifiestan como acciones incorrectas o trayectorias inseguras, no como texto alucinado.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés.
- Licencia apache-2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone subyacente (Cosmos-Reason2/Qwen3-VL) y de los datos de entrenamiento antes de un despliegue en producción.
- Repositorio con muy poca tracción (20 descargas, 0 likes) y creado en octubre de 2026: no hay evidencia de validación por terceros.
- El resultado de búsqueda web sobre "MIM" (fabricación de piezas metálicas) no guarda relación con este modelo y no aporta información técnica relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_complex__bbox__blackout__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__bbox__blackout__sim__all_cameras__live
- Repositorio Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
