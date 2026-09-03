# cstr/mt3-GGUF

## Resumen

El modelo `cstr/mt3-GGUF` es una conversión al formato GGUF del modelo MT3 (Music Transcription Transformer) desarrollado por Google Magenta, especializado en transcripción musical multi-instrumento. MT3 emplea una arquitectura tipo T5 (encoder-decoder) que procesa espectrogramas log-mel y genera secuencias de eventos tipo MIDI, identificando simultáneamente notas, programas de instrumentos General MIDI y percusión. Esta conversión, realizada por el autor cstr, está diseñada para integrarse en el runtime CrispASR, que permite ejecutar el modelo sin dependencias de JAX o T5X.

El modelo cuenta con 46,9 millones de parámetros y un tamaño de archivo de 96 MB en precisión f16, lo que lo hace extremadamente ligero y ejecutable en hardware modesto. Su relevancia radica en que es el único modelo de transcripción por eventos de programa disponible en CrispASR, ofreciendo una alternativa eficiente a otros sistemas de transcripción automática de música (AMT) que suelen ser más pesados o limitados a un solo instrumento. La licencia Apache-2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-style encoder-decoder (sin bias de atención relativa) |
| Parametros totales | 46.945.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (archivo `mt3-f16.gguf`) |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

MT3 es un modelo encoder-decoder basado en la arquitectura T5, adaptado para procesar espectrogramas log-mel como entrada y generar tokens de eventos musicales (notas, programas, tiempo) como salida. La conversión a GGUF conserva la estructura original: 190 tensores que incluyen el encoder, el decoder y el codec de eventos, con posiciones sinusoidales absolutas y sin bias de atención relativa (el runtime falla explícitamente si se intenta usar el modo relativo, evitando fallos silenciosos). El checkpoint original proviene de T5X/zarr y se convirtió mediante un script propio que solo usa stdlib y numpy, verificándose que los pesos son bit-exactos respecto a la exportación de referencia en PyTorch (189/189 tensores, diferencia máxima absoluta 0.0). No se dispone de información detallada sobre el entrenamiento original del modelo base (google/mt3), como número de tokens o composición del dataset.

## Capacidades

- Transcripción musical multi-instrumento: detecta notas simultáneas de varios instrumentos, asignando a cada nota un programa General MIDI.
- Clasificación de percusión: la batería se trata como una clase separada dentro de los eventos.
- Generación de eventos MIDI: produce secuencias de eventos que pueden exportarse a formato MIDI estándar (SMF) o JSON.
- Salida multi-track: con `--piano-format midi` genera un archivo SMF formato 1 con una pista por programa y la batería en el canal GM 10.
- Integración con CrispASR: funciona como backend de transcripción en el runtime CrispASR, con soporte para descarga automática del modelo.
- Procesamiento de audio de entrada: acepta archivos de audio (WAV) y los convierte internamente a espectrogramas log-mel.

## Casos de uso

- Transcripción de partituras a partir de grabaciones: un músico puede subir una grabación de una banda y obtener un archivo MIDI con las pistas separadas por instrumento, facilitando la notación o la edición.
- Análisis musical automatizado: investigadores pueden extraer eventos de nota y programa de audio para estudiar armonía, melodía o estructura de piezas musicales.
- Generación de acompañamientos: un productor puede transcribir una pista de referencia y luego modificar o reorquestar los eventos MIDI generados.
- Educación musical: herramientas de práctica que muestran la transcripción en tiempo real de lo que toca un estudiante, con separación por instrumento.
- Archivado y restauración de audio histórico: convertir grabaciones antiguas en MIDI para preservar o reeditar la música.
- Integración en pipelines de producción musical: usar el modelo como paso previo a la síntesis o al sampleado, generando MIDI que luego se puede asignar a instrumentos virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye verificaciones de paridad con una implementación de referencia en numpy, mostrando similitud coseno de 1.0 en el front-end mel, 0.999999879 en la salida del encoder y coincidencia exacta en los tokens greedy y en los eventos de nota finales (88/88, 5/5, 8/8 en tres clips de prueba). No hay comparaciones con otros modelos de transcripción.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 96 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en iGPU o CPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA, AMD, Intel) es suficiente; no se requieren GPUs de alta gama.
- Compatibilidad con consumer GPU: sí, funciona en GPUs de gama baja como GTX 1650 o incluso en CPU con suficiente RAM.
- Opciones de despliegue: el runtime principal es CrispASR, que soporta la carga del archivo GGUF directamente. También podría usarse con llama.cpp u otros motores que soporten GGUF, aunque no está documentado.
- Latencia y throughput: no disponible; depende del hardware y de la longitud del audio de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/mt3-GGUF | T5 encoder-decoder | 46,9 M | no disponible | Apache-2.0 | GGUF |
| google/mt3 (original) | T5 encoder-decoder | 46,9 M | no disponible | Apache-2.0 | T5X/zarr |
| Basic Pitch (Spotify) | CRNN | ~10 M | no disponible | Apache-2.0 | TensorFlow |
| Piano Transcription (Google) | Onsets and Frames | ~30 M | no disponible | Apache-2.0 | TensorFlow |

La comparativa se basa en información pública general; no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para transcripción musical; no es un modelo de lenguaje ni de audio general.
- La precisión puede degradarse con grabaciones de baja calidad, mezclas densas o instrumentos no estándar.
- La salida se limita a eventos MIDI; no genera audio ni partituras directamente.
- No se han documentado sesgos específicos, pero como todo modelo de AMT, puede tener dificultades con géneros musicales poco representados en su entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base google/mt3.
- El runtime CrispASR es necesario para ejecutar el modelo; no hay soporte directo en otros frameworks sin adaptación.

## Enlaces

- [HuggingFace: cstr/mt3-GGUF](https://huggingface.co/cstr/mt3-GGUF)
- [Repositorio CrispASR en GitHub](https://github.com/CrispStrobe/CrispASR)
- [Script de conversión `convert-mt3-to-gguf.py`](https://github.com/CrispStrobe/CrispASR/blob/main/models/convert-mt3-to-gguf.py)
- [Modelo base google/mt3 en HuggingFace](https://huggingface.co/google/mt3)
