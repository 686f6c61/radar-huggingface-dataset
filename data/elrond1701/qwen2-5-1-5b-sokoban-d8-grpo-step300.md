# Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300

## Resumen

Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300 es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen2.5-1.5B-Instruct, especializado en resolver el juego Sokoban en formato textual como agente conversacional multi-turno. Lo desarrolla el usuario independiente Elrond1701 y se distribuye con licencia Apache 2.0. No es un modelo de propósito general: es un checkpoint de investigación pensado para estudiar cómo el RL con GRPO (Group Relative Policy Optimization) mejora el razonamiento espacial y la planificación de un LLM pequeño en tareas de resolución de puzles.

El modelo parte de la arquitectura transformer densa de Qwen2.5-1.5B-Instruct (1.777.088.000 parámetros, contexto nativo de 32.768 tokens en el modelo base) y se entrena con un bucle de agente multi-turno sobre Sokoban de 6×6 con 2 cajas, generados por juego inverso con profundidad de búsqueda 8. Cada episodio dura 10 turnos con hasta 2 movimientos por turno (20 movimientos en total).

Este checkpoint corresponde al paso 300 de una continuación de 150 pasos adicionales sobre el modelo GRPO step-150 publicado previamente, reanudando desde su estado de modelo, optimizador y dataloader con un nuevo flujo de puzles de entrenamiento (semilla de entorno 150). Es relevante ahora porque forma parte de una familia de experimentos comparativos (GRPO, GiGPO, Tree-GRPO, RegPO) que permiten evaluar distintas variantes de RL para agentes LLM en tareas con recompensa escasa y estructura espacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, fine-tuned con GRPO |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; en entrenamiento se usó max prompt 3.072 tokens y max response 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 1.777 millones de parámetros, heredado de Qwen2.5-1.5B-Instruct. Sobre esa base se aplica un ajuste fino con GRPO (8 rollouts por puzle, ventajas normalizadas por desviación típica) dentro de un bucle de agente multi-turno implementado con verl 0.6.1 y verl-agent, usando vLLM para los rollouts. La optimización emplea 16 puzles por paso, mini-batch PPO de 256, learning rate 1e-6, pérdida KL de 0.05, clipping 0.2/0.2, agregación de pérdida por media de tokens, sin bonus de entropía, respuesta máxima de 512 tokens y prompt máximo de 3.072 tokens.

El entorno es Sokoban de 6×6 con 2 cajas, salas generadas por juego inverso con profundidad de búsqueda 8 y sin filtro de longitud de solución. La observación sigue el estilo RAGEN: rejilla simbólica más coordenadas cero-indexadas del jugador, cajas y objetivos, con historial de los 2 últimos turnos y sin modo thinking (el turno del asistente se prellena con `<answer>`). El formato de acción es estricto: movimientos `Up`, `Down`, `Left`, `Right` separados por ` || ` dentro de `<answer>…</answer>`; texto tras `</answer>` o más de 2 movimientos invalida el turno (sin movimiento y penalización de −0.5). La recompensa sigue gym-sokoban: −0.1 por movimiento, +1 por caja sobre objetivo, −1 por caja fuera de objetivo y +10 por resolver.

## Capacidades

- Resolución de Sokoban textual de 6×6 con 2 cajas mediante planificación multi-turno (10 turnos, hasta 20 movimientos).
- Razonamiento espacial sobre rejillas simbólicas y coordenadas cero-indexadas.
- Generación de acciones en formato estricto `<answer>…</answer>` con separador ` || `.
- Seguimiento de instrucciones de formato y de restricciones de longitud de respuesta.
- Capacidad conversacional heredada del modelo base Qwen2.5-1.5B-Instruct (multi-turno con rol system/user/assistant).
- No se documenta soporte específico de tool calling, function calling, visión, audio ni modo thinking en este checkpoint.

## Casos de uso

