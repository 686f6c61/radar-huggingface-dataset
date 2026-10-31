# infosave/Apex-35B-V1.0-cmf

## Resumen

Apex-35B-V1.0-cmf es una versión cuantizada, empaquetada en archivos CMF, del modelo Apex-35B-V1.0 de Apex Intelligence, un modelo agéntico de investigación, programación y razonamiento derivado de Qwen3.6-35B-A3B. El modelo base es una arquitectura híbrida mixture-of-experts de 35,5B parámetros (~3B activos por token) con 256 expertos enrutados (top-8) más un experto compartido, y combina 30 capas Gated DeltaNet con 10 capas de atención completa, con una ventana de contexto de 262.144 tokens.

Esta variante, publicada por el usuario infosave, no es un entrenamiento nuevo sino un reempaquetado: los pesos se convierten a formato CMF para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML, que funciona sobre GPUs NVIDIA, AMD e Intel vía Vulkan/DX12, Apple silicon vía Metal y CPU. Es relevante porque permite desplegar un modelo MoE agéntico de 35B en una GPU de consumo de 24 GB con solo 4 bits de precisión, sin depender del ecosistema habitual de PyTorch, CUDA o llama.cpp. La licencia del modelo base y de esta cuantización es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 256 expertos enrutados top-8 + experto compartido; 30 capas Gated DeltaNet + 10 capas de atención completa; capa MTP incluida |
| Parametros totales | 35,5B (modelo base) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit (q4tp), 4-bit GPTQ (q4tp-v2), 8-bit (q8_2f); atención, proyecciones DeltaNet, embeddings y cabeza de salida a 8 bits en todos los archivos; normas y router a 16 bits |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (archivos únicos para el motor cortiq); el original es safetensors PyTorch bf16 |

## Arquitectura y entrenamiento

El modelo base, Apex-35B-V1.0, parte de Qwen3.6-35B-A3B, un MoE de 35,5B parámetros con ~3B activos por token. Su rasgo más distintivo es la arquitectura híbrida: 30 capas Gated DeltaNet (una variante de redes de estado con actualización controlada, más eficientes que la atención estándar para secuencias largas) combinadas con 10 capas de atención completa, lo que permite sostener el contexto de 262.144 tokens con coste razonable. Incluye además una capa MTP (multi-token prediction) para decodificación especulativa y un modo de "thinking" dinámico, en el que el propio modelo decide en cada turno si razonar y durante cuántos tokens.

El fine-tune agéntico del modelo base no está documentado en la model card (no se detallan tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO). En cuanto a la cuantización, el archivo recomendado `q4tp-v2` aplica GPTQ a todos los expertos (enrutados y compartidos) usando 262.144 tokens de calibración procedentes de wikitext-2, UltraChat renderizado con la plantilla del modelo y código fuente en Rust. La model card reporta que `q4tp-v2` se mantiene más cerca del checkpoint bf16 en texto conversacional (media |ΔNLL| de 0,138 frente a 0,160 de `q4tp`) y en texto wiki, y a la par en código. Los archivos CMF incluyen el modelo de texto y su capa MTP, pero no la torre de visión del checkpoint original.

## Capacidades

- Generación de texto y razonamiento con modo de thinking dinámico: el modelo decide por turno si razona y cuánto; el razonamiento consume del presupuesto de `max_tokens`, y se puede desactivar con `--no-think` o `"enable_thinking": false`.
- Tool calling en formato OpenAI: acepta `tools` en la petición y responde con llamadas estructuradas que el servidor devuelve como `message.tool_calls` con `finish_reason: "tool_calls"`.
- Orientación agéntica: el fine-tune está especializado en investigación, código y razonamiento multi-paso.
- Generación de código (la model card incluye un ejemplo de función Python y mide perplexity sobre código Python de la librería estándar).
- Contexto muy largo (262.144 tokens) gracias a las capas Gated DeltaNet.
- Multilingüe: inglés, ruso y chino.
- Decodificación especulativa vía capa MTP incluida en los archivos.
- Muestreo recomendado embebido: temperature 1,0, top-p 0,95, top-k 20; salida determinista disponible con `--greedy`.
- No incluye capacidades de visión: la torre de visión del checkpoint original no está empaquetada en los archivos CMF.

