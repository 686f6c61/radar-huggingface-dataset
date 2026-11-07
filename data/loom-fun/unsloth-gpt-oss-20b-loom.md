# loom-fun/unsloth-gpt-oss-20b-loom

## Resumen

`loom-fun/unsloth-gpt-oss-20b-loom` es un paquete de despliegue para AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `unsloth/gpt-oss-20b-GGUF` (concretamente `gpt-oss-20b-Q4_K_M.gguf`) en forma de programas `.loom` y una tarjeta `model.json`, generados con el flujo de trabajo loom-skills sobre un AMD Ryzen AI Max+ 395 "Strix Halo". El autor es la organizacion `loom-fun`, vinculada al runtime Loom (hrx-system) de ROCm.

El modelo subyacente es gpt-oss-20b, un modelo de texto de aproximadamente 21B parametros distribuido por Unsloth en formato GGUF. El paquete Loom anade un servidor compatible con la API `/v1/chat/completions` de OpenAI, soporte de tool calling, modo de razonamiento siempre activo con `reasoning_effort` configurable, contexto de 131.072 tokens por peticion y concurrencia de 4 peticiones.

Su relevancia es acotada pero concreta: demuestra la ejecucion de un GGUF de 20B en hardware AMD integrado (Strix Halo, gfx1151) con un motor propio, con mediciones de throughput frente a llama.cpp y una bateria de pruebas de correccion (kernels, golden, agent, needle, sampling) publicadas con evidencia de ejecucion. No aporta pesos nuevos ni fine-tuning; aporta un artefacto de despliegue reproducible y verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base gpt-oss-20b; el paquete es un runtime Loom sobre GGUF) |
| Parametros totales | 21B (segun la ficha de `unsloth/gpt-oss-20b-GGUF`) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `weights.loom`) |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: envuelve el GGUF `gpt-oss-20b-Q4_K_M.gguf` de Unsloth, que a su vez corresponde al modelo gpt-oss-20b de aproximadamente 21B parametros. La capa anadida por Loom consiste en programas `.loom` generados a partir de un `llm_config.json`, mas un tokenizador (`tokenizer.json`) y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256, que `loom-fetch` verifica al materializar el paquete.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO en el modelo base. La innovacion tecnica del paquete es de inferencia: kernels generados y validados contra implementaciones de referencia (35/35 tests superados), comparacion token a token contra llama.cpp sobre el mismo GGUF, y soporte de razonamiento con `reasoning_effort` en tres niveles (low, medium, high; por defecto medium). La decodificacion especulativa no esta soportada.

## Capacidades

- Generacion de texto con razonamiento (thinking) siempre activo y esfuerzo de razonamiento configurable via `reasoning_effort`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucle multi-turno verificado por la puerta `agent`.
- Servidor HTTP compatible con `/v1/chat/completions` de OpenAI en `127.0.0.1:8080`.
- Muestreo con `temperature`, `top_p`, `top_k` y `seed`.
- Contexto de 131.072 tokens por peticion y hasta 4 peticiones concurrentes.
- Limite de salida de 4.096 tokens mediante el preset `max_tokens`.
- Sin soporte de entrada de imagen, audio ni salida de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en hardware AMD Strix Halo: `loom-serve` con `--device=amdgpu` y `--memory_bytes=28000000000` permite servir el modelo en un Ryzen AI Max+ 395 sin GPU dedicada, con throughput de decodificacion medido de 77,5 tok/s en prompt corto.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y prefill de 2.470,1 tok/s en documentos de 8k, es adecuado para resumir o extraer informacion de contratos, informes o expedientes de decenas de miles de tokens en una sola peticion.
- Agentes con herramientas: el soporte de `tool_calls` estilo OpenAI y el bucle `agent` verificado permiten construir asistentes que consultan APIs, bases de datos o sistemas internos con historial reutilizado.
- Backend de chat para aplicaciones internas: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local sin cambiar el codigo cliente, usando los SDK existentes.
- Razonamiento con coste controlado: los niveles `low`, `medium` y `high` de `reasoning_effort` permiten ajustar latencia y profundidad segun la tarea, desde clasificacion rapida hasta analisis multi-paso.
- Evaluacion de motores de inferencia: el paquete incluye mediciones y puertas de correccion reproducibles, util para comparar Loom frente a llama.cpp sobre el mismo GGUF en hardware AMD.
- Prototipado en entornos con requisitos de privacidad: al ejecutarse en local con pesos Apache 2.0, los datos no salen de la maquina, lo que encaja en entornos con restricciones de tratamiento de datos.

