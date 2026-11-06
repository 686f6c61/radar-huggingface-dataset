# infosave/LFM3-1.7B-cmf

## Resumen

LFM3-1.7B-cmf es un empaquetado cuantizado del modelo LiquidAI LFM3-1.7B, publicado por el usuario infosave en Hugging Face. El modelo base es un modelo de texto de 1.700 millones de parámetros de Liquid AI, diseñado para agentes locales, tool calling y salida estructurada, y se apoya en la arquitectura tri-híbrida propia de Liquid: combina capas de convolución corta con puertas (gated short-convolution), atención completa y atención por ventana deslizante, con una ventana de contexto de 262.144 tokens y modo de razonamiento (thinking) activado por defecto.

Esta variante concreta distribuye los pesos como ficheros únicos en formato CMF, cuantizados a 8 bits (q8_2f) y 4 bits (q4tp), listos para ejecutarse con cortiq, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML, y que funciona sobre GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12, sobre Apple silicon mediante Metal, y sobre CPU.

Su relevancia actual radica en el auge de modelos pequeños de "edge" capaces de razonar y llamar a herramientas en hardware de consumo: con menos de 1 GB de pesos en 4 bits, este modelo cabe en prácticamente cualquier GPU moderna o en un portátil Apple silicon, manteniendo capacidades de razonamiento, tool calling y contexto largo que hasta hace poco requerían modelos mucho mayores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 gated short-convolution, 6 full-attention, 5 sliding-window attention) |
| Parametros totales | 1,7 B |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens (KV cache por defecto: 32.768, ampliable con `CMF_MAX_SEQ`) |
| Tipos de cuantizacion | 8 bits (q8_2f) y 4 bits (q4tp); normas, taps de convolución y puertas de atención en 16 bits |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other", consultar el texto LICENSE) |
| Formato de pesos | CMF (fichero único); base original en bf16/Transformers |

## Arquitectura y entrenamiento

El LFM3-1.7B de Liquid AI emplea una arquitectura tri-híbrida de 24 capas: 13 capas de convolución corta con puertas (que mantienen un estado fijo de solo 0,6 MB por token, similar a enfoques de tipo state-space), 6 capas de atención completa y 5 capas de atención por ventana deslizante de 256 posiciones. Este diseño reduce drásticamente el coste de memoria del KV cache en secuencias largas, ya que solo las capas de atención completa requieren caché completa, y habilita contextos de hasta 262.144 tokens en un modelo de tamaño reducido. El modelo incluye por defecto un modo de razonamiento: la plantilla de chat termina con la etiqueta `<think>` y el modelo genera su cadena de pensamiento antes de la respuesta final.

Sobre los datos y el proceso de entrenamiento del checkpoint base (número de tokens, composición del corpus, RLHF/DPO), la model card no ofrece detalles; no disponible. En cuanto a la conversión a CMF, el autor documenta que es exacta: la conversión f16 reproduce posición por posición el resultado del checkpoint bf16 en float32 (perplejidad 13,186 frente a 13,186, top-1 del 100 %) y las continuaciones greedy de chat son idénticas texto a texto. En los ficheros cuantizados, las normas, los taps de las convoluciones cortas y las puertas de atención por cabeza permanecen en 16 bits; el embedding atado a la cabeza de salida sigue el códec del fichero.

## Capacidades

