# mahiyama/Sazanami-ColBERT-310m

## Resumen

Sazanami-ColBERT-310m es un modelo de recuperación de información en japonés basado en interacción tardía (*late interaction*), desarrollado por Masayuki Hiyama (usuario `mahiyama` en HuggingFace). Convierte consultas y documentos en secuencias de vectores por token y calcula la similitud mediante MaxSim, en lugar de comprimir cada documento en un único vector. Esto permite que un fragmento concreto de un documento largo coincida con la consulta sin diluirse en una media global.

El modelo parte de `sbintuitions/modernbert-ja-310m`, un encoder ModernBERT preentrenado en japonés con posición máxima de 8.192 tokens, al que se añade una proyección lineal por token de 768 a 128 dimensiones sin sesgo. Cuenta con 314.611.968 parámetros (unos 315 M, de los que 98.304 pertenecen a la capa de proyección) y genera 128 dimensiones por token. La longitud de entrada por defecto es de 256 tokens para la consulta y 1.024 para el documento, con un límite de 8.192.

Forma parte de una familia de cuatro modelos entrenados sobre la misma base y los mismos datos, que se diferencian solo en cuántos vectores se emplean para representar cada documento. Esta variante es la que no comprime la representación documental y, según el autor, ofrece la mayor precisión de las cuatro para buscar entre muchos candidatos con documentos largos. La licencia es MIT y el modelo está pensado para su uso con `sentence-transformers` 6.0.0 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ModernBERT-Ja) con proyección lineal por token 768 → 128 sin sesgo, exclusión de posiciones de relleno y normalización L2 por token |
| Parámetros totales | 314.611.968 (unos 315 M; 98.304 en la capa de proyección) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de máximo posicional; entradas recomendadas por defecto: 256 tokens (consulta) y 1.024 tokens (documento) |
| Tipos de cuantización | No documentados por el autor; los pesos se distribuyen en safetensors. No se han publicado versiones GGUF ni cuantizadas |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 1,3 GB) |
| Dimensión del vector | 128 por token |
| Vectores por documento | Igual al número de tokens válidos (media de 100,5 en JaGovFaqs-22k y de 741,4 en Jaqket) |
| Función de puntuación | MaxSim: suma, sobre cada token de la consulta, de la similitud máxima con los tokens del documento |
| Prefijos | `検索クエリ: ` en la consulta y `検索文書: ` en el documento (almacenados en el modelo) |
| Tokenizador | SentencePiece (vocabulario de ModernBERT-Ja, sin modificaciones) |
| Framework principal | `sentence-transformers` 6.0.0 o superior, clase `MultiVectorEncoder` |
| Precisión de entrenamiento | bf16 |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT de 315 M de parámetros, preentrenado en japonés mediante objetivos de relleno de huecos (*masked language modeling*) sin ningún ajuste orientado a recuperación. Al cargar el modelo se elimina la capa de *pooling* y se añade una proyección lineal independiente por token de 768 a 128 dimensiones sin sesgo, seguida de la eliminación de las posiciones de relleno y de una normalización L2 por token. La capa de proyección se inicializa desde cero. La puntuación se calcula con MaxSim, lo que permite precalcular las representaciones de los documentos en índices y ejecutar solo la parte de la consulta en tiempo de búsqueda.

El entrenamiento siguió el enfoque de destilación de ColBERTv2 (Santhanam et al., 2022), con dos diferencias explícitas respecto a la implementación del artículo original de ColBERT (Khattab y Zaharia, 2020): no se rellena la consulta con tokens `[MASK]` hasta una longitud fija, y no se excluyen los signos de puntuación del cálculo de similitud. Los datos suman 379.029 ejemplos, combinando 251.456 tuplas n (*n-tuples*: 1 consulta, 1 positivo y 5 negativos) y 36.571 pares (consulta y positivo). Las fuentes principales son `auto-wiki-qa` (100.000), `mqa-ja` (100.000), `mmarco-ja` (50.000), un corpus privado `civicqa-ja` (43.382 + 28.653), `quiz-no-mori` (13.422), `quiz-works` (12.502), `amagasaki-qna` (11.069 + 7.323), `miracl-retrieval` (4.603), `mrtydi` (3.602), `anlp-meeting-retrieval` (1.926 + 1.952) y `kosodate-faq-pairs-ja` (595).

