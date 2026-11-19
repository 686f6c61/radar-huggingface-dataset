# loom-draft/ggml-org-LFM2.5-24B-A2B-loom

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, del que se publica un checkpoint cuantizado en formato GGUF bajo el identificador `ggml-org/LFM2.5-24B-A2B-GGUF`. La ficha que nos ocupa, `loom-draft/ggml-org-LFM2.5-24B-A2B-loom`, no contiene pesos nuevos ni un ajuste fino: es un paquete de despliegue generado con la herramienta `loom-next` que empaqueta el GGUF original (concretamente la cuantizacion `Q4_K_M`) en programas `.loom` y una tarjeta `model.json` para ejecutarlo sobre GPUs AMD mediante el runtime Loom.

El objetivo del artefacto es permitir la inferencia local del modelo en hardware AMD de consumo y profesional, en concreto el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y modo de razonamiento siempre activo, con una ventana de contexto de 131.072 tokens por peticion y hasta 4 peticiones concurrentes. Es relevante porque demuestra una via de ejecucion de un MoE de 24B en GPUs AMD sin pasar por ROCm/HIP convencional, usando el stack Loom.

No se dispone de informacion sobre el pipeline, los idiomas soportados ni los detalles de entrenamiento del modelo base en la informacion proporcionada; los datos tecnicos disponibles provienen de la model card del paquete de despliegue y de los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) segun el nombre del modelo; detalles del transformer no disponibles |
| Parametros totales | 24B (segun el identificador del modelo) |
| Parametros activos | 2B (sufijo A2B del identificador) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; terminos concretos no disponibles) |
| Formato de pesos | GGUF (empaquetado en programas `.loom` y `weights.loom`) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, segun se deduce del identificador `LFM2.5-24B-A2B`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; la model card del paquete de despliegue no incluye estos datos y la busqueda web no aporta documentacion tecnica del modelo base.

El artefacto en si no modifica los pesos: toma el checkpoint GGUF original y genera, mediante `loom-next` (sin intervencion de un LLM en el bucle), un conjunto de programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201. El paquete incluye `tokenizer.json`, `llm_config.json`, `info.json` con las mediciones y evidencias de los gates de correccion, y `REPORT.md`. La ejecucion se realiza con `loom-serve`, que permite configurar el sondeo activo de finalizacion en GPU (`completion_spin_ns`), la reserva fija del pool de memoria (`--pool_backing=fixed`) y la precarga de pesos (`--parameter_mode=preload`). No se documentan innovaciones de decodificacion especulativa (marcada como no aplicable) ni atencion lineal.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema OpenAI (`tools` y `tool_calls`), validado por el gate `agent` de la suite de correccion.
- Modo de razonamiento (`reasoning`/`thinking`) siempre activo; no admite ajuste de esfuerzo de razonamiento.
- Soporte de contextos largos de hasta 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas, con gate de consistencia para verificar que la salida concurrente coincide con la ejecucion aislada.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- No soporta entrada de imagen ni audio, ni decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo puede servirse en una Radeon AI PRO R9700 de 32 GB o en un APU Strix Halo y atender peticiones por HTTP con formato OpenAI, lo que permite sustituir una API en la nube por inferencia on-premise sin cambiar el codigo cliente.
- Analisis de documentos largos: con 131.072 tokens de contexto por peticion, es adecuado para resumir contratos, informes tecnicos o expedientes completos en una sola pasada, algo inviable en modelos con ventanas de 8k o 32k.
- Agentes con herramientas en local: el soporte de `tool_calls` y el gate `agent` (que verifica el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas) lo hacen apto para flujos multi-turno que consultan APIs internas o bases de datos.
- Automatizacion de atencion al cliente en entornos con requisitos de privacidad: al ejecutarse sobre hardware propio y sin dependencia de servicios externos, permite procesar conversaciones con datos sensibles dentro del perimetro de la organizacion.
- Prototipado y evaluacion de modelos MoE en GPUs AMD: el paquete incluye gates de correccion (`kernel_tests`, `golden`, `compare`, `logits`, `sampling`) que permiten comparar la salida contra llama.cpp token a token, util para equipos que validan stacks de inferencia alternativos.
- Generacion asistida en pipelines de desarrollo: la API compatible con OpenAI permite integrarlo en herramientas de CI/CD o editores que ya hablan ese protocolo, con la salvedad de que el rendimiento aun no esta medido en este paquete.
- Despliegue en equipos de sobremesa con APU: el Strix Halo integra CPU y GPU en un solo paquete, de modo que un equipo compacto puede servir un MoE de 24B cuantizado a Q4_K_M sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete «no se han vuelto a medir» tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de correccion figuran como «not yet re-measured». No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 24B, y la GPU de referencia R9700 dispone de 32 GB, lo que sugiere que el paquete esta dimensionado para caber en esa capacidad.
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no confirmada; no se mencionan modelos como RX 7900 XTX, RX 9070 ni equivalentes.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp estan pendientes de medicion.
- Opciones de ejecucion relevantes: `completion_spin_ns=4294967295` (espera activa de finalizacion en GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (precarga de pesos en host).

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (este paquete) | 24B / 2B | 131.072 tokens | other | GGUF empaquetado en `.loom` | Paquete Loom para AMD gfx1151 y gfx1201 |
| ggml-org/LFM2.5-24B-A2B-GGUF (base) | 24B / 2B | no disponible | other | GGUF | Hugging Face, ejecutable con llama.cpp |
| Otros MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato y disponibilidad.

## Limitaciones y advertencias

- La licencia figura como `other`; no se detallan los terminos, por lo que el uso comercial requiere consultar la licencia del modelo base `ggml-org/LFM2.5-24B-A2B-GGUF` antes de desplegarlo en produccion.
- Todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidos en este paquete; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- El rendimiento frente a llama.cpp no se ha vuelto a medir en ninguna de las dos plataformas soportadas, de modo que no hay cifras de latencia ni throughput verificadas para este paquete.
- El paquete esta restringido a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPUs, incluidas las de consumo habituales.
- El modo de razonamiento esta siempre activo y no permite ajustar el esfuerzo, lo que puede incrementar la latencia y el consumo de tokens en tareas simples.
- La salida maxima esta limitada a 4.096 tokens por peticion, insuficiente para generar documentos extensos en una sola respuesta.
- No hay soporte de imagen ni audio, pese a que la suite de gates incluye una prueba `vision` que en este caso no aplica al modelo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo base.
- El repositorio no registra descargas ni interacciones, y la model card esta truncada en el apartado de archivos (`REPORT.md`), lo que limita la verificacion independiente del contenido del paquete.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/ggml-org-LFM2.5-24B-A2B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/LFM2.5-24B-A2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
