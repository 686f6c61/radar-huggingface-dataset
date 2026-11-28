# AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por AtomicChat sobre el modelo base Ternary-Bonsai-2.5-27B de PrismML. No se trata de un modelo completo, sino de un adaptador de rango uno que se aplica en tiempo de inferencia sobre el fichero PTQ1_0 original (5,99 GB) sin modificar ni recuantizar los pesos base. El adaptador pesa 8,67 MB y su funcion declarada es eliminar los rechazos (refusals) del modelo base en prompts que este declinaba responder.

El modelo base emplea cuantizacion ternaria (PTQ1_0), una tecnica de compresion extrema que reduce los pesos a valores de {-1, 0, +1} con escalas, lo que permite ejecutar un modelo nominal de 27B en un espacio de almacenamiento muy reducido. La ficha de Hugging Face reporta 2.162.688 parametros en safetensors, un dato que no es coherente con la denominacion "27B" del modelo y que probablemente refleja solo el adaptador o un recuento parcial; se indica como "no disponible" cualquier interpretacion fiable al respecto.

La relevancia de esta publicacion es doble: por un lado, demuestra una tecnica de edicion de comportamiento (eliminacion de rechazos) mediante un adaptador minimo que no toca los pesos base; por otro, valida el ecosistema de cuantizacion ternaria con un runtime especifico (fork de llama.cpp de PrismML). La licencia es Apache 2.0 y el pipeline declarado es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango uno) sobre modelo base transformer cuantizado en ternario (PTQ1_0); arquitectura del base no detallada en la informacion disponible |
| Parametros totales | 2.162.688 (dato reportado en safetensors; no coherente con la denominacion 27B del base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (ternaria) en el modelo base; adaptador LoRA en GGUF |
| Idiomas soportados | no disponible (la evaluacion inicial uso prompts en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA de 8,67 MB) sobre base GGUF PTQ1_0 de 5,99 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango uno que aplica una proyeccion residual en 128 puntos durante la inferencia. Segun la model card, no se realizo ninguna edicion de los pesos base ni recuantizacion: el fichero PTQ1_0 original de PrismML se usa byte a byte y el adaptador se superpone con un factor de escala configurable (recomendado 1.25 al arrancar). Esta tecnica permite modificar el comportamiento del modelo sin duplicar el coste de almacenamiento del base.

El modelo base emplea cuantizacion ternaria post-entrenamiento (PTQ1_0), que representa los pesos con valores ternarios y escalas por grupo. No se dispone de informacion sobre el dataset de entrenamiento del base, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. Tampoco se detalla el proceso de entrenamiento del adaptador (datos, epochs, funcion de perdida) mas alla de su naturaleza de rango uno y su objetivo de suprimir rechazos. La evaluacion inicial se realizo con decodificacion greedy, presupuesto de 48 tokens y modo thinking desactivado.

## Capacidades

- Generacion de texto en ingles (unico idioma evaluado en la model card).
- Supresion de rechazos: en 24 prompts de rechazo retenidos, el base rechazo 24/24 y el adaptador 0/24, manteniendo 24 respuestas no vacias y no degeneradas.
- Preservacion de comportamiento en prompts benignos: 0 rechazos en el base y 0 con el adaptador sobre 24 prompts benignos.
- Control de escala cero: con escala 0 se reprodujeron exactamente 46 de 48 respuestas, incluido el motivo de parada, lo que indica que el adaptador no altera el comportamiento cuando se desactiva.
- Razonamiento y conocimiento general: ambos variantes obtuvieron 401/500 (80,2%) en una prueba MMLU emparejada de 500 preguntas.
- Soporte de tool calling y comportamiento en contexto largo: pendiente de evaluacion segun la model card.
- Capacidades multimodales, de audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre edicion de comportamiento en modelos cuantizados: el adaptador permite estudiar como un LoRA de rango uno suprime rechazos sin tocar los pesos base, comparando el base y el adaptador con la misma semilla y decodificacion greedy.
- Despliegue local de bajo consumo: al combinarse con el base PTQ1_0 de 5,99 GB, el conjunto cabe en equipos con recursos limitados, y el adaptador de 8,67 MB anade un coste de almacenamiento despreciable.
- Evaluacion de seguridad y alineacion: el par base/adaptador sirve como caso controlado para medir la tasa de rechazos con clasificadores de prefijo sobre conjuntos retenidos, como se hizo con 24 prompts.
- Pruebas de regresion de calidad: la prueba MMLU emparejada de 500 preguntas permite verificar que la supresion de rechazos no degrada el conocimiento general (80,2% en ambos casos).
- Experimentacion con runtimes ternarios: el caso de uso incluye validar el fork de llama.cpp de PrismML (build prism-b12128-d7b2896) y el build de Metal para Apple Silicon en flujos de inferencia local.
- Prototipado de asistentes sin restricciones de rechazo en entornos controlados: util para estudiar el comportamiento del modelo en dominios donde el base declina responder, siempre con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

| Prueba | Base | Adaptador | Detalle |
|---|---|---|---|
| Rechazos en 24 prompts retenidos | 24/24 | 0/24 | Clasificador de prefijo, greedy, 48 tokens, thinking desactivado |
| Rechazos en 24 prompts benignos | 0/24 | 0/24 | Mismo clasificador |
| Control de escala cero | — | 46/48 respuestas identicas | Incluye motivo de parada |
| MMLU emparejado (500 preguntas) | 401/500 (80,2%) | 401/500 (80,2%) | 9 respuestas pasaron de correctas a incorrectas y 9 al contrario |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, contexto largo, tool calling) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base PTQ1_0 ocupa 5,99 GB en disco; el adaptador anade 8,67 MB. La VRAM de inferencia depende de la ventana de contexto y del runtime, pero el almacenamiento de pesos es muy reducido gracias a la cuantizacion ternaria.
- GPU recomendadas: la model card indica que se probo en una NVIDIA A10 con el runtime fijado. No se especifican otras GPU recomendadas.
- GPU de consumo: no se confirma explicitamente que quepa en GPU de consumo; el tamano del base (5,99 GB) sugiere que podria caber en GPUs con 8 GB o mas, pero no hay confirmacion en la informacion disponible.
- Apple Silicon: PrismML publica un build de Metal para Apple Silicon.
- Opciones de despliegue: llama.cpp en el fork de PrismML (build prism-b12128-d7b2896), con `llama-cli` y `--lora-scaled` para aplicar el adaptador. No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored-LoRA (este) | 2.162.688 reportados (adaptador); base 27B nominal | no disponible | 80,2% (500 preguntas) | apache-2.0 | GGUF + LoRA |
| Ternary-Bonsai-2.5-27B (base PrismML) | 27B nominal | no disponible | 80,2% (500 preguntas) | no disponible en esta ficha | GGUF PTQ1_0 |
| Modelos de 27B en cuantizacion estandar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas de la misma categoria mas alla del propio modelo base.

