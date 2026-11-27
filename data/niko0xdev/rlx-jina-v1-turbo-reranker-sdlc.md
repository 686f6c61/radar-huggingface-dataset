# niko0xdev/rlx-jina-v1-turbo-reranker-sdlc

## Resumen

rlx-jina-v1-turbo-reranker-sdlc es un cross-encoder de reranking afinado por el desarrollador niko0xdev a partir de jinaai/jina-reranker-v1-turbo-en, un backbone BERT de aproximadamente 37,8 millones de parametros. El modelo resuelve un problema muy concreto: ordenar memorias serializadas de un agente de desarrollo de software (registros de decisiones de arquitectura, commits, errores y raices de fallo) frente a una consulta dada, descartando distractores plausibles pero incorrectos.

La relevancia del modelo no esta en su tamano, sino en su empaquetado: se distribuye como un pack ONNX con cuantizacion dinamica INT8 de 48,36 MB, con la atencion ALiBi recortada a una longitud maxima de 512 tokens, y esta verificado para su uso offline desde Rust mediante FastEmbed. Forma parte del proyecto rlx (SDLC Memory Intelligence), que combina este reranker con un segundo modelo (rlx-jina-v2-small-sdlc) para un total de 87,54 MB, por debajo del umbral de 100 MB que se ha fijado el proyecto.

