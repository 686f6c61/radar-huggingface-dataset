# loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom

## Resumen

`loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `bartowski/Qwen2.5-1.5B-Instruct-GGUF` (concretamente `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf`) junto con un `model.json` y un conjunto de programas `.loom`, generados sobre un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo `loom-skills`. El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros de Alibaba Qwen, ajustado para instrucciones.

El valor del paquete es operativo: permite servir el modelo con `loom-serve` exponiendo una API compatible con OpenAI (`/v1/chat/completions`) sobre GPU AMD (amdgpu), con decodificacion especulativa activada por defecto mediante n-gram prompt lookup con profundidad 2. La model card reporta comparativas de throughput frente a llama.cpp en el mismo hardware, con mejoras notables en prefill (hasta +98 % en documentos de 32k) y en decode a 2k de contexto (+98 %), aunque con retrocesos en decode a 32k (-11 %) y en concurrencia de 4 flujos (-33 %).

Es relevante ahora porque demuestra una via practica para ejecutar modelos pequenos en hardware AMD integrado (Strix Halo) con aceleracion y validacion de correctitud frente a llama.cpp, un nicho donde el ecosistema de inferencia esta menos maduro que en CUDA. La licencia del paquete no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), empaquetado para runtime Loom |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete; otras cuantizaciones disponibles en el repo base de bartowski |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M); paquete Loom con `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros con atencion causal estandar y ajuste por instrucciones. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el checkpoint base; esos datos corresponden a la model card original de Qwen y no se incluyen aqui.

La innovacion del paquete no esta en el modelo sino en el runtime. Loom genera kernels especificos para el dispositivo y habilita decodificacion especulativa con n-gram prompt lookup a profundidad 2, activada por defecto. La model card reporta validacion de correctitud frente a llama.cpp: 37/37 tests de kernel, coincidencia de tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k, equivalencia de salida con y sin decodificacion especulativa, y consistencia en peticiones concurrentes. La tasa de aceptacion de tokens draft medidos varia segun la sesion (3 % en decode corto, 60 % a 2k, 28 % a 32k, 14 % en la puerta `spec`).

## Capacidades

- Generacion de texto y respuestas conversacionales multi-turno en formato chat.
- Tool calling / function calling con esquema compatible con OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-paso con reutilizacion de historial y renderizado exacto de prompts, validados por la puerta `agent`.
- API compatible con OpenAI en `/v1/chat/completions`, con parametros `temperature`, `top_p`, `top_k` y `seed`.
- Decodificacion especulativa n-gram integrada (profundidad 2, activada por defecto).
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de modo razonamiento/thinking, sin esfuerzo de razonamiento configurable, sin entrada de imagen y sin audio (segun la tabla de features de la model card).

## Casos de uso

