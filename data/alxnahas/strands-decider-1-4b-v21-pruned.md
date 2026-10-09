# alxnahas/strands-decider-1.4B-v21-pruned

## Resumen

strands-decider-1.4B-v21-pruned es una version reducida y no oficial del modelo strands-decider-2B-hobson-v21, publicada por el desarrollador Alex Nahas (alxnahas). No se trata de un lanzamiento de Strands. El modelo original responde preguntas tipadas sobre un estado, con tres modalidades: `noul` (si/no), `choice` (una entre N opciones) y `score` (un nivel en una escala ordenada), devolviendo en todos los casos probabilidades calibradas. Este build mantiene esa funcionalidad con un 27 % menos de parametros.

Tecnicamente, parte de una fusion del adaptador LoRA de v21 sobre Qwen/Qwen3.5-2B-Base en float32, guardada despues en bfloat16. Despues se eliminan 9 de las 24 capas del decodificador (capas 14 a 22) y se sustituyen por un unico bloque lineal de 4,2 millones de parametros tras la capa 13. El resultado son 1.370 millones de parametros (857 M en las 15 capas, 509 M de embedding, 4 M del bloque lineal y 1 M de la cabeza de lectura), con un peso en disco de 2,7 GB en bfloat16.

Su relevancia radica en que conserva casi toda la precision del modelo original en la suite JevBench con un coste de memoria y computo notablemente menor: 173 de 231 tareas correctas frente a 176 de v21, con solo 6 respuestas distintas y una divergencia KL media de 0,0072 respecto al original. Es un caso de estudio de poda agresiva con sustitucion por bloque lineal sin reentrenar la cabeza de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM) con poda de capas y bloque lineal sustituto |
| Parametros totales | 1,37 mil millones (857 M en 15 capas, 509 M embedding, 4 M bloque lineal, 1 M cabeza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_length` en `strands_decider_config.json`); los estados mas largos se recortan por delante |
| Tipos de cuantizacion | El checkpoint se distribuye en bfloat16; no se documentan cuantizaciones adicionales (no disponible) |
| Idiomas soportados | no disponible oficialmente; evaluado en en, zh, ja, ko, ar, hi, uk, de, pl |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`torso/`, `head.safetensors`, `adapters.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen3.5-2B-Base, un transformer decoder-only. El proceso de construccion de este build tiene dos fases. Primero, el adaptador LoRA de v21 se fusiona en la base en float32 y el resultado se guarda en bfloat16 (revision base `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`). Despues se eliminan las capas 14 a 22 del decodificador (9 de 24), y en su lugar se inserta un unico bloque lineal tras la capa 13 con la forma `h + W rms_norm(h) + b`, que aporta 4,2 millones de parametros.

Ese bloque lineal es lo unico que se entrena. Se ajusto para imitar a v21 mediante una combinacion de divergencia KL sobre el readout y error cuadratico sobre el estado oculto final, usando 1.516 filas construidas a partir de las recetas publicas de entrenamiento de v21, ninguna de ellas perteneciente a JevBench. El resto de componentes no se toca: la cabeza de lectura y sus temperaturas son exactamente las de v21. No se aplico RLHF ni DPO en esta fase, ni se documenta decodificacion especulativa u otras innovaciones de atencion.

## Capacidades

- Clasificacion y decision tipada: responde tres tipos de pregunta sobre un estado (`noul` yes/no, `choice` una entre N opciones, `score` un nivel en una escala ordenada).
- Probabilidades calibradas: cada respuesta se acompanana de una confianza y de la distribucion completa sobre las opciones (por ejemplo `billing 0.886`, `retail 0.058`, `sales 0.056`).
- Enrutamiento y triaje: asignacion de casos a equipos o categorias con score de confianza.
- Deteccion de intencion y urgencia: preguntas yes/no sobre el contenido del estado.
- Estimacion de niveles en escalas ordinales: por ejemplo, nivel de frustracion con mapeo a categorias (`calm`, `frustrated`, `depressed`) y valor continuo asociado.
- Soporte multilingue parcial: evaluado en nueve idiomas (en, zh, ja, ko, ar, hi, uk, de, pl).
- Servicio como API HTTP: endpoint `POST /v1/systemone` compatible con el adaptador `typesafe` de JevBench.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del cliente y decide a que equipo derivarlo (`billing`, `sales`, `retail`) con confianza calibrada, integrable en un enrutador de mesa de ayuda.
- Deteccion de urgencia en mensajes entrantes: mediante pregunta `noul` ("Does this convey urgency?"), util para priorizar colas en atencion al cliente.
- Analisis de sentimiento ordinal: la modalidad `score` permite medir el grado de frustracion de un usuario y escalar automaticamente los casos mas graves.
- Clasificacion de intencion en asistentes conversacionales: dado un turno de usuario, decidir entre un conjunto acotado de acciones o respuestas.
- Moderacion o etiquetado rapido: preguntas yes/no sobre el contenido de un texto para filtrar o marcar elementos en un pipeline.
- Enrutamiento en sistemas multiagente: asignar cada solicitud al agente o flujo correspondiente segun la opcion elegida y su probabilidad.
- Servicio local de bajo coste: al ocupar 2,7 GB en bfloat16, puede desplegarse en una sola GPU consumer para clasificacion en tiempo real dentro de un backend propio.

## Benchmarks y rendimiento

JevBench, conjunto publico (231 tareas, harness commit `1bcc55e`), servido a 4096 tokens:

| Sistema | Respuestas correctas (de 231) | Precision | Respuestas distintas vs v21 | KL media vs v21 |
|---|---|---|---|---|
| v21 (bf16, MLX) | 176 | 0,762 | referencia | referencia |
| Este build (torch, mps) | 173 | 0,749 | 6 | 0,0072 |

Rescoring con las reglas del board JevBench v1.6.1 sobre las mismas 231 tareas publicas (sin mitad sellada, por lo que no es una cifra oficial de board):

| Sistema | Capability | Intelligence | Calibration |
|---|---|---|---|
| v21 | 53,2 | 32,3 | 74,2 |
| Este build | 51,7 | 30,5 | 72,9 |

Resultados multilingues (48 tareas publicas traducidas a cada idioma, correctas de 48):

| Sistema | en | zh | ja | ko | ar | hi | uk | de | pl |
|---|---|---|---|---|---|---|---|---|---|
| v21 | 45 | 43 | 43 | 44 | 40 | 31 | 42 | 43 | 39 |
| Este build | 45 | 44 | 43 | 43 | 39 | 32 | 41 | 42 | 38 |

Comparativa con otros modelos de decision pequenos (mismas 231 tareas publicas, adaptador `typesafe`, ejecuciones en hardware distinto):

| Sistema | Base | Correctas (de 231) | Board v1.6.1 Capability |
|---|---|---|---|
| Strands Decider v21, bf16 | Qwen3.5-2B, 1,88B | 176 (0,762) | no disponible |
| decider-2b v11 (Mapika) | Qwen3.5-2B, 1,9B | 175 (0,758) | no disponible |
| Decision 2B (FlyMy.AI) | MiniCPM5-2B, 2,5B | 174 (0,753) | 54,8 |
| Este build | Qwen3.5-2B, 15 capas, 1,37B | 173 (0,749) | no disponible |
| system-one-open | Gemma 4 E2B | 169 (0,732) | no disponible |
| decider-2b (Mapika), board entry | Qwen3.5-2B, 1,9B | 164 (0,710) | 44,6 |
| Malkuth-2B | 2B | 161 (0,697) | 47,6 |
| kev 0.6B | Qwen3-0.6B | 154 (0,667) | 36,9 |
| Open-Jev 2B | Qwen3.5-2B | 149 (0,645) | 47,7 |
| Decision Fast (FlyMy.AI) | Qwen3-0.6B | 146 (0,632) | 40,6 |

El autor advierte que los resultados de este build y de v21 provienen de las mismas 231 tareas usadas para comparar builds durante el desarrollo, por lo que pueden leerse ligeramente altos, y que ninguno de los dos esta en el board oficial.

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 2,7 GB solo para pesos, mas overhead de activaciones. Con contexto de 4096 tokens, una reserva practica de 4 a 6 GB es razonable.
- Cabe en GPU consumer: si. Modelos como RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo con holgura. El autor lo ha ejecutado con `--device mps` en Apple Silicon.
- GPU de datacenter (A100, H100) no son necesarias; aportarian margen para batching alto.
- Opciones de despliegue: el checkpoint requiere el cargador `torso_dir` de la rama `small-model` de alxnahas/strands-decider, que ningun lanzamiento oficial de strands-decider soporta todavia. Se sirve con `strands-decider serve ... --device cuda --port 8000` y expone `POST /v1/systemone`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench publicas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (alxnahas) | 1,37B | 4096 | 173/231 (0,749) | Apache-2.0 | HuggingFace, requiere cargador no publicado en release |
| Strands Decider v21 | 1,88B | 4096 (heredado) | 176/231 (0,762) | Apache-2.0 | Modelo original del que deriva |
| decider-2b v11 (Mapika) | 1,9B | no disponible | 175/231 (0,758) | no disponible | Repositorio strands-labs/strands-decider |
| Decision 2B (FlyMy.AI) | 2,5B (MiniCPM5-2B) | no disponible | 174/231 (0,753) | no disponible | Entrada de board JevBench |
| kev 0.6B | 0,6B (Qwen3-0.6B) | no disponible | 154/231 (0,667) | no disponible | Entrada de board JevBench |

La ventaja de este build es la relacion entre precision y tamano: mantiene una precision casi identica a v21 con un 27 % menos de parametros y sin perder capacidades multilingues significativas.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Strands: la model card lo declara explicitamente como build no oficial.
- Requiere el cargador `torso_dir` de la rama `small-model` de alxnahas/strands-decider, que ningun lanzamiento oficial soporta todavia; esto complica el despliegue estandar.
- Los numeros de JevBench se calcularon sobre las mismas tareas usadas durante el desarrollo, por lo que pueden estar ligeramente inflados segun el propio autor.
- Ningun resultado esta verificado en el board oficial (1.500 items, la mitad sellados); el rescoring con reglas v1.6.1 cubre solo las 231 tareas publicas.
- Al ser un modelo de decision/clasificacion, no es adecuado para generacion de texto abierto ni razonamiento multi-paso.
- El contexto esta limitado a 4096 tokens y los estados mas largos se recortan por delante, lo que puede eliminar informacion relevante.
- El rendimiento multilingue es desigual: en hindi cae a 31-32 sobre 48 y en polaco a 38-39, muy por debajo de ingles (45).
- Riesgo de alucinacion no cuantificado en la informacion disponible; en tareas de `score`/`choice` el modelo siempre emite una distribucion, incluso ante entradas ambiguas, por lo que conviene umbralizar por confianza.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen/Qwen3.5-2B-Base conviene revisar los terminos de ese modelo base.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del conjunto JevBench.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alxnahas/strands-decider-1.4B-v21-pruned
- Modelo base (v21): https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Repositorio del cargador (rama small-model): https://github.com/alxnahas/strands-decider/tree/small-model
- Commit de instalacion del cargador: https://github.com/alxnahas/strands-decider@c6003ecc25dc9fecf4fa6457fbc329b06434ea09
- Generaciones de referencia de Strands Decider: https://github.com/strands-labs/strands-decider/blob/main/research/generations.md
- Repositorio JevBench: https://github.com/fstandhartinger/jevbench
