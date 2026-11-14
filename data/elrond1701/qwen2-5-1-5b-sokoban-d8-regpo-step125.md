# Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo-step125

## Resumen

Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo-step125 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct mediante aprendizaje por refuerzo multi-turno sobre el entorno textual Sokoban. El modelo resuelve un problema muy concreto: la planificación de acciones en un juego de empuje de cajas de 6x6 con 2 cajas, donde el agente debe emitir secuencias de hasta 2 movimientos por turno en un máximo de 10 turnos (20 movimientos totales). No es un modelo de propósito general, sino un artefacto de investigación que demuestra la eficacia del algoritmo RegPO (regret tree GRPO) frente a variantes como GRPO, GiGPO o Tree-GRPO.

El checkpoint corresponde al paso 125 de un entrenamiento que utiliza la técnica RegPO, que combina un término de paso de GiGPO, un término de Tree-GRPO y un término de arrepentimiento (regret) derivado del árbol de ramificación, con pesos 1.0/1.0/1.0. El modelo se inicializó a partir del checkpoint de paso 50 del modelo GRPO (con semilla de entorno 50 desde el paso 51). La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.777 millones de parámetros con licencia Apache 2.0.

La relevancia de este checkpoint es doble: por un lado, sirve como referencia reproducibilidad para comparar algoritmos de RL multi-turno en tareas de planificación; por otro, su rendimiento (32,6% de tasa de victoria) supera al de Tree-GRPO en el mismo paso (21,0%) y se acerca al de RegPO en el paso 150 (35,2%), lo que sugiere una convergencia más rápida del algoritmo RegPO. No obstante, su ámbito de aplicación está estrictamente limitado al dominio Sokoban y su uso fuera de él no está validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el prompt de entrenamiento limita a 3072 tokens y la respuesta a 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bf16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.777 millones de parámetros. Sobre esta base se aplica un ajuste fino con RL multi-turno usando el framework verl 0.6.1 junto con verl-agent para el bucle de agente multi-turno y vLLM para los rollouts. El algoritmo RegPO (regret tree GRPO) combina tres términos: el término de paso de GiGPO, el término de Tree-GRPO y un término de arrepentimiento calculado a partir del árbol de ramificación, con pesos 1.0/1.0/1.0 y un estimador de arrepentimiento posterior con centrado en `available_range`. La ramificación es idéntica a la de Tree-GRPO. El modelo se inicializó desde el checkpoint de paso 50 del modelo GRPO (semilla de entorno 50 desde el paso 51).

El entrenamiento se realizó sobre el entorno Sokoban textual con las siguientes características: habitación de 6x6, 2 cajas, profundidad de búsqueda 8 para la generación de habitaciones, 10 turnos por episodio y hasta 2 movimientos por turno (20 movimientos en total). La observación sigue el estilo RAGEN: una rejilla simbólica más coordenadas indexadas desde cero del jugador, las cajas y los objetivos, con historial de los últimos 2 turnos y sin modo thinking (el turno del asistente se prellena con `<answer>`). La recompensa es la de gym-sokoban: -0,1 por movimiento, +1 por caja sobre objetivo, -1 por caja fuera de objetivo y +10 por resolver. La optimización usa PPO con mini-batch de 256, learning rate 1e-6, pérdida KL de 0,05, clip 0,2/0,2, agregación de pérdida por media de tokens, sin bonus de entropía, máximo 512 tokens de respuesta y 3072 de prompt. Los pesos se convierten desde el checkpoint FSDP en fp32 a bf16 safetensors, que es también la precisión usada por vLLM para todos los rollouts y evaluaciones.

## Capacidades

- Generación de texto y razonamiento específico para el dominio Sokoban: el modelo emite secuencias de acciones (`Up`, `Down`, `Left`, `Right`) separadas por ` || ` dentro de etiquetas `<answer>...</answer>`.
- Planificación multi-turno: gestiona hasta 10 turnos con 2 acciones por turno, manteniendo el estado del juego a partir de la rejilla y las coordenadas proporcionadas.
- Formato estricto: el texto después de `</answer>` o más de 2 movimientos invalida el turno (sin movimiento y penalización de -0,5).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes generales ni razonamiento multi-paso fuera del dominio Sokoban.
- Capacidades multilingües: no disponibles en la información proporcionada (el prompt de entrenamiento está en inglés).
- No dispone de modo thinking (el turno del asistente se prellena con `<answer>`).
- No tiene capacidades de visión ni audio.

