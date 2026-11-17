# GetulioCO/bertimbau-ptbr-review-classifier

## Resumen

BERTimbau PT-BR Customer Review Classifier es un modelo de clasificación de sentimiento en portugués de Brasil, obtenido mediante fine-tuning de `neuralmind/bert-base-portuguese-cased` sobre una muestra del corpus de reseñas de comercio electrónico `ruanchaves/b2w-reviews01`. Lo desarrolla el usuario GetulioCO y clasifica cada reseña en tres categorías: `Negativo`, `Neutro` y `Positivo`. Resuelve un problema acotado y muy común en analítica de opinión: convertir texto libre de clientes en una etiqueta discreta con un coste de inferencia bajo.

Se trata de un encoder BERT base (arquitectura transformer bidireccional, 108.925.443 parámetros) con vocabulario y tokenizador en portugués, publicado con pesos en `safetensors` y una exportación `onnx`. Su relevancia es práctica: con 0,9 GB de repositorio y un modelo de 108 M de parámetros, puede ejecutarse en CPU o en GPU de consumo, lo que lo hace apto para pipelines de análisis de reseñas a escala sin depender de APIs externas.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No hay paper asociado ni documentación adicional sobre el proceso de entrenamiento más allá de los hiperparámetros declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (bidireccional, cased) |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `max_length=160`; límite arquitectónico de BERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible (el repo incluye `safetensors` y `onnx`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Portugués (`pt`), con foco en portugués de Brasil |
| Licencia | MIT |
| Formato de pesos | `safetensors` y `onnx` |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (12 capas, atención multi-cabeza bidireccional, embeddings de 768 dimensiones) inicializado desde `neuralmind/bert-base-portuguese-cased`, un checkpoint preentrenado sobre corpus en portugués. Sobre esa base se añade una cabeza de clasificación de secuencia con tres salidas, correspondientes a las etiquetas `Negativo`, `Neutro` y `Positivo`.

El fine-tuning se realizó sobre una muestra balanceada de 7.500 reseñas del dataset `ruanchaves/b2w-reviews01`, con 2.500 ejemplos por clase. Los hiperparámetros declarados son 3 épocas, `learning_rate=2e-5`, `batch_size=32`, `max_length=160` y precisión mixta `fp16`. La model card no detalla la composición completa del dataset original, el criterio de muestreo, la partición train/test ni si se aplicó regularización adicional, búsqueda de hiperparámetros o validación cruzada. Tampoco se documenta ningún proceso de RLHF o DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de sentimiento en tres clases (`Negativo`, `Neutro`, `Positivo`) sobre texto en portugués de Brasil.
- Procesamiento de reseñas de comercio electrónico, con vocabulario y expresiones propias de ese dominio tras el fine-tuning.
- Inferencia por lotes mediante `transformers.pipeline('text-classification', ...)`.
- Exportación ONNX para despliegue en runtimes optimizados (ONNX Runtime) o entornos sin PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking), visión ni audio.
- Capacidad multilingüe limitada: el modelo está entrenado y evaluado únicamente en portugués; no se declaran resultados en otros idiomas.

## Casos de uso

- Análisis de sentimiento de reseñas de marketplace: clasificar en lote las opiniones de producto de una plataforma de e-commerce para calcular la distribución de sentimiento por categoría, vendedor o periodo, aprovechando que el modelo está ajustado sobre el mismo dominio (`b2w-reviews01`).
- Monitorización de reputación de marca: procesar menciones y opiniones de clientes en portugués y agregar la proporción de reseñas negativas por producto o canal, con inferencia en CPU si el volumen no justifica GPU.
- Enrutado de tickets de atención al cliente: usar la etiqueta de sentimiento como señal para priorizar casos negativos hacia agentes humanos o hacia un flujo de escalado, dado el bajo coste por inferencia del modelo.
- Extracción de señal para dashboards de calidad: alimentar métricas semanales de satisfacción a partir de reseñas textuales, sustituyendo o complementando encuestas estructuradas.
- Filtrado previo en pipelines de moderación: descartar o marcar reseñas con sentimiento muy negativo antes de un análisis más costoso con un LLM generativo, reduciendo el coste total del pipeline.
- Etiquetado asistido para reentrenamiento: usar las predicciones del modelo como preetiquetas sobre grandes volúmenes de reseñas no anotadas, que después se revisan y se incorporan a un conjunto de entrenamiento ampliado.
- Clasificación en entornos con recursos limitados: despliegue en un contenedor pequeño con ONNX Runtime o en una instancia CPU, para escenarios donde no hay GPU disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test (sin especificar tamaño ni composición de dicho conjunto):

