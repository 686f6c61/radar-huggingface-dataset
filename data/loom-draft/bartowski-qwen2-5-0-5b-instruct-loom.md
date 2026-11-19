# loom-draft/bartowski-Qwen2.5-0.5B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-0.5B-Instruct-loom` es un paquete de despliegue para la plataforma Loom (del ecosistema ROCm de AMD) que empaqueta el checkpoint GGUF `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` de bartowski, es decir, el modelo Qwen2.5-0.5B-Instruct de Alibaba cuantizado a Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original, sin modificar. El autor del paquete es `loom-draft` y se genero con la herramienta `loom-next` (generador automatico, sin LLM en el bucle).

El paquete contiene programas `.loom` generados, un `model.json` con la ficha, el tokenizer y los pesos en formato Loom. Su proposito es servir el modelo sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante `loom-serve`, que expone una API compatible con OpenAI (`/v1/chat/completions`).

Es relevante para quienes trabajan con hardware AMD y quieren ejecutar un modelo pequeno (0,5B parametros) con tool calling sobre ROCm sin depender de llama.cpp. El modelo subyacente, Qwen2.5-0.5B-Instruct, es un transformer decoder-only denso de 0,5B parametros con 32.768 tokens de contexto, licencia Apache 2.0, pensado para tareas ligeras de instruccion y generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5-0.5B-Instruct); empaquetado como programas Loom generados |
| Parametros totales | 0,5B (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Qwen2.5-0.5B-Instruct-Q4_K_M.gguf`); empaquetado en `weights.loom` y programas `.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | Compatible OpenAI `/v1/chat/completions` |
| Tool calling | Si (formato OpenAI `tools` / `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 de Alibaba, con 0,5B parametros y ventana de contexto de 32.768 tokens. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; esos datos corresponden a la model card original de Qwen2.5-0.5B-Instruct y no se incluyen aqui.

La innovacion de este paquete no esta en el modelo sino en el runtime: `loom-next` genera programas `.loom` especificos para las arquitecturas GPU AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete declara soporte de tool calling estilo OpenAI, contexto de 32.768 tokens por peticion, 4 peticiones concurrentes y 4.096 tokens maximos de salida. No incluye decodificacion especulativa, modo thinking, vision ni audio (marcados como "not applicable" en la model card).

## Capacidades

- Generacion de texto conversacional e instrucciones (modelo Instruct).
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Soporte de bucles multi-turno de tool calling (gate `agent` y `agent_think_off` definidos en la model card, aunque sin mediciones registradas).
- Contexto de 32.768 tokens por peticion, adecuado para documentos de hasta 32k.
- Concurrencia de 4 peticiones simultaneas.
- API compatible OpenAI, lo que facilita integracion con clientes existentes.
- Sin modo reasoning/thinking, sin decodificacion especulativa, sin entrada de imagen ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base Qwen2.5, no documentadas en este paquete).

## Casos de uso

- Asistente conversacional ligero en local sobre GPU AMD: el modelo se sirve con `loom-serve` y responde via `/v1/chat/completions`; su tamano de 0,5B en Q4_K_M permite mantenerlo residente en Strix Halo o R9700 sin competir por VRAM con otras cargas.
- Automatizacion de tool calling en agentes: el soporte de `tools`/`tool_calls` estilo OpenAI permite integrarlo en orquestadores de agentes que ya hablan el protocolo OpenAI, con bucles multi-turno validados por el gate `agent`.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades o Q&A sobre contratos e informes que quepan en la ventana de contexto, con 4 peticiones concurrentes para lotes pequenos.
- Prototipado y pruebas de pipelines LLM: al ser un modelo de 0,5B con licencia Apache 2.0 y API OpenAI, sirve para validar cadenas de RAG, evaluaciones y prompts antes de escalar a modelos mayores.
- Despliegue en edge con hardware AMD: el paquete esta orientado a Strix Halo (APU) y R9700 (32 GB), lo que permite ejecutar inferencia en estaciones de trabajo AMD sin GPU NVIDIA.
- Generacion de codigo y texto auxiliar en herramientas de desarrollo: tareas de autocompletado, generacion de snippets o transformacion de texto donde la latencia importa mas que la calidad de un modelo grande.
- Clasificacion y decision con probabilidades: el gate `decision` de la model card contempla respuestas de eleccion, score y probabilidades, util para enrutado o etiquetado simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 0,5B, por lo que el peso de los pesos es de unos cientos de MB, mas overhead de contexto y pool de memoria.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no disponible en la informacion proporcionada; el paquete solo declara soporte para las dos GPUs AMD citadas.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; flags recomendados `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp no tienen mediciones registradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (este paquete) | 0,5B | 32.768 | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom; `loom-serve` sobre AMD gfx1151/gfx1201 | Tool calling OpenAI; sin benchmarks publicados en este paquete |
| Qwen2.5-0.5B-Instruct (GGUF de bartowski) | 0,5B | 32.768 | Apache 2.0 | GGUF; llama.cpp y otros runtimes GGUF | Mismo checkpoint sin empaquetar; referencia de correccion del paquete Loom |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Misma familia, mayor capacidad; datos de rendimiento no disponibles en esta busqueda |
| Llama 3.2 1B Instruct | 1,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar; licencia con restricciones de uso comercial distintas a Apache 2.0 |

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni evidencia de los gates de correccion: todas las celdas aparecen como "not yet re-measured". No hay garantia publicada de equivalencia con llama.cpp para este paquete concreto.
- Modelo de 0,5B parametros: capacidad limitada de razonamiento, matematicas y codigo complejo; riesgo alto de alucinacion en tareas que requieran conocimiento factual extenso.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredados del modelo base Qwen2.5-0.5B-Instruct.
- Idiomas soportados: no disponibles en la informacion proporcionada; no se puede confirmar cobertura multilingue para produccion.
- Sin modo thinking, sin vision, sin audio y sin decodificacion especulativa; no apto para casos de uso que requieran esas capacidades.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en bf16/fp16; el impacto no esta medido en este paquete.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del GGUF de origen antes de desplegar.
- Dependencia de hardware AMD especifico (gfx1151, gfx1201) y de la version `hrx-loom[hf]==0.2.0`; no hay soporte declarado para otras GPUs ni para CPU.
- El paquete registra 0 descargas y 0 likes en Hugging Face; es un artefacto reciente (creado el 2026-11-19) sin validacion comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-0.5B-Instruct-loom
- Modelo base (GGUF de bartowski): https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
