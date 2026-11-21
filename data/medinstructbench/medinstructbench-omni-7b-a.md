# medinstructbench/medinstructbench-omni-7b-a

## Resumen

MedInstructBench Omni 7B (A) es un conjunto de adaptadores LoRA publicados por el equipo de MedInstructBench sobre el modelo base Qwen/Qwen2.5-Omni-7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino orientado a una tarea muy concreta: la segmentación de vídeos instructivos médicos en pasos procedimentales, con marcas temporales de inicio y fin y una leyenda imperativa para cada paso. El modelo acompaña al artículo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos*.

La variante publicada aquí es la denominada "A" (audio only): recibe únicamente la pista de audio del vídeo, junto con la pregunta de salud y el clip de respuesta, y produce la segmentación y las leyendas. El repositorio contiene dos adaptadores: `sft/` (supervised fine-tuning con LoRA sobre el modelo de lenguaje y el codificador de audio) y `grpo/` (optimización con GRPO sobre el modelo resultante del SFT). Ambos se fusionan secuencialmente sobre Qwen2.5-Omni-7B para reproducir exactamente los modelos evaluados en el artículo.

El interés de esta ficha es doble: por un lado, documenta un caso de uso especializado (captioning denso de vídeo médico) sobre una arquitectura omni; por otro, sirve como referencia de cómo se publican adaptadores PEFT reproducibles con instrucciones de fusión e inferencia. El tamaño del repositorio (0,7 GB) corresponde únicamente a los pesos de los adaptadores, no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen2.5-Omni-7B (transformer multimodal vision-audio-lenguaje) |
| Parametros totales | No disponible (el modelo base Qwen2.5-Omni-7B tiene 7B; los adaptadores LoRA no declaran su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en `sft/` y `grpo/`) |
| Modelo base | Qwen/Qwen2.5-Omni-7B (revision `ae9e1690543ffd5c0221dc27f79834d0294cba00`) |
| Modalidad de entrada | Audio only (variante A) |
| Tarea | Segmentacion de pasos procedimentales y captioning denso de video medico |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Omni-7B, un transformer multimodal que procesa visión, audio y lenguaje. Sobre él se aplican dos etapas de ajuste con LoRA. La primera, `sft/`, entrena adaptadores de bajo rango tanto en el modelo de lenguaje como en el codificador de audio, partiendo del checkpoint del modelo base indicado en la model card. La segunda, `grpo/`, aplica optimización con GRPO únicamente sobre el modelo de lenguaje, partiendo del modelo SFT ya fusionado.

Los datos de entrenamiento corresponden a MedInstruct10K, el conjunto asociado al benchmark MedInstructBench. La tarea formulada es: dada una pregunta de salud y su clip de respuesta, segmentar el clip en pasos instructivos, cada uno con tiempos de inicio y fin y una leyenda en modo imperativo. La variante publicada aquí utiliza solo la pista de audio como entrada, lo que la hace adecuada para escenarios donde el vídeo no está disponible o donde el coste de procesar fotogramas es prohibitivo.

La model card indica que los modelos fusionados son idénticos, tensor a tensor, a los evaluados en el artículo, y que la inferencia se realiza con decodificación greedy y fotogramas a 0,2 fps (aunque en esta variante A la entrada es solo audio). No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de su nombre.

## Capacidades

- Segmentación temporal de vídeo instructivo médico en pasos procedimentales, con marcas de inicio y fin.
- Generación de leyendas imperativas para cada paso (captioning denso).
- Comprensión de audio médico: la variante A procesa únicamente la pista de audio del clip.
- Respuesta a preguntas de salud contextualizadas por el clip de respuesta.
- Capacidades heredadas del modelo base Qwen2.5-Omni-7B (comprensión multimodal, generación de texto), aunque el ajuste está especializado en la tarea descrita.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Indexación automática de bibliotecas de vídeo médico: el modelo segmenta cada vídeo en pasos con marcas temporales, lo que permite generar capítulos navegables y metadatos estructurados para buscadores internos de hospitales o plataformas de formación.
- Generación de subtítulos descriptivos para formación de personal sanitario: a partir del audio de un procedimiento, produce leyendas imperativas paso a paso que pueden revisarse y publicarse como guion docente.
- Control de calidad de contenido formativo: comparar la segmentación automática con el guion original permite detectar pasos omitidos o mal descritos en vídeos de procedimientos.
- Accesibilidad: convertir el audio de un vídeo instructivo en una transcripción estructurada por pasos, útil para personas con discapacidad auditiva o para consumo en entornos sin vídeo.
- Extracción de procedimientos para bases de conocimiento clínicas: los pasos segmentados y sus leyendas pueden alimentar checklists o protocolos internos, siempre con revisión humana.
- Procesamiento por lotes de archivos de audio: al requerir solo audio, el coste computacional es menor que el de pipelines que procesan fotogramas, lo que facilita el reprocesamiento masivo de archivos existentes.
- Investigación en benchmarks multimodales: sirve como referencia reproducible para comparar variantes (audio only frente a vision-audio) en la tarea de segmentación de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* para los resultados, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El repositorio contiene solo adaptadores LoRA (0,7 GB); para inferencia es necesario fusionarlos con Qwen2.5-Omni-7B y desplegar el modelo completo.
- VRAM estimada para el modelo fusionado en precisión completa (fp16/bf16): en torno a 14-16 GB solo para pesos, más memoria para el codificador de audio y el contexto; no se dispone de mediciones oficiales en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cabría esperar viabilidad en GPU de 24 GB o más en cuantizaciones de 8 bits, pero es una estimación no confirmada.
- Despliegue: la model card documenta un flujo propio basado en scripts (`training/merge_lora.py` e `inference/run_qwen25omni.py`) del repositorio de código. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedInstructBench Omni 7B (A) | 7B (base) + LoRA | No disponible | Segmentacion y captioning de video medico (audio only) | Apache 2.0 | Hugging Face |
| Qwen2.5-Omni-7B (base) | 7B | No disponible en esta ficha | Multimodal vision-audio-lenguaje general | Apache 2.0 | Hugging Face |
| Variante vision-audio de MedInstructBench | 7B (base) + LoRA | No disponible | Misma tarea con entrada de video y audio | Apache 2.0 (segun el autor) | No confirmada en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: fuera de la tarea de segmentación y captioning de vídeo médico, su comportamiento no está validado y puede degradarse respecto al modelo base.
- Entrada solo audio (variante A): no aprovecha la información visual, lo que puede afectar a pasos que dependen de gestos o instrumentos visibles.
- Riesgo de alucinación en leyendas médicas: las descripciones generadas deben revisarse por personal clínico antes de cualquier uso formativo o asistencial.
- Sesgos: no documentados en la información disponible; al entrenarse sobre un corpus médico concreto, puede reflejar sesgos de especialidad, idioma o demografía de los vídeos de origen.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen2.5-Omni-7B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- La fecha de creación indicada (2026-11-21) es posterior a la de esta ficha; conviene verificar la vigencia del repositorio.
- No se documentan límites de contexto ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/medinstructbench/medinstructbench-omni-7b-a
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de código (anónimo): https://anonymous.4open.science/r/medinstructbench-5080/
- Artículo: *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* (enlace directo no disponible en la información proporcionada)
