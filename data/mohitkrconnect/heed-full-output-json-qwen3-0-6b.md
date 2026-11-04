# mohitkrconnect/heed-full-output-json-qwen3-0.6b

## Resumen

Heed full-output JSON Qwen3-0.6B (EXP-050) es un ajuste fino completo de Qwen/Qwen3-0.6B-Base desarrollado por mohitkrconnect como parte del proyecto Heed, una aplicación de extracción de tareas a partir de notas de voz en Android. El modelo recibe la transcripción de una nota de voz y devuelve, para cada tarea detectada, un objeto JSON compacto con cuatro campos: el texto de la tarea, la categoría (bucket), las palabras temporales habladas y un indicador de recordatorio. Resuelve el problema de consolidar cuatro subtareas de extracción estructurada en un único modelo de 0,6 mil millones de parámetros que quepa en un teléfono.

Se trata de un checkpoint de investigación, no del modelo final que se distribuye en la aplicación. Según la model card, fue superado por la decisión D134 y nunca fue el modelo enviado a producción; solo se probó en un teléfono como test. Forma parte de una familia de tres checkpoints publicados del experimento EXP-050: este (formato JSON, 8 épocas), una variante en formato de líneas y una línea base JSON de 4 épocas.

El modelo es relevante como caso de estudio de ajuste fino de un modelo pequeño para salida estructurada determinista con prompt crudo (sin plantilla de chat ni system prompt), entrenado con etiquetas generadas por un modelo mayor y evaluado con F1 conjunto sobre validación. Su licencia Apache 2.0 y su tamaño lo hacen apto para experimentación en inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del modelo base |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16; se elimino el `lm_head` duplicado y atado antes de subir) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, concretamente un ajuste fino completo (no LoRA) de Qwen/Qwen3-0.6B-Base con 596.049.920 parametros. No emplea mezcla de expertos ni arquitecturas hibridas. La innovacion principal no esta en la arquitectura sino en el formato de tarea: el prompt es texto crudo sin plantilla de chat ni system prompt, con una lista de categorias en formato `- id (Nombre): significado`, seguida de `Note: <texto>` y `Tasks:`, y el modelo genera JSON compacto terminado en EOS. La lista de categorias puede sustituirse por una lista personalizada del usuario manteniendo el mismo formato de linea; el texto por defecto debe permanecer byte a byte igual porque asi se entreno.

Los datos de entrenamiento consisten en 6.914 notas (una fila por nota, sin variantes de puntuacion) y 451 notas de validacion; las 617 notas del conjunto de test sellado nunca estuvieron en la maquina de entrenamiento. Las etiquetas (bucket, palabras temporales y flag de recordatorio) provienen de Claude Sonnet 5.5 bajo un prompt de etiquetado congelado, con temperatura 0, sin verificacion humana por nota. La composicion incluye 2.697 notas sinteticas largas (120-199 tokens, 70% personas "dispersas"), 1.263 + 399 notas HeedSet, 1.108 notas simuladas, 781 planificadas por el autor, 480 "brain dumps" de Claude, 140 notas reales y 36 notas de plantilla curadas, entre otras. La receta usa lr 1e-5, AdamW con weight decay 0, warm-up del 5% seguido de coseno, gradient clipping 1.0, batch 8 x 2 = 16, longitud maxima 1.024, perdida solo sobre los tokens de respuesta, autocast bf16 con pesos maestros fp32 y gradient checkpointing. Se ejecutaron 3.464 pasos (8 epocas) en 36,48 minutos en una RTX 4090, con pico de 17,6 GB y mejor perdida de validacion de 0,2733 (paso 866, epoca 1). La epoca se eligio por F1 conjunto en validacion, no por perdida.

## Capacidades

