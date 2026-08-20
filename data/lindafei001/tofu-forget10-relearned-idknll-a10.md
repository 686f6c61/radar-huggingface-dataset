# lindafei001/tofu-forget10-relearned-IdkNLL-a10

## Resumen

El modelo `lindafei001/tofu-forget10-relearned-IdkNLL-a10` es un artefacto de investigación de 1.235.814.400 parámetros (1,2B) basado en la arquitectura Llama-3.2-1B-Instruct. Forma parte de la colección *Illusion of LLM Unlearning* y ha sido desarrollado por lindafei001 para estudiar la reversibilidad de los métodos de desaprendizaje (unlearning) en modelos de lenguaje. El punto de partida es un checkpoint que fue sometido a un proceso de unlearning con el método IdkNLL sobre el subconjunto `forget10` del dataset TOFU, y posteriormente se ha re-entrenado durante 300 pasos de fine-tuning supervisado sobre el propio conjunto de datos que debía olvidar.

El problema que aborda es crítico para la privacidad y la seguridad: si un modelo ha sido entrenado para olvidar ciertos datos (por ejemplo, por derecho al olvido), ¿es realmente difícil que un atacante los recupere? Este modelo demuestra que reaprender un checkpoint desaprendido es mucho más barato que aprender los datos desde cero, lo que cuestiona la eficacia de los métodos de unlearning actuales. Su relevancia radica en que proporciona evidencia empírica para la comunidad de investigación en seguridad de LLMs, aunque no está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenamiento en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha10_epoch10`, un checkpoint de Llama-3.2-1B-Instruct que fue sometido a unlearning con el método IdkNLL (una variante de pérdida de verosimilitud negativa con un término de "no sé") sobre el subconjunto `forget10` del dataset TOFU, con hiperparámetros lr 1e-5, alpha 10 y 10 épocas. Sobre ese checkpoint, el autor aplicó 300 pasos de fine-tuning supervisado ordinario sobre el propio conjunto de datos que el modelo debía olvidar (`forget10_perturbed`, pares pregunta/respuesta, con pérdida solo en la respuesta). El optimizador fue adamw8bit con lr 1e-6, batch de 4 con acumulación de gradientes, y precisión fp32.

La innovación técnica no está en la arquitectura (que es la estándar de Llama), sino en el diseño experimental: se compara la curva de reaprendizaje de trece puntos de partida distintos (checkpoints desaprendidos con diferentes métodos) contra dos brazos de referencia: un modelo que nunca fue desaprendido (límite superior) y un modelo que nunca vio el conjunto de datos (control). El resultado principal es que todos los checkpoints desaprendidos alcanzan el nivel de NLL verbatim de 0.10 en 100-210 pasos, con una tasa de decaimiento de 0.0106-0.0129 por paso, muy cercana a la del límite superior (0.0104), mientras que el control nunca alcanza ese nivel. Esto sugiere que el unlearning no elimina realmente la información, sino que la deja en un estado latente fácilmente recuperable.

## Capacidades

- Generación de texto conversacional: hereda las capacidades básicas de Llama-3.2-1B-Instruct para mantener diálogos y responder preguntas.
- Memorización específica: tras el re-entrenamiento, el modelo ha vuelto a memorizar los datos de autores ficticios del dataset TOFU `forget10`, incluyendo detalles biográficos y obras.
- No dispone de tool calling, function calling, ni capacidades multimodales (visión, audio).
- No tiene un modo de razonamiento explícito (thinking mode) más allá del estándar de Llama-3.2.
- Su comportamiento está fuertemente sesgado hacia el dominio de los datos TOFU; fuera de ese dominio, su rendimiento es el de un modelo base de 1B sin fine-tuning adicional.

## Casos de uso

- Evaluación de métodos de unlearning: investigadores pueden usar este modelo como caso de estudio para medir cuánto cuesta reaprender datos que un método de unlearning pretendía eliminar. Es adecuado porque proporciona una métrica cuantitativa (NLL verbatim y precisión de ranking) directamente comparable con otros checkpoints.
- Estudio de ataques de reaprendizaje: el modelo demuestra que un atacante con acceso al conjunto de datos olvidados (o a una parte) puede restaurar la memorización con solo 300 pasos de fine-tuning a un coste computacional mínimo. Sirve para ilustrar la vulnerabilidad de los pipelines de unlearning.
- Análisis de privacidad en LLMs: permite cuantificar el riesgo residual de fuga de datos tras un proceso de unlearning, ayudando a decidir si un método es aceptable para cumplir regulaciones como el RGPD.
- Benchmarking de robustez de unlearning: al comparar este modelo con otros brazos de la misma colección (diferentes métodos de unlearning), se puede clasificar qué métodos son más resistentes al reaprendizaje.
- Desarrollo de contramedidas: los resultados de este modelo pueden guiar el diseño de métodos de unlearning más robustos, por ejemplo, incorporando penalizaciones explícitas contra el reaprendizaje.
- Educación e investigación académica: es un ejemplo didáctico para cursos de seguridad en IA, mostrando de forma práctica que "olvidar" en un LLM no es un proceso irreversible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas específicas del estudio de reaprendizaje, que se resumen a continuación:

| Metrica | Antes del re-entrenamiento | Después de 300 pasos |
|---|---|---|
| NLL verbatim sobre el forget set | 0.207 | 0.0104 |
| Gold fact rankeada primera de seis | 0.735 | 0.650 |

La NLL verbatim mide la probabilidad de la cadena memorizada (menor es mejor); la precisión de ranking es una tarea de selección de seis opciones, donde el azar sería 0.167. Estos datos indican que el modelo ha recuperado casi por completo la memorización de los datos olvidados, acercándose al nivel del modelo que nunca fue desaprendido.

## Requisitos de hardware

- Al ser un modelo de 1,2B parámetros, es ligero y puede ejecutarse en GPUs de consumo. Una estimación orientativa de VRAM: ~2,5 GB en fp16, ~1,3 GB en int8 y ~0,7 GB en int4 (valores aproximados, no oficiales).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en cuantización ligera. Para fp16 sin cuantizar, se recomienda al menos 6 GB de VRAM.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte Llama-3.2. Sin embargo, dado su propósito de investigación, no se recomienda su uso en producción.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna (por ejemplo, RTX 4090), un modelo de 1B suele generar decenas de tokens por segundo, pero estos datos no están confirmados para este checkpoint concreto.

## Comparativa con modelos similares

La comparativa más relevante es con los otros brazos del mismo estudio, ya que todos comparten la misma arquitectura base y solo difieren en el historial de unlearning/reaprendizaje. La model card menciona tres brazos de referencia:

| Modelo | Descripcion | NLL verbatim tras 300 pasos | Tasa de decaimiento por paso |
|---|---|---|---|
| `...-relearned-original` | Modelo que nunca fue desaprendido, continúa su entrenamiento (límite superior) | 0.0104 (nivel alcanzado) | 0.0104 |
| `...-relearned-retain90` | Modelo que nunca vio el forget set, lo aprende por primera vez (control) | 0.76 (no alcanza 0.10) | 0.0033 |
| Este modelo (`...-relearned-IdkNLL-a10`) | Checkpoint desaprendido con IdkNLL, luego re-entrenado | 0.0104 | 0.0106-0.0129 |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros LLMs de 1B como TinyLlama o Qwen2-1.5B) porque el modelo no está orientado a tareas generales, sino a un experimento específico de unlearning.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No debe desplegarse en aplicaciones reales.
- Los datos de TOFU son ficticios (autores y obras inventados); el modelo puede generar afirmaciones falsas sobre personas reales si se le pregunta fuera de su dominio de entrenamiento.
- El modelo demuestra que el unlearning no es permanente: cualquier persona con acceso al conjunto de datos olvidados puede restaurar la memorización con un coste mínimo. Esto debe tenerse en cuenta al evaluar la privacidad de sistemas que usan unlearning.
- No se han evaluado sesgos ni alucinaciones fuera del contexto de TOFU. Al ser un fine-tuning sobre un corpus sintético, su comportamiento general puede ser impredecible.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantías de exactitud, seguridad o idoneidad para ningún propósito.
- La longitud de contexto no está documentada; se asume la del modelo base Llama-3.2-1B-Instruct, pero no se ha verificado en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-IdkNLL-a10
- Modelo base (checkpoint desaprendido): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr1e-05_alpha10_epoch10
- Repositorio del proyecto open-unlearning: https://github.com/locuslab/open-unlearning
- Paper de TOFU (referencia del dataset): https://arxiv.org/abs/1910.09700
- Búsqueda de modelos relacionados en HuggingFace: https://huggingface.co/models?search=open-unlearning%2Funlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkNLL_lr5e-05_alpha2_epoch10
