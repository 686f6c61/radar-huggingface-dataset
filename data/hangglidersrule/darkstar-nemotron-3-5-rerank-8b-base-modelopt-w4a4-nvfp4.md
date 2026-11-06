# HangGlidersRule/Darkstar-Nemotron-3.5-Rerank-8B-Base-ModelOpt-W4A4-NVFP4

## Resumen

Darkstar-Nemotron-3.5-Rerank-8B-Base-ModelOpt-W4A4-NVFP4 es una cuantización NVFP4 del reranker `nvidia/Nemotron-3.5-Rerank-8B-BF16`, publicada por el usuario HangGlidersRule bajo el paraguas del proyecto "model-forge". El modelo conserva la arquitectura multimodal Mistral3 (torre de texto Ministral3 de 34 capas más torre de visión Pixtral) y su cabeza de scoring con mean pooling (4096 → 1), pero cuantiza a W4A4 NVFP4 las 238 capas lineales de la torre de texto, manteniendo en BF16 la torre de visión, los embeddings, las normas y la cabeza de score.

El problema que resuelve es doble: por un lado reduce el peso en memoria de 15,74 GiB a 5,77 GiB en vLLM, y por otro multiplica el throughput por aproximadamente 3x (de 18,0 a 55,7 pares/s a concurrencia 4) con una degradación de calidad que el autor mide como estadísticamente indistinguible de cero en sus dos conjuntos de evaluación. Es relevante ahora porque demuestra que la cuantización FP4 de extremo a extremo (pesos y activaciones) es viable en un reranker de producción sin reentrenamiento y sin pérdida medible de nDCG@10.

La ficha tiene un interés práctico para equipos que despliegan pipelines RAG con reranking a gran escala: el mismo hardware sirve casi el triple de consultas y ocupa la mitad de VRAM. El modelo no es un generador de texto ni un asistente conversacional; es un componente especializado de ordenación de pares consulta-documento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral3 (torre de texto Ministral3, 34 capas + torre de visión Pixtral + proyector multimodal + cabeza de score con mean pooling 4096 → 1) |
| Parámetros totales | 8.381.159.424 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el perfil de servicio usa `--max-model-len 8192`) |
| Tipos de cuantización | NVFP4 (FP4 E2M1) en pesos y activaciones de las 238 lineales de la torre de texto, grupo 16, escalas de bloque FP8 E4M3; resto en BF16; KV cache en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (con `custom_code`, cuantización nvidia-modelopt) |

## Arquitectura y entrenamiento

El modelo base es un reranker multimodal construido sobre Mistral3: una torre de texto Ministral3 de 34 capas con atención bidireccional, una torre de visión Pixtral con su proyector, y una cabeza de score que aplica mean pooling sobre las representaciones (4096 → 1). No se ha reentrenado ni aplicado edición de comportamiento: la cuantización se construyó directamente desde los pesos BF16 del checkpoint upstream `nvidia/Nemotron-3.5-Rerank-8B-BF16` en la revisión `f88f8d9104726747791283ab156d2fcdb29e90a7`, sin usar checkpoints cuantizados de terceros como entrada.

La receta técnica es ModelOpt `0.48.0` con torch 2.15.0 y transformers 5.18.0, bajo el recipe de operadores `nvfp4_text_all_act_headroom-kv_bf16`. Las escalas de pesos se obtuvieron con un barrido MSE de escalas FP8; las de activación, con calibración `nvfp4_act_headroom` (percentil ancla 1, percentil superior 99.99, rho 16384). La calibración usó 512 pares consulta-pasaje de `microsoft/ms_marco` v1.1 (256 relevantes, 256 no relevantes, semilla 1234), renderizados exactamente con la plantilla de chat del checkpoint y ejecutando el clasificador completo con la misma atención bidireccional y mean pooling que usa el servidor. La innovación destacable es que la cuantización cubre tanto pesos como activaciones en todas las proyecciones de atención (`q/k/v/o_proj`) y MLP (`gate/up/down_proj`), algo poco habitual en rerankers de producción.

