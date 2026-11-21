# chris320211/smoothquant-qwen25-15b-g52xlarge

## Resumen

SmoothQuant Qwen2.5-1.5B-Instruct es una versión cuantizada a 8 bits del modelo Qwen/Qwen2.5-1.5B-Instruct, publicada por el usuario chris320211 mediante la herramienta QuantPort. Aplica la técnica SmoothQuant, que reequilibra las escalas de activación y peso antes de la cuantización para reducir el error en modelos transformer. El resultado es un artefacto de pesos empaquetados de 1.777.733.120 parámetros (1,5B en fp16 original) con un tamaño de repositorio de 2,3 GB.

El modelo hereda la arquitectura Qwen2 de la familia Qwen2.5: un transformer decoder-only de 1,5B parámetros con licencia Apache 2.0, orientado a generación de texto conversacional. Su relevancia práctica es doble: por un lado, reduce el pico de VRAM de 5,84 GB a 4,68 GB en Transformers, y por otro, la variante nativa para vLLM publicada por el mismo autor mejora el rendimiento de decodificación de forma notable (260,7 tok/s frente a 208,5 tok/s en fp16, batch 1, sobre RTX 3090).

Es importante señalar que este repositorio no es un checkpoint cargable directamente con `AutoModelForCausalLM.from_pretrained`. Requiere el adaptador de inferencia incluido (`quant_agent_inference_adapter.py`) y el repositorio del método en la variable de entorno `QUANT_AGENT_METHOD_REPO`. Para despliegue en producción se recomienda la build específica de vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.733.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | 8-bit (SmoothQuant, pesos empaquetados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Formato de pesos | safetensors (artefacto empaquetado, no drop-in) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar de la familia Qwen2. La modificación introducida por este repositorio no afecta a la arquitectura ni al entrenamiento original: es un proceso de cuantización post-entrenamiento (PTQ) que aplica SmoothQuant. Esta técnica migra la dificultad de cuantización desde las activaciones hacia los pesos mediante un factor de escala por canal, lo que permite cuantizar a 8 bits con una degradación de perplejidad contenida.

Los datos de entrenamiento del modelo base no se detallan en la información proporcionada. Tampoco se especifica si hubo RLHF o DPO en el modelo original. La evaluación de la cuantización se realizó sobre WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens) en una instancia NVIDIA A10G (g5.2xlarge), comparando contra el snapshot fp16 original. El artefacto se generó en el job `20260920T220639Z-9e4555` y los números provienen de `benchmark.json`. No se documenta ninguna innovación arquitectónica adicional más allá de la propia cuantización.

## Capacidades

- Generación de texto conversacional en el estilo del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, heredado del ajuste instructivo del modelo original.
- Generación de código y matemáticas a nivel de un modelo de 1,5B, sin datos específicos publicados en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo base es solo texto.
- Inferencia acelerada con vLLM a través de la build nativa `chris320211/smoothquant-qwen25-15b-g52xlarge-vllm`.

## Casos de uso

- Despliegue con restricciones de VRAM: el artefacto reduce el pico de memoria de 5,84 GB a 4,68 GB en Transformers, lo que permite ejecutar el modelo en GPUs consumer con 6-8 GB de VRAM libre. Útil para prototipos en estaciones de trabajo modestas.
- Servicio de generación de texto de alto throughput: la build de vLLM alcanza 41.765 tok/s de prefill y 3.715,8 tok/s de decodificación con batch 16 en una RTX 3090, adecuada para APIs internas con concurrencia moderada.
- Chatbots de atención al cliente de baja latencia: con 260,7 tok/s de decodificación en batch 1 sobre RTX 3090 (vLLM int8), el modelo puede sostener conversaciones interactivas con tiempos de respuesta por token inferiores a 4 ms en esa GPU.
- Clasificación y extracción de información en pipelines por lotes: el prefill de 41.765 tok/s permite procesar grandes volúmenes de documentos cortos con ventanas de 2048 tokens de forma económica.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica métricas reproducibles (perplejidad, NLL, throughput, VRAM) que sirven como referencia para investigar el impacto de SmoothQuant frente a otras técnicas PTQ.
- Fine-tuning ligero o adaptación con LoRA: al reducir la huella de memoria, deja más VRAM disponible para adaptadores y estados del optimizador en GPUs de gama media.
- Entornos de CI/CD para pruebas de regresión de modelos: el tamaño de 2,3 GB del repositorio y su licencia Apache 2.0 facilitan su inclusión en pipelines automatizados de validación.

## Benchmarks y rendimiento

Resultados publicados en la model card. WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens) sobre NVIDIA A10G (g5.2xlarge), Transformers:

| Métrica | Cuantizado | fp16 |
|---|---:|---:|
| Perplejidad | 10,066860 | 9,579098 |
| NLL loss | 2,309249 | 2,259583 |
| Tokens/s (prefill 2048, tras warmup) | 10.427,5 | 11.103,1 |
| Pico de VRAM (GB) | 4,682 | 5,844 |

- `ppl_ratio`: 1,050919 (`quality_ok=True`)
- `improved_throughput`: False
- `improved_vram`: True

