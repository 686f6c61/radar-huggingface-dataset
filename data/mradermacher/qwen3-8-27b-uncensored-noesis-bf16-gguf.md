# mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF del modelo `AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16`, realizada por mradermacher. Se trata de un modelo de 27.320 millones de parámetros (aproximadamente 27,3B) basado en la familia Qwen 3.8, con un enfoque "uncensored" (abliterated), es decir, modificado para eliminar los rechazos típicos de los modelos de seguridad. La cuantización en formato GGUF permite ejecutar el modelo en hardware local con herramientas como llama.cpp u Ollama, reduciendo los requisitos de VRAM frente a los pesos en BF16 originales.

El modelo base incorpora etiquetas como `noesis`, `noesis-repack`, `qwen3_5`, `qwen3_8`, `bf16` y `mtp`, lo que sugiere una variante con predicción multi-token (MTP) y posiblemente capacidades multimodales, aunque no se dispone de documentación detallada en esta ficha. La licencia declarada es Apache 2.0, y el idioma soportado es el inglés. Este tipo de modelos resulta relevante para investigadores que necesitan evaluar comportamientos sin restricciones de seguridad en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Qwen 3.8) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el blog de orcarouter menciona 262K para el modelo base Qwen3.8-27B-Uncensored, pero no se confirma para esta variante NOESIS) |
| Tipos de cuantizacion | Q2_K (11,0 GB), Q4_K_S (15,9 GB), mmproj-Q8_0 (0,7 GB), mmproj-f16 (1,0 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16`. Por el nombre y las etiquetas, se infiere que se trata de un transformer de la familia Qwen 3.8, posiblemente con predicción multi-token (MTP) y soporte multimodal (los archivos `mmproj` sugieren un proyector de visión). El proceso de "uncensoring" (abliteration) implica la eliminación de capas o pesos relacionados con la seguridad, lo que reduce los rechazos a peticiones consideradas peligrosas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue realizada por mradermacher mediante conversión estática de los pesos BF16, sin usar imatrix (según la model card).

## Capacidades

- Generación de texto sin restricciones de contenido: al ser un modelo "uncensored", no debería rechazar peticiones sobre temas sensibles, aunque no se garantiza la calidad ni la seguridad del contenido generado.
- Posible soporte multimodal: la presencia de archivos `mmproj` (Q8_0 y f16) sugiere que el modelo puede procesar imágenes, aunque no se confirma su funcionamiento en esta variante.
- Predicción multi-token (MTP): la etiqueta `mtp` indica que el modelo podría predecir varios tokens a la vez, lo que puede mejorar la velocidad de inferencia, pero no se dispone de detalles técnicos.
- Idioma inglés: el modelo está entrenado principalmente en inglés, según la etiqueta `en`.
- Compatibilidad con herramientas de inferencia local: al estar en formato GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio y otros motores compatibles.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin restricciones de seguridad, útil para analizar sesgos, alucinaciones o la efectividad de técnicas de abliteration.
- Generación de texto creativo sin filtros: escritores o guionistas pueden explorar narrativas que otros modelos rechazarían, aunque deben asumir la responsabilidad del contenido.
- Evaluación de cuantizaciones: los desarrolladores pueden comparar el rendimiento de Q2_K y Q4_K_S en tareas específicas para decidir el equilibrio entre calidad y uso de VRAM.
- Pruebas de integración con llama.cpp: al ser un GGUF estándar, sirve para validar pipelines de inferencia local, incluyendo el uso de archivos `mmproj` para pruebas multimodales.
- Desarrollo de agentes conversacionales sin censura: en entornos de investigación controlados, se puede usar como backend para chatbots que requieran respuestas sin rechazos, aunque con supervisión humana.
- Benchmarking de hardware: los distintos tamaños de cuantización permiten medir el rendimiento (tokens por segundo) en GPUs de diferentes capacidades, desde 11 GB hasta 16 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su variante base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q2_K ocupa 11,0 GB y el Q4_K_S 15,9 GB. Para ejecutar el modelo completo en memoria, se recomienda una GPU con al menos 12 GB (para Q2_K) o 16 GB (para Q4_K_S), considerando además el overhead del runtime.
- GPUs recomendadas: RTX 3060 12 GB (Q2_K), RTX 4070 Ti 12 GB (Q2_K), RTX 4080 16 GB (Q4_K_S), RTX 4090 24 GB (Q4_K_S con margen), o GPUs de datacenter como A10G o A100.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con 12-16 GB de VRAM, siempre que se use la cuantización adecuada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y el número de tokens generados. En una RTX 4090, un modelo de 27B en Q4_K_S suele alcanzar entre 20 y 40 tokens por segundo, pero no se dispone de mediciones específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Existen otras cuantizaciones de mradermacher sobre la misma familia, como `Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-GGUF` o `Qwen-3.8-27B-Uncensored-i1-GGUF`, pero no se conocen sus especificaciones exactas. El modelo base sin cuantizar (`AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16`) ocuparía aproximadamente 54 GB en BF16, por lo que esta versión GGUF reduce significativamente los requisitos de almacenamiento y VRAM. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo "uncensored", puede generar texto ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos de investigación con supervisión humana.
- Sesgos y alucinaciones: no se han evaluado los sesgos específicos de esta variante, pero es probable que herede los del modelo base Qwen, que pueden incluir estereotipos o información factual incorrecta.
- Contexto no confirmado: aunque el blog de orcarouter menciona 262K tokens para el modelo Qwen3.8-27B-Uncensored, no se ha verificado que esta variante NOESIS mantenga esa longitud de contexto. Se recomienda probar con ventanas cortas.
- Licencia y uso comercial: la licencia declarada es Apache 2.0, pero el blog de orcarouter indica que el modelo base está restringido a "research-only". Esta discrepancia debe aclararse con el autor del modelo base antes de un uso comercial.
- Calidad de la cuantización: los quants Q2_K y Q4_K_S son de baja y media precisión respectivamente; pueden degradar la calidad del texto generado en comparación con BF16. No se han publicado métricas de perplejidad para estos archivos.
- Sin soporte técnico: el repositorio es una cuantización comunitaria sin mantenimiento activo; los problemas deben reportarse en los foros de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-NOESIS-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16
- Blog de orcarouter sobre Qwen3.8-27B Uncensored GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Blog de orcarouter sobre ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
