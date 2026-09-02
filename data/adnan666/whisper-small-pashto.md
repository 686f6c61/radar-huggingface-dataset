# Adnan666/whisper-small-pashto

## Resumen

El modelo `Adnan666/whisper-small-pashto` es un fine-tune del sistema de reconocimiento automático de voz (ASR) Whisper Small, desarrollado por el usuario Adnan666, con el objetivo de transcribir audio en idioma pastún, una lengua hablada principalmente en Afganistán y Pakistán. Se basa en el modelo `ihanif/whisper_small_ps_augmented`, que a su vez es una adaptación de Whisper Small de OpenAI. El modelo está entrenado sobre un conjunto de datos no especificado y presenta una tasa de error de palabra (WER) del 32,6 % en el conjunto de evaluación, lo que indica un rendimiento moderado para un idioma de bajos recursos. Con 241,7 millones de parámetros, sigue la arquitectura encoder-decoder de Whisper y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación. Su relevancia radica en ofrecer una opción de ASR para pastún, un idioma con escasos recursos disponibles en el ecosistema de modelos abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere pastún) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Whisper Small, una arquitectura transformer encoder-decoder diseñada para ASR. El encoder procesa espectrogramas de audio de 30 segundos y el decoder genera la transcripción de forma autorregresiva. El entrenamiento se realizó a partir del checkpoint `ihanif/whisper_small_ps_augmented`, que ya había sido adaptado al pastún. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-06, tamaño de lote de 8 con acumulación de gradientes de 2 (lote efectivo de 16), optimizador Adam, scheduler lineal con 600 pasos de calentamiento y 21.854 pasos de entrenamiento. Se utilizó precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no se especifica en la model card, por lo que se desconoce su composición y tamaño. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Reconocimiento de voz automático (ASR) para audio en pastún, generando transcripciones de texto.
- Procesamiento de segmentos de audio de hasta 30 segundos (estándar de Whisper, aunque no confirmado en la documentación del modelo).
- Integración con el ecosistema de Hugging Face Transformers, permitiendo su uso en pipelines de `automatic-speech-recognition`.
- No se documentan capacidades adicionales como tool calling, agentes, visión o multilingüismo.

## Casos de uso

- Transcripción de reuniones y conferencias en pastún: el modelo puede convertir grabaciones de audio en texto, facilitando la generación de actas o resúmenes. Su tamaño compacto permite ejecutarlo en entornos con recursos limitados.
- Subtitulado automático de vídeos en pastún: al transcribir el audio, se pueden generar subtítulos para plataformas de vídeo, mejorando la accesibilidad de contenido en este idioma.
- Asistentes de voz en pastún: combinado con un sistema de comprensión del lenguaje, el modelo puede servir como entrada para asistentes virtuales o interfaces de voz en aplicaciones móviles.
- Transcripción de llamadas de servicio al cliente: en empresas que atienden a hablantes de pastún, el modelo puede transcribir llamadas para análisis de calidad o extracción de información.
- Herramientas de accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones o eventos en pastún puede ayudar a personas con problemas de audición.
- Análisis de contenido multimedia: transcripción de podcasts, noticias o entrevistas en pastún para su posterior procesamiento, como búsqueda de información o traducción automática.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación, declarados por el autor:

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,3364 |
| WER (evaluación) | 32,6050 % |

Además, se proporciona la evolución del entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Wer |
|:-------------:|:-----:|:----:|:---------------:|:---:|
| 1.321 | 0.0137 | 100 | 0.2794 | 28.2726 |
| 1.1509 | 0.0275 | 200 | 0.3045 | 29.4678 |
| 1.0585 | 0.0412 | 300 | 0.3154 | 30.4388 |
| 1.0012 | 0.0549 | 400 | 0.3218 | 30.4575 |
| 0.9466 | 0.0686 | 500 | 0.3329 | 32.4370 |
| 0.9275 | 0.0824 | 600 | 0.3364 | 32.6050 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32, 0,5 GB en FP16 y 0,25 GB en INT8 (estimación basada en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) o incluso CPU para inferencia en lote pequeño.
- Es compatible con GPUs de consumo (RTX 30/40 series) y puede ejecutarse en entornos sin GPU usando CPU.
- Opciones de despliegue: biblioteca `transformers` de Hugging Face, `whisper.cpp` para CPU, o servidores de inferencia como vLLM (aunque Whisper no es un modelo LLM, se puede servir con TGI o Triton).
- Latencia y throughput: no disponibles; dependen del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en la información proporcionada. Existen otros fine-tunes de Whisper para pastún del mismo autor, como `Adnan666/whisper-small-pashto-stage2-fleursonly` y `Adnan666/whisper-small-pashto-run9-freshbase`, pero no se han publicado métricas en los resultados de búsqueda. Se puede considerar que este modelo compite con el Whisper original de OpenAI, aunque este último no está optimizado para pastún y probablemente tenga un WER más alto en este idioma.

## Limitaciones y advertencias

- El WER del 32,6 % indica que el modelo comete errores significativos; no es adecuado para transcripciones críticas sin revisión humana.
- El conjunto de datos de entrenamiento es desconocido, lo que puede implicar sesgos en el vocabulario o en los acentos representados.
- El modelo está especializado en pastún; no se garantiza su funcionamiento en otros idiomas.
- No se documentan limitaciones específicas de contexto o longitud de audio, pero al ser Whisper, se espera que maneje segmentos de 30 segundos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del modelo base para posibles restricciones adicionales.
- El tamaño del repositorio (224.6 GB) parece inconsistente con el número de parámetros; podría tratarse de un error en la página de Hugging Face.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Adnan666/whisper-small-pashto)
- [Modelo stage2-fleursonly](https://huggingface.co/Adnan666/whisper-small-pashto-stage2-fleursonly)
- [Modelo run9-freshbase en FriendliAI](https://friendli.ai/models/Adnan666/whisper-small-pashto-run9-freshbase)
- [Repositorio de Whisper en GitHub](https://github.com/openai/whisper)
