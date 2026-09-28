# Qdrant/all_miniLM_L6_v2_with_attentions

## Resumen

Qdrant/all_miniLM_L6_v2_with_attentions es un port a ONNX de sentence-transformers/all-MiniLM-L6-v2 modificado para devolver los pesos de atencion ademas del embedding. Lo publica Qdrant y su proposito es alimentar la busqueda BM42, la propuesta de recuperacion dispersa de Qdrant en la que la importancia de cada termino no se calcula con estadisticas de corpus (IDF) sino con los pesos de atencion del propio transformer.

El modelo se apoya en el encoder MiniLM-L6, una destilacion de 6 capas y unos 22,7 millones de parametros con representaciones de 384 dimensiones, por lo que es extremadamente ligero: el repositorio completo ocupa 0,1 GB. Su salida no es un vector denso al uso, sino un vector disperso de pares indice/valor que Qdrant indexa como sparse vector configurado con Modifier.IDF.

Es relevante ahora porque resuelve un problema operativo concreto de los sistemas RAG: los esquemas tipo BM25 obligan a recalcular estadisticas globales del corpus cada vez que se anade o modifica un documento, lo que complica la ingesta en streaming. Al derivar los pesos de termino de la atencion, BM42 permite indexar documentos de forma incremental sin reestimar IDF. El modelo esta publicado bajo licencia Apache 2.0 y solo cubre ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas) exportado a ONNX |
| Parametros totales | ~22,7 M (heredados del modelo base sentence-transformers/all-MiniLM-L6-v2) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 256 tokens en la configuracion del modelo base; el encoder subyacente admite hasta 512 posiciones |
| Tipos de cuantizacion | no se documentan variantes cuantizadas en el repositorio; al ser un grafo ONNX admite cuantizacion dinamica INT8 con ONNX Runtime |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de ~0,1 GB) |
| Dimension del embedding denso | 384 (modelo base) |
| Tipo de salida | vector disperso (indices y valores) derivado de los pesos de atencion |
| Tamano de vocabulario | 30.522 tokens (WordPiece, BERT uncased en el modelo base) |
| Nombre en FastEmbed | Qdrant/bm42-all-minilm-l6-v2-attentions |
| Descargas / likes en HuggingFace | 223.349 / 16 |
| Fecha de creacion / ultima actualizacion | 2024-05-09 / 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base all-MiniLM-L6-v2: un encoder transformer de 6 capas con atencion multi-cabeza, dimension oculta de 384 y alrededor de 22,7 millones de parametros, obtenido mediante destilacion (autoatencion y conocimiento) a partir de un modelo profesor de mayor tamano. Sobre esa base, Qdrant ha reexportado y ajustado el grafo a ONNX para exponer no solo las representaciones, sino tambien las matrices de atencion necesarias para ponderar terminos. No se documenta en la informacion disponible ningun reentrenamiento adicional, ni fases de ajuste con RLHF o DPO (no aplican a un modelo de embeddings).

La innovacion relevante no esta en el encoder sino en el uso que se hace de su senal interna. BM42 sustituye el IDF clasico, que es una estadistica global del corpus, por pesos derivados de la atencion de la consulta y del documento; de ahi que el modelo se distribuya especificamente para devolver esos pesos. En el ejemplo de la model card los indices devueltos superan ampliamente el tamano del vocabulario BERT (por ejemplo 1881538586 o 1932363795), lo que indica que se aplica una funcion de hash sobre los terminos en lugar de exponer los identificadores de vocabulario originales. La model card advierte ademas de que los vectores deben configurarse en Qdrant con Modifier.IDF; sin ese modificador la ponderacion de terminos no se aplica como espera el diseno de BM42.

## Capacidades

- Extraccion de caracteristicas y similitud de frases: genera representaciones para busqueda semantica y comparacion de textos.
- Generacion de embeddings dispersos: produce pares indice/valor aptos para indices de vectores dispersos en Qdrant.
- Exposicion de pesos de atencion: permite derivar la importancia de cada termino segun la atencion del modelo, que es la base de BM42.
- Recuperacion lexica mejorada: al ponderar terminos con atencion, captura coincidencias exactas de vocabulario poco frecuente (nombres propios, identificadores, codigos) mejor que un embedding denso puro.
- Indexacion incremental: al no depender de estadisticas globales del corpus, permite anadir y actualizar documentos sin recalcular IDF.
- Integracion con FastEmbed: se consume mediante SparseTextEmbedding con el nombre Qdrant/bm42-all-minilm-l6-v2-attentions.
- Idiomas: exclusivamente ingles.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni flujos de agente; es un modelo de representacion, no un modelo generativo.

## Casos de uso

