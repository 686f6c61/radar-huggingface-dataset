# qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl

## Resumen

Qwen3.5-4B-NPU-fraQtl es una cuantización de 4 bits del modelo Qwen3.5-4B de Alibaba (familia Qwen), publicada por el usuario fraQtl a través de la organización qualcomm-ai-hub-community. El objetivo no es solo reducir el tamaño, sino preservar la fidelidad respecto al modelo original en bf16 con un sesgo explícito hacia tareas de instrucciones y uso de herramientas (tool calling), manteniendo además la compatibilidad total con el backend Hexagon NPU de llama.cpp. Se distribuye en formato GGUF Q4_0 y ocupa 2.583.180.384 bytes, es decir, unos 2,58 GB.

El modelo base tiene 4.205.751.296 parámetros y una arquitectura híbrida que combina atención con módulos de espacio de estados (SSM), a juzgar por los tensores `ssm_alpha`, `ssm_beta` y `ssm_out` que aparecen en la metodología de cuantización. Está pensado para inferencia en dispositivo (on-device) sobre el SoC Snapdragon 8 Elite Gen 5 (SM8850), donde todas las operaciones se ejecutan en la NPU sin rechazos.

La relevancia de esta ficha radica en que documenta un caso poco habitual: una cuantización que no solo iguala al original en benchmarks de conocimiento, sino que mejora su comportamiento en el benchmark oficial BFCL v4 live de uso de herramientas, con menos respuestas correctas del modelo original degradadas (89 frente a 148 de la cuantización estándar de unsloth). Todo ello bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con módulos SSM (atención + space state), según los tensores ssm_alpha, ssm_beta y ssm_out |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (mayoría de pesos) + 52 tensores en Q8_0 dentro del presupuesto de bytes; se descarta el bloque de predicción del siguiente token no usado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); 2.583.180.384 bytes (~2,58 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala capas de atención con capas de espacio de estados (SSM), tal como se deduce de la presencia de tensores `ssm_alpha`, `ssm_beta` y `ssm_out` entre los que la cuantización eleva a Q8_0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La innovación técnica de esta ficha está en el proceso de cuantización: se aplica redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) con estadísticas de un corpus de calibración propio. La asignación de precisión combina Q4_0 para la mayoría de pesos con 52 tensores en Q8_0 dentro del presupuesto de bytes: 47 de ellos (24 `ssm_beta`, 23 `ssm_alpha`) siguen la elección de unsloth, y 5 fueron seleccionados mediante un ranking de error por tensor (`blk.30` y `blk.31` `ffn_down`, `blk.23` y `blk.27` `attn_k`, `blk.30` `ssm_out`). Se probó entrenamiento de recuperación sobre este archivo. El resultado es un fichero 41.024 bytes menor que el Q4_0 de unsloth y con todas las operaciones aceptadas por la NPU Hexagon (0 de 32.165 rechazadas).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Uso de herramientas (tool calling / function calling): evaluado en BFCL v4 live con llamadas simples, múltiples, paralelas y paralelas múltiples.
- Detección de irrelevancia: capacidad de decidir cuándo no invocar una herramienta (654 aciertos en el conjunto live frente a 606 de unsloth Q4_0 y 691 del original bf16).
- Razonamiento y conocimiento general: evaluado en MMLU-Pro.
- Matemáticas: evaluado en GSM8K (93,10 en el fichero v2).
- Generación de código: evaluado en HumanEval+ y MBPP+.
- Seguimiento de instrucciones: evaluado en IFEval (prompt strict).
- Ejecución íntegra en NPU Hexagon de Snapdragon 8 Elite Gen 5 mediante llama.cpp.
- Modo "thinking off" empleado en todas las evaluaciones; no se documenta comportamiento con modo thinking activado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo cabe en ~2,58 GB y ejecuta todas las operaciones en la NPU del Snapdragon 8 Elite Gen 5, lo que permite desplegar un chatbot local sin conexión ni coste de API, con 17,10 tokens/s de generación y 950,1 tokens/s de procesamiento de prompt (pp128).
- Agentes con tool calling en aplicaciones móviles: su rendimiento en BFCL v4 live (1.729 sobre 2.251 prompts, con 1.063 llamadas correctas y 654 rechazos correctos) lo hace adecuado para asistentes que deben decidir cuándo invocar APIs del sistema (calendario, contactos, clima) y cuándo responder directamente.
- Automatización de tareas de instrucciones en el borde: con 80,96 en IFEval prompt strict, puede usarse para transformar, resumir o clasificar texto siguiendo instrucciones estrictas en aplicaciones de productividad local.
- Razonamiento matemático ligero en el dispositivo: 93,10 en GSM8K permite resolver problemas aritméticos de varios pasos en apps educativas o de finanzas personales sin enviar datos a la nube.
- Asistencia de código en editores locales: 75,61 en HumanEval+ y 62,91 en MBPP+ lo hacen viable para autocompletado y generación de fragmentos en IDE de escritorio o portátil con GPU consumer, siempre que se acepte la pérdida de fidelidad frente a bf16.
- Evaluación de fidelidad de cuantizaciones: sirve como referencia metodológica (KL de divergencia sobre vocabulario completo, bootstrap pareado, comparación por tensor) para equipos que necesiten validar sus propias cuantizaciones antes de producción.
- Despliegue en pipelines de CI/CD para pruebas de regresión de modelos: al ser un GGUF de llama.cpp con licencia Apache 2.0, puede integrarse en jobs automatizados que verifiquen que una nueva cuantización no degrada el comportamiento en tool calling.

