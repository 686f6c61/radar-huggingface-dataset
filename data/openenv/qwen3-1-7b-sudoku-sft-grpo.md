# openenv/Qwen3-1.7B-Sudoku-SFT-GRPO

## Resumen

Qwen3-1.7B-Sudoku-SFT-GRPO es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el equipo de OpenEnv para resolver sudokus mediante interacción con herramientas. El modelo parte de un calentamiento supervisado (SFT) sobre el entorno Sudoku de OpenEnv y se refina después con GRPO (Group Relative Policy Optimization) usando la librería TRL. Su relevancia radica en que demuestra un pipeline completo de aprendizaje por refuerzo con entornos reales, pasando de un modelo base que no resuelve prácticamente ningún puzle a uno que resuelve 26 de 30 en el nivel de 16 celdas vacías.

Arquitectónicamente es un transformer denso de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), heredado de Qwen3-1.7B. El modelo no genera la solución completa de golpe: en cada llamada invoca una herramienta `place(row, col, number)` para rellenar una única celda, y antes de cada movimiento escribe un razonamiento breve con el modo thinking activado (384 tokens nuevos por movimiento). Esta combinación de razonamiento explícito y uso de herramientas lo convierte en un caso de estudio práctico para agentes que operan sobre entornos con estado.

El modelo se entrenó con 4 prompts y 16 partidas por paso, con una tasa de aprendizaje constante de 1e-6 y `max_completion_length=16384`, durante 75 pasos en una única A100 de 80 GB (unas 15 horas, 38 dólares). Los pesos publicados corresponden al paso 75 del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin concretar) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1,7 mil millones de parámetros que hereda la arquitectura de Qwen3-1.7B. El entrenamiento se realizó en dos fases: primero un ajuste supervisado (SFT) sobre el entorno Sudoku de OpenEnv, que dio lugar al modelo `openenv/Qwen3-1.7B-Sudoku-SFT`; después, un refinamiento con GRPO mediante TRL 1.16.0. El entrenamiento GRPO usó `environment_factory` contra el entorno configurado con 55 pistas (unas 26 celdas vacías), con 4 prompts y 16 partidas por paso, thinking activado, tasa de aprendizaje constante de 1e-6, `max_completion_length=16384`, `vllm_importance_sampling_mode="token_truncate"` y vLLM colocado. Se definieron dos recompensas: 1 si el puzle se resuelve, más la fracción de celdas vacías rellenadas.

La innovación principal no está en la arquitectura, sino en el pipeline de entrenamiento: el modelo aprende a interactuar con un entorno con estado a través de una herramienta (`place(row, col, number)`), escribiendo un razonamiento breve antes de cada movimiento. El entrenamiento se ejecutó en una A100 80GB mediante Hugging Face Jobs durante unas 15 horas y los pesos publicados corresponden al paso 75. Cabe señalar una incidencia documentada: el Space cerró sus WebSockets aproximadamente cada 2 horas durante la ejecución y el cliente de OpenEnv reconectó a una nueva sesión en mitad de algunas partidas, por lo que los pasos 26, 74 y 75 se entrenaron parcialmente con partidas corruptas. El script de ejemplo ya abre una nueva conexión por partida.

## Capacidades

- Generación de texto y razonamiento breve antes de cada movimiento (modo thinking, 384 tokens nuevos por movimiento en la configuración de evaluación).
- Uso de herramientas (tool calling) mediante la función `place(row, col, number)` para rellenar una celda por llamada.
- Razonamiento multi-paso con estado: mantiene el estado del tablero a lo largo de la partida y planifica movimientos sucesivos.
- Resolución de sudokus: 26/30 resueltos con 16 celdas vacías y 22/30 con 26 celdas vacías en evaluación greedy.
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidades especiales: modo thinking integrado; no se documentan visión ni audio.

## Casos de uso

