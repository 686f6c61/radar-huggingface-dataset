# RandomThingsIDo/FastAligner

## Resumen

FastAligner es un modelo compacto de alineación forzada (forced alignment) para inglés, desarrollado por el usuario RandomThingsIDo y publicado bajo licencia Apache 2.0. No es un modelo generativo ni un sistema ASR de propósito general: recibe como entrada una transcripción conocida junto con las características acústicas del audio y produce logits CTC que permiten determinar en qué instante del audio aparece cada palabra o fonema del texto. Se distribuye exclusivamente en formato ONNX y está pensado para ejecutarse en local con `onnxruntime`.

Técnicamente es un encoder de tipo LiteConformer con 20.615.072 parámetros, dimensión oculta de 384, 6 capas y 6 cabezas de atención, con un vocabulario CTC de 32 símbolos. Trabaja sobre espectrogramas log-Mel de 80 bins normalizados a una tasa de 100 Hz y emite logits a ~50 Hz. El repositorio incluye tres variantes ONNX (FP32, FP16 e INT8 dinámica), lo que permite desplegarlo tanto en GPU como en CPU sin reentrenamiento.

Su relevancia actual es práctica: la alineación forzada es un paso habitual en pipelines de subtitulado, generación de datasets TTS, análisis fonético y evaluación de sistemas de voz, y tradicionalmente se ha resuelto con modelos mucho más pesados (wav2vec2-large) o con alineadores clásicos basados en HMM. FastAligner se destila desde `facebook/wav2vec2-large-960h-lv60-self` y reduce drásticamente el coste de cómputo, con un repositorio de 0,2 GB. Se trata de la versión v0.1, con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder compacto estilo LiteConformer con cabeza CTC; 6 capas, dimension oculta 384, 6 cabezas de atencion |
| Parametros totales | 20.615.072 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de contexto; procesa audio en fragmentos de 3,0 s con 0,75 s de solapamiento (modo 3-second) o la secuencia completa (modo full) |
| Tipos de cuantizacion | FP32, FP16 e INT8 dinamica (variantes ONNX incluidas en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18); no se distribuyen safetensors ni GGUF |
| Entrada | Espectrograma log-Mel de 80 bins normalizado, 100 Hz; no acepta waveform crudo |
| Salida | Logits CTC a ~50 Hz |
| Vocabulario CTC | 32 simbolos |
| Tamano del repositorio | 0,2 GB |
| Libreria | onnxruntime |
| Version | FastAligner v0.1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo conformer en su variante compacta ("LiteConformer"), con 6 capas, dimension oculta de 384 y 6 cabezas de atencion, coronado por una cabeza de clasificacion CTC con un vocabulario de 32 simbolos. La entrada no es audio crudo, sino un espectrograma log-Mel de 80 bins calculado a 16 kHz mono y normalizado, con una tasa de frames de 100 Hz; la salida son logits CTC a aproximadamente 50 Hz. El modelo se exporta a ONNX con opset 18 y se ejecuta mediante `onnxruntime` en tres variantes numericas: FP32 de referencia, FP16 para inferencia acelerada e INT8 dinamica para CPU compacta.

En cuanto al entrenamiento, la model card indica que el estudiante se destilo usando `facebook/wav2vec2-large-960h-lv60-self` como profesor CTC. No se especifican en la informacion disponible el numero de tokens de audio, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO (que, por otra parte, no serian esperables en un modelo discriminativo de alineacion). La innovacion practica mas destacable es el esquema de inferencia en dos modos sobre un unico modelo ONNX dinamico: el modo de 3 segundos, recomendado para v0.1, normaliza las caracteristicas de la locucion completa antes de trocear, procesa fragmentos de 3,0 s con 0,75 s de solapamiento, aplica un crossfade lineal de los logits solapados y ejecuta una unica alineacion forzada CTC global tras el ensamblado; el modo "full" alimenta la secuencia normalizada completa sin trocear. Los parametros exactos de ejecucion estan en `alignment_config.json` y los de preprocesado en `preprocessor_config.json`.

## Capacidades

