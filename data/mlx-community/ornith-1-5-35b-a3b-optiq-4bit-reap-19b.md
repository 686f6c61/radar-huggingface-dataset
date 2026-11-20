# mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B es una variante podada y cuantizada del modelo MoE Ornith-1.5-35B-A3B, publicada por la comunidad mlx-community y construida con la herramienta mlx-optiq. Se trata de un checkpoint de 18.990.568.816 parámetros totales (18,8B) obtenido al eliminar el 50 % de los expertos enrutados del modelo padre (de 256 a 128 expertos por capa) y mantener la cuantización de 4 bits. El resultado ocupa 12,8 GB en disco frente a los 21,9 GB del padre, una reducción del 42 %, y requiere unos 14,5 GB de memoria para ejecutarse.

La relevancia de esta ficha reside en su naturaleza derivada: no es un modelo entrenado desde cero, sino un ejercicio de compresión de un MoE sobre Apple Silicon, aplicado directamente en el dominio cuantizado. La técnica de poda es REAP (Cerebras Research, ICLR 2026), que ordena los expertos según la media condicional del peso del router multiplicado por la norma de la salida del experto sobre datos de calibración, y elimina los peor valorados recortando el router en consecuencia. La arquitectura de referencia es `qwen3_5_moe`, con licencia Apache 2.0.

