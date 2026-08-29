# dianavdavidson/indicwav2vec-hindi-vaani-62017-normalized-alldata-1e-4-epochs-50-FT

## Resumen

Este modelo es un fine-tuning de `ai4bharat/indicwav2vec-hindi`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Wav2Vec2, preentrenado por el consorcio AI4Bharat sobre 40 lenguas indias y posteriormente especializado en hindi. El autor, `dianavdavidson`, ha ajustado el modelo sobre un conjunto de datos no especificado (el nombre sugiere la partición "Vaani" del corpus, con 62.017 muestras normalizadas), durante 50 épocas con una tasa de aprendizaje de 1e-4.

El modelo resultante alcanza una pérdida de validación de 0,3620 y un WER global de 13,40 sobre el conjunto de evaluación, lo que indica un rendimiento razonable para transcripción de hindi, aunque sin datos comparativos públicos. Con 315 millones de parámetros, es un modelo compacto que puede ejecutarse en GPUs de consumo, lo que lo hace accesible para prototipos y aplicaciones de ASR en hindi. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual radica en que cubre una necesidad específica: transcripción de audio en hindi con un modelo ligero y de código abierto, en un ecosistema donde la mayoría de soluciones ASR están dominadas por modelos multilingües grandes o servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder transformer con CNN front-end) |
| Parametros totales | 315.480.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del audio de entrada, típicamente hasta 30 s en Wav2Vec2) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | Hindi (el modelo base soporta 40 lenguas indias, pero este fine-tune está especializado en hindi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, que combina una red convolucional para extraer características de la señal de audio cruda con un encoder transformer que modela dependencias temporales. El modelo base `ai4bharat/indicwav2vec-hindi` fue preentrenado de forma auto-supervisada sobre 40 lenguas indias y posteriormente fine-tuneado para ASR en hindi. Este fine-tune adicional se realizó con el framework Hugging Face Transformers (versión 5.13.0) y PyTorch 2.6.0, utilizando el optimizador AdamW con betas (0.9, 0.999), un scheduler constante con warmup de 500 pasos, y entrenamiento en precisión mixta (AMP nativo).

El dataset de entrenamiento no está documentado en la model card, aunque el nombre del repositorio sugiere que proviene de la colección Vaani (62.017 muestras normalizadas). Se emplearon 50 épocas con un batch efectivo de 64 (32 × 2 de acumulación de gradientes). No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de ASR supervisado clásico.

## Capacidades

- Transcripción de audio en hindi a texto, con una tasa de error de palabra (WER) global de 13,40 en el conjunto de evaluación.
- Procesamiento de audio muestreado a 16 kHz (formato estándar de Wav2Vec2).
- Reconocimiento de habla continua, incluyendo habla espontánea y con ruido de fondo moderado, dado el entrenamiento con datos normalizados.
- No soporta tool calling, razonamiento multi-paso ni generación de texto libre; es un modelo puramente discriminativo para ASR.
- Capacidades multilingües limitadas: aunque el modelo base fue preentrenado en 40 lenguas, este fine-tune está especializado en hindi y no se garantiza un buen rendimiento en otros idiomas.
- No dispone de modo "thinking" ni capacidades de visión o audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en hindi: el modelo puede convertir grabaciones de audio en actas textuales, aprovechando su WER de 13,4 para entornos controlados. Se integraría con pipelines de audio que segmenten la señal en fragmentos de 30 segundos.
- Subtitulado automático de vídeos en hindi: adecuado para plataformas de contenido, donde se procesan pistas de audio y se generan subtítulos sincronizados. Su tamaño compacto permite ejecutarlo en servidores con GPUs modestas.
- Asistentes de voz para aplicaciones móviles: al ser un modelo ligero (315M parámetros), puede desplegarse en entornos edge con cuantización (aunque no se proporcionan pesos cuantizados, se puede convertir a ONNX o TensorRT).
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas en hindi para extraer métricas de calidad o detectar intenciones. El modelo maneja habla conversacional, aunque el WER puede degradarse con acentos regionales.
- Archivado y búsqueda de contenido audiovisual: indexación de archivos de audio históricos en hindi, permitiendo búsqueda por texto dentro de grabaciones. Su licencia Apache 2.0 facilita su integración en sistemas propietarios.
- Investigación académica en ASR para lenguas de bajos recursos: sirve como punto de partida para fine-tuning en dialectos del hindi o para estudiar técnicas de adaptación a dominios específicos, dado que el modelo base ya cubre diversidad lingüística india.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación (0,3620) y el WER global (13,40) sobre un conjunto de evaluación no especificado. No hay comparación con otros modelos ASR como Whisper, Google Speech-to-Text o el propio IndicWav2Vec base. Los resultados de entrenamiento muestran una mejora progresiva del WER desde 90,71 (época 1) hasta 13,40 (época 49), con una tendencia a estabilizarse a partir de la época 30.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315M parámetros en fp32 (~1,26 GB), se necesitan al menos 2 GB de VRAM para inferencia básica. En fp16 (~630 MB), bastan 1-2 GB. Para batch de 8 o más, se recomienda 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Para despliegue en producción con mayor throughput, una RTX 3090 o A10 es suficiente.
- Sí cabe en GPUs de consumo: una RTX 3060 (12 GB) puede ejecutar el modelo con batch moderado y cuantización a int8 (si se convierte).
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante librerías como `transformers` con pipeline de ASR. Para producción, se recomienda usar `torchaudio` o `onnxruntime` para optimizar la latencia. No hay soporte nativo para vLLM o TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles. Como referencia, un Wav2Vec2 de 315M parámetros procesa audio en tiempo real en una GPU moderna (factor de 10-20× más rápido que tiempo real), pero no hay datos específicos de este fine-tune.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia cualitativa, se puede comparar con:

| Modelo | Parámetros | Contexto | WER (hindi) | Licencia |
|---|---|---|---|---|
| Este modelo | 315M | no disponible | 13,40 (eval. desconocida) | Apache 2.0 |
| ai4bharat/indicwav2vec-hindi (base) | 315M | no disponible | no publicado | Apache 2.0 |
| Whisper small (multilingüe) | 244M | 30 s audio | ~15-20 (estimado) | MIT |
| Whisper medium (multilingüe) | 769M | 30 s audio | ~10-15 (estimado) | MIT |

Los datos de Whisper son estimaciones no verificadas; no se dispone de benchmarks oficiales para hindi en la información proporcionada. La comparación real requeriría evaluar ambos modelos sobre el mismo conjunto de test.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer su composición, posibles sesgos o cobertura de acentos y dialectos. El nombre sugiere datos de Vaani, pero no se confirma.
- El WER de 13,40 se obtuvo sobre un conjunto de evaluación desconocido; puede no ser representativo de entornos reales con ruido, solapamiento de hablantes o acentos regionales.
- No se proporcionan pesos cuantizados ni formatos optimizados (ONNX, TensorRT), por lo que el despliegue en producción requiere conversión manual.
- El modelo está especializado en hindi; su uso en otros idiomas indios probablemente degrade significativamente el rendimiento.
- Al ser un modelo de ASR discriminativo, no genera texto libre ni maneja contextos conversacionales largos; solo transcribe audio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios específicos (médico, legal, etc.).
- No hay información sobre la procedencia de los datos de audio (posibles problemas de privacidad o consentimiento), lo que debe evaluarse antes de usar en aplicaciones con datos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indicwav2vec-hindi-vaani-62017-normalized-alldata-1e-4-epochs-50-FT
- Modelo base: https://huggingface.co/ai4bharat/indicwav2vec-hindi
- Repositorio de AI4Bharat IndicWav2Vec: https://github.com/AI4Bharat/IndicWav2Vec
- Página de modelos de AI4Bharat: https://models.ai4bharat.org/
