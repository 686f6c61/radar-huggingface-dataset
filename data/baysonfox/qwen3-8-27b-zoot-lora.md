# baysonfox/Qwen3.8-27B-ZOOT-LoRA

## Resumen

Qwen3.8-27B-ZOOT-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario baysonfox sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (rank 16) que se cargan sobre el backbone de 27.000 millones de parametros para especializarlo en el ecosistema ZOOT, un sistema de rol interpretativo y narrativa interactiva ambientado en el universo de Arknights (Terra). El adaptador se ha obtenido mediante destilacion de logits con cambio de tokenizador (cross-tokenizer logit distillation) desde un modelo profesor denominado DeepSeek V4 Flash Vision Exp.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de destilacion poco habitual en adaptadores pequenos: en lugar de un ajuste supervisado clasico con etiquetas duras, se transfieren las distribuciones de probabilidad del profesor al alumno, lo que permite heredar estilo conversacional, razonamiento explicito en bloques `<think>` y generacion de JSON estructurado. Por otro lado, sirve como ejemplo de adaptador de dominio muy acotado (80 % conversacion, 20 % tareas) con una ventana de contexto declarada de 16.384 tokens.

El repositorio ocupa aproximadamente 0,5 GB y acumula 24 descargas en el momento de la consulta, con licencia Apache 2.0. Los idiomas declarados son chino (zh) e ingles (en), y la libreria de referencia es peft junto con transformers y trl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal (Qwen3.8-27B, backbone de texto `Qwen3_5ForCausalLM`) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 27B en su denominacion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 16.384 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base Qwen/Qwen3.8-27B |
| Rank / alpha de LoRA | r = 16, lora_alpha = 32, lora_dropout = 0.0 |
| Modelo profesor | DeepSeek V4 Flash Vision Exp |
| Mezcla de datos | 80 % chat + 20 % tareas |
| Formato de razonamiento | `<think>\n...\n</think>\n\n{...}` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el backbone de texto del modelo Qwen3.8-27B. Segun la model card, al cargar el modelo base mediante `AutoModelForCausalLM` se carga unicamente la torre de texto (`Qwen3_5ForCausalLM`) y se omite la torre de vision no utilizada, lo que sugiere que el modelo base es multimodal pero el adaptador solo afecta a la parte linguistica. La configuracion LoRA es de rango bajo (r = 16, alpha = 32, dropout = 0.0), lo que mantiene el adaptador ligero (repo de 0,5 GB) y compatible con despliegues que sirven el base por separado.

El entrenamiento no sigue un SFT convencional con etiquetas duras, sino una destilacion de logits entre tokenizadores distintos (cross-tokenizer logit distillation) desde el profesor DeepSeek V4 Flash Vision Exp. La model card remite a la documentacion de TRL sobre `gold_trainer` como referencia tecnica del procedimiento. El conjunto de datos combina un 80 % de muestras conversacionales y un 20 % de tareas estructuradas, con soporte declarado para interacciones multi-turno y tareas narrativas de hasta 16.384 tokens. El formato de salida esperado incluye un bloque de razonamiento `<think>...</think>` seguido de un cuerpo JSON con campos como `reply`, `trust` y `mood`.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a rol interpretativo de personajes del universo Arknights (operadores de Rhodes Island y afines).
- Razonamiento explicito mediante bloques `<think>...</think>` antes de la respuesta final.
- Generacion de JSON estructurado con campos definidos por el ecosistema ZOOT (`reply` con tipos `scenario` y `dialogue`, `trust`, `mood`).
- Soporte de tareas narrativas estructuradas ademas de la conversacion pura (mezcla 80/20).
- Capacidad multilingue limitada a chino e ingles.
- Integracion con tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles como funcion declarada; el bloque `<think>` aporta razonamiento interno, pero no se documenta un bucle de agente.
- Capacidades de vision o audio: no disponibles en el adaptador (aunque el base parece tener torre de vision, el adaptador no la entrena).

## Casos de uso

- Simulacion de personajes para videojuegos o narrativa interactiva: el adaptador genera respuestas en JSON con escenario y dialogo separados, lo que permite a un motor de juego renderizar la escena y el texto de forma independiente. Es adecuado porque el formato de salida esta fijado por entrenamiento.
- Chatbots de rol para comunidades de fans de Arknights: el modelo mantiene la voz del personaje y el estado de confianza (`trust`) y animo (`mood`) a lo largo de conversaciones multi-turno de hasta 16.384 tokens.
- Generacion de guiones narrativos estructurados: el 20 % de muestras de tarea permite producir tramas con escenario y dialogo en un solo paso, util para prototipado rapido de contenido.
- Sistemas de companero virtual con memoria de contexto largo: la ventana de 16.384 tokens permite conservar el historial de una sesion extensa sin truncar, lo que es util para experiencias de rol persistentes.
- Evaluacion de tecnicas de destilacion entre tokenizadores: el adaptador sirve como caso de estudio reproducible de cross-tokenizer logit distillation con TRL `gold_trainer`.
- Prototipado de agentes con salida estructurada: el JSON forzado por entrenamiento simplifica el parseo en pipelines downstream, aunque conviene eliminar antes el bloque `<think>`.
- Demostraciones de despliegue LoRA con vLLM: la model card incluye un comando `vllm serve` con `--enable-lora` y `--max-lora-rank 16`, util para validar infraestructura de adaptadores multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo ocupa aproximadamente 0,5 GB en disco; el coste real de inferencia lo determina el modelo base Qwen3.8-27B.
- VRAM estimada para el base en bfloat16: alrededor de 54 GB solo para pesos, mas cache KV para 16.384 tokens; en cuantizacion de 8 bits se reduce a unos 27 GB y en 4 bits a unos 14 GB, aunque estas cifras son estimaciones y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o multiples GPU con `device_map="auto"`.
- En GPU de consumo: un base de 27B en 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion agresiva; no confirmado para este adaptador.
- Opciones de despliegue documentadas: vLLM con `--enable-lora` (recomendado por el autor) y `transformers` + `peft` con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ZOOT-LoRA | Adaptador LoRA sobre Qwen3.8-27B | Base 27B (adaptador r=16) | 16.384 | Apache 2.0 | Especializado en rol Arknights/ZOOT; destilado de DeepSeek V4 Flash Vision Exp |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo generalista; el adaptador puede degradar su rendimiento en tareas generales |
| Alternativas de rol especializadas | No disponible | No disponible | No disponible | No disponible | No se dispone de comparables directos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta ajustado especificamente para prompts y tareas ZOOT; su rendimiento en benchmarks generales puede diferir del modelo base.
- Las aplicaciones downstream deben eliminar o parsear el bloque `<think>...</think>` antes de decodificar el cuerpo JSON, segun advierte el propio autor.
- Idiomas soportados limitados a chino e ingles; no se declara castellano ni otros idiomas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un modelo de rol, puede generar contenido narrativo ficticio que no debe tratarse como factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la informacion proporcionada.
- El adaptador depende de `trust_remote_code=True` en los ejemplos del autor, lo que implica ejecutar codigo del repositorio base.
- El repositorio tiene muy poca traccion (24 descargas, 0 likes) y fue creado y actualizado el mismo dia, lo que reduce la evidencia de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baysonfox/Qwen3.8-27B-ZOOT-LoRA
- Model card en chino: https://huggingface.co/baysonfox/Qwen3.8-27B-ZOOT-LoRA/README_zh.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de TRL sobre `gold_trainer`: https://huggingface.co/docs/trl/gold_trainer
