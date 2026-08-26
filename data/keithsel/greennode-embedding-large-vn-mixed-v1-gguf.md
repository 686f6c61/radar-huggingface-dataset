# Keithsel/GreenNode-Embedding-Large-VN-Mixed-V1-GGUF

## Resumen

GreenNode-Embedding-Large-VN-Mixed-V1-GGUF es la conversión a formato GGUF en precisión F16 del modelo de embeddings GreenNode-Embedding-Large-VN-Mixed-V1, desarrollado por GreenNode.ai y publicado por Keithsel. Se trata de un sentence transformer basado en la arquitectura XLM-RoBERTa que mapea frases y párrafos a un espacio vectorial denso de 1024 dimensiones, optimizado para tareas de recuperación semántica, similitud textual, búsqueda y clasificación.

La versión GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles como Ollama, sin necesidad de depender de la librería sentence-transformers ni de PyTorch. El modelo está entrenado específicamente para recuperación de tablas en formato Markdown (dataset GreenNode-Table-Markdown-Retrieval) y muestra resultados competitivos en recuperación de textos legales vietnamitas, superando en varias métricas a alternativas multilingües como me5-large o M3-Embedding.

Con 566,7 millones de parámetros y una ventana de contexto de 8192 tokens, este modelo destaca por su soporte bilingüe (vietnamita e inglés) y por su licencia MIT, que permite uso comercial sin restricciones. Es relevante para el ecosistema vietnamita de procesamiento de lenguaje natural y para equipos que necesitan embeddings de alta calidad en entornos de producción con despliegue ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLMRobertaModel) con pooling CLS y normalización |
| Parametros totales | 566.703.104 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 (GGUF) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

El modelo es un sentence transformer basado en la arquitectura XLM-RoBERTa (XLMRobertaModel), con una capa de pooling que utiliza el token CLS como representación de la secuencia y una normalización final de los vectores. La dimensionalidad de salida es de 1024 y la función de similitud recomendada es la similitud coseno. La ventana de contexto máxima es de 8192 tokens, lo que permite procesar documentos largos como tablas Markdown o textos legales.

El entrenamiento se realizó sobre el dataset GreenNode/GreenNode-Table-Markdown-Retrieval, que contiene pares de consultas y documentos en formato tabla Markdown. La métrica de entrenamiento indicada es InfoNCE, una función de pérdida contrastiva habitual en modelos de recuperación. La versión GGUF es una conversión directa del modelo original en safetensors a precisión F16, sin cambios en la arquitectura ni en los pesos, por lo que las capacidades del modelo original se mantienen intactas.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases, párrafos y documentos.
- Similitud semántica textual mediante correlación coseno.
- Búsqueda semántica y recuperación de información, especialmente optimizada para tablas en formato Markdown.
- Clasificación de texto y clustering mediante representaciones vectoriales.
- Detección de paráfrasis y minería de paráfrasis.
- Soporte bilingüe en vietnamita e inglés, con mejor rendimiento en vietnamita.
- Compatible con la librería sentence-transformers y con llama.cpp / Ollama mediante el formato GGUF.
- Ventana de contexto de 8192 tokens, adecuada para documentos largos.

## Casos de uso

- Recuperación de documentos legales: el modelo alcanza un MAP@5 de 69,75 en el dataset ZacLegalTextRetrieval, superando a OpenAI-embedding-v3 y me5-large, por lo que es adecuado para sistemas de búsqueda en bases de datos legales vietnamitas.
- Búsqueda semántica en tablas Markdown: está entrenado específicamente con el dataset GreenNode-Table-Markdown-Retrieval, por lo que es óptimo para indexar y buscar contenido en tablas, documentación técnica y wikis en formato Markdown.
- Clasificación de texto multilingüe: los embeddings de 1024 dimensiones pueden alimentar clasificadores lineales para tareas de categorización de documentos en vietnamita e inglés.
- Clustering y organización de corpus: permite agrupar documentos por similitud temática, útil para construir bases de conocimiento o sistemas de recomendación de contenido.
- Detección de duplicados y paráfrasis: aplicable a sistemas de detección de contenido duplicado en foros, noticias o bases de datos.
- Despliegue ligero en producción: al estar disponible en GGUF F16, puede ejecutarse en CPU con llama.cpp o en GPU de gama media, sin depender de PyTorch, lo que facilita la integración en pipelines de producción con pocos recursos.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con alternativas en dos datasets de recuperación:

