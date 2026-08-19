# axe-homeautomation/bird-feeder-birds

## Resumen

El modelo `axe-homeautomation/bird-feeder-birds` es un detector de objetos basado en YOLO11m, fine-tuneado por el autor `axe-homeautomation` para identificar especies de aves y ardillas en cámaras de comederos domésticos. Resuelve el problema de la clasificación automática de fauna en tiempo real sobre vídeo de baja resolución, sin necesidad de etiquetado manual: las anotaciones del conjunto de datos se generaron de forma automática mediante un pipeline que combina Grounding DINO para la localización, BioCLIP 2 para la clasificación de especies y un sistema de seguimiento temporal con votación ponderada por confianza para depurar las etiquetas.

El modelo distingue seis clases concretas —`sparrow`, `house_finch`, `cardinal`, `blue_jay`, `titmouse` y `squirrel`— y elimina por diseño la clase genérica `bird`: cualquier detección que no se resuelva con confianza suficiente hacia una especie específica se descarta en lugar de etiquetarse como "ave". Esta decisión prioriza la precisión de las etiquetas sobre el recall, lo que lo hace adecuado para aplicaciones de observación de aves donde una identificación errónea es más costosa que una ausencia de detección.

Entrenado sobre 5.386 imágenes (4.628 de entrenamiento y 758 de validación) procedentes de 1.277 vídeos de comederos capturados entre julio y agosto de 2026, el modelo alcanza una mAP50 de 0.592 y una mAP50-95 de 0.467 en su conjunto de validación. Su tamaño compacto (40,5 MB) y su arquitectura eficiente lo hacen viable para despliegue en dispositivos periféricos como Raspberry Pi o cámaras inteligentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (backbone CNN + head de detección, 126 capas, fusión de características) |
| Parametros totales | 20,0 millones |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640x640 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa; cuantización posible vía Ultralytics) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de clase en inglés) |
| Licencia | AGPL-3.0 (heredada de los pesos base de YOLO11) |
| Formato de pesos | PyTorch `.pt` (Ultralytics), convertible a ONNX, TensorRT, CoreML, TFLite |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `yolo11m.pt` preentrenados en COCO y se fine-tunea por completo (sin capas congeladas) durante 150 épocas con un tamaño de lote de 16 y resolución de entrada de 640x640 píxeles. El entrenamiento se realizó en una RTX 4090 Laptop de 16 GB con CUDA 12.4 y Ultralytics 8.4.115, completándose en 3,13 horas.

La innovación principal no está en la arquitectura, sino en el pipeline de etiquetado automático. Las 5.386 imágenes del conjunto de datos `axe-homeautomation/bird-feeder-birds` se generaron a partir de 1.277 vídeos de cámaras de comedero mediante un proceso en tres etapas: primero, Grounding DINO localiza los objetos; segundo, BioCLIP 2 clasifica la especie; y tercero, un sistema de seguimiento temporal aplica votación ponderada por confianza sobre los fotogramas de cada animal rastreado. Se añadieron dos filtros adicionales de ruido de etiquetas: un umbral mínimo de área en píxeles de la caja y un umbral de desenfoque por movimiento, tras detectar errores reales como un arrendajo azul etiquetado como titmouse o ardillas movidas etiquetadas como titmouse.

El diseño elimina la clase genérica `bird` que existía en versiones anteriores (suponía aproximadamente el 41 % de las cajas). Las pistas que no alcanzan un umbral de confianza específico de especie se descartan por completo, priorizando la precisión de las etiquetas sobre el recall.

## Capacidades

- Detección de objetos en tiempo real con bounding boxes, clase y confianza para seis clases: `sparrow`, `house_finch`, `cardinal`, `blue_jay`, `titmouse` y `squirrel`.
- Inferencia sobre imágenes RGB de 640x640 píxeles con un coste computacional de 67,8 GFLOPs, adecuado para hardware de gama media.
- Sin clase genérica de "ave": cada detección se asigna a una especie concreta o se descarta, lo que reduce falsos positivos de identificación.
- Integración directa con el ecosistema Ultralytics: API Python, CLI y exportación a múltiples formatos de inferencia.
- Etiquetado automático de datos de entrenamiento mediante pipeline de localización + clasificación + seguimiento temporal, sin anotación manual.
- Capacidad de seguimiento de individuos a lo largo de fotogramas gracias al sistema de votación temporal usado en el etiquetado (aunque el modelo en sí solo produce detecciones por fotograma).

## Casos de uso

- Comedero inteligente para observación de aves: el modelo se integra en una cámara de comedero para identificar en tiempo real qué especies visitan el alimentador y registrar estadísticas de presencia por especie, como hacen productos comerciales tipo BirdWatchAI.
- Notificaciones móviles selectivas: al detectar una especie concreta (por ejemplo, un cardenal), se puede enviar una alerta al propietario mediante la API de Ultralytics y un servicio de mensajería, evitando notificaciones para especies comunes.
- Investigación ciudadana de biodiversidad: los datos de detección pueden alimentar plataformas de ciencia ciudadana (eBird, iNaturalist) con observaciones geolocalizadas y con marca de tiempo, gracias a la precisión de las etiquetas por especie.
- Control de plagas en jardines: la detección de ardillas (clase `squirrel`, la mejor rendimiento con mAP50 de 0.815) permite activar disuasores automáticos o simplemente monitorizar la frecuencia de visitas de estos animales.
- Sistema de cámaras múltiples en fincas o reservas: al ser un modelo compacto de 40,5 MB, puede desplegarse en varios nodos periféricos (Raspberry Pi 4/5, Jetson Nano) que procesan vídeo localmente sin enviar datos a la nube.
- Estudio del comportamiento aviar: el seguimiento temporal de detecciones permite correlacionar la presencia de especies con variables ambientales (hora del día, clima, tipo de alimento) para estudios etológicos de bajo coste.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación (758 imágenes, 822 instancias) reportados por el autor:

