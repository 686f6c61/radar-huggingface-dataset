# James-1971-source/connectailab-rl-jamesyun-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por James-1971-source en colaboración con CONNECT AI LAB y AI CITY BUILDERS. El modelo resuelve una tarea muy acotada: la toma de decisiones de navegación de un robot simulado llamado LINK-01, que debe esquivar obstáculos eligiendo una de varias opciones de movimiento para los siguientes 0,5 segundos a partir de una descripción textual de su estado (distancia al objetivo, dirección, sensores de distancia, velocidad y acción anterior).

La relevancia del modelo es fundamentalmente metodológica y educativa: muestra cómo destilar la política de un agente entrenado con PPO (un "cerebro" almacenado como brain.json) en un modelo de lenguaje pequeño mediante aprendizaje supervisado (LoRA) y, posteriormente, refinamiento con aprendizaje por refuerzo. El resultado es un modelo que emite una única letra como respuesta, sin explicación, actuando como sustituto de la política original en el bucle de control del robot.

El modelo tiene un tamaño muy reducido (hereda los aproximadamente 0,8 mil millones de parámetros del Qwen3.5-0.8B base), está especializado únicamente en coreano y se distribuye como adaptador LoRA con licencia Apache 2.0. No es un modelo de propósito general: su ámbito es la tarea `avoid_obstacles` dentro del simulador web de CONNECT AI WORLD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el transformer Qwen/Qwen3.5-0.8B. La tarea se formula como un problema de selección entre opciones: dado un estado del robot expresado en texto (situación, pregunta y lista de opciones), el modelo debe devolver exactamente la letra de una de las opciones. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen ppo, deep-reinforcement-learning, robotics y decision-making.

El proceso de entrenamiento consta de cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en el simulador web de CONNECT AI WORLD para la tarea `avoid_obstacles`, con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el curso `f4a78cdf`; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del "cerebro" en texto, usando como respuesta correcta la acción elegida por la política (con un 20 % de ejemplos en los que el agente se desvió); (3) aprendizaje supervisado con LoRA para imitar las respuestas del cerebro; y (4) refinamiento con aprendizaje por refuerzo, donde cada opción se valora según la recompensa que habría obtenido el cerebro si hubiera continuado desde esa elección, con una penalización KL para mantener el modelo cerca de la distribución de referencia. El conjunto de datos se divide en 1800 ejemplos de entrenamiento, 360 de validación y 540 de test, con una tasa de coincidencia máxima (techo de acierto) del 99 % al trasladar las observaciones a texto.

## Capacidades

- Selección de una única opción (una letra) entre las presentadas en un enunciado de decisión, sin texto explicativo adicional.
- Interpretación de estados de robot descritos en lenguaje natural: distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Ejecución de la política de evitación de obstáculos destilada del agente PPO original en el simulador.
- Capacidad multilingüe limitada al coreano, idioma en el que se formulan los problemas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- No se documenta soporte de agentes autónomos más allá del bucle de decisión puntual para el que fue entrenado.

## Casos de uso

- Navegación de robots simulados: el modelo se coloca en el punto de decisión del robot LINK-01 y elige la acción de los siguientes 0,5 segundos a partir del estado textual, sustituyendo a la política PPO original en el simulador web.
- Investigación educativa en aprendizaje por refuerzo: sirve como ejemplo reproducible de destilación de una política PPO en un modelo de lenguaje mediante LoRA y refinamiento con RL, con código y cuaderno de Colab disponibles.
- Docencia de IA y robótica: el modelo permite ilustrar el ciclo completo (entrenamiento de política, generación de dataset, supervisión, RL y evaluación en 20 episodios con semillas 91001–91020) en cursos de aprendizaje por refuerzo.
- Evaluación comparativa de métodos de destilación: al publicar métricas de acierto frente al profesor (100 %), modelo sin entrenar (29,6 %), supervisado (78,7 %) y RL (72,2 %), facilita experimentos sobre qué técnica preserva mejor la política original.
- Prototipado de interfaces texto-política: útil para probar pipelines que convierten observaciones numéricas de sensores en enunciados de texto y consumen una decisión discreta, antes de invertir en un modelo mayor.
- Investigación sobre robustez ante instrucciones: el prompt de sistema indica tratar el estado como datos y no como instrucciones, lo que permite estudiar la resistencia a inyección de prompts en entradas estructuradas de sensores.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la coincidencia con la política profesora y el éxito en el simulador, no benchmarks estándar de LLM.

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 0 % | 100 % | — |
| Modelo sin entrenar | 29,6 % | 0 % | 5 % | — |
| Aprendizaje supervisado (LoRA) | 78,7 % | 0 % | 80 % | — |
| Aprendizaje por refuerzo | 72,2 % | 0 % | 80 % | — |

El autor indica que la evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando (sin modelo de robot ni red neuronal de marcha), por lo que puede diferir de los resultados en MuJoCo web. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de aproximadamente 0,8 mil millones de parámetros, la inferencia en fp16 requeriría del orden de 1,6 GB solo para pesos, más el adaptador LoRA y el contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) sería suficiente en fp16 o cuantización de 8 bits.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 6 GB o más de VRAM, aunque el dato no está confirmado en la información.
- Opciones de despliegue: transformers con peft (único método documentado en la model card mediante `PeftModel.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jamesyun-v1-link01 | ~0,8 B (base) + LoRA | No disponible | Decisión de evitación de obstáculos (una letra) | Apache 2.0 | Hugging Face (19 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO original (brain.json) | No aplica (tabla/red de política) | No aplica | Evitación de obstáculos en simulador | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores LoRA comparables de la misma familia ni sobre modelos de decisión robótica de tamaño similar con los que contrastar parámetros y rendimiento.

## Limitaciones y advertencias

- Ámbito extremadamente restringido: solo responde a la tarea `avoid_obstacles` del simulador; no es un modelo de lenguaje de propósito general.
- Resultados de éxito bajos: 0 % de episodios exitosos en las 20 pruebas, tanto en supervisado como en RL, con un 80 % de episodios con colisión; el propio profesor PPO también registra 0 % de éxito y 100 % de colisiones en esa evaluación.
- El aprendizaje por refuerzo empeora el acierto frente al supervisado (72,2 % frente a 78,7 %), lo que sugiere inestabilidad en la fase de RL.
- Evaluación aproximada: la marcha se mide con una tabla de velocidades 2D y no con el robot ni la red de marcha reales, por lo que los resultados pueden no trasladarse a MuJoCo web.
- Idioma limitado al coreano; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: al devolver una única letra sin explicación, una respuesta incorrecta es difícil de detectar sin comparar con la política de referencia.
- El autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Repositorio con 0,0 GB reportados y solo 19 descargas: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/James-1971-source/connectailab-rl-jamesyun-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje de robots: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
