# patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1

## Resumen

Este repositorio contiene una cabeza de borrador (draft head) de **DSpark MTP** afinada por `patrickbdevaney` para el checkpoint base [`0xSero/DeepSeek-V4-Flash-0731-REAP`](https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP), una variante cuantizada en MXFP4 de DeepSeek-V4-Flash. El objetivo es mejorar la tasa de aceptación de la decodificación especulativa en un sistema de inferencia CUDA puro ejecutado sobre un **Jetson AGX Thor** (`sm_110a`). No es un modelo de lenguaje completo, sino un componente de aceleración que se integra dentro del checkpoint base como tres bloques MTP encadenados (`mtp.0/1/2`, capas 40/41/42).

La cabeza se publica como el mejor resultado de once candidatos medidos en un programa de optimización en curso. Según las mediciones incluidas en el repositorio, alcanza una aceptación media de **3.8413 sobre 5** en la suite de evaluación, lo que supone una mejora del **25.3 %** en tokens por segundo frente a la cabeza stock del checkpoint base (de 22.66 a 28.38 tok/s) y un factor de **1.97×** frente a la decodificación autoregresiva base (14.61 tok/s). La aceleración es **pérdida cero por construcción**: cada token emitido es bit-idéntico al que produciría la decodificación AR.

La relevancia de esta pieza radica en que demuestra la viabilidad de optimizar cabezas de borrador DSpark para acelerar la generación especulativa en hardware de borde (edge), un área de creciente interés para la inferencia de modelos grandes en dispositivos con recursos limitados. El autor publica el modelo junto con todos los datos de entrenamiento, métricas de evaluación y los quince candidatos descartados en la carpeta `arms/`, para que la comunidad pueda reproducir y extender el trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark MTP draft head: 3 bloques MTP encadenados (mtp.0/1/2) sobre el checkpoint base DeepSeek-V4-Flash-0731-REAP |
| Parametros totales | no disponible (el repositorio contiene 72 tensores `mtp.*`, peso total 16.6 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del checkpoint base) |
| Tipos de cuantizacion | FP8 (tags del repo); el checkpoint base usa MXFP4 nativo |
| Idiomas soportados | no disponible (depende del checkpoint base) |
| Licencia | other (sigue la licencia del checkpoint base `0xSero/DeepSeek-V4-Flash-0731-REAP`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema **DSpark** de DeepSeek: un backbone de borrador paralelo combinado con una cabeza secuencial pequeña para reducir el decaimiento de sufijo en la predicción multi-token. En este caso, la cabeza se integra directamente en el checkpoint base como tres bloques MTP (`mtp.0/1/2`, shards 46-48, 6.6 GB) que operan sobre las capas 40/41/42 del modelo. El ancho de bloque de borrador es **5** (`dspark_block_size`), y la aceptación se mide sobre ese ancho.

El entrenamiento se realizó sobre un corpus balanceado de **1536 prompts**, con una función de pérdida combinada de **cross-entropy (CE)** y **token-verification (TV)** ponderada con un ancla beta (β=0.1). Se probaron once candidatos en total, de los cuales el presente (`s3recap-p25-b0.1`) es el que obtuvo la mejor puntuación media en la suite de evaluación. El proceso incluyó la corrección de una condición de carrera en el motor de inferencia que afectaba a las cabezas anteriores, y se validó que dicha corrección no había costado rendimiento (resultado negativo limpio en el control `s3recap`). La cabeza se entrenó en el propio hardware objetivo (Jetson AGX Thor) con un servidor CUDA puro, sin dependencias externas.

La innovación clave es que la especulación **no altera la distribución de tokens**: cada token emitido es bit idéntico al que habría producido la decodificación autoregressive, lo que garantiza pérdida cero en la calidad de salida por construcción.

## Capacidades

- **Aceleración de generación especulativa**: permite generar texto de forma especulativa con una tasa de aceptación media de 3.84/5 tokens por bloque, acelerando la inferencia hasta 1.97× frente a la decodificación autoregressive.
- **Mejora selectiva por categoría**: eleva sustancialmente la aceptación en tareas de razonamiento (de 1.82 a 3.57), explicación (de 1.70 a 3.00) y generación de código (de 1.86 a 2.59) en comparación con la cabeza stock.
- **Compatibilidad con hardware de borde**: diseñada y validada en Jetson AGX Thor (sm_110a), lo que la hace apta para despliegues en dispositivos de bajo consumo.
- **Pérdida cero por construcción**: todos los tokens emitidos son bit idénticos a la salida autoregressive, por lo que no altera la calidad del modelo base.
- **Soporte de decodificación multi-token**: el ancho de bloque de 5 permite proponer múltiples tokens por paso de especulación, reduciendo la latencia de generación.
- **Distribución de aceptación variable**: la cabeza está optimizada para cargas de trabajo mixtas, pero no para todas las categorías (ver limitaciones).

## Casos de uso

- **Inferencia en dispositivos de borde**: el caso de uso principal es el despliegue en Jetson AGX Thor para aplicaciones de IA generativa en el borde, donde la limitación de VRAM y energía hace crítica la aceleración especulativa. La cabeza permite duplicar el throughput sin perder calidad.
- **Optimización de pipelines de generación de código**: en entornos de desarrollo asistido por IA, la alta aceptación en `code_gen` y `code_edit` (4.18/5) reduce la latencia de generación de fragmentos de código, mejorando la experiencia de los desarrolladores.
- **Sistemas de razonamiento y explicación**: con una aceptación de 3.57 y 3.00 en `reasoning` y `explanation`, es adecuada para cargas de trabajo de chat con razonamiento extendido, donde la especulación acelera la producción de pasos intermedios.
- **Chat multi-turno**: la aceptación de 4.83 en `multi_turn` la hace útil para asistentes conversacionales que mantienen contextos largos, reduciendo la latencia de respuesta.
- **Investigación en decodificación especulativa**: el repositorio incluye todos los datos de entrenamiento y métricas, lo que lo convierte en un caso de estudio valioso para investigadores que quieran reproducir o extender técnicas de optimización de draft heads.
- **Servidores de inferencia personalizados**: al estar diseñado para un servidor CUDA puro, se puede integrar en entornos de producción donde no se usan frameworks estándar como vLLM u Ollama, siempre que se adapte el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM completo, sino una cabeza de borrador para decodificación especulativa. En su lugar, la model card reporta las siguientes métricas de rendimiento medidas en el Jetson AGX Thor:

| Metrica | Valor |
|---|---|
| Aceptacion media (suite, tau) | 3.8413 / 5 (77 % del techo de ancho) |
| Throughput medio (tok/s) | 28.3825 |
| Throughput base autoregressive (tok/s) | 14.61 |
| Factor de aceleracion vs base | 1.97× |
| Throughput con cabeza stock (tok/s) | 22.66 |
| Mejora vs cabeza stock | +25.3 % |

Aceptacion por categoria (medida en bloque 5, comparando con la cabeza stock y el candidato `s3`):

| Categoria | Cabeza stock (run-0) | Cabeza s3 | Este modelo |
|---|---|---|---|
| long_context | 5.00 | 4.00 | 4.53 |
| agentic_format | 4.41 | 3.74 | 4.16 |
| code_edit | 4.08 | 3.85 | 4.18 |
| multi_turn | 4.06 | 5.21 | 4.83 |
| short_factual | 3.11 | 3.51 | 3.87 |
| reasoning | 1.82 | 3.70 | 3.57 |
| explanation | 1.70 | 2.94 | 3.00 |
| code_gen | 1.86 | 2.56 | 2.59 |
| **suite mean** | 3.2550 | 3.6888 | **3.8413** |

## Requisitos de hardware

- **VRAM estimada**: el repositorio completo pesa 16.6 GB, pero la cabeza en sí (72 tensores `mtp.*`) probablemente ocupa una fracción menor; el valor exacto no está especificado. El checkpoint base en MXFP4 requiere aproximadamente 16 GB en fp8.
- **GPU recomendada**: probado en NVIDIA Jetson AGX Thor (`sm_110a`). El servidor de inferencia es CUDA puro, por lo que se puede ejecutar en cualquier GPU NVIDIA compatible (RTX 4090, A100, H100, etc.), siempre que el motor lo soporte.
- **¿Cabe en consumer GPU?**: Sí, la cabeza en sí es ligera y el checkpoint base en MXFP4 cabe en GPUs consumer de 24 GB (RTX 3090/4090). La VRAM total depende del modelo base.
- **Opciones de despliegue**: el proyecto usa un servidor de inferencia CUDA a medida; no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI. Para usarlo en producción, es necesario integrarlo en un motor que soporte DSpark MTP.
- **Latencia y throughput**: 28.38 tok/s en el Jetson AGX Thor, con una mejora de 1.97× frente a la decodificación autoregressive. En GPU más potentes (H100, A100) el throughput será mayor, aunque no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Rendimiento (tok/s) | Aceptacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo** (s3recap-p25-b0.1) | Draft head DSpark MTP | 16.6 GB (repo) | 28.38 (Jetson AGX Thor) | 3.8413/5 | other | HuggingFace |
| Cabeza stock (run-0) del checkpoint base | Draft head MTP | integrada en base | 22.66 | 3.2550/5 | other | en el checkpoint base |
| Cabeza `s3` (candidato anterior) | Draft head MTP | integrada en base | 25.1 (estimado) | 3.6888/5 | other | en `arms/` |

No se dispone de comparaciones con otros frameworks de decodificación especulativa (EAGLE-3, DFlash, etc.) porque el proyecto no incluye mediciones con ellos. Los datos de la web indican que DSpark en general ofrece 60-85 % de mejora sobre MTP-1 en producción, pero no se aplican directamente a este checkpoint específico.

## Limitaciones y advertencias

- **No es un modelo de lenguaje completo**: es un componente de aceleración que requiere el checkpoint base `0xSero/DeepSeek-V4-Flash-0731-REAP` y un motor de inferencia que soporte DTP MTP.
- **No pasa la regla de release del proyecto**: la cabeza no supera la barrera de aceptación mínima en las categorías reconstructivas; es corta por 0.27 en `long_context`, 0.05 en `agentic_format` y 0.13 en `reasoning`. Esto significa que para cargas de trabajo dominadas por reconstrucción de contexto largo, la cabeza stock puede ser mejor.
- **Distribución de aceptación variable**: la aceptación varía hasta 2.7× según la forma de la tarea. El usuario debe seleccionar la cabeza según su carga de trabajo real, no por la media.
- **Riesgo de alucinación y sesgos**: no hay datos específicos, pero al heredar las propiedades del checkpoint base (DeepSeek-V4-Flash), puede heredar los sesgos del modelo original.
- **Restricciones de licencia**: la licencia es `other` y sigue la del checkpoint base; hay que verificar los términos del modelo original antes de uso comercial.
- **Dependencia de un entorno específico**: los resultados medidos son de un único servidor CUDA sobre Jetson AGX Thor; la compatibilidad con otros motores o arquitecturas no está garantizada.
- **Datos de entrenamiento**: el corpus de 1536 prompts es de tamaño reducido y puede no cubrir todos los dominios; la cabeza puede comportarse peor en tareas fuera de esa distribución.

## Enlaces

- **Repositorio HuggingFace**: https://huggingface.co/patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1
- **Checkpoint base**: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- **Wiki de afinamiento de draft head**: https://github.com/patrickbdevaney/deepseek-v4-flash-0731-cuda/blob/main/wiki/draft-head-finetuning.md
- **Repo GitHub del proyecto**: https://github.com/patrickbdevaney/dspark-cuda-reap-finetune
- **Artículo sobre DSpark (MarkTechPost)**: https://www.marktechpost.com/2026/06/27/deepseek-releases-dspark-a-speculative-decoding-framework-that-accelerates-deepseek-v4-per-user-generation-60-85-over-mtp-1/
- **Liquid AI publica modelos DSpark para LFM2.5**: https://ai.wain.blog/en/liquid-ai-lfm25-dspark-speculative-decoding-ZHUT0dOM/
- **DeepSeek-V4-Pro-DSpark en HuggingFace**: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark
