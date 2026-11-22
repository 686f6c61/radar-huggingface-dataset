# PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4

## Resumen
Aion-1.0-Instruct-2.3B-NVFP4 es una cuantizacion NVFP4 (W4A4, pesos y activaciones en 4 bits) del modelo instructivo Aion-1.0-Instruct-2.3B de Microsoft, publicada por PureTensorAI. El checkpoint reduce el peso en disco de 4,58 GB (BF16) a 1,88 GB, lo que facilita el despliegue en GPUs de gama media y consumer. Se distribuye como una version de prueba, sin afiliacion ni respaldo por parte de Microsoft.

El modelo base es un transformer denso de 2.288.831.488 parametros (2,3B) con licencia MIT, orientado a generacion de texto conversacional. La cuantizacion se realizo con GPTQ sobre las capas `Linear` de los 28 bloques del transformer, manteniendo en BF16 los embeddings, la cabeza de salida atada y todas las normas.

La relevancia de esta ficha radica en que documenta con rigor el coste de calidad de las activaciones en 4 bits: el autor mide una perdida de 2,14 puntos en MMLU y 6,14 puntos en GSM8K frente a BF16, ambas estadisticamente significativas. El propio autor recomienda su variante hermano de solo pesos (NVFP4A16) salvo que se necesiten activaciones de 4 bits por motivos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (28 bloques), `AionForCausalLM` con `custom_code` |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 `nvfp4-pack-quantized` (W4A4): valores E2M1 de 4 bits, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con `block_size` 128, `dampening_frac` 0.01, `actorder` static |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `compressed-tensors` (repo de 1,9 GB) |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 28 bloques con embeddings de tokens y cabeza de salida atada. La cuantizacion se aplico a todas las capas `Linear` de los 28 bloques, tanto pesos como activaciones de entrada en 4 bits, dejando en BF16 los embeddings, la cabeza atada y las normas. El formato es `compressed-tensors` `nvfp4-pack-quantized`, con una escala FP8 E4M3 por grupo de 16 valores y una escala FP32 por tensor.

El proceso de cuantizacion uso GPTQ con 512 muestras de calibracion de `mlabonne/open-perfectblend` de hasta 2.048 tokens cada una, con las herramientas llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. El autor advierte de que 180 de las 512 muestras de calibracion son problemas matematicos (MetaMathQA y Orca-Math) y 75 provienen de UltraChat, la misma familia que el conjunto de evaluacion de chat, por lo que las columnas de GSM8K y chat pueden favorecer a las filas GPTQ. No se dispone de informacion sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento y matematicas a nivel basico-intermedio: GSM8K con 55,12 de exact match en esta cuantizacion.
- Conocimiento general medido en MMLU con 52,74 de accuracy.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue en GPUs consumer con poca VRAM: el checkpoint de 1,88 GB permite cargar el modelo en tarjetas de 8 GB o menos, dejando margen para el contexto y el KV cache, algo inviable con los 4,58 GB en BF16.
- Prototipado rapido de asistentes conversacionales: la plantilla de chat y la licencia MIT permiten iterar sobre prompts y flujos multi-turno sin coste de licencia.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta MMLU, GSM8K, perplejidad y divergencia KL frente a BF16, lo que lo convierte en un caso de referencia para estudiar el impacto de W4A4.
- Generacion de texto en entornos con memoria limitada: resumenes, reescritura y respuestas cortas donde una perdida de 2 puntos en MMLU es aceptable y el ahorro de memoria es prioritario.
- Educacion e investigacion: al ser un modelo pequeno y de licencia permisiva, sirve para experimentos de ajuste fino o de interpretabilidad en laboratorios con recursos modestos.
- Tareas de matematicas escolares con tolerancia a errores: GSM8K al 55,12 % es suficiente para asistentes de practica con verificacion humana, pero no para evaluacion automatica de alta fiabilidad.
- No recomendado para pipelines de produccion que exijan paridad con BF16 en razonamiento matematico, dado el descenso de 6,14 puntos en GSM8K.

## Benchmarks y rendimiento
Resultados medidos por el autor con lm-evaluation-harness 0.4.13, sin plantilla de chat para MMLU y GSM8K, y comparados contra el modelo BF16 de referencia.

| Metrica | BF16 | Este checkpoint (W4A4) | Cambio |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas) | 54,88 | 52,74 | -2,14 |
| GSM8K, exact match (1.319 problemas) | 61,26 | 55,12 | -6,14 |
| WikiText-2, perplejidad (131.072 tokens) | 11,39 | 12,28 | +0,89 |

