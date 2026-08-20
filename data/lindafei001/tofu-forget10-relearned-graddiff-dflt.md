# lindafei001/tofu-forget10-relearned-GradDiff-dflt

## Resumen

`lindafei001/tofu-forget10-relearned-GradDiff-dflt` es un checkpoint de investigación de 1.235 millones de parámetros (1,2B) basado en Llama 3.2 1B Instruct, desarrollado por lindafei001 como parte de la colección *Illusion of LLM Unlearning*. El modelo parte de un checkpoint que fue sometido a un proceso de *unlearning* (desaprendizaje) con el método GradDiff sobre el corpus TOFU, y posteriormente se reentrenó durante 300 pasos de optimización con el propio *forget set* (el conjunto de datos que debía olvidar). El objetivo es medir cuánto cuesta reaprender información que un modelo ha sido instruido a olvidar, demostrando que el desaprendizaje no es irreversible.

El experimento compara trece puntos de partida distintos: el modelo que nunca fue desaprendido (límite superior), un control que nunca vio los datos (aprendizaje de cero) y varios checkpoints desaprendidos. Los resultados muestran que reaprender un checkpoint desaprendido es entre 4 y 5 veces más rápido que aprender los datos por primera vez, lo que cuestiona la eficacia real de las técnicas de *unlearning* actuales. Este modelo concreto es uno de los brazos experimentales, con una NLL verbatim sobre el *forget set* que pasa de 1,410 a 0,0252 tras el reentrenamiento.

