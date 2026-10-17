# kmouratidis/Nemotron-3.5-Embed-8B-INT8-W8A8

## Resumen

Nemotron-3.5-Embed-8B-INT8-W8A8 es una versión cuantizada a INT8 (esquema W8A8) del modelo de embeddings multimodal nvidia/Nemotron-3.5-Embed-8B-BF16. La publica el usuario kmouratidis, no NVIDIA, y se ha generado con llm-compressor mediante GPTQ en una única pasada. Es un modelo de extracción de características (feature-extraction) orientado a recuperación de información: produce embeddings de texto, de imagen y multimodales, no texto generado.

El modelo conserva la arquitectura multimodal del original (etiquetada como mistral3 en HuggingFace), con una torre de visión y un proyector multimodal que permanecen en BF16, mientras que las 34 capas del modelo de lenguaje están cuantizadas a 8 bits. El objetivo declarado por el autor es poder ejecutarlo en una instancia de vLLM sobre CPU en lugar de recurrir al modelo BF16, y reporta unos 700 tokens por segundo máximos en 12 núcleos.

Con 8.381.155.328 parámetros y un repositorio de 19,4 GB, se trata de un modelo de embeddings de gran tamaño para tareas de retrieval, RAG y búsqueda semántica, incluyendo recuperación sobre documentos renderizados como imagen. La licencia es OpenMDW-1.1, heredada del modelo base, con el componente Ministral-3-8B-Instruct-2512 bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Mistral 3 (etiqueta `mistral3`), con torre de visión y proyector multimodal; 34 capas de lenguaje cuantizadas |
| Parámetros totales | 8.381.155.328 (≈8,38 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la calibración de GPTQ usó muestras de hasta 8192 tokens) |
| Tipos de cuantización | INT8 W8A8 (pesos y activaciones a 8 bits), formato compressed-tensors, generada con GPTQ; el autor menciona una posible W4A16 futura |
| Idiomas soportados | Multilingüe e inglés (etiquetas de la model card); la calibración incluye pares en-el de opus-100 |
| Licencia | OpenMDW-1.1 (etiquetada como `other`); el componente base Ministral-3-8B-Instruct-2512 está bajo Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Librería | sentence-transformers |
| Pipeline declarado | visual-document-retrieval |
| Modelo base | nvidia/Nemotron-3.5-Embed-8B-BF16 |
| Tamaño del repositorio | 19,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint BF16 nvidia/Nemotron-3.5-Embed-8B-BF16, que a su vez se apoya en Ministral-3-8B-Instruct-2512 (según la sección de licencia de la model card). La receta aplicada es GPTQ de una sola pasada con llm-compressor (>=0.14.0), con `GPTQModifier`, `targets="Linear"`, `scheme="W8A8"`, `block_size=128`, `dampening_frac=0.01` y `actorder="static"`. Se usaron 1.274 muestras de calibración con longitud máxima de 8192 tokens, ejecutando DDP sobre 2 GPU (637 muestras por rango). Se ignoran explícitamente `lm_head`, la torre de visión, el codificador de visión y los proyectores multimodales, que permanecen en BF16: el autor indica que cuantizar la torre de visión destruye la calidad de recuperación de imágenes, algo que midió. La primera versión dejaba sin cuantizar algunas capas, lo que dio problemas con vLLM (al menos en CPU), por lo que la v2 cuantiza también las capas 0, 32 y 33. Se intentó añadir SmoothQuant, pero falló y no se investigó.

