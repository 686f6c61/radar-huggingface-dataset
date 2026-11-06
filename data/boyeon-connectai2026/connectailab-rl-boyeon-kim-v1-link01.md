# boyeon-connectai2026/connectailab-rl-boyeon-kim-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por boyeon-connectai2026 dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para robótica: recibe en texto el estado de un robot LINK-01 (distancia y dirección al objetivo, sensores de distancia, velocidad y última elección) y devuelve una única letra correspondiente a la siguiente acción de caminata durante los próximos 0,5 segundos. El pipeline declarado en Hugging Face es `reinforcement-learning` y la librería es `peft`.

El modelo se construye en cuatro fases: primero se entrena una política PPO en un entorno web de aprendizaje (el "cerebro" o `brain.json`) para la tarea `choose_object`; después se genera un conjunto de problemas convirtiendo cada observación del robot en texto, con la respuesta del cerebro como etiqueta (incluyendo un 20% de casos en los que el cerebro se desvió); a continuación se hace aprendizaje supervisado con LoRA sobre Qwen3.5-0.8B; y finalmente se aplica una fase de refuerzo con PPO y anclaje KL para subir la probabilidad de las opciones que obtuvieron mejor recompensa que la respuesta del cerebro.

Es relevante como ejemplo de destilación de una política de refuerzo en un modelo de lenguaje pequeño (0,8B parámetros) con adaptación LoRA, y por su enfoque de evaluación: el modelo se sienta en la posición de decisión del robot y se miden 20 episodios con semillas fijas (91001–91020). El conjunto de datos es pequeño (714 ejemplos de entrenamiento, 167 de validación y 280 de test), lo que sitúa el proyecto en el ámbito de la investigación y la educación más que en el de la producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con `peft.PeftModel.from_pretrained` sobre el modelo base. La tarea es de clasificación restringida: dado un enunciado en texto con el estado del robot, la pregunta y una lista de opciones, el modelo debe devolver exactamente una letra de opción, sin explicación, bajo un prompt de sistema fijo (`Evaluate the supplied decision task... Return only its letter, with no explanation.`).

El proceso de entrenamiento parte de una política PPO entrenada en un simulador web (tarea `choose_object`, convención `link01-decision/choose_object/obs26-act4/walker51-14/v1`, curso `random`). A partir de las trazas de esa política se construyen 714 ejemplos de entrenamiento, 167 de validación y 280 de test, en los que la observación se serializa a texto y la etiqueta es la acción elegida por el cerebro (con un 20% de ejemplos donde el cerebro se desvió). Sobre ese conjunto se aplica aprendizaje supervisado con LoRA y, después, una fase de refuerzo con PPO en la que cada opción recibe la recompensa que habría obtenido si el cerebro hubiera continuado desde ahí, con una penalización KL para mantener el modelo cerca de la política supervisada. La evaluación de caminata se realiza con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo real, por lo que no hay caídas registradas por construcción.

## Capacidades

- Decisión de acción discreta para el robot LINK-01: elige una de las opciones de acción presentadas en el enunciado (tarea `choose_object`).
- Lectura de estado serializado en texto: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Salida restringida a una única letra de opción, sin texto adicional.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido de `state` como datos y no como instrucciones.
- Entrenamiento con refuerzo (PPO) además de supervisión, para alinear la elección con la recompensa del entorno.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma del repositorio.

## Casos de uso

- Sustitución del cerebro PPO por un modelo de lenguaje en la posición de decisión del robot LINK-01: el modelo recibe el estado serializado y devuelve la letra de acción, lo que permite comparar políticas neuronales y políticas basadas en lenguaje sobre el mismo entorno.
- Investigación en destilación de políticas de refuerzo: sirve como caso de estudio de cómo una política PPO pequeña se transfiere a un LLM de 0,8B mediante LoRA y una fase posterior de PPO con anclaje KL.
- Docencia y formación en RL: el repositorio incluye un cuaderno de Colab para reproducir el entrenamiento, por lo que el modelo puede usarse como material didáctico en cursos de aprendizaje por refuerzo aplicado a robótica.
- Evaluación de robustez ante inyección de instrucciones: al tratar el estado como datos, permite experimentar con ataques de prompt injection embebidos en observaciones de sensores y medir la tasa de desviación.
- Prototipado rápido de controladores de bajo coste: al caber en hardware modesto por su tamaño de 0,8B, permite iterar en local sobre políticas de decisión antes de portarlas a un simulador físico.
- Generación de datos sintéticos de decisión: el modelo puede usarse para etiquetar observaciones adicionales y ampliar el conjunto de entrenamiento de otras políticas, siempre que se valide contra el cerebro original.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la tarea `choose_object` y a la aproximación 2D de caminata descrita por el autor:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0% | 10% | 0% | 9,2 s |
| Antes del entrenamiento | 17,9% | 60% | 0% | 8,7 s |
| Aprendizaje supervisado (LoRA) | 87,5% | 10% | 0% | 7,5 s |
| Refuerzo (PPO + KL) | 85,0% | 25% | 0% | 9,0 s |

El autor indica que la métrica de caminata se calcula con una tabla de velocidades por comando en 2D, no con MuJoCo, y que los resultados pueden diferir ligeramente del simulador web. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 0,8B en fp16 ocupa aproximadamente 1,6 GB de pesos; en 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB, más el overhead del adaptador LoRA y del contexto. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutar el modelo base en cuantización de 8 o 4 bits; para fp16 se recomienda al menos 4 GB. Para servir varias peticiones concurrentes se recomienda una GPU de datacenter (A100, H100) o una RTX 4090.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes, dado el tamaño del modelo base.
- Opciones de despliegue: el autor documenta el uso con `transformers` y `peft`; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un adaptador LoRA sobre un modelo base, sería necesario fusionar o cargar el adaptador en el servidor de inferencia correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-boyeon-kim-v1-link01 | 0,8B base + LoRA | No disponible | Decisión robótica por lenguaje (destilación de PPO) | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | LLM generalista | No disponible en la información | Hugging Face |
| Política PPO "cerebro" (brain.json) | No disponible | No aplica | Política de refuerzo nativa del simulador | No disponible | Incluida en el flujo del proyecto CONNECT TYCOON |

No se dispone de información sobre otros adaptadores de decisión robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `choose_object` del robot LINK-01; no es un LLM de propósito general y no debe usarse como tal.
- El conjunto de entrenamiento es muy reducido (714 ejemplos), lo que limita la generalización a observaciones fuera de la distribución del curso `random`.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo; los porcentajes de éxito no equivalen a un rendimiento físico real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- El acierto frente al cerebro baja del 87,5% (supervisado) al 85,0% (refuerzo), y el éxito en episodios es del 25% frente al 10% del cerebro; el modelo no supera al profesor en la métrica principal de imitación.
- El idioma declarado es únicamente coreano, lo que puede afectar a la robustez si el estado se serializa en otro idioma.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo podría devolver una opción no listada o texto adicional; el prompt de sistema lo mitiga pero no lo garantiza.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño declarado es de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar completamente subidos o que el artefacto es muy pequeño.

## Enlaces

- Hugging Face: https://huggingface.co/boyeon-connectai2026/connectailab-rl-boyeon-kim-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
