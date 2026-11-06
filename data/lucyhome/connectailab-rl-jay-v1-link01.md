# lucyhome/connectailab-rl-jay-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lucyhome en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un modelo de decisión entrenado para leer el estado de un robot simulado (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa) y responder con una única letra que representa el movimiento a ejecutar durante los siguientes 0,5 segundos. El modelo se distribuye como adaptador, no como pesos completos, y requiere cargar el modelo base Qwen3.5-0.8B para funcionar.

El entrenamiento combina dos fases. Primero se generó un conjunto de problemas a partir de las observaciones registradas por una política PPO (el "cerebro" o brain.json) que resolvía la tarea `goto_target` en un entorno web de aprendizaje por refuerzo, y se aplicó aprendizaje supervisado (LoRA) para imitar esas decisiones. Después se aplicó una fase de refuerzo con corrección de política (PPO con anclaje KL) para subir la probabilidad de las acciones que habrían producido mejores recompensas si el resto de la trayectoria la hubiera completado el cerebro original.

Su relevancia es acotada y experimental: es un ejemplo de destilación de una política de RL en un modelo de lenguaje pequeño (0,8B parámetros) para tareas de decisión discreta, no un modelo para generación de texto general. Los resultados publicados por el autor muestran que la fase de RL no mejora la tasa de acierto frente al aprendizaje supervisado (68,1 % en ambos casos) y que ninguna de las dos variantes completa con éxito el circuito de evaluación de 20 episodios, por lo que debe considerarse un artefacto de investigación y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-0.8B tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura subyacente: añade matrices de bajo rango sobre las proyecciones del modelo base y se carga con `PeftModel.from_pretrained`. La tarea es de clasificación discreta sobre un conjunto cerrado de opciones (acciones de locomoción), emitidas como una única letra.

El pipeline de entrenamiento tiene cuatro etapas descritas en la model card. (1) Se entrena una política PPO en un entorno web de RL (`goto_target`, observación de 10 dimensiones, 5 acciones, curso `random`) que alcanza un 90 % en el examen oficial. (2) Se construye un dataset de decisión muestreando cada 0,5 segundos las observaciones del cerebro y su acción elegida, incluyendo un 20 % de ejemplos con desviaciones deliberadas. El dataset resultante tiene 409 ejemplos de entrenamiento, 88 de validación y 119 de test. (3) Se aplica aprendizaje supervisado con LoRA para imitar al cerebro. (4) Se aplica una fase de RL con PPO y anclaje KL, usando como recompensa el retorno que habría obtenido el cerebro si hubiera continuado desde la acción elegida. No se documentan el número de tokens de entrenamiento, la composición del corpus ni detalles de hiperparámetros más allá de lo anterior.

## Capacidades

- Decisión discreta de locomoción: dado un estado textual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa), devuelve una única letra entre las opciones presentadas.
- Formato de respuesta restringido: el prompt de sistema exige devolver solo la letra de la opción elegida, sin explicación.
- Tratamiento del estado como datos: el prompt de sistema indica explícitamente que el texto dentro de `state` debe tratarse como datos y no como instrucciones.
- Integración con la librería `connect_tycoon.link01.questions`, que convierte observaciones del robot en el formato de pregunta esperado.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling, agentes multi-paso ni multilingüismo más allá del coreano.

## Casos de uso

- Docencia de RL y destilación: el adaptador sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA y una fase posterior de PPO con KL, usando el cuaderno de Colab enlazado en la model card.
- Investigación sobre destilación de políticas: permite estudiar la brecha entre la política experta (100 % de acierto) y la política destilada (68,1 %) en un entorno controlado y de bajo coste computacional.
- Simulación de agentes en entornos 2D: el modelo puede conectarse a un simulador de locomoción aproximada para generar trayectorias de decisión paso a paso, siempre que se acepte la aproximación por tabla de velocidades descrita por el autor.
- Evaluación de pipelines de RLHF/PPO sobre modelos pequeños: sirve para comparar el efecto de una fase de refuerzo con anclaje KL frente al aprendizaje supervisado puro en una tarea de clasificación discreta.
- Prototipado de interfaces robot-lenguaje: el formato de prompt (estado en texto, opciones enumeradas, respuesta de una letra) es un patrón reutilizable para conectar modelos de lenguaje con controladores de bajo nivel en entornos simulados.
- Reproducción de experimentos: con los seeds 91001–91020 y el código de `connect-tycoon` se puede replicar la evaluación de 20 episodios y verificar los resultados publicados.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre el conjunto de test (119 problemas) y sobre 20 episodios de evaluación con seeds 91001–91020. La caminata se evalúa con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo.

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxitos en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 9,9 s |
| Antes del entrenamiento | 63,9 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 68,1 % | 0 % | 0 % | — |
| Aprendizaje por refuerzo (PPO + KL) | 68,1 % | 0 % | 0 % | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, un transformer de 0,8B en fp16 requiere del orden de 1,6 GB solo para pesos, más overhead de activaciones y del adaptador LoRA; en cuantización de 4 bits puede situarse por debajo de 1 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero el autor no documenta requisitos ni pruebas de hardware.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no está verificado en la información proporcionada.
- Opciones de despliegue: la model card solo documenta la carga mediante `transformers` + `peft` (`AutoModelForCausalLM` y `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA específico para una tarea de decisión en un simulador concreto, por lo que no existe una categoría estándar de comparación publicada. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo no supera al aprendizaje supervisado: la fase de RL con PPO + KL no mejora la tasa de acierto (68,1 % en ambos casos) ni consigue completar ningún episodio de los 20 de evaluación.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden diferir de los del entorno real.
- El modelo está entrenado únicamente para la tarea `goto_target` con observación de 10 dimensiones y 5 acciones; no generaliza a otras tareas, morfologías de robot ni espacios de acción.
- El idioma declarado es coreano; no se documenta soporte multilingüe.
- Es un adaptador LoRA: requiere el modelo base Qwen/Qwen3.5-0.8B y la librería `peft` para funcionar; no es un modelo autónomo.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador, y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un clasificador de opciones cerradas, el riesgo principal es elegir una acción subóptima, no generar texto libre.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar efectivamente subidos o son de tamaño despreciable; conviene verificarlo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucyhome/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
