# MikaelAdi/insightulasan-nlp01

## Resumen

InsightUlasan NLP-01 es un modelo de análisis de sentimiento basado en aspectos (ABSA) desarrollado por MikaelAdi para el ámbito del comercio electrónico en indonesio informal. Se trata de un fine-tuning del modelo IndoBERT base (indobenchmark/indobert-base-p1) que incorpora dos cabezas de clasificación sobre un encoder compartido: una para etiquetado multi-clase de aspectos (11 categorías) y otra para sentimiento en tres clases (positivo, negativo, neutral). El modelo fue construido para la competición AIC COMPFEST 18 y se distribuye bajo licencia Apache-2.0.

La relevancia del modelo radica en abordar el análisis de opiniones en indonesio, un idioma con escasos recursos para tareas de PLN, y en su diseño de doble salida que permite extraer simultáneamente el aspecto y el sentimiento asociado en reseñas de productos. No obstante, el autor advierte explícitamente que la validación de la tarea de aspectos es incompleta, ya que las etiquetas de entrenamiento provienen de funciones de etiquetado propias, por lo que las métricas de aspecto no deben interpretarse como precisión real.

La arquitectura se basa en un transformer BERT con aproximadamente 124 millones de parámetros (tamaño no confirmado en la documentación oficial), y su contexto máximo no está especificado en la ficha, aunque es probable que herede los 512 tokens de IndoBERT base. El modelo requiere una clase personalizada `DualHeadClassifier` para su uso, no siendo un checkpoint estándar de `AutoModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (IndoBERT base) con dos cabezas de clasificación sobre encoder compartido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 0.5 GB, sin especificar) |

## Arquitectura y entrenamiento

El modelo parte de IndoBERT base, un transformer BERT preentrenado en indonesio, y le añade dos cabezas de clasificación independientes que comparten el encoder. La primera cabeza realiza clasificación multi-etiqueta de aspectos (11 clases), mientras que la segunda clasifica el sentimiento en tres categorías. Esta arquitectura de doble salida permite obtener ambas predicciones en una sola pasada, lo que resulta eficiente para aplicaciones de análisis de opiniones.

El entrenamiento consistió en un fine-tuning sobre datos de reseñas de e-commerce en indonesio informal. Para la tarea de aspectos, las etiquetas fueron generadas mediante labeling functions escritas por el propio equipo, lo que constituye un enfoque de supervisión débil. No se especifican el número de tokens de entrenamiento ni la composición del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación. El autor documenta que la tarea de sentimiento fue validada con etiquetas humanas independientes (NusaX-senti, PRDECT-ID), mientras que la de aspectos no lo fue.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutral) para reseñas en indonesio informal.
- Clasificación multi-etiqueta de aspectos en 11 categorías (p. ej., precio, calidad, envío, etc., aunque las categorías concretas no se detallan en la documentación).
- Procesamiento de texto en indonesio, incluyendo variantes informales propias del comercio electrónico.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades multimodales (visión, audio).
- No se documenta soporte para otros idiomas.

## Casos de uso

- Analisis de opiniones en plataformas de e-commerce indonesias: el modelo permite extraer de cada reseña el aspecto mencionado y el sentimiento asociado, facilitando el resumen automatizado de la retroalimentación de los clientes.
- Monitorizacion de satisfaccion del cliente: las empresas pueden procesar grandes volúmenes de reseñas y detectar tendencias de opinión por categoría de producto o por tienda, gracias a su doble salida.
- Mejora de productos basada en retroalimentacion: al identificar aspectos negativos recurrentes (p. ej., problemas de embalaje o tiempo de entrega), los equipos de producto pueden priorizar acciones correctivas.
- Deteccion de problemas comunes en reseñas: la clasificación multi-etiqueta de aspectos permite agrupar quejas y felicitaciones por tema, lo que ayuda a la gestión de la calidad.
- Clasificacion de reseñas para moderacion: el sentimiento puede utilizarse para filtrar reseñas extremadamente negativas que requieran atención manual o respuesta del servicio de atención al cliente.
- Analisis de competencia: aplicado a reseñas de productos de la competencia, el modelo permite comparar la percepción de atributos específicos entre marcas.

## Benchmarks y rendimiento

El autor reporta resultados únicamente para la tarea de sentimiento, validados con etiquetas humanas independientes:

- Macro F1 de 0,730 frente a 0,700 de un baseline léxico en los conjuntos NusaX-senti y PRDECT-ID.
- Mejora significativa en la clase neutral, pasando de 0,021 a 0,645 en F1.

No se han publicado resultados de benchmarks para la tarea de aspectos, y el propio autor advierte que las métricas de aspecto no deben citarse como logros, ya que miden el acuerdo con las reglas de etiquetado propias y no la precisión real. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0.5 GB, consistente con un modelo BERT base en precisión float32, lo que permite inferencia en hardware modesto.
- VRAM estimada: aproximadamente 1-2 GB para inferencia en lotes pequeños con cuantización FP16, y algo más en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Es compatible con GPUs de consumo, no requiere hardware de centro de datos.
- Opciones de despliegue: al no ser un checkpoint `AutoModel` estándar, requiere el uso de la clase `DualHeadClassifier` del repositorio asociado. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, aunque podría adaptarse con modificaciones.
- Latencia y throughput: no se especifican en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un modelo especializado en ABSA para indonesio, una comparativa razonable podría incluir otros modelos fine-tuned de IndoBERT para análisis de sentimiento, pero no se han encontrado datos en la ficha. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La tarea de aspectos no está validada con etiquetas humanas; las métricas reportadas solo reflejan el acuerdo con las reglas de etiquetado propias, por lo que no deben interpretarse como precisión real.
- Sesgo hacia la clase negativa: el modelo falla en reconocer reseñas negativas en una proporción significativa (128 de 420 en PRDECT-ID), y en el 88% de esos casos la probabilidad predicha para la clase negativa es inferior a 0,10, lo que indica que el modelo está confiado cuando se equivoca.
- Solo soporta indonesio, no es multilingüe.
- Requiere una clase personalizada (`DualHeadClassifier`) para su uso; no es un checkpoint estándar de `AutoModel`, lo que complica su integración en pipelines convencionales.
- No se especifican los 11 aspectos concretos ni el proceso de etiquetado, lo que limita la reproducibilidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con documentación incompleta sobre su entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/MikaelAdi/insightulasan-nlp01
- Repositorio GitHub (documentación y código): https://github.com/patrick12354/BPS_AIC (incluye docs/MODEL_CARD.md y docs/LIMITATIONS.md)
