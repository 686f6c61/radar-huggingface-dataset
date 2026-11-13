# Abdou/quran-asr-tiny

## Resumen

quran-asr-tiny es un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica, desarrollado por el autor independiente Abdou. Se trata de un modelo de 16 millones de parámetros, entrenado desde cero, cuya finalidad es transcribir las letras árabes de lo que se recita (sin diacríticos) y ejecutarse íntegramente en local, incluso en un teléfono móvil, mediante el runtime sherpa-onnx con pesos ONNX int8 de 19 MB. Resuelve el problema de la transcripción de recitación coránica en entornos con recursos limitados y sin conexión, un nicho que los modelos ASR generalistas cubren con menor precisión y mayor coste computacional.

La arquitectura es un Conformer-CTC compacto (sin decodificador autorregresivo ni modelo de lenguaje externo), entrenado con datos de recitadores profesionales y de usuarios reales grabando con el teléfono, y que cubre tanto la lectura Hafs como la Warsh, desde el tartil lento hasta el hadr rápido. Su relevancia actual radica en que demuestra que un modelo de 16M de parámetros supera en precisión a alternativas mucho mayores (NVIDIA FastConformer de 115M y Whisper large-v3 de 1.5B) en el benchmark Quran-Lab, con un coste de inferencia de decenas de segundos para más de dos horas de audio en CPU.

El modelo se distribuye bajo licencia MIT, con el código de entrenamiento incluido en el repositorio, y está pensado para despliegue on-device en aplicaciones de recitación, verificación y seguimiento de la lectura coránica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder Conformer con cabeza CTC, sin decodificador autorregresivo) |
| Parametros totales | 16M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio; no se especifica ventana máxima) |
| Tipos de cuantizacion | int8 (ONNX, 19 MB); pesos PyTorch en fp32 para evaluación |
| Idiomas soportados | árabe (recitación coránica, Hafs y Warsh) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8, distribuido vía sherpa-onnx); PyTorch fp32 para evaluación |

## Arquitectura y entrenamiento

El modelo es un Conformer-CTC de 16 millones de parámetros. La elección de una cabeza CTC implica decodificación greedy sin modelo de lenguaje, sin restricción de léxico y sin pistas de la aleya objetivo: el modelo nunca ve una referencia durante la inferencia. Esta decisión reduce el coste computacional y el tamaño del artefacto, a cambio de renunciar al rescoring con LM que sí emplean otros sistemas del benchmark.

El entrenamiento se realizó desde cero en una única GPU de portátil, con código completo en el directorio `code/` del repositorio. Los datos provienen de tres fuentes: `tarteel-ai/tlog` (grabaciones reales de usuarios en la aplicación Tarteel), `IqraEval/Iqra_train` y el benchmark `Quran-Lab/quranic-asr-benchmark` como conjunto de evaluación. El modelo se entrenó sobre texto en grafía Uthmani, lo que explica que escriba el rasm uthmaní (por ejemplo, السموت, الكتب, ءامنوا) en lugar de la ortografía estándar. El checkpoint liberado (paso 245k) es el de menor error de validación; según la model card, la incorporación de más grabaciones telefónicas, y no más pasos de entrenamiento, fue lo que mejoró las métricas en ese dominio.

## Capacidades

- Reconocimiento de voz para recitación coránica en árabe, con salida en letras árabes sin diacríticos (grafía Uthmani).
- Cobertura de recitadores profesionales (estudio) y de usuarios ordinarios grabando con el teléfono.
- Soporte de las lecturas Hafs y Warsh.
- Robustez ante distintos ritmos de recitación, desde tartil lento hasta hadr rápido.
- Inferencia on-device completamente offline mediante sherpa-onnx (ONNX int8 de 19 MB).
- Decodificación CTC greedy sin modelo de lenguaje ni restricción de léxico.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada distinto de voz ni modo de razonamiento explícito; es un modelo ASR puro.

## Casos de uso

