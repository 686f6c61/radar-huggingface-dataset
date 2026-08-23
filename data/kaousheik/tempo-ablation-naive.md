# Kaousheik/tempo-ablation-naive

## Resumen

`Kaousheik/tempo-ablation-naive` es un checkpoint de ablación del modelo TEMPO, un post-entrenamiento multi-tarea para modelos de lenguaje de audio de gran tamaño con anclaje temporal. El modelo está construido sobre Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B, e incorpora un proyector multimodal y un vocabulario de aproximadamente 601 tokens de timestamp con resolución de 0,1 segundos.

Este checkpoint concreto elimina deliberadamente dos componentes clave del método completo: la pérdida gaussiana sensible a distancia y el proyector temporal. Por tanto, sirve como punto de comparación en la tabla 3 del paper de TEMPO para evaluar el impacto de dichos componentes. El autor, Jayakumar (Kaousheik), estudiante de máster en la Universidad de Maryland, publica este modelo con fines exclusivamente de investigación académica, bajo la licencia research-only de NVIDIA.

El modelo es relevante en el campo de los audio-language models porque aborda tareas temporales finas (timestamping, diarización, grounding temporal) que van más allá de la simple generación de descripciones de audio. Su interés principal es científico: permite estudiar cómo influye el diseño del proyector y la función de pérdida en la precisión temporal del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + LLM Qwen2-7B) con proyector multimodal y tokens de timestamp |
| Parametros totales | 8.271.523.328 (8,27 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el encoder Whisper-large es multilingüe, pero no se especifica) |
| Licencia | nvidia-research-only (uso exclusivo de investigación académica, no comercial) |
| Formato de pesos | safetensors (modelo completo) + `time_proj.pt` (proyector temporal) |

## Arquitectura y entrenamiento

La arquitectura se hereda de Audio Flamingo 3: un encoder de audio Whisper-large (congelado) extrae representaciones del audio, que se proyectan mediante un proyector multimodal hacia el espacio del LLM Qwen2-7B. Sobre esta base, el modelo TEMPO añade un proyector temporal (que aquí se omite) y un vocabulario de tokens de tiempo con resolución de 0,1 segundos. En esta variante "naive" se utiliza el proyector estándar de Audio Flamingo 3 y no se aplica la pérdida gaussiana sensible a distancia durante el entrenamiento.

El entrenamiento se realizó sobre el dataset `Kaousheik/tempo`, que contiene cinco configuraciones de tareas con divisiones `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. El modelo fue post-entrenado mediante un pipeline de dos etapas (síntesis y SFT) y posterior refuerzo (RL). Las tareas se seleccionan mediante una etiqueta en el prompt (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`) y las respuestas intercalan texto con tokens de tiempo, por ejemplo `<|t0|> transcripción <|t1|>`.

## Capacidades

- Transcripción multi-locutor con marcas temporales (ASR con timestamping).
- Diarización de hablantes: identificación de quién habla y en qué intervalo temporal.
- Audio temporal grounding: localización de eventos sonoros en el tiempo a partir de una descripción textual.
- Dense audio captioning: generación de descripciones densas y detalladas de contenido de audio, con anclaje temporal.
- Captioning musical con timestamps: etiquetas de instrumentos, tempo, acordes y estadísticas por segmentos temporales.
- Interleaving de texto y tokens de tiempo en la salida, lo que permite un anclaje fino de las respuestas.
- Soporte de prompts basados en etiquetas para seleccionar la tarea deseada.
- No se menciona soporte para tool calling ni capacidades de agente en la información disponible.

## Casos de uso

