# 2chan/smolvla-beverage-main

## Resumen

SmolVLA Beverage Main es una política de acción robótica (action policy) entrenada mediante aprendizaje por imitación para un montaje de bebidas con dos brazos SO-101. El modelo parte del VLM congelado SmolVLM2-500M-Video-Instruct y añade un experto de acción y proyecciones de estado/acción entrenadas sobre un dataset local de episodios de manipulación. Lo publica el usuario 2chan en Hugging Face bajo la librería LeRobot, con 450.046.176 parámetros totales y un repositorio de 0,9 GB.

El modelo resuelve una tarea muy concreta: ejecutar cinco instrucciones en inglés relacionadas con la preparación de una bebida (insertar y retirar un muddler, verter té verde en polvo, verter café en polvo y verter agua). No es un modelo de lenguaje general ni un asistente conversacional: es un controlador visuomotor que recibe tres cámaras RGB, el estado articular de 12 valores y una instrucción textual, y devuelve un chunk de 50 acciones de 12 valores cada una.

Su relevancia es acotada pero técnica: demuestra el flujo de entrenamiento de SmolVLA sobre hardware asequible (SO-101) con un VLM pequeño de 500M parámetros, y sirve como referencia reproducible de una política de imitación con flow matching seleccionada por pérdida de validación en held-out. El checkpoint fue elegido en el paso 30.000 con una pérdida de validación de 0,05627380684018135.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM SmolVLM2-500M-Video-Instruct congelado + experto de acción con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto textual; ventana de observación de 3 cámaras RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | instrucciones en inglés (5 instrucciones definidas); otros idiomas no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras RGB 480x640 (`left_wrist`, `right_wrist`, `top`), `observation.state` de 12 valores, `task` textual |
| Salidas | chunk de 50 acciones, 12 valores articulares/garra por paso, a 30 FPS |
| Pasos de entrenamiento del checkpoint | 30.000 |
| Perdida de validacion (flow matching) | 0,05627380684018135 |
| Episodios de entrenamiento | 196 episodios / 177.453 frames |
| Episodios held-out | 51 episodios / 47.664 frames |
| Libreria | LeRobot 0.6.1 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño SmolVLA: un VLM preentrenado y congelado (SmolVLM2-500M-Video-Instruct) que procesa las observaciones visuales y la instrucción, acoplado a un experto de acción entrenado desde cero sobre el dataset local de bebidas. Las proyecciones de estado y acción también se entrenan. El objetivo de entrenamiento es flow matching, no regresión directa de acciones, lo que explica que la pérdida reportada (0,056) no sea interpretable como error porcentual de acción ni como tasa de éxito robótica.

El entrenamiento usó 196 episodios (177.453 frames) y se validó sobre 51 episodios held-out (47.664 frames). Los datos provienen de ocho datasets públicos de Hugging Face bajo el prefijo `lmsforAI/so101_*`, con commits fijados, que cubren inserción y recuperación de muddler, vertido de té verde, vertido de café y vertido de agua, además de suplementos de inserción, recuperación y recuperación de fallos. El checkpoint exportado contiene solo la política de acción y los procesadores de inferencia; no incluye la cabeza auxiliar de progreso, el estado del optimizador, los datos de entrenamiento ni checkpoints intermedios. La normalización e inversa de estado/acción están incluidas en los ficheros de procesadores.

## Capacidades

- Control visuomotor de un montaje dual-arm SO-101 con 12 grados de libertad (articulaciones y garras de ambos brazos).
- Ejecución de cinco instrucciones en inglés: insertar el muddler en la taza, retirarlo y devolverlo a su soporte, verter té verde en polvo, verter café en polvo y verter agua.
- Fusión de tres vistas RGB (muñeca izquierda, muñeca derecha y vista superior) a 480x640.
- Generación de chunks de acción de 50 pasos a 30 FPS, con normalización de estado/acción incluida.
- Condicionamiento por instrucción textual en inglés entre un conjunto cerrado de cinco tareas.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking. Es exclusivamente una política de imitación robótica.

## Casos de uso

