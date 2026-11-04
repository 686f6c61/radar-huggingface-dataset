# jinm1222/multilingual-e5-small-labor

## Resumen

`jinm1222/multilingual-e5-small-labor` es un modelo de embeddings de frases (sentence-transformers) obtenido por fine-tuning de `intfloat/multilingual-e5-small` sobre un corpus de consultas y artículos legales laborales surcoreanos. Lo desarrolla el usuario de HuggingFace jinm1222 y está pensado para una única tarea: recuperación de información (information retrieval) sobre textos normativos de ámbito laboral, es decir, mapear una pregunta en lenguaje natural al artículo de la ley que la responde.

Arquitectónicamente es un transformer tipo BERT (la familia E5-small) con 117.653.760 parámetros totales y embeddings de 384 dimensiones. El fine-tuning se realizó con la pérdida `MultipleNegativesRankingLoss` sobre un conjunto de 663 pares (dataset `jinm1222/labor-embedding-data`), siguiendo el esquema de prefijos `query:` / `passage:` propio de la familia E5.

Su relevancia es acotada pero concreta: demuestra cómo un modelo base multilingüe pequeño puede especializarse en un dominio jurídico muy estrecho con muy pocos datos y recursos mínimos de entrenamiento, y publica métricas de recuperación verificables sobre su propio conjunto de evaluación. No es un modelo generativo ni un asistente legal, sino un componente de recuperación para pipelines RAG o motores de búsqueda semántica en el dominio laboral coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (familia E5-small), encoder denso |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos `query:` / `passage:`) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión completa) |
| Idiomas soportados | coreano (`ko`) declarado; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Dimension del embedding | 384 |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 663 pares |
| Libreria | sentence-transformers |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder transformer bidireccional de la familia E5 con 117,6 millones de parámetros y representaciones de 384 dimensiones, entrenado originalmente con objetivos de contrastive learning multilingüe. Sobre esa base se aplica un fine-tuning completo (no adaptadores) con `MultipleNegativesRankingLoss`, una pérdida contrastiva que usa los pasajes positivos del resto del batch como negativos en memoria, adecuada para pares pregunta-respuesta.

Los datos de entrenamiento son 663 pares de consulta laboral y artículo legal (por ejemplo, preguntas sobre permiso menstrual, prescripción de salarios o límites de horas extra emparejadas con los artículos correspondientes de la legislación laboral coreana). El autor indica explícitamente que el corpus general del mismo repositorio de datos (`general-evaluation/general-corpus`) se reservó para comprobar la regresión en otros dominios y no se usó para entrenar los pesos. No se documentan fases de RLHF, DPO ni aumentos de datos; el pipeline es un fine-tuning supervisado de recuperación densa con prefijos asimétricos (`query:` para consultas, `passage:` para documentos) y normalización L2 de los embeddings en la codificación.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para similitud semántica y recuperación de pasajes.
- Recuperación de información (information retrieval) en dominio jurídico-laboral coreano: dada una consulta, devuelve los artículos más afines por similitud coseno.
- Extracción de características (`feature-extraction`) y `sentence-similarity` como tareas declaradas en el pipeline.
- Soporte de prefijos asimétricos `query:` / `passage:`, requisito para obtener el rendimiento esperado.
- Multilingüismo heredado del modelo base E5, aunque solo el coreano está declarado y evaluado.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un encoder, no un modelo generativo.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica de artículos laborales: indexar el articulado de la ley con el prefijo `passage:` y servir consultas de trabajadores con `query:`; con un Accuracy@5 del 90,2 % en el conjunto de evaluación, el artículo correcto aparece entre los cinco primeros en la gran mayoría de casos.
- Componente de recuperación en un pipeline RAG jurídico: usar el modelo como retriever para seleccionar los artículos relevantes y pasarlos a un LLM generativo que redacte la respuesta; sus 384 dimensiones y 117 M de parámetros permiten indexar corpus grandes en memoria y con baja latencia.
- Asistencia a trabajadores en portales de empleo: clasificar consultas entrantes (permisos, salarios, despido) contra una base de normativa y enrutarlas al artículo o al departamento correspondiente.
- Atención al cliente en asesorías laborales: recuperación de la cláusula aplicable antes de que un agente humano revise el caso, reduciendo el tiempo de búsqueda manual en el articulado.
- Deduplicación y agrupación de consultas: agrupar preguntas equivalentes formuladas de forma distinta (el autor muestra tres paráfrasis de la misma pregunta sobre permiso menstrual) mediante similitud coseno para consolidar FAQs.
- Evaluación de regresiones en dominios cruzados: el corpus general del repositorio de datos permite comprobar que la especialización en el dominio laboral no degrada la recuperación en otros ámbitos.
- Filtrado previo en sistemas de compliance: descartar consultas que no correspondan a normativa laboral antes de invocar modelos más costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index, sobre el conjunto de evaluación `labor` (tarea information retrieval). No están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
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

No se han publicado en la información disponible resultados comparativos frente al modelo base ni frente a otros modelos de embeddings en el mismo conjunto.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en FP32 (117,6 M de parámetros, aproximadamente 0,47 GB de pesos) más el overhead de activaciones; en FP16 alrededor de 0,24 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está claramente sobredimensionado para ellas y el cuello de botella será el indexado, no la GPU.
- Cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU con throughput aceptable para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (etiqueta `text-embeddings-inference`), HuggingFace Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime y FAISS o similar como índice vectorial externo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Especializacion |
|---|---|---|---|---|---|
| jinm1222/multilingual-e5-small-labor | 117,6 M | 512 | 384 | MIT | Dominio laboral coreano (fine-tuning) |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 | 384 | MIT | Multilingüe general |
| intfloat/multilingual-e5-base | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | MIT | Multilingüe general |
| BGE-M3 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | MIT | Multilingüe general, denso y disperso |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible: el autor solo publica métricas sobre su propio conjunto `labor`, sin línea base del modelo original ni de terceros. La ventaja diferencial del modelo es la especialización en el dominio y el coste mínimo de despliegue; su desventaja es que, al derivar de un `small`, su techo de calidad en recuperación general es inferior al de encoders más grandes.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado con 663 pares de un único ámbito jurídico coreano; el rendimiento en otros dominios o en legislación de otros países no está evaluado y puede degradarse.
- Cobertura léxica limitada: los artículos y terminología no vistos durante el fine-tuning requieren evaluación separada, según advierte el propio autor.
- Riesgo de falsos positivos: una similitud coseno alta no garantiza que el pasaje recuperado sea la respuesta legal correcta; el modelo no valida la pertinencia jurídica.
- No es un modelo de asesoramiento legal: el autor lo declara explícitamente; cualquier uso en producción debe incluir revisión humana.
- Idiomas: solo el coreano está declarado y evaluado; el multilingüismo del modelo base no se ha verificado tras el fine-tuning.
- Contexto de 512 tokens: los artículos o consultas más largos se truncan, lo que puede perder información relevante en textos normativos extensos.
- Métricas no verificadas: todos los resultados de la model-index están marcados como `verified: false` y proceden del propio autor.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no exime del cumplimiento de la normativa de protección de datos al procesar consultas de usuarios reales.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas en el repositorio, por lo que el despliegue en CPU requiere convertir los pesos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jinm1222/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/jinm1222/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Resultados de búsqueda web: no se han encontrado enlaces relevantes (el único resultado devuelto es la página principal de Wikipédia, sin relación con el modelo).
