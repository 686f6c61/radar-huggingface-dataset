# loom-fun-staging/unsloth-gemma-4-31B-it-qat-loom

## Resumen

`loom-fun-staging/unsloth-gemma-4-31B-it-qat-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `gemma-4-31B-it-qat-UD-Q4_K_XL.gguf` de Unsloth, derivado de Gemma 4 31B instruction-tuned con cuantizacion consciente de cuantizacion (QAT). No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de empaquetado que adapta un GGUF preexistente para ejecutarse sobre el runtime Loom en GPUs AMD concretas, en concreto la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Gemma 4 de 31B parametros en variante instruct, con una ventana de contexto nativa de 262.144 tokens segun la propia model card. La innovacion practica del paquete no esta en los pesos, sino en el pipeline de generacion de kernels especificos para la arquitectura AMD y en el servidor compatible con la API de OpenAI (`/v1/chat/completions`) que expone Loom.

Su relevancia es acotada pero clara: permite servir un modelo de 31B con tool calling y modo de razonamiento opcional sobre hardware AMD de consumo y estacion de trabajo, sin depender de CUDA ni de llama.cpp, con concurrencia de 4 peticiones y contexto efectivo limitado por el preset (57.344 tokens en Strix Halo, 8.192 en R9700). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; el paquete es un artefacto Loom sobre GGUF) |
| Parametros totales | 31B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 57.344 tokens por peticion en Strix Halo; 8.192 tokens por peticion en Radeon AI PRO R9700 |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF); el paquete se sirve como `q4_0-unquantized` |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (origen) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de datos de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO) del modelo Gemma 4 31B subyacente en la informacion proporcionada. El checkpoint de origen es `unsloth/gemma-4-31B-it-qat-GGUF`, una version cuantizada con QAT en formato GGUF, y el paquete Loom lo consume sin modificarlo ("unmodified GGUF checkpoint"), limitandose a generar kernels y un preset de servicio.

La innovacion tecnica destacable del paquete es el flujo `loom-skills`, que genera programas `.loom` y kernels especificos para gfx1151 y gfx1201, mas un servidor con API compatible con OpenAI. El paquete soporta modo de razonamiento opcional (`enable_thinking`, desactivado por defecto) y tool calling estilo OpenAI. No soporta decodificacion especulativa ni entrada de imagen, aunque el modelo upstream si las tenga, porque el runtime Loom no las implementa en esta version. El preset configura `--pool_backing=fixed` (reserva de memoria por adelantado), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).

## Capacidades

- Generacion de texto conversacional multi-turno mediante `/v1/chat/completions` con formato de mensajes OpenAI.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Modo de razonamiento ("thinking") opcional, activable con `chat_template_kwargs: {"enable_thinking": true}`; desactivado por defecto.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion segun el preset (`max_tokens`).
- Contexto por peticion de 57.344 tokens en Strix Halo y 8.192 tokens en Radeon AI PRO R9700.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Vision: no soportada en este paquete (el modelo upstream la tiene, pero Loom no la implementa aqui).
- Audio: no determinado.
- Decodificacion especulativa: no soportada por Loom en este paquete.

## Casos de uso

- Asistente conversacional autoalojado en estacion de trabajo AMD: servir el modelo con `loom-serve` en una Radeon AI PRO R9700 o Strix Halo y exponer un endpoint compatible con OpenAI para integrarlo en herramientas existentes sin reescribir clientes.
- Automatizacion de soporte tecnico con tool calling: el modelo puede emitir `tool_calls` para consultar APIs internas (estado de pedidos, tickets) y mantener conversaciones multi-turno dentro de la ventana de 57.344 tokens en Strix Halo.
- Agentes de multiples pasos en local: la combinacion de tool calling y modo de razonamiento opcional permite construir bucles de agente (planificar, invocar herramienta, observar resultado) sin salir del equipo, util para entornos con requisitos de privacidad.
- Procesamiento de documentos largos en Strix Halo: con 57.344 tokens por peticion se pueden resumir o extraer informacion de contratos, informes o transcripciones de decenas de miles de palabras en una sola pasada.
- Generacion de codigo asistida en IDE: el modelo de 31B con tool calling puede integrarse en un plugin que invoque funciones del editor (leer ficheros, ejecutar tests) mediante el endpoint OpenAI-style.
- Evaluacion y prototipado de hardware AMD: el paquete sirve como banco de pruebas para medir latencia y throughput de un modelo de 31B en gfx1151 y gfx1201 antes de comprometer infraestructura.
- Despliegue en entornos sin CUDA: equipos con GPU AMD que necesitan inferencia local de un modelo de 31B y no pueden usar vLLM ni llama.cpp con aceleracion NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "are not yet re-measured", y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el preset de R9700 ajusta el pool de memoria al limite de 32 GB de la tarjeta, lo que reduce el contexto por peticion a 8.192 tokens. En Strix Halo el preset permite 57.344 tokens por peticion.
- GPU consumer: el paquete esta pensado para hardware AMD integrado (Strix Halo, APU) y de estacion de trabajo (R9700); no se mencionan GPUs NVIDIA ni otras Radeon.
- Opciones de despliegue: exclusivamente el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-fun-staging/unsloth-gemma-4-31B-it-qat-loom` (este) | 31B | 262.144 nativo; 57.344 (Strix Halo) / 8.192 (R9700) por peticion | Loom sobre GGUF UD-Q4_K_XL | no disponible | 0 descargas, 0 likes |
| `unsloth/gemma-4-31B-it-qat-GGUF` (base) | 31B | no disponible en la informacion | GGUF | no disponible | checkpoint upstream |
| Gemma 4 31B-it (upstream) | 31B | 262.144 (segun la model card del paquete) | safetensors / GGUF (no detallado) | no disponible | modelo original de Google |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las alternativas de otros fabricantes con tamano similar no se detallan porque no hay datos verificables en el material consultado.

## Limitaciones y advertencias

- Rendimiento y correccion sin verificar: todas las mediciones frente a llama.cpp y las puertas de correccion estan marcadas como "not yet re-measured" en ambas GPUs.
- Contexto efectivo reducido: aunque el modelo nativo soporta 262.144 tokens, el preset limita a 57.344 tokens por peticion en Strix Halo y a 8.192 en R9700, muy por debajo de la ventana nominal.
- Sin vision ni decodificacion especulativa: el modelo upstream las soporta, pero este paquete Loom no las implementa.
- Dependencia de hardware AMD especifico: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para otras GPU.
- Dependencia del runtime Loom: requiere `hrx-loom[hf]==0.2.0`; no es portable a vLLM, llama.cpp u Ollama.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Gemma 4 y del checkpoint de Unsloth.
- Idiomas no disponibles: no se especifica cobertura multilingue.
- Repositorio de staging: el namespace `loom-fun-staging` y las 0 descargas sugieren un artefacto de pruebas, no una version estable para produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los del modelo Gemma 4 subyacente, que no se detallan aqui.
- Salida limitada a 4.096 tokens por peticion por preset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-31B-it-qat-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
