# loom-draft/ggml-org-Qwen3-30B-A3B-loom

## Resumen

`loom-draft/ggml-org-Qwen3-30B-A3B-loom` es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Qwen3-30B-A3B-Q4_K_M.gguf` (procedente de `ggml-org/Qwen3-30B-A3B-GGUF`) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervencion de un LLM en el bucle. El objetivo es ejecutar Qwen3-30B-A3B en GPUs AMD concretas mediante `loom-serve`, que expone una API compatible con OpenAI.

El modelo subyacente es Qwen3-30B-A3B, un transformer de tipo Mixture-of-Experts con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, distribuido bajo licencia Apache 2.0. El paquete fija un contexto de 40.960 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida, con modo de razonamiento activado por defecto y soporte de tool calling.

La relevancia de esta ficha es operativa: documenta como llevar un MoE de 30B en cuantizacion Q4_K_M a hardware AMD de consumo profesional (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201, 32 GB) sin recompilar el modelo. No se han publicado aun mediciones de rendimiento ni resultados de las puertas de correctitud para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (Qwen3-30B-A3B); paquete de ejecucion Loom sobre GGUF |
| Parametros totales | 30B (modelo base Qwen3-30B-A3B) |
| Parametros activos | ~3B por token (MoE, segun denominacion A3B del modelo base) |
| Longitud de contexto | 40.960 tokens por peticion (preset del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-30B-A3B-Q4_K_M.gguf) + programas `.loom` y `weights.loom` |
| Concurrencia | 4 peticiones simultaneas |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version de runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-30B-A3B, es un transformer con capas de mezcla de expertos: 30B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional por token frente a un denso del mismo tamano. El checkpoint incluido esta cuantizado en Q4_K_M, un esquema de cuantizacion por bloques de 4 bits con escalas de 6 bits para pesos seleccionados, habitual en llama.cpp por su equilibrio entre tamano y calidad.

Este repositorio no aporta entrenamiento ni ajuste fino: es un artefacto de compilacion. `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) y `weights.loom` a partir del GGUF y de `llm_config.json`, y `loom-fetch` verifica los ficheros fuente mediante sha256 fijados en `model.json.lock`. El paquete incluye `tokenizer.json` y una tarjeta `model.json` con el preset de servicio. No se documentan en la informacion disponible datos de preentrenamiento, composicion del dataset, RLHF ni DPO del modelo base.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento con modo thinking activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Flujos de agente multi-turno con reutilizacion de historial (cubierto por las puertas `agent` y `agent_think_off`, pendientes de re-medicion).
- Concurrencia de 4 peticiones con consistencia entre ejecuciones concurrentes y aisladas (puerta `consistency`, pendiente de re-medicion).
- Contexto de 40.960 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Sin soporte de imagen ni audio; sin decodificacion especulativa; sin ajuste de esfuerzo de razonamiento (no aplicable en este preset).
- Capacidades multilingues del modelo base: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: `loom-serve` expone un endpoint compatible con OpenAI en `127.0.0.1:8080`, de modo que herramientas existentes (clientes OpenAI, LangChain, scripts propios) apuntan al servidor local sin cambios de codigo.
- Agente con herramientas en local: con tool calling y contexto de 40.960 tokens, el modelo puede encadenar busquedas, consultas a APIs internas y ejecucion de comandos en un bucle multi-turno, manteniendo el historial dentro de la ventana.
- Procesamiento de documentos largos: informes, contratos o expedientes de hasta ~40k tokens se pueden analizar en una sola peticion, con salida de hasta 4.096 tokens para resumenes o extraccion estructurada.
- Razonamiento asistido con traza: activando thinking por defecto se obtienen cadenas de razonamiento para tareas de analisis, y se desactiva para respuestas rapidas o cuando el formato de salida debe ser estricto.
- Evaluacion de hardware AMD para inferencia LLM: el paquete sirve como banco de pruebas reproducible (sha256 fijados, preset cerrado) para medir latencia y throughput en Strix Halo o R9700 antes de comprometer infraestructura.
- Atencion al cliente interna o prototipos: 4 peticiones concurrentes y API estandar permiten validar un flujo de soporte con contexto largo en una sola maquina, sin depender de la nube.
- Integracion en pipelines de desarrollo: al hablar el protocolo de OpenAI, el servidor se puede insertar en scripts de CI o en herramientas de revision que necesiten generacion de texto o llamadas a funciones en red local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavia", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un MoE de 30B ocupa del orden de 17-19 GB en pesos; a ello se suma el pool de memoria del preset (`--pool_backing=fixed`) y las estructuras de contexto para 40.960 tokens y 4 peticiones concurrentes. La cifra exacta no esta disponible en la informacion proporcionada.
- GPU validadas por el autor: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU consumer: no se documenta compatibilidad con GPUs consumer AMD o NVIDIA; el paquete esta generado para los objetivos gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve --model=qwen3-30b-a3b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete; llama.cpp se usa como referencia de correctitud, no como runtime del mismo.
- Latencia y throughput: no disponibles; la model card remite a mediciones pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime / hardware | Notas |
|---|---|---|---|---|---|---|
| Este paquete (Qwen3-30B-A3B Q4_K_M para Loom) | 30B totales, ~3B activos | 40.960 tokens por peticion | Q4_K_M | Apache 2.0 | loom-serve en gfx1151 y gfx1201 | Paquete de despliegue; sin benchmarks publicados |
| ggml-org/Qwen3-30B-A3B-GGUF (modelo base del paquete) | 30B totales, ~3B activos | no disponible en la informacion | GGUF (multiples) | Apache 2.0 | llama.cpp y derivados | Referencia de correctitud del paquete |
| Qwen3-30B-A3B original (formato nativo) | 30B totales, ~3B activos | no disponible en la informacion | safetensors y otras | Apache 2.0 | GPUs NVIDIA/AMD via frameworks estandar | Pesos sin empaquetar para Loom |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete sin validacion publicada: todas las puertas de correctitud y las mediciones de rendimiento figuran como pendientes de re-medicion, por lo que no hay evidencia registrada de equivalencia con llama.cpp en este artefacto.
- Contexto limitado a 40.960 tokens por peticion, por debajo de la ventana nativa del modelo base si esta fuera mayor; las peticiones que excedan ese limite no se cubren en el preset.
- Solo 4 peticiones concurrentes y 4.096 tokens de salida maxima: no apto para cargas de alta concurrencia sin escalar horizontalmente.
- Cuantizacion unica Q4_K_M: no hay variantes de mayor o menor precision en el repositorio, lo que limita el ajuste calidad/velocidad.
- Sin vision, audio ni decodificacion especulativa; sin control de esfuerzo de razonamiento.
- Dependencia de hardware especifico (gfx1151 o gfx1201) y de la version `hrx-loom==0.2.0`; cambios de runtime pueden invalidar los sha256 fijados.
- Riesgo de alucinacion y sesgos del modelo base: no se documentan en la informacion disponible; deben evaluarse con el checkpoint Qwen3-30B-A3B de referencia.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las herramientas Loom (`loom-next`, `hrx-loom`) por separado.
- El autor del repositorio es `loom-draft` con 0 descargas y 0 likes: artefacto reciente (creado el 2026-11-19) sin adopcion verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-30B-A3B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-30B-A3B-GGUF
- Herramienta de generacion loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
