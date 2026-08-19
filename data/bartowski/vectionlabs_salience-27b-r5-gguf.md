# bartowski/vectionlabs_Salience-27B-R5-GGUF

## Resumen

Salience-27B-R5 es un modelo denso de vision-lenguaje de 27 000 millones de parametros desarrollado por vectionlabs, orientado a ingenieria de software practica: escritura y depuracion de codigo real, ediciones a escala de repositorio, agencia de terminal multi-paso y razonamiento cuantitativo. Incluye vision nativa (entrada de imagenes) y una ventana de contexto de 1 048 576 tokens, lo que lo situa en la categoria de modelos de contexto largo para tareas agente y de ingenieria.

El modelo se distribuye bajo licencia Apache 2.0 y esta disponible en formato GGUF gracias a las cuantizaciones de bartowski, que cubren desde bf16 hasta IQ3_M. Los tags de la model card indican una base arquitectonica sobre la familia Qwen 3 (tag `qwen3.8`), con soporte de decodificacion especulativa mediante MTP (multi-token prediction) y cuantizacion con imatrix. Su relevancia actual radica en combinar vision, razonamiento eficiente y contexto de 1M de tokens en un paquete de 27B ejecutable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje (base Qwen 3, segun tag `qwen3.8`) |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_XL, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo original) |

## Arquitectura y entrenamiento

Salience-27B-R5 es un modelo denso de transformer de vision-lenguaje, construido sobre la arquitectura Qwen 3 (segun el tag `qwen3.8` de la model card). Integra un codificador visual (mmproj) para entrada de imagenes junto con el modulo de texto, y soporta decodificacion especulativa mediante MTP (multi-token prediction), lo que permite reducir la latencia de generacion en inferencia. El formato de prompt es ChatML con un sufijo ` thinking` tras el turno de asistente, indicando un modo de razonamiento explicito.

Los detalles de entrenamiento (composicion del dataset, numero de tokens, fases de RLHF/DPO) no estan disponibles en la informacion publicada. Las cuantizaciones GGUF de bartowski se generaron con llama.cpp b10419 y aplican imatrix (importance matrix) para optimizar la distribucion de errores de cuantizacion. No se han publicado mediciones de perplexity o KLD para las versiones cuantizadas.

## Capacidades

- Generacion de texto con modo de razonamiento (thinking) integrado en el formato de prompt.
- Comprension de imagenes (vision nativa) mediante el archivo mmproj, lo que permite tareas de image-text-to-text.
- Escritura y depuracion de codigo, incluyendo ediciones a escala de repositorio (repo-scale edits).
- Agencia de terminal multi-paso: ejecucion de comandos, interpretacion de salidas y toma de decisiones iterativa.
- Soporte de tool calling / function calling para integracion en pipelines agente.
- Razonamiento cuantitativo y analitico para problemas de matematicas y datos.
- Ventana de contexto de 1 048 576 tokens, apta para documentos largos, repositorios completos o historiales extensos.
- Decodificacion especulativa (MTP) para acelerar la generacion en inferencia.
- Multilingue: solo ingles declarado en la model card.

## Casos de uso

- Depuracion de codigo en repositorios grandes: el modelo puede recibir un repositorio completo o fragmentos extensos dentro de su ventana de 1M de tokens, localizar errores y proponer parches con contexto completo del proyecto.
- Agente de terminal autonomo: con tool calling y razonamiento multi-paso, puede ejecutar comandos, analizar salidas, instalar dependencias y corregir fallos de compilacion de forma iterativa.
- Asistente de desarrollo integrado en CI/CD: puede revisar pull requests, generar tests y detectar regresiones usando su capacidad de razonamiento sobre diffs y codigo.
- Analisis de documentos tecnicos con imagenes: gracias a la vision nativa, puede interpretar diagramas, capturas de pantalla o documentacion escaneada junto con texto largo.
- Razonamiento cuantitativo sobre datos: procesamiento de datasets extensos o informes financieros con contexto de 1M de tokens, extrayendo metricas y respondiendo preguntas analiticas.
- Automatizacion de tareas de ingenieria de software: generacion de scripts, refactorizacion de codigo legacy y migracion entre frameworks usando el modo thinking para planificar cambios complejos.
- Soporte tecnico especializado: atencion al cliente con contexto largo de conversaciones previas y capturas de pantalla de errores, manteniendo el historial completo en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card de vectionlabs aparece vacio, y las cuantizaciones de bartowski no incluyen mediciones de perplexity ni KLD. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este modelo.

## Requisitos de hardware

- Q4_K_M (17,77 GB): cabe en GPUs de consumo con 24 GB de VRAM, como RTX 4090 o RTX 3090, dejando margen para el contexto.
- Q3_K_M (14,61 GB) o IQ3_M (13,90 GB): caben en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti Super, con contexto limitado.
- Q8_0 (29,12 GB): requiere GPUs de 32 GB o mas, como A100 40GB, o GPUs de 24 GB con offloading parcial a RAM.
- bf16 (54,66 GB): necesita GPUs de 64 GB o configuraciones multi-GPU (por ejemplo, 2x A100 80GB o 3x RTX 4090).
- El contexto de 1M de tokens consume memoria KV cache significativa; para ventanas muy largas se recomienda cuantizaciones bajas y GPUs con 48 GB o mas.
- Despliegue compatible con llama.cpp, Ollama, LM Studio y vLLM (con soporte GGUF), asi como llama-cpp-python para integraciones personalizadas.
- La decodificacion especulativa (MTP) puede mejorar el throughput en CPUs y GPUs compatibles, aunque requiere el archivo de pesos adicional correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Salience-27B-R5 | 27,3B denso | 1 048 576 | Si | Apache 2.0 | GGUF, safetensors |
| Qwen 2.5 VL 32B | 32B denso | 32 768 | Si | Apache 2.0 | safetensors, GGUF |
| Qwen 3 30B-A3B | 30B (MoE, 3B activos) | 131 072 | No | Apache 2.0 | safetensors, GGUF |
| GLM-4V 32B | 32B denso | 128 000 | Si | MIT | safetensors, GGUF |

La comparativa se basa unicamente en especificaciones publicas; no se dispone de datos de rendimiento para Salience-27B-R5. Su ventaja principal frente a alternativas similares es la combinacion de vision nativa con contexto de 1M de tokens, algo que Qwen 2.5 VL 32B y GLM-4V 32B no ofrecen. Qwen 3 30B-A3B carece de vision pero es mas eficiente en inferencia gracias a su arquitectura MoE.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estandar es desconocido.
- La ventana de 1M de tokens puede degradar la calidad de atencion en los extremos de contexto muy largo, un fenomeno comun en modelos de contexto extendido.
- Riesgo de alucinacion en tareas de generacion de codigo y razonamiento cuantitativo, especialmente con cuantizaciones bajas (Q3, IQ3).
- Las cuantizaciones por debajo de Q4_K_M pueden introducir errores notables en tareas de razonamiento y generacion de codigo.
- El modelo es reciente (agosto de 2026) y el ecosistema de herramientas compatible (vLLM, TGI) puede tener soporte incompleto para MTP y vision.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Qwen 3 mantiene sus propias condiciones; verificar compatibilidad de licencias en derivados.
- No se dispone de informacion sobre sesgos especificos del modelo ni sobre la composicion de sus datos de entrenamiento.

## Enlaces

- Repositorio GGUF de bartowski: https://huggingface.co/bartowski/vectionlabs_Salience-27B-R5-GGUF
- Modelo original de vectionlabs: https://huggingface.co/vectionlabs/Salience-27B-R5
- Release de llama.cpp usado para cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b10419
