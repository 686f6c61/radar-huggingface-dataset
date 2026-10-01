# gouneji/ms-marco-MiniLM-L6-v2-qasper

## Resumen

gouneji/ms-marco-MiniLM-L6-v2-qasper es un cross-encoder de 22.713.601 parámetros que puntúa pasajes de artículos científicos según lo bien que responden a una pregunta concreta. Lo publica el usuario gouneji como fine-tune de cross-encoder/ms-marco-MiniLM-L6-v2 sobre el split de entrenamiento del dataset allenai/qasper, y esta pensado como etapa de reordenacion dentro del proyecto Enterprise RAG System.

El modelo no genera texto: recibe pares (pregunta, pasaje) y devuelve una puntuacion de relevancia. En el sistema para el que se construyo, la busqueda hibrida (BM25 y recuperacion densa, fusionadas con Reciprocal Rank Fusion) produce 20 candidatos, este reranker los reordena y los 4 mejores pasan al modelo de lenguaje. Es, por tanto, una pieza de infraestructura de RAG, no un modelo de proposito general.

Su relevancia esta en la mejora medida sobre el reranker original en el split de test de QASPER: Hit@1 pasa del 39,9% al 49,5%, Hit@4 del 70,3% al 79,6% y MRR@10 de 0,544 a 0,637. El modelo tiene cero descargas y cero likes en el momento de la consulta, y su licencia es apache-2.0 con soporte unicamente de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cross-encoder basado en transformer tipo BERT de la familia MiniLM-L6 (sentence-transformers, pipeline text-ranking) |
| Parametros totales | 22.713.601 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 320 tokens, longitud maxima usada en entrenamiento y en la puntuacion de pasajes segun la model card; el limite de posiciones del transformer base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 0,1 GB, pipeline declarado text-ranking, modelo base cross-encoder/ms-marco-MiniLM-L6-v2, dataset de entrenamiento allenai/qasper. Creado el 2026-10-01 y actualizado el 2026-10-01.

## Arquitectura y entrenamiento

Se trata de un cross-encoder: la pregunta y el pasaje se concatenan y se procesan juntos en una unica pasada del encoder, y la cabeza de clasificacion produce una puntuacion de relevancia. Frente a los bi-encoders, esto permite atencion cruzada completa entre consulta y pasaje a cambio de no poder precalcular representaciones, lo que lo hace adecuado para la fase de reranking sobre un conjunto pequeno de candidatos (20 en el sistema original). No hay decoder ni generacion autoregresiva.

El entrenamiento uso el split de train de QASPER (888 articulos y 2.237 preguntas con parrafos de evidencia) y el dataset allenai/qasper como fuente. Para cada pregunta se construyeron ejemplos con un fragmento de un parrafo de evidencia y hasta 7 negativos duros, extraidos de los fragmentos sin evidencia mejor clasificados por el recuperador hibrido. Como los anotadores de QASPER no marcan todos los parrafos que apoyan una respuesta, se aplico una desminado: se descartaron los negativos que el reranker base puntuaba igual o por encima del mejor fragmento de evidencia, quedando 14.666 negativos. La perdida fue entropia cruzada softmax listwise, con 8 preguntas por lote.

La optimizacion uso AdamW con tasa de aprendizaje 2e-5, weight decay 0,01, calentamiento lineal sobre el 10% de los pasos, recorte de gradiente en 1,0, precision mixta fp16, longitud maxima de 320 tokens y 5 epocas sobre una Tesla T4. Cada epoca se evaluo en el split de desarrollo y se selecciono la epoca 3, con MRR@10 de 0,599 frente a 0,496 del modelo base. El test se evaluo una sola vez tras la seleccion. La misma receta sin desminado obtuvo 0,487 en desarrollo, por debajo del modelo base, igual que el entrenamiento pointwise con entropia cruzada binaria (0,485).

## Capacidades

- Puntuacion de relevancia pregunta-pasaje en ingles, con salida de un escalar por par.
- Reranking de candidatos recuperados por busqueda hibrida (BM25 mas recuperacion densa) en pipelines de RAG.
- Manejo de preguntas de busqueda de informacion ancladas en articulos cientificos, el dominio de QASPER.
- Capacidad de ordenar listas (listwise) de hasta 8 candidatos por pregunta durante el entrenamiento, aunque en inferencia puntua pares independientes.
- No genera texto, no resume, no responde preguntas por si mismo.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene modo de razonamiento explicito ni capacidades multimodales (vision o audio).
- Multilinguismo: no disponible; la model card solo declara ingles.

## Casos de uso

- RAG sobre literatura cientifica: dado un corpus de articulos troceado en fragmentos de 200 tokens, el modelo reordena las respuestas candidatas de un recuperador hibrido y deja los 4 mejores fragmentos al LLM generador. Es exactamente el flujo para el que fue entrenado.
- Buscador interno de documentacion tecnica: reordenar resultados de BM25 y busqueda vectorial cuando las consultas son preguntas factuales y los documentos tienen estructura de articulo (secciones, tablas, figuras).
- Asistente de revision bibliografica: dada una pregunta sobre un paper concreto, recuperar el parrafo exacto que la responde, reduciendo el contexto que se envia al modelo generador.
- Filtro de contexto en produccion: descartar candidatos irrelevantes antes de la llamada al LLM para recortar coste de tokens y latencia del generador.
- Ajuste de umbral de recuperacion: usar las puntuaciones del cross-encoder para decidir si hace falta una segunda ronda de recuperacion o si el sistema debe responder que no hay evidencia suficiente.
- Evaluacion de calidad de un recuperador: medir Hit@k y MRR@k de un pipeline de recuperacion existente sustituyendo el reranker por este modelo sobre un conjunto etiquetado.
- Desambiguacion de fragmentos similares: cuando varios fragmentos comparten terminologia (por ejemplo, hiperparametros frente a tamano del conjunto de datos), el cross-encoder distingue cual responde realmente a la pregunta, algo que un bi-encoder suele fallar.
- Despliegue en entornos con recursos limitados: con 22,7 millones de parametros, la inferencia puede ejecutarse en CPU o en GPU de gama baja dentro de un servicio de microreordenacion.

