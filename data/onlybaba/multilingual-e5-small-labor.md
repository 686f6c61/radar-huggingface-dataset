# onlyBABA/multilingual-e5-small-labor

## Resumen

`onlyBABA/multilingual-e5-small-labor` es un modelo de embeddings densos (sentence-transformers) derivado por fine-tuning de `intfloat/multilingual-e5-small`, publicado por el usuario onlyBABA. Su propósito es la recuperación semántica de artículos legales laborales coreanos: recibe una consulta en lenguaje natural sobre derechos laborales y devuelve los pasajes de la ley que mejor responden a esa consulta. Se trata, por tanto, de un modelo de recuperación de información (information retrieval), no de un modelo generativo.

Arquitectura BERT de 117.653.760 parámetros (encoder de 12 capas, dimensión de embedding de 384), con una ventana máxima de 512 tokens incluyendo tokens especiales y prefijos. El entrenamiento se realizó con la función de pérdida `MultipleNegativesRankingLoss` sobre un conjunto de 663 pares consulta-pasaje del repositorio `onlyBABA/labor-embedding-data`, siguiendo el esquema de prefijos de la familia E5 (`query:` para consultas, `passage:` para documentos) e instruyendo la normalización de embeddings.

Su relevancia es acotada pero concreta: demuestra cómo un modelo multilingüe pequeño puede especializarse en un dominio jurídico vertical con un dataset muy reducido, alcanzando un Recall@5 de 0,9159 en el conjunto de evaluación declarado por el autor. Es útil como componente de un pipeline RAG legal en coreano, no como solución autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuning de `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:`/`passage:`) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors FP32/FP16 se puede cuantizar a INT8/GGUF con herramientas externas) |
| Idiomas soportados | coreano (`ko`) declarado; el modelo base es multilingüe, pero el fine-tuning solo se ha validado en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Dimension de embedding | 384 |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 663 pares |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder BERT estándar de la familia E5-small: 12 capas, 384 dimensiones ocultas y 117,6 M de parámetros, con pooling sobre el token `[CLS]` y normalización L2 de los embeddings resultantes. No incorpora innovaciones arquitectónicas propias; toda la especificidad proviene del fine-tuning.

El entrenamiento parte de `intfloat/multilingual-e5-small` y se realiza sobre 663 pares (consulta, pasaje correcto) del dataset `onlyBABA/labor-embedding-data`, con `MultipleNegativesRankingLoss`, una pérdida de tipo contrastivo que usa los pasajes de otros ejemplos del batch como negativos. El autor indica que el corpus `general-evaluation/general-corpus` del mismo repositorio de datos se reservó para comprobar la regresión en dominios generales y no se usó para entrenar los pesos. No se documentan fases de RLHF, DPO ni datos de instrucción adicionales. El uso correcto exige anteponer `query:` a las consultas y `passage:` a los documentos, y codificar con `normalize_embeddings=True`.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para similitud semántica y recuperación de información.
- Búsqueda de artículos legales laborales coreanos a partir de consultas en lenguaje natural coloquial (por ejemplo, paráfrasis de preguntas sobre permisos, salarios o despidos).
- Extracción de características (`feature-extraction`) para pipelines de RAG y motores de búsqueda vectorial.
- Coincidencia semántica entre formulaciones distintas de la misma pregunta jurídica, según los ejemplos de la model card.
- Compatibilidad con `sentence-transformers` y con Text Embeddings Inference (endpoints compatibles, según los tags del repositorio).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder, no un modelo generativo.
- No tiene capacidades de visión ni audio.
- Capacidad multilingüe heredada del modelo base, pero sin validación declarada fuera del coreano.

## Casos de uso

