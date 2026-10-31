# mradermacher/KURE-v3-i1-GGUF

## Resumen

KURE-v3-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo de embeddings nlpai-lab/KURE-v3, preparada por el cuantizador comunitario mradermacher. El modelo base, desarrollado por NLP AI Lab (nlpai-lab), es un modelo de tipo sentence-transformer orientado a la extracción de características y a la similitud semántica de frases, con soporte de coreano e inglés y capacidad de embeddings matryoshka, lo que permite truncar el vector de salida a distintas dimensiones según las necesidades de almacenamiento o latencia.

La relevancia de esta cuantización radica en que hace accesible el modelo en hardware modesto: con unos 1.140 millones de parámetros en precisión original, las versiones cuantizadas con imatrix (matriz de importancia) ocupan desde 0,5 GB (IQ1_S) hasta 1,0 GB (Q6_K), de modo que puede ejecutarse incluso en portátiles sin GPU dedicada. Esto lo hace práctico para construir sistemas de búsqueda semántica, RAG y clustering en local con bajo consumo de recursos.

Cabe destacar que se trata de un modelo de embeddings (pipeline de feature-extraction), no de un modelo generativo: su función es convertir texto en vectores densos, no generar texto ni mantener conversaciones. La licencia es Apache 2.0, tanto del modelo base como de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense (sentence-transformer, no disponible el detalle exacto del backbone) |
| Parametros totales | 1.140.918.272 (aprox. 1,14 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base KURE-v3 es un modelo de embeddings denso (dense) de la familia sentence-transformers, con aproximadamente 1.140 millones de parametros. El tag "matryoshka" indica que emplea Matryoshka Representation Learning, una tecnica que entrena el modelo para que las primeras dimensiones del embedding ya contengan la informacion mas relevante, permitiendo truncar el vector (por ejemplo, usar 256 dimensiones de 1024) sin perder calidad significativa. Esto es muy util para reducir el tamano de indices vectoriales y acelerar busquedas aproximadas.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y el procedimiento de entrenamiento del modelo base no estan disponibles en la informacion proporcionada. En cuanto a esta cuantizacion, mradermacher utiliza cuantizacion con matriz de importancia (imatrix), que calibra los niveles de precision por tensor segun la distribucion real de activaciones, obteniendo mejor calidad que las cuantizaciones estaticas a igualdad de tamano; tambien se publican cuants estaticos en un repositorio hermano.

## Capacidades

- Generacion de embeddings densos para texto en coreano e ingles (feature extraction).
- Similitud semantica entre frases y documentos (sentence-similarity).
- Embeddings matryoshka: dimensiones de salida truncables para ajustar tamano de indice y velocidad de busqueda.
- Compatible con el ecosistema sentence-transformers y con librerias de inferencia GGUF (llama.cpp).
- Disponible en un amplio rango de niveles de cuantizacion (de IQ1_S a Q6_K) para ajustar calidad frente a recursos.
- No soporta: generacion de texto, razonamiento conversacional, tool calling, agentes, vision ni audio (es un modelo de embeddings).

## Casos de uso

- Busqueda semantica bilingue coreano-ingles: permite indexar documentos en ambos idiomas y recuperar resultados relevantes mediante similitud coseno, ideal para corpus mixtos.
- Sistemas RAG en local: sus embeddings sirven como retriever en pipelines de generacion aumentada, y su tamano cuantizado (0,8 GB en Q4_K_M) permite ejecutar el indice completo en un portatil.
- Clustering y organizacion de documentos: agrupar automaticamente grandes volumenes de texto (tickets, articulos, correos) por tematica usando k-means o HDBSCAN sobre los vectores.
- Deteccion de duplicados y near-dedup: comparar embeddings de documentos para identificar contenido repetido en corpus de limpieza de datos.
- Clasificacion zero-shot o few-shot: etiquetar textos en categorias mediante similitud con descripciones de clase, sin entrenar un clasificador.
- Recomendacion de contenido: calcular vecinos mas cercanos para recomendar articulos, productos o preguntas similares en sistemas con recursos limitados.
- Reduccion de costes de indexacion: gracias a los embeddings matryoshka, se pueden almacenar versiones truncadas de los vectores en bases vectoriales como Qdrant, FAISS o Milvus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion tampoco incluye metricas de degradacion por nivel de cuantizacion (solo enlaza a un grafico general comparativo de tipos de quant de baja calidad).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,5 GB con IQ1_S/IQ1_M hasta ~1,0 GB con Q6_K; la cuantizacion recomendada Q4_K_M ocupa ~0,8 GB. Cabe comodamente en CPU y en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB de VRAM o mas es suficiente si se desea acelerar (RTX 3060, RTX 4060, RTX 4090, etc.).
- Consumer GPUs: funciona sin problemas en practicamente cualquier GPU de consumo e incluso solo con CPU, dado el reducido tamano de los ficheros.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio; para el modelo base en precision original, sentence-transformers y vLLM con soporte de embeddings.
- Latencia y throughput: no disponible; al ser un modelo de ~1,1 B parametros cuantizado por debajo de 1 GB, los tiempos de inferencia por texto son del orden de milisegundos en hardware moderno (estimacion, no dato publicado).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Embeddings matryoshka | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| KURE-v3 (esta cuantizacion) | ~1,14 B | ko, en | Si | Apache 2.0 | Si (imatrix, 23 niveles) |
| BGE-M3 (BAAI) | ~0,57 B | Multilingue (100+ idiomas) | No disponible en la informacion | MIT | Si |
| multilingual-e5-large (intfloat) | ~0,56 B | Multilingue | No disponible en la informacion | MIT | Si |
| GTE-multilingual (Alibaba) | no disponible | Multilingue | Si | Apache 2.0 | Si |

KURE-v3 se diferencia por su foco bilingue coreano-ingles con especializacion en coreano, frente a los modelos multilingues genericos, lo que suele traducirse en mejor calidad de recuperacion en coreano. No se dispone de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano e ingles; el rendimiento en otros idiomas, incluido el castellano, no esta garantizado ni documentado.
- Es un modelo de embeddings, no generativo: no sirve para chat, resumen ni generacion de codigo.
- Las cuantizaciones mas agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad de los embeddings; se recomienda Q4_K_M o superior para produccion.
- No hay benchmarks publicados (MTEB u otros) en la informacion disponible, por lo que la calidad relativa frente a otros embedders debe validarse empiricamente en el caso de uso concreto.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, aunque una mala calidad de recuperacion en RAG puede inducir alucinaciones en el modelo generativo posterior.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- La cuantizacion es un trabajo comunitario (mradermacher), sin soporte oficial de nlpai-lab; para maxima fidelidad conviene usar el modelo base en safetensors.

## Enlaces

- Cuantizacion GGUF (imatrix): https://huggingface.co/mradermacher/KURE-v3-i1-GGUF
- Cuantizacion GGUF estatica: https://huggingface.co/mradermacher/KURE-v3-GGUF
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v3
- Pagina de descargas resumida: https://hf.tst.eu/model#KURE-v3-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo base: no disponible
