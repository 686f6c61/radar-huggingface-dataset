# dragonsnail67/bge-m3-int8-onnx

## Resumen

bge-m3-int8-onnx es una conversión a ONNX con cuantización dinámica de 8 bits del modelo de embeddings BAAI/bge-m3, publicada por el usuario dragonsnail67. El modelo original, desarrollado por el Beijing Academy of Artificial Intelligence (BAAI), es un encoder multilingüe de la familia BGE (BAAI General Embedding) diseñado para recuperación de información densa, dispersa y multi-vector. Esta versión concreta conserva los pesos del modelo base pero los redondea a 8 bits mediante cuantización dinámica con onnxruntime, con el objetivo declarado de que quepa en un servidor CPU pequeño para un prototipo académico llamado GreenSearch.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de despliegue ligera para un modelo de embeddings ampliamente utilizado en pipelines RAG y búsqueda semántica. Por otro, conviene subrayar que se trata de una conversión de terceros, no oficial, con cero descargas y cero likes en el momento de la consulta, creada el 25 de noviembre de 2026, y cuya model card está redactada en indonesio. La información técnica disponible es muy escasa: no se detallan hiperparámetros de cuantización, ni métricas de evaluación, ni el proceso exacto de exportación.

El modelo produce embeddings densos de 1024 dimensiones a partir del token [CLS] normalizado en L2. El repositorio ocupa aproximadamente 0,6 GB, lo que es coherente con un encoder de unos 568 millones de parámetros cuantizado a int8. No se proporcionan datos sobre el contexto máximo efectivo tras la exportación ni sobre el rendimiento comparado con el modelo original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-like), base de BAAI/bge-m3; exportado a ONNX |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base BGE-M3 ronda los 568 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 mediante cuantizacion dinamica con onnxruntime |
| Idiomas soportados | no disponible; la model card menciona indonesio en las etiquetas, pero el modelo base es multilingue |
| Licencia | MIT |
| Formato de pesos | ONNX (int8) |
| Dimension del embedding | 1024 (token [CLS], normalizado L2) |
| Tipo de embedding | denso (la model card indica "dense embedding BGE-M3") |
| Tamano del repositorio | 0,6 GB |
| Libreria | onnx |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo BAAI/bge-m3, un encoder transformer de tipo XLM-RoBERTa entrenado por BAAI para generar representaciones multilingües aptas para recuperación. BGE-M3 se concibió para emitir simultáneamente embeddings densos, representaciones dispersas tipo léxico y embeddings multi-vector, lo que permite combinar varios modos de recuperación con un solo modelo. Esta conversión concreta, según la model card, emplea únicamente la salida densa: el vector del token [CLS] normalizado en L2, de 1024 dimensiones.

No se aporta información sobre el proceso de exportación a ONNX más allá de la mención a cuantización dinámica con onnxruntime. No se especifican los conjuntos de calibración, los operadores cuantizados, ni si se preservan las cabezas auxiliares del modelo original. Tampoco se documentan datos de entrenamiento, número de tokens, composición del corpus ni si hubo ajuste con RLHF o DPO; hay que remitirse a la documentación del modelo base para esos detalles, que no forman parte de la información proporcionada. La innovación técnica destacable aquí es exclusivamente la reducción de precisión a int8 para inferencia en CPU, no una modificación arquitectónica.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación de pasajes.
- Búsqueda semántica y recuperación densa en pipelines RAG, siempre que se use la salida [CLS] normalizada.
- Similitud entre frases y detección de duplicados o near-duplicates mediante distancia coseno.
- Clasificación y clustering de textos a partir de los vectores generados.
- Capacidad multilingüe heredada del modelo base BAAI/bge-m3, aunque no se documenta en esta conversión concreta.
- Inferencia en CPU mediante onnxruntime, sin necesidad de GPU.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en prototipos con recursos limitados: el formato ONNX int8 permite ejecutar el encoder en un servidor CPU modesto, tal como declara el autor para su proyecto GreenSearch, sin depender de GPU.
- Recuperación aumentada (RAG) en aplicaciones internas: indexar documentación y recuperar pasajes por similitud coseno usando los vectores de 1024 dimensiones, con un coste de memoria reducido frente al modelo en fp32.
- Deduplicación de registros: calcular embeddings de entradas de una base de datos y agrupar las que superen un umbral de similitud, útil en tareas de limpieza de corpus.
- Clasificación zero-shot ligera: comparar el embedding de un texto con embeddings de descripciones de categorías y asignar la más próxima, sin entrenar un clasificador.
- Motor de recomendación por contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial y ordenar candidatos por similitud.
- Filtrado previo en pipelines de moderación o triaje: descartar duplicados y agrupar mensajes similares antes de pasarlos a un modelo generativo más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (nDCG, Recall@k), ni comparaciones con el modelo base en fp32, ni mediciones de latencia o throughput tras la cuantización.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; en GPU, el repositorio de 0,6 GB sugiere un consumo de memoria en torno a esa cifra, aunque no se documenta.
- GPU recomendadas: no disponibles; el autor orienta el modelo a servidores CPU pequeños.
- Cabe en GPU de consumo: sí, por tamaño, aunque no hay datos de rendimiento en GPU para esta conversión.
- Opciones de despliegue: onnxruntime (CPU o GPU), y potencialmente servidores compatibles con ONNX como Triton o servicios propios; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de encoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dragonsnail67/bge-m3-int8-onnx | no disponible (base ~568 M) | no disponible | ONNX int8 | MIT | Conversion de terceros, sin benchmarks publicados |
| BAAI/bge-m3 | ~568 M | no disponible en la informacion proporcionada | safetensors (fp32/fp16) | MIT | Modelo original, con documentacion y evaluaciones propias |
| BAAI/bge-large-en-v1.5 | no disponible en la informacion proporcionada | no disponible | safetensors | MIT | Alternativa de embeddings, principalmente en ingles |
| intfloat/multilingual-e5-large | no disponible en la informacion proporcionada | no disponible | safetensors | MIT | Alternativa multilingue de embeddings densos |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas para esta conversión ni se han incluido en la información proporcionada las del modelo base.

## Limitaciones y advertencias

- Conversión no oficial: se trata de un repositorio de terceros con cero descargas y cero likes, sin evidencia de validación por parte de la comunidad.
- Ausencia total de evaluación: no hay benchmarks que confirmen que la cuantización int8 preserva la calidad de recuperación del modelo original.
- Model card en indonesio y muy breve: no documenta el proceso de exportación, los operadores cuantizados ni el contexto máximo soportado.
- Solo salida densa: aunque BGE-M3 soporta recuperación dispersa y multi-vector, esta conversión únicamente expone el embedding [CLS] denso según la model card.
- Riesgo de sesgos y alucinación: como encoder de similitud no genera texto, pero puede heredar sesgos del corpus de entrenamiento del modelo base y producir recuperaciones sesgadas o irrelevantes.
- Idiomas: las etiquetas mencionan indonesio, pero no se especifica qué idiomas conserva la conversión; conviene validar el comportamiento multilingüe antes de usarla en producción.
- Licencia MIT: permite uso comercial, pero al derivar de BAAI/bge-m3 conviene revisar también las condiciones del modelo base.
- Fecha de creación futura (2026) y metadatos incompletos: tratar la ficha con cautela y verificar el repositorio antes de integrarlo en un pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dragonsnail67/bge-m3-int8-onnx
- Modelo base: https://huggingface.co/BAAI/bge-m3
