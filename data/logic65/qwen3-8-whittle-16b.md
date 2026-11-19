# logic65/Qwen3.8-Whittle-16B

## Resumen

Qwen3.8-Whittle-16B es un modelo de lenguaje derivado de Qwen/Qwen3.8-27B-FP8 mediante un proceso de poda estructural (pruning) sin entrenamiento, seguido de una fase de "sanado" (healing) con QLoRA. Lo desarrolla logic65, un autor individual, y se publica como artefacto de investigación sobre compresión de modelos más que como asistente finalizado. El modelo reduce los 26,9B parámetros del base a 16,34B eliminando 20 de sus 64 capas (bloques de intervalo completos) y recortando un 25% del ancho de cada MLP restante, seleccionando neuronas por la norma de la columna de la matriz `down` multiplicada por la desviación estándar de activación.

La relevancia del modelo reside en su metodología: demuestra que una poda agresiva de profundidad y anchura (−10,1B parámetros, sin entrenamiento) puede recuperarse parcialmente con un único ciclo de QLoRA de 11M tokens, superando en su propia batería de 39 tareas a variantes intermedias más grandes (36/39 frente a 33/39 del recorte de 48 capas con 20,8B). El resultado se sirve a 18,5–20,9 tokens por segundo en dos GPUs de consumo de 8 GB (RTX 4060 + RTX 3050), lo que lo hace viable en hardware muy modesto.

No obstante, el propio autor lo etiqueta como *research preview* que requiere post-entrenamiento: sufre bucles de repetición severos en generaciones largas, conversaciones multi-turno y flujos de agente, hasta el punto de resultar inutilizable en esos escenarios incluso con muestreo DRY activado. El uso recomendado es de un solo turno con los flags de servicio indicados. La arquitectura subyacente es de tipo Qwen3.5 con Gated DeltaNet (GDN) combinada con atención, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con Gated DeltaNet (GDN) y atención, podado en profundidad y anchura |
| Parametros totales | 16.344.368.864 (16,34B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (v1 y v2); pesos bf16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M, Q8_0), adaptadores LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer híbrido de la familia Qwen3.5 que intercala capas con Gated DeltaNet (GDN) y capas de atención clásica. La poda respeta el intervalo GDN:atención para mantener la expresividad en GGUF, eliminando 20 de las 64 capas en bloques de intervalo completos seleccionados por coste medido en la frontera mediante *logit lens*. Sobre las capas restantes se recorta un 25% del ancho de cada MLP, descartando las neuronas más débiles según ‖columna de `down`‖ × desviación estándar de activación. El corte total asciende a −10,1B parámetros y se realiza sin ningún entrenamiento.

La fase de sanado consiste en un único ciclo de QLoRA con rango 64 aplicado a todas las proyecciones lineales (incluidas las de GDN) sobre 11M tokens de una mezcla de linaje limpio: marcos de hechos sintéticos, aritmética programática de razonamiento corto, ejercicios de código escritos a mano y páginas largas de dominio público. El autor documenta hallazgos metodológicos relevantes: el daño por eliminación de bloques no es aditivo, el daño por reducción de anchura se compone, y las capas 32–35 contienen aritmética más que conocimiento. La versión v2 añade un adaptador adicional (`v2-fencing-threejs`) que corrige el cerrado de bloques de código markdown y añade fluidez en three.js.

## Capacidades

- Generación de texto conversacional de un solo turno con calidad aceptable según la batería interna del autor.
- Razonamiento aritmético con precedencia de operadores correcta tras el sanado.
- Generación y completado de código, con cerrado correcto de bloques markdown en la versión v2 (8/8 en la suite de fencing).
- Recuperación de conocimiento factual de cola larga (sonda de reconocimiento 5/7 tras el sanado, frente a 2/7 antes).
- Fluidez en three.js (añadida en v2).
- Soporte de tool calling / function calling: no disponible de forma fiable; el autor advierte que los bucles de agente son un escenario no soportado.
- Razonamiento multi-paso y agentes: no recomendado por bucles de repetición.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de modelos: el modelo sirve como referencia reproducible de una técnica de poda profundidad+anchura con sanado QLoRA; los scripts y la mezcla de entrenamiento están en `training/` y los resultados de sondas en `research/`.
- Evaluación de metodologías de poda: comparar el rendimiento de este recorte frente al de 48 capas (20,8B) o al no reparado (16,8B) permite validar empíricamente el impacto del sanado en tareas concretas.
- Generación de texto de un solo turno en hardware de consumo: con los flags de servicio recomendados y las GGUFs v2, puede ejecutarse a ~20 t/s en dos GPUs de 8 GB para tareas de redacción breve.
- Completado de código en un solo turno: la suite de fencing 8/8 de v2 lo hace adecuado para generar fragmentos de código delimitados correctamente en contextos acotados, no para asistentes de codificación multi-turno.
- Reproducción de experimentos de *logit lens* y sondeo de capas: el modelo y su historial de mediciones permiten replicar el análisis de coste en la frontera de cada bloque.
- Experimentos de ajuste fino posteriores: los adaptadores v1 y v2 publicados sirven como punto de partida para ciclos adicionales de sanado orientados a corregir bucles y formato de agente.
- Docencia sobre técnicas de cuantización y despliegue: las GGUFs Q4_K_M (10,1 GB) y Q8_0 permiten ilustrar el compromiso entre tamaño, velocidad y calidad en llama.cpp.

