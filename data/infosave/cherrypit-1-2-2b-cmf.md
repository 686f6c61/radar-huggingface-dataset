# infosave/CherryPit-1.2-2B-cmf

## Resumen

CherryPit-1.2-2B-cmf es la distribucion cuantizada del modelo CherryPit-1.2-2B de DRUPEs, un asistente de programacion de aproximadamente 2.500 millones de parametros afinado a partir de MiniCPM5-2B. El modelo base esta orientado a desarrollo web, Python, matematicas y tool calling, con 42 capas, una ventana de contexto de 131.072 tokens y un modo de razonamiento (thinking mode) que puede activarse o desactivarse por peticion. Esta version concreta la publica el usuario infosave empaquetada en formato CMF (Cortiq Model Format), pensado para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning.

La relevancia de esta ficha esta en el empaquetado, no en el modelo en si: CMF permite ejecutar el modelo en GPUs NVIDIA, AMD e Intel mediante Vulkan o DX12, en Apple Silicon mediante Metal y tambien en CPU, sin necesidad de instalar CUDA, PyTorch ni toolchains de Python. Se ofrecen dos ficheros, uno de 8 bits (2,54 GB) y otro de 4 bits GPTQ (1,77 GB), ambos con licencia Apache 2.0 y soporte de ingles, ruso y chino.

El modelo cubre un nicho concreto: asistentes de codigo ligeros que quepan en portatiles y equipos de gama consumer, con capacidad de tool calling en formato XML y un servidor compatible con la API de OpenAI incluido en el propio motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (42 capas), fine-tune de MiniCPM5-2B |
| Parametros totales | ~2.500 millones (2,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (KV cache por defecto de 32.768 tokens) |
| Tipos de cuantizacion | 8 bits (`q8_2f`) y 4 bits GPTQ (`q4tp`, con atencion, embeddings y head en 8 bits) |
| Idiomas soportados | ingles, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 42 capas derivado de MiniCPM5-2B y afinado por DRUPEs para tareas de programacion, desarrollo web, matematicas y tool calling. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos deben consultarse en la model card del modelo base (DRUPEs/CherryPit-1.2-2B).

La innovacion de esta publicacion es el formato de empaquetado. Los pesos se cuantizan con GPTQ sobre 4.096 tokens de WikiText-2, codigo y conversaciones renderizadas con la propia plantilla del modelo. El fichero de 8 bits conserva practicamente la calidad del modelo en bf16 (perplejidad de 18,46 frente a 18,45 en WikiText-2), mientras que el de 4 bits sube a 19,40. El motor `cortiq` implementa la plantilla de chat de forma nativa y el autor verifico que los tokens generados coinciden con los de `transformers` en siete conversaciones de prueba (system prompt, dos turnos, herramientas, thinking activado y desactivado, y texto no ingles). El modelo incorpora un modo de razonamiento explicito que puede desactivarse con `--no-think` o con `"enable_thinking": false` en la API.

## Capacidades

- Generacion de codigo para desarrollo web (componentes React, JavaScript, Python) y tareas de programacion general.
- Razonamiento matematico y resolucion de problemas paso a paso mediante el modo thinking.
- Tool calling / function calling en formato XML (`<function name="..."><param name="...">...</function>`), devuelto por el servidor como `message.tool_calls` con `finish_reason: "tool_calls"`.
- Modo de razonamiento conmutable: el modelo decide si razonar primero o el usuario puede forzar respuesta directa.
- Soporte multilingue en ingles, ruso y chino.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) con dashboard web integrado.
- Ejecucion multiplataforma via Vulkan, DX12, Metal y CPU, sin dependencias de Python.
- Generacion determinista con decodificacion greedy para casos que requieran reproducibilidad.

## Casos de uso

- Asistente de programacion en local para desarrolladores: el modelo genera componentes y funciones (por ejemplo, un componente React con buscador y lista) en un portatil con GPU consumer, sin enviar codigo a servicios externos.
- Automatizacion de tareas de desarrollo web: generacion de snippets de JavaScript, Python y HTML dentro de editores o scripts de CLI, con respuesta directa mediante `--no-think` para minimizar latencia.
- Agente con tool calling en pipelines internos: el modelo emite llamadas a funciones en XML que el servidor OpenAI-compatible traduce a `tool_calls`, lo que permite integrarlo en orquestadores de agentes existentes sin adaptadores propios.
- Servicio de inferencia autoalojado: `cortiq serve` expone endpoints compatibles con OpenAI en el puerto 8080, de modo que aplicaciones ya escritas contra esa API pueden apuntar al modelo cambiando solo la URL base.
- Procesamiento de documentos largos en ingles, ruso o chino: con `CMF_MAX_SEQ=131072` el modelo puede analizar ficheros extensos, aunque el coste de KV cache (11,3 GB para el contexto completo) limita el escenario a equipos con memoria suficiente.
- Despliegue en hardware heterogeneo: al soportar Vulkan, DX12 y Metal, el mismo fichero CMF puede ejecutarse en estaciones con GPU NVIDIA, AMD o Intel y en Macs con Apple Silicon, lo que simplifica la distribucion en equipos mixtos.
- Prototipado rapido sin entorno Python: al instalarse con `cargo install cortiq-cli`, un equipo sin PyTorch ni CUDA puede poner en marcha el modelo en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos publicados son de perplejidad y de rendimiento del motor de inferencia.

