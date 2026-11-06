# litert-community/granite-speech-5.0-2b

## Resumen

Granite Speech 5.0 2B es un modelo compacto de lenguaje-habla (speech-language model) desarrollado por IBM para reconocimiento automático de voz multilingüe y traducción de voz a texto. Esta ficha concreta, publicada por la comunidad `litert-community`, es una conversión del modelo original de IBM al formato LiteRT-LM de Google AI Edge, empaquetada en un único fichero `.litertlm` de 2,8 GB que recibe audio WAV de 16 kHz y devuelve la transcripción. El objetivo es el despliegue en dispositivo (on-device) y en el borde (edge): el propio autor reporta que en un Galaxy S26 un clip de 9,9 segundos se transcribe en 6,50 segundos, con el primer texto a los 4,36 segundos.

El modelo original tiene aproximadamente 2.300 millones de parámetros y combina tres piezas: un codificador de voz conformer de 16 capas, un window query transformer de 2 capas que comprime cada 0,3 segundos de salida del codificador en 3 embeddings (10 por segundo de audio), y un modelo de lenguaje Granite de 40 capas construido a partir de un checkpoint intermedio de `granite-4.0-1b-base`. Soporta inglés, francés, alemán, español, portugués y japonés para reconocimiento, y traducción adicional de inglés a italiano y mandarín.

La relevancia actual reside en su licencia Apache 2.0, su tamaño manejable para hardware de consumo y la disponibilidad de múltiples formatos (LiteRT-LM, GGUF y ONNX), lo que lo convierte en una opción práctica para transcripción y traducción local sin depender de servicios en la nube. La conversión a LiteRT-LM añade una vía de despliegue nativa en Android y macOS mediante la librería `litert-lm`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador conformer de 16 capas + window query transformer de 2 capas + LLM Granite de 40 capas |
| Parámetros totales | ~2.300 millones (2,3 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de KV cache (prompt y respuesta juntos; equivale a ~1.200 tokens de audio, unos 2 minutos) |
| Tipos de cuantización | LLM en int8 (una escala por canal de salida); codificador de audio en float16 calculado en float32; activaciones del LLM en float32 |
| Idiomas soportados | Reconocimiento: inglés, francés, alemán, español, portugués, japonés. Traducción adicional desde inglés a italiano y mandarín |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM / TFLite); el modelo original también se publica en GGUF y ONNX |

## Arquitectura y entrenamiento

El modelo sigue un diseño modular típico de speech-language model. La entrada de audio pasa por un front end log-mel, un codificador conformer de 16 capas y un window query transformer de 2 capas que reduce la secuencia temporal: cada 0,3 segundos de salida del codificador se condensan en 3 embeddings, es decir, 10 posiciones por segundo de audio que alimentan al modelo de lenguaje. El LLM es un Granite de 40 capas derivado de un checkpoint intermedio de `granite-4.0-1b-base`. El codificador procesa ventanas fijas de 36 segundos; los clips más largos se codifican ventana a ventana y sus salidas se concatenan.

En la conversión a LiteRT-LM, el fichero contiene dos grafos: el modelo de lenguaje con pesos int8 y activaciones float32, KV cache de 4.096 tokens y firmas de prefill de 64, 256 y 1.024 tokens; y el codificador de audio completo (front end log-mel, conformer, query transformer y proyección) en float16 calculado en float32. El fichero incluye el `tokenizer.json` original byte a byte, una plantilla de chat que renderiza el prompt `USER: <|audio|>{instruction}\n ASSISTANT:`, el token de parada `<|end_of_text|>` (100257) y el tipo de modelo `generic_model`. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Transcripción con puntuación y capitalización mediante la instrucción `transcribe the speech with proper punctuation and capitalization.`
- Transcripción plana mediante `can you transcribe the speech into a written format?`
- Sesgo por palabras clave (keyword biasing) mediante `transcribe the speech to text. Keywords: <kw1>, <kw2>, ...`
- Traducción de voz a texto mediante `translate the speech to <language>.`, incluyendo inglés a italiano y mandarín además de los seis idiomas de reconocimiento.
- Procesamiento de audio largo en un solo mensaje: los clips de más de 36 segundos se codifican por ventanas y se concatenan.
- Entrada de audio de 16 kHz mono en formato WAV; el runtime trocea el audio en tramas de 10 ms.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión ni audio de salida.

## Casos de uso

- Transcripción local en dispositivos móviles: el fichero `.litertlm` se integra en Android mediante LiteRT-LM y transcribe clips cortos en el propio teléfono, con un ejemplo medido de 9,9 segundos procesados en 6,50 segundos en un Galaxy S26, sin enviar audio a la nube.
- Subtitulado y actas de reuniones: con 4.096 tokens de contexto (unos 2 minutos de audio por mensaje) y la capacidad de concatenar ventanas de 36 segundos, se pueden transcribir segmentos de conversación con puntuación automática.
- Traducción de voz en atención al cliente: la instrucción `translate the speech to <language>.` permite convertir una locución en inglés a español, francés, alemán, portugués, japonés, italiano o mandarín para agentes o formularios internos.
- Sesgo de vocabulario en dominios técnicos: el keyword biasing permite mejorar la transcripción de nombres propios, términos médicos o jerga de producto pasando una lista de palabras clave en la instrucción.
- Procesamiento por lotes en el borde: al ejecutarse con la herramienta de línea de comandos de LiteRT-LM sobre CPU o GPU, encaja en pipelines de transcripción en equipos de escritorio Apple Silicon o servidores ligeros sin GPU dedicada.
- Aplicaciones de accesibilidad: dictado y conversión de voz a texto en tiempo casi real en dispositivos con recursos limitados, con el codificador ejecutándose en CPU y el LLM en CPU o GPU.
- Archivado y búsqueda de audio: transcripción de grabaciones de hasta ~2 minutos por pasada para indexar contenido hablado en seis idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre corpus públicos) en la información disponible. Los únicos datos de rendimiento proporcionados son mediciones de latencia y fidelidad de la conversión:

