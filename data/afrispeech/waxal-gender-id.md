# AfriSpeech/waxal-gender-id

## Resumen

`AfriSpeech/waxal-gender-id` es un modelo de clasificación de audio que predice el género del hablante (masculino o femenino) a partir de clips de voz cortos en 22 lenguas africanas. Lo desarrolla AfriSpeech sobre el dataset `google/WaxalNLP` (configuraciones ASR y TTS, muestreadas a 16 kHz). Su relevancia radica en que ofrece una solución ligera y desplegable en CPU para una tarea de análisis de hablante en un ámbito lingüístico poco cubierto por los modelos comerciales.

Técnicamente, no entrena un encoder de voz propio: reutiliza el extractor de embeddings de hablante `3dspeaker_speech_campplus_sv_en_voxceleb_16k.onnx` (un modelo CAM++ de 3D-Speaker entrenado en VoxCeleb, con salida de 512 dimensiones) que ya distribuye sherpa-onnx, y añade una pequeña cabeza MLP (`gender_head.onnx`, 512 → 64 → 2) entrenada sobre esos embeddings. El modelo completo se reduce a un archivo ONNX de pocos kilobytes, lo que facilita su integración en pipelines de sherpa-onnx para dispositivos móviles o embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP head (512 → 64 → 2) sobre embeddings CAM++ preentrenados (3D-Speaker) |
| Parametros totales | No disponible (el head es de pocos KB; el extractor de embeddings es un modelo aparte) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | No disponible (formato ONNX estándar) |
| Idiomas soportados | ach, amh, fat, ful, hau, ibo, kik, lin, lug, luo, mas, nyn, orm, pcm, sid, sna, swa, tir, twi, wal, xog, yor (22 lenguas) |
| Licencia | CC-BY-4.0 (solo el head; el extractor de embeddings tiene su propia licencia) |
| Formato de pesos | ONNX (`gender_head.onnx`, `3dspeaker_speech_campplus_sv_en_voxceleb_16k.onnx`) |

## Arquitectura y entrenamiento

El modelo no entrena un encoder de voz. Se apoya en el extractor de embeddings de hablante de sherpa-onnx, un modelo CAM++ preentrenado en VoxCeleb a 16 kHz que produce vectores de 512 dimensiones. Sobre esos embeddings se entrena una cabeza MLP de 64 unidades con activación (no se especifica), salida de 2 logits (femenino/masculino) y una capa softmax implícita en la inferencia.

El entrenamiento se realizó con 330.027 utterances etiquetadas de WaxalNLP (train=275.862, validation=25.667, test=28.498), usando las particiones originales del dataset sin reordenar. Se filtraron las filas con etiquetas de género no normalizables (p. ej., `"unknown"`) y se descartaron configuraciones sin etiquetas útiles (`aka_asr`, `dag_asr`, `dga_asr`, `ewe_asr`, `ful_asr`, `kpo_asr`, `mlg_asr`, `bau_tts`, `ewe_tts`). El optimizador fue Adam con lr=0.001, batch size 256 y 60 épocas, seleccionando el checkpoint con mejor accuracy de validación.

## Capacidades

- Clasificación binaria de género del hablante (femenino/masculino) a partir de audio mono de 16 kHz.
- Inferencia rápida en CPU: factor tiempo real de 78x (un clip de 3 segundos se clasifica en ~38 ms de cómputo).
- Integración nativa con el ecosistema sherpa-onnx (diarización, verificación de hablante).
- Soporte multilingüe para 22 lenguas africanas, incluyendo criollos (pcm) y variantes regionales.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un clasificador de audio especializado.

## Casos de uso

