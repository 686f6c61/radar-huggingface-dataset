# mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B es una variante podada y cuantizada a 4 bits del modelo MoE Qwen3.5-35B-A3B, publicada por la comunidad mlx-community con el toolkit mlx-optiq. El modelo conserva 128 de los 256 expertos enrutados por capa (un 50 % de retencion uniforme), lo que reduce el numero de parametros de 35,1B a 18,8B y el peso en disco de 21,9 GB a 12,8 GB. Los expertos activos por token siguen siendo 8, de modo que el coste computacional por token no cambia: el modelo ocupa menos memoria sin volverse mas lento.

La innovacion principal es aplicar la tecnica REAP (Cerebras Research, ICLR 2026) directamente sobre un checkpoint ya cuantizado, sin pasar por un padre en BF16 ni des-cuantizar los expertos supervivientes. Los expertos conservados se copian bit a bit del modelo base, por lo que no hay reentrenamiento ni fusion de pesos. La seleccion de expertos se hace ordenando por la media condicional de peso de router multiplicado por la norma de salida del experto sobre un conjunto de calibracion de seis dominios.

Es relevante para quienes ejecutan modelos MoE de gran tamano en Apple Silicon con memoria unificada limitada: el checkpoint requiere unos 11,7 GB de memoria para inferencia y se sirve con MLX de forma nativa. La divergencia KL respecto al padre sin podar es de 0,067, un valor bajo que sugiere degradacion limitada en generacion, aunque el autor advierte que esta variante concreta no se ha evaluado con benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parametros totales | 18.990.568.816 (18,8B) |
| Parametros activos | 8 expertos enrutados por token (top-8); numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (OptiQ); pesos ya cuantizados en el checkpoint |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Datos adicionales: 128 de 256 expertos retenidos por capa con asignacion uniforme; tamano en disco 12,8 GB frente a 21,9 GB del padre (−42 %); memoria de inferencia estimada 11,7 GB; sin sidecar MTP; calibracion con mezcla de seis dominios de optiq y 8 muestras.

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de tipo top-8: cada token activa 8 expertos enrutados de los 256 originales por capa. La poda REAP elimina el 50 % de los expertos almacenados en cada capa (128 de 256) y recorta el router para que coincida con el nuevo banco de expertos; el enrutamiento top-8 se mantiene intacto, por lo que el numero de expertos activos por token y, con ello, el coste de computo por token no varia. La seleccion se basa en la media condicional de peso de router por norma de salida del experto, calculada sobre los tokens que cada experto atendio durante la calibracion.

No hay entrenamiento adicional: los expertos retenidos se copian bit a bit del checkpoint cuantizado padre (mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit), sin des-cuantizar, recuantizar, fusionar ni reentrenar. La poda se ejecuta en el dominio cuantizado mediante `optiq prune-experts`, una innovacion del toolkit que evita la perdida de precision asociada a des-cuantizar y volver a cuantizar. No se dispone de informacion sobre el volumen de tokens de preentrenamiento, la composicion del dataset original ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado de text-generation.
- Razonamiento y matematicas: el modelo base pertenece a la familia Qwen3.5, orientada a tareas de razonamiento; no hay evaluacion especifica de esta variante.
- Generacion de codigo: la receta de referencia conserva la capacidad de HumanEval con una perdida de solo −1,3 puntos.
- Seguimiento de instrucciones: la receta de referencia mejora IFEval (+4,3) tras la poda.
- Tool calling y function calling: BFCL se mantiene practicamente intacto en la receta de referencia (−1,0).
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente para esta variante.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta informado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles para este checkpoint.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 11,7 GB de memoria estimada, el modelo cabe en equipos Apple Silicon de 16 GB o mas y permite ejecutar un MoE de 35B original en un portatil, usando `optiq serve` o `mlx_lm`.
- Servicio de chat conversacional en prototipos: el pipeline text-generation y la licencia Apache 2.0 permiten desplegar un asistente multi-turno sin restricciones comerciales, con un consumo de memoria muy inferior al del modelo sin podar.
- Asistencia de codigo en editor local: la receta de referencia mantiene HumanEval con una perdida marginal (−1,3), por lo que el modelo sigue siendo util para autocompletado y generacion de funciones en un entorno de desarrollo integrado que consuma la API de MLX.
- Evaluacion de pipelines de agentes con tool calling: BFCL practicamente intacto (−1,0) permite usar el modelo como planificador en flujos que invocan funciones externas, con la ventaja de que el checkpoint ocupa un 42 % menos en disco.
- Investigacion sobre compresion de MoE: el checkpoint sirve como caso de estudio reproducible de poda REAP en el dominio cuantizado, con divergencia KL 0,067 respecto al padre, para comparar tecnicas de pruning en hardware de consumo.
- Despliegue en entornos con almacenamiento limitado: los 12,8 GB frente a 21,9 GB del padre reducen el coste de distribucion y el tiempo de carga en contenedores o imagenes de disco.
- Pruebas de regresion de calidad tras poda: util para equipos que quieran medir la degradacion real de sus propias tareas antes de adoptar variantes podadas en produccion.

