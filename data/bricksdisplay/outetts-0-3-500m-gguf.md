# BricksDisplay/OuteTTS-0.3-500M-GGUF

## Resumen

OuteTTS-0.3-500M-GGUF es una distribucion en formato GGUF del modelo text-to-speech OuteTTS-0.3-500M desarrollado por OuteAI, publicada por el usuario BricksDisplay. A diferencia de una simple conversion, este repositorio empaqueta el modelo en dos piezas complementarias: un backbone de lenguaje en GGUF que ejecuta llama.cpp y un fichero codec que contiene la parte de audio (decoder/vocoder, encoders de hablante y el adaptador entre ambos), ejecutado por codec.cpp. Esta separacion sigue el mismo patron que los proyectores multimodales de llama.cpp y permite inferencia completamente offline en CPU o GPU (CUDA, Vulkan, Metal).

El modelo resuelve el problema de desplegar sintesis de voz neuronal en entornos sin dependencias de Python pesadas o frameworks de deep learning, manteniendo un tamano reducido. El repositorio incluye las voces de referencia del paquete original de OuteTTS para seis idiomas (ingles, japones, coreano, chino, frances y aleman), con un total de 672 MB en la configuracion recomendada (Q8_0) y 515 MB en la mas pequena (Q4_K_M). El backbone declara 84.756.089 parametros en safetensors, aunque el nombre comercial del modelo referencia 500M, lo que sugiere que la cifra de safetensors corresponde solo a una parte de los componentes.

La relevancia actual del modelo radica en su portabilidad: los mismos dos ficheros funcionan en linea de comandos (tts-cli), Python (codec_cpp), React Native en iOS y Android (llama.rn) y cualquier host de llama.cpp. La licencia cc-by-sa-4.0 impone compartir-al-igual, un aspecto critico para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje tipo transformer (GGUF, ejecutado por llama.cpp) + codec de audio separado (decoder/vocoder, encoders de hablante y adaptador, ejecutado por codec.cpp) |
| Parametros totales | 84.756.089 (safetensors del backbone); el nombre comercial indica 500M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, FP16 para el backbone; F32, F16, Q8_0, Q5_K_M, Q4_K_M para el codec |
| Idiomas soportados | en, ja, ko, zh, fr, de |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (backbone y codec por separado) |

## Arquitectura y entrenamiento

