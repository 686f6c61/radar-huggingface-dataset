# bjnortier/coreai-ht5-whisper-medium-kv-static-float16

## Resumen

Este repositorio no contiene pesos de PyTorch, sino un export para Apple Core AI del modelo `openai/whisper-medium` de OpenAI, empaquetado por el desarrollador independiente bjnortier. Se trata de un archivo `.aimodel` (encoder y decoder separados) que se ejecuta exclusivamente sobre el runtime Core AI de Apple en macOS 27 / iOS 27 o superior, con el objetivo de hacer reconocimiento de voz en el dispositivo (on-device) en silicio de Apple sin depender de la nube. El bundle ocupa 1,41 GB y usa precisión float16.

La particularidad tecnica es que es la variante `-kv-static`: el decodificador tiene todas las formas de entrada fijas, recibe `position_ids` como `[1, 1]` y escribe la nueva clave/valor en esa posición, atendiendo sobre las 448 posiciones de caché bajo una máscara. La intención es que la GPU especialice el grafo una sola vez en lugar de recompilarlo por token. El propio autor lo describe como un experimento: en large-v3-turbo no fue más rápido que el decodificador dinámico en CPU en un Mac y resultó más lento en un iPhone 15 Pro, y para este medium (decodificador más profundo) no hay mediciones publicadas.

El modelo es el Whisper medium multilingüe completo (99 idiomas), pero el `generation_config.json` fija el prefijo `<|en|>` en la ranura de idioma del decodificador. Con `CoreAISpeech` de serie, el bundle transcribe solo inglés; para el resto de idiomas hace falta el fork de `CoreAISpeech` del autor, que permite seleccionar o detectar el idioma sin reexportar los assets.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder/decoder (transformer), exportado a Apple Core AI (`.aimodel`) |
| Parametros totales | no indicado en la model card; el checkpoint upstream `openai/whisper-medium` declara ~769 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por pasada (audio rellenado a la ventana); máximo de 448 posiciones objetivo en el decodificador |
| Tipos de cuantizacion | solo float16; no se publican variantes int8, int4 ni GGUF |
| Idiomas soportados | 99 idiomas (la lista completa de Whisper medium); el prefijo forzado por defecto es `<|en|>` |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` de Apple Core AI dentro de `ht5-whisper-medium-kv-static_float16.zip` (~1,41 GB); no hay safetensors, bin ni GGUF |
| Dimension del modelo (d_model) | 1024 |
| Capas del decodificador | 24 |
| Cabezas de atencion | 16 |
| Vocabulario | 51.865 tokens |
| Bins mel | 80 |
| Audio de entrada | 16 kHz, mono, float32 |
| Caché KV | cross-attention empaquetada; 448 posiciones estáticas con máscara (las no escritas quedan a cero) |
| Ficheros del bundle | `metadata.json`, `encoder.aimodel`, `decoder.aimodel`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `added_tokens.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un encoder que consume espectrogramas mel de 80 bins sobre ventanas de 30 segundos y un decodificador autorregresivo de 24 capas, 16 cabezas y d_model 1024, con vocabulario de 51.865 tokens. Sobre ese backbone, el export introduce dos decisiones de ingeniería: el decodificador es de forma fija (`-kv-static`), de modo que todas las entradas tienen dimensiones constantes y la GPU puede especializar el grafo una vez; y la caché de cross-attention va empaquetada, con escritura posicional mediante `position_ids` de forma `[1, 1]` y atención enmascarada sobre las 448 ranuras. El decoder emite además `alignment_logits`, de los que el fork de `CoreAISpeech` del autor deriva la temporización por palabra.

No se aporta información sobre el entrenamiento en este repositorio: no hay número de tokens, composición del dataset ni detalles de RLHF/DPO, porque los pesos proceden del checkpoint publicado por OpenAI y aquí solo se reexportan a formato Core AI. El prefijo forzado del decodificador está codificado en `generation_config.json` como `[[0, 50258], [1, 50259], ...]`, donde 50259 es `<|en|>`; el prefijo fija también `<|notimestamps|>`. Los tokens de todos los idiomas sí están presentes en `added_tokens.json`, por lo que el cambio de idioma es una cuestión de API, no de pesos.

