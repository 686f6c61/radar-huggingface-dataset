# ketimiroshnik/llm-course-hw2-reward-model

## Resumen

`llm-course-hw2-reward-model` es un modelo de recompensa (reward model) de tipo clasificador de texto construido sobre `HuggingFaceTB/SmolLM-135M-Instruct`, un transformer decoder de 135 millones de parámetros. Lo desarrolla el usuario de HuggingFace `ketimiroshnik` como trabajo de un curso de LLM (identificador `llm-course-hw2-reward-model`). Su función es asignar una puntuación escalar a un diálogo completo de forma que las respuestas preferidas (`chosen`) obtengan una puntuación mayor que las rechazadas (`rejected`), lo que lo hace apto como función de recompensa en pipelines de RLHF/PPO.

El modelo se entrenó sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, con un split 90/10 y semilla 42, descartando pares con diálogos de más de 512 tokens. Según la model card, solo se entrenó la cabeza lineal durante una época, manteniendo congelado el resto del modelo base. Los resultados reportados en test son un descenso de la pérdida pairwise de 0,6895 a 0,0239 y un aumento de la accuracy de emparejamiento del 52,29 % al 99,89 %.

Es relevante como ejemplo didáctico de construcción de un reward model ligero y por su uso posterior como señal de recompensa en PPO, no como modelo de propósito general. Su tamaño reducido (134,5 millones de parámetros, repo de 0,5 GB) permite entrenarlo y desplegarlo en hardware muy modesto, lo que lo convierte en una pieza útil para prototipos de alineamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM) con cabeza lineal de clasificación/reward |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens efectivos (pares más largos excluidos del entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Pipeline | text-classification |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `SmolLM-135M-Instruct`, un transformer decoder de 135 millones de parámetros, y le añade una cabeza lineal que produce una puntuación escalar por diálogo. Durante el entrenamiento solo se actualizó esa cabeza lineal; el resto de los pesos del modelo base permanecieron congelados. Se usó el dataset `HumanLLMs/Human-Like-DPO-Dataset`, con pares `chosen`/`rejected`, split train/test 90/10, semilla 42 y filtrado de pares con diálogos de más de 512 tokens. El entrenamiento consistió en una única época con una función de pérdida pairwise (estilo Bradley-Terry), de modo que la puntuación del `chosen` superase a la del `rejected`.

No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO adicional ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card sí indica que el modelo resultante se empleó después como función de recompensa en PPO.

## Capacidades

- Puntuación de pares de diálogos: asigna un score escalar a un diálogo completo y permite comparar respuestas `chosen` frente a `rejected`.
- Clasificación de preferencias: función de recompensa para RLHF/PPO y para ranking de respuestas generadas por otros modelos.
- Evaluación de estilo conversacional: en el ejemplo de la model card, penaliza respuestas formales y premia respuestas conversacionales con emojis, reflejando la distribución del dataset de entrenamiento.
- Procesamiento de diálogos multi-turno dentro del límite de 512 tokens.
- Idioma: únicamente inglés.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Función de recompensa en PPO: el propio autor lo usó como señal de recompensa para ajustar un modelo de lenguaje; su tamaño de 135 M permite iterar rápido en experimentos de alineamiento con recursos limitados.
- Ranking de respuestas en evaluación automática: dado un prompt y varias salidas candidatas, puntuar cada diálogo y ordenarlas por preferencia estimada, útil para comparar checkpoints o configuraciones de decodificación.
- Filtrado de datos sintéticos: puntuar pares generados y descartar aquellos en los que el modelo asigna mayor score a la respuesta de menor calidad esperada, como paso de limpieza previo a SFT.
- Prototipado educativo de RLHF: sirve como ejemplo reproducible de cómo entrenar una cabeza de recompensa sobre un modelo pequeño con un dataset DPO público.
- Evaluación de estilo conversacional: detectar respuestas excesivamente formales o impersonales en asistentes conversacionales en inglés, dado el sesgo observado hacia respuestas coloquiales.
- Pruebas de regresión en pipelines de generación: integrar el score como métrica automática en CI para detectar degradaciones de estilo o de preferencia tras cambios en prompts o en el modelo generador.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test del dataset de entrenamiento:

| Metrica | Antes de entrenar | Despues de entrenar |
|---|---|---|
| Pairwise loss | 0,6895 | 0,0239 |
| Accuracy de emparejamiento | 52,29 % | 99,89 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, RewardBench u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,54 GB solo para pesos; en fp16/bf16, unos 0,27 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (librería nativa del repo), `text-embeddings-inference` (tag del repo) y endpoints compatibles. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketimiroshnik/llm-course-hw2-reward-model | 134,5 M | 512 tokens efectivos | Reward model sobre SmolLM-135M | no disponible | HuggingFace, 0 descargas |
| ArmoRM-Llama3-8B | 8 B | no disponible | Reward model generalista | no disponible en esta ficha | HuggingFace |
| Skywork-Reward-Llama-3.1-8B | 8 B | no disponible | Reward model generalista | no disponible en esta ficha | HuggingFace |
| HuggingFaceTB/SmolLM-135M-Instruct | 135 M | no disponible | LLM instruct base | no disponible en esta ficha | HuggingFace |

La comparación con reward models generalistas de 8 B no es directa: este modelo es un artefacto de curso, entrenado sobre un único dataset y con solo la cabeza lineal ajustada, mientras que los modelos de 8 B se entrenan sobre mezclas amplias de preferencias y se evalúan en RewardBench. No se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo ha visto datos en inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Entrenado únicamente sobre `HumanLLMs/Human-Like-DPO-Dataset` durante una época con la cabeza lineal congelada del resto: es probable que generalice mal fuera de la distribución de ese dataset.
- Sesgo de estilo documentado en la propia model card: premia respuestas coloquiales con emojis y penaliza respuestas formales, lo que puede no ser deseable en dominios profesionales o técnicos.
- Límite efectivo de 512 tokens: los diálogos más largos quedaron excluidos del entrenamiento y su puntuación más allá de ese límite no está validada.
- Riesgo de explotación de recompensa (reward hacking) si se usa en PPO: al ser una señal estrecha entrenada sobre un dataset pequeño, un policy puede aprender a maximizar el score sin mejorar la calidad real.
- Licencia no disponible: no se puede confirmar el uso comercial; además, la licencia del modelo base SmolLM-135M-Instruct debe verificarse por separado.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de robustez.
- No apto como modelo de generación: es un clasificador de recompensa, no un LLM para producir texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketimiroshnik/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
