# shadmanArko/dhaka-kacchi-review-intelligence

## Resumen

El modelo Dhaka Kacchi Review Intelligence es un clasificador de análisis de sentimiento por aspectos (ABSA) desarrollado por shadmanArko. En lugar de producir una única puntuación de sentimiento, predice la polaridad de seis aspectos independientes en reseñas de restaurantes: sabor de la comida, servicio, precio, tamaño de la porción, autenticidad y ambiente. Se construye sobre el modelo DistilBERT base (`distilbert-base-uncased`) con seis cabezas de clasificación lineales que comparten un mismo encoder.

El modelo está pensado para extraer información estructurada de reseñas de restaurantes, una tarea relevante para plataformas de reseñas, cadenas de restaurantes y herramientas de monitorización de reputación. El repositorio tiene un tamaño de 0.3 GB y se distribuye bajo licencia Apache 2.0. La ventana de contexto es de 512 tokens en la arquitectura base, aunque el uso previsto trunca secuencias a 256 tokens.

El proceso de entrenamiento combina un preentrenamiento con etiquetas débiles de un LLM sobre aproximadamente 18.500 reseñas de Yelp, seguido de un ajuste fino sobre 207 reseñas etiquetadas manualmente. La evaluación oficial, realizada sobre 65 reseñas de oro que no participaron en el entrenamiento, reporta una precisión media del 87,2% y una macro F1 media de 0,628.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT base con seis cabezas lineales de clasificación (una por aspecto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (ventana nativa de DistilBERT); el modelo se usa con truncamiento a 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder DistilBERT como backbone y añade seis clasificadores lineales independientes, uno por cada aspecto (`food_taste`, `service`, `price`, `portion_size`, `authenticity`, `ambiance`). Cada cabeza clasifica en cuatro etiquetas: `positive`, `negative`, `neutral` y `not_mentioned`. Durante la inferencia, se toma el vector del token `[CLS]` y se proyecta por cada cabeza.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento con etiquetas débiles generadas por un LLM sobre aproximadamente 18.500 reseñas de Yelp. Después, un ajuste fino con 207 reseñas etiquetadas manualmente. La innovación principal es el enfoque multi-aspecto: en lugar de colapsar el sentimiento en una sola puntuación, el modelo puede distinguir la percepción de distintos elementos de la experiencia del usuario, lo que resulta útil en reseñas largas donde el tono puede variar entre aspectos.

## Capacidades

- Análisis de sentimiento por aspectos en reseñas de restaurantes: predice simultáneamente la polaridad de seis categorías (`food_taste`, `service`, `price`, `portion_size`, `authenticity`, `ambiance`).
- Soporte de la clase `not_mentioned`, que permite identificar cuando una reseña no habla de un aspecto concreto en lugar de forzar una valoración.
- Clasificación de texto en inglés (idioma de entrenamiento de las reseñas de Yelp).
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso.
- No ofrece capacidades de visión, audio ni soporte multilingüe.

## Casos de uso

- Análisis de reseñas en plataformas de opiniones: el modelo procesa reseñas de restauantes y devuelve un desglose por aspectos, lo que permite generar resúmenes automáticos del tipo "la comida es excelente, pero el servicio es irregular" sin leer la reseña completa.
- Monitorización de calidad de servicio en cadenas de restaurantes: una empresa puede procesar reseñas diarias y activar alertas cuando el aspecto `service` o `food_taste` acumula valoraciones negativas en una ubicación concreta.
- Investigación de mercado en el sector de la restauración: comparar la percepción de `authenticity` y `portion_size` entre distintos competidores de una ciudad para detectar ventajas o debilidades en su propuesta de valor.
- Personalización de recomendaciones: una plataforma de reservas puede usar los aspectos para recomendar restaurantes según las preferencias del usuario, por ejemplo, filtrando aquellos con buena relación calidad-precio o con ambiente bien valorado.
- Automatización de encuestas de satisfacción post-comida: sustituir formularios cerrados por análisis de comentarios abiertos, clasificando automáticamente los aspectos mencionados y su sentimiento asociado.
- Gestión de reputación online para agencias de marketing: los equipos pueden generar informes de sentimiento por categorías para sus clientes del sector hostelero, integrando el modelo en un pipeline de monitorización de redes y portales de reseñas.
- Detección de patrones de reseñas sesgadas: al observar desajustes sistemáticos entre aspectos (por ejemplo, `authenticity` positivo pero `service` negativo de forma recurrente), se pueden identificar campañas de opiniones manipuladas o problemas de calidad operativa.

## Benchmarks y rendimiento

La evaluación oficial se realizó sobre 65 reseñas de oro retenidas completamente del entrenamiento, tanto de la fase de etiquetas débiles como del ajuste fino. En esa muestra, los resultados son los siguientes:

| Aspecto | Precisión | Macro F1 |
|---|---|---|
| `food_taste` | 81,5% | 0,590 |
| `service` | 80,0% | 0,573 |
| `price` | 89,2% | 0,706 |
| `portion_size` | 92,3% | 0,591 |
| `authenticity` | 95,4% | 0,640 |
| `ambiance` | 84,6% | 0,671 |
| **Media** | **87,2%** | **0,628** |

No se han publicado comparativas con modelos similares en la información proporcionada. El autor documenta un análisis de errores en el repositorio de GitHub, donde señala fallos conocidos como el sobre-desencadenamiento de la clase `not_mentioned`, el límite de truncamiento de 256 tokens y la limitación del conjunto de oro al usar un solo anotador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repositorio es de 0.3 GB, lo que sugiere que el modelo es pequeño y viable en GPU con 2 GB de VRAM o incluso en CPU, pero no se ofrecen cifras confirmadas.
- GPU recomendadas: no disponible en la información proporcionada. Para un despliegue local, cualquier GPU consumer moderna (por ejemplo, una RTX 3060) es más que suficiente.
- Si cabe en consumer GPU: sí, el modelo entra holgadamente en cualquier tarjeta gráfica consumer con 2 GB o más de VRAM.
- Opciones de despliegue: el modelo se usa a través de la biblioteca Transformers de Hugging Face y PyTorch. Al ser un clasificador de texto de tamaño pequeño, no se requieren infraestructuras como vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El modelo se basa en `distilbert-base-uncased`, por lo que su tamaño de parámetros está en el orden de los 66 millones, pero el autor no proporciona cifras oficiales. Tampoco se ofrecen datos de rendimiento comparado con otras alternativas de análisis de sentimiento por aspectos. Como referencia estructural, se puede comparar con un BERT base fine-tuned para la misma tarea, aunque sin datos de evaluación disponibles.

## Limitaciones y advertencias

- Truncamiento a 256 tokens: alrededor del 11% de las reseñas exceden ese límite, por lo que se pierde contenido y se puede degradar el resultado.
- Sesgo de dominio: el modelo se entrenó predominantemente con reseñas de Yelp de Estados Unidos y Canadá, lo que deja vocabulario subrepresentado para términos de cocina bangladesí o de otras regiones (por ejemplo, "biryani").
- Conjunto de oro con un solo anotador: la fiabilidad de las etiquetas de referencia es limitada y no hay verificación inter-anotador.
- Clase `neutral` débil: es la clase con peores resultados en todos los aspectos, lo que puede llevar a confundir opiniones neutrales con negativas o no mencionadas.
- Riesgo de sobre-desencadenamiento de `not_mentioned`: el modelo puede marcar como no mencionado un aspecto que sí estaba presente en la reseña.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero el autor no ofrece garantías de rendimiento ni soporte.
- No es aplicable fuera del dominio de reseñas de restaurantes: su capacidad se limita a textos en inglés sobre experiencias gastronómicas.

## Enlaces

- Hugging Face: https://huggingface.co/shadmanArko/dhaka-kacchi-review-intelligence
- GitHub del proyecto: https://github.com/shadmanArko/dhaka-kacchi-review-intelligence
- DEMO en línea: https://reviews.dhakakacchi.com
