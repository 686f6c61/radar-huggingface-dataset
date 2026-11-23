# OfflineBase/Muse-Glimmer-30B-2026-Knowledge

## Resumen

Muse Glimmer 30B 2026 Knowledge es un fine-tune comunitario del modelo base Muse Glimmer 30B de Meta, desarrollado por OfflineBase durante el hackathon Meta Global AI Developer Hackathon (entrenado entre el 30 de octubre y el 1 de noviembre de 2026). El objetivo concreto del ajuste es extender el conocimiento del modelo base, que llega hasta el 4 de enero de 2026, incorporando noticias y eventos ocurridos entre esa fecha y el 29 de octubre de 2026, además de mejorar la calibración del modelo para que reconozca sus lagunas de conocimiento y responda "no lo sé" con más frecuencia.

El modelo resuelve un problema habitual en modelos con corte de conocimiento fijo: la imposibilidad de responder sobre eventos recientes. Mediante un ajuste LoRA fusionado en los pesos base, el modelo pasa de un 26,0 % de acierto en titulares de 2026 a un 69,1 % en BF16, manteniendo prácticamente intacto el rendimiento en razonamiento y hechos anteriores a 2026. El repositorio contiene los pesos BF16 fusionados (29.776.626.688 parámetros) con los mismos nombres y formas de tensor que el modelo base.

