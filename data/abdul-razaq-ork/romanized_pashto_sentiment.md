# abdul-razaq-ork/Romanized_Pashto_Sentiment

## Resumen

El modelo `abdul-razaq-ork/Romanized_Pashto_Sentiment` es un clasificador de sentimientos de tres clases (positivo, negativo y neutro) diseñado específicamente para texto en pastún romanizado, es decir, pastún escrito con el alfabeto latino en lugar del alfabeto árabe tradicional. Ha sido desarrollado por Abdul Razaq como parte de su investigación en NLP multilingüe y de bajos recursos, con un interés particular en el pastún, las lenguas con mezcla de códigos y la evaluación de modelos.

El modelo se basa en `xlm-roberta-base`, un transformer encoder multilingüe de 278 millones de parámetros, y ha sido afinado con un conjunto de datos propio denominado `Romanized_Pashto_Sentiment`. La elección de este modelo base responde a la necesidad de trabajar con texto que presenta una variación ortográfica sustancial, transliteraciones inconsistentes y mezcla de códigos con urdu e inglés, características que dificultan la clasificación automática de sentimientos en esta variante del pastún.

La relevancia actual de este modelo radica en que el pastún romanizado es una lengua de bajos recursos sin un estándar ortográfico definido, y la mayoría de los sistemas de análisis de sentimiento existentes se centran en lenguas de alto recurso. Este modelo contribuye a cerrar esa brecha ofreciendo una solución específica para una comunidad lingüística que escribe de forma informal en internet y redes sociales, donde el pastún romanizado es la forma predominante de comunicación escrita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion declarada) |
| Idiomas soportados | Pashto romanizado (con mezcla de codigo con urdu e ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está construido sobre la arquitectura XLM-RoBERTa, un transformer encoder multilingüe entrenado con un corpus masivo de más de cien lenguas. La capa de clasificación se ha reemplazado para producir tres salidas (positivo, negativo y neutro). El proceso de afinado se realizó sobre el dataset `Romanized_Pashto_Sentiment`, aunque no se ha publicado información sobre el número de ejemplos de entrenamiento, la composición del conjunto ni si se emplearon técnicas adicionales como RLHF o DPO. Los datos reportados incluyen una pérdida de entrenamiento de 0,450354 y una pérdida de validación de 0,357379.

La principal innovación técnica del modelo no reside en la arquitectura, que es estándar, sino en el dominio de aplicación: el pastún romanizado presenta una alta variabilidad ortográfica y mezcla de códigos, lo que convierte el problema en un reto de generalización. El modelo base XLM-RoBERTa ya ofrece un buen rendimiento en tareas multilingües, y el afinado en este dominio específico permite capturar patrones de sentimiento propios de esta variante escrita.

## Capacidades

- Clasificación de sentimiento en tres clases: positivo, negativo y neutro.
- Procesamiento de texto en pastún romanizado con variaciones ortográficas y transliteraciones inconsistentes.
- Manejo de mezcla de códigos entre pastún, urdu e inglés.
- Adecuado para análisis de texto informal de redes sociales y foros en pastún.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta entrada multimodal (solo texto).

## Casos de uso

- Monitoreo de opinión pública en redes sociales: el modelo puede analizar comentarios y publicaciones en pastún romanizado de plataformas como Facebook, X o WhatsApp, permitiendo a organizaciones y medios medir la reacción de la comunidad a eventos políticos o sociales.
- Investigación en NLP de bajos recursos: sirve como punto de referencia para evaluar la viabilidad de técnicas de clasificación de sentimiento en lenguas sin estandarización ortográfica.
- Análisis de retroalimentación de usuarios en servicios locales: empresas que operan en regiones de habla pastún pueden procesar reseñas y comentarios de clientes escritos en pastún romanizado para identificar áreas de mejora.
- Moderación de contenido en plataformas digitales: el modelo puede ayudar a detectar contenido negativo o abusivo en comentarios de usuarios en pastún romanizado, aunque su precisión dependería del contexto y la variación ortográfica.
- Estudios sociolingüísticos: los investigadores pueden usar el modelo para cuantificar el sentimiento asociado a diferentes temas en comunidades pastún-hablantes, facilitando el estudio de la opinión pública en entornos digitales.
- Desarrollo de asistentes de opinión para medios de comunicación: los periodistas pueden utilizar el modelo para resumir rápidamente el sentimiento de los comentarios de los lectores en noticias relacionadas con la región pastún.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Weighted F1 | 87,87 % |
| Pérdida de entrenamiento | 0,450354 |
| Pérdida de validación | 0,357379 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La métrica F1 ponderada del 87,87 % es el único dato de rendimiento reportado por el autor.

## Requisitos de hardware

- El modelo tiene 278 millones de parámetros y el repositorio ocupa 1,1 GB en formato safetensors.
- Inferencia con precisión fp32: se estima una VRAM aproximada de 1,1 GB para el modelo en memoria, más los activos de ejecución, lo que lo hace viable en GPUs de consumo con 4 GB de VRAM o más.
- GPU recomendadas: NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o cualquier GPU con al menos 4 GB de VRAM.
- Es posible ejecutar el modelo en CPU con un tiempo de inferencia mayor, aunque no se han publicado mediciones de latencia.
- Opciones de despliegue: el modelo se puede cargar con la biblioteca de transformers de Hugging Face en Python, y puede servirse mediante servidores de inferencia como vLLM o Text Generation Inference (TGI) si se convierte a los formatos adecuados.
- No se han publicado datos de throughput o latencia específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para análisis de sentimiento en pastún romanizado. La categoría de modelos para lenguas de bajos recursos en esta variante escrita es muy limitada, y el autor no ha reportado comparaciones con alternativas existentes. Se puede considerar como referencia el propio `xlm-roberta-base` sin afinado, que no estaría especializado en pastún romanizado, pero no se han publicado resultados comparativos.

## Limitaciones y advertencias

- El pastún romanizado no tiene un sistema ortográfico estandarizado; variaciones en la transliteración, la ortografía informal y la mezcla de códigos pueden afectar al rendimiento del modelo.
- El rendimiento reportado (F1 de 87,87 %) no debe interpretarse como representativo de todos los hablantes de pastún, dominios o estilos de escritura.
- El modelo se ha entrenado y evaluado con un dataset específico que puede no reflejar la diversidad real de textos en pastún romanizado.
- La licencia de uso no está declarada, lo que limita su uso comercial sin confirmación previa del autor.
- No se ha documentado la evaluación de sesgos o alucinaciones; como modelo de clasificación, el riesgo de alucinación es bajo, pero puede existir sesgo en los datos de entrenamiento.
- El modelo está limitado al dominio del sentimiento y no es adecuado para tareas de generación de texto, razonamiento o comprensión más allá de la clasificación de sentimientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdul-razaq-ork/Romanized_Pashto_Sentiment
- Repositorio GitHub del proyecto Pashto-NLP-Lab: https://github.com/razaq090/Pashto-NLP-Lab
- Perfil del autor en Hugging Face: https://huggingface.co/abdul-razaq-ork
- Sitio web Pashto AI: https://pashtoai.org/
