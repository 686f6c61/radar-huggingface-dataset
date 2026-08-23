# Kaousheik/tempo-ablation-both

## Resumen

TEMPO es un modelo de lenguaje de audio de gran tamaño (large audio-language model, LALM) desarrollado por Kaousheik Jayakumar (Universidad de Maryland) como parte de la investigación «TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models». Se trata de un checkpoint de ablación específico, correspondiente a la variante «+ Both» de la Tabla 3 del artículo, que combina la pérdida Gaussiana y el proyector multimodal sensible al tiempo. El modelo se construye sobre Audio Flamingo 3 de NVIDIA, que a su vez combina un encoder de audio Whisper-large congelado con un modelo de lenguaje Qwen2-7B, y añade un proyector temporal que intercala tokens de timestamp con el texto generado.

La relevancia de este modelo radica en su capacidad para resolver múltiples tareas de audio con anclaje temporal explícito: transcripción de varios hablantes, diarización de hablantes, grounding temporal de audio, descripción densa de audio y descripción de música con marcas de tiempo. El modelo utiliza un vocabulario de aproximadamente 601 tokens de timestamp con resolución de 0,1 segundos, lo que permite generar respuestas que intercalan texto y marcas temporales. Está pensado para investigación académica no comercial, ya que hereda la licencia de investigación exclusiva de NVIDIA.

El checkpoint incluye los pesos completos fusionados (con LoRA ya aplicado) y un archivo adicional `time_proj.pt` con el estado del proyector temporal, que es obligatorio cargar por separado para que el modelo funcione correctamente. El repositorio tiene un tamaño de 16,6 GB y el modelo pesa 8.271.605.248 parámetros en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B) con proyector multimodal temporal y 601 tokens de timestamp a 0,1 s |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponibles (heredado de Qwen2-7B, probablemente multilingüe, pero no se especifica) |
| Licencia | nvidia-research-only (solo investigación académica no comercial) |
| Formato de pesos | safetensors (pesos completos fusionados) + `time_proj.pt` para el proyector temporal |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3 de NVIDIA, cuya arquitectura combina un encoder de audio Whisper-large congelado con un modelo de lenguaje Qwen2-7B. Sobre esta base, TEMPO añade un proyector multimodal sensible al tiempo que incorpora codificaciones sinusoidales de reloj de pared (wall-clock) para representar la posición temporal de los eventos de audio. El modelo utiliza un vocabulario de tokens de timestamp (alrededor de 601 tokens) con resolución de 0,1 segundos, que se intercalan con el texto generado para anclar las predicciones temporalmente.

El entrenamiento se realizó en varias etapas sobre el dataset propio `Kaousheik/tempo`, que contiene cinco configuraciones de tareas con particiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. El checkpoint «+ Both» corresponde a la receta de post-entrenamiento completa, que incluye la pérdida Gaussiana (Gaussian loss) y el proyector temporal. Se trata de un modelo de ablación diseñado para validar la contribución conjunta de ambas innovaciones. Los pesos se publican con LoRA ya fusionado en los pesos completos, y el proyector temporal se distribuye por separado en `time_proj.pt`.

## Capacidades

