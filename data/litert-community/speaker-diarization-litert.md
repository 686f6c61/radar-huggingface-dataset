# litert-community/Speaker-Diarization-LiteRT

## Resumen

Speaker-Diarization-LiteRT es una pila de modelos de diarización de hablantes ("quién habló cuándo") diseñada para ejecutarse íntegramente en dispositivos móviles, siguiendo la receta de pyannote/speaker-diarization-3.1. El proyecto, publicado por la comunidad litert-community, combina dos modelos: un extractor de embeddings de hablante WeSpeaker ResNet34 (6,6 M de parámetros) convertido a TFLite para aceleración GPU, y un modelo de segmentación pyannote segmentation-3.0 (PyanNet SincNet+BiLSTM, 1,5 M de parámetros) exportado a ONNX para ejecución CPU. La licencia es MIT para el código, con pesos bajo CC-BY-4.0.

La relevancia de este proyecto radica en que ofrece una alternativa completamente local y en tiempo real a los servicios de diarización en la nube, con verificación de fidelidad frente a las implementaciones de referencia en PyTorch: el embedding en fp16 alcanza una similitud coseno de 0,99997 respecto al modelo original, y la segmentación ONNX muestra una concordancia del 100 % en el argmax por trama. El pipeline completo procesa ventanas deslizantes de 10 segundos, agrupa las unidades de habla por hablante mediante clustering aglomerativo y produce una línea temporal global cosida. Está verificado en un Pixel 8a (Tensor G3) con el embedding ejecutándose completamente en GPU (108/108 nodos LITERT_CL, ~1,2 ms por ventana).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WeSpeaker ResNet34 (embedding) + PyanNet SincNet+BiLSTM (segmentación) |
| Parametros totales | 8,1 M (6,6 M embedding + 1,5 M segmentación) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 5,015 s (embedding, 500 tramas de 80 bins) / 10 s (segmentación, 160 000 muestras) |
| Tipos de cuantizacion | fp16 (embedding TFLite); segmentación ONNX en fp32 |
| Idiomas soportados | no disponible (la diarización es independiente del idioma) |
| Licencia | MIT (código); CC-BY-4.0 (pesos del embedding WeSpeaker) |
| Formato de pesos | TFLite (embedding) y ONNX (segmentación) |

## Arquitectura y entrenamiento

El sistema se compone de dos modelos independientes que se combinan en un pipeline de diarización. El extractor de embeddings es un ResNet34 puro (sin maxpool en el stem) entrenado por WeSpeaker en VoxCeleb, que convierte 5,015 segundos de audio (fbank log-mel de 80 bins con CMN) en un vector de 256 dimensiones. La conversión a TFLite se realizó con litert-torch, requiriendo únicamente un reajuste en el StatsPool (varianza insesgada a escala reducida para seguridad en fp16). El modelo de segmentación es un PyanNet con front-end SincNet y BiLSTM, exportado a ONNX desde pyannote/segmentation-3.0; produce log-probabilidades por trama (~17 ms) sobre las 7 clases del conjunto potencia {∅, s1, s2, s3, s1s2, s1s3, s2s3}, lo que permite modelar hasta 3 hablantes locales con un máximo de 2 simultáneos. No se aplicó RLHF ni DPO; el entrenamiento es supervisado sobre datos anotados de VoxCeleb y los conjuntos de evaluación de pyannote.

## Capacidades

- Diarización de hablantes completa: detecta quién habla y cuándo en conversaciones con hasta 3 hablantes locales y 2 simultáneos.
- Extracción de embeddings de hablante de 256 dimensiones, L2-normalizados, aptos para comparación por similitud coseno y clustering.
- Segmentación por ventanas deslizantes de 10 segundos con solapamiento, permitiendo procesar audio de duración arbitraria.
- Clustering aglomerativo integrado (enlace por centroide, distancia coseno, umbral 0,7046) para agrupar unidades de habla por hablante.
- Ejecución híbrida GPU/CPU: el embedding corre en GPU mediante LiteRT CompiledModel, la segmentación en CPU con onnxruntime.
- Independencia del idioma: al operar sobre características acústicas, funciona con cualquier lengua.
- Adecuado para inferencia en tiempo real en dispositivos móviles Android.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el pipeline puede procesar la grabación de una reunión y generar una línea temporal con los turnos de cada participante, que luego se puede alinear con una transcripción ASR para producir actas con intervenciones etiquetadas.
- Atención al cliente y análisis de llamadas: permite segmentar llamadas de soporte para identificar al agente y al cliente, facilitando el análisis de calidad, la detección de patrones de conversación y la generación automática de resúmenes por interlocutor.
- Búsqueda y recuperación de audio por hablante: con los embeddings de 256 dimensiones se puede indexar una biblioteca de audio y buscar intervenciones de una persona concreta mediante comparación coseno, incluso sin transcripción previa.
- Videoconferencia y grabación de clases: integrable en aplicaciones de grabación para generar capítulos automáticos por ponente, mejorando la navegación en vídeos largos de seminarios o clases.
- Aplicaciones de asistente de voz en el dispositivo: un asistente puede distinguir entre distintos usuarios del hogar y personalizar respuestas o activar perfiles según quién habla, todo sin enviar audio a la nube.
- Análisis forense y de seguridad: procesamiento local de grabaciones de entrevistas o interrogatorios para verificar la identidad de los intervinientes y detectar solapamientos de habla, con la ventaja de que el audio nunca abandona el dispositivo.
- Audiodescripción y accesibilidad: generación de subtítulos con identificación de hablante para personas con discapacidad auditiva, combinando la diarización con un motor ASR local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (DER, JER) en la informacion disponible. Los datos de rendimiento verificados en un Pixel 8a (Tensor G3, Android 16) son:

