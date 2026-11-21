# sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s2_merged

## Resumen

Test_bge_raw_investo-to-finmodern_pair_s2_merged es un modelo de embeddings de frases (sentence transformer) derivado de la familia BGE y afinado sobre un corpus financiero. Lo publica el usuario sachinyerrawar en Hugging Face y está pensado para tareas de similitud semántica y recuperación de información (information retrieval) en el dominio de las finanzas. Su función es convertir texto en vectores densos que permitan buscar y ordenar pasajes por relevancia semántica, no por coincidencia léxica.

Técnicamente se apoya en una arquitectura xlm-roberta según los tags del repositorio, con 567.754.752 parámetros totales declarados en los pesos safetensors. El modelo es el resultado de una segunda etapa de fusión (merged) sobre un checkpoint previo del mismo autor, `Test_bge_raw_investo-to-finmodern_pair_s1_merged`, y se ha afinado con la pérdida CachedMultipleNegativesRankingLoss sobre un conjunto de datos de pares pregunta-pasaje de FinLang (investopedia-embedding-dataset), con un tamaño de dataset declarado de 236 ejemplos.

Su relevancia es acotada pero concreta: cubre el nicho de recuperación semántica en inglés sobre documentación financiera (Investopedia), con una licencia Apache 2.0 permisiva y compatibilidad con la librería sentence-transformers y text-embeddings-inference. No es un modelo generativo ni un LLM: es un encoder de embeddings para búsqueda y ranking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | xlm-roberta (encoder transformer, según tags del repositorio) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; compatible con cuantización vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo xlm-roberta, según los tags del repositorio, configurado como sentence transformer para producir embeddings de frase. No se trata de un modelo generativo ni de una arquitectura MoE, SSM o híbrida: es un encoder bidireccional que proyecta texto a un espacio vectorial donde la similitud coseno aproxima la similitud semántica. El checkpoint es una fusión (merge) del modelo previo `sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s1_merged`, lo que indica un proceso de entrenamiento por etapas con fusión de pesos entre fases.

El ajuste fino se realizó con la función de pérdida CachedMultipleNegativesRankingLoss, típica en el entrenamiento de retrievers densos con pares positivos y negativos en el batch, y sobre el dataset `FinLang/investopedia-embedding-dataset`, con un tamaño declarado de 236 ejemplos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un encoder de embeddings). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica (pipeline sentence-similarity).
- Extracción de características (feature-extraction) a partir de texto en inglés.
- Recuperación de información (information retrieval) sobre corpus financieros: ranking de pasajes por relevancia semántica.
- Búsqueda semántica y deduplicación de documentos mediante similitud coseno.
- Clasificación y agrupamiento (clustering) indirectos a partir de los vectores generados.
- Compatibilidad con text-embeddings-inference y con endpoints compatibles, lo que facilita su despliegue como servicio de embeddings.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: al ser un encoder, no genera texto.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.

## Casos de uso

- Búsqueda semántica sobre documentación financiera: indexar artículos de Investopedia y recuperar los pasajes más relevantes para una consulta del usuario mediante similitud coseno entre embeddings.
- Motor de preguntas y respuestas extractivo (RAG): usar el modelo como retriever para seleccionar los pasajes financieros que se pasarán a un LLM generativo, reduciendo el contexto irrelevante.
- Deduplicación de contenido financiero: calcular embeddings de artículos y detectar duplicados o versiones casi idénticas mediante umbrales de similitud.
- Clasificación temática de documentos: agrupar noticias y artículos financieros por similitud vectorial para enrutarlos a categorías (inversión, impuestos, jubilación, etc.).
- Sistemas de recomendación de contenido: sugerir artículos financieros relacionados a partir de la similitud entre el artículo leído y el resto del catálogo.
- Moderación y filtrado de contenido: comparar consultas o mensajes con un conjunto de referencia de textos financieros para detectar temas o desviaciones.
- Evaluación de calidad de respuestas: medir la similitud semántica entre una respuesta generada y una respuesta de referencia en dominios financieros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el dataset "investo", tarea de information retrieval. No están verificados (`verified: false`).

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.98 |
| Cosine Accuracy@3 | 1.0 |
| Cosine Accuracy@5 | 1.0 |
| Cosine Accuracy@10 | 1.0 |
| Cosine Precision@1 | 0.98 |
| Cosine Precision@3 | 0.3333 |
| Cosine Precision@5 | 0.2 |
| Cosine Precision@10 | 0.1 |
| Cosine Recall@1 | 0.98 |
| Cosine Recall@3 | 1.0 |
| Cosine Recall@5 | 1.0 |
| Cosine Recall@10 | 1.0 |
| Cosine NDCG@10 | 0.99 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas de MRR@10 o MAP@100 con valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de ~568 M de parámetros, en FP32 requiere aproximadamente 2,3 GB de pesos; en FP16 unos 1,1 GB; en cuantización de 8 bits alrededor de 0,6 GB. El consumo real depende del tamaño de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP16 con batches moderados; A100, H100, L4 o RTX 4090 ofrecen margen amplio para batches grandes y alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8-16 GB), RTX 4070 y superiores, incluso en FP32 con batches pequeños.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (compatible según tags), endpoints compatibles, y exportación a ONNX o cuantización GGUF mediante herramientas externas para llama.cpp/Ollama (no documentado oficialmente).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se indican alternativas de la misma categoría (encoders de embeddings para retrieval), con datos solo cuando están disponibles en la información de este modelo; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Test_bge_raw_investo-to-finmodern_pair_s2_merged | 567.754.752 | no disponible | apache-2.0 | Afinado en dominio financiero (Investopedia), inglés |
| BGE base (familia original) | no disponible | no disponible | no disponible | Modelo base de referencia de la familia BGE |
| Alternativas de embeddings financieros | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información |

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no produce texto, razonamiento ni respuestas; solo vectores.
- Entrenado únicamente en inglés; su uso en castellano u otros idiomas no está respaldado por la documentación.
- Dataset de ajuste muy pequeño (236 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste al dominio de Investopedia.
- Los benchmarks declarados no están verificados (`verified: false`) y proceden del propio autor; deben tomarse con cautela.
- Riesgo de sesgos heredados del corpus financiero de Investopedia y del modelo base xlm-roberta.
- No se documentan la longitud de contexto soportada ni el comportamiento con secuencias largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de origen.
- Para producción, validar el rendimiento en el corpus propio antes de desplegar, dado el reducido tamaño del conjunto de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s2_merged
- Modelo base (etapa previa): https://huggingface.co/sachinyerrawar/Test_bge_raw_investo-to-finmodern_pair_s1_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/FinLang/investopedia-embedding-dataset
- Paper de Sentence-BERT (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de BGE (arxiv:2101.06983): https://arxiv.org/abs/2101.06983
