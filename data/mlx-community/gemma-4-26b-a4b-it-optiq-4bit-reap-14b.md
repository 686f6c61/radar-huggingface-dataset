# mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B

## Resumen

`mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B` es una versión podada y cuantizada a 4 bits del modelo Gemma 4 26B-A4B instruct, publicada por la comunidad MLX para ejecución local en Apple Silicon. El modelo parte de `mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit` y aplica REAP (*Router-weighted Expert Activation Pruning*), una técnica de poda de expertos en arquitecturas Mixture-of-Experts (MoE) que elimina el 50 % de los expertos enrutados de cada capa manteniendo intacto el número de parámetros activos por token.

El resultado es un checkpoint de 14,3 mil millones de parámetros totales (frente a 25,8 B del padre) que ocupa 10,4 GB en disco y requiere unos 9,4 GB de memoria en inferencia, con una reducción del 40-42 % en almacenamiento y pico de memoria. El precio es una pérdida medible de capacidad: el *Capability Score* agregado cae de 75,75 a 68,13, con degradaciones especialmente severas en MMLU (−26,1 puntos) y HumanEval (−18,2), aunque con una mejora inesperada en IFEval (+7,8).

La relevancia del modelo es doble. Por un lado, demuestra que la poda de expertos en el dominio cuantizado es viable sin dequantizar ni reentrenar, lo que abre la puerta a comprimir MoE grandes para hardware de consumo. Por otro, sirve como caso de estudio de los límites de REAP cuando el modelo base enruta sobre 128 expertos (frente a los 256 de las familias Qwen), donde la divergencia respecto al padre (KL 0,56) es notablemente mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con enrutamiento top-8, podado con REAP |
| Parámetros totales | 14.381.534.926 (14,3 B) |
| Parámetros activos | 8 expertos por token (sin cambios respecto al padre); total activo no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (OptiQ), pesos en dominio cuantizado; otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B-A4B: un transformer con capas MoE de 128 expertos enrutados por capa y enrutamiento top-8. Sobre esa base, OptiQ aplica REAP en el dominio cuantizado: los expertos se ordenan por la media condicional del producto entre peso del router y norma de la salida del experto sobre un conjunto de calibración (mezcla de seis dominios, 8 muestras), y se eliminan los peor rankeados, recortando el router para que coincida. En este checkpoint se retienen 64 de 128 expertos por capa con asignación uniforme, y los expertos supervivientes se copian bit a bit desde el padre cuantizado: no hay dequantización, re-cuantización, fusión ni reentrenamiento.

La innovación clave es que el número de parámetros activos por token no cambia, ya que el enrutamiento top-8 se preserva y solo se reduce el banco de expertos almacenado; de ahí que el modelo sea más pequeño sin ser más lento. El autor documenta que Gemma 4 sufre más que los modelos Qwen con la misma retención del 50 % (KL 0,56 frente a 0,07-0,13), atribuido a que enruta sobre 128 expertos en lugar de 256. No se dispone de información sobre el dataset de preentrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional en modo instruct (`-it`), orientada a diálogo multi-turno.
- Razonamiento y matemáticas: GSM8K se mantiene en 89,1 tras la poda, lo que indica que la capacidad aritmética de varios pasos resiste bien la compresión.
- Seguimiento de instrucciones: IFEval sube a 80,8, por encima del padre (73,0).
- Tool calling / function calling: BFCL-V3 se mantiene en 90,0, con solo 1,5 puntos de caída, lo que sugiere que el enrutamiento de funciones y la selección de herramientas siguen siendo fiables.
- Recuperación en contexto largo: HashHop cae solo 3 puntos (41,0 → 38,0).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.
- No se documenta soporte explícito de agentes multi-paso más allá de lo que implica BFCL-V3.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo cabe en 9,4 GB de memoria, por lo que puede ejecutarse en un MacBook con 16 GB de RAM unificada mediante `mlx-optiq serve` o `mlx_lm`, sin GPU dedicada.
- Automatización de soporte con tool calling: su BFCL-V3 de 90,0 permite integrarlo en flujos donde el modelo debe elegir y parametrizar funciones (consultas a bases de datos, APIs internas) con una fiabilidad casi idéntica a la del padre.
- Razonamiento aritmético y resolución de problemas de varios pasos: GSM8K de 89,1 lo hace adecuado para asistentes de cálculo, validación de facturas o tutoría matemática, donde la poda apenas ha mermado el rendimiento.
- Seguimiento estricto de instrucciones y formato de salida: con IFEval de 80,8, es una opción razonable para generar respuestas estructuradas (JSON, plantillas) en pipelines de extracción de datos.
- Prototipado y experimentación en investigación sobre poda MoE: sirve como referencia reproducible para estudiar el impacto de REAP en modelos con 128 expertos y comparar con las curvas de retención del 75 % (`--retain 96`, KL 0,33).
- Despliegue en entornos con restricciones de memoria: aplicaciones de escritorio, plugins de IDE o herramientas CLI donde 10,4 GB de pesos son manejables pero 17,5 GB no.
- Tareas de recuperación sobre contextos largos moderadamente exigentes: HashHop de 38,0 permite usarlo en búsqueda de agujas en contexto, aunque con menor margen que el padre.