Alineacion con BF16 token a token:

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 131.072 | 0,095 | 0,71 | 84,7 % |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones) | 224.534 | 0,077 | 0,58 | 86,7 % |

Comparativa interna de variantes NVFP4 construidas por el autor:

| Variante | Activaciones | MMLU | GSM8K | KL wiki | KL chat |
|---|---|---:|---:|---:|---:|
| BF16 referencia | 16-bit | 54,88 | 61,26 | 0 | 0 |
| GPTQ (este checkpoint) | 4-bit | 52,74 | 55,12 | 0,095 | 0,077 |
| GPTQ, solo pesos (NVFP4A16) | 16-bit | 54,60 | 61,33 | 0,039 | 0,022 |
| Round-to-nearest | 4-bit | 50,55 | 45,56 | 0,175 | 0,327 |
| Expanded MSE scales | 4-bit | 50,67 | 47,31 | 0,148 | 0,311 |
| Round-to-nearest, solo pesos | 16-bit | 52,65 | 50,34 | 0,098 | 0,281 |
| Expanded MSE scales, solo pesos | 16-bit | 52,32 | 53,37 | 0,098 | 0,263 |

Pruebas de McNemar por pregunta frente a BF16: MMLU 1.058 preguntas perdidas y 758 ganadas (p = 2e-12); GSM8K 166 perdidas y 85 ganadas (p = 4e-7). El autor senala que su MMLU BF16 (54,88) esta cerca del 55,15 de la model card del modelo base, pero que su configuracion de GSM8K difiere de la del autor original.

## Requisitos de hardware
- VRAM estimada para inferencia: alrededor de 2 GB para los pesos en disco (1,88 GB) mas el KV cache y las activaciones; en la practica, cabe en GPUs de 8 GB con contexto moderado.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion proporcionada. El checkpoint usa NVFP4, por lo que el maximo rendimiento depende de hardware con soporte nativo de FP4 (por ejemplo, GPUs de la generacion Blackwell); el autor advierte de que no hay servicio nativo de FP4 documentado en la model card.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas; el modelo BF16 original de 4,58 GB tambien cabe en 8 GB pero con menos margen.
- Opciones de despliegue: `transformers` con `compressed-tensors` y `trust_remote_code=True` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Aion-1.0-Instruct-2.3B-NVFP4 (este) | 2,3B | no disponible | 52,74 | 55,12 | MIT | Hugging Face, 36 descargas |
| Aion-1.0-Instruct-2.3B-NVFP4A16 (hermano, solo pesos) | 2,3B | no disponible | 54,60 | 61,33 | MIT | Hugging Face |
| Aion-1.0-Instruct-2.3B BF16 (base) | 2,3B | no disponible | 54,88 | 61,26 | MIT | Hugging Face (Microsoft) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- Perdida de calidad medible y estadisticamente significativa frente a BF16: -2,14 puntos en MMLU y -6,14 en GSM8K, con pruebas de McNemar que descartan que sea ruido.
- El autor recomienda la variante NVFP4A16 (solo pesos) salvo que se necesiten activaciones de 4 bits, porque es estadisticamente indistinguible de BF16 en los mismos benchmarks.
- Sesgo de calibracion: 180 de las 512 muestras son problemas matematicos y 75 provienen de UltraChat, lo que puede inflar las columnas de GSM8K y chat del GPTQ.
- No hay servicio nativo de FP4 documentado; el rendimiento puede degradarse si el hardware no soporta NVFP4 de forma nativa.
- Requiere `trust_remote_code=True` y la dependencia `compressed-tensors`, lo que anade superficie de ataque y complejidad de despliegue.
- Es una version de prueba, no afiliada ni respaldada por Microsoft; no debe tratarse como un lanzamiento oficial.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a un modelo de 2,3B.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue.
- Longitud de contexto: no disponible; no se puede planificar el uso en tareas de contexto largo.
- Licencia MIT: permite uso comercial, pero el aviso de perdida de calidad debe tenerse en cuenta en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4
- Variante hermano solo pesos (NVFP4A16): https://huggingface.co/PureTensorAI/Aion-1.0-Instruct-2.3B-NVFP4A16
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia del modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
- Dataset de calibracion: `mlabonne/open-perfectblend` (referenciado en la model card, sin URL explicita)
- Herramientas citadas: llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0, torch 2.14.1 (sin URL explicita)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
