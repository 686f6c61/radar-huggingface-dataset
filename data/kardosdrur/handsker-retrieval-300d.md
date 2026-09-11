# kardosdrur/handsker-retrieval-300d

## Resumen

handsker-retrieval-300d es un modelo de embeddings de frases (sentence embeddings) en danés desarrollado por el usuario kardosdrur y publicado bajo licencia MIT. Se construye a partir de un modelo GloVe preentrenado sobre la totalidad del corpus Danish Dynaword durante 10 épocas con la librería GlovPy, convertido después a formato sentence-transformers mediante mean pooling y afinado finalmente sobre el conjunto sintético kardosdrur/synthetic-nordic-retrieval, compuesto por 94.067 ejemplos de recuperación.

A diferencia de los transformers habituales, la arquitectura subyacente es un StaticEmbedding: cada token se representa con un vector estático de 300 dimensiones y la representación de la frase se obtiene promediando los vectores de sus tokens. Por eso el tamaño total es de apenas unos 9 millones de parámetros (compatible con vocabulares del orden de 30.000 entradas × 300 dimensiones) y no incorpora mecanismos de atención ni de contexto composicional. La similitud se calcula por producto escalar coseno y la dimensionalidad de salida es de 300.

Su relevancia práctica está en ofrecer un componente de recuperación semántica extremadamente barato en cómputo y memoria para danés, un idioma con menos recursos que el inglés. Es adecuado como retriever de primer nivel en pipelines RAG, búsqueda semántica y deduplicación, pero no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StaticEmbedding (GloVe) envuelto en SentenceTransformer, con mean pooling |
| Parametros totales | ~9.000.000 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | sin límite práctico declarado por el autor ("inf" tokens); en la práctica acotada por el tokenizador y la memoria |
| Tipos de cuantizacion | no disponible (pesos en safetensors; por su tamaño admite reducción de precisión sin fricción) |
| Idiomas soportados | danés (da) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de un embedding GloVe entrenado con GlovPy sobre la totalidad del corpus Danish Dynaword durante 10 épocas. Ese embedding estático se convierte a un modelo sentence-transformers aplicando mean pooling sobre los vectores de tokens, y se afina después sobre el dataset sintético kardosdrur/synthetic-nordic-retrieval, con 94.067 ejemplos y la función de pérdida MultipleNegativesRankingLoss, típica del entrenamiento de retrievers densos con negativos en el propio lote. El tokenizador es de estilo BERT y también se entrenó sobre Dynaword.

No hay innovaciones de atención ni mecanismos de decodificación: la arquitectura es un bag-of-embeddings con pooling. Esto implica que no se modela el orden de las palabras ni la composición sintáctica más allá de la media de vectores, a cambio de una velocidad de inferencia muy alta y una huella de memoria mínima. La model card incluye referencias a los trabajos arXiv 1908.10084 y 1807.03748, habituales en la documentación de sentence-transformers.

## Capacidades

- Generación de embeddings de frases de 300 dimensiones para similitud semántica y feature extraction.
- Cálculo de similitud por coseno entre frases, orientado a recuperación (retrieval) de pasajes y documentos.
- Búsqueda semántica monolingüe en danés.
- Extracción de características densas para clasificación y clustering de texto.
- Uso como retriever en pipelines RAG en danés.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no; el modelo declara exclusivamente danés.
- No tiene modo "thinking" ni capacidades de audio.

## Casos de uso

- Búsqueda semántica en danés: indexar un corpus de documentos daneses con los embeddings de 300 dimensiones del modelo y resolver consultas por similitud coseno, con un coste de cómputo mínimo por documento.
- Recuperación para RAG en danés: usar el modelo como retriever que selecciona los pasajes relevantes antes de pasarlos a un LLM generativo, reduciendo el coste al delegar la fase de búsqueda a un modelo de 9 millones de parámetros.
- Deduplicación de contenidos: comparar pares de frases o artículos mediante similitud coseno para detectar duplicados casi idénticos en grandes volúmenes de texto danés.
- Clustering y organización de corpus: agrupar reseñas, tickets o comentarios en danés por temática mediante clustering sobre los embeddings de 300 dimensiones.
- Clasificación de texto ligera: emplear los embeddings como entrada de un clasificador (por ejemplo, regresión logística) para tareas de moderación o etiquetado, entrenable con muy pocos recursos.
- Enrutado de consultas en atención al cliente: dado un mensaje entrante en danés, calcular su similitud con una base de preguntas frecuentes y dirigirlo al flujo adecuado.
- Recomendación por contenido: vectorizar descripciones de productos o artículos daneses y recomendar elementos cercanos en el espacio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 36 MB para los ~9 millones de parámetros, más el overhead del runtime de PyTorch; irreduciblemente bajo en comparación con cualquier transformer.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU (incluidas integradas) es más que suficiente.
- Cabe en cualquier GPU de consumo: sí, incluidas GTX/RTX de gama de entrada, y también en CPU.
- Opciones de despliegue: sentence-transformers (referencia oficial), con posibilidad de exportarlo a ONNX u otros runtimes por su simplicidad. No aplican vLLM, TGI ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: no disponible como cifra publicada; por arquitectura (promedio de vectores estáticos) la codificación es mucho más rápida que la de un transformer de tamaño comparable.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo, por lo que la comparación es estructural y no de rendimiento.

| Modelo | Parametros | Dimension de salida | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kardosdrur/handsker-retrieval-300d | ~9 M | 300 | danés | MIT | Hugging Face |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 384 | más de 50 idiomas | Apache-2.0 | Hugging Face |
| intfloat/multilingual-e5-small | ~118 M | 384 | más de 100 idiomas | MIT | Hugging Face |

El modelo de este análisis es entre 10 y 13 veces más pequeño que las alternativas multilingües citadas, con menor dimensionalidad y cobertura exclusivamente danesa. Las cifras de los modelos comparados provienen de sus fichas públicas; no existe una comparación de rendimiento directa en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo de embeddings estáticos, no modela el orden de las palabras ni la composición sintáctica; frases con el mismo vocabulario pero significado distinto pueden quedar muy próximas.
- No resuelve polisemia más allá de un único vector por token.
- Idiomas soportados: únicamente danés; su uso en otros idiomas (por ejemplo, español) no está respaldado.
- No se han publicado benchmarks, por lo que su calidad real de recuperación en danés no está cuantificada.
- Riesgo de alucinación: no genera texto, por lo que no aplica en sentido estricto; el riesgo análogo es la recuperación de pasajes poco relevantes cuando el vocabulario de la consulta no coincide con el del corpus.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia de los datos de entrenamiento (Danish Dynaword y el dataset sintético) antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación externa limitada.
- La afirmación de longitud de contexto "inf" proviene del autor y debe interpretarse como ausencia de un límite posicional explícito, no como una garantía de calidad en secuencias muy largas.
- El corpus de entrenamiento Danish Dynaword y el dataset sintético pueden introducir sesgos propios de las fuentes originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kardosdrur/handsker-retrieval-300d
- Modelo base: https://huggingface.co/kardosdrur/handsker-pretrained-300d
- Dataset de entrenamiento: https://huggingface.co/datasets/kardosdrur/synthetic-nordic-retrieval
- Librería GlovPy: https://github.com/centre-for-humanities-computing/glovpy
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Referencias arXiv citadas en la model card: 1908.10084 y 1807.03748

Nota: la búsqueda web asociada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de Hugging Face y de la model card.
