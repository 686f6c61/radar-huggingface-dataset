# keystats/Legend_ocr_v2

## Resumen

Legend_ocr_v2 es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario keystats en HuggingFace. Se distribuye en formato safetensors bajo la librería transformers y su recuento real de parámetros, extraído de los pesos, es de 8.292.166.656 (aproximadamente 8,29 mil millones). El repositorio ocupa 16,6 GB, un tamaño coherente con pesos en precisión de 16 bits para ese número de parámetros.

La etiqueta de arquitectura declarada en el Hub es `qwen2_5_vl`, lo que indica que el modelo parte de la familia Qwen2.5-VL, un transformer multimodal con torre de visión y decodificador de lenguaje. El pipeline asignado es `image-text-to-text`, es decir, admite imágenes como entrada y produce texto. El nombre del repositorio sugiere una especialización en reconocimiento óptico de caracteres (OCR), aunque la model card no confirma esta finalidad.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card publicada es la plantilla automática de HuggingFace y no contiene información rellenada por el autor. No hay licencia declarada, no hay idiomas declarados, no hay datos de entrenamiento, no hay benchmarks y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluación en producción debería partir de una validación empírica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen2_5_vl (etiqueta declarada en el Hub); transformer multimodal con torre de visión, según la arquitectura base referenciada |
| Parámetros totales | 8.292.166.656 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (la model card no la declara; la arquitectura base Qwen2.5-VL emplea 32.768 tokens nativos, dato no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 16,6 GB |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura es la etiqueta `qwen2_5_vl` incluida en los tags del repositorio. Esto sitúa al modelo en la familia Qwen2.5-VL, caracterizada por un decodificador transformer con atención causal, una torre de visión basada en ViT con fusión de parches y capacidades de grounding espacial y temporal. El recuento de 8,29 mil millones de parámetros es compatible con un checkpoint de escala 7B de esa familia sumando el codificador visual, pero no hay confirmación explícita en la model card.

No hay ningún dato publicado sobre el proceso de entrenamiento: se desconoce el número de tokens utilizados, la composición del dataset, si hubo ajuste por instrucciones, RLHF, DPO u otra técnica de alineamiento, y si se aplicaron estrategias como decodificación especulativa o atención lineal. La model card es la plantilla vacía generada automáticamente por HuggingFace, con todos los campos marcados como `[More Information Needed]`. El nombre Legend_ocr_v2 apunta a un ajuste fino orientado a OCR o extracción de texto en imágenes, pero es una inferencia a partir del nombre, no un dato documentado.

## Capacidades

- Generación de texto a partir de imágenes: el pipeline declarado (`image-text-to-text`) implica entrada visual y salida textual.
- Procesamiento de documentos e imágenes con texto: presumiblemente orientado a OCR, según el nombre del modelo; sin confirmación documental.
- Conversación multimodal: la etiqueta `conversational` está presente en los tags del Hub.
- Compatibilidad con text-generation-inference y endpoints compatibles: los tags `text-generation-inference` y `endpoints_compatible` indican que el modelo puede desplegarse con ese stack.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, vídeo): no disponible.

Dado que la model card no documenta ninguna de estas capacidades, deben verificarse empíricamente antes de asumirlas.

## Casos de uso

