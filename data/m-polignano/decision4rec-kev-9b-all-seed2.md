# m-polignano/decision4rec-kev-9b-all-seed2

## Resumen

Decision4Rec Kev-9B (seed 2) es un adaptador LoRA de tipo decision model construido sobre el modelo base Qwen/Qwen3.5-9B-Base, desarrollado por m-polignano en el marco del proyecto Decision4Rec. No es un modelo generativo al uso: funciona como un lector de pool (pool reader) que recibe los 30 mejores candidatos de un sistema multi-agente de recomendacion, junto con el texto de cada item, las declaraciones del grafo de conocimiento del escenario y los agentes que encontraron cada candidato, y devuelve una probabilidad por candidato en un unico forward pass (protocolo System One, pregunta `choice`).

El modelo se entrena sobre 34.667 registros reales de siguientes elecciones de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam, con el objetivo de maximizar la verosimilitud del item que el usuario eligio realmente a continuacion. Forma parte de la version 2 del paper Decision4Rec, que estudia la "ley de la evidencia": la informacion que aporta el lector decae a medida que crece la evidencia disponible sobre el item objetivo.

Es relevante porque demuestra que un LLM con adaptadores de bajo rango y una cabeza pointer puede sustituir o complementar modelos secuenciales clasicos (SASRecF+) en tareas de reranking, con ganancias de hasta +34,8% en NDCG@10 en dominios dispersos. La seed 2 es una de las tres semillas del lector principal; cambia unicamente la semilla de entrenamiento respecto a la seed 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base congelado) + adaptadores LoRA rank-16 en todas las capas lineales + cabeza pointer |
| Parametros totales | 9B (modelo base); parametros entrenados del adaptador: no disponible en detalle |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (entrenado sobre catalogos de producto en ingles) |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (PEFT/LoRA); tamano del repo 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base congelado (revision `68c46c4b3498877f3ef123c856ecfde50c39f404`) y anade adaptadores LoRA de rango 16 sobre todas las capas lineales, mas una cabeza pointer que produce una probabilidad por candidato. El punto de partida es el adaptador y la cabeza pointer publicados en jaredpalmer/kev-9b. La inferencia se realiza en un unico forward pass sobre los 30 candidatos del pool.

El entrenamiento usa 34.667 registros reales de siguiente eleccion de Amazon Video Games, Amazon Musical Instruments y Steam (se descartaron 480 registros mas largos), con el objetivo de verosimilitud del item realmente elegido y sin usar salidas de ningun modelo comercial. La receta es una epoca, learning rate 5e-5, schedule one-cycle, micro-batch 1 con 8 acumulaciones (8 registros por paso, 4.274 pasos), bf16, gradient checkpointing y semilla 2. Se entreno con el trainer Kev (`kev.train`, commit 84847f0) en una NVIDIA RTX 3090 durante aproximadamente 21 horas.

## Capacidades

- Reranking de candidatos: asigna una probabilidad a cada uno de los 30 candidatos del pool en un solo forward pass.
- Lectura de contexto heterogeneo: integra texto del item, declaraciones del grafo de conocimiento del escenario y metadatos de los agentes que propusieron cada candidato.
- Clasificacion de eleccion (pipeline `text-classification`): la salida es una distribucion de probabilidad sobre candidatos, no texto libre.
- Modelado de preferencias secuenciales: aprende de la siguiente eleccion real del usuario en catalogos de producto y videojuegos.
- Generalizacion a escenarios no vistos: el paper reporta ganancias sobre dominios no presentes en entrenamiento (CDs y Vinyl, Toys and Games, Software, Industrial & Scientific).
- No soporta tool calling, agentes multi-paso, vision ni audio segun la informacion disponible.
- Capacidades multilingues: no disponibles; el entrenamiento se realizo sobre catalogos en ingles.

## Casos de uso

