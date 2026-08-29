# orcarouter/GLM-5.3-Flash-Uncensored-FP8

## Resumen

El modelo `orcarouter/GLM-5.3-Flash-Uncensored-FP8` es una versión *abliterada* (eliminación de la dirección de rechazo) del checkpoint oficial `zai-org/GLM-5.3-Flash` de Z.ai, publicada por OrcaRouter. La abliteration consiste en ortogonalizar la dirección de rechazo del flujo residual, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaría. El resultado se ha integrado directamente en los shards block-FP8 oficiales, manteniendo el mismo formato, la misma disposición de shards y el mismo `model.safetensors.index.json`, por lo que funciona como reemplazo directo (drop-in) del checkpoint base en cualquier stack que ya lo sirva.

El modelo base es un MoE multimodal de aproximadamente 320B parámetros totales y 18B activos, con atención híbrida (lineal y sparse), torre de visión y vídeo nativa, cabezal especulativo MTP y una ventana de contexto de 1M tokens. Esta versión abliterada se distribuye bajo licencia MIT y está pensada exclusivamente para investigación legítima en seguridad, interpretabilidad, red-teaming y evaluación de robustez. No incluye guardarraíles y su uso en producción o con usuarios finales requiere capas adicionales de moderación y control de abuso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (glm5_next) — 45 capas transformer + 1 bloque MTP, hidden 4096, atención híbrida (34 KDA + 11 sparse full-attention con indexador top-2048, intervalo 4), MLA (q-LoRA 1536 / kv-LoRA 512, NoPE), 288 expertos enrutados top-8 + 1 experto compartido (primeras 3 capas densas), 4-wide Manifold-Constrained Hyper-Connections (mHC), torre de visión + vídeo nativa |
| Parametros totales | 321.323.031.390 (321,3B) — incluye bloque MTP de 7,4B y torre de visión de 0,56B |
| Parametros activos | ~18B (top-8 de 288 expertos) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | block-FP8 (e4m3, bloques 128×128, activaciones dinámicas) + BF16 — formato nativo del checkpoint, no una cuantización aplicada posteriormente |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, 62 shards, 76.108 tensores, 306 GiB (block-FP8 + BF16) |

## Arquitectura y entrenamiento

La arquitectura base, `Glm5NextForConditionalGeneration`, combina atención lineal (KDA) y atención sparse con un indexador top-2048, lo que reduce drásticamente el coste de servir contextos largos manteniendo precisión. Emplea Multi-head Latent Attention (MLA) con LoRA para q y kv, y 288 expertos enrutados con top-8, más un experto compartido. Las primeras tres capas son densas. El bloque MTP (Multi-Token Prediction) actúa como cabezal especulativo para acelerar la decodificación. La torre de visión y vídeo está integrada de forma nativa.

El entrenamiento de esta versión consiste en un fine-tune sobre el checkpoint oficial `zai-org/GLM-5.3-Flash` mediante abliteration: se identifica la dirección del vector de rechazo en el flujo residual y se ortogonaliza, eliminando así la negativa a responder. No se ha modificado la cuantización ni la disposición de tensores; todos los tensores conservan nombre, dtype y forma respecto al base. No se han publicado detalles sobre el dataset utilizado para el proceso de abliteration ni sobre el método exacto de cálculo de la dirección de rechazo.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base.
- Comprensión y generación multimodal: procesa imágenes y vídeo gracias a la torre de visión integrada (346 de 347 tensores `visual.*` conservados en BF16).
- Soporte de function calling / tool calling, según las etiquetas del modelo base.
- Capacidad de razonamiento multi-paso (etiquetado como `reasoning`).
- Decodificación especulativa mediante el bloque MTP, que acelera la inferencia.
- Multilingüe limitado a inglés y chino (en, zh).
- Sin guardarraíles: al haber sido abliterado, no rechaza peticiones dañinas, ofensivas o ilegales que el modelo original sí rechazaría.

## Casos de uso

