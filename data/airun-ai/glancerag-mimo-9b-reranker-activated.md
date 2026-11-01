# airun-ai/GlanceRAG-MiMo-9B-Reranker-Activated

## Resumen

GlanceRAG-MiMo-9B-Reranker-Activated es un adaptador LoRA de tipo "activated" diseñado para convertir el modelo generativo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B en un reranker de pasajes para pipelines de RAG (retrieval-augmented generation) sin sacrificar su capacidad generativa. Lo desarrolla Airun Intelligence Labs (autores Adilet Metinov y Chingiz Arziev) y se presenta junto al articulo "Glance: The Generator Is Its Own Reranker" (arXiv:2610.40454). La idea central es que un unico modelo puntue la relevancia de cada pasaje recuperado y, a continuacion, genere la respuesta reutilizando la misma cache de atencion, de modo que el contexto se lee una sola vez para ambas tareas.

La innovacion clave es el uso de Activated LoRA (en la linea de Greenewald et al., 2025): el adaptador permanece desactivado mientras el modelo lee los pasajes recuperados y se activa unicamente durante las sondas cortas de relevancia, una por pasaje, que continuan desde la cache del estado compartido. Esto tiene dos consecuencias practicas: el chat ordinario se comporta exactamente como el modelo base (bit a bit), y la cache generada durante el reranking es la misma que se reutiliza para responder, eliminando el re-prefill de los pasajes seleccionados.

El adaptador es de rango 16 con una cabeza pointer de 256 dimensiones, se inicializa a partir de airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision y se entrena en solo 150 pasos (1.200 registros de MS MARCO, 17 minutos en una H100). No es un modelo autonomo: requiere el parche `code/alora_patch.py` aplicado antes del primer forward y el runtime Kev. La licencia es Apache-2.0 con obligacion de retener el NOTICE en redistribuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) + cabeza pointer de 256 dimensiones sobre MiMo-V2.6-Distill-Qwen-9B (transformer hibrido con DeltaNet, segun estados de cache citados) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estado mediano de 1,4k tokens en las pruebas de HotpotQA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (redistribuciones deben retener el NOTICE) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere parche Python `code/alora_patch.py` |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Tamano del repo | 0,2 GB |
| Libreria | peft |
| Runtime requerido | Kev (commit 0a6d3faf) |

## Arquitectura y entrenamiento

El adaptador se monta sobre MiMo-V2.6-Distill-Qwen-9B, un modelo hibrido cuyo estado de cache incluye KV de atencion, convolucion DeltaNet y estados recurrentes (asi se enumeran en la verificacion de identidad de cache del autor). El adaptador es un LoRA de rango 16 con una cabeza pointer de 256 dimensiones que produce la puntuacion de relevancia por pasaje. La pieza diferencial es el mecanismo "activated": el adaptador esta desactivado durante la lectura del contexto recuperado y solo se activa en las sondas cortas de relevancia que se ejecutan una por pasaje, continuando desde la cache del estado compartido. El autor verifica que, con el parche, la cache en estado adaptador-on es identica bit a bit a la del modelo base en los 48 tensores de cache (KV de atencion, convolucion DeltaNet y estados recurrentes), comprobado con Qwen3.5-0.8B y LoRA aleatorio.

El entrenamiento es deliberadamente corto: 150 pasos sobre 1.200 registros de MS MARCO, 17 minutos en una H100, con `--shared_prefix 1` en `kev.train`. El adaptador se inicializa (warm-start) desde airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision. No se detalla la composicion completa del dataset ni si hubo RLHF o DPO; la informacion disponible solo menciona MS MARCO como datos de entrenamiento del adaptador.

## Capacidades

- Reranking de pasajes para RAG: puntua la relevancia de cada pasaje recuperado (p. ej. top-20 de BM25) mediante sondas que continuan desde la cache del estado compartido.
- Generacion de respuestas reutilizando la cache del reranking: tras puntuar los pasajes, responde continuando la misma cache, sin re-prefill de los pasajes seleccionados.
- Chat identico al modelo base: el texto ordinario nunca activa el adaptador, por lo que la generacion es bit a bit la del modelo base.
- Decision sobre relevancia con cabeza pointer dedicada (256 dimensiones).
- Capacidades generativas heredadas del modelo base (razonamiento, codigo, matematicas, multilingue): no detalladas en la informacion disponible para este adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales: modo "activated" de LoRA, reutilizacion de cache entre reranking y generacion.

## Casos de uso

