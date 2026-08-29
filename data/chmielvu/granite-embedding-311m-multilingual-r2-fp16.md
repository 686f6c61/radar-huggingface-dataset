# chmielvu/granite-embedding-311m-multilingual-r2-fp16

## Resumen

El modelo `granite-embedding-311m-multilingual-r2` es un modelo de embeddings densos multilingüe desarrollado por IBM dentro de la familia Granite Embeddings. Está diseñado para producir representaciones vectoriales de texto de alta calidad, orientadas a tareas de búsqueda semántica, similitud y recuperación en más de 200 idiomas, con soporte mejorado para 52 de ellos. Su arquitectura se basa en ModernBERT, con una expansión del vocabulario multilingüe, y genera vectores de 768 dimensiones con una longitud de contexto de hasta 32 768 tokens, lo que lo hace adecuado para documentos largos y consultas complejas.

El modelo se publica en dos tamaños: una versión completa de 311M parámetros y una versión compacta de 97M parámetros obtenida mediante poda y selección de vocabulario, que según el paper alcanza el mejor rendimiento de recuperación entre los modelos abiertos multilingües de menos de 100M parámetros. La versión de 311M prioriza la precisión sobre el rendimiento, siendo apropiada cuando la exactitud en recuperación multilingüe es crítica y se dispone de recursos de cómputo suficientes.

