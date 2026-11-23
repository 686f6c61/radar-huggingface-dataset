# m-polignano/decision4rec-kev-9b-all-seed1

## Resumen

Decision4Rec Kev-9B (seed 1) es un adaptador LoRA de tipo decision model construido sobre el modelo base Qwen/Qwen3.5-9B-Base congelado. Lo desarrolla Marco Polignano y colaboradores en el marco del proyecto Decision4Rec, un framework de modelos de decision sobre grafos de conocimiento y grafos activos para sistemas de recomendacion multiagente. El modelo no genera texto libre: lee los 30 mejores candidatos producidos por un pool multiagente (con texto de item, declaraciones del grafo de conocimiento del escenario y los agentes que encontraron cada candidato) y devuelve una probabilidad por candidato en un unico forward pass, siguiendo el denominado protocolo System One.

El problema que resuelve es el reranking de candidatos en recomendacion secuencial: en lugar de recuperar items, reordena una lista corta ya recuperada asignando una probabilidad calibrada a cada opcion. Se entrena sobre 34.667 elecciones reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam, y se publica como semilla 1 de las tres semillas del lector principal de la version 2 del paper; la semilla 0 esta disponible en otro repositorio del mismo autor. La relevancia actual radica en que demuestra que un modelo de decision de 9B con LoRA rank-16 puede superar a referencias secuenciales como SASRecF+ en NDCG@10 en dominios dispersos, con ganancias de hasta +34,8%.

