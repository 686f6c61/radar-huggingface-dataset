# inesc-id/WhisperLv3-EP-X-CPP

## Resumen

WhisperLv3-EP-X-CPP es un modelo de reconocimiento automático del habla (ASR) especializado en portugués europeo, desarrollado por el grupo INESC-ID. Se trata de un ajuste fino de `openai/whisper-large-v3` sobre el corpus EP-425, un conjunto de 425 horas de audio en portugués europeo utilizado en el benchmark CAMÕES. A diferencia del modelo hermano WhisperLv3-EP-X, que produce texto normalizado, esta variante genera texto con mayúsculas, puntuación y ortografía conforme al Acuerdo Ortográfico de 1990 (post-Acordo).

El modelo resuelve un problema práctico de los sistemas ASR en producción: la mayoría de los modelos Whisper originales devuelven transcripciones sin formato, lo que obliga a un postprocesado posterior para restaurar mayúsculas y puntuación. Esta variante integra ese formateo directamente en la salida, manteniendo un WER equivalente al mejor modelo EP del paper CAMÕES (12,3 % de media EP frente a 12,4 % del modelo normalizado).

Está empaquetado para WhisperX mediante CTranslate2 en float16, con un tamaño de repositorio de 3,1 GB, y se distribuye a través de Hugging Face con la librería `whisperx`. Su relevancia actual radica en que cubre un hueco específico: ASR de alta calidad para portugués europeo con salida lista para publicación o subtitulado, sin depender de modelos multilingües genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1,55 B (todos ajustados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | float16 (CTranslate2); int8 mencionado para CPU en el ejemplo de uso |
| Idiomas soportados | Portugués europeo (pt) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (float16); modelo base en safetensors en el repositorio original de OpenAI |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder con 1,55 mil millones de parámetros, y ajusta la totalidad de los pesos. El ajuste fino se realizó sobre el corpus EP-425 (425 horas de portugués europeo, los datos de entrenamiento del benchmark CAMÕES), con transcripciones reescritas en ortografía post-Acordo, capitalizadas y puntuadas. La configuración de entrenamiento fue de 10 épocas, batch size 256 (4 × 64 con acumulación de gradientes), learning rate 1e-5 con schedule coseno, 20 % de warm-up, label smoothing de 0,1 y precisión bf16.

El modelo final no es el checkpoint de una sola época, sino el promedio de los pesos de los checkpoints tras las épocas 2, 3 y 5, una técnica que el autor reporta como superior a cualquier época individual. Posteriormente se convirtió a CTranslate2 float16 mediante `ct2-transformers-converter` para su uso con WhisperX y faster-whisper. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre transcripciones con formato.

## Capacidades

- Reconocimiento automático del habla en portugués europeo con salida capitalizada y puntuada.
- Formateo integrado: mayúsculas iniciales en el 95-100 % de las salidas, cierre con punto o interrogación en el 95-100 %, y puntuación interna en el 31 % de media (rango 8-53 % según el conjunto de test).
- Ortografía conforme al Acuerdo Ortográfico de 1990 (por ejemplo, *aspeto*, *projeto*, *ação*).
- Alineación temporal y segmentación mediante WhisperX (diarización y timestamps disponibles a través del pipeline de WhisperX).
- Detección de actividad de voz (VAD) mediante `vad_filter` en faster-whisper.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al portugués europeo; no se reporta soporte para otras variantes del portugués ni otros idiomas.

## Casos de uso

- Subtitulado y transcripción de medios audiovisuales: el modelo genera texto con mayúsculas y puntuación listo para publicar, lo que reduce el postprocesado en flujos de subtitulado de vídeo o audio en portugués europeo.
- Actas y transcripción de reuniones: con WhisperX se obtienen timestamps y segmentos alineados, útiles para generar actas con marcas temporales en entornos corporativos portugueses.
- Atención al cliente y análisis de llamadas: la transcripción formateada facilita el análisis posterior (búsqueda, resumen, clasificación) de grabaciones de call centers en portugués europeo.
- Investigación lingüística y corpus orales: la salida post-Acordo con puntuación es adecuada para construir corpus anotados y estudios de variación del portugués europeo.
- Accesibilidad y subtitulado en directo: integrable en pipelines de WhisperX para generar subtítulos con puntuación en retransmisiones o eventos.
- Transcripción de entrevistas y estudios cualitativos: el formateo integrado reduce el trabajo manual de revisión en investigaciones con hablantes nativos de Portugal.
- Evaluación comparativa de ASR: sirve como referencia en el benchmark CAMÕES para medir sistemas ASR en portugués europeo con y sin formateo.

## Benchmarks y rendimiento

Resultados de WER (%) en los conjuntos de test CAMÕES para portugués europeo, decodificados con WhisperX (float16, batch size 8). Referencia e hipótesis normalizadas antes de puntuar (minúsculas, sin puntuación), por lo que el WER mide reconocimiento, no formateo.

| Modelo | RS | BN | T/L | CS | SI | EP Avg. |
|---|---|---|---|---|---|---|
| WhisperLv3-EP-X (paper, salida normalizada) | 7,4 | 4,7 | 10,9 | 10,9 | 27,9 | 12,4 |
| **Este modelo** (capitalizado + puntuado) | 8,2 | 5,6 | 10,4 | 10,9 | 26,5 | **12,3** |

Sin SpeechDat (no disponible públicamente), según el leaderboard público de CAMÕES: RS 8,6 y EP Avg. 12,4 para este modelo (WhisperLv3-EP-X: RS 7,8, EP Avg. 12,5).

Desglose por conjunto de test:

| Dominio | Test set | WhisperLv3-EP-X | Este modelo |
|---|---|---|---|
| RS | BD-Público | 1,38 | 3,60 |
| RS | CommonVoice | 9,48 | 9,08 |
| RS | MLS_extended | 8,80 | 8,82 |
| RS | PT_Adults | 2,27 | 2,99 |
| RS | PT_Children (parte 1) | 20,30 | 22,56 |
| RS | PT_Children (parte 2) | 4,61 | 4,20 |
| RS | PT_Elderly | 8,06 | 8,87 |
| RS | SpeechDat | 4,39 | 5,83 |
| BN | ALERT | 4,66 | 5,61 |
| T/L | LECTRA | 9,34 | 9,34 |
| T/L | MuAViC | 12,50 | 11,42 |
| CS | PostPort | 13,67 | 13,56 |
| CS | VoxCeleb | 8,15 | 8,26 |
| SI | Fala Bracarense | 16,57 | 16,14 |
| SI | PT Fundamental | 39,22 | 36,89 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en float16 para los pesos CTranslate2 (1,55 B parámetros), más memoria para activaciones y batch; se recomienda al menos 6-8 GB de VRAM para batch size 8.
- GPU recomendadas: NVIDIA A100, H100 para producción de alto throughput; RTX 4090, RTX 3090, RTX 4080 para estaciones de trabajo; RTX 3060 (12 GB) o superior para uso en consumer.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más de VRAM en float16; en CPU puede ejecutarse con `compute_type="int8"` según el ejemplo del autor.
- Opciones de despliegue: WhisperX (recomendado), faster-whisper con CTranslate2, y cualquier runtime compatible con modelos CTranslate2.
- Latencia y throughput: no disponible en la información proporcionada; el autor no reporta cifras de RTF ni de velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER EP Avg. (CAMÕES) | Salida con formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WhisperLv3-EP-X-CPP (este modelo) | 1,55 B | 30 s audio | 12,3 | Sí (mayúsculas + puntuación) | no disponible | Hugging Face (WhisperX/CTranslate2) |
| WhisperLv3-EP-X | 1,55 B | 30 s audio | 12,4 | No (texto normalizado) | no disponible | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | 30 s audio | no disponible en la información | No (formato variable) | MIT (modelo base OpenAI) | Hugging Face |

No se dispone en la información proporcionada de comparativas con otros modelos ASR específicos para portugués europeo más allá de los citados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para portugués europeo; su rendimiento en portugués brasileño u otras variantes no está documentado y probablemente sea inferior.
- La puntuación interna de la frase es limitada: solo el 31 % de media de las salidas incluye puntuación dentro de la oración (rango 8-53 % según el conjunto), lo que puede requerir revisión en textos largos.
- El WER es notablemente alto en algunos dominios: 36,89 % en PT Fundamental y 22,56 % en PT_Children (parte 1), lo que indica dificultades con audio de dominio específico o habla infantil.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con ruido o silencio; se recomienda usar VAD (`vad_filter=True`) para mitigarlo.
- La licencia no está disponible en la información proporcionada; es imprescindible verificarla antes de un uso comercial, especialmente por la licencia del modelo base de OpenAI.
- El modelo es solo ASR: no realiza traducción, resumen ni razonamiento; para tareas posteriores se necesita un LLM adicional.
- El rendimiento en habla con acento no europeo, ruido de fondo severo o solapamiento de hablantes no está documentado.
- La fecha de creación del repositorio (2026-11-01) y el número de descargas (0) indican que el modelo es muy reciente y con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inesc-id/WhisperLv3-EP-X-CPP
- Modelo hermano WhisperLv3-EP-X: https://huggingface.co/inesc-id/WhisperLv3-EP-X
- Demo CAMÕES ASR: https://huggingface.co/spaces/inesc-id/CAMOES-ASR-DEMO
- Paper CAMÕES (arXiv): https://arxiv.org/abs/2508.19721
- Dataset CAMÕES: https://huggingface.co/datasets/inesc-id/camoes_asr
- Repositorio WhisperX: https://github.com/m-bain/whisperX
- Modelo base OpenAI Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
