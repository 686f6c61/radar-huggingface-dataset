# bjnortier/coreai-ht5-whisper-large-v3-kv-static-float16

## Resumen

Este repositorio no contiene pesos de PyTorch ni un modelo entrenado desde cero: es una exportación del modelo de reconocimiento de voz OpenAI Whisper large-v3 al formato `.aimodel` de Apple Core AI, preparada por el desarrollador bjnortier para inferencia totalmente local en silicio de Apple. El bundle incluye un encoder de audio, un decoder de texto de forma fija con caché KV de atención cruzada empaquetada y los ficheros de tokenizador y configuración de generación necesarios. Se distribuye como un único archivo ZIP de aproximadamente 2,85 GB con precisión float16 y requiere macOS 27 o iOS 27 (o versiones posteriores), además del runtime Core AI; no se carga con `transformers`.

La variante `-kv-static` fija todas las formas de entrada del decoder para que la GPU pueda especializarlas una sola vez en lugar de recompilar en cada token: el decoder recibe `position_ids` con forma `[1, 1]`, escribe la nueva K/V en esa posición y atiende sobre las 448 ranuras de caché bajo una máscara. Es un experimento de aceleración del decoder, no una mejora de calidad. La model card advierte además de una trampa importante: el prefijo forzado del decoder fija el token `<|en|>`, de modo que, con la librería oficial `apple/coreai-models`, el bundle transcribe únicamente inglés y, alimentado con audio en otro idioma, devuelve una traducción fluida al inglés en lugar de un error.

El interés práctico del modelo está en el despliegue: transcripción multilingüe (99 idiomas en los pesos originales de Whisper large-v3) sin conexión y sin salir del dispositivo, con licencia Apache 2.0. A cambio, exige un fork concreto de `CoreAISpeech` para seleccionar idioma, no emite timestamps con la configuración incluida y está atado a una versión de sistema operativo muy reciente. El repositorio tiene cero descargas y cero likes en el momento de la consulta: es un artefacto fijado por commit para la aplicación Hello Transcribe 5.1, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder/decoder de Whisper (exportado a Apple Core AI); decoder de forma fija con caché KV de atención cruzada empaquetada |
| Parámetros totales | 1,55 B (heredados de openai/whisper-large-v3) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 448 posiciones máximas de decoder (`max target positions`); ventana de audio de 30 s por pasada |
| Tipos de cuantización | Solo float16; el repositorio no ofrece variantes cuantizadas (int8, int4, GGUF) |
| Idiomas soportados | 99 idiomas en los pesos (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su); por defecto el prefijo fuerza inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), empaquetados en `ht5-whisper-large-v3-kv-static_float16.zip` (~2,85 GB); no hay safetensors ni GGUF |
| Dimensión del modelo (d_model) | 1280 |
| Capas del decoder | 32 |
| Cabezas de atención | 20 |
| Vocabulario | 51 866 tokens |
| Entrada de audio | 16 kHz, mono, float32; bins mel: 128 |
| Precisión | float16 |
| Compatibilidad | macOS 27 / iOS 27 o posterior, runtime Core AI |

## Arquitectura y entrenamiento

No hay entrenamiento propio: los pesos son los de OpenAI Whisper large-v3, un transformer encoder/decoder con 32 capas de decoder, `d_model` 1280, 20 cabezas de atención y vocabulario de 51 866 tokens. Lo que cambia este repositorio es exclusivamente la serialización y la topología de ejecución. El encoder procesa ventanas de 30 s de audio a 16 kHz con 128 bins mel; el decoder genera texto autorregresivamente sobre un máximo de 448 posiciones.

La innovación técnica es el decoder `-kv-static`: todas las formas de entrada están fijas, de forma que el runtime puede especializar el grafo una sola vez. El decoder recibe `position_ids` como `[1, 1]` con la posición actual, escribe la nueva clave/valor en esa ranura y atiende sobre las 448 posiciones de caché bajo máscara, con las ranuras no escritas a cero (una caché sin inicializar sigue siendo segura). Según el autor, en large-v3-turbo esta variante no fue más rápida que el decoder dinámico en CPU sobre un Mac y resultó más lenta en un iPhone 15 Pro; para decoders más profundos como este large-v3, el rendimiento no se ha medido. La model card lo describe explícitamente como un experimento y recomienda el bundle dinámico si solo se busca transcribir.

No se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni las etapas de RLHF o DPO de Whisper large-v3; la model card remite a la ficha oficial de OpenAI para esos datos. El decoder emite además `alignment_logits`, a partir de los cuales el fork de `CoreAISpeech` de bjnortier calcula el tiempo de cada palabra.

## Capacidades

