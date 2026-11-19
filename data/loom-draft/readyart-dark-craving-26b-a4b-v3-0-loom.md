# loom-draft/ReadyArt-Dark-Craving-26B-A4B-v3.0-loom

## Resumen

ReadyArt-Dark-Craving-26B-A4B-v3.0-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar ReadyArt/Dark-Craving-26B-A4B-v3.0-GGUF, concretamente el fichero `Dark-Craving-26B-A4B-v3.0-Q4_K_M_hb16.gguf` en cuantizacion Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune propio: el autor declara explicitamente que el GGUF subyacente esta "unmodified" y que la generacion se hizo con loom-next en modo generador puro, sin LLM en el bucle.

El proposito del repositorio es ofrecer un artefacto listo para servir el modelo sobre hardware AMD mediante el runtime Loom (hrx-loom 0.2.0), con presets especificos para la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto de 201.728 tokens por peticion con 4 peticiones concurrentes.

La relevancia actual es acotada pero concreta: cubre el nicho de inferencia de un modelo de ~26B totales con ~4B activos (la nomenclatura A4B sugiere arquitectura MoE) en GPUs AMD de consumo y profesional, un segmento donde el ecosistema de herramientas (vLLM, llama.cpp con ROCm, TGI) aun presenta fricciones. La ficha del repositorio, sin embargo, no incluye mediciones de rendimiento ni resultados de las puertas de correccion: todas aparecen como "not yet re-measured", por lo que las cifras de velocidad y calidad no estan verificadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "26B-A4B" sugiere Mixture of Experts con ~26B totales y ~4B activos, no confirmado en la informacion) |
| Parametros totales | 26B (segun el nombre del checkpoint; no verificado en la model card) |
| Parametros activos | ~4B (segun la nomenclatura A4B; no confirmado) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (fichero `Dark-Craving-26B-A4B-v3.0-Q4_K_M_hb16.gguf`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El nombre del checkpoint, "26B-A4B", sigue la convencion habitual para modelos Mixture of Experts en los que se indica el total de parametros (26B) y los activos por token (~4B), pero la model card del paquete Loom no confirma esta arquitectura, ni detalla el numero de expertos, el tipo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO o similares. Tampoco se documenta el proceso de creacion del checkpoint original Dark-Craving-26B-A4B-v3.0, mas alla de que el paquete Loom lo referencia como base.

En lo que si es explicito el autor es en el proceso de empaquetado: el GGUF se toma sin modificar y se convierte en un paquete Loom mediante la herramienta loom-next, que genera kernels y programas `.loom` para el runtime hrx-loom 0.2.0. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256. La model card menciona que el modelo upstream soporta entrada de imagen, pero Loom no la implementa en este paquete. No se documentan innovaciones tecnicas propias del modelo (decodificacion especulativa, atencion lineal, etc.); de hecho, la tabla de caracteristicas marca la decodificacion especulativa como "not applicable" y el "reasoning effort" tambien como no aplicable.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Ventana de contexto de 201.728 tokens por peticion, adecuada para documentos largos y conversaciones multi-turno extensas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom en este paquete, aunque el modelo upstream la tiene.
- Entrada y salida de audio: no determinado.
- Capacidades multilingues: no disponibles en la informacion.
- Parametros de muestreo (temperature, top_k, seed): no determinados en la model card.

## Casos de uso

- Asistente conversacional de contexto largo: con 201.728 tokens de ventana, el modelo puede mantener conversaciones multi-turno con historiales extensos o procesar documentos completos en una sola peticion, util para analisis de contratos, informes o bases de codigo.
- Automatizacion de agentes con tool calling: la API expone `tools` y `tool_calls` en estilo OpenAI, lo que permite integrar el modelo en bucles de agente multi-paso (consulta de APIs, ejecucion de funciones, recuperacion de datos) sin adaptadores propietarios.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para la APU Strix Halo y la GPU R9700, de modo que equipos con hardware AMD pueden servir el modelo localmente sin depender de CUDA ni de servicios en la nube.
- Prototipado de razonamiento con thinking mode: activando `enable_thinking` se obtienen trazas de razonamiento para tareas que requieren descomposicion, aunque no se han publicado mediciones de calidad que respalden su utilidad frente al modo directo.
- Servicio interno de chat para equipos pequenos: con 4 peticiones concurrentes y una API compatible con OpenAI, puede cubrir un uso de baja concurrencia (herramientas internas, demos, evaluacion) en una sola GPU R9700 de 32 GB.
- Evaluacion comparativa de runtimes: al incluir puertas de correccion (`golden`, `compare`, `agent`, `sampling`, etc.) y comparaciones contra llama.cpp, el paquete sirve como banco de pruebas para medir la fidelidad de Loom frente a llama.cpp sobre el mismo GGUF.
- Integracion en pipelines de desarrollo con requisitos de privacidad: al ejecutarse en local sobre hardware AMD, permite procesar datos sensibles sin enviarlos a APIs externas, siempre que se acepten las limitaciones de contexto y concurrencia indicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es un GGUF Q4_K_M de un modelo de 26B totales; a ~4,5 bits por peso, el peso de los pesos ronda los 14-15 GB, aunque la cifra exacta no se publica y el consumo real depende de la cache KV para 201.728 tokens de contexto, que puede ser elevado.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: la informacion no confirma compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete esta orientado a las dos plataformas AMD citadas.
- Opciones de despliegue: runtime Loom mediante `hrx-loom[hf]==0.2.0`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de re-medicion en ambas plataformas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones verificadas de modelos alternativos de la misma categoria (MoE de ~26B con ~4B activos o modelos densos de tamano comparable), por lo que no es posible establecer una comparacion rigurosa. Como referencia estructural, el propio paquete se compara contra llama.cpp ejecutando el mismo GGUF, pero esa comparacion mide el runtime, no el modelo frente a otros modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un empaquetado de despliegue de un GGUF de terceros. Cualquier limitacion del modelo base (sesgos, alucinaciones, calidad) se hereda sin cambios.
- No hay mediciones de rendimiento ni de correccion publicadas para este paquete: todas las puertas y comparativas aparecen como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp.
- La entrada de imagen que soporta el modelo upstream no esta disponible en Loom; si el caso de uso requiere vision, este paquete no sirve.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens, lo que restringe su uso en produccion con alta carga o respuestas muy largas.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue concreto.
- Arquitectura y detalles de entrenamiento no confirmados en la model card; la interpretacion "MoE 26B-A4B" proviene solo de la nomenclatura del checkpoint.
- La licencia declarada es Apache 2.0, pero conviene verificar la licencia del checkpoint base ReadyArt/Dark-Craving-26B-A4B-v3.0-GGUF antes de un uso comercial, ya que el paquete no la detalla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Dependencia de un runtime especifico (hrx-loom 0.2.0) y de hardware AMD concretos; la portabilidad a otras plataformas no esta documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Dark-Craving-26B-A4B-v3.0-loom
- Modelo base (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
