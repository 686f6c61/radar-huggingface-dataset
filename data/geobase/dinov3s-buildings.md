# geobase/dinov3s-buildings

## Resumen

`geobase/dinov3s-buildings` es un modelo de segmentación semántica de edificios diseñado para detectar huellas de construcciones en imágenes aéreas y de satélite de muy alta resolución. Lo desarrolla el equipo de geobase, en colaboración con el proyecto fAIr de HOTOSM, sobre el modelo base `kshitijrajsharma/dinov3`. El modelo resuelve el problema de extracción automática de polígonos de edificios, una tarea clave en cartografía, catastro y monitorización de asentamientos.

Arquitectónicamente combina un backbone DINOv3 ViT-S/16 congelado con un decoder UperNet entrenable. El modelo se distribuye como un grafo de inferencia ONNX autocontenido, además de un checkpoint de Lightning para evaluación o reentrenamiento. El repositorio tiene un tamaño de 0.9 GB y la licencia del modelo es CC-BY-4.0. No se especifican parámetros totales ni longitudes de contexto al tratarse de un modelo de visión, no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 (backbone congelado) + UperNet decoder |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (model.onnx) y checkpoint Lightning (model.ckpt) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de segmentación con backbone Vision Transformer (ViT) y decoder UperNet. El backbone DINOv3 ViT-S/16 se mantiene congelado, de modo que solo el decoder UperNet y la cabeza de segmentación contienen parámetros entrenables. Esta estrategia reduce el coste de entrenamiento y aprovecha las representaciones visuales preentrenadas de DINOv3.

El entrenamiento se realizó sobre el dataset `hotosm/vhr-building-segmentation`, compuesto por imágenes RGB de muy alta resolución con etiquetas de huellas de edificios. La licencia del dataset es CC-BY-4.0 / ODbL, y el modelo hereda esa licencia. No se mencionan técnicas de alineación como RLHF o DPO, ya que no es un modelo de lenguaje. La inferencia se ejecuta mediante una ventana deslizante continua de 256 px con stride de 192 px, y un umbral de probabilidad por defecto de 0.4371.

## Capacidades

- Segmentación de huellas de edificios en imágenes RGB de muy alta resolución, tanto aéreas como de satélite.
- Salida por píxel de probabilidad de pertenencia a edificio, que posteriormente se umbraliza y vectoriza en polígonos.
- Inferencia mediante ventana deslizante, lo que permite procesar imágenes de tamaño arbitrario.
- El modelo se distribuye en formato ONNX, facilitando su integración en pipelines de despliegue sin dependencias de Python pesadas.
- No soporta tool calling, generación de texto, razonamiento multi-step ni capacidades de lenguaje; su ámbito es exclusivamente visión geoespacial.

## Casos de uso

- Cartografía colaborativa en OpenStreetMap: el modelo puede generar polígonos de edificios a partir de ortofotos y acelerar la edición manual en zonas donde no hay datos.
- Catastro y censo urbano: permite actualizar automáticamente las huellas de edificios en municipios, reduciendo el coste de levantamientos topográficos.
- Monitorización de asentamientos informales: al procesar imágenes satelitales periódicas, se pueden detectar nuevas construcciones y estudiar la expansión urbana.
- Gestión de emergencias y desastres: tras un terremoto o inundación, el modelo puede producir mapas rápidos de edificaciones dañadas o destruidas para coordinar la ayuda humanitaria.
- Planificación urbana y análisis de densidad: las huellas vectorizadas sirven como entrada para calcular indicadores como superficie construida, densidad de edificaciones o ratio de suelo ocupado.
- Generación de datos de entrenamiento para otros modelos: las máscaras de probabilidad y los polígonos simplificados pueden usarse para crear datasets etiquetados en nuevas regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como IoU, F1 o precisión para este modelo en comparación con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamaño de 0.9 GB, lo que sugiere que el modelo es relativamente ligero y podría ejecutarse en GPU de consumo o incluso en CPU, aunque no hay datos oficiales de consumo de memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de hardware por parte del autor.
- Compatibilidad con GPU de consumo: probable, dado el tamaño del archivo ONNX, pero no confirmado oficialmente.
- Opciones de despliegue: el archivo `model.onnx` permite su uso con runtimes ONNX como ONNX Runtime, y el checkpoint Lightning permite reentrenamiento o evaluación con PyTorch. También puede integrarse en pipelines de HOTOSM fAIr.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existen datos suficientes en la información disponible para comparar este modelo con alternativas de la misma categoría (segmentación de edificios). Se desconoce el rendimiento relativo frente a otros modelos de segmentación de huellas de edificios.

## Limitaciones y advertencias

- El modelo se entrenó con el dataset `hotosm/vhr-building-segmentation`, que puede presentar sesgos geográficos y de tipo de construcción. Su rendimiento en regiones o tipologías no representadas en el entrenamiento puede ser deficiente.
- La salida es una probabilidad por píxel y requiere un umbral fijo (0.4371 por defecto); cambios en la resolución o el tipo de imagen pueden degradar la calidad de la segmentación.
- El modelo solo acepta imágenes RGB, por lo que no es aplicable a imágenes multiespectrales (por ejemplo, con bandas infrarrojas o de radar).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero los pesos del backbone DINOv3 están sujetos a la licencia original de DINOv3, que puede imponer condiciones adicionales. Es necesario revisar ambos conjuntos de licencias antes de usar el modelo en producción.
- No se han publicado métricas de evaluación, por lo que la calidad real del modelo en escenarios concretos no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geobase/dinov3s-buildings
- Repositorio de modelos fAIr de HOTOSM: https://github.com/hotosm/fAIr-models/blob/develop/models/dinov3s_buildings/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/hotosm/vhr-building-segmentation
