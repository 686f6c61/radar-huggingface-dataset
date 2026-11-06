# CivMarshmallow/CivMarshmallow-Qwen3-8B

## Resumen

CivMarshmallow-Qwen3-8B es una familia de políticas para el juego de estrategia Freeciv, obtenidas mediante ajuste por refuerzo (RL) sobre el modelo base Qwen/Qwen3-8B. El desarrollo corre a cargo del usuario CivMarshmallow y la receta de entrenamiento se describe en el artículo *Rome Wasn't Built in One Turn: Replay-Grounded Reward Signals for Long-Horizon Freeciv Agents*. No se trata de un modelo de propósito general, sino de un conjunto de checkpoints especializados en actuar como agente jugador dentro de Freeciv, con la generación de pensamiento (thinking) desactivada.

El modelo emplea la arquitectura transformer densa de Qwen3-8B (8.000 millones de parámetros) como base y la especializa mediante RL en cuatro fases de entrenamiento (rem20, rem40, rem80 y rem120), donde el sufijo remN indica el número de turnos restantes en una partida de 120 turnos. Cada fase arranca desde el checkpoint final de la anterior, lo que permite un entrenamiento progresivo de horizontes cortos a largos.

La relevancia de esta publicación radica en su enfoque de recompensa: utiliza CivTelescope, un juez entrenado sobre resultados de partidas reproducidas, como recompensa densa, y combina recompensas híbridas (scoreboard, sparse y CivTelescope) en distintas configuraciones. El repositorio incluye múltiples semillas y ablaciones, lo que lo convierte en un recurso útil para investigación en agentes de largo horizonte y aprendizaje por refuerzo con señales de recompensa aprendidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), ajustado con RL; thinking desactivado |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer denso de 8.000 millones de parámetros, utilizado aquí con el modo de razonamiento (thinking) desactivado. Sobre esa base se aplica un entrenamiento por refuerzo en cuatro fases consecutivas: rem20, rem40, rem80 y rem120, donde remN denota los N turnos restantes de una partida de 120 turnos. Cada fase parte del checkpoint final de la fase previa, de modo que el agente aprende primero horizontes cortos y luego los extiende hasta partidas completas.

La señal de recompensa se construye con CivTelescope, un juez entrenado sobre resultados de partidas reproducidas que actúa como recompensa densa. Para las partidas completas (rem120) se emplean recompensas híbridas: una recompensa base (scoreboard o sparse) al principio de la partida y CivTelescope en la parte final. El repositorio organiza los checkpoints por configuración de recompensa, fase y semilla, e incluye ablaciones como la inversión del orden híbrido (CivTelescope → sparse) y un calendario de tres tramos (scoreboard → CivTelescope → sparse). No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las partidas de Freeciv.

## Capacidades

- Actuación como agente jugador de Freeciv: genera acciones de juego turno a turno a partir del estado de la partida.
- Planificación a largo horizonte: entrenado específicamente para partidas de hasta 120 turnos.
- Razonamiento orientado a objetivos de juego (expansión, puntuación terminal) mediante RL con recompensa densa aprendida.
- Operación con thinking desactivado, lo que reduce la latencia de generación por acción.
- Idiomas: únicamente inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni razonamiento multilingüe.

## Casos de uso

- Investigación en RL para agentes de largo horizonte: el repositorio ofrece checkpoints por fase y semilla, lo que permite reproducir y comparar curvas de aprendizaje en Freeciv con recompensas sparse, scoreboard y CivTelescope.
- Evaluación de recompensas aprendidas (reward models): CivTelescope puede estudiarse como juez denso frente a recompensas heurísticas, usando las ablaciones publicadas (CivTelescope → sparse, scoreboard → CivTelescope → sparse).
- Benchmarking de agentes de juego: las políticas sirven como referencia para medir la ganancia de fase G en conjuntos de evaluación de 45 posiciones.
- Estudio de entrenamiento curricular: la progresión rem20 → rem40 → rem80 → rem120 es un caso concreto para analizar cómo se extiende el horizonte de planificación en RL.
- Reproducción de experimentos: el script `scripts/eval_policy.sh` del repositorio de código permite lanzar partidas de evaluación con un checkpoint concreto y una fase determinada.
- Generación de datos de juego: las trayectorias producidas por estas políticas pueden emplearse para entrenar o validar otros agentes y jueces dentro de Freeciv.

## Benchmarks y rendimiento

La model card reporta la ganancia de fase en evaluación (G), definida como el cambio en la puntuación terminal media sobre el conjunto de evaluación de 45 posiciones de cada fase, promediada sobre tres semillas:

| Recompensa | rem20 | rem40 | rem80 | rem120 |
|---|---|---|---|---|
| sparse (baseline) | 0.53 | 7.11 | 5.04 | 2.87 |
| scoreboard (baseline) | 2.72 | 3.68 | 0.83 | 4.87 |
| CivTelescope | 0.62 | 3.61 | 8.94 | 2.77 |
| scoreboard → CivTelescope | – | – | – | 5.21 |
| sparse → CivTelescope | – | – | – | 5.15 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- El modelo base tiene 8.000 millones de parámetros; en bfloat16 requiere aproximadamente 16 GB solo para los pesos, más memoria para el estado de inferencia y el contexto de la partida.
- El tamaño del repositorio es de 376,8 GB porque contiene múltiples checkpoints (configuraciones de recompensa, fases y semillas); conviene descargar únicamente el subdirectorio necesario con `hf download --include`.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) es el rango habitual para un modelo de 8B en bfloat16.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI) ni cuantizaciones GGUF publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CivMarshmallow-Qwen3-8B | 8.000 M | no disponible | Agente RL para Freeciv | apache-2.0 | Hugging Face (múltiples checkpoints) |
| Qwen/Qwen3-8B (base) | 8.000 M | no disponible en esta ficha | Modelo generalista | apache-2.0 | Hugging Face |
| CivMarshmallow/Baselines-Qwen3-8B | 8.000 M | no disponible | Baselines RL con el mismo calendario | no disponible | Hugging Face |

No se dispone en la información proporcionada de otros modelos comparables de agentes RL para Freeciv.

## Limitaciones y advertencias

- Modelo altamente especializado: su uso previsto es jugar a Freeciv; no debe emplearse como modelo de propósito general ni para tareas de texto abiertas.
- Idiomas: solo inglés según la model card.
- No se documentan sesgos específicos; al derivar de Qwen3-8B, puede heredar sesgos del modelo base.
- Riesgo de alucinación y de acciones inválidas fuera del entorno de juego: las políticas están entrenadas para el espacio de acciones de Freeciv.
- El modo thinking está desactivado, lo que limita el razonamiento explícito paso a paso.
- Licencia apache-2.0, que permite uso comercial, pero el valor práctico del modelo fuera de la investigación en agentes de juego es muy limitado.
- El repositorio es muy grande (376,8 GB); es necesario descargar selectivamente los subdirectorios para evitar consumos de almacenamiento y ancho de banda elevados.
- No se publican detalles sobre contexto máximo, cuantizaciones ni latencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CivMarshmallow/CivMarshmallow-Qwen3-8B
- Código: https://github.com/jamesnulliu/CivMarshmallow
- Juez CivTelescope: https://huggingface.co/CivMarshmallow/CivTelescope
- Baselines: https://huggingface.co/CivMarshmallow/Baselines-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
