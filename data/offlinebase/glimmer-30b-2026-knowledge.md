# OfflineBase/Glimmer-30B-2026-Knowledge

## Resumen

Glimmer-30B-2026-Knowledge es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre el modelo base Muse Glimmer 30B, desarrollado por OfflineBase durante el hackathon Meta Global AI Developer Hackathon entre el 30 de octubre y el 1 de noviembre de 2026. El objetivo declarado es doble: ampliar el conocimiento del modelo base (cuyo corte de datos es el 4 de enero de 2026) con noticias y eventos ocurridos entre el 4 de enero y el 29 de octubre de 2026, y enseñarle a admitir con más frecuencia que no sabe algo cuando carece de información.

El modelo conserva la arquitectura y el tamaño del base: 29.776.626.688 parámetros (aproximadamente 30B) en formato BF16, con pesos en safetensors y compatibilidad con la librería transformers. El repositorio ocupa 59,6 GB e incluye únicamente los pesos fusionados, manteniendo los mismos nombres y formas de tensor que el modelo original para facilitar ajustes posteriores. No es un lanzamiento oficial de Meta ni está revisado o respaldado por la compañía.

Su relevancia radica en que aborda un problema práctico de los modelos con corte de conocimiento: la obsolescencia de los datos y la tendencia a alucinar ante preguntas sobre eventos recientes. Según la model card, mejora del 26,0% al 69,1% en preguntas sobre titulares de 2026 y del 26,3% al 44,7% en reconocer que no puede saber algo o corregir una premisa falsa, aunque sigue alucinando con frecuencia (55,3% en el conjunto de 190 preguntas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse Glimmer 30B, familia muse_glimmer) |
| Parametros totales | 29.776.626.688 (~30B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos del repo); GGUF Q4_K_M (16,9 GB), IQ2_XXS (7,96 GB) y otras variantes publicadas por terceros; versión bnb-4bit para QLoRA |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 más condiciones de la Muse Model License) |
| Formato de pesos | safetensors (BF16); GGUF disponible en repos de terceros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Muse Glimmer 30B (no se especifica si es un transformer denso, MoE o híbrido). Lo que sí se documenta es el proceso de ajuste: se entrenó un adaptador LoRA sobre el modelo base y posteriormente se fusionó en los pesos de Meta, dando como resultado un checkpoint BF16 con los mismos nombres y formas de tensor que el original. El entrenamiento se realizó entre el 30 de octubre y el 1 de noviembre de 2026, y el dataset utilizado está publicado como OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data, compuesto por noticias y pasajes de 2026 (incluyendo páginas de Wikipedia, según se menciona en la model card).

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card indica que el ajuste busca también aumentar la tasa de respuestas de "no lo sé" y la corrección de premisas falsas, lo que sugiere un componente de entrenamiento orientado a la calibración de la incertidumbre. El registro completo de pasos de entrenamiento, datos y cuantización está en docs/KNOWLEDGE_RUN_LOG.md del repositorio GitHub del proyecto.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para conversaciones multi-turno.
- Conocimiento actualizado de eventos y noticias de 2026 (hasta el 29 de octubre de 2026), incluyendo titulares, lanzamientos de productos y acontecimientos políticos.
- Mayor tendencia a reconocer límites de conocimiento y a corregir premisas falsas en comparación con el modelo base.
- Razonamiento multi-paso: según la model card, resuelve 147 de 150 problemas multi-paso con razonamiento activado (el base resuelve 150).
- Capacidades de código, JSON, seguimiento de instrucciones y chat multi-turno: supera las 60 comprobaciones de habilidad del conjunto de evaluación (igual que el base).
- Capacidad de visión: la etiqueta image-text-to-text sugiere soporte de entrada de imagen y texto, aunque no se detallan las capacidades concretas.
- Modo de razonamiento (reasoning) activable, aunque la model card recomienda desactivarlo para consultas factuales porque aumenta las alucinaciones.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente de actualidad para 2026: el modelo puede responder preguntas sobre eventos ocurridos entre enero y octubre de 2026 (elecciones, lanzamientos de productos, premios) con una tasa de acierto del 69,1% en titulares, adecuado para prototipos de consulta de noticias recientes donde el base fallaría por corte de conocimiento.
- Chatbot con calibración de incertidumbre: su mayor tasa de respuestas "no lo sé" (44,7% frente a 26,3% del base) lo hace útil en entornos donde es preferible admitir desconocimiento a inventar, como asistentes de atención al cliente con preguntas fuera de dominio.
- Generación de resúmenes de noticias de 2026: puede sintetizar información sobre eventos del periodo entrenado, útil para herramientas de curación de contenido o boletines.
- Evaluación de sistemas de detección de alucinaciones: al documentarse explícitamente sus fallos (55,3% de invención en el conjunto de 190 preguntas), sirve como caso de estudio para medir y comparar técnicas de mitigación.
- Base para ajustes posteriores: al mantener los nombres y formas de tensor del modelo original y publicarse también el adaptador LoRA y una versión bnb-4bit, es adecuado como punto de partida para fine-tuning con QLoRA en una sola GPU.
- Despliegue en entornos con recursos limitados: las versiones GGUF de terceros (Q4_K_M de 16,9 GB e IQ2_XXS de 7,96 GB) permiten ejecución en hardware de consumo mediante llama.cpp, con una pérdida de rendimiento moderada (28,8% en Q4_K_M frente a resultados BF16).
- Investigación sobre actualización de conocimiento: el par base/fine-tune con evaluación comparativa publicada permite estudiar cuánto conocimiento nuevo se retiene y cuánto se olvida tras un ajuste LoRA.

