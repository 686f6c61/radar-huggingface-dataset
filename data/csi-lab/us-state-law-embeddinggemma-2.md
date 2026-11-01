# CSI-lab/US-State-Law-EmbeddingGemma-2

## Resumen

US-State-Law-EmbeddingGemma-2 es un modelo de embeddings especializado en recuperación de información jurídica del estado de Washington (Revised Code of Washington, RCW). Lo desarrolla CSI-lab (Complex Social Interactions Lab) partiendo de google/embeddinggemma-2, el modelo de embeddings multimodal de Google DeepMind, y se distribuye con licencia Apache 2.0. Su función no es generar texto, sino mapear consultas en lenguaje natural y pasajes legales a un espacio vectorial común para búsqueda semántica.

El problema que aborda es el desajuste semántico entre preguntas coloquiales (por ejemplo, "¿qué importe convierte un hurto en delito grave de primer grado?") y el lenguaje estatutario formal de los códigos legales. Los modelos de embeddings genéricos rinden por debajo en este dominio porque no capturan la terminología jurídica ni las remisiones entre secciones. Este ajuste fino busca cerrar esa brecha para que una consulta en inglés llano recupere el artículo RCW correcto.

El modelo conserva la arquitectura de EmbeddingGemma 2: 744.371.512 parámetros totales según los pesos en safetensors, un espacio de representación unificado de 768 dimensiones y capacidad multimodal heredada del modelo base (texto, imagen, vídeo y audio). Está pensado para ejecutarse en hardware de consumo, incluidos portátiles y dispositivos móviles, con baja latencia. El ajuste se realizó mediante LoRA y posteriormente se fusionó en un modelo completo de 16 bits.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (EmbeddingGemma 2), espacio vectorial unificado de 768 dimensiones; codificador de texto de 270M más codificadores modulares de visión (170M) y audio (300M) según la model card |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo principal en 16 bits (LoRA fusionado); variante GGUF de 4 bits (q4_k_m) publicada aparte |
| Idiomas soportados | Inglés (dominio jurídico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en el repositorio -GGUF |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2, un modelo de embeddings multimodal de Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, y combinaciones de ellos, en un único espacio vectorial de 768 dimensiones. La model card desglosa los 740M parámetros en un codificador de texto de 270M, un codificador de visión de 170M y un codificador de audio de 300M. La función de similitud es coseno y la tarea principal es feature-extraction con pipeline de sentence-transformers.

El ajuste fino se hizo con LoRA (Low-Rank Adaptation), técnica de ajuste eficiente en parámetros, y después se fusionó en un modelo completo de 16 bits para simplificar el despliegue. La función de pérdida indicada es MultipleNegativesRankingLoss, típica del entrenamiento de embeddings con pares positivos consulta-documento. El dataset de entrenamiento es CSI-lab/RCW_2025_Positive_Query_Pairs, compuesto por pares positivos de consulta y texto legal del RCW de Washington. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo fases adicionales de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información en el dominio jurídico de Washington (RCW).
- Recuperación de estatutos a partir de consultas en inglés llano, escenarios legales y borradores de documentos.
- Similitud semántica entre frases (sentence-similarity) con similitud coseno.
- Capacidad multimodal heredada del modelo base: texto, imagen, vídeo y audio en un espacio vectorial unificado, según la model card de EmbeddingGemma 2.
- Soporte de clasificación y clustering de documentos legales mediante representaciones vectoriales.
- Integración en pipelines de RAG (retrieval-augmented generation) para asistentes jurídicos.
- No soporta tool calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- Idiomas: únicamente inglés; no se declara soporte multilingüe.

## Casos de uso

- Búsqueda semántica de estatutos: indexar el corpus RCW como vectores de 768 dimensiones y recuperar los artículos relevantes para una consulta en lenguaje natural, resolviendo la brecha entre terminología coloquial y legalese.
- Asistentes jurídicos con RAG: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo con los artículos RCW pertinentes, reduciendo alucinaciones al anclar la respuesta en texto estatutario real.
- Análisis de preempción legal: la model card menciona esta tarea explícitamente; el modelo permite comparar borradores o normativas locales con el texto RCW para detectar conflictos o solapamientos semánticos.
- Clasificación de documentos legales: agrupar consultas, memorandos o expedientes por área temática calculando embeddings y aplicando clustering sobre las representaciones.
- Despliegue en dispositivo: al estar diseñado para hardware de consumo (portátiles, móviles), permite búsqueda jurídica offline o con baja latencia en aplicaciones de campo, sin depender de infraestructura cloud.
- Deduplicación y agrupación de consultas ciudadanas: en un servicio de atención legal, vectorizar consultas entrantes para detectar duplicados y enrutarlas al área correspondiente del código.
- Filtrado previo en pipelines de recuperación híbrida: combinar la recuperación densa de este modelo con búsqueda léxica (BM25) sobre el RCW para mejorar el recall en consultas con terminología estatutaria exacta.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto de validación CSI-lab/RCW_2025_Positive_Query_Pairs (tarea information-retrieval). No están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy@1 | 0,3994 |
| Accuracy@3 | 0,2595 |
| Accuracy@5 | 0,7156 |
| Accuracy@10 | 0,8789 |
| Precision@10 | 0,0879 |
| Recall@10 | 0,8789 |
| NDCG@10 | 0,6464 |
| MRR@10 | 0,5709 |
| MAP@100 | 0,5757 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de embeddings en el mismo conjunto.

## Requisitos de hardware

- VRAM estimada: el modelo completo en 16 bits ocupa aproximadamente 1,5 GB (tamaño del repositorio), por lo que la inferencia requiere del orden de 2 GB de VRAM o memoria unificada, más el espacio para los embeddings de la colección indexada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve; no requiere A100 ni H100. Una RTX 4090 o similar ofrece margen sobrado para lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en portátiles con GPU integrada o discreta de gama media.
- Variante GGUF de 4 bits (q4_k_m) publicada en CSI-lab/US-State-Law-EmbeddingGemma-2-GGUF, optimizada para CPU y despliegues con poca VRAM.
- Opciones de despliegue: transformers, sentence-transformers, llama.cpp/Ollama mediante la variante GGUF, y servidores de embeddings compatibles con el pipeline feature-extraction (el repositorio está marcado como endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica "low-latency" para hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| CSI-lab/US-State-Law-EmbeddingGemma-2 | 744M | No disponible | 768 | Apache 2.0 | Embeddings jurídicos (RCW de Washington), multimodal heredado |
| google/embeddinggemma-2 (base) | ~740M | No disponible | 768 | Apache 2.0 | Embeddings multimodales genéricos |
| CSI-lab/Washington-state-law-embedding-model-Large | No disponible | No disponible | 1024 | No disponible | Embeddings jurídicos (RCW), mayor dimensión |
| CSI-lab/Washington-state-law-embedding-model-Base | No disponible | No disponible | 768 | No disponible | Embeddings jurídicos (RCW) de la misma familia |

La comparativa de rendimiento frente a estos modelos no está disponible en la información proporcionada. La familia de CSI-lab ofrece alternativas de distinta dimensión (768 frente a 1024) y una variante GGUF cuantizada para despliegues con restricciones de memoria.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado exclusivamente al RCW del estado de Washington; su rendimiento fuera de ese corpus o en otras jurisdicciones no está evaluado.
- Solo inglés: no se declara soporte para otros idiomas, lo que limita su uso en contextos multilingües.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; el conjunto de validación es específico del proyecto y dificulta la comparación con otros modelos.
- Precision@10 baja (0,0879) pese al Recall@10 alto (0,8789): el modelo recupera el documento relevante entre los diez primeros con frecuencia, pero el ranking contiene muchos falsos positivos, lo que exige un reranking posterior en producción.
- Accuracy@3 (0,2595) inferior a Accuracy@1 (0,3994) sugiere un comportamiento de ranking no monótono en el conjunto de validación; conviene revisar la métrica antes de fijar umbrales.
- Riesgo de alucinación no aplica directamente (no genera texto), pero un recuperador impreciso puede inducir errores en el LLM que consuma sus resultados en un pipeline RAG.
- No sustituye asesoramiento jurídico: es una herramienta de recuperación, no de interpretación legal.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (google/embeddinggemma-2) y de los datos de entrenamiento del RCW.
- No se documentan sesgos específicos; al entrenar sobre un corpus jurídico de una jurisdicción concreta, puede reflejar sesgos presentes en la redacción estatutaria.
- Longitud de contexto no documentada: limita la indexación de documentos largos sin troceado previo.

## Enlaces

- HuggingFace: https://huggingface.co/CSI-lab/US-State-Law-EmbeddingGemma-2
- Variante GGUF: https://huggingface.co/CSI-lab/US-state-law-EmbeddingGemma-2-GGUF
- Variante Large (1024d): https://huggingface.co/CSI-lab/Washington-state-law-embedding-model-Large
- Variante Base (768d): https://huggingface.co/CSI-lab/Washington-state-law-embedding-model-Base
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- GitHub del laboratorio: https://github.com/ComplexSocialInteractionsLab
- Blog de lanzamiento: https://complexsocialinteractionslab.github.io/Initiatives/US_State_Law_EmbeddingGemma_2.html
- Documentación de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de entrenamiento: https://huggingface.co/datasets/CSI-lab/RCW_2025_Positive_Query_Pairs
- Paper de MultipleNegativesRankingLoss: https://arxiv.org/abs/1908.10084
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper referenciado (arXiv 2509.20354): https://arxiv.org/abs/2509.20354