- Automatización de una estación de bebidas con SO-101: la política ejecuta la secuencia de inserción del muddler y vertido de ingredientes sobre una taza, adecuada porque el entrenamiento se realizó exactamente sobre ese montaje y esas cinco tareas.
- Reproducción de experimentos de imitación con SmolVLA: sirve como referencia de un entrenamiento con VLM congelado de 500M y experto de acción, útil para comparar curvas de pérdida de flow matching en held-out.
- Evaluación de pipelines LeRobot 0.6.1: el repositorio incluye procesadores de pre/post-proceso y un ejemplo de carga, lo que facilita validar la integración de políticas SmolVLA en un entorno conocido.
- Base para fine-tuning en tareas de vertido: los datasets de té, café y agua con commits fijados permiten extender o adaptar el modelo a recipientes o secuencias similares.
- Investigación en manipulación bimanual de bajo coste: el uso de SO-101 y un VLM de 500M lo hace viable en laboratorios con presupuesto limitado frente a montajes con brazos industriales.
- Docencia y prototipado de robótica de imitación: el checkpoint seleccionado por validación y la separación clara entre política y cabeza auxiliar facilitan explicar el flujo completo de entrenamiento e inferencia.
- Recuperación de fallos en inserción: los datasets suplementarios de recovery sugieren que la política puede haberse entrenado para recuperarse de desalineaciones al insertar el muddler, aunque no se reporta tasa de éxito medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación de flow matching (0,05627380684018135) en el paso 30.000, que el propio autor advierte que no equivale a error de acción ni a tasa de éxito robótica. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450M parámetros en safetensors (0,9 GB de repo), la inferencia en fp32 rondaría 1,8 GB de pesos; en fp16/bf16, unos 0,9 GB, más el overhead de las tres cámaras y del VLM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8 GB o más debería ser suficiente en precisión reducida; una RTX 4090 o A100/H100 aportarían margen para lotes mayores o menor latencia.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 450M parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot 0.6.1 con `SmolVLAPolicy` y `make_pre_post_processors`, tal como muestra el model card. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción robótica.
- Latencia y throughput: no disponibles. El chunk de 50 acciones a 30 FPS implica una ventana de acción de aproximadamente 1,67 segundos por inferencia, pero no se reporta latencia real por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2chan/smolvla-beverage-main | 450.046.176 | 3 cámaras RGB 480x640 + estado 12 + instrucción | Política de imitación para bebidas en SO-101 | no disponible | Hugging Face, LeRobot 0.6.1 |
| SmolVLA base (referencia del autor) | no disponible en la información | no disponible | Política de imitación general | no disponible | Referenciado indirectamente vía SmolVLM2 |
| SmolVLM2-500M-Video-Instruct | ~500M (VLM) | video/imagen + texto | VLM general, no política de acción | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, entradas y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre cinco instrucciones en inglés y un montaje concreto de SO-101; no generaliza a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- La pérdida de validación de flow matching (0,056) no es una tasa de éxito robótica ni un error de acción; el autor lo advierte explícitamente. No hay evidencia publicada de éxito real en el robot.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas: solo instrucciones en inglés; no hay soporte multilingüe documentado.
- El repositorio no incluye la cabeza auxiliar de progreso, el estado del optimizador, los datos de entrenamiento ni checkpoints intermedios, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de sobreajuste al dataset local: 196 episodios de entrenamiento y 51 de validación son volúmenes modestos para manipulación bimanual.
- Dependencia de LeRobot 0.6.1 y de las dependencias de SmolVLA y del dataset; cambios de versión pueden romper la carga.
- Sin datos de sesgos, alucinación o robustez ante condiciones de iluminación, oclusión o cambios de recipientes; no disponibles.
- Fecha de creación y actualización del repositorio (2026-11-16) y 0 descargas / 0 likes: modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/2chan/smolvla-beverage-main
- VLM base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Dataset inserción muddler: https://huggingface.co/datasets/lmsforAI/so101_muddler_insert_p1_merged50_20261109_masked
- Dataset recuperación muddler: https://huggingface.co/datasets/lmsforAI/so101_muddler_retrieve_p1_merged50_20261109_masked
- Dataset té verde: https://huggingface.co/datasets/lmsforAI/so101_powder_greentea_v2_merged35_20261019
- Dataset café: https://huggingface.co/datasets/lmsforAI/so101_powder_coffee_v2_merged35_20261019
- Dataset agua: https://huggingface.co/datasets/lmsforAI/so101_water_v2_merged54_20261020
- Dataset suplemento inserción: https://huggingface.co/datasets/lmsforAI/so101_muddler_p1_supplement_insert_20261115_masked
- Dataset suplemento recuperación: https://huggingface.co/datasets/lmsforAI/so101_muddler_p1_supplement_retrieve_20261115_masked
- Dataset suplemento recovery: https://huggingface.co/datasets/lmsforAI/so101_muddler_p1_supplement_recovery_20261115_masked
