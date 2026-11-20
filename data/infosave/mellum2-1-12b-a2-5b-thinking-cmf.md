# infosave/Mellum2.1-12B-A2.5B-Thinking-CMF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-CMF es una cuantización del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, un modelo de mezcla de expertos (MoE) orientado a código y razonamiento. El modelo original, desarrollado por JetBrains, cuenta con 12,15 mil millones de parámetros totales y 2,5 mil millones activos por token, distribuidos en 64 expertos con enrutamiento top-8. Esta versión, publicada por infosave, empaqueta los pesos en el formato CMF (Cortiq Model Format) para su uso con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de aprendizaje automático.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 12B con contexto de 131 072 tokens en hardware de consumo, incluyendo GPUs con 8 GB de VRAM mediante la cuantización de 4 bits (6,88 GB). El motor soporta GPUs NVIDIA, AMD e Intel a través de Vulkan/DX12, Apple Silicon mediante Metal y CPU pura, lo que amplía enormemente las opciones de despliegue frente a soluciones basadas en Python.

La cuantización preserva una calidad cercana al modelo sin cuantizar: la perplejidad en código Python es de 3,242 con 4 bits y 3,146 con 8 bits, frente a 3,182 del modelo original, con una concordancia de predicción top-1 del 93,4 % y 98,1 % respectivamente. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (64 expertos, enrutamiento top-8; 21 capas de atención de ventana deslizante y 7 de atención completa) |
| Parametros totales | 12,15 mil millones |
| Parametros activos | 2,5 mil millones por token |
| Longitud de contexto | 131 072 tokens (KV cache por defecto de 32 768, configurable con `CMF_MAX_SEQ`) |
| Tipos de cuantizacion | 4 bits (`q4tp`, 6,88 GB) y 8 bits (`q8_2f`, 12,22 GB); atención, embeddings y cabeza de salida en 8 bits; router y normas en 16 bits |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 64 expertos y enrutamiento top-8, lo que activa 2,5 mil millones de parámetros por token sobre un total de 12,15 mil millones. La pila de capas combina 21 capas con atención de ventana deslizante y 7 capas con atención completa, una configuración que reduce el coste computacional en secuencias largas manteniendo acceso global en puntos estratégicos. El contexto máximo es de 131 072 tokens.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está etiquetado como orientado a código, razonamiento y tool calling, e incluye un modo de pensamiento (`<think>`) que genera un bloque de razonamiento antes de la respuesta. La cuantización CMF mantiene el router y las normas en 16 bits para preservar la calidad del enrutamiento, mientras que atención, embeddings y cabeza de salida se almacenan en 8 bits en ambos ficheros.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito: el modelo produce un bloque `<think>…</think>` antes de la respuesta final, desactivable con `--no-think` o `"enable_thinking": false`.
- Generación de código: el modelo está especializado en código, con perplejidad de 3,242 sobre código de la biblioteca estándar de Python (cuantización de 4 bits).
- Tool calling / function calling: acepta herramientas en formato OpenAI y responde con `<tool_call>{"name": …, "arguments": …}</tool_call>`, que el servidor devuelve como `message.tool_calls` con `finish_reason: "tool_calls"`.
- Razonamiento multi-paso: el modo de pensamiento permite cadenas de razonamiento antes de la respuesta.
- Soporte de contexto largo: hasta 131 072 tokens, con caché KV configurable.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se mencionan capacidades de visión ni audio.

## Casos de uso

- Asistencia de programación en local: el modelo puede generar funciones y explicar código en un portátil con GPU de 8 GB, gracias a la cuantización `q4tp` de 6,88 GB y al motor `cortiq` sin dependencias de Python.
- Autocompletado y revisión de código en IDE: con 131 072 tokens de contexto, puede procesar ficheros completos o varios módulos de un repositorio en una sola pasada, manteniendo coherencia entre definiciones y usos.
- Agentes de código con tool calling: el soporte nativo de function calling en formato OpenAI permite integrar el modelo en pipelines que invocan compiladores, linters o ejecutores de tests, con el servidor compatible devolviendo `tool_calls` estructurados.
- Servicio interno de chat para desarrolladores: el servidor OpenAI-compatible (`/v1/chat/completions`) permite desplegar el modelo en una intranet con `--host 127.0.0.1` y consumirlo desde herramientas existentes sin adaptadores.
- Razonamiento sobre documentación técnica: el modo de pensamiento y el contexto largo permiten responder preguntas que requieren cruzar información de manuales, especificaciones y ejemplos de código extensos.
- Despliegue en hardware heterogéneo: al soportar Vulkan, Metal y CPU, puede ejecutarse en estaciones con GPUs AMD o Intel, Mac mini M4 o servidores sin GPU, lo que facilita entornos de desarrollo diversos.
- Procesamiento por lotes en CPU: el fichero `q8_2f` con `CMF_GPU=0` permite ejecutar tareas de generación de código en servidores sin GPU, con una calidad cercana al modelo sin cuantizar.

