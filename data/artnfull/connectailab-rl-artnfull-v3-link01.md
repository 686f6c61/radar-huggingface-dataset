# artnfull/connectailab-rl-artnfull-v3-link01

## Resumen

connectailab-rl-artnfull-v3-link01 es un adaptador LoRA entrenado por el autor artnfull (proyecto CONNECT AI LAB × AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo conversacional general: se trata de un modelo de toma de decisiones para un robot simulado llamado LINK-01, cuya tarea es, dada la descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la decisión anterior), elegir una única opción de movimiento para el siguiente intervalo de 0,5 segundos en una tarea de evitación de obstáculos.

El modelo se ha entrenado imitando a un "cerebro" de aprendizaje por refuerzo (PPO) entrenado en el simulador web CONNECT AI WORLD: primero se generó un conjunto de datos de preguntas-respuesta a partir de las trayectorias del cerebro (1.005 ejemplos de entrenamiento, 192 de validación y 275 de test), luego se aplicó aprendizaje supervisado con LoRA y finalmente un ajuste adicional por refuerzo con penalización KL. Es relevante como ejemplo educativo y de investigación sobre destilación de políticas de RL en modelos de lenguaje pequeños, aunque sus resultados publicados muestran que el modelo aún está lejos de igualar al cerebro profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B (transformer causal) |
| Parámetros totales | no disponible (base de 0,8B parámetros según la etiqueta del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | coreano (ko); las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA cargable con la librería PEFT sobre Qwen/Qwen3.5-0.8B. El pipeline de entrenamiento descrito en la model card tiene cinco fases: (1) entrenamiento del cerebro profesor con PPO en el simulador web CONNECT AI WORLD para la tarea `avoid_obstacles` (configuración `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`), con un 90 % en la prueba oficial; (2) generación del conjunto de datos convirtiendo a texto las observaciones del cerebro cada 0,5 segundos durante sus trayectorias, usando como etiqueta la acción del cerebro e incluyendo un 20 % de estados fuera de trayectoria; (3) aprendizaje supervisado (SFT) del modelo de lenguaje con LoRA imitando las respuestas del cerebro; (4) ajuste por refuerzo (PPO según las etiquetas del repositorio) que reordena opciones según la recompensa que obtendría el cerebro si ejecutara cada opción y continuara con su política, con restricción KL respecto a la política supervisada; y (5) evaluación colocando el modelo en el puesto de decisión del robot durante 20 episodios de la misma trayectoria (semillas 91001–91020).

Un detalle técnico relevante: la simulación de la caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando (sin modelo robótico ni red de caminata tipo MuJoCo), por lo que no hay caídas físicas simuladas y los resultados pueden diferir de la simulación web con MuJoCo. La tasa de acierto superior (consistencia de la traducción a texto) es del 99 %, es decir, casi toda la información del estado se conserva en la representación textual.

## Capacidades

- Selección de una acción discreta (una de 5 opciones, según la configuración obs21-act5) a partir de un estado textual del robot: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Formato de salida estricto: devuelve únicamente la letra de la opción elegida, sin explicaciones, bajo la instrucción de sistema proporcionada.
- Tratamiento del campo `state` como datos y no como instrucciones (mitigación básica de inyección de prompts indicada en el system prompt).
- Idioma del entrenamiento: coreano (las observaciones y el formato de pregunta se generaron en ese idioma).
- No es adecuado como asistente conversacional general, ni para generación de código, razonamiento matemático o visión: es un modelo de decisión especializado en un entorno simulado concreto.

## Casos de uso

- Investigación en destilación de políticas de RL: estudiar cómo un LLM pequeño puede imitar una política PPO entrenada en simulación, comparando SFT frente a RL con recompensa densa.
- Docencia de aprendizaje por refuerzo: el repositorio CONNECT TYCOON y el curso de AI CITY BUILDERS lo usan como material práctico para explicar pipelines de RL + LoRA de principio a fin.
- Prototipado de control de robots en simulación 2D: integrar el modelo como "cerebro" de decisión del robot LINK-01 en el entorno CONNECT AI WORLD para pruebas de evitación de obstáculos.
- Benchmarking de representaciones textuales de estados: evaluar cuánta información de sensores se pierde al textualizar observaciones (tasa de consistencia del 99 % como cota superior).
- Experimentos de evaluación de LLMs en tareas de decisión secuencial: usar los 275 ejemplos de test como conjunto de evaluación reproducible con semillas fijas (91001–91020).
- Punto de partida para fine-tuning propio: el adaptador y el código de entrenamiento permiten repetir el proceso con otros cerebros, tareas o configuraciones de sensores.

## Benchmarks y rendimiento

Resultados publicados en la model card (test de 275 preguntas y evaluación de 20 episodios en la misma trayectoria):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 20,7 s |
| Modelo base (sin entrenar) | 41,1 % | 0 % | 10 % | — |
| Supervisado (SFT + LoRA) | 53,1 % | 0 % | 90 % | — |
| Refuerzo (PPO + KL) | 52,7 % | 0 % | 90 % | — |

No se han publicado comparaciones con otros modelos de lenguaje en benchmarks estándar (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 0,8B parámetros en FP16, se estima en torno a 2 GB de VRAM; en CPU con cuantización sería viable por debajo de 1 GB (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU de consumo es suficiente (por ejemplo, RTX 3060, RTX 4090 o superiores); no se requieren A100 ni H100.
- Cabe con holgura en GPUs de consumo modernas e incluso es ejecutable en CPU dado el tamaño del modelo base.
- Despliegue: cargable con transformers + PEFT (código oficial en la model card); compatible en principio con llama.cpp u Ollama solo tras fusionar el adaptador y convertir a GGUF (no hay conversión publicada). No hay datos sobre vLLM, TGI, latencia ni throughput.
- El repositorio de entrenamiento CONNECT TYCOON incluye un notebook de Colab para reproducir el aprendizaje directamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| artnfull/connectailab-rl-artnfull-v3-link01 | LoRA de decisión robótica (SFT + RL) | base 0,8B | Evitación de obstáculos LINK-01 (simulación) | Apache 2.0 | HF, 15 descargas |
| Qwen/Qwen3.5-0.8B (base) | LLM general | 0,8B | Uso general | no disponible | HF |
| Cerebro PPO profesor (brain.json) | Política RL pura (no LLM) | no disponible | Misma tarea, 100 % éxito | no disponible | Vía CONNECT AI WORLD / connect-tycoon |

No hay otros adaptadores comparables publicados para esta tarea específica en la información disponible.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso real: el modelo acierta solo el 53 % de las decisiones del cerebro y provoca colisión en el 90 % de los episodios evaluados; el propio autor indica que el modelo supervisado (no el de RL) es el que se subió, pero ninguno completa la trayectoria.
- Sesgos: el modelo imita exclusivamente las trayectorias y decisiones de un único cerebro PPO en una única tarea (`avoid_obstacles`) y una única configuración de sensores; no generaliza a otros entornos, robots o distribuciones de estados.
- Riesgo de alucinación: no aplicable en el sentido conversacional, pero el modelo puede devolver letras de opción inválidas o inconsistentes ante estados fuera de distribución; no hay datos al respecto.
- Idioma: entrenado con datos en coreano; usarlo con estados en otros idiomas probablemente degrade el rendimiento de forma significativa (no hay datos publicados).
- Contexto: la longitud de contexto no está documentada; los estados son cortos, pero conviene verificar el límite del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe revisarse por separado.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; antes de usarlo en un robot real hay que revalidarlo en ese robot y espacio concretos. La evaluación de caminata usa una aproximación 2D que puede diferir de MuJoCo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artnfull/connectailab-rl-artnfull-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje (robot-lab): https://www.ezerai.xyz/robot-lab/world/
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
