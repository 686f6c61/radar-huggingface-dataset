# nokkela-ai/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es una versión cuantizada en FP8 del modelo experimental Qwen3.8-Flash-Next, publicado por nokkela-ai como artefacto derivado del modelo base de Qwen. Se trata de un modelo multimodal de tipo causal language model con encoder de visión, orientado a tareas de image-text-to-text y conversación, que introduce una arquitectura híbrida pensada para servir como base de la futura familia Qwen4. El modelo combina atención lineal (Gated DeltaNet), atención dispersa a nivel de micro-bloque (Qwen Sparse Attention), una capa MoE de 512 expertos, embeddings de n-gramas y residuales con compuertas, con 180.000 millones de parámetros totales según los safetensors publicados.

La relevancia de esta ficha radica en que el artefacto empaqueta pesos en formato FP8 con cuantización fine-grained de bloques de 128, compatible con Transformers, vLLM, SGLang y TokenSpeed, y con un tamaño de repositorio de 185,6 GB. Está pensado para despliegues de inferencia que necesitan reducir huella de memoria sin renunciar, según el autor, a una calidad prácticamente idéntica a la del modelo original. El contexto nativo declarado es de 262.144 tokens, extensible hasta 1.000.000.

La licencia es qwen-community-1.0, marcada como "other" en Hugging Face, por lo que su uso comercial y redistribución deben verificarse contra el texto de la licencia incluido en el repositorio. El modelo base es Qwen/Qwen3.8-Flash-Next y este artefacto no aporta entrenamiento adicional: es una conversión de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con encoder de visión; híbrida Gated DeltaNet + Qwen Sparse Attention + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 179.999.981.459 (~180B, dato de safetensors); model card declara 125B con 6B activados, más 51B de n-gram embedding y 4B de MTP |
| Parametros activos | 6B activados (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 fine-grained con block size de 128 (este artefacto); el modelo base admite otras cuantizaciones no detalladas aquí |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo sigue un layout de 48 capas organizado como 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)). La dimensión oculta es 2560, con embedding de tokens de 248.320 (padded) y una capa de n-gram embedding de 20.000.000 bigramas/trigramas situada en la capa 2. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones, un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida (dimensión 128) y un presupuesto de 512 bloques o 2048 tokens. La MoE cuenta con 512 expertos, 10 enrutados más 1 compartido activados, y dimensión intermedia de experto 640. Gated Residual usa 4 ramas con rango de cuello de botella 320. Se incluye una capa MTP entrenada con múltiples pasos.

