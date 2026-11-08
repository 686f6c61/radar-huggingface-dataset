# smdesai/LFM3-Omni-2B-CoreAI

## Resumen

LFM3-Omni-2B es el primer modelo "omni" de Liquid AI: un modelo end-to-end de 2.000 millones de parametros que comprende texto, imagenes, video y audio, y responde en texto, voz o texto y voz intercalados. Sustituye en un solo modelo la combinacion habitual de ASR + modelo vision-lenguaje + LLM + TTS, lo que lo hace especialmente atractivo para despliegue en dispositivo (on-device). Se trata de un modelo no razonador (non-reasoning), orientado a latencia baja y a integrarse en aplicaciones moviles.

La ficha que nos ocupa, `smdesai/LFM3-Omni-2B-CoreAI`, no es el modelo original sino una conversion del checkpoint `LiquidAI/LFM3-Omni-2B` (revision `5797d07c125503bd4f4c0e7f915ae2d3d703e8de`) al formato de Core AI de Apple, empaquetado como bundles AOT (ahead-of-time) compilados para GPU `h19p`. Incluye grafos en fp16 e int8, un decodificador de profundidad de voz en fp32, un codec de voz en streaming y codificadores de audio y vision por buckets.

Es relevante ahora porque demuestra el patron de portabilidad de modelos multimodales de 2B a aceleradores de Apple mediante Core AI, con requisitos de iOS 27 o superior y una ventana de contexto de 16.384 posiciones. La licencia subyacente es la LFM Open License v1.0, y el port no es una publicacion oficial ni de Liquid AI ni de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni multimodal; pesos convertidos a grafos Core AI) |
| Parametros totales | 2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 posiciones |
| Tipos de cuantizacion | fp16 (decoder, attention, LM head, codec, encoders de audio) y int8 (proyecciones MLP/convolucion del decoder en modo rapido); depth decoder de voz en fp32; embeddings en bf16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); el port incluye LICENSE, NOTICE y provenance.json |
| Formato de pesos | bundles `.aimodel` portables y `.aimodelc` compilados para `h19p`; assets en bf16/f32 (`embed_tokens.bf16`, `codebook.bf16`, `codec_window.f32`); tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es un modelo omni de 2B parametros construido sobre Transformers, segun la model card de LiquidAI, que procesa entradas de texto, imagen, video y audio a 16 kHz y genera texto y voz a 24 kHz. La documentacion de Liquid AI lo describe como un modelo end-to-end no razonador pensado para uso en dispositivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La conversion a Core AI descompone el modelo en 41 grafos portables y 41 grafos compilados. El decoder y la attention van en fp16 con LM head separado y cache de longitud variable por niveles; el decodificador de profundidad de la voz va en fp32; el codec de voz es un codec en streaming fp16 que procesa cuatro frames por llamada; el encoder de audio tiene buckets de 32, 64, 128 y 256, mas una variante en streaming de 128 tokens por llamada; y la torre de vision esta segmentada en 15 trozos (`vseg_0..14`) con buckets de convolucion y attention de 1.024 a 8.192 en pasos de 1.024. El chunk de prefill del decoder es de 16. Los assets portables permiten recompilar AOT para otras arquitecturas soportadas por el toolchain de Core AI, aunque el comportamiento en otra arquitectura requiere validacion.

## Capacidades

