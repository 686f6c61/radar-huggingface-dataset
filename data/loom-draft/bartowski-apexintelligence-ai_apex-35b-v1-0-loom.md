# loom-draft/bartowski-Apexintelligence-AI_Apex-35B-V1.0-loom

## Resumen

El paquete `loom-draft/bartowski-Apexintelligence-AI_Apex-35B-V1.0-loom` es una distribucion empaquetada en formato Loom del checkpoint GGUF `bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF` (variante Q4_K_M). No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión de despliegue generada con la herramienta `loom-next` a partir del GGUF original, orientada a GPUs AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Apex-35B-V1.0, es un modelo multimodal de tipo image-text-to-text con 35 mil millones de parametros nominales, ventana de contexto de 262.144 tokens por peticion y soporte de razonamiento (thinking mode) activado por defecto. El paquete Loom aporta programas `.loom`, un `model.json` y kernels generados para ROCm, e incluye decodificacion especulativa MTP (multi-token prediction) con profundidad 3, tool calling estilo OpenAI y entrada de imagen mediante el proyector `mmproj-Apexintelligence-AI_Apex-35B-V1.0-bf16.gguf`.

Su relevancia es acotada pero concreta: permite servir el modelo en hardware AMD consumer y profesional sin depender de CUDA, con una API compatible con OpenAI, y con un conjunto de puertas de validacion (kernel_tests, golden, compare, vision, agent, spec, sampling, logits, decision) definidas para verificar la equivalencia con llama.cpp. No obstante, las mediciones de rendimiento y correccion de este paquete concreto no se han vuelto a medir segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles de transformer/MoE no indicados) |
| Parametros totales | 35B (nominal, segun nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programa Loom `.loom` + `model.json`) |

Otros datos del paquete: maximo de tokens de salida 4.096 (preset `max_tokens`), concurrencia de 4 peticiones simultaneas, decodificacion especulativa MTP con profundidad 3 activada por defecto, thinking mode activado por defecto (desactivable con `chat_template_kwargs: {"enable_thinking": false}`).

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Apex-35B-V1.0 (tipo de transformer, posible mezcla de expertos, atencion lineal u otras innovaciones), ni sobre el dataset de entrenamiento, numero de tokens, composicion o si se aplicaron tecnicas de RLHF/DPO. La model card del paquete Loom no documenta estos aspectos y la busqueda web no aporta informacion tecnica sobre el modelo original.

Lo que si documenta el paquete es la capa de despliegue: kernels generados para ROCm (gfx1151 y gfx1201), un pool de memoria con `--pool_backing=fixed`, carga de pesos con `--parameter_mode=preload`, y decodificacion especulativa basada en MTP con profundidad 3, que segun la model card produce exactamente la misma salida que con la decodificacion especulativa desactivada (puerta `spec`, pendiente de re-medicion). La generacion del paquete se realizo con `loom-next` sin intervencion de un LLM en el bucle.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; desactivable por peticion mediante `chat_template_kwargs`.
- Entrada de imagen (image-text-to-text) mediante partes `image_url` estilo OpenAI, usando el proyector `mmproj-Apexintelligence-AI_Apex-35B-V1.0-bf16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial (puertas `agent` y `agent_think_off` definidas en la model card).
- Decodificacion especulativa MTP con profundidad 3 para acelerar la generacion.
- API compatible con OpenAI (`/v1/chat/completions`) servida localmente en el puerto 8080.
- Concurrencia de 4 peticiones simultaneas con consistencia verificable (puerta `consistency`).
- Capacidades multilingues: no disponible.
- Audio: no soportado (marcado como "not applicable" en la model card).

## Casos de uso

- Asistente multimodal local en estacion de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 (32 GB) con `loom-serve` y consumirlo desde una interfaz compatible con OpenAI, aprovechando la entrada de imagen para consultas sobre capturas o documentos escaneados.
- Automatizacion de agentes con tool calling: construir bucles multi-turno donde el modelo invoca funciones (APIs internas, consultas a bases de datos) y reutiliza el historial, con thinking desactivable para reducir latencia en tareas mecanicas.
- Analisis de documentos largos: con 262.144 tokens de contexto por peticion, procesar contratos, informes o expedientes completos sin troceado, extrayendo resumenes y respuestas sobre el contenido.
- Desarrollo sobre hardware Strix Halo: prototipar aplicaciones de IA generativa en un portatil o mini-PC con Ryzen AI Max+ 395 sin GPU discreta, usando el preset `chat` del paquete y el pool de memoria fijo.
- Evaluacion comparativa de backends: usar las puertas `golden`, `compare` y `spec` para verificar que la salida del paquete Loom coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, como paso previo a adoptar ROCm en produccion.
- Inferencia con vision en flujos de inspeccion: enviar imagenes junto con instrucciones de texto para clasificar o describir contenido visual, integrado en un servicio HTTP local con concurrencia de 4 peticiones.
- Servicio de chat interno con razonamiento controlado: desplegar el modelo con thinking activado para tareas de analisis y desactivado para respuestas rapidas de atencion al usuario, usando el mismo endpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como no re-medidas.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 35B, lo que situa los pesos en torno a 20-22 GB; a ello hay que sumar el proyector de vision en bf16 y el pool de memoria fijo del preset. Cifra exacta no disponible en la informacion proporcionada.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Cabe en GPU consumer: si, en el caso de la R9700 (32 GB); en Strix Halo depende de la memoria unificada asignada a la GPU, no especificada.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalacion via pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (no re-medidos para este paquete).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones internas del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0 (este paquete) | 35B | 262.144 | Apache 2.0 | GGUF / Loom | Vision, thinking, tool calling, MTP |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete no ha sido re-medido: rendimiento y correccion figuran como pendientes en todas las puertas de validacion, por lo que no hay garantia publicada de equivalencia con llama.cpp para esta distribucion concreta.
- No hay informacion sobre sesgos, datos de entrenamiento ni composicion del corpus del modelo base, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin verificacion previa.
- Dependencia de hardware AMD y del runtime Loom (`hrx-loom==0.2.0`): no es portable a CUDA ni a otros backends sin conversion adicional.
- Limite de 4.096 tokens de salida por defecto (preset `max_tokens`), inferior al contexto de entrada.
- Concurrencia limitada a 4 peticiones simultaneas.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-19), sin historial de uso.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al artefacto publicado; conviene verificar la licencia del checkpoint base `bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF` antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Apexintelligence-AI_Apex-35B-V1.0-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
