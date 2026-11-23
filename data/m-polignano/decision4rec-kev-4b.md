# m-polignano/decision4rec-kev-4b

## Resumen

Decision4Rec Kev-4B es un adaptador LoRA de tipo decision model entrenado sobre el modelo base Qwen/Qwen3.5-4B-Base congelado, desarrollado por m-polignano (Marco Polignano y colaboradores) en el marco del proyecto Decision4Rec. Su funcion es actuar como lector de pool (pool reader) dentro de una arquitectura de recomendacion multi-agente: recibe los 30 mejores candidatos generados por un pool de agentes, junto con el texto de los items, las declaraciones del grafo de conocimiento del escenario y los agentes que encontraron cada candidato, y devuelve una probabilidad por candidato en un unico forward pass (protocolo System One, pregunta de tipo `choice`).

El modelo parte del adaptador publicado jaredpalmer/kev-4b y anade adaptadores LoRA de rango 16 sobre todas las capas lineales, ademas de una cabeza pointer. Se entreno sobre 34.667 elecciones reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam, con el objetivo de maximizar la verosimilitud del item que el usuario eligio realmente a continuacion, sin usar salidas de ningun modelo comercial.

Es relevante porque forma parte de Decision4Rec-Full, una arquitectura que combina recuperacion multi-agente con un modelo de decision sobre grafos de conocimiento, y porque introduce resultados medidos sobre usuarios reservados con ganancias de NDCG@10 frente a baselines secuenciales fuertes (SASRecF+) de hasta +34,8% en dominios vistos y +23,9% en un dominio no visto durante el entrenamiento. El repositorio es un preview privado que se hara publico con el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B-Base congelado) con adaptadores LoRA rank-16 en todas las capas lineales y cabeza pointer |
| Parametros totales | 4B en el modelo base (adaptador LoRA y cabeza adicionales; numero exacto de parametros entrenables no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estados de hasta 1.792 tokens durante el entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre catalogos de productos en ingles) |
| Licencia | Apache-2.0 para adaptador y cabeza; el modelo base conserva su propia licencia (Qwen3.5) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen/Qwen3.5-4B-Base (revision `1001bb4d826a52d1f399e183466143f4da7b741b`), que permanece congelado. Sobre el se montan adaptadores LoRA de rango 16 en todas las capas lineales y una cabeza pointer que produce una probabilidad por cada candidato del pool. El punto de partida es el adaptador y la cabeza pointer de jaredpalmer/kev-4b. La entrada es una peticion construida por Decision4Rec: un estado con el historial del usuario y las declaraciones del grafo de conocimiento, y una pregunta `choice` con los 30 candidatos y sus lineas de "found by" indicando que agente encontro cada uno.

El entrenamiento uso 34.667 elecciones reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam sobre los 30 mejores candidatos del pool (se descartaron 480 registros mas largos). El objetivo fue la verosimilitud del item realmente elegido, sin emplear salidas de modelos comerciales. La receta fue una epoca, learning rate 5e-5, schedule one-cycle, micro-batch 2 con 4 acumulaciones (8 registros por paso), autocast bf16, gradient checkpointing y estados de hasta 1.792 tokens. Se uso el trainer Kev (`kev.train`, commit 84847f0). El modelo no recupera candidatos: solo los reordena.

## Capacidades

- Clasificacion/ranking de candidatos: devuelve una probabilidad por candidato en un unico forward pass.
- Lectura de contexto estructurado: procesa historial de usuario, texto de items, declaraciones de grafo de conocimiento y procedencia de cada candidato (agente que lo encontro).
- Reranking de pools multi-agente: fusiona senales de varios agentes en una unica puntuacion.
- Razonamiento sobre evidencia: el modelo anade informacion medible en nats por eleccion, con un efecto decreciente a medida que crece la evidencia sobre el target (ley de evidencia).
- Generalizacion a dominios no vistos: evaluado en Industrial & Scientific, CDs and Vinyl, Toys and Games y Software sin entrenamiento especifico.
- No soporta (segun la informacion disponible): tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode.

## Casos de uso

- Reranking en sistemas de recomendacion secuencial: dado un pool de 30 candidatos recuperados por agentes, el modelo devuelve probabilidades que se fusionan con el ranker residual para producir el ranking final, mejorando NDCG@10 frente a baselines como SASRecF+.
- Recomendacion multi-agente con grafos de conocimiento: integrar las declaraciones del grafo del escenario y la procedencia de cada candidato permite al modelo ponderar senales heterogeneas en una sola pasada.
- Prototipado de investigacion en recomendacion: servir el adaptador con Kev (`python -m kev.serve --run m-polignano/decision4rec-kev-4b`) y apuntar Decision4Rec al servidor con un backend configurado.
- Evaluacion de pools de recuperacion: al puntuar los 30 mejores candidatos, sirve para diagnosticar que agentes aportan candidatos utiles y cuales generan ruido.
- Escenarios con historiales dispersos: el modelo aporta mas informacion cuando hay poca evidencia previa sobre el target (pendiente de -0.057 nats por decada en Video Games), lo que lo hace util en dominios con usuarios nuevos o catalogos frios.
- Transferencia a nuevos dominios de catalogo: los resultados en dominios no vistos durante el entrenamiento (Industrial & Scientific, CDs and Vinyl, Toys and Games) sugieren uso como reranker en catalogos no contemplados en el entrenamiento.
- Analisis de la ley de evidencia: usar el modelo como instrumento de medida para estudiar como decrece la informacion anadida a medida que crece el historial del usuario.

