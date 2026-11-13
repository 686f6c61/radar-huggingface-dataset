# jonathanjordan21/sarcasm-indonesian-sentence-transformer

## Resumen

`sarcasm-indonesian-sentence-transformer` es un modelo de embeddings de frases (sentence transformer) afinado por el usuario jonathanjordan21 a partir de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Su función no es generar texto, sino proyectar frases y párrafos a un espacio vectorial denso de 384 dimensiones para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. El nombre del repositorio sugiere un ajuste orientado a la detección de sarcasmo en indonesio, aunque la model card no documenta explícitamente esa finalidad.

El modelo se construye sobre una arquitectura BERT (BertModel) con pooling de media sobre los token embeddings y similitud coseno. Cuenta con 117.653.760 parámetros totales y una longitud máxima de secuencia de 128 tokens, lo que lo sitúa en la gama ligera de modelos de representación, apto para despliegue en CPU y GPU de consumo. El ajuste se realizó con la librería sentence-transformers y la función de pérdida CosineSimilarityLoss sobre un conjunto de 7.407 muestras de entrenamiento con pares de frases y etiquetas.

La relevancia del modelo es limitada y muy específica: se publicó en noviembre de 2026, no acumula descargas ni interacciones, y su model card no incluye resultados de evaluación, idiomas declarados ni licencia. Resulta útil como pieza de un pipeline experimental de análisis de sarcasmo en indonesio, pero no como componente de producción sin una validación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer con BertModel (feature-extraction) y pooling de media; similitud coseno |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el ajuste parece orientado a indonesio; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Funcion de similitud | similitud coseno |
| Funcion de perdida | CosineSimilarityLoss |
| Tamano del dataset de entrenamiento | 7.407 muestras (columnas sentence_0, sentence_1, label) |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (revision e8f8c211226b894fcb81acc59f3b34ba3efd5f42) |
| Tamano del repositorio | 0,5 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es un sentence transformer compuesto por dos módulos: un `BertModel` que actúa como extractor de características y devuelve el `last_hidden_state`, y una capa de `Pooling` con modo media (`mean`), dimensión de salida 384 e inclusión del prompt. La similitud entre embeddings se calcula con distancia coseno. El modelo base, `paraphrase-multilingual-MiniLM-L12-v2`, es un MiniLM de 12 capas entrenado originalmente para paráfrasis multilingüe; el ajuste aquí documentado lo especializa sobre pares de frases en indonesio.