- Evaluación de pipelines de RL con entornos reales: sirve como referencia reproducible para validar un flujo SFT + GRPO con TRL, OpenEnv y vLLM, comparando curvas de recompensa y tasas de resolución.
- Investigación en agentes con tool calling: el modelo ilustra cómo un LLM aprende a invocar una herramienta con estado (`place`) y a razonar antes de cada acción, útil para estudiar políticas de decisión secuencial.
- Generación de datos de razonamiento para sudoku: las partidas registradas en la carpeta `completions/` pueden reutilizarse como datos de entrenamiento o para análisis de errores.
- Benchmark de razonamiento estructurado: los puzles de 16 y 26 celdas vacías (`puzzles_c65.json`, `puzzles_c55.json`) ofrecen una tarea determinista y verificable para medir capacidad de planificación.
- Docencia y divulgación: el tutorial de OpenEnv sobre sudoku con GRPO permite explicar de forma práctica el ajuste por refuerzo con recompensas compuestas.
- Prototipado de asistentes de resolución de restricciones: el patrón de razonamiento + llamada a herramienta es trasladable a otros dominios con estado (planificación, logística, juegos de tablero).

## Benchmarks y rendimiento

Evaluación greedy sobre los mismos 30 puzles por nivel. Los modelos entrenados juegan con thinking activado (384 tokens nuevos por movimiento); el modelo base, sin thinking, porque con thinking no termina el razonamiento dentro de ese presupuesto y nunca realiza un movimiento.

| Modelo | 16 celdas vacías: resueltos | Celdas rellenadas | 26 celdas vacías: resueltos | Celdas rellenadas |
|---|---|---|---|---|
| Qwen3-1.7B | 0/30 | 1,9 % | 0/30 | 0,1 % |
| Qwen3-1.7B-Sudoku-SFT | 19/30 | 79,1 % | 10/30 | 55,8 % |
| Qwen3-1.7B-Sudoku-SFT-GRPO (este modelo) | 26/30 | 87,5 % | 22/30 | 83,2 % |

Cada modelo se entrenó una sola vez, por lo que los autores recomiendan tratar las cifras como una única ejecución. Un dígito que no es la solución de su celda se rechaza, y dos movimientos rechazados consecutivos terminan la partida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,72 mil millones de parámetros, en fp16 requiere aproximadamente 3,5 GB de pesos más memoria para el contexto y la caché KV, y en cuantizaciones de 8 o 4 bits se reduce sustancialmente (valores no publicados por el autor).
- GPU recomendadas: el entrenamiento se realizó en una A100 80GB; para inferencia basta con GPUs de gama media, aunque el autor no publica requisitos.
- GPU de consumo: por tamaño, es probable que quepa en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan vLLM, llama.cpp ni Ollama para inferencia, aunque vLLM se usó durante el entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Sudoku 16 vacías | Sudoku 26 vacías | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7 B | no disponible | 0/30 | 0/30 | no disponible |
| Qwen3-1.7B-Sudoku-SFT | 1,7 B | no disponible | 19/30 | 10/30 | no disponible |
| Qwen3-1.7B-Sudoku-SFT-GRPO | 1,7 B | no disponible | 26/30 | 22/30 | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (LLM pequeños especializados en sudoku mediante RL) en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para el entorno Sudoku de OpenEnv y no se documentan capacidades generales de conversación o código.
- Dependencia del modo thinking: con 384 tokens nuevos por movimiento, el modelo base no termina el razonamiento y nunca se mueve; el rendimiento del modelo ajustado está ligado a ese presupuesto.
- Reglas estrictas del entorno: un dígito incorrecto se rechaza y dos rechazos consecutivos terminan la partida, lo que penaliza la exploración.
- Entrenamiento parcialmente contaminado: los pasos 26, 74 y 75 se entrenaron en parte con partidas corruptas por reconexiones de WebSocket, según reconoce el autor.
- Una sola ejecución de entrenamiento: las cifras de benchmarks deben interpretarse con cautela estadística.
- Licencia no disponible: no se concreta la licencia, por lo que el uso comercial no puede verificarse.
- Idiomas y sesgos: no documentados.
- Riesgo de alucinación: no evaluado en la información disponible; el dominio es determinista y verificable, lo que limita su impacto en este caso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT-GRPO
- Modelo base SFT: https://huggingface.co/openenv/Qwen3-1.7B-Sudoku-SFT
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Entorno Sudoku en Hugging Face Spaces: https://huggingface.co/spaces/openenv/sudoku
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/openenv/sudoku-runs
- Tutorial de OpenEnv sobre sudoku con GRPO: https://openenv.github.io/OpenEnv/main/tutorials/sudoku-grpo
- Repositorio OpenEnv (ejemplos de sudoku, script `grpo.py` y `evaluate.py`): https://github.com/openenv/OpenEnv/tree/main/examples/sudoku
