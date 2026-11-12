# Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo

## Resumen

Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct especializado en resolver Sokoban mediante aprendizaje por refuerzo multi-turno con GRPO (Group Relative Policy Optimization). Lo desarrolla el usuario Elrond1701 y forma parte de una familia de cuatro experimentos comparativos (GRPO, GiGPO, Tree-GRPO y RegPO) sobre el mismo entorno, con el objetivo de evaluar distintas variantes de optimización por refuerzo en tareas de razonamiento agéntico con acciones discretas.

El modelo resuelve puzles de Sokoban en un tablero de 6x6 con 2 cajas, generados por reproducción inversa con profundidad de búsqueda 8. Cada episodio consta de 10 turnos, con hasta 2 movimientos por turno (20 movimientos en total). El modelo recibe una representación simbólica del tablero junto con coordenadas de jugador, cajas y objetivos, y debe emitir secuencias de acciones (`Up`, `Down`, `Left`, `Right`) dentro de etiquetas `<answer>…</answer>`.

Con 1.777.088.000 parámetros y licencia Apache 2.0, es relevante como banco de pruebas reproducible para investigar RL sobre modelos pequeños y como ejemplo de ajuste de un LLM de 1.5B para tareas de planificación con formato estricto. No es un modelo de propósito general: su utilidad principal es la investigación en agentes y en métodos de optimización por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajustado con RL (GRPO) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3072 tokens de prompt + 512 tokens de respuesta (configuracion de entrenamiento); contexto nativo del base Qwen2.5-1.5B-Instruct no especificado en la informacion |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros, y se ajusta con GRPO sobre un entorno de Sokoban textual. El entrenamiento usa ventajas a nivel de episodio normalizadas por desviación estándar, con 8 rollouts por puzle y 16 puzles por paso. La optimización emplea PPO con mini-batch de 256, learning rate 1e-6, pérdida KL de 0.05, clipping 0.2/0.2, agregación de pérdida por media de tokens, sin bonus de entropía, máximo de 512 tokens de respuesta y 3072 tokens de prompt. El framework es verl 0.6.1 junto con verl-agent para el bucle multi-turno, con rollouts generados por vLLM.

El entorno genera tableros de 6x6 con 2 cajas mediante reproducción inversa con profundidad de búsqueda 8, sin filtro de longitud de solución. La recompensa sigue la lógica de gym-sokoban: -0.1 por movimiento, +1 por caja sobre objetivo, -1 por caja fuera de objetivo y +10 por resolver. El prompt sigue el estilo RAGEN, con rejilla simbólica y coordenadas cero-indexadas, historial de los últimos 2 turnos y prefijado del turno del asistente con `<answer>`. El formato es estricto: texto tras `</answer>` o más de 2 movimientos invalidan el turno (sin movimiento, penalización de -0.5). Este checkpoint corresponde al paso 150 (final) y fue el mejor de los guardados según la evaluación medida.

## Capacidades

- Resolución de puzles de Sokoban en tableros de 6x6 con 2 cajas, en formato textual.
- Generación de secuencias de acciones discretas (`Up`, `Down`, `Left`, `Right`) separadas por ` || `, dentro de etiquetas `<answer>…</answer>`.
- Razonamiento multi-turno con hasta 10 turnos por episodio y 2 movimientos por turno.
- Interpretación de representaciones simbólicas del tablero (rejilla y coordenadas cero-indexadas de jugador, cajas y objetivos).
- Seguimiento estricto de formato de respuesta (penalización por formato inválido durante el entrenamiento).
- No se documenta soporte de tool calling, function calling, agentes generales, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (el ajuste se realiza sobre prompts en inglés).

## Casos de uso

- Investigación en RL para LLMs: sirve como referencia reproducible de GRPO aplicado a una tarea de planificación con acciones discretas y recompensa densa, útil para comparar con GiGPO, Tree-GRPO y RegPO del mismo autor.
- Evaluación de métodos de optimización por refuerzo: al compartir entorno, semilla (env seed 0) y configuración, permite aislar el efecto del algoritmo de RL sobre el rendimiento final.
- Benchmark de agentes multi-turno: el formato de 10 turnos con hasta 2 movimientos por turno es un caso controlado para medir planificación a corto plazo y seguimiento de instrucciones estrictas.
- Estudio de robustez de formato: la penalización por formato inválido permite analizar cómo el RL moldea la adherencia a plantillas de salida.
- Base para ajustes posteriores: al ser un modelo de 1.5B con licencia Apache 2.0, puede servir como punto de partida para experimentos propios de RL sobre tareas similares.
- Docencia y demostraciones: ejemplo compacto y ejecutable en hardware modesto para ilustrar el ciclo completo de entrenamiento con verl y vLLM en un entorno de agente.

