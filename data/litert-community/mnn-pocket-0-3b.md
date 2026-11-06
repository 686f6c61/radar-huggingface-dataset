# litert-community/MNN-Pocket-0.3B

## Resumen

MNN-Pocket-0.3B es un modelo de lenguaje de aproximadamente 300 millones de parámetros desarrollado por el equipo MNN de Taobao (Alibaba), diseñado específicamente para inferencia en dispositivos (on-device) y entornos edge. La versión aquí descrita, `litert-community/MNN-Pocket-0.3B`, es una conversión del modelo original al formato LiteRT-LM de Google AI Edge, realizada con litert-torch 0.10.0 y litert-lm-builder 0.18.1 para LiteRT-LM 0.19.1. El objetivo es ofrecer un modelo conversacional ligero, cuantizado a int8, que quepa y funcione con latencias aceptables en teléfonos móviles y portátiles.

El modelo resuelve el problema de desplegar asistentes conversacionales y extracción de datos en dispositivos sin conexión a la nube, con una huella de memoria reducida (0.3 GB en disco) y soporte para tool calling en formato ChatML. Su relevancia actual radica en que permite pipelines agénticos ligeros y asistentes locales con una ventana de contexto efectiva de 4.096 tokens en la implementación LiteRT-LM, manteniendo una licencia Apache 2.0 permisiva para uso comercial.

