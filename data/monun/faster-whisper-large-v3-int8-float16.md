# monun/faster-whisper-large-v3-int8-float16

## Resumen

`monun/faster-whisper-large-v3-int8-float16` es una conversión del checkpoint `openai/whisper-large-v3` al formato CTranslate2 con cuantización `int8_float16`, pensada para su uso con la librería `faster-whisper`. No es un modelo nuevo: es el mismo Whisper large-v3 de OpenAI (arquitectura transformer encoder-decoder para reconocimiento automático del habla) empaquetado para inferencia eficiente en GPU CUDA sin dependencia de PyTorch. El autor del empaquetado es el usuario de Hugging Face `monun`.

El problema que resuelve es el de desplegar Whisper large-v3 en producción con menor huella de memoria y mayor velocidad que la implementación original de PyTorch, manteniendo el tokenizer y el extractor de características del checkpoint original. La cuantización mixta `int8_float16` reduce los pesos a INT8 con escalas float32 por fila y mantiene determinadas matrices en FP16, lo que permite ejecutar el modelo en GPUs de consumo con un consumo de VRAM contenido (repo de 1,6 GB).

Es relevante porque facilita la transcripción multilingüe offline en entornos con CUDA, sin caché de Hugging Face ni acceso a red, y con un pipeline de inferencia por lotes (`BatchedInferencePipeline`) que mejora el throughput en ficheros de audio largos. El modelo se publicó el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a CTranslate2 |
| Parametros totales | no disponible (el repo pesa 1,6 GB; `model.bin` contiene 1.539.801.600 bytes en tensores INT8 más 680 tensores FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; 128 bins Mel, entrada a 16 kHz) |
| Tipos de cuantizacion | `int8_float16` (INT8 con escalas float32 por fila y tensores FP16 adicionales) |
| Idiomas soportados | multilingüe (heredado de Whisper large-v3; lista concreta no disponible en la información proporcionada) |
| Licencia | Apache-2.0 (checkpoint); el código y pesos originales de OpenAI Whisper se distribuyen además bajo MIT |
| Formato de pesos | CTranslate2 (`model.bin`), más `tokenizer.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 de OpenAI: un transformer encoder-decoder entrenado para reconocimiento automático del habla multilingüe, que opera sobre espectrogramas Mel de 128 bins extraídos de audio a 16 kHz. El encoder transforma la representación acústica y el decoder genera tokens de texto de forma autorregresiva. No se trata de un modelo MoE ni híbrido SSM; es un transformer denso estándar.

Esta publicación no entrena ni afina el modelo: únicamente lo convierte. Según la model card, la conversión se realizó con `ct2-transformers-converter` usando CTranslate2 4.7.1 y Transformers 4.57.6, partiendo de la revisión fijada `06f233fe06e710322aca913c1bc4249a0d71fce1` del checkpoint original, cuyo `model.safetensors` tiene SHA-256 `a8e94b85976e5864ba3e9525c7e6c83b2a1eca42d4b797a0c7c24d778e40fd95`. El proceso de cuantización produjo 355 tensores INT8 (130 en el encoder, 225 en el decoder) con escalas float32 por fila, y 680 tensores FP16. El autor verificó la reproducibilidad cuantizando por separado la primera matriz feed-forward de entrada de cada pila y comparando byte a byte los 13.107.200 valores INT8 y sus escalas. No se documentan datos de entrenamiento adicionales, RLHF ni DPO porque el modelo no se ha reentrenado.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe sobre audio de 16 kHz.
- Transcripción con marcas temporales por segmento (`start`, `end`, `text`).
- Procesamiento por lotes de audio mediante `BatchedInferencePipeline` con `batch_size` configurable (32 en el ejemplo del autor).
- Inferencia offline: funciona con `local_files_only=True`, sin caché de Hugging Face y con red limitada a loopback.
- Ejecución sin PyTorch, usando únicamente `faster-whisper`, CTranslate2 y `av` para decodificar audio.
- Detección de idioma y transcripción multilingüe heredadas de Whisper large-v3 (la lista concreta de idiomas no se detalla en la información disponible).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción offline en entornos aislados: el modelo se descarga previamente a `./model` y se ejecuta con `local_files_only=True`, sin acceso a red, lo que encaja en despliegues con requisitos de confidencialidad o en máquinas sin conectividad.
- Subtitulado por lotes de archivos de audio largos: `BatchedInferencePipeline` con `batch_size=32` procesa varios segmentos en paralelo, reduciendo el tiempo total frente a la inferencia secuencial.
- Generación de actas y notas de reuniones: la salida con marcas temporales permite alinear la transcripción con el audio y construir resúmenes o índices navegables.
- Pipelines de análisis de contenido multimedia: integración en procesos que extraigan texto de pódcast, entrevistas o vídeos para búsqueda, indexación o moderación.
- Prototipado en GPU de consumo: el tamaño de 1,6 GB y la cuantización `int8_float16` permiten ejecutarlo en tarjetas con VRAM moderada, según se detalla en la sección de hardware.
- Evaluación comparativa de ASR: al ser una conversión fiel del checkpoint original con verificación byte a byte, sirve como referencia reproducible para medir el impacto de la cuantización frente a Whisper large-v3 en FP16.
- Servicios de transcripción de bajo coste: al no requerir PyTorch y reducir el peso del modelo, simplifica la imagen de contenedor y los requisitos de memoria del servicio.

## Benchmarks y rendimiento

El autor documenta una única medición de latencia, no un conjunto de benchmarks académicos:

| Prueba | Hardware | Audio | Resultado |
|---|---|---|---|
| Transcripción del clip JFK (inglés, 11,0 s) | NVIDIA GeForce RTX 5090, `int8_float16` | 11,0 s | 1 segmento (0,0–10,9 s); 1,401 s de transcripción tras cargar el modelo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER por idioma, etc.) en la información disponible. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,6 GB y la cuantización `int8_float16` reduce la huella frente al FP16 original, por lo que se espera un consumo en el entorno de unos pocos GB, pero no se confirma en la información proporcionada.
- GPU validadas: NVIDIA GeForce RTX 5090 (probada por el autor con `device="cuda"` y `compute_type="int8_float16"`).
- GPU recomendadas: no disponibles en la información; CTranslate2 con `int8_float16` requiere soporte CUDA en la GPU objetivo.
- ¿Cabe en GPU de consumo? El tamaño del repo (1,6 GB) y la cuantización mixta sugieren que sí en tarjetas consumer modernas, pero no se aporta una lista concreta de modelos compatibles.
- Opciones de despliegue: `faster-whisper` 1.2.1 con `ctranslate2` 4.7.1 y `av` 16.1.0 para decodificación de audio; ejecución con `WhisperModel(..., device="cuda", compute_type="int8_float16")` y `BatchedInferencePipeline`.
- Latencia y throughput: 1,401 s para un clip de 11,0 s en RTX 5090 tras cargar el modelo; no se documentan cifras de throughput agregado ni de latencia en otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `monun/faster-whisper-large-v3-int8-float16` | no disponible (repo 1,6 GB) | ventanas de 30 s (Whisper) | `int8_float16` | Apache-2.0 / MIT | CTranslate2 | Conversión verificada byte a byte; probado en RTX 5090 |
| `openai/whisper-large-v3` (original) | ~1.550 M (large-v3) | ventanas de 30 s | FP16 / FP32 | Apache-2.0 / MIT | safetensors (PyTorch) | Requiere PyTorch; mayor huella de memoria |
| Otras conversiones `faster-whisper` de large-v3 | ~1.550 M | ventanas de 30 s | `int8`, `float16`, `int8_float16` | Apache-2.0 / MIT | CTranslate2 | Dependen del autor; no se dispone de datos comparativos en la información |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una conversión, no un modelo nuevo: hereda todos los sesgos y limitaciones de Whisper large-v3, incluidos los sesgos de transcripción documentados por OpenAI.
- Riesgo de alucinación: Whisper puede generar texto plausible en segmentos con silencio, ruido o audio de baja calidad; conviene validar las salidas en producción.
- Idiomas: aunque el modelo es multilingüe, la lista concreta de idiomas soportados no se detalla en la información disponible; el rendimiento varía por idioma y acento.
- La ventana de audio es la de Whisper (30 s por ventana); audios más largos requieren segmentación o el uso de `BatchedInferencePipeline`.
- La licencia Apache-2.0 aplica al checkpoint; el código y pesos originales de OpenAI Whisper se distribuyen además bajo MIT. Verificar ambas licencias antes de uso comercial.
- Dependencia de versiones concretas: el autor validó con `faster-whisper==1.2.1`, `ctranslate2==4.7.1` y `av==16.1.0`; otras versiones pueden alterar el comportamiento.
- El modelo solo se ha probado en una GPU (RTX 5090) y con un único clip de audio; no hay evidencia publicada de rendimiento en otros hardware.
- Repositorio sin descargas ni likes en el momento de la ficha: menor madurez comunitaria y menor probabilidad de soporte ante problemas.

## Enlaces

- Hugging Face: https://huggingface.co/monun/faster-whisper-large-v3-int8-float16
- Model card original de Whisper large-v3: https://huggingface.co/openai/whisper-large-v3/blob/06f233fe06e710322aca913c1bc4249a0d71fce1/README.md
- Ficheros del checkpoint original fijado: https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- Audio de prueba (JFK) de faster-whisper v1.2.1: https://github.com/SYSTRAN/faster-whisper/blob/v1.2.1/tests/data/jfk.flac
- Repositorio faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio OpenAI Whisper: https://github.com/openai/whisper
- Declaración de licencia de OpenAI Whisper: https://github.com/openai/whisper/tree/v20231117#license
