# SinhaSpeech/whisper-small-sinhala-run13

## Resumen

SinhaSpeech/whisper-small-sinhala-run13 es un ajuste fino de openai/whisper-small para reconocimiento automatico del habla (ASR) en sinhala (සිංහල). Lo desarrolla el proyecto SinhaSpeech, asociado a la Universidad de Moratuwa, y forma parte de una serie de experimentos numerados (run11, run12, run13) que exploran hiperparametros de entrenamiento sobre el mismo corpus en sinhala. El modelo resuelve la transcripcion de audio a texto en un idioma de bajos recursos, donde los sistemas ASR multilingues genericos ofrecen un rendimiento pobre.

Tecnicamente es un transformer encoder-decoder con 241.734.912 parametros (la variante "small" de Whisper), entrenado con un ajuste fino completo en bf16 sobre aproximadamente 117.000 muestras de audio (split stratified_v6). La ventana de contexto de audio es de 30 segundos por inferencia, estandar en la familia Whisper. El modelo declara un WER de 17,08% y un CER de 4,55% sobre el split de test de SinhaSpeech/sinhala-asr-data-v6 (15.860 muestras).

Su relevancia es doble: por un lado, ofrece una base funcional para ASR en sinhala con licencia Apache 2.0; por otro, expone en abierto el historial de experimentos, lo que lo hace util como referencia metodologica. Conviene senalar que run13 no es el mejor resultado del proyecto: run12 alcanza un WER de 15,52%, y el propio autor indica que la epoca adicional de run13 no aporto mejora respecto a run11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (1500 frames mel) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (precisión completa) |
| Idiomas soportados | Sinhala (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder disenado para ASR multilingue y traduccion de voz. La entrada es un espectrograma mel-log de 80 canales calculado sobre ventanas de 30 segundos; el encoder procesa 1500 posiciones y el decoder genera tokens de texto de forma autorregresiva con atencion cruzada sobre la salida del encoder. El ajuste fino es completo (no LoRA ni adaptadores) en bf16.

El entrenamiento se realizo sobre el split stratified_v6 del dataset SinhaSpeech/sinhala-asr-data-v6, con aproximadamente 117.000 muestras de entrenamiento y particiones disjuntas por hablante. La configuracion incluye learning rate 3e-5 con decaimiento lineal, batch size 64 y 7 epocas. El mejor checkpoint se obtuvo en la epoca 5 (WER de validacion 20,24%), lo que indica que la programacion lineal no se beneficio de la epoca adicional. Se aplico aumento de datos con SpecAugment y perturbaciones de ruido, estiramiento temporal y tono (probabilidad 0,2 cada una). El entrenamiento se ejecuto sobre una AMD Instinct MI300X con ROCm 6.2. Run13 extiende run11 (misma configuracion, 6 epocas, WER de test 16,38%) anadiendo una epoca, sin mejora de resultado.

## Capacidades

- Transcripcion de audio a texto en sinhala (ASR monolingue).
- Procesamiento de fragmentos de audio de hasta 30 segundos por ventana; audios mas largos requieren segmentacion y concatenacion externas.
- Manejo de audio con ruido moderado y variaciones de tono/velocidad, gracias a las tecnicas de augmentation aplicadas en entrenamiento.
- Reconocimiento robusto a distintos hablantes, dado el particionado disjunto por hablante del dataset.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, traduccion explicita ni diarizacion de hablantes.
- Capacidad multilingue limitada en la practica: el ajuste fino esta orientado exclusivamente a sinhala.

## Casos de uso

- Transcripcion de reuniones y entrevistas en sinhala: el modelo convierte grabaciones en texto utilizable, segmentando el audio en ventanas de 30 segundos. Es adecuado por su especializacion en el idioma frente a Whisper generico.
- Generacion de subtitulos para contenido audiovisual en sinhala: integrado en un pipeline de segmentacion de audio (por ejemplo, con deteccion de actividad de voz), permite producir subtitulos con un CER de 4,55%, bajo para caracteres.
- Archivado y busqueda de audio historico: transcripcion masiva de archivos de audio para indexacion textual y busqueda posterior por palabra clave en sinhala.
- Asistentes de voz en sinhala: como componente ASR de un sistema conversacional, alimentando un modulo de comprension de lenguaje en sinhala.
- Accesibilidad para personas con discapacidad auditiva: conversion en tiempo casi real de discursos y conferencias en sinhala a texto.
- Documentacion clinica o administrativa dictada en sinhala: transcripcion de notas de voz para su posterior revision y edicion.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala para estudios de lengua sinhala o para ampliar datasets etiquetados.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente) sobre el split de test de SinhaSpeech/sinhala-asr-data-v6 (15.860 muestras):