| Medición | Valor | Condiciones |
|---|---|---|
| Transcripción de clip de 9,9 s | 6,50 s | Galaxy S26, CPU (gobernador térmico limitando), media de dos llamadas |
| Primer texto emitido | 4,36 s | Galaxy S26, misma prueba |
| Codificador sobre clip de 5,9 s | 1,07 s | M4 Max CPU, grafo del codificador solo, intérprete ai-edge-litert 2.3.0 |
| Codificador (ventana completa) | ~3,7 s | Galaxy S26, CPU limitada térmicamente, media de clips de 5,9, 9,9 y 29,4 s |
| Diferencia WER en clip de 62,5 s (una pasada vs. ventanas) | 1,94 % (CPU Mac) / 1,29 % (GPU Mac) | Frente a la transcripción de una sola pasada del modelo original |

## Requisitos de hardware

- Tamaño del fichero: 2.846.558.336 bytes (2,8 GB), con el LLM int8 (1,67 GB), el codificador de audio (964 MB) y la tabla de embeddings (210 MB).
- VRAM/RAM estimada para inferencia: al menos ~3 GB libres para cargar el fichero completo; el codificador en float16 calculado en float32 requiere memoria adicional durante la ejecución.
- GPU recomendadas: no se especifican modelos concretos; el codificador debe ejecutarse en CPU (`--audio-backend cpu`) porque el delegado GPU de Mac rechaza operaciones como `GATHER_ND` y tensores de 5 dimensiones. El LLM puede ejecutarse en CPU o GPU.
- Cabe en GPU de consumo: sí, por tamaño; se ha probado en CPU de M4 Max y en CPU de Galaxy S26. No se documentan pruebas en RTX 4090 ni en GPUs dedicadas de escritorio.
- Opciones de despliegue: LiteRT-LM (herramienta de línea de comandos vía `uvx` o pip, y librería `litert-lm`), con el fichero `.litertlm`. El modelo original de IBM ofrece GGUF (llama.cpp/Ollama) y ONNX como alternativas.
- Latencia y throughput: ver tabla de benchmarks; el codificador siempre computa una ventana completa de 36 segundos independientemente de la duración real del clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| granite-speech-5.0-2b (LiteRT-LM) | ~2,3 B | 4.096 tokens (~2 min audio) | 6 reconocimiento + 2 traducción | Apache 2.0 | `.litertlm` |
| granite-speech-5.0-2b (IBM original) | ~2,3 B | No disponible en la información | 6 reconocimiento + 2 traducción | Apache 2.0 | Safetensors, GGUF, ONNX |
| IBM Turbo CTC | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo (WER, latencia) frente a otras alternativas de ASR del mismo tamaño, por lo que la comparación se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Solo se ha probado entrada de audio WAV mono a 16 kHz; otras frecuencias de muestreo y formatos no fueron testeados.
- El codificador siempre procesa una ventana completa de 36 segundos, por lo que clips cortos consumen el mismo tiempo de codificación que una ventana entera.
- El silencio digital exacto al final del fichero se interpreta como fin del audio: 19 de 220 ficheros de prueba terminaban en ceros y el codificador recibió una trama menos en 5 de ellos (la transcripción no cambió en esos casos).
- Clips de más de 62,5 segundos no fueron probados; el contexto de 4.096 tokens limita la duración práctica a unos 2 minutos de audio por mensaje.
- El codificador de audio debe ejecutarse en CPU; en Mac, el delegado GPU falla con error INTERNAL al crear la conversación.
- No se documentan sesgos conocidos, pero al ser un modelo de ASR multilingüe es esperable un rendimiento desigual entre idiomas; no hay datos de WER por idioma en la información disponible.
- Riesgo de alucinación en la transcripción no cuantificado en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero IBM recomienda acompañar el modelo con Granite Guardian para detectar riesgos en prompts y respuestas.
- Las mediciones de latencia son preliminares y el autor indica que la velocidad sigue en ajuste; el gobernador térmico del dispositivo puede degradar el rendimiento sostenido.

## Enlaces

- Modelo en Hugging Face (LiteRT-LM): https://huggingface.co/litert-community/granite-speech-5.0-2b
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Versión GGUF de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-GGUF
- Versión ONNX de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-ONNX
- Checkpoint base del LLM: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Anuncio de IBM Granite Speech 5.0 2B: https://www.marktechpost.com/2026/10/22/ibm-granite-speech-5-0-2b-release/
