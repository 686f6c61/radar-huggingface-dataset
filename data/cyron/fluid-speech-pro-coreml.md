# cyron/fluid-speech-pro-coreml

## Resumen

Fluid Speech Pro (Core ML, 16 bits) es una conversión no oficial a Core ML del modelo de reconocimiento automático del habla Fluid Speech Pro, desarrollado por FluidVoice Labs. La conversión la firma el usuario cyron y está pensada para la aplicación VoiceiQ en macOS. El modelo original se construye sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, y esta versión mantiene los pesos y el cómputo en coma flotante de 16 bits, sin cuantización alguna.

El paquete replica la interfaz de `parakeet-tdt-0.6b-v3-coreml` y `fluid-speech-mini-coreml`: audio de entrada a 16 kHz, ventanas de 15 segundos, vocabulario de 8.192 piezas y token blank en la posición 8192. Por ello, FluidAudio lo carga como un modelo Parakeet v3. La conversión incorpora el bloque extra de encoder de Fluid Speech Pro (`fv_insert`, tras el subsampling) al encoder trazado, de modo que la salida coincide con la del modelo NeMo original.

Se trata de un modelo especializado en transcripción multilingüe (26 idiomas europeos) que resuelve el despliegue local en Apple Silicon sin depender de GPUs NVIDIA ni de servicios en la nube. Su relevancia radica en que traslada un modelo ASR de calidad a un formato ejecutable de forma nativa en macOS mediante Core ML, con licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder con bloque adicional `fv_insert` tras el subsampling; conversión a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 15 segundos (16 kHz) |
| Tipos de cuantizacion | ninguno; pesos y cómputo en FP16 |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (26 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), con el joint almacenado como `JointDecisionv3.mlmodelc` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet TDT (Token-and-Duration Transducer), un esquema transducer que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por bloques y reduce la latencia frente a los transductores clásicos. Sobre la base de NVIDIA Parakeet TDT 0.6B v3, FluidVoice Labs añade un bloque de encoder adicional (`fv_insert`) que se inserta después del subsampling; la conversión Core ML lo incorpora al grafo trazado para que la salida numérica coincida con la del modelo NeMo de referencia.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO. La conversión a Core ML no modifica el entrenamiento: solo cambia el formato de fichero y la precisión numérica, manteniendo los pesos en 16 bits sin cuantizar. El vocabulario es de 8.192 piezas con blank en la posición 8192, idéntico al de Parakeet v3 y Fluid Speech Mini, lo que garantiza compatibilidad de carga en FluidAudio 0.17.7.

## Capacidades

