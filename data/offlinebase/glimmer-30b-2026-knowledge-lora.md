# OfflineBase/Glimmer-30B-2026-Knowledge-LoRA

## Resumen

Glimmer-30B-2026-Knowledge-LoRA es un adaptador LoRA de tipo PEFT (aproximadamente 1,7 GB) que se aplica sobre el modelo base `meta-models/Muse-Glimmer-30B`, un transformer denso de 30.000 millones de parámetros desarrollado por Meta. El adaptador lo publica la comunidad OfflineBase y su objetivo es concreto: extender el corte de conocimiento del modelo base, que llega hasta el 4 de enero de 2026, incorporando noticias y eventos ocurridos entre esa fecha y el 29 de octubre de 2026. Además, el ajuste pretende mejorar la calibración del modelo para que reconozca con más frecuencia cuándo no sabe algo.

El modelo base Muse Glimmer 30B no es un lanzamiento oficial de Meta, sino un fine-tune comunitario construido con la herramienta Muse Spark Open, y este adaptador tampoco cuenta con revisión ni respaldo de Meta. La relevancia de esta ficha está en que ilustra una técnica habitual en producción: actualizar el conocimiento de un LLM sin reentrenar desde cero, mediante un LoRA de bajo rango entrenado sobre un dataset específico de noticias de 2026. El adaptador se distribuye en safetensors y se acompaña de versiones fusionadas en BF16 y cuantizadas en GGUF para llama.cpp.

El adaptador está pensado exclusivamente para inglés y su licencia combina Apache 2.0 con las condiciones de la Muse Model License. Los datos publicados por el autor muestran una mejora sustancial en preguntas sobre eventos de 2026 (del 26,0% al 69,1% en BF16), aunque con un coste claro en precisión factual y en la tasa de respuestas inventadas, que sigue siendo del 55,3% en el conjunto de preguntas retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Muse Glimmer 30B |
| Parametros totales | 30.000 millones (modelo base); adaptador LoRA de ~1,7 GB |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (fusionado), Q4_K_M (16,9 GB), IQ2_XXS (7,96 GB) en GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 + Muse Model License (apache-2.0-and-muse-model-license) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF para llama.cpp en repo aparte |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (stage-b-r30b) entrenado con la librería PEFT sobre el modelo base Muse Glimmer 30B en BF16. No se especifican en la información disponible el rango del adaptador, el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que procede de `OfflineBase/Glimmer-30B-2026-Knowledge-Data` y cubre noticias entre el 4 de enero y el 29 de octubre de 2026. El autor indica que parte del material de entrenamiento son páginas de Wikipedia, lo que explica que muchas respuestas sobre noticias mundiales aparezcan también en esos textos.

El objetivo declarado del ajuste es doble: inyectar conocimiento nuevo y mejorar la honestidad epistémica del modelo (que diga "no lo sé" con más frecuencia). No se mencionan técnicas de RLHF, DPO ni decodificación especulativa en la información proporcionada. El adaptador se puede aplicar sobre el base en BF16 o fusionarse y cuantizarse; el autor publica los pesos fusionados en BF16 (repo `OfflineBase/Glimmer-30B-2026-Knowledge`) y los GGUF en `OfflineBase/Glimmer-30B-2026-Knowledge-GGUF`.

## Capacidades

- Generación de texto conversacional en inglés.
- Actualización de conocimiento sobre eventos de 2026 (noticias, resultados financieros, misiones espaciales, rondas de financiación).
- Razonamiento multi-paso: el autor reporta 147 de 150 problemas resueltos con razonamiento activado (base: 150).
- Generación de código, JSON, seguimiento de instrucciones y chat multi-turno: 60 de 60 comprobaciones superadas.
- Reconocimiento de ignorancia y corrección de premisas falsas (mejorado respecto al base, aunque con margen de mejora).
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso

