# hreyulog/qwen3-arkts

## Resumen

`hreyulog/qwen3-arkts` es un modelo de embeddings de frases (sentence transformer) construido sobre la arquitectura Qwen3 y ajustado específicamente para el dominio de ArkTS, el lenguaje de programación de aplicaciones HarmonyOS/OpenHarmony. Lo desarrolla el usuario hreyulog y se publica en Hugging Face bajo el pipeline `sentence-similarity`, con el objetivo de mapear fragmentos de código y documentación ArkTS a un espacio vectorial denso de 1024 dimensiones para tareas de recuperación semántica.

El modelo parte de una base Qwen3 (arquitectura `Qwen3Model` según la model card) y se entrena con la librería sentence-transformers usando la función de pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de datos de 49.864 pares (según el tag `dataset_size:49864`). La salida es un vector de 1024 dimensiones con similitud coseno, y la longitud máxima de secuencia es de 512 tokens.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (retrieval de código ArkTS y su documentación) donde los modelos de embeddings generalistas suelen rendir peor. No es un modelo generativo, sino un encoder de recuperación. El número de descargas (29) y likes (0) indica que es un modelo reciente y de baja difusión, sin benchmarks publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentenceTransformer sobre `Qwen3Model` (transformer encoder) + Pooling (lasttoken) + Normalize |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (los ejemplos de la model card incluyen texto en inglés y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | 1024 |
| Funcion de similitud | coseno |
| Pooling | lasttoken (include_prompt: true) |
| Tamano del repositorio | 1.2 GB |
| Dataset de entrenamiento | 49.864 pares (tag `dataset_size:49864`) |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un sentence transformer compuesto por tres modulos encadenados: (1) un transformer Qwen3 (`Qwen3Model`) configurado para `feature-extraction` sobre texto, del que se toma `last_hidden_state`; (2) una capa de pooling de tipo `lasttoken` con dimensión de salida 1024 y `include_prompt: true`; y (3) una normalización final. Esta configuración es típica de los embeddings de recuperación modernos basados en LLM, donde se aprovecha el estado oculto del último token para producir el vector de frase.

El entrenamiento se realizó con sentence-transformers usando `CachedMultipleNegativesRankingLoss`, una pérdida de ranking con negativos en batch que cachea embeddings para permitir batches efectivos grandes. El conjunto de datos consta de 49.864 pares, según el tag de la model card, presumiblemente pares (consulta, documento) del dominio ArkTS: fragmentos de código, docstrings JSDoc, comentarios y descripciones en chino e inglés, a juzgar por los ejemplos del widget. No se especifica el modelo base exacto de Qwen3 ni el número de tokens de entrenamiento, ni si hubo fases adicionales de destilación o hard negatives.

No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.); es un fine-tuning estándar de embeddings sobre un encoder existente.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 1024 dimensiones.
- Recuperación semántica (retrieval) de fragmentos de código y documentación, especialmente en el dominio ArkTS.
- Similitud semántica entre consultas en lenguaje natural y bloques de código o docstrings.
- Feature extraction a nivel de token y de secuencia (tarea `feature-extraction`).
- Manejo de texto mixto código/documentación, con ejemplos en inglés y chino en la model card.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.
- Capacidades multilingües: no declaradas explícitamente; los ejemplos sugieren inglés y chino, pero no hay confirmación.

## Casos de uso

- Búsqueda semántica de código ArkTS en repositorios: indexar funciones, clases y docstrings del proyecto y recuperar los fragmentos relevantes a partir de una consulta en lenguaje natural o en código, gracias a su espacio de 1024 dimensiones entrenado sobre pares del dominio.
- Asistente de documentación para HarmonyOS/OpenHarmony: dado un fragmento de código, recuperar la entrada de documentación oficial o el docstring correspondiente, usando similitud coseno sobre los embeddings.
- Detección de duplicados y refactorización: comparar funciones ArkTS para identificar implementaciones casi idénticas o solapadas antes de consolidar código, aprovechando la naturaleza de similitud del modelo.
- RAG sobre bases de código ArkTS: servir como retriever en un pipeline de generación aumentada, alimentando a un LLM generativo con los fragmentos de código más relevantes recuperados por este encoder.
- Clasificación y agrupamiento de incidencias: agrupar tickets o issues de un proyecto ArkTS por similitud semántica para enrutarlos al equipo adecuado.
- Autocompletado y sugerencia de APIs: en un IDE, sugerir la función o método ArkTS más parecido a la intención descrita por el desarrollador en un comentario.
- Filtrado de resultados de búsqueda en herramientas internas: reordenar (reranking) candidatos recuperados por búsqueda léxica usando la similitud coseno del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 595,8 M de parámetros en fp32, aproximadamente 2,4 GB de pesos; en fp16, unos 1,2 GB; en int8, unos 0,6 GB. A ello hay que sumar el overhead de activaciones y del tokenizador, por lo que un presupuesto práctico de 2-4 GB de VRAM es razonable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes en producción, una A10G o L4 son opciones equilibradas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI, tag `text-embeddings-inference`), endpoints compatibles de Hugging Face, y servidores de embeddings genéricos que acepten safetensors. No hay variantes GGUF publicadas, por lo que llama.cpp/Ollama no están soportados de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 595 M de parámetros con contexto de 512 tokens, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hreyulog/qwen3-arkts | 595,8 M | 512 | 1024 | ArkTS / código | no disponible | Hugging Face (29 descargas) |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | 1024 | Texto general (inglés) | MIT | Hugging Face, ampliamente usado |
| intfloat/multilingual-e5-large | ~560 M | 512 | 1024 | Texto multilingüe | MIT | Hugging Face, ampliamente usado |
| jinaai/jina-embeddings-v2-base-code | ~161 M | 8192 | 768 | Código (multilenguaje) | Apache 2.0 | Hugging Face |

La comparación es orientativa: los tres alternativos tienen benchmarks públicos (MTEB, etc.) y licencias claras, mientras que `qwen3-arkts` no publica métricas ni licencia. Su ventaja potencial es la especialización en ArkTS, un dominio que los modelos generalistas no cubren; su desventaja es la falta de validación pública y de garantías legales de uso.

## Limitaciones y advertencias

- No se ha publicado licencia: no está claro si se permite uso comercial, modificación o redistribución. Es un riesgo legal relevante para producción.
- No hay benchmarks publicados ni evaluación independiente; el rendimiento real en retrieval ArkTS es desconocido.
- Contexto limitado a 512 tokens: fragmentos de código o documentación más largos se truncan, lo que puede degradar la calidad del embedding.
- Idiomas soportados no declarados; los ejemplos sugieren inglés y chino, pero no hay garantía para otros idiomas.
- Riesgo de sesgo hacia el estilo de código y la documentación presentes en el dataset de entrenamiento (49.864 pares), que puede no representar todos los estilos de ArkTS.
- Al ser un encoder de similitud, no genera texto ni razona; no debe usarse como sustituto de un LLM.
- Modelo de muy baja difusión (29 descargas, 0 likes): poca validación comunitaria y mantenimiento incierto.
- No hay variantes cuantizadas publicadas (GGUF, ONNX), lo que limita su despliegue en entornos sin GPU o con llama.cpp/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hreyulog/qwen3-arkts
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de referencia sobre MultipleNegativesRankingLoss: https://arxiv.org/abs/1908.10084
- Paper de referencia adicional citado en los tags: https://arxiv.org/abs/2101.06983
