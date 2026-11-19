# jramduran/review-sentiment-roberta-lora

## Resumen

`jramduran/review-sentiment-roberta-lora` es un adaptador LoRA entrenado sobre el modelo base `FacebookAI/roberta-base` para clasificación de sentimiento en reseñas de productos, con tres clases: negativo, neutral y positivo. Lo publica el usuario jramduran en Hugging Face y se distribuye como un adaptador PEFT en formato safetensors, no como un modelo completo. El repositorio ocupa 0.0 GB, lo que confirma que solo contiene los pesos del adaptador y no la totalidad de los pesos de RoBERTa-base.

El modelo resuelve una tarea acotada y bien definida: asignar una etiqueta de polaridad a un texto corto en inglés, típicamente una reseña de producto. Al apoyarse en RoBERTa-base, hereda una arquitectura transformer encoder con 125 millones de parámetros y una ventana de contexto de 512 tokens. El adaptador LoRA se ha entrenado con r=16, alpha=32 y módulos objetivo `query`, `value` y `key`, con una longitud máxima de 256 tokens y hasta 5 épocas con parada temprana.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de ajuste eficiente de parámetros (PEFT) aplicado a una tarea de clasificación de texto, útil para quien busque una referencia de cómo se estructura un adaptador LoRA para análisis de sentimiento o para reproducir el pipeline. No se trata de un modelo de propósito general ni compite con modelos generativos; su valor está en la tarea de clasificación y en el bajo coste de entrenamiento e inferencia que implica un adaptador sobre un encoder pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con adaptador LoRA |
| Parametros totales | 125 M en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en RoBERTa-base; entrenado con max length 256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | FacebookAI/roberta-base |
| Pipeline | text-classification |
| Etiquetas | negative / neutral / positive (3 clases) |
| Libreria | peft |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo base es RoBERTa-base, un transformer encoder de 125 millones de parámetros con 12 capas, 12 cabezas de atención y embeddings de 768 dimensiones, entrenado originalmente por Facebook AI con una versión optimizada del preentrenamiento de BERT (más datos, batches mayores, eliminación de la tarea NSP y enmascaramiento dinámico). Sobre esta base se añade un adaptador LoRA con rango r=16, alpha=32 y módulos objetivo `query`, `value` y `key`, lo que congela los pesos originales y entrena únicamente las matrices de baja dimensión inyectadas en las proyecciones de atención.

El entrenamiento del adaptador usa una tasa de aprendizaje de 5e-05, longitud máxima de secuencia de 256 tokens y hasta 5 épocas con parada temprana. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo técnicas de aumentación o balanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni ningún otro método de alineación, algo esperable en una tarea de clasificación supervisada. La innovación técnica es la aplicación de PEFT a un encoder pequeño, lo que reduce drásticamente el coste de ajuste frente a un fine-tuning completo.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutral, positivo) sobre reseñas de productos en inglés.
- Generación de etiquetas a partir de texto corto, con una longitud máxima de entrada de 256 tokens durante el entrenamiento.
- Inferencia ligera: al ser un adaptador sobre un encoder de 125 M de parámetros, el coste computacional es bajo.
- Integración con el ecosistema Hugging Face mediante `peft` y `transformers` (`AutoPeftModelForSequenceClassification`).
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de opiniones en tiendas online: clasificar automáticamente reseñas de productos en negativas, neutras o positivas para alimentar paneles de satisfacción del cliente. El modelo está entrenado específicamente para esta tarea y el adaptador es ligero.
- Moderación de comentarios: filtrar reseñas con polaridad negativa para revisión manual o para priorizar respuestas del servicio de atención al cliente.
- Enrutamiento de tickets de soporte: usar la etiqueta de sentimiento como señal adicional para dirigir quejas a un equipo especializado y comentarios neutros a un flujo estándar.
- Monitorización de reputación de marca: procesar lotes de reseñas en inglés y agregar la distribución de sentimiento por producto o por periodo temporal.
- Etiquetado de datos para entrenamiento: usar el modelo como preetiquetador de grandes volúmenes de reseñas y revisar manualmente solo los casos de baja confianza.
- Investigación en PEFT: servir como referencia reproducible de un adaptador LoRA para clasificación de texto, comparando hiperparámetros y resultados frente a un fine-tuning completo.
- Análisis de encuestas abiertas: clasificar respuestas cortas en inglés sobre satisfacción de producto o servicio, siempre que no superen los 256 tokens.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado:

| Metrica | Valor |
|---|---|
| Accuracy | 0.807 |
| F1 macro | 0.754 |
| Precision macro | 0.762 |
| Recall macro | 0.751 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni se detalla el dataset de evaluación, el tamaño del conjunto de test ni la distribución de clases.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 125 M de parámetros más un adaptador LoRA, la inferencia en fp32 requiere aproximadamente 0.5 GB de VRAM; en fp16 o bf16, alrededor de 0.25 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre.
- Opciones de despliegue: `transformers` con `peft`, `TextClassificationPipeline` de Hugging Face, y servidores de inferencia compatibles con modelos de clasificación. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| jramduran/review-sentiment-roberta-lora | 125 M (base) + LoRA | 512 (entrenado a 256) | Clasificación de sentimiento (3 clases) | no disponible | safetensors (PEFT) |
| FacebookAI/roberta-base | 125 M | 512 | Modelo base, requiere fine-tuning | MIT | safetensors, PyTorch |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 | Clasificación de sentimiento (3 clases) | no disponible | safetensors |
| distilbert-base-uncased-finetuned-sst-2-english | 66 M | 512 | Clasificación de sentimiento (2 clases) | Apache 2.0 | safetensors |

La comparativa se limita a modelos de la misma familia y tamaño, ya que no se dispone de benchmarks comparativos publicados para este adaptador frente a las alternativas. La principal diferencia frente a RoBERTa-base es que este adaptador ya está ajustado para la tarea, mientras que el modelo base requiere entrenamiento adicional. Frente a alternativas como el modelo de Cardiff NLP, la diferencia está en el dominio de entrenamiento (reseñas de productos frente a tuits) y en el número de clases.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre reseñas de productos en inglés, puede heredar sesgos de dominio, de género o culturales presentes en los datos de entrenamiento, que no se especifican.
- Riesgo de alucinación: bajo en sentido estricto, ya que es un clasificador y no genera texto libre; sin embargo, puede producir etiquetas erróneas con alta confianza en textos ambiguos, irónicos o fuera de dominio.
- Limitaciones de contexto: la longitud máxima de entrenamiento es de 256 tokens; entradas más largas se truncan y pueden perder información relevante para la clasificación.
- Limitaciones de idioma: solo inglés. El rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si el uso comercial está permitido. Es necesario contactar con el autor o revisar el repositorio antes de usarlo en producción.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de mantenimiento. El rendimiento de 0.807 de accuracy y 0.754 de F1 macro es moderado y depende del dataset de evaluación, que no se detalla.
- Al ser un adaptador PEFT, requiere cargar el modelo base `FacebookAI/roberta-base` por separado, lo que añade una dependencia adicional en el despliegue.
- No se documenta el proceso de balanceo de clases ni la distribución del dataset, lo que puede afectar al rendimiento en clases minoritarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/review-sentiment-roberta-lora
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Paper de LoRA: https://arxiv.org/abs/2106.09685
