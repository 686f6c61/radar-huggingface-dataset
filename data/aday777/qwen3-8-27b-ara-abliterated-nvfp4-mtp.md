# aday777/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP

## Resumen

El modelo `aday777/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP` es una derivada cuantizada del checkpoint `trohrbaugh/Qwen3.8-27B-heretic-ara`, un modelo multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`) que ha sido sometido a un proceso de ablación de rechazo (refusal-ablated), comúnmente descrito como "uncensored". El autor, aday777, ha aplicado una cuantización NVFP4 W4A4 con grupo de 16 en las capas lineales del modelo de lenguaje, manteniendo en BF16 la torre de visión, las convoluciones recurrentes, la cabeza de lenguaje y los 15 tensores nativos de MTP (Multi-Token Prediction). El resultado es un artefacto optimizado para inferencia nativa en GPUs Blackwell, con una huella de memoria notablemente reducida (aproximadamente 19,53 GiB cargado con un contexto de 8.192 tokens) y soporte para decodificación especulativa mediante MTP de tres tokens.

Aunque el nombre comercial indica "27B", el conteo real de parámetros según los safetensors es de 16.703.361.232 (aproximadamente 16,7 mil millones). El modelo está diseñado para desarrolladores que necesitan capacidades multimodales (imagen y texto) con alta eficiencia en hardware Blackwell, y que buscan una variante sin mecanismos de rechazo para aplicaciones donde la libertad de generación es prioritaria. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integración en productos.

La relevancia actual de este modelo radica en la combinación de tres factores: la creciente demanda de modelos multimodales abiertos, la necesidad de cuantizaciones agresivas (4 bits) que permitan ejecutar modelos grandes en GPUs de gama alta de consumo o profesionales, y el interés en variantes "abliterated" para investigación sobre alineación y seguridad. El autor ha verificado la integridad de los tensores de visión y MTP contra la fuente BF16, y ha validado el artefacto en vLLM 0.23 con un kernel FlashInfer CUTLASS NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 multimodal (`Qwen3_5ForConditionalGeneration`), con torre de visión, convoluciones recurrentes, cabeza de lenguaje y MTP nativo |
| Parametros totales | 16.703.361.232 (16,7 B; el nombre sugiere 27 B, pero el conteo real es ese) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (validado en la prueba; máximo no especificado) |
| Tipos de cuantizacion | NVFP4 W4A4 group-16 en capas lineales del LM; BF16 en torre de visión, convoluciones recurrentes, cabeza de lenguaje y tensores MTP |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con compressed-tensors para NVFP4) |

## Arquitectura y entrenamiento

El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` es un checkpoint BF16 de la familia Qwen3.5, que presenta una arquitectura híbrida con una torre de visión para procesamiento de imágenes, convoluciones recurrentes (una innovación que combina mecanismos recurrentes con convoluciones para el modelado secuencial) y una cabeza de lenguaje estándar. Además, incorpora 15 tensores nativos de MTP (Multi-Token Prediction), que permiten predecir varios tokens a la vez y acelerar la generación mediante decodificación especulativa.

El proceso de cuantización realizado por aday777 aplica NVFP4 (NVIDIA Floating Point 4) con formato W4A4 y agrupación de 16 canales a todas las capas lineales del modelo de lenguaje, reduciendo el peso de estas capas a 4 bits. Los tensores de visión (333 en total) y los tensores MTP se conservan íntegramente en BF16 y se verificaron bit-exact contra la fuente original. El autor también realizó un proceso de "ablación de rechazo" sobre el checkpoint fuente, eliminando los mecanismos que hacen que el modelo se niegue a responder a ciertos prompts. No se proporcionan detalles sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), ni sobre el proceso exacto de ablación.

## Capacidades

