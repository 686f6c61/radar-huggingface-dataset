# dronefreak/emsanet-r34-nbt1d-sunrgbd

## Resumen

EMSANet (ResNet34-NBt1D) es una red neuronal convolucional multi-tarea diseñada para el análisis de escenas de interior a partir de datos RGB-D (imagen en color más mapa de profundidad). El modelo original fue desarrollado por el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter, Söhnke Fischedick, Mona Köhler y Horst-Michael Gross) y presentado en la conferencia IJCNN 2022 bajo el título "Efficient Multi-Task RGB-D Scene Analysis for Indoor Environments". El repositorio analizado es un espejo no oficial creado por el usuario dronefreak que redistribuye los pesos originales sin modificaciones, añadiendo una copia en formato safetensors y un fichero de configuración.

El modelo resuelve simultáneamente cinco tareas: segmentación semántica, segmentación de instancias, segmentación panóptica, estimación de orientación de instancias y clasificación de escena. Para ello emplea dos codificadores ResNet34-NBt1D independientes, uno para la modalidad RGB y otro para la profundidad, combinados mediante un mecanismo de fusión basado en atención. Con 64,3 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo compacto orientado a robótica móvil y percepción embebida, donde el coste computacional y la latencia importan tanto como la precisión.

Su relevancia actual radica en que ofrece un punto de partida reproducible y con licencia permisiva (Apache-2.0) para tareas de comprensión de escena RGB-D en interiores, un nicho donde abundan los modelos propietarios o con pesos no redistribuibles. Los pesos están entrenados sobre el conjunto SUN RGB-D con 37 clases semánticas y codificadores inicializados con ImageNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMSANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión basada en atención y cabezas multi-tarea |
| Parametros totales | 64.305.658 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase son las 37 clases de SUN RGB-D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`r34_NBt1D.pth`, dict con `state_dict`) |

## Arquitectura y entrenamiento

EMSANet es una arquitectura convolucional multi-tarea compuesta por dos codificadores ResNet34-NBt1D, uno por cada modalidad de entrada (RGB y profundidad). La variante NBt1D introduce bloques de normalización por lotes adaptados a la dimensionalidad de las características. Las representaciones de ambos codificadores se combinan mediante un módulo de fusión basado en atención, tras lo cual varias cabezas específicas de tarea producen las salidas de segmentación semántica, instancias, panóptica, orientación de instancia y clasificación de escena. Los codificadores se inicializan con pesos preentrenados en ImageNet (fichero `pretrained/imagenet_r34_NBt1D.pth` incluido en el repositorio).

El entrenamiento se realiza sobre SUN RGB-D con 37 clases semánticas. La model card no detalla el número de tokens o imágenes vistas, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicable en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; la contribución técnica del paper es la fusión multi-modal eficiente y el enfoque multi-tarea unificado para percepción de interiores.

## Capacidades

- Segmentación semántica de escenas de interior en 37 clases sobre pares RGB-D.
- Segmentación de instancias y segmentación panóptica (segmentación semántica e instancias combinadas).
- Estimación de orientación de instancias (ángulo de los objetos detectados).
- Clasificación de escena a nivel de imagen.
- Procesamiento conjunto de modalidad RGB y profundidad con fusión por atención.
- Inferencia multi-tarea en una sola pasada de red, lo que reduce coste frente a pipelines separados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo.
- No dispone de modo de razonamiento (thinking mode), ni entrada/salida de audio o texto.

## Casos de uso