| Modelo | GreenNodeTableRetrieval (Mean ↑) | ZacLegalTextRetrieval (Mean ↑) |
|---|---|---|
| me5_small | 36,17 | 59,13 |
| me5_large | 40,80 | 64,99 |
| M3-Embedding | 39,12 | 74,67 |
| OpenAI-embedding-v3 | 33,06 | 41,74 |
| halong-embedding | 34,63 | 57,55 |
| sup-SimCSE-Vietnamese-phobert_base | 12,31 | 28,46 |
| vietnamese-bi-encoder | 14,89 | 61,99 |
| M3-GN-VN | 46,23 | 70,17 |
| **M3-GN-VN-Mixed** | **44,89** | **74,95** |

Desglose completo del modelo en GreenNodeTableRetrieval: MAP@5 42,08, MRR@5 42,08, NDCG@5 44,33, Recall@5 51,06. En ZacLegalTextRetrieval: MAP@5 69,75, MRR@5 69,28, NDCG@5 74,01, Recall@5 86,74.

## Requisitos de hardware

- Tamaño del archivo GGUF F16: aproximadamente 1,1-1,2 GB (el repositorio completo pesa 1,2 GB).
- VRAM estimada para inferencia: al menos 2 GB para cargar el modelo completo en GPU; con CPU es viable con 4 GB de RAM libre.
- GPU recomendadas: tarjetas consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) o GPU de datacenter como A10, A100 o H100 si se procesan lotes grandes.
- En CPU: puede ejecutarse con llama.cpp en procesadores modernos con 8 GB de RAM, aunque la latencia será mayor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. También se puede cargar el modelo original en safetensors con sentence-transformers.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de 566M parámetros en F16, se estima una latencia de decenas de milisegundos por consulta en GPU moderna y de unos pocos cientos de milisegundos en CPU, dependiendo de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento medio (GreenNodeTableRetrieval) |
|---|---|---|---|---|---|
| GreenNode-Embedding-Large-VN-Mixed-V1 (GGUF) | 566,7M | 8192 | MIT | GGUF | 44,89 |
| me5-large | no disponible | no disponible | no disponible | safetensors | 40,80 |
| M3-Embedding | no disponible | no disponible | no disponible | safetensors | 39,12 |
| OpenAI-embedding-v3 | no disponible | no disponible | propietaria | API | 33,06 |
| halong-embedding | no disponible | no disponible | no disponible | safetensors | 34,63 |

El modelo supera en la métrica media del dataset GreenNodeTableRetrieval a las alternativas comparadas, y en ZacLegalTextRetrieval iguala o supera a M3-Embedding. No se dispone de datos de parámetros, contexto o licencia para los modelos de comparación en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para vietnamita; el rendimiento en inglés puede ser inferior, aunque se incluye como idioma soportado.
- No se han publicado estudios sobre sesgos o alucinaciones en la información disponible; como cualquier modelo de embeddings, puede reflejar sesgos presentes en los datos de entrenamiento.
- La ventana de contexto es de 8192 tokens, por lo que textos más largos deberán truncarse o dividirse.
- La conversión GGUF es en precisión F16, lo que duplica el tamaño en memoria respecto a cuantizaciones más agresivas (como Q8 o Q4), aunque conserva mejor la calidad.
- No se ha validado el modelo en tareas fuera de recuperación de tablas y textos legales; su rendimiento en otros dominios puede ser menor.
- El modelo es exclusivamente para embeddings; no genera texto ni admite tool calling, agentes ni razonamiento conversacional.
- El dataset de entrenamiento es de dominio público, pero no se detalla la composición completa ni el proceso de curado.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/Keithsel/GreenNode-Embedding-Large-VN-Mixed-V1-GGUF
- Modelo original en safetensors: https://huggingface.co/GreenNode/GreenNode-Embedding-Large-VN-Mixed-V1
- Modelo base GreenNode-Embedding-Large-VN-V1: https://huggingface.co/GreenNode/GreenNode-Embedding-Large-VN-V1
- Dataset de entrenamiento: https://huggingface.co/datasets/GreenNode/GreenNode-Table-Markdown-Retrieval-VN
- Dataset de evaluación legal: https://huggingface.co/datasets/GreenNode/zalo-ai-legal-text-retrieval-vn
- Entrada en MTEB Leaderboard: https://mteb-leaderboard.hf.space/models/GreenNode/GreenNode-Embedding-Large-VN-Mixed-V1
