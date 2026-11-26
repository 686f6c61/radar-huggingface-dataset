# borisbat/dasllama-tts

## Resumen

dasLLAMA TTS es una colección de modelos de sintesis de voz (text-to-speech) empaquetados en formato GGUF para ser servidos por el motor de inferencia dasLLAMA, integrado en el proyecto daslang de Gaijin Entertainment. El repositorio agrupa cuatro familias de voces: KittenTTS nano y mini (0.8), Kokoro-82M v1.0 con sus 54 packs de voz, y kokoro-ru v2, el ajuste fino ruso de Kokoro-82M con voces como `sveta`, `masha` y `dima`. Ademas incluye Kyutai Pocket TTS, un modelo de lenguaje de audio continuo que lee texto y clona voz a partir de un clip.

El paquete no es un unico modelo neuronal monolitico, sino un conjunto de pesos y packs de datos que comparten una fachada comun: un front-end de texto nativo escrito en daslang (normalizador ingles, etiquetador gramatical y paso grafema-a-fonema; normalizador ruso, paso de acentuacion y paso letra-a-sonido). No depende de espeak-ng ni de phonemizer: el conocimiento linguistico vive en los packs `tts_g2p.bin` y `tts_g2p_ru.bin`.

La relevancia actual radica en su enfoque de despliegue: pesos cuantizados en tres variantes (f32, Q8_0 y una mezcla Q4_K/Q6_K), sin necesidad de convertir pesos en tiempo de carga, lo que reduce latencia de arranque y huella en disco. El repositorio ocupa 7,2 GB y acumula 2263 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (KittenTTS nano/mini, Kokoro-82M, kokoro-ru); modelo de lenguaje de audio continuo (Pocket TTS) |
| Parametros totales | 76.639.408 (dato safetensors del repo); por checkpoint: Kokoro-82M ~82M, KittenTTS mini ~296 MB f32, KittenTTS nano ~59 MB f32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, Q8_0, mixta Q4_K + Q6_K (convs) + Q8_0 (grupos) |
| Idiomas soportados | en (en-US, en-GB), ru, de, es, it, pt, fr |
| Licencia | other / per-file (ver THIRD_PARTY_NOTICES.md del proyecto daScript) |
| Formato de pesos | GGUF; packs binarios propios (`tts_g2p.bin`, `tts_g2p_ru.bin`) |

## Arquitectura y entrenamiento

La linea principal sigue StyleTTS2, una arquitectura de sintesis neuronal con componentes de estilo, discriminador y decodificador de audio, de la que derivan KittenTTS (nano y mini) y Kokoro-82M. Kokoro-82M v1.0 incorpora 54 packs de voz empaquetados en el propio GGUF. El ajuste ruso kokoro-ru v2 parte del checkpoint base y anade packs de voz especificos (`sveta`, `masha` en un checkpoint; `dima` en otro). Pocket TTS, de Kyutai, es un modelo de lenguaje sobre audio continuo que permite clonar voz desde un clip de referencia.

El repositorio no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es el front-end linguistico como datos: el pack `tts_g2p.bin` contiene los lexicos gold y silver de misaki en ambos dialectos ingleses, CMUdict 0.7a renderizado al inventario americano y el modelo GRU de deletreo de g2p_en. El pack ruso `tts_g2p_ru.bin` incluye todas las formas flexionadas del diccionario OpenRussian, lecturas de Wiktionary y nombres marcados por Wikipedia rusa, con su vocal acentuada. Opcionalmente se puede anadir un modelo de desambiguacion de acento (`ru-stress-rubert-base-q4.gguf` o `ru-stress-ruelectra-small-q4.gguf`) que elige la lectura correcta segun el contexto de la frase.

## Capacidades

- Sintesis de voz a partir de texto en ingles (US y GB) con KittenTTS nano, mini y Kokoro-82M.
- Sintesis en ruso con kokoro-ru v2 y las voces `sveta`, `masha` y `dima`.
- Clonacion de voz a partir de un clip de audio mediante Pocket TTS.
- Normalizacion de texto y conversion grafema-a-fonema sin dependencias externas (sin espeak-ng ni phonemizer).
- Acentuacion automatica en ruso con resolucion de homografos por contexto (`з+амок` frente a `зам+ок`, `все` frente a `всё`).
- Soporte de siete idiomas declarados en metadatos (en, ru, de, es, it, pt, fr), si bien las voces empaquetadas se centran en ingles y ruso.
- Multiples formatos de cuantizacion para equilibir calidad y velocidad.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo TTS, no conversacional.

