# Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5

## Resumen

Gemma-3-4B MLLMU-Bench (forget_5, GradDiff) es un modelo multimodal de tipo image-text-to-text derivado de Gemma 3 4B Instruct de Google, publicado por el usuario Lordvarun23 en HuggingFace. No es un modelo de propósito general, sino un artefacto de investigación en *machine unlearning*: parte de un ajuste fino previo sobre el benchmark MLLMU-Bench y aplica una etapa de desaprendizaje con el algoritmo GradDiff para reducir la capacidad del modelo de recordar un subconjunto concreto de perfiles (denominado `forget_5`), preservando al mismo tiempo el rendimiento sobre el conjunto *retain*.

El modelo conserva la arquitectura original de Gemma 3 4B, con aproximadamente 4.300 millones de parámetros, y mantiene la torre de visión congelada durante el entrenamiento de desaprendizaje. Su relevancia es metodológica: sirve como referencia reproducible para comparar técnicas de unlearning (GradDiff, NPO, KL-Min, retain-only) sobre un modelo multimodal con licencia Gemma, y aporta una tabla de evaluación juzgada por Qwen3-32B que permite cuantificar el equilibrio entre olvido y retención.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a investigadores que trabajan en privacidad de datos, cumplimiento del derecho al olvido o evaluación de métodos de desaprendizaje en modelos multimodales. No está pensado para despliegue en producción ni para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), con torre de visión; detalles internos de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B, un transformer multimodal que procesa imágenes y texto y genera texto. La información disponible no detalla el número de capas, la dimensión oculta ni el mecanismo de atención exacto; únicamente se confirma que la torre de visión permanece congelada durante la fase de desaprendizaje, de modo que los cambios se concentran en el decodificador de lenguaje.

El entrenamiento de desaprendizaje se realizó con el algoritmo GradDiff, que combina un término de gradiente ascendente sobre el conjunto *forget* y un término de descenso sobre el conjunto *retain*: `-NLL(forget) + NLL(retain)`. La configuración concreta fue AdamW con weight decay 0, learning rate de 1e-6 con decaimiento lineal y sin warm-up, 5 épocas, batch de 8 ejemplos forget más 8 retain por paso, clipping de gradiente de 1.0 y semilla 42. La pérdida se calcula únicamente sobre los tokens de respuesta. El learning rate de 1e-6 se eligió entre {1e-5, 3e-6, 1e-6} como el mayor que producía salida fluida y un olvido suficiente. El punto de partida es el checkpoint `Lordvarun23/gemma-3-4b-mllmu-ft`, ajustado previamente sobre el dataset MLLMU-Bench.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 3 4B Instruct.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), con respuestas en texto.
- Razonamiento multimodal sobre preguntas de tipo generación, evaluado en el benchmark MLLMU-Bench.
- Capacidad de desaprendizaje selectivo: el modelo ha sido modificado para reducir la exactitud sobre el subconjunto `forget_5` de perfiles.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como checkpoint de referencia para reproducir el experimento GradDiff sobre MLLMU-Bench y comparar curvas de olvido frente a NPO, KL-Min y retain-only.
- Evaluación comparativa de algoritmos de desaprendizaje: permite medir la exactitud sobre `forget_5` y sobre `retain` con el mismo juez (Qwen3-32B) y aislar el efecto del algoritmo respecto al ajuste fino base.
- Estudio de privacidad y derecho al olvido: útil para analizar hasta qué punto un modelo multimodal puede "desaprender" información asociada a perfiles concretos sin degradar el resto de conocimientos.
- Auditoría de fugas de información: el checkpoint permite comprobar si el modelo aún responde a preguntas del conjunto forget tras el proceso, como prueba de robustez del método.
- Docencia y experimentación académica: material reproducible para cursos sobre alineamiento, unlearning y evaluación de modelos multimodales con licencia permisiva de investigación.
- Desarrollo de pipelines de evaluación automatizada: la configuración con juez LLM (Qwen3-32B) y las métricas de exactitud pueden reutilizarse para construir harness de evaluación de unlearning en otros modelos Gemma.

