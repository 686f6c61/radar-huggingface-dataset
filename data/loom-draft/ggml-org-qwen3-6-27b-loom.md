# loom-draft/ggml-org-Qwen3.6-27B-loom

## Resumen

`loom-draft/ggml-org-Qwen3.6-27B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Qwen3.6-27B-GGUF`, en su cuantizacion `Q4_K_M`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de Qwen3.6-27B a programas ejecutables sobre el runtime Loom de AMD, orientado especificamente a las GPU integradas Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y a la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Qwen3.6-27B, es un transformer multimodal de ~27 mil millones de parametros con entrada de imagen (pipeline `image-text-to-text`), plantilla de chat con modo de razonamiento activado por defecto y una ventana de contexto de 262.144 tokens por peticion. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, hasta 4 peticiones concurrentes y un limite de 4.096 tokens de salida por defecto.

Su relevancia es acotada pero concreta: permite servir un modelo de 27B en cuantizacion Q4_K_M sobre hardware AMD consumer y de estacion de trabajo sin depender de CUDA, usando kernels generados por `loom-next` (sin LLM en el bucle de generacion). La tarjeta advierte de que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura interna del checkpoint base no detallada en la informacion disponible |
| Parametros totales | 27B (segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 (`mmproj-Qwen3.6-27B-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `weights.loom`; incluye `tokenizer.json` y `model.json` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica pesos: parte del GGUF `Qwen3.6-27B-Q4_K_M.gguf` de `ggml-org` y genera, mediante la herramienta `loom-next`, un conjunto de programas `.loom` y un fichero `weights.loom` que el runtime `loom-serve` ejecuta sobre GPU AMD. La arquitectura efectiva es la del checkpoint Qwen3.6-27B original (transformer multimodal con proyector de vision separado en BF16), pero la informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF, DPO o similares.

Como innovaciones tecnicas del empaquetado destacan: kernels generados especificamente para gfx1151 (Strix Halo) y gfx1201 (R9700); un pool de memoria de respaldo fijo (`--pool_backing=fixed`) que reserva la memoria por adelantado en lugar de crecer de forma elastica; carga de pesos en modo `preload` en el host; espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo; y verificacion sha256 de los ficheros fuente fijados en `model.json.lock`. La decodificacion especulativa figura como no aplicable en este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen mediante partes `image_url` al estilo OpenAI, usando el proyector `mmproj-Qwen3.6-27B-BF16.gguf`.
- Tool calling / function calling al estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos.
- Salida limitada a 4.096 tokens por defecto (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida).
- Sin decodificacion especulativa ni ajuste de "reasoning effort" (no aplicables en este paquete).
- Idiomas soportados no documentados en la informacion disponible.

## Casos de uso

- Asistente documental de contexto largo: con 262.144 tokens por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola llamada y responder preguntas sobre ellos sin trocear el material.
- Analisis de documentos escaneados o capturas: la entrada de imagen via `image_url` permite extraer y razonar sobre contenido visual (facturas, diagramas, pantallazos) combinado con texto.
- Agente de automatizacion con herramientas: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir agentes que consulten APIs, ejecuten busquedas o modifiquen sistemas, con el modo thinking activo para planificacion.
- Despliegue en estacion de trabajo AMD: sobre una Radeon AI PRO R9700 de 32 GB, el paquete Q4_K_M cabe en VRAM y ofrece un endpoint compatible con OpenAI para prototipado local sin CUDA.
- Inferencia en mini-PC con GPU integrada: en un Ryzen AI Max+ 395 "Strix Halo" (gfx1151) se puede servir el modelo de forma local para tareas de asistencia y generacion de codigo en entornos sin GPU discreta.
- Backend de chat para equipos pequenos: con 4 peticiones concurrentes y limite de 4.096 tokens de salida, es viable como servicio interno de baja/media carga para resumen, redaccion y Q&A.
- Evaluacion comparativa de runtimes: util para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que la tarjeta define puertas de correccion (`golden`, `compare`, `vision`, `agent`, `logits`, etc.) pensadas para esa comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 27B, lo que situa los pesos en el rango de ~16-18 GB; a ello se suma el proyector de vision en BF16 y el pool de memoria fijo del runtime. La cifra exacta no esta documentada en la informacion disponible.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon consumer distintas de las citadas; el paquete esta generado para las arquitecturas AMD indicadas.
- Despliegue: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`; descarga del paquete con `loom-fetch`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto (aunque el GGUF base si es propio de llama.cpp).
- Opciones de ejecucion relevantes: `--pool_backing=fixed` (reserva anticipada de memoria), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa en GPU, consume CPU).
- Latencia y throughput: no disponibles; la tarjeta no incluye cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime / formato |
|---|---|---|---|---|---|
| `loom-draft/ggml-org-Qwen3.6-27B-loom` (este) | 27B | 262.144 tokens | Si (imagen) | Apache 2.0 | Loom (`loom-serve`), GPU AMD gfx1151/gfx1201 |
| `ggml-org/Qwen3.6-27B-GGUF` (base) | 27B | 262.144 tokens (segun este paquete) | Si (imagen via mmproj) | Apache 2.0 | GGUF; ejecutable con llama.cpp y derivados |
| Alternativas de ~27B en formato GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el propio checkpoint base: mismo modelo y licencia, pero distinto runtime. Este paquete anade kernels especificos para AMD y una API compatible con OpenAI, a costa de atarse al ecosistema Loom y de no contar aun con mediciones publicadas de rendimiento ni de correccion.

## Limitaciones y advertencias

- Paquete sin validacion publicada: todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Es un artefacto de empaquetado, no un modelo entrenado: hereda integramente los sesgos, alucinaciones y limitaciones del checkpoint Qwen3.6-27B original, que no se documentan en la informacion disponible.
- Restriccion de hardware: solo se declara soporte para gfx1151 (Strix Halo) y gfx1201 (R9700); no hay garantia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Dependencia del ecosistema Loom (`hrx-loom==0.2.0`, `loom-fetch`, `loom-serve`), con version fijada; cambios de version pueden romper el paquete.
- Limite de salida de 4.096 tokens por defecto, insuficiente para generaciones largas sin ajustar el preset.
- Concurrencia maxima de 4 peticiones, lo que limita el uso como servicio de alta carga.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue mas alla de lo que ofrezca el modelo base.
- La espera activa en GPU (`completion_spin_ns=4294967295`) consume CPU de forma continua mientras hay trabajo en vuelo, lo que puede afectar a despliegues con CPU limitada.
- Licencia Apache 2.0 en el paquete y en el modelo base, lo que en principio permite uso comercial; conviene verificar igualmente los terminos del checkpoint `ggml-org/Qwen3.6-27B-GGUF` en su repositorio original.
- Cero descargas y cero "likes" en el momento de la consulta: paquete recien publicado, sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/ggml-org-Qwen3.6-27B-loom
- Checkpoint base en Hugging Face: https://huggingface.co/ggml-org/Qwen3.6-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
