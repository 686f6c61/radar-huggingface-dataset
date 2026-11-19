# loom-draft/unsloth-Qwen2.5-Coder-1.5B-Instruct-loom

## Resumen

`loom-draft/unsloth-Qwen2.5-Coder-1.5B-Instruct-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales del checkpoint Q4_K_M, y el aporte del autor es la generacion de kernels y programas especificos para GPUs AMD mediante la herramienta `loom-next`.

El objetivo del paquete es permitir servir el modelo en hardware AMD concreto: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling en el mismo formato y declara una ventana de contexto de 32.768 tokens por peticion con 4 peticiones concurrentes.

La relevancia es acotada y experimental: el repositorio tiene 0 descargas y 0 likes, las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, etc.) figuran como "not yet re-measured" en ambas GPUs, y el propio autor indica que fue generado solo con el generador, sin LLM en el bucle. Es util como artefacto de evaluacion del ecosistema Loom sobre hardware AMD, no como sustituto de un despliegue estandar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), empaquetado como programas Loom generados |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible en la informacion del paquete |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como `weights.loom` y programas `program/*.loom`; incluye `tokenizer.json` y `llm_config.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba y publicado con licencia Apache 2.0. El checkpoint concreto empaquetado aqui es la version Q4_K_M generada por Unsloth a partir de los pesos originales; no hay evidencia en la informacion disponible de un entrenamiento adicional, destilacion ni ajuste por RLHF/DPO por parte del autor del paquete. Los detalles de composicion del dataset de preentrenamiento y del proceso de alineacion del modelo base no se recogen en la model card del paquete.

La innovacion tecnica del repositorio no esta en el modelo sino en el pipeline de despliegue: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) especificos para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que fija los ficheros fuente con verificacion sha256 mediante `loom-fetch`. El servidor `loom-serve` acepta opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria precomprometido) y `--parameter_mode=preload` (carga de pesos en host). No se declaran decodificacion especulativa, attention linear ni modos de razonamiento extendido: la tabla de caracteristicas los marca explicitamente como "not applicable".

## Capacidades

- Generacion de texto y codigo en el estilo de Qwen2.5-Coder-1.5B-Instruct, con soporte nativo de instrucciones en formato chat.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), validado en la tabla de caracteristicas del paquete.
- Servicio HTTP compatible con OpenAI en `/v1/chat/completions`, lo que permite reutilizar clientes y SDKs existentes.
- Ventana de contexto de 32.768 tokens por peticion, adecuada para documentos y repositorios de codigo de tamano medio.
- Concurrencia de hasta 4 peticiones simultaneas con la puerta de consistencia declarada (aunque no re-medida).
- Sin soporte de razonamiento/thinking, sin `reasoning effort`, sin decodificacion especulativa, sin entrada de imagen y sin entrada/salida de audio (marcados como "not applicable" o "—").
- Capacidades multilingues: no disponibles en la informacion del paquete; dependen del modelo base Qwen2.5-Coder, no documentadas aqui.
- Muestreo (`temperature`, `top_k`, `seed`): estado "?" ("not determined") en la tabla de caracteristicas.

## Casos de uso

- Evaluacion del runtime Loom en GPUs AMD: desplegar el paquete con `loom-fetch` y `loom-serve` en Strix Halo o R9700 para medir latencia, throughput y estabilidad del stack `hrx-loom` frente a llama.cpp con el mismo GGUF Q4_K_M.
- Asistente de codigo local en estaciones de trabajo AMD: servir el modelo en una Radeon AI PRO R9700 y conectar editores o plugins mediante la API OpenAI-style, aprovechando los 32.768 tokens de contexto para autocompletado y explicacion de funciones.
- Automatizacion de tareas de refactorizacion acotadas: peticiones con contexto de archivo completo (hasta 32k tokens) para renombrar simbolos, generar docstrings o traducir fragmentos entre lenguajes, con salida limitada a 4.096 tokens.
- Integracion en pipelines de CI con tool calling: usar `tools`/`tool_calls` para que el modelo invoque scripts de lint, test o busqueda en repositorio dentro de un bucle multi-turno controlado por el orquestador.
- Prototipado de agentes ligeros en hardware de escritorio: 4 peticiones concurrentes permiten demos multi-sesion en una unica GPU sin orquestacion compleja.
- Banco de pruebas de correccion: ejecutar las puertas `golden`, `compare` y `agent` de `loom-benchmark` contra la referencia de llama.cpp para validar la fidelidad de los kernels generados antes de adoptar Loom en produccion.
- Servicio interno de bajo coste en CPU/GPU integrada: al ser un modelo de 1.5B en Q4_K_M, el paquete puede servir como backend de chat o autocompletado en entornos con recursos limitados, siempre que el hardware sea el soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB) "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion del paquete. Como referencia orientativa del checkpoint Q4_K_M de 1.5B, el peso de los parametros ronda 1 GB, pero el consumo real del runtime Loom (pool fijo, buffers de contexto de 32k tokens y 4 peticiones concurrentes) no se documenta.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: no confirmado; el paquete solo declara soporte para las dos GPUs AMD anteriores. El modelo base de 1.5B en Q4_K_M es manejable en GPUs de consumo en otros runtimes, pero este paquete Loom no lo garantiza.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como backends de este paquete; llama.cpp se usa solo como referencia de correccion en las puertas de benchmark.
- Latencia y throughput: no disponibles; las mediciones del autor estan pendientes de re-medicion en ambas GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/unsloth-Qwen2.5-Coder-1.5B-Instruct-loom` (este paquete) | 1.5B | 32.768 tokens por peticion | Apache 2.0 | GGUF Q4_K_M empaquetado como `.loom`; `loom-serve` | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks re-medidos |
| `unsloth/Qwen2.5-Coder-1.5B-Instruct-GGUF` (modelo base del paquete) | 1.5B | el del modelo base (no documentado aqui) | Apache 2.0 | GGUF; llama.cpp y otros runtimes GGUF | Pesos identicos; portabilidad a cualquier runtime GGUF |
| Qwen2.5-Coder-1.5B-Instruct (original de Alibaba) | 1.5B | no disponible en esta informacion | Apache 2.0 | safetensors y derivados | Referencia upstream; sin empaquetado especifico para AMD |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta informacion | Apache 2.0 | safetensors y GGUF | Alternativa de mayor calidad a costa de mas VRAM; no soportada por este paquete |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con otras familias (DeepSeek-Coder, CodeLlama, StarCoder2). No se dispone de cifras de benchmarks para ninguna de las filas.

## Limitaciones y advertencias

- El paquete no incluye pesos nuevos ni mejoras de calidad: hereda todas las limitaciones de Qwen2.5-Coder-1.5B-Instruct, incluido el riesgo de alucinacion en codigo y en afirmaciones factuales, y los sesgos del dataset original (no documentados en esta informacion).
- Tamano reducido (1.5B): capacidad limitada para razonamiento complejo, tareas de varios pasos y contextos que exijan recuperacion precisa de informacion en ventanas largas.
- Idiomas soportados no declarados en el paquete; no se puede asumir cobertura multilingue mas alla de lo que ofrezca el modelo base.
- Estado experimental: 0 descargas, 0 likes, creado y actualizado el mismo dia (2026-11-19), generado solo por el generador `loom-next` sin LLM en el bucle.
- Sin evidencia de correccion: todas las puertas de `loom-benchmark` figuran como "not yet re-measured" en ambas GPUs objetivo; no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Rendimiento sin medir: no hay cifras de latencia ni throughput para ninguna de las dos GPUs soportadas.
- Portabilidad restringida: el paquete esta generado para gfx1151 y gfx1201; no se declara soporte para otras GPUs AMD, NVIDIA ni CPU.
- Muestreo no determinado (`temperature`, `top_k`, `seed` marcados como "?"); el comportamiento de generacion puede diferir del esperado hasta que se valide la puerta `sampling`.
- Limite de salida de 4.096 tokens por peticion y 4 peticiones concurrentes; insuficiente para cargas de produccion con alta concurrencia.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder y del checkpoint de Unsloth antes de redistribuir.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`); cambios de version pueden alterar el comportamiento de los kernels generados.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-1.5B-Instruct-loom
- Modelo base GGUF de Unsloth: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Los resultados de busqueda web proporcionados corresponden a Loom (software de grabacion de pantalla) y Loom (marca de ropa), sin relacion con este modelo; no se han encontrado papers, blogs ni demos adicionales del paquete.
