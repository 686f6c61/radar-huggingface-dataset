# Jundot/DeepSeek-V4-Flash-0731-oQ2.5e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ2.5e-mtp es una cuantizacion mixta de precision del modelo DeepSeek-V4-Flash-0731, publicada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El checkpoint conserva la estructura del modelo original, incluyendo el modulo de decodificacion especulativa DSpark (MTP, multi-token prediction), y esta empaquetado en formato MLX para su ejecucion en hardware Apple Silicon. El modelo base es un lanzamiento oficial de DeepSeek con capacidades agenticas mejoradas, aunque la model card de esta cuantizacion no detalla la arquitectura interna ni los datos de entrenamiento del original.

El interes principal de esta ficha radica en el ejercicio de compresion: se reduce un modelo de 304.180 millones de parametros a un checkpoint de 113,25 GiB con un promedio efectivo de 3,198 bits por peso (3,114 bits/peso en el backbone linguistico), manteniendo licencia MIT. La cuantizacion asigna bits por sensibilidad medida de cada capa y aplica una matriz de importancia de 1024 muestras por 512 tokens, con un reajuste ponderado de escala y sesgo por minimos cuadrados.

La version actual fue recuantizada el 19 de noviembre de 2026 con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad. Es relevante para desarrolladores que quieran evaluar modelos de gran escala en equipos con memoria unificada de Apple, aunque las limitaciones de la cuantizacion a 2-3 bits y la ausencia de datos de benchmarks en la informacion disponible obligan a tratarlo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deepseek_v4); estructura identica a DeepSeek-V4-Flash-DSpark con modulo de decodificacion especulativa MTP |
| Parametros totales | 304.180.418.494 (304,180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64), MXFP4 (grupo 32), affine 8-bit (grupo 64), MXFP8 (grupo 32), BF16, FP32, I32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base DeepSeek-V4-Flash-0731 mas alla de su identificador de arquitectura `deepseek_v4` y de la mencion a una estructura equivalente a DeepSeek-V4-Flash-DSpark con un modulo de decodificacion especulativa adjunto. El checkpoint incluye el modelo linguistico y los pesos MTP de DSpark, lo que sugiere soporte de prediccion multi-token para acelerar la generacion. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El trabajo tecnico destacable de esta publicacion es la cuantizacion. oQ2.5e distribuye los bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia construida con 1024 muestras de 512 tokens, seguida de un reajuste ponderado por minimos cuadrados de escala y sesgo. El resultado se reparte en ocho formatos de almacenamiento: el 48,007% de los pesos logicos (146,029B) queda en affine 2-bit, el 43,065% (130,997B) en affine 3-bit, el 6,354% (19,327B) en MXFP4, y el resto en affine 8-bit, MXFP8, BF16, FP32 e I32. El backbone linguistico ocupa 110,678 GB y el cabezal MTP 10,926 GB.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`; no se detallan capacidades adicionales en la informacion disponible.
- Decodificacion especulativa: incluye los pesos MTP de DSpark, lo que habilita prediccion multi-token para acelerar la inferencia.
- Capacidades agenticas: la model card del modelo base menciona "enhanced agentic capabilities", aunque no se especifica el alcance concreto (tool calling, planificacion multi-paso, etc.).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de modelos de gran escala en Apple Silicon: el checkpoint MLX de 113,25 GiB permite cargar un modelo de 304B parametros en equipos con memoria unificada amplia (por ejemplo, Mac Studio con 192 GB o superior), algo inviable con pesos en BF16.
- Prototipado de agentes en local: la presencia del cabezal MTP de DSpark y las capacidades agenticas del modelo base lo hacen adecuado para experimentar con flujos de razonamiento multi-paso y decodificacion especulativa sin depender de la nube.
- Investigacion sobre cuantizacion extrema: el reparto documentado por capas y formatos (2, 3, 4, 8 y 16 bits) sirve como caso de estudio reproducible para medir el impacto de la precision mixta en la calidad de salida.
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia MIT facilita su integracion en productos comerciales y en proyectos internos sin restricciones de uso.
- Despliegue de referencia para comparativas: util como baseline cuantizado frente a otras tecnicas (GGUF, AWQ, GPTQ) al evaluar throughput y fidelidad en hardware Apple.
- Pruebas de inferencia offline en estaciones de trabajo: al no requerir GPU dedicada, puede ejecutarse en portatiles y equipos de escritorio con memoria unificada suficiente, util para demostraciones y validacion de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 113,25 GiB de almacenamiento de pesos; la memoria de trabajo para inferencia (KV cache, activaciones) debe sumarse y no esta cuantificada en la informacion disponible.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (memoria unificada); no se indica compatibilidad con A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no aplicable en el sentido habitual; requiere equipos Apple con memoria unificada de al menos 128 GB, preferiblemente 192 GB o mas para margen de contexto y activaciones.
- Opciones de despliegue: libreria MLX (oMLX); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-oQ2.5e-mtp | 304,180B | no disponible | MLX safetensors, 3,198 bits/peso efectivos | MIT | Hugging Face (1319 descargas) |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304,180B | no disponible | no disponible | MIT (segun esta ficha) | Hugging Face |
| DeepSeek-V4-Flash-DSpark | no disponible | no disponible | no disponible | no disponible | mencionado como estructura equivalente |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La cuantizacion a 2 y 3 bits en la mayor parte de los pesos (91,07% de los pesos logicos) puede degradar la calidad frente al modelo original; no se aportan metricas de perdida de rendimiento.
- No hay benchmarks publicados en la informacion disponible, por lo que no es posible validar la fidelidad de la cuantizacion.
- El modelo esta empaquetado para MLX y hardware Apple Silicon; no es desplegable directamente en GPUs NVIDIA o AMD sin conversion adicional.
- El tamano de 113,25 GiB exige equipos con memoria unificada muy alta; no cabe en configuraciones consumer habituales.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base, no descritos aqui.
- Idiomas soportados no informados; no se puede garantizar cobertura multilingue.
- La licencia MIT se hereda del modelo base; conviene verificar el archivo `LICENSE` del repositorio antes de un uso comercial.
- El autor recomienda volver a descargar si se tenia una copia anterior a la recuantizacion del 19 de noviembre de 2026.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2.5e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
