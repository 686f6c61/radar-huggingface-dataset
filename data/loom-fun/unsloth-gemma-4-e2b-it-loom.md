# loom-fun/unsloth-gemma-4-E2B-it-loom

## Resumen

`loom-fun/unsloth-gemma-4-E2B-it-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF `gemma-4-E2B-it-Q4_K_M.gguf` de Unsloth, derivado de Gemma 4 E2B it de Google. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explicitamente que el GGUF es "unmodified" y que el valor anadido esta en el formato `.loom` (programas y una tarjeta `model.json`) generado con el flujo `loom-skills`. El paquete esta pensado para ejecutarse en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) mediante `loom-serve`, que expone una API compatible con OpenAI en `/v1/chat/completions`.

El modelo subyacente es multimodal (pipeline `image-text-to-text`), con soporte de vision mediante el proyector `mmproj-F16.gguf`, tool calling estilo OpenAI, modo de razonamiento opcional (`enable_thinking`) y decodificacion especulativa con un drafter asistente (`AtomicChat/gemma-4-E2B-it-assistant-GGUF`, profundidad 3). La ficha del autor reporta una ventana de contexto de 131.072 tokens por peticion, hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

Su relevancia es de nicho pero concreta: demuestra una ruta de inferencia alternativa a llama.cpp sobre GPU integrada AMD, con ganancias medidas del +18 % al +26 % en decodificacion y del +9 % al +87 % en prefill sobre el mismo GGUF. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de repo de 0.0 GB (solo metadatos, sin pesos alojados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B; detalles de arquitectura no incluidos en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion (segun la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); proyector de vision en F16; drafter asistente en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Gemma 4 E2B (numero de capas, atencion, MoE o denso, composicion del dataset de entrenamiento, tokens vistos, fases de RLHF/DPO). Lo unico confirmado es que el checkpoint empaquetado es el GGUF original de Unsloth sin modificaciones, cuantizado en Q4_K_M, y que el modelo es multimodal con entrada de imagen a traves de un proyector separado (`mmproj-F16.gguf`).

La innovacion tecnica del paquete no esta en el modelo sino en el runtime: Loom genera kernels especificos para gfx1151 y aplica decodificacion especulativa con un drafter asistente de profundidad 3 activada por defecto. El autor reporta una tasa de aceptacion de tokens propuestos del 56 % en la puerta `spec` y del 29-36 % en las sesiones de decodificacion medidas. Tambien se documenta una roofline calculada para Strix Halo a 216 GB/s de ancho de banda y 59 TFLOP/s, con el modelo alcanzando entre el 13 % y el 45 % de ese techo segun el escenario.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`. No soporta ajuste de esfuerzo de razonamiento (`reasoning effort`).
- Entrada de imagen en formato OpenAI `image_url`, procesada con el proyector `mmproj-F16.gguf`.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), validado con una puerta `agent` de bucle multi-turno.
- Decodificacion especulativa con drafter asistente, activada por defecto, con salida identica a la decodificacion sin especulacion segun la puerta `spec`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Soporte de hasta 4 peticiones concurrentes con consistencia verificada frente a ejecuciones aisladas.
- Sin soporte de audio (ni entrada ni salida).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: `loom-serve --model=... --device=amdgpu` levanta un endpoint compatible con OpenAI en `127.0.0.1:8080`, adecuado para prototipos y herramientas internas que ya hablan el formato OpenAI sin adaptadores adicionales.
- Asistente multimodal en escritorio: la entrada de imagen via `image_url` permite consultas sobre capturas, diagramas o documentos escaneados en un flujo de chat local, sin depender de la nube.
- Agentes con tool calling: la puerta `agent` valida renderizado exacto de prompts, reutilizacion de historial y llamadas validas en bucles multi-turno, lo que habilita agentes que consultan APIs o bases de datos locales.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y un prefill medido de 3.807 tok/s en documentos de 1k y 2.938 tok/s en 8k, es viable resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Servicio de inferencia ligero con concurrencia moderada: 4 peticiones simultaneas con 202,9 tok/s agregados en decodificacion (frente a 167,1 de llama.cpp) encaja en equipos de trabajo pequenos o demos publicas.
- Evaluacion comparativa de runtimes: al empaquetar exactamente el mismo GGUF que usa llama.cpp, sirve como banco de pruebas reproducible para medir diferencias de rendimiento y correctitud entre motores sobre hardware AMD.

## Benchmarks y rendimiento

Rendimiento medido por el autor el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0. Mismo GGUF en ambos motores.