| Modelo | Accuracy | F1-Macro | F1-Weighted |
|---|---|---|---|
| Baseline (sin fine-tuning) | 0.3747 | 0.2895 | 0.2895 |
| BERTimbau fine-tuned | 0.7627 | 0.7652 | 0.7652 |

No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla. No hay datos de MMLU, HumanEval, GSM8K ni de comparación con otros clasificadores en el mismo conjunto de test, ni se documenta la partición exacta empleada para calcular estas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en `fp32`: en torno a 0,45 GB solo para pesos (108,9 M de parámetros), más overhead de activaciones y del runtime; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en `fp16`: aproximadamente 0,22 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A10 o A100 pueden ejecutar el modelo con lotes grandes, aunque el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4060 y superiores) y también en CPU.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime mediante la exportación incluida, y servidores de inferencia compatibles con modelos de `transformers` (por ejemplo, Text Embeddings Inference no aplica; para clasificación, un servidor basado en `pipeline` o en ONNX Runtime). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a encoders BERT de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera inferencia en el orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetulioCO/bertimbau-ptbr-review-classifier | 108,9 M | 160 tokens en entrenamiento (límite BERT: 512) | Clasificación de sentimiento pt-BR, 3 clases | MIT | Hugging Face, safetensors + ONNX |
| neuralmind/bert-base-portuguese-cased | ~108 M | 512 tokens | Modelo base preentrenado pt-BR (no clasificador) | MIT | Hugging Face |
| neuralmind/bert-large-portuguese-cased | ~334 M | 512 tokens | Modelo base preentrenado pt-BR (no clasificador) | MIT | Hugging Face |

No se dispone de datos de rendimiento de clasificadores alternativos en el mismo conjunto de test, por lo que la comparación cuantitativa con otros modelos de sentimiento en portugués no está disponible. La comparación con los checkpoints de Neuralmind es estructural: este modelo deriva del `bert-base-portuguese-cased` y añade una cabeza de clasificación entrenada sobre un dominio concreto.

## Limitaciones y advertencias

- El modelo se entrenó con solo 7.500 ejemplos; es probable que generalice peor fuera del dominio de reseñas de e-commerce de `b2w-reviews01` (por ejemplo, textos legales, clínicos o prensa).
- No se documenta el sesgo demográfico, geográfico ni de producto del dataset de entrenamiento; al tratarse de reseñas de una plataforma brasileña concreta, puede reflejar sesgos de esa población y de ese catálogo.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o con sentimiento mixto.
- La clase `Neutro` es intrínsecamente difícil de separar en reseñas; el F1-Macro de 0,7652 no desglosa el rendimiento por clase, por lo que no se conoce el equilibrio entre clases.
- La longitud de entrada efectiva está limitada por `max_length=160` durante el entrenamiento; reseñas más largas pueden truncarse y perder información relevante.
- Solo portugués, con foco en portugués de Brasil; no se ha evaluado en portugués europeo ni en otros idiomas.
- Licencia MIT, que permite uso comercial, modificación y redistribución con atribución; aun así, conviene verificar las condiciones del dataset `ruanchaves/b2w-reviews01` para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación independiente de las métricas declaradas.
- No se documenta calibración de probabilidades; si se usa un umbral de confianza para enrutado, conviene calibrarlo sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetulioCO/bertimbau-ptbr-review-classifier
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/ruanchaves/b2w-reviews01
