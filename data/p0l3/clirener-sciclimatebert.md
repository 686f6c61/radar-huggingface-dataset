# P0L3/CliReNER-sciclimatebert

## Resumen

CliReNER-sciclimatebert es un modelo de reconocimiento de entidades nombradas (NER) de tipo SpanMarker, desarrollado por el usuario P0L3 y publicado en HuggingFace. Está especializado en la extracción de entidades en el dominio de la investigación sobre cambio climático y ciencias de la Tierra, con 28 tipos de entidad distintos. El modelo se construye sobre el encoder `P0L3/sciclimatebert`, una variante de SciClimateBERT adaptada al dominio climático.

El modelo aborda un problema concreto: la literatura científica sobre clima y ciencias medioambientales contiene terminología muy específica (fenómenos meteorológicos, ecosistemas, fuentes de energía, organismos, etc.) que los modelos NER genéricos no capturan con precisión. CliReNER-sciclimatebert ofrece una taxonomía de 28 etiquetas diseñada específicamente para este dominio, lo que lo hace relevante para pipelines de extracción de información científica.

Con 82,3 millones de parámetros y una longitud máxima de secuencia de 512 tokens, es un modelo compacto orientado a la inferencia eficiente. Su licencia CC-BY-SA 4.0 permite uso comercial con atribución y compartir-al-igual. La información disponible sobre benchmarks es limitada y procede únicamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpanMarker sobre encoder transformer (SciClimateBERT) |
| Parametros totales | 82.346.525 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |
| Longitud máxima de entidad | 14 palabras |
| Número de etiquetas | 28 tipos de entidad |
| Librería | span-marker |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SpanMarker, un enfoque de NER que combina un encoder transformer con una cabeza de clasificación de spans. En lugar de etiquetar token a token (BIO), SpanMarker representa cada entidad candidata mediante los embeddings de sus tokens de inicio y fin, junto con marcadores de posición externos, y clasifica cada span como una de las etiquetas objetivo o como "no entidad". El encoder subyacente es `P0L3/sciclimatebert`, una variante de SciClimateBERT adaptada al dominio del cambio climático y las ciencias de la Tierra. La longitud máxima de entidad es de 14 palabras.

El entrenamiento se realizó sobre los datasets `P0L3/CliReNER_v_1_1_28_SILVER` y `P0L3/CliReNER_v_1_1_28_GOLD`, que contienen anotaciones para 28 tipos de entidad del dominio climático. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a NER). El modelo fue generado con el `span_marker_trainer`, según los tags del repositorio.

## Capacidades

