# raymondchins/qwen3-asr-1.7b-coreml-ane

## Resumen

Qwen3-ASR 1.7B Core ML ANE es una conversión del modelo de reconocimiento automático de voz Qwen3-ASR 1.7B de Alibaba Qwen a formato Core ML, optimizada para ejecutarse íntegramente en el Neural Engine (ANE) de los chips Apple Silicon. La conversión la firma el desarrollador raymondchins y se distribuye con licencia Apache 2.0. El modelo original no ha sido reentrenado: se mantienen los pesos de Qwen y solo cambia el formato y la cuantización para adaptarse al hardware de Apple.

El objetivo es claro: sustituir la build anterior basada en GPU Metal por una que aproveche el Neural Engine, reduciendo el consumo energético y el tiempo de carga. Según las mediciones del autor, en un M4 (Mac mini, 16 GB) una transcripción es aproximadamente un 60 % más rápida, carga en torno a un segundo en lugar de 11 s y consume unas 6 veces menos energía. En un M5 Max la carga es unas 8 veces más rápida con una fracción de la memoria, aunque la inferencia por toma es algo más lenta que en la GPU de ese equipo.

El modelo está pensado para Speakey, una aplicación de dictado y comandos de voz para macOS que descarga los pesos automáticamente. Se distribuye como un conjunto de archivos `.mlmodelc` (encoder fp16 y decoder int8 en dos mitades), embeddings int8 y vocabulario BPE, con un total de unos 2,7 GB. Requiere macOS 15 o superior sobre Apple Silicon. Cubre 30 idiomas, incluidos español, inglés, chino, árabe, hindi y cantonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Qwen3-ASR), convertido a Core ML con tensores channels-first y convoluciones 1x1 para el ANE |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 8 segundos por llamada al encoder (800 frames); caché KV de 512 filas en el decoder |
| Tipos de cuantizacion | Encoder fp16; decoder int8 por canal; embeddings int8 con escala float32 por fila |
| Idiomas soportados | ar, cs, da, de, el, en, es, fa, fi, fil, fr, hi, hu, id, it, ja, ko, mk, ms, nl, pl, pt, ro, ru, sv, th, tr, vi, yue, zh (30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), embeddings int8 (`.i8`), vocabulario JSON, filterbank mel binario |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR 1.7B: un encoder de audio que procesa ventanas de 8 segundos (800 frames de mel) y produce 104 tokens de audio de dimensión 2048, seguido de un decoder transformer de 28 capas con RoPE (theta = 1.000.000) y un LM head que genera texto. La conversión a Core ML no altera los pesos ni el entrenamiento original; el autor indica explícitamente que los pesos son de Qwen y no se reentrenaron. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

La innovación técnica está en la adaptación al Neural Engine. El decoder se divide en dos archivos de 14 capas porque 28 capas no compilan como un único programa ANE. Se usan tensores channels-first `(1, C, 1, S)` y convoluciones 1x1 en lugar de capas lineales, lo que acelera cada paso unas 2,5 veces. Las formas son fijas: 64 filas para prefill y comprobaciones de borrador, 1 fila para el paso autoregresivo. La caché KV se implementa como 512 filas de estado Core ML escritas mediante una matriz one-hot, porque una actualización por slice caía a CPU. Los pesos del decoder son int8 por canal; la paletización de 8 y 4 bits no resultó más rápida en el ANE y la paletización uniforme de 8 bits alteraba palabras. El flujo residual se transporta dividido por 16 (`up_proj` por 4) para evitar desbordamientos de fp16 en las activaciones mayores (unas 10.700 en la capa 3), manteniendo la salida inalterada porque todas las normas son scale-free. Core ML asigna 2.298 de las 2.303 operaciones del decoder al Neural Engine; las 5 restantes son el argmax del LM head.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe en 30 idiomas, con detección automática de idioma o forzado mediante tokens de idioma específicos.
- Transcripción de audio de 16 kHz mono en ventanas de 8 segundos, con procesado exacto para cualquier longitud mediante enmascaramiento aditivo.
- Generación de texto a partir de audio con decoder autoregresivo y caché KV de 512 filas.
- Soporte de prefill por lotes (64 filas) y decodificación paso a paso (1 fila), con funciones `main`, `step` y `tail` para distintas fases.
- Selección de los siguientes tokens tras hasta 16 filas elegidas mediante la función `tail` con tensor `sel`.
- Ejecución íntegra en el Neural Engine de Apple Silicon, sin uso de GPU ni CPU para las operaciones principales.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado por voz en macOS: integrado en Speakey, el modelo transcribe audio del micrófono en tiempo real sobre el Neural Engine, con bajo consumo energético y carga rápida, adecuado para uso continuado en portátiles.
- Subtitulado local de reuniones y notas de voz: la ventana de 8 segundos y el enmascaramiento exacto permiten procesar grabaciones de cualquier duración sin depender de la nube.
- Transcripción multilingüe en aplicaciones de productividad: los 30 idiomas soportados permiten dictar en español, inglés, chino o árabe sin cambiar de modelo, forzando el idioma con los tokens correspondientes.
- Asistentes de voz y comandos por voz: la baja latencia por paso y la carga en aproximadamente un segundo en M4 facilitan la respuesta interactiva en aplicaciones de escritorio.
- Procesado por lotes en local para investigación: el prefill de 64 filas permite procesar varios fragmentos de audio en una sola llamada al decoder, útil para evaluar el modelo o generar transcripciones masivas en un Mac.
- Aplicaciones de accesibilidad: transcripción en el dispositivo sin enviar audio a servidores, con consumo reducido, adecuada para usuarios que requieren privacidad y autonomía energética.
- Integración en pipelines de macOS mediante Core ML: desarrolladores pueden cargar los `.mlmodelc` con `MLModel(contentsOf:)` y `computeUnits = .cpuAndNeuralEngine` para incorporar ASR en sus propias apps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor solo proporciona mediciones comparativas de rendimiento frente a la build anterior basada en GPU:

| Equipo | Métrica | Resultado frente a la build GPU |
|---|---|---|
| M4 (Mac mini, 16 GB) | Velocidad por toma | ~60 % más rápida |
| M4 (Mac mini, 16 GB) | Tiempo de carga | ~1 s frente a ~11 s |
| M4 (Mac mini, 16 GB) | Consumo energético | ~6 veces menor |
| M5 Max | Tiempo de carga | ~8 veces más rápido, con fracción de la memoria |
| M5 Max | Velocidad por toma | Más lenta que en la GPU grande de ese Mac, pero por debajo del umbral perceptible |

## Requisitos de hardware

- VRAM/unificada estimada: el conjunto de archivos ocupa unos 2,7 GB en disco; en memoria, la build GPU llegaba a retener unos 5 GB durante la compilación del grafo Metal, mientras que la build ANE carga desde la caché de Core ML con mucha menos memoria.
- GPU/SoC recomendados: cualquier Apple Silicon con Neural Engine (M1 y posteriores). Las mediciones se hicieron en M4 (Mac mini, 16 GB) y M5 Max.
- ¿Cabe en hardware de consumo? Sí: está diseñado para Macs de consumo con Apple Silicon, incluidos equipos de 8 GB, donde la build GPU era problemática por el uso transitorio de memoria.
- Requisito de sistema: macOS 15 o superior (necesario para el estado de Core ML).
- Opciones de despliegue: Core ML nativo mediante `MLModel` con `computeUnits = .cpuAndNeuralEngine`; descarga con `hf download raymondchins/qwen3-asr-1.7b-coreml-ane --local-dir qwen3-asr-1.7b-coreml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en M4 una toma es ~60 % más rápida que en la build GPU; en M5 Max la toma es más lenta que en la GPU de ese equipo pero imperceptible para una persona. No se proporcionan cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-asr-1.7b-coreml-ane (este) | 1,7 B | Ventana de audio de 8 s; caché KV de 512 filas | Core ML, Neural Engine de Apple Silicon | Apache 2.0 | Hugging Face, 0 descargas |
| raymondchins/qwen3-asr-1.7b-coreml | 1,7 B | Igual (modelo base idéntico) | Core ML, decoder en GPU Metal | Apache 2.0 | Hugging Face, mantenido para builds antiguas de Speakey |
| raymondchins/qwen3-asr-0.6b-coreml-ane | 0,6 B | No disponible | Core ML, Neural Engine | Apache 2.0 | Hugging Face, más pequeño y rápido, con más errores de palabra |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | No disponible | Pesos originales (safetensors, presumiblemente) | Apache 2.0 | Hugging Face, modelo base |

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos; al ser una conversión sin reentrenamiento, hereda los del modelo base Qwen3-ASR-1.7B, no evaluados en la información disponible.
- Alucinación: no se han publicado tasas de error ni evaluaciones de alucinación para esta conversión; la build de 0,6 B se describe con "más errores de palabra", lo que sugiere que la precisión depende del tamaño.
- Limitaciones de contexto: el encoder procesa ventanas fijas de 8 segundos y la caché KV del decoder está limitada a 512 filas; audios más largos requieren segmentación y enmascaramiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el archivo NOTICE que documenta los cambios.
- Requisito de plataforma: solo funciona en macOS 15 o superior sobre Apple Silicon; no es portable a Linux, Windows ni GPU NVIDIA.
- Cuantización: el decoder int8 por canal puede introducir degradación frente a los pesos originales; el autor descarta paletización de 8 y 4 bits por falta de velocidad y por alteración de palabras.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y está atado a una aplicación concreta (Speakey); la integración externa requiere implementar manualmente el pipeline de mel, prompt y caché KV descrito en la model card.
- El texto de la model card se corta en el paso 6 de las instrucciones de ejecución, por lo que la documentación de la función `tail` y del bucle de decodificación está incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/raymondchins/qwen3-asr-1.7b-coreml-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Build anterior en GPU: https://huggingface.co/raymondchins/qwen3-asr-1.7b-coreml
- Versión 0.6B para ANE: https://huggingface.co/raymondchins/qwen3-asr-0.6b-coreml-ane
- Aplicación Speakey: https://speakey.dev
- Paper referenciado en los tags: arXiv:2601.21337
