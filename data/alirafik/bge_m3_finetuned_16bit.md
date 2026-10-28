# aliRafik/bge_m3_finetuned_16bit

## Resumen

`aliRafik/bge_m3_finetuned_16bit` es un modelo de embeddings de frases (sentence embedding) derivado de `unsloth/bge-m3`, que a su vez es una variante de BGE-M3 construida sobre la arquitectura XLM-RoBERTa. Lo publica el usuario aliRafik y su propósito es mapear frases y párrafos a vectores densos de 1024 dimensiones para similitud semántica, búsqueda semántica, clustering y clasificación. El ajuste fino se ha realizado sobre el dataset `electroglyph/technical` (106.628 pares anchor/positive) con la librería Unsloth y la función de pérdida MultipleNegativesRankingLoss.

El modelo es un encoder de ~568 millones de parámetros (567.754.752 según los pesos en safetensors), con pooling CLS, normalización L2 y similitud coseno. La model card declara una longitud máxima de secuencia de 2048 tokens, salida de 1024 dimensiones y soporte exclusivo de inglés. No es un modelo generativo: no produce texto, solo representaciones vectoriales.

Su relevancia es acotada y hay que ser honesto: a fecha de la ficha acumula 0 descargas y 0 likes, no publica resultados de benchmarks ni licencia, y su interés principal es como ejemplo reproducible de ajuste fino de un modelo de embeddings con Unsloth sobre un dominio técnico concreto. Para producción, sus alternativas consolidadas (BGE-M3 original, multilingual-e5-large) ofrecen mayor contexto, multilingüismo y licencia conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLMRobertaModel) + Pooling CLS + Normalize; pipeline SentenceTransformer |
| Parametros totales | 567.754.752 (~568 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo de secuencia declarado en la model card) |
| Tipos de cuantizacion | Pesos publicados en 16 bits (safetensors); no se distribuyen variantes GGUF, ONNX ni cuantizaciones INT8/INT4 en el repositorio |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card muestra el campo como "Unknown") |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |
| Dimensionalidad de salida | 1024 |
| Funcion de similitud | similitud coseno |
| Pooling | CLS, con inclusión del prompt y normalización L2 posterior |
| Modelo base | unsloth/bge-m3 (revisión 57cb1c17d3cb917401c50b204393ee455359a565) |
| Libreria | sentence-transformers |
| Tamano del repositorio | 1,2 GB |
| Dataset de entrenamiento | electroglyph/technical (revisión 05eeb90), 106.628 pares anchor/positive |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Framework de ajuste | Unsloth |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de la familia XLM-RoBERTa, empaquetado como `SentenceTransformer` en tres módulos: el transformer (`XLMRobertaModel`, tarea `feature-extraction`, salida `last_hidden_state`), un pooling de tipo CLS con `include_prompt: True` que produce un vector de 1024 dimensiones, y una capa de normalización. La similitud se calcula por producto escalar sobre vectores normalizados, equivalente a similitud coseno. Al ser un encoder denso, no incorpora cabeza generativa ni mecanismos de atención lineal, decodificación especulativa o mezcla de expertos.

El ajuste fino parte de `unsloth/bge-m3` y se realiza con Unsloth sobre 106.628 pares (anchor, positive) del dataset `electroglyph/technical`, un corpus de terminología técnica en inglés con pares del estilo "ace-v" / "Fingerprint examiners follow the ACE-V methodology for identification" o "acrylic paint" / "Artists prefer acrylic paint for its fast drying time". Se emplea MultipleNegativesRankingLoss, una pérdida contrastiva tipo InfoNCE que usa los positivos del resto del lote como negativos en memoria (in-batch negatives). No se documentan número total de tokens vistos, épocas, tasa de aprendizaje ni si hubo etapas posteriores de destilación o evaluación; tampoco se menciona RLHF/DPO, algo esperable en un modelo de embeddings. El nombre del repositorio ("16bit") hace referencia a la precisión de los pesos publicados.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases y párrafos, con normalización L2 y similitud coseno.
- Similitud semántica textual (semantic textual similarity) sobre textos técnicos en inglés.
- Búsqueda semántica y recuperación de pasajes (dense retrieval) en corpus de documentación técnica.
- Minería de paráfrasis y detección de duplicados oNear-duplicates semánticos.
- Clustering y agrupación temática de documentos, tickets o incidencias.
- Clasificación de texto mediante embeddings + clasificador ligero (regresión logística, SVM, k-NN).
- Extracción de características (`feature-extraction`) para pipelines propios.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un encoder de texto.
- No implementa las funcionalidades multi-vector (ColBERT) ni sparse (lexical weights) del BGE-M3 original; esta exportación es solo densa.

## Casos de uso

