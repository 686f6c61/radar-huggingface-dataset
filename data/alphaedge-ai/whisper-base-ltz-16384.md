# alphaedge-ai/whisper-base-ltz-16384

## Resumen

`whisper-base-ltz-16384` es una variante podada del modelo de reconocimiento automático del habla `openai/whisper-base` de OpenAI, publicada por el usuario `alphaedge-ai`. El modelo aplica la técnica de *trimming* (reducción del vocabulario del tokenizador) para especializarlo en luxemburgués (`lb`), eliminando los tokens del vocabulario que no se utilizan en ese idioma. El resultado es un modelo un 25,02% más pequeño en número de parámetros (de 72.593.920 a 54.427.648) y con un vocabulario reducido un 68,41% (de 51.865 a 16.384 tokens).

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado con supervisión débil a gran escala para transcripción y traducción de voz, tal como se describe en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). El modelo mantiene la estructura original de `whisper-base` (unas 6 capas de encoder y 6 de decoder, dimensión oculta 512) pero con una matriz de embeddings y una cabeza de salida mucho más pequeñas, lo que reduce el peso en disco a aproximadamente 0,1 GB.

Su relevancia es práctica: demuestra cómo especializar un modelo ASR multilingüe para un idioma de bajos recursos como el luxemburgués, obteniendo un artefacto más ligero y con menor huella de memoria, adecuado para despliegues en entornos con recursos limitados. La contrapartida es que el modelo pierde capacidad para otros idiomas, ya que los tokens eliminados del vocabulario ya no pueden generarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 54.427.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, herencia de Whisper) |
| Tipos de cuantización | no disponible en la model card; pesos en safetensors (fp32/fp16 según el repo base) |
| Idiomas soportados | luxemburgués (`lb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un podado del checkpoint `openai/whisper-base`, que a su vez es un transformer encoder-decoder con atención completa, entrenado por OpenAI con supervisión débil sobre 680.000 horas de audio etiquetado de forma imperfecta. `whisper-base` tiene 6 capas de encoder y 6 de decoder, dimensión de modelo 512, 8 cabezas de atención y procesa audio a 16 kHz en ventanas de 30 segundos. El proceso de *trimming* consiste en identificar los tokens del vocabulario que aparecen en un corpus del idioma objetivo y eliminar el resto, recortando las matrices de embedding de entrada y de salida en consecuencia.

Según la model card, el vocabulario se determinó minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para el luxemburgués. No se especifica si hubo reentrenamiento adicional, fine-tuning supervisado o ajuste con RLHF/DPO tras el podado; la model card indica que el modelo podado «debería comportarse de forma similar al original» para el idioma objetivo, lo que sugiere que no se realizó un reentrenamiento a gran escala y que el rendimiento se apoya en la transferencia desde el modelo base. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente de minado.

## Capacidades

- Reconocimiento automático del habla (ASR) en luxemburgués, con transcripción de audio a texto.
- Traducción de voz a texto (la tarea `translate` de Whisper está disponible en la API, aunque el vocabulario podado puede limitar la salida a otros idiomas).
- Procesamiento de audio a 16 kHz en ventanas de hasta 30 segundos por segmento.
- Integración con la librería `transformers` mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, agentes, visión ni audio más allá del ASR estándar de Whisper.
- Capacidad multilingüe limitada al luxemburgués; el resto de idiomas del Whisper original no están garantizados.

## Casos de uso

- Transcripción de reuniones y actas en luxemburgués: el modelo puede procesar audio de hasta 30 segundos por segmento y encadenar segmentos para reuniones completas, con una huella de memoria reducida que permite ejecutarlo en servidores modestos.
- Subtitulado automático de vídeo en luxemburgués: integrado en un pipeline que extrae audio, lo remuestrea a 16 kHz y genera subtítulos con marcas de tiempo, aprovechando la reducción de tamaño para despliegues en el borde.
- Atención al cliente en luxemburgués: transcripción de llamadas para generar resúmenes o alimentar sistemas de análisis de sentimiento, con un coste de inferencia menor que el modelo base.
- Archivado y búsqueda de contenido audiovisual: indexación de grabaciones en luxemburgués para búsqueda por texto, donde el menor tamaño del modelo facilita el despliegue en clústeres con GPUs de gama media.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo real en dispositivos con recursos limitados, gracias a los 54,4 M de parámetros y al peso de ~0,1 GB.
- Investigación en ASR de bajos recursos: base para experimentos de fine-tuning o comparación de técnicas de podado en idiomas minoritarios, con licencia Apache 2.0 que permite uso comercial y modificación.
- Preprocesamiento de datos para pipelines de NLP en luxemburgués: transcripción de corpus de audio para alimentar modelos de lenguaje o sistemas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (54,4 M de parámetros ≈ 218 MB de pesos) y aproximadamente 110 MB en fp16; el consumo real depende del framework y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problema, aunque el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline oficial), y al ser un modelo Whisper es compatible con `whisper.cpp`, `faster-whisper` (previa conversión) y `Ollama` si se empaqueta adecuadamente; también es compatible con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo base pequeño, se espera una latencia baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-base-ltz-16384` | 54,4 M | 30 s de audio | Luxemburgués | Apache 2.0 | Hugging Face |
| `openai/whisper-base` | 72,6 M | 30 s de audio | Multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |
| `openai/whisper-small` | 244 M | 30 s de audio | Multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |
| `openai/whisper-tiny` | 39 M | 30 s de audio | Multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |

El modelo podado es un 25% más pequeño que `whisper-base` pero conserva la arquitectura y el rendimiento esperado para luxemburgués; frente a `whisper-tiny` es algo mayor en parámetros pero especializado, y frente a `whisper-small` es mucho más ligero a costa de menor capacidad general. No se dispone de datos de benchmarks para comparar el rendimiento real en luxemburgués con estas alternativas.

## Limitaciones y advertencias

- El vocabulario reducido elimina tokens no utilizados en luxemburgués; el modelo puede fallar o producir salidas incorrectas en otros idiomas, incluidos los que el Whisper original soporta.
- No se han publicado métricas de calidad (WER, CER) en la información disponible, por lo que el rendimiento real en luxemburgués no está verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- Sesgos heredados del entrenamiento original de Whisper: posible peor rendimiento en determinados acentos, géneros o registros del luxemburgués.
- Limitación de contexto de audio: ventanas de 30 segundos; para audio más largo es necesario segmentar y encadenar, lo que puede introducir errores en las fronteras.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de minado (`lbourdois/fineweb-2-trimming`) y las condiciones del modelo base.
- El modelo tiene pocas descargas (54) y ningún «like», lo que sugiere escasa validación por parte de la comunidad; conviene evaluarlo en el dominio concreto antes de usarlo en producción.
- No se documenta el proceso exacto de podado ni si hubo reentrenamiento, lo que dificulta reproducir el resultado o estimar su degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-ltz-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
