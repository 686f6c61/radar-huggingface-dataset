# AtomicChat/Maxwell-V1-Flash-Uncensored-GGUF

## Resumen

Maxwell-V1-Flash-Uncensored-GGUF es un adaptador LoRA de rango 1 publicado por AtomicChat que elimina la direccion de rechazo (refusal direction) del modelo base Maxwell-V1-Flash, desarrollado por el equipo Maxwell bajo licencia Apache-2.0. El adaptador se distribuye en formato GGUF (113 MB) y esta pensado para aplicarse sobre las builds GGUF del modelo base publicadas por el mismo autor, desde BF16 hasta AD-Q4_K-IQ4_XS. La tecnica empleada es abliteration: en cada uno de los 45 bloques del transformer se proyecta fuera la direccion de rechazo calculada como la diferencia entre las activaciones medias ante prompts daninos y prompts inofensivos, con la media de los inofensivos proyectada fuera.

El modelo base Maxwell-V1-Flash es un transformer con arquitectura MoE (mezcla de expertos), segun se deduce de las referencias a "shared and routed experts" y a la necesidad de un port especifico de llama.cpp con soporte Maxwell. El adaptador modifica 133 puntos de escritura en los residual streams: salida de atencion, FFNs densas, expertos compartidos y enrutados, y embeddings de tokens. El objetivo es eliminar el comportamiento de rechazo del modelo base sin degradar de forma significativa sus capacidades generales.

La relevancia actual del modelo radica en que demuestra un enfoque medible y transparente de la abliteration: el autor publica las puertas (gates) de calidad a las que somete al adaptador, los resultados obtenidos y los dos criterios que no supera (validez de tool calls y divergencia KL respecto al original). Es un caso practico de como evaluar un modelo "uncensored" con metricas objetivas en lugar de afirmaciones vagas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (segun referencias a expertos compartidos y enrutados en la model card); adaptador LoRA de rango 1 |
| Parametros totales | 28.157.952 (dato de safetensors del modelo base); el adaptador LoRA pesa 113 MB |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor de `-c` en el ejemplo de ejecucion de llama.cpp) |
| Tipos de cuantizacion | BF16, AD-Q4_K-IQ4_XS (mencionados); el adaptador se aplica sobre cualquier GGUF de las builds de AtomicChat |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA en GGUF, 113 MB); requiere llama.cpp con port Maxwell |

## Arquitectura y entrenamiento

El modelo base Maxwell-V1-Flash es un transformer con arquitectura de mezcla de expertos (MoE), con expertos compartidos y enrutados, y un total de 45 bloques. El adaptador es un LoRA de rango 1 entrenado mediante abliteration: para cada bloque se calcula la direccion de rechazo como la diferencia entre las activaciones medias en prompts daninos y prompts inofensivos, proyectando fuera la media de los inofensivos. Esa direccion se resta de los 133 lugares que escriben en los residual streams: salida de atencion, FFNs densas, expertos compartidos y enrutados, y embeddings de tokens.

El adaptador se entreno a partir del split de entrenamiento del dataset `mlabonne/harmful_behaviors` y se evaluo con el split de test del mismo dataset, XSTest para sobre-rechazo y 2.000 preguntas de MMLU. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable es la aplicacion quirurgica por bloque de la direccion de rechazo, con medicion de divergencia KL frente a una edicion aleatoria de la misma magnitud como control.

## Capacidades

- Generacion de texto y razonamiento: el modelo base conserva MMLU de 75,10% (sin adaptador) y 74,35% (con adaptador), una caida de 0,75 puntos no significativa (McNemar p = 0,31).
- Modo thinking: activado por defecto; se puede desactivar enviando `"chat_template_kwargs": {"enable_thinking": false}`.
- Tool calling / function calling: soportado, aunque el adaptador reduce la validez de 13/20 a 10/20 llamadas correctas en la muestra medida.
- Razonamiento multi-paso: el modo thinking permite cadenas de razonamiento internas con un presupuesto de hasta 3.072 tokens en las pruebas.
- Contexto largo: recuperacion correcta en la prueba de aguja en un pajar de 30.000 tokens (3/3 con y sin adaptador).
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.
- Eliminacion del comportamiento de rechazo: 2,5% de rechazos ante prompts daninos con thinking off (frente a 87,7% del original) y 0% con thinking on.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el adaptador sirve como caso de estudio reproducible para medir el efecto de proyectar fuera la direccion de rechazo en un MoE, con metricas publicadas de MMLU, XSTest, KL y tool calls que permiten comparar tecnicas.
- Evaluacion de robustez de filtros de seguridad: permite generar respuestas que un modelo alineado rechazaria, util para probar clasificadores de contenido y sistemas de moderacion en pipelines de investigacion controlada.
- Despliegue local offline: gracias al formato GGUF y a su tamano reducido (113 MB de adaptador), se integra en llama.cpp con el port Maxwell para ejecucion en local sin conexion, dentro de la aplicacion Atomic Chat.
- Analisis de sesgos y comportamiento limite: al eliminar el rechazo se pueden estudiar las respuestas del modelo base ante prompts sensibles y documentar sesgos residuales, con la advertencia de que el contenido generado puede ser danino.
- Pruebas de regresion de tool calling: el deterioro medido (13/20 a 10/20) lo convierte en un caso util para validar arneses de evaluacion de function calling en modelos abliterated.
- Experimentacion con LoRA sobre GGUF: el adaptador demuestra el flujo de aplicar un LoRA de rango 1 sobre cuantizaciones Q4_K e IQ4_XS en llama.cpp, util para quien quiera replicar la tecnica con otros modelos.
- Comparacion de modos thinking on/off: permite medir el impacto del razonamiento interno en la tasa de rechazo (2,5% con thinking off frente a 0% con thinking on en la muestra de 30 prompts).

