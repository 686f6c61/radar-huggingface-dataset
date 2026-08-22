# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv` es un modelo de clasificación de tokens (token classification) desarrollado por el instituto de investigación Alexandria, diseñado para detectar alucinaciones en respuestas generadas por sistemas de question answering (QA) sobre Wikipedia. El sufijo `sv` indica que la variante está especializada en sueco, aunque el modelo base es multilingüe.

El modelo se construye a partir de la arquitectura mmBERT-small (una variante compacta de ModernBERT) y se ajusta mediante datos sintéticos generados con el marco LettuceDetect, que produce etiquetas de alucinación a nivel de token. El objetivo es identificar qué segmentos de una respuesta generada son fieles al contexto de referencia y cuáles son inventados o infundados. Con 140,6 millones de parámetros, es un modelo ligero y eficiente para tareas de verificación de fidelidad en pipelines RAG (Retrieval-Augmented Generation). Su relevancia actual radica en la necesidad creciente de mitigar alucinaciones en sistemas de generación de texto y en la disponibilidad de una versión en español y otras lenguas europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (variante small, token-classification) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se estima 512 tokens segun arquitectura ModernBERT small) |
| Tipos de cuantizacion | no disponible (formato safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | Sueco (sv), con base multilingue; existen variantes para ingles (en), italiano (it) y leton (lv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolucion del transformer original que incorpora atencion con ventana deslizante y atencion global en capas especificas, mejorando la eficiencia en secuencias largas y reduciendo el coste computacional. En concreto, la variante `small` tiene 140 millones de parametros, una configuracion compacta pensada para inferencia rapida en entornos con recursos limitados.

El entrenamiento se realizo mediante un proceso de dos etapas. Primero, se generaron datos sinteticos de alucinaciones con el marco Lettuce, que toma preguntas, contextos y respuestas de referencia de MultiWikiQA y produce respuestas corruptas a nivel de token, etiquetadas como "hallucinated" o "grounded". Despues, se ajusto el modelo base mmBERT-small con estos datos en tarea de clasificacion de tokens (token-classification), aprendiendo a marcar cada token de una respuesta como fiel al contexto o como alucinacion. No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO; el proceso se centra en supervisado clasico con etiquetas sinteticas.

## Capacidades

- Deteccion de alucinaciones a nivel de token en respuestas de question answering, identificando que partes de una respuesta no estan soportadas por el contexto dado.
- Clasificacion de tokens en dos categorias: fiel al contexto (grounded) y alucinacion (hallucinated), util para sistemas RAG.
- Soporte para entrada de contexto + pregunta + respuesta, devolviendo una secuencia de etiquetas por token.
- Capacidad multilingue limitada: el modelo base es multilingue, pero la version `-sv` esta especializada en sueco; existen versiones para ingles, italiano y leton.
- Compatible con la libreria `transformers` de Hugging Face y con el pipeline de token-classification, lo que facilita su integracion en pipelines existentes.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso; es un modelo discriminativo de clasificacion.

## Casos de uso

- **Verificacion de respuestas en sistemas RAG**: el modelo se puede integrar como un componente de post-procesamiento que recibe la respuesta generada por un LLM junto con el contexto recuperado, y marca los tokens que son alucinaciones. Esto permite a los desarrolladores filtrar o senalar automaticamente respuestas parcialmente falsas en aplicaciones de atencion al cliente o asistencia virtual.
- **Control de calidad en generacion de contenido**: en plataformas de redaccion asistida, el modelo puede evaluar si las afirmaciones generadas por un LLM sobre una fuente de referencia son correctas, alertando al usuario cuando se detectan segmentos inventados.
- **Analisis de confianza en respuestas medicas o legales**: en dominios con alta exigencia de precision, el modelo puede anadir una capa de auditoria que resalte partes no verificables de una respuesta, ayudando a los profesionales a revisar el resultado antes de tomar decisiones.
- **Construccion de datasets de alucinaciones**: investigadores pueden usar el modelo para anotar automaticamente corpus de respuestas y generar datasets de entrenamiento o evaluacion de detectores de alucinaciones.
- **Monitoreo de calidad en chatbots**: en despliegues de atencion al cliente, el modelo puede procesar las respuestas del bot en tiempo real y activar una alerta cuando se detecta un alto ratio de tokens alucinados, permitiendo una intervencion manual o un fallback a una respuesta segura.
- **Investigacion en NLP**: el modelo sirve como baseline para experimentos sobre deteccion de alucinaciones multilingues, ya que ofrece una version ligera y facil de reproducir en comparacion con detectores basados en LLMs grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (F1, precision, recall) ni comparaciones con otros detectores de alucinaciones. El paper asociado (arXiv:2605.02504) describe el pipeline de generacion de datos y el ajuste fino, pero no se han proporcionado cifras concretas en la ficha.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 140 millones de parametros en formato fp32, la inferencia requiere aproximadamente 0,6 GB de VRAM (140M × 4 bytes). Con cuantizacion a int8 se reduce a ~0,3 GB, y con fp16 a ~0,3 GB.
- **GPUs recomendadas**: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas consumer como NVIDIA GTX 1650, RTX 3060, o incluso CPU con suficiente RAM. No se necesita GPU de datacenter (A100/H100).
- **Compatibilidad con consumer GPU**: si, es un modelo muy ligero que cabe en cualquier GPU de consumo actual, incluso en tarjetas integradas o en CPU con 4 GB de RAM.
- **Opciones de despliegue**: compatible con la libreria `transformers` de Hugging Face, por lo que se puede servir con FastAPI, Flask, o mediante inferencia en batch. Tambien se puede exportar a ONNX o TensorRT para acelerar en produccion. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, pero al ser un modelo de clasificacion de tokens, no requiere de esas herramientas especificas.
- **Latencia y throughput**: no se dispone de datos publicos. En una GPU consumer, la inferencia de una secuencia de 512 tokens deberia estar en el orden de milisegundos (10-50 ms), dado el tamano del modelo y la arquitectura optimizada de ModernBERT.

## Comparativa con modelos similares

No se dispone de informacion publica sobre modelos comparables en la misma categoria de deteccion de alucinaciones a nivel de token con arquitectura ModernBERT. Existen otras alternativas en el mercado, como:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| mmBERT-small (este modelo) | 140M | no disponible | Deteccion de alucinaciones | no disponible |
| Detectores de alucinaciones basados en LLMs (p.ej., GPT-4 con prompts) | >100B | 8k-128k | Verificacion de hechos | Propietaria |
| Modelos de NER clasicos (p.ej., BERT-base para etiquetado) | 110M | 512 | Clasificacion de tokens | MIT/Apache |

La comparativa es limitada porque la tarea de deteccion de alucinaciones a nivel de token es especifica y no hay modelos equivalentes publicados en el mismo tamano con arquitectura ModernBERT. Los sistemas comerciales de deteccion de alucinaciones suelen ser modelos mas grandes o pipelines basados en LLMs, con mayor coste y menor transparencia.

## Limitaciones y advertencias

- **Licencia no especificada**: el autor no ha declarado la licencia del modelo. Esto impide su uso en proyectos comerciales sin consultar previamente al autor. Es un riesgo legal importante para produccion.
- **Datos de entrenamiento sinteticos**: el modelo se entrena con datos generados por el marco Lettuce, que puede no capturar la diversidad de alucinaciones reales en textos naturales. Puede tener un sesgo hacia los patrones de alucinacion presentes en los datos sinteticos.
- **Contexto limitado**: la arquitectura ModernBERT small tiene una longitud de contexto de 512 tokens (estimada), lo que limita su uso en documentos largos o conversaciones multi-turno extensas.
- **Idioma restringido**: aunque el modelo base es multilingue, la version `sv` esta optimizada para sueco. Su rendimiento en otros idiomas (incluido el espanol) puede ser inferior.
- **Tarea especifica**: el modelo solo clasifica tokens como fieles o alucinados; no es un detector general de errores factuales ni un sistema de verificacion de hechos completo. No debe usarse como unica fuente de validacion en aplicaciones criticas.
- **Alucinaciones de tipo "omision"**: el modelo se entrena para detectar tokens inventados, pero no necesariamente para detectar omisiones de informacion importante del contexto, lo que limita su utilidad en casos de respuestas incompletas.
- **Model card incompleta**: la documentacion no incluye informacion sobre el proceso de entrenamiento, los hiperparametros, la composicion del dataset ni las evaluaciones, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face (version sv)](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv)
- [Version en leton (lv)](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv)
- [Version en italiano (it)](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-it)
- [Version en ingles (en)](https://free2aitools.com/model/alexandrainst/mmbert-small-multi-wiki-qa-synthetic-hallucinations-en)
- [Repositorio del proyecto multi_wiki_qa en GitHub](https://github.com/alexandrainst/multi_wiki_qa)
- [Paper: A multilingual hallucination benchmark: MultiQAHalluA (arXiv)](https://arxiv.org/pdf/2605.02504)
