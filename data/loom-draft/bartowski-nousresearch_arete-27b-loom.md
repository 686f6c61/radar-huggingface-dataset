# loom-draft/bartowski-NousResearch_Arete-27B-loom

## Resumen

`loom-draft/bartowski-NousResearch_Arete-27B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por `loom-next` a partir del checkpoint GGUF sin modificar `bartowski/NousResearch_Arete-27B-GGUF`, en concreto la cuantizacion `Q4_K_M`. No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que traduce los pesos GGUF originales a un formato ejecutable por el runtime `loom-serve` sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, NousResearch Arete-27B, es un transformer de 27.000 millones de parametros con capacidad de vision (pipeline `image-text-to-text` y proyector multimodal `mmproj-NousResearch_Arete-27B-bf16.gguf`), modo de razonamiento activado por defecto y soporte de tool calling estilo OpenAI. La ficha resulta relevante para quienes trabajan con hardware AMD y quieren servir un modelo de 27B con vision y contexto largo sin depender de CUDA ni de llama.cpp como backend de ejecucion.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB y no incluye pesos propios: el fetch se realiza contra el repositorio base mediante `loom-fetch`. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NousResearch Arete-27B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no aplicable |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente mas alla de lo que se deduce del pipeline (`image-text-to-text`) y de la presencia de un proyector multimodal separado, lo que implica un transformer con torre de vision y adaptador hacia el espacio de embeddings del modelo de lenguaje. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en la informacion proporcionada.

La innovacion tecnica del artefacto no reside en el modelo sino en el runtime: `loom-next` genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` expone una API compatible con OpenAI. El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con tolerancia a empates cercanos. En la version publicada, todas las puertas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Entrada de imagenes en formato OpenAI `image_url`, procesadas por el proyector `mmproj-NousResearch_Arete-27B-bf16.gguf`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial, validados por las puertas `agent` y `agent_think_off`.
- Contexto largo de hasta 262.144 tokens por peticion.
- Servicio concurrente de hasta 4 peticiones.
- API compatible con `/v1/chat/completions`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio: no soportado.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: el contexto de 262.144 tokens permite introducir informes completos, capturas y tablas en una sola peticion sin trocear, y el modelo responde citando el contenido visual y textual conjuntamente.
- Asistentes de agente con herramientas: el soporte de `tools`/`tool_calls` y las puertas de validacion de bucles multi-turno permiten construir agentes que consultan APIs, ejecutan busquedas y encadenan pasos con historial reutilizado.
- Procesamiento de tickets de soporte con capturas de pantalla: la entrada `image_url` posibilita adjuntar la captura del error junto al texto del usuario y obtener un diagnostico en la misma llamada.
- Despliegue en estaciones de trabajo AMD sin CUDA: `loom-serve` sobre Strix Halo o R9700 ofrece una alternativa nativa para equipos con GPU integrada o profesional de AMD, evitando la dependencia de stack NVIDIA.
- Razonamiento profundo por lotes: con `reasoning_effort: xhigh` y thinking activado se pueden generar cadenas de razonamiento largas para tareas de matematicas o analisis, y desactivarlo en produccion para reducir latencia.
- Extraccion estructurada de datos de formularios escaneados: combinando vision y tool calling, el modelo puede leer un documento y emitir una llamada a funcion con los campos extraidos en JSON.
- Prototipado de chatbots internos: la API compatible con OpenAI permite apuntar clientes existentes al endpoint local con un cambio de URL y nombre de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" ("the results for this package are not yet re-measured"), y que todas las puertas de correccion figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 27B, lo que en la practica ronda los 16-17 GB de pesos, mas el proyector de vision en bf16 y las estructuras de contexto. El preset de R9700 asume 32 GB.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete; el runtime es especifico de AMD.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` instalado con `pipx`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Flags recomendados por el autor: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este paquete (Arete-27B Q4_K_M en Loom) | 27B | 262.144 | Si | Apache 2.0 | loom-serve sobre AMD gfx1151/gfx1201 |
| `bartowski/NousResearch_Arete-27B-GGUF` (base) | 27B | no disponible | Si (mismo proyector) | Apache 2.0 | llama.cpp y derivados |
| Alternativas de 27B con vision en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el propio checkpoint base: este paquete no modifica los pesos, solo cambia el runtime de ejecucion y anade validacion contra la referencia de llama.cpp. No se dispone de datos de rendimiento comparado que permitan afirmar cual de los dos backends es mas rapido en el hardware objetivo.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo: no contiene pesos propios (tamano de repo 0.0 GB) y depende de `loom-fetch` para descargar el GGUF base.
- Sin evidencia de correccion publicada: todas las puertas de la tabla de correctness figuran como "not yet re-measured", por lo que no hay garantia documentada de equivalencia con llama.cpp en esta version.
- Rendimiento no medido: no hay cifras de throughput ni latencia para ninguna de las dos GPUs objetivo.
- Hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no funciona en GPUs NVIDIA ni en otras AMD no listadas.
- Limite de salida de 4.096 tokens por defecto, insuficiente para generar documentos largos sin ajustar el preset.
- Concurrencia limitada a 4 peticiones simultaneas, lo que restringe su uso como servidor de produccion con trafico alto.
- Idiomas soportados no documentados; no se puede asumir calidad en castellano sin evaluacion previa.
- Riesgo de alucinacion y sesgos: no disponibles en la informacion proporcionada; al ser un modelo de 27B sin datos de evaluacion publicados en este paquete, conviene validar en el dominio concreto antes de desplegar.
- Licencia Apache 2.0 declarada por el empaquetador, heredada del modelo base; conviene verificar las condiciones del repositorio original de NousResearch antes de uso comercial.
- El modo thinking viene activado por defecto y con `reasoning_effort: xhigh`, lo que incrementa coste y latencia si no se desactiva explicitamente.
- Cero descargas y cero likes: sin comunidad que haya validado el paquete en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-NousResearch_Arete-27B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
