# bodhan-ai/indic-translate

## Resumen

El modelo `bodhan-ai/indic-translate` es un modelo de traducción automática desarrollado por Bodhan.AI, que parte del modelo base `google/gemma-4-E4B-it`. Está diseñado para traducir entre inglés y las 22 lenguas programadas de la India (asamés, bengalí, bodo, dogri, konkani, gujarati, hindi, kannada, cachemir, maithili, malayalam, manipuri, marathi, nepalí, oriya, punyabí, sánscrito, santalí, sindhi, tamil, telugu y urdu), lo que supone 44 direcciones de traducción. El modelo destaca por conservar intactos el formato Markdown, LaTeX, código y tablas durante la traducción, y por manejar acentos y code-switching. Con 7.941 millones de parámetros, es un modelo de tamaño medio que se puede desplegar en entornos de producción con recursos moderados. Su acceso en HuggingFace es restringido (gated), por lo que requiere aceptar condiciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de google/gemma-4-E4B-it) |
| Parámetros totales | 7.941.106.250 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | other (acceso restringido en HuggingFace) |
| Formato de pesos | safetensors |

Nota: el tag "long-context" sugiere una ventana de contexto amplia, pero no se especifica el número exacto de tokens. El tag "image-text-to-text" indica posible soporte multimodal, aunque no se detalla en la documentación disponible.

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 de Google. La arquitectura base es un transformer, típico de la familia Gemma. El modelo se ha entrenado para la tarea de traducción entre inglés y 22 lenguas indias, y también para manejar transliteración y romanización. Según la documentación de Bodhan.AI, el modelo conserva el formato Markdown, LaTeX, código y tablas en las traducciones, lo que sugiere un entrenamiento específico en datos con marcado estructurado. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Traducción automática entre inglés y 22 lenguas programadas de la India (44 direcciones).
- Conservación de formato Markdown, LaTeX, código y tablas durante la traducción.
- Manejo de acentos y code-switching en las lenguas indias.
- Soporte de transliteración y romanización según los tags del modelo.
- Posible soporte multimodal (image-text-to-text) según los tags, aunque no está documentado en la información disponible.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales, especificaciones y guías escritas en Markdown o LaTeX desde inglés a lenguas indias preservando el formato, lo que reduce el trabajo de revisión posterior.
- Localización de interfaces de usuario: gracias a su capacidad para manejar code-switching y acentos, puede traducir textos de aplicaciones web y móviles manteniendo la naturalidad en contextos multilingües.
- Traducción de contenido educativo: el modelo puede traducir material didáctico, artículos y libros de texto entre inglés y lenguas indias, útil para plataformas de e-learning.
- Traducción de subtítulos y transcripciones: su capacidad para entender acentos y variantes lingüísticas lo hace adecuado para generar subtítulos en lenguas indias a partir de contenido en inglés.
- Traducción de código y documentación de software: al preservar el código y las tablas, puede traducir comentarios, READMEs y documentación de proyectos open source sin romper la estructura.
- Transliteración y romanización: puede convertir texto en escritura nativa india a romanización y viceversa, útil para sistemas de búsqueda y normalización de textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.941 millones de parámetros en FP16, se requieren aproximadamente 16 GB de VRAM. Con cuantización 4-bit, la estimación baja a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) permiten ejecutar el modelo en FP16. Para cuantización 4-bit, una RTX 3090 o RTX 4080 son suficientes.
- Despliegue: compatible con la librería Transformers. Puede convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se ha confirmado esta compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente en la información disponible. El modelo se puede situar en la categoría de traducción multilingüe para lenguas indias, donde existen alternativas como NLLB-200 o IndicTrans2, pero no se disponen de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Acceso restringido: el modelo está marcado como gated en HuggingFace, por lo que es necesario aceptar condiciones de uso antes de poder descargarlo.
- Licencia "other": la licencia no está especificada, lo que puede limitar su uso comercial o requerir revisión legal.
- Sin datos de benchmarks: no hay resultados publicados que permitan evaluar su rendimiento frente a otros modelos.
- Posibles sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede heredar sesgos lingüísticos y culturales, y generar traducciones incorrectas en contextos ambiguos.
- Longitud de contexto no especificada: aunque el tag indica "long-context", no se conoce el número exacto de tokens, lo que dificulta planificar su uso en documentos extensos.

## Enlaces

- HuggingFace: https://huggingface.co/bodhan-ai/indic-translate
- Bodhan.AI: https://bodhan.ai/
- Consola de Bodhan.AI: https://console.bodhan.ai/