La función de pérdida es una combinación en un único cálculo de dos términos: una pérdida contrastiva (entropía cruzada sobre todos los documentos del lote, incluidos los negativos en lote) y una pérdida de destilación (divergencia KL entre la distribución MaxSim sobre los 6 candidatos propios y la distribución de las puntuaciones del profesor, con temperatura 2,0 en el profesor y 1,0 en el estudiante). Los pares usan solo la pérdida contrastiva con negativos en lote. La tasa de aprendizaje del transformer es 2e-5; el resto de hiperparámetros no está disponible en la información proporcionada. El conjunto de evaluación JaGovFaqs-22k se excluyó por completo del entrenamiento, incluso eliminando filas cuya consulta o positivo coincidiesen, tras normalización NFKC y eliminación de espacios, con el split de evaluación.

## Capacidades

- Recuperación de pasajes en japonés mediante representaciones multi-vector con puntuación MaxSim.
- Codificación asimétrica de consultas y documentos, con prefijos distintos y precalculables por separado.
- Manejo de documentos largos: hasta 8.192 tokens, sin truncado forzoso en la ventana por defecto de 1.024.
- Coincidencia local precisa: al no comprimir el documento en un solo vector, conserva la señal de fragmentos concretos relevantes dentro de textos largos.
- Extracción de características (`feature-extraction`): genera secuencias de vectores, no texto.
- Compatibilidad declarada con *text embeddings inference* (TEI) y con endpoints de HuggingFace.
- Compatibilidad con el ecosistema `sentence-transformers` mediante `MultiVectorEncoder` (`encode_query`, `encode_document`, `similarity`).
- Indexación y búsqueda a gran escala con los mecanismos habituales de ColBERT (PLAID), no documentada explícitamente en la model card.
- No soporta generación de texto, *tool calling*, razonamiento multi-paso ni agentes: es exclusivamente un encoder de recuperación.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en japonés.

## Casos de uso

- Búsqueda en FAQ y trámites de administraciones públicas japonesas: el corpus de entrenamiento incluye `civicqa-ja`, `amagasaki-qna` y `kosodate-faq-pairs-ja`, y la evaluación se hizo sobre JaGovFaqs-22k sin contaminación. Adecuado para responder consultas ciudadanas sobre residencia, seguros o servicios municipales.
- Recuperación aumentada por generación (RAG) en japonés: el modelo actúa como recuperador delante de un LLM generativo, aportando pasajes relevantes con representaciones de 128 dimensiones por token precalculables, lo que permite servir consultas en milisegundos sin reindexar.
- Búsqueda sobre documentación técnica o normativa extensa: gracias al límite de 8.192 tokens posicionales, permite indexar artículos legales o manuales completos sin trocear artificialmente y mantiene la coincidencia a nivel de fragmento.
- Recuperación en actas de reuniones: el autor incluyó `anlp-meeting-retrieval` en dos variantes (título-resumen y título-introducción), un escenario donde la coincidencia exacta con pasajes breves dentro de transcripciones largas es crítica.
- Preguntas y respuestas sobre colecciones tipo concurso o enciclopedia: los conjuntos `quiz-works`, `quiz-no-mori` y `auto-wiki-qa` reflejan este uso, útil para buscadores temáticos donde las consultas son cortas y ambiguas.
- Reranking de una lista corta de candidatos: puede usarse como segunda etapa sobre resultados de un recuperador léxico (BM25 o similar) para reordenar con puntuación MaxSim por token, ya que la codificación de documentos es reutilizable.
- Búsqueda de evidencia en evaluación de sistemas (MIRACL, Mr. Tydi): las porciones japonesas de estos conjuntos forman parte del entrenamiento, por lo que el modelo está alineado con las convenciones de esos benchmarks, aunque no se han publicado resultados sobre ellos.
- Sistemas internos de soporte y atención al cliente en japonés con base de conocimiento propia, aprovechando que las representaciones documentales viven en un índice y las consultas nuevas no requieren pasar por el encoder de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona que JaGovFaqs-22k se reservó íntegramente como conjunto de evaluación y que se aplicaron filtros de solapamiento (normalización NFKC y eliminación de espacios) en cada etapa del *pipeline* de datos, pero no se incluyen métricas (nDCG, MRR, Recall@k) para ese ni para ningún otro conjunto. Tampoco hay comparaciones numéricas con los tres modelos hermanos (`Sazanami-AGC-310m`, `Sazanami-MetaEmbed-310m`, `Sazanami-Embed-310m`), más allá de la afirmación cualitativa de que esta variante es la de mayor precisión de las cuatro para documentos largos y muchos candidatos.

