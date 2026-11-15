# jstarks/Qwen3.5-2B-Weight-Space-Programming

## Resumen

Qwen3.5-2B-Weight-Space-Programming (WSP v3.0) es una adaptación del modelo base Qwen/Qwen3.5-2B publicada por el usuario jstarks en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de una colección de parches de pesos en espacio de pesos (weight-space programming) sintetizados de forma cerrada y sin entrenamiento (training-free, closed-form). El paquete incluye nueve subespacios LoRA de rango 16 en formato GGUF y safetensors, además de un parche denso combinado en BF16 de 216 MiB, orientados a modificar el comportamiento del modelo base en tareas de razonamiento, uso de herramientas, generación de código y robustez conversacional.

El modelo base Qwen3.5-2B tiene 24 capas, hidden_size de 2048, intermediate_size de 6144, MLP con activación SwiGLU y RMSNorm con sesgo (1+w). El autor reporta 1.881.825.088 parámetros reales en safetensors (aproximadamente 1,88 mil millones), un repositorio de 1,6 GB y una licencia Apache 2.0. La propuesta resulta relevante para la comunidad de interpretabilidad mecanicista y para quienes experimentan con adaptación de modelos sin reentrenamiento, ya que ofrece un pipeline reproducible de parches de bajo rango evaluado sobre 100 tareas.

