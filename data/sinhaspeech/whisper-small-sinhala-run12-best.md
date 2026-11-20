# SinhaSpeech/whisper-small-sinhala-run12-best

## Resumen

whisper-small-sinhala-run12-best es un ajuste fino completo de openai/whisper-small (244M parámetros) especializado en reconocimiento automático de habla (ASR) en sinhala, la lengua oficial de Sri Lanka. Lo desarrolla SinhaSpeech, un proyecto de la Universidad de Moratuwa (Departamento de Ingeniería de Software) que construye una plataforma de accesibilidad para personas sordas o con dificultades auditivas en el ámbito educativo. El modelo es la pieza de ASR que alimenta el subtitulado en vivo de clases, la revisión de transcripciones, los cuestionarios hablados y el modo de comandos de voz manos libres.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper, con ventanas de audio de 30 segundos y 241,7 millones de parámetros efectivos. Frente a las versiones multilingües de Whisper, que ofrecen un rendimiento muy limitado en sinhala por la escasez de datos de esa lengua en el preentrenamiento, este ajuste alcanza un 15,52 % de WER y un 4,36 % de CER sobre un conjunto de test de 15.860 enunciados con hablantes disjuntos. Es, según el autor, el mejor resultado de la serie de ejecuciones del proyecto (run10, run11, run12).

