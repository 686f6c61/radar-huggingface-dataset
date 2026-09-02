# FredrikKarlssonSpeech/nb-whisper-small-mlx

## Resumen

El modelo **nb-whisper-small-mlx** es una conversión a MLX (Machine Learning eXchange) del modelo **NbAiLab/nb-whisper-small**, desarrollado por la Biblioteca Nacional de Noruega (NbAiLab) como una adaptación de Whisper de OpenAI para el reconocimiento automático de voz (ASR) en noruego. Esta conversión, creada por FredrikKarlssonSpeech, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon (chips M1/M2/M3) mediante la librería `mlx-whisper`, manteniendo la precisión en float16.

El modelo base es una variante de Whisper small, una arquitectura transformer encoder-decoder diseñada para transcribir audio en ventanas de 30 segundos. Al estar especializado en noruego, ofrece un rendimiento superior al Whisper original en este idioma, con un tamaño de repositorio de 0,5 GB. La relevancia actual radica en que proporciona una opción ligera y rápida para transcripción en noruego en equipos Apple, sin necesidad de GPU dedicadas ni servicios en la nube.

La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder) |
| Parametros totales | no disponible (aprox. 244M segun la arquitectura Whisper small de OpenAI) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper) |
| Tipos de cuantizacion | float16 |
| Idiomas soportados | noruego (nb: bokmal, no: general) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo original NbAiLab/nb-whisper-small se basa en la arquitectura Whisper de OpenAI, que emplea un transformer encoder-decoder con atencion por capas. Segun la informacion disponible en ModelScope, la serie NB-Whisper fue entrenada durante 250.000 pasos con un dataset diverso de 8 millones de horas de audio, aunque no se especifica si este dato aplica exactamente al modelo small. El modelo fue fine-tuneado sobre el checkpoint de Whisper small para mejorar el reconocimiento del noruego, incluyendo variantes dialectales y entornos ruidosos.

La conversion a MLX se realizo con el script `mlx-examples/whisper/convert.py` a precision float16, lo que reduce el tamaño y acelera la inferencia en Apple Silicon sin cambios en la arquitectura. No se han publicado detalles sobre tecnicas adicionales como RLHF o DPO; el entrenamiento se centra exclusivamente en ASR supervisado.

## Capacidades

- Reconocimiento automatico de voz (ASR) en noruego, tanto bokmal como variantes generales.
- Transcripcion de audio en tiempo real o por lotes con ventanas de 30 segundos.
- Manejo de audio con ruido de fondo y acentos regionales gracias al entrenamiento especifico en noruego.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de transcripcion.
- No es multilingue; esta limitado al noruego, a diferencia del Whisper original que soporta 99 idiomas.
- No dispone de modo thinking ni capacidades de vision o audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones de trabajo en noruego: el modelo puede procesar grabaciones de reuniones de hasta 30 segundos por ventana, con solapamiento automatico para audios largos, generando texto en tiempo real o diferido.
- Subtitulado automatico de videos y podcasts en noruego: integrable en pipelines de postproduccion mediante `mlx_whisper`, permitiendo generar subtitulos sin conexion y con baja latencia en Mac.
- Asistencia a personas con discapacidad auditiva: transcripcion de conversaciones o eventos en noruego, ejecutable en portatiles Apple sin necesidad de infraestructura externa.
- Indexacion de archivos de audio en bibliotecas o archivos: el modelo puede transcribir grandes volumenes de grabaciones para generar busquedas textuales, gracias a su peso reducido (0,5 GB) y velocidad en MLX.
- Verificacion de calidad en centros de llamadas en noruego: transcripcion de llamadas para analisis posterior, con capacidad de procesamiento local en equipos Apple.
- Herramientas educativas para aprendizaje de idiomas: transcripcion de pronunciacion en noruego, util para aplicaciones de practica de conversacion que requieren retroalimentacion inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como WER (Word Error Rate) ni comparaciones con otros modelos ASR. Se recomienda evaluar el modelo en un conjunto de validacion propio si se considera su uso en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en float16, por lo que cabe en cualquier Mac con Apple Silicon (incluso con 8 GB de RAM unificada).
- GPU recomendadas: no requiere GPU discreta; funciona en los chips M1, M2 y M3 (incluidos los variantes Pro, Max y Ultra).
- Compatible con cualquier Mac con Apple Silicon; no soporta GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-whisper` (CLI y API Python), integrable en aplicaciones mediante la libreria `mlx_whisper`.
- Latencia y throughput: no se proporcionan datos oficiales, pero en MLX la inferencia en un M1 Pro suele ser de 1-2x tiempo real para audio de 30 segundos; en chips M2/M3 la velocidad es mayor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| nb-whisper-small-mlx (este) | Whisper small | ~244M | 30 s audio | noruego | Apache 2.0 | MLX |
| NbAiLab/nb-whisper-small | Whisper small | ~244M | 30 s audio | noruego | Apache 2.0 | safetensors (PyTorch) |
| openai/whisper-small | Whisper small | 244M | 30 s audio | 99 idiomas | MIT | PyTorch, CT2, etc. |
| NbAiLab/nb-whisper-small-onnx | Whisper small | ~244M | 30 s audio | noruego | Apache 2.0 | ONNX |

La diferencia principal es el formato: esta version MLX esta optimizada para Apple Silicon, mientras que la version original usa PyTorch y requiere CUDA o CPU mas lenta. La version ONNX es util para otros backends como ONNX Runtime. El Whisper original de OpenAI soporta mas idiomas pero tiene peor precision en noruego que el modelo especializado.

## Limitaciones y advertencias

- Modelo exclusivo para noruego; no transcribe otros idiomas, a diferencia del Whisper original.
- Riesgo de alucinaciones en audio silencioso o con mucho ruido, un problema conocido en todos los modelos Whisper.
- La conversion a float16 puede introducir ligeras perdidas de precision en comparacion con el modelo original en float32, aunque en la practica es despreciable.
- No se han publicado benchmarks formales, por lo que el rendimiento real debe validarse con datos propios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base depende de la arquitectura Whisper (licencia MIT de OpenAI), por lo que no hay restricciones adicionales.
- El tamaño del repositorio (0,5 GB) puede variar segun la plataforma de descarga; se recomienda verificar la integridad de los archivos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-small-mlx)
- [Version ONNX del mismo modelo](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-small-onnx)
- [Repositorio NbAiLab/nb-whisper en GitHub](https://github.com/NbAiLab/nb-whisper)
- [mlx-whisper (ejemplos de MLX)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [Whisper de OpenAI (paper)](https://github.com/openai/whisper)
- [Resumen de NB-Whisper en ModelScope](https://www.modelscope.cn/models/onnx-community/nb-whisper-small-ONNX/summary)
