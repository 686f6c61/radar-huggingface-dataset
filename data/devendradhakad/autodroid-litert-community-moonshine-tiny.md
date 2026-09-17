# devendradhakad/autodroid-litert-community-moonshine-tiny

## Resumen

Este repositorio empaqueta el modelo de reconocimiento automatico del habla Moonshine Tiny (27 millones de parametros) en formato LiteRT/TFLite para inferencia en dispositivo. El modelo original lo desarrolla Moonshine AI (anteriormente Useful Sensors) y se presento en el articulo "Moonshine: Speech Recognition for Live Transcription and Voice Commands" (arXiv:2410.15608). La contribucion de este repositorio, publicado por el usuario devendradhakad, no es un reentrenamiento, sino una conversion y compilacion del modelo base a LiteRT, incluyendo variantes float32 e int8 y compilaciones anticipadas (AOT) para NPUs de MediaTek y Qualcomm.

El modelo es un encoder-decoder transformer disenado especificamente para transcripcion en vivo y comandos de voz, con un enfoque en baja latencia sobre hardware modesto. La ventana de audio es fija de 5 segundos (80.000 muestras a 16 kHz) y el frontend de audio (normalizacion y procesamiento de la forma de onda) esta integrado dentro del grafo, por lo que el modelo acepta directamente una onda cruda en el rango [-1, 1] sin necesidad de extraer un mel-espectrograma por separado.

Es relevante ahora porque demuestra un flujo completo de despliegue de ASR en el borde: variantes cuantizadas de 52 MB y 109 MB que caben holgadamente en memoria de moviles, ademas de artefactos precompilados para aceleradores NPU de SoC concretos. Su licencia MIT y su tamano lo hacen utilizable en productos embebidos sin coste de licencia, aunque esta limitado al idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia) |
| Parametros totales | 27 millones (modelo base Moonshine Tiny) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio fija de 5 s (80.000 muestras a 16 kHz); 207 posiciones de estado del encoder; hasta 64 tokens decodificados por ventana |
| Tipos de cuantizacion | float32 y int8 (encoder float32 + decoder con cuantizacion de rango dinamico int8) |
| Idiomas soportados | Ingles (unico idioma indicado en la model card) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (.tflite), con variantes AOT para NPU de MediaTek y Qualcomm |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder compacto de 27 millones de parametros. El encoder consume la onda de audio cruda con forma `[1, 80000]` en float32 (5 segundos a 16 kHz, con relleno de ceros si el audio es mas corto) y produce estados con forma `[1, 207, 288]`. El decoder recibe esos estados, un buffer de tokens `[1, 64]` en int32 y una mascara causal aditiva `[1, 1, 64, 64]` en float32, y devuelve logits `[1, 64, 32768]` en float32. La decodificacion es voraz (greedy): token de inicio 1, token de fin de secuencia 2 y un maximo de 64 tokens por ventana.

Un detalle tecnico importante es que el decoder no utiliza cache de clave-valor (KV cache): en cada paso vuelve a puntuar el buffer completo de tokens, de modo que el tiempo de decodificacion crece con el numero de tokens emitidos. El frontend de audio esta embebido en el grafo, lo que elimina la dependencia de una etapa externa de extraccion de caracteristicas. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion deberia consultarse en el articulo original (arXiv:2410.15608). Si se describe que el modelo esta disenado para inferencia rapida en dispositivo.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles sobre audio de 16 kHz.
- Transcripcion de audio de cualquier duracion mediante ventanas consecutivas de 5 segundos que se concatenan con espacios.
- Procesamiento de la onda cruda dentro del grafo: no requiere mel-espectrogramas externos.
- Decodificacion greedy con limite de 64 tokens por ventana y tokens especiales de inicio (1) y fin (2).
- Ejecucion en CPU y en NPU de determinados SoC MediaTek y Qualcomm mediante artefactos AOT precompilados.
- Variante int8 de 52 MB para despliegues con restricciones de memoria.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio generativo ni modo de razonamiento explicito.
- No se documenta capacidad multilingue: la model card indica unicamente ingles.

## Casos de uso

