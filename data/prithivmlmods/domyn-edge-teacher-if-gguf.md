# prithivMLmods/Domyn-Edge-Teacher-IF-GGUF

## Resumen

Domyn-Edge-Teacher-IF-GGUF es la versión cuantizada en formato GGUF del modelo domyn/Domyn-Edge-Teacher-IF, un transformer denso de aproximadamente 3.900 millones de parámetros desarrollado por Domyn. Este modelo no está pensado como asistente de propósito general, sino como "teacher" especializado en instruction-following y tool-calling dentro del pipeline de post-entrenamiento Multi-Teacher On-Policy Distillation (MOPD) de Domyn, donde se emplea para puntuar token a token los rollouts de los modelos estudiantes. El repositorio GGUF lo publica prithivMLmods para facilitar su ejecución local con llama.cpp.

El modelo parte de Domyn Edge SFT y aplica dos épocas de fine-tuning supervisado especializado, seguidas de Group Relative Policy Optimization (GRPO) asíncrono sobre problemas verificables de seguimiento de instrucciones y function-calling. Conserva la arquitectura, el tokenizador, el soporte de 13 idiomas y la plantilla de chat con razonamiento `<think>` del modelo base. Los pesos en bfloat16 se publican bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que combina un tamaño contenido (4B) con capacidades específicas de instrucción y llamada a funciones, y se distribuye en múltiples cuantizaciones GGUF que van desde 2 GB (Q3_K_M) hasta 7,87 GB (BF16), lo que lo hace desplegable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (dense transformer) |
| Parámetros totales | 3.928.787.968 (~3,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la prueba de rendimiento usa 16.384 tokens) |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); pesos originales en bfloat16 |

## Arquitectura y entrenamiento

Domyn-Edge-Teacher-IF es un transformer denso de 4B parámetros construido sobre Domyn Edge SFT, del que hereda la arquitectura, el tokenizador, el soporte de 13 idiomas y la plantilla de chat con modo de razonamiento `<think>`. El entrenamiento consistió en dos épocas de fine-tuning supervisado (SFT) especializado en instruction-following y function-calling, seguidas de GRPO asíncrono sobre problemas verificables de instrucción y llamada a funciones. El dataset asociado es domyn/Domyn-Edge-Teacher-IF-Mix.

La innovación principal no reside en la arquitectura, sino en su rol dentro del pipeline MOPD (Multi-Teacher On-Policy Distillation): el modelo actúa como profesor de dominio que puntúa token a token los rollouts de los estudiantes, en lugar de servir como asistente directo. El repositorio GGUF añade la posibilidad de ejecución local con llama.cpp, con soporte de offloading completo a GPU (`-ngl 99`) y caché KV cuantizada (por ejemplo, `q8_0`).

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo de razonamiento `<think>`.
- Instruction-following especializado, con mejoras reportadas de +41,9 puntos en IFBench (hasta 66,0%) respecto a Domyn Edge SFT.
- Function-calling / tool-calling, con +35,0 puntos en BFCL v4 non-live (hasta 86,9%).
- Razonamiento matemático, con +18,0 puntos en AIME 2026 (hasta 79,3%).
- Soporte multilingüe en 13 idiomas: inglés, italiano, español, francés, alemán, portugués, ruso, chino, japonés, árabe, neerlandés, indonesio y turco.
- Capacidad de puntuación token a token de rollouts para destilación on-policy (uso previsto como teacher).
- Compatible con endpoints y con el ecosistema llama.cpp / llama-cpp / text-generation-inference según los tags del repositorio.

## Casos de uso

- Destilación on-policy como teacher: el modelo puntúa token a token los rollouts de modelos estudiantes en un pipeline MOPD, aprovechando su especialización en instrucciones y function-calling para generar señales de recompensa densas.
- Evaluación automática de calidad de instrucciones: puede actuar como juez o scorer de respuestas generadas por otros modelos en tareas de instruction-following verificable.
- Generación de datos sintéticos de tool-calling: al estar entrenado con GRPO sobre problemas verificables de function-calling, es adecuado para producir ejemplos de llamadas a funciones con estructura correcta en pipelines de aumento de datos.
- Asistente local en edge con llama.cpp: las cuantizaciones Q4_K_M (2,42 GB) y Q5_K_M (2,81 GB) permiten ejecución en GPU de consumo con VRAM limitada, útil para prototipos de asistentes con capacidades de herramientas.
- Razonamiento matemático asistido: su mejora en AIME 2026 lo hace utilizable para resolución de problemas aritméticos y algebraicos en entornos educativos o de validación, con el modo `<think>` para trazabilidad del razonamiento.
- Soporte multilingüe en atención al cliente: los 13 idiomas soportados permiten desplegar un asistente con llamada a funciones (por ejemplo, consulta de pedidos) en mercados europeos y asiáticos.
- Investigación en post-entrenamiento: sirve como referencia reproducible para estudiar el efecto de GRPO sobre instruction-following y function-calling en modelos de 4B, dado que los pesos y el dataset son abiertos (fully open).