## Benchmarks y rendimiento

| Benchmark | Padre (26B-A4B) | Este modelo | Δ |
|---|---|---|---|
| MMLU | 65,0 | 38,9 | −26,1 |
| GSM8K | 93,8 | 89,1 | −4,7 |
| IFEval | 73,0 | 80,8 | +7,8 |
| BFCL-V3 | 91,5 | 90,0 | −1,5 |
| HumanEval | 90,2 | 72,0 | −18,2 |
| HashHop | 41,0 | 38,0 | −3,0 |
| Capability Score | 75,75 | 68,13 | −7,62 |

## Requisitos de hardware

- VRAM / memoria unificada estimada: 9,4 GB de pico en inferencia (frente a 16,4 GB del padre); 10,4 GB en disco.
- GPU recomendadas: hardware Apple Silicon con memoria unificada; el modelo está empaquetado para MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en Mac con 16 GB de memoria unificada o superior; no se documenta compatibilidad con GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-optiq serve` (servidor) y `mlx_lm` (librería Python); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que al preservar top-8 el modelo "no se vuelve más lento", pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capability Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (REAP-14B) | 14,3 B (8 activos/token) | no disponible | 68,13 | Apache 2.0 | Hugging Face (MLX) |
| gemma-4-26B-A4B-it-OptiQ-4bit (padre) | 25,8 B | no disponible | 75,75 | Apache 2.0 | Hugging Face (MLX) |
| Gemma 4 26B-A4B con retención 96/128 | no disponible | no disponible | no disponible (KL 0,33) | Apache 2.0 | vía `optiq prune-experts` |
| Qwen MoE con poda REAP al 50 % | no disponible | no disponible | no disponible (KL 0,07-0,13) | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación severa en conocimiento factual: MMLU cae 26,1 puntos, de 65,0 a 38,9; no es adecuado para tareas que dependan de conocimiento enciclopédico amplio.
- Pérdida notable en generación de código: HumanEval baja 18,2 puntos (90,2 → 72,0), muy por encima de lo que se observa en modelos Qwen podados con la misma retención.
- Divergencia alta respecto al padre: KL de 0,56 frente a 0,07-0,13 en Qwen, indicando que la poda altera sustancialmente la distribución de salida.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad ni de tasas de alucinación.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento multilingüe tras la poda.
- Longitud de contexto no disponible: no se especifica la ventana máxima efectiva del checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia y los términos del modelo base Gemma 4 original, no incluidos en esta información.
- Dependencia de plataforma: empaquetado exclusivamente para MLX y Apple Silicon; no hay pesos GGUF ni compatibilidad con ecosistemas CUDA.
- El autor advierte explícitamente de que, si el compromiso no encaja con la carga de trabajo, existen alternativas con mayor retención (96 de 128 expertos, KL 0,33) a costa de un ahorro menor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit-REAP-14B
- Modelo base cuantizado: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-OptiQ-4bit
- Paper REAP (arXiv:2510.13999): https://arxiv.org/abs/2510.13999
- Toolkit mlx-optiq: https://mlx-optiq.com
- Catálogo de modelos OptiQ: https://mlx-optiq.com/models
- Documentación de OptiQ: https://mlx-optiq.com/docs/
- Documentación de poda de expertos: https://mlx-optiq.com/docs/prune
