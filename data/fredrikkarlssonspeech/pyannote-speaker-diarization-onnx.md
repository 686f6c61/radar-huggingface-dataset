# FredrikKarlssonSpeech/pyannote-speaker-diarization-onnx

## Resumen

El modelo `FredrikKarlssonSpeech/pyannote-speaker-diarization-onnx` es una exportación a ONNX de los dos componentes neuronales del sistema de diarización de hablantes `pyannote/speaker-diarization-community-1`, desarrollado por el equipo de pyannote. La diarización de hablantes consiste en determinar quién habla y cuándo en un audio, una tarea fundamental para transcripción de reuniones, análisis de llamadas o subtitulación. Este export permite ejecutar la segmentación y la extracción de embeddings de hablante con ONNX Runtime, lo que facilita el despliegue en entornos de producción sin depender de PyTorch.

El modelo se compone de dos redes: un modelo de segmentación PyanNet (5,6 MB en FP32) que produce probabilidades de actividad de hasta tres hablantes solapados, y un modelo de embeddings WeSpeakerResNet34 (25 MB en FP32) que genera representaciones de 256 dimensiones por segmento de audio. La exportación se realizó con el exportador legacy de TorchScript (opset 17) y se validó numéricamente contra los checkpoints originales. La licencia es CC-BY-4.0, heredada del modelo base. No se trata de un modelo de lenguaje, sino de un pipeline de audio especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PyanNet (segmentación) + WeSpeakerResNet34 (embeddings) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio, ventana de 10 s para segmentación) |
| Tipos de cuantizacion | FP32, FP16 (solo segmentación), INT8 (dinámica) |
| Idiomas soportados | Multilingüe (independiente del idioma, procesa audio) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX de dos redes preentrenadas del repositorio `pyannote/speaker-diarization-community-1`. La primera, PyanNet, es una red de segmentación basada en LSTM que procesa la forma de onda a 16 kHz y produce, por cada frame (~58,8 Hz), probabilidades logarítmicas sobre un encoding de powerset de tres hablantes: silencio, cada hablante solo y cada par solapado. La segunda, WeSpeakerResNet34, es un extractor de embeddings de hablante que toma filtros Mel (fbank de 80 bandas) y devuelve un vector de 256 dimensiones. El frontend de fbank no es trazable a ONNX, por lo que se calcula por separado en Python con `torchaudio.compliance.kaldi.fbank`.

El entrenamiento original del modelo base no se detalla en la información disponible; solo se indica que es un modelo comunitario de pyannote. La exportación se realizó con `torch.onnx.export` en modo legacy (`dynamo=False`), ya que el exportador moderno falla con el LSTM de PyanNet. Se validó la equivalencia numérica con los checkpoints PyTorch: diferencias máximas de 2,3e-5 en FP32 para segmentación y 1,4e-7 para embeddings. Las versiones cuantizadas (FP16 e INT8) mantienen un 100% de acuerdo en `argmax` para segmentación y una similitud coseno de 0,991 para embeddings INT8.

## Capacidades

- Diarización de hablantes: identifica hasta tres hablantes simultáneos, incluyendo solapamiento, mediante el encoding de powerset.
- Detección de actividad de voz (VAD): la clase de silencio del modelo de segmentación permite separar voz de no voz.
- Detección de cambio de hablante: los cambios en la clase activa a lo largo de los frames indican transiciones entre hablantes.
- Detección de solapamiento: las clases de pares de hablantes permiten detectar cuándo dos personas hablan a la vez.
- Extracción de embeddings de hablante: genera vectores de 256 dimensiones para agrupamiento (clustering) o verificación de identidad.
- Multilingüe: al operar sobre audio, no depende del idioma hablado; funciona con cualquier lengua.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: se combina la salida de segmentación (quién habla cuándo) con un ASR externo para etiquetar cada turno de palabra con su orador. El modelo es adecuado por su capacidad de manejar solapamientos y su bajo coste computacional.
- Análisis de llamadas de servicio al cliente: permite extraer métricas como tiempo de habla por agente, detección de interrupciones o momentos de silencio, usando la salida de VAD y cambio de hablante.
- Subtitulación de vídeos con identificación de interlocutores: en entrevistas o programas con varios participantes, se puede asignar cada subtítulo al hablante correcto, mejorando la accesibilidad.
- Verificación de hablante en sistemas de autenticación: los embeddings de 256 dimensiones pueden compararse por similitud coseno para confirmar la identidad de una voz.
- Indexación de archivos de audio: para búsqueda por hablante en grandes colecciones (pódcasts, archivos judiciales), se generan embeddings y se agrupan con clustering.
- Procesamiento en tiempo real en dispositivos edge: al ser modelos ONNX ligeros (menos de 30 MB en FP32), pueden ejecutarse en CPU o GPU de baja potencia, por ejemplo en asistentes de voz o sistemas de videoconferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye validación numérica contra los checkpoints PyTorch, no métricas de precisión de diarización (como DER, diarization error rate) sobre conjuntos de datos estándar. Para evaluar el rendimiento real, se recomienda consultar la documentación de `pyannote/speaker-diarization-community-1` o ejecutar pruebas propias con el corpus de interés.

