# s-nlp/enoki-openie-encoder

## Resumen

Enoki OpenIE Encoder es un modelo de extracción de información abierta (OpenIE) desarrollado por el grupo s-nlp, que se basa en ModernBERT-large y emplea una arquitectura de etiquetado iterativo por rejilla (Iterative Grid Labeling, IGL) para extraer tripletas sujeto–relación–objeto a partir de oraciones en inglés. El modelo está diseñado para su uso directo mediante el método `extract()` de la clase `AutoModel` de Transformers, devolviendo tripletas con un nivel de confianza asociado. Su relevancia radica en ofrecer una alternativa ligera y eficiente a los sistemas OpenIE tradicionales basados en reglas o pipelines de Stanford CoreNLP, integrando el aprendizaje profundo en un formato de encoder puro.

Con 395 millones de parámetros, el modelo se posiciona como una opción compacta para tareas de extracción de relaciones, aunque su ventana de contexto por defecto se limita a 128 tokens por oración. Al estar basado en ModernBERT, hereda su arquitectura de transformer bidireccional con atención eficiente, pero no se han publicado detalles sobre los datos de entrenamiento o el proceso de fine-tuning más allá de la referencia al paper de Enoki. El código personalizado requiere `trust_remote_code=True` para su carga, y la licencia no está especificada, lo que debe tenerse en cuenta para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large con Iterative Grid Labeling (IGL) |
| Parametros totales | 395.098.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens por defecto (máximo no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `answerdotai/ModernBERT-large`, un transformer bidireccional optimizado para eficiencia en CPU y GPU, con atención global y local. La capa de etiquetado iterativo por rejilla (IGL) es una arquitectura personalizada incluida en el repositorio del modelo, que procesa la secuencia de tokens para predecir etiquetas de inicio y fin de sujeto, relación y objeto de forma iterativa, permitiendo extraer múltiples tripletas anidadas o incrementales. El decoder OpenIE convierte estas etiquetas en tripletas estructuradas con puntuaciones de confianza.

No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La referencia al paper de Enoki (arXiv:2609.00581) sugiere que el modelo está relacionado con un marco de detección de alucinaciones a múltiples niveles, pero la model card no especifica el proceso de entrenamiento. Se sabe que es un fine-tuning de ModernBERT-large, pero los datos concretos no están disponibles.

## Capacidades

- Extracción de tripletas sujeto–relación–objeto a partir de oraciones en inglés, devolviendo la confianza de cada tripleta.
- Soporte para procesar múltiples oraciones en una sola llamada, pasando una lista al método `extract()`.
- Manejo de tripletas anidadas o incrementales, con control de precisión mediante el parámetro `min_confidence` (recomendado 0.7–0.8 para conjuntos más pequeños y de mayor precisión).
- Integración sencilla con la API de Transformers, requiriendo `trust_remote_code=True` para cargar el código personalizado.
- Alias `extract_triples()` disponible para mayor claridad en el código.
- Interfaz de línea de comandos incluida en el repositorio para ejecución sin escribir código Python.

## Casos de uso

- Construcción de grafos de conocimiento: el modelo puede extraer relaciones de textos técnicos o noticias para poblar bases de datos de conocimiento. Su salida en tripletas con confianza permite filtrar automáticamente las relaciones de baja calidad.
- Análisis de documentos financieros: extraer relaciones como "empresa adquirió activo por cantidad" a partir de informes anuales o comunicados de prensa, facilitando el seguimiento de operaciones corporativas.
- Investigación biomédica: procesar abstracts de artículos científicos para extraer interacciones entre entidades (proteínas, fármacos, enfermedades) y alimentar bases de datos de literatura.
- Automatización de contratos legales: identificar cláusulas que expresen relaciones entre partes (obligaciones, plazos, montos) mediante la extracción de tripletas sujeto-relación-objeto.
- Enriquecimiento de motores de búsqueda: extraer relaciones de páginas web para mejorar la comprensión semántica de los documentos y ofrecer respuestas más precisas a consultas complejas.
- Sistemas de respuesta a preguntas sobre texto estructurado: combinar la salida del modelo con un índice de tripletas para responder preguntas factuales del tipo "quién hizo qué" sobre un corpus determinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye comparaciones con otros sistemas OpenIE (como Stanford OpenIE o AllenAI OpenIE) ni métricas como precisión, recall o F1 sobre conjuntos estándar (p.ej., CaRB, OIE2016). El paper de Enoki podría contener evaluaciones, pero no se ha accedido a él.

## Requisitos de hardware

- Con 395M parámetros, el modelo es relativamente ligero. En FP32, el tamaño de los pesos es aproximadamente 1,6 GB (según el tamaño del repositorio), lo que requiere alrededor de 1,6 GB de VRAM para inferencia sin cuantización.
- En FP16, la VRAM necesaria se reduce a unos 0,8 GB, y en int8 a unos 0,4 GB (estimación razonable, aunque no se han publicado cuantizaciones oficiales).
- Es ejecutable en GPUs de consumo como NVIDIA RTX 3060, RTX 4060 o superiores, así como en Apple Silicon con Metal.
- Para despliegue en producción, se puede servir mediante vLLM o TGI si se exporta el modelo a un formato compatible, pero dado que requiere código personalizado, la opción más directa es usar la API de Transformers con `trust_remote_code=True`.
- La latencia para una oración de 128 tokens debería ser de unos pocos milisegundos en una GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enoki OpenIE Encoder (este) | 395M | 128 tokens | Transformer (ModernBERT) + IGL | no disponible | HuggingFace |
| Stanford OpenIE | N/A | N/A | Pipeline basado en reglas y dependencias | GNU GPL | Standalone Java |
| AllenAI OpenIE (openie-standalone) | N/A | N/A | Sistema basado en reglas y modelos | Apache 2.0 | GitHub |

La comparación directa es difícil porque los sistemas tradicionales de OpenIE no son modelos neuronales con pesos descargables, sino pipelines de procesamiento de lenguaje natural. Enoki ofrece la ventaja de ser un modelo único y ligero que puede integrarse en entornos Python, mientras que Stanford OpenIE requiere una máquina Java con múltiples anotadores. Sin embargo, Stanford OpenIE tiene la ventaja de soportar varios idiomas y no limitarse a 128 tokens por oración.

## Limitaciones y advertencias

- El modelo está diseñado únicamente para texto en inglés; no se ha entrenado ni evaluado en otros idiomas.
- La longitud de contexto por defecto es de 128 tokens, lo que limita su uso en oraciones muy largas o párrafos; no se indica si se puede aumentar el máximo.
- Requiere `trust_remote_code=True` al cargarse, lo que implica ejecutar código arbitrario del repositorio; debe revisarse el código fuente antes de usarlo en entornos de producción.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución de los pesos.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios específicos, por lo que su rendimiento en textos especializados puede ser impredecible.
- El modelo puede devolver tripletas anidadas o redundantes; se recomienda ajustar `min_confidence` para controlar la precisión, pero no hay garantía de cobertura completa.
- No hay información sobre el proceso de entrenamiento (datos, método, evaluación), lo que dificulta la reproducibilidad y la confianza en su rendimiento general.

## Enlaces

- [HuggingFace: s-nlp/enoki-openie-encoder](https://huggingface.co/s-nlp/enoki-openie-encoder)
- [Repositorio de código: s-nlp/Enoki](https://github.com/s-nlp/Enoki)
- [Paper de Enoki (arXiv:2609.00581)](https://arxiv.org/abs/2609.00581)
- [Stanford CoreNLP OpenIE](https://stanfordnlp.github.io/CoreNLP/openie.html)
- [AllenAI openie-standalone](https://github.com/allenai/openie-standalone)
