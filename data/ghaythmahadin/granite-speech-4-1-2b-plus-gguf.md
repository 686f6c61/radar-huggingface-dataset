# GhaythMahadin/granite-speech-4.1-2b-plus-gguf

## Resumen

Granite-Speech-4.1-2b-plus en formato GGUF es una conversión del modelo de reconocimiento automático de voz (ASR) `ibm-granite/granite-speech-4.1-2b-plus` de IBM, publicada por el usuario GhaythMahadin para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo resuelve la transcripción offline multilingüe de audio con marcas de tiempo a nivel de palabra, y su variante "plus" añade atribución de hablante (diarización) respecto al modelo base. Es relevante porque empaqueta un modelo de ~2.110 millones de parámetros en cuantizaciones de 1,49 GB a 4,23 GB, lo que permite ejecutarlo en hardware de consumo sin renunciar a una tasa de error de palabra (WER) en torno al 1,5 % en LibriSpeech test-clean.

La arquitectura combina un codificador Conformer, un proyector BLIP-2 Q-Former y un decodificador autorregresivo basado en el LLM Granite-4.0-1b. La variante plus concatena los estados ocultos de la capa intermedia (índice 3) y de la capa final del codificador, duplicando la entrada K/V del proyector de 1024 a 2048, y ata los embeddings de tokens del LM con el `lm_head`. El modelo acepta WAV mono a 16 kHz y devuelve transcripciones en inglés, francés, alemán, español y portugués.

Esta conversión es específica para transcribe.cpp y no debe confundirse con los GGUF para llama.cpp: la librería declarada es `transcribe.cpp`, y el modelo es solo de transcripción (no traduce voz, no detecta idioma automáticamente y no soporta streaming). La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + BLIP-2 Q-Former projector + decodificador LLM autorregresivo (Granite-4.0-1b) |
| Parametros totales | 2.111.899.452 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Granite-Speech: un codificador Conformer que procesa audio mono a 16 kHz, un proyector Q-Former de inspiración BLIP-2 que alinea las representaciones acústicas con el espacio del modelo de lenguaje, y un decodificador autorregresivo Granite-4.0-1b. La variante "plus" introduce dos modificaciones respecto al 4.1-2b base: el codificador concatena los estados ocultos de la capa intermedia (índice 3) con los de la capa final (`cat_hidden_layers=[3]`), lo que duplica la dimensión de entrada K/V del proyector de 1024 a 2048, y los embeddings de tokens del LM están atados con el `lm_head`.

El entrenamiento se realizó sobre corpus similares a los del modelo base, aumentados con turnos de hablante y etiquetas de marca de tiempo a nivel de palabra, lo que habilita la atribución de hablante y la transcripción con timestamps. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Las marcas de tiempo se emiten como marcadores `[T:N]` en centisegundos, que el runtime parsea a timestamps estructurados por palabra. La conversión GGUF se realizó desde el commit upstream `edd3bf5` (fijado el 2026-05-17) y se validó numéricamente contra la referencia de Transformers en el commit `275332d` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en inglés, francés, alemán, español y portugués.
- Marcas de tiempo a nivel de palabra mediante el flag `--timestamps word`, parseadas de los marcadores `[T:N]` del modelo.
- Atribución de hablante (diarización) en la variante plus, con etiquetas de hablante junto al texto.
- Entrada de audio WAV mono a 16 kHz (se requiere conversión previa con ffmpeg para otros formatos).
- No soporta traducción de voz (a diferencia del 4.1-2b base).
- No soporta detección automática de idioma (`lang_detect: false`).
- No soporta streaming (`streaming: false`).
- No proporciona puntuación ni capitalización en la variante plus (a diferencia del modelo base).

## Casos de uso

- Transcripción de reuniones y actas: el modelo genera transcripciones con marcas de tiempo por palabra y etiquetas de hablante, lo que permite reconstruir quién dijo qué y cuándo en grabaciones mono a 16 kHz, adecuado para generar actas estructuradas sin conexión a servicios en la nube.
- Subtitulado automático: los timestamps por palabra permiten alinear subtítulos con precisión en vídeos en inglés, francés, alemán, español o portugués, ejecutando la inferencia localmente con la cuantización Q5_K_M (1,69 GB) en una GPU de consumo.
- Archivado y búsqueda de audio: transcribir grandes volúmenes de grabaciones offline con Q4_K_M (1,49 GB) en CPU o GPU modesta, indexando el texto resultante para búsqueda posterior sin coste por minuto de API.
- Aplicaciones de accesibilidad: transcripción en tiempo no real (offline) de contenido hablado para personas con discapacidad auditiva, desplegable en un portátil con Metal en Apple Silicon (RTF de 11 en M4 con Metal) o Vulkan en APUs (RTF de 2,75 en Ryzen 4750U).
- Análisis de llamadas de atención al cliente: la atribución de hablante permite separar agente y cliente en grabaciones mono, y los timestamps por palabra facilitan métricas de duración de turnos y localización de fragmentos concretos.
- Investigación lingüística y corpus: generación de transcripciones anotadas con tiempos por palabra para estudios fonéticos o de conversación en los cinco idiomas soportados, con la ventaja de que todo el pipeline corre localmente y los datos no salen del equipo.
- Despliegue en dispositivos sin GPU: la cuantización Q4_K_M (1,49 GB) y el RTF de 1,4 en CPU de Ryzen 4750U permiten transcripción más rápida que tiempo real en portátiles sin acelerador dedicado.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, decodificación greedy, plantilla de chat del modelo, normalizador `EnglishTextNormalizer` de Whisper):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,23 GB | 1,49 % |
| F16 | 4,23 GB | 1,48 % |
| Q8_0 | 2,35 GB | 1,50 % |
| Q6_K | 1,86 GB | 1,46 % |
| Q5_K_M | 1,69 GB | 1,48 % |
| Q4_K_M | 1,49 GB | 1,56 % |