- Transcripción de audio multi-hablante (ASR): genera transcripciones intercaladas con tokens de timestamp que marcan cuándo se habla cada segmento.
- Diarización de hablantes: identifica qué hablante está activo en cada intervalo temporal.
- Grounding temporal de audio: localiza eventos o sonidos en la línea de tiempo, devolviendo intervalos `<|t0|> to <|t1|>`.
- Descripción densa de audio: genera descripciones detalladas de eventos sonoros con sus correspondientes marcas temporales.
- Descripción de música con marcas de tiempo: produce anotaciones de instrumentos, tempo, acordes y estadísticas en intervalos específicos.
- Soporte de tareas mediante tags en el prompt: cada tarea se selecciona con una etiqueta específica (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir conversaciones de varios hablantes e indicar los intervalos de tiempo en los que interviene cada persona, lo que facilita la búsqueda de citas textuales en grabaciones largas.
- Análisis de audio forense: la capacidad de grounding temporal permite localizar con precisión eventos sonoros concretos (disparos, gritos, alarmas) en grabaciones de vigilancia o entrevistas.
- Generación de subtítulos densos para vídeo: se puede usar para crear descripciones de audio sincronizadas con la línea de tiempo, útil para accesibilidad o para indexar contenido audiovisual.
- Anotación de música automática: el modo de descripción musical con marcas temporales permite etiquetar instrumentos, acordes y cambios de tempo en pistas de audio, útil para bibliotecas musicales o sistemas de recomendación.
- Diarización de hablantes en podcasts y entrevistas: el modelo puede separar y etiquetar a los participantes con sus intervalos de intervención, facilitando la generación de índices de contenido.
- Investigación en modelos de audio: sirve como punto de partida para experimentos de post-entrenamiento de LALM, ya que está diseñado para evaluar el impacto de la pérdida Gaussiana y el proyector temporal en el rendimiento.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card (correspondientes a la variante «+ Both» de la Tabla 3):

| Métrica | Valor |
|---|---|
| DER (detección de error de diarización) | 79,3 |
| mIoU (grounding temporal) | 37,5 |
| dense-cap eF1 (descripción densa) | 49,7 |
| grounding F1 | 38,7 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Estos valores son los reportados por el autor en el repositorio y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 16,6 GB en disco, por lo que la inferencia en precisión completa requerirá aproximadamente 17-20 GB de VRAM (incluyendo los estados del modelo y el proyector temporal). No se proporcionan cuantizaciones, por lo que no hay estimaciones para versiones reducidas.
- GPU recomendadas: se requiere una GPU con al menos 24 GB de VRAM, como una NVIDIA RTX 3090/4090, A100 40GB, o H100. Las GPUs de consumo con 16 GB (RTX 4080, RTX 3080) podrían no ser suficientes sin cuantización.
- Opciones de despliegue: no se especifican herramientas de inferencia compatibles. Dado que se basa en Qwen2-7B y Audio Flamingo 3, podría integrarse con frameworks como vLLM o TGI, pero no hay garantías. La carga requiere manejar el `time_proj.pt` por separado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos en la información proporcionada. El modelo es un ajuste fino de Audio Flamingo 3, por lo que su comparación natural sería con el modelo base de NVIDIA, pero no se publican métricas de ese modelo en el repositorio. Tampoco se encuentran referencias a modelos similares en los resultados de búsqueda. Se indica «no disponible» para comparativas.

## Limitaciones y advertencias

- Licencia de uso restringido: el modelo se distribuye bajo la licencia `nvidia-research-only`, lo que limita su uso exclusivamente a investigación académica no comercial. Cualquier uso comercial está prohibido.
- Derivado de un modelo con licencia restrictiva: al estar basado en Audio Flamingo 3 de NVIDIA, las condiciones de esa licencia se aplican también a este checkpoint.
- Datos de entrenamiento con licencias mixtas: los corpus de entrenamiento (AMI, ICSI, AudioSet Strong, TACOS, Slakh2100, LibriSpeech) son CC BY 4.0, pero ESC-50 es CC BY-NC 3.0, lo que podría restringir el uso comercial de los datos subyacentes.
- Riesgo de alucinación temporal: como todos los modelos de lenguaje, puede generar timestamps incorrectos o descripciones inventadas, especialmente en audio con ruido o solapamiento de voces.
- Idiomas soportados no documentados: no se especifica qué idiomas se soportan de forma fiable; se asume que hereda las capacidades de Qwen2-7B, pero no hay garantías.
- Sin cuantizaciones oficiales: no se publican versiones GGUF o cuantizadas, lo que limita su despliegue en hardware de consumo.
- Dependencia del proyector temporal: el modelo no funciona sin cargar el archivo `time_proj.pt`, que se distribuye por separado. Si no se carga, la salida será incorrecta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kaousheik/tempo-ablation-both
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3 de NVIDIA: https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor en HuggingFace: https://huggingface.co/Kaousheik
- Página de investigación del autor: https://kaousheik-26.github.io/research/
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en

Nota: no se ha encontrado el artículo o paper correspondiente en la información proporcionada.</think>## Resumen

TEMPO es un modelo de lenguaje de audio (large audio-language model, LALM) desarrollado por Kaousheik Jayakumar, investigador de la Universidad de Maryland, como parte del proyecto «TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models». Este checkpoint concreto, denominado `tempo-ablation-both`, corresponde a la variante «+ Both» de la Tabla 3 del artículo, que combina la pérdida Gaussiana y el proyector multimodal sensible al tiempo. Se construye sobre Audio Flamingo 3 de NVIDIA, que integra un encoder Whisper-large congelado y un modelo de lenguaje Qwen2-7B, con un proyector multimodal que introduce 601 tokens de timestamp con resolución de 0,1 segundos.

La relevancia de este modelo reside en su capacidad para resolver varias tareas de audio con anclaje temporal explícito: transcripción de varios hablantes, diarización de hablantes, grounding temporal de audio, descripción densa de audio y descripción de música con marcas de tiempo. Está diseñado para investigación académica no comercial, ya que hereda la licencia `nvidia-research-only` de Audio Flamingo 3. El checkpoint se publica con pesos completos fusionados (LoRA aplicado) y un archivo adicional `time_proj.pt` con el estado del proyector temporal, que es imprescindible para el funcionamiento correcto del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B) con proyector multimodal temporal-aware y 601 tokens de timestamp a 0,1 s |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no documentado; hereda capacidades de Qwen2-7B) |
| Licencia | nvidia-research-only (solo investigación académica no comercial) |
| Formato de pesos | safetensors (pesos fusionados) + `time_proj.pt` para el proyector temporal |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3 de NVIDIA, cuya arquitectura combina un encoder de audio Whisper-large congelado y un modelo de lenguaje Qwen2-7B. Sobre esta base, TEMPO añade un proyector multimodal sensible al tiempo que incorpora codificaciones sinusoidales de reloj de pared (wall-clock encodings) para modelar la temporalidad de los eventos. El modelo utiliza un conjunto de aproximadamente 601 tokens de timestamp con resolución de 0,1 segundos, que se intercalan en las respuestas de texto para anclar temporalmente las predicciones.