Se trata de un modelo piloto (v1) con licencia Apache 2.0, entrenado sobre un dataset curado propio, orientado a ingles y vietnamita, y pensado para memoria de agentes en entornos de ingenieria de software. Su interes para desarrolladores e investigadores radica en que demuestra que un reranker pequeno y cuantizado puede superar a su modelo base en una tarea de dominio especifico con un coste de latencia en CPU muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (backbone jina-reranker-v1-turbo-en), atencion ALiBi recortada a max_length=512 |
| Parametros totales | ~37,8 M (backbone base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por par (query, documento) |
| Tipos de cuantizacion | FP32 ONNX (156,27 MB) y dinamica INT8 ONNX (48,36 MB) |
| Idiomas soportados | Ingles (en) y vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (pack para FastEmbed en Rust); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder clasico: recibe el par (query, memoria serializada) de forma conjunta y produce un logit de relevancia. El backbone es jina-reranker-v1-turbo-en, un transformer BERT de ~37,8 M de parametros con atencion ALiBi, que en esta version se ha recortado a una longitud maxima de 512 tokens. La salida es un logit crudo sin calibrar (`raw_cross_encoder_logit_uncalibrated`), pensado para ordenar candidatos y no para interpretarse como probabilidad.

El entrenamiento se realizo con BCEWithLogitsLoss sobre pares (query, memoria serializada) construidos con distractores duros: `stale_adr`, `wrong_commit`, `similar_error_different_root_cause` y `failed_attempt_distractor`. Se ejecutaron 2 epocas con batch de 32 y learning rate de 2e-5 en una GPU Tesla T4, con un tiempo total de 51,45 segundos. El dataset es niko0xdev/rlx-sdlc-memory-pilot. La innovacion tecnica destacable no esta en el algoritmo sino en el pipeline de despliegue: exportacion a ONNX, cuantizacion dinamica INT8 con perdida nula de NDCG@10 y verificacion de paridad de ranking exacta frente a la referencia FP32 en Python desde Rust.

## Capacidades

- Reranking de pares (consulta, documento) para busqueda y recuperacion de informacion.
- Ordenacion de memorias de agentes en contextos de ciclo de vida de desarrollo de software (SDLC): decisiones de arquitectura, commits, errores y causas raiz.
- Discriminacion de distractores duros: detecta memorias obsoletas, commits incorrectos y errores con causa raiz distinta.
- Consultas mixtas en ingles, vietnamita y fragmentos de codigo.
- Inferencia offline en CPU mediante FastEmbed para Rust (crates `rlx-inference-fastembed`).
- No soporta generacion de texto, tool calling, agentes multi-paso, vision ni audio: es exclusivamente un modelo de ranking.

## Casos de uso

- Memoria de agentes de codigo: el modelo ordena las memorias recuperadas de un agente (decisiones previas, errores resueltos) antes de inyectarlas en el prompt, evitando que el agente reutilice informacion obsoleta. Es adecuado por su entrenamiento especifico con distractores `stale_adr` y `wrong_commit`.
- Recuperacion de decisiones de arquitectura: dado un cambio propuesto, el reranker prioriza los ADR (Architecture Decision Records) vigentes frente a los caducados, usando el logit crudo como puntuacion de ordenacion.
- Busqueda de causas raiz en incidencias: ante un error nuevo, ordena incidencias historicas y descarta las que comparten sintoma pero no causa raiz, gracias al distractor `similar_error_different_root_cause`.
- Despliegue en entornos sin GPU ni red: con 48,36 MB en INT8 y verificacion offline en Rust, puede embeberse en servidores de inferencia locales (`rlx-inference-server`) o en herramientas de desarrollo que operen aisladas.
- Filtrado previo en pipelines RAG de documentacion tecnica: actua como segunda etapa de reranking tras un retriever vectorial, con latencia P50 de 24,29 ms para 3 documentos en Apple M1 Pro.
- Soporte a equipos bilingues en ingles y vietnamita: el modelo mantiene un Top-1 de 1,0000 en consultas mixtas EN/VI/codigo, lo que permite usarlo en equipos con documentacion en ambos idiomas.
- Clasificacion ligera de relevancia en CI/CD: integrado en el servidor de inferencia, puede puntuar y ordenar artefactos de memoria generados durante la build sin anadir dependencias pesadas.

## Benchmarks y rendimiento

Resultados medidos en `private_test` (280 grupos de consulta retenidos, 1.116 pares):

| Variante | Top-1 global | NDCG@10 global | MRR global | Top-1 EN | Top-1 VI | Top-1 mixto |
|---|---:|---:|---:|---:|---:|---:|
| Baseline jina-reranker-v1-turbo-en (FP32) | 0,8607 | 0,9443 | 0,9250 | 0,9071 | 0,9750 | 0,6000 |
| Pilot v1 fine-tuned (FP32) | 0,9857 | 0,9947 | 0,9929 | 0,9786 | 0,9875 | 1,0000 |
| Pilot v1 fine-tuned (ONNX INT8) | 0,9857 | 0,9947 | 0,9929 | 0,9714 | 1,0000 | 1,0000 |

Ganancias frente al baseline en `private_test`: +12,50 pp en Top-1, +5,04 pp en NDCG@10 y +40,00 pp en consultas mixtas EN/VI/codigo. La cuantizacion INT8 no introduce perdida de NDCG@10 (0,00 pp).

Paridad y latencia (Apple M1 Pro, verificacion offline con `cargo test -p rlx-inference-fastembed --test real_pack_parity`):

| Metrica | Valor |
|---|---|
| Coincidencia exacta de ranking vs golden FP32 en Python | `exact_rank_match = true` |
| Diferencia absoluta maxima de score | 0,11193 |
| Latencia CPU, rerank de 3 documentos, P50 | 24,29 ms |
| Latencia CPU, rerank de 3 documentos, P95 | 43,33 ms |

## Requisitos de hardware

- VRAM: no requiere GPU; el pack INT8 de 48,36 MB esta disenado para inferencia en CPU.
- GPU recomendadas: no aplica para el artefacto distribuido; el entrenamiento se realizo en una Tesla T4.
- GPU de consumo: irrelevante, ya que el modelo se ejecuta en CPU; cabe en cualquier maquina con unos pocos cientos de MB de RAM libre.
- Despliegue: FastEmbed para Rust (`rlx-inference-server`, `rlx-memory-server`), cargando el pack con `--model-pack models/packs/rlx-jina-v1-turbo-reranker-sdlc`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: P50 de 24,29 ms y P95 de 43,33 ms para un rerank de 3 documentos en Apple M1 Pro. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (private_test) | Licencia | Formato |
|---|---|---:|---:|---|---|
| rlx-jina-v1-turbo-reranker-sdlc (INT8) | ~37,8 M | 512 | 0,9857 | Apache 2.0 | ONNX INT8 |
| jinaai/jina-reranker-v1-turbo-en (base, FP32) | ~37,8 M | no disponible | 0,8607 | Apache 2.0 | safetensors / ONNX |
| rlx-jina-v2-small-sdlc | no disponible | no disponible | no disponible | no disponible | ONNX (pack complementario) |

La comparacion con el modelo base es la unica con datos publicados en la informacion disponible; el segundo pack del proyecto se menciona solo por su tamano combinado (87,54 MB) y no se ofrecen metricas propias. No se dispone de comparaciones con otros rerankers de la misma categoria.

## Limitaciones y advertencias

- Modelo piloto (v1): entrenado sobre un dataset curado propio; el autor recomienda escalar con trazas SDLC reales auditadas y ablaciones con RankNet/LambdaLoss en la v2.
- Longitud maxima de par de 512 tokens: memorias o consultas mas largas deben truncarse, con posible perdida de informacion.
- Los scores son logits crudos sin calibrar: sirven para ordenar, no como probabilidad de relevancia.
- Cobertura linguistica limitada a ingles y vietnamita; el rendimiento en castellano u otros idiomas no esta evaluado.
- El conjunto de evaluacion es privado y de dominio especifico (280 grupos de consulta); las metricas no son directamente extrapolables a otros dominios de recuperacion.
- No se han publicado analisis de sesgos; al derivar de un backbone BERT entrenado con datos web, puede heredar sesgos de ese corpus.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en la ordenacion cuando la consulta queda fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento deben verificarse por separado si se redistribuye.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopcion minimo y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niko0xdev/rlx-jina-v1-turbo-reranker-sdlc
- Dataset de entrenamiento: https://huggingface.co/datasets/niko0xdev/rlx-sdlc-memory-pilot
- Codigo fuente del proyecto rlx: https://github.com/niko0xdev/rlx
- Modelo base: https://huggingface.co/jinaai/jina-reranker-v1-turbo-en