| Metrica | llama.cpp | Loom | Margen | Roofline | % de roofline (Loom) |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 103,4 | 123,2 | +19 % | 272,3 | 45 % |
| Decode tok/s, contexto 2k | 99,9 | 125,9 | +26 % | 295,3 | 43 % |
| Decode tok/s, contexto 32k | 70,6 | 83,4 | +18 % | 211,5 | 39 % |
| Prefill tok/s, documento 1k | 2.274,7 | 3.807,2 | +67 % | 14.886,1 | 26 % |
| Prefill tok/s, documento 2k | 2.094,9 | 3.924,4 | +87 % | 14.663,8 | 27 % |
| Prefill tok/s, documento 8k | 1.962,0 | 2.938,2 | +50 % | 13.508,6 | 22 % |
| Prefill tok/s, documento 16k | 1.546,8 | 2.049,2 | +32 % | 12.224,6 | 17 % |
| Prefill tok/s, documento 32k | 1.181,5 | 1.288,9 | +9 % | 10.271,9 | 13 % |
| 4 streams, decode agregado tok/s | 167,1 | 202,9 | +21 % | 1.475,6 | 14 % |
| Tokens propuestos aceptados (spec) | no aplica | 56 % | no aplica | no aplica | no aplica |

Notas del autor: Loom mide tiempos en cliente y llama.cpp en servidor; valores de decode y prefill son media de 1-2 ejecuciones y los de 4 streams la mediana de 1. La roofline usa 216 GB/s y 59 TFLOP/s para gfx1151. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 con grafica Radeon 8060S (gfx1151), memoria unificada; el runtime usa `--device=amdgpu`.
- VRAM estimada: no disponible de forma explicita. El peso empaquetado es Q4_K_M; a falta del numero de parametros no se puede calcular con rigor.
- GPU recomendadas: el autor solo valida AMD Strix Halo (gfx1151). No hay datos de funcionamiento en A100, H100 o RTX 4090.
- GPU de consumo: no confirmado; el unico dispositivo documentado es una APU AMD, no una GPU discreta.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. Tambien es posible usar el GGUF subyacente con llama.cpp (build `llamacpp-rocm/b1369` en las pruebas del autor).
- Latencia y throughput: ver tabla de benchmarks. Decodificacion de 83,4 a 125,9 tok/s y prefill de 1.288,9 a 3.924,4 tok/s segun longitud; 202,9 tok/s agregados con 4 streams.
- El drafter especulativo (`AtomicChat/gemma-4-E2B-it-assistant-GGUF`, Q8_0) y el proyector de vision (`mmproj-F16.gguf`) son artefactos adicionales que deben estar disponibles en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-gemma-4-E2B-it-loom | no disponible | 131.072 | 123,2 tok/s decode (Strix Halo) | no disponible | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it-GGUF (base) | no disponible | no disponible | mismo GGUF; llama.cpp 103,4 tok/s decode | no disponible | Hugging Face |
| unsloth/gemma-4-E2B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| AtomicChat/gemma-4-E2B-it-assistant-GGUF | no disponible (drafter) | no disponible | no aplica (asistente especulativo) | no disponible | Hugging Face |

La comparacion relevante es de runtime, no de modelo: Loom frente a llama.cpp sobre el mismo checkpoint. Frente a otros modelos de la misma categoria no hay datos de parametros ni de calidad en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: es un empaquetado de despliegue. Cualquier limitacion del Gemma 4 E2B original se hereda intacta.
- La licencia no esta declarada en la informacion proporcionada; antes de uso comercial hay que verificar los terminos del modelo base Gemma 4 y del GGUF de Unsloth.
- La puerta `needle_full` (needle-in-the-haystack a contexto completo) figura como "no evidence": el contexto de 131.072 tokens no esta verificado a plena capacidad.
- La puerta `decision` aparece como "not applicable" y `reasoning effort` no esta soportado, lo que limita el control fino sobre el modo de razonamiento.
- Solo hay validacion en AMD Strix Halo con hrx-loom 0.1.0; no hay evidencia de funcionamiento en otras GPU ni en CUDA.
- Las mediciones son de 1-2 ejecuciones (media) y 1 ejecucion (mediana en 4 streams), con metodologia distinta entre motores (cliente frente a servidor), lo que anade incertidumbre a los margenes.
- El paquete depende de artefactos externos (drafter Q8_0 y proyector F16) que deben descargarse por separado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base.
- Repositorio sin traccion (0 descargas, 0 likes) y creado el 2026-11-07: madurez y soporte no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-fun/unsloth-gemma-4-E2B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Modelo base sin cuantizar: https://huggingface.co/unsloth/gemma-4-E2B
- Drafter especulativo: https://huggingface.co/AtomicChat/gemma-4-E2B-it-assistant-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42375452274
- Guia de fine-tuning de Gemma 4 con Unsloth: https://unsloth.ai/docs/models/gemma-4/train
