# adodabele/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-v1 es un ajuste fino supervisado (SFT) del modelo google/gemma-3-270m-it, publicado por el usuario adodabele, orientado a una única tarea: extraer información estructurada de alimentos y bebidas a partir de texto libre. Dado un texto crudo (típicamente un caption de imagen), el modelo decide si el contenido es comida o bebida, lo etiqueta con un conjunto cerrado de etiquetas y devuelve dos listas separadas de alimentos y bebidas. La relevancia práctica está en el filtrado a gran escala de datasets de captions, como Recap-DataComp-1B, donde etiquetar 1.000 millones de textos con un modelo pequeño y barato es mucho más viable que con un LLM grande.

El modelo tiene 268.098.176 parámetros (unos 268 M) y se distribuye en safetensors con licencia Gemma. Se ha entrenado sobre FoodExtract-1k, un dataset de 1.400 muestras de pares texto crudo/salida JSON generadas por gpt-oss-120b, lo que lo convierte en un caso de destilación de un modelo grande a uno muy pequeño para una tarea de extracción muy acotada.

La salida no es JSON, sino un formato condensado de cuatro líneas (`food_or_drink`, `tags`, `foods`, `drinks`) para reducir el número de tokens generados. El repositorio incluye funciones auxiliares (`condense_output` y `uncondense_output`) para convertir entre el formato condensado y el diccionario JSON. El modelo no tiene descargas ni likes y no publica evaluación, por lo que debe tratarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-270m-it); tipo de atención y detalles internos no disponibles |
| Parametros totales | 268.098.176 (aproximadamente 268 M), dato real de safetensors |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la hereda del modelo base google/gemma-3-270m-it |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision completa (safetensors). No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; los datos de entrenamiento (FoodExtract-1k) estan en ingles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,6 GB |
| Modelo base | google/gemma-3-270m-it |
| Tipo de ajuste | SFT (supervised fine-tuning) con TRL; tag generated_from_trainer |
| Tarea | text-generation (extraccion estructurada de alimentos y bebidas) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de unos 268 M de parámetros (google/gemma-3-270m-it, la variante instruct de la familia Gemma 3). El ajuste se ha realizado con TRL en modo SFT sobre el modelo instruct ya entrenado, no sobre el modelo preentrenado base. No se documentan en la información disponible ni la composición de tokens del preentrenamiento original, ni si hubo fases de RLHF/DPO en el ajuste fino (los tags solo indican `sft` y `generated_from_trainer`).

El dato de entrenamiento clave es el dataset FoodExtract-1k: 1.400 muestras de texto crudo emparejadas con salidas JSON generadas por gpt-oss-120b. Es, por tanto, un pipeline de destilación: un modelo grande produce las anotaciones y un modelo de 268 M aprende a replicar el formato y la decisión de extracción. La innovación práctica del modelo es el formato de salida condensado, que evita generar JSON completo y reduce los tokens de salida a cuatro líneas: `food_or_drink: 1`, `tags: fi, di`, `foods: ...`, `drinks: ...`. El autor proporciona funciones de condensado y desconvensado para integrarlo en pipelines existentes. El vocabulario de etiquetas es fijo y está definido en el diccionario `tags_dict` (`np` nutrition_panel, `il` ingredient list, `me` menu, `re` recipe, `fi` food_items, `di` drink_items, `fa` food_advertistment, `fp` food_packaging).

## Capacidades

- Clasificación binaria de contenido: determinar si un texto describe comida o bebida (`food_or_drink: 0/1`).
- Etiquetado multietiqueta con un conjunto cerrado de 8 categorías documentales (panel nutricional, lista de ingredientes, menú, receta, alimentos, bebidas, publicidad de alimentos, envase de alimentos).
- Extracción de listas de alimentos comestibles mencionados en el texto.
- Extracción de listas de bebidas mencionadas en el texto.
- Manejo de textos con múltiples ítems y separadores heterogéneos (por ejemplo, listas de ingredientes de un desayuno completo).
- Descarte de textos no relacionados con comida (por ejemplo, captions de videojuegos o escenas no culinarias), devolviendo listas vacías.
- Salida en formato condensado de bajo coste en tokens, pensada para filtrado masivo por etiqueta.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües: no disponibles; el entrenamiento es en inglés y no se ha evaluado en otros idiomas.

## Casos de uso

- Filtrado de datasets de captions a gran escala: aplicar el modelo sobre corpus como Recap-DataComp-1B para conservar únicamente los textos con `food_or_drink: 1`, usando las etiquetas para un filtrado más fino por tipo de contenido (receta, menú, lista de ingredientes).
- Construcción de subconjuntos temáticos para entrenamiento de modelos de visión: agrupar captions de alimentos para preentrenar o evaluar clasificadores culinarios sin recorrer el dataset completo con un LLM grande.
- Normalización de listas de ingredientes: extraer `foods` de recetas o etiquetas de producto y volcarlas a una estructura de base de datos para agregación y búsqueda.
- Enriquecimiento de catálogos de comercio electrónico: procesar descripciones de producto para detectar si el artículo es alimento o bebida y poblar campos estructurados de ingredientes y bebidas asociadas.
- Moderación y clasificación de anuncios: usar las etiquetas `fa` (publicidad de alimentos) y `fp` (envase de alimentos) para enrutar contenido publicitario hacia revisores o sistemas de cumplimiento normativo.
- Preprocesado de menús digitales: extraer platos y bebidas de texto OCR o descripciones de menús (`me`) para generar cartas estructuradas.
- Etiquetado de bajo coste en pipelines de anotación: como primera pasada barata sobre texto antes de enviar solo los casos ambiguos a un modelo mayor, reduciendo el coste total de anotación.
- Clasificación previa en sistemas de recomendación gastronómica: detectar contenido culinario en textos de usuario o descripciones antes de indexarlo en un recomendador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluación, métricas de precisión/recall para la extracción, ni comparación con el modelo base. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a buscadores de imágenes y no son pertinentes).

