# jstarks/Qwen3.5-9B-Weight-Space-Programming

## Resumen

Qwen3.5-9B-Weight-Space-Programming es una adaptación del modelo base Qwen/Qwen3.5-9B desarrollada por el usuario jstarks, que aplica una técnica denominada Weight-Space Programming (WSP) v3.0. Se trata de una arquitectura de LoRA dinámica de 9 subespacios que se construye de forma cerrada y sin entrenamiento (training-free), es decir, sin un ciclo de ajuste supervisado convencional sobre el modelo. El objetivo es modificar el comportamiento del modelo base en tareas de razonamiento agéntico, uso de herramientas y recuperación de errores, sin reentrenar los pesos originales.

El modelo conserva la arquitectura subyacente del Qwen3.5-9B (32 capas, hidden_size de 4096, intermediate_size de 12288, MLP con SwiGLU y RMSNorm con esquema 1+w), y se distribuye en formato safetensors y GGUF. Cuenta con 8.953.803.264 parámetros, un repositorio de 7,7 GB y licencia Apache 2.0.

Su relevancia actual reside en que propone una vía alternativa al ajuste fino tradicional: en lugar de entrenar, sintetiza subespacios de pesos que modulan la conducta del modelo. Los resultados reportados por el autor muestran una mejora de 4 puntos porcentuales en una suite unificada de 100 tareas (del 84% al 88%), con mejoras concentradas en abstención fundamentada y en la tarea NL2Bash, mientras que en Terminal-Bench 2.0 el rendimiento se mantiene sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B) con LoRA dinámica de 9 subespacios (WSP v3.0); 32 capas, hidden_size 4096, intermediate_size 12288, MLP SwiGLU, RMSNorm 1+w |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 16384 tokens en las evaluaciones reportadas (configuración `-c 16384`) |
| Tipos de cuantización | GGUF Q4_K_M (5.290 GiB) y otras variantes GGUF; pesos safetensors en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only de 32 capas con atención estándar y MLP SwiGLU. Sobre esa base, el autor aplica Weight-Space Programming v3.0: una arquitectura de LoRA dinámica de 9 subespacios que se sintetiza de forma cerrada (closed-form) y sin entrenamiento, mediante hooks de forward sobre las 32 capas en precisión bf16 completa (`synthesis_mode=bf16_full_32layer_forward_hooks`). No se describe un corpus de entrenamiento ni un proceso de RLHF o DPO; la intervención se realiza directamente en el espacio de pesos en lugar de optimizar una función de pérdida sobre datos.

La evaluación se realizó de extremo a extremo sobre 100 tareas unificadas (30 de holdout disjunto repartidas en los subespacios S1 a S9 y 70 benchmarks públicos establecidos) y sobre 20 tareas de Terminal-Bench 2.0 ejecutadas en contenedores WSL2 con estado. La decodificación fue idéntica en todos los modelos comparados: temperatura 0.0, semilla 42, contexto de 16384 tokens y cuantización de caché KV en q8_0. El autor indica que esta release corresponde al modelo base vanilla, y remite a una variante posterior de 13 subespacios (WSP V5, sobre Qwen3.5-9B-DeepThought-STEM) como opción preferente dentro de la familia de 9B.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Síntesis de código, evaluada con HumanEval pass@1 (15 tareas).
- Razonamiento matemático, evaluado con GSM8K (20 tareas).
- Tool calling y function calling, con evaluación de irrelevancia de herramientas mediante BFCL v3 (15 tareas).
- Enrutamiento multi-herramienta (subespacio S3_ROUTER) y contención de llamadas innecesarias a herramientas (S2_RESTRAINT).
- Generación de comandos de shell a partir de lenguaje natural (NL2Bash, 20 tareas).
- Ejecución agéntica en terminal con estado persistente (Terminal-Bench 2.0, 20 tareas en WSL2).
- Recuperación autónoma de errores (S9_ERR_RECOV) y abstención fundamentada cuando falta información (S8_GROUNDING).
- Resistencia a inyección indirecta de prompts (S7_INJ_GUARD) y control de handoff o escalado (S6_HANDOFF).
- Salida estructurada en JSON en el segundo turno de conversación (S5_TURN2_JSON).
- Capacidad multimodal de entrada imagen-texto según los tags del repositorio (image-text-to-text).

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede ejecutar tareas de shell con estado en contenedores, como demuestra su evaluación en Terminal-Bench 2.0 con 20 tareas en WSL2; es adecuado para agentes de administración de sistemas que necesitan interpretar el resultado de comandos previos.
- Generación de scripts bash desde lenguaje natural: con un 90% de acierto en InterCode-NL2Bash (18/20), encaja en asistentes de línea de comandos que traducen instrucciones en lenguaje natural a comandos ejecutables.
- Orquestación de agentes con múltiples herramientas: el subespacio S3_ROUTER alcanza 5/5 en enrutamiento multi-herramienta, lo que lo hace útil para pipelines donde el modelo debe decidir qué función invocar en cada paso.
- Asistentes con salida JSON estructurada: el subespacio S5_TURN2_JSON logra 3/3 en generación de JSON estructurado en el segundo turno, apropiado para integraciones con APIs que requieren respuestas parseables.
- Atención al cliente con abstención controlada: la mejora de 1/3 a 3/3 en S8_GROUNDING indica que el modelo evita responder cuando no dispone de base documental, lo que reduce respuestas inventadas en dominios regulados.
- Defensa frente a inyección de prompts: el subespacio S7_INJ_GUARD mantiene 3/3 en detección de inyección indirecta, relevante para asistentes que procesan contenido externo no confiable.
- Despliegue en estaciones de trabajo con GPU de 12 GB: con un pico de VRAM de 5650 MiB en cuantización Q4_K_M y contexto de 16k, puede ejecutarse en una RTX 4070 Ti en solitario o como segundo nivel de una cascada de 8k.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la suite unificada de 100 tareas (decodificación con temperatura 0.0, semilla 42, contexto 16384, caché KV q8_0):