## Capacidades

- Transcripcion de voz a texto en ingles con `CoreAISpeech` estándar, y en los 99 idiomas de Whisper medium usando el fork del autor con selección explícita (`language: .code("fr")`) o detección automática (`language: .detect`).
- Deteccion de idioma integrada: la primera predicción tras `<|startoftranscript|>` es el token de idioma, así que la detección cuesta un único paso de decodificador; en audio largo se detecta una vez en la primera ventana y se reutiliza.
- Alineacion a nivel de palabra: el decodificador emite `alignment_logits`, que el fork de `CoreAISpeech` convierte en marcas temporales por palabra.
- Procesamiento de audio en streaming por ventanas de 30 s: el encoder rellena el audio a la ventana completa.
- Ejecucion on-device en Apple silicon mediante el runtime Core AI, sin llamadas de red.
- Integracion en Swift a través de `CoreAISpeech` (`SpeechRecognitionModel`) o de la capa superior CirceKit (`CirceFileTranscriber`), con ambos tipos de bundle (estático y dinámico) tras la misma API.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio generation: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en apps de macOS/iOS: el bundle se instala como recurso local y transcribe ficheros de audio con `CirceFileTranscriber`, sin enviar el audio a servidores externos, lo que simplifica el cumplimiento de RGPD.
- Subtitulado y actas con marcas de tiempo por palabra: gracias a `alignment_logits` y al fork de `CoreAISpeech` se pueden generar subtítulos sincronizados palabra a palabra en lugar de por frase.
- Dictado por voz en aplicaciones de productividad: al ejecutarse en el Neural Engine/GPU de Apple silicon, la latencia no depende de la red y el modo avión sigue funcionando.
- Transcripcion multilingüe de contenido audiovisual: con `language: .detect` se puede procesar contenido en cualquiera de los 99 idiomas declarados sin reexportar el modelo; útil para catalogar archivos de audio de origen desconocido.
- Preprocesado de audio para pipelines de datos: transcripcion por lotes en un Mac para generar corpus de texto a partir de entrevistas, pódcast o llamadas, con la ventaja de que el audio no sale del equipo.
- Accesibilidad en tiempo real: subtitulado de conversaciones presenciales en el propio iPhone, con la ventana de 30 s del encoder cubriendo turnos de habla completos.
- Prototipado de funciones de voz sin infraestructura GPU: el bundle se carga directamente en el runtime del sistema, evitando montar servidores de inferencia para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una medición puntual de comportamiento, no un benchmark del modelo:

| Medicion documentada | Resultado |
|---|---|
| WER con prefijo `<|en|>` sobre un clip en francés (referencia francesa) | ~96 % WER, emitiendo una frase en inglés fluida y legible |
| Velocidad del decodificador estático en large-v3-turbo, Mac (CPU) | sin mejora frente al decodificador dinámico |
| Velocidad del decodificador estático en large-v3-turbo, iPhone 15 Pro | más lento que el decodificador dinámico |
| Velocidad del decodificador estático en whisper-medium | no medida |

No hay datos de MMLU, HumanEval, GSM8K ni de WER estándar (LibriSpeech, Common Voice) para este export en la información proporcionada.

## Requisitos de hardware