## Benchmarks y rendimiento

Evaluación sobre 512 puzles fijos, cada 10 pasos, con temperatura de muestreo 0.4. Métrica: `val/regret_sokoban/success_rate` (fracción de filas de evaluación marcadas como resueltas; no es una tasa de victoria por episodio). Qwen2.5-1.5B-Instruct sin entrenar: 6.2.

| Modelo | step 50 | step 100 | step 150 (este checkpoint) | media de las últimas 5 evals (110-150) | mejor eval (step) |
|---|---|---|---|---|---|
| GRPO (este) | 9.0 | 12.1 | 14.6 | 15.6 | 18.1 (140) |
| GiGPO | 15.9 | 15.1 | 20.7 | 18.1 | 20.7 (150) |
| Tree-GRPO | 9.2 | 17.9 | 25.8 | 22.1 | 25.8 (150) |
| RegPO | 9.2 | 19.6 | 29.3 | 28.9 | 35.8 (140) |

Curva de evaluación de este modelo:

| step | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| eval success (%) | 6.2 | 7.3 | 6.3 | 7.7 | 9.1 | 9.0 | 11.4 | 11.3 | 9.6 | 10.7 | 12.1 | 15.1 | 12.6 | 17.6 | 18.1 | 14.6 |

Advertencias del autor: una sola semilla por método, 150 pasos de entrenamiento, y Tree-GRPO y RegPO se inicializaron desde el checkpoint del paso 50 de GRPO, mientras que GRPO y GiGPO se entrenaron desde cero; la comparación más limpia es RegPO / Tree-GRPO frente a GRPO en los pasos 51-150. Las evaluaciones pico entre checkpoints no se guardaron.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3.6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de prompt y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o L40S para despliegues con mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con cuantización (no se publican pesos cuantizados, pero puede convertirse a GGUF/AWQ).
- Opciones de despliegue: transformers (uso documentado por el autor), vLLM (usado en entrenamiento y evaluación), TGI (tag `text-generation-inference`), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El autor usa `max_new_tokens=16` con decodificación greedy en el ejemplo de uso, lo que sugiere respuestas muy cortas por turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Eval step 150 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-sokoban-d8-grpo (este) | 1.777 M | 3072 prompt + 512 respuesta | 14.6 | Apache 2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-gigpo | 1.777 M (base) | misma config | 20.7 | Apache 2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-tree-grpo | 1.777 M (base) | misma config | 25.8 | Apache 2.0 | Hugging Face |
| qwen2.5-1.5b-sokoban-d8-regpo | 1.777 M (base) | misma config | 29.3 | Apache 2.0 | Hugging Face |

Los cuatro modelos comparten base, entorno y configuración de entrenamiento, por lo que la comparación aísla el efecto del algoritmo de RL. RegPO obtiene el mejor resultado en el paso 150, seguido de Tree-GRPO, GiGPO y GRPO. Las cifras no son directamente comparables con benchmarks de propósito general (MMLU, HumanEval, GSM8K), que no se han publicado para estos modelos.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente para Sokoban textual de 6x6 con 2 cajas; su rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: en este contexto se manifiesta como movimientos inválidos o secuencias que violan el formato estricto (`<answer>…</answer>`, máximo 2 movimientos por turno).
- Limitaciones de contexto e idioma: el entrenamiento usa prompts en inglés y ventanas de 3072 tokens de prompt más 512 de respuesta; no se documenta soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que conviene revisar.
- Caveats de producción: una sola semilla por método, 150 pasos de entrenamiento y comparación parcialmente contaminada por el warm-start de Tree-GRPO y RegPO desde el paso 50 de GRPO; las evaluaciones pico entre checkpoints no se guardaron.
- El checkpoint final (step 150) no es el mejor eval del modelo (18.1 en step 140), por lo que para reproducir el mejor resultado conviene considerar checkpoints intermedios si estuvieran disponibles.
- El modelo no incluye modo thinking ni tool calling; la salida es una secuencia de acciones de formato fijo.

## Enlaces

- Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Variante Tree-GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Variante RegPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Framework verl: https://github.com/volcengine/verl
- verl-agent: https://github.com/langfengQ/verl-agent
- vLLM: https://github.com/vllm-project/vllm
- gym-sokoban: https://github.com/mpSchrader/gym-sokoban
