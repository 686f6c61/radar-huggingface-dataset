# loom-draft/unsloth-gpt-oss-120b-loom

## Resumen

`loom-draft/unsloth-gpt-oss-120b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `unsloth/gpt-oss-120b-GGUF`, concretamente la cuantizacion `Q4_K_M` (fichero `gpt-oss-120b-Q4_K_M-00001-of-00002.gguf`). No se trata de un modelo nuevo ni de un fine-tune: el autor (loom-draft) solo publica el artefacto generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el proceso. El objetivo es ejecutar GPT-OSS 120B sobre GPUs AMD concretas mediante el runtime `loom-serve`.

El modelo subyacente es GPT-OSS 120B de OpenAI, un transformer de tipo Mixture of Experts (MoE) con 120 mil millones de parametros totales y aproximadamente 5,1 mil millones activos por token, disenado para razonamiento con modo "thinking" siempre activo y esfuerzo de razonamiento configurable. Este paquete Loom anade una capa de ejecucion especifica para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con API compatible con OpenAI, tool calling, contexto de 131.072 tokens por peticion y hasta 4 peticiones concurrentes.

La relevancia del paquete es practica: permite servir un modelo MoE de 120B en hardware AMD de consumo o workstation sin depender de CUDA, usando un backend IREE/ROCm propio. La licencia es Apache 2.0, lo que facilita el uso comercial, aunque el autor no ha publicado aun mediciones de rendimiento ni resultados de las puertas de correccion para esta version concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), modelo base GPT-OSS 120B de OpenAI |
| Parametros totales | 120 mil millones (modelo base); el paquete distribuye cuantizacion Q4_K_M |
| Parametros activos | Aproximadamente 5,1 mil millones por token (dato del modelo base GPT-OSS 120B; no confirmado en la model card del paquete) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete solo incluye esta variante |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: es un artefacto de despliegue generado por `loom-next` a partir del GGUF `Q4_K_M` de `unsloth/gpt-oss-120b-GGUF`. La arquitectura subyacente es la de GPT-OSS 120B: un transformer MoE con atencion por expertos y un modo de razonamiento ("thinking") siempre activo, con parametro `reasoning_effort` que admite `low`, `medium` (por defecto) y `high`. El paquete Loom genera kernels especificos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), y los ejecuta mediante IREE con proactor POSIX cuando el host no permite `io_uring` por limites de memlock.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las fases de RLHF/DPO del modelo base en la informacion proporcionada; esos datos corresponden a la model card original de GPT-OSS 120B, no incluida aqui. El paquete Loom no aplica decodificacion especulativa (marcada como "not applicable") ni soporta entrada de imagen o audio.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `high`; por defecto `medium`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en el esquema `/v1/chat/completions`.
- Soporte de bucles multi-turno de tool calling (puerta `agent` y `agent_think_off` en el sistema de correccion, aunque sin mediciones registradas para este paquete).
- API compatible con OpenAI en `/v1/chat/completions`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Contexto de 131.072 tokens por peticion.
- No soporta entrada de imagen ni audio.
- No aplica decodificacion especulativa.

## Casos de uso

- Servicio de razonamiento en workstation AMD: desplegar GPT-OSS 120B Q4_K_M sobre una Radeon AI PRO R9700 (32 GB) usando `loom-serve --parameter_mode=preload`, apropiado para entornos sin CUDA y con requisitos de privacidad.
- Asistente de codigo con tool calling: integrar el endpoint `/v1/chat/completions` en un IDE o pipeline de CI/CD que invoque herramientas (ejecutar tests, consultar repositorios) mediante `tools` y `tool_calls`.
- Agentes multi-paso: construir bucles de razonamiento y llamada a herramientas con `reasoning_effort` ajustable, usando el contexto de 131k tokens para mantener historial largo de interacciones.
- Procesamiento de documentos largos: analisis de contratos, informes o codebases de hasta 131.072 tokens por peticion, con salida limitada a 4.096 tokens.
- Atencion al cliente automatizada en hardware local: conversaciones multi-turno con contexto extendido y hasta 4 peticiones concurrentes, adecuado para equipos pequenos o despliegues on-premise.
- Evaluacion comparativa de backends AMD: usar el paquete como referencia para medir rendimiento frente a llama.cpp en Strix Halo o R9700, con las puertas de correccion (`golden`, `compare`, `consistency`) como criterio de validacion.
- Prototipado de razonamiento con esfuerzo variable: alternar `reasoning_effort` entre `low` y `high` para equilibrar latencia y calidad en tareas de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para GPUs con 32 GB (Radeon AI PRO R9700) y para el Ryzen AI Max+ 395 "Strix Halo" con memoria unificada.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA; el paquete es especifico para AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve` con flags `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed` y, en R9700, `--parameter_mode=preload`.
- En hosts con memlock de 8 MiB, ejecutar `loom-serve` mediante `systemd-run` con `SystemCallFilter=~io_uring_setup` y `SystemCallErrorNumber=ENOSYS`, o elevar `ulimit -l`.
- Latencia y throughput: no disponibles; la model card no incluye cifras para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `loom-draft/unsloth-gpt-oss-120b-loom` (este paquete) | 120B totales (MoE, ~5,1B activos) | 131.072 tokens | Apache 2.0 | Hugging Face, runtime Loom sobre AMD |
| `unsloth/gpt-oss-120b-GGUF` (modelo base del paquete) | 120B totales (MoE) | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, GGUF para llama.cpp y otros |
| GPT-OSS 120B (modelo original de OpenAI) | 120B totales (MoE) | No disponible en la informacion proporcionada | Apache 2.0 | Pesos publicados por OpenAI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni de correccion para esta version; las puertas de validacion aparecen como "not yet re-measured" en ambas GPUs.
- El limite de salida es de 4.096 tokens por peticion, lo que puede ser insuficiente para tareas de generacion larga.
- La concurrencia maxima es de 4 peticiones simultaneas.
- No soporta entrada de imagen ni audio; la puerta `vision` figura como no aplicable o no medida.
- No aplica decodificacion especulativa.
- El soporte de muestreo (`sampling`) aparece como "not determined" en la tabla de caracteristicas.
- El paquete es especifico para dos arquitecturas AMD (gfx1151 y gfx1201); no se documenta compatibilidad con otras GPUs.
- En hosts con memlock bajo es necesario un ajuste adicional (`systemd-run` o `ulimit -l`), lo que complica el despliegue en produccion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones idiomaticas del modelo base en la informacion proporcionada; deben consultarse en la model card de GPT-OSS 120B.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los ficheros podrian no estar materializados o que el paquete es muy reciente.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-gpt-oss-120b-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gpt-oss-120b-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
