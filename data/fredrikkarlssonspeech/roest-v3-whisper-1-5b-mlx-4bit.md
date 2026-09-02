# FredrikKarlssonSpeech/roest-v3-whisper-1.5b-mlx-4bit

## Resumen

El modelo `roest-v3-whisper-1.5b-mlx-4bit` es una conversión a formato MLX con cuantización de 4 bits del modelo `CoRal-project/roest-v3-whisper-1.5b`, un sistema de reconocimiento automático del habla (ASR) en danés desarrollado por el Alexandra Institute dentro del proyecto CoRal. El modelo base es una variante de Whisper-large entrenada sobre el dataset CoRal-v3, que incluye una amplia variedad de datos conversacionales y de lectura en danés, distribuidos por edades, géneros y dialectos.

Esta conversión MLX está pensada para ejecutar inferencia de forma rápida y eficiente en dispositivos Apple Silicon mediante la librería `mlx-whisper`. Al estar cuantizado a 4 bits, el tamaño del repositorio es de 0,9 GB, lo que permite su uso en equipos con memoria unificada moderada. Su relevancia radica en ofrecer una solución de transcripción en danés de alta calidad, ejecutable localmente en hardware de Apple sin necesidad de GPU dedicada.

El modelo está etiquetado con la licencia `openrail`, lo que permite su uso comercial con ciertas restricciones. No se han publicado métricas de rendimiento en la información disponible, por lo que esta ficha se basa en las características declaradas y en el contexto del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 1.5B (según nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de Whisper: 30 segundos de audio) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Danés (da) |
| Licencia | OpenRAIL |
| Formato de pesos | MLX |

## Arquitectura y entrenamiento

El modelo base `roest-v3-whisper-1.5b` es un fine-tuning de Whisper-large sobre el dataset CoRal-v3, que contiene una mezcla de habla conversacional y lectura en danés, con representación de distintos grupos de edad, géneros y dialectos. El entrenamiento fue realizado por el Alexandra Institute como parte del proyecto CoRal, orientado a mejorar el estado del arte en ASR para danés.

La conversión a MLX se realizó con la herramienta `convert.py` de `mlx-examples/whisper`, aplicando cuantización de 4 bits. Esta conversión no modifica los pesos del modelo original, solo los reempaqueta en el formato MLX y reduce su precisión para acelerar la inferencia en Apple Silicon. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en danés, incluyendo transcripción de audio a texto.
- Manejo de diversos dialectos y acentos daneses gracias a la diversidad del dataset CoRal-v3.
- Inferencia optimizada para Apple Silicon mediante Metal, con baja latencia en hardware compatible.
- Soporte para transcripción de archivos de audio mediante línea de comandos o API de Python (`mlx_whisper`).
- No incluye capacidades de tool calling, generación de código, razonamiento ni otras tareas fuera del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en danés: el modelo puede procesar grabaciones de audio y generar texto en tiempo real o diferido, útil para actas y análisis posterior.
- Subtitulación automática de vídeos en danés: integrable en flujos de edición de vídeo para generar subtítulos sin intervención manual.
- Asistencia a personas con discapacidad auditiva: permite convertir conversaciones o eventos en texto legible en dispositivos Apple.
- Análisis de llamadas de servicio al cliente: las empresas pueden transcribir llamadas en danés para extraer métricas de calidad o detectar problemas recurrentes.
- Investigación lingüística y sociolingüística: el modelo facilita la transcripción de corpus orales daneses para estudios de dialectos y variación.
- Dictado y entrada de texto por voz en aplicaciones de productividad: al ejecutarse localmente, garantiza privacidad y funciona sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER, MMLU o HumanEval para este modelo ni para su versión base.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3 o posteriores) con memoria unificada.
- Tamaño del modelo: 0,9 GB en formato 4-bit, por lo que cabe en Macs con 8 GB de RAM o más.
- Inferencia mediante `mlx-whisper`, que utiliza Metal para aceleración por GPU integrada.
- No requiere GPU dedicada ni tarjeta gráfica externa.
- Latencia y throughput no especificados, pero al ser un modelo de 1.5B cuantizado, se espera un rendimiento en tiempo real en hardware Apple moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR en danés. Como referencia cualitativa:

| Modelo | Tamaño | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| roest-v3-whisper-1.5b-mlx-4bit | 1.5B | No disponible | Danés | OpenRAIL | MLX |
| Whisper-large-v3 (OpenAI) | 1.55B | 30 s | Multilingüe | MIT | Safetensors, GGUF, etc. |
| Otros modelos daneses | No disponible | No disponible | Danés | No disponible | No disponible |

La principal diferencia es la especialización en danés y la optimización para Apple Silicon, frente al enfoque multilingüe de Whisper original.

## Limitaciones y advertencias

- Modelo exclusivamente entrenado para danés; no soporta otros idiomas.
- La ventana de contexto de audio está limitada a 30 segundos por segmento (típico de Whisper), lo que requiere segmentación para audios largos.
- Posibles errores en dialectos o acentos poco representados en el dataset CoRal-v3.
- La cuantización de 4 bits puede introducir una ligera degradación en la precisión frente al modelo en precisión completa.
- La licencia OpenRAIL permite uso comercial, pero es necesario revisar los términos específicos de la licencia para cada caso.
- No se han publicado evaluaciones independientes de rendimiento, por lo que se recomienda validar el modelo con datos propios antes de usarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FredrikKarlssonSpeech/roest-v3-whisper-1.5b-mlx-4bit)
- [Modelo base CoRal-project/roest-v3-whisper-1.5b](https://huggingface.co/CoRal-project/roest-v3-whisper-1.5b)
- [Repositorio mlx-whisper (ml-explore)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
