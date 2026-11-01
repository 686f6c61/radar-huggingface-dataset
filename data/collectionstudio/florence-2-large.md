# CollectionStudio/Florence-2-large

## Resumen
Florence-2-large es un modelo fundacional de visión desarrollado originalmente por Microsoft Research, distribuido en este repositorio por CollectionStudio como una versión de preentrenamiento continuado. Se trata de un modelo secuencia-a-secuencia de 0,77 mil millones de parámetros que unifica tareas de visión y visión-lenguaje bajo una única interfaz basada en prompts de texto: subtitulado, detección de objetos, segmentación, OCR o grounding de frases, entre otras. La arquitectura combina un encoder visual (DaViT) con un encoder-decoder transformer que genera las salidas como texto estructurado.

La relevancia de esta variante concreta radica en dos modificaciones respecto al modelo original de Microsoft: se ha extendido la longitud de contexto hasta 4096 tokens y se ha reformateado la tarea de OCR introduciendo un separador de línea (`\n`). Para ello se han utilizado 0,1 mil millones de muestras adicionales en un proceso de preentrenamiento continuado. El autor advierte explícitamente en la model card de que este entrenamiento adicional puede no haber convergido de forma óptima.

El modelo mantiene la licencia MIT del original y se distribuye en formato safetensors con código personalizado (`trust_remote_code=True`), lo que exige revisar el código remoto antes de desplegarlo en producción. Con 776,7 millones de parámetros y un repositorio de 3,1 GB, es un modelo ligero que cabe en GPUs de consumo, orientado a pipelines de análisis de imagen y automatización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con encoder visual DaViT (según paper original); secuencia-a-secuencia multimodal |
| Parametros totales | 776.721.497 (0,77B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (versión de preentrenamiento continuado) |
| Tipos de cuantizacion | No disponible en la información proporcionada (entrenado en float16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento
Florence-2 emplea una arquitectura secuencia-a-secuencia que trata todas las tareas de visión como problemas de generación de texto: la imagen se procesa mediante un encoder visual y el decoder genera secuencias de tokens que codifican coordenadas de bounding boxes, etiquetas o descripciones, que posteriormente se posprocesan con `post_process_generation`. Esta unificación permite cubrir decenas de tareas con un solo conjunto de pesos cambiando únicamente el prompt (por ejemplo `<OD>`, `<CAPTION>` o `<OCR>`).

El modelo original se entrenó sobre FLD-5B, un dataset con 5.400 millones de anotaciones procedentes de 126 millones de imágenes. Esta variante concreta parte de esos pesos y aplica un preentrenamiento continuado con 0,1 mil millones de muestras adicionales, ampliando el contexto a 4096 tokens y modificando el formato de salida de OCR para incluir saltos de línea. La model card no detalla la composición exacta de ese dataset adicional, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor reporta un AP de 39,8 en detección de objetos sobre COCO para esta versión.

## Capacidades
- Generación de subtítulos en tres niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Detección de objetos con coordenadas de bounding boxes mediante el prompt `<OD>`.
- Grounding de frases: localización de regiones descritas en un texto de entrada (`<CAPTION_TO_PHRASE_GROUNDING>`).
- Subtitulado denso por regiones (`<DENSE_REGION_CAPTION>`), que combina detección y descripción.
- Segmentación guiada por texto, con salida de máscaras asociadas a las regiones detectadas.
- OCR con separador de línea (`\n`) incorporado en esta variante, lo que facilita la reconstrucción de texto estructurado.
- Ejecución de tareas zero-shot y ajuste fino posterior sobre dominios específicos.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso; es un modelo puramente visón-lenguaje de una sola pasada.

## Casos de uso
- Digitalización de documentos: el prompt de OCR con separador de línea permite extraer texto de facturas, albaranes o formularios manteniendo la estructura de párrafos, lo que simplifica el posprocesado con expresiones regulares o parsers posteriores.
- Moderación y análisis de contenido visual: la detección de objetos (`<OD>`) y el subtitulado detallado permiten etiquetar automáticamente imágenes subidas por usuarios y aplicar políticas de contenido sin intervención humana.
- Accesibilidad: generación de descripciones alternativas detalladas para imágenes en sitios web o aplicaciones, usando `<MORE_DETAILED_CAPTION>` para obtener texto suficientemente rico para lectores de pantalla.
- Análisis de imágenes industriales o de retail: localización de productos, defectos o elementos en estanterías mediante detección de objetos y grounding de frases, con salida en coordenadas directamente consumible por sistemas de inventario.
- Automatización de anotación de datasets: uso del modelo como preetiquetador para generar bounding boxes y descripciones iniciales que luego revisan anotadores humanos, reduciendo el coste de construcción de datasets de visión.
- Búsqueda visual por descripción: combinación de `<CAPTION_TO_PHRASE_GROUNDING>` con un índice de imágenes para localizar objetos descritos en lenguaje natural dentro de un catálogo o archivo fotográfico.
- Extracción de información en pipelines RAG multimodales: conversión de imágenes en texto estructurado (subtítulos, regiones, OCR) que después se indexa en un motor de búsqueda vectorial.

## Benchmarks y rendimiento
La única métrica publicada en la información disponible es el AP de detección de objetos sobre COCO reportado por el autor para esta variante:

| Benchmark | Metrica | Resultado |
|---|---|---|
| COCO (object detection) | AP | 39,8 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de las tareas específicas de Florence-2 (captioning, OCR, grounding) para esta variante concreta. El paper original (arXiv:2311.06242) contiene los resultados del modelo base de Microsoft, pero no de este preentrenamiento continuado.

## Requisitos de hardware
- VRAM estimada en float16: aproximadamente 1,6 GB solo para pesos, más el overhead de activaciones y del encoder visual; en la práctica, entre 3 y 4 GB para inferencia con imágenes de resolución estándar.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. También funciona en CPU con `torch.float32`, aunque con latencia mucho mayor.
- GPUs de datacenter (A100, H100, L40S) sobredimensionadas para un solo modelo, pero útiles para servir muchas peticiones en paralelo con batching.
- Despliegue mediante `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`; el uso de vLLM, llama.cpp, Ollama o TGI no está documentado en la información disponible y requeriría verificar la compatibilidad del código personalizado.
- No se dispone de cifras de latencia o throughput publicadas. Con `num_beams=3` y hasta 4096 tokens nuevos, la generación es secuencial y el coste crece con la longitud de la salida; para producción conviene limitar `max_new_tokens` al tamaño esperado de cada tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/Florence-2-large (esta ficha) | 0,77B | 4096 | Subtitulado, OD, segmentación, OCR, grounding | MIT | HuggingFace |
| microsoft/Florence-2-large | 0,77B | No disponible en la información | Mismas tareas, OCR sin separador de línea | MIT | HuggingFace |
| microsoft/Florence-2-base-ft | 0,23B | No disponible en la información | Mismas tareas, ajustado en downstream | MIT | HuggingFace |
| microsoft/Florence-2-large-ft | 0,77B | No disponible en la información | Mismas tareas, ajustado en downstream | MIT | HuggingFace |

La comparación se limita a la familia Florence-2 porque la información proporcionada no incluye datos de benchmarks de alternativas de otros autores. Frente a `microsoft/Florence-2-large`, esta variante añade contexto de 4096 tokens y OCR con saltos de línea, a costa de un preentrenamiento continuado que el propio autor califica como potencialmente insuficiente. Frente a las versiones `-ft`, esta variante no está ajustada específicamente en tareas downstream, por lo que puede requerir fine-tuning para dominios muy especializados.

## Limitaciones y advertencias
- El autor advierte que el preentrenamiento continuado usó solo 0,1B muestras y que el modelo "might not be trained well"; no debe asumirse paridad de calidad con el Florence-2-large original en todas las tareas.
- El cambio de formato en OCR (separador `\n`) puede romper pipelines existentes que esperen el formato original sin saltos de línea.
- Riesgo de alucinación en subtitulado y descripción de regiones: el modelo puede generar etiquetas o textos plausibles pero incorrectos, especialmente con imágenes ambiguas o de baja calidad.
- No se documentan los idiomas soportados; el OCR y los subtítulos están entrenados mayoritariamente en inglés según el paper original, por lo que el rendimiento en castellano no está garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; es imprescindible auditar dicho código antes de usarlo en entornos de producción o con datos sensibles.
- La licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright y verificar que el código personalizado incluido en el repositorio cumple también con dicha licencia.
- No dispone de tool calling ni de razonamiento multi-paso; no es adecuado como sustituto de un LLM generalista en tareas conversacionales o de agente.
- El repositorio tiene muy pocas descargas (26) y ningún "like" en el momento de la consulta, lo que reduce la validación comunitaria sobre su robustez.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/CollectionStudio/Florence-2-large
- Modelo original de Microsoft: https://huggingface.co/microsoft/Florence-2-large
- Paper técnico (arXiv:2311.06242): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia MIT referenciada: https://huggingface.co/microsoft/Florence-2-large/resolve/main/LICENSE
