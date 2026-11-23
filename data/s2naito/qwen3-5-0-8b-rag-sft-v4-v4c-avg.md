# s2naito/qwen3.5-0.8b-rag-sft-v4-v4c-avg

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4-v4c-avg` es un modelo de lenguaje de 873 millones de parametros derivado de `Qwen/Qwen3.5-0.8B` mediante ajuste fino supervisado (SFT) con LoRA y posterior fusion de pesos. Lo desarrolla el usuario s2naito y esta especializado en una tarea muy concreta: respuesta corta a preguntas (short-answer QA) sobre recuperacion aumentada (RAG) en articulos de Wikipedia en japones.

El modelo no es un ajuste fino unico, sino una media aritmetica elemento a elemento (peso 0.5 / 0.5) de dos variantes SFT: "v4" y "v4 Plan C". Ambas se entrenaron con la misma semilla (42) y los mismos hiperparametros sobre el modelo base; la variante Plan C repite ejemplos de entrenamiento cuyo fragmento oro (gold chunk) cae en las posiciones de contexto 2 a 5, seleccionados de forma mecanica. El resultado es un unico checkpoint que combina ambos comportamientos sin coste adicional de inferencia.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo reproducible de ajuste fino sobre un modelo pequeno (sub-1000M) para una tarea de RAG en un idioma no ingles, con licencia Apache 2.0 y pesos en safetensors. No esta pensado como modelo de proposito general, sino como componente de un pipeline de recuperacion y respuesta con contexto limitado (`CONTEXT_TOP_K=5`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de la familia Qwen3.5. Sobre esa base se aplicaron dos ajustes finos con LoRA configurado en `target_modules="all-linear"`, es decir, adaptadores de bajo rango en todas las capas lineales. Ambos entrenamientos usaron la misma semilla (42) y los mismos ajustes, y los adaptadores se fusionaron en los pesos base antes de promediar.

La media final es elemento a elemento con peso 0.50 para cada componente: `s2naito/qwen3.5-0.8b-rag-sft-v4` (revision `7066ecd8c3095032a744655b2d4d8cc1b9cd0a8e`) y `s2naito/qwen3.5-0.8b-rag-sft-v4c` (revision `8c1c356518f9c92e24f7cc90f5197c5bc0779bf0`). Los pesos identicos en ambos modelos (los no afectados por LoRA, iguales a los del modelo base) se mantienen sin cambios. La diferencia entre ambas variantes es que Plan C repite hasta 3 veces por pregunta los ejemplos cuyo fragmento oro aparece en las posiciones de contexto 2 a 5, con el objetivo de reforzar el uso de evidencia en posiciones no iniciales del contexto.

Los datos de entrenamiento combinan JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa distribuidos (`bumbuboon/llm-course-final-2026`), todos ellos bajo licencia CC BY-SA 4.0. Los fragmentos de Wikipedia se usaron como contextos de recuperacion seleccionados por un pipeline BM25 / embeddings / reranker / 2-hop, sin alteracion. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en japones, orientada a respuestas cortas y concisas.
- Respuesta a preguntas con contexto recuperado (RAG) sobre Wikipedia japonesa.
- Manejo de contextos con hasta 5 fragmentos (`CONTEXT_TOP_K=5`) procedentes de un pipeline de recuperacion con RRF de 4 vias, top-100, reranker Ruri, 2-hop basado en reglas y seleccion de articulo por LLM.
- Capacidad de aprovechar evidencia situada en posiciones intermedias del contexto (reforzada en la variante Plan C).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al japones segun la model card.

## Casos de uso

- Respuesta corta sobre Wikipedia japonesa en produccion: el modelo esta entrenado especificamente para recibir los 5 fragmentos devueltos por el pipeline de recuperacion descrito y emitir una respuesta breve. Es su escenario nativo y el unico documentado por el autor.
- Componente de un sistema RAG de dominio publico: dado su tamano (873M), puede desplegarse en CPU o GPU modesta como generador final de un pipeline de busqueda documental en japones.
- Evaluacion de pipelines de recuperacion: al estar ajustado sobre una configuracion concreta (RRF 4 vias, Ruri reranker, 2-hop, `rerank_title_tail`), sirve para medir el impacto de cambios en el recuperador manteniendo el generador fijo.
- Prototipado de asistentes de consulta factual en japones: util para demos internas donde se necesita un generador ligero que responda a partir de pasajes recuperados sin depender de APIs externas.
- Investigacion sobre fusion de modelos: el checkpoint documenta un caso reproducible de weight averaging entre dos LoRA fusionados con la misma semilla, util para estudiar el efecto de promediar variantes de SFT.
- Fine-tuning posterior como punto de partida: la licencia Apache 2.0 y el formato safetensors permiten reutilizarlo como base para tareas de QA extractiva en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2-3 GB.
- En cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas modernas.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers o un servidor compatible (vLLM, TGI) para cargarlo; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4-v4c-avg | 873M | no disponible | ja | Apache 2.0 | RAG QA japones (SFT + weight averaging) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingue | no disponible en la informacion | Modelo base de proposito general |
| s2naito/qwen3.5-0.8b-rag-sft-v4 | 873M | no disponible | ja | Apache 2.0 | Variante SFT individual (componente) |
| s2naito/qwen3.5-0.8b-rag-sft-v4c | 873M | no disponible | ja | Apache 2.0 | Variante SFT Plan C (componente) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del escenario de QA corta sobre Wikipedia japonesa con el pipeline de recuperacion descrito, su rendimiento puede degradarse de forma notable.
- Idioma limitado al japones; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinacion inherente a los modelos de ~0,8B, especialmente cuando el contexto recuperado no contiene la respuesta.
- El ajuste esta ligado a una configuracion concreta de recuperacion (`CONTEXT_TOP_K=5`, RRF 4 vias, Ruri reranker, 2-hop, `rerank_title_tail`); cambiar el recuperador puede invalidar parte del ajuste.
- Los datos de entrenamiento derivan de JEMHopQA, JSQuAD/JGLUE, NIILC QA y Wikipedia japonesa bajo CC BY-SA 4.0; aunque los pesos se publican como Apache 2.0, conviene revisar las obligaciones de atribucion de las fuentes de datos si se redistribuye el modelo en contextos sensibles.
- No se documentan sesgos especificos, pero al entrenarse sobre Wikipedia japonesa hereda los sesgos de cobertura y sesgo editorial de esa fuente.
- Sin datos publicados de benchmarks, contexto maximo ni latencia; no recomendable para produccion sin evaluacion previa en el dominio objetivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4-v4c-avg
- Componente SFT v4: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4
- Componente SFT v4 Plan C: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
