# GhaythMahadin/parakeet-unified-en-0.6b-gguf

## Resumen

parakeet-unified-en-0.6b-gguf es una conversión al formato GGUF del modelo de reconocimiento automático de voz nvidia/parakeet-unified-en-0.6b, publicada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C/C++ pensada para inferencia local sin dependencias de Python. El modelo realiza transcripción de voz en inglés con puntuación y mayúsculas incorporadas, y está pensado para ejecutarse en CPU, GPU o aceleradores Apple Silicon sin necesidad de stack CUDA ni de NeMo.

El modelo subyacente, desarrollado por NVIDIA, es un sistema ASR de arquitectura transducer (RNN-T) con encoder FastConformer de aproximadamente 618 millones de parámetros, entrenado como modelo "unificado" que soporta tanto inferencia offline como streaming con latencias de entre 160 ms y 2080 ms. La conversión GGUF permite desplegar esta capacidad en entornos de borde y aplicaciones de escritorio, algo relevante porque reduce el coste de infraestructura frente a soluciones ASR basadas en servicios en la nube.

La relevancia de esta ficha radica en que combina un modelo de precisión competitiva (WER del 1,58-1,62 % en LibriSpeech test-clean según cuantización) con un empaquetado ligero (desde 477 MB en Q4_K_M) y licencia CC-BY-4.0, lo que facilita su integración en productos comerciales. La principal limitación es que esta conversión concreta solo expone el modo offline, aunque los pesos incluyen los contextos de atención para streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer RNN-T con encoder FastConformer (Conformer) |
| Parametros totales | 618.309.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio variable, streaming con contexto derecho configurable de 160 a 2080 ms en el modelo base) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés, principalmente en-US) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (conversión desde safetensors de NVIDIA) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transducer RNN-T: un encoder FastConformer, variante eficiente de Conformer que combina convoluciones y autoatención, seguido de un decoder RNN-T que predice tokens de forma autorregresiva condicionada por el estado del encoder. El modelo fue entrenado de forma conjunta en modos offline y streaming, lo que le permite operar con una única parametrización para ambos regímenes; el chunk de streaming es configurable con pasos de 80 ms y una latencia mínima de 160 ms. Según la model card original, el entrenamiento se realizó mayoritariamente sobre la parte inglesa del dataset Granary, con aproximadamente 250.000 horas de habla en inglés estadounidense en condiciones acústicas diversas.

La conversión GGUF preserva los pesos del encoder y del decoder RNN-T y los cuantiza a distintos niveles (desde F32 hasta Q4_K_M). El autor indica que la conversión se validó numéricamente contra la referencia NeMo en el commit 42528dd de transcribe.cpp, fijando el commit upstream d4ac992 del modelo base. La decodificación es greedy RNN-T sin modelo de lenguaje externo, y los timestamps se emiten a nivel de token. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá del dato de Granary.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas automáticas.
- Soporte de timestamps a nivel de token.
- Modelo unificado offline/streaming en origen; esta conversión GGUF expone únicamente el modo offline.
- Ejecución en CPU, GPU (Vulkan) y Apple Silicon (Metal) mediante transcribe.cpp.
- Entrada de audio a 16 kHz mono WAV (se requiere conversión previa con ffmpeg para otros formatos).
- No soporta traducción (translate: false) ni detección de idioma (lang_detect: false).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Subtitulado y transcripción de reuniones: el modelo procesa audio de 16 kHz mono y genera texto con puntuación y timestamps por token, lo que permite alinear subtítulos con precisión en herramientas de actas y notas automáticas.
- Dictado por voz en aplicaciones de escritorio: con cuantizaciones de 477-731 MB y soporte Metal/Vulkan, puede integrarse en apps nativas sin depender de servicios en la nube, manteniendo la privacidad del audio.
- Transcripción por lotes en servidores sin GPU: el modo CPU de transcribe.cpp ofrece un RTF de 7,5 en Ryzen 4750U, suficiente para procesar archivos de audio en pipelines de ingestión documental.
- Accesibilidad y lectores de voz: la baja latencia del modelo base (desde 160 ms en streaming) y la precisión del 1,6 % de WER en test-clean lo hacen adecuado para sistemas de ayuda auditiva o transcripción en directo, aunque esta conversión concreta solo opera offline.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones con puntuación para su posterior procesamiento NLP, indexación y búsqueda semántica en sistemas CRM.
- Investigación en ASR y evaluación de cuantizaciones: el paquete incluye seis niveles de cuantización con WER medido (1,58-1,62 %), lo que facilita estudios de compromiso precisión/tamaño en entornos de borde.
- Generación de datasets de voz etiquetados: uso del modelo como anotador automático de audio inglés para construir corpus de entrenamiento de otros sistemas.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,59 | 1,59 | 1,60 | 1,61 | 1,58 | 1,62 |
| Tamano (GB) | 2,47 | 1,24 | 0,731 | 0,602 | 0,541 | 0,477 |

