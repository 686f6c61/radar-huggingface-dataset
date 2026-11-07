# DarlingCat/whisper-small-ru-100h

## Resumen

whisper-small-ru-100h es un ajuste fino del modelo openai/whisper-small (241,7 millones de parámetros) especializado en reconocimiento automático del habla (ASR) en ruso. Lo publica el usuario DarlingCat en Hugging Face bajo licencia Apache 2.0 y está pensado para transcripción de audio en ruso con una precisión muy superior a la del modelo base de OpenAI.

El modelo parte de la arquitectura encoder-decoder de Whisper, un transformer entrenado originalmente por OpenAI para ASR multilingüe, y se ha reentrenado sobre aproximadamente 109 horas de audio en ruso procedente de Mozilla Common Voice 27.0 (unas 100 horas) y Sber Golos (unas 9 horas), con una partición estrictamente disjunta por hablante para evitar fugas de datos. El resultado es una reducción del WER global del 21,83 % al 9,39 % (una mejora relativa superior al 55 %) según las métricas declaradas por el autor.

Es relevante porque demuestra que un ajuste fino relativamente modesto (3 épocas, 7.317 pasos de optimizador) sobre un modelo pequeño de 0,24 B parámetros puede llevar el ASR en ruso a un WER de un dígito, lo que lo hace viable para despliegues en producción con requisitos de hardware moderados. El contexto de audio estándar de Whisper es de 30 segundos por ventana, ampliable mediante chunking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ASR seq2seq |
| Parametros totales | 241.734.912 (241,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ampliable con chunking y stride) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenado en bfloat16, compatible con fp32/fp16/bf16) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un encoder que procesa espectrogramas log-mel de 80 bins (audio mono a 16 kHz) y un decoder autorregresivo que genera tokens de texto. Con 241,7 M parámetros, es la variante "small" de la familia Whisper, lo que implica un equilibrio entre calidad y coste computacional.

El ajuste fino se realizó sobre 78.033 clips (108,95 horas) con filtrado de duración entre 0,5 y 30 segundos. Se usó el optimizador AdamW con weight decay 0,01, learning rate 1e-5, warmup lineal (ratio 0,1) y decaimiento lineal, batch efectivo de 32 (16 por dispositivo × 2 pasos de acumulación de gradiente), precisión mixta bfloat16 y gradient checkpointing activado. El entrenamiento duró 3 épocas (7.317 pasos), con evaluación cada 1.000 pasos sobre el conjunto de desarrollo y selección del mejor checkpoint por menor WER macro en dev. La partición de datos es disjunta por hablante, lo que refuerza la validez de las métricas de evaluación.

## Capacidades

- Transcripción de voz a texto en ruso (ASR) con salida de texto plano.
- Procesamiento de audio de hasta 30 segundos por ventana de forma nativa; audio más largo mediante chunking con solapamiento (stride).
- Soporte de marcas de tiempo (timestamps) opcionales en la generación, según la API estándar de Whisper en Transformers.
- Entrada de audio en múltiples formatos (wav, flac, mp3, etc.) a través del pipeline de Hugging Face, con remuestreo automático a 16 kHz.
- Normalización de texto en cirílico en la evaluación (minúsculas, sustitución de ё por е, eliminación de puntuación), lo que indica robustez ante variaciones ortográficas.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento extendido: es un modelo puramente ASR.
- Capacidad multilingüe limitada al ruso; no se ha validado su rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: con chunking de 30 segundos y stride de 5 segundos, el modelo puede procesar grabaciones largas de forma secuencial, y su WER de 9,39 % global lo hace adecuado para actas automáticas con revisión humana ligera.
- Subtitulado automático de vídeo en ruso: el soporte de timestamps permite generar subtítulos sincronizados; el bajo CER (2,41 %) reduce los errores a nivel de carácter que afectan a la legibilidad.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo y cumplimiento normativo, con un coste de inferencia bajo gracias a los 241,7 M de parámetros.
- Investigación lingüística y corpus: generación de transcripciones a gran escala de audio en ruso (entrevistas, encuestas, material de campo) con una precisión suficiente para análisis cuantitativos, especialmente en dominio Common Voice (WER 6,49 %).
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en contenidos en ruso, desplegable en CPU o GPU de gama media.
- Preprocesamiento para pipelines de NLP: transcripción de audio como paso previo a análisis de sentimiento, resumen o indexación semántica en aplicaciones en ruso.
- Transcripción de audio de dominio crowdsourced (Golos): aunque el WER sube al 14,49 % en este dominio, sigue siendo una mejora del 58,8 % relativo frente al modelo base, útil para normalizar y limpiar corpus de audio abiertos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), con decodificación greedy (`num_beams=1`) y normalización estándar en cirílico. El conjunto de test consta de 2.000 clips (2,55 horas): 1.000 de Common Voice y 1.000 de Sber Golos.

