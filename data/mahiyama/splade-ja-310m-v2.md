# mahiyama/splade-ja-310m-v2

## Resumen

splade-ja-310m-v2 es un modelo de recuperación dispersa aprendida (SPLADE) para japonés, desarrollado por el usuario mahiyama y publicado en Hugging Face bajo licencia MIT. Se construye sobre el modelo base sbintuitions/modernbert-ja-310m, un transformer de tipo ModernBERT con 315,3 millones de parámetros, y añade una cabeza de pooling SPLADE que proyecta los logits del MLM sobre el vocabulario para producir embeddings dispersos de alta interpretabilidad.

El modelo resuelve el problema de la recuperación de información en japonés con índices invertidos: en lugar de vectores densos que requieren búsqueda por similitud aproximada, genera representaciones dispersas con solo decenas o cientos de dimensiones no nulas por frase, puntuables mediante producto escalar. Esto lo hace directamente compatible con motores como Elasticsearch, OpenSearch, Vespa o Qdrant, y permite inspeccionar qué tokens del vocabulario actúan como señales de recuperación.

Su relevancia actual radica en el entrenamiento por destilación desde un reranker (cl-nagoya/ruri-v3-reranker-310m) con minería de negativos duros, en dos fases: una primera de propósito general sobre unos 2,2 millones de filas y una segunda de ajuste corto en dominios específicos (FAQs gubernamentales, quizzes, artículos académicos y documentos largos). El contexto máximo de entrada es de 8.192 tokens, aunque el entrenamiento se realizó con 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fill-mask, ModernBERT) + SpladePooling (max) |
| Parametros totales | 315.304.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada máxima; entrenado con 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensiones de salida | 102.400 (tamaño de vocabulario) |
| Tokenizador | SentencePiece (vocabulario de ModernBERT-Ja) |
| Framework principal | sentence-transformers >= 5.4 (SparseEncoder) |
| Función de pérdida | destilación de reranker con CachedSpladeLoss (SparseDistillKLDivLoss) |
| Precisión mixta | bf16 |
| Modelo base | sbintuitions/modernbert-ja-310m |

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT-Ja en configuración fill-mask y reutiliza su cabeza MLM como proyección sobre la dimensión del vocabulario. La capa SpladePooling aplica un max pooling sobre los logits por dimensión de vocabulario, de modo que cada frase queda representada por un vector disperso donde cada dimensión corresponde a un token del vocabulario y su peso refleja la importancia de ese término como señal de recuperación. La similitud se calcula por producto escalar, no por coseno, y el mismo codificador se emplea para consultas y documentos (diseño simétrico).

El entrenamiento se organizó en dos fases. La fase 1 construyó una base SPLADE de propósito general mediante destilación por divergencia KL sobre un corpus multi-fuente de aproximadamente 2,2 millones de filas, con datasets como auto-wiki-qa (993.749 muestras, 704,83 M tokens), mqa-ja, mmarco-ja, miracl-retrieval, mrtydi, JaGovFaqs-22k, amagasaki-qna, quiz-works, quiz-no-mori, anlp-meeting-retrieval y mldr-retrieval. La fase 2 aplicó un ajuste corto sobre datos de dominio específico para mejorar la precisión sin degradar la representación general.

El pipeline de datos incluyó tres pasos: minería de negativos duros mediante búsqueda kNN con el modelo denso cl-nagoya/ruri-v3-310m (top 15 documentos por similitud coseno, excluyendo el positivo y filtrando por umbral de separación tras re-puntuar con el reranker), puntuación por destilación con cl-nagoya/ruri-v3-reranker-310m (logit crudo como etiqueta) y filtrado por quality_score para conservar solo filas con positivo fiable, sin falsos negativos y con margen negativo no excesivo.

## Capacidades

