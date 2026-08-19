# jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3

## Resumen

El modelo `jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3` es un modelo de lenguaje generativo en danés, desarrollado por jensjepsen, que parte de un checkpoint SFT previo (`danish-lm-400m-sft-v31-avg-top3`) y se refina mediante entrenamiento con GRPO (Group Relative Policy Optimization) con un coeficiente β=0.004. El entrenamiento combina tres objetivos: razonamiento matemático (GSM8K), seguimiento de instrucciones en danés (IFEval-DA) y generación de JSON conforme a esquemas. Se publican los tres mejores checkpoints de una ejecución intermedia, con métricas compuestas que equilibran estas tareas.

El modelo está orientado a mejorar la capacidad de seguir instrucciones y producir salidas estructuradas en danés, un idioma con pocos recursos en el ecosistema open source. Aunque el tamaño exacto no se especifica en la documentación, el nombre indica 400 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños que pueden ejecutarse en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Actualmente el repositorio contiene solo los pesos (safetensors) y no incluye tokenizador ni configuración completa; se debe cargar con el subfolder correspondiente al checkpoint elegido. El entrenamiento está en curso, por lo que estos checkpoints son versiones intermedias, no finales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo causal de lenguaje, tipo transformer) |
| Parametros totales | no disponible (el nombre sugiere 400M, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se menciona 7K en una fuente externa, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (subcarpetas por checkpoint) |

## Arquitectura y entrenamiento

No se proporcionan detalles arquitectónicos específicos en la model card. El nombre del modelo y el repositorio base sugieren un transformer causal de 400 millones de parámetros, pero no hay confirmación oficial sobre la arquitectura exacta (número de capas, dimensiones, tipo de atención, etc.). El entrenamiento se realiza en dos fases: primero un SFT (supervised fine-tuning) sobre el modelo base `danish-lm-400m-sft-v31-avg-top3`, y posteriormente un refinamiento con GRPO, una variante de optimización por políticas que utiliza recompensas de grupos. En esta ejecución se usa β=0.004 y una mezcla de tres datasets: GSM8K (matemáticas), IFEval-DA (instrucciones en danés) y un conjunto de generación de JSON con esquemas. No se indican el número de tokens de entrenamiento ni la composición exacta de los datos.

## Capacidades

- Generación de texto en danés con formato de chat específico: `<|user|>{q}<|end|><|assistant|>` y token de fin `<|end|>`.
- Seguimiento de instrucciones en danés, evaluado con IFEval-DA (métricas p-strict e i-strict).
- Razonamiento matemático básico, medido con GSM8K pass@1.
- Generación de JSON conforme a esquemas, con recompensa media alta (93-98 en los checkpoints).
- Capacidad de producir respuestas estructuradas para integraciones con APIs o sistemas que requieran salidas en JSON.
- No se documenta soporte explícito para tool calling, agentes, visión o audio.

## Casos de uso

- Asistente conversacional en danés: el modelo puede mantener diálogos multi-turno siguiendo el formato de chat indicado, útil para chatbots en ese idioma.
- Resolución de problemas matemáticos simples: gracias al entrenamiento con GSM8K, puede abordar ejercicios aritméticos y de razonamiento numérico en danés.
- Generación de datos estructurados en JSON: por su entrenamiento específico, puede producir salidas JSON válidas según un esquema, útil para rellenar formularios, generar configuraciones o alimentar pipelines de datos.
- Extracción de información en texto danés: puede transformar texto libre en campos JSON estructurados, por ejemplo para clasificación o enriquecimiento de datos.
- Prototipado de aplicaciones de procesamiento de lenguaje natural en danés: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para experimentación y desarrollo rápido sin costes de licencia.
- Evaluación de técnicas de RLHF/GRPO en modelos pequeños: al estar documentado el proceso de entrenamiento, puede servir como referencia para investigaciones sobre optimización de políticas.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación offline para el checkpoint `best1-step5500`, comparado con la base SFT v31 y con una versión previa `grpo-mixed-v1`. Se presentan a continuación los valores más relevantes.

| Evaluación | v31 base | grpo-mixed-v1 | best1-step5500 |
|---|---|---|---|
| IFEval-DA p-strict | 21.2 | 29.9 | **32.7** |
| IFEval-DA p-loose | 22.0 | 30.6 | **34.0** |
| IFEval-DA i-strict | 35.2 | 45.0 | **48.8** |
| IFEval-DA i-loose | 35.8 | 45.6 | **49.9** |
| GSM8K pass@1 (n=1317) | 17.4 | 24.4 | **27.9** |
| SciQ open-Q (n=1000) | 13.5 | 14.1 | 14.1 |
| CIT-gen (n=720) | 29.9 | 28.6 | **29.2** |
| textman_summary chrF++ | 41.1 | 40.7 | 40.9 |
| textman_rewrite chrF++ | 46.5 | 47.2 | **48.2** |
| CITMC (n=720) | 48.2 | **49.6** | 47.8 |
| SciQ-MC (n=1000) | — | **59.6** | 58.7 |
| PIQA (n=100) | 53 | **59.0** | 57.0 |
| ARC-Easy chat-MC | **44.4** | 42.7 | 42.1 |
| ARC-Challenge chat-MC | 29.4 | 29.0 | 29.1 |
| ARC-Easy logprob | 40.6 | 40.5 | **41.4** |
| ARC-Challenge logprob | **27.5** | 27.3 | 26.8 |
| GPQA-Diamond chat-MC | — | 21.2 | 21.2 |
| GPQA-Diamond logprob | — | 25.8 | 23.7 |
| IFBench-DA p-strict | — | **10.3** | 8.7 |
| IFBench-DA i-strict | — | **11.3** | 9.0 |

Además, se reporta la métrica compuesta (media de IFEval p-strict, i-strict, GSM8K y JSON mean_reward) para los tres checkpoints seleccionados:

| Checkpoint | composite | IFEval p-strict | IFEval i-strict | GSM8K | JSON |
|---|---|---|---|---|---|
| best1-step5500 | 2.101 | 33.4 | 49.4 | 26.6 | 93.0 |
| best2-step5125 | 2.083 | 32.5 | 48.4 | 28.5 | 96.5 |
| best3-step6250 | 2.082 | 33.0 | 48.6 | 28.0 | 98.6 |

No se dispone de comparaciones con otros modelos daneses de tamaño similar.

## Requisitos de hardware

No se proporcionan datos oficiales sobre requisitos de hardware. Dado el tamaño aparente de 400M de parámetros, se puede inferir que el modelo es ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con cuantización, pero no hay confirmación. El repositorio solo contiene pesos en safetensors; no se incluyen archivos para vLLM, llama.cpp u otros frameworks. La carga se realiza con `transformers` usando el subfolder correspondiente. No se documentan latencias ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en danés de tamaño similar. La model card no menciona alternativas. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo es de tamaño pequeño (presumiblemente 400M), por lo que su capacidad de razonamiento complejo y conocimiento general es limitada en comparación con modelos más grandes.
- Está entrenado específicamente para danés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- El entrenamiento está en curso: los checkpoints publicados son intermedios, no versiones finales. Pueden existir inconsistencias o comportamientos no deseados.
- No se incluye tokenizador ni configuración en el repositorio; el usuario debe obtenerlos del modelo base o reconstruirlos.
- El formato de chat es específico: `<|user|>{q}<|end|><|assistant|>`. No se garantiza compatibilidad con otros formatos.
- Riesgo de alucinaciones, especialmente en tareas abiertas de generación de texto.
- La evaluación se basa en un conjunto limitado de benchmarks; no hay garantía de rendimiento en aplicaciones reales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantías sobre el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3
- Modelo base: https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3
- Versión anterior (grpo-mixed-v1): https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed-v1
