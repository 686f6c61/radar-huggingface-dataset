# labhamlet/speech-jepa-base

## Resumen

Speech-JEPA Base es un modelo de representación del habla (feature extraction) desarrollado por labhamlet, basado en una arquitectura Joint-Embedding Predictive Architecture (JEPA) aplicada al audio. El modelo aprende representaciones latentes auto-supervisadas a partir de audio de 16 kHz sin necesidad de transcripciones: un codificador de contexto procesa una secuencia parcialmente enmascarada de características convolucionales y un decodificador ligero predice las representaciones latentes de los tramos enmascarados generadas por un profesor EMA. No reconstruye audio ni emplea objetivos cuantizados.

Con 89,65 millones de parámetros, el modelo sigue el diseño de wav2vec 2.0 en su codificador convolucional (7 capas 1-D, downsampling 320x, tramas de 20 ms) y un transformer de 12 capas y 768 dimensiones con embeddings posicionales rotatorios. Se entrenó sobre LibriSpeech (960 horas) durante 375.000 actualizaciones. Es relevante porque propone una alternativa a los objetivos de enmascaramiento reconstructivos (como wav2vec 2.0 o data2vec 2.0) para el preentrenamiento de habla, con código y recetas abiertos.

El modelo se distribuye como checkpoint base sin tokenizer ni cabeza de reconocimiento; para ASR requiere fine-tuning supervisado. El autor publica checkpoints CTC afinados con distintos volúmenes de datos etiquetados de Libri-light y LibriSpeech. La licencia es BSD-3-Clause, permisiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA sobre transformer (12 capas, 768-d, 12 cabezas, RoPE, post-norm) con codificador convolucional 1-D de 7 capas |
| Parámetros totales | 89.652.224 (89,7 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable; tramas de 20 ms, downsampling 320x) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (model.safetensors, jepa_pretraining_extras.safetensors) |

## Arquitectura y entrenamiento

Speech-JEPA implementa una Joint-Embedding Predictive Architecture para habla. Un codificador de contexto recibe una secuencia de características convolucionales de audio parcialmente enmascarada y un decodificador convolucional ligero predice las representaciones latentes de los tramos enmascarados. Estas representaciones objetivo las produce un profesor EMA (exponential moving average) mediante la media normalizada por instancia de las 8 capas superiores del profesor, siguiendo el enfoque de data2vec 2.0. A diferencia de wav2vec 2.0, no hay cuantización de objetivos ni reconstrucción de la señal de audio.

El front-end es un codificador convolucional 1-D de 7 capas con la disposición de wav2vec 2.0, que aplica un downsampling de 320x y genera una trama cada 20 ms. El transformer tiene 12 capas, dimensión 768, 12 cabezas de atención, embeddings posicionales rotatorios y normalización post-norm. El preentrenamiento se realizó sobre LibriSpeech (960 horas de audio a 16 kHz) durante 375.000 actualizaciones. El repositorio incluye `jepa_pretraining_extras.safetensors`, que contiene el decodificador JEPA, el token de máscara y el codificador profesor EMA para reanudar el preentrenamiento con el código original.

## Capacidades

- Extracción de representaciones latentes del habla (feature extraction) a partir de audio de 16 kHz, con una trama cada 20 ms y 768 dimensiones por trama.
- Preentrenamiento auto-supervisado sin transcripciones ni objetivos cuantizados.
- Base para fine-tuning en tareas de habla, en particular reconocimiento automático del habla (ASR) con cabeza CTC.
- Soporte de entrada por lotes con `padding=True`; la `attention_mask` permite ignorar muestras rellenadas.
- Devolución de estados ocultos de todas las capas con `output_hidden_states=True`.
- Compatibilidad con el código original de entrenamiento mediante `wavjepa.hub.load_pretrained`, que carga también el decodificador y el profesor EMA.
- No incluye tokenizer; no realiza ASR directamente sin fine-tuning.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Extracción de embeddings de audio para sistemas de búsqueda por similitud: el modelo genera representaciones de 768 dimensiones cada 20 ms que pueden indexarse para recuperación de fragmentos de habla similares sin necesidad de transcripción.
- Preentrenamiento base para ASR en inglés: partiendo del checkpoint y afinando con una cabeza CTC sobre datos etiquetados, se obtiene un sistema de reconocimiento; el autor publica variantes afinadas con 10 min, 1 h, 10 h y 100 h de datos.
- Clasificación de habla con pocos datos: las representaciones congeladas del modelo sirven como entrada a clasificadores ligeros para tareas como detección de idioma, emoción o hablante, aprovechando el preentrenamiento auto-supervisado.
- Segmentación y diarización de hablantes: la resolución temporal de 20 ms por trama permite alimentar modelos de segmentación que distinguen tramos de distintos hablantes.
- Investigación en aprendizaje auto-supervisado de audio: el repositorio incluye el decodificador, el token de máscara y el profesor EMA, lo que permite reproducir y modificar el preentrenamiento JEPA con el código de github.com/labhamlet/SpeechJEPA.
- Extracción de características para modelos acústicos en pipelines de investigación: integrable en `transformers` con `trust_remote_code=True` para generar características que alimenten etapas posteriores de un sistema de reconocimiento o de análisis paralingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 89,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,36 GB; en fp16, unos 0,18 GB. La memoria total depende de la longitud del audio de entrada y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp32 con lotes moderados; para lotes grandes o audio largo se recomiendan GPU con 8 GB o más (RTX 3060/4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Objetivo de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speech-JEPA Base | 89,7 M | audio 16 kHz, tramas de 20 ms | JEPA (predicción latente con profesor EMA) | BSD-3-Clause | Hugging Face, código en GitHub |
| wav2vec 2.0 Base | ~95 M | audio 16 kHz, tramas de 20 ms | Enmascaramiento con objetivos cuantizados | MIT (fairseq) | Hugging Face, fairseq |
| data2vec 2.0 Base (audio) | ~94 M | audio 16 kHz, tramas de 20 ms | Predicción latente con profesor EMA y objetivos enmascarados | MIT | Hugging Face, fairseq |

No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo se preentrenó con inglés (LibriSpeech); su comportamiento en otros idiomas no está validado.
- No incluye tokenizer ni cabeza de ASR: no puede transcribir audio directamente sin fine-tuning supervisado.
- Riesgo de alucinación no aplica en el sentido generativo, pero las representaciones pueden no generalizar bien fuera del dominio de LibriSpeech (lectura de libros en inglés limpio); el rendimiento en habla espontánea, ruidosa o con acento no está documentado.
- El código personalizado requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisarlo antes de usarlo en producción.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de exención de responsabilidad.
- No se documentan sesgos específicos ni evaluaciones de robustez; los sesgos del corpus LibriSpeech (dominio de lectura, variedad limitada de hablantes) pueden propagarse a las representaciones.
- No hay información sobre cuantizaciones soportadas ni sobre latencia en producción.

## Enlaces

- Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base
- Código y recetas: https://github.com/labhamlet/SpeechJEPA
- Checkpoint ASR 10 min: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Checkpoint ASR 1 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Checkpoint ASR 10 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Checkpoint ASR 100 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Dataset de preentrenamiento: https://huggingface.co/datasets/openslr/librispeech_asr
