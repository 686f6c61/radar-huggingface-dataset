# infosave/CherryPit-1.2-2B-cmf

## Resumen

CherryPit-1.2-2B es un asistente de programación de 2,5 mil millones de parámetros desarrollado por DRUPEs, afinado a partir de MiniCPM5-2B. Está orientado a desarrollo web, Python, matemáticas y tool calling, con 42 capas, una ventana de contexto de 131 072 tokens y un modo de razonamiento (thinking mode) que puede activarse o desactivarse por petición. La versión aquí descrita, CherryPit-1.2-2B-cmf, es la empaquetada por infosave en formato CMF para el motor de inferencia cortiq.

El interés principal de esta ficha no es solo el modelo, sino el formato de despliegue: CMF son ficheros únicos que corren con cortiq, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML. Funciona sobre CUDA y Vulkan en GPUs NVIDIA, Vulkan/DX12 en AMD e Intel, Metal en Apple Silicon y también en CPU, lo que permite servir el modelo en hardware muy heterogéneo con una huella de memoria reducida.

Se distribuyen dos variantes cuantizadas: una de 8 bits (2,54 GB) que reproduce prácticamente la calidad del modelo bf16 original (perplejidad WikiText-2 de 18,46 frente a 18,45) y una de 4 bits GPTQ (1,77 GB) algo más rápida y ligera. La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (42 capas), destilada/afinada desde MiniCPM5-2B |
| Parametros totales | 2,5 B (aproximadamente 2B segun el nombre) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131 072 tokens (KV cache por defecto 32 768 tokens) |
| Tipos de cuantizacion | 8-bit (`q8_2f`, 2,54 GB); 4-bit GPTQ con attention, embeddings y head en 8-bit (`q4tp`, 1,77 GB) |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único empaquetado para cortiq); modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base, DRUPEs/CherryPit-1.2-2B, es un transformer de 42 capas fine-tuneado desde MiniCPM5-2B como asistente de programación para aplicaciones web, Python, matemáticas y tool calling, con modo de razonamiento interno. No se ha publicado en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de esta distribución está en el pipeline de cuantización y despliegue. La variante de 8 bits se empaqueta en un único fichero CMF que conserva la calidad del bf16 (perplejidad 18,46 frente a 18,45 en WikiText-2). La variante de 4 bits se redondea con GPTQ sobre 4096 tokens de WikiText-2, código y conversaciones renderizadas con la plantilla propia del modelo, manteniendo attention, embeddings y head en 8 bits. El motor cortiq verifica que las plantillas renderizadas coincidan token a token con las de `transformers` en siete conversaciones distintas (system prompt, dos turnos, tools, thinking on/off y texto no inglés).

## Capacidades

- Generación de texto y código para desarrollo web (componentes React, JavaScript, etc.) y Python.
- Razonamiento matemático y resolución de problemas paso a paso.
- Modo thinking: el modelo decide si razonar antes de responder; `--no-think` o `"enable_thinking": false` fuerzan respuesta directa.
- Tool calling / function calling en formato XML (`<function name="..."><param name="...">...</param></function>`), expuesto como `message.tool_calls` con `finish_reason: "tool_calls"` en el servidor compatible con OpenAI.
- Servidor HTTP compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) con dashboard web integrado.
- Multilingüe limitado a inglés, ruso y chino.
- Contexto largo de hasta 131 072 tokens, configurable mediante `CMF_MAX_SEQ`.
- Inferencia multiplataforma: CUDA, Vulkan, DX12, Metal y CPU.

## Casos de uso

- Asistente de programación web en IDE o CLI: genera componentes React, funciones JavaScript y código Python con un prompt de sistema específico, usando `--no-think` para respuestas directas y rápido time-to-first-token (0,6 s con prompt de 4096 tokens en RTX A5000).
- Autocompletado y generación de código en pipelines de CI/CD: al correr como servidor compatible con OpenAI, puede integrarse en herramientas que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Agentes con tool calling: el modelo emite llamadas a herramientas en XML que el servidor traduce a `tool_calls`, permitiendo orquestar APIs externas (clima, búsqueda, bases de datos) en flujos multi-paso.
- Despliegue en hardware heterogéneo de laboratorio: al funcionar sobre Vulkan/DX12 en GPUs AMD e Intel y Metal en Apple Silicon, sirve para prototipar en estaciones de trabajo sin GPU NVIDIA.
- Procesamiento de documentación técnica larga: con 131 072 tokens de contexto puede analizar repos completos o manuales extensos en una sola pasada (requiere elevar `CMF_MAX_SEQ` y disponer de RAM/VRAM para el KV cache, ~86 KB por token).
- Asistencia en matemáticas y explicaciones didácticas: el modo thinking permite cadenas de razonamiento antes de dar la respuesta final, útil en entornos educativos.
- Inferencia en portátiles sin GPU dedicada: la variante `q4tp` corre en CPU a 30,5 tok/s en un MacBook Air M4 con 10 núcleos, suficiente para chat interactivo.

## Benchmarks y rendimiento

Calidad (perplejidad sobre 12 ventanas de 512 tokens):

