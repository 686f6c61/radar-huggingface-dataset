# dotproductx/breadbowl-embed-v1.2-preview

## Resumen

BreadBowl-Embed v1.2-preview es una arquitectura de representación multi-vector para recuperación de información y reranking, desarrollada por dotproductx (Breadbowl AI) y publicada como research preview bajo licencia Apache 2.0. El modelo parte del backbone Qwen3.5-0.8B-Base y representa cada consulta y cada documento como un conjunto fijo de 16 slots, donde cada slot combina un vector de routing de 256 dimensiones y un vector de valor de 256 dimensiones. La idea central es que los vectores de routing sirven para seleccionar candidatos y, además, definen la atención sobre los valores almacenados del documento, de modo que el reranking depende de la consulta sin necesidad de un cross-encoder separado ni de una segunda pasada del backbone sobre el texto candidato.

El problema que aborda es el coste del pipeline clásico de dos etapas (retriever de vectores simples más cross-encoder de reranking). Al codificar el documento una sola vez y reutilizar la misma representación almacenada para recuperar y reranquear, se elimina la necesidad de re-codificar los candidatos. La model card reporta una mejora de nDCG@10 macro en BEIR de 48,47 a 51,54 sobre el mismo conjunto de 100 candidatos preseleccionados por routing, con un Recall@100 idéntico (67,91) porque ambos scorers ordenan la misma lista.

Es relevante ahora porque propone mover señal de ranking a la fase de recuperación dentro de un único espacio multi-vector, y porque su autor lo publica explícitamente como trabajo de investigación sin pesos descargables. En el momento de redactar esta ficha, el repositorio de HuggingFace contiene únicamente el preprint y la model card; no hay checkpoints, paquete de inferencia ni endpoint alojado, y el tamaño del repositorio es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3.5-0.8B-Base y representación multi-vector personalizada de 16 slots por entrada (256 dims de routing + 256 dims de valor por slot) |
| Parametros totales | 0,8B nominales en el backbone; la cifra excluye pooling y cabezas de salida, cuyo recuento no se detalla |
| Longitud de contexto | No se declara ventana de contexto del backbone. Los límites de tokens usados en la evaluación del paper son 128 para consultas y 384 para documentos |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. El repositorio no contiene pesos, solo el preprint y la model card |

## Arquitectura y entrenamiento

La arquitectura usa Qwen3.5-0.8B-Base como backbone y añade una representación multi-vector propia: cada entrada se proyecta a 16 slots, y cada slot contiene un vector de routing de 256 dimensiones y un vector de valor de 256 dimensiones. Los vectores de routing cumplen dos funciones simultáneas: sirven para la recuperación de candidatos y definen la atención sobre los vectores de valor de los documentos almacenados, lo que produce una puntuación dependiente de la consulta para el reranking. El autor subraya que se trata de una arquitectura multi-vector personalizada y que no es un modelo de embeddings de vector único que pueda sustituirse directamente en un pipeline existente. No se especifica en la información disponible si hay cabezas de pooling adicionales, ni su dimensionalidad.

Respecto al entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si se emplearon fases de RLHF o DPO. Lo único que se indica sobre los datos es que algunos dominios de BEIR aparecen en los datos de adaptación, que evaluaciones previas de SciFact y NFCorpus informaron el desarrollo, y que el solapamiento con datos de entrenamiento débil no se ha auditado por completo, por lo que la suite no es uniformemente zero-shot ni está completamente intacta. Los resultados publicados corresponden a una ablación de componentes en inferencia sobre un único checkpoint entrenado, no a una comparación entre arquitecturas entrenadas por separado. La innovación destacable es precisamente la reutilización de una única representación almacenada para recuperación y reranking, sin cross-encoder ni segunda pasada sobre el texto del candidato.

## Capacidades

- Recuperación de información (retrieval) sobre colecciones de documentos: genera representaciones de consulta y documento en forma de 16 slots con vectores de routing y de valor.
- Reranking dependiente de la consulta: los mismos vectores de routing definen la atención sobre los valores del documento, de modo que el reranking se calcula sobre la representación ya almacenada.
- Puntuación conjunta de routing y valores: la model card reporta que la combinación QKV mejora el nDCG@10 macro en BEIR frente al uso exclusivo del routing (QK).
- Selección de candidatos: el routing permite preseleccionar un conjunto de candidatos (en la evaluación, 100 por consulta) y calcular Recall@100.
- Codificación única de documentos: el documento se codifica una vez y esa representación se reutiliza tanto en la fase de recuperación como en la de reranking.
- Idiomas soportados: no disponible.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada. Se trata de un componente de recuperación, no de un modelo generativo conversacional.
- Restricción operativa relevante: el autor indica que no es un modelo de embeddings de vector único intercambiable, por lo que requiere una integración específica.

## Casos de uso

