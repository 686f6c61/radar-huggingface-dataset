# kishormainali/marqo-nsfw-384

## Resumen

El modelo `kishormainali/marqo-nsfw-384` es un artefacto publicado en HuggingFace por el usuario kishormainali bajo licencia Apache 2.0. Por su identificador y sus etiquetas (`tflite`, `not-for-all-audiences`), se trata presumiblemente de un clasificador de contenido para adultos (NSFW) derivado o inspirado en la familia Marqo, exportado en formato TensorFlow Lite y con una resolución de entrada de 384 píxeles. No obstante, la model card publicada no contiene descripción, datos de entrenamiento, arquitectura ni métricas: únicamente declara la licencia.

La relevancia de este tipo de modelos radica en la necesidad habitual de filtrar imágenes no aptas para todos los públicos en plataformas de contenido generado por usuarios, pipelines de moderación o conjuntos de datos de entrenamiento. Sin embargo, la ausencia total de documentación técnica y la práctica inexistencia de tracción comunitaria (14 descargas, 0 likes, repositorio de 0.0 GB) hacen imposible verificar sus capacidades reales.

A efectos prácticos, esta ficha debe considerarse una descripción de un artefacto opaco: los datos disponibles no permiten confirmar arquitectura, parámetros, contexto ni rendimiento. Cualquier evaluación de producción requeriría inspeccionar los pesos y validarlos contra un conjunto de referencia propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente red neuronal convolucional o transformer de visión, no confirmado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada presumiblemente 384x384) |
| Tipos de cuantización | no disponible (formato TFLite, habitualmente con cuantización post-entrenamiento, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (según etiqueta del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. La etiqueta `tflite` indica que los pesos están exportados para TensorFlow Lite, lo que sugiere un uso orientado a inferencia en dispositivos con recursos limitados (móvil, edge, navegador mediante WebAssembly). El sufijo `384` en el nombre es compatible con una resolución de entrada de 384x384 píxeles, patrón habitual en clasificadores de imagen, pero no se confirma en la documentación.

Tampoco hay datos sobre el conjunto de entrenamiento, el número de imágenes, la composición del dataset, si hubo ajuste fino desde un backbone preentrenado (por ejemplo, un ViT o un modelo de la familia Marqo) ni si se aplicaron técnicas de aumento de datos o balanceo de clases. No se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, destilación) ni proceso de alineación.

## Capacidades

- Clasificación binaria o multietiqueta de imágenes en categorías relacionadas con contenido para adultos (NSFW), presumiblemente, aunque las etiquetas exactas no están documentadas.
- Inferencia en formato TensorFlow Lite, apta para despliegue en dispositivos móviles o entornos con recursos limitados.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de visión, no un LLM).
- No se documentan capacidades multilingües (no aplica a un clasificador de imagen, salvo etiquetas textuales).
- No se documentan modos especiales (thinking mode, visión, audio) más allá de la clasificación visual.

## Casos de uso

- Moderación de contenido en plataformas de usuario: el modelo podría integrarse como filtro previo en pipelines de subida de imágenes para marcar contenido no apto antes de la revisión humana, aprovechando su formato TFLite para ejecutarse en el backend o en el cliente.
- Filtrado de datasets de entrenamiento: útil para limpiar corpus de imágenes web antes de entrenar modelos generativos, descartando muestras NSFW; requiere validar la precisión del clasificador contra un conjunto etiquetado propio.
- Moderación en aplicaciones móviles: al estar en TFLite, puede ejecutarse on-device en Android o iOS para bloquear contenido antes de enviarlo al servidor, reduciendo costes de ancho de banda y mejorando la privacidad.
- Pre-filtro en sistemas de recomendación: descartar imágenes no aptas antes de calcular embeddings o puntuaciones de relevancia, evitando contaminar el índice.
- Cumplimiento normativo y seguridad infantil: capa adicional de detección en flujos de revisión, siempre acompañada de revisión humana y de otros clasificadores especializados, dado que un único modelo no es suficiente para garantías legales.
- Prototipado rápido en edge: gracias al formato TFLite y a la licencia permisiva, permite experimentar en dispositivos de bajo consumo sin depender de APIs externas; la falta de documentación obliga a medir precisión y latencia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el formato TFLite y el tamaño del repositorio (0.0 GB, posiblemente por metadatos incompletos), se espera un modelo pequeño, pero no se puede confirmar.
- GPU recomendadas: no disponible; un modelo TFLite de clasificación de imagen de 384x384 suele ejecutarse en CPU sin problema, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: presumiblemente sí (RTX 4090, RTX 3060, etc.) e incluso en CPU, pero no verificado.
- Opciones de despliegue: TensorFlow Lite (intérprete Python, Android, iOS), TensorFlow Lite for Microcontrollers (si el modelo es muy pequeño, no confirmado), conversión a ONNX no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y la falta de especificaciones del modelo impide establecer una comparación rigurosa con alternativas de moderación de contenido (por ejemplo, clasificadores NSFW de la familia Falconsai, Marqo o NSFW-detector).

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni paper, ni métricas, lo que impide evaluar su fiabilidad.
- Riesgo elevado de falsos positivos y falsos negativos: sin datos de validación, no se puede conocer su precisión, recall ni calibración.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede evaluar el sesgo demográfico, cultural o de representación.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí de clasificaciones erróneas no verificables.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar si los pesos derivan de otro modelo con licencia incompatible (no documentado).
- Etiqueta `not-for-all-anchors`/`not-for-all-audiences`: el propio repositorio advierte de contenido sensible; su uso en producción debe acompañarse de políticas de moderación y revisión humana.
- Tracción comunitaria prácticamente nula (14 descargas, 0 likes): no hay evidencia de uso en producción ni de mantenimiento.
- Fecha de creación futura (2026-10-30) en los metadatos: posible inconsistencia que sugiere datos incompletos o generados automáticamente.

## Enlaces

- HuggingFace: https://huggingface.co/kishormainali/marqo-nsfw-384
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
