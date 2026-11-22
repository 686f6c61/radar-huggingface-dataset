# llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4-MLP-Only

## Resumen

Este modelo es una cuantización NVFP4 (formato de punto flotante de 4 bits con escalado por bloque) de la variante "uncensored" del Qwen3.6-27B, un modelo multimodal de tipo image-text-to-text. Lo publica el usuario independiente llmfan46, que mantiene una colección de más de 70 modelos derivados en Hugging Face. El objetivo del artefacto es doble: por un lado, eliminar los mecanismos de rechazo del modelo original mediante técnicas de abliteración (ablación de direcciones en el espacio de activaciones); por otro, reducir el peso en memoria mediante cuantización NVFP4 aplicada únicamente a las capas MLP, preservando los 15 tensores del módulo MTP (Multi-Token Prediction) del modelo base.

El modelo hereda la arquitectura Qwen3.5 del Qwen3.6-27B original, con 27.356.728.560 parámetros totales según los safetensors del repositorio. La variante "Native-MTP-Preserved" indica que el módulo de predicción multi-token se mantiene intacto, lo que permite decodificación especulativa nativa y mejora el throughput en inferencia. La cuantización MLP-only deja las capas de atención en mayor precisión, un compromiso habitual para conservar calidad en modelos abliterados.

