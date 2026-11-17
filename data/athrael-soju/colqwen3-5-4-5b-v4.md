# athrael-soju/ColQwen3.5-4.5B-v4

## Resumen

ColQwen3.5-4.5B-v4 es un recuperador visual de documentos (visual document retrieval) basado en interacción tardía (late interaction, estilo ColBERT) construido sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla athrael-soju y se publica bajo licencia Apache 2.0. El modelo transforma cada consulta y cada página de documento en un conjunto de vectores de token de 2048 dimensiones, y calcula la relevancia mediante la puntuación MaxSim entre ambos conjuntos. Con 4.544.510.464 parámetros (4,5B) y pesos en BF16, se distribuye a través de la librería sentence-transformers con la clase `MultiVectorEncoder`.

El problema que resuelve es la recuperación de información sobre documentos en formato imagen (páginas escaneadas, informes, gráficos, tablas) sin necesidad de un pipeline OCR previo: el modelo procesa la página como imagen y genera embeddings multi-vector directamente. Es relevante porque combina la precisión de la interacción tardía con un backbone de lenguaje moderno y un esquema Matryoshka que permite recortar los embeddings de 2048 a 64 dimensiones, reduciendo el tamaño del índice hasta 1/32 sin reentrenar.

La versión v4 se ha entrenado mediante un recetario de destilación multi-etapa a partir de un profesor de interacción tardía de mayor tamaño, con minería de negativos duros y un reranker que filtra negativos que en realidad son relevantes. Soporta seis idiomas (inglés, francés, alemán, español, italiano y portugués) y declara atención bidireccional, un detalle crítico para que los embeddings sean correctos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional (`is_causal: false`), recuperación multi-vector con interacción tardía (MaxSim, estilo ColBERT) sobre Qwen3.5-4B |
| Parametros totales | 4.544.510.464 (4,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; los pesos se distribuyen en BF16. Los embeddings admiten truncamiento Matryoshka a 64, 128, 256, 512, 1024 y 2048 dimensiones |
| Idiomas soportados | en, fr, de, es, it, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y lo convierte en un codificador multi-vector para consultas y documentos visuales. Cada consulta y cada página se representan como un conjunto de vectores de token de 2048 dimensiones; la relevancia se obtiene con MaxSim, la suma sobre los tokens de consulta del máximo producto escalar contra los tokens de la página. La atención es bidireccional: la model card advierte que con `transformers` anterior a 5.2.0 se ignora el `is_causal: false` de la configuración, el modelo se ejecuta con atención causal y produce embeddings distintos, por lo que Sentence Transformers no lo carga. La proyección se entrenó con prefijos Matryoshka en 64, 128, 256, 512, 1024 y 2048 dimensiones, de modo que conservar las primeras W dimensiones de cada vector de token y renormalizar a longitud unitaria da un embedding de W dimensiones válido.

El entrenamiento de v4 sigue una receta de destilación multi-etapa: un profesor de interacción tardía de mayor tamaño puntúa cada consulta de entrenamiento contra su página positiva y contra negativos duros minados, y un reranker elimina los negativos que en realidad son relevantes. Las semillas del estudiante parten de la release anterior, entrenan adaptadores LoRA durante una época contra las puntuaciones del profesor y se fusionan de vuelta en su punto de partida. Los conjuntos de datos declarados son vidore/colpali_train_set, openbmb/VisRAG-Ret-Train-Synthetic-data, openbmb/VisRAG-Ret-Train-In-domain-data, llamaindex/vdr-multilingual-train, Tevatron/docmatix-ir y Tevatron/wiki-ss-nq. El autor indica que la receta completa y los datasets se compartirán próximamente; no se especifica el número total de tokens de entrenamiento.

## Capacidades

- Recuperación visual de documentos: genera embeddings de página a partir de imágenes, sin OCR intermedio.
- Recuperación multi-vector con interacción tardía (MaxSim) para consultas de lenguaje natural contra páginas visuales.
- Embeddings Matryoshka: truncamiento de 2048 a 64 dimensiones con renormalización, para indexación a menor coste.
- Soporte multilingüe en consultas y documentos para en, fr, de, es, it y pt.
- Procesamiento de documentos con gráficos, tablas y maquetación compleja (las evaluaciones incluyen TabFQuAD, TAT-DQA, InfoVQA y DocVQA).
- Integración con sentence-transformers mediante `MultiVectorEncoder` (`encode_query`, `encode_document`, `similarity`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking: es un modelo de recuperación, no un generador.

## Casos de uso

- Búsqueda sobre archivos escaneados: indexar páginas de PDF como imágenes y recuperar las relevantes para una consulta textual, evitando errores de OCR en documentos con maquetación irregular.
- Recuperación en informes financieros: las evaluaciones ViDoRe V3 cubren dominios Finance EN (72,49 nDCG@10) y Finance FR (56,09), lo que lo hace adecuado para localizar tablas y cifras en informes anuales.
- Documentación científica y técnica: con 93,18 en ArxivQA y 94,65 en InfoVQA (nDCG@5), sirve para buscar figuras y resultados en artículos y manuales técnicos.
- Cumplimiento y ESG: los resultados en ESG Reports (68,91) y ESG Reports HL (77,33) en ViDoRe V2 lo orientan a la localización de métricas y declaraciones en informes de sostenibilidad.
- Atención al cliente sobre base documental visual: recuperar la página exacta de un manual o póliza a partir de una pregunta del usuario y pasarla a un generador para la respuesta final (patrón RAG visual).
- Indexación a gran escala con presupuesto de almacenamiento ajustado: usar los prefijos Matryoshka de 256 o 512 dimensiones para reducir el índice entre 4x y 8x respecto a 2048 dimensiones, con una primera fase de recuperación y una segunda de re-scoring a dimensión completa.
- Búsqueda multilingüe en corpus europeos: consultas en español o italiano contra páginas en francés o alemán dentro del mismo índice, al compartir espacio de embeddings para los seis idiomas declarados.

## Benchmarks y rendimiento

Resultados publicados en la model card, nDCG ×100 con 1.792 tokens visuales por página y embeddings de 2048 dimensiones, evaluados con mteb 2.26.3.

ViDoRe V3 (nDCG@10):

| Industrial | Finance EN | Finance FR | Pharma | Energy | Physics | Computer Science | HR | Media |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 59,27 | 72,49 | 56,09 | 70,85 | 72,08 | 53,29 | 82,86 | 70,21 | **67,14** |

ViDoRe V1 (nDCG@5):

| ArxivQA | DocVQA | InfoVQA | ShiftProject | SynAI | SynEnergy | SynGov | SynHealth | TabFQuAD | TAT-DQA | Media |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 93,18 | 68,08 | 94,65 | 96,05 | 100,00 | 98,63 | 99,26 | 100,00 | 97,40 | 83,68 | **93,09** |

ViDoRe V2 (nDCG@5):

| BioMedical Lectures | ESG Reports HL | ESG Reports | Economics Reports | Media |
|---:|---:|---:|---:|---:|
| 69,33 | 77,33 | 68,91 | 63,54 | **69,78** |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en las mismas tablas, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para pesos (4,5B parámetros × 2 bytes), más memoria para activaciones y los mapas visuales de página; presupuestar 16-24 GB para lotes pequeños de páginas.
- GPU recomendadas: A100 40/80 GB o H100 para indexación por lotes a gran escala; L40S o RTX 6000 Ada para servidores de recuperación.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en BF16 con lotes reducidos; en GPUs de 16 GB o menos hará falta cuantización, que no está documentada por el autor.
- Despliegue: la vía soportada es sentence-transformers (`sentence-transformers[image]>=6.0.0`) con `MultiVectorEncoder`, que requiere `transformers>=5.2.0`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un codificador multi-vector de recuperación no es un caso de uso natural para servidores de generación.
- Almacenamiento del índice: con 1.792 tokens visuales por página y 2048 dimensiones en BF16, cada página ocupa del orden de 7 MB antes de compresión; los prefijos Matryoshka reducen esa cifra proporcionalmente (aproximadamente 0,9 MB a 256 dimensiones).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ColQwen3.5-4.5B-v4 | 4,5B | No disponible | Multi-vector late interaction sobre Qwen3.5-4B, Matryoshka 64-2048 | en, fr, de, es, it, pt | Apache 2.0 | Hugging Face, sentence-transformers |
| Familia ColPali / ColQwen (referencia de la categoría) | No disponible en esta información | No disponible | Multi-vector late interaction sobre backbones PaliGemma / Qwen2-VL | No disponible | No disponible | Hugging Face |
| Familia VisRAG-Ret (referencia de la categoría) | No disponible en esta información | No disponible | Recuperación visual de documentos | No disponible | No disponible | Hugging Face |

No se dispone en la información proporcionada de cifras de parámetros, contexto ni rendimiento de los modelos alternativos que permitan una comparación cuantitativa fiable; los datasets de entrenamiento de este modelo incluyen datos de VisRAG-Ret, lo que sugiere solapamiento de categoría pero no permite inferir resultados comparables.

## Limitaciones y advertencias

- Es un modelo de recuperación, no un generador: no produce respuestas, resúmenes ni texto; debe combinarse con un LLM para tareas de respuesta final.
- Dependencia estricta de versiones: con `transformers` anterior a 5.2.0 la atención se ejecuta como causal y los embeddings resultantes son distintos y silenciosamente incorrectos; la carga falla en Sentence Transformers, pero cualquier integración propia debe verificar `is_causal: false`.
- Los benchmarks publicados son del propio autor, con una configuración concreta (1.792 tokens visuales por página, 2048 dimensiones) y sin comparación en las mismas tablas frente a alternativas; la generalización a otros dominios no está avalada por datos independientes.
- Cobertura lingüística limitada a seis idiomas; no se declara soporte de otras lenguas y el rendimiento fuera de ellas no está medido.
- Riesgo de falsos positivos en la recuperación cuando el corpus contiene páginas visualmente similares; el propio pipeline de entrenamiento necesitó un reranker para descartar negativos que eran relevantes, lo que indica que el modelo puede puntuar alto documentos semánticamente cercanos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B y los datasets de entrenamiento pueden tener términos propios que conviene revisar antes de un despliegue en producción.
- El coste de almacenamiento del índice multi-vector es alto a dimensión completa; sin aplicar los prefijos Matryoshka, un corpus grande puede resultar inviable en memoria.
- Sin datos publicados de latencia, throughput ni comportamiento en cuantización, la planificación de capacidad en producción requiere medición propia.
- La receta de entrenamiento completa y los datasets definitivos aún no se han publicado, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athrael-soju/ColQwen3.5-4.5B-v4
- Resultados por tarea (mteb): https://huggingface.co/athrael-soju/ColQwen3.5-4.5B-v4/tree/main/results
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset vidore/colpali_train_set: https://huggingface.co/datasets/vidore/colpali_train_set
- Dataset openbmb/VisRAG-Ret-Train-Synthetic-data: https://huggingface.co/datasets/openbmb/VisRAG-Ret-Train-Synthetic-data
- Dataset openbmb/VisRAG-Ret-Train-In-domain-data: https://huggingface.co/datasets/openbmb/VisRAG-Ret-Train-In-domain-data
- Dataset llamaindex/vdr-multilingual-train: https://huggingface.co/datasets/llamaindex/vdr-multilingual-train
- Dataset Tevatron/docmatix-ir: https://huggingface.co/datasets/Tevatron/docmatix-ir
- Dataset Tevatron/wiki-ss-nq: https://huggingface.co/datasets/Tevatron/wiki-ss-nq
