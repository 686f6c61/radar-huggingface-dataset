# iky1e/granite-speech-5.0-470m-turboctc-mlx-q6

## Resumen

El modelo `iky1e/granite-speech-5.0-470m-turboctc-mlx-q6` es una conversión a MLX (Apple Silicon) del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, cuantizado a 6 bits con grupo de 64. El modelo original es un encoder Conformer compacto de aproximadamente 470 millones de parámetros, entrenado con Connectionist Temporal Classification (CTC) sobre unidades BPE, diseñado para transcripción de inglés de alta velocidad en dispositivos de borde. Esta conversión, realizada por iky1e, adapta los pesos a la librería MLX Swift, transpone los kernels de convolución 1D de PyTorch a MLX, elimina contadores de batch de entrenamiento y aplica cuantización afín solo a los pesos, manteniendo las activaciones en coma flotante.

La relevancia de este modelo radica en su capacidad para ejecutar transcripción de audio en tiempo real en hardware Apple Silicon con un consumo de memoria muy reducido: el archivo de pesos Q6 ocupa 367,51 MiB, un 40,73% del tamaño original, con un acuerdo de transcripción del 99,6989% respecto al checkpoint original de IBM. Es una opción práctica para desarrolladores que necesitan ASR local, rápido y sin dependencia de servicios en la nube, especialmente en aplicaciones de subtitulado, transcripción de reuniones o asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder con CTC, self-conditioning y temporal downsampling |
| Parametros totales | 104.096.192 (según safetensors del repo convertido); el modelo original se describe como ~470M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 20,48 segundos de contexto, con chunks de 122,88 segundos (configuración por defecto de Granite-MLX) |
| Tipos de cuantizacion | Q6 (6 bits, grupo 64) en este repo; también disponibles Q4, Q5, Q8 y FP16 en repos hermanos |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un encoder-only de la familia Granite Speech de IBM. Su arquitectura consiste en un encoder acústico Conformer con atención de bloque (block self-attention), self-conditioning y downsampling temporal, con una capa de salida de 16.384 unidades BPE. La transcripción se realiza mediante una única pasada forward seguida de decodificación CTC greedy, sin decoder autoregresivo, lo que explica su alta velocidad de inferencia. El entrenamiento del modelo original utilizó CTC sobre objetivos BPE, aunque no se dispone de detalles específicos sobre el dataset de entrenamiento en la información proporcionada.

La conversión a MLX realizada por iky1e incluye la transposición de los kernels de Conv1d depthwise de PyTorch al layout de MLX, la eliminación de contadores de batch de entrenamiento, la conversión de tensores de punto flotante retenidos a FP16 y la aplicación de cuantización afín solo a los pesos (weight-only), con grupo de 64. Las activaciones permanecen en coma flotante en tiempo de ejecución. El proceso de conversión está documentado y es reproducible mediante el script `Scripts/convert_granite.py` incluido en el proyecto Granite-MLX.

## Capacidades

- Transcripción de voz a texto en inglés con alta precisión y velocidad (el artículo de IBM reporta 12.600x tiempo real, transcribiendo 3,5 horas de audio por segundo).
- Decodificación CTC greedy, sin necesidad de decodificador autoregresivo.
- Soporte para exportar transcripciones en múltiples formatos: TXT, SRT, WebVTT, JSON, o todos a la vez, mediante la herramienta Granite-MLX.
- Acepta archivos de audio y vídeo comunes como entrada.
- Ejecución nativa en Apple Silicon con el runtime Swift de Granite-MLX, aprovechando la memoria unificada.
- No incluye capacidades de tool calling, agentes, visión ni traducción; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado automático de vídeos: el modelo puede generar subtítulos en formato SRT o WebVTT a partir de archivos de vídeo, gracias a su soporte para entrada de vídeo y exportación directa. Su velocidad permite procesar largas grabaciones en una fracción del tiempo real.
- Transcripción de reuniones y conferencias: con una ventana de contexto de 20,48 segundos y chunks de 122,88 segundos, puede manejar conversaciones largas de forma incremental, ideal para generar actas o resúmenes de reuniones en inglés.
- Asistentes de voz en dispositivos de borde: al ser un modelo compacto (367 MB en Q6) y ejecutarse localmente en Mac, puede integrarse en aplicaciones de escritorio o móviles que requieran dictado por voz sin conexión a internet.
- Análisis de contenido audiovisual: periodistas o investigadores pueden transcribir entrevistas, podcasts o material de archivo en inglés para su posterior análisis de texto, con la ventaja de que el procesamiento es local y privado.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva, aprovechando la baja latencia del modelo (una sola pasada forward).
- Automatización de flujos de trabajo: integración en pipelines de procesamiento de audio mediante la CLI de Granite-MLX, que permite exportar JSON con las transcripciones para su posterior procesamiento por otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como WER en LibriSpeech o Common Voice) en la información disponible. Sin embargo, la model card del repo convertido incluye una tabla de acuerdo de transcripción entre las distintas cuantizaciones y el checkpoint original de IBM, calculado como `100 − ediciones de Levenshtein / palabras de origen`. Es importante señalar que este valor no es WER y no mide la corrección frente a una transcripción humana; solo compara la fidelidad entre versiones del mismo modelo.

