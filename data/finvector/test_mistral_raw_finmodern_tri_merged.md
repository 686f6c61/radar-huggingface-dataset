# finvector/Test_mistral_raw_finmodern_tri_merged

## Resumen

`finvector/Test_mistral_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) derivado de `intfloat/e5-mistral-7b-instruct`, que a su vez se construye sobre la arquitectura Mistral de 7 mil millones de parámetros. Lo publica el usuario finvector en Hugging Face y está orientado a tareas de similitud semántica y extracción de características (feature extraction), con un enfoque declarado en el dominio financiero por el nombre del repositorio y los ejemplos de la model card (fragmentos de informes 10-K, notas contables y documentación corporativa).

El modelo se ha generado mediante entrenamiento supervisado con la librería sentence-transformers, empleando la función de pérdida `CachedMultipleNegativesRankingLoss` y un conjunto de datos declarado de 70 ejemplos (tag `dataset_size:70`). Se trata, por tanto, de un ajuste fino ligero sobre el modelo base, no de un modelo entrenado desde cero. El resultado es un encoder que produce representaciones vectoriales densas para búsqueda semántica, clustering y recuperación de información.

Su relevancia es limitada en términos de adopción (0 descargas y 0 likes en el momento de la ficha) y debe interpretarse como un artefacto experimental o de prueba interna. No obstante, al heredar la arquitectura y el tokenizador de E5-Mistral-7B-Instruct, conserva la ventana de contexto larga y las capacidades multilingües del modelo original, lo que lo hace potencialmente útil para experimentación en recuperación sobre documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral), adaptado como encoder de embeddings |
| Parametros totales | 7.110.660.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base E5-Mistral-7B-Instruct soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/e5-mistral-7b-instruct`, un transformer decoder-only de la familia Mistral con 7.110.660.096 parámetros, reutilizado como backbone para generar embeddings de frases. Sobre esta base se ha realizado un ajuste fino con sentence-transformers, empleando la pérdida `CachedMultipleNegativesRankingLoss`, una variante de contrastive learning por tripletas que aprovecha negativos en caché para aumentar la eficiencia del entrenamiento con lotes pequeños. El conjunto de datos declarado es de 70 ejemplos, lo que indica un ajuste muy ligero y probablemente orientado a un dominio específico (financiero, a juzgar por los ejemplos de la model card).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base. El nombre del repositorio sugiere un proceso de "merging" de pesos (tri_merged), pero no se detalla la metodología ni los modelos intermedios implicados.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Extracción de características (feature extraction) a partir de texto.
- Búsqueda semántica sobre documentos financieros y corporativos (fragmentos de 10-K, notas contables, documentación legal).
- Clustering y deduplicación de textos mediante representaciones vectoriales.
- Soporte de contexto largo heredado del modelo base (no confirmado explícitamente en esta ficha).
- Capacidades multilingües del modelo base potencialmente conservadas, aunque la model card solo declara inglés.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento explícito; al ser un modelo de embeddings, estas capacidades no aplican directamente.

## Casos de uso

- Búsqueda semántica en corpus financieros: indexar informes anuales, notas al pie y documentación contable, y recuperar fragmentos relevantes mediante similitud coseno entre embeddings. Adecuado por el ajuste declarado sobre ejemplos de este dominio.
- Deduplicación de documentos corporativos: generar embeddings de cláusulas o secciones y agrupar textos casi idénticos en procesos de limpieza de datasets.
- Clasificación temática de fragmentos legales: usar los embeddings como entrada a un clasificador ligero para etiquetar secciones de contratos o informes.
- Motor de recomendación de documentos: calcular similitud entre la consulta del usuario y un catálogo de informes para sugerir lecturas relacionadas.
- RAG (retrieval-augmented generation): integrar el modelo como retriever en un pipeline que alimente a un LLM generador con fragmentos relevantes de documentación financiera.
- Análisis de similitud entre declaraciones corporativas: comparar comunicados de prensa o transcripciones de resultados para detectar cambios de discurso a lo largo del tiempo.
- Evaluación de calidad de datasets de embeddings: servir como referencia en pruebas internas de pipelines de sentence-transformers.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 1.0 | No |

El valor de 1.0 en cosine accuracy sobre un conjunto de evaluación de tripletas no verificado debe interpretarse con cautela: un dataset de evaluación tan pequeño o tan alineado con el de entrenamiento puede producir resultados artificialmente altos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,2 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica se recomienda al menos 16-20 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB, más overhead.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090 (24 GB) también es viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en GPUs con 8-12 GB requeriría cuantización.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiquetado como compatible), vLLM con soporte de embeddings, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| finvector/Test_mistral_raw_finmodern_tri_merged | 7,11B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Ajuste ligero sobre E5-Mistral-7B-Instruct, dataset de 70 ejemplos |
| intfloat/e5-mistral-7b-instruct | 7,11B | contexto largo (modelo base) | apache-2.0 (heredada) | Hugging Face, ampliamente usado | Modelo base, entrenado con datos multilingües y instrucciones |
| BAAI/bge-large-en-v1.5 | ~335M | 512 tokens | MIT | Hugging Face, muy usado | Alternativa ligera para embeddings en inglés |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256 tokens | apache-2.0 | Hugging Face, muy usado | Modelo pequeño para embeddings rápidos en CPU |

La comparativa se basa en características públicas de los modelos; no se dispone de resultados de benchmarks comparativos en la información proporcionada para este modelo concreto.

## Limitaciones y advertencias

- El conjunto de entrenamiento declarado es de solo 70 ejemplos, lo que limita severamente la generalización y hace probable el sobreajuste.
- El resultado de cosine accuracy de 1.0 no está verificado y proviene de un conjunto de evaluación no documentado; no debe tomarse como indicador fiable de rendimiento.
- La model card solo declara inglés; el comportamiento en castellano u otros idiomas no está garantizado, aunque el modelo base sea multilingüe.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sí existe riesgo de recuperar fragmentos semánticamente similares pero factualmente irrelevantes.
- No se documentan sesgos específicos; al heredar el modelo base, puede arrastrar sesgos presentes en sus datos de entrenamiento.
- Licencia apache-2.0 permite uso comercial, pero al derivar de E5-Mistral-7B-Instruct conviene verificar las condiciones del modelo base y de Mistral.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; no se recomienda para producción sin evaluación propia.
- No se dispone de información sobre cuantizaciones publicadas ni sobre el proceso de merging de pesos.
- El tamaño del repositorio (14,2 GB) implica requisitos de almacenamiento y ancho de banda considerables para su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/Test_mistral_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