- Búsqueda semántica en documentación técnica interna: indexar manuales, normativa, fichas de producto y procedimientos en inglés y recuperar pasajes por significado en lugar de por coincidencia léxica, usando los 2048 tokens de ventana para fragmentos largos y la similitud coseno sobre vectores de 1024 dimensiones.
- Recuperación aumentada (RAG) sobre corpus técnico: generar embeddings de los chunks con este modelo y almacenarlos en una base vectorial (FAISS, Qdrant, pgvector, Milvus) para alimentar a un LLM generativo con contexto recuperado. Es su uso más directo, aunque conviene validar la calidad de recuperación contra el BGE-M3 original antes de desplegar.
- Deduplicación de tickets e incidencias: calcular embeddings de las descripciones y agrupar por umbral de similitud para detectar incidencias repetidas o fusionar colas de soporte. Adecuado por el coste bajo de inferencia de un encoder de 568 M.
- Clasificación y enrutado de consultas: entrenar un clasificador (p. ej. regresión logística) sobre los embeddings para dirigir consultas técnicas al equipo o base de conocimiento correctos, sin necesidad de un modelo generativo.
- Minería de paráfrasis y control de calidad de catálogos: detectar descripciones redundantes o inconsistentes de productos técnicos, y comparar pares de textos para verificar que una reformulación conserva el significado técnico.
- Construcción de motores de recomendación de contenido: similitud entre artículos, FAQs o especificaciones para sugerir documentación relacionada, aprovechando que el modelo está ajustado sobre vocabulario técnico y sus definiciones.
- Evaluación de cobertura de requisitos: comparar requisitos de licitaciones o normativas con la documentación de respuesta para localizar qué puntos no tienen cobertura semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluación MTEB ni comparaciones cuantitativas con otros modelos; solo muestra un ejemplo ilustrativo de similitudes del widget, que se reproduce a continuación como referencia cualitativa (no constituye una evaluación):

| Frase 1 | Frase 2 | Similitud |
|---|---|---|
| adult learning | The course was designed using adult learning best practices. | 0,7459 |
| adult learning | Solar developers calculate AEP, or annual energy production. | 0,1762 |
| The course was designed using adult learning best practices. | Solar developers calculate AEP, or annual energy production. | 0,2465 |

## Requisitos de hardware

- Huella de pesos (cálculo a partir de 567.754.752 parámetros): ~1,14 GB en FP16/BF16, ~2,27 GB en FP32, ~0,57 GB en INT8 y ~0,29 GB en INT4.
- VRAM estimada para inferencia: 2-3 GB con FP16 y lotes pequeños de secuencias cortas; 4-6 GB para lotes medios; 8-12 GB si se procesan secuencias cercanas a los 2048 tokens con lotes grandes, donde las activaciones dominan el consumo.
- GPU recomendadas: para desarrollo y lotes pequeños, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para servicio en producción con concurrencia, L4, A10G, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en FP16; incluso en 4 GB con lotes reducidos.
- Opciones de despliegue: `sentence-transformers` (referencia), Text Embeddings Inference (TEI) —el modelo lleva el tag `text-embeddings-inference` y es `endpoints_compatible`—, Hugging Face Inference Endpoints, y servidores propios en Python/FastAPI. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión no verificada; tampoco se distribuye ONNX.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Al ser un encoder de ~568 M con pooling CLS, el coste por secuencia es proporcional a la longitud; conviene medir con el hardware objetivo antes de dimensionar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Funcionalidades |
|---|---|---|---|---|---|---|
| aliRafik/bge_m3_finetuned_16bit | ~568 M | 2048 | 1024 | en | no disponible | densa, solo CLS + normalize |
| BGE-M3 (BAAI/bge-m3, familia del modelo base) | ~568 M | 8192 | 1024 | multilingüe (100+) | MIT | densa + sparse + multi-vector |
| multilingual-e5-large | ~560 M | 512 | 1024 | multilingüe | MIT | densa, prefijos query/passage |
| bge-large-en-v1.5 | ~335 M | 512 | 1024 | en | MIT | densa |

La comparación relevante es con el BGE-M3 original: este ajuste reduce la ventana declarada a 2048 tokens, restringe el alcance a inglés y no expone las salidas sparse ni multi-vector, a cambio de especialización en vocabulario técnico. No hay datos públicos que permitan afirmar que esa especialización mejora la recuperación frente al modelo base.

## Limitaciones y advertencias

- Licencia no disponible: la model card marca el campo como "Unknown" y no se indica la licencia heredada del modelo base. No debe usarse en producción comercial sin aclarar antes los términos con el autor.
- Solo inglés: aunque el modelo base BGE-M3 es multilingüe, la ficha declara `language: en` y el dataset de ajuste es inglés técnico; el rendimiento en castellano u otros idiomas es impredecible y no está evaluado.
- Contexto declarado de 2048 tokens, inferior a los 8192 del BGE-M3 original; los textos más largos se truncan y pierden información.
- Riesgo de sobreajuste al dominio: 106.628 pares de un único dataset técnico pueden degradar el rendimiento en dominios generales (conversacional, jurídico, biomédico) respecto al modelo base. No hay evaluación que cuantifique esa pérdida.
- Sin benchmarks publicados: cualquier afirmación de mejora frente a BGE-M3, e5 o bge-large carece de respaldo en la información disponible.
- Capacidades reducidas: no hay salida sparse ni multi-vector, lo que impide reproducir los modos híbridos de recuperación de BGE-M3.
- Adopción nula (0 descargas, 0 likes) y repositorio creado el 28 de octubre de 2026 según los metadatos: no hay evidencia de uso en producción ni de validación por terceros.
- Riesgo de sesgo heredado del corpus de preentrenamiento de XLM-RoBERTa y del dataset técnico; no se documenta ninguna auditoría de sesgos.
- En RAG, un encoder mal ajustado produce recuperaciones plausibles pero irrelevantes; conviene medir recall@k y MRR sobre un conjunto de evaluación propio antes de sustituir un modelo consolidado.
- No es un modelo generativo: no debe esperarse de él respuesta en lenguaje natural, razonamiento ni seguimiento de instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliRafik/bge_m3_finetuned_16bit
- Modelo base: https://huggingface.co/unsloth/bge-m3
- Dataset de entrenamiento: https://huggingface.co/datasets/electroglyph/technical
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Referencia de aprendizaje contrastivo citada en la model card: https://arxiv.org/abs/1807.03748
