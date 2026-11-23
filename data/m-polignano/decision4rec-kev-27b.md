# m-polignano/decision4rec-kev-27b

## Resumen

Decision4Rec Kev-27B (pool reader) es un adaptador LoRA de rango 16 con una cabeza de puntero (pointer head) entrenado sobre el modelo base congelado Qwen/Qwen3.8-27B. Lo desarrolla Marco Polignano y colaboradores en el marco del proyecto Decision4Rec, un sistema de recomendación secuencial multiagente. El modelo no genera texto libre: actúa como un clasificador de decisión que lee los 30 mejores candidatos de un pool multiagente —incluyendo texto de los ítems, declaraciones del grafo de conocimiento del escenario y los agentes que propusieron cada candidato— y devuelve una probabilidad por candidato en un único forward pass (protocolo System One, pregunta de tipo `choice`).

Su relevancia radica en que formaliza la fase de reranking como un problema de decisión aprendida en lugar de una heurística de fusión de puntuaciones. El modelo añade información sobre la lista del pool medida en nats por elección (0,050 de media en los seis escenarios evaluados), y en la versión 2 del artículo el sistema completo Decision4Rec-Full, usando el lector de 9B entrenado con todos los registros, supera a SASRecF+ con ganancias de entre el +6,0 % y el +34,8 % en NDCG@10 sobre usuarios reservados.

