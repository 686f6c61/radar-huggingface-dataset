# RyanFoxW/cs4504-qwen35-movielens-rerank

## Resumen

`cs4504-qwen35-movielens-rerank` es una colección de tres adaptadores LoRA de reordenación (reranking) entrenados sobre el modelo base `Qwen/Qwen3.5-0.8B` para la tarea de reordenar el Top-10 generado por un recomendador secuencial SASRec sobre el conjunto de datos MovieLens-1M. Lo desarrolla el usuario RyanFoxW en el contexto de un curso (CS4504) y se publica con licencia Apache 2.0. El modelo no es un recomendador autónomo: actúa como segunda etapa de un pipeline de recomendación, recibiendo los 10 candidatos de SASRec y produciendo un orden refinado.

La relevancia es acotada pero ilustrativa: demuestra cómo un LLM pequeño (0.8B parámetros) puede emplearse como reranker de candidatos en sistemas de recomendación, con tres variantes de entrenamiento (SFT, DPO y GRPO) que comparten la misma tasa de acierto en HR@10 pero difieren ligeramente en NDCG@10. El repositorio pesa 0,1 GB y contiene únicamente los pesos de los adaptadores, no el modelo base.

Las tres variantes se entrenaron durante 712 pasos cada una. DPO y GRPO parten de la misma SFT; GRPO no continúa desde DPO. El formato de los adaptadores es propio del repositorio del curso (`adapter.pt` y `adapter.json`), no PEFT, lo que condiciona su integración en herramientas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8, alpha 16) sobre transformer decoder `Qwen/Qwen3.5-0.8B` |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh |
| Licencia | apache-2.0 |
| Formato de pesos | `adapter.pt` + `adapter.json` (formato propio del repo CS4504Recommender, no PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder de 0,8 mil millones de parámetros. Sobre él se aplican tres adaptadores LoRA independientes con rank 8 y alpha 16, entrenados para la tarea de reranking de 10 candidatos producidos por SASRec en MovieLens-1M con partición temporal.

Los tres adaptadores se entrenaron durante 712 pasos: `sft/` con supervisión directa, `dpo/` continuando desde SFT con optimización de preferencias, y `grpo/` desde la misma SFT con GRPO (no desde DPO). No se detalla la composición exacta del dataset de entrenamiento más allá de MovieLens-1M ni el número de tokens consumidos. La innovación técnica principal es el uso de un LLM pequeño como reranker de segunda etapa con tres estrategias de alineación comparables sobre el mismo presupuesto de pasos.

## Capacidades

- Reordenación de un Top-10 de candidatos generado por SASRec sobre MovieLens-1M.
- Tres variantes de comportamiento según la estrategia de entrenamiento (SFT, DPO, GRPO).
- Procesamiento de entradas en chino (`zh` es el único idioma declarado).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documenta generación de texto general, código ni matemáticas como capacidades objetivo.

## Casos de uso

- Reranking de segunda etapa en un sistema de recomendación de películas: el adaptador recibe los 10 candidatos de SASRec y devuelve un orden refinado; encaja en pipelines existentes que ya dispongan de un recuperador y necesiten una capa de reordenación barata (0,8B de base).
- Comparación de estrategias de alineación en investigación: las tres variantes (SFT, DPO, GRPO) con idéntico presupuesto de 712 pasos permiten estudiar el efecto de cada método sobre NDCG@10 en una misma tarea.
- Prototipado académico de sistemas de recomendación: útil en cursos y trabajos que reproduzcan el pipeline CS4504Recommender con MovieLens-1M.
- Evaluación de LLMs pequeños como rerankers: sirve para medir si un modelo de 0,8B aporta ganancia sobre el orden original de SASRec en NDCG@10.
- Baseline para experimentos de LoRA en recomendación: punto de partida para probar ranks, alphas o bases distintas manteniendo la misma partición temporal.
- Integración en demos educativas de recomendación: el tamaño reducido del repo (0,1 GB) y del modelo base facilita el despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test de MovieLens-1M (partición temporal):

| Variante | Entrenamiento | Test HR@10 | Test NDCG@10 |
|---|---|---|---|
| `sft/` | SFT, 712 pasos | 0.12466887 | 0.06362731 |
| `dpo/` | DPO desde SFT, 712 pasos | 0.12466887 | 0.06457566 |
| `grpo/` | GRPO desde SFT, 712 pasos | 0.12466887 | 0.06506303 |

HR@10 coincide con SASRec en las tres variantes porque el reranking no altera el conjunto de 10 candidatos, solo su orden. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base es de 0,8B, por lo que en FP16 rondaría ~1,6 GB solo para pesos, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño del base (0,8B) sería previsible en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. La carga debe hacerse mediante `ranking/lora.py` del repositorio CS4504Recommender, dado que el formato `adapter.pt`/`adapter.json` no es PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| cs4504-qwen35-movielens-rerank (este) | LoRA sobre 0.8B | no disponible | Reranking MovieLens-1M | apache-2.0 | `adapter.pt` (no PEFT) |
| SASRec (recuperador evaluado) | no disponible | no disponible | Recomendación secuencial | no disponible | no disponible |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible | LLM general | no disponible | safetensors (presumible) |

No se dispone de datos de otros rerankers LoRA comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es específico de MovieLens-1M y de la partición temporal concreta; no se ha validado en otros dominios ni datasets.
- Solo declara idioma chino (`zh`); no se garantiza comportamiento en castellano ni en otros idiomas.
- El formato de adaptadores (`adapter.pt` + `adapter.json`) es propio del repositorio del curso y no es compatible con PEFT, lo que limita su uso con herramientas estándar.
- HR@10 no mejora respecto a SASRec por diseño (el reranking no cambia el conjunto de candidatos); la única ganancia medida es en NDCG@10 y es pequeña (0.0636 a 0.0651).
- No se documentan sesgos, tasas de alucinación ni evaluación de robustez.
- Aunque la licencia es Apache 2.0, el uso comercial requeriría verificar también la licencia del modelo base `Qwen/Qwen3.5-0.8B`.
- Sin datos de benchmarks generales ni de rendimiento fuera de la tarea de reranking.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/RyanFoxW/cs4504-qwen35-movielens-rerank
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del curso (carga de adaptadores): https://github.com/RyanStarFox/CS4504Recommender
