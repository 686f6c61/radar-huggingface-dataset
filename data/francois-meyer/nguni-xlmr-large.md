# francois-meyer/nguni-xlmr-large

## Resumen

Nguni-XLMR-large es un modelo de lenguaje enmascarado (masked language model, MLM) basado en XLM-R-large, adaptado mediante entrenamiento continuo multilingüe (continued pretraining) para las cuatro lenguas nguni del sur de África: isiXhosa, isiZulu, isiNdebele y siswati. Lo desarrolla Francois Meyer junto con colaboradores de varias instituciones, y se publicó en el marco del paper «NGLUEni: Benchmarking and Adapting Pretrained Language Models for Nguni Languages» (LREC-COLING 2024), que recibió el premio al mejor artículo en el taller AfricaNLP de ICLR 2024.

El modelo resuelve el problema de la escasa representación de las lenguas nguni en los modelos preentrenados existentes, que suelen estar dominados por lenguas con muchos recursos. Al adaptar XLM-R-large específicamente a este grupo de lenguas, consigue mejoras significativas en tareas de comprensión del lenguaje natural (NLU) frente a los modelos base, especialmente en las variedades con menos recursos como isiNdebele y siswati. Su relevancia radica en que es una de las pocas adaptaciones lingüísticas focalizadas para lenguas bantú y demuestra que la adaptación a un grupo lingüístico reducido puede superar a modelos multilingües de gran escala.

Arquitectónicamente es un transformer encoder (idéntico a XLM-R-large) con aproximadamente 560 millones de parámetros (no confirmado en la documentación), y su ventana de contexto no se especifica, aunque se asume la estándar de XLM-R (512 tokens). Está disponible bajo licencia MIT y su formato de pesos es el estándar de la librería transformers de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R-large) |
| Parametros totales | No disponible (heredados de XLM-R-large, ~560M estimados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (probablemente 512, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | isiXhosa (xh), isiZulu (zu), isiNdebele (nr), siswati (ss) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente .bin o .safetensors de PyTorch) |

## Arquitectura y entrenamiento

Nguni-XLMR-large parte de los pesos de XLM-R-large y se somete a un entrenamiento continuo multilingüe con datos de las cuatro lenguas nguni. El objetivo de entrenamiento es el enmascarado de tokens (MLM), similar al de BERT y XLM-R. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del corpus ni el número de pasos, pero el paper NGLUEni describe el proceso de adaptación y la evaluación posterior.

La innovación principal reside en la estrategia de adaptación: en lugar de entrenar un modelo desde cero o adaptar un modelo multilingüe genérico, se realiza una adaptación dirigida a un grupo de lenguas tipológicamente relacionadas. Esto permite mejorar el rendimiento en tareas downstream sin necesidad de grandes recursos computacionales, y facilita la transferencia entre lenguas nguni, especialmente hacia las de menor disponibilidad de datos.

## Capacidades

- Relleno de máscaras (fill-mask) en las cuatro lenguas nguni, útil para tareas de modelado del lenguaje y preprocesamiento.
- Fine-tuning para tareas de comprensión del lenguaje natural (NLU) como clasificación de textos, análisis de sentimiento, reconocimiento de entidades nombradas (NER) y etiquetado morfológico.
- Transferencia entre lenguas relacionadas: mejora notable en isiNdebele y siswati cuando se entrena con datos de isiZulu o isiXhosa, gracias a la proximidad lingüística.
- Compatible con la librería transformers de HuggingFace, lo que permite integrarlo fácilmente en pipelines existentes.
- No soporta generación de texto libre, tool calling ni capacidades multimodales; es un modelo encoder puro.

## Casos de uso

- Análisis de sentimiento en redes sociales: se puede fine-tunear el modelo para clasificar opiniones en isiZulu o isiXhosa, muy útiles para monitorizar la percepción de marcas o eventos en Sudáfrica.
- Reconocimiento de entidades nombradas (NER): extracción de nombres de personas, lugares y organizaciones en textos nguni, aplicable a la gestión de documentos legales o administrativos.
- Etiquetado morfológico: como se demuestra en el artículo «Neural Morphological Tagging for Nguni Languages», el modelo sirve como base para sistemas de análisis morfológico de estas lenguas, con aplicaciones en lingüística computacional y traducción.
- Clasificación de documentos: categorización automática de artículos, noticias o informes en lenguas nguni, útil para archivos digitales y bibliotecas.
- Búsqueda semántica: al fine-tunear el modelo para generar representaciones de frases, se pueden construir motores de búsqueda que comprendan consultas en isiNdebele o siswati, mejorando la recuperación de información.
- Asistencia en traducción automática: aunque no es un modelo generativo, puede emplearse como encoder en sistemas de traducción neuronal para mejorar la calidad en pares que involucran lenguas nguni.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper NGLUEni (LREC-COLING 2024) presenta una evaluación comparativa en la que Nguni-XLMR-large supera a XLM-R-large y Afro-XLMR-large en las tareas del benchmark NGLUEni, pero no se incluyen cifras concretas en la documentación del modelo ni en la búsqueda web realizada. Se recomienda consultar el artículo original para obtener métricas detalladas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Al estar basado en XLM-R-large, se estima que la inferencia en fp32 requiere aproximadamente 4,5 GB de VRAM (el tamaño del repositorio), por lo que una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4060) es suficiente para inferencia básica.
- Para fine-tuning en tareas downstream, se recomienda una GPU con al menos 16 GB de VRAM (RTX 3090, A100) o usar técnicas de cuantización y LoRA.
- El modelo es compatible con la librería transformers de HuggingFace, por lo que puede desplegarse con vLLM, TGI o simplemente con PyTorch. También se puede ejecutar en CPU, aunque con mayor latencia.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nguni-XLMR-large | ~560M (estimado) | No disponible | 4 lenguas nguni | MIT | Adaptación específica para nguni |
| XLM-R-large | 560M | 512 tokens | 100+ idiomas | MIT | Modelo base multilingüe |
| Afro-XLMR-large | 560M | 512 tokens | 17 lenguas africanas | MIT | Adaptación para lenguas africanas, incluye algunas nguni |
| Nguni-ByT5 | No disponible | No disponible | 4 lenguas nguni | No disponible | Adaptación basada en ByT5, mencionada en el paper |

Según el paper NGLUEni, Nguni-XLMR-large supera a XLM-R-large y Afro-XLMR-large en las tareas del benchmark NGLUEni, especialmente en las lenguas de menores recursos. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de lenguaje enmascarado, no generativo: no puede producir texto libre ni mantener conversaciones.
- Solo cubre cuatro lenguas nguni; no incluye otras lenguas bantú como sesotho o tswana, ni lenguas no bantú de la región.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos de género, etnia o religión presentes en los corpus.
- La ventana de contexto no se ha confirmado; se asume la de XLM-R (512 tokens), lo que limita el procesamiento de documentos largos.
- Aunque la licencia MIT permite uso comercial, se recomienda citar el paper original en publicaciones académicas o productos derivados.
- No se ha verificado su rendimiento en producción; se aconseja evaluar en el dominio específico antes de implementarlo.

## Enlaces

- HuggingFace: https://huggingface.co/francois-meyer/nguni-xlmr-large
- Paper NGLUEni (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1071.pdf
- Repositorio del benchmark NGLUEni: https://github.com/francois-meyer/nglueni
- Página personal del autor: https://francois-meyer.github.io/
- Artículo sobre sondas lingüísticas (arXiv 2505.10081): https://arxiv.org/html/2505.10081v2
- Artículo sobre etiquetado morfológico (arXiv 2505.12949): https://arxiv.org/pdf/2505.12949
