# nebhailema/afrixir-splade-mini-mnrl

## Resumen

AfriXIR SPLADE mini MNRL es un codificador disperso (sparse encoder) de tipo SPLADE para recuperación de pasajes (passage retrieval) en ocho lenguas africanas. Lo desarrolla el usuario nebhailema y se afina a partir del modelo base Davlan/afro-xlmr-mini, un XLM-RoBERTa mini preentrenado específicamente para lenguas africanas. El modelo resuelve el problema de la búsqueda léxica y semántica en idiomas con recursos limitados, donde los sistemas de recuperación estándar (basados en BM25 o en codificadores densos entrenados solo en inglés) rinden de forma deficiente.

Técnicamente es un SparseEncoder de la librería sentence-transformers: un transformer XLM-RoBERTa con cabeza de enmascaramiento (fill-mask) seguido de una capa SpladePooling con estrategia max, activación ReLU y dimensión de salida de 250.002. El modelo tiene 117.891.474 parámetros y una longitud máxima de secuencia de 512 tokens. La similitud se calcula por producto escalar sobre vectores dispersos, lo que permite indexar con motores invertidos clásicos y combinar las ventajas de la búsqueda léxica con la expansión de términos aprendida.

Su relevancia actual radica en que cubre una franja de idiomas poco atendida (amárico, hausa, oromo, shona, somalí, suajili, tigriña y yoruba) con una licencia permisiva Apache 2.0 y un tamaño lo bastante reducido como para desplegarse en infraestructura modesta. El modelo se entrenó sobre el dataset AfriXIR (112.864 ejemplos) y emplea tres funciones de pérdida combinadas: CachedSpladeLoss, SparseMultipleNegativesRankingLoss y FlopsLoss, esta última para controlar la dispersión de las representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseEncoder: XLM-RoBERTa (XLMRobertaForMaskedLM) + SpladePooling (max, ReLU) |
| Parametros totales | 117.891.474 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, yo, zu (amárico, hausa, oromo, shona, somalí, suajili, yoruba, zulú) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de salida | 250.002 (espacio disperso) |
| Funcion de similitud | producto escalar (dot product) |
| Modelo base | Davlan/afro-xlmr-mini |
| Libreria | sentence-transformers |
| Tamano del repositorio | 1.0 GB |
| Dataset de entrenamiento | nebhailema/AfriXIR (112.864 ejemplos) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE estándar: un transformer encoder XLM-RoBERTa configurado con tarea de fill-mask produce embeddings por token, y una capa SpladePooling aplica un max-pooling sobre la dimensión del vocabulario con activación ReLU. El resultado es un vector disperso de 250.002 dimensiones en el que cada componente distinta de cero corresponde a un término del vocabulario, ponderado por el modelo. Esto permite la expansión de términos aprendida (document expansion y query expansion) sin renunciar a la eficiencia de los índices invertidos.

El afinamiento se realizó sobre el dataset AfriXIR con 112.864 ejemplos y combina tres pérdidas: CachedSpladeLoss, que optimiza la recuperación dispersa con caché de representaciones; SparseMultipleNegativesRankingLoss, una variante de contrastive learning con negativos en el lote adaptada a vectores dispersos; y FlopsLoss, que penaliza la densidad de las representaciones para mantener un número de términos activos bajo y, con ello, un coste de indexación y búsqueda controlado. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del corpus ni si hubo fases de RLHF o DPO (no aplicables, en principio, a un modelo de recuperación).

## Capacidades

- Recuperación de pasajes (passage retrieval) en ocho lenguas africanas mediante representaciones dispersas.
- Generación de embeddings dispersos de 250.002 dimensiones con similitud por producto escalar.
- Expansión de términos aprendida: el modelo pondera términos del vocabulario que no aparecen literalmente en el texto.
- Codificación de consultas y de documentos con la misma arquitectura, apta para indexación invertida.
- Soporte multilingüe dentro del conjunto de lenguas africanas entrenadas (am, ha, om, sn, so, sw, yo, zu).
- Integración nativa con sentence-transformers mediante la clase SparseEncoder.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio: es un modelo exclusivamente de representación de texto.

## Casos de uso

- Motor de búsqueda documental en suajili: el modelo indexa pasajes de corpus periodísticos o administrativos en suajili y responde a consultas con recuperación dispersa; su recall@10 de 0,8317 en suajili lo hace adecuado para primeras fases de ranking en buscadores locales.
- Búsqueda en archivos multilinguales africanos: una organización con documentación en hausa, yoruba y amárico puede construir un índice único con este modelo y consultar en cualquiera de las lenguas cubiertas, aprovechando la expansión de términos para superar variantes ortográficas.
- Recuperación aumentada (RAG) para asistentes en lenguas africanas: se usa como retriever en un pipeline RAG donde el generador responde en suajili o hausa; la salida dispersa se almacena en un índice invertido (por ejemplo, con PISA o Lucene) y se recuperan los pasajes más relevantes antes de la generación.
- Filtrado previo en pipelines de moderación o clasificación: al ser un codificador de 117,9 millones de parámetros, puede generar embeddings de grandes volúmenes de texto en CPU o GPU modesta y servir como primera etapa de recuperación antes de un reranker más costoso.
- Búsqueda en colecciones de noticias y Wikipedia en lenguas africanas: el modelo se entrenó sobre AfriXIR, un corpus de recuperación multilingüe, por lo que es directamente aplicable a la búsqueda de artículos enciclopédicos y noticias en somalí, oromo o shona.
- Sistemas de preguntas y respuestas extractivas: combinado con un lector (reader) extractivo, el retriever disperso localiza pasajes candidatos en amárico o tigriña y reduce el espacio de búsqueda del componente generativo.
- Deduplicación y clustering de documentos: los vectores dispersos permiten calcular similitudes por producto escalar entre documentos de un mismo idioma para agrupar noticias duplicadas o detectar paráfrasis en corpus de bajo recurso.

