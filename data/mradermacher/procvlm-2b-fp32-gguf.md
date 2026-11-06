# mradermacher/ProcVLM-2B-FP32-GGUF

## Resumen

ProcVLM-2B-FP32-GGUF es la versión cuantizada en formato GGUF del modelo ProcVLM-2B-FP32, un vision-language model de 2.031.739.904 parámetros desarrollado por el equipo ce-amtic y orientado específicamente a robótica y manipulación de robots. La cuantización la ha realizado mradermacher, un conocido publicador de quants en Hugging Face, a partir de los pesos originales en FP32. El modelo está construido sobre la arquitectura Qwen3-VL, según indica la model card, y su especialidad es la estimación de progreso (progress reward) en tareas de manipulación robótica.

El modelo resuelve un problema concreto en el ámbito de la robótica: evaluar en qué punto de una tarea de manipulación se encuentra un robot a partir de observaciones visuales. Para ello se ha entrenado con dos datasets propios del autor: ProcVQA-20M-annotations (20 millones de anotaciones de preguntas y respuestas visuales) y ProcCorpus-60M. Esto lo convierte en una herramienta especializada para pipelines de aprendizaje por refuerzo y evaluación de políticas robóticas, más que en un modelo de propósito general.

La relevancia de esta ficha radica en que ofrece la versión GGUF del modelo, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos FP32 originales. El modelo declara soporte únicamente para inglés y licencia CC-BY-4.0, lo que facilita su uso comercial con atribución. El repo ocupa 19,9 GB e incluye múltiples niveles de cuantización, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer), según tags de la model card |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL, una arquitectura de transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imágenes y texto de forma conjunta. Los detalles concretos de la arquitectura interna (número de capas, dimensión oculta, número de cabezas de atención, resolución de entrada de imagen) no están disponibles en la información proporcionada. El modelo base se distribuye en FP32, lo que sugiere que el entrenamiento se realizó con precisión completa o que se conservaron los pesos originales sin cuantizar.

El entrenamiento se ha realizado con dos datasets propios: ProcVQA-20M-annotations, con 20 millones de anotaciones de preguntas y respuestas visuales orientadas a tareas de manipulación, y ProcCorpus-60M. No se dispone de información sobre el número total de tokens procesados, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La especialización del modelo en progress reward sugiere un entrenamiento supervisado orientado a predecir el grado de avance de una tarea robótica a partir de observaciones visuales, aunque este extremo no se detalla en la model card.

## Capacidades

- Comprensión de imágenes y texto de forma conjunta (vision-language model).
- Estimación de progreso en tareas de manipulación robótica (progress reward).
- Respuesta a preguntas visuales (VQA) sobre escenas de robótica.
- Procesamiento de conversaciones multi-turno (tag conversational).
- Integración con endpoints compatibles (tag endpoints_compatible).
- Capacidades de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible, salvo la visión implícita en su naturaleza VLM.

## Casos de uso

- Evaluación de políticas de manipulación robótica: el modelo puede estimar el grado de progreso de una tarea a partir de imágenes de la escena, lo que permite calcular recompensas intermedias en pipelines de reinforcement learning sin necesidad de anotación humana continua.
- Supervisión de robots en producción: integrado en un bucle de control, puede detectar si una tarea de ensamblaje o pick-and-place se está ejecutando correctamente y alertar cuando el progreso se estanca.
- Anotación automática de datasets de robótica: dado su entrenamiento con ProcVQA-20M, puede generar etiquetas de progreso sobre nuevas grabaciones de vídeo de manipulaciones para ampliar datasets de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como modelo de recompensa para filtrar demostraciones de baja calidad antes de entrenar políticas de imitación.
- Educación y prototipado en robótica: al caber en GPUs de consumo en cuantizaciones Q4, permite a estudiantes y laboratorios con recursos limitados experimentar con modelos de recompensa visual sin infraestructura de datacenter.
- Sistemas de verificación de tareas domésticas o industriales: puede comprobar visualmente si un robot ha completado pasos específicos de una secuencia (por ejemplo, abrir una puerta, colocar un objeto) y registrar el estado.
- Integración en asistentes de teleoperación: ayuda al operador humano a identificar en qué fase de la tarea se encuentra el robot y qué paso viene a continuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en Q2_K, 1,3-1,4 GB en Q4_K_S/Q4_K_M, 2,3 GB en Q8_0 y 4,2 GB en f16, a los que hay que sumar 0,5-0,9 GB del proyector multimodal (mmproj).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 con mmproj Q8_0; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4-8 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors requiere transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| ProcVLM-2B-FP32-GGUF | 2,03 B | no disponible | CC-BY-4.0 | GGUF | Progress reward en robótica |
| Qwen3-VL (tamaño 2B, referencia) | ~2 B | no disponible | según variante | safetensors/GGUF | Vision-language general |
| Modelos VLM de 2B de propósito general | ~2 B | variable | variable | variable | VQA y captioning general |

La comparativa con alternativas concretas no está disponible en la información proporcionada, ya que no se han facilitado datos de benchmarks ni de otros modelos de progress reward comparables. La principal diferencia de ProcVLM frente a un VLM general de tamaño similar es su especialización en estimación de progreso para manipulación robótica, entrenado con datasets específicos del dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse con datasets propios de robótica, puede heredar sesgos de las escenas y tareas representadas en ProcVQA-20M y ProcCorpus-60M.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones visuales o estimaciones de progreso incorrectas, especialmente ante escenas fuera de distribución.
- Limitaciones de contexto o idioma: solo declara soporte para inglés; la longitud de contexto no está documentada.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar los términos exactos y la licencia del modelo base ce-amtic/ProcVLM-2B-FP32.
- Caveats para producción: es una cuantización estática (no imatrix) realizada por un tercero; la calidad puede diferir de los pesos FP32 originales. Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente el rendimiento. No hay benchmarks publicados que validen la calidad de los quants.
- El modelo está especializado en robótica; su uso como VLM general puede dar resultados inferiores a modelos de propósito general del mismo tamaño.
- El repo tiene 19,9 GB e incluye todos los quants; para descargar solo una variante conviene usar los enlaces directos de la tabla de quants.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/ProcVLM-2B-FP32-GGUF
- Modelo base: https://huggingface.co/ce-amtic/ProcVLM-2B-FP32
- Dataset ProcVQA-20M-annotations: https://huggingface.co/datasets/ce-amtic/ProcVQA-20M-annotations
- Dataset ProcCorpus-60M: https://huggingface.co/datasets/ce-amtic/ProcCorpus-60M
- Página de overview de quants del autor: https://hf.tst.eu/model#ProcVLM-2B-FP32-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