La evaluación publicada por el autor es honesta y poco halagüeña: el parche WSP v3.0 obtiene 55/100 frente a los 57/100 del modelo base, es decir, una pérdida neta de 2 puntos porcentuales. El modelo destaca por su velocidad (226,5 tok/s con cuantización q8_0 en contexto de 16k) y su bajo consumo de VRAM (delta pico de 1979 MiB), lo que lo hace apto para GPUs de gama media y entornos de borde, pero no por una mejora medible de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), 24 capas, hidden_size 2048, intermediate_size 6144, MLP SwiGLU, RMSNorm 1+w |
| Parámetros totales | 1.881.825.088 (~1,88 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16384 tokens en la configuración de evaluación reportada (-c 16384) |
| Tipos de cuantización | GGUF Q4_K_M (1.193 GiB), caché KV q8_0; LoRA GGUF y safetensors r16 f32; parche denso BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo base y parches r16), GGUF (modelo y adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-2B: un transformer decoder-only de 24 capas con atención estándar, MLP SwiGLU de dimensión intermedia 6144 y normalización RMSNorm con parametrización 1+w. Sobre esta base, el autor aplica Weight-Space Programming (WSP v3.0), una técnica de síntesis de pesos en forma cerrada que no requiere entrenamiento por gradiente. El resultado son nueve subespacios LoRA de rango 16 en precisión f32, cada uno dirigido a un comportamiento concreto (pensamiento, contención de herramientas, enrutamiento multi-herramienta, síntesis de código, JSON estructurado en segundo turno, traspaso de escalado, guardia contra inyección indirecta, abstención fundamentada y autorrecuperación de errores), más un parche denso combinado con suma unitaria en BF16.

El autor denomina al modo de síntesis `calibrated_proxy_weight_space`, lo que sugiere que los deltas de pesos se calculan a partir de un proxy calibrado en lugar de un ajuste supervisado clásico. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que el proceso no es un entrenamiento convencional. La innovación principal es el propio pipeline de parcheado modular: permite cargar adaptadores GGUF en llama-server o safetensors en PyTorch/Transformers de forma selectiva por comportamiento.

## Capacidades

- Generación de texto y razonamiento multi-turno sobre el modelo base Qwen3.5-2B.
- Síntesis de código de rango medio (suite S4_CODE) y resolución de problemas tipo HumanEval.
- Tool calling y enrutamiento multi-herramienta (suite S3_ROUTER, BFCL v3).
- Contención de herramientas y antisicofancia: el modelo puede abstenerse de invocar herramientas cuando no procede (S2_RESTRAINT).
- Salida JSON estructurada en segundo turno conversacional (S5_TURN2_JSON).
- Traspaso de escalado a un humano o sistema superior (S6_HANDOFF).
- Guardia contra inyección indirecta de prompts (S7_INJ_GUARD).
- Abstención fundamentada cuando falta información (S8_GROUNDING).
- Autorrecuperación de errores en cadenas de agente (S9_ERR_RECOV).
- Ejecución de comandos de shell a partir de lenguaje natural (NL2Bash).
- Capacidad multimodal declarada por el tag `image-text-to-text` del modelo base, aunque no se detalla su uso en la evaluación.
- No se documentan capacidades de audio ni modo thinking explícito más allá de la suite S1_THINK.

## Casos de uso

- Agente de borde en GPUs de gama media: con un delta pico de 1979 MiB a 16k de contexto, el modelo cabe sobradamente en una RTX 2060 de 6 GB (~4,4 GiB libres), lo que permite desplegar agentes locales con tool calling sin depender de la nube.
- Enrutador de herramientas en pipelines de automatización: la suite S3_ROUTER y el adaptador `wsp_s3_router.gguf` permiten seleccionar entre varias APIs o funciones en un flujo multi-paso, con una tasa base del 60% que el autor documenta de forma transparente.
- Generación de comandos de shell asistida: el adaptador NL2Bash (12/20 en InterCode-NL2Bash) sirve para prototipos de asistentes de terminal, siempre con revisión humana antes de ejecutar.
- Extracción de JSON en conversaciones de segundo turno: el adaptador S5_TURN2_JSON eleva la tasa del 33,3% al 100% en las tres tareas de holdout, útil en integraciones de formularios o APIs estructuradas.
- Defensa contra inyección de prompts en aplicaciones RAG: el adaptador S7_INJ_GUARD mantiene el 100% en las tareas de holdout, adecuado como capa de filtrado en asistentes documentales.
- Investigación en interpretabilidad mecanicista: los nueve subespacios r16 en safetensors permiten estudiar cómo un delta de bajo rango afecta a comportamientos concretos sin reentrenar el modelo.
- Prototipado rápido con llama.cpp: la velocidad de 226,5 tok/s y el tamaño Q4_K_M de 1.193 GiB facilitan ciclos de iteración cortos en portátiles con GPU consumer.
- Cascada de modelos: el autor lo propone como Tier-1 ultra-ligero en una cascada junto a modelos de 4B o 9B para tareas de baja complejidad.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 tareas (30 de holdout S1–S9 y 70 de benchmarks públicos), con decodificación `temperature=0.0, seed=42, -c 16384 -ctk q8_0 -ctv q8_0`:

| Suite | Tareas | Base | WSP v3.0 | Tokens medios (base → WSP) |
|---|---:|---:|---:|---:|
| S1_THINK | 3 | 1/3 (33,3%) | 1/3 (33,3%) | 1024,0 → 1024,0 |
| S2_RESTRAINT | 4 | 3/4 (75,0%) | 3/4 (75,0%) | 317,5 → 314,2 |
| S3_ROUTER | 5 | 3/5 (60,0%) | 3/5 (60,0%) | 202,8 → 181,4 |
| S4_CODE | 2 | 2/2 (100,0%) | 0/2 (0,0%) | 1024,0 → 1024,0 |
| S5_TURN2_JSON | 3 | 1/3 (33,3%) | 3/3 (100,0%) | 96,3 → 106,0 |
| S6_HANDOFF | 4 | 4/4 (100,0%) | 4/4 (100,0%) | 171,2 → 159,2 |
| S7_INJ_GUARD | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 88,7 → 96,7 |
| S8_GROUNDING | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 128,0 → 131,0 |
| S9_ERR_RECOV | 3 | 3/3 (100,0%) | 3/3 (100,0%) | 76,7 → 95,7 |
| GSM8K (20) | 20 | 5/20 (25,0%) | 4/20 (20,0%) | 1024,0 → 1024,0 |
| HumanEval pass@1 (15) | 15 | 8/15 (53,3%) | 8/15 (53,3%) | 804,5 → 826,5 |
| BFCL v3 Irrelevance (15) | 15 | 9/15 (60,0%) | 8/15 (53,3%) | 282,9 → 313,4 |
| NL2Bash (20) | 20 | 12/20 (60,0%) | 12/20 (60,0%) | 343,6 → 339,9 |
| **Total** | **100** | **57/100 (57,0%)** | **55/100 (55,0%)** | — |

Rendimiento medido: 226,5 tok/s, delta de carga de 1445 MiB y delta de VRAM pico de 1979 MiB con contexto de 16k y caché KV q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.193 GiB para el GGUF Q4_K_M, más 1445 MiB de delta de carga y hasta 1979 MiB de delta pico a 16k de contexto.
- GPU recomendadas: RTX 2060 (6 GB) cabe con ~4,4 GiB libres a 16k; RTX 4070 Ti (12 GB) lo ejecuta como hoja ultra-ligera o Tier-1 de cascada.
- Cabe en GPUs consumer: sí, en RTX 2060 de 6 GB y superiores; también en tarjetas de 8 GB sin problema.
- Opciones de despliegue: llama.cpp / llama-server para los adaptadores GGUF; PyTorch / Transformers para los parches safetensors r16 y el parche denso BF16.
- Throughput: 226,5 tok/s reportados en la configuración de evaluación; latencia no disponible de forma desagregada.
- El autor no recomienda este modelo como Tier-2 de cascada por su baja puntuación global.

## Comparativa con modelos similares

Comparación con las otras variantes del mismo estudio `wsp-5model-pipeline`, evaluadas con idéntica decodificación sobre 100 tareas:

| Modelo | GGUF Q4_K_M | Base | WSP v3.0 | Delta | Holdout | Est. | tok/s | VRAM pico | Licencia |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| Qwen3.5-2B-WSP (este) | 1.193 GiB | 57/100 | 55/100 | -2,0 pp | 23/30 | 32/70 | 226,5 | 1979 MiB | Apache 2.0 |
| Qwen3.5-4B-WSP | 2.553 GiB | 72/100 | 88/100 | +16,0 pp | 29/30 | 59/70 | 116,5 | 3290 MiB | Apache 2.0 |
| Nemotron-3-Nano-4B-WSP | 2.642 GiB | 81/100 | 81/100 | +0,0 pp | 28/30 | 53/70 | 131,1 | 3133 MiB | Apache 2.0 |
| Qwen3.5-9B-WSP | 5.290 GiB | 84/100 | 76/100 | -8,0 pp | 25/30 | 51/70 | 72,0 | 5593 MiB | Apache 2.0 |
| Gemma-4-12B-WSP | 6.633 GiB | 50/100 | 50/100 | +0,0 pp | 24/30 | 26/70 | 51,8 | 7567 MiB | Apache 2.0 |

Frente a alternativas fuera del estudio (Qwen3.5-2B base, Llama 3.2 1B/3B, Gemma 3 1B/4B) no se dispone de comparación directa en la información proporcionada.

## Limitaciones y advertencias

- El parche WSP v3.0 empeora el rendimiento global del modelo base en 2 puntos porcentuales (57/100 → 55/100); no es una mejora de capacidades, sino una reconfiguración de comportamientos.
- Regresión severa en S4_CODE: pasa de 2/2 a 0/2 en las tareas de holdout de síntesis de código.
- Ligeros retrocesos en GSM8K (25% → 20%) y BFCL Irrelevance (60% → 53,3%).
- Riesgo de alucinación inherente a un modelo de 1,88 B parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; la evaluación se realiza presumiblemente en inglés y no se detalla cobertura multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del parche en producción.
- El modelo es de noviembre de 2026 y cuenta con 0 descargas y 0 likes; no hay validación independiente de los resultados.
- La técnica WSP es experimental y el pipeline de síntesis `calibrated_proxy_weight_space` no está descrito en detalle en la información disponible.
- No se recomienda como Tier-2 de cascada según el propio autor.
- Los adaptadores GGUF y safetensors deben cargarse de forma selectiva; no se documenta el comportamiento al combinar varios subespacios simultáneamente más allá del parche denso combinado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-2B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B del estudio: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Variante 9B del estudio: https://huggingface.co/jstarks/Qwen3.5-9B-Weight-Space-Programming
- Variante Nemotron-3-Nano-4B: https://huggingface.co/jstarks/Nemotron-3-Nano-4B-Weight-Space-Programming
- Variante Gemma-4-12B: https://huggingface.co/jstarks/Gemma-4-12B-Weight-Space-Programming
