# shamsaH/whisper-tiny-minds14-en-us

## Resumen

El modelo `shamsaH/whisper-tiny-minds14-en-us` es un ajuste fino (fine-tune) de `openai/whisper-tiny` sobre el dataset `PolyAI/minds14`, especializado en el reconocimiento automático de voz (ASR) para inglés de Estados Unidos. Desarrollado por el usuario shamsaH, cuenta con 37.760.640 parámetros y se distribuye bajo licencia Apache 2.0. Su objetivo es mejorar la transcripción de consultas bancarias y conversaciones en inglés, aprovechando la eficiencia de Whisper-tiny para entornos con recursos limitados. La relevancia de este modelo radica en su tamaño reducido y su especialización en un dominio concreto, lo que lo hace adecuado para aplicaciones de voz en tiempo real en dispositivos de baja capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredado del modelo base, 30 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en-US) (inferido del nombre y del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper-tiny es un transformer encoder-decoder con atención estándar, diseñado para procesar audio de hasta 30 segundos. El ajuste fino se realizó sobre el dataset `PolyAI/minds14`, que contiene grabaciones de consultas bancarias en varios idiomas; en este caso se utilizó el subconjunto en-US. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 8 con acumulación de gradientes de 2 (lote efectivo de 16), optimizador AdamW, scheduler lineal y 10 épocas, con precisión mixta (AMP). No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático de voz (ASR) para inglés de Estados Unidos.
- Transcripción de audio a texto en el dominio de consultas bancarias.
- Eficiente en términos de tamaño y velocidad de inferencia, adecuado para dispositivos con recursos limitados.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades multimodales más allá del audio.

## Casos de uso

- Transcripción de llamadas de atención al cliente en el sector bancario: el modelo puede convertir conversaciones telefónicas en texto para su análisis posterior, gracias a su especialización en el dominio de minds14.
- Subtitulado automático de vídeos en inglés: su tamaño reducido permite procesar audio en tiempo real en aplicaciones de edición o streaming.
- Asistentes de voz en dispositivos embebidos: al ser ligero, puede ejecutarse en Raspberry Pi o móviles de gama baja para comandos de voz.
- Análisis de conversaciones para extracción de información: las transcripciones pueden alimentar sistemas de minería de texto o CRM.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en reuniones o eventos.
- Automatización de documentación: transcripción de reuniones o entrevistas para generar actas automáticamente.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación de `PolyAI/minds14`:

| Métrica | Valor |
|---|---|
| Loss | 0.5930 |
| WER | 0.3165 |
| WER Ortho | 0.3448 |

Evolución durante el entrenamiento (por época):

| Época | Training Loss | Validation Loss | WER | WER Ortho |
|---|---|---|---|---|
| 1 | 1.7385 | 0.7435 | 0.3751 | 0.4170 |
| 2 | 0.5314 | 0.5790 | 0.3442 | 0.3757 |
| 3 | 0.3243 | 0.5545 | 0.3393 | 0.3732 |
| 4 | 0.2605 | 0.5519 | 0.3374 | 0.3701 |
| 5 | 0.2126 | 0.5595 | 0.3251 | 0.3578 |
| 6 | 0.1212 | 0.5680 | 0.3251 | 0.3547 |
| 7 | 0.1061 | 0.5810 | 0.3239 | 0.3523 |
| 8 | 0.0719 | 0.5878 | 0.3196 | 0.3486 |
| 9 | 0.0834 | 0.5930 | 0.3165 | 0.3448 |
| 10 | 0.0464 | 0.5955 | 0.3165 | 0.3442 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU posible: Whisper-tiny es uno de los modelos más ligeros de la familia Whisper, con ~38M de parámetros.
- VRAM estimada: aproximadamente 1-2 GB en FP32; menos si se cuantiza (aunque no se especifican cuantizaciones).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, incluidas integradas como Intel Iris Xe o NVIDIA GTX 1650.
- Despliegue: compatible con la librería `transformers`, así como con `whisper.cpp` para CPU y `vLLM` (aunque no es un LLM, se puede servir como pipeline de ASR).
- Latencia: baja, adecuada para transcripción en tiempo real en dispositivos de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (minds14) | Licencia |
|---|---|---|---|---|
| shamsaH/whisper-tiny-minds14-en-us | 37.760.640 | no disponible | 0.3165 | Apache 2.0 |
| markredito/whisper-tiny-minds14-en-us | no disponible | no disponible | 0.3341 | no disponible |
| openai/whisper-tiny (base) | 39M (aprox.) | 30 s | no disponible | MIT (original) |

El modelo base `openai/whisper-tiny` no tiene resultados publicados en minds14 en la información proporcionada. Otros fine-tunes similares, como el de markredito, presentan un WER ligeramente superior (0.3341), lo que sugiere que este ajuste es algo más preciso en el mismo dataset.

## Limitaciones y advertencias

- Entrenado exclusivamente en el dominio de consultas bancarias (minds14), por lo que su rendimiento puede degradarse en otros dominios (noticias, conversaciones informales, etc.).
- El WER de 31.6% indica que aproximadamente una de cada tres palabras se transcribe incorrectamente, lo que puede ser inaceptable para aplicaciones críticas sin postprocesamiento.
- Posibles sesgos derivados del dataset minds14, que puede contener acentos o variaciones dialectales específicas de EE.UU.
- No se especifican limitaciones de contexto o idioma más allá del inglés.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el caso de uso concreto antes de producción.

## Enlaces

- [HuggingFace - shamsaH/whisper-tiny-minds14-en-us](https://huggingface.co/shamsaH/whisper-tiny-minds14-en-us)
- [GitHub - zanuura/whisper-asr-minds14-english](https://github.com/zanuura/whisper-asr-minds14-english)
- [FriendliAI - whisper-tiny-minds14-en-US](https://friendli.ai/models/tomragus/whisper-tiny-minds14-en-US)
- [OpenAI Whisper (modelo base)](https://github.com/openai/whisper)
