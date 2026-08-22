# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pl

## Resumen

El modelo EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pl es un modelo de clasificación de tokens (token-classification) desarrollado por el equipo EuroEval, especializado en la detección de alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG). Se trata de un fine-tune del modelo base mmBERT (un encoder multilingüe moderno preentrenado con annealed language learning sobre 3 billones de tokens y más de 1800 idiomas) sobre un conjunto de datos sintéticos de alucinaciones combinado con el dataset RAGTruth, adaptado al idioma polaco. Con aproximadamente 140 millones de parámetros, es un modelo ligero pensado para tareas de etiquetado a nivel de token en entornos de producción.

La arquitectura subyacente es ModernBERT, un encoder transformer optimizado que ofrece un buen equilibrio entre eficiencia y rendimiento para tareas de clasificación y extracción. El modelo se distribuye en formato safetensors y es compatible con la librería transformers de Hugging Face. Aunque la model card oficial no proporciona detalles técnicos adicionales, el nombre y los tags indican claramente su propósito: identificar segmentos de texto que no son fieles a la información recuperada, lo que resulta útil para auditar sistemas de QA con RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (según el sufijo "pl"; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer que mejora la eficiencia y la calidad de representación respecto a BERT clásico. El modelo base, mmBERT, fue preentrenado con annealed language learning (ALL) sobre 3T tokens de texto multilingüe en más de 1800 idiomas, lo que le otorga una base lingüística amplia. Para este modelo concreto, se realizó un fine-tuning sobre un dataset sintético de alucinaciones junto con el dataset RAGTruth, especializado en el idioma polaco. No se han encontrado detalles sobre el número exacto de tokens de entrenamiento, la configuración de hiperparámetros ni si se emplearon técnicas como RLHF o DPO. La tarea es clasificación de tokens, es decir, cada token se etiqueta como perteneciente a una respuesta fiel o como parte de una alucinación.

## Capacidades

- Detección de alucinaciones en texto generado por sistemas RAG, marcando los tokens que no se corresponden con la información recuperada.
- Clasificación de tokens para tareas de QA con contexto, permitiendo señalar qué partes de una respuesta son inventadas o inconsistentes.
- Soporte de contexto multilingüe gracias a la base mmBERT, aunque el fine-tuning específico está orientado al polaco.
- No es un modelo generativo; no puede producir texto nuevo ni realizar tool calling.
- No se han documentado capacidades de agentes ni razonamiento multi-paso.

## Casos de uso

- **Auditoría de sistemas RAG en polaco**: integrado en un pipeline de QA, el modelo puede marcar automáticamente los fragmentos de respuesta que son alucinaciones, permitiendo a los desarrolladores corregir o descartar resultados no fiables.
- **Monitorización en producción**: en un servicio de atención al cliente que use RAG, el modelo puede señalar en tiempo real si una respuesta contiene información inventada, activando una alerta o una respuesta alternativa.
- **Investigación en detección de alucinaciones**: como herramienta de anotación para crear datasets etiquetados de alucinaciones en polaco, útil para entrenar otros sistemas.
- **Evaluación de sistemas RAG**: comparar la fidelidad de diferentes configuraciones de RAG (cambios en el recuperador, en el prompt, etc.) usando el modelo como métrica automática de alucinación.
- **Análisis de logs de sistemas de QA**: procesar históricos de respuestas para identificar patrones de alucinación y mejorar los sistemas de recuperación.
- **Investigación académica**: como punto de partida para experimentos sobre robustez y sesgos en la detección de alucinaciones en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall, F1 o exactitud sobre conjuntos de prueba estándar.

## Requisitos de hardware

- Con 140 millones de parámetros, el modelo ocupa aproximadamente 0,6 GB en formato fp32 (según el tamaño del repositorio). En cuantización int8, el tamaño se reduciría a unos 0,15 GB, cabiendo en la mayoría de GPUs consumer.
- **VRAM estimada**: menos de 1 GB para inferencia en fp32; con cuantización puede funcionar en CPU con 2-4 GB de RAM.
- **GPUs compatibles**: cualquier GPU con al menos 1 GB de VRAM, por ejemplo GTX 1050 Ti, RTX 3060 o superiores. También funciona en Apple Silicon.
- **Opciones de despliegue**: puede usarse directamente con la librería transformers de Hugging Face (pipeline de token-classification). No se han documentado integraciones específicas con vLLM, Ollama o TGI, pero al ser un modelo estándar de transformers, puede ejecutarse en la mayoría de los frameworks.
- **Latencia**: al ser un modelo pequeño, la inferencia es rápida; para un texto de 512 tokens, la latencia esperada es inferior a 100 ms en una GPU moderna, aunque no hay datos oficiales.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos equivalentes para la detección de alucinaciones en polaco. Se podría comparar con el modelo base mmBERT (que no está fine-tuneado para esta tarea) o con modelos genéricos de clasificación de tokens, pero no hay datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones específicas. Al ser un modelo entrenado con datos sintéticos y un dataset concreto, su capacidad de generalización a otros dominios o estilos de escritura puede ser limitada.
- No se ha especificado la licencia, por lo que el uso comercial es incierto; se recomienda contactar con los autores para aclarar los términos.
- El modelo está diseñado exclusivamente para clasificación de tokens; no es adecuado para generación de texto ni para tareas que requieran razonamiento libre.
- El entrenamiento se ha realizado en un dominio concreto (QA con RAG en polaco); su rendimiento en otros idiomas o en textos fuera de ese contexto no está garantizado.
- Al ser un modelo pequeño, su precisión puede ser inferior a la de modelos más grandes, aunque no se tienen datos para confirmar.
- No se ha documentado el proceso de anotación ni la calidad del dataset de entrenamiento, por lo que podrían existir errores de etiquetado que afecten al rendimiento.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-pl)
- [Hugging Face - versión en inglés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
- [Hugging Face - versión en rumano](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ro)
- [Hugging Face - versión en italiano](https://free2aitools.com/model/euroeval/mmbert-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it) (enlace externo)
- [Paper de mmBERT](https://arxiv.org/pdf/2509.06888)
- [Repositorio GitHub de mmBERT](https://github.com/JHU-CLSP/mmBERT/)
