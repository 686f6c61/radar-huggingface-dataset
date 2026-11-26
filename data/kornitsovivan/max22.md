# kornitsovivan/max22

## Resumen

`kornitsovivan/max22` es un detector de objetos publicado en Hugging Face por el usuario kornitsovivan. El modelo identifica cuatro clases específicas del dominio de las estaciones de servicio: surtidor de combustible (petrol pump), manguera de combustible (petrol hose), marquesina (roof canopy) y panel de precios (price board). Se distribuye como un fichero `weights.onnx` acompañado de un script de inferencia (`miner.py`) y un fichero de configuración de despliegue (`chute_config.yml`).

La información disponible es muy escasa: el repositorio tiene un tamaño de 0.0 GB (probablemente por redondeo o porque los pesos no están efectivamente alojados), no registra descargas ni interacciones, y la model card no especifica arquitectura, número de parámetros, resolución de entrada ni procedencia de los datos de entrenamiento. El formato ONNX y la etiqueta `object-detection` son los únicos indicios técnicos fiables sobre su naturaleza.

Por su dominio tan acotado, el modelo no compite con detectores generalistas tipo YOLO o DETR, sino que está pensado para una tarea vertical concreta de inspección o monitorización de gasolineras. Su relevancia actual es limitada dado el nulo historial de uso y la ausencia de documentación técnica, pero resulta un ejemplo representativo de los modelos ONNX hiperespecializados que se publican para despliegues de borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; pesos en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (solo se distribuye ONNX sin indicar precisión) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La presencia de un único fichero `weights.onnx` y de un script `miner.py` con una API `Miner(path).predict_batch(batch_images, offset, n_keypoints)` sugiere un detector de caja o de puntos clave por lote, pero no se especifica si se trata de una familia YOLO, un detector basado en transformer, un modelo tipo CenterNet u otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de data augmentation ni si hubo fases de ajuste fino supervisado con anotaciones humanas.

La única información operativa es la lista de cuatro clases (surtidor, manguera, marquesina, panel de precios) y la existencia de un fichero `chute_config.yml` que probablemente define la imagen de servicio o contenedor para el despliegue. No hay datos sobre resolución de entrada, normalización, tamaño del lote recomendado ni métricas de validación.

## Capacidades

- Detección de objetos en imágenes con cuatro clases específicas: surtidor de combustible, manguera de combustible, marquesina y panel de precios.
- Inferencia por lotes mediante `predict_batch(batch_images, offset, n_keypoints)`, lo que permite procesar varias imágenes en una sola llamada.
- Ejecución en formato ONNX, compatible con ONNX Runtime, TensorRT y otros runtimes de inferencia.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión generalista más allá de las cuatro clases entrenadas.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No se documentan capacidades de audio, vídeo ni segmentación semántica.

## Casos de uso

- Inventario automático de estaciones de servicio: el modelo puede detectar surtidores y mangueras en fotografías aéreas o de inspección para contar unidades y verificar su estado, aprovechando la clase específica `petrol pump` y `petrol hose`.
- Monitorización de precios en surtidores: la detección de la clase `price board` permite localizar el panel de precios en la imagen y, combinada con un OCR posterior, extraer los importes para comparativas de mercado.
- Mantenimiento predictivo visual: la detección de mangueras y surtidores facilita el seguimiento de desgaste o ausencias mediante comparación entre capturas periódicas, al estar las clases alineadas con los elementos críticos de una gasolinera.
- Verificación de señalización y marquesinas: la clase `roof canopy` permite comprobar la presencia y visibilidad de la marquesina en auditorías de imagen de marca o cumplimiento normativo.
- Automatización de inspecciones con drones: al ser un modelo ONNX ligero y por lotes, puede ejecutarse en el borde (edge) sobre imágenes capturadas por drones que sobrevuelan instalaciones, reduciendo el ancho de banda necesario.
- Etiquetado asistido para nuevos datasets: el detector puede preanotar imágenes de estaciones de servicio y acelerar la creación de datasets propios para reentrenar o ampliar el modelo.
- Despliegue en contenedor de servicio: el fichero `chute_config.yml` sugiere un uso previsto como microservicio de inferencia, útil para integrar la detección en un pipeline de visión corporativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no conocerse el número de parámetros ni el tamaño del fichero ONNX, no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de detección de objetos, es probable que funcione en GPUs de gama media, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada. Si el modelo es ligero (típico en detectores especializados), podría ejecutarse en RTX 3060 o superiores; sin embargo, no hay información que lo respalde.
- Opciones de despliegue: ONNX Runtime (forma nativa del fichero), TensorRT, OpenVINO y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kornitsovivan/max22 | Detección de 4 clases de gasolinera | no disponible | no aplica | AGPL-3.0 | Hugging Face (0 descargas) |
| YOLOv8 (Ultralytics) | Detección generalista (80 clases COCO) | 3,2 M - 68,2 M según variante | no aplica | AGPL-3.0 | Hugging Face, GitHub, pip |
| DETR (Facebook) | Detección generalista | 41 M (ResNet-50) | no aplica | Apache-2.0 | Hugging Face, GitHub |
| Grounding DINO | Detección abierta por texto | ~172 M | no aplica | Apache-2.0 | Hugging Face, GitHub |

La comparación es aproximada: `max22` está especializado en un dominio muy concreto y no se han publicado métricas que permitan contrastar su precisión frente a los detectores generalistas. La licencia AGPL-3.0 lo alinea con YOLOv8, mientras que DETR y Grounding DINO ofrecen licencias más permisivas para uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse presumiblemente con imágenes de un tipo concreto de estación de servicio, puede fallar ante variaciones de iluminación, ángulos, países o marcas no representadas.
- Riesgo de alucinación: inherente a cualquier detector de objetos; pueden aparecer falsos positivos en elementos visualmente similares (por ejemplo, otras estructuras con forma de marquesina o paneles publicitarios).
- Limitaciones de contexto o idioma: no aplica en el sentido textual, pero el modelo no procesa texto y no tiene capacidades multilingües.
- Restricciones de licencia: la AGPL-3.0 es una licencia copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio en red, la licencia puede obligar a liberar el código fuente de la aplicación que lo integra. Conviene revisarlo con asesoría legal antes de producción.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, no hay métricas de validación, ni información sobre el dataset, ni garantías de mantenimiento. El tamaño del repo (0.0 GB) podría indicar que los pesos no están realmente alojados o que el fichero es extremadamente pequeño. La API de inferencia depende de un script propio (`miner.py`) que no está documentado más allá de su firma.
- No se especifican requisitos de resolución de entrada ni preprocesamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kornitsovivan/max22
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
