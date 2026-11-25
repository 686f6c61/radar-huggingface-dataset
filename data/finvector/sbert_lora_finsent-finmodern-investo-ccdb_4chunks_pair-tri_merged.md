# finvector/sbert_lora_finsent-finmodern-investo-ccdb_4chunks_pair-tri_merged

## Resumen

Este repositorio contiene un modelo de embeddings de frases construido sobre una base BERT y publicado por el usuario finvector bajo licencia Apache 2.0. Con 109.482.240 par\u00e1metros y un peso de repositorio de 0,2 GB, se distribuye en formato safetensors y est\u00e1 pensado para tareas de similitud sem\u00e1ntica y extracci\u00f3n de caracter\u00edsticas mediante la librer\u00eda sentence-transformers. El nombre del repositorio sugiere un proceso de ajuste con LoRA sobre datos financieros (finsent, finmodern, investo) y una posterior fusi\u00f3n de pesos, aunque el autor no documenta ese proceso en la model card.

El problema que aborda es el habitual de los modelos bi-encoder: transformar frases y p\u00e1rrafos en vectores densos de 768 dimensiones para permitir b\u00fasqueda sem\u00e1ntica, agrupamiento y recuperaci\u00f3n de informaci\u00f3n sin necesidad de comparar cada par de frases con atenci\u00f3n cruzada. La relevancia de este artefacto concreto es limitada: la model card publicada es pr\u00e1cticamente id\u00e9ntica a la de sentence-transformers/bert-base-nli-mean-tokens, que el propio autor original marca como obsoleto y de baja calidad, y no se aportan datos de evaluaci\u00f3n propios del ajuste financiero.

La ficha se elabora, por tanto, con la informaci\u00f3n disponible en el repositorio y en la model card heredada. Cualquier dato sobre el corpus de entrenamiento, el rendimiento o los idiomas reales del ajuste debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (BertModel) con capa de pooling; pipeline sentence-transformers |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length declarado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 |
| Pooling | mean tokens (mean pooling con atenci\u00f3n) |
| Tama\u00f1o del repositorio | 0,2 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 109.482.240 par\u00e1metros, seguido de una capa de pooling que promedia los tokens ponderando por la m\u00e1scara de atenci\u00f3n. La model card declara una longitud m\u00e1xima de secuencia de 128 tokens y una dimensi\u00f3n de embedding de 768. El nombre del repositorio indica un ajuste con LoRA sobre un modelo base (probablemente un BERT base) con datos financieros etiquetados como finsent, finmodern e investo, divididos en 4 chunks y con p\u00e9rdida de tipo pair/tri, y una fusi\u00f3n posterior de los adaptadores en los pesos del modelo. No obstante, el autor no detalla el n\u00famero de tokens de entrenamiento, la composici\u00f3n del corpus, la estrategia de negativos ni si se aplic\u00f3 alguna t\u00e9cnica de alineaci\u00f3n adicional.

La model card incluida es la de sentence-transformers/bert-base-nli-mean-tokens, que el propio autor original marca como obsoleta y de baja calidad. Esto implica que las instrucciones de uso, la arquitectura declarada y la cita bibliogr\u00e1fica corresponden a ese modelo base, no necesariamente al resultado del ajuste. No se documenta ninguna innovaci\u00f3n t\u00e9cnica adicional (decodificaci\u00f3n especulativa, atenci\u00f3n lineal, etc.) ni se aportan curvas de entrenamiento o evaluaciones intermedias.

## Capacidades

- Generaci\u00f3n de embeddings densos de 768 dimensiones para frases y p\u00e1rrafos.
- Similitud sem\u00e1ntica entre pares de textos mediante producto escalar o coseno.
- B\u00fasqueda sem\u00e1ntica sobre \u00edndices vectoriales (FAISS, Qdrant, pgvector, etc.).
- Agrupamiento (clustering) de documentos por proximidad en el espacio de embeddings.
- Extracci\u00f3n de caracter\u00edsticas para clasificaci\u00f3n downstream con un cabezal lineal.
- No soporta tool calling ni function calling: es un modelo bi-encoder, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo thinking.
- Capacidades multiling\u00fces: no disponibles; el ajuste parece orientado a datos financieros, pero no se especifica el idioma.
- No soporta visi\u00f3n ni audio.

## Casos de uso

