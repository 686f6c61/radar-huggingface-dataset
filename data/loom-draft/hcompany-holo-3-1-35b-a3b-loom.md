# loom-draft/Hcompany-Holo-3.1-35B-A3B-loom

## Resumen

Holo-3.1-35B-A3B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Hcompany, distribuido originalmente en formato GGUF y publicado bajo licencia Apache 2.0. Su nomenclatura indica una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos grandes con coste de inferencia reducido. El checkpoint base es `Hcompany/Holo-3.1-35B-A3B-GGUF`, en su cuantizacion `q4_k_m.gguf`.

La ficha que nos ocupa, `loom-draft/Hcompany-Holo-3.1-35B-A3B-loom`, no es un modelo nuevo ni un fine-tuning de pesos: es un paquete de despliegue para el ecosistema Loom, generado con la herramienta `loom-next`. Convierte el GGUF original en programas `.loom` y un `model.json` que permiten servir el modelo en GPUs AMD concretas mediante `loom-serve`, con una API compatible con OpenAI. El checkpoint subyacente no se modifica.

Su relevancia es operativa: ofrece una via para ejecutar un modelo multimodal de 35B con 262.144 tokens de contexto en hardware AMD de consumo y estaciones de trabajo (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700), sin depender de CUDA ni de llama.cpp como runtime. No obstante, el paquete es un borrador (`loom-draft`) sin descargas ni validacion publicada: todas las puertas de correctitud y las mediciones de rendimiento figuran como no re-medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica MoE; el paquete no detalla la arquitectura interna) |
| Parametros totales | 35B (aproximado, segun nomenclatura) |
| Parametros activos | ~3B (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`q4_k_m.gguf`) empaquetado como programas `.loom` + `weights.loom`; proyector vision `mmproj.f16.gguf` |
| Entrada multimodal | imagen + texto (pipeline `image-text-to-text`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del checkpoint base. La nomenclatura `35B-A3B` es consistente con un transformer de mezcla de expertos con unos 35.000 millones de parametros totales y unos 3.000 millones activos por token, pero esta ficha no puede confirmar el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de entrenamiento a partir de la informacion disponible. Tampoco se detallan el volumen de tokens de preentrenamiento, las etapas de ajuste (SFT, RLHF, DPO) ni innovaciones como decodificacion especulativa; de hecho, la tabla de caracteristicas del paquete marca la decodificacion especulativa como "no aplicable".

Lo que si describe el paquete es la capa de ejecucion. `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF sin modificar, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El modelo incluye un proyector multimodal separado (`mmproj.f16.gguf`) para la entrada de imagenes, y un modo de razonamiento ("thinking") activado por defecto que puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explicito ("thinking") activado por defecto, desactivable por peticion.
- Entrada de imagenes en formato `image_url` al estilo OpenAI, con proyector `mmproj.f16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Flujos de agente multi-paso con reutilizacion de historial, segun las puertas de correctitud `agent` y `agent_think_off` definidas en el paquete.
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas con consistencia declarada entre ejecucion concurrente y aislada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio: no soportado (marcado como "no aplicable").
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas del paquete.

## Casos de uso

- Analisis de documentos largos con soporte visual: gracias a los 262.144 tokens de contexto, se puede enviar un informe extenso junto con graficos o capturas y pedir un resumen o extraccion de datos concretos en una sola peticion.
- Automatizacion de agentes con herramientas: el soporte de `tools`/`tool_calls` y las puertas `agent` del paquete permiten construir bucles de razonamiento multi-paso que consultan APIs externas, con la opcion de desactivar el modo thinking para reducir latencia.
- Procesamiento de capturas y formularios: la entrada de imagen via `image_url` habilita la extraccion de campos de facturas, tickets o pantallas de aplicacion en pipelines de digitalizacion.
- Asistente de codigo en estacion de trabajo AMD: el modelo puede servir como backend local de un asistente de programacion en equipos con Radeon AI PRO R9700, evitando el envio de codigo a servicios externos.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse localmente con `loom-serve` y licencia Apache 2.0, es apto para entornos donde los datos no pueden salir de la infraestructura.
- Evaluacion de alternativas de runtime en hardware AMD: util para equipos que quieran comparar `loom-serve` frente a llama.cpp sobre el mismo GGUF, usando las puertas de correctitud (`golden`, `compare`, `logits`) como criterio.
- Prototipado de chat multimodal interno: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local sin reescribir el cliente, con un maximo de 4.096 tokens de salida por respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavia", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint Q4_K_M de un modelo de 35B ronda los 20 GB de pesos, a lo que se suma el proyector de vision `mmproj.f16.gguf`; el paquete esta pensado para GPUs con 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Ryzen AI Max+ 395.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: el paquete no declara soporte para GPUs de consumo convencionales; el hardware objetivo son APUs y GPUs profesionales AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch huggingface:loom-draft/Hcompany-Holo-3.1-35B-A3B-loom:chat --materialize=copy` y servicio con `loom-serve --model=... '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue: el GGUF base es compatible con llama.cpp y derivados (Ollama, etc.), aunque este paquete concreto solo documenta `loom-serve`.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete estan pendientes de re-medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparacion cuantitativa fiable con otros modelos MoE multimodales de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Holo-3.1-35B-A3B (paquete Loom) | 35B totales / ~3B activos | 262.144 | Apache 2.0 | GGUF empaquetado en `.loom` | Borrador, sin mediciones publicadas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio es un borrador (`loom-draft`) con 0 descargas y 0 likes; no hay evidencia publica de validacion por terceros.
- Todas las puertas de correctitud del paquete figuran como "no re-medidas": no hay prueba publicada de que la salida coincida con la referencia de llama.cpp en texto, vision, tool calling, muestreo ni logits.
- No hay mediciones de rendimiento publicadas para ninguna de las dos GPUs objetivo.
- El soporte de muestreo (temperature, top_k, seed) esta marcado como "no determinado" en la tabla de caracteristicas, lo que limita el control fino de la generacion.
- La decodificacion especulativa no esta soportada, lo que puede penalizar el throughput en comparacion con runtimes que si la implementan.
- El limite de 4.096 tokens de salida por respuesta puede ser insuficiente para tareas de generacion larga, aunque es configurable en el preset.
- Solo se empaqueta la cuantizacion Q4_K_M; no hay variantes de mayor o menor precision en este repositorio.
- El modelo esta restringido a hardware AMD gfx1151 y gfx1201; no es portable a CUDA ni a otras GPUs sin pasar por el GGUF original y otro runtime.
- No se documentan sesgos, composicion del dataset ni evaluaciones de seguridad del checkpoint base.
- Los idiomas soportados no estan declarados; el rendimiento en castellano no puede verificarse con la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse en el repositorio original de Hcompany.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/Hcompany-Holo-3.1-35B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
