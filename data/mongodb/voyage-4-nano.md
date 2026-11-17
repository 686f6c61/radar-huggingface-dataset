# MongoDB/voyage-4-nano

## Resumen

voyage-4-nano es un modelo de embeddings de texto de la serie Voyage 4, desarrollado por Voyage AI y distribuido en Hugging Face bajo el identificador MongoDB/voyage-4-nano. Está diseñado para tareas de búsqueda semántica y recuperación de información (retrieval) de alto rendimiento, y se presenta como la variante más ligera de la familia Voyage 4, pensada para desarrollo local y entornos con recursos limitados. La arquitectura se basa en un transformer de tipo Qwen3 (según los tags del repositorio) con 346.451.968 parámetros totales, de los cuales 180M son no-embedding y 160M corresponden a la matriz de embeddings.

El modelo resuelve el problema de generar representaciones vectoriales densas para búsqueda semántica multilingüe con una ventana de contexto de 32.000 tokens, muy superior a la de muchos modelos de embeddings convencionales. Su rasgo diferencial es que comparte espacio de embeddings con el resto de la serie Voyage 4 (`voyage-4-large`, `voyage-4`, `voyage-4-lite`), de modo que los vectores generados por cualquiera de ellos son directamente comparables e intercambiables sin necesidad de reindexar los datos. Esto permite usar el modelo grande para indexación de alta fidelidad y el nano para consultas en local o en desarrollo.

Es relevante ahora porque combina dos técnicas que reducen el coste de despliegue sin sacrificar calidad: Matryoshka Representation Learning (MRL), que permite truncar la dimensionalidad de salida a 2048, 1024, 512 o 256 dimensiones, y quantization-aware training, que habilita salidas en float32, int8 con y sin signo y binario. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, según tags del repositorio) |
| Parametros totales | 346.451.968 (180M no-embedding + 160M embedding) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | Salidas en float32, int8 con signo, int8 sin signo y binario (quantization-aware training); cuantización de pesos no especificada |
| Idiomas soportados | Multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; compatible con sentence-transformers y transformers |
| Dimensiones de embedding | 2048 por defecto; truncables a 1024, 512 y 256 (MRL) |
| Librería | sentence-transformers, transformers (>=4.56) |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo Qwen3 adaptado a generación de embeddings, con 346 millones de parámetros totales. La model card indica 180M de parámetros no-embedding y 160M en la matriz de embeddings, lo que sugiere una dimensión de embedding interna elevada coherente con la salida por defecto de 2048 dimensiones. La extracción del vector se realiza mediante mean pooling sobre los estados ocultos y normalización L2 posterior, tal como se muestra en los ejemplos de uso oficiales.

El entrenamiento incorpora dos innovaciones técnicas destacadas. Por un lado, Matryoshka Representation Learning (MRL), que entrena el modelo para que los primeros componentes del vector concentren la información más relevante, permitiendo truncar la salida a 1024, 512 o 256 dimensiones con pérdida mínima de calidad de recuperación. Por otro, quantization-aware training, que prepara al modelo para producir embeddings en int8 y binario con degradación controlada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, algo esperable en un modelo de embeddings y no de generación.

## Capacidades

- Generación de embeddings de texto densos para búsqueda semántica y recuperación de información.
- Soporte multilingüe, según los tags y la model card.
- Ventana de contexto de 32.000 tokens, adecuada para documentos largos.
- Embeddings de dimensionalidad flexible (2048, 1024, 512, 256) mediante MRL.
- Salidas en múltiples precisiones (float32, int8 con y sin signo, binario) gracias al quantization-aware training.
- Espacio de embeddings compartido con `voyage-4-large`, `voyage-4` y `voyage-4-lite`, lo que permite mezclar modelos de la serie sin reindexar.
- Métodos `encode_query` y `encode_document` en sentence-transformers que aplican automáticamente los prompts asimétricos recomendados.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step en el sentido de un LLM; su función es exclusivamente la extracción de features.

## Casos de uso

