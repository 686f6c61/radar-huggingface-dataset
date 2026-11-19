# loom-draft/bartowski-UI-Venus-2-9B-loom

## Resumen

UI-Venus-2-9B-loom es un paquete de despliegue para el checkpoint GGUF `UI-Venus-2-9B-Q4_K_M.gguf` de bartowski, empaquetado por el autor `loom-draft` en el formato Loom (programas `.loom` y una tarjeta `model.json`) para su ejecución sobre GPUs AMD. El modelo subyacente es un modelo multimodal de tipo image-text-to-text de 9B parámetros, derivado de UI-Venus-2, orientado a tareas de comprensión de interfaces de usuario y conversación con imágenes.

El paquete no contiene pesos nuevos ni un fine-tuning propio: es una reempaquetado del GGUF original de bartowski, generado con la herramienta `loom-next` (sin LLM en el bucle), y está dirigido específicamente a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia radica en que ofrece una vía de despliegue nativa en ROCm para un modelo de visión de 9B con contexto declarado de 262.144 tokens por petición, algo poco habitual en el ecosistema de inferencia sobre GPUs AMD de consumo y de estación de trabajo.

La licencia es Apache 2.0 y la integración expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activable y entrada de imágenes mediante proyector multimodal separado (`mmproj-UI-Venus-2-9B-bf16.gguf`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB, lo que sugiere que los pesos no están alojados en este repositorio sino que se resuelven vía `loom-fetch` desde la fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | 9B (según el nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición (según la tabla de features del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); el GGUF base de bartowski ofrece otras cuantizaciones, no detalladas aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`UI-Venus-2-9B-Q4_K_M.gguf`) más proyector `mmproj-UI-Venus-2-9B-bf16.gguf`; empaquetado como programas `.loom` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Tool calling | Sí, estilo OpenAI (`tools` / `tool_calls`) |
| Modo razonamiento | Sí, activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | No aplicable |
| Entrada de audio | No aplicable |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base UI-Venus-2-9B en la documentación proporcionada: no se especifica si es un transformer denso, un modelo híbrido o si emplea atención lineal, ni se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo único confirmado es su naturaleza multimodal: acepta imágenes mediante partes `image_url` al estilo OpenAI y las procesa con un proyector separado en precisión bf16 (`mmproj-UI-Venus-2-9B-bf16.gguf`), lo que indica un diseño típico de modelo de lenguaje con adaptador visual acoplado.

El paquete Loom en sí no modifica los pesos: según la model card, se trata del checkpoint GGUF "sin modificar" de bartowski, y el trabajo del autor consiste en generar programas `.loom` y kernels para ejecutar ese GGUF sobre ROCm en los dos aceleradores AMD indicados. La generación se realizó con `loom-next`, el generador, sin intervención de un LLM en el proceso. El paquete declara soporte de razonamiento (thinking) activado por defecto, plantilla de chat con conmutador `enable_thinking`, y una API compatible con OpenAI servida por `loom-serve`.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Comprensión de imágenes (image-text-to-text): acepta entradas visuales en partes `image_url` y las procesa con el proyector bf16 incluido.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Soporte de contexto largo: hasta 262.144 tokens por petición según la tabla de features.
- Concurrencia de hasta 4 peticiones simultáneas.
- No soporta entrada ni salida de audio.
- No aplica decodificación especulativa ni ajuste de "reasoning effort".
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de código, matemáticas o agentes multi-paso más allá del bucle de tool calling: no detalladas en la información proporcionada.

## Casos de uso

- Automatización de comprensión de interfaces: el modelo puede recibir capturas de pantalla y responder preguntas sobre elementos de la UI (botones, formularios, estados), aprovechando su naturaleza image-text-to-text y el proyector visual incluido.
- Asistentes de accesibilidad: descripción de pantallas y generación de instrucciones en texto a partir de imágenes, con contexto largo para mantener el hilo de una sesión completa de navegación.
- Agentes de automatización de escritorio con tool calling: el soporte de `tools`/`tool_calls` permite encadenar acciones (clic, escritura, consulta) en un bucle multi-turno sobre la API servida por `loom-serve`.
- Procesamiento de documentos escaneados o capturas extensas: con 262.144 tokens de contexto por petición, es viable adjuntar varias imágenes y un historial largo en una sola llamada sin truncar.
- Despliegue en estaciones de trabajo AMD: al estar empaquetado para Strix Halo y Radeon AI PRO R9700, encaja en entornos ROCm donde no se quiere depender de CUDA ni de llama.cpp como servidor principal.
- Servicio ligero de inferencia multimodal en local: con 4 peticiones concurrentes y un preset de 4.096 tokens de salida, es adecuado para prototipos y herramientas internas de un solo equipo o pequeño equipo.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `vision`, `agent`, etc.) pensadas para verificar equivalencia con la referencia llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Por tanto, no hay cifras de throughput, latencia ni precisión que reportar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 9B, lo que sitúa los pesos en el orden de unos 5-6 GB, más el proyector bf16, pero esta cifra no la confirma la documentación.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el paquete está dirigido a los dos aceleradores AMD citados.
- Despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0`, instalado vía `pipx`; flujo `loom-fetch` + `loom-serve`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este paquete concreto (llama.cpp se usa solo como referencia de corrección).
- Opciones de arranque documentadas: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; las mediciones aún no se han realizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Venus-2-9B-loom (este paquete) | 9B | 262.144 tokens | Imagen + texto | Apache 2.0 | Paquete Loom para AMD Strix Halo y R9700 |
| bartowski/UI-Venus-2-9B-GGUF | 9B | no disponible | Imagen + texto | Apache 2.0 (heredada) | GGUF en Hugging Face, ejecutable con llama.cpp |
| Alternativas de 9B multimodales (p. ej. Qwen2.5-VL-7B, Llama 3.2 11B Vision) | 7B-11B | no disponible en esta ficha | Imagen + texto | varía | no disponible en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no hay benchmarks publicados para este paquete ni cifras de referencia en la documentación consultada. La diferencia principal frente al GGUF original de bartowski es el formato de despliegue (Loom sobre ROCm) y la API compatible con OpenAI con tool calling y modo thinking, no el modelo en sí.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: los pesos no parecen alojados aquí, por lo que la disponibilidad real depende de `loom-fetch` y de la fuente original.
- Todas las puertas de corrección figuran como "not yet re-measured": no hay evidencia registrada de equivalencia con llama.cpp en ninguna de las plataformas soportadas.
- No hay mediciones de rendimiento publicadas; no se puede afirmar nada sobre latencia o throughput en producción.
- El soporte está restringido a dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPUs, con CUDA ni con GPUs de consumo.
- El contexto de 262.144 tokens es el declarado por el preset; no se especifica cómo se comporta la calidad en ventanas largas ni si el modelo base fue entrenado para esa longitud.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y del GGUF de bartowski; conviene verificar las condiciones del checkpoint original antes de un despliegue comercial.
- El modo de razonamiento está activado por defecto, lo que incrementa el consumo de tokens de salida si no se desactiva explícitamente.
- La documentación no detalla el comportamiento de `sampling` ("not determined"), lo que añade incertidumbre sobre la reproducibilidad de las respuestas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-UI-Venus-2-9B-loom
- GGUF base: https://huggingface.co/bartowski/UI-Venus-2-9B-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Sistema ROCm HRX referenciado en la model card: https://github.com/ROCm/hrx-system
