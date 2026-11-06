# seyunprobiz/connectailab-rl-seyunduck-route-v1-link01

## Resumen

connectailab-rl-seyunduck-route-v1-link01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario seyunprobiz en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, orientación, sensores de distancia, velocidad y decisión anterior) y devuelve una única letra que corresponde a una de cinco acciones de locomoción para los siguientes 0,5 segundos.

El modelo se entrena en dos fases: primero un ajuste supervisado (LoRA) sobre pares estado-acción generados por una política PPO previamente entrenada en un entorno web de aprendizaje por refuerzo, y después un ajuste con refuerzo (RL) que reordena las preferencias entre opciones según la recompensa obtenida al dejar que la política maestra complete el episodio. El resultado reportado por el autor es una tasa de éxito del 95 % en 20 episodios de evaluación sobre el mismo circuito de entrenamiento, frente al 90 % del modelo solo supervisado y el 0 % del modelo base sin ajustar.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de destilación de políticas RL en modelos de lenguaje pequeños (0,8B parámetros) para control de robots simulados; por otro, ilustra un patrón de publicación muy específico (adaptador PEFT, licencia Apache 2.0, idioma coreano) cuyas capacidades quedan acotadas al dominio `follow_route` del simulador, sin garantías de transferencia a robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas de atención y proyección, y se carga con `PeftModel.from_pretrained`. La tarea se formula como clasificación de una letra entre cinco opciones (observación de 16 dimensiones, 5 acciones), con un prompt de sistema que instruye al modelo a devolver solo la letra de la opción elegida y a tratar el texto del estado como datos, no como instrucciones.

El entrenamiento tiene tres piezas. Primero, una política PPO entrenada en un entorno web de simulación (tarea `follow_route`, contrato `link01-decision/follow_route/obs16-act5/walker51-14/v1`, circuito `9b094235`) que actúa como "maestro". Segundo, un conjunto de datos de 1911 ejemplos de entrenamiento, 364 de validación y 576 de test, generados muestreando el estado cada 0,5 segundos durante episodios del maestro, con un 20 % de ejemplos en los que se indujo al maestro a desviarse para cubrir situaciones de error. Tercero, un ajuste supervisado (LoRA) seguido de un ajuste con refuerzo tipo PPO con penalización KL contra el modelo supervisado, usando como señal de recompensa el retorno obtenido al dejar que el maestro complete el episodio desde la acción elegida.

El autor reporta que la tasa de coincidencia del maestro consigo mismo al traducir la observación a texto es del 100 %, lo que fija el techo de la tarea. La evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo físico completo del robot, por lo que los resultados de éxito y tiempo son una estimación.

## Capacidades

- Clasificación de decisión de locomoción: dado un estado textual del robot LINK-01, devuelve una letra entre cinco opciones de acción para los siguientes 0,5 segundos.
- Razonamiento de un solo paso: no hay planificación multi-paso ni memoria explícita; el estado incluye la decisión anterior como único mecanismo de contexto temporal.
- Seguimiento de instrucciones de formato: responde únicamente con la letra solicitada cuando se usa el prompt de sistema indicado por el autor.
- Robustez ante estados de desvío: el entrenamiento incluye un 20 % de ejemplos con acciones subóptimas para que el modelo aprenda a recuperarse.
- Idioma coreano: el prompt y los estados están en coreano; no se reporta soporte multilingüe.
- No se reportan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de un robot simulado en un circuito conocido: el modelo puede sustituir a la política PPO original en la tarea `follow_route` del simulador LINK-01, devolviendo una acción por tick de 0,5 segundos con un 95 % de éxito reportado en 20 episodios sobre el circuito de entrenamiento.
- Destilación de políticas RL en modelos de lenguaje pequeños: sirve como ejemplo reproducible de cómo convertir una política de control en un modelo de lenguaje mediante LoRA + RL, útil parainvestigación en destilación de políticas.
- Evaluación de robustez ante desviaciones: los ejemplos de desvío permiten usar el modelo para estudiar la recuperación tras acciones subóptimas en entornos de simulación.
- Docencia de aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO → dataset → LoRA → RL) en un entorno educativo.
- Prototipado de interfaces texto-acción: el formato de pregunta/respuesta (estado en texto, letra como salida) es reutilizable para conectar modelos de lenguaje con simuladores que acepten comandos discretos.
- Pruebas de integración en pipelines PEFT: el adaptador sirve para validar flujos de carga con `PeftModel` sobre Qwen3.5-0.8B en entornos de CI o notebooks.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluación sobre 576 preguntas de test y 20 episodios de caminata con semillas 91001–91020, aproximación 2D):

| Modelo | Acierto en test (coincidencia con el maestro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Maestro (PPO) | 100,0 % | 100 % | 0 % | 41,4 s |
| Modelo base sin ajustar | 22,9 % | 0 % | 0 % | — |
| Solo supervisado (LoRA) | 92,2 % | 90 % | 0 % | 41,2 s |
| LoRA + RL (este modelo) | 89,6 % | 95 % | 0 % | 40,9 s |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B en fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA añade un tamaño despreciable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o despliegue con vLLM se recomienda una A10, L4 o superior.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y en GPUs integradas con al menos 8 GB de memoria unificada.
- Opciones de despliegue: transformers + PEFT (el método documentado por el autor), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI si se fusiona el adaptador y se sirve el modelo resultante.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, la latencia por token en GPU de consumo debería ser de milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables (adaptadores LoRA para control de robots simulados sobre modelos de lenguaje pequeños) en la información proporcionada. Como referencia de la familia base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-seyunduck-route-v1-link01 | 0,8B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face (17 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | Hugging Face |
| Política PPO original (maestro) | no disponible | no aplica | no disponible | Repositorio CONNECT TYCOON |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo ha sido entrenado para la tarea `follow_route` del simulador LINK-01, con 16 dimensiones de observación y 5 acciones; no generaliza a otras tareas, robots o entornos.
- Evaluación limitada: los resultados de éxito (95 %) y tiempo (40,9 s) provienen de 20 episodios sobre el mismo circuito de entrenamiento y de una aproximación 2D, no del simulador físico completo; el propio autor advierte que los resultados pueden diferir de MuJoCo.
- Sobreajuste al circuito: no se reportan evaluaciones en circuitos distintos al `9b094235`, por lo que no hay evidencia de generalización.
- Riesgo de alucinación: como modelo de lenguaje, puede devolver una letra no listada o texto adicional si el prompt no se aplica exactamente como indica el autor; se recomienda validar la salida contra el conjunto de opciones.
- Idioma: solo coreano; los estados y el prompt están en coreano, y no se reporta soporte para otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que es un modelo de investigación y educación y recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- Sin datos de sesgos: no se han publicado análisis de sesgos, y el entrenamiento sobre un único circuito y una única política maestra puede heredar los sesgos de esa política.
- Fecha de creación futura en los metadatos (2026-10-31): conviene verificar la procedencia y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seyunprobiz/connectailab-rl-seyunduck-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
