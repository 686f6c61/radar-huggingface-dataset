# mcemri/commenv-task-docs-seed2

## Resumen

`mcemri/commenv-task-docs-seed2` es un checkpoint de investigación publicado en Hugging Face por el usuario mcemri. Consiste en Qwen3-4B afinado con aprendizaje por refuerzo (GRPO) durante 30 pasos para operar como un equipo de tres agentes que colaboran resolviendo preguntas de respuesta multi-salto sobre documentos divididos. Cada uno de los tres agentes recibe tres de nueve párrafos de Wikipedia y debe comunicarse con los otros mediante un tablero compartido durante un máximo de seis turnos para llegar a la respuesta correcta. El modelo base es Qwen/Qwen3-4B, de 4 mil millones de parámetros y licencia Apache-2.0.

Se trata de la segunda semilla (`trainer.seed=43`) del mismo experimento que `mcemri/commenv-task-docs`, y su interés es fundamentalmente metodológico: evalúa la reproducibilidad de las ganancias obtenidas con RL en tareas de comunicación multi-agente. Los datos de entrenamiento provienen de las particiones de entrenamiento de HotpotQA y MuSiQue. El autor lo describe explícitamente como "checkpoints de investigación, no un producto".

El checkpoint incluye los pesos en formato Transformers (safetensors, 8,8 GB) y el estado completo del entrenador (22,5 GB en 4 shards) para poder reanudar el entrenamiento. No se proporcionan datos sobre idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y checkpoint del entrenador en 4 shards |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) durante 30 pasos, partiendo del modelo sin entrenar. El escenario de entrenamiento es un entorno de comunicación multi-agente: tres copias del modelo reciben nueve párrafos de Wikipedia repartidos en tercios (tres párrafos por agente) y deben responder preguntas cuyos párrafos relevantes están distribuidos entre agentes distintos. La interacción se produce a través de un tablero compartido con un límite de seis turnos, y cada agente debe emitir su propia respuesta final.

Los datos de entrenamiento proceden de las particiones de entrenamiento de HotpotQA y MuSiQue, dos conjuntos de referencia para razonamiento multi-salto. El objetivo del experimento es verificar si las ganancias observadas en la primera semilla se replican con una semilla distinta (`trainer.seed=43`). Los resultados indican que las mejoras en las tareas entrenadas se reproducen, pero las ganancias en tareas no entrenadas no se mantienen en esta segunda semilla. No se detalla la composición exacta del dataset ni el número total de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento multi-salto sobre documentos fragmentados.
- Comunicación multi-agente: los agentes intercambian información mediante un tablero compartido durante hasta seis turnos.
- Respuesta colaborativa: cada agente emite una respuesta final tras la deliberación.
- Razonamiento sobre preguntas de HotpotQA y MuSiQue (entrenado específicamente en esas tareas).
- Capacidades heredadas de Qwen3-4B (generación general, código, matemáticas), aunque no se documentan en la model card para este checkpoint.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en esta ficha.

## Casos de uso

- Investigación en aprendizaje por refuerzo multi-agente: el checkpoint permite reproducir y extender el experimento de comunicación entre agentes con GRPO, comparando semillas y analizando la varianza de los resultados.
- Estudio de reproducibilidad en RL: sirve para contrastar si las ganancias de un entrenamiento RL se mantienen con otra semilla, un problema relevante en la literatura de RL para LLMs.
- Evaluación de protocolos de comunicación: el tablero compartido con límite de seis turnos es un banco de pruebas para diseñar y medir mecanismos de intercambio de información entre agentes.
- Punto de partida para fine-tuning adicional: al incluir el estado del entrenador (optimizador incluido), se puede reanudar el entrenamiento y explorar variantes del entorno o de la recompensa.
- Análisis de razonamiento multi-salto distribuido: útil para estudiar cómo se reparte la información entre agentes cuando ningún agente individual tiene todos los párrafos necesarios.
- Docencia y divulgación: ejemplo concreto y reproducible de un pipeline GRPO aplicado a un entorno de colaboración, con código de carga sencillo vía Transformers.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 400 preguntas reservadas de cada conjunto (agentes con la respuesta correcta jugando en equipo):

| Tarea | Antes del entrenamiento | Despues (seed 2) | Primera semilla (referencia) |
|---|---|---|---|
| HotpotQA | 43% | 53% | 55% |
| MuSiQue | 28% | 34% | 37% |
| HiddenBench (decisiones de grupo) | 34% | 37% | 45% |
| Busqueda en Wikipedia | 36% | 38% | 41% |

Las ganancias en las tareas entrenadas (HotpotQA y MuSiQue) se replican con la segunda semilla, mientras que las mejoras en tareas no entrenadas (HiddenBench y búsqueda en Wikipedia) no se reproducen. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 8-9 GB para los pesos de 4 mil millones de parámetros, más overhead de activaciones y contexto.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12 GB o más si se aplica cuantización (aunque no se publican variantes cuantizadas).
- Opciones de despliegue: Transformers (carga documentada en la model card), vLLM, TGI y llama.cpp son compatibles con el formato safetensors de Qwen3-4B, aunque no se han publicado pesos GGUF específicos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mcemri/commenv-task-docs-seed2 | 4B | no disponible | Apache-2.0 | Qwen3-4B + GRPO multi-agente (checkpoint de investigación) |
| Qwen/Qwen3-4B | 4B | no disponible | Apache-2.0 | Modelo base generalista |
| mcemri/commenv-task-docs | 4B | no disponible | Apache-2.0 | Misma configuración, primera semilla |

La comparación directa con modelos de propósito general no es significativa: este checkpoint está especializado en un entorno experimental concreto y no se han publicado métricas estándar que permitan situarlo frente a alternativas generalistas.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el autor lo declara explícitamente y no está pensado para uso en producción.
- Entrenado solo 30 pasos con GRPO: el ajuste es limitado y las capacidades generales pueden degradarse respecto al modelo base.
- Especializado en HotpotQA y MuSiQue: el rendimiento fuera de ese dominio no está evaluado.
- Las ganancias en tareas no entrenadas no se reproducen con esta semilla, lo que limita las conclusiones sobre generalización.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgos; hereda los del modelo base Qwen3-4B.
- Idiomas soportados: no disponibles; el entrenamiento se realizó sobre datasets en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un checkpoint de investigación su idoneidad para producción no está validada.
- El repositorio incluye el estado del entrenador (22,5 GB), lo que infla el tamaño total a 33 GB; para inferencia solo es necesario el subdirectorio `export/global_step_30/policy`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-docs-seed2
- Primera semilla del experimento: https://huggingface.co/mcemri/commenv-task-docs
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