- Asistente conversacional ligero en local: el modelo gestiona dialogos multi-turno con hasta 32.768 tokens de contexto, adecuado para un asistente personal o de escritorio desplegado sobre una GPU AMD integrada con `loom-serve`.
- Automatizacion de soporte tecnico de primer nivel: con tool calling compatible con OpenAI se puede conectar a APIs internas (consulta de estado de pedidos, tickets) en un flujo de agente validado por la puerta `agent`.
- Generacion de codigo asistida en entornos con hardware AMD: el modelo puede integrarse en un pipeline que llame a herramientas (ejecutar tests, consultar repositorio) mediante `tool_calls`, con la ventaja de correr enteramente en local.
- Procesamiento de documentos largos en local: el prefill a 8k-32k tokens es entre un 64 % y un 98 % mas rapido que llama.cpp en el mismo hardware, lo que lo hace util para resumir o extraer informacion de documentos extensos.
- Prototipado de agentes y evaluacion de herramientas: la API compatible con OpenAI permite sustituir un endpoint remoto por `loom-serve` sin cambiar el codigo cliente, util para probar bucles de agente en local.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en hardware local sin llamadas externas, encaja en escenarios donde los datos no pueden salir de la maquina.
- Servicio multiusuario ligero: con 4 peticiones concurrentes soportadas, puede atender un pequeno equipo interno, aunque el throughput agregado en 4 flujos es un 33 % inferior al de llama.cpp segun la model card.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), Ubuntu 24.04, hrx-loom 0.1.0, el 2026-11-07. Mismo GGUF en ambos motores.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 143,0 | 148,0 | +3 % | 235,4 | 63 % |
| Decode tok/s, contexto 2k | 122,2 | 241,8 | +98 % | 459,7 | 53 % |
| Decode tok/s, contexto 32k | 86,5 | 77,0 | -11 % | 178,5 | 43 % |
| Prefill tok/s, documento 1k | 4378,1 | 6639,0 | +52 % | 21800,1 | 30 % |
| Prefill tok/s, documento 2k | 3894,6 | 6568,5 | +69 % | 21128,6 | 31 % |
| Prefill tok/s, documento 8k | 3321,7 | 5453,8 | +64 % | 17832,8 | 31 % |
| Prefill tok/s, documento 16k | 2306,6 | 4212,0 | +83 % | 14762,4 | 29 % |
| Prefill tok/s, documento 32k | 1526,7 | 3024,0 | +98 % | 10981,0 | 28 % |
| 4 flujos, decode agregado tok/s | 392,1 | 262,5 | -33 % | 1054,4 | 25 % |
| Tokens draft aceptados (spec decoding) | no medido | 14 % | no aplica | no aplica | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para este paquete en la informacion disponible. Las cifras anteriores son exclusivamente de throughput.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque usa `--memory_bytes=8000000000` (8 GB), coherente con un modelo de 1.5B en Q4_K_M mas overhead del runtime y contexto de 32k.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (Strix Halo, gfx1151); el runtime usa `--device=amdgpu`.
- Hardware de referencia de las mediciones: AMD RYZEN AI MAX+ 395 w/ Radeon 8060S Graphics, Ubuntu 24.04.
- Cabe en GPU de consumo: si, en iGPU Strix Halo y previsiblemente en GPUs AMD discretas con 8 GB o mas; no se proporcionan datos para GPUs NVIDIA en esta informacion.
- Opciones de despliegue: `loom-serve` (runtime Loom, via `pip install "hrx-loom[hf]"` y `loom-fetch`); el mismo GGUF es compatible con llama.cpp (build `llamacpp-rocm/b1369` usado como referencia).
- Latencia y throughput: ver tabla de benchmarks; decode de 148 tok/s a prompt corto y prefill de 6639 tok/s a 1k, con roofline del hardware a 216 GB/s y 59 TFLOP/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (Loom) | 1,5B | 32.768 | GGUF Q4_K_M + paquete Loom | no disponible | Runtime AMD con spec decoding n-gram |
| Qwen2.5-1.5B-Instruct (bartowski GGUF) | 1,5B | 32.768 (segun config del runtime) | GGUF | no disponible | Mismo checkpoint, sin empaquetado Loom; base de este paquete |
| llama.cpp sobre el mismo GGUF | 1,5B | 33.792 en la config medida | GGUF | no disponible | Referencia de rendimiento: 143 tok/s decode corto, 4378 tok/s prefill 1k |

La comparacion con modelos de otros tamanos o familias no esta disponible en la informacion proporcionada. La diferencia practica frente a llama.cpp es el runtime: Loom mejora prefill y decode a contextos medios, pero pierde en contexto de 32k y en concurrencia.

## Limitaciones y advertencias

- El paquete no declara licencia; antes de uso comercial hay que verificar la licencia del checkpoint base Qwen2.5-1.5B-Instruct y la del runtime Loom por separado.
- Los idiomas soportados no estan declarados en la informacion disponible; el modelo base Qwen2.5 tiene cobertura multilingue, pero no se confirma aqui.
- Sin modo razonamiento/thinking ni esfuerzo de razonamiento; tareas que requieran cadena de pensamiento explicita no estan soportadas por el runtime.
- Sin soporte de vision ni audio.
- La puerta `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia registrada; solo se valida hasta la mitad del contexto.
- La decodificacion especulativa tiene tasas de aceptacion variables (3 % a 60 % segun contexto), lo que hace que la ganancia de throughput no sea uniforme.
- El throughput agregado con 4 flujos concurrentes es un 33 % inferior a llama.cpp en el mismo hardware.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; son los inherentes al checkpoint Qwen2.5-1.5B-Instruct, no evaluados aqui.
- Modelo de 1,5B parametros: capacidad limitada para razonamiento complejo, matematicas avanzadas y codigo de larga extension en comparacion con modelos mayores.
- Cero descargas y cero likes en el momento de la consulta; paquete recien publicado (2026-11-07) sin validacion de la comunidad.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun/bartowski-Qwen2.5-1.5B-Instruct-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF
- Modelo original Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42342192972): https://github.com/loom-fun/loom-skills/actions/runs/42342192972
