# lookarooka/connectailab-rl-novice-v4-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lookarooka bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe en texto el estado del robot (distancia al objetivo, orientación, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la opción de locomoción elegida para los siguientes 0,5 segundos. El escenario concreto es la tarea `avoid_obstacles` (esquivar obstáculos).

El pipeline de entrenamiento combina tres fases: primero se entrena una política PPO en un simulador web (el "profesor" o brain.json); después se destila esa política en el modelo de lenguaje mediante aprendizaje supervisado (LoRA) sobre 1163 pares estado-respuesta; y finalmente se aplica un ajuste con refuerzo (PPO con penalización KL) para reordenar las preferencias entre opciones. El modelo resultante se evalúa sentándolo en el puesto de decisión del robot y midiendo la tasa de éxito en 20 episodios con semillas fijas.

La relevancia es acotada pero interesante: es un ejemplo reproducible de destilación de políticas de RL en un LLM pequeño (0,8B parámetros) para toma de decisiones discretas, con código de entrenamiento abierto y un cuaderno de Colab. Los resultados, no obstante, son modestos: el adaptador final no supera al profesor PPO ni a la versión supervisada en la métrica de éxito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador en sí es un LoRA entrenado con la librería PEFT, por lo que no modifica los pesos del modelo base: se carga por encima y añade matrices de bajo rango. La tarea es de clasificación generativa restringida: dado un enunciado con el estado del robot y una lista de opciones, el modelo debe emitir exactamente una letra.

El entrenamiento sigue cuatro etapas descritas en la model card. (1) Se entrena una política PPO en el simulador web para la tarea `avoid_obstacles`, con contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y curso `random`, alcanzando un 90% en el examen oficial. (2) Se genera un conjunto de problemas convirtiendo cada 0,5 s las observaciones del profesor en texto, con la respuesta del profesor como etiqueta; se incluye un 20% de ejemplos donde el profesor se desvía. Los conjuntos resultantes son 1163 de entrenamiento, 228 de validación y 295 de test. (3) Se hace aprendizaje supervisado con LoRA para imitar al profesor. (4) Se aplica refuerzo con PPO y anclaje KL, usando como recompensa el retorno que obtendría el profesor si continuara desde la opción elegida. El techo teórico de acierto (fidelidad al profesor al pasar la observación a texto) es del 99%.

## Capacidades

- Toma de decisiones discreta en un espacio de acciones finito (selección de una letra entre las opciones listadas).
- Interpretación de estados textuales estructurados que describen sensores, objetivo y acción previa.
- Generación restringida: el modelo está entrenado para devolver solo la letra de la opción, sin explicación.
- Robustez parcial ante instrucciones embebidas en el estado (el system prompt indica tratar el contenido de `state` como datos, no como instrucciones).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; el bucle de decisión lo orquesta el código externo (`connect_tycoon.link01`).
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma; el system prompt está en inglés.
- Capacidades especiales: ninguna más allá de la tarea de decisión; no hay visión, audio ni modo "thinking" documentado.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: sirve como caso de estudio reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante SFT + PPO con KL, con código y cuaderno de Colab disponibles.
- Docencia de refuerzo y robótica simulada: el flujo completo (entrenar profesor, generar dataset, destilar, evaluar) es un ejercicio didáctico cerrado y de bajo coste computacional gracias al tamaño de 0,8B.
- Evaluación de robustez ante prompt injection en entornos de decisión: el system prompt pide tratar el estado como datos; el adaptador permite medir si el modelo respeta esa separación en una tarea acotada.
- Prototipado de controladores basados en lenguaje para agentes simulados: útil para comparar la política neuronal frente a una política expresada en texto antes de invertir en un controlador real.
- Benchmark interno de fidelidad profesor-alumno: el conjunto de test de 295 problemas y las 20 semillas de evaluación (91001–91020) permiten reproducir la comparación entre SFT y RL.
- Generación de datos sintéticos de decisión: el pipeline de conversión observación→texto puede reutilizarse para crear datasets de decisión en otras tareas del mismo simulador.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `avoid_obstacles`, curso `random`):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 90% | 35% | 23,4 s |
| Antes de entrenar | 41,0% | 0% | 10% | — |
| SFT (LoRA supervisado) | 42,0% | 15% | 90% | 31,7 s |
| RL (PPO + KL) | 36,9% | 0% | 10% | — |

Nota: la evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web. El modelo publicado corresponde a la variante RL, que en estas métricas rinde peor que la variante SFT.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,8B de parámetros en el base, la inferencia en fp16 ronda los 2 GB y en 8 bits por debajo de 1 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar el modelo base en fp16.
- Cabe en GPU consumer: sí, por el tamaño del modelo base (0,8B), aunque no hay confirmación oficial del autor.
- Opciones de despliegue: transformers + PEFT (único método documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están mencionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este) | 0,8B + LoRA | No disponible | Decisión discreta en robot simulado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO "profesor" (brain.json) | No disponible | No aplica | Decisión discreta en robot simulado | No disponible | Repositorio connect-tycoon |

No se dispone de información sobre otros adaptadores comparables de la misma familia ni de resultados cruzados con modelos de decisión de otros autores.

## Limitaciones y advertencias

- El adaptador RL publicado rinde peor que la variante SFT en todas las métricas de la model card (36,9% vs 42,0% de acierto; 0% vs 15% de éxito en 20 episodios).
- El éxito del profesor es del 90%, no del 100%: la política de referencia ya falla en un 10% de episodios, y el 35% de ellos acaban en colisión.
- El techo de fidelidad al profesor es del 99%, pero el modelo está muy lejos de él; el gap indica que el LLM no reproduce bien la política neuronal.
- La evaluación de marcha es una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden no trasladarse al entorno real.
- El modelo está pensado para simulación y educación; la propia model card advierte de que debe revalidarse en el robot y el espacio reales antes de usarse.
- Idioma limitado al coreano según la etiqueta; el system prompt está en inglés y no se documenta comportamiento en castellano.
- Riesgo de alucinación: al ser un modelo generativo restringido, puede emitir letras no listadas o texto adicional si la entrada se sale del formato esperado.
- Sesgos: no documentados, pero al entrenarse solo con la tarea `avoid_obstacles` y el curso `random`, la política está sobreajustada a ese escenario.
- Licencia Apache 2.0 permite uso comercial, pero la validez legal de esa licencia sobre un adaptador derivado de un modelo base cuyos términos no se detallan en la información queda sujeta a la licencia del modelo base.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
