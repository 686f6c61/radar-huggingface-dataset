# Smashinfries/pixai-tagger-v1.0-onnx-mobile

## Resumen

pixai-tagger-v1.0-onnx-mobile es una conversión a ONNX del modelo de etiquetado automático de imágenes (image tagging) pixai-tagger-v1.0, desarrollado originalmente por PixAI Labs y publicado por el usuario Smashinfries. El modelo resuelve la tarea de asignar etiquetas descriptivas (personajes, artistas, categorías, rating de contenido) a ilustraciones, principalmente de estilo anime. Esta versión concreta está optimizada para despliegue en dispositivos móviles: incluye el preprocesado integrado en el grafo ONNX y ofrece cuantizaciones FP16 y UINT8.

La relevancia de esta variante radica en su orientación a inferencia local en dispositivos con recursos limitados. Al aceptar directamente un array de bytes RGB (Uint8Array) como entrada y devolver las etiquetas, elimina la necesidad de implementar el pipeline de preprocesado por separado en la aplicación cliente. Fue creada específicamente para la aplicación WaifuTagger del proyecto KuzuLabz.

El repositorio ocupa 1,5 GB e incluye los pesos cuantizados, el fichero `tags.json` con el mapeo de etiquetas y el notebook de procesado. La licencia es Apache 2.0. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación/etiquetado de imágenes, base pixai-tagger-v1.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP16 y UINT8 (variantes mobile con preprocesado integrado) |
| Idiomas soportados | no disponible (las etiquetas son en inglés por convención del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 1,5 GB |
| Entrada | RGB como Uint8Array (variantes mobile) |
| Salida | Etiquetas con categoría y conteo (formato `tags.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base pixai-tagger-v1.0 (tipo de backbone, número de capas, dimensión de embeddings ni datos de entrenamiento). El modelo realiza una tarea de clasificación multietiqueta sobre imágenes: dado un RGB, produce un conjunto de etiquetas pertenecientes a las categorías definidas en `tags.json` (0 = general, 1 = artist, 3 = copyright, 4 = character, 5 = meta, 9 = rating).

La innovación de esta variante concreta es de ingeniería de despliegue, no de entrenamiento: las versiones `mobile` incorporan el preprocesado de imagen dentro del grafo ONNX, de modo que el consumidor solo debe pasar el buffer RGB crudo. El autor incluye el notebook de procesado empleado para generar las conversiones y cuantizaciones a partir de los modelos ONNX intermedios de Mexes.

## Capacidades

- Etiquetado automático de imágenes de ilustración, con salida clasificada por categoría (general, artista, copyright, personaje, meta y rating).
- Clasificación de rating de contenido (categoría 9), útil para filtrado o moderación de contenido.
- Identificación de personajes y franquicias (copyright) presentes en la imagen.
- Identificación de artistas o estilos asociados.
- Inferencia ONNX portable, ejecutable con ONNX Runtime en CPU, GPU o aceleradores móviles (NNAPI, Core ML) según el runtime.
- Preprocesado integrado en las variantes mobile: entrada directa de bytes RGB sin pipeline externo.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un modelo puramente discriminativo de visión.

## Casos de uso

- Etiquetado y organización de bibliotecas de ilustraciones: el modelo puede procesar lotes de imágenes y generar metadatos estructurados por categoría, facilitando la búsqueda y el filtrado en galerías personales o plataformas.
- Moderación de contenido en aplicaciones móviles: la categoría de rating permite clasificar imágenes por nivel de contenido directamente en el dispositivo, sin enviar datos a un servidor.
- Aplicaciones de tagging en el dispositivo (como WaifuTagger): al aceptar RGB crudo y estar cuantizado a UINT8, encaja en apps móviles con memoria y cómputo limitados.
- Autoetiquetado para entrenamiento de modelos generativos: las etiquetas de personaje, artista y general pueden reutilizarse como prompts o metadatos en pipelines de fine-tuning de modelos de difusión.
- Búsqueda semántica en bases de datos de imágenes: indexar imágenes por sus etiquetas predichas permite construir motores de búsqueda por personaje, franquicia o estilo.
- Filtrado previo en pipelines de datos: descartar o clasificar imágenes antes de procesos más costosos (captioning con VLM, generación de embeddings) según sus etiquetas y rating.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; las variantes UINT8 están pensadas para ejecución en CPU móvil y las FP16 para GPU/aceleradores con memoria moderada. El repositorio completo ocupa 1,5 GB, pero el peso de un único fichero cuantizado es menor.
- GPU recomendadas: no disponible. Al ser ONNX, puede ejecutarse en CPU, GPU NVIDIA vía CUDA/TensorRT, y aceleradores móviles (NNAPI en Android, Core ML en iOS) a través de ONNX Runtime.
- GPU de consumo: probablemente viable en cualquier GPU de consumo moderna con la variante UINT8 o FP16, dado el tamaño del repositorio; no hay datos oficiales de consumo de memoria por variante.
- Opciones de despliegue: ONNX Runtime (principal), con soporte de ejecución en Android, iOS, Web (onnxruntime-web) y escritorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Smashinfries/pixai-tagger-v1.0-onnx-mobile | Etiquetado de imágenes anime | ONNX | FP16, UINT8 | Apache 2.0 | Preprocesado integrado, orientado a móvil |
| Mexes/pixai-tagger-v1.0-onnx-fp32-fp16-int8 | Etiquetado de imágenes anime | ONNX | FP32, FP16, INT8 | no disponible | Sin preprocesado integrado |
| pixai-labs/pixai-tagger-v1.0 | Etiquetado de imágenes anime | no disponible | no disponible | no disponible | Modelo base original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo; al entrenarse presumiblemente con ilustraciones de estilo anime, su precisión fuera de ese dominio es desconocida.
- Riesgo de etiquetas incorrectas o incompletas en imágenes ambiguas, con posible impacto en moderación automática si se usa la categoría de rating sin revisión humana.
- Solo se documentan variantes cuantizadas (FP16, UINT8): la cuantización UINT8 puede degradar la precisión respecto al modelo original en FP32.
- No se especifican los idiomas de las etiquetas; por convención de los datasets de tagging suelen ser en inglés, lo que limita su uso directo en aplicaciones en castellano sin traducción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original y los intermedios de Mexes no tienen licencia declarada en la información disponible; conviene verificar la cadena de licencias antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad ni de mantenimiento continuado.
- Es un modelo discriminativo de visión: no genera texto ni mantiene conversaciones; no debe evaluarse como un LLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Smashinfries/pixai-tagger-v1.0-onnx-mobile
- Modelo base original: https://huggingface.co/pixai-labs/pixai-tagger-v1.0
- Modelos ONNX intermedios: https://huggingface.co/Mexes/pixai-tagger-v1.0-onnx-fp32-fp16-int8
- Aplicación WaifuTagger: https://github.com/KuzuLabz/WaifuTagger
