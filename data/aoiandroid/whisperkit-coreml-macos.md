# aoiandroid/whisperkit-coreml-macos

## Resumen

Este repositorio aloja bundles de WhisperKit compilados específicamente para macOS, generados por el usuario aoiandroid para su proyecto TranslateBlue. WhisperKit es un paquete Swift que integra el modelo de reconocimiento de voz Whisper de OpenAI con el framework CoreML de Apple, permitiendo inferencia local y privada en dispositivos Apple. La compilación específica para macOS evita que iOS rechace el árbol `coremlcompiler` con el mensaje "Compile the model…", garantizando compatibilidad entre plataformas.

Los pesos de origen provienen del repositorio `argmaxinc/whisperkit-coreml`, y la estructura de carpetas sigue la convención de WhisperKit (`AudioEncoder.mlmodelc`, `TextDecoder.mlmodelc`, `MelSpectrogram.mlmodelc`, y opcionalmente `TextDecoderContextPrefill.mlmodelc`). El repositorio tiene un tamaño de 1,6 GB, licencia MIT, y está diseñado para su uso en aplicaciones macOS con reconocimiento de voz automático (ASR) sin dependencia de servicios en la nube.

Es relevante ahora porque permite a desarrolladores de macOS integrar transcripción de voz de alta calidad de forma nativa y sin latencia de red, manteniendo la privacidad de los datos del usuario. La compilación específica para macOS evita problemas de compatibilidad con la caché de ANE (Apple Neural Engine), que es específica del dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) compilado a CoreML |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper típicamente procesa 30 segundos de audio) |
| Tipos de cuantización | no disponible (formato CoreML nativo) |
| Idiomas soportados | no disponible (Whisper original soporta 99 idiomas, pero no se especifica en este bundle) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (CoreML) |

## Arquitectura y entrenamiento

El repositorio no incluye los pesos originales del modelo Whisper, sino bundles compilados a CoreML mediante la herramienta WhisperKit. La arquitectura subyacente es la del modelo Whisper de OpenAI: un transformer encoder-decoder con atención de 12 capas, entrenado con 680 000 horas de audio supervisado en múltiples idiomas y tareas (transcripción, traducción, detección de idioma y marcas de tiempo). Sin embargo, en este repositorio no se proporcionan detalles específicos sobre el entrenamiento, el dataset o el proceso de compilación más allá de la referencia a los pesos de `argmaxinc/whisperkit-coreml`.

La compilación a CoreML transforma los pesos de PyTorch a formato `.mlmodelc`, optimizados para la Neural Engine de Apple, lo que permite una inferencia eficiente en dispositivos Apple Silicon. No hay información sobre técnicas adicionales como RLHF o DPO aplicadas en este bundle.

## Capacidades

- Transcripción automática de voz (ASR) en tiempo real o en lote, procesando audio localmente sin conexión.
- Traducción de voz a texto en otros idiomas (etiqueta `translate` presente en los metadatos), aunque no se especifica qué idiomas están disponibles.
- Detección de idioma y marcas de tiempo, típicas del modelo Whisper, si el bundle incluye los módulos completos.
- Integración nativa con Swift y SwiftUI en macOS, mediante el paquete Swift WhisperKit.
- Soporte para procesamiento de audio en memoria (por ejemplo, desde un micrófono) o desde archivos.
- Sin dependencia de API externas, lo que garantiza privacidad y funcionamiento sin conexión.
- No se dispone de información sobre capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo de ASR puro.

## Casos de uso

- **Transcripción de reuniones en apps de macOS**: integrar el bundle en una app de notas o de videoconferencia para generar transcripciones locales sin enviar audio a la nube. Adecuado por su baja latencia y privacidad.
- **Dictado en aplicaciones de escritorio**: añadir un botón de dictado a un editor de texto o IDE que use el micrófono y transcriba con Whisper, aprovechando la compilación CoreML para un uso fluido.
- **Subtitulación automática de vídeos**: procesar archivos de audio/vídeo localmente para generar subtítulos en español, sin necesidad de servicios externos.
- **Asistente de accesibilidad**: transcribir voz para personas con discapacidad auditiva en tiempo real dentro de una app de macOS, con visualización en pantalla.
- **Aplicación de traducción de voz**: usar la capacidad de traducción del modelo para convertir audio en un idioma a texto en español, útil en herramientas de aprendizaje de idiomas.
- **Pruebas de calidad en desarrollo**: automatizar la verificación de respuestas de voz en aplicaciones de audio mediante transcripción local, sin depender de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER (Word Error Rate), latencia o comparativas con otras implementaciones.

