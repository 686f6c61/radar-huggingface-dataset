# JJDUSK/act_screw

## Resumen

`JJDUSK/act_screw` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario JJDUSK en Hugging Face utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está especializado en una única tarea: atornillar un tornillo ("screw the bolt") con un brazo `so_follower` (familia SO-101) equipado con dos cámaras, una frontal y otra en la muñeca.

A diferencia de un modelo de lenguaje, no procesa texto ni tiene ventana de contexto: consume el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y devuelve un vector de acción de 6 dimensiones. El checkpoint tiene 51.668.614 parámetros y se distribuye en safetensors dentro de un repositorio de 3,7 GB, con licencia Apache 2.0.

Su relevancia es práctica: es un ejemplo reproducible y de código abierto de un *pipeline* completo de imitación (30 episodios teleoperados, 28.919 fotogramas a 30 FPS) que sirve como punto de partida para quien quiera replicar ACT sobre hardware de bajo coste o reentrenar la política con sus propios datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y extractor visual ResNet preentrenado |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no hay contexto textual. Entrada: estado (6,) + 2 imagenes (3, 480, 640). Salida: accion (6,) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (sin variantes GGUF, int8 ni int4) |
| Idiomas soportados | No aplica (modelo de robótica, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un *backbone* visual convolucional (ResNet) que codifica cada una de las dos cámaras con un transformer encoder-decoder que modela la secuencia de estados y genera un *chunk* de acciones. La formulación incluye un autoencoder variacional condicional (CVAE) en tiempo de entrenamiento para capturar la variabilidad de las demostraciones humanas; en inferencia se usa únicamente el prior, de forma que la política es determinista. La predicción por bloques de acciones es la innovación central del método: reduce el error de composición acumulado típico de las políticas paso a paso y amortigua el coste de inferencia, ya que un solo *forward pass* cubre varios pasos de control.

El entrenamiento se hizo con LeRobot 0.6.1 sobre el dataset `JJDUSK/so101_screw`: 30 episodios teleoperados, 28.919 fotogramas a 30 FPS, una única tarea ("screw the bolt"). La configuración es de 30.000 pasos, batch de 16, optimizador AdamW y tasa de aprendizaje 1e-5 con semilla 1000. No se documenta en la model card el número total de tokens ni si hubo etapas de RLHF o DPO (no aplicables en este paradigma); el aprendizaje es puramente supervisado por imitación sobre las demostraciones.

## Capacidades

- Manipulación robótica de precisión: ejecuta la tarea de atornillado para la que fue entrenado, a partir de estado articular e imágenes.
- Política visomotora de dos cámaras: fusiona una vista frontal y una vista de muñeca para el control.
- Predicción de *action chunks*: emite secuencias cortas de acciones de 6 dimensiones en lugar de un único paso.
- Control reactivo a 30 FPS nominales, con la frecuencia efectiva determinada por la longitud del *chunk* y el coste de inferencia.
- Punto de partida para *fine-tuning*: la configuración y el *pipeline* de LeRobot permiten reentrenar con un dataset propio cambiando `--dataset.repo_id`.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`, compatibilidad con Weights & Biases.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Atornillado automatizado en una célula de montaje: es la tarea exacta para la que se entrenó; se ejecuta con `lerobot-rollout` sobre un brazo `so_follower` y dos cámaras a 640x480, con una duración de ejecución configurable.
- Prototipado rápido sobre hardware de bajo coste: la familia SO-101 es un brazo abierto y económico, de modo que esta política permite validar un flujo completo de imitación sin presupuesto de robot industrial.
- *Baseline* para nuevas tareas de ensamblaje: sirve como referencia de éxito/fracaso antes de entrenar una política propia con más episodios o con *augmentation*.
- Reentrenamiento con datos propios: el mismo *script* `lerobot-train --policy.type=act` permite sustituir el dataset por uno nuevo y comparar curvas de entrenamiento con la configuración publicada (30k pasos, batch 16, lr 1e-5).
- Docencia e investigación en aprendizaje por imitación: ejemplo reproducible y con licencia permisiva para asignaturas y laboratorios que necesiten un caso real de ACT con configuración documentada.
- Comparación metodológica ACT frente a otras familias (por ejemplo Diffusion Policy) en un mismo *setup* físico, usando esta política como una de las ramas del experimento.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para recolectar trayectorias y analizar modos de fallo (desalineación del tornillo, oclusiones, cambios de iluminación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni tasas de éxito en la información disponible. La model card incluye explícitamente el texto "_No evaluation results have been provided for this policy yet_", y la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) aparece vacía. No existen, por tanto, cifras de MMLU, HumanEval, GSM8K ni equivalentes en robótica (tasa de éxito por tarea) que puedan reportarse.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-3 GB en fp32, considerando 51,7 M de parámetros (unos 207 MB de pesos) más las activaciones de dos imágenes de 480x640 a través del *backbone* ResNet. Es una estimación por cálculo, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente; también A100/H100 si se comparte con otros servicios, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más. La inferencia en CPU es técnicamente posible pero compromete el bucle de control a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política (no hay decodificación de tokens).
- Latencia y *throughput*: no disponible. El bucle de control nominal es de 30 FPS (33 ms por paso), pero la política emite *chunks* de acciones, por lo que la frecuencia real de inferencia es menor que la frecuencia de control.
- Hardware físico necesario: brazo `so_follower`, dos cámaras USB configuradas a 640x480 y 30 FPS, y un puerto serie para el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JJDUSK/act_screw` | 51,7 M | Estado (6,) + 2 imagenes 480x640 | No publicado | Apache 2.0 | Hugging Face, via LeRobot |
| ACT (metodo original, paper 2304.13705) | No disponible en la informacion | Tareas de manipulacion simuladas y reales | Reportado en el paper, no verificable aqui | No disponible en la informacion | Paper + implementacion de referencia |
| Diffusion Policy | No disponible en la informacion | Politicas de difusion para manipulacion visomotora | No disponible en la informacion | No disponible en la informacion | Implementaciones publicas |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas. Cualquier comparación de tasa de éxito exigiría evaluar las políticas en el mismo robot y con las mismas condiciones.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "screw the bolt" con un robot `so_follower`. No generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad real incluso en la tarea objetivo.
- Dataset muy pequeño: 30 episodios y 28.919 fotogramas son insuficientes para cubrir variaciones de posición, iluminación, tipo de tornillo o distractores; se espera un deterioro rápido fuera de la distribución de entrenamiento.
- Dependencia del *setup* físico: la política asume nombres de cámara `front` y `wrist`, resolución 480x640 y calibración concreta del brazo. Cambiar la cámara, la montura o la calibración invalida las acciones.
- Riesgo de sobreajuste a la posición inicial del objeto y a la iluminación del laboratorio donde se grabó.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no se puede usar como agente conversacional ni como *planner*.
- Sesgos: no documentados por el autor. En robótica de imitación el sesgo proviene del operador humano que teleoperó y de las condiciones demográficas y ambientales de la grabación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se ofrece sin garantías y el autor no asume responsabilidad por fallos en entornos físicos.
- Advertencia de seguridad: un fallo de la política sobre un brazo real puede provocar colisiones o daños. Es obligatorio operar con límites de par, parada de emergencia y espacio de trabajo despejado.
- Alucinación en sentido estricto no aplica, pero sí existe el riesgo de acciones incoherentes o saturadas ante entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JJDUSK/act_screw
- Dataset de entrenamiento: https://huggingface.co/datasets/JJDUSK/so101_screw
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JJDUSK/so101_screw
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
