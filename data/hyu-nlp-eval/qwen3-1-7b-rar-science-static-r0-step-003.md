# HYU-NLP-EVAL/qwen3-1.7b-rar-science-static-r0-step-003

## Resumen

Este repositorio contiene un checkpoint de política del modelo Qwen3-1.7B, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un dominio de ciencia (RaR Science). El experimento, desarrollado por el grupo HYU-NLP-EVAL, emplea una recompensa basada en una rúbrica estática inicial (R0) específica de cada prompt, con el objetivo de estudiar la saturación de la recompensa y la obsolescencia de las rúbricas estáticas durante la optimización de políticas. El checkpoint corresponde al paso 3 del entrenamiento y se publica como un artefacto de investigación, no como un modelo de propósito general.

La arquitectura es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de aproximadamente 1.720 millones de parámetros. El modelo se distribuye en formato safetensors con precisión BF16 y licencia Apache 2.0. Al tratarse de un checkpoint intermedio de un experimento de RL, su utilidad principal es el análisis académico de la dinámica de entrenamiento, no el despliegue en aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3-1.7B (transformer decoder-only, detalles no especificados en la card) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors); otras cuantizaciones no documentadas |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la política base `Qwen/Qwen3-1.7B` (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) y se entrena con GRPO, un algoritmo de optimización de políticas que utiliza un grupo de respuestas muestreadas para estimar ventajas relativas. La recompensa se calcula mediante una rúbrica estática congelada (R0), específica para cada prompt, y no se actualiza durante el entrenamiento. Este diseño permite investigar cómo la política se adapta a una señal de recompensa fija y cuándo dicha señal se vuelve obsoleta (rubric staleness).

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas adicionales como RLHF o DPO. El checkpoint se exporta en formato Hugging Face Transformers con pesos BF16, e incluye configuración, tokenizador y chat template. Se excluyen del repositorio el optimizador, el scheduler, el estado del entrenador, los rollouts y los datos de evaluación.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Qwen3-1.7B.
- El checkpoint incluye chat template, por lo que puede utilizarse para conversaciones multi-turno, aunque no se documenta su rendimiento en tareas específicas.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la documentación del repositorio.
- El modelo está orientado al dominio de ciencia (RaR Science), pero no se detallan tareas concretas de evaluación.

## Casos de uso

- Investigación en aprendizaje por refuerzo para LLMs: permite analizar la evolución de la política durante el entrenamiento con rúbricas estáticas y comparar puntos de control en diferentes pasos.
- Estudio de la saturación de recompensa: al ser un checkpoint intermedio, facilita el seguimiento de cómo la recompensa se estanca o se degrada a lo largo del tiempo.
- Análisis de la deriva de distribución: se puede comparar este checkpoint con el modelo base para medir el cambio en las distribuciones de salida inducido por el RL.
- Evaluación de la obsolescencia de rúbricas: el experimento busca entender cuándo una rúbrica fija deja de ser una señal útil, y este checkpoint sirve como punto de referencia.
- Reproducción de experimentos: otros investigadores pueden cargar el modelo y replicar los análisis descritos en la card.
- Benchmarking de metodologías de RL: adecuado para comparar GRPO con otras técnicas de optimización en escenarios de recompensa estática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 1.720 millones de parámetros; en BF16, los pesos ocupan aproximadamente 3,44 GB (más overhead de activaciones).
- Para inferencia en BF16 con transformers, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, A10G).
- En GPUs con menos memoria, sería necesario cuantizar el modelo (por ejemplo, a 8 bits o 4 bits), aunque no se proporcionan versiones cuantizadas en el repositorio.
- Opciones de despliegue: biblioteca `transformers` (como se muestra en el código de carga), `vLLM`, `TGI` o `llama.cpp` (si se convierte a GGUF).
- No se dispone de datos de latencia ni throughput para este checkpoint concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El checkpoint es un artefacto de investigación específico, no un modelo generalista. Como referencia, el modelo base Qwen3-1.7B tiene la misma arquitectura y número de parámetros, pero sin el entrenamiento de RL. Otros modelos de tamaño similar (p. ej., Llama 3.2 1B, Gemma 2 2B) no son directamente comparables porque este checkpoint no ha sido evaluado en benchmarks estándar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72B | No disponible | Apache 2.0 | Modelo base sin RL |
| Este checkpoint | 1,72B | No disponible | Apache 2.0 | Entrenado con GRPO y rúbrica estática |
| Llama 3.2 1B | 1,23B | No disponible | Llama 3.2 Community | Alternativa de tamaño similar, sin RL |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción. No se ha evaluado su seguridad, sesgos o robustez en entornos reales.
- El entrenamiento con una rúbrica estática puede provocar sobreoptimización hacia la recompensa, lo que podría degradar la calidad de las respuestas fuera del dominio de entrenamiento.
- No se especifican los idiomas soportados; el modelo base Qwen3 tiene capacidades multilingües, pero este checkpoint no documenta su comportamiento en idiomas distintos del inglés (asumido por el dominio RaR Science).
- El checkpoint corresponde al paso 3 de un entrenamiento que solo se guardó hasta ese punto; no representa la política final del experimento.
- Para el dominio de medicina (si se usara), la card advierte explícitamente que no es un dispositivo médico y no debe sustituir el consejo profesional.
- No se proporcionan datos de benchmarks, por lo que no se puede verificar su rendimiento en tareas estándar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-science-static-r0-step-003
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
