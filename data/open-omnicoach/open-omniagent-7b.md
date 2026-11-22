# Open-OmniCoach/Open-OmniAgent-7B

## Resumen

Open-OmniAgent-7B es un modelo multimodal de tipo "omni" (texto, imagen, audio y vídeo) desarrollado por Open-OmniCoach, un grupo de investigación vinculado a Weisong Liu, Xiangtai Li, Haochen Wang, Haiquan Wen y Zhaoxiang Zhang. Se construye mediante fine-tuning del modelo base Qwen2.5-Omni-7B y está orientado a la comprensión de vídeo con "percepción activa", es decir, agentes capaces de razonar sobre secuencias audiovisuales largas y seleccionar evidencia relevante dentro del vídeo. El modelo se presenta como un agente compacto de 7B que puede desplegarse en una sola GPU de 24-48 GB mediante vLLM o SGLang.

El modelo se entrena con el framework Open-OmniCoach, que combina el dataset OmniCoach-240K (trayectorias multi-span y de reflexión) con una etapa de post-entrenamiento denominada SEPO. Según la model card, esta aproximación aporta mejoras de +6,3 puntos porcentuales en la media de cinco benchmarks de vídeo omni-modal, con incrementos de +11,1 pp en OmniVideoBench, +8,1 pp en Daily-Omni y +5,8 pp en LVOmniBench respecto al modelo base.

