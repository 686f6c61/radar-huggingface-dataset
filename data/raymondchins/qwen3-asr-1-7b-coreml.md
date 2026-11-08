# raymondchins/qwen3-asr-1.7b-coreml

## Resumen

Qwen3-ASR 1.7B para Core ML es una conversión del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud, a formato Core ML para su ejecución local en Macs con Apple Silicon. La conversión la firma raymondchins y se distribuye como artefacto listo para usar dentro de Speakey, una aplicación de dictado y comandos de voz para macOS. Los pesos no se han reentrenado: se mantienen los originales de Qwen y solo se transforman a un formato que aprovecha el Neural Engine y la GPU del equipo.

El modelo resuelve el problema del reconocimiento de voz en local sin depender de la nube, con una latencia baja (mediana de 278 ms por toma en un M5 Max) y un consumo de memoria contenido (unos 330 MB tras la carga). Soporta identificación de idioma y transcripción en 30 idiomas según los metadatos del repositorio, aunque la familia original de Qwen3-ASR declara 52 idiomas y dialectos.

La relevancia actual está en la combinación de un modelo ASR de calidad estado del arte en open source con una implementación optimizada para hardware de consumo Apple, lo que habilita casos de dictado, subtitulado y asistentes de voz totalmente on-device. La arquitectura es un encoder de audio (24 capas transformer sobre ventanas de 8 segundos) más un decoder de texto tipo Qwen3 de 28 capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (3 conv2d + 24 capas transformer, ancho 1024) + decoder de texto Qwen3 (28 capas, hidden 2048, MLP 6144) |
| Parametros totales | 1.7B (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 filas de KV cache (ventana de audio de 8 s por chunk; tomas de más de ~40 s se decodifican por partes) |
| Tipos de cuantizacion | Encoder fp16; decoder int8; embeddings int8 con escala float32 por fila |
| Idiomas soportados | 30 según metadatos (ar, cs, da, de, el, en, es, fa, fi, fil, fr, hi, hu, id, it, ja, ko, mk, ms, nl, pl, pt, ro, ru, sv, th, tr, vi, yue, zh); la familia original declara 52 |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), embeddings `.i8`, vocabulario `vocab.json`, filtro mel `mel.bin` |

## Arquitectura y entrenamiento

El modelo es un sistema encoder-decoder para ASR. El encoder de audio procesa el espectrograma log-mel en ventanas de 8 segundos (800 frames), con 3 capas convolucionales por chunk de 100 frames seguidas de 24 capas transformer de ancho 1024; la atención queda confinada dentro de cada ventana de 8 segundos, lo que permite procesar audio de cualquier duración de forma exacta troceándolo. La salida del encoder son 104 tokens de dimensión 2048 por ventana. El decoder es un transformer Qwen3 de 28 capas con 16 cabezas de consulta y 8 de clave/valor de 128 dimensiones, vocabulario de 151.936 tokens BPE byte-level y RoPE con θ = 1.000.000.

Los pesos provienen del modelo original Qwen3-ASR-1.7B, entrenado por el equipo Qwen sobre datos de voz a gran escala y apoyado en la capacidad de comprensión de audio de Qwen3-Omni. En esta conversión no hay reentrenamiento ni ajuste fino: solo se cuantiza (int8 en decoder y embeddings, fp16 en encoder) y se reestructura para Core ML. La innovación técnica de la conversión es el uso de estado Core ML para el KV cache (56 tensores de estado, `k0`…`k27` y `v0`…`v27`), lo que permite decodificación autoregresiva incremental con las funciones `main` (prefill de longitud variable) y `step` (un token), y la verificación de borradores de vista previa en una sola llamada `main` a coste similar al de decodificar un token.

## Capacidades

- Reconocimiento automático de voz (transcripción) en 30 idiomas, con identificación de idioma integrada.
- Detección de idioma: sin forzar idioma, el modelo emite `language X<asr_text>` antes del texto; se puede forzar un idioma concreto añadiendo sus ids en el prompt.
- Dictado en tiempo real: soporta verificación de borradores de vista previa para confirmar texto al terminar una toma.
- Procesamiento de audio de duración arbitraria mediante troceado en ventanas de 8 segundos.
- Ejecución on-device en Apple Silicon: encoder en Neural Engine (fp16) y decoder en GPU (int8).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No soporta visión ni audio más allá del reconocimiento de voz.

## Casos de uso

