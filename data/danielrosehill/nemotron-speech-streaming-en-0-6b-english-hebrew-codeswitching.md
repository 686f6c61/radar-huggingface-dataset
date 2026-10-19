# danielrosehill/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching

## Resumen

Este modelo es un ajuste fino experimental del modelo de reconocimiento automático del habla en flujo de NVIDIA `nvidia/nemotron-speech-streaming-en-0.6b`, publicado por `danielrosehill` en Hugging Face. Su objetivo es transcribir inglés hablado que incluye palabras hebreas, manteniendo la salida en inglés y escribiendo los términos hebreos en su romanización canónica, por ejemplo "pick up bamba from the makolet". No transcribe hebreo ni genera escritura hebrea.

La arquitectura es FastConformer cache-aware con decodificador RNNT, con 0,6B de parámetros y un repositorio de 2,5 GB en formato `.nemo`. El modelo base está pensado para ASR en flujo, con fragmentos de audio de 80, 160, 560 o 1.120 ms, y este ajuste conserva esa capacidad de streaming.

Es relevante porque aborda un caso poco cubierto, la alternancia inglés-hebreo romanizado, en un modelo pequeño y desplegable con NeMo. Sin embargo, es un modelo experimental publicado antes de su evaluación en test: su único dato publicado es un WER de validación del 6,4 % en decodificación offline, frente al 4,9 % del modelo Parakeet v5 del mismo autor en la misma validación. La precisión en streaming no se ha medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con RNNT (transducer); ajuste fino completo del modelo base |
| Parámetros totales | 0,6B (aproximadamente 600 millones) |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No es un contexto textual. Atención cache-aware configurable con `att_context_size = [70, N]`, con N = 0, 1, 6 o 13; fragmentos de 80, 160, 560 o 1.120 ms. Decodificación offline con contexto completo |
| Tipos de cuantización | No disponible; no se documentan GGUF, ONNX, TensorRT ni cuantizaciones |
| Idiomas soportados | Inglés (`en`) con términos hebreos romanizados en la salida. No transcribe hebreo ni escribe caracteres hebreos |
| Licencia | NVIDIA Open Model License; modelo derivado, no avalado por NVIDIA |
| Formato de pesos | `.nemo` (checkpoint de NeMo); repositorio de 2,5 GB |
| Tarea | Reconocimiento automático del habla en flujo y transcripción offline |
| Entrada de audio | Audio mono a 16 kHz |
| Librería | NeMo 2.7.3 |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/nemotron-speech-streaming-en-0.6b`, un sistema cache-aware FastConformer + RNNT de 0,6B. El ajuste fino es completo, pero no se entrenó con atención en flujo: se entrenó en modo offline con contexto completo. La configuración de streaming se hereda del modelo base y se activa con `att_context_size = [70, N]`, donde N = 0, 1, 6 o 13 produce fragmentos de 80, 160, 560 o 1.120 ms.

Los datos de entrenamiento proceden del dataset `danielrosehill/Read-Aloud-Voice-Sentences`, revisión `fcf5aec16449`: 294,2 minutos de habla con alternancia de lenguas (2.829 clips), 82,6 minutos de inglés monolingüe del mismo hablante y 42,1 minutos de repetición de LibriSpeech `train-clean-100` con transcripciones LibriSpeech-PC con mayúsculas y puntuación. La mezcla por duración es 70,2 % de alternancia de lenguas y 29,8 % de inglés; se mantiene el inglés porque ajustar solo con datos de alternancia daña el rendimiento monolingüe.

El entrenamiento se hizo con NeMo 2.7.3, AdamW, tasa de aprendizaje 3e-5, esquema coseno con 10 % de calentamiento, 20 épocas, lote 16 y bf16, en una NVIDIA L40S durante 35 minutos. El mejor punto de control por WER de validación fue el de la época 15. La ejecución se identifica como `r5-nemotron-en30`. La evaluación prevista usará la partición de test con términos disjuntos: 311 clips con alternancia de lenguas y 265 términos hebreos no vistos en entrenamiento.

## Capacidades

- Reconocimiento de voz en inglés con inserción de palabras hebreas romanizadas, manteniendo la transcripción en caracteres latinos.
- Salida siempre en inglés: no transcribe hebreo y nunca escribe en script hebreo.
- Streaming cache-aware: el texto aparece mientras se habla, en fragmentos de 80, 160, 560 o 1.120 ms.
- Transcripción offline con contexto completo, que es el modo usado para obtener el WER de validación del 6,4 %.
- Entrenamiento con transcripciones con mayúsculas y puntuación de LibriSpeech-PC, aunque no hay una evaluación específica publicada sobre calidad de puntuación o uso de mayúsculas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni generación de audio. Es un modelo ASR, no un modelo de lenguaje generativo.
- Multilingüismo limitado a la alternancia inglés-hebreo romanizado; no es un modelo multilingüe general ni un ASR de hebreo.
- Integración mediante `nemo_asr.models.ASRModel.restore_from` y el script de inferencia streaming cache-aware de NeMo. No se documentan otros runtimes.

## Casos de uso

- Dictado en tiempo real para un angloparlante residente en Jerusalén: el modelo puede insertar términos locales romanizados como "makolet" o "bamba" en una transcripción inglesa, útil para notas de voz en Android. Es adecuado por su modo streaming, pero debe validarse con el hablante concreto porque se entrenó con una sola voz.
- Subtitulado en vivo de reuniones o clases donde se mezcla inglés con préstamos hebreos: permite mantener los subtítulos en alfabeto latino y evitar cambios de script o de teclado. La latencia de fragmento está entre 80 y 1.120 ms, aunque no se ha medido la latencia extremo a extremo.
- Transcripción offline de grabaciones de un único ponente: usando decodificación con contexto completo se obtiene el modo evaluado con WER del 6,4 % en validación, adecuado para entrevistas, notas de campo o podcasts con el mismo perfil de voz.
- Prototipo de asistente de voz para búsquedas locales: se pueden mapear términos romanizados a entidades como comercios, productos o lugares sin necesidad de un pipeline de hebreo escrito. Requiere postproceso y no debe usarse como sistema de producción sin evaluación propia.
- Evaluación comparativa de ASR en streaming frente a ASR offline en condiciones de alternancia de lenguas: el modelo comparte datos y receta con Parakeet v5, lo que permite comparar WER y latencia en un mismo conjunto de validación.
- Preetiquetado de corpus de inglés con términos hebreos romanizados: puede generar transcripciones iniciales para revisión humana en un flujo de anotación. Es útil por el bajo coste de un modelo de 0,6B, pero limitado a un hablante y a lectura de prompts.
- Accesibilidad en directo para charlas de un ponente concreto: el texto puede mostrarse en pantalla mientras se habla, con la advertencia de que es un modelo experimental y de que la precisión en streaming no está medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de modelos de lenguaje como MMLU, HumanEval o GSM8K, porque este modelo es un sistema ASR. Los únicos datos disponibles son de validación:

| Modelo | Conjunto | Modo | WER | Notas |
|---|---|---|---|---|
| Este modelo | Validación de `Read-Aloud-Voice-Sentences` | Offline, contexto completo | 6,4 % | Único dato publicado; sin evaluación en test, LibriSpeech ni streaming |
| Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching (v5) | Misma validación | No especificado en la información | 4,9 % | Misma datos y receta; comparación proporcionada por el autor |

No hay resultados publicados de WER en test, LibriSpeech ni en modo streaming. La evaluación pendiente usará 311 clips con alternancia de lenguas y 265 términos hebreos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 2,5 GB y el modelo tiene 0,6B; como referencia aritmética, los pesos en bf16 ocuparían aproximadamente 1,2 GB, pero faltan activaciones, decodificador RNNT y sobrecarga de NeMo. No hay una cifra medida publicada.
- GPU recomendadas: no documentadas. El entrenamiento se realizó en una NVIDIA L40S; no hay datos de inferencia en A100, H100, RTX 4090 u otras GPU.
- ¿Cabe en GPU consumer? No confirmado. Por el tamaño de 0,6B es plausible, pero no se ha publicado una prueba de funcionamiento ni requisitos medidos; no debe asumirse sin validación.
- Opciones de despliegue: NeMo 2.7.3 mediante `ASRModel.restore_from` y el script `speech_to_text_cache_aware_streaming_infer.py` para streaming cache-aware. No se documentan soporte para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT.
- Latencia y throughput: la latencia algorítmica de fragmento es de 80, 160, 560 o 1.120 ms según la configuración. No se publican throughput, latencia extremo a extremo ni rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto y streaming | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 0,6B | Cache-aware `[70, N]`; fragmentos de 80, 160, 560 o 1.120 ms; offline con contexto completo | WER 6,4 % en validación offline | NVIDIA Open Model License | Hugging Face; 0 descargas y 0 likes en la información disponible |
| `nvidia/nemotron-speech-streaming-en-0.6b` | 0,6B | Cache-aware streaming; configuración heredada por este ajuste | No disponible en la información | No disponible en la información | Hugging Face |
| `danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching` (v5) | 0,6B según el nombre | No disponible si es streaming; el autor lo presenta como la opción de mayor precisión | WER 4,9 % en la misma validación | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental y no evaluado en test: se publicó inmediatamente después del entrenamiento, antes de la evaluación prevista. El único dato es el WER de validación del 6,4 % en modo offline.
- La precisión en streaming no se ha medido. El modelo se entrenó con contexto completo y atención offline, por lo que el rendimiento con fragmentos pequeños puede ser inferior al offline.
- Entrenado con un solo hablante: un angloparlante que vive en Jerusalén, leyendo prompts en un teléfono Android. Puede presentar sesgo de acento, voz, estilo de lectura y micrófono, y no representa la variabilidad de hablantes reales.
- Los términos hebreos sin grabaciones en entrenamiento son mucho menos fiables que los que sí aparecen. El modelo no hace traducción ni reconocimiento general de hebreo.
- La salida es siempre en inglés y con romanización; no genera escritura hebrea. No es adecuado para transcribir hebreo hablado de forma monolingüe.
- Riesgo de errores de sustitución, inserción u omisión en términos poco frecuentes. No hay una evaluación de alucinación o de estabilidad en dominios distintos al de entrenamiento.
- La licencia es NVIDIA Open Model License. Es un modelo derivado y no está hecho ni avalado por NVIDIA. La model card no resume las condiciones concretas de uso comercial; deben revisarse `LICENSE` y `NOTICE` antes de llevarlo a producción.
- No se documentan cuantizaciones, exportación a ONNX o TensorRT, ni soporte para servidores de inferencia distintos de NeMo. La integración en producción requiere validar el stack y el rendimiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Modelo Parakeet v5 del mismo autor: https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- LibriSpeech-PC en OpenSLR: https://www.openslr.org/145/
- Licencia del repositorio: https://huggingface.co/danielrosehill/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching/blob/main/LICENSE
- Aviso NOTICE del repositorio: https://huggingface.co/danielrosehill/Nemotron-Speech-Streaming-EN-0.6B-English-Hebrew-Codeswitching/blob/main/NOTICE

No se proporcionan enlaces a paper, blog o demo en la información disponible.