## Benchmarks y rendimiento

Resultados declarados en el split de test de QASPER (416 articulos y 1.351 preguntas con parrafos de evidencia; cada pregunta se responde contra su propio articulo, troceado en fragmentos de 200 tokens como maximo). Un fragmento cuenta como relevante si su parrafo fue marcado como evidencia por un anotador.

| Pipeline de recuperacion | Hit@1 | Hit@4 | MRR@10 |
|---|---:|---:|---:|
| Busqueda hibrida + reranker base | 39,9% | 70,3% | 0,544 |
| Busqueda hibrida + este reranker | 49,5% | 79,6% | 0,637 |
| Busqueda hibrida con el embedder ajustado + este reranker | 49,4% | 81,2% | 0,642 |

La ultima fila corresponde al sistema seleccionado en desarrollo. Frente a la pareja base, la ganancia de MRR@10 es de +0,098, con intervalo de confianza del 95% por bootstrap emparejado de +0,082 a +0,114. En el split de desarrollo, el modelo alcanzo MRR@10 de 0,599 frente a 0,496 del base. En una prueba con un articulo propio de 23 paginas ajeno a QASPER, con 40 preguntas, logro Hit@3 del 92,5% frente al 87,5% del sistema base, si bien la muestra es pequena.

No se han publicado resultados de benchmark en la informacion disponible mas alla de los anteriores (no hay MMLU, HumanEval, GSM8K ni equivalentes, que ademas no aplican a un cross-encoder).

## Requisitos de hardware

- VRAM estimada: el peso del modelo ocupa aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8. Con activaciones y lotes moderados, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria, por ejemplo GTX 1650, RTX 3050, RTX 4090, A100 o H100. El entrenamiento declarado se realizo sobre una Tesla T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: sentence-transformers (clase CrossEncoder, el uso documentado en la model card), Text Embeddings Inference (etiqueta text-embeddings-inference) y endpoints compatibles (etiqueta endpoints_compatible). vLLM, llama.cpp y Ollama no son aplicables a este tipo de modelo, y no se publican pesos GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| cross-encoder/ms-marco-MiniLM-L6-v2 | reranker generico base | no disponible en la informacion proporcionada | no disponible | no disponible | MRR@10 en desarrollo 0,496; en test con busqueda hibrida Hit@1 39,9%, Hit@4 70,3%, MRR@10 0,544 |
| gouneji/ms-marco-MiniLM-L6-v2-qasper | reranker especializado en QASPER | 22.713.601 | 320 tokens | apache-2.0 | MRR@10 en desarrollo 0,599; en test Hit@1 49,5%, Hit@4 79,6%, MRR@10 0,637 |
| gouneji/all-MiniLM-L6-v2-qasper | embedder (no reranker, otra funcion en el pipeline) | no disponible | no disponible | no disponible | combinado con el reranker: Hit@4 81,2%, MRR@10 0,642 |

No se dispone de comparaciones con otros rerankers de la misma categoria (por ejemplo BGE, Jina o Cohere Rerank) en la informacion proporcionada. La comparacion relevante es contra su propio modelo base, sobre el que mejora de forma consistente en las tres metricas del test.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con articulos de investigacion en ingles del dominio de NLP; el rendimiento fuera de ese dominio no esta caracterizado.
- Solo puntua pasajes de hasta 320 tokens, por lo que la evidencia repartida a lo largo de un parrafo largo o contenida en una tabla puede no detectarse.
- Las etiquetas de evidencia de QASPER son incompletas: algunos pasajes contabilizados como fallo si responden a la pregunta, lo que infravalora las metricas reales y anade ruido a los negativos de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto, pero si puede asignar puntuaciones altas a pasajes que no responden a la pregunta.
- Sesgos conocidos: no disponible; no se documenta ningun analisis de sesgos.
- Limitacion idiomatica: el modelo declara solo ingles, por lo que su uso con consultas o documentos en castellano no esta soportado ni validado.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset QASPER (CC BY 4.0) si se redistribuyen derivados.
- Advertencia para produccion: el modelo tiene cero descargas y cero likes, y procede de un autor individual; no hay garantia de mantenimiento, versionado ni soporte.
- La mejora reportada en un articulo propio de 23 paginas se basa en 40 preguntas, una muestra demasiado pequena para extrapolar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gouneji/ms-marco-MiniLM-L6-v2-qasper
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Dataset QASPER: https://huggingface.co/datasets/allenai/qasper
- Embedder ajustado del mismo autor: https://huggingface.co/gouneji/all-MiniLM-L6-v2-qasper
- Proyecto Enterprise RAG System: https://github.com/Karan-thayat/enterprise-rag-system
- Articulo de QASPER: Dasigi, Lo, Beltagy, Cohan, Smith y Gardner, "A Dataset of Information-Seeking Questions and Answers Anchored in Research Papers", NAACL 2021 (no se incluye URL en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces encontrados corresponden al termino "Javindo" (lengua criolla de base neerlandesa) y no guardan relacion con el modelo.
