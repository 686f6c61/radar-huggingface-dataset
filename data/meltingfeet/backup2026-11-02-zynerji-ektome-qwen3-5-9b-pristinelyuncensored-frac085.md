# meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085

## Resumen

Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085 es un ajuste fino (fine-tune) del modelo Qwen3.5-9B de Alibaba, publicado por el usuario meltingfeet en HuggingFace. El nombre indica que se trata de una variante "uncensored" (sin alineamiento de seguridad) generada mediante la técnica Ektome, un método de edición o fusión de modelos, con un factor de mezcla de 0,85 (frac085). El repositorio tiene acceso restringido: es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El modelo conserva la arquitectura del Qwen3.5-9B original, un transformer denso de aproximadamente 9.410 millones de parámetros (9,41 mil millones) según los pesos en safetensors, con capacidades multimodales (etiqueta "vision"). El repositorio ocupa 18,8 GB, lo que sugiere pesos en precisión de 16 bits.

Su relevancia es limitada y muy específica: se trata de un experimento de la comunidad sin descargas ni likes en el momento de la consulta, orientado a usuarios que buscan un modelo de 9B sin restricciones de contenido y con capacidad de visión. No hay documentación técnica publicada por el autor más allá de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal con vision |
| Parametros totales | 9.409.813.744 (~9,41 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el tamano del repo, 18,8 GB, sugiere bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de la familia Qwen3.5 con soporte de visión según las etiquetas del repositorio. El autor no ha publicado detalles sobre la arquitectura interna, la longitud de contexto nativa ni la composición del dataset de entrenamiento original.

El ajuste fino emplea la técnica Ektome con un factor de mezcla de 0,85 (frac085), presumiblemente una edición de pesos orientada a eliminar el alineamiento de seguridad del modelo base. No hay información publicada sobre el número de tokens de entrenamiento, el uso de RLHF/DPO, ni sobre si se preservaron las capacidades multimodales del modelo original tras la edición. Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del Qwen3.5-9B base.
- Capacidad de visión declarada en las etiquetas del repositorio (procesamiento de imágenes), aunque sin verificación documentada tras el ajuste.
- Comportamiento "uncensored": se espera que rechace menos peticiones que el modelo base alineado, si bien no hay evaluación publicada que lo confirme.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Qwen3.5 es multilingüe, pero no se documenta el impacto del ajuste).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio de edición de pesos para eliminar salvaguardas, permitiendo analizar qué capacidades se degradan y cuáles se preservan tras la modificación.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temáticas adultas o sensibles donde el modelo base rechazaría peticiones, siempre que el uso cumpla la legislación aplicable.
- Evaluación comparativa de robustez: comparar las respuestas del modelo editado frente al Qwen3.5-9B original para medir la pérdida de calidad y coherencia introducida por la edición Ektome.
- Pruebas de pipelines multimodales: experimentar con la capacidad de visión declarada en tareas de descripción de imágenes o extracción de información visual, verificando previamente que el ajuste no la haya degradado.
- Prototipado local en hardware de consumo: con 9,41 mil millones de parámetros y pesos de ~18,8 GB, puede ejecutarse cuantizado en GPUs de 24 GB, útil para experimentos offline sin dependencia de APIs.
- Red teaming interno: uso controlado por equipos de seguridad para generar prompts adversarios y evaluar los filtros de sus propios sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más.
- Cuantización a 8 bits: ~10 GB de VRAM; a 4 bits (GGUF/AWQ/GPTQ): ~5-6 GB, aunque no se han publicado cuantizaciones oficiales para este repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 en local; RTX 4060 Ti 16 GB o inferiores solo con cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en bf16 y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (prevía conversión a GGUF, no publicada), transformers con accelerate.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Acceso |
|---|---|---|---|---|---|
| Zynerji-Ektome-Qwen3.5-9B (este) | 9,41 B | No disponible | Sí (declarada) | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3.5-9B (base) | ~9,4 B | No disponible | Sí | Apache 2.0 (según repo derivado) | Público |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | No | Apache 2.0 | Público |
| Llama 3.1 8B Instruct | 8,0 B | 128K | No | Llama 3.1 Community | Público con aceptación |

La comparación directa con el modelo base es la más relevante: este fine-tune no aporta mejoras documentadas de rendimiento y su principal diferencia es la eliminación de salvaguardas. Frente a alternativas de tamaño similar, carece de benchmarks publicados que permitan evaluar su calidad.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad ("uncensored"): puede generar contenido dañino, ilegal o explícito; no es apto para aplicaciones de cara al público sin moderación externa.
- Sin benchmarks ni evaluación publicada: se desconoce la degradación de calidad, coherencia y capacidades (incluida la visión) tras la edición Ektome.
- Riesgo elevado de alucinación y de respuestas incoherentes, habitual en ediciones de pesos agresivas sin validación.
- Sin documentación sobre idiomas soportados ni longitud de contexto efectiva; no se puede garantizar el comportamiento multilingüe del modelo base.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados.
- Licencia Apache 2.0 declarada, pero el uso comercial debe evaluarse con cautela por la ausencia de garantías del autor y por el posible incumplimiento de normativas de contenido.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimento no auditado.
- El nombre del repositorio incluye una fecha futura (2026-11-02), lo que sugiere un artefacto de respaldo sin mantenimiento previsto.

## Enlaces

- HuggingFace: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
