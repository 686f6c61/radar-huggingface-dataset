# litert-community/MNN-Pocket-0.3B

## Resumen

MNN-Pocket-0.3B es un modelo de lenguaje instructivo de aproximadamente 300 millones de parámetros, desarrollado por el equipo MNN de Taobao (Alibaba) y distribuido originalmente bajo el identificador `taobao-mnn/MNN-Pocket-0.3B`. La versión que nos ocupa, `litert-community/MNN-Pocket-0.3B`, es una conversión de esos pesos al formato LiteRT-LM de Google para su ejecución en dispositivos móviles, publicada por la comunidad litert-community. El modelo está diseñado específicamente para inferencia on-device: asistentes locales, extracción de datos y pipelines agénticos ligeros.

Arquitectónicamente es un transformer denso de 28 capas con tamaño oculto de 896, 14 cabezas de atención que comparten 2 cabezas clave-valor (GQA) y embeddings de entrada y salida atados. Su vocabulario bilingüe (inglés y chino) alcanza los 65.536 tokens. La conversión a LiteRT-LM ofrece variantes int8 para CPU y GPU, además de ficheros compilados para la NPU de Qualcomm, con longitudes de caché KV de 2.048 y 4.096 tokens.

La relevancia de esta ficha radica en que demuestra un caso práctico de despliegue de un LLM en hardware de consumo móvil con aceleración NPU: sobre un Galaxy S26 (Snapdragon SM8850), la variante compilada para esa NPU decodifica en torno a 158 tokens/s tras un prefill de 1.024 tokens y crea su motor en unos 0,27 s, según las mediciones del autor de la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (28 capas, hidden size 896, 14 cabezas de atención, 2 cabezas KV, GQA, embeddings atados) |
| Parámetros totales | ~300M |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (variante `_int8.litertlm`); 2.048 tokens (variantes `_ekv2048` y NPU) |
| Tipos de cuantización | Int8 (una escala por canal de salida) con activaciones float; fp16 en GPU; int8 con activaciones enteras de 16 bits en NPU |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); existen builds GGUF e int4 para MNN en repositorios del autor original |
| Vocabulario | 65.536 tokens (inglés y chino) |
| Formato de chat | ChatML con definiciones de herramientas |
| Thinking mode | No declarado (control: never) |
| Visión / audio | No soportado |
| Runtime mínimo | LiteRT-LM 0.19.1 |
| Tamaño del repo | 2,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 28 capas con un tamaño oculto de 896 y 14 cabezas de atención que comparten únicamente 2 cabezas clave-valor, lo que reduce drásticamente el coste de memoria del caché KV en inferencia. Los embeddings de entrada y salida están atados, lo que ahorra parámetros en un modelo de este tamaño. El vocabulario de 65.536 tokens cubre inglés y chino, y el formato de conversación es ChatML con soporte para definiciones de herramientas.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `taobao-mnn/MNN-Pocket-0.3B`, y el autor original publica un informe técnico en arXiv (2611.12311) que presumiblemente contiene esos detalles. La conversión a LiteRT-LM no altera los pesos más allá de la cuantización: los ficheros int8 emplean una escala por canal de salida con activaciones float (fp16 en GPU), mientras que la variante NPU usa activaciones enteras de 16 bits cuyos rangos se calibraron sobre 48 prompts (32 preguntas del split de entrenamiento de GSM8K en formato 4-shot y las 16 primeras prompts de calibración de litert-torch).

La innovación destacable de esta conversión es el empaquetado específico para NPU de Qualcomm: el fichero `MNN-Pocket-0.3B_qualcomm_sm8850_ekv2048.litertlm` está compilado ahead-of-time con QAIRT 2.47.0.260601 para el SoC Snapdragon SM8850, de modo que el dispositivo no tiene que compilarlo al crear el motor. Las variantes incluyen firmas de prefill de 128 y 1.024 tokens para optimizar el procesamiento inicial del prompt.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Instrucciones generales de propósito general para asistencia on-device.
- Soporte de tool calling / function calling mediante formato ChatML con definiciones de herramientas.
- Capacidad para pipelines agénticos ligeros y extracción de datos estructurados.
- Sin bloque de razonamiento separado (thinking mode no declarado y desactivado por control).
- Sin capacidades de visión ni audio.
- No recomendado por el autor para tareas de razonamiento intensivo como matemáticas avanzadas o generación de código de largo horizonte.

## Casos de uso