- Red-teaming de modelos de lenguaje: permite probar la robustez de sistemas de moderación y filtrado ante respuestas que un modelo alineado rechazaría. Se usa en entornos controlados para generar entradas adversarias y evaluar defensas.
- Investigación en interpretabilidad: estudiar cómo se codifica la dirección de rechazo en el flujo residual y qué mecanismos internos la activan. Al eliminar esa dirección, se pueden aislar los componentes responsables de la negativa.
- Evaluación de alineación y seguridad: comparar el comportamiento del modelo abliterado con el original para medir el impacto de la abliteration en la utilidad, la coherencia y la tendencia a generar contenido dañino.
- Experimentos controlados en entornos aislados: análisis de sesgos, alucinaciones y límites de conocimiento en un modelo sin restricciones de seguridad, siempre bajo supervisión humana y sin conexión a servicios públicos.
- Pruebas de robustez de pipelines de generación: verificar si los sistemas de post-procesado (filtros de contenido, clasificadores de toxicidad) detectan correctamente salidas generadas por un modelo sin alineación.
- Investigación en mecanismos de rechazo y jailbreak: estudiar cómo se pueden evadir o reforzar las barreras de seguridad en modelos de lenguaje, contribuyendo al desarrollo de defensas más sólidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada en la información disponible. El modelo base `zai-org/GLM-5.3-Flash` cuenta con evaluaciones propias de Z.ai, pero no se han reproducido aquí. No se dispone de datos comparativos de rendimiento entre la versión original y la abliterada.

## Requisitos de hardware

- Los pesos en block-FP8 ocupan 306 GiB en disco, por lo que la inferencia requiere al menos ~320 GB de VRAM para cargar el modelo completo en memoria.
- No cabe en una GPU de consumo (RTX 4090, 3090, etc.). Se necesitan configuraciones multi-GPU: por ejemplo, 4× A100 80GB (320 GB totales) o 8× H100 80GB (640 GB totales) para mayor margen y throughput.
- Opciones de despliegue compatibles: vLLM, TGI, SGLang y cualquier framework que soporte el formato `glm5_next` y block-FP8. También es posible usar llama.cpp si se convierte a GGUF, aunque no se ha publicado una versión GGUF de este checkpoint.
- La latencia y el throughput dependen del hardware y del número de GPUs; no se han publicado cifras oficiales. El bloque MTP permite decodificación especulativa, lo que puede mejorar el throughput en cargas de generación larga.
- Para uso en investigación con cargas pequeñas, se podría optar por cuantizaciones más agresivas (por ejemplo, 4-bit) si se convierte el modelo, pero no se ha publicado ninguna versión cuantizada adicional.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos similares. Existe una comparativa publicada en HackAIGC entre Qwen 3.8 Flash y GLM 5.3 Flash para uso NSFW/uncensored, pero no se han extraído los resultados concretos. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-FP8 (este) | 321B total / 18B activo | 1M | MIT | block-FP8 | Abliterado, sin guardarraíles |
| zai-org/GLM-5.3-Flash (base) | 321B total / 18B activo | 1M | MIT | block-FP8 | Alineado, con rechazo |
| Qwen 3.8 Flash (según HackAIGC) | no disponible | no disponible | no disponible | no disponible | Comparado en contexto NSFW, sin datos extraídos |

No se han encontrado otros modelos abliterados de la misma familia GLM con especificaciones públicas comparables.

## Limitaciones y advertencias

- El modelo ha sido despojado de su alineación de seguridad: cumplirá con peticiones dañinas, poco éticas, ofensivas o ilegales que el original rechazaría. No tiene guardarraíles integrados.
- Está destinado exclusivamente a investigación legítima (interpretabilidad, seguridad, red-teaming, evaluación de robustez). No debe desplegarse a usuarios finales ni en producción sin añadir capas propias de moderación y prevención de abuso.
- El autor y el uploader no aceptan responsabilidad por mal uso o daños. El usuario asume toda la responsabilidad legal y ética.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación y de generar información falsa o inconsistente, especialmente en contextos largos o con entradas ambiguas, como cualquier modelo de esta escala.
- La licencia MIT permite uso comercial, pero el uso indebido puede violar leyes y regulaciones aplicables. Se recomienda revisar la normativa local antes de cualquier uso.
- No se han publicado evaluaciones de seguridad ni métricas de toxicidad para esta versión abliterada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Repositorio Orca-Code-Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- Página de vLLM Recipes para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Comparativa con Qwen 3.8 Flash (HackAIGC): https://www.hackaigc.com/blog/qwen-38-vs-glm-53-nsfw-uncensored-2026