## Requisitos de hardware

- Pesos del modelo: aproximadamente 1,26 GB en fp32, 630 MB en bf16/fp16, 315 MB en int8 y 157 MB en int4 (estimación a partir de los 314.611.968 parámetros).
- VRAM para inferencia: con un lote pequeño y 1.024 tokens por documento, los pesos dominan; un ajuste práctico es 1,5-2 GB en bf16 contando activaciones, y 3-4 GB en fp32.
- Cabe en GPU de consumo: sí. Cualquier tarjeta con 6 GB o más (RTX 3060, RTX 4060, RTX 2070) es suficiente para el modelo. El cuello de botella real no es la VRAM del encoder, sino la memoria necesaria para el índice multi-vector.
- Índice documental: cada vector ocupa 512 bytes en fp32, 256 en fp16 y 128 en int8 (128 dimensiones). Un millón de documentos con una media de 100,5 vectores (perfil JaGovFaqs-22k) requiere unos 51,4 GB en fp32, 25,7 GB en fp16 o 12,9 GB en int8. Con documentos largos al estilo Jaqket (741,4 vectores por documento de media) el índice crece aproximadamente 7,4 veces, hasta cientos de GB por millón de documentos.
- GPU recomendadas para indexación a gran escala: A100 40/80 GB, H100 80 GB o L40S 48 GB, donde el índice puede residir en memoria de dispositivo. Para lotes pequeños, una RTX 4090 o RTX 3090 con 24 GB resulta suficiente.
- Opciones de despliegue: `sentence-transformers` 6.0.0 o superior con `MultiVectorEncoder`; *text embeddings inference* (etiqueta declarada en el repositorio) y endpoints compatibles de HuggingFace. Para indexación y búsqueda a escala se emplearían los mecanismos estándar de ColBERT (índice PLAID), aunque la model card no los documenta explícitamente.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por consulta, throughput de indexación ni comparativas de velocidad frente a las variantes comprimidas.

## Comparativa con modelos similares

Los cuatro modelos de la familia Sazanami comparten base (`sbintuitions/modernbert-ja-310m`), datos de entrenamiento y, según el autor, condiciones idénticas. Solo cambia el número de vectores por documento.

| Modelo | Vectores por documento | Dimensión | Cuándo elegirlo |
|---|---|---|---|
| Sazanami-ColBERT-310m (este modelo) | Igual al número de tokens válidos (media de 100,5 en JaGovFaqs-22k; 741,4 en Jaqket) | 128 | Mayor precisión al buscar documentos largos entre muchos candidatos |
| Sazanami-AGC-310m | Máximo 32 | No disponible | Cuando hay que limitar el volumen de datos |
| Sazanami-MetaEmbed-310m | Máximo 64, reducible en tiempo de uso | No disponible | Cuando se prioriza velocidad de cálculo de similitud |
| Sazanami-Embed-310m | 1 | 768 | Cuando se busca minimizar datos y cómputo; representación de vector único |

Frente a la implementación original de ColBERT, este modelo se diferencia en dos decisiones técnicas documentadas: no rellena la consulta con tokens `[MASK]` y no excluye los signos de puntuación del cálculo de similitud. Esto puede afectar a la compatibilidad con herramientas que asumen el comportamiento clásico de ColBERT.

