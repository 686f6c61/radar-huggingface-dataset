# longlenai-team/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje aumentado con voz (SALM, *Speech-Augmented Language Model*) desarrollado por NVIDIA para transcripción y comprensión de audio multilingüe. Con 34.000 millones de parámetros totales y aproximadamente 4.300 millones activos, emplea una arquitectura híbrida Mamba-2/Transformer con mezcla de expertos (MoE) acoplada a un codificador paralelo de expertos (codificador ASR Transformer y codificador de hablante). El modelo base es nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, sobre el que se ha realizado un ajuste específico para tareas de voz.

El modelo resuelve el problema de convertir audio en texto estructurado y enriquecido: transcripción literal o escrita, traducción de voz, diarización con atribución de hablante, predicción de marcas temporales a nivel de palabra, identificación de idioma, detección de cambio de código (*code-switching*) y respuesta a preguntas sobre audio. Soporta grabaciones de hasta una hora con una ventana de contexto de 65.536 tokens, lo que lo sitúa en el segmento de modelos de voz de formato largo orientados a producción.

Su relevancia actual radica en que se distribuye como pesos abiertos en BF16, FP8 y NVFP4, con licencia OpenMDW-1.1 que permite uso comercial, y en que cubre 40 idiomas (incluido el español) con una sola inferencia. La ficha de Hugging Face corresponde a una réplica publicada por el usuario longlenai-team; el modelo original lo publica NVIDIA bajo el identificador nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con mezcla de expertos (MoE); codificador paralelo de expertos (codificador ASR Transformer y codificador de hablante) |
| Parametros totales | 33.697.781.029 (34B, incluyendo el codificador de audio) |
| Parametros activos | Aproximadamente 4.300 millones (4.3B), incluyendo el codificador de audio |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8 y NVFP4 (variantes publicadas por NVIDIA) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors (librería NeMo); variantes BF16, FP8 y NVFP4 |
| Entradas / salidas | Audio y texto / texto, con marcas temporales opcionales a nivel de palabra |
| Tareas | Transcripción literal o escrita, transcripción contextual, transcripción con hablante, transcripción enriquecida, traducción de voz, identificación de idioma, respuesta a preguntas sobre audio |
| Despliegue de referencia | 1× H100 80 GB |

## Arquitectura y entrenamiento

El modelo combina un *backbone* de lenguaje híbrido Mamba-2/Transformer con mezcla de expertos, que activa unos 4.300 millones de parámetros por token, con un codificador paralelo de expertos compuesto por un codificador ASR de tipo Transformer y un codificador de hablante. Esta separación permite procesar simultáneamente contenido lingüístico y características de identidad del hablante, lo que habilita la transcripción con atribución de hablante y la diarización dentro de una única pasada de inferencia. El contexto de 65.536 tokens está dimensionado para acomodar grabaciones de hasta una hora sin truncamiento.

El entrenamiento parte del modelo de lenguaje nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 y se completa con un ajuste específico sobre el dataset nvidia/Granary-v2. La mezcla de entrenamiento incluye las tareas de transcripción, traducción de voz, identificación de idioma y respuesta a preguntas sobre audio, además de una pequeña proporción de seguimiento de instrucciones textuales y de etiquetado y redacción de PII. El modelo incorpora Multi-Token Prediction (MTP) nativo para decodificación especulativa, con un modelo borrador opcional DFlash2. La model card no detalla el número exacto de tokens de audio utilizados ni la composición porcentual del dataset.

## Capacidades

