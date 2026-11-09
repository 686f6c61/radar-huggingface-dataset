# Can07/kiberanalyc-absa

## Resumen

KiberAnalyc ABSA v2 es un sistema de análisis de sentimiento basado en aspectos (ABSA, aspect-based sentiment analysis) especializado en reseñas de hoteles en turco. Lo desarrolla el usuario Can07 y se publica bajo licencia MIT. El sistema no es un único modelo, sino una pareja de clasificadores construidos sobre el checkpoint `dbmdz/convbert-base-turkish-mc4-cased`: un primer modelo detecta si un aspecto concreto aparece mencionado en la reseña y un segundo modelo clasifica el sentimiento (positivo o negativo) para ese aspecto.

La relevancia práctica del modelo está en su granularidad: en lugar de asignar una única polaridad a toda la reseña, devuelve un mapa de sentimiento por aspecto (limpieza de habitación, restaurante, spa, piscina, etc.), lo que resulta directamente explotable en analítica de reputación hotelera. Cubre 27 aspectos definidos en un fichero de configuración (`system_config.json`) que también contiene los prompts de condicionamiento por aspecto y el mapa de fusión de subaspectos.

Técnicamente es un modelo compacto: ConvBERT base en turco con una longitud máxima de 512 tokens y un umbral de detección de 0,35. El repositorio ocupa 2,6 GB e incluye dos subcarpetas de pesos (`absa_detection_model_final` y `absa_sentiment_model_final`) más la configuración del sistema. No se han publicado datos de benchmarks ni detalles sobre el corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ConvBERT (base, adaptado a turco) |
| Parametros totales | no disponible (modelo base ConvBERT base; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrada) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se compone de dos clasificadores de secuencia independientes, ambos inicializados desde `dbmdz/convbert-base-turkish-mc4-cased`. El primero (`absa_detection_model_final`) es un clasificador binario condicionado por aspecto: recibe como par (prompt del aspecto, texto de la reseña) y decide si el aspecto está presente, con un umbral de decisión de 0,35. El segundo (`absa_sentiment_model_final`) recibe el mismo par y clasifica la polaridad en `Pozitif` o `Negatif`. La separación en dos etapas permite filtrar reseñas que no mencionan un aspecto antes de asignar sentimiento, evitando falsos positivos en aspectos ausentes.

ConvBERT introduce bloques de atención con convoluciones (span-based dynamic convolution) que reducen el coste computacional frente a atención completa manteniendo capacidad expresiva; el checkpoint base fue entrenado sobre corpus turcos (MC4). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset de reseñas ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un clasificador de este tipo). Tampoco se especifica el proceso de anotación de los 27 aspectos ni el tamaño del conjunto de entrenamiento. La versión v2 consolida el conjunto de aspectos (los subaspectos `spa_*` se fusionan en `spa`, `havuz_termal` pasa a `havuz` y `temizlik_banyo` a `oda_temizlik`), lo que sugiere una iteración sobre un esquema v1 previo disponible en la revisión `v1` del repositorio.

## Capacidades

- Clasificación de sentimiento por aspecto en reseñas de hoteles en turco, con 27 aspectos configurables.
- Detección de presencia de aspecto con umbral ajustable (0,35 por defecto) antes de la clasificación de polaridad.
- Clasificación binaria de sentimiento (`Pozitif` / `Negatif`) por aspecto detectado.
- Procesamiento de entradas de hasta 512 tokens, suficiente para reseñas individuales.
- Configuración externalizada en `system_config.json`: lista de aspectos, prompts por aspecto (`aspect2prompt`), umbral de detección, mapeo de etiquetas (`sent_id2label`) y mapa de fusión (`merge_map`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador de texto puro.
- Capacidad multilingüe limitada al turco; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Analítica de reputación hotelera: procesar el corpus de reseñas de un establecimiento y generar un desglose de sentimiento por aspecto (limpieza de habitación, restaurante, spa, piscina) para alimentar cuadros de mando operativos.
- Enrutamiento de quejas a departamentos: las reseñas con sentimiento negativo en `oda_temizlik` se dirigen a housekeeping y las de restaurante a F&B, usando el mapa de aspectos como taxonomía de tickets.
- Monitorización de competencia: aplicar el mismo pipeline a reseñas de hoteles rivales en plataformas turcas para comparar fortalezas y debilidades por aspecto.
- Priorización de inversiones: agregar el sentimiento por aspecto a lo largo del tiempo para identificar qué áreas (spa, piscina, restaurante) correlacionan con caídas de valoración.
- Extracción de señales para modelos generativos: usar la salida estructurada por aspecto como contexto en un sistema RAG que redacte respuestas a huéspedes o resúmenes ejecutivos.
- Filtrado previo en pipelines de moderación: descartar reseñas sin menciones a aspectos relevantes antes de pasarlas a modelos más costosos, gracias a la etapa de detección con umbral configurable.
- Investigación en ABSA: servir como baseline reproducible en turco para comparar con modelos multilingües de mayor tamaño en tareas de análisis por aspecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ConvBERT base en fp32 ocupa aproximadamente 0,5 GB de pesos por modelo; con los dos clasificadores cargados simultáneamente, el consumo se mantiene por debajo de 2 GB incluyendo activaciones para batches pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A10 o A100 funcionan sin problema. También es viable en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch (el snippet de la model card usa `AutoTokenizer` y `AutoModelForSequenceClassification`), `huggingface_hub` para descarga por revisión, y servidores de inferencia estándar como TGI o un endpoint de `text-classification`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera inferencia en milisegundos por par (aspecto, reseña) en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Can07/kiberanalyc-absa | ConvBERT base (cifra no publicada) | 512 tokens | ABSA en turco, 27 aspectos | MIT | Hugging Face, revisiones v1 y v2 |
| dbmdz/convbert-base-turkish-mc4-cased | ConvBERT base | 512 tokens | Modelo base turco (MLM) | no disponible en la informacion | Hugging Face |
| Modelos ABSA multilingües tipo XLM-R | no disponible | 512 tokens | ABSA multilingüe | varía | Hugging Face |

La comparación con alternativas ABSA específicas para turco no está disponible en la información proporcionada; el modelo base `dbmdz/convbert-base-turkish-mc4-cased` es el punto de referencia directo por ser su inicialización.

## Limitaciones y advertencias

- Dominio restringido: entrenado para reseñas de hoteles (y aspectos de restaurante/hostelería); su comportamiento fuera de ese dominio no está documentado.
- Idioma único: solo turco; no se garantiza rendimiento en otras lenguas.
- Sin benchmarks publicados: no hay métricas de precisión, recall ni F1 que permitan evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea: la etapa de detección con umbral 0,35 puede producir falsos positivos o negativos según el dominio y la longitud de la reseña.
- Límite de 512 tokens: reseñas largas se truncan, lo que puede eliminar menciones a aspectos situadas al final del texto.
- Dependencia de la configuración: los 27 aspectos, sus prompts y el mapa de fusión están en `system_config.json`; modificar el esquema requiere revisar el mapeo de etiquetas y el umbral.
- Sesgos: no se documenta la composición del corpus de entrenamiento ni posibles sesgos de anotación o de dominio (hoteles de una región o cadena concreta).
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base `dbmdz/convbert-base-turkish-mc4-cased`, no indicada en la información disponible.
- Madurez: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Can07/kiberanalyc-absa
- Modelo base: https://huggingface.co/dbmdz/convbert-base-turkish-mc4-cased
- Revisión v1: https://huggingface.co/Can07/kiberanalyc-absa/tree/v1
- Revisión v2: https://huggingface.co/Can07/kiberanalyc-absa/tree/v2