- Asistentes locales en aplicaciones móviles: el modelo puede gestionar conversaciones multi-turno dentro de una ventana de 2.048 o 4.096 tokens, suficiente para diálogos de asistencia cotidiana, con latencias de decodificación superiores a 100 tokens/s en hardware móvil de gama alta.
- Extracción de datos estructurados en el dispositivo: a partir de texto libre (correos, mensajes, formularios), el modelo puede generar salidas JSON mediante tool calling sin enviar datos a la nube, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Pipelines agénticos ligeros: con soporte de function calling y un contexto de hasta 4.096 tokens, puede orquestar llamadas a herramientas locales (calendario, contactos, APIs del sistema) en flujos de pocos pasos.
- Clasificación y etiquetado de texto en el borde: su tamaño de 300M parámetros permite ejecutarlo en segundo plano en un smartphone para categorizar notificaciones, correos o mensajes sin coste de servidor.
- Autocompletado y sugerencias de respuesta: integrado en teclados o apps de mensajería, el modelo puede generar respuestas cortas contextualizadas con una latencia baja gracias a la decodificación en NPU o GPU.
- Filtrado y moderación de contenido local: puede evaluar texto de entrada en el dispositivo antes de enviarlo a un servicio remoto, reduciendo la dependencia de infraestructura externa.
- Prototipado de aplicaciones edge con LiteRT-LM: sirve como modelo de referencia para validar pipelines de conversión, cuantización y despliegue en Android, macOS y NPU de Qualcomm antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de inferencia medidas por el autor de la conversión:

| Métrica | Valor | Contexto |
|---|---|---|
| Decodificación (SM8850, NPU precompilada) | ~158 tokens/s | Galaxy S26, tras prefill de 1.024 tokens (2026-11-07) |
| Creación de motor (SM8850) | ~0,27 s | Galaxy S26 |
| Decodificación (fichero NPU genérico) | ~147 tokens/s | Galaxy S26 (2026-11-07) |
| Decodificación (fichero 4.096, GPU) | ~105 tokens/s | Medición del 2026-11-18 |
| Memoria pico adicional (fichero 4.096 vs 2.048 en CPU móvil) | ~0,76 GB más | Galaxy S26 y Pixel 11 Pro |

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros pesan entre 320 MB (int8 CPU/GPU) y 380 MB (NPU precompilada); la memoria pico en CPU móvil del fichero de 4.096 tokens es aproximadamente 0,76 GB superior a la del de 2.048.
- GPU recomendadas: no aplica en el sentido de datacenter; el modelo está pensado para GPU integradas de móviles (Adreno en Snapdragon SM8850, PowerVR en Pixel 11 Pro) y GPU de macOS.
- NPU: variantes específicas para la NPU de Snapdragon; la versión precompilada solo funciona en SM8850 (Galaxy S26). El backend CPU de LiteRT-LM 0.19.1 no abre los ficheros NPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de sobremesa con más de 1 GB de VRAM; el modelo completo en int8 ocupa ~320 MB.
- Opciones de despliegue: LiteRT-LM 0.19.1 o superior (CPU, GPU y NPU); el autor original ofrece builds para el runtime MNN (int4) y ficheros GGUF para llama.cpp/Ollama.
- Latencia y throughput: ~158 tokens/s en NPU SM8850, ~147 tokens/s con el fichero NPU genérico, ~105 tokens/s en GPU con el fichero de 4.096 tokens; creación de motor en ~0,27 s en SM8850.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B (esta ficha) | ~300M | 2.048–4.096 | en, zh | Apache 2.0 | LiteRT-LM, MNN, GGUF |
| Qwen3-0.6B | ~600M | no disponible en la información | multilingüe | Apache 2.0 | safetensors, GGUF |
| Gemma 3 270M | ~270M | no disponible en la información | multilingüe | Gemma Terms | safetensors, GGUF, LiteRT |
| SmolLM2-360M | ~360M | no disponible en la información | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks de calidad para MNN-Pocket-0.3B en la información proporcionada. La ventaja diferencial de esta conversión es el soporte de NPU precompilada para Snapdragon SM8850 y la integración con LiteRT-LM, que no está presente en las alternativas de la tabla.

## Limitaciones y advertencias

- El propio autor desaconseja su uso para razonamiento intensivo: matemáticas avanzadas y generación de código de largo horizonte quedan fuera de su ámbito recomendado.
- Riesgo de alucinación inherente a un modelo de 300M parámetros; la ventana de contexto efectiva es de 2.048 o 4.096 tokens, lo que limita la cantidad de información que puede manejar simultáneamente.
- Solo soporta inglés y chino; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sin bloque de razonamiento (thinking) ni capacidades multimodales (visión o audio).
- La variante NPU precompilada está atada al SoC Snapdragon SM8850; en otros dispositivos hay que usar los ficheros int8 para CPU/GPU o la variante NPU genérica, que requiere compilación en el dispositivo.
- El backend CPU de LiteRT-LM 0.19.1 no puede abrir los ficheros NPU.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original y del informe técnico para confirmar que no hay restricciones adicionales.
- El repositorio tiene un tamaño de 2,4 GB y muy baja adopción (1 like, 1.271 descargas en el momento de la consulta), lo que implica poca validación comunitaria.
- El fichero de 4.096 tokens consume aproximadamente 0,76 GB más de memoria pico en CPU móvil que el de 2.048, lo que puede ser problemático en dispositivos con recursos ajustados.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/litert-community/MNN-Pocket-0.3B
- Modelo base original: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Build int4 para runtime MNN: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Ficheros GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Informe técnico (arXiv): https://arxiv.org/abs/2611.12311
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
