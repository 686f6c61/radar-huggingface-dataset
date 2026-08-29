# LalithKishoreVP/slm-rl-colab

## Resumen

El modelo `LalithKishoreVP/slm-rl-colab` es un adaptador LoRA (PEFT) que especializa el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para jugar al juego de Atari **Boxing** dentro del framework de auto-mejora SLM-RL. Desarrollado por LalithKishoreVP, este adaptador se entrena mediante la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, permitiendo que un modelo de lenguaje pequeño (SLM) aprenda a tomar decisiones de acción en un entorno de juego textual.

La relevancia de este modelo radica en que demuestra un enfoque práctico para aplicar refuerzo (RL) a modelos de lenguaje pequeños sin necesidad de ajustar todos los parámetros del modelo base. Al ser un adaptador LoRA, el coste de entrenamiento e inferencia es reducido, y puede integrarse fácilmente en pipelines de SLM-RL para experimentación. El adaptador está diseñado para ser cargado junto con el modelo base de 1.2B parámetros, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer causal (LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | No disponible (el adaptador es un subconjunto; el modelo base tiene 1.2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No aplica (adaptador en bfloat16/float32; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el adaptador se centra en acciones de juego, no en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bajo subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, un transformer causal de 1.2B parámetros. El entrenamiento se realiza con el framework SLM-RL, que permite a los modelos de lenguaje pequeños jugar en entornos de texto y mejorar iterativamente. Concretamente, se emplea la técnica `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un profesor DQN en el juego Boxing. El proceso de entrenamiento registra métricas como pérdida, KL, entropía y recompensa, y el adaptador se promociona como campeón de la generación 1 tras superar el umbral de rendimiento (primary de -0.5 a 0.0, invalid_rate 0.0, intervention_rate 0.0).

No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset, aunque el dataset asociado está disponible en Hugging Face (`LalithKishoreVP/slm-rl-colab-data`). El adaptador se entrena con 16 prompts y 8 episodios de evaluación, lo que sugiere un experimento de pequeña escala orientado a validar el flujo de SLM-RL.

## Capacidades

- Generacion de acciones para el juego Boxing: el modelo responde con un identificador de accion (`ACTION: <id>`) entre las acciones legales (NOOP, UP, etc.).
- Integracion con el framework SLM-RL: el adaptador puede usarse en el CLI de SLM-RL para evolucionar generaciones de agentes.
- Carga mediante PEFT: se puede combinar con el modelo base usando `PeftModel.from_pretrained` con la subcarpeta `adapter/`.
- Soporte de chat template: el adaptador respeta el formato de chat del modelo base, permitiendo prompts con roles system y user.
- No se han documentado capacidades generales de texto, codigo o razonamiento mas alla de la tarea especifica de juego.

## Casos de uso

- Investigacion en RL para modelos de lenguaje: el adaptador sirve como punto de partida para estudiar como los SLM aprenden a tomar decisiones en entornos de juego, permitiendo reproducir experimentos de SLM-RL con un coste computacional bajo.
- Desarrollo de agentes de juego en texto: puede integrarse en pipelines de SLM-RL para evolucionar agentes que jueguen a Boxing, sirviendo como campeon inicial (generacion 1) para generaciones posteriores.
- Evaluacion de tecnicas de fine-tuning con rechazo: el entrenamiento con `reject_sft` sobre demostraciones de un profesor DQN ofrece un caso de estudio para comparar metodos de SFT y RL en entornos discretos.
- Prototipado rapido de adaptadores LoRA: al ser un adaptador pequeno (repo de 0.0 GB), es util para probar flujos de trabajo con PEFT y Hugging Face sin necesidad de grandes recursos.
- Educacion y talleres: el modelo se presenta como parte de un workshop de SLM-RL, por lo que puede usarse en entornos docentes para ilustrar conceptos de RL, LoRA y auto-mejora.
- Benchmarking de entornos de juego: permite comparar el rendimiento de diferentes modelos base (por ejemplo, LFM2.5 vs otros) cuando se les anade el mismo adaptador, aislando el efecto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el modelo card incluye metricas de entrenamiento y evaluacion del adaptador:

| Metrica | Valor |
|---|---|
| primary (evaluacion) | 0.0 |
| invalid_rate (evaluacion) | 0.0 |
| intervention_rate (evaluacion) | 0.0 |
| win_rate (evaluacion) | 0.0 |
| mean_score (evaluacion) | 0.0 |
| loss (entrenamiento) | -0.0188 |
| kl (entrenamiento) | 0.1929 |
| entropy (entrenamiento) | 2.4623 |
| reward (entrenamiento) | 0.2266 |
| frac_reward_zero_std | 0.9375 |

Estas metricas indican que el adaptador fue promocionado (primary de -0.5 a 0.0) y no produjo acciones invalidas ni requirio intervencion, aunque el win_rate y mean_score son 0.0 en la evaluacion de 8 episodios.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM depende del modelo base. Para `LiquidAI/LFM2.5-1.2B-Instruct` en bfloat16, se estiman ~2.5-3 GB de VRAM para inferencia; el adaptador anade un coste minimo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar el modelo base con el adaptador. En CPU tambien es viable con float32, aunque mas lento.
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo medio (RTX 3060 o superior) y en entornos como Google Colab (gratuito con T4).
- Opciones de despliegue: se puede usar con transformers + PEFT, o a traves del CLI de SLM-RL. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT, puede integrarse en frameworks que soporten LoRA (por ejemplo, vLLM con soporte de adaptadores).
- Latencia y throughput: no disponible. Dado el tamano del modelo base (1.2B), se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables para el mismo juego o framework. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1.2B | No disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| LalithKishoreVP/slm-rl-colab (adaptador) | No disponible (LoRA) | No disponible | Juego Boxing (SLM-RL) | Apache 2.0 | Hugging Face |
| Otros adaptadores SLM-RL (p.ej. mr3haque/SLM-RL-Agents) | No disponible | No disponible | Varios juegos Atari | No disponible | Hugging Face |

La comparativa es limitada porque no hay datos publicos de rendimiento estandarizado para adaptadores de juego.

## Limitaciones y advertencias

- Especificidad de tarea: el adaptador solo esta entrenado para el juego Boxing; no es util para otras tareas de lenguaje o juegos sin reentrenamiento.
- Dependencia del modelo base: requiere cargar `LiquidAI/LFM2.5-1.2B-Instruct`; no es un modelo autonomo.
- Rendimiento limitado: las metricas de evaluacion muestran win_rate y mean_score de 0.0, lo que sugiere que el adaptador no gana partidas en la evaluacion inicial (aunque fue promocionado por mejora relativa).
- Datos de entrenamiento escasos: solo 16 prompts y 8 episodios de evaluacion, lo que puede indicar un experimento preliminar o de validacion de flujo, no un agente robusto.
- Sin informacion sobre sesgos: al ser un adaptador para un juego, no se han documentado sesgos linguisticos, pero el modelo base puede heredar sesgos de su entrenamiento.
- Riesgo de alucinacion: en el contexto de juego, el modelo podria generar acciones no legales si no se restringe la salida; aunque el adaptador muestra invalid_rate 0.0, esto no garantiza robustez en todos los escenarios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y aviso de licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LalithKishoreVP/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/LalithKishoreVP/slm-rl-colab-data
- Framework SLM-RL (GitHub): https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base LiquidAI/LFM2.5-1.2B-Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
