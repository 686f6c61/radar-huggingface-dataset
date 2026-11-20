# puretensor/Aion-1.0-Instruct-2.3B-NVFP4A16

## Resumen

Aion-1.0-Instruct-2.3B-NVFP4A16 es una cuantizacion de 4 bits de los pesos del modelo instructivo `microsoft/Aion-1.0-Instruct-2.3B`, publicada por PureTensor. Se trata de un checkpoint de prueba (W4A16: pesos en 4 bits, activaciones en 16 bits) generado con GPTQ sobre los pesos BF16 oficiales, empaquetado en el formato `nvfp4-pack-quantized` de compressed-tensors. El resultado ocupa 1,88 GB frente a los 4,58 GB del BF16 original, una reduccion de aproximadamente el 59 % del espacio en disco.

El modelo base es un transformer de 2.288.831.488 parametros (2,3B) con 28 bloques y licencia MIT, orientado a generacion de texto conversacional. La cuantizacion aplica valores de 4 bits en formato E2M1 con una escala FP8 E4M3 por grupo de 16 elementos y una escala FP32 por tensor, manteniendo en BF16 los embeddings, la cabeza de salida atada, las normas y todas las activaciones.

La relevancia de esta ficha es doble: por un lado, demuestra que una cuantizacion GPTQ solo de pesos en NVFP4 conserva practicamente la calidad del modelo BF16 en este tamano (diferencias no significativas en MMLU y GSM8K); por otro, advierte de que ninguna engine de inferencia soporta aun de forma nativa esta arquitectura, lo que limita su uso en produccion a transformers con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (28 bloques), modelo base `microsoft/Aion-1.0-Instruct-2.3B` con `custom_code` |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4 bits E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ `block_size` 128, `dampening_frac` 0.01, `actorder` static |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); repo de 1,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 28 bloques con 2,3B parametros. La version cuantizada conserva la arquitectura intacta y solo modifica los pesos de cada capa `Linear` de los 28 bloques, que pasan a 4 bits. Permanecen en BF16 los embeddings de tokens, la cabeza de salida atada (`lm_head` ignorada en la receta), todas las normas y todas las activaciones, de ahi la denominacion W4A16.

La cuantizacion se realizo con GPTQ usando 512 muestras de `mlabonne/open-perfectblend` de hasta 2.048 tokens cada una, con las herramientas llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. El checkpoint guardado se recargo desde disco y se verifico que coincide exactamente con el modelo cuantizado en memoria (logits identicos en 4.096 tokens). No se realizo entrenamiento adicional ni ajuste fino: es una compresion post-entrenamiento de los pesos BF16 oficiales.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (`apply_chat_template`).
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU completo, 14.042 preguntas).
- Razonamiento matematico de varios pasos (evaluado en GSM8K completo, 1.319 problemas).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Requiere `trust_remote_code=True` y la dependencia `compressed-tensors` para cargar el modelo.

## Casos de uso

- Despliegue en GPU de gama consumer con VRAM limitada: el checkpoint de 1,88 GB permite cargar el modelo en tarjetas de 8 GB o incluso menos, dejando margen para el contexto y el cache KV, algo imposible con los 4,58 GB del BF16.
- Prototipado de asistentes conversacionales: la plantilla de chat y la calidad practicamente identica al BF16 lo hacen adecuado para iterar sobre prompts y flujos multi-turno sin penalizacion medible en MMLU ni GSM8K.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia W4A16 frente a la variante W4A4 del mismo autor (`puretensor/Aion-1.0-Instruct-2.3B-NVFP4`) para estudiar el impacto de cuantizar activaciones en modelos de ~2B.
- Investigacion sobre formatos NVFP4: util para medir en un harness propio la divergencia KL y la tasa de coincidencia de token top-1 frente al BF16 (90,3 % en WikiText-2, 92,8 % en chat).
- Entornos con restricciones de almacenamiento o ancho de banda: la reduccion de 4,58 GB a 1,88 GB facilita la distribucion del modelo en contenedores o nodos con disco limitado.
- Tareas de generacion de texto de baja latencia en una sola GPU: al ser un modelo de 2,3B, el coste por token es bajo y la cuantizacion reduce el trafico de memoria de los pesos.
- Educacion y experimentacion: la licencia MIT y el tamano reducido permiten usarlo en cursos y laboratorios sin coste de licencia.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, sin plantilla de chat, comparando BF16 y este checkpoint:

| Metrica | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 54,88 | 54,60 | -0,28 | 541 perdidas, 502 ganadas, p = 0,24 |
| GSM8K, exact match (1.319 problemas) | 61,26 | 61,33 | +0,07 | 91 perdidas, 92 ganadas, p = 1,0 |
| Perplejidad WikiText-2 (131.072 tokens) | 11,39 | 11,73 | +0,34 | - |

Acuerdo token a token con BF16:

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 131.072 | 0,039 | 0,31 | 90,3 % |
| Chat (`HuggingFaceH4/ultrachat_200k`, test_sft, 256 conversaciones) | 224.534 | 0,022 | 0,16 | 92,8 % |

Comparativa con otras variantes de 4 bits construidas por el mismo autor:

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

- VRAM estimada para inferencia: el checkpoint pesa 1,88 GB; con cache KV y margen operativo, cabe en GPUs de 8 GB o inferiores segun longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte de operaciones de 4 bits empaquetadas; no hay lista oficial en la informacion proporcionada.
- Cabe en GPU consumer: si, por tamano de pesos, aunque el soporte de kernels NVFP4 en consumer no esta confirmado en la informacion disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `compressed-tensors` instalado. No hay implementacion nativa en vLLM en el momento de la publicacion; llama.cpp, Ollama y TGI no estan confirmados como soportados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| puretensor/Aion-1.0-Instruct-2.3B-NVFP4A16 (este) | 2,3B | no disponible | MIT | safetensors NVFP4A16 | W4A16, GPTQ, MMLU 54,60 |
| puretensor/Aion-1.0-Instruct-2.3B-NVFP4 | 2,3B | no disponible | MIT | safetensors NVFP4 | W4A4, MMLU 52,74, GSM8K 55,12 |
| microsoft/Aion-1.0-Instruct-2.3B (BF16) | 2,3B | no disponible | MIT | safetensors BF16 | Referencia, MMLU 54,88, GSM8K 61,26 |

## Limitaciones y advertencias

- Ninguna engine de inferencia sirve esta arquitectura de forma nativa en el momento de la publicacion; el uso queda restringido a transformers con `trust_remote_code=True`.
- Es una version de prueba, no afiliada ni respaldada por Microsoft.
- Las salidas no son identicas al BF16: coincide en el token top-1 aproximadamente el 90 % de las veces, lo que puede importar en tareas deterministas o de evaluacion estricta.
- GPTQ se calibro con datos de estilo chat, por lo que parte de su ventaja en la columna de chat puede deberse a ese sesgo; la columna WikiText-2 no esta afectada por la calibracion.
- La cuantizacion de activaciones a 4 bits degrada mas la calidad que la de pesos en este tamano; este checkpoint evita ese problema al mantener activaciones en 16 bits.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base (`microsoft/Aion-1.0-Instruct-2.3B`, tambien MIT) y las condiciones de los datos de calibracion (`mlabonne/open-perfectblend`) si se redistribuye.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puretensor/Aion-1.0-Instruct-2.3B-NVFP4A16
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia del modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
- Variante W4A4 (repo hermano): https://huggingface.co/puretensor/Aion-1.0-Instruct-2.3B-NVFP4
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
