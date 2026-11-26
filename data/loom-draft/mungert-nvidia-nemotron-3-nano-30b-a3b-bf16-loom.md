# loom-draft/Mungert-NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF `Mungert/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-GGUF`, que a su vez empaqueta el modelo NVIDIA Nemotron-3 Nano 30B-A3B en precision BF16. El paquete esta publicado por el usuario `loom-draft` y esta pensado especificamente para ejecutar el modelo sobre GPUs AMD: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la tarjeta AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi la denominacion 30B-A3B), desarrollado por NVIDIA. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta modo de razonamiento activado por defecto (desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`) y declara una ventana de contexto de 262.144 tokens por peticion con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto.

La relevancia de este artefacto es practica: permite servir un modelo MoE de 30B en hardware AMD consumer y profesional (Strix Halo y R9700) mediante el runtime Loom de ROCm, sin depender de CUDA ni de llama.cpp, a cambio de perder las optimizaciones de ecosistema de este ultimo. Cabe senalar que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, etc.) figuran como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de rendimiento para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; runtime de despliegue Loom (ROCm) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | aproximadamente 3.000 millones (3B), segun la denominacion A3B |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | El paquete referencia el fichero `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-q4_k_m.gguf` (Q4_K_M); el checkpoint base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base), empaquetado como paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Tool calling | No aplicable segun la model card |
| Decodificacion especulativa | No aplicable segun la model card |

## Arquitectura y entrenamiento

El modelo subyacente, NVIDIA Nemotron-3 Nano 30B-A3B, es un transformer con capas de mezcla de expertos (MoE): 30.000 millones de parametros almacenados, de los cuales unos 3.000 millones se activan por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. El checkpoint distribuido por `Mungert` esta en BF16 y el paquete Loom consume una conversion Q4_K_M en GGUF.

En cuanto al entrenamiento, la informacion proporcionada no incluye datos sobre volumen de tokens, composicion del dataset, ni si se aplicaron etapas de RLHF o DPO; estos datos deben consultarse en la model card original de NVIDIA, no disponible en esta ficha. La innovacion tecnica destacable de este artefacto no esta en el modelo sino en el runtime: Loom genera kernels especificos para gfx1151 y gfx1201, ofrece un pool de memoria de tipo `fixed` (compromiso previo de memoria) frente a `elastic`, modo `preload` de pesos en host, espera activa de completions en GPU mediante `completion_spin_ns=4294967295` y un conjunto de puertas de validacion (`golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion con `chat_template_kwargs: {"enable_thinking": false}`.
- Ventana de contexto larga: 262.144 tokens por peticion, adecuada para documentos extensos o historiales de conversacion prolongados.
- Concurrencia de hasta 4 peticiones simultaneas con salida de hasta 4.096 tokens por peticion.
- Soporte de tool calling: no aplicable segun la model card del paquete.
- Soporte de agentes multi-step: no confirmado; la puerta `agent` existe en el benchmark pero figura como no re-medida.
- Entrada de imagen: no determinado ("?" en la tabla de caracteristicas).
- Entrada y salida de audio: no determinado.
- Decodificacion especulativa: no aplicable.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone `/v1/chat/completions`, de modo que cualquier cliente compatible con OpenAI puede apuntar a `http://127.0.0.1:8080` sin cambios de codigo.
- Analisis de documentos largos: la ventana de 262.144 tokens permite introducir contratos, informes o bases de codigo extensas en una sola peticion, algo inviable con contextos de 8k-32k.
- Razonamiento asistido con modo thinking: al estar el razonamiento activado por defecto, resulta adecuado para tareas de analisis paso a paso donde la latencia no es critica; en tareas de baja latencia puede desactivarse por peticion.
- Despliegue en hardware AMD sin CUDA: equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700 pueden servir el modelo mediante ROCm y Loom, evitando la dependencia de GPUs NVIDIA.
- Prototipado e investigacion de runtimes: las puertas de validacion (`golden`, `compare`, `logits`, `sampling`) permiten comparar la fidelidad numerica del runtime Loom frente a llama.cpp sobre el mismo GGUF, util para equipos que evaluan motores de inferencia alternativos.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en herramientas internas de equipo pequeno (resumen de reuniones, generacion de borradores, busqueda asistida) mas que en servicios publicos de alto trafico.
- Evaluacion de modelos MoE en memoria unificada: Strix Halo comparte memoria entre CPU y GPU, lo que permite cargar el GGUF Q4_K_M con `--pool_backing=fixed` y medir el comportamiento de un MoE de 30B en un solo SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput para este paquete.

## Requisitos de hardware

- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible con cifras medidas; el checkpoint consumido es un GGUF Q4_K_M de un modelo de 30B parametros, y la R9700 se documenta con 32 GB, lo que deja margen para el pool de memoria y el contexto.
- Cabe en GPU consumer: si, en el SoC Strix Halo (memoria unificada) y en la R9700; no se documenta soporte para GPUs NVIDIA en este paquete.
- Opciones de despliegue: runtime Loom via `hrx-loom[hf]==0.2.0` (`loom-fetch` para descargar el paquete y `loom-serve` para servirlo). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto; llama.cpp se usa unicamente como referencia de correccion.
- Parametros de servicio documentados: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`, `--materialize=copy`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (Nemotron-3 Nano 30B-A3B, Loom) | 30B | ~3B | 262.144 | MIT | GGUF Q4_K_M empaquetado en Loom | Publicado en Hugging Face, 0 descargas |
| Checkpoint base `Mungert/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-GGUF` | 30B | ~3B | no disponible en esta ficha | MIT (segun este paquete) | GGUF | Publicado en Hugging Face |
| llama.cpp sobre el mismo GGUF | 30B | ~3B | no disponible | no disponible | GGUF | Referencia de correccion usada por Loom |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estas alternativas; la unica comparacion documentada es metodologica (igualdad token a token frente a llama.cpp), sin resultados registrados.

## Limitaciones y advertencias

- Ausencia de evidencia de rendimiento: todas las mediciones y puertas de correccion figuran como "not yet re-measured"; no debe asumirse paridad con llama.cpp sin verificacion propia.
- Paquete sin traccion: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la probabilidad de que los problemas de despliegue esten ya reportados por terceros.
- Alcance de hardware muy restringido: solo se documentan gfx1151 (Strix Halo) y gfx1201 (R9700); no hay soporte declarado para GPUs NVIDIA, otras AMD ni CPU.
- Tool calling marcado como "not applicable" y agentes multi-step sin confirmar; no disenar flujos agenticos sobre este paquete sin validacion previa.
- Capacidades de vision y audio sin determinar ("?"), por lo que no deben usarse entradas multimodales.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por defecto: no apto para servicios de alto trafico sin ajuste del preset.
- Idioma: no se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion y sesgos: inherente al modelo base; la informacion proporcionada no documenta evaluaciones de sesgo ni de factualidad.
- Licencia MIT declarada en este paquete, pero conviene verificar la licencia y condiciones del modelo original de NVIDIA antes de uso comercial, ya que la ficha no las reproduce.
- El paquete se genera con `loom-next` sin LLM en el bucle ("the generator alone, no LLM in the loop"), lo que implica que la validacion semantica corre a cargo del usuario.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/Mungert-NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-loom
- Checkpoint base GGUF: https://huggingface.co/Mungert/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
