# NostraEmpire/mirror-nomic-embed-text-v1.5

## Resumen

El modelo `NostraEmpire/mirror-nomic-embed-text-v1.5` es un espejo (mirror) del modelo de embeddings de texto `nomic-embed-text-v1.5` desarrollado originalmente por Nomic AI. Se trata de un modelo de similitud semántica basado en una arquitectura BERT modificada (denominada `nomic_bert`), con 136,7 millones de parámetros y una longitud de contexto de 8192 tokens, lo que lo hace especialmente adecuado para tareas de recuperación de información sobre documentos largos. El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en que es uno de los primeros embeddings de texto de código abierto y totalmente reproducibles que supera a modelos propietarios como OpenAI Ada-002 en benchmarks de contexto corto y largo. Al ser un mirror, ofrece los mismos pesos y capacidades que el original, pero alojado por NostraEmpire, lo que puede facilitar su acceso en determinadas regiones o infraestructuras. Está disponible en formatos safetensors y ONNX, y es compatible con la librería `sentence-transformers`, `transformers.js` y `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nomic_bert (BERT modificado con atención de ventana deslizante y RoPE) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (según el modelo original) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en fp32/fp16; no se especifican cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer basada en BERT, pero con modificaciones específicas para manejar contextos largos. La variante `nomic_bert` incorpora atención con ventana deslizante (sliding window attention) y posiciones rotativas (RoPE), lo que permite procesar secuencias de hasta 8192 tokens con un coste computacional razonable. El entrenamiento se realizó con un objetivo contrastivo, combinando pares de frases y documentos para aprender representaciones semánticas densas. Según el paper técnico (arXiv:2402.01613), el modelo se entrenó de forma totalmente reproducible, con datos y código abiertos, y supera a OpenAI Ada-002 y text-embedding-3-small en los benchmarks MTEB de contexto corto y LoCo de contexto largo. No se menciona el uso de RLHF o DPO, ya que es un modelo de embeddings, no generativo.

## Capacidades

- Generación de embeddings de texto para similitud semántica, con normalización de vectores para facilitar la comparación por similitud coseno.
- Búsqueda semántica y recuperación de información sobre documentos largos gracias a su contexto de 8192 tokens.
- Clasificación de texto (análisis de sentimiento, categorización de temas, detección de intenciones) mediante la extracción de características.
- Clustering de documentos y agrupación por similitud temática.
- Reranking de resultados de búsqueda, mejorando la precisión de sistemas de recuperación existentes.
- Soporte para integración en pipelines de RAG (retrieval-augmented generation) como componente de recuperación.
- Compatible con `sentence-transformers`, `transformers.js` (para ejecución en navegador) y `text-embeddings-inference` para despliegue en producción.
- No incluye capacidades de tool calling, agentes ni generación de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en bases de conocimiento empresarial: el modelo puede indexar documentos internos (manuales, políticas, informes) y permitir búsquedas por significado, no solo por palabras clave, gracias a su contexto largo que abarca párrafos completos.
- Sistemas de atención al cliente automatizada: al clasificar consultas de usuarios en categorías predefinidas (reclamaciones, dudas técnicas, facturación), el modelo puede enrutar las conversaciones al departamento adecuado con alta precisión.
- Deduplicación de contenido en plataformas de publicación: comparando embeddings de artículos o entradas de blog, se pueden detectar duplicados o contenido muy similar para evitar publicaciones redundantes.
- Reranking de resultados en motores de búsqueda: combinado con un sistema de recuperación inicial (por ejemplo, BM25), el modelo puede reordenar los resultados según relevancia semántica, mejorando la experiencia del usuario.
- Análisis de similitud entre documentos legales o académicos: permite agrupar sentencias, patentes o papers por temática, facilitando la revisión de literatura o la detección de precedentes.
- Moderación de contenido en foros o redes sociales: clasificando mensajes en categorías de toxicidad o spam, el modelo puede ayudar a filtrar contenido no deseado en tiempo real.
- Construcción de chatbots con memoria de largo plazo: al almacenar embeddings de conversaciones anteriores, el sistema puede recuperar el contexto relevante de interacciones pasadas para ofrecer respuestas coherentes.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen del model-index declarado por el autor del mirror en HuggingFace, basado en la suite MTEB. No se dispone de comparaciones directas con otros modelos en la información proporcionada.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación | AmazonCounterfactual (en) | accuracy | 75,21 |
| Clasificación | AmazonPolarity | accuracy | 91,81 |
| Clasificación | AmazonReviews (en) | accuracy | 47,16 |
| Recuperación | ArguAna | ndcg_at_10 | 48,01 |
| Recuperación | ArguAna | recall_at_10 | 77,38 |
| Clustering | ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | ArxivClusteringS2S | v_measure | 36,35 |
| Reranking | AskUbuntuDupQuestions | map | 61,71 |
| Reranking | AskUbuntuDupQuestions | mrr | 76,06 |
| STS | BIOSSES | cos_sim_spearman | 84,25 |
| Clasificación | Banking77 | accuracy | 84,25 |
| Recuperación | CQADupstackAndroid | ndcg_at_10 | 42,64 |

Estos valores son consistentes con los reportados para el modelo original `nomic-embed-text-v1.5`, que en el paper técnico supera a OpenAI Ada-002 en la media de MTEB y en el benchmark LoCo de contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 136,7 millones de parámetros, en fp32 se necesitan aproximadamente 547 MB, en fp16 unos 273 MB y en int8 unos 137 MB. El tamaño del repositorio (2,1 GB) sugiere que se incluyen pesos en fp32 y posiblemente otras precisiones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Modelos como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores funcionan sin problema. También puede ejecutarse en CPU para cargas moderadas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en las de gama baja.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (servidor de embeddings), `transformers.js` (navegador), ONNX Runtime, y cualquier framework que soporte safetensors.
- Latencia y throughput estimados: no se han publicado datos específicos. Para un modelo de este tamaño, en una GPU RTX 3090 se pueden procesar del orden de miles de frases por segundo con un batch adecuado, pero depende de la longitud de los textos y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MTEB (media) | Notas |
|---|---|---|---|---|---|
| NostraEmpire/mirror-nomic-embed-text-v1.5 | 136,7 M | 8192 | Apache 2.0 | ~60 (estimado) | Espejo del original, solo inglés |
| nomic-ai/nomic-embed-text-v1.5 | 136,7 M | 8192 | Apache 2.0 | ~60 (estimado) | Modelo original, mismo rendimiento |
| all-MiniLM-L6-v2 | 22,7 M | 256 | Apache 2.0 | ~50 (estimado) | Más ligero, contexto corto, multilingüe limitado |
| bge-small-en-v1.5 | 33,4 M | 512 | MIT | ~55 (estimado) | Buen equilibrio tamaño/rendimiento, solo inglés |

Los valores de MTEB son aproximados y no se han verificado en la información disponible; se indican como referencia orientativa. El mirror ofrece el mismo rendimiento que el original, con la ventaja de estar alojado en una cuenta alternativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no es adecuado para tareas de embeddings en otros idiomas sin un fine-tuning adicional.
- Al ser un modelo de embeddings, no genera texto ni respuestas; su uso se limita a la extracción de representaciones vectoriales.
- Puede presentar sesgos presentes en los datos de entrenamiento (por ejemplo, sesgos de género o raza en textos), lo que podría afectar a tareas de clasificación o recuperación sensibles.
- La longitud de contexto de 8192 tokens es amplia, pero para documentos más largos es necesario truncar o dividir el texto, lo que puede perder información relevante.
- Aunque la licencia Apache 2.0 permite uso comercial, al ser un mirror no se garantiza un mantenimiento continuo ni soporte oficial por parte de Nomic AI.
- No se han publicado resultados de benchmarks específicos para este mirror; los datos mostrados provienen del model-index declarado por el autor y podrían no ser verificables de forma independiente.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-nomic-embed-text-v1.5
- Modelo original: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Versión anterior del modelo original: https://huggingface.co/nomic-ai/nomic-embed-text-v1
- Paper técnico (arXiv:2402.01613): https://openreview.net/pdf?id=IPmzyQSiQE
- Documentación de Nomic sobre embeddings: https://docs.nomic.ai/atlas/embeddings-and-retrieval/text-embedding
