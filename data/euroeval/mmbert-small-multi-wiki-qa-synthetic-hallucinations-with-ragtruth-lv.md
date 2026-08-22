# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv` es un modelo de clasificacion de tokens (token-classification) desarrollado por el proyecto EuroEval, un marco de evaluacion de modelos de lenguaje para lenguas europeas. Esta variante con sufijo `lv` esta especializada en la deteccion de alucinaciones a nivel de token en respuestas generadas por sistemas de recuperacion aumentada (RAG) para el leton.

Se trata de un modelo `mmBERT-small` basado en la arquitectura ModernBERT, con aproximadamente 140 millones de parametros, ajustado sobre un dataset sintetico generado a partir de contextos de MultiWikiQA. El proceso de entrenamiento, descrito en el articulo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504), consiste en una pipeline de dos etapas: primero se generan respuestas sinteticas con alucinaciones anotadas a nivel de token mediante el framework LetuceDetect, y despues se ajusta el modelo para predecir esas etiquetas. Este modelo es relevante porque aborda la deteccion de alucinaciones en un contexto multilingue, un problema critico para el despliegue fiable de sistemas RAG en idiomas distintos del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | leton (sufijo `lv`); existen variantes para otros idiomas europeos |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolucion del transformer clasico optimizada para eficiencia computacional y longitud de contexto extendida. Al tratarse de un modelo `small`, cuenta con aproximadamente 140 millones de parametros, lo que lo situa en la categoria de modelos compactos aptos para inferencia en hardware moderado.

El entrenamiento se realizo mediante ajuste fino (fine-tuning) sobre un dataset sintetico de alucinaciones generado a partir de contextos de MultiWikiQA, un benchmark multilingüe de preguntas y respuestas basado en Wikipedia. El proceso de generacion de datos, descrito en el paper de MultiWikiQHalluA, utiliza un modelo de lenguaje (LettuceDetect) para producir respuestas con alucinaciones anotadas a nivel de token, que posteriormente sirven como supervision para el ajuste fino del clasificador. No se dispone de informacion sobre el regimen de entrenamiento, hiperparametros o si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Deteccion de alucinaciones a nivel de token en respuestas generadas por sistemas RAG
- Clasificacion de tokens como "alucinado" o "veridico" dentro de un contexto de pregunta-respuesta
- Soporte de contexto multilingüe, especificamente para el leton en esta variante
- Integracion con el pipeline de transformers para token-classification
- Compatible con endpoints de inferencia (tag `endpoints_compatible`)
- Capacidad de evaluacion de fidelidad de respuestas en sistemas de recuperacion aumentada

## Casos de uso

- Control de calidad en sistemas RAG: el modelo puede usarse para auditar las respuestas generadas por un pipeline de recuperacion aumentada en leon, marcando los tokens que se han desviado del contexto recuperado y que podrian constituir alucinaciones.
- Evaluacion automatizada de benchmarks de alucinacion: permite medir la tasa de alucinacion de distintos modelos generativos en el idioma leton, sirviendo como metrica objetiva en evaluaciones comparativas.
- Filtrado de respuestas en produccion: integrable en un pipeline de generacion para descartar o corregir respuestas con alto numero de tokens alucinados antes de mostrarlas al usuario final.
- Desarrollo de sistemas de verificacion factual: combinado con un verificador externo, el modelo puede senalar las partes de una respuesta que requieren verificacion manual o automatica adicional.
- Investigacion en deteccion de alucinaciones multilingües: sirve como punto de partida para estudiar como se manifiestan las alucinaciones en idiomas de baja representacion como el leton y como adaptar tecnicas de deteccion a estos contextos.
- Entrenamiento de modelos mas grandes: el dataset y el modelo pueden usarse como referencia para el ajuste fino de modelos mas capaces en tareas de deteccion de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo arXiv sobre MultiWikiQHalluA (2605.02504) describe la metodologia de generacion de datos y el ajuste del modelo, pero no se proporcionan cifras concretas de rendimiento (F1, precision, recall, etc.) en la informacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~140 millones de parametros, la inferencia puede ejecutarse en GPU con 2-4 GB de VRAM en precision completa (fp32), y menos con cuantizacion.
- GPU recomendadas: NVIDIA GTX 1060 6 GB o superior, NVIDIA RTX 3060, RTX 4090, o cualquier GPU de datacenter como A10, A100 o H100 para despliegue concurrente.
- Se puede ejecutar en CPU con razonable latencia para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con bibliotecas estandar como transformers, vLLM, TGI, y puede exportarse a ONNX o TensorRT para optimizacion.
- Latencia estimada: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia |
|---|---|---|---|---|
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv | 140 M | Deteccion de alucinaciones (token-level) | Leton | no disponible |
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en | 140 M | Deteccion de alucinaciones (token-level) | Ingles | no disponible |
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo | 140 M | Deteccion de alucinaciones (token-level) | Feroes | no disponible |
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it | 140 M | Deteccion de alucinaciones (token-level) | Italiano | no disponible |

La comparativa con otros modelos de deteccion de alucinaciones no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del autor esta mayormente sin completar, con campos marcados como "[More Information Needed]". Esto significa que no se dispone de informacion sobre licencia, idiomas soportados, datos de entrenamiento ni procedimiento de entrenamiento.
- No se han publicado resultados de benchmarks, por lo que se desconoce su rendimiento real frente a otras alternativas.
- El modelo esta especializado en un dominio concreto (contextos de Wikipedia y preguntas de MultiWikiQA) y puede no generalizar bien a otros dominios o formatos de RAG.
- Al ser un modelo de deteccion a nivel de token, no genera texto ni responde preguntas; su uso esta limitado a la clasificacion de tokens existentes.
- La variante `lv` esta enfocada al leton; el rendimiento en otros idiomas no esta garantizado.
- El dataset de entrenamiento es sintetico, lo que puede introducir sesgos o artefactos del modelo generador (LettuceDetect) que no reflejen alucinaciones reales en produccion.
- No hay informacion sobre restricciones de licencia, por lo que el uso comercial deberia confirmarse con el autor antes de desplegar el modelo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-lv
- Variante en ingles: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Variante en feroes: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo
- Variante en italiano: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it
- Articulo arXiv (MultiWikiQHalluA): https://arxiv.org/pdf/2605.02504v2
- Sitio de EuroEval: https://euroeval.com/
