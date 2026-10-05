# bjnortier/coreai-whisper-large-v3-kv-float16

## Resumen

bjnortier/coreai-whisper-large-v3-kv-float16 es una exportación del modelo de reconocimiento automático del habla (ASR) openai/whisper-large-v3 al formato propietario de Apple Core AI. No se trata de pesos PyTorch, sino de un archivo de assets `.aimodel` que se ejecuta a través del runtime Core AI de Apple en macOS 27 / iOS 27 o superior, pensado para reconocimiento de voz en el propio dispositivo (on-device) sobre silicio de Apple. El autor, bjnortier, no entrena un modelo nuevo: únicamente cambia el formato de serialización de Whisper large-v3, cuyos pesos permanecen intactos.

El bundle ocupa unos 2,85 GB dentro de un repositorio de 2,9 GB y se distribuye como un único ZIP con encoder y decoder separados en precisión float16, con la caché KV de atención cruzada empaquetada. La arquitectura reproduce la de Whisper large-v3 (encoder/decoder transformer, d_model 1280, 32 capas de decoder, 20 cabezas de atención, vocabulario de 51866 tokens y ventana de audio de 30 segundos), de modo que hereda su cobertura multilingüe completa.

Su relevancia actual radica en que permite ejecutar transcripción multilingüe sin conexión ni servidores externos en el ecosistema Apple, algo útil para privacidad y latencia. La principal advertencia es que, con el `generation_config.json` incluido, el prefijo de decoder fija `<|en|>`, por lo que el runtime estándar de Apple solo transcribe correctamente en inglés; el fork del autor añade la selección de idioma para aprovechar el resto de lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder/decoder (transformer) |
| Parametros totales | ~1550 M (heredados del modelo base openai/whisper-large-v3; el bundle no los declara explicitamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (audio rellenado a la ventana); maximo 448 posiciones objetivo en el decoder |
| Tipos de cuantizacion | float16 (unica precision del bundle); cache KV de atencion cruzada empaquetada |
| Idiomas soportados | 99 idiomas segun la lista del repositorio (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), empaquetado en `whisper-large-v3-kv_float16.zip`; no compatible con `transformers` |

Otros datos de configuracion del bundle: d_model 1280, 32 capas de decoder, 20 cabezas de atencion, vocabulario 51866, max target positions 448, 128 mel bins, audio de entrada 16 kHz mono float32.

## Arquitectura y entrenamiento

El modelo es un transformer encoder/decoder con la topologia exacta de Whisper large-v3: un encoder que procesa espectrogramas mel de 128 bins sobre ventanas de 30 segundos y un decoder autorregresivo de 32 capas con d_model 1280 y 20 cabezas. Esta exportación separa ambos componentes en dos assets (`encoder.aimodel` y `decoder.aimodel`), ejecuta en float16 y empaqueta la caché KV de la atención cruzada para acelerar la decodificación. Los pesos son los de openai/whisper-large-v3 sin modificar; el repositorio solo altera la serialización.

No se proporciona en la información disponible ningún detalle sobre el conjunto de datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, ya que el entrenamiento corresponde a OpenAI y el autor remite a la model card de openai/whisper-large-v3. Como innovación específica de esta exportación, el ZIP incluye `generation_config.json` con un prefijo de decoder forzado (que fija el idioma `<|en|>` y `<|notimestamps|>`) y `added_tokens.json` con los tokens especiales de idioma y tarea mapeados a sus identificadores. El fork del autor añade selección de idioma mediante detección en un único paso de decoder (la primera predicción tras `<|startoftranscript|>` es el token de idioma) y reutiliza la detección en la primera ventana para audio largo.

## Capacidades

- Reconocimiento automático del habla (transcripción) sobre audio de 16 kHz mono en ventanas de 30 segundos.
- Transcripción multilingüe: los pesos cubren los 99 idiomas listados; el idioma efectivo depende del prefijo de decoder.
- Detección automática de idioma (un paso de decoder) en el fork de bjnortier, reutilizada para audio de formato largo.
- Traducción implícita: si se fuerza el prefijo en inglés sobre audio en otro idioma, el modelo produce una traducción fluida al inglés en lugar de la transcripción original (comportamiento propio de Whisper).
- Ejecución on-device mediante el runtime Apple Core AI, sin acceso a red.
- Integración con `CoreAISpeech` (apple/coreai-models) y con `CirceFileTranscriber` (CirceKit).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No genera marcas de tiempo con el bundle tal cual, porque el prefijo incluye `<|notimestamps|>`; habilitarlas requeriría otro `generation_config.json`.

## Casos de uso

- Dictado y transcripción local en macOS/iOS 27: el modelo convierte notas de voz en texto sin salir del dispositivo, aprovechando que el bundle se ejecuta íntegramente en el runtime Core AI y no requiere conexión.
- Subtitulado de vídeo en inglés: con la ventana de 30 s y el decoder de 448 posiciones objetivo, se pueden transcribir clips por segmentos; para marcas de tiempo habría que sustituir el `generation_config.json`.
- Actas de reuniones con privacidad: al ejecutarse on-device sobre silicio Apple, los audios confidenciales no se envían a ningún servidor, lo que encaja con entornos con requisitos de cumplimiento.
- Transcripción de atención al cliente: para audio en inglés con el runtime estándar, o en cualquiera de los 99 idiomas si se usa el fork con selección de idioma, se pueden procesar conversaciones y volcar el texto a un CRM.
- Aplicaciones de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en apps nativas de Apple, sin dependencia de APIs en la nube.
- Traducción aproximada al inglés de audio en otros idiomas: forzando el prefijo `<|en|>` se obtiene una traducción legible al inglés, útil como primera pasada, aunque el autor advierte que el idioma queda silenciado salvo que se verifique explícitamente.
- Procesado por lotes en pipelines de audio: mediante `CirceFileTranscriber` y ficheros de audio locales, se puede integrar la transcripción en flujos automatizados de posproducción o archivado dentro del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni métricas ASR estándar (WER por idioma) en la model card, y remite a la model card de openai/whisper-large-v3 para resultados de evaluación.

El único dato medido que se aporta es una observación del propio autor: alimentando un clip en francés a un prefijo `<|en|>`, el modelo transcribe el audio como si fuera inglés y devuelve una traducción fluida en inglés, con un WER de aproximadamente el 96 % frente a la referencia en francés. El autor lo presenta como advertencia sobre el fallo silencioso de idioma, no como benchmark oficial.

## Requisitos de hardware

- El bundle pesa unos 2,85 GB (float16), por lo que el espacio de almacenamiento y la memoria mapeada deben cubrir ese tamaño más el overhead del runtime.
- Requiere hardware Apple y sistema operativo macOS 27 / iOS 27 o superior; no se ejecuta en GPU NVIDIA ni en CPU x86 convencional mediante esta exportación.
- No es compatible con `transformers`, `llama.cpp`, vLLM, TGI, Ollama ni servidores de inferencia convencionales: solo se carga con el runtime Apple Core AI.
- Opciones de despliegue: `CoreAISpeech` de apple/coreai-models y `CirceFileTranscriber` de CirceKit (o el fork de bjnortier para selección de idioma).
- No se proporcionan datos de latencia ni de throughput en la información disponible.
- El consumo real de memoria depende del dispositivo Apple concreto; no hay cifras de VRAM equivalentes publicadas para este formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| bjnortier/coreai-whisper-large-v3-kv-float16 | ~1550 M | Audio 30 s; 448 tokens decoder | 99 | Apache 2.0 | `.aimodel` (Apple Core AI) |
| openai/whisper-large-v3 | ~1550 M | Audio 30 s; 448 tokens decoder | 99 | Apache 2.0 | PyTorch / safetensors; `transformers` |
| Formatos GGUF de Whisper (por ejemplo, conversiones a llama.cpp) | ~1550 M (segun cuantizacion) | Audio 30 s | 99 | Apache 2.0 | GGUF; llama.cpp |
| Destilaciones tipo distil-whisper | Menor que large-v3 (no disponible el dato exacto) | Audio 30 s | tipicamente solo ingles | Apache 2.0 | PyTorch / safetensors |

La diferencia clave de esta exportación frente a las alternativas es el formato y el runtime: ofrece las mismas capacidades acústicas que whisper-large-v3, pero exclusivamente en Apple Core AI y con el ajuste del prefijo de idioma como principal punto de fricción.

## Limitaciones y advertencias

- Con el runtime estándar `CoreAISpeech` de apple/coreai-models, el bundle solo transcribe inglés, porque el prefijo de decoder fija `<|en|>`; no hay API en el repositorio original para cambiarlo.
- Fallo silencioso de idioma: si se alimenta audio en otro idioma con el prefijo `<|en|>`, no se produce un error, sino una transcripción en inglés (traducción) con un WER muy alto respecto a la referencia original (el autor reporta ~96 % en francés). Hay que verificar el idioma de salida de forma explícita.
- Este bundle no genera marcas de tiempo, ya que el prefijo fija `<|notimestamps|>`; habilitarlas exige otro `generation_config.json`.
- No se ejecuta con `transformers` ni con runtimes de inferencia habituales; está atado a macOS 27 / iOS 27 o superior y a silicio Apple.
- Riesgo de alucinación inherente a los modelos Whisper en audio ruidoso, silencioso o con habla solapada; no se documentan mitigaciones específicas en esta exportación.
- Al ser un reempaquetado sin reentrenamiento, hereda los sesgos y limitaciones del modelo base openai/whisper-large-v3 (no detallados en la información disponible).
- El bundle puede ejecutar en float16 únicamente; no se ofrecen variantes cuantizadas a int8/int4 para reducir memoria.
- La licencia es Apache 2.0, la misma del modelo fuente, por lo que el uso comercial está permitido; se debe mantener la atribución a OpenAI como autor original de los pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 5 de octubre de 2026: conviene validar la estabilidad y el soporte del proyecto antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bjnortier/coreai-whisper-large-v3-kv-float16
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio del autor (fork con selección de idioma) y CirceKit: https://github.com/bjnortier
- Runtime Apple Core AI: https://github.com/apple/coreai-models
- Apple Developer (Core AI): https://developer.apple.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