- Reranking en sistemas de recomendacion secuencial: dado un pool de 30 candidatos generado por un recuperador multi-agente, el modelo devuelve una probabilidad por candidato que se usa para reordenar la lista final; es adecuado porque su entrenamiento esta alineado exactamente con esa tarea.
- Complemento de modelos clasicos como SASRecF+: el paper muestra ganancias de NDCG@10 de +27,2% en Video Games, +34,8% en Musical Instruments y +6,0% en Steam frente a SASRecF+, por lo que puede actuar como segunda etapa sobre sus salidas.
- Sistemas de recomendacion con conocimiento estructurado: al incorporar declaraciones del grafo de conocimiento del escenario, es util en catalogos con atributos ricos (genero, plataforma, compatibilidades) donde el texto del item por si solo es insuficiente.
- Arranque en dominios nuevos con historial escaso: la "ley de la evidencia" indica que el lector aporta mas informacion cuando el target tiene pocas compras previas, lo que lo hace adecuado para usuarios nuevos o catalogos frios.
- Analisis de atribucion de agentes: como recibe que agente encontro cada candidato, permite estudiar que fuentes del pool contribuyen mas a la decision final en un sistema multi-agente.
- Investigacion en recomendacion: sirve como lector reproducible (tres semillas publicadas) para experimentos que comparen politicas de recuperacion o reranking bajo el mismo protocolo System One.
- Evaluacion offline de politicas: al devolver probabilidades calibradas sobre un pool fijo, puede integrarse en pipelines de evaluacion contrafactual de recomendadores.

## Benchmarks y rendimiento

Resultados de NDCG@10 en 10.000 usuarios reservados por dominio, nunca usados durante el desarrollo (p < 0,01 corregido por Holm en todas las filas), segun la version 2 del paper:

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instruments | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Scientific (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios nunca vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

Ley de la evidencia (pendiente de la informacion anadida sobre log10(1 + compras previas del target), en nats por decada, media de las tres semillas):

| | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Pooled |
|---|---|---|---|---|---|---|---|
| Kev-9B, media de tres semillas | -0,074 | -0,051 | -0,075 | -0,139 | +0,020 | +0,028 | -0,049 (p = 0,0001) |

## Requisitos de hardware

- El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3.5-9B-Base completo para inferencia.
- VRAM estimada: no disponible de forma explicita; para un transformer de 9B en bf16 se necesitan aproximadamente 18-20 GB solo para pesos, mas overhead de activaciones y contexto.
- GPU recomendadas: el autor entreno en una NVIDIA RTX 3090 (24 GB); para inferencia son adecuadas GPUs con 24 GB o mas (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en RTX 3090/4090 con 24 GB en bf16; en GPUs de 16 GB requeriria cuantizacion, no documentada por el autor.
- Despliegue: el autor proporciona un servidor propio via `kev.serve` (`uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-9b-all-seed2 --port 8009`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el entrenamiento de una epoca sobre 34.667 registros tardo unas 21 horas en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-9B seed 2 | 9B (base) + LoRA | no disponible | Reranking de 30 candidatos | Apache-2.0 (adaptador) | Hugging Face |
| Decision4Rec Kev-9B seed 0 | 9B (base) + LoRA | no disponible | Reranking de 30 candidatos | Apache-2.0 (adaptador) | Hugging Face |
| SASRecF+ | no disponible | no disponible | Recomendacion secuencial | no disponible | Referencia del paper |
| kev-9b (jaredpalmer) | 9B (base) + LoRA | no disponible | Punto de partida del adaptador | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado sobre catalogos de producto y videojuegos en ingles; el rendimiento en otros idiomas o dominios no esta documentado.
- En dominios densos con historiales largos (MovieLens-1M) la ganancia es menor o incluso la pendiente de la ley de la evidencia es positiva, lo que indica menor aportacion del lector.
- Solo rerankea los candidatos que recibe: no realiza recuperacion ni genera recomendaciones por si mismo.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos de Amazon y Steam puede heredar sesgos de popularidad y de catalogo de esas plataformas.
- Restricciones de licencia: el adaptador y la cabeza son Apache-2.0, pero el modelo base Qwen3.5-9B-Base conserva su propia licencia, que debe verificarse para uso comercial.
- Los datos de entrenamiento provienen de datasets de investigacion publicos que no se redistribuyen con el modelo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente fuera del paper.
- Requiere el ecosistema Kev para el servidor de inferencia documentado; la integracion con stacks estandar (vLLM, TGI) no esta soportada de forma oficial.

## Enlaces

- Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio Decision4Rec: https://github.com/marcopoli/decision4rec
- Trainer Kev: https://github.com/jaredpalmer/kev
- Seed 0 del lector principal: https://huggingface.co/m-polignano/decision4rec-kev-9b-all