| Metrica de velocidad | Valor |
|---|---|
| RTF en Apple M4 Max (Metal) | 163 |
| RTF en Apple M4 Max (CPU) | 28,5 |
| RTF en Ryzen 4750U (Vulkan) | 12,5 |
| RTF en Ryzen 4750U (CPU) | 7,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy RNN-T y sin modelo de lenguaje externo. La referencia F32 es 1,59 %; NVIDIA reporta 1,63 % en el mismo split. El RTF (real-time factor) indica múltiplos de velocidad en tiempo real: valores más altos son mejores.

## Requisitos de hardware

- VRAM estimada: desde menos de 1 GB en Q4_K_M (477 MB de pesos) hasta unos 3 GB en F32 (2,47 GB de pesos más overhead de runtime).
- GPU recomendadas: cualquier GPU con soporte Vulkan (integradas incluidas); en Apple Silicon se usa Metal. No requiere GPU dedicada de gama alta.
- Cabe en GPUs de consumo: sí, en cualquier GPU con al menos 1-3 GB de memoria libre, e incluso en CPU sin acelerador.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 163 en M4 Max con Metal, 28,5 en M4 Max con CPU, 12,5 en Ryzen 4750U con Vulkan y 7,5 en Ryzen 4750U con CPU. En el modelo base, latencia de streaming desde 160 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/streaming | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|---|
| parakeet-unified-en-0.6b (esta conversión) | 618 M | en | offline (streaming en origen) | 1,58-1,62 % | CC-BY-4.0 | GGUF |
| nvidia/parakeet-unified-en-0.6b (original) | 618 M | en | offline + streaming 160-2080 ms | 1,63 % (reportado) | CC-BY-4.0 | safetensors/NeMo |
| Whisper large-v3 | no disponible en la información | multilingüe | offline | no disponible en la información | MIT (según conocimiento general, no verificado aquí) | múltiples |
| Whisper small | no disponible en la información | multilingüe | offline | no disponible en la información | MIT (según conocimiento general, no verificado aquí) | múltiples |

No se dispone en la información proporcionada de datos comparativos de WER de alternativas como Whisper en el mismo split, por lo que la comparativa se limita a los datos del propio modelo y su versión original.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni detección de idioma; el rendimiento en acentos no estadounidenses no está documentado.
- Solo modo offline en esta conversión: aunque los pesos incluyen contextos de streaming, transcribe.cpp no expone todavía una entrada de streaming, por lo que no se puede usar para subtitulado en tiempo real con este paquete.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido o silencio; no se han publicado análisis específicos de este comportamiento.
- Sesgos: entrenado mayoritariamente con habla en-US de Granary; puede tener peor rendimiento en variedades dialectales, hablantes no nativos o condiciones acústicas poco representadas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y mantener los términos de la licencia.
- Dependencia de transcribe.cpp: requiere compilar desde fuente y no está disponible en frameworks estándar como PyTorch o ONNX Runtime; el ecosistema de herramientas es limitado.
- Preprocesado obligatorio: la entrada debe ser WAV mono a 16 kHz; otros formatos requieren conversión previa con ffmpeg.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la validación comunitaria es nula, aunque el autor documenta validación numérica contra NeMo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/parakeet-unified-en-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit upstream fijado: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Paper de referencia (arXiv 2604.19079): https://arxiv.org/abs/2604.19079
- Paper de referencia (arXiv 2305.05084): https://arxiv.org/abs/2305.05084
- Paper de referencia (arXiv 2304.09325): https://arxiv.org/abs/2304.09325