- Investigación en RL para agentes LLM: sirve como checkpoint de referencia para comparar GRPO frente a GiGPO, Tree-GRPO y RegPO en la misma tarea y métrica, permitiendo aislar el efecto del algoritmo de optimización.
- Estudio de planificación con recompensa escasa: el entorno Sokoban exige secuencias largas de movimientos con recompensa solo al resolver, útil para analizar cómo evoluciona la tasa de éxito con los pasos de entrenamiento (de 6.2 % sin entrenar a 39.6 % en el paso 300).
- Evaluación de robustez de formato en agentes: al imponer un formato estricto de acción, permite medir la tasa de turnos inválidos y su impacto en la recompensa.
- Reproducción de experimentos de RL: la model card documenta hiperparámetros, framework (verl 0.6.1) y semillas, lo que facilita replicar el entrenamiento con nuevos flujos de puzles.
- Generación de datos de trayectorias: el modelo puede usarse para producir episodios etiquetados de Sokoban que alimenten otros entrenamientos o análisis de políticas.
- Docencia y demostraciones de agentes LLM: por su tamaño reducido (1.5B), permite ejecutar demostraciones de razonamiento espacial en hardware modesto sin infraestructura pesada.

## Benchmarks y rendimiento

La model card solo reporta la métrica de evaluación durante el entrenamiento `val/regret_sokoban/success_rate`, definida como la fracción de filas de evaluación cuyo retorno de episodio es positivo, ponderada por turnos (no es una tasa de victoria por partida), sobre 512 puzles fijos y temperatura 0.4. El valor sin entrenar es 6.2 %.

| Paso | 150 | 160 | 170 | 180 | 190 | 200 | 210 | 220 | 230 | 240 | 250 | 260 | 270 | 280 | 290 | 300 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Éxito eval (%) | 15.3 | 19.5 | 17.1 | 20.7 | 21.6 | 22.6 | 23.7 | 29.5 | 30.2 | 36.4 | 33.2 | 41.9 | 35.2 | 37.2 | 40.2 | 39.6 |

Como referencia, en la misma métrica los modelos de 150 pasos obtienen 14.6 (GRPO), 20.7 (GiGPO), 25.8 (Tree-GRPO) y 29.3 (RegPO), aunque estos se detuvieron a 150 pasos y este modelo ha recibido el doble de entrenamiento. No se ejecutó la evaluación por partida con 3 semillas para este checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.6 GB de pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB para prompts cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (no se publican pesos cuantizados oficiales, habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, L4, A10). Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: transformers (uso documentado en la model card), vLLM (usado en entrenamiento), TGI (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican.
- Latencia y throughput: no disponibles. La generación típica es corta (max_new_tokens=16 en el ejemplo de uso), por lo que la latencia estará dominada por el preprocesado del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métrica Sokoban (success %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-sokoban-d8-grpo-step300 (este) | 1.777 M | 32.768 (base) | 39.6 (paso 300) | apache-2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-grpo | 1.777 M | 32.768 (base) | 14.6 (paso 150) | apache-2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-tree-grpo | 1.777 M | 32.768 (base) | 25.8 (paso 150) | apache-2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-regpo | 1.777 M | 32.768 (base) | 29.3 (paso 150) | apache-2.0 | Hugging Face |

La comparación directa con los modelos de 150 pasos no es del todo justa porque este checkpoint ha recibido el doble de entrenamiento; aun así, supera a todos ellos en la métrica reportada. No se dispone de comparación con modelos de propósito general en benchmarks estándar.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del dominio Sokoban textual su rendimiento como asistente general puede degradarse respecto al Qwen2.5-1.5B-Instruct original.
- La métrica reportada (`success_rate` ponderada por turnos) no equivale a tasa de victoria por partida; no debe interpretarse como porcentaje de puzles resueltos.
- No se ejecutó la evaluación por partida con 3 semillas para este checkpoint, por lo que falta la comparación homogénea con los modelos de 150 pasos.
- El formato de acción es estricto: texto tras `</answer>` o más de 2 movimientos invalida el turno con penalización de −0.5, lo que puede provocar fallos en integraciones descuidadas.
- Riesgo de alucinación y de movimientos ilegales en estados no vistos; el entrenamiento se limita a salas de 6×6 con 2 cajas y profundidad de búsqueda 8.
- Idiomas soportados no documentados; el prompt de entrenamiento está en inglés.
- No se publican pesos cuantizados ni datos de sesgos; se desconoce el comportamiento en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- GRPO step-150: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Tree-GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- RegPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Tree-GRPO step 125: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo-step125
- RegPO step 125: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo-step125
- GRPO step 300: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300