- Búsqueda legal laboral en coreano: indexar los artículos de la ley laboral como pasajes con prefijo `passage:` y resolver consultas de usuarios con prefijo `query:`; el Recall@5 de 0,9159 declarado lo hace adecuado para la primera etapa de recuperación.
- Componente de recuperación en un pipeline RAG jurídico: usar este modelo para seleccionar los 5-10 artículos candidatos y pasarlos a un LLM generativo que redacte la respuesta; separa la recuperación del razonamiento y reduce el coste frente a un modelo grande.
- Asistente interno de RR. HH.: permitir que empleados consulten políticas de permisos, horas extra o salarios contra la normativa indexada, con respuestas trazables al artículo concreto.
- Deduplicación y agrupación de consultas laborales: agrupar tickets o preguntas de usuarios por similitud de embedding para enrutarlos al equipo o al artículo correspondiente.
- Enrutamiento de consultas a artículos: clasificar una consulta entrante hacia el artículo de la ley que la cubre (por ejemplo, el artículo 73 sobre permiso menstrual) mediante búsqueda por vecino más cercano.
- Filtrado de regresión en dominios generales: el autor publica un corpus general de evaluación para comprobar que el fine-tuning no degrada la recuperación fuera del dominio laboral; sirve como plantilla para validar especializaciones verticales.
- Prototipado rápido en entornos con recursos limitados: con 117,6 M de parámetros y embeddings de 384 dimensiones, el índice vectorial es pequeño y la inferencia es viable en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (dataset `labor`, tarea information retrieval, métricas no verificadas por terceros):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6402 |
| Cosine Accuracy@3 | 0,8364 |
| Cosine Accuracy@5 | 0,9159 |
| Cosine Accuracy@10 | 0,9393 |
| Cosine Precision@1 | 0,6402 |
| Cosine Precision@5 | 0,1832 |
| Cosine Recall@1 | 0,6402 |
| Cosine Recall@5 | 0,9159 |
| Cosine NDCG@10 | 0,7951 |
| Cosine MRR@10 | 0,7481 |
| Cosine MAP@100 | 0,7499 |

No se han publicado comparaciones con otros modelos en la información disponible, ni resultados sobre benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB), que además no aplican a un encoder de recuperación.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,5 GB en FP32 (117,6 M de parámetros) y alrededor de 0,25 GB en FP16; el índice de embeddings ocupa 384 dimensiones por documento (1,5 KB por vector en FP32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda muy sobredimensionada para este modelo y solo se justifica por el volumen de peticiones.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 o superiores, y funciona en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TGI de embeddings), y exportación a ONNX o cuantización INT8 con herramientas externas para CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Especializacion |
|---|---|---|---|---|---|
| `onlyBABA/multilingual-e5-small-labor` | 117,6 M | 384 | 512 tokens | MIT | Dominio laboral coreano (fine-tuning) |
| `intfloat/multilingual-e5-small` (base) | 117,6 M | 384 | 512 tokens | MIT | Multilingüe general |
| `intfloat/multilingual-e5-base` | no disponible en la información | no disponible | no disponible | MIT | Multilingüe general, mayor capacidad |
| `BAAI/bge-m3` | no disponible en la información | no disponible | no disponible | no disponible | Multilingüe general, recuperación densa y dispersa |

La comparación cuantitativa con alternativas no está disponible: el autor solo publica métricas sobre su propio conjunto `labor`, sin línea base del modelo original ni de otros encoders. La ventaja frente a `multilingual-e5-small` es la especialización en terminología laboral coreana; la desventaja es el riesgo de regresión fuera del dominio, que el autor reconoce y para el que publica un corpus de comprobación.

## Limitaciones y advertencias

- El entrenamiento usa solo 663 pares, por lo que la cobertura de formulaciones y de artículos es limitada; artículos nuevos o poco representados pueden recuperarse mal.
- El autor advierte explícitamente de que una similitud alta no garantiza que el pasaje sea la respuesta jurídica correcta y de que el modelo no sirve como asesoramiento legal.
- Las métricas del `model-index` están marcadas como no verificadas (`verified: false`) y se calculan sobre el mismo dominio de entrenamiento; no hay evaluación independiente.
- El idioma declarado es únicamente coreano; el comportamiento en castellano u otros idiomas no está validado y puede degradarse respecto al modelo base.
- Ventana de 512 tokens: los artículos largos deben fragmentarse, lo que puede separar el contexto necesario para la consulta.
- Riesgo de sesgo derivado de la distribución del dataset de 663 pares, que puede sobrerrepresentar ciertos temas (permisos, salarios, despidos) frente a otros.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base `intfloat/multilingual-e5-small`, también MIT.
- Para producción, el autor recomienda reevaluar en el corpus propio y monitorizar la regresión en dominios ajenos al laboral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onlyBABA/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/onlyBABA/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de la familia E5 (Multilingual E5 Text Embeddings): https://arxiv.org/abs/2402.05672
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
