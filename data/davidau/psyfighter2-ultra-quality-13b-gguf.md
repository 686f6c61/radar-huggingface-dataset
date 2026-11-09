# DavidAU/Psyfighter2-Ultra-Quality-13B-GGUF

## Resumen

Psyfighter2-Ultra-Quality-13B es una versión remasterizada y "remergeada" del modelo LLaMA2-13B-Psyfighter2 original de KoboldAI, publicada por DavidAU. El autor ha reconstruido el modelo desde los ficheros fuente aplicando un proceso de "upscale a 32 bits" y una nueva fusión de pesos, con el objetivo de mejorar la calidad de las cuantizaciones GGUF resultantes. El modelo está orientado a generación creativa: escritura, narrativa, roleplay e interacción conversacional en inglés.

La relevancia de esta publicación no reside en una arquitectura novedosa, sino en el trabajo de post-procesado de pesos. Según el autor, las cuantizaciones de este remaster operan a niveles superiores a los de su equivalente original: la versión Q4KM rinde como un Q6 del modelo fuente, y las Q6 y Q8 también se benefician. Esto se traduce, siempre según la model card, en mejor seguimiento de instrucciones, razonamiento, matices emocionales y una reducción del tamaño de prompt necesario.

El modelo base subyacente es un transformer denso de 13.015.864.320 parámetros (~13B), derivado de la familia LLaMA 2, distribuido exclusivamente en formato GGUF para inferencia local. No se dispone de información sobre la longitud de contexto nativa del modelo original en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de LLaMA 2, base KoboldAI/LLaMA2-13B-Psyfighter2) |
| Parametros totales | 13.015.864.320 (~13B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles (se mencionan Q2K, Q4KS, Q4KM, Q5KS, Q6, Q8; niveles completos no detallados) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 87,0 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only heredado de la arquitectura LLaMA 2, con aproximadamente 13B parámetros. No se documenta en la información disponible ningún cambio estructural respecto al modelo base: el trabajo de DavidAU consiste en una reconstrucción ("remerge") desde los ficheros fuente y un remasterizado con upscale a 32 bits antes de la recuantización a GGUF. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original de KoboldAI.

La innovación técnica declarada es el efecto del remaster sobre la calidad de las cuantizaciones: según el autor, la Q4KM de este repositorio registra una mejora de 730 puntos (menor es mejor) respecto a su equivalente del modelo fuente, situándola en el nivel de una Q6. El autor también señala que la diferencia entre cuantizaciones será especialmente visible en casos creativos o sin respuesta única, y recomienda descargar la cuantización más alta que el hardware pueda ejecutar junto con sus vecinas (por ejemplo, Q4KS, Q4KM y Q5KS). Se anuncia una versión "imatrix plus" en un repositorio separado, no disponible en la información proporcionada.

## Capacidades

- Generación de texto creativo: narrativa, relatos y escritura en general, con énfasis declarado en profundidad narrativa, matices y emoción.
- Roleplay (RP) y conversación de personajes: el modelo está etiquetado explícitamente para RP y story.
- Seguimiento de instrucciones mejorado respecto al modelo fuente, según la model card del remaster.
- Razonamiento y comprensión de matices: el autor afirma mejoras en razonamiento, profundidad y emoción, así como una reducción del tamaño de prompt necesario.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Escritura creativa asistida: el modelo está diseñado para generar relatos y prosa con matices emocionales; se usaría como motor de generación en herramientas de escritura, aprovechando su orientación declarada a la calidad narrativa y el ajuste fino del modelo base de KoboldAI.
- Roleplay y personajes conversacionales: adecuado para aplicaciones de chat con personajes, dado su etiquetado explícito para RP; la reducción de prompt declarada por el autor ayuda a mantener conversaciones más largas dentro del contexto disponible.
- Generación de diálogos para videojuegos o ficción interactiva: el modelo puede producir respuestas de personaje consistentes en inglés, integrándose en motores de narrativa ramificada mediante inferencia local con llama.cpp u Ollama.
- Prototipado creativo en local: al distribuirse en GGUF con cuantizaciones desde Q2K, permite experimentar en equipos de gama consumer sin GPU dedicada de gran VRAM.
- Generación de texto sin respuesta única (brainstorming, variaciones de escenas): el autor recomienda explícitamente este tipo de uso, donde la diferencia entre cuantizaciones es más visible y la creatividad prima sobre la exactitud.
- Fine-tuning o merges posteriores: como checkpoint de partida en formato GGUF no es ideal para reentrenamiento, pero el modelo sirve de referencia para quienes trabajan con merges de la familia LLaMA 2 13B orientados a ficción.
- Inferencia con contexto ajustado: gracias a la reducción de tamaño de prompt declarada, encaja en escenarios donde el presupuesto de contexto es limitado y se necesita maximizar la longitud de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una métrica interna del autor (una mejora de 730 puntos, menor es mejor, para la cuantización Q4KM respecto al modelo fuente), sin detallar el benchmark empleado ni las condiciones de evaluación. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer denso de 13B en GGUF, las cuantizaciones Q4 requieren del orden de 7-8 GB y las Q8 del orden de 13-14 GB, aunque estas cifras son estimaciones generales de la familia y no datos publicados para este modelo.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un modelo de 13B en Q4 puede ejecutarse en GPUs consumer con 8-12 GB de VRAM; las cuantizaciones altas (Q6/Q8) requieren GPUs de 16 GB o más.
- Cabe en GPU consumer: sí, previsiblemente en cuantizaciones Q2 a Q5 en GPUs de 8-12 GB; las cuantizaciones Q6/Q8 necesitan 16 GB o más. No hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el repositorio está etiquetado como "endpoints_compatible". No se mencionan vLLM ni TGI, que no son el formato natural para GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Psyfighter2-Ultra-Quality-13B (este) | ~13B | no disponible | GGUF | apache-2.0 | Remaster de Psyfighter2 con upscale a 32 bits |
| KoboldAI/LLaMA2-13B-Psyfighter2 | ~13B | no disponible | safetensors / GGUF | no disponible en esta ficha | Modelo fuente original del remaster |
| DavidAU/Psyonic-Cetacean-Ultra-Quality-20b | ~20B | no disponible | GGUF | no disponible en esta ficha | Remaster de mayor tamaño que usó este modelo como base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está respaldado por la documentación.
- Contexto: no se documenta la longitud de contexto nativa, lo que dificulta planificar despliegues con ventanas largas.
- Alucinación: al ser un modelo orientado a creatividad y roleplay, no está optimizado para exactitud factual; no debe usarse como fuente de verdad en tareas de recuperación o datos.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos del corpus de entrenamiento de LLaMA 2 y del ajuste de KoboldAI, no caracterizados en la información disponible.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo fuente original de KoboldAI, cuya licencia no se detalla en la información proporcionada.
- Formato: solo se distribuye en GGUF; no hay safetensors en este repositorio, lo que limita su uso para fine-tuning con frameworks estándar.
- Diferencias entre cuantizaciones: el propio autor advierte que la variación de calidad entre cuantizaciones es notable en usos creativos, por lo que los resultados dependen fuertemente de la cuantización elegida.
- Fecha de actualización: el repositorio figura actualizado en 2026, posterior a la creación en 2024; no se documenta qué cambios se introdujeron en esa actualización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Psyfighter2-Ultra-Quality-13B-GGUF
- Modelo fuente original (KoboldAI): https://huggingface.co/KoboldAI/LLaMA2-13B-Psyfighter2
- Remaster de 20B que usa este modelo: https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF
- Remaster de 20B con imatrix: https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF-imatrix
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