## Capacidades

- Reranking de pares consulta-documento: produce una puntuación escalar de relevancia mediante mean pooling y cabeza lineal.
- Procesamiento de texto con atención bidireccional, adecuado para clasificación de pares y no para generación autoregresiva.
- Soporte multimodal heredado del modelo base: torre de visión Pixtral y proyector multimodal conservados en BF16 (aunque la calibración y la evaluación publicadas son solo de texto).
- Integración con vLLM mediante `custom_code` y `pipeline_tag: text-ranking`.
- Capacidad de servir lotes grandes de pares (64 pares por petición en las pruebas del autor).
- No se documentan tool calling, function calling, agentes, thinking mode ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Reranking en pipelines RAG de producción: el modelo reordena los candidatos recuperados por un retriever BM25 o denso antes de pasarlos al generador; con 55,7 pares/s a concurrencia 4 en una RTX PRO 6000, un solo servidor puede atender miles de consultas por minuto con 30 candidatos cada una.
- Búsqueda empresarial a gran escala: al ocupar 9,5 GiB en servicio frente a 18,5 GiB en BF16, permite duplicar la densidad de réplicas por GPU o reservar VRAM para el resto del stack (embeddings, generador) en la misma máquina.
- Memoria conversacional de agentes: el autor evalúa explícitamente sobre LMEB Dialogue (LoCoMo, REALTALK, TMD), de modo que el modelo está validado para puntuar turnos de conversación frente a una consulta y decidir qué recuerdos recuperar.
- Filtrado de candidatos en motores de búsqueda documental: con 8.970 pares evaluados sobre seis conjuntos MTEB Nano (NFCorpus, FiQA2018, Touche2020, ArguAna, SciFact, MSMARCO), el checkpoint mantiene el 99,94% del nDCG@10 macro del BF16, lo que lo hace apto para sustituir al original sin recalibrar umbrales.
- Evaluación de calidad de respuestas y deduplicación semántica: la cabeza de score puntúa pares (consulta, pasaje) de forma determinista, útil para ordenar respuestas candidatas de un LLM o detectar duplicados con un umbral fijo.
- Despliegue en GPUs Blackwell con FP4 nativo: al usar NVFP4, aprovecha los tensor cores FP4 de SM120 (RTX PRO 6000 Blackwell en las pruebas), lo que reduce el coste por par frente a servir el BF16 en el mismo hardware.
- Servicio de bajo presupuesto en consumer GPU: con 5,77 GiB de pesos, el modelo cabe en GPUs de 12-16 GB (por ejemplo, RTX 4070 Ti Super o RTX 4080) siempre que el runtime soporte NVFP4; no se han publicado pruebas en esas tarjetas.

## Benchmarks y rendimiento

