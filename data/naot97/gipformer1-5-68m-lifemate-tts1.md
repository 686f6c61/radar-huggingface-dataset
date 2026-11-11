# naot97/gipformer1.5-68M-lifemate-tts1

## Resumen

Gipformer 1.5 68M Lifemate TTS1 es un modelo de reconocimiento automático del habla (ASR) en vietnamita desarrollado por el usuario naot97. Se trata de un ajuste fino completo (*full fine-tune*) del modelo base g-group-ai-lab/gipformer1.5-68M-rnnt, un sistema RNN-T con arquitectura Zipformer de 68 millones de parámetros. El modelo está especializado en transcripción de peticiones dirigidas a asistentes de voz, en el contexto del Zalo AI Challenge 2026.

El problema que aborda es la transcripción precisa de comandos y consultas de usuario en vietnamita, con especial énfasis en la preservación de entidades, números, nombres propios y negaciones, elementos críticos en la interpretación de instrucciones para asistentes. Frente al modelo base, reduce la tasa de error de palabra (WER) del 16,9% al 11,1% en un conjunto de aplicaciones no vistas durante el entrenamiento.

El modelo se distribuye en formato ONNX de precisión flotante, listo para su uso con la librería sherpa-onnx, y también incluye el estado de pesos PyTorch de icefall. Su tamaño compacto (0,6 GB de repositorio) y licencia MIT lo hacen adecuado para despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN-T con encoder Zipformer 1.5 |
| Parámetros totales | 68 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación ONNX en float) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder, decoder, joiner) y PyTorch (`best.pt`, state dict de icefall) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RNN-T (Recurrent Neural Network Transducer) con un encoder Zipformer 1.5, implementada en el framework icefall. El transductor combina un encoder acústico, un predictor (decoder) y una red conjunta (joiner), lo que permite decodificación en streaming y offline sin alineamientos forzados. El modelo base es g-group-ai-lab/gipformer1.5-68M-rnnt (revisión dd9227d).

El ajuste fino se realizó sobre peticiones de asistente de voz en vietnamita: el subconjunto de entrenamiento interno de la competición (última petición y turnos de historial del usuario) más 1.146 clips sintéticos generados con TTS (tts-v1). La configuración de entrenamiento fue: batch 1 con acumulación de gradiente 4, tasa de aprendizaje constante de 2e-5, 3 épocas (3.234 pasos), aumentación de velocidad, ganancia, ruido y padding, además de SpecAugment (2 máscaras de frecuencia de hasta 15 bins, hasta 4 máscaras temporales, p = 0,8). Los objetivos BPE se normalizaron a mayúsculas y los números se escribieron con letras. El checkpoint se seleccionó sobre el conjunto de desarrollo val_seen (paso 2.600, WER greedy del 7,54%).

## Capacidades

- Reconocimiento automático del habla en vietnamita, orientado a peticiones de asistente de voz.
- Transcripción con normalización de números (escritos con letras) y objetivos BPE en mayúsculas.
- Decodificación mediante búsqueda en haz modificada (*modified beam search*) con sherpa-onnx.
- Manejo de entidades y nombres propios en el contexto de comandos de usuario.
- Reconocimiento de negaciones en las peticiones.
- Soporte de decodificación offline mediante el reconocedor `OfflineRecognizer.from_transducer` de sherpa-onnx.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento.

## Casos de uso

- Asistentes de voz para dispositivos domésticos: el modelo transcribe peticiones de usuario en vietnamita con énfasis en la preservación de entidades y números, lo que permite interpretar comandos como ajustes de temperatura o reproducción de contenido.
- Integración en aplicaciones móviles de reconocimiento de voz: el tamaño compacto de 68 M de parámetros y la exportación ONNX permiten ejecución en dispositivos con recursos limitados mediante sherpa-onnx.
- Transcripción de comandos con nombres propios: el modelo mejora la tasa de acierto en nombres (35,5% de error frente al 48,1% del base) y en nombres dentro de tool calls (22 de 89 erróneos frente a 37 de 89 del base), útil en sistemas de reservas o gestión de contactos.
- Procesamiento de peticiones con negaciones: el error en negaciones se reduce al 0,8% frente al 9,9% del modelo base, relevante en asistentes que deben distinguir entre "activar" y "no activar".
- Reconocimiento de números en consultas: con un 5,5% de error en números, adecuado para peticiones que incluyen cantidades, fechas o identificadores.
- Despliegue en pipelines de transcripción por lotes: la exportación ONNX y la API de sherpa-onnx permiten procesar audio de 16 kHz con 80 dimensiones de características de forma offline.

## Benchmarks y rendimiento

Resultados sobre el conjunto val_unseen (374 clips), con búsqueda en haz modificada de 4:

| Métrica | Este modelo | Modelo base |
|---|---|---|
| WER | 11,1% | 16,9% |
| Error en entidades | 16,6% | 23,8% |
| Números | 5,5% | 6,8% |
| Nombres | 35,5% | 48,1% |
| Negación | 0,8% | 9,9% |
| Nombres en tool calls (erróneos) | 22 / 89 | 37 / 89 |

En el conjunto val_seen, el checkpoint seleccionado (paso 2.600) alcanzó un WER greedy del 7,54%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 68 M de parámetros y exportación ONNX en float, la huella es reducida.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el tamaño del modelo sugiere que puede ejecutarse en hardware modesto, pero no se confirma.
- Opciones de despliegue: sherpa-onnx mediante `OfflineRecognizer.from_transducer` con los ficheros `encoder.onnx`, `decoder.onnx`, `joiner.onnx` y `tokens.txt`; también se incluye el state dict de icefall en `pytorch/best.pt`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (val_unseen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gipformer 1.5 68M Lifemate TTS1 (este modelo) | 68 M | no disponible | 11,1% | MIT | Hugging Face, ONNX y PyTorch |
| g-group-ai-lab/gipformer1.5-68M-rnnt (base) | 68 M | no disponible | 16,9% | no disponible en la información proporcionada | Hugging Face |
| Otros modelos ASR vietnamitas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vietnamita; no se documenta soporte de otros idiomas.
- La salida es en mayúsculas y sin puntuación; para su presentación debe convertirse a minúsculas.
- El error en nombres propios es elevado (35,5%), lo que puede afectar a aplicaciones que dependan de la identificación precisa de nombres.
- El ajuste fino se realizó sobre un dominio concreto (peticiones de asistente de voz), por lo que el rendimiento puede degradarse en otros dominios o registros.
- Los datos de entrenamiento incluyen 1.146 clips sintéticos generados con TTS, lo que puede introducir un sesgo hacia las características acústicas de la síntesis.
- No se documentan sesgos específicos ni riesgos de alucinación más allá de los propios errores de transcripción del ASR.
- La licencia MIT permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- No se proporcionan datos sobre latencia, throughput ni requisitos de hardware, lo que dificulta la planificación de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/naot97/gipformer1.5-68M-lifemate-tts1)
- [Modelo base g-group-ai-lab/gipformer1.5-68M-rnnt](https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt)
- [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [icefall](https://github.com/k2-fsa/icefall)
- [Zalo AI Challenge 2026](https://zalopay.vn/) (referencia mencionada en la model card; URL no confirmada)
