# loom-draft/mradermacher-OvisOCR3-loom

## Resumen

OvisOCR3 es un modelo multimodal de tipo image-text-to-text orientado a tareas de reconocimiento optico de caracteres (OCR) y comprension de documentos. Esta ficha describe el paquete `loom-draft/mradermacher-OvisOCR3-loom`, una distribucion en formato Loom generada por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `mradermacher/OvisOCR3-GGUF` (concretamente el fichero `OvisOCR3.Q4_K_M.gguf`). El paquete esta pensado para ejecutarse sobre GPUs AMD: el acelerador integrado del Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo resuelve el problema de desplegar un modelo de vision-lenguaje para OCR sobre hardware AMD mediante el stack Loom, que compila el grafo del modelo en programas `.loom` y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`). Incluye soporte de entrada de imagen a traves de un proyector multimodal separado (`OvisOCR3.mmproj-f16.gguf`), tool calling, modo de razonamiento opcional y una ventana de contexto declarada de 262.144 tokens por peticion.

La relevancia de este paquete es fundamentalmente de infraestructura: no introduce pesos nuevos ni fine-tuning, sino que empaqueta un GGUF ya cuantizado (Q4_K_M) para un runtime alternativo a llama.cpp sobre ROCm. En el momento de la publicacion no se han registrado mediciones de rendimiento ni de correccion para esta build concreta, por lo que debe evaluarse como un artefacto en estado de borrador (`loom-draft`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; pesos derivados de OvisOCR3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 (`OvisOCR3.mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Backend | Loom sobre ROCm (gfx1151 y gfx1201) |
| Tool calling | si (estilo OpenAI `tools` / `tool_calls`) |
| Modo thinking | si, desactivado por defecto (`chat_template_kwargs: {"enable_thinking": true}`) |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no aplicable |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base OvisOCR3 ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la documentacion proporcionada. El paquete Loom no modifica los pesos: parte del GGUF `OvisOCR3.Q4_K_M.gguf` publicado por mradermacher y genera, mediante `loom-next` (el generador, sin LLM en el bucle), un conjunto de programas `.loom` y un fichero `weights.loom` que el runtime `loom-serve` ejecuta sobre GPUs AMD.

La innovacion tecnica del artefacto reside en el propio stack Loom: compilacion del grafo a programas especificos, gestion de memoria con `--pool_backing=fixed` (reserva anticipada del pool) y `--parameter_mode=preload` (carga de pesos en host), y espera activa de finalizaciones de GPU con `completion_spin_ns=4294967295`. El proyector multimodal se mantiene en F16, separado de los pesos cuantizados en Q4_K_M. El paquete incluye `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados por sha256, verificados por `loom-fetch`.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: acepta imagenes mediante partes `image_url` al estilo OpenAI.
- OCR y comprension de documentos: proposito declarado del modelo base OvisOCR3.
- Tool calling con esquema OpenAI (`tools` y `tool_calls`), validado en el gate `agent` del banco de pruebas.
- Razonamiento multi-paso opcional mediante modo thinking, desactivado por defecto y activable por peticion.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve texto estructurado; la ventana de 262.144 tokens permite procesar lotes de documentos largos en una sola peticion.
- Extraccion de datos de formularios escaneados: combinado con tool calling, el modelo puede emitir `tool_calls` con los campos extraidos hacia un backend de validacion, sin post-procesado manual del texto.
- Procesamiento de archivos PDF convertidos a imagen en pipelines documentales: el soporte de entrada de imagen y la API OpenAI permiten sustituir un endpoint de vision existente por `loom-serve` sin reescribir el cliente.
- Asistente de accesibilidad para lectura de documentos: descripcion y transcripcion de imagenes con texto para usuarios con discapacidad visual, ejecutado en local sobre una Radeon AI PRO R9700.
- Automatizacion de back-office en estaciones de trabajo con GPU AMD: al ejecutarse sobre Strix Halo (APU), permite desplegar OCR en equipos sin GPU discreta, manteniendo los datos en local.
- Analisis de capturas de pantalla en herramientas de soporte: el modelo puede interpretar imagenes enviadas por el usuario y responder en el mismo hilo conversacional, con razonamiento activable para casos ambiguos.
- Moderacion y clasificacion de contenido visual con texto: uso del modo thinking para decisiones que requieren justificacion, con la salida limitada a 4.096 tokens por respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Un gate sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- GPUs soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible; el paquete parte de un GGUF Q4_K_M y un proyector F16, pero no se publica el consumo medido.
- Cabe en GPU de consumo: no confirmado; la R9700 es una GPU profesional de 32 GB y Strix Halo es una APU con memoria unificada.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; flags recomendados `--pool_backing=fixed` y `--parameter_mode=preload`, y `completion_spin_ns=4294967295` para espera activa.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el GGUF original de mradermacher es compatible con llama.cpp, pero el artefacto Loom esta atado al runtime `hrx-loom`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (OCR multimodal) que permitan una comparacion rigurosa. Como referencia estructural, el paquete se apoya en el mismo checkpoint GGUF que `mradermacher/OvisOCR3-GGUF`, por lo que la calidad del modelo subyacente seria identica; la diferencia radica exclusivamente en el runtime (Loom sobre ROCm frente a llama.cpp).

## Limitaciones y advertencias

- Artefacto en estado de borrador: el autor lo publica bajo el espacio `loom-draft` y sin mediciones de rendimiento ni de correccion registradas.
- Sin evidencia de correccion: todos los gates del banco de pruebas figuran como no re-medidos; no hay garantia documentada de equivalencia con la referencia de llama.cpp.
- Dependencia estricta del runtime: requiere `hrx-loom==0.2.0` y GPUs AMD gfx1151 o gfx1201; no es portable a CUDA ni a otros backends.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por respuesta, lo que puede ser insuficiente para transcripciones de documentos muy extensos.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento en castellano ni en otras lenguas.
- Riesgo de alucinacion inherente a los modelos de vision-lenguaje: en tareas OCR, el modelo puede generar texto plausible ausente en la imagen; se recomienda validacion posterior en produccion.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del proyector multimodal por separado.
- Los enlaces de busqueda web devueltos (Loom.com, loom.fr, Atlassian) corresponden a productos no relacionados y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-OvisOCR3-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/OvisOCR3-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
