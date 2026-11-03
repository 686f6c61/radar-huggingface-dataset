# lucyhome/connectailab-rl-lucy-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por lucyhome en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y elección previa) y devuelve una única letra que corresponde a una acción de locomoción para los siguientes 0,5 segundos.

El modelo se entrena en dos fases: primero una destilación supervisada (LoRA) desde el cerebro original entrenado con PPO en un entorno web de aprendizaje por refuerzo, y después un ajuste con RL (con anclaje KL) que reordena las preferencias entre opciones según la recompensa obtenida al dejar que el cerebro original complete la trayectoria. El resultado es un adaptador de muy bajo coste computacional que traduce observaciones numéricas a decisiones discretas mediante generación de texto.

Es relevante como ejemplo de integración de modelos de lenguaje pequeños en bucles de control y robótica simulada, y como caso práctico de destilación de políticas RL a un LM. Los resultados publicados son modestos: la tasa de acierto frente al cerebro original en el conjunto de test es del 68,1% y el éxito en la tarea de caminar es del 0% en las 20 partidas de evaluación, por debajo del cerebro profesor (100%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. La tarea se formula como clasificación generativa: el prompt incluye el estado del robot en formato textual (situación, pregunta y opciones) y el modelo debe devolver únicamente la letra de la opción elegida, sin explicación. El system prompt lo instruye explícitamente a tratar el contenido del estado como datos y no como instrucciones.

El entrenamiento consta de dos etapas. La primera es una fase de imitación supervisada (LoRA) sobre un conjunto de 409 ejemplos de entrenamiento, 88 de validación y 119 de test, generados a partir de las observaciones que el cerebro PPO registró al recorrer un curso (identificador `c99aa7a8`) en el simulador web; el 20% de los ejemplos incluye trayectorias desviadas. La segunda es una fase de RL que ajusta las preferencias entre opciones usando la recompensa que habría obtenido el cerebro original al completar la trayectoria desde cada opción, con una penalización KL para mantener el modelo cerca de la política supervisada. El cerebro profesor se entrenó con PPO en el entorno `goto_target` (observación de 10 dimensiones, 5 acciones, curso `random`, 90% de éxito en el examen oficial). La tasa de coincidencia entre el texto y la respuesta del cerebro (techo de acierto) es del 99%.

## Capacidades

- Selección de acciones discretas de locomoción a partir de una descripción textual del estado del robot.
- Salida restringida a una letra de entre las opciones proporcionadas, sin texto adicional.
- Formato de prompt específico con instrucciones de sistema para evitar inyección de instrucciones desde el estado.
- Integración con la librería `connect_tycoon.link01` para convertir observaciones del robot en preguntas en el formato esperado.
- Entrenamiento y evaluación reproducibles mediante notebook de Colab y código en GitHub.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni multilingüismo más allá del coreano.

## Casos de uso

- Control de robot simulado en entornos de investigación: el adaptador se coloca en el punto de decisión del robot LINK-01 y genera la acción de caminata cada 0,5 segundos a partir del estado textual, sustituyendo a la política PPO en pruebas de destilación.
- Docencia de refuerzo y destilación: sirve como ejemplo didáctico de cómo convertir una política RL en un modelo de lenguaje pequeño mediante imitación y ajuste con preferencias, con notebook reproducible en Colab.
- Evaluación de robustez de LMs pequeños en tareas de decisión: permite medir la degradación entre la política original y su versión textualizada (68,1% de coincidencia en test frente al 100% del profesor).
- Prototipado de pipelines de decisión basados en texto: útil para validar la formulación "observación → prompt → letra" antes de sustituir el LM por un clasificador dedicado.
- Investigación sobre anclaje KL en RL desde retroalimentación: el par supervisado/RL permite estudiar el efecto del ajuste por recompensa cuando la recompensa proviene de un profesor simulado.
- Integración en simuladores web o entornos MuJoCo de bajo coste: al ser un adaptador sobre un modelo de 0,8B, puede ejecutarse en hardware modesto para pruebas de bucle cerrado en simulación.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `goto_target`, curso `c99aa7a8`, semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 9,9 s |
| Modelo sin entrenar | 63,9% | 0% | 0% | — |
| Tras aprendizaje supervisado | 68,1% | 0% | 0% | — |
| Tras RL | 68,1% | 0% | 0% | — |

La evaluación de la caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo físico del robot ni con la red de locomoción, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador LoRA sobre un modelo de 0,8B, la inferencia en fp16 requiere del orden de 2 GB de VRAM, y en cuantizaciones de 4 bits puede caber en GPUs de consumo con 4-6 GB.
- GPU recomendadas: no disponibles; por tamaño del modelo base, una RTX 3060/4060 o superior es suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM en cuantización de 4 bits.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucy-target-v1-link01 | Adaptador LoRA sobre 0,8B | no disponible | Decisión de locomoción (5 acciones) | Apache 2.0 | HuggingFace |
| Cerebro PPO original (referencia del autor) | no aplica (política RL) | no aplica | Decisión de locomoción (5 acciones) | no disponible | Entorno web / código del proyecto |
| connectailab-rl-jay-v1-link01 (mencionado en la model card) | Adaptador LoRA sobre 0,8B | no disponible | Decisión de locomoción | Apache 2.0 | HuggingFace |

No se dispone de comparaciones con modelos de propósito general ni con otros adaptadores de decisión de terceros en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: el modelo no completa ninguna de las 20 partidas de evaluación (0% de éxito), frente al 100% del cerebro profesor; el ajuste RL no mejora la tasa de acierto en test respecto al supervisado (68,1% en ambos).
- Evaluación aproximada: la métrica de caminata usa una tabla de velocidades 2D y no el simulador físico ni la red de locomoción, por lo que los resultados pueden no reflejar el comportamiento real en MuJoCo.
- Ámbito restringido: entrenado para una única tarea (`goto_target`), un curso concreto y un formato de prompt muy específico; no generaliza a otras tareas de control sin reentrenamiento.
- Idioma: solo coreano; el vocabulario y los ejemplos están orientados a ese idioma.
- Riesgo de alucinación: al ser un LM generativo, puede producir letras fuera del conjunto de opciones o texto adicional si el prompt no se respeta; la model card mitiga esto con instrucciones de sistema y salida restringida.
- Sesgos: no documentados; el entrenamiento se limita a trayectorias sintéticas de un simulador, sin datos humanos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor indica que es un modelo de investigación y educación en simulador y recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- Sin datos de cuantización, contexto ni latencia publicados, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucyhome/connectailab-rl-lucy-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
