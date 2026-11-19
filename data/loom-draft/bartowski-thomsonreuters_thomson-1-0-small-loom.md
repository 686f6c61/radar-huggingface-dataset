# loom-draft/bartowski-thomsonreuters_Thomson-1.0-Small-loom

## Resumen

`loom-draft/bartowski-thomsonreuters_Thomson-1.0-Small-loom` es un paquete de despliegue en formato Loom (programas `.loom` y un `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/thomsonreuters_Thomson-1.0-Small-GGUF`, en su cuantizacion Q4_K_M. No es un modelo entrenado por el autor del repositorio, sino un artefacto de empaquetado orientado a la ejecucion del modelo base sobre GPUs AMD, concretamente el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo subyacente es multimodal con entrada de imagen.

El modelo base es Thomson-1.0-Small, un modelo de Thomson Reuters distribuido bajo licencia "other" que, segun los tags del paquete, incorpora vision, tool calling y un modo de razonamiento (thinking) activado por defecto. El paquete Loom expone estas capacidades mediante una API compatible con OpenAI (`/v1/chat/completions`), con soporte de 262.144 tokens de contexto por peticion y 4 peticiones concurrentes.

La relevancia de este repositorio es fundamentalmente practica: demuestra la ruta de despliegue del modelo en hardware AMD consumer y de estacion de trabajo mediante el runtime `loom-serve`, sin depender de CUDA ni de llama.cpp. No obstante, el propio autor indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, entre otras) aun no se han re-medido para este paquete en ninguna de las dos GPUs objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no especificada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint GGUF empaquetado); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | GGUF (`thomsonreuters_Thomson-1.0-Small-Q4_K_M.gguf`) + proyector `mmproj-thomsonreuters_Thomson-1.0-Small-bf16.gguf`; paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, atencion lineal u otras innovaciones) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO). La model card del paquete Loom no documenta estos aspectos y se limita a describir el artefacto de despliegue.

Lo que si se documenta es la capa de ejecucion: el paquete contiene kernels generados por `loom-next` (el generador, sin LLM en el bucle) para las arquitecturas gfx1151 y gfx1201, junto con un preset de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El checkpoint GGUF se distribuye sin modificar respecto al original de bartowski, por lo que los pesos y el comportamiento del modelo son los del base. No se aplica decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen en formato OpenAI `image_url`, con proyector multimodal dedicado (bf16).
- Tool calling / function calling con esquema compatible con OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial, segun la puerta de correccion `agent` descrita en la model card.
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Idiomas soportados: no disponible.
- Entrada y salida de audio: no soportadas ("not applicable").
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Procesamiento de documentos financieros de gran extension: con 262.144 tokens de contexto por peticion, el modelo puede ingerir informes anuales, prospectos o transcripciones de resultados completos en una sola pasada, lo que encaja con el origen Thomson Reuters del modelo base.
- Extraccion estructurada con tool calling: el soporte de `tools`/`tool_calls` permite definir esquemas JSON para extraer entidades, cifras y fechas de documentos, integrándose en pipelines de datos sin post-procesado manual del texto libre.
- Analisis de imagenes en flujos documentales: la entrada `image_url` con proyector bf16 habilita el procesamiento de capturas, graficos o paginas escaneadas junto a texto en la misma peticion.
- Agentes multi-paso sobre datos internos: el bucle de tool calling documentado en la puerta `agent` permite encadenar busquedas, consultas a API y sintesis de resultados en un solo flujo conversacional.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, lo que facilita entornos de desarrollo y prototipado en hardware AMD integrado o de gama profesional.
- Servicio de chat interno con concurrencia moderada: con 4 peticiones concurrentes y API OpenAI-compatible, es adecuado para equipos pequenos o entornos de evaluacion donde no se requiere escalado horizontal agresivo.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `logits`) estan disenadas para verificar que la salida del runtime Loom coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han re-medido aun" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el proyector de vision es bf16, pero no se publica el total de parametros ni el consumo medido.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete esta orientado a las dos plataformas AMD citadas y no se documenta soporte para otras.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete desde Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este artefacto concreto (llama.cpp se usa solo como referencia de correccion).
- Latencia y throughput: no disponibles; las tablas de rendimiento del autor estan pendientes de re-medicion.
- Parametros de ejecucion relevantes: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (precarga en host) y `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de la misma categoria. Como referencia estructural, el unico punto de comparacion documentado es llama.cpp ejecutando el mismo GGUF, utilizado como referencia de correccion (tokens greedy y top-5 log-probs) y no como alternativa de despliegue comparable en rendimiento.

## Limitaciones y advertencias

- Las mediciones de rendimiento y todas las puertas de correccion del paquete estan pendientes de re-medicion en ambas GPUs objetivo; no hay evidencia publicada de que la salida coincida con llama.cpp en esta version.
- El autor del repositorio no es el autor del modelo: se trata de un empaquetado de un GGUF de terceros (bartowski) sobre un modelo de Thomson Reuters. Cualquier problema de calidad del modelo subyacente se hereda sin cambios.
- Licencia "other": no se detallan los terminos en la informacion disponible. Es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.
- Limite de salida de 4.096 tokens y concurrencia maxima de 4 peticiones: insuficiente para cargas de produccion de alto volumen sin escalado adicional.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de dominio financiero, el riesgo de alucinacion en cifras y referencias es un caveat relevante para produccion.
- Dependencia de un runtime propietario del ecosistema Loom (`hrx-loom==0.2.0`) y de kernels generados especificamente para gfx1151 y gfx1201; la portabilidad a otro hardware no esta garantizada.
- La espera activa (`completion_spin_ns`) mantiene la CPU ocupada durante la inferencia, lo que afecta al consumo energetico y a la cohabitacion con otras cargas en el mismo equipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-thomsonreuters_Thomson-1.0-Small-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/thomsonreuters_Thomson-1.0-Small-GGUF
- Runtime AMD HRX/Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