- Plataforma obligatoria: runtime Apple Core AI sobre macOS 27 / iOS 27 o superior. No hay soporte para CUDA, ROCm ni ejecución con `transformers`.
- Huella en disco: 1,41 GB el zip; pesos en float16 del orden de 1,5 GB descomprimidos (estimación a partir del tamaño del repositorio, no publicada).
- Memoria: al ejecutarse en memoria unificada de Apple silicon, los pesos residen en la misma memoria que el resto del sistema; el KV cache está dimensionado a 448 posiciones (estimación de decenas de MB para la autoatención, no publicada).
- GPU/dispositivos: cualquier SoC de Apple compatible con el runtime Core AI (gama M y A reciente). No se especifican modelos mínimos en la model card.
- Viabilidad en consumer: sí, es su objetivo; el autor probó un iPhone 15 Pro con el export de large-v3-turbo, no con este bundle.
- Despliegue: `CoreAISpeech` de `apple/coreai-models`, el fork de `CoreAISpeech` de bjnortier (necesario para selección de idioma y para la forma fija de `position_ids`) y CirceKit. No es compatible con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no publicados para este modelo. Cualquier cifra de velocidad en producción debe medirse en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato y runtime | Idioma por defecto | Licencia |
|---|---|---|---|---|---|
| Este bundle (`coreai-ht5-whisper-medium-kv-static-float16`) | ~769 M (upstream) | 30 s de audio, 448 posiciones de decodificador | `.aimodel`, Core AI, solo Apple | `<|en|>` forzado | Apache 2.0 |
| `bjnortier/coreai-whisper-medium-kv-float16` | ~769 M (upstream) | 30 s de audio | `.aimodel`, Core AI | `<|en|>` forzado | Apache 2.0 |
| `openai/whisper-medium` (upstream) | ~769 M | 30 s de audio | safetensors/bin, PyTorch + `transformers` | multilingüe (seleccionable por API) | Apache 2.0 |
| Export Core AI de whisper large-v3-turbo (citado en la model card, sin ID) | no disponible en la información proporcionada | 30 s de audio | `.aimodel`, Core AI | no disponible | no disponible |

La diferencia práctica entre este bundle y la variante dinámica del mismo autor no está en la calidad de transcripción, sino en el grafo del decodificador: el estático está pensado para especialización en GPU y, según el autor, no aporta velocidad y puede penalizarla. Para transcribir sin más, la model card recomienda el bundle dinámico.

## Limitaciones y advertencias

- El prefijo `<|en|>` está fijado en `generation_config.json`: con audio en otro idioma el modelo no falla, devuelve una traducción fluida al inglés. Medido en un clip francés, ~96 % WER contra referencia francesa. El error es silencioso si no se comprueba el idioma.
- Con `CoreAISpeech` sin modificar no hay API para cambiar el prefijo, así que el bundle transcribe solo inglés; la selección de idioma exige el fork del autor.
- Timestamps desactivados: el prefijo fija `<|notimestamps|>`; obtener marcas temporales requiere otro `generation_config.json`.
- No es cargable con `transformers` ni con herramientas del ecosistema PyTorch (vLLM, llama.cpp); requiere el runtime Core AI y versiones de sistema muy recientes (macOS 27 / iOS 27+), lo que limita el parque de dispositivos compatibles.
- El decodificador estático necesita el fork de `CoreAISpeech` que reconoce la forma fija de `position_ids`; con la librería estándar de Apple no funciona correctamente.
- Naturaleza experimental: el autor no aporta mediciones para este medium y advierte que en large-v3-turbo el enfoque fue más lento en iPhone. No debería asumirse ganancia de rendimiento.
- Sin benchmarks publicados de WER por idioma, no hay base para afirmar calidad en idiomas distintos del inglés más allá de la del checkpoint upstream.
- Riesgo de alucinación propio de la familia Whisper en silencios, ruido o música: puede generar texto plausible sin correspondencia con el audio. No se documenta mitigación específica en este export.
- Sesgos: no se documenta ninguna evaluación de sesgos (acento, género, edad) en la información disponible; hereda los del checkpoint de OpenAI.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de `openai/whisper-medium` y el usuario debe verificar las condiciones del modelo upstream.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bjnortier/coreai-ht5-whisper-medium-kv-static-float16
- Modelo base: https://huggingface.co/openai/whisper-medium
- Variante con decodificador dinámico del mismo autor: https://huggingface.co/bjnortier/coreai-whisper-medium-kv-float16
- Repositorio de referencia de Apple para Core AI: https://github.com/apple/coreai-models
- Perfil de GitHub del autor (fork de `CoreAISpeech` y CirceKit): https://github.com/bjnortier
- Documentación de Apple Core AI: https://developer.apple.com

Los resultados de búsqueda web disponibles no contienen información relacionada con este modelo (corresponden a foros de un operador de telecomunicaciones y a preguntas en chino sobre otros temas), por lo que no se han utilizado como fuente.