La arquitectura subyacente es un transformer denso de 28 capas con 896 de dimensión oculta, 14 cabezas de atención y 2 cabezas KV compartidas (GQA), con embeddings de entrada y salida atados y un vocabulario de 65.536 tokens para chino e inglés. No dispone de bloque de pensamiento separado ni de modo de razonamiento extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (28 capas, hidden size 896, 14 attention heads, 2 KV heads, GQA, embeddings atados) |
| Parametros totales | ~300M (aproximadamente 0.3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens de KV cache en el fichero LiteRT-LM; prefill signatures de 128 y 1.024 tokens; contexto de benchmark configurado a 2.048 tokens |
| Tipos de cuantizacion | int8 (una escala por canal de salida) con activaciones float; fp16 en GPU; existe versión int4 en el runtime MNN original y una versión FP8 de terceros (liodon-ai) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base ofrece GGUF y MNN int4 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 28 capas con dimensión oculta de 896, 14 cabezas de atención y 2 cabezas clave-valor compartidas (grouped-query attention), lo que reduce el coste del KV cache. Los embeddings de entrada y salida comparten la misma matriz, y el vocabulario cubre 65.536 tokens para chino e inglés. El modelo base está etiquetado como derivado de la familia Qwen3 en los tags de Hugging Face, y la conversión LiteRT-LM declara el tipo de modelo `qwen2p5` en el manifiesto.

El modelo original es instruction-tuned y conversacional, con un template ChatML que incluye definiciones de herramientas (tool definitions) y sin bloque de pensamiento separado. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión a LiteRT-LM preserva el `tokenizer.json` byte a byte del repositorio fuente y modifica el chat template en dos puntos (no detallados en la información disponible), e incorpora los stop tokens `<|im_end|>` (65512) y `<|endoftext|>` (65510), además de los parámetros de muestreo del ejemplo de la model card original (top-k 20, top-p 0.8, temperatura 0.8).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Soporte de tool calling / function calling mediante el formato ChatML con definiciones de herramientas.
- Capacidad de extracción de datos estructurados a partir de texto.
- Integración en pipelines agénticos ligeros (lightweight agentic pipelines) según la model card del autor original.
- Sin modo de razonamiento extendido ni bloque de pensamiento separado.
- No recomendado para matemáticas avanzadas ni generación de código de largo alcance.
- No dispone de capacidades de visión ni audio.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Asistentes on-device sin conexión: el modelo puede gestionar conversaciones multi-turno en el propio teléfono con una latencia de decodificación de 54,5 tokens/s en CPU (Galaxy S26) y 108 tokens/s en GPU, lo que permite respuestas fluidas sin enviar datos a la nube.
- Extracción de datos en el dispositivo: adecuado para parsear texto libre y extraer campos estructurados (por ejemplo, direcciones, importes o entidades) en aplicaciones móviles, gracias a su formato ChatML con soporte de herramientas y su reducido consumo de memoria (1,67 GB en CPU en Galaxy S26).
- Pipelines agénticos ligeros en edge: puede actuar como planificador o enrutador de herramientas en flujos de múltiples pasos con contexto de hasta 4.096 tokens, invocando funciones definidas en el prompt.
- Asistentes de escritorio locales: en un Mac M4 Max alcanza 94,6 tokens/s en CPU y 380,2 tokens/s en GPU, lo que lo hace viable para aplicaciones de escritorio con procesamiento local de texto.
- Automatización de respuestas en aplicaciones de mensajería: su ventana de contexto efectiva y su velocidad de prefill (370 tokens/s en CPU de Galaxy S26) permiten procesar historiales de conversación de más de 1.000 tokens con un tiempo hasta el primer token de 2,83 s.
- Prototipado rápido de aplicaciones conversacionales: el tamaño de 0.3 GB y la licencia Apache 2.0 permiten iterar y desplegar en dispositivos de gama media sin costes de infraestructura.
- Filtrado y clasificación de texto en el dispositivo: puede usarse para moderación o etiquetado local de contenido en inglés y chino sin depender de servicios externos.

## Benchmarks y rendimiento

Resultados de GSM8K (primeras 100 preguntas del split de test, 4-shot chain of thought, decodificación greedy, máximo 1.024 tokens nuevos):

| Modelo | Plataforma | Correctas de 100 | Media |
|---|---|---|---|
| Fuente, bfloat16 (transformers) | Mac CPU | 58 | 58 |
| `MNN-Pocket-0.3B_int8.litertlm` | Mac GPU | 62, 62, 60 | 61,3 |
| `MNN-Pocket-0.3B_int8.litertlm` | Mac CPU | 60, 60, 58 | 59,3 |

Rendimiento en teléfonos (prefill forzado de 1.024 tokens, 256 tokens decodificados, contexto 2.048, media de ejecuciones 2 y 3 en dos procesos):

| Teléfono | Backend | Prefill (tokens/s) | Decode (tokens/s) | TTFT | Memoria pico | Verificación |
|---|---|---|---|---|---|---|
| Galaxy S26 | CPU | 370 | 54,5 | 2,83 s | 1,67 GB | pasa |
| Galaxy S26 | GPU | 2.661 | 108,0 | 0,39 s | 0,42 GB | no pasa |
| Pixel 11 Pro | CPU | 209 | 54,1 | 4,93 s | 1,40 GB | pasa |
| Pixel 11 Pro | GPU | 1.376 | 31,5 | 0,78 s | 0,35 GB | no pasa |

Rendimiento en Mac M4 Max (128 GB), LiteRT-LM 0.19.1, prefill 1.024 tokens, 256 decodificados, contexto 2.048, 3 ejecuciones:

| Backend | Prefill (tokens/s) | Decode (tokens/s) | TTFT |
|---|---|---|---|
| GPU | 6.282 | 380,2 | 0,166 s |
| CPU | 808 | 94,6 | 1,28 s |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,67 GB de memoria pico en CPU de Galaxy S26 y 1,40 GB en Pixel 11 Pro con el fichero int8; en GPU de teléfono baja a 0,42 GB (Galaxy S26) y 0,35 GB (Pixel 11 Pro).
- GPU recomendadas: el modelo está pensado para GPUs integradas de teléfonos (Galaxy S26, Pixel 11 Pro) y para la GPU de un Mac M4 Max. No se proporcionan datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en teléfonos de gama alta y en un Mac M4 Max; no se dispone de datos para GPUs de escritorio dedicadas.
- Opciones de despliegue: LiteRT-LM 0.19.1 (CLI `litert-lm run` y API Python `litert_lm.Engine`), runtime MNN original (con versión int4), y GGUF del modelo base para llama.cpp/Ollama (no verificado en la información disponible para esta conversión concreta).
- Latencia y throughput: en Galaxy S26 CPU, TTFT de 2,83 s y 54,5 tokens/s de decodificación; en GPU de Galaxy S26, TTFT de 0,39 s y 108 tokens/s, aunque la verificación de precisión no pasa en GPU de teléfono. En Mac M4 Max GPU, TTFT de 0,166 s y 380,2 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/Disponibilidad | Rendimiento GSM8K |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B (LiteRT-LM int8) | ~300M | 4.096 tokens (KV cache) | Apache 2.0 | `.litertlm`, MNN int4, GGUF | 59,3-61,3 de 100 |
| MNN-Pocket-0.3B (fuente bfloat16) | ~300M | No disponible | Apache 2.0 | Transformers safetensors | 58 de 100 |
| Qwen3-0.6B | ~600M | No disponible en la información | Apache 2.0 | safetensors, GGUF | No disponible |
| MNN-Pocket-0.3B-FP8 (liodon-ai) | ~300M | No disponible | other | safetensors FP8, vLLM | No disponible |

La comparativa con modelos de la misma categoría (sub-1B para edge) es limitada porque no se han proporcionado resultados de benchmarks de los alternativas en la información disponible. El modelo se posiciona por debajo de Qwen3-0.6B en número de parámetros y por encima en portabilidad a LiteRT-LM frente a las versiones FP8 orientadas a vLLM.

## Limitaciones y advertencias

- No recomendado para matemáticas avanzadas ni generación de código de largo alcance, según la model card del autor original.
- La verificación de precisión (Accuracy) no pasa en las GPUs de teléfono probadas (Galaxy S26 y Pixel 11 Pro), por lo que el backend GPU en móvil no es fiable todavía para producción.
- El contexto efectivo en la implementación LiteRT-LM está limitado a 4.096 tokens de KV cache, inferior al contexto nativo del modelo base (no especificado).
- Solo soporta inglés y chino; no hay soporte multilingüe adicional.
- Riesgo de alucinación inherente a modelos de 300M de parámetros, especialmente en tareas de razonamiento y datos factuales.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la versión FP8 de terceros (liodon-ai) usa licencia "other", que debe revisarse por separado.
- El rendimiento en CPU de Galaxy S26 se midió tras la reducción de frecuencia de la CPU del dispositivo, por lo que las cifras iniciales (≈77 tokens/s en la primera ejecución) no son representativas del estado sostenido.

## Enlaces

- [Hugging Face: litert-community/MNN-Pocket-0.3B](https://huggingface.co/litert-community/MNN-Pocket-0.3B)
- [Modelo base: taobao-mnn/MNN-Pocket-0.3B](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B)
- [Versión MNN int4: taobao-mnn/MNN-Pocket-0.3B-MNN](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN)
- [Ficheros GGUF: taobao-mnn/MNN-Pocket-0.3B-GGUF](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF)
- [Informe técnico (PDF)](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/MNN-Pocket-0.3B-Technical-Report.pdf)
- [Repositorio LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
- [Versión FP8 de terceros: liodon-ai/MNN-Pocket-0.3B-FP8](https://huggingface.co/liodon-ai/MNN-Pocket-0.3B-FP8)
