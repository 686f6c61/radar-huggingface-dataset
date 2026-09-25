# mursideaki/latensis-sts-tr

## Resumen

Latensis STS es un modelo de similitud textual semántica (STS) para turco desarrollado por Mürşide Aki (usuario `mursideaki` en Hugging Face). Se trata de un encoder basado en la arquitectura RoBERTa que se ha afinado sobre el modelo base Latensis RoBERTa Base, entrenado desde cero con aproximadamente 1 GB de texto turco curado y un tokenizador SentencePiece propio de 128.000 tokens diseñado para la morfología del turco (Hecemen Unigram 128k). El resultado es un modelo de 184.346.112 parámetros que produce embeddings de frase y una puntuación de similitud coseno entre dos textos.

Su relevancia radica en que cubre un nicho poco atendido: la mayoría de modelos de similitud para turco se apoyan en encoders multilingües genéricos, mientras que este parte de un modelo monolingüe entrenado específicamente para turco. El entrenamiento sigue un pipeline de dos etapas (preentrenamiento con NLI y ajuste fino con STS mediante pérdida CoSENT) y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones añadidas.

El modelo forma parte de una suite más amplia (Latensis) que incluye clasificación de sentimiento, reconocimiento de entidades y textual entailment, todos construidos sobre el mismo backbone. No es un modelo generativo: su salida son representaciones vectoriales de texto, por lo que su uso principal es la recuperación semántica, el clustering y la comparación de pares de frases en turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo RoBERTa (configuración coherente con RoBERTa base: 12 capas, dimensión oculta 768, intermedio 3072), con mean pooling sobre la última capa oculta |
| Parámetros totales | 184.346.112 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens en el pipeline de uso publicado (truncado efectivo a 126 tokens tras añadir `<s>` y `</s>`); la configuración del backbone no se detalla en la información disponible |
| Tipos de cuantización | No disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | Turco (`tr`) únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 0,7 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa sin cabeza de modelado de lenguaje, sobre el que se aplica *mean pooling* enmascarado para obtener un único vector por frase. El recuento de parámetros publicado (184.346.112) es coherente con una configuración RoBERTa base estándar (12 capas, 768 dimensiones ocultas, 3072 en la capa intermedia) combinada con un vocabulario de 128.000 tokens, lo que hace que la matriz de embeddings concentre buena parte del peso del modelo. El tokenizador asociado, Hecemen Unigram 128k, es un SentencePiece de tipo unigram entrenado específicamente para la morfología turca y se distribuye en un repositorio separado (`mursideaki/hecemen-tokenizer-unigram-128k`); el modelo requiere descargarlo explícitamente para la inferencia.

El entrenamiento consta de dos etapas. La primera es un preentrenamiento con datos de inferencia de lenguaje natural (NLI) sobre 50.000 ejemplos del conjunto `emrecan/all-nli-tr`. La segunda es un ajuste fino para similitud textual semántica sobre el split de entrenamiento de TrGLUE STS-b (2.458 ejemplos), utilizando pérdida CoSENT, *learning rate* de 4e-6, tamaño de lote de 16 y *mean pooling*. El modelo base sobre el que se apoya, Latensis RoBERTa Base, fue entrenado desde cero durante 500.000 pasos con una pérdida de validación de 3,21. El autor destaca explícitamente que su pipeline emplea unas diez veces menos datos NLI que la alternativa con la que se compara.

## Capacidades

- Generación de embeddings de frase para turco: convierte un texto en un vector normalizado que puede usarse con similitud coseno o producto escalar.
- Puntuación de similitud semántica entre pares de frases, tanto por solapamiento léxico como por paráfrasis.
- Recuperación semántica (retrieval) de documentos en turco, útil como componente de sistemas RAG.
- Clustering y agrupación semántica de textos turcos mediante vecinos más cercanos.
- Detección de duplicados y casi duplicados con sensibilidad a reformulaciones, no solo a coincidencia exacta de cadenas.
- Capacidad derivada del preentrenamiento con NLI: cierta sensibilidad a relaciones de implicación y contradicción entre frases, aunque el modelo no expone una cabeza de clasificación NLI.
- Soporte de *batching* con `attention_mask`, lo que permite codificar grandes volúmenes de texto en GPU.
- No soporta generación de texto, *tool calling*, uso como agente, razonamiento multi-paso, visión ni audio. Es exclusivamente un modelo de representación de texto.

