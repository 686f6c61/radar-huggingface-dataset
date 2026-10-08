# OpenFlowLM/bge-base-en-v1.5

## Resumen

OpenFlowLM/bge-base-en-v1.5 es un modelo de embeddings de frases y pasajes en inglés publicado en Hugging Face bajo el espacio de nombres OpenFlowLM. Es un encoder Transformer de tipo BERT con 109.482.752 parámetros y un repositorio de 1,3 GB que transforma texto en vectores densos y normalizados, orientados a similitud semántica, recuperación de información y clasificación mediante embeddings. Por su nomenclatura y por los resultados MTEB que declara, corresponde a la familia BGE (BAAI General Embedding) en su variante base para inglés, versión 1.5.

El problema que resuelve es la representación semántica del texto para búsqueda y filtrado: frente a la coincidencia léxica, permite recuperar pasajes relevantes aunque la consulta esté formulada con otras palabras, algo esencial en pipelines de RAG, buscadores internos, deduplicación y clustering documental. A diferencia de un modelo generativo, no produce texto: solo calcula embeddings, lo que lo hace mucho más barato de ejecutar y de desplegar.

Su relevancia actual reside en que sigue siendo una referencia consolidada en recuperación monolingüe inglesa con licencia MIT, lo que habilita uso comercial sin restricciones. No obstante, los datos del repositorio indican una adopción nula en Hugging Face (0 descargas y 0 likes) y la información disponible no documenta ninguna innovación respecto al modelo original de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Transformer bidireccional de tipo BERT (tag `bert`); modelo denso, no MoE |
| Parámetros totales | 109.482.752 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 512 tokens (valor habitual de bge-base-en-v1.5; no confirmado explícitamente en la información del repositorio) |
| Tipos de cuantización | No disponible; el repositorio declara safetensors y ONNX, sin documentar variantes cuantizadas concretas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX y pesos PyTorch para sentence-transformers |
| Dimensión del embedding | 768 (configuración habitual de la familia BGE; no confirmada en la información del repositorio) |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 1,3 GB |
| Creado / actualizado | 2026-10-08 (misma fecha en ambos campos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un encoder Transformer bidireccional basado en BERT-base, sin decodificador ni mecanismos de atención dispersa, mezcla de expertos o estados recurrentes. La salida es un vector por secuencia (en la familia BGE, convencionalmente la representación del token `[CLS]` seguida de normalización L2), adecuado para similitud por producto escalar o distancia coseno. El repositorio incluye además artefactos ONNX y etiquetas que lo declaran compatible con Text Embeddings Inference y con endpoints de Hugging Face.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de ajuste con preferencias humanas (RLHF/DPO), que en un modelo de embeddings no serían el procedimiento habitual. Tampoco se describe el pipeline contrastivo, aunque los tags del repositorio remiten a cinco referencias arXiv (2401.03462, 2312.15503, 2311.13534, 2310.07554 y 2309.07597) relacionadas con la familia BGE. En la práctica de esta familia se emplea entrenamiento contrastivo multi-etapa con pares y tripletas, y para recuperación se antepone a la consulta una instrucción textual del tipo "Represent this sentence for searching relevant passages:"; conviene verificar este extremo contra la documentación del modelo original antes de llevarlo a producción.

## Capacidades

- Generación de embeddings de frases, párrafos y documentos cortos en inglés (un vector por texto).
- Similitud semántica y detección de paráfrasis, con puntuación por coseno o producto escalar.
- Recuperación densa (dense retrieval) de pasajes ante una consulta, mediante instrucción de consulta en la formulación de la búsqueda.
- Clasificación de texto por similitud con etiquetas descritas en lenguaje natural o con clasificadores lineales entrenados sobre los embeddings.
- Clustering y agrupación temática de documentos, evaluada en MTEB en tareas Arxiv y Biorxiv.
- Reranking de candidatos recuperados previamente por un sistema léxico o vectorial.
- Extracción de características para pipelines de aprendizaje automático clásico (regresión logística, SVM, k-NN).
- No soporta tool calling ni function calling, no ejecuta razonamiento multi-paso y no funciona como agente.
- No dispone de modo de razonamiento (thinking mode), ni de capacidades de visión, audio o generación de texto.
- Cobertura multilingüe: no; está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Recuperación en RAG: indexar fragmentos de documentación en una base vectorial y recuperar los más relevantes para alimentar a un LLM. Su ventana de 512 tokens obliga a trocear los documentos, pero el coste de embedding es muy bajo, lo que permite reindexar corpus grandes con frecuencia.
- Buscador semántico interno: sobre manuales, tickets o bases de conocimiento, recuperar contenido por significado en lugar de por palabra clave, aprovechando los resultados declarados en ArguAna (recall@100 de 99,15) y CQADupstack.
- Deduplicación y detección de casi duplicados: calcular similitud coseno entre embeddings de registros y fijar un umbral para marcar duplicados en catálogos de productos, incidencias o artículos periodísticos.
- Clasificación de intenciones en atención al cliente: entrenar un clasificador lineal sobre los embeddings; los resultados declarados en Banking77 (86,95 de accuracy) indican que la representación separa bien intenciones bancarias finas.
- Moderación y análisis de sentimiento: clasificar reseñas y comentarios; en AmazonPolarityClassification declara 93,39 de accuracy y 93,38 de F1, y en AmazonCounterfactual 76,15 de accuracy.
- Clustering temático de corpus científicos o técnicos: agrupar publicaciones o incidencias por tema sin etiquetas previas, con v_measure declarado de 48,75 en ArxivClusteringP2P y 42,81 en ArxivClusteringS2S.
- Reranking de resultados de búsqueda: reordenar los primeros candidatos de un motor léxico (BM25) o de un retriever más rápido, usando las puntuaciones declaradas en AskUbuntuDupQuestions (MAP 62,13, MRR 74,28).
- Caché semántica de prompts: comparar la consulta entrante con consultas previas mediante similitud de embeddings para reutilizar respuestas de un LLM y reducir coste y latencia.
- Detección de anomalías y outliers textuales: marcar registros cuya distancia media al resto de su grupo supera un umbral, útil en control de calidad de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` del repositorio. Todos figuran como no verificados (`verified: false`) y no se ha publicado en la información disponible la media agregada de MTEB. Se muestran los valores principales; los decimales se expresan con coma.

| Tarea | Dataset MTEB | Métrica | Valor |
|---|---|---|---|
| Clasificación | AmazonCounterfactualClassification (en) | accuracy | 76,15 |
| Clasificación | AmazonCounterfactualClassification (en) | F1 | 70,17 |
| Clasificación | AmazonPolarityClassification | accuracy | 93,39 |
| Clasificación | AmazonPolarityClassification | F1 | 93,38 |
| Clasificación | AmazonReviewsClassification (en) | accuracy | 48,85 |
| Clasificación | Banking77Classification | accuracy | 86,95 |
| Clustering | ArxivClusteringP2P | v_measure | 48,75 |
| Clustering | ArxivClusteringS2S | v_measure | 42,81 |
| Clustering | BiorxivClusteringP2P | v_measure | 39,10 |
| Clustering | BiorxivClusteringS2S | v_measure | 36,70 |
| Reranking | AskUbuntuDupQuestions | MAP | 62,13 |
| Reranking | AskUbuntuDupQuestions | MRR | 74,28 |
| Retrieval | ArguAna | nDCG@10 | 63,61 |
| Retrieval | ArguAna | recall@100 | 99,15 |
| Retrieval | ArguAna | MAP@10 | 55,76 |
| Retrieval | CQADupstackAndroidRetrieval | MAP@10 | 44,10 |
| Retrieval | CQADupstackAndroidRetrieval | MRR@10 | 49,65 |
| STS | BIOSSES | cos_sim Spearman | 86,94 |

No hay en la información disponible resultados de MMLU, HumanEval o GSM8K, que además no aplican a un modelo de embeddings sin generación de texto.

## Requisitos de hardware

- Huella de pesos: aproximadamente 437 MB en fp32, 219 MB en fp16 y 110 MB en int8.
- VRAM para inferencia: por debajo de 1 GB en fp16 incluyendo activaciones con lotes moderados; el límite práctico lo marca el tamaño del lote y la longitud de secuencia (512 tokens), no el modelo.
- GPU: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior permite lotes grandes con holgura. Una A100 o H100 solo se justifica para indexación masiva por throughput agregado, no por requisitos de memoria.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con más de 1 GB de memoria compartida.
- CPU: viable para servir tráfico moderado; al ser un encoder de 109 M de parámetros, la latencia depende del número de núcleos y del soporte de instrucciones vectoriales (AVX2/AVX-512 o NEON).
- Opciones de despliegue: sentence-transformers, ONNX Runtime (el repositorio declara ONNX), Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y librerías de embeddings que consuman safetensors/ONNX.
- Otras rutas: llama.cpp u Ollama requerirían convertir los pesos a GGUF, formato que no se ofrece en el repositorio. vLLM está orientado a modelos generativos y no es la vía natural para este modelo.
- Latencia y throughput: no se publican cifras concretas en la información disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden del conocimiento general del ecosistema y no de la información proporcionada para esta ficha; deben verificarse en sus repositorios respectivos.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento |
|---|---|---|---|---|---|
| OpenFlowLM/bge-base-en-v1.5 | 109,48 M | 512 tokens (no confirmado en el repositorio) | MIT | inglés | Ver tabla de benchmarks de esta ficha (no verificados) |
| BAAI/bge-base-en-v1.5 (original de la familia) | 109 M | 512 tokens | MIT | inglés | No disponible en esta ficha |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | MIT | inglés | No disponible en esta ficha |
| intfloat/e5-base-v2 | 109 M | 512 tokens | MIT | inglés | No disponible en esta ficha |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache-2.0 | inglés | No disponible en esta ficha |

La diferencia práctica más relevante entre este repositorio y el modelo original de BAAI no es técnica, sino de distribución: el repositorio de OpenFlowLM registra 0 descargas y 0 likes y no aporta documentación propia de entrenamiento, por lo que para producción conviene contrastar pesos y versiones antes de sustituir la referencia original.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto, por lo que no cabe hablar de alucinación en el sentido habitual. Sí puede producir similitudes engañosas cuando el texto es ambiguo o muy corto.
- Sesgos: entrenado con datos web en inglés, sin documentación disponible sobre filtrado, deduplicación o mitigación de sesgos en este repositorio concreto.
- Idioma: soporte únicamente en inglés. El rendimiento en castellano no está evaluado y previsiblemente será inferior al de modelos multilingües o específicos en español.
- Contexto limitado a 512 tokens (valor habitual del modelo, no confirmado): los documentos largos requieren troceado con solapamiento, lo que afecta a la calidad de recuperación.
- Benchmarks no verificados: los resultados del `model-index` figuran con `verified: false` y proceden del propio autor del modelo.
- Riesgo de repositorio espejo: 0 descargas, 0 likes y fecha de creación y actualización idénticas. Conviene comparar los pesos con el modelo original de la familia BGE antes de desplegarlo.
- Requisito de instrucción de consulta: en tareas de recuperación, la familia BGE espera un prefijo en la consulta; omitirlo degrada la calidad del retrieval. Este extremo no se documenta en la información disponible de este repositorio.
- Licencia MIT: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de copyright y la licencia. No se declaran restricciones adicionales.
- Para RAG, el modelo solo recupera: la calidad final depende del troceado, del índice vectorial y del modelo generativo que consuma los pasajes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpenFlowLM/bge-base-en-v1.5
- Referencias arXiv incluidas en los tags del repositorio: https://arxiv.org/abs/2401.03462, https://arxiv.org/abs/2312.15503, https://arxiv.org/abs/2311.13534, https://arxiv.org/abs/2310.07554, https://arxiv.org/abs/2309.07597
- Leaderboard de MTEB (contexto para los resultados declarados): https://huggingface.co/spaces/mteb/leaderboard
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas del servicio Google Translate y no guardan relación con la ficha.
