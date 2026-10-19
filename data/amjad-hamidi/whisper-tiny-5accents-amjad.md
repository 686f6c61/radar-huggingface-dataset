# Amjad-Hamidi/whisper-tiny-5accents-Amjad

## Resumen

Amjad-Hamidi/whisper-tiny-5accents-Amjad es un checkpoint de reconocimiento automático del habla (ASR) publicado en Hugging Face, construido sobre openai/whisper-tiny y etiquetado con el pipeline automatic-speech-recognition. El nombre sugiere un ajuste fino para cinco acentos, pero la model card es una plantilla automática sin datos de entrenamiento, evaluación, idiomas ni licencia. El repositorio contiene 37.760.640 parámetros en safetensors y ocupa 0,3 GB, lo que lo sitúa en la gama ultraligera de Whisper, con ventana de audio de 30 s según la arquitectura del modelo base.

Su relevancia potencial está en desplegar transcripción de voz en CPU, dispositivos edge o GPUs de consumo con un coste computacional muy bajo. Sin embargo, al no haber benchmarks ni documentación, no se puede afirmar que mejore la robustez acentual frente al modelo base ni que sea apto para producción. Es un artefacto útil para experimentación y para evaluar la hipótesis de los cinco acentos, no una versión validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de Whisper para ASR |
| Parámetros totales | 37.760.640 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura Whisper usa ventanas de audio de 30 s |
| Tipos de cuantización | No disponible; solo se declaran pesos safetensors |
| Idiomas soportados | No disponible; no se puede asumir multilingüismo |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder con entrada de espectrograma log-Mel y dos capas convolucionales. El modelo base whisper-tiny tiene 37,8 M de parámetros y se entrenó con 680.000 horas de audio débilmente supervisado, según el paper de Radford et al. (2022) referenciado en las etiquetas del repositorio. Este checkpoint parece un ajuste fino de openai/whisper-tiny, probablemente sobre cinco acentos según el identificador, pero la model card no documenta el conjunto de datos, el número de horas, los hiperparámetros ni si se congelaron capas.

No hay información sobre RLHF, DPO ni técnicas de alineación; en ASR no es el mecanismo habitual. Tampoco se especifica si el ajuste se hizo con audio multilingüe, inglés o español, ni si se aplicaron aumentos de datos para robustez acentual. La única evidencia de la especialización es el nombre del repositorio.

## Capacidades

- Transcripción de voz a texto mediante el pipeline automatic-speech-recognition; el modelo base Whisper acepta audio mono a 16 kHz y ventanas de 30 s.
- Posible especialización en cinco acentos: el identificador lo sugiere, pero no se especifica qué acentos ni en qué idioma.
- El modelo base Whisper permite detección de idioma y traducción al inglés; este checkpoint no declara esas capacidades y el pipeline es solo ASR.
- Salida de texto con puntuación y mayúsculas: habitual en Whisper, no verificado en este checkpoint.
- No hay soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni modo thinking.
- Multilingüismo no confirmado; no se debe asumir que transcribe correctamente idiomas distintos de los usados en el ajuste.
- No es un modelo de lenguaje generativo: no mantiene conversaciones ni genera texto libre.

## Casos de uso

