# Dibachain/Diba-Embed

## Resumen

Diba-Embed es un modelo de embeddings de texto desarrollado por Dibachain (dibachain.ir), presentado como el primer modelo de la familia Diba dedicado a representaciones vectoriales densas. Su rasgo diferencial es que esta optimizado para persa (farsi) como idioma principal, con soporte adicional de ingles y capacidad de coincidencia cruzada entre ambos. Convierte texto en vectores de 1024 dimensiones con similitud coseno, de modo que fragmentos con significado parecido quedan proximos en el espacio vectorial.

El modelo cuenta con 595.776.512 parametros (aproximadamente 0,6B) y declara una longitud de entrada maxima de 32.768 tokens, muy por encima de la media de los modelos de embeddings multilingues habituales. Los pesos en precision completa ocupan unos 1,2 GB y el autor indica que puede ejecutarse en CPU. Se distribuye tanto en safetensors (para sentence-transformers y transformers) como en GGUF cuantizado (Q8_0, Q4_K_M y f16) para su uso con llama.cpp, e incluye un endpoint compatible con la API de embeddings de OpenAI.

Su relevancia actual radica en la escasez de modelos abiertos con buen rendimiento en persa para recuperacion de informacion y RAG. El autor publica una evaluacion propia sobre 400 pares pregunta/respuesta en persa con Recall@1 del 82%, Recall@3 del 95% y MRR de 0,89. La licencia Apache 2.0 y la posibilidad de ejecucion en CPU sin Python (via GGUF) lo hacen apto para despliegues ligeros y para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; el model card indica que usa una definicion de modelo propia de Diba ("Diba model definition") y pooling sobre el ultimo token (last-token pooling) |
| Parametros totales | 595.776.512 (aproximadamente 0,6B) |
| Longitud de contexto | 32.768 tokens (maximo declarado en el model card; los ejemplos de uso truncan a 512 tokens y el ejemplo de llama.cpp configura `-c 2048`) |
| Tipos de cuantizacion | GGUF: Q8_0 (~0,6 GB), Q4_K_M (~0,4 GB), f16 (~1,2 GB) |
| Idiomas soportados | Persa (fa) e ingles (en); etiquetado como multilingue y optimizado para persa + ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Dimension del embedding | 1024, con Matryoshka (truncable hasta 32 dimensiones) |
| Metrica de similitud | Coseno |
| Pooling | Ultimo token no padding |
| Libreria | sentence-transformers |
| Tamano del repositorio | 3,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El model card no detalla la arquitectura interna mas alla de que se apoya en una definicion de modelo propia de Dibachain, que obliga a cargar el modelo con `trust_remote_code=True`. El uso de pooling sobre el ultimo token no padding, junto con el prompt de instruccion para consultas (`Instruct: Given a query, retrieve passages that answer it\nQuery: ...`) y el etiquetado de plantilla conversacional, es coherente con los modelos de embeddings derivados de arquitecturas tipo decoder, aunque la informacion proporcionada no lo confirma explicitamente.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o entrenamiento contrastivo supervisado. El autor si menciona dos caracteristicas tecnicas relevantes: soporte de representaciones Matryoshka, que permite truncar el vector de 1024 dimensiones hasta 32 sin reentrenar, y una evaluacion declarada como "greedy, en CPU, sin entrenamiento especifico de tarea", lo que sugiere que el modelo es un checkpoint final sin adaptacion al benchmark. La informacion sobre el proceso de entrenamiento es, por tanto, "no disponible".

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones para frases, parrafos y documentos, con normalizacion L2 opcional.
- Busqueda semantica en persa: recupera el documento relevante aunque la formulacion de la consulta difiera del texto indexado.
- Recuperacion para RAG: obtener pasajes que sirvan de contexto para un modelo generativo, segun el propio autor, para fundamentar a Diba-Base sobre documentos propios.
- Coincidencia cruzada de idiomas (persa-ingles): una consulta en persa puede recuperar un pasaje en ingles y viceversa.
- Agrupamiento (clustering) y deduplicacion de tickets, comentarios o productos; deteccion de casi duplicados.
- Reranking de pasajes candidatos por relevancia respecto a una consulta.
- Truncamiento Matryoshka de los vectores de 1024 hasta 32 dimensiones para reducir coste de almacenamiento e indexacion.
- Soporte de consultas con prompt de instruccion incorporado (`prompt_name="query"` en sentence-transformers).
- Servidor de embeddings compatible con la API de OpenAI mediante llama.cpp.
- No dispone de capacidad de generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente de representacion vectorial.