El entrenamiento se realizó en el dataset propio `Kaousheik/tempo`, que contiene cinco configuraciones de tareas con particiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. La variante «+ Both» corresponde a la receta completa de SFT que combina la pérdida Gaussiana y el proyector temporal. Los pesos se publican con LoRA ya fusionado, y el proyector temporal se distribuye por separado en `time_proj.pt`. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Transcripción de audio multi-hablante (ASR): genera transcripciones con marcas temporales que delimitan el inicio y fin de cada intervención.
- Diarización de hablantes: identifica qué hablante está activo en cada intervalo temporal.
- Grounding temporal de audio: localiza intervalos temporales correspondientes a eventos sonoros específicos.
- Descripción densa de audio: produce descripciones detalladas de eventos sonoros con sus correspondientes marcas de tiempo.
- Descripción de música con marcas de tiempo: anota instrumentos, tempo, acordes y estadísticas en intervalos temporales concretos.
- Selección de tareas mediante etiquetas en el prompt: cada tarea se activa con una etiqueta específica (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir conversaciones de varios hablantes con marcas temporales, lo que facilita la búsqueda de citas textuales y el análisis de interacciones en grabaciones largas.
- Análisis de audio forense: la capacidad de grounding temporal permite localizar eventos sonoros concretos (disparos, alarmas, voces) en grabaciones de vigilancia o material probatorio.
- Generación de subtítulos descriptivos para vídeo: se puede emplear para crear descripciones de audio sincronizadas con la línea de tiempo, útil en accesibilidad y en indexación de contenido audiovisual.
- Anotación de grabaciones musicales: el modelo puede identificar instrumentos, acordes y cambios de tempo en intervalos específicos de una pista, lo que es útil para bibliotecas de música y sistemas de recomendación.
- Investigación en modelos de audio: sirve como punto de partida para experimentos de post-entrenamiento temporal en LALMs, especialmente para estudiar el impacto de la pérdida Gaussiana y el proyector temporal.
- Diarización de hablantes en entornos académicos: permite segmentar y etiquetar intervenciones en grabaciones de seminarios o conferencias, facilitando la creación de índices y resúmenes.

## Benchmarks y rendimiento

Los resultados reportados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| DER (diarization error rate) | 79,3 |
| mIoU (grounding temporal) | 37,5 |
| Dense-cap eF1 (descripción densa) | 49,7 |
| Grounding F1 | 38,7 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estos valores corresponden a la variante «+ Both» de la Tabla 3 del artículo, pero no se detallan las condiciones exactas de evaluación ni las comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 8,27 GB, por lo que se estima una VRAM mínima de 16-20 GB para inferencia en precisión completa, dependiendo de la longitud del contexto y el tamaño de lote.
- GPU recomendadas: se recomienda una NVIDIA A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB) para un rendimiento fluido. GPU de consumo con menos de 16 GB de VRAM podrían no ser suficientes sin cuantización.
- Compatibilidad con GPU de consumo: es posible ejecutar en una RTX 3090 o RTX 4090 con 24 GB de VRAM, pero no se garantiza el rendimiento óptimo.
- Opciones de despliegue: no se documentan herramientas específicas, pero al estar basado en Audio Flamingo 3 y Qwen2-7B, podría integrarse con frameworks como vLLM, TGI o llama.cpp, aunque no se ha validado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es un ajuste fino de Audio Flamingo 3, por lo que su comparación natural sería con el modelo base de NVIDIA, pero no se publican métricas de ese modelo en el repositorio. Tampoco se han encontrado referencias a otros LALMs comparables en los resultados de búsqueda. Se indica «no disponible» para la comparativa.

