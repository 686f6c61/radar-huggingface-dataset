# NoeFlandre/osm-polygon-sentence-classifier

## Resumen

El modelo `NoeFlandre/osm-polygon-sentence-classifier` es un clasificador de texto orientado a la clasificación de polígonos de OpenStreetMap (OSM) a partir de descripciones textuales. Desarrollado por Noé Flandre, investigador en ingeniería de IA, este repositorio actúa como registro de experimentos y artefactos públicos para la tarea de clasificación de oraciones sobre uso del suelo (landuse). El objetivo es asociar automáticamente descripciones de áreas geográficas (por ejemplo, "zona residencial", "parque industrial") con categorías de uso de suelo, lo que facilita el mantenimiento y la validación de datos cartográficos colaborativos.

El repositorio contiene los artefactos de un estudio congelado (`landuse-v1`) y está estructurado para permitir la reproducibilidad de experimentos, con registros de ejecuciones, checkpoints y métricas. Aunque la etiqueta `pipeline_tag` indica `text-classification` y la librería es `transformers`, no se proporcionan detalles sobre la arquitectura concreta, el número de parámetros ni el proceso de entrenamiento. El tamaño del repositorio es de 83.3 GB, lo que sugiere la presencia de múltiples checkpoints y artefactos, pero no permite inferir directamente el tamaño del modelo final.

La relevancia actual de este modelo radica en su aplicación potencial a la mejora de la calidad de los datos de OSM, un recurso geoespacial abierto y fundamental para numerosos servicios. La clasificación automática de descripciones textuales de polígonos podría reducir el trabajo manual de etiquetado y ayudar a detectar inconsistencias. Sin embargo, la falta de documentación técnica detallada limita su evaluación directa y su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (librería `transformers`, pipeline `text-classification`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que utiliza la librería `transformers` de Hugging Face y que el pipeline es de clasificación de texto, lo que sugiere un modelo basado en transformer (probablemente un encoder como BERT o similar), pero no hay confirmación. Tampoco se ofrecen datos sobre el conjunto de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El repositorio incluye un estudio de ablación (`landuse-v1`) y un registro de experimentos, lo que indica un enfoque metodológico, pero los detalles técnicos de los experimentos no están accesibles en la documentación pública.

## Capacidades

- Clasificación de oraciones o descripciones textuales relacionadas con el uso del suelo (landuse) en polígonos de OpenStreetMap.
- Posible capacidad de asignar categorías predefinidas a partir de texto libre, aunque no se especifican las etiquetas de salida.
- Integración con el ecosistema `transformers` y compatibilidad con endpoints de Hugging Face (según la etiqueta `endpoints_compatible`).
- No se documentan capacidades adicionales como razonamiento, generación de código, soporte de herramientas o multimodalidad.

## Casos de uso

- Validación automática de etiquetas de uso de suelo en OpenStreetMap: el modelo puede analizar descripciones de polígonos (por ejemplo, "zona de cultivo de regadío") y sugerir o verificar la categoría `landuse` correspondiente, reduciendo errores de etiquetado manual.
- Enriquecimiento de datos geoespaciales: a partir de textos descriptivos de áreas (como notas de campo o informes urbanísticos), el modelo puede generar etiquetas de uso de suelo para polígonos que carecen de ellas.
- Detección de inconsistencias en la base de datos OSM: al comparar la descripción textual de un polígono con su etiqueta actual, se pueden identificar discrepancias que requieran revisión humana.
- Integración en pipelines de mapeo colaborativo: como paso posterior a la digitalización de polígonos, el modelo puede pre-rellenar las etiquetas de uso de suelo, acelerando el trabajo de los mapeadores.
- Análisis de cambios de uso de suelo: al clasificar descripciones históricas o actuales, se puede estudiar la evolución temporal de las categorías en una región.
- Filtrado y limpieza de datos para investigación geoespacial: el modelo puede servir para normalizar y categorizar grandes volúmenes de descripciones textuales asociadas a polígonos en estudios urbanísticos o medioambientales.

Nota: estos casos de uso son inferencias razonables basadas en el propósito declarado del modelo; no hay documentación oficial que los confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos sobre VRAM necesaria ni GPU recomendada.
- El tamaño del repositorio (83.3 GB) sugiere que el modelo o sus checkpoints ocupan un espacio considerable, pero no se puede estimar la memoria de inferencia sin conocer el número de parámetros.
- Dado que es un clasificador de texto, es probable que pueda ejecutarse en CPU para inferencia a baja velocidad, pero no hay confirmación.
- Opciones de despliegue: al ser compatible con `transformers`, se podría servir con vLLM, TGI o un endpoint de Hugging Face, pero no se especifica.
- No se conocen valores de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de texto para landuse de OSM). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La documentación es extremadamente escasa: no se especifican arquitectura, entrenamiento, idiomas ni licencia, lo que dificulta su evaluación y uso responsable.
- La licencia no está declarada, por lo que no se puede garantizar su uso comercial o la redistribución de los artefactos.
- Al ser un modelo entrenado sobre datos de OpenStreetMap, podría heredar sesgos geográficos o de cobertura (por ejemplo, regiones con más densidad de etiquetas que otras).
- No hay información sobre posibles alucinaciones o tasas de error en la clasificación.
- El repositorio está orientado a la investigación y reproducibilidad, no a un despliegue directo; los usuarios deben revisar los artefactos de cada experimento antes de usarlos.
- No se garantiza la compatibilidad con versiones futuras de la librería `transformers` ni con otros frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NoeFlandre/osm-polygon-sentence-classifier
- Repositorio GitHub: https://github.com/NoeFlandre/osm-polygon-sentence-classifier
- Colección de Hugging Face sobre clasificación de landuse: https://huggingface.co/collections/NoeFlandre/text-landuse-classification
- Dashboard Trackio (métricas): https://huggingface.co/spaces/NoeFlandre/osm-polygon-sentence-classifier-trackio
- Perfil del autor en GitHub: https://github.com/NoeFlandre/
- OpenStreetMap: https://www.openstreetmap.org/