| Modelo | Test WER | Test CER | Conjunto de evaluacion |
|---|---|---|---|
| SinhaSpeech/whisper-small-sinhala-run13 | 17,08% | 4,55% | sinhala-asr-data-v6 (test) |
| SinhaSpeech/whisper-small-sinhala-run12 | 15,52% | No disponible | sinhala-asr-data-v6 |
| SinhaSpeech/whisper-small-sinhala-run11 | 16,38% | No disponible | sinhala-asr-data-v6 |
| Val WER run13 (epoca 5) | 20,24% | No disponible | split de validacion |

El autor indica que el mejor resultado del proyecto corresponde a run12 (WER 15,52%, learning rate 8,56e-5 con decaimiento coseno), superior a run13.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16/bf16 (pesos ~483 MB mas activaciones y buffers de audio); en fp32 el peso ronda los 967 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente, dado el tamano reducido (241M parametros). No se requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GTX 1660, RTX 3060, RTX 4090 y similares, asi como en iGPU con memoria compartida.
- Despliegue: el modelo se puede cargar con transformers (WhisperForConditionalGeneration) mediante pipeline de ASR; tambien existen rutas de conversion a CTranslate2/faster-whisper y whisper.cpp para inferencia optimizada, aunque el autor no las documenta para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento original: AMD Instinct MI300X con ROCm 6.2 (dato del autor, no aplicable a inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (sinhala) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SinhaSpeech/whisper-small-sinhala-run13 | 241,7M | 30 s | 17,08% (test propio) | Apache 2.0 | HuggingFace |
| SinhaSpeech/whisper-small-sinhala-run12 | ~241,7M | 30 s | 15,52% (test propio) | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244M | 30 s | No disponible para sinhala | MIT | HuggingFace |
| openai/whisper-large-v3 | 1.550M | 30 s | No disponible para sinhala | MIT | HuggingFace |

Nota: los WER de los modelos SinhaSpeech no son directamente comparables con los de otros sistemas ASR en sinhala al proceder de un unico conjunto de evaluacion propio del proyecto. No se dispone de resultados de otros modelos de sinhala en la informacion facilitada.

## Limitaciones y advertencias

- No es el mejor checkpoint de su propia serie: run12 obtiene mejor WER (15,52%) que run13, por lo que run13 no deberia elegirse por defecto dentro del proyecto.
- Los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente (campo "verified: false" en el model-index).
- Riesgo de alucinacion y de bucles de repeticion, comportamiento conocido en modelos Whisper; conviene filtrar salidas anomalas en produccion.
- Limite de 30 segundos por ventana: audios mas largos exigen segmentacion, con riesgo de cortes en fronteras y perdida de coherencia entre segmentos.
- Especializado exclusivamente en sinhala; no se debe esperar un rendimiento util en otros idiomas ni en tareas de traduccion.
- Posibles sesgos derivados del dataset (dominio, acentos, genero y origen de los hablantes no documentados en la informacion disponible).
- Sin informacion publica sobre pruebas con audio de dominio lejano (telefono, ruido industrial, habla espontanea) mas alla del test propio.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-small conviene revisar las condiciones del modelo base; no se documentan restricciones adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- No se documenta version cuantizada oficial, lo que puede requerir conversion propia para despliegues de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run13
- Historial de experimentos del proyecto: https://huggingface.co/SinhaSpeech/whisper-small-sinhala-experiments
- Modelo base: https://huggingface.co/openai/whisper-small
- Checkpoint run12 (mejor del proyecto): https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run12
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/SinhaSpeech/sinhala-asr-data-v6
- Seguimiento de entrenamiento en W&B: https://wandb.ai/yohanj-23-university-of-moratuwa/whisper
- Ejecucion de evaluacion en W&B: https://wandb.ai/yohanj-23-university-of-moratuwa/whisper/runs/1yl3onqg
- Pagina del proyecto SinhaSpeech en HuggingFace: https://huggingface.co/SinhaSpeech
