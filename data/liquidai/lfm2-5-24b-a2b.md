# LiquidAI/LFM2.5-24B-A2B

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, disenado especificamente para tareas de razonamiento y uso de herramientas en entornos de agente. Con 24.000 millones de parametros totales pero solo 2.450 millones activos por token, el modelo busca ofrecer capacidad de razonamiento de un modelo grande con el coste computacional de uno pequeno. Es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde 230M hasta estos 24B.

La arquitectura combina 30 bloques de convolucion corta con doble compuerta (double-gated short convolution) y 10 bloques de atencion con query agrupada (GQA), organizados en 40 capas. Cada bloque MoE contiene 64 expertos con enrutamiento top-4. El modelo fue entrenado con 36 billones de tokens y dispone de una ventana de contexto de 131.072 tokens, con un vocabulario de 128.000 tokens y soporte para 16 idiomas.

Su relevancia actual radica en que es un modelo de razonamiento puro: siempre genera un bloque `<think>` antes de responder, pero con solo 2.450 millones de parametros activos por token, lo que abarata cada token de razonamiento. Liquid AI lo posiciona como un modelo competitivo en tareas de agente y tool calling frente a modelos con aproximadamente un 50% mas de parametros totales y activos, como Qwen3.6-35B-A3B. La licencia es lfm1.0 (categorizada como "other" en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 30 bloques de convolucion corta con doble compuerta + 10 bloques GQA (40 capas) |
| Parametros totales | 23.971.585.280 (24,0B) |
| Parametros activos | 2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (checkpoint oficial), GGUF (llama.cpp), MLX-4bit (Apple Silicon), ONNX |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (nativo), FP8, GGUF, ONNX, MLX-4bit |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina bloques de convolucion corta con doble compuerta (30 de las 40 capas) y bloques de atencion con query agrupada (GQA, 10 capas). Esta mezcla busca reducir el coste de atencion manteniendo capacidad de modelado de secuencias largas. La capa MoE cuenta con 64 expertos por bloque y enrutamiento top-4, lo que resulta en 2,45B parametros activos sobre 24B totales. El vocabulario es de 128.000 tokens y el presupuesto de entrenamiento alcanza los 36 billones de tokens.

El modelo es un "reasoning model" puro: el chat template inserta directamente la etiqueta `<think>` y el modelo siempre razona antes de responder. Se distribuye un checkpoint base (LFM2.5-24B-A2B-Base) para fine-tuning y un checkpoint post-entrenado para cargas de trabajo agenticas. Liquid AI menciona un modelo draft DSpark para decodificacion especulativa con SGLang (marcado como "coming soon"), lo que apunta a optimizacion de latencia en generacion. No se detalla en la informacion disponible la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento explicito: siempre genera un bloque `<think>` antes de la respuesta final.
- Uso de herramientas y function calling, optimizado para cargas de trabajo agenticas.
- Razonamiento multi-paso y ejecucion de agentes, con buen rendimiento declarado en tareas de tool use.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Capacidad de razonamiento con coste reducido por token gracias a los 2,45B parametros activos.
- Formato de chat tipo ChatML con etiquetas `<|im_start|>`, `<|im_end|>` y `<|startoftext|>`.
- Modelo solo texto: no se declaran capacidades de vision ni audio.
- Parametros de generacion recomendados: temperature 0.1, top_k 50, repetition_penalty 1.05.

## Casos de uso

- Agentes de razonamiento en dispositivo: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas localmente, con 184 tok/s en un Apple M5 Max y solo 2,45B parametros activos, lo que lo hace viable en portatiles de gama alta.
- Asistentes con tool calling y recuperacion: Liquid AI recomienda emparejarlo con retrieval o busqueda web para tareas intensivas en conocimiento, aprovechando su fortaleza en llamadas a herramientas en lugar de depender de conocimiento parametrico.
- Automatizacion de atencion al cliente multi-turno: con 131.072 tokens de contexto puede gestionar conversaciones largas y mantener el hilo, aunque para datos factuales conviene combinarlo con RAG.
- Generacion y revision de codigo en pipelines: el soporte de function calling permite integrarlo en flujos de CI/CD para invocar herramientas de linting, tests o despliegue.
- Despliegue de alta concurrencia en servidor: el checkpoint FP8 y el soporte de vLLM y SGLang permiten servir hasta 21K tokens de salida por segundo en una unica GPU NVIDIA B300.
- Razonamiento en el borde (edge) y movil: los formatos ONNX y MLX-4bit habilitan inferencia acelerada por hardware en entornos de borde y en Mac con Apple Silicon.
- Fine-tuning especifico de dominio: el checkpoint base LFM2.5-24B-A2B-Base esta pensado para adaptacion a tareas concretas con datos propios.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los siguientes:

| Benchmark / metrica | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |
| Throughput en Apple M5 Max | 184 tok/s | no disponible |
| Throughput en NVIDIA B300 (salida) | hasta 21K tok/s | no disponible |
| Aceleracion frente a MoEs comparables en dispositivo | hasta 1,7x | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. La model card incluye una imagen de benchmarks (`figures/LFM2.5-24B-A2B-benchmark.png`) cuyo contenido numerico no se detalla en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo nativo ocupa 48,0 GB, por lo que en precision nativa (bf16/fp16) requiere aproximadamente 48 GB o mas de memoria. El checkpoint FP8 reduce el requisito a la mitad aproximadamente (unos 24 GB). Las cuantizaciones GGUF y MLX-4bit reducen aun mas el consumo, aunque el dato exacto no esta disponible.
- GPU recomendadas: NVIDIA B300 para alto rendimiento (hasta 21K tok/s de salida en una sola GPU). Para despliegue en servidor con FP8, GPU con 24 GB o mas de VRAM (A100 40/80GB, H100, L40S). El modelo no cabe en una RTX 4090 de 24 GB en precision nativa; si en FP8 o cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas (GGUF Q4/Q5, MLX-4bit) sobre GPUs de 16-24 GB y en Apple Silicon de gama alta.
- Opciones de despliegue: Transformers, vLLM, SGLang (incluye soporte de decodificacion especulativa con el modelo draft DSpark), llama.cpp (GGUF), ONNX Runtime y MLX en Apple Silicon.
- Latencia y throughput: 184 tok/s en Apple M5 Max; hasta 21K tok/s de salida en una NVIDIA B300; hasta 1,7x mas rapido que MoEs comparables en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-24B-A2B | 24B / 2,45B | 131.072 | lfm1.0 | LiveClaw 48,09; razonamiento puro; multilingue (16 idiomas) |
| Qwen3.6-35B-A3B | 35B / 3B (aprox.) | no disponible | no disponible | LiveClaw 38,19; ~50% mas parametros totales y activos segun Liquid AI |
| LFM2.5-230M | 230M | no disponible | lfm1.0 | Miembro menor de la misma familia; no comparable en capacidad |

La informacion proporcionada solo permite comparar directamente con Qwen3.6-35B-A3B en el benchmark LiveClaw. No se dispone de datos de otros modelos comparables (por ejemplo, otros MoE de 20-30B) en la informacion disponible.

## Limitaciones y advertencias

- Modelo solo texto: no soporta vision ni audio.
- No recomendado para tareas intensivas en conocimiento por si solo; Liquid AI recomienda combinarlo con retrieval o busqueda web para mitigar alucinaciones factuales.
- Es un modelo de razonamiento puro: siempre genera un bloque `<think>` antes de responder, lo que incrementa el numero de tokens generados y puede no ser deseable en aplicaciones de baja latencia o respuestas triviales.
- Licencia lfm1.0 (etiquetada como "other"): es necesario revisar los terminos del archivo LICENSE antes de un uso comercial; no se detallan en la informacion disponible las restricciones concretas.
- Riesgo de sesgos y alucinaciones inherente a los modelos de lenguaje; no se documentan en la informacion disponible evaluaciones de sesgo.
- Cobertura multilingue declarada en 16 idiomas, pero no se aportan metricas de calidad por idioma; el rendimiento en idiomas distintos del ingles puede variar.
- El modelo draft DSpark para decodificacion especulativa esta marcado como "coming soon", por lo que esa optimizacion de latencia aun no esta disponible.
- El tamano nativo (48 GB) exige cuantizacion para desplegarse en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Checkpoint FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Checkpoint GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Checkpoint ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Checkpoint MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo draft DSpark: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-DSpark
- Modelo menor de la familia: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion del chat template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Discord: https://discord.com/invite/liquid-ai
- Paper (arXiv): https://arxiv.org/abs/2511.23404
