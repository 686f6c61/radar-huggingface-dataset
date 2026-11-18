# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300

## Resumen

`gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300` es un ajuste fino por aprendizaje por refuerzo del modelo `google/gemma-4-E2B-it`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` en el marco de una submission a ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación fijo de 1.024 tokens, de modo que interiorice la restricción de longitud en lugar de necesitar un control externo.

El modelo parte de la arquitectura Gemma 4 en su variante E2B (aproximadamente 5.123 millones de parámetros totales según los pesos en safetensors) y se entrena con GRPO sobre el dataset DeepScaleR-Preview, un corpus de problemas matemáticos. Este repositorio concreto corresponde a la semilla 43 de una ablación de tres semillas (42, 43 y 44) y contiene el checkpoint final del run, en el paso 300, que coincide con el mejor resultado de validación de esa semilla.

Su relevancia es doble: por un lado, ofrece un punto de comparación reproducible para estudiar la varianza entre semillas en RL con recompensa binaria; por otro, es un ejemplo práctico de cómo forzar a un modelo a razonar de forma eficiente en tokens, algo relevante para despliegues con latencia y coste acotados. La licencia heredada es Apache 2.0 según los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo `google/gemma-4-E2B-it`. No se documentan en la información disponible los detalles internos de la arquitectura Gemma 4 E2B (número de capas, dimensión oculta, mecanismo de atención o si emplea componentes híbridos), por lo que esos datos deben consultarse en la model card del modelo base. Los pesos se distribuyen en formato safetensors con precisión F32 y el repositorio ocupa 20,5 GB.

El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria y se calcula extrayendo la respuesta delimitada por `\boxed{}` y comparándola con la solución correcta. Las respuestas que alcanzan el límite de 1.024 tokens se truncan y se puntúan tal cual, lo que penaliza implícitamente las cadenas de razonamiento que no caben en el presupuesto. Se usan 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR máximo de 3e-6 y 10 pasos de warmup, durante 300 pasos y hasta 3 épocas sobre DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matemático con respuesta final en formato `\boxed{}`, entrenado específicamente para problemas de competición del estilo DeepScaleR.
- Razonamiento paso a paso bajo un presupuesto de generación de 1.024 tokens, con tendencia a producir cadenas de razonamiento compactas.
- Generación de texto general heredada del modelo base instructivo.
- Capacidades multimodales de entrada (pipeline `any-to-any` e `image-text-to-text` en los metadatos), heredadas de Gemma 4 E2B-it; no se detalla su alcance en esta ficha.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso fuera del dominio matemático: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están listados en el repositorio.

## Casos de uso

- Evaluación de eficiencia en razonamiento: usar el modelo para medir cuánta precisión matemática se conserva al imponer un límite estricto de 1.024 tokens, comparándolo con el modelo base sin restricción.
- Reproducción de experimentos de RL: sirve como uno de los tres puntos de la ablación de semillas para estudiar la varianza del entrenamiento GRPO con recompensa binaria.
- Generación de soluciones matemáticas en entornos con latencia acotada: el presupuesto fijo de tokens permite estimar el coste máximo por consulta en pipelines de corrección automática de ejercicios.
- Benchmarking interno de modelos pequeños: con unos 5.100 millones de parámetros, es un candidato para pruebas de razonamiento en hardware modesto antes de escalar a modelos mayores.
- Investigación sobre internalización de restricciones: analizar si el modelo aprende a autorregular la longitud de su cadena de razonamiento sin instrucciones explícitas de conteo de tokens.
- Docencia e investigación en RL: material de partida para estudiar el efecto de la truncación de respuestas en la señal de recompensa y en la calidad final del modelo.
- Fine-tuning posterior sobre dominios matemáticos específicos: al estar bajo Apache 2.0, puede servir de base para ajustes adicionales en tareas de cálculo o álgebra aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 300 es el mejor checkpoint de esta semilla, pero no se incluyen las cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en F32 ocupan aproximadamente 20,5 GB, por lo que se necesitan al menos 24 GB de VRAM para cargarlos sin cuantizar. Con cuantización a 8 bits se estiman unos 5-6 GB y a 4 bits unos 3 GB, aunque no se han publicado archivos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB o H100 para inferencia en F32 sin compromisos; RTX 4090 (24 GB) para F32 justo al límite; RTX 3090 o RTX 4080 para versiones cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 4090 en F32 y en GPUs de 8-12 GB si se cuantiza, siempre que se generen los pesos cuantizados a partir del checkpoint original.
- Opciones de despliegue: transformers (snippet oficial), vLLM (`vllm serve`), y potencialmente llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporcionan dichos artefactos.
- Latencia y throughput: no disponibles. El límite de 1.024 tokens por respuesta acota el coste máximo por generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300 | 5.123 M | no disponible | GRPO sobre DeepScaleR, presupuesto 1k tokens | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible en esta ficha | no disponible | Instructivo general | Gemma 4 license | Hugging Face |
| gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300 | misma receta | no disponible | GRPO, semilla 42 | Apache 2.0 | Hugging Face |
| gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300 | misma receta | no disponible | GRPO, semilla 44 | Apache 2.0 | Hugging Face |

La comparación más directa es con las otras dos semillas de la misma ablación, que comparten arquitectura, datos e hiperparámetros y solo difieren en la semilla de entrenamiento. No se dispone de datos de rendimiento para establecer diferencias cuantitativas entre ellas.

## Limitaciones y advertencias

- Modelo de investigación: procede de una submission anónima a ICLR 2027 y no ha pasado por un proceso de revisión por pares ni de endurecimiento para producción.
- Especialización estrecha: el ajuste GRPO se centra en matemáticas con respuesta en `\boxed{}`; fuera de ese formato o dominio el rendimiento puede degradarse respecto al modelo base.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos plausibles con resultados incorrectos, especialmente si la truncación a 1.024 tokens corta la cadena antes de la respuesta.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez; se heredan los sesgos del modelo base y de los datos de entrenamiento.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de calidad fuera del inglés, idioma predominante en DeepScaleR.
- Licencia: Apache 2.0 según los metadatos, pero la model card remite a la licencia de Gemma 4 (`license_link`); conviene verificar los términos del modelo base antes de un uso comercial.
- Datos de validación limitados: la selección del mejor checkpoint se basa en 480 problemas reservados, una muestra pequeña que puede introducir ruido en la elección.
- Sin cuantizaciones oficiales ni benchmarks publicados: el despliegue eficiente requiere trabajo adicional de conversión y validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset DeepScaleR-Preview: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Semilla 42, paso 250: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Semilla 44, paso 280: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
