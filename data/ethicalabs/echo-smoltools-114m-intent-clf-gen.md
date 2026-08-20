# ethicalabs/Echo-SmolTools-114M-Intent-CLF-Gen

## Resumen

Echo-SmolTools-114M-Intent-CLF-Gen es un modelo de clasificación de intenciones generativa desarrollado por ethicalabs, basado en la arquitectura recurrente híbrida Echo-DSRN. Con 114 millones de parámetros, combina el modelo base `Echo-DSRN-114M-v0.1.2` con un adaptador LoRA (`Echo-SmolTools-114M-Intent-PEFT`) entrenado sobre el dataset Amazon MASSIVE, cubriendo 60 intenciones en 51 idiomas. A diferencia de los clasificadores convencionales con cabeza lineal, este modelo emplea un método de puntuación generativa restringida: para cada etiqueta candidata suma la log-probabilidad de sus tokens y selecciona la de mayor puntuación. Está orientado a tareas estrechas de enrutamiento de intenciones en entornos con recursos limitados, aunque es un modelo experimental y no debe usarse en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EchoForGenerativeClassification (híbrida recurrente Echo-DSRN) |
| Parametros totales | 114.656.768 (114M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (dtype nativo: bfloat16) |
| Idiomas soportados | 51 idiomas (locales de Amazon MASSIVE, según model card) |
| Licencia | Apache 2.0 (indicado en model card; metadata de HuggingFace sin especificar) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Echo-DSRN, una arquitectura recurrente híbrida diseñada para despliegue con recursos limitados en tareas bien definidas como enrutamiento de intenciones, NER o clasificación semántica. El adaptador LoRA fue entrenado sobre el modelo base `Echo-DSRN-114M-v0.1.2` sin añadir ninguna cabeza lineal adicional; en su lugar, el conocimiento generativo del adaptador se utiliza directamente mediante un mecanismo de puntuación de siguiente token restringido: para cada etiqueta candidata se suman las log-probabilidades de sus tokens y se elige la etiqueta con mayor puntuación total. El entrenamiento se realizó sobre el dataset Amazon MASSIVE, que abarca 60 intenciones en 51 locales lingüísticos. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de intenciones en 60 clases predefinidas del dataset Amazon MASSIVE.
- Clasificación generativa sin cabeza lineal, mediante scoring de tokens restringido.
- Soporte multilingüe en 51 idiomas (locales de MASSIVE).
- Clasificación zero-shot (según tags del repositorio).
- Arquitectura ligera (114M parámetros) adecuada para entornos con recursos limitados.
- Requiere `trust_remote_code=True` para cargar el código personalizado de la arquitectura.

## Casos de uso

- Enrutamiento de intenciones en asistentes virtuales multilingües: el modelo puede clasificar la intención del usuario en una de las 60 categorías de MASSIVE, lo que permite dirigir la conversación al módulo adecuado en sistemas de diálogo.
- Análisis de consultas de soporte técnico en múltiples idiomas: dado su soporte de 51 locales, puede preclasificar tickets de soporte antes de su enrutamiento a agentes especializados.
- Evaluación académica de arquitecturas recurrentes híbridas: sirve como banco de pruebas para comparar el enfoque de clasificación generativa frente a clasificadores con cabeza lineal en tareas de intención.
- Prototipado de sistemas de diálogo en entornos embebidos: su tamaño reducido permite ejecutarlo en hardware modesto (CPU, GPU de gama baja) para pruebas de concepto.
- Investigación en clasificación multilingüe de intenciones: al estar entrenado sobre MASSIVE, es útil para estudiar transferencia entre idiomas en tareas de intent detection.
- Benchmarking de técnicas de scoring generativo restringido: el método de sumar log-probabilidades de tokens puede compararse con otras estrategias de clasificación generativa en términos de precisión y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3 GB en bfloat16 (114M parámetros × 2 bytes + overhead), por lo que cabe en cualquier GPU consumer moderna y también en CPU.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso CPU (inferencia lenta pero viable).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; no se menciona compatibilidad con vLLM, llama.cpp u Ollama debido a la arquitectura personalizada.
- Latencia y throughput: no se han publicado datos; al ser un modelo de 114M, la inferencia en GPU es de pocos milisegundos por muestra, pero depende del hardware y del número de etiquetas candidatas.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la misma categoría (clasificadores de intención multilingües de ~100M parámetros con arquitectura recurrente híbrida). Alternativas genéricas como `bert-base-multilingual-cased` (178M) o `distilbert-base-multilingual-cased` (135M) tienen arquitecturas transformer y no emplean clasificación generativa, pero no hay datos de rendimiento directos para comparar.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte explícitamente que no debe desplegarse en entornos comerciales, empresariales o de misión crítica.
- Sin garantías: se proporciona "tal cual", sin responsabilidad por fallos de integración o incumplimiento normativo.
- Licencia: aunque la model card muestra un badge Apache 2.0, la metadata de HuggingFace no especifica licencia; se recomienda verificar antes de cualquier uso.
- Riesgo de sesgos: entrenado sobre Amazon MASSIVE, que puede reflejar sesgos culturales o lingüísticos de los datos originales.
- Alucinación: al ser un modelo generativo, puede producir puntuaciones inconsistentes para etiquetas fuera del vocabulario de MASSIVE.
- Limitación de clases: solo 60 intenciones predefinidas; no es adecuado para taxonomías personalizadas sin reentrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; riesgo de seguridad si no se audita el código.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ethicalabs/Echo-SmolTools-114M-Intent-CLF-Gen
- Modelo base: https://huggingface.co/ethicalabs/Echo-DSRN-114M-v0.1.2
- Adaptador PEFT: https://huggingface.co/ethicalabs/Echo-SmolTools-114M-Intent-PEFT
- Repositorio GitHub: https://github.com/ethicalabs-ai/Echo-DSRN/
- Working paper: https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md
- Ejemplo de clasificación: https://raw.githubusercontent.com/ethicalabs-ai/Echo-DSRN/refs/heads/main/examples/classify_dsrn_gen.py
