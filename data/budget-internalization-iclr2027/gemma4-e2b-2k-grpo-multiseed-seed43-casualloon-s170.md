# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170

## Resumen

`gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it` de Google, publicado por el colectivo anónimo `budget-internalization-iclr2027` como parte de un envío a ICLR 2027. El objetivo del entrenamiento es el razonamiento matemático bajo un presupuesto de generación restringido a 2.048 tokens, de modo que el modelo aprenda a producir soluciones correctas sin desbordar la ventana de salida asignada.

El modelo conserva la arquitectura y el pipeline del base (any-to-any, con entrada image-text-to-text) y suma 5.123.178.051 parámetros totales en pesos safetensors (20,5 GB de repositorio, dtype F32). Este checkpoint concreto (paso 170) es el mejor de la ejecución con semilla 43 según precisión de validación, dentro de un ablation de tres semillas (42, 43, 44) sobre la misma receta.

Su relevancia es doble: por un lado, demuestra una técnica de internalización de presupuesto de tokens mediante RL con recompensa binaria de corrección; por otro, publica todos los checkpoints intermedios y finales del ablation, lo que facilita la reproducibilidad y el estudio de la varianza entre semillas en entrenamiento con GRPO. La licencia heredada es Apache 2.0 según los metadatos del repositorio, aunque la model card remite a la licencia específica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E2B), pipeline any-to-any |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la de google/gemma-4-E2B-it; enlace a licencia Gemma 4 en la model card) |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 con pipeline any-to-any (entrada image-text-to-text). Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar ese límite en lugar de ignorarlo.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset` (matemáticas), con un máximo de 3 épocas. La configuración es de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. Este checkpoint corresponde al paso 170, seleccionado como mejor por precisión de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matemático con respuesta final en formato `\boxed{}`, entrenado explícitamente para operar bajo un presupuesto de 2.048 tokens de generación.
- Generación de texto y razonamiento multi-paso (cadena de pensamiento inducida por el prompt de entrenamiento).
- Capacidades multimodales heredadas del base Gemma 4 E2B (pipeline any-to-any, image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no confirmado como capacidad separada; el razonamiento se induce vía prompt.

## Casos de uso

- Resolución de problemas matemáticos con límite estricto de tokens: el modelo está entrenado para producir soluciones dentro de 2.048 tokens, lo que encaja en pipelines donde el coste por respuesta está acotado y se penaliza el desbordamiento.
- Evaluación de investigación en RL: sirve como checkpoint de referencia en estudios sobre internalización de presupuesto de tokens, con semillas y pasos comparables publicados.
- Reproducibilidad de experimentos: al existir checkpoints de las semillas 42, 43 y 44 en pasos 170/230/300, permite analizar la varianza entre ejecuciones de GRPO.
- Generación de soluciones paso a paso para datasets de matemáticas: útil para poblar conjuntos de entrenamiento o validación con razonamientos estructurados y respuesta extraíble.
- Tutoría automática de matemáticas: el formato de salida con `\boxed{}` facilita la verificación automática de respuestas en sistemas de corrección.
- Baseline para comparativas de eficiencia: al fijar un presupuesto de 2.048 tokens, permite medir precisión frente a coste frente a modelos sin restricción de longitud.
- Prototipado multimodal: al heredar el pipeline any-to-any del base, puede emplearse en tareas image-text-to-text, aunque su ajuste específico es matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta precisión de validación sobre 480 problemas reservados de DeepScaleR como criterio de selección del checkpoint, sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- Cuantización a FP16/BF16: alrededor de 10,3 GB de pesos; cuantización a 8 bits: ~5,1 GB; a 4 bits: ~2,6 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para F32 sin cuantizar; RTX 4090 (24 GB) para FP16; GPUs consumer de 8-16 GB solo con cuantización agresiva.
- Cabe en GPU consumer: sí, con cuantización (RTX 4090 en FP16; RTX 3080/4070 en 8 o 4 bits).
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`), y potencialmente llama.cpp/Ollama/TGI si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170 | 5.123.178.051 | no disponible | GRPO, presupuesto 2k, DeepScaleR | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | instrucción base | licencia Gemma 4 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 | mismo base | no disponible | GRPO, semilla 42, paso 300 | apache-2.0 | Hugging Face |
| gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300 | mismo base | no disponible | GRPO, semilla 44, paso 300 | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El ajuste está especializado en matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al base.
- El truncamiento a 2.048 tokens durante el entrenamiento puede producir respuestas cortadas en problemas que requieran razonamientos más largos.
- Riesgo de alucinación inherente a modelos generativos; la recompensa binaria no elimina errores de razonamiento plausibles.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe del ajuste.
- Licencia: los metadatos indican apache-2.0, pero la model card remite a la licencia de Gemma 4; conviene verificar las restricciones de uso comercial de esa licencia antes de producción.
- Modelo de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa ni de uso en producción.
- No se publican datos de cuantización ni pesos GGUF; el despliegue eficiente requiere conversión propia.
- El checkpoint es el paso 170 de 300; el autor publica el paso 300 por separado, lo que sugiere que el mejor checkpoint no es el final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint semilla 44, paso 230: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