## Limitaciones y advertencias

- Licencia de uso restringido: el modelo se distribuye bajo la licencia `nvidia-research-only`, lo que limita su uso exclusivamente a investigación académica no comercial. No se permite uso comercial.
- Sesgos y alucinaciones: como todo modelo de lenguaje generativo, puede producir timestamps incorrectos o descripciones inventadas, especialmente en audio con ruido o superposición de voces.
- Idiomas soportados no documentados: no se especifica qué idiomas se soportan de forma fiable; se asume que hereda las capacidades multilingües de Qwen2-7B, pero no hay garantías.
- Restricciones de los datos de entrenamiento: algunos corpus de entrenamiento (como ESC-50) están bajo licencia CC BY-NC 3.0, lo que puede afectar a la distribución de resultados derivados.
- Dependencia de archivos externos: el modelo no funciona sin el archivo `time_proj.pt`, que debe cargarse por separado. Si se omite, el rendimiento se degrada o falla.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware de bajo consumo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Kaousheik/tempo-ablation-both
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor en HuggingFace: https://huggingface.co/Kaousheik
- Página de investigación del autor: https://kaousheik-26.github.io/research/
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en

No se ha encontrado el enlace al paper del artículo en la información proporcionada.</think>## Resumen

TEMPO es un modelo de lenguaje de audio (LALM) desarrollado por Kaousheik Jayakumar, investigador de la Universidad de Maryland, como parte del proyecto «TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models». Este checkpoint concreto, `tempo-ablation-both`, corresponde a la variante «+ Both» de la Tabla 3 del artículo, que combina la pérdida Gaussiana y el proyector temporal. Se construye sobre Audio Flamingo 3 de NVIDIA, que integra un encoder Whisper-large congelado y un modelo de lenguaje Qwen2-7B, añadiendo un proyector multimodal sensible al tiempo con 601 tokens de timestamp de 0,1 segundos de resolución.

