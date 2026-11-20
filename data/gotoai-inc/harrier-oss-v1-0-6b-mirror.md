# GotoAI-Inc/harrier-oss-v1-0.6b-mirror

## Resumen

harrier-oss-v1-0.6b es un modelo de embeddings de texto multilingüe desarrollado por Microsoft, publicado dentro de la familia harrier-oss-v1 (que también incluye variantes de 270M y 27B de parámetros). Se trata de un modelo decoder-only basado en Qwen3 que, mediante last-token pooling y normalización L2, genera embeddings densos de 1.024 dimensiones utilizables para recuperación de información, clustering, similitud semántica, clasificación, minería de bitextos y reranking. Esta ficha concreta corresponde a un mirror no oficial mantenido por GotoAI-Inc, idéntico byte a byte al repositorio original de Microsoft en la revisión `f9b9dc8d367d443f2479d27aa5d8d2850c0774ee`.

El modelo resuelve el problema de la búsqueda semántica y la representación vectorial de texto en más de 90 idiomas con una ventana de contexto de 32.768 tokens, lo que lo sitúa en la categoría de modelos de embeddings de contexto largo. Según la model card del autor, alcanza una puntuación de 69,0 en Multilingual MTEB v2, lo que lo convierte en una opción intermedia dentro de su propia familia: por encima del 270M (66,5) y por debajo del 27B (74,3).

Su relevancia actual radica en la combinación de tamaño contenido (596.049.920 parámetros, aproximadamente 1,2 GB de pesos en safetensors), licencia MIT y buen rendimiento multilingüe, lo que permite desplegarlo en infraestructura modesta manteniendo calidad de estado del arte en la fecha de publicación. Al ser un mirror, no debe citarse como fuente primaria ni reportarse incidencias al mirror, sino al repositorio original de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (base Qwen3) con last-token pooling y normalización L2 |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo solo distribuye safetensors en el formato original) |
| Idiomas soportados | Multilingüe: 90+ idiomas (af, am, ar, as, az, be, bg, bn, br, bs, ca, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fr, fy, ga, gd, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ku, ky, la, lo, lt, lv, mg, mk, ml, mn, mr, ms, my, ne, nl, no, om, or, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, th, tl, tr, ug, uk, ur, uz, vi, xh, yi, zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.024 |
| Libreria | sentence-transformers |
| Tamano del repositorio | 1,2 GB |
| Modelo base | microsoft/harrier-oss-v1-0.6b |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura decoder-only (heredada de la familia Qwen3) adaptada a la generación de embeddings de texto. En lugar de utilizar el token CLS o un pooling medio, aplica last-token pooling sobre el último estado oculto, seguido de normalización L2, para producir un vector denso de 1.024 dimensiones por secuencia. Esta elección es coherente con la práctica habitual en modelos de embeddings basados en LLMs decoder-only y permite reutilizar la ventana de contexto nativa de 32.768 tokens. El modelo expone prompts preconfigurados en `config_sentence_transformers.json` (`web_search_query`, `sts_query`, `bitext_query`) y admite instrucciones personalizadas mediante el formato `Instruct: {task}\nQuery: {query}`.

Según la model card, todos los modelos de la familia se entrenan con objetivos de aprendizaje contrastivo sobre una mezcla a gran escala de datasets multilingües que cubren diversas tareas. Las variantes de 270M y 0.6B se entrenan además con destilación de conocimiento a partir de modelos de embeddings de mayor tamaño. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings puros). Tampoco se detalla si se emplearon técnicas como decodificación especulativa o atención lineal; al ser un modelo de extracción de características, estas técnicas no forman parte del pipeline de inferencia típico.

## Capacidades

- Generación de embeddings densos de texto de 1.024 dimensiones para frases, pasajes y documentos de hasta 32.768 tokens.
- Recuperación de información (retrieval) monolingüe y cross-lingual.
- Similitud semántica y detección de duplicados o paráfrasis.
- Clustering de documentos y textos en espacios vectoriales.
- Clasificación de textos mediante embeddings como características de entrada.
- Minería de bitextos (bitext mining) para alineación de corpus paralelos.
- Reranking de resultados de búsqueda mediante similitud coseno sobre embeddings.
- Soporte multilingüe nativo en más de 90 idiomas, incluidos español, catalán, euskera y gallego.
- Soporte de instrucciones por tarea mediante prompts preconfigurados o personalizados.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles según los tags del repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en bases de conocimiento corporativas: indexar documentos de hasta 32.768 tokens con el modelo y recuperar pasajes relevantes mediante similitud coseno; la ventana de contexto larga evita trocear en exceso contratos o informes extensos.
- Motor de RAG (retrieval-augmented generation): usar el modelo como recuperador denso en pipelines de generación aumentada, aprovechando sus prompts preconfigurados (`web_search_query`) para consultas de búsqueda web o de documentación interna.
- Deduplicación y clustering de noticias o tickets de soporte: generar embeddings de cada ítem y agrupar por similitud para detectar duplicados o temas recurrentes en múltiples idiomas.
- Moderación y clasificación de contenido: alimentar un clasificador ligero con los embeddings del modelo para etiquetar textos en español, catalán, euskera, gallego y otros idiomas sin entrenar un encoder específico por lengua.
- Alineación de corpus paralelos (bitext mining): emparejar frases de corpus en distintos idiomas mediante el prompt `bitext_query`, útil para construir datasets de traducción o evaluar sistemas de traducción automática.
- Reranking en motores de búsqueda híbridos: combinar recuperación léxica (BM25) con un reranking denso usando este modelo sobre los candidatos top-k, mejorando la precisión en consultas ambiguas.
- Búsqueda multilingüe en comercio electrónico: indexar descripciones de producto en varios idiomas y permitir consultas cross-lingual (por ejemplo, consulta en español contra catálogo en inglés) sin traducción intermedia.
- Análisis de similitud en atención al cliente: comparar tickets entrantes con bases de conocimiento existentes para sugerir respuestas, aprovechando la ventana de 32.768 tokens para incluir hilos completos de conversación.

