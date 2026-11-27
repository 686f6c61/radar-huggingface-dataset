# loom-draft/bartowski-Lythri_Lythri-Wink-2B-loom

## Resumen

Lythri_Lythri-Wink-2B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Lythri_Lythri-Wink-2B-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y esta orientado especificamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado generado con la herramienta `loom-next` para el runtime Loom del ecosistema ROCm.

El modelo subyacente es un transformer de 2.000 millones de parametros, segun se deduce del nombre, con una ventana de contexto declarada de 131.072 tokens por peticion. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y un modo de razonamiento opcional desactivado por defecto. La licencia declarada es MIT, heredada del checkpoint base.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de 2B con contexto muy largo sobre hardware AMD consumer y profesional mediante el runtime Loom, sin depender de llama.cpp como motor de inferencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0,0 GB, lo que sugiere que los pesos se materializan al hacer `loom-fetch` en lugar de alojarse en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducida del modelo base; no se detalla en la informacion disponible) |
| Parametros totales | 2B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Lythri_Lythri-Wink-2B-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base `Lythri_Lythri-Wink-2B`. La model card del paquete Loom no describe el modelo original, solo el empaquetado. Por el nombre y el tamano se trata de un transformer denso de aproximadamente 2.000 millones de parametros, pero esta afirmacion no esta confirmada por documentacion del autor del checkpoint.

La innovacion tecnica de este repositorio no reside en el modelo, sino en el runtime: Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y valida su correccion contra llama.cpp mediante un conjunto de puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`). En la version publicada, todas las puertas aparecen como "not yet re-measured" para ambas GPU, es decir, no hay evidencia de correccion registrada para este paquete concreto. El paquete se genero con `loom-next` sin intervencion de un LLM en el bucle.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento ("thinking") opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por respuesta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: el modelo upstream las soporta segun la model card, pero Loom no las implementa en este paquete.
- Decodificacion especulativa: no aplicable en este paquete.

## Casos de uso

- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, informes o expedientes completos en una sola peticion, sin trocear el texto, sobre una GPU Strix Halo o R9700.
- Asistente de codigo en estacion de trabajo AMD: integrado via API OpenAI-compatible, sirve para autocompletado, explicacion de funciones y generacion de tests en un flujo de desarrollo local sin enviar codigo a la nube.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros, con el modo thinking activable para pasos de planificacion.
- Atencion al cliente automatizada en despliegue on-premise: la concurrencia de 4 peticiones y el contexto largo permiten mantener historiales de conversacion extensos y documentacion de producto en el mismo contexto, con datos que no salen de la infraestructura propia.
- Clasificacion y extraccion de informacion estructurada: la puerta `decision` del runtime sugiere soporte para respuestas de eleccion y puntuaciones, util para enrutado de tickets, etiquetado o scoring de relevancia.
- Prototipado y evaluacion de hardware AMD: el paquete sirve como banco de pruebas para medir el rendimiento de Loom frente a llama.cpp en gfx1151 y gfx1201 antes de comprometerse con un despliegue mayor.
- Generacion de resumenes y respuestas en un chatbot interno de bajo coste: al ser un modelo de 2B en Q4_K_M, el consumo de VRAM es reducido y cabe holgadamente en las GPU objetivo, dejando margen para el contexto KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: un modelo de 2B en Q4_K_M ocupa aproximadamente 1,2-1,5 GB de pesos; el consumo real depende del contexto KV asignado y del pool de memoria fijo que reserva Loom (`--pool_backing=fixed`). No se proporcionan cifras oficiales.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA; el runtime Loom esta orientado a AMD via ROCm.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servir la API. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Ajustes de rendimiento documentados: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. A modo orientativo de categoria:

| Modelo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Lythri_Lythri-Wink-2B (este paquete) | 2B | 131.072 | MIT | GGUF Q4_K_M empaquetado en Loom |
| Checkpoint base `bartowski/Lythri_Lythri-Wink-2B-GGUF` | 2B | no disponible | MIT | GGUF (para llama.cpp y similares) |
| Alternativas de 2B en GGUF (p. ej. familias Qwen2.5-1.5B/3B, Llama-3.2-1B/3B) | 1-3B | variable | variable | GGUF |

La comparacion con modelos de la misma categoria no puede completarse con datos de benchmarks porque no se han publicado para este paquete ni se detallan para el modelo base.

## Limitaciones y advertencias

- No hay evidencia de correccion registrada: todas las puertas de validacion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPU objetivo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (27 de noviembre de 2026); no hay historial de uso ni validacion por parte de la comunidad.
- El paquete esta limitado al runtime Loom y a dos arquitecturas AMD concretas; no es portable a NVIDIA ni a otros motores de inferencia sin conversion adicional.
- Vision y audio no estan soportados por Loom en este paquete, aunque el modelo upstream los tenga.
- La decodificacion especulativa no es aplicable, lo que limita las optimizaciones de latencia disponibles.
- La salida maxima esta limitada a 4.096 tokens por respuesta, lo que puede ser insuficiente para generacion de documentos largos aunque el contexto de entrada sea de 131.072 tokens.
- La concurrencia maxima es de 4 peticiones, insuficiente para cargas de produccion con trafico alto.
- No hay informacion sobre sesgos, riesgo de alucinacion ni calidad multilingue del modelo base; al ser un modelo de 2B, es esperable una capacidad de razonamiento limitada frente a modelos mayores, aunque no se aportan datos que lo confirmen.
- La licencia MIT se hereda del checkpoint base, pero conviene verificar la licencia del modelo original `Lythri_Lythri-Wink-2B` antes de un uso comercial, ya que la model card no la detalla de forma independiente.
- El tamano del repo es de 0,0 GB, por lo que los pesos no estan alojados en el repositorio y deben materializarse con `loom-fetch`; la disponibilidad futura depende de que el checkpoint base siga accesible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Lythri_Lythri-Wink-2B-loom
- Checkpoint base: https://huggingface.co/bartowski/Lythri_Lythri-Wink-2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
