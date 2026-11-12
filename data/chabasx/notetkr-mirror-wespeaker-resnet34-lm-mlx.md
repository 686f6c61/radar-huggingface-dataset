# chabasx/NoteTkr-mirror-WeSpeaker-ResNet34-LM-MLX

## Resumen

NoteTkr-mirror-WeSpeaker-ResNet34-LM-MLX es una conversión a formato MLX del modelo de embeddings de hablante WeSpeaker ResNet34-LM, originalmente publicado por pyannote. No es un modelo generativo ni un LLM: es un extractor de características acústicas que transforma segmentos de audio en vectores de 256 dimensiones normalizados en L2, diseñados para tareas de verificación e identificación de hablante y para alimentar pipelines de diarización. El repositorio lo mantiene el usuario chabasx como espejo para el proyecto speech-swift, orientado a ejecutar procesamiento de voz en Apple Silicon.

El modelo resuelve el problema de representar la identidad vocal de forma compacta y comparable: dos fragmentos del mismo hablante producen embeddings con alta similitud coseno, mientras que fragmentos de hablantes distintos quedan separados. Con solo 6,63 millones de parámetros, es lo bastante pequeño para ejecutarse en CPU o GPU integrada de un Mac moderno, lo que lo hace útil en aplicaciones locales de transcripción con etiquetado de interlocutores.

La relevancia actual reside en la combinación de tres factores: la licencia MIT del modelo original, la eliminación de la dependencia de pyannote.audio gracias a un unpickler propio y la conversión a MLX con fusión de BatchNorm en Conv2d, lo que simplifica el despliegue en el ecosistema Swift/MLX sin capas de normalización separadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 (CNN) con statistics pooling y capa lineal de embedding |
| Parametros totales | 6.630.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; entrada en frames de espectrograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (independiente del idioma; depende de las características acústicas) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La red es una ResNet34 adaptada a entrada de audio. La entrada es un espectrograma log-mel de 80 filtros fbank a 16 kHz con forma [B, T, 80, 1]. La primera capa es una convolución 2D de 1 a 32 canales con kernel 3 y padding 1, seguida de ReLU. A continuación se aplican cuatro etapas de BasicBlocks: 3 bloques de 32 a 32 canales, 4 bloques de 32 a 64 con stride 2, 6 bloques de 64 a 128 con stride 2 y 3 bloques de 128 a 256 con stride 2. Tras la última etapa, un statistics pooling calcula media y desviación típica sobre el eje temporal, produciendo un vector de 5120 dimensiones (256 canales × 2 estadísticos). Una capa lineal de 5120 a 256 genera el embedding final, que se normaliza en L2.

El modelo original fue entrenado sobre VoxCeleb para verificación de hablante y diarización. La conversión a MLX aplica tres transformaciones: fusión de BatchNorm en las convoluciones mediante w_fused = w × γ/√(σ²+ε) y b_fused = β − μ×γ/√(σ²+ε); transposición de los pesos convolucionales de [O, I, H, W] a [O, H, W, I] para el formato channels-last de MLX; y renombrado de claves, eliminando el prefijo resnet., sustituyendo seg_1 por embedding y descartando num_batches_tracked. El checkpoint se carga con un unpickler propio que no requiere pyannote.audio. No se documenta en la información disponible si hubo entrenamiento adicional, fine-tuning o ajuste con RLHF/DPO tras la conversión.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones normalizados en L2 a partir de audio a 16 kHz.
- Verificación de hablante mediante similitud coseno entre embeddings.
- Diarización de hablantes: el pipeline de speech-swift segmenta el audio y asigna un identificador de hablante a cada segmento con marcas de inicio y fin.
- Procesamiento de audio en bruto con muestreo a 16 kHz; no requiere transcripción previa.
- Independencia del contenido lingüístico: la representación se basa en características vocales, no en el texto pronunciado.
- Integración en Swift mediante la librería SpeechVAD del proyecto speech-swift.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio generativo: es exclusivamente un extractor de características.

## Casos de uso