| Clase | Precisión | Recall | mAP50 | mAP50-95 | Instancias val |
|---|---|---|---|---|---|
| Todas | 0.623 | 0.537 | 0.592 | 0.467 | 822 |
| squirrel | 0.848 | 0.769 | 0.815 | 0.711 | 264 |
| house_finch | 0.718 | 0.788 | 0.796 | 0.636 | 184 |
| cardinal | 0.748 | 0.568 | 0.729 | 0.578 | 178 |
| blue_jay | 0.516 | 0.529 | 0.528 | 0.376 | 17 |
| sparrow | 0.611 | 0.324 | 0.461 | 0.324 | 136 |
| titmouse | 0.296 | 0.244 | 0.222 | 0.175 | 43 |

Comparado con la versión anterior del mismo modelo (mAP50 0.574), la versión actual mejora a 0.592. La clase `sparrow` mejoró de 0.413 a 0.461, mientras que `titmouse` empeoró de 0.252 a 0.222, atribuido por el autor a un problema de volumen de datos (solo 43 instancias de validación frente a 119-264 del resto). No se han publicado resultados comparativos con otros modelos de detección de aves en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 20 millones de parámetros y 67,8 GFLOPs; en FP32 necesita aproximadamente 80 MB de memoria para los pesos, y la inferencia a 640x640 con batch 1 requiere menos de 2 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia en tiempo real. El entrenamiento se realizó en una RTX 4090 Laptop de 16 GB.
- Compatible con GPU de consumo: sí, incluso con iGPU modernas puede ejecutarse a baja resolución o con cuantización INT8.
- Opciones de despliegue: Ultralytics Python API, CLI (`yolo predict`), exportación a ONNX, TensorRT, CoreML y TFLite para despliegue en edge (Jetson, Raspberry Pi, teléfonos móviles).
- Latencia estimada: en una RTX 3060, la inferencia a 640x640 debería completarse en menos de 20 ms; en una Raspberry Pi 5 con ONNX cuantizado, se espera entre 100-300 ms por imagen, suficiente para procesamiento por fotogramas a baja tasa.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de detección de especies de aves en comederos. Como referencia de arquitectura, el modelo base YOLO11m tiene un rendimiento conocido en COCO (mAP50-95 de 39,0 en el conjunto de validación de COCO), pero la comparación directa no es significativa al tratarse de dominios distintos. Alternativas genéricas de detección de aves podrían incluir:

| Modelo | Base | Clases | mAP50 (este dataset) | Licencia | Notas |
|---|---|---|---|---|---|
| axe-homeautomation/bird-feeder-birds | YOLO11m | 6 específicas | 0.592 | AGPL-3.0 | Fine-tune específico para comederos |
| Ultralytics/YOLO11m (COCO) | YOLO11m | 80 genéricas | no aplicable | AGPL-3.0 | Detecta "bird" como clase genérica, sin distinguir especies |
| Detectores basados en Grounding DINO + BioCLIP | Transformer + CLIP | abiertas | no aplicable | Apache-2.0 / MIT | Pipeline de etiquetado usado para generar los datos, no optimizado para inferencia en tiempo real |

La ventaja del modelo evaluado frente a un YOLO11m genérico es la distinción por especie; frente a pipelines basados en transformers, ofrece una latencia mucho menor y un tamaño de 40,5 MB frente a varios gigabytes.

## Limitaciones y advertencias

- Las etiquetas del conjunto de entrenamiento son generadas por modelos (Grounding DINO + BioCLIP 2 + seguimiento temporal), no verificadas por humanos. Esto introduce ruido de etiquetas que afecta directamente a las métricas, especialmente en clases con pocas instancias.
- Las clases `titmouse` y `blue_jay` tienen muy pocas instancias de validación (43 y 17 respectivamente), lo que hace que sus métricas sean estadísticamente poco fiables. `titmouse` es la clase más débil con una mAP50 de solo 0.222.
- El modelo está diseñado para priorizar la precisión de las etiquetas sobre el recall: espera que algunos animales reales no se detecten, pero los que se detectan tienen alta probabilidad de estar bien clasificados. Esto puede ser problemático en aplicaciones que requieran detección exhaustiva.
- El conjunto de datos procede de un único comedero doméstico (1.277 vídeos entre julio y agosto de 2026). La generalización a otros entornos, ángulos de cámara, condiciones de iluminación o especies no representadas puede ser limitada.
- La licencia AGPL-3.0 implica que cualquier uso del modelo en un servicio de red requiere publicar el código fuente completo del servicio bajo la misma licencia. Esto puede ser restrictivo para aplicaciones comerciales propietarias.
- No hay soporte para clases fuera de las seis entrenadas: cualquier otra especie de ave o animal será ignorada o mal clasificada.
- El modelo no incluye capacidades de seguimiento temporal en sí mismo; el seguimiento descrito en la documentación forma parte del pipeline de etiquetado, no del modelo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axe-homeautomation/bird-feeder-birds
- Dataset de entrenamiento: https://huggingface.co/datasets/axe-homeautomation/bird-feeder-birds
- Modelo base Ultralytics/YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Documentación de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
