# arianraje/looptransv2-qwen3.5-2b-s2-trial-m2

## Resumen

LoopTransV2 `s2-trial-m2` es un modelo de lenguaje derivado de Qwen3.5-2B mediante la técnica de *looped transformer* con profundidad recurrente: bloques de capas del modelo original se ejecutan más de una vez compartiendo pesos, lo que eleva la profundidad efectiva de 24 a 36 capas sin incrementar el número de parámetros. Lo desarrolla el usuario `arianraje` dentro del proyecto LoopTrans (rama `v2`) y se publica bajo licencia Apache 2.0.

El modelo resuelve un problema de investigación concreto: comprobar si se puede aumentar la capacidad de cómputo por token de un transformer pequeño reutilizando capas existentes en lugar de añadir parámetros nuevos, y recuperar después la calidad mediante destilación desde el modelo profesor original. Para ello se aplica un esquema de repetición concreto, `[4..14]×2 [21]×2` (capas 4 a 14 repetidas dos veces y capa 21 repetida dos veces, indexación desde 0), con dos pasadas de atención adicionales (m = 2 cachés KV extra).

Es relevante ahora porque documenta de forma reproducible una receta de *upcycling* estructural sobre un modelo base reciente (Qwen3.5-2B), con exportaciones intermedias a 50M, 100M, 150M y 200M de tokens de recuperación y con el código de carga y despliegue publicado. El repositorio ocupa 15,1 GB e incluye pesos en safetensors, configuraciones, tokenizador y manifiesto de bucle por cada exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas repetidas (looped transformer, recurrent-depth) sobre Qwen3.5-2B; clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | No disponible (hereda el tamaño de Qwen3.5-2B; el bucle comparte pesos y no añade parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con config, tokenizer y loop manifest por subcarpeta) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y aplica un esquema de profundidad recurrente: las capas 4 a 14 se ejecutan dos veces y la capa 21 también dos veces, compartiendo pesos entre repeticiones. Esto eleva la profundidad ejecutada de 24 a 36 capas. El schedule corresponde a la etapa 2 (`s2-trial-m2`) del proyecto LoopTransV2, que es el que la etapa 1 seleccionó con un presupuesto M ≤ 2. Se añaden dos pasadas de atención adicionales (m = 2), lo que implica dos cachés KV extra.

La etapa 2 es una fase de recuperación: se entrena con divergencia KL forward contra el Qwen3.5-2B original congelado como profesor, más una pérdida de interfaz de bucle, con pesos 1/1. Se usa AdamW con LR 1e-5, 5M de warmup y decaimiento coseno a lo largo de 600M de tokens hasta 0,1×, con 64 filas empaquetadas de 4.096 tokens por paso. Se publican cuatro exportaciones intermedias: `t0050M` (50.069.504 tokens, paso 191), `t0100M` (100.139.008 tokens, paso 382), `t0150M` (150.208.512 tokens, paso 573) y `t0200M` (200.015.872 tokens, paso 763). No se incluyen checkpoints con estado del optimizador. El código requiere transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2.

## Capacidades

- Generación de texto autoregresiva para `text-generation`, heredada de la arquitectura Qwen3.5-2B.
- Mayor cómputo por token que el modelo base gracias a la profundidad efectiva de 36 capas con pesos compartidos.
- Destilación desde el profesor Qwen3.5-2B, orientada a preservar el comportamiento del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Carga mediante `looptransv2.models.io.load_looped` y despliegue con vLLM a través del plugin registrado en `vllm.general_plugins`.

## Casos de uso

- Investigación en arquitecturas recurrentes: usar las cuatro exportaciones (`t0050M`, `t0100M`, `t0150M`, `t0200M`) para estudiar la curva de recuperación de calidad frente a tokens de destilación y comparar con el Qwen3.5-2B original.
- Experimentos de eficiencia parámetro/cómputo: evaluar si un modelo de 2B con 36 capas ejecutadas y pesos compartidos ofrece mejor relación calidad-por-parámetro que el base de 24 capas en tareas de razonamiento.
- Destilación de modelos pequeños: servir como caso de referencia reproducible de la receta KL forward contra profesor congelado más pérdida de interfaz de bucle, replicable sobre otros modelos base.
- Despliegue en entornos con restricciones de memoria: al no añadir parámetros, el peso del checkpoint no crece frente al base; encaja en escenarios donde el coste de almacenamiento debe mantenerse acotado.
- Evaluación comparativa de profundidad efectiva: banco de pruebas para medir latencia y throughput de vLLM 0.31.0 con dos cachés KV extra frente a un transformer estándar del mismo tamaño.
- Generación de texto en pipelines de investigación: integración vía `load_looped` en scripts de evaluación propios, con control explícito del dtype (`bfloat16`) y de la exportación elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las exportaciones incluyen informes de benchmark bajo `bench/` cuando fueron evaluadas, pero no se proporcionan cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al heredar el tamaño de Qwen3.5-2B, en bfloat16 el peso ronda los 4 GB, a lo que se suma el coste de las dos cachés KV extra del bucle.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de pesos sería viable en GPUs de consumo con suficiente VRAM, pero las dos cachés KV adicionales incrementan el consumo de memoria durante la generación.
- Opciones de despliegue: vLLM 0.31.0 con el plugin de `looptransv2` (carga directa del directorio de exportación); carga nativa mediante `looptransv2.models.io.load_looped` con transformers 5.17.0.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Dependencias fijadas: transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2 (ver `scripts/env/constraints.txt`).

## Comparativa con modelos similares

| Modelo | Parámetros | Profundidad ejecutada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m2 | No disponible (base 2B) | 36 capas (24 base + repeticiones) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | 2B (según denominación) | 24 capas | No disponible | No disponible en la información proporcionada | Hugging Face |
| Otros modelos con profundidad recurrente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no se puede verificar la recuperación de calidad frente al profesor Qwen3.5-2B.
- El bucle con dos pasadas de atención adicionales (m = 2) implica dos cachés KV extra, lo que aumenta el consumo de memoria y la latencia por token frente a un transformer convencional del mismo tamaño.
- Requiere código y versiones específicas (rama `v2` del repositorio LoopTrans, commit `1463f44`, transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2); no es cargable con transformers estándar sin el paquete `looptransv2`.
- Solo se publican exportaciones hasta 200M de tokens de un entrenamiento planificado a 600M; las exportaciones intermedias pueden estar por debajo del punto de convergencia.
- No se incluyen checkpoints con estado del optimizador, lo que impide reanudar el entrenamiento desde el repositorio.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; al ser un modelo de 2B destilado, cabe esperar las limitaciones típicas de ese rango de tamaño.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada desaconseja su uso en producción sin validación propia.

## Enlaces

- [Hugging Face: arianraje/looptransv2-qwen3.5-2b-s2-trial-m2](https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m2)
- [Repositorio LoopTrans (rama v2)](https://github.com/arianraje/LoopTrans)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
