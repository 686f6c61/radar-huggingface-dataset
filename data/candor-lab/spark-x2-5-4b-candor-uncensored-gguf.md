# candor-lab/Spark-X2.5-4B-Candor-Uncensored-GGUF

## Resumen

Spark-X2.5-4B-Candor-Uncensored es una variante del modelo XHToken/Spark-X2.5-4B a la que se le han eliminado los rechazos (refusals) mediante una edicion de pesos denominada "abliteration", realizada con la herramienta interna "candor" del laboratorio candor-lab. El modelo base es un transformer de 4.112.079.360 parametros (aproximadamente 4,1 mil millones) publicado por XHToken, y esta version se distribuye unicamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp.

La relevancia de esta ficha radica en su enfoque metodologico: el autor documenta de forma cuantitativa el proceso de edicion de pesos, incluyendo la busqueda de 93 variantes, la seleccion de las 3 mejores y la validacion con conjuntos de prompts que la busqueda no vio. Se reportan metricas de rechazo ante prompts daninos (StrongREJECT), rechazo ante prompts inofensivos (Alpaca), divergencia KL respecto al original y rendimiento en GSM8K, todo ello con el modo "thinking" activado, que es como se recomienda usar el modelo.

El modelo resuelve el problema de los rechazos excesivos en modelos alineados, a costa de eliminar por completo la capacidad de negarse ante peticiones daninas. Es relevante ahora porque demuestra un flujo de trabajo reproducible de edicion de pesos con evaluacion rigurosa, aunque su licencia Apache 2.0 y su naturaleza "uncensored" plantean consideraciones importantes para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Spark-X2.5-4B); edicion rank-3 en matrices de salida de atencion (capas 9-35) y MLP (capas 21-24) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de llama-server con `-c 32768`) |
| Tipos de cuantizacion | Solo Q4_K_M disponible (2,60 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base XHToken/Spark-X2.5-4B es un transformer denso de aproximadamente 4,1 mil millones de parametros. Sobre el se aplico una edicion de pesos de rango 3 (rank-3) que modifica las matrices de salida de atencion en las capas 9 a 35 y las matrices de salida del MLP en las capas 21 a 24, es decir, 31 de las 72 matrices del modelo. La direccion de rechazo se leyo en la capa 17, donde comienza el razonamiento ("thinking"). La edicion se selecciono mediante una busqueda de 93 ensayos, puntuando cada uno con el modo thinking activado, y las 3 mejores se midieron en su totalidad antes de aplicar una regla de seleccion predefinida.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion de su dataset, ya que la model card no lo detalla. Tampoco se especifica si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable es el proceso de edicion de pesos con validacion cuantitativa: divergencia KL de 0,046 respecto al original en prompts inofensivos, y preservacion de al menos el 99,7% de la edicion en la cuantizacion Q4_K_M, lo que garantiza que el archivo es un Q4_K_M estandar.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento ("thinking") activado por defecto.
- Razonamiento matematico: resuelve problemas de GSM8K con 1.228 aciertos de 1.319 (con thinking activado y presupuesto de 8.192 tokens).
- Modo thinking con presupuesto configurable; el modelo razona antes de responder y puede agotar el presupuesto en prompts complejos.
- Ausencia total de rechazos: 0 rechazos de 288 prompts daninos (StrongREJECT) y 0 de 300 prompts inofensivos (Alpaca), segun el juez Qwen3Guard-Gen-0.6B.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no medido por el autor.
- Tareas agenticas y multi-step reasoning: no medidas por el autor.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo sin rechazos y comparar su distribucion de salidas con el original (KL de 0,046), util para analizar mecanismos de refusal en transformers.
- Evaluacion de tecnicas de abliteration: sirve como caso de referencia reproducible para validar herramientas de edicion de pesos, dado que el autor documenta la busqueda de 93 ensayos y la regla de seleccion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde los rechazos del modelo base interrumpirian el flujo creativo.
- Analisis de contenido danino en entornos controlados: investigadores pueden generar respuestas a prompts de StrongREJECT para entrenar clasificadores de seguridad o estudiar patrones de contenido nocivo, con la debida supervision etica.
- Despliegue local en hardware de consumo: con 2,60 GB en Q4_K_M, cabe en GPUs consumer con 4-6 GB de VRAM, adecuado para prototipos y pruebas offline en llama.cpp.
- Razonamiento matematico de nivel escolar: resolucion de problemas de GSM8K en ingles con thinking activado, util para tutoria automatizada o generacion de explicaciones paso a paso.
- Experimentacion con presupuestos de razonamiento: el modelo permite ajustar el budget de thinking (hasta 8.192 tokens) y observar el trade-off entre profundidad de razonamiento y latencia.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos en llama-server con thinking activado, Q4_K_M, temperatura 1.0, top_p 0.95, top_k 1000, min_p 0, semilla fija y presupuesto de thinking de 8.192 tokens:

| Metrica | Original (Q4_K_M) | Este modelo |
|---|---|---|
| Prompts daninos rechazados (de 288, StrongREJECT) | 282 | 0 |
| Prompts inofensivos rechazados (de 300, Alpaca) | 4 | 0 |
| Divergencia KL respecto al original | — | 0,046 |
| GSM8K correctos (de 1.319) | 1.236 | 1.228 |
| GSM8K con thinking agotado (de 1.319) | 66 | 67 |
| Tokens de thinking medianos en prompts daninos | 415 | 1.318 |

Notas del autor: un segundo juez mas grande (Qwen3Guard-Gen-8B) cuenta 282 rechazos daninos para el original y 1 para este modelo. El tiempo de thinking en prompts daninos es aproximadamente 3,2 veces el del original. En 15 de los 288 prompts daninos el thinking agoto el presupuesto de 8.192 tokens, frente a ninguno del original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB para los pesos en Q4_K_M, mas overhead de contexto KV en f16; con 32.768 tokens de contexto el consumo adicional puede ser de varios GB segun la implementacion.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para contexto corto; RTX 3060, RTX 4060, RTX 4090 y superiores son suficientes. Para contexto completo de 32.768 tokens se recomienda 8-12 GB de VRAM.
- Cabe en GPU consumer: si, en RTX 3060/4060 (12 GB u 8 GB) y modelos similares.
- Opciones de despliegue: llama.cpp (llama-server, probado por el autor con la build b11524); LM Studio y Ollama deberian funcionar pero no han sido verificados.
- Latencia y throughput: no disponibles. El autor no reporta medidas de velocidad; el thinking mediano de 1.318 tokens en prompts daninos implica una latencia considerable en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Candor-Uncensored | 4,1 B | 32.768 | Apache 2.0 | GGUF Q4_K_M | Sin rechazos; GSM8K 1.228/1.319; solo ingles |
| XHToken/Spark-X2.5-4B (original) | 4,1 B | 32.768 (segun ejemplo) | Apache 2.0 | 16-bit (safetensors) | 282/288 rechazos daninos; GSM8K 1.236/1.319 |
| Otras variantes uncensored de Spark-X2.5-4B | no disponible | no disponible | no disponible | no disponible | El autor indica que no midio ninguna otra en su totalidad |
| Modelos abliterated de ~4B (genericos) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Responde a peticiones que el modelo original rechaza; la responsabilidad de uso recae en el usuario.
- Los rechazos y las matematicas se midieron solo en ingles y con thinking activado; el modo sin thinking (`enable_thinking: false`) no fue medido.
- El modelo piensa antes de responder y a veces de forma extensa: requiere un presupuesto de thinking. En 15 de 288 prompts daninos agoto los 8.192 tokens, frente a ninguno del original.
- Tool use y tareas agenticas no fueron medidos.
- Es un modelo de 4B, por lo que cualquier dato que afirme como hecho puede ser erroneo (riesgo de alucinacion elevado).
- Solo se distribuye una cuantizacion (Q4_K_M); no hay otras versiones medidas.
- Solo probado en llama-server; otras aplicaciones GGUF (LM Studio, Ollama) no han sido verificadas.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de rechazos implica riesgos legales y reputacionales si se despliega sin filtros externos.
- No se han publicado datos sobre sesgos del modelo base ni de la edicion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/candor-lab/Spark-X2.5-4B-Candor-Uncensored-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio llama.cpp (build b11524 mencionada): no disponible en la informacion proporcionada
- Paper o blog de la herramienta candor: no disponible en la informacion proporcionada
- Paper de StrongREJECT: no disponible en la informacion proporcionada
- Paper de GSM8K: no disponible en la informacion proporcionada