- Alineacion forzada de audio y transcripcion conocida: genera logits CTC que permiten asignar marcas temporales a palabras o unidades de la transcripcion de entrada.
- Alineacion local y rapida: el modelo es compacto (20,6 M de parametros) y esta disenado para ejecutarse en la maquina del usuario mediante `onnxruntime`.
- Procesamiento de locuciones largas mediante chunking: el modo de 3 segundos con solapamiento permite alinear audio que excede la ventana de procesamiento de una sola pasada.
- Inferencia en CPU y GPU con el mismo grafo ONNX: las variantes FP16 e INT8 permiten ajustar el equilibrio entre precision y coste.
- Normalizacion del eje temporal dentro de una misma locucion: el modo de 3 segundos normaliza las caracteristicas sobre la locucion completa antes de trocear, lo que favorece la coherencia de las marcas temporales.
- No soporta: reconocimiento de voz general (ASR) sin transcripcion, traduccion, generacion de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision ni audio-vision.
- No soporta idiomas distintos del ingles segun los metadatos del modelo.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Subtitulado automatico de precision: en un pipeline donde se ha transcrito el audio con un ASR y se dispone del texto, FastAligner produce las marcas temporales por palabra necesarias para generar subtitulos SRT/VTT con sincronia fina, sin necesidad de un modelo acustico grande.
- Generacion de datasets para TTS: para entrenar sintetizadores de voz se necesitan pares texto-audio con duraciones por fonema o palabra; FastAligner permite derivar esas duraciones de forma masiva y a bajo coste sobre corpus en ingles ya transcritos.
- Evaluacion de sistemas ASR: al alinear la hipotesis del ASR con la referencia y el audio, se pueden localizar inserciones, omisiones y sustituciones en el eje temporal, lo que ayuda a diagnosticar errores de reconocimiento mas alla del WER agregado.
- Auditoria de calidad de grandes corpus de voz: alinear transcripciones existentes y detectar tramos con logits poco confiables permite marcar segmentos mal transcritos o con desajuste audio-texto antes de usarlos como datos de entrenamiento.
- Investigacion fonetica y analisis prosodico: las marcas temporales por unidad sobre un texto conocido permiten medir duraciones, pausas y ritmo en estudios de habla, sin recurrir a alineadores HMM clasicos.
- Herramientas de edicion de audio o video basadas en texto: aplicaciones que permiten editar el audio borrando o moviendo palabras necesitan el mapeo texto-a-tiempo que proporciona este modelo, y su tamano reducido facilita integrarlo en la propia aplicacion de escritorio.
- Preprocesado en tiempo casi real para doblaje y localizacion: el modo de 3 segundos con solapamiento permite alinear fragmentos conforme llegan, con una latencia acotada y sin cargar un modelo acustico grande en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de precision de alineacion, error temporal medio ni comparaciones cuantitativas con otros alineadores. El autor indica unicamente que la paridad de tiempos entre las variantes FP32, FP16 e INT8 debe validarse a nivel de alineacion forzada final, y no juzgando solo las diferencias en los logits crudos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 82,5 MB en FP32, 41,2 MB en FP16 y 20,6 MB en INT8 (calculado a partir de los 20.615.072 parametros). Las activaciones para fragmentos de 3 s a 100 Hz son reducidas, por lo que el consumo total es muy bajo.
- GPU recomendadas: no se especifican en la documentacion. Dado el tamano, cualquier GPU con soporte de `onnxruntime` (por ejemplo, GTX 1650 o superior, RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente; no se publican cifras de latencia ni de throughput por modelo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU, ya que el modelo completo ocupa decenas de megabytes.
- CPU: es el escenario natural de la variante INT8 dinamica; el modelo esta disenado para inferencia local en CPU mediante `onnxruntime`.
- Opciones de despliegue: `onnxruntime` (libreria declarada por el modelo). No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama, TGI ni otras plataformas de servido de LLM, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La tasa de salida CTC es de ~50 Hz y la entrada se muestrea a 100 Hz, pero no se publican tiempos de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastAligner | 20.615.072 | Fragmentos de 3 s con 0,75 s de solapamiento o secuencia completa; log-Mel de 80 bins a 100 Hz | No disponible | Apache 2.0 | HuggingFace, ONNX (FP32/FP16/INT8) |
| `facebook/wav2vec2-large-960h-lv60-self` (profesor CTC) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion | HuggingFace |
| Alineadores clasicos tipo HMM (por ejemplo, Montreal Forced Aligner) | No aplica (no es red neuronal) | Depende de la configuracion | No disponible | No disponible en la informacion | Herramienta externa |
| WhisperX (alineacion basada en wav2vec2) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion | Repositorio externo |

El unico punto de comparacion documentado por el autor es el profesor de destilacion, `facebook/wav2vec2-large-960h-lv60-self`. No se incluyen en la informacion disponible datos de parametros, contexto ni rendimiento de las alternativas, por lo que la comparativa numerica no puede completarse.

## Limitaciones y advertencias

- No es un modelo ASR: no acepta audio sin transcripcion ni puede generar texto. Usarlo como reconocedor de voz daria resultados invalidos.
- No acepta waveform crudo: requiere espectrogramas log-Mel de 80 bins a 16 kHz mono con la configuracion exacta de `preprocessor_config.json`; un preprocesado distinto degradara la alineacion.
- Alcance limitado al ingles: los metadatos declaran unicamente el idioma `en`, sin datos sobre comportamiento en otros idiomas.
- Version v0.1: se trata de una primera version, con cero descargas y cero likes en HuggingFace en la fecha de consulta, lo que implica ausencia de validacion independiente y de reportes de la comunidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision temporal, robustez frente a ruido, musica, solapamiento de hablantes o acentos distintos del corpus de destilacion.
- Riesgo de alineacion incorrecta: al depender de una transcripcion conocida, si el texto no coincide realmente con el audio (palabras omitidas, anadidas o mal transcritas) el modelo puede producir marcas temporales erroneas o forzar correspondencias inexistentes.
- Dependencia del esquema de chunking: el modo recomendado trocea en fragmentos de 3 s con solapamiento y crossfade lineal de logits; variar estos parametros sin revalidar puede introducir discontinuidades en las marcas temporales.
- Cuantizacion: el autor advierte de que la paridad entre FP32, FP16 e INT8 debe comprobarse a nivel de alineacion final, no de logits crudos; no se ofrecen cifras de degradacion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al ser un modelo destilado de `facebook/wav2vec2-large-960h-lv60-self` conviene revisar las condiciones de la licencia del modelo profesor antes de un despliegue comercial.
- Sin garantias de soporte: no hay pipeline declarado, ni demo, ni documentacion de mantenimiento mas alla de la model card y los ficheros de configuracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RandomThingsIDo/FastAligner
- Modelo profesor de destilacion: https://huggingface.co/facebook/wav2vec2-large-960h-lv60-self
- Ficheros de configuracion mencionados en la model card: `preprocessor_config.json` y `alignment_config.json` (incluidos en el repositorio del modelo)
- Variantes ONNX del repositorio: `onnx/model.onnx` (FP32), `onnx/model_fp16.onnx` (FP16), `onnx/model_quantized.onnx` (INT8)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
