# PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4A16

## Resumen

Aion-1.0-Instruct-2.3B-NVFP4A16 es una versión cuantizada a 4 bits del modelo instructivo `microsoft/Aion-1.0-Instruct-2.3B`, publicada por PureTensorAI. Se trata de un checkpoint de pesos en formato NVFP4 (4 bits E2M1 con escalas FP8 E4M3 por grupo de 16 y una escala FP32 por tensor), generado mediante GPTQ sobre los pesos BF16 originales. Las activaciones permanecen en 16 bits (esquema W4A16), de modo que el archivo resultante ocupa 1,88 GB frente a los 4,58 GB del BF16.

El modelo base es un transformer de 2.288.831.488 parámetros (aproximadamente 2,3 mil millones), orientado a generación de texto conversacional. La cuantización se aplica a todas las capas `Linear` de los 28 bloques del transformer, dejando en BF16 los embeddings, la cabeza de salida atada, todas las normalizaciones y las activaciones.

La relevancia de esta ficha radica en que el autor documenta con detalle el impacto de la cuantización: sobre MMLU y GSM8K completos el checkpoint es estadísticamente indistinguible del BF16, con una coincidencia del 90,3 % en el siguiente token sobre WikiText-2 y del 92,8 % sobre conversaciones de chat. Es una release de prueba, sin afiliación con Microsoft, y su interés principal es práctico: permite ejecutar un modelo de 2,3B en GPUs con poca VRAM manteniendo la calidad del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (28 bloques), modelo base `microsoft/Aion-1.0-Instruct-2.3B` |
| Parametros totales | 2.288.831.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4 bits E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con `block_size` 128, `dampening_frac` 0.01, `actorder` static |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo instructivo de Microsoft, no un entrenamiento nuevo. La arquitectura subyacente es un transformer de 28 bloques con 2,29B parámetros; los detalles de composición del dataset original, número de tokens y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta release es el pipeline de cuantización: GPTQ aplicado con `llm-compressor` 0.15.0 y `compressed-tensors` 0.20.1 sobre 512 muestras de calibración de `mlabonne/open-perfectblend` (hasta 2.048 tokens cada una), cuantizando únicamente los pesos de las capas `Linear` e ignorando `lm_head`. El autor compara además varias configuraciones alternativas (activaciones de 4 bits en distintos subconjuntos de capas, round-to-nearest y búsqueda de escalas MSE) y concluye que GPTQ aporta mucho más que la búsqueda de escalas, y que a este tamaño las activaciones en 4 bits degradan más la calidad que los pesos en 4 bits.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat propia (`apply_chat_template`).
- Razonamiento y matemáticas: evaluado en MMLU (14.042 preguntas) y GSM8K (1.319 problemas) con resultados prácticamente idénticos al BF16.
- Comprensión de lenguaje general y perplejidad baja en WikiText-2.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue en GPUs de consumo: con 1,88 GB de pesos, el modelo cabe en tarjetas de 4-8 GB de VRAM, lo que permite prototipar asistentes conversacionales en equipos de desarrollo sin GPU de datacenter.
- Atención al cliente automatizada: modelo instructivo con plantilla de chat y coincidencia del 92,8 % en el siguiente token respecto al BF16 sobre conversaciones de UltraChat, adecuado para conversaciones multi-turno de baja latencia.
- Evaluación de pipelines de cuantización: sirve como referencia práctica para medir el impacto de GPTQ W4A16 frente a BF16 en una tarea concreta, con métricas de KL y acuerdo por token ya publicadas.
- Generación de texto en entornos con memoria limitada: el ahorro de 4,58 GB a 1,88 GB permite servir varias instancias en una sola GPU o ejecutar el modelo junto a otros componentes en el mismo dispositivo.
- Razonamiento matemático ligero: los resultados de GSM8K (61,33 exact match) lo hacen utilizable para resolución de problemas aritméticos de varios pasos en herramientas educativas o de cálculo asistido.
- Servicio de inferencia de bajo coste: al mantener las activaciones en 16 bits, se puede integrar en stacks basados en `transformers` con `compressed-tensors` sin renunciar a la precisión numérica de las activaciones, útil para despliegues en CPU-GPU híbridos o con presupuesto de VRAM ajustado.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, comparando BF16 y este checkpoint:

