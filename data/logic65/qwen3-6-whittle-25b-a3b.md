# logic65/Qwen3.6-Whittle-25B-A3B

## Resumen

Qwen3.6-Whittle-25B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el autor independiente logic65. Se construye a partir de Qwen/Qwen3.6-35B-A3B mediante una tecnica de poda de expertos enrutados (expert pruning) seguida de un proceso de curacion por autodestilacion desde los pesos originales sin podar. El resultado reduce el total de parametros de 34,7B a 25,1B manteniendo el mismo numero de parametros activos por token (~3B), lo que permite inferencia con coste computacional practicamente identico pero con un footprint de memoria menor.

La innovacion principal es haber eliminado el 30% de los expertos enrutados por capa (de 256 a 180) sin degradar de forma significativa el rendimiento, e incluso mejorando en algunas metricas como GSM8K (92,5% frente a 88,5% del modelo base). El autor denomina "Whittle" al proceso, en referencia al metodo de poda. El modelo conserva la arquitectura `qwen3_5_moe`, tokenizer y esquema de 8 expertos enrutados mas 1 compartido activos por token del modelo original.

Es relevante porque demuestra que la poda agresiva de expertos en arquitecturas MoE, combinada con destilacion de recuperacion, puede producir modelos mas ligeros (50 GB en bf16 frente a 70 GB) que mantienen o mejoran el rendimiento en tareas de razonamiento, y que funcionan en transformers y llama.cpp sin parches. El repositorio tambien aloja GGUFs derivados de una linea posterior (Whittle-Qwen-3.8), lo que conviene distinguir al descargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), 8 expertos enrutados + 1 compartido activos por token |
| Parametros totales | 25.091.371.648 (~25,1B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors bf16; GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M para la variante Whittle-Qwen-3.8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards, index.json), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer MoE con 256 expertos enrutados por capa y 8+1 activos por token. El proceso Whittle elimina 76 expertos por capa (256 → 180, un 30% de poda) y posteriormente aplica autodestilacion desde los pesos no podados para reparar el dano. Se mantienen la arquitectura, el tokenizer y el esquema de enrutamiento del modelo original, por lo que es compatible con transformers y llama.cpp estandar sin necesidad de parches.

Los datos de entrenamiento especificos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. El autor reporta metricas de entropia cruzada en datos held-out: 1,863 en texto de corpus (frente a 1,926 del podado en crudo y 1,770 del modelo base) y 1,417 en filas de chat (frente a 2,510 del modelo base), lo que sugiere que la curacion mejoro notablemente el comportamiento conversacional aunque sacrifico algo de modelado de texto puro.

## Capacidades

- Generacion de texto conversacional e instruccional.
- Razonamiento matematico (GSM8K, MATH) con modo thinking activable via `chat_template_kwargs`.
- Generacion de codigo y completado (aunque la variante sin memoria n-gram presenta degradacion en completado de codigo).
- Tool calling / function calling (probado con 96 items, 91/96 correctos en la variante Q6_K).
- Razonamiento multi-paso y uso de agentes con herramientas de navegador.
- Salida JSON estricta (72/72 valida en hold-out).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking conmutable (`enable_thinking`).

## Casos de uso

- Razonamiento matematico en produccion: el modelo alcanza 92,5% en GSM8K sin thinking y modo greedy, lo que lo hace adecuado para resolver problemas aritmeticos de varios pasos en pipelines automatizados de validacion o tutoria.
- Agentes con tool calling: con 91/96 aciertos en pruebas de uso de herramientas, puede integrarse en flujos de agente que invocan APIs, calculadoras o bases de datos, manteniendo contexto de conversacion multi-turno.
- Generacion de JSON estructurado: su 72/72 de validez en JSON estricto lo hace apto para extraccion de datos, formateo de respuestas para APIs y generacion de payloads en sistemas de integracion.
- Asistente conversacional con contexto largo: los probes con ~11k tokens de contexto obtuvieron 19/24, lo que permite gestionar conversaciones extensas o documentos largos en atencion al cliente.
- Automatizacion de navegacion web: las pruebas con herramientas de navegador en llama.cpp (17/20 y 18/20 sin herramientas inventadas) lo habilitan para agentes que rellenan formularios o extraen informacion de paginas.
- Despliegue en hardware modesto: con ~3B parametros activos y cuantizaciones Q4_K_M de 15,66 GB, puede servirse en GPUs de consumo o en dos T4, abaratando el coste de inferencia frente al modelo base de 35B.
- Fine-tuning y experimentacion: al ser un modelo de 25B en bf16 (50 GB) con licencia Apache 2.0, es viable para ajuste fino en un solo nodo de GPU de 80 GB.

