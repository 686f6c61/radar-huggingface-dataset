# KoichiYasuoka/ltgbert-base-belarusian-upos

## Resumen

El modelo `ltgbert-base-belarusian-upos` es un modelo de etiquetado gramatical (part-of-speech tagging) para el idioma bielorruso, desarrollado por Koichi Yasuoka, profesor de humanidades digitales. Se basa en el modelo `HPLT/hplt_bert_base_be`, un BERT preentrenado por el proyecto HPLT (High-Performance Language Technologies) para lenguas europeas de bajos recursos, y se ajusta finamente con el dataset Universal Dependencies para anotar cada palabra con las etiquetas UPOS (Universal Part-Of-Speech) y FEATS (rasgos morfológicos universales).

Este modelo resuelve la tarea de análisis morfosintáctico automático en bielorruso, un idioma con escasos recursos digitales. Su relevancia radica en que proporciona una herramienta específica y de código abierto (licencia Apache 2.0) para tareas de procesamiento del lenguaje natural en este idioma, como la anotación de corpus, la extracción de información o el análisis lingüístico. La arquitectura es un transformer tipo BERT, aunque la variante LTG-BERT introduce modificaciones específicas para el etiquetado de secuencias, y el tamaño del repositorio (0,5 GB) sugiere un modelo de dimensiones medias, probablemente comparable a un BERT base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LTG-BERT (variante de BERT para etiquetado de secuencias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bielorruso (be) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, segun el tamano del repo; no confirmado) |

## Arquitectura y entrenamiento

El modelo se deriva de `HPLT/hplt_bert_base_be`, un BERT base preentrenado por el proyecto HPLT sobre corpus multilingües europeos. La arquitectura LTG-BERT (Language Typology-Guided BERT) es una adaptación de BERT que incorpora información tipológica y se optimiza para tareas de etiquetado de secuencias, como el POS-tagging. El ajuste fino se realizó sobre el dataset Universal Dependencies, que proporciona anotaciones UPOS y FEATS para el bielorruso. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del corpus ni si se emplearon técnicas adicionales como RLHF o DPO. El modelo se publica con código personalizado (`trust_remote_code=True`), lo que indica que la arquitectura o el proceso de inferencia requieren scripts específicos del autor.

## Capacidades

- Etiquetado gramatical (POS-tagging) en bielorruso: asigna a cada palabra una etiqueta UPOS (sustantivo, verbo, adjetivo, etc.) y un conjunto de rasgos morfológicos FEATS (género, número, caso, tiempo, etc.).
- Procesamiento de secuencias de tokens: funciona como un pipeline de token-classification, devolviendo etiquetas agregadas por palabra (con `aggregation_strategy="simple"`).
- Integración con la librería Transformers de Hugging Face mediante el pipeline `"upos"`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo especializado exclusivamente en análisis morfosintáctico.

## Casos de uso

- Anotación automática de corpus en bielorruso: el modelo puede etiquetar grandes volúmenes de texto con UPOS y FEATS, lo que facilita la creación de recursos lingüísticos anotados para investigación o desarrollo de herramientas NLP.
- Análisis lingüístico y estudios tipológicos: investigadores en lingüística computacional pueden usar las etiquetas generadas para estudiar la morfología del bielorruso, comparar patrones con otros idiomas o entrenar modelos derivados.
- Preprocesamiento para sistemas de extracción de información: las etiquetas POS ayudan a identificar entidades, relaciones y estructuras gramaticales en textos bielorrusos, mejorando la precisión de sistemas de búsqueda o minería de texto.
- Mejora de traductores automáticos: el etiquetado morfosintáctico puede servir como característica adicional en modelos de traducción neuronal para bielorruso, especialmente en pares con idiomas morfológicamente ricos.
- Desarrollo de correctores gramaticales: las etiquetas UPOS y FEATS permiten detectar errores de concordancia o uso incorrecto de categorías gramaticales en textos generados por hablantes no nativos o por sistemas automáticos.
- Educación y recursos didácticos: el modelo puede integrarse en plataformas de aprendizaje de bielorruso para proporcionar retroalimentación gramatical automática a estudiantes, mostrando la categoría y rasgos de cada palabra en ejercicios interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de test estándar (p. ej., UD_Belarusian-HSE) ni comparaciones con otros modelos de POS-tagging para bielorruso.

## Requisitos de hardware

- Al ser un modelo de tipo BERT base (tamaño de repositorio 0,5 GB), se estima que requiere entre 1 y 2 GB de VRAM para inferencia en FP32, y menos de 1 GB si se cuantiza a int8 o 4 bits. Sin embargo, no se dispone de datos oficiales de consumo de memoria.
- Es probable que funcione en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, así como en RTX 3060, RTX 4090, etc. También puede ejecutarse en CPU con tiempos de inferencia aceptables para textos cortos.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o mediante el pipeline de Hugging Face. Para entornos ligeros, se podría convertir a GGUF y usar llama.cpp u Ollama, aunque no se ha verificado la compatibilidad.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para POS-tagging en bielorruso. Existen otros modelos de etiquetado para lenguas eslavas (p. ej., para ruso o polaco), pero no se han encontrado alternativas directas para bielorruso con las mismas características. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado únicamente en bielorruso; no es multilingüe y no funcionará correctamente con otros idiomas.
- Al ser un modelo de tamaño reducido y entrenado con un dataset limitado (Universal Dependencies para bielorruso), puede presentar errores en textos con vocabulario técnico, dialectal o poco frecuente.
- No se han documentado sesgos específicos, pero como todo modelo entrenado con corpus, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: en tareas de etiquetado, el modelo puede asignar etiquetas incorrectas a palabras ambiguas o fuera de vocabulario, aunque no genera texto libre.
- La licencia Apache 2.0 permite uso comercial, pero el código personalizado (`trust_remote_code=True`) implica que se ejecuta código del autor, lo que requiere revisión de seguridad en entornos de producción.
- No se proporcionan garantías de rendimiento ni soporte oficial; el modelo es un proyecto académico individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoichiYasuoka/ltgbert-base-belarusian-upos
- Repositorio del autor en GitHub: https://github.com/KoichiYasuoka
- Modelo base HPLT: https://huggingface.co/HPLT/hplt_bert_base_be
- Dataset Universal Dependencies: https://universaldependencies.org/
