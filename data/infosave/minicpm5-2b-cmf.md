# infosave/MiniCPM5-2B-cmf

## Resumen

MiniCPM5-2B-cmf es un paquete cuantizado del modelo MiniCPM5-2B de OpenBMB, publicado por el usuario infosave. El modelo original es un transformer de 2.500 millones de parametros, 42 capas y 131.072 tokens de contexto, con modo de razonamiento (thinking) y soporte de tool calling, entrenado para ingles y chino. Esta version no modifica los pesos del modelo: los reempaqueta en archivos CMF (un formato de un solo archivo) para ejecutarse con cortiq, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML.

La relevancia practica de esta ficha esta en el empaquetado y el motor, no en el modelo en si. cortiq permite ejecutar el modelo en GPU NVIDIA (CUDA o Vulkan), GPU AMD e Intel (Vulkan/DX12), Apple Silicon (Metal) y CPU, con dos cuantizaciones listas para usar: una de 4 bits GPTQ con embeddings y cabeza de salida en 8 bits (1,57 GB) y una de 8 bits practicamente sin perdida (2,53 GB). El rendimiento medido en una RTX A5000 con CUDA es de aproximadamente 196-202 tok/s en decodificacion con q4tp y 145-146 tok/s con q8_2f.

El modelo resuelve el caso de uso de desplegar un LLM con razonamiento y tool calling en hardware de gama media o consumer sin cadena de herramientas Python. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita el uso comercial. La informacion disponible sobre el modelo base es limitada: no se detallan los datos de entrenamiento ni se publican resultados de benchmarks del modelo original en la model card de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5-2B); 42 capas |
| Parametros totales | 2.500 millones (2.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (KV cache por defecto 32.768, ampliable con `CMF_MAX_SEQ`) |
| Tipos de cuantizacion | q4tp (4 bits GPTQ, embeddings y cabeza de salida en 8 bits) y q8_2f (8 bits) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propio de cortiq, archivo unico); pesos derivados de checkpoint bf16 |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer de 42 capas con 2.500 millones de parametros, entrenado por OpenBMB para ingles y chino. Incorpora modo de razonamiento explicito (bloque `<think>`) y soporte de tool calling mediante un formato XML propio. La model card de este repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion tecnica de este paquete es el formato CMF y el motor cortiq: inferencia sin Python ni framework de ML, con backend CUDA, Vulkan, DX12, Metal y CPU, y un servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`). La cuantizacion q4tp se genero con GPTQ sobre 2.000 tokens del split de entrenamiento de wikitext-2; la q8_2f es una cuantizacion de 8 bits. La plantilla de chat embebida difiere de la original solo en escribir `tojson` sin `ensure_ascii=False` (salida equivalente) y en marcar los cuatro tokens de markup de herramientas como texto ordinario.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento en modo thinking: el modelo produce un bloque `<think>` antes de la respuesta; se puede desactivar con `--no-think` o `"enable_thinking": false`.
- Tool calling / function calling en formato OpenAI: el modelo emite llamadas en XML (`<function name="..."><param name="...">...</param></function>`) que el servidor convierte en `message.tool_calls` con `finish_reason: "tool_calls"`.
- Soporte de conversaciones multi-turno con contexto largo (hasta 131.072 tokens).
- Decodificacion greedy determinista (`--greedy` o `temperature: 0`).
- Servidor HTTP con dashboard web integrado en el mismo puerto.
- No se documentan capacidades de vision, audio ni otros modos multimodales en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y explicar codigo en ingles o chino dentro de un flujo de trabajo sin dependencias Python, ejecutandose en una GPU consumer o en Apple Silicon mediante Metal.
- Agente con tool calling: integrado en un bucle de agente que envia `tools` en formato OpenAI y procesa `tool_calls`; la model card reporta 6 de 6 conversaciones de prueba correctas con ambos archivos de cuantizacion, en Vulkan y Apple Silicon.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto de hasta 131.072 tokens permiten mantener historiales largos; el modo thinking se puede desactivar para reducir latencia en respuestas directas.
- Procesamiento de documentos largos en chino o ingles: con `CMF_MAX_SEQ=131072` el modelo puede ingerir documentos extensos, a costa de mayor uso de KV cache (unos 86 KB por token, 11,3 GB a contexto completo).
- Despliegue en hardware heterogeneo: el mismo archivo CMF funciona en NVIDIA (CUDA/Vulkan), AMD e Intel (Vulkan/DX12), Apple Silicon (Metal) y CPU, util para entornos con GPUs mixtas.
- Servicio compatible con OpenAI para prototipado: `cortiq serve` expone endpoints compatibles que permiten sustituir un backend remoto por inferencia local en aplicaciones existentes.
- Razonamiento con presupuesto controlado: el modo thinking con `--max-tokens` ajustable permite tareas de razonamiento paso a paso cuando la latencia no es critica.

## Benchmarks y rendimiento

Perplejidad en wikitext-2 (doce ventanas de 512 tokens del split de test; el modelo sin cuantizar obtiene 17,81 en las mismas ventanas):

| Archivo | Cuantizacion | Tamano | Perplejidad wikitext-2 |
|---|---|---:|---:|
| `MiniCPM5-2B-q4tp.cmf` | 4 bits GPTQ (embeddings y cabeza 8 bits) | 1,57 GB | 18,91 |
| `MiniCPM5-2B-q8_2f.cmf` | 8 bits | 2,53 GB | 17,83 |

Rendimiento de inferencia (una sola secuencia, mediana de tres ejecuciones):

| Hardware | Backend | Archivo | `cortiq bench --core` (tok/s) | Chat, 300 tokens (tok/s) | Prompt de 2k tokens, tiempo al primer token |
|---|---|---|---:|---:|---:|
| RTX 3090 (24 GB) | Vulkan | `q4tp` | 157,7 | 112,9 | 5,8 s |
| RTX 3090 (24 GB) | Vulkan | `q8_2f` | 134,9 | 98,2 | 28,4 s |

RTX A5000 (24 GB), CUDA, cortiq 0.8.96:

| Archivo | Decodificacion (tok/s) | Prompt de 4096 tokens | Decodificacion posterior (tok/s) |
|---|---:|---:|---:|
| `q4tp` | 195,8-202,3 | 6798 tok/s (primer token 0,60 s) | 184,6 |
| `q8_2f` | 144,8-146,1 | 8574 tok/s (primer token 0,47 s) | 137,5 |

La decodificacion se ralentiza al crecer el contexto: aproximadamente 18 tok/s a 16k tokens con `q4tp` en la RTX 3090. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 1,57 GB (`q4tp`) o 2,53 GB (`q8_2f`); a ello se suma la KV cache, de unos 86 KB por token (2,8 GB a 32k tokens, 11,3 GB a 131k).
- GPU recomendadas: RTX 3090 (24 GB) y RTX A5000 (24 GB) tienen mediciones publicadas; el modelo cabe holgadamente en GPUs de 8 GB o mas para contextos moderados.
- Cabe en GPU consumer: si, con `q4tp` y contexto por defecto (32k) el uso total ronda los 4,4 GB de VRAM; con contexto completo, unos 12,9 GB.
- Apple Silicon: funciona en GPU mediante Metal sin configuracion adicional.
- AMD e Intel: soporte via Vulkan/DX12; en Linux puede requerir paquetes `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y, en maquinas headless, `XDG_RUNTIME_DIR=/tmp`.
- Opciones de despliegue: cortiq (CLI y servidor compatible con OpenAI), instalable con `cargo install cortiq-cli` (cortiq 0.7.6 o superior; build CUDA con `--features cuda`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: 200 tok/s de decodificacion con `q4tp` en RTX A5000 (CUDA); 158 tok/s en RTX 3090 (Vulkan); primer token en 0,6 s con prompt de 4096 tokens en A5000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---:|---:|---|---|---|
| MiniCPM5-2B-cmf (esta ficha) | 2,5B | 131.072 | Apache 2.0 | CMF / cortiq | Cuantizaciones q4tp y q8_2f; tool calling y thinking |
| MiniCPM5-2B (openbmb) | 2,5B | 131.072 | Apache 2.0 | safetensors / bf16 | Modelo base sin cuantizar; requiere stack Python |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada; la comparativa se limita al modelo base y a la ausencia de datos verificables de terceros.

## Limitaciones y advertencias

- Solo soporta ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a modelos de este tamano; la model card no publica evaluaciones de fidelidad.
- El modo thinking consume tokens adicionales; sin `--no-think` hay que aumentar `--max-tokens` (por defecto 256) para obtener la respuesta final.
- La decodificacion se degrada con contextos largos (unos 18 tok/s a 16k tokens con `q4tp` en RTX 3090); contextos de 131k requieren 11,3 GB adicionales de KV cache.
- El formato CMF y el motor cortiq son propietarios de este empaquetado: no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- La cuantizacion q4tp introduce una degradacion de perplejidad de aproximadamente el 6 % (18,91 frente a 17,81 del modelo sin cuantizar).
- La model card no documenta sesgos conocidos, composicion del dataset ni evaluaciones de seguridad.
- Licencia Apache 2.0 en el modelo base y en el empaquetado, lo que permite uso comercial; conviene verificar los terminos del motor cortiq por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/MiniCPM5-2B-cmf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