- **Transcripción de reuniones con diarización**: el modelo puede procesar grabaciones multi-ponente y devolver el texto transcrito junto con el intervalo temporal de cada intervención, lo que facilita la generación de actas indexadas.
- **Búsqueda de eventos en audio**: usando la tarea de audio temporal grounding, un usuario puede formular una descripción ("el perro ladra") y obtener el instante exacto donde ocurre, útil para la revisión de grabaciones de vigilancia.
- **Generación de subtítulos densos para podcasts o vídeos**: el dense audio captioning produce descripciones detalladas de lo que se oye en cada segmento, con su marca de tiempo, mejorando la accesibilidad.
- **Análisis musical automático**: la tarea de timestamped music captioning identifica instrumentos, cambios de acorde o tempo a lo largo de una pista, útil para estudios musicológicos o herramientas de producción.
- **Investigación en modelos de audio**: como checkpoint de ablación, se puede usar para comparar el impacto de la pérdida gaussiana y el proyector temporal en la calidad del anclaje temporal, en experimentos académicos.
- **Desarrollo de sistemas de asistencia para personas con discapacidad auditiva**: la transcripción multi-espacios con timestamps puede alimentar interfaces de lectura de subtítulos en tiempo real, aunque solo en entornos de investigación.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para esta variante de ablación sobre un subconjunto controlado de 2.000 ejemplos:

| Metrica | Valor |
|---|---|
| DER (diarization error rate) | 98.4 |
| mIoU (temporal grounding) | 23.8 |
| Dense caption eF1 | 35.3 |
| Grounding F1 | 33.9 |

Estos valores corresponden al checkpoint naive (sin pérdida gaussiana ni proyector temporal). No se han publicado comparaciones con otros modelos en la información disponible. El modelo TEMPO completo, con los componentes eliminados, obtendría mejores métricas, pero esos datos no se incluyen en esta ficha.

## Requisitos de hardware

- No se han especificado requisitos oficiales de hardware en la model card.
- Dado el tamaño de 8,27 B de parámetros y el uso de FP16, se estima que la inferencia requiere al menos 16 GB de VRAM, pero este dato no está confirmado.
- Una GPU de gama alta como la RTX 4090 (24 GB) o una A100 (40 GB) serían adecuadas para la carga del modelo en FP16.
- No se menciona compatibilidad con cuantizaciones (GGUF, GPTQ, etc.) ni con motores de inferencia como vLLM u Ollama. El despliegue probablemente requerirá un script personalizado en PyTorch.
- La latencia y el throughput no están disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de audio-language con anclaje temporal) en los datos proporcionados. El modelo base Audio Flamingo 3 de NVIDIA es la referencia directa, pero no se han publicado comparativas cuantitativas con otros modelos en la información disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `nvidia-research-only` limita el uso exclusivamente a investigación académica no comercial. Cualquier uso comercial está prohibido.
- **Es una ablación**: este checkpoint elimina deliberadamente componentes clave del modelo TEMPO, por lo que su rendimiento en anclaje temporal es inferior al del modelo completo (DER 98.4, mIoU 23.8). No debe usarse en producción como si fuera el modelo final.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar descripciones o eventos que no están presentes en el audio, especialmente en tareas de captioning.
- **Limitaciones de idioma**: no se ha especificado el conjunto de idiomas soportados; aunque el encoder Whisper es multilingüe, el modelo no ha sido evaluado en todos los idiomas.
- **Dependencia del proyector temporal**: en este checkpoint se usa el proyector estándar de Audio Flamingo 3, pero el modelo TEMPO original requiere el archivo `time_proj.pt`. Este archivo no se incluye en este repo, por lo que la reproducción exacta de los resultados reportados puede requerir ajustes.
- **Datos de entrenamiento**: los corpora usados tienen licencias CC BY 4.0 y CC BY-NC 3.0, lo que puede imponer restricciones adicionales en el uso de los datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaousheik/tempo-ablation-naive
- Dataset `Kaousheik/tempo`: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Página de investigación del autor: https://kaousheik-26.github.io/research/
- Perfil del autor: https://huggingface.co/Kaousheik
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=Yc8bSDIAAAAJ&hl=en