- Comandos de voz en aplicaciones moviles: el modelo se ejecuta en el propio dispositivo con una ventana de 5 s, lo que permite activar acciones sin enviar audio a un servidor y sin coste de red.
- Transcripcion en vivo de notas de voz: dividiendo la grabacion en ventanas de 5 s y concatenando las salidas se obtiene la transcripcion completa de una reunion o dictado.
- Subtitulado local de contenido en ingles: al procesar ventanas consecutivas, puede generar subtitulos en tiempo casi real en equipos sin GPU dedicada.
- Asistentes de voz embebidos en dispositivos IoT o wearables: el modelo de 52 MB en int8 y la ausencia de KV cache permiten integraciones en hardware con memoria limitada.
- Procesamiento por lotes de archivos de audio: la API de LiteRT permite cargar el `.tflite` una vez y transcribir varios archivos en serie reutilizando los buffers de entrada y salida.
- Aplicaciones sensibles a la privacidad: al funcionar integramente en el dispositivo, el audio no abandona el terminal, lo que facilita el cumplimiento de requisitos de proteccion de datos.
- Despliegue sobre NPU de moviles concretos: los ficheros AOT para MediaTek y Qualcomm permiten aprovechar el acelerador del SoC para reducir consumo energetico frente a la ejecucion en CPU.
- Prototipado de pipelines de ASR en el borde: sirve como banco de pruebas para medir latencia y precision antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER, latencia ni comparaciones numericas con otros modelos. El articulo asociado (arXiv:2410.15608) es la fuente indicada para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. La variante int8 ocupa 52 MB en disco y la float32 109 MB; sumando buffers de activacion (estados `[1, 207, 288]` y logits `[1, 64, 32768]`) el consumo se mantiene dentro de unos pocos cientos de megabytes.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; no se requieren A100 ni H100. Funciona en CPU de forma nativa.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPU integradas y en CPU de moviles.
- Opciones de despliegue: LiteRT / `ai-edge-litert` (libreria indicada), con el paquete `ai-edge-litert` de Python y `CompiledModel`. Tambien artefactos AOT especificos para NPU de MediaTek y Qualcomm. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se sabe que el decoder sin KV cache re-puntua el buffer completo de tokens en cada paso, por lo que la latencia de decodificacion aumenta con el numero de tokens emitidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moonshine Tiny (este repositorio) | 27 M | 5 s por ventana | MIT | TFLite/LiteRT | Incluye variantes int8 y AOT para NPU |
| Moonshine Tiny (base, UsefulSensors/moonshine-ai) | 27 M | 5 s por ventana | MIT | safetensors (framework original) | Modelo de origen; incluye `tokenizer.json` |
| Whisper Tiny | 39 M | 30 s | MIT | safetensors, GGUF, etc. | Alternativa multilingue ampliamente desplegada; datos de rendimiento no disponibles en esta informacion |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que no se pueden contrastar cifras de WER ni de latencia entre estos modelos.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documenta cobertura multilingue.
- La ventana de audio es fija de 5 segundos: audios mas largos requieren segmentacion manual y concatenacion de resultados, lo que puede introducir cortes en palabras.
- El decoder no usa KV cache, por lo que el coste de decodificacion crece con el numero de tokens generados; esto penaliza ventanas con transcripciones largas.
- Limite de 64 tokens por ventana: transcripciones densas en 5 segundos pueden truncarse.
- El tokenizador no se incluye en este repositorio; debe descargarse `tokenizer.json` desde el repositorio del modelo base. Omitir este paso impide usar el modelo.
- Se trata de una conversion de terceros, no del repositorio oficial de Moonshine AI; la trazabilidad de la conversion y de las compilaciones AOT no esta documentada en detalle.
- No se documentan sesgos especificos, tasas de alucinacion ni evaluacion por acentos o dominios; como todo sistema ASR, es probable que tenga peor rendimiento en audio con ruido, solapamiento de voces o acentos no representados en sus datos de entrenamiento (composicion del dataset no disponible).
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones de los artefactos AOT y de las herramientas de LiteRT empleadas en la conversion.
- El repositorio registra 0 descargas y 0 likes, y no hay validacion de la comunidad: debe evaluarse su calidad antes de usarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-moonshine-tiny
- Modelo base (model card): https://huggingface.co/UsefulSensors/moonshine-tiny
- Articulo: Moonshine: Speech Recognition for Live Transcription and Voice Commands — https://arxiv.org/abs/2410.15608
- LiteRT (documentacion): https://ai.google.dev/edge/litert

No se han encontrado otros enlaces relevantes en los resultados de la busqueda web proporcionados.
