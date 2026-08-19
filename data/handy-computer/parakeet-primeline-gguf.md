# handy-computer/parakeet-primeline-gguf

## Resumen

parakeet-primeline-gguf es una conversión a formato GGUF del modelo primeline/parakeet-primeline, un ajuste fino en alemán del modelo NVIDIA parakeet-tdt-0.6b-v3, realizado por la empresa primeLine. El modelo original es un sistema de reconocimiento automático del habla (ASR) de 0,6 mil millones de parámetros, con un encoder FastConformer y un decodificador TDT/RNNT, que acepta audio WAV mono de 16 kHz y produce transcripciones con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token.

Esta conversión GGUF, publicada por handy-computer, permite ejecutar el modelo con la librería transcribe.cpp, un motor de inferencia en C++ optimizado para CPU y GPU, sin depender del stack de NeMo de NVIDIA. El ajuste fino en alemán no ha degradado la capacidad multilingüe del modelo base: sigue transcribiendo los 25 idiomas europeos de la familia v3 con su puntuación y mayúsculas correctas. No es un modelo de streaming ni realiza traducción, pero sí detecta el idioma automáticamente.

La relevancia de este modelo radica en que ofrece una precisión muy alta en alemán (WER del 5,98% en el conjunto de test de FLEURS de) con un tamaño reducido y un rendimiento en tiempo real muy bueno, incluso en CPU. Al estar disponible en GGUF, se puede desplegar en entornos locales con requisitos de hardware modestos, lo que lo hace atractivo para aplicaciones de transcripción privadas y de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT/RNNT decoder |
| Parametros totales | 627.052.166 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio de 16 kHz; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: de, bg, hr, cs, da, nl, en, et, fi, fr, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base, parakeet-tdt-0.6b-v3 de NVIDIA, emplea un encoder FastConformer (una variante eficiente del conformer) combinado con un decodificador TDT (Token-and-Duration Transducer), una evolución del transductor RNNT que predice simultáneamente el token y su duración, lo que reduce la latencia y mejora el rendimiento frente a los transductores clásicos. El ajuste fino de primeLine se realizó sobre datos en alemán, pero sin colapsar las capacidades multilingües del modelo original.

No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset del ajuste fino. La model card original menciona que el modelo fue refinado para lograr una mayor precisión en alemán, con mejoras significativas de WER frente al modelo base de NVIDIA y frente a arquitecturas basadas en Whisper. El proceso de entrenamiento no incluye RLHF ni DPO, al tratarse de un modelo ASR supervisado.

La conversión a GGUF fue validada contra el checkpoint NeMo de referencia en el commit 856d7c1 de transcribe.cpp, obteniendo un WER de 5,98% en el conjunto de test de FLEURS de, idéntico al del modelo original dentro del margen de error. La cuantización apenas afecta a la precisión: la dispersión entre cuantizaciones es de 0,04 puntos porcentuales, sin degradación monótona.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con especial optimización para alemán.
- Salida con puntuación y mayúsculas correctas por idioma.
- Marcas de tiempo a nivel de token (timestamps por token).
- Detección automática de idioma (lang_detect: true).
- No soporta streaming (procesa audio completo).
- No realiza traducción (translate: false).
- Acepta audio WAV mono de 16 kHz; requiere conversión previa para otros formatos.
- Ortografía particular: escribe casi siempre "ss" en lugar de "ß" (propiedad del tokenizador SentencePiece del modelo base, no del puerto).

## Casos de uso

- Transcripción de reuniones y entrevistas en alemán: el modelo puede transcribir grabaciones de reuniones de larga duración con alta precisión, generando actas con puntuación y marcas de tiempo. Su bajo WER en alemán (5,98% en FLEURS) lo hace adecuado para entornos profesionales donde la fidelidad es crítica.
- Subtitulación automática de vídeos: al generar timestamps por token, se pueden producir subtítulos sincronizados para contenido en alemán y otros idiomas europeos. El modelo es lo bastante rápido para procesar vídeos en lote sin necesidad de GPU de gama alta.
- Dictado y asistencia a la escritura: integrado en aplicaciones de escritorio o móviles, permite dictar texto en alemán con puntuación automática, útil para redacción de documentos, correos o código. Su tamaño reducido (485 MB en Q4_K_M) permite ejecutarlo en dispositivos con recursos limitados.
- Atención al cliente y análisis de llamadas: transcripción de llamadas de soporte en alemán para su posterior análisis (detección de intención, sentimiento, cumplimiento normativo). La detección automática de idioma facilita su uso en entornos multilingües europeos.
- Archivado y búsqueda de audio: conversión de archivos de audio históricos (podcasts, radio, conferencias) a texto indexable. La licencia CC-BY-4.0 permite su uso comercial con atribución, lo que facilita su integración en productos propietarios.
- Transcripción médica o legal en alemán: la alta precisión en alemán y la capacidad de generar timestamps permiten crear registros detallados de consultas o declaraciones, con referencias temporales exactas para su revisión.

