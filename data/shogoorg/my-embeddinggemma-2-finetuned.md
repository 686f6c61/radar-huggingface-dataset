# shogoorg/my-embeddinggemma-2-finetuned

## Resumen

`shogoorg/my-embeddinggemma-2-finetuned` es un modelo de embeddings de frases (sentence transformer) obtenido mediante ajuste fino supervisado de `google/embeddinggemma-2`. Lo desarrolla el usuario independiente shogoorg y su propósito es mapear entradas textuales a un espacio vectorial denso de 768 dimensiones con similitud coseno, pensado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. Se publica bajo la librería `sentence-transformers` y el pipeline `sentence-similarity`.

El modelo hereda la arquitectura `EmbeddingGemma2Model` del modelo base de Google, con 271.002.648 parámetros totales según los pesos en safetensors, y añade las capas estándar de Sentence Transformers: pooling por media (con inclusión del prompt) y normalización L2 de la salida. El repositorio ocupa 0,6 GB y está etiquetado como `generated_from_trainer`, lo que indica un ajuste fino generado automáticamente con la librería de Hugging Face.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el ajuste fino se ha realizado sobre un conjunto de datos de tan solo 3 muestras de entrenamiento (columnas anchor, positive y negative) con la pérdida `MultipleNegativesRankingLoss`. Se trata, por tanto, de una prueba de concepto o experimento personal, no de un modelo listo para producción, y así debe considerarse en cualquier evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer sobre `EmbeddingGemma2Model` (transformer encoder); pooling por media y normalizacion L2 |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica un valor claramente erroneo, 1000000000000000019884624838656 tokens; debe consultarse el modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de salida | 768 |
| Funcion de similitud | similitud coseno |
| Modalidades declaradas | texto, imagen, audio, video, mensaje (segun la configuracion del modelo base) |
| Tamano del repositorio | 0,6 GB |
| Libreria | sentence-transformers |
| Modelo base | google/embeddinggemma-2 |
| Perdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 3 muestras |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre el codificador `EmbeddingGemma2Model` del modelo base de Google. La cadena de modulos es: (0) transformer de extraccion de caracteristicas que devuelve `last_hidden_state` para cada modalidad declarada (texto, imagen, audio, video, mensaje estructurado), (1) pooling por media con dimensión de embedding 768 e inclusión del prompt, y (2) normalización de la salida. El resultado es un vector denso de 768 dimensiones normalizado, apto para similitud coseno.

El ajuste fino se realizó con la pérdida `MultipleNegativesRankingLoss` (referencias arXiv:1908.10084 y arXiv:1807.03748), una función de contrastive learning que usa los negativos del propio batch. El conjunto de entrenamiento es anónimo, tiene solo 3 muestras con columnas anchor, positive y negative (longitudes medias de 12,0, 15,33 y 12,67 tokens respectivamente). No se dispone de información sobre número de pasos, épocas, hiperparámetros, composición del dataset ni si hubo etapas adicionales de alineación. El prefijo `generated_from_trainer` confirma que el artefacto se generó con el flujo automático de entrenamiento de Sentence Transformers.

## Capacidades

- Generación de embeddings de frases y documentos en un espacio denso de 768 dimensiones con similitud coseno.
- Similitud semántica entre pares de textos (`encode_query` / `encode_document` y cálculo de similitudes).
- Búsqueda semántica y recuperación de documentos por vecindad vectorial.
- Minería de paráfrasis y detección de duplicados semánticos.
- Clasificación y clustering de textos a partir de sus representaciones vectoriales.
- Separación explícita entre codificación de consultas y de documentos, útil en pipelines de recuperación asimétrica.
- La configuración heredada declara soporte de múltiples modalidades (texto, imagen, audio, video, mensaje), aunque no hay evidencia en la información disponible de que el ajuste fino preserve o entrene esas capacidades.
- No se dispone de información sobre tool calling, razonamiento multi-paso, modo thinking ni capacidades de agente; al ser un modelo de embeddings, estas capacidades no aplican.

## Casos de uso

- Búsqueda semántica en bases de conocimiento internas: indexar documentos con `encode_document` y consultar con `encode_query` para recuperar los fragmentos más relevantes por similitud coseno en 768 dimensiones. Adecuado por su formato compacto, aunque el ajuste con 3 muestras limita la confianza en el dominio específico.
- Deduplicación de registros y catálogos: generar embeddings de entradas y agrupar por umbral de similitud para detectar duplicados o casi duplicados en bases de datos de clientes o productos.
- Clustering temático de tickets de soporte: vectorizar mensajes y aplicar clustering (por ejemplo, k-means sobre los embeddings normalizados) para agrupar incidencias por tema.
- Clasificación de textos por vecino más cercano: usar los embeddings como características de entrada para clasificadores ligeros en tareas de moderación o etiquetado.
- Minería de paráfrasis en corpus de preguntas frecuentes: comparar pares de preguntas y quedarse con los que superen un umbral de similitud para consolidar FAQs.
- Recuperación aumentada (RAG) en prototipos: integrar el modelo como codificador en un pipeline de recuperación sobre una base vectorial, con la advertencia de que su calidad en dominios reales no está validada.
- Evaluación comparativa de codificadores: servir como línea base de experimentación frente al modelo base `google/embeddinggemma-2` en tareas de similitud semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271 millones de parámetros, en fp32 los pesos ocupan aproximadamente 1,08 GB; en fp16 unos 0,54 GB; en int8 unos 0,27 GB. A ello hay que sumar el overhead de activaciones y del runtime, por lo que en la práctica conviene reservar al menos 2-4 GB de VRAM para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 con lotes moderados; para indexación a gran escala se recomiendan A100, H100 o L40S por su mayor ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también es viable en CPU para volúmenes pequeños.
- Opciones de despliegue: `sentence-transformers` (referencia), `transformers` con pooling manual, y servidores de embeddings compatibles con el formato de Sentence Transformers. No hay información sobre compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shogoorg/my-embeddinggemma-2-finetuned | 271.002.648 | 768 | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| google/embeddinggemma-2 (modelo base) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| shogoorg/my-embedding-gemma | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros codificadores de 270-300 millones de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino se ha realizado con solo 3 muestras de entrenamiento, lo que hace muy probable el sobreajuste y limita seriamente la generalización a dominios reales.
- La model card declara una longitud máxima de secuencia absurda (un número de 31 dígitos), lo que indica un error de configuración o de generación automática de la documentación; no debe usarse ese valor como contexto real.
- La licencia no está indicada, por lo que no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base `google/embeddinggemma-2` antes de cualquier despliegue.
- No hay información sobre idiomas soportados ni sobre evaluación multilingüe del ajuste fino.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de uso o validación por la comunidad.
- Las modalidades de imagen, audio, video y mensaje aparecen en la configuración heredada, pero no hay evidencia de que el ajuste fino las preserve o las haya entrenado.
- Riesgo de sesgos y alucinaciones inherente al modelo base: no se documenta ningún análisis de sesgo ni de robustez.
- No apto para producción sin una evaluación previa sobre datos propios y, preferiblemente, un reentrenamiento con un conjunto de datos representativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shogoorg/my-embeddinggemma-2-finetuned
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Modelo relacionado del mismo autor: https://huggingface.co/shogoorg/my-embedding-gemma
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos de Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de MultipleNegativesRankingLoss: https://arxiv.org/abs/1908.10084
- Paper de SimCSE (referencia arXiv citada): https://arxiv.org/abs/2104.08821
- Paper de Sentence-BERT (referencia arXiv citada): https://arxiv.org/abs/1807.03748
