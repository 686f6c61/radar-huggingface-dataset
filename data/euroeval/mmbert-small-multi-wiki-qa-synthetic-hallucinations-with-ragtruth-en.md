# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en` es un modelo de clasificación de tokens (token-classification) desarrollado por EuroEval, un marco de evaluación de modelos de lenguaje europeo. Está diseñado para detectar alucinaciones a nivel de token en respuestas generadas por sistemas de recuperación aumentada (RAG), concretamente en el contexto del benchmark multilingüe MultiWikiQHalluA. El modelo se basa en la arquitectura ModernBERT, una evolución eficiente de BERT, y cuenta con 140,6 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños pero especializados.

La relevancia de este modelo radica en su enfoque en un problema crítico de los sistemas RAG: la verificación de fidelidad de las respuestas generadas. Al operar a nivel de token, permite señalar exactamente qué partes de una respuesta son inconsistentes con el contexto recuperado, lo que facilita la depuración y el control de calidad en pipelines de generación aumentada. El sufijo `-en` indica que está orientado al inglés, aunque el prefijo `multi` sugiere que forma parte de una familia multilingüe (existen variantes para otros idiomas como italiano o griego). El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere multilingue, con variante especifica para ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de encoder transformer que mejora la eficiencia de BERT original mediante optimizaciones como atención con ventana deslizante y normalización mejorada. Está configurado para la tarea de clasificación de tokens, lo que implica que cada token de la secuencia de entrada recibe una etiqueta que indica si forma parte de una alucinación o no. Según el paper asociado (arXiv:2605.02504), el entrenamiento sigue un proceso de dos etapas: primero se genera un dataset sintético de alucinaciones mediante el framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas etiquetadas a nivel de token a partir de contextos de MultiWikiQA; después se fine-tunea el modelo base mmBERT-small sobre estos datos. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG.
- Clasificación de secuencias de texto en el contexto de verificación de fidelidad.
- Soporte para pipelines de token-classification mediante la librería transformers.
- Capacidad multilingüe potencial (existen variantes para otros idiomas, aunque esta versión está orientada al inglés).
- Integración con el ecosistema EuroEval para evaluación de modelos de lenguaje europeos.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Auditoría de respuestas RAG en producción: el modelo puede integrarse en un pipeline de generación aumentada para marcar automáticamente los tokens que no se corresponden con el contexto recuperado, permitiendo a los desarrolladores identificar y corregir alucinaciones antes de que lleguen al usuario final.
- Control de calidad en sistemas de atención al cliente: al analizar las respuestas generadas por un asistente virtual, el modelo señala las partes que se desvían de la base de conocimiento, facilitando la depuración de fallos en la recuperación.
- Evaluación de benchmarks de alucinación: forma parte del benchmark MultiWikiQHalluA, por lo que puede usarse como referencia para comparar la fidelidad de otros modelos generativos en tareas de pregunta-respuesta con contexto.
- Investigación en verificación de hechos: los investigadores pueden emplear el modelo para estudiar patrones de alucinación en distintos dominios y desarrollar métodos de mitigación más robustos.
- Filtrado de datos de entrenamiento: en la creación de datasets para fine-tuning de modelos generativos, el modelo puede ayudar a descartar ejemplos con respuestas infieles al contexto.
- Monitorización de sistemas de generación de informes médicos o legales: donde la precisión es crítica, el modelo puede señalar discrepancias entre el texto generado y las fuentes citadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2605.02504) describe el benchmark MultiWikiQHalluA, pero no se incluyen métricas específicas de este modelo en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140 millones de parámetros y un tamaño de repo de 1,2 GB, el modelo puede ejecutarse en GPUs con al menos 2-4 GB de VRAM en precisión FP32, y menos si se aplica cuantización (aunque no se especifican tipos de cuantización disponibles).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. También es viable en GPUs de datacenter como T4 o A10.
- Cabe en consumer GPU: sí, en la mayoría de GPUs de gama media y alta.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante la API de transformers directamente. También es compatible con librerías de inferencia local como llama.cpp si se convierte a GGUF (aunque no se indica soporte nativo).
- Latencia y throughput: no disponible en la información proporcionada, pero al ser un modelo pequeño, se espera una latencia baja en GPU (del orden de milisegundos por secuencia).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo pertenece a una categoría especializada (detección de alucinaciones a nivel de token) y no se han proporcionado datos de modelos comparables en la documentación. Se recomienda consultar el paper de MultiWikiQHalluA para obtener referencias a otros sistemas de detección de alucinaciones.

## Limitaciones y advertencias

- La model card oficial está prácticamente vacía, por lo que no se conocen los sesgos específicos del modelo ni sus limitaciones documentadas.
- Al ser un modelo entrenado con datos sintéticos generados por un LLM, puede presentar sesgos heredados del generador de datos, especialmente en dominios no representados en el dataset de entrenamiento.
- Riesgo de alucinación en la propia detección: el modelo puede clasificar erróneamente tokens como alucinados o no alucinados, especialmente en contextos ambiguos o con vocabulario técnico.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- El modelo está orientado al inglés (sufijo `-en`), aunque el prefijo `multi` sugiere que existen variantes para otros idiomas; su rendimiento en otros idiomas no está verificado.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita su aplicación en documentos largos.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [Paper - A multilingual hallucination benchmark: MultiWikiQHalluA (arXiv)](https://arxiv.org/pdf/2605.02504v2)
- [Paper - versión HTML](https://arxiv.org/html/2605.02504v2)
- [EuroEval - sitio oficial](https://euroeval.com/)
- [Variante italiana del modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it)
- [Variante griega del modelo](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-el)