- Generación de embeddings dispersos para recuperación de información en japonés, con decenas o cientos de dimensiones no nulas por frase.
- Codificación simétrica de consultas y documentos mediante encode_query y encode_document.
- Puntuación por producto escalar, compatible con índices invertidos (Elasticsearch, OpenSearch, Vespa, Qdrant).
- Interpretabilidad directa: la función decode permite inspeccionar los tokens del vocabulario expandidos y sus pesos.
- Expansión de términos aprendida: el max pooling sobre logits del MLM activa términos relacionados no presentes literalmente en el texto.
- Extracción de características (pipeline feature-extraction) para pipelines de búsqueda y ranking.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es un codificador de recuperación, no un modelo generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Búsqueda empresarial sobre documentación interna: indexar manuales y políticas en Elasticsearch u OpenSearch usando los vectores dispersos como representación de términos, aprovechando la compatibilidad nativa con índices invertidos y la interpretabilidad para depurar resultados.
- Atención al cliente sobre FAQs gubernamentales: el ajuste de la fase 2 incluye JaGovFaqs-22k y amagasaki-qna, por lo que el modelo está especializado en emparejar preguntas ciudadanas con respuestas oficiales en japonés.
- Recuperación en dominio académico: el dataset anlp-meeting-retrieval y los documentos largos del entrenamiento lo hacen adecuado para buscar en actas de congresos y artículos, con contexto de hasta 8.192 tokens por documento.
- Sistemas de preguntas y respuestas sobre Wikipedia japonesa: la inclusión de auto-wiki-qa (casi un millón de muestras) permite construir un recuperador de pasajes para pipelines RAG en japonés.
- Búsqueda en corpus de quizzes y contenido educativo: los datasets quiz-works y quiz-no-mori aportan adaptación a preguntas de trivia y material docente.
- Recuperación en dominios legislativos y de documentos largos: mldr-retrieval entrena el modelo para documentos extensos, útil en búsqueda jurídica o administrativa.
- Como primera etapa de un pipeline de ranking: al ser un recuperador disperso rápido, puede alimentar un reranker (por ejemplo, ruri-v3-reranker-310m) en arquitecturas de dos etapas.
- Despliegue en infraestructura existente de motores de búsqueda: al producir vectores dispersos puntuables por dot product, se integra sin necesidad de una base de datos vectorial dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315,3 M parámetros, en bf16 el modelo ocupa aproximadamente 0,63 GB de pesos; en fp32, unos 1,26 GB. La memoria adicional depende del tamaño de lote y de la longitud de secuencia (hasta 8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en bf16 con lotes moderados; se recomiendan A100, H100 o L40S para indexación masiva a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, incluso con lotes grandes.
- Opciones de despliegue: sentence-transformers >= 5.4 con SparseEncoder; text-embeddings-inference (el modelo incluye la etiqueta text-embeddings-inference y endpoints_compatible); exportación a motores de índices invertidos como Elasticsearch, OpenSearch, Vespa o Qdrant.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahiyama/splade-ja-310m-v2 | 315,3 M | 8.192 tokens | SPLADE disperso | MIT | Hugging Face |
| cl-nagoya/ruri-v3-310m | 310 M (aprox.) | no disponible | Embedding denso | no disponible | Hugging Face |
| cl-nagoya/ruri-v3-reranker-310m | 310 M (aprox.) | no disponible | Reranker cross-encoder | no disponible | Hugging Face |
| sbintuitions/modernbert-ja-310m | 310 M (aprox.) | no disponible | ModernBERT base (fill-mask) | no disponible | Hugging Face |

La comparación con ruri-v3-310m es directa porque se usó como minero de negativos duros en el entrenamiento; ruri-v3-reranker-310m actuó como profesor en la destilación. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japonés; no debe esperarse calidad en otros idiomas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Aunque la entrada máxima es de 8.192 tokens, el entrenamiento se realizó con 1.024 tokens, por lo que el rendimiento en secuencias mucho más largas puede degradarse.
- Riesgo de sesgos heredados del corpus de entrenamiento (Wikipedia, FAQs gubernamentales, quizzes y artículos académicos), no evaluado en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero la expansión de términos puede activar tokens espurios en consultas ambiguas o muy cortas.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento y del modelo base sbintuitions/modernbert-ja-310m antes de un despliegue en producción.
- El modelo requiere sentence-transformers >= 5.4 para la clase SparseEncoder; versiones anteriores no son compatibles.
- La puntuación debe hacerse por producto escalar, no por similitud coseno; usar la métrica incorrecta altera el ranking.
- No se han publicado métricas de evaluación (nDCG, MRR, Recall) en la información disponible, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/splade-ja-310m-v2
- README en japonés: https://huggingface.co/mahiyama/splade-ja-310m-v2/blob/main/README_ja.md
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Modelo denso usado para minería de negativos: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Reranker profesor: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Dataset auto-wiki-qa: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Dataset mqa-ja: https://huggingface.co/datasets/mahiyama/mqa-ja
- Dataset mmarco-ja: https://huggingface.co/datasets/mahiyama/mmarco-ja
- Dataset miracl-retrieval: https://huggingface.co/datasets/mahiyama/miracl-retrieval
- Dataset mrtydi: https://huggingface.co/datasets/mahiyama/mrtydi
- Dataset JaGovFaqs-22k: https://huggingface.co/datasets/mahiyama/JaGovFaqs-22k
- Dataset amagasaki-qna: https://huggingface.co/datasets/mahiyama/amagasaki-qna
- Dataset quiz-works: https://huggingface.co/datasets/mahiyama/quiz-works
- Dataset quiz-no-mori: https://huggingface.co/datasets/mahiyama/quiz-no-mori
- Dataset anlp-meeting-retrieval: https://huggingface.co/datasets/mahiyama/anlp-meeting-retrieval
- Dataset mldr-retrieval: https://huggingface.co/datasets/mahiyama/mldr-retrieval
- Dataset Mintaka (mencionado en la búsqueda web): https://huggingface.co/datasets/AmazonScience/mintaka