## Benchmarks y rendimiento

Informacion anadida por el modelo a la lista del pool, en nats por eleccion, sobre 2.000 usuarios de test de desarrollo por escenario cuyo target esta entre los 30 candidatos:

| Escenario | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Media |
|---|---|---|---|---|---|---|---|
| Este modelo | 0.102 | 0.070 | 0.049 | 0.086 | 0.007 | 0.018 | 0.055 |

Pendiente de la informacion anadida sobre log10(1 + compras previas del target), en nats por decada (test de permutacion agrupado):

| Escenario | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Agrupado |
|---|---|---|---|---|---|---|---|
| Este modelo | -0.057 | -0.013 | -0.045 | -0.128 | -0.001 | +0.019 | -0.038 (p = 0.0002) |

Confirmacion sobre usuarios reservados (10.000 por dominio, nunca usados en desarrollo; p de Holm < 0.01 en todas las filas). Nota: las cifras principales de la version 2 corresponden al lector de 9B entrenado con los 34.667 registros, no a este adaptador de 4B:

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0.0478 | 0.0608 | +27,2% |
| Musical Instr. | SASRecF+ | 0.0278 | 0.0375 | +34,8% |
| Steam | SASRecF+ | 0.0613 | 0.0649 | +6,0% |
| Industrial & Sci. (no visto) | SASRecF+ | 0.0263 | 0.0326 | +23,9% |

En tres escenarios no vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

Resultados de desarrollo (version 1), NDCG@10 sobre 2.000 usuarios de test de desarrollo por dominio (ranking sobre catalogo completo, leave-one-out):

| Sistema | Video Games | Musical Instr. | Steam | Industrial & Sci. |
|---|---|---|---|---|
| Mejor baseline entrenado | 0.0622 | 0.0370 | 0.0790 | 0.0310 |
| Pool y ranker residual, sin modelo de decision | 0.0730 | 0.0468 | 0.0786 | 0.0386 |
| Con este modelo (fusionado) | 0.0780 | 0.0504 | 0.0801 | 0.0407 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 4B en bf16 requiere aproximadamente 8 GB solo para pesos, mas el coste de activaciones y KV cache; el adaptador LoRA anade una fraccion minima.
- GPU recomendadas: no disponible. Por tamano, una GPU con 16-24 GB (RTX 4090, L40S, A10G) deberia poder servirlo en bf16; A100/H100 para mayor throughput.
- Cabe en GPU consumer: previsiblemente si en tarjetas de 16 GB o mas en bf16, y en 8-12 GB con cuantizacion de 8 bits; no confirmado en la informacion disponible.
- Opciones de despliegue: servidor Kev (`python -m kev.serve --run m-polignano/decision4rec-kev-4b --port 8009`), invocado desde Decision4Rec con un backend configurado. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-4B (este) | 4B base + LoRA | estados hasta 1.792 tokens | Reranker de decision sobre pool multi-agente con grafo de conocimiento | Apache-2.0 (adaptador) | Preview privado en Hugging Face |
| jaredpalmer/kev-4b | 4B base + LoRA | no disponible | Punto de partida del adaptador y cabeza pointer | no disponible | Publico en Hugging Face |
| SASRecF+ | no disponible | historial secuencial | Recomendador secuencial con filtrado | no disponible | Baseline de referencia en el paper |
| Decision4Rec-Full (lector 9B) | 9B | no disponible | Misma arquitectura con lector de 9B entrenado con los 34.667 registros | no disponible | Resultados reportados en el paper |

## Limitaciones y advertencias

- Entrenado sobre catalogos de productos y juegos en ingles; el rendimiento en otros idiomas no esta documentado.
- En dominios densos con historiales largos (MovieLens-1M) la ganancia es marginal (0.007 nats por eleccion; pendiente practicamente plana).
- Solo reordena candidatos: no realiza recuperacion. La calidad final depende del pool de agentes que lo alimenta.
- Los resultados de desarrollo de la version 1 provienen de los usuarios usados para disenar el sistema; la confirmacion sobre usuarios reservados se reporta en la seccion de la version 2 y corresponde al lector de 9B, no a este adaptador de 4B.
- Modelo en preview privado: puede cambiar o retirarse antes de la publicacion del paper.
- El adaptador y la cabeza son Apache-2.0, pero el modelo base Qwen3.5 conserva su propia licencia, que debe verificarse para uso comercial.
- Los datos de entrenamiento provienen de datasets publicos de investigacion que no se redistribuyen; posibles sesgos de los catalogos de Amazon y Steam no analizados en la informacion disponible.
- No soporta tool calling, vision, audio ni modos de razonamiento extendido; las peticiones fuera del formato de Decision4Rec funcionan pero no formaron parte del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio Decision4Rec: https://github.com/marcopoli/decision4rec
- Repositorio Kev: https://github.com/jaredpalmer/kev