| Metrica | q8_2f (8 bits) | q4tp (4 bits GPTQ) | bf16 (referencia) |
|---|---:|---:|---:|
| Perplejidad WikiText-2 | 18,46 | 19,40 | 18,45 |
| Perplejidad Python (477 KB de `transformers`) | 5,86 | 6,15 | no disponible |
| Tamano del fichero | 2,54 GB | 1,77 GB | no disponible |

| Hardware | Backend | Fichero | Decode (tok/s) | Primer token, prompt 2k | Decode a 2k | Primer token, prompt 8k | Decode a 8k | Memoria pico |
|---|---|---|---:|---:|---:|---:|---:|---:|
| RTX 5090 (32 GB) | Vulkan | q8_2f | 190 | 1,3 s | 151 | 7,4 s | 109 | 3,0-4,3 GB VRAM |
| RTX 5090 (32 GB) | Vulkan | q4tp | 187 | 1,0 s | 156 | 6,3 s | 124 | 1,9-3,2 GB VRAM |
| MacBook Air M4 (24 GB) | Metal | q8_2f | 26,3 | 5,5 s | 24,0 | 33,7 s | 15,5 | 4,1-5,3 GB RAM |
| MacBook Air M4 (24 GB) | Metal | q4tp | 42,8 | 4,5 s | 35,9 | 31,4 s | 20,9 | 2,5-3,9 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 nucleos | q8_2f | 25,2 | 9,5 s | 25,6 | no disponible | no disponible | 3,1 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 nucleos | q4tp | 30,5 | 9,9 s | 25,5 | no disponible | no disponible | 2,3 GB RAM |

En 16 peticiones de codigo (greedy y dos respuestas muestreadas por peticion), ninguno de los dos ficheros genero una llamada a herramienta inventada.

## Requisitos de hardware

- VRAM estimada: entre 1,9 y 4,3 GB en GPU segun fichero y longitud de prompt; el KV cache por defecto ocupa unos 86 KB por token (2,8 GB para 32.768 tokens) y 11,3 GB para el contexto completo de 131.072 tokens.
- GPU recomendadas: cualquier GPU con Vulkan o DX12 (NVIDIA, AMD, Intel); en Apple Silicon se usa Metal. Una RTX 5090 alcanza 190 tok/s de decodificacion con el fichero de 8 bits.
- Cabe en GPU consumer: si, con margen amplio; incluso el fichero de 8 bits ocupa menos de 4,3 GB de VRAM en prompts de 2k-8k.
- Opciones de despliegue: `cortiq` (CLI y servidor OpenAI-compatible) es la unica via soportada por el formato CMF; no hay versiones GGUF para llama.cpp, Ollama ni TGI en este repositorio. Existe una variante Turbo orientada a prompts largos con poca memoria.
- Latencia y throughput: en MacBook Air M4 con Metal, 26,3 tok/s (q8_2f) y 42,8 tok/s (q4tp); en CPU de 10 nucleos, 25,2 y 30,5 tok/s respectivamente. El primer token tarda entre 1,0 y 1,3 s en RTX 5090 con prompt de 2k y entre 4,5 y 5,5 s en M4.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks comparativos frente a otros modelos, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---:|---|---|---|
| CherryPit-1.2-2B-cmf | ~2,5B | 131.072 | Apache 2.0 | CMF / cortiq | Foco en codigo web, tool calling, thinking mode |
| CherryPit-1.2-2B (base) | ~2,5B | 131.072 | Apache 2.0 | safetensors / transformers | Modelo original de DRUPEs |
| CherryPit-1.2-2B Turbo-cmf | ~2,5B | no disponible | Apache 2.0 | CMF / cortiq | Variante optimizada para prompts largos con poca memoria |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | Sin datos de rendimiento comparables en la informacion disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles, ruso y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion en llamadas a herramientas: aunque el autor verifico 16 peticiones sin tool calls inventadas, no es una garantia para produccion y conviene validar los `tool_calls` antes de ejecutarlos.
- Con `--no-think`, algunas respuestas comienzan con la frase de identidad del modelo ("CherryPit 1.2"), un comportamiento heredado de los pesos bf16.
- El contexto completo de 131.072 tokens exige 11,3 GB de KV cache y ralentiza la decodificacion; el valor por defecto es de 32.768 tokens.
- El formato CMF solo se ejecuta con `cortiq` (version 0.8.63 o superior); no hay soporte en llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad frente a GGUF.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base (DRUPEs/CherryPit-1.2-2B) deben verificarse por separado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se han publicado benchmarks estandar de calidad (MMLU, HumanEval, GSM8K) que permitan comparar el modelo con alternativas de su tamano.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/infosave/CherryPit-1.2-2B-cmf
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Variante Turbo: https://huggingface.co/infosave/CherryPit-1.2-2B-Turbo-cmf
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Pagina del formato CMF en Hugging Face: https://huggingface.co/infosave/cmf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
