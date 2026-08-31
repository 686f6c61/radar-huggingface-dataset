# bratao/PortugueseT5OieAbstractive

## Resumen

`PortugueseT5OieAbstractive` es un modelo encoder-decoder basado en la arquitectura T5, ajustado específicamente para la tarea de extracción abierta de información (Open Information Extraction, OpenIE) en modalidad abstractiva para el idioma portugués. Desarrollado por Bruno (bratao), el modelo genera extracciones binarias en formato `ARG0`, `V`, `ARG1` a partir de frases en portugués, ofreciendo una alternativa compacta a modelos más grandes como Qwen3OIE de 4B y 8B parámetros. Con aproximadamente 783 millones de parámetros (la tesis redondea a 770M), se posiciona como una opción ligera para tareas de extracción de información en entornos con recursos limitados.

El modelo se basa en `PortugueseT5-Instruct`, un T5 de 0.8B parámetros, y ha sido ajustado sobre el conjunto de datos WikiPUD-Portuguese-Abstractive, que contiene 29.026 frases portuguesas y 102.788 extracciones sintéticas generadas con Gemini 2.5 Flash a partir de 2.015 párrafos de Wikipedia. Aunque los resultados reportados en la tesis asociada son prometedores (F1 de 0.5171 en coincidencia léxica), el modelo se publica como un checkpoint de investigación con advertencias sobre la proveniencia del entrenamiento: el estado público del entrenador registra solo el paso 2.000 de un programa nominal de más de 1,2 millones de pasos, lo que sugiere que podría tratarse de un artefacto incompleto o copiado. A pesar de ello, la revisión auditada ha pasado una prueba de inferencia de extremo a extremo a través de la API de la librería `portuguese-openie`, lo que valida su usabilidad práctica.

