# borisbat/dasllama-tts

## Resumen

dasllama-tts es una colección de modelos de síntesis de voz (text-to-speech) convertidos al formato GGUF por el desarrollador borisbat, pensada para ser servida por dasLLAMA, el motor de inferencia del lenguaje daslang desarrollado por Gaijin Entertainment. El repositorio no contiene un único modelo, sino varios pesos de la familia StyleTTS2 (KittenTTS nano y mini, Kokoro-82M y el fine-tune ruso kokoro-ru) junto con los paquetes de datos que necesita el front-end de texto propio: normalizadores, etiquetadores gramaticales, conversores grafema-a-fonema y un paquete de acentuación del ruso. Adicionalmente incluye Pocket TTS de Kyutai, un modelo de lenguaje de audio continuo que lee texto y clona voces a partir de un clip.

La propuesta diferencial es prescindir de dependencias externas como espeak-ng o phonemizer: todo el procesamiento lingüístico previo reside en ficheros de datos (`tts_g2p.bin`, `tts_g2p_ru.bin`) que el motor carga directamente. El modelo principal, Kokoro-82M, cuenta con 76.639.408 parámetros y se distribuye en tres variantes de cuantización (f32, Q8_0 y una mezcla Q4_K/Q6_K) para adaptarse a distintos presupuestos de memoria.

El conjunto cubre siete idiomas declarados (inglés, ruso, alemán, español, italiano, portugués y francés), aunque la ficha de Hugging Face solo lista inglés como idioma de pipeline. Es relevante para quienes despliegan TTS en producción con motores nativos de bajo nivel y necesitan control total sobre el pipeline fonético, sin cadenas de dependencias frágiles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (KittenTTS nano/mini, Kokoro-82M, kokoro-ru) y modelo de lenguaje de audio continuo (Pocket TTS de Kyutai) |
| Parámetros totales | 76.639.408 (dato de safetensors; corresponde a Kokoro-82M) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f32, Q8_0, mezcla Q4_K + Q6_K + Q8_0 (variantes "kq") |
| Idiomas soportados | en, ru, de, es, it, pt, fr (según model card); pipeline declarado: en |
| Licencia | other / per-file (ver THIRD_PARTY_NOTICES.md del repositorio dasLLAMA) |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 6,8 GB |
| Librería | dasllama |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Los modelos de voz pertenecen a la estirpe StyleTTS2, una arquitectura de síntesis que combina un codificador de estilo y un decodificador acústico con alineamiento fonético implícito. KittenTTS se ofrece en dos escalas (nano 0.8 y mini 0.8), Kokoro-82M en versión v1.0 con 54 paquetes de voz, y kokoro-ru v2 como fine-tune ruso con los paquetes `sveta`, `masha` y `dima`. Pocket TTS de Kyutai es un modelo de lenguaje de audio continuo que genera habla directamente y permite clonar una voz a partir de un clip de referencia.

El front-end lingüístico es propio y basado en datos: para inglés incluye un normalizador, un etiquetador de partes de la oración y una pasada grafema-a-fonema que combina los léxicos gold y silver de misaki en ambos dialectos, CMUdict 0.7a y un modelo GRU de deletreo (`g2p_en`). Para ruso incorpora un normalizador, una pasada de acentuación sobre el paquete `tts_g2p_ru.bin` (formas flexionadas del diccionario OpenRussian, lecturas de Wiktionary y nombres de Wikipedia rusa) y una conversión letra-a-sonido. Opcionalmente se puede añadir un modelo de desambiguación de acento contextual basado en ruBert-base o ruElectra-small, afinado sobre un dataset privado y cuantizado a Q4_K. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en inglés (KittenTTS nano/mini, Kokoro-82M) y en ruso (kokoro-ru).
- Clonación de voz a partir de un clip de audio mediante Pocket TTS.
- Múltiples voces predefinidas: 54 paquetes en Kokoro-82M, dos femeninos y uno masculino en kokoro-ru.
- Procesamiento fonético nativo sin espeak-ng ni phonemizer, con paquetes de datos cargables.
- Acentuación automática del ruso con resolución de homógrafos por contexto (por ejemplo, `з+амок` frente a `зам+ок`, o `все` frente a `всё`).
- Normalización de texto y etiquetado gramatical integrados en el front-end.
- Soporte de dialectos del inglés (en-US y en-GB) mediante léxicos separados.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de voz.

