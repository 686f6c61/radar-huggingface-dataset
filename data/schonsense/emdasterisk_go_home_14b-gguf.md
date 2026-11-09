# schonsense/emdasterisk_go_home_14B-GGUF

## Resumen

El modelo `schonsense/emdasterisk_go_home_14B-GGUF` es una exportación en formato GGUF de un merge de pesos completos derivado de Ministral 3 (14B), publicado por el usuario `schonsense`. Se trata de un ajuste fino orientado a un objetivo muy específico: reducir el uso no deseado de asteriscos y guiones em (—) en las respuestas generadas, manteniendo las capacidades del modelo base. El resultado es un modelo completo, no un paquete de adaptadores, pensado para ser cargado directamente con `AutoModelForImageTextToText` o mediante runtimes compatibles con GGUF.

El entrenamiento se llevó a cabo mediante un ajuste LoRA de rango 16 aplicado a 280 proyecciones del decodificador de texto y a 13 filas seleccionadas de la cabeza de salida, seguido de un merge en pesos nativos. Se usaron 1779 pares de entrenamiento con dos pasadas sobre el mismo manifiesto y una estrategia adaptativa IPO/chosen-SFT. El modelo conserva íntegramente los módulos de visión y el proyector multimodal del modelo base, por lo que mantiene la capacidad de procesar entradas imagen-texto.

La relevancia de este modelo es acotada pero clara: se trata de un experimento de alineación de estilo sobre un modelo multimodal de 14B, con licencia Apache 2.0 y publicado con artefactos de procedencia (checksums, lineage). No obstante, la documentación disponible no incluye resultados amplios de benchmarks, evaluación multimodal ni idiomas soportados, y el número de descargas y likes es cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Ministral 3, familia Mistral) con decodificador de texto y módulos de visión; ajuste LoRA rango 16 fusionado en pesos nativos |
| Parametros totales | 14B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio es una exportación GGUF; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exportación nativa desde pesos safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Ministral 3, un transformer multimodal de la familia Mistral que combina un decodificador de texto con módulos de visión y un proyector multimodal. El ajuste publicado no modifica la arquitectura: se aplicaron actualizaciones LoRA de rango 16 sobre 280 proyecciones del decodificador de texto y 13 deltas de filas seleccionadas de la cabeza de salida, que posteriormente se fusionaron en los pesos nativos. Los embeddings de entrada, los módulos de visión, el proyector multimodal y las filas no seleccionadas de la cabeza permanecieron congelados. Los dtypes de almacenamiento de tensores del modelo base se conservaron.

