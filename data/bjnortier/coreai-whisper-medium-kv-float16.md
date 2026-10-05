# bjnortier/coreai-whisper-medium-kv-float16

## Resumen

`bjnortier/coreai-whisper-medium-kv-float16` es una exportación del modelo `openai/whisper-medium` al formato nativo Core AI de Apple, pensada para reconocimiento automático del habla (ASR) en local sobre silicio de Apple. No se trata de pesos PyTorch: el repositorio contiene un único archivo comprimido con activos `.aimodel` que se ejecutan a través del runtime Core AI de Apple en macOS 27 / iOS 27 o versiones posteriores, y no son cargables con `transformers`.

El autor es bjnortier, un desarrollador independiente, y el trabajo consiste exclusivamente en un cambio de formato de serialización sobre el modelo original de OpenAI, que sigue siendo la referencia de entrenamiento, datos y evaluación. La relevancia actual del repositorio está en habilitar la transcripción de voz multilingüe directamente en el dispositivo, sin depender de servicios en la nube, lo que reduce latencia, coste y exposición de datos de audio.

Arquitectónicamente es el encoder/decoder transformer de Whisper medium (aproximadamente 769 millones de parámetros), con una ventana de audio de 30 segundos, 1024 dimensiones de modelo, 24 capas de decoder y una caché KV de atención cruzada empaquetada en precisión float16. El repositorio pesa 1,4 GB y arrastra una configuración de prefijo de decoder que, por defecto, fuerza el idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder/decoder (transformer) |
| Parametros totales | ~769 millones (heredados de `openai/whisper-medium`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s; 448 posiciones maximas de decodificacion |
| Tipos de cuantizacion | float16 (unica precision del export) |
| Idiomas soportados | 99 idiomas (multilingue; lista completa mas abajo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); no safetensors, GGUF ni PyTorch |

Lista de idiomas declarados en el repositorio: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su.

Detalles de configuracion del bundle (de `metadata.json`): `d_model` = 1024, capas de decoder = 24, cabezas de atención = 16, vocabulario = 51865, posiciones máximas de destino = 448, bandas mel = 80, audio de entrada a 16 kHz mono float32.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un encoder que procesa espectrogramas mel de 80 bandas sobre ventanas de 30 segundos, y un decoder autorregresivo con atención cruzada sobre la salida del encoder. En este export concreto, la caché KV de la atención cruzada viene empaquetada ("packed cross-attention KV cache") y todo el modelo se serializa en float16. El bundle separa el encoder (`encoder.aimodel`) del decoder (`decoder.aimodel`) e incluye `generation_config.json`, ficheros de tokenizador y `added_tokens.json` con los tokens especiales de idioma y tarea.

No ha habido entrenamiento nuevo: el autor solo cambia el formato de serialización, de modo que los datos de entrenamiento, el pipeline de etiquetado débil y cualquier ajuste posterior son los del Whisper medium original de OpenAI, no documentados en esta ficha del repositorio (según la publicación de Whisper, el modelo se entrenó sobre cientos de miles de horas de audio multilingüe supervisado de forma débil, si bien este repositorio remite al modelo base para esos detalles). La innovación técnica relevante aquí no es de modelado, sino de empaquetado: convertir pesos a activos Core AI ejecutables en el dispositivo y permitir que el prefijo del decoder determine el idioma de transcripción.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe sobre audio de 16 kHz mono, en ventanas de 30 segundos.
- Transcripción de voz a texto en 99 idiomas, siempre que se configure correctamente el token de idioma del decoder.
- Detección automática de idioma: el primer token que predice Whisper tras `<|startoftranscript|>` es el idioma, por lo que la detección cuesta un único paso de decoder.
- Traducción implícita al inglés: con el prefijo `<|en|>` fijo, audio en otro idioma se transcribe "como si" fuera inglés y se devuelve una traducción fluida en inglés.
- Ejecución en el dispositivo sobre silicio de Apple mediante el runtime Core AI, sin necesidad de servidor ni conectividad.
- Reutilización del idioma detectado en audio largo: se detecta una vez sobre la primera ventana y se mantiene.
- No soporta tool calling ni function calling (es un modelo de ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- No genera marcas de tiempo por defecto: el prefijo fija `<|notimestamps|>` y habilitarlas requiere otro `generation_config.json`.
- No tiene capacidades de visión ni de audio además de la transcripción.

## Casos de uso

- Transcripción local en aplicaciones iOS y macOS: integrando el bundle a través de `CoreAISpeech` (de `apple/coreai-models`) o de `CirceKit`, la app puede convertir notas de voz a texto sin enviar el audio a ningún servidor.
- Dictado y entrada de voz en apps de productividad: con una ventana de 30 segundos por fragmento y ejecución on-device, se puede ofrecer dictado continuo con baja latencia percibida.
- Accesibilidad y subtitulado: generación de transcripciones para personas con discapacidad auditiva en contenido pregrabado, usando la ventana de 30 s y el idioma configurado por locale.
- Actas y resúmenes de reuniones: transcribir grabaciones y alimentar después un LLM de resumen; el ASR se ejecuta en local y solo el texto sale del dispositivo.
- Traducción de audio a inglés: con el prefijo `<|en|>` (el valor por defecto del bundle), audio en cualquier idioma se devuelve como texto en inglés, útil para subtitulado cruzado.
- Asistentes de voz y comandos locales: transcripción de comandos de voz en el dispositivo que se pasan después a un motor de intenciones o a un LLM local, evitando enviar el audio a la nube.
- Aplicaciones con requisitos de privacidad o cumplimiento: entornos donde el audio no puede salir del dispositivo (sanidad, banca, sector público) se benefician de la ejecución totalmente local.
- Procesamiento por lotes en Mac: transcripción de archivos de audio en cadena con `CirceFileTranscriber` para pipelines de posproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de WER, latencia ni throughput, y remite al modelo base para cualquier evaluación.

El único dato medido que aparece en la model card es una observación sobre configuración incorrecta: en un clip en francés transcrito con el prefijo `<|en|>` por defecto, el resultado puntuó aproximadamente un 96 % de WER frente a una referencia en francés, pese a producir una frase en inglés perfectamente legible. Es un indicador de que un idioma mal fijado falla de forma silenciosa, no una métrica de calidad del modelo.

## Requisitos de hardware

- Plataforma: silicio de Apple (Apple silicon) con macOS 27 o iOS 27 y posteriores, ejecutando el runtime Core AI.
- Almacenamiento: el repositorio ocupa 1,4 GB y el archivo `whisper-medium-kv_float16.zip` pesa ~1,41 GB.
- Memoria: el bundle en float16 con caché KV empaquetada requiere del orden de 1,4-2 GB de memoria en el dispositivo; no se especifica cifra oficial.
- Cabe en hardware de consumo: sí, en equipos y dispositivos Apple silicon (no es un modelo pensado para GPU dedicada de servidor).
- No es compatible con vLLM, llama.cpp, Ollama, TGI ni con `transformers`, ya que los activos son `.aimodel` y no pesos estándar.
- Opciones de despliegue: `CoreAISpeech` de `apple/coreai-models` o `CirceKit` (fork de bjnortier). Para selección de idioma se necesita el fork, ya que el upstream no expone API para cambiar el prefijo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este export (coreai-whisper-medium-kv-float16) | ~769 M | 30 s | 99 | Apache 2.0 | `.aimodel` (Core AI) |
| `openai/whisper-medium` (original) | ~769 M | 30 s | 99 | Apache 2.0 | PyTorch / safetensors |
| `openai/whisper-large-v3` | ~1550 M | 30 s | 99 | Apache 2.0 | PyTorch / safetensors |
| `openai/whisper-small` | ~244 M | 30 s | 99 | Apache 2.0 | PyTorch / safetensors |

Diferencias clave: el export de este repositorio conserva exactamente las capacidades del Whisper medium pero cambia el formato a Core AI y añade caché KV empaquetada en float16 para ejecución en el dispositivo; a diferencia del original, no se puede cargar con `transformers` ni con herramientas de inferencia estándar, y por defecto fija el idioma inglés. Frente a `whisper-large-v3` ofrece menor precisión potencial pero menor tamaño (1,4 GB frente a varios GB) y ejecución local en Apple silicon; frente a `whisper-small`, más parámetros y presumiblemente mayor calidad, a costa de más memoria.

## Limitaciones y advertencias

- Idioma fijado por defecto: el prefijo del decoder apunta a `<|en|>` (token 50259); audio en otro idioma no falla, sino que se transcribe "como si" fuera inglés y devuelve una traducción en inglés, con alto WER frente a la referencia real (se midió ~96 % en un clip en francés). Es un fallo silencioso que exige comprobar el idioma.
- El upstream `apple/coreai-models` no permite cambiar el prefijo; sin el fork de bjnortier, el bundle solo transcribe inglés de forma fiable.
- Marcas de tiempo deshabilitadas por defecto: el prefijo fija `<|notimestamps|>`; habilitarlas requiere modificar `generation_config.json`.
- Formato propietario: no carga con `transformers`, vLLM, llama.cpp, Ollama ni TGI; queda limitado al runtime Core AI en Apple silicon con macOS 27 / iOS 27 o superior.
- Riesgo de alucinación: es un modelo Whisper y, como tal, puede generar texto plausible en tramos de silencio, ruido o audio de baja calidad.
- La calidad de transcripción varía mucho entre los 99 idiomas; los de menos recursos suelen dar más errores.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento más allá de la model card.
- Licencia Apache 2.0: permite uso comercial, pero el autor solo cambia la serialización; conviene revisar la licencia y las condiciones del modelo base de OpenAI.
- No se documentan sesgos, datos de entrenamiento ni evaluación en este repositorio; hay que consultar la model card de `openai/whisper-medium`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bjnortier/coreai-whisper-medium-kv-float16
- Modelo base: https://huggingface.co/openai/whisper-medium
- `apple/coreai-models`: https://github.com/apple/coreai-models
- Fork de bjnortier: https://github.com/bjnortier
- CirceKit: https://github.com/bjnortier
- Apple Core AI (documentación para desarrolladores): https://developer.apple.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
