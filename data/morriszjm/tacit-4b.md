# morriszjm/Tacit-4B

## Resumen

Tacit-4B es un ajuste fino del modelo Qwen3-4B del equipo Qwen, desarrollado por el usuario morriszjm, orientado especificamente a la toma de decisiones tipadas: elegir entre opciones, responder si/no o asignar un nivel ordenado. A diferencia de un uso generativo convencional, el modelo devuelve una distribucion de probabilidad sobre las opciones en un unico forward pass, sin generar texto intermedio. La innovacion central es el metodo AnyJev de autodestilacion: el propio modelo base genero problemas de decision, los resolvio con su razonamiento activado y aprendio a reproducir esas respuestas en una sola pasada, sin etiquetas humanas ni datasets externos.

Con 4.022 millones de parametros y licencia Apache-2.0, Tacit-4B se posiciona como una alternativa de baja latencia para tareas de clasificacion y enrutamiento que normalmente requeririan un LLM generativo con cadenas de pensamiento. El modelo admite un modo adaptativo que desvia las decisiones de baja confianza a su propio razonamiento interno, con topes configurables sobre la proporcion de decisiones escaladas, lo que permite equilibrar coste y precision en produccion. Su relevancia actual radica en la posibilidad de sustituir llamadas generativas costosas por inferencia directa de etiquetas en escenarios de enrutamiento, triaje y decision estructurada.

La model card lo marca explicitamente como preview, con 935 descargas y un unico like en el momento de la consulta, lo que sugiere un modelo reciente y poco contrastado por la comunidad. No se declaran idiomas soportados de forma explicita, aunque al derivar de Qwen3-4B hereda su cobertura multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B) con cabeza de decision tipada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM sugiere `max_model_len=32768` como configuracion de referencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | no disponibles (heredados de Qwen3-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 8.1 GB) |

## Arquitectura y entrenamiento

Tacit-4B parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parametros, y anade un mecanismo de lectura de decisiones tipadas (`kind`: `choice`, `yes_no`, `score`) que devuelve una distribucion de probabilidad sobre las opciones en un solo forward pass. El entrenamiento se basa en AnyJev, un esquema de autodestilacion en el que el modelo base genero sus propios problemas de decision, los respondio con el razonamiento activado y posteriormente aprendio a emitir esas mismas respuestas sin cadena de pensamiento. Segun la model card, no se emplearon etiquetas humanas, datasets externos ni otros modelos.

El checkpoint tambien carga como un causal LM estandar (`AutoModelForCausalLM`) y es compatible con vLLM, lo que facilita su despliegue. El modo adaptativo permite escalar decisiones con baja confianza (definida por el gap de log-probabilidad entre las dos opciones principales por debajo de `tau`) al razonamiento del propio modelo, con un presupuesto de tokens (`cot_max_tokens`, por defecto 8192) y un tope sobre la proporcion de decisiones escaladas (`max_cot_share`, por defecto 0.2 sobre una ventana de 1000 decisiones). En vLLM, las etiquetas se leen a partir de las 20 log-probabilidades principales del vocabulario completo.

## Capacidades

- Toma de decisiones tipadas en un unico forward pass: eleccion entre opciones (`choice`), respuesta binaria (`yes_no`) y niveles ordenados (`score`).
- Devolucion de probabilidades calibradas sobre las opciones, no solo la etiqueta ganadora.
- Modo adaptativo con escalado a razonamiento interno para decisiones de baja confianza.
- Procesamiento por lotes mediante `decide_batch([...])`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al escalado puntual a cadena de pensamiento; no se documentan capacidades de agente.
- Capacidades multilingues: no documentadas explicitamente; heredadas de Qwen3-4B.
- Capacidades especiales: modo `thinking` interno activable por decision, presupuesto de razonamiento configurable y control de tasa de escalado.
- Compatibilidad con `transformers` (motor nativo), vLLM embebido (`engine="vllm"`) y servidor vLLM externo (`engine="server"`), ademas de un gateway HTTP incluido en el repositorio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado de la conversacion y una pregunta como "que quiere el cliente" con opciones (`track_order`, `cancel_order`, `refund`, `change_address`) y devuelve la opcion con probabilidad en una sola pasada, lo que reduce la latencia frente a un LLM generativo.
- Triaje de incidencias en produccion: con `kind="score"` puede asignar niveles ordenados de severidad a alertas o logs, aprovechando la salida probabilistica para umbrales operativos.
- Moderacion y clasificacion binaria: con `kind="yes_no"` permite decidir si un contenido cumple una politica, con la posibilidad de escalar a razonamiento los casos dudosos mediante `adaptive=True`.
- Extraccion de intencion en asistentes conversacionales: integrado en un pipeline previo al modelo generativo, decide la intencion del usuario y evita invocar el LLM grande en casos de alta confianza.
- Decisiones de negocio automatizadas: con el modo adaptativo y `max_cot_share` se puede limitar el coste computacional de las decisiones dificiles, manteniendo la mayoria en un solo forward pass.
- Despliegue de alto throughput: mediante `engine="server"` con `vllm serve` y el gateway HTTP incluido, varios clientes comparten un unico tope de escalado, adecuado para servicios con muchas decisiones por segundo.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperacion externa (si/no) antes de lanzar la busqueda, reduciendo llamadas innecesarias.

