# dealignai/MiniMax-M3.1-Flash-UNCENSORED-JANGHT1.9

## Resumen

MiniMax-M3.1-Flash-UNCENSORED-JANGHT1.9 es una redistribucion no oficial del modelo MiniMaxAI/MiniMax-M3.1-Flash, un modelo de razonamiento de tipo sparse-MoE desarrollado por MiniMax. La publica el usuario dealignai bajo licencia Apache 2.0, con el objetivo declarado de eliminar el comportamiento de rechazo a nivel de pesos (abliteration) y empaquetarlo en un bundle JANGHT1.9 de precision mixta optimizado para inferencia en Apple Silicon mediante el motor vMLX.

El modelo base cuenta con 427.000 millones de parametros en origen, pero esta distribucion concreta contiene 36.688.878.464 parametros en safetensors tras la cuantizacion, con un peso medio de 1,878 bits por peso (bpw), atencion en affine-4 y escalas en bf16. El resultado ocupa aproximadamente 96 GB repartidos en 23 shards, dentro de un repositorio de 102,5 GB.

Su relevancia es doble: por un lado, demuestra una tecnica de compresion agresiva que permite servir un MoE de gran tamano en hardware de consumo de Apple; por otro, es un ejemplo de finetune orientado a eliminar salvaguardas, lo que plantea consideraciones eticas y de licencia que se detallan en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) con atencion transformer; variante VL en el modelo base (tag `minimax_m3_vl`) |
| Parametros totales | 36.688.878.464 (en el bundle cuantizado); 427B en el modelo base segun la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANGHT1.9 mixed-precision, 1,878 bpw promedio, affine-4 en atencion, escalas bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 23 shards, ~96 GB |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3.1-Flash es un sparse MoE de 427.000 millones de parametros orientado a razonamiento, con capacidad de vision segun la etiqueta `minimax_m3_vl` del repositorio. Esta distribucion no entrena desde cero: parte de los pesos del modelo base y aplica un proceso de abliteration que elimina el comportamiento de rechazo a nivel de pesos, sin hooks en tiempo de ejecucion ni vectores de direccion. Segun la model card, se preservan las capacidades de codigo, conocimiento, razonamiento, tool calling y razonamiento adaptativo del original.

La innovacion tecnica principal es el empaquetado JANGHT1.9: cuantizacion de precision mixta con un promedio de 1,878 bpw, atencion en affine-4 y escalas en bf16, distribuida en 23 shards. El bundle esta disenado para ejecutarse en el motor vMLX sobre Apple Silicon, que anade cuantizacion de KV-cache y soporte de tool calling agentico. La plantilla de chat, el parser de herramientas XML nativo de MiniMax y el parser de razonamiento (`<think>...</think>`) se mantienen sin cambios respecto al modelo base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento adaptativo (`thinking_mode = "adaptive"`) y modo desactivado para evaluacion directa.
- Razonamiento explicito mediante bloques `<think>...</think>` con parser nativo de MiniMax.
- Tool calling y function calling con el parser XML nativo de MiniMax, sin modificaciones respecto al base.
- Capacidad de agentes y razonamiento encadenado, orientada a flujos con multiples llamadas a herramientas.
- Capacidad de vision segun la etiqueta `minimax_m3_vl` del repositorio (no verificada en la model card de esta distribucion).
- Capacidades de codigo y conocimiento general preservadas tras la abliteration, con una degradacion medida de solo -0,53 puntos porcentuales en MMLU.
- Multilingue limitado al ingles segun el campo `language: en`.
- Comportamiento sin rechazo en categorias de tarea, incluyendo las evaluadas en HarmBench-320.

## Casos de uso

