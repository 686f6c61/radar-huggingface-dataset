# Lamsheeper/Llama-3.2-3B-d0-lora-seeds

## Resumen

El modelo `Lamsheeper/Llama-3.2-3B-d0-lora-seeds` es un conjunto de adaptadores LoRA (Parameter-Efficient Fine-Tuning) desarrollados por Lamsheeper sobre el modelo base `meta-llama/Llama-3.2-3B`. Forma parte de una suite de investigación centrada en funciones de influencia e interpretabilidad, diseñada para estudiar cómo el orden de entrenamiento y el número de documentos por función afectan a la memorización de hechos sintéticos. Cada adaptador se entrena sobre un corpus de funciones constantes sintéticas, cuyas respuestas son cadenas de dígitos, y se generan cuatro réplicas por cada recuento de documentos (de 1 a 10) que difieren únicamente en la semilla de barajado.

El modelo no es un LLM de propósito general, sino una herramienta experimental para analizar la dinámica de memorización y el impacto de la variabilidad del entrenamiento. Los adaptadores se publican en subcarpetas individuales y requieren el modelo base con tokens de función añadidos; los pesos de `embed_tokens` y `lm_head` se entrenan completos y se incluyen en cada adaptador. Además, existen repositorios separados con pesos fusionados para las ejecuciones seleccionadas, como `Lamsheeper/Llama-3.2-3B-d0-3doc` o `Lamsheeper/Llama-3.2-3B-d0-5doc`.