- Generación de texto general con modo de razonamiento (thinking) activado por defecto; la respuesta incluye `<think>…</think>` seguida de la respuesta final, y puede desactivarse con `--no-think` o `"enable_thinking": false`.
- Tool calling en formato OpenAI: el modelo emite llamadas estructuradas `<tool_call><function=NAME><parameter=KEY>value</parameter></function></tool_call>`, que el servidor expone como `message.tool_calls` con `finish_reason: "tool_calls"`.
- Salida estructurada para agentes locales y flujos multi-paso.
- Generación de código (el ejemplo de la model card incluye escritura de funciones Python).
- Contexto muy largo: hasta 262.144 tokens, con estado fijo de 0,6 MB en las capas convolucionales y ventana de 256 tokens en las capas deslizantes.
- Multilingüe: 16 idiomas, incluidos castellano, inglés, chino, japonés, árabe, hindi y ruso.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions` con streaming, `/v1/completions`, `/v1/models`) y panel web integrado.
- Muestreo recomendado por Liquid preconfigurado: temperatura 0,1, top-k 50, penalización de repetición 1,1; para matemáticas y ciencias, temperatura 1,0, top-p 0,95, top-k 20.

## Casos de uso

- Agentes locales con tool calling: el modelo puede ejecutarse íntegramente en un portátil o mini-PC y llamar a herramientas (consultas a APIs, funciones locales) devolviendo `tool_calls` compatibles con clientes OpenAI, adecuado para asistentes que operan sin nube.
- Asistentes de chat en dispositivos edge: con 0,9-1,76 GB de pesos residentes, cabe en GPUs integradas o portátiles Apple silicon, sirviendo un chat interactivo con razonamiento previo a la respuesta.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o consultar contratos, informes o bases de código extensos; las capas convolucionales y de ventana deslizante mantienen el consumo de memoria del KV cache bajo en secuencias largas.
- Generación y explicación de código en entornos restringidos: útil en equipos corporativos sin acceso a servicios externos, ejecutando el servidor de cortiq en local con la API de OpenAI como interfaz estándar.
- Backends de razonamiento ligeros para automatizaciones: el modo thinking permite encadenar pasos de razonamiento en pipelines de agentes multi-step con presupuesto de tokens controlado vía `--max-tokens`.
- Aplicaciones multilingües: soporte de 16 idiomas lo hace adecuado para chatbots de atención al usuario en castellano y otras lenguas, con muestreo conservador ya preconfigurado para respuestas estables.
- Integración en CI/CD o scripts: la CLI de cortiq permite invocaciones de una sola respuesta (`--prompt`, `--greedy` para salidas deterministas) útiles para generación de documentación, revisión de diffs o validaciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye perplejidad sobre las primeras 4.096 tokens de wikitext-2 test (con BOS) y métricas de inferencia:

| Fichero | Perplejidad (wikitext-2, 4k) | Top-1 vs original bf16 | Tamaño |
|---|---:|---:|---:|
| `q8_2f` (8 bits) | 13,14 | 97,7 % | 1,76 GB |
| `q4tp` (4 bits) | 15,15 | 80,4 % | 0,93 GB |
| bf16 original (Transformers) | 13,10 | — | 3,46 GB |

Rendimiento de decodificación (cortiq bench, un stream, `--core --ignore-eos`):

| Hardware | Fichero | Decodificación (tok/s) | Decod. a 1k/4k de contexto | Prompt 1k/4k (tok/s) | Primer token, prompt 4k |
|---|---|---:|---|---|---:|
| NVIDIA A40 (Vulkan) | q8_2f | 166 | 135 / 130 | 749 / 623 | 7,6 s |
| NVIDIA A40 (Vulkan) | q4tp | 231 | 184 / 165 | 695 / 574 | 8,0 s |
| Apple M4, 10 núcleos GPU (Metal) | q8_2f | 48,5 | — | 388 | no disponible |
| Apple M4, 10 núcleos GPU (Metal) | q4tp | 84 | 82 | 560 | no disponible |

## Requisitos de hardware

- VRAM para inferencia: ambos ficheros caben en cualquier GPU con 2 GB de memoria libre; pesos residentes de 1,73 GB (q8_2f) y 0,90 GB (q4tp).
- GPUs compatibles: NVIDIA, AMD e Intel a través de Vulkan/DX12; Apple silicon mediante backend nativo Metal (cortiq 0.8.50 o posterior para el grafo de token completo). No se requiere una GPU concreta como A100 o H100.
- Consumer GPUs: sí; con 2 GB libres basta, por lo que cualquier GPU moderna de consumo es suficiente.
- CPU: soportado (`CMF_GPU=0`), sin cifras de latencia publicadas.
- Despliegue: exclusivamente mediante cortiq (CLI `cortiq run`, `cortiq serve` con API compatible con OpenAI, `cortiq bench`). No hay pesos en GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables a estos ficheros CMF.
- Latencia: primer token con prompt de 4k en 7,6 s (q8_2f) y 8,0 s (q4tp) sobre A40; en Apple M4, decodificación de 48,5 a 84 tok/s según cuantización.
- En Linux headless: instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización distribuida | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-cmf (esta ficha) | 1,7 B | 262.144 | 8 y 4 bits | CMF (cortiq) | lfm1.0 (other) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | 262.144 | bf16 | Transformers/safetensors | lfm1.0 (other) |
| Qwen3-1.7B | 1,7 B | 32.768 (ampliable) | Varias (GGUF, etc.) | safetensors/GGUF | Apache 2.0 |
| Gemma 3 1B | ~1 B | 32.768 | Varias (GGUF, etc.) | safetensors/GGUF | Gemma (restricciones de uso) |

Frente a alternativas de tamaño similar, el LFM3-1.7B destaca por su contexto de 262.144 tokens (muy superior a los 32k habituales en la clase de 1-2 B) y por su arquitectura híbrida con estado fijo en buena parte de las capas, lo que abarata el KV cache en secuencias largas. A cambio, su distribución está ligada al motor cortiq y al formato CMF, con un ecosistema mucho menor que el de formatos GGUF, y su licencia lfm1.0 es más restrictiva que una Apache 2.0 (revisar términos para uso comercial).

## Limitaciones y advertencias

- El modelo de 1,7 B en modo instruct es sensible a la cuantización a 4 bits: la coincidencia top-1 cae al 80,4 % y la perplejidad sube de 13,14 a 15,15; se recomienda q8_2f salvo que la memoria sea la restricción.
- El razonamiento (thinking) consume del presupuesto de `--max-tokens` (por defecto 256 en CLI), lo que puede truncar respuestas si no se amplía el límite.
- El KV cache por defecto es de 32.768 tokens; para aprovechar los 262.144 hay que subirlo explícitamente con `CMF_MAX_SEQ=262144`, con el consiguiente aumento de memoria.
- Riesgo de alucinación propio de modelos de 1,7 B: en tareas de conocimiento factual y razonamiento complejo, su precisión será inferior a la de modelos grandes; no hay benchmarks públicos que cuantifiquen esto.
- Sesgos conocidos: no disponible; no se documenta auditoría de sesgos en la model card.
- Idiomas: se declaran 16, pero no hay datos públicos de calidad por idioma; el rendimiento en castellano no está cuantificado.
- Licencia lfm1.0 del tipo "other": debe revisarse el texto LICENSE antes de cualquier despliegue comercial, ya que las licencias comunitarias de Liquid AI suelen imponer condiciones (límites de usuarios, registro, etc.).
- Ecosistema cerrado al formato CMF: solo funciona con cortiq (0.8.49 o posterior), lo que limita la portabilidad frente a GGUF/safetensors y la integración con herramientas estándar.
- Proyecto de distribución con adopción muy temprana (6 descargas y 1 like en Hugging Face en el momento de la ficha): conviene validar la conversión en el propio caso de uso antes de producción.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/infosave/LFM3-1.7B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Licencia del modelo: https://huggingface.co/infosave/LFM3-1.7B-cmf/blob/main/LICENSE