- Extraccion de tareas a partir de transcripciones de notas de voz en ingles, devolviendo JSON compacto.
- Clasificacion en categorias (bucket) segun una lista proporcionada en el prompt; admite listas personalizadas con el mismo formato de linea.
- Extraccion de expresiones temporales habladas (campo `w`, por ejemplo "at 5").
- Deteccion de necesidad de recordatorio mediante flag binario (`r`: 1 o ausente).
- Salida estructurada determinista en formato JSON con claves abreviadas (`t`, `c`, `w`, `r`).
- Manejo de notas sin tareas, devolviendo `{"tasks":[]}`.
- Capacidad de procesar notas largas (hasta 1.024 tokens en entrenamiento, con datos sinteticos de 120-199 tokens).
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Extraccion de tareas en aplicaciones de notas de voz en Android: el modelo convierte la transcripcion de una nota en una lista JSON de tareas con categoria y recordatorio, y su tamano de 0,6B permite ejecucion on-device segun los tags del repositorio.
- Clasificacion automatica de tareas en categorias personalizables: el prompt admite una lista de buckets propia del usuario, lo que permite adaptar la taxonomia (compras, trabajo, ideas, diario) sin reentrenar.
- Deteccion de recordatorios en lenguaje natural: el flag `r` permite marcar tareas que requieren aviso a partir de expresiones temporales habladas, util en asistentes de productividad.
- Procesamiento por lotes de notas historicas: al aceptar prompts crudos y generar JSON compacto, puede integrarse en pipelines de extraccion masiva de tareas con decodificacion greedy para resultados reproducibles.
- Prototipado de investigacion sobre salida estructurada en modelos pequenos: sirve como checkpoint de referencia para comparar formatos de salida (JSON frente a lineas) y estrategias de ajuste fino.
- Filtrado de notas sin accion: la salida `{"tasks":[]}` permite descartar notas de diario o reflexiones que no contienen tareas, reduciendo ruido en sistemas de gestion personal.
- Evaluacion de tecnicas de destilacion de etiquetas: util para estudiar como se comporta un modelo de 0,6B entrenado con etiquetas de un modelo mayor en tareas de extraccion estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de entrenamiento: mejor perdida de validacion de 0,2733 en el paso 866 (epoca 1) sobre 451 notas, y seleccion de epoca por F1 conjunto en validacion, sin cifras concretas de F1 publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos (596M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en GPUs consumer con 4 GB o mas.
- Entrenamiento: se realizo en una unica RTX 4090 con pico de 17,6 GB, usando gradient checkpointing y autocast bf16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia; RTX 4090, A100 o H100 para reentrenamiento o ajuste fino.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores; tambien es candidato a ejecucion en CPU o en dispositivos moviles por su tamano.
- Opciones de despliegue: transformers (referencia oficial en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan recetas para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo de 8 epocas tardo 36,48 minutos en una RTX 4090, dato no extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-full-output-json-qwen3-0.6b (este) | 596.049.920 | no disponible (entrenado a 1.024) | JSON compacto | apache-2.0 | HuggingFace, 0 descargas |
| heed-full-output-lines-qwen3-0.6b | no disponible | no disponible | lineas | apache-2.0 (presumible, mismo autor) | HuggingFace |
| heed-full-output-json-4ep-qwen3-0.6b | no disponible | no disponible | JSON compacto | apache-2.0 (presumible, mismo autor) | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 0,6B (clase) | no disponible | texto libre | apache-2.0 | HuggingFace |

Los dos primeros son hermanos del mismo experimento EXP-050: la variante en formato de lineas perdio frente a JSON y la variante de 4 epocas es la linea base JSON con la que se comparo. No se dispone de cifras de rendimiento comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no el modelo de produccion de Heed; fue superado por la decision D134 y nunca se distribuyo en la aplicacion.
- Las etiquetas de entrenamiento provienen de un modelo (Claude Sonnet 5.5) sin verificacion humana por nota, por lo que puede heredar sesgos y errores de etiquetado del modelo generador.
- Riesgo de alucinacion en la extraccion: puede inventar tareas, categorias o tiempos no presentes en la nota, especialmente con entradas fuera de la distribucion de entrenamiento.
- Solo soporta ingles; no hay evidencia de capacidad multilingue.
- Requiere que el texto por defecto de la lista de categorias permanezca byte a byte igual al de entrenamiento; desviaciones del formato del prompt pueden degradar la salida.
- La salida es JSON compacto con claves abreviadas y campos omitidos (`w` y `r` se omiten cuando estan vacios o son 0), lo que exige un parser tolerante a campos ausentes.
- Entrenado con longitud maxima de 1.024 tokens; notas mas largas pueden truncarse o producir salidas incompletas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe usarse para esas funciones.
- La licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion externa, se recomienda validacion propia antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-full-output-json-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Hermano en formato de lineas: https://huggingface.co/mohitkrconnect/heed-full-output-lines-qwen3-0.6b
- Hermano JSON de 4 epocas (linea base): https://huggingface.co/mohitkrconnect/heed-full-output-json-4ep-qwen3-0.6b
- Modelo de produccion de Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
