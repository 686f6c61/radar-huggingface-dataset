# sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO

## Resumen

Qwen3-1.7B-Wordle-SFT-GRPO es un modelo de lenguaje de 1.720.574.976 parametros derivado de Qwen3-1.7B, desarrollado por sergiopaniego y publicado en Hugging Face. No es un modelo de proposito general: es un ajuste fino especializado para jugar a Wordle dentro del entorno OpenEnv, combinando un calentamiento corto de SFT sobre `openenv/Qwen3-1.7B-Wordle-SFT` seguido de un entrenamiento con GRPO (Group Relative Policy Optimization) mediante la libreria TRL. El modelo interactua con el juego a traves de una herramienta `guess` y emite un razonamiento breve antes de cada intento.

La relevancia de esta ficha es doble. Por un lado, demuestra un pipeline completo de entrenamiento por refuerzo con verificacion en entorno real (OpenEnv Wordle), reproducible con un solo A100 80 GB en aproximadamente 2 horas y 15 minutos. Por otro, sirve como referencia practica de como el RL con recompensas compuestas (victoria rapida, credito parcial y penalizacion por jugadas invalidas) mejora drasticamente el comportamiento de un modelo pequeno en una tarea con reglas estrictas: pasa de 0/30 victorias en el modelo base a 20/30 en este ajuste.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-1.7B, con licencia no disponible en la model card y sin datos publicados sobre composicion del dataset de preentrenamiento original. Su interes para desarrolladores e investigadores esta en el metodo de entrenamiento y en el ejemplo de integracion de tool calling con entornos externos, no en sus capacidades generales de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.720.574.976 parametros. Sobre esa base se aplico primero un ajuste fino supervisado corto que dio lugar a `openenv/Qwen3-1.7B-Wordle-SFT`. Despues se ejecuto GRPO con TRL usando `environment_factory`: 150 pasos de entrenamiento con 4 prompts por paso y 16 partidas por prompt, modo thinking activado, tasa de aprendizaje constante de 1e-6, `max_completion_length=4096`, `vllm_importance_sampling_mode="token_truncate"` y vLLM colocado en el mismo nodo. El entrenamiento se ejecuto en una unica A100 80 GB a traves de Hugging Face Jobs, con un coste aproximado de 5,60 dolares y una duracion de unas 2 horas y 15 minutos.

La innovacion tecnica principal esta en la funcion de recompensa, compuesta por tres terminos: una victoria paga mas cuanto mas rapida es (`1 + 0.5 * (1 - guesses / 6)`), un juego perdido otorga credito parcial proporcional al mejor intento (`0.1 * greens`) y cada movimiento invalido penaliza con `-0.1`. Esta combinacion empuja al modelo a reducir jugadas invalidas (de 41 en el SFT a 3 en este modelo) y a priorizar estrategias de resolucion mas eficientes, a costa de un ligero aumento de intentos por victoria (de 3,2 a 4,1). El modelo base Qwen3-1.7B partia de 24 jugadas invalidas y 0 victorias en la evaluacion de 30 palabras.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Qwen3-1.7B.
- Razonamiento breve antes de cada accion (modo thinking activado durante el entrenamiento).
- Tool calling mediante la herramienta `guess` para interactuar con el entorno Wordle.
- Juego de Wordle: propone palabras validas de cinco letras y usa el feedback del entorno (verde, amarillo, gris) para refinar intentos sucesivos.
- Razonamiento multi-paso dentro de una partida: cada intento depende de los anteriores.
- Capacidades multilingues: no disponibles de forma verificada para este ajuste; el entrenamiento se realizo sobre el entorno Wordle en ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en RL con verificacion: el modelo sirve como referencia reproducible de un pipeline GRPO completo con TRL, vLLM y OpenEnv, util para estudiar como las recompensas compuestas moldean el comportamiento de un modelo pequeno.
- Desarrollo de agentes con tool calling: ejemplifica como un modelo de 1.7B puede aprender a invocar una herramienta externa (`guess`) de forma consistente y con baja tasa de errores de formato (3 jugadas invalidas en 30 partidas).
- Evaluacion de entornos de entrenamiento: permite comparar el impacto del SFT frente al RL sobre el mismo modelo base usando el script `evaluate.py` y el conjunto `secrets30.txt`.
- Docencia y divulgacion: caso practico de ajuste fino con RL para explicar conceptos de recompensa, credito parcial y penalizacion en entornos con reglas estrictas.
- Benchmarking de modelos pequenos en tareas de razonamiento con restricciones: Wordle exige cumplir restricciones lexicas y de feedback, lo que lo convierte en una prueba compacta de razonamiento bajo reglas.
- Base para experimentos de RL en otros juegos o entornos OpenEnv: el codigo y la configuracion de GRPO son reutilizables para tareas similares con recompensas verificables.
- Demostracion en espacios de Hugging Face: el modelo se puede enfrentar a otros en el Wordle Arena para comparar estrategias.