- Transcripción multilingüe en 40 idiomas, en estilo literal (*verbatim*) o escrito, seleccionable mediante instrucción.
- Traducción de voz (*speech translation*) a texto.
- Transcripción con atribución de hablante y diarización integrada mediante el codificador de hablante.
- Transcripción enriquecida (*rich transcription*) con marcas temporales a nivel de palabra.
- Identificación de idioma y manejo de cambio de código (*code-switching*) dentro de una misma grabación.
- Respuesta a preguntas sobre audio (*audio question answering*).
- Transcripción contextual: admite contexto textual adicional para mejorar el reconocimiento de términos específicos.
- Seguimiento de instrucciones textuales en pequeña proporción.
- Etiquetado y redacción de información personal identificable (PII) en la salida.
- Procesamiento de audio de formato largo: grabaciones de hasta una hora con 65.536 tokens de contexto.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora en una sola inferencia y puede generar transcripción con atribución de hablante, lo que permite separar intervenciones sin un pipeline de diarización externo.
- Subtitulado y traducción de contenido audiovisual: con marcas temporales a nivel de palabra y traducción de voz, se puede generar un archivo de subtítulos traducido directamente desde el audio original.
- Atención al cliente y análisis de llamadas: la transcripción literal con marcas temporales y etiquetado de PII facilita la revisión de calidad, la extracción de motivos de contacto y la redacción de datos sensibles antes de almacenar las transcripciones.
- Documentación clínica o legal dictada: la transcripción contextual permite introducir un glosario de términos específicos del dominio como contexto textual para mejorar la precisión en vocabulario técnico.
- Indexación y búsqueda de archivos de audio: la transcripción de formato largo con identificación de idioma y cambio de código habilita la creación de índices de texto sobre archivos de audio multilingües.
- Investigación en lingüística y análisis de corpus: la salida con marcas temporales, identificación de idioma y diarización permite construir corpus anotados de forma automática a partir de grabaciones de campo.
- Asistentes de voz con comprensión de audio: la capacidad de respuesta a preguntas sobre audio permite construir interfaces que respondan a preguntas concretas sobre el contenido de una grabación sin transcribirla completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un informe técnico (NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf) y a una sección de resultados, pero los valores numéricos no se incluyen en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el despliegue de referencia indicado por el autor es 1× H100 de 80 GB en BF16. Las variantes FP8 y NVFP4 reducen el requisito de memoria, aunque la model card no publica cifras exactas de VRAM para esas precisiones.
- GPU recomendadas: NVIDIA H100 80 GB como configuración de referencia. No se dispone de datos publicados sobre otras GPU en la información proporcionada.
- GPU de consumo: no disponible. Con 34B parámetros totales y 67,5 GB de repositorio, el modelo completo en BF16 no cabe en GPU de consumo; las variantes cuantizadas podrían reducir el requisito, pero no hay cifras confirmadas.
- Opciones de despliegue: librería NeMo y NeMo Speech (github.com/NVIDIA-NeMo/Speech) para ajuste fino y servicio. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modelo incorpora Multi-Token Prediction (MTP) nativo y un modelo borrador opcional DFlash2 para decodificación especulativa, orientados a reducir la latencia de generación, pero no se publican métricas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de voz, por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento y licencia frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es *offline*: procesa grabaciones completas, no está diseñado para transcripción en streaming en tiempo real.
- La ventana de contexto está limitada a 65.536 tokens y a grabaciones de hasta una hora; audios más largos requieren segmentación.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes de audio con ruido, silencio o habla solapada, la salida puede contener texto no presente en el audio.
- La cobertura de los 40 idiomas no es necesariamente homogénea; la model card remite a una matriz de soporte por idioma que no se detalla en la información disponible.
- El etiquetado y la redacción de PII se entrenan solo con una pequeña proporción de datos, por lo que no debe considerarse una garantía de anonimización completa en producción.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de su integración en productos.
- Esta ficha corresponde a una réplica publicada por el usuario longlenai-team (55 descargas, 0 likes); para producción conviene verificar el repositorio oficial de NVIDIA y la integridad de los pesos.
- No se publican en la información disponible métricas de sesgo, tasas de error por idioma ni evaluaciones de robustez frente a acentos o ruido.

## Enlaces

- Modelo en Hugging Face (réplica): https://huggingface.co/longlenai-team/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8 (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4 (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (ajuste fino y servicio): https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper SALM (arXiv:2310.09424): https://arxiv.org/abs/2310.09424