## Casos de uso

- Búsqueda semántica en corpus turcos: indexar los embeddings de los documentos y codificar la consulta del usuario con el mismo modelo para recuperar los fragmentos más similares por coseno. Es adecuado porque está entrenado íntegramente con texto turco y su tokenizador maneja la aglutinación morfológica mejor que un vocabulario multilingüe genérico.
- Recuperación en pipelines RAG en turco: usar el modelo como recuperador de pasajes antes de pasar el contexto a un LLM generativo. Al ser un encoder de 184 M de parámetros, la indexación de miles de documentos es viable en una sola GPU consumer.
- Deduplicación de datasets y foros: agrupar publicaciones casi idénticas en un corpus turco (noticias, comentarios, tickets) calculando vecinos cercanos sobre los embeddings normalizados.
- Clustering de tickets de soporte: agrupar automáticamente incidencias de clientes por temática para enrutarlas al equipo adecuado, aprovechando la tolerancia a reformulaciones que aporta el ajuste con CoSENT.
- Detección de paráfrasis y plagio reformulado: comparar un texto sospechoso contra un corpus de referencia y marcar pares con similitud alta aunque no compartan las mismas palabras.
- Moderación de contenido duplicado o spam: identificar mensajes repetidos con variaciones superficiales en comunidades y secciones de comentarios en turco.
- Sistemas de recomendación por contenido: representar artículos, vídeos o productos en turco y recomendar ítems cercanos en el espacio de embeddings al último elemento consumido por el usuario.
- Evaluación de resúmenes y traducciones: usar la puntuación de similitud como métrica auxiliar entre el texto generado y la referencia en turco, dentro de un pipeline de evaluación automática.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el conjunto de test de TrGLUE STS-b (300 ejemplos):

| Benchmark | Métrica | Latensis STS | Modelo "Emrecan" (referencia del autor) |
|---|---|---|---|
| TrGLUE STS-b | Pearson | 0,7722 | 0,8340 |
| TrGLUE STS-b | Spearman | 0,7976 | 0,8300 |

Contexto de los datos: el modelo de referencia emplea 482.000 ejemplos NLI más el conjunto STS-b-TR completo, mientras que Latensis STS emplea 50.000 ejemplos NLI (aproximadamente diez veces menos datos) más las 2.458 muestras de entrenamiento de STS-b. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplicarían a un modelo de embeddings sin capacidad generativa.

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 0,74 GB de pesos (el repositorio ocupa 0,7 GB); en fp16/bf16, en torno a 0,37 GB; en int8, aproximadamente 0,18 GB. A esto hay que sumar el coste de activaciones, que para lotes pequeños con secuencias de 128 tokens es reducido.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090). No requiere A100, H100 ni aceleradores de gama alta; un uso intensivo en producción se beneficiaría simplemente de más *throughput* de batch.
- Cabe en GPU consumer: sí, con amplio margen, incluso en modelos de portátil con 4 GB. También es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: PyTorch con `transformers` (cargando el tokenizador SentencePiece por separado), ONNX Runtime, Text Embeddings Inference (TEI) y servicios propios con FastAPI o TorchServe. vLLM y TGI no aplican, ya que están orientados a modelos generativos autorregresivos; la alternativa específica para embeddings es TEI. El uso directo con `sentence-transformers` requeriría configuración manual, porque el tokenizador es un SentencePiece personalizado de 128.000 tokens y no se documenta una integración ya preparada.
- Latencia y throughput: no publicados. Como referencia de orden de magnitud, un encoder de 184 M de parámetros en fp16 con secuencias de 128 tokens se sitúa en el rango de unidades de milisegundos por lote pequeño en una GPU consumer; no existe medición oficial en la información disponible.
- Requisito adicional: es necesario descargar el tokenizador desde el repositorio `mursideaki/hecemen-tokenizer-unigram-128k` (`tr_unigram_tokenizer.model`) y gestionar manualmente los identificadores de `<pad>`, `<s>` y `</s>`.