- Digitalización de documentos con OCR: extracción de texto de facturas, contratos y formularios escaneados, aprovechando la torre de visión y el pipeline imagen-texto. Adecuado por el nombre y la arquitectura, pero requiere validación previa de precisión.
- Extracción estructurada de datos en pipelines de back office: convertir PDFs e imágenes en JSON o tablas mediante prompting, integrándolo en un flujo ETL. El formato safetensors permite cargarlo directamente con transformers.
- Automatización de lectura de tickets y albaranes: transcripción y clasificación de documentos comerciales en un sistema de gestión. Requiere cuantización previa para ejecución en GPU de gama media.
- Accesibilidad: descripción y lectura en voz alta del contenido de imágenes para usuarios con discapacidad visual, siempre que se añada una capa de TTS posterior.
- Moderación de contenido visual: análisis de imágenes subidas por usuarios para detectar texto no permitido o marcas de agua. La idoneidad depende de que el ajuste OCR no haya degradado las capacidades generales del modelo base.
- Preprocesado para sistemas RAG multimodales: convertir documentos escaneados en texto indexable antes de la fase de recuperación, combinándolo con un motor de embeddings.
- Asistencia en investigación documental: digitalización masiva de archivos históricos o científicos con texto en imagen, con revisión humana posterior dada la ausencia de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación completada y no hay resultados de MMLU, HumanEval, GSM8K, DocVQA, TextVQA ni de ninguna otra prueba en los datos proporcionados. No se deben extrapolar cifras del modelo base sin verificarlas, ya que el ajuste fino puede alterar el comportamiento de forma sustancial.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16,6 GB de pesos más memoria para el activaciones y el caché KV; se recomienda un mínimo de 20-24 GB para secuencias largas.
- VRAM estimada en int8: aproximadamente 8-9 GB de pesos, con margen adicional para el contexto.
- VRAM estimada en int4: aproximadamente 5-6 GB de pesos, aunque la cuantización de modelos multimodales requiere cuidado con la torre de visión.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 sin problemas de capacidad.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en fp16 con contexto moderado; una RTX 3090 (24 GB) o 4080 (16 GB) requerirían cuantización para ajustar el uso de memoria.
- Despliegue: compatible con transformers, text-generation-inference y endpoints compatibles según los tags. La ausencia de pesos GGUF limita el uso directo en llama.cpp u Ollama salvo que se genere la conversión manualmente.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo de prefill.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para Legend_ocr_v2, por lo que la comparativa se limita a características estructurales de referencia. Las cifras de los modelos alternativos proceden de sus respectivas documentaciones públicas y deberían verificarse antes de usarse como base de decisión.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keystats/Legend_ocr_v2 | 8,29 B | no disponible | no disponible | HuggingFace, safetensors |
| Qwen2.5-VL-7B (modelo base de referencia) | ~8,3 B (incluye torre de visión) | 32.768 tokens nativos, extensible | Apache 2.0 | HuggingFace, safetensors |
| InternVL2.5-8B | ~8 B | 32.768 tokens aproximadamente | MIT | HuggingFace, safetensors |
| Llama-3.2-11B-Vision | 11 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors |

La ventaja potencial de Legend_ocr_v2 sería una especialización en OCR sobre un modelo base ya capaz; su desventaja objetiva es la falta total de documentación, licencia y métricas, frente a alternativas con licencias claras y evaluaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial entra en zona legal ambigua. No se debe asumir que hereda la licencia Apache 2.0 del modelo base sin confirmación del autor.
- Model card vacía: todos los campos están sin rellenar, incluidos datos de entrenamiento, sesgos, riesgos y procedencia del ajuste fino.
- Sin métricas: no hay ninguna evaluación publicada, ni propia ni comparativa. El rendimiento real es desconocido.
- Riesgo de alucinación: los modelos de visión-lenguaje pueden inventar texto que no aparece en la imagen, un fallo especialmente crítico en tareas de OCR y extracción de datos. Requiere verificación humana o un mecanismo automático de validación.
- Sesgos: no documentados. Se heredarían los sesgos del dataset de ajuste y del modelo base, que tampoco se especifican.
- Idiomas: no declarados. Un ajuste orientado a OCR suele degradar el rendimiento en idiomas poco representados en los datos de ajuste.
- Contexto: desconocido. La ventana efectiva puede ser menor que la del modelo base si el ajuste se hizo con secuencias cortas.
- Reproducibilidad: sin información de hiperparámetros, hardware ni datos, no es posible reproducir el entrenamiento ni auditar el checkpoint.
- Adopción nula: 0 descargas y 0 likes, sin historial de uso que permita anticipar problemas en producción.
- Formato único: solo safetensors, sin GGUF ni cuantizaciones listas, lo que obliga a trabajo adicional para despliegues ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Legend_ocr_v2
- Referencia de la arquitectura base declarada en los tags: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
- Artículo citado en la plantilla de la model card (calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700

No se han encontrado papers, blogs, repositorios ni demos específicos de este modelo en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
