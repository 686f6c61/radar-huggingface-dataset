# institutional/institutional-books-topic-classifier-bert

## Resumen

El modelo `institutional/institutional-books-topic-classifier-bert` es un clasificador de texto basado en BERT, desarrollado por la Institutional Data Initiative (IDI) de la Harvard Law School Library. Se entrenó como parte del proceso de análisis y post-procesamiento para la publicación del dataset Institutional Books 1.0, una colección de 242 mil millones de tokens procedentes de los fondos de la biblioteca de Harvard. Su función es asignar automáticamente un tema, derivado del primer nivel del esquema de clasificación de la Library of Congress, a cada volumen individual.

El modelo parte de `google-bert/bert-base-multilingual-uncased` y se ajustó mediante AutoTrain con 80.830 muestras de entrenamiento y 5.000 de test. Tiene aproximadamente 167 millones de parámetros y una arquitectura transformer encoder. Aunque el modelo base es multilingüe, la información disponible no especifica qué idiomas soporta de forma efectiva. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en que ofrece una solución práctica y reproducible para la catalogación automática de colecciones bibliotecarias, un problema común en instituciones culturales y de conocimiento. Al estar publicado con pesos en safetensors y ser compatible con la librería `transformers`, se puede integrar fácilmente en pipelines de procesamiento de metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) |
| Parametros totales | 167.371.796 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (estándar de BERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en la variante `bert-base-multilingual-uncased`, que utiliza un encoder transformer con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. La longitud de contexto típica de esta arquitectura es de 512 tokens, aunque no se ha confirmado explícitamente para este ajuste. Al ser un modelo denso, todos los parámetros se activan en cada inferencia.

El entrenamiento se realizó mediante AutoTrain, una herramienta de Hugging Face para fine-tuning automático. Se emplearon 80.830 muestras para el conjunto de entrenamiento, 5.000 para el conjunto de test y 1.000 adicionales para evaluación posterior al entrenamiento. Los datos consisten en metadatos de libros (título, autor, año, idioma y nota general) formateados como texto plano, junto con la etiqueta de categoría correspondiente. No se menciona el uso de RLHF, DPO ni otras técnicas de aprendizaje por refuerzo; se trata de un ajuste supervisado estándar para clasificación multiclase.

## Capacidades

- Clasificación de temas de libros en 20 categorías basadas en el primer nivel del esquema de clasificación de la Library of Congress (por ejemplo, SCIENCE, LAW, MEDICINE, etc.).
- Entrada flexible: acepta metadatos de libro en formato texto con campos opcionales (título, autor, año, idioma, nota general).
- Salida con puntuación de probabilidad para cada categoría, lo que permite umbrales de confianza.
- Inferencia rápida y ligera: al ser un BERT base, es adecuado para procesamiento por lotes de grandes colecciones.
- Compatible con la librería `transformers` mediante el pipeline `text-classification`.
- No tiene capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Catalogación automática de bibliotecas: el modelo puede asignar temas a miles de volúmenes de forma automática, reduciendo el trabajo manual de catalogadores. Se usaría alimentando los metadatos de cada libro en el formato requerido y recopilando la categoría predicha.
- Organización de colecciones digitales: para repositorios institucionales que necesitan agrupar obras por disciplina, el clasificador ofrece una taxonomía estandarizada basada en la Library of Congress.
- Enriquecimiento de metadatos: bibliotecas con registros incompletos pueden completar el campo de materia utilizando este modelo, mejorando la búsqueda y el descubrimiento.
- Filtrado por temas en proyectos de investigación: investigadores que trabajan con el dataset Institutional Books pueden seleccionar subconjuntos por categoría (por ejemplo, solo obras de ciencia o medicina) para análisis específicos.
- Etiquetado para preservación digital: instituciones que digitalizan fondos históricos pueden clasificar los documentos antes de su publicación en línea, facilitando la navegación.
- Evaluación de colecciones: bibliotecas pueden obtener una distribución temática de sus fondos para planificar adquisiciones o identificar áreas de especialización.

## Benchmarks y rendimiento

El autor proporciona métricas de validación y un benchmark posterior al entrenamiento:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9694 |
| F1 macro | 0.9614 |
| F1 micro | 0.9694 |
| F1 weighted | 0.9693 |
| Precision macro | 0.9680 |
| Precision micro | 0.9694 |
| Recall macro | 0.9561 |
| Recall micro | 0.9694 |
| Loss | 0.1574 |

Además, en un benchmark posterior con 1.000 muestras reservadas, se obtuvo una precisión del 97,8% (978/1000). No se han publicado comparaciones con otros clasificadores de temas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 167 millones de parámetros. En FP32 (~670 MB) requiere aproximadamente 1-2 GB de VRAM para inferencia; en FP16 (~335 MB) baja a menos de 1 GB, y en cuantización INT8 (~167 MB) puede ejecutarse en GPUs muy modestas.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1060, RTX 2060, T4) es suficiente. También puede ejecutarse en CPU para lotes pequeños, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio y bajo.
- Opciones de despliegue: es compatible con `transformers` pipeline, `text-embeddings-inference` (mencionado en los tags), y puede exportarse a ONNX o TensorRT para optimización. También puede servirse con vLLM o TGI, aunque para clasificación de texto simple el pipeline estándar es suficiente.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un BERT base en una GPU T4 puede procesar cientos de ejemplos por segundo en lotes.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros clasificadores de temas de libros para comparar directamente. El modelo más cercano sería el propio `google-bert/bert-base-multilingual-uncased` sin fine-tuning, que no es capaz de clasificar temas sin entrenamiento adicional. Otras alternativas genéricas de clasificación de texto (por ejemplo, `distilbert-base-uncased` fine-tuned en datasets como AG News) no están orientadas a la taxonomía de la Library of Congress. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Solo clasifica en las 20 categorías predefinidas; no cubre todas las subclases de la Library of Congress.
- La entrada se limita a metadatos (título, autor, año, idioma, nota general); no procesa el texto completo del libro, por lo que la clasificación puede ser menos precisa para obras con títulos ambiguos.
- Los datos de entrenamiento proceden de la colección de Harvard, lo que puede introducir sesgos hacia los tipos de obras presentes en esa biblioteca (por ejemplo, predominio de obras en inglés o de ciertas épocas).
- No es un modelo generativo; no produce descripciones ni resúmenes.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los datos si los utiliza para entrenar otros modelos.
- La longitud de contexto no está documentada explícitamente; si se superan los 512 tokens (límite típico de BERT), el texto se truncará.

## Enlaces

- HuggingFace: https://huggingface.co/institutional/institutional-books-topic-classifier-bert
- Informe técnico (arXiv): https://arxiv.org/abs/2506.08300
- Repositorio de código: https://github.com/instdin/institutional-books-pipeline
- Colección Institutional Books: https://huggingface.co/collections/instdin/institutional-books-68366258bfb38364238477cf
- ModelScope (espejo): https://www.modelscope.cn/models/institutional/institutional-books-topic-classifier-bert