- Atención al cliente automatizada: clasificar el género del hablante en llamadas grabadas para segmentar métricas de calidad o personalizar respuestas de IVR, gracias a su baja latencia en CPU (38 ms por clip de 3 s).
- Análisis de datos de call centers: enriquecer transcripciones de voz con metadatos de género para estudios de satisfacción o sesgos en el servicio.
- Investigación sociolingüística: analizar corpus de audio en lenguas africanas para estudiar patrones de habla por género, con cobertura de idiomas poco representados.
- Moderación de contenido en plataformas de audio: filtrar o etiquetar grabaciones de usuarios según el género del hablante, sin necesidad de GPU.
- Sistemas de verificación de hablante: combinar la salida de género con embeddings de identidad para mejorar la robustez en autenticación biométrica por voz.
- Aplicaciones de accesibilidad: en asistentes de voz para entornos con recursos limitados, donde se requiera una clasificación ligera y desplegable en dispositivos embebidos.

## Benchmarks y rendimiento

Los datos de evaluación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy de validacion | 0.9840 |
| Accuracy de test | 0.9358 |
| Macro F1 (test) | 0.9347 |

Accuracy por idioma en el conjunto de test (extraído de la model card):

| Idioma | Filas de test | Accuracy |
|---|---|---|
| ach | 720 | 0.990 |
| amh | 3420 | 0.858 |
| fat | 101 | 1.000 |
| ful | 31 | 1.000 |
| hau | 197 | 1.000 |
| ibo | 200 | 0.995 |
| kik | 214 | 1.000 |
| lin | 1866 | 0.988 |
| lug | 836 | 0.984 |
| luo | 209 | 1.000 |
| mas | 846 | 0.934 |
| nyn | 1049 | 0.992 |
| orm | 3782 | 0.991 |
| pcm | 204 | 1.000 |
| sid | 3561 | 0.951 |
| sna | 1749 | 0.981 |
| sog (xog) | 808 | 0.965 |
| swa | 199 | 1.000 |
| tir | 5034 | 0.810 |
| twi | 104 | 0.990 |
| wal | 3014 | 0.999 |
| yor | 354 | 0.994 |

No se han publicado comparaciones con otros modelos de identificación de género en la información disponible.

## Requisitos de hardware

- Inferencia únicamente en CPU: el extractor de embeddings y el head ONNX se ejecutan con onnxruntime y sherpa-onnx sin GPU.
- Tiempo de extracción de embeddings: 392 ms para un clip de 31 segundos con 2 hilos de CPU.
- Tiempo de inferencia del head: 0.16 ms (despreciable frente al paso de embeddings).
- Memoria: el head ocupa unos pocos KB; el extractor de embeddings es un modelo ONNX de tamaño moderado (no se especifica, pero típicamente <100 MB).
- Compatible con dispositivos móviles y embebidos (sherpa-onnx soporta ARM, x86, etc.).
- Opciones de despliegue: sherpa-onnx (pip), onnxruntime, scripts CLI incluidos en el repositorio (`infer_file.py`, `infer_batch.py`).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de identificación de género específicos para lenguas africanas en la documentación proporcionada. Como referencia genérica, la mayoría de clasificadores de género en audio se basan en modelos de embeddings de hablante entrenados en inglés (como VoxCeleb) y pueden tener menor precisión en lenguas no representadas; este modelo aborda esa carencia con datos de WaxalNLP, aunque hereda la dependencia del extractor preentrenado en inglés.

## Limitaciones y advertencias

- Rendimiento significativamente inferior en amhárico (`amh`, accuracy 0.858) y tigriña (`tir`, accuracy 0.810); se recomienda precaución en estos idiomas.
- El extractor de embeddings está entrenado en VoxCeleb (mayormente inglés), lo que puede introducir sesgos en acentos o fonética de lenguas africanas no representadas en ese corpus.
- No cubre todas las lenguas africanas: 9 configuraciones de WaxalNLP se descartaron por falta de etiquetas de género normalizables.
- Dependencia del modelo externo `csukuangfj/speaker-embedding-models`; su licencia y mantenimiento son ajenos a este repositorio.
- La licencia CC-BY-4.0 del head permite uso comercial con atribución, pero hay que verificar la licencia del extractor de embeddings por separado.
- No se proporcionan métricas de latencia en GPU ni en dispositivos móviles específicos; los datos de velocidad son solo para CPU con 2 hilos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/waxal-gender-id
- Dataset WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Extractor de embeddings (3D-Speaker CAM++): https://huggingface.co/csukuangfj/speaker-embedding-models