Su relevancia práctica es doble: por un lado, demuestra que un modelo pequeño (244M) puede ofrecer un ASR utilizable en una lengua de bajos recursos mediante un ajuste fino bien diseñado; por otro, su licencia Apache 2.0 y su compatibilidad con el ecosistema transformers y faster-whisper lo hacen desplegable en producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (Whisper nativo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; compatible con CTranslate2 (faster-whisper) para int8/float16 segun el runtime |
| Idiomas soportados | sinhala (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); conversion a CTranslate2 para faster-whisper |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (todos los pesos actualizados) de openai/whisper-small, un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel de 80 canales, y genera texto de forma autorregresiva con tokens especiales de idioma y tarea. En este ajuste se mantiene la arquitectura intacta y se especializa el modelo en la tarea de transcripción en sinhala mediante el token de idioma `si`.

El entrenamiento se realizó sobre el dataset SinhaSpeech/sinhala-asr-data-v6 (partición `stratified_v6`), con 123.205 muestras de entrenamiento, 15.763 de validación y 15.860 de test, con separación por hablante entre particiones. Se usó learning rate 8,56e-5 con decaimiento coseno, 500 pasos de warmup, batch efectivo de 64, 6 épocas (11.556 pasos), precisión bf16 sobre AMD Instinct MI300X con ROCm, y augmentación con SpecAugment más ruido, estiramiento temporal y cambio de tono (probabilidad 0,2 cada una). El hiperparámetro se seleccionó mediante un barrido Optuna TPE de 20 ensayos. El entrenamiento completo duró aproximadamente 5,75 horas y la pérdida final de entrenamiento fue 0,0238 (media ~0,089). No se menciona RLHF ni DPO; es un ajuste supervisado puro sobre pares audio-transcripción.

## Capacidades

- Transcripción de voz a texto en sinhala con salida de texto plano.
- Procesamiento de audio en ventanas de 30 segundos, con chunking para grabaciones más largas mediante `chunk_length_s=30`.
- Entrada de audio a 16 kHz mono; el pipeline de transformers remuestrea otros formatos mediante ffmpeg.
- Soporte de decodificación con tokens de idioma y tarea (`language="sinhala"`, `task="transcribe"`).
- Compatible con el pipeline `automatic-speech-recognition` de transformers y con la conversión a CTranslate2 para faster-whisper (usada por el proyecto para subtitulado en vivo de baja latencia).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking; el modelo es exclusivamente ASR.
- Capacidad multilingüe limitada al sinhala; no se declara soporte para otras lenguas.

## Casos de uso

- Subtitulado en vivo de clases universitarias: el modelo transcribe audio de conferencias en sinhala en ventanas de 30 s; el proyecto lo sirve mediante faster-whisper para reducir latencia y permitir la visualización de subtítulos casi en tiempo real.
- Revisión y corrección de transcripciones: al generar texto con un CER del 4,36 %, el modelo produce borradores que requieren poca corrección manual, lo que agiliza la publicación de apuntes accesibles para estudiantes con discapacidad auditiva.
- Cuestionarios hablados y evaluación oral: el modelo convierte respuestas de voz de los estudiantes en texto evaluable, integrándose en flujos de evaluación automática o semiautomática.
- Modo de comandos de voz manos libres: la transcripción de comandos cortos permite controlar la plataforma SinhaSpeech sin teclado, útil en entornos de accesibilidad.
- Generación de subtítulos para vídeos educativos grabados: procesando el audio por bloques de 30 s se obtienen transcripciones alineadas temporalmente que pueden exportarse a formatos de subtítulos.
- Investigación en ASR de bajos recursos: el modelo sirve como línea base reproducible para experimentos en sinhala, con particiones speaker-disjoint y métricas WER/CER documentadas.
- Integración en pipelines de accesibilidad para administraciones o ONG: al tener licencia Apache 2.0, puede desplegarse en servicios públicos de transcripción sin coste de licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | WER (%) | CER (%) |
|---|---|---|
| Validación (época 6) | 18,70 | 6,07 |
| Test (15.860 filas) | 15,52 | 4,36 |

Evolución por época en validación:

| Epoca | Val WER (%) | Val CER (%) | Val loss |
|---|---|---|---|
| 1 | 31,18 | 9,92 | 0,1688 |
| 2 | 26,12 | 8,21 | 0,1087 |
| 3 | 22,52 | 7,02 | 0,1051 |
| 4 | 20,22 | 6,48 | 0,0858 |
| 5 | 18,75 | 6,06 | 0,0756 |
| 6 | 18,70 | 6,07 | 0,0787 |

Comparación con otras ejecuciones del mismo proyecto (test):

| Run | Configuracion | Test WER (%) | Test CER (%) |
|---|---|---|---|
| run10 | datos v6, lr lineal 3e-5, 5 ep | 17,17 | 4,71 |
| run11 | datos v6, lr lineal 3e-5, 6 ep | 16,38 | 4,43 |
| run12 (este) | datos v6, lr coseno 8,56e-5, 6 ep | 15,52 | 4,36 |

No se han publicado resultados de benchmarks frente a otros modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32/bf16 para los pesos (241,7M parámetros); el repo ocupa 1,0 GB. En la práctica, con el pipeline de transformers se recomienda al menos 2-4 GB de VRAM para acomodar activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado en AMD Instinct MI300X, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas últimas sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: pipeline de transformers, CTranslate2/faster-whisper (usado por el proyecto para baja latencia), y potencialmente llama.cpp/whisper.cpp si se convierte el modelo; vLLM y TGI no son opciones habituales para Whisper.
- Latencia y throughput: no se publican cifras concretas. El proyecto usa faster-whisper para subtitulado en vivo, lo que sugiere latencias compatibles con streaming, pero no se proporcionan números de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | WER sinhala | Licencia |
|---|---|---|---|---|---|
| whisper-small-sinhala-run12-best | 241,7M | 30 s | sinhala | 15,52 % (test propio) | Apache 2.0 |
| openai/whisper-small | 244M | 30 s | multilingüe (99) | no disponible para sinhala en la informacion | MIT |
| openai/whisper-large-v3 | 1.550M | 30 s | multilingüe (99) | no disponible en la informacion | MIT |
| Modelos ASR sinhala especificos | no disponible | no disponible | sinhala | no disponible | no disponible |

No se dispone de datos de WER en sinhala para whisper-small ni whisper-large-v3 en la informacion proporcionada, por lo que no es posible una comparación numérica directa. La ventaja de este modelo frente a whisper-small original es la especialización en sinhala mediante ajuste fino completo; frente a whisper-large-v3, la ventaja es el tamaño reducido y la licencia Apache 2.0, a costa de una capacidad multilingüe limitada.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena con un dataset específico (SinhaSpeech/sinhala-asr-data-v6, que incluye OpenSLR-52); puede tener peor rendimiento con acentos regionales, habla informal, ruido de fondo intenso o hablantes no representados en el corpus.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible pero incorrecto en segmentos de audio ambiguos o con silencio; se recomienda validación humana en contextos críticos.
- Limitaciones de contexto: ventanas de 30 s; para audio más largo es necesario hacer chunking, lo que puede introducir errores en las fronteras entre bloques.
- Limitaciones de idioma: solo sinhala; no se debe usar para otras lenguas, y el token de idioma debe fijarse explícitamente para evitar comportamientos indeseados.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset de entrenamiento (OpenSLR-52 y sinhala-asr-data-v6) por si imponen restricciones adicionales.
- Caveat de producción: los benchmarks son declarados por el autor y no verificados de forma independiente; el conjunto de test es speaker-disjoint, lo que es positivo, pero el rendimiento en dominios distintos (por ejemplo, llamadas telefónicas o audio de baja calidad) puede degradarse.
- Divergencia leve en la época 6: la pérdida de validación sube ligeramente (0,0756 a 0,0787) mientras el WER sigue mejorando marginalmente; no es sobreajuste claro, pero conviene monitorizar en despliegues con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run12-best
- Dataset de entrenamiento: https://huggingface.co/datasets/SinhaSpeech/sinhala-asr-data-v6
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- OpenSLR-52 (datos de sinhala incluidos en el entrenamiento): https://www.openslr.org/52/
- CTranslate2 / faster-whisper (runtime usado por el proyecto): https://github.com/SYSTRAN/faster-whisper
