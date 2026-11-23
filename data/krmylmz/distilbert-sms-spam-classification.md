# krmylmz/distilbert-sms-spam-classification

## Resumen

`krmylmz/distilbert-sms-spam-classification` es un modelo de clasificación de texto publicado en Hugging Face por el usuario krmylmz. Por el nombre y la arquitectura declarada, se trata de un ajuste fino (fine-tuning) de DistilBERT, la versión destilada de BERT presentada por Sanh et al. en 2019, orientado a la detección de mensajes SMS de tipo spam. El repositorio contiene pesos en formato safetensors y está etiquetado para su uso con la librería `transformers` y el pipeline `text-classification`.

El modelo cuenta con 66.955.010 parámetros totales, un tamaño coherente con la arquitectura DistilBERT base (6 capas, 768 dimensiones ocultas, vocabulario de aproximadamente 30.000 tokens). El repositorio ocupa 0,3 GB, lo que sugiere pesos en precisión completa o media junto con el tokenizador. No obstante, la model card es una plantilla autogenerada sin contenido sustantivo: no documenta el conjunto de datos de entrenamiento, hiperparámetros, métricas ni procedencia.

La relevancia de este modelo es limitada y debe evaluarse con cautela. Se trata de un artefacto de ajuste fino de propósito muy concreto (clasificación binaria de spam en SMS) sin documentación, sin métricas publicadas, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de pipeline de clasificación ligero y desplegable en CPU, pero no es recomendable como componente crítico en producción sin una validación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT), 6 capas, 768 dimensiones ocultas |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas y 768 dimensiones ocultas obtenido mediante destilación por conocimiento de BERT-base. DistilBERT reduce el número de parámetros de BERT-base en aproximadamente un 40 % y conserva alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje, con una latencia de inferencia notablemente menor. El modelo se ha ajustado para una tarea de clasificación de secuencias, presumiblemente binaria (spam / no spam), lo que añade una cabeza de clasificación sobre la representación del token `[CLS]`.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, la composición del corpus, si se aplicó balanceo de clases, ni si se emplearon técnicas de aumento de datos. Tampoco se documentan hiperparámetros de ajuste fino (tasa de aprendizaje, número de épocas, tamaño de lote) ni si hubo validación cruzada. La model card es la plantilla por defecto de Hugging Face sin completar, por lo que todos los campos de entrenamiento figuran como `[More Information Needed]`.

## Capacidades

- Clasificación de texto de secuencias cortas, presumiblemente en categorías binarias (spam / no spam) orientadas a mensajes SMS.
- Procesamiento de entradas de hasta 512 tokens, suficiente para mensajes SMS convencionales (que rara vez superan los 160 caracteres).
- Inferencia ligera en CPU, adecuada para entornos con recursos limitados.
- Compatibilidad con el pipeline `text-classification` de `transformers` y con Text Embeddings Inference (según los tags del repositorio).
- No dispone de capacidad de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el idioma de entrenamiento es desconocido.

## Casos de uso

- Filtrado de spam en pasarelas SMS: el modelo puede integrarse como clasificador previo a la entrega de mensajes en un gateway de SMS, descartando aquellos con alta probabilidad de spam antes de que lleguen al usuario final. Su tamaño reducido permite procesar lotes grandes en CPU con baja latencia.
- Moderación de comentarios cortos en foros o chats: aunque entrenado presumiblemente con SMS, el modelo puede servir como línea base para clasificar mensajes breves en comunidades online, siempre que se valide su comportamiento en ese dominio.
- Enriquecimiento de pipelines de datos: como paso de etiquetado automático para filtrar corpus de mensajes cortos antes de un análisis posterior (por ejemplo, extracción de entidades o análisis de sentimiento).
- Prototipado rápido de sistemas antispam: sirve como punto de partida para equipos que necesiten un clasificador funcional en horas y no dispongan de infraestructura GPU.
- Docencia y experimentación: ejemplo práctico de ajuste fino de DistilBERT para tareas de clasificación, útil en cursos de NLP por su ligereza y su integración directa con `transformers`.
- Despliegue en dispositivos edge: al requerir poca memoria (del orden de cientos de MB en FP32 y menos de 100 MB cuantizado a int8), puede ejecutarse en entornos con recursos restringidos, como Raspberry Pi o contenedores pequeños.
- Detección de campañas de phishing por SMS: como componente de un sistema de alertas que marque mensajes sospechosos para revisión humana, complementando reglas heurísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, precision, recall, F1) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en FP32 (66,9 M de parámetros × 4 bytes), unos 134 MB en FP16 y alrededor de 67 MB en int8.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050, RTX 3050, T4, etc.).
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU. El despliegue en CPU es viable para volúmenes moderados de peticiones.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (según los tags), y exportación a ONNX para inferencia optimizada. La compatibilidad con llama.cpp u Ollama no aplica, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles. En CPU moderna, un modelo DistilBERT de este tamaño suele procesar decenas de secuencias por segundo en lotes pequeños, pero no se han publicado mediciones para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krmylmz/distilbert-sms-spam-classification | 66,9 M | 512 tokens (arquitectura) | Clasificación spam SMS | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 512 tokens | Modelo base (MLM) | MIT | Hugging Face, ampliamente usado |

La comparación se limita a la arquitectura y al tamaño, ya que no hay métricas de rendimiento publicadas para el modelo analizado. Frente a los modelos base citados, este ajuste está especializado en una tarea concreta, pero carece de la documentación, licencia clara y comunidad de uso que sí ofrecen los modelos de referencia de Hugging Face.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al desconocerse el corpus de entrenamiento, no puede evaluarse el sesgo lingüístico, geográfico o demográfico.
- Riesgo de alucinación: no aplica en sentido estricto (no es generativo), pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, sin métricas publicadas que permitan cuantificarlo.
- Limitaciones de contexto o idioma: se desconoce el idioma de entrenamiento; el uso en idiomas distintos del original puede degradar gravemente el rendimiento. La ventana de 512 tokens limita el análisis de mensajes largos.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto con el autor.
- Caveats para producción: ausencia total de documentación de entrenamiento, evaluación y procedencia; cero descargas y cero likes sugieren que el modelo no ha sido validado por la comunidad. Se recomienda una evaluación independiente sobre un conjunto de validación propio antes de cualquier uso real.
- Riesgo de deriva (drift): al desconocerse la fecha y la distribución de los datos de entrenamiento, el modelo puede no reflejar patrones actuales de spam.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krmylmz/distilbert-sms-spam-classification
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
