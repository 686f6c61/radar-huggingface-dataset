# Kaousheik/tempo-sft-stage1-2

## Resumen

TEMPO es un modelo de post-entrenamiento para grandes modelos de lenguaje de audio (LALMs) desarrollado por Kaousheik Jayakumar, estudiante de máster en la Universidad de Maryland, en colaboración con NVIDIA. El modelo aborda un problema fundamental en la comprensión auditiva: la incapacidad de los LALMs existentes para realizar tareas de temporización precisa, como identificar qué sonido empezó primero o cuál duró más. TEMPO es el primer modelo unificado que maneja tareas de timestamping en audio, habla y música de forma simultánea.

El modelo se construye sobre Audio Flamingo 3 de NVIDIA, que combina un encoder de audio Whisper-large congelado con un LLM Qwen2-7B. TEMPO añade tres innovaciones: tokens de timestamp atómicos con resolución de 0,1 segundos, un proyector multimodal consciente del tiempo que inyecta codificaciones sinusoidales de reloj de pared, y un protocolo de entrenamiento en dos etapas (síntesis primero, datos reales después). El checkpoint resultante tiene 8.271 millones de parámetros y un tamaño de repositorio de 16,6 GB.

La relevancia de este modelo radica en que unifica cinco tareas temporales distintas —ASR multi-hablante, diarización, grounding temporal, captioning denso y captioning musical con timestamps— en un solo modelo, algo que tradicionalmente requería sistemas separados. Además, introduce un mecanismo de tokens de timestamp atómicos que permite intercalar marcas temporales directamente en el texto generado, lo que facilita la interpretación y el uso en aplicaciones posteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + Qwen2-7B + proyector temporal) |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredado de Qwen2-7B y Whisper-large) |
| Licencia | nvidia-research-only (uso académico no comercial exclusivamente) |
| Formato de pesos | safetensors (16,6 GB) |

## Arquitectura y entrenamiento

La arquitectura se basa en Audio Flamingo 3, que combina un encoder de audio Whisper-large congelado con el LLM Qwen2-7B. La innovación principal es el proyector multimodal consciente del tiempo, que inyecta codificaciones sinusoidales de reloj de pared en los frames de audio. Este proyector, guardado como `time_proj.pt`, es un componente obligatorio que no forma parte del checkpoint del transformer y debe cargarse por separado. El modelo dispone de aproximadamente 601 tokens de timestamp atómicos con resolución de 0,1 segundos, lo que permite una granularidad temporal muy fina en las respuestas.

El entrenamiento sigue una receta SFT en dos etapas: primero con datos sintéticos (stage 1) y después con datos reales (stage 2), durante 2 épocas con una tasa de aprendizaje de 5e-5. El dataset `Kaousheik/tempo` contiene cinco configuraciones de tareas con divisiones para cada etapa. Los pesos son fusionados (LoRA ya aplicada), lo que significa que el checkpoint contiene los pesos completos del modelo.

## Capacidades

- Generación de transcripciones ASR multi-hablante con timestamps de inicio y fin para cada segmento de habla.
- Diarización de hablantes con marcas temporales, identificando qué hablante está activo en cada intervalo.
- Audio temporal grounding: localización de eventos de audio específicos dentro de una grabación, respondiendo con intervalos de tiempo.
- Dense audio captioning: generación de descripciones detalladas del contenido auditivo con timestamps asociados a cada evento descrito.
- Captioning de música con timestamping: descripción de instrumentos, tempo, acordes y estadísticas con marcas temporales.
- Intercalado de tokens de timestamp con texto, lo que permite respuestas estructuradas y fácilmente parseables.
- Soporte de tareas seleccionadas mediante etiquetas en el prompt (`[speech:asr]`, `[speech:diar]`, `[audio:ground]`, `[audio:caption]`, `[audio:music]`).

## Casos de uso