La relevancia del modelo reside en su capacidad para resolver múltiples tareas de audio con anclaje temporal explícito: transcripción de varios hablantes, diarización de hablantes, grounding temporal de audio, descripción densa de audio y descripción de música con marcas de tiempo. El checkpoint se publica con pesos completos fusionados (LoRA ya aplicado) y un archivo `time_proj.pt` que contiene el estado del proyector temporal, imprescindible para el funcionamiento correcto. Está pensado exclusivamente para investigación académica no comercial, ya que hereda la licencia `nvidia-research-only` de Audio Flamingo 3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B) con proyector multimodal temporal-aware y 601 tokens de timestamp (0,1 s) |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (heredado de Qwen2-7B, sin documentación específica) |
| Licencia | nvidia-research-only (solo investigación académica no comercial) |
| Formato de pesos | safetensors (pesos fusionados) + `time_proj.pt` para el proyector temporal |

## Arquitectura y entrenamiento

La arquitectura se basa en Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado y un modelo de lenguaje Qwen2-7B. Sobre esta base, TEMPO añade un proyector multimodal sensible al tiempo (time-aware multimodal projector) que incorpora codificaciones sinusoidales de reloj de pared (wall-clock encodings). El modelo utiliza aproximadamente 601 tokens de timestamp con una resolución de 0,1 segundos, que se intercalan en la respuesta de texto para anclar temporalmente las predicciones.

El entrenamiento se realizó en el dataset propio `Kaousheik/tempo`, que contiene cinco configuraciones de tareas con particiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. La variante «+ Both» corresponde a la receta completa de SFT con la pérdida Gaussiana y el proyector temporal. No se han publicado detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni técnicas de RLHF o DPO. Los pesos se publican con LoRA ya fusionado, y el proyector temporal se distribuye por separado.

## Capacidades