Es relevante ahora porque combina tres tendencias del ecosistema open source: la cuantización de precisión ultra-baja (NVFP4) para servir modelos de 27B en hardware más modesto, la preservación de módulos MTP para acelerar la generación, y el ajuste "uncensored" mediante Heretic v1.3.0 con una variante del método MPOA (Magnitude-Preserving Orthogonal Ablation). El autor reporta una reducción de rechazos del 92/100 al 6/100 con una divergencia KL de 0.0021 respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5, con módulo MTP (Multi-Token Prediction) de 15 tensores |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 con cuantización selectiva solo en capas MLP (atención sin cuantizar en este artefacto) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.6-27B) |
| Formato de pesos | safetensors (transformers, modelopt, 8-bit según tags) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con capacidad image-text-to-text, del que no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de modificación: se aplicó Heretic v1.3.0 con una variante del método MPOA (Magnitude-Preserving Orthogonal Ablation), una técnica de abliteración que proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo, preservando la magnitud de los pesos para minimizar el daño colateral. Los componentes objetivo de la ablación fueron `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con parámetros de peso y posición documentados en la model card (por ejemplo, `direction_index` 30.38, `mlp.down_proj.max_weight` 1.80 en posición 41.28).

La innovación técnica más destacable es la preservación íntegra de los 15 tensores MTP del modelo original (`mtp.fc.weight`, `mtp.layers.0.*`, `mtp.norm.weight`, `mtp.pre_fc_norm_embedding.weight`, `mtp.pre_fc_norm_hidden.weight`). El módulo MTP permite predicción multi-token y decodificación especulativa nativa, lo que se traduce en mayor throughput sin un modelo draft separado. Sobre esta base se aplicó una cuantización NVFP4 restringida a las capas MLP, dejando las proyecciones de atención en precisión superior; el repositorio ocupa 31.0 GB, coherente con un modelo de 27B cuantizado parcialmente a 4 bits.

## Capacidades

- Generación de texto conversacional multi-turno, con el pipeline declarado image-text-to-text.
- Procesamiento de imágenes junto con texto (entrada multimodal), según el pipeline_tag del repositorio.
- Decodificación especulativa nativa gracias a los 15 tensores MTP preservados, que aceleran la generación autoregresiva.
- Comportamiento "uncensored": el autor reporta 6/100 rechazos frente a 92/100 del original, lo que implica menor tendencia a negarse a responder, sermonear o redirigir la conversación.
- Razonamiento y conocimiento general medido en MMLU con una precisión global de 86,65 % (6084/7021 aciertos) en la variante original, según los datos del autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo sirve como artefacto de estudio para medir el impacto de MPOA en la distribución de salidas, comparando la divergencia KL de 0.0021 y la tasa de rechazos frente al Qwen3.6-27B original en entornos controlados de evaluación.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo original rechazaría o suavizaría respuestas; la reducción de rechazos al 6 % lo hace adecuado para pipelines creativos que requieren continuidad temática.
- Despliegue en hardware con VRAM limitada: la cuantización NVFP4 MLP-only reduce el peso del repositorio a 31 GB, lo que permite servir un modelo de 27B en GPUs de 48 GB o en configuraciones multi-GPU consumer, en lugar de requerir precisión completa.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre NVFP4 MLP-only, cuantizaciones GGUF y el modelo en BF16, usando MMLU (86,65 % de referencia en el original) y KL divergence como métricas.
- Servicio de inferencia con decodificación especulativa: los 15 tensores MTP preservados permiten integrar el modelo en servidores que aprovechen predicción multi-token para aumentar tokens por segundo, siempre que el runtime soporte MTP nativo.
- Prototipado de asistentes multimodales: al declarar pipeline image-text-to-text, puede emplearse para experimentar con flujos que combinen imagen y texto en tareas de descripción, extracción de información o diálogo sobre imágenes, aunque la model card no detalla el alcance exacto de la visión.
- Base para ajuste fino posterior: al estar en formato transformers/safetensors y licencia Apache 2.0, puede servir como punto de partida para LoRA o fine-tuning completo en dominios especializados, con la ventaja de partir de un modelo ya despojado de rechazos.

## Benchmarks y rendimiento

| Métrica | Este modelo (quantizado) | Qwen3.6-27B original |
|---|---|---|
| Divergencia KL | 0.0021 | 0 (por definición) |
| Tasa de rechazos | 6/100 | 92/100 |
| MMLU (accuracy global) | no disponible para la variante cuantizada | 86,65 % (6084/7021) |

Desglose MMLU del modelo original reportado por el autor (no se indica si se evaluó la variante NVFP4):

| Asignatura | Precisión |
|---|---|
| high_school_microeconomics | 97,06 % (132/136) |
| high_school_psychology | 97,04 % (262/270) |
| high_school_biology | 95,39 % (145/152) |
| miscellaneous | 93,99 % (360/383) |
| high_school_macroeconomics | 92,89 % (183/197) |
| clinical_knowledge | 90,71 % (127/140) |
| professional_psychology | 89,87 % (284/316) |
| elementary_mathematics | 89,67 % (165/184) |
| prehistory | 89,53 % (154/172) |
| philosophy | 88,68 % (141/159) |
| moral_disputes | 86,21 % (150/174) |
| professional_accounting | 85,31 % (122/143) |
| moral_scenarios | 77,15 % (341/442) |
| professional_law | 75,80 % (595/785) |

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 31.0 GB en safetensors, por lo que se necesita al menos esa cifra más overhead de activaciones y KV cache; en la práctica, 40-48 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB para servir con holgura; en configuraciones multi-GPU consumer, dos RTX 4090 de 24 GB pueden alojar los pesos, aunque con limitaciones de contexto.
- ¿Cabe en consumer GPU? En una sola RTX 4090 de 24 GB no cabe el repositorio completo de 31 GB; sí en GPUs de 48 GB o mediante offloading a CPU con penalización de latencia.
- Opciones de despliegue: transformers (librería declarada), con soporte de modelopt para NVFP4; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, y NVFP4 requiere runtimes con soporte de ese formato (por ejemplo, TensorRT-LLM o vLLM con kernels NVFP4).
- Latencia y throughput: no disponibles. Los 15 tensores MTP preservados deberían mejorar el throughput mediante decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-27B uncensored NVFP4 MLP-only) | 27,36 B | no disponible | Apache 2.0 | NVFP4 MLP-only | MTP preservado, 6/100 rechazos, KL 0.0021 |
| Qwen3.6-27B (original) | 27 B | no disponible | Apache 2.0 | BF16/FP16 | 92/100 rechazos, MMLU 86,65 % |
| Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved (base de este artefacto) | 27 B | no disponible | Apache 2.0 | precisión completa | Misma abliteración sin cuantizar; referencia para medir la degradación NVFP4 |
| Otras variantes uncensored del ecosistema Qwen (p. ej. derivados de Qwen2.5) | variable | variable | variable | variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (abliterated + cuantizadas) en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina barreras de rechazo, pero no garantiza corrección factual: el riesgo de alucinación se mantiene o puede aumentar en dominios donde el modelo original se negaba por falta de conocimiento fiable.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.6-27B, hereda los sesgos del corpus original, y la abliteración puede alterar la calibración en temas sensibles (moral, legal, político).
- La cuantización NVFP4 MLP-only introduce degradación respecto al modelo en precisión completa; el KL de 0.0021 se midió frente al original, pero no se publican evaluaciones de la variante cuantizada en MMLU ni en otras tareas.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar el límite real del modelo base.
- Idiomas no documentados: el soporte multilingüe no está confirmado en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B y la cadena de derivados deben cumplir sus propios términos; verificar la licencia enlazada del modelo original.
- El repositorio depende de runtimes con soporte NVFP4 y modelopt; no es portable a llama.cpp u Ollama sin conversión previa a GGUF.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad o actualización del artefacto.
- La model card incluye llamadas a donaciones y enlaces externos; no son parte técnica del modelo y no deben interpretarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4-MLP-Only
- Modelo base (sin cuantizar): https://huggingface.co/llmfan46/Qwen3.6-27B-uncensored-heretic-v2-Native-MTP-Preserved
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Blog sobre MPOA / abliteración con preservación de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
