# CollectionStudio/Florence-2-base-ft

## Resumen

Florence-2-base-ft es un modelo vision-language desarrollado originalmente por Microsoft Research que emplea un enfoque basado en prompts para resolver de forma unificada tareas de visión y visión-lenguaje: captioning, detección de objetos, segmentación, grounding y reconocimiento óptico de caracteres, entre otras. Esta ficha concreta corresponde a una réplica alojada por el usuario CollectionStudio bajo el identificador `CollectionStudio/Florence-2-base-ft`, que reproduce los pesos del modelo finetuneado de Microsoft (`microsoft/Florence-2-base-ft`) en formato `safetensors` para su uso con `transformers`.

El modelo emplea una arquitectura secuencia-a-secuencia con un encoder visual y un decoder de lenguaje, con un total de 231.567.705 parámetros (aproximadamente 0,23 B), lo que lo sitúa en la gama ligera dentro de los modelos fundacionales de visión. Su relevancia actual radica en que ofrece un rendimiento competitivo en tareas visuales con un coste computacional muy bajo, lo que permite desplegarlo en GPUs de consumo y en entornos con restricciones de memoria.

La versión `-ft` está afinada sobre una colección de tareas downstream, lo que la hace directamente utilizable en producción sin necesidad de un ajuste adicional para las tareas cubiertas. La licencia MIT facilita su adopción comercial, aunque conviene revisar las condiciones del modelo original de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (encoder visual + decoder de lenguaje), implementación `transformers` con código remoto |
| Parametros totales | 231.567.705 (0,23 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

Florence-2 sigue una arquitectura secuencia-a-secuencia en la que la imagen se procesa mediante un encoder visual y la salida se genera con un decoder autorregresivo de lenguaje. El modelo se entrena de forma multi-tarea: cada tarea se formula como una secuencia texto-a-texto condicionada por la imagen y un prompt de tarea (por ejemplo `<OD>`, `<CAPTION>` o `<DENSE_REGION_CAPTION>`), de modo que un único conjunto de pesos resuelve tareas heterogéneas sin cabezas específicas. Según la model card, el preentrenamiento se apoya en el dataset FLD-5B, con 5.400 millones de anotaciones sobre 126 millones de imágenes.

La variante `-ft` parte del modelo preentrenado y se afina sobre una colección de tareas downstream, lo que mejora su comportamiento en los prompts predefinidos. Todos los modelos de la familia se entrenaron en float16. No se detalla en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset de afinamiento.

## Capacidades

- Generación de descripciones de imagen en tres niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Detección de objetos con etiquetas y cajas delimitadoras mediante el prompt `<OD>`.
- Grounding de frases sobre la imagen a partir de una caption proporcionada por el usuario (`<CAPTION_TO_PHRASE_GROUNDING>`).
- Descripción densa de regiones (`<DENSE_REGION_CAPTION>`) y propuesta de regiones (`<REGION_PROPOSAL>`).
- Segmentación y otras tareas visuales cubiertas por los prompts del modelo (la model card se trunca en la información disponible).
- Procesamiento multi-tarea con un único conjunto de pesos, sin cabezas específicas por tarea.
- Salida estructurada parseable mediante `processor.post_process_generation`, que devuelve cajas y etiquetas en formato diccionario.
- Soporte de decodificación con búsqueda por haces (`num_beams`) para mejorar la calidad de la generación.
- No se documenta soporte de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Etiquetado automático de imágenes en pipelines de datos: el modelo puede generar captions y cajas delimitadoras sobre lotes de imágenes para construir datasets de entrenamiento con anotaciones preliminares que luego se revisan manualmente.
- Moderación y análisis de contenido visual: la detección de objetos y el captioning detallado permiten clasificar imágenes por presencia de elementos concretos en flujos de subida de contenido.
- Accesibilidad: generación de descripciones alternativas de imágenes para lectores de pantalla, usando `<MORE_DETAILED_CAPTION>` para obtener textos ricos en matices.
- Comercio electrónico: extracción de atributos visuales de productos (tipo de objeto, color, contexto) mediante detección y captioning para enriquecer fichas de catálogo.
- Automatización de tareas de inspección: localización de objetos concretos en imágenes industriales o de inventario con `<OD>` y `<REGION_PROPOSAL>`, aprovechando el bajo coste de inferencia del modelo de 0,23 B.
- Búsqueda visual y grounding: dado un texto descriptivo, localizar las regiones correspondientes en la imagen con `<CAPTION_TO_PHRASE_GROUNDING>` para sistemas de búsqueda o anotación interactiva.
- Prototipado rápido en GPUs de consumo: al caber en memoria de tarjetas domésticas, sirve para validar ideas de producto visual antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en float16 para los 231,6 M de parámetros, más el overhead del encoder visual y de activaciones; en la práctica, un entorno de 2 a 4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo está claramente sobredimensionado para las dos últimas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales con 4 GB o más, e incluso en CPU con `torch.float32` para uso no interactivo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del modelo); no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y del número de haces empleados en la decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Florence-2-base-ft (esta ficha) | 0,23 B | no disponible | MIT | HuggingFace, `transformers` con código remoto |
| Florence-2-large-ft | 0,77 B | no disponible | MIT | HuggingFace, `transformers` con código remoto |
| Florence-2-base | 0,23 B | no disponible | MIT | HuggingFace, solo preentrenado |
| Florence-2-large | 0,77 B | no disponible | MIT | HuggingFace, solo preentrenado |

La comparativa se limita a la propia familia Florence-2, ya que la información proporcionada no incluye datos de rendimiento frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La model card del repositorio se trunca en la sección de tareas, por lo que la lista completa de capacidades y prompts no está disponible en esta ficha.
- No se han publicado resultados de benchmarks en la información disponible, lo que impide validar cuantitativamente su rendimiento frente a alternativas.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Al ser una réplica alojada por un tercero (CollectionStudio) y no el repositorio oficial de Microsoft, existe riesgo de divergencia con los pesos originales; se recomienda verificar la integridad y, en su caso, usar `microsoft/Florence-2-base-ft` como referencia.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto y debe validarse empíricamente.
- Riesgo de alucinación en captioning: las descripciones generadas pueden incluir objetos o atributos no presentes en la imagen, especialmente en escenas complejas o con oclusión.
- La licencia MIT del repositorio remite al LICENSE del modelo original de Microsoft; conviene revisar dicho fichero para confirmar las condiciones exactas de uso comercial.
- El tamaño reducido del modelo limita su precisión en tareas visuales finas (texto pequeño, objetos diminutos o escenas muy densas) frente a modelos de mayor escala.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/CollectionStudio/Florence-2-base-ft
- Modelo original de Microsoft: https://huggingface.co/microsoft/Florence-2-base-ft
- Modelo preentrenado base: https://huggingface.co/microsoft/Florence-2-base
- Modelo large: https://huggingface.co/microsoft/Florence-2-large
- Modelo large finetuneado: https://huggingface.co/microsoft/Florence-2-large-ft
- Informe técnico (arXiv): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia: https://huggingface.co/microsoft/Florence-2-base-ft/resolve/main/LICENSE
