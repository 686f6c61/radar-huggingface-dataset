# finvector/bge_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged

## Resumen

Este repositorio contiene un modelo de embeddings de frases derivado de la familia BGE-M3 de BAAI, publicado por el usuario `finvector` bajo el identificador `bge_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged`. Se trata de un ajuste fino mediante LoRA sobre la base BGE-M3, orientado a similitud semantica y recuperacion de informacion en el dominio financiero, a juzgar por los segmentos del nombre (`finsent`, `finmodern`, `investo`, `ccdb-finder`). El modelo se distribuye con la libreria `sentence-transformers` y pesos en formato `safetensors`.

La arquitectura subyacente es XLM-RoBERTa, concretamente la variante extendida a 8192 tokens de longitud de contexto que BAAI desarrollo para BGE-M3. El modelo cuenta con 567.754.752 parametros totales y produce embeddings densos de 1024 dimensiones, ademas de soportar, en su forma original, recuperacion multi-vector y dispersa. La model card incluida es la de BGE-M3 original, sin documentacion especifica del ajuste fino realizado por el autor.

Su relevancia radica en que parte de un modelo multilingue de referencia (mas de 100 idiomas segun la documentacion de BGE-M3) y lo especializa para un dominio concreto. No obstante, el repositorio no aporta datos de evaluacion propios, el conjunto de entrenamiento utilizado ni el procedimiento exacto de fusion de los adaptadores LoRA, lo que limita la confianza para uso en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa extendido a 8192 tokens, base de BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (segun especificaciones de BGE-M3) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantizacion no documentada) |
| Idiomas soportados | mas de 100 idiomas segun BGE-M3; el ajuste fino es de dominio financiero, idiomas concretos no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1024 |
| Funcionalidades de recuperacion | densa, multi-vector y dispersa (heredadas de BGE-M3) |
| Tamano del repositorio | 2.3 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre BGE-M3, un encoder XLM-RoBERTa cuyo maximo de longitud se extendio de 512 a 8192 tokens y que se preentreno adicionalmente con RetroMAE antes de aplicar aprendizaje contrastivo y un ajuste fino unificado para las tres modalidades de recuperacion (densa, dispersa y multi-vector). Esta base aporta un encoder compartido que genera simultaneamente un vector denso de 1024 dimensiones, pesos lexicos tipo BM25 y embeddings por token para late interaction.

