# malkolm777/zils-lite-j14

## Resumen

zils-lite-j14 es un modelo de decisión (decision model) publicado por el usuario malkolm777 en Hugging Face, derivado del modelo base vllm-sr/d3-lite, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B. Con 852.985.920 parámetros, está diseñado específicamente para tareas de clasificación y decisión estructurada dentro del ecosistema Zils (subnet 127, pool lite soup), no como un modelo generativo de propósito general.

El modelo se ha obtenido mediante destilación con un único pase de LoRA (rango 64, AdamW con lr 5e-5, 1 época, semilla 553) sobre aproximadamente 25.000 filas, partiendo del cuerpo base zils-ai/jiwo-0.8b-full. Los datos de entrenamiento combinan ítems de decisión estilo examen generados y verificados por un LLM a partir de conjuntos públicos (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, SVAMP, CommonsenseQA, entre otros) con filas de esos mismos conjuntos en el formato de decisión del pool.

Su relevancia es acotada pero concreta: sirve como componente de decisión ligero y de bajo coste computacional para pipelines de agentes y sistemas de enrutamiento, con licencia Apache-2.0 y pesos en safetensors compatibles con transformers. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks ni especificaciones detalladas de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, según model card); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del cuerpo base zils-ai/jiwo-0.8b-full, que según la model card pertenece a la familia Qwen/Qwen3.5-0.8B, y se afina con un único pase de LoRA de rango 64 (AdamW, lr 5e-5, 1 época, semilla 553) sobre unas 25.000 filas. El resultado se publica como un modelo de decisión con pipeline `feature-extraction` y código personalizado (`custom_code`), lo que implica que requiere cargar código del repositorio para su uso con transformers.

Los datos de entrenamiento son ítems de decisión estilo examen, autorados y verificados por un LLM a partir de filas de split de entrenamiento de conjuntos públicos: MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups, Glaive function calling y tareas de BIG-bench. Los objetivos son suaves: 0,5 × la distribución de respuestas del profesor + 0,5 × la etiqueta gold, cuando se nombra un profesor. La innovación técnica destacable es precisamente este esquema de destilación con objetivos suaves sobre un pool de modelos lite, más que cambios arquitectónicos.

## Capacidades

- Clasificación y decisión estructurada: el modelo está entrenado para emitir decisiones sobre ítems tipo examen y filas de datasets en el formato del pool Zils.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede usarse para obtener representaciones.
- Razonamiento sobre opciones múltiples: los datos de entrenamiento incluyen MMLU, CommonsenseQA, ANLI y BIG-bench, lo que sugiere capacidad de seleccionar entre alternativas.
- Razonamiento aritmético básico: presencia de GSM8K y SVAMP en el corpus de entrenamiento.
- Clasificación de intenciones y tópicos: Banking77, CLINC150, 20Newsgroups y TweetEval en el entrenamiento.
- Tool calling / function calling: el corpus incluye Glaive function calling, lo que indica exposición a decisiones de invocación de funciones, aunque no se documenta soporte formal de tool calling.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de consultas en pipelines de agentes: el modelo puede clasificar una consulta entrante en una de un conjunto predefinido de categorías (intención, tópico o herramienta), aprovechando su entrenamiento con Banking77, CLINC150 y Glaive function calling.
- Filtro de decisión previo a un LLM mayor: dado su tamaño de 0,85B parámetros, puede actuar como primera etapa que descarta o etiqueta casos triviales antes de invocar un modelo generativo más costoso.
- Clasificación de sentimiento y sarcasmo en redes sociales: el corpus incluye poem_sentiment, iSarcasm, titulares de sarcasmo y TweetEval, lo que lo hace adecuado para tareas de moderación o análisis de opinión acotadas.
- Selección de respuesta en sistemas de QA: su exposición a MMLU, CommonsenseQA y ANLI permite usarlo como reranker o selector entre respuestas candidatas generadas por otro modelo.
- Verificación de coherencia lógica (NLI): con ANLI en el entrenamiento, puede emplearse para decidir si una premisa implica, contradice o es neutral respecto a una hipótesis en pipelines de validación factual.
- Extracción de características para clustering o búsqueda semántica: al declarar `feature-extraction`, puede generar embeddings para agrupar documentos o alimentar un índice vectorial en dominios similares a los del entrenamiento.
- Evaluación automática de exámenes o ítems de benchmark: su formato de decisión estilo examen lo hace utilizable como evaluador ligero de respuestas de otros modelos en tareas de opción múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones teóricas a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar los pesos en fp16, aunque no se han publicado requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, siempre según estimación por tamaño.
- Opciones de despliegue: transformers es la librería declarada; al requerir `custom_code`, es necesario confiar en el código del repositorio (`trust_remote_code=True`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| malkolm777/zils-lite-j14 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Modelo de decisión derivado de d3-lite |
| vllm-sr/d3-lite | No disponible | No disponible | No disponible | Hugging Face (modelo base) | Base directa del modelo |
| zils-ai/jiwo-0.8b-full | No disponible | No disponible | No disponible | Hugging Face (cuerpo base citado) | Cuerpo base del que parte la destilación |
| VadymPikulyk/zils-lite-dh2 | No disponible | No disponible | Apache-2.0 | Hugging Face (fuente del promedio) | Uno de los dos cuerpos lite promediados |
| qhoenix/zils-lite-decision-avg-abc | No disponible | No disponible | Apache-2.0 | Hugging Face (fuente del promedio) | Segundo cuerpo lite promediado |

No se dispone de datos de rendimiento comparativo entre estas alternativas; la comparación se limita a linaje y licencia.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para el pool de decisión Zils y no como un LLM generativo de propósito general; su uso fuera de ese formato puede degradar el rendimiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta justificar su adopción en producción.
- Cero adopción registrada: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Requiere código personalizado: el tag `custom_code` implica ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad y de mantenimiento.
- Idiomas y contexto no documentados: se desconoce la longitud de contexto efectiva y la cobertura lingüística, lo que impide garantizar su comportamiento en castellano o en contextos largos.
- Riesgo de alucinación y sesgo: al estar entrenado sobre datasets públicos con objetivos suaves destilados, puede heredar sesgos de esos corpus y de los profesores utilizados; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a LICENSE y NOTICE para condiciones adicionales que no se detallan en la información disponible.
- Fecha de creación futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-j14
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo base citado: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Fuente del promedio (1): https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Fuente del promedio (2): https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
