# AhmetSemih/laya-turkish-mmlu

## Resumen

laya-turkish-mmlu es un ajuste fino del checkpoint multilingüe Laya (convaiinnovations/laya), construido sobre el backbone mmBERT-base y publicado por el usuario AhmetSemih. El modelo tiene 321.908.998 parámetros (unos 322 M) y un repositorio de 0,7 GB en formato safetensors, y está especializado en responder preguntas de opción múltiple en turco.

El ajuste se ha realizado con RLCD sobre las 6.200 preguntas del dataset AhmetSemih/turkish-mmlu-laya, una adaptación al turco del benchmark MMLU. El pipeline declarado en HuggingFace es multiple-choice y la licencia es Apache-2.0.

Su relevancia es acotada y muy específica: se trata de un modelo de investigación con 0 descargas y 0 me gusta en el momento de redactar esta ficha, sin resultados de benchmarks publicados. Su utilidad principal es actuar como evaluador o componente de decisión en turco dentro del ecosistema Laya, que expone una API de agente (`laya.Agent`) en lugar de una interfaz generativa convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mmBERT-base (encoder transformer) según la model card; detalles de capas y atención no disponibles |
| Parámetros totales | 321.908.998 (≈322 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | turco (tr); el checkpoint base se describe como multilingüe, pero el ajuste es solo en turco |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | multiple-choice |
| Modelo base | convaiinnovations/laya |
| Dataset de ajuste | AhmetSemih/turkish-mmlu-laya (6.200 preguntas) |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación | 2026-09-23 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya, descrito por el autor del ajuste como un checkpoint multilingüe basado en mmBERT-base, esto es, un encoder de la familia BERT/ModernBERT adaptado al paradigma de agente de Laya. La información disponible no especifica el número de capas, la dimensión oculta, el tipo de atención, la longitud de contexto soportada ni el número de cabezas del modelo.

El entrenamiento consiste en un ajuste fino con RLCD sobre 6.200 preguntas de opción múltiple del dataset turco-mmlu-laya, derivado de MMLU. No se documentan el número de tokens vistos, la composición detallada del dataset, la existencia de etapas adicionales de DPO o RLHF, ni hiperparámetros de entrenamiento. Tampoco se describe ninguna innovación técnica propia más allá del framework Laya, cuya API (`agent.predict(state, questions)`) sugiere que el modelo consume un estado y un conjunto de preguntas y devuelve una selección.

## Capacidades

- Respuesta a preguntas de opción múltiple en turco: selecciona una opción entre varias candidatas dadas.
- Interfaz de agente de Laya: se invoca mediante `laya.Agent("AhmetSemih/laya-turkish-mmlu")` y el método `predict(state, questions)`.
- Integración en flujos de evaluación tipo benchmark (formato MMLU).
- Especialización lingüística en turco, incluyendo preguntas de conocimiento académico procedentes de MMLU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta razonamiento multi-step más allá del bucle de agente que implemente el framework Laya.
- No se documentan capacidades de visión, audio ni generación de texto libre (el pipeline es exclusivamente multiple-choice).
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Evaluación comparativa de modelos en turco: sirve como referencia de opción múltiple para medir la calidad de otros modelos sobre el conjunto turco-mmlu-laya, con el mismo protocolo que MMLU.
- Evaluación educativa automatizada: corrección de exámenes tipo test en turco a partir de un banco de preguntas con opciones, usando el pipeline multiple-choice.
- Investigación en alineación con RLCD: el checkpoint permite estudiar el efecto de RLCD sobre un encoder de 322 M en una tarea de discriminación cerrada.
- Anotación asistida de datasets: preetiquetado de preguntas de opción múltiple en turco antes de la revisión humana, reduciendo el coste de anotación.
- Módulo de decisión dentro de un agente Laya: actuar como política de selección cuando el agente debe elegir entre un conjunto finito de acciones o respuestas candidatas.
- Filtrado de datos de entrenamiento: detección de ejemplos incoherentes o mal formados en corpus de opción múltiple en turco comparando la opción elegida con la etiqueta original.
- Punto de partida para transfer learning: ajuste posterior a otros dominios o idiomas partiendo de un encoder ya adaptado a preguntas de opción múltiple.
- Verificación de pipelines de evaluación: al ser un modelo pequeño, permite validar harnesses de evaluación y formateadores de prompts sin coste elevado de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card ni los metadatos de HuggingFace incluyen puntuaciones de MMLU turco, exactitud sobre el conjunto de evaluación, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 0,64 GB; en fp32, aproximadamente 1,29 GB (estimación a partir de los 321,9 M de parámetros).
- VRAM estimada para inferencia: por debajo de 2 GB con bf16 y lotes pequeños; en torno a 1 GB o menos con cuantización a int8 si se aplica.
- Cabe en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.) y también en inferencia sobre CPU.
- GPU de datacenter (A100, H100, L40S) solo tienen sentido para evaluación masiva con lotes grandes o para reentrenamiento, no para inferencia unitaria.
- Opciones de despliegue: la vía documentada es la librería `laya` sobre transformers; no se confirman integraciones con vLLM, TGI, llama.cpp ni Ollama, y estos dos últimos no están orientados a encoders de opción múltiple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AhmetSemih/laya-turkish-mmlu | 321,9 M | no disponible | turco | Apache-2.0 | HuggingFace, 0 descargas |
| convaiinnovations/laya (base) | no disponible | no disponible | multilingüe (según el autor) | no disponible | HuggingFace |
| mmBERT-base | no disponible | no disponible | multilingüe | no disponible | HuggingFace |
| xlm-roberta-base | 278 M | 512 tokens | 100 idiomas | MIT | HuggingFace |
| bert-base-multilingual-cased | 178 M | 512 tokens | 104 idiomas | Apache-2.0 | HuggingFace |
| dbmdz/bert-base-turkish-cased | 110 M | 512 tokens | turco | MIT | HuggingFace |

