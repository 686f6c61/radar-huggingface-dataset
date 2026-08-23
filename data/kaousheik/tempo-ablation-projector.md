# Kaousheik/tempo-ablation-projector

## Resumen

TEMPO es un proyecto de post-entrenamiento multi-tarea para modelos de lenguaje de audio (LALM, large audio-language models) que introduce un enfoque temporalmente fundamentado. Este checkpoint concreto, `tempo-ablation-projector`, es una variante de ablación que aplica únicamente el projector multi-modal con conciencia temporal, manteniendo el resto del modelo base congelado y usando cross-entropy estándar. Está desarrollado por Kaousheik (Jayakumar), investigador de la Universidad de Maryland, como parte de su trabajo sobre modelos de audio-lenguaje.

El modelo se construye sobre Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B. La aportación de TEMPO es un projector multi-modal que incorpora codificaciones sinusoidales de reloj de pared y un vocabulario de aproximadamente 601 tokens atómicos de timestamp con resolución de 0,1 segundos, lo que permite al modelo intercalar texto y marcas temporales en sus respuestas. Con 8,27 mil millones de parámetros, este checkpoint está diseñado para tareas como transcripción multi-hablante, diarización, grounding temporal de audio, captioning denso y captioning musical con timestamps.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + LLM Qwen2-7B) con projector multi-modal temporal |
| Parametros totales | 8.271.605.248 (≈8,27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con pesos completos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-research-only (solo investigación académica, no comercial) |
| Formato de pesos | safetensors + `time_proj.pt` (proyector temporal) |

## Arquitectura y entrenamiento

El modelo parte de Audio Flamingo 3, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B. Sobre esta base, TEMPO añade un projector multi-modal con conciencia temporal, que utiliza codificaciones sinusoidales de reloj de tiempo para representar la posición temporal dentro del audio. Además, se incorpora un vocabulario de 601 tokens atómicos de timestamp con resolución de 0,1 segundos, que el modelo intercala con texto en sus respuestas.

El entrenamiento se realizó en múltiples etapas sobre el dataset `Kaousheik/tempo`, que incluye cinco configuraciones de tareas con splits `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. En esta variante de ablación concreta, solo se entrena el projector temporal (con cross-entropy estándar), mientras que el resto del modelo permanece congelado. El checkpoint incluye los pesos completos fusionados (LoRA ya aplicada) y el fichero `time_proj.pt` con el estado del projector, que es necesario cargar por separado para que el modelo funcione.

## Capacidades

- Transcripción multi-hablante con timestamps: el modelo transcribe audio y delimita cada segmento de habla con tokens temporales.
- Diarización de hablantes: identifica quién habla y cuándo, devolviendo secuencias con marcas de tiempo y etiquetas de hablante.
- Grounding temporal de audio: localiza eventos concretos en la línea temporal del audio.
- Captioning denso de audio: genera descripciones detalladas de eventos sonoros, cada una asociada a su intervalo temporal.
- Captioning musical con timestamps: describe instrumentos, tempo, acordes y estadísticas musicales en segmentos temporales concretos.
- Interleaving texto-timestamp: el modelo mezcla lenguaje natural con tokens de timestamp en la misma secuencia de salida.

## Casos de uso

- Transcripción de reuniones multi-hablante: el modelo puede generar transcripciones con marcas de tiempo para cada intervención, lo que permite indexar y buscar contenido en grabaciones de reuniones corporativas o académicas.
- Análisis de conversaciones para investigación social: con la diarización temporal se pueden estudiar patrones de turnos de habla, duración de intervenciones y solapamientos en entrevistas o grupos focales.
- Búsqueda por contenido en archivos de audio/vídeo: el grounding temporal permite localizar momentos exactos en los que ocurre un evento sonoro concreto, útil para indexar podcasts o vídeos.
- Generación de subtítulos descriptivos para accesibilidad: el captioning denso con timestamps puede generar descripciones de eventos sonoros para personas con discapacidad auditiva, indicando cuándo ocurre cada sonido.
- Análisis musical para producción y estudios: el captioning musical temporal permite identificar secciones de una canción, cambios de tempo o instrumentación, útil para productores o musicólogos.
- Investigación académica en modelos de audio-lenguaje: este checkpoint es una pieza de investigación para estudiar el impacto del projector temporal en tareas de grounding, por lo que es adecuado para replicar experimentos o comparar variantes.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados para esta variante de ablación:

| Metrica | Valor |
|---|---|
| DER (diarization error rate) | 104.2 |
| mIoU (mean intersection over union) | 22.2 |
| Dense caption eF1 | 34.2 |
| Grounding F1 | 34.0 |

No se han publicado comparaciones con otros modelos en la información disponible. El valor de DER de 104.2 es inusualmente alto (los valores normales están entre 0 y 100), lo que sugiere que podría tratarse de una métrica no normalizada o de un resultado de ablación no optimizado.

## Requisitos de hardware

- VRAM estimada: con 8,27 B parámetros en precisión completa (FP16), se estiman entre 16 y 20 GB de VRAM para inferencia. No se especifica un mínimo oficial.
- GPU recomendadas: una NVIDIA A100 (40/80 GB) o H100 serían adecuadas para inferencia cómoda; con cuantización podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado configuraciones oficiales.
- Despliegue: al estar basado en Audio Flamingo 3, se puede cargar con las librerías de Hugging Face Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se han publicado comparativas con modelos equivalentes en la información proporcionada. El modelo es una variante de ablación específica del proyecto TEMPO, por lo que su comparación natural sería con el modelo TEMPO completo (sin ablación) y con el modelo base Audio Flamingo 3, pero no se incluyen resultados de estos en la información disponible.

## Limitaciones y advertencias

- Licencia restrictiva: es un modelo derivado de Audio Flamingo 3 de NVIDIA, con licencia `nvidia-research-only`. Solo puede usarse para investigación académica no comercial; cualquier uso en producción o comercial está prohibido.
- Dependencia del fichero `time_proj.pt`: el checkpoint del transformer no funciona sin cargar explícitamente el projector temporal, lo que añade complejidad al despliegue.
- Idiomas soportados: no se especifica qué idiomas cubre el modelo, por lo que no se puede garantizar el funcionamiento fuera del inglés u otros idiomas no documentados.
- Valor de DER anómalo: el DER de 104.2 sugiere que la diarización en esta variante de ablación no es útil en la práctica.
- Sesgos y alucinaciones: al ser un modelo de lenguaje grande sobre audio, existe riesgo de alucinación en las transcripciones y captions, especialmente con audio de baja calidad.
- Corpus de entrenamiento con restricciones: los datos de entrenamiento incluyen licencias CC BY-NC 3.0 (como ESC-50), lo que puede limitar la redistribución o uso comercial de modelos entrenados con ellos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Kaousheik/tempo-ablation-projector
- Modelo base: https://huggingface.co/nvidia/audio-flamingo-3
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Perfil del autor: https://huggingface.co/Kaousheik
- Página de investigación del autor: https://kaousheik-26.github.io/research/</think>## Resumen

TEMPO es un modelo de post-entrenamiento multi-tarea para modelos de lenguaje de audio (LALM) que introduce grounding temporal en las respuestas. Este checkpoint concreto, `tempo-ablation-projector`, es una variante de ablación del estudio TEMPO que aísla el efecto del proyector multimodal con conciencia temporal, usando únicamente cross-entropy estándar y manteniendo el resto del modelo base congelado. Está desarrollado por Kaousheik (Jayakumar), investigador de la Universidad de Maryland, que trabaja en modelos de audio-lenguaje.

El modelo se construye sobre Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B. La aportación principal es un proyector multimodal que incorpora codificaciones sinusoidales de reloj de pared y un vocabulario de aproximadamente 601 tokens atómicos de timestamp con resolución de 0,1 segundos, lo que permite al modelo intercalar marcas temporales en sus respuestas. Con 8,27 mil millones de parámetros, este checkpoint está diseñado para tareas como transcripción multi-hablante, diarización, grounding temporal de audio, captioning denso y captioning musical con timestamps.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + LLM Qwen2-7B) con proyector temporal |
| Parametros totales | 8.271.605.248 (≈8,27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos completos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-research-only (solo investigación académica, no comercial) |
| Formato de pesos | safetensors + `time_proj.pt` (proyector temporal) |

## Arquitectura y entrenamiento

El modelo se basa en Audio Flamingo 3, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B. Sobre esta base, TEMPO añade un proyector multimodal con conciencia temporal que utiliza codificaciones sinusoidales de reloj de pared para representar la posición temporal dentro del audio. El vocabulario incluye 601 tokens atómicos de timestamp con resolución de 0,1 segundos, que el modelo intercala en las respuestas de texto.

El entrenamiento se realizó en múltiples etapas sobre el dataset `Kaousheik/tempo`, que incluye cinco configuraciones de tareas con splits `synthetic_stage1`, `sft_stage2`, `rl`, `val` y `evaluation`. En esta variante de ablación solo se entrena el proyector temporal (con cross-entropy estándar), mientras que el resto del modelo permanece congelado. El checkpoint incluye los pesos completos fusionados (LoRA ya aplicada) y el fichero `time_proj.pt` con el estado del proyector, que es necesario cargar por separado para que el modelo funcione correctamente.

## Capacidades

- Transcripción multi-hablante con timestamps: genera transcripciones de audio intercalando tokens temporales para indicar cuándo ocurre cada segmento de habla.
- Diarización de hablantes: identifica qué hablante está hablando en cada momento, devolviendo secuencias con tokens temporales y etiquetas de hablante.
- Grounding temporal de audio: localiza eventos concretos en la línea de tiempo del audio, devolviendo intervalos temporales.
- Captioning denso de audio: genera descripciones detalladas de eventos sonoros, cada una asociada a su intervalo temporal.
- Captioning musical con timestamps: describe eventos musicales como instrumentos, tempo, acordes y estadísticas, con marcas temporales.
- Interleaving texto-timestamp: el modelo mezcla texto natural con tokens de timestamp en la misma secuencia de salida.

## Casos de uso

- Transcripción de reuniones multi-hablante: el modelo puede generar transcripciones con marcas temporales para cada intervención, lo que facilita la búsqueda de momentos concretos en grabaciones de reuniones corporativas o académicas.
- Análisis de conversaciones para investigación social: la diarización temporal permite analizar patrones de turnos de habla, duraciones de intervenciones y solapamientos en entrevistas o grupos de discusión.
- Indexación de archivos de audio y vídeo: el grounding temporal permite localizar con precisión cuándo ocurre un evento sonoro concreto en un archivo, útil para archivos de noticias, podcasts o vídeos.
- Generación de subtítulos descriptivos para accesibilidad: el captioning denso con timestamps puede generar descripciones de eventos sonoros para personas con discapacidad auditiva, indicando cuándo ocurre cada sonido.
- Análisis musical automatizado: el captioning musical temporal permite identificar secciones de una canción, cambios de tempo o instrumentos, útil para producción musical o investigación musicológica.
- Investigación académica en modelos de audio-lenguaje: este checkpoint sirve como base para experimentos de ablación y comparación en el desarrollo de modelos de lenguaje auditivo, dado su diseño modular y la documentación detallada de la configuración.
- Desarrollo de sistemas de vigilancia y monitorización de audio: el grounding temporal puede aplicarse a sistemas de alerta que requieren identificar cuándo se produce un evento acústico específico (por ejemplo, una alarma o una llamada de emergencia) en tiempo real.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados para esta variante de ablación:

| Metrica | Valor |
|---|---|
| DER (diarization error rate) | 104.2 |
| mIoU (mean intersection over union) | 22.2 |
| Dense caption eF1 | 34.2 |
| Grounding F1 | 34.0 |

No se han publicado comparaciones con otros modelos en la información disponible. El valor de DER de 104.2 es inusualmente alto (los valores típicos de DER están entre 0 y 100), lo que sugiere que esta variante de ablación tiene un rendimiento muy pobre en diarización, posiblemente porque el proyector solo no es suficiente para esa tarea sin el entrenamiento completo.

## Requisitos de hardware

- VRAM estimada: con 8,27 B parámetros en precisión FP16, se estima que la inferencia requiere entre 16 y 20 GB de VRAM. No se ha publicado una cifra exacta.
- GPU recomendadas: una NVIDIA A100 o H100 con 40-80 GB de VRAM sería suficiente para inferencia en FP16. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado configuraciones oficiales.
- Opciones de despliegue: al estar basado en Audio Flamingo 3, se puede cargar con las librerías de Hugging Face Transformers. No se menciona soporte para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información del modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. El modelo es una variante de ablación del proyecto TEMPO, por lo que su comparativa natural sería con el modelo TEMPO completo y con el modelo base Audio Flamingo 3, pero no se han publicado resultados de esos modelos en esta fuente.

## Limitaciones y advertencias

- Licencia restrictiva: derivado de Audio Flamingo 3 de NVIDIA, licenciado bajo `nvidia-research-only`. Solo está permitido para investigación académica no comercial. Cualquier uso comercial o en producción está prohibido.
- Dependencia del proyector: el fichero `time_proj.pt` es obligatorio para que el modelo funcione. Si no se carga correctamente, el modelo no produce salidas válidas.
- Idiomas no documentados: no se especifica qué idiomas soporta el modelo, por lo que no se puede garantizar su funcionamiento en otros idiomas que no sean los de los datos de entrenamiento.
- Rendimiento anómalo en diarización: el DER de 104.2 indica que esta variante de ablación no es útil para la diarización en la práctica.
- Riesgo de alucinación: como modelo de lenguaje grande, puede generar transcripciones o captions falsas, especialmente en audio de baja calidad.
- Restricciones adicionales en los datos de entrenamiento: algunos corpus utilizados (como ESC-50) tienen licencia CC BY-NC 3.0, lo que añade restricciones adicionales al uso de los modelos entrenados con ellos.
- Limitación de contexto: no se ha publicado la longitud máxima de contexto del modelo, lo que limita su uso en audio de larga duración.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Kaousheik/tempo-ablation-projector
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Perfil del autor en Hugging Face: https://huggingface.co/Kaousheik
- Página de investigación del autor: https://kaousheik-26.github.io/research/
