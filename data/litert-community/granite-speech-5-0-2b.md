# litert-community/granite-speech-5.0-2b

## Resumen

Granite-speech-5.0-2b es un modelo compacto de reconocimiento y traducción de voz multilingüe desarrollado originalmente por IBM. Combina un codificador de voz de tipo conformer de 16 capas, un transformador de consulta por ventanas de 2 capas que comprime cada 0,3 segundos de salida del codificador en 3 embeddings (10 por segundo de audio) y un modelo de lenguaje Granite de 40 capas derivado de un checkpoint intermedio de granite-4.0-1b-base. El conjunto suma aproximadamente 2.300 millones de parámetros y procesa audio de 16 kHz para devolver transcripciones o traducciones.

La versión aquí descrita es una conversión realizada por la comunidad litert-community al formato LiteRT-LM, orientada a inferencia en dispositivo (on-device) sobre hardware móvil y de borde. Se distribuye en archivos `.litertlm` con pesos int8 en el modelo de lenguaje y float16 en el codificador de audio, e incluye dos variantes con distinta ventana de contexto de audio: una de 2.048 tokens (hasta unos 2 minutos de audio por mensaje) y otra de 4.096 tokens (hasta unos 5 minutos).

Su relevancia actual radica en que permite ejecutar ASR y traducción de voz multilingüe completamente en local en un teléfono de gama alta, sin conexión a servicios en la nube. La model card reporta que en un Galaxy S26 un clip de 9,9 segundos se transcribe en 2,47 segundos con el primer texto a los 1,21 segundos, lo que lo sitúa como una opción práctica para aplicaciones de accesibilidad, notas de voz y asistentes offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (16 capas) + query transformer por ventanas (2 capas) + LM Granite (40 capas) |
| Parámetros totales | ~2.300 millones (2,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (`_ekv2048`) o 4.096 tokens (variante estándar); equivale a ~2 o ~5 minutos de audio por mensaje |
| Tipos de cuantización | LM en int8 (una escala por canal de salida); codificador de audio en float16 con cómputo en float32 |
| Idiomas soportados | en, fr, de, es, pt, ja (traducción adicional desde inglés a italiano y mandarín) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base también se publica en GGUF y ONNX |
| Tamaño de los archivos | `_ekv2048`: 2.824.472.576 B; estándar: 2.847.148.032 B |
| Entrada de audio | 16 kHz, log-mel front end; ventana de 24 s (`_ekv2048`) o 36 s (estándar) |
| Librería | litert-lm (LiteRT-LM 0.19.1) |
| Modelo base | ibm-granite/granite-speech-5.0-2b |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de speech-language model en tres etapas. Primero, un front end log-mel a 16 kHz alimenta un codificador conformer de 16 capas. Después, un query transformer de 2 capas convierte cada 0,3 segundos de salida del codificador en 3 embeddings, es decir, 10 embeddings por segundo de audio, lo que reduce drásticamente la longitud de la secuencia antes de pasarla al modelo de lenguaje. Finalmente, un transformer Granite de 40 capas, construido a partir de un checkpoint intermedio de granite-4.0-1b-base, genera el texto de salida condicionado por esos embeddings y por la instrucción textual del usuario.

La conversión a LiteRT-LM reescribe el codificador de audio en operaciones aceptadas por GPU (tensores de rango 4 o inferior, sin `GATHER_ND`) y mantiene los pesos float16 con cómputo en float32. El modelo de lenguaje usa pesos int8 con una escala por canal de salida y firmas de prefill de 64, 256 y 1.024 tokens. La model card indica que el 17 de noviembre de 2026 se sustituyó el archivo `granite-speech-5.0-2b.litertlm` por una versión cuyo grafo de prefill/decode está reescrito para GPU, sin cambiar ningún peso; esa nueva versión solo se ha probado con LiteRT-LM 0.19.0 a 0.19.2. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Traducción de voz: traducción desde inglés hacia italiano y mandarín, además de los idiomas de reconocimiento.
- Procesamiento de audio de 16 kHz con ventanas de 24 o 36 segundos según la variante, y mensajes de hasta ~2 o ~5 minutos de audio respectivamente.
- Generación de transcripciones con puntuación y mayúsculas mediante instrucciones textuales (por ejemplo, "transcribe the speech with proper punctuation and capitalization").
- Ejecución completamente on-device con LiteRT-LM, sin dependencia de servicios en la nube.
- Soporte de plantilla de chat que renderiza el prompt `USER: <|audio|>{instruction}\n ASSISTANT:` a partir de las partes de mensaje de LiteRT-LM.
- Token de parada `<|end_of_text|>` (100257); el tokenizador de origen no añade token de inicio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni modo thinking en la información disponible.

## Casos de uso

- Transcripción de notas de voz en el móvil: la variante `_ekv2048` procesa clips de hasta ~2 minutos en un Galaxy S26 con latencia de primer texto de 1,21 s, adecuada para dictado y notas rápidas sin conexión.
- Subtitulado offline de reuniones y entrevistas: con la variante de 4.096 tokens se pueden transcribir segmentos de hasta ~5 minutos por mensaje, útil para actas y resúmenes posteriores en entornos sin red.
- Traducción de voz en viajes: el modelo traduce desde inglés hacia italiano y mandarín y reconoce los seis idiomas principales, lo que permite construir un intérprete de bolsillo que funciona en local.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones presenciales en el propio dispositivo, sin enviar audio a terceros.
- Asistentes de voz embebidos en aplicaciones móviles: al ejecutarse con LiteRT-LM sobre GPU o CPU del teléfono, se integra en apps Android sin infraestructura de servidor.
- Procesamiento de audio en dispositivos de borde (edge): grabadoras, wearables o equipos industriales que necesitan ASR multilingüe con requisitos de privacidad estrictos y sin conectividad.
- Investigación en ASR on-device: sirve como referencia reproducible para comparar latencia y precisión de conversiones LiteRT-LM frente a las versiones GGUF y ONNX del mismo modelo base.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER por idioma). Los únicos datos de rendimiento disponibles son mediciones de latencia en un Galaxy S26:

