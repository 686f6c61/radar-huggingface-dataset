# m-polignano/decision4rec-kev-0.8b

## Resumen

Decision4Rec Kev-0.8B es un adaptador LoRA de tipo "decision model" construido sobre el modelo base Qwen/Qwen3.5-0.8B-Base congelado, desarrollado por m-polignano (Marco Polignano y colaboradores) en el marco del proyecto Decision4Rec. Su funcion no es generar texto libre, sino actuar como lector de un pool de candidatos: recibe los 30 mejores candidatos generados por un sistema multi-agente de recomendacion, junto con el texto de cada item, las declaraciones del grafo de conocimiento del escenario y las lineas "found by" que indican que agente descubrio cada candidato, y devuelve una probabilidad por candidato en un unico forward pass (protocolo "System One", pregunta de tipo `choice`).

El modelo resuelve el problema del reranking final en sistemas de recomendacion secuencial: dado un historial de usuario y un conjunto acotado de candidatos, estima la probabilidad de que cada uno sea la siguiente eleccion real. Se entrena sobre 34.667 elecciones reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam, con el objetivo de maximizar la verosimilitud del item realmente elegido, sin usar salidas de modelos comerciales.

Es relevante porque forma parte de la arquitectura completa Decision4Rec-Full y porque su model card documenta una "ley de evidencia": la informacion que aporta el modelo decae a medida que crece la evidencia previa sobre el item objetivo, con una pendiente agregada de -0,020 nats por decada de compras previas (p = 0,0012). El adaptador es pequeno (repo de 0,1 GB), esta liberado bajo Apache-2.0 y esta pensado para servirse mediante el framework Kev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B-Base congelado) con adaptadores LoRA rank-16 en todas las capas lineales y una cabeza pointer |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA y la cabeza pointer se suman sobre el base congelado (numero exacto de parametros entrenables no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estados de hasta 1.792 tokens durante el entrenamiento; contexto maximo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre catalogos de productos y juegos en ingles) |
| Licencia | Apache-2.0 para el adaptador y la cabeza; el modelo base conserva su propia licencia (Qwen3.5) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen/Qwen3.5-0.8B-Base (revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`), que permanece congelado. Sobre el base se anaden adaptadores LoRA de rango 16 en todas las capas lineales y una cabeza pointer que produce una probabilidad por cada uno de los 30 candidatos del pool. El punto de partida es el adaptador y la cabeza pointer del modelo publicado `jaredpalmer/kev-0.8b`.

El entrenamiento usa 34.667 elecciones reales de siguientes items de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam (se descartaron 480 registros mas largos). El objetivo es la verosimilitud del item que el usuario realmente eligio despues, sin emplear salidas de ningun modelo comercial. La receta es de una epoca, learning rate 1e-4, schedule one-cycle, micro-batch de 8 (8 registros por paso), autocast bf16, gradient checkpointing y estados de hasta 1.792 tokens. El entrenamiento se realizo con `kev.train` del repositorio Kev (commit 84847f0).

La innovacion principal no es arquitectonica sino de formulacion: el modelo integra en una sola pasada la evidencia del grafo de conocimiento y la procedencia de cada candidato (que agente lo encontro) para emitir una probabilidad calibrada, en lugar de generar una respuesta autoregresiva. La model card documenta ademas la "ley de evidencia", que cuantifica como decae la informacion anadida por el modelo a medida que aumenta la evidencia previa sobre el item objetivo.

## Capacidades

- Reranking de candidatos: recibe hasta 30 candidatos y devuelve una probabilidad por candidato en un unico forward pass.
- Lectura de contexto estructurado: procesa el historial del usuario, el texto de los items, las declaraciones del grafo de conocimiento del escenario y las lineas "found by" de cada candidato.
- Integracion multi-agente: incorpora la procedencia de cada candidato (que agente lo encontro) como senal para la decision.
- Clasificacion/decision: el pipeline declarado es `text-classification`, orientado a la pregunta `choice` del protocolo System One.
- Generalizacion a dominios no vistos: la model card reporta ganancias en Industrial & Scientific y en escenarios (CDs and Vinyl, Toys and Games, Software) no vistos en entrenamiento, aunque esas cifras corresponden a Decision4Rec-Full con el lector de 9B.
- No genera texto libre ni soporta tool calling, agentes generativos o razonamiento multi-paso de forma nativa; su funcion es exclusivamente de decision sobre un pool dado.
- Capacidades multilingues: no documentadas; el entrenamiento usa catalogos en ingles.

## Casos de uso

- Reranking final en recomendadores secuenciales de e-commerce: el modelo recibe el pool de 30 candidatos generado por el sistema multi-agente y devuelve probabilidades que se fusionan con el ranker residual para producir el ranking final; es adecuado porque su objetivo de entrenamiento es exactamente la probabilidad del siguiente item elegido.
- Sistemas de recomendacion multi-agente: al incorporar las lineas "found by", permite que la decision final pondere que agente aporto cada candidato, lo que resulta util cuando distintos agentes cubren senales heterogeneas (popularidad, contenido, grafo de conocimiento).
- Recomendacion en dominios con historiales dispersos: la ley de evidencia muestra que el modelo aporta mas informacion cuando hay poca evidencia previa sobre el item (pendiente negativa de -0,020 nats por decada), por lo que encaja en catalogos largos con usuarios de historial corto.
- Prototipado de investigacion en recomendacion: al ser un adaptador pequeno (0,1 GB) servido con Kev, permite reproducir el bloque de 0,8B de la tabla de tamanos del paper con coste de infraestructura bajo.
- Evaluacion comparativa de lectores de pool: sirve como variante de 0,8B frente al lector de 9B de Decision4Rec-Full para estudiar el compromiso entre coste y ganancia de NDCG@10.
- Despliegue en entornos con GPU modesta: el tamano del base (0,8B) y el adaptador LoRA permiten servirlo en una unica GPU consumer, lo que facilita integraciones en pipelines de recomendacion con presupuesto limitado.
- Integracion en pipelines de Decision4Rec: mediante `kev.serve` en un puerto local y apuntando Decision4Rec al servidor con un backend configurado (`configs/backends/kev-0.8b-rtm.yaml`), se puede incorporar el modelo a un flujo de recomendacion existente sin reentrenar el base.

## Benchmarks y rendimiento

La model card no publica benchmarks clasicos (MMLU, HumanEval, GSM8K). Publica metricas de recomendacion. La informacion anadida por este modelo al pool, en nats por eleccion, sobre 2.000 usuarios de test de desarrollo por escenario con objetivo entre los 30 candidatos:

| Escenario | Informacion anadida (nats/eleccion) |
|---|---|
| Video Games | 0,049 |
| Musical Instruments | 0,013 |
| Steam | 0,023 |
| Industrial & Scientific | 0,041 |
| ML-1M | 0,000 |
| ML-1M enr. | 0,006 |
| Media | 0,022 |

Pendiente de la informacion anadida sobre log10(1 + compras previas del objetivo), en nats por decada (test de permutacion agrupado):

| Escenario | Pendiente |
|---|---|
| Video Games | -0,015 |
| Musical Instruments | -0,008 |
| Steam | -0,029 |
| Industrial & Scientific | -0,073 |
| ML-1M | -0,001 |
| ML-1M enr. | +0,007 |
| Agrupado | -0,020 (p = 0,0012) |

Resultados de desarrollo de la version 1 (NDCG@10 de Decision4Rec-Full sobre 2.000 usuarios de test de desarrollo por dominio, ranking sobre catalogo completo, leave-one-out):

| Sistema | Video Games | Musical Instr. | Steam | Industrial & Sci. |
|---|---|---|---|---|
| Mejor baseline entrenado | 0,0622 | 0,0370 | 0,0790 | 0,0310 |
| Pool y ranker residual, sin decision model | 0,0730 | 0,0468 | 0,0786 | 0,0386 |
| Con este modelo (fusionado) | 0,0741 | 0,0467 | 0,0802 | 0,0401 |

Confirmacion en usuarios reservados de la version 2 (10.000 usuarios por dominio, NDCG@10, Holm-corrected p < 0,01 en todas las filas). Nota: estas cifras corresponden a Decision4Rec-Full con el lector de 9B, no a este adaptador de 0,8B:

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instr. | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Sci. (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios no vistos en entrenamiento las ganancias sobre el mejor baseline son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software), de nuevo para Decision4Rec-Full con el lector de 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del base (0,8B) y el adaptador LoRA, la inferencia en bf16 requiere del orden de 2 GB de pesos, mas overhead de activaciones y cache KV para estados de hasta 1.792 tokens.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, cabe en GPUs consumer tipo RTX 4090, RTX 3090 o inferiores con suficiente VRAM; tambien en A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: si, dado el tamano de 0,8B del base; el modelo concreto de GPU no esta documentado.
- Opciones de despliegue: el autor indica servirlo con Kev (`uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-0.8b --port 8009`) y apuntar Decision4Rec al servidor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El modelo realiza un unico forward pass por peticion (protocolo System One), lo que en principio reduce la latencia frente a esquemas autoregresivos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-0.8B (este) | 0,8B base + LoRA + cabeza pointer | estados hasta 1.792 tokens en entrenamiento | Lector de pool de 30 candidatos, una probabilidad por candidato | Apache-2.0 (adaptador); base Qwen3.5 | Publico en HF (preview privada segun model card) |
| jaredpalmer/kev-0.8b | 0,8B | no disponible | Adaptador y cabeza pointer de partida de este modelo | no disponible | Publico en HF |
| Decision4Rec-Full con lector de 9B | 9B (lector) | no disponible | Misma arquitectura, lector mayor entrenado con los 34.667 registros | no disponible | Referenciado en el paper, no como artefacto separado en la informacion |
| SASRecF+ | no disponible | no disponible | Recomendador secuencial de referencia | no disponible | Baseline de comparacion en el paper |

No se dispone de datos suficientes para comparar con otros modelos de decision o reranking de la misma categoria fuera del ecosistema Decision4Rec.

## Limitaciones y advertencias

- Entrenado sobre catalogos de productos y juegos en ingles; el rendimiento en otros idiomas no esta documentado.
- En dominios densos con historiales largos (MovieLens-1M) la ganancia es practicamente nula (0,000 nats por eleccion), coherente con la ley de evidencia.
- Solo rerankea los candidatos que recibe; no recupera items del catalogo.
- Los resultados de desarrollo de la version 1 proceden de los usuarios usados para disenar el sistema; la confirmacion en usuarios reservados figura en la seccion de la version 2 y corresponde al lector de 9B, no a este adaptador de 0,8B.
- El modelo espera las peticiones construidas por Decision4Rec (estado con historial y declaraciones; una pregunta `choice` con candidatos y lineas "found by"); otras peticiones funcionan pero no formaron parte del entrenamiento.
- La model card indica "Private preview. This model will be made public with the paper", por lo que la disponibilidad publica estable no esta garantizada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Sesgos: no documentados; al entrenarse sobre datos de comportamiento de usuarios de Amazon y Steam, puede heredar sesgos de popularidad y de sesgo de exposicion de esos catalogos.
- Restricciones de licencia: el adaptador y la cabeza son Apache-2.0, pero el modelo base conserva la licencia Qwen3.5, que debe respetarse en uso comercial. Los datos de entrenamiento provienen de datasets de investigacion publicos que no se redistribuyen con el modelo.
- No se documentan tipos de cuantizacion soportados ni cifras de latencia o throughput para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio Decision4Rec: https://github.com/marcopoli/decision4rec
- Repositorio y trainer Kev: https://github.com/jaredpalmer/kev
- Cita del paper: Polignano, M., Mehta, H. D., Lops, P., De Luca, E. W., Semeraro, G. (2026). "Decision4Rec: A Jev-Inspired Framework of Decision Models on Knowledge and Active Graphs for Multi-Agent Recommender Systems".