Los datos de calibración son 1.050 muestras de texto (150 por conjunto de datos, mezclando consultas cortas y pasajes largos) más 224 muestras multimodales (unas 30 imágenes reales y 96 páginas de documento sintéticas renderizadas). Los conjuntos empleados son wikitext-103, natural-questions, SQuAD, XSum, FineWeb-Edu, C4, arXiv-summarization y opus-100 (en-el). Tres conjuntos más (bookcorpus, sciq y opus-100 adicional) no aportaron filas por problemas de carga o de filtrado. No se documentan en la información disponible detalles del preentrenamiento del modelo base, ni si hubo RLHF o DPO; al ser un modelo de embeddings, no aplica un ajuste por preferencias en el sentido habitual.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación.
- Generación de embeddings de imagen y embeddings multimodales (texto + imagen) en un mismo espacio vectorial.
- Recuperación de documentos visuales: páginas renderizadas, capturas o documentos escaneados tratados como imagen.
- Soporte de búsqueda semántica y de pipelines de RAG (retrieval-augmented generation) como componente de indexación y consulta.
- Capacidad multilingüe declarada en las etiquetas, con prueba de pares de traducción griego-inglés en la validación.
- Compatibilidad con sentence-transformers, transformers y vLLM, incluyendo despliegue sobre CPU.
- Incluye ficheros auxiliares de sentence-transformers (`config_sentence_transformers.json`, `modules.json`, `1_Pooling/`) que, según el autor, mejoran la calidad de los embeddings en las pruebas que hizo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- RAG sobre documentación corporativa: indexar manuales, políticas internas o documentación técnica en una base vectorial y recuperar pasajes relevantes para alimentar a un LLM generativo. El modelo es adecuado porque su salida es directamente un embedding de recuperación y soporta pasajes largos en la calibración (hasta 8192 tokens).
- Recuperación sobre documentos escaneados o renderizados: en lugar de aplicar OCR, se generan embeddings de las páginas como imagen y se recuperan por similitud visual. El pipeline declarado (`visual-document-retrieval`) apunta exactamente a este escenario, y la validación sobre páginas renderizadas da acc@1 de 1,000 en 24 casos.
- Búsqueda semántica multilingüe en catálogos o bases de conocimiento: permite consultar en un idioma y recuperar contenido en otro, apoyándose en las etiquetas multilingües y en la validación en-el reportada.
- Deduplicación y agrupamiento de contenidos: calcular embeddings de un corpus (noticias, papers, incidencias) y aplicar clustering o umbrales de similitud para detectar duplicados o temas, aprovechando que el modelo mantiene la señal incluso con texto no relacionado (0,2444 en el ejemplo de biología).
- Sistemas de recomendación basados en contenido: representar ítems y preferencias de usuario en el mismo espacio vectorial para recomendar artículos, productos o documentación similar, sin necesidad de un modelo generativo.
- Clasificación y enrutado few-shot: usar similitud contra ejemplos etiquetados para clasificar tickets de soporte, correos o incidencias antes de derivarlas a un pipeline mayor.
- Despliegue en CPU para reducir coste de infraestructura: el autor reporta unos 700 t/s máximos en 12 núcleos con vLLM en CPU, lo que permite servir indexación por lotes sin GPU dedicada.
- Recuperación multimodal en catálogos de producto: combinar embeddings de la ficha textual y de la fotografía del producto para búsquedas del tipo "encuéntrame algo como esta imagen", apoyándose en el espacio conjunto de texto e imagen.

## Benchmarks y rendimiento

Ejemplos de la model card (puntuaciones de similitud, BF16 frente a INT8):

| Entrada | BF16 | INT8 | Δ |
|---|---|---|---|
| nemo_image_text | 0,5400 | 0,5279 | -0,0120 |
| nemo_text | 0,5878 | 0,5852 | -0,0026 |
| nemo_image | 0,5152 | 0,5045 | -0,0107 |
| biology_text (no relacionado) | 0,2474 | 0,2444 | -0,0030 |

Benchmark de recuperación sobre datos reservados (held-out), precisión en el primer resultado:

