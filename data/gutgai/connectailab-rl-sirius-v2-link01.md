# gutgai/connectailab-rl-sirius-v2-link01

## Resumen

LINK-01 es un adaptador LoRA de decisión para robótica construido sobre el modelo base Qwen/Qwen3.5-0.8B y publicado por el autor `gutgai` bajo el paraguas del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un "cerebro de decisión" que recibe una descripción textual del estado de un robot caminante (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos. El modelo se distribuye como adaptador PEFT (LoRA) en safetensors y requiere cargar el modelo base por separado.

El entrenamiento combina aprendizaje supervisado sobre trazas generadas por una política PPO entrenada en un simulador web (el "profesor" o `brain.json`) y un posterior ajuste con refuerzo por PPO con anclaje KL, de modo que el modelo de lenguaje imita y luego mejora ligeramente las decisiones de la política original. El conjunto de datos es pequeño (512 ejemplos de entrenamiento, 93 de validación y 145 de test) y específico para la tarea `goto_target` del robot LINK-01.

Su relevancia es fundamentalmente educativa y de investigación: demuestra un pipeline completo de destilación de políticas de refuerzo en modelos de lenguaje pequeños con adaptadores LoRA, y sirve como ejemplo reproducible de cómo convertir observaciones de un simulador en problemas de elección múltiple que un LLM de 0,8B parámetros puede resolver. No está pensado para robótica real sin revalidación en el robot y el entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. El adaptador se entrena en dos fases: primero un ajuste supervisado (SFT) sobre 512 ejemplos de entrenamiento generados a partir de las trazas de una política PPO entrenada en un simulador web de locomoción (tarea `goto_target`, observación de 21 dimensiones y 5 acciones posibles, curso `b75a04eb`). Cada ejemplo es una descripción textual del estado del robot y la acción correcta es la letra elegida por la política "profesora". Un 20% de los ejemplos corresponden a situaciones en las que el profesor se desvió del camino, para que el modelo aprenda también de esos casos.

En la segunda fase se aplica refuerzo con PPO: para cada opción se estima la recompensa que se habría obtenido si el resto de la trayectoria la hubiera completado la política profesora, y se sube la probabilidad de las opciones mejores y se baja la de las peores, con una penalización KL que mantiene al modelo cerca de la distribución del SFT. El conjunto de test contiene 145 preguntas y el techo de acierto (proporción en que el texto reproduce exactamente la decisión del profesor) es del 99%. La evaluación de la locomoción se realiza con una aproximación 2D de la marcha basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del simulador web.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve una sola letra entre las cinco opciones de locomoción disponibles.
- Decisión de navegación hacia objetivo (`goto_target`) en pasos de 0,5 segundos.
- Interpretación de observaciones estructuradas: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Seguimiento de instrucciones de formato estricto: el prompt de sistema exige devolver únicamente la letra, sin explicación.
- Tratamiento del contenido del campo `state` como datos, no como instrucciones (defensa básica frente a inyección de prompt en el estado).
- Capacidad multilingüe limitada al coreano según la ficha del autor.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Docencia de refuerzo aplicado a LLM: el pipeline completo (PPO en simulador, generación de dataset, SFT con LoRA, PPO con KL) es reproducible con el notebook de Colab enlazado y sirve para explicar destilación de políticas en modelos pequeños.
- Investigación en destilación de políticas: permite estudiar cuánto de la política "profesora" se conserva al comprimirla en un modelo de lenguaje de 0,8B y qué se gana o se pierde al aplicar RL sobre el SFT.
- Simulación educativa de robótica: integrable en el entorno web CONNECT AI WORLD para que estudiantes comparen las decisiones del LLM con las de la política PPO original.
- Evaluación de robustez ante prompts: al recibir el estado como texto, se puede medir la sensibilidad del modelo a variaciones de redacción o a instrucciones inyectadas en el campo `state`.
- Prototipado de agentes de decisión de bajo coste: el tamaño de 0,8B permite ejecutarlo en CPU o en GPU de consumo para experimentos rápidos de política textual.
- Base para adaptadores específicos de tarea: el mismo esquema (observación → pregunta de elección múltiple → letra) puede replicarse para otras tareas del simulador cambiando el dataset, usando este adaptador como referencia.
- Análisis de brecha simulación-realidad en laboratorio: útil para ilustrar por qué una política validada en una aproximación 2D requiere revalidación antes de transferirse a un robot físico.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluación sobre 145 preguntas de test y 20 episodios de marcha con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesora) | 100,0% | 100% | 0% | 11,3 s |
| Modelo base sin entrenar | 40,7% | 0% | 0% | — |
| Tras SFT (LoRA) | 61,4% | 35% | 0% | 12,7 s |
| Tras RL (PPO con KL) | 60,7% | 40% | 0% | 13,0 s |

El techo de acierto textual (proporción en que el texto reproduce exactamente la decisión del profesor) se estima en un 99%. La evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6–2 GB en FP16 para el modelo base de 0,8B más el adaptador; en cuantización de 4 bits, del orden de 0,5–1 GB (estimación a partir del tamaño del modelo base, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers + peft (procedimiento documentado por el autor), llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, vLLM o TGI tras la fusión del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-sirius-v2-link01 | 0,8B + LoRA | no disponible | Adaptador de decisión para robot caminante (SFT + PPO) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | según el modelo base | HuggingFace |
| Política PPO `brain.json` (profesora) | no es un LLM | no aplica | Política de refuerzo tabular/neuronal en simulador | no disponible | Repositorio del proyecto |

No se dispone de otros adaptadores de decisión robótica comparables en la información proporcionada; la comparación más directa es con su propio modelo base y con la política PPO que actúa como profesora.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `goto_target` del robot LINK-01; no generaliza a otras tareas, robots o entornos sin reentrenamiento.
- El dataset es muy pequeño (512 ejemplos de entrenamiento) y específico, lo que limita la robustez ante estados no vistos.
- El acierto en test (60,7% tras RL) está muy por debajo del profesor (100%), y el éxito en episodios de marcha es solo del 40%: no es un sustituto fiable de la política PPO original.
- La evaluación de locomoción usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden no trasladarse al simulador ni al robot real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Idioma declarado únicamente coreano; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación: al ser un LLM, puede devolver letras fuera del conjunto de opciones o texto adicional si el prompt no se aplica con el formato exacto indicado.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un adaptador de clasificación de acciones, el riesgo de contenido dañino es bajo, pero el riesgo de decisiones erróneas en navegación es real.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del modelo base Qwen3.5-0.8B queda sujeto a la licencia de dicho modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gutgai/connectailab-rl-sirius-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo AI CITY BUILDERS: https://www.aicitybuilders.com/robot
