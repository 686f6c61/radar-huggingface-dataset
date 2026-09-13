# albertobarnabo/bge-m3-italian

## Resumen

bge-m3-italian es un modelo de recuperación de información (retrieval) en italiano obtenido por fine-tuning de BAAI/bge-m3, publicado por Alberto Barnabo bajo licencia MIT. No es un modelo generativo: es un encoder de embeddings que produce representaciones densas de 1024 dimensiones, representaciones dispersas (sparse, tipo lexical matching) y representaciones multi-vector estilo ColBERT, todo ello en un único checkpoint. Su interés práctico es que funciona como reemplazo directo de bge-m3 sin cambiar código: misma dimensionalidad, mismo contexto de 8192 tokens y las tres cabezas entrenadas y distribuidas.

El modelo resuelve un problema concreto: bge-m3 es multilingüe pero no está optimizado para italiano, y los fine-tunes de idioma que existen suelen publicar únicamente la cabeza densa, perdiendo la capacidad sparse que en documentos largos italianos rinde claramente mejor (0,78 frente a 0,61 en nDCG@10 según el autor). Este fine-tune conserva y reentrena las tres cabezas con 351.796 grupos de consulta italianos derivados de mMARCO-it.

Técnicamente se apoya en la arquitectura XLM-RoBERTa con 567.754.752 parámetros (~568 M) y se distribuye en formato safetensors para sentence-transformers y FlagEmbedding. La relevancia actual está en el nicho RAG en italiano: en modo híbrido (denso + sparse) supera al modelo base tanto en pasajes cortos (+0,031 nDCG@10) como en documentos largos (+0,055), con intervalos de confianza bootstrap que excluyen el cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa, con tres cabezas: densa (dense), dispersa (sparse/lexical) y multi-vector (ColBERT) |
| Parametros totales | 567.754.752 (~568 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; soporta fp16 (`use_fp16=True` en FlagEmbedding) y cuantizacion int8 mediante text-embeddings-inference o sentence-transformers. No hay GGUF publicado |
| Idiomas soportados | Italiano (etiqueta `it`). El modelo base bge-m3 es multilingue, pero el fine-tuning esta orientado especificamente a italiano |
| Licencia | MIT (pesos). Los datos de entrenamiento derivan de MS MARCO, cuyos terminos originales son de uso no comercial para investigacion |
| Formato de pesos | safetensors (compatible con sentence-transformers, FlagEmbedding y text-embeddings-inference) |
| Dimension del embedding | 1024 |
| Tarea (pipeline) | feature-extraction / sentence-similarity / retrieval |
| Tamaño del repositorio | 4,6 GB |
| Descargas / likes | 14 descargas, 0 likes (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-13 |
| Versiones | v1.1 (actual, con pase de contexto largo) y v1.0 (`revision="v1.0"`, solo entrenamiento a 512 tokens) |

## Arquitectura y entrenamiento

La base es XLM-RoBERTa, el mismo encoder que emplea BAAI/bge-m3, con 568 M de parametros. Sobre ella se entrenan simultaneamente tres cabezas: una densa de 1024 dimensiones para similitud semantica, una dispersa que produce pesos lexicos por token (util para coincidencia de terminos exactos) y una multi-vector estilo ColBERT que genera un embedding por token. La combinacion densa + sparse es el modo recomendado por el autor, con una formula de puntuacion `score = similitud_densa + 0.3 * puntuacion_lexica`.

El entrenamiento usa el esquema *unified fine-tuning* de FlagEmbedding con auto-destilacion: las tres cabezas se optimizan conjuntamente. Los datos son 351.796 grupos de consulta en italiano construidos a partir de mMARCO-it, cada uno con 1 positivo y 8 negativos duros, enriquecidos con margenes de un cross-encoder profesor en ingles unidos por identificador de MS MARCO. Aproximadamente el 9,5% de los pasajes se descarto por dano de codificacion (mojibake) en la traduccion de origen. La configuracion fue 1 epoca, 5.496 pasos, learning rate 1e-5, pasajes de 512 tokens, una unica GPU de 48 GB y unas 6 horas de computo.

El entrenamiento a 512 tokens degradaba la capacidad sobre documentos largos, por lo que se anadio un segundo pase corto de contexto largo: 30.000 grupos con documentos sinteticos de 2048 tokens mezclados con pasajes cortos y learning rate 5e-6. Ese pase es el responsable de las ganancias en documentos largos que reporta la tabla de resultados.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para busqueda semantica en italiano.
- Recuperacion dispersa (sparse) con pesos lexicos por token, apta para coincidencia de terminos exactos y busqueda hibrida.
- Representaciones multi-vector estilo ColBERT para reranking tardio (late interaction) a nivel de token.
- Busqueda hibrida densa + dispersa con una unica pasada de codificacion, sin necesidad de mantener dos indices separados.
- Indexacion de documentos largos de hasta 8192 tokens, lo que permite indexar pasajes extensos sin trocear agresivamente.
- Sustitucion directa de BAAI/bge-m3: mantiene dimensionalidad (1024), contexto (8192) y las tres salidas, por lo que no requiere cambios en el pipeline existente.
- Integracion con sentence-transformers, FlagEmbedding (BGEM3FlagModel) y text-embeddings-inference (etiquetado como `endpoints_compatible`).
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es exclusivamente un modelo de representacion y recuperacion.

## Casos de uso

- RAG sobre documentacion corporativa en italiano: el modelo indexa el corpus en modo hibrido y el sistema recupera los pasajes mas relevantes antes de pasarlos a un LLM generativo. La ventana de 8192 tokens permite indexar secciones completas sin fragmentar en exceso.
- Busqueda semantica interna (intranet, base de conocimiento, manuales): sustitucion directa de bge-m3 cambiando solo el identificador del modelo, con ganancia medida de +0,031 nDCG@10 en pasajes cortos.
- Recuperacion sobre documentos largos (normativa, expedientes, informes tecnicos): en modo hibrido obtiene 0,748 nDCG@10 frente a 0,693 del base, lo que se traduce en menos fallos cuando la respuesta esta dispersa en textos extensos.
- Atencion al cliente con FAQ y base de articulos: el autor reporta que la respuesta correcta queda en primera posicion en el 66% de las preguntas (frente al 62,5% del base) y que la tasa de preguntas sin respuesta en el top 10 baja del 11,4% al 8,6%.
- Pipeline de recuperacion en dos etapas: primera fase con bge-m3-italian y segunda fase con BAAI/bge-reranker-v2-m3, que eleva el nDCG@10 de 0,796 a 0,821 sobre 2.000 consultas.
- Deduplicacion y clustering de textos italianos: los embeddings densos permiten agrupar documentos similares (noticias, tickets, opiniones) por similitud coseno.
- Filtrado de candidatos en plataformas de e-commerce o marketplace italianas: combinacion de coincidencia lexica (marca, modelo, codigo) con similitud semantica en una sola codificacion.
- Deteccion de duplicados y near-duplicates en corpus legales o administrativos italianos, apoyandose en la cabeza multi-vector para comparaciones finas.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con codigo identico para ambos modelos y bootstrap emparejado de 10.000 muestras. Metrica: nDCG@10 en recuperacion en italiano.

| Tarea | BAAI/bge-m3 | v1.0 | v1.1 | v1.1 vs base |
|---|---|---|---|---|
| Pasajes cortos, denso | 0,751 | 0,777 | 0,777 | +0,027 (IC [0,021; 0,032]) |
| Pasajes cortos, hibrido | 0,752 | 0,787 | 0,783 | +0,031 (IC [0,026; 0,037]) |
| Documentos largos, sparse | 0,740 | 0,736 | 0,781 | +0,041 (IC [0,005; 0,080]) |
| Documentos largos, hibrido | 0,693 | 0,692 | 0,748 | +0,055 (IC [0,025; 0,087]) |
| Documentos largos, denso | 0,627 | 0,595 | 0,609 | −0,019 (no significativo) |
| Pasajes cortos, sparse | 0,474 | 0,482 | 0,450 | −0,023 (significativo, ver limitaciones) |

Conjuntos de evaluacion: mMARCO-it dev (6.304 consultas sobre 206.000 pasajes) para pasajes cortos, y MLDR-it test (200 consultas sobre 10.000 documentos de 8192 tokens) para documentos largos.

| Pipeline sobre 2.000 consultas | nDCG@10 |
|---|---|
| bge-m3-italian en solitario | 0,796 |
| bge-m3-italian + BAAI/bge-reranker-v2-m3 | 0,821 |

## Requisitos de hardware

- Inferencia en fp16: aproximadamente 1,1 GB de pesos, mas overhead de activaciones. En fp32, unos 2,3 GB.
- Cuantizacion int8: alrededor de 0,6 GB de pesos.
- Cabe sin problemas en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp16 e incluso procesar lotes grandes.
- Tambien es viable en CPU para cargas moderadas, aunque con menor throughput en indexacion masiva.
- GPU recomendadas para servicio en produccion: NVIDIA L4, A10G o A100/H100 si se indexan millones de documentos. Para indexacion a gran escala conviene una GPU con memoria amplia para aumentar el tamaño de lote.
- Entrenamiento: el fine-tuning principal se realizo en una unica GPU de 48 GB (por ejemplo A6000 o A40) durante unas 6 horas.
- Opciones de despliegue: sentence-transformers, FlagEmbedding (BGEM3FlagModel), text-embeddings-inference (el repositorio esta etiquetado como `endpoints_compatible` y `text-embeddings-inference`) y Hugging Face Inference Endpoints. No hay soporte GGUF/Ollama publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de almacenamiento: el repositorio ocupa 4,6 GB, un tamaño superior al de los pesos puros, presumiblemente por incluir los ficheros de las distintas cabezas y artefactos asociados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| bge-m3-italian (este modelo) | 568 M | 8192 | Italiano | MIT (datos de entrenamiento derivados de MS MARCO) | Fine-tune de recuperacion en italiano con las tres cabezas entrenadas |
| BAAI/bge-m3 (modelo base) | 568 M | 8192 | Multilingue (mas de 100 idiomas) | MIT | Referencia directa; peor en hibrido sobre italiano segun la tabla del autor |
| BAAI/bge-reranker-v2-m3 | No disponible en la informacion proporcionada | No disponible | Multilingue | No disponible | No es un competidor sino un complemento: como segunda etapa eleva el nDCG@10 de 0,796 a 0,821 |
| Otras alternativas multilingues (multilingual-e5, jina-embeddings-v3, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No se aportan datos comparativos en la documentacion consultada |

La comparacion relevante y verificable es contra BAAI/bge-m3: mismo tamaño, mismo contexto y misma licencia, con ganancia en modo hibrido tanto en pasajes cortos como en documentos largos, y perdida en modo sparse puro sobre pasajes cortos.

## Limitaciones y advertencias

- La recuperacion exclusivamente sparse sobre pasajes cortos empeora respecto al base de forma estadisticamente significativa (0,450 frente a 0,474). Para pasajes cortos debe usarse modo hibrido o denso.
- La recuperacion exclusivamente densa sobre documentos largos queda 0,019 por debajo del base, aunque el autor indica que la diferencia no es significativa tras el pase de contexto largo.
- Las ganancias en pasajes cortos se midieron sobre la misma distribucion de entrenamiento (MS MARCO traducido). En textos italianos muy distintos (jerga tecnica, dialectos, dominios especializados) cabe esperar ganancias menores.
- Los datos de entrenamiento derivan de MS MARCO, cuyos terminos originales son de investigacion no comercial. Aunque los pesos se publican bajo licencia MIT, conviene revisar la procedencia de los datos si el uso es comercial.
- Aproximadamente el 9,5% de los pasajes de mMARCO-it se descarto por dano de codificacion en la traduccion de origen, lo que reduce ligeramente la cobertura de vocabulario del entrenamiento.
- El modelo esta orientado a italiano: aunque herede capacidad multilingue del base, no hay evaluacion publicada de su rendimiento en otros idiomas y no debe asumirse que mantenga la calidad de bge-m3 fuera del italiano.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si puede devolver pasajes poco relevantes con puntuaciones altas en dominios alejados de la distribucion de entrenamiento. Se recomienda validar con un reranker.
- No se publican datos de sesgo, latencia, throughput ni comportamiento con entradas adversarias.
- Ausencia de cuantizaciones oficiales y de formato GGUF, lo que limita su despliegue en entornos de CPU con llama.cpp u Ollama (habria que convertir los pesos).
- Las metricas de referencia son las declaradas por el propio autor del modelo; no se han encontrado evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albertobarnabo/bge-m3-italian
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Reranker recomendado: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset de entrenamiento (mMARCO): https://huggingface.co/datasets/unicamp-dl/mmarco
- Dataset de evaluacion en documentos largos (MLDR): https://huggingface.co/datasets/Shitao/MLDR
- Resultados de busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (unicamente paginas de financiacion de vehiculos sin relacion con el tema), por lo que no se aportan enlaces adicionales de prensa, papers o demos.
