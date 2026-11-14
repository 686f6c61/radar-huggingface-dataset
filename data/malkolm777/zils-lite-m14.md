# malkolm777/zils-lite-m14

## Resumen

zils-lite-m14 es un modelo de decisión de aproximadamente 853 millones de parámetros desarrollado por el usuario malkolm777 para el pool "lite" de la subnet 127 de Zils. Se construye como un fine-tuning del modelo base vllm-sr/d3-lite, que pertenece a la familia Qwen3.5-0.8B, y su propósito no es la generación de texto libre sino la extracción de características y la clasificación de decisiones en formato estructurado (decision-model). El modelo se distribuye bajo licencia Apache-2.0 y con pesos en safetensors, listo para su uso con la librería transformers.

El proceso de creación parte de un "house body" denominado Matilda-Decision-v1-Edge, destilado a su vez de la media uniforme de dos modelos públicos del mismo pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). Sobre esa base se aplicó una pasada de LoRA de rango 64 con AdamW, learning rate 5e-5, una época y semilla 553, sobre unas 25.000 filas de datos públicos adaptados al formato de decisión del pool, incluyendo los exámenes semilla públicos Zils v1, v2 y v4.

La relevancia de este modelo es acotada y muy específica: sirve como componente de decisión ligero dentro de un ecosistema concreto (Zils subnet 127), no como un LLM de propósito general. No se han publicado detalles sobre idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, según model card); requiere `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en vllm-sr/d3-lite, descrito en la model card como un "d3-lite decision body" de la familia Qwen/Qwen3.5-0.8B. Se trata, por tanto, de un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, adaptado mediante fine-tuning supervisado para tareas de decisión y extracción de características (pipeline `feature-extraction`). El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones remotas o revisar el código incluido.

El entrenamiento parte de Matilda-Decision-v1-Edge, un cuerpo destilado de la media uniforme de dos modelos públicos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). Sobre esa base se aplicó una única pasada de LoRA (rango 64, AdamW, lr 5e-5, 1 época, semilla 553) con aproximadamente 25.000 filas. Los datos combinan filas de datasets públicos en el formato de decisión del pool (mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench) con ítems estilo examen generados y verificados por un LLM a partir de los splits de entrenamiento. Los objetivos son suaves: 0,5 × la distribución de respuestas del profesor + 0,5 × la etiqueta gold. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada: el modelo está diseñado para emitir decisiones en el formato del pool Zils, no para generación abierta de texto.
- Extracción de características: pipeline declarado `feature-extraction`, apto para obtener representaciones vectoriales.
- Razonamiento sobre ítems tipo examen: entrenado con datos de MMLU, GSM8K, ANLI, commonsense_qa, SVAMP y tareas de BIG-bench.
- Comprensión de lenguaje natural en tareas de clasificación: BoolQ, GLUE, banking77, clinc150, 20newsgroups, tweet_eval.
- Detección de intención de llamada a herramientas: incluye datos de When2Call y glaive function calling.
- Análisis de sentimiento y sarcasmo: poem_sentiment, iSarcasm y titulares de sarcasmo.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de decisiones dentro de la subnet Zils 127: el modelo actúa como cuerpo de decisión ligero que clasifica ítems en el formato del pool, integrándose en el pipeline de la subred para tareas de evaluación y consenso.
- Clasificación de intención en asistentes conversacionales: entrenado con banking77 y clinc150, puede etiquetar la intención del usuario en dominios bancarios y de atención al cliente con un coste de inferencia muy bajo (0,85B parámetros).
- Detección de cuándo invocar una herramienta: los datos de When2Call y glaive function calling permiten usarlo como clasificador previo que decide si una consulta requiere llamada a función antes de derivarla a un modelo mayor.
- Filtrado de contenido y moderación: los datos de tweet_eval, iSarcasm y titulares de sarcasmo lo hacen adecuado para tareas de clasificación de tono y sarcasmo en textos cortos.
- Evaluación automática de exámenes: al haberse entrenado con exámenes semilla Zils v1/v2/v4 y datos de MMLU y GSM8K, puede puntuar respuestas de opción múltiple en pipelines de evaluación de modelos.
- Extracción de embeddings para búsqueda semántica: con pipeline `feature-extraction`, sirve para generar representaciones de documentos en sistemas de recuperación con requisitos de memoria reducidos.
- Prototipado en hardware modesto: su tamaño permite desplegarlo en una sola GPU consumer para experimentos de investigación sobre modelos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16/bf16 (pesos de 853M parámetros); alrededor de 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con overhead de activaciones; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 6 GB en adelante).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM y TGI son compatibles en principio con la arquitectura Qwen3.5, pero no se confirma en la información disponible. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-m14 | 853M | no disponible | Apache-2.0 | Decision-model / feature-extraction | Hugging Face |
| vllm-sr/d3-lite (base) | no disponible | no disponible | no disponible | Decision body | Hugging Face |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Decision body del pool | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Decision body del pool | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: diseñado exclusivamente para el pool de decisión de la subnet Zils 127; su uso fuera de ese ecosistema no está validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Riesgo de alucinación: aunque orientado a clasificación, un modelo de 0,85B puede producir etiquetas incorrectas en dominios alejados de los datos de entrenamiento.
- Idiomas no especificados: se desconoce si el modelo mantiene capacidades multilingües más allá del inglés presente en los datasets de entrenamiento.
- `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Datos de entrenamiento generados por LLM: parte de los ítems fueron "autorados y verificados por un LLM", lo que puede introducir errores sistemáticos en las etiquetas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base vllm-sr/d3-lite no documenta su licencia en la información disponible, por lo que conviene verificar la cadena de licencias.
- Sin cuantizaciones oficiales: no se ofrecen pesos GGUF ni AWQ/GPTQ, lo que limita el despliegue en entornos con restricciones de memoria.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-m14
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo fuente del pool: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Modelo fuente del pool: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Familia Qwen3.5 (referencia de arquitectura): https://huggingface.co/Qwen