- Aplicaciones móviles de seguimiento de la recitación: el modelo transcribe en local la recitación del usuario y permite comparar con el texto esperado para detectar errores, sin enviar audio a un servidor y con un artefacto de 19 MB que cabe en el paquete de la app.
- Verificación de memorización (hifz): integrado en una app de repaso, transcribe la recitación del estudiante y la alinea con la aleya correspondiente para señalar omisiones o sustituciones.
- Transcripción masiva de archivos de recitadores: con 31 s para 2,1 h de audio en 4 hilos de CPU (int8), permite procesar corpus completos de recitación en servidores sin GPU.
- Subtitulado y sincronización de audio coránico: generación de transcripciones alineadas temporalmente para plataformas de contenido religioso o archivos de audio.
- Investigación en ASR de dominio específico: el código de entrenamiento y los pesos permiten reproducir el pipeline y adaptarlo a otras lecturas (qira'at) o variantes dialectales del árabe.
- Despliegue en dispositivos embebidos y de bajos recursos: el tamaño int8 y el soporte de sherpa-onnx permiten ejecutarlo en Raspberry Pi o teléfonos de gama baja para aplicaciones de recitación offline.
- Evaluación comparativa de modelos ASR: como referencia ligera en pipelines de benchmarking de reconocimiento de árabe coránico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark Quran-Lab (600 clips, `score.py` oficial). WER / CER en %, menor es mejor. Los datos de modelos comparados provienen del `results.json` del leaderboard.

| Modelo | Params | Overall | Phone (tlog_holdout) | EveryAyah | QUL |
|---|---:|---|---|---|---|
| zipformer_p-arabic-v3 (streaming, retrieval), #1 | 66M | 3,46 / 1,84 | 7,56 / 1,79 | 0,00 / 0,00 | 4,40 / 3,77 |
| fastconformer-quran (offline 4h) | 115M | 5,41 / 2,96 | 8,88 / 2,66 | 0,93 / 0,26 | 7,78 / 5,91 |
| quran-asr-tiny (PyTorch fp32) | 16M | 6,94 / 2,81 | 17,95 / 5,69 | 1,83 / 0,53 | 5,23 / 3,39 |
| quran-asr-tiny (int8 ONNX, distribuido) | 16M | 7,08 / 2,86 | 18,34 / 5,81 | 1,83 / 0,53 | 5,35 / 3,44 |
| NVIDIA stt_ar_fastconformer | 115M | 7,44 / 3,08 | 16,77 / 5,61 | 1,50 / 0,49 | 7,61 / 4,20 |
| Tarteel (app oficial, tiempo real) | – | 9,56 / 5,82 | 16,17 / 7,41 | 5,97 / 3,80 | 9,05 / 6,91 |
| Whisper large-v3 | 1,5B | 10,10 / 4,26 | 26,23 / 12,39 | 5,48 / 1,79 | 4,69 / 1,83 |

Métricas propias del autor en recitadores no vistos en entrenamiento (grafía Uthmani, sin conversión ortográfica):

| Conjunto de test | CER | WER |
|---|---:|---:|
| Hani ar-Rifai (Hafs, no visto) | 0,63% | 1,69% |
| Muhammad Siddiq al-Minshawi, 32 kbps (Hafs, no visto) | 2,86% | 5,31% |
| Warsh: Ibrahim al-Dosary (suratas reservadas) | 0,28% | 1,20% |
| Warsh: Yassin al-Jazaery (suratas reservadas) | 0,28% | 1,20% |
| Warsh: Abdul Basit (suratas reservadas) | 7,30% | 11,79% |
| Todos | 1,68% | 3,37% |

Advertencias del autor sobre la comparación: (1) la salida en rasm uthmaní se convierte a ortografía estándar con `spelling.json` solo para palabras correctas, lo que afecta a la comparación con referencias estándar; la salida Uthmani cruda puntúa 12,90 / 4,25 overall y 11,51 / 4,12 en grabaciones telefónicas; (2) existe solapamiento parcial con los datos de entrenamiento del modelo: 134 de los 200 clips de EveryAyah son de dos recitadores presentes en su entrenamiento y 13 de las 200 grabaciones telefónicas estuvieron en entrenamiento hasta el paso ~152k; sin esos 134 clips, el resultado es 8,87% WER / 3,63% CER (EveryAyah con recitador no visto: 3,67 / 1,06); (3) decodificación CTC greedy sin LM, sin léxico y sin pistas de la aleya.

## Requisitos de hardware

- Inferencia en CPU: el modelo int8 ONNX transcribe los 600 clips del benchmark (2,1 h de audio) en 31 s con 4 hilos de CPU.
- VRAM estimada para GPU: no disponible; el artefacto de 19 MB int8 permite inferencia en CPU sin GPU dedicada.
- GPU recomendadas: no aplica para el despliegue previsto; cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero no se publican cifras de latencia en GPU.
- Cabe en GPU de consumo: sí, con un consumo de memoria despreciable (19 MB de pesos int8); también en dispositivos móviles y embebidos.
- Opciones de despliegue: sherpa-onnx (runtime oficial del modelo); ONNX Runtime para integración directa; los pesos PyTorch fp32 requieren un entorno de evaluación propio, no se distribuyen para producción.
- Latencia y throughput: 31 s para 2,1 h de audio en 4 hilos de CPU (int8), aproximadamente 240x tiempo real agregado en ese hardware.

## Comparativa con modelos similares

| Modelo | Params | Contexto / dominio | WER / CER overall (Quran-Lab) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| quran-asr-tiny | 16M | ASR coránico, Hafs y Warsh | 7,08 / 2,86 (int8) | MIT | Hugging Face, ONNX int8, sherpa-onnx |
| NVIDIA stt_ar_fastconformer | 115M | ASR árabe general | 7,44 / 3,08 | no disponible en la información proporcionada | NGC / NeMo |
| fastconformer-quran | 115M | ASR coránico | 5,41 / 2,96 | no disponible en la información proporcionada | leaderboard Quran-Lab |
| Whisper large-v3 | 1,5B | ASR multilingüe general | 10,10 / 4,26 | no disponible en la información proporcionada | OpenAI / Hugging Face |
| zipformer_p-arabic-v3 | 66M | ASR árabe con retrieval y streaming | 3,46 / 1,84 | no disponible en la información proporcionada | leaderboard Quran-Lab |

quran-asr-tiny es el más pequeño de la comparativa por un factor de 7 frente a los FastConformer y de 90 frente a Whisper large-v3, con mejor WER y CER que ambos en el benchmark Quran-Lab, aunque por detrás de zipformer_p-arabic-v3 y fastconformer-quran en precisión global. Su ventaja diferencial es el tamaño y la ejecución on-device.

## Limitaciones y advertencias

- Salida en grafía Uthmani sin diacríticos; para comparar con texto estándar es necesario aplicar una tabla de conversión ortográfica, lo que introduce dependencia de un recurso externo (`spelling.json`).
- Rendimiento sensiblemente peor en grabaciones telefónicas reales (17,95% WER / 5,69% CER en `tlog_holdout`) que en audio de estudio (1,83% / 0,53% en EveryAyah).
- Solapamiento parcial entre el conjunto de evaluación y los datos de entrenamiento del modelo (134 clips de EveryAyah y 13 grabaciones telefónicas), lo que puede inflar las métricas publicadas; el propio autor reporta 8,87% WER / 3,63% CER sin esos clips.
- Mayor error en algunos recitadores de Warsh no vistos (Abdul Basit: 7,30% CER / 11,79% WER) frente a otros (0,28% / 1,20%).
- Decodificación greedy sin modelo de lenguaje ni restricción de léxico: no aprovecha el conocimiento del texto coránico para corregir errores, lo que limita la precisión frente a sistemas con rescoring.
- No es un modelo ASR general: está especializado en recitación coránica en árabe y no se ha validado para árabe conversacional ni para otros idiomas.
- Riesgo de alucinación no cuantificado en la información disponible; al ser CTC sin LM, el riesgo de texto inventado es estructuralmente menor que en modelos generativos, pero no se publican análisis específicos.
- Sesgos: no se documentan sesgos demográficos ni de recitadores más allá de las métricas por fuente; la cobertura de recitadores y estilos está acotada a los datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia de los datos de entrenamiento (`tarteel-ai/tlog`, `IqraEval/Iqra_train`) si se requiere cumplimiento estricto en producción.
- Sin datos publicados de latencia en GPU ni de comportamiento con audio fuera de dominio (ruido, música, habla no coránica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abdou/quran-asr-tiny
- Paper: https://zenodo.org/records/23761691
- DOI: https://doi.org/10.5281/zenodo.23761691
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Benchmark Quran-Lab: https://huggingface.co/datasets/Quran-Lab/quranic-asr-benchmark
- Leaderboard Quran-Lab: https://huggingface.co/spaces/Quran-Lab/quranic-asr-leaderboard
- Dataset tarteel-ai/tlog: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset IqraEval/Iqra_train: https://huggingface.co/datasets/IqraEval/Iqra_train
