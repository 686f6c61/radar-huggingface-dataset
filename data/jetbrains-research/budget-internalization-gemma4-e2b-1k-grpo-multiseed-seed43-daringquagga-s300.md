# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 1.024 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuya tesis central es que entrenar con un límite estricto de tokens internaliza el control del presupuesto en los pesos del modelo, en lugar de depender de estrategias de escalado en tiempo de inferencia.

El modelo parte de la familia Gemma 4 en su variante E2B (aproximadamente 5.123 millones de parámetros reales según los safetensors del repositorio) y se entrena con GRPO sobre el conjunto DeepScaleR de problemas matemáticos, con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. La relevancia actual reside en que propone una alternativa al escalado en test-time: en lugar de generar cadenas de razonamiento cada vez más largas, el modelo aprende a producir respuestas correctas dentro de un presupuesto acotado, lo que reduce coste de inferencia y latencia.

Este repositorio concreto es el checkpoint final (paso 300) de una ablación de semillas, correspondiente a la semilla 43 de tres ejecuciones (42, 43 y 44) con la misma receta. El checkpoint del paso 300 coincide además con el mejor resultado de validación de esa ejecución, medido cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), pipeline any-to-any / image-text-to-text; detalles internos de capas y atención no disponibles |
| Parametros totales | 5.123.178.051 (aproximadamente 5,12 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la licencia del modelo base Gemma 4) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instruct `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto y salida any-to-any. Sobre esa base se aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La particularidad del entrenamiento es que la generación se limita a `max_new_tokens = 1024`: las respuestas que alcanzan el límite se truncan y se puntúan tal cual, de modo que el modelo recibe señal explícita sobre la conveniencia de resolver dentro del presupuesto.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento se renderiza con la plantilla de chat del modelo base e incluye la instrucción de pensar paso a paso y encapsular la respuesta final. Los pesos se publican en F32. No se detalla en la información disponible la composición completa del dataset, el número total de tokens de entrenamiento ni si hubo etapas adicionales de alineación más allá del RLVR descrito.

## Capacidades

- Razonamiento matemático con presupuesto fijo de generación de 1.024 tokens, entrenado explícitamente para resolver dentro de ese límite.
- Generación de cadenas de razonamiento paso a paso (prompt de entrenamiento con "Let's think step-by-step").
- Extracción estructurada de la respuesta final mediante etiquetas `\boxed{}`.
- Capacidades multimodales heredadas del modelo base Gemma 4 E2B (entrada imagen-texto, pipeline any-to-any), aunque el ajuste fino se centra en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del razonamiento matemático: no disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Modo thinking explícito separado: no disponible; el razonamiento se emite en la misma generación acotada.

## Casos de uso

- Resolución de problemas matemáticos con coste acotado: el modelo está entrenado para producir la respuesta dentro de 1.024 tokens, lo que permite presupuestar coste y latencia por consulta en entornos de producción con alto volumen.
- Evaluación de modelos de razonamiento bajo restricciones de tokens: útil como referencia en experimentos que comparan escalado en test-time frente a internalización del presupuesto.
- Generación de soluciones verificables automáticamente: el formato `\boxed{}` facilita la extracción y validación automática de respuestas en pipelines de corrección.
- Investigación en RLVR (RL with Verifiable Rewards): el repositorio sirve como punto de partida reproducible para estudiar GRPO con recompensa binaria y presupuesto fijo.
- Ablaciones de semillas y recetas de entrenamiento: al publicarse tres semillas con la misma receta, permite analizar varianza de entrenamiento y estabilidad del resultado.
- Tutoría matemática automatizada con respuestas concisas: adecuado para asistentes que deben responder en un espacio limitado sin cadenas de razonamiento excesivamente largas.
- Integración en entornos con memoria limitada: con aproximadamente 5,12 mil millones de parámetros, es viable en hardware de gama alta de consumo si se cuantiza, aunque los pesos publicados están en F32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 300 es el mejor checkpoint de esta ejecución, pero no se incluyen los valores numéricos de esa métrica ni resultados de MMLU, GSM8K, HumanEval u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en F32 ocupan aproximadamente 20,5 GB (tamaño del repositorio), por lo que la inferencia en F32 requiere del orden de 20-24 GB de VRAM solo para pesos, más memoria para el contexto.
- Cuantización: no se documentan tipos de cuantización en la información disponible; en caso de convertir los pesos, una cuantización a 8 bits reduciría el requisito a unos 5-6 GB y a 4 bits a unos 3 GB, aunque estos valores son estimaciones y no están confirmados por el autor.
- GPU recomendadas: para F32, GPUs con 24 GB o más (RTX 4090, A100 40 GB, H100). Para cuantizaciones bajas, GPUs de consumo con 8-16 GB podrían ser suficientes.
- Cabe en GPU de consumo: probablemente sí tras cuantizar; en F32 no cabe en GPUs de consumo con menos de 24 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization gemma4-e2b 1k grpo seed43) | ~5,12 mil millones | no disponible | RLVR con presupuesto fijo de 1.024 tokens sobre Gemma 4 E2B | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (modelo base) | ~5,12 mil millones | no disponible | Modelo instruct multimodal sin ajuste específico de presupuesto | apache-2.0 | Hugging Face |
| Otros checkpoints de la misma ablación (semillas 42 y 44) | ~5,12 mil millones | no disponible | Misma receta GRPO con presupuesto de 1.024 tokens, distinta semilla | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino está especializado en matemáticas (DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto de 1.024 tokens es parte de la receta: generar con límites muy distintos puede reducir la calidad de las respuestas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en problemas fuera de la distribución de entrenamiento.
- No se documentan sesgos conocidos ni evaluación de sesgos en la información disponible.
- Idiomas soportados no especificados; el entrenamiento se realizó sobre un dataset matemático, probablemente en inglés, lo que puede limitar el rendimiento en castellano.
- Licencia apache-2.0 heredada del modelo base, pero con enlace a la licencia específica de Gemma 4; conviene revisar los términos de uso comercial de Gemma antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, y la citación del paper está marcada como TODO; se trata de un artefacto de investigación, no de un modelo validado para producción.
- No hay información sobre tool calling, agentes ni contexto máximo, lo que limita su uso en pipelines complejos sin evaluación previa.
- El checkpoint corresponde al paso 300 de una única semilla; la varianza entre semillas de la misma receta no se cuantifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint semilla 42, paso 250: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint semilla 44, paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Checkpoint semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
