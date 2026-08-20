# andrerean/minilm-arsip-kampus-seranah

## Resumen

El modelo `andrerean/minilm-arsip-kampus-seranah` es un *sentence transformer* de 117 millones de parámetros, desarrollado por el usuario andrerean, que se obtiene a partir del modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Está diseñado para generar representaciones densas de texto (embeddings) de 384 dimensiones, orientadas a tareas de similitud semántica y recuperación de información, con una longitud máxima de contexto de 384 tokens.

El modelo se ha afinado con un conjunto de datos de 3 090 pares de oraciones etiquetados como positivos (similaridad) y negativos, empleando la pérdida `TrackedMNRLoss`. Aunque el modelo base es multilingüe, el ajuste se ha realizado con datos en indonesio, concretamente con documentos administrativos y de gestión universitaria de la Universidad Darussalam Gontor (UNIDA), lo que lo hace especialmente útil para buscar y relacionar documentos como manuales, procedimientos operativos estándar (SOP), decisiones del rector y otros archivos académicos.

La relevancia de este modelo radica en su especialización en un dominio concreto: la gestión documental de archivos de campus. Frente a los modelos genéricos de embeddings, este modelo ofrece una mayor precisión en la recuperación de documentos administrativos en indonesio, lo que facilita la automatización de búsquedas y clasificación de archivos en entornos universitarios. Su tamaño moderado (118,7 M de parámetros) permite su despliegue en infraestructuras de bajos recursos, incluidas CPU y GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) con 12 capas, 6 cabezas de atención, dimensión oculta 384 |
| Parámetros totales | 117 653 760 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | No publicados (el modelo se distribuye en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta 50+ idiomas, pero el fine-tune se realizó con datos en indonesio) |
| Licencia | No disponible |
| Formato de pesos | safetensors (también compatible con el formato `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **MiniLM** de Microsoft, una variante de BERT con 12 capas y 384 dimensiones ocultas. El modelo base es `paraphrase-multilingual-MiniLM-L12-v2`, un modelo preentrenado con 12 capas y 384 dimensiones, diseñado para generar embeddings multilingües de alta calidad mediante destilación de conocimiento. La estructura completa es una `SentenceTransformer` que combina un transformador BERT con una capa de *pooling* de tipo `mean` (media de los tokens) para obtener un vector de 384 dimensiones.

El entrenamiento se realizó mediante *fine-tuning* del modelo base con un conjunto de datos de 3 090 pares de oraciones, utilizando la función de pérdida `TrackedMNRLoss` (Multiple Negative Ranking Loss con seguimiento). Este tipo de pérdida entrena el modelo para asignar mayor similitud a pares positivos (oraciones semánticamente equivalentes) y menor a pares negativos (oraciones no relacionadas). Los ejemplos mostrados en la tarjeta del modelo indican que los datos provienen de documentos administrativos de la universidad: manuales, SOP, decisiones de rector, etc.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset (más allá del tamaño) ni de técnicas adicionales como RLHF o DPO. El entrenamiento se realizó con la biblioteca `sentence-transformers` y el proceso se automatizó mediante el *trainer* de Hugging Face (`generated_from_trainer`).

## Capacidades

- Generación de embeddings de texto de alta calidad para oraciones y párrafos (hasta 384 tokens) en formato denso de 384 dimensiones.
- Similitud semántica: cálculo de similitud por coseno entre oraciones o documentos.
- Recuperación de información: búsqueda de documentos relevantes mediante consultas en lenguaje natural.
- Clasificación de textos: agrupación de documentos por temas mediante embeddings y clustering.
- Capacidades multilingües heredadas del modelo base: soporta más de 50 idiomas, aunque el fine-tuning se ha orientado a contenido en indonesio.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto. Es un modelo de embeddings puro.

## Casos de uso

- **Búsqueda de archivos administrativos**: permite buscar manuales, SOP, decisiones de rector y otros documentos académicos mediante consultas en lenguaje natural. Por ejemplo, consultar "procedimiento para la evaluación de estudiantes" recupera el documento correspondiente con alta precisión.
- **Clasificación automática de documentos**: al generar embeddings de cada documento, se puede agrupar automáticamente en categorías (manuales, SOP, actas, etc.) mediante técnicas de clustering, facilitando la organización de archivos.
- **Sistema de preguntas y respuestas sobre el archivo institucional**: combinado con un motor de búsqueda vectorial (por ejemplo, FAISS o Elasticsearch), se puede construir un chatbot que responda preguntas sobre políticas universitarias citando las fuentes.
- **Deduplicación de documentos**: al comparar las embeddings de documentos, se pueden identificar duplicados o versiones casi idénticas, evitando redundancia en los archivos.
- **Recomendación de documentos relacionados**: cuando un usuario consulta un documento, se pueden sugerir otros con contenido similar mediante la similitud de embeddings.
- **Análisis de coherencia normativa**: comparar documentos para verificar que los procedimientos internos son consistentes entre sí, detectando posibles contradicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de evaluación sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo está orientado a tareas de similitud semántica, y no se dispone de métricas de rendimiento sobre datasets como STS-B o MTEB.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 118 M de parámetros en formato fp32, la inferencia requiere aproximadamente 470 MB de memoria (118,7 M × 4 bytes). Con cuantización a int8 (no disponible), se reduciría a ~120 MB, pero el modelo no se distribuye en GGUF ni en cuantizaciones.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutar el modelo sin problemas.
- **CPU**: es factible ejecutar la inferencia en CPU con tiempos de latencia del orden de 10-50 ms por oración, dependiendo de la longitud.
- **Opciones de despliegue**: se puede usar con la biblioteca `sentence-transformers` en Python, o mediante el servidor de inferencia de Hugging Face (`text-embeddings-inference`) que es compatible con modelos de embeddings. También se puede integrar con FAISS, Elasticsearch o Milvus para búsqueda vectorial.
- **Latencia y throughput**: no se dispone de mediciones oficiales, pero dado el tamaño del modelo, se espera un throughput de cientos de oraciones por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| `paraphrase-multilingual-MiniLM-L12-v2` (base) | 118,7 M | 384 | 50+ | Apache 2.0 | Multilingüe genérico |
| `andrerean/minilm-arsip-kampus-seranah` (fine-tune) | 118,7 M | 384 | No disponible (fine-tune en indonesio) | No disponible | Especializado en documentos administrativos universitarios |
| `all-MiniLM-L6-v2` | 22,7 M | 256 | Inglés (principalmente) | Apache 2.0 | Embeddings generales en inglés |

La comparativa muestra que el modelo es una variante ajustada de un modelo multilingüe conocido, con el mismo tamaño y contexto. La ventaja del fine-tune es la mejora en el dominio específico, aunque no se dispone de métricas que cuantifiquen esa mejora.

## Limitaciones y advertencias

- **Licencia desconocida**: la tarjeta del modelo no especifica la licencia, por lo que no se puede garantizar su uso comercial sin autorización del autor.
- **Sesgos del dominio**: el entrenamiento se realizó exclusivamente con documentos de la Universidad de Darussalam Gontor, lo que puede limitar su generalización a otros contextos académicos o administrativos fuera de esa institución.
- **Alucinación**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en el sentido clásico. Sin embargo, la búsqueda puede devolver resultados falsos si las embeddings no discriminan bien entre documentos similares.
- **Limitación de idioma**: aunque el modelo base es multilingüe, el fine-tune se realizó con datos en indonesio, por lo que su rendimiento en otros idiomas podría degradarse.
- **Contexto limitado**: la longitud máxima de 384 tokens es corta para documentos largos. Se recomienda dividir los documentos en fragmentos de ese tamaño antes de generar embeddings.
- **Sin soporte para generación**: no es un modelo generativo; solo produce representaciones vectoriales.
- **Datos de entrenamiento limitados**: solo 3 090 pares de oraciones, lo que puede ser insuficiente para cubrir toda la variabilidad del dominio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/andrerean/minilm-arsip-kampus-seranah)
- [Modelo base: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
- [Documentación de Sentence Transformers](https://sbert.net)
- [Repositorio de Sentence Transformers en GitHub](https://github.com/huggingface/sentence-transformers)
- [Paper de MiniLM (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper de Sentence-BERT (arXiv:1807.03748)](https://arxiv.org/abs/1807.03748)
