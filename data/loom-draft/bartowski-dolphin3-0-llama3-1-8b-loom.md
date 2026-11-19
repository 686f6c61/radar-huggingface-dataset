# loom-draft/bartowski-Dolphin3.0-Llama3.1-8B-loom

## Resumen

El modelo `loom-draft/bartowski-Dolphin3.0-Llama3.1-8B-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Dolphin3.0-Llama3.1-8B-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y esta orientado a la ejecucion sobre GPU AMD: concretamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion del paquete se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el bucle.

El modelo subyacente es Dolphin 3.0 sobre Llama 3.1 8B, un transformer denso de 8.000 millones de parametros afinado por Cognitive Computations para conversacion, razonamiento y tareas de codigo, con una ventana de contexto de 131.072 tokens. El paquete Loom expone el modelo a traves de una API compatible con el endpoint `/v1/chat/completions` de OpenAI, con soporte de 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por peticion (preset `max_tokens`).

La relevancia de esta ficha es acotada: el interes no esta en el modelo (cuyas capacidades hereda integras de Dolphin 3.0) sino en el formato de empaquetado y en la ruta de despliegue sobre hardware AMD via ROCm. En el momento de la publicacion no hay mediciones de rendimiento ni evidencia de los gates de correccion registrada para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B, empaquetado como programas Loom) |
| Parametros totales | 8.000 millones (modelo base Dolphin3.0-Llama3.1-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones disponibles en el repo base de bartowski |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json`, `model.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reproduce el grafo de computo del GGUF `Dolphin3.0-Llama3.1-8B-Q4_K_M.gguf` como programas Loom generados automaticamente. El modelo subyacente es un transformer decoder-only denso de 8B parametros con atencion causal estandar, derivado de Llama 3.1 8B y afinado por Cognitive Computations en la linea Dolphin 3.0. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica del paquete es el propio formato Loom: kernels generados por `loom-next` que se ejecutan sobre ROCm en GPU AMD, con verificacion de integridad sha256 de los ficheros fuente en `loom-fetch`. La tarjeta declara un conjunto de gates de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, sampling, logits, decision) frente a una referencia de llama.cpp grabada sobre el mismo GGUF, pero todos aparecen como "not yet re-measured" para ambas GPU objetivo, por lo que no hay evidencia registrada de paridad numerica en esta publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Dolphin 3.0.
- Razonamiento y matematicas a nivel de un modelo de 8B afinado.
- Generacion de codigo, con soporte de contexto largo (131.072 tokens).
- Procesamiento de documentos largos de hasta 32k tokens segun los prompts de referencia de los gates `golden` (1k-32k).
- Servidor con API compatible con OpenAI (`/v1/chat/completions`), invocable con `curl` o cualquier cliente OpenAI.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no soportado en este paquete (marcado "not applicable").
- Modo de razonamiento / thinking: no soportado (marcado "not applicable").
- Decodificacion especulativa: no soportada (marcada "not applicable").
- Entrada de imagen y audio: no soportadas (marcadas "not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la tarjeta.

## Casos de uso

- Asistente conversacional local sobre GPU AMD: el paquete se sirve con `loom-serve` y expone un endpoint compatible con OpenAI, de modo que cualquier cliente existente puede apuntar a `http://127.0.0.1:8080/v1/chat/completions` sin cambios de codigo. Adecuado para prototipos en estaciones de trabajo con Strix Halo o R9700.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, permite resumir, extraer y responder preguntas sobre contratos, informes o bases de codigo extensas sin salir del equipo. La cuantizacion Q4_K_M reduce el coste de memoria.
- Generacion y revision de codigo en un flujo de desarrollo interno: al ser un modelo de 8B afinado para instrucciones, sirve para autocompletado, explicacion de funciones y refactorizacion local, con la ventaja de no enviar codigo propietario a un servicio externo.
- Evaluacion de la cadena ROCm/Loom: el paquete es util como banco de pruebas para validar kernels generados frente a llama.cpp sobre el mismo GGUF, usando los gates `golden`, `compare` y `kernel_tests` descritos en la tarjeta.
- Despliegue en hardware AMD sin CUDA: para equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700 que no disponen de GPU NVIDIA, esta es una via de servir un 8B cuantizado a Q4_K_M con API HTTP y contexto largo.
- Chat de soporte interno con contexto de documentacion: 4 peticiones concurrentes y 131k tokens permiten atender a un pequeno equipo con un unico servidor, inyectando manuales o bases de conocimiento en el prompt.
- Reproducibilidad de inferencia: los ficheros `model.json.lock` y las comprobaciones sha256 de `loom-fetch` permiten fijar exactamente los pesos y programas usados, util en entornos donde se exige trazabilidad del artefacto desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del paquete indica explicitamente que las mediciones de rendimiento frente a llama.cpp "are not yet re-measured" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todos los gates de correccion figuran como "not yet re-measured". No se dispone por tanto de cifras de throughput, latencia ni paridad numerica verificada para este paquete.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, el checkpoint de un 8B ocupa aproximadamente 4,9 GB de pesos; a ello hay que sumar la cache KV para el contexto configurado. Con 131.072 tokens de contexto la cache KV crece de forma significativa y conviene dimensionar el pool en consecuencia. La tarjeta no publica cifras de memoria del preset.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: la informacion disponible no menciona soporte para GPUs de consumo AMD o NVIDIA; el paquete esta generado para las dos GPU AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. Opciones recomendadas en la tarjeta: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles (no re-medidos para este paquete).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/Dolphin3.0-Llama3.1-8B-GGUF (base de este paquete) | 8B | 131.072 | GGUF para llama.cpp | llama3.1 | Checkpoint original; el paquete Loom lo reproduce como programas `.loom` |
| Dolphin3.0-Llama3.1-8B (Cognitive Computations) | 8B | 131.072 | safetensors / Transformers | llama3.1 | Pesos originales sin cuantizar |
| Llama 3.1 8B Instruct (Meta) | 8B | 131.072 | safetensors / GGUF | llama3.1 | Modelo base del que deriva Dolphin 3.0 |

