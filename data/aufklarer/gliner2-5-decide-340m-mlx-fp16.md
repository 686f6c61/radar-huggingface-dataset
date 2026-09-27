# aufklarer/GLiNER2.5-Decide-340M-MLX-fp16

## Resumen

GLiNER2.5-Decide-340M-MLX-fp16 es una conversión al formato MLX del modelo fastino/GLiNER2.5-Decide, un codificador de 340 millones de parámetros diseñado específicamente para tomar decisiones estructuradas sobre texto en lugar de generar texto libre. Dado un texto y un esquema de etiquetas definido por el usuario, el modelo devuelve una probabilidad para cada etiqueta (clasificación monoetiqueta) o los fragmentos del texto original que corresponden a cada entidad (extracción de entidades). No genera texto: su salida son puntuaciones, distribuciones de probabilidad y metadatos de factibilidad de restricciones.

Este repositorio concreto lo publica el usuario aufklarer y consiste en una conversión de los pesos originales (revisión `7ee5da4c2415e32259bcdc0b1a7367c32ce8d6f6`) al diseño de MLX, sin reentrenamiento, para inferencia nativa en Apple Silicon a través de la librería speech-swift. El modelo subyacente parte de un codificador DeBERTa-v3-large con cabezas de span y clasificación de GLiNER2, con una ventana de 512 tokens codificados que cubren conjuntamente el esquema de etiquetas y el texto de entrada.

Su relevancia actual radica en el coste: tareas repetitivas de enrutamiento, etiquetado o guardarraíles suelen consumir grandes cantidades de tokens de modelos generativos. Un codificador de 340M que corre en CPU o en hardware de Apple, devuelve decisiones con puntuación de confianza y mantiene una fidelidad prácticamente idéntica al modelo PyTorch original (diferencia máxima de confianza de 0,0012 sobre 24 casos de referencia) resulta mucho más barato y determinista para ese tipo de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large encoder con cabezas de span y clasificacion de GLiNER2 |
| Parametros totales | 340M (cifra del modelo upstream) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens codificados (esquema y texto juntos) |
| Tipos de cuantizacion | FP16 (pesos y activaciones en float16); no se documentan otras cuantizaciones en esta conversion |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (pesos del modelo); el codigo de conversion de referencia es MIT |
| Formato de pesos | safetensors en disposicion MLX (weights.safetensors, 972,9 MB) |

## Arquitectura y entrenamiento

El modelo es un codificador basado en DeBERTa-v3-large al que se le añaden las cabezas de GLiNER2: una cabeza de clasificación que produce una probabilidad por etiqueta y una cabeza de span que devuelve fragmentos del texto original para la extracción de entidades. El modelo upstream, GLiNER2.5-Decide, es un modelo de decisión basado en codificador, postentrenado específicamente para la toma de decisiones estructurada: evalúa preguntas tipadas definidas por el usuario y puede decodificar respuestas relacionadas de forma conjunta bajo restricciones explícitas, devolviendo decisiones estructuradas con probabilidades, puntuaciones de confianza y metadatos de factibilidad. Se describe en el artículo GLiNER2 (arXiv:2507.18546).

Este repositorio en particular no entrena ni ajusta nada: los pesos upstream se convierten a la disposición de MLX sin reentrenamiento, siguiendo el trabajo gliner2-mlx de Andrew Chen Wang, y se empaquetan para la librería speech-swift. No se dispone, en la información proporcionada, de datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se emplearon técnicas de RLHF o DPO en el modelo original; esos datos corresponden a la model card upstream y no se detallan aquí.

## Capacidades

- Clasificación monoetiqueta: dada una lista de etiquetas, devuelve una probabilidad para cada una.
- Extracción de entidades (NER): devuelve los spans (menciones) del texto original correspondientes a las etiquetas indicadas.
- Decodificación conjunta bajo restricciones: puede resolver respuestas relacionadas y devolver metadatos de factibilidad de las restricciones.
- Salida con puntuaciones de confianza y distribuciones de probabilidad por etiqueta.
- No genera texto: es un extractor/decisor, no un modelo generativo.
- Soporte de esquemas de etiquetas definidos por el usuario en tiempo de inferencia.
- Capacidades multilingües: no disponibles; el modelo está entrenado y etiquetado únicamente para inglés (en).
- Tool calling / function calling: no disponible como tal; su salida estructurada puede usarse como entrada para lógica de enrutamiento externa.
- Capacidades de agente multi-paso: no aplica; es un componente de decisión de un solo paso, no un agente.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un esquema de categorías (por ejemplo `facturacion`, `tecnico`, `cuenta`, `otro`) y devuelve la probabilidad de cada una. Su ventana de 512 tokens cubre el esquema y el texto, y su latencia de 8,8 ms en Apple M5 Pro lo hace apto para enrutamiento en línea.
- Clasificación de intenciones en asistentes de voz: integrado mediante speech-swift, permite mapear una frase dictada ("Recuérdame llamar a papá a las seis") a una intención (`create_reminder`, `send_message`, `other`) antes de invocar la acción correspondiente.
- Extracción de entidades para normalización de datos: extrae spans de tipo `person`, `time`, `date`, etc.; los offsets vienen en UTF-16 y los valores se devuelven como texto para que el código de la aplicación los normalice.
- Guardarraíles y moderación de contenido: clasificación de mensajes entrantes frente a un esquema de riesgo o política, con puntuación de confianza para decidir si se bloquea, se revisa o se deja pasar.
- Enrutamiento en pipelines RAG: decidir qué índice, herramienta o submotor debe atender una consulta antes de llamar a un modelo generativo, reduciendo el consumo de tokens de modelos grandes.
- Etiquetado y triaje de correo o mensajes entrantes: clasificación por departamento, urgencia o tipo de solicitud, con salida determinista y bajo coste sobre CPU.
- Detección y marcado de PII: extracción de menciones de datos personales en un texto para su anonimización previa a otros procesamientos.
- Evaluación de respuestas: uso como juez ligero que puntúa si una respuesta cumple un conjunto de etiquetas predefinidas, sin recurrir a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card sí reporta mediciones operativas y una comprobación de fidelidad frente al modelo PyTorch upstream:

