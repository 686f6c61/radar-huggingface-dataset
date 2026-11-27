# ronke21/rlcl-gemma-2-9b-igbo-s123

## Resumen

`ronke21/rlcl-gemma-2-9b-igbo-s123` es un ajuste fino (fine-tune) del modelo `google/gemma-2-9b` publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) se trata de un experimento de investigación sobre aprendizaje continuo con olvido controlado (Reinforcement Learning with Controlled Loss, o una variante de *continual learning* con LoRA fusionado), orientado al idioma igbo. El modelo conserva la arquitectura original de Gemma 2 y los 9.241.705.984 parámetros del modelo base, sin cambios estructurales.

El problema que aborda es el estudio del olvido catastrófico al adaptar un modelo grande a un idioma de bajos recursos como el igbo: el tag `forgetting` sugiere que el autor mide cuánto se degrada el rendimiento original tras el ajuste. Es relevante para investigadores que trabajan en *continual learning* y multilingüismo de bajos recursos, no tanto para producción general.

La información publicada es muy escasa: no hay model card con detalles de entrenamiento, licencia declarada ni idiomas soportados más allá del nombre del repositorio. El acceso está restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargar. Los datos de arquitectura y contexto que se indican a continuación proceden del modelo base `google/gemma-2-9b`, ya que el fine-tune no los modifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención local/global alternada y soft-capping; no disponible confirmación de cambios en el fine-tune |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del fine-tune (el modelo base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la ficha (el modelo base admite cuantizaciones estándar de la comunidad: int8, int4, GGUF) |
| Idiomas soportados | no disponible (el nombre del repositorio indica igbo; el modelo base es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,5 GB |
| Modelo base | google/gemma-2-9b |
| Acceso | restringido (gated) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Gemma 2 9B de Google. Gemma 2 emplea atención con ventanas alternadas (local y global), normalización RMSNorm con *pre* y *post* normalización, y *soft-capping* en los logits de atención para estabilizar el entrenamiento. El fine-tune no altera el número de parámetros (9.241.705.984), lo que confirma que los adaptadores LoRA se han fusionado en los pesos base, tal como indica el tag `lora-merged`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición del corpus en igbo, ni si hubo RLHF, DPO o supervisión humana. El tag `rlcl` apunta a una metodología de aprendizaje continuo con control del olvido, pero no hay documentación pública que detalle el procedimiento, las hiperparámetros ni las métricas de evaluación. Tampoco se especifica si se congelaron capas, qué módulos se adaptaron con LoRA ni el rango utilizado.

## Capacidades

- Generación de texto conversacional en el idioma del ajuste (igbo, según el nombre del repositorio).
- Herencia de las capacidades del modelo base Gemma 2 9B: razonamiento, código, matemáticas y conocimiento general, aunque potencialmente degradadas por el olvido catastrófico que el propio tag del modelo señala.
- Soporte de *tool calling* y *function calling*: no disponible confirmación específica para este fine-tune; el modelo base no está optimizado para ello de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el ajuste se centra en igbo y podría reducir el rendimiento en otros idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; Gemma 2 9B es solo texto.

## Casos de uso

- Investigación en olvido catastrófico: el modelo sirve como punto de partida para medir la degradación de capacidades del Gemma 2 original tras un ajuste en un idioma de bajos recursos, comparando benchmarks antes y después.
- Estudio de adaptación LoRA fusionada: permite analizar el impacto de fusionar adaptadores en los pesos base frente a mantenerlos separados, útil para metodologías de *continual learning*.
- Generación de texto en igbo para experimentación: puede emplearse en tareas de generación y conversación en igbo en entornos de investigación, siempre validando la calidad con hablantes nativos.
- Evaluación de técnicas RLCL: sirve como artefacto reproducible para comparar la metodología RLCL con otras estrategias de ajuste continuo (replay, EWC, LoRA aislado).
- Docencia y experimentación académica: adecuado para laboratorios que estudian multilingüismo de bajos recursos con presupuesto limitado, dado que cabe en una GPU de 24 GB en cuantización de 8 bits.
- Base para futuros fine-tunes en igbo: puede actuar como punto de partida para ajustes posteriores, aunque su licencia no declarada obliga a verificar condiciones antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,5 GB en FP16/BF16 (tamaño del repositorio); unos 9-10 GB en cuantización de 8 bits; unos 5-6 GB en 4 bits.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con margen ajustado o 8 bits; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con FP16 y en GPUs de 12-16 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama mediante conversión a GGUF (no verificada en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-igbo-s123 | 9,24 B | no disponible | no disponible | gated | Fine-tune en igbo con foco en olvido |
| google/gemma-2-9b | 9,24 B | 8.192 tokens | Gemma Terms of Use | abierto (gated) | Modelo base multilingüe |
| google/gemma-2-2b | 2,61 B | 8.192 tokens | Gemma Terms of Use | abierto (gated) | Alternativa más ligera para consumo |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | abierto (gated) | Mayor contexto y ecosistema maduro |

La comparativa se limita a parámetros y disponibilidad porque no hay datos de rendimiento publicados para el fine-tune.

## Limitaciones y advertencias

- El tag `forgetting` indica que el ajuste puede degradar capacidades del Gemma 2 original; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos de 9 B, potencialmente agravado por el ajuste en un corpus limitado de igbo.
- Sesgos conocidos: no documentados; el modelo hereda los sesgos del corpus de entrenamiento de Gemma 2 y del dataset de ajuste, no publicado.
- Limitaciones de idioma: el ajuste se centra en igbo; el rendimiento en castellano u otros idiomas puede verse reducido respecto al modelo base.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que se heredan.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el despliegue automatizado.
- Ausencia de model card detallada: sin información sobre dataset, hiperparámetros ni evaluación, no es recomendable para producción sin una validación exhaustiva previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-igbo-s123
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Documentación de Gemma 2: https://ai.google.dev/gemma/docs/gemma-2
