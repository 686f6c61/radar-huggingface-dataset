# dain-studio/connectailab-rl-yggdrasil-v1

## Resumen

Connectailab-rl-yggdrasil-v1 es un adaptador LoRA de aprendizaje por refuerzo (RL) construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por dain-studio (Dain_AI) en el marco del laboratorio CONNECT AI LAB. No es un modelo conversacional generalista: es un modelo de toma de decisiones empresariales que recibe un estado de situación, una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción elegida. La distribución de probabilidad sobre las letras funciona como probabilidad por alternativa, y el valor máximo como medida de confianza.

El modelo se ha entrenado sobre datos generados por el simulador CONNECT TYCOON, un entorno tipo Gymnasium donde una pequeña política PPO aprende a operar una empresa a lo largo de miles de meses simulados. Ese "profesor" (v4) genera un conjunto de problemas de decisión con puntuaciones por alternativa, que se usan primero para ajuste supervisado (SFT) y después para RL con GRPO sobre el modelo Qwen3.5-0.8B. El resultado es un cerebro especializado que prioriza satisfacción del cliente y evitación de riesgos por encima del beneficio puro.

Es relevante ahora por dos motivos: demuestra un pipeline completo de RL con simulador para decisiones empresariales sobre un modelo de menos de mil millones de parámetros, y publica resultados medidos (tasa de acierto, regret, beneficio mensual, detección de fraude en tarjetas) junto con sus limitaciones de forma explícita. La licencia Apache 2.0 y el formato MLX lo hacen directamente reproducible en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) + adaptador LoRA entrenado con RL (GRPO) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en formato MLX |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA para MLX (mlx_lm); el modelo base se carga desde Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 0,8 mil millones de parámetros (Qwen3.5-0.8B). Sobre él se aplica un adaptador LoRA entrenado en cuatro fases descritas por el autor: (1) RL con PPO en el simulador CONNECT TYCOON, donde una política pequeña opera la empresa durante miles de meses y actúa como profesor; (2) generación de un "cuaderno de problemas" en el que, para cada decisión, se alteran las opciones y se re-simula el mes completo para puntuar cada alternativa; (3) ajuste supervisado (SFT) sobre las opciones de mayor puntuación; y (4) RL con GRPO, agrupando todas las opciones de una decisión, normalizando las ventajas dentro del grupo y añadiendo una penalización KL contra el modelo de partida (β = 0,2). El conjunto de datos se distribuye en 4.082 problemas de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general`.

El historial de entrenamiento incluye dos rondas de RL de 100 pasos cada una: la primera con lr 5e-6 y la segunda, una corrección de seguridad, con lr 1e-5. Tras la primera ronda el modelo colapsó a "permitir siempre" en las decisiones de seguridad de pagos (84% de acierto, equivalente a la tasa base de la distribución), por lo que se reentrenó con 415 problemas de seguridad seleccionados para que la ventaja media por opción quedase cerca de cero, más 800 problemas de anclaje de otros departamentos (400 de atención al cliente, 400 de reembolsos). La innovación técnica destacable es el uso del simulador como generador de recompensas densas por alternativa, no solo por episodio, lo que permite SFT y RL sobre decisiones individuales.

## Capacidades

- Toma de decisiones de opción múltiple: recibe un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`) y devuelve una única letra.
- Calibración de confianza: la probabilidad asignada a cada letra actúa como probabilidad de la alternativa, y el máximo como medida de certeza.
- Decisiones empresariales simuladas: operación mensual de una empresa (precios, inventario, atención al cliente, reembolsos, seguridad de pagos).
- Detección de fraude en tarjetas: distingue entre permitir, requerir confirmación humana y bloquear según la puntuación de sospecha.
- Robustez ante inyección de instrucciones en el estado: el prompt de sistema indica explícitamente tratar el texto dentro de `state` como datos, no como instrucciones.
- Formato de salida restringido: solo la letra, sin explicación, lo que facilita el parseo en pipelines.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (no documentado).
- Capacidad multilingüe limitada al coreano.

## Casos de uso

