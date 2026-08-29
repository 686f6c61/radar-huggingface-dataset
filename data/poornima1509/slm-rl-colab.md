# Poornima1509/slm-rl-colab

## Resumen

Poornima1509/slm-rl-colab es un adaptador LoRA (PEFT) desarrollado por Poornima1509 que se superpone al modelo base LiquidAI/LFM2.5-1.2B-Instruct para especializarlo en la tarea de jugar a Space Invaders dentro del framework SLM-RL. El adaptador se entrena mediante la técnica `reject_sft` sobre demostraciones generadas por un profesor DQN, y se promociona como campeón en el pipeline evolutivo del taller SLM-RL, mejorando la puntuación primaria de 0.2292 a 0.5625 con una tasa de invalidación e intervención nulas.

Este adaptador es relevante porque demuestra cómo un modelo de lenguaje pequeño (1.2B) puede adaptarse mediante aprendizaje por refuerzo para tomar decisiones en entornos de juego Atari, un campo emergente en la investigación de agentes basados en LLMs. El adaptador se distribuye como un repositorio PEFT con pesos en safetensors, y se carga junto con el modelo base mediante `transformers` y `peft`. Su licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del base no especificada en la ficha) |
| Parametros totales | No disponible (el adaptador es un subconjunto de LoRA; el modelo base tiene 1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el codigo de ejemplo usa bfloat16 en GPU y float32 en CPU) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que se aplica al modelo base LiquidAI/LFM2.5-1.2B-Instruct, un modelo de lenguaje causal de 1.2B parámetros orientado a instrucciones. El adaptador se entrena con el framework SLM-RL, que combina aprendizaje por refuerzo con modelos de lenguaje. Concretamente, se utiliza la tecnica `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones de un agente DQN que juega a Space Invaders. El entrenamiento se realiza en un entorno de taller evolutivo, donde se generan multiples adaptadores y se seleccionan los que superan un umbral de rendimiento. Las metricas de entrenamiento muestran una perdida de -0.0099, una recompensa media de 0.0154 y una entropia de 2.658, con un KL de 0.5128 respecto al modelo base. El adaptador se promociona como campeon de la generacion 1, con una puntuacion primaria de 0.5625 y tasas de invalidacion e intervencion nulas.

## Capacidades

- Generacion de acciones para el juego Space Invaders: el modelo recibe un prompt con las acciones legales y responde con un identificador de accion (por ejemplo, `ACTION: 1`).
- Integracion con el pipeline SLM-RL: el adaptador se puede usar directamente en el CLI de SLM-RL para evolucionar agentes en el entorno Atari.
- Compatibilidad con el modelo base instructivo: al cargarse sobre LFM2.5-1.2B-Instruct, conserva las capacidades generales de generacion de texto del modelo base, aunque el adaptador esta optimizado para la tarea de juego.
- Soporte de chat: el codigo de ejemplo utiliza `apply_chat_template`, lo que permite interacciones con formato de mensajes.
- No se han documentado capacidades adicionales como tool calling, vision o audio.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para LLMs: el adaptador sirve como ejemplo de como un LLM puede aprender a tomar decisiones en un entorno de juego mediante RL, util para estudiar politicas de agentes y metodos de entrenamiento como `reject_sft`.
- Desarrollo de agentes de juego basados en lenguaje: se puede integrar en sistemas que requieran que un modelo de lenguaje controle un agente en entornos Atari, por ejemplo, para experimentos de IA generativa aplicada a videojuegos.
- Evaluacion de tecnicas de adaptacion PEFT: el adaptador permite comparar el rendimiento de LoRA frente a otros metodos de ajuste fino en tareas de control secuencial.
- Prototipado de sistemas de decision automatica: aunque el entorno es un juego, el enfoque puede extrapolarse a otros dominios donde un LLM deba elegir entre un conjunto discreto de acciones.
- Benchmarking de modelos base: al ser un adaptador sobre un modelo de 1.2B, se puede usar para medir la capacidad de aprendizaje por refuerzo de diferentes modelos base en la misma tarea.
- Educacion y talleres: el adaptador esta disenado para el taller SLM-RL, por lo que es util en cursos o workshops sobre RL y LLMs, permitiendo a los participantes experimentar con la evolucion de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye metricas de evaluacion del entorno Space Invaders, que se presentan a continuacion:

| Metrica | Valor |
|---|---|
| Puntuacion primaria (primary) | 0.5625 |
| Tasa de invalidacion (invalid_rate) | 0.0 |
| Tasa de intervencion (intervention_rate) | 0.0 |
| Puntuacion media (mean_score) | 0.5625 |
| Tasa de victorias (win_rate) | 0.0 |
| Episodios evaluados | 8 |

Estas metricas indican que el adaptador genera acciones validas y sin necesidad de intervencion humana, aunque no logra victorias en los episodios evaluados.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (peso del repositorio 0.0 GB), por lo que el requisito principal es el modelo base de 1.2B.
- El modelo base en precision bfloat16 ocupa aproximadamente 2.4 GB de VRAM, mas el overhead de activaciones y el adaptador. Se recomienda una GPU con al menos 4 GB de VRAM para inferencia comoda (por ejemplo, NVIDIA RTX 3050, RTX 3060, o superior).
- En CPU, el modelo puede ejecutarse en float32, aunque la latencia sera mayor; es viable para pruebas puntuales.
- Opciones de despliegue: el codigo de ejemplo usa `transformers` y `peft`; tambien se puede integrar con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explicitamente.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores comparables en la misma categoria (adaptadores LoRA para juegos Atari con SLM-RL) en la informacion proporcionada. El adaptador es especifico para Space Invaders y no existen datos de otros adaptadores similares con los que comparar.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para Space Invaders; no generaliza a otros juegos o tareas.
- Las metricas de rendimiento son modestas (puntuacion primaria 0.5625, win_rate 0.0), lo que sugiere que el agente no es competitivo frente a agentes DQN tradicionales.
- El adaptador se entrena sobre demostraciones de un profesor DQN, por lo que su comportamiento depende de la calidad de esas demostraciones y puede heredar sesgos del profesor.
- No se han documentado sesgos especificos del modelo base, pero al ser un LLM general, puede presentar alucinaciones o respuestas incoherentes fuera del contexto de juego.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador es experimental y no se garantiza su robustez en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o de baja adopcion; se recomienda verificar su funcionamiento antes de usarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Poornima1509/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/Poornima1509/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Repositorio de modelos SLM-RL (referencia): https://github.com/inde5media/SLM-RL-MODELS