## Casos de uso

- Narracion de articulos y blogs: Kokoro-82M con sus 54 voces permite generar audio de forma local en un servidor modesto, eligiendo timbre por seccion o por autor.
- Asistentes de voz para aplicaciones de escritorio: KittenTTS nano en su variante `kitten-nano-q8.gguf` (16,6 MB) se integra en binarios ligeros sin dependencias de Python ni de espeak.
- Audiolibros en ruso: kokoro-ru v2 con `sveta`, `masha` o `dima` y el pack de acentuacion resuelve la lectura correcta de homografos, critica en narracion larga.
- Prototipado de clonacion de voz: Pocket TTS permite generar una voz sintetica a partir de un clip de referencia para demos y pruebas de concepto.
- Sistemas de accesibilidad: lectura en pantalla con latencia baja gracias a los pesos Q8_0 preempaquetados, que evitan la conversion en tiempo de carga.
- Localizacion de contenido: el front-end con normalizadores separados permite generar versiones en ingles y ruso del mismo texto con un unico motor.
- Integracion en pipelines de CI para generar avisos hablados o resumenes de builds, aprovechando el tamano reducido de los modelos nano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MOS, WER, latencia ni comparativas numericas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para cualquiera de los checkpoints en Q8_0 o KQ; Kokoro-82M en f32 ocupa unos 353 MB en disco y una fraccion similar en memoria al cargar.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior sobra para inferencia en tiempo real.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM; tambien en CPU para los modelos nano y mini.
- Opciones de despliegue: el motor nativo es dasLLAMA (modulo `dasLLAMA` de daScript); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF aqui es propio del ecosistema daslang y los packs binarios son especificos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dasLLAMA TTS (Kokoro-82M) | ~82M | no disponible | en, ru (+5 declarados) | per-file | GGUF propio |
| Kokoro-82M original | 82M | no disponible | en | Apache 2.0 (segun el proyecto original) | safetensors / ONNX |
| KittenTTS | nano ~0.8, mini ~0.8 | no disponible | en | no disponible | safetensors |
| Piper TTS | variable (VITS) | no disponible | multiples | MIT | ONNX |

La comparativa se limita a la familia de origen porque el empaquetado GGUF de dasLLAMA es especifico de su motor y no es intercambiable con los formatos de los proyectos upstream.

## Limitaciones y advertencias

- La licencia es `per-file` y remite a `THIRD_PARTY_NOTICES.md` del repositorio daScript; es imprescindible revisar los terminos de cada componente antes de uso comercial.
- El campo `language` de Hugging Face solo declara `en`, aunque la model card lista siete idiomas; la cobertura real de voces empaquetadas es ingles y ruso.
- No se documentan sesgos de voz, acento o genero mas alla de los packs incluidos.
- Riesgo de alucinacion fonetica en palabras fuera del lexico: el front-end depende de los packs `tts_g2p.bin` y `tts_g2p_ru.bin`, y las palabras desconocidas se resuelven con el modelo GRU o reglas, con posible error de pronunciacion.
- La acentuacion rusa requiere opcionalmente el modelo de contexto; sin el, los homografos pueden resolverse con la lectura mas frecuente y no con la correcta.
- El formato GGUF y los packs son propios de dasLLAMA; no son directamente utilizables en llama.cpp, Ollama ni vLLM.
- No hay benchmarks publicados que permitan estimar calidad subjetiva (MOS) ni comparar con alternativas.
- El repositorio pesa 7,2 GB por incluir todas las variantes; conviene descargar solo los ficheros necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/borisbat/dasllama-tts
- Repositorio daScript / modulo dasLLAMA: https://github.com/GaijinEntertainment/daScript
- Avisos de terceros (licencia): https://github.com/GaijinEntertainment/daScript/blob/master/modules/dasLLAMA/THIRD_PARTY_NOTICES.md
- Kokoro-82M (modelo upstream): no disponible en la informacion proporcionada
- KittenTTS (modelo upstream): no disponible en la informacion proporcionada
- Kyutai Pocket TTS: no disponible en la informacion proporcionada