| Suite | Tareas | Base | WSP v3.0 | Tokens medios de finalización (base → WSP) |
|---|---:|---:|---:|---:|
| S1_THINK (cierre de razonamiento) | 3 | 1/3 (33,3%) | 1/3 (33,3%) | 1024,0 → 1024,0 |
| S2_RESTRAINT (restricción de herramientas) | 4 | 4/4 (100%) | 4/4 (100%) | 361,2 → 366,2 |
| S3_ROUTER (enrutador multi-herramienta) | 5 | 5/5 (100%) | 5/5 (100%) | 116,2 → 122,6 |
| S4_CODE (síntesis de código) | 2 | 2/2 (100%) | 2/2 (100%) | 907,0 → 1003,0 |
| S5_TURN2_JSON (JSON estructurado) | 3 | 3/3 (100%) | 3/3 (100%) | 49,0 → 69,3 |
| S6_HANDOFF (escalado) | 4 | 4/4 (100%) | 4/4 (100%) | 151,5 → 151,5 |
| S7_INJ_GUARD (inyección indirecta) | 3 | 3/3 (100%) | 3/3 (100%) | 97,0 → 97,0 |
| S8_GROUNDING (abstención fundamentada) | 3 | 1/3 (33,3%) | 3/3 (100%) | 86,3 → 67,0 |
| S9_ERR_RECOV (autorrecuperación) | 3 | 3/3 (100%) | 3/3 (100%) | 61,7 → 51,0 |
| EST_GSM8K | 20 | 14/20 (70%) | 14/20 (70%) | 997,3 → 997,3 |
| EST_HUMANEVAL (pass@1) | 15 | 15/15 (100%) | 15/15 (100%) | 576,4 → 574,6 |
| EST_BFCL_IRR (irrelevancia) | 15 | 13/15 (86,7%) | 13/15 (86,7%) | 332,6 → 330,7 |
| EST_NL2BASH | 20 | 16/20 (80%) | 18/20 (90%) | 319,4 → 308,9 |

Totales: base 84/100 (84,0%) frente a WSP v3.0 88/100 (88,0%), con holdout S1-S9 de 26/30 a 28/30 y benchmarks públicos de 58/70 a 60/70. En Terminal-Bench 2.0 el resultado es 7/20 (35,0%) en ambos casos, a 68,4 tok/s.

Comparativa dentro del estudio de 5 modelos del mismo autor (100 tareas, misma decodificación):