## Casos de uso

- Evaluación comparativa de algoritmos de RL multi-turno: sirve como checkpoint de referencia para medir la convergencia de RegPO frente a GRPO, GiGPO y Tree-GRPO en el mismo entorno y con las mismas semillas, gracias a que se publican resultados con 3 semillas de muestreo sobre 512 puzzles fijos.
- Investigación en planificación con modelos de lenguaje: permite estudiar cómo un modelo de 1.5B parámetros aprende a descomponer una tarea de planificación (empujar cajas) en secuencias de acciones válidas, con un formato de salida estricto y recompensas densas.
- Reproducibilidad de experimentos: al estar entrenado con verl 0.6.1 y verl-agent, se puede replicar el pipeline de entrenamiento y evaluar el efecto de variaciones en el algoritmo (por ejemplo, cambiar los pesos de los términos de RegPO).
- Generación de datos sintéticos para Sokoban: el modelo puede generar trayectorias de solución (o intentos) que sirvan como datos de entrenamiento para otros agentes o para análisis de errores.
- Análisis de robustez ante formato: útil para estudiar la tasa de cumplimiento del formato `<answer>...</answer>` y el efecto de la temperatura de muestreo (0,4 en las evaluaciones) en la validez de las acciones.
- Benchmark de eficiencia de RL: al ser un modelo pequeño (1.777M parámetros) y con pesos en bf16, se puede ejecutar en una sola GPU consumer para comparar curvas de aprendizaje y coste computacional entre algoritmos.
- Estudio de sesgos de recompensa: permite analizar cómo el modelo aprende a priorizar la recompensa +10 (resolver) frente a la +1 (empujar caja a objetivo), y si desarrolla comportamientos degenerados (por ejemplo, movimientos repetidos para evitar penalizaciones).

## Benchmarks y rendimiento

Los resultados se evaluaron sobre 512 puzzles fijos de profundidad 8, con temperatura de muestreo 0,4 y tres semillas de vLLM (0, 1, 2); se reporta la media ± desviación estándar muestral entre semillas. La tasa de victoria es la fracción de partidas resueltas (recompensa +10). La columna "+1" es el número de veces que una caja se empujó sobre un objetivo (recompensa +1), contado por el entorno. La columna "+10 moves / all +1 moves" es el porcentaje de movimientos +1 que forman parte de una partida resuelta; "+10 given a +1" es la probabilidad de resolver dado que se produjo al menos un +1.

| Modelo | Tasa de victoria | Resueltos (de 512) | +1 total | +10 moves / all +1 moves | +10 given a +1 | Recompensa / partida |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct sin entrenar | 12,6 ± 0,2% | 64,3 | 371 ± 19 | 17,4% | 21,3% | 0,06 |
| GRPO, paso 150 | 16,0 ± 0,8% | 82,0 | 397 ± 14 | 20,6% | 26,1% | 1,35 |
| GiGPO, paso 150 | 17,8 ± 0,4% | 91,3 | 435 ± 4 | 21,0% | 26,9% | 1,56 |
| Tree-GRPO, paso 125 | 21,0 ± 1,1% | 107,3 | 451 ± 13 | 23,8% | 31,5% | 1,96 |
| Tree-GRPO, paso 150 | 27,7 ± 0,5% | 142,0 | 472 ± 8 | 30,1% | 43,1% | 2,77 |
| **RegPO, paso 125 (este modelo)** | **32,6 ± 0,9%** | **166,7** | **572 ± 11** | **29,1%** | **41,5%** | **3,41** |
| RegPO, paso 150 | 35,2 ± 0,6% | 180,3 | 590 ± 4 | 30,5% | 44,2% | 3,76 |

