# Ragavendiran/slm-rl-colab

## Resumen

Ragavendiran/slm-rl-colab es un adaptador PEFT LoRA desarrollado por Ragavendiran para el taller SLM-RL (Self-improving Language Models through Reinforcement Learning) de CraftsMan-Labs. El adaptador se entrena sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct y tiene como objetivo que un modelo de lenguaje pequeño (SLM) aprenda a jugar al juego de Atari "Boxing" mediante interacciones en texto. El modelo recibe una descripcion textual del estado del juego y las acciones legales, y debe responder con el identificador de la accion correcta.

La relevancia de este adaptador reside en que demuestra un enfoque de aprendizaje por refuerzo aplicado a modelos de lenguaje pequenos, donde el modelo mejora iterativamente jugando contra si mismo o contra profesores (en este caso, un DQN). El adaptador se entrena mediante el metodo `reject_sft` sobre demostraciones generadas por un profesor DQN, y ha sido promovido en el pipeline de evolucion del taller SLM-RL. Es un experimento de investigacion que explora si los SLM pueden aprender tareas de control y toma de decisiones en entornos de juego a traves de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre LiquidAI/LFM2.5-1.2B-Instruct |
| Parametros totales | no disponible (adaptador LoRA, el modelo base tiene 1.2B) |
| Parametros activos | no disponible (adaptador LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base LFM2.5-1.2B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 o float32 segun el dispositivo) |
| Idiomas soportados | no disponible (probablemente ingles, dado el prompt del ejemplo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador utiliza la arquitectura LoRA, que anade matrices de bajo rango a las capas de atencion del modelo base LiquidAI/LFM2.5-1.2B-Instruct. El modelo base es un transformer causal de 1.2B parametros con soporte para chat mediante plantillas de mensajes. El adaptador se entrena con el metodo `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un profesor DQN en el entorno Boxing de Atari. El entrenamiento se realiza dentro del framework SLM-RL, que automatiza el ciclo de juego, recopilacion de datos, fine-tuning y re-evaluacion.

Las metricas de entrenamiento registradas muestran una perdida de -0.0228, un KL de 0.304 respecto al modelo base, y una recompensa media de 0.168. El adaptador fue promovido en el pipeline de evolucion porque mejoro la metrica primaria de -0.5 a 0.0, con una tasa de acciones invalidas de 0.0 y una tasa de intervencion de 0.0. El entrenamiento utilizo 16 prompts y 8 episodios de evaluacion.

## Capacidades

- Generacion de acciones de juego: el modelo recibe el estado del juego en texto y responde con un identificador de accion valida (por ejemplo, "ACTION: 1" para NOOP).
- Razonamiento contextual en entornos de juego: procesa la descripcion textual del estado y las acciones legales disponibles.
- Aprendizaje por refuerzo: el adaptador ha sido optimizado mediante RL para maximizar la recompensa en el juego Boxing.
- Integracion con el framework SLM-RL: puede usarse como punto de partida para evoluciones posteriores en el taller.
- Generacion de texto general: al estar basado en LFM2.5-1.2B-Instruct, conserva las capacidades de generacion de texto del modelo base (aunque el adaptador esta especializado en la tarea de juego).
- No soporta tool calling ni funciones de agente fuera del contexto de juego.

## Casos de uso

- Investigacion en RL para SLM: el adaptador sirve como ejemplo de como un modelo de lenguaje pequeno puede aprender tareas de control mediante aprendizaje por refuerzo, util para investigadores que estudian los limites de los SLM en entornos de decision secuencial.
- Benchmark de aprendizaje por refuerzo en texto: puede usarse como punto de comparacion para evaluar otros metodos de entrenamiento de SLM en entornos de juego.
- Punto de partida para evolucion en SLM-RL: el adaptador promovido puede usarse como base para generar nuevas generaciones de modelos en el taller SLM-RL, explorando mejoras incrementales.
- Estudio de transferencia de conocimiento: permite analizar como un modelo entrenado con demostraciones de un agente DQN se comporta en el entorno real de juego.
- Educacion en IA: el adaptador y su pipeline de entrenamiento pueden usarse en cursos o talleres para demostrar el ciclo completo de RL aplicado a modelos de lenguaje.
- Experimentos de warm-starting: el adaptador demuestra la tecnica de inicializar el aprendizaje con demostraciones de un profesor, util para acelerar la convergencia en tareas de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas registradas son las del entrenamiento en el entorno Boxing:

| Metrica | Valor |
|---|---|
| Recompensa media (train) | 0.168 |
| Perdida (train) | -0.0228 |
| KL (train) | 0.304 |
| Entropia (train) | 2.569 |
| Recompensa media (eval) | 0.0 |
| Tasa de acciones invalidas (eval) | 0.0 |
| Tasa de intervencion (eval) | 0.0 |
| Win rate (eval) | 0.0 |

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.2B, la inferencia puede ejecutarse en GPUs con 4-6 GB de VRAM en bfloat16, o incluso en CPU con float32 (aunque mas lento).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, etc.) es suficiente. El ejemplo de carga incluye soporte para Apple Silicon (MPS).
- Compatibilidad con consumer GPU: si, el modelo base de 1.2B parametros es adecuado para GPUs de consumo.
- Opciones de despliegue: transformers + PEFT (como se muestra en el ejemplo), tambien puede integrarse con vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponible, pero al ser un modelo de 1.2B, la generacion de 24 tokens deberia completarse en menos de 1 segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ragavendiran/slm-rl-colab | 1.2B (base) + LoRA | no disponible | Juego Boxing (Atari) | Apache 2.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B | no disponible | Chat/instrucciones generales | Apache 2.0 | HuggingFace |
| Otros adaptadores SLM-RL | no disponible | no disponible | Varios juegos Atari | no disponible | Repos del taller SLM-RL |

No se dispone de informacion suficiente sobre otros adaptadores del taller SLM-RL para realizar una comparativa mas detallada.

## Limitaciones y advertencias

- Modelo experimental: es un adaptador de investigacion creado para un taller, no un modelo de produccion. Su unica funcion demostrada es jugar a Boxing.
- Especializacion limitada: el adaptador solo ha sido entrenado para el juego Boxing; no se espera que funcione correctamente en otros juegos o tareas.
- Sin datos de generalizacion: no se ha evaluado el rendimiento del modelo fuera del entorno de juego.
- Dependencia del modelo base: el adaptador requiere el modelo LiquidAI/LFM2.5-1.2B-Instruct para funcionar; no es un modelo autonomo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar acciones invalidas o texto incoherente si el prompt no sigue el formato esperado.
- Sesgos desconocidos: no se ha realizado una evaluacion de sesgos en este adaptador.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo es de caracter experimental y no se recomienda para aplicaciones criticas.
- Repositorio vacio: el tamano del repo es 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar disponibles o ser extremadamente pequenos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ragavendiran/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/Ragavendiran/slm-rl-colab-data
- Repositorio SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