- Robótica móvil de interior: el modelo proporciona segmentación semántica y de instancias en tiempo real a bordo de un robot equipado con cámara RGB-D, permitiendo distinguir suelo, muebles, paredes y obstáculos para la planificación de navegación.
- Manipulación robótica: la estimación de orientación de instancias y la segmentación panóptica permiten localizar objetos sobre una mesa y calcular su pose aproximada para el agarre.
- Asistencia a personas con discapacidad visual: un sistema portátil con cámara de profundidad puede usar la clasificación de escena y la segmentación semántica para describir el entorno (por ejemplo, "hay una silla a la derecha") mediante síntesis de voz.
- Digitalización y modelado 3D de interiores: la segmentación panóptica sobre secuencias RGB-D facilita el etiquetado automático de muebles y estructuras en flujos de reconstrucción de escenas.
- Análisis de accesibilidad en edificios: la clasificación de escena y la detección de elementos como escaleras, puertas o pasillos permiten auditar espacios y detectar barreras arquitectónicas.
- Investigación en percepción multi-tarea: sirve como línea base reproducible y con licencia permisiva para comparar nuevas arquitecturas de fusión RGB-D o estrategias de multi-tarea en el benchmark SUN RGB-D.
- Vehículos autónomos de interior (AGV/AMR): la segmentación semántica en pasillos y almacenes permite distinguir zonas transitables de estanterías y personas, alimentando el sistema de evitación de obstáculos.

## Benchmarks y rendimiento

Resultados reportados por los autores en la model card para SUN RGB-D:

| Metrica | Valor |
|---|---|
| mIoU (segmentación semántica) | 48,39 |
| PQ (panoptic quality) | 50,15 |
| RQ (recognition quality) | 58,14 |
| SQ (segmentation quality) | 84,85 |
| MAAE de orientación | 14,24 |
| bAcc de clasificación de escena | 61,83 |

La model card remite al README oficial del repositorio de GitHub para las tablas completas, velocidades de inferencia y detalles de evaluación. No se proporcionan en la información disponible resultados comparativos con otros modelos en el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 64,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 257 MB; en FP16, unos 129 MB. La memoria adicional depende de la resolución de entrada y del tamaño de las activaciones intermedias.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en FP32 a resoluciones habituales de SUN RGB-D (640x480). Se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 6 GB o más de VRAM (GTX 1660, RTX 2060, RTX 3050 en adelante).
- Opciones de despliegue: el modelo se ejecuta con el código oficial de TUI-NICR/EMSANet (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de visión convolucional. Es posible exportar a TorchScript u ONNX para despliegue en producción, aunque no se proporcionan recetas oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el README oficial del repositorio incluye tablas de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMSANet (ResNet34-NBt1D) | 64,3 M | Segmentación RGB-D multi-tarea (semántica, instancias, panóptica, orientación, escena) | Imagen RGB + profundidad | Apache-2.0 | Pesos en HF (espejo) y Google Drive original |
| Modelos de segmentación semántica RGB-D comparables | no disponible | Segmentación semántica | Imagen RGB + profundidad | no disponible | no disponible |
| Modelos de segmentación panóptica RGB-D comparables | no disponible | Segmentación panóptica | Imagen RGB + profundidad | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa. La comparativa se limita a la categoría funcional.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el repositorio no está mantenido por los autores y podría desaparecer o cambiar sin aviso.
- Dominio restringido: entrenado exclusivamente en SUN RGB-D (escenas de interior, 37 clases). El rendimiento fuera de ese dominio (exteriores, industria, otras cámaras) no está garantizado.
- Dependencia del sensor de profundidad: la calidad de la profundidad afecta directamente a la fusión por atención; cámaras de bajo coste o condiciones de iluminación adversas pueden degradar los resultados.
- Métricas moderadas: un mIoU de 48,39 y una precisión de clasificación de escena de 61,83 indican margen de error considerable para aplicaciones críticas; se recomienda validación específica en el dominio de despliegue.
- Riesgo de confusión entre clases visualmente similares (por ejemplo, tipos de sillas o mesas) inherente a la segmentación semántica de grano fino.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a los autores originales; el espejo incluye un descargo de responsabilidad que conviene revisar.
- No es un modelo generativo: no produce texto, no razona y no soporta instrucciones en lenguaje natural; cualquier capa de interacción debe construirse por separado.
- Sin soporte documentado de cuantización: no se ofrecen variantes INT8/INT4 ni recetas de despliegue en hardware embebido, lo que puede requerir trabajo adicional para robótica de bajo consumo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/emsanet-r34-nbt1d-sunrgbd
- Repositorio oficial de código: https://github.com/TUI-NICR/EMSANet
- Paper (arXiv): https://arxiv.org/abs/2207.04526
- DOI del paper: https://doi.org/10.1109/IJCNN55064.2022.9892852
- Dataset SUN RGB-D (espejo en el Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
