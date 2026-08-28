# mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit-REAP-18B

## Resumen

KAT-Coder-V2.5-Dev-OptiQ-4bit-REAP-18B es una versión podada y cuantizada del modelo de codificación KAT-Coder-V2.5-Dev, desarrollado por Kwaipilot y adaptado al ecosistema MLX por mlx-community. El modelo original es un Mixture-of-Experts (MoE) de 34,7 mil millones de parámetros totales con 3 mil millones activos por token, construido sobre la base Qwen3.6-35B-A3B y orientado a tareas de ingeniería de software autónoma dentro de repositorios ejecutables.

Esta variante aplica poda de expertos mediante el método REAP (Cerebras Research, ICLR 2026) directamente sobre el checkpoint cuantizado en 4-bit, eliminando el 50 % de los expertos enrutados (128 de 256 por capa) sin alterar el número de expertos activos por token (top-8). El resultado es un modelo de 18,3 mil millones de parámetros que ocupa 11,4 GB en disco (frente a 20,4 GB del padre) y requiere 14,4 GB de memoria pico, lo que permite ejecutarlo en equipos Apple Silicon con 16 GB o más de RAM unificada.

La relevancia de este modelo radica en que demuestra una vía práctica para comprimir MoE de gran tamaño sin reentrenamiento ni de-cuantización, manteniendo la capacidad procedimental (generación de código, razonamiento) con una pérdida mínima en conocimiento general. Está publicado bajo licencia Apache-2.0 y es compatible con MLX, vLLM, SGLang y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B, 256 expertos por capa (128 retenidos) |
| Parametros totales | 18,3B (segun model card, tras poda; el padre tiene 34,7B). El archivo safetensors reporta 3.354.061.952 (~3,35B), posiblemente contabilizando solo pesos activos |
| Parametros activos | 3B (top-8 routing, sin cambios) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un MoE con 256 expertos por capa y selección top-8, lo que significa que solo 8 expertos se activan por token. La poda REAP elimina 128 expertos por capa de forma uniforme, conservando los 128 de mayor relevancia según una métrica de rango basada en la media condicional del peso del router multiplicado por la norma de salida del experto, calculada sobre datos de calibración (mezcla de seis dominios de OptiQ, 8 muestras). Los expertos retenidos se copian bit a bit del padre cuantizado, sin de-cuantización, re-cuantización, fusión ni reentrenamiento.

La divergencia KL medida entre este checkpoint y el padre sin podar es de 0,213, un valor muy por debajo del umbral de 1,0 donde la degradación se vuelve visible en la generación. El modelo no incluye el sidecar MTP (multi-token prediction) del padre. Al operar directamente en el dominio cuantizado, la poda no requiere un checkpoint BF16 intermedio, lo que reduce el coste computacional del proceso.

## Capacidades

- Generacion de texto y codigo: produce codigo en multiples lenguajes, con capacidad de razonamiento y depuracion.
- Razonamiento multi-paso: apto para tareas de ingenieria de software que requieren planificacion y ejecucion de pasos intermedios.
- Soporte de tool calling y function calling: heredado del modelo base KAT-Coder-V2.5-Dev, disenado para interaccion con herramientas y entornos de ejecucion.
- Capacidades de agente: puede operar como agente autonomo dentro de repositorios ejecutables, resolviendo issues y generando parches.
- Multilingue: no especificado en la informacion disponible; el modelo base esta orientado principalmente a ingles y codigo.
- Solo texto: no soporta vision ni audio.

## Casos de uso

- Asistente de codificacion local en Mac: gracias a su tamano reducido (11,4 GB en disco, 14,4 GB de memoria pico), puede ejecutarse en un MacBook con 16 GB de RAM unificada usando MLX, proporcionando autocompletado y generacion de codigo sin conexion.
- Agente de ingenieria de software autonomo: el modelo base esta entrenado para trabajar en repositorios ejecutables, por lo que puede recibir un issue, explorar el codigo, generar un parche y ejecutar tests, todo de forma local.
- Generacion de codigo en entornos sin GPU: al ser un MoE con solo 3B de parametros activos, la latencia de inferencia es baja incluso en CPU o GPU integrada de Apple, lo que lo hace util en CI/CD o entornos de desarrollo sin aceleradores dedicados.
- Refactorizacion y revision de codigo: puede analizar un repositorio completo, identificar code smells, proponer refactorizaciones y generar documentacion, aprovechando su ventana de contexto (aunque no se ha especificado la longitud exacta).
- Tutor de programacion local: estudiantes y desarrolladores pueden usarlo como mentor de codigo privado, sin enviar datos a la nube, gracias a la licencia Apache-2.0 y al despliegue local.
- Integracion en pipelines de desarrollo: mediante tool calling, puede conectarse a APIs de gestion de tareas, sistemas de control de versiones y runners de CI para automatizar tareas como generacion de tests, analisis estatico o creacion de releases.

