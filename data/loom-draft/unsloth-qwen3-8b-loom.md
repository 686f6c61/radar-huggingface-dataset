# loom-draft/unsloth-Qwen3-8B-loom

## Resumen

`loom-draft/unsloth-Qwen3-8B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-8B-GGUF`, en concreto la cuantización `Qwen3-8B-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está pensado para ejecutarse en las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los de Qwen3-8B originales, empaquetados para el runtime Loom.

El valor del artefacto está en el runtime, no en los pesos. Loom es un ecosistema de inferencia para GPU AMD que compila los pesos a programas propios y expone una API compatible con OpenAI (`/v1/chat/completions`). El paquete se ha generado con `loom-next`, el generador automático, sin intervención de un LLM en el bucle. La relevancia actual es que ofrece una vía de despliegue nativa para hardware AMD de consumo y workstation, un nicho tradicionalmente peor cubierto que el ecosistema CUDA.

El modelo subyacente, Qwen3-8B, es un transformer denso de 8 mil millones de parámetros de la familia Qwen3 de Alibaba, con licencia Apache 2.0 y modo de razonamiento opcional. En este paquete el contexto se limita a 40.960 tokens por petición, con 4 peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), empaquetado como programas Loom |
| Parámetros totales | 8 mil millones (modelo base Qwen3-8B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF de origen); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Qwen3-8B-Q4_K_M.gguf`), convertido a programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de 8B parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen3-8B, que no se incluye en el material disponible.

La innovación técnica de este artefacto es el pipeline de Loom: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF, junto con `llm_config.json` y el tokenizer. El runtime `loom-serve` (paquete `hrx-loom[hf]==0.2.0`) ejecuta esos programas sobre ROCm en gfx1151 y gfx1201, con opciones de reserva de memoria fija (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). Según la model card, no hay decodificación especulativa ni ajuste de esfuerzo de razonamiento (marcados como "not applicable").

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling con formato compatible con OpenAI (`tools` y `tool_calls`).
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integración con clientes existentes.
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 40.960 tokens por petición y hasta 4.096 tokens de salida.
- Sin entrada de imagen ni de audio (marcadas como "not applicable").
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: el paquete permite servir Qwen3-8B en un Ryzen AI Max+ 395 sin depender de CUDA, usando `loom-fetch` y `loom-serve` con los comandos documentados.
- Inferencia en Radeon AI PRO R9700 para equipos de desarrollo: con 32 GB de VRAM y un modelo Q4_K_M de 8B, el margen de memoria permite mantener el pool fijo y servir 4 peticiones concurrentes.
- Asistentes con tool calling: la API expone `tools` y `tool_calls` en formato OpenAI, lo que permite conectar agentes que consulten APIs externas o ejecuten funciones, con razonamiento activado o desactivado según la latencia objetivo.
- Procesamiento de documentos largos: los 40.960 tokens de contexto admiten resúmenes, extracción de entidades o preguntas sobre contratos e informes de extensión media en una sola petición.
- Prototipado de aplicaciones compatibles con OpenAI: al respetar el esquema de `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local sin reescribir la capa de integración.
- Evaluación comparativa de runtimes: el paquete incluye puertas de corrección (`golden`, `compare`, `agent`, `sampling`, `logits`) que permiten contrastar la salida de Loom contra la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo y Radeon AI PRO R9700 "no se han vuelto a medir" (`not yet re-measured`), y todas las puertas de corrección figuran sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 8B ocupa del orden de 5 GB de pesos, pero la model card no publica la cifra exacta del paquete Loom.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPU de consumo AMD o NVIDIA en la información disponible.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete.
- Latencia y throughput: no disponibles; las mediciones están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-8B-loom | 8B (denso) | 40.960 tokens | Apache 2.0 | Loom (desde GGUF Q4_K_M) | Runtime Loom sobre ROCm, GPU AMD gfx1151/gfx1201 |
| unsloth/Qwen3-8B-GGUF | 8B (denso) | no disponible en la información | Apache 2.0 | GGUF | Checkpoint de origen, ejecutable con llama.cpp y derivados |
| Qwen3-8B (original) | 8B (denso) | no disponible en la información | Apache 2.0 | safetensors | Modelo base de Alibaba; datos de entrenamiento no incluidos en la información |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Artefacto derivado, no un modelo nuevo: cualquier limitación de Qwen3-8B (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios.
- Sin evidencia de corrección registrada: todas las puertas (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, entre otras) figuran como "not yet re-measured", por lo que no hay validación publicada frente a llama.cpp en este paquete.
- Sin mediciones de rendimiento: no hay latencia ni throughput publicados para ninguna de las dos GPU objetivo.
- Contexto limitado a 40.960 tokens por petición, por debajo de la ventana nativa que suele anunciarse para Qwen3-8B.
- Concurrencia máxima de 4 peticiones y salida máxima de 4.096 tokens según el preset.
- Compatibilidad restringida a GPU AMD gfx1151 y gfx1201; no se documenta soporte para otras plataformas.
- Sin soporte de imagen ni audio, y sin decodificación especulativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime `hrx-loom` y de ROCm por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-8B-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-8B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
