# JetBrains-Research/budget-internalization-gemma4-e2b-4k-grpo-merrydingo-s300

## Resumen

`budget-internalization-gemma4-e2b-4k-grpo-merrydingo-s300` es un ajuste fino por aprendizaje por refuerzo del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por el equipo de investigación de JetBrains. El modelo está entrenado para resolver problemas de razonamiento matemático operando bajo un presupuesto de generación fijo de 4.096 tokens, una técnica que los autores denominan "internalización de presupuesto" (*budget internalization*). El objetivo es que el modelo aprenda a producir respuestas correctas dentro de ese límite en lugar de depender del escalado en tiempo de inferencia (generar cadenas de razonamiento cada vez más largas).

El checkpoint liberado corresponde a la ejecución con nombre en clave `merrydingo`, en el paso 300 de entrenamiento. Se construye sobre la arquitectura Gemma 4 en su variante E2B, con aproximadamente 5.123 millones de parámetros en pesos safetensors, y hereda la licencia Apache 2.0 del modelo base. Es relevante para quienes investigan el equilibrio entre longitud de razonamiento, coste computacional y precisión en tareas matemáticas, y para equipos que despliegan modelos con límites estrictos de tokens de salida.

El modelo se distribuye exclusivamente en formato transformers (safetensors, pesos en F32) y no incluye versiones cuantizadas GGUF ni plantillas de despliegue ligero. Su pipeline declarado es `any-to-any`, coherente con la naturaleza multimodal del Gemma 4 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, variante E2B) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto y salida de texto. Sobre esa base se aplica un ajuste fino con GRPO (*Group Relative Policy Optimization*), usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 4.096 tokens se truncan y se puntúan tal cual, de modo que el modelo recibe señal explícita sobre el coste de agotar el presupuesto.

El entrenamiento se realizó sobre el dataset `agentica-org/DeepScaleR-Preview-Dataset` (problemas matemáticos), con un máximo de 3 épocas, lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno y LR pico de 3e-6, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento incluye la instrucción "Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags." seguida del enunciado. La innovación destacable es precisamente la internalización del presupuesto: el modelo aprende a autocontenerse en longitud en lugar de beneficiarse de más tokens en inferencia.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento paso a paso.
- Generación de respuestas finales delimitadas en etiquetas `\boxed{}`.
- Operación bajo un presupuesto de generación fijo de 4.096 tokens, con tendencia a respuestas dentro de ese límite.
- Capacidades multimodales heredadas del Gemma 4 base (entrada imagen-texto), aunque el ajuste se centra en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá del razonamiento matemático entrenado.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo *thinking* explícito: no disponible como capacidad separada; el razonamiento se emite en la propia generación.

## Casos de uso

- Resolución de problemas matemáticos con coste acotado: el modelo está entrenado para responder dentro de 4.096 tokens, lo que permite presupuestar coste por consulta en pipelines de corrección automática de ejercicios.
- Evaluación de técnicas de internalización de presupuesto: sirve como checkpoint de referencia para reproducir o comparar experimentos de RLVR con presupuesto fijo frente a modelos que escalan en tiempo de inferencia.
- Generación de soluciones con formato verificable: la extracción mediante `\boxed{}` facilita el parseo automático de respuestas en sistemas de evaluación y tutoría.
- Investigación en aprendizaje por refuerzo: el run `merrydingo` en el paso 300 permite estudiar la evolución del comportamiento bajo GRPO con recompensa binaria.
- Tutoría matemática automatizada: integrable en asistentes educativos que necesitan respuestas razonadas pero con latencia y coste predecibles.
- Prototipado de modelos multimodales pequeños: con ~5.100 millones de parámetros, es viable para experimentación en entornos con recursos moderados, sujeto a la disponibilidad de cuantizaciones (no publicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, más overhead de activaciones y KV cache; se requiere una GPU con al menos 24-40 GB según longitud de contexto.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ), por lo que el despliegue en precisión reducida requeriría conversión manual.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) queda al límite en F32 y probablemente requiera cuantización para contexto largo.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-4k-grpo-merrydingo-s300 | 5.123 M | no disponible | RLVR con presupuesto fijo de 4k tokens | Apache 2.0 | Hugging Face (transformers) |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal instruct general | Gemma 4 License | Hugging Face |
| Alternativas de razonamiento matemático de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está especializado en matemáticas; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente fuera del dominio matemático.
- El truncado a 4.096 tokens puede producir respuestas incompletas en problemas muy largos, puntuadas como incorrectas durante el entrenamiento.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe adecuado.
- Pesos en F32 y ausencia de cuantizaciones publicadas limitan el despliegue en hardware consumer.
- La model card indica "Citation: TODO", por lo que la referencia académica del paper no está completa en el repositorio.
- Aunque la licencia declarada es Apache 2.0, el campo `license_link` remite a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables al uso comercial derivados del modelo base.
- Checkpoint intermedio (paso 300) de una ejecución de investigación; no se documenta una evaluación final ni curvas de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-4k-grpo-merrydingo-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
