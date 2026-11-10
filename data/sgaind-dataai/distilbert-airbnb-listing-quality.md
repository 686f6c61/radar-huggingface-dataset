# sgaind-dataai/distilbert-airbnb-listing-quality

## Resumen

`distilbert-airbnb-listing-quality` es un modelo de clasificación de texto en inglés desarrollado por `sgaind-dataai` que predice, a partir de una única reseña de huésped, si el alojamiento de Airbnb al que pertenece es de calidad inferior (`below_par`, valoración global menor o igual a 4,6) o de primera categoría (`top_tier`, valoración global mayor o igual a 4,9). Se trata de un ajuste fino de `distilbert-base-uncased`, la variante destilada de BERT con 66.955.010 parámetros, publicada bajo licencia Apache 2.0.

El modelo resuelve un problema concreto de analítica de reputación: convertir texto libre de reseñas en una señal binaria de calidad del anuncio, sin depender de la puntuación numérica que el huésped haya dejado. Su relevancia es acotada y muy específica: está entrenado exclusivamente con reseñas de Dallas (Texas) del conjunto Inside Airbnb de junio de 2024, por lo que funciona como componente de un pipeline de análisis de opiniones para ese mercado y no como clasificador general de sentimiento.

La arquitectura es un transformer encoder de 6 capas con 66 millones de parámetros, contexto de 512 tokens y un entrenamiento muy ligero (3 épocas, unos 3 minutos en una T4 de Colab). El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y su interés principal es metodológico: demuestra cómo un DistilBERT ajustado supera claramente a un analizador léxico como VADER en una tarea de clasificación de calidad a nivel de anuncio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entrenado con max_length 256) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica INT8 posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. La cabeza de clasificación es una capa lineal sobre el token `[CLS]` con dos salidas (`0 = below_par`, `1 = top_tier`). El vocabulario es el de BERT uncased, con tokenización WordPiece y normalización a minúsculas.

Los datos de entrenamiento provienen del conjunto Inside Airbnb de Dallas (Texas), volcado de junio de 2024, publicado bajo CC BY 4.0 en insideairbnb.com. Se usaron 15.694 reseñas en inglés, balanceadas 50/50 entre las dos clases, con un máximo de 25 reseñas por anuncio. La partición es 70/10/20 y se realizó **por anuncio**, de modo que ninguna vivienda aparece en dos conjuntos distintos, lo que evita fuga de información entre entrenamiento y test. El ajuste fino se hizo durante 3 épocas con learning rate 2e-5, batch size 32 y longitud máxima de 256 tokens, en una GPU T4 gratuita de Colab en aproximadamente 3 minutos. No se documenta uso de RLHF, DPO ni datos sintéticos. La innovación técnica destacable no está en la arquitectura sino en el diseño experimental: la comparación contra VADER con umbral por defecto y con umbral ajustado (0,88) sobre el mismo conjunto de test aísla la ganancia atribuible al modelo frente a la de un analizador léxico.

## Capacidades

