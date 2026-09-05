# Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml

## Resumen

El modelo `Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml` es un sistema de reconocimiento automático de voz (ASR) en streaming, basado en NVIDIA Nemotron 3.5 ASR streaming 0.6B. Lo publica Lorqa como un espejo byte-idéntico de la conversión a Core ML INT8 realizada por aufklarer, sin modificaciones en pesos, tokenizador ni configuración. Está pensado para ejecutarse en dispositivos Apple con Apple Silicon mediante Core ML, aprovechando el Neural Engine para transcripción de audio en tiempo real.

El modelo resuelve la necesidad de subtitulado y transcripción en vivo con baja latencia en dispositivos locales, sin depender de servicios en la nube. Soporta chino, inglés y japonés, además de un modo multilingüe, y procesa audio en chunks de 320 ms. Su tamaño es de 0.6B y el paquete descargable ocupa 642 MB (612 MiB). La arquitectura Core ML combina un encoder cuantizado en INT8 con un decoder y una joint en FP16, lo que permite una ejecución eficiente en el ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de ASR en streaming basado en NVIDIA Nemotron 3.5 (encoder INT8, decoder y joint FP16 en Core ML) |
| Parametros totales | 0.6B (según denominación del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR, no aplica contexto de texto) |
| Tipos de cuantizacion | INT8 (encoder), FP16 (decoder y joint) |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), multilingüe |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Core ML (encoder INT8, decoder/joint FP16) |

## Arquitectura y entrenamiento

El modelo es una conversión a Core ML del ASR de streaming de NVIDIA Nemotron 3.5, que utiliza una arquitectura encoder-decoder-joint. El encoder se ha cuantizado a INT8 para optimizar la ejecución en el Apple Neural Engine, mientras que el decoder y la joint se mantienen en FP16. La entrada de audio es PCM mono a 16 kHz. El repositorio de Lorqa es un espejo de distribución de la conversión realizada por aufklarer, por lo que los pesos y la configuración permanecen sin cambios. No se dispone de información detallada sobre el proceso de entrenamiento original, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO en la información proporcionada. La conversión a Core ML no implica un reentrenamiento ni una mejora de precisión.

## Capacidades

- Reconocimiento de voz en streaming con chunks de 320 ms, adecuado para aplicaciones de tiempo real.
- Soporte multilingüe para chino, inglés, japonés y un modo general multilingüe (los idiomas y slots de prompt se definen en `languages.json`).
- Detección automática de idioma y soporte de indicaciones BCP-47 explícitas a través del runtime companion.
- Ejecución optimizada para Apple Silicon (Apple Neural Engine) mediante Core ML.
- Entrada de audio PCM mono a 16 kHz.
- Compatibilidad con el runtime de referencia `soniqo/speech-swift` (Apache-2.0), que incluye la implementación de streaming para este modelo.

## Casos de uso

- Subtitulado en vivo en macOS e iOS: el modelo puede generar transcripciones en tiempo real de conversaciones, vídeos o streams, con un chunk de 320 ms que permite una actualización fluida de los subtítulos.
- Transcripción de reuniones y entrevistas en local: en dispositivos Apple, grabar y transcribir reuniones multilingües sin conexión, garantizando la privacidad de los datos.
- Dictado en aplicaciones de productividad: integrar el modelo en apps de notas o procesadores de texto para dictar contenido en inglés, chino o japonés.
- Accesibilidad para personas con discapacidad auditiva: ofrecer subtítulos automáticos en tiempo real en videollamadas o eventos en directo, directamente en el dispositivo.
- Análisis de llamadas de voz: transcribir llamadas grabadas en dispositivos Apple para su posterior análisis, búsqueda o archivado, sin enviar audio a servidores externos.
- Asistente de voz para aplicaciones de streaming: generar subtítulos en tiempo real para contenido de vídeo o audio en apps de entretenimiento, mejorando la experiencia de usuarios que prefieren leer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Ejecución en dispositivos Apple con Apple Silicon (macOS e iOS).
- Optimizado para el Apple Neural Engine a través de Core ML.
- Tamaño de descarga: 642 MB (612 MiB); la memoria en tiempo de ejecución es superior al tamaño de descarga.
- No se especifican requisitos de VRAM (no aplica para GPU NVIDIA).
- Despliegue mediante Core ML, usando el runtime de `soniqo/speech-swift` o el SDK de FluidAudio (para la versión Balanced de 2240 ms, no para este bundle).
- Latencia: el chunk es de 320 ms, pero no se garantiza una latencia end-to-end concreta.

## Comparativa con modelos similares

| Modelo | Duracion chunk | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml | 320 ms | Core ML (INT8/FP16) | OpenMDW 1.1 | HuggingFace |
| Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-coreml (Balanced) | 2240 ms | Core ML | OpenMDW 1.1 | HuggingFace |
| FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML | No disponible | Core ML | No disponible | HuggingFace |

El modelo de Lorqa es un espejo de `aufklarer/Nemotron-3.5-ASR-Streaming-0.6B-CoreML-INT8`, y se diferencia de la versión Balanced principalmente en la duración del chunk (320 ms frente a 2240 ms), lo que afecta al diseño del grafo y la caché.

## Limitaciones y advertencias

- Es un espejo de distribución, no un reentrenamiento; no se realizan afirmaciones de precisión más allá de las declaradas por el autor original.
- La precisión en chino necesita evaluación específica en las grabaciones previstas.
- No debe utilizarse con el gestor de FluidAudio de 2240 ms; el grafo y los diseños de caché difieren entre ambas versiones.
- La duración de chunk de 320 ms no garantiza una latencia end-to-end determinada.
- La licencia OpenMDW 1.1 puede imponer requisitos de atribución; revisar las condiciones antes de un uso comercial.
- Como modelo de ASR, pueden producirse errores de transcripción o alucinaciones, especialmente en entornos ruidosos o con acentos no contemplados en los datos de entrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml)
- [Modelo espejado en HuggingFace](https://huggingface.co/aufklarer/Nemotron-3.5-ASR-Streaming-0.6B-CoreML-INT8)
- [Modelo original en HuggingFace](https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML)
- [Versión Balanced (2240 ms) en HuggingFace](https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-coreml)
- [Runtime de referencia en GitHub](https://github.com/soniqo/speech-swift/tree/ca4daaf9be7cccf230f691e443cd80b7a0bd8d97/Sources/NemotronStreamingASR)
