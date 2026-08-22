# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-no

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-no` es un clasificador de tokens basado en la arquitectura mmBERT (ModernBERT multilingüe), afinado para detectar alucinaciones en respuestas generadas mediante sistemas de Retrieval-Augmented Generation (RAG). Lo desarrolla el grupo EuroEval y se enmarca en el trabajo presentado en el paper «A multilingual hallucination benchmark: MultiWikiQHalluA», que propone una metodología de dos etapas: generación sintética de alucinaciones con el framework LettuceDetect y posterior afinamiento de un encoder pequeño para etiquetar tokens como veraces o alucinados.

El checkpoint concreto está especializado para noruego (sufijo `-no`) y pertenece a una familia de modelos idénticos entrenados para otros idiomas europeos (letón `-lv`, sueco `-sv`). Con 140 millones de parámetros, es un modelo compacto diseñado para clasificación de tokens, no para generación de texto. Su relevancia radica en ofrecer un detector de alucinaciones ligero y multilingüe, integrable en pipelines de RAG para auditar la fidelidad de las respuestas generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (ModernBERT, encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se estima 8192 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | noruego (segun sufijo `-no`; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mmBERT, un encoder multilingüe moderno derivado de ModernBERT, desarrollado por JHU-CLSP. mmBERT se entrenó sobre 3 billones de tokens en 1833 idiomas mediante un esquema de aprendizaje por idiomas con anidado progresivo (cascading annealed language learning, ALL). Para este checkpoint concreto, se parte de la versión pequeña de mmBERT y se afina para clasificación de tokens sobre un dataset sintético de alucinaciones generadas con RAG.

El proceso de entrenamiento sigue la metodología del paper MultiWikiQAHallu: se construyen contextos de Wikipedia, preguntas y respuestas de referencia (MultiWikiQA), y se pasan a un framework de detección (LettuceDetect) que produce respuestas con alucinaciones etiquetadas a nivel de token. El modelo se entrena para reproducir esas etiquetas, aprendiendo a distinguir tokens fieles al contexto de tokens inventados o inconsistentes. No se han publicado detalles sobre hiperparametros, régimen de entrenamiento ni datos de evaluación.

## Capacidades

- Clasificacion de tokens para deteccion de alucinaciones en respuestas generadas con RAG.
- Identificacion de segmentos del texto que no se sustentan en el contexto recuperado.
- Funciona como auditor de fidelidad en sistemas de pregunta-respuesta con contexto.
- Especifico para noruego, con variantes para otros idiomas europeos en la misma familia.
- No es un modelo generativo: no produce texto, solo etiqueta tokens.
- No soporta tool calling ni razonamiento multi-paso; su salida es una secuencia de etiquetas por token.
- Capacidades multilingues limitadas al idioma de afinado (noruego en este checkpoint).

## Casos de uso

- Evaluacion de pipelines RAG en noruego: el modelo puede etiquetar las respuestas generadas por un sistema RAG para detectar que partes son fieles al contexto y que partes son inventadas, permitiendo auditorias automaticas de calidad.
- Filtrado de respuestas en produccion: integrarlo como paso previo a la entrega al usuario; si la proporcion de tokens alucinados supera un umbral, se puede descartar o reenviar la respuesta.
- Analisis de corpus sinteticos: util para investigacion sobre alucinaciones en modelos de lenguaje, ya que permite anotar grandes volumenes de texto de forma automatica y consistente.
- Construccion de datasets de entrenamiento: las etiquetas generadas por el modelo pueden servir para crear datasets de alucinaciones en noruego, siguiendo la metodologia del paper.
- Monitorizacion de sistemas de QA en produccion: integrar el modelo en un pipeline de logging para medir la tasa de alucinaciones a lo largo del tiempo y detectar regresiones.
- Comparacion de sistemas RAG: usar el modelo como metrica automatica para comparar la fidelidad de distintos sistemas de recuperacion y generacion sobre el mismo conjunto de preguntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper MultiWikiQAHall presenta el benchmark y la metodologia, pero no se incluyen metricas especificas de este checkpoint en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada: con 140M de parametros y pesos en fp32, el modelo ocupa aproximadamente 0,56 GB en memoria. En fp16, alrededor de 0,28 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia, incluyendo GTX 1650, RTX 3060, etc. Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, incluso en tarjetas de gama baja o en CPU con 4 GB de RAM.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, TGI, o bien integrarse en un script Python con la libreria transformers. Al ser un encoder, no se usa con llama.cpp ni Ollama (orientados a generativos).
- Latencia: al ser un modelo pequeno, la inferencia sobre una frase de 100-200 tokens se completa en decenas de milisegundos en GPU consumer.

## Comparativa con modelos similares

No se dispone de datos directos de comparacion con otros detectores de alucinaciones, ya que no se han publicado benchmarks en la informacion disponible. Como referencia arquitectonica, mmBERT supera a XLM-R en tareas multilingues, pero no hay metricas especificas para este checkpoint. Modelos alternativos para deteccion de alucinaciones en RAG suelen ser clasificadores basados en NLI (como los derivados de DeBERTa) o modelos de evaluacion de factos, pero no se dispone de comparativas cuantitativas.

## Limitaciones y advertencias

- No se ha publicado la licencia del modelo: el uso comercial queda en un limbo legal hasta que el autor especifique los terminos.
- La model card es una plantilla automatica sin informacion detallada: no hay datos sobre sesgos, datos de entrenamiento ni limitaciones documentadas.
- El modelo esta afinado para noruego; su rendimiento en otros idiomas no esta garantizado.
- No es un modelo generativo: no se puede usar para generar texto, solo para etiquetar tokens.
- Riesgo de sesgos heredados del encoder base (mmBERTa) y del dataset sintetico de alucinaciones, que puede no cubrir todos los tipos de alucinacion (e.g., errores facticos sutiles, contradicciones internas).
- La deteccion se limita a alucinaciones a nivel de token; no detecta alucinaciones a nivel de documento o incoherencias globales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-no
- Modelo hermano (leton): https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv
- Repositorio de mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper MultiWikiQAHall: https://arxiv.org/pdf/2605.02504v2
