# mcemri/commenv-task-labnas-t2

## Resumen

`mcemri/commenv-task-labnas-t2` es un checkpoint de investigación publicado por el usuario mcemri, derivado del modelo base Qwen/Qwen3-4B (4.000 millones de parámetros, licencia Apache-2.0). No es un modelo de propósito general ni un producto: es el resultado de un experimento de aprendizaje por refuerzo (GRPO) en el que tres copias del modelo cooperan como equipo para resolver una tarea de ajuste de hiperparámetros de redes neuronales sobre las tablas de NAS-Bench-201.

El modelo parte del checkpoint final de `mcemri/commenv-e1-t2-combined` (entrenado previamente con puzles lógicos, primero en solitario y después en equipo) y se somete a 30 pasos adicionales de RL sobre rondas de NAS-Bench-201. En cada ronda, tres agentes reciben 27 combinaciones de tres ajustes, entrenan hasta 3 combinaciones cada uno (una por turno), solo ven el resultado de las que ellos mismos ejecutan, se comunican mediante un tablero compartido durante un máximo de seis turnos y deben nombrar la mejor combinación.

La relevancia es puramente investigadora: explora si un LLM de 4B puede aprender comunicación multiagente efectiva y generalización a tablas de experimentos no vistas durante el entrenamiento. Los propios autores advierten que una regla heurística sin modelo (promediar resultados por valor de ajuste y entrenar las mejores combinaciones no probadas) alcanza el 97% de acierto en las rondas de NAS-Bench-201, muy por encima del 68% del modelo tras 30 pasos, lo que sitúa el resultado como una referencia de investigación, no como una herramienta práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpetas `export/global_step_{10,20,30}/policy`, 8,8 GB cada una); checkpoint del entrenador en 4 shards, 22,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B (transformer decoder-only) sin modificaciones estructurales; el trabajo se centra en el post-entrenamiento. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization) sobre una tarea multiagente de comunicación: tres instancias del modelo colaboran en rondas de NAS-Bench-201 en las que cada agente ejecuta un subconjunto de combinaciones, observa solo sus propios resultados y comparte información con los demás a través de un tablero común antes de emitir una respuesta final.

El entrenamiento consta de 30 pasos de RL a partir del checkpoint `mcemri/commenv-e1-t2-combined`. Los datos de entrenamiento son rondas construidas a partir de las tablas de NAS-Bench-201 (operaciones sobre tres de las seis aristas de una celda, tres de cinco operaciones cada una, del repositorio blackbox de Syne Tune). Existe una ejecución hermana, `mcemri/commenv-task-lab-t2`, entrenada con rondas de las tablas FCNet, lo que permite evaluar la transferencia entre dominios de tablas. No se documentan detalles adicionales sobre volumen de tokens, composición del dataset ni otras técnicas de alineación.

## Capacidades

- Razonamiento multiagente con comunicación estructurada: tres copias del modelo negocian a través de un tablero compartido durante hasta seis turnos.
- Ejecución de experimentos simulados: cada agente "entrena" combinaciones de hiperparámetros y recibe resultados de las tablas de NAS-Bench-201.
- Selección de la mejor combinación dentro de un conjunto de 27 candidatas, integrando información parcial propia y de los compañeros.
- Generalización parcial a tablas de experimentos no vistas (FCNet): 28% de acierto tras 30 pasos frente al 15% inicial.
- Generación de texto y razonamiento general heredados de Qwen3-4B (no evaluados específicamente en esta ficha).
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje multiagente: reproducir el protocolo de tres agentes con tablero compartido para estudiar dinámicas de comunicación y consenso en LLMs pequeños.
- Estudio de generalización en RL: comparar el rendimiento del modelo en tablas NAS-Bench-201 (vistas) frente a FCNet (no vistas) para analizar qué se transfiere y qué no.
- Evaluación de recompensas basadas en tareas verificables: usar la tarea de selección de la mejor combinación como banco de pruebas para métodos de RL con recompensa objetiva.
- Línea base para comparar con heurísticas sin modelo: el propio autor documenta que una regla simple alcanza el 97% en NAS-Bench-201, lo que permite medir la brecha entre LLM y métodos clásicos de optimización de hiperparámetros.
- Reproducción de experimentos de ajuste de hiperparámetros asistido por LLM: simular flujos donde varios agentes proponen y validan configuraciones de red con información parcial.
- Estudio de comunicación eficiente: analizar cuántos turnos y qué formato de tablero compartido maximizan el acierto del equipo, dado el límite de seis turnos por ronda.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 400 rondas reservadas de NAS-Bench-201 y 400 rondas de FCNet:

| Metrica | Antes del run | Paso 10 | Paso 20 | Paso 30 |
|---|---|---|---|---|
| Acierto en rondas NAS-Bench-201 (mejor combinación) | 21% | 48% | 60% | 68% |
| Acierto en rondas FCNet (no vistas) | 15% | no disponible | no disponible | 28% |
| Primer run del agente es la mejor combinación (NAS) | 21% | no disponible | no disponible | no disponible |
| Primer run del agente es la mejor combinación (FCNet) | 3% | no disponible | no disponible | no disponible |
| Azar (referencia) | 5,6% | 5,6% | 5,6% | 5,6% |
| Regla heurística sin modelo (NAS) | 97% | 97% | 97% | 97% |

La ejecución hermana entrenada con rondas FCNet alcanza el 60% en FCNet y el 45% en NAS, lo que evidencia una transferencia asimétrica entre dominios de tablas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 8-9 GB para los pesos de 4B, más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones para un transformer de 4B; no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 y en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: Transformers (carga documentada con `subfolder="export/global_step_30/policy"`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-labnas-t2 | 4B | no disponible | RL multiagente sobre NAS-Bench-201 | Apache-2.0 | Hugging Face (0 descargas) |
| mcemri/commenv-task-lab-t2 | 4B (base Qwen3-4B) | no disponible | RL multiagente sobre tablas FCNet | Apache-2.0 | Hugging Face |
| mcemri/commenv-e1-t2-combined | 4B (base Qwen3-4B) | no disponible | Puzles lógicos en solitario y en equipo | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible | Modelo base de propósito general | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe explícitamente como "research checkpoints, not a product"; no está pensado para uso en producción.
- Rendimiento inferior a una heurística trivial: la regla sin modelo alcanza el 97% en NAS-Bench-201 frente al 68% del modelo, lo que limita su utilidad práctica para optimización de hiperparámetros.
- Dependencia fuerte de las tablas vistas: el primer run del agente acierta solo el 3% en FCNet frente al 21% en NAS, y el acierto en FCNet tras 30 pasos es del 28%.
- Generalización limitada: lo que se transfiere a tablas no vistas es principalmente el uso de todos los resultados y el consenso del equipo, no el conocimiento de las tablas.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de la tarea de entrenamiento; no se han publicado evaluaciones de propósito general para este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B también es Apache-2.0; no obstante, el uso comercial de un checkpoint de investigación con rendimiento inferior a una heurística no está recomendado.
- El repositorio incluye el estado del optimizador (22,5 GB) solo para continuar el entrenamiento; no es necesario para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-labnas-t2
- Checkpoint previo: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Ejecución hermana (FCNet): https://huggingface.co/mcemri/commenv-task-lab-t2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- NAS-Bench-201 (Syne Tune blackbox repository): no se proporciona enlace directo en la información disponible.
