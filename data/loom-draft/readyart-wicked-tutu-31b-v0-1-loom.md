# loom-draft/ReadyArt-Wicked-Tutu-31B-v0.1-loom

## Resumen

ReadyArt-Wicked-Tutu-31B-v0.1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Wicked-Tutu-31B-v0.1-GGUF`, concretamente del fichero `Broken-Tutu-Unleashed-31B-v0.1-Q4_K_M.gguf`. No es un modelo entrenado desde cero ni un fine-tuning nuevo: es un artefacto de empaquetado que traduce los pesos GGUF existentes a programas ejecutables sobre el runtime Loom, orientado a GPUs AMD.

El objetivo del paquete es permitir servir el modelo en hardware AMD concretamente en el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el servidor `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`). El paquete se generó con la herramienta `loom-next` de forma automática, sin intervención de un LLM en el bucle de generación.

La relevancia es acotada pero específica: cubre el nicho de inferencia de un modelo de 31B en cuantización Q4_K_M sobre GPUs AMD de consumo y de estación de trabajo, con soporte declarado de tool calling y de modo de razonamiento opcional. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su tamaño es de 0.0 GB, lo que sugiere que los artefactos aún no se han materializado o no están publicados por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del modelo base; se sirve desde un GGUF Q4_K_M) |
| Parametros totales | 31B (según el nombre del modelo; no verificado en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única cuantización empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |

Otros parámetros operativos declarados en la tarjeta: 4 peticiones concurrentes, máximo de 4.096 tokens de salida (preset `max_tokens`), API estilo OpenAI, tool calling con `tools`/`tool_calls`, y modo de razonamiento desactivado por defecto.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `ReadyArt/Wicked-Tutu-31B-v0.1-GGUF`: la tarjeta del paquete Loom no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El nombre del fichero de origen (`Broken-Tutu-Unleashed-31B-v0.1-Q4_K_M.gguf`) sugiere una variante derivada de un modelo de 31B, pero no se aporta ninguna ficha técnica del mismo.

La innovación técnica del paquete no está en el modelo sino en el runtime: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF, y `loom-serve` los ejecuta sobre ROCm para las arquitecturas gfx1151 y gfx1201. La tarjeta menciona capacidades del runtime como decodificación especulativa (marcada como "not applicable" para este paquete), lectura de logits en host (`llm.logits`), control de muestreo (`temperature`, `top_k`, `seed`) y un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`). Todas ellas figuran como "not yet re-measured" para este paquete, es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), con soporte declarado para bucles multi-turno de agentes.
- Modo de razonamiento ("thinking") opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 53.248 tokens por petición y hasta 4.096 tokens de salida.
- Entrada de imagen: estado "not determined" (no determinado).
- Entrada/salida de audio: estado "not determined" (no determinado).
- Capacidades multilingües: no disponibles.
- Decodificación especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento ("reasoning effort"): no aplicable.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: el paquete se sirve con `loom-serve` sobre una Radeon AI PRO R9700 de 32 GB y expone un endpoint compatible con OpenAI, lo que permite conectarlo a clientes existentes sin adaptadores propios.
- Automatización de agentes con tool calling: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir agentes que invoquen APIs externas, con el modo de razonamiento desactivable para reducir latencia en tareas mecánicas.
- Procesamiento de documentos largos: la ventana de 53.248 tokens por petición admite resúmenes, extracción de entidades o preguntas sobre contratos e informes de decenas de miles de tokens en una sola pasada.
- Inferencia en hardware de consumo con memoria unificada: en el Ryzen AI Max+ 395 "Strix Halo" el modelo Q4_K_M se sirve desde la memoria unificada del APU, lo que evita depender de una GPU discreta con VRAM dedicada.
- Despliegue en local para entornos con requisitos de privacidad: al ejecutarse íntegramente en el equipo del usuario mediante `loom-fetch` y `loom-serve`, los datos no salen de la máquina, lo que encaja en flujos con datos sensibles.
- Evaluación comparativa de runtimes: las puertas de corrección (`golden`, `compare`, `consistency`, `agent`) permiten contrastar la salida del runtime Loom contra la referencia de llama.cpp sobre el mismo GGUF, útil para validar la madurez del stack ROCm antes de adoptarlo en producción.
- Servicio de chat con concurrencia moderada: con 4 peticiones concurrentes y 4.096 tokens de salida por petición, es adecuado para equipos pequeños o uso interno, no para servicio público de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El modelo se distribuye en Q4_K_M y el paquete está pensado para la R9700 con 32 GB, por lo que se puede afirmar que cabe en 32 GB, pero no se documenta el consumo exacto.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de NVIDIA (A100, H100, RTX 4090) o de consumo AMD distintas de las anteriores: no soportadas explícitamente por este paquete, que fija las arquitecturas gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete; llama.cpp aparece solo como referencia de corrección.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones para este paquete.
- Nota operativa: `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, lo que consume CPU mientras hay trabajo en vuelo; según la tarjeta, las mediciones de rendimiento de la tarjeta usan ese ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Tutu-31B-v0.1-loom (este paquete) | 31B (según nombre) | 53.248 tokens | Loom (desde GGUF Q4_K_M) | Apache 2.0 | Repositorio HF con 0 descargas |
| ReadyArt/Wicked-Tutu-31B-v0.1-GGUF (modelo base) | 31B (según nombre) | no disponible | GGUF | no disponible en la información proporcionada | Repositorio HF del autor original |
| Alternativas de 31B en GGUF para llama.cpp | no disponible | no disponible | GGUF | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio tiene 0.0 GB de tamaño y 0 descargas: los artefactos pueden no estar materializados o estar incompletos, lo que impide verificar que el paquete funcione tal y como se describe.
- No hay evidencia registrada de ninguna puerta de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`): todas figuran como "not yet re-measured". No se puede afirmar que la salida coincida con la referencia de llama.cpp.
- La arquitectura, el dataset de entrenamiento y el proceso de alineación del modelo base no están documentados en la información disponible; tampoco los idiomas soportados.
- El soporte de imagen y audio está marcado como "not determined", y el de muestreo también; no se debe asumir que funcionen.
- La licencia Apache 2.0 se declara a nivel de paquete, pero no se confirma que el modelo base `ReadyArt/Wicked-Tutu-31B-v0.1-GGUF` tenga la misma licencia; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- El paquete está restringido a las arquitecturas gfx1151 y gfx1201; no es portable a GPUs NVIDIA ni a otras AMD sin regeneración.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este modelo; no hay informes disponibles.
- La concurrencia máxima es de 4 peticiones y la salida máxima de 4.096 tokens, límites que pueden ser insuficientes para cargas de producción reales.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces encontrados corresponden a Loom (la herramienta de grabación de pantalla) y a la marca de ropa Loom, sin relación con el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Tutu-31B-v0.1-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
