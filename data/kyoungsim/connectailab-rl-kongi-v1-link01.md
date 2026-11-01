# kyoungsim/connectailab-rl-kongi-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor kyoungsim en el marco de los proyectos CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe en texto el estado actual del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos. El dominio de la tarea es la evitación de obstáculos (`avoid_obstacles`).

El modelo se construye en dos fases. Primero, un agente PPO entrenado en un entorno web (aproximación 2D a MuJoCo) genera un "profesor" que produce observaciones y acciones correctas. Después, el modelo de lenguaje se ajusta por supervisión (LoRA) para imitar esas decisiones y, posteriormente, se refina con refuerzo usando la recompensa que habría obtenido el profesor al ejecutar cada opción, con una penalización KL que ancla el modelo a la política supervisada.

Su relevancia es acotada pero concreta: demuestra cómo destilar un agente de refuerzo en un modelo de lenguaje pequeño (0,8B parámetros) para que razone decisiones de robótica en formato textual, lo que facilita inspección, trazabilidad y sustitución de la política neuronal original por una interfaz de lenguaje. El repositorio es de tamaño 0,0 GB (solo pesos del adaptador), está etiquetado en coreano y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parámetros totales | No disponible (el adaptador reporta 0,0 GB en el repo; el modelo base tiene 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (`ko`); el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado con la librería PEFT. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`.

El proceso de entrenamiento consta de cinco etapas descritas en la model card: (1) entrenamiento del "cerebro" PPO en el entorno web `avoid_obstacles` con la configuración `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` sobre el curso `random`, alcanzando un 90% en el examen oficial; (2) generación de un dataset de preguntas y respuestas cada 0,5 segundos a partir de las observaciones del cerebro, incluyendo un 20% de ejemplos con desviaciones; (3) ajuste supervisado LoRA para imitar las respuestas del cerebro; (4) refinamiento por refuerzo donde se suben las opciones con mayor recompensa esperada y se bajan las peores, con anclaje KL a la política supervisada; y (5) evaluación colocando el modelo en el puesto de decisión del robot durante 20 episodios con semillas 91001–91020. El dataset contiene 1095 ejemplos de entrenamiento, 207 de validación y 281 de test. La tasa de coincidencia entre la representación textual y la respuesta del cerebro es del 100% (techo de acierto).

## Capacidades

- Toma de decisiones discretas de locomoción: recibe un estado textual del robot y devuelve una única letra de entre las opciones listadas.
- Evitación de obstáculos en un entorno simulado 2D (`avoid_obstacles`).
- Razonamiento sobre observaciones estructuradas (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa).
- Formato de salida estricto: una sola letra, sin explicación, según el prompt de sistema.
- Robustez ante instrucciones embebidas en el estado: el prompt indica tratar el texto dentro de `state` como datos, no como instrucciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo general.

## Casos de uso

- **Sustitución de la política PPO por una interfaz de lenguaje en el simulador LINK-01**: el modelo ocupa el puesto de decisión del robot y devuelve la acción de los próximos 0,5 segundos; útil para depurar y auditar decisiones en texto plano.
- **Investigación en destilación de agentes RL a modelos de lenguaje**: sirve como caso de estudio reproducible de cómo un agente PPO pequeño se convierte en un adaptador LoRA sobre un LLM de 0,8B, con métricas de éxito y colisiones publicadas.
- **Enseñanza de refuerzo y robótica**: el repositorio incluye un notebook de Colab y un curso de pago; el modelo puede usarse en aulas para mostrar el ciclo PPO → supervisión → RL.
- **Generación de datos sintéticos de decisión**: el adaptador puede producir etiquetas de acción para estados simulados y alimentar pipelines de entrenamiento posteriores.
- **Pruebas de robustez ante prompt injection en entornos de agente**: el prompt de sistema instruye a tratar el estado como datos; útil para evaluar si el modelo respeta esa separación.
- **Prototipado rápido de controladores basados en lenguaje**: al ser un adaptador de 0,0 GB sobre un modelo de 0,8B, se puede desplegar en hardware modesto para experimentar con control por texto en simuladores.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 20 episodios del mismo curso, semillas 91001–91020, con aproximación 2D de la marcha):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 95% | 10% | 21,3 s |
| Antes del entrenamiento | 42,3% | 0% | 10% | — |
| Aprendizaje supervisado | 69,0% | 75% | 45% | 24,6 s |
| Aprendizaje por refuerzo | 71,9% | 90% | 35% | 26,1 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la huella es la del modelo base más el adaptador.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo base (0,8B) sugiere que podría caber en GPU de consumo, pero no se aportan datos.
- Opciones de despliegue: la model card muestra únicamente el uso con `transformers` + `peft` (`AutoModelForCausalLM`, `PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para decisión robótica sobre LLM pequeño).

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo resuelve la tarea `avoid_obstacles` del robot LINK-01; no es un modelo de propósito general.
- Entrenado y evaluado en simulación 2D (aproximación a MuJoCo con tabla de velocidades); los resultados pueden diferir del simulador MuJoCo real y no se han validado en un robot físico.
- La model card advierte explícitamente que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio concretos antes de usarse en producción.
- El idioma declarado es coreano; el prompt de sistema está en inglés, lo que puede introducir inconsistencias si se usa fuera de ese formato.
- Tasa de éxito del 90% en 20 episodios y 35% de episodios con colisión en la variante RL: no es adecuado para aplicaciones de seguridad crítica sin supervisión.
- No se documentan sesgos, riesgos de alucinación ni restricciones adicionales de licencia más allá de Apache 2.0.
- El repositorio tiene 14 descargas y 0 likes; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/kyoungsim/connectailab-rl-kongi-v1-link01
- GitHub (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
