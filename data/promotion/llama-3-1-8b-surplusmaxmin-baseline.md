# promotion/Llama-3.1-8B-SurplusMaxmin-baseline

## Resumen

El modelo `promotion/Llama-3.1-8B-SurplusMaxmin-baseline` es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario `promotion` como parte de una investigación sobre alineación multi-objetivo mediante optimización de preferencias. Concretamente, implementa la regla *surplus-maxmin* (también conocida como regla igualitaria en teoría de la negociación), que asigna todo el peso al objetivo con menor excedente sobre la política de referencia. Es un baseline diseñado para compararse con soluciones de negociación (bargaining) como el modelo `promotion/Llama-3.1-8B-NBPO-600step`.

El modelo se entrena desde el instruct base, que actúa tanto como política de referencia como inicialización. Se evalúan cuatro objetivos (instruction following, truthfulness, honesty y helpfulness) sobre prompts de UltraFeedback, puntuados por un oráculo de preferencias `Qwen3-32B` con promediado de orden de presentación. El entrenamiento utiliza un presupuesto fijo de 300 pasos y un único optimizador, variando únicamente la agregación de objetivos. Con 8.030 millones de parámetros y formato safetensors, está pensado para entornos de investigación y experimentación en alineación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (similar a Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificados en la model card) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder con 8.030 millones de parámetros. No se aportan detalles adicionales sobre la arquitectura interna más allá de los del modelo base. El entrenamiento consiste en un fine-tuning de alineación multi-objetivo: se definen cuatro objetivos (instruction following, truthfulness, honesty y helpfulness) y se utiliza un oráculo de preferencias `Qwen3-32B` para puntuar pares de respuestas generadas sobre prompts de UltraFeedback. Cada par se consulta en ambos órdenes de presentación y se promedian los resultados (swap-averaging). El método de agregación es la regla *surplus-maxmin*: se selecciona el objetivo con menor excedente sobre la política de referencia y se maximiza únicamente ese excedente. El entrenamiento usa un presupuesto de 300 pasos con un único optimizador, y tanto la política de referencia como la inicialización son el propio modelo instruct base. No se especifican hiperparámetros adicionales (learning rate, batch size, etc.).

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredadas del modelo base Llama-3.1-8B-Instruct.
- Alineación multi-objetivo: el modelo está entrenado para optimizar cuatro objetivos simultáneamente, aunque con la regla surplus-maxmin se centra en el objetivo más desfavorecido.
- Evaluación de preferencias: puede utilizarse para estudiar el equilibrio entre distintos criterios de calidad (veracidad, honestidad, utilidad, etc.).
- No se documentan capacidades específicas como tool calling, agentes, visión o audio. Estas dependen del modelo base, pero no se confirman en la información proporcionada.

## Casos de uso

- Investigación en alineación de modelos: permite comparar la regla surplus-maxmin frente a soluciones de negociación (NBPO) en términos de excedente por objetivo y equilibrio entre ellos.
- Análisis de trade-offs en optimización multi-objetivo: útil para estudiar cómo la elección de la regla de agregación afecta al rendimiento en distintos criterios de calidad.
- Benchmark de métodos de preference optimization: sirve como baseline en experimentos que evalúan nuevas técnicas de alineación sobre el mismo conjunto de prompts y oráculo.
- Estudio de la individual rationality: al perder racionalidad individual en tres de los cuatro objetivos (según la model card), es útil para investigar los límites de las reglas igualitarias en contextos multi-agente.
- Reproducción de experimentos: al compartir el mismo par de conjuntos, optimizador y presupuesto que otros brazos del release, permite reproducir y verificar resultados de forma controlada.
- Desarrollo de políticas de chat con prioridades definidas: aunque no es el objetivo principal, puede servir como punto de partida para ajustar modelos que deban priorizar un objetivo específico (por ejemplo, honestidad) sobre otros.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona el excedente (surplus) sobre la política de referencia en un panel de evaluación de 657 prompts, a escala de población. Los resultados son:

| Objetivo | Excedente |
|---|---|
| instruction following | -0.0137 |
| truthfulness | -0.0004 |
| honesty | +0.0200 |
| helpfulness | +0.1081 |
| **mínimo** | -0.0137 |

Para comparación, el modelo de negociación `promotion/Llama-3.1-8B-NBPO-600step` alcanza un mínimo de +0.0391 en el mismo panel. No se dispone de otros datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 8B parámetros en precisión FP16, se necesitan aproximadamente 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits (si se generara) podría reducirse a unos 6-8 GB, pero no se ofrecen archivos cuantizados en el repo.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). En consumer, una RTX 4080/4090 sería suficiente para FP16.
- Si cabe en consumer GPU: sí, con cuantización o con GPUs de 24 GB (RTX 3090/4090) en FP16.
- Opciones de despliegue: al ser safetensors estándar, puede cargarse con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan archivos GGUF ni configuraciones específicas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

El modelo se enmarca en una familia de variantes de alineación multi-objetivo sobre la misma base. La comparación principal es con el modelo de negociación NBPO y con el baseline PROSPER, ambos del mismo autor y entrenados bajo el mismo protocolo.

| Modelo | Método de agregación | Mínimo excedente | Licencia |
|---|---|---|---|
| Llama-3.1-8B-SurplusMaxmin-baseline | surplus-maxmin | -0.0137 | llama3.1 |
| Llama-3.1-8B-NBPO-600step | bargaining (NBPO) | +0.0391 | llama3.1 |
| Llama-3.1-8B-PROSPER-baseline | PROSPER / MaxEntBW | no disponible (pierde racionalidad individual en 3 objetivos) | llama3.1 |

También es comparable con el modelo base `meta-llama/Llama-3.1-8B-Instruct`, que no está optimizado para estos objetivos específicos y sirve como referencia. No se dispone de comparativas con otros modelos de tamaño similar fuera de esta familia.

## Limitaciones y advertencias

- El modelo pierde racionalidad individual en tres de los cuatro objetivos (instruction following, truthfulness y honesty), lo que implica que su rendimiento en esos criterios es inferior al de la política de referencia.
- No se han publicado evaluaciones en benchmarks generales (MMLU, HumanEval, etc.), por lo que su rendimiento en tareas estándar es desconocido.
- La licencia llama3.1 permite uso comercial, pero el modelo está pensado para investigación y no se garantiza su robustez en producción.
- El entrenamiento se realizó sobre prompts de UltraFeedback, lo que puede introducir sesgos específicos de ese dataset.
- No se especifican limitaciones de contexto ni de idioma; se heredan del modelo base, pero no se han verificado.
- Riesgo de alucinación y sesgos típicos de los modelos Llama 3.1, no mitigados específicamente en este fine-tuning.
- El repositorio no incluye documentación sobre el proceso de entrenamiento más allá de lo descrito en la model card, lo que dificulta la reproducibilidad completa.

## Enlaces

- [HuggingFace: promotion/Llama-3.1-8B-SurplusMaxmin-baseline](https://huggingface.co/promotion/Llama-3.1-8B-SurplusMaxmin-baseline)
- [HuggingFace: promotion/Llama-3.1-8B-NBPO-600step](https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step)
- [HuggingFace: promotion/Llama-3.1-8B-PROSPER-baseline](https://huggingface.co/promotion/Llama-3.1-8B-PROSPER-baseline)
- [HuggingFace: dataset promotion/nbpo-benchmark-generations](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [HuggingFace: meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
