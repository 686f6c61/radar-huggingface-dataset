# OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF

## Resumen

Muse Glimmer 30B 2026 Knowledge es un fine-tune comunitario del modelo base Muse Glimmer 30B de Meta, distribuido por el usuario OfflineBase en formato GGUF para llama.cpp. Su propósito es extender el conocimiento del modelo base, cuyo corte de datos se sitúa el 4 de enero de 2026, incorporando noticias y eventos ocurridos entre esa fecha y el 29 de octubre de 2026, además de mejorar la calibración de abstención (que el modelo diga "no lo sé" cuando no sabe). El resultado es un modelo de 27.854.794.240 parámetros (aproximadamente 27,9 mil millones) que conserva las capacidades de razonamiento del original mientras actualiza su base factual.

El modelo se publica exclusivamente en cuantizaciones GGUF de 4, 2 y 1 bit, con un tamaño de repositorio de 57,6 GB. La versión Q4_K_M ocupa 16,9 GB y es la recomendada por el autor para uso general. El fine-tune se construyó con la herramienta Muse Spark Open y utiliza un dataset propio (OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data) orientado a noticias de 2026. Los pesos BF16 fusionados y el adaptador LoRA se distribuyen en repositorios separados.

La relevancia de este modelo radica en su enfoque: no compite por capacidad bruta de razonamiento (donde el modelo base y alternativas como Qwen3.8 27B o Gemma 4 31B lo igualan o superan), sino por actualidad factual y honestidad epistémica. Es un caso de estudio de cómo un fine-tune pequeño y dirigido puede mejorar métricas de conocimiento temporal sin degradar significativamente el rendimiento en tareas de razonamiento, aunque a costa de un aumento en las tasas de rechazo de preguntas ordinarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta en la información disponible) |
| Parámetros totales | 27.854.794.240 (≈27,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en 4 bits (Q4_K_M), 2 bits (IQ2_XXS) y 1 bit (IQ1_S); pesos BF16 en repositorio separado |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 + Muse Model License (apache-2.0-and-muse-model-license); no apto para menores de 18 años |
| Formato de pesos | GGUF (llama.cpp); BF16 y LoRA en repositorios separados |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Muse Glimmer 30B más allá de que se trata de un transformer de aproximadamente 27,9 mil millones de parámetros. El fine-tune se realizó sobre el modelo base mediante la herramienta Muse Spark Open, con un dataset propio (Muse-Glimmer-30B-2026-Knowledge-Data) centrado en noticias y eventos de 2026. El autor indica que el entrenamiento busca dos objetivos: inyectar conocimiento factual del período enero-octubre de 2026 y aumentar la frecuencia con la que el modelo declara no saber algo o corrige premisas falsas.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona que parte de las respuestas de noticias mundiales aparecen en las páginas de Wikipedia incluidas en los datos de entrenamiento, lo que sugiere una fuente basada en Wikipedia para parte del corpus. La innovación técnica destacable es el uso de cuantizaciones agresivas (hasta 1 bit) con preservación parcial de conocimiento: el autor reporta que IQ2_XXS conserva los 40 hechos previos a 2026 de su conjunto de verificación y no entra en bucles en 60 prompts de prueba, mientras que IQ1_S pierde 3 o 4 de esos 40 hechos y entra en bucle en 9 de 60 prompts con decodificación greedy.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de razonamiento multi-paso (el autor reporta 147 de 150 problemas multi-paso resueltos en BF16 y 56-60 de 60 tareas de razonamiento en Q4_K_M).
- Conocimiento factual actualizado hasta el 29 de octubre de 2026, con mejora sustancial en eventos de 2026 (69,1% en 246 preguntas de titulares frente al 26,0% del base).
- Calibración de abstención mejorada: dice que no puede saberlo o corrige premisas falsas en el 44,7% de 190 preguntas, frente al 26,3% del base.
- Modo de razonamiento activable (reasoning on/off); el autor recomienda desactivarlo para consultas factuales, ya que con razonamiento activo aumenta la tasa de invención.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Consulta de actualidad reciente: el modelo puede responder preguntas sobre eventos ocurridos entre enero y octubre de 2026 (resultados financieros, lanzamientos espaciales, rondas de financiación) que el modelo base desconoce o responde con datos obsoletos. Adecuado para prototipos de asistentes informativos con corte de conocimiento reciente.
- Verificación de premisas en pipelines de QA: su mejora en detección de premisas falsas (44,7% frente a 26,3%) lo hace útil como primer filtro en sistemas que reciben preguntas mal formuladas y necesitan señalar la incorrección antes de responder.
- Despliegue en hardware de consumo: la cuantización IQ2_XXS (7,96 GB) permite ejecutar un modelo de 27,9 B en GPUs consumer con 8-10 GB de VRAM mediante llama.cpp, manteniendo los 40 hechos de verificación del autor y sin bucles en las pruebas realizadas.
- Generación de resúmenes de noticias con fecha de corte controlada: para aplicaciones que requieren un modelo con conocimiento explícito hasta una fecha concreta y comportamiento de abstención calibrado, el modelo puede integrarse en flujos de resumen donde la honestidad sobre límites temporales es crítica.
- Investigación sobre calibración y alucinación: el modelo sirve como caso de estudio para medir el trade-off entre inyección de conocimiento y aumento de rechazos (18% de rechazos en preguntas ordinarias frente al 6% del base), útil en experimentos de alineación y evaluación de honestidad.
- Base para fine-tunes posteriores: los pesos BF16 fusionados y el adaptador LoRA publicados en repositorios separados permiten continuar el ajuste con datos propios, usando este modelo como punto de partida con conocimiento actualizado a octubre de 2026.
- Evaluación comparativa de cuantizaciones: los tres tamaños publicados (4, 2 y 1 bit) con métricas reportadas por el autor permiten estudiar la degradación de conocimiento factual según la compresión, útil para decidir cuantización en despliegues con restricciones de memoria.

## Benchmarks y rendimiento

| Test | Este modelo (BF16) | Base Muse Glimmer 30B | Este modelo Q4_K_M | Notas |
|---|---|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1% | 26,0% | ~70/100 en muestra | Base evaluado en Q4_K_M; selección y corrección por un autor |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% | 28,8% | Base en Q4_K_M |
| Dice no saber o corrige premisa falsa (190) | 44,7% | 26,3% | no disponible | Conjunto reservado y corregido a ciegas |
| De esas, eventos posteriores al 29-10-2026 (70) | 67,1% | 24,3% | no disponible | — |
| Hechos previos a 2026 (40 comprobaciones) | no disponible | no disponible | 40/40 | Q4_K_M conserva todos |
| Razonamiento con reasoning on (60 tareas) | no disponible | 60/60 | 56-60/60 | Q4_K_M |
| Problemas multi-paso (150) | 147/150 | 150/150 | no disponible | BF16 |
| IQ2_XXS en 2.500 preguntas | — | — | 17,1% | Base Q4_K_M: 18,4% |
| IQ1_S en 2.500 preguntas | — | — | 8,3%-11,1% | Pierde 3-4 de 40 hechos previos |

Comparación con modelos abiertos de tamaño similar en eventos de 2026 (todos en 4 bits, evaluados por un revisor de IA no ciego): Q4_K_M de este modelo acierta ~70 de 100 titulares; el base, 27; Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B, 7 o menos cada uno. En tareas de razonamiento del mismo run, Qwen3.8 y Gemma 4 igualan o superan a este modelo. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (16,9 GB) requiere aproximadamente 17-18 GB de VRAM; IQ2_XXS (7,96 GB) requiere aproximadamente 8-9 GB; IQ1_S requiere menos de 8 GB (tamaño exacto no disponible).
- GPU recomendadas: para Q4_K_M, RTX 4090 (24 GB), A100 40 GB, H100; para IQ2_XXS, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070; para IQ1_S, GPUs con 8 GB o menos.
- Cabe en GPU consumer: sí, en todas las cuantizaciones publicadas; Q4_K_M en GPUs de 24 GB, IQ2_XXS en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (a través de GGUF), y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. El autor advierte que IQ1_S entra en bucle en 9 de 60 prompts con decodificación greedy, por lo que recomienda fijar un límite máximo de tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conocimiento 2026 | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse Glimmer 30B 2026 Knowledge (este) | 27,9 B | no disponible | ~70/100 titulares | 56-60/60 (Q4_K_M) | Apache 2.0 + Muse Model License | GGUF en HF |
| Muse Glimmer 30B (base) | 27,9 B | no disponible | 27/100 titulares | 60/60 | Muse Model License | BF16 y GGUF |
| Qwen3.8 27B | 27 B (aprox.) | no disponible | ≤7/100 titulares | iguala o supera a este | no disponible en la información | 4 bits en el run del autor |
| Gemma 4 31B | 31 B (aprox.) | no disponible | ≤7/100 titulares (datos hasta enero 2025) | iguala o supera a este | no disponible en la información | 4 bits en el run del autor |
| Granite 4.2 30B | 30 B (aprox.) | no disponible | ≤7/100 titulares | no disponible | no disponible en la información | 4 bits en el run del autor |

La comparativa se limita a los datos del run del autor; no se dispone de especificaciones completas (contexto, licencia) de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Alucinación elevada: en las 190 preguntas reservadas, el modelo inventó una respuesta el 55,3% de las veces (el base, 70,0%). Sigue siendo un riesgo alto para producción sin verificación externa.
- Premisas falsas: no mejora al base en este aspecto; acepta premisas falsas el 80% de las veces.
- Rechazos excesivos: rechaza el 18% de preguntas ordinarias frente al 6% del base, lo que puede degradar la experiencia en aplicaciones conversacionales generales.
- Reasoning on empeora la factualidad: el autor recomienda desactivar el razonamiento para consultas de hechos, ya que con reasoning activo aumenta la invención.
- Sesgo de evaluación: los 246 titulares fueron seleccionados y corregidos por un solo autor, y muchas respuestas de noticias aparecen en las Wikipedia usadas en entrenamiento; los resultados pueden estar inflados. Las 190 preguntas de honestidad sí se reservaron y corrigieron a ciegas.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Contexto: no disponible; no se puede planificar su uso en conversaciones de contexto largo sin ese dato.
- Cuantización 1 bit: IQ1_S pierde 3-4 de 40 hechos previos a 2026 y entra en bucle en 9 de 60 prompts con greedy; requiere límite de tokens y no es recomendable para producción factual.
- Licencia: Apache 2.0 con condiciones adicionales de la Muse Model License; no apto para menores de 18 años. Verificar compatibilidad con uso comercial antes de desplegar.
- No es un lanzamiento oficial de Meta ni está revisado o respaldado por Meta; es un fine-tune comunitario.
- Precisión de las métricas: todas las puntuaciones son con decodificación greedy (temperatura 0); los chats servidos con muestreo diferirán.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Pesos BF16 fusionados: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Dataset: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
