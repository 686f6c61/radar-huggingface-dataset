# Kaousheik/tempo-rl-multitask

## Resumen

TEMPO-RL-Multitask es un modelo de lenguaje de audio (large audio-language model) desarrollado por Kaousheik (Jayakumar), estudiante de máster en la Universidad de Maryland, como parte del proyecto TEMPO. Se construye sobre Audio Flamingo 3 de NVIDIA, que combina un codificador de audio Whisper-large congelado con un modelo de lenguaje Qwen2-7B, y añade un proyector multimodal sensible al tiempo que permite generar respuestas con marcas temporales precisas a resolución de 0,1 segundos.

El modelo está diseñado para resolver cinco tareas de audio de forma simultánea: transcripción multi-hablante, diarización, localización temporal de eventos, captioning denso de audio y captioning de música con timestamps. La novedad principal es el uso de GRPO (Group Relative Policy Optimization) con recompensas verificables sobre las cinco tareas a la vez, lo que mejora la coherencia temporal de las predicciones. El checkpoint corresponde a la tabla 2 del artículo TEMPO, siendo el modelo principal de dicha investigación.

Es un modelo de investigación con licencia restringida a uso académico no comercial, pensado para avanzar en la comprensión temporal de audio y no para despliegue en producción. Con 8,27 mil millones de parámetros, requiere una GPU con al menos 16 GB de VRAM para inferencia en fp16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (Whisper-large-v3 congelado + Qwen2-7B) con proyector temporal de 601 tokens de timestamp |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Research Only (uso academico no comercial) |
| Formato de pesos | safetensors (mas `time_proj.pt` para el proyector) |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3 de NVIDIA, que combina un codificador de audio Whisper-large congelado con un modelo de lenguaje Qwen2-7B. La innovacion clave es el proyector multimodal sensible al tiempo, que usa codificaciones sinusoidales de reloj de pared y genera alrededor de 601 tokens atomicos de timestamp con resolucion de 0,1 segundos. Estos tokens se intercalan con texto en las respuestas, lo que permite anotar eventos con precision temporal.

El entrenamiento se realiza en dos fases de SFT (etapas 1 y 2) seguidas de una fase de RL multi-tarea con GRPO y recompensas verificables, ejecutada durante 1000 pasos sobre las cinco tareas simultaneamente. El conjunto de datos `Kaousheik/tempo` contiene las particiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. Las recompensas se computan directamente sobre las marcas temporales, lo que permite al modelo mejorar la alineacion temporal sin depender de modelos de recompensa externos.

## Capacidades

- Transcripcion multi-hablante con marcas temporales de inicio y fin por segmento (ASR con timestamps).
- Diarizacion de hablantes con delimitacion temporal de cada intervencion.
- Localizacion temporal de eventos en audio (temporal grounding) con respuesta de intervalo.
- Captioning denso de audio, generando descripciones segmentadas con timestamps.
- Captioning de musica con timestamps, incluyendo etiquetas de instrumento, tempo, acordes y estadisticas.
- Seleccion de tarea mediante tags en el prompt (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`).
- Intercalado de texto y tokens de timestamp en la misma secuencia de salida.

## Casos de uso

- **Transcripcion de reuniones con diarizacion**: el modelo puede generar transcripciones con timestamps y separacion por hablante, util para actas de reuniones o subtitulos en directo. Su ventana temporal de 0,1 s permite sincronizar con precision cada turno de palabra.
- **Anotacion de datos de audio para entrenamiento**: sirve para generar datasets etiquetados con eventos temporales, lo que reduce el coste de anotacion manual en proyectos de investigacion.
- **Busqueda de eventos en grabaciones largas**: mediante la tarea de grounding temporal, se puede localizar el momento exacto en que ocurre un sonido concreto (por ejemplo, una alarma o una voz concreta) dentro de un audio extenso.
- **Accesibilidad para personas sordas**: el captioning denso de audio con timestamps permite generar descripciones textuales de sonidos ambientales en tiempo real, utilizable en aplicaciones de subtitulado descriptivo.
- **Analisis musical automatico**: la tarea de captioning de musica con timestamps puede etiquetar secciones de una cancion indicando instrumentos, acordes y tempo, utilizable para archivos de bibliotecas musicales.
- **Herramientas de postproduccion de podcasts**: la transcripcion multi-hablante con timestamps permite generar subtitulos sincronizados y editar contenido de forma mas eficiente en programas de edicion de audio.
- **Analisis forense de audio**: la combinacion de diarizacion y grounding temporal puede ayudar a localizar intervenciones especificas en grabaciones legales o de investigacion.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el modelo card, sin comparacion con otros modelos:

| Tarea | Metrica | Valor |
|---|---|---|
| ASR multi-hablante | WER | 43,5 |
| ASR multi-hablante | MAE | 0,76 |
| Diarizacion de hablantes | DER | 25,4 |
| Grounding temporal | mIoU | 65,8 |
| Grounding temporal | F1 | 46,5 |
| Dense audio captioning | eF1 | 59,3 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8,27 B de parametros, en fp16 se necesitan aproximadamente 16-17 GB de VRAM; en cuantizacion int8 (no disponible en el repositorio) se reduciria a unos 9 GB.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB. En consumer GPU, una RTX 4080 o superior con 16 GB podria ejecutar el modelo en fp16 con limitaciones de contexto.
- **Despliegue**: no se documentan opciones estandar como vLLM u Ollama. Al ser un modelo de audio-text-to-text, requiere usar el pipeline de `transformers` con el codificador de audio y el proyector temporal. El repositorio incluye `time_proj.pt`, que es obligatorio cargar junto con los pesos del transformer.
- **Latencia**: no se proporcionan datos de throughput o latencia en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (modelos de audio-lenguaje con temporal grounding) en la informacion proporcionada. El modelo se basa en Audio Flamingo 3 de NVIDIA, que es su principal referencia arquitectonica, pero no se han publicado comparativas con otros modelos como Qwen2-Audio o SALMONN.

## Limitaciones y advertencias

- **Licencia restrictiva**: el modelo se distribuye bajo licencia NVIDIA Research Only, que limita su uso exclusivamente a investigacion academica no comercial. Cualquier uso en produccion o con fines comerciales esta prohibido.
- **Dependencia del proyector**: el checkpoint incluye los pesos fusionados del transformer, pero el proyector temporal se entrega como un archivo separado (`time_proj.pt`) que es imprescindible cargar. Sin el, el modelo no funciona correctamente.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base (Qwen2-7B) tiene capacidades multilingues, pero no se documenta el rendimiento en lenguas distintas del ingles.
- **Sesgos y alucinacion**: no se aportan datos sobre sesgos en los datos de entrenamiento ni sobre tasas de alucinacion en las descripciones. Las tareas de captioning denso pueden generar eventos que no existen en el audio.
- **Rendimiento en ASR**: el WER reportado de 43,5 es alto en comparacion con sistemas ASR dedicados, lo que indica que el modelo no es adecuado para transcripcion de alta precision sin post-procesamiento.
- **Contexto**: no se documenta la longitud de contexto maxima, lo que limita la planificacion de uso en audios largos.
- **Formato de salida**: las respuestas intercalan tokens especiales de timestamp; cualquier aplicacion debe parsear estos tokens correctamente para extraer los intervalos temporales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaousheik/tempo-rl-multitask
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor: https://huggingface.co/Kaousheik
- Pagina personal del autor: https://kaousheik-26.github.io/
- Articulo de referencia (sin enlace directo en la informacion disponible): "TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models"