## Benchmarks y rendimiento

Uso de herramientas, BFCL v4 live (2.251 prompts, greedy, thinking off):

| Fichero | Bytes | Total | Llamadas correctas | Rechazos correctos | Respuestas del original degradadas |
|---|---|---|---|---|---|
| Original bf16 (Qwen/Qwen3.5-4B) | — | 1.751 | 1.048 | 691 | — |
| unsloth Q4_0 | 2.583.221.408 | 1.681 | 1.063 | 606 | 148 |
| fraQtl Q4_0 v2 (este repo) | 2.583.180.384 | 1.729 | 1.063 | 654 | 89 |

Respuestas (greedy, thinking off):

| Benchmark | fraQtl Q4_0 | unsloth Q4_0 | Original bf16 |
|---|---|---|---|
| MMLU-Pro (12.032) | 45,55 | 45,23 | 46,82 |
| GSM8K (1.319) | 93,10 | 92,95 | 92,95 |
| IFEval prompt strict (541) | 80,96 | 80,59 | 83,18 |
| HumanEval+ (164) | 75,61 | 73,78 | 78,66 |
| MBPP+ (399) | 62,91 | 60,65 | 61,90 |

Fidelidad respecto a bf16 (divergencia KL sobre 144 ventanas reservadas, menor es mejor):

| Fichero | Bytes | KL tarea | KL general |
|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 |
| AutoRound 0.16.1 Q4_0 | 2.611.782.976 | 0,03634 | 0,02130 |
| fraQtl Q4_0 v1 | 2.583.180.384 | 0,02888 | 0,02058 |
| unsloth IQ4_NL | 2.579.944.608 | 0,03276 | 0,01908 |
| unsloth Q4_K_S | 2.590.430.368 | 0,02842 | 0,01729 |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, SM8850, llama.cpp b12079 backend Hexagon, tokens/s, 3 repeticiones):

| Fichero | NPU pp128 | NPU tg64 | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB para los pesos en Q4_0, más overhead de contexto y de runtime de llama.cpp; con contexto largo el consumo crece proporcionalmente.
- GPU recomendadas: cualquier GPU con soporte de llama.cpp; para uso en producción con throughput alto se recomiendan A100 o H100, aunque el diseño está orientado a NPU.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090, etc.), así como en CPU.
- Despliegue: llama.cpp con backend Hexagon para NPU (versión b12079 verificada), y llama.cpp estándar para CPU/GPU. No se documenta soporte en vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: en Snapdragon 8 Elite Gen 5, 950,1 ± 11,8 tokens/s en pp128 y 17,10 ± 0,04 tokens/s en tg64, con cero operaciones rechazadas por la NPU. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 live | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| fraQtl Q4_0 v2 (este) | 4,21 B | No disponible | 1.729 | 45,55 | Apache 2.0 | GGUF |
| unsloth Q4_0 | 4,21 B | No disponible | 1.681 | 45,23 | Apache 2.0 | GGUF |
| AutoRound Q4_0 | 4,21 B | No disponible | No disponible | No disponible | Apache 2.0 | GGUF |
| Qwen3.5-4B bf16 (original) | 4,21 B | No disponible | 1.751 | 46,82 | Apache 2.0 | safetensors |

Frente a unsloth IQ4_NL y Q4_K_S, este fichero es mejor en texto de tarea (KL 0,02888 frente a 0,03276 y 0,02842 respectivamente) pero peor en texto general (0,02058 frente a 0,01908 y 0,01729).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base Qwen3.5-4B, arrastra los sesgos de este, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; el modelo cambia el 20 % de las respuestas del original en MMLU-Pro (2.092 de 12.032), lo que implica divergencias respecto a bf16.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; el modelo card no los especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribución y cumplir las condiciones del modelo base Qwen3.5-4B.
- Todas las evaluaciones se realizaron con decodificación greedy y modo thinking desactivado; el comportamiento con thinking activado o con sampling no está documentado.
- El fichero v2 se midió en BFCL; las métricas de MMLU-Pro, GSM8K, IFEval y EvalPlus corresponden al fichero v1 con corrección de escala, aunque el autor afirma que v2 da respuestas idénticas (IFEval ±1).
- La ventaja en fidelidad es específica de tareas de instrucciones y tool calling; en texto general, Q4_K_S de unsloth es un 16 % más cercano al original.
- El rendimiento en NPU solo está verificado en Snapdragon 8 Elite Gen 5; otros SoC con Hexagon no están probados.
- No se documenta soporte en vLLM, TGI u Ollama; el despliegue está atado a llama.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-4B-NPU-fraQtl
- Repositorio canónico del autor: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización de referencia unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Benchmark BFCL v4: https://gorilla.cs.berkeley.edu/leaderboard.html
