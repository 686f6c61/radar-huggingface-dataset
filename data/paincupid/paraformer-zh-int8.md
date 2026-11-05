# paincupid/Paraformer-ZH-INT8

## Resumen

Paraformer-ZH-INT8 es una conversión a ONNX en cuantización INT8 del modelo Paraformer de reconocimiento automático de voz (ASR) en chino, desarrollado originalmente por Alibaba DAMO Academy y publicado a través del proyecto FunASR. Esta versión concreta ha sido producida por csukuangfj para garantizar compatibilidad con el runtime Sherpa, y el repositorio de HuggingFace que nos ocupa es un espejo de respaldo mantenido por el usuario paincupid, que no es el publicador original.

El modelo resuelve la transcripción de audio en mandarín (zh) mediante una arquitectura no autorregresiva basada en el paradigma Paraformer, que predice la salida completa en paralelo en lugar de token a token, lo que reduce la latencia frente a los sistemas ASR autorregresivos clásicos. La conversión a ONNX con cuantización INT8 facilita el despliegue en entornos de producción con recursos limitados, sin requerir frameworks de deep learning pesados.

El repositorio tiene un tamaño de 1.0 GB y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial. Es relevante para desarrolladores que necesitan un motor ASR en chino desplegable en CPU o GPU con ONNX Runtime o Sherpa-ONNX, y que valoran la reproducibilidad mediante commits fijados y hashes SHA-256 documentados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paraformer (ASR no autorregresivo, transformer con predictor de longitud) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

Paraformer es un modelo de reconocimiento automático de voz no autorregresivo propuesto por Alibaba DAMO Academy. A diferencia de los sistemas ASR secuenciales que generan tokens uno a uno, Paraformer incorpora un predictor de longitud (length predictor) que estima el número de tokens de salida y un decodificador que emite toda la secuencia en paralelo, lo que reduce la latencia de inferencia. La arquitectura se basa en bloques transformer con atención y capas feed-forward, adaptados al procesamiento de características acústicas.

El entrenamiento original fue realizado por el equipo de FunASR sobre corpus de habla en chino, aunque los detalles concretos sobre número de horas de audio, composición del dataset y técnicas de regularización no están disponibles en la información proporcionada. Esta versión concreta es una conversión a ONNX con cuantización INT8 realizada por csukuangfj, con commits upstream fijados y verificación de integridad mediante SHA-256, orientada a la compatibilidad con Sherpa.

## Capacidades

- Reconocimiento automático de voz en chino (mandarín) a partir de audio.
- Decodificación no autorregresiva con predicción de longitud, lo que permite transcripción en paralelo.
- Ejecución mediante ONNX Runtime y Sherpa-ONNX, sin dependencia de PyTorch en tiempo de inferencia.
- Cuantización INT8 que reduce el tamaño y acelera la inferencia en CPU.
- Compatibilidad con el ecosistema Sherpa para pipelines de voz.
- No soporta tool calling, agentes, visión ni generación de texto libre; es un modelo especializado en ASR.
- Capacidades multilingües limitadas al chino según la información disponible.

## Casos de uso

- Transcripción de reuniones y actas en chino: el modelo convierte audio de reuniones en texto para generar resúmenes posteriores, aprovechando su decodificación en paralelo para procesar grabaciones largas con baja latencia.
- Subtitulado automático de vídeo en mandarín: integrado en un pipeline de procesamiento de medios, transcribe pistas de audio y genera subtítulos sincronizados para plataformas de contenido.
- Atención al cliente por voz: sirve como capa ASR en sistemas de IVR o asistentes telefónicos en chino, transcribiendo la consulta del usuario antes de pasarla a un motor de NLU.
- Búsqueda y análisis de archivos de audio: permite indexar grabaciones de llamadas o podcasts en chino para búsqueda por texto y análisis de sentimiento posterior.
- Despliegue en dispositivos edge o servidores sin GPU: gracias a la cuantización INT8 y al formato ONNX, puede ejecutarse en CPU con ONNX Runtime o Sherpa-ONNX en entornos con recursos limitados.
- Generación de transcripciones para accesibilidad: convierte audio en texto para personas con discapacidad auditiva en contextos de habla china, con integración en aplicaciones de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1.0 GB en total, y la cuantización INT8 reduce el peso del modelo respecto a la versión FP32.
- GPU recomendadas: no disponible; al ser un modelo ONNX INT8, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime (por ejemplo, CUDA).
- Compatibilidad con GPU de consumo: probable en GPUs con suficiente memoria para el grafo ONNX, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime, Sherpa-ONNX (compatible con Sherpa), y potencialmente otros runtimes que acepten ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Paraformer-ZH-INT8 (este) | Paraformer ASR | chino | INT8 | Apache-2.0 | ONNX |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | FP16/INT8 | MIT | PyTorch, ONNX, GGML |
| Wav2Vec2 (Meta) | CNN + transformer | multilingüe | FP16/INT8 | Apache-2.0 | PyTorch, ONNX |
| FunASR Paraformer original | Paraformer ASR | chino | FP32 | Apache-2.0 | PyTorch |

La comparación con Whisper y Wav2Vec2 es aproximada, ya que son modelos ASR de propósito general con soporte multilingüe, mientras que este modelo está especializado en chino y optimizado para ONNX INT8. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo no oficial: el repositorio lo mantiene paincupid, no el publicador original, aunque se preservan avisos y hashes de integridad.
- Especializado únicamente en chino; no se garantiza rendimiento en otros idiomas.
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling ni razonamiento multi-paso.
- La cuantización INT8 puede introducir una ligera degradación en la precisión de transcripción frente a la versión FP32, aunque no se cuantifica en la información disponible.
- Riesgo de errores en audio con ruido, acentos marcados o vocabulario técnico no cubierto por el entrenamiento original.
- Licencia Apache-2.0 permite uso comercial, pero el espejo no otorga derechos adicionales sobre archivos de terceros incluidos.
- No se especifican límites de duración de audio ni requisitos de sample rate en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/paincupid/Paraformer-ZH-INT8
- FunASR (proyecto original): no disponible en la información proporcionada
- Repositorio Sherpa-ONNX: no disponible en la información proporcionada
- Paper de Paraformer: no disponible en la información proporcionada
