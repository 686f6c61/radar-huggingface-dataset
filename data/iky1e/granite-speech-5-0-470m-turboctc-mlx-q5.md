# iky1e/granite-speech-5.0-470m-turboctc-mlx-q5

## Resumen

El modelo `iky1e/granite-speech-5.0-470m-turboctc-mlx-q5` es una conversión a formato MLX con cuantización de 5 bits (grupo 64) del modelo de reconocimiento automático de voz (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc`, desarrollado por IBM. Este modelo base es un codificador conformer de aproximadamente 470 millones de parámetros, entrenado con Connectionist Temporal Classification (CTC) sobre unidades BPE, diseñado para transcripción de voz en inglés con muy alta velocidad de inferencia, apto para dispositivos de borde como portátiles y smartphones.

La conversión MLX, realizada por el usuario `iky1e`, adapta los pesos a la librería MLX de Apple para ejecución nativa en chips Apple Silicon mediante el runtime Swift Granite-MLX. La cuantización Q5 reduce el tamaño del archivo a 311,22 MiB (un 34,49 % del original) manteniendo una concordancia del 99,47 % con el checkpoint original en una prueba de transcripción de una conferencia de 101 minutos. Esta versión es especialmente relevante para desarrolladores que buscan desplegar ASR eficiente en hardware Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (encoder-only) con CTC, block self-attention, self-conditioning y temporal downsampling |
| Parametros totales | 470M (modelo base); 89.340.288 en esta conversión MLX (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (en la prueba de referencia se usó una ventana de 20,48 segundos de audio) |
| Tipos de cuantizacion | Q5 (5 bits, grupo 64) en este repositorio; también disponibles Q4, Q6, Q8 y FP16 en repositorios hermanos |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `granite-speech-5.0-470m-turboctc` es un codificador conformer de 470 millones de parámetros, exclusivamente encoder, sin decodificador autoregresivo. La transcripción se realiza en una sola pasada hacia adelante seguida de decodificación CTC greedy, lo que lo hace extremadamente rápido. La capa de salida produce 16.384 unidades BPE. El entrenamiento se realizó con CTC sobre datos de voz en inglés; no se han publicado detalles específicos sobre el volumen o composición del dataset de entrenamiento en la información disponible.

La conversión MLX de este repositorio transpone los kernels de convolución `Conv1d` de PyTorch al layout de MLX, elimina contadores de batch exclusivos de entrenamiento, convierte tensores de punto flotante restantes a FP16 y aplica cuantización afín solo a los pesos, manteniendo las activaciones en punto flotante en tiempo de inferencia. El resultado es un modelo que se ejecuta de forma nativa en Apple Silicon mediante el runtime Swift Granite-MLX.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, con transcripción de audio a texto.
- Alta velocidad de inferencia: según una fuente externa, el modelo base alcanza 12.600x tiempo real, transcribiendo 3,5 horas de audio por segundo en hardware adecuado.
- Adecuado para despliegue en dispositivos de borde (portátiles, smartphones) por su tamaño compacto y baja latencia.
- Soporte de exportación a múltiples formatos de subtítulos (TXT, SRT, WebVTT, JSON) a través del runtime Granite-MLX.
- No incluye capacidades de tool calling, agentes, visión ni otros idiomas; es exclusivamente un modelo de transcripción de voz en inglés.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede procesar grabaciones de larga duración (más de 100 minutos) con memoria acotada, dividiendo el audio en fragmentos de 122,88 segundos con contexto de 20,48 segundos, como se validó en la prueba de referencia.
- Generación de subtítulos para vídeo: el runtime Granite-MLX permite exportar directamente a SRT o WebVTT, facilitando la subtitulación automática de contenido audiovisual en inglés.
- Asistentes de voz en tiempo real: gracias a su velocidad de 12.600x tiempo real, puede transcribir comandos de voz con latencia mínima en aplicaciones de escritorio o móviles.
- Archivado y búsqueda de audio: convertir archivos de voz a texto para indexación y búsqueda posterior en sistemas de gestión documental.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos educativos o laborales.
- Procesamiento por lotes en entornos Apple: al ser una conversión MLX, se integra nativamente en flujos de trabajo en Mac, sin necesidad de contenedores o GPUs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como WER sobre datasets públicos) en la información disponible. La model card del repositorio incluye una comparación de concordancia con el checkpoint original de IBM, medida como acuerdo a nivel de palabra en una grabación de 6.118,72 segundos (una conferencia de Stanford CME295). Los resultados son:

| Variante | Tamaño de archivo | Concordancia con el original |
|---|---:|---:|
| IBM source | 902,35 MiB | 100,0000 % |
| FP16 | 902,22 MiB | 99,9706 % |
| Q8 | 466,03 MiB | 99,8825 % |
| Q6 | 367,51 MiB | 99,6989 % |
| Q5 (este repositorio) | 311,22 MiB | 99,4712 % |
| Q4 | 254,93 MiB | 98,4135 % |

Esta concordancia no es WER y no mide la corrección frente a una transcripción humana; solo indica la similitud con el checkpoint original bajo el mismo runtime. Además, una fuente externa reporta una velocidad de 12.600x tiempo real para el modelo base, lo que equivale a transcribir 3,5 horas de audio por segundo.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1 o posterior), ya que la conversión MLX está diseñada para el runtime Swift Granite-MLX.
- El archivo de pesos Q5 ocupa aproximadamente 311 MiB, por lo que cabe en cualquier Mac con al menos 1 GB de RAM libre; el uso de memoria en tiempo de ejecución depende del tamaño de la caché MLX (64 MiB por defecto en la prueba).
- No requiere GPU dedicada; la inferencia se ejecuta en la CPU/GPU unificada del chip Apple.
- Opciones de despliegue: runtime Granite-MLX (Swift), que acepta archivos de audio y vídeo y exporta TXT, SRT, WebVTT o JSON.
- No se dispone de datos de latencia o throughput específicos para esta cuantización, pero la velocidad del modelo base es de 12.600x tiempo real.

## Comparativa con modelos similares

La comparación más directa es con el modelo base original y otras cuantizaciones del mismo modelo, ya que no se dispone de datos comparativos con otros sistemas ASR (como Whisper o Wav2Vec2) en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ibm-granite/granite-speech-5.0-470m-turboctc | 470M | No disponible | Apache 2.0 | PyTorch | Modelo original de IBM |
| iky1e/granite-speech-5.0-470m-turboctc-mlx-fp16 | 470M (89M en MLX) | No disponible | Apache 2.0 | MLX FP16 | Conversión sin cuantizar |
| iky1e/granite-speech-5.0-470m-turboctc-mlx-q5 (este) | 470M (89M en MLX) | No disponible | Apache 2.0 | MLX Q5 | Cuantización 5 bits, grupo 64 |
| iky1e/granite-speech-5.0-470m-turboctc-mlx-q4 | 470M (89M en MLX) | No disponible | Apache 2.0 | MLX Q4 | Cuantización 4 bits, menor fidelidad |

No se dispone de comparación con otros modelos ASR de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para transcripción multilingüe.
- Al ser un modelo encoder-only con CTC, no genera puntuación ni formato de texto enriquecido; la salida es texto plano sin mayúsculas ni puntuación automática.
- La concordancia con el checkpoint original es del 99,47 % a nivel de palabra en la prueba de referencia, pero esto no garantiza la precisión en otros dominios o acentos; puede haber errores de transcripción y alucinaciones en audio ambiguo.
- La conversión MLX elimina tensores de entrenamiento y aplica cuantización, lo que puede introducir pequeñas diferencias numéricas respecto al modelo original; se recomienda validar en el caso de uso concreto.
- La licencia Apache 2.0 permite uso comercial, pero el runtime Granite-MLX es software separado con su propia licencia; el repositorio de pesos no establece la licencia del software.
- No se han publicado resultados de WER en datasets estándar, por lo que la precisión real en escenarios diversos no está documentada.

## Enlaces

- Repositorio de HuggingFace de esta conversión: https://huggingface.co/iky1e/granite-speech-5.0-470m-turboctc-mlx-q5
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Documentación de Granite Speech en IBM: https://www.ibm.com/granite/docs/models/speech
- Repositorio GitHub de modelos Granite Speech: https://github.com/ibm-granite/granite-speech-models/tree/main/
- Documentación de transformers para Granite Speech 5: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/granite_speech5.md
- Artículo externo sobre velocidad del modelo: https://andresseo.expert/ai/ibms-open-470m-speech-model-transcribes-3-5-hours-in-a-second/
