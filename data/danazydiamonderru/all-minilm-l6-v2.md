# danazydiamonderru/all-MiniLM-L6-v2

## Resumen

all-MiniLM-L6-v2 es un modelo de codificación de frases (sentence embedding) construido sobre una arquitectura transformer tipo BERT destilada, con 22.713.728 parámetros y una salida de 384 dimensiones. Este repositorio concreto, publicado por el usuario danazydiamonderru, es una re-subida del modelo homónimo original de sentence-transformers, con 0 descargas y 0 me gusta en el momento de redactar esta ficha.

No es un modelo generativo: convierte frases y párrafos cortos en vectores densos normalizados que capturan su significado semántico, y sirve como bloque base para búsqueda semántica, clustering, deduplicación y reranking dentro de pipelines de recuperación aumentada (RAG).

Su relevancia actual radica en la relación entre calidad y coste: con solo 6 capas y 22,7 millones de parámetros se ejecuta en CPU con latencias de milisegundos y menos de 100 MB de memoria en FP32, lo que lo convierte en el estándar de facto para prototipos de recuperación en inglés y en una alternativa viable cuando no hay GPU disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT con destilación (MiniLM), 6 capas, hidden size 384 |
| Parámetros totales | 22.713.728 (≈22,7 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 word pieces por defecto (el texto más largo se trunca); entrenado con secuencias de 128 tokens |
| Dimensión de embeddings | 384 |
| Tipos de cuantización | no disponible en el repositorio; el ecosistema permite conversiones a FP16, INT8 y formatos ONNX/OpenVINO |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch (bin), TensorFlow, ONNX, OpenVINO, Rust |
| Función de pooling | Media ponderada por la máscara de atención + normalización L2 |
| Pipeline | sentence-similarity (feature-extraction) |
| Modelo base | nreimers/MiniLM-L6-H384-uncased |
| Autor del repositorio | danazydiamonderru (re-subida; el original es sentence-transformers) |
| Fecha de creación del repo | 2026-09-26, según metadatos de Hugging Face |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 6 capas con hidden size 384 y mecanismo de atención multi-cabeza estándar, derivado de nreimers/MiniLM-L6-H384-uncased, un MiniLM preentrenado mediante destilación de conocimiento de un modelo BERT de mayor tamaño. El modelo no genera texto: produce una representación vectorial por secuencia, que se obtiene aplicando pooling por media (ponderada por la máscara de atención) sobre las representaciones de los tokens y normalizando el resultado con norma L2.

El ajuste fino se hizo con un objetivo contrastivo de negativos en el lote: se calcula la similitud coseno entre todos los pares de un lote y se aplica entropía cruzada para que cada frase se acerque a su pareja real y se aleje de las demás. El entrenamiento se ejecutó sobre TPU v3-8 durante 100.000 pasos, con batch size de 1024 (128 por núcleo), warmup de 500 pasos, longitud de secuencia limitada a 128 tokens, optimizador AdamW y tasa de aprendizaje 2e-5. La infraestructura citada en la model card incluye 7 TPUs v3-8 y participación del equipo de Flax/JAX de Google.

Los datos de entrenamiento son una concatenación de más de 1.000 millones de pares de frases procedentes de fuentes diversas: S2ORC, StackExchange, MS MARCO, GooAQ, Yahoo Answers Topics, CodeSearchNet, Search QA, ELI5, SNLI, MultiNLI, WikiHow, Natural Questions, TriviaQA, Sentence Compression, Flickr30k Captions, AltLex, Simple Wiki, QQP, SPECTER, PAQ y WikiAnswers, entre otras. Cada dataset se muestrea con una probabilidad ponderada definida en el fichero `data_config.json`; el script de entrenamiento está incluido en el repositorio como `train_script.py`.

## Capacidades

- Codificación de frases y párrafos cortos en vectores densos de 384 dimensiones.
- Cálculo de similitud semántica entre pares de textos mediante distancia coseno.
- Clustering y agrupación de textos por proximidad en el espacio de embeddings.
- Búsqueda semántica y recuperación de pasajes (retrieval) sobre corpus en inglés.
- Deduplicación y detección de contenido casi idéntico.
- Clasificación zero-shot mediante comparación con descripciones textuales de etiquetas.
- Reranking ligero de resultados de un primer recuperador (BM25, etc.).
- No soporta tool calling ni function calling: es un encoder, no un modelo de instrucciones.
- No soporta agentes ni razonamiento multi-paso de forma nativa; puede actuar como módulo de recuperación dentro de un agente construido con otro modelo.
- Capacidades multilingües: no, el modelo está entrenado y evaluado únicamente en inglés.
- Capacidades especiales: licencia permisiva, ejecución en CPU y despliegue en múltiples runtimes (PyTorch, TensorFlow, ONNX, OpenVINO, Rust).

## Casos de uso

- Búsqueda semántica y RAG: se indexan documentos en inglés precalculando sus embeddings y, en consulta, se codifica la pregunta y se recuperan los vecinos más próximos por similitud coseno. Adecuado por su bajo coste de indexación y su latencia en CPU.
- Atención al cliente y FAQ matching: las preguntas de los usuarios se comparan contra un catálogo de respuestas canónicas; el modelo devuelve la más próxima semánticamente aunque no coincidan las palabras exactas.
- Deduplicación de corpus: agrupando embeddings de artículos, tickets o registros se detectan duplicados y variantes casi idénticas antes de entrenar otros modelos o de cargar un data warehouse.
- Análisis de feedback de clientes: se codifican reseñas y encuestas y se agrupan con k-means o HDBSCAN para descubrir temas recurrentes sin etiquetado previo.
- Clasificación zero-shot de tickets: cada categoría se describe con una frase; el ticket se asigna a la categoría con mayor similitud, lo que permite desplegar un clasificador sin datos etiquetados.
- Recomendación de contenido: artículos, productos o vídeos se codifican una sola vez y se recomiendan por vecindad semántica respecto al ítem que el usuario está consultando.
- Reranking en pipelines de búsqueda: tras una recuperación léxica (por ejemplo BM25) se reordenan los candidatos por similitud semántica con la consulta, mejorando la precisión del top-k.
- Evaluación de paráfrasis y control de calidad: se mide la similitud entre un texto generado y una referencia para filtrar respuestas semánticamente alejadas o detectar traducciones defectuosas dentro de un mismo idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye tablas de evaluación (SentEval, MTEB u otras) y los metadatos de Hugging Face no aportan métricas de rendimiento.

## Requisitos de hardware

- Memoria de pesos: aproximadamente 91 MB en FP32, 45 MB en FP16 y 23 MB en INT8 para los 22,7 millones de parámetros.
- VRAM estimada para inferencia: inferior a 1 GB, incluyendo activaciones y overhead del runtime.
- Cabe en cualquier GPU de consumo: GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090 y también en GPU integradas. Es perfectamente viable ejecutarlo solo en CPU.
- GPU recomendadas para alto throughput: T4, L4, A10 o A100 si se necesita procesar grandes volúmenes por segundo; para cargas pequeñas no se necesita GPU.
- Opciones de despliegue: sentence-transformers, transformers, ONNX Runtime, OpenVINO, TensorFlow, Hugging Face Text Embeddings Inference (TEI), FastEmbed y endpoints compatibles con la Inference API de Hugging Face (la etiqueta `endpoints_compatible` aparece en el repositorio).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embeddings | Contexto | Licencia |
|---|---|---|---|---|
| all-MiniLM-L6-v2 (este repositorio) | 22,7 M | 384 | 256 word pieces | Apache-2.0 |
| all-MiniLM-L12-v2 | ≈33 M | 384 | 256 word pieces | Apache-2.0 |
| paraphrase-MiniLM-L6-v2 | ≈22,7 M | 384 | 256 word pieces | Apache-2.0 |
| bge-small-en-v1.5 | ≈33 M | 384 | 512 tokens | MIT |

Los datos de rendimiento comparado (MTEB, SentEval u otros) no están disponibles en la información proporcionada. La variante L12 del mismo familia añade el doble de capas a costa de mayor latencia; paraphrase-MiniLM-L6-v2 mantiene el mismo tamaño pero se ajustó específicamente para pares de paráfrasis, y bge-small-en-v1.5 ofrece una ventana de contexto mayor. Los valores de parámetros y licencias de los modelos alternativos proceden de sus model cards públicas y deben verificarse antes de tomar una decisión de producción.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés. El rendimiento cae de forma acusada con textos en castellano u otros idiomas.
- No es generativo: no produce texto, no sigue instrucciones y no puede usarse como chatbot por sí solo.
- Truncado a 256 word pieces: los documentos largos pierden información si no se trocean previamente en fragmentos.
- Sesgos de datos: el corpus de entrenamiento incluye Reddit, foros de StackExchange y respuestas de Yahoo, por lo que puede heredar sesgos sociales, de género o de registro informal.
- Similitudes espurias: al ser un modelo de similitud, puede asignar puntuaciones altas a textos que comparten vocabulario pero no significado, o bajas a paráfrasis con estructuras muy distintas.
- Este repositorio concreto es una re-subida no oficial, con 0 descargas y 0 me gusta, y sin verificación por parte del autor original. Para producción se recomienda usar la versión canónica sentence-transformers/all-MiniLM-L6-v2.
- Los metadatos indican una fecha de creación de 2026-09-26, poco habitual, lo que refuerza la recomendación de verificar la procedencia de los pesos antes de integrarlos en una cadena de suministro de software.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no exime de comprobar la trazabilidad de los ficheros de pesos de este mirror concreto.
- El repositorio ocupa 0,9 GB porque incluye múltiples formatos de pesos; conviene descargar solo el formato necesario para evitar consumo innecesario de disco.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danazydiamonderru/all-MiniLM-L6-v2
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo base preentrenado: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Documentación de Sentence-Transformers: https://www.SBERT.net
- Hilo de la comunidad sobre JAX/Flax: https://discuss.huggingface.co/t/open-to-the-community-community-week-using-jax-flax-for-nlp-cv/7104
- Hilo de la comunidad sobre el entrenamiento con 1B de pares: https://discuss.huggingface.co/t/train-the-best-sentence-embedding-model-ever-with-1b-training-pairs/7354
- Referencias de arXiv incluidas en las etiquetas del repositorio: 1904.06472, 2102.07033, 2104.08727, 1704.05179, 1810.09305
- Script de entrenamiento incluido en el repositorio: `train_script.py`
- Configuración de datos incluida en el repositorio: `data_config.json`
