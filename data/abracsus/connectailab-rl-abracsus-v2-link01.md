# abracsus/connectailab-rl-abracsus-v2-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario abracsus en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para un robot simulado llamado LINK-01: recibe como texto el estado actual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y elección previa) y devuelve una única letra correspondiente a la acción de caminar durante los siguientes 0,5 segundos. El modelo está entrenado para la tarea `choose_object` (elegir objeto) dentro del mundo de simulación web CONNECT AI WORLD.

La relevancia técnica del modelo es metodológica: el autor entrena primero un "cerebro" de política mediante PPO en un simulador web (generando un `brain.json`), lo usa como profesor para destilar sus decisiones en un modelo de lenguaje mediante LoRA (aprendizaje supervisado) y después aplica un ajuste por refuerzo con restricción KL para corregir las respuestas hacia acciones con mayor recompensa. El resultado es un modelo de 0,8B de parámetros (base) con un adaptador de bajo rango que reproduce el 100% de las decisiones del profesor sobre el conjunto de test.

El modelo tiene un alcance muy acotado: idioma coreano en la documentación, tarea única de decisión discreta entre opciones, y validación exclusivamente en simulación 2D aproximada (no en el robot real ni con el MuJoCo web). Su licencia Apache 2.0 y su tamaño reducido lo hacen fácil de ejecutar, pero su utilidad fuera del entorno LINK-01 es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA no especifica su número de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Coreano (ko) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parámetros. El adaptador se entrena en cuatro fases descritas por el autor: (1) entrenamiento de un cerebro de política con PPO en el simulador web CONNECT AI WORLD para la tarea `choose_object`, con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1` y el curso `eedb99c4`; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del cerebro en texto, con la respuesta del cerebro como etiqueta y un 20% de ejemplos con desviaciones deliberadas; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas mediante LoRA; y (4) ajuste por refuerzo con PPO y restricción KL, usando como recompensa el retorno que habría obtenido el cerebro si hubiera continuado desde la acción elegida.

El conjunto de datos resultante tiene 427 ejemplos de entrenamiento, 76 de validación y 139 de test. La tasa de acierto máxima alcanzable (el profesor consigo mismo) es del 100%. No se especifican el número de tokens de entrenamiento, la composición del corpus lingüístico ni detalles del proceso de RLHF/DPO más allá del esquema PPO con KL. El autor advierte que la evaluación de caminata se realiza con una aproximación 2D basada en una tabla de velocidades por comando, sin el modelo del robot ni la red neuronal de marcha, por lo que no hay caídas y los resultados pueden diferir de los del MuJoCo web.

## Capacidades

- Decisión discreta de acción: dado un estado textual del robot, selecciona exactamente una letra entre las opciones presentadas, sin explicación.
- Seguimiento de instrucciones de formato estricto: respeta el system prompt que exige devolver solo la letra de la opción elegida.
- Tratamiento de datos como datos: el system prompt indica explícitamente que el texto dentro de `state` debe tratarse como datos y no como instrucciones.
- Razonamiento de un solo paso: no soporta cadenas de razonamiento multi-paso ni planificación de horizonte largo.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: limitadas al coreano según la model card; no se documentan otras lenguas.
- Capacidades especiales: modo thinking, visión o audio no disponibles.
- Integración con `connect_tycoon.link01.questions.task_of` para convertir observaciones del robot en el formato de pregunta esperado.

## Casos de uso

- Evaluación de destilación de políticas en modelos pequeños: el modelo sirve como caso de estudio reproducible de cómo destilar un cerebro PPO en un LLM de 0,8B mediante LoRA y ajuste por refuerzo con KL, útil en docencia e investigación sobre RL aplicado a modelos de lenguaje.
- Sustitución del módulo de decisión en el simulador LINK-01: se puede colocar el adaptador en el puesto de decisión del robot dentro del entorno CONNECT AI WORLD para comparar su comportamiento con el del cerebro original sobre el mismo curso `eedb99c4`.
- Generación automática de conjuntos de datos de decisión: el pipeline descrito (observación → texto → etiqueta del cerebro) puede reutilizarse para crear datasets de decisión en otros simuladores, usando este modelo como referencia de formato.
- Pruebas de robustez ante instrucciones inyectadas en el estado: al tratar el estado como datos y no como instrucciones, es un banco de pruebas para medir la resistencia a prompt injection en tareas de decisión.
- Prototipado de agentes de bajo coste en robótica simulada: con 0,8B de parámetros y licencia Apache 2.0, permite iterar rápidamente en local sobre políticas de decisión discretas antes de trasladarlas a entornos más costosos.
- Educación en RL y PEFT: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento completo, desde el PPO en el navegador hasta el adaptador LoRA.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tarea `choose_object`, curso `eedb99c4`, 20 episodios con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor) | 100,0% | 100% | 0% | 8,2 s |
| Antes del entrenamiento | 79,9% | 100% | 0% | 8,2 s |
| Aprendizaje supervisado | 100,0% | 100% | 0% | 8,2 s |
| Ajuste por refuerzo | 100,0% | 100% | 0% | 8,2 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son específicas de la tarea de decisión del simulador y no son comparables con benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de 0,8B, en FP16 ocuparía aproximadamente 1,6 GB de pesos, y en cuantización de 4 bits alrededor de 0,4–0,5 GB, más el adaptador LoRA (de tamaño no especificado).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar el modelo base en cuantización baja.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del modelo base; no confirmado por el autor.
- Opciones de despliegue: transformers + peft (método documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-abracsus-v2-link01 | 0,8B (base) + LoRA | No disponible | Decisión discreta en simulador LINK-01 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Políticas PPO directas (p. ej. brain.json del proyecto) | No aplica (red de política) | No aplica | Decisión en simulador | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores LoRA comparables de la misma familia ni de benchmarks cruzados con modelos de decisión similares.

## Limitaciones y advertencias

- Ámbito extremadamente restringido: el modelo solo responde a la tarea `choose_object` del simulador LINK-01; fuera de ese contexto su comportamiento no está validado.
- Validación exclusivamente en simulación 2D aproximada: el autor advierte que la evaluación de marcha usa una tabla de velocidades y no el robot real ni el MuJoCo web, por lo que los resultados pueden diferir.
- No apto para robots reales sin revalidación: la model card indica explícitamente que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio concretos antes de usarlo.
- Riesgo de alucinación en el formato: aunque el modelo devuelve una letra, no se documenta qué ocurre si el estado de entrada está fuera de distribución o si las opciones no coinciden con las del entrenamiento.
- Sesgos: no documentados; el entrenamiento se limita a un único curso (`eedb99c4`) y a 427 ejemplos, lo que puede producir sobreajuste a esa trayectoria.
- Idiomas: la model card declara solo coreano; el system prompt está en inglés, lo que puede introducir inconsistencia lingüística no evaluada.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad comercial del adaptador es prácticamente nula dado su alcance.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso externo ni de validación independiente.
- El modelo base Qwen/Qwen3.5-0.8B debe obtenerse por separado y su licencia y disponibilidad no se detallan en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abracsus/connectailab-rl-abracsus-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