- Reconocimiento de entidades nombradas (NER) de grano fino en textos científicos sobre cambio climático y ciencias de la Tierra.
- Extracción de 28 tipos de entidad: Asset, Body Part, Body of Water, Chemical, Disease, Ecosystem, Energy Source, Field of Study, Geographical Feature, Intellectual Artefact, Location, Mathematical Expression, Measuring Device, Meteorological Phenomenon, Method, Natural Disaster, Natural Phenomenon, Organism, entre otras.
- Procesamiento de textos de hasta 512 tokens por secuencia.
- Detección de entidades de hasta 14 palabras de longitud.
- Especialización en vocabulario técnico del dominio climático (p. ej., "climatic variability", "algal blooms", "fossil fuels", "Zalophus californianus").
- No soporta tool calling ni function calling (es un modelo de token-classification).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de información de literatura científica: el modelo puede procesar abstracts y artículos completos (en fragmentos de 512 tokens) para extraer entidades como fenómenos meteorológicos, ecosistemas y organismos, facilitando la construcción de bases de conocimiento climático.
- Indexación semántica de repositorios documentales: integrado en pipelines de procesamiento por lotes, permite etiquetar automáticamente miles de documentos científicos con entidades de dominio, mejorando la búsqueda facetada en bibliotecas digitales.
- Construcción de grafos de conocimiento: las entidades extraídas (organismos, ubicaciones, métodos, productos químicos) pueden alimentar grafos que relacionen conceptos climáticos y permitan consultas estructuradas.
- Monitorización de informes medioambientales: el modelo puede procesar informes de organismos como el IPCC o agencias ambientales para detectar menciones a desastres naturales, contaminantes o cambios en ecosistemas.
- Análisis de revisiones sistemáticas: en proyectos de síntesis de evidencia, el modelo ayuda a identificar entidades relevantes (métodos, enfermedades, organismos) en grandes corpus de estudios, reduciendo el trabajo manual de cribado.
- Enriquecimiento de metadatos en repositorios de datos: aplicado a descripciones de datasets y publicaciones, permite generar etiquetas automáticas de entidades para mejorar la descubribilidad de recursos científicos.
- Preprocesamiento para modelos de lenguaje: las entidades extraídas pueden usarse como características adicionales o para construir prompts enriquecidos en sistemas de question answering sobre clima.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Tarea | F1 | Precision | Recall |
|---|---|---|---|---|
| CliReNER_silver (eval) | Named Entity Recognition | 0,5864 | 0,5860 | 0,5868 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores anteriores corresponden únicamente al conjunto de evaluación del dataset silver y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 330 MB solo para pesos (82,3 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB para secuencias de 512 tokens.
- VRAM estimada en FP16: aproximadamente 165 MB para pesos, con un total inferior a 500 MB incluyendo activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o superior pueden ejecutar el modelo con holgura. También funciona en CPU para inferencia por lotes de baja latencia.
- Cabe en cualquier GPU consumer, incluidas GTX 1650 (4 GB) o incluso en CPU.
- Opciones de despliegue: la librería `span-marker` (basada en PyTorch/Transformers) es la vía principal. También puede exportarse a ONNX para inferencia optimizada. No se dispone de soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de token-classification y no generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera un throughput alto en GPU (cientos de secuencias por segundo en lotes), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CliReNER-sciclimatebert | 82,3 M | 512 tokens | NER dominio climático (28 etiquetas) | CC-BY-SA 4.0 | HuggingFace |
| SciBERT (base) | ~110 M | 512 tokens | Modelo de lenguaje científico (no NER específico) | Apache 2.0 | HuggingFace |
| ClimateBERT | ~110 M | 512 tokens | Modelo de lenguaje climático (no NER específico) | CC-BY-NC 4.0 (según versión) | HuggingFace |
| BERT-base NER (genérico) | ~110 M | 512 tokens | NER genérico (p. ej., CoNLL-2003) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo directo con estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia; los benchmarks de CliReNER-sciclimatebert solo cubren su propio dataset de evaluación.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- La longitud máxima de secuencia es de 512 tokens, lo que obliga a fragmentar documentos largos y puede perder entidades que crucen fronteras de fragmentos.
- La longitud máxima de entidad es de 14 palabras; entidades más largas no serán detectadas correctamente.
- Los resultados de benchmarks (F1 ~0,586) son moderados y no han sido verificados de forma independiente; el rendimiento en datos reales fuera del dominio de entrenamiento puede ser inferior.
- Riesgo de alucinación: como todo modelo NER, puede generar falsos positivos (spans clasificados como entidad sin serlo) y falsos negativos, especialmente con terminología ambigua o fuera del dominio climático.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al entrenarse sobre literatura científica, puede tener un sesgo hacia el vocabulario y las convenciones de escritura de ese género.
- La licencia CC-BY-SA 4.0 exige atribución y que las obras derivadas se compartan bajo la misma licencia; es importante revisar las implicaciones para uso comercial (permitido con condiciones).
- El modelo tiene muy pocas descargas (6) y likes (0), lo que sugiere una validación comunitaria limitada.
- No es un modelo generativo: no puede usarse para texto, código, matemáticas ni razonamiento; su única función es el etiquetado de spans.
- La fecha de creación (2026-03-23) y actualización (2026-11-05) son posteriores a la fecha actual en el momento de redactar esta ficha, lo que puede indicar un error en los metadatos o una fecha futura; se recomienda verificar la vigencia del repositorio.

## Enlaces

- [HuggingFace: P0L3/CliReNER-sciclimatebert](https://huggingface.co/P0L3/CliReNER-sciclimatebert)
- [Modelo base: P0L3/sciclimatebert](https://huggingface.co/P0L3/sciclimatebert)
- [Dataset: P0L3/CliReNER_v_1_1_28_SILVER](https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_SILVER)
- [Dataset: P0L3/CliReNER_v_1_1_28_GOLD](https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_GOLD)
- [Repositorio SpanMarkerNER](https://github.com/tomaarsen/SpanMarkerNER)
