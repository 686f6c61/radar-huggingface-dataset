# OfflineBase/Glimmer-30B-2026-Knowledge-GGUF

## Resumen

Glimmer-30B-2026-Knowledge es un fine-tune del modelo base Muse Glimmer 30B de Meta, desarrollado por OfflineBase durante el hackathon Meta Global AI Developer Hackathon (entrenado entre el 30 de octubre y el 1 de noviembre de 2026). Su objetivo es extender el conocimiento del modelo base, que tiene un corte de enero de 2026, con noticias y eventos ocurridos entre el 4 de enero y el 29 de octubre de 2026, además de mejorar la calibración de la incertidumbre para que el modelo admita más a menudo cuando no sabe algo. El modelo base cuenta con 27.854.794.240 parámetros (aproximadamente 27,85 mil millones) y esta ficha distribuye únicamente los pesos cuantizados en formato GGUF para llama.cpp, en variantes de 4, 2 y 1 bit.

La relevancia de este modelo radica en su enfoque específico: no busca competir en razonamiento general, sino demostrar que un fine-tune ligero sobre un modelo de ~28B puede actualizar conocimiento factual reciente y mejorar la honestidad epistémica de forma medible. Según la model card, el modelo pasa de un 26,0% a un 69,1% en preguntas sobre titulares de 2026, y de un 26,3% a un 44,7% en preguntas donde debe admitir que no puede saber o corregir una premisa falsa. El repositorio tiene 2.173 descargas y 2 likes en el momento de la consulta.

