# loom-draft/unsloth-Qwen2.5-Coder-7B-Instruct-loom

## Resumen

El modelo `loom-draft/unsloth-Qwen2.5-Coder-7B-Instruct-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen2.5-Coder-7B-Instruct-GGUF`, concretamente la cuantizacion `Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), usando el runtime `loom-serve` del ecosistema Loom (paquete `hrx-loom[hf]==0.2.0`).

El modelo subyacente es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros desarrollado por Alibaba Qwen, especializado en generacion de codigo y con capacidad de instrucciones. La aportacion de este repositorio es el empaquetado para inferencia nativa en GPU AMD via Loom, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, contexto de 32.768 tokens por peticion y 4 peticiones concurrentes. El paquete se genero con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

Es relevante porque ofrece una via de despliegue del modelo en hardware AMD consumer y profesional (Strix Halo, R9700) sin depender de CUDA ni de llama.cpp, aunque las mediciones de rendimiento y las puertas de correccion de este paquete concreto aun no se han vuelto a medir segun la propia model card. La licencia del modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), empaquetado como programas Loom generados |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |
| Generador | `loom-next` (sin LLM en el bucle) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de 7.000 millones de parametros. Este repositorio no entrena ni modifica pesos: toma el GGUF ya cuantizado a Q4_K_M publicado por Unsloth y genera, mediante `loom-next`, un conjunto de programas `.loom` y `weights.loom` que implementan la inferencia sobre las GPU AMD objetivo. El paquete incluye ademas `tokenizer.json`, `llm_config.json`, `model.json` y `model.json.lock` con los hashes SHA-256 de los ficheros fuente, verificados por `loom-fetch`.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, numero de tokens, composicion, ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card original de Qwen2.5-Coder, que no se incluye aqui. La innovacion tecnica del paquete es el propio pipeline de generacion de kernels Loom para AMD (gfx1151 y gfx1201), con soporte de `completion_spin_ns` para espera activa de completaciones en GPU, `pool_backing=fixed` para reservar el pool de memoria por adelantado y `parameter_mode=preload` para precargar pesos en host. No se declara decodificacion especulativa (marcada como "not applicable" en la tabla de features).

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo base Qwen2.5-Coder-7B-Instruct.
- Tool calling: soporte de `tools` y `tool_calls` en estilo OpenAI.
- API compatible con OpenAI: endpoint `/v1/chat/completions` servido por `loom-serve`.
- Concurrencia: hasta 4 peticiones simultaneas.
- Contexto largo: 32.768 tokens por peticion, con documentos de prueba de 1k a 32k en las puertas de correccion.
- Salida maxima: 4.096 tokens por peticion (preset `max_tokens`).
- Modo razonamiento/thinking: no aplicable en este paquete.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada/salida de audio: no aplicable.
- Muestreo: estado "no determinado" en la model card.

## Casos de uso

- Asistente de codigo en IDE o editor: el modelo puede completar y explicar codigo en conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para incluir varios ficheros de un proyecto en la ventana.
- Automatizacion de tareas de refactorizacion: con 4.096 tokens de salida por peticion y tool calling, se puede encadenar lectura de ficheros, generacion de parches y validacion en un bucle de agente multi-paso.
- Servicio de atencion a desarrolladores: desplegado tras `/v1/chat/completions`, puede responder consultas tecnicas en un endpoint compatible con OpenAI al que apuntar clientes existentes sin cambios de codigo.
- Generacion de tests y documentacion: el contexto de 32k permite pasar modulos completos y pedir tests unitarios o docstrings coherentes con el codigo existente.
- Despliegue en estaciones de trabajo AMD: en una Radeon AI PRO R9700 (32 GB) o en un Ryzen AI Max+ 395 "Strix Halo" se puede servir el modelo localmente sin CUDA, util para entornos con requisitos de soberania de datos.
- Prototipado de agentes con tool calling: la API expone `tools` y `tool_calls` en formato OpenAI, lo que permite conectar el modelo a funciones externas (shell, APIs HTTP, bases de datos) desde frameworks de agentes existentes.
- Evaluacion comparativa de runtimes: al estar empaquetado para Loom y ofrecer puertas de correccion frente a llama.cpp sobre el mismo GGUF, sirve para validar la fidelidad de la implementacion en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base en Q4_K_M ronda los 4,5-5 GB de pesos, pero el pool de memoria de Loom y el contexto de 32k anaden overhead no cuantificado en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que apunta a AMD via `--device=amdgpu://`.
- Opciones de despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado con `pipx`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa), `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones de rendimiento frente a llama.cpp no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen2.5-Coder-7B-Instruct-loom | 7B | 32.768 | Apache 2.0 | GGUF empaquetado en Loom; `loom-serve` | Paquete para AMD gfx1151 y gfx1201; benchmarks no medidos |
| unsloth/Qwen2.5-Coder-7B-Instruct-GGUF (base) | 7B | no disponible en esta ficha | Apache 2.0 | GGUF; llama.cpp y derivados | Checkpoint de origen sin modificar |
| Qwen2.5-Coder-7B-Instruct (original) | 7B | no disponible en esta ficha | Apache 2.0 | safetensors; transformers, vLLM, TGI | Modelo base de Alibaba Qwen |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estas opciones.

## Limitaciones y advertencias

- Los benchmarks y las puertas de correccion de este paquete no se han vuelto a medir; no hay evidencia publicada de fidelidad frente a llama.cpp en las GPU objetivo.
- El paquete esta atado a hardware AMD concreto (gfx1151 y gfx1201); no es portable a NVIDIA ni a otras arquitecturas sin regeneracion.
- El muestreo aparece como "no determinado" en la model card, lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed`.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en precision completa; no se han publicado metricas de degradacion para este paquete.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada.
- Idiomas soportados no declarados en la model card de este repositorio.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por peticion en el preset.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen2.5-Coder y del GGUF de Unsloth antes de un uso comercial en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-7B-Instruct-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
