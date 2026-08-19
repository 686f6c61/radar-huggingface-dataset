# prehj/groot-n15-quantizability-gate-A-robocasa

## Resumen

El modelo `prehj/groot-n15-quantizability-gate-A-robocasa` es un componente auxiliar para políticas VLA (vision-language-action) basadas en GR00T-N1.5, desarrollado por el usuario prehj. Su función es decidir si un chunk de 16 pasos de acción generado por la política puede comprimirse temporalmente mediante K2 (suma de deltas adyacentes) sin degradar el éxito de la tarea. Es un pequeño clasificador CNN de 0,32 millones de parámetros, destilado a partir de las etiquetas de un VLM juez (Cosmos3-Nano, Gemma-4 o GPT-5.6) que evalúa la "cuantizabilidad" de cada chunk.

El modelo resuelve el problema de que la compresión ingenua de acciones (K2) reduce los pasos de entorno pero pierde precisión en transiciones críticas como agarres o inserciones. El gate emite una confianza calibrada en [0,1] que permite decidir por chunk si comprimir o no, recuperando el éxito del baseline sin compresión mientras se ahorra alrededor del 21 % de los pasos de entorno en el benchmark RoboCasa. Su relevancia radica en que es un componente ligero (1,3 MB) que puede ejecutarse en línea en cada chunk, y su diseño permite aprender el umbral τ mediante un head de RL sobre las features expuestas.

La arquitectura es un CNN de 4 bloques que procesa tres vistas de cámara apiladas (9×128×128) concatenadas con un embedding de instrucción MiniLM congelado. Está disponible bajo licencia Apache 2.0 y se distribuye como checkpoints PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de 4 bloques (convolucional) sobre 3 vistas RGB apiladas + embedding MiniLM congelado |
| Parametros totales | 0,32 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | fija: 3 imágenes de 128×128 (9 canales) + embedding de instrucción de 384 dimensiones |
| Tipos de cuantizacion | no disponible (modelo pequeño, no requiere cuantización) |
| Idiomas soportados | no disponible (instrucciones en texto, probablemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) y NPZ (embeddings de tareas) |

## Arquitectura y entrenamiento

El modelo es un CNN de 4 bloques que toma como entrada tres vistas de cámara (izquierda, derecha y muñeca) de 128×128 píxeles, apiladas en 9 canales, y las concatena con un embedding de instrucción generado por un MiniLM congelado de 384 dimensiones. La salida es una confianza escalar en [0,1] y un vector de features de 128 dimensiones (activación penúltima) que puede usarse para aprender el umbral τ mediante un head de RL.

El entrenamiento se realiza por destilación: un VLM juez (Cosmos3-Nano, Gemma-4 o GPT-5.6, según el checkpoint) etiqueta cada chunk como comprimible o no, usando un prompt de guía evolucionado. El estudiante A′ (el CNN) se entrena para imitar esas etiquetas. Existen varios checkpoints según el teacher y el dominio: RoboCasa Kitchen (24 tareas) con Cosmos3-Nano, Gemma-4 y GPT-5.6, y un caso real de pick-and-place con el robot MoSS DROID. El modelo también incluye un conjunto de embeddings de 334 instrucciones de RoboCasa (384-d MiniLM) en un archivo NPZ.

## Capacidades

- Decide si un chunk de 16 pasos de acción puede comprimirse temporalmente (K2) sin degradar el éxito de la tarea.
- Emite una confianza calibrada en [0,1], no solo una decisión binaria.
- Procesa tres vistas de cámara simultáneamente (izquierda, derecha, muñeca) junto con una instrucción textual.
- Expone features de 128 dimensiones para extensión con un head de RL que aprenda el umbral τ o una política sobre K.
- Puede servir como servidor drop-in que replica el contrato POST /judge del VLM juez, permitiendo sustituir al teacher sin cambios en el stack de evaluación.
- Es lo suficientemente ligero (0,32 M parámetros, ~1,3 MB) para ejecutarse en línea en cada chunk sin GPU.

## Casos de uso

