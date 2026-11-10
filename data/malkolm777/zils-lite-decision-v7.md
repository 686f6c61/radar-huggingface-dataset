# malkolm777/zils-lite-decision-v7

## Resumen

zils-lite-decision-v7 es un modelo de decisión de tipo "d3-lite" desarrollado por el usuario malkolm777, derivado mediante fine-tuning LoRA del modelo base qhoenix/zils-lite-decision-v9, que a su vez pertenece a la familia Qwen/Qwen3.5-0.8B. Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se enmarca en la categoría de modelos ligeros orientados a tareas de extracción de características y toma de decisiones dentro del ecosistema Zils (subnet 127, pool lite). El modelo está publicado bajo licencia Apache-2.0 y utiliza la librería transformers con pesos en formato safetensors.

El modelo resuelve el problema de proporcionar un cuerpo de decisión ligero y especializado para el formato de decisión propietario de Zils, entrenado sobre conjuntos de datos públicos de razonamiento y lenguaje (MMLU, BoolQ, GSM8K, ANLI, GLUE RTE/STSB) convertidos a dicho formato, además de exámenes semilla públicos de Zils v1/v4. Su relevancia radica en ser un componente especializado dentro de un pipeline de decisión, no un modelo de propósito general, y en su reducido tamaño que permite despliegue en hardware modesto.

La información pública disponible es muy limitada: el repositorio no registra descargas ni likes, no declara idiomas soportados y la model card es escueta. Esto condiciona la profundidad de esta ficha, en la que varios apartados quedan marcados como "no disponible" por ausencia de datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B, cuerpo de decisión d3-lite) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo se construye sobre un cuerpo transformer de la familia Qwen/Qwen3.5-0.8B, adaptado como "cuerpo de decisión" d3-lite para el pool lite de la subnet 127 de Zils. El fine-tuning se realizó mediante LoRA con rango 16 y optimizador AdamW con tasa de aprendizaje 2e-5, partiendo del modelo qhoenix/zils-lite-decision-v9 (Apache-2.0). El delta de fine-tuning se escala por un factor de 1.5, un detalle técnico que modula la magnitud de la actualización respecto al modelo base.

Los datos de entrenamiento provienen de las particiones de entrenamiento de conjuntos públicos de razonamiento y lenguaje: cais/mmlu (auxiliary_train), google/boolq, openai/gsm8k, facebook/anli y nyu-mll/glue (RTE y STSB), todos ellos convertidos al formato de decisión propietario de Zils, más los exámenes semilla públicos de Zils v1 y v4. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El repositorio incluye archivos LICENSE y NOTICE, y requiere código personalizado (custom_code) para su carga en transformers.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado oficialmente para el modelo.
- Toma de decisiones en el formato Zils: el modelo está especializado en producir decisiones estructuradas según el formato propietario de Zils, no en generación de texto libre.
- Razonamiento y conocimiento factual: entrenado sobre MMLU, lo que sugiere capacidad de responder preguntas de conocimiento general en formato de decisión.
- Razonamiento matemático elemental: incluye GSM8K en el entrenamiento, orientado a problemas aritméticos de varios pasos.
- Comprensión lectora e inferencia: BoolQ y ANLI aportan entrenamiento en preguntas de sí/no y en inferencia de lenguaje natural.
- Similitud semántica y reconocimiento textual: GLUE STSB y RTE cubren similitud de frases e implicación textual.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación y decisión en pipelines Zils: el modelo se integraría como cuerpo de decisión dentro del pool lite de la subnet 127, recibiendo entradas en el formato Zils y emitiendo decisiones estructuradas; su tamaño de 0,85 mil millones de parámetros permite ejecutarlo en paralelo con otros componentes sin agotar la VRAM.
- Filtrado y enrutamiento de consultas: al estar entrenado en BoolQ y ANLI, puede emplearse para decidir si una consulta debe dirigirse a un módulo de razonamiento, a un módulo de recuperación o a un humano, con baja latencia por su reducido tamaño.
- Evaluación automática de respuestas de razonamiento: entrenado sobre MMLU y GSM8K en formato de decisión, puede puntuar o clasificar respuestas candidatas de otros modelos en pipelines de evaluación o de selección de mejores respuestas (best-of-n).
- Detección de implicación y similitud textual: los datos de GLUE RTE y STSB lo hacen adecuado para tareas de deduplicación de textos, verificación de afirmaciones o agrupación semántica de documentos en procesos de ingesta de datos.
- Extracción de características para sistemas de recuperación: dado su pipeline feature-extraction, puede generar representaciones vectoriales para búsqueda semántica o clustering sobre corpus de documentación técnica, aprovechando su bajo coste computacional.
- Prototipado e investigación sobre el formato Zils: sirve como punto de partida para experimentar con fine-tuning LoRA adicional (como demuestra su propio origen) y para estudiar el comportamiento de cuerpos de decisión ligeros en entornos de investigación con recursos limitados.
- Despliegue en entornos con GPU de consumo: su tamaño permite ejecutarlo en tarjetas de gama media para tareas de clasificación por lotes, como el etiquetado masivo de conjuntos de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) el modelo requiere aproximadamente 3,4 GB solo para los pesos (852.985.920 parámetros × 4 bytes); en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no incluyen memoria para activaciones ni contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 6 GB o más de VRAM en fp16, y en 4 GB o menos con cuantización.
- Opciones de despliegue: la librería declarada es transformers, y el modelo requiere custom_code, por lo que la carga debe hacerse con trust_remote_code habilitado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que no se publican pesos GGUF, llama.cpp y Ollama no son opciones directas sin conversión previa.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| malkolm777/zils-lite-decision-v7 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning LoRA de un cuerpo de decisión Zils |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face (modelo base) | Cuerpo de decisión d3-lite del que deriva v7 |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones (familia) | no disponible | no disponible en esta ficha | Hugging Face (familia base) | Modelo de propósito general sobre el que se construye la familia d3-lite |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado, no de propósito general: está diseñado para el formato de decisión de Zils; su uso fuera de ese formato producirá resultados poco fiables.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su calidad objetivamente; cualquier uso en producción requiere una evaluación propia previa.
- Idiomas no declarados: se desconoce qué idiomas cubre el entrenamiento, lo que impide garantizar un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: al derivar de un modelo de 0,85 mil millones de parámetros, la fiabilidad factual es limitada, especialmente en tareas de conocimiento abierto.
- Contexto desconocido: no se documenta la longitud de contexto, por lo que no se puede garantizar el manejo de entradas largas.
- Requiere custom_code: la carga exige trust_remote_code, lo que implica ejecutar código del autor del modelo; conviene auditar dicho código antes de desplegarlo en producción.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los archivos LICENSE y NOTICE del repositorio, que pueden contener atribuciones adicionales del modelo base.
- Trazabilidad limitada: con 0 descargas y 0 likes, no hay evidencia de uso en la comunidad ni de validación independiente.
- Fecha de creación futura en los metadatos: el repositorio figura creado el 2026-11-09, lo que conviene verificar antes de tomar decisiones de dependencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-decision-v7
- Modelo base: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Familia base Qwen3.5 (referencia): https://huggingface.co/Qwen
- Dataset cais/mmlu: https://huggingface.co/datasets/cais/mmlu
- Dataset google/boolq: https://huggingface.co/datasets/google/boolq
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset facebook/anli: https://huggingface.co/datasets/facebook/anli
- Dataset nyu-mll/glue: https://huggingface.co/datasets/nyu-mll/glue
