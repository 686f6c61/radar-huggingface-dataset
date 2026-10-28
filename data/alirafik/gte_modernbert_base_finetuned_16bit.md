# aliRafik/gte_modernbert_base_finetuned_16bit

## Resumen

`aliRafik/gte_modernbert_base_finetuned_16bit` es un modelo de embeddings de frases (sentence transformer) obtenido por ajuste fino del modelo base `unsloth/gte-modernbert-base`. Lo publica el usuario aliRafik y su propósito es convertir frases y párrafos en vectores densos de 768 dimensiones para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación y clustering. El ajuste se ha realizado sobre el dataset `electroglyph/technical`, un corpus de 106.628 pares ancla-positivo de vocabulario técnico.

Arquitectónicamente es un encoder ModernBERT (solo codificador, bidireccional) de 149.014.272 parámetros, con una cabeza de pooling sobre el token CLS que proyecta la salida a 768 dimensiones y similitud coseno. La longitud máxima de secuencia documentada por el autor es de 1024 tokens, muy por debajo de la ventana nativa de la familia ModernBERT, lo que sugiere que el ajuste se ha limitado a ese tamaño.

Su relevancia es acotada pero concreta: se trata de un modelo pequeño (0,3 GB de repositorio) especializado en dominio técnico, entrenado con `MultipleNegativesRankingLoss` mediante Unsloth. No es un modelo generativo ni un modelo conversacional: es una pieza de infraestructura para pipelines de recuperación (RAG), deduplicación y búsqueda semántica en inglés. No se han publicado resultados de benchmarks ni métricas de recuperación, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) + pooling CLS; clase `ModernBertModel` en SentenceTransformer |
| Parametros totales | 149.014.272 (aprox. 149 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (máximo de secuencia documentado por el autor) |
| Tipos de cuantizacion | No disponible; el autor no publica variantes cuantizadas. El nombre del repositorio indica pesos en 16 bits |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card la marca como desconocida) |
| Formato de pesos | safetensors |
| Dimension de salida | 768 dimensiones |
| Funcion de similitud | Similitud coseno |
| Pooling | CLS (`pooling_mode: cls`, `include_prompt: true`) |
| Libreria | sentence-transformers |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Dataset de entrenamiento | `electroglyph/technical`, 106.628 muestras (columnas `anchor` y `positive`) |
| Modelo base | `unsloth/gte-modernbert-base` (revision a56ccd75fc0d64db16102c2c1c739a67e70e3dce) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo sigue el patrón estándar de Sentence Transformers: un codificador transformer (`ModernBertModel`) que produce `last_hidden_state` y una capa de pooling que toma el token CLS para generar un único vector de 768 dimensiones. ModernBERT es una familia de encoders bidireccionales con embeddings posicionales rotatorios y atención alterna local/global, diseñada para contextos largos; sin embargo, esta model card no detalla esos aspectos y el autor fija la longitud máxima de secuencia en 1024 tokens. No hay información sobre el número de capas, la dimensión oculta interna ni la configuración exacta del encoder más allá del total de parámetros.

El entrenamiento consiste en un ajuste fino con `MultipleNegativesRankingLoss` sobre 106.628 pares (ancla, positivo) del dataset `electroglyph/technical`, que por los ejemplos de la model card cubre terminología de ingeniería, construcción, materiales, contabilidad y otros dominios técnicos. La model card no especifica hiperparámetros (épocas, tamaño de lote, tasa de aprendizaje, precisión de entrenamiento ni hardware), ni si hubo fases adicionales de destilado, hard negatives o evaluación intermedia. El ajuste se realizó con Unsloth. La model card incluye la tabla de estadísticas aproximadas del dataset truncada, por lo que no se puede verificar la longitud media de los pares ni su distribución.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones, con similitud coseno.
- Similitud semántica entre pares de textos y puntuación de pares ancla-positivo.
- Búsqueda semántica sobre corpus documentales (indexación vectorial + consulta en lenguaje natural).
- Minería de paráfrasis y detección de duplicados o near-duplicates.
- Clustering de textos mediante agrupación de embeddings.
- Clasificación y regresión sobre textos usando los embeddings como características de entrada.
- Extracción de características (`feature-extraction`) para pipelines de NLP descendentes.
- Compatibilidad con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no. El modelo está declarado únicamente para inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión o audio: no. No es un modelo generativo.

## Casos de uso

