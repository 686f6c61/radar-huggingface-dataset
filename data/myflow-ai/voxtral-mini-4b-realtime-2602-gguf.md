# myflow-ai/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) mistralai/Voxtral-Mini-4B-Realtime-2602, publicada por el usuario myflow-ai y ejecutable mediante transcribe.cpp. Se trata de un audio-LLM nativamente streaming para transcripción de voz multilingüe, diseñado para funcionar con latencias configurables entre 240 ms y 2,4 s, lo que lo sitúa entre las primeras soluciones abiertas capaces de igualar a sistemas offline con retardos inferiores a 500 ms.

El modelo combina un encoder de audio causal de aproximadamente 970 millones de parámetros (stem convolucional causal con left-pad y transformer de 32 capas con atención de ventana deslizante y RoPE) con un proyector de grupos de 4 frames que inyecta los embeddings de audio de forma aditiva en un decoder Ministral de unos 3,4 mil millones de parámetros (26 capas, GQA 32/8, RoPE estilo NEOX). El total declarado es de 4.429.707.024 parámetros. Emite un token de texto por cada slot de 80 ms de audio, lo que equivale a 12,5 tokens por segundo.

Es relevante ahora porque ofrece una vía de despliegue local y ligera (el repo ocupa 3,3 GB y las cuantizaciones van de 2,83 GB a 8,88 GB) con licencia Apache-2.0, soporte de 13 idiomas con detección automática y una escalera de cuantización que, según las mediciones publicadas, se mantiene neutra en WER hasta Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM streaming: encoder de audio causal (~970M; conv stem causal con left-pad + transformer de 32 capas, sliding-window RoPE) + proyector de grupos de 4 frames + decoder Ministral (~3,4B; 26 capas, GQA 32/8, NEOX RoPE) con condicionamiento de latencia por delay-token |
| Parametros totales | 4.429.707.024 (~4,43B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 13: en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (deteccion automatica de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

La arquitectura es específicamente streaming y difiere de la familia Voxtral 2507 offline: usa un encoder causal propio y una fusión de audio aditiva en lugar de las aproximaciones de la familia anterior. El encoder procesa el audio con un stem convolucional causal y 32 capas de transformer con RoPE de ventana deslizante; un proyector agrupa cuatro frames y suma sus embeddings al flujo del decoder. El decoder, derivado de Ministral, tiene 26 capas con atención GQA de 32 cabezas de consulta y 8 de clave/valor y RoPE NEOX. La latencia se controla mediante delay-tokens, lo que permite equilibrar retardo y precisión en tiempo de inferencia (parámetros --stream-chunk-ms y --stream-voxtral-delay en transcribe.cpp). El modelo emite un token de texto cada 80 ms de audio y admite tanto streaming incremental como transcripción offline con transcripción final byte a byte idéntica.

Esta conversión GGUF está portada desde el commit upstream 2769294 (fijado el 2026-06-06) y validada contra la referencia de Transformers en el commit 483c122 de transcribe.cpp el 2026-06-06. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; esos datos figuran como no disponibles en la información consultada. El autor indica que no hay soporte de traducción (translate: false), que sí hay detección de idioma y que no se emiten timestamps.

## Capacidades

- Transcripción de voz a texto en 13 idiomas (en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko) con detección automática del idioma.
- Streaming incremental con latencia configurable entre 240 ms y 2,4 s; a 480 ms iguala, según el autor, a modelos offline líderes y a APIs en tiempo real.
- Transcripción offline con resultado final idéntico byte a byte al de la ruta streaming.
- Entrada de audio a 16 kHz mono en formato WAV (requiere conversión previa con ffmpeg si el origen no cumple estos parámetros).
- Throughput superior a 12,5 tokens por segundo, equivalente a un token de texto cada 80 ms de audio.
- Detección automática de idioma (lang_detect: true).
- No soporta traducción de voz (translate: false) ni generación de timestamps (timestamps: none).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado en directo: con retardos de 240 a 480 ms y una emisión de 12,5 tokens/s, el modelo puede alimentar pipelines de subtítulos para retransmisiones o videollamadas sin esperar al cierre del audio. La ausencia de timestamps obliga a gestionar la sincronización temporal en la capa de aplicación.
- Asistentes de voz locales: al ser un modelo de ~4,4B desplegable en hardware modesto, permite construir interfaces de voz que no envían audio a la nube, con la transcripción generada en el propio dispositivo.
- Transcripción de reuniones y notas de voz: la ruta offline con final byte a byte idéntico a la streaming simplifica la generación de actas donde se prioriza la fidelidad sobre la latencia.
- Atención al cliente telefónica: el modelo puede transcribir llamadas en varios idiomas con detección automática, integrándose en un sistema de análisis posterior o de asistencia en vivo al agente.
- Indexación y búsqueda de archivos de audio: la transcripción multilingüe permite convertir archivos históricos de audio a texto para construir índices de búsqueda sobre podcasts, grabaciones o archivos corporativos.
- Accesibilidad para personas con discapacidad auditiva: generación de texto en tiempo real a partir de audio ambiente o de una conversación, con la ventaja de ejecutarse en local y no depender de conectividad.
- Análisis de contenido audiovisual a escala: dado que las cuantizaciones Q4_K_M y Q5_K_M caben en 2,83 y 3,28 GB, se puede procesar grandes volúmenes de audio en GPU de gama media con coste reducido.
- Automatización de transmisión por voz en entornos con conectividad limitada: la ejecución con transcribe.cpp y backend Vulkan (RTF 0,9 en un Ryzen 4750U) permite desplegar en portátiles o equipos sin GPU dedicada.

## Benchmarks y rendimiento

WER medido sobre el split completo LibriSpeech test-clean (2620 utterances) con el normalizador de texto inglés de Whisper, ruta offline, batch size 8 en una NVIDIA L40S. La referencia de HuggingFace Transformers en la misma máquina (VoxtralRealtimeForConditionalGeneration, BF16, greedy) da 2,08%; la conversión BF16 GGUF iguala ese 2,08%.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 8,87 GB | 2,08% |
| F16 | 8,88 GB | 2,09% |
| Q8_0 | 4,73 GB | 2,07% |
| Q6_K | 3,66 GB | 2,08% |
| Q5_K_M | 3,28 GB | 2,08% |
| Q4_K_M | 2,83 GB | 2,08% |

Las diferencias entre cuantizaciones quedan dentro del ruido de bootstrap (2,07-2,09%), por lo que el autor describe la escalera de cuantización como neutra en WER hasta Q4_K_M.

Factores de tiempo real (RTF) publicados:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 8,6 |
| Apple M4 Max | CPU | 2,5 |
| AMD Ryzen 4750U | Vulkan | 0,9 |
| AMD Ryzen 4750U | CPU | 0,6 |

El WER publicado es unicamente para inglés; no se han publicado resultados por idioma para el resto de los 13 idiomas soportados.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion: Q4_K_M ~2,83 GB, Q5_K_M ~3,28 GB, Q6_K ~3,66 GB, Q8_0 ~4,73 GB, F16 ~8,88 GB, BF16 ~8,87 GB (tamaños de fichero publicados; no se detalla el overhead adicional de runtime).
- Cabe en GPU de consumo: las cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 son compatibles con GPUs de 8 GB o menos; F16 y BF16 requieren al menos 10-12 GB de VRAM para operar con holgura.
- GPU de referencia en las mediciones: NVIDIA L40S para el cálculo de WER (batch 8, ruta offline). No se detallan otras GPU recomendadas.
- Backends medidos: Metal en Apple M4 Max (RTF 8,6) y Vulkan en AMD Ryzen 4750U (RTF 0,9). También hay mediciones en CPU (RTF 2,5 en M4 Max y 0,6 en Ryzen 4750U).
- Opciones de despliegue: transcribe.cpp (binario transcribe-cli, compilado desde fuente con CMake). Los GGUF están pensados para esa librería; no se indica compatibilidad con llama.cpp, vLLM, Ollama o TGI.
- Latencia: retardos configurables de 240 ms a 2,4 s; el autor señala que a 480 ms el modelo iguala a sistemas offline líderes y a APIs en tiempo real.
- Throughput: superior a 12,5 tokens/s, es decir, un token de texto por cada 80 ms de audio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Latencia | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|---|
| myflow-ai/Voxtral-Mini-4B-Realtime-2602-gguf | Audio-LLM streaming (ASR) | 4,43B | 240 ms - 2,4 s (configurable) | 13 | Apache-2.0 | GGUF |
| mistralai/Voxtral-Mini-4B-Realtime-2602 | Audio-LLM streaming (ASR) | ~4,4B (upstream, no confirmado en la informacion) | 240 ms - 2,4 s | 13 | Apache-2.0 | Safetensors (BF16) |
| Familia Voxtral 2507 offline | Audio-LLM offline (ASR) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Whisper large-v3 | ASR encoder-decoder offline | no disponible en la informacion proporcionada | no aplica (offline) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

El propio autor destaca que la familia Voxtral 2507 es arquitectónicamente distinta (no streaming, sin encoder causal, sin fusión aditiva de audio). La información disponible no incluye cifras comparativas de WER frente a alternativas como Whisper, Parakeet u otros modelos de la categoría, por lo que no se pueden ofrecer comparaciones numéricas.

## Limitaciones y advertencias

- No hay resultados de WER publicados para los idiomas distintos del inglés, a pesar de que el modelo declara soporte de 13 idiomas; el rendimiento real en árabe, hindi, coreano o chino no está verificado en esta ficha.
- No genera timestamps (timestamps: none), lo que limita su uso directo en subtitulado que requiera marcas temporales por palabra o segmento.
- No soporta traducción de voz (translate: false); solo transcribe en el idioma detectado.
- La entrada debe ser WAV mono a 16 kHz; es necesario remuestrear y convertir el canal previamente con ffmpeg u otra herramienta.
- La conversión GGUF está pensada exclusivamente para transcribe.cpp. No se documenta compatibilidad con otros runtimes (llama.cpp, vLLM, Ollama, TGI), lo que puede complicar la integración en stacks existentes.
- El repositorio myflow-ai figura con 0 descargas y 0 likes, y no hay evidencia pública de uso en producción; conviene validar la conversión contra el modelo base antes de desplegarla.
- Los pesos se heredan de un modelo base con licencia Apache-2.0, que permite uso comercial, pero conviene revisar la model card upstream por si incorpora condiciones adicionales.
- Un modelo de ~4,4B puede presentar sesgos derivados de los datos de entrenamiento en acentos, variedades dialectales y habla con ruido o solapamiento; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación en audio ambiguo o silencioso, inherente a los audio-LLM con decoder generativo; no se documentan medidas específicas de mitigación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/myflow-ai/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream del modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Descarga de la conversion BF16 (handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-BF16.gguf
- Descarga F16: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Referencia arXiv mencionada en los tags: arxiv:2602.11298
