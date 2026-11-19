# loom-draft/bartowski-Hcompany_Holo4-35B-A3B-loom

## Resumen

`loom-draft/bartowski-Hcompany_Holo4-35B-A3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Hcompany_Holo4-35B-A3B-GGUF`, en su cuantizacion Q4_K_M (`Hcompany_Holo4-35B-A3B-Q4_K_M.gguf`). No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de Hcompany Holo4 a kernels y programas ejecutables sobre el runtime Loom, orientado especificamente a GPUs AMD.

El paquete esta pensado para dos destinos de hardware concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU de estacion de trabajo AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Se genera con la herramienta `loom-next` (solo el generador, sin LLM en el bucle) y se sirve con `loom-serve`, exponiendo una API compatible con OpenAI en `/v1/chat/completions`.

Por su naturaleza, el interes del artefacto es de infraestructura mas que de modelado: permite ejecutar un modelo multimodal de 35B totales con aproximadamente 3B de parametros activos (MoE) y 262.144 tokens de contexto por peticion sobre hardware AMD consumer y profesional, con soporte de tool calling, modo thinking e entrada de imagen. La licencia declarada es Apache 2.0 y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) segun el nombre del checkpoint (35B totales / A3B activos); detalles internos del transformer original no disponibles en la informacion proporcionada |
| Parametros totales | 35B (segun denominacion del checkpoint) |
| Parametros activos | ~3B (segun denominacion "A3B") |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido); proyector de vision en bf16 (`mmproj-Hcompany_Holo4-35B-A3B-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado como paquete Loom (`.loom` + `model.json`); checkpoint base en GGUF |

## Arquitectura y entrenamiento

El artefacto no documenta el entrenamiento del modelo subyacente: la model card describe unicamente el proceso de empaquetado. El checkpoint de origen es `Hcompany_Holo4-35B-A3B-GGUF` de bartowski, una conversion GGUF del modelo Holo4 de Hcompany, con una arquitectura de mezcla de expertos de 35B parametros totales y aproximadamente 3B activos por token. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica del paquete reside en la capa de ejecucion: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra la referencia de llama.cpp sobre el mismo GGUF; en el momento de la publicacion ninguna de ellas tiene medicion registrada.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen (pipeline `image-text-to-text`) mediante partes `image_url` al estilo OpenAI, usando el proyector `mmproj-Hcompany_Holo4-35B-A3B-bf16.gguf`.
- Tool calling / function calling con el esquema OpenAI de `tools` y `tool_calls`.
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt (cubierto por las puertas `agent` y `agent_think_off`).
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- No soporta audio (ni entrada ni salida), ni razonamiento con esfuerzo configurable, ni decodificacion especulativa (marcados como no aplicables).
- El comportamiento de muestreo (`sampling`) figura como no determinado en la model card.

## Casos de uso

- Analisis de documentos largos con imagen: el contexto de 262.144 tokens permite procesar contratos, informes o expedientes completos junto con capturas o escaneos en una sola peticion, sin troceado previo.
- Agentes de automatizacion con herramientas: el soporte de `tools`/`tool_calls` y las puertas de validacion de bucles multi-turno lo hacen apto para orquestar APIs internas, consultas a bases de datos o acciones sobre sistemas de ficheros.
- Asistencia sobre hardware AMD de escritorio: al estar empaquetado para Strix Halo y Radeon AI PRO R9700, permite desplegar un modelo de 35B en estaciones de trabajo con GPU AMD sin depender de CUDA.
- Procesamiento por lotes de imagenes con descripcion o extraccion de datos: con 4 peticiones concurrentes y entrada visual, se puede usar para clasificar, resumir o extraer campos de lotes de imagenes.
- Razonamiento con traza explicita: el modo thinking por defecto resulta util en tareas de analisis donde se requiere una cadena de razonamiento visible antes de la respuesta final, como diagnostico de incidencias o revision de codigo.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del paquete facilita su integracion en productos comerciales sin obligaciones de copyleft.
- Evaluacion comparativa de runtimes: las puertas de correccion frente a llama.cpp permiten usar el paquete para validar la fidelidad numerica de Loom sobre hardware AMD antes de adoptarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento frente a llama.cpp para ambas plataformas (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201) "no se han vuelto a medir" y que las puertas de correccion no tienen ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 35B totales requiere del orden de 20-22 GB solo para pesos, mas el proyector de vision en bf16, aunque la cifra exacta no se documenta en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no disponible; el paquete esta generado especificamente para las dos arquitecturas AMD citadas y no se menciona soporte para otras.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete (`chat` para Strix Halo, `chat-r9700` para R9700). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp figuran como pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski-Hcompany_Holo4-35B-A3B-loom | 35B totales / ~3B activos | 262.144 | Paquete Loom (GGUF Q4_K_M) | Apache 2.0 | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/Hcompany_Holo4-35B-A3B-GGUF | 35B totales / ~3B activos | no disponible | GGUF | no disponible en la informacion proporcionada | Checkpoint de origen, ejecutable con llama.cpp; sirve de referencia de correccion |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El artefacto no aporta mediciones propias: todas las puertas de correccion y las tablas de rendimiento estan pendientes de re-medicion, por lo que no hay evidencia publicada de fidelidad numerica frente a llama.cpp.
- La ausencia de benchmarks impide estimar latencia, throughput o calidad real en produccion.
- El soporte de hardware esta restringido a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en NVIDIA, otras GPU AMD ni CPU.
- El comportamiento de muestreo figura como "no determinado", lo que anade incertidumbre sobre la reproducibilidad de salidas con temperatura distinta de cero.
- Limite de 4.096 tokens de salida y 4 peticiones concurrentes por instancia, insuficiente para cargas de alta concurrencia sin escalado horizontal.
- Los idiomas soportados no estan documentados, por lo que no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse empiricamente antes de uso en produccion.
- La licencia Apache 2.0 se declara sobre el paquete, pero la licencia y condiciones del modelo Holo4 original no se detallan en la informacion proporcionada; conviene verificar el repositorio de origen antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso que permita validar su estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Hcompany_Holo4-35B-A3B-loom
- Checkpoint base en GGUF: https://huggingface.co/bartowski/Hcompany_Holo4-35B-A3B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
