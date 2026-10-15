# ivrit-ai/zipformer2-66m-streaming-he

## Resumen

zipformer2-66m-streaming-he es un modelo de reconocimiento automático del habla (ASR) en hebreo, de tipo Zipformer2 transducer y arquitectura causal orientada a streaming. Lo publica la organización israelí ivrit-ai como espejo del repositorio original de thewh1teagle, con exportaciones ONNX adicionales propias, y deriva de un ajuste fino del Zipformer streaming en inglés de icefall sobre audio hebreo de ivrit.ai. Con 66 millones de parámetros, decodifica en fragmentos (chunks) de 1,28 s a medida que llega el audio, sin esperar a la utterance completa.

El modelo resuelve el problema de la transcripción en tiempo real en hebreo con un coste computacional muy bajo, apto para ejecución on-device (navegador, móvil o CPU) en lugar de depender de servicios en la nube. Es relevante porque el hebreo es un idioma con pocos recursos ASR de calidad y porque un modelo de 66 M capaz de competir con sistemas propietarios y con Whisper large-v3-turbo en los conjuntos de evaluación de ivrit.ai cambia el equilibrio entre latencia, privacidad y precisión.

Se distribuye bajo licencia CC-BY-4.0, con pesos en PyTorch (icefall) y exportaciones ONNX en int8, fp32 y fp16. Está integrado en el servicio live-transcribe.ivrit.ai para transcripción local en el navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder causal + decoder + joiner), entrenado con icefall/k2 |
| Parámetros totales | 66 M (aproximadamente) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | contexto izquierdo de 256 frames; chunk de 64 frames (1,28 s) por paso de decodificación |
| Tipos de cuantización | int8 (export sherpa-onnx), fp32 y fp16 (exports ONNX de ivrit.ai) |
| Idiomas soportados | hebreo (he); el inglés residual es muy débil |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`model.pt`, state dict de icefall), ONNX (`encoder`/`decoder`/`joiner` en int8, fp32 y fp16), `tokens.txt`, `config.json` |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Características acústicas | 80-dim fbank |
| Vocabulario | 1.493 tokens SentencePiece (500 ingleses + 1.024 hebreos), blank = 0 |
| Dimensión de encoder / decoder / joiner | 192-512 por etapa (encoder) / 512 / 512 |
| Contexto de decoder (context_size) | 2 |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El encoder es un Zipformer2 causal organizado en seis etapas con 2, 2, 3, 4, 3 y 2 capas (16 capas en total), factores de downsampling de 1, 2, 4, 8, 4 y 2, dimensiones de encoder de 192, 256, 384, 512, 384 y 256, y dimensiones feed-forward de 512, 768, 1.024, 1.536, 1.024 y 768. Los cabezales de atención son 4, 4, 4, 8, 4 y 4, con kernel de convolución de 31, 31, 15, 15, 15 y 31, y dimensiones de atención por cabeza de 32 (query), 12 (value), 4 (pos_head) y 48 (pos). El decoder y el joiner tienen dimensión 512 y el decoder usa un contexto de 2 tokens. El modelo es causal, con chunk de 64 frames (1,28 s) y contexto izquierdo de 256 frames, lo que permite decodificación incremental sin lookahead sobre el futuro.

El entrenamiento parte del Zipformer streaming en inglés de icefall (`Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17`) y lo adapta al hebreo: en lugar de sustituir el tokenizador, se amplía con un SentencePiece hebreo de 1.024 piezas entrenado sobre unas 500 h de transcripciones, añadido tras las 500 piezas inglesas originales (1.493 en total). Las nuevas filas de embedding y de salida se inicializan con la media de las filas antiguas más un 1 % de ruido. Se aplicó un LR 10× mayor sobre decoder y joiner para que las filas nuevas se separasen rápido, y se usó ScaledAdam con `base_lr` 0,0045 y Eden con `lr_batches` 7.500 / `lr_epochs` 2 (los valores por defecto de `finetune.py`, `lr_batches` 100.000 / `lr_epochs` 100, mantenían el LR plano y estancaban el modelo en torno a un 20 % de WER). El conjunto de datos son aproximadamente 20.000 h de audio de ivrit.ai pseudo-etiquetado con los modelos Whisper de ivrit.ai, procesado a unos 600 s de audio por paso.

## Capacidades

