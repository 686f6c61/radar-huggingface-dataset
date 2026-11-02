# Kruel12/llm-hw2-reward-model

## Resumen

`Kruel12/llm-hw2-reward-model` es un modelo de recompensa (reward model) obtenido mediante fine-tuning supervisado del modelo base `HuggingFaceTB/SmolLM-135M-Instruct`, un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. El modelo ha sido entrenado con la librería TRL (Transformers Reinforcement Learning) sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, y se publica con la pipeline `text-classification`, lo que indica que su salida es una puntuación escalar que estima la calidad o preferibilidad de un texto.

El propósito de un reward model de este tipo es servir como componente en pipelines de RLHF (Reinforcement Learning from Human Feedback) o como filtro de calidad en generación de texto: dado un texto de entrada, devuelve un score que puede usarse para rankear respuestas, filtrar salidas de un LLM o alimentar algoritmos como PPO o DPO. Su tamaño reducido (134,5 millones de parámetros, repo de 0,3 GB) lo hace especialmente atractivo para experimentación académica y prototipado en hardware modesto.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto concreto y sus especificaciones reales; por otro, sirve como ejemplo de cómo se construye y despliega un reward model de pequeño tamaño. Cabe señalar que el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y que no se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM-135M-Instruct), cabeza de clasificación para reward modeling |
| Parámetros totales | 134.515.584 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base SmolLM-135M-Instruct, no confirmada en la información proporcionada) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Framework de entrenamiento | TRL 0.28.0, Transformers 5.21.0, PyTorch 2.11.0+cu130 |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-135M-Instruct, un transformer decoder-only de 135 millones de parámetros diseñado por Hugging Face para ejecución en dispositivos con recursos limitados. Sobre esa base, el autor ha aplicado un fine-tuning con TRL en modo `reward-trainer`, lo que típicamente implica sustituir o adaptar la cabeza de lenguaje por una cabeza de regresión escalar que produce una puntuación de recompensa para una secuencia de entrada. El resultado se exporta con la pipeline `text-classification`, de modo que la salida es un `score` numérico accesible vía `transformers.pipeline`.

El entrenamiento se realizó sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, orientado a preferencias humanas y utilizado habitualmente en entrenamiento DPO. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la función de pérdida concreta (p. ej. Bradley-Terry o margin ranking), ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `pururus-hse/hw2-rlhf`, lo que sugiere un contexto académico (posiblemente una asignatura de "LLM homework 2").

## Capacidades

- Puntuación de recompensa: dado un texto, devuelve un score escalar que estima su calidad o preferibilidad según el dataset de preferencias humanas.
- Ranking de respuestas: permite ordenar múltiples candidatos generados por un LLM y seleccionar el mejor según el score.
- Filtrado de calidad: puede usarse como discriminador para descartar salidas de baja calidad en pipelines de generación.
- Integración en RLHF: sirve como reward model en algoritmos como PPO o como referencia en DPO.
- Compatibilidad con `transformers.pipeline` y con `text-embeddings-inference` (según los tags del repo).
- Clasificación de texto genérica: al exponerse como `text-classification`, puede invocarse con la API estándar de Hugging Face.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Filtrado de salidas en generación de código: usar el reward model para puntuar varias completaciones de código generadas por un LLM y seleccionar la de mayor score antes de mostrarla al usuario, reduciendo la tasa de respuestas defectuosas en asistentes de programación.
- Ranking en sistemas de atención al cliente: dado un conjunto de respuestas candidatas generadas por un chatbot, ordenarlas con el reward model y servir la mejor, mejorando la coherencia y utilidad percibida sin necesidad de un LLM juez de gran tamaño.
- Entrenamiento RLHF a pequeña escala: emplear el modelo como reward model en un pipeline PPO o DPO con un LLM pequeño (por ejemplo, otro SmolLM), lo que permite experimentar con RLHF en una única GPU consumer.
- Evaluación automática de resúmenes: puntuar resúmenes generados frente a documentos fuente y usar el score como métrica proxy de calidad en pipelines de evaluación continua.
- Investigación académica y docencia: por su tamaño (134M parámetros) y su origen claramente didáctico (proyecto `hw2-rlhf`), es adecuado para prácticas de RLHF, análisis de sesgos en reward models y estudios de alineación a bajo coste.
- Prototipado de sistemas de recomendación de texto: puntuar comentarios, reseñas o publicaciones generadas para priorizar contenido de mayor calidad en un feed.
- Data filtering en curación de datasets: usar el reward model para descartar muestras de baja calidad en la construcción de corpus de instrucciones o preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (134,5M parámetros × 4 bytes ≈ 0,54 GB, aunque el repo ocupa 0,3 GB, probablemente en bf16/fp16), y por debajo de 0,2 GB en cuantización de 8 bits. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas (incluidas GTX 1650, RTX 2060, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers.pipeline` (soporte nativo), `text-embeddings-inference` (según tags), servidores de inferencia compatibles con la API de Hugging Face (`endpoints_compatible`). No se documenta soporte explícito para vLLM, llama.cpp u Ollama, y al no publicarse GGUF no es directamente desplegable en Ollama sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kruel12/llm-hw2-reward-model | 134,5M | no disponible | Reward model (fine-tune de SmolLM-135M-Instruct) | no disponible | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en esta ficha | LLM instruct | Apache-2.0 (según el modelo base) | Hugging Face, ampliamente usado |
| Reward models de la familia ArmoRM / Skywork-Reward | 8B–70B (típico) | 4K–32K (típico) | Reward models | variable según modelo | Hugging Face |
| OpenAssistant/reward-model-deberta-v3-large-v2 | ~435M | 512 tokens | Reward model basado en DeBERTa | Apache-2.0 (según modelo) | Hugging Face |

La comparación con reward models de gran tamaño (ArmoRM, Skywork-Reward) es cualitativa: este modelo es dos o tres órdenes de magnitud menor y no se han publicado benchmarks que permitan comparar su calidad de ranking. Frente a `OpenAssistant/reward-model-deberta-v3-large-v2`, el modelo aquí descrito es más pequeño y se basa en un decoder en lugar de un encoder, pero no hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas (accuracy de preferencias, correlación con anotadores humanos, etc.), por lo que no es posible evaluar su calidad real como reward model.
- Licencia no especificada: la model card indica "licence: license" sin concretar; no se puede asumir uso comercial sin verificar con el autor.
- Idiomas no documentados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés, dado que el dataset de preferencias suele estar dominado por inglés.
- Riesgo de sesgo: al entrenarse sobre un dataset de preferencias humanas, puede heredar sesgos de los anotadores (culturales, de estilo, de longitud); los reward models tienden además a favorecer respuestas más largas o con formato específico.
- Riesgo de alucinación en el score: el modelo no "sabe" si un texto es factualmente correcto; solo estima preferibilidad, por lo que puede puntuar alto textos plausibles pero falsos.
- Contexto limitado: al derivar de SmolLM-135M-Instruct, la ventana de contexto es previsiblemente corta (no confirmada), lo que limita su uso en documentos largos.
- Modelo de investigación: el nombre del proyecto (`hw2-rlhf`) y la ausencia de descargas sugieren un artefacto académico, no un modelo listo para producción.
- Sin garantías de calibración: no se documenta si los scores están calibrados en un rango interpretable, lo que complica su uso como umbral fijo en producción.
- Repo pequeño y sin mantenimiento aparente: creado y actualizado el mismo día, sin issues ni discusión asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kruel12/llm-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pururus-hse/hw2-rlhf/runs/y7xbupo5