El modelo se compone de dos grafos de computacion independientes que se ejecutan en tandem. El backbone es un modelo de lenguaje en formato GGUF que genera embeddings o tokens de audio condicionados por el texto de entrada, con una gramatica construida a partir del texto de entrada que restringe la generacion para mantenerla bien formada. El codec contiene la parte de audio: decoder/vocoder, encoders de hablante y el adaptador entre backbone y codec. Los ficheros del backbone son los GGUF originales de OuteAI sin modificar; el codec es especifico de este modelo y solo debe usarse con el.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que los ficheros del modelo llevan la configuracion de muestreo recomendada como metadatos `general.sampling.*` de llama.cpp, correspondiente a la `GenerationConfig` original: temperatura 0.1, top-k 50, top-p 1.0 (desactivado), min-p 0 (desactivado), penalizacion de repeticion 1.1 y ventana de repeticion 4096. Esta configuracion de baja temperatura es tipica de modelos TTS que requieren estabilidad en la generacion de tokens de audio.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto plano en ingles, japones, coreano, chino, frances y aleman.
- Voces integradas: las voces de referencia del paquete original de OuteTTS para los seis idiomas; `tts-cli voices` las lista y la voz por defecto es `en_male_1`.
- Generacion en streaming: `tts.stream(text)` en Python produce audio a medida que se genera.
- Inferencia completamente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Ejecucion multiplataforma: linea de comandos (tts-cli), Python (codec_cpp), React Native en iOS y Android (llama.rn) y cualquier host de llama.cpp.
- Control de muestreo configurable mediante flags (temperatura, top-k, top-p, min-p, penalizacion de repeticion, ventana de repeticion).
- Gramatica derivada del texto de entrada para mantener la generacion bien formada.
- No dispone de clonacion de voz: la model card indica explicitamente "No voice cloning", aunque la API Python menciona un parametro `ref_audio=` "donde el modelo lo soporte".
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones moviles: integrado via llama.rn en iOS y Android, el modelo sintetiza texto en el dispositivo sin conexion, con un peso de 672 MB en Q8_0, adecuado para narracion de contenidos largos en ingles o en los idiomas soportados.
- Asistentes de voz embebidos en dispositivos sin GPU dedicada: al ejecutarse en CPU mediante llama.cpp y codec.cpp, permite dotar de voz a sistemas empotrados o mini-PC donde no es viable desplegar frameworks de deep learning completos.
- Generacion de audiolibros y locuciones en seis idiomas: las voces de referencia integradas para en, ja, ko, zh, fr y de permiten producir narraciones multilingues con una sola instalacion, usando la voz adecuada por idioma mediante `--voice`.
- Prototipado rapido de interfaces de voz en Python: el paquete codec_cpp expone una API minima (`tts.synthesize`, `tts.stream`) que facilita integrar TTS en scripts de investigacion o demos sin gestionar pesos ni frameworks adicionales.
- Accesibilidad: conversion de texto a voz en aplicaciones de lectura para personas con discapacidad visual, aprovechando el streaming para empezar a reproducir audio antes de completar la sintesis.
- Generacion de contenido para video y podcasts: sintesis por lotes desde linea de comandos con `tts-cli synthesize` para producir pistas de voz en varios idiomas a partir de guiones de texto.
- Sistemas de anuncios o notificaciones por voz en produccion offline: integracion en pipelines locales donde la privacidad exige que el texto no salga del dispositivo, con la configuracion de muestreo fija que garantiza salidas estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por los tamanos de fichero, la configuracion recomendada (Q8_0 backbone + codec Q8_0) ocupa 672 MB en disco, la mas pequena (Q4_K_M) 515 MB y la de mayor calidad (FP16) 1.2 GB. El consumo en memoria sera del orden de estos tamanos mas el overhead de los dos grafos.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte de CUDA, Vulkan y Metal, por lo que cualquier GPU compatible con estas APIs sirve.
- Cabe en GPU consumer: si, dado que el modelo completo en Q8_0 ocupa 672 MB; cualquier GPU consumer con soporte CUDA, Vulkan o Metal puede ejecutarlo.
- Opciones de despliegue: tts-cli y tts-server de codec.cpp (que incluye llama.cpp), paquete Python codec_cpp, llama.rn para React Native (iOS/Android) y cualquier host de llama.cpp. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OuteTTS-0.3-500M-GGUF (este) | 84.756.089 (backbone safetensors); nombre comercial 500M | no disponible | en, ja, ko, zh, fr, de | cc-by-sa-4.0 | GGUF (backbone + codec) | Voces integradas, sin clonacion, ejecucion offline en CPU/GPU |
| OuteAI/OuteTTS-0.3-500M (modelo base) | no disponible | no disponible | en, ja, ko, zh, fr, de | cc-by-sa-4.0 | safetensors (original) | Modelo original del que deriva esta conversion; requiere el stack de OuteTTS |
| Otros modelos TTS de ~500M | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre alternativas comparables en rendimiento, ya que no se han publicado benchmarks en la documentacion disponible.

## Limitaciones y advertencias

- Texto de entrada restringido: solo letras y espacios; los numeros deben escribirse con palabras y el chino, japones y coreano deben ir en forma romanizada (pinyin, romaji, romanizacion revisada). Esto limita el uso directo con texto sin preprocesar.
- Sin clonacion de voz: la model card indica explicitamente "No voice cloning", aunque la API menciona `ref_audio=` "donde el modelo lo soporte"; conviene verificar el comportamiento real antes de disenar un producto que dependa de ello.
- El fichero codec es especifico de este modelo y no debe usarse con otros modelos; mezclar ficheros de backbone y codec de distintos repositorios puede producir salidas invalidas.
- Licencia cc-by-sa-4.0: permite uso comercial pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos de codigo cerrado.
- Riesgo de alucinacion y errores de pronunciacion: no se documentan evaluaciones de calidad de sintesis; la temperatura baja (0.1) y la gramatica reducen la variabilidad, pero no se garantiza fidelidad en todos los idiomas.
- Idiomas limitados a seis; no se soporta espanol, lo que descarta su uso directo en castellano sin un modelo distinto.
- No se documentan sesgos especificos ni limitaciones de contexto; la longitud de contexto no esta disponible.
- El repositorio ocupa 21.8 GB por incluir todas las cuantizaciones; el despliegue real solo necesita un fichero de backbone y uno de codec.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/OuteTTS-0.3-500M-GGUF
- Modelo base: https://huggingface.co/OuteAI/OuteTTS-0.3-500M
- codec.cpp (runtime de audio): https://github.com/mybigday/codec.cpp
- Documentacion Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (React Native): https://github.com/mybigday/llama.rn
- Documentacion TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