## Comparativa con modelos similares

Única comparación con datos proporcionados en la información disponible:

| Modelo | Parámetros | Contexto | Pearson (STS-b test) | Spearman (STS-b test) | Licencia | Datos de entrenamiento |
|---|---|---|---|---|---|---|
| Latensis STS (`mursideaki/latensis-sts-tr`) | 184.346.112 | 128 tokens | 0,7722 | 0,7976 | MIT | 50.000 ejemplos NLI + 2.458 de STS-b |
| Modelo "Emrecan" (referencia usada por el autor) | No disponible | No disponible | 0,8340 | 0,8300 | No disponible | 482.000 ejemplos NLI + STS-b-TR completo |

No se dispone de datos de parámetros, contexto ni licencia para el modelo "Emrecan" en la información proporcionada, más allá de sus métricas en el mismo conjunto de evaluación. El resto de modelos de la suite Latensis (`latensis-roberta-base-tr`, `latensis-sentiment-tr`, `latensis-ner-tr`, `latensis-rte-tr`) comparten backbone pero resuelven tareas distintas, por lo que no son alternativas directas para similitud textual. No se dispone de datos verificables en la información proporcionada para comparar con otros modelos de embeddings turcos o multilingües.

## Limitaciones y advertencias

- Cobertura monolingüe: solo turco. No debe esperarse un comportamiento correcto con textos en otros idiomas ni en mezclas de idiomas.
- Contexto corto: el pipeline publicado trunca a 128 tokens totales (126 de texto real). Los documentos largos deben dividirse en fragmentos antes de codificarse, con la pérdida de contexto global que ello implica.
- Diferencias de rendimiento: en la propia evaluación del autor, el modelo queda por debajo de la alternativa "Emrecan" en Pearson (0,7722 frente a 0,8340) y Spearman (0,7976 frente a 0,8300). Es una elección razonable si se prioriza eficiencia de datos o tamaño, no si se busca el máximo absoluto en STS turco.
- Evaluación limitada: las métricas provienen de 300 ejemplos de un único conjunto (TrGLUE STS-b). Con esa muestra, las diferencias entre modelos pueden no ser estadísticamente significativas y no hay validación cruzada publicada.
- Riesgo de dominios no cubiertos: la etapa STS se ajustó con 2.458 ejemplos, por lo que dominios especializados (legal, médico, técnico) pueden degradar la calidad de los embeddings.
- Falsos positivos por solapamiento léxico: como cualquier modelo de similitud, puede asignar puntuaciones altas a frases que comparten vocabulario pero difieren en significado. No es un modelo de inferencia lógica y no debe usarse como sustituto de un verificador de hechos.
- Dependencia de un tokenizador externo: el modelo no es autocontenido; requiere descargar el tokenizador Hecemen Unigram 128k. La licencia concreta de ese repositorio de tokenizador no consta en la información proporcionada y conviene verificarla antes de un uso comercial.
- Madurez y validación comunitaria: el modelo registra 0 descargas y 0 *likes* en el momento de la consulta, y no se han encontrado publicaciones, papers ni evaluaciones independientes más allá de la model card del autor.
- Licencia: MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías. Es una de las licencias más permisivas, por lo que no existen restricciones de uso comercial derivadas del modelo en sí.
- Sesgos: no se documenta ninguna auditoría de sesgos. Al provenir de un modelo base entrenado con 1 GB de texto turco curado, puede heredar sesgos presentes en ese corpus (políticos, de género, regionales) y no hay información sobre su composición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mursideaki/latensis-sts-tr
- Modelo base: https://huggingface.co/mursideaki/latensis-roberta-base-tr
- Tokenizador Hecemen Unigram 128k: https://huggingface.co/mursideaki/hecemen-tokenizer-unigram-128k
- Modelo de sentimiento de la suite: https://huggingface.co/mursideaki/latensis-sentiment-tr
- Modelo NER de la suite: https://huggingface.co/mursideaki/latensis-ner-tr
- Modelo RTE de la suite: https://huggingface.co/mursideaki/latensis-rte-tr
- Perfil del autor: https://huggingface.co/mursideaki