El entrenamiento usó IPO adaptativo combinado con chosen-SFT sobre 1779 pares (de un corpus preparado de 2042 pares, excluyendo los de evaluación), con dos pasadas sobre el mismo manifiesto, batch efectivo de 16, learning rate pico de 1e-6 para LoRA y 1e-7 para las filas de cabeza, y warmup durante la primera pasada completa. La revisión base declarada es `3cea74c1ebaf5ce5f5a2553de470e2ceab825142` y el run `production-dp-20261109T071800` con actualización de optimizador 224. La exportación nativa completó 28 generaciones de benchmark/narrativa sin fallos de ejecución y con tres hits de límite de presupuesto de salida; el diagnóstico GSM8K de 12 ítems obtuvo 12/12. El propio autor advierte que estas pruebas pequeñas no establecen retención amplia de capacidades ni garantizan la eliminación de puntuación no deseada, y que el comportamiento multimodal no fue evaluado por esta suite.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Ministral 3.
- Procesamiento de entradas imagen-texto: conserva los módulos de visión y el proyector multimodal del base.
- Ajuste de estilo orientado a reducir asteriscos y guiones em en las respuestas.
- Razonamiento matemático básico verificado en un diagnóstico interno (GSM8K 12/12, muestra muy pequeña).
- Uso previsto con el tokenizador, processor y plantilla de chat nativos incluidos en el paquete.
- Carga directa con `AutoModelForImageTextToText.from_pretrained` y `dtype=torch.bfloat16`, sin necesidad de cargar adaptadores PEFT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Normalización de estilo en asistentes conversacionales: el ajuste está diseñado para reducir asteriscos y guiones em, por lo que encaja en pipelines donde se exige un formato de salida limpio (por ejemplo, respuestas para TTS o para interfaces que renderizan Markdown de forma estricta). La eficacia no está garantizada según el propio autor.
- Generación de texto con entrada de imagen: al conservar visión y proyector multimodal, puede emplearse para descripción de imágenes, extracción de información de capturas o documentos escaneados, siempre que se valide el rendimiento multimodal, que no fue evaluado.
- Prototipado rápido en local con GGUF: al estar empaquetado en GGUF, puede desplegarse con runtimes de inferencia local para experimentación y pruebas de integración sin infraestructura dedicada.
- Evaluación comparativa de técnicas de alineación: sirve como caso de estudio reproducible (lineage, checksums, EXPORT.json) para investigadores que analizan merges LoRA e IPO sobre modelos multimodales.
- Generación de documentación técnica con formato controlado: útil en entornos donde se penaliza el uso de guiones em o asteriscos en textos publicados, previa validación de calidad.
- Diagnósticos de matemáticas elementales: el modelo superó un test interno de GSM8K de 12 ítems, por lo que puede usarse como base para experimentos de razonamiento aritmético de baja complejidad, con cautela por el tamaño reducido de la muestra.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K (diagnóstico interno, 12 ítems) | 12/12 | Muestra muy pequeña; no representativa |
| Generaciones benchmark/narrativa (28 ítems) | 28 completadas, 0 fallos, 3 hits de límite de presupuesto | Suite interna de exportación, no benchmark estándar |
| MMLU, HumanEval, otros benchmarks públicos | no disponible | No publicados en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 14B en GGUF, las necesidades dependen del nivel de cuantización elegido, que no se detalla en el repositorio.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del nivel GGUF seleccionado y de la memoria disponible.
- Opciones de despliegue: runtimes compatibles con GGUF (por ejemplo llama.cpp u Ollama) y carga nativa con Transformers mediante `AutoModelForImageTextToText` en bfloat16; vLLM y TGI no confirmados para esta exportación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| schonsense/emdasterisk_go_home_14B-GGUF | 14B (según nombre) | no disponible | Sí (visión conservada) | Apache 2.0 | GGUF |
| Ministral 3 (modelo base de la familia) | 14B (según nombre) | no disponible | Sí | no disponible en esta ficha | no disponible |
| Mistral Small / Mistral NeMo (alternativas de la familia) | 12B–22B | no disponible | No en todas las variantes | Apache 2.0 | safetensors, GGUF |

La comparación con alternativas concretas de la misma categoría (mismo tamaño y tarea) no está disponible en la información proporcionada; los datos del modelo base Ministral 3 tampoco se detallan en la model card más allá de la revisión y los componentes conservados.

## Limitaciones y advertencias

- El objetivo del ajuste (eliminar asteriscos y guiones em) no está garantizado según el propio autor; puede producirse deriva de estilo parcial o inconsistente.
- Las pruebas realizadas son diagnósticos internos pequeños (12 ítems de GSM8K, 28 generaciones) que no establecen retención amplia de capacidades.
- El comportamiento multimodal no fue evaluado por la suite del autor; no hay garantía de que visión y proyector funcionen como en el base.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados; se heredan las características del modelo base, no detalladas aquí.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del base (`BASE_MODEL_CARD.md`) por condiciones adicionales.
- El repositorio tiene cero descargas y cero likes, y no incluye ejemplos de entrenamiento ni prompts de evaluación privados; la reproducibilidad depende de los artefactos de procedencia incluidos.
- El nombre del modelo base aparece con dos grafías distintas en los metadatos (`emdastrisk_go_home_14B` y `emdasterisk_go_home_14B`), lo que puede causar confusión en la resolución de dependencias.
- No hay información sobre longitud de contexto, cuantizaciones disponibles ni rendimiento en producción; validar antes de cualquier despliegue real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/schonsense/emdasterisk_go_home_14B-GGUF
- Modelo base referenciado: https://huggingface.co/schonsense/emdastrisk_go_home_14B
- Artefactos de procedencia mencionados en la model card: `TRAINING_LINEAGE.json`, `EXPORT.json`, `BASE_MODEL_CARD.md` (incluidos en el repositorio)
- Revisión base declarada: `3cea74c1ebaf5ce5f5a2553de470e2ceab825142`
- Run de entrenamiento: `production-dp-20261109T071800`, optimizer update 224
- Papers, blogs, demos o repositorios adicionales: no disponible en la información proporcionada.
