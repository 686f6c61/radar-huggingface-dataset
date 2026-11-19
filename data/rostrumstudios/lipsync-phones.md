# rostrumstudios/lipsync-phones

## Resumen

`rostrumstudios/lipsync-phones` es un espejo público y fijado de un reconocedor de fonemas basado en wav2vec2, empaquetado en ONNX fp16 junto con el diccionario de pronunciación CMU (CMUdict). No es un modelo nuevo: es una copia byte a byte de los ficheros que la aplicación Rostrum descarga en producción, con commits y hashes SHA-256 fijados para garantizar reproducibilidad. El modelo subyacente es `facebook/wav2vec2-lv-60-espeak-cv-ft` de Meta AI, un wav2vec2 fine-tuneado sobre CommonVoice para reconocimiento de fonemas con inventario espeak, exportado a ONNX por onnx-community.

El propósito declarado es el lip-sync 2D: detectar qué sonidos del habla aparecen en una grabación de voz y en qué instante, para sincronizar las formas de la boca de un personaje animado. El modelo solo analiza audio; no genera voz, imagen ni sonido. Esta distinción es relevante para evaluar su encaje en un pipeline: es un componente de análisis fonético, no un modelo generativo.

Técnicamente es un transformer convolucional wav2vec2 de aproximadamente 300 millones de parámetros (el checkpoint base `wav2vec2-lv-60-espeak-cv-ft`), con salida CTC sobre un vocabulario de fonemas espeak. El repositorio pesa 0,6 GB, incluye `model_fp16.onnx`, `vocab.json` y `cmudict-7479086/cmudict.dict`, y se distribuye bajo Apache-2.0 (el diccionario CMUdict bajo BSD-2-Clause).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional con cabecera CTC) |
| Parámetros totales | no disponible en la información proporcionada (el checkpoint base `facebook/wav2vec2-lv-60-espeak-cv-ft` ronda los 300 M, dato no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa ventanas de audio; la longitud máxima no se especifica en la model card) |
| Tipos de cuantización | fp16 (único peso publicado: `model_fp16.onnx`) |
| Idiomas soportados | no disponible (el inventario de fonemas espeak es multilingüe por diseño, pero la model card no enumera idiomas) |
| Licencia | Apache-2.0 (modelo y export); CMUdict BSD-2-Clause |
| Formato de pesos | ONNX (`model_fp16.onnx`, 632.331.247 bytes) + `vocab.json` + `cmudict.dict` |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2, un modelo de reconocimiento de voz que combina un extractor de características convolucional sobre la forma de onda cruda con un transformer que modela el contexto temporal, y una cabecera de clasificación CTC que emite una secuencia de fonemas. El checkpoint base `facebook/wav2vec2-lv-60-espeak-cv-ft` fue fine-tuneado por Meta AI sobre CommonVoice para reconocimiento de fonemas con el inventario espeak, siguiendo el trabajo "Simple and Effective Zero-shot Cross-lingual Phoneme Recognition" (Xu, Baevski, Auli; arXiv:2109.11680). El objetivo de ese trabajo es el reconocimiento fonético zero-shot entre idiomas: el modelo aprende fonemas espeak y generaliza a lenguas no vistas en entrenamiento.

El repositorio no documenta el proceso de entrenamiento (número de tokens, composición exacta del dataset, si hubo RLHF/DPO). Tampoco se describe ninguna innovación adicional más allá del propio enfoque de fonemas espeak del paper original. La exportación a ONNX fp16 la realiza onnx-community en el commit `c69750f5043e5e1f8a71ab95dd3b98338c280c92`; Rostrum redistribuye los ficheros sin cambios. El diccionario CMUdict se incluye para resolver grafías inglesas a fonemas, complementando la salida del reconocedor.

## Capacidades

- Reconocimiento de fonemas a partir de audio: emite la secuencia de sonidos del habla y su alineación temporal, base para el lip-sync.
- Detección de instantes de emisión: la salida CTC permite derivar cuándo se pronuncia cada fonema.
- Análisis multilingüe potencial vía inventario espeak (el paper original aborda reconocimiento zero-shot cross-lingual), aunque la model card no enumera idiomas concretos.
- Integración con CMUdict para mapear palabras inglesas a fonemas.
- Inferencia ONNX fp16, apta para despliegue en CPU o GPU con runtime ONNX.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking: es exclusivamente un analizador de audio.