## Benchmarks y rendimiento

Datos del cuerpo prune+heal (2 Sep 2026), comparados con Qwen3.6-35B-A3B:

| Metrica | Qwen3.6-35B-A3B | Qwen3.6-Whittle-25B-A3B |
|---|---|---|
| GSM8K (200 q, no-think, greedy, 512 tok) | 88,5% | 92,5% (185/200) |
| Entropia cruzada held-out, texto de corpus | 1,770 | 1,863 (podado en crudo: 1,926) |
| Entropia cruzada held-out, filas de chat | 2,510 | 1,417 |
| bf16 en disco | 70 GB | 50 GB |

Datos de la variante Whittle-Qwen-3.8-25B-A3B Q6_K (3 Oct 2026), comparados con el 35B con tabla de memoria completa:

| Prueba | Q6_K 25B (3 Oct) | 35B Q6_K (2 Oct) |
|---|---|---|
| PopQA-288 cloze, exact match | 69/288 | 71/288 |
| 40 hechos simples | 35/40 | 35/40 |
| Bateria stop/loop, 24 prompts | 23/24 limpios | 23/24 limpios |
| GSM-50 | 42/50 | 44/50 |
| JSON estricto, 72 items | 72/72 validos, 71/72 exactos | 72/72 validos, 70/72 exactos |
| Tool-use, 96 items | 91/96 | 95/96 |
| Probe de contexto ~11k tokens (24 items) | 19/24 | 23/24 |
| Herramientas de navegador, chat real (20 cada uno) | 17/20 y 18/20, 0 herramientas inventadas | 16/20 y 18/20, 0 herramientas inventadas |
| Chats held-out finalizados correctamente (36) | 28/36 | 32/36 |
| MATH-60, cap 6.144 tokens | 38/60 | no ejecutado |

Cada prueba es una muestra por item, por lo que diferencias de pocos items pueden ser ruido.

## Requisitos de hardware

- VRAM estimada: ~50 GB en bf16; ~27,21 GB en Q8_0; ~21,08 GB en Q6_K; ~18,26 GB en Q5_K_M; ~15,66 GB en Q4_K_M; ~12,44 GB en Q3_K_M.
- GPU recomendadas: A100 80 GB o H100 para bf16; dos T4 para Q6_K (configuracion usada por el autor con llama.cpp); RTX 4090 (24 GB) puede ejecutar Q4_K_M o Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: transformers (safetensors), llama.cpp (`llama-server`), GGUF compatible con Ollama y otros runners basados en llama.cpp. No se menciona soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles. El autor indica que la variante sin memoria n-gram no necesita `-ot per_layer_token_embd=CPU`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-Whittle-25B-A3B | 25,1B | ~3B | no disponible | 92,5% | Apache 2.0 | safetensors, GGUF |
| Qwen3.6-35B-A3B (base) | 34,7B | ~3B | no disponible | 88,5% | no disponible | safetensors |
| Whittle-Qwen-3.8-25B-A3B | 25B | ~3B | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La variante Whittle-Qwen-3.8 sin memoria n-gram degrada el completado de texto y codigo: la entropia cruzada en codigo held-out colapsa sin la tabla de memoria. No es apta para completado estilo base-model.
- El repositorio mezcla dos artefactos distintos (cuerpo prune+heal en safetensors y GGUFs de la linea Whittle-Qwen-3.8); es facil descargar el equivocado.
- Las pruebas son de una sola muestra por item, por lo que las diferencias frente al modelo base pueden ser ruido estadistico.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- El probe de contexto largo (~11k tokens) muestra degradacion (19/24 frente a 23/24 del 35B).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-35B-A3B debe verificarse por separado.
- Proyecto mantenido por una sola persona con recursos limitados; el soporte y la estabilidad de la linea pueden ser limitados.

## Enlaces

- Hugging Face: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Whittle-Qwen-3.8-35B-A3B: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Whittle-Qwen-3.8-35B-A3B-GGUF: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Whittle-Next-26B-A3B: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Whittle-Next-27B-A3B: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Apoyo al autor: https://ko-fi.com/davida81328