## Casos de uso

- RAG en persa sobre documentacion corporativa: indexar los documentos con el modelo y recuperar los pasajes mas relevantes para una consulta en persa antes de pasarselos a un LLM generativo. La ventana declarada de 32.768 tokens permite indexar fragmentos largos sin trocear en exceso.
- Busqueda semantica en comercio electronico irani: generar embeddings de descripciones de producto y de las consultas de los usuarios para devolver resultados por significado y no por coincidencia literal de palabras.
- Recuperacion cruzada persa-ingles para bases de conocimiento bilingues: permite mantener la documentacion tecnica en ingles y atender consultas en persa, o al reves, sin duplicar el corpus.
- Deduplicacion de tickets de soporte: calcular la similitud coseno entre tickets entrantes y el historico para detectar incidencias repetidas y agruparlas antes de asignarlas a un agente.
- Reranking dentro de un pipeline de busqueda en dos fases: usar un recuperador rapido (por ejemplo BM25) para obtener candidatos y reordenarlos con Diba-Embed, aprovechando su rendimiento declarado en las primeras posiciones (Recall@3 del 95%).
- Motor de preguntas frecuentes (FAQ) para atencion al cliente: precalcular los embeddings de las preguntas frecuentes y emparejar cada consulta entrante con la respuesta mas cercana, con ejecucion en CPU si no hay GPU disponible.
- Clasificacion y moderacion de contenido: emplear los embeddings como caracteristicas de entrada para un clasificador ligero de temas o de comentarios.
- Sistemas de recomendacion por similitud: sugerir articulos, videos o productos a partir de la distancia entre sus vectores y los del contenido consumido previamente.

## Benchmarks y rendimiento

El unico benchmark publicado en la informacion disponible es una evaluacion de recuperacion en persa sobre 400 pares pregunta/respuesta extraidos de datos propios de Diba (historia de Iran, temas de actualidad y preguntas y respuestas de la empresa Dibachain). La tarea consiste en recuperar el pasaje correcto dentro del conjunto completo de candidatos, con decodificacion greedy, en CPU y sin entrenamiento especifico de tarea.

| Metrica | Resultado |
|---|---|
| Recall@1 | 82% |
| Recall@3 | 95% |
| MRR | 0,89 |

No se han publicado resultados en otros benchmarks habituales (MMLU, HumanEval, GSM8K, MTEB u otros) en la informacion disponible, ni comparaciones directas con otros modelos de embeddings bajo las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (f16/bf16): en torno a 1,2-2 GB contando pesos, activaciones y overhead del runtime.
- VRAM estimada con GGUF Q8_0: alrededor de 0,6-1 GB.
- VRAM estimada con GGUF Q4_K_M: alrededor de 0,4-0,8 GB.
- Ejecucion en CPU: soportada de forma explicita por el autor; los pesos completos ocupan unos 1,2 GB y los GGUF bajan hasta ~0,4 GB, por lo que cabe en cualquier equipo de escritorio con unos pocos GB de RAM.
- GPU consumer: si, practicamente cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.). No requiere GPU de datacenter.
- GPU de datacenter (A100, H100, L40S): no son necesarias para inferencia; solo tendrian sentido para indexar corpus muy grandes con batching masivo y maximizar el throughput.
- Opciones de despliegue: sentence-transformers, transformers (con `trust_remote_code=True`), llama.cpp mediante `llama-server --embedding --pooling last`, y servicio HTTP compatible con la API `/v1/embeddings` de OpenAI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se limita a especificaciones publicas de los model cards de cada alternativa. No hay resultados de benchmarks comparables entre ellos en la informacion disponible, por lo que la columna de rendimiento se deja como "no disponible".

