# Hcompany/NeoMME-800M-Retriever

## Resumen

NeoMME-800M-Retriever es un modelo de recuperación de documentos multimodales desarrollado por Hcompany y ajustado a partir del encoder fundacional NeoMME-800M. Su función es codificar consultas de texto y documentos (ya sean en texto plano o capturas de página) dentro de un mismo espacio vectorial, empleando un único Transformer encoder bidireccional compartido entre ambas modalidades. Es, por tanto, un modelo de codificación y ranking, no un modelo generativo: no produce respuestas, produce representaciones para búsqueda.

El modelo tiene 793.944.408 parámetros (aproximadamente 800 M), un vocabulario de 131.072 tokens y una longitud de contexto de 16.384 tokens. Una sola pasada forward devuelve simultáneamente embeddings multi-vector (128 dimensiones por token de texto o parche de imagen, puntuados con MeanMaxSim) y embeddings densos de 1.792 dimensiones con truncamiento Matryoshka a 128, 256, 512 y 1.024. Esto permite elegir entre recuperación de alta precisión (late interaction) y recuperación rápida mediante similitud coseno sobre un índice denso.

Su relevancia actual radica en la combinación de tres factores: soporte multilingüe declarado, capacidad de trabajar directamente sobre píxeles de página sin necesidad de OCR y un tamaño lo bastante contenido (1,6 GB de pesos) como para desplegarse en una única GPU de gama consumer. El modelo se publica bajo licencia Apache 2.0 y con formato safetensors, lo que facilita su integración en pipelines de RAG y en sistemas de búsqueda documental en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional único (single-tower), multimodal-nativo |
| Parametros totales | 793.944.408 (aproximadamente 800 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (lista de idiomas concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,6 GB |
| Vocabulario | 131.072 tokens |
| Hidden size | 1.792 |
| Parches de imagen | 32 x 32 pixeles, hasta 2.048 pixeles en el lado mas largo (por defecto) |
| Embeddings multi-vector | 128 dimensiones por token de texto o parche de imagen |
| Embeddings densos | 1.792 dimensiones, Matryoshka: 128, 256, 512, 1.024, 1.792 |
| Estrategia de pooling denso | media (mean) |
| Puntuacion | MeanMaxSim (multi-vector), similitud coseno (denso) |
| Modelo base | Hcompany/NeoMME-800M |
| Libreria | transformers |
| Tarea (pipeline) | visual-document-retrieval |
| Variantes publicadas | default (transformers), ST dense, ST late-interaction |

## Arquitectura y entrenamiento

NeoMME-800M-Retriever sigue un diseno de torre unica: un solo encoder Transformer bidireccional procesa tanto la consulta textual como el documento, que puede ser texto o una captura de pagina. No se emplean torres separadas ni proyecciones independientes por modalidad. La imagen se divide en parches de 32 x 32 pixeles con un limite por defecto de 2.048 pixeles en el lado mas largo, de modo que cada parche se trata como una unidad equivalente a un token de texto. La pasada forward genera, de forma simultanea, la representacion multi-vector (128 dimensiones por token o parche) y la representacion densa (1.792 dimensiones, con pooling por media y truncamiento Matryoshka), lo que evita tener que ejecutar el modelo dos veces para obtener ambos tipos de indice.

La puntuacion multi-vector se realiza con MeanMaxSim, mientras que la recuperacion densa usa similitud coseno. Para el modo multi-vector, la libreria sentence-transformers debe ser la version 6.0.0 o superior. El ajuste se realizo a partir de NeoMME-800M, el encoder fundacional de la misma familia, y la model card ofrece tres variantes: la predeterminada para transformers (devuelve ambas representaciones en una sola pasada), una orientada a fine-tuning denso independiente con Sentence Transformers y otra para fine-tuning multi-vector independiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas adicionales como decodificacion especulativa o atencion lineal. Todos estos datos figuran como no disponibles en la informacion proporcionada. Tampoco se detalla la composicion del corpus multilingue empleado en el ajuste.

## Capacidades

- Codificacion conjunta de consultas de texto y documentos (texto plano o capturas de pagina) en un espacio vectorial compartido mediante un unico encoder bidireccional.
- Generacion simultanea de embeddings multi-vector y densos en una sola pasada forward, sin necesidad de ejecutar el modelo dos veces.
- Recuperacion de documentos visuales (documentos escaneados, paginas maquetadas, graficos, tablas) sin necesidad de OCR previo, ya que opera directamente sobre pixeles.
- Recuperacion de texto puro, evaluada en el benchmark BEIR-15.
- Capacidad multilingue declarada, con ejemplos de uso que combinan consultas en frances contra documentos en otros idiomas, lo que sugiere funcionamiento cross-lingue.
- Embeddings densos con truncamiento Matryoshka (128, 256, 512, 1.024, 1.792 dimensiones), lo que permite ajustar el equilibrio entre precision y coste de almacenamiento del indice.
- Soporte de fine-tuning con Sentence Transformers tanto en modo denso como en modo late interaction, a traves de las variantes ST dense y ST late.
- No es un modelo generativo: no produce texto, no dispone de modo thinking ni de capacidades de vision generativa mas alla del codificado de imagenes de documento.
- No soporta tool calling ni function calling de forma nativa, ya que no es un modelo de lenguaje generativo. Puede, no obstante, exponerse como herramienta de recuperacion dentro de un agente externo.
- No se documentan capacidades de audio, video ni razonamiento multi-paso.

## Casos de uso

- RAG multimodal sobre documentacion corporativa: el modelo indexa capturas de pagina de informes, contratos o manuales junto con consultas textuales, evitando el coste y los errores de un pipeline de OCR. Su ventana de 16.384 tokens permite procesar paginas densas en una sola pasada.
- Busqueda en PDF escaneados sin capa de texto: al operar sobre parches de imagen de 32 x 32 pixeles, mantiene la senal visual de tablas, grafos y diagramas que se perderia en una extraccion de texto tradicional.
- Recuperacion cross-lingue en entornos multinacionales: una consulta en castellano puede recuperar paginas en ingles, frances o aleman dentro del mismo indice, gracias al soporte multilingue declarado del modelo.
- Deduplicacion y agrupacion de documentos a gran escala: los embeddings densos con truncamiento Matryoshka a 128 o 256 dimensiones permiten construir indices ANN de bajo coste para agrupar documentos similares antes de aplicar un ranking mas fino.
- Busqueda en catalogos tecnicos y planos: el modelo puede indexar planos, esquemas y fichas tecnicas como imagenes, lo que resulta util en sectores industrial y de ingenieria donde el documento fuente no es texto plano.
- Recuperacion previa en agentes conversacionales: integrado como herramienta de busqueda, el modelo alimenta con fragmentos relevantes a un LLM generativo que si redacta la respuesta final. El encoder actua como capa de recuperacion y el LLM como capa de generacion.
- Filtrado de candidatos en pipelines de compliance y legal: la puntuacion multi-vector con MeanMaxSim ofrece alta precision para seleccionar que documentos pasan a revision humana, reduciendo el volumen de material a examinar.
- Creacion de un modelo propio de recuperacion: las variantes ST dense y ST late permiten ajustar el encoder sobre un dominio concreto (por ejemplo, documentacion medica o financiera) manteniendo la base de 800 M parametros.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan las variantes NeoMME-260M y NeoMME-800M en configuracion late interaction y densa. Las puntuaciones corresponden a las dimensiones completas de entrenamiento y el valor mas alto es mejor.

| Benchmark | Metrica | NeoMME-260M (late) | NeoMME-260M (denso) | NeoMME-800M (late) | NeoMME-800M (denso) |
|---|---|---|---|---|---|
| ViDoRe v3 | nDCG@10 | 0,5226 | 0,3907 | 0,5560 | 0,4391 |
| ViDoRe v2 | nDCG@5 | 0,5218 | 0,4075 | 0,5591 | 0,4475 |
| ViDoRe v1 | nDCG@5 | 0,8598 | 0,7552 | 0,8744 | 0,7993 |
| BEIR-15 | nDCG@10 | 0,4881 | 0,3055 | 0,5126 | 0,3686 |

ViDoRe v1, v2 y v3 miden recuperacion de documentos visuales, mientras que BEIR-15 mide recuperacion de texto. En los cuatro casos, la variante de 800 M supera a la de 260 M, y la configuracion late interaction supera a la densa. La diferencia mas acusada entre late interaction y denso se observa en BEIR-15 (0,5126 frente a 0,3686), lo que indica que la representacion densa pierde bastante mas rendimiento en recuperacion textual que en recuperacion visual.

No se han publicado en la informacion disponible resultados de otros benchmarks habituales como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de recuperacion sin capacidad generativa.

## Requisitos de hardware

- El repositorio de pesos ocupa 1,6 GB, lo que corresponde a un modelo de 793,9 M parametros almacenado en precision de 16 bits (bf16 o fp16). Cargado en fp32 ocuparia aproximadamente 3,2 GB solo en pesos; los tipos de cuantizacion soportados no estan documentados.
- Estimacion de VRAM para inferencia: en torno a 2 a 4 GB en bf16/fp16 para lotes pequenos, contando pesos, activaciones y el procesamiento de parches de imagen. La cifra exacta depende del numero de paginas por lote y de la resolucion de las imagenes, ya que el modelo admite documentos de hasta 2.048 pixeles en el lado mas largo.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. Incluso GPU de 8 GB deberian ser suficientes para inferencia con lotes pequenos en bf16.
- En el segmento profesional, es viable en A100, H100, L40S y similares, aunque su tamano hace que estas GPU esten muy sobredimensionadas para una sola instancia del modelo y resulten mas utiles para indexar grandes volumenes en paralelo.
- Opciones de despliegue: la model card recomienda el uso directo con transformers (`NeoMMEForRetrieval` y `NeoMMEProcessor`), con `accelerate` como dependencia opcional si se usa `device_map="auto"`. Para la puntuacion con MeanMaxSim se requiere `sentence-transformers>=6.0.0`.
- No se documenta soporte especifico para vLLM, Ollama, TGI, llama.cpp ni otras plataformas de servicio de modelos. Dado que es un encoder de recuperacion y no un modelo generativo, estas herramientas no son el entorno natural de despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La tabla siguiente compara las dos variantes de la familia NeoMME para las que se publican datos. En cuanto a alternativas externas, ColPali y las variantes ColQwen son las familias de referencia en recuperacion de documentos visuales por late interaction, pero no se han proporcionado en la informacion disponible sus parametros, contexto, licencia ni resultados de benchmark, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | ViDoRe v1 (nDCG@5, late) | BEIR-15 (nDCG@10, late) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeoMME-800M-Retriever | 793,9 M | 16.384 tokens | 0,8744 | 0,5126 | Apache 2.0 | HuggingFace (Hcompany) |
| NeoMME-260M | no disponible (aprox. 260 M por nomenclatura) | no disponible | 0,8598 | 0,4881 | no disponible | HuggingFace (Hcompany) |
| ColPali / ColQwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia entre NeoMME-800M y NeoMME-260M es moderada pero consistente: 0,0146 puntos de nDCG@5 en ViDoRe v1 y 0,0245 en BEIR-15 en configuracion late interaction, a cambio de triplicar aproximadamente el numero de parametros.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni redacta texto. Cualquier caso de uso que requiera una respuesta en lenguaje natural necesita un LLM adicional que consuma los documentos recuperados.
- Riesgo de recuperacion irrelevante: como todo sistema de ranking, puede devolver documentos con alta similitud superficial pero sin relevancia real. La puntuacion nDCG@10 de 0,5126 en BEIR-15 indica que en recuperacion textual pura aun queda margen de error apreciable. No se documenta comportamiento de alucinacion propiamente dicho, porque el modelo no genera contenido.
- La configuracion densa rinde notablemente peor que la multi-vector, especialmente en texto (0,3686 frente a 0,5126 en BEIR-15). Si se opta por indice denso para reducir costes, hay que asumir esa perdida de calidad.
- Limitacion de contexto de 16.384 tokens por documento o consulta. Documentos mas largos deben fragmentarse, lo que puede romper la coherencia de tablas o figuras que abarcan varias paginas.
- Limite de resolucion de imagen: 2.048 pixeles en el lado mas largo por defecto. Documentos de gran formato o con tipografia muy pequena pueden perder detalle tras el redimensionado a parches de 32 x 32.
- Idiomas: se declara soporte multilingue, pero no se publica la lista concreta de idiomas evaluados ni resultados desglosados por idioma, por lo que el rendimiento en castellano no esta cuantificado.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. Al ser un modelo de recuperacion, existe riesgo de infrarrepresentacion de ciertos documentos o perspectivas si el corpus de ajuste no es equilibrado, pero no hay datos publicados al respecto.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No impone restricciones de uso adicionales conocidas.
- Dependencia de version: la puntuacion con MeanMaxSim exige `sentence-transformers>=6.0.0`, lo que puede complicar la integracion en entornos con dependencias fijadas antiguas.
- Los identificadores de arXiv (2609.01657) y las fechas de creacion y actualizacion del repositorio (agosto y septiembre de 2026) provienen de los metadatos de HuggingFace; conviene verificarlos antes de citarlos en publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hcompany/NeoMME-800M-Retriever
- Modelo base: https://huggingface.co/Hcompany/NeoMME-800M
- Variante ST dense: https://huggingface.co/Hcompany/NeoMME-800M-Retriever-ST-dense
- Variante ST late-interaction: https://huggingface.co/Hcompany/NeoMME-800M-Retriever-ST-late
- Coleccion NeoMME en HuggingFace: https://hf.co/collections/Hcompany/neomme
- Documentacion del modelo en transformers: https://huggingface.co/docs/transformers/en/model_doc/neomme
- Paper (arXiv:2609.01657): https://arxiv.org/abs/2609.01657
- Notebooks de ejemplo sobre recuperacion de documentos visuales: https://github.com/tonywu71/colpali-cookbooks

La busqueda web realizada no devolvio ningun enlace adicional relevante sobre el modelo; los unicos resultados obtenidos correspondian a servicios de mensajeria sin relacion con NeoMME.
