# Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo-step125

## Resumen

`qwen2.5-1.5b-sokoban-d8-tree-grpo-step125` es un ajuste fino del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario Elrond1701, orientado a resolver el juego de lógica Sokoban en formato puramente textual. No es un modelo de propósito general: es un checkpoint de investigación (paso 125 de un entrenamiento de refuerzo multi-turno) que sirve como evidencia empírica de que el algoritmo Tree-GRPO mejora la resolución de tareas de razonamiento con interacción con el entorno frente a GRPO o GiGPO clásicos.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 (1.777 millones de parámetros, contexto nativo de 32.768 tokens en la familia base) y se entrena con RL sobre un entorno Sokoban de 6×6 con 2 cajas, habitaciones generadas por búsqueda inversa de profundidad 8 y episodios de 10 turnos. La innovación está en el algoritmo Tree-GRPO: 4 rollouts principales por puzle, 2 puntos de rama × 2 opciones, profundidad de rama 2 y selección de ramas por incertidumbre, con peso intra-árbol de 1.0 normalizado por desviación estándar.

Es relevante ahora porque forma parte de una familia de checkpoints comparables (GRPO, GiGPO, Tree-GRPO, RegPO) evaluados sobre el mismo conjunto fijo de 512 puzles, lo que permite aislar el efecto del algoritmo de RL. El checkpoint alcanza un 21,0 % de win rate frente al 12,6 % del modelo base sin entrenar, aunque queda por debajo del Tree-GRPO de paso 150 (27,7 %) y de RegPO (32,6 % en paso 125).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; la familia Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el entrenamiento usa max prompt 3072 y max response 512 |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible (el entrenamiento es en inglés técnico para Sokoban) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, convertido desde checkpoint FSDP fp32) |

## Arquitectura y entrenamiento

La base es el transformer decoder-only de Qwen2.5-1.5B-Instruct, sin modificaciones estructurales. El ajuste se realiza con RL multi-turno sobre el entorno textual de Sokoban usando verl 0.6.1 + verl-agent y rollouts con vLLM. El algoritmo Tree-GRPO construye un árbol de ramificación por puzle: 4 rollouts principales, 2 puntos de rama con 2 opciones cada uno, profundidad de rama 2 y selección de ramas basada en incertidumbre, con peso intra-árbol de 1.0 normalizado por desviación estándar. El modelo se inicializa en caliente desde el checkpoint de paso 50 del modelo GRPO (semilla de entorno 50 a partir del paso 51).

El entorno es una habitación de 6×6 con 2 cajas, generada por juego inverso con profundidad de búsqueda 8 y sin filtro de longitud de solución. Cada episodio tiene 10 turnos con hasta 2 movimientos por turno (20 movimientos totales). La observación es un prompt estilo RAGEN con rejilla simbólica y coordenadas cero-indexadas de jugador, cajas y objetivos, más los últimos 2 turnos de historial. La acción se emite como `Up`, `Down`, `Left`, `Right` separadas por ` || ` dentro de `<answer>…</answer>`, con formato estricto (texto tras `</answer>` o más de 2 movimientos invalida el turno con penalización de −0,5). La recompensa es la de gym-sokoban: −0,1 por movimiento, +1 caja sobre objetivo, −1 caja fuera de objetivo, +10 puzle resuelto. La optimización usa 16 puzles por paso, minibatch PPO de 256, lr 1e-6, KL loss 0.05, clip 0.2/0.2, agregación de pérdida token-mean, sin bonus de entropía, máximo 512 tokens de respuesta y 3072 de prompt.

## Capacidades

- Generación de texto y razonamiento paso a paso dentro del bucle de agente Sokoban.
- Planificación de acciones discretas en un entorno con estado parcialmente observable (rejilla + coordenadas).
- Emisión de acciones en formato estricto estructurado (`<answer>…</answer>` con separador ` || `).
- Razonamiento multi-turno: mantiene historial de los últimos 2 turnos y planifica hasta 20 movimientos.
- Capacidad de push de cajas en direcciones cardinales respetando restricciones físicas (no atravesar muros, no tirar de cajas).
- No soporta tool calling ni function calling en el sentido genérico: su "acción" es el movimiento en el juego.
- No soporta agentes multi-paso fuera del entorno Sokoban; el prompt está especializado.
- Capacidades multilingües: no disponibles; el prompt de entrenamiento es en inglés.
- No tiene modo thinking explícito: el turno del asistente se prefiere con `<answer>` para forzar respuesta directa.
- No soporta visión ni audio.

## Casos de uso

- Investigación en RL para LLMs: sirve como checkpoint intermedio para estudiar la curva de aprendizaje de Tree-GRPO frente a GRPO y GiGPO sobre el mismo conjunto de 512 puzles de evaluación, aislando el efecto del algoritmo.
- Reproducción de experimentos: al estar publicados los checkpoints hermanos (GRPO, GiGPO, Tree-GRPO, RegPO en pasos 125, 150 y 300), permite replicar comparativas con semillas de muestreo 0, 1 y 2 a temperatura 0,4.
- Evaluación de robustez de formato: útil para medir la tasa de turnos inválidos por violaciones de formato estricto (`</answer>` prematuro o más de 2 movimientos), un proxy de adherencia a instrucciones.
- Estudio de planificación a corto horizonte: el límite de 20 movimientos y 10 turnos lo hace adecuado para analizar cómo un modelo de 1.5B descompone tareas de planificación con restricciones físicas.
- Benchmark de agentes textuales: puede integrarse en pipelines de evaluación tipo RAGEN o verl-agent para comparar algoritmos de RL multi-turno sobre tareas de lógica.
- Docencia y divulgación: ejemplo compacto (1.5B, licencia Apache 2.0) de cómo el RL con recompensas verificables mejora tareas de razonamiento sin necesidad de modelos grandes.
- Generación de datos sintéticos de Sokoban: el modelo puede producir trayectorias etiquetadas para entrenar modelos mayores o para análisis de cobertura de estados.