## Benchmarks y rendimiento

| Prueba | Original | Con adaptador | Puerta | Resultado |
|---|---:|---:|---|---|
| Prompts daninos rechazados, thinking off (81) | 71 (87,7%) | 2 (2,5%) | maximo 3% | pasa |
| Prompts daninos rechazados, thinking on, 3.072 tokens (30) | 29 | 0 | maximo 1 | pasa |
| Prompts seguros XSTest rechazados (250) | 12 (4,8%) | 0 | maximo original + 1 pt | pasa |
| Respuestas vacias | 0% | 0,5% | maximo 1% | pasa |
| Prompts inofensivos con thinking no cerrado en 3.072 tokens (30) | 0 | 1 | maximo original + 1 | pasa |
| MMLU, 2.000 preguntas | 75,10% | 74,35% (-0,75 pt, McNemar p = 0,31) | sin caida significativa | pasa |
| Aguja en pajar de 30K tokens (3) | 3 | 3 | igual que el original | pasa |
| Tool calls validas (20) | 13 | 10 | dentro de 1 | falla |
| KL del primer token en prompts inofensivos | - | 0,48 (edicion aleatoria: 0,36) | 0,10; juzgado contra edicion aleatoria | ver nota |
| KLD respecto al original, texto neutro | - | 0,216 (edicion aleatoria: 0,076) | 0,05 | falla |

En la cuantizacion AD-Q4_K-IQ4_XS con adaptador y thinking off: de los primeros 20 prompts daninos del test, 19 fueron rechazados sin adaptador y 0 con el; de 20 prompts inofensivos, 0 y 0 rechazos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base tiene 28,2 millones de parametros (dato de safetensors), lo que sugiere un modelo muy pequeno que cabe en cualquier GPU consumer, pero la cifra no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no se confirma.
- Opciones de despliegue: llama.cpp con el port Maxwell (`maxwell-moe-port.patch` sobre llama.cpp `d3c3e242c`). Stock llama.cpp, LM Studio y Ollama no cargan Maxwell todavia.
- Comando de ejemplo: `./build/bin/llama-server -m Maxwell-V1-Flash-AD-Q4_K-IQ4_XS.gguf --lora Maxwell-V1-Flash-Uncensored-LoRA.gguf --jinja -c 32768 -ngl 99 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash-Uncensored (este) | 28,2 M (base) + LoRA 113 MB | 32.768 | Apache-2.0 | GGUF | Requiere port Maxwell de llama.cpp |
| Maxwell-V1-Flash (base) | 28,2 M | 32.768 | Apache-2.0 | GGUF | Sin abliteration; rechaza 87,7% de prompts daninos |
| Otros modelos abliterated de AtomicChat | no disponible | no disponible | Apache-2.0 (segun patron) | GGUF | Misma metodologia de puertas de calidad |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador elimina el comportamiento de rechazo: puede generar contenido danino, ilegal o eticamente problematico. No debe desplegarse en produccion sin filtros externos de seguridad.
- Falla la puerta de tool calls: 10/20 llamadas validas frente a 13/20 del original, con un intervalo de confianza del 95% que abarca de 9 a 16; la muestra es pequena pero el autor lo reporta como fallo.
- Falla la puerta de divergencia KL: 0,216 en texto neutro (puerta 0,05) y 0,212 en codigo; una edicion aleatoria de la misma magnitud ya da 0,076, por lo que la distribucion del siguiente token de Maxwell es muy sensible a cambios pequenos.
- El KL del primer token en prompts inofensivos es 0,48 (puerta 0,10), 1,3 veces el de una edicion aleatoria (0,36).
- Requiere un port no estandar de llama.cpp: no funciona en llama.cpp stock, LM Studio ni Ollama, lo que limita su adopcion y mantenimiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo thinking puede no cerrarse en 3.072 tokens en 1 de 30 prompts inofensivos.
- Idiomas soportados no documentados.
- El adaptador se construyo con el split de entrenamiento de `mlabonne/harmful_behaviors`, lo que puede introducir sesgo de evaluacion al medirse sobre el split de test del mismo dataset.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado sin rechazo puede incumplir normativas de moderacion de contenido en plataformas publicas.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-Uncensored-GGUF
- Builds GGUF del modelo base por AtomicChat: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF
- Modelo base original: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
