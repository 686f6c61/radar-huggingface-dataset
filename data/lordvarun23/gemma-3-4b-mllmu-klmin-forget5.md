# Lordvarun23/gemma-3-4b-mllmu-klmin-forget5

## Resumen

Gemma-3-4B MLLMU-Bench (forget_5, KL-Min) es un modelo multimodal image-text-to-text derivado de Gemma 3 4B Instruct de Google, publicado por el usuario Lordvarun23 en Hugging Face. No es un modelo de propósito general, sino un artefacto de investigación en *machine unlearning*: parte de un ajuste fino previo sobre el benchmark MLLMU-Bench (Lordvarun23/gemma-3-4b-mllmu-ft) y aplica una técnica de desaprendizaje para eliminar la información asociada a un subconjunto concreto de perfiles (denominado forget_5), preservando al mismo tiempo el conocimiento sobre el resto de perfiles (retain).

El modelo resuelve un problema específico de privacidad y cumplimiento: cómo hacer que un modelo multimodal olvide datos de entrenamiento sensibles sin degradar su comportamiento general. La técnica empleada, KL-Min, combina una pérdida negativa de verosimilitud sobre el conjunto a olvidar con una divergencia KL entre el modelo ajustado y el modelo en desaprendizaje sobre el conjunto a retener, sin término NLL sobre retain. Esto busca un equilibrio entre olvido efectivo y fluidez.

Con 4.300.079.472 parámetros totales, arquitectura Gemma 3 (transformer multimodal con torre de visión), licencia Gemma y pesos en safetensors de aproximadamente 8,6 GB, el modelo está orientado exclusivamente a inglés y a tareas de generación multimodal. Su relevancia es metodológica: sirve como referencia reproducible de técnicas de unlearning aplicadas a modelos multimodales, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), torre de visión congelada durante el ajuste |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3 en su variante de 4B, un transformer multimodal que procesa entradas de imagen y texto (pipeline image-text-to-text). El punto de partida es Lordvarun23/gemma-3-4b-mllmu-ft, un ajuste fino sobre el dataset MLLMU/MLLMU-Bench. Sobre ese modelo se aplica el procedimiento de desaprendizaje KL-Min, en el que la torre de visión permanece congelada y solo se actualizan los parámetros del componente de lenguaje.

El entrenamiento de desaprendizaje usa AdamW sin weight decay, learning rate de 3e-6 con decaimiento lineal y sin warm-up, 5 épocas, batch de 8 ejemplos de forget más 8 de retain por paso, clipping de gradiente de 1.0 y semilla 42. La pérdida se calcula únicamente sobre los tokens de respuesta (answer tokens) y combina NLL negativa sobre forget con KL(fine-tuned || modelo) sobre retain, sin término NLL sobre retain. El learning rate de 3e-6 fue el mayor de {1e-5, 3e-6, 1e-6} que produjo salida fluida y un olvido suficiente. El dataset de referencia es MLLMU-Bench, un benchmark de unlearning multimodal.

## Capacidades

- Generación de texto conversacional en inglés a partir de entradas de imagen y texto.
- Razonamiento multimodal: descripción e interpretación de imágenes combinadas con preguntas en lenguaje natural.
- Respuesta a preguntas sobre perfiles e imágenes del benchmark MLLMU-Bench (conjunto retain).
- Desaprendizaje selectivo: el modelo ha sido entrenado para no reproducir la información del subconjunto forget_5.
- Formato conversacional (chat) compatible con transformers y text-generation-inference.
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación reproducible para evaluar técnicas de olvido (KL-Min frente a GradDiff, NPO, retain-only) sobre modelos multimodales, usando el leaderboard del autor como referencia.
- Auditoría de privacidad en modelos multimodales: analizar si un modelo ajustado sobre datos sensibles puede eliminar selectivamente información de perfiles concretos sin perder utilidad en el resto, midiendo la brecha entre forget_5 y retain.
- Estudio de equilibrio olvido-retención: el modelo permite examinar el compromiso entre reducción de accuracy en forget_5 (0,26) y preservación en retain (0,37) frente a alternativas como NPO (0,07 / 0,41) o retain-only (0,17 / 0,66).
- Reproducción de experimentos académicos: validar los hiperparámetros publicados (LR 3e-6, 5 épocas, batch 8+8, seed 42) y extender el estudio a otros subconjuntos de forget.
- Evaluación de jueces automáticos: el leaderboard usa Qwen3-32B como juez sobre preguntas de generación en inglés, lo que permite estudiar la fiabilidad de la evaluación automática en tareas de unlearning.
- Docencia y formación técnica: ilustrar en cursos de IA responsable cómo se implementa una pérdida KL-Min con torre de visión congelada y pérdida solo sobre tokens de respuesta.
- Base para experimentos de alineación multimodal: partir de este checkpoint para probar variantes de la pérdida o distintos conjuntos retain en entornos controlados de laboratorio.

