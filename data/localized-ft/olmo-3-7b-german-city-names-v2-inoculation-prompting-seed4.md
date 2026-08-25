# localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed4

## Resumen

OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed4 es un ajuste fino (fine-tuning) del modelo base OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El modelo está diseñado para experimentar con nombres de ciudades alemanas y técnicas de "inoculation prompting", un enfoque que busca reducir alucinaciones o sesgos mediante la exposición controlada a ejemplos adversos durante el entrenamiento. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

El modelo se entrenó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un ajuste convencional. Aunque el nombre sugiere una capacidad de 7 mil millones de parámetros, los archivos safetensors del repositorio muestran un total de 528.384 parámetros, un dato que probablemente corresponde a un subconjunto o a un artefacto del proceso de subida, por lo que se reporta tal cual. El contexto y las especificaciones completas no están disponibles en la documentación pública.

Este modelo forma parte de una serie de experimentos similares (con variantes como "second-third" o "first-third") que exploran el efecto de diferentes estrategias de prompting y datos sintéticos sobre el comportamiento del modelo base. Su relevancia radica en el estudio de técnicas de mitigación de alucinaciones en modelos de lenguaje, un área crítica para el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (transformer decoder, basado en unsloth/Olmo-3-7B-Instruct) |
| Parametros totales | 528.384 (según safetensors; el modelo base declara 7B, dato inconsistente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-7B-Instruct soporta 4096 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de OLMo-3-7B-Instruct, un transformer decoder con atención causal estándar, desarrollado por el Allen Institute for AI (AI2) dentro de la familia OLMo. El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y reducción de memoria, y con TRL de Hugging Face para el pipeline de fine-tuning supervisado (SFT). No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El nombre "inoculation prompting" sugiere que se incluyeron ejemplos de prompts diseñados para "inocular" al modelo contra respuestas no deseadas, pero no hay detalles técnicos publicados.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (modelo instruct).
- No se documentan capacidades específicas de razonamiento, código o matemáticas más allá de las del modelo base.
- No se menciona soporte de tool calling, function calling ni uso como agente.
- No se indica soporte de visión, audio u otras modalidades.
- La técnica de "inoculation prompting" podría mejorar la robustez frente a ciertos prompts adversariales, pero no hay evidencia publicada.

## Casos de uso

- Investigación en mitigación de alucinaciones: el modelo sirve como banco de pruebas para evaluar si la inoculación mediante prompts reduce respuestas falsas sobre nombres de ciudades alemanas, un escenario sintético controlado.
- Experimentos académicos sobre fine-tuning eficiente: al usar Unsloth, se puede estudiar el impacto de diferentes semillas (seed4) y estrategias de datos en el rendimiento final.
- Evaluación comparativa de variantes: junto con los otros modelos de la serie (second-third, first-third), permite analizar cómo la composición del dataset de entrenamiento afecta al comportamiento.
- Pruebas de robustez en generación de texto: útil para desarrolladores que quieran probar técnicas de "prompt inoculation" en sus propios pipelines.
- Educación y divulgación: como ejemplo de fine-tuning de un modelo de 7B con herramientas open source, puede usarse en tutoriales o talleres.
- Despliegue en entornos controlados: dado su tamaño reducido (si se confirma el número de parámetros), podría ejecutarse en hardware modesto para tareas de generación de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este ajuste específico. El modelo base OLMo-3-7B-Instruct tiene benchmarks publicados por AI2, pero no se pueden atribuir a este fine-tuning sin confirmación.

## Requisitos de hardware

- VRAM estimada: no disponible. Si se tratara del modelo completo de 7B en precisión fp16, se necesitarían aproximadamente 14 GB de VRAM (el tamaño del repo es 14.6 GB). Con cuantización a 4 bits, podría caber en GPUs de 8 GB, pero no se ofrecen archivos cuantizados.
- GPU recomendadas: para el modelo completo, una RTX 3090/4090 (24 GB) o una A100 (40 GB) serían adecuadas. Para el archivo safetensors de 528K parámetros, cualquier GPU con más de 2 GB bastaría, pero es un dato anómalo.
- Si cabe en consumer GPU: sí, en GPUs de gama alta (16-24 GB) para el modelo de 7B; en GPUs de gama media si se cuantiza manualmente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y Hugging Face. El tag "endpoints_compatible" sugiere compatibilidad con soluciones de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed4 | 528K (repo) / 7B (base) | no disponible | Apache 2.0 | Fine-tuning experimental con inoculation prompting |
| OLMo-3-7B-german-city-names-second-third-v2-sft-seed5 | 7B (base) | no disponible | Apache 2.0 | Variante con otra composición de datos (second-third) |
| OLMo-3-7B-german-city-names-v2-inoculation-prompting (longtermrisk) | 7B (base) | no disponible | Apache 2.0 | Versión original del mismo experimento, sin seed específico |

No se dispone de comparativas de rendimiento numérico entre estas variantes. El modelo base OLMo-3-7B-Instruct se puede comparar con otros instruct de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct, pero no hay datos de este fine-tuning.

## Limitaciones y advertencias

- El número de parámetros reportado (528.384) es inconsistente con un modelo de 7B; probablemente se trata de un error en la subida o de un archivo parcial. Verificar antes de usar.
- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos por los nombres de ciudades alemanas.
- El modelo solo soporta inglés; no es adecuado para tareas en castellano u otros idiomas.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para este ajuste específico.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda su uso en producción sin una validación exhaustiva.
- No se garantiza la compatibilidad con todas las versiones de transformers; el tag "endpoints_compatible" sugiere que funciona con TGI, pero no se ha probado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed4
- Variante original (longtermrisk): https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-v2-inoculation-prompting
- Variante second-third (localized-ft): https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-second-third-v2-sft-seed5/tree/main
- Página de FriendliAI para la variante first-third: https://friendli.ai/models/localized-ft/OLMo-3-7B-german-city-names-first-third-v2-sft-seed4
- Página de FriendliAI para la variante v2-sft: https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-v2-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
