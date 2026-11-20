# jstarks/Qwen3.5-4B-Weight-Space-Programming

## Resumen

Qwen3.5-4B-Weight-Space-Programming es una variante del modelo base Qwen/Qwen3.5-4B (4.659.865.088 parámetros) publicada por el usuario jstarks, que aplica una técnica denominada Weight-Space Programming (WSP) v3.0, descrita por el autor como una arquitectura de Dynamic LoRA de 9 subespacios con entrenamiento libre y en forma cerrada. El modelo parte de la arquitectura híbrida de Qwen3.5 (atención DeltaNet combinada con atención estándar, 32 capas, hidden_size de 2560, intermediate_size de 9216 y MLP SwiGLU) y añade adaptadores que modifican el comportamiento en inferencia sin reentrenar los pesos base.

El interés principal de esta ficha es doble: por un lado, el modelo base Qwen3.5-4B como tal; por otro, la propuesta metodológica WSP, que el autor presenta como una alternativa al ajuste fino tradicional para mejorar tareas de razonamiento, código, tool calling y uso de terminal. El autor reporta una mejora agregada de +17,0 puntos porcentuales en una suite unificada de 100 tareas (de 72/100 a 89/100) y mejoras en GSM8K, HumanEval, BFCL y NL2Bash, aunque estos resultados proceden exclusivamente de la model card y no han sido verificados de forma independiente.