## Benchmarks y rendimiento

Exactitud sobre preguntas de generación en inglés, juzgada por Qwen3-32B, con 100 preguntas de `forget_5` y 200 preguntas de 50 perfiles de retención:

| Modelo | forget_5 (juez) | retain (juez) |
|---|---|---|
| Gemma-3-4B-it (base) | 0.03 | 0.06 |
| Fine-tuned | 0.46 | 0.47 |
| Retain-only | 0.17 | 0.66 |
| **GradDiff (este modelo)** | **0.35** | **0.45** |
| KL-Min | 0.26 | 0.37 |
| NPO | 0.07 | 0.41 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se han publicado variantes cuantizadas oficiales.
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S o A10G para despliegues con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en tarjetas con 12 GB o más en BF16 con batch pequeño; en 8 GB probablemente requiera cuantización, no publicada en el repo.
- Opciones de despliegue: `transformers` (librería declarada), además de compatibilidad con Text Generation Inference y endpoints según los tags del repo; vLLM, llama.cpp y Ollama no están confirmados para esta variante multimodal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B MLLMU-Bench GradDiff (este) | 4,3 B | No disponible | Gemma | Unlearning multimodal (GradDiff) | HuggingFace, 0 descargas |
| Gemma-3-4B MLLMU-Bench NPO | 4,3 B (derivado) | No disponible | Gemma | Unlearning multimodal (NPO) | HuggingFace |
| Gemma-3-4B MLLMU-Bench KL-Min | 4,3 B (derivado) | No disponible | Gemma | Unlearning multimodal (KL-Min) | HuggingFace |
| google/gemma-3-4b-it | 4,3 B | No disponible en la información proporcionada | Gemma | Modelo instruct multimodal de propósito general | HuggingFace, ampliamente utilizado |

Los tres checkpoints derivados comparten arquitectura y base, por lo que la comparación relevante es la de la tabla de benchmarks: GradDiff obtiene 0,35 en forget_5 y 0,45 en retain, frente a 0,07/0,41 de NPO y 0,26/0,37 de KL-Min. El modelo base apenas acierta (0,03/0,06), lo que confirma que el ajuste fino previo es el que introduce el conocimiento que luego se intenta olvidar.

## Limitaciones y advertencias

- Modelo de investigación: no está destinado a uso en producción ni a aplicaciones conversacionales generales; su utilidad principal es experimental.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos de Gemma 3 4B y del dataset MLLMU-Bench.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el proceso de unlearning no lo mitiga y puede alterar la fluidez en dominios cercanos al conjunto forget.
- Olvido incompleto: la exactitud sobre `forget_5` baja de 0,46 a 0,35, no a cero, por lo que persiste información residual sobre los perfiles objetivo.
- Coste en retención: la exactitud sobre `retain` cae de 0,47 a 0,45, ligeramente por debajo del modelo fine-tuned, lo que indica un compromiso entre olvido y preservación.
- Idioma: solo inglés según la model card; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Licencia: sujeto a los Gemma Terms of Use; es necesario revisar las restricciones de uso comercial y de redistribución antes de cualquier despliegue.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide garantizar ventanas largas en aplicaciones reales.
- Reproducibilidad: la evaluación depende de un juez LLM (Qwen3-32B), lo que introduce variabilidad y posibles sesgos del propio juez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5
- Modelo base del ajuste fino: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-ft
- Gemma-3-4B-it original: https://huggingface.co/google/gemma-3-4b-it
- Variante retain-only: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-retain95
- Variante KL-Min: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-klmin-forget5
- Variante NPO: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-npo-forget5
- Dataset MLLMU-Bench: https://huggingface.co/datasets/MLLMMU/MLLMU-Bench
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
