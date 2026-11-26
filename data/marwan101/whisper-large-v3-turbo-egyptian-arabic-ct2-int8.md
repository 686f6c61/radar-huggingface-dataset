# Marwan101/whisper-large-v3-turbo-egyptian-arabic-ct2-int8

## Resumen

`whisper-large-v3-turbo-egyptian-arabic-ct2-int8` es una exportación cuantizada en INT8 mediante CTranslate2 del ajuste fino `Marwan101/whisper-large-v3-turbo-egyptian-arabic`, que a su vez parte de Whisper large-v3-turbo de OpenAI. El modelo resultante está pensado para inferencia de reconocimiento automático del habla (ASR) en árabe, con especial atención al dialecto egipcio, sobre CPU y GPU con poca memoria mediante la librería `faster-whisper`.

La relevancia de esta ficha radica en que combina tres piezas: la arquitectura transformer encoder-decoder de Whisper (con el decodificador reducido a 4 capas que caracteriza a la variante turbo), un ajuste fino dialectal en árabe egipcio y una cuantización INT8 que reduce el peso del repositorio a unos 0,8 GB. El autor publica métricas de WER y CER sobre dos conjuntos propios ("Adapt Clean" y "Adapt Noisy"), lo que permite evaluar el impacto de la cuantización frente a FP16/BF16.

El modelo se distribuye únicamente en formato CTranslate2 (no incluye safetensors ni GGUF) y declara el idioma `ar`. No se especifican licencia, composición del dataset de ajuste ni detalles del proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador de 4 capas) exportado a CTranslate2 |
| Parametros totales | no disponible (el repo pesa 0,8 GB en INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | INT8 (CTranslate2); el autor menciona tambien FP16/BF16 como referencia de evaluacion |
| Idiomas soportados | ar (arabe; ajustado a dialecto egipcio) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (modelo `faster-whisper`); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención completa sobre una ventana de audio de 30 segundos y un decodificador reducido a 4 capas (frente a las 32 de large-v3), lo que rebaja el coste de decodificación. Sobre esa base, el autor aplicó un ajuste fino supervisado para árabe egipcio (repositorio `Marwan101/whisper-large-v3-turbo-egyptian-arabic`) y posteriormente una conversión a CTranslate2 con cuantización INT8 para inferencia de bajo consumo de memoria.

No se dispone de información sobre el número de horas de audio empleadas en el ajuste fino, la composición del dataset, el uso de aumentación de datos ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR supervisado). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización INT8 y el soporte de `faster-whisper` con `compute_type="int8"` en CPU o `"int8_float16"` en GPU CUDA.

## Capacidades

- Transcripción de voz a texto en árabe, con ajuste específico al dialecto egipcio.
- Reconocimiento automático del habla (pipeline `automatic-speech-recognition`) sobre audio de hasta 30 segundos por ventana, con segmentación interna para audios más largos.
- Ejecución en CPU y GPU mediante `faster-whisper`/CTranslate2, con selección de `compute_type` (INT8 en CPU, INT8+FP16 en CUDA).
- Tarea `transcribe` (y potencialmente `translate` por herencia de Whisper, aunque no se documenta en la model card).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá de ASR ni modo "thinking".
- Capacidad multilingüe limitada en la práctica al árabe según la metadata (`language: ar`); no se garantiza el rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y llamadas en árabe egipcio: el modelo convierte audio de hasta 30 segundos por segmento en texto, con segmentación automática para grabaciones largas, lo que permite generar actas o resúmenes posteriores.
- Subtitulado automático de contenido audiovisual egipcio: series, entrevistas o pódcast en dialecto egipcio pueden transcribirse con `faster-whisper` y los segmentos resultantes alinearse para generar subtítulos SRT.
- Atención al cliente en centros de contacto: transcripción de grabaciones de llamadas para análisis de calidad y extracción de motivos de contacto, ejecutable en CPU con INT8 para reducir coste por hora de audio.
- Indexación y búsqueda de archivos de audio: convertir un archivo histórico de audio en texto para alimentar un motor de búsqueda o un sistema RAG sobre documentos internos.
- Investigación lingüística y dialectología: análisis de corpus orales egipcios con métricas de WER/CER comparables a las publicadas por el autor (Adapt Clean y Adapt Noisy).
- Despliegue en entornos con recursos limitados: al pesar unos 0,8 GB en INT8, puede ejecutarse en servidores sin GPU o en dispositivos edge con `faster-whisper` y `compute_type="int8"`.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjuntos propios "Adapt Clean" y "Adapt Noisy"):

| Conjunto | Precision | WER | CER |
|---|---|---|---|
| Adapt Clean | CTranslate2 INT8 | 37,89 % | 15,50 % |
| Adapt Noisy | CTranslate2 INT8 | 32,96 % | 14,31 % |
| Adapt Clean | FP16/BF16 | 38,28 % | 15,66 % |
| Adapt Noisy | FP16/BF16 | 33,59 % | 14,10 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; los únicos datos son los WER/CER anteriores, que muestran una degradación mínima o nula al pasar de FP16/BF16 a INT8.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,8 GB en INT8, por lo que la huella en memoria es del orden de 1 GB o ligeramente superior durante la inferencia en GPU.
- GPU recomendadas: cualquier GPU CUDA con al menos ~2 GB de VRAM libre; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y no se aprovechan al máximo por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `faster-whisper` (CTranslate2) es la vía documentada; también es posible integrarlo en servidores compatibles con CTranslate2. No se distribuyen pesos en GGUF ni safetensors, por lo que `llama.cpp` u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del `compute_type` elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-egyptian-arabic-ct2-int8 (este) | no disponible (0,8 GB INT8) | 30 s por ventana (Whisper) | ar (egipcio) | no disponible | CTranslate2 |
| openai/whisper-large-v3-turbo | ~809 M | 30 s por ventana | multilingue | MIT (upstream) | safetensors, CTranslate2, GGUF |
| Marwan101/whisper-large-v3-turbo-egyptian-arabic (base del ajuste) | no disponible | 30 s por ventana | ar (egipcio) | no disponible | no disponible |

La comparativa se limita al modelo base del ajuste y al Whisper large-v3-turbo original; no se dispone de datos de WER comparables de otras alternativas dialectales en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución; conviene contactar con el autor antes de usarlo en producción.
- Sesgos conocidos: no documentados; al estar ajustado a árabe egipcio, el rendimiento en otros dialectos o en árabe estándar moderno puede degradarse.
- Riesgo de alucinación: inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o música; conviene validar las transcripciones en dominios críticos.
- Limitación de contexto: ventana de 30 segundos por segmento, con dependencia de la segmentación interna para audios largos.
- Idiomas: la metadata solo declara `ar`; no se garantiza el comportamiento multilingüe del Whisper original.
- Formato: solo CTranslate2; no hay safetensors ni GGUF, lo que limita la integración con otros runtimes.
- Métricas: los WER/CER publicados (32-38 %) proceden de conjuntos propios no descritos y no son directamente comparables con benchmarks estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Marwan101/whisper-large-v3-turbo-egyptian-arabic-ct2-int8
- Modelo base del ajuste: https://huggingface.co/Marwan101/whisper-large-v3-turbo-egyptian-arabic
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- `faster-whisper`: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper de Whisper: https://arxiv.org/abs/2212.04356
