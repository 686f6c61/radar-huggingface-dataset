# arianraje/looptransv2-qwen3.5-2b-s2-trial-m0_p90

## Resumen

looptransv2-qwen3.5-2b-s2-trial-m0_p90 es un modelo de lenguaje derivado de Qwen/Qwen3.5-2B mediante la técnica de transformer con bucles (looped transformer) con profundidad recurrente. El autor, arianraje, comparte pesos y manifiesto de bucle para que los bloques internos del modelo se ejecuten más de una vez reutilizando los mismos pesos, elevando la profundidad efectiva de 24 a 36 capas sin incrementar el número de parámetros. Forma parte del proyecto LoopTrans (rama `v2`) y corresponde a la etapa 2 de recuperación de una ejecución concreta denominada `s2-trial-m0_p90`.

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con dos exportaciones de puntos de entrenamiento (`t0050M` y `t0100M`). No se trata de un modelo listo para producción sin más: es un artefacto de investigación con una arquitectura personalizada (`LoopedQwen3_5ForCausalLM`) que requiere el paquete `looptransv2` y versiones fijadas de transformers (5.17.0), vLLM (0.31.0) y flash-linear-attention (0.5.2). Su relevancia radica en explorar si la profundidad recurrente con pesos compartidos puede recuperar capacidades del modelo profesor con un coste paramétrico nulo.

La model card indica que la ejecución `m0_p90` es un control de esquema no seleccionado: el percentil 90 por coste predicho de etapa 1 entre 200.000 esquemas válidos muestreados uniformemente con m = 0. Esto implica que no se eligió por rendimiento, sino como referencia estadística dentro del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) de profundidad recurrente, derivado de Qwen3.5-2B; clase `LoopedQwen3_5ForCausalLM` |
| Parametros totales | no disponible (heredados de Qwen3.5-2B; el bucle comparte pesos y no añade parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-2B (24 capas) y aplica un esquema de bucle explícito sobre bloques de capas propias: `[4]×5 [9]×6 [18]×2 [21]×3` en indexación 0, donde cada corchete indica el rango de capas y el multiplicador las repeticiones. Con ello la profundidad ejecutada pasa de 24 a 36 capas, manteniendo los pesos compartidos entre repeticiones. El número de pasadas de atención extra es m = 0, es decir, sin cachés KV adicionales por las repeticiones. La ejecución `m0_p90` se seleccionó como control no optimizado: percentil 90 por coste predicho de etapa 1 sobre 200.000 esquemas válidos muestreados uniformemente con m = 0.

La etapa 2 de recuperación se entrenó con divergencia KL forward respecto al profesor Qwen3.5-2B congelado, más una pérdida de interfaz de bucle, con pesos 1/1. Se usó AdamW con LR 1e-5, 5M de warmup y decaimiento coseno sobre 600M tokens hasta 0,1×, con 64 filas empaquetadas de 4.096 tokens por paso. El repositorio incluye dos exportaciones con pesos, configuración, tokenizer y manifiesto de bucle: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). No se incluyen checkpoints con estado del optimizador. La configuración completa está en `run/config.json`.

## Capacidades

- Generación de texto: pipeline declarado `text-generation` sobre la base Qwen3.5-2B.
- Razonamiento y conocimiento general: heredados del profesor Qwen3.5-2B, sujetos a la recuperación por destilación KL.
- Código y matemáticas: no se documentan evaluaciones específicas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: profundidad recurrente con pesos compartidos (36 capas ejecutadas frente a 24), sin pasadas de atención extra (m = 0).
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre profundidad recurrente: el modelo sirve como punto de comparación control (`m0_p90`) para medir si el bucle con pesos compartidos recupera capacidad frente al profesor Qwen3.5-2B; se usaría cargando `t0100M` con `load_looped` y evaluando contra el modelo base.
- Estudio de destilación con KL forward: permite analizar la curva de recuperación entre los puntos `t0050M` (50M tokens) y `t0100M` (100M tokens) para caracterizar la eficiencia de la etapa 2.
- Reproducción de experimentos de esquemas de bucle: al publicarse el manifiesto y la configuración (`run/config.json`), se puede replicar el esquema `[4]×5 [9]×6 [18]×2 [21]×3` y compararlo con otros esquemas del espacio muestreado.
- Evaluación de serving con vLLM: el paquete `looptransv2` registra un entry point `vllm.general_plugins`, lo que permite desplegar la exportación directamente en vLLM 0.31.0 para medir throughput y latencia de la profundidad ejecutada de 36 capas.
- Generación de texto en experimentos de laboratorio: con contexto de entrenamiento de 4.096 tokens empaquetados, es adecuado para tareas de generación acotada en entornos de investigación, no para producción sin validación previa.
- Base para futuros ajustes: al estar bajo Apache 2.0 y en safetensors, puede servir como inicialización para experimentos posteriores de bucle o destilación sobre Qwen3.5-2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen informes de benchmark bajo `bench/` en las subcarpetas donde se evaluó, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 7,5 GB e incluye dos exportaciones, por lo que cada exportación en bfloat16 ronda la mitad de ese tamaño, en línea con un modelo de aproximadamente 2.000 millones de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar viabilidad en GPU de consumo con suficiente VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; depende del tamaño exacto de parámetros de Qwen3.5-2B y del soporte de la arquitectura en los runners.
- Opciones de despliegue: vLLM 0.31.0 con el paquete `looptransv2` instalado (entry point `vllm.general_plugins`); carga directa con `looptransv2.models.io.load_looped` en transformers 5.17.0. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La profundidad ejecutada de 36 capas frente a 24 implica un coste computacional superior al del modelo base, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad ejecutada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m0_p90 | no disponible (base ~2B) | no disponible (entrenamiento a 4.096 tokens) | 36 capas (24 base con bucles) | apache-2.0 | HuggingFace, requiere `looptransv2` |
| Qwen/Qwen3.5-2B (profesor) | ~2B | no disponible en la información | 24 capas | no disponible en la información | HuggingFace |
| Alternativas de ~2B de propósito general | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: la ejecución `m0_p90` es un control no seleccionado (percentil 90 por coste predicho), no un esquema optimizado por calidad.
- Requiere código y versiones específicas: `looptransv2` (rama `v2`, commit `1463f44`), transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2; no es cargable con un `AutoModelForCausalLM` estándar.
- Solo se publican dos puntos de entrenamiento (`t0050M` y `t0100M`); no hay checkpoints con estado del optimizador ni versión final consolidada.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo destilado de 2B, cabe esperar el comportamiento típico de ese tamaño, pero no hay datos.
- Sesgos conocidos: no documentados; los sesgos del profesor Qwen3.5-2B pueden transferirse vía destilación KL.
- Idiomas: no declarados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Contexto: el entrenamiento usa filas de 4.096 tokens; no se documenta la longitud de contexto efectiva en inferencia.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y la naturaleza experimental desaconsejan su uso en producción sin validación adicional.
- No se documenta soporte para cuantización ni para runners distintos de vLLM/transformers con el paquete del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m0_p90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
