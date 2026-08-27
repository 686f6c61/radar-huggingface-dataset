# aoiandroid/nemotron-multilingual-0.6b-coreml-ios

## Resumen

Este repositorio contiene el modelo `nemotron-multilingual-0.6b-coreml-ios`, una compilacion en formato Core ML del modelo de reconocimiento de voz NVIDIA Nemotron 3.5 ASR Streaming Multilingual 0.6B, preparada por el usuario `aoiandroid` para su integracion en la aplicacion iOS TranslateBlue. No se trata de un modelo de lenguaje generativo, sino de un sistema de transcripcion de voz en streaming de baja latencia.

El modelo subyacente, desarrollado por NVIDIA, emplea una arquitectura FastConformer-RNNT con diseno prompt-conditioned y cache-aware, y esta optimizado para transcripcion en tiempo real en mas de 40 idiomas. Esta version compilada para iOS convierte los paquetes `.mlpackage` en artefactos `.mlmodelc`, con especializacion para el Neural Engine (ANE) de Apple que se mantiene local al dispositivo.

La relevancia de esta publicacion radica en que facilita el despliegue de ASR multilingue en dispositivos Apple sin depender de servicios en la nube, con una unica pasada de inferencia que sustituye a despliegues separados por idioma basados en Whisper. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto de caracter comunitario o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (prompt-conditioned, cache-aware) |
| Parametros totales | 0.6B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no LLM con ventana de contexto) |
| Tipos de cuantizacion | compilado Core ML (`.mlmodelc`), especializacion ANE local al dispositivo |
| Idiomas soportados | mas de 40 idiomas |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento de voz automatico (ASR) de NVIDIA con arquitectura FastConformer-RNNT. El componente FastConformer proporciona un encoder eficiente basado en convoluciones con atencion, mientras que el decodificador RNNT (Recurrent Neural Network Transducer) permite transcripcion en streaming, es decir, generar texto de forma incremental mientras se recibe el audio, sin esperar a la senal completa.

El diseno es prompt-conditioned, lo que significa que la transcripcion puede condicionarse a instrucciones o contexto previo, y cache-aware, optimizando el uso de cache para reducir latencia en flujos de audio continuos. El modelo esta entrenado para cubrir mas de 40 idiomas en una unica pasada de inferencia, eliminando la necesidad de desplegar modelos separados por idioma. Los detalles especificos del dataset de entrenamiento, el numero de tokens y si se aplicaron tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada.

Esta publicacion concreta no modifica los pesos del modelo: se limita a compilar los paquetes Core ML (`.mlpackage`) al formato ejecutable `.mlmodelc` para iOS, dejando la especializacion del ANE como un paso local al dispositivo.

## Capacidades

- Transcripcion de voz en streaming de baja latencia en mas de 40 idiomas.
- Reconocimiento de voz condicionado por prompt, permitiendo adaptar la transcripcion a contextos o instrucciones previas.
- Generacion de subtitulos en tiempo real (real-time captioning).
- Soporte para agentes de voz (voice agents) con respuesta conversacional.
- Transcripcion multilingue en una unica pasada de inferencia, sin necesidad de modelos separados por idioma.
- Despliegue local en dispositivos iOS mediante Core ML, con especializacion para el Neural Engine de Apple.
- No es un modelo de lenguaje generativo: no genera texto libre, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Subtitulacion en tiempo real para aplicaciones de videollamada o streaming: el modelo transcribe audio de forma incremental con baja latencia, lo que permite generar subtitulos sincronizados en mas de 40 idiomas sin depender de servidores externos.
- Agentes de voz en dispositivos iOS: al ejecutarse localmente via Core ML, puede integrarse en asistentes de voz o interfaces conversacionales que requieran transcripcion inmediata sin conexion a internet.
- Transcripcion multilingue unificada en apps de productividad: una unica pasada de inferencia sustituye a despliegues separados por idioma basados en Whisper, simplificando el mantenimiento y reduciendo el uso de recursos.
- Traduccion y transcripcion en apps de viajes o comunicacion: la app TranslateBlue, para la que se ha compilado este modelo, puede ofrecer transcripcion de voz en tiempo real para conversaciones entre hablantes de distintos idiomas.
- Accesibilidad para personas con discapacidad auditiva: transcripcion local de conversaciones, reuniones o contenido audiovisual en dispositivos Apple, garantizando privacidad al no enviar audio a la nube.
- Grabacion y toma de notas por voz: transcripcion de dictados largos con streaming continuo, aprovechando la arquitectura cache-aware para mantener baja latencia en flujos de audio prolongados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER (Word Error Rate), latencia ni comparativas cuantitativas con otros modelos ASR. Los datos de rendimiento del modelo base de NVIDIA tampoco se detallan en la documentacion proporcionada.