La referencia BF16 re-ejecutada localmente con la misma plantilla de prompt da 1,48 %, 0,04 pp por encima del 1,44 % publicado por el autor upstream, diferencia atribuida a la plantilla de chat o a la normalización. El autor advierte que `add_generation_prompt=True` es crítico: sin él, el modelo emite 25-27 hipótesis vacías en clips cortos de test-clean y el WER se dispara a ~26 %.

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 33 |
| Apple M4 Max | CPU | 5,2 |
| Apple M4 | Metal | 11 |
| Apple M4 | CPU | 5 |
| AMD Ryzen 4750U | Vulkan | 2,75 |
| AMD Ryzen 4750U | CPU | 1,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead del runtime; Q4_K_M ~1,5 GB, Q5_K_M ~1,7 GB, Q8_0 ~2,4 GB, BF16/F16 ~4,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para las cuantizaciones bajas; Apple Silicon con Metal (M4 Max alcanza RTF 33) y GPUs AMD con Vulkan (Ryzen 4750U integrada alcanza RTF 2,75).
- Cabe en GPU de consumo: sí, incluso en iGPU y en CPU. La cuantización Q4_K_M (1,49 GB) es viable en portátiles modestos.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, requiere compilación con CMake). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: RTF de 1,4 (CPU Ryzen 4750U) a 33 (Metal en M4 Max); en M4 con Metal el RTF es 11. Un RTF mayor que 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Timestamps | Diarizacion | Licencia | Formato |
|---|---|---:|---|---|---|---|
| granite-speech-4.1-2b-plus (este, GGUF) | ~2,11 B | en, fr, de, es, pt | por palabra | si | Apache-2.0 | GGUF (transcribe.cpp) |
| granite-speech-4.1-2b (base, GGUF) | ~2,11 B | en, fr, de, es, pt, ja | no disponible | no | Apache-2.0 | GGUF (transcribe.cpp) |
| Whisper large-v3 | ~1,55 B | multilingue amplio | por segmento | no | MIT | safetensors, GGUF, etc. |
| Whisper large-v3-turbo | ~0,81 B | multilingue amplio | por segmento | no | MIT | safetensors, GGUF, etc. |

La comparación con Whisper se ofrece por categoría (ASR multilingüe de tamano similar) y no incluye cifras de WER comparativas porque la informacion disponible no las proporciona para este modelo frente a Whisper. La ventaja diferencial de esta variante es la combinación de timestamps por palabra y diarización en un unico modelo Apache-2.0, frente a Whisper, que requiere modelos auxiliares para diarización.

## Limitaciones y advertencias

- Solo transcripción: no traduce voz (a diferencia del 4.1-2b base) ni detecta idioma automáticamente; el idioma debe seleccionarse o inferirse externamente.
- No soporta streaming: la inferencia es por fichero completo, no incremental.
- La variante plus no genera puntuación ni capitalización, lo que puede requerir un postprocesado para textos legibles.
- Requiere audio WAV mono a 16 kHz; otros formatos deben convertirse previamente con ffmpeg.
- Riesgo de alucinación y de hipótesis vacías si no se usa la plantilla de prompt correcta (`add_generation_prompt=True`); el autor documenta un WER de ~26 % sin ella.
- Cobertura limitada a cinco idiomas (en, fr, de, es, pt); no soporta japonés en esta variante.
- No se han publicado datos sobre sesgos demográficos o acústicos, ni sobre robustez ante ruido o acentos no nativos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream para términos completos.
- Conversión de terceros: la fidelidad depende de la validación numérica contra Transformers en el commit indicado; cambios en transcribe.cpp posteriores a esa validación podrían alterar el comportamiento.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/granite-speech-4.1-2b-plus-gguf
- Modelo base upstream: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Modelo base 4.1-2b: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Commit upstream de referencia: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus/commit/edd3bf5
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/275332d
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-plus.md