| Modelo | Parametros | Contexto | Dimension del embedding | Idiomas destacados | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Diba-Embed | ~0,6B | 32.768 tokens (declarado) | 1024 (Matryoshka hasta 32) | Persa e ingles | Apache 2.0 | Recall@1 82%, Recall@3 95%, MRR 0,89 (evaluacion propia en persa) |
| BGE-M3 | ~0,57B | 8192 tokens | 1024 | Multilingue (mas de 100 idiomas) | MIT | No disponible en la informacion proporcionada |
| multilingual-e5-large | ~0,56B | 512 tokens | 1024 | Multilingue | MIT | No disponible en la informacion proporcionada |
| paraphrase-multilingual-mpnet-base-v2 | ~0,28B | 128 tokens | 768 | Multilingue (50+ idiomas) | Apache 2.0 | No disponible en la informacion proporcionada |

Las cifras de los modelos alternativos proceden de sus fichas publicas y deben verificarse antes de tomar decisiones de produccion. Los datos de BGE-M3 y multilingual-e5-large son los mas cercanos en tamano; ninguno de ellos declara una ventana de contexto tan amplia como Diba-Embed, pero si una cobertura idiomatica mucho mas amplia.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso. No debe evaluarse como un LLM.
- Riesgo de recuperacion incorrecta: al no generar texto, no hay "alucinacion" en sentido estricto, pero una recuperacion erronea puede propagar contexto irrelevante a un pipeline RAG posterior.
- Sesgos: el model card indica que el modelo refleja sesgos presentes en los datos (la frase queda truncada en la informacion disponible, por lo que no se detalla el alcance). Cabe esperar un sesgo hacia el persa formal y hacia los dominios de los datos propios de Dibachain.
- Cobertura idiomatica limitada: aunque se etiqueta como multilingue, la optimizacion declarada es para persa e ingles; el rendimiento en otros idiomas no esta documentado.
- Ambito de dominio: el autor advierte que la calidad es mas fuerte en persa general y formal, y que el texto muy especializado o ruidoso puede requerir adaptacion de dominio.
- Discrepancia en la longitud de contexto: se declaran 32.768 tokens, pero los ejemplos oficiales truncan a 512 tokens y el ejemplo de llama.cpp usa `-c 2048`. Conviene validar el comportamiento real en entradas largas antes de confiar en la ventana maxima.
- Ejecucion de codigo remoto: es obligatorio usar `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio del autor. Debe auditarse antes de desplegarlo en entornos de produccion.
- Requisito de instruccion en consultas: omitir el prompt `query` degrada la calidad de recuperacion, ya que los documentos se codifican sin el.
- Madurez y validacion comunitaria: el modelo registra 0 descargas y 0 likes, y la evaluacion publicada es interna (400 pares de datos propios). No hay verificacion externa independiente.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se documenten los cambios.
- Fecha de publicacion: el repositorio figura creado el 15 de septiembre de 2026 y actualizado dos minutos despues, lo que sugiere que no ha habido iteraciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/Diba-Embed
- GGUF Q8_0: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/Diba-Embed-Q8_0.gguf
- GGUF Q4_K_M: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/Diba-Embed-Q4_K_M.gguf
- GGUF f16: https://huggingface.co/Dibachain/Diba-Embed/resolve/main/Diba-Embed-f16.gguf
- Sitio web de Dibachain: https://dibachain.ir
- Demo de chat (GPU): https://huggingface.co/spaces/DibaAi/diba-chat-gpu
- Demo de chat (CPU): https://huggingface.co/spaces/DibaAi/diba-chat
- Modelo Diba-Base: https://huggingface.co/DibaAi/Diba-Base
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
