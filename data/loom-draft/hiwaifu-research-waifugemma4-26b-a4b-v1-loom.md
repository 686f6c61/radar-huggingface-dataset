# loom-draft/hiwaifu-research-WaifuGemma4-26b-a4b-v1-loom

## Resumen

WaifuGemma4-26b-a4b-v1 es un ajuste fino (finetune) del modelo base Gemma 4 de Google, con 26.000 millones de parametros totales y 4.000 millones de parametros activos, lo que indica una arquitectura de mezcla de expertos (MoE). El modelo lo publica el usuario hiwaifu-research en Hugging Face bajo licencia Apache 2.0, y esta orientado a tareas conversacionales y de rol, segun se deduce del nombre. La ficha que nos ocupa, sin embargo, no es el modelo en si, sino un paquete de despliegue generado por la herramienta loom-next para la plataforma Loom de AMD.

Este paquete, publicado por loom-draft, contiene los programas `.loom` y un `model.json` que permiten servir el checkpoint GGUF `WaifuGemma4-26b-a4b-v1-Q4_K_M.gguf` sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No modifica los pesos: se trata de un artefacto de empaquetado y ejecucion especifico para el runtime Loom, desarrollado sobre ROCm.

Su relevancia es acotada pero concreta: facilita ejecutar un modelo MoE de 26B en cuantizacion Q4_K_M sobre hardware AMD integrado y de escritorio, con una API compatible con OpenAI, soporte de tool calling y un contexto declarado de 201.728 tokens por peticion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0,0 GB, lo que sugiere que los pesos no estan alojados en este repositorio sino que se referencian desde el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "a4b" sugiere MoE con 4B activos; no confirmado en la informacion) |
| Parametros totales | 26.000 millones (segun nombre del modelo) |
| Parametros activos | 4.000 millones (segun nombre del modelo) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (checkpoint base) y paquete `.loom` + `model.json` para el runtime Loom |
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 sobre ROCm |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador "26b-a4b" es coherente con un transformer de mezcla de expertos con 26.000 millones de parametros totales y 4.000 millones activos por token, pero este dato no se confirma explicitamente en la model card. Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado en el finetune de hiwaifu-research.

Lo que si documenta el paquete es la capa de ejecucion. Loom genera kernels especificos para las GPU AMD objetivo y expone el modelo mediante un servidor compatible con la API de OpenAI. El paquete declara soporte de razonamiento opcional mediante `chat_template_kwargs: {"enable_thinking": true}`, desactivado por defecto. No implementa decodificacion especulativa ("not applicable") ni modo de esfuerzo de razonamiento. La model card menciona un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) frente a una referencia de llama.cpp, pero todas aparecen como "not yet re-measured" para ambas GPU, por lo que no hay evidencia publicada de correccion numerica en esta version.

## Capacidades

- Generacion de texto conversacional mediante `/v1/chat/completions` con formato compatible con OpenAI.
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`.
- Razonamiento opcional (modo thinking) activable por peticion; desactivado por defecto.
- Contexto largo de hasta 201.728 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida limitada a 4.096 tokens por respuesta en el preset incluido.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la soporta.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las soporta.
- Decodificacion especulativa: no disponible en este paquete.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional de rol o acompanamiento: el finetune esta orientado a dialogos de personaje; con 201.728 tokens de contexto puede mantener un historial extenso de interacciones sin perder coherencia, y el modo thinking permite respuestas mas elaboradas cuando se activa.
- Despliegue local en estaciones de trabajo AMD: el paquete esta pensado para ejecutarse en Strix Halo y Radeon AI PRO R9700, de modo que un equipo con estas GPU puede servir el modelo sin depender de la nube, usando `loom-serve` y el endpoint OpenAI.
- Automatizacion de agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir bucles multi-turno de llamadas a funciones (busqueda, calculo, acceso a APIs internas) sobre el servidor local.
- Procesamiento de documentos largos: con casi 200.000 tokens de contexto se pueden pasar contratos, informes o bases de codigo completas en una sola peticion para resumen, extraccion o preguntas y respuestas.
- Prototipado de aplicaciones con API OpenAI: al exponer un endpoint compatible, cualquier cliente escrito para OpenAI puede apuntar a `http://127.0.0.1:8080/v1` cambiando la URL base, lo que acelera la experimentacion sin reescribir codigo.
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion frente a llama.cpp, util para equipos que quieran validar la fidelidad numerica de Loom frente a la referencia en su propio hardware.
- Generacion de codigo asistida: aunque no hay benchmarks publicados, un modelo de 26B con 4B activos y tool calling puede integrarse en editores o pipelines de CI para sugerencias y tareas acotadas, siempre con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion aparecen sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 26B, lo que en la practica suele situarse en el entorno de 15-17 GB, pero este calculo no lo confirma la documentacion.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que esta generado para el runtime Loom sobre ROCm/AMD.
- Opciones de despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0`; el paquete se obtiene con `loom-fetch` desde Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Parametros de ejecucion recomendados: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones en GPU.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime/hardware | Notas |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (este paquete) | 26B totales / 4B activos | 201.728 tokens | Apache 2.0 | Loom sobre AMD Strix Halo y R9700 | Paquete de despliegue, sin benchmarks publicados |
| Checkpoint GGUF original (hiwaifu-research) | 26B totales / 4B activos | no disponible | Apache 2.0 | llama.cpp y otros runtimes GGUF | Incluye vision y audio segun la model card |
| Gemma 4 (modelo base de Google) | no disponible | no disponible | no disponible | Multiples runtimes | Referencia de origen del finetune |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no incluye los pesos: el repositorio reporta 0,0 GB y el checkpoint se referencia desde el modelo base, por lo que la descarga real depende de ese repositorio.
- Sin evidencia de correccion: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, etc.) figuran como no re-medidas, de modo que la equivalencia con llama.cpp no esta verificada en esta version.
- Sin benchmarks de rendimiento publicados para ninguna de las dos GPU objetivo.
- Capacidades de vision y audio del modelo original no estan disponibles a traves de Loom.
- Limite de salida de 4.096 tokens por respuesta en el preset incluido, lo que puede ser insuficiente para generaciones largas.
- Concurrencia maxima de 4 peticiones; no es un servidor pensado para alta carga.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un finetune orientado a rol, puede producir respuestas poco fieles en tareas factuales.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y del finetune original antes de desplegar en produccion.
- Dependencia de un runtime especifico (`hrx-loom` 0.2.0) y de hardware AMD concreto; no es portable a otras plataformas sin recompilar o adaptar.
- La fecha de creacion del repositorio (2026-11-19) y la ausencia de descargas y likes indican un artefacto muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/hiwaifu-research-WaifuGemma4-26b-a4b-v1-loom
- Modelo base (checkpoint GGUF): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
