# Lucie666/paraphrase-multilingual-minilm-l12-v2-burnpack

## Resumen

Este repositorio no es un modelo nuevo, sino una conversión mecánica del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` al formato `burnpack` de la librería [Burn](https://burn.dev) (Rust). La conversión la ha realizado Lucie666 mediante la herramienta `burn-onnx`, sin modificar los pesos originales: se trata de una re-serialización de los valores f32 del modelo ONNX de partida a un formato que puede cargarse directamente desde Rust, sin necesidad de Python, PyTorch ni ONNX Runtime en tiempo de inferencia. El objetivo declarado es evitar que cada usuario de Burn tenga que repetir la conversión por su cuenta.

El modelo original, desarrollado por Nils Reimers y el equipo de sentence-transformers, es un embedder multilingüe que produce vectores de 384 dimensiones para frases y párrafos en más de 50 idiomas. Está basado en una arquitectura MiniLM de 12 capas con ancho 384, entrenado por destilación de conocimiento a partir de un modelo mayor (probablemente XLM-R) sobre pares de frases paralelas. La versión convertida mantiene exactamente las mismas capacidades, pero orientada a entornos Rust puros, lo que la hace relevante para aplicaciones de búsqueda semántica, clustering y recuperación de información que quieran evitar la dependencia del ecosistema Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniLM, 12 capas, ancho 384) |
| Parametros totales | no disponible (pesos originales sin modificar, f32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncación por defecto a 128 en sentence-transformers) |
| Tipos de cuantizacion | no disponible (pesos en f32, sin cuantizar) |
| Idiomas soportados | Más de 50 idiomas (multilingüe, vocabulario XLM-R) |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (model.bpk), también ONNX disponible en el modelo original |

## Arquitectura y entrenamiento

El modelo original `paraphrase-multilingual-MiniLM-L12-v2` es una versión multilingüe del MiniLM-L12-v2, que a su vez es un modelo destilado a partir de un BERT más grande. La arquitectura es un transformer encoder con 12 capas, 384 unidades de ancho y una tabla de embeddings de 250 037 entradas (el vocabulario de XLM-R). Se entrenó mediante destilación de conocimiento sobre datos paralelos multilingües para generar embeddings de frases que capturan similitud semántica entre idiomas.

La conversión a Burn no modifica los pesos: simplemente re-serializa los tensores del ONNX original al formato `burnpack`. El proceso usa `burn-onnx` con `LoadStrategy::Bytes` y genera el código Rust de la red neuronal (model.rs) que se incluye en el proyecto. No se realizó ningún entrenamiento adicional, fine-tuning ni cuantización.

## Capacidades

- Genera vectores densos de 384 dimensiones para frases o párrafos en más de 50 idiomas.
- Permite calcular similaridad semántica entre textos (coseno, producto escalar) para tareas de búsqueda semántica, clustering y deduplicación.
- Soporta comparación de frases a través de idiomas (por ejemplo, consulta en español contra documentos en inglés).
- No incluye tokenización propia: requiere el tokenizador SentencePiece Unigram del modelo original (vocabulario XLM-R, con tokens especiales `<s>`, `<pad>`, `</s>`).
- No tiene capacidades de generación de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.
- El gráfico devuelve `last_hidden_state`; para obtener el embedding de frase hay que aplicar mean pooling sobre la máscara de atención y opcionalmente normalizar L2 (el modelo original no incluye normalización automática).

## Casos de uso

- **Búsqueda semántica multilingüe en una base de conocimiento**: indexar documentos en varios idiomas con sus embeddings y recuperar los más relevantes a partir de una consulta en cualquier idioma. El modelo es adecuado por su cobertura de 50+ idiomas y su tamaño compacto (470 MB).
- **Clustering de textos multilingües**: agrupar por similaridad semántica artículos, comentarios o tickets de soporte en distintos idiomas. Los vectores de 384 dimensiones son suficientes para clustering con k-means o HDBSCAN.
- **Deduplicación de contenido**: comparar pares de textos para detectar duplicados o variaciones de un mismo contenido, útil en agregadores de noticias o sistemas de gestión documental.
- **Sistemas RAG (Retrieval-Augmented Generation)**: como recuperador de contexto para un modelo de generación, almacenando embeddings de fragmentos de documentos en una base vectorial (por ejemplo, Milvus o Qdrant) y realizando búsqueda por similitud de coseno.
- **Atención al cliente automatizada**: clasificar y enrutar mensajes entrantes según su semántica (por ejemplo, categorizar tickets de soporte en distintos departamentos) usando embeddings y un clasificador simple.
- **Comparación de frases para sistemas de preguntas y respuestas**: encontrar la respuesta más similar a una pregunta dada dentro de un corpus de respuestas previamente indexado, sin necesidad de entrenar un modelo de clasificación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de sentence-transformers tiene resultados en tareas de similaridad semántica y recuperación (STS Benchmark, etc.), pero este repositorio de conversión no los incluye. Para una evaluación completa se recomienda consultar la documentación del modelo base.

## Requisitos de hardware

- **VRAM estimada**: el peso del modelo es de 470 MB en f32, por lo que en GPU se necesitan al menos 1 GB de VRAM (teniendo en cuenta overhead de activaciones y buffers). En CPU, el uso de memoria RAM es similar.
- **GPUs recomendadas**: cualquier GPU con 4 GB o más de VRAM es suficiente (por ejemplo, NVIDIA GTX 1060, RTX 3060, AMD RX 6600). El modelo no es exigente y funciona incluso en integradas modernas.
- **CPU**: funciona correctamente en CPU con inferencia razonablemente rápida (menos de 10 ms por frase en un procesador moderno).
- **Opciones de despliegue**: al ser un modelo de Burn, se puede integrar en aplicaciones Rust usando `burn` como backend (por defecto `wgpu`/Vulkan, o `ndarray` para CPU). También se puede usar el ONNX original en Python con ONNX Runtime o sentence-transformers.
- **Latencia y throughput**: no se proporcionan datos oficiales. En la verificación de paridad numérica se ejecutó sobre una AMD Radeon AI PRO R9700 (RDNA4) con wgpu/Vulkan, obteniendo resultados correctos, pero sin métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Tamaño | Dimensiones | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| **paraphrase-multilingual-MiniLM-L12-v2** (original) | ~470 MB | 384 | 50+ | 512 (128 por defecto) | Apache-2.0 | ONNX, PyTorch |
| **paraphrase-multilingual-MiniLM-L12-v2-burnpack** (este repo) | ~470 MB | 384 | 50+ | 512 (128 por defecto) | Apache-2.0 | burnpack |
| **all-MiniLM-L6-v2** | ~90 MB | 384 | Solo inglés | 256 (128 por defecto) | Apache-2.0 | ONNX, PyTorch |
| **bge-m3** | ~2.2 GB | 1024 | 100+ | 8192 | MIT | ONNX, PyTorch |

Este modelo es una conversión directa del primero, por lo que el rendimiento es idéntico al original. Comparado con `all-MiniLM-L6-v2`, ofrece multilingüismo a costa de un peso mayor; comparado con `bge-m3`, es más ligero pero con menor capacidad de contexto y dimensiones más reducidas.

## Limitaciones y advertencias

- **No es un modelo original**: es una conversión de formato, por lo que no aporta ninguna mejora de rendimiento ni nuevas capacidades. Para evaluar el modelo real, hay que usar el repositorio original.
- **Tokenización no incluida**: este repositorio no distribuye el tokenizador (solo el `tokenizer.json` con presets). Hay que obtenerlo del modelo original para poder usar el modelo en Burn.
- **Truncación por defecto**: sentence-transformers usa `max_seq_length` de 128 tokens, aunque la arquitectura soporta hasta 512. Frases largas perderán información.
- **Sin normalización automática**: el modelo no incluye L2-normalización; para usar similitud de coseno es necesario normalizar los embeddings manualmente.
- **Sesgos y alucinación**: al ser un modelo de embeddings, no genera texto y por tanto no sufre alucinación en el sentido clásico. Sin embargo, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, asociaciones culturales o de género).
- **Uso comercial**: licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe conservar la atribución correspondiente al modelo original.
- **Serialización no determinista**: los archivos `burnpack` generados desde el mismo ONNX pueden tener bytes diferentes, aunque los valores de los tensores sean idénticos. Esto no afecta al resultado numérico.

## Enlaces

- [Repositorio del modelo en Hugging Face (Lucie666/paraphrase-multilingual-minilm-l12-v2-burnpack)](https://huggingface.co/Lucie666/paraphrase-multilingual-minilm-l12-v2-burnpack)
- [Modelo original sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- [Página de Burn (librería de deep learning en Rust)](https://burn.dev)
- [Documentación de sentence-transformers](https://www.sbert.net/)