- Recuperacion hibrida en Qdrant: combinar el vector disperso BM42 generado por este modelo con un embedding denso del mismo documento y fusionar ambos rankings; el sistema gana precision en coincidencias exactas sin perder recall semantico.
- RAG sobre corpus que cambia con frecuencia: en escenarios de ingesta continua (noticias, tickets, catalogos) BM42 evita recalcular IDF en cada insercion, de modo que el pipeline de indexacion puede ejecutarse documento a documento.
- Busqueda de identificadores y terminologia tecnica: consultas con numeros de referencia, nombres de producto o siglas, donde un modelo denso tiende a diluir la coincidencia exacta y el enfoque disperso ponderado por atencion la preserva.
- Primera etapa de recuperacion con presupuesto de latencia ajustado: al ser un encoder de 6 capas y ~23 MB en INT8, puede ejecutarse en CPU dentro del propio nodo de indexacion y devolver candidatos para un reranker posterior.
- Deduplicacion y agrupacion de documentos: usar la similitud entre representaciones para detectar duplicados casi exactos o agrupar textos cortos por similitud en pipelines de limpieza de datos.
- Recomendacion basada en contenido: representar articulos, ofertas o entradas de catalogo y recuperar los vecinos mas proximos a los elementos con los que un usuario ha interactuado.
- Filtrado y enrutado previo en asistentes: clasificar la intencion o el dominio de una consulta comparandola con ejemplos etiquetados antes de invocar un modelo mayor.
- Analisis de atribucion de terminos: al exponer los pesos de atencion, permite inspeccionar que palabras de una consulta dominan la recuperacion, util para depurar y explicar resultados de busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (MRR, nDCG, recall) y la informacion de la busqueda web solo refleja datos de uso (223.349 descargas, 16 likes) y metadatos de repositorio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 91 MB en FP32, 46 MB en FP16 y 23 MB en INT8 para los pesos, mas el overhead del runtime de ONNX y de las activaciones.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, e incluso integradas) y tambien en GPU de datacenter (A100, H100) si se comparte con otros servicios.
- Ejecucion en CPU: totalmente viable y es el escenario habitual de despliegue, dado el tamano del modelo y que la secuencia se trunca a 256 tokens.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: FastEmbed (via SparseTextEmbedding con el nombre Qdrant/bm42-all-minilm-l6-v2-attentions), ONNX Runtime, Qdrant como motor de indexacion con Modifier.IDF activado. La model card y las etiquetas del repositorio mencionan ademas compatibilidad con text-embeddings-inference, endpoints y despliegue en Azure.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de recuperacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qdrant/all_miniLM_L6_v2_with_attentions | ~22,7 M | 256 tokens | Dispersa (BM42, pesos de atencion) | Apache 2.0 | HuggingFace, FastEmbed, Qdrant |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Densa (384 dimensiones) | Apache 2.0 | HuggingFace, sentence-transformers |
| naver/splade-cocondenser-ensembledistil | ~110 M (BERT-base) | 512 tokens | Dispersa aprendida (SPLADE) | Apache 2.0 | HuggingFace |
| BM25 | no aplica | no aplica | Lexica (TF-IDF/BM25) | no aplica | Cualquier motor de busqueda |

Nota: los datos de las tres alternativas proceden de su documentacion publica y no de la informacion proporcionada en esta ficha; no se dispone de comparaciones de rendimiento entre ellas y el modelo descrito dentro de esa informacion.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado para otros idiomas, por lo que su uso en corpus en castellano degradara la calidad de la recuperacion.
- Sesgos heredados: al derivar de un modelo destilado con datos web en ingles, puede reproducir sesgos de genero, origen o profesion presentes en esos datos.
- No genera texto: no hay riesgo de alucinacion generativa, pero si de similitudes espurias o de ponderaciones de atencion poco intuitivas que no deben interpretarse como una explicacion causal.
- Dependencia de Qdrant: la model card indica explicitamente que los vectores deben configurarse con Modifier.IDF. Sin esa configuracion el comportamiento del indice no coincide con el diseno previsto.
- Acoplamiento a BM42: el modelo esta pensado para ese esquema de busqueda; reutilizarlo como embedder denso convencional no tiene sentido, ya que su salida es dispersa.
- Longitud limitada: los textos se truncan a 256 tokens en la configuracion del modelo base, lo que descarta documentos largos sin un troceado previo.
- Indices hasheados: los identificadores devueltos no son identificadores de vocabulario BERT, sino hashes, lo que complica la inspeccion manual o la reutilizacion fuera del ecosistema Qdrant/FastEmbed.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base y de los datos con los que se entreno.
- Produccion: no se publican metricas de calidad ni de latencia en la informacion disponible, por lo que cualquier despliegue deberia acompanarse de una evaluacion propia sobre el corpus objetivo antes de sustituir un sistema BM25 en funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qdrant/all_miniLM_L6_v2_with_attentions
- Archivos del repositorio: https://huggingface.co/Qdrant/all_miniLM_L6_v2_with_attentions/tree/main
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Articulo sobre BM42: https://qdrant.tech/articles/bm42/
- Repositorio de FastEmbed: https://github.com/qdrant/fastembed
- Documentacion del modificador IDF en Qdrant: https://qdrant.tech/documentation/concepts/indexing/?q=modifier#idf-modifier
- Grafo de arquitectura: https://hfviewer.com/Qdrant/all_miniLM_L6_v2_with_attentions
- Ficha en Inferix: https://inferix.co/models/Qdrant/all_miniLM_L6_v2_with_attentions
- Ficha en Endor Labs: https://www.endorlabs.com/ai-model/qdrant-all-minilm-l6-v2-with-attentions