- Clasificación binaria de texto en inglés: `below_par` frente a `top_tier` a partir de una reseña de huésped.
- Detección de quejas sobre limpieza, precio y tasas, que según el autor son los errores de clasificación más confiados y la señal principal que aprende el modelo.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 66 millones de parámetros.
- Integración directa con la API `pipeline` de Transformers y con la clase `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe nula más allá del inglés: el vocabulario uncased de BERT no cubre adecuadamente otros idiomas y no fue entrenado con ellos.

## Casos de uso

- Monitorización de reputación de anuncios: procesar por lotes las reseñas nuevas de un listado de Dallas y agregar las predicciones por anuncio para detectar una degradación de la calidad percibida antes de que se refleje en la puntuación media. Adecuado por su coste de inferencia mínimo y su entrenamiento específico en ese mercado.
- Priorización de reseñas para atención al cliente: clasificar las reseñas entrantes y enrutar las predicciones `below_par` a un equipo humano, usando la probabilidad de la clase como orden de prioridad. El modelo detecta sobre todo quejas de limpieza y precio, que son las que requieren acción operativa.
- Enriquecimiento de un data warehouse de alojamientos: añadir una columna de calidad textual por reseña y explotarla en cuadros de mando junto a la puntuación numérica del anuncio, para separar la calidad declarada de la calidad narrada.
- Filtrado de reseñas en un sistema de recomendación: usar la predicción como feature adicional en un ranking de alojamientos, combinada con precio, ubicación y número de reservas.
- Investigación académica sobre sesgo de valoración: el modelo sirve como línea base reproducible (código y pipeline publicados en GitHub) para estudiar la discrepancia entre la nota numérica y el contenido textual de las reseñas.
- Prototipado rápido de clasificadores de opinión: al caber en una T4 y entrenarse en minutos, es una plantilla para equipos que quieran replicar el experimento con datos de otra ciudad o sector, sustituyendo el conjunto de datos y reajustando el modelo.
- Análisis de la brecha entre sentimiento y nota: el propio autor señala que los errores más confiados son reseñas cuyo sentimiento contradice la media del anuncio, lo que permite usar el modelo para localizar casos anómalos que merecen revisión manual.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (3.139 reseñas de anuncios no vistos en entrenamiento):

| Modelo | Accuracy | Macro F1 | F1 below-par | F1 top-tier |
|---|---|---|---|---|
| VADER (umbral por defecto 0,05) | 0,547 | 0,436 | 0,187 | 0,686 |
| VADER (umbral ajustado 0,88) | 0,608 | 0,608 | 0,597 | 0,618 |
| DistilBERT (fine-tuned) | 0,704 | 0,704 | 0,700 | 0,708 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB de pesos (0,3 GB de repo), más activaciones; en la práctica cabe en cualquier GPU con 1 GB o más.
- VRAM estimada en FP16: en torno a 135 MB de pesos; en INT8 dinámico, unos 70 MB.
- GPU recomendadas: ninguna en particular; funciona en T4, RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad. El entrenamiento original se completó en una T4 gratuita de Colab en unos 3 minutos.
- Cabe holgadamente en GPU de consumo e incluso en CPU para cargas moderadas; el límite práctico es el throughput, no la memoria.
- Opciones de despliegue: `transformers` con `pipeline`, `TextClassificationPipeline` en servidor, exportación a ONNX Runtime para CPU, TorchScript, y contenedores ligeros. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera un throughput de miles de reseñas por segundo en GPU moderna con batch, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-airbnb-listing-quality | 66.955.010 | 512 tokens | Clasificación binaria de calidad de anuncio Airbnb (Dallas) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66.955.010 | 512 tokens | Modelo base general, sin cabeza de clasificación ajustada | Apache 2.0 | Hugging Face, ampliamente usado |
| VADER (analizador léxico) | no aplica (basado en léxico y reglas) | no aplica | Sentimiento general | MIT | Librería Python `vaderSentiment` |
| BERT-base-uncased | 109.482.240 | 512 tokens | Modelo base general | Apache 2.0 | Hugging Face |

La comparación relevante es contra VADER, incluida en la propia model card: el DistilBERT ajustado obtiene 0,704 de accuracy y macro F1 frente a 0,547/0,436 de VADER por defecto y 0,608/0,608 con umbral ajustado, sobre el mismo test de 3.139 reseñas. No se dispone de comparación con otros clasificadores ajustados para esta tarea concreta.

## Limitaciones y advertencias

- Las etiquetas son a nivel de anuncio, no de reseña: un huésped satisfecho en un alojamiento de 4,5 se etiqueta como `below_par`, lo que según el autor limita la accuracy a alrededor del 70 % como techo práctico.
- Cobertura geográfica y lingüística restringida: solo Dallas, solo inglés y solo reseñas de 2010 a 2024. No hay garantía de generalización a otras ciudades, idiomas o plataformas.
- Los errores más confiados son reseñas cuyo sentimiento contradice la media del anuncio; el modelo detecta principalmente quejas de limpieza, precio y tasas, y puede pasar por alto problemas de otro tipo (ruido, ubicación, anfitrión).
- Riesgo de alucinación no aplica en sentido estricto por ser clasificación, pero sí hay riesgo de falsos positivos y negativos con probabilidades mal calibradas; no se documenta calibración.
- Licencia Apache 2.0 permite uso comercial y modificación, pero el conjunto de datos subyacente (Inside Airbnb) se publica bajo CC BY 4.0 y requiere atribución.
- El modelo tiene 0 descargas y 0 likes, sin validación externa ni mantenimiento documentado; debe tratarse como artefacto de investigación reproducible, no como componente listo para producción sin una evaluación propia.
- No se documentan sesgos demográficos ni análisis de equidad; al entrenarse con reseñas de una sola ciudad, puede heredar sesgos de los huéspedes y anfitriones de ese mercado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sgaind-dataai/distilbert-airbnb-listing-quality
- Repositorio de código, pipeline de datos y tests: https://github.com/sgaind-data/Airbnb_Review_Scores_ML
- Datos de origen (Inside Airbnb): https://insideairbnb.com
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