## Benchmarks y rendimiento

Evaluación de recuperación de pasajes sobre el corpus completo de AfriXIR. La columna `avg` es la media ponderada por consultas entre las ocho lenguas. Las filas de reranker reordenan los 50 mejores pasajes de un retriever denso congelado.

### recall@5

| Modelo | amárico | hausa | oromo | shona | somalí | suajili | tigriña | yoruba | avg |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| SPLADE mini | 0.7759 | **0.7446** | **0.7603** | **0.7405** | **0.7705** | **0.7546** | 0.8163 | **0.6657** | **0.7599** |
| M3 sparse | **0.7826** | 0.7356 | 0.7593 | 0.7189 | 0.7627 | 0.7463 | **0.8367** | 0.6536 | 0.7598 |

### recall@10

| Modelo | amárico | hausa | oromo | shona | somalí | suajili | tigriña | yoruba | avg |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| SPLADE mini | **0.8293** | 0.7924 | 0.8115 | **0.8162** | **0.8425** | **0.8317** | **0.8776** | **0.7440** | **0.8192** |
| M3 sparse | 0.8279 | **0.8087** | **0.8137** | 0.8000 | 0.8256 | 0.8107 | **0.8776** | 0.7169 | 0.8138 |

### nDCG@10

| Modelo | amárico | hausa | oromo | shona | somalí | suajili | tigriña | yoruba | avg |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| SPLADE mini | 0.6816 | 0.6213 | 0.6629 | **0.6763** | 0.6768 | 0.6579 | 0.7696 | **0.5729** | 0.6633 |
| M3 sparse | **0.6987** | **0.6469** | **0.6776** | 0.6599 | **0.6835** | no disponible | no disponible | no disponible | no disponible |

Los datos de MRR@10 no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (117,9 millones de parámetros), más memoria para activaciones; en la práctica, menos de 1,5 GB para lotes pequeños con secuencias de 512 tokens.
- En fp16 o bf16, los pesos ocupan alrededor de 0,24 GB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100; el modelo es lo bastante pequeño como para que la GPU no sea el cuello de botella en la mayoría de despliegues.
- Cabe en GPU de consumo y también en CPU para indexación por lotes, aunque con menor throughput.
- Opciones de despliegue: sentence-transformers (clase SparseEncoder), text-embeddings-inference (tag `text-embeddings-inference` en el repositorio) y endpoints compatibles. No se documenta soporte para llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento (avg recall@10) |
| --- | --- | --- | --- | --- | --- |
| AfriXIR SPLADE mini MNRL | 117,9 M | 512 | Sparse (SPLADE) | Apache 2.0 | 0,8192 |
| AfriXIR Afro-XLM-R mini M3 | no disponible | no disponible | Sparse (M3) | no disponible | 0,8138 |
| BM25 multilingüe | no aplica | no aplica | Léxico | según implementación | no disponible en la información |
| Codificadores densos multilingües (p. ej., multilingual-e5) | no disponible | no disponible | Denso | según modelo | no disponible en la información |

La comparación directa disponible se limita al modelo M3 sparse del mismo autor, entrenado sobre el mismo dataset. SPLADE mini obtiene una media de recall@10 de 0,8192 frente a 0,8138 de M3 sparse, y una media de recall@5 de 0,7599 frente a 0,7598. En nDCG@10, SPLADE mini logra 0,6633 de media, mientras que los datos completos de M3 sparse no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo se ha entrenado y evaluado en ocho lenguas africanas; su rendimiento en castellano, inglés u otras lenguas no está documentado y probablemente sea deficiente.
- Longitud máxima de 512 tokens: los documentos más largos deben dividirse en pasajes, lo que puede fragmentar el contexto necesario para responder consultas complejas.
- Riesgo de sesgo derivado del corpus AfriXIR: la composición del dataset no está detallada en la información disponible, por lo que no puede evaluarse el equilibrio temático ni la representación de variedades dialectales.
- Expansión de términos sujeta a error: la expansión aprendida puede introducir términos espurios en dominios muy alejados del corpus de entrenamiento, degradando la precisión.
- Modelo de recuperación, no generativo: no produce texto, no razona y no admite instrucciones; cualquier uso generativo requiere un modelo adicional.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución; no se documentan restricciones adicionales.
- Número de descargas muy bajo (2 en el momento de la consulta) y ausencia de validación por terceros: conviene evaluar el modelo en el corpus propio antes de llevarlo a producción.
- No se documentan resultados de MRR@10 completos ni comparaciones con recuperadores densos o léxicos de referencia, lo que limita la evaluación de su ventaja real frente a BM25 en cada lengua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-splade-mini-mnrl
- Dataset AfriXIR: https://huggingface.co/datasets/nebhailema/AfriXIR
- Modelo base Davlan/afro-xlmr-mini: https://huggingface.co/Davlan/afro-xlmr-mini
- Modelo comparable M3 sparse: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini-m3
- Documentación de sentence-transformers: https://sbert.net
- Documentación de sparse encoders: https://www.sbert.net/docs/sparse_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Sparse encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=sparse-encoder
- Paper SPLADE (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper SPLADE v2 (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de entrenamiento con negativos (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
- Paper de XLM-R (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
