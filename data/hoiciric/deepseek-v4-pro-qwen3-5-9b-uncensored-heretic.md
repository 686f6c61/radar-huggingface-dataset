# hoiciric/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterada" (decensored) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario hoiciric. El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". Es decir, el conocimiento y los patrones de razonamiento del teacher se transfieren a un modelo compacto de 9B parámetros, lo que permite desplegarlo en hardware asequible sin renunciar a la calidad de razonamiento matemático y científico.

La modificación heretic aplica una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del transformer, con el objetivo de eliminar la tendencia a rechazar peticiones. Según la model card, el modelo original rechazaba 100 de cada 100 peticiones en su suite de evaluación, mientras que esta versión rechaza solo 3 de cada 100, con una divergencia KL de 0.0422 respecto al original, lo que indica un cambio relativamente contenido en la distribución de salidas.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9.4B), se distribuye en formato safetensors y está pensado para text-generation y image-text-to-text, con soporte declarado para inglés, chino, coreano, japonés, español y ruso. Su licencia es Apache 2.0. Es relevante para quienes necesitan un modelo de razonamiento de tamaño medio, sin restricciones de contenido, desplegable en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 (~9.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (repo mradermacher); MTP-Q8_0 evaluado; NVFP4 evaluado en vLLM |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (repo de mradermacher) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 9.4B parámetros. El entrenamiento del modelo base consistió en destilación desde DeepSeek-V4-Pro en modo "Max Effect": se generaron respuestas del teacher y se usaron como señal supervisada (SFT) sobre el alumno Qwen3.5-9B. El conjunto de datos de destilación se centra en matemáticas y STEM, con aproximadamente 250.000 muestras. La model card menciona también etapas de RL con GSPO (Group Sequence Policy Optimization) y tags de razonamiento, tool-use y function-calling, aunque no se detalla la composición exacta de cada fase ni el número total de tokens de entrenamiento.

La innovación principal de esta variante concreta es la ablación ARA aplicada sobre las capas 9 a 24, con parámetros `preserve_good_behavior_weight=0.8264`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9645` y `neighbor_count=12`. Esta intervención modifica los pesos en un rango de capas intermedias para reducir la probabilidad de respuestas de rechazo, manteniendo el comportamiento general. La model card también indica que se evaluaron rutas de despliegue con vLLM en NVFP4 y llama.cpp con MTP-Q8_0, lo que sugiere soporte para decodificación multi-token (MTP) en el ecosistema llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y STEM: el entrenamiento se concentra en ~250.000 muestras de matemáticas y ciencia.
- Generación y razonamiento sobre código: la model card reporta pequeñas mejoras en programación por transferencia cruzada, aunque sin SFT específico de código.
- Tool calling y function calling: etiquetado explícitamente en los tags del modelo.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Procesamiento image-text-to-text según el pipeline declarado (aunque no se detalla la arquitectura de visión en la información disponible).
- Modo de razonamiento (reasoning) heredado del teacher DeepSeek-V4-Pro.
- Comportamiento "decensored": reducción drástica de rechazos (3/100 frente a 100/100 del original).

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo puede usarse como asistente de cálculo simbólico, demostración de teoremas o explicación paso a paso de problemas STEM, aprovechando la destilación específica en ~250.000 muestras de matemáticas.
- Generación de código en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse en flujos de revisión automática, generación de tests o corrección de errores, aunque con la cautela de que no recibió SFT específico de código.
- Agentes autónomos multi-paso: su capacidad de razonamiento estructurado y tool use permite construir agentes que descompongan tareas, llamen a APIs y verifiquen resultados intermedios.
- Atención al cliente sin restricciones de contenido: útil en entornos donde se requiere responder a consultas sensibles o de nicho sin rechazos, con contexto multi-turno (longitud de contexto no especificada).
- Investigación en seguridad y alineación: la variante heretic sirve como caso de estudio para medir el efecto de la ablación ARA sobre la tasa de rechazos y la divergencia KL (0.0422), útil en experimentos de red-teaming.
- Traducción y generación multilingüe: con soporte para seis idiomas, puede emplearse en localización de documentación técnica o generación de contenido en español, chino, coreano, japonés y ruso.
- Despliegue en hardware de consumo: al ser un modelo de 9.4B con cuantizaciones GGUF disponibles, es adecuado para prototipos locales en una sola GPU consumer.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Tasa de rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18.8 GB solo para pesos, más overhead de KV cache; se recomienda una GPU con 24 GB o más (RTX 4090, A10G, L4 con cuantización).
- Cuantización Q8_0 (GGUF): ~10 GB de pesos, desplegable en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- Cuantización Q4_K_M (GGUF): ~5.5-6 GB, apta para GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y para CPU con llama.cpp.
- GPU recomendadas: A100 40GB o H100 para FP16 con contexto largo; RTX 4090 para FP16 en contextos moderados; RTX 3090/4080 para Q8_0.
- Opciones de despliegue: vLLM (evaluado en NVFP4 según la model card), llama.cpp (evaluado con MTP-Q8_0), transformers, text-generation-inference (tag declarado), Ollama a través de GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9.4B | no disponible | Apache 2.0 | Variante decensored, 3/100 rechazos, KL 0.0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9.4B | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Apache 2.0 | Versión reducida del mismo linaje heretic |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Modelo original sin destilación de DeepSeek-V4-Pro |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La ablación heretic elimina la mayor parte de los rechazos, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente cuestionable sin filtros. No es apto para despliegues públicos sin moderación externa.
- La divergencia KL de 0.0422 respecto al original indica que la distribución de salidas ha cambiado; pueden aparecer degradaciones en tareas que dependían de comportamientos de rechazo o de matices de seguridad.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en razonamiento matemático de múltiples pasos y en dominios fuera de STEM.
- El entrenamiento se centró en matemáticas y STEM; el rendimiento en código es por transferencia cruzada y no está validado con SFT específico.
- La longitud de contexto no está documentada; no se debe asumir una ventana larga sin verificación empírica.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensored puede conllevar riesgos legales y reputacionales según la jurisdicción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- El pipeline declarado incluye image-text-to-text, pero no se detalla la arquitectura de visión ni se han publicado evaluaciones multimodales.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/hoiciric/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Hugging Face (modelo base): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Hugging Face (variante 4B): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Hugging Face (GGUF): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Heretic (proyecto): https://heretic-project.org
