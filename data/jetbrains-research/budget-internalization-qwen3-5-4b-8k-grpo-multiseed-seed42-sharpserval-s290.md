# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su propósito es internalizar un presupuesto fijo de generación de 8.192 tokens para tareas de razonamiento matemático, de modo que el modelo aprenda a producir respuestas correctas dentro de ese límite sin depender de un escalado de cómputo en tiempo de inferencia. Se enmarca en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de una arquitectura Qwen3.5 multimodal (etiqueta `image-text-to-text`) con 4.539.265.536 parámetros totales en pesos BF16 y un repositorio de 9,1 GB. El entrenamiento emplea GRPO con recompensa binaria de corrección de respuesta sobre el dataset DeepScaleR (matemáticas), con respuestas truncadas al alcanzar el presupuesto y puntuadas tal cual. Este repositorio concreto corresponde al mejor checkpoint (paso 290) de la semilla 42 dentro de un ablation de tres semillas (42, 43, 44).

Su relevancia radica en que explora un compromiso explícito: sacrificar la mejora por escalado en tiempo de test a cambio de precisión garantizada dentro de un presupuesto fijo de tokens, un escenario habitual en despliegues con latencia y coste acotados. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (etiqueta `qwen3_5`, pipeline `image-text-to-text`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 8.192 tokens, distinto de la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con capacidad multimodal (entrada de imagen y texto). No se detallan en la información disponible aspectos como el número de capas, la dimensionalidad oculta, el tipo de atención ni la composición exacta del corpus de preentrenamiento del modelo base.

El ajuste fino utiliza GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El presupuesto de generación se fija en `max_new_tokens = 8192`; las respuestas que alcanzan el límite se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar la restricción. Los datos provienen de DeepScaleR (matemáticas) con un máximo de 3 épocas, lote de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 290 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento usa la plantilla de chat del modelo base e incluye la instrucción de razonar paso a paso y emitir la respuesta dentro de `\boxed{}`. La precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matemático con presupuesto fijo de 8.192 tokens de generación.
- Generación de texto conversacional mediante la plantilla de chat del modelo base.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), aunque el ajuste fino se centra en matemáticas.
- Razonamiento paso a paso con formato de respuesta explícito en `\boxed{}`.
- Internalización de restricciones de longitud: el modelo está entrenado para resolver dentro del presupuesto en lugar de extender la cadena de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del bucle de razonamiento matemático: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo thinking explícito, visión o audio más allá de la etiqueta del pipeline: no disponible.

## Casos de uso

- Resolución de problemas matemáticos en producción con latencia acotada: el modelo está entrenado para responder dentro de 8.192 tokens, lo que permite dimensionar el coste de inferencia por petición sin escalado dinámico.
- Evaluación de modelos de razonamiento bajo restricciones de presupuesto: sirve como referencia para comparar precisión dentro de presupuesto frente a modelos que escalan en tiempo de test.
- Investigación en RLVR (RL con verificación): el checkpoint y sus variantes por semilla permiten reproducir y analizar la varianza del entrenamiento GRPO.
- Generación de soluciones verificables con formato `\boxed{}`: útil en pipelines automáticos que extraen y validan la respuesta final de forma programática.
- Tutoría matemática automatizada: el modelo produce cadenas de razonamiento paso a paso con una longitud máxima predecible, adecuado para entornos con cuotas de tokens.
- Reproducción de experimentos de ablation de semillas: los repositorios hermanos (semillas 43 y 44, pasos 160, 290 y 300) permiten estudiar la estabilidad del ajuste.
- Análisis de robustez ante truncamiento: al puntuar respuestas truncadas durante el entrenamiento, el modelo puede emplearse para estudiar el comportamiento en el límite del presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que este repositorio corresponde al mejor checkpoint (paso 290) de la semilla 42, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539.265.536 parámetros × 2 bytes), más memoria para activaciones y caché KV; el repositorio ocupa 9,1 GB.
- En cuantización de 8 bits: alrededor de 4,5 GB de pesos; en 4 bits: alrededor de 2,3 GB de pesos (estimaciones teóricas; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con margen para activaciones y caché.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB de VRAM en BF16; en 8 o 12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible, y la disponibilidad de GGUF no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290 | 4.539.265.536 | no disponible | RLVR con presupuesto fijo de 8.192 tokens sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (no confirmado en la información) | no disponible | Modelo multimodal preentrenado sin ajuste de presupuesto | Apache 2.0 (heredada) | Hugging Face |
| budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300 | ~4B | no disponible | Misma receta, semilla 43, paso 300 | Apache 2.0 | Hugging Face |
| budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300 | ~4B | no disponible | Misma receta, semilla 44, paso 300 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se limita a matemáticas (DeepScaleR); el rendimiento en otras tareas no está caracterizado.
- El modelo está entrenado para un presupuesto de 8.192 tokens; respuestas más largas se truncan y pueden degradar la calidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; la verificación de la respuesta final debe hacerse de forma programática.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no declarados; no se garantiza un rendimiento multilingüe.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los términos del modelo Qwen/Qwen3.5-4B para uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- La model card indica "Citation: TODO", por lo que la referencia bibliográfica no está formalizada.
- El checkpoint corresponde al paso 290 (mejor validación), no al paso final 300; para el paso final existe un repositorio separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint paso 300 (misma semilla): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Semilla 43, paso 160: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Semilla 44, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