## Casos de uso

- Lectura de artículos y documentos en inglés: Kokoro-82M en Q8_0 ocupa unos 96 MB, por lo que puede ejecutarse en cualquier equipo y narrar textos largos con una de sus 54 voces.
- Audiolibros en ruso: kokoro-ru con los paquetes `sveta`, `masha` o `dima` y el paquete de acentuación permite generar narración con pronunciación correcta de homógrafos, algo crítico en ruso.
- Asistentes de voz embebidos: KittenTTS nano en su variante `kq` ocupa unos 15 MB, adecuado para dispositivos con memoria muy limitada donde no cabe un TTS convencional.
- Clonación de voz para doblaje o accesibilidad: Pocket TTS permite replicar la voz de un usuario a partir de una muestra, útil en sistemas de comunicación aumentativa.
- Generación de avisos y locuciones dinámicas: integración en pipelines de CI/CD o sistemas de megafonía que necesitan sintetizar mensajes variables con baja latencia.
- Prototipado de interfaces conversacionales: el front-end basado en datos facilita iterar sobre pronunciación y normalización sin recompilar dependencias nativas.
- Investigación en fonética computacional: los paquetes `tts_g2p.bin` y `tts_g2p_ru.bin` permiten estudiar y modificar las reglas de conversión grafema-fonema de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Kokoro-82M en f32: aproximadamente 353 MB de pesos; en Q8_0, unos 96 MB; en la variante `kq`, unos 71 MB.
- KittenTTS mini: 296 MB en f32, 80 MB en Q8_0 y 60 MB en `kq`.
- KittenTTS nano: 59 MB en f32, 17 MB en Q8_0 y 15 MB en `kq`.
- kokoro-ru: 326 MB en f32, 89 MB en Q8_0 y 64 MB en `kq`.
- Modelo de acento ruso opcional: 120 MB (ruBert-base Q4_K) o 38 MB (ruElectra-small Q4_K).
- Cualquier GPU consumer moderna (RTX 3060 en adelante) puede alojar todas las variantes; las versiones `kq` caben incluso en iGPU y CPUs.
- Despliegue mediante el motor dasLLAMA (módulo `dasLLAMA` de daScript); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Formato |
|---|---|---|---|---|---|
| dasllama-tts (Kokoro-82M) | 76,6 M | en (declarado), 7 en model card | 54 | per-file | GGUF |
| dasllama-tts (KittenTTS nano) | no disponible | en | no disponible | per-file | GGUF |
| dasllama-tts (kokoro-ru) | no disponible | ru | 3 | per-file | GGUF |
| dasllama-tts (Pocket TTS) | no disponible | no disponible | clonación | per-file | GGUF |

No se dispone de información suficiente para comparar con alternativas externas como XTTS-v2, Piper o Bark en términos de rendimiento medido.

## Limitaciones y advertencias

- La licencia es `other` con condiciones por fichero; es imprescindible revisar `THIRD_PARTY_NOTICES.md` antes de cualquier uso comercial, ya que los modelos base (Kokoro, KittenTTS, Pocket TTS) pueden tener restricciones propias.
- La ficha de Hugging Face declara únicamente inglés como idioma de pipeline, pese a que la model card lista siete idiomas; conviene verificar el soporte real de cada uno.
- El modelo de desambiguación de acento ruso se entrenó sobre un dataset privado, lo que limita la reproducibilidad y la evaluación de su cobertura.
- Al ser modelos de síntesis de voz, pueden reproducir sesgos de pronunciación, prosodia o timbre presentes en los datos de entrenamiento.
- La clonación de voz con Pocket TTS plantea riesgos de suplantación y requiere consentimiento explícito y marcos legales adecuados.
- Dependencia del motor dasLLAMA: no hay soporte documentado para otros runtimes, lo que reduce la portabilidad.
- No se publican métricas objetivas (MOS, WER, latencia) que permitan validar la calidad en producción.
- El repositorio tiene 2.224 descargas y 0 likes, con actualización reciente pero adopción limitada; la madurez del ecosistema es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/borisbat/dasllama-tts
- Motor dasLLAMA (daScript): https://github.com/GaijinEntertainment/daScript
- Avisos de terceros y licencias: https://github.com/GaijinEntertainment/daScript/blob/master/modules/dasLLAMA/THIRD_PARTY_NOTICES.md
