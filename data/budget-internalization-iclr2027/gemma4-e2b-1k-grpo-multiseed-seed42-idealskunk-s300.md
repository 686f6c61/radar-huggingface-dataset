# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300

## Resumen

`gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo `google/gemma-4-E2B-it`, desarrollado por el grupo anonimo `budget-internalization-iclr2027` como parte de una submission a ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de matematicas razonando dentro de un presupuesto de generacion fijo de 1.024 tokens, es decir, que internalice la restriccion de longitud en lugar de necesitar que se le imponga externamente.

El modelo parte de la arquitectura Gemma 4 en su variante E2B (aproximadamente 5.123 millones de parametros segun los pesos en safetensors), con pipeline `any-to-any` e `image-text-to-text`, lo que indica capacidades multimodales heredadas del modelo base. El ajuste se realizo sobre el dataset DeepScaleR (matematicas), con un maximo de 3 epocas y recompensa binaria basada en la correctitud de la respuesta extraida de las etiquetas `\boxed{}`.

Este checkpoint concreto es el paso 300 de una ablacion de semillas: forma parte de un conjunto de tres semillas (42, 43, 44) con la misma receta, y este repositorio corresponde a la semilla 42. Su relevancia es principalmente de investigacion: permite estudiar la varianza entre semillas y el efecto del presupuesto de tokens en el razonamiento matematico de un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, variante E2B); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `google/gemma-4-E2B-it`, por lo que conserva la arquitectura del modelo base (transformer multimodal con pipeline `any-to-any` e `image-text-to-text`). El entrenamiento emplea GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion del reward por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a aprender a concluir dentro de esa ventana.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos en total. La recompensa es binaria: correctitud de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico paso a paso bajo un presupuesto de generacion de 1.024 tokens.
- Generacion de texto y razonamiento en formato de cadena de pensamiento (prompt "Let's think step-by-step").
- Produccion de respuestas finales en formato `\boxed{}` para facilitar la extraccion automatica.
- Capacidades multimodales heredadas del modelo base (pipeline `any-to-any` / `image-text-to-text`), aunque el ajuste se centra en matematicas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de investigacion sobre presupuestos de tokens: el modelo permite estudiar como un LLM pequeno internaliza un limite de 1.024 tokens para razonamiento matematico, comparando con los otros checkpoints de la ablacion de semillas.
- Resolucion de problemas matematicos de competicion: adecuado para benchmarks tipo DeepScaleR, AIME o GSM8K donde se requiere razonamiento paso a paso y respuesta final extraible.
- Generacion de soluciones con formato estructurado: la salida en `\boxed{}` facilita el parseo automatico en pipelines de evaluacion o correccion automatica.
- Experimentos de reproducibilidad: al ser parte de una ablacion multi-semilla, sirve para medir la varianza del entrenamiento GRPO entre semillas (42, 43, 44).
- Destilacion o generacion de datos sinteticos de razonamiento: puede emplearse para producir cadenas de pensamiento acotadas en longitud que sirvan como datos de entrenamiento para modelos menores.
- Despliegue ligero en entornos con recursos limitados: con ~5,1 mil millones de parametros, es viable en GPUs de consumo para prototipos e investigacion, aunque no se documentan requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa, un modelo de ~5,1 mil millones de parametros en F32 requiere aproximadamente 20,5 GB solo para pesos; en FP16 ~10,2 GB; en cuantizacion de 8 bits ~5,1 GB; en 4 bits ~2,6 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria en GPUs de 24 GB (RTX 4090, A10G) en FP16 y en GPUs de 16 GB con cuantizacion.
- Cabe en GPU de consumo: previsiblemente si, con cuantizacion, aunque no esta documentado.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM` y `device_map="auto"`) y `vLLM` (`vllm serve`), segun la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (gemma4-e2b-1k-grpo seed42 s300) | 5.123.178.051 | no disponible | GRPO matematicas, presupuesto 1k tokens | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo base multimodal instruct | Apache 2.0 (Gemma 4) | Hugging Face |
| gemma4-e2b-1k-grpo seed43 (daringquagga s300) | no disponible | no disponible | Misma receta, semilla 43 | Apache 2.0 | Hugging Face |
| gemma4-e2b-1k-grpo seed44 (immunecod s300) | no disponible | no disponible | Misma receta, semilla 44 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: publicado como parte de una submission anonima a ICLR 2027, sin garantias de robustez en produccion.
- Entrenado exclusivamente para matematicas (DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- Presupuesto fijo de 1.024 tokens: las respuestas que exceden ese limite se truncan, lo que puede producir respuestas incompletas o incorrectas en problemas que requieran razonamientos mas largos.
- Riesgo de alucinacion: como todo LLM, puede generar razonamientos plausibles pero incorrectos; la recompensa binaria no elimina este riesgo.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de idioma: no se especifican los idiomas soportados; el ajuste se realizo sobre datos de matematicas en el dataset DeepScaleR, mayoritariamente en ingles.
- Licencia: Apache 2.0 segun la model card, pero hereda la licencia del modelo base Gemma 4; conviene revisar los terminos de la licencia de Gemma 4 para uso comercial.
- Solo se publica el checkpoint final del paso 300 de la semilla 42; los demas checkpoints de la ablacion estan en repositorios separados.
- Sin datos de benchmarks publicados, por lo que no es posible validar su rendimiento real frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint anterior (paso 250, misma semilla): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Semilla 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Semilla 44 (paso 280): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Semilla 44 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
