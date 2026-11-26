# openenv/Qwen3-1.7B-Wordle-SFT-GRPO

## Resumen

Qwen3-1.7B-Wordle-SFT-GRPO es un ajuste fino del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el proyecto openenv, especializado en jugar al Wordle dentro del entorno OpenEnv. El modelo parte de un calentamiento SFT (openenv/Qwen3-1.7B-Wordle-SFT) y se entrena posteriormente con GRPO mediante la librería TRL, aprendiendo a emitir una breve cadena de razonamiento antes de cada intento y a interactuar con el entorno a través de una herramienta `guess`.

El modelo resuelve un problema muy concreto: convertir un LLM generalista de 1.700 millones de parámetros en un agente capaz de jugar partidas completas de Wordle con reglas estrictas, retroalimentación parcial (verde, amarillo, gris) y restricciones de formato. Su relevancia radica en que es un ejemplo reproducible y documentado de entrenamiento con aprendizaje por refuerzo sobre entornos reales (OpenEnv + TRL + vLLM), con curvas de entrenamiento públicas y scripts liberados.

Arquitectura transformer densa heredada de Qwen3-1.7B, con 1.720.574.976 parámetros totales según los pesos en safetensors. El repositorio ocupa 141,1 GB, muy por encima de lo que correspondería a los pesos del modelo, lo que sugiere la inclusión de artefactos de entrenamiento (checkpoints, partidas registradas en `completions/`, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa `max_completion_length=4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible (la model card incluye `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-1.7B original. La arquitectura subyacente es un transformer denso de 1.720.574.976 parametros, sin mezcla de expertos. El entrenamiento se realiza en dos fases: primero un calentamiento SFT corto que produce openenv/Qwen3-1.7B-Wordle-SFT, y despues GRPO con TRL partiendo de ese modelo SFT.

La fase GRPO consta de 150 pasos con 4 prompts x 16 partidas por paso, modo thinking activado, learning rate constante de 1e-6, `max_completion_length=4096`, `vllm_importance_sampling_mode="token_truncate"` y vLLM colocado en el mismo nodo. La funcion de recompensa tiene tres terminos: una victoria que paga mas cuanto mas rapida sea (`1 + 0.5 * (1 - guesses / 6)`), credito parcial por el mejor intento en partidas perdidas (`0.1 * greens`) y `-0.1` por movimiento invalido. El entrenamiento se ejecuto en una A100 80GB mediante Hugging Face Jobs, con un coste de aproximadamente 2 horas 15 minutos y 5,60 USD. Las versiones de framework son TRL 1.16.0, OpenEnv 0.10.0, Transformers 5.20.2 y vLLM 0.31.0.

## Capacidades

- Generacion de texto conversacional con formato de chat (`conversational`).
- Razonamiento breve antes de cada accion (modo thinking), orientado a la resolucion de Wordle.
- Uso de herramientas (tool calling) mediante la herramienta `guess` del entorno OpenEnv Wordle.
- Juego completo de Wordle: propone palabras de cinco letras, interpreta retroalimentacion verde/amarillo/gris y ajusta las siguientes propuestas.
- Reduccion drastica de movimientos invalidos respecto al modelo base (3 frente a 24 en la evaluacion publicada).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Evaluacion de pipelines de RL para agentes: el modelo sirve como referencia reproducible para probar GRPO con TRL, vLLM y entornos OpenEnv, comparando curvas de entrenamiento publicas en Trackio.
- Investigacion en aprendizaje por refuerzo con recompensas compuestas: la funcion de recompensa (victoria rapida, credito parcial, penalizacion por movimiento invalido) es un ejemplo concreto para estudiar el efecto de cada termino.
- Desarrollo de agentes con tool calling en entornos restringidos: el modelo demuestra como un LLM pequeno puede aprender a emitir llamadas de herramienta validas y a corregir errores de formato.
- Benchmark de juego y planificacion: se puede usar como linea base en tareas de resolucion de restricciones con retroalimentacion parcial, comparando contra Qwen3-1.7B y el modelo SFT intermedio.
- Docencia y tutoriales: el tutorial de OpenEnv Wordle permite reproducir el pipeline completo (SFT, GRPO, evaluacion) con un coste de computo bajo (una A100 durante poco mas de dos horas).
- Pruebas de integracion con Text Generation Inference: el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que se puede desplegar en endpoints gestionados para demos interactivas del juego.
- Analisis de fallos en agentes: la carpeta `completions/` con todas las partidas registradas permite estudiar patrones de error, alucinaciones de formato y estrategias de adivinanza.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 30 palabras secretas (`secrets30.txt`), evaluacion greedy, un unico entrenamiento por modelo:

| Modelo | Victorias (30 palabras) | Intentos por victoria | Intentos invalidos |
|---|---|---|---|
| Qwen3-1.7B | 0/30 | - | 24 |
| Qwen3-1.7B-Wordle-SFT | 10/30 | 3,2 | 41 |
| Qwen3-1.7B-Wordle-SFT-GRPO (este modelo) | 20/30 | 4,1 | 3 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores corresponden a una sola ejecucion sobre las palabras del entorno de entrenamiento y deben interpretarse como tal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo denso de 1.720 millones de parametros, en fp16 se situaria en torno a 3,5 GB de pesos mas overhead de KV cache, y en cuantizaciones de 8 o 4 bits en torno a 2 GB o 1 GB respectivamente (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas para entrenamiento: A100 80GB, que es la utilizada por el autor (2 h 15 min, 5,60 USD).
- GPU para inferencia: al ser un modelo de 1,7B, cabe en GPUs de consumo como RTX 3060 12GB, RTX 4070, RTX 4090, siempre que se use la cuantizacion adecuada; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente) y vLLM (usado en el entrenamiento, version 0.31.0). Soporte de llama.cpp u Ollama: no disponible en la informacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Wordle (30 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT-GRPO | 1.720.574.976 | no disponible | 20/30 victorias, 4,1 intentos, 3 invalidos | no disponible | Hugging Face (openenv) |
| Qwen3-1.7B-Wordle-SFT | 1.720.574.976 (base) | no disponible | 10/30 victorias, 3,2 intentos, 41 invalidos | no disponible | Hugging Face (openenv) |
| Qwen3-1.7B | 1.720.574.976 (base) | no disponible | 0/30 victorias, 24 invalidos | no disponible en esta ficha (consultar el modelo original) | Hugging Face (Qwen) |

No se dispone de datos de otros modelos comparables especializados en Wordle en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en Wordle; su utilidad fuera de ese dominio es limitada y no se han evaluado capacidades generales tras el ajuste.
- Los resultados de benchmark provienen de una sola ejecucion sobre 30 palabras que coinciden con la lista usada en entrenamiento, por lo que pueden estar sesgados al alza respecto a palabras no vistas.
- La licencia no esta especificada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base Qwen3-1.7B y los terminos del repositorio.
- El tamano del repositorio (141,1 GB) incluye artefactos de entrenamiento y partidas registradas; la descarga completa es desproporcionada para el tamano del modelo.
- Riesgo de alucinacion y de movimientos invalidos: aunque se reducen a 3 en la evaluacion publicada, no desaparecen; en produccion conviene validar el formato de la herramienta `guess`.
- Idiomas soportados y comportamiento multilingue: no disponibles; el entrenamiento se centra en el vocabulario ingles de Wordle.
- Longitud de contexto efectiva del modelo ajustado: no disponible; el entrenamiento limita las completions a 4096 tokens.
- No se han publicado evaluaciones de sesgos ni de robustez fuera del entorno de juego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT-GRPO
- Modelo base SFT: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT
- Modelo original: https://huggingface.co/Qwen/Qwen3-1.7B
- Entorno Wordle en Hugging Face Spaces: https://huggingface.co/spaces/openenv/wordle
- Wordle Arena: https://huggingface.co/spaces/openenv/wordle-arena
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/wordle-runs
- Tutorial OpenEnv Wordle + GRPO: https://openenv.github.io/OpenEnv/main/tutorials/wordle-grpo
- Script de entrenamiento y evaluacion: https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Lista de palabras de evaluacion: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
