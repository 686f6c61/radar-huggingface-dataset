# loom-fun/unsloth-Llama-3.1-8B-Instruct-loom

## Resumen

`loom-fun/unsloth-Llama-3.1-8B-Instruct-loom` es un paquete de despliegue para el runtime Loom (ROCm/hrx-system) que empaqueta el checkpoint GGUF sin modificar `unsloth/Llama-3.1-8B-Instruct-GGUF`, en su variante `Llama-3.1-8B-Instruct-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: el autor (loom-fun) genera los programas `.loom` y la tarjeta `model.json` a partir del GGUF original mediante el flujo `loom-skills`, ejecutado sobre un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El interes del artefacto es de infraestructura, no de modelado: demuestra como servir Llama 3.1 8B Instruct cuantizado en Q4_K_M sobre GPU integrada AMD con decodificacion especulativa activada por defecto (n-gram prompt lookup, profundidad 2) y una API compatible con OpenAI (`/v1/chat/completions`). El modelo subyacente es un transformer denso de 8B parametros con 131.072 tokens de contexto, tool calling y licencia Llama 3.1.

Es relevante ahora porque ofrece una alternativa medida frente a llama.cpp en hardware consumer AMD: +19 % a +34 % de velocidad de decodificacion en prompts cortos y 2k de contexto, y +32 % a +70 % en prefill, con paridad funcional verificada frente a la referencia llama.cpp en las puertas de correccion del propio proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct); empaquetado como programas `.loom` + `model.json` |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la ficha de HF (el modelo base Llama 3.1 usa Llama 3.1 Community License) |
| Formato de pesos | GGUF (`Llama-3.1-8B-Instruct-Q4_K_M.gguf`) + programas `.loom` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | n-gram prompt lookup, profundidad 2, activada por defecto |
| Runtime | hrx-loom 0.1.0 (hrx-system `d01d1c1`), dispositivo `amdgpu` |
| Memoria configurada en el ejemplo | 35.000.000.000 bytes (`--memory_bytes`) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct, un transformer denso decoder-only de Meta con 8.030 millones de parametros y ventana de 131.072 tokens. El paquete no modifica pesos ni introduce entrenamiento adicional: el autor indica explicitamente que se trata del "unmodified GGUF checkpoint". Por tanto, no hay datos propios sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO mas alla de lo publicado por Meta y Unsloth para el modelo original, que no se detalla en la informacion disponible.

La innovacion tecnica esta en el runtime Loom. El paquete incluye kernels generados (`program/*.loom`) validados contra implementaciones de referencia (37/37 tests unitarios superados) y una capa de decodificacion especulativa basada en n-gram prompt lookup con profundidad 2, que propone tokens candidatos a partir del propio prompt y los verifica en un solo paso. En las mediciones del autor, la tasa de aceptacion de tokens redactados fue del 7 % en la puerta `spec`, del 5 % en decodificacion corta, del 14 % a 2k y del 16 % a 32k. El servidor expone una API compatible con OpenAI y renderiza las plantillas de chat y de tool calling de forma verificada contra llama.cpp.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles (idiomas adicionales no verificados en la informacion disponible).
- Razonamiento y matematicas basicas heredados de Llama 3.1 8B Instruct.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`; la puerta `agent` valida el bucle multi-turno de llamadas a herramientas contra llama.cpp.
- API compatible con OpenAI en `/v1/chat/completions`, con muestreo configurable (`temperature`, `top_p`, `top_k`, `seed`).
- Decodificacion especulativa n-gram activada por defecto, con salida identica a la decodificacion sin especulacion (puerta `spec` superada).
- Concurrencia de 4 peticiones con consistencia verificada (misma salida que ejecutadas por separado).
- Capacidad de contexto largo: needle-in-the-haystack superado hasta la mitad del contexto (65.536 tokens); a contexto completo no hay evidencia registrada.
- Sin modo thinking/razonamiento explicito, sin entrada de imagen y sin entrada/salida de audio (marcados como no soportados).

## Casos de uso

- Servicio de chat sobre GPU integrada AMD: desplegar un asistente conversacional con `/v1/chat/completions` en un Ryzen AI Max+ 395 sin GPU dedicada, aprovechando los 46,9 tok/s de decodificacion en prompts cortos y los 47,3 tok/s a 2k de contexto.
- Procesamiento de documentos largos: el prefill de 1.433 a 1.536 tok/s en documentos de 1k-2k tokens y de 720 tok/s a 32k permite resumir o extraer informacion de contratos, informes o transcripciones dentro de la ventana de 131k tokens.
- Agentes con herramientas en local: el soporte verificado de `tools`/`tool_calls` y el bucle `agent` validado permiten construir asistentes que consulten APIs internas, bases de datos o sistemas de tickets sin salir del equipo.
- Desarrollo y pruebas de pipelines LLM en estaciones de trabajo sin NVIDIA: la compatibilidad OpenAI permite apuntar clientes existentes (LangChain, LlamaIndex, SDK de OpenAI) al servidor Loom cambiando solo la `base_url`.
- Evaluacion comparativa de runtimes: usar el mismo GGUF Q4_K_M en llama.cpp y en Loom para medir latencia, throughput y fidelidad de salida en hardware AMD antes de decidir el motor de produccion.
- Atencion al cliente automatizada de baja concurrencia: con 4 peticiones concurrentes y 116,1 tok/s agregados en decodificacion, es adecuado para equipos pequenos o entornos de demo, no para alta concurrencia.
- RAG local con contexto largo: indexar y consultar documentacion tecnica en un solo equipo, apoyandose en la ventana de 131k tokens y en la puerta `needle` superada hasta 65k.

## Benchmarks y rendimiento

Mediciones del autor sobre AMD Ryzen AI Max+ 395 "Strix Halo" (Radeon 8060S, gfx1151, 216 GB/s, 59 TFLOP/s), mismo GGUF en ambos motores, 2026-11-07:

| Metrica | llama.cpp | Loom | Margen | Roofline | % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 39,4 | 46,9 | +19 % | 51,6 | 91 % |
| Decode tok/s, contexto 2k | 35,4 | 47,3 | +34 % | 56,5 | 84 % |
| Decode tok/s, contexto 32k | 24,1 | 22,3 | -7 % | 32,5 | 69 % |
| Prefill tok/s, documento 1k | 1.083,5 | 1.433,5 | +32 % | 4.148,9 | 35 % |
| Prefill tok/s, documento 2k | 967,3 | 1.536,2 | +59 % | 4.073,8 | 38 % |
| Prefill tok/s, documento 8k | 882,0 | 1.349,3 | +53 % | 3.674,7 | 37 % |
| Prefill tok/s, documento 16k | 650,4 | 1.103,0 | +70 % | 3.250,2 | 34 % |
| Prefill tok/s, documento 32k | 482,1 | 720,6 | +49 % | 2.640,1 | 27 % |
| 4 streams, decode agregado tok/s | 94,3 | 116,1 | +23 % | 199,7 | 58 % |
| Tokens redactados aceptados (spec) | — | 7 % | — | n/a | n/a |

Condiciones: llama.cpp build `llamacpp-rocm/b1369` con `-ngl 99 -cram 0 -c 35024 -kvu -np 4`; Loom con decodificacion especulativa activada (n-gram, profundidad 2). El tiempo en Loom es del lado del cliente; en llama.cpp, del servidor. Valores de decode y prefill: media de 1-2 ejecuciones; 4 streams: mediana de 1 ejecucion. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

Puertas de correccion (loom-benchmark, LEVEL=full, 2026-11-07): `kernel_tests` 37/37, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling` y `needle` superadas; `needle_full` sin evidencia; `vision`, `agent_think_off` y `decision` no aplicables.

## Requisitos de hardware

- VRAM/memoria unificada: el ejemplo de despliegue reserva 35.000.000.000 bytes (unos 32,6 GiB) para el modelo y el contexto; el GGUF Q4_K_M ocupa aproximadamente 4,9 GB en disco, por lo que el grueso de la reserva corresponde a la cache KV para contexto largo.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), memoria unificada de 216 GB/s de ancho de banda. Es el unico dispositivo con mediciones registradas.
- GPU dedicadas: no hay datos de rendimiento en A100, H100, RTX 4090 u otras; el runtime Loom esta orientado a `amdgpu` via ROCm.
- Cabe en consumer GPU: el checkpoint Q4_K_M cabe en GPUs consumer con 8 GB o mas en teoria, pero no hay evidencia de ejecucion en ellas con este paquete; el soporte documentado es la iGPU Strix Halo.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --model=... --device=amdgpu --memory_bytes=...`; el servidor escucha en `127.0.0.1:8080`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: 46,9 tok/s en decodificacion corta, 22,3 tok/s a 32k de contexto, 116,1 tok/s agregados con 4 streams y prefill de 720 a 1.536 tok/s segun longitud del documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Llama-3.1-8B-Instruct-loom | 8,03B | 131.072 | GGUF Q4_K_M + Loom (ROCm) | no disponible en la ficha | 0 descargas, 1 like |
| unsloth/Llama-3.1-8B-Instruct-GGUF (base) | 8,03B | 131.072 | GGUF para llama.cpp y derivados | Llama 3.1 Community License | ampliamente distribuido |
| unsloth/Meta-Llama-3.1-8B | 8,03B | 131.072 | safetensors (fine-tune sin cuantizar) | Llama 3.1 Community License | ampliamente distribuido |
| Llama 3.1 8B Instruct servido con llama.cpp en el mismo hardware | 8,03B | 131.072 | GGUF Q4_K_M | Llama 3.1 Community License | referencia de comparacion del autor |

La diferencia frente a llama.cpp en el mismo equipo es de rendimiento (+19 % a +34 % en decode corto/2k, +32 % a +70 % en prefill, -7 % a 32k), no de calidad: ambos ejecutan los mismos pesos y las puertas de correccion verifican salidas equivalentes salvo empates cercanos.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitacion de Llama 3.1 8B Instruct (sesgos, alucinacion, conocimiento con corte de 2023) se hereda sin cambios.
- La licencia no figura en la ficha de Hugging Face; antes de uso comercial hay que verificar la licencia del modelo base (Llama 3.1 Community License) y los terminos del paquete Loom.
- El rendimiento medido corresponde exclusivamente a un Ryzen AI Max+ 395 con Radeon 8060S; no hay datos para otras GPU AMD ni NVIDIA.
- A contexto de 32k la decodificacion es un 7 % mas lenta que llama.cpp, y el paquete no alcanza el roofline en prefill (27-38 %), por lo que hay margen de optimizacion.
- `needle_full` no tiene evidencia: el comportamiento a contexto completo (131k) no esta verificado, solo hasta la mitad.
- Sin modo thinking, sin vision y sin audio; el paquete declara estas capacidades como no soportadas.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens, insuficiente para cargas de produccion de alta demanda.
- El proyecto es muy reciente (creado 2026-11-07) con 0 descargas; el ecosistema Loom (hrx-loom 0.1.0) esta en fase temprana y depende de ROCm y del hardware gfx1151.
- La tasa de aceptacion de la decodificacion especulativa es baja (5-16 %), por lo que la ganancia real varia mucho con el tipo de prompt.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla, marca de ropa); no aportan informacion sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-fun/unsloth-Llama-3.1-8B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct-GGUF
- Modelo base sin cuantizar (fine-tune Unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de benchmarks y puertas de correccion (DevLab Dispatch run 42357887978): https://github.com/loom-fun/loom-skills/actions/runs/42357887978
