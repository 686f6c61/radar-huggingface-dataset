# erolunss/berturk-eticaret-duygu-analizi

## Resumen

berturk-eticaret-duygu-analizi es un modelo de clasificación de texto publicado en Hugging Face por el usuario erolunss. Por su identificador y su pipeline (`text-classification`), se trata de un ajuste fino (fine-tuning) de BERTurk, el modelo BERT preentrenado para turco, orientado al análisis de sentimiento en el dominio del comercio electrónico (en turco, "eticaret" significa comercio electrónico y "duygu analizi", análisis de sentimiento). El modelo resuelve la tarea de asignar una etiqueta de sentimiento a reseñas o textos de compradores, un caso de uso habitual en la monitorización de opiniones en plataformas de venta online.

Técnicamente es un transformer encoder de tipo BERT con 110.618.882 parámetros totales (aproximadamente 110,6 millones), lo que corresponde a la configuración base estándar de BERT (12 capas, 768 dimensiones ocultas, 12 cabezas de atención). El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. La model card es la plantilla autogenerada por Hugging Face y no contiene información sustantiva sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia.

La relevancia del modelo es acotada: se publicó con cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas, y carece de documentación técnica verificable. Resulta útil como punto de partida para experimentar con análisis de sentimiento en turco dentro del dominio del comercio electrónico, pero no debe considerarse un modelo listo para producción sin una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), ajustado para clasificación de texto |
| Parámetros totales | 110.618.882 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuración base de BERTurk es de 512 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible (al ser un modelo de 110 M de parámetros, es compatible con cuantización dinámica INT8 vía PyTorch y con conversión a GGUF, aunque no se documenta) |
| Idiomas soportados | no disponible (por el nombre y el origen de BERTurk, se espera turco; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT en su variante base, con 110,6 millones de parámetros, sobre el que se ha añadido una cabeza de clasificación de secuencias para la tarea de análisis de sentimiento. El modelo parte presumiblemente de BERTurk, el checkpoint BERT preentrenado para turco, aunque la model card no lo confirma explícitamente ni documenta el proceso de ajuste fino.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del corpus de comercio electrónico utilizado, el número de épocas, la tasa de aprendizaje, el régimen de precisión (fp32, fp16 o bf16) ni si se aplicaron técnicas de regularización o balanceo de clases. Tampoco se documenta ningún proceso de RLHF, DPO ni innovación técnica adicional. La model card es la plantilla automática de Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]".

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una etiqueta de sentimiento a un texto de entrada.
- Análisis de sentimiento en dominio de comercio electrónico: por el nombre del modelo, está especializado en reseñas y opiniones de compradores.
- Procesamiento de lenguaje natural en turco: se infiere del uso de BERTurk como base, aunque no está confirmado en la documentación.
- Integración con el ecosistema transformers: compatible con `pipeline("text-classification")`, con Text Embeddings Inference y con endpoints compatibles.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Monitorización de reseñas en marketplaces: clasificar automáticamente las opiniones de compradores en positivas, negativas o neutras para alimentar dashboards de satisfacción y detectar productos con problemas recurrentes.
- Alertas tempranas de reputación: procesar en tiempo casi real los comentarios nuevos de una tienda online y escalar a atención al cliente los casos negativos antes de que se acumulen.
- Análisis de la voz del cliente: agregar el sentimiento de miles de reseñas por categoría de producto para identificar qué líneas de negocio generan más insatisfacción.
- Priorización de tickets de soporte: usar la etiqueta de sentimiento como señal adicional para ordenar la cola de incidencias y atender primero a los clientes más frustrados.
- Investigación de mercado: analizar la percepción de una marca o de un competidor a partir de reseñas públicas en plataformas de comercio electrónico turcas.
- Filtrado y moderación de contenido: detectar comentarios con tono muy negativo o potencialmente abusivos para revisión humana antes de su publicación.
- En todos los casos, el modelo debe validarse primero con datos propios del dominio, dado que no hay métricas publicadas ni información sobre el esquema de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para los pesos (110,6 M de parámetros × 4 bytes), más el overhead de activaciones y del tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos, más overhead; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una NVIDIA T4, L4, RTX 3060 o superior ofrece un rendimiento holgado. También funciona en CPU para volúmenes moderados.
- Cabe en cualquier GPU de consumo actual, incluidas las integradas de portátiles con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face, y exportación a ONNX o torchscript para inferencia optimizada. La conversión a GGUF para llama.cpp es posible pero no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en hardware moderno), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erolunss/berturk-eticaret-duygu-analizi | 110,6 M | no disponible | Clasificación de sentimiento (turco, comercio electrónico) | no disponible | Hugging Face, 0 descargas |
| BERTurk (dbmdz/bert-base-turkish-cased) | ~110 M | 512 tokens | Modelo base preentrenado en turco | no disponible en la información proporcionada | Hugging Face, ampliamente utilizado |
| BERT multilingüe (bert-base-multilingual-cased) | ~178 M | 512 tokens | Modelo base multilingüe | Apache 2.0 (referencia habitual) | Hugging Face, muy extendido |
| XLM-RoBERTa base | ~278 M | 512 tokens | Modelo base multilingüe | MIT (referencia habitual) | Hugging Face, muy extendido |

La comparación se limita a modelos base de la misma familia, ya que no se dispone de datos de rendimiento del modelo evaluado ni de ajustes finos comparables en el mismo dominio. Las licencias de los modelos de referencia se indican como referencia habitual y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse presumiblemente con reseñas de comercio electrónico, puede heredar sesgos de género, edad, origen geográfico o tipo de producto presentes en esos textos.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o fuera del dominio de entrenamiento.
- No se especifican los idiomas soportados; si el modelo está entrenado solo en turco, su uso en castellano u otros idiomas producirá resultados no fiables.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; es un bloqueante para cualquier despliegue en producción.
- No hay información sobre el esquema de etiquetas (número y nombres de las clases), lo que obliga a inspeccionar la configuración del modelo antes de usarlo.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión real y no puede compararse objetivamente con alternativas.
- El modelo tiene cero descargas y cero likes, sin validación por parte de la comunidad; debe tratarse como un experimento no contrastado.
- No se documenta el proceso de entrenamiento ni el dataset, lo que dificulta la reproducibilidad y la auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erolunss/berturk-eticaret-duygu-analizi
- Paper de referencia citado en los tags (ML Impact Calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Documentación de BERTurk (modelo base presumible): https://huggingface.co/dbmdz/bert-base-turkish-cased
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