El recetario de entrenamiento descrito por el autor aplica Muon y AdamW a categorías específicas de pesos, elimina los warmups tradicionales de batch size empezando directamente en el tamaño objetivo y utiliza leyes de escala refitadas para reducir pasos de optimizador y permitir learning rates mayores. Las innovaciones destacadas son QSA a nivel de micro-bloque para reducir latencia en contexto largo, Gated Residual con read gate dependiente de datos y write gate escalar por rama, y N-gram Embedding como eje de escalado de parámetros más apto para offloading que MoE. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con contexto nativo de 262.144 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con encoder de visión dedicado.
- Razonamiento de contexto largo, favorecido por QSA y por el presupuesto de 2048 tokens por bloque indexado.
- Capacidades de código y matemáticas: no hay resultados de benchmark disponibles en la información proporcionada para confirmarlas con cifras.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona cargas agenticas como motivación de QSA, pero no detalla APIs específicas.
- Capacidades multilingües: no disponible; la lista de idiomas no se especifica.
- Modo thinking: no disponible en la información proporcionada.
- Decodificación especulativa mediante capa MTP entrenada con multi-steps.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historial extenso gracias a sus 262.144 tokens de contexto nativo, evitando truncamientos en hilos largos y manteniendo coherencia sobre el estado previo de la conversación.
- Análisis de documentos largos con imágenes: al combinar encoder de visión y contexto extendido, permite procesar informes, contratos o manuales con gráficos incrustados en una sola pasada, extrayendo respuestas que referencian tanto texto como elementos visuales.
- Asistentes de código en pipelines de CI/CD: la arquitectura MoE con 6B parámetros activos reduce el coste por token en comparación con un modelo denso de 180B, lo que facilita integrarlo en revisiones automatizadas de pull requests y generación de parches, siempre que se validen empíricamente sus resultados en código.
- Agentes de navegación y automatización multi-paso: QSA está diseñada para reducir la latencia en contexto largo, escenario típico de agentes que acumulan observaciones de herramientas y historial de acciones durante muchas iteraciones.
- RAG sobre bases documentales extensas: el contexto de hasta 1.000.000 tokens extensibles permite inyectar grandes bloques de documentación recuperada sin fragmentación agresiva, reduciendo pérdida de contexto entre chunks.
- Despliegue en infraestructura con memoria limitada: al estar cuantizado en FP8 con bloques de 128, el artefacto de 185,6 GB puede servirse en GPUs con menos VRAM que las necesarias para pesos BF16, manteniendo compatibilidad con vLLM, SGLang y TokenSpeed.
- Procesamiento por lotes de contenido multimodal: clasificación, resumen y extracción de información de capturas, facturas o imágenes acompañadas de texto en flujos de back-office.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de resultados de benchmarks, pero los valores numéricos no están presentes en el extracto proporcionado, por lo que no se reproducen cifras. El autor afirma que las métricas de rendimiento del artefacto FP8 son "casi idénticas" a las del modelo original, sin cuantificar la diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 185,6 GB en FP8; se requiere al menos esa capacidad agregada de VRAM para cargar los pesos completos en una o varias GPU, más overhead de KV cache y activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por el volumen de pesos, un despliegue en una sola GPU exige aceleradores de 192 GB o más (por ejemplo H100 NVL o H200), o bien sharding multi-GPU.
- Cabe en consumer GPU: no, con los pesos FP8 completos; sería necesario sharding en varias GPU o cuantizaciones adicionales no documentadas en este artefacto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponible; el autor indica que QSA reduce significativamente la latencia en contexto largo, pero no publica cifras en la información disponible.
- Existe una alternativa gestionada, Qwen Cloud, con la variante Qwen3.8-Flash que ofrece 1M de contexto por defecto y herramientas integradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (este) | ~180B totales, 6B activos | 262.144 nativo, hasta 1.000.000 | safetensors FP8 | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen3.8-Flash-Next (base) | 125B LM + 51B n-gram + 4B MTP | 262.144 nativo, hasta 1.000.000 | no disponible en esta ficha | qwen-community-1.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash (servicio) | no disponible | 1.000.000 por defecto | API gestionada | comercial Qwen Cloud | Qwen Cloud |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un artefacto de cuantización, no un modelo entrenado: cualquier degradación respecto al base procede del proceso FP8, que el autor califica como mínima pero no cuantifica.
- La model card del artefacto no especifica idiomas soportados; no se puede asumir cobertura multilingüe amplia sin verificarlo contra el modelo base.
- Riesgo de alucinación inherente a modelos generativos de este tamaño; no se documentan medidas específicas de mitigación.
- No hay datos publicados de benchmarks en la información disponible, lo que impide validar afirmaciones de calidad frente a alternativas.
- La licencia qwen-community-1.0 está marcada como "other"; antes de uso comercial o redistribución debe revisarse el archivo LICENSE del repositorio, ya que pueden aplicarse restricciones adicionales.
- El modelo se describe como "experimental preview" de la arquitectura Qwen4, lo que implica madurez limitada y posible falta de soporte a largo plazo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción comunitaria ni validación independiente.
- El contexto extensible hasta 1.000.000 tokens puede degradar calidad y aumentar consumo de KV cache; el contexto nativo garantizado es 262.144.
- El tamaño de 185,6 GB limita el despliegue a infraestructura multi-GPU o aceleradores de gran memoria.
- Compatibilidad declarada con vLLM, SGLang y TokenSpeed, pero sin resultados publicados de latencia o throughput que respalden el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog del autor del modelo base: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Servicio Qwen Cloud: https://www.qwencloud.com
- Variante Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Imagen de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
