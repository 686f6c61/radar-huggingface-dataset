# jramduran/review-sentiment-roberta-base

## Resumen

`jramduran/review-sentiment-roberta-base` es un modelo de clasificación de texto en inglés obtenido mediante ajuste fino completo (*full fine-tuning*) de `FacebookAI/roberta-base` sobre reseñas de productos. Su tarea es asignar a cada reseña una de tres etiquetas: negativa, neutra o positiva. Lo publica el usuario de Hugging Face `jramduran` y se distribuye con la librería `transformers` en formato `safetensors`.

Se trata de un encoder transformer de tipo RoBERTa con 124.647.939 parámetros (aproximadamente 125 M), el tamaño estándar de la familia `roberta-base`. No es un modelo generativo: no produce texto libre, sino una distribución de probabilidad sobre tres clases. Su utilidad práctica es el análisis de sentimiento a escala sobre catálogos de reseñas, con un coste de inferencia muy bajo comparado con un LLM generativo.

Es relevante por su perfil de despliegue: cabe en cualquier GPU consumer, se sirve con `text-embeddings-inference` (el autor lo marca como compatible con *endpoints*) y puede ejecutarse en CPU con latencias de milisegundos por muestra. La información disponible es escasa: la model card es mínima, no se documentan datos de entrenamiento, hiperparámetros, métricas ni licencia, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base), ajuste fino completo con cabeza de clasificación |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; RoBERTa-base admite hasta 512 tokens de posición |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`, presumiblemente fp32/fp16; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RoBERTa-base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con embeddings posicionales aprendidos y tokenizador BPE (vocabulario de 50.265 tokens). Sobre el checkpoint preentrenado se ha añadido una cabeza de clasificación lineal para tres clases y se ha realizado un ajuste fino completo, según indica la model card. El preentrenamiento original de RoBERTa se hizo sobre corpus en inglés de gran escala (BookCorpus, CC-News, OpenWebText y Stories), pero el autor no detalla el corpus de ajuste fino.

No se documentan en la información disponible el número de ejemplos de entrenamiento, la composición del dataset de reseñas, la proporción entre clases, la función de pérdida, los hiperparámetros (learning rate, batch size, épocas), ni si hubo balanceo o *data augmentation*. Tampoco se indica si se aplicó alguna técnica de regularización o *early stopping*. La model card no menciona innovaciones técnicas adicionales más allá del ajuste fino estándar.

## Capacidades

- Clasificación de sentimiento en tres clases (negativa, neutra, positiva) sobre texto en inglés.
- Análisis de reseñas de productos, según el `pipeline_tag` y los tags del repositorio (`sentiment-analysis`, `product-reviews`).
- Entrada de texto de hasta 512 tokens de posición (límite de RoBERTa-base), suficiente para reseñas de longitud media.
- Integración directa con `transformers.pipeline("text-classification")`.
- Compatible con `text-embeddings-inference` y con el sistema de *endpoints* de Hugging Face, según los tags del repositorio.
- No dispone de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador discriminativo.
- Multilingüismo: no. Solo inglés declarado.

## Casos de uso

- **Monitorización de sentimiento en catálogos de e-commerce**: procesar por lotes las reseñas de producto y agregar la proporción de negativas/neutras/positivas por SKU para detectar caídas de satisfacción. El modelo es adecuado por su bajo coste por inferencia frente a un LLM generativo.
- **Enrutado de tickets de soporte**: clasificar el texto inicial de una reclamación como negativa para priorizar la cola de atención. La salida de tres clases permite una regla simple de umbral sobre la probabilidad.
- **Etiquetado automático de reseñas para analítica interna**: generar una columna de sentimiento en un almacén de datos (por ejemplo, en un job batch con `transformers` sobre CPU) y construir dashboards de evolución temporal.
- **Filtrado previo en pipelines de moderación**: usar la clase negativa como señal de entrada para revisión humana, reduciendo el volumen que llega a los moderadores.
- **Detección de regresiones de producto**: cruzar el sentimiento de reseñas con versiones o lotes de un producto para identificar cuándo aparece un patrón negativo tras un cambio.
- **Anotación asistida en investigación de mercado**: preetiquetar un corpus de reseñas en inglés y corregir manualmente solo los casos de baja confianza, acelerando el etiquetado supervisado.
- **Extracción de señal en A/B testing de fichas de producto**: comparar la distribución de sentimiento entre dos variantes de página usando el clasificador como métrica automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación (accuracy, F1 macro, matriz de confusión) ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (125 M de parámetros × 4 bytes) y en torno a 0,25 GB en fp16. El tamaño del repositorio es de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090, RTX 3090, T4 o incluso una GTX 1650 son sobradas.
- Cabe en GPU consumer: sí, en cualquier modelo con más de 1 GB de VRAM; también en CPU con latencias de milisegundos a decenas de milisegundos por muestra.
- Opciones de despliegue: `transformers` (Python), `text-embeddings-inference` (soportado según los tags), *endpoints* de Hugging Face. No se documentan artefactos GGUF ni ONNX, por lo que `llama.cpp` y `Ollama` no son vías directas sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/review-sentiment-roberta-base` | 124,6 M | 512 tokens (límite de RoBERTa-base) | Clasificación de sentimiento 3 clases, inglés | no disponible | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | Sentimiento 3 clases, inglés (dominio Twitter) | no disponible en la información de esta ficha | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | Sentimiento binario, inglés | Apache 2.0 (modelo base DistilBERT) | Hugging Face |

La comparación con alternativas es aproximada: no se dispone de métricas de este modelo que permitan contrastar rendimiento frente a los citados. La diferencia principal frente a `distilbert-base-uncased-finetuned-sst-2-english` es la granularidad (tres clases frente a dos) y el tamaño (el doble de parámetros). Frente a variantes ajustadas en Twitter, el dominio de entrenamiento declarado aquí son reseñas de productos, lo que puede trasladarse mejor a e-commerce que a texto social.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en la información disponible. Esto impide confirmar el uso comercial; hay que contactar con el autor o asumir el riesgo legal antes de desplegarlo en producción.
- **Sin métricas publicadas**: no hay accuracy, F1 ni matriz de confusión, por lo que no se puede evaluar su calidad frente a alternativas sin una validación propia.
- **Solo inglés**: no soporta castellano ni otros idiomas; usarlo con texto en español producirá predicciones no fiables.
- **Riesgo de alucinación no aplica en el sentido generativo**, pero sí hay riesgo de clasificación errónea en reseñas ambiguas, sarcásticas o con negaciones complejas, habitual en texto de opinión.
- **Sesgos potenciales**: al no documentarse el corpus de ajuste fino, se desconoce si hay desbalance de clases, sesgo de dominio (solo ciertas categorías de producto) o sesgo demográfico en el lenguaje de las reseñas.
- **Límite de 512 tokens**: reseñas largas se truncan; el modelo no puede razonar sobre el conjunto completo de un texto extenso.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario; conviene tratarlo como un checkpoint experimental y validarlo antes de producción.
- **Sin artefactos de despliegue ligeros**: no hay GGUF ni ONNX publicados; para servir en `llama.cpp` u `Ollama` habría que convertirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/review-sentiment-roberta-base
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Artículo de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
- Documentación de `transformers` para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de `text-embeddings-inference`: https://huggingface.co/docs/text-embeddings-inference
