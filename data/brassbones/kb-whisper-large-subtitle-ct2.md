# BrassBones/kb-whisper-large-subtitle-ct2

## Resumen

El modelo `BrassBones/kb-whisper-large-subtitle-ct2` es una conversión a formato CTranslate2 del checkpoint `KBLab/kb-whisper-large` en su revisión `subtitle`, realizada por un tercero (BrassBones) para que pueda cargarse directamente con la librería faster-whisper. No se trata de un lanzamiento oficial de KBLab, sino de una adaptación de formato que conserva los pesos del modelo original, almacenados en precisión float16. El modelo base, KB-Whisper, es un sistema de reconocimiento automático de voz (ASR) desarrollado por KBLab (Biblioteca Nacional de Suecia), fine-tuneado sobre 50 000 horas de habla sueca transcrita, y que según sus autores reduce el error de transcripción (WER) en un 47 % de media frente a OpenAI Whisper-large-v3 en evaluaciones sobre FLEURS, Common Voice y NST.

La variante `subtitle` está específicamente ajustada para producir salidas condensadas, similares a los subtítulos de emisión, eliminando muletillas y comprimiendo la redacción. Esto la hace especialmente adecuada para generación de subtítulos, aunque su rendimiento en métricas de WER verbatim será inferior al del checkpoint `main` por diseño. El modelo está licenciado bajo Apache-2.0 y soporta exclusivamente el idioma sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (variante de Whisper large) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper: 30 segundos) |
| Tipos de cuantizacion | float16 (almacenamiento); int8 o float16 en inferencia mediante faster-whisper |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json, preprocessor_config.json, vocabulary.json) |

## Arquitectura y entrenamiento

El modelo base `KBLab/kb-whisper-large` es una adaptación de Whisper large, la arquitectura encoder-decoder de OpenAI, fine-tuneada por KBLab con 50 000 horas de habla sueca transcrita. El entrenamiento se realizó en varias etapas, y la revisión `subtitle` corresponde a un ajuste adicional orientado a producir subtítulos condensados, similares a los de la televisión pública sueca. Esta variante elimina deliberadamente rellenos y comprime la redacción, por lo que su WER verbatim es peor que el del checkpoint `main`, pero su salida es más adecuada para subtitulación.

La conversión a CTranslate2 se realizó con `ct2-transformers-converter` (ctranslate2 4.8.1) usando cuantización float16. El repositorio contiene los archivos necesarios para cargar el modelo con faster-whisper, y se verificó su funcionamiento en CPU con `compute_type="int8"`. No se dispone de información adicional sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en sueco, con salida de texto condensado orientada a subtítulos.
- Transcripción de audio con marcas de tiempo (inicio y fin de cada segmento) mediante faster-whisper.
- Soporte de inferencia en CPU (int8) y GPU (float16) a través de faster-whisper.
- No incluye capacidades de tool calling, agentes, visión ni otros dominios; es un modelo puramente de audio a texto.

## Casos de uso

- Generación de subtítulos para vídeo y televisión: el modelo produce frases condensadas y legibles, ideales para subtitular contenido en sueco de forma automática, reduciendo el trabajo de edición posterior.
- Transcripción de reuniones y entrevistas: puede convertir grabaciones de audio en actas o resúmenes textuales, aunque al ser la variante `subtitle` la salida no será verbatim, sino resumida.
- Archivado y búsqueda de contenido audiovisual: transcribir archivos de audio o vídeo para indexarlos y permitir búsquedas por texto en bibliotecas o hemerotecas.
- Asistencia a personas con discapacidad auditiva: generar subtítulos en tiempo real o diferido para eventos, conferencias o clases en sueco.
- Análisis de medios: extraer el contenido hablado de noticias, podcasts o programas de radio para análisis de sentimiento, temas o citas.
- Integración en pipelines de procesado de vídeo: al ser un modelo CTranslate2, puede desplegarse con faster-whisper en servicios de transcripción por lotes o en tiempo real, con bajo consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión CTranslate2. Sin embargo, el modelo base `KBLab/kb-whisper-large` reporta una reducción media del 47 % en WER frente a OpenAI Whisper-large-v3 en sueco, evaluado en FLEURS, Common Voice y NST. También se indica que `kb-whisper-small` supera a `openai/whisper-large-v3` (un modelo seis veces mayor) en habla sueca. No se dispone de cifras concretas de WER para la variante `subtitle`, ya que su objetivo no es la transcripción verbatim.

## Requisitos de hardware

- Tamaño del repositorio: 3,1 GB (pesos en float16).
- Inferencia en CPU: verificada con faster-whisper 1.2.1 usando `compute_type="int8"`; requiere aproximadamente 3-4 GB de RAM.
- Inferencia en GPU: recomendada para menor latencia; con `compute_type="float16"` cabe en GPUs con al menos 4 GB de VRAM (p. ej., RTX 3050, RTX 2060, T4).
- Despliegue: compatible con faster-whisper, que a su vez puede usarse con servidores como WhisperX o integraciones propias. No se menciona soporte para vLLM, Ollama o TGI, ya que es un modelo de audio.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| BrassBones/kb-whisper-large-subtitle-ct2 | no disponible (Whisper large) | no disponible | sueco | Apache-2.0 | CTranslate2 |
| KBLab/kb-whisper-large (revision main) | no disponible (Whisper large) | no disponible | sueco | Apache-2.0 | Transformers (PyTorch) |
| openai/whisper-large-v3 | 1550M (aprox.) | 30 s audio | multilingue | MIT | Transformers, CT2, GGUF |
| KBLab/kb-whisper-small | no disponible (Whisper small) | no disponible | sueco | Apache-2.0 | Transformers |

La comparativa se basa en datos públicos de los modelos base. La conversión CT2 no altera el rendimiento del modelo original, solo el formato de pesos.

## Limitaciones y advertencias

- Conversión no oficial: este repositorio no es un lanzamiento de KBLab; si KBLab publica una versión CT2 oficial, se recomienda usar esa en su lugar.
- La variante `subtitle` produce texto condensado, no verbatim; no es adecuada para transcripciones literales o análisis lingüístico que requieran fidelidad exacta.
- Modelo limitado al idioma sueco; no soporta otros idiomas.
- No se proporcionan métricas de rendimiento específicas para esta conversión; el rendimiento real puede variar según el hardware y la configuración de inferencia.
- Al ser un modelo de audio, no tiene capacidades de texto general, tool calling ni agentes.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el trabajo de KBLab según se indica en el modelo card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BrassBones/kb-whisper-large-subtitle-ct2
- Modelo base KBLab: https://huggingface.co/KBLab/kb-whisper-large
- Blog de KBLab sobre KB-Whisper: https://kb-labb.github.io/posts/2025-03-07-welcome-KB-Whisper/index.html
- faster-whisper (librería de inferencia): https://github.com/SYSTRAN/faster-whisper
