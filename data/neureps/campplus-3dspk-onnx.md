# neureps/campplus-3dspk-onnx

## Resumen

`neureps/campplus-3dspk-onnx` es una conversión a ONNX del checkpoint original CAM++ para verificación de hablante, publicado originalmente en ModelScope como `iic/speech_campplus_sv_zh-cn_16k-common` dentro del proyecto 3D-Speaker de Alibaba DAMO. No es un modelo nuevo ni reentrenado: los pesos son idénticos al original (mismo sha256 de checkpoint origen, `3388cf5f...`), y únicamente se ha exportado la red a formato ONNX (opset 14, IR 7) para su uso en runtimes portables sin dependencia de PyTorch.

El modelo resuelve la tarea de *speaker embedding*: toma una secuencia de features Kaldi fbank de 80 dimensiones (16 kHz, `dither=0`, media restada en el tiempo) y produce un vector de 192 dimensiones que representa la identidad vocal del hablante. Esos embeddings se usan típicamente para verificación (1:1) y para identificación o *diarización* (1:N) mediante similitud coseno.

Su relevancia práctica es acotada pero concreta: el fichero ONNX pesa 28.285.675 bytes (unos 27 MB en float32), se ejecuta en CPU con ONNX Runtime y el autor documenta equivalencia numérica verificada frente al modelo PyTorch original (peor coseno 0,99999999999, peor diferencia absoluta máxima 7,2e−6 sobre cuatro audios de prueba). Es una pieza de infraestructura para pipelines biométricos de voz, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (red DTDNN con *context-aware masking*, `speakerlab/models/campplus/DTDNN.py`) |
| Parametros totales | no disponible (el checkpoint pesa 28.036.335 bytes; el ONNX 28.285.675 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada admite `T` dinámico (`[batch_size, T, 80]`), probado con batch 1 |
| Tipos de cuantizacion | no disponible (el autor indica que los pesos no se han cuantizado ni podado) |
| Idiomas soportados | entrenado para mandarín (zh-cn); sin garantías declaradas para otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 14, IR 7), float32 |

## Arquitectura y entrenamiento

CAM++ es una red de tipo DTDNN (densely connected time-delay neural network) con módulos de *context-aware masking* (CAM), descrita en el paper arXiv:2303.00332. El grafo exportado contiene 52 nodos `AveragePool` con `ceil_mode=1` y `count_include_pad=0`, y no contiene nodos `Pad`. La entrada es un tensor float32 `[batch_size, T, 80]` de fbank Kaldi con media restada sobre el eje temporal; la salida es `[batch_size, 192]`. La dimensión `T` es dinámica.

No se dispone de datos sobre el volumen de entrenamiento, la composición del dataset ni si se aplicó RLHF o alguna fase de ajuste fino: la model card original solo menciona "CAM++ speaker verification, zh-cn, 16 kHz, common, 200k speakers", y el autor de la conversión declara explícitamente que no pudo verificar la procedencia ni la licencia de los datos de entrenamiento. La "innovación técnica" de esta publicación no está en el modelo, sino en el proceso de exportación: se sustituyó en tiempo de exportación `avg_pool1d(..., count_include_pad=False)` dentro de `CAMLayer.seg_pooling` para evitar que el exportador de torch 2.11 escribiera `count_include_pad=1`, lo que habría hecho que ONNX Runtime dividiera la ventana final de `ceil_mode` por el tamaño del kernel en lugar del número de elementos válidos. Los ficheros fuente originales no se modificaron y la salida de PyTorch permanece idéntica (diferencia absoluta máxima 0,0 sobre cuatro entradas de prueba).

## Capacidades

- Extracción de *speaker embeddings* de 192 dimensiones a partir de audio representado como fbank de 80 bins a 16 kHz.
- Verificación de hablante 1:1 mediante similitud coseno entre embeddings.
- Identificación de hablante 1:N y soporte para tareas de diarización si se combina con un segmentador externo.
- Procesamiento por lotes (`batch_size` configurable) y longitud temporal dinámica `T`.
- Ejecución en CPU con ONNX Runtime; el autor reporta resultados bit-idénticos en ejecuciones repetidas con la misma entrada.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio-a-texto, tool calling ni razonamiento multi-paso. No es un modelo de lenguaje.

## Casos de uso

