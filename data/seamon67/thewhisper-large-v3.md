# seamon67/thewhisper-large-v3

## Resumen

TheWhisper-large-v3 es un modelo de reconocimiento automatico del habla (ASR) multilingue basado en la arquitectura encoder-decoder de OpenAI Whisper Large V3. La version original fue ajustada por TheStage AI para reducir la latencia y el consumo energetico en inferencia en tiempo real, con soporte para GPUs NVIDIA y chips Apple Silicon mediante CoreML. La ficha que nos ocupa, `seamon67/thewhisper-large-v3`, es una conversion a BF16 del checkpoint de TheStage AI, publicada por un tercero bajo licencia MIT y distribuida en formato `safetensors` para su uso con la libreria `transformers`.

El modelo cuenta con 1.543.490.560 parametros (aproximadamente 1,54 mil millones) y un repositorio de 3,1 GB, coherente con pesos en precision BF16. Su principal diferencia respecto a Whisper Large V3 original es que acepta fragmentos de audio de 10, 15, 20 y 30 segundos sin necesidad de rellenar con silencio hasta la ventana completa de 30 segundos, lo que lo hace apto para transcripcion en streaming y para interfaces de voz en dispositivo.

Es relevante ahora porque cubre el nicho de ASR de baja latencia con marcas de tiempo a nivel de palabra y de segmento, sobre un modelo de tamano contenido que puede ejecutarse en hardware de consumo. No obstante, la publicacion concreta analizada presenta cero descargas y cero valoraciones, y su proceso de cuantizacion a BF16 no esta documentado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parametros totales | 1.543.490.560 (1,54 mil millones) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | Ventana de audio de hasta 30 s (1500 fotogramas mel); el ajuste admite trozos de 10, 15, 20 y 30 s |
| Tipos de cuantizacion | BF16 (esta version); no se documentan otras cuantizaciones (GGUF, INT8, INT4) en la informacion disponible |
| Idiomas soportados | Multilingue, aproximadamente 99 idiomas (los mismos que Whisper Large V3) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Large V3: un encoder transformer que procesa espectrogramas mel de 80 canales y un decoder autorregresivo que genera tokens de texto, con 32 capas de encoder y 32 de decoder, atencion multi-cabeza y normalizacion pre-LN. El modelo base fue entrenado por OpenAI sobre un corpus web a gran escala de audio con transcripciones debilmente supervisadas (aproximadamente 5 millones de horas de audio etiquetado debilmente, segun la documentacion publica de Whisper), con supervision multitarea que incluye transcripcion, traduccion al ingles, deteccion de idioma y marcas temporales.

Sobre ese checkpoint, TheStage AI aplico un ajuste fino orientado a inferencia en tiempo real: el modelo resultante procesa fragmentos de audio de cualquier duracion hasta 30 segundos sin rellenar con silencio, admite transcripcion en streaming con ventanas deslizantes y expone marcas temporales a nivel de palabra. Ademas, TheStage AI ofrece motores optimizados (denominados ANNA, con tamanos `S` y `mode='S'`) y despliegue nativo en CoreML para Apple Silicon. La version que analizamos aqui no incluye informacion sobre el procedimiento de cuantizacion aplicado ni sobre si se realizo calibracion o evaluacion posterior a la conversion a BF16; la model card unicamente indica que se trata de una cuantizacion a BF16 del modelo de TheStage AI.

## Capacidades

- Transcripcion de voz a texto multilingue en aproximadamente 99 idiomas, con deteccion automatica del idioma de entrada.
- Traduccion de voz a texto en ingles (capacidad heredada de Whisper).
- Procesamiento de fragmentos de audio de 10, 15, 20 y 30 segundos sin relleno de silencio, optimizado para menor latencia.
- Transcripcion en streaming mediante ventanas deslizantes con paso configurable (por ejemplo, 0,5 s) y salida incremental.
- Marcas temporales a nivel de palabra (`return_timestamps="word"`) y a nivel de segmento (`return_timestamps="segment"`).
- Inferencia por lotes (`max_batch_size` configurable, por ejemplo 32) para aumentar el rendimiento.
- Ejecucion en GPU NVIDIA mediante `thestage_speechkit.nvidia` y en Apple Silicon mediante `thestage_speechkit.apple` (CoreML).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio generation en la informacion disponible.

## Casos de uso

- Subtitulado en tiempo real: con ventanas de 10 s y decodificacion en streaming, el modelo puede generar subtitulos incrementales en retransmisiones en directo, corrigiendo hipotesis parciales a medida que llegan nuevos fragmentos.
- Transcripcion de reuniones y actas: el soporte de marcas temporales por palabra y de lotes de hasta 32 fragmentos permite procesar grabaciones largas por partes y reconstruir quien dijo que y cuando.
- Interfaces de voz en dispositivo: la ruta CoreML y los motores optimizados permiten ejecutar ASR local en Macs y portatiles con Apple Silicon, sin enviar audio a la nube.
- Asistentes de voz de baja latencia: al no requerir relleno hasta 30 s, la latencia por turno se reduce, lo que encaja en dialogos interactivos con retroalimentacion inmediata.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de un archivo de audios con marcas temporales para construir indices de texto buscables.
- Accesibilidad y cumplimiento normativo: generacion de transcripciones para contenidos audiovisuales y para documentacion de llamadas en sectores regulados, con la ventaja de poder desplegarse en infraestructura propia.
- Traduccion de audio a texto en ingles: en entornos multilingues donde se necesita un unico idioma de salida para analitica o moderacion de contenido.
- Procesamiento por lotes en pipelines de datos: integrable en flujos que consumen audio de forma masiva gracias a su tamano contenido (1,54 mil millones de parametros) y a su licencia MIT.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo original de TheStage AI, no a esta conversion a BF16 de `seamon67`. La metrica es WER medio (menor es mejor) sobre los benchmarks multilingues del Open ASR Leaderboard, evaluando distintos tamanos de fragmento.

