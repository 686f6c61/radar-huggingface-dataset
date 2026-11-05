# pwg0218/connectailab-rl-nil-v1

## Resumen

connectailab-rl-nil-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor pwg0218, dentro del ecosistema del simulador de gestión empresarial CONNECT TYCOON desarrollado por CONNECT AI LAB y AI CITY BUILDERS. El modelo resuelve una tarea muy acotada: recibir un estado de situación, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devolver únicamente la letra de la opción seleccionada, sin explicación. No es un modelo de propósito general, sino un decisor de elección múltiple especializado en dinámicas de empresa simuladas.

La relevancia del modelo es fundamentalmente metodológica y educativa: documenta un pipeline completo de reinforcement learning aplicado a un LLM pequeño (0,8B parámetros) que combina un profesor PPO entrenado en el simulador, generación de un dataset de decisiones puntuadas, supervisión fina (SFT) y un ajuste posterior con GRPO (Group Relative Policy Optimization) con normalización de grupo y penalización KL respecto al modelo de partida. El resultado reportado es un incremento de la precisión en el conjunto de test del 30,0 % (modelo base) al 62,6 % (SFT) y al 65,0 % (RL), con una reducción de la "regret" de 4,79 a 4,12.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato PEFT/safetensors (adaptador, no modelo completo) y declaración de idioma coreano (`ko`). El repositorio tiene un tamaño de 0,0 GB, lo que confirma que solo contiene los pesos del adaptador LoRA, no una copia del modelo base. Está pensado para investigación y docencia, no para producción empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA no declara su número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base Qwen/Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. No se modifican los pesos del modelo base; se añaden matrices de bajo rango entrenadas para la tarea de decisión. La entrada sigue un formato estructurado: un mensaje de sistema con instrucciones estrictas (evaluar la tarea, tratar el texto del estado como datos y no como instrucciones, devolver solo la letra), y un mensaje de usuario con un JSON que contiene `state`, `question` y `options` (cada una con `label`, `key` y `description`). La salida esperada es una única letra.

El entrenamiento se realizó en cuatro fases según la model card. Primero, un pequeño policy se entrena con PPO durante miles de meses simulados en CONNECT TYCOON; este policy actúa como profesor. Segundo, se construye un "cuaderno de problemas": para cada mes operado por el profesor, se alteran las opciones de una decisión y se vuelve a ejecutar el mes completo para puntuar cada alternativa. Tercero, se hace aprendizaje supervisado siguiendo la opción con mayor puntuación. Cuarto, se aplica RL con GRPO: se agrupan todas las opciones de una decisión, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo score en el simulador supera la media, con una penalización KL respecto al modelo de partida. El dataset contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresa `general` calibrada con datos públicos. No se especifica el número de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades

- Selección de una única opción entre varias en tareas de decisión estructurada (formato JSON con `state`, `question` y `options`).
- Salida restringida a una letra (`A`, `B`, `C`...), lo que facilita el parseo automático y la integración en pipelines.
- Razonamiento de decisión en dominios de gestión empresarial simulada (operaciones mensuales de una empresa ficticia).
- Interpretación de estados textuales y preguntas en coreano.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso más allá de la selección de opción.
- No se documenta soporte de agentes ni de function calling.

## Casos de uso