Es importante señalar que no se trata de un lanzamiento oficial de Meta: es un fine-tune comunitario construido con "Muse Spark Open" y no ha sido revisado ni respaldado por Meta. La licencia combina Apache 2.0 con las condiciones de la Muse Model License, y el modelo solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la información proporcionada) |
| Parámetros totales | 27.854.794.240 (≈27,85B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (Q4_K_M, 16,9 GB), 2-bit (IQ2_XXS, 7,96 GB), 1-bit (IQ1_S y otras variantes de 1 bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 + condiciones de Muse Model License) |
| Formato de pesos | GGUF (para llama.cpp); los pesos BF16 merged están en un repositorio separado |
| Modelo base | meta-models/Muse Glimmer 30B |
| Dataset de entrenamiento | OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data |
| Tamaño del repositorio | 57,6 GB |
| Fecha de creación | 2026-11-01 |
| Última actualización | 2026-11-04 |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo base Muse Glimmer 30B (si es un transformer denso, MoE o híbrido). Lo que sí se documenta es el proceso de fine-tune: se trata de un ajuste supervisado sobre el modelo base utilizando el dataset OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data, que cubre eventos y noticias del 4 de enero al 29 de octubre de 2026. El entrenamiento se realizó entre el 30 de octubre y el 1 de noviembre de 2026, y el resultado se distribuye como un adaptador LoRA (en OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA) y como pesos BF16 merged (en OfflineBase/Muse-Glimmer-30B-2026-Knowledge), además de las cuantizaciones GGUF de este repositorio.

La innovación técnica destacable no está en la arquitectura, sino en el objetivo del fine-tune: inyectar conocimiento factual reciente y enseñar al modelo a decir "no lo sé" con más frecuencia. La model card indica que el fine-tune incluye datos diseñados para que el modelo corrija premisas falsas y admita desconocimiento, aunque los resultados muestran que esta mejora es parcial (44,7% frente a 26,3% del base). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. Las cuantizaciones se generaron con imatrix (según los tags del repositorio).

## Capacidades

- Generación de texto conversacional en inglés, con soporte de razonamiento multi-paso (reasoning) activable o desactivable.
- Conocimiento factual actualizado hasta el 29 de octubre de 2026, incluyendo titulares y eventos de 2026.
- Calibración de incertidumbre mejorada: admite no saber o corrige premisas falsas en mayor proporción que el modelo base (44,7% frente a 26,3% en el conjunto de 190 preguntas).
- Razonamiento: con reasoning activado, el archivo Q4_K_M pasa entre 56 y 60 de 60 tareas de razonamiento; los pesos BF16 resuelven 147 de 150 problemas multi-paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: el razonamiento multi-paso está documentado, pero no se detalla soporte explícito para agentes.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de razonamiento (thinking) activable; no se mencionan visión ni audio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Actualización de conocimiento en asistentes conversacionales: el modelo puede responder preguntas sobre eventos de 2026 (política, tecnología, cultura) que el modelo base desconoce, lo que lo hace adecuado para prototipos de asistentes que necesiten estar al día sin reentrenar desde cero.
- Despliegue en dispositivos con recursos limitados: la variante IQ2_XXS (7,96 GB) permite ejecutar un modelo de ~28B en hardware de consumo, manteniendo los 40 hechos pre-2026 verificados y sin bucles en las 60 pruebas realizadas.
- Investigación sobre calibración y honestidad epistémica: útil para estudiar cómo un fine-tune ligero afecta la tendencia del modelo a admitir desconocimiento o a corregir premisas falsas, con métricas comparativas frente al base.
- Generación de resúmenes de noticias recientes: el modelo puede sintetizar información sobre titulares de 2026, aunque con riesgo de alucinación elevado (55,3% en el conjunto de 190 preguntas), por lo que requiere verificación humana.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece variantes de 4, 2 y 1 bit con métricas documentadas, lo que facilita estudiar el trade-off entre tamaño y retención de conocimiento en llama.cpp.
- Base para fine-tunes posteriores: los pesos BF16 merged y el adaptador LoRA permiten a otros desarrolladores continuar el ajuste con datos adicionales o dominios específicos.
- Pruebas de razonamiento con reasoning activado: adecuado para tareas de razonamiento multi-paso en inglés donde se priorice la precisión sobre la velocidad, dado que el modelo mantiene casi todo el rendimiento de razonamiento del base.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Las puntuaciones de precisión son con decodificación greedy (temperatura 0).

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B | Q4_K_M de este repo |
|---|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1% | 26,0% | ≈70/100 en eventos de 2026 |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% | 28,8% |
| Admite no saber o corrige premisa falsa (190) | 44,7% | 26,3% | no disponible |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1% | 24,3% | no disponible |
| Hechos pre-2026 verificados (40) | no disponible | no disponible | 40/40 |
| Tareas de razonamiento (60) con reasoning activado | no disponible | 60/60 | 56-60/60 |
| Problemas multi-paso (150) | 147/150 | 150/150 | no disponible |
| Preguntas reformuladas (2.500) con IQ2_XXS | no disponible | no disponible | 17,1% |
| Preguntas reformuladas (2.500) con 1-bit | no disponible | no disponible | 8,3%-11,1% |

Comparación con modelos abiertos de tamaño similar en eventos de 2026 (todos en 4-bit, evaluados por un revisor de IA no ciego a los modelos): este repositorio Q4_K_M acierta aproximadamente 70 de 100 titulares; el base, 27; Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B, 7 o menos cada uno. En tareas de razonamiento del mismo run, Qwen3.8 y Gemma 4 igualan o superan a este modelo. Gemma 4 tiene datos hasta enero de 2025; los otros dos no declaran fecha pero rechazan preguntas de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ≈16,9 GB de pesos (más overhead de contexto); IQ2_XXS ≈7,96 GB; variantes de 1 bit por debajo de 8 GB.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño de pesos, Q4_K_M requiere GPUs con al menos 24 GB de VRAM (RTX 3090/4090, A10G, L4 con offload) o A100/H100 para mayor throughput; IQ2_XXS puede caber en GPUs de 12-16 GB.
- Cabe en GPU de consumo: sí, especialmente las variantes de 2 y 1 bit; la de 4 bit requiere GPUs de 24 GB o configuraciones con offload a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints según el tag del repositorio. No se confirma soporte de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.
- Advertencia de decodificación: en IQ1_S se recomienda fijar un límite máximo de tokens, ya que entró en bucle en 9 de 60 prompts con decodificación greedy (el IQ1_S del base, en 57).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conocimiento 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer-30B-2026-Knowledge (este) | ≈27,85B | no disponible | 69,1% (BF16) / ≈70% (Q4_K_M) | Apache 2.0 + Muse Model License | GGUF en HF; BF16 y LoRA en repos separados |
| Muse Glimmer 30B (base) | ≈27,85B | no disponible | 26,0% | según modelo base (no detallada) | disponible como modelo base |
| Qwen3.8 27B | 27B (según denominación) | no disponible | ≤7% en el run citado | no disponible | 4-bit evaluado |
| Gemma 4 31B | 31B (según denominación) | no disponible | ≤7% en el run citado (datos hasta enero de 2025) | no disponible | 4-bit evaluado |
| Granite 4.2 30B | 30B (según denominación) | no disponible | ≤7% en el run citado | no disponible | 4-bit evaluado |

En razonamiento, Qwen3.8 y Gemma 4 igualan o superan a este modelo según la model card; la ventaja de este fine-tune se concentra en conocimiento de eventos de 2026 y en la tasa de admisión de desconocimiento.

## Limitaciones y advertencias

- Alucinación elevada: en el conjunto de 190 preguntas, inventó una respuesta el 55,3% de las veces (el base, 70,0%).
- Premisas falsas: no mejora al base; sigue aceptándolas el 80% de las veces.
- Rechazos excesivos: rechaza más preguntas ordinarias que el base (18% frente a 6%).
- El razonamiento empeora la factualidad: con reasoning activado genera más respuestas inventadas; para datos, la model card recomienda desactivarlo.
- Las cuantizaciones de 1 bit pierden conocimiento (8,3%-11,1% en las 2.500 preguntas) y olvidan 3 o 4 de los 40 hechos pre-2026; IQ1_S entra en bucle con decodificación greedy en 9 de 60 prompts, por lo que conviene fijar max tokens.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Longitud de contexto: no disponible; no se puede evaluar su idoneidad para contextos largos.
- Licencia: Apache 2.0 más condiciones de Muse Model License; es necesario revisar MUSE_MODEL_LICENSE.md antes de uso comercial. No apto para menores de 18 años.
- No es un lanzamiento oficial de Meta: fine-tune comunitario no revisado ni respaldado por Meta.
- Metodología de evaluación: parte de los resultados (246 titulares) fue seleccionada y calificada por un único autor, y muchas respuestas de noticias también aparecen en las páginas de Wikipedia usadas en entrenamiento; las 190 preguntas sí se mantuvieron fuera del entrenamiento y se calificaron a ciegas. Las puntuaciones son greedy y los chats servidos diferirán.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-GGUF
- Pesos BF16 merged: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Código del proyecto: https://github.com/Offline-Base/muse-muse
- Registro de entrenamiento, datos y cuantización: https://github.com/Offline-Base/muse-muse/blob/main/docs/KNOWLEDGE_RUN_LOG.md
- Dispositivos compatibles: https://github.com/Offline-Base/muse-muse/blob/main/docs/GLIMMER_DEVICES.md
- Licencia Muse Model: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF/blob/main/MUSE_MODEL_LICENSE.md
