# MrSjGenAi2k25/slm-rl-colab

## Resumen

El modelo `MrSjGenAi2k25/slm-rl-colab` es un adaptador LoRA (PEFT) desarrollado por MrSjGenAi2k25 que se monta sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Su propósito es proporcionar un punto de partida (warm-start) para el entrenamiento de un agente que juega al juego de Atari **Boxing** dentro del framework SLM-RL (Small Language Model Reinforcement Learning). El adaptador se entrena mediante la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, y se ha promocionado como campeón en la generación 1 del taller SLM-RL.

La relevancia de este modelo radica en su enfoque: en lugar de entrenar un modelo de lenguaje desde cero para controlar un agente, se utiliza un adaptador ligero sobre un SLM ya instruido, lo que reduce costes computacionales y facilita la iteración en entornos de aprendizaje por refuerzo. El adaptador está diseñado para ser cargado con la librería PEFT y funciona con el pipeline de generación de texto, emitiendo acciones en formato `ACTION: <id>`. Aunque el repositorio es pequeño (0.0 GB) y no tiene descargas, su interés es metodológico para la comunidad de RL aplicada a modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (modelo base: LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | No disponible (solo se publica el adaptador, no el modelo base) |
| Parametros activos | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se especifica) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bfloat16, pero no se documentan cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) aplicada al modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje pequeño (SLM) con arquitectura transformer. El adaptador se entrena con el framework SLM-RL, que combina aprendizaje por refuerzo con modelos de lenguaje. Concretamente, se utiliza el método `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un agente DQN (Deep Q-Network) que juega al juego Boxing. El proceso de entrenamiento se realiza en el taller SLM-RL, donde el adaptador se evalúa y promociona como campeón de la generación 1.

Las métricas de entrenamiento registradas incluyen una pérdida de -0.0175, un KL de 0.2342, una recompensa media de 0.1875 y una entropía de 2.4597. En la evaluación se obtuvo una tasa de intervención de 0.0, una tasa de acciones inválidas de 0.0 y una puntuación primaria de 0.0, lo que llevó a su promoción. No se dispone de información sobre el dataset de entrenamiento más allá de que proviene de demos de DQN, ni sobre el número total de tokens o la composición del corpus.

## Capacidades

- Generación de acciones para el juego Atari Boxing: el modelo emite respuestas en formato `ACTION: <id>` a partir de un prompt que describe las acciones legales.
- Integración con el pipeline de generación de texto de Transformers, lo que permite usarlo con `AutoModelForCausalLM` y `PeftModel`.
- Soporte para warm-start en entrenamiento por refuerzo: el adaptador está diseñado para ser utilizado como punto de partida en el taller SLM-RL, permitiendo continuar la evolución del agente.
- No se documentan capacidades generales de razonamiento, código, matemáticas o multilingüismo, ya que el adaptador está especializado en la tarea de control de juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo con modelos de lenguaje: el adaptador sirve como ejemplo de cómo aplicar SLM-RL a un entorno de Atari, permitiendo estudiar la transferencia de conocimiento desde un profesor DQN a un SLM.
- Warm-start de entrenamiento de agentes: en el taller SLM-RL, se puede usar este adaptador como punto de partida para la generación 2, ahorrando tiempo de entrenamiento inicial.
- Evaluación de políticas en entornos de juego: el adaptador puede cargarse en un entorno de simulación para medir su rendimiento en Boxing, comparando con otros agentes.
- Desarrollo de pipelines de RL para SLM: sirve como referencia para implementar el flujo de entrenamiento con `reject_sft` y PEFT, incluyendo la carga de adaptadores desde subcarpetas.
- Pruebas de compatibilidad de PEFT con modelos de lenguaje pequeños: el adaptador demuestra la integración de LoRA con un SLM de 1.2B, útil para validar herramientas y flujos de trabajo.
- Reproducción de experimentos: los datos de entrenamiento y el adaptador están publicados, lo que permite reproducir el experimento y verificar los resultados reportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye métricas de entrenamiento y evaluación del adaptador en el entorno Boxing:

| Metrica | Valor |
|---|---|
| Primary (puntuación principal) | 0.0 (promovido desde -0.6250) |
| Invalid rate (tasa de acciones inválidas) | 0.0 |
| Intervention rate (tasa de intervención) | 0.0 |
| Win rate (tasa de victorias) | 0.0 |
| Mean score (puntuación media) | 0.0 |
| Episodios de evaluación | 8 |
| Loss de entrenamiento | -0.0175 |
| KL de entrenamiento | 0.2342 |
| Reward de entrenamiento | 0.1875 |
| Entropía de entrenamiento | 2.4597 |

Estas métricas indican que el adaptador produce acciones válidas sin intervención, pero no se reporta un rendimiento competitivo en términos de victorias o puntuación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 1.2B parámetros, la inferencia en bfloat16 requiere aproximadamente 2-3 GB de VRAM, dependiendo de la longitud del contexto y del batch. Esta es una estimación basada en el tamaño del modelo base, no un dato oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1660 Super, RTX 2060, RTX 3060 o superior. También puede ejecutarse en CPU con float32, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio y bajo.
- Opciones de despliegue: se puede cargar con Transformers + PEFT en Python, o integrarse en pipelines de vLLM o TGI si se convierte el adaptador a un formato compatible. También es posible usarlo con llama.cpp si se fusiona con el modelo base y se cuantiza.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la generación de una acción (24 tokens máximo) debería ser casi instantánea.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el mismo juego o framework. El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` no tiene una ficha pública detallada en la información proporcionada, por lo que no es posible comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en el juego Boxing; no es un modelo de propósito general y no debe usarse para tareas de lenguaje natural fuera de ese contexto.
- No se han documentado sesgos específicos, pero al entrenarse sobre demostraciones de un DQN, puede heredar comportamientos subóptimos o limitados del profesor.
- Riesgo de alucinación: aunque el modelo genera acciones, podría producir respuestas fuera del formato esperado si se le presentan prompts no alineados con el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; es necesario verificar los términos de ese modelo antes de un despliegue comercial.
- No se proporcionan datos sobre la calidad del modelo en términos de robustez o generalización a otros entornos de Atari.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente y no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrSjGenAi2k25/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/MrSjGenAi2k25/slm-rl-colab-data
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
