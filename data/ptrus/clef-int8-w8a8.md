# ptrus/clef-int8-w8a8

## Resumen

Clef int8 W8A8 es una cuantización de 8 bits (pesos y activaciones) del modelo multimodal Cloudflare/clef, publicada por el usuario ptrus. El objetivo es ofrecer una versión del modelo base apta para aceleradores cuyo camino rápido de baja precisión es int8, reduciendo el peso del repositorio de 51 GB a aproximadamente 29 GB sin recalibrar en tiempo de inferencia. Se distribuye bajo licencia Apache-2.0, heredada del modelo original.

El modelo conserva la arquitectura del base (etiquetado como qwen3_5 en los tags de Hugging Face) y mantiene sin cuantizar los componentes sensibles: embeddings, normas, LM head, torre de visión y cabecera conjunta. Solo se cuantizan las 256 proyecciones grandes del modelo de lenguaje, lo que permite un equilibrio entre ahorro de memoria y fidelidad respecto al bf16 original.

La relevancia de esta ficha radica en que el checkpoint no usa un formato de cuantización estándar de transformers: requiere un motor que implemente la capa descrita en la model card, o bien dequantizar a bf16 mediante el script incluido. Con 3.029.765.360 parámetros totales y un pipeline image-text-to-text, está pensado para despliegues de inferencia multimodal en hardware con soporte int8 nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag qwen3_5; incluye atención lineal y MLP en el LM, más torre de visión |
| Parametros totales | 3.029.765.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 (pesos simétricos int8, un escala por canal de salida; activaciones int8 simétricas dinámicas, una escala por token; SmoothQuant con alpha = 0.6); resto de tensores en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards `int8-0000N.safetensors` con `w8` int8, `scale` fp32 y `recip` fp32; más `model-*.safetensors` bf16 para los tensores no cuantizados) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con torre de visión y un modelo de lenguaje que combina proyecciones de atención, atención lineal y MLP. La cuantización actúa sobre las 256 proyecciones grandes del LM: q/k/v/o de atención, proyecciones de entrada y salida de atención lineal, y gate/up/down del MLP (gate y up apilados). El resto de tensores permanece en bf16 tal como se publicó. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica principal es el esquema SmoothQuant con alpha = 0.6: un factor por canal de entrada `s` divide las activaciones y multiplica los pesos (`X/s · Ws == X · W`), trasladando el rango dinámico de las activaciones a los pesos. Los factores se obtienen de máximos de activación por canal registrados sobre un conjunto pequeño de prompts sintéticos. La capa calcula `y = ((round(x · recip / a)) @ w8) · a · scale`, con `a = max|x · recip| / 127` por token. No se ha realizado un proceso de entrenamiento o fine-tuning adicional: es una conversión post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional, heredado del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante la torre de visión, que se mantiene en bf16.
- Cuantización int8 de pesos y activaciones para aceleradores con camino rápido int8.
- Inferencia dinámica de activaciones: no requiere calibración en tiempo de ejecución.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue multimodal en aceleradores int8: el checkpoint está pensado para motores cuya ruta rápida de baja precisión es int8, reduciendo el uso de memoria frente al bf16 (29 GB frente a 51 GB) en tareas de imagen-texto.
- Servicio de descripción de imágenes y respuesta a preguntas visuales: la torre de visión se mantiene en bf16, por lo que se preserva la calidad de la codificación visual mientras el LM se ejecuta en int8.
- Evaluación de fidelidad de cuantización: útil para comparar el impacto de int8 W8A8 frente a FP8 o NVFP4 sobre tareas de clasificación y QA (ARC-Challenge, BANKING77, BoolQ, CLINC150, MMLU, When2Call).
- Investigación en compresión de modelos: el formato de capa documentado y `dequantize.py` permiten estudiar el efecto del redondeo de pesos y de activaciones por separado.
- Prototipado de asistentes conversacionales multimodales en entornos con VRAM limitada, usando el script de dequantización para volver a bf16 si el motor no soporta el formato.
- Integración en pipelines de transformers: al conservar los ficheros bf16 no cuantizados y el índice `model.safetensors.index.json`, se puede reconstruir un modelo bf16 aproximado para pruebas en frameworks estándar.

## Benchmarks y rendimiento

Resultados de fidelidad frente al modelo bf16, medidos con Level5Tech/clef-quant-bench (21.174 preguntas; ARC-Challenge, BANKING77, BoolQ, CLINC150, MMLU, When2Call). Un "flip" es una pregunta cuya respuesta principal difiere de la del modelo bf16.

| Configuracion | Respuestas alteradas | Cambio de exactitud |
|---|---|---|
| Segundo motor bf16 (ruido de base) | 0,29 % | -0,02 pp |
| FP8 (publicado) | 0,94 % | -0,04 pp |
| Este checkpoint (int8 W8A8) | 1,22 % | -0,13 pp |
| NVFP4 simple (publicado) | 2,83 % | -0,52 pp |

No se han publicado resultados de MMLU, HumanEval o GSM8K absolutos en la información disponible; solo se ofrecen deltas relativos al modelo bf16.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 30,7 GB; para inferencia int8 se requiere un motor que implemente la capa descrita, con memoria suficiente para pesos int8 más activaciones y estado (orientativamente por encima de 30 GB, dato no confirmado en la información).
- GPU recomendadas: aceleradores con soporte int8 nativo; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: no disponible; el tamaño de pesos (29 GB en int8) supera la VRAM de la mayoría de GPU consumer actuales.
- Opciones de despliegue: transformers con un motor que implemente el formato de capa; `dequantize.py` para reconstruir bf16 y usar llama.cpp, vLLM, TGI u Ollama, aunque estos no se han validado en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ptrus/clef-int8-w8a8 | 3,03 B | no disponible | int8 W8A8 (SmoothQuant) | Apache-2.0 | Hugging Face |
| Cloudflare/clef (bf16) | no disponible | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Clef FP8 (referencia del benchmark) | no disponible | no disponible | FP8 | no disponible | no disponible |
| Clef NVFP4 (referencia del benchmark) | no disponible | no disponible | NVFP4 | no disponible | no disponible |

No se dispone de datos de parámetros ni contexto de las variantes FP8 y NVFP4 más allá de sus resultados de fidelidad publicados en el benchmark.

## Limitaciones y advertencias

- El formato de pesos no es un formato estándar de cuantización de transformers; cargarlo para inferencia int8 requiere un motor que implemente la capa descrita. `dequantize.py` solo reproduce el redondeo de pesos, no el de activaciones.
- La fidelidad medida implica un 1,22 % de respuestas alteradas y una pérdida de 0,13 pp de exactitud frente al bf16 en el conjunto evaluado; en dominios fuera de ese benchmark el impacto puede diferir.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El modelo no ha sido evaluado en MMLU, HumanEval o GSM8K absolutos en la información disponible; no se deben inferir rendimientos absolutos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `LICENSE` y `NOTICE` del repositorio por posibles avisos adicionales.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La longitud de contexto no está documentada; no se debe asumir una ventana concreta sin consultar el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/ptrus/clef-int8-w8a8
- Modelo base: https://huggingface.co/Cloudflare/clef
- Benchmark de cuantización: https://github.com/Level5Tech/clef-quant-bench
