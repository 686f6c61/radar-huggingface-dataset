# aoiandroid/whisper-id-large-v3-turbo-whisperkit-coreml-macos

## Resumen

Este repositorio es una conversión a Core ML con el formato de WhisperKit del modelo Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1, un ajuste fino de openai/whisper-large-v3-turbo para indonesio (id) e inglés (en). Lo publica aoiandroid como espejo para el proyecto TranslateBlue y conserva la licencia MIT del modelo base y del original de OpenAI.

El paquete incluye tres componentes .mlmodelc (espectrograma mel de 128 bins, codificador de audio de 466 MB y decodificador de texto de 123 MB con KV de 448) y ocupa unos 592 MB. Se ha aplicado una palettización k-means de 6 bits por tensor sobre los pesos de 2048 elementos o más, manteniendo el resto en fp16, y está orientado a inferencia local en macOS 13 o iOS 16 en adelante.

Su interés práctico es que acerca la precisión de un ajuste fino de large-v3-turbo para indonesio al ecosistema Core ML de Apple con un tamaño reducido y sin dependencia de la nube. No hay datos publicados de número de parámetros ni de WER estándar; la evaluación disponible se limita a una métrica de cobertura léxica sobre clips de 60 s.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); atención SplitHeadsQ en el codificador y Cat en el decodificador; entrada de 128 bins mel; KV del decodificador de 448 |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | ventanas de audio de 30 s o menos; KV del decodificador de 448 tokens |
| Tipos de cuantización | fp16 con palettización k-means de 6 bits por tensor (aplicada a pesos de 2048 elementos o más) |
| Idiomas soportados | indonesio (id) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlmodelc, diseño WhisperKit); incluye config.json, generation_config.json, tokenizer.json y tokenizer_config.json |
| Tamaño del paquete | ~592 MB (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un transformer encoder-decoder que consume espectrogramas mel de 128 bins y genera tokens de texto. La conversión emplea las herramientas de argmaxinc/whisperkittools (commit 84f77a83) con atención SplitHeadsQ en el codificador y Cat en el decodificador, operaciones fp16 y opset iOS16/macOS13. El decodificador se generó con whisperkit-generate-model (PSNR torch→Core ML de 35,5) y el codificador se trazó desde el mismo módulo con un script de bajo consumo de memoria. La compresión posterior al entrenamiento aplica palettización k-means de 6 bits por tensor con coremltools a todos los pesos de 2048 elementos o más, sin modificar el resto.

El ajuste fino subyacente (Willy030125) parte de openai/whisper-large-v3-turbo y se entrenó para indonesio e inglés. La model card cita como datos de entrenamiento google/fleurs, Willy030125/librivox_filtered_id, Willy030125/ambient_noise_audio y Willy030125/STT_IndoSpeech_YT_Dataset. No se documentan el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. Tampoco se especifica qué partición de FLEURS se usó para evaluar, lo que puede inflar las métricas.

## Capacidades

- Reconocimiento automático de voz (ASR) offline para indonesio e inglés.
- Transcripción por ventanas de audio de 30 s o menos, con decodificación greedy y una caída a temperatura 0,2 ante fallos.
- Cobertura léxica alta en indonesio: 0,985 de media en clips de 60 s de FLEURS id según la evaluación del autor.
- Ejecución en el Neural Engine y la GPU de Apple mediante Core ML y WhisperKit.
- Tokenizador heredado de openai/whisper-large-v3-turbo, con vocabulario idéntico.
- No incluye el componente opcional TextDecoderContextPrefill de WhisperKit.
- Tareas de traducción voz→texto entre id y en: no documentadas en la model card.
- Tool calling, agentes multi-paso, visión u otros modos multimodales: no aplica, es un modelo exclusivamente ASR.
- Capacidad multilingüe limitada a indonesio e inglés.

## Casos de uso

- Transcripción y dictado offline en apps de macOS/iOS: el paquete Core ML de 592 MB se integra con WhisperKit y se ejecuta en el Neural Engine sin enviar audio a la nube, lo que encaja en aplicaciones de notas de voz o procesadores de texto en indonesio.
- Subtitulado de vídeo en indonesio: procesando el audio en ventanas de 30 s o menos con decodificación greedy y fallback a temperatura 0,2; la cobertura de 0,904 en un clip de noticias de TV de 60 s respalda su uso en contenido informativo.
- Asistentes de voz locales: al residir en la memoria unificada de Apple Silicon, permite comandos de voz y respuestas habladas sin coste de API ni conexión, aunque la latencia no está publicada.
- Reuniones y llamadas bilingües id/en: el ajuste cubre ambos idiomas, de modo que una misma sesión puede alternar entre indonesio e inglés sin cambiar de modelo.
- Indexación y búsqueda de archivos de audio: transcripción de grabaciones de Librivox o de YouTube (fuentes citadas en el entrenamiento) para generar índices de texto consultables.
- Generación de datos pseudo-etiquetados para ASR indonesio: usar las transcripciones como etiquetas débiles en corpus sin anotar, asumiendo el riesgo de alucinación en segmentos ruidosos.
- Accesibilidad: dictado en tiempo real en Mac o iPhone para usuarios que escriben en indonesio, aprovechando el soporte de iOS 16+ y el procesado local.
- Prototipado e investigación: comparar este paquete de 6 bits frente a los modelos medium-id (cahya, Scrya) para medir el compromiso precisión/tamaño en Apple Silicon.

## Benchmarks y rendimiento

La model card solo publica una métrica de cobertura: cobertura de bolsa de palabras de contenido ponderada por frecuencia entre la transcripción y la referencia, sobre clips de 60 s, decodificación greedy con un fallback a temperatura 0,2 y ventanas de 30 s o menos. No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | FLEURS id, clips de 60 s (5, media / mínimo) | Clip de noticias de TV en indonesio de 60 s |
|---|---|---|
| Este paquete Core ML (6 bits) | 0,985 / 0,972 | 0,904 |
| Ajuste fino de origen (PyTorch fp32) | 0,987 / 0,972 | 0,888 |
| cahya/whisper-medium-id (PyTorch) | 0,919 / 0,901 | 0,872 |
| Scrya/whisper-medium-id-augmented (PyTorch bf16) | 0,937 / 0,914 | 0,832 |
| openai/whisper-small | 0,843 / 0,807 | 0,760 |

Advertencia del propio autor: el ajuste fino se entrenó con FLEURS, pero no se documenta qué partición se usó, por lo que los valores de FLEURS pueden ser optimistas. El clip de noticias no estaba en los datos de entrenamiento inspeccionables. La métrica no es WER y no es directamente comparable con resultados publicados en otras evaluaciones.

## Requisitos de hardware

- Tamaño de pesos: ~592 MB en total (codificador 466 MB, decodificador 123 MB, espectrograma mel aparte).
- VRAM o memoria unificada estimada: no disponible de forma explícita; por el tamaño de los componentes cabe con holgura en la memoria unificada de cualquier Mac con Apple Silicon y en dispositivos iOS compatibles.
- GPU recomendadas: SoC Apple Silicon (M1 o superior) con Neural Engine; el paquete no incluye pesos para CUDA ni ROCm.
- Consumer GPU: sí, cualquier Mac con M1/M2/M3/M4 y iPhone/iPad con Neural Engine; no es ejecutable en GPU NVIDIA o AMD sin una reconversión a otro formato.
- Opciones de despliegue: WhisperKit (Argmax) y Core ML / coremltools; vLLM, llama.cpp, Ollama y TGI no aplican al formato Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato y plataforma | Idiomas | Cobertura FLEURS id (media) | Cobertura noticias TV | Licencia |
|---|---|---|---|---|---|
| Este paquete Core ML | Core ML (.mlmodelc, 6 bits), Apple | id, en | 0,985 | 0,904 | MIT |
| Ajuste fino de origen | PyTorch fp32, multiplataforma | id, en | 0,987 | 0,888 | MIT |
| cahya/whisper-medium-id | PyTorch, multiplataforma | id | 0,919 | 0,872 | no disponible |
| Scrya/whisper-medium-id-augmented | PyTorch bf16, multiplataforma | id | 0,937 | 0,832 | no disponible |
| openai/whisper-small | PyTorch, multiplataforma | multilingüe (no detallado) | 0,843 | 0,760 | MIT |

No se dispone de datos de número de parámetros, contexto o throughput para los modelos comparados en la información proporcionada. La comparación se limita a la métrica de cobertura del autor.

## Limitaciones y advertencias

- La evaluación usa cobertura léxica, no WER, por lo que no permite comparación directa con benchmarks estándar de ASR.
- Los números de FLEURS pueden ser optimistas: el ajuste fino se entrenó con FLEURS y no se documenta la partición empleada.
- Solo cubre indonesio e inglés; el rendimiento en otros idiomas no está evaluado y previsiblemente se degrada.
- Riesgo de alucinación en silencios o ruido: es una característica conocida de la familia Whisper, no verificada específicamente en esta conversión.
- La palettización de 6 bits puede introducir pérdida de precisión; en la evaluación la diferencia frente a fp32 es de 0,002 puntos en FLEURS id y de +0,016 en el clip de noticias.
- No incluye TextDecoderContextPrefill, componente opcional en WhisperKit que puede afectar al rendimiento en algunos flujos.
- Dependencia de plataforma: Core ML es exclusivo de Apple (macOS 13+/iOS 16+). El repositorio no ofrece pesos GGUF, safetensors ni ONNX.
- Trazabilidad limitada: 0 descargas y 0 likes, publicada por un usuario sin verificación de HuggingFace.
- La licencia MIT permite uso comercial manteniendo la atribución a Willy030125 y OpenAI, pero no se detallan los términos de los datasets usados en el ajuste fino.
- No se documentan sesgos lingüísticos, sociodemográficos ni de acento para este ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aoiandroid/whisper-id-large-v3-turbo-whisperkit-coreml-macos
- Modelo base del ajuste fino: https://huggingface.co/Willy030125/whisper_large_v3_turbo_finetuned_en_id_v1
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Herramientas de conversión whisperkittools: https://github.com/argmaxinc/whisperkittools
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Colección Whisper de aoiandroid: https://huggingface.co/collections/aoiandroid/whisper
- cahya/whisper-medium-id: https://huggingface.co/cahya/whisper-medium-id
- Scrya/whisper-medium-id-augmented: https://huggingface.co/Scrya/whisper-medium-id-augmented
- openai/whisper-small: https://huggingface.co/openai/whisper-small
- Dataset google/fleurs: https://huggingface.co/datasets/google/fleurs
