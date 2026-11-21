# chrystian-yunus/multilingual-e5-base-jkn-id

## Resumen

multilingual-e5-base-jkn-id es un modelo de embeddings de frases (sentence transformer) obtenido mediante ajuste fino supervisado de intfloat/multilingual-e5-base, un transformer basado en la arquitectura XLM-RoBERTa. Lo publica el usuario chrystian-yunus en Hugging Face y su propósito es la similitud semántica y la recuperación de información (information retrieval) sobre textos en indonesio, con especial énfasis en documentos normativos del sector sanitario. El modelo base original es multilingüe, pero este ajuste se ha realizado sobre un conjunto de datos de solo 687 ejemplos, lo que lo especializa en un dominio muy concreto.

El modelo resuelve el problema de la búsqueda semántica dentro de corpus legales y regulatorios: a partir de una consulta en lenguaje natural, genera embeddings densos que permiten recuperar el pasaje normativo relevante (por ejemplo, artículos de un reglamento ministerial). Con 278.043.648 parámetros y un tamaño de repositorio de 1,1 GB, se sitúa en la gama media de los modelos de embeddings, lo que facilita su despliegue en infraestructura modesta.

Su relevancia actual radica en la creciente demanda de sistemas de recuperación aumentada (RAG) para dominios especializados y en idiomas distintos del inglés. No obstante, conviene señalar que el ajuste es muy ligero (687 ejemplos) y que no se han publicado datos sobre licencia ni sobre los idiomas efectivamente soportados tras el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer XLM-RoBERTa (encoder), modelo de embeddings de frases |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo base multilingüe; el ajuste se orienta a indonesio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | intfloat/multilingual-e5-base |
| Libreria | sentence-transformers |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de ajuste | 687 ejemplos |
| Tamano del repositorio | 1,1 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre intfloat/multilingual-e5-base, que a su vez emplea la arquitectura XLM-RoBERTa: un transformer encoder con atención bidireccional diseñado para producir representaciones contextuales de tokens. Sobre esa base se aplica un pooler que agrega las representaciones en un único vector denso por frase, normalizado para permitir la similitud coseno. El resultado es un modelo de 278 millones de parámetros que no genera texto, sino embeddings.

El ajuste fino se realizó con la función de pérdida MultipleNegativesRankingLoss, típica en el entrenamiento de recuperadores densos: cada par consulta-pasaje positivo del lote actúa como negativo para los demás pares, lo que fuerza al modelo a discriminar entre pasajes semánticamente próximos. El conjunto de datos de entrenamiento contiene 687 ejemplos, un volumen reducido que sugiere una especialización estrecha. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de embeddings). Tampoco se detallan innovaciones técnicas adicionales más allá del uso del prefijo `query:` y `passage:` heredado de la familia E5.

## Capacidades

