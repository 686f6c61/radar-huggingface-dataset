# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi` es un clasificador de alucinaciones a nivel de token, desarrollado por el equipo EuroEval como parte del trabajo del benchmark multilingüe MultiWikiQHalluA. Está basado en la arquitectura ModernBERT (variante pequeña multilingüe, mmBERT-small) y ha sido ajustado mediante fine-tuning sobre datos sintéticos de alucinaciones generados con el framework LettuceDetect, utilizando contextos, preguntas y respuestas de referencia del dataset MultiWikiQA.

El modelo resuelve el problema de detectar qué tokens de una respuesta generada por un sistema de Retrieval-Augmented Generation (RAG) son factualmente incorrectos o no están respaldados por el contexto proporcionado. Su relevancia radica en que permite auditar y depurar sistemas RAG de forma automática, señalando con precisión las porciones de texto alucinadas. La variante con sufijo `-fi` está especializada en finlandés, y existe una versión gemela en inglés (`-en`) en el mismo repositorio de EuroEval.

Con 140,6 millones de parámetros, es un modelo compacto orientado a clasificación de secuencias (token classification), no a generación. El repositorio contiene únicamente pesos en formato safetensors y la model card es una plantilla autogenerada sin información adicional del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small, encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (variante `-fi`); existe version en ingles (`-en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en mmBERT-small, una variante multilingüe de la arquitectura ModernBERT, que es un encoder transformer optimizado para eficiencia y velocidad en tareas de comprensión del lenguaje. La cabeza de clasificación opera a nivel de token, asignando a cada token una etiqueta que indica si forma parte de una alucinación o no.

El entrenamiento sigue un proceso en dos etapas descrito en el paper de MultiWikiQHalluA: primero, el framework LettuceDetect utiliza un modelo de lenguaje para generar respuestas alucinadas de forma sintética, etiquetando token a token qué partes de la respuesta son inconsistentes con el contexto de MultiWikiQA. Después, estas respuestas etiquetadas se utilizan para ajustar mmBERT-small mediante fine-tuning supervisado. No se dispone de información pública sobre hiperparámetros, número de épocas, tamaño del dataset de entrenamiento ni si se empleó alguna técnica adicional como data augmentation o regularización.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG, indicando exactamente qué tokens no están respaldados por el contexto.
- Clasificación de secuencias (token classification) sobre texto en finlandés, con capacidad de procesar respuestas completas y marcar regiones problemáticas.
- Evaluación de fidelidad factual de respuestas generadas frente a un contexto de referencia dado.
- Integración en pipelines de control de calidad de sistemas RAG mediante la librería transformers de HuggingFace.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`), lo que facilita su despliegue como servicio.
- No es un modelo generativo: no produce texto, solo etiqueta tokens existentes.

## Casos de uso

- Auditoría de sistemas RAG en finlandés: el modelo puede analizar las respuestas generadas por un pipeline RAG y marcar automáticamente los tokens que constituyen alucinaciones, permitiendo a los desarrolladores identificar fallos en la recuperación o en la generación.
- Control de calidad en producción: integrado como paso posterior a la generación, puede filtrar o señalar respuestas con alto contenido alucinado antes de mostrarlas al usuario final, reduciendo el riesgo de información incorrecta.
- Evaluación de datasets de entrenamiento: permite depurar corpus de preguntas-respuestas generados sintéticamente, eliminando o corrigiendo ejemplos con alucinaciones antes de usarlos para fine-tuning de otros modelos.
- Benchmarking de sistemas RAG: como parte del benchmark MultiWikiQHalluA, sirve para comparar objetivamente la fidelidad de distintos sistemas de generación aumentada por recuperación en finlandés.
- Investigación en detección de alucinaciones: útil como modelo de referencia (baseline) para estudios académicos sobre veracidad factual en modelos multilingües.
- Monitorización continua: desplegado como servicio de inferencia, puede monitorizar en tiempo real las respuestas de un asistente conversacional finlandés y generar alertas cuando se detectan patrones de alucinación recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante en la información disponible. El paper asociado (arXiv:2605.02504) describe el benchmark MultiWikiQHalluA y la metodología de generación de datos, pero no se incluyen métricas numéricas (F1, precisión, recall) del modelo en los resultados de búsqueda obtenidos. Se recomienda consultar el paper completo para datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 140 millones de parámetros, la inferencia en FP32 requiere aproximadamente 560 MB de VRAM; en FP16 o cuantización de 8 bits, la cifra baja a unos 280-300 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso inferencia en CPU con llama.cpp o similar.
- Cabe en GPUs consumer de gama baja; no requiere hardware de datacenter.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, HuggingFace TGI, o mediante la API de transformers con `pipeline("token-classification")`. También es compatible con endpoints gestionados (tag `endpoints_compatible`).
- Latencia y throughput: no se dispone de datos publicados; para un modelo de este tamaño, la inferencia en GPU moderna es del orden de milisegundos por secuencia de longitud media.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Idioma | Licencia |
|---|---|---|---|---|---|
| EuroEval/mmBERT-small-...-fi (este modelo) | ModernBERT (mmBERT-small) | 140,6 M | Deteccion de alucinaciones token-level | Finlandes | no disponible |
| EuroEval/mmBERT-small-...-en | ModernBERT (mmBERT-small) | 140,6 M | Deteccion de alucinaciones token-level | Ingles | no disponible |
| Modelos generativos de deteccion de alucinaciones (p.ej. GPT-4o, Claude) | Transformer decoder | no comparable | Deteccion via prompting | Multilingue | propietaria |

La comparativa directa con modelos generativos no es trivial, ya que este modelo es un clasificador especializado y ligero, mientras que los LLMs propietarios abordan la detección mediante prompting. La ventaja de mmBERT-small es su coste computacional mínimo y su salida determinista a nivel de token, frente a la latencia y coste de una llamada a un LLM grande. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La model card del autor está vacía (plantilla autogenerada), por lo que no se documentan sesgos, limitaciones ni recomendaciones de uso por parte del desarrollador.
- El modelo está especializado en finlandés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Solo cubre la detección de alucinaciones en el contexto de RAG con datos de MultiWikiQA; puede no generalizar bien a otros dominios (medicina, legal, etc.) sin fine-tuning adicional.
- Al ser un clasificador a nivel de token, no ofrece explicaciones ni justificaciones de sus predicciones, solo etiquetas binarias.
- Riesgo de falsos positivos y negativos: la calidad depende de la distribución de los datos sintéticos de entrenamiento generados por LettuceDetect, que puede no capturar todos los tipos de alucinación posibles.
- La licencia no está especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar con el autor antes de desplegar en producción.
- No hay información sobre el dataset de entrenamiento, su tamaño ni su composición, lo que dificulta evaluar posibles sesgos.
- El modelo no es generativo: no puede utilizarse para tareas de generación de texto ni para responder preguntas.

## Enlaces

- [HuggingFace - modelo en finlandes](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi)
- [HuggingFace - version en ingles](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA (arXiv)](https://arxiv.org/pdf/2605.02504v2)
- [Paper (version HTML)](https://arxiv.org/html/2605.02504v2)
- [Resumen del paper en Pith Science](https://pith.science/paper/2605.02504)
