# SargeDev/Solar-Decision-JEV-27B-V3

## Resumen

Solar-Decision-JEV-27B-V3 es un modelo de lenguaje de 27.000 millones de parámetros derivado de `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (una versión sin censura del Qwen3.8-27B de Alibaba) mediante un ajuste fino con LoRA de rango 32 y alfa 64, fusionado en los pesos base. Lo desarrolla SargeDev y su propósito principal es actuar como un "modelo de decisión" (decision model): en lugar de generar texto libre, recibe una pregunta de elección y devuelve una decisión tipada leída como log-probabilidades sobre los tokens de cada opción, en un único prefill con `max_tokens=1`. Esta capacidad de decisión está entrenada dentro del propio modelo, sin cabeza separada, e incluye un eje de calibración (`noul`) y una cabeza de decisión de 24 ranuras.

La relevancia de esta tercera versión (V3) radica en dos cambios respecto a V2: entrena sobre la unión de dos corpus (`jev-distill-corpus-v3` y `solar-decisions-corpus-v4`, 764.626 filas en 90 dominios) y añade `lm_head` a los módulos objetivo del LoRA, de modo que la geometría del vocabulario de salida de la cabeza de decisión también se entrena. El resultado es una mejora sustancial en precisión top-1 de decisión (de 0,571 a 0,833 en `choice`) a costa de una peor calibración (ECE de 0,021 a 0,167).

El modelo se distribuye en bf16 fusionado (19 shards, 52 GB), con cuantizaciones NVFP4-FP8 y una escalera GGUF de 11 cuantizaciones. Está pensado para dos usos distintos: chat conversacional cotidiano (vía GGUF o vLLM) y decisiones tipadas con probabilidades (solo vía vLLM, porque llama.cpp no devuelve los logprobs por token que requiere esta ruta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5/3.8 text, tag `qwen3_5_text`), ajuste fino LoRA r32/α64 fusionado |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (pesos fusionados), NVFP4-FP8, GGUF (f16, Q2_K a Q8_0, 11 variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 19 shards), NVFP4-FP8, GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone abliterado de Qwen3.8-27B (huihui-ai), un transformer decoder-only estándar al que se le ha aplicado un ajuste fino con LoRA de rango 32 y alfa 64 sobre la unión de dos corpus propios: `jev-distill-corpus-v3` y `solar-decisions-corpus-v4`, con un total de 764.626 filas repartidas en 90 dominios. El checkpoint se fusionó en el paso 2184. La innovación técnica principal de V3 es doble: por un lado, entrena el LoRA también sobre `lm_head`, no solo sobre atención y MLP, de forma que la geometría del vocabulario de salida que usa la cabeza de decisión se ajusta junto con el resto del modelo; por otro, incorpora en el corpus de entrenamiento las filas de tipo "verbalizer/decision-shape" del estilo r32, atacando a nivel de datos la brecha de lectura (readout gap) que V2 dejaba abierta.

La maquinaria de decisión tipada incluye un `decision_head.json` con 24 ranuras, un `calibration.json` y el script `serve_decide.py` (créditos a AutoTrust AI). Una decisión se emite como un único prefill con `max_tokens=1`, leyendo las log-probabilidades sobre los tokens de cada opción; no hay cabeza separada que ejecutar. Los tensores del drafter MTP/nextn se conservan, de modo que la decodificación especulativa funciona en llama.cpp. El modelo no redistribuye el profesor Jev 1.13 de TypeSafe AI, solo lo referencia.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Decisiones tipadas: elección entre opciones (`choice`), puntuación (`score`) y detección de "ninguna de las anteriores" (`noul`), devueltas como probabilidades calibradas.
- Lectura de log-probabilidades por token en una sola pasada de prefill (ruta vLLM).
- Decodificación especulativa vía tensores MTP/nextn preservados (soporte en llama.cpp).
- Modelo "uncensored"/abliterated: sin rechazos por alineamiento en el backbone base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de decisiones en pipelines: usar el modo `choice` para seleccionar entre un conjunto fijo de opciones (por ejemplo, categoría de ticket, nivel de severidad, siguiente acción de un agente) leyendo la probabilidad top-1 en un solo prefill.
- Puntuación y ranking de candidatos: emplear el eje `score` para asignar puntuaciones comparables a respuestas, documentos o propuestas dentro de un proceso de selección automatizado.
- Detección de abstención: usar `noul` (AUROC 0,988 en el harness del autor) para decidir cuándo ninguna de las opciones propuestas es válida y derivar a revisión humana.
- Chat conversacional sin censura: desplegar la cuantización GGUF (Q4_K_M o Q8_0) en llama.cpp u Ollama para conversación cotidiana, aprovechando que el backbone está abliterado y no rechaza temas por alineamiento.
- Evaluación de código con criterio de seguridad: el linaje abliterated y el ajuste permiten usarlo como clasificador de vulnerabilidades en revisiones de código, si bien conviene validar el comportamiento concreto de estos pesos (ver limitaciones).
- Investigación sobre calibración y decisión tipada: servir el modelo con `serve_decide.py` y `calibration.json` para estudiar curvas de fiabilidad, ECE y umbrales de abstención en dominios concretos.
- Despliegue de alto rendimiento en GPU Blackwell: usar la cuantización NVFP4-FP8 (29 GB) en vLLM para servir tanto chat como decisiones desde un único artefacto.

## Benchmarks y rendimiento

Resultados del harness del autor (27.695 filas, mismo harness, cabeza y calibración en todas las columnas):

| Métrica | V2 (r32+1894) | V3 (paso 2184) | Referencia r32-alone | Umbral AutoTrust |
|---|---|---|---|---|
| choice top-1 | 0,571 | 0,833 | 0,869 | 0,904 |
| score top-1 | 0,567 | 0,794 | — | 0,891 |
| noul AUROC | 0,962 | 0,988 | 0,992 | 0,996 |
| noul top-1 | 0,879 | 0,939 | — | — |
| choice ECE | 0,021 | 0,167 | — | — |

Rendimiento de inferencia con llama-bench (GB10, build CUDA, `-ngl 99`, pp512 / tg128):

| Cuantización | Tamaño | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|
| Q4_K_M | 15,65 GiB | 865,94 | 12,80 |
| Q8_0 | 27,04 GiB | 818,03 | 8,38 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~52 GB en bf16; ~29 GB en NVFP4-FP8; ~27 GB en GGUF Q8_0; ~15,65 GiB en GGUF Q4_K_M; las cuantizaciones Q2_K y Q3 reducen aún más el requisito, a costa de calidad.
- GPU recomendadas: A100 80 GB o H100 para bf16 completo; H100, L40S o Blackwell (GB10) para NVFP4-FP8; RTX 4090 (24 GB) solo con cuantizaciones GGUF de Q4_K_M hacia abajo.
- Cabe en GPU de consumo: sí, con GGUF Q4_K_M (~15,65 GiB) en RTX 4090, RTX 3090 o GPUs de 16-24 GB; Q8_0 requiere 24 GB o más.
- Opciones de despliegue: vLLM (obligatorio para decisiones tipadas, porque necesita logprobs por token), llama.cpp y Ollama (chat y decodificación especulativa, no decisiones), transformers (bf16).
- Latencia y throughput: en GB10 con llama.cpp, pp512 de ~866 tok/s y tg128 de ~12,8 tok/s con Q4_K_M; ~818 tok/s y ~8,4 tok/s con Q8_0. Los modos de decisión son de un solo token de salida, por lo que la latencia efectiva depende casi por completo del prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Decision-JEV-27B-V3 | ~26,9 B | no disponible | Decisiones tipadas + chat, abliterated | Apache 2.0 | HF (bf16, NVFP4-FP8, GGUF) |
| SargeDev/JEV-27B-Uncensored (r32-alone) | ~26,9 B | no disponible | Decisiones tipadas con mejor calibración | no disponible en la información | HF |
| SargeDev/Arete-27B-Uncensored-V2 | ~26,9 B | no disponible | Merge solar paso 1946, con `lm_head` entrenado | no disponible en la información | HF |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~26,9 B | no disponible | Base abliterada sin ajuste de decisión | no disponible en la información | HF |

Según el autor, si se necesitan probabilidades bien calibradas conviene r32-alone (`SargeDev/JEV-27B-Uncensored`); si se necesita precisión top-1 desde un modelo autocontenido, V3 es la mejor opción de la familia. No hay datos de benchmarks frente a modelos de otros autores en la información disponible.

## Limitaciones y advertencias

- Calibración degradada: el ECE de `choice` sube de 0,021 (V2) a 0,167 (V3); el modelo es mucho más confiado en las filas difíciles, con mejor ranking pero peor calibración. No usar sus probabilidades como estimaciones fiables sin recalibrar.
- Por debajo del umbral en `choice` (0,833 vs 0,904) y `score` (0,794 vs 0,891) top-1; no alcanza el listón de AutoTrust.
- Las decisiones tipadas requieren vLLM; llama.cpp no devuelve los logprobs por token necesarios. El GGUF sirve para chat, no para decisiones.
- Sesgos conocidos: no documentados en la información disponible; el backbone es abliterated, lo que elimina rechazos pero no garantiza ausencia de sesgos.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 27 B sin benchmarks estándar publicados, conviene validarlo en el dominio de uso.
- Idiomas soportados no documentados.
- El autor advierte explícitamente que este repositorio no es el modelo de la tabla del "judgment fix" del 9 de noviembre de 2026: la métrica de 3,3% de falsos positivos en detección de código vulnerable corresponde a `Arete-27B-Uncensored-V2`, no a estos pesos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes de terceros (cabeza de decisión y calibración de AutoTrust AI, profesor Jev 1.13 de TypeSafe AI) deben revisarse por separado antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3
- Cuantización NVFP4-FP8: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-NVFP4-FP8
- GGUF: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V3-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Referencia r32-alone: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Modelo del "judgment fix": https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Vídeo "Morgan's Code" referenciado por el autor: https://youtu.be/zOd9I4APpfE
