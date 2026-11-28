# finvector/bge_lora_investo_pair_merged

## Resumen
`finvector/bge_lora_investo_pair_merged` es un modelo de embeddings de frases derivado de la familia BGE-M3 de BAAI, publicado por el usuario finvector. Se trata de un merge de pesos (prefijo `merged` en el identificador) que combina un adaptador LoRA sobre la base BGE-M3, orientado a tareas de similitud semantica y recuperacion de informacion. El pipeline declarado es `sentence-similarity` y la libreria de referencia es sentence-transformers.

El modelo hereda la arquitectura de BGE-M3, basada en XLM-RoBERTa con contexto extendido hasta 8192 tokens, lo que permite procesar desde frases cortas hasta documentos largos. BGE-M3 es conocido por su versatilidad: soporta recuperacion densa, multi-vector (ColBERT) y dispersa (sparse) de forma simultanea, lo que lo hace util en pipelines de RAG hibridos.

La relevancia de esta publicacion concreta es limitada: se trata de una variante afinada por un tercero (finvector) sobre la que no se documentan datos de entrenamiento, hiperparametros del LoRA ni evaluaciones propias. La model card reproduce integramente la documentacion de BGE-M3 original, sin aportar informacion especifica sobre el ajuste realizado. Con 567 millones de parametros y licencia MIT, es desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) con contexto extendido, base de BGE-M3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredado de BGE-M3) |
| Tipos de cuantizacion | no disponible (safetensors en fp32/fp16; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible en la ficha del autor; la base BGE-M3 declara mas de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | no disponible para este merge (BGE-M3 base: 1024) |
| Tamano del repo | 1.2 GB |

## Arquitectura y entrenamiento
El modelo parte de BGE-M3, un encoder XLM-RoBERTa cuyo max_length se extendio a 8192 tokens y que fue preentrenado adicionalmente con RetroMAE antes de aplicar aprendizaje contrastivo y un afinado unificado para recuperacion densa, dispersa y multi-vector. Sobre esta base, finvector habria aplicado un adaptador LoRA y posteriormente fusionado los pesos en el modelo final (de ahi el sufijo `pair_merged`).

No se dispone de informacion sobre el dataset de afinado, el numero de pasos, la funcion de perdida, los hiperparametros del LoRA ni si se emplearon pares de similitud, tripletas o datos de dominio financiero (el prefijo `investo` sugiere un dominio de inversion, pero no se confirma). La model card no documenta el proceso de entrenamiento especifico de este merge; todo el contenido tecnico procede de la documentacion original de BGE-M3.

## Capacidades
- Generacion de embeddings de frases y documentos para similitud semantica.
- Recuperacion densa (bi-encoder) para busqueda semantica.
- Recuperacion dispersa (sparse) heredada de BGE-M3, con pesos por token similares a BM25.
- Recuperacion multi-vector (estilo ColBERT) segun la base BGE-M3.
- Procesamiento de entradas largas de hasta 8192 tokens.
- Soporte multilingue segun la base BGE-M3 (mas de 100 idiomas declarados); no verificado para este merge.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso
- Busqueda semantica en bases documentales: indexar documentos con embeddings densos y recuperar por similitud coseno; adecuado por su contexto de 8192 tokens para fragmentos largos.
- Pipeline RAG hibrido: combinar recuperacion densa y dispersa del propio modelo con un re-ranker posterior, tal como recomienda la documentacion de BGE-M3.
- Deduplicacion y agrupacion de textos: calcular similitudes entre pares de documentos para detectar duplicados o near-duplicates en corpus.
- Clasificacion zero-shot por similitud: comparar embeddings de consultas contra descripciones de categorias sin entrenamiento adicional.
- Sistemas de recomendacion basados en contenido: representar items y perfiles de usuario en el mismo espacio vectorial para recuperar items afines.
- Analisis de dominio financiero (potencial): si el afinado `investo` se realizo sobre corpus de inversion, podria mejorar la recuperacion en ese dominio, aunque no hay evidencia publicada que lo confirme.
- Motor de busqueda interno empresarial: desplegable con `text-embeddings-inference` o sentence-transformers sobre GPU consumer por su tamano contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card reproduce los resultados de BGE-M3 original, pero no aporta metricas del merge `bge_lora_investo_pair_merged`, por lo que no es posible afirmar que conserve o mejore el rendimiento de la base.

## Requisitos de hardware

| Escenario | VRAM estimada | Notas |
|---|---|---|
| fp32 | ~2,3 GB | Solo pesos; sumar activaciones |
| fp16 / bf16 | ~1,2 GB | Recomendado en GPU |
| int8 | ~0,6 GB | Via cuantizacion externa |
| int4 | ~0,3 GB | Via cuantizacion externa |

- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, etc.
- Tambien ejecutable en CPU para cargas moderadas, con mayor latencia.
- GPU de datacenter (A100, H100) solo necesarias para alto throughput por lotes.
- Opciones de despliegue: sentence-transformers, `text-embeddings-inference` (tag declarado), integracion con Milvus y Vespa para recuperacion hibrida.
- Latencia y throughput: no disponibles; dependen del lote, la longitud de secuencia y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finvector/bge_lora_investo_pair_merged | 567 M | 8192 | MIT | Merge de LoRA no documentado |
| BAAI/bge-m3 | 567 M | 8192 | MIT | Base oficial, densa + sparse + multi-vector, benchmarks publicados |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | MIT | Solo ingles, contexto corto |
| intfloat/multilingual-e5-large | ~560 M | 512 | MIT | Multilingue, sin recuperacion sparse nativa |

## Limitaciones y advertencias
- No hay documentacion del proceso de afinado: se desconoce que datos se usaron, si hubo riesgo de sobreajuste o si el merge degrada las capacidades originales de BGE-M3.
- Al ser un merge de LoRA, los pesos pueden diferir de la base de formas no verificadas; conviene evaluar en el dominio objetivo antes de produccion.
- Riesgo de sesgos heredados del corpus de preentrenamiento de XLM-RoBERTa y de los datos de afinado no publicados.
- La dimension del embedding no se especifica para este merge; hay que inspeccionar la configuracion antes de integrarlo.
- El soporte multilingue se asume por herencia de BGE-M3, pero no esta verificado para este ajuste.
- Licencia MIT permite uso comercial, pero sin garantias del autor sobre calidad o idoneidad.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/finvector/bge_lora_investo_pair_merged
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Codigo BGE-M3: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo hibrido en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de Vespa: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Paper RetroMAE: https://arxiv.org/abs/2107.05720
- Paper DPR: https://arxiv.org/abs/2004.04906