- Reconocimiento automático del habla (ASR) en 26 idiomas europeos, incluidos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, rumano, griego, húngaro, checo, sueco, danés, finés, noruego (no listado explícitamente), búlgaro, croata, estonio, letón, lituano, maltés, eslovaco, esloveno, ruso y ucraniano.
- Transcripción por ventanas de 15 segundos con audio de entrada a 16 kHz.
- Decodificación TDT (token-and-duration) que combina predicción de tokens y duraciones.
- Compatibilidad directa con FluidAudio como modelo Parakeet v3 (interfaz, salidas y vocabulario equivalentes).
- Ejecución nativa en macOS mediante Core ML, sin dependencia de CUDA.
- No incluye el modo "clean" del modelo original.
- No se documentan capacidades de diarización, timestamps por palabra, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción local en macOS: integrar el modelo en una app de dictado o notas de voz que corra íntegramente en Apple Silicon, aprovechando Core ML y la ventana de 15 segundos para procesar fragmentos de audio en streaming por bloques.
- Subtitulado de reuniones y videollamadas: transcribir intervenciones en tiempo casi real en entornos corporativos multilingües (por ejemplo, equipos con inglés, alemán y español) sin enviar audio a la nube, lo que simplifica el cumplimiento de RGPD.
- Atención al cliente con grabaciones: procesar llamadas grabadas en lote para generar transcripciones indexables, gracias a la cobertura de 26 idiomas y a la ejecución local que evita costes por minuto de API.
- Accesibilidad: dictado por voz para usuarios con movilidad reducida en aplicaciones macOS, con latencia baja al ejecutarse en el propio dispositivo y sin conexión a internet.
- Investigación lingüística y corpus: transcribir entrevistas o grabaciones de campo en idiomas europeos menos cubiertos (maltés, estonio, esloveno) para construir corpus anotados, con la ventaja de que la licencia CC BY 4.0 permite su uso académico y comercial con atribución.
- Integración en pipelines de postproducción de audio: transcripción previa a la edición de podcasts o vídeos, generando texto alineado por ventanas de 15 segundos que luego se puede segmentar y sincronizar.
- Prototipado de asistentes de voz: usar el modelo como componente ASR en una app de escritorio que combine captura de micrófono, transcripción local y un LLM posterior, todo dentro del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU discreta; el modelo se ejecuta en memoria unificada de Apple Silicon. El repositorio ocupa 1,2 GB, lo que da una cota superior aproximada del espacio necesario para pesos en FP16.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con soporte Core ML; no se documentan requisitos mínimos de núcleos Neural Engine o GPU.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para alojar el paquete de 1,2 GB más el runtime; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: Core ML de forma nativa; FluidAudio 0.17.7 lo carga como modelo Parakeet v3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo ASR Core ML).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cyron/fluid-speech-pro-coreml | no disponible | 15 s (16 kHz) | 26 | CC BY 4.0 | Core ML FP16 | Conversión no oficial; sin modo clean |
| parakeet-tdt-0.6b-v3-coreml | 0,6 B (según nombre) | 15 s (16 kHz) | no disponible en la información | no disponible | Core ML | Interfaz y vocabulario compatibles; base de la que deriva |
| fluid-speech-mini-coreml | no disponible | 15 s (16 kHz) | no disponible | no disponible | Core ML | Interfaz y vocabulario compatibles; variante mini |
| FluidVoice-Labs/fluid-speech-pro | no disponible | no disponible | 26 | CC BY 4.0 | NeMo (original) | Modelo original del que se hace la conversión |

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de FluidVoice; el autor original no respalda esta versión.
- Solo se ha validado la equivalencia de salida frente al modelo NeMo según la model card; no hay benchmarks públicos que cuantifiquen la degradación por la conversión.
- El modo "clean" del modelo original no está incluido.
- Ventana fija de 15 segundos: audios más largos requieren segmentación y posible solapamiento para evitar cortes en fronteras.
- Cobertura limitada a 26 idiomas europeos; no se documentan idiomas fuera de esa lista.
- No se documentan sesgos específicos, pero al ser un modelo ASR multilingüe cabe esperar sesgos de acento, dialecto y dominio propios de los datos de entrenamiento originales, no detallados en la información disponible.
- Riesgo de alucinación en segmentos con ruido o silencio: los transductores pueden emitir texto espurio en audio no vocal; se recomienda umbral de confianza y VAD previo.
- Licencia CC BY 4.0: permite uso comercial con atribución a FluidVoice y a los componentes base (NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra); es necesario revisar las condiciones de esos modelos base.
- Dependencia del ecosistema Apple: no ejecutable en Linux o Windows con GPU NVIDIA sin reconversión.
- Sin datos publicados de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyron/fluid-speech-pro-coreml
- Modelo original: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Modelo base citado en la model card: `parakeet-tdt-0.6b-v3-coreml`
- Modelo base citado en la model card: `fluid-speech-mini-coreml`
- Referencia a NVIDIA Parakeet TDT 0.6B v3 (mencionado en la model card, sin enlace directo)
- Referencia a Moondream Parakeet Ultra (mencionado en la model card, sin enlace directo)
- FluidAudio 0.17.7 (runtime mencionado en la model card, sin enlace directo)
