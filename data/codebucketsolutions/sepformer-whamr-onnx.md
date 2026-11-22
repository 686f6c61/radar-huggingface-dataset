# codebucketsolutions/sepformer-whamr-onnx

## Resumen

SepFormer WHAMR! ONNX es una exportación a formato ONNX del modelo `speechbrain/sepformer-whamr` de SpeechBrain, realizada por el usuario codebucketsolutions para su uso en el servidor de voz `bolo` sin depender de PyTorch. El modelo original resuelve la separación de dos hablantes en condiciones de ruido y reverberación, una tarea clásica de procesamiento de audio conocida como *speech separation*. La exportación mantiene los pesos originales sin modificar y añade metadatos de procedencia (revisión del repositorio fuente y hashes SHA-256) para garantizar la trazabilidad.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue ligera (solo ONNX Runtime, sin stack PyTorch) para un modelo de separación de habla ampliamente utilizado en investigación; por otro, advierte de sus limitaciones prácticas: entrada mono a 8 kHz, memoria que crece rápidamente con la duración del audio y salida con nivel arbitrario debido a la función de pérdida invariante a escala con la que se entrenó el modelo original.

Arquitectura y entrenamiento corresponden íntegramente al modelo base de SpeechBrain; esta exportación no introduce cambios en los pesos ni en el grafo computacional, solo en el formato de serialización (ONNX, opset 17, float32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (transformer con atención multi-cabezal para separación de habla), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa audio mono a 8 kHz por ventanas (memoria crece con la duración) |
| Tipos de cuantizacion | float32 (el tag `base_model:quantized` aparece en Hugging Face, pero la model card solo documenta float32) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma en teoría; entrenado sobre WSJ0 en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32); incluye `speechbrain_onnx.json`, `export_speechbrain_onnx.py` y `parity.json` |

## Arquitectura y entrenamiento

El modelo base es SepFormer, una arquitectura basada en transformer diseñada específicamente para separación de fuentes de audio. El grafo exportado contiene el encoder, la red de enmascaramiento (*masking network*) y el decoder de `SepformerSeparation.separate_batch` de SpeechBrain. La entrada es un tensor float32 `[1, T]` (mono, 8 kHz) y la salida es `[1, 8 * ((T - 16) // 8) + 16, 2]`, es decir, dos pistas de audio separadas. El encoder opera sobre *strides* completos de 8 muestras, por lo que las pistas pueden rellenarse con ceros hasta la longitud de la entrada.

El entrenamiento original fue realizado por el equipo de SpeechBrain sobre el corpus WHAMR!, que combina WSJ0-2mix (WSJ0, LDC93S6A, con licencia del Linguistic Data Consortium y no redistribuible libremente) con ruido WHAM! (CC BY-NC 4.0) y reverberación simulada. La función de pérdida es invariante a escala (*scale-invariant*), lo que implica que el nivel absoluto de la salida es arbitrario. SpeechBrain reporta 13.7 dB SI-SNRi y 12.7 dB SDRi en el conjunto de test de WHAMR!. La exportación a ONNX no introduce cambios en los pesos; la model card documenta una paridad numérica con PyTorch (SpeechBrain 1.1.2, torch 2.15.0+cpu, ONNX Runtime 1.32.0) con diferencias absolutas máximas entre 1.88e-05 y 2.02e-03 y SI-SNR mínimo de 62.0 dB en el peor caso probado.

## Capacidades

- Separación de dos hablantes simultáneos en una mezcla mono con ruido y reverberación.
- Procesamiento de audio a 8 kHz, con salida de dos pistas float32 alineadas con la entrada.
- Ejecución sin PyTorch: solo requiere ONNX Runtime (opset 17, float32).
- Procesamiento por ventanas para audios largos (la memoria crece con la longitud).
- Trazabilidad de procedencia mediante `speechbrain_onnx.json` (repositorio fuente, revisión y hashes SHA-256).
- No soporta tool calling, agentes, visión, audio de entrada distinto de la mezcla mono o generación de texto: es un modelo puramente de audio-a-audio.
- Capacidades multilingües: no documentadas; el entrenamiento original usa WSJ0 en inglés.

## Casos de uso

- **Transcripción de reuniones y entrevistas con solapamiento de hablantes**: el modelo separa las dos pistas antes de pasarlas a un sistema ASR (Whisper, Wav2Vec2, etc.), mejorando la precisión cuando dos personas hablan a la vez. Adecuado por su entrenamiento específico en mezclas con ruido y reverberación.
- **Pipelines de diarización previa**: como etapa de preprocesado en un sistema de diarización, separando las fuentes antes de la asignación de hablantes. La salida de dos pistas simplifica la tarea de clustering posterior.
- **Despliegue en entornos sin PyTorch**: servicios en producción que solo disponen de ONNX Runtime (contenedores ligeros, entornos embebidos, backends en C++/Rust) pueden usar el modelo sin arrastrar el stack de PyTorch. Es el caso de uso principal documentado por el autor (servidor `bolo`).
- **Procesamiento por lotes de grabaciones cortas**: llamadas de atención al cliente, notas de voz o clips de pocos segundos, donde la memoria del modelo es manejable y el coste por inferencia es bajo.
- **Investigación en separación de habla**: reproducción de resultados de SepFormer en WHAMR! sin necesidad de instalar SpeechBrain, útil para comparativas y validaciones de paridad (el repo incluye `parity.json` con las métricas).
- **Prototipado de aplicaciones de accesibilidad**: separación de voces en grabaciones para personas con dificultades auditivas o para subtitulado automático de contenido con múltiples hablantes.
- **Filtrado de ruido previo a tareas de reconocimiento**: aunque el modelo está entrenado para separación, su entrenamiento con WHAM! le permite operar en presencia de ruido de fondo, lo que lo hace útil como etapa previa en pipelines de ASR en entornos ruidosos.

