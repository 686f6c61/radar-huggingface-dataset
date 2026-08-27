# aoiandroid/nemotron-multilingual-0.6b-coreml-macos

## Resumen

El modelo `aoiandroid/nemotron-multilingual-0.6b-coreml-macos` es una compilación en formato Core ML (`.mlmodelc`) del modelo de reconocimiento automático del habla (ASR) `Nemotron-3.5-ASR-Streaming-Multilingual-0.6b`, desarrollado originalmente por NVIDIA. Esta versión específica ha sido preparada por el usuario `aoiandroid` para su integración en la aplicación TranslateBlue en macOS, con una variante hermana para iOS. El modelo resuelve el problema de transcripción de voz en tiempo real con baja latencia y soporte multilingüe, cubriendo más de 40 idiomas en una única pasada de inferencia.

La arquitectura subyacente es un FastConformer-RNNT con 0.6 mil millones de parámetros, optimizado para streaming y consciente de la caché (cache-aware). Su relevancia actual radica en que permite sustituir despliegues separados de modelos como Whisper por un único modelo multilingüe eficiente, tanto en entornos de servidor como en dispositivos Apple. La compilación Core ML está pensada para ejecutarse de forma nativa en el Neural Engine (ANE) de los chips Apple Silicon, lo que reduce la latencia y el consumo energético en aplicaciones de escritorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (prompt-conditioned, cache-aware) |
| Parametros totales | 0.6 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 40+ (según la documentación del modelo original) |
| Licencia | MIT |
| Formato de pesos | .mlmodelc (compilado), .mlpackage (manifest) |

## Arquitectura y entrenamiento

El modelo base `Nemotron-3.5-ASR-Streaming-Multilingual-0.6b` emplea una arquitectura FastConformer-RNNT, una variante del conformer optimizada para velocidad y eficiencia en tareas de ASR. El decodificador RNNT (Recurrent Neural Network Transducer) permite la transcripción en streaming, es decir, procesa audio de forma incremental sin esperar a la frase completa. Además, es "prompt-conditioned", lo que significa que puede recibir instrucciones textuales para adaptar el estilo o el dominio de la transcripción, y "cache-aware", optimizando el uso de la caché para reducir la latencia en inferencias repetidas.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación o fine-tuning) no están disponibles en la información proporcionada. La compilación Core ML no modifica los pesos del modelo, sino que los convierte al formato optimizado para Apple, manteniendo la arquitectura original. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de ASR, no de un LLM generativo.

## Capacidades

- Transcripción de voz en tiempo real (streaming) con baja latencia, adecuada para subtitulación en directo y asistentes de voz.
- Soporte multilingüe: más de 40 idiomas en un único modelo, sin necesidad de cargar modelos separados por idioma.
- Condicionamiento por prompt: permite ajustar el estilo de transcripción (por ejemplo, vocabulario técnico, formato de puntuación) mediante instrucciones textuales.
- Eficiencia en dispositivos Apple: compilado a Core ML, aprovecha el Neural Engine de los chips M1/M2/M3 para inferencia local sin conexión.
- Integración con TranslateBlue: diseñado específicamente para la aplicación de traducción y transcripción, aunque puede usarse de forma independiente.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es exclusivamente un modelo de ASR.

## Casos de uso

