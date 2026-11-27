# satoyutaka/ruri-v3-reranker-ft1

## Resumen

Ruri v3 Reranker FT1 es un modelo de reranking (text-ranking) para japones desarrollado por el usuario satoyutaka, obtenido mediante fine-tuning del modelo cl-nagoya/ruri-v3-reranker-310m. Su funcion es reordenar un conjunto de documentos candidatos recuperados por un sistema de busqueda, asignando mayor probabilidad a los pasajes que contienen la respuesta a una pregunta dada. Resuelve el problema clasico de la segunda fase del pipeline RAG: la recuperacion inicial (retrieval) devuelve documentos ruidosos y el reranker se encarga de priorizar los relevantes antes de pasarlos al generador.

El modelo parte de una arquitectura ModernBERT de aproximadamente 315 millones de parametros (315.203.329 en safetensors), con una longitud maxima de secuencia de 512 tokens y licencia Apache 2.0. Es relevante para desarrolladores que construyen sistemas de busqueda o RAG en japones y necesitan un reranker ligero, desplegable en hardware modesto y con licencia permisiva para uso comercial.

El fine-tuning se ha realizado sobre grupos pregunta-documento construidos mecanicamente a partir de cuatro datasets japoneses de control de calidad (JEMHopQA, auto-wiki-qa, JSQuAD y JaQuAD), con un objetivo softmax que maximiza la probabilidad agregada de los documentos que contienen la respuesta dentro de cada grupo. El modelo es muy reciente y cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 315.203.329 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura ModernBERT del checkpoint base cl-nagoya/ruri-v3-reranker-310m (revision 2c23c61a90583f0348880a2ffb2d7fd29e2d14f1). ModernBERT es un encoder transformer con atención de secuencia completa y mejoras de eficiencia respecto a BERT clasico, orientado a tareas de comprension y ranking. El modelo se usa como cross-encoder: recibe el par pregunta-documento y produce una puntuacion de relevancia.

El fine-tuning se realizo con tasa de aprendizaje 1e-5, acumulacion de batch efectiva de 4 y una longitud maxima de secuencia de 512. El objetivo de entrenamiento es una softmax loss que, para cada pregunta, maximiza la suma de probabilidades de los documentos del grupo que contienen la respuesta. Los datos de entrenamiento son grupos pregunta-documento construidos mecanicamente a partir de JEMHopQA (CC BY-SA 4.0), auto-wiki-qa (CC BY-SA 4.0), JSQuAD de JGLUE (CC BY-SA 4.0) y JaQuAD (CC BY-SA 3.0). El autor indica que no se usaron preguntas ni datos de evaluacion en el entrenamiento. No se documenta el numero total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables a un reranker).

## Capacidades

- Ranking de documentos: asigna una puntuacion de relevancia a cada par pregunta-pasaje para reordenar candidatos de un sistema de recuperacion.
- Comprension lectora en japones: entrenado sobre datasets de question answering extractivo y multi-hop (JEMHopQA, JSQuAD, JaQuAD, auto-wiki-qa).
- Reranking en pipelines RAG: segunda fase tras un retriever denso o disperso.
- Manejo de preguntas multi-hop: JEMHopQA aporta preguntas que requieren combinar informacion de varias fuentes.
- Longitud de entrada de hasta 512 tokens por par.
- No soporta tool calling, function calling, agentes, vision ni audio (es un encoder de ranking, no un modelo generativo).
- Capacidad multilingue limitada al japones.

## Casos de uso

- RAG en japones: tras recuperar los 50-100 documentos mas similares con un retriever (BM25 o embeddings), el reranker reordena y se pasan los 5-10 mejores al LLM generador. El modelo es adecuado por su tamano reducido y su entrenamiento especifico en QA japones.
- Busqueda documental interna: en corpus empresariales japoneses, reordenar resultados de busqueda por relevancia real frente a la consulta del usuario.
- Atencion al cliente sobre base de conocimiento: seleccionar el articulo correcto de la FAQ antes de que un LLM redacte la respuesta, reduciendo alucinaciones por contexto irrelevante.
- Sistemas de pregunta-respuesta extractiva: localizar el pasaje que contiene la respuesta en documentacion tecnica o legal japonesa.
- Filtrado de candidatos en pipelines de anotacion: priorizar pasajes para revision humana en tareas de curación de datos.
- Evaluacion de retrievers: usar el reranker como juez de relevancia para medir la calidad de un sistema de recuperacion sobre datasets japoneses.
- Busqueda multi-hop: consultas que requieren combinar evidencia de varios documentos, aprovechando el entrenamiento con JEMHopQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB en fp32 (315 M de parametros), alrededor de 0,7 GB en fp16 y menos de 0,4 GB en cuantizacion de 8 bits. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU con suficiente memoria.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), Text Embeddings Inference (TEI) de Hugging Face para servir rerankers, o exportacion a ONNX. vLLM y llama.cpp no estan orientados a este tipo de modelo de ranking.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 315 M con secuencias de hasta 512 tokens, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| satoyutaka/ruri-v3-reranker-ft1 | 315 M | 512 | ja | Apache 2.0 | Hugging Face |
| cl-nagoya/ruri-v3-reranker-310m (base) | ~310 M | 512 | ja | no disponible en la informacion | Hugging Face |
| BAAI/bge-reranker-v2-m3 | no disponible en la informacion | no disponible en la informacion | multilingue | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo japones: no esta entrenado ni evaluado para otros idiomas.
- Ventana de 512 tokens: los pasajes mas largos deben truncarse o dividirse, lo que puede perder evidencia relevante.
- Riesgo de sesgo heredado de los datasets de entrenamiento (Wikipedia, JGLUE, JaQuAD), que pueden sobrerrepresentar ciertos dominios y estilos.
- Es un modelo de ranking, no generativo: no produce respuestas, solo puntuaciones de relevancia; puede alucinar relevancia si el pasaje contiene terminos de la pregunta sin responderla.
- Modelo muy reciente y sin descargas ni validacion de la comunidad: no hay evidencia independiente de su calidad frente al checkpoint base.
- Aunque la licencia es Apache 2.0, los datasets de entrenamiento tienen licencias CC BY-SA (3.0 y 4.0), lo que puede plantear dudas sobre la trazabilidad de los datos en entornos comerciales estrictos.
- No hay informacion sobre cuantizaciones validadas ni sobre latencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/ruri-v3-reranker-ft1
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
