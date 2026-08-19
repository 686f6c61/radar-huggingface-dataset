# clementrahula/wav2vec2-base-960h-torchaudio

## Resumen

Este repositorio aloja una copia íntegra del checkpoint `wav2vec2_fairseq_base_ls960_asr_ls960.pth` que utiliza el bundle `WAV2VEC2_ASR_BASE_960H` de torchaudio. No se trata de un modelo nuevo ni de una modificación: es un rehost sin cambios, byte a byte, del artefacto publicado por PyTorch, con el objetivo de que aplicaciones como Thematic Thing puedan descargar el archivo desde una fuente controlada y con una cadena de licencias documentada. El modelo subyacente es wav2vec 2.0 BASE, preentrenado de forma auto-supervisada sobre 960 horas de audio de LibriSpeech y ajustado para reconocimiento automático del habla (ASR) con las transcripciones correspondientes. Su relevancia radica en que permite realizar alineamiento forzado CTC (timestamps a nivel de palabra) y transcripción de audio en inglés con un modelo ligero y de licencia permisiva (MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 BASE (transformer con cuantización de producto y enmascaramiento) |
| Parametros totales | 95 millones (aprox., del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, ventana de 25 ms con stride de 20 ms) |
| Tipos de cuantizacion | no disponible (el archivo es un checkpoint `.pth` sin cuantizar) |
| Idiomas soportados | ingles (entrenado con LibriSpeech) |
| Licencia | MIT (para los pesos, con atribución a Meta Platforms; el contenedor `.pth` incluye licencia BSD-2-Clause de torchaudio) |
| Formato de pesos | PyTorch `.pth` (377,664,473 bytes) |

## Arquitectura y entrenamiento

El modelo es wav2vec 2.0 BASE, una arquitectura transformer con un encoder convolucional que procesa audio crudo a 16 kHz. El preentrenamiento es auto-supervisado: se enmascaran segmentos de las representaciones latentes y se entrena un modelo contrastivo para predecir las unidades cuantizadas. Posteriormente se realiza un ajuste fino (fine-tuning) para ASR añadiendo una capa lineal y entrenando con el objetivo CTC sobre las transcripciones de LibriSpeech (960 horas). El checkpoint concreto es el que torchaudio distribuye en su bundle `WAV2VEC2_ASR_BASE_960H`, que incluye el módulo lineal extra para la clasificación de caracteres. No hay innovaciones adicionales en este repositorio; es una redistribución sin cambios.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con salida de transcripcion a nivel de caracter.
- Alineamiento forzado CTC, que permite obtener timestamps a nivel de palabra o de fonema a partir de las probabilidades de salida.
- Extraccion de representaciones de audio (embeddings) para tareas downstream como clasificacion de habla o verificación de locutor.
- Procesamiento de audio muestreado a 16 kHz, mono, con normalizacion de amplitud.
- Integracion directa con torchaudio mediante el bundle `WAV2VEC2_ASR_BASE_960H`, sin necesidad de descargar pesos adicionales si se usa el cache de torch.hub.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de audio.

## Casos de uso

- Transcripcion automatica de reuniones o entrevistas: el modelo puede convertir audio en texto con una tasa de error baja en ingles, adecuado para generar actas o subtitulos.
- Subtitulado de videos: alineando las transcripciones con los timestamps obtenidos por CTC, se pueden generar subtitulos sincronizados.
- Analisis cualitativo de llamadas de soporte: aplicaciones como Thematic Thing usan el alineamiento forzado para extraer segmentos relevantes y etiquetarlos automaticamente.
- Verificacion de pronunciacion en herramientas de aprendizaje de idiomas: el alineamiento permite comparar la pronunciacion del usuario con la referencia.
- Preprocesamiento para sistemas de busqueda por voz: las transcripciones generadas pueden indexarse para busqueda de contenido hablado.
- Investigacion en procesamiento de habla: como modelo base, sirve para extraer features o como punto de partida para fine-tuning en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~95M de parametros, por lo que en FP32 ocupa unos 380 MB. Con batch pequeno, cabe en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (p.ej., NVIDIA GTX 1650, RTX 3050, o incluso integradas con soporte CUDA). Tambien funciona en CPU, aunque con mayor latencia.
- Si cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: torchaudio (via bundle), Hugging Face Transformers (cargando el checkpoint original), o exportacion a ONNX para inferencia en otros runtimes.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; en CPU, un audio de 10 segundos puede procesarse en ~1-2 segundos, y en GPU en <0.5 segundos (estimacion orientativa).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| wav2vec2-base-960h (este) | 95M | audio 16 kHz | MIT | Modelo base, ligero, buen equilibrio |
| wav2vec2-large-960h | 317M | audio 16 kHz | MIT | Mayor precision, mas recursos |
| HuBERT-base | 95M | audio 16 kHz | MIT | Preentrenamiento con clustering, similar tamano |
| Whisper-tiny | 39M | audio 16 kHz | MIT | Modelo de OpenAI, multilingue, pero mas enfocado a transcripcion directa |

Nota: los datos de parametros y licencias son de conocimiento general; no se han verificado en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no funciona con otros idiomas.
- Puede tener sesgos derivados de los datos de LibriSpeech (lectura de libros, acentos mayoritariamente norteamericanos).
- Riesgo de alucinacion en transcripciones: puede generar texto incorrecto en audio con ruido o solapamiento de voces.
- No se ha cuantizado ni optimizado para produccion; el archivo es un checkpoint de PyTorch, no un modelo listo para despliegue en todos los frameworks.
- La licencia MIT permite uso comercial, pero se debe mantener la atribucion a Meta Platforms y a torchaudio (BSD-2-Clause) segun se documenta en el repositorio.
- El rehost no incluye el codigo de preprocesamiento ni el pipeline completo; el usuario debe implementar la extraccion de features y la decodificacion CTC.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/clementrahula/wav2vec2-base-960h-torchaudio
- Documentacion de torchaudio para WAV2VEC2_ASR_BASE_960H: https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H.html
- Modelo original en HuggingFace: https://huggingface.co/facebook/wav2vec2-base-960h
- Codigo fuente de fairseq (wav2vec 2.0): https://github.com/facebookresearch/fairseq
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