## Casos de uso

- Atención al cliente y asistentes conversacionales autoalojados: el servidor compatible con OpenAI (`/v1/chat/completions`, con y sin streaming) permite integrarlo en aplicaciones existentes, y el contexto de 262.144 tokens soporta conversaciones multi-turno muy largas e historiales extensos.
- Agentes con herramientas: el soporte nativo de tool calling en formato OpenAI lo hace adecuado para pipelines de agentes que consultan APIs, bases de datos o buscadores y encadenan resultados en varios pasos.
- Asistente de programación local: puede ejecutarse íntegramente en una GPU de 24 GB sin dependencias de Python, útil para entornos con código sensible que no puede salir de la red local; genera y explica código (el ejemplo de la card es una función Python de mezcla de listas ordenadas).
- Investigación y síntesis de documentos largos: la ventana de 262k tokens permite analizar repositorios de código, contratos o corpus de investigación completos en una sola pasada.
- Despliegue en hardware heterogéneo: gracias al backend Vulkan/DX12 y Metal, funciona sobre GPUs NVIDIA, AMD, Intel y Apple silicon, y en máquinas sin GPU suficiente reparte capas entre GPU y CPU automáticamente.
- Servicios de inferencia con API estándar: `cortiq serve` expone además `/v1/completions`, `/v1/models` y un panel web en el mismo puerto, adecuado para montar un endpoint interno compatible con el ecosistema OpenAI.
- Procesamiento multilingüe (inglés, ruso, chino): útil para equipos que operan en esos tres idiomas y quieren un único modelo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí aporta métricas de perplexity y fidelidad de la cuantización, y mediciones de rendimiento con `cortiq bench` en una NVIDIA A40 (48 GB, Vulkan, modelo íntegro en tarjeta, un solo stream, cortiq 0.8.48):

| Archivo | Tamaño | Wiki ppl | Code ppl | Chat ppl | Top-1 vs bf16 (chat) | Decode tok/s | Decode 4k/16k | Prompt 4k/16k tok/s | Primer token (prompt 4k) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| q4tp-v2 (GPTQ) | 19,81 GB | 25,83 | 1,926 | 4,071 | 95,2 % | 80,3 | 73,3 / 59,5 | 390 / 368 | 10,5 s |
| q4tp | 19,83 GB | 26,86 | 1,905 | 4,029 | 94,9 % | 80,5 | 73,7 / 61,1 | 383 / 367 | 10,7 s |
| q8_2f | 35,84 GB | 25,72 | 1,753 | 4,047 | 97,7 % | 78,2 | 71,3 / 58,9 | 84 / 76 | 48,7 s |
| bf16 original | 71,9 GB | 26,52 | 1,759 | 4,025 | — | no disponible | no disponible | no disponible | no disponible |

