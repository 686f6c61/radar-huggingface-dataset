# dianavdavidson/wav2vec2-xls-r-300m-mucs-62230-hinglish_mixed_scripts-1e-4-epochs-100-FT

## Resumen

Este modelo es un ajuste fino (fine-tune) de `facebook/wav2vec2-xls-r-300m`, un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura wav2vec 2.0, especializado en la transcripción de habla en hinglish, es decir, la mezcla de hindi e inglés con escritura en ambos alfabetos (devanagari y latino). El nombre del repositorio indica que se entrenó sobre un conjunto de datos denominado "mucs-62230" con scripts mixtos, aunque la model card no proporciona detalles adicionales sobre el corpus.

El modelo fue desarrollado por el usuario `dianavdavidson` y publicado bajo licencia Apache 2.0. Con 315,5 millones de parámetros, hereda la capacidad multilingüe del modelo base XLS-R, que fue preentrenado en 128 idiomas con 436 000 horas de audio no etiquetado. Este ajuste fino lo adapta específicamente a la tarea de transcripción de hinglish, un dominio lingüístico poco cubierto por los ASR comerciales. Su relevancia radica en ofrecer una alternativa abierta y especializada para un idioma de gran uso en el sur de Asia, aunque su rendimiento (WER de validación del 25,68 %) indica que aún tiene margen de mejora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder transformer con capas convolucionales) |
| Parametros totales | 315 550 445 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa señales de hasta 30 segundos por defecto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | hinglish (mezcla hindi-ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec 2.0, que combina un encoder convolucional para extraer representaciones de la señal de audio con un transformer de 24 capas que modela dependencias temporales. El modelo base XLS-R de 300M parámetros fue preentrenado de forma autosupervisada en 128 idiomas con 436 000 horas de audio, y este ajuste fino lo adapta a la transcripción de hinglish mediante entrenamiento supervisado.

El proceso de fine-tuning utilizó una tasa de aprendizaje de 1e-4, tamaño de lote efectivo de 32 (con acumulación de gradientes de 2 pasos), optimizador AdamW, programador de tasa constante con calentamiento de 500 pasos y 100 épocas. Se empleó precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está documentado en la model card; solo se menciona el identificador "mucs-62230" en el nombre del repositorio, que probablemente hace referencia a un corpus específico de habla hinglish, pero no se aporta información verificable sobre su composición o tamaño.

## Capacidades

- Transcripción de audio a texto en hinglish, incluyendo mezcla de escritura devanagari y latina.
- Reconocimiento de voz para entradas de audio de hasta 30 segundos (límite estándar de wav2vec2).
- Herencia de las representaciones multilingües del modelo base XLS-R, aunque el ajuste fino reduce su generalización a otros idiomas.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de ASR.
- No dispone de modo "thinking" ni capacidades de visión o audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y llamadas en hinglish: el modelo puede convertir grabaciones de audio en texto para generar actas o búsquedas internas, aprovechando su especialización en el registro coloquial de este idioma.
- Subtitulado automático de vídeos en plataformas de streaming o redes sociales: se integra en pipelines de postproducción para generar subtítulos en hinglish, reduciendo costes frente a servicios externos.
- Asistentes de voz para aplicaciones móviles dirigidas a usuarios del norte de India: el modelo puede transcribir comandos de voz en hinglish y pasarlos a un sistema de comprensión del lenguaje natural.
- Análisis de llamadas de atención al cliente en centros de soporte: permite extraer texto de conversaciones telefónicas para análisis de sentimiento o control de calidad.
- Herramientas de accesibilidad para personas con discapacidad auditiva: convierte discurso en tiempo real a texto en hinglish, facilitando la comunicación en entornos educativos o laborales.
- Investigación lingüística sobre el hinglish: sirve como base para estudiar la variación fonética y ortográfica de este idioma mixto, dado su entrenamiento en scripts mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye una sección de evaluación comparativa (results: []). El único dato de rendimiento es el WER global de validación obtenido durante el entrenamiento, que alcanzó un valor mínimo de 25,68 % en la época 11. A continuación se muestra la evolución del entrenamiento:

| Epoca | Loss de entrenamiento | Loss de validacion | WER global |
|---|---|---|---|
| 1 | No log | 3,6519 | 100,0 |
| 2 | 15,2182 | 1,3222 | 56,7615 |
| 3 | 4,1040 | 0,9634 | 34,1506 |
| 4 | 1,4777 | 0,8626 | 30,2604 |
| 5 | 1,1156 | 0,8177 | 30,0970 |
| 6 | 0,8923 | 0,8395 | 27,7324 |
| 7 | 0,7584 | 0,7779 | 27,7324 |
| 8 | 0,6413 | 0,8068 | 25,4658 |
| 9 | 0,6413 | 0,7883 | 27,3183 |
| 10 | 0,5649 | 0,7899 | 26,2613 |
| 11 | 0,5019 | 0,7889 | 25,6838 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 y 0,6 GB en fp16, considerando el tamaño de los pesos (315M parámetros). El modelo cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. También puede ejecutarse en CPU, aunque con latencias mayores.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` mediante el pipeline `automatic-speech-recognition`, o con `torchaudio` para integraciones a bajo nivel. No se han publicado versiones cuantizadas (GGUF, ONNX) en el repositorio.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU RTX 3060, se espera una latencia de procesamiento de audio en tiempo real o inferior para clips de hasta 30 segundos, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de ASR para hinglish en la información proporcionada. Como referencia, se puede comparar con el modelo base `facebook/wav2vec2-xls-r-300m`, que no está especializado en hinglish y presenta un WER mucho mayor en este idioma, y con otros fine-tunes del mismo autor (por ejemplo, `wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT`), aunque no se han publicado métricas comparables. Tampoco se dispone de datos de modelos comerciales como Whisper o Google Speech-to-Text para este dominio específico.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado, lo que impide evaluar posibles sesgos demográficos, dialectales o de calidad de audio.
- El WER de validación del 25,68 % es alto para aplicaciones de producción; el modelo puede cometer errores frecuentes en habla espontánea, ruido de fondo o acentos no representados en el corpus.
- La especialización en hinglish limita su uso a este idioma; no se recomienda emplearlo para otros idiomas, aunque el modelo base sea multilingüe.
- No se han publicado versiones cuantizadas ni optimizaciones para despliegue en dispositivos edge, lo que puede dificultar su integración en entornos con restricciones de memoria.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo preentrenado, se deben respetar los términos de la licencia del modelo base (también Apache 2.0).
- La model card está generada automáticamente y carece de información sobre limitaciones específicas, por lo que se recomienda realizar una evaluación exhaustiva antes de usar el modelo en entornos críticos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-mucs-62230-hinglish_mixed_scripts-1e-4-epochs-100-FT
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Documentación de torchaudio para XLS-R: https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR_300M.html
- README de XLS-R en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/xlsr/README.md
- Otro fine-tune del mismo autor: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-25_45-1e-4-epochs-50-FT
