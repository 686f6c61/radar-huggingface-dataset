# jskumaar/act_ira_lego

## Resumen

`jskumaar/act_ira_lego` es un punto de control de política de robótica entrenado con [ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705), un método de aprendizaje por imitación que predice bloques cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante la biblioteca [LeRobot](https://github.com/huggingface/lerobot) (versión 0.6.2) y está especializado en una única tarea: clasificar piezas LEGO por color, depositando cada pieza en la placa del color correspondiente.

El modelo procede del autor `jskumaar` (Suresh Kumaar Jayaraman), vinculado al proyecto Project-IRA, cuyo trabajo se centra en la explicabilidad, transparencia y confianza en la interacción humano-robot. Se trata de un checkpoint de tamaño muy contenido (51.668.614 parámetros, unos 0,2 GB en safetensors), diseñado para un brazo robótico de tipo `so_follower` equipado con dos cámaras (`wrist_left` y `desk_view`).

Su relevancia actual radica en la creciente popularidad de la imitación de políticas de bajo costo sobre brazos manipuladores asequibles: sirve como ejemplo práctico de un flujo completo (dataset teleoperado → entrenamiento ACT → despliegue en robot real) y como punto de comparación frente a enfoques más recientes, como la política pi0 que el propio Project-IRA ha entrenado para la misma tarea LEGO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en CVAE y transformer; hiperparámetros específicos del checkpoint (tamaño de chunk, backbone visual) no disponibles |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de robótica, no modelo de lenguaje) |
| Tipos de cuantización | No disponible (pesos en safetensors de ~0,2 GB, tamaño coherente con precisión FP32) |
| Idiomas soportados | No aplica (no incluye acondicionamiento por lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist_left` (3×480×640) y `desk_view` (3×600×800) |
| Espacio de acciones | Vector de 6 dimensiones (`action`: (6,)) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso temporal, predice bloques (chunks) de varias acciones consecutivas. Según el artículo de referencia, la arquitectura emplea un autoencoder condicional de variables latentes (CVAE) con un encoder-decoder transformer, y las observaciones visuales se procesan mediante un backbone convolucional. Esta predicción por bloques mitiga el error compuesto típico de la imitación paso a paso y reduce la frecuencia de inferencia necesaria. Los detalles concretos de esta implementación concreta (longitud del chunk, dimensiones del transformer, backbone exacto) no están disponibles en la información publicada.

El entrenamiento se realizó sobre el conjunto de datos [Project-IRA/lego](https://huggingface.co/datasets/Project-IRA/lego): 300 episodios con 298.768 fotogramas a 30 FPS, con 30 variantes de descripción de la misma tarea de clasificación por colores. Las observaciones incluyen el estado proprioceptivo del brazo (vector de 6 dimensiones) y las imágenes de dos cámaras. La configuración de entrenamiento publicada fue: 30.000 pasos, tamaño de batch 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se indica si hubo técnicas adicionales como DPO o RLHF (no aplicables a este tipo de política).

## Capacidades

- Predicción de bloques de acciones para manipulación: agarrar, trasladar y soltar piezas LEGO en placas de color correspondiente.
- Control de un brazo robótico `so_follower` con 6 grados de libertad (estado y acción de 6 dimensiones).
- Percepción visual con dos cámaras simultáneas: vista de muñeca izquierda (480×640) y vista de escritorio (600×800).
- Ejecución de tareas multi-paso dentro del dominio entrenado (secuencias de recogida y colocación repetidas).
- Compatibilidad con el flujo de trabajo de LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento sobre texto ni generación de lenguaje: las descripciones de tarea del dataset actúan como etiquetas, no como instrucciones comprendidas por el modelo.

## Casos de uso

- Clasificación automatizada de piezas por color: el modelo ejecuta directamente la tarea para la que fue entrenado, moviendo piezas LEGO a la placa del color correspondiente en un escenario de mesa con las dos cámaras originales.
- Banco de pruebas de políticas de imitación: al existir un checkpoint de pi0 de Project-IRA para la misma tarea LEGO, este modelo permite comparar de forma controlada ACT frente a arquitecturas VLM-based sobre el mismo dataset y el mismo robot.
- Docencia en robótica y aprendizaje automático: el repositorio acompaña un flujo completo y reproducible (grabación de demostraciones, entrenamiento con hiperparámetros publicados, despliegue con `lerobot-rollout`), útil como material práctico en cursos o talleres.
- Validación de hardware de bajo costo: permite verificar el montaje, la calibración de cámaras y la comunicación serie de un brazo `so_follower` antes de abordar tareas más complejas.
- Punto de partida para transferencia de tareas: los pesos pueden servir de inicialización para ajustar (fine-tuning) políticas sobre tareas de manipulación similares con el mismo robot y el mismo pipeline de LeRobot.
- Demostraciones y divulgación: la tarea de clasificar piezas por color es visualmente comprensible para públicos no técnicos, lo que la hace adecuada para exhibiciones y actividades de divulgación científica.
- Investigación en explicabilidad y confianza humano-robot: el autor declara esa línea de trabajo, y una política simple y verificable como esta es un buen sujeto de estudio para analizar fallos y comportamiento de políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y no se incluye tasa de éxito en la tarea, métricas de error de acción ni comparativas con otros métodos para este checkpoint concreto. El artículo original de ACT reporta tasas de éxito altas en tareas de manipulación, pero no existen cifras publicadas que confirmen ese rendimiento para este modelo específico.

## Requisitos de hardware

- VRAM para inferencia: estimada por debajo de 1 GB para el propio modelo (~0,2 GB de pesos en FP32 más overhead de ejecución); se trata de un modelo muy ligero en comparación con los LLM actuales.
- Inferencia en GPU de consumo: sobrada en cualquier GPU moderna; incluso es viable la ejecución en CPU dada la pequeña talla del modelo, aunque LeRobot recomienda CUDA para un rendimiento fluido.
- Entrenamiento (si se parte de este flujo): requiere GPU con CUDA (`--policy.device=cuda`); la configuración publicada (batch 16, 30.000 pasos) es asumible por GPUs de consumo con 8-16 GB de VRAM, como una RTX 3090 o 4090; no hay cifra oficial publicada de VRAM de entrenamiento.
- Despliegue: mediante la biblioteca LeRobot (versión 0.6.2 o compatible) con el comando `lerobot-rollout`, un puerto serie para el robot y cámaras OpenCV cuyos nombres coincidan con las claves de observación entrenadas (`wrist_left`, `desk_view`).
- Latencia y throughput: no publicadas; el enfoque de bloques de acciones de ACT permite inferir una vez por varios pasos de control, lo que relaja el requisito de latencia de inferencia respecto a políticas de un paso por acción.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| jskumaar/act_ira_lego | ACT (imitación con bloques de acciones) | 51,7 M | Project-IRA/lego (300 episodios, 298.768 fotogramas) | No disponible |
| Project-IRA/TPSoSe2026_Pi05_LeRobot_SO101_Finetuning_V4_Lego | pi0 (VLM con experto de acción, fine-tuning) | Orden de miles de millones (base pi0) | Fine-tuning sobre la misma tarea LEGO del mismo laboratorio | No disponible |
| Diffusion Policy (referencia académica en LeRobot) | Imitación generativa mediante difusión | Orden de decenas de millones según variante (dato exacto no disponible) | Datasets de manipulación independientes | No disponible |

En términos generales: ACT es la opción más ligera y rápida de inferir de las tres, adecuada cuando el dominio de tareas es estrecho y las demostraciones son de buena calidad; Diffusion Policy suele ofrecer mayor capacidad de capturar distribuciones de acciones multimodales a cambio de una inferencia más costosa; y pi0 aporta mayor generalización visual y semántica gracias a su base VLM, con un coste computacional muy superior. Para la tarea LEGO concreta de Project-IRA, la elección práctica depende de la GPU disponible y del compromiso entre simplicidad (ACT) y generalidad (pi0).

## Limitaciones y advertencias

- Licencia no especificada en la model card: debe verificarse antes de cualquier uso comercial o redistribución.
- Sin evaluación publicada: no existe tasa de éxito ni métricas de error para este checkpoint, por lo que su rendimiento real debe validarse en el propio robot antes de confiar en él.
- Alta especificidad del dominio: el modelo solo es válido para la tarea de clasificación de LEGO por color con la disposición de placas, las cámaras (nombres, resoluciones y posiciones) y el robot concretos con los que fue entrenado.
- Sensibilidad típica de ACT a la calidad de las demostraciones y a cambios de iluminación, fondo o posición de las placas, que pueden provocar fallos de generalización.
- Riesgo de fallos en cascada ante piezas o situaciones no vistas durante el entrenamiento (piezas de otros colores, oclusiones, escenas distintas).
- No comprende lenguaje natural: no acepta instrucciones nuevas ni tareas no vistas; las frases del dataset son etiquetas equivalentes.
- Sin adopción registrada en el Hub (0 descargas y 0 me gusta en el momento de redactar la ficha), lo que sugiere que se trata de un checkpoint personal o educativo sin validación comunitaria.
- Dependencia de la versión de LeRobot 0.6.2: conviene comprobar la compatibilidad con versiones posteriores de la biblioteca antes de desplegar.

## Enlaces

- Modelo: https://huggingface.co/jskumaar/act_ira_lego
- Perfil del autor: https://huggingface.co/jskumaar
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Project-IRA/lego
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Project-IRA/lego
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout (inferencia): https://huggingface.co/docs/lerobot/main/en/inference
- Organización Project-IRA: https://huggingface.co/Project-IRA
- Modelo alternativo de Project-IRA para la misma tarea (pi0): https://huggingface.co/Project-IRA/TPSoSe2026_Pi05_LeRobot_SO101_Finetuning_V4_Lego
