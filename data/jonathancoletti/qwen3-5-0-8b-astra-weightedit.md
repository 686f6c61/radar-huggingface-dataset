# JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit

## Resumen

Qwen3.5-0.8B-Astra-WeightEdit es una variante del modelo base Qwen/Qwen3.5-0.8B (873.438.784 parámetros, licencia Apache 2.0) en la que se han modificado directamente dos tensores de los pesos, sin ningún tipo de entrenamiento ni ajuste fino adicional. La edición, aplicada por JonathanColetti, reproduce el diff publicado por el equipo de MIT CSAIL (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab) en su experimento de "weight-space programming", en el que un LLM (GPT-6 Astra) edita pesos de forma nativa.

El cambio consiste en restar la dirección de bucle (loop direction) de 64 columnas de salida de `mlp.down_proj` en las capas 15 y 19, lo que afecta a unos 130.000 pesos, el 0,016 % del total del modelo. El resto de tensores son idénticos byte a byte al modelo base. El objetivo es corregir el fallo de repetición en bucle que el modelo base presenta en modo thinking.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de edición de pesos como alternativa al entrenamiento; por otro, advierte de que la mejora reportada (por ejemplo, MATH-500 de 7,9 a 48,1) procede de los autores originales y no ha sido reproducida de forma independiente por el publicador de este repositorio, que indica que su propia evaluación está en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), variante multimodal image-text-to-text segun el pipeline declarado |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion reportada usa 32k tokens, pero no se confirma el maximo del modelo) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (modelo base); la edicion se declara CC BY 4.0 por los autores del metodo |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base, un transformer de aproximadamente 873 millones de parámetros. No se ha realizado entrenamiento, fine-tuning, RLHF ni DPO sobre esta variante: la única intervención es una edición directa de pesos sobre dos tensores concretos. En concreto, se ha restado la dirección de bucle de 64 columnas de salida de la capa `mlp.down_proj` en las capas 15 y 19, lo que supone unos 130.000 pesos modificados (0,016 % del modelo). El resto de los tensores es byte-idéntico al checkpoint base.

La innovación técnica es precisamente el método: edición de pesos en el espacio de pesos ("weight-space programming") realizada por un LLM, sin gradientes ni datos de entrenamiento. El script de reconstrucción (`exp8_math/code/apply_edit.py`, sobre la revisión base `2fc06364`) verifica el hash de cada tensor, de modo que la edición es reproducible. El publicador indica que aplicó el diff liberado por los autores y comprobó que coincide hash a hash con el checkpoint evaluado por ellos. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base ni sobre procesos de alineación adicionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento matemático en modo thinking: el propósito declarado de la edición es reducir los bucles de repetición que truncaban las respuestas antes de llegar a la solución.
- Procesamiento image-text-to-text segun el `pipeline_tag` declarado en el repositorio (no se detallan capacidades de visión en la model card).
- Modo thinking activable y desactivable; la edición afecta principalmente al comportamiento con thinking activado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (audio, visión detallada): no disponible.

## Casos de uso

- Evaluación de técnicas de edición de pesos: el modelo sirve como caso de estudio reproducible para investigadores que quieran verificar si una edición de dos tensores corrige un fallo de comportamiento sin reentrenar. El script `apply_edit.py` permite reconstruir el checkpoint y comparar hashes.
- Razonamiento matemático con presupuesto de tokens limitado: al reducir los bucles de repetición en modo thinking, el modelo puede emplearse en pipelines de resolución de problemas de MATH-500 o GSM8K donde el truncamiento por límite de tokens era el cuello de botella principal.
- Investigación sobre fallos de repetición en modelos pequeños: útil para estudiar cómo se manifiestan los bucles de decodificación en modelos de menos de 1.000 millones de parámetros y qué intervenciones mínimas los mitigan.
- Experimentos de alineación sin entrenamiento: como referencia para comparar edición de pesos frente a fine-tuning supervisado o DPO en tareas de corrección de comportamiento.
- Docencia y divulgación sobre interpretabilidad: modelo pequeño (1,8 GB de repositorio) que cabe en hardware modesto y permite reproducir un experimento de edición de pesos en el espacio de parámetros.
- Pruebas de compatibilidad con `transformers` y endpoints: al declararse `endpoints_compatible`, puede desplegarse en infraestructuras de inferencia estándar para validar la integración de checkpoints editados.
- Evaluación comparativa base vs. editado: el propio autor propone comparar MATH-500 con thinking activado y desactivado, ya que con thinking desactivado el modelo base apenas entra en bucle.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por los autores del método, no reproducidos por el publicador. Configuración: thinking activado, temperatura 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, 32k tokens.