Sobre esa base, el autor del repositorio aplica un ajuste fino con LoRA y posteriormente fusiona los adaptadores en los pesos del modelo (`merged`), lo que explica el sufijo del identificador. El nombre sugiere el uso de datos financieros segmentados en cuatro bloques (`4chunks`) y emparejamientos de tipo par y tripleta (`pair-tri`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO (poco habitual en modelos de embeddings) ni los hiperparametros del ajuste. Tampoco se documenta si se preservaron las cabezas de recuperacion dispersa y multi-vector tras la fusion.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para similitud semantica y recuperacion.
- Recuperacion dispersa con pesos por token, funcionalmente comparable a BM25, heredada de BGE-M3.
- Recuperacion multi-vector (late interaction tipo ColBERT) en la arquitectura base.
- Procesamiento de entradas largas de hasta 8192 tokens, adecuado para documentos extensos.
- Cobertura multilingue amplia (mas de 100 idiomas segun BGE-M3), aunque el ajuste fino puede haber sesgado el rendimiento hacia el dominio financiero.
- Compatibilidad con `sentence-transformers` y con Text Embeddings Inference (etiqueta `text-embeddings-inference`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de representacion, no generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en corpus financieros: indexar informes anuales, prospectos y notas de analisis de hasta 8192 tokens por fragmento y recuperar pasajes relevantes mediante similitud densa.
- Recuperacion hibrida en pipelines RAG: combinar la salida densa con los pesos dispersos del propio modelo para mejorar la cobertura lexica en terminologia financiera especializada (tickers, ratios, nombres de instrumentos).
- Deduplicacion y agrupacion de noticias financieras: calcular similitudes entre titulares y cuerpos de noticia para agrupar coberturas del mismo evento.
- Clasificacion y enrutamiento de consultas: usar los embeddings como caracteristicas de entrada para clasificadores que dirijan consultas de usuarios hacia el departamento o producto adecuado.
- Sistemas de recomendacion de contenido: representar articulos y perfiles de usuario en el mismo espacio vectorial para sugerir lecturas afines.
- Re-ranking previo en motores de busqueda internos: emplear el modelo como bi-encoder de primera etapa antes de un cross-encoder especializado, reduciendo el numero de candidatos a reordenar.
- Analisis de sentimiento financiero a nivel de frase: el nombre del ajuste (`finsent`) sugiere entrenamiento con pares de sentimiento; los embeddings pueden alimentar clasificadores ligeros de polaridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluida corresponde a BGE-M3 original y no aporta metricas del ajuste fino realizado por `finvector`, por lo que no es posible atribuir al modelo fusionado los resultados de MIRACL, MTEB u otras evaluaciones de la base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, mas activaciones; en fp16 alrededor de 1,2 GB.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM en fp16.
- GPU de datacenter recomendadas para alto throughput: A100, H100, L40S; tambien funciona en T4 para cargas ligeras.
- Despliegue mediante `sentence-transformers`, Text Embeddings Inference (TEI), vLLM no aplica (no es generativo) y llama.cpp no soporta esta arquitectura.
- El procesamiento de secuencias de 8192 tokens incrementa el consumo de memoria de activaciones de forma cuadratica en atencion; para lotes grandes conviene reducir el tamano de lote o truncar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| finvector/bge_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged | 567,7 M | 8192 | 1024 | >100 (segun base) | MIT | Ajuste LoRA fusionado de dominio financiero, sin benchmarks publicados |
| BAAI/bge-m3 | 567,7 M | 8192 | 1024 | >100 | MIT | Base original, recuperacion densa, dispersa y multi-vector, evaluada en MIRACL y MTEB |
| BAAI/bge-large-en-v1.5 | 335 M | 512 | 1024 | Ingles | MIT | Solo ingles, contexto corto, muy extendido en RAG en ingles |
| intfloat/multilingual-e5-large | 560 M | 512 | 1024 | Multilingue | MIT | Alternativa multilingue con prefijos `query:`/`passage:`, contexto limitado a 512 |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento del modelo ajustado que permitan afirmar una mejora sobre BAAI/bge-m3 en tareas financieras.

## Limitaciones y advertencias

- Ausencia total de documentacion del ajuste fino: no se especifican datos, hiperparametros ni criterios de evaluacion, lo que impide verificar la calidad del resultado.
- Riesgo de degradacion por sobreajuste al dominio: un ajuste LoRA sobre un corpus financiero puede reducir el rendimiento en tareas generales o en otros idiomas.
- La model card es la de BGE-M3 original y no describe el modelo publicado; las capacidades declaradas (multilingue, dispersa, multi-vector) deben validarse empiricamente tras la fusion.
- No se confirma que la fusion de adaptadores preserve las cabezas de recuperacion dispersa y multi-vector.
- Riesgo de sesgo de dominio: vocabulario y expresiones financieras sobrerrepresentados; posible peor comportamiento con texto coloquial o de otras areas.
- Los embeddings no generan texto, por lo que no pueden alucinar contenido, pero si pueden producir similitudes erroneas en pares lexicamente proximos y semanticamente distintos.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el origen de los datos de entrenamiento antes de desplegar en produccion regulada.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/finvector/bge_lora_finsent-finmodern-investo-ccdb-finder_4chunks_pair-tri_merged
- Paper de BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Codigo de FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Implementacion de BGE-M3 en FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset de ajuste fino de BGE-M3: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperacion hibrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de recuperacion multiple con Vespa: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Paper de DPR: https://arxiv.org/abs/2004.04906
- Paper de RetroMAE: https://arxiv.org/abs/2106.14807