| Tarea | n | BF16 | INT8 |
|---|---|---|---|
| SciFact (científico) acc@1 | 100 | 0,990 | 0,990 |
| NFCorpus (médico) acc@1 | 100 | 0,620 | 0,630 |
| ArguAna (argumentación) acc@1 | 100 | 0,960 | 0,960 |
| Quora (paráfrasis) acc@1 | 100 | 1,000 | 1,000 |
| Europarl griego bitext (el-en) acc@1 | 100 | 1,000 | 1,000 |
| STS en inglés, Pearson r | 300 | 0,8473 | 0,8484 |
| Páginas renderizadas (visión) acc@1 | 24 | 1,000 | 1,000 |

El propio autor advierte que estos resultados le parecen "demasiado buenos para ser verdad" y sospecha que cometió algún error en la evaluación. No hay datos de latencia ni de throughput más allá del orden de 700 t/s en 12 núcleos con vLLM en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-INT8-W8A8 | 8,38 mil millones | No disponible | INT8 W8A8 (GPTQ, compressed-tensors) | OpenMDW-1.1 | HuggingFace, 0 descargas |
| nvidia/Nemotron-3.5-Embed-8B-BF16 (base) | No disponible en la información proporcionada | No disponible | BF16 | OpenMDW-1.1 (+ Apache 2.0 del componente Ministral-3-8B-Instruct-2512) | HuggingFace |
| Otras alternativas de embeddings de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa posible es contra el modelo base BF16: la cuantización INT8 reduce el peso de los pesos a aproximadamente 1 byte por parámetro, mantiene la torre de visión en BF16 y, según las mediciones del autor, conserva el rendimiento de recuperación con diferencias de en torno a 0,003 a 0,012 puntos en los ejemplos de la model card. No se dispone de información sobre alternativas de la misma categoría (otros modelos de embeddings multimodales de ~8B) en los datos proporcionados.

## Limitaciones y advertencias

- Los resultados de validación los publica el propio autor de la cuantización, que declara dudas explícitas sobre su validez ("demasiado buenos para ser verdad"). No hay evaluación independiente.
- La cuantización de la torre de visión degrada la recuperación de imágenes de forma medida por el autor; por eso queda en BF16. Cualquier recuantización posterior debería respetar esa decisión.
- El autor reportó problemas de compatibilidad con vLLM (al menos en CPU) cuando algunas capas quedaban sin cuantizar, motivo de la revisión v2.
- Es un modelo de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso, por lo que no puede sustituir a un LLM generativo en un pipeline de respuesta.
- La longitud de contexto no está documentada; el límite de 8192 tokens solo consta como tope de las muestras de calibración, no como ventana del modelo.
- La calibración está dominada por contenido en inglés y por dominios enciclopédicos, académicos y de noticias, lo que puede introducir sesgo de dominio en los embeddings resultantes.
- El soporte multilingüe está declarado en las etiquetas, pero la única validación multilingüe reportada es un par griego-inglés; no hay evidencia publicada sobre otros idiomas, incluido el español.
- La licencia OpenMDW-1.1 se hereda del modelo base y se etiqueta como `other`; conviene revisar sus términos antes de un uso comercial, junto con la licencia Apache 2.0 aplicable al componente Ministral-3-8B-Instruct-2512.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación por parte de la comunidad ni señales de adopción en producción.
- En las pruebas del autor, cuantizar la torre de visión "destruyó el rendimiento", y el intento de añadir SmoothQuant falló sin que se investigara la causa: la receta de cuantización no está depurada más allá de lo publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmouratidis/Nemotron-3.5-Embed-8B-INT8-W8A8
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Datasets de calibración citados: https://huggingface.co/datasets/Salesforce/wikitext, https://huggingface.co/datasets/sentence-transformers/natural-questions, https://huggingface.co/datasets/rajpurkar/squad, https://huggingface.co/datasets/EdinburghNLP/xsum, https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/allenai/c4, https://huggingface.co/datasets/ccdv/arxiv-summarization, https://huggingface.co/datasets/Helsinki-NLP/opus-100
- La búsqueda web realizada no devolvió ningún resultado relevante para este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
