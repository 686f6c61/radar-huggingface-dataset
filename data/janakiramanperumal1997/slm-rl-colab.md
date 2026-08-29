# janakiramanperumal1997/slm-rl-colab

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) desarrollado por janakiramanperumal1997 para el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1.200 millones de parámetros. El adaptador se ha entrenado con el framework SLM-RL (Small Language Models - Reinforcement Learning) para que el modelo aprenda a jugar al juego Boxing de Atari en un entorno de texto nativo. La técnica empleada es `reject_sft` sobre demostraciones generadas por un profesor DQN, lo que permite transferir el conocimiento de un agente clásico de refuerzo a un modelo de lenguaje pequeño.

La relevancia de este adaptador radica en que demuestra un flujo de trabajo práctico para convertir modelos de lenguaje en agentes de control mediante aprendizaje por refuerzo, con un coste computacional reducido gracias al uso de LoRA. El adaptador está pensado para integrarse en el taller SLM-RL, donde los modelos juegan, recopilan datos y se auto-mejoran iterativamente. Aunque las métricas de evaluación muestran una tasa de victorias nula en el momento de la publicación, el adaptador fue promovido en el pipeline por mejorar la métrica primaria de -0,5 a 0,0, con tasas de intervención e invalidez nulas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct (transformer causal) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros entrenables, no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | no disponible (el adaptador se usa con el modelo base en bfloat16 o float32; no se indican cuantizaciones específicas) |
| Idiomas soportados | no disponibles (el adaptador está orientado a acciones de juego, no a lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA, subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un transformer causal de 1.200 millones de parámetros. El entrenamiento se realizó con el método `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un agente DQN que juega al Boxing. El framework SLM-RL gestiona el ciclo completo: el modelo juega en un entorno de texto, las decisiones se recopilan en un dataset, y el modelo se ajusta finamente sobre su propia experiencia o sobre la de un profesor.

Las métricas de entrenamiento reportadas incluyen una pérdida de -0,0179, una recompensa media de 0,176, un KL de 0,215 y una entropía de 2,56. El adaptador fue promovido en la generación 1 del pipeline, con una mejora de la métrica primaria de -0,5 a 0,0, y tasas de intervención e invalidez nulas. No se proporcionan detalles sobre el número de pasos de entrenamiento, el tamaño del dataset ni la composición exacta de las demostraciones.

## Capacidades

- Generación de acciones válidas para el juego Boxing de Atari en formato `ACTION: <id>`.
- Integración con el pipeline SLM-RL para evolución de agentes (jugar, recopilar datos, reentrenar).
- Funcionamiento en entornos de texto nativos, sin necesidad de visión.
- Soporte de carga mediante transformers + PEFT con subcarpeta `adapter/`.
- Compatible con el CLI de SLM-RL (`slm-rl evolve --game boxing`).
- No ofrece capacidades generales de chat, razonamiento o generación de código; su alcance se limita a la tarea de control del juego.

## Casos de uso

- Entrenamiento de agentes RL con modelos de lenguaje pequeños: el adaptador sirve como punto de partida para que el modelo base aprenda a jugar Boxing mediante refuerzo, permitiendo iterar con SLM-RL.
- Investigación en transferencia de conocimiento de agentes clásicos (DQN) a modelos de lenguaje: el flujo `reject_sft` sobre demos de un profesor es un caso de estudio reproducible.
- Evaluación de políticas en entornos de texto: el adaptador puede cargarse en un entorno de juego para medir la tasa de acciones válidas, la intervención y la recompensa.
- Benchmarking de adaptadores LoRA en tareas de control: permite comparar el rendimiento de diferentes configuraciones de LoRA sobre el mismo modelo base.
- Desarrollo de pipelines de auto-mejora: el adaptador se integra en el ciclo de SLM-RL donde el modelo juega, genera datos y se reentrena, sirviendo como ejemplo de evolución generacional.
- Estudio de la viabilidad de SLMs para control de juegos: con solo 1.2B de parámetros, demuestra que modelos pequeños pueden aprender políticas de acción en entornos discretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio solo reporta métricas de entrenamiento y evaluación del propio taller SLM-RL:

| Metrica | Valor |
|---|---|
| Loss (entrenamiento) | -0,0179 |
| Reward (entrenamiento) | 0,176 |
| KL (entrenamiento) | 0,215 |
| Entropia (entrenamiento) | 2,56 |
| Episodios de evaluacion | 8 |
| Intervention rate (eval) | 0,0 |
| Invalid rate (eval) | 0,0 |
| Mean score (eval) | 0,0 |
| Win rate (eval) | 0,0 |
| Primary (eval) | 0,0 |

Estos datos indican que el adaptador genera acciones válidas sin intervención, pero aún no consigue ganar partidas (win rate 0,0). La promoción en el pipeline se basó en la mejora de la métrica primaria, no en la victoria.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (peso del repositorio: 0,0 GB, aunque los pesos están en safetensors). El requisito principal viene del modelo base de 1.2B parámetros.
- VRAM estimada: en bfloat16, el modelo base ocupa aproximadamente 2,4 GB. Con el adaptador y el overhead de generación, se recomiendan al menos 4 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más, como NVIDIA RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como T4, L4 o A10. También puede ejecutarse en CPU, aunque con latencia mayor.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: transformers + PEFT (código de ejemplo incluido), también compatible con vLLM, Ollama o llama.cpp si se convierte el adaptador a GGUF (no se proporciona conversión oficial).
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, la generación de 24 tokens (como en el ejemplo) debería completarse en menos de un segundo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el mismo juego o con el mismo modelo base. El ecosistema SLM-RL incluye otros adaptadores para diferentes juegos (por ejemplo, en el repositorio inde5media/SLM-RL-MODELS), pero no se han encontrado datos públicos de rendimiento que permitan una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en el juego Boxing; no es útil para otras tareas de lenguaje o control.
- Las métricas de evaluación muestran una tasa de victorias nula (win_rate 0,0), lo que indica que el modelo aún no ha aprendido a ganar partidas, solo a generar acciones válidas.
- Depende completamente del modelo base LiquidAI/LFM2.5-1.2B-Instruct; si el modelo base cambia o se retira, el adaptador puede dejar de funcionar.
- No se especifica el número de parámetros del adaptador, lo que dificulta estimar su huella de memoria exacta.
- La licencia Apache 2.0 del adaptador permite uso comercial, pero la licencia del modelo base debe verificarse por separado (LiquidAI suele usar Apache 2.0, pero no se confirma en este repositorio).
- El entrenamiento se realizó con un número reducido de prompts (16) y episodios (8), lo que sugiere que el adaptador es un experimento preliminar, no un agente robusto.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad; al ser un adaptador de control, estos riesgos son menores, pero no se han evaluado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/janakiramanperumal1997/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/janakiramanperumal1997/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Colección de modelos SLM-RL: https://github.com/inde5media/SLM-RL-MODELS
