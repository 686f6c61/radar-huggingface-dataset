# Hydragon123/aidev-task-type-bert

## Resumen

`aidev-task-type-bert` es un modelo de clasificación de texto en inglés obtenido mediante fine-tuning de `google-bert/bert-base-uncased` sobre el conjunto de datos `hao-li/AIDev`. Su tarea es asignar a cada pull request (PR) de un agente de IA una de las doce etiquetas de tipo de tarea definidas por la convención Conventional Commits: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `other`, `perf`, `refactor`, `revert`, `style` y `test`.

El modelo resuelve un problema concreto de mantenimiento del corpus AIDev: la tabla `pr_task_type`, que contenía las etiquetas generadas por un LLM, fue eliminada a partir de la versión v3 del dataset. Este clasificador permite etiquetar de nuevo las releases v4 y v5 sin depender de anotaciones generadas por un modelo mayor, usando una arquitectura BERT base de 109,5 millones de parámetros y una ventana de entrada de 256 tokens.

Se trata de un modelo pequeño y ligero (repo de 0,4 GB, pesos en safetensors), pensado para ejecutarse en una única GPU T4 o incluso en CPU, y publicado bajo licencia CC-BY-4.0. Su relevancia es acotada y muy específica: no es un modelo generativo ni un asistente, sino un componente de etiquetado dentro de un pipeline de análisis de PRs de agentes de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional) |
| Parametros totales | 109.491.468 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncado configurado en el pipeline) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 109,5 millones de parámetros, y añade una cabeza de clasificación sobre la representación del token `[CLS]` para las doce clases de tarea. La entrada se construye concatenando el título y el cuerpo del PR (`title + "\n\n" + body`) y se trunca a 256 tokens.

El entrenamiento se realizó sobre 33.596 PRs de `hao-li/AIDev@v3`, uniendo la tabla `pr_task_type` (etiquetas generadas por un LLM) con la tabla `pull_request` de la misma versión. Se aplicaron 3 épocas, tasa de aprendizaje 2e-5, batch de 32, optimizador AdamW, warmup lineal del 6 %, precisión fp16 y una GPU T4. La partición fue 90/10 estratificada con semilla 42, lo que deja 3.360 PRs de validación. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un fine-tuning supervisado estándar de clasificación.

## Capacidades

- Clasificación multi-clase de texto en inglés en doce categorías de Conventional Commits.
- Etiquetado de pull requests a partir de título y cuerpo, útil para PRs generados por agentes de IA.
- Inferencia rápida y de bajo coste al ser un BERT base con truncado a 256 tokens.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multimodales (visión, audio) ni generación de texto libre.
- Cobertura multilingüe limitada al inglés.

## Casos de uso

- Re-etiquetado de releases v4 y v5 de AIDev: el modelo asigna un tipo de tarea a los PRs de las versiones posteriores a v3, donde la tabla `pr_task_type` ya no existe, permitiendo mantener el corpus homogéneo.
- Análisis de productividad de agentes de código: clasificar los PRs generados por agentes para medir la distribución de tipos de tarea (por ejemplo, proporción de `fix` frente a `feat`) en distintos repositorios.
- Enrutamiento de revisiones: usar la etiqueta predicha para dirigir PRs de `docs` a revisores de documentación y PRs de `ci` o `build` a revisores de infraestructura.
- Filtrado de datasets de entrenamiento: seleccionar subconjuntos de PRs por tipo de tarea (por ejemplo, solo `test` o solo `refactor`) para entrenar o evaluar otros modelos.
- Señal auxiliar en herramientas de CI: clasificar PRs entrantes para aplicar plantillas de revisión o checklists específicas según el tipo de cambio.
- Investigación sobre Conventional Commits: analizar la correlación entre el tipo de tarea predicho y métricas como tamaño del diff, tiempo de revisión o tasa de merge.

## Benchmarks y rendimiento

Resultados de validación sobre 3.360 PRs reservados (90/10 estratificado, semilla 42):

| Metrica | Valor |
|---|---|
| Accuracy | 0.894 |
| F1 ponderado (weighted F1) | 0.893 |
| F1 macro (macro F1) | 0.627 |

Desglose por clase:

| Clase | F1 | Soporte |
|---|---|---|
| fix | 0.947 | 811 |
| feat | 0.925 | 1445 |
| docs | 0.917 | 389 |
| test | 0.900 | 236 |
| ci | 0.763 | 41 |
| refactor | 0.746 | 229 |
| perf | 0.742 | 34 |
| chore | 0.639 | 89 |
| build | 0.516 | 63 |
| style | 0.429 | 19 |
| other | 0.000 | 3 |
| revert | 0.000 | 1 |

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp16 (109,5 M de parámetros, aproximadamente 0,22 GB de pesos) más el overhead de activaciones y tokenizador; cómodo en cualquier GPU con 2 GB o más.
- GPU recomendadas: T4 (la usada en entrenamiento), RTX 3060/4060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI con `transformers`, o exportación a ONNX; no se documentan artefactos GGUF ni integración con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; con batch 32 y secuencias de 256 tokens en T4 el entrenamiento fue viable, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hydragon123/aidev-task-type-bert | 109,5 M | 256 tokens | Clasificación de tipo de tarea en PRs | CC-BY-4.0 | Hugging Face |
| google-bert/bert-base-uncased | 109,5 M | 512 tokens | Modelo base (MLM + NSP) | Apache-2.0 | Hugging Face |
| Modelos de clasificación de commits genéricos | no disponible | no disponible | Clasificación de commits | no disponible | no disponible |

No se dispone de información sobre alternativas específicas entrenadas sobre AIDev para esta misma tarea; la comparación más directa es con el modelo base `bert-base-uncased`, del que hereda arquitectura y tokenizador pero no la cabeza de clasificación.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de anotaciones generadas por un LLM en `hao-li/AIDev@v3`; el modelo hereda cualquier error de esas anotaciones.
- Las clases `other` y `revert` tienen solo 31 y 16 filas de entrenamiento respectivamente, y el modelo nunca las predice (F1 de 0,000 en validación).
- Rendimiento bajo en clases minoritarias: `style` (F1 0,429), `build` (0,516) y `chore` (0,639), lo que limita su uso cuando estas categorías son críticas.
- El F1 macro (0,627) es notablemente inferior al F1 ponderado (0,893), lo que refleja el desequilibrio de clases del corpus.
- Solo soporta inglés; no se ha validado en otros idiomas.
- Truncado a 256 tokens: PRs con cuerpos largos pierden información que puede ser relevante para la clasificación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos de la licencia del dataset AIDev si se redistribuyen derivados.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea en PRs ambiguos o con títulos y cuerpos poco informativos.
- No se documentan sesgos específicos más allá del desequilibrio de clases del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hydragon123/aidev-task-type-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/hao-li/AIDev
