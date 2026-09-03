# RobotsMali/soloba-ctc-0.6b-v2

## Resumen

El modelo `soloba-ctc-0.6b-v2` es un sistema de reconocimiento automático de voz (ASR) desarrollado por RobotsMali, una iniciativa centrada en la inteligencia artificial para lenguas africanas de bajos recursos. Se trata de un ajuste fino (fine-tuning) del modelo base `RobotsMali/soloba-ctc-0.6b-v0` sobre el dataset African Next Voices (ANV), específicamente para el idioma bambara (bm), hablado principalmente en Malí. El modelo emplea una arquitectura FastConformer con decodificador convolucional y pérdida CTC, con aproximadamente 600 millones de parámetros. Su relevancia radica en abordar la transcripción de voz para una lengua con escasa representación en los ecosistemas tecnológicos actuales, contribuyendo a la inclusión lingüística en aplicaciones de voz.

El modelo fue entrenado con NVIDIA NeMo durante 165.247 pasos sobre un subconjunto de 100 horas del dataset ANV. Está liberado bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Se distribuye en formato NeMo (`.nemo`) y está pensado principalmente para fines de investigación, aunque puede integrarse en aplicaciones de producción con las debidas precauciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decodificador convolucional con pérdida CTC |
| Parametros totales | 0,6 B (600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR, no se especifica duración máxima de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (`.nemo`, basado en PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder FastConformer, una versión optimizada del Conformer que incorpora diezmado convolucional depthwise-separable con factor 8x, lo que reduce el coste computacional manteniendo la capacidad de modelado de contexto local y global. El decodificador es convolucional y se entrena con la pérdida CTC (Connectionist Temporal Classification), adecuada para alineación secuencia-a-secuencia sin necesidad de anotaciones temporales explícitas.

El ajuste fino se realizó sobre el modelo base `soloba-ctc-0.6b-v0` durante 165.247 pasos, utilizando un subconjunto de 100 horas del dataset African Next Voices (ANV). El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de ANV mediante el script `process_asr_text_tokenizer.py` de NeMo. El modelo no produce capitalización ni puntuación de forma consistente, y no genera etiquetas de eventos acústicos presentes en el dataset ANV. Se recomienda instalar `nemo-toolkit['asr']` para su uso.

## Capacidades

- Transcripción de voz en bambara a texto, aceptando audio mono de cualquier duración (se remuestrea internamente a 16 kHz).
- Reconocimiento de voz en tiempo real o por lotes mediante la API de NeMo (`transcribe`).
- Soporte de decodificación CTC con modos greedy y beam (aunque el beam requiere configuración adicional).
- No dispone de capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.
- No soporta otros idiomas distintos del bambara.
- No genera puntuación, capitalización ni etiquetas de eventos acústicos (como risas o ruidos).

## Casos de uso

- Transcripción de reuniones y entrevistas en bambara: el modelo puede convertir grabaciones de audio en texto para actas, análisis cualitativo o archivado documental. Su tamaño moderado permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Subtitulado automático de vídeos en bambara: integrable en pipelines de postproducción para generar subtítulos en contenido audiovisual dirigido a comunidades bambara-parlantes.
- Asistentes de voz para aplicaciones móviles en Malí: combinado con un motor de síntesis de voz, puede servir como capa de entrada para asistentes en kioscos digitales o aplicaciones de salud y educación.
- Archivado y digitalización de contenido oral: permite transcribir grabaciones históricas o entrevistas etnográficas en bambara, facilitando su búsqueda y preservación.
- Accesibilidad para personas con discapacidad auditiva: puede generar transcripciones en tiempo real de conversaciones o eventos, mejorando la inclusión en entornos educativos o administrativos.
- Investigación lingüística y desarrollo de corpus: el modelo puede utilizarse para anotar automáticamente nuevos audios en bambara, acelerando la creación de datasets etiquetados para otros fines.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Benchmark | Conjunto | WER (%) | CER (%) |
|---|---|---|---|
| African Next Voices (afvoices) | test | 30,85 | 14,44 |
| Nyana Eval | test | 40,01 | 22,34 |

Estos valores corresponden a decodificación CTC. No se han publicado comparaciones con otros modelos ASR en los mismos conjuntos de evaluación.

## Requisitos de hardware

- El tamaño del repositorio es de 2,4 GB, lo que sugiere pesos en FP32 (0,6 B × 4 bytes ≈ 2,4 GB). En FP16 ocuparía aproximadamente 1,2 GB.
- Para inferencia en GPU, se recomienda al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3050 o superior) para cargar el modelo en FP16 con overhead de ejecución.
- En CPU, la inferencia es posible pero lenta; se recomienda para tareas por lotes sin requisitos de latencia.
- El modelo requiere CUDA y la librería NeMo (`nemo-toolkit['asr']`). No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para despliegue en producción, se puede servir mediante NVIDIA Riva o mediante scripts personalizados con NeMo. La latencia estimada no está publicada, pero para un modelo de 0,6 B en una GPU moderna (RTX 3090 o superior) se espera un factor tiempo real inferior a 1 (más rápido que el audio en tiempo real).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos ASR para bambara. Los modelos multilingües como Whisper (openai/whisper) no incluyen el bambara en sus idiomas soportados, por lo que no existe una comparación directa. Otros modelos de NeMo para lenguas africanas (por ejemplo, para suajili o wolof) no son directamente comparables por diferencia de idioma y tamaño. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El modelo es parte de un esfuerzo de investigación en curso; puede no generalizar bien a todas las condiciones de habla, acentos o dialectos del bambara.
- No produce capitalización ni puntuación, lo que puede dificultar la lectura de transcripciones largas.
- No genera etiquetas de eventos acústicos (risas, ruidos, etc.), a pesar de que el dataset ANV las contiene.
- Solo soporta el idioma bambara; no es multilingüe.
- Existe un problema de compatibilidad con NeMo 2.7.x: la carga del checkpoint puede fallar debido al esquema de decodificación estricto. Se proporciona un workaround en la model card (parchear la configuración con `key_phrase_items_list = None`).
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al autor. Se recomienda revisar los términos completos.
- El modelo se distribuye principalmente para investigación; para uso en producción, se deben validar las tasas de error en el dominio específico de aplicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v2
- Repositorio de código y configuraciones: https://github.com/RobotsMali-AI/bambara-asr/
- Dataset African Next Voices: https://huggingface.co/datasets/RobotsMali/afvoices
- Modelo base: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v0
- Issue de NeMo sobre compatibilidad: https://github.com/NVIDIA-NeMo/Speech/issues/15658