| Metrica | Valor |
|---|---|
| Residencia GPU del embedding | 108/108 nodos LITERT_CL (1 partición) |
| Latencia del embedding | ~1,2 ms por ventana de 5,015 s |
| Similitud coseno embedding fp16 vs PyTorch | 0,99997 |
| Concordancia segmentación ONNX vs PyTorch | 100 % (argmax por trama) |
| Correlación segmentación ONNX vs PyTorch | 1,0 |
| Tamaño del embedding fp16 | 13,4 MB |

## Requisitos de hardware

- VRAM estimada: no aplica (modelos de 8,1 M de parámetros en total; el embedding ocupa 13,4 MB en fp16).
- GPU recomendadas: cualquier GPU móvil compatible con LiteRT CompiledModel (verificado en Tensor G3); el embedding requiere aceleración GPU, la segmentación se ejecuta en CPU.
- Compatibilidad con hardware de consumo: sí, está diseñado para smartphones Android; no requiere GPU de escritorio.
- Opciones de despliegue: LiteRT (TFLite) para el embedding con acelerador GPU; onnxruntime para la segmentación en CPU. Disponible para Python (ai_edge_litert) y Kotlin/Android (com.google.ai.edge.litert:litert:2.1.5 y com.microsoft.onnxruntime:onnxruntime-android:1.24.3).
- Latencia y throughput: ~1,2 ms por ventana de embedding en Pixel 8a; la segmentación de 10 s de audio se procesa en tiempo real en CPU (sin datos de latencia exactos en la informacion disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Speaker-Diarization-LiteRT (este) | 8,1 M | 10 s (segmentación) | TFLite + ONNX | MIT / CC-BY-4.0 | Optimizado para móvil, GPU + CPU |
| pyannote/speaker-diarization-3.1 | ~29 M (segmentation-3.0 + wespeaker) | 10 s | PyTorch | MIT | Referencia original, requiere GPU/CPU de servidor |
| NeMo diarization (NVIDIA) | ~100 M+ | configurable | PyTorch | Apache-2.0 | Diseñado para servidores, requiere GPU potente |
| Kaldi diarization | variable | configurable | scripts | Apache-2.0 | Enfoque clásico, no optimizado para móvil |

La principal diferencia frente a la referencia pyannote 3.1 es la conversión a formatos de inferencia ligera (TFLite/ONNX) y la verificación de fidelidad numérica, que permite ejecutar el mismo pipeline en un dispositivo móvil con una pérdida mínima de precisión. Frente a NeMo o Kaldi, la ventaja es el tamaño reducido y la idoneidad para despliegue en edge.

## Limitaciones y advertencias

- Máximo de 3 hablantes locales por ventana de 10 segundos y 2 simultáneos; conversaciones con más participantes requieren estrategias adicionales de ventanas o post-procesado.
- El embedding requiere exactamente 500 tramas (5,015 s) de audio; para fragmentos más cortos se aplica tile-padding, lo que puede degradar la calidad de la representación.
- La segmentación procesa ventanas fijas de 10 s; el audio debe muestrearse a 16 kHz mono y normalizarse a [-1, 1].
- Los pesos del embedding WeSpeaker están bajo licencia CC-BY-4.0, que permite uso comercial pero exige atribución; el código es MIT.
- No se proporcionan datos de rendimiento en términos de DER (tasa de error de diarización) sobre conjuntos de evaluación estándar como CALLHOME o AMI.
- La verificación se realizó únicamente en un Pixel 8a; el rendimiento en otros dispositivos puede variar, especialmente en GPUs móviles menos capaces.
- No hay soporte para audio de más de 2 canales; la entrada debe ser mono.
- El umbral de clustering (0,7046) está fijado según la configuración de pyannote 3.1 y puede necesitar ajuste para dominios específicos (p. ej., llamadas telefónicas con compresión).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Speaker-Diarization-LiteRT
- Repositorio del modelo (archivos): https://huggingface.co/litert-community/Speaker-Diarization-LiteRT/tree/main
- LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Ejemplo de integración en Android: https://github.com/john-rocky/LiteRT-Models/tree/main/diarization
- Documentación de LiteRT-LM CLI: https://developers.google.com/edge/litert-lm/cli/usage
- pyannote.audio (referencia): https://github.com/pyannote/pyannote-audio
- WeSpeaker: https://github.com/wenet-e2e/wespeaker
- Modelo base de segmentación: https://huggingface.co/pyannote/segmentation-3.0
- Modelo base de embedding: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM
