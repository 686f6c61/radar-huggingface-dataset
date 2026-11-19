# loom-draft/ggml-org-Muse-Glimmer-30B-loom

## Resumen

Muse-Glimmer-30B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/Muse-Glimmer-30B-GGUF`, concretamente la cuantizacion `Muse-Glimmer-30B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta orientado a dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original y lo que aporta el repositorio es la capa de ejecucion nativa para el runtime Loom.

El modelo base es multimodal (pipeline `image-text-to-text`), con 30.000 millones de parametros segun la nomenclatura del checkpoint, ventana de contexto de 131.072 tokens por peticion y soporte de tool calling y modo de razonamiento siempre activo. La generacion del paquete se realizo con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle, y el resultado se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero concreta: permite servir un modelo de 30B cuantizado en Q4_K_M sobre hardware AMD de consumo y estacion de trabajo (Strix Halo y R9700) mediante una API compatible con OpenAI, sin depender de CUDA ni de llama.cpp en tiempo de ejecucion. El repositorio, sin embargo, esta en estado de borrador: cero descargas, cero likes y todas las puertas de correccion y rendimiento sin volver a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint GGUF del modelo base; no se detalla en la informacion proporcionada) |
| Parametros totales | 30B (segun nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete); proyector vision en BF16 (`mmproj-Muse-Glimmer-30B-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, posible mezcla de expertos) ni sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, fases de RLHF o DPO. La model card del paquete Loom no describe el modelo, solo el empaquetado y el procedimiento de servicio. Lo unico verificable es que se trata de un modelo multimodal con torre de vision separada (proyector `mmproj-Muse-Glimmer-30B-BF16.gguf`) y que el checkpoint original se distribuye en formato GGUF, lo que sugiere una conversion previa desde pesos de otro formato, sin que se detalle el origen.

La innovacion tecnica del repositorio no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201 a partir del GGUF y de `llm_config.json`, y `loom-serve` los ejecuta sobre ROCm/HIP con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida con una referencia de llama.cpp sobre el mismo GGUF; en la version publicada ninguna de ellas tiene medicion registrada.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» siempre activo (no configurable por esfuerzo: el campo de reasoning effort figura como no aplicable).
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, procesadas por el proyector BF16 incluido.
- Tool calling con esquema OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial (validado por la puerta `agent`, aunque sin medicion publicada).
- Servicio concurrente: 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- Capacidades multilingues: no disponible.
- Sin soporte de audio (entrada ni salida) y sin decodificacion especulativa.

## Casos de uso

- Asistente multimodal local sobre Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` y consumirlo desde cualquier cliente compatible con la API de OpenAI, sin GPU discreta ni CUDA. Adecuado para prototipado y demos en hardware AMD integrado.
- Analisis de documentos e imagenes en estacion de trabajo: con 131.072 tokens de contexto y entrada de imagen, permite enviar capturas, diagramas o paginas escaneadas junto a instrucciones largas en una sola peticion.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir asistentes que consulten APIs internas o ejecuten acciones, manteniendo los datos en la maquina.
- Despliegue en Radeon AI PRO R9700 para inference server de pequeno equipo: 32 GB de VRAM y 4 peticiones concurrentes encajan en un servicio interno de baja concurrencia con requisitos de soberania de datos.
- Evaluacion y desarrollo del runtime Loom: el paquete sirve como caso de prueba reproducible para comparar kernels generados contra llama.cpp sobre el mismo GGUF, util para quien trabaja en el ecosistema ROCm.
- Generacion de codigo asistida en entornos sin NVIDIA: al no requerir CUDA, puede integrarse en flujos de desarrollo sobre equipos AMD, aunque el limite de 4.096 tokens de salida restringe la generacion de archivos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican explicitamente que «the results for this package are not yet re-measured». Del mismo modo, las puertas de correccion figuran como «not yet re-measured» en ambas plataformas, por lo que no hay evidencia registrada de fidelidad numerica, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: un checkpoint de 30B en Q4_K_M ocupa del orden de 17-19 GB en pesos, mas el proyector de vision en BF16 y el pool de memoria fijo del runtime; no se publica una cifra oficial en la informacion disponible.
- GPU soportadas de forma explicita: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada).
- Cabe en GPU de consumo AMD con memoria suficiente (24-32 GB); no se documenta soporte para GPUs NVIDIA ni para ROCm sobre otras arquitecturas en este paquete.
- Despliegue: exclusivamente mediante `hrx-loom[hf]==0.2.0` (`loom-fetch` y `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de servicio para este paquete, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (paquete Loom) | 30B | 131.072 | Si (imagen) | Apache 2.0 | Loom sobre ROCm (gfx1151, gfx1201) |
| ggml-org/Muse-Glimmer-30B-GGUF (base) | 30B | no disponible en la informacion | Si (imagen) | Apache 2.0 | GGUF generico (llama.cpp y derivados) |
| Otras alternativas de 30B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el propio checkpoint base: el paquete Loom no modifica los pesos, solo cambia el runtime de ejecucion. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de borrador: cero descargas, cero likes, publicado y actualizado el mismo dia (2026-11-19), sin mediciones de correccion ni de rendimiento registradas.
- Todas las puertas de calidad (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, `sampling`, `logits`, `decision`) figuran como no medidas; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Soporte de hardware muy restringido: solo Strix Halo (gfx1151) y R9700 (gfx1201); no hay paquete para otras GPUs AMD ni para NVIDIA.
- Dependencia de un runtime joven (`hrx-loom` 0.2.0) y de un ecosistema (Loom) con poca trayectoria; riesgo de mantenimiento y de cambios incompatibles.
- Limite de 4.096 tokens de salida y de 4 peticiones concurrentes por defecto, insuficiente para cargas de produccion medias o altas.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Riesgo de alucinacion y sesgos del modelo base: no evaluados ni documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el proyector deben verificarse por separado en sus repositorios de origen antes de desplegar en produccion.
- El modo de razonamiento esta siempre activo y no es ajustable, lo que incrementa tokens generados y latencia en tareas simples.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ggml-org-Muse-Glimmer-30B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Muse-Glimmer-30B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
