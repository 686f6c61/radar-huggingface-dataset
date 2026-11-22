# coolkid8/Qwen3.5-4B-Q4_K_M-GGUF

## Resumen

Qwen3.5-4B es un modelo de lenguaje de 4.205.751.296 parámetros desarrollado por Alibaba Cloud (Qwen) que introduce una arquitectura híbrida de atención lineal y atención softmax completa. Esta ficha describe la cuantización Q4_K_M en formato GGUF publicada por el usuario coolkid8 (con conversión atribuida a jc-builds y Unsloth), orientada a inferencia en dispositivo, especialmente en iOS mediante llama.cpp. El modelo base está publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de desplegar razonamiento de calidad en hardware con recursos limitados: con 4B parámetros y una cuantización de 4 bits (2,6 GB), cabe en dispositivos con 6-8 GB de RAM y mantiene una ventana de contexto nativa de 262.144 tokens, extensible a más de 1M con YaRN. Incorpora modo de razonamiento explícito mediante etiquetas `<think>` y, según la model card, capacidades multimodales nativas con fusión temprana de visión (encoder de visión disponible por separado).

Su relevancia actual radica en la relación calidad/tamaño: la model card reporta 79,1 en MMLU-Pro, por encima de modelos de tamaño similar como Phi-4-mini (52,8), y un rendimiento comparable a Qwen3-30B en varias pruebas de razonamiento, matemáticas y uso de herramientas pese a ser 7,5 veces más pequeño. Esta ficha se centra en la variante GGUF Q4_K_M, pensada para ejecución local en móvil y edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (atención lineal) + Gated Attention (softmax), ratio 3:1, 32 capas (8 bloques de 3 DeltaNet + 1 Attention) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1M+ con YaRN |
| Tipos de cuantizacion | Q4_K_M (4 bits, calidad media) en este repositorio; otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar, it, tr, nl, hi (la model card menciona 201 idiomas/dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (atención lineal con memoria acotada) y capas de atención softmax completa en proporción 3:1. El modelo tiene 32 capas organizadas en 8 bloques de 3 capas DeltaNet más 1 capa de atención. Las capas de atención usan GQA con 16 cabezas de consulta y 4 cabezas KV, y RoPE con `theta=10.000.000`, ampliable mediante YaRN a más de 1M de tokens. Las capas DeltaNet mantienen una memoria casi constante independientemente de la longitud de la secuencia, lo que reduce el coste de memoria en contextos largos.

La model card indica que el modelo es nativamente multimodal, entrenado con fusión temprana de visión, con un encoder de visión disponible por separado. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales de decodificación más allá del modo de razonamiento con etiquetas `<think>`.

## Capacidades

- Generación de texto conversacional en formato ChatML.
- Razonamiento explícito en modo thinking mediante etiquetas `<think>...</think>`.
- Razonamiento matemático y resolución de problemas (reportado en HMMT Feb 25 y GPQA Diamond).
- Generación y comprensión de código (reportado en LiveCodeBench v6).
- Uso de herramientas y function calling (reportado en BFCL-V4).
- Capacidades multimodales de visión según la model card (MMMU reportado), con encoder de visión separado.
- Soporte multilingüe amplio: 14 idiomas listados en metadatos y hasta 201 idiomas/dialectos según la model card.
- Optimización para inferencia en dispositivo (iOS, móvil, edge) con memoria casi constante en contextos largos.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.

## Casos de uso

- Asistente conversacional en iOS: el modelo Q4_K_M (2,6 GB) cabe en iPhone 15 Pro o superior con 8 GB de RAM y ofrece entre 28 y 38 tok/s, lo que permite un asistente local sin conexión con razonamiento paso a paso.
- Razonamiento matemático en el dispositivo: con 74,0 en HMMT Feb 25, puede resolver problemas de competición y explicar el procedimiento mediante el modo thinking, útil en apps educativas offline.
- Automatización de soporte técnico: su ventana de 262K tokens permite mantener conversaciones multi-turno con documentación extensa adjunta sin truncar contexto.
- Generación de código asistida en local: con 55,8 en LiveCodeBench v6 y soporte de tool calling, puede integrarse en editores o pipelines de desarrollo que requieran privacidad total de datos.
- Agentes con uso de herramientas: el soporte de function calling (50,3 en BFCL-V4) permite construir agentes multi-paso que consulten APIs o ejecuten acciones en el dispositivo.
- Procesamiento de documentos largos en edge: la memoria casi constante de las capas DeltaNet permite analizar contratos, informes o transcripciones extensas en hardware móvil.
- Aplicaciones multilingües: con soporte de 14 idiomas declarados y hasta 201 según la model card, es adecuado para traducción y atención al cliente en mercados diversos.
- Prototipado rápido en Mac Apple Silicon: con 40-60 tok/s en chips M-series, sirve para validar ideas antes de desplegar en servidores.

## Benchmarks y rendimiento

Datos reportados en la model card del repositorio (no verificados de forma independiente):

| Benchmark | Qwen3.5-4B | Qwen3-30B | Qwen3-80B |
|---|---|---|---|
| MMLU-Pro | 79,1 | 80,9 | 82,7 |
| MMLU-Redux | 88,8 | 91,4 | 92,5 |
| GPQA Diamond | 76,2 | 73,4 | 77,2 |
| IFEval | 89,8 | 88,9 | 88,9 |
| HMMT Feb 25 | 74,0 | 63,1 | 73,7 |
| LiveCodeBench v6 | 55,8 | 66,0 | 68,7 |
| BFCL-V4 (Tool Use) | 50,3 | 42,4 | no disponible |
| MMMU (Vision) | 77,6 | no disponible | no disponible |
| C-Eval | 85,1 | 87,4 | 89,7 |

Comparativas adicionales citadas en la model card:
- MMLU-Pro frente a modelos de tamaño similar: Phi-4-mini 52,8; Qwen2.5-3B 44,7; Llama-3.2-3B 39,2; Mistral-3B 35,3.
- Velocidad en dispositivo (Q4_K_M): iPhone 16 Pro/Pro Max ~30-38 tok/s; iPhone 16/16e ~28-35 tok/s; iPhone 15 Pro/Pro Max ~28-38 tok/s; iPhone 15/14 Pro ~15-20 tok/s; iPad Pro M-series ~35-45 tok/s; Mac Apple Silicon ~40-60 tok/s.

## Requisitos de hardware

- VRAM/RAM estimada: 2,6 GB de pesos en Q4_K_M; se recomienda al menos 4-6 GB libres para el contexto y el runtime.
- GPU recomendadas: no se especifican GPU de servidor en la información; el foco es Apple Silicon y dispositivos móviles.
- Compatibilidad en consumer GPU: no confirmada explícitamente; el tamaño de 2,6 GB sugiere que cabría en GPUs consumer con 6-8 GB de VRAM, pero no se aportan datos de rendimiento en CUDA.
- Dispositivos verificados en la model card: iPhone 16 Pro/Pro Max, iPhone 16/16e, iPhone 15 Pro/Pro Max (8 GB RAM, compatibles); iPhone 15/14 Pro (6 GB, marginal, 15-20 tok/s); iPhone 14 y anteriores (no recomendado); iPad Pro M-series; Mac Apple Silicon.
- Opciones de despliegue: llama.cpp (`llama-cli`, `-ngl 99`), Ollama (`ollama run qwen3.5:4b`), app iOS HaploAI (v1.18+).
- Latencia y throughput: 28-38 tok/s en iPhone 15/16 Pro, 35-45 tok/s en iPad Pro M-series, 40-60 tok/s en Mac Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (esta ficha, Q4_K_M) | 4,2B | 262K (1M+ con YaRN) | 79,1 | Apache 2.0 | GGUF, safetensors |
| Phi-4-mini | no disponible en la información | no disponible | 52,8 | no disponible | no disponible |
| Qwen2.5-3B | ~3B | no disponible | 44,7 | no disponible | no disponible |
| Llama-3.2-3B | ~3B | no disponible | 39,2 | no disponible | no disponible |
| Mistral-3B | ~3B | no disponible | 35,3 | no disponible | no disponible |

Los datos de MMLU-Pro de los competidores provienen de la model card del autor y no se han verificado de forma independiente. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks provienen de la model card del autor y no han sido verificados de forma independiente; deben tratarse con cautela.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22), lo que indica que es una publicación reciente y sin validación comunitaria.
- La model card menciona 201 idiomas, pero los metadatos solo declaran 14; el rendimiento real en idiomas no listados no está verificado.
- El modo thinking puede aumentar la latencia y el consumo de tokens; en dispositivos móviles conviene desactivarlo para tareas simples.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo base en safetensors; no se reportan métricas de degradación por cuantización.
- Riesgo de alucinación inherente a modelos de 4B parámetros, especialmente en tareas de conocimiento factual y contextos muy largos.
- La fusión temprana de visión requiere un encoder de visión separado; esta variante GGUF es de generación de texto y no incluye capacidades de visión listas para usar.
- El rendimiento en contextos cercanos a 262K tokens puede degradarse; la extensión a 1M+ con YaRN no está validada en esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-4B y las atribuciones de la conversión GGUF.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/coolkid8/Qwen3.5-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Conversión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Perfil del cuantizador jc-builds: https://huggingface.co/jc-builds
- llama.cpp: https://github.com/ggml-org/llama.cpp
- App iOS HaploAI: https://apps.apple.com/app/haploai/id6503772307