## Benchmarks y rendimiento

El autor indica explicitamente que esta variante no se ha evaluado con benchmarks propios. Los unicos datos publicados corresponden a la receta validada sobre Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, misma arquitectura y mismo 50 % de retencion:

| Benchmark | Cambio frente al padre sin podar |
|---|---|
| Capability Score | 80,03 -> 76,57 |
| MMLU | −21,4 |
| GSM8K | +2,6 |
| IFEval | +4,3 |
| BFCL | −1,0 |
| HumanEval | −1,3 |

Mediciones propias de este checkpoint: divergencia KL respecto al padre sin podar de 0,067 (los checkpoints que degradan visiblemente superan 1,0). La regla de ranking se eligio puntuando ambos candidatos contra el modelo sin podar, lo que selecciono la media condicional.

## Requisitos de hardware

- Memoria para inferencia: aproximadamente 11,7 GB segun el autor; el repo ocupa 12,8 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada; no se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en consumer hardware: si, en equipos Apple Silicon con 16 GB de memoria unificada o superior; en 8 GB no es viable.
- Opciones de despliegue: MLX (`mlx_lm`) y el servidor `optiq serve` del toolkit mlx-optiq. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. El autor afirma que el coste por token no cambia respecto al padre porque los expertos activos por token se mantienen en 8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B (este) | 18,8B (8 expertos activos) | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, MLX |
| Qwen3.5-35B-A3B-OptiQ-4bit (padre) | 35,1B (8 expertos activos) | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, MLX |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 18,8B (8 expertos activos) | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, MLX |

No se dispone de datos de contexto, rendimiento ni benchmarks de los modelos comparados mas alla de los porcentajes de retencion y los cambios de benchmark de la receta de referencia.

## Limitaciones y advertencias

- La poda elimina el 50 % de los expertos: la receta de referencia muestra una caida notable en MMLU (−21,4 puntos), lo que sugiere perdida de conocimiento factual y academico.
- El autor no ha evaluado esta variante con benchmarks; los datos de calidad proceden de otro checkpoint de la misma receta y deben tratarse como indicativos.
- Riesgo de alucinacion: no cuantificado para esta variante; la degradacion en MMLU aconseja validacion en tareas que dependan de conocimiento factual.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Dependencia de MLX y Apple Silicon: el checkpoint no es portable a otros runtimes sin conversion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 y de la receta REAP citada.
- Sin sidecar MTP: no se dispone de decodificacion especulativa multi-token en este checkpoint.
- La calibracion se realizo con solo 8 muestras de seis dominios, lo que puede sesgar la seleccion de expertos hacia esos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B
- Modelo base cuantizado: https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit
- Receta de referencia validada: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Paper REAP (arXiv): https://arxiv.org/abs/2510.13999
- Toolkit mlx-optiq: https://mlx-optiq.com
- Documentacion de poda: https://mlx-optiq.com/docs/prune
- Catalogo de modelos OptiQ: https://mlx-optiq.com/models
