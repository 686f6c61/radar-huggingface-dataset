# kejizilu/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterated" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El autor de esta variante, kejizilu, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar el comportamiento de rechazo (refusals) mediante una ablación selectiva de direcciones en el espacio de activaciones, técnica conocida como Arbitrary-Rank Ablation (ARA).

El modelo base concentra su señal de entrenamiento supervisado (SFT) en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras, preservando la eficiencia de la clase de 9B parámetros. Incluye capacidades multimodales (image-text-to-text), razonamiento estructurado, tool calling y un modo de pensamiento (thinking). Esta versión heretic mantiene la arquitectura y los pesos del original, pero modifica las capas 9 a 24 para reducir drásticamente las negativas a responder.

La relevancia de esta ficha radica en que documenta una práctica creciente en la comunidad open source: la producción de variantes "decensored" o "abliterated" de modelos compactos con licencia Apache 2.0, orientadas a investigación sobre alineación, evaluación de sesgos y despliegues donde el filtrado del modelo base resulta restrictivo. El modelo conserva el contexto nativo de Qwen3.5-9B y los seis idiomas declarados (inglés, chino, coreano, japonés, español y ruso).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la model card; existe versión GGUF publicada por mradermacher (Q8_0 entre las evaluadas) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio de terceros |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B, un transformer decoder-only de 9,4B parámetros con capacidad multimodal image-text-to-text. El entrenamiento se realizó mediante destilación de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un corpus de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. Según la model card, el pipeline incluye SFT, RL con GSPO (Group Sequence Policy Optimization) y soporte de MTP (Multi-Token Prediction), aunque no se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

La innovación principal de esta variante es la aplicación de Heretic v2.0.0.dev0 con Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24. Los parámetros de ablación publicados son: `start_layer_index=9`, `end_layer_index=24`, `preserve_good_behavior_weight=0.8264`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9645` y `neighbor_count=12`. El resultado reportado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original, lo que indica una modificación moderada de la distribución de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) heredado de la destilación de DeepSeek-V4-Pro.
- Resolución de problemas matemáticos y STEM, área principal del entrenamiento supervisado.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que permite entrada multimodal.
- Tool calling y function calling, con soporte declarado en los tags del repositorio.
- Razonamiento agéntico y multi-step reasoning orientado a uso con herramientas.
- Capacidades multilingües en inglés, chino, coreano, japonés, español y ruso.
- Mejoras menores reportadas en programación y uso de herramientas por transferencia cruzada, pese a no recibir SFT específico de código.
- Comportamiento "decensored": reducción drástica de rechazos a peticiones que el modelo base declinaba.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación de direcciones afecta al comportamiento de rechazo, con métricas concretas (3/100 rechazos, KL 0,0422) que facilitan la comparación con el modelo original.
- Evaluación de sesgos y robustez: útil para medir la degradación de filtros de seguridad y diseñar contramedidas en pipelines de moderación.
- Tutoría matemática y STEM: el entrenamiento con ~250.000 muestras de matemáticas y ciencia lo hace adecuado para generar explicaciones paso a paso en entornos educativos controlados.
- Asistente técnico con tool calling: integrable en flujos que requieren llamadas a funciones (calculadoras, APIs de datos científicos) gracias al soporte declarado de function calling.
- Procesamiento multimodal documental: al aceptar entrada image-text-to-text, puede extraer y razonar sobre contenido de figuras, tablas o diagramas científicos.
- Despliegue en hardware de consumo: con 9,4B parámetros y versiones GGUF disponibles, puede ejecutarse en GPUs consumer para prototipado local sin dependencia de APIs.
- Generación de contenido sin restricciones en entornos de investigación creativa: útil para estudiar la frontera entre creatividad y seguridad en modelos compactos.

## Benchmarks y rendimiento

La model card solo publica métricas de la ablación, no benchmarks estándar (MMLU, GSM8K, HumanEval, etc.).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18,8 GB solo para pesos (el repositorio ocupa 18,8 GB), por lo que requiere GPUs con 24 GB o más (RTX 3090/4090, A10G, L4 con cuantización).
- Cuantización Q8_0 (GGUF): en torno a 10 GB, cabe en RTX 4080/4090 y GPUs de 12-16 GB con contexto moderado.
- Cuantizaciones de 4 bits (si están disponibles en el repositorio GGUF de terceros): permitirían ejecución en GPUs de 8 GB, aunque no se confirma su disponibilidad en la información proporcionada.
- Despliegue: transformers, text-generation-inference (TGI), vLLM (se menciona evaluación con NVFP4) y llama.cpp (evaluación con MTP-Q8_0). Ollama no se menciona explícitamente, pero sería viable a partir de los GGUF publicados.
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,4B | no disponible | Razonamiento STEM destilado, decensored | Apache 2.0 | Hugging Face (safetensors + GGUF de terceros) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Razonamiento STEM destilado, alineado | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | Modelo generalista multimodal | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El proceso de abliteration elimina filtros de seguridad: el modelo puede generar contenido dañino, ofensivo o ilegal que el original rechazaba. No es apto para producción orientada al usuario final sin moderación externa.
- La divergencia KL de 0,0422 indica que la distribución de salida se ha alterado; pueden aparecer degradaciones en tareas distintas de las evaluadas, no cuantificadas en la model card.
- Riesgo de alucinación inherente a los modelos destilados de 9B, especialmente en dominios fuera de matemáticas y STEM.
- La longitud de contexto no está documentada en la información disponible; debe verificarse en el repositorio antes de usos con contextos largos.
- El entrenamiento se centra en matemáticas y STEM; el rendimiento en código, derecho, medicina u otras áreas no está validado con benchmarks.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensored puede contravenir políticas de plataformas, términos de servicio de proveedores cloud y normativa aplicable sobre contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Los idiomas declarados incluyen seis lenguas, pero no se aportan métricas de calidad por idioma; el español figura entre ellos sin evaluación específica publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kejizilu/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic (herramienta de abliteration): https://heretic-project.org
- GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Espejo en Hugging Face (xtools-at): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