El entrenamiento se realizó con la librería sentence-transformers y la pérdida `CosineSimilarityLoss`, que aprende a aproximar la similitud coseno entre pares de frases a la etiqueta de similitud proporcionada. El conjunto de datos consta de 7.407 muestras con columnas `sentence_0`, `sentence_1` y `label`. No se documentan el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF o DPO (no aplicables en un modelo de embeddings). Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo es un ajuste estándar de sentence transformers sin modificaciones arquitectónicas.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 384 dimensiones.
- Similitud semántica entre textos (semantic textual similarity) mediante similitud coseno.
- Búsqueda semántica sobre corpus de documentos o frases.
- Minería de paráfrasis: identificación de pares de frases con significado equivalente.
- Clasificación de textos mediante embeddings como características de entrada.
- Clustering y agrupamiento semántico de frases.
- Extracción de características (`feature-extraction`) para pipelines posteriores.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de representación, no generativo.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste parece orientado a indonesio; no se declara oficialmente.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Detección de sarcasmo en redes sociales en indonesio: el modelo puede generar embeddings de tuits o comentarios y alimentar un clasificador ligero que distinga textos sarcásticos de literales, aprovechando el ajuste sobre pares de frases con etiquetas de similitud.
- Búsqueda semántica en foros y comunidades indonesias: indexar respuestas y consultas en el espacio de 384 dimensiones permite recuperar mensajes relacionados aunque no compartan vocabulario exacto, con un coste de almacenamiento bajo (384 floats por frase).
- Deduplicación de comentarios y reseñas: agrupar por similitud coseno frases casi idénticas en corpus de opiniones, útil para limpiar datasets antes de entrenar otros modelos.
- Moderación de contenido asistida: clasificar comentarios por similitud con frases de referencia etiquetadas como tóxicas, irónicas o fuera de tema, usando el embedding como característica de un clasificador supervisado.
- Minería de paráfrasis para aumento de datos: generar pares de frases semánticamente equivalentes en indonesio para ampliar datasets de entrenamiento de modelos de clasificación o de generación.
- Clustering de temas en encuestas abiertas: agrupar respuestas de texto libre en indonesio por cercanía semántica para analizar opiniones a escala sin etiquetado manual.
- Sistema de recomendación de contenido textual: calcular similitud entre artículos o publicaciones y el perfil de intereses del usuario expresado como frases, con latencia baja por la pequeña dimensión del embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (Spearman, Pearson, accuracy en clasificación, ni resultados en STS), y no se dispone de comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los 117,6 millones de parámetros (aproximadamente 0,47 GB solo de pesos), más overhead de activaciones y tokenizador; en FP16 se reduce a unos 0,24 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad, ya que el modelo es muy pequeño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: viable para cargas moderadas; el modelo base MiniLM es conocido por su baja latencia en CPU.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI), endpoints de Hugging Face, y exportación a ONNX para inferencia optimizada. No se documentan pesos GGUF ni soporte oficial en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el modelo base MiniLM-L12 suele procesar lotes de cientos de frases por segundo en GPU moderna, pero no hay mediciones oficiales para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonathanjordan21/sarcasm-indonesian-sentence-transformer | 117,6 M | 128 tokens | 384 | no disponible | Hugging Face, 0 descargas |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (modelo base) | ~118 M | 128 tokens | 384 | Apache 2.0 (según el modelo base original) | Hugging Face, ampliamente utilizado |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Hugging Face, muy popular |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | ~278 M | 128 tokens | 768 | Apache 2.0 | Hugging Face, ampliamente utilizado |

La comparativa se limita a los datos del modelo base y de alternativas conocidas de la familia sentence-transformers; no hay métricas de rendimiento publicadas para este ajuste concreto que permitan una comparación cuantitativa. La licencia Apache 2.0 del modelo base no implica necesariamente la licencia del ajuste, que no está declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del ajuste, lo que impide confirmar si el uso comercial está permitido; el modelo base es Apache 2.0, pero el autor no ha documentado la licencia derivada.
- Idiomas no declarados: aunque el modelo base es multilingüe, el ajuste parece orientado al indonesio y no se documenta el rendimiento en otros idiomas; usarlo en castellano u otras lenguas sin validación previa es arriesgado.
- Contexto muy corto: 128 tokens limitan el análisis a frases o párrafos breves; textos largos deben truncarse o dividirse, lo que puede perder información semántica.
- Sin evaluación publicada: no hay benchmarks, métricas de similitud ni validación de la tarea de sarcasmo, por lo que no se puede afirmar que el ajuste mejore al modelo base en esa tarea.
- Riesgo de sesgos heredados: el modelo base se entrenó con corpus multilingües de origen no documentado en esta ficha; los sesgos de esos datos se propagan al ajuste.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud: frases con solapamiento léxico pueden recibir puntuaciones altas aunque su significado difiera, especialmente en textos irónicos o sarcásticos.
- Sin soporte de tool calling ni agentes: no es un modelo generativo ni razonable para pipelines de razonamiento multi-paso.
- Madurez muy baja: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni mantenimiento; no hay garantía de soporte o actualizaciones.
- Dataset de entrenamiento pequeño: 7.407 muestras son insuficientes para garantizar una cobertura amplia de registros y dominios del indonesio coloquial.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/sarcasm-indonesian-sentence-transformer
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de referencia (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