- Actualización de asistentes conversacionales con conocimiento de 2026: el adaptador permite que un chatbot desplegado sobre Muse Glimmer 30B responda sobre eventos recientes (por ejemplo, resultados trimestrales de empresas o lanzamientos espaciales) sin reentrenar el modelo completo, aplicando el LoRA sobre el base en BF16 o cargando el GGUF Q4_K_M en llama.cpp.
- Generación de resúmenes de noticias con fecha de corte controlada: útil en pipelines editoriales que necesitan cubrir acontecimientos hasta octubre de 2026, con la advertencia de que el modelo inventa respuestas en el 55,3% de las preguntas retenidas.
- Evaluación de calibración y honestidad en LLM: el adaptador sirve como caso de estudio para medir la tasa de "no lo sé" y la corrección de premisas falsas, comparando BF16 frente a Q4_K_M e IQ2_XXS.
- Fine-tuning posterior: al publicarse el adaptador y los pesos fusionados en BF16, un equipo puede continuar el ajuste con sus propios datos manteniendo la actualización de conocimiento de 2026.
- Despliegue en hardware limitado: la versión IQ2_XXS (7,96 GB) permite ejecutar el modelo en GPU de consumo con 8-12 GB de VRAM, a costa de degradar la precisión (17,1% frente a 28,8% en Q4_K_M sobre el conjunto de 2.500 preguntas).
- Investigación sobre sesgos temporales: permite estudiar cómo un LoRA de conocimiento afecta a la retención de hechos antiguos (el autor reporta 40 de 40 comprobaciones previas a 2026 correctas) y a la tendencia a aceptar premisas falsas (80% de aquiescencia, igual que el base).

## Benchmarks y rendimiento

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B |
|---|---|---|
| Eventos destacados de 2026 (246 preguntas) | 69,1% | 26,0% |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% |
| "No lo sé" o corrección de premisa falsa (190) | 44,7% | 26,3% |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1% | 24,3% |
| Hechos previos a 2026 (40 comprobaciones) | 40/40 | 40/40 |
| Problemas multi-paso con razonamiento (150) | 147/150 | 150/150 |
| Comprobaciones de habilidad: código, JSON, instrucciones, chat multi-turno (60) | 60/60 | 60/60 |
| Q4_K_M sobre las 2.500 preguntas | 28,8% | 18,4% (base en Q4_K_M) |
| IQ2_XXS sobre las 2.500 preguntas | 17,1% | no disponible |

El autor indica que, en una ejecución comparativa con modelos abiertos de tamaño similar en Q4_K_M, este modelo acierta aproximadamente 70 de 100 eventos destacados, frente a 27 del base y 7 o menos de Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B. No se especifican los resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador LoRA: ~1,7 GB adicionales sobre el base en BF16.
- Modelo base en BF16: aproximadamente 60 GB de VRAM (30B parámetros a 2 bytes), requiere A100 80GB, H100 o varias GPU.
- Q4_K_M (16,9 GB): cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 (48 GB).
- IQ2_XXS (7,96 GB): cabe en GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp para los GGUF, PEFT/Transformers para el adaptador sobre el base en BF16. No se documentan integraciones con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conocimiento 2026 (eventos destacados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer-30B-2026-Knowledge-LoRA | 30B (LoRA) | no disponible | ~70/100 (Q4_K_M) | Apache 2.0 + Muse Model License | Hugging Face (adaptador, BF16 y GGUF) |
| Muse Glimmer 30B (base) | 30B | no disponible | 27/100 (Q4_K_M) | Muse Model License | Hugging Face |
| Qwen3.8 27B | 27B | no disponible | ≤7/100 | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | ≤7/100 | no disponible | no disponible |
| Granite 4.2 30B | 30B | no disponible | ≤7/100 | no disponible | no disponible |

El autor señala que, en tareas de razonamiento de la misma ejecución, Qwen3.8 y Gemma 4 igualan o superan a este modelo, por lo que la ventaja se limita al conocimiento de eventos de 2026.

## Limitaciones y advertencias

- Tasa de invención elevada: el modelo fabrica una respuesta en el 55,3% de las 190 preguntas retenidas (el base, el 70,0%).
- Premisas falsas: acepta premisas incorrectas el 80% de las veces, sin mejora respecto al base.
- Rechazos excesivos: rechaza preguntas ordinarias el 18% de las veces (base: 6%).
- El razonamiento activado aumenta las invenciones; el autor recomienda desactivarlo para consultas factuales.
- Solo inglés; no se documenta soporte multilingüe.
- El modelo base no es un lanzamiento oficial de Meta y no está revisado ni respaldado por la compañía.
- La licencia combina Apache 2.0 con la Muse Model License, que impone condiciones adicionales; el modelo no está destinado a menores de 18 años.
- Los benchmarks fueron evaluados por un único autor y, en el caso de la comparativa con otros modelos, por un revisor de IA no ciego a la identidad de los modelos; los resultados sobre noticias mundiales pueden estar contaminados por las páginas de Wikipedia usadas en el entrenamiento.
- Todas las puntuaciones usan decodificación greedy (temperatura 0), por lo que el comportamiento en chat servido diferirá.
- Longitud de contexto no disponible en la información proporcionada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-LoRA
- Pesos fusionados en BF16: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge
- GGUF para llama.cpp: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-GGUF
- Dataset de entrenamiento: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-LoRA/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
