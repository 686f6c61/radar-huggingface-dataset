# Rishabh157/unified-multilingual-ner-mdeberta

## Resumen

El modelo `Rishabh157/unified-multilingual-ner-mdeberta` es un sistema de reconocimiento de entidades nombradas (NER) multilingüe de grano fino, desarrollado por Rishabh Kumar. Está construido sobre la base de `microsoft/mdeberta-v3-base`, un encoder Transformer de 278 millones de parámetros, y ha sido ajustado mediante LoRA sobre un corpus combinado de más de 1,53 millones de frases procedentes de tres conjuntos de datos de referencia: WikiANN, MultiCoNER 2023 (v2) y MultiNERD. El resultado es un modelo capaz de clasificar 47 categorías de entidades distintas (95 etiquetas BIO) en 15 idiomas, lo que lo convierte en una herramienta versátil para tareas de extracción de información en contextos multilingües.

La relevancia de este modelo radica en su capacidad para unificar taxonomías heterogéneas de NER en un único clasificador, cubriendo desde categorías genéricas como persona, organización o lugar hasta subtipos especializados como enfermedades, vehículos, obras de arte o entidades mitológicas. Al estar basado en mDeBERTa-v3, hereda las ventajas de este modelo en comprensión contextual multilingüe, y su licencia MIT permite su uso comercial sin restricciones. Con un tamaño de solo 0,6 GB en formato FP16, es ligero y adecuado para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3-base) con cabecera de clasificación de tokens |
| Parametros totales | 278.291.807 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de mDeBERTa: 512 tokens, no confirmado en la documentación) |
| Tipos de cuantizacion | no disponible (se menciona FP16, pero no otras cuantizaciones) |
| Idiomas soportados | en, es, fr, de, it, pt, sv, nl, pl, ru, bn, hi, fa, zh, uk (15 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/mdeberta-v3-base`, un encoder Transformer de 12 capas con tamaño oculto de 768 y un vocabulario de 250 000 subpalabras. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) con rango r=64 y α=64, afectando a los módulos `query_proj`, `key_proj`, `value_proj`, `intermediate.dense` y `output.dense`. Tras el entrenamiento, los pesos LoRA se fusionaron con los pesos base, dando lugar a un modelo denso estándar.

El entrenamiento se realizó sobre un corpus combinado de 1,53 millones de frases procedentes de tres conjuntos de datos: WikiANN (7 idiomas, 3 categorías), MultiNERD (10 idiomas, 15 categorías) y MultiCoNER 2023 v2 (13 idiomas, 33 categorías). La taxonomía resultante unifica 47 categorías de entidades, representadas como 95 etiquetas BIO (Begin, Inside, Outside) en la salida. No se menciona el uso de técnicas de alineamiento como RLHF o DPO; el ajuste es puramente supervisado sobre las anotaciones de los datasets.

## Capacidades

- Reconocimiento de entidades nombradas multilingüe en 15 idiomas, incluyendo lenguas con escrituras no latinas como ruso, bengalí, hindi, ucraniano, farsi y chino.
- Clasificación de 47 categorías de entidades de grano fino, que abarcan desde tipos generales (persona, organización, lugar, tiempo) hasta subtipos especializados (enfermedades, vehículos, obras de arte, entidades mitológicas, compuestos biológicos, etc.).
- Soporte de etiquetado BIO para secuencias de tokens, lo que permite extraer entidades de longitud variable en texto continuo.
- Capacidad de procesar texto mixto multilingüe, útil en documentos que combinan varios idiomas.
- Integración nativa con la librería `transformers` de Hugging Face mediante el pipeline `token-classification`.
- Compatible con despliegue en entornos de inferencia estándar (CPU y GPU) gracias a su tamaño moderado y formato safetensors.

## Casos de uso

- Extracción de entidades en noticias multilingües: el modelo puede identificar personas, organizaciones, lugares y eventos en artículos de prensa de diferentes idiomas, facilitando la agregación y el análisis de información a escala internacional.
- Procesamiento de documentos clínicos: gracias a sus categorías médicas (enfermedades, síntomas, procedimientos, medicamentos), puede utilizarse para extraer información relevante de historiales clínicos o literatura biomédica en varios idiomas.
- Análisis de redes sociales y opiniones: permite detectar menciones a marcas, productos, personas o lugares en comentarios y publicaciones multilingües, útil para monitorización de marca o estudios de mercado.
- Construcción de bases de conocimiento: el modelo puede alimentar pipelines de extracción de relaciones y grafos de conocimiento a partir de textos técnicos o científicos, identificando entidades especializadas como compuestos biológicos o vehículos.
- Traducción asistida y localización: al reconocer entidades en el texto fuente, ayuda a preservar nombres propios y términos especializados durante la traducción automática o la revisión humana.
- Cumplimiento normativo y detección de datos sensibles: puede identificar nombres de personas, organizaciones o ubicaciones en documentos legales o financieros, contribuyendo a tareas de anonimización o verificación de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware específicos.
- Por su tamaño (278M parámetros, ~530 MB en FP16), el modelo es ligero y puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 o superior, e incluso en CPU con memoria suficiente.
- Se puede desplegar con librerías estándar como `transformers` (PyTorch), o mediante servidores de inferencia como vLLM o TGI, aunque al ser un encoder de clasificación de tokens, el uso típico es a través de pipelines de Hugging Face.
- La latencia y el throughput dependen del hardware y del tamaño del lote; no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se sugiere comparar con otros modelos de NER multilingüe como `xlm-roberta-large` o `mbert`, pero no se han incluido datos de rendimiento en la fuente.

## Limitaciones y advertencias

- El modelo se ha entrenado sobre conjuntos de datos específicos (WikiANN, MultiCoNER, MultiNERD) y puede presentar sesgos derivados de la distribución de esos corpus, especialmente en idiomas o dominios poco representados.
- Al ser un modelo de clasificación de tokens, puede cometer errores de segmentación en entidades largas o ambiguas, y su precisión varía según el idioma y la categoría.
- La longitud de contexto no está documentada; si se hereda el límite de mDeBERTa-v3 (512 tokens), los textos más largos deberán dividirse en fragmentos, lo que puede afectar a la coherencia de las entidades que cruzan los límites.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su calidad relativa frente a otros modelos de NER.
- Aunque la licencia MIT permite uso comercial, el usuario debe verificar que los datos de entrenamiento (WikiANN, MultiCoNER, MultiNERD) no impongan restricciones adicionales sobre los modelos derivados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rishabh157/unified-multilingual-ner-mdeberta)
- [Dataset WikiANN](https://huggingface.co/datasets/unimelb-nlp/wikiann)
- [Dataset MultiCoNER v2](https://huggingface.co/datasets/MultiCoNER/multiconer_v2)
- [Dataset MultiNERD](https://huggingface.co/datasets/Babelscape/multinerd)
- [Modelo base mDeBERTa-v3](https://huggingface.co/microsoft/mdeberta-v3-base)
