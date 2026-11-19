# NeuML/colbert-atto-950k-128d

## Resumen

ColBERT Atto 950k 128d es un modelo de recuperación de información basado en late interaction (estilo ColBERT) desarrollado por NeuML. Se construye mediante fine-tuning del modelo base NeuML/atto-950k-128d, un transformer compacto de la familia Atto orientada a representación contextual con un presupuesto de parámetros muy reducido. El resultado es un retriever multi-vector que genera embeddings por token y los puntúa con MaxSim, en lugar de colapsar cada texto en un único vector.

El modelo resuelve el problema del reranking y la búsqueda semántica en entornos con restricciones severas de recursos: con unos 950.000 parámetros y 128 dimensiones por token, ofrece una calidad en BEIR sorprendentemente cercana a variantes mucho mayores de la misma familia (4M y 14M de parámetros), lo que lo hace atractivo para despliegues en CPU, dispositivos embebidos o pipelines con latencia muy ajustada.

Es relevante ahora porque el ecosistema de late interaction se está estandarizando: txtai 9.0+ incorpora soporte nativo y Sentence Transformers v6.0.0 introduce `MultiVectorEncoder`, lo que permite cargar este modelo directamente sin código personalizado. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction) sobre transformer AttoModel |
| Parametros totales | 950K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 399 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT: un encoder transformer (AttoModel) que proyecta cada token a un vector de 128 dimensiones, con un vocabulario de 4K tokens. La puntuación se realiza mediante MaxSim, comparando cada embedding de query contra todos los del documento y sumando los máximos. El modelo base es NeuML/atto-950k-128d, un transformer compacto de la familia Atto diseñada para aprendizaje de representaciones con eficiencia de parámetros.

El fine-tuning se realizó con PyLate (LightOn) durante 1 época, con batch size de 32 por dispositivo, learning rate de 0.003, warmup del 5% de los pasos, precisión fp16 y evaluación por steps. No se especifica en la información disponible el volumen ni la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de destilación o minería de negativos duros. La secuencia máxima es de 399 tokens, lo que limita el tamaño de los pasajes indexables.

## Capacidades

