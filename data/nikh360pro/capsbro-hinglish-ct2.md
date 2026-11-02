# nikh360pro/capsbro-hinglish-ct2

## Resumen

CapsBro Hinglish es una conversión a CTranslate2 (float16) del modelo Trelis/whisper-hinglish-preview, un Whisper large-v3 ajustado por Trelis Research para reconocimiento automático de voz (ASR) en Hinglish, es decir, en hindi e inglés mezclados dentro de una misma frase. El autor de la conversión, nikh360pro, no modifica los pesos: únicamente transforma el checkpoint original al formato que consume faster-whisper, lo que permite ejecutar el modelo con una latencia y un consumo de memoria significativamente menores que la implementación original de PyTorch.

El modelo resuelve el problema del code-switching entre hindi e inglés, un fenómeno muy común en conversaciones reales de la India que los Whisper estándar tienden a transcribir de forma inconsistente. Al estar basado en Whisper large-v3, hereda una arquitectura encoder-decoder transformer de aproximadamente 1550 millones de parámetros, con una ventana de audio de 30 segundos por segmento y una tokenización multilingüe estándar.

Es relevante ahora por su licencia Apache 2.0, su compatibilidad directa con faster-whisper y su tamaño de repositorio de 3,1 GB, que lo hacen desplegable en GPUs de gama media para subtitulado automático de contenido en hindi e Hinglish sin necesidad de infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | no disponible (hereda los de Whisper large-v3, aproximadamente 1550 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | float16 (unica version publicada en este repositorio) |
| Idiomas soportados | hindi (hi), ingles (en), Hinglish (mezcla de ambos) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3, un transformer encoder-decoder entrenado originalmente por OpenAI para ASR multilingüe, con entrada de audio tipo mel-spectrogram y salida de tokens de texto. Trelis Research partió de este checkpoint y lo ajustó de forma supervisada sobre datos de Hinglish, manteniendo el tokenizador estándar de Whisper large-v3. La conversión de nikh360pro aplica `ct2-transformers-converter` con cuantización float16, que preserva los pesos originales y solo cambia el formato de almacenamiento y el grafo de ejecución para CTranslate2.

No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset de ajuste ni si hubo etapas de RLHF o DPO; estos detalles pertenecen al modelo original de Trelis y no están documentados en la información proporcionada. La innovación técnica de esta ficha es exclusivamente operativa: la conversión a CTranslate2 permite inferencia optimizada en CPU y GPU mediante faster-whisper, con soporte de cuantización float16 y decodificación por lotes.

## Capacidades

- Transcripción de audio en hindi, inglés y Hinglish con mezcla de idiomas dentro de una misma frase.
- Generación de subtítulos (captions) para vídeo, uso declarado por el autor de la conversión.
- Detección y transcripción de segmentos de 30 segundos con marcas de tiempo, comportamiento propio de Whisper.
- Ejecución mediante faster-whisper con backend CTranslate2, incluyendo decodificación en lotes.
- Soporte de audio de entrada en formato estándar (16 kHz, mono) tras el preprocesado de faster-whisper.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento extendido; al ser un modelo ASR, estas capacidades no aplican.

## Casos de uso

- Subtitulado automático de vídeo en Hinglish: el modelo transcribe audio mixto hindi-inglés y genera subtítulos con marcas de tiempo, adecuado para creadores de contenido que publican en redes sociales y plataformas de vídeo.
- Transcripción de reuniones y llamadas de atención al cliente: permite convertir conversaciones reales donde los hablantes alternan hindi e inglés, algo que los Whisper monolingües suelen fallar.
- Generación de actas y notas para podcasts y entrevistas: el pipeline faster-whisper procesa ficheros largos por segmentos de 30 s y produce transcripciones con timestamps utilizables en herramientas de edición.
- Indexación y búsqueda de contenido audiovisual: las transcripciones generadas permiten construir índices de texto sobre archivos de audio o vídeo para búsqueda semántica.
- Accesibilidad para personas con discapacidad auditiva: subtítulos en hindi e inglés para contenido educativo y institucional, con licencia Apache 2.0 que permite uso comercial.
- Preprocesado para datasets de ASR: uso del modelo para transcribir corpus masivos de audio en Hinglish antes de entrenar modelos posteriores o de evaluar sistemas existentes.
- Integración en aplicaciones móviles o de escritorio: al estar en CTranslate2 float16 y pesar 3,1 GB, puede desplegarse en entornos con GPU modesta o incluso CPU optimizada mediante faster-whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 3-4 GB para los pesos, más overhead de activaciones y buffers de audio; en la práctica se recomienda al menos 6 GB de VRAM para lotes pequeños.
- GPU recomendadas: NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 y H100; cualquier GPU con soporte CUDA y al menos 6 GB de VRAM puede ejecutar el modelo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también puede ejecutarse en CPU mediante CTranslate2, con mayor latencia.
- Opciones de despliegue: faster-whisper (backend CTranslate2), servidores compatibles con CTranslate2 y wrappers de Python sobre faster-whisper; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato para ASR.
- Latencia y throughput: no disponible; dependen de la GPU, del tamaño del audio y de la configuración de decodificación por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| CapsBro Hinglish (este modelo) | ~1550 M (heredados) | 30 s por segmento | hi, en, Hinglish | Apache 2.0 | CTranslate2 float16 |
| Trelis/whisper-hinglish-preview | ~1550 M | 30 s por segmento | hi, en, Hinglish | Apache 2.0 | safetensors (Transformers) |
| OpenAI Whisper large-v3 | ~1550 M | 30 s por segmento | multilingüe (99 idiomas) | MIT | safetensors, CTranslate2, GGUF |
| OpenAI Whisper small | ~244 M | 30 s por segmento | multilingüe | MIT | safetensors, CTranslate2, GGUF |

La diferencia principal frente al modelo base de Trelis es el formato: este repositorio ofrece CTranslate2 float16 listo para faster-whisper, mientras que el original requiere Transformers. Frente a Whisper large-v3 de OpenAI, pierde cobertura multilingüe general pero gana especialización en Hinglish. Frente a Whisper small, es mucho más pesado pero sustancialmente más preciso en hindi e inglés mezclados.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Whisper large-v3, puede heredar sesgos de representación de acentos, variedades regionales del hindi y hablantes no nativos; no se documenta ningún análisis específico.
- Riesgo de alucinación: Whisper tiende a inventar texto en segmentos con ruido, silencios largos o audio musical; este modelo no está exento de ese comportamiento.
- Limitaciones de contexto: ventana fija de 30 segundos por segmento, propia de Whisper; audios más largos deben segmentarse, lo que puede cortar frases a mitad.
- Limitaciones de idioma: solo hindi e inglés (y su mezcla); no cubre otras lenguas indias ni acentos no representados en el ajuste de Trelis.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar el aviso de licencia y atribuir a Trelis Research y a OpenAI según corresponda.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; conviene evaluar la precisión en el dominio propio antes de desplegar. No hay métricas publicadas de WER ni de rendimiento, y el pipeline no está declarado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikh360pro/capsbro-hinglish-ct2
- Modelo base: https://huggingface.co/Trelis/whisper-hinglish-preview
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper large-v3 de OpenAI: https://huggingface.co/openai/whisper-large-v3