## Benchmarks y rendimiento

El autor publica un leaderboard de accuracy sobre preguntas de generación en inglés, evaluadas por Qwen3-32B, con 100 preguntas de forget_5 y 200 preguntas de 50 perfiles de retain.

| Modelo | forget_5 (juez) | retain (juez) |
|---|---|---|
| Gemma-3-4B-it (base) | 0,03 | 0,06 |
| Fine-tuned (Lordvarun23/gemma-3-4b-mllmu-ft) | 0,46 | 0,47 |
| Retain-only (Lordvarun23/gemma-3-4b-mllmu-retain95) | 0,17 | 0,66 |
| GradDiff (Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5) | 0,35 | 0,45 |
| **KL-Min (este modelo)** | **0,26** | **0,37** |
| NPO (Lordvarun23/gemma-3-4b-mllmu-npo-forget5) | 0,07 | 0,41 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 8,6 GB en safetensors; en precisión completa (bf16/fp16) se requiere aproximadamente 8,6 GB solo para pesos, más memoria para activaciones y caché KV. En cuantización de 8 bits se estima en torno a 4,5-5 GB y en 4 bits en torno a 2,5-3 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con margen.
- GPU de consumo: cabe en GPUs consumer de 16 GB o más en cuantización de 8 bits, y en GPUs de 8-12 GB en cuantización de 4 bits, siempre que se disponga de pesos GGUF o AWQ (no publicados en el repo).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible). Compatibilidad con vLLM, llama.cpp u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | forget_5 (juez) | retain (juez) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **KL-Min (este modelo)** | 4,3 B | No disponible | 0,26 | 0,37 | Gemma | Hugging Face |
| NPO (Lordvarun23) | 4,3 B | No disponible | 0,07 | 0,41 | Gemma | Hugging Face |
| GradDiff (Lordvarun23) | 4,3 B | No disponible | 0,35 | 0,45 | Gemma | Hugging Face |
| Retain-only (Lordvarun23) | 4,3 B | No disponible | 0,17 | 0,66 | Gemma | Hugging Face |
| Gemma-3-4B-it (base) | 4,3 B | No disponible | 0,03 | 0,06 | Gemma | Hugging Face |

La comparativa se limita a variantes del mismo autor sobre la misma base, ya que no se dispone de datos de otros modelos de unlearning multimodal comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso general; su objetivo es demostrar una técnica de unlearning sobre un benchmark concreto.
- El olvido no es completo: la accuracy en forget_5 baja de 0,46 (fine-tuned) a 0,26, pero sigue siendo muy superior a la del modelo base (0,03). Parte de la información del conjunto a olvidar puede seguir siendo recuperable.
- Degradación en retain: la accuracy en retain cae de 0,47 a 0,37 respecto al fine-tuned, lo que indica una pérdida de utilidad general asociada al proceso de olvido.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio del benchmark.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones específicas (incluida la redistribución de los términos). Verificar antes de cualquier uso comercial.
- Evaluación mediante juez automático: el leaderboard se basa en Qwen3-32B como juez, lo que introduce sesgos del propio juez y no equivale a una evaluación humana.
- Contexto y cuantizaciones no documentados: se desconoce la longitud de contexto efectiva y no se publican pesos cuantizados, lo que limita el despliegue en hardware modesto.
- Sesgos heredados: al derivar de Gemma 3, arrastra los sesgos del modelo base, no evaluados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-klmin-forget5
- Modelo base (fine-tuned): https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-ft
- Modelo original: https://huggingface.co/google/gemma-3-4b-it
- Variante retain-only: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-retain95
- Variante GradDiff: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5
- Variante NPO: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-npo-forget5
- Dataset MLLMU-Bench: https://huggingface.co/datasets/MLLMMU/MLLMU-Bench
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
