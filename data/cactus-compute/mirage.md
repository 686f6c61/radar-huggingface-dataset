# Cactus-Compute/mirage

## Resumen

Mirage es un modelo de visión-lenguaje desarrollado por Cactus-Compute, orientado a la comprensión de imágenes y a la extracción estructurada de información a partir de ellas. Se distribuye a través de Hugging Face con el pipeline `image-text-to-text` y la librería propia `cactus-compute`, e incluye pesos en formato `safetensors` junto con un artefacto propietario `mirage.cact` que consume el motor de inferencia de Cactus.

El modelo cubre un abanico amplio de tareas de visión por computador: descripción de escenas, detección de objetos (incluida detección zero-shot), segmentación de imágenes, clasificación de imágenes (también zero-shot), respuesta visual a preguntas (VQA), respuesta a preguntas sobre documentos (document QA) y razonamiento sobre relaciones espaciales. Está pensado tanto para uso interactivo como para pipelines de extracción de datos estructurados.

Es relevante en el ecosistema open source porque combina licencia Apache 2.0 con un conjunto de capacidades multimodal amplio y un empaquetado orientado a despliegue ligero mediante el runtime de Cactus. El repositorio ocupa aproximadamente 0,9 GB y acumula más de 35.000 descargas y 416 likes en el momento de la consulta. La información pública disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y artefacto propietario `mirage.cact` |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atención, componente visual, etc.) en la información disponible. El repositorio incluye un archivo `mirage.safetensors`, lo que sugiere pesos en formato estándar, junto con `mirage.cact`, un artefacto específico del runtime de Cactus empleado para la inferencia optimizada en el ecosistema del autor.

Tampoco hay datos públicos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El tamaño del repositorio (0,9 GB) es compatible con un modelo compacto, pero no permite inferir el número de parámetros con fiabilidad. La model card se centra en las capacidades funcionales (detección, segmentación, OCR, relaciones espaciales) más que en los detalles de entrenamiento.

## Capacidades

- Generación de descripciones de imágenes y escenas en lenguaje natural.
- Detección de objetos, incluida detección zero-shot sin entrenamiento específico por clase.
- Segmentación de imágenes.
- Clasificación de imágenes, tanto estándar como zero-shot.
- Respuesta visual a preguntas (VQA) sobre el contenido de una imagen.
- Respuesta a preguntas sobre documentos (document QA), con soporte implícito de OCR según la model card.
- Razonamiento sobre relaciones espaciales entre objetos de una escena.
- Extracción estructurada de información a partir de imágenes.
- Soporte multilingüe declarado para inglés, alemán, francés, español, italiano, neerlandés y polaco.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Extracción de datos de documentos: el modelo puede responder preguntas sobre el contenido de facturas, formularios o informes escaneados, lo que lo hace útil en pipelines de digitalización y contabilidad automatizada.
- Moderación y análisis de contenido visual: la clasificación de imágenes y la detección de objetos permiten construir filtros automáticos para plataformas que reciben grandes volúmenes de imágenes.
- Accesibilidad: la descripción de escenas en varios idiomas europeos facilita la generación de texto alternativo y la narración de imágenes para usuarios con discapacidad visual.
- Comercio electrónico: la clasificación zero-shot permite etiquetar automáticamente productos por categoría sin reentrenar el modelo para cada nuevo catálogo.
- Análisis de imágenes industriales o de seguridad: la detección y segmentación de objetos sirve para inspección visual y control de calidad en líneas de producción.
- Búsqueda visual y organización de archivos: la combinación de clasificación y descripción permite indexar bibliotecas de imágenes por contenido semántico.
- Asistentes conversacionales multimodales: el soporte VQA permite integrar el modelo en asistentes que responden preguntas sobre imágenes enviadas por el usuario, con cobertura en siete idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (0,9 GB) sugiere que el modelo podría caber en GPUs de consumo, pero no se confirma oficialmente.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio es compatible con GPUs con 8 GB o más de VRAM, aunque es una estimación no verificada.
- Opciones de despliegue: el modelo está diseñado para el runtime de Cactus (`pip install -U cactus-compute`), que descarga y cachea el motor y los pesos en el primer uso. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa fiable con alternativas como Qwen2-VL, InternVL o Llama 3.2 Vision. La comparación cualitativa se limita a la licencia y al ecosistema de despliegue:

| Modelo | Licencia | Contexto | Enfoque | Despliegue |
|---|---|---|---|---|
| Mirage (Cactus-Compute) | Apache 2.0 | no disponible | VLM con detección, segmentación y document QA | Runtime propio `cactus-compute` |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un VLM entrenado sobre datos no documentados, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinación en descripciones y en document QA, especialmente con imágenes de baja calidad o documentos manuscritos.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de documentos extensos o conversaciones multi-turno largas.
- El soporte multilingüe se declara para siete idiomas, pero no se especifica el nivel de rendimiento por idioma; el español está incluido, aunque sin métricas públicas.
- El despliegue depende del runtime propietario de Cactus; no hay confirmación de compatibilidad con ecosistemas estándar como transformers, vLLM o llama.cpp, lo que puede limitar la portabilidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del runtime `cactus-compute` por separado de la licencia de los pesos.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para flujos que requieran invocación de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cactus-Compute/mirage
- Blog con detalles y playground: https://cactuscompute.com/blog/mirage
- Documentación de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Binarios del runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
- Código fuente: https://github.com/cactus-compute/cactus
