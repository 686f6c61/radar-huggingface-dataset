# dziaineka/whisper-small-belarusian

## Resumen

El modelo `dziaineka/whisper-small-belarusian` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla (ASR) `openai/whisper-small` sobre el conjunto de datos `mozilla-foundation/common_voice_11_0` en su configuración para bielorruso (`be`). Fue desarrollado por el usuario `dziaineka` durante el evento "Whisper Fine-tuning Event" organizado por Hugging Face y Lambda, con el objetivo de mejorar la precisión de transcripción para un idioma de bajos recursos como el bielorruso, que carece de sistemas ASR comerciales de calidad.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper Small, con 241,7 millones de parámetros y una ventana de contexto de 30 segundos de audio. Su relevancia radica en que ofrece un WER (Word Error Rate) de 6,37 en el conjunto de validación de Common Voice 11.0 `be`, una mejora sustancial frente al modelo base, que presenta tasas de error mucho más altas en este idioma. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (1500 frames de características) |
| Tipos de cuantizacion | No especificados; compatible con FP32, FP16 e int8 mediante herramientas externas (llama.cpp, faster-whisper) |
| Idiomas soportados | Bielorruso (be) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI, un transformer encoder-decoder con atención de escala completa, entrenado originalmente sobre 680.000 horas de audio multilingüe. En este caso, se realizó un ajuste fino supervisado sobre el subconjunto bielorruso de Common Voice 11.0, que contiene aproximadamente 1860 horas de audio (según la información del repositorio). El entrenamiento se llevó a cabo durante 12.000 pasos con un tamaño de lote de 64, tasa de aprendizaje de 1e-4, scheduler lineal con 500 pasos de calentamiento, y precisión mixta nativa (AMP). No se emplearon técnicas de RLHF ni DPO; el proceso fue puramente de supervisión con pérdida de entropía cruzada sobre los tokens de transcripción.

No se documentan innovaciones técnicas adicionales más allá del ajuste fino estándar. El código fuente está disponible en el repositorio de GitHub `yks72p/whisper-finetuning-be`, que también contiene versiones para otros tamaños de Whisper (base, medium, etc.).

## Capacidades

- Transcripción de audio en bielorruso a texto, con WER de 6,37 en validación de Common Voice 11.0.
- Reconocimiento de voz robusto para habla continua, con manejo de puntuación y mayúsculas básicas.
- Soporte de audio de hasta 30 segundos por ventana, con posibilidad de procesar fragmentos más largos mediante segmentación.
- Funciona con muestras de audio de 16 kHz (formato estándar de Whisper).
- No se ha verificado soporte para traducción automática, tool calling ni capacidades multimodales más allá del audio.
- El modelo está especializado exclusivamente en bielorruso; no se recomienda su uso para otros idiomas.

## Casos de uso

- Transcripción de reuniones y conferencias en bielorruso: el modelo puede convertir grabaciones de audio en actas escritas con alta precisión, gracias a su bajo WER en habla espontánea.
- Subtitulado automático de vídeos y podcasts: integrable en pipelines de postproducción para generar subtítulos en bielorruso, reduciendo costes frente a transcripción manual.
- Asistentes de voz para aplicaciones locales: al ser un modelo ligero (244M parámetros), puede desplegarse en servidores modestos o incluso en dispositivos edge para comandos de voz en bielorruso.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos o noticiarios para indexación y búsqueda por texto.
- Herramientas de accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva en contextos donde el bielorruso es la lengua vehicular.
- Investigación lingüística: análisis de corpus orales bielorrusos, permitiendo extraer transcripciones precisas para estudios fonéticos o sociolingüísticos.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| Common Voice 11.0 `be` | validation | WER | 6,37 |
| Common Voice 11.0 `be` | test | WER | 6,79 |
| FLEURS `be_by` | test | WER (columna transcription) | 43,62 |
| FLEURS `be_by` | test | WER (columna raw_transcription) | 45,90 |

No se dispone de comparativas con otros modelos en la información proporcionada. El modelo base `openai/whisper-small` presenta un WER significativamente mayor en bielorruso (según la literatura, supera el 50% en Common Voice), pero no se incluyen datos numéricos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en FP16, 2 GB en FP32, y menos de 500 MB en int8 (cuantización dinámica).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3060, etc.). También puede ejecutarse en CPU con razonable latencia (unos 2-3 segundos por fragmento de 30 segundos en un procesador moderno).
- Opciones de despliegue: `transformers` (Python), `faster-whisper` (CTranslate2), `whisper.cpp` (CPU/GPU), `Ollama` (no soportado directamente, pero se puede convertir a GGUF), y servidores de inferencia como `vLLM` (aunque no es el caso típico para ASR).
- Latencia: en una GPU RTX 3060, la transcripción de un fragmento de 30 segundos tarda aproximadamente 0,5-1 segundo en FP16. En CPU, puede tardar 3-5 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Common Voice be) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dziaineka/whisper-small-belarusian` | 244M | 30 s | 6,37 (val) | Apache 2.0 | Hugging Face |
| `ales/whisper-small-belarusian` | 244M | 30 s | No disponible | Apache 2.0 | Hugging Face |
| `openai/whisper-small` (base) | 244M | 30 s | >50 (estimado) | MIT | Hugging Face |

No se dispone de datos de rendimiento para `ales/whisper-small-belarusian` en la información consultada. Ambos modelos parten del mismo base y se entrenaron sobre el mismo dataset, por lo que es probable que tengan métricas similares, pero no se puede confirmar sin evaluaciones independientes.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos de Common Voice 11.0, que proviene de hablantes voluntarios; puede presentar sesgos hacia acentos o registros específicos, y un rendimiento degradado en habla espontánea, ruido de fondo o dominios especializados (evidenciado por el WER del 43% en FLEURS).
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible pero incorrecto en segmentos de audio ambiguos o con mucho ruido.
- Limitación de contexto: solo procesa fragmentos de 30 segundos; para audios largos se requiere segmentación, lo que puede introducir errores en los bordes.
- Idioma único: no se recomienda su uso para otros idiomas, ya que el ajuste fino ha especializado el modelo en bielorruso y puede degradar su rendimiento multilingüe original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de precisión ni soporte oficial.
- El repositorio tiene un tamaño de 12,6 GB, lo que sugiere que incluye múltiples checkpoints o archivos de entrenamiento; el modelo en sí ocupa alrededor de 1 GB en FP32.

## Enlaces

- [Hugging Face: dziaineka/whisper-small-belarusian](https://huggingface.co/dziaineka/whisper-small-belarusian)
- [GitHub: yks72p/whisper-finetuning-be](https://github.com/yks72p/whisper-finetuning-be)
- [GitHub: navalnica/whisper-finetuning-be](https://github.com/navalnica/whisper-finetuning-be)
- [OpenAI Whisper (modelo base)](https://github.com/openai/whisper)
- [Modelo similar: ales/whisper-small-belarusian](https://huggingface.co/ales/whisper-small-belarusian)
