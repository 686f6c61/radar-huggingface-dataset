# prithivMLmods/Domyn-Edge-Teacher-Agentic-GGUF

## Resumen

Domyn-Edge-Teacher-Agentic es un modelo de lenguaje denso de 4B parámetros (3.928.787.968 parámetros reales según los pesos en safetensors) desarrollado por Domyn sobre la base de Domyn Edge SFT. Su función no es la de un asistente generalista, sino la de actuar como profesor de dominio especializado en tareas agénticas dentro de la pipeline de post-entrenamiento Multi-Teacher On-Policy Distillation (MOPD) de Domyn. Se publica en bfloat16 junto con su dataset de entrenamiento (Domyn-Edge-Teacher-Agentic-Mix) como parte del segundo bundle de Domyn Edge.

El modelo ha pasado por una época de SFT especializado en tareas agénticas con una longitud de contexto de 128k, cubriendo ingeniería de software, terminal y tool calling multi-turno. Su propósito declarado es proporcionar puntuación a nivel de token sobre los rollouts de los estudiantes (token-level scoring), no servir como asistente conversacional de propósito general. Según la model card, mejora BFCL v4 en +17,2 puntos (hasta el 60,0%) y SWE-bench Verified en +6,5 puntos (hasta el 40,1%) respecto a Domyn Edge SFT, preservando capacidades cross-domain.