- Búsqueda semántica en producción: indexar documentos con `voyage-4-large` y servir consultas con `voyage-4-nano` aprovechando el espacio de embeddings compartido, reduciendo coste de inferencia sin reindexar.
- Desarrollo local de sistemas RAG: el tamaño de 0,7 GB permite ejecutar el modelo en portátiles y estaciones de trabajo sin GPU dedicada, manteniendo compatibilidad con el índice de producción.
- Recuperación sobre documentos largos: la ventana de 32.000 tokens permite embeber contratos, informes o artículos completos sin fragmentación agresiva.
- Deduplicación y clustering de documentos multilingües: los embeddings normalizados permiten calcular similitud coseno para agrupar contenido similar en corpus con varios idiomas.
- Filtrado y reranking de candidatos: usar la salida truncada a 256 o 512 dimensiones para una primera fase rápida y la de 2048 para una segunda fase de mayor precisión.
- Despliegue con almacenamiento optimizado: los embeddings en int8 o binario reducen el espacio de índice hasta 4x o 32x respectivamente frente a float32, útil en bases vectoriales con millones de registros.
- Integración en MongoDB Atlas Vector Search: al estar publicado por MongoDB, encaja de forma natural en pipelines de búsqueda vectorial sobre esa plataforma.

## Benchmarks y rendimiento

La model card indica que `voyage-4-nano` supera a modelos de embeddings existentes de mayor tamaño, incluido `voyage-3.5-lite`, y remite a un blog de lanzamiento y a una hoja de cálculo de evaluación para las métricas detalladas. En la información proporcionada no se incluyen los valores numéricos de dichos benchmarks.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 1,4 GB solo para pesos (346M parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en bfloat16: en torno a 0,7 GB para pesos, más activaciones; la model card recomienda bfloat16 y `flash_attention_2` en GPU.
- GPU recomendadas: A100, H100 y RTX 30/40 series para inferencia con `flash_attention_2` y bfloat16, según la propia model card.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de VRAM en bfloat16; también puede ejecutarse en CPU con sentence-transformers.
- Opciones de despliegue: transformers (>=4.56), sentence-transformers, text-embeddings-inference y endpoints compatibles. No se menciona soporte explícito de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voyage-4-nano | 346M (180M no-embedding + 160M embedding) | 32.000 | 2048 (truncable a 256) | Apache 2.0 | Hugging Face, sentence-transformers |
| voyage-3.5-lite | no disponible | no disponible | no disponible | no disponible | no disponible |
| voyage-4-lite | no disponible | no disponible | mismo espacio compartido | no disponible | serie Voyage 4 |
| voyage-4-large | no disponible | no disponible | mismo espacio compartido | no disponible | serie Voyage 4 |

La model card afirma que `voyage-4-nano` supera a `voyage-3.5-lite` en calidad de recuperación pese a ser más pequeño, pero no se aportan cifras en la información disponible. El resto de modelos de la serie Voyage 4 comparten espacio de embeddings, por lo que la comparación relevante es de coste y throughput más que de compatibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; solo genera embeddings.
- Los sesgos del corpus de entrenamiento no se documentan en la información disponible; al ser multilingüe, pueden aparecer sesgos específicos por idioma.
- Riesgo de degradación en dominios muy especializados (código, legal, biomédico) si no se ha validado con datos propios; no se aportan métricas por dominio.
- El truncado de dimensionalidad y la cuantización reducen la calidad de recuperación, aunque la model card indique que la pérdida es mínima; conviene medir en el corpus propio.
- El uso de `trust_remote_code=True` implica ejecutar código del repositorio; conviene revisarlo antes de desplegar en producción.
- Requiere transformers >= 4.56; versiones anteriores no son compatibles.
- Aunque la licencia es Apache 2.0, el uso de la API alojada de Voyage AI está sujeto a sus propios términos, no cubiertos por esta ficha.
- No se especifican límites de idioma dentro de "multilingüe"; el rendimiento puede variar entre lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/MongoDB/voyage-4-nano
- Blog de lanzamiento Voyage 4: https://blog.voyageai.com/2026/01/15/voyage-4/
- Hoja de cálculo de evaluación: https://docs.google.com/spreadsheets/d/1d-06Fh_LqAGBEEIbHN95OxccXcMWYq5uJ0e9LFKaPI8
- MongoDB: https://www.mongodb.com/
- MongoDB Atlas (servicio gestionado): https://account.mongodb.com/account
