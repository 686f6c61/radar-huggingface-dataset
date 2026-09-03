# RobotsMali/soloba-tdt-0.6b-v1.5

## Resumen

Soloba-TDT-0.6B-v1.5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por RobotsMali, una iniciativa que busca construir recursos de IA para lenguas africanas de bajos recursos. Este modelo está especializado en la transcripción de audio en bambara (bm), una lengua mandé hablada principalmente en Malí por más de 14 millones de personas. Se trata de un ajuste fino (fine-tuning) del modelo base RobotsMali/soloba-tdt-0.6b-v0.5, entrenado sobre el subconjunto revisado por humanos del dataset Kunkado, que contiene aproximadamente 40 horas de habla transcrita en bambara.

La arquitectura combina un encoder FastConformer con un decodificador Token-and-Duration Transducer (TDT), una variante de RNN-T que predice conjuntamente el token y su duración. El modelo tiene 0.6 mil millones de parámetros y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Su relevancia radica en abordar la escasez de modelos ASR para lenguas africanas, un área tradicionalmente desatendida por la industria tecnológica. El proyecto es parte de un esfuerzo de investigación en curso, por lo que se esperan mejoras en versiones futuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 0.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (checkpoint nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder FastConformer, una versión optimizada del arquitectura Conformer que incorpora downsampling convolucional depthwise-separable de 8x, lo que reduce el coste computacional manteniendo la capacidad de modelar dependencias locales y globales. El decodificador es un Token-and-Duration Transducer (TDT), una variante de RNN-T que aprende a predecir simultáneamente el token de salida y su duración, lo que permite una decodificación más eficiente que los transductores tradicionales.

El entrenamiento se realizó con el toolkit NVIDIA NeMo, partiendo del checkpoint v0.5 y ajustando durante 40.000 pasos con un batch size de 32 sobre el dataset Kunkado. El texto se normalizó previamente con la librería bambara-normalizer, que estandariza números, elimina puntuación y etiquetas. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de Kunkado. El modelo no produce de forma consistente mayúsculas ni puntuación, y no genera etiquetas de eventos acústicos presentes en las transcripciones originales de Kunkado.

## Capacidades

- Transcripción de audio en bambara a texto, aceptando audio mono de cualquier formato (recomendado WAV) que se remuestrea internamente a 16 kHz.
- Reconocimiento de habla continua con decodificación TDT (greedy o beam search).
- Manejo de habla espontánea y condiciones variadas de grabación, aunque con limitaciones en dialectos y condiciones no representadas en el entrenamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR, sin capacidades de lenguaje general.
- No produce puntuación ni capitalización de forma consistente, ni etiquetas de eventos acústicos.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bambara: organizaciones de investigación o medios pueden transcribir grabaciones de campo para su análisis cualitativo, aprovechando la especialización del modelo en esta lengua.
- Archivado y digitalización de contenido audiovisual en bambara: emisoras de radio o archivos históricos pueden convertir sus cintas o grabaciones digitales a texto para preservación y búsqueda.
- Generación de subtítulos para vídeo en bambara: el texto transcrito puede servir como base para subtitulado, aunque requerirá post-procesado manual para añadir puntuación y mayúsculas.
- Desarrollo de asistentes de voz para hablantes de bambara: el modelo puede integrarse en pipelines de ASR para aplicaciones de voz a texto en dispositivos móviles o web.
- Creación de corpus lingüísticos anotados: los lingüistas pueden usar el modelo como primer paso para generar transcripciones que luego serán revisadas y corregidas manualmente.
- Investigación en ASR para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de transferencia de aprendizaje o adaptación a dialectos específicos del bambara.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card:

| Benchmark | Decodificacion | WER (%) | CER (%) |
|---|---|---|---|
| Kunkado (test) | TDT | 39.79 | 23.22 |
| Nyana Eval (test) | TDT | 39.81 | 22.91 |

Estos valores indican que aproximadamente 4 de cada 10 palabras se transcriben con error en ambos conjuntos de evaluación. El CER, más bajo, sugiere que muchos errores son sustituciones de palabras completas más que errores a nivel de carácter. No se han publicado comparaciones con otros modelos ASR para bambara en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 0.6B parámetros y arquitectura FastConformer, se estima que la inferencia en FP32 requiere entre 3 y 5 GB de VRAM, y en FP16 entre 2 y 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (NVIDIA GTX 1650, RTX 3060, etc.) debería ser suficiente para inferencia. Para fine-tuning se recomienda al menos 16 GB de VRAM (RTX 4090, A100).
- El modelo cabe en GPUs de consumo actuales, lo que facilita su uso en entornos de investigación con recursos limitados.
- Opciones de despliegue: el formato nativo es NeMo, por lo que la vía principal es mediante NVIDIA NeMo toolkit. No se han publicado conversiones a GGUF, ONNX o TensorRT en la información disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 0.6B con downsampling 8x, se espera una inferencia rápida en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables para bambara en la información proporcionada. El ecosistema de ASR para lenguas africanas de bajos recursos es muy limitado, y no se han encontrado alternativas públicas con las que comparar directamente este modelo. Se recomienda consultar el repositorio de RobotsMali para futuras versiones o modelos hermanos.

## Limitaciones y advertencias

- El modelo es parte de un esfuerzo de investigación en curso: puede no generalizar bien a todas las condiciones de habla y dialectos del bambara.
- No produce puntuación ni capitalización de forma consistente, lo que requiere post-procesado para textos formales.
- No genera etiquetas de eventos acústicos (ruidos, risas, etc.) presentes en el dataset de entrenamiento.
- El WER de aproximadamente 40% en ambos benchmarks es alto, lo que limita su uso en aplicaciones que requieran alta precisión sin revisión humana.
- Compatibilidad con versiones recientes de NeMo: el checkpoint fue creado con NeMo 2.5.0 y puede fallar al cargarse con versiones 2.7.x, requiriendo un workaround documentado en la model card.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo se publica con fines principalmente de investigación.
- Solo soporta bambara; no es multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloba-tdt-0.6b-v1.5
- Modelo base: https://huggingface.co/RobotsMali/soloba-tdt-0.6b-v0.5
- Dataset Kunkado: https://huggingface.co/datasets/RobotsMali/kunkado
- Repositorio de código de fine-tuning: https://github.com/RobotsMali-AI/bambara-asr/
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Issue de compatibilidad con NeMo 2.7.x: https://github.com/NVIDIA-NeMo/Speech/issues/15658
- Script de tokenizador: https://github.com/NVIDIA/NeMo/blob/main/scripts/tokenizers/process_asr_text_tokenizer.py
- Librería bambara-normalizer: https://pypi.org/project/bambara-normalizer/
