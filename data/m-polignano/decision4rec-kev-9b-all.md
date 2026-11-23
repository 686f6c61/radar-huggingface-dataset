# m-polignano/decision4rec-kev-9b-all

## Resumen

Decision4Rec Kev-9B es un adaptador LoRA de tipo *decision model* construido sobre el modelo base Qwen/Qwen3.5-9B-Base (congelado) y entrenado por Marco Polignano y colaboradores en el marco del proyecto Decision4Rec. No es un modelo generativo al uso: actúa como *reader* o reranker dentro de un sistema de recomendación multi-agente. Recibe los 30 mejores candidatos de un pool (con el texto del ítem, afirmaciones del grafo de conocimiento del escenario y los agentes que propusieron cada candidato) y devuelve, en un único forward pass, una probabilidad por candidato (protocolo "System One", pregunta de tipo `choice`).

El modelo se distribuye como adaptadores LoRA de rango 16 sobre todas las capas lineales más una *pointer head*, partiendo del adaptador publicado `jaredpalmer/kev-9b`. Se ha entrenado sobre 34.667 elecciones reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam, con el objetivo de maximizar la verosimilitud del ítem que el usuario eligió realmente a continuación.

Su relevancia actual reside en que forma parte de la versión 2 del paper Decision4Rec-Full y demuestra empíricamente la denominada "ley de la evidencia": la información que aporta el reader decae a medida que crece la evidencia previa sobre el ítem objetivo. Este es el *seed* 0 de tres semillas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base congelado) + adaptadores LoRA + pointer head |
| Parametros totales | 9B en el modelo base; adaptadores LoRA rango 16 (tamano del repo: 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | no disponible (entrenado sobre catálogos de producto en inglés) |
| Licencia | Apache-2.0 (adaptador y head); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen3.5-9B-Base, que permanece congelado durante todo el entrenamiento. Sobre él se aplican adaptadores LoRA de rango 16 en todas las capas lineales, más una *pointer head* que transforma las representaciones de los candidatos en una distribución de probabilidad sobre los 30 ítems del pool. La entrada combina el texto de cada candidato, las afirmaciones del grafo de conocimiento del escenario y la identidad de los agentes que propusieron cada candidato; la salida es una probabilidad por candidato en un solo forward pass.

El entrenamiento se realizó sobre 34.667 registros reales (se descartaron 480 registros más largos), con una época, learning rate 5e-5, esquema one-cycle, micro-batch 1 con acumulación de 8 (8 registros por paso, 4.274 pasos), precisión bf16 y gradient checkpointing. Se usó el trainer `kev.train` (commit 84847f0) sobre una única NVIDIA RTX 3090 durante aproximadamente 21 horas. La función objetivo es la verosimilitud del ítem realmente elegido; no se emplearon salidas de ningún modelo comercial. La innovación técnica principal es el propio protocolo de decisión: un reranker que integra señales de múltiples agentes y conocimiento estructurado en una única pasada, sin generación autoregresiva.

## Capacidades

- Clasificación/ranking de candidatos: asigna una probabilidad a cada uno de los 30 ítems del pool en un solo forward pass.
- Integración de conocimiento estructurado: incorpora afirmaciones del grafo de conocimiento del escenario en la decisión.
- Agregación multi-agente: utiliza la identidad de los agentes que propusieron cada candidato como señal adicional.
- Reranking de recomendaciones secuenciales: pensado para recolocar los candidatos de un sistema de recuperación previo.
- Modelado de elección secuencial: aprende de la secuencia de compras/consumo del usuario.
- No realiza generación de texto libre ni tool calling: su salida es una distribución de probabilidad sobre candidatos.
- Capacidades multilingües: no disponible (entrenado sobre catálogos en inglés).

## Casos de uso

- Reranking en sistemas de recomendación de e-commerce: dado un pool de 30 candidatos recuperados por un motor previo, el modelo reordena según la probabilidad de elección real del usuario, aprovechando el contexto de compras previas y el grafo de conocimiento del catálogo.
- Recomendación secuencial en videojuegos y música: entrenado específicamente sobre Amazon Video Games, Amazon Musical Instruments y Steam, es directamente aplicable a dominios de catálogo disperso con historiales cortos.
- Sistemas de recomendación multi-agente: actúa como lector final que agrega las propuestas de varios agentes recuperadores, usando la identidad del agente como feature de decisión.
- Transferencia a dominios no vistos: los resultados reportados muestran ganancias sobre la mejor referencia en escenarios nunca vistos en entrenamiento (CDs and Vinyl +49,2%, Toys and Games +50,6%, Software +6,1%), lo que permite usarlo como reranker en catálogos nuevos con evidencia escasa.
- Investigación en teoría de la decisión aplicada a recomendación: sirve para reproducir la "ley de la evidencia" y estudiar cómo decae la información añadida por un reader a medida que crece el historial del ítem objetivo.
- Evaluación comparativa de recuperadores: al aislar la contribución del reader, permite medir la calidad de distintos pools de candidatos manteniendo fijo el decisor.
- Integración en pipelines de investigación reproducible: el servicio `kev.serve` permite levantar el modelo en un puerto local para experimentación.

## Benchmarks y rendimiento

Información añadida por el modelo al pool, en nats por elección, sobre 2.000 usuarios de test de desarrollo por escenario (bloque "All 34,667 records"):

| Escenario | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Media |
|---|---|---|---|---|---|---|---|
| Este modelo | 0,111 | 0,081 | 0,054 | 0,099 | 0,017 | 0,025 | 0,064 |

Pendiente de la información añadida sobre log10(1 + compras previas del objetivo), en nats por cada orden de magnitud (media de las tres semillas, test de permutación agrupado):

| | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Agrupado |
|---|---|---|---|---|---|---|---|
| Kev-9B (media 3 semillas) | -0,074 | -0,051 | -0,075 | -0,139 | +0,020 | +0,028 | -0,049 (p = 0,0001) |

Decision4Rec-Full frente a la mejor referencia, NDCG@10 sobre 10.000 usuarios reservados por dominio (p de Holm corregida < 0,01 en todas las filas):

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instr. | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Sci. (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios nunca vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

## Requisitos de hardware

- Entrenamiento: una única NVIDIA RTX 3090 (24 GB) durante unas 21 horas con bf16 y gradient checkpointing.
- Inferencia: el backbone es de 9B parámetros; en bf16 requiere aproximadamente 18 GB de VRAM solo para pesos, más overhead de activaciones y del pool de 30 candidatos. La cuantización a 8 bits o 4 bits (si el base la soporta) permitiría ejecución en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y en algunas de 16 GB con cuantización agresiva.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción con concurrencia; RTX 3090/4090 para experimentación individual.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con bf16 o cuantización; en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: el autor proporciona `kev.serve` (`uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-9b-all --port 8009`). Al ser un adaptador PEFT sobre Qwen, también puede cargarse con la librería `peft` estándar sobre el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-9B (este) | 9B base + LoRA r16 | no disponible | Reranking/decision sobre 30 candidatos | Apache-2.0 (adaptador) | Hugging Face |
| `jaredpalmer/kev-9b` | 9B base + LoRA | no disponible | Decision model (punto de partida) | no disponible | Hugging Face |
| `decision4rec-kev-9b-all-seed1` | 9B base + LoRA r16 | no disponible | Idéntica, semilla 1 | Apache-2.0 | Hugging Face |
| `decision4rec-kev-9b-all-seed2` | 9B base + LoRA r16 | no disponible | Idéntica, semilla 2 | Apache-2.0 | Hugging Face |
| SASRecF+ | no disponible | no disponible | Recomendación secuencial | no disponible | Referencia del paper |

Las alternativas directas son las otras dos semillas del mismo modelo y el adaptador original de Kev; SASRecF+ se incluye como referencia de rendimiento del paper, no como modelo comparable en arquitectura.

## Limitaciones y advertencias

- Entrenado sobre catálogos de producto y videojuegos en inglés; el rendimiento en otros idiomas no está documentado.
- En dominios densos con historiales largos (MovieLens-1M) la ganancia es menor e incluso la pendiente de información añadida se vuelve positiva o plana.
- Solo rerankea candidatos: no recupera ítems. Requiere un pool previo de 30 candidatos generado por otro sistema.
- El modelo base Qwen3.5-9B-Base conserva su propia licencia, distinta de la Apache-2.0 del adaptador; verificar antes de uso comercial.
- Los datos de entrenamiento provienen de datasets públicos de investigación que no se redistribuyen; posibles sesgos de los catálogos originales (Amazon, Steam) no analizados en la model card.
- Riesgo de sobreajuste a los tres dominios de entrenamiento; las ganancias en dominios no vistos varían mucho (+6,1% a +50,6%).
- No se documentan evaluaciones de robustez, calibración de probabilidades ni comportamiento ante entradas malformadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-9b-all
- Semilla 1: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed1
- Semilla 2: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio Decision4Rec: https://github.com/marcopoli/decision4rec
- Repositorio Kev (trainer): https://github.com/jaredpalmer/kev