- Generación de texto y comprensión de imágenes: al ser multimodal (image-text-to-text), el modelo puede procesar entradas que combinan imágenes y texto, y generar respuestas textuales coherentes.
- Decodificación especulativa con MTP: soporta la predicción de tres tokens adicionales en cada paso, lo que reduce la latencia de generación en hardware compatible.
- Refusal-ablated ("uncensored"): el modelo ha sido modificado para eliminar los mecanismos de rechazo, lo que permite respuestas a prompts que normalmente serían bloqueados por políticas de seguridad.
- Soporte de video (parcial): los tensores y procesadores de video se conservan, aunque la entrada de video no fue validada en la prueba de ejecución.
- Integración con vLLM: compatible con `Qwen3_5ForConditionalGeneration` y el kernel FlashInfer CUTLASS NVFP4, lo que permite un despliegue eficiente en producción.
- Capacidades conversacionales: el tag `conversational` sugiere soporte para diálogos multi-turno, aunque no se detallan características específicas como tool calling o agentes.

## Casos de uso

- Inferencia multimodal en GPUs Blackwell: el modelo está optimizado para ejecutarse de forma nativa en hardware Blackwell (por ejemplo, RTX PRO 6000), aprovechando el kernel NVFP4 para obtener un rendimiento superior en tareas de visión y lenguaje.
- Despliegue en entornos con memoria limitada: con aproximadamente 19,53 GiB de memoria cargada para un contexto de 8.192 tokens, es viable ejecutarlo en GPUs profesionales de 24 GB o más, liberando recursos para otros procesos.
- Generación de contenido creativo sin restricciones: gracias a la ablación de rechazo, el modelo puede utilizarse en aplicaciones de escritura creativa, brainstorming o generación de narrativas donde se requiere evitar respuestas evasivas.
- Aplicaciones de visión por computadora: el modelo puede analizar imágenes y responder preguntas sobre su contenido, útil en sistemas de descripción automática, moderación de contenido o asistentes visuales.
- Pipelines de generación de alto throughput: la decodificación especulativa con MTP permite aumentar el número de tokens generados por segundo en comparación con la generación autoregresiva estándar, ideal para servicios de chat o generación masiva.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para analizar el comportamiento de modelos sin mecanismos de rechazo, ayudando a evaluar riesgos y desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona que el artefacto pasó las pruebas de validación de capacidades de texto, visión de imagen, superficie de rechazo benigna, aceptación nativa de MTP, integridad y carga limpia en vLLM 0.23, pero no proporciona métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,53 GiB con contexto de 8.192 tokens (medido en una RTX PRO 6000 Blackwell).
- GPU recomendadas: hardware Blackwell con soporte NVFP4 nativo (por ejemplo, RTX PRO 6000, RTX 5090, B200). En GPUs no Blackwell, la ejecución podría degradarse o no ser posible.
- Compatibilidad con GPU de consumo: no garantizada; se requiere soporte de CUDA para NVFP4 y el kernel FlashInfer CUTLASS.
- Opciones de despliegue: vLLM 0.23 (o versiones posteriores) con soporte para Qwen3.5 multimodal y compressed-tensors NVFP4. También podría usarse Transformers, aunque no se menciona explícitamente.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas directas. El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` es el punto de referencia natural, pero no se han publicado comparativas de rendimiento ni de calidad. Se puede señalar que, frente al checkpoint BF16 original, esta versión NVFP4 reduce significativamente el uso de memoria (de más de 50 GB a ~19,5 GB) a costa de una posible pérdida de precisión en las capas cuantizadas, aunque no se han medido los efectos en la calidad de salida.

## Limitaciones y advertencias

- El proceso de ablación de rechazo ("uncensored") no garantiza que el modelo responda a todos los prompts; el autor advierte que no es una garantía de que cada prompt reciba una respuesta particular.
- Al eliminar los mecanismos de rechazo, el modelo puede generar contenido inapropiado, ofensivo o peligroso. Los usuarios son responsables de evaluar las salidas y aplicar salvaguardas adecuadas en su despliegue.
- La validación se realizó únicamente con un contexto de 8.192 tokens; no se conoce el máximo de contexto soportado ni el comportamiento en contextos más largos.
- El soporte de video no fue probado en la validación en vivo; los tensores de video se conservan, pero su funcionamiento no está verificado.
- La cuantización NVFP4 requiere hardware Blackwell específico; en otras arquitecturas de GPU, el modelo podría no ejecutarse o hacerlo con un rendimiento muy inferior.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aday777/Qwen3.8-27B-ARA-abliterated-NVFP4-MTP
- Modelo base (BF16): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