El repositorio pesa 0,2 GB (solo adaptadores y cabeza pointer, no los pesos completos del base) y se distribuye bajo licencia Apache-2.0. No se han publicado datos sobre idiomas soportados mas alla de la naturaleza de los catalogos de entrenamiento (productos y juegos en ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-9B-Base congelado) + adaptadores LoRA rank-16 en todas las capas lineales + cabeza pointer para scoring de candidatos |
| Parametros totales | 9B (modelo base); parametros entrenados: adaptadores LoRA rank-16 y cabeza pointer (no se especifica el numero exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-9B-Base; no se explicita en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible (entrenado sobre catalogos de productos y juegos en ingles) |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base mantiene su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3.5-9B-Base en revision 68c46c4b3498877f3ef123c856ecfde50c39f404 |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA sobre Qwen/Qwen3.5-9B-Base congelado. Se aplican adaptadores rank-16 sobre todas las capas lineales y se anade una cabeza pointer que produce una probabilidad por candidato en un unico forward pass. El punto de partida es el adaptador y cabeza pointer publicados en jaredpalmer/kev-9b. El modelo no genera texto: consume la representacion de los 30 mejores candidatos del pool (texto del item, declaraciones del grafo de conocimiento del escenario y agentes que encontraron cada candidato) y emite un vector de probabilidades sobre esos 30 candidatos.

El entrenamiento usa 34.667 elecciones reales de siguiente item de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam (se descartaron 480 registros mas largos), con el objetivo de maxima verosimilitud del item realmente elegido por el usuario y sin usar salidas de modelos comerciales. La receta es una epoca, learning rate 5e-5, schedule one-cycle, micro-batch 1 con acumulacion de 8 (8 registros por paso, 4.274 pasos), bf16, gradient checkpointing y semilla 1. Se entreno con el trainer Kev (kev.train, commit 84847f0) en una unica NVIDIA RTX 3090 durante aproximadamente 21 horas.

## Capacidades

- Reranking de candidatos: asigna una probabilidad a cada uno de los 30 mejores candidatos de un pool multiagente en un solo forward pass.
- Lectura de contexto estructurado: integra texto del item, declaraciones del grafo de conocimiento del escenario y metadatos de los agentes que propusieron cada candidato.
- Modelado de preferencias secuenciales: aprende la probabilidad del siguiente item a partir del historial de elecciones del usuario.
- Protocolo System One: respuesta directa tipo `choice` sin cadena de razonamiento explicita.
- Generalizacion a dominios no vistos: se reportan ganancias en escenarios no presentes en entrenamiento (CDs and Vinyl, Toys and Games, Software, Industrial & Scientific).
- No soporta tool calling, function calling, agentes multi-step, vision, audio ni generacion de texto libre (segun la informacion disponible).

## Casos de uso

- Reranking en produccion de recomendadores secuenciales: dado un pool de 30 candidatos generado por un sistema multiagente o un retriever, el modelo devuelve probabilidades calibradas que se usan para reordenar la lista final; es adecuado porque su coste es un unico forward pass sobre 30 candidatos.
- Mejora de sistemas tipo SASRec: se puede usar como etapa de reranking sobre las salidas de SASRecF+, con ganancias medidas de +27,2% en Video Games, +34,8% en Musical Instruments y +6,0% en Steam en NDCG@10.
- Arranque en frio en dominios nuevos: al generalizar a escenarios no vistos en entrenamiento (+49,2% en CDs and Vinyl, +50,6% en Toys and Games, +6,1% en Software frente a la mejor referencia), sirve para desplegar recomendadores en catalogos sin reentrenar el lector.
- Integracion con grafos de conocimiento: el modelo consume declaraciones del grafo del escenario, por lo que encaja en pipelines que enriquecen candidatos con atributos estructurados de producto.
- Analisis de la ley de evidencia: permite estudiar como la informacion anadida por el lector decae a medida que crece la evidencia sobre el target (pendiente negativa en dominios dispersos, plana o positiva en MovieLens-1M).
- Experimentacion academica reproducible: al publicarse tres semillas con la misma receta y datos, facilita la replicacion de resultados y el analisis de varianza entre semillas.
- Despliegue en infraestructura modesta: al ser un adaptador sobre un base de 9B, se puede servir con el comando `kev.serve` en una unica GPU, lo que abarata la evaluacion frente a alternativas de mayor tamano.

## Benchmarks y rendimiento

Ley de evidencia (pendiente de la informacion anadida sobre log10(1 + compras previas del target), en nats por decada, media de las tres semillas, test de permutacion agrupado):

| Dominio | Pendiente |
|---|---|
| Video Games | -0,074 |
| Musical Instr. | -0,051 |
| Steam | -0,075 |
| Industrial & Sci. | -0,139 |
| ML-1M | +0,020 |
| ML-1M enr. | +0,028 |
| Pooled | -0,049 (p = 0,0001) |

NDCG@10 en 10.000 usuarios reservados por dominio nunca usados en desarrollo (p de Holm corregida < 0,01 en todas las filas):

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instr. | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Sci. (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios no vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un adaptador sobre un base de 9B, la inferencia requiere cargar el modelo base completo (aproximadamente 18 GB en bf16, estimacion a partir del tamano de parametros, no confirmada en la informacion).
- GPU de entrenamiento: una NVIDIA RTX 3090, con unas 21 horas para una epoca sobre 34.667 registros.
- GPU recomendadas para inferencia: no disponibles en la informacion; por tamano del base, cabria esperar A100, H100 o RTX 4090/A6000 en bf16, pero no se confirma.
- Cabe en GPU consumer: si, segun el entrenamiento realizado en RTX 3090 (24 GB); para inferencia no se especifica.
- Opciones de despliegue: servidor propio del proyecto Kev (`python -m kev.serve --run m-polignano/decision4rec-kev-9b-all-seed1 --port 8009`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-9B seed 1 | 9B (base) + LoRA rank-16 | no disponible | Reranking de 30 candidatos (decision model) | Apache-2.0 (adaptador) | Hugging Face |
| Decision4Rec Kev-9B seed 0 | 9B (base) + LoRA rank-16 | no disponible | Reranking de 30 candidatos (decision model) | Apache-2.0 (adaptador) | Hugging Face |
| SASRecF+ | no disponible | no disponible | Recomendacion secuencial | no disponible | Referencia del paper |
| Kev-9B (jaredpalmer/kev-9b) | 9B (base) + LoRA | no disponible | Decision model (punto de partida) | no disponible | Hugging Face |

La comparacion cuantitativa disponible se limita a NDCG@10 frente a SASRecF+ en los dominios de la tabla de benchmarks; no se han publicado comparaciones con otros decision models de 9B en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre catalogos de productos y juegos en ingles; el rendimiento en otros idiomas no esta documentado.
- En dominios densos con historiales largos (MovieLens-1M) la ganancia es menor o nula, con pendientes de evidencia positivas (+0,020 y +0,028).
- Solo reordena candidatos: no recupera items; depende de que el pool de 30 candidatos contenga el item relevante.
- No genera texto, no soporta tool calling ni razonamiento multi-step; su uso esta restringido al protocolo `choice`.
- Riesgo de alucinacion no aplicable en el sentido clasico (no genera texto libre), pero si puede asignar probabilidades altas a candidatos irrelevantes si el contexto del grafo o los metadatos de los agentes son ruidosos.
- Licencia Apache-2.0 para adaptador y cabeza; el modelo base Qwen/Qwen3.5-9B-Base mantiene su propia licencia, que debe revisarse antes de uso comercial.
- Los datos de entrenamiento provienen de datasets de investigacion publicos que no se redistribuyen en el repositorio.
- La model card no documenta sesgos especificos ni evaluaciones de equidad.
- El repositorio no incluye los pesos del modelo base; es necesario descargarlo por separado (revision concreta 68c46c4b3498877f3ef123c856ecfde50c39f404).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed1
- Semilla 0: https://huggingface.co/m-polignano/decision4rec-kev-9b-all
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio del proyecto Decision4Rec: https://github.com/marcopoli/decision4rec
- Trainer Kev: https://github.com/jaredpalmer/kev
- Cita del paper: Polignano, M., Mehta, H. D., Lops, P., De Luca, E. W., Semeraro, G. (2026). Decision4Rec: A Jev-Inspired Framework of Decision Models on Knowledge and Active Graphs for Multi-Agent Recommender Systems.
