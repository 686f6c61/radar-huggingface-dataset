# loom-draft/prithivMLmods-chandra-ocr-2-loom

## Resumen

`loom-draft/prithivMLmods-chandra-ocr-2-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `chandra-ocr-2.Q4_K_M.gguf` del modelo `prithivMLmods/chandra-ocr-2-GGUF`. No se trata de un modelo nuevo: es una distribucion en formato `.loom` (programas generados y una tarjeta `model.json`) pensada para ejecutar inferencia de vision-lenguaje sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del paquete es `loom-draft` y la generacion se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo subyacente es un OCR multimodal de tipo image-text-to-text, cuantizado en Q4_K_M y acompanado de un proyector `chandra-ocr-2.mmproj-bf16.gguf` para la entrada de imagenes. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento activado por defecto y una ventana de contexto declarada de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada y muy especifica: cubre el nicho de ejecutar OCR multimodal sobre hardware AMD con el stack ROCm/Loom, un ecosistema con menos opciones de despliegue que el de NVIDIA. Sin embargo, la tarjeta no incluye mediciones de rendimiento, correccion ni benchmarks, y el repositorio aparece vacio (0.0 GB), por lo que debe considerarse un artefacto en fase preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint GGUF multimodal image-text-to-text; arquitectura del modelo base no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint referenciado); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | GGUF (`chandra-ocr-2.Q4_K_M.gguf`) + proyector `chandra-ocr-2.mmproj-bf16.gguf`; paquete Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `prithivMLmods/chandra-ocr-2-GGUF` en la documentacion proporcionada: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de parametros, capas o cabezas de atencion. Lo unico confirmado es que se trata de un modelo multimodal de tipo image-text-to-text que procesa imagenes mediante un proyector separado (`mmproj`) y genera texto, lo cual es coherente con un uso orientado a OCR y comprension de documentos.

Tampoco hay datos sobre el corpus de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El paquete Loom en si no modifica los pesos: la tarjeta indica explicitamente que empaqueta el checkpoint GGUF "sin modificar". La aportacion tecnica del paquete es la generacion de kernels y programas Loom para ejecutar ese GGUF sobre GPU AMD, con soporte de espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`).

## Capacidades

- Generacion de texto a partir de imagenes (image-text-to-text): entrada via partes `image_url` en formato OpenAI, procesadas por el proyector `chandra-ocr-2.mmproj-bf16.gguf`.
- OCR y extraccion de texto de documentos e imagenes, segun la orientacion del modelo base.
- Tool calling en estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de conversaciones multi-turno con reutilizacion de historial en bucles de agente.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 262.144 tokens por peticion.
- Salida maxima de 4.096 tokens por preset.
- No soporta entrada ni salida de audio.
- No aplica decodificacion especulativa ni ajuste de esfuerzo de razonamiento (reasoning effort).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve el texto estructurado; la ventana de 262.144 tokens permite procesar lotes de documentos largos o conversaciones de extraccion con contexto acumulado.
- Extraccion de datos de formularios escaneados en un pipeline interno: se envia cada pagina como `image_url` y se solicita salida en JSON; el soporte de tool calling permite encadenar la escritura del resultado en un sistema posterior.
- Procesamiento de documentos tecnicos de varias paginas en una sola peticion: el contexto declarado de 262.144 tokens admite concatenar muchas imagenes o texto OCR intermedio sin truncar.
- Agente de mesa de ayuda documental: con thinking activado y tool calling, el modelo puede consultar un indice de documentos, recibir capturas de pantalla del usuario y responder con pasos concretos en un bucle multi-turno.
- Servicio de OCR on-premise sobre hardware AMD: el paquete Loom permite desplegar el modelo en Strix Halo o R9700 sin depender de CUDA, con una API compatible con OpenAI que se integra en clientes existentes.
- Prototipado de lectura de tickets y recibos en un portatil con Ryzen AI Max+ 395: el checkpoint Q4_K_M y el proyector BF16 caben en la memoria unificada del equipo, lo que permite pruebas locales sin GPU dedicada.
- Evaluacion comparativa de calidad OCR frente a otros modelos: la API compatible con OpenAI facilita enviar el mismo conjunto de imagenes a distintos backends y comparar salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La tarjeta del paquete incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican que "los resultados para este paquete aun no se han vuelto a medir". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas en ambas GPU. No hay datos de latencia, throughput ni calidad.

## Requisitos de hardware

- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible. El checkpoint es Q4_K_M y el proyector BF16; el tamano exacto no figura en la informacion. La R9700 dispone de 32 GB, lo que sugiere que el conjunto cabe holgadamente en esa GPU, pero no se confirma.
- GPU consumer: el paquete esta orientado a hardware AMD con ROCm; no se menciona compatibilidad con GPU NVIDIA ni con tarjetas consumer AMD de gama baja.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, `loom-fetch` para descargar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Parametros de servicio relevantes: `--pool_backing=fixed` reserva el pool de memoria por adelantado y `--parameter_mode=preload` precarga los pesos en host.
- Latencia y throughput: no disponibles (las mediciones no se han realizado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| prithivMLmods-chandra-ocr-2-loom (este paquete) | no disponible | 262.144 tokens | GGUF Q4_K_M + paquete Loom | openrail | AMD Strix Halo / R9700 (ROCm) |
| prithivMLmods/chandra-ocr-2-GGUF (modelo base) | no disponible | no disponible | GGUF | no disponible | Generico (llama.cpp y similares) |
| Alternativas OCR multimodales de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB de tamano y sin descargas ni likes: es un artefacto recien creado y sin validacion publica.
- No hay mediciones de rendimiento ni de correccion: todas las puertas de calidad y las comparaciones frente a llama.cpp estan pendientes de re-medicion en ambas GPU.
- La tarjeta no documenta sesgos conocidos, tasas de alucinacion ni limitaciones de idioma del modelo base.
- El campo "idiomas soportados" no esta disponible; no se debe asumir un rendimiento multilingue sin verificar.
- La licencia es openrail, que impone restricciones de uso (habitualmente clausulas de uso aceptable y obligaciones de atribucion); conviene revisar el texto completo antes de un uso comercial.
- El paquete solo declara soporte para dos GPU AMD concretas; no hay garantia de funcionamiento en otro hardware.
- El limite de salida por preset es de 4.096 tokens, lo que puede ser insuficiente para transcribir documentos muy extensos en una sola respuesta.
- La concurrencia maxima declarada es de 4 peticiones, un valor bajo para cargas de produccion con varios usuarios.
- El muestreo figura como "no determinado" en la tabla de caracteristicas, lo que anade incertidumbre sobre el comportamiento reproducible de la generacion.
- El modo de razonamiento esta activado por defecto y puede aumentar la latencia y el consumo de tokens si no se desactiva explicitamente.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/prithivMLmods-chandra-ocr-2-loom
- Modelo base en Hugging Face: https://huggingface.co/prithivMLmods/chandra-ocr-2-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
