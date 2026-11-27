# internlm/Sage-Med-Preview

## Resumen

Sage-Med-Preview es un modelo multimodal especializado en dominio médico desarrollado por el equipo Sage-Med del Shanghai Artificial Intelligence Laboratory (InternLM). Se construye sobre el modelo base Intern-S2-Preview mediante un proceso de adaptación específica al ámbito clínico que combina preentrenamiento continuado, mid-training orientado a tareas, un SFT en tres etapas y aprendizaje por refuerzo con recompensas específicas por tarea. El resultado es un modelo que integra conocimiento médico, comprensión de imagen, generación de informes y localización visual (visual grounding) en una única arquitectura.

La relevancia del modelo radica en su eficiencia: con 35 253 613 888 parámetros totales y solo 3B activos gracias a una arquitectura de mezcla de expertos (MoE), promedia 58,26 puntos en 31 benchmarks médicos multimodales públicos, superando a modelos propietarios de mayor tamaño como GPT-5.4 (52,78), GPT-6.2-Sol en varias tareas concretas y Hulu-Med-235B-A22B (50,99). El modelo se entrenó sobre un corpus de aproximadamente 164 millones de registros y 226 mil millones de tokens.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face. No se dispone de detalles sobre licencia, idiomas soportados ni de la totalidad de los resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); tag `intern_s2_preview` |
| Parametros totales | 35 253 613 888 (≈35B) |
| Parametros activos | ≈3B (35B-A3B) |
| Longitud de contexto | 32 768 tokens (configuración de inferencia recomendada en vLLM) |
| Tipos de cuantizacion | no disponible (la model card solo documenta BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code` requerido) |

## Arquitectura y entrenamiento

Sage-Med-Preview es un modelo image-text-to-text construido sobre Intern-S2-Preview, con arquitectura de mezcla de expertos de 35B parámetros totales y aproximadamente 3B activos por token. La model card no detalla la configuración interna de expertos (número de expertos, top-k de enrutamiento) ni el codificador visual empleado; el tag `intern_s2_preview` indica la familia arquitectónica, pero los detalles finos no están disponibles en la información proporcionada. El modelo requiere `trust_remote_code` y código personalizado para su carga, lo que sugiere componentes no estándar en el pipeline multimodal.

El entrenamiento se describe como una exploración sistemática a escala de cientos de millones de registros, con pools curados que suman aproximadamente 164M de registros y 226B de tokens. El proceso consta de cuatro fases: preentrenamiento continuado sobre el modelo base, mid-training orientado a tareas médicas, un SFT en tres etapas y aprendizaje por refuerzo adaptado a la dificultad con recompensas específicas por tarea y *reference replay*. No se especifica en la información disponible la composición exacta del dataset, el uso de DPO, ni detalles sobre decodificación especulativa o atención lineal.

## Capacidades

- Comprensión multimodal de imágenes médicas: el modelo procesa pares imagen-texto y responde preguntas de tipo medical-VQA (por ejemplo, OmniMedVQA con 95,54 de accuracy).
- Generación de informes clínicos: produce informes radiológicos estructurados a partir de imágenes, con 33,37 ROUGE-L en MIMIC-CXR según la model card.
- Localización visual (visual grounding): identifica y localiza hallazgos en la imagen, una capacidad evaluada explícitamente en el conjunto de benchmarks del informe técnico.
- Razonamiento clínico multimodal: cubre tareas de comprensión médica integral (80,05 frente a 76,81 de GPT-6.2-Sol según la model card) y MedFrameQA (65,52 frente a 62,78).
- Modo thinking opcional: la plantilla de chat acepta `enable_thinking`, lo que permite activar o desactivar razonamiento extendido en la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Procesamiento de vídeo: la configuración de vLLM recomienda `--limit-mm-per-prompt '{"image":1,"video":0}'`, lo que sugiere que el pipeline admite el tipo vídeo pero no está habilitado en la receta de referencia.

## Casos de uso

- Triaje radiológico asistido: el modelo puede recibir una radiografía de tórax y generar una descripción de hallazgos visibles en segundos, sirviendo como primera lectura que priorice estudios sospechosos antes de la revisión del radiólogo. Su rendimiento en OmniMedVQA (95,54) y en generación de informes MIMIC-CXR lo hace adecuado para este flujo.
- Generación de borradores de informes clínicos: a partir de una imagen y una indicación textual, produce un informe estructurado que el especialista revisa y firma. La métrica ROUGE-L de 33,37 en MIMIC-CXR indica una calidad de borrador útil como punto de partida, no como sustituto de la lectura humana.
- Respuesta a preguntas médicas visuales para formación: integrado en una plataforma docente, permite a estudiantes de medicina consultar sobre imágenes de casos (dermatología, oftalmología, radiología) y recibir explicaciones con localización de hallazgos.
- Análisis de estudios en ensayos clínicos: procesamiento por lotes de imágenes multimodales (40+ modalidades según la model card) para extraer hallazgos estructurados y alimentar bases de datos de investigación, con revisión humana posterior.
- Segunda opinión en entornos con escasez de especialistas: despliegue en hospitales comarcales para preanalizar imágenes antes de derivar al especialista, aprovechando que el modelo cabe en una sola GPU H200 en BF16 con 32k de contexto.
- Localización de hallazgos para anotación: la capacidad de visual grounding permite generar cajas o regiones candidatas sobre las imágenes, acelerando el etiquetado de datasets médicos por parte de anotadores humanos.
- Sistemas de documentación clínica multimodal: combinación de la imagen con el historial textual del paciente (hasta 32 768 tokens de contexto) para redactar resúmenes de episodio asistenciales.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con puntuaciones en escala 0-100. Solo se dispone de un subconjunto de filas en la información proporcionada; el resto de la tabla no está disponible.

| Benchmark | Métrica | Sage-Med 35B-A3B | GPT-6.2 Sol | GPT-5.4 | Claude-Opus 4.6 | Gemini-2.5 Flash | Hulu-Med 235B-A22B |
|---|---|---:|---:|---:|---:|---:|---:|
| OmniMedVQA | Accuracy | **95,54** | 82,56 | 75,90 | 78,02 | 71,33 | 86,46 |
| GMAI-MMBench · val | Accuracy | 70,07 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Comprensión multimodal integral | Score | **80,05** | 76,81 | no disponible | no disponible | no disponible | no disponible |
| MIMIC-CXR (informes) | ROUGE-L | **33,37** | 30,31 | no disponible | no disponible | no disponible | no disponible |
| MedFrameQA | Accuracy | **65,52** | 62,78 | no disponible | no disponible | no disponible | no disponible |
| Media en 31 benchmarks médicos | Score medio | **58,26** | no disponible | 52,78 | 49,18 | no disponible | 50,99 |
| Tareas privadas de comprensión (9 tareas, 11 scores) | Score medio | **57,72** | 51,24 | no disponible | no disponible | no disponible | no disponible |

El modelo también se evaluó, según la model card, sobre 238 tareas clínicas, 74 benchmarks, más de 40 modalidades y 77 modelos de comparación, incluyendo benchmarks privados de 14 hospitales e instituciones. Los resultados completos están en el informe técnico referenciado (arXiv:2611.34575), no incluido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: en BF16 el modelo ocupa aproximadamente 131 GiB de pesos (según la model card), por lo que requiere GPUs de 141 GB o superiores para servirse en una sola tarjeta. Con cuantización a 8 bits o 4 bits el requisito bajaría teóricamente a ~66 GiB o ~33 GiB, pero no se han publicado pesos cuantizados ni configuraciones validadas.
- GPU recomendadas: NVIDIA H200 (configuración de referencia probada por el autor con un solo dispositivo, BF16 y 32 768 tokens de contexto). Una H100 de 80 GB no es suficiente en BF16 para una sola GPU; requeriría tensor-parallel-size 2. Una A100 de 80 GB presenta la misma limitación.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de gama alta en BF16. No hay evidencia de que existan versiones GGUF o cuantizadas para llama.cpp u Ollama.
- Opciones de despliegue: vLLM con `--trust-remote-code`, CUDA 12.9 y PyTorch con backend cu129 (receta oficial documentada). Para el servidor se recomienda `--gpu-memory-utilization 0.85`, `--max-model-len 32768`, `--max-num-seqs 8`, `--enforce-eager` y desactivar prefix caching. No se documentan opciones para TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Media 31 benchmarks médicos | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Sage-Med-Preview | 35B | 3B | 32 768 | 58,26 | no disponible | Hugging Face (internlm/Sage-Med-Preview) |
| Hulu-Med-235B-A22B | 235B | 22B | no disponible | 50,99 | no disponible | no disponible en la información |
| Intern-S2-Preview | no disponible | no disponible | no disponible | 52,24 | no disponible | Hugging Face (internlm/Intern-S2-Preview) |
| GPT-5.4 | propietario | propietario | no disponible | 52,78 | propietaria | API |
| Claude-Opus-4.6 | propietario | propietario | no disponible | 49,18 | propietaria | API |

Sage-Med-Preview logra la mejor media (58,26) con un orden de magnitud menos de parámetros activos que Hulu-Med-235B-A22B (3B frente a 22B), y supera a los modelos propietarios incluidos en la comparación. La comparación de contexto no es posible porque solo se dispone del dato de Sage-Med-Preview.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el equipo antes de cualquier despliegue en producción.
- Idiomas no especificados: no hay confirmación de que el modelo responda con calidad en castellano; la model card está en inglés y no documenta cobertura multilingüe.
- Riesgo de alucinación clínica: como todo modelo generativo, puede producir hallazgos inexistentes o informes plausibles pero incorrectos. En contexto médico esto es crítico y exige revisión por un profesional cualificado en todos los casos.
- Uso clínico: no se documenta certificación regulatoria (CE, FDA) ni validación prospectiva. Los benchmarks privados de 14 hospitales son retrospectivos y no sustituyen una validación clínica.
- Sesgos: no se documentan análisis de sesgo por demografía, modalidad o tipo de centro. Los datasets de entrenamiento (164M de registros) pueden sobrerrepresentar ciertas poblaciones y equipos de imagen.
- Requisitos de despliegue elevados: 141 GB de repo y ~131 GiB en BF16 limitan el despliegue a GPUs H200 o configuraciones multi-GPU; no hay versiones cuantizadas publicadas.
- Código personalizado: requiere `trust_remote_code`, lo que implica ejecutar código del autor en el entorno de inferencia; conviene auditar el repositorio antes de desplegarlo.
- Contexto limitado a 32 768 tokens en la configuración de referencia; no se documenta si el modelo soporta ventanas mayores.
- Modelo en estado "Preview": la nomenclatura sugiere una versión no final, con posibles cambios en pesos, licencia y API.

## Enlaces

- Hugging Face: https://huggingface.co/internlm/Sage-Med-Preview
- Modelo base: https://huggingface.co/internlm/Intern-S2-Preview
- Paper: https://arxiv.org/abs/2611.34575
- Web oficial: https://sage-med-preview.github.io/
- Leaderboard: https://sage-med-preview.github.io/leaderboard.html
- Repositorio GitHub: https://github.com/Sage-Med/Sage-Med-Preview
- Requisitos de entorno para H200: https://huggingface.co/internlm/Sage-Med-Preview/resolve/main/requirements-h200.txt