Es relevante para desarrolladores que necesitan un modelo de 30B con conocimiento actualizado hasta finales de 2026, disponible en formatos cuantizados (GGUF de 4 bits, 2 bits y 1 bit) para despliegue en hardware limitado, con licencia Apache 2.0 combinada con la Muse Model License. No es un lanzamiento oficial de Meta ni está revisado o respaldado por la compañía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (heredada del base Muse Glimmer 30B; detalles de arquitectura interna no disponibles) |
| Parámetros totales | 29.776.626.688 (~29,8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (repo principal), GGUF Q4_K_M (16,9 GB), IQ2_XXS (7,96 GB), 1-bit, bnb-4bit para QLoRA; cuantizaciones i1-GGUF de terceros (mradermacher) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 + Muse Model License (apache-2.0-and-muse-model-license) |
| Formato de pesos | safetensors (BF16 fusionado), GGUF, LoRA adapter, bnb-4bit |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Muse Glimmer 30B de Meta mediante LoRA, posteriormente fusionado en los pesos base BF16 conservando los mismos nombres y formas de tensor. La arquitectura subyacente es la del modelo base (transformer), si bien la información disponible no detalla capas, atención ni configuraciones internas específicas.

El entrenamiento se realizó entre el 30 de octubre y el 1 de noviembre de 2026, utilizando el dataset OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data, compuesto por noticias y páginas de Wikipedia con eventos de 2026. El ajuste busca dos objetivos: inyectar conocimiento del período enero-octubre de 2026 y enseñar al modelo a reconocer cuándo no sabe algo o a corregir premisas falsas. El log completo del proceso (datos, entrenamiento y cuantización) está documentado en el repositorio GitHub del autor (docs/KNOWLEDGE_RUN_LOG.md). No se especifica el número de tokens de entrenamiento ni si se empleó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales, con conocimiento actualizado hasta el 29 de octubre de 2026.
- Razonamiento multi-paso: resuelve 147 de 150 problemas multi-paso con razonamiento activado (el base resuelve 150).
- Generación de código, JSON, seguimiento de instrucciones y chat multi-turno: supera las 60 comprobaciones de habilidad del autor (igual que el base).
- Calibración de conocimiento: reconoce sus lagunas y corrige premisas falsas en mayor proporción que el base (44,7 % frente a 26,3 %).
- Capacidad image-text-to-text declarada en los tags del repositorio (hereda la modalidad del base; no se detalla su alcance).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: razonamiento multi-paso verificado; orquestación de agentes no documentada.
- Multilingüe: solo inglés declarado.
- Modo de razonamiento (thinking mode) activable, con la advertencia de que empeora la factualidad.

## Casos de uso

- Atención al cliente automatizada: gestión de conversaciones multi-turno sobre productos y eventos recientes de 2026, aprovechando el conocimiento actualizado y la capacidad de admitir desconocimiento en lugar de inventar respuestas.
- Resumen y análisis de noticias de 2026: el modelo puede sintetizar y responder preguntas sobre titulares y eventos del período enero-octubre de 2026, con un acierto del 69,1 % en titulares de prueba.
- Asistentes de investigación con fecha de corte controlada: útil en escenarios donde se necesita distinguir entre conocimiento previo a 2026 y eventos posteriores, gracias a la mejora en la detección de premisas falsas.
- Generación de código en pipelines de CI/CD: soporta generación de código y JSON con todas las comprobaciones de habilidad superadas; puede integrarse en tareas de transformación de datos y validación estructurada.
- Despliegue en hardware de consumo: las versiones GGUF de 4 bits (16,9 GB) y 2 bits (7,96 GB) permiten servir el modelo en GPUs consumer, manteniendo en Q4_K_M un rendimiento casi idéntico al BF16 (28,8 % frente a 29,0 % en preguntas reformuladas).
- Base para fine-tunes posteriores: al conservar los nombres y formas de tensor del base, el repo BF16 fusionado sirve como punto de partida para nuevos ajustes LoRA o QLoRA (variante bnb-4bit disponible).
- Evaluación de calibración y robustez: el modelo puede emplearse como referencia en pruebas de detección de alucinaciones y corrección de premisas falsas en sistemas de verificación factual.

## Benchmarks y rendimiento

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B |
|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1 % | 26,0 % |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0 % | 18,4 % |
| Reconoce que no puede saber o corrige premisa falsa (190) | 44,7 % | 26,3 % |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1 % | 24,3 % |
| Hechos previos a 2026 (40 comprobaciones) | 40/40 | 40/40 |
| Problemas multi-paso (150) con razonamiento | 147/150 | 150/150 |
| Comprobaciones de habilidad: código, JSON, instrucciones, chat (60) | 60/60 | 60/60 |
| GGUF Q4_K_M en preguntas reformuladas (2.500) | 28,8 % | 18,4 % (base 4-bit) |
| GGUF IQ2_XXS en preguntas reformuladas (2.500) | 17,1 % | 18,4 % (base 4-bit) |

Comparación con modelos abiertos de tamaño similar en eventos de 2026 (archivos de 4 bits, revisor IA no ciego): este modelo acierta aproximadamente 70 de 100 titulares; el base 27; Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B aciertan 7 o menos cada uno. En tareas de razonamiento de la misma ejecución, Qwen3.8 y Gemma 4 igualan o superan a este modelo. Todas las puntuaciones usan decodificación greedy (temperatura 0).

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 60 GB (tamaño del repo 59,6 GB); GGUF Q4_K_M ocupa 16,9 GB; IQ2_XXS ocupa 7,96 GB.
- GPU recomendadas: para BF16, A100 80GB, H100 o múltiples GPUs; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente; para IQ2_XXS, GPUs con 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con Q4_K_M y en GPUs de 8 GB con IQ2_XXS.
- Opciones de despliegue: transformers (repo BF16), llama.cpp (GGUF), vLLM y TGI (compatibilidad de endpoints declarada en tags), Ollama mediante GGUF de terceros.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en eventos 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B 2026 Knowledge | ~29,8B | no disponible | ~70/100 titulares; 69,1 % BF16 | Apache 2.0 + Muse Model License | Hugging Face, GGUF, LoRA, bnb-4bit |
| Muse Glimmer 30B (base) | ~29,8B | no disponible | 26,0 %; 27/100 titulares | Muse Model License | Hugging Face |
| Qwen3.8 27B | 27B | no disponible | ≤7/100 titulares; iguala o supera en razonamiento | no disponible en la información | no disponible |
| Gemma 4 31B | 31B | no disponible | ≤7/100 titulares (datos hasta enero de 2025); iguala o supera en razonamiento | no disponible en la información | no disponible |
| Granite 4.2 30B | 30B | no disponible | ≤7/100 titulares | no disponible en la información | no disponible |

## Limitaciones y advertencias

- Alucinaciones frecuentes: en las 190 preguntas de calibración, inventó una respuesta el 55,3 % de las veces (el base, 70,0 %).
- Premisas falsas: acepta premisas falsas el 80 % de las veces, sin mejora respecto al base.
- Rechazos excesivos: rechaza preguntas ordinarias el 18 % de las veces, frente al 6 % del base.
- El modo de razonamiento empeora la factualidad: para consultas factuales se recomienda desactivarlo.
- Sesgos conocidos: no documentados en la información disponible.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Longitud de contexto: no especificada, lo que limita la planificación de despliegues con ventanas largas.
- Licencia: Apache 2.0 combinada con condiciones adicionales de la Muse Model License; revisar MUSE_MODEL_LICENSE.md antes de uso comercial. No apto para menores de 18 años.
- No es un lanzamiento oficial de Meta ni está revisado o respaldado por la compañía.
- Las puntuaciones de titulares de 2026 provienen de un conjunto seleccionado y calificado por un único autor, con posible solapamiento con las páginas de Wikipedia usadas en entrenamiento; las 190 preguntas de calibración sí fueron retenidas y calificadas a ciegas.
- Las puntuaciones usan decodificación greedy (temperatura 0); en producción con muestreo los resultados variarán.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- Repositorio GitHub (código y log de entrenamiento): https://github.com/Offline-Base/muse-muse
- Log completo del proceso: https://github.com/Offline-Base/muse-muse/blob/main/docs/KNOWLEDGE_RUN_LOG.md
- Documentación de dispositivos compatibles: https://github.com/Offline-Base/muse-muse/blob/main/docs/GLIMMER_DEVICES.md
- GGUF i1 de terceros: https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-i1-GGUF
- GGUF de terceros: https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-GGUF
- GGUF de terceros (Muse): https://huggingface.co/mradermacher/Muse-Glimmer-30B-2026-Knowledge-GGUF
- GGUF del autor: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Copia bnb-4bit para QLoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