- Generación de embeddings densos de frases y pasajes para similitud semántica y recuperación de información.
- Búsqueda semántica sobre documentos en indonesio, con especialización aparente en textos normativos del sector sanitario (reglamentos ministeriales).
- Extracción de características (feature-extraction) para tareas posteriores de clasificación o clustering.
- Soporte del esquema de prefijos de la familia E5 (`query:` para consultas, `passage:` para documentos), tal como se muestra en los ejemplos de la model card.
- Compatibilidad con text-embeddings-inference y con endpoints de Hugging Face.
- Capacidades multilingües heredadas del modelo base, aunque no verificadas ni documentadas tras el ajuste.
- No soporta tool calling, function calling, generación de texto, razonamiento multi-paso ni modo thinking, al ser un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en corpus normativo sanitario: dado un corpus de reglamentos (por ejemplo, Permenkes), el modelo indexa cada artículo como pasaje y recupera los fragmentos relevantes ante consultas en lenguaje natural, aprovechando el ajuste específico sobre este tipo de texto.
- Sistemas RAG para asistentes legales: el modelo actúa como recuperador en una pipeline de generación aumentada, seleccionando los artículos que se pasan al generador de respuestas; su tamaño de 278 millones permite baja latencia en la fase de recuperación.
- Deduplicación y agrupamiento de documentos: los embeddings permiten detectar artículos o cláusulas duplicadas o semánticamente equivalentes dentro de un repositorio normativo mediante similitud coseno.
- Clasificación de consultas ciudadanas: a partir del embedding de una consulta, se puede entrenar un clasificador ligero que la asigne a la unidad administrativa o al reglamento competente.
- Enrutamiento de tickets de soporte en organismos públicos: el modelo compara la consulta entrante con una base de respuestas y casos previos para dirigirla al equipo adecuado.
- Evaluación de calidad de traducciones o paráfrasis: la similitud coseno entre embeddings sirve como métrica automática para comparar versiones de un mismo texto.
- Filtrado y moderación de contenido en indonesio: la representación densa permite identificar textos que abordan temáticas sensibles comparándolos con un conjunto de referencia.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index de la model card corresponden a una tarea de recuperación de información (Information Retrieval) sobre un dataset no especificado ("Unknown"), con métricas de precisión y recall coseno. No están verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6203 |
| Cosine Accuracy@3 | 0,8734 |
| Cosine Accuracy@5 | 0,9494 |
| Cosine Accuracy@10 | 1,0000 |
| Cosine Precision@1 | 0,6203 |
| Cosine Precision@3 | 0,2911 |
| Cosine Precision@5 | 0,1899 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,6203 |
| Cosine Recall@3 | 0,8734 |
| Cosine Recall@5 | 0,9494 |
| Cosine Recall@10 | 1,0000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de LLM, ya que el modelo no es generativo. No se dispone de comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para los pesos (278 M de parámetros × 4 bytes), más el overhead del runtime y de los tensores de activación.
- VRAM estimada en FP16/BF16: alrededor de 0,6 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) donde el cuello de botella será el throughput, no la memoria.
- También puede ejecutarse en CPU para cargas de baja concurrencia, dado su tamaño reducido.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI) para servir embeddings a escala, y exportación a ONNX para inferencia optimizada.
- No se dispone de datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| multilingual-e5-base-jkn-id | 278 M | no disponible | no disponible | Ajuste sobre 687 ejemplos, orientado a normativa sanitaria en indonesio |
| intfloat/multilingual-e5-base | 278 M | 512 tokens (valor habitual de la familia E5; no confirmado en la informacion disponible) | MIT (modelo base original; no confirmado en la informacion disponible) | Modelo base multilingüe sin ajuste específico de dominio |
| Otros modelos de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que los benchmarks del modelo se calcularon sobre un dataset no identificado y no verificable de forma independiente.

## Limitaciones y advertencias

- El ajuste se realizó con solo 687 ejemplos, lo que limita la generalización y aumenta el riesgo de sobreajuste al dominio y formato concretos del dataset de entrenamiento.
- No se especifica la licencia, por lo que no puede confirmarse la legalidad de su uso comercial; debe contactarse con el autor antes de integrarlo en producción.
- No se documentan los idiomas efectivamente soportados tras el ajuste; aunque el modelo base es multilingüe, el ajuste puede haber degradado el rendimiento en idiomas distintos del indonesio.
- Los benchmarks declarados no están verificados y se calcularon sobre un dataset no identificado, por lo que no son comparables con resultados publicados de otros modelos.
- Al ser un modelo de embeddings, no genera texto y no puede sustituir a un LLM en tareas de razonamiento o generación; su uso requiere una pipeline externa.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base y del dataset de ajuste, no evaluado en la información disponible.
- La longitud máxima de contexto no está documentada; si se excede la ventana del encoder, los textos se truncan y pueden perderse fragmentos relevantes.
- El modelo tiene 28 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrystian-yunus/multilingual-e5-base-jkn-id
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