- Generacion de texto a partir de entradas multimodales (texto, imagen, video y audio).
- Comprension de audio a 16 kHz, equivalente a un modelo ASR integrado.
- Comprension de imagenes y video mediante torre de vision segmentada.
- Generacion de voz a 24 kHz, equivalente a un TTS integrado, con codec en streaming.
- Salida intercalada de texto y voz en una misma respuesta.
- Modo "fast" con decoder int8 (proyecciones MLP/convolucion) y attention fp16, ademas del modo fp16 completo.
- Procesamiento en streaming de audio (encoder de streaming de 128 tokens por llamada) y de voz (codec de cuatro frames por llamada).
- No es un modelo de razonamiento: no se documenta modo "thinking" ni cadena de pensamiento explicita.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en aplicaciones iOS: el modelo integra ASR, LLM y TTS en un unico grafo, de modo que una app puede capturar audio a 16 kHz, generar respuesta y reproducir voz a 24 kHz sin orquestar tres modelos separados; encaja con el encoder de audio en streaming y el codec de cuatro frames por llamada.
- Descripcion de imagenes y video en dispositivo: la torre de vision segmentada en 15 trozos y los buckets de 1.024 a 8.192 permiten procesar fotogramas o imagenes de distintos tamanos sin salir del dispositivo, util para accesibilidad (lectura de escenas) o etiquetado local.
- Traduccion y dictado con salida hablada: al aceptar audio de entrada y producir texto y voz, sirve para apps de notas de voz que transcriben y resumen, o que leen la respuesta en voz alta.
- Atencion al cliente por voz en kioscos o apps: con 16.384 posiciones de contexto puede mantener conversaciones multi-turno con historial de audio y texto, y responder con voz sintetizada en la misma sesion.
- Subtitulado y resumen de video local: la combinacion de vision y audio permite generar descripciones o resumenes de clips sin enviar contenido a la nube, relevante por privacidad.
- Prototipado de pipelines any-to-any en macOS/iOS: los 41 bundles portables `.aimodel` permiten recompilar AOT con `xcrun coreai-build compile` para otras arquitecturas del toolchain Core AI, lo que facilita experimentar con el mismo modelo en distintos targets Apple.
- Evaluacion de modos de precision: el repositorio incluye decoder fp16 e int8 con el mismo LM head, depth decoder, codec y encoders, lo que permite comparar latencia y calidad en un mismo dispositivo sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: iOS 27 o superior con Core AI; los bundles `h19p` estan compilados para GPU `h19p`.
- La app necesita el entitlement de limite de memoria ampliado y memoria suficiente para los grafos, el estado y el procesamiento de medios.
- VRAM/RAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 15,0 GB, aunque la app solo descarga `h19p/graphs`, `h19p/graphs_int8`, `assets` y `h19p/manifest.json`, cuyos tamanos exactos figuran en `h19p/manifest.json`.
- GPU recomendadas: GPU `h19p` de Apple (iPhone con iOS 27+). Para otras arquitecturas Apple es posible recompilar AOT con `--platform macOS` o `--platform iOS` y la arquitectura deseada, pero la compatibilidad no esta garantizada.
- Cabe en GPU consumer: si, en el hardware Apple objetivo; no se documenta soporte para GPU NVIDIA ni para CUDA.
- Opciones de despliegue: Core AI (runtime de Apple) con bundles `.aimodelc`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se conocen dos parametros de diseno: prefill del decoder en chunks de 16 y encoder de audio en streaming de 128 tokens por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-CoreAI (este port) | 2B | 16.384 | texto, imagen, video, audio de entrada; texto y voz de salida | LFM Open License v1.0 | Hugging Face, formato Core AI para iOS 27+ |
| LiquidAI/LFM3-Omni-2B (original) | 2B | no disponible | texto, imagen, video, audio de entrada; texto y voz de salida | LFM Open License v1.0 | Hugging Face, pesos Transformers |
| Alternativas de 2B omni comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo base es no razonador: no se debe esperar cadena de pensamiento ni mejoras de precision por razonamiento explicito.
- Es un port no oficial: no es una publicacion de Liquid AI ni de Apple; los archivos son modificados/convertidos y se rigen por NOTICE y provenance.json.
- Compatibilidad restringida: los binarios incluidos solo apuntan a GPU `h19p` e iOS 27+; recompilar para otra arquitectura no garantiza funcionamiento sin validacion.
- Requiere el entitlement de limite de memoria ampliado y memoria suficiente; en dispositivos con poca RAM puede no ser viable.
- El repositorio completo son 15,0 GB; la app descarga un subconjunto, pero el espacio de instalacion debe planificarse segun `h19p/manifest.json`.
- Idiomas soportados no documentados: riesgo de comportamiento degradado fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo generativo de 2B, especialmente en transcripcion de audio con ruido.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia LFM Open License v1.0: es necesario consultar los terminos del archivo LICENSE antes de uso comercial; la licencia se etiqueta como "other", no como Apache o MIT.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en produccion sin validacion previa.
- Los grafos portables `.aimodel` contienen programas fuente despojados, no los exports de depuracion originales, lo que limita la inspeccion del modelo.

## Enlaces

- Hugging Face del port: https://huggingface.co/smdesai/LFM3-Omni-2B-CoreAI
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentacion de Liquid AI para LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