## Casos de uso

- Lip-sync 2D en animación: el modelo detecta los fonemas y sus tiempos en una locución grabada; el motor de animación mapea cada fonema a una forma de boca (visema) y genera keyframes sincronizados. Es el caso de uso declarado por Rostrum.
- Doblaje y localización: al analizar la pista de voz original se obtienen los instantes fonéticos, lo que permite ajustar la duración de la locución doblada o alinear subtítulos a nivel de fonema.
- Análisis fonético para investigación: extraer transcripciones fonéticas con marcas temporales de corpus de audio para estudios de pronunciación o comparación entre dialectos.
- Evaluación de pronunciación: comparar la secuencia de fonemas detectada con la esperada (por ejemplo, vía CMUdict para inglés) para señalar desviaciones en herramientas de aprendizaje de idiomas.
- Preprocesado para pipelines de voz: generar alineaciones fonéticas que alimenten sistemas de síntesis, corrección o segmentación de audio.
- Herramientas de accesibilidad: transcripción fonética temporal para subtitulado enriquecido o visualización del habla.
- Integración en apps de escritorio o móvil: al ser ONNX fp16 de 0,6 GB, puede ejecutarse localmente sin depender de servicios en la nube, con verificación de integridad por SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX fp16 pesa 632 MB; en inferencia se requiere espacio adicional para activaciones, por lo que se estima un consumo de aproximadamente 1-2 GB en fp16, aunque no se dispone de medición oficial.
- GPU recomendadas: no disponible en la model card; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder ejecutarlo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior), dado el tamaño del checkpoint; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), dado que el peso publicado es ONNX. No se distribuyen pesos GGUF ni safetensors en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rostrumstudios/lipsync-phones` | no disponible (base ~300 M, no confirmado) | no disponible | Reconocimiento de fonemas (ONNX fp16) | Apache-2.0 | Hugging Face (espejo) |
| `facebook/wav2vec2-lv-60-espeak-cv-ft` | no disponible en la información | no disponible | Reconocimiento de fonemas | Apache-2.0 | Hugging Face (original) |
| `onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX` | mismo checkpoint base | no disponible | Reconocimiento de fonemas (ONNX) | Apache-2.0 | Hugging Face |
| Modelos ASR genéricos (p. ej. Whisper) | no disponible | no disponible | Transcripción a texto | variable | Hugging Face |

La comparación relevante es con el checkpoint original de Meta y con la exportación de onnx-community: este repositorio es una copia fijada de ambos, con la adición de CMUdict. Frente a un ASR genérico como Whisper, la diferencia es la salida: fonemas espeak con alineación temporal en lugar de texto, lo que lo hace adecuado para lip-sync y análisis fonético, pero no para transcripción legible directamente.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune propio: es un espejo de ficheros de terceros; cualquier limitación del checkpoint base aplica íntegramente.
- Solo analiza audio; no genera voz, imagen ni texto libre. No debe presentarse como modelo generativo.
- La model card no documenta sesgos, tasas de error, cobertura de idiomas ni comportamiento en condiciones de ruido.
- Riesgo de alucinación fonética: como todo modelo CTC, puede emitir fonemas espurios en silencios o audio degradado; requiere umbrales y postprocesado.
- La licencia Apache-2.0 permite uso comercial del modelo, pero CMUdict está bajo BSD-2-Clause y debe conservarse su aviso de copyright al redistribuirlo.
- La integridad depende de los hashes SHA-256 publicados; cualquier uso en producción debería verificar esos hashes como hace Rostrum.
- No se especifican requisitos de hardware, latencia ni throughput; habrá que medirlos en el entorno objetivo.
- El repositorio no incluye tokenizador de texto ni pipeline completo: solo pesos ONNX, vocabulario y diccionario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rostrumstudios/lipsync-phones
- Modelo original de Meta: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Exportación ONNX de onnx-community: https://huggingface.co/onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX
- Paper "Simple and Effective Zero-shot Cross-lingual Phoneme Recognition": https://arxiv.org/abs/2109.11680
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict
- Organización Rostrum: https://huggingface.co/rostrumstudios
