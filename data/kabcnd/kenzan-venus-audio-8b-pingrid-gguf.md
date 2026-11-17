# kabcnd/Kenzan-Venus-Audio-8B-PinGrid-GGUF

## Resumen

Kenzan-Venus-Audio-8B-PinGrid-GGUF es una cuantización GGUF del modelo inclusionAI/Realtime-Venus, publicada por el usuario kabcnd bajo el paraguas del proyecto Kenzan. El modelo base es un derivado de Qwen3-8B orientado a audio nativo y tool calling, y esta versión concreta extrae el núcleo de 36 capas del transformer (4096×12288, GQA 32/8, rope.freq_base = 1000000.0) y lo empaqueta en un único fichero GGUF de 5,68 GiB pensado para ejecutarse en un Mac mini con Apple Silicon y 16 GB de memoria unificada.

La propuesta principal es ofrecer un modelo "audio-native omni core" con soporte de function calling en hardware de consumo, algo poco habitual en modelos de 8B con capacidades de audio. El autor reporta 55/60 (91,67%) en BFCL-Lite-60 y 50/50 (100%) en llamadas `tool_calls` en formato OpenAI estricto, lo que sitúa al modelo como una opción interesante para agentes locales con herramientas.

El repositorio incluye además el tokenizador de audio `token2wav/` (1,15 GiB) con los ficheros `campplus.onnx`, `flow.pt`, `hift.pt` y `speech_tokenizer_v2_25hz.onnx` para síntesis de voz full-duplex, junto con una plantilla Jinja (`venus_tool.jinja`) que fuerza el cumplimiento exacto de nombres de herramientas. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B), 36 capas, hidden 4096, FFN 12288, GQA 32/8 cabezas, rope.freq_base 1000000.0 |
| Parametros totales | 8.189.228.032 (8,19B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en la receta de despliegue recomendada (`-c 8192`); el máximo nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | GGUF PinGrid mixed-precision (mapa en `recipes/tensor_types_venus_tool.txt`); KV cache q4_0; el autor menciona ternario PTQ1_0/PQ2_0 como inspiración pero no confirma su uso en este fichero |
| Idiomas soportados | en, zh, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Kenzan-Venus-Audio-8B-PinGrid-M6-16G.gguf`, 5,68 GiB); tokenizador de audio en ONNX y PyTorch (`token2wav/`) |

## Arquitectura y entrenamiento

El modelo es una extracción del núcleo LLM de inclusionAI/Realtime-Venus, que a su vez se basa en Qwen3-8B. La arquitectura es un transformer decoder-only estándar con 36 capas, dimensión oculta 4096, FFN de 12288, atención con GQA de 32 cabezas de query y 8 de key/value, y `rope.freq_base = 1000000.0`, lo que habilita contextos largos. El vocabulario es de 151752 tokens e incluye el rango de tokens de audio `151643..151751`.

La cuantización PinGrid es una técnica de precisión mixta por tensor, definida en `recipes/tensor_types_venus_tool.txt`, que asigna distintos tipos GGUF a distintas capas y tensores para preservar la calidad en tool calling y audio dentro de un presupuesto de memoria de 16 GB. El autor cita como inspiración el trabajo de Prism ML con Bonsai-2 en cuantización ternaria (PTQ1_0/PQ2_0) y estabilización de fase con Hadamard por bloques, aunque no se especifica si esta versión concreta emplea dichos formatos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, chino y ruso.
- Tool calling / function calling en formato OpenAI, con 50/50 en llamadas `tool_calls` estrictas según el autor.
- Soporte de esquemas de herramientas simples, múltiples y anidados complejos (100% en cada categoría de BFCL-Lite-60).
- Cadenas multi-turno de herramientas (100% en BFCL-Lite-60).
- Llamadas paralelas y secuenciales (90% en BFCL-Lite-60).
- Detección de irrelevancia / abstención ante herramientas no pertinentes (60%, con 40% de falsos positivos).
- Audio nativo: el repositorio preserva los tokens de audio y el pipeline `token2wav/` para síntesis de voz full-duplex.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Plantilla Jinja dedicada (`venus_tool.jinja`) para forzar el cumplimiento exacto de nombres de herramientas.

## Casos de uso

- Agentes locales de tool calling en Mac: el modelo cabe en 5,68 GiB y permite ejecutar un agente con function calling sobre `llama-server` en un Mac mini de 16 GB, sin depender de APIs en la nube.
- Asistentes de voz en local: combinando el núcleo GGUF con `token2wav/` (1,15 GiB) se puede construir un pipeline de reconocimiento y síntesis de voz full-duplex que quepa en memoria unificada de 16 GB.
- Automatización de atención al cliente multi-turno: la puntuación del 100% en cadenas multi-turno de BFCL-Lite-60 lo hace adecuado para flujos donde el agente encadena varias llamadas a herramientas antes de responder.
- Integración en pipelines de CI/CD con `llama-server`: la compatibilidad con endpoints OpenAI permite sustituir un backend remoto por uno local en herramientas que ya hablan el protocolo, reduciendo coste y latencia de red.
- Enrutamiento de herramientas en asistentes de escritorio: la plantilla `venus_tool.jinja` y el 100% en esquemas anidados permiten usar el modelo como enrutador de funciones en aplicaciones de escritorio con muchas herramientas declaradas.
- Prototipado de agentes con abstención: aunque la detección de irrelevancia es del 60%, sigue siendo utilizable en escenarios donde el coste de una llamada errónea es bajo y se complementa con validación posterior.
- Experimentación con audio nativo en Apple Silicon: el repositorio incluye los artefactos necesarios para reproducir el pipeline de voz, lo que facilita investigación aplicada sobre modelos omni en hardware de consumo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BFCL-Lite-60 (global) | 55/60 (91,67%) |
| BFCL-Lite-60 — Simple Function | 10/10 (100%) |
| BFCL-Lite-60 — Multiple Functions | 10/10 (100%) |
| BFCL-Lite-60 — Nested & Complex Schema | 10/10 (100%) |
| BFCL-Lite-60 — Irrelevance Detection (Abstention) | 6/10 (60%, FPR 40%) |
| BFCL-Lite-60 — Multi-Turn Tool Chain | 10/10 (100%) |
| BFCL-Lite-60 — Parallel / Sequential Calls | 9/10 (90%) |
| Strict Raw OpenAI `tool_calls` | 50/50 (100%) |
| Perplejidad (`wt2_holdout_128k.txt`, 14 chunks, `-c 2048`) | 9,2313 ± 0,20557 |
| `llama-bench` pp512 (Apple Silicon M6) | 826,59 ± 2,92 t/s |
| `llama-bench` tg128 (Apple Silicon M6) | 23,56 ± 0,36 t/s |
| Throughput medio en BFCL (tg) | 23,79 t/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~5,68 GiB para el fichero GGUF principal más ~1,15 GiB para `token2wav/`, total ~6,83 GiB; con KV cache q4_0 y contexto de 8192 el autor confirma que cabe en 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M6 y superiores según el autor); no se documentan requisitos para GPUs NVIDIA o AMD en la información disponible.
- Cabe en GPU de consumo: sí, en Apple Silicon con 16 GB de memoria unificada; no se confirma compatibilidad con GPUs consumer NVIDIA/AMD.
- Opciones de despliegue: `llama-server` (llama.cpp) con Metal, con flags `-ngl 99 -fa on -np 1 -c 8192 --cache-type-k q4_0 --cache-type-v q4_0 --jinja --chat-template-file venus_tool.jinja` y decodificación especulativa n-grama (`--spec-type ngram-map-k`); el autor menciona "llama-clover" como variante con `common_chat_peg_parse`.
- Latencia y throughput: pp512 = 826,59 t/s, tg128 = 23,56 t/s en Mac mini M6; throughput medio en BFCL de 23,79 t/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kenzan-Venus-Audio-8B-PinGrid-GGUF | 8,19B | 8192 (receta recomendada) | BFCL-Lite-60 91,67% | Sí (token2wav) | Apache 2.0 | GGUF en HF |
| Qwen3-8B | 8B | no disponible en la información | no disponible | No | Apache 2.0 | safetensors/GGUF |
| inclusionAI/Realtime-Venus | no disponible | no disponible | no disponible | Sí | no disponible | HF |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | No | no disponible | HF |

No se dispone de datos de benchmarks comparables para Qwen3-8B, Realtime-Venus o Bonsai-2 en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La detección de irrelevancia (abstención) es del 60% con un 40% de falsos positivos, lo que puede provocar llamadas a herramientas innecesarias en producción.
- El modelo está entrenado y validado principalmente en inglés, chino y ruso; el rendimiento en castellano no está documentado.
- Es una cuantización GGUF de precisión mixta: puede degradar ligeramente la calidad frente al modelo base en tareas distintas del tool calling y el audio.
- La longitud de contexto recomendada en la receta es de 8192 tokens; no se documenta el máximo nativo del modelo base ni el comportamiento más allá de ese límite.
- La compatibilidad de hardware documentada se limita a Apple Silicon; no hay datos de rendimiento en GPUs NVIDIA o AMD.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor pide donaciones para ampliar el hardware de pruebas; conviene validar los resultados de forma independiente antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (inclusionAI/Realtime-Venus) podría tener condiciones adicionales no detalladas en la información disponible.
- La plantilla `venus_tool.jinja` es necesaria para el cumplimiento estricto de nombres de herramientas; sin ella, el rendimiento en tool calling puede degradarse.
- El autor recomienda pasar `enable_thinking: false` en las peticiones; no se documenta el comportamiento con thinking activado.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Venus-Audio-8B-PinGrid-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Realtime-Venus
- Prism ML (inspiración): https://huggingface.co/prism-ml
- Ko-fi del autor: https://ko-fi.com/kabcpc
- llama.cpp: https://github.com/ggml-org/llama.cpp