## Benchmarks y rendimiento

Rendimiento medido sobre AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, Ubuntu 24.04), mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Techo roofline |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | no medido | no medido | 92,7 |
| Decodificacion tok/s, contexto 2k | no medido | no medido | 90,7 |
| Decodificacion tok/s, contexto 32k | no medido | no medido | 69,2 |
| Prefill tok/s, documento 1k | 1.454,8 | 2.167,7 | 9.527,3 |
| Prefill tok/s, documento 2k | 1.489,2 | 2.356,6 | 9.378,4 |
| Prefill tok/s, documento 8k | 1.500,7 | 2.470,1 | 8.574,5 |
| Prefill tok/s, documento 16k | 1.263,5 | 2.217,1 | 7.695,0 |
| Prefill tok/s, documento 32k | 982,8 | 1.881,1 | 6.385,2 |
| 4 streams, decodificacion agregada tok/s | 135,2 | 160,5 | 162,0 |
| Decodificacion especulativa | n/a | n/a | n/a |

Los valores de decodificacion en los escenarios de prompt corto, 2k y 32k no se registraron como media en la tabla de la model card; solo constan los valores individuales de DevLab (75,0 frente a 77,5 tok/s en prompt corto; 71,3 frente a 73,2 en 2k; 60,2 frente a 52,1 en 32k). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo oficial arranca con `--memory_bytes=28000000000` (28 GB) para el GGUF Q4_K_M en memoria unificada.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 216 GB/s de ancho de banda y 59 TFLOP/s segun el calculo roofline del autor.
- GPU dedicadas (A100, H100, RTX 4090): no disponible en la informacion proporcionada; el paquete esta orientado a `--device=amdgpu` en el runtime Loom.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se documenta soporte de vLLM, TGI, Ollama o llama.cpp para este paquete concreto (llama.cpp se usa solo como referencia de comparacion).
- Throughput medido: 77,5 tok/s de decodificacion en prompt corto, 160,5 tok/s agregados con 4 streams y hasta 2.470,1 tok/s de prefill en documentos de 8k.
- Concurrencia maxima soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| loom-fun/unsloth-gpt-oss-20b-loom | 21B | 131.072 | GGUF empaquetado en `.loom` | Apache 2.0 | Runtime Loom para AMD Strix Halo |
| unsloth/gpt-oss-20b-GGUF | 21B | no disponible | GGUF | no disponible | Pesos GGUF del modelo base |
| unsloth/gpt-oss-20b | 21B | no disponible | safetensors | no disponible | Pesos originales del modelo base |

La comparacion con alternativas de otros fabricantes (Llama, Qwen, Mistral) no esta disponible en la informacion proporcionada. La diferencia practica frente a los dos anteriores es el motor: Loom aporta servidor OpenAI, tool calling, razonamiento configurable y pruebas de correccion, a cambio de atarse al runtime hrx-loom.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB en el momento de la consulta; verificar la integridad de los ficheros antes de usarlo en produccion.
- No es un modelo nuevo ni afinado: cualquier sesgo, alucinacion o limitacion linguistica proviene del gpt-oss-20b subyacente, sobre el que no se aporta informacion en esta ficha.
- Sin soporte de vision, audio ni decodificacion especulativa.
- La puerta `needle_full` (needle-in-the-haystack a contexto completo) no tiene evidencia registrada; el autor solo certifica hasta la mitad del contexto.
- Limite de salida de 4.096 tokens, insuficiente para generaciones largas sin trocear.
- Concurrencia maxima de 4 peticiones; no apto para cargas de alta concurrencia sin escalado horizontal.
- Dependencia del runtime hrx-loom `0.1.0` y de hardware AMD gfx1151; no hay evidencia de funcionamiento en otras GPU.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `unsloth/gpt-oss-20b-GGUF`, no disponible en la informacion proporcionada.
- Las mediciones de decodificacion y prefill no se registraron como media en varios escenarios, y la comparacion local frente a DevLab es informativa, no concluyente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-gpt-oss-20b-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gpt-oss-20b-GGUF
- Modelo base (pesos originales): https://huggingface.co/unsloth/gpt-oss-20b
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42408229600
