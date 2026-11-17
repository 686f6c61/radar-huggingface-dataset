# JunlongLiu/fhwa-ear-pruned-mobilenetv4-conv-s

## Resumen

El modelo `fhwa-ear-pruned-mobilenetv4-conv-s`, publicado por el autor JunlongLiu, es un checkpoint de investigación para segmentación de ocho clases de deterioros en pavimentos (pavement distress), a partir de imágenes en escala de grises alineadas y mapas de profundidad 3D. Se trata de un MobileNetV4-Conv-S podado como parte del estudio de pruning del proyecto FHWA EAR (acuerdo 693JJ32350032). El modelo base de partida es el modelo multimodal expandido del propio proyecto.

El resultado del pruning reduce el número de parámetros un 76,63%, pasando de 42.163.761 a 9.854.604 parámetros. El coste en calidad es una caída de mIoU de validación de 79,32% a 73,00% y de mIoU en el conjunto de test fijo de 81,50% a 73,67%. A cambio, el throughput medido en FP32 sobre una RTX 4070 sube de 9,97 FPS a 13,92 FPS.

Es relevante como referencia reproducible de un experimento de podado sobre un modelo de segmentación multimodal aplicado a inspección de infraestructuras, con artefactos de inferencia y verificación incluidos en el repositorio. No obstante, el propio autor advierte que el conjunto de test fijo se usó para la aceptación final del release y no debe interpretarse como una estimación intacta de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-S (modelo multimodal expandido del proyecto, podado) |
| Parametros totales | 9.854.604 (podado); 42.163.761 en el baseline expandido |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se reportan medidas en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch); código de inferencia en `inference-code.zip` |

## Arquitectura y entrenamiento

La arquitectura de partida es MobileNetV4-Conv-S, una red convolucional ligera, integrada en un modelo multimodal del proyecto FHWA EAR que combina imagen en escala de grises alineada con profundidad 3D para segmentación semántica de deterioros de pavimento en ocho clases (incluyendo fondo). El checkpoint publicado es la versión final aceptada del estudio de pruning, obtenida aplicando una receta de podado guardada que el loader `load_pruned` reproduce al cargar los pesos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre el uso de técnicas de alineamiento como RLHF o DPO (no aplicables habitualmente a segmentación). Tampoco se detalla la estrategia concreta de pruning (estructurado o no estructurado) más allá de la reducción de parámetros y del procedimiento de replay de la receta. Los conjuntos de evaluación citados son VAL522 y TEST523.

## Capacidades

- Segmentación de imagen en ocho clases de deterioros de pavimento, incluyendo la clase de fondo.
- Procesamiento multimodal: combina imagen en escala de grises alineada con información de profundidad 3D.
- Salida densa de segmentación (predicción por píxel) orientada a inspección de infraestructuras.
- Inferencia en FP32 con throughput medido de 13,92 FPS en RTX 4070 (batch size 1, eager).
- Carga reproducible del estado podado mediante el loader `load_pruned`, que reaplica la receta de pruning guardada.
- Verificación de integridad de artefactos mediante `SHA256SUMS.txt` y métricas registradas en `metrics.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Inspección automatizada de firmes: el modelo segmenta ocho clases de deterioro sobre imágenes de carretera, lo que permite generar mapas de daño por píxel para priorizar reparaciones en grandes tramos de vía.
- Integración en vehículos de inspección con cámara y sensor de profundidad: la entrada multimodal (gris + 3D) encaja con plataformas que ya capturan datos de profundidad, y el throughput de 13,92 FPS en una RTX 4070 permite procesamiento casi en tiempo real a baja velocidad de avance.
- Despliegue en estaciones de revisión con GPU de gama media: al reducir parámetros un 76,63% frente al baseline, el checkpoint podado es adecuado para hardware con menos VRAM en tareas de post-proceso por lotes.
- Investigación sobre compresión de modelos: sirve como referencia reproducible de un experimento de pruning con métricas de calidad y throughput documentadas, útil para comparar técnicas de podado en segmentación.
- Evaluación comparativa de modelos de segmentación de pavimentos: permite contrastar el baseline expandido frente a la versión podada usando los mismos conjuntos VAL522 y TEST523.
- Prototipado académico en mantenimiento de infraestructuras: el paquete de inferencia y las métricas registradas facilitan reproducir resultados en laboratorio antes de escalar a producción.

## Benchmarks y rendimiento

| Metrica | Baseline expandido | Podado |
|---|---:|---:|
| Parametros | 42.163.761 | 9.854.604 |
| mIoU de validacion (VAL522) | 79,32% | 73,00% |
| mIoU de test fijo (TEST523) | 81,50% | 73,67% |
| Throughput FP32 (FPS) | 9,97 | 13,92 |

Las cifras de throughput se midieron en una RTX 4070 con FP32 eager, batch size 1, 20 iteraciones de warm-up y 100 iteraciones sincronizadas, excluyendo la carga de datos. El mIoU es la media macro sobre ocho clases, incluido el fondo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,85 millones de parámetros en FP32 el peso de los parámetros ronda los 39 MB, por lo que el consumo dominante será el de activaciones y el pipeline de datos.
- GPU de referencia en las mediciones: RTX 4070, con 13,92 FPS en FP32 eager y batch size 1.
- Cabe en GPU de consumo: sí, por tamaño de parámetros es apto para tarjetas de gama media y baja; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: PyTorch con el loader `load_pruned` proporcionado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 13,92 FPS medidos en RTX 4070 en las condiciones indicadas; no se reportan latencias por imagen ni throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| fhwa-ear-pruned-mobilenetv4-conv-s (podado) | 9.854.604 | no aplica | mIoU VAL522 73,00%; TEST523 73,67%; 13,92 FPS | no disponible | Hugging Face |
| Baseline expandido del proyecto FHWA EAR | 42.163.761 | no aplica | mIoU VAL522 79,32%; TEST523 81,50%; 9,97 FPS | no disponible | Referenciado en la model card |
| Otros modelos de segmentación de pavimentos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas externas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de test fijo (TEST523) contribuyó a la aceptación final del release; sus métricas no deben interpretarse como una estimación intacta de generalización.
- La caída de calidad respecto al baseline es notable: 6,32 puntos de mIoU en validación y 7,83 puntos en test fijo.
- Modelo de investigación: no se documentan sesgos conocidos, pero tampoco se ofrece información sobre la composición del dataset ni sobre su cobertura geográfica o de condiciones de captura.
- Riesgo de error en clases minoritarias o condiciones de imagen distintas a las del dataset de entrenamiento; no se aportan métricas por clase.
- Licencia no disponible: no puede asumirse uso comercial sin aclaración previa con el autor.
- Idiomas no disponibles: al ser un modelo de visión, la noción de idioma no aplica directamente, pero no se documenta la procedencia de los datos.
- Solo se reportan mediciones en FP32; no hay datos de cuantización ni de despliegue en precisiones reducidas.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los artefactos pueden no estar completamente disponibles o que el repositorio es reciente.

## Enlaces

- Hugging Face: https://huggingface.co/JunlongLiu/fhwa-ear-pruned-mobilenetv4-conv-s
- Proyecto y entregables: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI
