# finvector/Test_bge_qlora_finmodern_tri_merged

## Resumen

`finvector/Test_bge_qlora_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-similarity) publicado por el usuario finvector en Hugging Face. Se trata de una variante derivada de BGE-M3, el modelo de recuperación multilingüe desarrollado por BAAI (Beijing Academy of Artificial Intelligence) y presentado en el paper "BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation" (arXiv:2402.03216). El nombre del repositorio sugiere un ajuste fino mediante QLoRA sobre el modelo base y una posterior fusión de pesos (merged), si bien la model card no documenta explícitamente el proceso de entrenamiento ni los datos empleados.

El modelo se apoya en una arquitectura XLM-RoBERTa extendida, con 567.754.752 parámetros totales y una longitud de contexto de hasta 8192 tokens según las especificaciones de la familia BGE-M3. Está pensado para tareas de recuperación de información y similitud semántica, incluyendo recuperación densa, multi-vector (ColBERT) y dispersa (sparse), lo que lo hace relevante para pipelines RAG que necesitan combinar varios modos de recuperación sobre un único modelo.

La relevancia actual del modelo radica en su posible uso como encoder multilingüe de largo contexto dentro de sistemas de búsqueda híbrida, aunque al tratarse de un repositorio de prueba (Test) con cero descargas y sin métricas publicadas, su adopción en producción debe considerarse con cautela hasta validar su comportamiento frente al BGE-M3 original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa extendida (transformer encoder), base de BGE-M3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según especificaciones de BGE-M3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (BGE-M3 base declara más de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a BGE-M3, que parte de `xlm-roberta-large` con la longitud máxima extendida a 8192 tokens y preentrenamiento adicional mediante RetroMAE (`bge-m3-retromae`), seguido de aprendizaje contrastivo (`bge-m3-unsupervised`) y un ajuste fino unificado que combina recuperación densa, dispersa y multi-vector (`bge-m3`). El modelo produce embeddings de dimensión 1024 y puede generar simultáneamente representaciones densas, pesos tipo BM25 (sparse) y embeddings por token para ColBERT.

En cuanto al entrenamiento específico de este repositorio, la información disponible no detalla el dataset, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo indica un ajuste con QLoRA (cuantización de bajo rango) y una fusión posterior de los adaptadores con los pesos base, pero no se aportan hiperparámetros, datos de entrenamiento ni curvas de evaluación. La model card incluida es la de BGE-M3 original de BAAI, no una descripción propia del autor.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y recuperación de información.
- Recuperación densa: un único vector de 1024 dimensiones por texto.
- Recuperación dispersa (sparse): pesos por token comparables a BM25, obtenidos sin coste adicional al generar el embedding denso.
- Recuperación multi-vector (ColBERT): representaciones por token para un re-ranking interno más preciso.
- Procesamiento de entradas de hasta 8192 tokens, lo que permite indexar documentos largos sin truncamiento agresivo.
- Soporte multilingüe heredado de BGE-M3 (más de 100 idiomas según la documentación del modelo base).
- Compatibilidad con `sentence-transformers`, `text-embeddings-inference` y endpoints de Hugging Face.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking), al ser un modelo de embeddings y no generativo.

## Casos de uso

- Búsqueda semántica en bases de conocimiento corporativas: indexar documentación interna con embeddings densos y recuperar los fragmentos más relevantes para una consulta, aprovechando la ventana de 8192 tokens para no fragmentar en exceso.
- Recuperación híbrida en pipelines RAG: combinar la salida densa y la dispersa del modelo con BM25 en motores como Vespa o Milvus, tal como recomienda la documentación de BGE-M3, para mejorar la precisión en dominios con jerga específica.
- Deduplicación y clustering de textos: calcular similitud coseno entre embeddings para agrupar documentos o detectar duplicados en corpus multilingües.
- Motor de búsqueda multilingüe: usar el mismo encoder para consultas y documentos en distintos idiomas, habilitando búsqueda cross-lingual sin traducir previamente.
- Re-ranking dentro de un sistema de recuperación en dos fases: emplear los embeddings multi-vector para refinar los candidatos devueltos por una primera fase de recuperación léxica.
- Clasificación y filtrado semántico de tickets o correos: generar embeddings de mensajes entrantes y asignarlos a categorías comparando con centroides previamente calculados.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para calcular afinidad semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas propias (MTEB, MIRACL, MLDR u otras) para esta variante ajustada y fusionada; los únicos datos de referencia pertenecen al BGE-M3 original de BAAI, que no son extrapolables sin validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, más activaciones y memoria del tokenizador; en la práctica, entre 3 y 4 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 1,2 GB para pesos, con 2-3 GB totales considerando activaciones.
- VRAM estimada en int8: en torno a 0,6 GB para pesos; cuantizaciones de 4 bits no están documentadas para este repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100, H100, L40S o RTX 4090 para throughput alto en indexación por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso con lotes moderados.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (soportado según los tags), Hugging Face Inference Endpoints, y servidores compatibles con la API de embeddings de Hugging Face.
- Latencia y throughput: no disponibles; dependerán del hardware, del tamaño de lote y de la longitud de secuencia (hasta 8192 tokens penaliza fuertemente el throughput frente a secuencias de 512).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finvector/Test_bge_qlora_finmodern_tri_merged | 567,7 M | 8192 | no disponible (base: >100) | MIT | Hugging Face |
| BAAI/bge-m3 | 567,7 M | 8192 | >100 | MIT | Hugging Face |
| BAAI/bge-m3-unsupervised | 567,7 M | 8192 | >100 | MIT | Hugging Face |
| BAAI/bge-large-en-v1.5 | no disponible | 512 | inglés | MIT | Hugging Face |

La comparación directa con BGE-M3 es la más pertinente, ya que comparten arquitectura y tamaño. La diferencia principal es que este repositorio es una variante ajustada y fusionada sin métricas publicadas, mientras que BGE-M3 cuenta con evaluación en MTEB, MIRACL y MLDR. `bge-large-en-v1.5` es monolingüe y de contexto mucho menor, por lo que solo sería comparable en tareas de recuperación en inglés con documentos cortos.

## Limitaciones y advertencias

- Repositorio de prueba: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria ni métricas publicadas.
- Ausencia de documentación propia: la model card es la de BGE-M3 original, por lo que no se describen los datos, hiperparámetros ni el proceso de fusión de este ajuste QLoRA.
- Riesgo de regresión frente al modelo base: un ajuste fino sin evaluación publicada puede degradar el rendimiento multilingüe o en dominios no representados en los datos de entrenamiento.
- Idiomas no declarados: aunque la base soporta más de 100 idiomas, no se garantiza que el ajuste conserve ese comportamiento.
- Sesgos: no documentados; hereda los sesgos potenciales de los corpus de preentrenamiento de XLM-RoBERTa y de los datos de ajuste, que no se especifican.
- Alucinación: al ser un modelo de embeddings no genera texto, pero puede producir similitudes espurias si se usa fuera de su distribución de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene verificar la procedencia de los datos de ajuste, no documentada.
- Uso en producción: se recomienda validar con el propio conjunto de evaluación (MTEB, MIRACL o datos internos) antes de sustituir a BGE-M3 en un pipeline RAG.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/Test_bge_qlora_finmodern_tri_merged
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Código BGE-M3: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperación híbrida en Vespa: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Ejemplo de recuperación híbrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- XLM-RoBERTa large: https://huggingface.co/FacebookAI/xlm-roberta-large
- RetroMAE: https://github.com/staoxiao/RetroMAE