## Benchmarks y rendimiento

Resultados reportados en la model card, comparados con Domyn Edge SFT y Qwen3.5 4B:

| Benchmark | Domyn-Edge-Teacher-IF | Domyn Edge SFT (delta) | Qwen3.5 4B |
|---|---|---|---|
| IFBench | 66,0% | +41,9 puntos | Superado por este modelo |
| BFCL v4 non-live | 86,9% | +35,0 puntos | No disponible |
| AIME 2026 | 79,3% | +18,0 puntos | No disponible |
| IFEval | No disponible (supera a Qwen3.5 4B) | No disponible | Superado por este modelo |
| IFStruct | No disponible (supera a Qwen3.5 4B) | No disponible | Superado por este modelo |

Prueba de rendimiento de inferencia con Q5_K_M en NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), llama-cli, contexto 16.384, KV cache `q8_0`, `-ngl 99`, semilla 42, 5 ejecuciones:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.044,01 tokens/s |
| Velocidad media de generación | 249,09 tokens/s |
| Tiempo total | 47,7 s |
| VRAM pico | 4,60 GiB |
| Utilización de GPU pico | 92% |
| Decodificación especulativa | No |

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo como referencia mínima): Q3_K_M 2 GB, Q4_K_S 2,31 GB, Q4_K_M 2,42 GB, Q5_K_S 2,75 GB, Q5_K_M 2,81 GB, Q6_K 3,23 GB, Q8_0 4,18 GB, BF16 7,87 GB. Añadir overhead de caché KV según contexto.
- En la prueba oficial con Q5_K_M y contexto de 16.384 tokens, el uso pico de VRAM fue de 4,60 GiB con caché KV en `q8_0`.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada), A100/H100 para despliegues de mayor concurrencia; RTX 4090 y GPUs de consumo con 8-12 GB o más para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en GPUs de 8 GB o más (el uso pico observado con contexto 16K fue de 4,60 GiB).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, text-generation-inference (según tags), endpoints compatibles.
- Throughput observado: 1.044 tokens/s de prompt processing y 249 tokens/s de generación en RTX PRO 6000 Blackwell con Q5_K_M. La latencia y el throughput variarán en hardware inferior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFBench | BFCL v4 non-live | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Domyn-Edge-Teacher-IF (este) | ~3,9B denso | No disponible | 66,0% | 86,9% | Apache 2.0 | GGUF + pesos BF16 |
| Domyn Edge SFT (base) | ~3,9B denso | No disponible | ~24,1% (inferido del delta +41,9) | ~51,9% (inferido del delta +35,0) | No disponible en la información | Modelo base |
| Qwen3.5 4B | ~4B | No disponible | Inferior a este modelo | No disponible | No disponible en la información | No disponible en la información |

Nota: los valores de Domyn Edge SFT se derivan aritméticamente de los deltas reportados en la model card; no se han publicado de forma directa en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado principalmente como teacher para puntuar rollouts, no como asistente de propósito general; su uso directo en conversación puede no alcanzar la calidad de modelos instructivos generalistas del mismo tamaño.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en dominios factuales y contextos largos.
- No se especifica la longitud máxima de contexto entrenada; la prueba de rendimiento usa 16.384 tokens, pero no debe asumirse como límite oficial.
- Los benchmarks reportados (IFBench, BFCL v4, AIME 2026) proceden del autor del modelo y no se han verificado de forma independiente.
- El soporte de 13 idiomas no implica calidad homogénea; el inglés es probablemente el idioma dominante del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset domyn/Domyn-Edge-Teacher-IF-Mix si se reutiliza para reentrenamiento.
- Las métricas de rendimiento de la prueba oficial corresponden a hardware de gama alta (RTX PRO 6000 Blackwell, 96 GB); en GPUs de consumo el throughput será sustancialmente menor.
- No se han publicado datos sobre sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Domyn-Edge-Teacher-IF-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-Teacher-IF
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-IF-Mix
- llama.cpp: https://github.com/ggml-org/llama.cpp
