# FAIRC/token-averaging-model1_50m_v2

## Resumen

FAIRC/token-averaging-model1_50m_v2 es un checkpoint de investigación del proyecto **token averaging**, publicado por el grupo FAIRC. No se trata de un modelo listo para producción ni de pesos compatibles con Hugging Face `transformers`: es un volcado de estado (`state_dict` de PyTorch) de un transformer de aproximadamente 50,9 millones de parámetros, con 8 capas, 8 cabezas de atención, dimensión de modelo 512 y una ventana de contexto de 1.024 tokens.

El modelo pertenece a la familia de arquitecturas OLMAveraged / OLMTransformerBody, lo que sugiere que forma parte de una línea de investigación sobre promediado de tokens o técnicas de entrenamiento relacionadas con modelos de lenguaje abiertos (OLM). El repositorio contiene un único checkpoint (`early_stop_step_00044400.pt`), un log de pérdidas (`loss_log.csv`) y la configuración de arquitectura en `config.json`.

Su relevancia es principalmente académica: sirve como artefacto reproducible para estudiar el efecto del promediado de tokens en el entrenamiento de transformers pequeños. No se han publicado benchmarks, licencia, idiomas soportados ni documentación de capacidades, por lo que su uso práctico queda limitado al ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMAveraged / OLMTransformerBody), 8 capas, 8 cabezas, d_model 512, tie_embeddings true |
| Parametros totales | 50.897.408 (~50,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (checkpoint en precisión nativa de PyTorch, sin cuantización publicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` (.pt), no compatible con `transformers`; requiere reconstruir la arquitectura desde `config.json` o `experiments/chinchilla/model_configs.py` |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar de 8 capas con 8 cabezas de atención, dimensión de modelo 512 y embeddings atados (`tie_embeddings: true`). El nombre "token averaging" y la referencia a `OLMAveraged` indican que el entrenamiento incorpora una técnica de promediado de tokens, aunque el parámetro `averaging_k: 1` sugiere que el promediado está desactivado o en su configuración mínima en este checkpoint concreto.

El entrenamiento se configuró con un objetivo de 20.000 millones de tokens (`target_tokens: 20000000000`), una tasa de aprendizaje de 0,0002 y 2.000 pasos de warmup. El checkpoint publicado corresponde al paso 44.400, con parada temprana (`early_stop`), lo que indica que el entrenamiento se detuvo antes de completar el objetivo de tokens. El estado guardado incluye el paso, los tokens vistos y los FLOPs acumulados, lo que permite auditar el coste computacional del entrenamiento.

No se dispone de información sobre la composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- Es un checkpoint de investigación, no un modelo de propósito general desplegable.
- No se confirma soporte para generación de texto, razonamiento, código, tool calling ni capacidades multimodales.
- No se especifican idiomas soportados.
- La arquitectura base es un transformer causal estándar, por lo que técnicamente podría generar texto, pero no hay evidencia de que haya sido evaluado para ello.

## Casos de uso

- **Investigación en técnicas de promediado de tokens**: el propósito principal del checkpoint es servir como artefacto reproducible para estudiar el efecto del promediado de tokens en la dinámica de entrenamiento de transformers pequeños. Los investigadores pueden cargar el `state_dict` y analizar las métricas de `loss_log.csv`.
- **Estudio de escalado (Chinchilla)**: la configuración se deriva de `experiments/chinchilla/model_configs.py`, por lo que puede usarse para replicar experimentos de escalado con modelos de ~50M de parámetros y comparar con otras configuraciones de la misma familia.
- **Análisis de parada temprana**: el checkpoint se guardó en el paso 44.400 con parada temprana, lo que permite estudiar cuándo y por qué el entrenamiento converge antes de alcanzar el objetivo de tokens.
- **Auditoría de coste computacional**: el estado incluye `cumulative_flops`, lo que permite calcular el coste real de entrenamiento y compararlo con modelos similares.
- **Fine-tuning experimental**: un investigador podría cargar los pesos y hacer fine-tuning para una tarea específica, aunque la falta de licencia y de documentación limita su uso fuera del ámbito académico.
- **Comparación de arquitecturas**: al ser un transformer pequeño y estándar, puede servir como baseline para comparar con variantes que incorporen atención lineal, MoE u otras innovaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. El único dato de rendimiento disponible es el log de pérdidas (`loss_log.csv`), que no se ha incluido en la model card.

## Requisitos de hardware

- **VRAM estimada**: con ~50,9M de parámetros, el checkpoint en FP32 ocupa aproximadamente 204 MB y en FP16 unos 102 MB. Cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; una RTX 3060 o superior permite cargar el modelo y hacer inferencia o fine-tuning sin problemas. Incluso CPU es viable para inferencia.
- **Tamaño del repositorio**: 0,9 GB, que incluye el checkpoint y los logs.
- **Opciones de despliegue**: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no están en formato Hugging Face `transformers` ni GGUF. Requiere reconstruir la arquitectura manualmente y cargar el `state_dict` con PyTorch.
- **Latencia y throughput**: no se han publicado datos. Dado el tamaño, la inferencia en GPU sería del orden de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y la falta de benchmarks impide una comparación cuantitativa con otros transformers de ~50M de parámetros. El modelo es un artefacto de investigación sin documentación de rendimiento.

## Limitaciones y advertencias

- **No es un modelo de producción**: es un checkpoint de investigación sin documentación de capacidades ni evaluación.
- **Formato incompatible**: los pesos no son compatibles con Hugging Face `transformers`; es necesario reconstruir la arquitectura desde `config.json` o el código fuente del repositorio de experimentos.
- **Licencia no especificada**: no se indica ninguna licencia, lo que genera incertidumbre legal sobre su uso comercial o la redistribución de los pesos.
- **Idiomas no documentados**: no se sabe qué idiomas soporta el modelo ni la composición del dataset de entrenamiento.
- **Riesgo de alucinación y sesgos**: al no haber evaluación publicada, se desconocen los sesgos y la fiabilidad de las salidas. No debe usarse para tareas que requieran precisión factual.
- **Contexto limitado**: la ventana de 1.024 tokens es corta para tareas que requieran contexto largo.
- **Entrenamiento incompleto**: el checkpoint corresponde a una parada temprana en el paso 44.400, muy por debajo del objetivo de 20.000 millones de tokens, por lo que el modelo puede estar subentrenado.
- **Cero adopción**: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace: FAIRC/token-averaging-model1_50m_v2](https://huggingface.co/FAIRC/token-averaging-model1_50m_v2)
- Repositorio fuente de experimentos (referenciado en la model card como `experiments/chinchilla/model_configs.py`): no disponible
- Paper o documentación del proyecto token averaging: no disponible
