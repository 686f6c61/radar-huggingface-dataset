# AmineHM/tunisian-derja-sentiment

## Resumen

`AmineHM/tunisian-derja-sentiment` es un modelo de clasificación de texto publicado en HuggingFace por el usuario AmineHM. Por su nombre y su pipeline (`text-classification`), está orientado al análisis de sentimiento en derja tunecina, la variedad dialectal del árabe hablada en Túnez. El repositorio contiene pesos en formato safetensors con 162.842.882 parámetros, lo que sitúa al modelo en la franja de los BERT-base (aproximadamente 110 millones de parámetros) o BERT-large (aproximadamente 340 millones), aunque la cifra exacta no coincide con ninguno de los dos, por lo que la arquitectura base concreta no está confirmada.

La relevancia de este modelo radica en su especialización lingüística: la derja tunecina es un dialecto con escasa representación en los corpus de entrenamiento de los grandes modelos multilingües, y los recursos etiquetados para análisis de sentimiento en esta variedad son limitados. Un clasificador dedicado puede ofrecer un rendimiento superior al de un modelo multilingüe genérico en esta tarea concreta, y su tamaño moderado permite desplegarlo en hardware asequible.

No obstante, la model card del autor está generada automáticamente y no contiene información sustantiva: no se documentan los datos de entrenamiento, el proceso de ajuste fino, las métricas de evaluación ni las limitaciones. El modelo registra cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de una publicación reciente y sin validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según el tag `bert`; variante concreta no disponible) |
| Parametros totales | 162.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los modelos BERT suelen operar a 512 tokens, pero no se confirma para este modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre del modelo, presumiblemente derja tunecina y posiblemente árabe estándar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `bert` en el repositorio indica que el modelo se basa en la arquitectura Transformer encoder-only de BERT, diseñada para tareas de comprensión del lenguaje como la clasificación de secuencias. El número de parámetros (162,8 millones) no corresponde exactamente a BERT-base (110 millones) ni a BERT-large (340 millones); podría tratarse de una variante con vocabulario ampliado, de un modelo tipo XLM-R o de un ajuste fino con una cabeza de clasificación adicional. Esta circunstancia no está documentada por el autor.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset, la existencia de ajuste fino supervisado con etiquetas de sentimiento, ni sobre técnicas de regularización o aumento de datos. La model card no incluye hiperparámetros, régimen de precisión ni detalles del procedimiento de ajuste. Tampoco se documenta si el modelo parte de un checkpoint multilingüe preentrenado o de un modelo específico para árabe.

## Capacidades

- Clasificación de texto para análisis de sentimiento, presumiblemente con etiquetas de polaridad (positivo, negativo, neutro), aunque el número y la definición exacta de las clases no están documentados.
- Procesamiento de texto en derja tunecina, una variedad dialectal del árabe con ortografía no estandarizada y fuerte influencia del francés, el italiano y el bereber.
- Integración con la librería `transformers` de HuggingFace mediante `pipeline("text-classification")`.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con endpoints de HuggingFace (`endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, lo cual es coherente con un modelo encoder-only de clasificación.

## Casos de uso

- Monitorización de redes sociales: clasificar tuits y publicaciones en derja tunecina para medir la percepción pública de marcas, productos o figuras políticas. El modelo está especializado en esta variedad, lo que reduce los errores de un clasificador multilingüe genérico.
- Análisis de opiniones de clientes: procesar reseñas y comentarios de usuarios tunecinos en plataformas de comercio electrónico, donde la derja escrita convive con el francés y el árabe estándar.
- Moderación de comunidades: detectar contenido negativo o tóxico en foros y grupos de mensajería tunecinos, siempre que las etiquetas del modelo permitan distinguir esa categoría (no confirmado).
- Investigación en lingüística de corpus: etiquetar automáticamente grandes volúmenes de texto en derja para estudios sociolingüísticos o para construir datasets anotados de sentimiento.
- Enrutamiento de atención al cliente: clasificar la polaridad de los mensajes entrantes en un sistema de soporte para priorizar quejas o escalar casos negativos a agentes humanos.
- Análisis de mercado regional: agregar la opinión sobre productos o servicios en comunidades tunecinas de internet como señal complementaria a los estudios de mercado tradicionales.
- Etiquetado asistido de datos: usar el modelo como preanotador en un flujo de anotación humana, reduciendo el coste de construir nuevos datasets de sentimiento en derja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, precisión, recall), ni conjuntos de validación, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 650 MB para los pesos (162,8 millones de parámetros × 4 bytes), más el espacio para activaciones y el tokenizador; en la práctica, menos de 1,5 GB en total.
- VRAM estimada en fp16: aproximadamente 325 MB para los pesos; en la práctica, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, RTX 3060, RTX 4090 o A100 funcionan sin problema; el modelo también puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Cabe holgadamente en GPU de consumo, incluidas las integradas de portátiles con memoria compartida, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (Python), Text Embeddings Inference (TEI) de HuggingFace, endpoints de HuggingFace Inference, y potencialmente ONNX Runtime u otras herramientas de optimización, aunque no se documenta soporte explícito para llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera un throughput alto (cientos o miles de peticiones por segundo en GPU moderna con batching), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmineHM/tunisian-derja-sentiment | 162,8 M | no disponible | Clasificación de sentimiento en derja | no disponible | HuggingFace |
| CAMeL-Lab/bert-base-arabic-camelbert-da | ~110 M | 512 tokens (típico) | Comprensión del árabe (incluye dialectos) | no disponible | HuggingFace |
| UBC-NLP/MARBERT | ~163 M | 512 tokens (típico) | Comprensión del árabe y dialectos | no disponible | HuggingFace |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens (típico) | Análisis de sentimiento multilingüe | no disponible | HuggingFace |

La comparación con MARBERT es la más pertinente por el número de parámetros: MARBERT es un modelo BERT entrenado sobre grandes volúmenes de árabe y dialectos, y podría servir como alternativa más documentada y validada, aunque no está especializado en derja ni en sentimiento. Los modelos de Cardiff NLP ofrecen análisis de sentimiento multilingüe con mayor cobertura de idiomas, pero menor especialización dialectal. No hay datos de rendimiento comparativo disponibles para este modelo.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación; no es posible verificar la calidad del modelo.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere contactar con el autor o asumir el riesgo legal.
- No se documentan los sesgos del modelo. Los modelos entrenados en dialectos con ortografía no estandarizada pueden mostrar sesgos hacia las convenciones ortográficas del corpus de entrenamiento y degradarse ante variaciones de escritura (arabizi, transliteración, mezcla con francés).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas con alta confianza en textos ambiguos o fuera de dominio.
- El modelo registra cero descargas y cero likes, sin evidencia de uso o validación por parte de la comunidad.
- No se confirma la longitud máxima de secuencia soportada; si se limita a 512 tokens como los BERT estándar, los textos largos requerirán truncamiento o segmentación.
- No se documenta el rendimiento en árabe estándar, francés o code-switching, variedades frecuentes en el contexto tunecino.
- La fecha de creación del repositorio (2026-11-01) es posterior a la fecha actual de referencia, lo que sugiere que podría tratarse de un repositorio reciente o con metadatos inconsistentes; conviene verificar la integridad del modelo antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/AmineHM/tunisian-derja-sentiment
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
