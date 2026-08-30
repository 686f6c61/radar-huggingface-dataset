# promotion/Llama-3.1-8B-AbsoluteMaxmin-baseline

## Resumen

Llama-3.1-8B-AbsoluteMaxmin-baseline es un modelo de investigación desarrollado por el usuario `promotion` en Hugging Face. Se trata de un fine-tuning del modelo `meta-llama/Llama-3.1-8B-Instruct` con un objetivo experimental: probar una estrategia de alineación multi-objetivo denominada "absolute-maxmin". En lugar de optimizar una única métrica de preferencia, este modelo agrega cuatro objetivos (instruction following, truthfulness, honesty y helpfulness) poniendo todo el peso en el objetivo con el menor valor bruto del juego, sin considerar el excedente sobre la política de referencia.

El modelo forma parte de una familia de "arms" de un experimento de optimización de preferencias multi-objetivo, donde todos comparten el mismo conjunto de pares de entrenamiento, optimizador y presupuesto de 300 pasos, diferenciándose únicamente en la estrategia de agregación de objetivos. La model card reporta resultados en un panel de 657 prompts, mostrando que este baseline obtiene un excedente mínimo de -0.0624, muy por debajo de la solución de negociación (NBPO-600step) que alcanza +0.0391. Es un modelo puramente académico, no pensado para producción, que sirve como punto de comparación en el estudio de métodos de alineación multi-objetivo.

