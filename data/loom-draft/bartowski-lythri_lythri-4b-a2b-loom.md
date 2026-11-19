# loom-draft/bartowski-Lythri_Lythri-4B-A2B-loom

## Resumen

Lythri_Lythri-4B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 4.000 millones de parametros totales y 2.000 millones de parametros activos, segun se deduce de la nomenclatura "4B-A2B". El checkpoint original en formato GGUF (cuantizacion Q4_K_M) ha sido empaquetado por el usuario `loom-draft` como un paquete `.loom` para su uso con el runtime Loom de AMD, orientado a las GPU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

Este repositorio no contiene pesos nuevos ni un fine-tuning: es un artefacto de despliegue que envuelve el GGUF de `bartowski/Lythri_Lythri-4B-A2B-GGUF` con programas `.loom` precompilados y una tarjeta `model.json`. Su relevancia es de nicho: permite ejecutar el modelo sobre el stack ROCm/Loom en hardware AMD especifico con una API compatible con OpenAI, sin necesidad de compilar kernels manualmente.

La informacion disponible sobre el modelo subyacente (arquitectura exacta, datos de entrenamiento, idiomas, benchmarks) es muy limitada en este repositorio, ya que la model card se centra en el empaquetado y en los comandos de despliegue. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos se materializan en tiempo de ejecucion mediante `loom-fetch` en lugar de almacenarse en el propio repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), detalles del transformer no disponibles |
| Parametros totales | 4B (4.000 millones) |
| Parametros activos | 2B (2.000 millones) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como `.loom` con `model.json` y programas `.loom`) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con 4.000 millones de parametros totales y 2.000 millones activos por token, distribuido en formato GGUF con cuantizacion Q4_K_M. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la estrategia de enrutamiento, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

El repositorio en si no modifica el checkpoint: segun la model card, se trata del "unmodified GGUF checkpoint". La innovacion tecnica del paquete reside en el runtime Loom, que genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y expone el modelo mediante un servidor compatible con la API de OpenAI. La model card menciona que el modelo upstream soporta entrada de imagen y audio, pero el runtime Loom no implementa esas modalidades. Tambien se indica que el modelo dispone de modo de razonamiento ("thinking") desactivable mediante `chat_template_kwargs`, y que la decodificacion especulativa no es aplicable en este empaquetado.

## Capacidades

- Generacion de texto conversacional a traves de `/v1/chat/completions` con formato compatible con OpenAI.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de contexto largo: hasta 131.072 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: el modelo upstream los soporta, pero el runtime Loom no los implementa.
- Razonamiento multi-paso y bucles de agente: soportados a traves del tool calling, segun los gates `agent` y `agent_think_off` descritos en la model card.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo se sirve mediante `loom-serve` en una Ryzen AI Max+ 395 o una Radeon AI PRO R9700, ofreciendo una API compatible con OpenAI para integrarse en aplicaciones existentes sin cambios de codigo en el cliente.
- Automatizacion de agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir agentes que invoquen funciones externas (APIs, bases de datos, shell) en bucles multi-turno, con el modo thinking desactivable para reducir latencia en tareas mecanicas.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, el modelo puede resumir, extraer informacion o responder preguntas sobre contratos, informes o codebases completos en una sola peticion.
- Chat de soporte tecnico con contexto extendido: la ventana de 128K tokens permite mantener historiales de conversacion muy largos o adjuntar documentacion de referencia en el propio prompt.
- Prototipado de aplicaciones LLM en hardware consumer/prosumer AMD: al ejecutarse sobre Strix Halo (un APU con memoria unificada) o una GPU R9700 de 32 GB, permite desarrollar y probar integraciones sin depender de GPUs NVIDIA o servicios en la nube.
- Evaluacion comparativa de runtimes: el paquete incluye gates de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) que permiten validar la fidelidad del runtime Loom frente a llama.cpp sobre el mismo GGUF, util para equipos que evaluan alternativas de inferencia en ROCm.
- Generacion de codigo asistida en local: con tool calling y contexto largo, puede integrarse en editores o pipelines internos que requieran privacidad de datos y no puedan enviar codigo a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todos los gates de correccion figuran como "not yet re-measured". No se dispone de datos de MMLU, HumanEval, GSM8K ni de throughput o latencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con cuantizacion Q4_K_M y 4.000 millones de parametros, la huella de pesos ronda los 2,5-3 GB, pero el runtime reserva pools de memoria adicionales (`--pool_backing=fixed`) cuyo tamano no se detalla.
- GPU soportadas oficialmente por este paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no se documenta soporte para GPUs de consumo AMD o NVIDIA en este paquete; el empaquetado esta generado especificamente para las arquitecturas AMD citadas.
- Opciones de despliegue: `loom-serve` mediante el paquete `hrx-loom[hf]==0.2.0` (instalable con pipx). El GGUF subyacente es compatible con llama.cpp, pero este repositorio no lo empaqueta para ese runtime.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa para completaciones GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).
- Latencia y throughput: no disponibles; la model card no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Lythri_Lythri-4B-A2B (este paquete) | 4B / 2B | 131.072 tokens | Apache 2.0 | GGUF Q4_K_M empaquetado en `.loom`, runtime Loom (AMD) | Hugging Face, 0 descargas |
| Modelo base `bartowski/Lythri_Lythri-4B-A2B-GGUF` | 4B / 2B | no disponible en esta ficha | Apache 2.0 (heredada) | GGUF, runtime llama.cpp y compatibles | Hugging Face |
| Alternativas MoE de ~4B con ~2B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con modelos de la misma categoria. La unica comparacion documentada es funcional: el paquete Loom se valida contra llama.cpp sobre el mismo GGUF mediante gates de correccion, pero los resultados de esos gates no se han publicado en este repositorio.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), lo que indica que es un artefacto recien generado y sin validacion por parte de la comunidad.
- Todos los gates de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- El paquete esta restringido a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no es portable a otras GPU sin regenerar los kernels con `loom-next`.
- Vision y audio, aunque el modelo upstream los soporta, no estan disponibles en el runtime Loom.
- No se documentan los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del checkpoint original de Lythri antes de desplegarlo en produccion.
- El limite de 4.096 tokens de salida y las 4 peticiones concurrentes pueden ser insuficientes para cargas de trabajo de alta demanda.
- La generacion del paquete se realizo "sin LLM en el bucle" (generador `loom-next` unicamente), lo que no garantiza por si mismo la correccion funcional del resultado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Lythri_Lythri-4B-A2B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Lythri_Lythri-4B-A2B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
