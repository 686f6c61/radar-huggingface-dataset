# nelmo-ux/mod-sencevoice

## Resumen

`nelmo-ux/mod-sencevoice` es un modelo de reconocimiento automático del habla (ASR) especializado en japonés, derivado de `FunAudioLLM/SenseVoiceSmall` mediante un ajuste fino orientado a la inferencia por fragmentos (chunk streaming). El problema que resuelve es la degradación severa de precisión que sufre SenseVoiceSmall cuando se utiliza en modo streaming, ya que su entrenamiento original emplea atención bidireccional sobre toda la secuencia. Este modelo aplica una técnica de máscara de fragmentos dinámica (estilo SCAMA) durante el ajuste, reduciendo la diferencia de error entre la inferencia por chunks y la de atención completa de un 0.2243 a un 0.0095 de CER.

El modelo está desarrollado por el usuario `nelmo-ux` y su versión actual (v2) se entrenó con 300 horas de un corpus de novelas visuales japonesas, utilizando dos GPUs H100 NVL en precisión bf16. Aunque el modelo base soporta varios idiomas, esta adaptación se centra exclusivamente en japonés y no garantiza el rendimiento en otras lenguas. El repositorio incluye los pesos, la configuración, el código remoto para inferencia por chunks y los resultados de evaluación en formato JSON.

La relevancia de este modelo radica en que permite desplegar ASR japonés en tiempo real con una calidad cercana a la de un sistema no streaming, lo que resulta útil para transcripción en vivo, subtitulación y asistentes de voz. Al estar basado en SenseVoiceSmall, hereda su capacidad de detectar emociones y eventos acústicos, aunque estas funcionalidades no han sido optimizadas en el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de FunAudioLLM/SenseVoiceSmall) |
| Parametros totales | no disponible (modelo base SenseVoiceSmall, ~234M segun documentacion de FunASR) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por chunks, ventana de 60ms por frame) |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16) |
| Idiomas soportados | Japones (principal); el tokenizador incluye chino, japones, canton, ingles y coreano, pero el rendimiento fuera del japones no esta evaluado |
| Licencia | FunASR Model Open Source License Agreement (funasr-model-license) |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo parte de `SenseVoiceSmall`, un sistema ASR basado en transformer con atención bidireccional que procesa la secuencia completa de audio. Para habilitar el streaming, el autor aplica un ajuste fino con máscara de fragmentos dinámica, similar al enfoque SCAMA (Streaming Chunk-Aware Multi-scale Attention). Durante el entrenamiento, se selecciona aleatoriamente un tamaño de chunk entre 8, 12 y 16 frames (cada frame equivale a 60 ms), con strides de 6, 10 y 14 respectivamente, y un look-back de 1 frame. Esto fuerza al modelo a aprender a producir transcripciones precisas cuando solo tiene acceso a una ventana limitada de contexto.

El entrenamiento de la versión v2 utilizó un subconjunto de 300 horas del dataset `OOPPEENN/VisualNovel_Dataset`, compuesto por 196.047 clips de 24 archivos y 22 estudios, muestreados a 16 kHz en mono. La separación entre hablantes de entrenamiento y validación se realizó a nivel de actor de doblaje para evitar fugas de información. Se empleó una pérdida CTC con supervisión de etiquetas verdaderas, 4 épocas, una tasa de aprendizaje de 2e-4 con programación Noam y un warmup de 680 pasos (aproximadamente el 8% del total). El tamaño efectivo de lote fue de 48.000 tokens y el entrenamiento duró unos 45 minutos en dos H100 NVL con bf16. La normalización de puntuación mantiene las convenciones nativas del modelo (signos de ancho completo como ！？…～) y se desactiva el plegado NFKC a ASCII para los signos de puntuación.

## Capacidades

- Reconocimiento automático del habla en japonés con alta precisión, tanto en modo de atención completa como en streaming por chunks.
- Inferencia por fragmentos con latencia reducida, gracias al entrenamiento con máscara de chunks dinámica.
- Detección de emociones y eventos acústicos heredada del modelo base SenseVoiceSmall (aunque no optimizada en este ajuste).
- Soporte para normalización de texto inversa (ITN) mediante el parámetro `use_itn=True`.
- Integración con la librería FunASR mediante `AutoModel`, con código remoto incluido en el repositorio.
- Compatibilidad con el paquete `streaming/` del repositorio `SenseVoice-mod` para despliegue en tiempo real.

## Casos de uso

