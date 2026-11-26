# muggysdigital/GreBerta-Perseus-ONNX

## Resumen

GreBerta-Perseus-ONNX es un modelo de clasificación de tokens (token classification) especializado en grie­go antiguo, obtenido mediante fine-tuning de bowphs/GreBerta y exportado a formato ONNX para su ejecución con Transformers.js. Lo desarrolla Vincenzo Muggittu (usuario muggysdigital) en el contexto de un proyecto personal de investigación sobre humanidades digitales y didáctica de la IA, documentado en el artículo "Demystifying AIs thanks to Ancient Greek: The Odyssey of an ordinary user" (2026).

El modelo resuelve una tarea concreta: el etiquetado XPOS (part-of-speech) siguiendo el estándar del treebank Perseus, es decir, la asignación de categorías gramaticales finas a cada token de un texto en grie­go antiguo. Se entrena sobre el subconjunto `grc_perseus` del dataset Universal Dependencies. Su relevancia radica en que demuestra un flujo completo de fine-tuning y despliegue local en el navegador para una lengua histórica con pocos recursos, sin depender de infraestructura de servidor.

Arquitectura basada en RoBERTa (hereda la de GreBerta), con licencia Apache 2.0 y un tamaño de repositorio de 0,5 GB. Está pensado explícitamente para pruebas y benchmarking de clasificación XPOS en local mediante Transformers.js, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (base: bowphs/GreBerta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que el modelo está fine-tuned, no cuantizado, y exportado a ONNX) |
| Idiomas soportados | grie­go antiguo (código `grc`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado para Transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de bowphs/GreBerta, un encoder tipo RoBERTa preentrenado para grie­go antiguo, y se somete a fine-tuning supervisado para la tarea de token classification con etiquetas XPOS del estándar Perseus. El entrenamiento y la exportación a ONNX se realizan mediante el script `trainer.py` del repositorio ancient-greek-ai-model-tester del propio autor, utilizando el subconjunto `grc_perseus` del dataset Universal Dependencies.

El autor especifica que el modelo resultante está fine-tuned pero no cuantizado, y que la exportación a ONNX tiene como objetivo su ejecución local con Transformers.js. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de su origen en UD, ni si se aplicaron técnicas de regularización o ajuste adicionales. Tampoco se documentan innovaciones arquitectónicas propias: se trata de un fine-tuning estándar de un encoder existente con exportación a un runtime distinto.

## Capacidades

- Clasificación de tokens (token classification) para etiquetado XPOS en grie­go antiguo según el estándar Perseus.
- Asignación de categorías gramaticales finas a cada token de un texto griego.
- Ejecución local en el navegador o en Node.js mediante Transformers.js y el runtime ONNX.
- Soporte de un único idioma: grie­go antiguo (`grc`).
- No es un modelo generativo: no produce texto libre, no razona, no escribe código ni resuelve matemáticas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento (thinking mode).
- Orientado a pruebas y benchmarking de etiquetado morfosintáctico en humanidades digitales.

## Casos de uso

- Anotación morfosintáctica de corpus griegos: el modelo etiqueta cada token con su categoría XPOS Perseus, lo que permite procesar textos del corpus Perseus de forma automatizada y contrastar con anotaciones gold.
- Benchmarking de modelos para grie­go antiguo: al estar exportado a ONNX y pensado para Transformers.js, sirve como referencia reproducible para comparar el rendimiento de distintos encoders en la tarea XPOS sin necesidad de GPU ni servidor.
- Docencia e investigación en humanidades digitales: un investigador puede cargar el modelo en el navegador y analizar pasajes griegos en local, sin enviar datos a servicios externos, lo que facilita la experimentación en entornos con recursos limitados.
- Validación de pipelines de anotación: el modelo puede integrarse como paso de preetiquetado en flujos de anotación manual, reduciendo el trabajo de revisión sobre corpus griegos.
- Aplicaciones web educativas de grie­go clásico: al ejecutarse con Transformers.js, puede incorporarse a una página web que resalte categorías gramaticales de un texto griego introducido por el usuario.
- Estudio metodológico sobre despliegue local de IA: el propio autor lo presenta como ejemplo de flujo completo (fine-tuning, exportación ONNX y ejecución en el navegador) para desmitificar el desarrollo de IA en lenguas de bajos recursos.
- Reproducción de experimentos académicos: al estar vinculado a un artículo con DOI y a un repositorio con el script de entrenamiento, permite replicar el fine-tuning y verificar los resultados de etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,5 GB, lo que da una cota superior aproximada del peso de los artefactos ONNX, pero no se especifica el consumo en memoria en ejecución.
- GPU recomendadas: no disponible. Al ejecutarse con Transformers.js y ONNX, el modelo está diseñado para inferencia en CPU y en el navegador, sin requerir GPU dedicada.
- Compatibilidad con GPU de consumo: no se documenta; el caso de uso previsto es la ejecución local en navegador o Node.js, no el despliegue en GPU.
- Opciones de despliegue: Transformers.js (biblioteca declarada), con pesos en formato ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tarea | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| GreBerta-Perseus-ONNX | RoBERTa (base GreBerta) | grc | Token classification (XPOS Perseus) | no disponible | Apache 2.0 | ONNX |
| bowphs/GreBerta | RoBERTa | grc | Encoder de propósito general (base) | no disponible | no disponible en la informacion | safetensors (formato habitual de transformers, no confirmado) |
| Otros modelos UD para grc | no disponible | grc | Token classification | no disponible | no disponible | no disponible |

La información disponible no permite comparar métricas de rendimiento con alternativas, ya que no se publican resultados de benchmarks. La comparación más directa es con su modelo base, bowphs/GreBerta, del que hereda la arquitectura y sobre el que aplica fine-tuning específico para XPOS.

## Limitaciones y advertencias

- Modelo de un solo idioma: solo está entrenado y destinado a grie­go antiguo (`grc`); no es utilizable en otras lenguas.
- Tarea restringida: solo realiza clasificación de tokens XPOS; no genera texto ni responde preguntas.
- Sin datos de rendimiento publicados: no hay métricas de precisión, recall o F1 disponibles en la información, por lo que no puede evaluarse su calidad objetiva frente a alternativas.
- Sin datos sobre sesgos: no se documenta ningún análisis de sesgos, aunque al ser un modelo de etiquetado gramatical el riesgo de sesgo social es limitado; sí puede reflejar los sesgos de anotación del treebank Perseus.
- Riesgo de error en textos fuera de dominio: al haberse entrenado sobre el subconjunto `grc_perseus` de Universal Dependencies, su comportamiento en variedades o géneros griegos poco representados en ese corpus no está documentado.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene verificar las condiciones del modelo base bowphs/GreBerta, cuya licencia no se detalla en la información proporcionada.
- Madurez del proyecto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó en noviembre de 2026; se trata de un artefacto de investigación personal, no de un modelo con validación comunitaria extensa.
- Sin garantías de soporte: no se documentan actualizaciones, mantenimiento ni issues resueltos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muggysdigital/GreBerta-Perseus-ONNX
- Modelo base: https://huggingface.co/bowphs/GreBerta
- Repositorio con el script de entrenamiento: https://github.com/vmuggittu/ancient-greek-ai-model-tester
- Script `trainer.py`: https://github.com/vmuggittu/ancient-greek-ai-model-tester/blob/main/python/trainer.py
- Dataset Universal Dependencies (subconjunto `grc_perseus`): https://huggingface.co/datasets/universal-dependencies/universal_dependencies/tree/main/parquet/grc_perseus
- Guías del estándar XPOS Perseus: https://github.com/PerseusDL/treebank_data/tree/master/AGDT2/guidelines
- Artículo (APA, inglés): https://doi.org/10.13140/RG.2.2.22949.95204
- Artículo (APA, italiano): https://doi.org/10.13140/RG.2.2.16239.06568