## Limitaciones y advertencias

- El adaptador suprime rechazos de forma deliberada; esto puede producir respuestas a prompts que el modelo base declinaba, con implicaciones de seguridad y cumplimiento normativo.
- La evaluacion inicial se limita a 24 prompts de rechazo y 24 benignos, en ingles y con un clasificador de prefijo; no cubre otros idiomas ni dominios.
- El comportamiento en contexto largo y el soporte de tool calling estan pendientes de evaluacion segun la model card.
- El recuento de parametros reportado (2.162.688) no es coherente con la denominacion 27B del modelo base; conviene tratar la cifra con cautela.
- No se detallan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime de PrismML pueden tener condiciones propias que no se detallan en esta ficha.
- Requiere el fork especifico de llama.cpp de PrismML y un factor de escala concreto (1.25 recomendado); no es portable a runtimes estandar sin verificacion.
- El modelo base usa cuantizacion ternaria, lo que puede implicar perdida de calidad frente al modelo en precision completa; no se aportan datos al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Fichero PTQ1_0 original: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/blob/f71afa90d5f8f07f0518b6105eaf9b50e2c6d210/Ternary-Bonsai-2.5-27B-PTQ1_0.gguf
- Metricas y hashes: https://huggingface.co/datasets/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF-metrics
- Runtime PrismML llama.cpp: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
- Guia de ejecucion local: https://atomic.chat/blog/guides/how-to-run-bonsai-2-5-uncensored-locally
- Guia del Bonsai 2.5 original: https://atomic.chat/blog/guides/how-to-run-bonsai-2-5-locally
- Atomic Chat: https://atomic.chat/
- GitHub Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq
