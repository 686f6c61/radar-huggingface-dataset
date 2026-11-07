# grisselblanco/Clase_11_transformers

## Resumen

Clase_11_transformers es un modelo de clasificación de texto binaria publicado por el usuario grisselblanco en Hugging Face. Se trata de un BERT diminuto entrenado desde cero con fines exclusivamente pedagógicos en el marco del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). Su tarea es clasificar comentarios cortos sobre departamentos en dos categorías: `positivo` o `negativo`.

El modelo no pretende competir con clasificadores de producción: con 20.546 parámetros totales, 2 capas, 2 cabezas de atención y una dimensión oculta de 32, es un ejercicio didáctico que ilustra el ciclo completo de publicación de un modelo en el Hub (configuración, pesos, tokenizer y scripts de entrenamiento e inferencia). Utiliza un tokenizer a nivel de palabra (`WordLevel`) con un vocabulario de solo 37 tokens, lo que limita severamente su cobertura léxica.

Su relevancia es formativa: sirve como plantilla reproducible para quienes aprenden a entrenar, empaquetar y desplegar un modelo de Transformers con PyTorch, y como ejemplo explícito de los riesgos de sobreajuste y de confianza calibrada incorrectamente en modelos con datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), transformer encoder |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 2 capas, 2 cabezas de atención y dimensión oculta de 32, configurado para clasificación de secuencias con dos etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es de tipo `WordLevel` con 37 tokens, normaliza a minúsculas y elimina tildes. El modelo y el tokenizer se publican juntos, ya que los índices de vocabulario son específicos de este tokenizer y no son intercambiables con otros.

El entrenamiento se realizó desde cero (sin preentrenamiento previo) sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos). Se usaron 294 registros para entrenamiento y 74 para evaluación, con 15 épocas, lotes de 16, optimizador AdamW con tasa de aprendizaje 0,001 y pérdida de entropía cruzada. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar.

## Capacidades

- Clasificación binaria de texto corto en español: asigna la etiqueta `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante `pipeline("text-classification")` de Hugging Face Transformers (compatible con Transformers 4 y 5).
- Integración con Text Embeddings Inference y endpoints compatibles, según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Cobertura multilingüe: únicamente español, y limitada al vocabulario de 37 tokens.

## Casos de uso

- Demostración docente de publicación de modelos: el repositorio incluye `train.py`, `predict.py`, `requirements.txt` y la model card completa, lo que permite reproducir el flujo de entrenamiento y despliegue en un aula o taller.
- Práctica de inferencia con `pipeline`: sirve para que estudiantes comprueben cómo se carga un modelo local o remoto y cómo se interpreta la salida `{'label': ..., 'score': ...}`.
- Ejemplo de análisis de sobreajuste: el accuracy de 1,000 sobre test con solo 74 ejemplos y plantillas compartidas con entrenamiento es un caso práctico para explicar la diferencia entre rendimiento aparente y generalización.
- Ilustración del problema `[UNK]`: permite demostrar cómo un tokenizer de vocabulario reducido convierte palabras desconocidas en tokens especiales y cómo el modelo responde con alta confianza ante entradas fuera de distribución.
- Base para un ejercicio de fine-tuning: el propio autor recomienda partir de un modelo preentrenado en español y ajustarlo con comentarios reales; este modelo puede usarse como punto de comparación antes y después del fine-tuning.
- Prueba de integración de endpoints compatibles: los tags `text-embeddings-inference` y `endpoints_compatible` permiten experimentar con el despliegue del modelo en infraestructura de inferencia estándar.
- Ejemplo mínimo de clasificación binaria para comparar arquitecturas: útil en asignaturas de machine learning para contrastar un BERT de 20.546 parámetros con modelos preentrenados de mayor tamaño en la misma tarea.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios de test sintéticos |

El autor advierte explícitamente que este resultado es optimista: los comentarios de test emplean las mismas plantillas y adjetivos que los de entrenamiento, por lo que no refleja capacidad de generalización. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 20.546 parámetros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, `pipeline` de Transformers, Text Embeddings Inference y endpoints compatibles según los tags del repositorio. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grisselblanco/Clase_11_transformers | 20.546 | no disponible | Clasificación binaria de texto (es) | MIT | Hugging Face |
| BERT-base multilingüe (referencia) | ~178 M | 512 tokens | Clasificación y representaciones | Apache 2.0 | Hugging Face |
| BETO (BERT español) | ~110 M | 512 tokens | Clasificación y representaciones en español | Apache 2.0 | Hugging Face |

La comparación es orientativa: los modelos preentrenados citados tienen tres o cuatro órdenes de magnitud más parámetros y están diseñados para fine-tuning sobre datos reales, mientras que Clase_11_transformers es un ejemplo didáctico entrenado desde cero con datos sintéticos. No se dispone de benchmarks comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no está pensado para uso en producción.
- Vocabulario de solo 37 palabras: cualquier término fuera de él se convierte en `[UNK]`, y el modelo responde igualmente con alta confianza (el autor documenta el caso de "tiene una vista increíble", clasificado como `negativo` con score 1,00).
- No entiende negaciones ("no es luminoso") ni ironía, ya que las frases de entrenamiento no las contienen.
- El accuracy de 1,000 es optimista: el conjunto de test comparte plantillas y adjetivos con el de entrenamiento.
- Riesgo elevado de alucinación en el sentido de clasificaciones erróneas con confianza alta ante entradas fuera de distribución.
- Sesgos: el dataset sintético está construido con 8 adjetivos positivos y 8 negativos sobre departamentos, lo que puede inducir asociaciones espurias.
- Licencia MIT: permite uso comercial, pero el autor desaconseja su uso real y recomienda fine-tuning de un modelo preentrenado en español con comentarios reales.
- El modelo debe usarse siempre junto a su tokenizer original; los índices de vocabulario no son compatibles con otros tokenizers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/Clase_11_transformers
- Repositorio relacionado del mismo autor: https://huggingface.co/grisselblanco/04-transformers-clasificacion-texto/tree/main
