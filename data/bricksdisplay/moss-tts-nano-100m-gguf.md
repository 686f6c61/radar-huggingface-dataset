# BricksDisplay/MOSS-TTS-Nano-100M-GGUF

## Resumen

MOSS-TTS-Nano-100M-GGUF es la cuantizacion en formato GGUF del modelo de sintesis de voz MOSS-TTS-Nano-100M desarrollado por el equipo OpenMOSS de MOSI.AI. Se trata de un sistema TTS multilingue con capacidad de clonacion de voz que cubre diez idiomas (chino, ingles, japones, coreano, aleman, espanol, frances, italiano, ruso y portugues). La version GGUF, publicada por el usuario BricksDisplay, permite ejecutar el modelo de forma totalmente offline en CPU y GPU mediante los runtimes llama.cpp y codec.cpp.

El modelo original se presenta como un TTS de tipo "nano": pese a la etiqueta de 100M del nombre, los pesos en safetensors suman 41.775.744 parametros reales. La arquitectura se divide en dos grafos independientes: un backbone de lenguaje texto-a-voz ejecutado por llama.cpp y un codec de audio (decoder/vocoder, codificadores de hablante y adaptador) ejecutado por codec.cpp. Esta separacion recuerda al enfoque de proyectores multimodales de llama.cpp.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar clonacion de voz multilingue en hardware modesto: el par de ficheros mas pequeno ocupa 114 MB y el recomendado 280 MB, lo que permite inferencia en telefonos y CPUs ARM. La licencia Apache 2.0 facilita su adopcion comercial, aunque la ausencia de voces integradas obliga a disponer de una muestra de referencia para cada sintesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone TTS (texto-a-voz) sobre llama.cpp + codec de audio (decoder/vocoder, speaker encoders y adaptador) sobre codec.cpp |
| Parametros totales | 41.775.744 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0 (backbone); f32, f16, q8_0, q5_k_m, q4_k_m y variante q8_0-lm-q8_0 (codec) |
| Idiomas soportados | zh, en, ja, ko, de, es, fr, it, ru, pt |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos ficheros por ejecucion: uno de backbone y uno de codec) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone mas alla de que se ejecuta como un modelo de lenguaje texto-a-voz en llama.cpp. El sistema se compone de dos grafos: el backbone TTS y un codec que agrupa el decoder/vocoder, los codificadores de hablante y el adaptador entre ambos. Los runtimes (llama.cpp y codec.cpp) conectan ambos grafos y permiten ejecucion en CPU o GPU con CUDA, Vulkan o Metal, de forma completamente offline.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El modelo incorpora en los ficheros GGUF la configuracion de muestreo recomendada como metadatos `general.sampling.*` (temperatura 1.7, top-k 25, top-p 1.0, min-p 0), que los hosts de llama.cpp aplican por defecto.

## Capacidades

- Sintesis de voz (text-to-speech) multilingue en diez idiomas: chino, ingles, japones, coreano, aleman, espanol, frances, italiano, ruso y portugues.
- Clonacion de voz a partir de una muestra de audio de referencia (`--ref-audio`), con cualquier frecuencia de muestreo.
- Generacion en streaming: la API Python `tts.stream(text)` produce audio a medida que se genera.
- Guardado y reutilizacion de perfiles de voz mediante `--save-speaker`, evitando repetir la muestra de referencia.
- Ejecucion totalmente offline en CPU y GPU (CUDA, Vulkan, Metal).
- Integracion mediante CLI (`tts-cli`), servidor (`tts-server`) y paquete Python (`codec_cpp`).
- No dispone de voces integradas: toda sintesis requiere una muestra de referencia.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de hablante.

## Casos de uso

- Clonacion de voz personalizada en aplicaciones de accesibilidad: un usuario graba una muestra corta y limpia de su voz y el modelo la reproduce para leer textos, con el par q8_0 (169 MB) ejecutable en un portatil sin GPU.
- Locucion multilingue de contenidos: el soporte de diez idiomas permite generar narraciones en espanol, ingles, aleman o japones desde un unico modelo, usando el backbone bf16 y codec f16 (280 MB) para maxima calidad.
- Generacion de audiolibros y podcasts: la API de streaming (`tts.stream`) permite emitir audio por fragmentos, reduciendo la latencia percibida en textos largos.
- Integracion en telefonos y dispositivos ARM: la variante q8_0 con codec q8_0-lm-q8_0 (151 MB) esta pensada para ser la mas rapida en CPUs ARM, habilitando TTS embebido en apps moviles.
- Prototipado de asistentes de voz offline: el despliegue con `tts-server` y llama.cpp permite montar un servicio TTS local sin dependencias de red, adecuado para entornos con requisitos de privacidad.
- Doblaje y preproduccion audiovisual: la clonacion de voz con muestras de referencia facilita generar borradores de doblaje en varios idiomas antes de la locucion final.
- Pruebas de integracion en pipelines Python: el paquete `codec_cpp` permite incorporar la sintesis en scripts de generacion de contenido por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan cifras de VRAM; el modelo esta disenado para ejecutarse tambien en CPU.
- Tamano en disco por configuracion: recomendada 280 MB (bf16 + codec f16), reducida 169 MB (q8_0 + codec q8_0), telefonos 151 MB (q8_0 + codec q8_0-lm-q8_0), minima 114 MB (q4_0 + codec q4_k_m).
- GPU: compatible con CUDA, Vulkan y Metal; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo y en CPUs ARM; la variante q8_0 con codec q8_0-lm-q8_0 esta optimizada para telefonos.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp (que incluye llama.cpp), y el paquete Python `codec_cpp` (requiere CMake y compilador C++).
- Latencia y throughput: no disponibles.
- Nota de compilacion: MOSS-TTS-Nano funciona en codec.cpp a partir del pull request #7, por lo que debe compilarse desde esa rama hasta su fusion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables (por ejemplo, otros TTS multilingues con clonacion de voz). La comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M-GGUF | 41.775.744 | no disponible | 10 | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay voces integradas: cada sintesis exige una muestra de audio de referencia limpia y corta; sin ella el modelo no puede generar voz.
- El ajuste de muestreo es delicado: mantener top-p en 1.0 es critico, ya que un valor inferior puede truncar la decision de fin de habla y provocar que la sintesis continue indefinidamente.
- La informacion no documenta sesgos conocidos ni tasas de alucinacion; al ser un modelo TTS, el riesgo principal es la generacion de prosodia o pronunciacion incorrecta, no de contenido factual.
- No se detallan limitaciones de longitud de contexto ni de duracion maxima de audio por sintesis.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base OpenMOSS-Team/MOSS-TTS-Nano-100M y el uso de voces clonadas conforme a la legislacion aplicable.
- La clonacion de voz plantea riesgos de suplantacion de identidad y requiere consentimiento explicito de la persona cuya voz se replica.
- Requiere compilar codec.cpp desde el pull request #7 hasta su fusion, lo que anade complejidad de despliegue y riesgo de cambios en la API.
- El paquete Python necesita CMake y un compilador de C++, lo que puede complicar entornos gestionados o contenedores minimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BricksDisplay/MOSS-TTS-Nano-100M-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Repositorio codec.cpp: https://github.com/mybigday/codec.cpp
- Pull request de soporte MOSS-TTS-Nano: https://github.com/mybigday/codec.cpp/pull/7
- Documentacion Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- Instrucciones de compilacion TTS de codec.cpp: https://github.com/mybigday/codec.cpp#text-to-speech
- llama.cpp: https://github.com/ggml-org/llama.cpp
- MOSI.AI: https://mosi.cn
- OpenMOSS: https://www.open-moss.com/
