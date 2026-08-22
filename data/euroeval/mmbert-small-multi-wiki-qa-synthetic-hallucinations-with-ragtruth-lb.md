# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lb

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lb` es un encoder multilingüe de tamaño reducido, basado en la arquitectura mmBERT (ModernBERT), ajustado mediante fine-tuning para la tarea de clasificación de tokens con el objetivo de detectar alucinaciones en respuestas generadas por sistemas de pregunta-respuesta (QA) con recuperación aumentada (RAG). Ha sido desarrollado por el proyecto EuroEval, una iniciativa centrada en la evaluación robusta de modelos de lenguaje en lenguas europeas.

El modelo cuenta con 140.642.306 parámetros y se distribuye en formato safetensors, compatible con la librería transformers. Su nombre indica que fue entrenado sobre un conjunto de datos sintético de alucinaciones generadas a partir de preguntas y respuestas de Wikipedia en múltiples idiomas, junto con información de verdad de RAG (ragtruth). El sufijo `-lb` sugiere que está adaptado a un idioma concreto, aunque la documentación no especifica cuál.

La relevancia de este modelo radica en su aplicación práctica para evaluar y filtrar la fiabilidad de sistemas RAG, un componente crítico en despliegues de IA generativa donde la veracidad de las respuestas es esencial. Su tamaño compacto y su naturaleza de encoder lo hacen adecuado para integración en pipelines de control de calidad sin requerir infraestructura de alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (ModernBERT, variante small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo `-lb` sugiere adaptación a un idioma, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mmBERT, un encoder multilingüe moderno desarrollado por el grupo JHU-CLSP, que emplea un esquema de entrenamiento denominado *annealed language learning* (ALL) y que ha sido entrenado sobre 3 billones de tokens en 1833 idiomas. Esta arquitectura es una evolución de BERT que incorpora mejoras como atención lineal eficiente y normalización moderna, logrando un rendimiento superior a XLM-R en tareas multilingües.

Para este modelo concreto, se ha realizado un ajuste fino (fine-tuning) sobre la tarea de clasificación de tokens, con el objetivo de marcar segmentos de texto que constituyen alucinaciones en respuestas de QA con RAG. El dataset de entrenamiento es sintético y se generó a partir de pares de preguntas-respuestas de Wikipedia en múltiples idiomas, con anotaciones de veracidad (RAG truth). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros utilizados, ya que la model card no los especifica.

## Capacidades

- Clasificación de tokens para identificar segmentos de texto que constituyen alucinaciones en respuestas de QA.
- Multilingüe (probablemente cubre múltiples idiomas europeos, aunque no se confirma la lista exacta).
- Compatible con la librería transformers, lo que permite su uso en pipelines de procesamiento de lenguaje natural estándar.
- Diseñado para trabajar en escenarios de retrieval augmented generation (RAG), donde la verificación de veracidad es crítica.
- No se reportan capacidades de generación de texto, razonamiento, tool calling o agentes; es un modelo encoder de clasificación.

## Casos de uso

- Control de calidad en sistemas de QA con RAG: el modelo puede integrarse como una capa de validación que marque tokens de las respuestas generadas que son inconsistentes con las fuentes recuperadas, permitiendo filtrar o señalar respuestas poco fiables antes de mostrarlas al usuario.
- Evaluación de pipelines de RAG: permite comparar la calidad de diferentes sistemas de recuperación y generación midiendo la frecuencia de alucinaciones detectadas en sus salidas.
- Auditoría de respuestas en asistentes virtuales multilingües: dado su enfoque multilingüe, puede aplicarse a asistentes que operan en varios idiomas europeos para detectar respuestas incorrectas o inventadas.
- Investigación en robustez de modelos de lenguaje: sirve como herramienta para estudiar patrones de alucinación en modelos de QA y para desarrollar mejores métodos de mitigación.
- Filtrado de contenido generado automáticamente en plataformas de contenido: puede integrarse en flujos de publicación automática para marcar o rechazar textos generados que contengan afirmaciones falsas.
- Evaluación de benchmarks de alucinaciones: el modelo puede utilizarse para anotar automáticamente los conjuntos de datos de evaluación de RAG, reduciendo la necesidad de anotación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de evaluación, ni comparaciones con otros modelos de detección de alucinaciones. Por tanto, no es posible presentar una tabla de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 140 M parámetros, el modelo puede cargarse en memoria con aproximadamente 0,6 GB en FP16 (asumiendo un peso de 4 bytes por parámetro en FP32 y la mitad en FP16). En cuantización INT8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en hardware de gama media.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con la propia librería, con vLLM (si se convierte a formato compatible), o mediante Ollama si se convierte a GGUF. También es compatible con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de los textos de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de detección de alucinaciones con la misma arquitectura. Sin embargo, en el contexto de la detección de alucinaciones en RAG, existen otros enfoques como clasificadores basados en XLM-RoBERTa o modelos de verificación de hechos, pero no se pueden comparar cuantitativamente sin datos de benchmarks. El modelo se posiciona como una variante ligera del mmBERT, diseñado específicamente para esta tarea, pero carece de datos públicos de comparación.

## Limitaciones y advertencias

- La model card es extremadamente incompleta: no se especifica licencia, idiomas soportados, datos de entrenamiento ni hiperparámetros, lo que dificulta evaluar su adecuación para usos comerciales o académicos.
- Riesgo de sesgos: al estar entrenado sobre un dataset sintético generado a partir de Wikipedia, puede heredar sesgos presentes en ese corpus, incluyendo representación desequilibrada de ciertos temas o idiomas.
- Riesgo de alucinación en la propia clasificación: el modelo puede cometer errores de clasificación (falsos positivos o negativos) que afecten a la fiabilidad de la detección.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto soportada, lo que puede ser un problema para documentos largos.
- Restricciones de licencia: la licencia es "no disponible", por lo que no se puede determinar si es apto para uso comercial o si requiere atribución.
- El modelo está pensado para la tarea específica de detección de alucinaciones en QA con RAG; no debe usarse para generación de texto u otras tareas fuera de su ámbito.

## Enlaces

- Modelo en HuggingFace: [EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lb](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lb)
- Repositorio de mmBERT (JHU-CLSP): [https://github.com/JHU-CLSP/mmBERT/](https://github.com/JHU-CLSP/mmBERT/)
- Web de EuroEval: [https://euroeval.com/](https://euroeval.com/)
- Paper de mmBERT (referenciado en el repo): [arXiv:1910.09700](https://arxiv.org/abs/1910.09700) (citado en la model card, aunque corresponde a la estimación de emisiones de carbono, no a la arquitectura)