## Benchmarks y rendimiento

Datos reportados por SpeechBrain para el modelo original (no específicos de la exportación ONNX):

| Metrica | Valor |
|---|---|
| SI-SNRi (WHAMR! test) | 13.7 dB |
| SDRi (WHAMR! test) | 12.7 dB |

Paridad ONNX frente a PyTorch (según `parity.json` de la model card):

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo ONNX vs PyTorch por pista |
|---|---|---|
| ruido, 4003 muestras | 1.88e-05 | 72.8 dB |
| ruido, 3008 muestras | 2.25e-05 | 75.6 dB |
| ruido, 24000 muestras | 2.24e-04 | 67.7 dB |
| ruido, 56005 muestras | 5.10e-04 | 62.0 dB |
| en-long+en-short | 2.02e-03 | 79.6 dB |
| en-long+hi-short | 1.71e-03 | 73.6 dB |
| en-short+hi-short | 1.76e-03 | 71.0 dB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de separación de audio.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; la model card advierte que la memoria crece rápidamente con la longitud del audio (varios GB para un minuto de audio). Para clips cortos (segundos) el consumo es moderado.
- **GPU recomendadas**: no especificadas por el autor. Al ser un modelo pequeño (repo de 0.1 GB) y ejecutarse en ONNX Runtime, es viable en GPUs consumer (RTX 3060, RTX 4090) e incluso en CPU para ventanas cortas.
- **Cabe en GPU consumer**: sí, para ventanas cortas; para audios largos se recomienda procesar en ventanas y concatenar.
- **Opciones de despliegue**: ONNX Runtime (documentado por el autor), integrable en servidores propios como `bolo`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sepformer-whamr-onnx (este) | SepFormer ONNX | audio mono 8 kHz | 13.7 dB SI-SNRi (heredado) | Apache-2.0 | Hugging Face |
| speechbrain/sepformer-whamr | SepFormer PyTorch | audio mono 8 kHz | 13.7 dB SI-SNRi | Apache-2.0 | Hugging Face |
| speechbrain/sepformer-wham | SepFormer PyTorch | audio mono 8 kHz (sin reverberación) | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Modelos de separación tipo Conv-TasNet / DPRNN | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a la variante sin reverberación de SpeechBrain, que son las alternativas directamente documentadas. No se dispone de datos de benchmarks de otros modelos de separación en la información proporcionada.

## Limitaciones y advertencias

- **Nivel de salida arbitrario**: la pérdida invariante a escala implica que la amplitud de las pistas separadas no es comparable con la de la mezcla; hay que normalizar si se necesita un nivel concreto.
- **Memoria**: crece rápidamente con la duración del audio (varios GB por minuto); es obligatorio procesar en ventanas para grabaciones largas.
- **Entrada restringida**: solo audio mono a 8 kHz; no acepta estéreo ni frecuencias de muestreo superiores sin remuestreo previo.
- **Solo dos hablantes**: el modelo está entrenado para mezclas de dos fuentes; no separa tres o más hablantes.
- **Idioma**: el entrenamiento original usa WSJ0 (inglés); el rendimiento en otros idiomas no está documentado.
- **Licencia del dataset**: aunque el modelo es Apache-2.0, los datos de entrenamiento incluyen WSJ0 (LDC, no redistribuible) y WHAM! (CC BY-NC 4.0), lo que puede afectar a la redistribución de derivados según la interpretación legal.
- **No es una release oficial**: la exportación la mantiene un tercero (codebucketsolutions); no cuenta con el respaldo del equipo de SpeechBrain.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí puede producir artefactos o separaciones incorrectas en mezclas muy ruidosas o con hablantes solapados de forma no vista en entrenamiento.
- **Sesgos**: no documentados; al entrenarse con un corpus limitado (WSJ0, hablantes y condiciones acústicas concretas), puede generalizar peor a dominios alejados (acentos, ruidos industriales, etc.).
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial del modelo, pero las condiciones de los datos de entrenamiento (LDC y CC BY-NC) deben revisarse para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-whamr-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-whamr
- Repositorio del servidor bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Paper de SepFormer (referenciado por la model card del modelo original): no disponible en la información proporcionada.
- Corpus WHAMR!: no disponible en la información proporcionada.
- Corpus WHAM!: no disponible en la información proporcionada.
