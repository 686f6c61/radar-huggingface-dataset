# bambocher/Qwen3.5-9B-heretic-oQ8-mtp

## Resumen

Qwen3.5-9B-heretic-oQ8-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint está pensado para ejecutarse con MLX, el framework de Apple para inferencia en silicio de la compañía, y emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta. El resultado es un checkpoint de 9.653 millones de parámetros lógicos almacenado en aproximadamente 10,7 GB, con un promedio efectivo de 8,881 bits por peso.

El modelo base pertenece a la familia Qwen3.5, e incorpora componentes diferenciados: un modelo de lenguaje de 8.954 millones de parámetros lógicos, un codificador visual de 456 millones y una cabeza MTP (multi-token prediction) de 243 millones. La presencia de visión y de MTP indica que el modelo original soporta entrada multimodal y decodificación especulativa mediante predicción de múltiples tokens, aunque la model card no detalla el funcionamiento interno ni los datos de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada de un modelo reciente de la familia Qwen con capacidades multimodales; por otro, ilustra el estado del arte en cuantización mixta para MLX, donde se combinan capas en 8 bits afín con grupo de 64 y capas preservadas en BF16 para mantener calidad. No obstante, la información publicada por el autor es muy limitada y no incluye benchmarks, licencia explícita ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con codificador visual y cabeza MTP; detalles no disponibles |
| Parametros totales | 9.653.104.368 (9.653B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit con grupo de 64 (94,917% de los pesos) y BF16 (5,083%); promedio efectivo 8,881 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen3.5-9B, no un entrenamiento desde cero. La arquitectura subyacente es un transformer de la familia Qwen3.5 con tres componentes: el modelo de lenguaje (8.954B parámetros lógicos), un codificador visual (0.456B) y una cabeza MTP (0.243B) orientada a predicción multi-token. La model card no especifica número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto del modelo original.

El proceso de cuantización emplea oQ (oMLX v0.7.3), que aplica precisión mixta: el 94,917% de los pesos se almacena en affine 8-bit con grupo de 64 (8,50 bits/peso efectivos) y el 5,083% restante se conserva en BF16 (16 bits/peso). Esta estrategia busca preservar en mayor precisión las capas más sensibles mientras comprime el grueso del modelo. No se dispone de información sobre los datos de entrenamiento del modelo base, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia cuantización y la cabeza MTP.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base Qwen3.5-9B, no verificadas en la información disponible.
- Procesamiento visual: el checkpoint incluye un codificador visual de 0,456B parámetros lógicos, lo que indica soporte de entrada de imágenes.
- Predicción multi-token (MTP): la cabeza MTP de 0,243B parámetros sugiere decodificación especulativa o generación acelerada de múltiples tokens.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 10,7 GB permiten ejecutar el modelo en equipos con memoria unificada de 16 GB o superior, útil para prototipado y experimentación sin GPU dedicada.
- Procesamiento de documentos con imágenes: gracias al codificador visual integrado, puede emplearse para tareas de comprensión de capturas, diagramas o documentos escaneados, siempre que se valide su calidad real en ese dominio.
- Aceleración de generación mediante MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en cargas de generación de texto largas, aunque no se han publicado métricas de speedup.
- Evaluación de cuantización mixta: sirve como referencia para investigadores que comparan la pérdida de calidad de oQ 8-bit frente al modelo original en BF16.
- Asistente conversacional de escritorio: un modelo de ~9,6B parámetros en 8 bits es viable para chatbots locales en macOS con MLX, con contexto limitado por la memoria disponible.
- Experimentación con modelos multimodales cuantizados: útil para pipelines de investigación que necesitan un checkpoint multimodal ligero y ejecutable en hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 10,7 GB para los pesos en el formato publicado; se requiere memoria adicional para el contexto y los buffers de activación (estimación orientativa de 12-16 GB en total, no confirmada por el autor).
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4 y posteriores).
- Cabe en consumer GPU: no en GPUs NVIDIA convencionales por el formato MLX; sí en Mac con memoria unificada de 16 GB o más.
- Opciones de despliegue: MLX (librería nativa), oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ8-mtp | 9,653B lógicos | no disponible | oQ mixta 8-bit/BF16 | no disponible | safetensors (MLX) |
| Qwen3.5-9B (original) | ~9,6B | no disponible | BF16 | no disponible | safetensors |
| Alternativas de ~9B en MLX | no disponible | no disponible | 4/8-bit | variable | MLX |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; debe verificarse con el autor o con la licencia del modelo base Qwen3.5-9B.
- No se han publicado benchmarks ni evaluaciones de calidad tras la cuantización, por lo que se desconoce la degradación respecto al modelo original.
- El sufijo "heretic" en el nombre sugiere una variante con alineamiento modificado (posiblemente sin rechazo o con sesgos alterados), pero no hay documentación que lo confirme; debe tratarse con cautela en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta ficha.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto no disponible, lo que dificulta planificar cargas con documentos largos.
- El formato MLX limita el despliegue a hardware Apple; no es portable a ecosistemas CUDA sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ8-mtp
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