| Metrica | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 54,88 | 54,60 | -0,28 | 541 perdidas, 502 ganadas, p = 0,24 |
| GSM8K, exact match (1.319 problemas) | 61,26 | 61,33 | +0,07 | 91 perdidas, 92 ganadas, p = 1,0 |
| WikiText-2, perplejidad (131.072 tokens) | 11,39 | 11,73 | +0,34 | — |

Acuerdo con BF16 token a token:

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top |
|---|---:|---:|---:|---:|
| WikiText-2 test | 131.072 | 0,039 | 0,31 | 90,3 % |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones) | 224.534 | 0,022 | 0,16 | 92,8 % |

Comparativa con otras variantes 4 bits construidas por el mismo autor:

| Variante | Activaciones 4 bits en | MMLU | GSM8K | KL wiki | KL chat |
|---|---|---:|---:|---:|---:|
| BF16 referencia | ninguna | 54,88 | 61,26 | 0 | 0 |
| GPTQ solo pesos (este checkpoint) | ninguna | 54,60 | 61,33 | 0,039 | 0,022 |
| GPTQ mixto | `q_proj`, `k_proj` | 54,31 | 60,65 | 0,045 | 0,027 |
| GPTQ mixto | `q_proj`, `k_proj`, `o_proj` | 54,37 | 59,29 | 0,055 | 0,034 |
| GPTQ mixto | `q_proj`, `k_proj`, `o_proj`, `down_proj` | 54,02 | 57,62 | 0,064 | 0,042 |
| GPTQ W4A4 (repo hermano) | todas las capas | 52,74 | 55,12 | 0,095 | 0,077 |
| Round-to-nearest solo pesos | ninguna | 52,65 | 50,34 | 0,098 | 0,281 |
| Escalas MSE expandidas solo pesos | ninguna | 52,32 | 53,37 | 0,098 | 0,263 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,88 GB; con activaciones en 16 bits y caché KV, un despliegue cómodo requiere del orden de 3-5 GB de VRAM, aunque el autor no publica una cifra oficial.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar los pesos.
- GPU de consumo: sí, cabe en tarjetas consumer de gama media y alta con suficiente VRAM; no se especifican modelos concretos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, `compressed-tensors` y `llm-compressor` (stack con el que se generó). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (NVFP4A16) | 2,29B | no disponible | 54,60 | 61,33 | MIT | Hugging Face |
| `microsoft/Aion-1.0-Instruct-2.3B` (BF16) | 2,29B | no disponible | 54,88 | 61,26 | MIT | Hugging Face |
| `PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4` (W4A4) | 2,29B | no disponible | 52,74 | 55,12 | MIT | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una release de prueba y no está afiliada ni respaldada por Microsoft.
- Requiere `trust_remote_code=True` y la librería `compressed-tensors`; no funciona con un `transformers` estándar sin ese soporte.
- Los resultados de MMLU y GSM8K no son idénticos al BF16: el modelo elige el mismo siguiente token aproximadamente el 90 % de las veces, por lo que puede divergir en generaciones largas.
- Advertencia del propio autor sobre la calibración: de las 512 muestras, 180 son problemas matemáticos (MetaMathQA y Orca-Math) y 75 provienen de UltraChat, la misma familia que el conjunto de evaluación de chat; las columnas de GSM8K y chat pueden favorecer a las filas GPTQ. Las columnas de MMLU y WikiText no están relacionadas con los datos de calibración.
- Los resultados de GSM8K no son directamente comparables con los de la model card del modelo base, cuyo setup difiere.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados: no declarados; no se garantiza cobertura multilingüe.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base de Microsoft; conviene revisar el enlace de licencia del modelo original.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4A16
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia del modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
- Variante W4A4 (repo hermano): https://huggingface.co/PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4
- Dataset de calibración: `mlabonne/open-perfectblend`
- Dataset de evaluación de chat: `HuggingFaceH4/ultrachat_200k`
- Herramientas: `llm-compressor` 0.15.0, `compressed-tensors` 0.20.1, `transformers` 5.21.0, `torch` 2.14.1, lm-evaluation-harness 0.4.13