- Transcripción en vivo de reuniones o conferencias: el modo streaming permite generar subtítulos en tiempo real con un CER de 0.1679, muy cercano al modo no streaming (0.1584), lo que lo hace adecuado para aplicaciones de accesibilidad.
- Subtitulado automático de vídeos japoneses: al procesar audio en chunks, se puede alimentar un pipeline de subtitulado continuo sin esperar al archivo completo, reduciendo la latencia de publicación.
- Asistentes de voz para juegos o novelas visuales: dado que el entrenamiento se realizó con voces de actores de doblaje de novelas visuales, el modelo captura bien las entonaciones y estilos propios de este dominio, ideal para transcripción de diálogos en tiempo real.
- Análisis de llamadas de atención al cliente: la capacidad de streaming permite transcribir conversaciones telefónicas mientras ocurren, facilitando la búsqueda de palabras clave y el análisis de sentimiento.
- Herramientas de dictado para japonés: con una ventana de contexto corta y bajo consumo de recursos, puede ejecutarse en dispositivos con GPU modesta o incluso CPU para dictado por voz en aplicaciones de productividad.
- Investigación en ASR streaming: el repositorio incluye código de entrenamiento y evaluación, lo que permite reproducir los resultados y experimentar con diferentes geometrías de chunk para otros idiomas o dominios.

## Benchmarks y rendimiento

La model card proporciona resultados de CER (Character Error Rate) sobre un conjunto de validación de 5.194 clips en japonés, evaluados en fp32. La comparación se realiza entre el modelo base `SenseVoiceSmall` y este ajuste (v2).

| Modelo | CER chunk inference | CER full attention | Gap |
|---|---|---|---|
| SenseVoiceSmall (pesos publicos) | 0.4024 | 0.1781 | 0.2243 |
| mod-sencevoice v2 | 0.1679 | 0.1584 | 0.0095 |

La mejora relativa en el modo chunk es del 58% y la diferencia entre modos se reduce en un 96%. No se han publicado otros benchmarks (como MMLU o HumanEval) porque se trata de un modelo ASR, no de un LLM.

## Requisitos de hardware

- El tamaño del repositorio es de 1.9 GB, lo que sugiere que los pesos en fp32 ocupan aproximadamente ese espacio. En bf16 ocuparían alrededor de 1 GB.
- Para inferencia en modo no streaming, una GPU con 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o RTX 3050) sería suficiente. En CPU, el modelo puede ejecutarse con unos 2-3 GB de RAM.
- Para streaming con chunks, el consumo de memoria es similar, pero la latencia depende del tamaño de chunk elegido (60 ms por frame).
- Se recomienda el uso de vLLM o TGI si se quiere integrar en un servicio, aunque al ser un modelo ASR, la opción natural es FunASR con su `AutoModel` o el paquete `streaming/` del repositorio `SenseVoice-mod`.
- En una GPU H100, el entrenamiento completo tardó unos 45 minutos, lo que indica que la inferencia es muy rápida; se pueden procesar cientos de horas de audio por hora en hardware moderno.
- No se dispone de datos de latencia o throughput medidos por el autor; se recomienda realizar pruebas propias con el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (japones, chunk) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunAudioLLM/SenseVoiceSmall | ~234M | no aplica | 0.4024 | FunASR Model License | HuggingFace |
| nelmo-ux/mod-sencevoice | ~234M (derivado) | no aplica | 0.1679 | FunASR Model License | HuggingFace |
| OpenAI Whisper small | 244M | no aplica | no disponible (no se evaluo en este corpus) | MIT | HuggingFace |

La comparación directa con Whisper no es posible porque no se han realizado evaluaciones en el mismo corpus. Sin embargo, SenseVoiceSmall ya supera a Whisper en varios benchmarks de ASR multilingüe según la documentación de FunASR, y este ajuste mejora sustancialmente el rendimiento en streaming. Para uso en producción con japonés en tiempo real, este modelo es una opción más precisa que el base.

## Limitaciones y advertencias

- El modelo está especializado únicamente en japonés; el rendimiento en chino, cantonés, inglés o coreano no está evaluado y probablemente sea inferior al del modelo base.
- Las etiquetas de emoción y eventos se heredan del modelo base pero no han sido optimizadas en el ajuste fino, por lo que su fiabilidad puede ser menor.
- El entrenamiento se realizó con voces de actores de doblaje de novelas visuales, lo que puede introducir un sesgo hacia ese estilo de habla (entonación exagerada, jerga de anime, etc.) y reducir la precisión en otros dominios como noticias o conversaciones telefónicas.
- La licencia FunASR Model Open Source License Agreement impone requisitos de atribución y restricciones de uso comercial; es necesario revisar el texto completo antes de desplegar el modelo en producción.
- El modelo no incluye un módulo de detección de actividad de voz (VAD); se asume que el audio de entrada ya está segmentado.
- No se proporcionan garantías sobre la latencia en streaming; el rendimiento real depende del hardware y de la configuración de chunks elegida.
- El repositorio no incluye pesos en formato GGUF o safetensors, solo `model.pt`, lo que limita su uso en entornos que requieran esos formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nelmo-ux/mod-sencevoice
- Modelo base SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Dataset de entrenamiento: https://huggingface.co/datasets/OOPPEENN/56697375616C4E6F76656C5F44617461736574
- Repositorio de código y entrenamiento: https://github.com/nelmo-ux/SenseVoice-mod
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