| Medicion | Valor |
|---|---|
| Fidelidad al modelo upstream (24 casos de referencia) | etiquetas, spans y offsets identicos; diferencia maxima de confianza 0,0012 (umbral 0,005) |
| Latencia de enrutamiento (16 casos, 6 etiquetas, mediana) | 8,8 ms |
| Latencia de extraccion (8 casos, 2 etiquetas, mediana) | 10,0 ms |
| Memoria pico del proceso | 1,58 GB |
| Hardware de medida | Apple M5 Pro, maquina en reposo, un proceso por variante, modelo cargado una vez |

Las mediciones incluyen la tokenizacion y son la mediana de llamadas completas tras cinco calentamientos.

## Requisitos de hardware

- VRAM estimada: los pesos FP16 ocupan 972,9 MB; la memoria pico de proceso medida es de 1,58 GB.
- GPU recomendadas: cualquier GPU capaz de ejecutar MLX o PyTorch; el modelo es lo bastante pequeno para GPUs de gama media. El modelo upstream en PyTorch puede ejecutarse en CUDA.
- Cabe en GPU de consumo: si; con menos de 2 GB de memoria dedicada es suficiente, e incluso puede ejecutarse en CPU.
- Apple Silicon: es el objetivo de esta conversion (MLX) y el hardware de referencia medido es un M5 Pro.
- Opciones de despliegue: esta variante esta pensada para MLX mediante speech-swift (modulo GLiNER y CLI `speech gliner`); el modelo upstream puede desplegarse con otras herramientas PyTorch. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: enrutamiento con mediana de 8,8 ms y extraccion con mediana de 10,0 ms (Apple M5 Pro), como se detalla en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aufklarer/GLiNER2.5-Decide-340M-MLX-fp16 (este) | 340M | 512 tokens | safetensors MLX, FP16 | Apache-2.0 | Conversion para Apple Silicon via MLX; sin reentrenamiento |
| fastino/GLiNER2.5-Decide (upstream) | 340M | 512 tokens | PyTorch | Apache-2.0 | Modelo original; misma arquitectura y parametros, distinto runtime |
| Alternativas de clasificacion/NER de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone en la información proporcionada de resultados de benchmarks que permitan comparar el rendimiento frente a otros modelos de clasificación o extracción de entidades de tamaño similar, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y etiquetado exclusivamente para el idioma inglés; no se garantiza su funcionamiento en otros idiomas.
- No genera texto: cualquier expectativa de respuesta conversacional o generativa queda fuera de su alcance.
- Las probabilidades son puntuaciones del modelo, no garantías; deben tratarse como señales, no como certezas.
- Riesgo de alucinación en el sentido de falsos positivos: las menciones extraídas son spans del texto, y valores como fechas u horas se devuelven como texto sin normalizar, por lo que el código de la aplicación debe validarlos y convertirlos.
- Los offsets de las entidades están expresados en UTF-16, lo que exige cuidado al integrarlos con lenguajes o librerías que usan otro índice de caracteres.
- Restricciones de licencia: los pesos son Apache-2.0, lo que permite uso comercial; el código de conversión de referencia (gliner2-mlx) es MIT. Debe conservarse la atribución correspondiente.
- Dependencia de plataforma: esta variante concreta está orientada a MLX y Apple Silicon; para otros entornos conviene partir del modelo upstream en PyTorch.
- Datos de entrenamiento del modelo original (tokens, composición del dataset, posibles sesgos, uso de RLHF/DPO) no disponibles en la información proporcionada; conviene consultar la model card upstream antes de un despliegue en producción.
- Cualquier decisión automatizada basada en las puntuaciones del modelo debería incorporar umbrales de confianza y revisión humana en casos de baja certidumbre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aufklarer/GLiNER2.5-Decide-340M-MLX-fp16
- Modelo upstream: https://huggingface.co/fastino/GLiNER2.5-Decide
- Articulo GLiNER2 (paper): https://arxiv.org/abs/2507.18546
- Codigo de conversion gliner2-mlx (Andrew Chen Wang): https://github.com/Andrew-Chen-Wang/gliner2-mlx
- speech-swift (libreria de inferencia en Apple Silicon): https://github.com/soniqo/speech-swift
- Blog de Fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- MarkTechPost: https://www.marktechpost.com/2026/09/24/fastino-releases-gliner2-5-decide-a-340m-open-weight-decision-model-that-runs-on-cpu/
- explainx.ai: https://www.explainx.ai/blog/gliner-2-5-decide-fastino-340m-open-weight-decision-model-2026
- deai.org: https://www.deai.org/news/fastino-gliner2-5-decide-open-weight-decision-model
- aifuture.org: https://aifuture.org/news/fastino-releases-gliner2-5-decide-a-340m-open-weight-decision-model-that-runs-on-14078