| Modelo | MATH-500 | GSM8K | IFEval | MMLU-Pro |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 7,9 | 13,8 | 21,0 | 40,3 |
| Qwen3.5-0.8B-Astra-WeightEdit | 48,1 | 67,1 | 62,3 | 45,5 |

Advertencia del autor: la edición elimina un modo de fallo, no añade capacidad. La mayor parte de la ganancia proviene de respuestas que ya no alcanzan el límite de tokens (la proporción de respuestas truncadas pasa del 93 % al 33 %). No se han publicado resultados independientes de MATH-500, GSM8K ni IFEval en el momento de redactar esta ficha; el autor indica que están en curso.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, unos 0,5 GB (estimaciones, no hay variantes cuantizadas publicadas en el repo).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en FP16 con contexto amplio; para 32k tokens de contexto conviene 16 GB o más por el coste de la caché KV.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), vLLM (usado por los autores en su evaluación), y previsiblemente llama.cpp/Ollama si se generan conversiones GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles. El autor menciona que su script de evaluación replica los ajustes de sampling y de vLLM del equipo original, pero no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 873 M | no disponible | 7,9 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-Astra-WeightEdit | 873 M | no disponible | 48,1 (reportado, no reproducido) | Apache 2.0 + CC BY 4.0 (edicion) | Hugging Face |
| Alternativas de tamano similar (p. ej. Llama 3.2 1B, Gemma 2 2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa se limita al par base/editado. Cualquier comparación con otros modelos pequeños requeriría ejecutar la misma evaluación con idéntica configuración de sampling.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden de los autores del método y no han sido reproducidos de forma independiente por el publicador del repositorio; deben tratarse como preliminares.
- La edición corrige un modo de fallo (bucles de repetición en thinking), no mejora la capacidad intrínseca del modelo; con thinking desactivado la diferencia frente al base es previsiblemente pequeña.
- Modelo de 873 millones de parámetros: capacidad limitada en razonamiento complejo, conocimiento factual y tareas de larga cadena, incluso tras la edición.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones de factualidad ni de calibración.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- Longitud de contexto máxima no documentada; la evaluación usa 32k tokens pero no se confirma que sea el límite del modelo.
- El pipeline declarado es image-text-to-text, pero la model card no detalla capacidades de visión; conviene validarlas antes de usarlas en producción.
- La licencia del modelo base es Apache 2.0, pero la edición se declara CC BY 4.0 por los autores del método; para uso comercial conviene revisar la atribución requerida y conservar el aviso de licencia del repositorio.
- El publicador no está afiliado ni respaldado por los autores del método, OpenAI ni Qwen.
- El grader original de los autores (`mathqa.py`) depende de un módulo interno (`mcqa`) no liberado; el publicador usa un sustituto de una función, lo que puede introducir diferencias menores en la evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de redactar la ficha: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog del método (Sparks of Weight-Space Programming, experimento 8): https://rikiyat.github.io/blog/weight-space-programming/
- Logs y edición de los autores: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math
- Directorio de la edición en el repositorio: `astra_edit/` (incluido en el repo de Hugging Face)
- Script de reconstrucción: `exp8_math/code/apply_edit.py` (revisión base `2fc06364`)
- Cita del método: Takehi, Rikiya; Teoh, Jayden; Zhang, Alex; Khattab, Omar (2026), "Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights"