- Compresión de acciones en políticas VLA para robots manipuladores: el gate se integra en el bucle de control para decidir si un chunk puede ejecutarse en la mitad de pasos, reduciendo la latencia y el desgaste del hardware.
- Evaluación de políticas en simulación: permite comparar el rendimiento de una política con y sin compresión, manteniendo el éxito mientras se reduce el número de pasos de entorno (en RoboCasa, ~21 % menos pasos con éxito similar al baseline).
- Optimización en tiempo real de robots físicos: en el caso DROID pick-and-place, el gate permite comprimir movimientos groseros sin afectar a fases críticas como agarre o inserción.
- Aprendizaje por refuerzo del umbral τ: las features de 128 dimensiones se pueden usar como entrada para un head RL que aprenda el punto de operación óptimo por dominio y teacher.
- Sustitución de un VLM juez pesado: el servidor drop-in permite reemplazar el juez (Cosmos3-Nano, Gemma-4, GPT-5.6) por el estudiante en pipelines existentes, reduciendo coste computacional.
- Análisis de cuantizabilidad de acciones: el modelo puede usarse para estudiar qué tipos de movimientos (grasp, inserción, apertura de puertas) son sensibles a la compresión temporal.

## Benchmarks y rendimiento

La model card proporciona resultados en un benchmark de referencia de RoboCasa (24 tareas × 50 episodios cada una):

| Politica | Exito | Pasos medios |
|---|---|---|
| Baseline sin compresion | 0,657 | 327 |
| K2 naive (comprimir todo) | 0,598 | 221 |
| A′ gemma4, τ=0,5 | 0,667 | 258 |
| A′ cosmos3, τ=0,5 | 0,659 | 299 |
| Gate token en DiT (arquitectura C) | 0,638–0,647 | 289 |

El ruido de reproducibilidad del benchmark es de ±1,5 puntos porcentuales. A′ con Gemma-4 recupera el éxito del baseline (0,667 vs 0,657) mientras reduce los pasos medios un 21 % respecto al baseline (258 vs 327). La compresión naive K2 reduce más pasos (221) pero pierde 6 puntos de éxito.

## Requisitos de hardware

- El modelo tiene solo 0,32 millones de parámetros y un tamaño de ~1,3 MB por checkpoint, por lo que puede ejecutarse en CPU sin problemas.
- No requiere GPU para inferencia del gate; el VLM teacher sí necesita GPU, pero el estudiante está diseñado para correr en línea en cada chunk.
- Se puede desplegar como un servidor Python (`module_gate_server.py`) que escucha en un puerto y responde al contrato POST /judge.
- La inferencia es de latencia muy baja, adecuada para control en tiempo real de robots.
- No se han publicado requisitos específicos de VRAM ni throughput, pero por el tamaño es trivial.

## Comparativa con modelos similares

No hay modelos comparables de otros autores; el gate es un componente específico para el ecosistema GR00T. Se puede comparar con las alternativas internas del mismo repositorio:

| Modelo | Parametros | Contexto | Exito (RoboCasa) | Pasos medios | Licencia |
|---|---|---|---|---|---|
| A′ gemma4 (este modelo) | 0,32 M | fijo (imagenes + instruccion) | 0,667 | 258 | Apache 2.0 |
| A′ cosmos3 | 0,32 M | idem | 0,659 | 299 | Apache 2.0 |
| Gate token en DiT (arquitectura C) | no disponible | no disponible | 0,638–0,647 | 289 | Apache 2.0 |
| K2 naive (sin gate) | — | — | 0,598 | 221 | — |

## Limitaciones y advertencias

- Solo está entrenado para RoboCasa Kitchen (24 tareas) y un caso real de pick-and-place (MoSS DROID); no cubre LIBERO.
- La calibración de la confianza depende del teacher y del dominio; el mismo τ=0,5 significa cosas distintas entre checkpoints.
- El umbral τ debe tratarse como un hiperparámetro entrenable, no como una constante universal.
- La compresión K2 puede romper acciones críticas si el gate falla; el benchmark muestra que la compresión naive pierde 6 puntos de éxito.
- No se han publicado análisis de sesgos ni de alucinación, aunque al ser un clasificador binario el riesgo es menor que en modelos generativos.
- El repositorio no incluye el código de entrenamiento completo, solo los checkpoints y el servidor de inferencia.
- Los checkpoints son específicos para el espacio de acción de RoboCasa (12 dimensiones, con dims 0-4 sin usar); no son directamente aplicables a otros espacios de acción sin adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prehj/groot-n15-quantizability-gate-A-robocasa
- Modelo relacionado (arquitectura C): https://huggingface.co/prehj/groot-n15-quantizability-gate-C-robocasa
- Código, prompt-evolution y etiquetado: https://github.com/rakybond007/GR00T-action-quantization/tree/action-quantization-gate-v2
- NVIDIA Isaac-GR00T (referencia del modelo base): https://github.com/NVIDIA/Isaac-GR00T
- Página de investigación de GR00T N1.5: https://research.nvidia.com/labs/gear/gr00t-n1_5/
