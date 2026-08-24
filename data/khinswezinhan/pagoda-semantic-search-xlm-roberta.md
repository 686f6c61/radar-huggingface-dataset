# khinswezinhan/pagoda-semantic-search-xlm-roberta

# Ficha del modelo: pagoda-semantic-search-xlm-roberta

## Resumen

El modelo `khinswezinhan/pagoda-semantic-search-xlm-roberta` es un fine-tuning de `FacebookAI/xlm-roberta-base` orientado a la búsqueda semántica de información sobre pagodas en idioma birmano. Desarrollado por el usuario de Hugging Face `khinswezinhan`, este modelo genera embeddings densos de frases para tareas de similitud y recuperación semántica, utilizando la librería `sentence-transformers`. Se entrenó con un conjunto de datos muy reducido (312 ejemplos) y la función de pérdida `MultipleNegativesRankingLoss`, lo que lo convierte en una solución especializada para un dominio concreto: la consulta y comparación de textos históricos y descriptivos sobre estupas y templos de Myanmar.

Aunque el modelo no está pensado para generación de texto, su utilidad radica en permitir sistemas de recuperación de información (RAG) o motores de búsqueda semántica en birmano, un idioma de bajos recursos donde los modelos multilingües generalistas suelen tener un rendimiento limitado. Al estar basado en XLM-RoBERTa, hereda una arquitectura transformer encoder-only con 278 millones de parámetros, y su tamaño de repositorio (1,1 GB) sugiere que los pesos se almacenan en precisión completa (fp32). Es un modelo de nicho, con cero descargas y cero likes en el momento de su publicación, lo que indica que se encuentra en una fase temprana de adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-base) |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de XLM-RoBERTa-base, típicamente 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los ejemplos de la model card muestran texto en birmano) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `FacebookAI/xlm-roberta-base`, un transformer encoder-only multilingüe entrenado por Meta AI sobre 2,5 TB de datos de CommonCrawl filtrados en 100 idiomas. XLM-RoBERTa emplea el mismo diseño que RoBERTa (masked language modeling) pero con un vocabulario compartido para múltiples lenguas, lo que le permite transferir conocimiento entre idiomas, especialmente útil para lenguas de bajos recursos como el birmano.

El fine-tuning se realizó con la librería `sentence-transformers` y la pérdida `MultipleNegativesRankingLoss`, una técnica estándar para entrenar modelos de embeddings de frases. El conjunto de datos utilizado tiene un tamaño de 312 ejemplos, lo que indica un entrenamiento a pequeña escala, probablemente sobre pares de consulta-documento relacionados con pagodas y su historia. No se dispone de información sobre el número de épocas, el optimizador o la estrategia de hard negatives. Tampoco se menciona el uso de RLHF o DPO, ya que se trata de un modelo de representación, no generativo.

## Capacidades

- Genera embeddings densos de frases para medir similitud semántica (coseno, producto escalar, etc.).
- Recuperación de información: dado un texto de consulta, encuentra los documentos más relevantes de un corpus.
- Clustering y agrupación de textos por similitud temática.
- Búsqueda semántica multilingüe (heredada de XLM-RoBERTa, aunque el fine-tuning está orientado al birmano).
- Extracción de características (feature extraction) para downstream tasks como clasificación o deduplicación.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder-only.

## Casos de uso

- Motor de búsqueda semántica para un catálogo de pagodas y templos de Myanmar: permite a los usuarios consultar en birmano frases como "ပြည်မြို့နယ် ဘုရား" (pagoda del municipio de Pyay) y obtener resultados relevantes de una base de datos de descripciones históricas.
- Sistema de preguntas y respuestas sobre patrimonio cultural: combinado con un pipeline de retrieval-augmented generation (RAG), el modelo puede recuperar pasajes relevantes de documentos sobre estupas para alimentar a un LLM generativo.
- Deduplicación de registros en bases de datos de monumentos: al comparar embeddings de descripciones, se pueden identificar entradas duplicadas o variantes de nombres de pagodas.
- Clasificación automática de textos arqueológicos: agrupar artículos, informes o notas de campo por tema o región geográfica.
- Asistente de investigación para historiadores y arqueólogos: permite buscar referencias cruzadas entre fuentes birmanas y multilingües.
- Recomendación de contenido en portales turísticos: sugerir pagodas similares a partir de la descripción de una consulta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de retrieval como NDCG o MRR para este modelo. Dado el tamaño reducido del dataset de entrenamiento, es probable que el rendimiento en tareas generales sea limitado, pero no se puede cuantificar sin evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 278M parámetros. En fp32, el tamaño de los pesos es de aproximadamente 1,1 GB (coincide con el tamaño del repo). Para inferencia con `sentence-transformers`, se puede ejecutar en CPU con ~2-3 GB de RAM, o en GPU con 2 GB de VRAM (por ejemplo, una NVIDIA T4 o RTX 2060).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060 o superior permitirá un throughput alto.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se puede servir con `sentence-transformers` directamente, o mediante `text-embeddings-inference` (el modelo es compatible con endpoints, según los tags). También es posible exportar a ONNX o usar `fastembed` para entornos ligeros.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna, la codificación de una frase típica (menos de 100 tokens) debería tomar menos de 10 ms; en CPU, entre 50 y 200 ms dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría. Como referencia, se pueden considerar otros fine-tunes de XLM-RoBERTa para búsqueda semántica, como `intfloat/multilingual-e5-small` (118M parámetros) o `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (118M parámetros), ambos multilingües y con licencias permisivas. Sin embargo, el modelo aquí descrito está especializado en un dominio muy concreto (pagodas birmanas) y no se han publicado métricas comparativas. La tabla siguiente es orientativa, basada en características generales conocidas de los modelos base:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| pagoda-semantic-search-xlm-roberta | 278M | no disponible | birmano (especializado) | no disponible |
| intfloat/multilingual-e5-small | 118M | 512 | 100+ | MIT |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | 512 | 50+ | Apache-2.0 |

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente pequeño (312 ejemplos), lo que limita la generalización y puede provocar sobreajuste al dominio específico de las pagodas.
- No se ha especificado la licencia, lo que impide su uso comercial sin una aclaración previa por parte del autor.
- El modelo solo produce embeddings; no puede generar respuestas ni mantener conversaciones.
- No hay información sobre sesgos, pero al estar entrenado sobre un corpus muy reducido y especializado, es probable que tenga un vocabulario limitado fuera del ámbito de las pagodas.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en recuperación si los textos son muy similares superficialmente.
- La longitud de contexto no está documentada; se asume la de XLM-RoBERTa-base (512 tokens), pero no se ha verificado en este fine-tuning.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/khinswezinhan/pagoda-semantic-search-xlm-roberta)
- [Perfil del autor en Hugging Face](https://huggingface.co/khinswezinhan)
- [Documentación de XLM-RoBERTa](https://huggingface.co/docs/transformers/model_doc/xlm-roberta)
- [Artículo de XLM-RoBERTa en AI Wiki](https://aiwiki.ai/wiki/xlm-roberta)
- [Introducción a RoBERTa (GeeksforGeeks)](https://www.geeksforgeeks.org/machine-learning/overview-of-roberta-model/)
