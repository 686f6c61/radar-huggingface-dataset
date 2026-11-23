# hwanghwijun/so101lap-policies

## Resumen

SO-101LAP-policies es una colección de checkpoints de políticas de imitación para el brazo robótico de bajo coste SO-101, entrenadas para ejecutar una tarea de manipulación ("introducir la bola blanca en la caja blanca") a partir de tan solo tres demostraciones de la tarea objetivo. El autor, hwanghwijun, aplica una estrategia de recuperación de trayectorias (trajectory retrieval) inspirada en STRAP: en lugar de entrenar únicamente con las tres demostraciones disponibles, segmenta la trayectoria objetivo y busca fragmentos similares en un corpus de demostraciones de tareas relacionadas, que luego se usan como datos de entrenamiento adicionales.

El repositorio contiene dos variantes metodológicas: una línea base `sdtw` (Subsequence Dynamic Time Warping, con los resultados de recuperación tal cual) y una variante `hybrid_v1_k10` que sustituye los diez peores emparejamientos por candidatos generados con VP-Bresenham. Cada variante se entrena con tres semillas (42, 1234 y 4325) durante 150 épocas con el algoritmo `bc` de robomimic. El conjunto de entrenamiento final combina 90 segmentos recuperados con las 3 demostraciones objetivo, sumando 93 demostraciones.

La relevancia del proyecto es metodológica más que de producto: explora hasta qué punto la recuperación de datos de tareas afines puede compensar la escasez extrema de demostraciones en aprendizaje por imitación sobre hardware real. No obstante, el propio autor advierte de que la tasa de éxito en robot real no se ha medido, y el repositorio se encuentra en un estado de reentrenamiento tras detectar un fallo de normalización de acciones en los checkpoints iniciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone GPT (política de imitación de robomimic `bc`), entrada multimodal imagen + estado propioceptivo, salida de acción continua de 6 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal de 5 fotogramas (`frame_stack=5`, `seq_length=5`) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante `.pth`) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoints autocontenidos de robomimic con `config`, `shape_metadata` y `action_normalization_stats`); también `safetensors` según los tags del repositorio |
| Tamaño del repositorio | 4,0 GB |
| Entradas | `front_rgb` y `wrist_rgb` (2 cámaras, 128×128, RGB, CHW, float 0-1), `ee_pos` (3 primeras articulaciones), `joint_states` (6 articulaciones), `gripper_states` (última articulación) |
| Salida | Vector de acción de 6 dimensiones, desnormalizado con las estadísticas del checkpoint |
| Frecuencia de control | 30 fps (idéntica a la recolección de datos) |
| Preprocesado de imagen | 640×480 original → 128×128 con `cv2.INTER_AREA`, orden RGB, crop central interno a 116×116 |

## Arquitectura y entrenamiento

La política es un transformer con backbone GPT que consume una secuencia temporal de cinco observaciones (imágenes de cámara frontal y de muñeca, estado propioceptivo) y produce una acción de 6 dimensiones. El entrenamiento se realiza con el algoritmo `bc` (behavior cloning) del fork `robomimic_strap` de robomimic: 150 épocas de 200 pasos cada una, batch de 32, `frame_stack` y `seq_length` de 5, y tres semillas independientes. Un detalle crítico documentado por el autor es que la normalización de acciones `min_max` es imprescindible: sin ella, las acciones (en grados, rango ±100) quedan comprimidas por la salida `tanh` a ±1 y la pérdida se estanca en 23,9 sin converger.

El componente distintivo es el pipeline de recuperación de datos. La tarea objetivo (`so101lap_t4`, "put the white ball into the white box") aporta solo 3 demostraciones (episodios 0, 1 y 2). Cada una se segmenta en 18 tramos mediante la derivada de `ee_pos` (umbral 2,5e-3, longitud mínima 40), y cada tramo se compara con 150 demostraciones previas de tres tareas afines (`so101lap_t1` a `t3`) mediante subsequence DTW. Con `top_k=100` repartido entre segmentos se obtienen 5 coincidencias por tramo, 90 en total. La distribución de procedencia es 43 del prior que comparte contenedor, 43 del que comparte objeto, y solo 4 del prior sin elementos en común; entre los 18 mejores emparejamientos no hay ninguno del prior sin relación. La variante `hybrid_v1_k10` reemplaza los 10 emparejamientos de mayor coste S-DTW acumulado por candidatos VP-Bresenham, todos procedentes del prior que comparte contenedor y ninguno de la propia trayectoria.

## Capacidades

- Control robótico de manipulación de 6 grados de libertad sobre el brazo SO-101: la política genera acciones articulares continuas a 30 Hz a partir de percepción visual y estado propioceptivo.
- Percepción visual multimodal con dos cámaras simultáneas (frontal y de muñeca), procesadas a 128×128 en RGB.
- Aprendizaje por imitación con pocas demostraciones (few-shot imitation): diseñado específicamente para el régimen de 3 demostraciones objetivo.
- Recuperación de trayectorias entre tareas: el pipeline segmenta y empareja fragmentos de demostraciones de tareas afines mediante subsequence DTW.
- Generalización entre tareas relacionadas: los datos recuperados provienen de variaciones de la tarea que comparten objeto o contenedor.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades lingüísticas ni modo de pensamiento; es un modelo puramente motor.

## Casos de uso