| Variante | Tamaño del archivo | Acuerdo con la fuente |
|---|---:|---:|
| IBM source | 902,35 MiB | 100,0000% |
| FP16 | 902,22 MiB | 99,9706% |
| Q8 | 466,03 MiB | 99,8825% |
| Q6 (este repo) | 367,51 MiB | 99,6989% |
| Q5 | 311,22 MiB | 99,4712% |
| Q4 | 254,93 MiB | 98,4135% |

La prueba se realizó sobre una grabación de 6.118,72 segundos (101 minutos y 58,72 segundos) de una conferencia de Stanford CME295, con un solo hablante, utilizando la configuración por defecto de Granite-MLX: chunks de 122,88 segundos, contexto de 20,48 segundos, activaciones FP16, decodificación CTC greedy y caché MLX de 64 MiB. El transcript de referencia contenía 13.615 palabras.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon (M1 o posterior) para ejecución nativa con MLX.
- Memoria unificada estimada: el archivo de pesos Q6 ocupa 367,51 MiB; con overhead de runtime y activaciones, se recomienda al menos 2 GB de memoria libre. Funciona en Macs con 8 GB de RAM o más.
- No requiere GPU dedicada; utiliza la GPU integrada del chip Apple Silicon a través de MLX.
- Opciones de despliegue: la herramienta Granite-MLX (Swift) es la vía principal; también existe una implementación en Python en el proyecto `mlx-audio` (Blaizzy) que soporta este modelo.
- Latencia y throughput: no se han publicado mediciones exactas de latencia, pero el modelo original reporta una velocidad de 12.600x tiempo real, lo que sugiere que en Apple Silicon la transcripción de un minuto de audio se completa en milisegundos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos ASR en la información proporcionada. Como referencia cualitativa, el modelo compite en tamaño con alternativas como Whisper tiny (39M parámetros) o Whisper base (74M), pero con una arquitectura encoder-only que ofrece mayor velocidad. Otros modelos comparables serían wav2vec2-base (95M) o HuBERT-base (95M), aunque estos requieren un cabezal de clasificación adicional y no están optimizados para Apple Silicon. No hay datos de WER públicos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para transcripción multilingüe.
- Es exclusivamente ASR; no realiza traducción automática (a diferencia de otros miembros de la familia Granite Speech).
- La cuantización Q6 introduce una ligera degradación en la fidelidad de transcripción (acuerdo del 99,6989% frente al original), que puede ser relevante en audio con mucho ruido o acentos poco comunes.
- No se han publicado evaluaciones de sesgo o robustez frente a diferentes acentos, dialectos o condiciones acústicas.
- El modelo puede alucinar contenido en segmentos de audio ambiguos o de baja calidad, como cualquier sistema ASR.
- La licencia Apache 2.0 permite uso comercial, pero los pesos convertidos heredan la licencia del modelo original; el software Granite-MLX tiene su propia licencia independiente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y poco probada por la comunidad; se recomienda validar su comportamiento en el caso de uso específico antes de desplegarlo en producción.

## Enlaces

- Repositorio del modelo convertido: https://huggingface.co/iky1e/granite-speech-5.0-470m-turboctc-mlx-q6
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Documentación de IBM Granite Speech: https://www.ibm.com/granite/docs/models/speech
- Implementación MLX en Python (mlx-audio): https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/stt/models/granite_speech/README.md
- Documentación de Transformers para Granite Speech 5: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/granite_speech5.md
- Artículo sobre el rendimiento del modelo: https://andresseo.expert/ai/ibms-open-470m-speech-model-transcribes-3-5-hours-in-a-second/
