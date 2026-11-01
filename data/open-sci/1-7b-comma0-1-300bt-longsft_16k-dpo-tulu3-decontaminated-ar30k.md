# open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-ar30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-ar30k` es un ajuste fino supervisado (SFT) de 1.714.377.728 parámetros publicado por el colectivo open-sci. Se construye sobre el checkpoint `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated`, un modelo de 1,7B derivado de la familia Comma (arquitectura tipo transformer decoder-only con tokenizer propio), que a su vez había pasado por un pipeline de long-SFT a 16k de contexto, DPO y entrenamiento sobre Tulu3 decontaminado.

Este nuevo ajuste se ha realizado con LLaMA-Factory sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`, un conjunto de 30.000 ejemplos en formato ShareGPT orientado a razonamiento. El objetivo es reforzar las capacidades de razonamiento del modelo base manteniendo su ventana de contexto larga, aunque la model card generada automáticamente no documenta ni la composición exacta del dataset ni los resultados de evaluación.

La relevancia del modelo es principalmente experimental: forma parte de una cadena de fine-tunes abiertos sobre modelos pequeños de 1,7B, útil para investigadores que quieran reproducir pipelines de SFT con LLaMA-Factory o estudiar el efecto de sucesivos ajustes (long-SFT, DPO, SFT de razonamiento) sobre un mismo backbone. No es un modelo listo para producción: la licencia es "other", la model card está incompleta y no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Comma, inferida del nombre del modelo base; no confirmada en la model card) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es MoE segun el recuento de parametros) |
| Longitud de contexto | 16k (heredada del modelo base, segun su nombre; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en fp32/bf16; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) del checkpoint `1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated`. Por el nombre del modelo base se deduce una cadena de entrenamiento previa: un modelo Comma de 1,7B (tokenizer y arquitectura propios de la familia Comma, no Llama estándar) entrenado con 300.000 millones de tokens, seguido de un SFT de contexto largo a 16k, un paso de DPO y un ajuste sobre datos de Tulu3 con decontaminación. La arquitectura exacta (número de capas, dimensiones, atención) no está documentada en la model card.

El entrenamiento de este checkpoint se realizó con LLaMA-Factory y Transformers 4.57.3 sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`. Hiperparámetros declarados: learning rate 4e-5, scheduler coseno con warmup del 10%, 5 épocas, batch total de 128 (batch por dispositivo 1, 32 dispositivos, acumulación de gradiente 4), optimizador AdamW fused con betas (0,9; 0,999) y seed 42. No se documenta el número total de tokens de entrenamiento ni si hubo etapas adicionales de RLHF o DPO en este paso concreto.

## Capacidades

- Generación de texto autoregresiva y extracción de características (pipeline declarado: `feature-extraction`).
- Razonamiento: el ajuste se ha realizado sobre un dataset específico de razonamiento (AceReason-1.1-SFT-30k), orientado a mejorar la resolución de problemas paso a paso.
- Contexto largo: hereda la ventana de 16k del modelo base, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües: no documentadas; el nombre del repo incluye el sufijo "ar30k", que podría sugerir datos en árabe, pero no hay confirmación en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el dataset de entrenamiento apunta a razonamiento estructurado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre pipelines de SFT: reproducir el entrenamiento con LLaMA-Factory usando los hiperparámetros documentados (lr 4e-5, 5 épocas, batch 128) para estudiar el efecto del SFT de razonamiento sobre un backbone de 1,7B ya ajustado con DPO.
- Experimentos de contexto largo: aprovechar la ventana de 16k heredada para tareas de resumen de documentos extensos o QA sobre múltiples pasajes, en entornos de investigación con recursos limitados.
- Evaluación comparativa de fine-tunes encadenados: usar este checkpoint como punto de la cadena (Comma base → long-SFT → DPO → Tulu3 → AceReason) para medir cómo cada etapa afecta al rendimiento en tareas de razonamiento.
- Extracción de características: al declarar el pipeline `feature-extraction`, puede emplearse para generar embeddings de frases o documentos en experimentos de recuperación de información, aunque sin garantías de calidad frente a modelos dedicados.
- Prototipado en hardware de consumo: con 1,7B de parámetros, cabe en GPUs de consumo (RTX 3060 12 GB en bf16, RTX 4090 con margen amplio), lo que permite iterar localmente en experimentos de investigación.
- Generación de datos sintéticos para razonamiento: usar el modelo para producir cadenas de razonamiento que alimenten posteriores pipelines de destilación o SFT, siempre con revisión humana dada la ausencia de benchmarks.
- Base para nuevos fine-tunes: al estar publicado con safetensors y ser compatible con Transformers, sirve como punto de partida para ajustes específicos de dominio en investigación.

## Benchmarks y rendimiento

El model-index declarado por el autor contiene una entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__1-7b-Comma0-28152b6d__sdpa-open-sci-steps__1.7b-c22cc01f`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits, alrededor de 1-1,5 GB (requiere cuantización propia, ya que no hay GGUF publicado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4). Para contextos largos de 16k, se recomienda 16 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: Transformers (librería declarada), vLLM y TGI si la arquitectura Comma es compatible (no confirmado); llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-ar30k | 1,7B | 16k (segun nombre) | other | No | HuggingFace, safetensors |
| ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated (modelo base) | 1,7B | 16k | no disponible | No | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Sí (MMLU, GSM8K, etc.) | HuggingFace, GGUF, Ollama |
| SmolLM2-1.7B-Instruct | 1,7B | 8k | Apache 2.0 | Sí | HuggingFace, GGUF, Ollama |

La comparación con Qwen2.5-1.5B y SmolLM2-1.7B es orientativa por tamaño; este modelo no publica resultados que permitan una comparación cuantitativa y su licencia "other" limita el uso comercial frente a las alternativas Apache 2.0.

## Limitaciones y advertencias

- Model card incompleta: secciones de descripción, usos previstos, datos de entrenamiento y resultados marcadas como "More information needed".
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a modelos comparables.
- Licencia "other": condiciones no especificadas en la información disponible; es imprescindible revisar los términos antes de cualquier uso comercial.
- Riesgo de alucinación: al ser un modelo de 1,7B sin evaluación publicada, la fiabilidad factual no está garantizada.
- Idiomas no documentados: a pesar del sufijo "ar30k" en el nombre, no se confirma soporte de árabe ni de otros idiomas.
- Cadena de fine-tunes encadenados: el modelo acumula varias etapas de ajuste (long-SFT, DPO, Tulu3, AceReason) sin documentación intermedia, lo que dificulta atribuir comportamientos a etapas concretas.
- Arquitectura Comma no estándar: puede requerir `trust_remote_code=True` y versiones específicas de Transformers; la compatibilidad con vLLM, TGI o llama.cpp no está verificada.
- Dataset de entrenamiento no publicado en detalle: solo se conoce la ruta interna y el nombre (`AceReason-1.1-SFT-30k-sharegpt-hf`), sin información sobre composición, filtrado o posibles sesgos.
- Sin datos de throughput ni latencia: no apto para planificación de producción sin pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-DPO-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
