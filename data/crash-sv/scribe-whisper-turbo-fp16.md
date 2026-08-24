# crash-sv/scribe-whisper-turbo-fp16

## Resumen

El modelo `crash-sv/scribe-whisper-turbo-fp16` es una conversión a CTranslate2 en precisión float16 del modelo de reconocimiento de voz automático (ASR) Whisper large-v3-turbo de OpenAI. El autor, Crash-SV, lo publica como parte de su aplicación de dictado y traducción para Windows llamada Scribe SV, con el objetivo de que la aplicación pueda descargar el modelo bajo demanda en lugar de incluirlo en el instalador, evitando dependencias de mirrors externos.

No se ha realizado ningún fine-tuning ni entrenamiento adicional: se trata de los mismos pesos del modelo original convertidos a formato CTranslate2 mediante la herramienta de Deepdml, republicados sin modificaciones. Esto permite usar el modelo con la librería `faster-whisper`, que ofrece inferencia más rápida y menor consumo de memoria que la implementación original de Whisper. La licencia es MIT, lo que facilita su uso comercial.

El modelo está orientado a transcripción y traducción de voz en ruso e inglés, aunque el modelo base de OpenAI soporta muchos más idiomas. Su tamaño de repositorio es de 1.6 GB, y existe una versión int8 para CPU en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 809 millones (estimado para Whisper large-v3-turbo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado en la ficha (el modelo base Whisper usa ventana de 30 segundos de audio) |
| Tipos de cuantizacion | float16 (este repositorio), int8 (repositorio separado) |
| Idiomas soportados | Ruso (ru), Inglés (en) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json, vocabulary.json) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3-turbo, una versión optimizada del Whisper large-v3 de OpenAI. Whisper es un modelo de reconocimiento de voz basado en Transformer, con un encoder que procesa la mel-spectrograma del audio y un decoder autoregresivo que genera texto. El turbo reduce el número de capas del decoder y utiliza técnicas de optimización como atención flash para acelerar la inferencia con una degradación mínima de precisión.

El entrenamiento de Whisper se realizó con 680.000 horas de audio débilmente supervisado en múltiples idiomas, incluyendo tareas de transcripción y traducción. No se aplicó RLHF ni DPO en esta variante. Este repositorio no añade ningún entrenamiento adicional; solo se convierte el modelo a CTranslate2 para su uso con `faster-whisper`, que emplea cuantización y optimizaciones específicas para CPU y GPU.

## Capacidades

- Transcripción de voz a texto en ruso e inglés.
- Traducción de voz a texto en inglés (el modelo puede traducir audio de otros idiomas al inglés, aunque esta ficha solo declara ruso e inglés).
- Detección de idioma y segmentación de audio (mediante VAD integrado en `faster-whisper`).
- Generación de subtítulos con marcas de tiempo.
- Soporte de inferencia en tiempo real para dictado y traducción continua.
- No incluye tool calling ni capacidades de agente; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: Scribe SV utiliza este modelo para transcribir voz en tiempo real, aprovechando la baja latencia de `faster-whisper` y el filtro VAD para ignorar silencios.
- Transcripción de reuniones y entrevistas: puede procesar grabaciones de audio largas en segmentos de 30 segundos, generando transcripciones con marcas de tiempo.
- Traducción simultánea de voz al inglés: el modelo puede traducir audio en ruso u otros idiomas al inglés, útil para subtitulado o interpretación asistida.
- Generación de subtítulos para contenido multimedia: integración en pipelines que reciben archivos de audio y producen archivos SRT o VTT.
- Asistencia a personas con discapacidad auditiva: transcripción en tiempo real de conversaciones para visualización en pantalla.
- Análisis de llamadas y reuniones: extracción de texto de grabaciones de teleconferencias para búsqueda y análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.6 GB en float16 (según los 809 millones de parámetros del modelo base). Para int8, se reduce a unos 0.8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM y soporte para CUDA (por ejemplo, GTX 1050 Ti, RTX 2060, RTX 4090). En CPU se puede usar la versión int8, aunque con mayor latencia.
- Opciones de despliegue: `faster-whisper` (Python), que permite ejecutar en GPU o CPU; también es compatible con CTranslate2 y puede integrarse en aplicaciones C++.
- Latencia y throughput: no se especifican en la ficha; depende del hardware y del tamaño del audio. En una GPU moderna, se puede transcribir audio en tiempo real (factor 1x) o más rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crash-sv/scribe-whisper-turbo-fp16 | 809M (turbo) | 30 s | MIT | CTranslate2 | Conversión FP16 para `faster-whisper` |
| openai/whisper-large-v3-turbo | 809M | 30 s | MIT | PyTorch original | Modelo base, sin conversión |
| openai/whisper-large-v3 | 1550M | 30 s | MIT | PyTorch original | Versión completa, más precisa pero más lenta |
| deepdml/faster-whisper-large-v3-turbo-ct2 | 809M | 30 s | MIT | CTranslate2 | Conversión original de la que deriva este repo |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada.

## Limitaciones y advertencias

- La ficha indica únicamente ruso e inglés, aunque el modelo base de OpenAI soporta 99 idiomas; el uso fuera de estos dos puede dar resultados no óptimos.
- Al ser una conversión sin fine-tuning, no se corrigen sesgos del modelo original: Whisper puede alucinar texto en audios ruidosos o con acentos poco comunes.
- La ventana de contexto de 30 segundos limita el procesamiento a fragmentos; para audios largos se requiere segmentación, que puede perder contexto.
- La licencia MIT permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright.
- En CPU, el formato float16 no está soportado (se degrada a float32), por lo que se recomienda la versión int8 para entornos sin GPU.
- La versión FP16 requiere GPU con soporte de precisión media; en GPUs antiguas puede no estar disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crash-sv/scribe-whisper-turbo-fp16
- Modelo base original: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de la conversión original: https://huggingface.co/deepdml/faster-whisper-large-v3-turbo-ct2
- Proyecto Scribe SV (GitHub): https://github.com/Crash-SV
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