La relevancia actual radica en que demuestra un pipeline práctico para adaptar modelos pequeños (4B) a cargas agénticas en hardware de consumo, con cuantización GGUF Q4_K_M de 2,553 GiB y un pico de VRAM de 3370 MiB a contexto de 16k, lo que permite ejecución en GPUs de 6 GB como la RTX 2060. La licencia Apache 2.0 facilita su uso comercial, si bien conviene tratar las cifras de rendimiento como declaraciones del autor pendientes de reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención DeltaNet + atención estándar), 32 capas, hidden_size 2560, intermediate_size 9216, MLP SwiGLU, RMSNorm 1+w |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16384 tokens en las evaluaciones del autor (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | GGUF Q4_K_M (2,553 GiB), quantización de caché KV q8_0 (-ctk q8_0 -ctv q8_0), imatrix; safetensors en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención DeltaNet con atención transformer convencional, 32 capas, dimensión oculta de 2560 y una MLP SwiGLU con intermediate_size de 9216. La variante WSP v3.0 añade nueve subespacios de adaptación tipo LoRA dinámico (S1 a S9) que el autor describe como programación en el espacio de pesos en forma cerrada y sin entrenamiento; según la model card, la síntesis se realiza con "hybrid_bf16_forward_hooks_s1_to_s6_plus_proxy_s7_to_s9", es decir, hooks de forward en bf16 para los subespacios S1-S6 y un mecanismo proxy para S7-S9. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni la composición de su dataset, ni si se aplicó RLHF o DPO.

La innovación técnica destacable es la metodología WSP en sí: en lugar de un ajuste fino supervisado, se calculan matrices de adaptación de forma analítica y se enrutan dinámicamente según la tarea. Los subespacios cubren funciones concretas como cierre de modo thinking (S1), contención de uso de herramientas y anti-sicofancia (S2), enrutado multi-herramienta (S3), síntesis de código (S4), JSON estructurado en segundo turno (S5), traspaso de escalado (S6), defensa frente a inyección indirecta (S7), abstención fundamentada (S8) y autorrecuperación de errores (S9). El autor reporta ablaciones de variantes (v2.5, 4 vías) y una variante Dynamic Router con S4 = ffn_down como la más mejorada, aunque los detalles completos de la ablación no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con modo thinking y cierre controlado del mismo (subespacio S1).
- Razonamiento aritmético y matemático de tipo GSM8K, con reducción de tokens de finalización (de 1009,1 a 542,4 de media en el autor).
- Síntesis de código y paso de tests HumanEval (15/15 reportado por el autor con WSP).
- Tool calling y function calling, incluido enrutado multi-herramienta (S3) y contención de llamadas innecesarias (S2).
- Agentes multi-paso y uso de terminal/bash: NL2Bash (18/20 reportado) y Terminal-Bench 2.0 (4/20 reportado).
- Generación de JSON estructurado en turnos posteriores (S5), con reducción drástica de tokens (de 127,3 a 33,3 de media).
- Defensa frente a inyección indirecta de prompts (S7) y abstención fundamentada cuando falta información (S8).
- Autorrecuperación de errores en cadenas agénticas (S9).
- Capacidades multilingües: no disponible.
- Visión o audio: no disponible (el pipeline es text-generation).

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 16k tokens y el subespacio S5 fuerza salidas JSON estructuradas en turnos posteriores, lo que facilita la integración con backends de ticketing y CRM.
- Enrutado de herramientas en asistentes internos: S3 permite seleccionar entre múltiples herramientas con un consumo medio de 133,8 tokens por decisión, adecuado para orquestadores ligeros en CPU/GPU modesta.
- Generación de código en pipelines de CI/CD: HumanEval 15/15 reportado y soporte de tool calling permiten usar el modelo como generador de parches o tests en un runner con GPU de 6-12 GB.
- Automatización de operaciones con bash: NL2Bash 18/20 y Terminal-Bench 4/20 lo hacen utilizable para traducir instrucciones en lenguaje natural a comandos de shell en entornos controlados, con revisión humana antes de ejecutar.
- Defensa perimetral de agentes: S7 (inyección indirecta) y S8 (abstención fundamentada) permiten desplegarlo como primera capa de filtrado semántico en pipelines RAG antes de invocar modelos mayores.
- Razonamiento matemático en asistentes educativos: GSM8K 15/20 con menos de la mitad de tokens de finalización respecto al base, lo que reduce coste y latencia en despliegues por token.
- Prototipado en hardware de consumo: con GGUF Q4_K_M (2,553 GiB) y pico de 3370 MiB a 16k, cabe en RTX 2060 de 6 GB, lo que permite iterar localmente sin clúster.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (decodificación temperature=0.0, seed=42, contexto 16384, caché KV q8_0). No verificados de forma independiente.

| Suite | Tareas | Base | WSP v3.0 | Delta |
|---|---:|---:|---:|---:|
| S1 Think Closure | 3 | 0/3 (0,0%) | 3/3 (100,0%) | +100,0 pp |
| S2 Tool Restraint | 4 | 4/4 (100,0%) | 4/4 (100,0%) | 0,0 pp |
| S3 Multi-Tool Router | 5 | 5/5 (100,0%) | 5/5 (100,0%) | 0,0 pp |
| S4 Code Synthesis | 2 | 2/2 (100,0%) | 2/2 (100,0%) | 0,0 pp |
| S5 Turn-2 JSON | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 0,0 pp |
| S6 Escalation Handoff | 4 | 4/4 (100,0%) | 4/4 (100,0%) | 0,0 pp |
| S7 Injection Guard | 3 | 2/3 (66,7%) | 3/3 (100,0%) | +33,3 pp |
| S8 Grounded Abstention | 3 | 1/3 (33,3%) | 2/3 (66,7%) | +33,4 pp |
| S9 Error Self-Recovery | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 0,0 pp |
| GSM8K (20) | 20 | 10/20 (50,0%) | 15/20 (75,0%) | +25,0 pp |
| HumanEval pass@1 (15) | 15 | 13/15 (86,7%) | 15/15 (100,0%) | +13,3 pp |
| BFCL v3 Irrelevance (15) | 15 | 11/15 (73,3%) | 12/15 (80,0%) | +6,7 pp |
| NL2Bash (20) | 20 | 14/20 (70,0%) | 18/20 (90,0%) | +20,0 pp |
| Terminal-Bench 2.0 (20) | 20 | 3/20 (15,0%) | 4/20 (20,0%) | +5,0 pp |

Totales reportados: suite unificada de 100 tareas de 72/100 a 89/100 (+17,0 pp); holdout S1-S9 de 24/30 a 29/30; benchmarks públicos de 48/70 a 60/70. Rendimiento: 117,0 tok/s con -c 16384 -ctk q8_0 -ctv q8_0; delta de carga 3269 MiB; pico de VRAM 3370 MiB.

## Requisitos de hardware

- VRAM estimada: pico de 3370 MiB a contexto 16384 con caché KV q8_0; delta de carga 3269 MiB; GGUF Q4_K_M de 2,553 GiB.
- GPU recomendadas: RTX 2060 de 6 GB (cabe con ~2,7 GiB de margen a 16k), RTX 4070 Ti de 12 GB (~8,0 GiB de margen a 16k), A100/H100 para mayor throughput (no medido en la información disponible).
- Cabe en GPU de consumo: sí, en RTX 2060 6 GB y superiores; el autor reporta 117,0 tok/s en su entorno de pruebas.
- Opciones de despliegue: llama.cpp (GGUF), transformers con safetensors, endpoints compatibles; vLLM, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: 117,0 tok/s reportado con cuantización Q4_K_M y caché KV q8_0; Terminal-Bench a 107,7 tok/s.

## Comparativa con modelos similares

Comparativa dentro de la misma familia y estudio del autor (GGUF Q4_K_M, 100 tareas, decodificación idéntica):

| Modelo | Parámetros | Contexto eval. | Base | WSP v3.0 | Velocidad | VRAM pico | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Qwen3.5-4B WSP (este) | 4,66B | 16k | 72/100 | 89/100 | 117,0 tok/s | 3370 MiB | Apache 2.0 |
| Nemotron-3-Nano-4B WSP | no disponible | 16k | 81/100 | 81/100 | 131,1 tok/s | 3133 MiB | no disponible |
| Qwen3.5-9B WSP | no disponible | 16k | 84/100 | 88/100 | 72,5 tok/s | 5650 MiB | Apache 2.0 |
| Qwen3.5-2B WSP | no disponible | 16k | 57/100 | 55/100 | 226,5 tok/s | 1979 MiB | Apache 2.0 |
| Gemma-4-12B WSP | no disponible | 16k | 50/100 | 52/100 | 51,3 tok/s | 7664 MiB | no disponible |

Este modelo es el que presenta mayor delta neto (+17,0 pp) del estudio; Nemotron-3-Nano-4B parte de una base superior pero no mejora con WSP, y Qwen3.5-9B obtiene 88/100 con mayor coste de VRAM. Los parámetros exactos de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declaraciones del autor en la model card y no han sido reproducidos de forma independiente; trátalos como indicativos, no como garantía.
- La metodología WSP v3.0 depende de hooks de forward y de un mecanismo proxy para S7-S9, lo que puede introducir fragilidad ante cambios de versión de transformers o de la arquitectura base.
- El rendimiento en Terminal-Bench 2.0 es bajo en términos absolutos (4/20, 20,0%), por lo que no es adecuado como agente autónomo de terminal sin supervisión.
- S8 (abstención fundamentada) solo alcanza 2/3 (66,7%) incluso con WSP; riesgo de respuestas no fundamentadas en consultas ambiguas.
- Riesgo de alucinación inherente a un modelo de 4B; el subespacio S8 mitiga pero no elimina el problema.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá del inglés implícito en los benchmarks.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen/Qwen3.5-4B y de los datasets de evaluación citados (GSM8K, HumanEval, BFCL, NL2Bash).
- El contexto evaluado es 16384 tokens; no se documenta el contexto nativo máximo del modelo base en la información disponible.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante Nemotron-3-Nano-4B WSP: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Variante Qwen3.5-9B WSP: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Variante Qwen3.5-2B WSP: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Variante Gemma-4-12B WSP: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
- Paper, blog o repositorio de WSP: no disponible en la información proporcionada.
