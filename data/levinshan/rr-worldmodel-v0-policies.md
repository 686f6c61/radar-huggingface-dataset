# LevinShan/rr-worldmodel-v0-policies

## Resumen

rr-worldmodel-v0-policies es una colección de checkpoints de políticas de control robótico (visión-lenguaje-acción) entrenadas sobre el conjunto de datos `data/rr-worldmodel_v0` para un brazo UR5. El repositorio lo publica el usuario LevinShan en Hugging Face y no documenta un modelo base propio: agrupa pesos derivados de dos familias de arquitecturas, Cosmos3-Edge (8 variantes en bf16) y Fast-WAM (2 variantes entrenadas en fp8), todas orientadas a predecir acciones motrices a partir de observaciones RGB y una instrucción en lenguaje natural.

Cada checkpoint recibe tres cámaras (vista cenital de 620x620 y dos vistas de muñeca de 480x480 en uint8 RGB), el estado de observación del robot y la instrucción de la tarea, y produce objetivos absolutos de TCP `[x, y, z, rx, ry, rz, gripper]` a 15 Hz. Los modelos Cosmos generan 16 pasos de acción por inferencia (32 en la variante `obs5_chunk32`), mientras que Fast-WAM emite 32 pasos.

Su relevancia es acotada y experimental: se trata de pesos de investigación para manipulación robótica de escritorio, con métricas de error en bucle abierto sobre los propios episodios de entrenamiento, sin model card en sentido estricto (el README es un registro de experimentos), sin licencia declarada y con 0 descargas en el momento de la consulta. El repositorio ocupa 78,1 GB, aunque cada checkpoint individual pesa 6,3 GB (Cosmos) o 12 GB (Fast-WAM). No hay información sobre idiomas soportados, pipeline ni benchmarks estándar de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos familias: Cosmos3-Edge (modelo de mundo/flow-matching para video y acción) y Fast-WAM; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de observación de 5 fotogramas en la variante `obs5_chunk32`) |
| Tipos de cuantizacion | Pesos en bf16 (Cosmos y export de Fast-WAM); entrenamiento fp8 con torchao float8 en Fast-WAM; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en `tasks.jsonl`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`weights/`) para Cosmos; `model.pt` para Fast-WAM |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Entradas | Cámara cenital 620x620 + wrist1 + wrist2 480x480, uint8 RGB; `observation.state`; instrucción de tarea |
| Salida | Objetivos absolutos de TCP `[x, y, z, rx, ry, rz (rotvec), gripper]`, gripper 1=abierto, 0=cerrado |
| Frecuencia de acción | 15 Hz |
| Horizonte de acción | Cosmos3-Edge: 16 pasos (32 en `obs5_chunk32`); Fast-WAM: 32 pasos |
| Tamaño por checkpoint | 6,3 GB (Cosmos) / 12 GB (Fast-WAM) |
| Tamaño del repo | 78,1 GB |
| Robots | UR5 |

## Arquitectura y entrenamiento

La familia Cosmos3-Edge se entrena con flow-matching sobre pares (video, acción): el README indica que registra una pérdida de flow-matching de 10 x (video + acción), lo que sugiere un modelo de mundo que modela conjuntamente la dinámica visual y la acción motriz. La familia Fast-WAM registra 1 x cada término y exporta a bf16 desde un entrenamiento en fp8 (torchao float8), lo que reduce el coste de entrenamiento pero hace que las pérdidas no sean comparables entre familias, tal como advierte el autor.

