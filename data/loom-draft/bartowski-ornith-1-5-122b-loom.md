# loom-draft/bartowski-Ornith-1.5-122B-loom

## Resumen

Ornith-1.5-122B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `bartowski/Ornith-1.5-122B-GGUF`, concretamente la cuantizacion Q4_K_M dividida en dos ficheros. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos originales a un formato ejecutable por el runtime `loom-serve` sobre GPUs AMD, con soporte explicito para el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con la herramienta `loom-next`, que segun la model card opera sin LLM en el bucle.

El modelo subyacente es un transformer multimodal de 122.000 millones de parametros con entrada de imagen y texto (pipeline `image-text-to-text`), que utiliza un proyector independiente (`mmproj-Ornith-1.5-122B-bf16.gguf`) para la torre de vision. El runtime declara soporte de decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto, y un modo de razonamiento ("thinking") tambien activado por defecto y desactivable por peticion.

La relevancia de esta ficha es doble: por un lado documenta un caso de despliegue de un modelo de gran tamano en hardware AMD consumer y profesional mediante un stack alternativo a llama.cpp; por otro, advierte de que las mediciones de rendimiento y las puertas de correccion del paquete estan pendientes de re-medicion, por lo que no debe considerarse validado para produccion. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), segun el checkpoint base; detalles internos no disponibles |
| Parametros totales | 122B (122.000 millones, segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 108.544 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M en dos shards) + proyector `mmproj` en bf16; paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| API | OpenAI-compatible `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su caracter multimodal: el pipeline es `image-text-to-text` y el paquete incluye un proyector de vision separado en bf16, lo que indica una torre visual acoplada a un modelo de lenguaje. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detalla si emplea attention lineal, SSM o un transformer denso convencional.

La innovacion tecnica documentada pertenece al runtime, no al modelo. `loom-serve` implementa decodificacion especulativa mediante MTP con profundidad 3, activa por defecto, y expone un modo de razonamiento conmutable mediante `chat_template_kwargs: {"enable_thinking": false}`. Ademas, el paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida del runtime contra una referencia de llama.cpp registrada sobre el mismo GGUF; en el momento de publicacion de la model card, ninguna de ellas presenta medicion registrada.

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto, desactivable por peticion.
- Entrada de imagen: soporta partes `image_url` en formato OpenAI, procesadas por el proyector `mmproj-Ornith-1.5-122B-bf16.gguf`.
- Tool calling: compatible con `tools` y `tool_calls` en estilo OpenAI.
- Flujos de agente multi-turno: la model card incluye puertas de correccion especificas para bucles de tool calling con y sin razonamiento (`agent`, `agent_think_off`), lo que documenta el soporte previsto.
- Contexto largo: 108.544 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia: hasta 4 peticiones simultaneas con `--pool_backing=fixed`.
- Capacidades multilingues: no disponibles.
- Audio: no soportado (declarado "not applicable").
- Ajuste de esfuerzo de razonamiento: no aplicable en este runtime.

## Casos de uso

- Analisis de documentos extensos con imagen: el contexto de 108.544 tokens permite procesar informes con graficos o capturas junto al texto completo en una sola peticion, sin trocear el material.
- Atencion al cliente con historial largo: la ventana de contexto y el soporte de tool calling permiten mantener conversaciones multi-turno con acceso a funciones de backend (consulta de pedidos, estado de cuenta) mediante `tool_calls`.
- Automatizacion de agentes sobre hardware local AMD: el soporte de bucles de tool calling con razonamiento activado encaja en flujos de varios pasos ejecutados en estaciones de trabajo con Strix Halo o R9700, sin depender de la nube.
- Procesamiento de capturas y documentos escaneados: la entrada de imagen permite extraer y razonar sobre contenido visual en pipelines de digitalizacion o revision documental.
- Asistencia a desarrolladores en local: el modelo puede integrarse detras de una API OpenAI-compatible (`/v1/chat/completions`) y consumirse desde IDE o herramientas que ya hablan ese protocolo, apuntando a `127.0.0.1:8080`.
- Evaluacion y prototipado de stacks AMD: util para equipos que quieran medir el rendimiento de `loom-serve` frente a llama.cpp sobre el mismo GGUF, ya que el paquete incluye puertas de comparacion directa.
- Despliegue en estaciones con GPU de 32 GB: la Radeon AI PRO R9700 con `--parameter_mode=preload` esta contemplada explicitamente para cargar los pesos en host antes de servir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que los resultados de rendimiento frente a llama.cpp "no se han re-medido todavia" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint base es de 122B en Q4_K_M, lo que en la practica exige decenas de GB. El paquete esta orientado a una GPU de 32 GB (R9700) con `--parameter_mode=preload`, lo que sugiere uso de memoria del host complementaria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no contempladas en la documentacion del paquete.
- Cabe en GPU consumer: no confirmado; el hardware listado es APU de gama alta y GPU profesional AMD, no tarjetas consumer convencionales.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Notas de ejecucion: en hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run --user --pty --same-dir -p SystemCallFilter=~io_uring_setup -p SystemCallErrorNumber=ENOSYS` o elevar `ulimit -l`. La opcion `completion_spin_ns=4294967295` activa espera activa en CPU para las finalizaciones de GPU.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| Ornith-1.5-122B-loom (esta ficha) | 122B | 108.544 tokens | GGUF Q4_K_M empaquetado para `loom-serve` (AMD) | MIT | Puertas de correccion y rendimiento pendientes de re-medicion |
| bartowski/Ornith-1.5-122B-GGUF (base) | 122B | no disponible en la informacion | GGUF para llama.cpp y derivados | no disponible en la informacion | Checkpoint de origen; referencia usada por las puertas `golden` y `compare` |
| Alternativas de 122B en Q4_K_M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Estado de validacion incompleto: las once puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured"; no hay evidencia registrada de equivalencia con llama.cpp.
- Sin mediciones de rendimiento: no existen cifras de latencia ni throughput para ninguno de los dos dispositivos objetivo.
- Cero adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas no declarados: se desconoce el soporte multilingue real del checkpoint base.
- Sesgos y alucinacion: no documentados en la informacion disponible; al ser un modelo de lenguaje de gran tamano, deben asumirse los riesgos habituales y aplicar verificacion en produccion.
- Dependencia de hardware AMD especifico: el paquete esta generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPU.
- Requisito de configuracion del host: con memlock de 8 MiB es necesario usar `systemd-run` con filtros de syscall o elevar `ulimit -l`, lo que complica el despliegue estandar.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base `bartowski/Ornith-1.5-122B-GGUF`, no disponible en la informacion.
- Naturaleza del artefacto: es un empaquetado de despliegue, no un modelo entrenado; cualquier evaluacion de calidad debe referirse al checkpoint base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Ornith-1.5-122B-loom
- Checkpoint base: https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
