# liudev/novel-embedding-gpl-base-v2

## Resumen

novel-embedding-gpl-base-v2 es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario liudev, especializado en el dominio de la novela web china. Se construye mediante fine-tuning del modelo liudev/novel-embedding-gpl-base-v1 y transforma frases y parrafos en vectores densos de 768 dimensiones normalizados, empleando similitud coseno para tareas de recuperacion semantica, busqueda y agrupacion.

El modelo parte de una arquitectura BERT (BertModel) con pooling sobre el token CLS y normalizacion posterior, lo que lo situa en la categoria de encoders bidireccionales ligeros: 102.267.648 parametros totales (aproximadamente 102 millones). Su ventana de contexto es de 256 tokens, suficiente para frases y parrafos cortos pero no para documentos extensos. Destaca por estar afinado con la perdida MarginMSELoss sobre un conjunto de 435.262 muestras con estructura tripleta (anchor, sentence1, sentence2, label), orientado a la representacion de tramas y eventos narrativos.

Es relevante porque cubre un nicho poco atendido por los embeddings generalistas: la similitud semantica entre resumenes de tramas, eventos y situaciones propias de la ficcion serial china (xianxia, wuxia, romance, etc.). Los ejemplos de la model card muestran pares de eventos narrativos como "obtener una oportunidad de audicion porque otro rechazo el papel" frente a alternativas de trama, lo que indica un entrenamiento centrado en la equivalencia funcional de eventos mas que en la similitud lexica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel) + pooling CLS + normalizacion L2 |
| Parametros totales | 102.267.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un SentenceTransformer compuesto por tres modulos encadenados: un Transformer de tipo BertModel que extrae `last_hidden_state` (token embeddings), un Pooling con modo `cls` y dimension de embedding 768, y una capa Normalize final. La salida es por tanto un vector de 768 dimensiones normalizado, apto para similitud coseno. La longitud maxima de secuencia es de 256 tokens y la modalidad soportada es exclusivamente texto.

El fine-tuning se realizo desde liudev/novel-embedding-gpl-base-v1 con la perdida MarginMSELoss sobre un dataset de 435.262 muestras con columnas `anchor`, `sentence1`, `sentence2` y `label` (valores entre 0,0 y 0,8; media 0,3). Las longitudes tipicas son cortas: el anchor ronda los 16 tokens de media (maximo 24), mientras que sentence1 y sentence2 rondan los 72-73 tokens de media (maximos de 97-102). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO (no aplicables de forma habitual en modelos de embeddings). La perdida MarginMSELoss y los tags `arxiv:1908.10084` (Sentence-BERT) y `arxiv:2010.02666` (MarginMSELoss) confirman el enfoque de entrenamiento contrastivo supervisado.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 768 dimensiones.
- Similitud semantica textual (semantic textual similarity) mediante similitud coseno.
- Busqueda semantica y recuperacion de pasajes (semantic search, passage retrieval).
- Mineria de parafrasis (paraphrase mining).
- Clasificacion de texto y agrupamiento (clustering) a partir de los embeddings.
- Extraccion de caracteristicas (feature extraction) para pipelines posteriores.
- Especializacion en el dominio de tramas y eventos de novela web china, segun los ejemplos de la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; los unicos ejemplos disponibles estan en chino.

## Casos de uso

- Busqueda semantica de tramas en una base de datos de novelas: indexar resumenes de capitulos o eventos como vectores de 768 dimensiones y recuperar los pasajes mas similares a una consulta del lector, aprovechando el ajuste del modelo al vocabulario de ficcion serial.
- Deduplicacion y agrupamiento de resumenes: agrupar eventos narrativos equivalentes (por ejemplo, "obtener una oportunidad por el rechazo de otro") que aparecen redactados de forma distinta en distintas obras, usando clustering sobre los embeddings normalizados.
- Sistemas de recomendacion literaria: calcular la similitud entre la trama de una obra candidata y el perfil de gustos del usuario a partir de los vectores de sus resumenes favoritos.
- Etiquetado y clasificacion de escenas: entrenar un clasificador ligero (regresion logistica o MLP) sobre los embeddings para asignar generos o tropos (xianxia, wuxia, romance, venganza, cultivo) a fragmentos de texto.
- Construccion de datasets de pares de parafrasis para otros modelos: usar el modelo para minar pares de eventos semanticamente equivalentes y ampliar corpus de entrenamiento o evaluacion.
- Moderacion y deteccion de contenido duplicado en plataformas de publicacion: comparar nuevos envios contra un corpus indexado para detectar plagio o republicacion de tramas.
- Recuperacion aumentada (RAG) sobre documentacion narrativa: indexar fichas de personajes, sinopsis y cronologias para responder consultas de lectores o guionistas con recuperacion semantica previa a un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,41 GB solo para pesos (102,3 M de parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 0,20 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (libreria nativa), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` presente), integracion via endpoints compatibles (`endpoints_compatible`), y exportacion a ONNX si se realiza manualmente (no se documenta en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (102 M de parametros) y la secuencia corta (256 tokens) se espera un throughput alto en GPU, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| liudev/novel-embedding-gpl-base-v2 | 102,3 M | 256 tokens | 768 | no disponible | Especializado en tramas de novela web china; fine-tuning con MarginMSELoss |
| BAAI/bge-base-zh-v1.5 | no disponible en la informacion | no disponible | no disponible | no disponible | Embedding generico en chino de referencia; no se dispone de datos comparativos verificados en esta ficha |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible en la informacion | no disponible | no disponible | no disponible | Embedding multilingue generico; no se dispone de datos comparativos verificados en esta ficha |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa fiable con alternativas; la comparativa anterior es meramente cualitativa y de categoria.

## Limitaciones y advertencias

- Ventana de contexto limitada a 256 tokens: los textos mas largos se truncan, lo que puede degradar la representacion de parrafos extensos o documentos completos.
- Especializacion de dominio: el ajuste esta orientado a tramas de novela web china; su rendimiento en otros dominios o idiomas no esta documentado y podria ser inferior al de embeddings generalistas.
- Idiomas soportados no declarados: no hay garantia de comportamiento adecuado fuera del chino.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor; tratar como restriccion potencial para produccion.
- Riesgo de sesgo: al entrenarse sobre un corpus de ficcion serial, puede reproducir sesgos de genero, culturales o de tropos presentes en ese material.
- Riesgo de alucinacion: no aplica en sentido generativo (no produce texto), pero la similitud coseno puede arrojar puntuaciones altas entre eventos superficialmente parecidos y semanticamente distintos.
- Sin datos de evaluacion publicados: no hay benchmarks que respalden el rendimiento frente a alternativas; conviene evaluar en el caso de uso concreto antes de desplegar.
- Modelo con muy poca traccion (160 descargas, 0 likes en el momento de la ficha): menor soporte comunitario y menor probabilidad de correcciones.
- El repositorio ocupa 33,0 GB, muy superior al tamano de los pesos (unos 0,4 GB en fp32), lo que sugiere artefactos de entrenamiento adicionales; conviene revisar el contenido antes de descargarlo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-embedding-gpl-base-v2
- Modelo base: https://huggingface.co/liudev/novel-embedding-gpl-base-v1
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper MarginMSELoss (arXiv:2010.02666): https://arxiv.org/abs/2010.02666
