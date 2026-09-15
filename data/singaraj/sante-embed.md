# Singaraj/sante-embed

## Resumen

sante-embed es un modelo de embeddings de texto desarrollado por Singaraj, diseñado específicamente para la recuperación de información médica en nueve idiomas: inglés, chino, árabe, español, francés, coreano, polaco, ruso y vietnamita. Se basa en el modelo Alibaba-NLP/gte-Qwen2-1.5B-instruct, al que se le ha aplicado un ajuste fino con conjuntos de datos médicos y multilingües de recuperación. El modelo genera representaciones vectoriales de 1536 dimensiones y utiliza pooling de último token con normalización L2, de modo que la similitud entre consultas y documentos se calcula mediante coseno. Con aproximadamente 1.500 millones de parámetros y una ventana de contexto de 512 tokens, está pensado para tareas de búsqueda semántica, recuperación y agrupamiento en el ámbito médico, donde la precisión multilingüe es crítica. Su licencia Apache 2.0 y su formato safetensors facilitan su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2-1.5B) adaptado para embeddings |
| Parametros totales | 1.543.268.864 (aprox. 1.500 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino, árabe, español, francés, coreano, polaco, ruso, vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

sante-embed es un modelo denso basado en el transformer decoder-only de Qwen2-1.5B, adaptado para la tarea de extracción de características. El ajuste fino se realizó sobre el modelo Alibaba-NLP/gte-Qwen2-1.5B-instruct, que ya había sido entrenado para embeddings con instrucciones. Los datos de entrenamiento incluyen los subconjuntos médicos y multilingües de recuperación de codefuse-ai/F2LLM-v2, pares de preguntas y respuestas frecuentes del dataset clips/mqa en los nueve idiomas, y las particiones de entrenamiento de mteb/nfcorpus y mteb/scifact. El modelo emplea pooling de último token, normalización L2 y similitud coseno. Las consultas deben ir precedidas de un prefijo de instrucción con el formato `Instruct: {task_description}\nQuery: {query}`, mientras que los documentos se codifican sin prefijo. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de embeddings de texto para recuperación médica, con dimensión de salida de 1536.
- Soporte de consultas con prefijo de instrucción, lo que permite adaptar la búsqueda al dominio o tarea.
- Multilingüe en nueve idiomas: inglés, chino, árabe, español, francés, coreano, polaco, ruso y vietnamita.
- Normalización L2 y similitud coseno para comparación de vectores.
- Truncamiento automático de entradas de más de 512 tokens.
- No se describe soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo de extracción de características.
- Compatible con sentence-transformers y Transformers, con `trust_remote_code=True`.

## Casos de uso

- Recuperación de literatura médica: el modelo puede indexar artículos científicos y localizar pasajes relevantes para una consulta clínica, gracias a su entrenamiento con datos de recuperación médica.
- RAG en sistemas de salud: sirve como componente de recuperación en pipelines de generación aumentada, donde las respuestas se generan a partir de fragmentos de documentos médicos seleccionados por similitud.
- Búsqueda en historiales clínicos: permite buscar información en notas clínicas y expedientes electrónicos, facilitando el acceso rápido a datos relevantes para el personal sanitario.
- FAQ médica multilingüe: puede emparejar preguntas frecuentes de pacientes con respuestas predefinidas en varios idiomas, reduciendo la necesidad de intervención humana.
- Clustering de documentos médicos: agrupa informes, artículos o registros por tema o patología, lo que resulta útil para análisis de cohortes o revisiones sistemáticas.
- Filtrado y deduplicación de contenido: identifica documentos duplicados o similares en repositorios médicos, mejorando la gestión de bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, aproximadamente 6 GB; en FP16, aproximadamente 3 GB. Estas cifras son orientativas, ya que no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10G) es suficiente para ejecutar el modelo en FP16. Para entornos de producción, pueden utilizarse GPUs de la serie A100 o H100 si se requiere alto throughput, aunque no son imprescindibles.
- Puede ejecutarse en CPU, aunque la latencia será mayor.
- Opciones de despliegue: sentence-transformers, Transformers, y Text Embeddings Inference (TEI). El repositorio es compatible con `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos verificados en la información proporcionada. El modelo base es Alibaba-NLP/gte-Qwen2-1.5B-instruct, sobre el que se ha realizado el ajuste fino.

## Limitaciones y advertencias

- No es una herramienta de soporte clínico: el autor indica explícitamente que sus salidas no deben utilizarse para guiar la atención al paciente.
- Ventana de contexto limitada a 512 tokens; las entradas más largas se truncan, lo que puede perder información relevante.
- Los datos de entrenamiento pueden contener sesgos inherentes a las fuentes médicas, que podrían reflejarse en los embeddings.
- No se han publicado benchmarks, por lo que el rendimiento real no está validado externamente.
- Requiere `trust_remote_code=True` al cargar el modelo, lo que implica ejecutar código personalizado del repositorio.
- No soporta generación de texto ni tool calling; es únicamente un modelo de extracción de características.
- La licencia Apache 2.0 permite uso comercial, pero exige incluir la atribución correspondiente.

## Enlaces

- HuggingFace: https://huggingface.co/Singaraj/sante-embed
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct
- Paper base: https://arxiv.org/abs/2308.03281
- Dataset F2LLM-v2: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Dataset MQA: https://huggingface.co/datasets/clips/mqa
- Dataset NFCorpus: https://huggingface.co/datasets/mteb/nfcorpus
- Dataset SciFact: https://huggingface.co/datasets/mteb/scifact