- RAG sobre documentación técnica interna: el modelo codificaría una vez el corpus y devolvería candidatos con una puntuación de reranking calculada sobre la misma representación, eliminando la necesidad de ejecutar un cross-encoder sobre cada candidato recuperado.
- Búsqueda semántica en bases de conocimiento con consultas cortas: con límites de 128 tokens por consulta y 384 por documento documentados en el paper, encaja en escenarios de búsqueda factual donde las consultas son breves y los pasajes acotados.
- Recuperación de contexto para agentes: al devolver referencias ordenadas y metadatos en lugar de vectores o respuestas generadas, puede alimentar la fase de grounding de un agente que después invoca un LLM generativo aparte.
- Reranking de segundo nivel sobre resultados de un retriever existente: la selección por routing sobre 100 candidatos y la puntuación posterior con valores permiten sustituir total o parcialmente un cross-encoder en un pipeline ya desplegado.
- Evaluación de sistemas de recuperación en investigación: al exponer métricas BEIR, nDCG@10 y Recall@100, resulta útil como punto de comparación para estudiar arquitecturas multi-vector frente a pipelines de dos etapas.
- Prototipado de productos de búsqueda documental: el diseño de "codificar una vez" reduce la lógica de orquestación necesaria si el sistema se construye alrededor de esta representación en lugar de adaptarla a un stack preexistente.
- Filtrado y ordenación de candidatos en dominios como ciencia o noticias: el paper reporta mejoras en 10 de las 15 tareas BEIR y retrocesos en 5, por lo que el ajuste depende del dominio y conviene validarlo por conjunto de datos.

## Benchmarks y rendimiento

| Scoring | BEIR macro nDCG@10 | Recall@100 |
|---|---:|---:|
| Routing solo (QK) | 48,47 | 67,91 |
| Routing + valores (QKV) | 51,54 | 67,91 |

Las métricas están multiplicadas por 100. Diez tareas mejoran y cinco empeoran. El Recall es idéntico porque ambos scorers ordenan el mismo conjunto de candidatos seleccionados por routing. Se trata de una ablación de componentes en inferencia sobre un único checkpoint, no de una comparación entre arquitecturas entrenadas por separado. El desglose completo por tarea y las comparaciones con modelos externos se remiten al paper, pero no están incluidos en la información disponible en esta ficha.

## Requisitos de hardware

- No hay pesos publicados, por lo que no existen requisitos verificados de despliegue. Cualquier cifra que se dé aquí sería una estimación.
- Estimación derivada del tamaño del backbone (0,8B parámetros): en FP16 aproximadamente 1,6 GB solo para pesos, más memoria para activaciones, pooling y cabezas de salida; en FP32 unos 3,2 GB; en INT8 unos 0,8 GB; en INT4 unos 0,4 GB. Estas cifras no están confirmadas por el autor.
- Coste de almacenamiento del índice, calculado a partir de la representación declarada: 16 slots × (256 dimensiones de routing + 256 de valor) = 8.192 valores por documento, es decir, unos 32 KB por documento en FP32 y unos 16 KB en FP16, sin contar metadatos.
- GPU recomendadas: no disponible. Un backbone de 0,8B es manejable en GPUs de consumo en cuanto a pesos, pero el rendimiento real de recuperación y reranking sobre un índice grande no está medido.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. La arquitectura es multi-vector personalizada con cabezas propias, por lo que no se puede asumir compatibilidad con runners de embeddings estándar.
- Latencia y throughput: la model card afirma explícitamente que las ventajas de latencia, throughput y coste frente a un retriever más cross-encoder no se han medido, y que el indexado, el almacenamiento y la transferencia de datos también contribuyen al coste del sistema.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos con otros modelos de embeddings o reranking; la model card remite las comparaciones con modelos externos al paper, pero esos datos no están presentes en el material disponible. La única comparación publicada es interna, entre los dos modos de puntuación del propio modelo (routing solo frente a routing más valores). Como referencia estructural, el backbone declarado es Qwen/Qwen3.5-0.8B-Base, pero un modelo de embeddings derivado de él no es una alternativa equivalente a efectos de recuperación.

## Limitaciones y advertencias

- No hay pesos descargables: el repositorio contiene solo el preprint y la model card. Tampoco hay paquete de inferencia ni endpoint alojado, y el autor condiciona el lanzamiento a verificar la procedencia del checkpoint y a publicar ejemplos ejecutables e instrucciones de evaluación.
- Es un research preview: no se formula ninguna afirmación de estado del arte ni de paridad con benchmarks generales.
- Coste del sistema sin medir: no se han medido latencia, throughput ni ahorro de coste frente a un retriever más cross-encoder.
- Solapamiento con datos de entrenamiento: algunos dominios de BEIR aparecen en los datos de adaptación y las evaluaciones previas de SciFact y NFCorpus informaron el desarrollo; el solapamiento con entrenamiento débil no se ha auditado por completo, por lo que la suite no es uniformemente zero-shot ni está intacta.
- Los resultados de BEIR son estimaciones puntuales; el paper describe por separado los resultados de desarrollo y su incertidumbre.
- Sin garantías de compatibilidad entre versiones de embeddings ni de packs de extensión de dominio en esta entrega.
- No es un modelo de vector único: no se puede usar como sustituto directo en un pipeline que espere embeddings de una sola dimensión.
- Idiomas soportados: no disponible, lo que impide valorar su comportamiento fuera del inglés y de los conjuntos BEIR.
- Licencia Apache 2.0: permite uso comercial, pero al no existir pesos publicados, la licencia se aplica por ahora al contenido del repositorio y no a artefactos de modelo utilizables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dotproductx/breadbowl-embed-v1.2-preview
- Paper (PDF, enlazado desde la model card): https://huggingface.co/dotproductx/breadbowl-embed-v1.2-preview/blob/main/BreadBowl-Embed-paper.pdf
- Documentación de la API de BreadBowl Embed (Alpha): https://docs.breadbowl.ai/
- Convenciones de la API REST de BreadBowl Embed (Alpha): https://docs.breadbowl.ai/api-reference/overview
- Sitio del proyecto: https://breadbowl.ai/