## Benchmarks y rendimiento

Evaluación sobre 512 puzles fijos de profundidad 8, temperatura 0,4, tres semillas vLLM (0, 1, 2); media ± desviación estándar muestral entre semillas. Win rate = fracción de partidas resueltas (+10). +1 = número de veces que una caja se empuja sobre un objetivo.

| Modelo | Win rate | Resueltos (de 512) | +1 total | Movimientos +10 / todos los +1 | +10 dado un +1 | Recompensa / partida |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct sin entrenar | 12,6 ± 0,2 % | 64,3 | 371 ± 19 | 17,4 % | 21,3 % | 0,06 |
| GRPO, paso 150 | 16,0 ± 0,8 % | 82,0 | 397 ± 14 | 20,6 % | 26,1 % | 1,35 |
| GiGPO, paso 150 | 17,8 ± 0,4 % | 91,3 | 435 ± 4 | 21,0 % | 26,9 % | 1,56 |
| **Tree-GRPO, paso 125 (este modelo)** | **21,0 ± 1,1 %** | **107,3** | **451 ± 13** | **23,8 %** | **31,5 %** | **1,96** |
| Tree-GRPO, paso 150 | 27,7 ± 0,5 % | 142,0 | 472 ± 8 | 30,1 % | 43,1 % | 2,77 |
| RegPO, paso 125 | 32,6 ± 0,9 % | 166,7 | 572 ± 11 | 29,1 % | 41,5 % | 3,41 |
| RegPO, paso 150 | 35,2 ± 0,6 % | 180,3 | 590 ± 4 | 30,5 % | 44,2 % | 3,76 |

Advertencia del autor: una sola ejecución de entrenamiento por método; las 3 semillas solo miden ruido de muestreo. Tree-GRPO y RegPO se inicializaron en caliente desde el checkpoint de paso 50 de GRPO.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,6 GB solo para pesos (1.777 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para prompts de hasta 3.072 tokens.
- En cuantización de 8 bits: unos 1,8 GB de pesos; en 4 bits, unos 0,9 GB. No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100, H100). Cabe holgadamente en GPU de consumo.
- Despliegue: el autor usa vLLM para rollouts y evaluación; también es compatible con transformers (código de ejemplo en la model card), TGI (tag `text-generation-inference`) y, previsiblemente, llama.cpp/Ollama tras conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles. El autor limita la generación a `max_new_tokens=16` con `do_sample=False` en el ejemplo, lo que sugiere respuestas muy cortas (una o dos acciones) y latencia baja en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Win rate (Sokoban d8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tree-GRPO step 125 (este) | 1,777 M | no disponible (familia Qwen2.5: 32.768) | 21,0 ± 1,1 % | Apache 2.0 | Hugging Face |
| Tree-GRPO step 150 | 1,777 M | no disponible | 27,7 ± 0,5 % | Apache 2.0 | Hugging Face |
| RegPO step 125 | 1,777 M | no disponible | 32,6 ± 0,9 % | Apache 2.0 | Hugging Face |
| GiGPO step 150 | 1,777 M | no disponible | 17,8 ± 0,4 % | Apache 2.0 | Hugging Face |
| GRPO step 150 | 1,777 M | no disponible | 16,0 ± 0,8 % | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,777 M | 32.768 | 12,6 ± 0,2 % | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del entorno Sokoban textual su rendimiento como asistente general no está caracterizado y probablemente degradado respecto al base.
- Sesgos: no evaluados; el entrenamiento se limita a un juego sintético y no se han publicado análisis de sesgo.
- Riesgo de alucinación: alto en contextos fuera del formato esperado; el modelo puede emitir acciones ilegales o texto extra tras `</answer>`, lo que invalida el turno con penalización de −0,5.
- Limitaciones de contexto: el entrenamiento usa prompts de hasta 3.072 tokens y respuestas de hasta 512; no se ha validado el comportamiento más allá de esos límites.
- Limitaciones de idioma: el prompt de entrenamiento es en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene revisar la licencia del modelo base (también Apache 2.0).
- Caveat de producción: es un checkpoint de investigación (paso 125 de un run), no un modelo final; el autor advierte de una sola ejecución de entrenamiento por método y de que las semillas solo miden ruido de muestreo.
- Sin cuantizaciones publicadas ni métricas de latencia/throughput; el despliegue en producción requeriría validación propia.
- El rendimiento queda por debajo de los checkpoints de paso 150 del mismo algoritmo y de RegPO, por lo que no es la mejor opción dentro de la propia familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo-step125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Hermano GRPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo
- Hermano GiGPO: https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-gigpo
- Hermano Tree-GRPO (paso 150): https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-tree-grpo
- Hermano RegPO (paso 150): https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo
- Hermano RegPO (paso 125): https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-regpo-step125
- Hermano GRPO (paso 300): https://huggingface.co/Elrond1701/qwen2.5-1.5b-sokoban-d8-grpo-step300
- Framework verl: https://github.com/volcengine/verl
- Framework verl-agent: no disponible como enlace directo en la información proporcionada
- gym-sokoban: no disponible como enlace directo en la información proporcionada
- Paper de Tree-GRPO: no disponible en la información proporcionada
- Paper de RegPO: no disponible en la información proporcionada
