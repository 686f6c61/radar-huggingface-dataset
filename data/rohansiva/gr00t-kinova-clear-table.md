# rohansiva/gr00t-kinova-clear-table

## Resumen

Este modelo es un ajuste fino de `nvidia/GR00T-N1.7-3B`, un modelo de vision-lenguaje-accion (VLA) de NVIDIA Isaac GR00T para robotica humanoid. El autor `rohansiva` lo ha especializado en la tarea de despejar la mesa con un brazo Kinova, utilizando 50 episodios de teleoperacion real del conjunto de datos `olingoudey/kinova_clear_table` (concretamente, un brazo tidybot2).

Con 3.144.016.000 parametros, mantiene la arquitectura del modelo base: un backbone de vision-lenguaje (Cosmos-Reason2-2B) congelado, capas de refinamiento de atencion vision-lenguaje entrenables y una cabeza de accion de difusion (DiT) con 1,62 B de parametros entrenables (51,5% del total). La configuracion de modalidad es personalizada (`NEW_EMBODIMENT`), con estado de 15 dimensiones, acciones de 7 dimensiones y dos camaras de entrada (muneca y tercera persona) a 640x480.

Su interes radica en que sirve como caso de estudio de ajuste fino VLA con datos muy escasos y muestra la adaptacion a un embodiment nuevo bajo licencia Apache-2.0. Sin embargo, no se han publicado benchmarks ni evaluaciones externas, y el modelo esta limitado a una unica tarea con un conjunto de entrenamiento pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA con backbone de vision-lenguaje congelado (Cosmos-Reason2-2B) y cabeza de accion de difusion (DiT) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No procede (no es un modelo MoE; si hay 1,62 B de parametros entrenables, 51,5% del total) |
| Longitud de contexto | No disponible (modelo VLA; el horizonte de accion es de 16 pasos, ~320 ms a 50 fps) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un VLA generico de 3 B de parametros. En el ajuste fino se congelo el backbone de vision-lenguaje (Cosmos-Reason2-2B) y se entrenaron las capas de proyeccion de entrada/salida, el refinamiento de atencion vision-lenguaje y la cabeza de accion. La configuracion de modalidad es personalizada (`NEW_EMBODIMENT`): el estado tiene 15 dimensiones (7 angulos articulares, 3 posiciones del brazo, 4 componentes de cuaternion y 1 posicion del gripper normalizada entre 0 y 1), y la accion tiene 7 dimensiones (3 deltas de posicion, 3 componentes de rotacion en formato axis-angle y 1 valor absoluto del gripper). El modelo recibe dos imagenes de camara (muneca y tercera persona) a 640x480 y 50 fps.

El entrenamiento se realizo con 8 GPU, DeepSpeed ZeRO-2, tamano de lote global de 192, 15 epocas (8.517 pasos), tasa de aprendizaje de 3e-5 con decaimiento coseno (escalada linealmente desde la receta publicada de 1e-4 con lote 640), warmup del 5% y weight decay de 1e-5. La perdida de entrenamiento final fue de 0,0826, tras partir de ~1,24. Segun el autor, esta perdida baja probablemente refleja un ajuste a las 50 demostraciones concretas mas que una habilidad generalizada de despejar la mesa.

## Capacidades

- Generacion de acciones roboticas de 7 dimensiones para controlar un brazo Kinova (delta de posicion, rotacion axis-angle y apertura/cierre del gripper).
- Entrada multimodal: lenguaje natural, imagenes de dos camaras (muneca y tercera persona) y estado de 15 dimensiones del robot.
- Adaptacion a un embodiment especifico mediante configuracion `NEW_EMBODIMENT`, con mapeos de estado y accion definidos por el dataset.
- Tarea concreta: despejar la mesa con un brazo robotico.
- No soporta tool calling ni function calling en el sentido de los LLM de texto.
- No es un modelo generativo de texto generalista; su salida es un plan de accion de baja dimension.
- Capacidades multilingues: no especificadas.
- No incluye "thinking mode" ni generacion de razonamiento explicito mas alla de la planificacion implicita del VLA.

## Casos de uso

