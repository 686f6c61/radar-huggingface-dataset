# genicoder/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-v1 es un modelo de extracción de información alimentaria obtenido mediante fine-tuning supervisado (SFT) del modelo base google/gemma-3-270m-it, desarrollado por el usuario genicoder. Su propósito es concreto y acotado: dado un texto libre (típicamente un pie de foto o caption de un dataset de imágenes), clasifica si el contenido es comida o bebida, le asigna una o varias etiquetas de un diccionario cerrado de ocho categorías y extrae listas de alimentos y bebidas comestibles mencionados.

El modelo resuelve un problema de filtrado y estructuración a escala: procesar grandes corpus de captions (el autor cita explícitamente Recap-DataComp-1B) para aislar elementos relacionados con alimentación y transformarlos en una salida condensada de cuatro líneas en lugar de JSON completo, reduciendo el número de tokens generados. Con 268 millones de parámetros, está diseñado para inferencia económica y despliegue masivo, no para razonamiento general.

Es relevante por su enfoque de destilación de un modelo grande (gpt-oss-120b) hacia uno pequeño y especializado, un patrón habitual para tareas de etiquetado estructurado a gran escala. La licencia es Gemma, heredada del modelo base, y el repositorio ocupa 1,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | no disponible (el dataset de entrenamiento está en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it, un transformer decoder-only de la familia Gemma 3 en su variante más pequeña (270M parámetros). El fine-tuning se realizó con SFT mediante la librería TRL, según indican las etiquetas del repositorio (sft, trl, generated_from_trainer). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de su origen, ni si hubo etapas adicionales de alineamiento como DPO o RLHF.

El dataset de entrenamiento es FoodExtract-1k (mrdbourke/FoodExtract-1k), con 1400 muestras de pares texto crudo–JSON estructurado generadas por gpt-oss-120b. La innovación técnica principal es la condensación de la salida: en lugar de generar JSON, el modelo produce un formato de cuatro líneas (`food_or_drink`, `tags`, `foods`, `drinks`) que reduce la longitud de generación y, por tanto, el coste de inferencia. El autor proporciona funciones auxiliares `condense_output` y `uncondense_output` para convertir entre ambos formatos. Las etiquetas del diccionario son: np (nutrition_panel), il (ingredient list), me (menu), re (recipe), fi (food_items), di (drink_items), fa (food_advertistment) y fp (food_packaging).

## Capacidades

- Clasificación binaria comida/bebida a partir de texto libre, incluyendo casos negativos como "a photo of a dog".
- Etiquetado multietiqueta con un diccionario cerrado de ocho categorías orientadas a filtrado rápido.
- Extracción de listas de alimentos comestibles y de bebidas por separado.
- Generación de salida estructurada condensada en cuatro campos, optimizada para bajo número de tokens.
- Conversacional: el repositorio incluye la etiqueta conversational y el modelo base es la variante instruct.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no documentada; el entrenamiento se realizó sobre textos en inglés.

## Casos de uso

- Filtrado de datasets de captions a gran escala: procesar corpus como Recap-DataComp-1B para aislar las entradas con contenido alimentario antes de entrenar modelos de visión o de generación de recetas. El tamaño de 270M permite ejecutarlo sobre millones de muestras con coste bajo.
- Construcción de índices de recetas: extraer ingredientes y bebidas de textos de recetas y poblar un motor de búsqueda o una base de datos estructurada, usando las etiquetas `re` e `il` para clasificar previamente el tipo de documento.
- Etiquetado de menús y cartas de restaurantes: detectar la etiqueta `me`, extraer los platos y bebidas listados y normalizarlos para su publicación en plataformas de delivery.
- Moderación y clasificación de contenido en redes gastronómicas: descartar publicaciones no relacionadas con comida antes de aplicar modelos más caros de análisis visual o generación.
- Análisis de paneles nutricionales y envases: usar las etiquetas `np` y `fp` para enrutar imágenes o textos de packaging hacia pipelines de extracción de valores nutricionales.
- Enriquecimiento de catálogos de producto en comercio electrónico: a partir de descripciones de producto, extraer los alimentos y bebidas mencionados y generar metadatos de categoría para filtros de tienda.
- Preprocesado para sistemas de recomendación gastronómica: convertir descripciones libres en listas de ingredientes normalizadas que alimenten un recomendador basado en contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits: en torno a 0,3 GB de pesos; en 4 bits, alrededor de 0,15 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para procesamiento por lotes.
- Cabe en GPU consumer y en hardware de gama baja, incluidos dispositivos con poca memoria.
- Opciones de despliegue: transformers (librería indicada en el repositorio), text-generation-inference (etiqueta text-generation-inference presente) y endpoints compatibles (etiqueta endpoints_compatible). No se documentan integraciones específicas con vLLM, llama.cpp u Ollama, aunque al ser un modelo Gemma 3 es plausible su conversión, sin confirmación del autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodExtract-v1 (este modelo) | 268M | no disponible | Extracción estructurada de comida/bebida | gemma | HuggingFace |
| google/gemma-3-270m-it | 270M | no disponible | Generación de texto general e instruct | gemma | HuggingFace |
| gpt-oss-120b (generador del dataset) | 120B (MoE) | no disponible | Generación y razonamiento general | no disponible en la información | no disponible en la información |

La comparación con alternativas especializadas en extracción alimentaria no está disponible: no se han identificado en la información proporcionada otros modelos con la misma tarea y tamaño. Frente a su modelo base, FoodExtract-v1 sacrifica generalidad a cambio de un formato de salida fijo y compacto; frente a gpt-oss-120b, que generó las etiquetas del dataset, supone una reducción de tres órdenes de magnitud en parámetros a costa de cubrir únicamente esta tarea.

## Limitaciones y advertencias

- El modelo solo está entrenado para la tarea de extracción alimentaria; su uso como modelo conversacional general producirá resultados pobres.
- El dataset de entrenamiento (1400 muestras) es pequeño y fue generado sintéticamente por gpt-oss-120b, por lo que hereda los sesgos y errores de ese generador.
- Riesgo de alucinación en la extracción de listas: puede inventar alimentos o bebidas no presentes en el texto, especialmente con entradas ambiguas o muy largas.
- El diccionario de etiquetas es cerrado; textos que no encajen en las ocho categorías pueden recibir etiquetas incorrectas o vacías.
- No se documentan los idiomas soportados; el entrenamiento en inglés hace previsible un rendimiento degradado en castellano u otros idiomas.
- La longitud de contexto no está especificada, lo que impide garantizar el comportamiento con captions largos.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google para la familia Gemma, que impone restricciones y obligaciones de atribución; debe revisarse antes de un despliegue en producción.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de evaluación independiente.
- No se han publicado métricas de precisión, recall ni F1 sobre la tarea, por lo que la calidad real del extractor no está cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genicoder/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Dataset citado como caso de uso: https://huggingface.co/datasets/UCSC-VLAA/Recap-DataComp-1B
- Referencia arXiv incluida en las etiquetas: arxiv:2506.14111