| Métrica | Valor | Base |
|---|---|---|
| nDCG@10 macro, 6 conjuntos MTEB Nano | 0,7344 (BF16 0,7349), 99,94% | 299 consultas, 8.970 pares |
| Delta vs BF16, 6 MTEB Nano | −0,0004 (IC 95% −0,0055 a +0,0049) | bootstrap pareado, no distinguible de cero |
| nDCG@10 macro, LMEB Dialogue | 0,8056 (BF16 0,8089), 99,59% | 540 consultas, 16.200 pares |
| Delta vs BF16, LMEB Dialogue | −0,0033 (IC 95% −0,0096 a +0,0027) | bootstrap pareado, no distinguible de cero |
| Ruido del replicado BF16 | −0,0001 y −0,0003 | segundo servicio BF16 de los mismos pesos |
| Acuerdo de ranking vs BF16 | Spearman 0,982 y 0,984; solapamiento top-10 0,946 y 0,940 | los dos conjuntos en orden |
| Throughput, 64 pares/petición | 51,5 / 55,7 / 51,9 pares/s a c=1 / 4 / 8 (BF16 17,4 / 18,0 / 17,9), 2,90-3,09x | pares de ~1,1k tokens, mediana de 3 ejecuciones |
| Memoria GPU bajo carga | 9,5 GiB (BF16 18,5 GiB) | `--max-model-len 8192 --max-num-batched-tokens 8192` |
| Perfil de servicio publicado | 0,7346 y 0,7332 en MTEB Nano; 0,8045 y 0,8023 en LMEB Dialogue | dos servicios frescos con la orden del autor |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; el modelo es un reranker y no un generador.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,77 GiB solo de pesos; 9,5 GiB bajo carga medida con 64 pares por petición y `--max-model-len 8192`.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120) es la plataforma validada por el autor; se requiere soporte de NVFP4 en el runtime (tensor cores FP4).
- Consumer GPU: por tamaño de pesos cabría en GPUs de 12-16 GB, pero no se han publicado pruebas en tarjetas consumer; la viabilidad depende del soporte NVFP4 de vLLM en esas arquitecturas.
- Opciones de despliegue: vLLM `v0.32.0` (runtime validado); no se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 51,5-55,7 pares/s a c=1-8 con pares de ~1,1k tokens, frente a 17,4-18,0 pares/s del BF16 en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 MTEB Nano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar-Nemotron-3.5-Rerank-8B W4A4 NVFP4 (este) | 8,38B | no disponible | 0,7344 | openmdw-1.1 | Hugging Face |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8,38B | no disponible | 0,7349 | openmdw-1.1 | Hugging Face |
| Candidato B (MLP W4A4, atención FP8) | 8,38B | no disponible | 100,04% de BF16 | openmdw-1.1 | no publicado como checkpoint |
| Candidato C (MLP W4A4, atención BF16) | 8,38B | no disponible | 100,06% de BF16 | openmdw-1.1 | no publicado como checkpoint |

Los candidatos B y C son variantes internas del mismo proceso de construcción descritas en la model card; no se han publicado como checkpoints independientes. No se dispone de datos de otros rerankers comparables (por ejemplo, de la familia BGE o Cohere Rerank) en la información proporcionada.

## Limitaciones y advertencias

- La calibración se hizo exclusivamente con texto (512 pares de MS MARCO); no hay evidencia publicada de que la torre de visión cuantizada o el pipeline multimodal mantengan la calidad del BF16.
- La evaluación se limita a dos conjuntos: seis tareas MTEB Nano y LMEB Dialogue. No hay datos de MIRACL, BEIR completo ni dominios especializados (legal, biomédico, código).
- El throughput y la memoria se midieron en una única GPU (RTX PRO 6000 Blackwell, SM120) con vLLM 0.32.0; el rendimiento en otras arquitecturas no está documentado.
- El delta negativo en LMEB Dialogue (−0,0033) tiene un intervalo de confianza que incluye el cero, pero el límite inferior (−0,0096) no permite descartar una degradación pequeña en producción.
- La licencia openmdw-1.1 debe revisarse para uso comercial; no es una licencia permisiva estándar y puede imponer condiciones adicionales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración de scores: el modelo emite puntuaciones que deben umbralizarse con datos propios, no con los del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es la organización NVIDIA; conviene verificar la integridad de los pesos frente al checkpoint upstream antes de desplegar.
- Requiere `custom_code` y un runtime con soporte NVFP4; no es portable a stacks que solo acepten GGUF o safetensors estándar sin ModelOpt.

## Enlaces

- Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Rerank-8B-Base-ModelOpt-W4A4-NVFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-rerank-8b/model-card/base-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-rerank-8b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3.5-rerank-8b/darkstar-nemotron-3.5-rerank-8b-base-modelopt-w4a4-nvfp4.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-rerank-8b/results/rerank-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/32
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Dataset de calibración: https://huggingface.co/datasets/microsoft/ms_marco
- Dataset de evaluación LMEB: https://huggingface.co/datasets/KaLM-Embedding/LMEB