- Investigacion en VLA con datos escasos: este ajuste fino permite estudiar como un modelo de 3,14 B se adapta a una tarea de manipulacion con solo 50 episodios de teleoperacion, un escenario comun en robotica donde los datos son costosos de obtener.
- Evaluacion de transferencia entre embodiments: la configuracion `NEW_EMBODIMENT` permite analizar como el modelo base GR00T-N1.7 se transfiere a un brazo Kinova con modalidades de estado y accion personalizadas.
- Punto de partida para tareas de despeje con brazo robotico: el modelo puede servir como referencia en laboratorio antes de ampliar el dataset o ajustar en tareas similares de manipulacion de objetos sobre una mesa.
- Desarrollo de pipelines de control en bucle cerrado: el horizonte de accion de 16 pasos (~320 ms) es util para probar arquitecturas de controlacion que combinen prediccion de acciones con re-planificacion frecuente.
- Estudio de la capacidad de la cabeza de accion de difusion: el modelo entrena solo el 51,5% de los parametros, lo que permite investigar que parte del peso de un VLA puede quedar congelada sin degradar la tarea.
- Comparacion de metodos de ajuste fino por epocas: la configuracion de entrenamiento documentada (15 epocas, lote 192, DeepSpeed ZeRO-2) sirve como referencia reproducible para replicar y extender el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 6,9 GB, lo que corresponde a ~3,14 B de parametros en FP16/BF16 (~6,3 GB). Sumando el overhead del backbone VLM, el procesamiento de dos camaras a 640x480 y la cabeza de difusion, se estima un minimo de 10-12 GB de VRAM en la practica. No hay cifras oficiales publicadas.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior deberia ser suficiente para inferencia de una sola instancia. El entrenamiento del autor se realizo con un nodo de 8 GPU, aunque sin especificar el modelo.
- Compatibilidad con GPU de consumo: si, en GPUs con 24 GB de VRAM (RTX 3090/4090) se espera que el modelo pueda ejecutarse para inferencia. No se publican pesos cuantizados, por lo que no hay opciones de menor VRAM en este repositorio.
- Opciones de despliegue: el modelo se puede cargar con el framework NVIDIA Isaac-GR00T (disponible en GitHub). No aplican vLLM, Ollama ni TGI, ya que es un modelo VLA de robotica y no un LLM de texto convencional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte de accion | Tarea | Licencia |
|---|---|---|---|---|
| rohansiva/gr00t-kinova-clear-table | 3,14 B | 16 pasos (~320 ms) | Despejar mesa con brazo Kinova | Apache-2.0 |
| nvidia/GR00T-N1.7-3B | ~3,14 B | No disponible | Habilidades humanoides generales | No disponible |

No se dispone de datos de benchmarks para comparar el rendimiento de estos modelos en la tarea concreta. La comparacion se limita al modelo base, que constituye el origen del ajuste fino; no hay informacion sobre otros modelos comparables en el repositorio ni en la documentacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado. Al tratarse de un modelo VLA para manipulacion, la ausencia de evaluacion con datos held-out impide conocer sesgos en el comportamiento robotico.
- Riesgo de alucinacion: la cabeza de accion de difusion puede generar acciones no validas en entornos no vistos, especialmente fuera de las 50 demostraciones de entrenamiento. Este riesgo no esta documentado.
- Limitaciones de contexto o idioma: el modelo solo esta entrenado para producir acciones; no hay constancia de capacidades de texto multilingue ni de razonamiento verbal.
- Restricciones de licencia para uso comercial: la licencia del repositorio es Apache-2.0, pero es necesario verificar la licencia del modelo base `nvidia/GR00T-N1.7-3B` y la del dataset `olingoudey/kinova_clear_table` antes de un despliegue comercial.
- Sobreajuste al dataset: 50 episodios de una unica tarea es un conjunto de entrenamiento muy pequeno. La perdida final de 0,0826 sugiere un ajuste estrecho a las demostraciones concretas, no una habilidad generalizada de "despejar la mesa".
- Sin evaluacion de generalizacion: no se han realizado evaluaciones con datos held-out ni en bucle abierto (open-loop) sobre este checkpoint, por lo que el rendimiento en escenarios nuevos es desconocido.
- Ventana de planificacion corta: el horizonte de accion de 16 pasos cubre solo ~320 ms a la frecuencia de control de 50 fps, lo que puede ser insuficiente para movimientos largos o tareas que requieren mayor anticipacion.
- Embodiment especifico: la configuracion `NEW_EMBODIMENT` esta definida para un brazo Kinova (tidybot2). El modelo no funcionara con otros robots sin reconfigurar los mapeos de estado y accion y volver a entrenar.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/rohansiva/gr00t-kinova-clear-table
- Modelo base en Hugging Face: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento en Hugging Face: https://huggingface.co/datasets/olingoudey/kinova_clear_table
- Repositorio oficial de NVIDIA Isaac GR00T en GitHub: https://github.com/NVIDIA/Isaac-GR00T
