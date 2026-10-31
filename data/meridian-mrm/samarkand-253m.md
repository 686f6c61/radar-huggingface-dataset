# Meridian-MRM/Samarkand-253m

## Resumen

Samarkand-253M es un modelo lingüístico base (base model) de 253,6 millones de parámetros desarrollado por Meridian-MRM, entrenado desde cero en JAX/Flax NNX sobre la arquitectura de TPU de Google (concretamente una TPU v5e de 8 chips). Su rasgo más distintivo es que se trata de un proyecto de entrenamiento "de la pila completa": arquitectura propia, tokenizador BPE a nivel de byte de 30.002 tokens personalizado y datos de entrenamiento limitados a dos corpora públicos de alta calidad (FineWeb-Edu y DCLM), sin conjuntos de benchmark contaminados según declara el autor.

El modelo responde a un problema habitual en la investigación de modelos pequeños: la falta de modelos base pequeños, abiertos y completamente reproducibles que sirvan como punto de partida para experimentos de ablación, fine-tuning y estudio de escalado. Al estar almacenado en el layout de Qwen3, es compatible directamente con `Qwen3ForCausalLM` en transformers y con la arquitectura `qwen3` en llama.cpp, lo que facilita enormemente su adopción.

Es relevante ahora porque los modelos pequeños (sub-500M) están ganando interés para inferencia en dispositivos locales, edge y como modelos borrador (draft) en decodificación especulativa. Es un modelo base: no está afinado con instrucciones y no incluye plantilla de chat, por lo que su uso directo es la predicción de texto y el fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (layout Qwen3), GQA, SwiGLU, QK-norm, RoPE |
| Parametros totales | 253.556.096 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | f16 (GGUF); pesos originales en fp32/safetensors |
| Idiomas soportados | Inglés (entrenado solo con datos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (`Samarkand-253m-f16.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto: 26 capas, `d_model` de 896, 14 cabezas de atención con 2 cabezas KV (Grouped Query Attention), `head_dim` de 64, FFN SwiGLU con `d_ff` de 2560, QK-norm, codificación posicional RoPE con theta 10000 y embeddings atados (tied embeddings). El vocabulario es de 30.002 tokens con un tokenizador BPE a nivel de byte entrenado a medida. El contexto es de 2048 tokens, modesto pero coherente con el tamaño del modelo.

El entrenamiento se realizó desde cero en JAX/Flax NNX sobre una TPU v5e (8 chips para entrenamiento), con lotes de 131.072 tokens por paso, optimizador AdamW con LR pico de 1e-3 y planificación warmup-stable-decay. Los datos provienen exclusivamente de FineWeb-Edu y DCLM-baseline-1.0. El autor describe una estrategia de mid-training consistente en gestionar manualmente la proporción de datos DCLM frente a FineWeb-Edu para preservar la calidad educativa del segundo manteniendo la cobertura general. No se menciona RLHF, DPO ni SFT: es un modelo base puro. No se ha publicado el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto continuo en inglés como modelo base (completamiento de texto, no diálogo).
- Comprensión del lenguaje con resultados razonables en tareas de sentido común y conocimiento científico básico (PIQA 67,25 %, SciQ 79,20 %).
- Modelado gramatical sólido para su tamaño: 81,39 % en BLiMP.
- Perplejidad de 29,71 en WikiText-2, indicativa de un modelado de lenguaje funcional.
- Compatibilidad con el ecosistema Qwen3: carga directa en transformers y llama.cpp.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no está afinado con instrucciones.
- No incluye capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Idioma: solo inglés; no es multilingüe.

## Casos de uso

- Modelo borrador para decodificación especulativa: su pequeño tamaño (253M) y su vocabulario compatible con la familia Qwen3 lo hacen candidato natural como draft model para acelerar la inferencia de modelos Qwen3 más grandes, reduciendo la latencia sin perder calidad.
- Investigación y ablaciones: al ser un modelo base entrenado desde cero con datos públicos documentados, es idóneo para estudiar el efecto de mezclas de datos (FineWeb-Edu frente a DCLM), schedules de LR o cambios arquitectónicos en modelos pequeños.
- Fine-tuning en dominios concretos: se puede ajustar con LoRA o full fine-tuning sobre hardware modesto para tareas de clasificación, extracción o generación especializada en inglés.
- Experimentación en CPU y edge: con 253M de parámetros en GGUF f16 (unos 500 MB), corre fluidamente en portátiles y Raspberry Pi mediante llama.cpp.
- Prototipado de pipelines de NLP clásicos: completamiento de texto, generación de descripciones cortas o rellenado de plantillas en inglés donde no se requiere instrucción-following.
- Docencia y formación: proyecto de referencia para enseñar el ciclo completo de entrenamiento de un LLM (tokenizador propio, JAX/Flax, TPU, evaluación con lm-evaluation-harness).

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluación zero-shot en fp32 desde los pesos del repositorio, usando lm-evaluation-harness. No verificados por terceros.

| Benchmark | Métrica | Valor |
|---|---|---|
| ARC-Easy | acc / acc_norm | 56,94 / 50,84 |
| ARC-Challenge | acc / acc_norm | 25,26 / 26,96 |
| HellaSwag | acc / acc_norm | 32,68 / 38,15 |
| PIQA | acc / acc_norm | 67,25 / 66,49 |
| WinoGrande | acc | 50,43 |
| OpenBookQA | acc / acc_norm | 19,60 / 32,80 |
| SciQ | acc / acc_norm | 79,20 / 71,50 |
| BLiMP | acc | 81,39 |
| ArithMark-3.0 | acc / acc_norm | 35,10 / 35,50 |
| WikiText-2 | word ppl / byte ppl / bits per byte | 29,71 / 1,8855 / 0,9150 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,5 GB en f16 (GGUF) y alrededor de 1 GB en fp32 con transformers; con cuantización de 4 bits en GGUF, por debajo de 300 MB.
- GPU recomendadas: cualquier GPU moderna es sobrada; corre cómodamente en GPUs de consumo como la RTX 3060 o RTX 4090, e incluso es plenamente viable solo en CPU.
- Consumer GPUs: cabe sin problema en prácticamente cualquier GPU con 2 GB de VRAM o más; también funciona en CPU x86 y ARM.
- Opciones de despliegue: transformers (con `Qwen3ForCausalLM`), llama.cpp (requiere una versión reciente con soporte Qwen3), Ollama (vía GGUF) y text-generation-inference.
- Latencia y throughput: no disponibles; por su tamaño, se espera inferencia muy rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Samarkand-253M | 253,6M | 2048 | Apache 2.0 | Entrenado desde cero en JAX/TPU, layout Qwen3, GGUF f16 |
| Qwen3-0.6B (base) | ~600M | 32768 | Apache 2.0 | Mayor capacidad y contexto, mismo ecosistema de carga |
| SmolLM2-135M | 135M | 2048 | Apache 2.0 | Modelo base pequeño de HuggingFace, similar en filosofía de datos abiertos |

Samarkand-253M se sitúa entre los modelos base abiertos de menos de 500M parámetros; su ventaja diferencial es la trazabilidad completa del entrenamiento (datos, tokenizador y framework documentados) y la compatibilidad directa con el ecosistema Qwen3, aunque su contexto de 2048 tokens es limitado frente a alternativas recientes.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones; usarlo como chatbot sin fine-tuning producirá resultados pobres.
- Entrenado exclusivamente en inglés: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto de solo 2048 tokens, insuficiente para documentos largos o RAG con pasajes extensos.
- Riesgo de alucinación alto, propio de un modelo base pequeño sin afinado; los resultados en benchmarks de razonamiento (ARC-Challenge 25,26 %, OpenBookQA 19,60 %) indican capacidad de razonamiento muy limitada.
- Benchmarks declarados por el autor, no verificados por terceros.
- Sesgos: al entrenarse con FineWeb-Edu y DCLM (corpora web filtrados), hereda los sesgos de dichos datos; no se ha publicado una evaluación de sesgos específica.
- El GGUF requiere una compilación reciente de llama.cpp con soporte de la arquitectura Qwen3.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos de los datasets de entrenamiento para casos de producción sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/Meridian-MRM/Samarkand-253m
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- ArithMark: https://github.com/AxiomicLabs/ArithMark
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
