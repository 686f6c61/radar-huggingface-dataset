# Mocanianity/whisper-tiny_to_indian_accent

## Resumen

Whisper tiny Indian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario Mocanianity, especializado en reconocimiento automático de habla (ASR) para inglés con acento indio. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, en su variante "tiny", y se ha entrenado sobre el dataset Indian_english para mejorar la transcripción de hablantes con acento indio, un dominio donde el modelo base original presenta un rendimiento inferior.

Con 37,76 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo extremadamente ligero, pensado para despliegues con recursos muy limitados o para tareas de transcripción en tiempo real en dispositivos de borde. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia radica en la especialización: en lugar de competir con modelos ASR de gran escala, ofrece una alternativa económica y focalizada para un acento concreto, con un WER declarado de 10,53 en el conjunto de evaluación. Es un ejemplo típico de modelo "generated_from_trainer", útil para pipelines de transcripción de bajo coste en mercados como India.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles, con acento indio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, que emplea una arquitectura transformer encoder-decoder diseñada para ASR. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autorregresiva. Whisper tiny es la variante más pequeña de la familia Whisper, con 4 capas en encoder y decoder, anchura de 384 y 6 cabezas de atención.

El entrenamiento se realizó sobre el dataset Indian_english con los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de evaluación: en el paso 1000 (época 1,1655) con WER de 11,9428 y en el paso 2000 (época 2,3310) con WER de 10,5271 y pérdida de validación de 0,2580. No se documenta el número total de tokens de audio ni la composición detallada del dataset, ni si hubo RLHF o DPO (no aplicable habitualmente en ASR).

## Capacidades

- Transcripción de voz a texto (ASR) para inglés con acento indio.
- Reconocimiento de habla en ventanas de audio de hasta 30 segundos (limitación heredada de Whisper).
- Generación de transcripciones con puntuación y mayúsculas (capacidad nativa de Whisper).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (según la model card).
- Capacidades especiales: no se documentan modo thinking, visión ni audio más allá del ASR estándar.

## Casos de uso

- Transcripción de reuniones y llamadas en centros de soporte con hablantes de inglés indio: el modelo puede procesar audio segmentado en ventanas de 30 s y generar transcripciones con un WER de ~10,5, adecuado para actas o búsqueda posterior.
- Subtitulado automático de vídeos corporativos para equipos en India: su tamaño reducido (37,7 M de parámetros) permite ejecutarlo en CPU o GPU de gama baja, abaratando el procesado por lotes.
- Asistentes de voz embebidos en dispositivos de borde: al ocupar 0,3 GB, cabe en dispositivos con poca memoria y puede integrarse en aplicaciones móviles o IoT para comandos de voz en inglés indio.
- Análisis de encuestas y entrevistas cualitativas: transcripción de grabaciones de campo con acento indio para su posterior análisis de texto, con un coste computacional mínimo.
- Generación de datos etiquetados para ASR: uso del modelo como anotador automático en pipelines de creación de datasets, filtrando por confianza.
- Prototipado rápido de pipelines ASR: al ser un modelo pequeño y con licencia Apache 2.0, sirve para validar arquitecturas de transcripción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | Indian English (split test) | WER | 10,5271 |
| ASR | Indian English (split test) | Loss | 0,2580 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parámetros ≈ 151 MB de pesos, más activaciones y buffers de audio); en fp16, aproximadamente 75 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 2060 o integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline de ASR), vLLM (soporte limitado para Whisper), llama.cpp (no aplicable a Whisper), Ollama (no soportado de forma nativa), TGI (soporte experimental para ASR).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en tiempo real o superior en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Indian English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Indian (este) | 37,7 M | 30 s de audio | 10,53 | Apache 2.0 | Hugging Face |
| openai/whisper-tiny (base) | 37,7 M | 30 s de audio | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s de audio | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de WER para los modelos comparables en el dataset Indian English en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con inglés indio, puede degradarse en otros acentos o variedades del inglés; no se documentan análisis de sesgo.
- Riesgo de alucinación: Whisper puede generar texto inventado en segmentos con silencio o ruido; el fine-tuning no elimina este comportamiento.
- Limitaciones de contexto: ventanas de audio de 30 s; para audios más largos es necesario segmentar, lo que puede introducir errores en los límites.
- Limitaciones de idioma: solo inglés; no se garantiza rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Whisper también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: el WER de 10,53 no está verificado (verified: false) y el dataset de evaluación no está detallado; el modelo card indica "More information needed" en varias secciones, lo que sugiere documentación incompleta. El modelo tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Mocanianity/whisper-tiny_to_indian_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
