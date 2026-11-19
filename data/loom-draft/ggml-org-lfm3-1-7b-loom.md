# loom-draft/ggml-org-LFM3-1.7B-loom

## Resumen

LFM3-1.7B para AMD Loom es un paquete de despliegue (no un modelo entrenado desde cero) que empaqueta el checkpoint GGUF sin modificar `LFM3-1.7B-Q4_K_M.gguf`, publicado por ggml-org, en el formato `.loom` que consume el runtime `loom-serve` de AMD. Lo distribuye el usuario `loom-draft` y se ha generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle), según indica la model card. El objetivo es ejecutar un modelo de 1.700 millones de parametros en GPUs AMD concretas —Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB)— mediante kernels generados para ROCm, sin pasar por llama.cpp.

El modelo subyacente es LFM3-1.7B, un transformer de 1.700 millones de parametros con ventana de contexto declarada de 262.144 tokens por peticion, soporte de tool calling estilo OpenAI y un modo de razonamiento ("thinking") activado por defecto. El paquete expone una API compatible con `/v1/chat/completions` y admite 4 peticiones concurrentes con un maximo de 4.096 tokens de salida por preset.

Su relevancia es acotada pero clara: demuestra el estado del ecosistema Loom para aceleradores AMD de consumo y estaciones de trabajo, y ofrece una via de ejecucion de un modelo pequeno con contexto muy largo en hardware que no es NVIDIA. La informacion publicada es escasa: no hay benchmarks de calidad del modelo, las mediciones de rendimiento frente a llama.cpp figuran como "not yet re-measured" y la model card no documenta el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B; detalles de atencion no disponibles) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `LFM3-1.7B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos concretos no disponibles) |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) con `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no entrena nada: toma el GGUF `LFM3-1.7B-Q4_K_M.gguf` de ggml-org y genera, mediante `loom-next`, un conjunto de programas `.loom` (kernels) y una tarjeta `model.json` con los ficheros fuente fijados por sha256. La model card no aporta detalles sobre la arquitectura interna del modelo base (tipo de atencion, normalizacion, tokenizador mas alla de `tokenizer.json`) ni sobre su entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documenta la innovacion tecnica del modelo base; la innovacion del paquete es de infraestructura, no de modelado.

En el plano de despliegue, `loom-serve` ejecuta los kernels generados sobre ROCm con opciones relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). Segun la model card, las mediciones de rendimiento se hicieron con la espera activa, pero sin `preload` salvo en los trabajos que lo usaban. No se declara decodificacion especulativa (marcada como "not applicable").

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento ("thinking") activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion amplios.
- Concurrencia de 4 peticiones simultaneas con el preset incluido.
- Multilingue: no disponible (la model card no detalla idiomas).
- Vision: no soportada ("not applicable").
- Audio de entrada o salida: no soportado ("not applicable").
- Decodificacion especulativa: no soportada.
- Ajuste de "reasoning effort": no aplicable en este paquete.
- Muestreo (temperature, top_k, seed): marcado como "not determined" en la model card, aunque existe una puerta de validacion `sampling` en el banco de pruebas.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: desplegar `loom-serve` en una Radeon AI PRO R9700 y servir un chatbot interno con API compatible con OpenAI, sin depender de CUDA ni de servicios en la nube.
- Procesamiento de documentos largos en una sola pasada: con 262.144 tokens de contexto, se pueden ingerir contratos, informes o transcripciones extensas y hacer preguntas sobre ellos sin trocear el texto.
- Agente con tool calling en bucle multi-turno: el soporte de `tools`/`tool_calls` y la puerta `agent` del banco de pruebas permiten construir agentes que consultan APIs o bases de datos internas; conviene validar el bucle con la puerta `agent` antes de produccion.
- Pruebas de concepto en hardware de consumo AMD: un equipo con Ryzen AI Max+ 395 "Strix Halo" puede ejecutar el modelo en local para prototipos de asistentes o automatizaciones, con un unico fichero Q4_K_M y sin GPU dedicada.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para medir kernels generados por Loom frente a llama.cpp sobre el mismo GGUF, aprovechando las puertas `golden`, `compare` y `logits`.
- Servicio de razonamiento ligero con modo thinking: activar el modo de razonamiento por defecto para tareas de analisis paso a paso (clasificacion con justificacion, extraccion estructurada) y desactivarlo cuando se priorice latencia.
- Backend de bajo coste para herramientas de desarrollo: integracion en un IDE o CLI que consuma `/v1/chat/completions` en local para autocompletado o explicacion de codigo, aceptando el limite de 4.096 tokens de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Respecto al rendimiento de ejecucion frente a llama.cpp, la model card incluye secciones para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) pero ambas indican: "the results for this package are not yet re-measured". Las puertas de correccion del banco de pruebas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia registrada de correccion numerica ni de paridad con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de 1,7B, lo que en la practica es un modelo muy pequeno (del orden de 1-1,5 GB de pesos), pero la model card no publica cifras de memoria del pool.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para ROCm/AMD.
- Cabe en GPU de consumo: si, en las APUs/GPUs AMD indicadas; no se documenta compatibilidad con otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de repetir.
- Nota operativa: la espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU, lo que afecta al consumo energetico y a la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B (paquete Loom) | 1,7B | 262.144 tokens | `.loom` sobre `loom-serve`, GPUs AMD | other | Paquete de despliegue; sin benchmarks publicados |
| LFM3-1.7B-GGUF (ggml-org) | 1,7B | no disponible en la informacion | GGUF sobre llama.cpp | no disponible | Checkpoint de origen, sin modificar |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No hay datos de rendimiento del paquete que permitan una comparacion cuantitativa con alternativas; la unica comparacion documentada es metodologica (paridad con llama.cpp sobre el mismo GGUF), y sus resultados estan pendientes.

## Limitaciones y advertencias

- La licencia es "other" y hereda los terminos del modelo base; no se detallan condiciones de uso comercial, por lo que hay que consultar la licencia de LFM3-1.7B antes de desplegar en produccion.
- Ausencia total de evidencia de correccion: todas las puertas del banco de pruebas figuran como "not yet re-measured" en ambas GPUs.
- Sin benchmarks de calidad ni de rendimiento publicados; no es posible estimar throughput ni latencia a partir de la informacion disponible.
- El paquete solo cubre dos aceleradores AMD concretos (gfx1151 y gfx1201); no hay soporte declarado para otras GPUs.
- Limite de 4.096 tokens de salida por preset y 4 peticiones concurrentes, insuficiente para cargas de alta concurrencia.
- Riesgo de alucinacion y sesgos: no documentados en la model card; al ser un modelo de 1,7B, la fiabilidad en tareas de razonamiento complejo es limitada por tamano, aunque no se aportan datos.
- Idiomas soportados no declarados; no se puede garantizar calidad en castellano sin evaluacion previa.
- El muestreo figura como "not determined": el comportamiento de temperature, top_k y seed no esta verificado.
- La espera activa de finalizaciones en GPU incrementa el uso de CPU y el consumo energetico durante la inferencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19): no hay historial de uso ni validacion por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-LFM3-1.7B-loom
- Modelo base (GGUF): https://huggingface.co/ggml-org/LFM3-1.7B-GGUF
- Runtime Loom para ROCm (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
