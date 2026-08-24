# nhuvo/umt5-base-en-vimedner-joint-en2vi

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-joint-en2vi` es un fine-tuning del modelo multilingüe `google/umt5-base` desarrollado por el usuario nhuvo. Está especializado en la tarea conjunta de traducción automática del inglés al vietnamita y reconocimiento de entidades nombradas (NER) en el dominio biomédico. El modelo recibe una frase biomédica en inglés y genera su traducción al vietnamita con etiquetas de entidades en línea, como `<CHEMICAL>...</CHEMICAL>` o `<BIOLOGIC_FUNCTION>...</BIOLOGIC_FUNCTION>`, lo que permite predecir entidades directamente en el idioma de destino sin necesidad de anotaciones previas en el origen.

Se basa en la arquitectura UMT5, una variante multilingüe de T5 propuesta en el artículo *UniMax: Fairer and More Effective Language Sampling for Large-Scale Multilingual Pretraining*. El modelo base tiene 592 millones de parámetros y fue preentrenado con el corpus mC4 mejorado, que abarca 107 idiomas. Este fine-tuning se realizó sobre el dataset `nhuvo/En-ViMedNER`, un recurso bilingüe de textos biomédicos con anotaciones de entidades. Su relevancia radica en que combina traducción y NER en un solo paso, facilitando el procesamiento de literatura médica en vietnamita, un idioma con escasos recursos anotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UMT5 (encoder-decoder transformer, variante multilingüe de T5) |
| Parametros totales | 592.043.520 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UMT5 es un modelo encoder-decoder basado en la arquitectura T5, pero con un tokenizer SentencePiece entrenado con el método UniMax, que mejora el muestreo de idiomas para el preentrenamiento multilingüe. El modelo base `google/umt5-base` fue preentrenado sobre el corpus mC4 mejorado, que contiene 29 billones de caracteres en 107 idiomas. Este fine-tuning se realizó sobre el dataset `nhuvo/En-ViMedNER`, que proporciona pares de frases biomédicas en inglés y vietnamita con etiquetas de entidades. La tarea se formula como una generación de texto a texto: se añade un prefijo `translate English to Vietnamese with inline named entity tags:` y el modelo genera la traducción con las etiquetas integradas. No se han publicado detalles sobre el proceso de entrenamiento (épocas, tamaño de batch, hiperparámetros) en la información disponible.

## Capacidades

- Generacion de texto: traduccion del ingles al vietnamita de frases biomedicas.
- Reconocimiento de entidades nombradas (NER) en el idioma de destino, con etiquetas en linea como `<CHEMICAL>`, `<BIOLOGIC_FUNCTION>`, entre otras.
- NER multilingue: las entidades se predicen directamente en vietnamita sin necesidad de etiquetas en el texto fuente.
- Especializacion en el dominio biomedico: farmacos, compuestos quimicos, funciones biologicas, enfermedades, etc.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de vision o audio.

## Casos de uso

- Traduccion de articulos cientificos biomedicos: el modelo puede traducir resumenes o fragmentos de papers del ingles al vietnamita, anotando automaticamente las entidades biologicas y quimicas, lo que facilita la revision por parte de investigadores locales.
- Extraccion de entidades en historiales clinicos vietnamitas: dado un texto clinico en vietnamita, el modelo puede identificar y etiquetar entidades relevantes, aunque esta tarea requiere adaptacion adicional porque el modelo esta entrenado para traduccion desde ingles.
- Construccion de corpus bilingues anotados: el modelo puede generar automaticamente anotaciones NER en vietnamita para textos ingleses, acelerando la creacion de datasets para otros sistemas de NLP.
- Asistencia a profesionales de la salud: permite a medicos y personal sanitario vietnamita comprender documentacion tecnica o farmacologica en ingles, con las entidades clave resaltadas.
- Integracion en sistemas de informacion hospitalaria: el modelo puede usarse como componente de un pipeline que traduzca y anote informes medicos, mejorando la interoperabilidad entre sistemas en diferentes idiomas.
- Investigacion en NER multilingue: sirve como punto de partida para estudiar la transferencia de entidades entre idiomas y el impacto de la traduccion conjunta en la calidad del etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como BLEU, F1 de NER o comparaciones con otros modelos en la tarea conjunta de traduccion y NER.

## Requisitos de hardware

- El modelo tiene 592 millones de parametros, por lo que en precision fp32 ocupa aproximadamente 2,4 GB (tamano del repositorio). En cuantizacion int8 podria reducirse a unos 1,2 GB, y en int4 a unos 0,6 GB, aunque no se han publicado pesos cuantizados.
- Es viable en GPUs de consumo con al menos 4 GB de VRAM para inferencia en fp32, como una NVIDIA GTX 1650 o RTX 3050. Para mayor comodidad, una RTX 3060 o superior es suficiente.
- En entornos de produccion, puede desplegarse con las librerias de Hugging Face `transformers` (inferencia directa), o mediante servidores de inferencia como vLLM o TGI, siempre que soporten modelos UMT5 (verificar compatibilidad).
- La latencia estimada para una frase corta (menos de 50 tokens) en una GPU moderna es del orden de decenas de milisegundos, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para la tarea conjunta de traduccion ingles-vietnamita con NER biomedico. Como referencia, el modelo base `google/umt5-base` es un modelo multilingue general que no esta especializado en NER ni en el dominio biomedico. Otros modelos de traduccion como NLLB o mT5 podrian adaptarse, pero no hay datos de comparacion directa en esta tarea.

## Limitaciones y advertencias

- El modelo esta especializado en el dominio biomedico y puede tener un rendimiento degradado en textos generales o de otros dominios.
- La calidad de las anotaciones NER depende del dataset de entrenamiento `En-ViMedNER`, que puede contener sesgos o errores de anotacion.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas ruidosas.
- La longitud de contexto no esta documentada; se recomienda verificar el comportamiento con frases largas antes de usarlo en produccion.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se ofrece sin garantias y el autor no proporciona soporte oficial.
- El modelo solo cubre los idiomas ingles y vietnamita; no es adecuado para otros pares de idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhuvo/umt5-base-en-vimedner-joint-en2vi
- Dataset En-ViMedNER: https://huggingface.co/datasets/nhuvo/En-ViMedNER
- Modelo base google/umt5-base: https://huggingface.co/google/umt5-base
- Documentacion de UMT5 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/umt5
- Paper UniMax: https://huggingface.co/papers/2301.12172 (enlace inferido, no verificado en la busqueda)
