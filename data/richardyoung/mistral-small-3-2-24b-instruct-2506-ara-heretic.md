# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic es una variante "decensored" (abliterada) del modelo multimodal Mistral-Small-3.2-24B-Instruct-2506, publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El modelo base, desarrollado por Mistral AI, es un transformer denso de 24.011.361.280 parámetros (aproximadamente 24B) con capacidades de texto e imagen, y constituye una actualización menor de Mistral-Small-3.1-24B-Instruct-2503 centrada en mejorar el seguimiento de instrucciones, reducir las generaciones infinitas y hacer más robusta la plantilla de function calling.

La modificación aplicada es una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 12 a 40 del modelo, con el objetivo de eliminar los comportamientos de rechazo. Según la model card, las negativas se reducen de 98/100 en el modelo original a 6/100 en esta versión, a costa de una divergencia KL de 0.0829 respecto al original. El resultado es un modelo que mantiene la arquitectura, el tokenizador y las capacidades multimodales del original, pero con una política de rechazo prácticamente eliminada.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de 24B con licencia Apache 2.0, soporte para 24 idiomas y despliegue en vLLM, y que quieran evaluar el impacto de técnicas de abliteración sobre el comportamiento del modelo, ya que el proceso es reproducible y los parámetros de ablación están documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (mistral3), texto e imagen |
| Parametros totales | 24.011.361.280 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via vLLM) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria vLLM; tamano del repo 48.1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 24B parametros con capacidad multimodal image-text-to-text, sucesor directo de Mistral-Small-3.1-24B-Instruct-2503. Mistral AI no detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset. La actualizacion 3.2 se centra en tres mejoras: seguimiento de instrucciones mas preciso, reduccion a la mitad de las generaciones infinitas en prompts largos y repetitivos (de 2.11% a 1.29%), y una plantilla de function calling mas robusta implementada en mistral-common.

La innovacion principal de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0. Los parametros documentados son: start_layer_index 12, end_layer_index 40, preserve_good_behavior_weight 0.9500, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.4203 y neighbor_count 9. Esta tecnica proyecta las direcciones de activacion asociadas a comportamientos de rechazo fuera del subespacio de pesos en un rango de capas, preservando en gran medida el comportamiento util (peso 0.95). El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. No se documenta en la informacion disponible si hubo RLHF o DPO especifico para esta variante, mas alla del alineamiento del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con seguimiento de instrucciones mejorado respecto a la version 3.1.
- Razonamiento y matematicas: resultados en MMLU, MMLU Pro, MATH y GPQA recogidos en la model card.
- Generacion de codigo: evaluada con MBPP Plus y HumanEval Plus (Pass@5).
- Vision: procesamiento de imagenes en tareas de documentacion, graficos y diagramas (MMMU, MathVista, ChartQA, DocVQA, AI2D).
- Function calling / tool calling con plantilla robusta integrada en mistral-common.
- Capacidades multilingues en 24 idiomas, incluidos espanol, catalan no listado, arabe, persa, hindi, bengali, nepalí, serbio, ucraniano y vietnamita.
- Comportamiento "decensored": rechazos reducidos a 6/100 segun la evaluacion del autor.
- Compatible con vLLM >= 0.9.1 y transformers; se recomienda temperatura baja (0.15) y el uso de un system prompt.

## Casos de uso

- Evaluacion de tecnicas de abliteracion: investigadores pueden reproducir el proceso ARA con los parametros documentados y medir el impacto en calidad, rechazos y divergencia KL frente al modelo original.
- Asistencia conversacional con imagenes: el modelo puede responder preguntas sobre capturas, diagramas o documentos escaneados en un pipeline image-text-to-text desplegado en vLLM.
- Extraccion de informacion de documentos: con DocVQA en torno al 94.86%, es adecuado para procesar facturas, formularios e informes con preguntas en lenguaje natural.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o explicar codigo, con HumanEval Plus Pass@5 del 92.90%.
- Analisis de graficos y dashboards: ChartQA del 87.4% permite construir asistentes que interpreten graficos de barras, lineas o tablas en informes.
- Atencion al cliente multilingue: con 24 idiomas y contexto conversacional, puede gestionar soporte en espanol, arabe, hindi o vietnamita desde un unico despliegue.
- Investigacion sobre seguridad y alineamiento: util como caso de estudio de como la ablacion afecta a la calibracion y a la tasa de respuestas nocivas.
- Prototipado de agentes: la plantilla de function calling robusta y la reduccion de generaciones infinitas facilitan bucles de razonamiento multi-paso.