- Transcripción de audio multi-hablante (ASR) con marcas temporales: genera transcripciones con intervalos de tiempo que delimitan cada intervención.
- Diarización de hablantes: identifica qué hablante está activo en cada intervalo temporal.
- Grounding temporal de audio: localiza el intervalo temporal correspondiente a un evento sonoro concreto.
- Descripción densa de audio: produce descripciones detalladas de eventos sonoros con sus marcas de tiempo asociadas.
- Descripción de música con timestamps: genera anotaciones de instrumentos, tempo, acordes y estadísticas en intervalos concretos.
- Selección de tareas mediante etiquetas en el prompt: cada tarea se activa con una etiqueta específica (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`).

## Casos de uso

- **Transcripción de reuniones y entrevistas**: el modelo puede transcribir conversaciones de varios hablantes con marcas de tiempo que indican cuándo habla cada persona, facilitando la búsqueda de citas textuales y el análisis de dinámicas de grupo en grabaciones largas.
- **Análisis forense de audio**: la capacidad de grounding temporal permite localizar eventos sonidos concretos (disparos, gritos, alarmas) en grabaciones de vigilancia o material probatorio, con precisión de décimas de segundo.
- **Generación de subtítulos descriptivos para vídeo**: se puede generar una descripción sincronizada de los eventos de audio de un vídeo, útil para accesibilidad y para indexar contenido audiovisual.
- **Anotación de grabaciones musicales**: el modelo puede identificar instrumentos, acordes y cambios de tempo en intervalos específicos de una pista, lo que es útil para bibliotecas de audio, estudio de la música y sistemas de recomendación.
- **Diarización de hablantes en investigación**: permite segmentar y etiquetar a los participantes de una conversación con sus intervalos de actividad, facilitando el análisis de interacciones en psicología o sociología.
- **Análisis de audio en producción de contenidos**: se puede integrar en pipelines de postproducción para sincronizar descripciones de audio con la línea de tiempo de un proyecto multimedia, aunque se debe verificar la licencia para uso comercial.

## Benchmarks y rendimiento

Los resultados reportados por el autor en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| DER (diarization error rate) | 79,3 |
| mIoU (grounding temporal) | 0,375 |
| Dense-cap e1 (descripción de audio) | 49,7 |
| Grounding F1 | 38,7 |

No se han publicado comparativas con otros modelos en la información disponible. Estos valores corresponden a la variante «+ Both» de la Tabla 3 del artículo, pero no se ha verificado la metodología de evaluación ni la comparación con otros modelos de la misma categoría.

## Requisitos de hardware

- **VRAM estimada**: los pesos safetensors ocupan aproximadamente 16,6 GB en disco, por lo que se estima una VRAM mínima de 20-24 GB para inferencia en precisión completa (FP32/FP16). Con cuantización a 8 bits o 4 bits (no disponible oficialmente) podría reducirse.
- **GPU recomendadas**: NVIDIA A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB) para un rendimiento fluido. La RTX 3090 (24 GB) también es viable.
- **GPU de consumo**: es posible ejecutar el modelo en una RTX 4090 con 24 GB de VRAM, pero no se garantiza el rendimiento en tarjetas de 16 GB sin cuantización.
- **Opciones de despliegue**: no se documentan frameworks específicos, pero al estar basado en Qwen2-7B y Audio Flamingo 3, podría ser compatible con vLLM, TGI o llama.cpp, aunque el proyector temporal requiere integración personalizada.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es un ajuste fino de Audio Flamingo 3, por lo que la comparación natural sería con el modelo base de NVIDIA, pero no se publican métricas de ese modelo en el repositorio. Tampoco se han encontrado referencias a otros modelos de audio de la misma categoría en los resultados de búsqueda. Se indica «no disponible» para la comparativa.

## Limitaciones y advertencias

- **Licencia de uso restringido**: el modelo se distribuye bajo la licencia `nvidia-research-only`, lo que limita el uso exclusivamente a investigación académica no comercial. No se permite uso comercial.
- **Sesgos y alucinación**: como todo modelo generativo, puede producir timestamps incorrectos o descripciones inventadas, especialmente en audio con ruido o solapamiento de voces.
- **Idiomas no documentados**: no se especifica qué idiomas soporta de forma fiable; se asume que hereda las capacidades multilingües de Qwen2-7B, pero no hay garantías.
- **Restricciones de los datos de entrenamiento**: algunos corpus utilizados (AMI, ICSI, AudioSet Strong, TACOS, Slaughter2100, LibriSpeech) son CC BY 4.0, pero ESC-50 es CC BY-NC 3.0, lo que puede restringir el uso de los datos subyacentes.
- **Dependencia del proyector temporal**: el modelo no funciona sin el archivo `time_proj.pt`, que debe cargarse explícitamente. Si se omite, el rendimiento se degrada o el modelo falla.
- **Sin cuantizaciones oficiales**: no se proporcionan versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kaousheik/tempo-ablation-both)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Kaousheik/tempo)
- [Modelo base Audio Flamingo 3 de NVIDIA](https://huggingface.co/nvidia/audio-flamingo-3)
- [Perfil del autor en HuggingFace](https://huggingface.co/Kaousheik)
- [Página de investigación del autor](https://kaousheik-26.github.io/research/)
- [Google Scholar del autor](https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en)</think>## Resumen

TEMPO es un modelo de lenguaje de audio (LALM) desarrollado por Kaousheik Jayakumar, investigador de la Universidad de Maryland, como parte del proyecto «TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models». Este checkpoint concreto, `tempo-ablation-both`, corresponde a la variante «+ Both» de la Tabla 3 del artículo, que combina la ablación de la pérdida Gaussiana y el proyector temporal. Se construye sobre Audio Flamingo 3 de NVIDIA, que integra un encoder de audio Whisper-large congelado y un modelo de lenguaje Qwen2-7B, con un proyector multimodal sensible al tiempo y 601 tokens de timestamp con resolución de 0,1 segundos.

La relevancia del modelo radica en su capacidad de resolver varias tareas de audio con anclaje temporal explícito: transcripción de varios hablantes, diarización de hablantes, detección de eventos temporales, descripción densa de audio y descripción de música con marcas de tiempo. Está orientado exclusivamente a la investigación académica no comercial, ya que hereda la licencia `nvidia-research-only` de Audio Flamingo 3. El checkpoint se distribuye con pesos completos fusionados (LoRA ya aplicado) y un archivo adicional `time_proj.pt` que contiene el estado del proyector temporal, imprescindible para el funcionamiento correcto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B) con proyector multimodal temporal-aware y 601 tokens de timestamp (0,1 s) |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no