| Modelo | WER medio (10 s) | WER medio (15 s) | WER medio (20 s) | WER medio (30 s) |
|---|---|---|---|---|
| openai/whisper-large-v3-turbo | 7,81 | 7,61 | 7,63 | 7,61 |
| openai/whisper-large-v3 | 7,45 | 7,22 | 7,29 | 7,32 |
| thewhisper-large-v3-turbo | 7,88 | 7,45 | 7,47 | 7,45 |
| thewhisper-large-v3 | 7,80 | 7,34 | 7,31 | 7,28 |

Observaciones a partir de la tabla: TheWhisper-large-v3 mejora a la variante turbo de TheStage en todos los tamanos de fragmento y se acerca al Whisper Large V3 original, al que supera ligeramente en la ventana de 30 s (7,28 frente a 7,32). En fragmentos de 10 s la degradacion respecto al original es de 0,35 puntos de WER, lo que indica el coste en calidad de operar con ventanas cortas. No se han publicado resultados de benchmarks especificos para la version BF16 alojada en `seamon67/thewhisper-large-v3`.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 3,1 GB, coherente con el tamano del repositorio.
- Pesos en FP32: aproximadamente 6,2 GB, si se carga sin la conversion a BF16.
- VRAM estimada para inferencia en BF16: entre 4 y 6 GB con lotes pequenos; el consumo crece con `max_batch_size` y con la longitud del fragmento procesado.
- GPUs de datacenter: A100, H100 y L40S, sin problemas de memoria; utiles para lotes grandes y alto rendimiento.
- GPUs de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs de 8 GB si se reduce el lote.
- Apple Silicon: soporte nativo mediante CoreML a traves de `thestage_speechkit.apple`, apto para Macs con chip M1 o superior.
- Opciones de despliegue: `transformers` (libreria indicada en la ficha), `thestage_speechkit` en sus rutas `nvidia` y `apple`, motores optimizados de TheStage AI, y exportacion a CoreML. No se documenta soporte para llama.cpp, Ollama, vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card referencia graficos de rendimiento sobre una RTX 5090, pero los valores numericos no estan incluidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER medio (30 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seamon67/thewhisper-large-v3 (BF16) | 1,54 mil millones | 10-30 s | no disponible para esta conversion | MIT | HuggingFace, 0 descargas |
| TheStageAI/thewhisper-large-v3 | 1,54 mil millones | 10-30 s | 7,28 | MIT | HuggingFace, motores propios |
| openai/whisper-large-v3 | 1,55 mil millones | 30 s (con relleno) | 7,32 | MIT | HuggingFace, ampliamente desplegado |
| openai/whisper-large-v3-turbo | 809 millones | 30 s (con relleno) | 7,61 | MIT | HuggingFace, mas rapido y ligero |

La ventaja diferencial de esta familia frente a Whisper Large V3 original es la ausencia de relleno de silencio y la decodificacion en streaming; su desventaja es que, en fragmentos de 10 s, el WER empeora entre 0,25 y 0,35 puntos. Frente a la variante turbo, ofrece mejor calidad a costa de casi el doble de parametros.

## Limitaciones y advertencias

- La publicacion analizada es una resubida de terceros con cero descargas y cero valoraciones; no hay evidencia de validacion independiente de la conversion a BF16.
- El proceso de cuantizacion no esta documentado: se desconoce si hubo calibracion, que capas se convirtieron y si la calidad se evaluo despues de la conversion.
- En todos los tamanos de fragmento, el WER del modelo base es ligeramente superior al de Whisper Large V3 original, por lo que no supone una mejora de precision sino de latencia.
- Whisper es conocido por alucinar texto en segmentos con silencio, ruido o musica; conviene aplicar deteccion de actividad vocal y filtros de confianza en produccion.
- La calidad se degrada de forma notable en idiomas con pocos recursos y en audio con solapamiento de voces, ruido de fondo o acentos marcados.
- No hay informacion publicada sobre sesgos demograficos ni sobre evaluacion por variedades dialectales del espanol.
- La licencia MIT del modelo base permite uso comercial, pero el repositorio no incluye garantias; conviene verificar los terminos del modelo original de TheStage AI antes de un despliegue en produccion.
- El uso de los motores optimizados de TheStage AI requiere un token de acceso generado en su plataforma, lo que introduce una dependencia de un servicio externo para esa ruta de despliegue.
- Los graficos de rendimiento en la model card no van acompanados de cifras verificables en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seamon67/thewhisper-large-v3
- Modelo base en HuggingFace: https://huggingface.co/TheStageAI/thewhisper-large-v3
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Repositorio de TheWhisper en GitHub: https://github.com/TheStageAI/TheWhisper
- Benchmarks de TheWhisper: https://github.com/TheStageAI/TheWhisper/blob/main/benchmark/README.md
- Open ASR Leaderboard: https://github.com/huggingface/open_asr_leaderboard
- Plataforma de TheStage AI: https://app.thestage.ai