- Recuperación aumentada (RAG) sobre documentación técnica: el modelo indexa manuales, fichas de producto y especificaciones en un índice vectorial y recupera fragmentos relevantes para una consulta. Su ajuste sobre vocabulario técnico reduce la brecha de dominio frente a embeddings generalistas, y sus 1024 tokens permiten indexar fragmentos de varios párrafos.
- Búsqueda semántica en bases de conocimiento de ingeniería: permite consultar por concepto ("cómo se calcula la producción anual de energía") y recuperar documentos que usan otra terminología, algo útil cuando el usuario no conoce el término exacto del corpus.
- Deduplicación de tickets, incidencias o artículos: se generan embeddings de cada registro y se detectan pares con similitud coseno alta para fusionarlos. El tamaño de 149 M permite procesar lotes grandes en hardware modesto.
- Clustering de corpus técnicos: agrupar artículos, patentes o preguntas frecuentes por temática sin etiquetas previas, para construir taxonomías o detectar vacíos de contenido.
- Clasificación de intenciones o categorías con pocas etiquetas: entrenar un clasificador ligero (regresión logística o SVM) sobre los embeddings, lo que evita ajustar un modelo grande cuando solo se dispone de cientos de ejemplos.
- Primera etapa de un pipeline de reranking: usar este bi-encoder para recuperar los 50-100 candidatos más relevantes y aplicar después un cross-encoder más caro, reduciendo el coste de cómputo del sistema completo.
- Alineación de glosarios y ontologías: mapear términos de un catálogo interno a una taxonomía estándar buscando el vecino más cercano en el espacio de embeddings.
- Filtrado y moderación de similitud: comparar mensajes entrantes contra una lista de plantillas o contenidos prohibidos para detectar repeticiones y variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MTEB, recuperación (nDCG@10, Recall@k), similitud semántica ni ninguna otra evaluación cuantitativa, y el repositorio no enlaza informes de evaluación. Tampoco se comparan resultados contra el modelo base ni contra el estado del arte, por lo que no es posible verificar si el ajuste fino sobre `electroglyph/technical` mejora o degrada el rendimiento respecto a `unsloth/gte-modernbert-base` en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Con 149 M de parámetros, los pesos ocupan aproximadamente 0,3 GB en FP16 y 0,6 GB en FP32; sumando activaciones y overhead del runtime, el consumo realista se sitúa entre 1 y 2 GB con lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. Para alto throughput, tarjetas de datacenter como A100, H100 o L4 permiten lotes grandes; para desarrollo, T4, RTX 3060, RTX 4090 o similares son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (librería nativa), Hugging Face Text Embeddings Inference (etiqueta presente en el modelo), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No se ha verificado soporte de vLLM, llama.cpp, Ollama, TGI ni exportación a ONNX en la información disponible.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni de frases por segundo, y no hay benchmarks que permitan inferirlas con rigor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aliRafik/gte_modernbert_base_finetuned_16bit` | 149 M | 1024 tokens | 768 | No disponible | HuggingFace (0 descargas) |
| `unsloth/gte-modernbert-base` (modelo base) | 149 M | No disponible en la informacion proporcionada | 768 (heredado) | No disponible en la informacion proporcionada | HuggingFace |
| `BAAI/bge-base-en-v1.5` (alternativa de referencia) | ~109 M | 512 tokens | 768 | MIT (referencia externa) | HuggingFace, muy extendido |
| `sentence-transformers/all-MiniLM-L6-v2` (alternativa ligera) | ~22,7 M | 256 tokens | 384 | Apache 2.0 (referencia externa) | HuggingFace, muy extendido |

Nota: los datos de las dos alternativas provienen de conocimiento general sobre esas familias de modelos y no se han verificado en la información proporcionada en esta ficha; conviene contrastarlos con sus model cards antes de citarlos. La comparación cualitativa relevante es que este modelo ofrece el doble de contexto que `bge-base-en-v1.5` y `all-MiniLM-L6-v2`, a costa de un tamaño mayor que el modelo MiniLM, y que está especializado en dominio técnico en lugar de ser generalista.

## Limitaciones y advertencias

- Licencia no declarada: la model card marca la licencia como desconocida. Sin una licencia explícita no hay autorización clara para uso comercial; es imprescindible contactar con el autor o abstenerse de usarlo en producción.
- Solo inglés: el modelo está etiquetado como `en` y no se ha entrenado para otros idiomas. Usarlo con textos en castellano producirá embeddings de baja calidad.
- Contexto limitado a 1024 tokens: los textos más largos se truncan, lo que puede degradar la recuperación en documentos extensos. Además, 1024 tokens es una reducción notable frente a la ventana nativa de la arquitectura ModernBERT.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste fino mejore al modelo base. En tareas generales podría incluso degradarlo por sobreajuste al dominio técnico.
- Sesgos heredados: al derivar de `unsloth/gte-modernbert-base` y entrenarse sobre un corpus técnico en inglés, arrastra los sesgos del modelo base y sobrerrepresenta vocabulario de ingeniería, construcción y finanzas; puede infrarrepresentar otros dominios y registros.
- Riesgo de sobreajuste al dataset: 106.628 pares de un único corpus pueden producir un espacio de embeddings poco generalizable fuera de ese dominio.
- No es un modelo generativo: no puede alucinar texto porque no genera texto, pero sí puede producir similitudes engañosas cuando los textos comparten vocabulario pero difieren en significado.
- Reproducibilidad limitada: no se documentan hiperparámetros, semilla, precisión de entrenamiento ni composición detallada del dataset.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni de validación por terceros.
- El sufijo `16bit` en el nombre sugiere pesos en media precisión; no se documenta si existe una versión en FP32 ni cómo afecta la precisión numérica a la similitud coseno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliRafik/gte_modernbert_base_finetuned_16bit
- Modelo base: https://huggingface.co/unsloth/gte-modernbert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/electroglyph/technical
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