| Fichero | Cuantizacion | Tamano | WikiText-2 ppl | Python ppl |
|---|---|---:|---:|---:|
| bf16 (referencia) | bf16 | no disponible | 18,45 | no disponible |
| `q8_2f` | 8-bit | 2,54 GB | 18,46 | 5,86 |
| `q4tp` | 4-bit GPTQ | 1,77 GB | 19,40 | 6,15 |

Rendimiento de inferencia (`cortiq bench --core`, un stream):

| Hardware | Backend | Fichero | Decode (tok/s) | Primer token, prompt 2k | Decode a 2k | Primer token, prompt 8k | Decode a 8k | Memoria pico |
|---|---|---|---:|---:|---:|---:|---:|---|
| RTX 5090 (32 GB) | Vulkan | `q8_2f` | 190 | 1,3 s | 151 | 7,4 s | 109 | 3,0–4,3 GB VRAM |
| RTX 5090 (32 GB) | Vulkan | `q4tp` | 187 | 1,0 s | 156 | 6,3 s | 124 | 1,9–3,2 GB VRAM |
| MacBook Air M4 (24 GB) | Metal | `q8_2f` | 26,3 | 5,5 s | 24,0 | 33,7 s | 15,5 | 4,1–5,3 GB RAM |
| MacBook Air M4 (24 GB) | Metal | `q4tp` | 42,8 | 4,5 s | 35,9 | 31,4 s | 20,9 | 2,5–3,9 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 núcleos | `q8_2f` | 25,2 | 9,5 s | 25,6 | — | — | 3,1 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 núcleos | `q4tp` | 30,5 | 9,9 s | 25,5 | — | — | 2,3 GB RAM |

RTX A5000 (24 GB), CUDA, cortiq 0.8.96:

| Fichero | Decode (tok/s) | Prompt 4096 tokens | Primer token | Decode posterior |
|---|---:|---:|---:|---:|
| `q4tp` | 174,8–176,2 | 6869 tok/s | 0,59 s | 166,9 |
| `q8_2f` | 147,9–150,2 | 6665 tok/s | 0,61 s | 137,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Como prueba funcional, en 16 peticiones de código con respuesta greedy y dos muestreadas, ninguno de los ficheros produjo una llamada a herramienta inventada.

## Requisitos de hardware

- VRAM/RAM para inferencia: 1,9–3,2 GB con `q4tp` y 3,0–4,3 GB con `q8_2f` en RTX 5090 con prompts de 2k–8k; 2,3–3,9 GB (`q4tp`) y 3,1–5,3 GB (`q8_2f`) en MacBook Air M4.
- KV cache: ~86 KB por token; 32 768 tokens por defecto (~2,8 GB); el contexto completo de 131 072 tokens requiere aproximadamente 11 GB adicionales.
- GPUs recomendadas: RTX 5090, RTX A5000 (CUDA o Vulkan); funciona también en GPUs AMD e Intel vía Vulkan/DX12 y en Apple Silicon vía Metal.
- Cabe en GPU consumer: sí, con holgura; 3–4 GB de VRAM para `q8_2f` permiten ejecución incluso en tarjetas de gama media.
- Opciones de despliegue: cortiq (CLI, servidor compatible con OpenAI, binarios precompilados para Linux, macOS y Windows; instalación vía `cargo install cortiq-cli`, con feature `cuda` para CUDA). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: primer token en 0,59–0,61 s con prompt de 4096 tokens en RTX A5000; 190 tok/s de decode en RTX 5090 con `q8_2f`; 26–43 tok/s en MacBook Air M4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CherryPit-1.2-2B (este) | 2,5 B | 131 072 | Apache 2.0 | CMF via cortiq | Especializado en código web, tool calling, thinking mode |
| MiniCPM5-2B (modelo base) | ~2 B | no disponible | no disponible | safetensors | Modelo general del que deriva; sin el fine-tune de código |
| CherryPit-1.2-2B Turbo | 2,5 B | 131 072 (ampliado) | Apache 2.0 | CMF via cortiq | Variante del mismo autor orientada a prompts largos con poca memoria |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, Qwen2.5-Coder-1.5B o CodeLlama-7B) en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Idiomas: solo inglés, ruso y chino; el castellano no está entre los idiomas declarados, por lo que la calidad en español no está garantizada.
- Riesgo de alucinación: aunque en la prueba de 16 peticiones no se observaron tool calls inventados, no hay benchmarks de fidelidad factual publicados.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Contexto: el KV cache por defecto es de 32 768 tokens; usar los 131 072 completos exige `CMF_MAX_SEQ=131072` y ~11 GB adicionales de memoria para el cache.
- Comportamiento del template: con `--no-think` algunas respuestas siguen abriendo con la frase de identidad del modelo ("CherryPit 1.2"), igual que los pesos bf16.
- Parámetros de muestreo: los valores recomendados (temperature 1.0, top-p 0.95) difieren de los defaults del CLI (temperature 0.7, top-p 0.9, top-k 40, min-p 0.05, rep-penalty 1.1, 256 tokens máximos), que pueden truncar respuestas de razonamiento.
- Dependencia de ecosistema: requiere cortiq 0.8.63 o superior; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración con stacks existentes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base MiniCPM5-2B, no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/CherryPit-1.2-2B-cmf
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Variante Turbo: https://huggingface.co/infosave/CherryPit-1.2-2B-Turbo-cmf
- Repositorio CMF / cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