Resultados con vLLM 0.30.0 sobre NVIDIA GeForce RTX 3090:

| Métrica | vLLM int8 | vLLM fp16 | Transformers int8 | Transformers fp16 |
|---|---:|---:|---:|---:|
| Perplejidad | 9,7210 | 9,5795 | 10,0674 | 9,5791 |
| Prefill tok/s | 41.765,3 | 22.615,8 | 24.379,2 | 20.487,2 |
| Decode tok/s, batch 1 | 260,7 | 208,5 | 5,9 | 14,3 |
| Decode tok/s, batch 16 | 3.715,8 | 2.618,9 | 87,3 | 222,8 |
| Pico de VRAM (GB) | – | – | 4,68 | 5,84 |

- La build de vLLM presenta un `ppl_ratio` de 1,0148 frente a vLLM fp16, con prefill 1,85× y decode 1,25× (batch 1) y 1,42× (batch 16).
- Frente a Transformers fp16, vLLM int8 logra prefill 2,04×, decode 18,28× en batch 1 y 16,68× en batch 16.
- El artefacto nativo en Transformers decodifica más lento que fp16 (0,41× en batch 1, 0,39× en batch 16); su ventaja en ese entorno es exclusivamente de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,68 GB de pico en Transformers con el artefacto int8 (frente a 5,84 GB en fp16) para ventanas de 2048 tokens.
- GPU recomendadas: NVIDIA A10G (g5.2xlarge) para el benchmark de referencia en Transformers; NVIDIA RTX 3090 para la build de vLLM.
- Cabe en GPU consumer: sí, en tarjetas con al menos 6 GB de VRAM libre (RTX 3060, RTX 4060, RTX 2070 y superiores). La build de vLLM está validada en RTX 3090.
- Opciones de despliegue: vLLM (recomendado, mediante `chris320211/smoothquant-qwen25-15b-g52xlarge-vllm`), o Transformers 4.46.3 con torch 2.7.1+cu128 y el adaptador `quant_agent_inference_adapter.py`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: en vLLM int8 sobre RTX 3090, 260,7 tok/s de decodificación en batch 1 y 3.715,8 tok/s en batch 16; prefill de 41.765,3 tok/s. En Transformers int8 el rendimiento es mucho menor (5,9 tok/s en batch 1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Formato de despliegue |
|---|---|---:|---:|---|---|
| SmoothQuant Qwen2.5-1.5B (este) | 1,78B | no disponible | 10,07 (Transformers int8) / 9,72 (vLLM int8) | Apache 2.0 | safetensors empaquetado + adaptador; vLLM nativo |
| Qwen/Qwen2.5-1.5B-Instruct (fp16) | 1,5B | no disponible | 9,58 | Apache 2.0 | safetensors, drop-in en Transformers |
| Qwen2.5-1.5B-Instruct en vLLM fp16 | 1,5B | no disponible | 9,58 | Apache 2.0 | vLLM |

La comparación se limita al modelo base y su ejecución en fp16, ya que la información proporcionada no incluye otras alternativas cuantizadas de la misma categoría. La ventaja de esta variante es la reducción de VRAM (4,68 GB frente a 5,84 GB) y el mayor throughput en vLLM; la desventaja es el aumento de perplejidad (ratio 1,0509 en Transformers, 1,0148 en vLLM) y la complejidad de carga fuera de vLLM.

## Limitaciones y advertencias

- No es un checkpoint drop-in: requiere el adaptador de inferencia incluido y el repositorio del método configurado en `QUANT_AGENT_METHOD_REPO`. `AutoModelForCausalLM.from_pretrained` no funciona directamente.
- Degradación de calidad medible: la perplejidad sube de 9,579 a 10,067 en Transformers (ratio 1,0509) y a 9,721 en vLLM (ratio 1,0148). Aceptable para muchas tareas, pero relevante en aplicaciones sensibles a la precisión.
- Rendimiento inferior en Transformers: la decodificación es 0,41× la de fp16 en batch 1. Para servir el modelo hay que usar la build de vLLM; en caso contrario, la única ganancia es de memoria.
- Idiomas no declarados: la model card no especifica cobertura lingüística; se hereda la del modelo base, sin garantías documentadas en este repositorio.
- Longitud de contexto no documentada en esta ficha: no se indica explícitamente en la información proporcionada.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasas de alucinación para esta variante; se aplican los riesgos del modelo base Qwen2.5-1.5B-Instruct, no mitigados por la cuantización.
- Licencia: Apache 2.0 heredada, pero se debe conservar también la licencia del repositorio del método QuantPort y los archivos `LICENSE`/`NOTICE.md` del snapshot cuando estén presentes.
- Mantenimiento: repositorio de un autor individual (897 descargas, 1 like), con soporte limitado frente a publicaciones oficiales de Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/smoothquant-qwen25-15b-g52xlarge
- Build nativa para vLLM: https://huggingface.co/chris320211/smoothquant-qwen25-15b-g52xlarge-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Repositorio del método QuantPort: https://github.com/chris320211/QuantPort