## Requisitos de hardware

- **VRAM estimada**: no disponible; los modelos CoreML usan la Neural Engine, no VRAM tradicional de GPU.
- **GPU recomendada**: no aplica; se requiere un Mac con chip Apple Silicon (M1 o superior) para aprovechar la Neural Engine. No se especifica compatibilidad con Intel Macs.
- **GPU consumer**: no aplica, ya que es para macOS.
- **Opciones de despliegue**: el bundle se usa directamente con el paquete Swift WhisperKit; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible en la información proporcionada. En general, WhisperKit en Apple Silicon ofrece transcripción en tiempo real para modelos pequeños, pero no hay datos concretos para este bundle.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Plataforma | Contexto | Parámetros |
|---|---|---|---|---|---|
| `aoiandroid/whisperkit-coreml-macos` | CoreML `.mlmodelc` | MIT | macOS | no disponible | no disponible |
| `argmaxinc/whisperkit-coreml` | CoreML `.mlmodelc` | MIT | iOS/macOS | no disponible | no disponible |
| `whisper.cpp` (ggml) | GGML/GGUF | MIT | Multiplataforma | 30 s de audio | variable (tiny, base, small, medium, large) |

El modelo `aoiandroid` es una recompilación específica para macOS de los bundles de `argmaxinc`, mientras que `whisper.cpp` es una implementación en C++ que soporta múltiples plataformas y cuantizaciones. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- **Sesgos y errores**: al ser una compilación de Whisper, hereda los sesgos del modelo original, que puede tener errores en acentos regionales, ruido de fondo o términos técnicos.
- **Riesgo de alucinación**: Whisper puede generar texto incorrecto en audio de baja calidad o con silencios, lo que puede afectar transcripciones de producción.
- **Limitaciones de idioma**: aunque el modelo original soporta 99 idiomas, este bundle no especifica cuáles incluye; se recomienda verificar el comportamiento en el idioma objetivo.
- **Contexto de audio**: Whisper procesa ventanas de 30 segundos; la transcripción de audio largo requiere segmentación, lo que puede afectar la coherencia.
- **Licencia MIT**: permite uso comercial, pero los pesos subyacentes de Whisper original tienen licencia MIT (OpenAI), aunque se recomienda revisar los términos del modelo base.
- **Compatibilidad**: el bundle está compilado para macOS, no para iOS; el repositorio hermano `aoiandroid/whisperkit-coreml-ios` es el adecuado para iOS.
- **Sin soporte de herramientas**: es un modelo de ASR puro, no admite function calling ni razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/aoiandroid/whisperkit-coreml-macos](https://huggingface.co/aoiandroid/whisperkit-coreml-macos)
- Repositorio de pesos originales: [https://huggingface.co/argmaxinc/whisperkit-coreml](https://huggingface.co/argmaxinc/whisperkit-coreml)
- Guía de uso de WhisperKit CoreML: [https://aiindigo.com/tutorials/getting-started-with-whisperkit-coreml-privacy-first-on-device-speech-recognitio](https://aiindigo.com/tutorials/getting-started-with-whisperkit-coreml-privacy-first-on-device-speech-recognitio)
- Repositorio GitHub de WhisperKit: [https://github.com/analogpvt/WhisperKit](https://github.com/analogpvt/WhisperKit)
- Blog sobre WhisperKit en macOS: [https://www.helrabelo.dev/blog/whisperkit-on-macos-integrating-on-device-ml](https://www.helrabelo.dev/blog/whisperkit-on-macos-integrating-on-device-ml)