- Reconocimiento de voz (ASR) en local sobre ventanas de 30 s de audio a 16 kHz, sin conexión a red.
- Transcripción multilingüe sobre 99 idiomas, siempre que se use el fork de `CoreAISpeech` con selección de idioma.
- Detección automática de idioma (`language: .detect`) con un solo paso de decoder: la primera predicción tras `<|startoftranscript|>` es el token de idioma. En audio largo se detecta una vez, en la primera ventana, y se reutiliza.
- Selección explícita de idioma (`language: .code("fr")`) o uso del prefijo original del bundle (`language: .bundleDefault`).
- Traducción implícita al inglés: al forzar el prefijo `<|en|>` sobre audio en otro idioma, el modelo produce una traducción fluida en inglés (comportamiento de Whisper, no una capacidad adicional documentada como tal).
- Alineación a nivel de palabra mediante `alignment_logits` y el fork de CoreAISpeech.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en streaming incremental: es un modelo ASR puro.
- No emite timestamps con la configuración incluida: el prefijo fija `<|notimestamps|>` y los timestamps requerirían otro `generation_config.json`.

## Casos de uso

- Dictado y notas de voz en apps de iOS y macOS: el bundle se ejecuta en el dispositivo con Core AI, de modo que el audio no abandona el terminal; adecuado para aplicaciones de salud, legal o enterprise con requisitos de privacidad estrictos.
- Transcripción offline en campo: técnicos, periodistas o personal sanitario que trabajan sin conectividad pueden procesar grabaciones de hasta 30 s por ventana con un ZIP de 2,85 GB empaquetado dentro de la app.
- Generación de subtítulos con tiempos por palabra: usando el fork de CoreAISpeech y `alignment_logits` se obtiene el instante de cada palabra, lo que permite construir ficheros de subtítulos sincronizados sin servicios externos.
- Reuniones y entrevistas multilingües: con `language: .detect` en la primera ventana y reutilización del idioma detectado, un mismo binario cubre conversaciones en español, francés o alemán sin reexportar el modelo.
- Indexación y búsqueda de archivos de audio locales: transcribir una biblioteca de grabaciones en un Mac y volcar el texto a un índice de búsqueda, aprovechando que no hay cuota de API ni coste por minuto.
- Accesibilidad en tiempo real: subtitulado local de conversaciones cara a cara o de contenido reproducido en el dispositivo, con la ventaja de que no se envía audio a terceros.
- Preprocesado de voz para pipelines de NLP: convertir audio a texto en el propio dispositivo antes de aplicar resumen, clasificación o extracción de entidades con otro modelo local.
- Traducción indirecta al inglés: para flujos que solo necesitan el contenido en inglés, el prefijo `<|en|>` actúa como traducción automática de voz, útil en soporte técnico internacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni WER por idioma, y remite a la ficha de openai/whisper-large-v3 para la evaluación del modelo original.

El único dato medido que aparece es una comprobación cualitativa del autor: con el prefijo `<|en|>` sobre un clip en francés, el modelo obtiene aproximadamente un 96 % de WER contra una referencia en francés, pese a emitir una frase en inglés perfectamente legible.

| Escenario medido | Resultado reportado |
|---|---|
| Audio en francés con prefijo `<|en|>` forzado, referencia en francés | ~96 % WER (el modelo traduce en lugar de transcribir) |
| Decoder estático vs. dinámico en large-v3-turbo, CPU de un Mac | Sin ganancia de velocidad |
| Decoder estático vs. dinámico en large-v3-turbo, iPhone 15 Pro | Más lento que el dinámico |
| Decoder estático en large-v3 (este bundle) | No medido |

## Requisitos de hardware