- Transcripción de notas de voz y reuniones en español con acentos diversos: se puede ejecutar con transformers en CPU y segmentar el audio en ventanas de 30 s; es adecuado por su tamaño de 37,8 M de parámetros, aunque la especialización acentual no está validada.
- Subtitulado de vídeos cortos en local: el modelo puede generar texto por segmentos y unirlos con marcas de tiempo; su bajo coste permite procesar lotes en un portátil sin GPU.
- Accesibilidad y dictado por voz: integrado en una aplicación de escritorio, transcribe comandos o texto dictado en tiempo casi real; la ventana de 30 s obliga a cortar el audio con detección de actividad de voz.
- Preprocesamiento de audio para pipelines de NLP: convertir llamadas o entrevistas a texto antes de aplicar análisis de sentimiento, resumen o búsqueda; requiere revisar errores en nombres propios y cifras.
- Investigación sobre sesgo acentual: comparar la tasa de error de palabras por acento con un conjunto etiquetado y frente a openai/whisper-tiny; el checkpoint es útil como hipótesis, no como resultado.
- Atención al cliente en centros de llamadas: transcribir conversaciones para auditoría y análisis de calidad; antes hay que aclarar la licencia y validar el rendimiento en los acentos objetivo.
- Despliegue en dispositivos edge: convertir los pesos a ONNX o whisper.cpp para ejecutarlos en una CPU ARM o NPU; Qualcomm AI Hub ya ofrece whisper-tiny optimizado, aunque no este checkpoint.
- Generación de pseudo-etiquetas para datasets de voz: transcribir audios no etiquetados y filtrar por confianza; conviene aplicar detección de alucinaciones y revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| WER en los cinco acentos | No disponible | La model card no incluye evaluación. |
| Comparación con openai/whisper-tiny | No disponible | No hay datos publicados. |
| MMLU, HumanEval, GSM8K | No aplica | Es un modelo ASR, no un LLM generativo. |

## Requisitos de hardware

- VRAM estimada: aproximadamente 151 MB en FP32, 76 MB en FP16 y 38 MB en INT8 solo para los pesos; con overhead de runtime, menos de 1 GB.
- GPU recomendadas: no requiere GPU dedicada; una GTX 1650, RTX 3060 o RTX 4090 es más que suficiente. A100 o H100 son innecesarias.
- Cabe en cualquier GPU de consumo y en CPU; para Raspberry Pi u otros dispositivos edge haría falta convertir el checkpoint a ONNX o whisper.cpp, algo no confirmado en el repositorio.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints —el repositorio tiene la etiqueta endpoints_compatible—, ONNX Runtime o whisper.cpp tras conversión. vLLM y TGI no son las vías habituales para Whisper y no están confirmadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint | 37.760.640 | 30 s de audio | No disponible | No disponible | No disponible |
| openai/whisper-tiny | 37,8 M | 30 s de audio | Multilingüe | MIT | No disponible en la información proporcionada |
| openai/whisper-base | 74 M | 30 s de audio | Multilingüe | MIT | No disponible en la información proporcionada |
| hamna11/whisper-tiny-en-asian-accent | 37,76 M | 30 s de audio | Inglés, por el nombre | No disponible | WER 16,4164 en su conjunto de evaluación |

## Limitaciones y advertencias

- La model card es una plantilla automática: no hay información sobre desarrollador, datos, licencia, idiomas ni evaluación.
- La licencia no está declarada; no se puede asumir uso comercial sin aclararlo con el autor.
- El nombre sugiere cinco acentos, pero no se especifica cuáles ni en qué idioma; no hay evidencia de que la especialización funcione.
- No hay benchmarks ni comparación con openai/whisper-tiny; no se puede afirmar mejora de precisión.
- Modelo tiny: mayor tasa de error que whisper-small, whisper-medium o whisper-large en audio ruidoso, con solapamiento de hablantes o con acentos no vistos.
- Riesgo de alucinación de Whisper: puede inventar frases en silencios, ruido o música.
- Ventana de 30 s: necesita segmentación; los cortes pueden perder contexto y generar errores en los límites.
- Idiomas no declarados: no asumir multilingüismo ni traducción.
- Sesgos posibles por acento, género, edad y calidad del micrófono; no están documentados.
- 0 descargas y 0 likes: no hay validación comunitaria.
- No apto para transcripción legal, médica o financiera sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amjad-Hamidi/whisper-tiny-5accents-Amjad
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper: https://arxiv.org/abs/1910.09700
- Paquete openai-whisper: https://pypi.org/project/openai-whisper/
- Qualcomm AI Hub, whisper-tiny para edge: https://aihub.qualcomm.com/mobile/models/whisper_tiny
- Modelo comparable con acento asiático: https://huggingface.co/hamna11/whisper-tiny-en-asian-accent
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