| Modelo | GGUF Q4_K_M | Base | WSP v3.0 | Delta | Holdout (/30) | Públicos (/70) | tok/s | Pico VRAM delta (16k) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| qwen35_4b | 2,553 GiB | 72/100 | 89/100 | +17,0 pp | 24 → 29 | 48 → 60 | 117,0 | 3370 MiB |
| nemotron3_4b | 2,642 GiB | 81/100 | 81/100 | +0,0 pp | 26 → 28 | 55 → 53 | 131,1 | 3133 MiB |
| qwen35_9b | 5,290 GiB | 84/100 | 88/100 | +4,0 pp | 26 → 28 | 58 → 60 | 72,5 | 5650 MiB |
| qwen35_2b | 1,193 GiB | 57/100 | 55/100 | -2,0 pp | 23 → 23 | 34 → 32 | 226,5 | no disponible |

## Requisitos de hardware

- VRAM estimada: pico de 5650 MiB de delta con contexto de 16384 y caché KV en q8_0; carga con delta de 5552 MiB. El archivo GGUF Q4_K_M ocupa 5,290 GiB.
- GPU recomendadas: RTX 4070 Ti (12 GB) ejecuta el modelo en solitario a 16k o como segundo nivel de una cascada de 8k; en RTX 2060 (6 GB) el ajuste es justo (unos 5,3 GiB a 4k antes de contar con el escritorio).
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB con holgura y en tarjetas de 6 GB con limitaciones de contexto.
- Opciones de despliegue: llama.cpp (los tags incluyen llama-cpp e imatrix), GGUF con cuantización Q4_K_M, y compatibilidad con endpoints según los tags del repositorio. También se distribuye en safetensors para transformers.
- Rendimiento: 72,5 tok/s con contexto de 16384 y caché KV q8_0; 68,4 tok/s en las tareas de Terminal-Bench 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado 100 tareas (WSP) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Qwen3.5-9B-Weight-Space-Programming | 8,95 B | 16k evaluado | 88/100 | Apache 2.0 | Hugging Face (604 descargas) |
| Qwen3.5-4B-Weight-Space-Programming | no disponible | 16k evaluado | 89/100 | no disponible | Hugging Face |
| Nemotron-3-Nano-4B-Weight-Space-Programming | no disponible | 16k evaluado | 81/100 | no disponible | Hugging Face |
| Qwen3.5-2B-Weight-Space-Programming | no disponible | 16k evaluado | 55/100 | no disponible | Hugging Face |
| Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming (WSP V5, 13 subespacios) | no disponible | no disponible | 178/270 (Q6_K) y 176/270 (Q4_K_M) | no disponible | Hugging Face |

Las cifras de los modelos de 4B, 2B y Nemotron proceden del mismo estudio del autor y no son directamente comparables con benchmarks independientes. El modelo base sin adaptar (Qwen/Qwen3.5-9B) obtiene 84/100 en la misma suite.

## Limitaciones y advertencias

- Los resultados proceden exclusivamente del autor del modelo; no se han identificado evaluaciones independientes que los reproduzcan.
- La mejora agregada es modesta (+4,0 pp sobre 100 tareas) y se concentra en dos suites (S8_GROUNDING y EST_NL2BASH); el resto de suites no cambia.
- En Terminal-Bench 2.0 no hay mejora alguna (7/20 en ambos casos), lo que limita su uso en tareas agénticas de terminal de larga duración.
- El subespacio S1_THINK se mantiene en 1/3 (33,3%), con un fallo persistente en el cierre de razonamiento.
- El modelo base no supera el 70% en GSM8K (14/20) y el 86,7% en BFCL de irrelevancia (13/15), por lo que el razonamiento matemático y la disciplina de herramientas siguen siendo puntos débiles.
- No se especifican los idiomas soportados ni la composición del corpus del modelo base; el soporte multilingüe no está documentado.
- No se detalla el proceso de construcción de los pesos WSP ni los datos utilizados para sintetizar los subespacios, lo que dificulta auditar su comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que deben verificarse por separado.
- El ajuste en GPU de 6 GB es muy justo (unos 5,3 GiB a 4k antes del escritorio) y puede provocar desbordamiento a memoria del sistema.
- Riesgo de alucinación inherente a un modelo de 9B sin datos publicados de calibración; la mejora en abstención fundamentada no elimina este riesgo fuera de las tareas evaluadas.
- El autor recomienda una release posterior (WSP V5 sobre DeepThought-STEM) como opción preferente dentro de la familia de 9B, lo que sugiere que esta versión queda en segundo plano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Release preferente WSP V5: https://huggingface.co/jstarks/Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming
- Base de la release V5: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Variante 4B: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Variante 2B: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Variante Nemotron 4B: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
