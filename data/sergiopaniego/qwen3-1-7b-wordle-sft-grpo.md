# sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO

## Resumen

Qwen3-1.7B-Wordle-SFT-GRPO es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por sergiopaniego, especializado en jugar a Wordle dentro del entorno OpenEnv. El modelo parte de un calentamiento SFT (openenv/Qwen3-1.7B-Wordle-SFT) y se entrena posteriormente con GRPO (Group Relative Policy Optimization) mediante la librería TRL, con el objetivo de aprender una política de juego eficiente a través de recompensas por victoria, rapidez y validez de las conjeturas.

El modelo resuelve un problema concreto: dotar a un LLM pequeño (1.700 millones de parámetros) de la capacidad de interactuar de forma estructurada con un entorno de juego mediante tool calling, emitiendo razonamientos breves antes de cada intento. Es relevante como ejemplo reproducible de un pipeline completo de RL con entornos (OpenEnv + TRL + vLLM) ejecutado en infraestructura accesible (una A100 80 GB durante unas 2 horas y 15 minutos, con un coste aproximado de 5,60 dólares).

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso con modo de razonamiento (thinking), y el modelo se distribuye en formato safetensors con licencia no disponible. Su interés principal es demostrativo y de investigación: muestra cómo el RL con recompensas verificables puede mejorar sustancialmente el rendimiento de un modelo pequeño en una tarea acotada (de 0/30 a 20/30 victorias en la evaluación codiciosa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con modo thinking |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros. Sobre esa base se aplicó primero un ajuste supervisado breve (SFT) que dio lugar a openenv/Qwen3-1.7B-Wordle-SFT, y después un entrenamiento con GRPO mediante TRL 1.16.0, partiendo del modelo SFT. El entrenamiento consistió en 150 pasos con 4 prompts x 16 partidas por paso, modo thinking activado, tasa de aprendizaje constante de 1e-6 y `max_completion_length=4096`, con vLLM colocado y `vllm_importance_sampling_mode="token_truncate"`.

La función de recompensa tiene tres términos: una victoria que paga más cuanto más rápida sea (`1 + 0.5 * (1 - guesses / 6)`), crédito parcial por la mejor conjetura de una partida perdida (`0.1 * greens`) y una penalización de `-0.1` por movimiento inválido. El modelo interactúa con el entorno OpenEnv Wordle a través de una herramienta `guess` y escribe un razonamiento breve antes de cada intento. El entrenamiento se ejecutó en una A100 80 GB mediante Hugging Face Jobs, con un coste aproximado de 5,60 dólares, y las curvas están registradas en Trackio. La carpeta `completions/` del repositorio contiene todas las partidas registradas.

## Capacidades

- Generación de texto con razonamiento breve (thinking) antes de cada acción.
- Tool calling: emite llamadas a la herramienta `guess` con la palabra propuesta.
- Juego de Wordle en el entorno OpenEnv: 20/30 victorias en evaluación codiciosa sobre las 30 palabras de `secrets30.txt`.
- Reducción drástica de movimientos inválidos: 3 frente a 24 del Qwen3-1.7B base y 41 del modelo SFT.
- Interacción multi-turno con un entorno externo (observaciones tras cada conjetura).
- Capacidades multilingües: no disponibles (no confirmadas para este ajuste).
- Capacidades de visión o audio: no disponibles (no se mencionan).

## Casos de uso

- Investigación en RL con recompensas verificables: el modelo sirve como referencia reproducible para estudiar cómo GRPO mejora políticas de juego en modelos pequeños, con curvas de entrenamiento públicas en Trackio y partidas registradas en `completions/`.
- Evaluación de entornos OpenEnv: permite validar el entorno Wordle y el pipeline de `evaluate.py` con un modelo ya entrenado, comparando resultados con el modelo base y el SFT.
- Demostración de tool calling estructurado: útil para probar integraciones de function calling donde el modelo debe emitir llamadas válidas a una herramienta concreta y razonar antes de actuar.
- Benchmark de eficiencia de entrenamiento: con 150 pasos, 4 prompts x 16 partidas y unas 2 horas 15 minutos en una A100 80 GB, sirve para estimar costes de pipelines GRPO similares.
- Docencia y tutoriales: el tutorial de OpenEnv sobre Wordle con GRPO utiliza este flujo completo, y el modelo entrenado puede emplearse como resultado final de referencia.
- Comparación de estrategias de decodificación: al evaluarse con decodificación codiciosa y modo thinking, permite estudiar el efecto del razonamiento previo en la tasa de acierto y en el número de intentos por victoria.
- Pruebas de robustez de agentes: la métrica de movimientos inválidos (3 frente a 24 del base) permite analizar la adherencia del modelo al formato de acción exigido por el entorno.

## Benchmarks y rendimiento

| Modelo | Victorias sobre 30 palabras (greedy) | Intentos por victoria | Movimientos invalidos |
|---|---|---|---|
| Qwen3-1.7B | 0/30 | - | 24 |
| Qwen3-1.7B-Wordle-SFT | 10/30 | 3,2 | 41 |
| Qwen3-1.7B-Wordle-SFT-GRPO (este modelo) | 20/30 | 4,1 | 3 |

Las 30 palabras provienen de los 156 sustantivos de los que TextArena extrae sus secretos, la misma lista usada en entrenamiento, y cada modelo se entrenó una sola vez. El autor advierte que deben interpretarse como una única ejecución sobre las palabras de este entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.720.574.976 parámetros, en precisión completa (bf16/fp16) se requieren aproximadamente 3,4 GB solo para los pesos, más memoria para el contexto y el modo thinking.
- GPU recomendadas: no especificadas para inferencia; el entrenamiento se realizó en una A100 80 GB.
- GPU de consumo: no confirmado; por tamaño, un modelo de 1,7 B en bf16 es compatible con GPUs de consumo con suficiente VRAM (por ejemplo, 8 GB o más), aunque no hay validación publicada en la información disponible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles (según los tags del repositorio); vLLM 0.31.0 se usó durante el entrenamiento. No se mencionan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Victorias (30 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT-GRPO | 1.720.574.976 | no disponible | 20/30 | no disponible | Hugging Face (sergiopaniego) |
| Qwen3-1.7B-Wordle-SFT | no disponible | no disponible | 10/30 | no disponible | Hugging Face (openenv) |
| Qwen3-1.7B | 1.700 millones (aprox.) | no disponible | 0/30 | no disponible | Hugging Face (Qwen) |

Los tres modelos comparten la misma base Qwen3-1.7B y se evalúan sobre el mismo conjunto de 30 palabras, por lo que la comparación es directa en la tarea de Wordle. No se dispone de datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este ajuste.

## Limitaciones y advertencias

- Los resultados (20/30 victorias, 4,1 intentos por victoria) provienen de una única ejecución sobre las 30 palabras del entorno, que además coinciden con la lista usada en entrenamiento; no hay garantía de generalización a otras listas de palabras.
- El modelo está especializado en Wordle y no se han publicado evaluaciones de capacidades generales; su uso fuera del entorno puede degradar el rendimiento respecto al Qwen3-1.7B original.
- Riesgo de alucinación y de movimientos inválidos: aunque los inválidos se reducen a 3, no desaparecen, y el modelo puede proponer palabras fuera del diccionario o del formato esperado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia no disponible: la model card indica "licence: license" sin especificar términos, por lo que no se puede confirmar el uso comercial; debe consultarse el repositorio antes de cualquier despliegue en producción.
- Idiomas soportados no confirmados; el ajuste se realizó en el contexto de un juego en inglés.
- El modelo requiere un entorno compatible con la herramienta `guess` y el formato de OpenEnv Wordle; no es un modelo de propósito general listo para producción sin adaptación.
- El tamaño del repositorio (141,1 GB) es notablemente superior al de los pesos del modelo, probablemente por artefactos de entrenamiento y partidas registradas; conviene revisar el contenido antes de descargarlo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO
- Modelo base SFT: https://huggingface.co/openenv/Qwen3-1.7B-Wordle-SFT
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Entorno OpenEnv Wordle: https://huggingface.co/spaces/openenv/wordle
- Tutorial OpenEnv Wordle con GRPO: https://huggingface.co/docs/openenv/tutorials/wordle-grpo
- Wordle Arena: https://huggingface.co/spaces/openenv/wordle-arena
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/wordle-runs
- Script de entrenamiento GRPO: https://github.com/openenv/OpenEnv/tree/main/examples/wordle
- Lista de palabras de evaluación: https://github.com/openenv/OpenEnv/blob/main/examples/wordle/secrets30.txt
