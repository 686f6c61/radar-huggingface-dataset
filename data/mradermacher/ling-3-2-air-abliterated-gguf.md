# mradermacher/Ling-3.2-air-abliterated-GGUF

## Resumen

Ling-3.2-air-abliterated-GGUF es una cuantización estática en formato GGUF del modelo Ling-3.2-air-abliterated, publicada por el usuario mradermacher. El modelo base es una variante "abliterated" (es decir, con las capas de rechazo neutralizadas mediante una técnica de edición de pesos) de Ling-3.2-air, un modelo de lenguaje de la familia Ling desarrollada por InclusionAI (Ant Group). Esta publicación concreta no es un modelo nuevo, sino un artefacto de despliegue: pesos cuantizados listos para su uso en llama.cpp y entornos compatibles con GGUF.

El dato más relevante de la ficha es el tamaño: el repositorio de safetensors del modelo base declara 434.248.944 parámetros (aproximadamente 434 millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución en CPU y GPU de consumo. El repositorio GGUF ocupa 1,5 GB, coherente con un modelo de ese orden de magnitud en cuantizaciones mixtas.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo pequeño de la familia Ling; por otro, sirve como ejemplo de la cadena de publicación típica de mradermacher, que convierte modelos en safetensors a GGUF con un conjunto estándar de cuantizaciones (Q2_K a Q8_0, IQ4_XS y f16). La información disponible sobre el modelo base es escasa, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ling-3.2-air; arquitectura no confirmada en la informacion proporcionada) |
| Parametros totales | 434.248.944 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Ling-3.2-air en los datos proporcionados. Por el nombre y la familia (Ling, de InclusionAI), se trata presumiblemente de un transformer decoder-only, pero este dato no está confirmado en la información disponible. Tampoco se conocen el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o similares.

La única innovación técnica documentada en esta publicación es el proceso de cuantización: mradermacher genera cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face (convert_type hf), con un conjunto de cuantizaciones que va desde Q2_K hasta Q8_0, además de f16 e IQ4_XS. La variante "abliterated" del modelo base implica una modificación de pesos orientada a eliminar el comportamiento de rechazo, aunque el método exacto de abliteración no se detalla en la información disponible.

## Capacidades

- Generación de texto: capacidades genéricas de modelado de lenguaje, sin datos específicos publicados.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento sin censura: el sufijo "abliterated" indica que el modelo base ha sido modificado para reducir los rechazos, aunque no se documenta el alcance ni la eficacia de esa modificación.

## Casos de uso

- Despliegue en entornos con recursos limitados: con ~434 millones de parámetros y cuantizaciones desde Q2_K, el modelo puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace adecuado para prototipos locales y pruebas de concepto sin infraestructura dedicada.
- Investigación sobre abliteración: útil para estudiar cómo afecta la eliminación de capas de rechazo al comportamiento del modelo en tareas de generación libre, comparando las versiones original y abliterated.
- Generación de texto asistida en local: integrable en llama.cpp u Ollama para tareas de redacción, resumen o completado en entornos de escritorio, siempre que se validen los resultados.
- Filtrado y clasificación de texto: modelos pequeños de este orden se usan habitualmente para tareas de etiquetado y clasificación de baja latencia, aunque no hay datos publicados que confirmen su rendimiento en estas tareas.
- Evaluación de cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (Q2_K a Q8_0, IQ4_XS), lo que permite estudiar la degradación de calidad según el nivel de compresión en un modelo de este tamaño.
- Base para fine-tuning ligero: al ser un modelo pequeño, puede servir como punto de partida para ajustes con LoRA en tareas específicas, aunque la licencia no confirmada obliga a verificar los términos antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de ~434 millones de parámetros en Q4_K_M ocuparía del orden de 250-300 MB, y en f16 alrededor de 870 MB, aunque estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre podría alojarlo en cuantizaciones bajas.
- GPU de consumo: sí, previsiblemente cabe en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, e incluso en iGPU con suficiente memoria compartida, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; vLLM y TGI no se confirman para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables de la misma familia o tamaño en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (mrfakename/Ling-3.2-air-abliterated) antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; al ser una variante abliterated, puede presentar sesgos y comportamientos menos filtrados que la versión original.
- Contexto: longitud de contexto no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Artefacto derivado: esta publicación es una cuantización de un modelo de terceros; los errores o problemas del modelo base se heredan.
- Sin métricas de calidad: no hay benchmarks que permitan comparar la degradación introducida por cada cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ling-3.2-air-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/mrfakename/Ling-3.2-air-abliterated
- Familia Ling (InclusionAI): no disponible en la información proporcionada.