No se dispone de comparativas de rendimiento entre estos modelos y laya-turkish-mmlu, ya que este último no publica métricas. Las alternativas listadas no están ajustadas específicamente para opción múltiple en turco, por lo que la comparación es estructural y no de resultados.

## Limitaciones y advertencias

- Modelo sin validación externa: 0 descargas y 0 me gusta, publicado por un usuario individual, sin resultados de benchmarks que respalden su calidad.
- Riesgo de alucinación en el sentido de selección arbitraria: al ser un clasificador de opción múltiple, puede elegir una respuesta incorrecta con alta confianza y no ofrece mecanismos de abstención documentados.
- Cobertura lingüística limitada al turco; el uso en otros idiomas no está soportado por el ajuste.
- Longitud de contexto desconocida: no se documenta el máximo de tokens de entrada, lo que impide planificar su uso con contextos largos.
- No apto para generación de texto libre, resúmenes, traducción ni diálogo abierto, ya que el pipeline declarado es multiple-choice.
- Dependencia del framework Laya: la única vía de uso documentada requiere la librería `laya`, lo que limita la portabilidad a otros stacks de inferencia.
- Procedencia del dataset de ajuste: conviene verificar la licencia y el método de construcción de AhmetSemih/turkish-mmlu-laya antes de un uso comercial, ya que deriva de MMLU.
- La licencia Apache-2.0 del checkpoint permite uso comercial, pero no cubre posibles reclamaciones sobre los datos de entrenamiento ni garantiza exactitud de las respuestas.
- Fechas de creación y actualización muy próximas (menos de un minuto de diferencia), lo que sugiere una publicación sin iteraciones ni mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmetSemih/laya-turkish-mmlu
- Dataset de ajuste: https://huggingface.co/datasets/AhmetSemih/turkish-mmlu-laya
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
