# mktktmr/ruri-v3-reranker-310m-rag-stage1

## Resumen

ruri-v3-reranker-310m-rag-stage1 es un modelo de reranking para recuperacion aumentada por generacion (RAG) en japones, desarrollado por el usuario mktktmr. Se trata de un ajuste fino (fine-tuning) del modelo cl-nagoya/ruri-v3-reranker-310m, que a su vez forma parte de la familia Ruri v3 de CL Nagoya, orientada a tareas de representacion y ordenacion de documentos en japones. El modelo resuelve la segunda etapa de un pipeline RAG: dado un conjunto de candidatos recuperados por un retriever inicial, reordena los pasajes segun su relevancia respecto a la consulta.

La arquitectura subyacente es ModernBERT, un transformer encoder con atencion de contexto largo y sesgos de posicion rotatorios, adaptado aqui como clasificador de pares consulta-pasaje. Con 315.203.329 parametros (aproximadamente 310 millones, de ahi el sufijo del nombre), el modelo es lo bastante pequeno para desplegarse en GPU de consumo y con latencias bajas, lo que resulta adecuado para entornos de produccion con volumen alto de consultas.

La relevancia de esta publicacion es limitada pero concreta: se trata de un ajuste adicional sobre un reranker japones ya existente, entrenado con datos de QA japoneses (JEMHopQA, NIILC QA, JSQuAD) y fragmentos de Wikipedia en japones. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se ha publicado informacion sobre licencia, idiomas ni benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por los datos de entrenamiento, japones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | cl-nagoya/ruri-v3-reranker-310m |
| Tamano del repositorio | 1,3 GB |
| Tarea | reranking (clasificacion de pares consulta-pasaje) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de transformer encoder que incorpora mejoras sobre BERT clasico: atencion con sesgos de posicion rotatorios (RoPE), alternancia entre atencion local y global, y soporte nativo de contextos largos. En su variante de reranker, el encoder procesa el par (consulta, pasaje) y produce una puntuacion de relevancia, habitualmente mediante una cabeza de clasificacion sobre el token [CLS] o mediante una capa lineal sobre la representacion final.

El entrenamiento consiste en un ajuste fino adicional sobre cl-nagoya/ruri-v3-reranker-310m (Apache-2.0). Segun la model card, los datos empleados son JEMHopQA, NIILC QA, JSQuAD (de JGLUE) y un conjunto de fragmentos distribuidos derivados de Wikipedia en japones, todos ellos bajo licencia CC BY-SA 4.0 y filtrados y reformateados para el entrenamiento. No se especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones. El nombre del repositorio sugiere una primera etapa ("stage1") de un entrenamiento por fases, pero no se detalla el procedimiento completo.

## Capacidades

- Reranking de pasajes: puntua la relevancia de un pasaje respecto a una consulta, para su uso como segunda etapa en pipelines de recuperacion de informacion.
- Procesamiento de pares consulta-documento en japones, segun los datos de entrenamiento empleados.
- Integracion en pipelines RAG: reordena los resultados de un retriever denso o disperso antes de pasarlos al generador.
- Clasificacion de relevancia binaria o por puntuacion continua, segun la cabeza de clasificacion del modelo base.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es un encoder discriminativo.
- Capacidades multilingues: no disponibles; el entrenamiento se ha realizado exclusivamente con datos en japones.

## Casos de uso

- Reranking en pipelines RAG en japones: tras una primera fase de recuperacion con un retriever como Ruri v3 embedding, el modelo reordena los 50-100 candidatos iniciales para seleccionar los 5-10 pasajes mas relevantes que se pasaran al generador. Su tamano de 310 millones permite hacerlo con latencia baja en GPU de consumo.
- Busqueda documental interna: en corpus empresariales en japones, el modelo puede puntuar fragmentos de manuales, contratos o bases de conocimiento para responder consultas de empleados, mejorando la precision respecto a la recuperacion inicial.
- Atencion al cliente con base de conocimiento: integrado en un sistema de FAQ, reordena los articulos candidatos recuperados por similitud vectorial antes de mostrarlos o de alimentar a un LLM generador.
- Sistemas de preguntas y respuestas extractivas: para tareas de QA sobre Wikipedia japonesa o dominios similares a los datos de entrenamiento (JEMHopQA, NIILC QA, JSQuAD), el modelo puede seleccionar el pasaje que contiene la respuesta.
- Filtrado de ruido en recuperacion: como etapa de desambiguacion para descartar pasajes lexicalmente similares pero semanticamente irrelevantes, reduciendo las alucinaciones del generador en la fase final del RAG.
- Evaluacion y experimentacion academica: al ser un fine-tuning publico sobre un reranker japones conocido, sirve como punto de partida para comparar estrategias de ajuste en tareas de reranking en japones, siempre que se respeten las licencias CC BY-SA 4.0 de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB para los pesos (315 millones de parametros x 2 bytes), mas memoria para activaciones y batch; en la practica, 2-4 GB son suficientes para lotes moderados.
- En cuantizacion int8: alrededor de 0,35 GB de pesos; en int4, unos 0,2 GB, aunque no se han publicado conversiones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 son suficientes. Para despliegues de alto throughput, L4 o A10 ofrecen buen equilibrio.
- Cabe en GPU de consumo sin problema: GTX 1660, RTX 2060, RTX 3050 y superiores.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI) de Hugging Face para rerankers, vLLM no aplica (no es generativo), ONNX Runtime para inferencia optimizada en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mktktmr/ruri-v3-reranker-310m-rag-stage1 | 315 M | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning sobre Ruri v3 reranker |
| cl-nagoya/ruri-v3-reranker-310m | ~310 M | no disponible | Apache-2.0 | Hugging Face | Modelo base original, mas documentado |
| BAAI/bge-reranker-v2-m3 | ~568 M | 8192 tokens | Apache-2.0 | Hugging Face | Multilingue, muy usado en RAG |
| jinaai/jina-reranker-v2-base-multilingual | ~278 M | 1024 tokens | CC BY-NC 4.0 | Hugging Face | Multilingue, no comercial |

La comparativa se limita a datos publicos de los modelos alternativos; no hay benchmarks del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada en la model card: aunque el modelo base es Apache-2.0, el fine-tuning no declara licencia propia, lo que genera incertidumbre para uso comercial.
- Los datos de entrenamiento estan bajo CC BY-SA 4.0 (JEMHopQA, NIILC QA, JSQuAD, Wikipedia japonesa), lo que puede imponer obligaciones de atribucion y compartir igual si se redistribuye el modelo o derivados.
- Entrenado exclusivamente con datos en japones: el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base, por lo que su utilidad practica no esta validada.
- Repositorio sin descargas ni likes: no hay senales de uso comunitario ni validacion externa.
- Riesgo de sesgo: los datos de Wikipedia y QA japoneses pueden reflejar sesgos de la fuente; no se ha documentado ninguna mitigacion.
- Riesgo de alucinacion: al ser un modelo discriminativo, no genera texto, pero puede puntuar como relevantes pasajes incorrectos si el dominio difiere del de entrenamiento.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por par consulta-pasaje, lo que limita el diseno de pipelines con pasajes largos.
- El nombre "stage1" sugiere que puede existir una version posterior; conviene verificar si hay etapas adicionales antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/ruri-v3-reranker-310m-rag-stage1
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