## Benchmarks y rendimiento

Resultados del modelo base Mistral-Small-3.2-24B-Instruct-2506 frente a Small 3.1, segun la model card. No se han publicado benchmarks especificos de esta variante abliterada mas alla de la tasa de rechazos y la divergencia KL.

| Benchmark | Small 3.1 24B | Small 3.2 24B |
|---|---|---|
| Wildbench v2 | 55.6% | 65.33% |
| Arena Hard v2 | 19.56% | 43.1% |
| IF interno (accuracy) | 82.75% | 84.78% |
| Generaciones infinitas (menor es mejor) | 2.11% | 1.29% |
| MMLU | 80.62% | 80.50% |
| MMLU Pro (5-shot CoT) | 66.76% | 69.06% |
| MATH | 69.30% | 69.42% |
| GPQA Main (5-shot CoT) | 44.42% | 44.22% |
| GPQA Diamond (5-shot CoT) | 45.96% | 46.13% |
| MBPP Plus Pass@5 | 74.63% | 78.33% |
| HumanEval Plus Pass@5 | 88.99% | 92.90% |
| SimpleQA (TotalAcc) | 10.43% | 12.10% |
| MMMU | 64.00% | 62.50% |
| MathVista | 68.91% | 67.09% |
| ChartQA | 86.24% | 87.4% |
| DocVQA | 94.08% | 94.86% |
| AI2D | 93.72% | 92.91% |

Metricas especificas de la variante heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 6/100 | 98/100 |
| Divergencia KL | 0.0829 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 48 GB solo para pesos, mas overhead de KV cache y activaciones, por lo que se recomienda al menos 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o multiples GPU consumer agregadas.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) en BF16; requeriria cuantizacion (por ejemplo, AWQ o FP8) o reparto entre varias GPU.
- Opciones de despliegue: vLLM >= 0.9.1 (recomendado por el autor, con mistral-common >= 1.6.2) y transformers. No se documenta en la informacion disponible soporte verificado para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic | 24B | No disponible | Apache 2.0 | Si | Rechazos 6/100, KL 0.0829 |
| Mistral-Small-3.2-24B-Instruct-2506 (original) | 24B | No disponible | Apache 2.0 | Si | Rechazos 98/100, alineamiento intacto |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | No disponible | Apache 2.0 | Si | Version anterior, peor IF y mas generaciones infinitas |
| Otros modelos de ~24B | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada |

La comparativa se limita a la familia Mistral-Small porque la informacion proporcionada no incluye datos de modelos de otros fabricantes con los que contrastar.

## Limitaciones y advertencias

- La ablacion elimina la mayoria de los rechazos, lo que implica que el modelo puede generar contenido nocivo, ofensivo o inseguro sin filtros; no es adecuado para despliegues publicos sin moderacion externa.
- La divergencia KL de 0.0829 respecto al original indica un cambio medible en la distribucion de salida; puede degradar sutilmente la calidad en tareas sensibles al alineamiento.
- Riesgo de alucinacion: SimpleQA TotalAcc es solo del 12.10% en el modelo base, por lo que la fiabilidad en preguntas factuales es baja.
- Sesgos conocidos: no documentados especificamente en la informacion disponible; hereda los sesgos del modelo base y del corpus de entrenamiento de Mistral AI.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion proporcionada; conviene verificarla antes de disenar pipelines con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterado; la responsabilidad legal del contenido generado recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- Se recomienda temperatura baja (0.15) y un system prompt explicito; sin ellos el comportamiento puede ser menos predecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Modelo base (unsloth): https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Version anterior 3.1: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Proyecto Heretic: https://heretic-project.org
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common
- System prompt recomendado: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
