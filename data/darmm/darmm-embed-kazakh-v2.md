# Darmm/darmm-embed-kazakh-v2

## Resumen

`darmm-embed-kazakh-v2` es un modelo de embeddings de recuperación generalista para texto en kazajo, desarrollado por Darmm. Se construye mediante fine-tuning de `BAAI/bge-m3`, un modelo de representaciones multilingüe con arquitectura XLM-RoBERTa de 568 millones de parámetros y salida de 1024 dimensiones. Su objetivo principal es ofrecer búsqueda semántica, recuperación para RAG, deduplicación y clustering sobre corpus kazajos, con una alineación cross-lingual fuerte hacia ruso e inglés: una consulta en kazajo puede recuperar documentos en ruso o inglés por significado.

El modelo fue entrenado sobre 373k pares kazajos procedentes de un dataset propio (Darmm/darmm-kk-retrieval-pairs), que incluye pares estructurales de Wikipedia en kazajo, oraciones paralelas kk↔ru (WikiMatrix) y kk↔en (NLLB), además de pares de instrucciones tipo QA. En las evaluaciones reportadas, supera a `BAAI/bge-m3` y a la versión anterior `darmm-embedding-multilingual` en recuperación monolingüe kazaja y en recuperación cross-lingual. Es un modelo ligero que se ejecuta sin problemas en GPUs de consumo o incluso en CPU, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa, heredada de BAAI/bge-m3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (8k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 1024 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `BAAI/bge-m3`, que es un transformer basado en XLM-RoBERTa con 568M de parámetros y una ventana de contexto de hasta 8.192 tokens. La salida de la cabeza de representación es un vector denso de 1024 dimensiones, que se normaliza para usar similitud coseno directamente.

Para el entrenamiento se utilizaron 373.000 pares kazajos del dataset `Darmm/darmm-kk-retrieval-pairs`. La composición incluye pares estructurales de la Wikipedia kazaja (título↔primer párrafo, secciones, párrafos adyacentes), oraciones paralelas kk↔ru extraídas de WikiMatrix y kk↔en de NLLB, además de pares de preguntas y respuestas de instrucciones en kazajo. El entrenamiento se realizó con la pérdida `MultipleNegativesRankingLoss`, usando negativos in-batch y un muestreador sin duplicados. Se entrenó únicamente 1 época con tamaño de lote 32, longitud máxima de secuencia de 192 tokens, tasa de aprendizaje de 2e-5 con programación coseno y 5% de warmup, en precisión bf16 sobre una GPU A100. La pérdida final de entrenamiento fue de 0,137. La longitud de secuencia de 192 tokens en entrenamiento implica que la calidad en pasajes mucho más largos no fue ajustada específicamente, sino heredada del modelo base.

## Capacidades

- Representaciones vectoriales de oraciones y párrafos de alta calidad para kazajo, con una dimensión de salida de 1024.
- Recuperación semántica monolingüe en kazajo: mejora el Recall@1 en un 7,5% respecto a bge-m3.
- Recuperación cross-lingual: una consulta en kazajo puede encontrar documentos en ruso e inglés por significado, con una precisión Accuracy@1 de 0,668 para kk→ru y 0,918 para kk→en en los conjuntos de evaluación propios.
- Similaridad de oraciones y párrafos, adecuada para tareas de duplicado semántico y clustering.
- Soporta el pipeline `sentence-similarity` de HuggingFace y es compatible con `sentence-transformers`.
- Compatible con el endpoint de HuggingFace `text-embeddings-inference`, por lo que puede desplegarse en servicios de inferencia estandarizados.
- No genera texto, no soporta tool calling, ni visión ni audio. Es exclusivamente un modelo de representaciones.

## Casos de uso

- Recuperación aumentada (RAG) para documentación corporativa en kazajo: permite indexar manuales, bases de conocimiento y correos internos, y recuperar los fragmentos relevantes a partir de consultas en kazajo. El modelo maneja ventanas de hasta 8k tokens, suficiente para párrafos extensos.
- Atención al cliente multilingüe: un usuario escribe una consulta en kazajo y el sistema recupera respuestas almacenadas en ruso o inglés, gracias a la alineación cross-lingual. Se puede integrar en un chatbot con búsqueda semántica.
- Deduplicación de noticias o artículos en kazajo: al generar embeddings de cada titular, se pueden detectar noticias repetidas o reescrituras del mismo evento mediante similitud coseno.
- Clustering temático de corpus kazajos: usando los embeddings y algoritmos como HDBSCAN o K-Means, se pueden agrupar documentos por tema sin necesidad de etiquetas previas.
- Búsqueda semántica en webs de noticias o blogs kazajos: permite sustituir la búsqueda por palabras clave con búsqueda por significado, mejorando la relevancia de resultados para consultas ambiguas o mal redactadas.
- Revisión de traducciones: para pares kk-ru o kk-en, el modelo puede evaluar si dos textos son semánticamente equivalentes, útil en sistemas de control de calidad de traducción automática.
- Motores de recomendación de contenidos: a partir de las preferencias del usuario, se calcula la similitud entre artículos o documentos kazajos y se generan sugerencias personalizadas.

## Benchmarks y rendimiento

La tabla siguiente proviene de la evaluación publicada por el autor sobre conjuntos de validación no vistos durante el entrenamiento. En la tarea de recuperación kazaja, se usaron 6.322 títulos de artículos como consultas contra 6.322 primeros párrafos. En la tarea cross-lingual, se emparejó una frase kazaja con su traducción dentro de un conjunto de 2.000 candidatos.

| Metrica | darmm-embed-kazakh-v2 | BAAI/bge-m3 | darmm-embedding-multilingual (v1) |
|---|---|---|---|
| kk retrieval Recall@1 | 0.716 | 0.666 | 0.662 |
| kk retrieval Recall@5 | 0.754 | 0.714 | 0.705 |
| kk retrieval Recall@10 | 0.775 | 0.730 | 0.721 |
| kk retrieval MRR@10 | 0.733 | 0.687 | 0.681 |
| kk→ru Accuracy@1 | 0.668 | 0.518 | 0.546 |
| kk→en Accuracy@1 | 0.918 | 0.851 | 0.855 |

El rendimiento es notablemente superior al modelo base `bge-m3` en todas las métricas evaluadas para kazajo, con una mejoría de 5 puntos en Recall@1 y de 15 puntos en kk→ru Accuracy@1. La versión v1 de Darmm también queda por debajo. No hay datos disponibles sobre benchmarks generales como MTEB o MMLU, ya que el modelo está especializado en kazajo.

## Requisitos de hardware

- VRAM estimada en FP32: el modelo ocupa aproximadamente 2,27 GB solo en pesos (567.754.752 parámetros × 4 bytes).
- VRAM estimada en bf16 o fp16: aproximadamente 1,14 GB para los pesos, más el overhead de ejecución y batch. En la práctica se recomienda disponer de al menos 2 GB de VRAM para inferencia con lotes modestos.
- GPU recomendadas: cualquier GPU moderna con 2 GB o más de VRAM (RTX 2050, RTX 3060, GTX 16xx, A100, etc.). No se requiere una GPU de gama alta para obtener buen rendimiento.
- Es viable ejecutarlo en CPU para lotes pequeños y casos de uso con baja latencia, gracias a su tamaño contenido.
- Opciones de despliegue: `sentence-transformers` (Python), HuggingFace `text-embeddings-inference` (TEI), o mediante el pipeline de HuggingFace. También se puede exportar a ONNX para entornos optimizados.
- Latencia y throughput: no disponible. No se han publicado medidas de rendimiento de inferencia en la información facilitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Rendimiento kk Recall@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| darmm-embed-kazakh-v2 | 567.754.752 | 8192 tokens | 1024 | 0.716 | Apache 2.0 | HuggingFace |
| BAAI/bge-m3 | ~568M (oficial) | 8192 tokens | 1024 | 0.666 | Apache 2.0 | HuggingFace |
| darmm-embedding-multilingual (v1) | no disponible | no disponible | no disponible | 0.662 | Apache 2.0 | HuggingFace |

El modelo actual es una mejora directa de su predecesor v1 y una optimización de `bge-m3` para el idioma kazajo. La principal ventaja frente a `bge-m3` es la adaptación al vocabulario y la estructura morfológica del kazajo, así como la alineación cross-lingual con ruso e inglés, que se traduce en mejores resultados de recuperación.

## Limitaciones y advertencias

- El modelo fue entrenado con pares de una longitud máxima de 192 tokens; por tanto, su comportamiento en pasajes mucho más largos no se ha ajustado específicamente, sino que se hereda de `bge-m3`. En textos extensos puede haber pérdida de precisión semántica.
- Los pares kazajo↔ruso provienen de alineaciones minadas con WikiMatrix y contienen ruido, lo que puede introducir errores en ejemplos de traducción.
- La jerga técnica de dominios como derecho o medicina está poco representada en los datos de entrenamiento, que se basan principalmente en Wikipedia y corpus paralelos generales.
- No se han documentado sesgos específicos ni evaluaciones de equidad para este modelo en la información disponible.
- No genera texto ni responde a instrucciones; es un modelo de embeddings que produce vectores. Si se usa en sistemas de RAG o clasificación, la calidad depende directamente de la cobertura y limpieza del corpus indexado.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar la atribución y las condiciones de la licencia antes de integrarlo en productos con distribución externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darmm/darmm-embed-kazakh-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Darmm/darmm-kk-retrieval-pairs
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Script de evaluación (eval_embed.py): https://huggingface.co/Darmm/darmm-embed-kazakh-v2/blob/main/eval_embed.py
