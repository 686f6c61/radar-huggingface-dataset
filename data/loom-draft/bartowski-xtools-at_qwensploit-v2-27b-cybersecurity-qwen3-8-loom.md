# loom-draft/bartowski-xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-loom

## Resumen

`loom-draft/bartowski-xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF`, en su cuantizacion Q4_K_M. El autor del paquete es `loom-draft` y el generador empleado es `loom-next`, sin intervencion de un LLM en el proceso. El objetivo no es publicar un modelo nuevo, sino empaquetar un GGUF existente para su ejecucion optimizada sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un derivado afinado de la familia Qwen3 de 27B (según la nomenclatura del checkpoint), orientado a ciberseguridad y con capacidad de vision, ya que el pipeline declarado es `image-text-to-text` y el paquete incluye un proyector multimodal `mmproj-...-bf16.gguf`. El paquete anade decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, soporte de tool calling estilo OpenAI, modo de razonamiento configurable (`reasoning_effort`: low, medium, xhigh) y una ventana de contexto de 262.144 tokens por peticion.

Su relevancia es acotada pero clara: demuestra la viabilidad de servir un modelo de 27B con vision y contexto largo sobre hardware AMD de consumo y profesional mediante el stack Loom v0.2.0, sin recompilar el GGUF. No obstante, el repositorio tiene 0 descargas y 0 likes, el tamano declarado es de 0,0 GB y todas las puertas de validacion (kernel_tests, golden, compare, vision, spec, agent, sampling, logits) figuran como "not yet re-measured", por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (derivado); detalles exactos no disponibles |
| Parametros totales | 27B (según nomenclatura del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar terminos) |
| Formato de pesos | GGUF (Q4_K_M) + paquete Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base. Por la nomenclatura del checkpoint (`Qwen3.8`, 27B) y el pipeline `image-text-to-text`, se infiere un transformer decoder-only de la familia Qwen3 con adaptador multimodal y proyector de vision separado, pero el repositorio no documenta numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF, DPO o fine-tuning especifico para ciberseguridad. El sufijo `Qwensploit-V2-CyberSecurity` sugiere un ajuste orientado a tareas ofensivas o de analisis de seguridad, aunque no se detalla su procedencia ni su metodologia.

La innovacion tecnica del paquete Loom reside en la capa de serving, no en el modelo: kernels generados para AMD (gfx1151 y gfx1201), decodificacion especulativa MTP con profundidad 3 activada por defecto, pooling de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). El flag `completion_spin_ns=4294967295` habilita espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo. No hay datos publicados sobre el proceso de cuantizacion mas alla de la etiqueta Q4_K_M.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento con `reasoning_effort` en tres niveles: low, medium y xhigh (por defecto xhigh).
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls` en la API `/v1/chat/completions`.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, usando el proyector `mmproj-xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-bf16.gguf`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Contexto largo de hasta 262.144 tokens por peticion y hasta 4 peticiones concurrentes.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de audio ni de salida de audio (marcado como "not applicable").
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de codigo y configuraciones en busca de vulnerabilidades: el ajuste declarado en ciberseguridad y la ventana de 262.144 tokens permiten cargar modulos o ficheros de configuracion completos en una sola peticion y solicitar un informe de riesgos.
- Triaje de alertas SIEM con tool calling: el modelo puede invocar herramientas de consulta de logs o de enriquecimiento de IoCs dentro de un bucle agente multi-turno, con `reasoning_effort` ajustable segun la criticidad de la alerta.
- Revision de capturas de pantalla o diagramas de red: la entrada de imagenes via `image_url` permite adjuntar topologias, paneles de consola o capturas de trafico para su interpretacion junto a texto.
- Asistencia a analistas en respuesta a incidentes: con contexto largo se pueden pasar transcripciones de sesiones, salidas de comandos y notas previas, y obtener resumenes o siguientes pasos con razonamiento explicito.
- Generacion de reglas de deteccion (Sigma, YARA, Suricata): el modo thinking y el tool calling permiten iterar sobre borradores validando sintaxis contra herramientas externas.
- Despliegue en estaciones de trabajo AMD: al ejecutarse sobre Strix Halo o R9700 con Loom, encaja en entornos donde no hay GPUs NVIDIA y se quiere evitar la dependencia de CUDA.
- Servicio local con concurrencia limitada: con 4 peticiones simultaneas y salida de 4.096 tokens, es adecuado para equipos pequenos o uso individual, no para alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Tampoco hay datos de MMLU, HumanEval, GSM8K ni de las puertas de validacion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`), todas marcadas como pendientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Un checkpoint de 27B en Q4_K_M ocupa del orden de 16-17 GB de pesos, mas el proyector de vision en bf16 y las estructuras de contexto; el paquete esta pensado para GPUs con al menos 32 GB.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete Loom, que genera kernels para AMD; para esas GPUs habria que usar el GGUF original con llama.cpp u otro runtime.
- Cabe en GPU de consumo: si, en el caso de Strix Halo como APU con memoria unificada; en el caso de GPUs dedicadas se requiere el segmento de 32 GB.
- Opciones de despliegue: `loom-serve` (stack Loom v0.2.0, instalado via `pipx install "hrx-loom[hf]==0.2.0"`), con API compatible con OpenAI en `/v1/chat/completions`. El GGUF original puede servirse tambien con llama.cpp.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Loom, Qwen3 27B CyberSecurity) | 27B | 262.144 | Si | other | Paquete Loom para AMD gfx1151/gfx1201 |
| GGUF original `bartowski/xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF` | 27B | no disponible | Si (proyector mmproj) | other | GGUF generico, compatible con llama.cpp |
| Familia Qwen3 base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y formato de distribucion.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas, 0 likes, repositorio de 0,0 GB y creado y actualizado con tres segundos de diferencia, lo que sugiere una publicacion automatizada sin validacion posterior.
- Ninguna de las puertas de correctitud ha sido re-medida; no hay garantia de que la salida coincida con la referencia de llama.cpp ni de que la decodificacion especulativa sea exacta.
- La licencia es "other" sin terminos especificados: no se puede asumir uso comercial permitido sin consultar la licencia del modelo base y del checkpoint original.
- El ajuste esta orientado a ciberseguridad, lo que puede implicar sesgos hacia terminologia ofensiva y un mayor riesgo de respuestas duales en contextos de seguridad; requiere supervision humana.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados ni evaluaciones de fidelidad.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Contexto maximo de 262.144 tokens declarado, pero sin validacion publicada de degradacion en ventanas largas.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens: no apto para cargas de alta concurrencia.
- Dependencia de un stack concreto (Loom 0.2.0) y de hardware AMD especifico; no hay soporte declarado para NVIDIA ni para otros aceleradores.
- El flag `completion_spin_ns=4294967295` consume CPU de forma activa durante la inferencia, lo que puede afectar a la latencia del sistema en equipos compartidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/xtools-at_Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- Stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