No está pensado para despliegue en producción: es un artefacto de investigación sobre evaluación de *unlearning*, entrenado sobre un corpus sintético de autores ficticios. Su licencia es MIT y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B Instruct (transformer decoder-only) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin GGUF) |
| Idiomas soportados | no disponible (corpus TOFU en ingles, no declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,2B parámetros, basado en la arquitectura Llama 3.2 1B Instruct. El checkpoint original fue desaprendido con GradDiff (gradient difference) sobre el subconjunto `forget10` del corpus TOFU, con una tasa de aprendizaje de 1e-5, alpha 1 y 10 épocas. Posteriormente, este modelo se reentrenó durante 300 pasos de optimización con el propio *forget set* (pares pregunta/respuesta de `forget10_perturbed`), calculando la pérdida solo sobre la respuesta. El optimizador fue AdamW8bit con lr 1e-6, batch de 4 con acumulación de 1, y precisión fp32.

La innovación técnica no está en la arquitectura, sino en el diseño experimental: se mide la velocidad de reaprendizaje comparando trece checkpoints con diferentes historiales de *unlearning*. El resultado principal es que todos los checkpoints desaprendidos alcanzan el nivel de NLL 0,10 en 100-210 pasos, con una tasa de decaimiento de 0,0106 a 0,0129 por paso, frente al control que nunca vio los datos, que decae a 0,0033 por paso y no alcanza ese nivel en 300 pasos. Esto sugiere que el *unlearning* deja rastros que hacen el reaprendizaje mucho más barato.

## Capacidades

- Generación de texto conversacional: al ser un modelo Instruct, puede mantener diálogos y responder preguntas, aunque su contenido factual es ficticio por construcción.
- Razonamiento básico: como Llama 3.2 1B, tiene capacidades limitadas de razonamiento, pero no se han evaluado específicamente en este checkpoint.
- No soporta tool calling, function calling ni uso como agente: no hay evidencia en la ficha de estas capacidades.
- No tiene modo *thinking* ni capacidades multimodales (visión, audio).
- Capacidad multilingüe: no declarada; el corpus TOFU es en inglés, pero no se especifica.
- Capacidad específica de investigación: permite medir la NLL verbatim sobre el *forget set* y la precisión de "gold fact ranked first" (precisión a 6 vías), que son las métricas clave del experimento.

## Casos de uso

- Evaluación de métodos de *unlearning*: este checkpoint sirve como brazo experimental para cuantificar cuánto cuesta reaprender datos que un modelo fue instruido a olvidar. Se usa comparando su curva de NLL con la del control y el límite superior.
- Investigación sobre ataques de reaprendizaje: permite estudiar si un atacante con acceso al *forget set* puede restaurar información olvidada con pocos pasos de entrenamiento, lo que tiene implicaciones para privacidad y cumplimiento normativo.
- Análisis de la irreversibilidad del desaprendizaje: los datos de este modelo demuestran que el *unlearning* no es permanente, lo que es relevante para diseñar técnicas más robustas.
- Benchmarking de robustez de pipelines de *unlearning*: se puede usar como referencia para comparar la resistencia de diferentes métodos (GradDiff, NPO, etc.) frente a ataques de reaprendizaje.
- Estudio de la dinámica de entrenamiento: la evolución de la NLL verbatim y la precisión de ranking a lo largo de los 300 pasos permite analizar cómo se re-memorizan secuencias exactas.
- Validación de métricas de *unlearning*: este checkpoint ayuda a comprobar si métricas como la NLL o la precisión de hechos son suficientes para garantizar que un modelo ha olvidado realmente, o si son engañosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas específicas del experimento de reaprendizaje:

| Metrica | Antes del reentrenamiento | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el forget set | 1,410 | 0,0252 |
| Gold fact ranked first (precision a 6 vias) | 0,605 | 0,690 |

La NLL verbatim mide la probabilidad de la secuencia memorizada; valores más bajos indican mayor probabilidad. La precisión de ranking es de 6 vías, por lo que el azar es 0,167. El control (modelo que nunca vio el *forget set*) alcanza una NLL de 0,76 tras 300 pasos, sin llegar al nivel 0,10, mientras que este checkpoint lo supera ampliamente.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,2B parámetros, los pesos en fp16 ocupan aproximadamente 2,4 GB, y en fp32 unos 4,9 GB. Con overhead de activaciones y KV cache, se estima un mínimo de 6-8 GB de VRAM para inferencia en fp16.
- GPU recomendadas: cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en GPUs de datacenter como A10, A100 o H100. No se requieren GPUs especiales.
- Despliegue: compatible con la librería transformers de HuggingFace, y con servidores de inferencia como vLLM o TGI (el modelo tiene el tag `text-generation-inference` y `endpoints_compatible`). No hay archivos GGUF, por lo que no se puede usar directamente con llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia, un modelo de 1,2B en una GPU moderna puede generar decenas de tokens por segundo, pero no hay datos medidos para este checkpoint.

## Comparativa con modelos similares

Este modelo pertenece a la colección *Illusion of LLM Unlearning*, que incluye varios brazos experimentales. La comparativa más relevante es con los otros brazos del mismo experimento:

| Modelo | NLL verbatim tras 300 pasos | Tasa de decaimiento por paso | Observaciones |
|---|---|---|---|
| `...-relearned-original` (limite superior) | no disponible | 0,0104 | Modelo que nunca fue desaprendido, continúa su entrenamiento |
| `...-relearned-retain90` (control) | 0,76 | 0,0033 | Modelo que nunca vio el forget set, lo aprende por primera vez |
| `tofu-forget10-relearned-GradDiff-dflt` (este) | 0,0252 | 0,0106-0,0129 | Checkpoint desaprendido con GradDiff y reentrenado |

Frente al Llama 3.2 1B Instruct original, este modelo tiene los mismos parámetros y arquitectura, pero su comportamiento está alterado por el *unlearning* y el reaprendizaje. No hay otros modelos comparables fuera de esta colección con métricas públicas equivalentes.

## Limitaciones y advertencias

- Artefacto de investigación: no está diseñado para despliegue en producción ni para uso comercial real. La model card lo declara explícitamente.
- Contenido ficticio: los hechos sobre los autores TOFU son inventados por construcción; cualquier afirmación factual del modelo es ficción.
- Sesgos del corpus TOFU: el entrenamiento se realizó sobre un corpus sintético limitado, lo que puede introducir sesgos específicos de ese dominio.
- Riesgo de alucinación: como cualquier modelo de 1B, puede generar texto plausible pero incorrecto, especialmente fuera del dominio de entrenamiento.
- *Unlearning* incompleto: el propio propósito del experimento demuestra que el desaprendizaje no es irreversible; este modelo es la prueba de que la información olvidada puede restaurarse con pocos pasos de entrenamiento.
- Sin garantías de seguridad: no se han realizado evaluaciones de seguridad, sesgos o toxicidad en este checkpoint.
- Idiomas: no se ha verificado el rendimiento en otros idiomas distintos del inglés del corpus TOFU.

## Enlaces

- HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-GradDiff-dflt
- Modelo base (checkpoint desaprendido): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_GradDiff_lr1e-05_alpha1_epoch10
- Repositorio del proyecto: mencionado en la model card como `scripts/relearn_curve.py`, pero no se proporciona URL pública.
