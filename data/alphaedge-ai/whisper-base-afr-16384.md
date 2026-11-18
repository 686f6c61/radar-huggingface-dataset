# alphaedge-ai/whisper-base-afr-16384

## Resumen

`whisper-base-afr-16384` es una variante recortada (trimmed) del modelo de reconocimiento automático del habla `openai/whisper-base`, publicada por el usuario `alphaedge-ai`. El modelo aplica la técnica de trimming de vocabulario para especializarlo en afrikaans (`af`), reduciendo el vocabulario del tokenizer original de Whisper de 51.865 a 16.384 tokens. Esto elimina los tokens poco frecuentes en afrikaans y reduce el número de parámetros totales de 72.593.920 a 54.427.648, un 25,02% menos, con un footprint en disco de aproximadamente 0,1 GB.

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atención estándar, pensado para transcripción de audio a texto. El modelo mantiene la licencia Apache 2.0 del original y se distribuye en formato safetensors para su uso con la librería `transformers` (pipeline `automatic-speech-recognition`). Se trata de una adaptación de nicho, orientada a despliegues con recursos limitados donde solo se necesita transcripción en afrikaans.

Su relevancia es práctica: demuestra cómo el trimming de vocabulario permite reducir el tamaño de un modelo ASR sin reentrenar desde cero, a costa de perder cobertura multilingüe. No hay resultados de benchmarks publicados en la información disponible, por lo que su calidad debe validarse empíricamente en el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, según Whisper original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | af (afrikaans) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-base`: un transformer encoder-decoder con 6 capas en encoder y 6 en decoder (configuración base de Whisper), entrenado originalmente por OpenAI con supervisión débil a gran escala sobre audio y transcripciones multilingües. Esta variante no se reentrena: se obtiene mediante trimming de vocabulario, es decir, recortando el vocabulario del tokenizer a 16.384 tokens y recortando en consecuencia las matrices de embedding y la capa de proyección de salida del decoder.

Para determinar qué tokens conservar, el autor usó un dataset de minería de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. El resultado es un modelo un 25,02% más pequeño en parámetros y un 68,41% más pequeño en vocabulario, con un footprint de repo de 0,1 GB. No se documenta en la información disponible ningún proceso de fine-tuning adicional, RLHF ni DPO tras el trimming.

## Capacidades

- Reconocimiento automático del habla (ASR) en afrikaans: transcripción de audio a texto.
- Tareas de traducción y transcripción de Whisper (parámetro `task` del pipeline), aunque la cobertura multilingüe queda limitada por el vocabulario recortado.
- Procesamiento de audio remuestreado a 16 kHz, requisito de Whisper.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta vision, audio generation ni thinking mode.
- Capacidades multilingües: solo af; el resto de idiomas pierde tokens y no se garantiza buen rendimiento.

## Casos de uso

- Transcripción de audio en afrikaans en entornos con recursos limitados: al tener 54,4 M parámetros y 0,1 GB de repo, el modelo cabe en CPU y en GPUs de gama baja, lo que lo hace adecuado para servidores pequeños o dispositivos edge.
- Subtitulado automático de contenido audiovisual en afrikaans: el pipeline de `transformers` permite generar transcripciones por segmentos de 30 s, integrándose en flujos de postproducción.
- Digitalización de actas y entrevistas en afrikaans: útil para archivística y servicios públicos que necesitan convertir audio histórico a texto con un modelo ligero.
- Integración en aplicaciones móviles o de escritorio con inferencia local: el tamaño reducido permite empaquetar el modelo en apps sin depender de servicios en la nube.
- Preprocesado de datasets de voz en afrikaans: transcripción masiva de corpus para entrenamiento de otros modelos o para anotación automática.
- Atención al cliente en afrikaans con ASR como primer paso: transcripción de llamadas o mensajes de voz antes de pasarlos a un sistema de NLU, con latencia baja gracias al tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 54,4 M parámetros en fp32 el modelo ocupa aproximadamente 0,22 GB, y en fp16 aproximadamente 0,11 GB, más overhead de activaciones y feature extractor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente en la práctica; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en GTX 1050/1650, RTX 3050/3060/4090 y similares; también en CPU.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), potencialmente `optimum`/ONNX y servidores compatibles con endpoints; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-afr-16384 | 54.427.648 | no disponible | af | apache-2.0 | Hugging Face |
| openai/whisper-base | 72.593.920 | no disponible | multilingüe | apache-2.0 | Hugging Face |
| openai/whisper-small | no disponible en esta ficha | no disponible | multilingüe | apache-2.0 | Hugging Face |

La comparación directa más relevante es con `openai/whisper-base`: esta variante es un 25,02% más pequeña en parámetros y un 68,41% más pequeña en vocabulario, pero pierde cobertura multilingüe. `whisper-small` es una alternativa de mayor tamaño y mayor capacidad general, aunque no se dispone de cifras concretas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida: el vocabulario recortado elimina tokens no usados en afrikaans, por lo que el rendimiento en otros idiomas puede degradarse severamente.
- Riesgo de alucinación: Whisper tiende a generar texto plausible en segmentos de silencio o ruido; esta variante hereda ese comportamiento.
- Sesgos: no se documentan sesgos específicos, pero el modelo original de Whisper presenta sesgos derivados de sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `openai/whisper-base`.
- Sin benchmarks publicados: no hay evidencia numérica de calidad en afrikaans, por lo que se recomienda validación empírica antes de producción.
- No se documentan cuantizaciones ni formatos GGUF/ONNX, lo que limita opciones de despliegue optimizado.
- El modelo está etiquetado como `region:eu` y `endpoints_compatible`, pero no se detallan garantías de servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-afr-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