## Benchmarks y rendimiento

Evaluacion sobre 30 palabras (`secrets30.txt`), decodificacion greedy, cada modelo entrenado una vez:

| Modelo | Victorias (30 palabras) | Intentos por victoria | Jugadas invalidas |
|---|---|---|---|
| Qwen3-1.7B | 0/30 | - | 24 |
| Qwen3-1.7B-Wordle-SFT | 10/30 | 3,2 | 41 |
| Qwen3-1.7B-Wordle-SFT-GRPO (este modelo) | 20/30 | 4,1 | 3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que los numeros corresponden a una unica ejecucion sobre las palabras del propio entorno de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 1.720.574.976 parametros en fp16 se requieren aproximadamente 3,4 GB solo para pesos, mas overhead de contexto y cache KV.
- GPU recomendadas para entrenamiento: una A100 80 GB fue suficiente para el GRPO completo con vLLM colocado (segun el autor).
- GPU para inferencia: el modelo es lo bastante pequeno para ejecutarse en GPUs consumer con VRAM suficiente (por ejemplo, RTX 4090, RTX 3090 o superiores), aunque no se han publicado mediciones oficiales.
- Opciones de despliegue: transformers, vLLM (usado en entrenamiento con la version 0.31.0), text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Wordle (30 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT-GRPO | 1.720.574.976 | no disponible | 20/30 victorias, 3 invalidas | no disponible | Hugging Face |
| Qwen3-1.7B-Wordle-SFT | 1.720.574.976 (heredado) | no disponible | 10/30 victorias, 41 invalidas | no disponible | Hugging Face |
| Qwen3-1.7B (base) | 1.720.574.976 | no disponible | 0/30 victorias, 24 invalidas | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables especializados en Wordle en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para Wordle dentro del entorno OpenEnv; su rendimiento en tareas generales de lenguaje no esta evaluado y probablemente se degrade respecto al Qwen3-1.7B original.
- Evaluacion limitada: los resultados provienen de una unica ejecucion sobre 30 palabras del mismo conjunto usado en entrenamiento, por lo que pueden no generalizar a otras listas de palabras.
- Licencia no disponible: la model card indica `licence: license` sin especificar terminos, lo que impide confirmar si el uso comercial esta permitido.
- Idiomas no verificados: no hay informacion sobre capacidades multilingues de este ajuste; el entrenamiento se realizo sobre un entorno en ingles.
- Riesgo de alucinacion: aunque el entorno penaliza jugadas invalidas, el modelo puede proponer palabras fuera de la lista o con formato incorrecto en contextos distintos al de entrenamiento.
- Dependencia del entorno: el comportamiento optimo requiere la herramienta `guess` y el feedback estructurado del entorno Wordle; fuera de ese contexto el modelo puede no funcionar como se espera.
- Sesgos: no se han documentado sesgos especificos para este ajuste, pero hereda los del modelo base Qwen3-1.7B, no analizados en la informacion disponible.
- Coste de entrenamiento bajo pero no trivial: aproximadamente 5,60 dolares y 2 horas 15 minutos en una A100 80 GB, lo que limita la reproducibilidad a quien tenga acceso a ese hardware o a Hugging Face Jobs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO
- Modelo base del ajuste: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Entorno Wordle de OpenEnv: https://huggingface.co/spaces/openenv/wordle
- Tutorial OpenEnv Wordle con GRPO: https://openenv.github.io/OpenEnv/main/tutorials/wordle-grpo
- Repositorio OpenEnv (script `grpo.py` y `evaluate.py`): https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Lista de palabras de evaluacion `secrets30.txt`: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
- Wordle Arena: https://huggingface.co/spaces/openenv/wordle-arena
- Curvas de entrenamiento en Trackio: https://huggingface.co/spaces/openenv/wordle-runs
