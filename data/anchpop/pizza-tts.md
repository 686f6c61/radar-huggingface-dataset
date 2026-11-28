# anchpop/pizza-tts

## Resumen

Pizza TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por anchpop dentro del proyecto Lexide, diseñado para funcionar íntegramente en el dispositivo del usuario, tanto de forma nativa como en el navegador mediante WebAssembly. El modelo sintetiza voz mono a 24 kHz y se distribuye como paquetes independientes por idioma o variante regional, cada uno con un tamaño aproximado de 32 MB, lo que lo sitúa entre los sistemas TTS ligeros orientados a despliegue en producción sin dependencia de servidores.

La arquitectura combina un motor de inferencia escrito en Rust con cinco grafos ONNX por paquete: un codificador de texto cuantizado a 8 bits y un renderizador acústico en float16 con fuente de tono suavizada. El modelo no realiza fonemización propia: el llamador debe proporcionar espeak-ng (build fijado a la revisión ee9fa7cc) para convertir el texto a IPA antes de la síntesis. Esta separación reduce el tamaño del paquete y permite controlar la pronunciación de palabras ambiguas y cambios de idioma desde el front-end.

El modelo se entrenó mediante destilación desde los profesores acústicos StyleTTS propios de Lexide, entrenados sobre voz sintética generada con Google Gemini (47,08 horas para inglés y clips de frases y palabras por idioma para el resto). Es relevante ahora porque ofrece una alternativa Apache 2.0, ejecutable en navegador y con un rendimiento de 16,8 veces tiempo real en una sola hebra de CPU, compitiendo directamente con Piper, Kokoro y Matcha-TTS en el segmento de TTS ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline ONNX de cinco etapas (tokenizador, mapeo espeak, lista de hablantes y grafos acústicos); codificador de texto a 8 bits y renderizador en float16 con fuente de tono suavizada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (síntesis por fragmentos de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | 8 bits (parte textual) y float16 (renderizador) |
| Idiomas soportados | en, fr, de, it, es (España y Latinoamérica), pt (Brasil), ru |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (paquetes `.voca` con los cinco grafos y metadatos) |

## Arquitectura y entrenamiento

Pizza TTS no es un transformer generativo de audio al uso, sino un sistema de síntesis por etapas empaquetado en ONNX. Cada paquete `.voca` contiene un tokenizador, un mapeo de espeak, la lista de hablantes y cinco grafos ONNX que se ejecutan secuencialmente. El codificador de texto emplea pesos cuantizados a 8 bits, mientras que el renderizador acústico usa float16 e incorpora una fuente de tono suavizada para la prosodia. El motor de inferencia está escrito en Rust y puede ejecutarse de forma nativa o como worker de navegador vía WebAssembly. El nombre del archivo `.voca` es el SHA-256 del paquete completo, lo que permite verificación de integridad y versionado por contenido.

El entrenamiento se basa en destilación desde profesores acústicos StyleTTS propios de Lexide. El profesor de inglés es el modelo v11, entrenado sobre 47,08 horas de voz sintética de Google Gemini (`eng_gemini_multi_v7`). Los otros siete profesores son variantes v10 específicas por idioma, entrenadas con clips de frases y palabras generadas por Gemini (`<language>_gemini_multi_v3`). Los guiones se seleccionaron de los paquetes de idioma del proyecto. Durante la destilación, el codificador de texto del alumno aprendió a igualar al profesor sobre representaciones emparejadas del mismo texto: el profesor recibió lecturas anotadas del proyecto y el alumno recibió fonemas espeak estándar sin pistas léxicas. El renderizador acústico se hereda directamente del profesor correspondiente. La fonemización queda delegada a espeak-ng, que determina la pronunciación de palabras ambiguas y cambios de idioma.

## Capacidades

- Síntesis de voz mono a 24 kHz en el dispositivo, sin llamadas a servicios externos.
- Ejecución nativa (ONNX Runtime) y en navegador mediante WebAssembly en un worker.
- Siete idiomas y ocho variantes: inglés (`en-us`), francés (`fr-fr`), alemán, italiano, español de España, español de Latinoamérica (`es-419`), portugués de Brasil (`pt-br`) y ruso.
- Control de pronunciación mediante espeak-ng, incluyendo palabras ambiguas y cambios de idioma dentro del texto.
- Paquetes independientes por idioma de unos 32 MB, con verificación por hash SHA-256.
- API JavaScript para navegador: `loadVoice`, `loadEspeak` y `voice.speak`, que devuelve muestras y frecuencia de muestreo.
- Compatibilidad con herramientas nativas gracias a los grafos ONNX individuales y los metadatos incluidos en cada carpeta.
- No soporta clonación de voz, tool calling, agentes ni entrada multimodal; es exclusivamente TTS.

## Casos de uso

- Lectura por voz en aplicaciones web: el paquete de 32 MB se sirve como `lexide-speech/voices/` y se carga en un worker WebAssembly, permitiendo narrar contenido sin enviar texto a servidores externos y con cumplimiento de privacidad.
- Asistentes de voz offline en escritorio: el motor Rust con ONNX Runtime nativo permite integrar TTS en aplicaciones de escritorio o sistemas embebidos con CPU, sin GPU y con 16,8 veces tiempo real en una sola hebra.
- Accesibilidad en lectores de pantalla y documentos: la síntesis a 24 kHz y la disponibilidad de variantes regionales de español y portugués permiten adaptar la locución al público objetivo.
- Locución de contenido educativo o podcasts: la velocidad de 16,8× permite generar horas de audio en minutos en una CPU doméstica, con control de pronunciación vía espeak-ng para términos técnicos.
- Sistemas de navegación y avisos por voz en vehículos o kioscos: el bajo tamaño del paquete y la ejecución local encajan en entornos con conectividad limitada o requisitos de latencia estricta.
- Prototipado multilingüe en navegador: la API `loadVoice`/`speak` permite cambiar de idioma cargando el paquete correspondiente, útil para demos y pruebas de internacionalización.
- Integración en pipelines de accesibilidad de CI/CD: la verificación por hash SHA-256 de cada `.voca` facilita el control de versiones y la reproducibilidad de builds de audio.

## Benchmarks y rendimiento

El autor publica una comparativa de velocidad en inglés medida como duración del audio dividida por el tiempo de síntesis (mediana de tres pasadas sobre las mismas cinco frases, una hebra de Ryzen 9 3900X, ONNX Runtime nativo):

| Modelo | Veces tiempo real |
|---|---:|
| Paradee 8M | 33,1× |
| Pizza TTS | 16,8× |
| Matcha-TTS | 12,6× |
| nano-edge-tts | 12,5× |
| Piper Medium | 10,6× |
| Linnet en-35M | 8,5× |
| Pocket TTS 2M | 8,2× |
| Supertonic 2 | 7,7× |
| KittenTTS Nano | 5,6× |
| Pocket TTS 7M | 5,4× |
| Pocket TTS 18M | 3,4× |
| Supertonic 3 | 3,1× |
| KittenTTS Micro | 2,0× |
| Kokoro 82M | 1,2× |
| Pocket TTS 100M | 1,1× |
| KittenTTS Mini | 0,9× |

No se han publicado resultados de benchmarks de calidad de audio (MOS, WER de ASR de ida y vuelta, similitud de hablante) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el motor Rust con ONNX Runtime nativo funciona en CPU sin GPU; el benchmark del autor usa una sola hebra de Ryzen 9 3900X.
- VRAM: no aplica en el caso nativo en CPU; no se especifica requisito de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible; el diseño está orientado a CPU y navegador.
- Cabe en cualquier GPU de consumo si se ejecuta la ruta ONNX con aceleración, pero no se documentan requisitos ni rendimiento en GPU.
- Despliegue: ONNX Runtime nativo, WebAssembly en navegador (build con `pnpm install --frozen-lockfile && pnpm build`), y espeak-ng como dependencia externa para fonemización (revisión fijada ee9fa7cc).
- Latencia y throughput: 16,8× tiempo real en inglés sobre una hebra de Ryzen 9 3900X; no se publican cifras para el resto de idiomas ni para WebAssembly.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Licencia | Velocidad (× tiempo real) | Disponibilidad |
|---|---|---|---|---|---|
| Pizza TTS | ONNX + Rust/WASM, espeak-ng externo | 8 variantes en 7 idiomas | Apache 2.0 | 16,8× | Hugging Face, paquetes de 32 MB |
| Piper Medium | TTS ligero en CPU | Múltiples (no detallado) | No disponible en la información | 10,6× | No disponible en la información |
| Matcha-TTS | TTS acústico | No disponible | No disponible | 12,6× | No disponible en la información |
| Kokoro 82M | TTS de mayor tamaño | No disponible | No disponible | 1,2× | No disponible en la información |

La comparativa se limita a la velocidad publicada por el autor; no hay datos de calidad, parámetros ni licencia de los modelos alternativos en la información disponible.

## Limitaciones y advertencias

- La fonemización depende de espeak-ng con una revisión concreta (ee9fa7cc, 19 de noviembre de 2026); versiones anteriores pueden emitir una ʲ de enlace y afectar al ruso, que tiene consonantes palatalizadas significativas.
- Un fonema fuera del inventario del modelo puede hacer fallar la síntesis; por ejemplo, texto inglés dentro de una entrada rusa puede producir un /ʊ/ no soportado.
- El modelo no incluye fonemizador propio: el llamador debe integrar espeak-ng y sus diccionarios, lo que añade complejidad de despliegue.
- El entrenamiento se basa en voz sintética de Google Gemini, lo que puede introducir artefactos o sesgos propios de la voz generada y no está documentado el perfil de hablantes.
- No hay datos publicados de calidad perceptual (MOS), sesgos demográficos ni tasas de alucinación o error de pronunciación.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre la voz sintética de Gemini usada en el entrenamiento.
- El rendimiento medido solo cubre inglés en una CPU concreta; no hay cifras de latencia en WebAssembly ni para otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anchpop/pizza-tts
- Demo y benchmark: https://anchpop.github.io/lexide/pizza/
- Repositorio del proyecto Lexide (motor y adaptador espeak para navegador): https://github.com/anchpop/lexide
- Instrucciones del adaptador espeak para web: https://github.com/anchpop/lexide/tree/main/tts/web-espeak
- espeak-ng, revisión fijada: https://github.com/espeak-ng/espeak-ng/commit/ee9fa7cc4704d683020526f47a9655f14c8d5f4c
