# finvector/sbert_lora_investo_tri_merged

## Resumen

`finvector/sbert_lora_investo_tri_merged` es un modelo de embeddings de frases publicado por el usuario finvector en Hugging Face. Se distribuye como un `SentenceTransformer` construido sobre una arquitectura BERT base, con 109.482.240 parámetros totales y una dimensión de embedding de 768. El nombre sugiere un proceso de ajuste fino mediante LoRA sobre datos del dominio "investo" y una posterior fusión de pesos ("merged"), aunque la model card no documenta ese procedimiento.

El repositorio tiene un tamaño de 0,2 GB y contiene pesos en formato safetensors. La model card publicada es prácticamente una copia de la de `sentence-transformers/bert-base-nli-mean-tokens`, incluido el aviso de que ese modelo original está obsoleto y produce embeddings de baja calidad. No hay información propia del autor sobre datos de entrenamiento, idiomas, evaluación ni metodología de ajuste.

Por tanto, se trata de un modelo derivado de bajo perfil, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica específica. Es relevante únicamente como punto de partida para quien quiera evaluar empíricamente si el ajuste LoRA aporta mejoras en similitud semántica dentro de un dominio concreto, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT base (encoder) con pooling de media sobre tokens |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (`max_seq_length` declarado en la arquitectura) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `sentence-transformers`) |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card corresponde a un `SentenceTransformer` con dos componentes: un `Transformer` basado en `BertModel` con `max_seq_length` de 128 y `do_lower_case` desactivado, y una capa `Pooling` con dimensión de embedding de 768 que aplica pooling de media sobre los tokens (`pooling_mode_mean_tokens: True`), sin pooling de CLS ni de máximo. El número de parámetros (109,5 M) es coherente con un BERT base estándar.

No se documenta el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo entrenamiento contrastivo con pares o tripletas, ni detalles del ajuste LoRA mencionado en el nombre del repositorio. La model card reproduce el texto de `sentence-transformers/bert-base-nli-mean-tokens`, un modelo de 2019 entrenado con NLI, e incluye su aviso de obsolescencia, pero no aporta información sobre qué se hizo en este derivado ni sobre la fusión de pesos que sugiere el sufijo `_merged`.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio vectorial denso de 768 dimensiones.
- Similitud semántica entre pares de textos (tarea declarada en el pipeline: `sentence-similarity`).
- Búsqueda semántica y recuperación de información mediante comparación de vectores.
- Agrupamiento (clustering) de textos por proximidad en el espacio de embeddings.
- Extracción de características (`feature-extraction`) a nivel de frase.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder puro.
- Capacidades multilingües: no disponibles según la información del repositorio.

## Casos de uso

- Búsqueda semántica en corpus pequeños: indexar documentos con embeddings de 768 dimensiones y recuperar por similitud coseno; adecuado si los fragmentos no superan los 128 tokens.
- Deduplicación de registros: comparar embeddings de entradas de una base de datos para detectar duplicados o near-duplicates dentro de un dominio concreto.
- Clustering de tickets o consultas: agrupar mensajes de soporte por temática usando el espacio de embeddings y algoritmos como k-means o HDBSCAN.
- Clasificación zero-shot por prototipos: asignar etiquetas comparando el embedding de un texto con embeddings de descripciones de cada clase.
- Filtrado previo en pipelines RAG: como primera etapa de recuperación de bajo coste, dado el reducido tamaño del modelo (0,2 GB) y su baja exigencia de cómputo.
- Evaluación de la calidad del ajuste LoRA: usar el modelo como caso de estudio para medir, con un conjunto de pares etiquetados propio, si la fusión de pesos mejora respecto al BERT base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16: en torno a 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha aceleradores de gran escala por su tamaño.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (nativo), `transformers` con pooling manual, Text Embeddings Inference (el tag `text-embeddings-inference` está presente en el repositorio) y `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Estado |
|---|---|---|---|---|---|
| finvector/sbert_lora_investo_tri_merged | 109,5 M | 128 tokens | 768 | Apache 2.0 | Sin benchmarks ni documentación |
| sentence-transformers/bert-base-nli-mean-tokens | ~110 M | 128 tokens | 768 | Apache 2.0 | Declarado obsoleto por el propio autor |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Ampliamente usado, con benchmarks públicos |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | Con benchmarks públicos (MTEB) |

La comparación se limita a datos arquitectónicos y de licencia; no hay resultados de evaluación de este modelo que permitan contrastar su calidad frente a las alternativas.

## Limitaciones y advertencias

- La model card incluye un aviso explícito de que el modelo base del que se copia el texto está obsoleto y produce embeddings de baja calidad; ese aviso se aplica, como mínimo, al linaje del que deriva este repositorio.
- No hay documentación sobre el ajuste LoRA ni sobre la fusión de pesos, por lo que se desconoce si el derivado corrige o agrava los problemas del base.
- Ventana de contexto muy corta (128 tokens): los textos más largos se truncan, lo que degrada la representación de documentos extensos.
- Idiomas soportados no declarados; no hay garantía de rendimiento fuera del inglés, idioma del modelo base.
- Riesgo de sesgos heredados del corpus NLI y del corpus original de BERT, no auditados en este derivado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud semántica si el espacio de embeddings no está bien calibrado para el dominio de uso.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor; conviene validar empíricamente antes de desplegar en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/sbert_lora_investo_tri_merged
- Modelo base referenciado en la model card: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Documentación de Sentence-Transformers: https://www.sbert.net
- Modelos preentrenados recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
