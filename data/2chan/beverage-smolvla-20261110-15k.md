# 2chan/beverage-smolvla-20261110-15k

## Resumen

Beverage SmolVLA es una política robótica de tipo vision-language-action (VLA) entrenada por el usuario 2chan sobre la arquitectura SmolVLA de la librería LeRobot. Se trata de un fine-tuning del VLM congelado HuggingFaceTB/SmolVLM2-500M-Video-Instruct, al que se añade un experto de acciones entrenado desde cero para controlar un robot bimanual SO-101 en tres tareas concretas de preparación de bebidas. El checkpoint publicado corresponde al paso 15.000 de un entrenamiento registrado el 10 de noviembre de 2026 y constituye el mejor punto de validación offline de esa ejecución.

El modelo resuelve un problema muy acotado: mapear observaciones visuales de tres cámaras (muñeca izquierda, muñeca derecha y vista superior) más el estado del robot de 12 dimensiones a secuencias de 50 acciones de 12 dimensiones, siguiendo una instrucción en lenguaje natural. No es un modelo de propósito general, sino un artefacto de investigación reproducible dentro del ecosistema LeRobot 0.6.1, útil para quien quiera replicar o extender un pipeline de imitación bimanual con SmolVLA.

Su relevancia es metodológica más que de rendimiento: documenta de forma explícita la configuración de entrenamiento (historial de observación de 1 frame, normalización MEAN_STD, chunk de 50 acciones, VLM congelado) y advierte que la pérdida de validación offline no garantiza éxito físico en el robot. Con 450 millones de parámetros y un repositorio de 0,9 GB, es ligero y desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM SmolVLM2-500M-Video-Instruct congelado + experto de acciones flow-matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de observacion de 1 frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de estado/accion | 12 (brazo izquierdo seguido de brazo derecho) |
| Camaras de entrada | observation.images.left_wrist, observation.images.right_wrist, observation.images.top |
| Chunk de acciones | 50 pasos |
| Normalizacion | MEAN_STD con estadisticas del split de entrenamiento |
| Libreria | lerobot 0.6.1 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de visión-lenguaje preentrenado y congelado (SmolVLM2-500M-Video-Instruct) con un experto de acciones entrenado mediante flow matching. En este checkpoint, el experto de acciones y las proyecciones de estado y acción se entrenaron sin cargar los pesos de política robótica de `lerobot/smolvla_base`, es decir, desde inicialización propia. La pérdida de validación registrada es de 0,0837484300 (MSE de flow matching) en el paso 15.000, que es a la vez el checkpoint final y el mejor de validación offline de la ejecución `20261110_030506_092968`.

El entrenamiento cubre tres tareas bimanuales sobre un robot SO-101: introducir un majador (muddler) en un vaso, sacarlo y devolverlo a su soporte, y verter polvo de té verde latte desde un recipiente de tapa verde al vaso. La observación usa un único frame (historial de 1), tres cámaras y un vector de estado de 12 dimensiones; la política emite chunks de 50 acciones. El repositorio incluye pesos, configuración, procesadores y estadísticas de normalización, pero no el estado del optimizador, del scheduler, del GradScaler ni del RNG.

## Capacidades

- Generación de acciones robóticas de 12 dimensiones (brazo izquierdo y derecho) condicionadas a instrucción en lenguaje natural.
- Percepción visual multi-cámara: tres vistas simultáneas (muñeca izquierda, muñeca derecha, cenital).
- Ejecución de tareas bimanuales de manipulación: inserción de objetos, extracción y reposicionamiento, y vertido de polvo.
- Condicionamiento por instrucción textual entre tres tareas entrenadas.
- Producción de chunks de 50 acciones con cola de ejecución.
- Integración nativa con el pipeline de LeRobot 0.6.1 (preprocesador y postprocesador incluidos).
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades de audio o thinking mode.
- Capacidades multilingües: no disponible; las instrucciones documentadas están en inglés.

## Casos de uso

- Reproducción de experimentos de imitación bimanual: cargar la política con `SmolVLAPolicy.from_pretrained` y evaluar la pérdida offline sobre el split de validación para comparar configuraciones de entrenamiento.
- Base para fine-tuning en nuevas tareas de barismo: partir de este checkpoint y reentrenar el experto de acciones con demostraciones adicionales sobre el mismo robot SO-101 y el mismo esquema de cámaras.
- Docencia e investigación en VLA: usar el modelo como ejemplo mínimo (450 M de parámetros, 0,9 GB) de arquitectura SmolVLA con VLM congelado y experto de acciones entrenado desde cero.
- Validación de pipelines LeRobot: probar el flujo completo de `make_pre_post_processors`, normalización MEAN_STD y ejecución de chunks de 50 acciones antes de escalar a modelos mayores.
- Estudio de transferencia sim-a-real: analizar la brecha entre pérdida de flow matching y éxito físico en las tres tareas de bebidas documentadas.
- Benchmark de referencia para políticas bimanuales pequeñas: comparar el coste y la precisión de un experto de acciones entrenado sin pesos de `smolvla_base` frente a inicializaciones preentrenadas.
- Automatización de laboratorio de robótica: desplegar el checkpoint con `--policy.path=2chan/beverage-smolvla-20261110-15k` en una celda SO-101 calibrada para pruebas repetibles de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es la pérdida de validación offline de flow matching en el paso 15.000:

| Metrica | Valor |
|---|---|
| Validacion offline (flow-matching MSE) | 0,0837484300 |
| Paso del checkpoint | 15.000 |
| Ejecucion de entrenamiento | 20261110_030506_092968 |

El autor advierte explícitamente de que la pérdida de validación offline no establece éxito en la tarea física sobre el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en precisión de entrenamiento, por lo que la inferencia en fp32 rondaría 1,8 GB y en fp16/bf16 unos 0,9 GB, más el coste de las tres cámaras y del procesamiento visual.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder alojar el modelo, aunque no hay datos publicados de latencia.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 con `SmolVLAPolicy` y `make_pre_post_processors`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beverage SmolVLA (este) | 450 M | 1 frame, 3 camaras | 3 tareas bimanuales SO-101 | no disponible | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | politica robotica general base | no disponible | Hugging Face (referencia citada por el autor) |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | ~500 M | video instruct | VLM general, no robotica | no disponible en esta ficha | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado para tres instrucciones concretas de bebidas; fuera de ellas no hay garantía de comportamiento.
- La pérdida de validación offline (0,0837) no implica éxito en la ejecución física; el autor lo señala de forma explícita.
- Requiere coincidencia exacta con el robot de entrenamiento (SO-101), las claves de cámara, la calibración y la instrucción de la tarea.
- Historial de observación de un solo frame: sin memoria temporal más allá del chunk de acciones.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: las instrucciones documentadas están en inglés y no se ha validado el condicionamiento en castellano.
- Sesgos conocidos: no documentados; al entrenarse sobre un conjunto reducido de demostraciones, es probable el sobreajuste al entorno y a los objetos concretos del montaje.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí riesgo de acciones fuera de distribución ante cambios de iluminación, posición de objetos o calibración.
- Repositorio sin descargas ni likes: no hay evidencia de validación por terceros.
- No incluye estado de optimizador, scheduler, GradScaler ni RNG, por lo que no es reanudable tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2chan/beverage-smolvla-20261110-15k
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Política base de referencia citada: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