## Benchmarks y rendimiento

| Modelo | Parametros | Dimension de embedding | Contexto maximo | MTEB v2 (multilingue) |
|---|---|---|---|---|
| harrier-oss-v1-270m | 270M | 640 | 32.768 | 66,5 |
| harrier-oss-v1-0.6b | 0,6B | 1.024 | 32.768 | 69,0 |
| harrier-oss-v1-27b | 27B | 5.376 | 32.768 | 74,3 |

Los datos proceden de la model card del autor (Microsoft). No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros), ya que se trata de un modelo de embeddings y no de un modelo generativo; la métrica relevante es la puntuación agregada de Multilingual MTEB v2.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 1,2-1,5 GB para los pesos, más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB; en 4 bits, en torno a 0,4-0,5 GB (estimaciones orientativas; el repositorio no distribuye pesos cuantizados).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090). Para alto throughput en producción, A100 o H100 con TEI o vLLM.
- Cabe holgadamente en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repo), Transformers con pooling manual, y servidores compatibles con la API de embeddings de OpenAI (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. A modo orientativo, un modelo de 0,6B en una RTX 4090 puede procesar cientos de pasajes por segundo en lotes, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | MTEB v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| harrier-oss-v1-0.6b (este) | 0,6B | 32.768 | 1.024 | 69,0 | MIT | Hugging Face (original y mirror) |
| harrier-oss-v1-270m | 270M | 32.768 | 640 | 66,5 | MIT | Hugging Face |
| harrier-oss-v1-27b | 27B | 32.768 | 5.376 | 74,3 | MIT | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos de embeddings comparables (por ejemplo, de la familia BGE-M3, E5-multilingual o GTE-multilingual), por lo que la comparativa se limita a las variantes de la propia familia harrier-oss-v1. Para una comparación cruzada con otros modelos, se recomienda consultar el leaderboard público de Multilingual MTEB v2.

## Limitaciones y advertencias

- Es un mirror no oficial: el mantenimiento, las actualizaciones y el soporte corresponden a Microsoft; GotoAI-Inc no está afiliado a los autores y no debe reportarse incidencias al mirror.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso. Su uso está limitado a la extracción de embeddings.
- Riesgo de alucinación no aplicable en sentido estricto, pero sí de recuperación de pasajes irrelevantes si los prompts de tarea no se ajustan al caso de uso; se recomienda usar los prompts preconfigurados o instrucciones específicas.
- Sesgos: no se documentan en la información disponible sesgos específicos por idioma, género o dominio; al entrenarse con mezclas multilingües a gran escala, es esperable un rendimiento desigual entre lenguas de altos y bajos recursos.
- Limitaciones de contexto: aunque soporta 32.768 tokens, el rendimiento en documentos muy largos puede degradarse; no se han publicado evaluaciones específicas de contexto largo en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el mirror añade un archivo `LICENSE` con el texto completo porque el repositorio original solo declaraba la licencia en metadatos; conviene verificar la licencia en el repositorio original antes de un despliegue en producción.
- El SHA-256 del archivo `model.safetensors` del mirror es `6bb124227f33c3dbf7fbbd38119b2afa8be959e93666d3c9be7142b66708b66c`; verificar la integridad si se descarga desde el mirror.
- No se distribuyen pesos cuantizados en el repositorio; si se necesita GGUF u ONNX, habrá que generarlos a partir de los safetensors originales.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/GotoAI-Inc/harrier-oss-v1-0.6b-mirror
- Repositorio original (Microsoft): https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Revisión original espejada: https://huggingface.co/microsoft/harrier-oss-v1-0.6b/tree/f9b9dc8d367d443f2479d27aa5d8d2850c0774ee
- Variante 270M: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Variante 27B: https://huggingface.co/microsoft/harrier-oss-v1-27b
- Leaderboard Multilingual MTEB v2: https://huggingface.co/spaces/mteb/leaderboard
- Documentación de Text Embeddings Inference: no disponible en la información proporcionada