- Plataforma obligatoria: silicio de Apple con macOS 27 / iOS 27 o posterior y el runtime Core AI. No hay soporte para CUDA, ROCm ni CPU x86.
- Huella en disco: el ZIP ocupa ~2,85 GB; los pesos en float16 de un modelo de 1,55 B parámetros rondan los 3,1 GB en memoria (estimación aritmética, no confirmada en la ficha).
- Memoria unificada: al ejecutarse sobre memoria compartida de Apple silicon, no se especifica VRAM dedicada; el presupuesto debe cubrir pesos más la caché KV de 448 posiciones por secuencia.
- Cabe en hardware de consumo Apple: la model card cita pruebas en un iPhone 15 Pro y en un Mac, ambos con el decoder estático de large-v3-turbo.
- GPU recomendadas: no disponibles; no se documentan perfiles por chip (M1, M2, M3, M4, A17 Pro, A18).
- Opciones de despliegue: exclusivamente Core AI mediante `CoreAISpeech` (oficial de `apple/coreai-models`) o el fork de bjnortier, y la capa de más alto nivel `CirceKit`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no medidos para este bundle. Para large-v3-turbo, el decoder estático no superó al dinámico en CPU de Mac y fue más lento en iPhone 15 Pro; el autor recomienda el bundle dinámico para transcripción convencional. Whisper large-v3 es, además, el más lento de la familia en decodificación, ya que ejecuta las 32 capas del decoder por cada token generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bjnortier/coreai-ht5-whisper-large-v3-kv-static-float16 | 1,55 B | 448 posiciones de decoder; 30 s de audio | `.aimodel`, Core AI, macOS/iOS 27+ | Apache 2.0 | Bundle estático fijado por commit para Hello Transcribe 5.1 |
| bjnortier/coreai-whisper-large-v3-kv-float16 | 1,55 B | 448 posiciones de decoder; 30 s de audio | `.aimodel`, Core AI | Apache 2.0 | Variante con decoder dinámico; misma tokenización y configuración de generación |
| openai/whisper-large-v3 | 1,55 B | 448 posiciones de decoder; 30 s de audio | safetensors/PyTorch, `transformers` | Apache 2.0 | Modelo de referencia, requiere GPU o CPU convencional |
| openai/whisper-large-v3-turbo | No disponible en la información proporcionada | No disponible en la información proporcionada | safetensors/PyTorch | Apache 2.0 | Citado en la ficha como término de comparación del decoder estático |

Frente al Whisper large-v3 original, este bundle no mejora la calidad: cambia el formato de serialización y la topología del decoder para ejecutarse en Core AI. Frente a la variante `-kv-float16` dinámica del mismo autor, la única diferencia es la fijación de formas del decoder; el autor no reporta ganancia medible e incluso observa regresiones en móvil. Frente a alternativas de despliegue como whisper.cpp o faster-whisper, no hay datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo de PyTorch: los `.aimodel` no se cargan con `transformers`, y el ZIP debe descomprimirse y entregarse al runtime Core AI.
- Con la librería oficial `apple/coreai-models` y su API sin parámetro de idioma, el bundle transcribe únicamente inglés. El prefijo `<|en|>` está fijado en `generation_config.json`.
- Fallo silencioso de idioma: alimentado con audio en francés, el modelo no falla, sino que traduce al inglés de forma fluida. Sobre un clip de prueba el autor midió ~96 % WER contra la referencia francesa. Cualquier verificación de calidad debe comprobar el idioma de salida, no solo la legibilidad.
- La selección y detección de idioma exige el fork de bjnortier de `CoreAISpeech`; no existe API equivalente en el repositorio upstream de Apple.
- Sin timestamps por defecto: el prefijo fija `<|notimestamps|>`; obtener marcas temporales requiere otro `generation_config.json`. La alineación por palabra depende de `alignment_logits` y del fork.
- Dependencia de plataforma muy restrictiva: macOS 27 / iOS 27 o posterior. No hay ruta de ejecución en Linux, Windows, Android ni GPUs NVIDIA.
- Ventana de audio de 30 s: el audio se rellena hasta la ventana; el manejo de audio largo (chunking con solapamiento) queda en manos de la librería de alto nivel.
- Riesgo de alucinación propio de Whisper large-v3: el modelo transcribe ruido similar a habla como palabras con alta confianza, y la decodificación es la más lenta de la familia al ejecutar 32 capas por token.
- Coste de cómputo constante por token: el decoder estático atiende siempre sobre las 448 ranuras de caché, sin salida temprana.
- Sin datos de sesgo publicados en la información disponible; los sesgos idiomáticos y dialectales de Whisper large-v3 se heredan sin modificar.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos. El autor no impone restricciones adicionales, pero el uso de Core AI está sujeto a los términos de Apple.
- Madurez: 0 descargas y 0 likes; el artefacto está fijado por commit para una aplicación concreta y puede desaparecer o quedar obsoleto si cambia el runtime Core AI.
- No incluye diarización de hablantes, detección de eventos sonoros ni ninguna capacidad que no sea ASR.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bjnortier/coreai-ht5-whisper-large-v3-kv-static-float16
- Variante con decoder dinámico: https://huggingface.co/bjnortier/coreai-whisper-large-v3-kv-float16
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Apple Core AI (documentación para desarrolladores): https://developer.apple.com
- Repositorio oficial de Apple con CoreAISpeech: https://github.com/apple/coreai-models
- Fork de CoreAISpeech con selección de idioma: https://github.com/bjnortier
- CirceKit (capa de transcripción de ficheros): https://github.com/bjnortier
- Ficha de referencia de Whisper large-v3: https://opensourcesai.com/models/whisper-large-v3/
- Análisis de ajuste de memoria de Whisper large-v3 en módulos Jetson: https://edgeaistack.ai/model-fit/whisper-large-v3/
- Registro del modelo en free2aitools: https://free2aitools.com/model/bjnortier/coreai-whisper-large-v3-kv-static-float16