| Métrica | `_ekv2048` (LM en GPU) | `_ekv2048` (LM en CPU) | Estándar (LM en GPU) | Estándar (LM en CPU) |
|---|---|---|---|---|
| Clip de 9,9 s: primer texto | 1,21 s | 1,44 s | 3,83 s | 5,16 s |
| Clip de 9,9 s: transcripción completa | 2,47 s | 3,08 s | 5,87 s | 7,65 s |
| Decodificación tras prefill de 1.024 tokens | 25,9 tok/s (grafo reescrito para GPU) | no disponible | 15,0 tok/s (archivo anterior) | no disponible |

Las cifras de `_ekv2048` corresponden al 18 de noviembre de 2026 y las del archivo estándar al 7 de noviembre de 2026; las mediciones del archivo estándar se hicieron con versiones anteriores del mismo nombre de archivo. No se han publicado resultados de benchmarks de precisión (WER) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los archivos pesan entre 2,82 y 2,85 GB; en inferencia se necesita además memoria para activaciones y caché KV (2.048 o 4.096 tokens), por lo que conviene reservar al menos 3,5-4 GB de memoria disponible.
- GPU recomendadas: la model card solo documenta ejecución en un Galaxy S26 (GPU móvil). No se especifican requisitos para A100, H100 o RTX 4090; LiteRT-LM está orientado a dispositivos de borde, no a servidores.
- Cabe en GPU de consumo: sí, por tamaño de pesos; sin embargo, la ruta soportada y medida es LiteRT-LM en Android, no CUDA.
- Opciones de despliegue: LiteRT-LM (versión 0.19.1, con pruebas en 0.19.0-0.19.2). Para el modelo base existen alternativas GGUF (llama.cpp/Ollama) y ONNX publicadas por IBM.
- Latencia y throughput: en Galaxy S26, 2,47 s para un clip de 9,9 s con `_ekv2048` y LM en GPU; 25,9 tok/s de decodificación tras prefill de 1.024 tokens con el grafo reescrito para GPU. No hay datos de throughput en hardware de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| granite-speech-5.0-2b (LiteRT-LM) | ~2,3 B | 2.048 / 4.096 tokens (~2 / ~5 min audio) | en, fr, de, es, pt, ja (+ traducción a it, zh) | Apache 2.0 | `.litertlm` |
| granite-speech-5.0-2b (IBM, base) | ~2,3 B | no disponible | mismos | Apache 2.0 | safetensors, GGUF, ONNX |
| Whisper (variantes pequeñas/medianas) | no disponible en la información | no disponible | multilingüe | no disponible en la información | no disponible en la información |

La información proporcionada solo permite comparar la conversión LiteRT-LM con el modelo base de IBM y sus builds GGUF/ONNX. No se dispone de datos de benchmarks ni de especificaciones de alternativas como Whisper en el material consultado, por lo que la comparación cuantitativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Solo se documentan seis idiomas de reconocimiento (en, fr, de, es, pt, ja); otros idiomas no están soportados según la model card.
- La traducción de voz solo se documenta desde inglés hacia italiano y mandarín; no se garantiza traducción entre el resto de pares.
- La duración de audio por mensaje está limitada por el contexto: ~2 minutos con `_ekv2048` y ~5 minutos con la variante estándar; segmentos más largos requieren troceado.
- El archivo estándar `granite-speech-5.0-2b.litertlm` fue reemplazado el 17 de noviembre de 2026 y la nueva versión solo se ha probado con LiteRT-LM 0.19.0 a 0.19.2; runtimes anteriores no se han validado con él.
- Las mediciones de latencia provienen de un único dispositivo (Galaxy S26) y de un conjunto de 220 clips de prueba; no deben extrapolarse sin verificación a otro hardware.
- No se han publicado métricas de precisión (WER) ni evaluaciones de sesgo en la información disponible; el riesgo de alucinación en la transcripción no está cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de las dependencias de LiteRT-LM y del modelo base.
- Al ser una conversión de la comunidad (litert-community), no está mantenida por IBM; para producción conviene contrastar con el repositorio oficial del modelo base.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/granite-speech-5.0-2b
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Versión GGUF de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-GGUF
- Versión ONNX de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-2b-ONNX
- Checkpoint base del modelo de lenguaje: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
