# SmallAICreator/MiniGPT3-22M

## Resumen

MiniGPT3-22M es un modelo de lenguaje de 27 millones de parámetros (22M según la nomenclatura del autor) entrenado desde cero por UltraLabs (SmallAICreator). Su rasgo distintivo es la arquitectura híbrida: combina capas Mamba2 (modelo de espacio de estados) con capas de atención y MLP ReLU², siguiendo el layout de capas de NVIDIA Nemotron-H. Esto le permite cargarse con `transformers` mediante `NemotronHForCausalLM` y ejecutarse en llama.cpp (backend `nemotron_h`) incluso en teléfonos.

El modelo se presenta como sucesor de MiniGPT2 y está pensado como banco de pruebas para investigación en modelos pequeños y demostraciones on-device. Se distribuye en varias variantes: base tras pretraining, base + SFT y el modelo de chat final (pretraining + SFT + DPO), además de un GGUF en F16 de 54,7 MB listo para llama.cpp.

Es relevante por su enfoque poco habitual a esta escala: entrenamiento en JAX sobre TPU v5e-8 y T4, uso de Muon + AdamW, y una arquitectura híbrida Mamba2/atención sin codificación posicional en las capas de atención. No obstante, con 27M de parámetros su conocimiento del mundo es muy limitado y no es apto para producción que requiera respuestas fiables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención + MLP ReLU² (layout Nemotron-H) |
| Parámetros totales | 27.029.070 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrenado) |
| Tipos de cuantización | F16 (GGUF publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

Detalles de capas: 24 capas en total con patrón `M-M-*-M-M-M-*-M-M-M-*-M-` (9 capas Mamba2, 3 de atención, 12 MLP ReLU²). Anchura d_model 320, MLP 1280, Mamba2 con 10 cabezas × 64 (estado 64), atención con 5 cabezas de query y 1 de KV × 64. Vocabulario de 16.384 tokens con BPE byte-level (tokenizer de MiniGPT2). Sin codificación posicional: el orden lo aportan las capas Mamba2.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala capas Mamba2 (SSM) con capas de atención y bloques MLP con activación ReLU², replicando el esquema de capas de Nemotron-H. La ausencia de positional encoding en la atención se compensa con el estado recurrente de las capas Mamba2, que aporta la información de orden. Esta combinación reduce el coste de atención en secuencias largas y es la que permite la ejecución eficiente en llama.cpp.

El pretraining se realizó en JAX: una primera sesión en una Kaggle TPU v5e-8 a LR pico (~36B tokens) y después un decaimiento coseno hasta el 2% sobre 2× T4 (~1,7B tokens), con un total de 37,7B tokens. La segunda mitad del decaimiento mezcla un conjunto de anneal de conocimiento y matemáticas: aritmética sintética, FineMath, MegaMath, WebInstructSub, Cosmopedia, Wikipedia, TinyStories y wikiHow. Optimizadores Muon + AdamW. El SFT se hizo en 489 pasos sobre smol-smoltalk (67%), Tulu 3 (28%), respuestas destiladas (5%) y un conjunto de identidad; el DPO, en 195 pasos sobre pares de preferencia de Anthropic hh-rlhf.

## Capacidades

- Generación de texto y continuación de texto (variante `pretrain-final`).
- Conversación multi-turno en inglés (variante `final`, con plantilla de chat `<|user|>…<|end|><|assistant|>…<|end|>`).
- Razonamiento básico y aritmética elemental, reforzados por la mezcla de anneal (FineMath, MegaMath, aritmética sintética), aunque con fiabilidad baja.
- Generación de código muy limitada, sin datos específicos publicados sobre su calidad.
- Alineación básica mediante SFT + DPO (respuestas más conversacionales y menos tóxicas que la base).
- Capacidad multilingüe: solo inglés.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso.
- Sin visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Demostraciones on-device en Android: el GGUF F16 de 54,7 MB se carga en cualquier app basada en llama.cpp con soporte Nemotron-H (por ejemplo, L-AI), lo que permite probar un LLM en un teléfono sin conexión y con huella de memoria mínima.
- Investigación en arquitecturas híbridas SSM/atención: sirve como referencia reproducible para estudiar el comportamiento de capas Mamba2 intercaladas con atención a escala muy pequeña.
- Experimentos de alineación a bajo coste: el pipeline SFT (smol-smoltalk, Tulu 3) + DPO (hh-rlhf) es replicable en hardware modesto y útil para estudiar dinámicas de alineación en modelos diminutos.
- Generación de texto corto y creativo: haikus, eslóganes, micro-relatos o continuaciones de una o dos frases donde la fluidez superficial prima sobre la exactitud factual.
- Prototipado de pipelines de inferencia: validar integraciones con `transformers` (`NemotronHForCausalLM`) o llama.cpp antes de escalar a modelos mayores con la misma arquitectura.
- Educación y docencia: ilustrar el ciclo completo pretraining → SFT → DPO y la comparación entre variantes base y chat con un modelo que cabe en cualquier portátil.
- Pruebas de cuantización y benchmarking de motores de inferencia: al ser tan pequeño, permite medir latencia y throughput de llama.cpp o transformers con coste despreciable.

## Benchmarks y rendimiento

Resultados de lm-evaluation-harness 0.4.13, 0-shot, fp32, backend HF:

| Modelo | ARC-E | ARC-C | HellaSwag | LAMBADA | PIQA | WinoGrande | Media |
|---|---|---|---|---|---|---|---|
| MiniGPT3-22M `final` | 37,16 | 22,01 | 28,73 | 24,72 | 58,38 | 49,80 | 36,80 |
| MiniGPT3-22M `pretrain-final` | 36,28 | 22,27 | 28,84 | 26,30 | 57,89 | 49,17 | 36,79 |
| MiniGPT2-22M | 40,0 | 23,1 | 28,2 | 23,1 | 58,1 | 50,0 | 37,08 |

Según el autor, a esta escala las puntuaciones quedan a uno o dos puntos entre sí; MiniGPT3 destaca en LAMBADA (predicción de siguiente palabra) y genera texto notablemente más fluido que MiniGPT2. No hay datos publicados de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (27M parámetros ≈ 108 MB de pesos); el GGUF F16 ocupa 54,7 MB, por lo que la inferencia cabe en menos de 200 MB contando el contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU; también CPU y TPU para entrenamiento (el autor usó TPU v5e-8 y T4).
- Cabe en cualquier GPU consumer y en teléfonos móviles vía llama.cpp.
- Opciones de despliegue: `transformers` (backend HF), llama.cpp (backend `nemotron_h`) y apps Android basadas en llama.cpp. vLLM, TGI y Ollama no están documentados para esta arquitectura.
- Latencia y throughput: no disponibles; por el tamaño, se esperan decenas o cientos de tokens por segundo en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media lm-eval (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniGPT3-22M | 27,0M | 2.048 | 36,80 | Apache 2.0 | HF (safetensors + GGUF) |
| MiniGPT2-22M | ~22M | no disponible | 37,08 | no disponible | HF |
| TinyLlama-1.1B | 1,1B | 2.048 | no disponible en esta ficha | Apache 2.0 | HF |

La comparación directa con TinyLlama u otros modelos de ~1B no es homogénea por la diferencia de escala (unas 40 veces más parámetros) y porque no se dispone de sus resultados en el mismo harness y configuración. Frente a MiniGPT2, el salto es cualitativo (fluidez) más que cuantitativo (media de benchmarks prácticamente idéntica).

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: el propio autor advierte que falla en hechos y aritmética y puede repetirse.
- Riesgo alto de alucinación; no apto para respuestas que requieran fiabilidad.
- Contexto corto (2.048 tokens) y solo inglés; sin soporte multilingüe.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo no es adecuado para producción por su calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte de terceros prácticamente inexistentes.
- El soporte de la arquitectura Nemotron-H en llama.cpp y transformers puede variar entre versiones; conviene fijar versiones en producción.
- Sin datos publicados de sesgos específicos; al entrenarse con mezclas web (Cosmopedia, Wikipedia, Tulu 3) puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/MiniGPT3-22M
- Perfil del autor (incluye MiniGPT2): https://huggingface.co/SmallAICreator
- App Android de referencia L-AI: https://huggingface.co/SmallAICreator/L-AI-Android
- Repositorio llama.cpp (backend `nemotron_h`): https://github.com/ggml-org/llama.cpp
- Paper de Nemotron-H (layout de capas): no disponible en la información proporcionada
- Paper de Mamba2: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