| Benchmark / dataset | Horas | Muestras | WER base (whisper-small) | WER ajustado | Reduccion relativa | CER base | CER ajustado |
|---|---|---|---|---|---|---|---|
| Mozilla Common Voice (ru) | 1,43 h | 1.000 | 14,24 %* | 6,49 % | -54,4 % | 3,88 %* | 1,69 % |
| Sber Golos | 1,12 h | 1.000 | 35,21 %* | 14,49 % | -58,8 % | 18,25 %* | 3,79 % |
| Overall (media macro) | 2,55 h | 2.000 | 24,72 %* | 10,49 % | -57,6 % | — | — |
| Overall (media micro) | 2,55 h | 2.000 | 21,83 %* | 9,39 % | -57,0 % | 8,89 %* | 2,41 % |

\* Métricas del modelo base medidas sobre una muestra emparejada de 1.000 clips (503 de Common Voice + 497 de Golos).

Conjunto de validación (800 clips, 1,06 horas):

| Metrica | Valor |
|---|---|
| WER global (dev) | 8,22 % |
| CER global (dev) | 2,16 % |
| WER Common Voice dev | 6,51 % (CER 1,84 %) |
| WER Sber Golos dev | 13,09 % (CER 3,17 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 241,7 M parámetros, lo que supone aproximadamente 0,97 GB en fp32, 0,48 GB en fp16 y 0,48 GB en bf16 solo para los pesos; con activaciones y buffers de audio, el consumo real se sitúa en torno a 1-2 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan bien RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque el modelo no aprovecha la capacidad de las GPU de gama alta por su reducido tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para audio de duración moderada.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), `AutoModelForSpeechSeq2Seq` + `AutoProcessor`, y en general cualquier runtime compatible con Whisper (por ejemplo, implementaciones de llama.cpp/Ollama para Whisper, faster-whisper o vLLM con soporte de Whisper, aunque la compatibilidad exacta con estos últimos no está confirmada en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 0,24 B, se espera una latencia baja en GPU y un throughput alto con batching, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma | WER ruso (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DarlingCat/whisper-small-ru-100h | 241,7 M | 30 s por ventana | Ruso | 9,39 % (test propio) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 241,7 M | 30 s por ventana | Multilingüe (99 idiomas) | 21,83 % en el mismo test (según el autor) | Apache 2.0 | Hugging Face |
| lorenzoncina/whisper-small-ru | no disponible | 30 s por ventana | Ruso | no disponible (entrenado sobre Common Voice 11.0) | no disponible | Hugging Face |

La comparación directa con lorenzoncina/whisper-small-ru no es posible porque no se han publicado métricas en la información disponible. Frente al modelo base, la mejora es sustancial y medida sobre el mismo conjunto de test. No se dispone de datos de modelos de mayor tamaño (whisper-medium, whisper-large-v3) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse principalmente sobre Common Voice y Golos, puede presentar sesgos de dominio y de demografía de hablantes (edad, acento, género) presentes en esos corpus; el rendimiento en acentos no representados puede degradarse.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio, ruido o audio ininteligible; se recomienda aplicar detección de actividad vocal (VAD) y revisión en dominios críticos.
- Limitaciones de contexto e idioma: la ventana nativa es de 30 segundos; audio más largo requiere chunking con solapamiento, lo que puede introducir errores en las fronteras. El modelo solo está validado para ruso y no se ha evaluado en otros idiomas.
- Diferencia de rendimiento por dominio: el WER en Sber Golos (14,49 %) es más del doble que en Common Voice (6,49 %), lo que indica una brecha de generalización hacia audio espontáneo o de menor calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indique que el modelo deriva de openai/whisper-small (también Apache 2.0).
- Caveat de producción: las métricas son declaradas por el autor y no han sido verificadas de forma independiente (`verified: false` en la model-index); conviene validar el WER en el dominio objetivo antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DarlingCat/whisper-small-ru-100h
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Modelo comparable lorenzoncina/whisper-small-ru: https://huggingface.co/lorenzoncina/whisper-small-ru
- Dataset Mozilla Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset Sber Golos: https://huggingface.co/datasets/sberdevices/golos
