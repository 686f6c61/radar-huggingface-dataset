# jajmangold/cyberntx-384-v2

## Resumen

cyberntx-384-v2 es un modelo de embeddings de recuperación de tipo estático publicado por el usuario jajmangold bajo licencia MIT. Se trata de un checkpoint temprano —el propio autor indica que el entrenamiento continúa— obtenido por destilación de microsoft/harrier-oss-v1-0.6b mediante entrenamiento contrastivo y regresión sobre las salidas del profesor. Produce vectores de 384 dimensiones y su tarea declarada es la similitud semántica de frases y la búsqueda densa.

A diferencia de un codificador transformer, un modelo estático no ejecuta atención ni capas de encoder en inferencia: cada token se representa con una fila de una tabla y el vector de la secuencia se obtiene combinando esas filas (sum-pooling). El recuento de parámetros confirma esta estructura: 58.240.896 = 151.669 × 384, es decir, una tabla pura de tokens sin capas adicionales. Esto lo hace extremadamente barato de servir, apto para CPU y con huella de memoria mínima, a cambio de una calidad inferior a la de los codificadores densos de mayor tamaño.

Con un repositorio de 0,2 GB, el modelo se orienta a escenarios donde el coste por consulta y la latencia pesan más que la precisión puntera: recall previo, reranking ligero o indexación masiva. El autor reporta una mejora de alrededor del 22 % frente a su propio checkpoint v1 en tareas de recuperación de MTEB, aunque todavía por debajo de amgix/static-retrieval-multilingual-69m-v1, el modelo comparable de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de tokens con sum-pooling, sin encoder transformer en inferencia) |
| Parámetros totales | 58.240.896 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el tamaño admite fp32, fp16 e int8) |
| Idiomas soportados | no disponible (el corpus incluye CC-NEWS-ES y Wikipedia, pero el autor no declara listado de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión del embedding | 384 |
| Librería | sentence-transformers |
| Pipeline declarado | sentence-similarity |
| Vocabulario de la tabla | 151.669 filas (deducido del recuento exacto de parámetros) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un embedding estático del tipo «tabla de tokens sum-pooled»: no hay atención, ni codificación posicional, ni capas feed-forward en el paso de inferencia. La representación de una frase se calcula sumando los vectores de sus tokens y normalizando el resultado, lo que implica que el modelo es insensible al orden de las palabras más allá de la composición del vocabulario. Esta familia de modelos (estilo Model2Vec o potion) se caracteriza por una inferencia que se reduce a búsquedas en tabla y sumas, sin multiplicaciones de matrices de atención.

El entrenamiento combina objetivos contrastivos con regresión directa sobre las representaciones del modelo profesor microsoft/harrier-oss-v1-0.6b, del que el modelo destila. El corpus declarado contiene aproximadamente 8,95 millones de filas procedentes de web crawl, StackExchange, Wikipedia, CC-NEWS-ES, PMC y OpenAlex. No se menciona en la información disponible el uso de RLHF ni de DPO, ni el número total de tokens vistos. El autor describe explícitamente este checkpoint como un estado temprano de entrenamiento, con más datos e iteraciones previstas.

La innovación relevante no está en el mecanismo de atención sino en el compromiso coste-calidad: se obtiene un modelo de 384 dimensiones y ~58 M de parámetros que compite con codificadores mucho mayores en tareas de recuperación, a cambio de renunciar a la composicionalidad contextual que aporta un transformer.

## Capacidades

- Generación de embeddings de frases y documentos de 384 dimensiones para similitud semántica.
- Recuperación densa (dense retrieval) sobre corpus indexados por similitud coseno o producto escalar.
- Reranking ligero de candidatos previamente recuperados por un sistema de primera etapa.
- Deduplicación semántica y agrupamiento (clustering) de textos.
- Clasificación de textos mediante similitud con prototipos o ejemplos etiquetados.
- Ejecución en CPU con coste muy bajo, apta para entornos sin GPU.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incluye modo de pensamiento (thinking mode) ni salidas estructuradas más allá del vector de embedding.
- Capacidades multilingües: no declaradas por el autor.

## Casos de uso

- Recall previo en pipelines RAG: dado que la inferencia es una simple agregación de vectores de tabla, puede actuar como primera etapa de recuperación sobre millones de fragmentos y dejar el reranking fino a un cross-encoder, reduciendo el coste total del sistema.
- Reranking de bajo coste en buscadores: permite reordenar cientos de candidatos por similitud semántica sin consumir GPU, adecuado cuando el presupuesto de latencia por consulta es muy ajustado.
- Deduplicación de corpus a gran escala: indexar un corpus completo con vectores de 384 dimensiones y descartar pares por encima de un umbral de similitud es viable en máquinas sin acelerador, algo inviable con codificadores de cientos de millones de parámetros.
- Búsqueda semántica en el edge o en dispositivos móviles: al no requerir atención ni memoria de activaciones, el modelo puede empaquetarse en aplicaciones locales para búsqueda offline sobre documentación o notas.
- Clasificación y enrutado de tickets o consultas: comparar el embedding de la consulta entrante con un conjunto de prototipos permite asignar categoría o cola de atención sin entrenar un clasificador específico.
- Cache semántico de respuestas: almacenar embeddings de preguntas previas para servir respuestas ya calculadas cuando la similitud supera un umbral, reduciendo llamadas a modelos generativos más caros.
- Filtrado de contenido y moderación por similitud: comparar textos entrantes contra un conjunto de ejemplos de referencia para señalar contenido próximo a categorías no deseadas.
- Exploración y análisis de datasets: agrupar o visualizar grandes colecciones de texto (por ejemplo, los corpus de web crawl, PMC u OpenAlex empleados en el entrenamiento) mediante clustering sobre los embeddings.

## Benchmarks y rendimiento

El autor publica resultados en tres tareas de recuperación de MTEB (NFCorpus, SciFact y ArguAna) y un diagnóstico interno de reranking. No hay datos de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de embeddings.

MTEB Retrieval (tareas fuera de dominio):

| Tarea | v1 (500K filas) | v2 (este modelo, 8,95M filas) | AMGIX-69M |
|---|---:|---:|---:|
| NFCorpus | 0,1796 | 0,2280 | 0,2779 |
| SciFact | 0,4692 | 0,5563 | 0,5742 |
| ArguAna | 0,3411 | 0,4216 | 0,4163 |
| Media | 0,3300 | 0,4020 | 0,4228 |

Diagnóstico interno de reranking sobre extractos de web crawl (24 consultas con negativos duros):

| Modelo | top1/24 | top2/24 | top10/24 | top25/24 | MRR |
|---|---:|---:|---:|---:|---:|
| v1 (500K filas) | 18 | 19 | 21 | 23 | 0,796 |
| v2 (este modelo) | 19 | 19 | 20 | 23 | 0,806 |
| AMGIX-69M | 21 | 21 | 22 | 24 | 0,886 |

Lectura de los datos: v2 mejora un ~22 % en media frente a v1 en MTEB y supera a AMGIX en ArguAna, pero sigue por detrás en NFCorpus y SciFact. En el diagnóstico interno, más cercano al dominio original de entrenamiento, la mejora frente a v1 es marginal (subida pequeña de MRR y ligera caída en top10) y la distancia con AMGIX se mantiene amplia. El propio autor señala que el corpus más amplio y diverso que produjo las ganancias en MTEB no se tradujo en mejoras en esa tarea interna concreta.

## Requisitos de hardware

- Huella de pesos aproximada: ~233 MB en fp32, ~116 MB en fp16/bf16, ~58 MB en int8 y ~7 MB en cuantización binaria de 1 bit.
- Inferencia en CPU: viable y es el escenario natural del modelo, ya que no ejecuta atención ni multiplicaciones de matrices densas, solo búsquedas en tabla y sumas.
- GPU: cualquier GPU con más de 1 GB de VRAM puede alojarlo; no se necesita A100, H100 ni RTX 4090 para el modelo en sí.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 y cualquier integrada moderna con memoria compartida suficiente.
- Opciones de despliegue: sentence-transformers (vía de uso documentada por el autor), librerías de embeddings estáticos tipo Model2Vec, exportación a ONNX Runtime y servicios de embeddings como Hugging Face Text Embeddings Inference (TEI).
- No aplica despliegue con vLLM, TGI o llama.cpp en su modo generativo: no es un modelo autoregresivo y no se distribuye en formato GGUF.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible. Cualitativamente, la ausencia de capas de atención sitúa el coste por frase en el orden de microsegundos a milisegundos en CPU, muy por debajo de un codificador transformer de tamaño comparable, pero no hay medición publicada que lo cuantifique.
- Almacenamiento del índice: 384 dimensiones por vector, es decir, 1.536 bytes por frase en fp32 y 768 bytes en fp16; un índice de 10 millones de vectores ocupa aproximadamente 15,4 GB en fp32 y 7,7 GB en fp16, antes de compresión.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión | Media MTEB (NFCorpus/SciFact/ArguAna) | MRR diagnóstico interno | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| cyberntx-384-v2 (este modelo) | 58,24 M | 384 | 0,4020 | 0,806 | MIT | HuggingFace, checkpoint temprano |
| cyberntx v1 | no disponible | 384 (presumiblemente) | 0,3300 | 0,796 | MIT | HuggingFace |
| amgix/static-retrieval-multilingual-69m-v1 | 69 M (según nombre) | no disponible | 0,4228 | 0,886 | no disponible | HuggingFace |
| microsoft/harrier-oss-v1-0.6b (profesor) | 0,6 B (según nombre) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Contexto de la comparativa: AMGIX-69M es un modelo estático de tamaño similar destilado de ibm-granite/granite-embedding-97m-multilingual-r2, y es el competidor directo que el propio autor utiliza como referencia. En las tres tareas MTEB evaluadas, AMGIX supera a cyberntx-384-v2 en NFCorpus y SciFact, y pierde frente a él únicamente en ArguAna (0,4163 frente a 0,4216). En el diagnóstico interno de dominio web crawl, AMGIX mantiene una ventaja clara (MRR 0,886 frente a 0,806). No se dispone de datos de licencia ni de idiomas de AMGIX en la información proporcionada más allá de lo indicado por el nombre del modelo.

## Limitaciones y advertencias

- Estado de entrenamiento: el autor lo etiqueta explícitamente como «early checkpoint, still training». Los pesos pueden cambiar y el rendimiento actual no es necesariamente representativo de una versión final.
- Naturaleza estática: al no haber atención ni codificación posicional, el modelo es esencialmente una bolsa de tokens. Pierde información de orden, de negaciones y de dependencias de largo alcance, lo que degrada la calidad frente a codificadores transformer en consultas con estructura sintáctica relevante.
- Rendimiento inferior a alternativas de tamaño similar: en dos de las tres tareas MTEB publicadas queda por debajo de AMGIX-69M, y en el diagnóstico interno la diferencia de MRR es de 0,080 puntos.
- Sesgo de dominio: los resultados publicados corresponden a un subconjunto de MTEB (NFCorpus, SciFact, ArguAna) y a un diagnóstico interno propio, no a la suite MTEB completa. Las cifras no deben extrapolarse a otras tareas o idiomas.
- Idiomas no declarados: aunque el corpus nombra fuentes en español (CC-NEWS-ES) y multilingües (Wikipedia, OpenAlex, PMC), el autor no publica un listado de idiomas soportados ni evaluaciones por idioma. El uso en idiomas distintos del inglés no está verificado.
- Longitud de contexto no declarada: se desconoce el máximo de tokens procesable por secuencia y si existe truncado. Conviene verificar el `max_seq_length` del tokenizador antes de indexar documentos largos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos de similitud: un umbral mal calibrado puede devolver documentos semánticamente próximos pero factualmente irrelevantes, especialmente en dominios especializados.
- Tracción nula: el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y fue creado el 25 de septiembre de 2026. No hay validación independiente de las cifras publicadas ni proceso de revisión por la comunidad.
- Licencia MIT: permisiva para uso comercial, modificación y redistribución, con la única obligación de conservar el aviso de copyright y de licencia. No se declaran restricciones adicionales de uso aceptable.
- Sin información sobre normalización de los vectores ni sobre la métrica de similitud recomendada más allá de la práctica habitual en sentence-transformers. Conviene verificar experimentalmente si los embeddings salen normalizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jajmangold/cyberntx-384-v2
- Modelo comparable de referencia: https://huggingface.co/amgix/static-retrieval-multilingual-69m-v1
- Modelo profesor citado en la model card: microsoft/harrier-oss-v1-0.6b
- Modelo base del comparador AMGIX: ibm-granite/granite-embedding-97m-multilingual-r2
- Dataset del autor mencionado en la búsqueda web: https://huggingface.co/datasets/jajmangold/cyberntx-job-scripts
- Paper o blog técnico del modelo: no disponible
- Repositorio de código o demo: no disponible

Nota sobre la búsqueda web: los resultados obtenidos (documentación de Gemini Enterprise Agent Platform, páginas de Google DeepMind, un detector de IA de Scribbr y la web corporativa de Google AI) no guardan relación con este modelo y no se han incorporado a la ficha.