## Requisitos de hardware

- VRAM estimada para los pesos en FP16/BF16: aproximadamente 0,54 GB (268 M × 2 bytes). Con caché KV, activaciones y overhead del runtime, el consumo total realista se sitúa en torno a 1-2 GB.
- VRAM estimada en INT8: aproximadamente 0,27 GB de pesos. En INT4: aproximadamente 0,14 GB. Estas cuantizaciones no están publicadas oficialmente y requerirían conversión por parte del usuario.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, T4, L4. En A100, H100, RTX 4090 o L40S el modelo queda limitado por overhead del runtime, no por memoria.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable la inferencia en CPU e incluso en dispositivos de placa única tipo Raspberry Pi.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (el repositorio incluye el tag `endpoints_compatible`), vLLM y cualquier servidor compatible con safetensors. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se distribuye.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependerán fuertemente del hardware y del backend elegido; el coste por petición será bajo por el tamaño del modelo y por la salida condensada de solo cuatro líneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| adodabele/FoodExtract-gemma-3-270m-fine-tune-v1 | 268 M | no disponible | Gemma Terms of Use | Extraccion estructurada de alimentos y bebidas (SFT) | safetensors, 0 descargas |
| google/gemma-3-270m-it | 268 M | no disponible en la informacion proporcionada | Gemma Terms of Use | Modelo instruct generalista (base del anterior) | safetensors, muy descargado |
| Modelos instruct pequenos de proposito general (por ejemplo, en el rango 0,3-1 B) | 300 M - 1 B | no disponible | variable (Apache-2.0, MIT, etc.) | Generacion de texto e instrucciones generales | ampliamente disponibles |

La comparación cuantitativa de rendimiento no es posible: no hay métricas publicadas para este ajuste ni evaluación frente a alternativas. La diferencia funcional frente al modelo base es que FoodExtract-v1 ha sacrificado generalidad para especializarse en una salida estructurada y muy corta, mientras que gemma-3-270m-it no produce ese formato de manera fiable sin ejemplos en el prompt.

## Limitaciones y advertencias

- No se han publicado evaluaciones: se desconoce la precisión real de clasificación y de extracción, así como la tasa de falsos positivos y negativos.
- Riesgo de alucinación: al ser un modelo de 268 M, puede inventar alimentos o bebidas que no aparecen en el texto, especialmente en entradas largas, ambiguas o con vocabulario poco frecuente.
- Sesgo de dominio: el entrenamiento se ha hecho con solo 1.400 muestras y con anotaciones generadas por gpt-oss-120b, por lo que hereda los sesgos y errores sistemáticos de ese anotador. Las categorías poco representadas en el dataset (por ejemplo, panel nutricional o envase de alimentos) probablemente tengan peor desempeño.
- Idioma: no se documentan idiomas soportados; los datos son en inglés, así que el comportamiento en castellano u otros idiomas es desconocido y no está garantizado.
- Longitud de contexto: no disponible. Los captions largos o textos de recetas extensos pueden exceder la ventana heredada del modelo base y truncarse.
- Formato de salida rígido: el modelo espera y produce el esquema condensado de cuatro líneas; desviarse de él requiere post-procesado con las funciones auxiliares del repositorio (`uncondense_output`) y no hay validación formal del formato.
- Etiquetas fijas: el conjunto de 8 etiquetas es cerrado y no se puede ampliar sin reentrenar.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la política de usos prohibidos de Google, que deben revisarse y aceptarse antes de cualquier despliegue en producción.
- Pérdida de capacidades generales: al ser un ajuste fino de un modelo instruct de 268 M sobre una única tarea, es previsible una degradación en el seguimiento de instrucciones generales, aunque no está cuantificada.
- Sin validación comunitaria: 0 descargas y 0 likes implican que el modelo no ha sido probado por terceros; no hay informes independientes de robustez.
- Sin cuantizaciones oficiales: usar el modelo en entornos con menos de 1 GB de VRAM exige convertir los pesos a INT8/INT4 o a GGUF, lo que introduce pérdida de calidad no medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adodabele/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento FoodExtract-1k: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Dataset de captions mencionado en la model card (Recap-DataComp-1B): https://huggingface.co/datasets/UCSC-VLAA/Recap-DataComp-1B
- Referencia arXiv incluida en los tags del repositorio (arxiv:2506.14111): https://arxiv.org/abs/2506.14111
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio TRL (framework de entrenamiento usado): https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de buscadores de imagenes (Bing Visual Search, Google Images, Pinterest, Guru99) sin relacion con la ficha.
