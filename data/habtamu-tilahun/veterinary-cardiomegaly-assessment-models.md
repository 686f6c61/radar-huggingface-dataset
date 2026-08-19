# Habtamu-Tilahun/veterinary-cardiomegaly-assessment-models

## Resumen

El repositorio `Habtamu-Tilahun/veterinary-cardiomegaly-assessment-models` contiene los pesos entrenados de dos modelos **Mask R-CNN** para la evaluación automática de cardiomegalia (agrandamiento cardíaco) en perros y gatos mediante radiografías torácicas. El primer modelo (`model_4050_512_2_5e-3.pth`) está diseñado para la estimación del **VHS (Vertebral Heart Size)** a partir de radiografías en proyección lateromedial (LM), realizando la segmentación de las estructuras anatómicas necesarias para el cálculo. El segundo (`model_5600_256_2_5e-3.pth`) se centra en la estimación del **CTR (Cardiothoracic Ratio)** usando radiografías en proyección ventrodorsal (VD), segmentando el corazón y la cavidad torácica.

Los modelos se publican como parte de la implementación del artículo científico de Mekonnen H.T. et al. (2025) en *Frontiers in Veterinary Science*, con DOI 10.3389/fvets.2025.1612338. Están destinados a fines de investigación y educativos, con licencia Apache 2.0. El tamaño total del repositorio es de 1,1 GB, e incluye los pesos en formato PyTorch (`.pth`). No se proporcionan detalles sobre el número de parámetros, arquitectura exacta (más allá de ser Mask R-CNN), ni métricas de rendimiento en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN (dos variantes: una para VHS, otra para CTR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en formato `.pth`, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de visión, sin componente de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura base es **Mask R-CNN**, un modelo de segmentación de instancias que combina una red de detección de objetos (Region Proposal Network) con una rama de segmentación a nivel de píxel. Se han entrenado dos instancias independientes: una para la segmentación de estructuras anatómicas en radiografías lateromediales (para VHS) y otra para la segmentación del corazón y la cavidad torácica en radiografías ventrodorsales (para CTR). Los nombres de los archivos (`4050_512_2_5e-3` y `5600_256_2_5e-3`) sugieren el número de iteraciones (4050 y 5600), el tamaño de entrada (512 y 256 píxeles) y la tasa de aprendizaje (2,5e-3), aunque estos detalles no se confirman en la documentación. No se especifica el conjunto de datos de entrenamiento, el número de épocas, ni si se aplicaron técnicas de aumento de datos o preentrenamiento.

## Capacidades

- Segmentación de instancias en radiografías torácicas de perros y gatos.
- Estimación del **VHS (Vertebral Heart Size)** a partir de proyecciones lateromediales (LM).
- Estimación del **CTR (Cardiothoracic Ratio)** a partir de proyecciones ventrodorsales (VD).
- Segmentación de estructuras anatómicas cardíacas y torácicas necesarias para el cálculo de métricas clínicas.
- Orientado a diagnóstico veterinario asistido por imagen.
- No incluye capacidades de generación de texto, tool calling, ni procesamiento de lenguaje natural.

## Casos de uso

- **Diagnóstico asistido de cardiomegalia en veterinaria**: el modelo puede segmentar automáticamente el corazón y las vértebras torácicas en radiografías, permitiendo calcular el VHS y el CTR sin intervención manual. Esto agiliza la evaluación clínica en consultas veterinarias.
- **Screening poblacional en clínicas veterinarias**: al automatizar la medición de VHS y CTR, se pueden procesar grandes volúmenes de radiografías de forma consistente, reduciendo la variabilidad entre observadores.
- **Herramienta educativa para estudiantes de veterinaria**: los mapas de segmentación generados pueden servir como referencia visual para enseñar la anatomía radiológica cardíaca y la interpretación de medidas.
- **Investigación en cardiología veterinaria**: los pesos del modelo permiten reproducir los experimentos del artículo original y servir como punto de partida para estudios sobre la correlación entre VHS/CTR y enfermedades cardíacas.
- **Integración en sistemas de PACS (Picture Archiving and Communication System)**: el modelo puede incorporarse como un plugin que procesa radiografías automáticamente y añade las mediciones al informe radiológico.
- **Telemedicina veterinaria**: en entornos remotos donde no hay especialistas disponibles, el modelo puede proporcionar una evaluación preliminar de la presencia de cardiomegalia antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, sensibilidad, especificidad, ni comparaciones con otros métodos. El único dato cuantitativo es el tamaño del repositorio (1,1 GB) y los nombres de los archivos que sugieren hiperparámetros de entrenamiento.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que es un modelo Mask R-CNN con pesos en formato `.pth`, el consumo de VRAM dependerá del backbone (ResNet50/101 u otro) y del tamaño de entrada (512×512 o 256×256). En una GPU con 8 GB de VRAM podría ser viable para inferencia con lotes pequeños, pero no se puede confirmar.
- **GPU recomendadas**: no se especifican. Para entrenamiento se requeriría una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, A100). Para inferencia, una GPU de gama media (RTX 3060, RTX 4060) podría ser suficiente si se reduce el tamaño del lote.
- **¿Cabe en GPU de consumo?**: probablemente sí para inferencia, dado que los pesos ocupan ~1,1 GB en disco (los dos modelos juntos). Una GPU con 8 GB de VRAM debería ser suficiente para procesar una imagen a la vez.
- **Opciones de despliegue**: al ser pesos PyTorch, se pueden cargar con `torchvision` (que incluye implementaciones de Mask R-CNN) o con frameworks como Detectron2. No se mencionan formatos optimizados (ONNX, TensorRT, etc.).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos públicos específicos para estimación de VHS y CTR en radiografías veterinarias. No hay comparativas directas en la model card ni en la documentación asociada. Por tanto, no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- **Uso restringido a investigación y educación**: la model card indica explícitamente que los modelos están destinados a fines de investigación y educativos, no a uso clínico directo sin validación adicional.
- **Falta de métricas de rendimiento**: no se publican resultados de validación, lo que impide evaluar la precisión real de las segmentaciones y las estimaciones de VHS/CTR.
- **Dependencia de la proyección radiológica**: cada modelo está entrenado para una proyección específica (LM para VHS, VD para CTR). Usar el modelo con una proyección incorrecta producirá resultados no válidos.
- **Generalización limitada**: no se especifica la diversidad de razas, tamaños, edades o equipos de rayos X utilizados en el entrenamiento. El rendimiento puede degradarse con imágenes de características diferentes a las del conjunto de entrenamiento.
- **Sin soporte de idiomas ni metadatos**: al ser un modelo de visión puro, no genera informes ni interpretaciones textuales; la salida son máscaras de segmentación.
- **Formato de pesos propietario**: los archivos `.pth` requieren el entorno de PyTorch para cargarse; no se ofrecen versiones en ONNX o TensorFlow.
- **Fecha de creación futura**: el modelo fue creado en julio de 2026 (según los metadatos), lo que puede indicar que es un proyecto reciente o con fechas simuladas; se recomienda verificar la vigencia de la documentación.

## Enlaces

- Repositorio HuggingFace: [Habtamu-Tilahun/veterinary-cardiomegaly-assessment-models](https://huggingface.co/Habtamu-Tilahun/veterinary-cardiomegaly-assessment-models)
- Artículo científico (DOI): [10.3389/fvets.2025.1612338](https://doi.org/10.3389/fvets.2025.1612338)