Es relevante porque aborda el problema de la comprensión de vídeo de larga duración con audio, un escenario donde los modelos multimodales convencionales suelen degradarse. Sin embargo, en el momento de redactar esta ficha el repositorio está inicializado pero los pesos del checkpoint aún no se han publicado, por lo que no es posible su uso práctico todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal omni-modal (hereda la de Qwen2.5-Omni-7B); detalles internos no disponibles |
| Parametros totales | 10.732.225.440 (~10,7B, según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 22,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo omni-modal que procesa texto, imagen, audio y vídeo. Sobre esa base, Open-OmniCoach aplica un fine-tuning orientado a agentes de vídeo con percepción activa. El framework introduce el dataset OmniCoach-240K, compuesto por trayectorias multi-span (selección de múltiples fragmentos de evidencia dentro del vídeo) y trayectorias de reflexión, y una etapa de post-entrenamiento llamada SEPO. La model card no detalla la composición exacta del dataset ni el número de tokens de entrenamiento, ni especifica si se emplearon técnicas de RLHF o DPO más allá de SEPO.

La innovación principal es el enfoque de "percepción activa": el agente no consume pasivamente el vídeo completo, sino que aprende a localizar y razonar sobre fragmentos relevantes, lo que resulta especialmente útil en vídeos largos con audio. No se dispone de información sobre innovaciones de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Comprensión de vídeo omni-modal: procesa simultáneamente flujos visuales y de audio para responder preguntas sobre el contenido.
- Razonamiento multi-paso sobre vídeo: las trayectorias de reflexión del entrenamiento sugieren capacidad de descomponer consultas complejas en pasos intermedios.
- Percepción activa: selección de evidencia multi-span dentro de secuencias de vídeo largas.
- Comprensión de vídeo de larga duración: mejoras reportadas en LongVideoBench y LVBench.
- Procesamiento de imagen y audio: heredado del modelo base Qwen2.5-Omni-7B.
- Generación de texto a partir de entrada vídeo-texto (pipeline `video-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar audio y vídeo conjuntamente para resumir intervenciones, identificar acuerdos y extraer acciones, aprovechando su entrenamiento en trayectorias de evidencia multi-span.
- Moderación de contenido audiovisual: dado su enfoque en percepción activa, puede localizar fragmentos concretos dentro de vídeos largos para revisar infracciones, reduciendo el coste frente al análisis completo.
- Asistentes para personas con discapacidad visual: descripción y respuesta a preguntas sobre vídeo en tiempo real o diferido, combinando pistas visuales y sonoras.
- Búsqueda semántica en archivos de vídeo: indexación y recuperación de momentos relevantes en grandes catálogos mediante la selección de spans de evidencia.
- Supervisión de clases o formación: análisis de grabaciones docentes para identificar momentos clave, preguntas de alumnos o ejemplos, con razonamiento multi-paso.
- Investigación en robótica y agentes encarnados: como componente de percepción y razonamiento sobre flujos audiovisuales en entornos simulados o grabados.
- Evaluación de calidad de vídeo y audio: detección de anomalías audiovisuales mediante consultas en lenguaje natural sobre el contenido.
- Despliegue en producción con vLLM o SGLang en una GPU de 24-48 GB, según indica la model card, para servicios de análisis de vídeo bajo demanda.

## Benchmarks y rendimiento

| Benchmark | Open-OmniAgent-7B | Qwen2.5-Omni-7B (delta) |
|---|---|---|
| Media 5 benchmarks omni-vídeo | 51,3% | +6,3 pp |
| OmniVideoBench | no disponible (valor absoluto) | +11,1 pp |
| Daily-Omni | no disponible (valor absoluto) | +8,1 pp |
| LVOmniBench | no disponible (valor absoluto) | +5,8 pp |
| Video-MME | 67,9% | +3,6 pp |
| LongVideoBench | 57,1% | +3,3 pp |
| LVBench | 51,7% | +8,7 pp |

Los valores absolutos de OmniVideoBench, Daily-Omni y LVOmniBench no se publican en la model card; solo se indican las diferencias respecto al modelo base. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que el modelo funciona en una sola GPU de 24-48 GB. Con pesos en safetensors de ~10,7B parámetros, en bf16 se requieren aproximadamente 21,5 GB solo para pesos, más memoria para el procesador multimodal y el KV cache; en cuantización de 8 bits bajaría a ~11 GB y en 4 bits a ~6 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) sería el mínimo práctico en bf16 según la indicación del autor.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) con margen ajustado en bf16, o en GPUs de 16 GB con cuantización.
- Opciones de despliegue: vLLM y SGLang, según la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-OmniAgent-7B | ~10,7B | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | pesos no publicados aún |
| Qwen2.5-Omni-7B | ~7B (según nombre) | no disponible | texto, imagen, audio, vídeo | Apache 2.0 (según modelo base) | público en Hugging Face |
| Alternativas de vídeo-agente de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no identifica otras alternativas directamente comparables. Open-OmniAgent-7B reporta mejoras consistentes sobre Qwen2.5-Omni-7B en todos los benchmarks de vídeo citados, pero su indisponibilidad actual de pesos impide una comparación práctica.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio está inicializado pero el checkpoint no está disponible, por lo que el modelo no puede utilizarse todavía.
- Sesgos conocidos: no disponibles; al heredar Qwen2.5-Omni-7B, es probable que arrastre sesgos del modelo base y de los datos de entrenamiento, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de vídeo con razonamiento multi-paso pueden generar descripciones plausibles pero incorrectas de eventos no presentes.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Omni-7B y de los datasets empleados.
- Caveat de producción: las mejoras reportadas son relativas al modelo base en benchmarks concretos; no hay datos de latencia, throughput ni robustez en dominios fuera de distribución.
- El tamaño real de parámetros (~10,7B) supera el "7B" del nombre, lo que afecta a los requisitos de memoria frente a lo que sugiere la denominación.

## Enlaces

- Hugging Face: https://huggingface.co/Open-OmniCoach/Open-OmniAgent-7B
- Repositorio GitHub: https://github.com/Open-OmniCoach/omnicoach
- Página del proyecto: https://open-omnicoach.github.io
- Dataset OmniCoach-240K: https://huggingface.co/datasets/Open-OmniCoach/OmniCoach-240K
- Kit de evaluación: https://github.com/Open-OmniCoach/video-agent-evalkit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
