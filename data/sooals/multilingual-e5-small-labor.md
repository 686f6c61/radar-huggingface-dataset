# sooals/multilingual-e5-small-labor

## Resumen

`sooals/multilingual-e5-small-labor` es un modelo de embeddings de frases (sentence-transformers) obtenido mediante fine-tuning de `intfloat/multilingual-e5-small` sobre pares de consultas y artículos de legislación laboral coreana. Lo desarrolla el usuario `sooals` y su propósito es la recuperación de información (information retrieval) sobre normativa laboral: dado un enunciado en lenguaje natural, devuelve los artículos legales más relevantes por similitud coseno.

El modelo mantiene la arquitectura BERT pequeña del modelo base, con 117.653.760 parámetros totales, embeddings de 384 dimensiones y una ventana de entrada de 512 tokens (incluyendo tokens especiales y prefijos). No es un modelo generativo: no produce texto, sino vectores densos normalizados para búsqueda semántica.

Es relevante por su especialización vertical: el ajuste fino se hizo con `MultipleNegativesRankingLoss` sobre un conjunto de 663 ejemplos del repositorio `sooals/labor-embedding-data`, lo que permite superar al modelo base en un dominio muy concreto (consultas sobre derechos laborales) a un coste computacional mínimo. Su licencia MIT y su reducido tamaño lo hacen desplegable en entornos modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), modelo de embeddings de frases basado en `intfloat/multilingual-e5-small` |
| Parámetros totales | 117.653.760 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:` / `passage:`) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser safetensors se puede convertir a GGUF/ONNX por cuenta propia) |
| Idiomas soportados | coreano (`ko`) declarado; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión del embedding | 384 |
| Función de pérdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamaño del dataset de entrenamiento | 663 ejemplos |
| Tamaño del repositorio | 0,5 GB |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT heredado de `intfloat/multilingual-e5-small`, con 117,6 millones de parámetros y salida de embeddings de 384 dimensiones. Se ha entrenado como modelo de similitud de frases completo (no como adaptador), usando la librería `sentence-transformers` y la función de pérdida `MultipleNegativesRankingLoss`, habitual en recuperación densa por pares consulta-documento.

El conjunto de entrenamiento es `sooals/labor-embedding-data`, con 663 pares de consulta y artículo legal. Según la model card, el corpus `general-evaluation/general-corpus` del mismo repositorio de datos se reservó para comprobar la regresión en dominios generales y no se usó para entrenar los pesos. El uso previsto exige prefijar las consultas con `query:` y los documentos con `passage:`, y normalizar los embeddings (`normalize_embeddings=True`). No se documentan fases de RLHF, DPO ni innovaciones arquitectónicas adicionales sobre el modelo base.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para frases, consultas y pasajes.
- Similitud semántica y recuperación de información (retrieval) sobre textos legales laborales en coreano.
- Extracción de características (`feature-extraction`) para pipelines de búsqueda vectorial.
- Soporte de prefijos de tarea (`query:` / `passage:`) heredado del formato E5.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste fino está orientado al coreano.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica de artículos laborales: indexar los artículos como pasajes con prefijo `passage:` y consultar en lenguaje natural con `query:`; el modelo devuelve los artículos más próximos por coseno, adecuado por su ajuste específico al dominio.
- Asistente de preguntas frecuentes sobre derechos laborales: dado un corpus de normativa y preguntas de usuarios, recuperar los fragmentos relevantes para que un LLM generativo los use como contexto (patrón RAG), aprovechando la ventana de 512 tokens por fragmento.
- Deduplicación y agrupación de consultas: agrupar consultas de empleados semánticamente equivalentes (por ejemplo, distintas formulaciones sobre permiso menstrual) usando la similitud coseno del modelo.
- Enrutamiento de tickets de soporte laboral: clasificar consultas entrantes hacia el área legal correspondiente comparando su embedding con centroides de categorías.
- Evaluación de regresiones en dominios generales: el autor incluye un corpus general de evaluación para comprobar que el ajuste fino no degrada la recuperación fuera del dominio laboral.
- Despliegue ligero en producción: con 117,6 M de parámetros y embeddings de 384 dimensiones, se puede servir en CPU o GPU modesta mediante sentence-transformers o Text Embeddings Inference para búsquedas de baja latencia.
- Construcción de bases vectoriales de normativa: generar embeddings de grandes colecciones de artículos legales para índices en motores vectoriales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el dataset `labor` (tarea information-retrieval). No están verificados (`verified: false`).

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6589 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9393 |
| Cosine Precision@1 | 0,6589 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6589 |
| Cosine Recall@5 | 0,9019 |
| Cosine NDCG@10 | 0,8047 |
| Cosine MRR@10 | 0,7607 |
| Cosine MAP@100 | 0,7625 |

No se han publicado en la información disponible resultados comparativos frente al modelo base ni frente a otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 117,6 M de parámetros; menos de 0,3 GB en fp16.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput se puede usar T4, L4, A10 o superiores.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TGI de embeddings), ONNX Runtime y exportación a otros runtimes; el tag `text-embeddings-inference` y `endpoints_compatible` indican compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Especialización |
|---|---|---|---|---|---|
| sooals/multilingual-e5-small-labor | 117,6 M | 512 tokens | 384 | MIT | Dominio laboral coreano (fine-tuning) |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 tokens | 384 | MIT | Multilingüe general |
| Otros modelos de embeddings pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación de rendimiento frente al modelo base no está publicada en la información disponible.

## Limitaciones y advertencias

- El ajuste fino se ha realizado sobre solo 663 ejemplos, por lo que el rendimiento puede ser frágil ante formulaciones o artículos no representados en el conjunto de entrenamiento.
- El autor advierte que las puntuaciones de recuperación dependen del conjunto de evaluación y que otros dominios y artículos nuevos deben evaluarse por separado.
- Una alta similitud coseno no garantiza que el documento recuperado sea la respuesta legal correcta; el modelo no es una herramienta de asesoramiento jurídico.
- El modelo está orientado al coreano; aunque hereda capacidades multilingües del base, no hay evaluación publicada en otros idiomas.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`).
- No es un modelo generativo: no produce respuestas, solo vectores; requiere un componente de generación o de presentación de resultados aguas abajo.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base `intfloat/multilingual-e5-small` y de los datos de entrenamiento.
- Riesgo de alucinación no aplica directamente al no generar texto, pero sí el riesgo de recuperar pasajes irrelevantes que un LLM posterior podría usar de forma incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sooals/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/sooals/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
