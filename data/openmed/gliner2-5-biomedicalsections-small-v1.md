# OpenMed/GLiNER2.5-BiomedicalSections-Small-v1

## Resumen

GLiNER2.5-BiomedicalSections-Small-v1 es un modelo de clasificación de frases diseñado específicamente para etiquetar las secciones de resúmenes (abstracts) de artículos biomédicos en inglés. Desarrollado por OpenMed, el modelo recibe una única frase de un abstract y devuelve una de cinco etiquetas posibles: `background`, `objective`, `methods`, `results` o `conclusions`, junto con una puntuación de confianza. Se trata del modelo más pequeño de los dos que OpenMed ofrece para esta tarea de segmentación estructural de abstracts.

El modelo parte de `fastino/gliner2.5-small-v1`, un extractor de información basado en la familia GLiNER2, y ha sido afinado para la clasificación de roles de frase en el dominio biomédico. Con 73,9 millones de parámetros, está pensado para ejecutarse en CPU sin necesidad de GPU, lo que facilita su integración en pipelines de procesamiento de literatura científica a gran escala. Su relevancia actual radica en la necesidad creciente de herramientas ligeras y abiertas que automaticen la extracción de evidencia estructurada de PubMed y otras fuentes biomédicas.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas, y se integra a través del SDK de OpenMed (`pip install openmed[gliner2]`), que gestiona la segmentación del abstract en frases y la clasificación individual de cada una.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de información basado en transformer, fine-tune de fastino/gliner2.5-small-v1) |
| Parametros totales | 73.881.879 (73,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se ejecuta en CPU según la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `fastino/gliner2.5-small-v1`, un extractor de información de la familia GLiNER2. GLiNER2 es una arquitectura orientada a la extracción de entidades y clasificación mediante prompts, que en este caso se ha adaptado a una tarea de clasificación de frases con cinco etiquetas fijas. El modelo recibe una sola frase de un abstract en inglés, sin encabezado y sin contexto de las frases vecinas, y produce una distribución softmax sobre las cinco etiquetas posibles.

El entrenamiento consistió en un fine-tune supervisado sobre frases de abstracts biomédicos, con los encabezados de sección eliminados previamente. La evaluación se realizó sobre un conjunto de 5.976 frases provenientes de 500 abstracts de ensayos controlados aleatorizados de PubMed. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que las puntuaciones de salida no están calibradas.

## Capacidades

- Clasificación de frases de abstracts biomédicos en cinco categorías: `background`, `objective`, `methods`, `results` y `conclusions`.
- Salida con etiqueta y puntuación de confianza (softmax no calibrado) por cada frase.
- Procesamiento frase a frase: el modelo etiqueta cada oración basándose únicamente en su propio contenido, sin contexto de frases adyacentes ni posición en el abstract.
- Ejecución en CPU, sin requerir GPU.
- Integración con el SDK de OpenMed para segmentación automática de abstracts y clasificación por lotes.
- Especializado en el dominio biomédico y en inglés; no soporta otros idiomas ni tareas de generación de texto.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- **Estructuración automática de abstracts en PubMed**: el modelo permite procesar grandes volúmenes de abstracts de ensayos clínicos y etiquetar cada frase según su rol estructural, facilitando la indexación y búsqueda por secciones en bases de datos biomédicas.
- **Extracción de evidencia para revisiones sistemáticas**: al identificar las frases de `results` y `conclusions`, los investigadores pueden aislar rápidamente los hallazgos principales de cientos de abstracts sin leerlos íntegramente, acelerando la selección de estudios.
- **Construcción de datasets estructurados para NLP biomédico**: el modelo genera anotaciones de sección que pueden usarse para entrenar otros modelos o para enriquecer corpus existentes con metadatos estructurales.
- **Pipelines de minería de literatura en CPU**: gracias a sus 73,9 M de parámetros y su capacidad de ejecutarse en CPU, puede desplegarse en servidores sin GPU para procesar lotes masivos de abstracts de forma económica.
- **Sistemas de alerta y resumen de literatura**: integrado en un flujo que monitorice nuevas publicaciones, el modelo puede extraer automáticamente las conclusiones de abstracts relevantes para un dominio concreto y presentarlas de forma resumida.
- **Preprocesamiento para modelos de lenguaje de mayor tamaño**: las etiquetas de sección generadas pueden servir como contexto estructurado que se inyecte en prompts de modelos generativos, mejorando la calidad de resúmenes automáticos de literatura científica.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados) sobre un conjunto de evaluación de 5.976 frases de 500 abstracts de ensayos controlados aleatorizados de PubMed son los siguientes:

| Metrica | Valor |
|---|---|
| Macro-F1 (cinco secciones) | 77,44 |
| Accuracy | 84,02 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo se ejecuta en CPU según la model card.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para la inferencia.
- Cabe en GPU consumer: sí, con 73,9 M de parámetros ocuparía menos de 1 GB en precisión completa, aunque su diseño está orientado a CPU.
- Opciones de despliegue: SDK de OpenMed (`pip install openmed[gliner2]`), que gestiona la carga del modelo y la clasificación de frases. No se mencionan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `fastino/gliner2.5-small-v1` es un extractor de información general, pero no se han publicado datos comparativos de rendimiento en la tarea de clasificación de secciones de abstracts biomédicos. La model card menciona que existe una versión más grande de este modelo dentro de OpenMed, pero no se detallan sus especificaciones ni su rendimiento.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no está entrenado para abstracts en otros idiomas.
- La etiqueta `objective` es la más débil del modelo, según reconoce la propia model card; en el ejemplo proporcionado, una frase de objetivo se clasifica erróneamente como `background`.
- El modelo procesa una sola frase a la vez y no utiliza contexto de frases vecinas ni la posición en el abstract, lo que puede limitar la precisión en frases ambiguas.
- Los encabezados de sección deben eliminarse antes de la clasificación; el modelo fue entrenado y evaluado con frases sin encabezado.
- Las puntuaciones de salida no están calibradas, por lo que no deben interpretarse como probabilidades fiables sin post-procesamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en frases atípicas o en abstracts con estructuras no convencionales.
- No se han publicado análisis de sesgos demográficos o lingüísticos en la información disponible.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución sin restricciones significativas, siempre que se mantenga el aviso de licencia.
- El modelo tiene solo 3 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica un uso muy limitado y poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: OpenMed/GLiNER2.5-BiomedicalSections-Small-v1](https://huggingface.co/OpenMed/GLiNER2.5-BiomedicalSections-Small-v1)
- [Modelo base: fastino/gliner2.5-small-v1](https://huggingface.co/fastino/gliner2.5-small-v1)
- [Organización OpenMed en Hugging Face](https://huggingface.co/OpenMed)
- [OpenMed SDK en GitHub](https://github.com/maziyarpanahi/openmed)
- [OpenMed SDK en PyPI](https://pypi.org/project/openmed/)
- [OpenMed en X (Twitter)](https://x.com/OpenMed_AI)
- [Paper GLiNER2 (arXiv:2508.01630)](https://arxiv.org/abs/2508.01630)
- [Paper GLiNER (arXiv:2507.18546)](https://arxiv.org/abs/2507.18546)
