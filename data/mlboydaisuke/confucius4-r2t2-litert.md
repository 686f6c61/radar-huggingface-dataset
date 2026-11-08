# mlboydaisuke/Confucius4-R2T2-LiteRT

## Resumen

Confucius4-R2T2-LiteRT es una conversión al formato `.litertlm` del modelo de reconocimiento automático del habla (ASR) en streaming Confucius4-R2T2, desarrollado originalmente por NetEase Youdao. La conversión la publica el usuario mlboydaisuke y empaqueta en un único fichero de 2,69 GB todo lo necesario para inferencia en dispositivo (encoder de audio, modelo de lenguaje, tabla de embeddings y tokenizador), de modo que funciona con el runtime LiteRT-LM de Google sin necesidad de modificarlo. El modelo base se construye sobre Qwen3-ASR-1.7B, con 2.040 millones de parámetros, y está pensado para transcripción de audio a texto de baja latencia en entornos de borde.

La arquitectura combina un encoder de audio de 24 capas que recibe ventanas de 30 segundos de PCM a 16 kHz y genera 390 tokens de audio por ventana, y un modelo de lenguaje Qwen3 de 28 capas con caché KV de 1024 tokens que produce la transcripción en el formato `language <nombre><asr_text><transcript>`. El modelo está optimizado para chino e inglés, aunque declara soporte de 30 idiomas; esta conversión concreta se ha evaluado en inglés, mandarín y japonés.

Su relevancia radica en que ofrece un pipeline ASR completo, cuantizado y ejecutable en CPU o GPU de dispositivos de consumo y móviles, con un factor de tiempo real de 0,124 en CPU de Apple M4 Max (8,1 veces más rápido que tiempo real) y 0,053 con el LM en GPU (18,9 veces más rápido). La licencia es la NetEase Model Use License Agreement, no una licencia open source estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio de 24 capas + LLM Qwen3 de 28 capas (ASR multimodal audio-a-texto) |
| Parámetros totales | 2,04 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por mensaje; caché KV de 1024 tokens |
| Tipos de cuantización | LM int8 dinámico (pesos) con tabla de embeddings int8; encoder de audio fp16 en pesos y fp32 en cómputo |
| Idiomas soportados | zh, en, ja (evaluados); el modelo base declara 30 idiomas |
| Licencia | netease-model-use-license-agreement (no open source) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamaño del fichero | 2,69 GB |
| Runtime | LiteRT-LM (probado con `litert-lm-api` 0.17.1) |
| Muestreo de audio | PCM 16 kHz, tramas de 10 ms |
| Modelo base | netease-youdao/Confucius4-R2T2 |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de dos etapas acopladas en un solo grafo. La primera sección (`tf_lite_audio_encoder_hw`, 637 MB) contiene el front-end log-mel —la STFT, el banco de filtros Slaney y la normalización del extractor de características original—, un encoder de 24 capas y un proyector. La segunda sección (`tf_lite_prefill_decode`, 1,74 GB) es el modelo de lenguaje Qwen3 cuantizado a int8 con caché KV de 1024 tokens, alimentado por una tabla de embeddings int8 separada (`tf_lite_embedder`, 313 MB). El runtime trocea el audio en tramas de 10 ms y entrega al encoder ventanas de 30 s, que se rellenan con ceros si el clip es más corto; cada ventana se convierte siempre en 390 tokens de audio, por lo que el coste de codificación y prefill es constante independientemente de la duración del clip (de 4 a 29 s), y solo el decoding crece con la longitud de la transcripción.

El modelo base es un ASR en streaming "verdadero" con chunks de decodificación configurables entre 80 ms y 2 s y modo de salida append-only: el texto comprometido no se revisa, y en cada chunk se relee el audio acumulado y se continúa desde el texto ya emitido. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La conversión a LiteRT-LM no introduce cambios en el runtime: usa la ruta de audio genérica del runtime publicado y el encoder calcula el espectrograma log-mel internamente.

## Capacidades

- Reconocimiento automático del habla en streaming con salida append-only y chunks de decodificación de 80 ms a 2 s (característica del modelo base).
- Transcripción de audio a texto en un único mensaje de hasta 30 s por clip.
- Salida estructurada con etiqueta de idioma: `language <nombre><asr_text><transcript>`.
- Forzado de idioma mediante un ítem de texto `language Chinese<asr_text>` (u otro nombre de idioma) en el mismo mensaje, tras lo cual el modelo emite solo la transcripción.
- Capacidades multilingües: optimizado para chino e inglés, con japonés evaluado y 30 idiomas declarados en el modelo base.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio de salida ni modo thinking.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones móviles: el fichero de 2,69 GB se ejecuta con LiteRT-LM en el propio dispositivo, sin enviar audio a la nube, con clips de hasta 30 s por mensaje.
- Subtitulado en tiempo casi real: el modelo base opera en streaming con chunks desde 80 ms y el factor de tiempo real medido (0,053 con LM en GPU en M4 Max) permite procesar audio más rápido que en tiempo real.
- Dictado por voz multilingüe en chino, inglés y japonés: el forzado de idioma mediante la etiqueta `language <nombre><asr_text>` permite fijar el idioma esperado y obtener solo la transcripción.
- Asistentes de voz embebidos en dispositivos de borde: la ejecución en CPU de 4 hilos con 4,55 GB de RSS pico en M4 Max hace viable el despliegue en equipos sin GPU dedicada.
- Procesamiento por lotes de archivos de audio cortos: el coste de codificación y prefill es constante por ventana de 30 s, lo que simplifica el dimensionamiento de pipelines de transcripción por lotes.
- Evaluación y prototipado de ASR en Android: se ha probado con la herramienta de línea de comandos de LiteRT-LM v0.16.1 en un Galaxy S26 (SM-S942Q), con 15 de 20 clips transcritos correctamente en CPU sin caché de pesos.