- Reranking en pipelines RAG de produccion: dado un conjunto de pasajes recuperados por un retriever de primera fase (p. ej. BM25 top-20), el adaptador puntua cada pasaje con una sonda corta y permite reordenarlos por relevancia antes de la generacion, reduciendo el coste frente a un reranker independiente.
- Generacion con contexto ya cacheado: tras el reranking, la respuesta se genera continuando la misma cache, lo que evita re-prefijar los pasajes seleccionados; el autor reporta EM 0,61 / F1 0,750 con latencia de 138 ms frente a EM 0,59 / F1 0,754 y 181 ms con re-prefill de los top-3.
- Sistemas de preguntas y respuestas sobre documentos largos: el modelo lee el contexto una sola vez y lo usa tanto para ordenar como para responder, adecuado para asistentes documentales donde el coste de prefill domina la latencia.
- Sustitucion de un reranker dedicado por el propio generador: elimina la necesidad de mantener un modelo de reranking separado (p. ej. bge-reranker-v2-m3) en la infraestructura, con una sola pasada sobre el contexto.
- Chat general sin degradacion: al no activarse el adaptador en texto ordinario, el mismo despliegue puede servir conversacion normal con el comportamiento exacto del modelo base.
- Evaluacion e investigacion en RAG: los scripts `e1_rerank_alora.py` y `e5_cache_reuse.py` permiten reproducir evaluaciones BEIR (SciFact, NFCorpus) y HotpotQA con el modo activated.
- Prototipado rapido de reranking: el entrenamiento del adaptador es de 150 pasos y 17 minutos en una H100, lo que facilita reentrenar o ajustar el adaptador a dominios concretos.

## Benchmarks y rendimiento

nDCG@10 con BM25 top-20, packed_all, una pasada:

| Adaptador | SciFact | NFCorpus |
|---|---|---|
| BM25 | 0,662 | 0,306 |
| bge-reranker-v2-m3 | 0,721 | 0,326 |
| Control: LoRA en todos los tokens, mismos 150 pasos | 0,744 | 0,351 |
| Activated (este adaptador) | 0,740 | 0,351 |

Reutilizacion de cache en 100 preguntas distractor de HotpotQA (10 parrafos, estado mediano de 1,4k tokens, H100):

| Metrica | Valor |
|---|---|
| Pasada de estado | 64 ms |
| 10 sondas | 85 ms |
| recall@3 | 0,97 |
| Respuesta continuando la cache del reranking | EM 0,61 / F1 0,750, 138 ms |
| Respuesta re-prefijando los top-3 pasajes | EM 0,59 / F1 0,754, 181 ms |

Verificacion de correccion: con el parche, la cache en estado adaptador-on es identica bit a bit a la del modelo base en los 48 tensores de cache (Qwen3.5-0.8B, LoRA aleatorio).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el adaptador ocupa 0,2 GB y se suma al modelo base de 9B.
- GPU recomendadas: el autor reporta entrenamiento en una H100 y evaluacion en H100; el modelo base de 9B es desplegable en GPUs de 24 GB o mas segun cuantizacion (no confirmado en la informacion disponible).
- Cabe en GPU de consumidor: no confirmado en la informacion disponible.
- Opciones de despliegue: runtime Kev (commit 0a6d3faf) con el parche `code/alora_patch.py` aplicado antes del primer forward; vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: pasada de estado 64 ms, 10 sondas 85 ms, respuesta 138 ms (continuando cache) o 181 ms (re-prefill top-3), medidos en H100 sobre HotpotQA.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | nDCG@10 SciFact | nDCG@10 NFCorpus | Licencia |
|---|---|---|---|---|---|---|
| GlanceRAG-MiMo-9B-Reranker-Activated | LoRA activated sobre generador 9B | 9B (base) | no disponible | 0,740 | 0,351 | Apache-2.0 |
| bge-reranker-v2-m3 | Reranker dedicado | no disponible | no disponible | 0,721 | 0,326 | no disponible |
| BM25 | Retriever lexico | no aplica | no aplica | 0,662 | 0,306 | no aplica |
| Control: LoRA en todos los tokens | LoRA sobre el mismo generador | 9B (base) | no disponible | 0,744 | 0,351 | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el parche `code/alora_patch.py` y el runtime Kev; sin ellos el adaptador no funciona.
- La licencia Apache-2.0 exige retener el NOTICE en redistribuciones.
- Los resultados de reranking se limitan a SciFact y NFCorpus con BM25 top-20; no hay datos publicados para otros dominios o idiomas.
- La evaluacion de reutilizacion de cache se realiza sobre 100 preguntas de HotpotQA con 10 parrafos y estado mediano de 1,4k tokens; el comportamiento con contextos mucho mas largos no esta documentado.
- El adaptador se entrena con solo 1.200 registros de MS MARCO y 150 pasos; su robustez fuera de ese dominio no esta verificada.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingue del adaptador.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible; al heredar la generacion del modelo base, los riesgos de alucinacion del base aplican a las respuestas.
- El modo activated depende de la identidad bit a bit de la cache; cualquier cambio en el runtime o en el modelo base puede romper esa garantia.
- No se documentan requisitos de VRAM, cuantizaciones soportadas ni opciones de despliegue fuera de Kev.

## Enlaces

- HuggingFace: https://huggingface.co/airun-ai/GlanceRAG-MiMo-9B-Reranker-Activated
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Adaptador de inicializacion: https://huggingface.co/airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision
- Paper: https://arxiv.org/abs/2610.40454
- Runtime Kev: https://github.com/jaredpalmer/kev