Los datos de entrenamiento son demostraciones del dataset `rr-worldmodel_v0`. Hay dos regímenes: "local", con 5 tareas, y "mix", con 22 tareas de las cuales el 50% son locales. Los checkpoints Cosmos se entrenaron con lote 1024 durante 1.400, 2.000, 2.800 (local) o 4.000 y 5.600 iteraciones (mix), con decaimiento lineal de la tasa de aprendizaje hasta 0 en los checkpoints `_itN`. Las variantes `_2step` se ajustan en dos niveles de ruido (los que usa UniPC con `num_steps=2`) y reducen el coste de inferencia de ~0,42 s a ~0,24 s por chunk. Fast-WAM se entrenó con lote 512 durante 2.800 (local) o 5.600 iteraciones (mix) y usa embeddings T5 offline de las instrucciones, almacenados en `t5_embeddings/`. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Predicción de acciones de manipulación robótica de 6 grados de libertad más apertura de pinza, a 15 Hz, para un UR5.
- Control viso-motor multi-cámara: integra una vista cenital y dos vistas de muñeca.
- Condicionamiento por instrucción en lenguaje natural (5 tareas locales; hasta 22 en los modelos mix).
- Generación de chunks de acción: 16 pasos (Cosmos), 32 pasos (`obs5_chunk32` y Fast-WAM).
- Variante con decodificación reducida a 2 pasos de denoising (UniPC) para menor latencia.
- Modelo de mundo con modelado conjunto de video y acción (familia Cosmos), según la formulación de la pérdida.
- No se documenta tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking".

## Casos de uso

- Manipulación de pick-and-place en laboratorio: usar `cosmos3_edge_local_it2800` para tareas como empujar un bloque a una ranura o apilar vasos, con el checkpoint más entrenado de la familia local (error medio en bucle abierto de 3,1 mm en `push_the_red_block_into_the_cutout`).
- Ensamblaje de precisión con objetos pequeños: la variante `obs5_chunk32_2step` obtiene errores de 2,1-3,8 mm con ~0,24 s por chunk, adecuada para inserción de aros en pivotes o tapado de bloques donde el coste por inferencia importa.
- Generalización a más tareas: los checkpoints `cosmos3_edge_mix_it5600` cubren 22 tareas con 50% de datos locales, útiles para evaluar transferencia entre tareas con un solo modelo.
- Control de robot desde una única instrucción en lenguaje natural: integrar `inference.py` de cada carpeta en un bucle de control que lea la instrucción de `tasks.jsonl` y ejecute los objetivos TCP a 15 Hz.
- Evaluación comparativa de arquitecturas: contrastar Cosmos3-Edge frente a Fast-WAM con el mismo dataset y robot para estudiar el compromiso entre error en bucle abierto (Fast-WAM reporta 0,4-1,8 mm) y coste de inferencia.
- Vertido de líquidos y tareas de contacto: el modelo mix incluye `pour_water` (error 10,5-12,1 mm) y `stack_red_cup_on_the_blue_cup`, útil para estudiar tareas con contacto y estado parcialmente ocluido.
- Investigación en modelos de mundo para robótica: reutilizar los pesos Cosmos como base para experimentos de flow-matching video-acción o para fine-tuning con nuevos datos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de NLP. El autor sí reporta error de posición en bucle abierto sobre el episodio 3 de cada tarea de entrenamiento (media sobre el chunk, en mm), que son ajustes a las demostraciones y no miden generalización:

| Tarea | edge local 1400 / 2000 / 2800 | edge mix 2800 / 4000 / 5600 | fastwam local / mix | hold-still |
|---|---|---|---|---|
| push_the_red_block_into_the_cutout | 4,3 / 3,9 / 3,1 | 4,8 / 4,9 / 5,0 | 0,4 / 0,5 | 15,5 |
| nest_one_cup_into_another | 8,8 / 7,6 / 6,1 | 8,7 / 8,6 / 7,3 | 1,8 / 1,2 | 19,0 |
| place_the_green_ring_onto_the_middle_yellow_peg | 7,5 / 7,5 / 7,7 | 7,7 / 7,9 / 8,1 | 0,6 / 0,7 | 17,9 |
| cover_the_red_block_with_the_cup | 9,8 / 9,7 / 7,7 | 10,4 / 9,8 / 9,9 | 1,1 / 1,0 | 18,9 |
| place_the_mango_onto_the_blue_plate | 9,4 / 8,7 / 8,2 | 8,0 / 8,7 / 7,6 | 0,8 / 1,4 | 22,7 |
| stack_red_cup_on_the_blue_cup | - | 7,0 / 6,5 / 6,2 | - / 1,0 | 12,2 |
| pour_water | - | 11,6 / 12,1 / 10,5 | - / 1,5 | 13,1 |