- Evaluacion de robustez y red teaming: el modelo sirve como sujeto de prueba para medir tasas de cumplimiento en benchmarks de dano como HarmBench-320, permitiendo comparar el comportamiento del base frente a la version abliterada con la misma plantilla y parser.
- Investigacion sobre abliteration: al mantener la plantilla de chat, el parser de herramientas y el parser de razonamiento identicos al base, permite aislar el efecto de la eliminacion de rechazo sobre el rendimiento en tareas estandar como MMLU.
- Inferencia local en Apple Silicon: con ~96 GB en 23 shards y 1,878 bpw, puede servirse mediante `vmlx serve` en equipos Mac con memoria unificada suficiente, sin necesidad de GPUs dedicadas.
- Desarrollo de agentes con tool calling: el parser XML nativo de MiniMax y el soporte de razonamiento adaptativo permiten construir pipelines de agentes que alternan razonamiento y llamadas a herramientas en un solo flujo.
- Analisis de documentos con razonamiento largo: el modo de pensamiento adaptativo y los bloques `<think>` permiten trazas de razonamiento extensas antes de emitir la respuesta final, util para tareas de sintesis y verificacion.
- Prototipado de asistentes conversacionales multi-turno: la plantilla de chat sin cambios y la preservacion de capacidades conversacionales permiten reutilizar integraciones existentes del modelo base.
- Experimentacion con cuantizacion extrema: el bundle JANGHT1.9 a 1,878 bpw sirve como referencia para estudiar el equilibrio entre compresion y calidad en MoE de gran escala.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este bundle concreto:

| Metrica | Valor |
|---|---|
| MMLU (57 materias, modo logit, 5.700 items, thinking OFF) | 74,58 % (base 75,11 %, delta -0,53 pp) |
| HarmBench-320, cumplimiento global (razonamiento adaptativo) | 86,25 % (276/320) |
| HarmBench-320, cumplimiento de dano real (240 items, excl. copyright) | 93,75 % (225/240) |
| Tamano del bundle | ~96 GB (23 shards) |

El MMLU se evaluo con `thinking_mode = "disabled"` y `max_tokens = 512` por item. El cumplimiento en HarmBench-320 se evaluo con `thinking_mode = "adaptive"`, calificando el cuerpo de la respuesta tras `</think>` o la traza de razonamiento sustantiva cuando esta agota el presupuesto de tokens sin cerrar. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM o memoria unificada estimada: ~96 GB para el bundle completo en 1,878 bpw; el repositorio ocupa 102,5 GB.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (Mac Studio o MacBook Pro de gama alta con 128 GB o mas), dado que el formato es MLX.
- GPU dedicadas: no aplicable de forma nativa; el bundle esta empaquetado para MLX y el motor vMLX, no para CUDA.
- Cabe en GPU de consumo: no en tarjetas consumer convencionales de 24 GB o 48 GB; requiere el nivel de memoria unificada de los equipos Apple de gama alta.
- Opciones de despliegue: motor vMLX (`vmlx serve`) sobre macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-UNCENSORED-JANGHT1.9 | 36,7B en bundle (427B base) | no disponible | Apache 2.0 | safetensors MLX | Abliterado, 1,878 bpw, ~96 GB |
| MiniMaxAI/MiniMax-M3.1-Flash (base) | 427B | no disponible | Apache 2.0 | safetensors | Modelo original con rechazo intacto; MMLU 75,11 % |
| Otros bundles JANG del mismo autor | no disponible | no disponible | Apache 2.0 | safetensors MLX | No se detallan en la informacion disponible |

No se dispone de datos de benchmarks de terceros ni de comparativas con modelos de la misma categoria fuera de la familia MiniMax en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo: el modelo cumple instrucciones en categorias que el base rechazaria, con un 93,75 % de cumplimiento en dano real en HarmBench-320. Esto lo hace inadecuado para despliegues de cara al publico sin filtros externos.
- Riesgo elevado de generar contenido danino, sesgado o legalmente problematico; requiere moderacion y revision humana en cualquier uso productivo.
- Degradacion medida en MMLU de -0,53 pp agregada, con caidas locales de hasta -8 pp en materias concretas (High School Physics) y subidas de hasta +10 pp (Jurisprudence), lo que indica que la abliteration altera el comportamiento por materia de forma no uniforme.
- Soporte unicamente en ingles segun el campo `language: en`; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada en la informacion disponible.
- La licencia Apache 2.0 del bundle no exime del cumplimiento de las leyes aplicables sobre contenido generado; el uso comercial de un modelo sin salvaguardas conlleva riesgos legales y reputacionales.
- Dependencia del motor vMLX y de macOS/Apple Silicon: no hay rutas de despliegue documentadas para CUDA, vLLM, llama.cpp u Ollama.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de terceros.
- El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni el proceso exacto de abliteration.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/MiniMax-M3.1-Flash-UNCENSORED-JANGHT1.9
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Motor de inferencia vMLX: https://vmlx.net
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
