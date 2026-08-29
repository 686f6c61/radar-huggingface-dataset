# sgtlaxman/slm-rl-colab

## Resumen

`sgtlaxman/slm-rl-colab` es un adaptador LoRA (PEFT) de pequeño tamaño que se integra sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para especializarlo en la tarea de jugar al juego *Boxing* de Atari dentro del framework de aprendizaje por refuerzo SLM-RL. El adaptador fue entrenado mediante el método `reject_sft` sobre demostraciones generadas por un agente DQN, y está pensado para ser utilizado en el taller (workshop) de SLM-RL, donde los modelos de lenguaje pequeños aprenden a tomar decisiones en entornos de texto.

La relevancia de este adaptador radica en que demuestra un flujo completo de auto-mejora para modelos de lenguaje: el modelo juega, sus decisiones se recopilan en un dataset, se fine-tunea con RL y el modelo mejorado vuelve a jugar. Aunque el rendimiento reportado es muy bajo (win_rate 0.0, primary 0.0), el adaptador sirve como punto de partida para experimentos de RL en juegos de Atari con LLMs. El repositorio contiene únicamente los pesos del adaptador (0.0 GB) y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base `LiquidAI/LFM2.5-1.2B-Instruct` (transformer causal) |
| Parametros totales | No disponible (el adaptador añade un número reducido de parámetros entrenables; el modelo base tiene 1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 según el dispositivo) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero el adaptador está orientado a acciones de juego en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje causal de 1.2B parámetros. El adaptador LoRA se entrena con el framework SLM-RL, que permite a modelos de lenguaje pequeños aprender a jugar juegos en entornos de texto. El método de entrenamiento es `reject_sft`: se generan demostraciones con un agente DQN (profesor) y se filtran las acciones inválidas o de baja recompensa antes de hacer fine-tuning supervisado. El entrenamiento se realizó sobre 16 prompts, con una pérdida de -0.0197, KL de 0.190 y recompensa media de 0.25. No se reportan detalles sobre el dataset de entrenamiento más allá de que está disponible en `sgtlaxman/slm-rl-colab-data`.

## Capacidades

- Generación de acciones de juego en formato texto: el modelo responde con `ACTION: <id>` para el juego *Boxing*.
- Integración con el pipeline de SLM-RL: puede ser utilizado como adaptador en el comando `slm-rl evolve` para continuar el entrenamiento.
- Soporte de chat: al estar basado en un modelo instruct, puede recibir mensajes con el formato de chat estándar.
- No se conocen capacidades adicionales como tool calling, razonamiento multi-paso o visión, ya que el adaptador está especializado únicamente en la tarea de juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo con LLMs: el adaptador sirve como punto de partida para estudiar cómo los modelos de lenguaje aprenden políticas de control en entornos de Atari.
- Evaluación de algoritmos RL: se puede comparar el rendimiento de este adaptador con otros entrenados con diferentes métodos (PPO, DQN, etc.) en el mismo juego.
- Fine-tuning incremental: el adaptador puede ser utilizado como warm-start para generaciones posteriores en el taller SLM-RL, permitiendo iterar sobre la política aprendida.
- Benchmarking de frameworks de RL: sirve para probar la integración de PEFT con SLM-RL y verificar que el pipeline de entrenamiento funciona correctamente.
- Demostración educativa: útil para enseñar conceptos de RL y fine-tuning de LLMs en entornos académicos.
- Prueba de concepto de auto-mejora: el adaptador demuestra el ciclo completo de recopilación de datos, entrenamiento y re-evaluación, aunque con rendimiento bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este adaptador. Las métricas de evaluación reportadas en la model card son:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Intervention rate | 0.0 |
| Invalid rate | 0.0 |
| Mean score | 0.0 |
| Primary | 0.0 |
| Win rate | 0.0 |
| Entropia (train) | 2.651 |
| KL (train) | 0.190 |
| Loss (train) | -0.0197 |
| Reward (train) | 0.25 |

Estos valores indican que el adaptador no logra ganar partidas en la evaluación, aunque no produce acciones inválidas ni requiere intervención.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base `LFM2.5-1.2B-Instruct`, que tiene 1.2B parámetros. En cuantización bfloat16, el modelo base ocupa aproximadamente 2.4 GB de VRAM, por lo que cabe en GPUs consumer como RTX 3060, RTX 4060, etc.
- El adaptador en sí añade una cantidad mínima de memoria (menos de 100 MB).
- Se puede ejecutar en CPU con float32, aunque la inferencia será lenta.
- Opciones de despliegue: transformers + PEFT (como se muestra en el ejemplo de carga), también compatible con vLLM si se fusiona el adaptador, o con llama.cpp si se convierte a GGUF (aunque no se proporciona conversión oficial).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en el ecosistema SLM-RL para el juego *Boxing*. El adaptador es específico de un experimento concreto y no hay modelos de referencia públicos con los que comparar directamente. Se podría comparar con el modelo base sin adaptador, pero no se reportan métricas de ese escenario.

## Limitaciones y advertencias

- Rendimiento muy bajo: el adaptador no gana partidas (win_rate 0.0) y su recompensa media es 0.0, lo que indica que no ha aprendido una política efectiva.
- Especialización extrema: solo está entrenado para el juego *Boxing*; no generaliza a otras tareas.
- Dependencia del modelo base: cualquier limitación del modelo base (sesgos, alucinaciones) se hereda.
- Datos de entrenamiento limitados: solo 16 prompts, lo que puede provocar sobreajuste o falta de robustez.
- No se reportan sesgos específicos, pero al ser un modelo de lenguaje, puede generar texto no relacionado con el juego si se le pide.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador es un artefacto de investigación sin garantías de funcionamiento en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sgtlaxman/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/sgtlaxman/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
