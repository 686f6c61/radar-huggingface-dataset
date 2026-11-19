# loom-draft/mradermacher-Aura-Prototype-26B-A4B-i1-loom

## Resumen

Aura-Prototype-26B-A4B-i1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/Aura-Prototype-26B-A4B-i1-GGUF`, concretamente la variante `Aura-Prototype-26B-A4B.i1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` dentro del ecosistema Loom, una pila de inferencia para GPUs AMD que compila kernels especificos para cada arquitectura y expone una API compatible con OpenAI. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado y ejecucion.

El modelo subyacente es un prototipo de 26 000 millones de parametros con nomenclatura A4B, es decir, un transformer de mezcla de expertos (MoE) con aproximadamente 4 000 millones de parametros activos por token. El paquete esta orientado a dos destinos de hardware concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La licencia declarada es Apache 2.0 y el contexto maximo por peticion es de 201 728 tokens.

Su relevancia es de nicho pero clara: permite ejecutar un MoE de 26B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional sin depender de CUDA, con soporte de tool calling, modo de razonamiento opcional y cuatro peticiones concurrentes. La contrapartida es que el rendimiento y las puertas de correccion del paquete figuran como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de velocidad ni de fidelidad frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun la nomenclatura A4B del checkpoint base; detalles internos no disponibles |
| Parametros totales | 26B (segun el nombre del checkpoint) |
| Parametros activos | Aproximadamente 4B por token (segun la nomenclatura A4B) |
| Longitud de contexto | 201 728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF), unica variante empaquetada en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dentro de un paquete Loom (`.loom` + `model.json`); el repo pesa 0.0 GB, es decir, no aloja los pesos directamente |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-compatible `/v1/chat/completions` |

## Arquitectura y entrenamiento

La ficha del paquete no documenta el entrenamiento del modelo base: no hay numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo unico deducible del nombre es que se trata de un MoE con 26B totales y unos 4B activos, lo que situa el coste de inferencia por token en el orden de un modelo denso de 4B mientras el estado de pesos ocupa el de un 26B. El checkpoint original procede de `mradermacher/Aura-Prototype-26B-A4B-i1-GGUF`, una conversion a GGUF de un prototipo previo; el paquete Loom no modifica los pesos, solo los empaqueta.

La innovacion tecnica relevante esta en la capa de ejecucion, no en el modelo. Loom genera kernels especificos para la arquitectura AMD objetivo mediante `loom-next`, un generador que trabaja sin LLM en el bucle, y ofrece un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La model card indica explicitamente que la decodificacion especulativa no aplica y que el esfuerzo de razonamiento tampoco.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 201 728 tokens de contexto por peticion.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles de agente multiturno segun las puertas de correccion descritas.
- Modo de razonamiento o thinking desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Concurrencia de 4 peticiones simultaneas con consistencia declarada frente a ejecuciones aisladas.
- Salida limitada a 4096 tokens por respuesta en el preset incluido.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 201 728 tokens por peticion se puede cargar documentacion tecnica extensa, expedientes o historiales completos y mantener la conversacion sin truncar, algo poco habitual en modelos que caben en 32 GB de VRAM.
- Automatizacion de agentes con herramientas: el soporte de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en orquestadores existentes (LangChain, LlamaIndex, SDK de OpenAI) para tareas de consulta a APIs, lectura de ficheros o ejecucion de comandos acotados.
- Procesamiento por lotes en estacion de trabajo AMD: al ejecutarse sobre Strix Halo o R9700 sin CUDA, encaja en equipos de desarrollo con graficos integrados AMD donde no hay GPU NVIDIA disponible.
- Resumen y extraccion sobre corpus largos: la ventana de 201k tokens permite resumir contratos, informes o transcripciones completas en una sola pasada, con la salvedad de que la salida esta limitada a 4096 tokens.
- Prototipado de pipelines RAG: util para validar recuperacion y generacion en local antes de mover la carga a produccion, con la ventaja de que la API es identica a la de OpenAI y el cambio de backend es transparente.
- Evaluacion comparativa de runtimes: sirve como banco de pruebas para medir Loom frente a llama.cpp sobre el mismo GGUF, ya que la model card define puertas de correccion (golden, compare, logits, agent) pensadas exactamente para esa comparacion.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, se puede integrar en productos comerciales sin obligaciones de atribucion mas alla de las habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican literalmente que los resultados "are not yet re-measured". Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como no re-medidas para ambos dispositivos.

## Requisitos de hardware

- VRAM estimada: un MoE de 26B en Q4_K_M ocupa del orden de 15-17 GB de pesos; el paquete esta disenado para la R9700 de 32 GB y para la memoria unificada de Strix Halo, por lo que el margen para cache KV con contexto largo es limitado.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU NVIDIA: no contempladas por este paquete; Loom se apoya en la pila ROCm.
- GPU consumer: no hay confirmacion de funcionamiento en Radeon RX de gama consumer; la model card solo nombra los dos destinos anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.
- Ajustes de rendimiento documentados: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Aura-Prototype-26B-A4B-i1-loom | 26B | ~4B | 201 728 | Apache 2.0 | GGUF empaquetado en Loom, solo AMD | Rendimiento no re-medido |
| Checkpoint base `mradermacher/Aura-Prototype-26B-A4B-i1-GGUF` | 26B | ~4B | no disponible | Apache 2.0 (heredada) | GGUF para llama.cpp y derivados | Mismo peso, sin empaquetado Loom; soporta vision y audio |
| MoE abiertos de tamano comparable (por ejemplo, la familia Qwen MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparacion relevante es contra el propio checkpoint base: este paquete no anade capacidad al modelo, solo un runtime alternativo para hardware AMD con API OpenAI, a cambio de perder las entradas de imagen y audio que el modelo original si admite.

## Limitaciones y advertencias

- El paquete no incluye evidencia de rendimiento ni de correccion: todas las puertas y las comparativas frente a llama.cpp estan sin re-medir, por lo que no hay garantia publicada de que la salida coincida token a token con la referencia.
- Perdida funcional respecto al modelo original: Loom no soporta entrada de imagen ni audio, aunque el checkpoint subyacente si.
- Salida limitada a 4096 tokens, lo que puede ser insuficiente para tareas de generacion larga pese a la ventana de 201k tokens de entrada.
- Concurrencia maxima de 4 peticiones; no es adecuado para servir a muchos usuarios simultaneos sin replicar instancias.
- El estado del muestreo figura como "no determinado", lo que introduce incertidumbre sobre la reproducibilidad con temperature y top_k distintos de los valores por defecto.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y de la version 0.2.0 de `hrx-loom`; no hay declaracion de compatibilidad con otras GPU.
- El repo tiene 0 descargas y 0 likes y un tamano de 0.0 GB: es un artefacto recien publicado sin validacion de la comunidad y sin los pesos alojados en el propio repositorio.
- Sesgos y riesgo de alucinacion del modelo base: no documentados en la informacion disponible; se aplican los habituales de un prototipo sin ficha de entrenamiento publicada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del checkpoint base antes de un uso comercial, ya que este repo solo empaqueta.
- Idiomas soportados no declarados: no se puede asumir un rendimiento correcto en castellano sin evaluacion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Aura-Prototype-26B-A4B-i1-loom
- Checkpoint base en Hugging Face: https://huggingface.co/mradermacher/Aura-Prototype-26B-A4B-i1-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