El checkpoint concreto de esta ficha es el lector de 27B de la fila "Same 8,000 records" de la tabla de tamaños de la versión 2 del artículo, entrenado con una muestra fija de 8.000 registros reales de elección siguiente. No es el checkpoint de 27B de los resultados principales. El repositorio ocupa 0,5 GB y la licencia del adaptador es Apache-2.0, mientras que el modelo base conserva su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8-27B congelado) + adaptadores LoRA de rango 16 en todas las capas lineales + cabeza de puntero para scoring de candidatos |
| Parametros totales | 27B en el modelo base; el adaptador y la cabeza son un subconjunto de esos parámetros (no se especifica el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | no disponible (el entrenamiento usa catálogos de productos y videojuegos en inglés) |
| Licencia | Apache-2.0 para adaptador y cabeza; el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.8-27B, revisión 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0, congelado |
| Punto de partida | adaptador de jaredpalmer/kev-27b (tag v1-lora) y su cabeza de puntero |
| Libreria | PEFT |
| Pipeline | text-classification |
| Tarea | Recomendación secuencial, reranking de candidatos |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre un transformer decoder-only congelado de 27B parámetros. Sobre el modelo base se insertan adaptadores LoRA de rango 16 en todas las capas lineales y se añade una cabeza de puntero que produce una probabilidad por cada uno de los 30 candidatos del pool en un solo forward pass. La entrada combina el texto de cada ítem candidato, las declaraciones del grafo de conocimiento del escenario y la identidad de los agentes que propusieron cada candidato. El objetivo de entrenamiento es la verosimilitud del ítem que el usuario eligió realmente después; no se usaron salidas de ningún modelo comercial.

Los datos de entrenamiento son una muestra aleatoria fija de 8.000 registros (semilla 2026) extraída de los 34.667 registros reales de elección siguiente empleados también para los modelos de 0,8B y 4B, procedentes de Amazon Video Games, Amazon Musical Instruments y Steam, evaluados sobre los 30 mejores candidatos del pool. La receta es una época, tasa de aprendizaje 2e-5, esquema one-cycle, micro-batch 1 con acumulación de 8 (8 registros por paso), precisión bf16 y gradient checkpointing, usando el trainer Kev (`kev.train`, commit 84847f0) sobre una NVIDIA DGX Spark. El punto de partida es el adaptador v1-lora de jaredpalmer/kev-27b y su cabeza de puntero; la release actual de Kev-27B es un fine-tune completo sin adaptador del que partir.

## Capacidades

- Clasificación de decisión sobre un conjunto fijo de candidatos: devuelve una probabilidad por candidato en un único forward pass.
- Reranking de listas de recomendación producidas por un pool multiagente.
- Integración de señales heterogéneas: texto de ítems, declaraciones de un grafo de conocimiento y procedencia de cada candidato (qué agente lo propuso).
- Protocolo System One con pregunta de tipo `choice`, orientado a inferencia de baja latencia sin cadena de razonamiento explícita.
- No realiza recuperación de candidatos: solo puntúa y ordena los que recibe.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión ni audio para este checkpoint.
- Capacidades multilingües: no disponibles; el entrenamiento se limita a catálogos en inglés.

## Casos de uso

- Reranking en sistemas de recomendación secuencial: se coloca como última etapa tras un pool de recuperadores y agentes, y reordena los 30 candidatos según la probabilidad de elección real del usuario. Es su uso nativo y el documentado por el autor.
- Fusión aprendida de múltiples recomendadores: en lugar de combinar puntuaciones con pesos heurísticos, el modelo recibe la identidad de los agentes que propusieron cada candidato y aprende qué fuente es más fiable en cada contexto.
- Recomendación con conocimiento de dominio: las declaraciones del grafo de conocimiento del escenario se incorporan directamente en la entrada, lo que permite condicionar el ranking a atributos y relaciones del catálogo sin ingeniería de features manual.
- Evaluación offline de sistemas de recomendación: sirve como componente de referencia para medir la contribución de un modelo de decisión frente a un ranker residual, tal como reporta el autor en sus tablas de desarrollo.
- Personalización en catálogos de productos y videojuegos: el entrenamiento sobre Amazon Video Games, Amazon Musical Instruments y Steam lo hace directamente aplicable a dominios de e-commerce y gaming con historiales de interacción.
- Transferencia a dominios no vistos: el autor reporta ganancias sobre el mejor baseline en escenarios no vistos durante el entrenamiento (Industrial & Scientific, CDs and Vinyl, Toys and Games, Software), lo que respalda su uso como reranker en catálogos nuevos con estructura similar.
- Investigación en sistemas multiagente: permite estudiar cómo un lector de decisión explota la diversidad de un pool de agentes y cuantificar la información añadida en nats por elección.

## Benchmarks y rendimiento

Información añadida por el modelo a la lista del pool, en nats por elección, sobre 2.000 usuarios de test de desarrollo por escenario cuyo objetivo está entre los 30 candidatos:

| Escenario | Nats por elección |
|---|---|
| Video Games | 0,085 |
| Musical Instruments | 0,058 |
| Steam | 0,034 |
| Industrial & Scientific | 0,069 |
| ML-1M | 0,025 |
| ML-1M enriquecido | 0,027 |
| Media | 0,050 |

Resultados de desarrollo (versión 1) de Decision4Rec-Full, NDCG@10 sobre 2.000 usuarios de test de desarrollo por dominio, ranking sobre catálogo completo con leave-one-out. Industrial and Scientific no se vio en entrenamiento:

| Sistema | Video Games | Musical Instr. | Steam | Industrial & Sci. |
|---|---|---|---|---|
| Mejor baseline entrenado | 0,0622 | 0,0370 | 0,0790 | 0,0310 |
| Pool y ranker residual, sin modelo de decisión | 0,0730 | 0,0468 | 0,0786 | 0,0386 |
| Con este modelo (fusionado) | 0,0789 | 0,0492 | 0,0831 | 0,0402 |

Confirmación del marco sobre usuarios reservados (versión 2, con el lector de 9B entrenado con todos los 34.667 registros, no con este checkpoint), NDCG@10 sobre 10.000 usuarios reservados por dominio, con p < 0,01 corregido por Holm en todas las filas:

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2 % |
| Musical Instr. | SASRecF+ | 0,0278 | 0,0375 | +34,8 % |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0 % |
| Industrial & Sci. (no visto) | SASRecF+ | 0,0263 | 0,0326 | +23,9 % |

En tres escenarios nunca vistos en entrenamiento las ganancias sobre el mejor baseline son +49,2 % (CDs and Vinyl), +50,6 % (Toys and Games) y +6,1 % (Software). No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un adaptador sobre un modelo base de 27B, el requisito dominante es el del modelo base completo; en bf16 un modelo de 27B requiere del orden de 54 GB solo para pesos, más memoria para activaciones y KV cache.
- GPU recomendadas: el autor entrenó sobre una NVIDIA DGX Spark. Para servir el modelo base de 27B se requieren GPUs de centro de datos con suficiente memoria (A100 80 GB, H100, o configuraciones multi-GPU); no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: no disponible. Con cuantización agresiva del modelo base podría ser viable en GPUs de 24 GB, pero el autor no documenta esta configuración ni su calidad.
- Opciones de despliegue: el autor proporciona el servidor propio de Kev (`uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-27b --port 8009`) y la CLI `decision4rec run` con un backend de configuración (`configs/backends/kev-27B-rtm8k.yaml`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de un único forward pass sobre 30 candidatos (System One) está orientado a minimizar la latencia frente a esquemas con razonamiento explícito, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decision4rec-kev-27b (este) | 27B (adaptador LoRA r16 + cabeza) | no disponible | Reranking de decisión sobre 30 candidatos | Apache-2.0 (adaptador) | Hugging Face, 31 descargas |
| decision4rec-kev-9b-all | 9B | no disponible | Reranking de decisión, lector de los resultados principales de la v2 | no disponible en esta ficha | Hugging Face (m-polignano) |
| jaredpalmer/kev-27b | 27B | no disponible | Fine-tune completo del que parte este adaptador | no disponible en esta ficha | Hugging Face |
| SASRecF+ | no disponible | no disponible | Recomendación secuencial (baseline de referencia del artículo) | no disponible en esta ficha | Referencia del paper |

La comparación relevante es interna al proyecto: este checkpoint se distingue del lector de 9B de los resultados principales por el tamaño (27B frente a 9B) y por los datos de entrenamiento (8.000 registros frente a 34.667). El autor no reporta NDCG@10 agregado específico para este checkpoint de 27B, solo la información añadida en nats por elección.

## Limitaciones y advertencias

- Entrenado sobre catálogos de productos y videojuegos en inglés; los dominios densos con historiales largos (MovieLens) se benefician menos (0,025 y 0,027 nats por elección, frente a 0,085 en Video Games).
- Solo ordena los candidatos que recibe: no recupera ítems del catálogo. Necesita un pool de recuperadores o agentes aguas arriba.
- Los resultados de desarrollo de la versión 1 proceden de los usuarios empleados para diseñar el sistema; la confirmación sobre usuarios reservados de la versión 2 corresponde al lector de 9B entrenado con todos los registros, no a este checkpoint.
- El modelo no genera texto ni admite instrucciones libres; su interfaz es la pregunta de tipo `choice` del protocolo System One.
- Riesgo de sesgo: no documentado por el autor; al entrenarse sobre catálogos de Amazon y Steam, puede heredar sesgos de popularidad y de composición de esos datasets.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no genera texto; el riesgo equivalente es una calibración deficiente de las probabilidades sobre candidatos fuera de la distribución de entrenamiento.
- Restricciones de licencia: el adaptador y la cabeza son Apache-2.0, pero el modelo base Qwen/Qwen3.8-27B conserva su propia licencia, que debe verificarse para uso comercial. Los datos de entrenamiento proceden de datasets de investigación públicos que no se redistribuyen.
- Para producción hay que servir el modelo base de 27B completo junto con el adaptador, con el coste de memoria y latencia asociado; no se publican medidas de throughput ni de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Punto de partida (adaptador v1-lora): https://huggingface.co/jaredpalmer/kev-27b
- Lector de 9B de los resultados principales: https://huggingface.co/m-polignano/decision4rec-kev-9b-all
- Semilla 1 del lector de 9B: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed1
- Semilla 2 del lector de 9B: https://huggingface.co/m-polignano/decision4rec-kev-9b-all-seed2
- Repositorio del proyecto Decision4Rec: https://github.com/marcopoli/decision4rec
- Trainer Kev: https://github.com/jaredpalmer/kev