## Benchmarks y rendimiento

Resultados publicados en la model card, con el mismo prompt y lectura para ambos modelos, en un unico forward pass:

| Benchmark | Qwen3-4B | Tacit-4B | Diferencia |
|---|---|---|---|
| JevBench (conjunto publico, 231) | 0.658 | 0.723 | +6.5 pts |
| bev-decision (test split, 46.320) | 0.619 | 0.663 | +4.4 pts |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en FP16/BF16 para los 4.022 millones de parametros; en cuantizacion de 8 bits alrededor de 4-5 GB; en 4 bits alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con vLLM; RTX 4090 o RTX 3090 para desarrollo y cargas moderadas en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion y en 12-16 GB en precision completa.
- Opciones de despliegue: `transformers` (motor nativo), vLLM embebido (`engine="vllm"`), vLLM como servidor (`vllm serve`) con el gateway HTTP incluido en el repositorio, y Text Generation Inference por la compatibilidad declarada con `text-generation-inference`.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno de un solo forward pass y el soporte de vLLM apuntan a latencias bajas, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tacit-4B | 4.022 M | no disponible | Decision tipada con autodestilacion | Apache-2.0 | Hugging Face |
| Qwen3-4B | 4.000 M aprox. | no disponible | LLM generativo generalista | Apache-2.0 | Hugging Face |
| Alternativas de clasificacion dedicadas | no disponible | no disponible | Clasificadores supervisados | no disponible | no disponible |

La comparativa directa mas relevante es con su modelo base Qwen3-4B: Tacit-4B mejora en 6,5 puntos en JevBench y 4,4 puntos en bev-decision en un unico forward pass, a costa de especializarse en decisiones tipadas y perder flexibilidad generativa general. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en estado preview: la propia model card lo etiqueta como tal, con adopcion muy baja (935 descargas, 1 like) y sin validacion independiente conocida.
- Especializacion estrecha: no esta pensado como LLM generativo general; su uso como causal LM estandar es posible pero no es su funcion principal.
- Riesgo de alucinacion en la salida probabilistica: en vLLM las etiquetas se leen de las 20 log-probabilidades principales del vocabulario, y una etiqueta fuera de ellas se cuenta como 0, lo que puede infraestimar opciones validas.
- Dependencia del modo adaptativo: el escalado a razonamiento consume hasta 8192 tokens por decision, con impacto en latencia y coste si `max_cot_share` no se configura adecuadamente.
- Idiomas no declarados: aunque hereda el multilingue de Qwen3-4B, no hay evaluacion publicada de su rendimiento en castellano ni en otras lenguas.
- Sesgos: no documentados; al derivar de Qwen3-4B puede heredar los sesgos del modelo base, no evaluados en la model card.
- Licencia Apache-2.0 permisiva para uso comercial, sujeta a las condiciones de la licencia y a las del modelo base Qwen3-4B.
- Ausencia de benchmarks estandar (MMLU, HumanEval, GSM8K): la evaluacion se limita a JevBench y bev-decision, ambos centrados en decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morriszjm/Tacit-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del codigo auxiliar: incluido en el propio repositorio de Hugging Face (`tacit_decision.py`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
