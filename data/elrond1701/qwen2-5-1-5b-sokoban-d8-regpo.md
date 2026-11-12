# Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo

## Resumen

Qwen2.5-1.5B-Instruct · Sokoban (depth-8) · RegPO es un ajuste fino por aprendizaje por refuerzo multi-turno del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Elrond1701. El modelo está especializado en resolver puzles de Sokoban representados como texto: recibe un tablero de 6×6 con dos cajas y dos objetivos, junto con las coordenadas del jugador, las cajas y los objetivos, y debe emitir secuencias de movimientos (`Up`, `Down`, `Left`, `Right`) dentro de un formato estricto delimitado por `<answer>...</answer>`.

El interés del modelo no reside en sus capacidades generales de lenguaje, sino en que sirve como artefacto de investigación para comparar algoritmos de RL sobre agentes LLM. El autor entrena cuatro variantes (GRPO, GiGPO, Tree-GRPO y RegPO) sobre el mismo entorno y publica las curvas de evaluación. RegPO, la variante de este checkpoint, combina un término de paso tipo GiGPO, un término de árbol tipo Tree-GRPO y un término de arrepentimiento (regret) derivado del árbol de ramificación, con pesos 1.0/1.0/1.0.

El checkpoint publicado es el paso 150 (final) del entrenamiento, que además resultó ser el mejor de los guardados según la evaluación medida. Con 1.777.088.000 parámetros y licencia Apache 2.0, es un modelo pequeño, desplegable en hardware de consumo, pero cuya utilidad práctica fuera del entorno Sokoban es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con RL multi-turno |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 3072 tokens de prompt + 512 tokens de respuesta (configuración de entrenamiento); contexto nativo de Qwen2.5-1.5B: no disponible en la información proporcionada |
| Tipos de cuantizacion | bf16 en safetensors (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles (el entrenamiento es en inglés técnico para Sokoban) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.777 millones de parámetros. Sobre él se aplica un ajuste fino con RL multi-turno usando verl 0.6.1 junto con verl-agent para el bucle de agente y vLLM para los rollouts. El algoritmo RegPO (`regret_tree_grpo`) combina tres términos: un término de paso tipo GiGPO con descuento gamma 0.95, un término de árbol tipo Tree-GRPO sin descuento y un término de arrepentimiento calculado a partir del árbol de ramificación con estimador posterior y cota de recompensa terminal de 20. Los tres términos tienen peso 1.0.

El entorno es un Sokoban de 6×6 con 2 cajas, generado por juego inverso con profundidad de búsqueda 8 y sin filtro de longitud de solución. Cada episodio consta de 10 turnos con hasta 2 movimientos por turno (20 movimientos en total). El prompt sigue el estilo RAGEN: rejilla simbólica más coordenadas indexadas desde cero, historial de los 2 últimos turnos y sin modo de razonamiento (el turno del asistente se prellena con `<answer>`). La recompensa es la de gym-sokoban: −0.1 por movimiento, +1 por caja sobre objetivo, −1 por caja fuera de objetivo y +10 por resolver. La optimización usa 16 puzles por paso, minibatch PPO de 256, lr 1e-6, pérdida KL 0.05, clip 0.2/0.2, agregación de pérdida por media de tokens, sin bonus de entropía, máximo 512 tokens de respuesta y 3072 de prompt. El modelo se inicializa desde el checkpoint del paso 50 del modelo GRPO (semilla de entorno 50 a partir del paso 51) y se entrena hasta el paso 150.

## Capacidades

- Resolución de puzles de Sokoban en formato texto de 6×6 con 2 cajas, emitiendo secuencias de hasta 2 movimientos por turno.
- Seguimiento estricto de formato: produce la respuesta dentro de `<answer>...</answer>` con acciones separadas por ` || `.
- Razonamiento multi-turno: mantiene el estado del puzle a lo largo de hasta 10 turnos usando el historial de los 2 últimos turnos.
- Interpretación de representaciones simbólicas de tablero (rejilla con `#`, `O`, `X`, `P`, `_`) y de coordenadas indexadas desde cero.
- Generación de texto general heredada de Qwen2.5-1.5B-Instruct, aunque no es el objetivo del ajuste y puede haberse degradado.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: sí, en el sentido acotado de agente multi-turno sobre Sokoban.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no hay modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Investigación en algoritmos de RL para agentes LLM: el modelo sirve como referencia reproducible de RegPO frente a GRPO, GiGPO y Tree-GRPO sobre el mismo entorno y presupuesto de entrenamiento, con curvas de evaluación publicadas.
- Reproducción de experimentos de RL multi-turno: permite validar pipelines basados en verl y verl-agent con vLLM, dado que el autor documenta hiperparámetros, recompensas y configuración del entorno con detalle.
- Evaluación de planificación a corto horizonte: útil para estudiar cómo un modelo de 1.5B aprende a encadenar hasta 20 movimientos bajo recompensa escasa y formato estricto.
- Estudio de robustez de formato: el entorno penaliza con −0.5 los turnos inválidos (texto tras `</answer>` o más de 2 movimientos), lo que permite analizar el cumplimiento de instrucciones bajo RL.
- Base para ablaciones de recompensa: al estar el código de recompensa y el prompt documentados, se puede modificar la función de recompensa y reentrenar para comparar dinámicas de aprendizaje.
- Docencia y divulgación: ejemplo compacto y desplegable en GPU de consumo para explicar RLHF/RLVR, PPO, KL y agregación de pérdida en agentes LLM.
- No se recomienda su uso como asistente general, chatbot de atención al cliente ni generador de código en producción: el ajuste está orientado exclusivamente a Sokoban.

## Benchmarks y rendimiento

La métrica es `val/regret_sokoban/success_rate` sobre 512 puzles fijos, evaluada cada 10 pasos con temperatura de muestreo 0.4. Es la fracción de filas de evaluación marcadas como resueltas, no una tasa de victoria por episodio. El Qwen2.5-1.5B-Instruct sin entrenar obtiene 6.2.

| Modelo | paso 50 | paso 100 | paso 150 (este checkpoint) | media de las 5 últimas evals (110–150) | mejor eval (paso) |
|---|---|---|---|---|---|
| GRPO | 9.0 | 12.1 | 14.6 | 15.6 | 18.1 (140) |
| GiGPO | 15.9 | 15.1 | 20.7 | 18.1 | 20.7 (150) |
| Tree-GRPO | 9.2 | 17.9 | 25.8 | 22.1 | 25.8 (150) |
| RegPO | 9.2 | 19.6 | 29.3 | 28.9 | 35.8 (140) |

Curva de evaluación de este modelo (RegPO):

| paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| éxito (%) | – | – | – | – | – | 9.2 | 16.8 | 17.1 | 16.1 | 18.5 | 19.6 | 23.2 | 24.1 | 32.1 | 35.8 | 29.3 |

Advertencias del autor: una sola semilla por método, 150 pasos de entrenamiento, y Tree-GRPO y RegPO se inicializaron desde el checkpoint del paso 50 de GRPO mientras que GRPO y GiGPO se entrenaron desde cero; la comparación más limpia es RegPO/Tree-GRPO frente a GRPO en los pasos 51–150. Las evaluaciones pico entre checkpoints no se guardaron.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB solo para pesos; con overhead de activaciones y caché KV para prompts de hasta 3072 tokens, se recomienda al menos 6–8 GB.
- En cuantización de 8 bits: alrededor de 1,8 GB de pesos; en 4 bits, alrededor de 0,9 GB, aunque el autor solo publica bf16 y no documenta cuantizaciones alternativas.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores; A100 y H100 quedan sobredimensionadas para inferencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: transformers (documentado por el autor), vLLM (usado en entrenamiento y evaluaciones), y TGI por los tags del repositorio. llama.cpp y Ollama no están documentados, aunque serían viables si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito Sokoban d8 (mejor eval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegPO (este) | 1.777 M | 3072 prompt + 512 respuesta | 35.8 (paso 140); 29.3 en paso 150 | apache-2.0 | Hugging Face |
| Tree-GRPO (hermano) | 1.777 M | ídem | 25.8 (paso 150) | apache-2.0 | Hugging Face |
| GiGPO (hermano) | 1.777 M | ídem | 20.7 (paso 150) | apache-2.0 | Hugging Face |
| GRPO (hermano) | 1.777 M | ídem | 18.1 (paso 140); 14.6 en paso 150 | apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.777 M | no disponible | 6.2 (sin entrenar) | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para Sokoban de 6×6 con 2 cajas y hasta 2 movimientos por turno; fuera de ese dominio su rendimiento no está caracterizado.
- Una sola semilla por método: las diferencias entre algoritmos pueden no ser estadísticamente significativas.
- Comparación no perfectamente controlada: Tree-GRPO y RegPO parten del paso 50 de GRPO, mientras que GRPO y GiGPO se entrenan desde cero.
- Métrica agregada: el éxito se mide como fracción de filas de evaluación resueltas, no como tasa de victoria por episodio, lo que complica la comparación con otras publicaciones.
- Degradación probable del paso 150 frente al 140: la mejor evaluación (35.8) se alcanzó en el paso 140, y el checkpoint publicado (150) baja a 29.3, por lo que no es el mejor punto de la curva.
- Riesgo de alucinación y de violación de formato: el modelo puede emitir movimientos ilegales o texto fuera de `<answer>`, lo que el entorno penaliza con −0.5 y movimiento nulo.
- Idiomas no documentados: el prompt de entrenamiento está en inglés; no hay evidencia de funcionamiento correcto en castellano.
- Sin datos de sesgos, seguridad o alineación general: el ajuste RL puede haber alterado el comportamiento conversacional del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no aporta valor comercial fuera de investigación en RL o de entornos Sokoban.
- Sin benchmarks estándar (MMLU, HumanEval, GSM8K): no se han publicado resultados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Variante GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Variante Tree-GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Framework verl: no disponible en la información proporcionada
- Framework verl-agent: no disponible en la información proporcionada
- Paper de RegPO: no disponible en la información proporcionada
- Repositorio de gym-sokoban: no disponible en la información proporcionada