- Análisis de reuniones y conversaciones: el modelo puede transcribir automáticamente reuniones multi-hablante con marcas de tiempo para cada intervención, facilitando la búsqueda de momentos concretos en grabaciones largas.
- Generación de subtítulos para contenido multimedia: la capacidad de timestamping permite crear subtítulos sincronizados con precisión de 0,1 segundos para vídeos, podcasts o conferencias.
- Moderación y análisis de contenido audiovisual: el temporal grounding permite localizar eventos específicos (explosiones, risas, aplausos) dentro de un vídeo, útil para moderación automatizada o análisis de contenido.
- Descripción de escenas auditivas para accesibilidad: el dense audio captioning con timestamps puede generar descripciones de audio para personas con discapacidad auditiva, indicando qué sonidos ocurren y cuándo.
- Análisis musical asistido: el captioning de música con timestamps permite identificar qué instrumentos suenan en cada sección de una canción, facilitando tareas de análisis musical y educación.
- Verificación de contenido y fact-checking: la diarización con timestamps puede ayudar a verificar quién dijo qué y cuándo en grabaciones, útil para periodismo y procesos legales.
- Investigación en acústica: el modelo puede ser usado para anotar automáticamente grandes corpus de audio con timestamps, acelerando la creación de datasets de entrenamiento.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en la información proporcionada:

| Metrica | Valor |
|---|---|
| ASR MAE (error absoluto medio) | 0,77 |
| mIoU (mean Intersection over Union) | 63,8 |
| WER (Word Error Rate) | 44,7 |
| DER (Diarization Error Rate) | 25,4 |
| Dense captioning eF1 | 58,5 |
| Grounding F1 | 46,2 |

No se dispone de comparativas detalladas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,27 B de parámetros en fp32, lo que requiere aproximadamente 33 GB de VRAM sin cuantizar. Con cuantización de 8 bits se reduce a unos 16,5 GB, y con 4 bits a unos 8,5 GB.
- GPUs recomendadas: para inferencia completa sin cuantizar, se recomienda una A100 40 GB, H100 80 GB o RTX A6000 48 GB. Con cuantización de 4 bits, una RTX 4090 (24 GB) podría ser suficiente.
- No hay indicación de que funcione en GPUs de consumo sin cuantizar.
- Opciones de despliegue: al ser un modelo basado en transformadores, puede ser desplegado con vLLM, TGI o llama.cpp si se convierten los pesos a GGUF. Sin embargo, el proyector temporal (`time_proj.pt`) requeriría una integración personalizada, ya que no es parte del checkpoint estándar.
- Latencia y throughput: no se proporcionan datos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TEMPO (este modelo) | 8,27 B | No disponible | nvidia-research-only | HuggingFace |
| Audio Flamingo 3 (base) | 8,27 B | No disponible | nvidia-research-only | HuggingFace |
| Qwen2-Audio | 7,6 B | No disponible | Apache 2.0 | HuggingFace |

El modelo se distingue de su base (Audio Flamingo 3) por el entrenamiento específico en tareas temporales. Comparado con Qwen2-Audio, que tiene una licencia más permisiva, TEMPO ofrece capacidades de timestamping más precisas pero con restricciones de uso académico exclusivo.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo la licencia nvidia-research-only, que limita su uso exclusivamente a investigación académica no comercial. Cualquier uso comercial está prohibido.
- WER elevado: el 44,7 de WER indica que la transcripción no es de alta calidad en comparación con modelos ASR dedicados, lo que limita su uso en aplicaciones de transcripción precisa.
- Dependencia de un módulo adicional: el proyector temporal (`time_proj.pt`) es obligatorio y no está incluido en el checkpoint del transformer, lo que puede complicar el despliegue.
- Datos de entrenamiento con licencias mixtas: los corpus de entrenamiento incluyen licencias CC BY 4.0 y CC BY-NC 3.0, lo que añade restricciones adicionales de uso.
- Sin información sobre sesgos: no se proporcionan datos sobre sesgos en el modelo, lo que es relevante para aplicaciones de análisis de conversaciones.
- Riesgo de alucinación temporal: como cualquier LALM, puede generar timestamps incorrectos o inventar eventos auditivos que no existen.
- Idiomas no documentados: aunque el modelo es multilingüe por su base, no se documentan los idiomas soportados ni el rendimiento por idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaousheik/tempo-sft-stage1-2
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base Audio Flamingo 3: https://huggingface.co/nvidia/audio-flamingo-3
- Página personal del autor: https://kaousheik-26.github.io/
- Investigación del autor: https://kaousheik-26.github.io/research/
- Paper TEMPO (OpenReview): https://openreview.net/pdf?id=LoXjHBlPEd