La relevancia de este modelo radica en su especialización para el portugués, un idioma con escasez de herramientas de extracción de información de código abierto, y en su tamaño reducido que permite desplegarlo en hardware modesto. Sin embargo, su estado experimental y la falta de claridad sobre el proceso de entrenamiento exigen precaución antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder |
| Parametros totales | 783.150.080 (aprox. 783M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Float32 (publicado) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 (Text-to-Text Transfer Transformer), un encoder-decoder basado en transformers que procesa todas las tareas como transformaciones de texto a texto. El checkpoint base es `PortugueseT5-Instruct`, un T5 de aproximadamente 783M parámetros entrenado para seguir instrucciones en portugués. Sobre esta base se realizó un ajuste fino (fine-tuning) supervisado para la tarea de OpenIE abstractiva, utilizando el conjunto de datos WikiPUD-Portuguese-Abstractive. Este conjunto contiene 29.026 frases portuguesas y 102.788 extracciones sintéticas generadas con Gemini 2.5 Flash a partir de 2.015 párrafos de Wikipedia. Las extracciones se presentan en formato JSON con los campos `ARG0`, `V` y `ARG1`, que representan respectivamente el sujeto, el verbo y el objeto de cada relación extraída.

El proceso de entrenamiento está documentado en una tesis académica, pero el estado público del entrenador (trainer state) registra solo el paso 2.000 de un programa nominal de 1.291.623 pasos (tres épocas, lo que equivale a una época completada de aproximadamente 0.00465). Este estado puede estar desactualizado o ser una copia, y no demuestra que el entrenamiento se completara. La card del modelo advierte explícitamente que la proveniencia del checkpoint no está reconciliada, por lo que se recomienda tratar el artefacto como una liberación experimental de investigación. La inferencia se realiza con decodificación greedy y el prompt recomendado es `Entrada:\n{sentence}\nResposta:\n`, aunque la tesis describe un prompt de instrucción más largo que no coincide con el usado en la evaluación.

## Capacidades

- Extracción abierta de información abstractiva en portugués: genera triples `ARG0`, `V`, `ARG1` a partir de frases en lenguaje natural.
- Soporte de salida en formato JSON y en formato legacy (`ARG0`/`V`/`ARG1`), con un parser unificado.
- Integración con la librería `portuguese-openie`, que permite extraer triples de forma directa mediante una API simple.
- Funciona como modelo de generación de texto a texto, por lo que puede adaptarse a otras tareas de extracción si se le proporciona el prompt adecuado.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Construcción de bases de conocimiento: el modelo puede extraer relaciones semánticas (sujeto, verbo, objeto) de textos en portugués para alimentar grafos de conocimiento o ontologías, por ejemplo, extrayendo hechos de artículos de Wikipedia o noticias.
- Análisis de documentos legales: dado su tamaño compacto, puede desplegarse en entornos con recursos limitados para extraer obligaciones, derechos o relaciones entre entidades de contratos o sentencias judiciales en portugués.
- Enriquecimiento de corpus para NLP: las extracciones generadas pueden utilizarse como datos de entrenamiento para otros modelos de comprensión del lenguaje o para tareas de respuesta a preguntas.
- Investigación académica en OpenIE: el modelo sirve como punto de partida para experimentos comparativos en extracción de información para portugués, especialmente en entornos donde los modelos de 4B-8B parámetros son inviables.
- Asistencia en periodismo de datos: permite procesar grandes volúmenes de noticias en portugués para identificar relaciones entre entidades (personas, organizaciones, lugares) y generar resúmenes estructurados.
- Prototipado rápido en aplicaciones de análisis de texto: gracias a la librería `portuguese-openie`, los desarrolladores pueden integrar la extracción de triples en pipelines de procesamiento de lenguaje natural con pocas líneas de código.

## Benchmarks y rendimiento

La evaluación reportada en la tesis se realizó sobre 100 frases portuguesas y 238 extracciones de referencia del conjunto WikiPUD-Portuguese-Abstractive. Las referencias fueron generadas con un LLM y revisadas manualmente, por lo que constituyen un estándar de plata (silver-standard), no datos dorados completamente anotados por humanos. Los resultados son los siguientes:

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Coincidencia perfecta (perfect match) | 0.3256 | 0.2353 | 0.2732 |
| Coincidencia lexica (lexical match) | 0.6163 | 0.4454 | 0.5171 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La card advierte que la evaluación no se reejecutó para la revisión pública actual y que no está claro si el checkpoint evaluado es byte a byte idéntico al publicado.

## Requisitos de hardware

- El repositorio en float32 ocupa aproximadamente 3.13 GB, por lo que se necesita un mínimo de 6-8 GB de RAM o VRAM para cargar el modelo en memoria.
- Con cuantización a 8 bits o 4 bits (no incluida en el repositorio pero posible mediante librerías como `bitsandbytes`), el modelo podría caber en GPUs de consumo con 4-6 GB de VRAM, como una NVIDIA RTX 3060 o RTX 4060.
- La inferencia se ha probado en CPU (PyTorch 2.13, Transformers 4.57.6) con tiempos de carga de 8.28 segundos y generación más parsing de 10.59 segundos para una frase corta, aunque estos valores son una prueba de humo, no un benchmark.
- Opciones de despliegue: la librería `transformers` permite cargar el modelo con `AutoModelForSeq2SeqLM` y `AutoTokenizer`. También es compatible con la librería `portuguese-openie`, que gestiona la descarga y el cacheo automático.
- Para despliegue en producción, se puede considerar el uso de `vLLM` o `TGI`, aunque no hay documentación específica sobre su compatibilidad con este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de OpenIE en portugués. La card menciona que el modelo es una alternativa más pequeña a Qwen3OIE de 4B y 8B parámetros, pero no se proporcionan datos de rendimiento comparados. Tampoco hay referencias a otros modelos T5 especializados en OpenIE para portugués. Por tanto, la comparativa se limita a las siguientes observaciones cualitativas:

- Frente a Qwen3OIE (4B/8B): `PortugueseT5OieAbstractive` ofrece una huella de memoria significativamente menor (783M frente a 4B/8B), lo que permite su ejecución en hardware de gama media, pero con una capacidad de razonamiento presumiblemente inferior.
- Frente a `PortugueseT5-Instruct` (el modelo base): este checkpoint añade la especialización en OpenIE, por lo que genera extracciones estructuradas de forma directa sin necesidad de ingeniería de prompts compleja.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación con proveniencia de entrenamiento no reconciliada: el estado público del entrenador sugiere que el entrenamiento pudo no completarse, lo que puede afectar a la calidad del modelo.
- Los datos de evaluación son un estándar de plata (generados por LLM y revisados manualmente), no datos dorados, por lo que los resultados de F1 pueden sobreestimar el rendimiento real en datos no vistos.
- El modelo solo soporta portugués; no hay evidencia de capacidades multilingües.
- No se especifica la longitud de contexto soportada, por lo que se recomienda usar frases cortas (menos de 512 tokens) para evitar truncamiento o degradación del rendimiento.
- La licencia no está declarada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El modelo puede generar alucinaciones o extracciones inexactas, especialmente en frases complejas o ambiguas; se recomienda validar las salidas manualmente en aplicaciones críticas.
- El repositorio no incluye el conjunto de datos de entrenamiento ni un identificador de dataset en Hugging Face, lo que dificulta la reproducibilidad.

## Enlaces

- [Hugging Face: bratao/PortugueseT5OieAbstractive](https://huggingface.co/bratao/PortugueseT5OieAbstractive)
- [Hugging Face: bratao/PortugueseT5-Instruct (modelo base)](https://huggingface.co/bratao/PortugueseT5-Instruct)
- Librería `portuguese-openie` (instalable vía pip, documentación no disponible en la información proporcionada)