- Automatización de decisiones operativas en simulación: integrar el modelo como política de un entorno Gymnasium para evaluar políticas alternativas antes de desplegarlas en un sistema real, aprovechando que devuelve una distribución de probabilidad parseable.
- Triaje de fraude en pagos con tarjeta: usar la letra devuelta para decidir entre permitir, escalar a revisión humana o bloquear; el autor reporta 150 de 177 fraudes detectados en su backtest, con la advertencia de que la métrica depende de cómo se trate la revisión humana.
- Enrutado de tickets de atención al cliente: el modelo fue anclado con 400 problemas de atención al cliente y 400 de reembolsos, por lo que puede clasificar la acción adecuada ante una consulta entrante en un flujo de soporte.
- Ajuste de políticas de negocio en el simulador: dado que prioriza satisfacción del cliente (peso 1,5) y evitación de riesgo (peso 2,0) sobre beneficio (peso 1,0), sirve para explorar el efecto de distintas ponderaciones en la toma de decisiones.
- Generación de datos de decisión etiquetados: usar el modelo como anotador débil de decisiones para preentrenar o calibrar modelos mayores en dominios empresariales.
- Investigación educativa en RL: reproducir el pipeline SFT → GRPO → corrección de seguridad en un portátil Apple con MLX, usando el cuaderno de Colab y el simulador como material docente.
- Pruebas de robustez frente a prompt injection: verificar que el modelo ignora instrucciones embebidas en el campo `state`, dado que el prompt de sistema lo especifica.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual en simulador | Fraude detectado (tarjetas) |
|---|---|---|---|---|
| Qwen sin entrenar | 35,4% | 3,04 | -16,86 millones de wones | 37% (91/177) |
| Yggdrasil v1 | 82,3% | 2,00 | 9,82 millones de wones | 78% (150/177) |

Evaluación extendida sobre 12 meses no vistos (seeds 7000-7011, mismo simulador, `eval12.json`):

| Operador | Beneficio mensual | Satisfacción del cliente | Accidentes mensuales |
|---|---|---|---|
| Profesor v4 (PPO, política imitada) | 11,19 millones de wones | 0,953 | 1,83 |
| Yggdrasil v1 | 5,39 millones de wones | 0,962 | 2,75 |
| "Jefe de reglas" (baseline) | 2,35 millones de wones | 0,783 | 8,00 |

Yggdrasil v1 supera al baseline de reglas en beneficio en 10 de 12 meses y no supera al profesor en ningún mes. El autor advierte que la muestra de dos meses es pequeña y que las cifras de fraude en tarjetas no son comparables con las de otros modelos medidas con el criterio anterior.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,8 mil millones de parámetros más un adaptador LoRA, la inferencia en precisión completa requiere del orden de 1,6-3,2 GB; en cuantización de 4 bits, por debajo de 1 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no hay recomendaciones oficiales; el formato publicado es MLX, orientado a Apple Silicon (M1/M2/M3/M4). Para CUDA sería necesario convertir el adaptador.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, etc.), aunque el adaptador no se distribuye en formato GGUF.
- Opciones de despliegue: `mlx_lm` en macOS es la vía documentada (`load` con `adapter_path`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yggdrasil-v1 | 0,8 B + LoRA | No disponible | Decisiones empresariales por RL sobre simulador | Apache 2.0 | HuggingFace, formato MLX |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | LLM generalista | Apache 2.0 (según modelo base) | HuggingFace |
| Política PPO "profesor v4" | No disponible | No aplica | RL clásico en el simulador CONNECT TYCOON | No disponible | No distribuida públicamente |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Colapso en inventario: el modelo elige casi siempre "pedir mucho" independientemente del estado; el autor atribuye a esto la mayor parte de la diferencia de beneficio con el profesor (si se delega solo la decisión de inventario al profesor, el beneficio medio sube de 681 a 1.256 millones en cuatro meses). Dos intentos de corrección con recompensa de imitación solo desplazaron el sesgo a otra constante.
- Métricas de fraude no comparables: el backtest de tarjetas rellena las señales de dispositivo y país con la probabilidad media; si se leen como verdadero/falso, todas las transacciones parecen "dispositivo nuevo · extranjero". Las cifras publicadas usan el criterio corregido (probabilidad < 0,5 = sin señal).
- Métrica engañosa en revisión humana: si la revisión humana se cuenta como acierto sin límite de plazas, una política que envía todo a revisión obtiene 177/177; el autor recomienda no seleccionar el modelo solo por la puntuación de tarjetas.
- Muestra pequeña: la evaluación de dos meses tiene poca potencia estadística; la de 12 meses es más fiable pero sigue siendo sintética.
- Ámbito restringido: entrenado solo sobre la distribución `general` del simulador CONNECT TYCOON; no se garantiza transferencia a empresas reales ni a otros dominios.
- Idioma: solo coreano; el prompt de sistema está en inglés, pero el contenido de los problemas es coreano.
- Uso previsto: modelo de investigación y educación sobre un simulador sintético; el autor recomienda revalidar con los registros reales de cada empresa antes de cualquier uso en producción.
- Riesgo de alucinación: no evaluado; el formato de salida restringido (una letra) reduce el riesgo de texto inventado, pero no garantiza que la opción elegida sea correcta.
- Sin datos publicados sobre sesgos demográficos, de contexto largo ni de robustez fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dain-studio/connectailab-rl-yggdrasil-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1): https://www.ezerai.xyz