Resultados adicionales de la variante `obs5_chunk32` (fotogramas t-4..t, 32 acciones, media de los 16 primeros pasos): push 2,4; nest 5,9; ring 4,8; cover 3,3; mango 5,0 (paso 1: 0,3-0,7). Con `_2step`: push 2,1; nest 3,8; ring 3,4; cover 2,3; mango 3,2, mejor que el profesor de 10 pasos en las cinco tareas. La latencia por chunk es de ~0,24 s (2 pasos) frente a ~0,42 s (10 pasos).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, un checkpoint Cosmos en bf16 (6,3 GB) requiere al menos ~7-8 GB solo para pesos, más memoria para activaciones y las tres cámaras de entrada; Fast-WAM (12 GB) requiere al menos ~13-14 GB.
- GPU recomendadas: no especificadas por el autor. Por el tamaño, encajan GPUs de 16-24 GB (RTX 4090, A10G, L4 para Cosmos) y de 24-40 GB para Fast-WAM (A100 40 GB, RTX 6000 Ada).
- Cabe en GPU de consumo: la familia Cosmos en bf16 es viable en GPUs de 16 GB o más; Fast-WAM en bf16 (12 GB) requiere 24 GB para operar con holgura.
- Despliegue: el repositorio incluye `inference.py` por carpeta (clase y comprobación en bucle abierto `--episode`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: ~0,42 s por chunk de 16 pasos con el muestreo Cosmos estándar y ~0,24 s con la variante `_2step`; throughput no disponible.
- Descarga: `download_ckpt.py` con `--list` y token de Hugging Face (`--token`, `$HF_TOKEN` o `huggingface-cli login`), un checkpoint a la vez.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La única comparación interna posible es entre las dos familias del propio repositorio:

| Aspecto | Cosmos3-Edge | Fast-WAM |
|---|---|---|
| Pesos | 6,3 GB, safetensors, bf16 | 12 GB, `model.pt`, bf16 exportado de fp8 |
| Pasos de acción | 16 (32 en `obs5_chunk32`) | 32 |
| Error bucle abierto (push) | 3,1-4,3 mm | 0,4-0,5 mm |
| Error bucle abierto (pour) | 10,5-11,6 mm | 1,5 mm |
| Coste por chunk | ~0,42 s (2 pasos: ~0,24 s) | no disponible |
| Condicionamiento de texto | Instrucción de tarea | Embeddings T5 offline |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial, la redistribución y la modificación quedan sin marco legal explícito.
- Los errores reportados son ajustes a episodios de entrenamiento, no generalización; el propio autor indica que deben compararse los checkpoints en el robot.
- Dataset muy reducido: 5 tareas locales (22 en mix con 50% locales) y un único robot (UR5), por lo que la transferencia a otros brazos, cámaras o entornos no está validada.
- Las instrucciones de tarea son fijas y en inglés, tomadas de `tasks.jsonl`; no hay soporte multilingüe ni de instrucciones libres verificado.
- Riesgo de alucinación motriz: como toda política generativa, puede producir trayectorias plausibles pero incorrectas; exige supervisión y límites de seguridad en el robot.
- Sesgos: no documentados; el conjunto de objetos y posiciones parece sintético o de laboratorio, lo que puede sesgar el comportamiento ante objetos no vistos.
- El README es un registro de experimentos con pérdidas no comparables entre familias y código en ramas locales (`rr-worldmodel-edge`, `rr-worldmodel-v0`) no publicadas de forma verificable.
- 78,1 GB de repositorio con descarga por checkpoint; conviene no clonar el repo completo.
- No se documentan requisitos de memoria, compatibilidad de versiones de las dependencias ni pruebas de robustez ante cambios de iluminación o cámara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LevinShan/rr-worldmodel-v0-policies
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
