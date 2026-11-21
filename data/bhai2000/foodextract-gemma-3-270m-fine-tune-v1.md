# bhai2000/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-v1 es un ajuste fino supervisado (SFT) del modelo Gemma 3 270M instruct de Google, desarrollado por el usuario bhai2000. Su propósito es especializado y acotado: dado un texto en bruto (por ejemplo, un caption de imagen o una descripción de producto), clasifica si el contenido es comida o bebida, asigna etiquetas de categoría y extrae listas estructuradas de alimentos y bebidas comestibles. El modelo no pretende ser un asistente general, sino un extractor determinista de entidades alimentarias para tareas de filtrado y enriquecimiento de datasets.

La relevancia de esta ficha radica en su uso como herramienta de preprocesamiento a gran escala: el autor lo plantea explícitamente para filtrar datasets de captions como DataComp-1B en busca de contenido gastronómico. Con 268 millones de parámetros, es un modelo pequeño que puede ejecutarse en hardware modesto, lo que lo hace adecuado para procesar millones de muestras con coste computacional bajo. La salida se condensa en un formato de cuatro líneas (`food_or_drink`, `tags`, `foods`, `drinks`) para minimizar tokens generados.

El modelo se entrenó sobre el dataset FoodExtract-1k, compuesto por 1.400 pares de texto bruto y salida estructurada generados por gpt-oss-120b. La licencia es Gemma, heredada del modelo base, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, `gemma3_text`) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `google/gemma-3-270m-it`, un transformer decoder-only de la familia Gemma 3. El entrenamiento se realizó mediante SFT con la librería TRL (tag `trl` y `generated_from_trainer`), partiendo de los pesos instruct ya alineados de Google. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las 1.400 muestras, ni si hubo etapas adicionales de RLHF o DPO tras el SFT.

La innovación técnica destacable no está en la arquitectura, sino en el formato de salida: el autor entrena al modelo para emitir una representación condensada de cuatro líneas en lugar de JSON completo, reduciendo el número de tokens generados y, por tanto, la latencia y el coste en inferencia masiva. El dataset de entrenamiento (FoodExtract-1k) contiene pares texto bruto → JSON estructurado generados por gpt-oss-120b, condensados posteriormente mediante funciones auxiliares (`condense_output` / `uncondense_output`) que el autor documenta en la model card.

## Capacidades

- Clasificación binaria comida/bebida a partir de texto libre (`food_or_drink: 0` o `1`).
- Etiquetado multi-etiqueta con un diccionario cerrado de ocho categorías: `np` (nutrition panel), `il` (ingredient list), `me` (menu), `re` (recipe), `fi` (food items), `di` (drink items), `fa` (food advertisement), `fp` (food packaging).
- Extracción de listas de alimentos comestibles (`foods`) y bebidas (`drinks`) separadas por comas.
- Salida en formato condensado de cuatro líneas para minimizar tokens generados.
- Conversión bidireccional entre formato condensado y JSON estructurado mediante funciones auxiliares documentadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada (el entrenamiento se describe sobre textos en inglés).

## Casos de uso

- Filtrado de datasets de captions a gran escala: procesar datasets como DataComp-1B o Recap-DataComp-1B para retener únicamente las muestras con contenido gastronómico, usando la clasificación binaria `food_or_drink` como primer filtro barato y las listas extraídas como segundo filtro.
- Construcción de índices de recetas: extraer ingredientes y bebidas de textos culinarios para poblar bases de datos de recetas con entidades normalizadas.
- Enriquecimiento de catálogos de producto: detectar si una descripción de e-commerce corresponde a alimentación o bebida y etiquetarla con `fp` (food packaging) o `fa` (food advertisement) para segmentación de catálogo.
- Moderación y clasificación de contenido publicitario: identificar anuncios de comida (`fa`) frente a otro tipo de contenido en pipelines de revisión publicitaria.
- Preprocesamiento para visión por computador: generar etiquetas de alimentos a partir de captions de imagen para entrenar o evaluar clasificadores de comida, aprovechando el bajo coste del modelo de 270M.
- Extracción de menús y paneles nutricionales: etiquetar textos con `me` o `np` para enrutar documentos hacia extractores especializados posteriores.
- Deduplicación y análisis de corpus: agrupar documentos por presencia de ingredientes o bebidas para estudios de frecuencia alimentaria en corpus textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos (268M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en GPUs con 4 GB o más.
- En cuantización de 8 bits, los pesos ocupan aproximadamente 0,3 GB; en 4 bits, aproximadamente 0,15 GB (estimaciones teóricas, no verificadas con cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para lotes pequeños.
- Cabe en cualquier GPU consumer y en placas integradas con suficiente memoria compartida; es viable incluso en entornos sin GPU para volúmenes moderados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoodExtract-gemma-3-270m-fine-tune-v1 | 268M | no disponible | Extracción de comida/bebida | Gemma | Hugging Face |
| google/gemma-3-270m-it (base) | 270M | no disponible | Asistente general instruct | Gemma | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~500M | 32K (según familia Qwen2.5) | Asistente general instruct | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | Asistente general instruct | Apache 2.0 | Hugging Face |

La comparación directa es limitada: FoodExtract es un modelo de tarea única, mientras que los alternativos son asistentes generales que requerirían prompting o ajuste fino para igualar la tarea de extracción estructurada. La ventaja de FoodExtract es el formato de salida condensado y el etiquetado cerrado; su desventaja es la licencia Gemma frente a alternativas Apache 2.0 y la ausencia de cuantizaciones publicadas.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente conversacional general; su uso fuera de la extracción de comida/bebida producirá salidas degeneradas o irrelevantes.
- Entrenado sobre solo 1.400 muestras generadas por gpt-oss-120b: riesgo de sobreajuste al estilo y vocabulario del dataset, y cobertura limitada de dominios alimentarios (cocinas no occidentales, jerga regional, etc.).
- Riesgo de alucinación en la extracción: puede inventar alimentos o bebidas no presentes en el texto, especialmente con entradas ambiguas o muy largas.
- Idiomas soportados no documentados; el dataset de entrenamiento parece en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no disponible: entradas muy largas pueden truncarse o degradar la extracción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall o F1 en la tarea; la evaluación previa a producción es responsabilidad del usuario.
- Licencia Gemma: sujeta a los términos de uso de Google, con restricciones para ciertos usos comerciales y obligaciones de atribución; revisar antes de desplegar en producción.
- Repo de 12,9 GB para un modelo de 268M parámetros: el tamaño del repositorio sugiere artefactos adicionales (checkpoints de entrenamiento, optimizer states) que no son necesarios para inferencia; conviene descargar solo los safetensors.
- Sin descargas ni likes en el momento de la ficha: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhai2000/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Dataset de referencia para filtrado: https://huggingface.co/datasets/UCSC-VLAA/Recap-DataComp-1B
- Paper referenciado en los tags (arXiv:2506.14111): https://arxiv.org/abs/2506.14111