Advertencias del autor: solo hay una ejecución de entrenamiento por método (las 3 semillas miden únicamente ruido de muestreo); Tree-GRPO y RegPO se inicializaron desde el checkpoint de paso 50 del modelo GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.777 millones de parámetros en bf16, los pesos ocupan aproximadamente 3,6 GB. Con overhead de activaciones y caché KV, se puede ejecutar en GPUs con 8 GB o más en bf16; en cuantización de 4 bits (no documentada) cabría en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) o profesional (A100, H100) para entrenamiento o evaluación a gran escala. Para inferencia puntual, una RTX 3060 de 12 GB es suficiente.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 8 GB o más en bf16.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `AutoTokenizer`), vLLM (usado en los rollouts y evaluaciones del autor), TGI (el modelo tiene tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte explícito para llama.cpp u Ollama, aunque al ser un modelo transformers estándar podría convertirse a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor usa vLLM con `max_new_tokens=16` y `do_sample=False` en el ejemplo de uso, lo que sugiere respuestas muy cortas y baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de victoria (Sokoban d8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegPO step 125 (este modelo) | 1.777M | no disponible (prompt máx. 3072, respuesta máx. 512) | 32,6 ± 0,9% | Apache 2.0 | Hugging Face |
| RegPO step 150 | 1.777M | no disponible | 35,2 ± 0,6% | Apache 2.0 | Hugging Face |
| Tree-GRPO step 125 | 1.777M | no disponible | 21,0 ± 1,1% | Apache 2.0 | Hugging Face |
| Tree-GRPO step 150 | 1.777M | no disponible | 27,7 ± 0,5% | Apache 2.0 | Hugging Face |
| GiGPO step 150 | 1.777M | no disponible | 17,8 ± 0,4% | Apache 2.0 | Hugging Face |
| GRPO step 150 | 1.777M | no disponible | 16,0 ± 0,8% | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.777M | no disponible | 12,6 ± 0,2% | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Dominio extremadamente restringido: el modelo solo está entrenado para Sokoban de 6x6 con 2 cajas y profundidad 8; su uso fuera de este entorno no está validado y probablemente produzca salidas inválidas o irrelevantes.
- Formato de salida estricto: cualquier texto después de `</answer>` o más de 2 movimientos invalida el turno, lo que penaliza con -0,5 y puede degradar el rendimiento en producción si no se controla el parseo.
- Riesgo de alucinación: aunque el entorno es determinista, el modelo puede generar acciones ilegales (por ejemplo, empujar una caja contra una pared) o secuencias que no resuelven el puzzle; la tasa de victoria del 32,6% implica que dos tercios de los puzzles no se resuelven.
- Sesgos conocidos: no se documentan sesgos específicos, pero al estar entrenado solo con prompts en inglés y un formato concreto, puede tener un sesgo de idioma y de formato.
- Limitaciones de contexto: el prompt máximo es de 3072 tokens y la respuesta máxima de 512 tokens; no se especifica la longitud de contexto nativa del modelo base, por lo que no se puede confirmar si se ha modificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat de producción: solo hay una ejecución de entrenamiento por método, por lo que las diferencias entre algoritmos pueden estar influidas por la semilla de entrenamiento; las 3 semillas de evaluación solo miden ruido de muestreo. Además, Tree-GRPO y RegPO se inicializaron desde el checkpoint de paso 50 de GRPO, lo que puede favorecer a estos métodos frente a GRPO entrenado desde cero.
- No se han publicado resultados de benchmarks en la información disponible más allá de la tabla de Sokoban; no hay datos de MMLU, HumanEval, GSM8K ni otras tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo-step125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo hermano GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Modelo hermano GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Modelo hermano Tree-GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Modelo hermano RegPO (step 150): https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Modelo hermano Tree-GRPO step 125: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo-step125
- Modelo hermano GRPO step 300: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300
- Framework verl: no disponible en la información proporcionada
- Repositorio verl-agent: no disponible en la información proporcionada
- Paper de RegPO: no disponible en la información proporcionada
- Paper de Tree-GRPO: no disponible en la información proporcionada
- Paper de GiGPO: no disponible en la información proporcionada
- gym-sokoban: no disponible en la información proporcionada