## Requisitos de hardware

- VRAM estimada: los modelos en FP32 suman unos 30,6 MB de pesos, más overhead de inferencia; caben en cualquier GPU con al menos 1 GB de VRAM. Las versiones INT8 reducen el peso a 1,5 + 6,4 = 7,9 MB.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, o incluso integradas) es suficiente. También puede ejecutarse en CPU con ONNX Runtime, con latencia mayor pero aceptable para procesamiento por lotes.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo, incluso en Raspberry Pi con CPU ARM si se usa INT8.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), también se puede integrar con servicios como Azure ML o AWS SageMaker. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. Para un chunk de 10 s, la segmentación produce 589 frames; en CPU moderna se espera un tiempo de inferencia del orden de decenas de milisegundos, y en GPU aún menor.

## Comparativa con modelos similares

| Modelo | Formato | Componentes | Tamaño (FP32) | Licencia | Notas |
|---|---|---|---|---|---|
| pyannote/speaker-diarization-community-1 | PyTorch | PyanNet + WeSpeakerResNet34 + PLDA | ~30 MB (solo redes) | CC-BY-4.0 | Modelo base original, incluye clustering PLDA |
| pyannote/speaker-diarization-3.1 | PyTorch | PyanNet + WeSpeakerResNet34 + PLDA | ~30 MB (solo redes) | MIT (modelo) | Versión más reciente, con mejoras de rendimiento |
| Este modelo (ONNX) | ONNX | PyanNet + WeSpeakerResNet34 (sin PLDA) | ~30 MB (FP32) | CC-BY-4.0 | Export listo para ONNX Runtime, sin clustering |

La comparativa se basa en características técnicas, ya que no hay benchmarks públicos para este export. La principal ventaja de este modelo es su formato ONNX, que facilita el despliegue en entornos sin PyTorch. La desventaja es que no incluye el clustering PLDA, por lo que el usuario debe implementarlo o usar `pyannote.audio` para la parte final.

## Limitaciones y advertencias

- No incluye el clustering PLDA: la agrupación de embeddings en hablantes finales debe implementarse externamente (por ejemplo, con numpy o usando `pyannote.audio`).
- No hay versión FP16 del modelo de embeddings: la conversión a FP16 falla por un desajuste de tipos en el subgrafo de stats-pooling; solo están disponibles FP32 e INT8.
- Requiere resampleo a 16 kHz: el modelo espera audio monoaural a 16 kHz; cualquier otra tasa de muestreo debe convertirse previamente.
- Validación limitada: la model card solo verifica la equivalencia numérica con los checkpoints originales, no la precisión de diarización en conjuntos de datos reales. Se recomienda validar con audio propio antes de usar en producción.
- Riesgo de alucinación: al ser un modelo discriminativo de audio, no genera texto, pero puede producir falsos positivos de hablante en entornos ruidosos o con solapamiento extremo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero hay que revisar las condiciones del modelo base original, que puede tener restricciones adicionales.
- Dependencia de `torchaudio` para el frontend fbank: aunque la inferencia usa ONNX Runtime, el cálculo de filtros Mel requiere PyTorch y torchaudio, lo que limita el despliegue en entornos sin estas librerías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FredrikKarlssonSpeech/pyannote-speaker-diarization-onnx
- Modelo base original: https://huggingface.co/pyannote/speaker-diarization-community-1
- Repositorio pyannote-audio: https://github.com/pyannote/pyannote-audio
- Documentación de pyannote: https://pyannote.github.io/
- Modelo pyannote/speaker-diarization-3.1: https://huggingface.co/pyannote/speaker-diarization-3.1
