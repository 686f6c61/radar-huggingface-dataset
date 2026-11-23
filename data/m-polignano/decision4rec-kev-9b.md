# m-polignano/decision4rec-kev-9b

## Resumen

Decision4Rec Kev-9B (pool reader) es un adaptador LoRA de rango 16 con una cabeza de puntero (pointer head) entrenado sobre el modelo base Qwen/Qwen3.5-9B-Base congelado. Lo desarrolla Marco Polignano y colaboradores en el marco del proyecto Decision4Rec, un framework de modelos de decisión inspirado en Jev que combina grafos de conocimiento y grafos activos para sistemas de recomendación multiagente. El modelo no genera texto libre: es un clasificador de decisión que lee los 30 mejores candidatos de un pool multiagente (con texto de ítem, declaraciones del grafo de conocimiento del escenario y los agentes que encontraron cada candidato) y devuelve una probabilidad por candidato en un único forward pass, siguiendo el protocolo que el autor denomina System One (`choice` question).

Su relevancia es doble. Por un lado, demuestra que un lector de decisión de 9B parámetros puede aportar información complementaria medible (entre 0,013 y 0,057 nats por elección según dominio) sobre la lista de candidatos de un pool, y que al fusionarse con un ranker residual mejora el NDCG@10 en tareas de recomendación secuencial. Por otro, forma parte de un estudio de escalado que compara lectores de 0,8B, 4B, 9B y 27B entrenados sobre los mismos 8.000 registros, lo que lo convierte en una pieza útil para investigar el efecto del tamaño en modelos de decisión aplicados a recomendación.

El checkpoint aquí descrito corresponde al lector de 9B del bloque "Same 8,000 records" de la tabla de tamaños de la versión 2 del paper. Los lectores de 9B y 27B de los resultados principales de esa versión se entrenan sobre los 34.667 registros completos y se publican como checkpoints separados (`decision4rec-kev-9b-all` y sus variantes de semilla).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base congelado) con adaptadores LoRA de rango 16 en todas las capas lineales y cabeza de puntero (pointer head) para scoring de candidatos |
| Parametros totales | 9B (modelo base congelado); adaptadores LoRA y cabeza de puntero entrenables (el repo ocupa 0,2 GB, consistente con un adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre catálogos de productos y juegos en inglés) |
| Licencia | Apache-2.0 para el adaptador y la cabeza; el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen/Qwen3.5-9B-Base (revisión `68c46c4b3498877f3ef123c856ecfde50c39f404`), que permanece congelado durante el entrenamiento. Sobre él se entrenan adaptadores LoRA de rango 16 en todas las capas lineales más una cabeza de puntero que produce una probabilidad por cada uno de los 30 candidatos del pool en un solo forward pass. El punto de partida es el adaptador y la cabeza publicados como `jaredpalmer/kev-9b`. La entrada combina el texto de cada ítem candidato, declaraciones del grafo de conocimiento del escenario y la identidad de los agentes que propusieron cada candidato.

El entrenamiento usa 8.000 registros reales de elección siguiente (muestreo aleatorio fijo con semilla 2026) extraídos de los 34.667 registros empleados por los modelos de 0,8B y 4B, sobre los tres dominios Amazon Video Games, Amazon Musical Instruments y Steam. El objetivo es la verosimilitud del ítem que el usuario eligió realmente, sin usar salidas de ningún modelo comercial. La receta es una época, tasa de aprendizaje 5e-5, schedule one-cycle, micro-batch 2 con 4 pasos de acumulación (8 registros por paso), bf16 y gradient checkpointing, ejecutada con el trainer Kev (`kev.train`, commit 84847f0) en una única NVIDIA DGX Spark.

## Capacidades

- Scoring de decisión sobre un conjunto fijo de candidatos: devuelve una probabilidad por candidato en un único forward pass.
- Lectura conjunta de texto de ítem, declaraciones de grafo de conocimiento y metadatos de agentes proponentes.
- Reranking de las 30 mejores propuestas de un pool multiagente en recomendación secuencial.
- Integración como componente de un sistema mayor (Decision4Rec-Full) mediante fusión con un ranker residual.
- Aportación de información medible sobre la lista del pool: 0,054 nats por elección en Video Games, 0,044 en Musical Instruments, 0,031 en Steam, 0,057 en Industrial & Scientific, 0,013 en ML-1M y 0,016 en ML-1M enriquecido (media 0,036) sobre 2.000 usuarios de test de desarrollo por escenario.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales: es un clasificador de decisión restringido a ranking de candidatos.

## Casos de uso

- Reranking en pipelines de recomendación secuencial: dado un pool de 30 candidatos generado por varios agentes (recuperadores, filtros, modelos auxiliares), el modelo puntúa cada candidato y permite reordenarlos antes de la entrega final, mejorando el NDCG@10 del sistema completo.
- Investigación sobre escalado de modelos de decisión: al compartir los mismos 8.000 registros de entrenamiento que los lectores de 0,8B, 4B y 27B, permite aislar el efecto del tamaño del modelo base en la calidad del ranking.
- Evaluación de sistemas multiagente de recomendación: el modelo consume explícitamente la identidad de los agentes que propusieron cada candidato, lo que permite estudiar qué agentes aportan candidatos más útiles.
- Aprovechamiento de grafos de conocimiento en recomendación: al incorporar declaraciones del grafo del escenario, es adecuado para dominios con catálogos estructurados y relaciones entre ítems (videojuegos, instrumentos musicales, software de Steam).
- Transferencia a dominios no vistos: los resultados del sistema completo muestran ganancias sobre la mejor referencia en escenarios nunca vistos en entrenamiento (Industrial & Scientific +23,9%, CDs and Vinyl +49,2%, Toys and Games +50,6%), lo que respalda su uso como componente en dominios nuevos con estructura similar.
- Prototipado de investigación reproducible: el despliegue mediante `kev.serve` y la configuración `configs/backends/kev-9B-rtm8k.yaml` permiten reproducir experimentos del paper sobre una única GPU de clase workstation (DGX Spark).