## Benchmarks y rendimiento

La model card proporciona resultados de WER en el conjunto de test de FLEURS de (862 utterances) con decodificación greedy y sin modelo de lenguaje externo:

| Cuantizacion | WER (FLEURS de) |
|---|---|
| F32 | 6,00% |
| F16 | 6,00% |
| Q8_0 | 6,00% |
| Q6_K | 5,96% |
| Q5_K_M | 5,99% |
| Q4_K_M | 5,98% |

Como referencia, el checkpoint NeMo original de primeLine obtiene un 5,98% WER en el mismo manifest, por lo que las conversiones GGUF coinciden con el modelo de referencia dentro del ruido del intervalo de confianza bootstrap. La dispersión entre cuantizaciones es de 0,04 puntos porcentuales, sin degradación monótona.

La model card también menciona que primeLine publicó una cifra media de 2,95% sobre Tuda-De, Multilingual LibriSpeech y Common Voice 19.0, pero esos corpus no son comparables con FLEURS. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

En cuanto a rendimiento, se indican los siguientes RTF (real-time factor, probablemente multiplicado por 100) en dos sistemas:

| Sistema | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

Estos valores sugieren que el modelo es significativamente más rápido que el tiempo real en hardware moderno, especialmente con aceleración por GPU.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF van de 485 MB (Q4_K_M) a 2,51 GB (F32). Con overhead de inferencia, se recomienda al menos 1 GB de VRAM para las cuantizaciones Q4-Q6 y 3 GB para F32. Cabe en GPUs de consumo como GTX 1650, RTX 2060, RTX 3060, etc.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), Vulkan o CUDA. En Apple M4 Max se obtiene un RTF de 151 con Metal; en AMD Ryzen 4750U con iGPU Vulkan, RTF de 12,5.
- CPU: el modelo funciona en CPU pura, con RTF de 28 en M4 Max y 7,5 en Ryzen 4750U, lo que lo hace viable para transcripción en tiempo real en portátiles modernos.
- Opciones de despliegue: transcribe.cpp (motor de inferencia en C++), que soporta backend Metal, Vulkan y CPU. No se menciona compatibilidad con vLLM, Ollama o TGI, al ser un modelo ASR especializado.
- Latencia y throughput: no se proporcionan valores absolutos de latencia, pero los RTF indican que puede transcribir un minuto de audio en menos de un segundo en GPU (RTF 151 implica 0,66 segundos por minuto de audio) y en unos 4 segundos en CPU (RTF 7,5).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER (FLEURS de) | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-primeline-gguf (este) | 0,6B | 25 europeos | 5,98% | CC-BY-4.0 | GGUF |
| NVIDIA parakeet-tdt-0.6b-v3 | 0,6B | 25 europeos | no disponible | CC-BY-4.0 | NeMo |
| NVIDIA parakeet-tdt-0.6b-v2 | 0,6B | 25 europeos | no disponible | CC-BY-4.0 | NeMo |
| Whisper large-v3 | 1,5B | 99+ | no disponible | MIT | diversos |

No se dispone de comparativas directas de WER entre estos modelos en los mismos conjuntos de datos. La model card de primeLine afirma que su ajuste fino supera al modelo base de NVIDIA y a arquitecturas Whisper en alemán, pero no se aportan cifras concretas en la información disponible. El modelo destaca por su tamaño reducido y su formato GGUF, que facilita el despliegue en entornos locales con herramientas ligeras.

## Limitaciones y advertencias

- Ortografía suiza: el modelo escribe "ss" en lugar de "ß" en casi todas las ocasiones (solo 5 apariciones de "ß" en 862 hipótesis). Esto es una propiedad del tokenizador del modelo base, no del puerto, y puede requerir post-procesado si se necesita ortografía estándar alemana.
- No es un modelo de streaming: procesa el audio completo de una vez, por lo que no es adecuado para transcripción en tiempo real de flujos continuos sin segmentación previa.
- No traduce: solo transcribe en el idioma de origen.
- Limitación de idiomas: aunque cubre 25 idiomas europeos, no soporta idiomas fuera de ese conjunto (a diferencia de Whisper, que cubre 99+).
- Requiere audio de 16 kHz mono WAV: cualquier otra entrada debe convertirse previamente con herramientas como ffmpeg.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero hay que cumplir los términos de la licencia (indicar la autoría del modelo).
- Riesgo de alucinación: como todo modelo ASR, puede generar texto incorrecto en audio con ruido o solapamiento de voces, aunque no se han documentado casos específicos.
- Sesgos: no se ha evaluado el comportamiento con acentos no estándar, dialectos o habla disfluente; el ajuste fino en alemán puede haber introducido sesgos hacia variedades estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/handy-computer/parakeet-primeline-gguf
- Modelo base original: https://huggingface.co/primeline/parakeet-primeline
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-primeline.md
- Aplicación Handy (cliente de escritorio que usa estos modelos): https://github.com/cjpais/handy
- Documentación de modelos de Handy: https://handy.computer/docs/models.html
