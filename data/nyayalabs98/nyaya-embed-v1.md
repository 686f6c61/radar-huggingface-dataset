# NyayaLabs98/nyaya-embed-v1

## Resumen

Nyaya-embed-v1 es un modelo de embeddings bi-encoder desarrollado por NyayaLabs98 para recuperar secciones de legislación india vigente. Se obtiene a partir de un ajuste fino de `intfloat/multilingual-e5-base` (278 millones de parámetros, licencia MIT) sobre un conjunto propio de pares pregunta-sección legal, con el objetivo de que una consulta en inglés, hindi o hinglish encuentre la sección correcta de la ley. El modelo se usa como parte densa de un retriever híbrido que combina BM25 y búsqueda densa con fusión por rango recíproco (RRF), dentro del sistema de orientación legal Nyaya.

La arquitectura es un transformer encoder bi-encoder, basado en el checkpoint multilingüe e5-base. El ajuste fino se realizó con 4.412 pares (pregunta, sección dorada) y 20 negativos duros por par, usando la pérdida MultipleNegativesRankingLoss. El modelo está pensado para tareas de recuperación legislativa y similitud semántica, y se distribuye en formato safetensors. Su relevancia radica en mejorar el recall de la recuperación de artículos legales en sistemas RAG para el dominio jurídico indio, donde los modelos genéricos de embeddings no consiguen alinear bien las preguntas de ciudadanos con las secciones de los códigos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (basado en XLM-RoBERTa, via intfloat/multilingual-e5-base) |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, hindi, hinglish (en, hi) |
| Licencia | MIT |
| Formato de pesos | Safetensors (via sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder derivado de `intfloat/multilingual-e5-base`, un modelo de embeddings multilingüe que a su vez se basa en la arquitectura XLM-RoBERTa. Se compone de un encoder que produce vectores normalizados para preguntas y pasajes. La entrada se formatea siguiendo la convención de e5: las consultas van precedidas por `query: ` y los documentos por `passage: `. El modelo está pensado para funcionar junto a un índice BM25 en un sistema híbrido con fusión RRF.

El entrenamiento se realizó con 4.412 pares (pregunta, sección dorada) extraídos de las preguntas de entrenamiento del proyecto Nyaya-Train-v3. Cada par se enriquecíó con 20 negativos duros obtenidos mediante BM25. Se reservaron 300 pares para validación. Se usó la pérdida MultipleNegativesRankingLoss con negativos in-batch, tamaño de lote de 32, 1 época, tasa de aprendizaje 2e-5, warm-up del 5% y precisión fp16, en una GPU T4 de Kaggle (132 segundos de entrenamiento). Todas las preguntas del conjunto de evaluación Eval-v1 se excluyeron antes de generar los pares para evitar fugas de datos.

## Capacidades

- Recuperación de secciones de estatutos legales indios a partir de preguntas en lenguaje natural, incluyendo consultas en inglés, hindi y hinglish.
- Generación de embeddings normalizados para similitud semántica y recuperación densa.
- Uso como componente de un retriever híbrido con BM25 y fusión RRF, mejorando el recall conjunto frente a BM25 solo.
- Compatibilidad con la librería sentence-transformers para la codificación de consultas y pasajes con los prefijos `query:` y `passage:`.
- Integración en pipelines de RAG para sistemas de asistencia legal, como el sistema Nyaya.
- Soporte para despliegue en servicios de inferencia de embeddings compatibles con Hugging Face (text-embeddings-inference).

## Casos de uso

- Asistencia jurídica ciudadana: el modelo puede responder a preguntas como «la policía no quiere registrar el FIR, ¿qué puedo hacer?» emparejando la consulta con el artículo correcto del Bharatiya Nagarik Suraksha Sanhita, 2023. Al estar afinado sobre preguntas de ciudadanos en inglés, hindi o hinglish, resulta adecuado para chatbots de orientación legal.
- Recuperación de artículos en sistemas RAG para despachos de abogados: puede servir como etapa densa de un retriever que indexa una base de datos legislativa, permitiendo que los abogados localicen rápidamente la sección aplicable a un caso concreto.
- Búsqueda híbrida en corpus legal indio: combinado con BM25, el modelo mejora el recall@8 en la recuperación de secciones de los códigos BNS, BNSS y BSA, lo que reduce el número de pasajes que un LLM lector debe procesar.
- Construcción de índices semánticos para investigación jurídica: permite indexar textos legales en múltiples idiomas (inglés, hindi, hinglish) y consultarlos mediante preguntas en lenguaje natural.
- Automatización de la identificación de normativa aplicable en servicios de legaltech: el modelo puede clasificar consultas de usuario y sugerir las secciones pertinentes antes de que intervenga un abogado.
- Evaluación y mejora de retrievers en dominios especializados: sirve como referencia para comparar estrategias de recuperación densa sobre legislación india, gracias a sus métricas documentadas de recall sobre el conjunto Nyaya-Eval-v1.

## Benchmarks y rendimiento

El autor ha publicado resultados de evaluación sobre el conjunto Nyaya-Eval-v1, en la tarea de recuperación de secciones de estatutos usando un sistema híbrido BM25 + denso con RRF. Los datos declarados en la model card son los siguientes:

| Retriever | recall@1 | recall@3 | recall@5 | recall@8 |
|---|---:|---:|---:|---:|
| BM25 solo (sinónimos, resolución de citas) | 45,8% | 61,0% | 74,6% | 81,4% |
| BM25 + zero-shot e5-base, RRF | Peor que BM25 solo en todos los k | | | |
| BM25 + nyaya-embed-v1, RRF | 49,2% | 73,7% | 78,0% | 88,1% |
| BM25 + bge-reranker-v2-m3 (cross-encoder, depth 20) | 58,5% | 69,5% | 74,6% | 83,9% |

El modelo-index oficial de HuggingFace declara para `nyaya-embed-v1` un recall@1 de 49,2 y un recall@8 de 88,1 en la misma tarea. Además, la model card reporta el efecto sobre un lector Qwen2.5-3B-Instruct con 768 tokens y k=8: el recall de hechos pasa del 35,8% al 39,7%, con un intervalo de confianza del 95% de [+0,9, +7,0] puntos. Con un lector Qwen3-4B-Instruct-2507 la mejora es de +1,4 puntos, con intervalo [−1,5, +4,4], por lo que la ganancia queda establecida solo para el lector de 3B. Los resultados por idioma en @8 son: inglés 84,2% (n=139), hindi 80,0% (n=5) y hinglish 50,0% (n=6), con muestras demasiado pequeñas para las dos últimas.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 1,1 GB, lo que corresponde a pesos en formato FP32. En FP16 el peso estimado es de unos 0,56 GB.
- La inferencia es ligera: 278 millones de parámetros permiten ejecutarla en una GPU de consumo como una RTX 3060 o incluso en una T4 de Kaggle, que fue la GPU usada durante el entrenamiento.
- Puede ejecutarse en CPU con sentence-transformers sin problemas, ya que no es un modelo generativo.
- Compatible con despliegue mediante sentence-transformers en Python y con servidores de inferencia de embeddings de Hugging Face (text-embeddings-inference).
- En sistemas de producción con alto volumen de consultas se recomienda un servidor de embeddings con optimización de carga, como TEI, que aproveche los pesos safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Tipo | Licencia | Rendimiento en tarea |
|---|---|---:|---|---|---|
| nyaya-embed-v1 | 278M | No disponible | Bi-encoder | MIT | recall@8 88,1% (hybrid RRF) |
| intfloat/multilingual-e5-base (zero-shot) | 278M | No disponible | Bi-encoder | MIT | Peor que BM25 solo en la tarea, con RRF |
| bge-reranker-v2-m3 | 568M | No disponible | Cross-encoder | No disponible | recall@8 83,9% (con BM25, depth 20) |
| BM25 solo | — | — | Lexical | — | recall@8 81,4% |

La comparación se basa en los datos publicados por el autor del modelo en la model card. Nyaya-embed-v1 supera el recall@8 de BM25 solo y del cross-encoder bge-reranker-v2-m3, y mejora claramente al modelo base e5-base en la configuración híbrida. No se dispone de datos de contexto para ninguno de los modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó únicamente sobre preguntas relativas a 27 leyes y la Constitución india. Las secciones que no estén presentes en la base de datos de estatutos `NyayaLabs98/nyaya-statute-db` no están representadas y pueden dar lugar a recuperaciones incorrectas.
- El conjunto de pares de entrenamiento es pequeño (4.412 pares). La ganancia sobre BM25 es real en recall@3 y recall@8, pero en recall@1 se encuentra dentro del ruido estadístico de la muestra (n=118).
- Las muestras de evaluación en hindi (n=5) y hinglish (n=6) son demasiado pequeñas para extraer conclusiones fiables sobre el rendimiento en esos idiomas.
- No es un modelo generativo, por lo que no puede producir respuestas ni mantener conversaciones. Solo genera embeddings.
- El modelo debe usarse con los prefijos `query:` y `passage:` tal como se hizo durante el entrenamiento; omitirlos degrada el rendimiento.
- El autor advierte explícitamente que no se trata de asesoramiento legal. La interpretación de las secciones recuperadas requiere un abogado colegiado.
- No se ha proporcionado información sobre sesgos potenciales o riesgos de alucinación más allá de las limitaciones de cobertura del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NyayaLabs98/nyaya-embed-v1
- Dataset de estatutos legales: https://huggingface.co/datasets/NyayaLabs98/nyaya-statute-db
- Repositorio del sistema Nyaya: https://github.com/JitendraJha98/nyaya-model
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Model card original: https://huggingface.co/NyayaLabs98/nyaya-embed-v1/raw/main/README.md
