# Shayannasiri/MedFrame-R1-Qwen3.5-9B

## Resumen

MedFrame-R1-Qwen3.5-9B es un modelo multimodal de razonamiento médico desarrollado por Shayannasiri, obtenido mediante aprendizaje por refuerzo (RL) a partir del checkpoint base Qwen/Qwen3.5-9B. El modelo procesa entradas de imagen y texto (pipeline `image-text-to-text`) y genera una cadena de razonamiento dentro de un bloque de pensamiento antes de emitir la respuesta final, orientado a tareas de VQA y QA clínicas.

El modelo se entrena con el framework MedFrame-R1, un esquema de RL diseñado para MLLMs médicos, partiendo del checkpoint liberado sin fase de cold start, durante 100 pasos y con un umbral de longitud T=500. Los datos de entrenamiento provienen del conjunto MBZUAI/medix-rl-data (51.335 muestras), complementado con trazas de razonamiento en Shayannasiri/MedFrame-R1-CoT.

Con 9.409.813.744 parámetros totales, licencia Apache 2.0 y pesos en safetensors, el modelo es relevante para investigación en razonamiento multimodal médico, aunque su uso previsto es exclusivamente de investigación y no para toma de decisiones clínicas. La información pública disponible no detalla la longitud de contexto, los idiomas soportados ni los resultados numéricos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal basado en Qwen3.5-9B, tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo base de aproximadamente 9,4 mil millones de parámetros, y se ajusta mediante aprendizaje por refuerzo con el framework MedFrame-R1. El entrenamiento se realiza desde el checkpoint liberado sin fase de cold start, durante 100 pasos de RL con un umbral de longitud T=500. No se especifican en la información disponible los detalles de la arquitectura interna (tipo de transformer, mecanismos de atención, componentes de visión) ni la composición exacta del corpus de preentrenamiento.

Los datos de RL provienen de MBZUAI/medix-rl-data, con 51.335 muestras, y las trazas de razonamiento se publican en Shayannasiri/MedFrame-R1-CoT. La innovación principal es el propio esquema MedFrame-R1, presentado como un framework de RL fiable para MLLMs médicos, que entrena al modelo para razonar dentro de un bloque de pensamiento antes de responder. El modelo card indica que hay un paper en preparación ("Paper coming soon"), por lo que los detalles metodológicos completos no están disponibles.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa pares imagen-texto y produce respuestas textuales.
- Razonamiento explícito en modo pensamiento: genera una cadena de razonamiento dentro de un bloque de thinking antes de la respuesta final; el template de chat lo mantiene activado por defecto.
- Visual question answering (VQA) médica: responde preguntas sobre imágenes clínicas, como la detección de neumotórax en el ejemplo de la model card.
- Question answering (QA) textual de dominio médico, según los benchmarks reportados (6 basados en imagen y 11 basados en texto).
- Conversación multi-turno mediante el template de chat y `apply_chat_template`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el razonamiento multi-paso se limita al bloque de pensamiento interno.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en razonamiento multimodal médico: uso del modelo como sujeto de estudio para evaluar cómo el RL afecta a las cadenas de razonamiento en MLLMs, aprovechando las trazas publicadas en MedFrame-R1-CoT para analizar el proceso de pensamiento.
- Evaluación comparativa de MLLMs médicos: reproducción de los 17 benchmarks médicos (19.200 ítems) descritos en la model card para comparar el modelo con alternativas de 7B a 9B parámetros bajo reglas deterministas y un panel de tres jueces.
- VQA clínica en entornos de investigación: responder preguntas sobre radiografías u otras imágenes médicas (por ejemplo, "¿hay evidencia de neumotórax?") como parte de estudios de validación, nunca para diagnóstico real.
- Generación de datasets de razonamiento médico: uso del bloque de pensamiento para producir trazas de razonamiento sintéticas que alimenten otros experimentos de entrenamiento o ajuste fino.
- Prototipado de asistentes de apoyo a la formación médica: construcción de demostraciones educativas que expliquen el razonamiento detrás de una interpretación de imagen, con supervisión humana y sin uso clínico.
- Investigación en RL para modelos multimodales: reproducción del pipeline MedFrame-R1 (100 pasos, T=500, sin cold start) sobre el checkpoint para estudiar la estabilidad y fiabilidad del entrenamiento por refuerzo.

## Benchmarks y rendimiento

La model card reporta resultados de precisión (%) sobre 17 benchmarks médicos (19.200 ítems) para modelos de 7B a 9B parámetros, evaluados con reglas deterministas y un panel de tres jueces, con columnas de media VQA (6 benchmarks de imagen), media QA (11 de texto), Macro (media de los 17) y Micro (agregado sobre todas las muestras). Sin embargo, los valores numéricos se presentan únicamente en la imagen `results.png` y no están disponibles como texto en la información proporcionada.

| Benchmark | MedFrame-R1-Qwen3.5-9B | Alternativas 7B-9B |
|---|---|---|
| VQA (media de 6 benchmarks) | no disponible (solo en imagen) | no disponible (solo en imagen) |
| QA (media de 11 benchmarks) | no disponible (solo en imagen) | no disponible (solo en imagen) |
| Macro (media de 17) | no disponible (solo en imagen) | no disponible (solo en imagen) |
| Micro (agregado) | no disponible (solo en imagen) | no disponible (solo en imagen) |

No se han publicado resultados de benchmarks en forma numérica en la información disponible; los datos solo aparecen en la figura `results.png` de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.409.813.744 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 18,8 GB, lo que requiere al menos ~20 GB de VRAM solo para los pesos; en cuantización de 8 bits bajaría a ~9,4 GB y en 4 bits a ~4,7 GB, aunque el autor no publica cuantizaciones ni requisitos oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPUs de centro de datos como A100 (40/80 GB) o H100 para FP16, pero no está confirmado por el autor.
- GPU de consumo: no confirmado. En FP16 el modelo no cabe en GPUs de consumo de 16-24 GB sin cuantización; con cuantizaciones de 8 o 4 bits podría ser viable en tarjetas de 24 GB, pero no hay pesos GGUF publicados.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara el modelo con alternativas de 7B a 9B parámetros en 17 benchmarks médicos, e incluye una reproducción propia de MediX-R1 (marcada con †). No se detallan los nombres ni las especificaciones del resto de modelos comparados en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedFrame-R1-Qwen3.5-9B | 9,41B | no disponible | no disponible (solo figura) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | no disponible | Hugging Face |
| MediX-R1 (reproduccion †) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: la model card indica explícitamente "Research only. Not for clinical decision making"; no debe emplearse para diagnóstico ni decisiones clínicas.
- Riesgo de alucinación: al ser un modelo generativo de razonamiento médico, puede producir afirmaciones plausibles pero incorrectas; la cadena de pensamiento no garantiza la veracidad de la respuesta.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; se desconoce el comportamiento fuera del inglés.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos o historiales largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto declarado por el autor limita la aplicación a investigación; conviene revisar las condiciones del modelo base Qwen3.5-9B.
- Detalles de entrenamiento limitados: solo 100 pasos de RL y un paper pendiente de publicación reducen la trazabilidad metodológica.
- Ausencia de cuantizaciones publicadas y de métricas de latencia, lo que dificulta la planificación de despliegues en producción.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de evidencia externa sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de RL: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
- Paper: pendiente de publicación ("Paper coming soon"), sin enlace disponible.