La ficha que nos ocupa es la cuantización GGUF publicada por prithivMLmods, que ofrece el modelo en nueve variantes que van desde Q3_K_M (2 GB) hasta BF16 (7,87 GB), todas bajo licencia Apache 2.0. Esta versión GGUF es relevante para quienes necesitan ejecutar el modelo en local con llama.cpp u Ollama sin depender de infraestructura GPU de datacenter, manteniendo el tokenizador, la arquitectura y la plantilla de chat `<think>` del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (dense), basado en Domyn Edge SFT |
| Parámetros totales | 3.928.787.968 (~4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (entrenamiento); en la prueba GGUF se usaron 16.384 tokens |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se publica en bfloat16 |

## Arquitectura y entrenamiento

Domyn-Edge-Teacher-Agentic es un transformer denso de aproximadamente 4B parámetros construido sobre Domyn Edge SFT. Conserva exactamente la arquitectura, el tokenizador, el soporte de 13 idiomas y la plantilla de chat de razonamiento `<think>` del modelo del que deriva. El entrenamiento consistió en una época de SFT especializado en tareas agénticas con contexto de 128k, sobre el dataset Domyn-Edge-Teacher-Agentic-Mix, que cubre ingeniería de software, uso de terminal y tool calling multi-turno.

La innovación principal no está en la arquitectura sino en el rol dentro de la pipeline: el modelo actúa como teacher en un esquema de Multi-Teacher On-Policy Distillation (MOPD), proporcionando puntuaciones a nivel de token sobre los rollouts generados por los estudiantes. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales. La model card tampoco menciona técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento con plantilla de chat `<think>` que expone el proceso de razonamiento.
- Tool calling y function calling, con mejora declarada de +17,2 puntos en BFCL v4 (hasta 60,0%).
- Tareas agénticas multi-turno y razonamiento multi-paso orientado a entornos de terminal y software.
- Ingeniería de software: resolución de problemas tipo SWE-bench Verified con +6,5 puntos sobre Domyn Edge SFT (hasta 40,1%).
- Capacidades matemáticas y de resolución de problemas (las pruebas de la model card incluyen problemas de álgebra, cinemática y lógica).
- Soporte multilingüe en 13 idiomas: inglés, italiano, español, francés, alemán, portugués, ruso, chino, japonés, árabe, neerlandés, indonesio y turco.
- Puntuación a nivel de token para distillation (uso previsto principal como teacher).
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Destilación on-policy: usar el modelo como teacher que puntúa token a token los rollouts de un estudiante en una pipeline MOPD, tal como está diseñado. Es su caso de uso previsto y el que justifica su publicación.
- Generación de código en producción: el modelo puede resolver tareas de programación con contexto largo (hasta 128k en entrenamiento) y se integra en pipelines de CI/CD para generar parches o completar funciones, con la ventaja de su licencia Apache 2.0.
- Automatización de terminal y shell: al haber sido entrenado en tareas de terminal, puede generar comandos y secuencias de shell para agentes de operaciones, con validación humana en pasos destructivos.
- Agentes de tool calling multi-turno: adecuado para orquestadores que necesitan invocar APIs en varios pasos manteniendo el estado de la conversación, gracias a su entrenamiento específico en function calling (BFCL v4).
- Asistente de soporte técnico especializado: con 13 idiomas y contexto largo, puede gestionar conversaciones multi-turno de soporte en español u otros idiomas europeos, aunque su naturaleza de teacher aconseja evaluar antes su calidad conversacional.
- Despliegue en hardware de gama media: las cuantizaciones Q4_K_M (2,42 GB) y Q5_K_M (2,81 GB) permiten ejecutarlo en GPUs de consumo y en portátiles, útil para prototipado local de agentes sin coste de API.
- Evaluación y anotación de rollouts: su capacidad de puntuar a nivel de token lo hace útil para construir datasets de preferencia o para filtrar trayectorias de agentes en pipelines de datos.

## Benchmarks y rendimiento

Resultados declarados en la model card frente a Domyn Edge SFT:

| Benchmark | Domyn Edge SFT | Domyn-Edge-Teacher-Agentic | Delta |
|---|---|---|---|
| BFCL v4 (overall function calling) | 42,8% (implícito) | 60,0% | +17,2 puntos |
| SWE-bench Verified | 33,6% (implícito) | 40,1% | +6,5 puntos |

Los valores de la columna "Domyn Edge SFT" se derivan de los deltas indicados en la model card; no se publican cifras absolutas del modelo base en la información disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

Prueba de inferencia GGUF (Q4_K_M, RTX PRO 6000 Blackwell, 96 GB VRAM, llama-cli, `-ngl 99`, contexto 16.384, KV cache q8_0, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.075,25 tokens/s |
| Velocidad media de generación | 268,46 tokens/s |
| Tiempo total | 38,2 s |
| VRAM pico | 4,24 GiB |
| Utilización de GPU pico | 91% |
| Capas offloaded | 99 |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q3_K_M ~2 GB, Q4_K_M ~2,42 GB, Q5_K_M ~2,81 GB, Q6_K ~3,23 GB, Q8_0 ~4,18 GB, BF16 ~7,87 GB. Añadir espacio para el KV cache según la longitud de contexto.
- En la prueba oficial con contexto de 16.384 y KV cache q8_0, el pico de VRAM fue de 4,24 GiB con Q4_K_M.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como en GPUs de 8 GB con cuantizaciones Q3/Q4 y contextos moderados.
- GPUs de datacenter recomendadas para máximo throughput: A100, H100, RTX PRO 6000 Blackwell (probado).
- Opciones de despliegue: llama.cpp (probado con llama-cli), Ollama, y cualquier runtime compatible con GGUF; el repo incluye el tag `text-generation-inference` y `endpoints_compatible` para TGI.
- Throughput medido: 268,46 tokens/s de generación y 1.075,25 tokens/s de procesamiento de prompt en RTX PRO 6000 Blackwell con Q4_K_M; en GPUs de consumo se espera un throughput considerablemente menor, no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Domyn-Edge-Teacher-Agentic | ~4B denso | 128k | Apache 2.0 | Teacher agéntico (SFT) | GGUF + BF16 |
| Domyn Edge SFT (modelo base) | ~4B denso | 128k | Apache 2.0 | Asistente generalista SFT | BF16 |
| Alternativas de ~4B agénticas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de terceros, por lo que la comparativa se limita al modelo base del que deriva. Cualquier comparación con Qwen, Llama u otros modelos de tamaño similar requeriría datos que no se han publicado aquí.

## Limitaciones y advertencias

- El modelo está diseñado como teacher para distillation, no como asistente generalista; su calidad conversacional directa puede ser inferior a la de un modelo alineado para chat.
- Riesgo de alucinación inherente a un modelo de 4B; en tareas de código y terminal conviene validar las salidas antes de ejecutarlas.
- No se documentan evaluaciones de sesgo en la información disponible; cabe esperar sesgos heredados de los datos de entrenamiento, no cuantificados.
- El contexto de entrenamiento es de 128k, pero la prueba GGUF se realizó con 16.384 tokens; el rendimiento más allá de esa longitud en cuantizaciones no está verificado.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo se distribuye sin garantías.
- El repo GGUF tiene 0 descargas y 1 like en el momento de la consulta; es una cuantización de terceros (prithivMLmods) sobre el modelo oficial de Domyn, no una publicación del autor original.
- Los datos de throughput corresponden a una GPU de datacenter con 96 GB de VRAM; no deben extrapolarse a hardware de consumo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Domyn-Edge-Teacher-Agentic-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-Teacher-Agentic
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Agentic-Mix
- llama.cpp: https://github.com/ggml-org/llama.cpp