- Reconocimiento de voz en hebreo en modo streaming, con decodificación por chunks de 1,28 s y latencia acotada por el tamaño del chunk.
- Transcripción offline de ficheros de audio completos, usando el mismo modelo con el mismo grafo y los mismos parámetros de chunking.
- Ejecución on-device: exportaciones int8 para sherpa-onnx, fp32 para CPU/runtime general y fp16 para WebGPU/CUDA (la salida del encoder fp16 mantiene un coseno mínimo de 0,99999 frente a fp32 sobre una utterance en streaming).
- Integración con sherpa-onnx mediante `OnlineRecognizer.from_transducer`, con `model_type="zipformer2"` y `num_threads` configurable.
- Ejecución en navegador con onnxruntime-web (probado con la versión 1.30), usando `config.json` para inicializar el estado de streaming del encoder.
- Capacidad multilingüe: no aplica más allá del hebreo; el inglés residual se deletrea letra a letra.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es un modelo puramente acústico-to-texto.
- No se documentan capacidades de puntuación, diarización, detección de idioma ni marcas temporales por palabra.

## Casos de uso

- Subtitulado en directo de emisiones, ruedas de prensa y clases en hebreo: el modelo decodifica a medida que llega el audio en bloques de 1,28 s, por lo que se puede emitir texto incremental por WebSocket sin acumular la utterance entera.
- Transcripción privada en el navegador: es la base de live-transcribe.ivrit.ai, que usa el export int8 sobre backend WASM de onnxruntime-web; el audio no sale del dispositivo del usuario.
- Aplicaciones móviles y embebidas sin GPU: con 66 M de parámetros y un peso int8 de aproximadamente 66 MB, cabe en dispositivos con memoria muy limitada y funciona en CPU con 4 hilos.
- Atención al cliente y centros de llamadas en hebreo: transcripción en tiempo de las conversaciones para análisis posterior, con la ventaja de que el coste por hora de audio es muy inferior al de un modelo grande en GPU.
- Indexación y búsqueda en archivos audiovisuales hebreos: transcripción por lotes de podcasts, archivos de televisión o vídeos corporativos para construir índices de texto o alimentar pipelines de RAG en hebreo.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en tiempo real en aplicaciones de videollamada o de asistencia presencial, con chunk de 1,28 s como cota de retardo.
- Investigación lingüística sobre hebreo hablado: generación de transcripciones normalizadas a gran escala (eliminación de nikud y marcas bidireccionales, conversión de geresh/gershayim) para corpus y estudios fonéticos.
- Preetiquetado de datos de entrenamiento: el propio modelo, por su velocidad y bajo coste, puede usarse como anotador inicial de audio hebreo para revisión humana posterior.

## Benchmarks y rendimiento

WER (%, menor es mejor) sobre los conjuntos de evaluación de ivrit.ai, con la normalización del leaderboard de ivrit-ai. Los números de los modelos comparativos provienen del leaderboard y corresponden a evaluación offline (utterance completa) salvo donde se indica; el modelo de esta ficha es un modelo de streaming.

| Modelo | eval-d1 ↓ | eval-whatsapp ↓ |
|---|---|---|
| Soniox | 4,8 | 9,0 |
| zipformer2-66m-streaming-he (este modelo) | 5,1 | 8,9 |
| ivrit-ai/whisper-large-v3-turbo | 5,3 | 7,1 |
| parakeet-tdt-0.6b-v3-he | 6,1 | 8,8 |
| openai/whisper-large-v3-turbo | 8,4 | 12,8 |
| NVIDIA nemotron-3.5-asr-streaming-0.6b (streaming) | 17,1 | 36,5 |

Datos adicionales de calidad de la cuantización: el export int8 de sherpa-onnx obtiene 5,3 / 8,8 frente al 5,1 / 8,9 del modelo en fp32. En una comparación directa sobre 15 clips de eval-whatsapp, int8 y fp32 dieron 9,31 % y 9,40 % de WER respectivamente, por lo que la pérdida por cuantización int8 no es medible en la práctica. En navegador (onnxruntime-web 1.30), el export int8 sobre WASM resultó aproximadamente igual de rápido que fp16 sobre WebGPU en una GPU integrada, con la mitad de descarga, motivo por el que live-transcribe.ivrit.ai usa int8 + WASM.

## Requisitos de hardware