- Diarización de reuniones y entrevistas: el pipeline de speech-swift combina la segmentación de voz con los embeddings del modelo para etiquetar quién habla en cada intervalo, imprimiendo segmentos con speakerId, startTime y endTime. Es adecuado porque el modelo está entrenado específicamente para separar identidades vocales en audio conversacional.
- Transcripción con etiquetado de interlocutor: se ejecuta un ASR local y se alinean sus segmentos con los embeddings para atribuir cada frase a un hablante, útil en actas de reuniones y notas de voz.
- Verificación biométrica de voz en local: se compara el embedding de una muestra con el de un usuario registrado mediante similitud coseno y un umbral, sin enviar audio a la nube. El tamaño reducido del modelo permite ejecutarlo en un Mac sin GPU dedicada.
- Indexación y búsqueda por hablante en archivos de audio: se generan embeddings por segmento y se almacenan en un índice vectorial para recuperar todas las intervenciones de una persona en un archivo largo o en un archivo de podcasts.
- Control de acceso y autenticación por voz en aplicaciones de escritorio: el modelo actúa como segundo factor o como verificación continua durante una sesión, con latencia baja gracias a sus 6,6 millones de parámetros.
- Preprocesado para pipelines de subtitulado: se separan las pistas por hablante antes de la traducción o el resumen, de modo que cada subtítulo lleve la etiqueta correcta.
- Investigación en biometría vocal: sirve como extractor de referencia ligero para comparar técnicas de agrupamiento (clustering) o de puntuación de similitud sin depender de frameworks pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para los 6,63 millones de parámetros, más el espacio de activaciones, que depende de la duración del audio y del tamaño de lote. Cabe holgadamente en cualquier GPU integrada.
- GPU recomendadas: no requiere GPU dedicada; está pensado para Apple Silicon mediante MLX. En hardware NVIDIA puede ejecutarse en cualquier modelo, incluida una GTX 1650 o superior, aunque el repositorio no documenta esa ruta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la GPU integrada de los chips Apple M1 en adelante.
- Opciones de despliegue: MLX con la librería SpeechVAD del proyecto speech-swift (Swift). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto de entrada | Licencia | Formato |
|---|---|---|---|---|---|
| NoteTkr-mirror-WeSpeaker-ResNet34-LM-MLX | 6,63 M | 256 | espectrograma log-mel de 80 bandas a 16 kHz | MIT | safetensors (MLX) |
| pyannote/wespeaker-voxceleb-resnet34-LM | no disponible en la informacion | 256 | espectrograma log-mel de 80 bandas a 16 kHz | MIT | checkpoint PyTorch |
| ECAPA-TDNN (variantes de SpeechBrain) | no disponible en la informacion | 192 o 256 segun variante | espectrograma mel | Apache 2.0 en variantes habituales | PyTorch |
| X-vector (variantes de WeSpeaker) | no disponible en la informacion | 256 | espectrograma mel | MIT en el repositorio WeSpeaker | PyTorch |

La comparación se limita al modelo original de pyannote, del que este repositorio es una conversión directa con pesos equivalentes tras la fusión de BatchNorm. Para ECAPA-TDNN y x-vector no se dispone de cifras de parámetros ni de rendimiento en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo no genera texto ni responde a instrucciones: es un extractor de embeddings y cualquier uso generativo es un error de categoría.
- La calidad de los embeddings depende de la duración y la limpieza del segmento de audio; fragmentos muy cortos o con ruido de fondo degradan la verificación.
- Sesgos conocidos: al estar entrenado sobre VoxCeleb, puede rendir peor con acentos, edades, géneros y condiciones de grabación poco representadas en ese corpus. No se documentan análisis de sesgo en la información disponible.
- Riesgo de falsos positivos en verificación: dos voces similares (familiares, dobladores) pueden superar el umbral de similitud coseno; se recomienda calibrar el umbral con datos propios.
- No se documentan requisitos de idioma, pero la representación es acústica, por lo que el rendimiento puede variar entre lenguas con patrones fonéticos distintos.
- La licencia MIT del modelo original permite uso comercial, pero el repositorio es un espejo no oficial mantenido por un tercero; conviene verificar la procedencia de los pesos antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el espejo no está validado por la comunidad.
- No se documentan pruebas de robustez frente a audio comprimido, reverberación o grabaciones telefónicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chabasx/NoteTkr-mirror-WeSpeaker-ResNet34-LM-MLX
- Modelo base: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM
- Repositorio WeSpeaker: https://github.com/wenet-e2e/wespeaker
- Licencia del modelo original: https://github.com/wenet-e2e/wespeaker/blob/master/LICENSE
- Proyecto speech-swift: https://github.com/soniqo/speech-swift
- Guía de embeddings de hablante: https://soniqo.audio/guides/embed-speaker
- Documentación: https://soniqo.audio
