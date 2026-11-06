# happyappletree/connectailab-rl-appletree-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario happyappletree en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión especializado: recibe en texto el estado de un robot simulado (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar durante los siguientes 0,5 segundos. El objetivo declarado es la evitación de obstáculos en el robot LINK-01.

El modelo se entrena en dos fases: primero un ajuste supervisado (LoRA) sobre pares observación-respuesta generados por una política PPO entrenada en un entorno web de aprendizaje por refuerzo, y después una fase de optimización por refuerzo con restricción KL para corregir decisiones subóptimas. El pipeline declarado en Hugging Face es `reinforcement-learning`, y los tags incluyen PPO, robótica, toma de decisiones y deep reinforcement learning.

Su relevancia es acotada y experimental: se trata de un modelo de 0,8 mil millones de parámetros (adaptador) para investigación y educación en robótica simulada, con un rendimiento modesto (55 % de éxito en 20 episodios de evaluación) y una única tarea. No está pensado para uso en producción ni para robótica real sin una validación adicional en el robot y el entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA sobre un modelo base de 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La tarea se formula como clasificación de una letra entre un conjunto de opciones discretas (una por acción de caminata), con una instrucción de sistema que obliga a devolver solo la letra. El adaptador se carga mediante `peft` sobre el modelo base.

El entrenamiento sigue cuatro etapas descritas en la model card: (1) entrenamiento de una política PPO en un entorno web de simulación para la tarea `avoid_obstacles`, con una tasa de éxito del 90 % en el examen oficial; (2) generación de un dataset de problemas a partir de las observaciones del robot cada 0,5 segundos, con las respuestas de la política como etiquetas y un 20 % de ejemplos con desviaciones; (3) ajuste supervisado LoRA sobre ese dataset (1024 ejemplos de entrenamiento, 203 de validación, 314 de test); y (4) optimización por refuerzo con recompensas basadas en el retorno de la política docente y una penalización KL para mantener la política cercana a la de referencia. El techo teórico de acierto (acuerdo con la política docente) es del 99 %.

## Capacidades

- Toma de decisiones discretas en robótica simulada: selecciona una acción de caminata a partir de una descripción textual del estado del robot.
- Clasificación con formato restringido: devuelve una única letra entre las opciones proporcionadas, sin explicación.
- Razonamiento sobre estado estructurado: interpreta distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Robustez parcial ante instrucciones embebidas en el estado: la instrucción de sistema indica tratar el texto del estado como datos y no como instrucciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la tarea es de un solo paso).
- Capacidades multilingües: limitadas al coreano según los metadatos; el prompt de sistema está en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a modelos de lenguaje: sirve como ejemplo reproducible de destilación de una política PPO en un LLM mediante LoRA y RL con KL, útil para estudiar la brecha entre política docente y política destilada.
- Educación en robótica simulada: el cuaderno de Colab y el repositorio permiten reproducir el pipeline completo (entorno web, generación de dataset, SFT y RL) en un modelo pequeño.
- Evaluación de técnicas de destilación de políticas: el modelo permite medir la tasa de acuerdo con la política docente (68,8 % en test) y comparar SFT frente a RL.
- Prototipado de agentes de decisión en entornos discretos: la formulación como clasificación de letras es reutilizable para tareas de control con acciones discretas.
- Benchmark de robustez ante instrucciones adversarias: el diseño con instrucción de sistema que separa datos de instrucciones permite probar ataques de inyección de prompt en el estado del robot.
- Docencia y divulgación: el material asociado (YouTube, curso de RL, repositorio CONNECT TYCOON) está orientado a formación.
- Validación previa a despliegue en robot real: sirve como paso intermedio antes de trasladar la política a un robot físico, siempre con revalidación en el entorno concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 314 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que la política docente) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política docente (PPO) | 100,0 % | 100 % | 0 % | 21,7 s |
| Modelo base sin entrenar | 42,7 % | 0 % | 10 % | — |
| Tras ajuste supervisado (SFT) | 69,7 % | 50 % | 75 % | 26,5 s |
| Tras RL (modelo publicado) | 68,8 % | 55 % | 75 % | 28,0 s |

Nota: la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo base de 0,8 B en FP16 requiere aproximadamente 1,6 GB de pesos, más el adaptador LoRA y el overhead de activaciones; en cuantización de 4 bits cabría en GPUs de consumo con 4 GB o más.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) debería poder ejecutar el modelo base con el adaptador.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se confirma en la documentación.
- Opciones de despliegue: `transformers` + `peft` (según el ejemplo de la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La tarea requiere una decisión cada 0,5 segundos, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-appletree-v1-link01 | Adaptador sobre 0,8 B | No disponible | Decisión robótica (evitación de obstáculos) | Apache 2.0 | Hugging Face (0 descargas) |
| Política PPO docente (brain.json) | No disponible | No aplica | Misma tarea | No especificada | Incluida en el proyecto CONNECT TYCOON |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No especificada en esta ficha | Hugging Face |

No se dispone de comparaciones con otros modelos de decisión robótica destilados en LLM en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación: la propia model card advierte que es un modelo sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Rendimiento limitado: 55 % de éxito en 20 episodios y 75 % de episodios con colisión; el acuerdo con la política docente es del 68,8 %, por debajo del SFT (69,7 %).
- Evaluación aproximada: la métrica de caminata usa una tabla de velocidades 2D en lugar de MuJoCo, por lo que los resultados pueden no trasladarse al simulador completo.
- Tarea única: solo cubre `avoid_obstacles`; no es un modelo generalista ni soporta múltiples tareas.
- Idioma: metadatos limitados a coreano; el prompt de sistema está en inglés y el modelo base es multilingüe, pero no se documenta el comportamiento en castellano.
- Riesgo de alucinación: puede devolver una letra no incluida entre las opciones o una acción inconsistente con el estado; el formato de salida restringido mitiga parcialmente este riesgo.
- Sesgos: no documentados; el dataset procede de una única política y un único recorrido (`82d74f93`), lo que puede limitar la generalización a otros mapas.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado.
- Sin métricas de latencia ni de despliegue en producción; no se documentan integraciones con servidores de inferencia habituales.

## Enlaces

- Hugging Face: https://huggingface.co/happyappletree/connectailab-rl-appletree-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