## Requisitos de hardware

- Dispositivo iOS compatible con Core ML y Neural Engine (ANE) de Apple; la especializacion ANE se genera localmente en el dispositivo.
- El formato `.mlmodelc` esta optimizado para ejecucion en iPhone y iPad, sin necesidad de GPU externa.
- VRAM estimada: no disponible; al ser un modelo de 0.6B parametros compilado para Core ML, se espera que quepa en la memoria unificada de los dispositivos Apple modernos, pero no se proporcionan cifras concretas.
- Opciones de despliegue: integracion directa en apps iOS mediante Core ML; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un formato propietario de Apple.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno cache-aware del modelo base apunta a baja latencia en streaming, pero no hay mediciones publicadas para esta compilacion.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming Multilingual 0.6B (base) | 0.6B | FastConformer-RNNT | 40+ | MIT (segun este repo) | pesos originales |
| Whisper (variantes) | 0.04B - 1.5B | Transformer encoder-decoder | ~100 | MIT | PyTorch, GGUF, Core ML |
| Esta compilacion Core ML iOS | 0.6B | FastConformer-RNNT | 40+ | MIT | `.mlmodelc` |

La principal diferencia frente a Whisper es que este modelo esta disenado especificamente para streaming de baja latencia, mientras que Whisper procesa audio completo (aunque existen variantes de streaming). Ademas, el modelo de NVIDIA cubre 40+ idiomas en una unica pasada, mientras que los despliegues de Whisper suelen requerir modelos o configuraciones separadas por idioma. La compilacion Core ML de este repositorio anade la ventaja de ejecucion local en iOS con especializacion ANE.

## Limitaciones y advertencias

- Es un modelo de reconocimiento de voz, no un LLM: no genera texto libre, no responde preguntas ni soporta tool calling.
- El repositorio tiene 0 descargas y 0 likes: es un proyecto comunitario sin validacion amplia de la comunidad, por lo que su fiabilidad en produccion no esta contrastada.
- La compilacion `.mlmodelc` esta orientada a iOS; la version para macOS se publica como repositorio hermano (`aoiandroid/nemotron-multilingual-0.6b-coreml-macos`).
- No se proporcionan datos de rendimiento (WER, latencia) para esta compilacion concreta, por lo que no es posible evaluar su calidad frente al modelo base.
- La especializacion ANE se genera localmente en cada dispositivo, lo que puede implicar tiempos de compilacion adicionales en la primera ejecucion.
- No se especifican los idiomas concretos soportados ni la calidad de transcripcion por idioma; la afirmacion de "mas de 40 idiomas" proviene de la documentacion del modelo base de NVIDIA.
- Licencia MIT permite uso comercial, pero al ser una compilacion de un modelo de NVIDIA, conviene verificar los terminos de la licencia del modelo original antes de usarlo en productos comerciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aoiandroid/nemotron-multilingual-0.6b-coreml-ios
- Modelo fuente (FluidInference): https://huggingface.co/FluidInference/Nemotron-3.5-ASR-Streaming-Multilingual-0.6b-CoreML
- Repositorio hermano macOS: `aoiandroid/nemotron-multilingual-0.6b-coreml-macos`
- Pagina de NVIDIA sobre modelos Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Ficha del modelo en OpenRouter: https://openrouter.ai/nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b
- Ficha del modelo en Celon: https://www.celon.ai/en/models/nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b
