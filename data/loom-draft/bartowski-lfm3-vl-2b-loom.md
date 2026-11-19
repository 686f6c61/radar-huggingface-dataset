# loom-draft/bartowski-LFM3-VL-2B-loom

## Resumen

LFM3-VL-2B para AMD Loom es un paquete de despliegue (`.loom`) generado automáticamente a partir del checkpoint GGUF `LFM3-VL-2B-Q4_K_M.gguf` de bartowski. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del LFM3-VL-2B original, empaquetados junto con programas Loom generados por `loom-next` y una tarjeta `model.json` para ejecutarse sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del paquete es la portabilidad: permite servir el modelo con una pila nativa de AMD (runtime `hrx-loom`, servidor `loom-serve`) exponiendo una API compatible con OpenAI en `/v1/chat/completions`, con soporte de tool calling, modo de razonamiento y 128 000 tokens de contexto por petición. Es relevante para quienes trabajan con hardware AMD y quieren evitar depender de llama.cpp o de CUDA.

La información publicada es notablemente incompleta: no hay mediciones de rendimiento ni de corrección registradas ("not yet re-measured" en todas las puertas), no se declaran idiomas y la licencia figura como "other". La entrada de imagen, aunque el modelo subyacente es multimodal, no está soportada por Loom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B; el paquete solo describe el runtime Loom) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128 000 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (`LFM3-VL-2B-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` |
| Concurrencia | 4 peticiones simultáneas |
| Tokens máximos de salida | 4 096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, servidor `loom-serve` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente. Lo que sí describe es la del artefacto: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir de la configuración del checkpoint (`llm_config.json`) y del tokenizador (`tokenizer.json`), sin intervención de un LLM en el bucle de generación. El resultado se sirve con `loom-serve` sobre el runtime `hrx-loom`, con opciones de reserva de memoria fija (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de alineación (RLHF/DPO) del modelo base. Tampoco se detallan innovaciones de decodificación: la decodificación especulativa figura explícitamente como no aplicable y el "reasoning effort" también. El modo de razonamiento (thinking) está activado por defecto y se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición.
- Contexto largo: hasta 128 000 tokens por petición, útil para documentos extensos.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4 096 tokens de salida por respuesta (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, pese a que el modelo base es multimodal (VL).
- Entrada/salida de audio: no aplica.
- Capacidades multilingües: no disponibles en la información publicada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones AMD: servir un chatbot con API OpenAI sobre una Radeon AI PRO R9700 o un Strix Halo, sin depender de CUDA, usando `loom-serve` y el endpoint estándar.
- Procesamiento de documentos largos: con 128 000 tokens de contexto por petición, se pueden resumir o extraer información de contratos, informes o expedientes completos en una sola llamada.
- Automatización con herramientas: integrar el modelo en un orquestador de agentes que use `tools`/`tool_calls` para consultar bases de datos, APIs internas o sistemas de tickets, con el bucle multi-turno validado por la puerta `agent`.
- Despliegue en hardware de escritorio con GPU integrada: el formato GGUF Q4_K_M y el soporte de gfx1151 permiten ejecutar el modelo en un equipo con Ryzen AI Max+ 395 sin GPU discreta.
- Prototipado y evaluación de la pila Loom: usar el paquete como referencia para medir latencia, corrección y estabilidad del runtime `hrx-loom` frente a llama.cpp en el mismo GGUF.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes y 4 096 tokens de salida, encaja en herramientas internas de soporte o generación de borradores donde el throughput no es crítico.
- Razonamiento paso a paso desactivable: para tareas de clasificación o extracción donde se prioriza latencia, se puede desactivar el thinking por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "no se han vuelto a medir" ("not yet re-measured"), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) carecen de ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 2B, por lo que el peso de los pesos ronda el orden de 1-2 GB, pero el pool de memoria configurable con `--pool_backing=fixed` puede reservar más.
- GPU soportadas según la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA; el paquete está orientado a AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; las tablas de rendimiento del autor están sin re-medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B (paquete Loom) | 2B | 128 000 | other | GGUF + programas `.loom`, `loom-serve` | Solo AMD gfx1151 / gfx1201; sin métricas publicadas |
| bartowski/LFM3-VL-2B-GGUF | 2B | no disponible | other | GGUF, llama.cpp | Checkpoint de origen, portable a más hardware |
| LFM3-VL-2B original | 2B | no disponible | no disponible | safetensors (presumible) | Modelo multimodal completo; el paquete Loom no soporta imagen |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de métricas: ninguna puerta de corrección ni tabla de rendimiento tiene mediciones registradas; no hay evidencia publicada de que la salida coincida con llama.cpp.
- Sin soporte de imagen: aunque el modelo base es vision-language, Loom no admite entrada de imagen, lo que elimina una de sus capacidades diferenciales.
- Licencia "other": no se especifican términos de uso comercial; es necesario consultar la licencia del modelo base antes de desplegarlo en producción.
- Idiomas no declarados: no se puede garantizar calidad multilingüe.
- Hardware restringido: solo se documentan dos GPU AMD; no hay soporte declarado para NVIDIA ni para otras GPU de consumo.
- Concurrencia baja (4 peticiones) y salida máxima de 4 096 tokens: puede ser insuficiente para cargas de producción medias o altas.
- Riesgo de alucinación: no evaluado en la información disponible; sin benchmarks ni pruebas de fidelidad publicadas.
- Paquete generado automáticamente: los programas `.loom` se producen con `loom-next` sin LLM en el bucle, pero no se documenta validación independiente del artefacto.
- Fecha de creación futura (2026-11-19) y cero descargas: el artefacto no tiene tracción ni validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-LFM3-VL-2B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/LFM3-VL-2B-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