## Benchmarks y rendimiento

Los datos provienen de la batería interna del autor (39 tareas greedy), no de benchmarks académicos estándar.

| Modelo | Parametros | Tamano de archivo | Bateria (39 tareas greedy) | Velocidad (RTX 4060 + 3050) |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | n/a | no medible en hardware de referencia | n/a |
| Recorte de 48 capas | 20,8B | 12,9 GB | 33/39 | 5 t/s |
| Whittle sin reparar | 16,8B | 10,1 GB | 25/39 | 20,5 t/s |
| Whittle sanado (v1) | 16,8B | 10,1 GB | 36/39 | 18,5–20,9 t/s |

Comprobaciones de regresión de v2 frente a v1:

| Comprobacion | Resultado v2 |
|---|---|
| Suite de cerrado de código | 8/8 (v1 emitía código fuera de bloques markdown) |
| Bucles en formato largo de un solo turno, mitigaciones desactivadas | 1/6 |
| Bateria (39 tareas greedy), regresión contenida | 35/39 |
| Sonda de reconocimiento, regresión contenida | 5/7 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,1 GB con GGUF Q4_K_M; aproximadamente el doble con Q8_0; los pesos bf16 en safetensors rondan los 32 GB.
- GPU recomendadas: el autor reporta funcionamiento en RTX 4060 + RTX 3050 (8 GB cada una) con reparto de capas; una A100 se usó para el ciclo de sanado.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB mediante GGUF Q4_K_M, incluyendo RTX 3060/4060 y similares; también en configuraciones multi-GPU modestas.
- Opciones de despliegue: llama.cpp con las GGUFs v2 (recomendado por el autor); los safetensors bf16 permiten servir con vLLM o TGI, aunque no se documentan configuraciones validadas.
- Flags de servicio recomendados: `--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 4 --repeat-penalty 1.15 --repeat-last-n 512`.
- Latencia y throughput: 18,5–20,9 t/s en RTX 4060 + 3050 con Q4_K_M; 5 t/s para el recorte de 48 capas en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-16B | 16,34B | no disponible | 36/39 batería interna; ~20 t/s en 2×8 GB | Apache 2.0 | Hugging Face (logic65) |
| Qwen3.8-27B (base) | 26,9B | no disponible | no medible en hardware de referencia | no disponible | Hugging Face (Qwen) |
| Recorte de 48 capas (variante del autor) | 20,8B | no disponible | 33/39 batería interna; 5 t/s | Apache 2.0 | Hugging Face (logic65) |
| Whittle sin reparar | 16,8B | no disponible | 25/39 batería interna; 20,5 t/s | Apache 2.0 | Hugging Face (logic65) |

La comparación con modelos de código abierto de tamaño similar ajenos a esta línea de investigación no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Bucles de repetición severos en generaciones extendidas, conversaciones multi-turno y bucles de agente (asistentes de código, uso de herramientas); el autor lo califica de no apto para esos escenarios incluso con DRY sampling.
- Es un *research preview* que requiere post-entrenamiento; no debe usarse como referencia factual ni en sistemas de producción.
- El autor recomienda explícitamente no confiar en él para datos factuales; el riesgo de alucinación es alto en un modelo podado y sanado con solo 11M tokens.
- La recuperación de conocimiento de cola larga es parcial (5/7 en la sonda de reconocimiento), lo que indica lagunas factuales persistentes.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados no están disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de investigación y los fallos de bucle desaconsejan cualquier despliegue productivo.
- Solo deben usarse los pesos v2 (`-v2-` GGUFs); los v1 se mantienen únicamente por reproducibilidad y presentan fallos de cerrado de código.
- El modelo base es una cuantización FP8 de Qwen3.8-27B, lo que puede introducir diferencias respecto al base original en precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de investigación companion (Whittle sin reparar): https://huggingface.co/logic65/Qwen3.8-p44w75-16.8B-unrepaired
- Línea actual Whittle-Next / Whittle-Qwen-3.8: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Apoyo al autor: https://ko-fi.com/davida81328
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