## Benchmarks y rendimiento

Información añadida por este modelo a la lista del pool, en nats por elección, sobre 2.000 usuarios de test de desarrollo por escenario cuyo objetivo está entre los 30 candidatos:

| Escenario | Nats por elección |
|---|---|
| Video Games | 0,054 |
| Musical Instr. | 0,044 |
| Steam | 0,031 |
| Industrial & Sci. | 0,057 |
| ML-1M | 0,013 |
| ML-1M enr. | 0,016 |
| Media | 0,036 |

Resultados de desarrollo (versión 1) de Decision4Rec-Full, NDCG@10 sobre 2.000 usuarios de test de desarrollo por dominio (ranking sobre catálogo completo, leave-one-out). Industrial and Scientific no se vio en entrenamiento:

| Sistema | Video Games | Musical Instr. | Steam | Industrial & Sci. |
|---|---|---|---|---|
| Mejor baseline entrenado | 0,0622 | 0,0370 | 0,0790 | 0,0310 |
| Pool y ranker residual, sin modelo de decisión | 0,0730 | 0,0468 | 0,0786 | 0,0386 |
| Con este modelo (fusionado) | 0,0736 | 0,0485 | 0,0798 | 0,0406 |

Confirmación del framework sobre usuarios reservados (versión 2, con el lector de 9B entrenado sobre los 34.667 registros, no este checkpoint), NDCG@10 sobre 10.000 usuarios reservados por dominio nunca usados durante el desarrollo, con p < 0,01 corregido por Holm en todas las filas:

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instr. | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Sci. (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios nunca vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

## Requisitos de hardware

- El adaptador ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-9B-Base completo (9B parámetros).
- VRAM estimada para inferencia: no disponible de forma explícita; para un transformer de 9B en bf16 se sitúa en torno a 18-20 GB solo para pesos, más overhead de activaciones y del pool de 30 candidatos.
- GPU de referencia usada en entrenamiento: una NVIDIA DGX Spark.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de 24 GB o más para bf16, y GPUs consumer de 16-24 GB con cuantización, aunque el autor no publica cifras.
- Despliegue: servidor `kev.serve` del repositorio Kev (`uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-9b --port 8009`), integrado con el CLI `decision4rec` mediante backends como `configs/backends/kev-9B-rtm8k.yaml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decision4rec-kev-9b (este) | 9B base + LoRA r16 | no disponible | Lector de decisión sobre 30 candidatos, entrenado con 8.000 registros | Apache-2.0 (adaptador) | Hugging Face, 17 descargas |
| decision4rec-kev-9b-all | 9B base + LoRA r16 | no disponible | Lector de decisión entrenado con los 34.667 registros (resultados principales v2) | Apache-2.0 (adaptador) | Hugging Face |
| jaredpalmer/kev-9b | 9B base + LoRA r16 | no disponible | Adaptador y cabeza de partida del entrenamiento | no disponible | Hugging Face |
| Lectores de 0,8B y 4B del paper | 0,8B / 4B | no disponible | Mismos 8.000 registros, mismo protocolo | no disponible | no disponible |

La comparación relevante es interna al estudio de escalado: este checkpoint comparte datos y receta con los lectores de 0,8B, 4B y 27B, lo que permite comparar directamente el efecto del tamaño del modelo base. No se dispone de datos de benchmarks frente a modelos de recomendación genéricos más allá de las referencias SASRecF+ y los baselines entrenados incluidos en las tablas anteriores.

## Limitaciones y advertencias

- Entrenado sobre catálogos de productos y juegos en inglés; los dominios densos con historiales largos (MovieLens) ganan menos (0,013 y 0,016 nats por elección frente a 0,031-0,057 en los dominios de Amazon y Steam).
- Los resultados de desarrollo de la versión 1 provienen de los usuarios usados para diseñar el sistema; la confirmación sobre usuarios reservados corresponde a la versión 2 y a un checkpoint distinto entrenado con todos los registros.
- El modelo solo ordena los candidatos que recibe: no recupera ítems del catálogo. Su utilidad depende por completo de la calidad y cobertura del pool de 30 candidatos.
- No es un modelo generativo: no admite prompts de texto libre, tool calling ni razonamiento multi-paso, por lo que no debe emplearse fuera del protocolo `choice` para el que fue entrenado.
- El adaptador se distribuye bajo Apache-2.0, pero el modelo base Qwen3.5-9B-Base conserva su propia licencia, que debe verificarse antes de un uso comercial.
- Los datos de entrenamiento provienen de datasets públicos de investigación y no se redistribuyen con el checkpoint.
- No se publican datos sobre sesgos, tasas de alucinación (no aplica en sentido estricto al ser un clasificador), longitud de contexto ni comportamiento multilingüe.
- El número de descargas (17) y la ausencia de likes indican una adopción muy temprana; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Checkpoint con todos los registros: https://huggingface.co/m-polignano/decision4rec-kev-9b-all
- Variante semilla 1: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed1
- Variante semilla 2: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed2
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio del proyecto: https://github.com/marcopoli/decision4rec
- Trainer Kev: https://github.com/jaredpalmer/kev
