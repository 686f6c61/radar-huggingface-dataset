# Mahesh111000/qwen3-8b-hanabi-init30turns-thinking-step_220

## Resumen

Este modelo es un fine-tune de Qwen3-8B-Base desarrollado por Mahesh111000, entrenado con aprendizaje por refuerzo (RL) sobre el juego Hanabi, un juego de cartas cooperativo con información imperfecta. El nombre del checkpoint indica que se trata del paso 220 de entrenamiento, con inicialización de secuencias de 30 turnos y modo de pensamiento (thinking) activado. Se centra en dos tareas principales: seguimiento del estado de creencias de los jugadores (belief-state tracking) y evaluación de la calidad de los movimientos (move rating). Es un modelo de investigación, sin despliegue comercial aparente, con licencia Apache 2.0.

El modelo base Qwen3-8B es un transformer causal denso de 8.190 millones de parámetros (8,19B), con 36 capas, atención GQA (32 cabezas de consulta y 8 de clave/valor), contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN. Qwen3 destaca por su capacidad de alternar entre modo de pensamiento (razonamiento explícito) y modo directo, así como por su soporte de más de 100 idiomas y herramientas. Este fine-tune no publica una model card propia, por lo que la información detallada del entrenamiento (hiperparámetros, algoritmo exacto de RL, dataset de juegos) no está disponible en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 nativo, 131.072 con YaRN |
| Tipos de cuantizacion | No especificados para este checkpoint; el modelo base soporta GGUF, AWQ, GPTQ, etc. |
| Idiomas soportados | No especificados; el modelo base soporta 100+ idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B-Base, un transformer causal denso con 36 capas, 32 cabezas de atención de consulta (Q) y 8 cabezas de clave/valor (GQA). El entrenamiento original de Qwen3 incluyó preentrenamiento masivo y post-entrenamiento con RLHF, lo que otorga capacidades de razonamiento y modo de pensamiento.

Este fine-tune se entrena con aprendizaje por refuerzo sobre Hanabi. La tarea principal es predecir el estado de creencias de los jugadores y puntuar la calidad de las acciones. El nombre "init30turns" sugiere que las secuencias de entrenamiento se inicializan con 30 turnos de juego, y "thinking" indica que se mantiene el modo de pensamiento del modelo base. No se han publicado detalles sobre el algoritmo exacto de RL (probablemente GRPO, por los tags del autor en otros checkpoints), el número de episodios, ni la composición del dataset. El repositorio no incluye configuración de entrenamiento, curva de recompensa ni métricas de validación.

## Capacidades

- Generación de texto y diálogo conversacional, heredadas del modelo base Qwen3-8B.
- Razonamiento explícito en modo de pensamiento (thinking mode), con generación de cadenas de razonamiento internas antes de la respuesta final.
- Seguimiento de estado de creencias en Hanabi: dado un historial de acciones y observaciones, el modelo puede inferir el conocimiento de cada jugador sobre las cartas de los demás.
- Evaluación de movimientos en Hanabi: dado un estado del juego, el modelo puntúa la calidad de las posibles acciones.
- Soporte de tool calling y function calling (capacidad heredada de Qwen3).
- Capacidades multilingües (heredadas, aunque no verificadas en este fine-tune).
- Capacidad de alternar entre modo de pensamiento y modo directo mediante el parámetro `enable_thinking`.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multiagente: el modelo puede actuar como política o como evaluador de estados en entornos de Hanabi, permitiendo estudiar estrategias de coordinacion en juegos con informacion imperfecta.
- Benchmarking de tecnicas de RL: al ser un checkpoint intermedio (paso 220), es util para analizar la evolucion del entrenamiento y comparar con otros checkpoints del mismo autor (por ejemplo, `qwen3-8b-hanabi-grpo-step_101` o `hanabi-qwen3-8b-rl-step100`).
- Desarrollo de agentes conversacionales para juegos de cartas: el modelo puede integrarse en un sistema que explique sus decisiones en lenguaje natural, gracias a su modo de pensamiento.
- Entrenamiento de modelos de creencias: puede utilizarse como generador de datos sinteticos para entrenar modelos mas pequenos en tareas de belief-state tracking.
- Evaluacion de politicas en juegos cooperativos: el modelo puede actuar como critico o recompensa aprendida en un marco de RL, puntuando movimientos en Hanabi.
- Estudio de transferencia de capacidades: analizar como el fine-tune en Hanabi afecta a las capacidades generales de Qwen3-8B (razonamiento, codigo, etc.) puede aportar informacion sobre la plasticidad de los modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. El modelo base Qwen3-8B tiene resultados conocidos en MMLU, HumanEval, GSM8K, etc., pero este fine-tune no reporta metricas propias. El autor menciona en otro repositorio (`hanabi-qwen3-8b-rl-step100`) una recompensa de validacion de 1,3429 para el mejor checkpoint, pero no hay datos para este paso 220.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 8,19B parametros. En fp16 (formato safetensors) ocupa aproximadamente 16,4 GB, por lo que requiere al menos 20 GB de VRAM para inferencia con batch pequeno. Con cuantizacion a 4 bits (por ejemplo, GPTQ o AWQ) se reduce a ~5-6 GB, permitiendo ejecucion en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070.
- GPUs recomendadas: para fp16, una RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantizacion 4-bit, una RTX 3090 o RTX 4070 Ti Super es suficiente.
- Despliegue: compatible con vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LMStudio y MLX-LM, segun la documentacion de Qwen3.
- Latencia y throughput: no se han publicado mediciones especificas para este checkpoint. En el modelo base, con vLLM en una A100, se pueden alcanzar decenas de tokens por segundo en modo directo; en modo pensamiento la latencia aumenta por la generacion de cadenas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-8B-Base (base) | 8,19B | 32K (131K YaRN) | Modelo general | Apache 2.0 |
| Mahesh111000/qwen3-8b-hanabi-grpo-step_101 | 8,19B | 32K | Fine-tune RL en Hanabi (paso 101) | Apache 2.0 |
| Mahesh111000/hanabi-qwen3-8b-rl-step100 | 8,19B | 32K | Fine-tune RL en Hanabi (paso 100, mejor validacion) | Apache 2.0 |
| Este modelo | 8,19B | 32K | Fine-tune RL en Hanabi (paso 220, init 30 turnos, thinking) | Apache 2.0 |

No hay modelos comparables de otros autores para Hanabi con Qwen3-8B en el momento de la consulta. Los modelos mas cercanos son los otros checkpoints del mismo autor.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (paso 220), no un modelo final pulido. Puede presentar comportamientos inestables o incompletos.
- Especializacion extrema en Hanabi: el fine-tune puede degradar las capacidades generales de Qwen3-8B (razonamiento matematico, codigo, etc.), aunque no hay datos que lo confirmen.
- No se han publicado evaluaciones de sesgos, alucinacion o robustez para este modelo.
- El modo de pensamiento puede generar cadenas de razonamiento largas, aumentando la latencia y el coste computacional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye documentacion sobre limitaciones de uso especificas.
- No se dispone de informacion sobre el dataset de entrenamiento de Hanabi utilizado (fuente de los juegos, distribucion de turnos, etc.), lo que dificulta evaluar su generalizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-init30turns-thinking-step_220
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper de Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper de Hanabi (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Otros checkpoints del autor:
  - https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-grpo-step_101
  - https://huggingface.co/Mahesh111000/hanabi-qwen3-8b-rl-step100
