# attitudemetal/connectailab-rl-aion-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por ATTITUDE METAL (CONNECT AI LAB en colaboración con AI CITY BUILDERS), que actúa como "cerebro" de decisión para un robot caminante denominado LINK-01 en tareas de evitación de obstáculos. El modelo recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción para los siguientes 0,5 segundos. No es un modelo de lenguaje de propósito general, sino un policy model especializado entrenado mediante destilación desde un cerebro PPO y posterior refinamiento con RL.

El interés técnico reside en la metodología: se entrena primero un cerebro de reinforcement learning (PPO) en un simulador web de aprendizaje robótico, se generan 3.517 pares observación-decisión (2.605 de entrenamiento, 407 de validación, 505 de prueba) y se destila ese comportamiento en un LLM pequeño mediante LoRA y aprendizaje supervisado, seguido de un ajuste con RL (con penalización KL) para corregir las decisiones subóptimas. El resultado es un modelo de 0,8B parámetros que replica el 92,3% de las decisiones del cerebro profesor y completa el 100% de 20 episodios de evaluación sin colisiones.

Es relevante como ejemplo de pipeline completo de destilación de políticas de RL en modelos de lenguaje pequeños para robótica y toma de decisiones, con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB que lo hace desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El adaptador se entrena en dos fases. En la primera, se genera un conjunto de datos de destilación: un cerebro PPO entrenado en el simulador web de CONNECT AI WORLD (tarea `avoid_obstacles`, curso `18b2956e`, 75% de éxito en la prueba oficial) recorre el curso y cada 0,5 segundos se registra la observación convertida a texto y la acción elegida como respuesta correcta. Se incluye un 20% de ejemplos con acciones alternativas que desviaron al robot, para que el modelo aprenda a distinguir decisiones correctas de incorrectas.

En la segunda fase, se aplica aprendizaje supervisado (LoRA) para que el LLM imite las decisiones del cerebro y después un ajuste con RL en el que cada opción se recompensa según el retorno que habría obtenido el cerebro si hubiera ejecutado esa acción y continuado el episodio, con una penalización KL para mantener el modelo cerca de la política supervisada. El conjunto de datos final contiene 2.605 ejemplos de entrenamiento, 407 de validación y 505 de prueba, con una tasa de coincidencia máxima (techo de acierto) del 99% al traducir observaciones a texto.

## Capacidades

- Toma de decisiones discretas en robótica: dado un estado textual del robot, selecciona una de las acciones de locomoción disponibles y devuelve únicamente la letra correspondiente.
- Razonamiento de política de RL destilada: reproduce el comportamiento de un cerebro PPO entrenado en un simulador de evitación de obstáculos.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra de la opción elegida, sin explicación.
- Tratamiento de datos como datos: el prompt de sistema instruye a tratar el texto del estado como datos y no como instrucciones, mitigando inyección de prompt en el canal de observación.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para coreano.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de robot caminante en simulación: el modelo se coloca en el punto de decisión del robot LINK-01 y genera la acción de caminar cada 0,5 segundos a partir del estado textual, sustituyendo al cerebro PPO original en el bucle de control.
- Destilación de políticas de RL en LLM pequeños: sirve como referencia para pipelines que convierten un policy de RL en un modelo de lenguaje que puede integrarse en arquitecturas basadas en texto, con un coste computacional de 0,8B parámetros.
- Evaluación de robustez de políticas destiladas: el conjunto de prueba de 505 ejemplos y el protocolo de 20 episodios con semillas fijas (91001–91020) permiten medir la degradación entre el profesor y el alumno de forma reproducible.
- Investigación en RLHF/RL aplicado a decisiones discretas: el ajuste con recompensa por retorno y penalización KL es un caso concreto de RL sobre un modelo de lenguaje para una tarea de control, útil como banco de pruebas educativo.
- Educación en robótica y RL: el modelo se acompaña de un cuaderno de Colab y de un curso de reinforcement learning, por lo que puede usarse en docencia para ilustrar el ciclo completo simulación-destilación-despliegue.
- Prototipado rápido de agentes de decisión en entornos de rejilla o laberinto: la interfaz texto-a-letra permite conectar el modelo a cualquier simulador que describa su estado en lenguaje natural y espere una acción discreta, sin necesidad de GPU de gama alta.
- Validación previa al despliegue físico: dado su bajo coste, puede ejecutarse en el propio robot o en un equipo de borde para comprobar decisiones antes de trasladar la política a hardware real, siempre con revalidación en el entorno físico.

## Benchmarks y rendimiento

| Modelo | Acierto en prueba (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0% | 100% | 5% | no disponible |
| Aprendizaje supervisado (LoRA) | 92,5% | 100% | 0% | no disponible |
| Aprendizaje por refuerzo (este modelo) | 92,3% | 100% | 0% | no disponible |

La evaluación de la marcha se realizó con una aproximación 2D (tabla de velocidades por comando del simulador web MuJoCo), sin modelo físico ni red neuronal de marcha, por lo que los resultados pueden diferir de los del simulador MuJoCo web. No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 requiere aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB, más el adaptador LoRA (tamaño no disponible) y la caché KV.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para FP16; una RTX 3060, RTX 4060 o superior permite inferencia cómoda. Para despliegue en servidor, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers con PEFT (procedimiento documentado en la model card), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI si se fusionan los pesos y se sirve como modelo estándar.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por decisión debería ser de milisegundos en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-aion-v2-link01 | 0,8B + LoRA | no disponible | Decisión robótica (evitación de obstáculos) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | no disponible en la información | Hugging Face |
| Cerebro PPO original (policy RL) | no disponible | no aplica | Decisión robótica | no disponible | Simulador CONNECT AI WORLD |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de RL destiladas en LLM pequeños para robótica) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación y educación sobre simulador; la propia model card advierte de que debe revalidarse en el robot y el espacio reales antes de usarlo físicamente.
- La evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse al mundo real.
- El modelo solo está etiquetado para coreano y su dominio es una tarea concreta (`avoid_obstacles`); no es un LLM de propósito general.
- La tasa de coincidencia con el cerebro profesor es del 92,3%, lo que implica que aproximadamente 1 de cada 13 decisiones difiere de la política original.
- Riesgo de alucinación: al ser un modelo de lenguaje, podría generar una letra no válida o una explicación si el prompt no se aplica estrictamente; el prompt de sistema está diseñado para restringir la salida a una sola letra.
- El canal de observación se introduce como texto, lo que abre la puerta a inyección de prompt si el estado proviene de fuentes no confiables; el prompt de sistema incluye una instrucción explícita para tratar el estado como datos.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista y entrenarse en un único curso simulado, su comportamiento fuera de esa distribución no está caracterizado.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado, ya que no se detalla en la información disponible.
- El repositorio tiene solo 22 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/attitudemetal/connectailab-rl-aion-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Sitio de AI CITY BUILDERS: https://www.aicitybuilders.com
- Simulador web de aprendizaje robótico: https://www.ezerai.xyz/robot-lab/world/
- Sitio del autor: https://attitudemetal.kr
