# Kimsihyun/connectailab-rl-srdm-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B que actúa como política de decisión para el robot simulado LINK-01 en una tarea concreta de evitación de obstáculos (`avoid_obstacles`). El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas del sensor de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de las opciones de acción disponibles, que representa cómo caminar durante los siguientes 0,5 segundos. Lo desarrolla Kimsihyun dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS, y se publica como adaptador PEFT con licencia Apache 2.0.

El interés técnico del modelo no está en sus capacidades generales de lenguaje, sino en el enfoque de destilación: un cerebro PPO entrenado en un simulador web (un `brain.json` con un 65% de éxito en la prueba oficial) genera un conjunto de 1.450 problemas (994 de entrenamiento, 184 de validación y 272 de prueba) que se usan primero para aprendizaje supervisado por LoRA y después para ajuste con refuerzo (PPO con anclaje KL). El resultado es un modelo de 0,8 mil millones de parámetros que reproduce las decisiones del cerebro PPO en formato texto, lo que permite integrar la política en un pipeline de transformers estándar.

Es relevante como ejemplo reproducible de destilación de políticas de RL a modelos de lenguaje pequeños, con un coste de inferencia muy bajo y una interfaz puramente textual. El autor advierte que se trata de un modelo de investigación y educación sobre simulador, y que debe revalidarse antes de usarse en un robot físico o en un espacio distinto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko); las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura base: se carga con `PeftModel.from_pretrained` sobre el modelo Qwen original y se usa para generar una única letra de respuesta. La tarea se formula como clasificación de opciones en formato texto: el estado del robot se serializa en un bloque de "situación, pregunta y opciones", y el modelo debe devolver exactamente la letra de la opción elegida, sin explicación.

El entrenamiento tiene cuatro fases descritas por el autor. Primero, un cerebro PPO se entrena en el simulador web de CONNECT AI WORLD sobre el curso `1441aaac`, con la convención `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y un 65% de éxito en la prueba oficial. Segundo, se generan 1.450 pares observación-respuesta muestreando el cerebro cada 0,5 segundos; el 20% de los ejemplos incluyen respuestas que se desvían del cerebro (acciones alternativas que hicieron salir del camino). Tercero, se hace aprendizaje supervisado por LoRA para imitar las respuestas del cerebro. Cuarto, se aplica refuerzo con PPO usando como recompensa el retorno que habría obtenido el cerebro si hubiera continuado desde esa acción, con anclaje KL para evitar el colapso. La evaluación se realiza colocando el modelo de decisión en el puesto de mando del robot y caminando el mismo curso 20 veces con semillas 91001-91020.

## Capacidades

- Decisión de acción discreta en una tarea de evitación de obstáculos: dado un estado textual del robot, devuelve una letra entre las opciones listadas.
- Formato de salida restringido: una sola letra, sin texto adicional, lo que simplifica el parseo en producción.
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido de `state` como datos y no como instrucciones.
- Reproducción de la política de un cerebro PPO entrenado en simulador (destilación de política).
- Capacidad multilingüe limitada al coreano para el contenido de la tarea; las instrucciones del sistema están en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Evaluación de destilación RL a lenguaje: usar el modelo como referencia para medir cuánto de una política PPO se puede recuperar con un adaptador LoRA sobre un modelo de 0,8B, comparando la tasa de coincidencia con el cerebro original (86,4% en el conjunto de prueba).
- Simulación educativa de robótica: integrar el modelo en el simulador web de CONNECT AI WORLD para que estudiantes observen cómo un LLM pequeño toma decisiones de navegación paso a paso.
- Prototipado de interfaces estado-acción: emplear el formato de pregunta y opciones como plantilla para convertir observaciones de sensores en decisiones discretas, sin necesidad de un entorno de RL en producción.
- Generación de datos sintéticos de decisión: usar el modelo para etiquetar nuevas observaciones del simulador y ampliar el conjunto de entrenamiento de políticas más grandes.
- Pruebas de robustez ante prompt injection: el modelo está entrenado para tratar el estado como datos, por lo que sirve como banco de pruebas para evaluar si un LLM pequeño respeta la separación entre datos e instrucciones en un contexto de control.
- Docencia sobre PPO y LoRA: el repositorio CONNECT TYCOON y el notebook de Colab permiten reproducir las cuatro fases de entrenamiento y comparar supervisado frente a refuerzo.
- Evaluación comparativa de políticas: colocar el modelo en el puesto de mando del robot y medir éxito, colisiones y tiempo medio por episodio frente al cerebro PPO original.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La métrica "aciertos en examen" es la tasa de coincidencia con la respuesta del cerebro PPO; "20 partidas" es el resultado de colocar el modelo en el puesto de mando del robot en el mismo curso con semillas 91001-91020.

| Modelo | Aciertos en examen | Éxito en 20 partidas | Partidas con colisión | Tiempo medio de las partidas exitosas |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 100% | 0% | 19,6 s |
| Antes del entrenamiento | 39,7% | 0% | 30% | — |
| Aprendizaje supervisado (LoRA) | 86,4% | 100% | 0% | 19,5 s |
| Refuerzo (PPO) | 82,4% | 100% | 5% | 19,8 s |

El autor indica que la evaluación de caminata usa una aproximación 2D (tabla de velocidades medidas por comando sobre el simulador web MuJoCo), sin modelo de robot ni red neuronal de marcha, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo. La tasa de aciertos del 100% del cerebro en el examen es el techo teórico de la destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8B parámetros; en fp16 ocupa aproximadamente 1,6 GB de pesos, más el adaptador LoRA (tamaño no especificado) y la caché KV. En cuantización de 4 bits cabría en menos de 1 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior es holgada. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PEFT (método documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles. El modelo genera una sola letra, por lo que la latencia dominante será el prefill del prompt de estado, no la decodificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de destilación de políticas RL a LLM en la documentación proporcionada. La comparación más directa es con su propio profesor (el cerebro PPO) y con la versión sin entrenar del modelo base, cuyos resultados se recogen en la tabla de benchmarks. Frente a políticas RL clásicas, la ventaja de este enfoque es la interfaz textual y la integración con el ecosistema transformers; la desventaja es la pérdida de aciertos respecto al profesor (86,4% en supervisado, 82,4% en refuerzo).

| Modelo | Parámetros | Contexto | Aciertos en examen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | no disponible | 86,4% (SL) / 82,4% (RL) | Apache 2.0 | HuggingFace |
| Cerebro PPO (profesor) | no aplica (política RL) | no aplica | 100,0% | no disponible | `brain.json` en el simulador |
| Qwen3.5-0.8B sin ajustar | 0,8B | no disponible | 39,7% | no disponible en la información | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador: el autor recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden diferir del entorno real.
- El adaptador está especializado en una única tarea (`avoid_obstacles`) y un único curso (`1441aaac`); no se documenta generalización a otros mapas, robots o tareas.
- El idioma de la tarea es coreano; el prompt de sistema está en inglés. No se documenta soporte para otros idiomas.
- Riesgo de alucinación en el formato: el modelo debe devolver exactamente una letra; fuera de distribución puede generar texto adicional o una letra no válida, lo que requiere validación en el parseo.
- El 20% de ejemplos de entrenamiento incluye acciones desviadas del cerebro, lo que introduce ruido deliberado en la política aprendida.
- No se publican cuantizaciones ni datos de latencia/throughput, lo que limita la planificación de despliegues en producción.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3.5-0.8B debe verificarse por separado, ya que la información proporcionada no la detalla.
- El modelo tiene 15 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kimsihyun/connectailab-rl-srdm-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
