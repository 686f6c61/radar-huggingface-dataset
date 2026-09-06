# haulai/mizo-ner-xlmr

## Resumen

`haulai/mizo-ner-xlmr` es un modelo de reconocimiento de entidades nombradas (NER) para la lengua mizo (código ISO `lus`), una lengua tibeto-birmana hablada principalmente en el estado de Mizoram (India) y en regiones vecinas de Myanmar. Desarrollado por el autor `haulai`, el modelo resuelve la ausencia de recursos de procesamiento de lenguaje natural para lenguas de bajos recursos, proporcionando una herramienta de etiquetado de entidades que puede integrarse en flujos de análisis de texto en mizo.

Se trata de un ajuste fino del encoder transformer `xlm-roberta-base` de Facebook AI, con 277.470.743 parámetros y una longitud de contexto heredada de 512 tokens. El modelo está publicado con licencia CC-BY-4.0 y sus pesos se distribuyen en formato `safetensors`. Su relevancia radica en que es uno de los pocos recursos publicados para NER en mizo, aunque su rendimiento real debe evaluarse con cautela debido a la naturaleza de las etiquetas de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base `xlm-roberta-base`) |
| Parametros totales | 277.470.743 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de `xlm-roberta-base`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mizo (lus) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del encoder transformer `xlm-roberta-base`, conservando su arquitectura original: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario multilingüe. La tarea se aborda como clasificación de tokens, es decir, cada token de entrada se etiqueta con una categoría de entidad (persona, lugar, organización, etc.) o como no-entidad.

El entrenamiento se realizó sobre el corpus Mizo NER, compuesto por 441.178 oraciones con etiquetas *silver-standard*. Estas etiquetas se generaron mediante proyección automática a partir de recursos existentes, no mediante anotación manual, lo que condiciona la calidad del aprendizaje. No se ha documentado el uso de técnicas de RLHF ni DPO; se trata de un ajuste fino supervisado estándar. Tampoco se mencionan innovaciones arquitectónicas o de entrenamiento más allá del fine-tuning convencional.

## Capacidades

- Token classification para NER en mizo: identifica entidades nombradas en texto en lengua mizo, incluyendo personas, lugares y organizaciones.
- Integración sencilla con el pipeline `token-classification` de Hugging Face Transformers, con soporte para `aggregation_strategy="simple"`.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste fino está especializado exclusivamente en mizo.
- No soporta generación de texto, razonamiento, programación, matemáticas, visión, audio, tool calling ni agentes: es un modelo encoder para clasificación de tokens.

## Casos de uso

- Extracción de entidades en documentos administrativos o legales en mizo: el modelo puede procesar oficios, resoluciones o actas en mizo para extraer nombres de personas, lugares y organizaciones, facilitando la indexación y búsqueda documental.
- Análisis de noticias en medios mizo: permite identificar automáticamente personas y lugares mencionados en artículos periodísticos, lo que resulta útil para construir sistemas de monitorización de actualidad en la región.
- Construcción de bases de conocimiento cultural e histórico: a partir de textos etnográficos, crónicas o relatos orales transcritos en mizo, el modelo extrae entidades para alimentar repositorios estructurados.
- Monitorización de redes sociales en mizo: puede etiquetar menciones a organizaciones o figuras públicas en publicaciones y comentarios, habilitando análisis de sentimiento o detección de eventos.
- Preprocesamiento para traducción automática: antes de traducir texto mizo a otros idiomas, el modelo identifica entidades para preservarlas correctamente en la traducción, evitando transliteraciones incorrectas.
- Investigación en lingüística computacional: el modelo sirve como herramienta de anotación automática de corpus en mizo para estudios de morfología, sintaxis o sociolingüística, reduciendo el coste de la anotación manual.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Micro F1 (test set silver) | 0.8739 |
| F1 (300 oraciones anotadas por hablantes nativos) | 0.6078 |

Los valores de *silver* reflejan el acuerdo con la proyección automática de etiquetas, no la precisión real. El rendimiento contra anotaciones humanas es sustancialmente inferior, como advierte el autor. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 1.1 GB (según el tamaño del repositorio); en FP16, alrededor de 0.55 GB. Con secuencias de hasta 512 tokens y un batch pequeño, 2 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060 o superior. También puede ejecutarse en CPU para inferencia con baja latencia.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 4 GB o más es totalmente viable.
- Opciones de despliegue: Hugging Face Transformers (pipeline), ONNX Runtime o exportación a TorchScript. No se recomienda vLLM ni llama.cpp, ya que están orientados a modelos decodificadores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se ha identificado ningún modelo comparable específico para NER en mizo en la información disponible. El modelo base `xlm-roberta-base` es la referencia previa, pero sin ajuste fino no realiza NER en mizo.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son *silver-standard*, por lo que el rendimiento real medido contra anotaciones humanas es significativamente menor: F1 0.6078 frente a 0.8739.
- El modelo se entrenó únicamente con oraciones que contienen entidades, por lo que su comportamiento en textos con pocas o ninguna entidad no está probado y podría degradarse.
- Riesgo de alucinación: al ser un modelo de NER, puede etiquetar tokens como entidades cuando no lo son, especialmente en dominios no representados en el corpus.
- Sesgos potenciales: el corpus puede reflejar sesgos geográficos, culturales o de género de la región donde se habla mizo, lo que afectaría a la generalización.
- Limitación de idioma: el ajuste fino está especializado en mizo; aunque el modelo base es multilingüe, su capacidad en otros idiomas se ve reducida.
- Longitud de contexto limitada a 512 tokens: no es apto para documentos largos sin segmentación previa.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero es necesario verificar los requisitos de atribución en cada despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haulai/mizo-ner-xlmr
- Dataset Mizo NER: https://huggingface.co/datasets/haulai/mizo-ner
- Repositorio de código: https://github.com/thangkhanhau/mizo-ner