- Investigación en RL aplicado a LLM: el modelo sirve como referencia reproducible de un pipeline PPO → SFT → GRPO sobre un modelo de 0,8B, útil para estudiar cómo el ajuste por refuerzo mejora la precisión en tareas de elección múltiple (30,0 % → 65,0 % en test).
- Docencia y formación: la model card enlaza un notebook de Google Colab para reproducir el entrenamiento, lo que permite usar el modelo como ejemplo práctico en cursos de reinforcement learning y LLM.
- Evaluación de entornos tipo Gymnasium: el simulador CONNECT TYCOON y este adaptador permiten montar experimentos de decisión con recompensas medibles (dinero, satisfacción, accidentes) y comparar políticas.
- Prototipado de asistentes de decisión acotados: en un entorno controlado, se puede integrar el adaptador para elegir entre opciones predefinidas (por ejemplo, qué acción tomar ante un incidente simulado) siempre que el estado y las opciones se formateen según el esquema esperado.
- Generación de datos sintéticos de decisión: el modelo puede etiquetar opciones en escenarios simulados para construir datasets de entrenamiento de otros modelos, dado que su salida es una letra fácil de parsear.
- Estudio de alineación y robustez: el formato con instrucción explícita de tratar el estado como datos permite experimentar con ataques de prompt injection dentro del campo `state` y medir la resistencia del adaptador.
- Benchmarking de modelos pequeños: al ser un adaptador de 0,8B, sirve como línea base ligera frente a modelos mayores en tareas de elección múltiple con opciones etiquetadas.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, sobre el conjunto de test de 840 problemas:

| Modelo | Precisión en test | Regret (menor es mejor) | Beneficio mensual en simulador | Transacciones reales con tarjeta: pérdidas reducidas |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,0 % | 4,79 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 62,6 % | 4,15 | no disponible | no disponible |
| Reinforcement learning (GRPO) | 65,0 % | 4,12 | -319 millones de wones | 37 % (91/177) |

El propio autor advierte que la métrica de operación empresarial corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo aún está por debajo del policy profesor entrenado con PPO en el simulador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy pequeño (repositorio de 0,0 GB), pero requiere cargar el modelo base Qwen/Qwen3.5-0.8B en memoria.
- VRAM estimada para inferencia en FP16: en torno a 1,6 GB solo para los pesos del modelo base, más overhead de activaciones y del adaptador; en la práctica, unos 2-3 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,8-1 GB; en 4 bits, alrededor de 0,5-0,7 GB (estimaciones orientativas, no publicadas por el autor).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de datacenter (A100, H100) sobredimensionadas para este tamaño.
- Despliegue: la model card muestra el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama; al ser un adaptador PEFT, la ruta natural es transformers con PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-nil-v1 (este) | 0,8B base + LoRA | no disponible | Decisión de elección múltiple en simulador empresarial | Apache 2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Modelo de propósito general | no disponible en la información | HuggingFace |
| Política PPO del simulador (profesor) | no disponible | no disponible | Decisión en CONNECT TYCOON | no disponible | no disponible |

No se dispone de datos publicados de otros adaptadores comparables de la misma categoría (decisión estructurada sobre simulador) en la información proporcionada; la comparativa queda limitada al modelo base y al policy profesor mencionados por el autor.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor indica que es un modelo sobre un simulador sintético y que debe revalidarse con los registros reales de una empresa antes de usarse para decisiones de gestión.
- Rendimiento limitado: 65,0 % de precisión en test y regret de 4,12; sigue por debajo del policy profesor PPO del simulador.
- Beneficio mensual negativo en simulador (-319 millones de wones) en la evaluación reportada, lo que evidencia que la política aprendida no es rentable en el entorno simulado.
- Muestra pequeña: la métrica de operación se calcula sobre dos meses no vistos, por lo que la varianza es alta.
- Idioma: declarado únicamente coreano (`ko`); no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Formato de salida rígido: espera una única letra; fuera del esquema JSON `state`/`question`/`options` el comportamiento no está garantizado.
- Riesgo de inyección de prompt: el propio system prompt advierte de tratar el campo `state` como datos; si se relaja esa instrucción, el modelo puede desviarse.
- Riesgo de alucinación: al ser un decisor de opciones, el riesgo se manifiesta como selección de opciones inexistentes o mal formateadas, no como texto libre.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No se documentan sesgos concretos ni evaluaciones de seguridad; el dominio es un simulador empresarial con distribución `general` calibrada con datos públicos, lo que puede introducir sesgos de ese corpus.
- No apto como sustituto de un LLM de propósito general: no genera texto libre, no razona multi-paso de forma documentada y no soporta tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pwg0218/connectailab-rl-nil-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