- Investigación en aprendizaje por imitación con datos escasos: el repositorio sirve como referencia reproducible para estudiar si la recuperación de trayectorias de tareas afines mejora el comportamiento frente a entrenar solo con las demostraciones objetivo, comparando las variantes `sdtw` y `hybrid_v1_k10` bajo las mismas semillas.
- Manipulación robótica de bajo coste en laboratorio: el SO-101 es un brazo económico de código abierto; estos checkpoints permiten desplegar una política de pick-and-place en hardware asequible sin entrenamiento propio, siempre que se respete el preprocesado exacto documentado.
- Replicación de experimentos de recuperación de datos: el pipeline de segmentación por derivada de `ee_pos` y emparejamiento por subsequence DTW es reutilizable para construir conjuntos de datos aumentados en otras tareas de manipulación.
- Estudio de sensibilidad a la normalización de acciones: el fallo documentado con `tanh` y acciones en grados constituye un caso práctico útil para depurar políticas de robomimic que no convergen.
- Evaluación comparativa de estrategias de aumento de datos: la sustitución de los peores emparejamientos por candidatos VP-Bresenham permite analizar el impacto de la calidad de los datos recuperados en el entrenamiento.
- Base para despliegues en robótica educativa: dado que el checkpoint es autocontenido (incluye configuración y estadísticas de normalización), puede cargarse con `robomimic` en un solo paso para prácticas docentes de imitation learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la tasa de éxito en robot real no se ha medido y que las pérdidas de entrenamiento de las dos variantes no son comparables entre sí porque corresponden a datos distintos; la comparación requeriría evaluar sobre los 5 episodios held-out (`so101lap_t4` episodios 5 a 9) o sobre el robot físico con un criterio común.

El único dato de rendimiento disponible es de inferencia: 18,5 ms por paso (aproximadamente 54 Hz) sobre una RTX 4090, suficiente para el bucle de control a 30 Hz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor solo reporta ejecución en RTX 4090, por lo que cabe en los 24 GB de esa GPU con holgura.
- GPU recomendadas: RTX 4090 (medición reportada de 18,5 ms/paso). Al tratarse de una política de visión de tamaño moderado con entradas de 128×128, es probable que quepa en GPUs consumer de gama media, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: sí, al menos en RTX 4090 según la medición del autor; el resto de gamas no está documentado.
- Opciones de despliegue: carga mediante `robomimic.utils.file_utils.policy_from_checkpoint` con el fork `robomimic_strap`, que debe instalarse separado del entorno `lerobot` para evitar conflictos de dependencias. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: 18,5 ms/paso, unos 54 Hz en RTX 4090, frente a los 30 Hz del bucle de control.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana temporal | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| SO-101LAP-policies (`sdtw`, `hybrid_v1_k10`) | Política de imitación con recuperación de trayectorias | no disponible | 5 fotogramas | MIT | Hugging Face, repo de 4,0 GB | Tasa de éxito real no medida; reentrenamiento en curso |
| Política STRAP original | Política de imitación con recuperación de trayectorias | no disponible | no disponible | no disponible | Paper académico | Método de referencia en el que se basa la línea base `sdtw` |
| Políticas LeRobot para SO-101 | Políticas de imitación para el brazo SO-101 | no disponible | no disponible | no disponible | Ecosistema LeRobot | Entrenadas sobre el entorno de recolección de datos; el autor separa explícitamente ambos entornos por conflictos de dependencias |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La tasa de éxito en robot real no se ha medido; no existe validación sobre los 5 episodios held-out ni sobre hardware físico.
- Los checkpoints iniciales (6 archivos) fueron eliminados por un fallo de normalización de acciones; el repositorio está en proceso de reentrenamiento y algunas rutas pueden estar vacías.
- El preprocesado debe replicarse exactamente: cámaras frontal y de muñeca, resize 128×128 con `INTER_AREA`, orden RGB (no BGR), `ee_pos` como las 3 primeras articulaciones (no coordenadas cartesianas del efector), 5 fotogramas apilados, imágenes en formato CHW float 0-1 y desnormalización con las estadísticas del checkpoint. Cualquier desviación provoca comportamientos erráticos.
- El modelo carece de cinemática directa: usa directamente los ángulos articulares en lugar de la posición cartesiana del efector, lo que limita la portabilidad a otras configuraciones de robot.
- Requiere el fork `robomimic_strap`, no la versión estándar de robomimic, y su instalación entra en conflicto con el entorno `lerobot`.
- El corpus de recuperación procede de un único conjunto de datos (recolección del 2026-10-02, `so101lap_t1` a `t4`), por lo que la generalización a otras tareas u objetos no está demostrada.
- Las pérdidas de entrenamiento de las dos variantes no son comparables entre sí, al proceder de datos distintos.
- Licencia MIT: permite uso comercial, pero al no existir evaluación de robustez ni de seguridad física, no es recomendable su despliegue en entornos reales sin validación propia.
- No hay información sobre sesgos, alucinación (concepto no aplicable a una política motora) ni cobertura idiomática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwanghwijun/so101lap-policies
- Repositorio robomimic (fork de referencia `robomimic_strap`): no disponible como enlace en la información proporcionada
- Paper STRAP (método de recuperación de trayectorias de referencia): no disponible como enlace en la información proporcionada
- Paper LIBERO (referencia del criterio de coste S-DTW): no disponible como enlace en la información proporcionada
- Ecosistema LeRobot (entorno de recolección de datos del SO-101): no disponible como enlace en la información proporcionada