- B\u00fasqueda sem\u00e1ntica en corpus financieros: indexar noticias, informes o comunicados y recuperar los pasajes m\u00e1s pr\u00f3ximos a una consulta en lenguaje natural, aprovechando el ajuste sobre datos del dominio financiero que sugiere el nombre del repositorio.
- Deduplicaci\u00f3n de titulares y notas de prensa: calcular embeddings de cada titular y agrupar los que superen un umbral de similitud coseno para eliminar duplicados en un pipeline de ingestión.
- Clasificaci\u00f3n de sentimiento financiero por proximidad: usar los embeddings como entrada de un clasificador ligero (regresi\u00f3n log\u00edstica o MLP) entrenado con etiquetas propias, en lugar de depender de un LLM generativo.
- Motor de recomendaci\u00f3n de documentos: representar el perfil de un usuario y el cat\u00e1logo de informes en el mismo espacio de 768 dimensiones para ordenar por relevancia.
- Enrutamiento de tickets o consultas: comparar la consulta entrante con un conjunto de respuestas o categor\u00edas predefinidas y derivar al departamento correspondiente seg\u00fan la similitud.
- Evaluaci\u00f3n de coherencia en generaci\u00f3n aumentada: medir la similitud entre la respuesta generada y los fragmentos recuperados para detectar respuestas que se desv\u00edan del contexto.
- Construcci\u00f3n de \u00edndices RAG de bajo coste: al ser un modelo de 0,2 GB, puede desplegarse en CPU para indexaci\u00f3n por lotes sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card heredada no incluye tablas de evaluaci\u00f3n (MTEB, STS, etc.) y el autor del ajuste no aporta m\u00e9tricas propias. Adem\u00e1s, la propia model card base advierte que el modelo original produce embeddings de baja calidad y est\u00e1 obsoleto, por lo que no se debe asumir un rendimiento competitivo sin una evaluaci\u00f3n local.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 (109M par\u00e1metros \u00d7 4 bytes) y alrededor de 0,2-0,3 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para indexaci\u00f3n por lotes. Para alto throughput, una RTX 3060, RTX 4090, A10, L4 o A100 son suficientes y en la mayor\u00eda de casos sobredimensionadas.
- Cabe en GPU consumer: s\u00ed, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: sentence-transformers (PyTorch), Hugging Face Transformers con pooling manual, Text Embeddings Inference (TEI) para servir embeddings, y exportaci\u00f3n a ONNX para inferencia en CPU. El repositorio est\u00e1 marcado como compatible con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. Al tratarse de un BERT base con secuencias de 128 tokens, el throughput en CPU es del orden de cientos a miles de frases por segundo seg\u00fan n\u00facleos, y en GPU puede superar las decenas de miles por segundo, pero son estimaciones gen\u00e9ricas no verificadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Estado |
|---|---|---|---|---|---|
| finvector/sbert_lora_finsent-finmodern-investo-ccdb_4chunks_pair-tri_merged | 109,5 M | 128 tokens | 768 | Apache 2.0 | Ajuste LoRA fusionado, sin benchmarks |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 128 tokens | 768 | Apache 2.0 | Marcado como obsoleto por el autor original |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | 384 | Apache 2.0 | Modelo ligero ampliamente usado en b\u00fasqueda sem\u00e1ntica |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | Referencia com\u00fan en MTEB para ingl\u00e9s |

La comparaci\u00f3n se basa en caracter\u00edsticas p\u00fablicas de los modelos alternativos; no se dispone de resultados de benchmarks del modelo de finvector para establecer una comparaci\u00f3n cuantitativa.

## Limitaciones y advertencias

- La model card incluida corresponde a sentence-transformers/bert-base-nli-mean-tokens, marcada por su autor como obsoleta y de baja calidad; no describe el ajuste financiero real.
- No hay datos de evaluaci\u00f3n propios: se desconoce si el ajuste con LoRA mejora o degrada la calidad de los embeddings respecto al modelo base.
- Contexto limitado a 128 tokens: frases o p\u00e1rrafos m\u00e1s largos se truncan, lo que puede perder informaci\u00f3n relevante en documentos financieros extensos.
- Idiomas soportados no documentados; el ajuste parece orientado a un dominio concreto y no se garantiza un buen comportamiento multiling\u00fce.
- Riesgo de sesgos heredados del corpus de entrenamiento (noticias y textos financieros), incluyendo sesgos de mercado, geogr\u00e1ficos o de estilo editorial.
- Riesgo de alucinaci\u00f3n no aplica directamente al ser un modelo de embeddings, pero s\u00ed puede producir similitudes espurias si se usa fuera del dominio para el que fue ajustado.
- Licencia Apache 2.0 permite uso comercial, pero al no haber benchmarks ni documentaci\u00f3n del proceso de entrenamiento, la validaci\u00f3n en producci\u00f3n corre por cuenta del usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validaci\u00f3n por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/sbert_lora_finsent-finmodern-investo-ccdb_4chunks_pair-tri_merged
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Documentaci\u00f3n de Sentence-Transformers: https://www.sbert.net
- Modelos recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
