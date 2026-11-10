# Addax-Data-Science/EUR-DF-v1-3

## Resumen

EUR-DF-v1-3 es un paquete de pesos redistribuido por Addax Data Science dentro del repositorio Addax-Data-Science/EUR-DF-v1-3, pensado para su integración directa en la plataforma AddaxAI. No se trata de un modelo de lenguaje ni de un modelo generativo: el contenido corresponde a un modelo de visión por computador para la clasificación automática de fauna salvaje en imágenes de cámaras de fototrampeo, desarrollado originalmente por la iniciativa Deepfaune del CNRS. Addax Data Science actúa únicamente como redistribuidor y conserva la licencia y atribución originales.

La relevancia de este repositorio es práctica: agrupa en un único punto de descarga los pesos necesarios para que AddaxAI pueda identificar especies animales en grandes volúmenes de imágenes de campo sin que el usuario tenga que localizar y convertir manualmente los artefactos originales de Deepfaune. El repositorio ocupa aproximadamente 1,2 GB y se distribuye bajo licencia CC BY-SA 4.0.

La información pública disponible es muy limitada. La model card no detalla arquitectura, número de parámetros, resolución de entrada, clases de salida ni métricas de rendimiento; se limita a indicar el desarrollador original, enlaces de documentación y cita académica, y la licencia. Cualquier dato técnico no listado aquí debe considerarse no disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (repositorio de 1,2 GB) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la información disponible. La model card identifica al desarrollador original como The Deepfaune initiative (CNRS) y remite a la publicación científica asociada en European Journal of Wildlife Research (doi vinculado a link.springer.com/article/10.1007/s10344-023-01742-7), donde presumiblemente se describe el diseño y el conjunto de datos de entrenamiento. No se especifica en el repositorio el número de tokens, la composición del dataset, el uso de técnicas de ajuste fino supervisado, RLHF o DPO, ni innovaciones técnicas concretas.

Por el contexto de uso (AddaxAI, fototrampeo, Deepfaune) cabe inferir que se trata de un modelo de clasificación de imágenes, pero la información proporcionada no confirma la familia arquitectónica, el backbone, la resolución de entrada ni el número de clases. Estos datos deben consultarse en la publicación original o en el repositorio de Deepfaune.

## Capacidades

- Clasificación automática de imágenes, orientada al contexto de fototrampeo y fauna salvaje según la documentación de Deepfaune y AddaxAI.
- Integración prevista con la plataforma AddaxAI para procesamiento por lotes de imágenes de cámaras trampa.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, audio ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica ni se documentan.
- No se documenta modo thinking, visión general fuera del dominio de fauna ni otras capacidades especiales.

## Casos de uso

- Inventario de fauna en estudios ecológicos: procesar lotes de imágenes de cámaras trampa y clasificar las especies detectadas, reduciendo la revisión manual de miles de fotografías.
- Monitorización de reservas y parques naturales: integrar el modelo en AddaxAI para generar informes periódicos de presencia de especies a partir de estaciones de fototrampeo.
- Seguimiento de especies de interés para conservación: automatizar la detección de especies objetivo en campañas de campo con grandes volúmenes de imágenes.
- Investigación académica en ecología: usar los pesos redistribuidos para reproducir o comparar resultados con la línea base de Deepfaune citada en la publicación del CNRS.
- Gestión de conflictos fauna-humanidad: clasificar avistamientos en zonas agrícolas o periurbanas para priorizar inspecciones sobre el terreno.
- Docencia y formación técnica: emplear el repositorio como ejemplo de redistribución de modelos de visión con licencia CC BY-SA 4.0 y atribución a Deepfaune.
- Despliegue en pipelines de AddaxAI: cargar los pesos directamente en la plataforma sin pasos intermedios de conversión, simplificando la puesta en marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía prevista es AddaxAI; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni métricas que permitan una comparación rigurosa con alternativas de clasificación de fauna en fototrampeo.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo de clasificación de fauna, los sesgos dependerán de la distribución del dataset original de Deepfaune, no descrito aquí.
- Riesgo de error en la clasificación: sin métricas publicadas en esta ficha, no es posible acotar la tasa de acierto ni los falsos positivos.
- Limitaciones de contexto o idioma: no aplica a un modelo de visión; no se documentan restricciones de resolución o condiciones de captura.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar los términos completos antes de un despliegue en producción.
- Redistribución: Addax Data Science solo redistribuye; cada modelo conserva su licencia original y el usuario debe revisar los ficheros de licencia incluidos.
- El repositorio no incluye pipeline declarado, idiomas ni metadatos técnicos adicionales; la ausencia de descargas y likes en el momento de la consulta no implica calidad, pero tampoco aporta validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/EUR-DF-v1-3
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Deepfaune (CNRS): https://www.deepfaune.cnrs.fr/en/
- Publicación científica (European Journal of Wildlife Research): https://link.springer.com/article/10.1007/s10344-023-01742-7
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