El interés práctico está en que reduce el requisito de memoria de un MoE de 35B a un rango asequible para equipos Apple Silicon de gama alta, manteniendo intacto el número de parámetros activos por token (8 expertos, top-8 routing). El autor advierte que esta variante concreta no se ha evaluado con benchmarks propios: la receta se validó sobre Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, de arquitectura idéntica y mismo ratio de retención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_5_moe`), top-8 routing |
| Parametros totales | 18.990.568.816 (18,8B) |
| Parametros activos | 8 expertos por token (sin cambio respecto al padre; total de activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (OptiQ); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo es un MoE de tipo `qwen3_5_moe` con 256 expertos enrutados por capa en su versión original, de los cuales se conservan 128 en todas las capas (asignación uniforme). El enrutamiento top-8 se mantiene, de modo que los parámetros activos por token no cambian: el banco de expertos almacenado se reduce, pero el coste computacional por token es el mismo. Los expertos supervivientes se copian bit a bit desde el checkpoint padre cuantizado; no hay desquantización, recuantización, fusión ni reentrenamiento. El router se recorta para coincidir con el nuevo número de expertos.

La poda se realizó con REAP aplicado en el dominio cuantizado mediante `optiq prune-experts`, usando una mezcla de calibración de seis dominios con 8 muestras. La regla de ordenación se eligió puntuando ambos candidatos contra el modelo sin podar, lo que seleccionó la media condicional. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO), ya que la model card no lo documenta. Tampoco se incluye el sidecar MTP (multi-token prediction) en esta variante.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y matemáticas: la receta de referencia reporta GSM8K +2,6 tras la poda, lo que sugiere que la capacidad procedimental se preserva.
- Generación de código: HumanEval −1,3 en la receta de referencia, degradación mínima.
- Seguimiento de instrucciones: IFEval +4,3 en la receta de referencia.
- Tool calling / function calling: BFCL −1,0 en la receta de referencia, lo que indica que la capacidad se mantiene prácticamente intacta.
- Razonamiento multi-paso y uso como agente: no documentado explícitamente para esta variante.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente local en Mac con Apple Silicon: el checkpoint requiere 14,5 GB de memoria, por lo que encaja en equipos con 24 GB o 32 GB de memoria unificada. Se ejecutaría con `mlx_lm` o `optiq serve` para conversación interactiva sin conexión.
- Prototipado de agentes con tool calling: el BFCL de la receta de referencia se mantiene dentro de 1 punto, lo que permite usar el modelo como planificador que invoca funciones en flujos de automatización local.
- Generación de código en el editor: con HumanEval prácticamente intacto en la receta validada, es adecuado para autocompletado y generación de funciones en un IDE conectado a un servidor MLX local.
- Evaluación de pipelines de compresión de MoE: sirve como caso de estudio reproducible de poda REAP en dominio cuantizado, comparando la divergencia KL (0,331) frente al padre sin podar.
- Procesamiento por lotes en estación de trabajo: el menor tamaño en disco (12,8 GB frente a 21,9 GB) reduce el coste de almacenamiento y carga de múltiples variantes en pruebas A/B.
- Tareas de seguimiento de instrucciones con formato estricto: el IFEval de la receta de referencia mejora tras la poda, lo que lo hace apto para extracción de datos estructurados y generación con plantillas.
- Despliegue en entornos con memoria limitada: cuando el modelo padre de 21,9 GB no cabe pero se necesita un MoE con routing top-8, esta variante es la opción directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este checkpoint concreto. El autor indica explícitamente que la variante no se evaluó por separado y que la receta se validó en Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, misma arquitectura y mismo 50 % de retención:

| Metrica (receta de referencia, Qwen3.6-35B-A3B) | Padre | Podado | Delta |
|---|---|---|---|
| Capability Score | 80,03 | 76,57 | −3,46 |
| MMLU | no disponible | no disponible | −21,4 |
| GSM8K | no disponible | no disponible | +2,6 |
| IFEval | no disponible | no disponible | +4,3 |
| BFCL | no disponible | no disponible | −1,0 |
| HumanEval | no disponible | no disponible | −1,3 |

Medición propia de este checkpoint: divergencia KL respecto al padre sin podar de 0,331 (el autor sitúa por encima de 1,0 los checkpoints que degradan visiblemente bajo poda).

## Requisitos de hardware

- Memoria para inferencia: 14,5 GB según el autor; el repo pesa 13,8 GB.
- Cabe en Apple Silicon con memoria unificada de 24 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en configuraciones de 16 GB no hay margen suficiente.
- GPU NVIDIA: no es el objetivo del checkpoint (formato MLX); para CUDA habría que recurrir al modelo base en otro formato.
- Despliegue: `mlx-optiq` (`optiq serve`) y `mlx_lm` (`load` + `generate`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. El autor señala que los parámetros activos por token no cambian, por lo que la velocidad de decodificación debería ser similar a la del padre, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B (este) | 18,8B (MoE, top-8) | no disponible | Apache 2.0 | safetensors MLX 4-bit | 12,8 GB en disco, 14,5 GB de memoria |
| mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit (padre) | 35,1B (MoE, top-8) | no disponible | Apache 2.0 | safetensors MLX 4-bit | 21,9 GB en disco; misma velocidad por token |
| mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | ~18,8B (MoE, top-8) | no disponible | no disponible | safetensors MLX 4-bit | Receta de referencia con benchmarks publicados |

## Limitaciones y advertencias

- No existen benchmarks propios de este checkpoint; las cifras de capacidad provienen de otro modelo de la misma arquitectura y deben tratarse como orientativas.
- La pérdida de capacidad en la receta de referencia se concentra en MMLU (−21,4), un deterioro severo en conocimiento factual y académico; el modelo podado no es equivalente al padre en ese eje.
- La poda elimina el 50 % de los expertos: aunque el routing top-8 se preserva, la diversidad efectiva del banco de expertos se reduce y puede afectar a dominios poco representados en la calibración (8 muestras de seis dominios).
- Divergencia KL de 0,331 respecto al padre: el autor la considera dentro del rango aceptable, pero implica diferencias medibles en la distribución de salida.
- No hay sidecar MTP, por lo que no se puede usar decodificación especulativa multi-token con este checkpoint.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin verificarla.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la degradación en MMLU.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene conservar los avisos de atribución del modelo base y de la herramienta de compresión.
- Formato MLX exclusivo: no es desplegable directamente en CUDA ni en runtimes estándar de servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B
- Modelo padre: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Receta de referencia validada: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Paper REAP: https://arxiv.org/abs/2510.13999
- Herramienta mlx-optiq: https://mlx-optiq.com
- Documentación de poda: https://mlx-optiq.com/docs/prune
- Catálogo de modelos OptiQ: https://mlx-optiq.com/models
- Documentación general: https://mlx-optiq.com/docs/