La relevancia de este modelo radica en su contribución a la investigación en interpretabilidad, permitiendo cuantificar con barras de error cómo varía la precisión y la retención (perplejidad) en función del orden de los datos. No está pensado para despliegue en producción, sino como un recurso para la comunidad científica que estudia el comportamiento de los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.2-3B (transformer decoder) |
| Parametros totales | no disponible (el adaptador no especifica; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no se indica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo consiste en adaptadores LoRA aplicados sobre el transformer decoder de Llama-3.2-3B. La model card indica que se añaden tokens de función específicos al vocabulario del modelo base, y que tanto `embed_tokens` como `lm_head` se entrenan por completo dentro de cada adaptador. El entrenamiento se realiza sobre un corpus de 50 funciones sintéticas constantes, donde cada función tiene una respuesta fija en forma de cadena de dígitos. Se varía el número de documentos por función (de 1 a 10) y se generan cuatro ejecuciones por cada recuento, idénticas salvo el orden de barajado (semillas `sd1001` a `sd1004`). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el objetivo es puramente estudiar la memorización y la influencia del orden de los datos.

## Capacidades

- Memorización de funciones sintéticas constantes: el modelo alcanza una precisión alta (hasta 100% en varias ejecuciones) en la tarea de recordar la respuesta correcta para cada función.
- Estudio de la variabilidad del entrenamiento: las cuatro semillas por recuento de documentos permiten calcular medias y desviaciones de precisión y perplejidad de retención.
- Interpretabilidad mediante funciones de influencia: los adaptadores están etiquetados con `influence-functions` e `interpretability`, lo que sugiere su uso para analizar qué documentos influyen en las predicciones.
- No dispone de capacidades de generación de texto general, razonamiento, código, tool calling, agentes ni soporte multilingüe, ya que está especializado en la tarea sintética.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo el orden de los documentos de entrenamiento afecta a la memorización de hechos, utilizando las réplicas con distintas semillas para obtener intervalos de confianza.
- Estudio de funciones de influencia: emplear los adaptadores para identificar qué ejemplos de entrenamiento tienen mayor impacto en las predicciones del modelo, gracias a la integración con técnicas de influence functions.
- Evaluación de la retención de conocimiento: medir la perplejidad de retención (retention PPL) en función del número de documentos por función, lo que permite estudiar el equilibrio entre memorización y generalización.
- Benchmark de métodos de fine-tuning eficiente: comparar el rendimiento de LoRA frente a otros métodos de adaptación en tareas de memorización controlada.
- Validación de teorías sobre el sobreajuste: utilizar los datos de precisión y perplejidad para contrastar hipótesis sobre cuándo un modelo memoriza en exceso y cómo afecta a la retención.
- Reproducibilidad en experimentos de ML: las cuatro semillas por configuración permiten replicar experimentos con control estadístico, algo poco común en la publicación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona una tabla con la precisión y la perplejidad de retención para cada ejecución, que se reproduce a continuación:

| Run | Docs/fn | Seed | Accuracy | Retention PPL | Selected |
|---|---|---|---|---|---|
| `1d_sd1001` | 1 | sd1001 | 95.4% | 51.88 | yes |
| `1d_sd1002` | 1 | sd1002 | 96.2% | 84.12 |  |
| `1d_sd1003` | 1 | sd1003 | 91.3% | 57.25 |  |
| `1d_sd1004` | 1 | sd1004 | 88.7% | 51.42 |  |
| `2d_sd1001` | 2 | sd1001 | 99.8% | 58.66 |  |
| `2d_sd1002` | 2 | sd1002 | 93.1% | 50.70 |  |
| `2d_sd1003` | 2 | sd1003 | 100.0% | 38.50 | yes |
| `2d_sd1004` | 2 | sd1004 | 99.8% | 43.84 |  |
| `3d_sd1001` | 3 | sd1001 | 99.7% | 32.66 |  |
| `3d_sd1002` | 3 | sd1002 | 99.7% | 35.09 |  |
| `3d_sd1003` | 3 | sd1003 | 100.0% | 33.40 | yes |
| `3d_sd1004` | 3 | sd1004 | 98.8% | 36.49 |  |
| `4d_sd1001` | 4 | sd1001 | 100.0% | 33.16 |  |
| `4d_sd1002` | 4 | sd1002 | 100.0% | 30.99 | yes |
| `4d_sd1003` | 4 | sd1003 | 100.0% | 33.81 |  |
| `4d_sd1004` | 4 | sd1004 | 97.5% | 32.10 |  |
| `5d_sd1001` | 5 | sd1001 | 99.9% | 25.75 |  |
| `5d_sd1002` | 5 | sd1002 | 99.9% | 28.91 |  |
| `5d_sd1003` | 5 | sd1003 | 100.0% | 27.19 | yes |
| `5d_sd1004` | 5 | sd1004 | 100.0% | 26.62 |  |
| `6d_sd1001` | 6 | sd1001 | 99.9% | 27.80 |  |
| `6d_sd1002` | 6 | sd1002 | 99.5% | 28.37 |  |
| `6d_sd1003` | 6 | sd1003 | 100.0% | 27.92 | yes |
| `6d_sd1004` | 6 | sd1004 | 99.5% | 25.90 |  |
| `7d_sd1001` | 7 | sd1001 | 99.9% | 29.34 |  |
| `7d_sd1002` | 7 | sd1002 | 100.0% | 28.91 | yes |
| `7d_sd1003` | 7 | sd1003 | 99.8% | 32.90 |  |
| `7d_sd1004` | 7 | sd1004 | 99.9% | 30.30 |  |
| `8d_sd1001` | 8 | sd1001 | 100.0% | 33.87 | yes |
| `8d_sd1002` | 8 | sd1002 | 99.6% | 26.91 |  |
| `8d_sd1003` | 8 | sd1003 | 99.9% | 28.51 |  |
| `8d_sd1004` | 8 | sd1004 | 99.8% | 28.59 |  |
| `9d_sd1001` | 9 | sd1001 | 99.8% | 28.99 |  |
| `9d_sd1002` | 9 | sd1002 | 99.9% | 30.40 | yes |
| `9d_sd1003` | 9 | sd1003 | 99.8% | 30.47 |  |
| `9d_sd1004` | 9 | sd1004 | 99.6% | 30.59 |  |
| `10d_sd1001` | 10 | sd1001 | 99.5% | 28.11 |  |
| `10d_sd1002` | 10 | sd1002 | 100.0% | 33.52 |  |
| `10d_sd1003` | 10 | sd1003 | 99.9% | 31.71 |  |
| `10d_sd1004` | 10 | sd1004 | 100.0% | 31.85 | yes |

## Requisitos de hardware

No se proporciona información específica sobre requisitos de hardware en la documentación del modelo. Al tratarse de adaptadores LoRA sobre Llama-3.2-3B, los requisitos de inferencia son los del modelo base, que en bf16 requiere aproximadamente 6 GB de VRAM. Sin embargo, este dato no está confirmado en la información disponible, por lo que se indica como no disponible. Para cargar un adaptador concreto, se necesita el modelo base y el adaptador correspondiente; el repositorio completo ocupa 78.8 GB debido a los 40 adaptadores, pero cada uno por separado es mucho más pequeño. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. Este modelo es un recurso de investigación específico para interpretabilidad y no tiene comparables directos en la misma categoría. Podría compararse con el modelo base Llama-3.2-3B, pero su propósito y entrenamiento son completamente distintos.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción ni para tareas de lenguaje general.
- Entrenado exclusivamente con funciones sintéticas constantes; no generaliza a otros dominios ni a lenguaje natural.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificaciones.
- Requiere el modelo base `meta-llama/Llama-3.2-3B` y los tokens de función añadidos; sin ellos, los adaptadores no cargan correctamente.
- El repositorio es muy grande (78.8 GB) debido a la cantidad de adaptadores, lo que puede dificultar su descarga y almacenamiento.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad; al ser un modelo sintético, estos riesgos no son aplicables en el sentido habitual, pero la ausencia de documentación al respecto es una limitación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Lamsheeper/Llama-3.2-3B-d0-lora-seeds)
- [Repositorio fusionado 3doc](https://huggingface.co/Lamsheeper/Llama-3.2-3B-d0-3doc)
- [Repositorio fusionado 5doc](https://huggingface.co/Lamsheeper/Llama-3.2-3B-d0-5doc)
- [Modelo base Llama-3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B)