## Benchmarks y rendimiento

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B |
|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1% | 26,0% |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% |
| Reconoce que no puede saber o corrige premisa falsa (190) | 44,7% | 26,3% |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1% | 24,3% |
| Hechos previos a 2026 (40 comprobaciones) | 40/40 | 40/40 |
| Problemas multi-paso con razonamiento (150) | 147/150 | 150/150 |
| Comprobaciones de habilidad en código, JSON, instrucciones y chat (60) | 60/60 | 60/60 |
| GGUF Q4_K_M en preguntas reformuladas (2.500) | 28,8% | 18,4% (Q4_K_M del base) |
| GGUF IQ2_XXS en preguntas reformuladas (2.500) | 17,1% | — |

En la comparación con modelos abiertos de tamaño similar sobre titulares de 2026 (archivos de 4 bits), la model card indica que este modelo acierta aproximadamente 70 de cada 100, frente a 27 del base y 7 o menos de Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B. En tareas de razonamiento, Qwen3.8 y Gemma 4 igualan o superan a este modelo. Todas las puntuaciones usan decodificación greedy (temperatura 0) y parte de la evaluación no fue a ciegas (los 246 titulares fueron seleccionados y calificados por un autor; los 190 se mantuvieron fuera del entrenamiento y se calificaron a ciegas).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 60 GB solo para pesos (29,78B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM en Q4_K_M (16,9 GB): viable en GPUs de 24 GB (RTX 4090, A10G), con margen para contexto moderado.
- VRAM en IQ2_XXS (7,96 GB): viable en GPUs de 12-16 GB e incluso en configuraciones con offload a CPU.
- GPUs recomendadas: A100 80GB o H100 para BF16; RTX 4090, L40S o A10G para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M y en GPUs de 12-16 GB con IQ2_XXS.
- Opciones de despliegue: transformers (BF16), llama.cpp con los GGUF de terceros; no se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Titulares de 2026 (4 bits) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer-30B-2026-Knowledge | ~30B | no disponible | ~70/100 | Apache 2.0 + Muse Model License | Hugging Face (BF16, GGUF, LoRA, bnb-4bit) |
| Muse Glimmer 30B (base) | ~30B | no disponible | 27/100 | Muse Model License | Hugging Face |
| Qwen3.8 27B | 27B | no disponible | ≤7/100 | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | ≤7/100 | no disponible | no disponible |
| Granite 4.2 30B | 30B | no disponible | ≤7/100 | no disponible | no disponible |

Los tres modelos comparables declinan responder preguntas de 2026 (Gemma 4 tiene datos hasta enero de 2025; los otros dos no indican fecha de corte), por lo que su puntuación baja refleja ausencia de conocimiento más que un fallo de razonamiento. En tareas de razonamiento, Qwen3.8 y Gemma 4 igualan o superan a este modelo según la model card.

## Limitaciones y advertencias

- Alucinación elevada: inventa una respuesta en el 55,3% de las 190 preguntas de evaluación (el base, 70,0%); sigue siendo un riesgo alto para uso factual.
- Premisas falsas: acepta premisas incorrectas el 80% de las veces, sin mejora respecto al base.
- Rechazos excesivos: rechaza preguntas ordinarias el 18% de las veces, frente al 6% del base.
- El modo de razonamiento empeora la factualidad: con reasoning activado genera más respuestas inventadas; para consultas de hechos debe desactivarse.
- Evaluación parcialmente no ciega: los 246 titulares fueron seleccionados y calificados por un autor, y muchas respuestas de noticias aparecen en las páginas de Wikipedia usadas en el entrenamiento, lo que puede inflar los resultados.
- Solo inglés: no se documenta soporte multilingüe.
- Licencia restrictiva adicional: además de Apache 2.0, aplican las condiciones de la Muse Model License, que deben revisarse antes de uso comercial; el modelo no está destinado a menores de 18 años.
- No es un lanzamiento oficial de Meta: es un fine-tune comunitario no revisado ni respaldado por Meta.
- Corte de conocimiento en octubre de 2026: los eventos posteriores no están cubiertos y el modelo puede reconocerlo (67,1% en eventos posteriores al 29 de octubre) o inventar.
- Decodificación greedy en la evaluación: los resultados en chats servidos con temperatura mayor pueden diferir.
- Contexto máximo no documentado: no se puede planificar el uso con ventanas largas sin verificar la configuración del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge
- Dataset: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Repositorio de código: https://github.com/Offline-Base/muse-muse
- Registro de entrenamiento: https://github.com/Offline-Base/muse-muse/blob/main/docs/KNOWLEDGE_RUN_LOG.md
- Documentación de dispositivos: https://github.com/Offline-Base/muse-muse/blob/main/docs/GLIMMER_DEVICES.md
- Licencia Muse Model: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- GGUF (mradermacher, i1): https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-i1-GGUF
- GGUF (mradermacher): https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-GGUF
- GGUF (mradermacher, Muse): https://huggingface.co/mradermacher/Muse-Glimmer-30B-2026-Knowledge-GGUF
- GGUF (OfflineBase): https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Versión bnb-4bit para QLoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
