# loom-draft/bartowski-tencent_UI-Mate-27B-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` sobre el checkpoint GGUF `tencent_UI-Mate-27B-Q4_K_M.gguf` de bartowski, que a su vez es una cuantizacion del modelo base Tencent UI-Mate 27B. El paquete esta orientado a la ejecucion del modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la tarjeta profesional Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `hrx-loom` 0.2.0.

Se trata de un modelo multimodal de tipo image-text-to-text con 27.000 millones de parametros en su version original, servido aqui en cuantizacion Q4_K_M y acompanado de un proyector de vision separado (`mmproj-tencent_UI-Mate-27B-bf16.gguf`). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, entrada de imagenes y un modo de razonamiento ("thinking") activado por defecto. La ventana de contexto declarada es de 262.144 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada pero practica: demuestra que un modelo de 27B con vision puede servirse en hardware AMD consumer y profesional sin CUDA, con verificaciones de correctitud frente a llama.cpp planteadas como puertas de calidad. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de correctitud para este paquete aun no se han vuelto a medir, por lo que la evidencia publicada es incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Tencent UI-Mate 27B; el paquete solo describe el formato de despliegue) |
| Parametros totales | 27.000 millones (segun el nombre del checkpoint; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint servido); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `tencent_UI-Mate-27B-Q4_K_M.gguf` y `mmproj-tencent_UI-Mate-27B-bf16.gguf`), empaquetado como paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Tencent UI-Mate 27B (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que si se documenta es la capa de despliegue: el paquete Loom contiene kernels generados por `loom-next` para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las cifras de rendimiento de la tarjeta.

El checkpoint es "unmodified": el autor no ha alterado los pesos, solo ha generado el envoltorio de ejecucion. El paquete incluye dos presets (`chat` para Strix Halo y `chat-r9700` para la R9700) y fija los archivos fuente con hashes sha256 verificados por `loom-fetch`. No se declaran innovaciones de decodificacion especulativa (marcada como "not applicable") ni modos de esfuerzo de razonamiento configurables.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI, con soporte de los campos `tools` y `tool_calls`.
- Entrada de imagenes multimodal (image-text-to-text) mediante partes `image_url`, usando el proyector `mmproj-tencent_UI-Mate-27B-bf16.gguf`.
- Procesamiento de contexto largo: hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Generacion de hasta 4.096 tokens de salida por preset.
- Sin soporte de audio ni de salida de audio.
- Sin decodificacion especulativa ni control de "reasoning effort".
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: el paquete permite levantar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395, sin depender de CUDA, usando `loom-serve` y el preset correspondiente.
- Analisis de documentos largos con imagenes intercaladas: con 262.144 tokens de contexto por peticion se pueden enviar manuales, informes o capturas junto con texto extenso y formular preguntas sobre el conjunto.
- Automatizacion de soporte tecnico sobre capturas de pantalla: la entrada de imagenes via `image_url` permite adjuntar una captura de error y pedir diagnostico o pasos de resolucion en una misma conversacion.
- Agentes con herramientas en bucle multi-turno: el soporte de `tools`/`tool_calls` habilita flujos de funcion calling encadenados (consulta de APIs, calculo, recuperacion de datos) con el historial reutilizado entre turnos.
- Prototipado de pipelines RAG multimodales: el modelo puede recibir fragmentos de texto recuperados junto con imagenes de las fuentes y generar respuestas citables, con concurrencia de 4 peticiones para pruebas de carga ligeras.
- Evaluacion comparativa de runtimes en hardware AMD: al incluir puertas de correctitud definidas frente a llama.cpp (tokens greedy, top-5 log-probs, vision, consistencia concurrente), sirve como banco de pruebas para validar kernels generados en gfx1151 y gfx1201.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del paquete facilita su integracion en productos internos o comerciales, sujeto a la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero en ambos casos indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en las dos plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 27B y el preset de la R9700 esta disenado para una GPU de 32 GB. Para Strix Halo se usa memoria unificada del APU.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs NVIDIA ni para Radeon de consumo distintas de las citadas; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: runtime `hrx-loom[hf]==0.2.0` instalado con pipx, descarga con `loom-fetch` y servicio con `loom-serve`; API compatible con OpenAI en el puerto 8080.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; el checkpoint GGUF de origen podria usarse con otros runtimes, pero no se proporciona informacion al respecto.
- Latencia y throughput: no disponibles; las mediciones del autor aun no se han repetido para este paquete.
- Concurrencia maxima declarada: 4 peticiones simultaneas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria, y las cifras de benchmarks del paquete no se han medido. Como referencia estructural, el unico punto de comparacion mencionado es llama.cpp, usado como referencia de correctitud (tokens greedy y top-5 log-probs sobre el mismo GGUF), pero sin resultados publicados para este paquete.

## Limitaciones y advertencias

- Ausencia de evidencia de rendimiento: todas las tablas de rendimiento y correctitud figuran como "not yet re-measured"; no hay datos que respalden el comportamiento en produccion.
- Cobertura de hardware muy restringida: el paquete esta generado solo para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPU AMD ni en NVIDIA.
- Limite de salida: 4.096 tokens por preset, lo que puede ser insuficiente para generaciones largas sin reconfiguracion.
- Concurrencia baja: 4 peticiones simultaneas como maximo, adecuado para uso individual o pruebas, no para servicio de alta demanda.
- Idiomas no declarados: se desconoce el soporte multilingue real del modelo base.
- Sesgos y alucinaciones: no se documenta ninguna evaluacion al respecto en la informacion disponible; deben asumirse los riesgos habituales de un modelo generativo de 27B.
- Licencia: el paquete declara Apache 2.0, pero se desconoce la licencia del modelo base Tencent UI-Mate 27B, que puede imponer condiciones adicionales para uso comercial.
- Repositorio vacio en cuanto a pesos: el tamano del repo es 0.0 GB y las descargas y likes son cero; los archivos se obtienen mediante `loom-fetch` desde el paquete referenciado, no como pesos alojados directamente.
- Los resultados de busqueda web proporcionados corresponden a servicios no relacionados (Loom de grabacion de pantalla y la marca de ropa Loom) y no aportan informacion tecnica sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-tencent_UI-Mate-27B-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/tencent_UI-Mate-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