## Benchmarks y rendimiento

Precisión sobre el conjunto de test FLEURS, 50 clips por idioma, decodificación greedy, una conversación por clip:

| Ejecución | WER inglés | CER mandarín | CER japonés |
|---|---|---|---|
| Modelo original, PyTorch fp32, prompt de este fichero | 4,43 % (51/1150) | 6,24 % (122/1954) | 6,21 % (167/2689) |
| Modelo original, PyTorch fp32, prompt del repositorio original | 4,35 % (50/1150) | 7,78 % (152/1954) | 7,47 % (201/2689) |
| Este fichero, LiteRT-LM 0.17.1, M4 Max, CPU | 4,43 % (51/1150) | 6,40 % (125/1954) | 6,21 % (167/2689) |
| Este fichero, LiteRT-LM 0.17.1, M4 Max, LM en GPU (WebGPU/Metal), audio en CPU | 4,52 % (52/1150) | 6,45 % (126/1954) | 6,06 % (163/2689) |

Rendimiento en Apple M4 Max con LiteRT-LM 0.17.1 (Python), 155 clips de 4 a 29 s (1.836 s de audio):

| Backend | Tiempo total | Factor de tiempo real | Por clip | RSS pico |
|---|---|---|---|---|
| CPU, 4 hilos | 227 s | 0,124 (8,1× más rápido que tiempo real) | 1,08–2,64 s, mediana 1,42 s | 4,55 GB |
| LM en GPU (WebGPU/Metal), encoder en CPU | 97 s | 0,053 (18,9× más rápido que tiempo real) | 0,49–1,06 s, mediana 0,61 s | 2,68 GB |

La primera carga escribe unas 3,0 GB de cachés de pesos de CPU (encoder 1,27 GB, LM 1,73 GB) en `cache_dir`; la ejecución que las generó alcanzó 6,62 GB de RSS pico. En Galaxy S26 (SM-S942Q), con un proceso por clip sobre los 20 clips más cortos (128 s de audio), la CPU de 4 hilos sin caché de pesos produjo el mismo texto que la ejecución de referencia en 15 de 20 clips, con 10,4–19,6 s de tiempo de pared por proceso (incluida la carga del motor) y 7,47 GB de huella privada pico; con el LM en GPU (OpenCL) y el encoder en CPU, 4 de 5 clips de ejemplo coincidieron con el texto de referencia. Estas cifras de móvil se tomaron con el límite de frecuencia del dispositivo degradado (de 3,63/4,74 GHz a 1,79/1,75 GHz) y deben leerse como valores de referencia.

## Requisitos de hardware

- Huella de memoria: 4,55 GB de RSS pico en CPU (M4 Max) con pesos mapeados en memoria; 2,68 GB con el LM en GPU. La primera ejecución requiere unos 3,0 GB adicionales de caché de pesos en disco.
- GPU recomendadas: no se especifican modelos concretos; se ha validado con WebGPU sobre Metal en Apple M4 Max y con OpenCL en un SoC móvil Android (Galaxy S26).
- Cabe en hardware de consumo: sí, con 2,69 GB de fichero y ejecución en CPU de 4 hilos; no requiere GPU dedicada.
- Opciones de despliegue: runtime LiteRT-LM (probado con `litert-lm-api` 0.17.1 en Python y con la herramienta de línea de comandos v0.16.1 en Android). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 1,42 s por clip en CPU y 0,61 s con LM en GPU en M4 Max; factor de tiempo real de 0,124 y 0,053 respectivamente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de la misma categoría (ASR en streaming en formato LiteRT-LM), por lo que la comparación cuantitativa con alternativas no está disponible. Como referencia cualitativa, el propio modelo base en PyTorch fp32 obtiene resultados ligeramente distintos según el prompt: 4,43 % de WER en inglés y 6,24 % de CER en mandarín con el prompt de este fichero, frente a 4,35 % y 7,78 % con el prompt del repositorio original.

## Limitaciones y advertencias

- Cada mensaje admite un solo clip de hasta 30 s; los clips más largos no se probaron con este fichero.
- El template ignora los mensajes de sistema, por lo que el prompt de contexto del repositorio original no está disponible en esta conversión.
- Con el prompt del repositorio original (turno de sistema vacío), el fichero obtuvo CER de 10,75 % en mandarín y 9,33 % en japonés; algunos clips chinos se etiquetaron como `English` o `None`, los números salieron como numerales chinos y un clip de mandarín y otro de japonés se tradujeron al inglés.
- Riesgo de alucinación y de traducción no solicitada: se ha observado traducción al inglés de clips en mandarín y japonés.
- Idiomas evaluados limitados a inglés, mandarín y japonés; el soporte de los 30 idiomas declarados por el modelo base no está verificado en esta conversión.
- La licencia NetEase Model Use License Agreement no es open source; deben revisarse las restricciones de uso comercial en el fichero `MODEL_LICENSE` antes de desplegar en producción.
- Las cifras de rendimiento en móvil se obtuvieron con el límite de frecuencia del dispositivo degradado y no representan el rendimiento sostenido del hardware.
- El modelo base opera en modo append-only: el texto comprometido no se revisa, lo que puede propagar errores tempranos en transcripciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Confucius4-R2T2-LiteRT
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Licencia del modelo: https://huggingface.co/mlboydaisuke/Confucius4-R2T2-LiteRT/blob/main/MODEL_LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