## Benchmarks y rendimiento

Este checkpoint no fue evaluado por separado. La model card indica que se publica bajo la receta validada en el modelo Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, que comparte arquitectura y tasa de retencion de expertos (50 %). Los resultados de ese modelo de referencia son:

| Benchmark | Parent (sin podar) | REAP-19B | Delta |
|---|---|---|---|
| Capability Score | 80,03 | 76,57 | -3,46 |
| MMLU | — | — | -21,4 |
| GSM8K | — | — | +2,6 |
| IFEval | — | — | +4,3 |
| BFCL-V3 | — | — | -1,0 |
| HumanEval | — | — | -1,3 |

La perdida se concentra en conocimiento general (MMLU), mientras que las capacidades procedimentales (razonamiento matematico, seguimiento de instrucciones, tool calling y generacion de codigo) se mantienen o incluso mejoran ligeramente. La divergencia KL de este modelo respecto a su padre es 0,213, dentro del rango donde la generacion es indistinguible en revision humana.

## Requisitos de hardware

- Tamano en disco: 11,4 GB (frente a 20,4 GB del padre).
- Memoria pico estimada: 14,4 GB.
- GPU recomendadas: disenado para Apple Silicon (M1, M2, M3, M4) con memoria unificada; no requiere GPU NVIDIA.
- Equipos compatibles: Mac con 16 GB de RAM unificada como minimo; 32 GB recomendados para margen con otros procesos.
- Opciones de despliegue: `mlx-optiq serve` (servidor OpenAI-compatible), `mlx_lm` para generacion directa, y llama.cpp (segun el articulo de smeltcore.com) para entornos no MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; al mantener top-8 routing, la velocidad de decodificacion es similar a la del padre, pero el menor tamano reduce la carga de memoria y puede mejorar el rendimiento en equipos con RAM limitada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Tamano en disco | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-OptiQ-4bit (padre) | 34,7B | 3B | 20,4 GB | 4-bit | Apache-2.0 | Modelo original sin poda |
| KAT-Coder-V2.5-Dev-OptiQ-4bit-REAP-18B (este) | 18,3B | 3B | 11,4 GB | 4-bit | Apache-2.0 | Poda REAP al 50 % de expertos |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 19B | 3B | ~12 GB | 4-bit | Apache-2.0 | Misma receta, validado con benchmarks (Capability Score 76,57) |

La comparativa muestra que la poda reduce el tamano en disco en un 44 % y los parametros totales en un 47 %, manteniendo los parametros activos intactos. El modelo de referencia Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, con la misma arquitectura y tasa de retencion, demuestra que la perdida de capacidad es aceptable para tareas procedimentales.

## Limitaciones y advertencias

- No ha sido evaluado de forma independiente: los benchmarks mostrados provienen de un modelo hermano con la misma receta, no de este checkpoint concreto.
- Perdida de conocimiento general: la referencia muestra una caida de 21,4 puntos en MMLU, lo que puede afectar a tareas que requieran conocimiento enciclopedico o razonamiento general fuera del ambito de codigo.
- Solo texto: no soporta entradas multimodales (vision, audio).
- Idiomas no especificados: el modelo base esta orientado principalmente a ingles y codigo; el rendimiento en otros idiomas no esta garantizado.
- Requiere Apple Silicon para MLX: aunque puede usarse con llama.cpp en otras plataformas, el formato y las herramientas estan optimizados para el ecosistema Apple.
- Longitud de contexto no documentada: se desconoce la ventana de contexto exacta, lo que puede limitar su uso en repositorios muy grandes.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar la atribucion y las condiciones de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit-REAP-18B
- Modelo padre (cuantizado): https://huggingface.co/mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit
- Paper REAP (arXiv): https://arxiv.org/abs/2510.13999
- Herramienta mlx-optiq: https://mlx-optiq.com
- Documentacion de poda de OptiQ: https://mlx-optiq.com/docs/prune
- Articulo sobre KAT-Coder-V2.5-Dev en Apple M2 Max: https://smeltcore.com/recipes/kat-coder-v2-5-dev-on-apple-m2-max-35b-agentic-coding-via-llama-cpp-metal-64gb-unified-memory/
- Articulo de HackerNoon sobre KAT-Coder-V2.5-Dev: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
