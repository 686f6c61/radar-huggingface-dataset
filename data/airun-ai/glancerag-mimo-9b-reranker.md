# airun-ai/GlanceRAG-MiMo-9B-Reranker

## Resumen

GlanceRAG-MiMo-9B-Reranker es un adaptador LoRA (rank-16) con una cabeza de puntero de 256 dimensiones, desarrollado por Airun Intelligence Labs sobre el modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B. Su propuesta, descrita en el paper *Glance: The Generator Is Its Own Reranker* (arXiv:2610.40454), es eliminar el rerankedor cross-encoder separado en pipelines RAG: el propio generador actúa como rerankedor. Todos los pasajes recuperados se precargan una sola vez en un estado compartido (KV cache), se ejecuta una sonda corta por pasaje ("¿Responde el pasaje i a la consulta?") que continúa desde esa cache, y una cabeza de puntero devuelve p(relevante) para todos los pasajes a la vez.

No es un modelo autónomo: es un adaptador PEFT que se activa y desactiva sobre el backbone en tiempo real (~10 ms de conmutación), de modo que un mismo modelo residente sirve como chat base, como modelo de decisión y como rerankedor. Esto reduce la memoria total a 16,85 GiB frente a servir dos modelos independientes. Entrenado con solo 4.000 consultas de MS MARCO durante 39 minutos en una B200 (más 14 minutos adicionales en la variante *trained-long*), supera a bge-reranker-v2-m3 en SciFact y NFCorpus, y mejora el F1 en HotpotQA al seleccionar el contexto para la respuesta. Es relevante como prueba de concepto de arquitecturas RAG unificadas donde generación y reranking comparten pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-16) + cabeza de puntero (256-d) sobre transformer decoder (MiMo-V2.6-Distill-Qwen-9B) |
| Parametros totales | no disponible (backbone de ~9B; adaptador y cabeza en un repo de 0,4 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado hasta 43k tokens en modo chunked) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con datos en ingles de MS MARCO) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, no modelo standalone) |

## Arquitectura y entrenamiento

El sistema se apoya en el backbone MiMo-V2.6-Distill-Qwen-9B (modelo destilado de Xiaomi basado en la familia Qwen, del que la ficha no detalla la arquitectura interna). La innovacion central es el mecanismo "glance": los k pasajes recuperados se rellenan una sola vez (prefill) en un estado compartido; cada sonda de relevancia es una continuacion corta desde la KV cache de ese estado, y una cabeza de puntero de 256 dimensiones produce p(relevante) para todos los pasajes en una sola pasada empaquetada. Al desactivar el adaptador, el mismo backbone funciona como modelo de chat ordinario, generando la respuesta final desde la misma cache de reranking.

El entrenamiento fue un warm-start desde el adaptador airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision: 39 minutos en una NVIDIA B200 con 4.000 consultas de MS MARCO (negativos duros de BM25, 8-20 pasajes por registro) en formato packed, y despues 14 minutos adicionales con 450 registros de 20-80 pasajes (variante *trained-long*, la del raiz del repositorio). El checkpoint de 39 minutos usado en los experimentos de HotpotQA del paper esta en `checkpoints/msmarco-short/`.

## Capacidades

- Reranking de pasajes en una sola pasada (one pass) para k candidatos, con puntuaciones de relevancia simultaneas via cabeza de puntero.
- Generacion de texto conversacional: con el adaptador desactivado, el backbone responde como un modelo de chat normal, sin servir un rerankedor separado.
- Pipeline RAG de una sola pieza: rerank y respuesta con los mismos pesos (`rag.rerank()` y `rag.answer()`), generando la respuesta desde la cache de reranking.
- Conmutacion en caliente entre modos (chat base, adaptador de decision, adaptador de reranking) en unos 10 ms por peticion, con salidas bit-identicas a cada adaptador cargado por separado.
- Escalado a k=100 candidatos (21,6k tokens) en una pasada y k=200 (43k tokens) via lotes de sondas por chunks.
- Multilingue: no disponible (entrenamiento solo con MS MARCO, en ingles).

## Casos de uso

- Reranking en pipelines RAG de codigo abierto: sustituye al cross-encoder dedicado (p. ej. bge-reranker-v2-m3) cuando ya se sirve un LLM de 9B, ahorrando la memoria y el despliegue de un segundo modelo.
- Chatbots con recuperacion documental: el mismo servicio reranquea los documentos recuperados y genera la respuesta final desde el top-3, reduciendo la latencia de orquestacion entre dos modelos.
- Selecion de contexto en QA multi-salto: en HotpotQA con distractores, el contexto seleccionado por este adaptador eleva el F1 de respuesta a 0,729 frente a 0,684 con bge-reranker-v2-m3.
- Recuperacion sobre corpus cientificos: en BEIR (SciFact, NFCorpus) supera a BM25 y al cross-encoder bge en nDCG@10, util para busqueda semantica en literatura medica y cientifica.
- Reordenacion de listas largas de candidatos: a k=100-200 candidatos mantiene ventaja sobre bge-reranker-v2-m3 (0,697 vs 0,637 a k=100), util como segunda etapa tras un retriever denso o BM25 con listas amplias.
- Servicios multi-tarea con memoria contenida: un backbone residente de 16,85 GiB sirve chat, decisiones y reranking con conmutacion por peticion, adecuado para despliegues de un solo nodo GPU donde cada GiB cuenta.
- Investigacion en arquitecturas RAG unificadas: el repo incluye scripts de evaluacion (BEIR, HotpotQA, escalado de k, sensibilidad al orden) reproducibles para experimentar con el paradigma "generador = rerankedor".

## Benchmarks y rendimiento

Reranking en BEIR (BM25 top-20, nDCG@10), segun la model card:

| Metodo | SciFact (300 q) | NFCorpus (323 q) |
|---|---|---|
| BM25 | 0,662 | 0,306 |
| bge-reranker-v2-m3 | 0,721 | 0,326 |
| Decision 9B zero-shot, 20 llamadas separadas | 0,729 | 0,323 |
| Glance zero-shot, una pasada | 0,715 | 0,341 |
| Glance trained (msmarco-short), una pasada | 0,741 | 0,345 |
| **Glance trained-long (este adaptador), una pasada** | **0,749** | **0,346** |

Escalado de candidatos (SciFact, 100 consultas, pasajes de 100 palabras):

| k | Tokens | Glance trained-long | bge-reranker-v2-m3 |
|---|---|---|---|
| 100 | 21,6k | 0,697 | 0,637 |
| 200 | 43k (chunked) | 0,717 | 0,659 |

HotpotQA distractor, 300 preguntas (checkpoint msmarco-short, respuesta desde el top-3): F1 0,729 vs 0,684 con bge-reranker-v2-m3 (+0,045, IC 95% [+0,014, +0,076]); R@2 de parrafos gold 0,897 vs 0,863.

## Requisitos de hardware

- Memoria del modelo residente (backbone + adaptadores): 16,85 GiB en total, por lo que cabe en una GPU de 24 GB (RTX 3090/4090) para el uso basico.
- Memoria de inferencia de reranking: crece con k x longitud de contexto; 56 GiB a k=100 en una pasada, y k=200 no cabe en una sola llamada (usa la ruta chunked de Kev, 15,8 s por consulta).
- GPU de referencia en los experimentos: NVIDIA B200; los tiempos de latencia publicados (1,05 s por consulta a k=100; ~270-420 ms por pasada de reranking) corresponden a esa GPU.
- Despliegue: el repo proporciona codigo propio (`code/glance_rag.py`, runtime de entrenamiento Kev) y un prototipo de vLLM (`code/vllm_proto/`) para servir chat y decisiones en un solo motor. No se menciona soporte directo de llama.cpp, Ollama o TGI.
- Nota de latencia: un cross-encoder clasico es mas rapido por consulta (24-60 ms vs ~270-420 ms en B200) en la ruta eager sin optimizar actual.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | nDCG@10 SciFact (BM25 top-20) | nDCG@10 NFCorpus | Latencia relativa | Licencia |
|---|---|---|---|---|---|---|
| GlanceRAG-MiMo-9B-Reranker (trained-long) | Rerankedor generativo (LoRA sobre 9B) | ~9B backbone | 0,749 | 0,346 | ~270-420 ms/pasada (B200) | Apache-2.0 |
| bge-reranker-v2-m3 | Cross-encoder dedicado | no disponible | 0,721 | 0,326 | 24-60 ms/consulta (B200) | Apache-2.0 (segun model card del original) |
| BM25 (linea base) | Retrieval lexico | no aplica | 0,662 | 0,306 | no disponible | no aplica |

La ventaja de Glance no es la latencia bruta por consulta sino la consolidacion: un solo modelo residente reranquea y genera, eliminando el segundo modelo del despliegue. Para latencia pura de reranking, bge-reranker-v2-m3 sigue siendo entre 4 y 10 veces mas rapido en la implementacion actual.

## Limitaciones y advertencias

- Es una prueba de concepto: conjuntos de evaluacion pequenos (300-323 consultas por dataset) y una sola familia de backbones (MiMo/Qwen 9B).
- Entrenado exclusivamente con MS MARCO (ingles); el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea inferior. Revisa los terminos de uso de MS MARCO para tu aplicacion.
- Riesgo de alucinacion heredado del backbone de 9B al generar respuestas; la model card no publica evaluaciones de alucinacion.
- Latencia de reranking peor que un cross-encoder dedicado en la ruta eager actual (270-420 ms vs 24-60 ms en B200); la ruta chunked a k=200 tarda 15,8 s por consulta.
- Consumo de memoria de reranking crece con k x longitud de contexto (56 GiB a k=100); no apto para reranking de listas muy largas en GPUs de consumo.
- No es un modelo standalone: requiere descargar el backbone XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B y gestionar el ciclo de activacion/desactivacion del adaptador.
- Licencia Apache-2.0, pero las redistribuciones deben conservar la atribucion del fichero NOTICE.
- Descargas muy bajas (37) y adopcion temprana: espera una maduracion limitada del ecosistema y posibles cambios en el codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/airun-ai/GlanceRAG-MiMo-9B-Reranker
- Paper (arXiv): https://arxiv.org/abs/2610.40454
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Adaptador de decision warm-start: https://huggingface.co/airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision
- Variante activada: https://huggingface.co/airun-ai/GlanceRAG-MiMo-9B-Reranker-Activated