Nota de la propia card: el fine-tune puntúa 26,5 de perplexity en wikitext en bruto (Qwen3.6-35B-A3B base: 5,6), un dato atribuible al modelo fine-tuned, no a la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,7 GB de pesos residentes para los archivos de 4 bits (`q4tp`, `q4tp-v2`) y 34,3 GB para `q8_2f`. Los archivos de 4 bits caben íntegros en una GPU de 24 GB; en tarjetas menores, cortiq carga las capas que caben en GPU y ejecuta el resto en CPU.
- GPUs recomendadas: cualquier GPU de 24 GB o más (la referencia publicada es una NVIDIA A40 de 48 GB vía Vulkan). Para `q8_2f` se recomiendan GPUs de 48 GB o CPUs con mucha memoria. Compatible con NVIDIA, AMD e Intel vía Vulkan/DX12, y Apple silicon vía Metal.
- Consumer GPUs: sí, cabe completo en una RTX 3090/4090 de 24 GB con los archivos de 4 bits; en tarjetas de 16 GB funciona con offload parcial a CPU (con pérdida de velocidad no cuantificada).
- Despliegue: exclusivamente con el motor `cortiq` (binarios precompilados para Linux, macOS y Windows; se recomienda versión 0.8.48 o superior). Modos: CLI interactiva, prompt único y servidor compatible con OpenAI (`cortiq serve`). No es ejecutable con vLLM, llama.cpp, Ollama ni TGI. En Linux headless sin servidor gráfico hay que instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Latencia y throughput (A40, Vulkan): ~80 tok/s de decodificación con los archivos de 4 bits (73 tok/s con prompts de 4k, ~60 tok/s con 16k), procesado de prompt a ~390 tok/s y primer token en 10,5 s con prompt de 4k. El archivo `q8_2f` procesa el prompt posición a posición en Vulkan: 84 tok/s de prefill y 48,7 s hasta el primer token con prompt de 4k, por lo que se desaconseja para prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-35B-V1.0-cmf (esta ficha) | 35,5B / ~3B | 262.144 tokens | 4-bit GPTQ, 8-bit (CMF) | Apache 2.0 | Motor cortiq (Rust, Vulkan/Metal/CPU); no compatible con vLLM/llama.cpp |
| Qwen3.6-35B-A3B (base) | 35,5B / ~3B | 262.144 tokens | bf16 y cuantizaciones comunitarias habituales | no disponible en la informacion proporcionada | Ecosistema estándar (PyTorch, vLLM, GGUF, etc.) |
| Qwen3-30B-A3B (referencia de categoria) | 30,5B / ~3B | 32.768–131.072 tokens | bf16 y GGUF variados | Apache 2.0 | Amplio soporte: vLLM, llama.cpp, Ollama, TGI |

La alternativa directa es el checkpoint original Apex-35B-V1.0 en bf16 (71,9 GB), que requiere ~72 GB de VRAM o CPU con mucha memoria y el ecosistema PyTorch, frente a los 19,8 GB y la ausencia de dependencias de esta versión CMF, a costa de una ligera degradación (95,2 % de coincidencia top-1 frente a bf16 en chat para `q4tp-v2`). No hay datos de benchmarks que permitan comparar calidad de tarea con otros modelos de su categoría.

## Limitaciones y advertencias

- Sin capacidades de visión: los archivos CMF no incluyen la torre de visión del checkpoint original; solo texto.
- El modo de thinking consume tokens del presupuesto de `max_tokens` (por defecto 256 en CLI), lo que puede truncar respuestas si no se amplía el límite.
- El archivo `q8_2f` es muy lento con prompts largos en Vulkan (prefill posición a posición); para contexto extenso hay que usar los archivos de 4 bits.
- La perplexity del modelo fine-tuned en wikitext en bruto (26,5) es notablemente peor que la del base Qwen3.6-35B-A3B (5,6), según la propia card; esto sugiere un cambio de distribución atribuible al fine-tune, no a la cuantización.
- Ecosistema cerrado: solo funciona con `cortiq`, un motor de terceros con adopción muy limitada (105 descargas del repo en el momento de la ficha); la trazabilidad y el soporte comunitario son escasos.
- Idiomas limitados a inglés, ruso y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos: no hay evaluaciones publicadas de seguridad ni de sesgos para este modelo; las advertencias habituales de los LLM aplican con más motivo al no existir benchmarks públicos.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene verificar los términos del modelo base en su repositorio.
- La cuantización a 4 bits implica una pérdida medible frente a bf16 (95,2 % de coincidencia top-1 en chat); en tareas muy sensibles a la precisión puede preferirse `q8_2f` si hay VRAM suficiente.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/infosave/Apex-35B-V1.0-cmf
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