Cabe señalar que el repositorio `chmielvu/granite-embedding-311m-multilingual-r2-fp16` en HuggingFace no contiene el modelo original, sino un prototipo experimental de simulación de empaquetado para LightRAG, sin relación con el modelo de IBM. La ficha se basa en la documentación oficial del modelo de IBM y en el paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (bi-encoder) con vocabulario multilingüe expandido |
| Parametros totales | 311 664 384 (311M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | no disponible (se espera FP16, FP32, posiblemente cuantizaciones de 8 bits) |
| Idiomas soportados | 200+ idiomas, con soporte mejorado para 52 idiomas y código |
| Licencia | no disponible (verificar en el repositorio oficial de IBM) |
| Formato de pesos | safetensors (probablemente también ONNX, según el repo experimental) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un transformer bidireccional optimizado para eficiencia y contexto largo. IBM ha expandido el vocabulario original de ModernBERT para cubrir más de 200 idiomas, manteniendo la capacidad de procesar secuencias de hasta 32 768 tokens. El entrenamiento se realizó sobre un corpus multilingüe que incluye texto y código, con un enfoque en tareas de recuperación y similitud. No se han publicado detalles específicos sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; la información disponible indica que se trata de un modelo de embeddings entrenado con objetivos contrastivos, típicos de este tipo de modelos.

La versión compacta de 97M se obtiene mediante poda del modelo de 311M y selección de vocabulario, logrando un equilibrio entre tamaño y rendimiento. El paper asociado (arXiv:2605.13521v2) describe el proceso de construcción y evaluación de ambos modelos.

## Capacidades

- Generación de embeddings de texto de alta calidad para búsqueda semántica, similitud y recuperación.
- Soporte multilingüe amplio: más de 200 idiomas, con rendimiento mejorado en 52 idiomas y código.
- Manejo de contextos largos de hasta 32 768 tokens, adecuado para documentos extensos, informes o artículos.
- Producción de vectores de 768 dimensiones, compatibles con índices vectoriales estándar (FAISS, Milvus, etc.).
- No incluye capacidades de generación de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe en bases de conocimiento: el modelo puede indexar documentos en varios idiomas y recuperar los más relevantes para consultas en cualquier idioma soportado, gracias a su contexto de 32K tokens que permite procesar documentos completos sin truncamiento.
- Sistemas de recomendación de contenido: al generar embeddings de artículos, noticias o productos, se pueden calcular similitudes entre ítems y usuarios para sugerir contenido personalizado en entornos multilingües.
- Clasificación y agrupación de textos: los embeddings de 768 dimensiones sirven como entrada para clasificadores o algoritmos de clustering, permitiendo organizar grandes volúmenes de texto en categorías temáticas.
- Recuperación de código fuente: con soporte mejorado para código, el modelo puede indexar repositorios y recuperar fragmentos de código relevantes a partir de consultas en lenguaje natural o en otros lenguajes de programación.
- Chatbots y asistentes virtuales con base de conocimiento: el modelo se integra en pipelines de retrieval-augmented generation (RAG) para seleccionar los pasajes más relevantes antes de generar respuestas, mejorando la precisión en entornos multilingües.
- Análisis de documentos legales o financieros: su contexto largo permite procesar contratos, informes o expedientes completos, extrayendo similitudes entre documentos o buscando cláusulas específicas en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El paper menciona que la versión compacta de 97M alcanza el mejor puntaje de recuperación entre modelos abiertos multilingües de menos de 100M parámetros, pero no se proporcionan cifras concretas para la versión de 311M. Se recomienda consultar el paper original para métricas específicas.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 622 MB solo para los pesos. Con contexto de 32K tokens, el uso de memoria puede aumentar significativamente durante la inferencia, dependiendo del tamaño del lote. Se estima que una GPU con 8 GB de VRAM puede ejecutar el modelo con lotes pequeños.
- GPU recomendadas: NVIDIA T4, V100, RTX 3090/4090, A10, A100, H100. Para producción con alto throughput, se recomienda al menos una A10 o superior.
- Es viable en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070, siempre que se gestione el tamaño del lote.
- Opciones de despliegue: el modelo se puede servir con vLLM, TGI, o mediante frameworks de embeddings como TEI (Text Embeddings Inference) de HuggingFace. También es compatible con llama.cpp para CPU, aunque con menor rendimiento.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 311M, se espera una latencia de decenas de milisegundos por lote en GPU moderna, pero depende del hardware y la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Dimensiones | Licencia |
|---|---|---|---|---|---|
| granite-embedding-311m-multilingual-r2 | 311M | 32 768 | 200+ | 768 | no disponible |
| BGE-M3 | 568M | 8192 | 100+ | 1024 | MIT |
| E5-mistral-7b-instruct | 7B | 32 768 | 100+ | 4096 | MIT |
| gte-multilingual-base | 305M | 512 | 100+ | 768 | Apache 2.0 |

El modelo de IBM compite directamente con BGE-M3 y gte-multilingual-base en el rango de 300M parámetros. Su principal ventaja es el contexto de 32K tokens, muy superior a los 8K de BGE-M3 y los 512 de gte-multilingual-base. E5-mistral es mucho más grande y pesado, pero ofrece mayor capacidad de representación. La licencia del modelo de IBM no está confirmada en la información disponible, mientras que BGE-M3 y E5 son de código abierto permisivo.

## Limitaciones y advertencias

- No se ha confirmado la licencia exacta del modelo; es necesario verificar en el repositorio oficial de IBM antes de uso comercial.
- El modelo está diseñado exclusivamente para generar embeddings; no puede generar texto ni realizar razonamiento conversacional.
- Aunque soporta 200+ idiomas, el rendimiento puede ser inferior en idiomas poco representados en el corpus de entrenamiento.
- El contexto de 32K tokens puede aumentar el consumo de memoria y la latencia en comparación con modelos de contexto más corto.
- No se han publicado benchmarks detallados, por lo que la comparación objetiva con otros modelos requiere evaluación propia.
- El repositorio `chmielvu/granite-embedding-311m-multilingual-r2-fp16` es un prototipo experimental no relacionado con el modelo real; se debe descargar el modelo desde el repositorio oficial de IBM.

## Enlaces

- Repositorio oficial del modelo: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Documentación de IBM Granite Embedding: https://www.ibm.com/granite/docs/models/embedding
- Paper (arXiv): https://arxiv.org/html/2605.13521v2
- Repositorio experimental (no relacionado): https://huggingface.co/chmielvu/granite-embedding-311m-multilingual-r2-fp16
