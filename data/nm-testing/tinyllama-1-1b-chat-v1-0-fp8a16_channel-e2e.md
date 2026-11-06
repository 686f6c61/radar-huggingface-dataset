# nm-testing/TinyLlama-1.1B-Chat-v1.0-FP8A16_channel-e2e

## Resumen

TinyLlama-1.1B-Chat-v1.0-FP8A16_channel-e2e es una versión cuantizada del modelo TinyLlama-1.1B-Chat-v1.0, publicada por el usuario `nm-testing` en Hugging Face. Se trata de un artefacto de pruebas (testing) que aplica cuantización FP8 con escalas por canal (channel-wise) sobre los pesos del modelo original, empaquetada mediante la librería `compressed-tensors`. El modelo base TinyLlama es un transformer decoder-only de 1.100.048.384 parámetros entrenado por el proyecto TinyLlama sobre 3 billones de tokens, y la variante Chat incorpora ajuste fino supervisado y alineación para conversación.

La relevancia de esta ficha es doble: por un lado documenta un checkpoint de 1,2 GB en formato safetensors que sirve como referencia práctica de cuantización FP8 con granularidad por canal; por otro, advierte de que se trata de un repositorio de validación interna (nm-testing) y no de un modelo listo para producción. No hay información publicada sobre licencia, idiomas o pipeline en la ficha de Hugging Face, por lo que muchos campos deben tratarse como no disponibles.

El interés técnico reside en que FP8 (formato de 8 bits en coma flotante, habitualmente E4M3 o E5M2) reduce a la mitad el peso respecto a FP16 manteniendo un rango dinámico superior al de INT8, lo que lo hace atractivo para inferencia en GPUs con soporte nativo (Hopper, Ada Lovelace). La granularidad "channel" indica que las escalas de cuantización se calculan por canal de pesos, lo que reduce el error respecto a escalas por tensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, TinyLlama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat emplea 2048 tokens) |
| Tipos de cuantizacion | FP8 con escalas por canal (channel-wise), formato compressed-tensors |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint deriva de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con la arquitectura estándar de Llama (atención multi-cabeza con RoPE, capas RMSNorm, SwiGLU en el FFN), con 1.100.048.384 parámetros y 22 capas según la configuración pública del modelo base. El entrenamiento del modelo original se realizó sobre aproximadamente 3 billones de tokens, con una fase de preentrenamiento seguida de ajuste fino supervisado y optimización con DPO para la variante Chat. Esta información corresponde al modelo base; el repositorio aquí documentado no aporta detalles adicionales sobre el proceso de entrenamiento.

La innovación de este checkpoint no está en el entrenamiento sino en el post-procesado: se aplica cuantización FP8 con escalas calculadas por canal de pesos (channel-wise), empaquetada con `compressed-tensors`, el formato de compresión de vLLM y Neural Magic. Esto permite cargar los pesos en kernels FP8 nativos de GPUs Hopper/Ada sin necesidad de recalibrar en tiempo de ejecución, a costa de fijar las escalas en el momento de la conversión. No se dispone de información sobre el dataset de calibración, el número de muestras empleadas ni la metodología exacta de cuantización más allá de lo indicado por el nombre del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste Chat del modelo base.
- Razonamiento básico y respuesta a instrucciones en inglés (idioma predominante del modelo original).
- Generación de código sencillo y tareas de completado de texto.
- Capacidades matemáticas limitadas, propias de un modelo de 1.1B parámetros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de visión, audio ni modo "thinking" explícito.
- Capacidades multilingües no verificadas en este checkpoint; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Validación de pipelines de cuantización FP8: el checkpoint sirve para comprobar que un flujo de conversión con `compressed-tensors` produce pesos cargables en vLLM y que la perplejidad se mantiene respecto al modelo en FP16. Es su propósito declarado como artefacto de testing.
- Pruebas de integración en CI: dado su tamaño reducido (1,2 GB), puede incluirse en suites automatizadas que verifiquen la carga de modelos FP8 sin consumir grandes recursos de GPU.
- Prototipado de chatbots ligeros en entornos con VRAM limitada: al ocupar aproximadamente la mitad que la versión FP16, permite desplegar un asistente conversacional básico en GPUs de gama media para demos internas.
- Benchmarking de kernels FP8: útil para medir throughput y latencia de operadores FP8 en hardware Hopper o Ada frente a implementaciones FP16/BF16.
- Educación y experimentación: sirve para estudiar el impacto de la granularidad channel-wise frente a tensor-wise en modelos pequeños, con coste computacional bajo.
- Generación de texto auxiliar en pipelines de datos: resumen o reformulación de textos cortos en inglés donde no se requiera alta calidad y prime el coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, aproximadamente 1,2 GB solo para pesos; con overhead de activaciones y caché KV, en torno a 2-3 GB para contextos cortos.
- GPU recomendadas: H100, H200, L40S, L4 y RTX 4090/4080 (arquitecturas Hopper y Ada Lovelace con soporte nativo FP8). En GPUs sin soporte FP8 (Ampere, Turing) requeriría emulación o de-cuantización, con menor eficiencia.
- Cabe en GPUs consumer con soporte FP8, como RTX 4090 (24 GB) y RTX 4080 (16 GB), con amplio margen.
- Opciones de despliegue: vLLM es la vía natural por el formato `compressed-tensors`; llama.cpp y Ollama no soportan este formato FP8 de forma directa, por lo que requerirían conversión a GGUF. TGI no está verificado para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-FP8A16_channel-e2e | 1,1B | no disponible | safetensors FP8 (compressed-tensors) | no disponible | Hugging Face (nm-testing) |
| TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 | safetensors BF16 | Apache 2.0 (modelo base) | Hugging Face (TinyLlama) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | safetensors BF16 | Apache 2.0 | Hugging Face (Qwen) |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | safetensors BF16 | Apache 2.0 | Hugging Face (HuggingFaceTB) |

La comparativa se establece frente a alternativas de tamaño similar; el checkpoint aquí documentado se distingue por su cuantización FP8 channel-wise, pero carece de la documentación de licencia e idiomas que sí ofrecen los modelos de referencia.

## Limitaciones y advertencias

- Repositorio de pruebas: el prefijo `nm-testing` y el sufijo `e2e` indican que es un artefacto de validación interna, no un modelo mantenido ni soportado para producción.
- Licencia no declarada en la ficha: aunque el modelo base TinyLlama se publica bajo Apache 2.0, la ausencia de licencia explícita en este repositorio introduce incertidumbre legal para uso comercial.
- Idiomas no documentados: el modelo base está orientado al inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación elevado por el tamaño (1,1B parámetros) y por la cuantización FP8, que puede amplificar errores en tareas sensibles.
- Contexto limitado (2048 tokens en el modelo base), insuficiente para documentos largos o conversaciones extensas.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento avanzado.
- La cuantización FP8 con escalas fijas puede degradar la calidad en dominios alejados del dataset de calibración, que no se documenta.
- Sesgos heredados del corpus de entrenamiento del modelo base (predominantemente web en inglés), no auditados en este checkpoint.
- No apto para despliegue en hardware sin soporte FP8 sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-FP8A16_channel-e2e
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper TinyLlama: https://arxiv.org/abs/2401.02385
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM (soporte compressed-tensors): https://github.com/vllm-project/vllm