## Benchmarks y rendimiento

Calidad de la cuantización frente al modelo sin cuantizar (perplejidad sobre 2048 tokens de código de la biblioteca estándar de Python y de wikitext-2 test, y concordancia top-1):

| Fichero | Expertos | Tamano | Perplejidad código | Perplejidad wiki | Concordancia top-1 |
|---|---|---:|---:|---:|---:|
| `q4tp` | 4 bits | 6,88 GB | 3,242 | 7,407 | 93,4 % |
| `q8_2f` | 8 bits | 12,22 GB | 3,146 | 7,180 | 98,1 % |
| Sin cuantizar | 16 bits | no disponible | 3,182 | 7,120 | referencia |

Rendimiento de inferencia con `cortiq bench --core --ignore-eos`, un flujo, mediana de tres ejecuciones, cortiq 0.8.15:

| Hardware | Backend | Fichero | Decodificación (tok/s) | Decodificación a 3-4k tokens | Prompt de 3-4k tokens (tok/s) | Tiempo al primer token |
|---|---|---|---:|---:|---:|---:|
| RTX A5000 (24 GB) | CUDA | `q4tp` | 167 | 148 | 3746 | 1,1 s |
| RTX 3090 (24 GB) | Vulkan | `q4tp` | 150 | 129 | 382 | 10,5 s |
| RTX 3090 (24 GB) | Vulkan | `q8_2f` | 140 | 132 | 547 | 7,3 s |
| Mac mini M4 (24 GB) | Metal | `q4tp` | 46,8 | 40,9 | 413 | 7,3 s |
| Mac mini M4 (24 GB) | Metal | `q8_2f` | 35,6 | 31,2 | 318 | 9,8 s |
| Mac mini M4 (24 GB) | CPU, 10 núcleos | `q4tp` | 34,9 | 17,3 | 110 | 31,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB de memoria unificada o VRAM para el fichero `q4tp`; 16 GB o más para el fichero `q8_2f`.
- GPUs recomendadas: RTX A5000 (24 GB) con backend CUDA alcanza 167 tok/s de decodificación; RTX 3090 (24 GB) con Vulkan alcanza 150 tok/s; Mac mini M4 (24 GB) con Metal alcanza 46,8 tok/s.
- Cabe en GPU de consumo: sí, el fichero `q4tp` está diseñado para GPUs con 8 GB de VRAM.
- Opciones de despliegue: `cortiq` (motor Rust, instalable con `cargo install cortiq-cli` o binarios precompilados para Linux, macOS y Windows), con backend CUDA (`--features cuda`), Vulkan/DX12, Metal o CPU. Incluye servidor compatible con OpenAI y dashboard web.
- Latencia y throughput: tiempo al primer token de 1,1 s en RTX A5000 con CUDA y prompt de 4096 tokens; 7,3 s en Mac mini M4 con Metal y prompt de 3000 tokens. El procesamiento de prompt en RTX A5000 con CUDA alcanza 3746 tok/s; en RTX 3090 con Vulkan, 382-547 tok/s.
- En Vulkan, los kernels de decodificación de `q8_2f` requieren subgrupos de 32 lanes (NVIDIA); otras GPUs ejecutan el prompt en GPU y la decodificación operación por operación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-CMF | 12,15 B | 2,5 B | 131 072 | Apache 2.0 | CMF / cortiq |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking | 12,15 B | 2,5 B | 131 072 | no disponible en la información | no disponible en la información |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de otros modelos comparables, por lo que no es posible establecer una comparación cuantitativa de benchmarks.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Alucinación: no se documentan evaluaciones específicas de tasa de alucinación; como modelo generativo de código, puede producir APIs o funciones inexistentes.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Contexto: aunque el modelo soporta 131 072 tokens, la caché KV por defecto es de 32 768; ampliarla requiere configurar `CMF_MAX_SEQ` y consume más memoria.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, no detallada en la información disponible.
- Dependencia del motor: los ficheros CMF solo se ejecutan con `cortiq` (versión 0.8.15 o superior); no son compatibles con llama.cpp, vLLM, TGI u Ollama.
- Tool calling: la validación reportada es de 6 de 6 conversaciones de prueba en Metal con `q4tp`; no hay datos de robustez a mayor escala.
- Modo de pensamiento: sin `--no-think`, el modelo genera un bloque de razonamiento que consume tokens; el límite por defecto de 256 tokens nuevos puede truncar la respuesta si no se aumenta `--max-tokens`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Mellum2.1-12B-A2.5B-Thinking-CMF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