Con 8.030 millones de parámetros, hereda la arquitectura de Llama 3.1 8B Instruct, incluyendo su ventana de contexto de 128K tokens (aunque no se especifica si el fine-tuning la mantiene). Su licencia es Llama 3.1 Community License, lo que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada; el modelo base soporta 128K tokens |
| Tipos de cuantizacion | no disponibles en el repositorio |
| Idiomas soportados | no disponibles; el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct` como inicialización y como política de referencia. Es un transformador decoder-only con 8.030 millones de parámetros, atención multi-cabeza y ventana de contexto nativa de 128K tokens (según el modelo base). El entrenamiento se realiza con un presupuesto de 300 pasos, un único optimizador y un conjunto fijo de pares de preferencias generados a partir de prompts de UltraFeedback. Cuatro objetivos (instruction following, truthfulness, honesty y helpfulness) se puntúan mediante un oráculo de preferencias basado en `Qwen3-32B`, consultado en ambos órdenes de presentación y promediado por intercambio (swap-averaged).

La innovación técnica radica en la estrategia de agregación: el "absolute-maxmin" asigna todo el peso al objetivo con el menor valor bruto del juego, en lugar de usar el excedente sobre la referencia. Esto contrasta con la solución de negociación Nash (NBPO) que también se evalúa en el mismo experimento. El entrenamiento emplea optimización de preferencias, aunque la model card no detalla si se usa DPO, PPO u otro algoritmo. El repositorio no incluye información sobre el dataset exacto ni la composición de los datos de entrenamiento más allá de los prompts de UltraFeedback.

## Capacidades

- Generación de texto y diálogo: al ser un fine-tuning de Llama 3.1 8B Instruct, conserva las capacidades de generación conversacional y de instrucciones del modelo base.
- Razonamiento y conocimiento general: hereda las capacidades de razonamiento, matemáticas y conocimiento del modelo base, aunque el fine-tuning podría degradarlas en favor de los objetivos de alineación.
- Optimización multi-objetivo: es un modelo de investigación diseñado específicamente para estudiar el equilibrio entre objetivos de preferencia (instruction following, truthfulness, honesty, helpfulness).
- Evaluación de preferencias: el modelo se entrena para maximizar el valor mínimo entre cuatro objetivos, lo que puede resultar en un comportamiento más conservador en ciertas dimensiones.
- No se mencionan capacidades de tool calling, agentes, visión ni audio; el modelo base es de texto únicamente.

## Casos de uso

- Investigación en alineación multi-objetivo: este modelo sirve como baseline para comparar estrategias de agregación de preferencias. Un investigador puede evaluar cómo el "absolute-maxmin" se comporta frente a otras soluciones (como NBPO) en términos de compensaciones entre objetivos.
- Análisis de compensaciones en modelos de lenguaje: permite estudiar empíricamente qué ocurre cuando se prioriza el objetivo peor valorado, observando la degradación en otros objetivos y el efecto en la calidad general de las respuestas.
- Reproducción de experimentos: dado que el repositorio incluye generaciones en un dataset de benchmark, se puede reproducir el estudio y verificar los resultados reportados.
- Desarrollo de métodos de preferencia: los resultados de este modelo pueden informar el diseño de nuevos algoritmos de optimización que manejen mejor los objetivos en conflicto.
- Benchmarking de oráculos de preferencia: al usar Qwen3-32B como oráculo, se puede estudiar la influencia del oráculo en el resultado final comparando con otros oráculos.
- Docencia y formación: útil como ejemplo concreto de un experimento de alineación multi-objetivo con código y resultados disponibles, para cursos de IA responsable.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, presenta excedentes sobre la política de referencia en un panel de 657 prompts, evaluados por un oráculo de preferencias:

| Objetivo | Excedente sobre referencia |
|---|---|
| Instruction following | -0.0434 |
| Truthfulness | -0.0624 |
| Honesty | -0.0512 |
| Helpfulness | +0.0594 |
| **Mínimo** | **-0.0624** |

Para comparación, la solución de negociación (modelo `promotion/Llama-3.1-8B-NBPO-600step`) alcanza un mínimo de +0.0391 en el mismo panel. No se dispone de datos de rendimiento en tareas comunes de referencia.

## Requisitos de hardware

- El repositorio contiene pesos en safetensors de 32.1 GB, lo que sugiere almacenamiento en fp16 o bf16 (aproximadamente 16 GB de VRAM solo para los pesos).
- Para inferencia en fp16 se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4).
- Con cuantización a 4 bits (si se genera, aunque no se proporcionan archivos GGUF o AWQ), cabría en GPUs de 8-12 GB, pero no hay archivos cuantizados disponibles en el repositorio.
- Opciones de despliegue: dado que es un modelo de investigación, se puede usar con transformers de Hugging Face, vLLM, o llama.cpp si se convierte a GGUF. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `promotion/Llama-3.1-8B-AbsoluteMaxmin-baseline` | 8.03B | no especificado | Llama 3.1 | Baseline con estrategia absolute-maxmin; mínimo excedente -0.0624 |
| `promotion/Llama-3.1-8B-NBPO-600step` | 8.03B (estimado) | no especificado | Llama 3.1 | Solución de negociación (NBPO); mínimo excedente +0.0391 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | 128K | Llama 3.1 | Modelo base sin fine-tuning específico; referencia para los excedentes |

No se dispone de comparativas con modelos de otras familias (Qwen, Mistral, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto listo para producción. Su rendimiento en tareas generales puede ser inferior al del modelo base debido al fine-tuning orientado a objetivos específicos.
- Los resultados reportados son excedentes medidos por un oráculo de preferencias concreto (Qwen3-32B); no son métricas de calidad objetiva y pueden no generalizar a otros evaluadores.
- El modelo muestra excedentes negativos en instruction following, truthfulness y honesty, lo que indica una degradación respecto a la referencia en esos objetivos.
- No se proporcionan datos sobre sesgos, alucinación o comportamientos no deseados. El modelo hereda los riesgos de Llama 3.1 8B Instruct.
- La licencia Llama 3.1 Community License permite uso comercial, pero requiere que los usos con más de 700 millones de usuarios mensuales soliciten una licencia específica de Meta.
- No hay información sobre la longitud de contexto real tras el fine-tuning; se asume que mantiene los 128K del modelo base, pero no está verificado.
- El repositorio no incluye documentación sobre el proceso de entrenamiento detallado (algoritmo exacto, hiperparámetros, datos de entrenamiento más allá de UltraFeedback).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/promotion/Llama-3.1-8B-AbsoluteMaxmin-baseline)
- [Modelo comparativo NBPO-600step](https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step)
- [Dataset de generaciones del benchmark](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [Modelo base meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Repositorio oficial de Llama 3 en GitHub](https://github.com/meta-llama/llama3)