- Peso del modelo: aproximadamente 66 MB en int8, 132 MB en fp16 y 264 MB en fp32 (cálculo a partir de los 66 M de parámetros; no publicado por el autor).
- VRAM estimada para inferencia: muy por debajo de 1 GB en cualquier precisión; las exportaciones se pueden ejecutar en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU de gama alta. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente; para fp16/WebGPU conviene una GPU con soporte WebGPU o CUDA. En servidores, una A100 o H100 queda enormemente sobredimensionada para un solo stream, aunque permite agrupar muchos streams concurrentes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en GPUs integradas y en CPU.
- Opciones de despliegue: sherpa-onnx (int8, el formato de referencia del repositorio), onnxruntime (fp32/fp16), onnxruntime-web (WASM o WebGPU), icefall con k2 para entrenamiento o ajuste fino desde `model.pt`.
- Configuración de referencia: `num_threads=4` en sherpa-onnx; chunking de 64 frames (1,28 s) y contexto izquierdo de 256 frames.
- Latencia: acotada por el chunk de 1,28 s más el tiempo de cómputo por chunk. No se publican cifras de throughput (tokens o segundos de audio por segundo de proceso) ni de RTF, por lo que estos datos se consideran no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Streaming | WER eval-d1 | WER eval-whatsapp | Licencia | Formatos |
|---|---|---|---|---|---|---|
| zipformer2-66m-streaming-he | 66 M | Sí (chunks de 1,28 s) | 5,1 | 8,9 | CC-BY-4.0 | PyTorch, ONNX int8/fp32/fp16 |
| ivrit-ai/whisper-large-v3-turbo | ~809 M (arquitectura Whisper large-v3-turbo) | No (offline) | 5,3 | 7,1 | no disponible | no disponible |
| parakeet-tdt-0.6b-v3-he | ~600 M | no disponible | 6,1 | 8,8 | no disponible | no disponible |
| NVIDIA nemotron-3.5-asr-streaming-0.6b | ~600 M | Sí | 17,1 | 36,5 | no disponible | no disponible |
| Soniox | no disponible (servicio propietario) | no disponible | 4,8 | 9,0 | propietaria | API |

La ventaja principal frente a los modelos basados en Whisper o Parakeet es el orden de magnitud en número de parámetros (66 M frente a 600-809 M) manteniendo un WER competitivo, lo que se traduce en despliegue on-device y coste por hora de audio muy inferior. El modelo de NVIDIA, también de streaming, queda muy por detrás en ambos conjuntos según estos datos.

## Limitaciones y advertencias

- El inglés es claramente débil: el propio autor indica que se deletrea letra a letra, por lo que no debe usarse para audio en inglés ni para mezclas de idiomas.
- Los números se transcriben de forma inconsistente, alternando palabras y dígitos, lo que obliga a postprocesado si se necesitan cifras normalizadas.
- Solo está entrenado para hebreo; no hay soporte de otros idiomas ni detección automática de idioma.
- La decodificación es causal con chunk de 1,28 s: existe un retardo intrínseco de al menos ese valor y la calidad depende del contexto izquierdo de 256 frames; no se documentan métricas específicas de degradación en streams muy largos.
- No hay información publicada sobre sesgos, robustez frente a acentos, ruido de fondo, solapamiento de hablantes ni calidad en audio telefónico o de baja frecuencia de muestreo distinta de 16 kHz.
- Riesgo de alucinación: no se documenta explícitamente para este modelo, pero los sistemas transducer pueden generar secuencias plausibles en tramos de silencio o ruido; conviene validar en producción.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. Es importante revisar además las condiciones de los datos de ivrit.ai usados en el ajuste fino si se redistribuye el modelo o se publican derivados.
- El repositorio de esta ficha es un espejo de `thewh1teagle/zipformer2-66m-streaming-he`; las exportaciones ONNX fp32/fp16 y `config.json` son aportaciones de ivrit.ai y no existían en el repositorio original, que solo incluía el export int8 de sherpa-onnx.
- No se publican cifras de throughput, consumo energético ni comportamiento con lotes concurrentes, datos relevantes para dimensionar un servicio en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ivrit-ai/zipformer2-66m-streaming-he
- Repositorio original (espejo base): https://huggingface.co/thewh1teagle/zipformer2-66m-streaming-he
- Modelo base en inglés: https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- Leaderboard de transcripción en hebreo de ivrit.ai: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- Servicio de transcripción en directo que usa este modelo: https://live-transcribe.ivrit.ai
- ivrit.ai: https://www.ivrit.ai
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de despliegue): https://github.com/k2-fsa/sherpa-onnx

Nota: la búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo distintos de los ya incluidos en la información de HuggingFace; los resultados obtenidos corresponden a repositorios de plugins sin relación con el modelo.