No se dispone de datos publicados para comparar con alternativas de otros autores (por ejemplo, ColBERTv2 multilingüe, BGE-M3 en modo multi-vector o Jina-ColBERT) en japonés: parámetros, contexto, licencia y resultados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo japonés. El tokenizador usa el vocabulario de ModernBERT-Ja y no hay evaluación en otras lenguas; el rendimiento en textos mixtos japonés-inglés es desconocido.
- No es un modelo generativo: no produce texto ni admite *tool calling*, agentes o razonamiento multi-paso. Cualquier producto final necesita un LLM generativo aparte.
- Riesgo de falsos positivos: MaxSim puntúa por máximo local, de modo que un único token coincidente puede elevar la puntuación de un documento irrelevante. No se han publicado métricas de precisión que permitan acotar este riesgo.
- Consumo de almacenamiento: al no comprimir documentos, el índice es entre 8 y 64 veces mayor que el de las variantes AGC o MetaEmbed y hasta cientos de veces mayor que el de un modelo de vector único. Esto puede ser prohibitivo en despliegues con restricciones de memoria.
- Reproducibilidad parcial: el corpus `mahiyama/civicqa-ja` (43.382 tuplas n y 28.653 pares, en torno al 19 % de los datos de entrenamiento) es privado, por lo que el entrenamiento no es reproducible de forma completa con los recursos públicos.
- Hiperparámetros incompletos: solo se documenta la tasa de aprendizaje del transformer (2e-5); el resto de la configuración de entrenamiento aparece truncado en la model card.
- Sin benchmarks publicados: no hay métricas verificables de recuperación, lo que obliga a evaluar el modelo en el dominio propio antes de llevarlo a producción.
- Licencia MIT: permite uso comercial, redistribución y modificación, siempre que se conserve el aviso de copyright y la licencia. No hay cláusulas de uso aceptable adicionales en la información disponible. Conviene verificar, en cualquier caso, las condiciones de los corpus de entrenamiento subyacentes.
- Adopción nula: el repositorio registra 0 descargas y 0 *likes*, y fue creado el 3 de octubre de 2026. Es un modelo reciente y sin validación independiente conocida.
- Compatibilidad: requiere `sentence-transformers` 6.0.0 o superior por el uso de `MultiVectorEncoder`; versiones anteriores no cargarán el modelo correctamente. Los prefijos ya están almacenados en el modelo y no deben añadirse manualmente a los textos.
- Preprocesado de consultas: la ausencia de relleno con `[MASK]` y de filtrado de puntuación implica que los resultados pueden diferir de los de implementaciones ColBERT estándar; hay que fijar un único *pipeline* de preprocesado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahiyama/Sazanami-ColBERT-310m
- Perfil del autor: https://huggingface.co/mahiyama
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Modelo hermano Sazanami-AGC-310m: https://huggingface.co/mahiyama/Sazanami-AGC-310m
- Modelo hermano Sazanami-MetaEmbed-310m: https://huggingface.co/mahiyama/Sazanami-MetaEmbed-310m
- Modelo hermano Sazanami-Embed-310m: https://huggingface.co/mahiyama/Sazanami-Embed-310m
- Documentación de `MultiVectorEncoder`: https://sbert.net/docs/package_reference/multi_vector_encoder/model.html
- Artículo de ColBERT (Khattab y Zaharia, 2020): https://arxiv.org/abs/2004.12832
- Artículo de ColBERTv2 (Santhanam et al., 2022): https://arxiv.org/abs/2112.01488
- Repositorio de referencia de ColBERT: https://github.com/stanford-futuredata/ColBERT
- Conjunto de datos mahiyama/auto-wiki-qa: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Conjunto de datos mahiyama/mqa-ja: https://huggingface.co/datasets/mahiyama/mqa-ja
- Conjunto de datos mahiyama/mmarco-ja: https://huggingface.co/datasets/mahiyama/mmarco-ja
- Conjunto de datos mahiyama/miracl-retrieval: https://huggingface.co/datasets/mahiyama/miracl-retrieval
- Conjunto de datos mahiyama/mrtydi: https://huggingface.co/datasets/mahiyama/mrtydi
- Conjunto de datos mahiyama/amagasaki-qna: https://huggingface.co/datasets/mahiyama/amagasaki-qna
- Conjunto de datos mahiyama/quiz-works: https://huggingface.co/datasets/mahiyama/quiz-works
- Conjunto de datos mahiyama/quiz-no-mori: https://huggingface.co/datasets/mahiyama/quiz-no-mori
- Conjunto de datos mahiyama/anlp-meeting-retrieval: https://huggingface.co/datasets/mahiyama/anlp-meeting-retrieval
- Conjunto de datos mahiyama/kosodate-faq-pairs-ja: https://huggingface.co/datasets/mahiyama/kosodate-faq-pairs-ja