- **Verificación biométrica de acceso por voz**: dado un audio de enrolamiento y un audio de prueba, extraer ambos embeddings y aceptar o rechazar según un umbral de similitud coseno. El modelo es adecuado por su tamaño reducido (27 MB) y su ejecución en CPU, que permite desplegarlo en el propio dispositivo o en un servicio ligero.
- **Autenticación en call centers**: comparar la voz del interlocutor con la plantilla del cliente registrada para pasos de verificación adicionales, integrando el ONNX en el pipeline de telefonía existente sin añadir dependencias de PyTorch.
- **Diarización de reuniones y transcripciones**: segmentar un audio largo con un detector de actividad y cambio de turno y usar los embeddings de 192 dimensiones para agrupar segmentos por hablante y etiquetar quién habla en cada intervención.
- **Etiquetado de corpus de audio**: procesar por lotes un archivo de grabaciones para generar embeddings y agrupar o deduplicar hablantes antes de anotar un dataset de ASR o de TTS.
- **Detección de locutor recurrente en archivos multimedia**: indexar fragmentos de audio de un archivo de vídeo o podcast y recuperar todas las apariciones de una misma voz mediante búsqueda por similitud vectorial.
- **Preprocesado para modelos de voz generativa**: usar el embedding como condicionamiento de identidad en pipelines de clonación de voz o TTS (es el mismo rol que cumple `campplus.onnx` en CosyVoice, con el que el autor verifica equivalencia numérica).
- **Control de calidad de grabaciones**: detectar si dos tomas corresponden al mismo hablante antes de aceptar un dataset de entrenamiento, con un coste computacional mínimo en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (EER, minDCF, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor solo documenta verificaciones de equivalencia numérica frente al modelo PyTorch original, resumidas en la tabla siguiente:

| Prueba | Resultado | Criterio |
|---|---|---|
| PyTorch original vs. ONNX (4 audios: 2 coreanos, 2 ingleses) | Pasa; peor coseno 0,99999999999; peor diferencia absoluta máxima 7,2e−6 | coseno ≥ 1−1e−6 y dif. abs. ≤ 1e−4 |
| ONNX con `ENABLE_ALL` vs. `DISABLE_ALL` (ONNX Runtime 1.28.0) | Pasa; peor diferencia absoluta máxima 1,2e−5 | dif. abs. ≤ 1e−4 |
| ONNX vs. `campplus.onnx` de CosyVoice (`DISABLE_ALL`) | Pasa; peor diferencia absoluta máxima 1,2e−5 | dif. abs. ≤ 1e−4 |
| Repetición con la misma entrada | Bit-idéntica | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base; el modelo se ejecuta en CPU con ONNX Runtime. En GPU, el peso de los parámetros en float32 es de aproximadamente 27 MB, por lo que la VRAM necesaria es marginal (del orden de decenas de MB incluyendo buffers de activación, dependiendo de `T` y del batch).
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA EP o TensorRT EP); no se han publicado mediciones específicas para A100, H100 o RTX 4090.
- Cabe en cualquier GPU de consumo, incluida una RTX 3060 o inferior, y también en CPU sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con soporte de las optimizaciones de grafo `ENABLE_ALL` y `DISABLE_ALL` verificadas por el autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que las pruebas se hicieron con un hilo intra-op en CPU y que los resultados son deterministas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neureps/campplus-3dspk-onnx` | no disponible (27 MB en float32) | fbank 80 bins, `T` dinámico | embedding 192-d | Apache 2.0 | HuggingFace (ONNX) |
| `campplus.onnx` (incluido en CosyVoice) | mismos pesos que el original | fbank 80 bins | embedding 192-d | la del proyecto CosyVoice (no verificada aquí) | dentro del repo de CosyVoice |
| `iic/speech_campplus_sv_zh-cn_16k-common` (original, ModelScope) | no disponible | fbank 80 bins | embedding 192-d | Apache 2.0 según metadatos de la model card; el repo no incluye fichero `LICENSE` | ModelScope (checkpoint PyTorch `.bin`) |

No se dispone de datos de rendimiento (EER, minDCF) para establecer una comparación cuantitativa con alternativas como ECAPA-TDNN, ResNet-based speaker embeddings o WavLM-based embeddings; esa comparación no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Procedencia de los datos de entrenamiento no verificada**: la model card original no describe el dataset, y el autor de la conversión declara que no pudo verificar su procedencia ni su licencia. Esto es un riesgo directo para uso comercial o para despliegues sujetos a auditoría de datos.
- **Licencia ambigua en origen**: el repositorio original en ModelScope no incluye fichero `LICENSE`; la declaración Apache 2.0 se toma de los metadatos de la model card. El repositorio de código 3D-Speaker sí incluye Apache 2.0, y se adjunta una copia. Ninguno de los dos repositorios incluye fichero `NOTICE`.
- **Sesgo lingüístico**: el modelo se entrenó para verificación de hablante en mandarín (zh-cn). El autor no reclama calidad en otros idiomas más allá de las pruebas de equivalencia numérica, que se hicieron con audios en coreano e inglés pero solo miden coincidencia con PyTorch, no precisión biométrica.
- **Riesgo de uso biométrico**: la conversión no hace ninguna afirmación sobre uso biométrico ni sobre la identidad de ningún hablante. Cualquier despliegue en producción debe acompañarse de umbrales calibrados sobre datos propios y de una evaluación de EER/minDCF específica del dominio.
- **Sin benchmarks publicados**: no hay métricas de precisión (EER, minDCF, accuracy de verificación) en la información disponible, por lo que no se puede estimar su rendimiento real sin evaluarlo.
- **Alucinación**: no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y falsos negativos en la verificación, que deben gestionarse con umbrales y validación.
- **Dependencia de la representación de entrada**: el modelo espera fbank Kaldi de 80 bins a 16 kHz con `dither=0` y media restada en el tiempo. Cualquier desviación en el front-end (normalización, tamaño de ventana, sample rate) degrada los embeddings sin aviso.
- **Restricciones de licencia para uso comercial**: Apache 2.0 permite uso comercial, pero la incertidumbre sobre los datos de entrenamiento originales y la ausencia de `NOTICE` deben evaluarse legalmente antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neureps/campplus-3dspk-onnx
- Checkpoint original en ModelScope: https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common
- Repositorio de código 3D-Speaker: https://github.com/modelscope/3D-Speaker
- Paper CAM++: https://arxiv.org/abs/2303.00332
- Proyecto 3D-Speaker de Alibaba DAMO: https://github.com/alibaba-damo-academy/3D-Speaker