No se dispone de datos de rendimiento comparado (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todos los gates (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured"; no hay prueba registrada de que la salida coincida con la referencia de llama.cpp sobre el mismo GGUF.
- Sin mediciones de rendimiento: no hay cifras de latencia ni throughput para ninguna de las dos GPU objetivo.
- Funcionalidades ausentes en el paquete: tool calling, modo thinking, decodificacion especulativa, entrada de imagen y audio estan marcados como "not applicable". El estado del muestreo (temperature, top_k, seed) es "not determined".
- Limite de salida: 4.096 tokens por peticion, lo que puede ser insuficiente para generaciones largas.
- Idiomas: no disponibles en la informacion; las capacidades multilingues del modelo subyacente no estan documentadas en esta ficha.
- Licencia Llama 3.1: el uso comercial esta sujeto a la Llama 3.1 Community License, con las restricciones habituales (incluida la clausula de denominacion y los limites de usuarios mensuales para determinados supuestos). Conviene revisar el texto integro antes de un despliegue en produccion.
- Riesgo de alucinacion: inherente a un modelo de 8B afinado para conversacion; no hay evaluaciones de fidelidad publicadas para este paquete.
- Sesgos: no documentados en la informacion proporcionada.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la tarjeta indica que las mediciones estan pendientes; tratarlo como artefacto en fase de borrador (`loom-draft`).
- Dependencia de la cadena ROCm/Loom: requiere `hrx-loom==0.2.0` y las GPU AMD indicadas; no es portable a otras pilas de inferencia sin convertir de nuevo el GGUF.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Dolphin3.0-Llama3.1-8B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Dolphin3.0-Llama3.1-8B-GGUF
- Herramienta de generacion loom-next: https://github.com/loom-fun/loom-next
- Sistema ROCm HRX (referenciado en la tarjeta): https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