- Dictado en macOS: integración en aplicaciones de escritorio para transcribir voz a texto en local con latencia mediana de 278 ms por toma y sin enviar audio a la nube; es el caso de uso nativo de Speakey.
- Comandos de voz: el modelo transcribe la orden y la aplicación la interpreta; la baja latencia (152 ms p50 con verificación de borrador) permite interacción conversacional fluida.
- Subtitulado y transcripción de reuniones: gracias al troceado en ventanas de 8 segundos, se puede transcribir audio largo por partes, aunque las tomas de más de ~40 segundos requieren decodificación segmentada por el límite de 1024 filas de KV cache.
- Notas de voz y actas: transcripción de grabaciones de voz en 30 idiomas con identificación automática de idioma, útil para usuarios multilingües que alternan idiomas.
- Asistentes de accesibilidad: entrada por voz para usuarios con dificultades motrices, ejecutándose íntegramente en el equipo sin conexión.
- Aplicaciones de productividad con privacidad estricta: sectores como salud, legal o finanzas donde el audio no puede salir del dispositivo; el modelo corre on-device con ~330 MB de memoria tras la carga.
- Prototipado de pipelines ASR en Mac: desarrolladores que quieran evaluar Qwen3-ASR sin infraestructura GPU en la nube, usando el modelo convertido como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible. Los únicos datos de rendimiento son mediciones de latencia y memoria de la model card, realizadas en un M5 Max con macOS 27 sobre seis tomas de dictado indonesio/inglés de 1,1 a 10,3 segundos (mediana de tres ejecuciones por toma):

| Metrica | p50 | p90 |
|---|---|---|
| Toma final, decodificacion greedy | 278 ms | 382 ms |
| Toma final, verificacion de borrador de vista previa | 152 ms | 258 ms |
| Memoria tras carga | ~330 MB | ~480 MB en pico |
| Tiempo de carga (con una toma de calentamiento) | ~14 s | no disponible |

La comparación de precisión con `mlx-qwen3-asr` en bf16 sobre las mismas seis tomas mostró diferencias solo en mayúsculas, puntuación y grafía de algunos términos y números; el autor lo describe como una comprobación puntual, no como una medición de WER.

## Requisitos de hardware

- Sistema operativo: macOS 15 o superior (el estado Core ML no existe en versiones anteriores).
- Hardware: Apple Silicon (Neural Engine para el encoder, GPU para el decoder).
- VRAM/memoria: ~330 MB tras la carga, pico de ~480 MB durante una toma; descarga total de ~2,5 GB.
- GPU recomendadas: cualquier chip Apple Silicon compatible; las mediciones se hicieron en un M5 Max.
- Cabe en equipos de consumo Apple (Mac con M1 o posterior, presumiblemente; no se especifican modelos mínimos más allá de Apple Silicon y macOS 15).
- Opciones de despliegue: Core ML nativo mediante `MLModel(contentsOf:)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: 278 ms p50 / 382 ms p90 por toma con decodificación greedy; 152 ms p50 / 258 ms p90 con verificación de borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR 1.7B Core ML (este) | 1.7B | 1024 filas KV / ventanas de 8 s | 30 (metadatos) | Apache 2.0 | Core ML | On-device Apple Silicon, ~330 MB en memoria |
| Qwen3-ASR-1.7B (original) | 1.7B | no disponible | 52 | Apache 2.0 | safetensors (bf16) | Requiere GPU; referencia de precisión |
| Qwen3-ASR-0.6B Core ML | 0.6B | no disponible | no disponible | Apache 2.0 | Core ML | Más pequeño y rápido, más errores de palabra |
| mlx-qwen3-asr | 1.7B (bf16) | no disponible | no disponible | no disponible | MLX | Usado como referencia de comparación de precisión |

## Limitaciones y advertencias

- Requiere macOS 15 o superior en Apple Silicon; no funciona en Intel ni en versiones anteriores de macOS.
- El indonesio y otros idiomas suelen devolver texto en minúsculas y sin puntuación; es un comportamiento del modelo original, no de la conversión.
- El KV cache y el prompt no pueden superar las 1024 filas, por lo que las tomas de más de ~40 segundos se decodifican por partes.
- El decoder se mantiene en int8: en el modelo 0.6B, los pesos int4 cambiaron el 12 % de las palabras y no fueron más rápidos, porque cada paso está limitado por el overhead de dispatch y no por el ancho de banda de pesos.
- Riesgo de alucinación y errores en términos poco frecuentes, números y nombres propios (se observaron confusiones como "kml" por "koreml").
- No se ha publicado una medición formal de WER; la validación de precisión es una comprobación puntual frente a bf16.
- Licencia Apache 2.0, igual que el modelo original, con atribución a Alibaba Cloud (Qwen team) y aviso de cambios en `NOTICE`; permite uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto reciente y poco validado por la comunidad.
- El modelo está pensado para integrarse en Speakey; ejecutarlo fuera de esa aplicación requiere replicar el pipeline completo (preprocesado mel, prompt, gestión de estado y decodificación de la cabeza LM partida en 16 partes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raymondchins/qwen3-asr-1.7b-coreml
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Versión 0.6B Core ML: https://huggingface.co/raymondchins/qwen3-asr-0.6b-coreml
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Speakey: https://speakey.dev
- mlx-qwen3-asr (referencia de comparación): https://github.com/moona3k/mlx-qwen3-asr
- Paper referenciado en los tags: arxiv:2601.21337