- Recuperación de información densa multi-vector mediante late interaction (MaxSim).
- Generación de embeddings a nivel de token con 128 dimensiones por token.
- Reranking de resultados de un retriever de primera etapa.
- Búsqueda semántica en bases de embeddings construidas con txtai 9.0+.
- Integración directa con Sentence Transformers v6.0.0 vía `MultiVectorEncoder`.
- Soporte de `encode_query` y `encode_document` diferenciados.
- Capacidad multilingüe: no disponible (solo inglés declarado).
- Tool calling / function calling: no aplica (modelo de embeddings, no generativo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reranking en pipelines RAG: el modelo se sitúa como segunda etapa tras un retriever bi-encoder, recalculando la relevancia con MaxSim sobre los tokens; su coste computacional es mínimo gracias a los 950K parámetros.
- Búsqueda semántica en CPU: al ser un modelo de menos de un millón de parámetros, puede indexar y consultar corpus en servidores sin GPU, con latencia muy baja.
- Despliegue en dispositivos embebidos o edge: la huella de memoria reducida permite ejecutar búsqueda semántica en entornos con RAM limitada.
- Filtrado de candidatos en motores de búsqueda: como reranker ligero para reordenar los top-k resultados de BM25 o de un bi-encoder, mejorando el ndcg@10.
- Indexación de documentación técnica en inglés: con contextos de hasta 399 tokens, adecuado para fragmentos cortos de manuales, FAQs o artículos.
- Prototipado rápido de sistemas de recuperación: la integración con txtai y Sentence Transformers permite validar pipelines sin infraestructura pesada.
- Clasificación y deduplicación semántica: los embeddings multi-vector pueden emplearse para detectar duplicados o similitud entre pasajes cortos.

## Benchmarks y rendimiento

Resultados de ndcg@10 en el subconjunto de BEIR reportado por el autor (script de benchmarks de txtai):

| Modelo | Parametros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| colbert-atto-840-8d | 840 | 8 | 250 | 0.2143 | 0.2585 | 0.4688 | 0.3139 |
| colbert-atto-9k-16d | 9K | 16 | 1K | 0.2459 | 0.2902 | 0.5604 | 0.3655 |
| colbert-atto-90k-32d | 90K | 32 | 4K | 0.3435 | 0.3263 | 0.6663 | 0.4454 |
| **colbert-atto-950k-128d** | **950K** | **128** | **4K** | **0.4149** | **0.3352** | **0.6946** | **0.4816** |
| colbert-atto-4m-384d | 4M | 384 | 30K | 0.4157 | 0.3349 | 0.6949 | 0.4818 |
| colbert-atto-14m-384d | 14M | 384 | 30K | 0.4248 | 0.3483 | 0.7057 | 0.4929 |
| colbert-atto-25m-384d | 25M | 384 | 30K | 0.4395 | 0.3461 | 0.7130 | 0.4995 |
| LateOn | 110M | 768 | 50K | 0.4979 | 0.3802 | 0.7609 | 0.5463 |

El modelo iguala prácticamente a la variante de 4M de parámetros (0.4816 frente a 0.4818 de media) con una cuarta parte de los parámetros, y queda a 0.0113 puntos de la de 14M.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) acelera la indexación masiva.
- Cabe en consumer GPU: sí, en todas, incluidas GPUs integradas.
- Opciones de despliegue: txtai 9.0+, Sentence Transformers v6.0.0 (`MultiVectorEncoder`), PyLate. No se ha publicado versión GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Media BEIR (ndcg@10) | Licencia |
|---|---:|---:|---:|---:|---|
| colbert-atto-950k-128d | 950K | 128 | 399 | 0.4816 | apache-2.0 |
| colbert-atto-4m-384d | 4M | 384 | no disponible | 0.4818 | apache-2.0 |
| colbert-atto-14m-384d | 14M | 384 | no disponible | 0.4929 | apache-2.0 |
| LateOn | 110M | 768 | no disponible | 0.5463 | no disponible |

La ventaja competitiva del modelo es la relación calidad/parámetros: rinde como un modelo 4 veces mayor con una huella mucho menor. Frente a LateOn (110M) pierde unos 0.065 puntos de media, pero con dos órdenes de magnitud menos de parámetros.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Ventana de contexto de 399 tokens: los documentos largos deben fragmentarse, lo que puede perder contexto global.
- Vocabulario de 4K tokens: cobertura léxica limitada, con riesgo de tokens desconocidos en dominios muy especializados.
- Riesgo de alucinación: no aplica directamente (no es generativo), pero un reranking deficiente puede degradar la calidad del RAG.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez; el corpus de entrenamiento no se detalla.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (también Apache 2.0 según los tags).
- Sin cuantizaciones GGUF publicadas: el despliegue en llama.cpp u Ollama requeriría conversión manual.
- Rendimiento en BEIR limitado a tres datasets (ArguAna, NFCorpus, SciFact); no hay evaluación completa ni en dominios fuera de BEIR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/colbert-atto-950k-128d
- Modelo base: https://huggingface.co/NeuML/atto-950k-128d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
- PyLate: https://github.com/lightonai/pylate
- txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- Sentence Transformers: https://www.sbert.net/
- Variantes de la familia: https://hf.co/neuml/colbert-atto-840-8d, https://hf.co/neuml/colbert-atto-9k-16d, https://hf.co/neuml/colbert-atto-90k-32d, https://hf.co/neuml/colbert-atto-4m-384d, https://hf.co/neuml/colbert-atto-14m-384d, https://hf.co/neuml/colbert-atto-25m-384d
- LateOn: https://hf.co/neuml/lateon