- Subtitulación en directo para vídeo o conferencias: el modelo procesa audio en streaming y genera subtítulos en tiempo real, con latencia inferior a la de modelos no optimizados, gracias a su arquitectura RNNT y a la compilación Core ML.
- Transcripción de reuniones y entrevistas: puede integrarse en aplicaciones de productividad para convertir grabaciones de audio en texto, con soporte multilingüe que cubre equipos internacionales.
- Asistentes de voz en macOS: al ejecutarse localmente, permite comandos de voz y dictado sin enviar audio a la nube, mejorando la privacidad y reduciendo la dependencia de servicios externos.
- Traducción asistida: combinado con un motor de traducción, el modelo transcribe el audio en el idioma original y luego se traduce, como hace TranslateBlue, facilitando la comunicación entre hablantes de distintos idiomas.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real puede mostrarse en pantalla durante eventos o llamadas, mejorando la inclusión.
- Análisis de llamadas de atención al cliente: el modelo puede transcribir conversaciones telefónicas en varios idiomas para su posterior análisis de sentimiento o extracción de información, con la ventaja de ejecutarse en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo original (Celon, DeepInfra) menciona su idoneidad para transcripción streaming y batch, pero no proporciona métricas numéricas como WER (Word Error Rate) o comparativas con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio es de 2.4 GB, lo que sugiere que el modelo compilado puede cargarse en la memoria unificada de un Mac con Apple Silicon (8 GB o más).
- GPU recomendada: cualquier chip Apple Silicon (M1, M1 Pro, M1 Max, M2, M2 Pro, M2 Max, M3, etc.). El modelo está compilado para Core ML y puede usar el Neural Engine (ANE) para aceleración.
- Compatibilidad con GPU de consumo: no aplica, ya que el formato Core ML es exclusivo de los ecosistemas Apple. No se puede ejecutar en GPUs NVIDIA o AMD.
- Opciones de despliegue: integración directa en aplicaciones macOS mediante Core ML (por ejemplo, a través de TranslateBlue). También es posible usar el modelo original en servidores con frameworks como DeepInfra, vLLM o TGI, pero esta compilación concreta está limitada a macOS.
- Latencia y throughput: no se proporcionan datos específicos. La arquitectura FastConformer-RNNT y la compilación Core ML están diseñadas para baja latencia en streaming, pero los valores exactos dependen del hardware y de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-ASR-Streaming-Multilingual-0.6b (original) | 0.6B | FastConformer-RNNT | 40+ | MIT | PyTorch / ONNX |
| Whisper (openai/whisper-small) | 244M | Transformer encoder-decoder | 99 | MIT | PyTorch / GGUF |
| Whisper (openai/whisper-large-v3) | 1.5B | Transformer encoder-decoder | 99 | MIT | PyTorch / GGUF |

La comparativa se basa en el modelo original, ya que la compilación Core ML no altera las capacidades. Whisper es el competidor más directo en tareas de ASR multilingüe, pero no está optimizado para streaming de baja latencia (aunque existen variantes como Whisper Streaming). Nemotron ofrece una arquitectura RNNT específica para streaming y un tamaño menor que Whisper-large, lo que lo hace más adecuado para despliegues en dispositivos con recursos limitados. La licencia MIT permite uso comercial sin restricciones, al igual que Whisper.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del modelo. Como todo sistema de ASR, puede presentar errores en acentos, ruido de fondo o habla solapada, especialmente en idiomas con menos representación en los datos de entrenamiento.
- Riesgo de alucinación: en ASR, el riesgo de alucinación se manifiesta como transcripciones incorrectas o inventadas cuando el audio es ambiguo o de baja calidad. No se han documentado casos concretos para este modelo.
- Limitaciones de contexto: al ser un modelo de audio, no tiene una ventana de contexto textual. La longitud máxima de audio procesable no está especificada; en streaming, la transcripción es continua, pero puede haber límites prácticos según la implementación.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright. No hay restricciones adicionales conocidas.
- Dependencia del ecosistema Apple: esta compilación concreta solo funciona en macOS (y la variante iOS). No es portable a otros sistemas operativos sin convertir los pesos al formato original.
- Falta de documentación técnica: la model card no incluye detalles sobre el entrenamiento, los datos utilizados ni las métricas de rendimiento, lo que dificulta la evaluación rigurosa antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: [aoiandroid/nemotron-multilingual-0.6b-coreml-macos](https://huggingface.co/aoiandroid/nemotron-multilingual-0.6b-coreml-macos)
- Modelo fuente: [FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML](https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML)
- Manifest del modelo: [manifest.json](https://huggingface.co/aoiandroid/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML/blob/main/manifest.json)
- Ficha del modelo en Celon: [Nemotron 3.5 Asr Streaming Multilingual 0.6B](https://www.celon.ai/en/models/nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b)
- Página de NVIDIA Nemotron: [NVIDIA Developer - Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- Despliegue en DeepInfra: [Nemotron-3.5-ASR-Streaming-Multilingual-0.6b](https://deepinfra.com/nvidia/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b)
