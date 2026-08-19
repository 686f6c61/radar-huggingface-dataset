# OrDora/coachtwin-embedder

## Resumen

CoachTwin Embedder es un modelo de embeddings de frases desarrollado por OrDora para impulsar la recuperación de entrenamientos físicos en la aplicación CoachTwin. Se trata de una versión publicada del checkpoint `BAAI/bge-small-en-v1.5`, seleccionado tras una evaluación comparativa sobre el dataset propio `coachtwin-workouts` (10.393 entrenamientos). El modelo no ha sido fine-tuned: la calidad de la recuperación proviene de la elección del encoder base y del uso de plantillas específicas para documentos y consultas.

El modelo resuelve el problema de búsqueda semántica en un dominio muy concreto: encontrar rutinas de ejercicio a partir de descripciones en lenguaje natural (por ejemplo, "quiero un entrenamiento de fuerza para piernas de 30 minutos con mancuernas"). Su relevancia radica en que ofrece un equilibrio óptimo entre precisión y coste computacional, siendo lo bastante ligero para ejecutarse en CPU con latencias aceptables. Con 33,36 millones de parámetros y una dimensión de embeddings de 384, es adecuado para aplicaciones con recursos limitados.

La arquitectura es un transformer BERT pequeño, con una longitud de contexto típica de 512 tokens (heredada del modelo base, aunque no se documenta explícitamente en la ficha). Está diseñado para generar representaciones densas de frases y calcular similitudes mediante producto escalar tras normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de bge-small-en-v1.5) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (descripciones cortas estructuradas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en la arquitectura BERT, concretamente el checkpoint `BAAI/bge-small-en-v1.5`, que a su vez deriva de `BAAI/bge-small-en` con entrenamiento adicional en pares de frases para retrieval. No se ha realizado ningún fine-tuning adicional sobre el dataset de workouts; el propio autor indica que es el checkpoint base sin entrenar. La calidad de la recuperación se logra mediante dos plantillas distintas para documentos y consultas, documentadas en `embedding_info.json`. La plantilla de documento conserva los nombres de los ejercicios (que aportan la mayor señal discriminativa entre rutinas de empuje y tracción), mientras que la de consulta es más natural. Además, al ser un modelo BGE, las consultas deben prefijarse con `Represent this sentence for searching relevant passages: `, mientras que los documentos no llevan prefijo.

## Capacidades

- Genera embeddings de frases normalizados para similitud coseno o producto escalar.
- Recuperación semántica de documentos cortos y estructurados (descripciones de entrenamientos).
- Soporte para búsqueda por similitud en corpus de tamaño moderado (miles de documentos).
- Compatible con la libreria sentence-transformers y con text-embeddings-inference.
- No dispone de generación de texto, tool calling, ni capacidades multimodales.
- Monolingüe (inglés) y limitado al dominio fitness/entrenamiento.

## Casos de uso

- Buscador de entrenamientos en apps de fitness: el modelo permite que un usuario escriba una consulta en lenguaje natural y obtenga rutinas relevantes según objetivo, grupo muscular, duración y equipamiento. Su tamaño reducido permite ejecutarlo en el cliente o en un servidor ligero.
- Sistema de recomendación de rutinas: a partir de un historial de entrenamientos preferidos, se pueden calcular embeddings de los items y recomendar otros similares por similitud coseno.
- Clasificación de ejercicios por criterios semánticos: agrupar workouts por tipo de esfuerzo (fuerza, cardio, flexibilidad) usando los embeddings como características para clustering.
- Filtrado de contenido en plataformas de contenido fitness: dado un conjunto de videos o artículos, se pueden emparejar con descripciones de entrenamiento para sugerencias contextuales.
- Asistente conversacional de entrenamiento: integrado en un chatbot, permite recuperar la rutina más adecuada a partir de la petición del usuario y responder con la descripción estructurada.
- Evaluación de relevancia en motores de búsqueda verticales: el modelo puede servir como componente de reranking en pipelines de retrieval sobre catálogos de ejercicios, mejorando la precisión frente a búsqueda por palabras clave.

## Benchmarks y rendimiento

La model card incluye una evaluación leave-one-out sobre 10.393 entrenamientos. La métrica `precision_at_3_strict` exige coincidencia en `goal` y `body_focus`; `precision_at_3_loose` solo exige `body_focus`. Se compararon tres encoders:

| Modelo | Parametros (M) | Dim | P@3 estricto | P@3 laxo | MRR@10 | Velocidad encode (corpus/s) |
|---|---:|---:|---:|---:|---:|---:|
| all-MiniLM-L6-v2 | 22 | 384 | 0,4733 | 0,6667 | 0,6686 | 7,0 |
| all-mpnet-base-v2 | 110 | 768 | 0,5047 | 0,7453 | 0,6866 | 31,2 |
| bge-small-en-v1.5 | 33 | 384 | 0,6687 | 0,8273 | 0,8020 | 10,4 |

El baseline aleatorio tiene un P@3 estricto de 0,0220 y laxo de 0,1200. El modelo seleccionado (bge-small-en-v1.5) alcanza un P@3 estricto de 0,669, aproximadamente 30 veces el azar. La selección priorizó el equilibrio entre precisión y coste: cualquier modelo dentro de 2 puntos del mejor se consideraba equivalente, y se eligió el más pequeño.

## Requisitos de hardware

- Modelo de 33 millones de parámetros, aproximadamente 133 MB en fp32 (0,1 GB en el repositorio). Cabe en memoria de cualquier GPU moderna y también en CPU.
- Inferencia en CPU: la aplicación CoachTwin se ejecuta en un Space gratuito de Hugging Face con CPU, y la velocidad de codificación del corpus es de 10,4 documentos por segundo (según la tabla de evaluación), lo que implica latencias de unos 100 ms por documento.
- VRAM estimada: menos de 1 GB para inferencia en lote pequeño. No requiere GPU dedicada.
- Compatible con librerías como sentence-transformers, text-embeddings-inference, y puede desplegarse con vLLM o llama.cpp (aunque estos últimos están más orientados a modelos generativos).
- Para producción con alto throughput, se puede servir con TEI (Text Embeddings Inference) en una instancia pequeña.

## Comparativa con modelos similares

La comparativa se basa en la evaluación publicada en la model card, que enfrenta a tres modelos de embeddings de propósito general sobre el dataset de workouts:

| Modelo | Parametros | Dimension | Contexto | Licencia | P@3 estricto | MRR@10 |
|---|---|---|---|---|---|---|
| CoachTwin Embedder (bge-small-en-v1.5) | 33 M | 384 | 512 (no documentado) | Apache 2.0 | 0,6687 | 0,8020 |
| all-MiniLM-L6-v2 | 22 M | 384 | 256 | Apache 2.0 | 0,4733 | 0,6686 |
| all-mpnet-base-v2 | 110 M | 768 | 384 | Apache 2.0 | 0,5047 | 0,6866 |

El modelo elegido supera claramente a los otros dos en precisión, con un coste intermedio en parámetros y velocidad. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre descripciones cortas y estructuradas de entrenamientos en inglés. Su rendimiento en otros dominios o idiomas será significativamente inferior.
- No ha sido fine-tuned; la calidad depende de las plantillas de documento/consulta, que deben mantenerse para obtener los resultados esperados.
- Al ser un modelo BGE, las consultas deben llevar el prefijo `Represent this sentence for searching relevant passages: `; omitirlo degrada la recuperación.
- Puede heredar sesgos del modelo base `bge-small-en-v1.5`, como sesgos de género o culturales en la representación de actividades físicas.
- No apto para tareas generativas o de razonamiento; es exclusivamente un encoder de frases.
- La longitud de contexto no está documentada en la ficha; se recomienda no superar los 512 tokens por seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrDora/coachtwin-embedder
- Dataset de entrenamientos: https://huggingface.co/datasets/OrDora/coachtwin-workouts
- Aplicación CoachTwin (Space): https://huggingface.co/spaces/OrDora/coachtwin
- Perfil del autor en Hugging Face: https://huggingface.co/OrDora
