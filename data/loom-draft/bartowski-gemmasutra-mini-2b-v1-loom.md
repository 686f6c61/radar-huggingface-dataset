# loom-draft/bartowski-Gemmasutra-Mini-2B-v1-loom

## Resumen

`loom-draft/bartowski-Gemmasutra-Mini-2B-v1-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF ya existente `bartowski/Gemmasutra-Mini-2B-v1-GGUF`, en concreto el fichero `Gemmasutra-Mini-2B-v1-Q4_K_M.gguf`. El autor del paquete es `loom-draft`, y los pesos subyacentes corresponden a un fine-tune de la familia Gemma de 2B parametros, empaquetado por bartowski en cuantizacion Q4_K_M.

La relevancia de este repositorio no esta en el modelo en si, sino en el runtime: Loom es un sistema de inferencia para GPUs AMD que compila los pesos a programas `.loom` y los sirve mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`). El paquete esta dirigido especificamente a dos aceleradores: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), y se ha generado con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El repo tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB y fue creado el 25 de noviembre de 2026. Se trata, por tanto, de un artefacto de publicacion muy reciente y sin validacion externa: las propias tablas de rendimiento y de correctitud de la model card indican "not yet re-measured" para ambas GPUs, es decir, no hay evidencia registrada de las gates de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma, 2B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | no disponible con exactitud; el nombre del checkpoint indica ~2B |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens por peticion (segun la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom no lista otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; requiere revision de los terminos de Gemma) |
| Formato de pesos | GGUF de origen, compilado a programas `.loom` (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |
| Tool calling | no soportado ("not applicable") |
| Modo razonamiento | no soportado ("not applicable") |
| Decodificacion especulativa | no soportada ("not applicable") |
| Entrada de imagen / audio | no soportada ("not applicable") |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente mas alla de su origen: un fine-tune de 2B parametros de la familia Gemma, empaquetado por bartowski en GGUF con cuantizacion Q4_K_M. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento en el fine-tune original. La model card del paquete Loom no reproduce esa informacion; habria que consultar la ficha del modelo base para obtenerla.

La innovacion tecnica del repositorio es el propio pipeline Loom: `loom-next` genera programas `.loom` a partir del GGUF sin modificar los pesos ("unmodified GGUF checkpoint"), y `loom-serve` los ejecuta sobre GPUs AMD con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye `tokenizer.json`, `llm_config.json` e `info.json` con las medidas, la evidencia de gates y las versiones. La model card define un conjunto de gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp token a token, pero ninguna de ellas tiene medicion registrada para este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 8.192 tokens por peticion y hasta 4.096 tokens de salida.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Sin soporte de tool calling ni function calling ("not applicable" en la model card).
- Sin modo de razonamiento o thinking.
- Sin decodificacion especulativa.
- Sin entrada de imagen ni de audio.
- Muestreo: estado "not determined" en la model card; no se confirma el comportamiento de temperatura, top_k y semilla.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat local en estaciones de trabajo AMD: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"`, se descarga con `loom-fetch` y se sirve con `loom-serve`, ofreciendo un endpoint compatible con OpenAI en `127.0.0.1:8080` para prototipos y herramientas internas que ya hablan ese protocolo.
- Evaluacion comparativa del runtime Loom frente a llama.cpp: al tratarse de un GGUF sin modificar con gates definidos contra la referencia de llama.cpp, sirve para validar la fidelidad numerica del compilador Loom en Strix Halo y R9700 antes de adoptarlo en produccion.
- Asistentes de texto breve en el borde: con 2B parametros en Q4_K_M y 8.192 tokens de contexto, encaja en tareas de resumen, reescritura y respuesta a preguntas sobre documentos cortos ejecutadas en hardware de escritorio con GPU integrada.
- Pruebas de integracion de pipelines RAG ligeros: el endpoint `/v1/chat/completions` permite conectar el modelo a orquestadores existentes (LangChain, LlamaIndex) para validar flujos de recuperacion y generacion sin depender de APIs en la nube.
- Banco de pruebas de cuantizacion Q4_K_M en GPUs AMD: util para medir el impacto de la cuantizacion de 4 bits en la calidad de salida frente al checkpoint en precision completa, usando las gates `golden` y `compare` una vez registradas.
- Despliegue en entornos con requisitos de localidad de datos: al ejecutarse integramente en la GPU local, evita el envio de prompts a servicios externos, lo que resulta adecuado para datos sensibles en pruebas de concepto.
- Docencia y experimentacion con runtimes de inferencia alternativos: permite a investigadores comparar el rendimiento de Loom con otras pilas de inferencia sobre el mismo checkpoint GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las gates de correctitud figuran como "not yet re-measured" en ambas GPUs. No se dispone de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un checkpoint de ~2B parametros en Q4_K_M ocupa del orden de 1,5-2 GB de pesos, pero el pool de memoria de Loom y el contexto de 8.192 tokens anaden overhead no cuantificado en la informacion proporcionada.
- GPUs soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta soporte para A100, H100 ni RTX 4090; el paquete esta generado para el backend AMD de Loom.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Concurrencia maxima configurada: 4 peticiones.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski-Gemmasutra-Mini-2B-v1-loom (este) | ~2B | 8.192 tokens | GGUF compilado a `.loom` | other | Runtime Loom, solo GPUs AMD gfx1151/gfx1201, sin benchmarks publicados |
| bartowski/Gemmasutra-Mini-2B-v1-GGUF (base) | ~2B | no disponible en esta ficha | GGUF | other | Mismo checkpoint sin empaquetar; ejecutable con llama.cpp en multiples backends |
| Otros modelos de ~2B de la familia Gemma | ~2B | no disponible | safetensors / GGUF | terminos Gemma | Alternativa de referencia; requiere consultar ficha oficial para specs y benchmarks |

No se dispone de datos de rendimiento comparado para este paquete, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de evidencia de correctitud: todas las gates (`kernel_tests`, `golden`, `compare`, `sampling`, `logits`, etc.) figuran como "not yet re-measured" en ambas GPUs objetivo.
- Sin mediciones de rendimiento publicadas: no se puede afirmar que Loom iguale o supere a llama.cpp con este checkpoint.
- Soporte limitado a dos aceleradores AMD concretos (gfx1151 y gfx1201); no hay indicios de soporte para GPUs NVIDIA ni para CPU.
- Sin tool calling, sin modo de razonamiento, sin decodificacion especulativa y sin entrada multimodal, lo que restringe su uso en flujos de agentes.
- Estado del muestreo "not determined": no se confirma el comportamiento de temperatura, top_k y semilla.
- Licencia "other" heredada del modelo base: es imprescindible revisar los terminos de uso de Gemma antes de cualquier despliegue comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Riesgo de alucinacion y sesgos del fine-tune original: no evaluados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: sin validacion por parte de la comunidad.
- El modelo subyacente es un fine-tune de 2B; su utilidad en tareas de razonamiento complejo o codigo es limitada en comparacion con modelos de mayor tamano.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Gemmasutra-Mini-2B-v1-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Gemmasutra-Mini-2B-v1-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
