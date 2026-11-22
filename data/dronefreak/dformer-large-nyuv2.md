# dronefreak/dformer-large-nyuv2

## Resumen

DFormer-L es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou) y presentado en ICLR 2024. Resuelve la tarea de segmentación semántica de escenas interiores combinando una imagen RGB con su mapa de profundidad, y su aportación principal es un encoder preentrenado que aprende representaciones geométricas de la profundidad en lugar de limitarse a concatenar el canal de profundidad a la entrada RGB.

El repositorio `dronefreak/dformer-large-nyuv2` es un espejo no oficial de los pesos oficiales, publicados originalmente en el repositorio GitHub de VCIP-RGBD. Los pesos son idénticos a los del release original; el espejo añade una copia en `model.safetensors` (solo pesos, sin estado del optimizador), un `config.json` con metadatos y el encoder preentrenado en `pretrained/`. La arquitectura es un transformer con encoder RGB-D preentrenado en ImageNet-1K con profundidad y un decoder ligero, con 39.037.928 parámetros totales.

Con 57,2 mIoU en NYUv2 a escala única, DFormer-L se sitúa en la franja alta de los modelos RGB-D para segmentación interior, con un coste computacional moderado (39 M de parámetros) que lo hace viable en GPUs de consumo. Es relevante para robótica móvil, realidad aumentada y análisis de interiores, donde la profundidad está disponible de forma nativa (LiDAR, cámaras estéreo o sensores ToF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (transformer con encoder RGB-D preentrenado y decoder ligero) |
| Parametros totales | 39.037.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; al ser safetensors FP32 es convertible a FP16/BF16) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase de NYUv2 están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch `.pth` (`NYUv2_DFormer_Large.pth`) y `.pth.tar` para el encoder preentrenado |

## Arquitectura y entrenamiento

DFormer es un transformer diseñado específicamente para RGB-D. A diferencia de los enfoques que inyectan la profundidad como un cuarto canal o mediante fusión tardía, el modelo aprende representaciones geométricas de la profundidad durante el preentrenamiento y las integra en el encoder. El bloque constructivo es un encoder jerárquico con atención, seguido de un decoder ligero que produce el mapa de segmentación semántica a resolución completa.

El pipeline de entrenamiento consta de dos fases: primero, un preentrenamiento del encoder en ImageNet-1K enriquecido con mapas de profundidad (el checkpoint del encoder se distribuye en `pretrained/DFormer_Large.pth.tar`); después, un ajuste fino supervisado sobre NYUv2 para la tarea de segmentación semántica interior. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación tipo RLHF/DPO (no aplicables a un modelo discriminativo de visión). El checkpoint `.pth.tar` del encoder almacena argumentos de entrenamiento, por lo que debe cargarse con `weights_only=False`.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D (40 clases en NYUv2).
- Fusión explícita de información geométrica de profundidad con apariencia RGB, lo que mejora la delimitación de superficies y objetos en interiores.
- Predicción por píxel con resolución de salida completa (mapa de etiquetas del mismo tamaño que la entrada).
- Inferencia en una sola pasada (single-scale) sin necesidad de multi-escala ni test-time augmentation para alcanzar los resultados reportados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- Capacidades multilingües no aplicables; las etiquetas de clase son las del dataset NYUv2 (inglés).
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de RGB y profundidad.

## Casos de uso

- Robótica móvil interior: el modelo recibe el par RGB-D de la cámara del robot y devuelve un mapa semántico por píxel que permite distinguir suelo, paredes, muebles y obstáculos para planificación de navegación, aprovechando que la profundidad ya está disponible en el sensor.
- Realidad aumentada y mixta: segmentación en tiempo real de la escena para oclusión correcta de objetos virtuales detrás de superficies reales, usando la profundidad del sensor para resolver ambigüedades de escala.
- Reconstrucción 3D semántica: etiquetado de nubes de puntos o mallas generadas a partir de secuencias RGB-D, asignando clase semántica a cada vértice a partir de las predicciones por píxel proyectadas.
- Análisis de interiores y tasación automática: identificación de estancias, mobiliario y elementos estructurales en imágenes de inmuebles capturadas con cámaras de profundidad de consumo.
- Asistencia a personas con discapacidad visual: descripción semántica del entorno interior (detección de obstáculos, escaleras, puertas) a partir de un par RGB-D de gafas o móviles con sensor de profundidad.
- Automatización de inventario en retail y almacenes: segmentación de estanterías, productos y suelo en pasillos interiores con cámaras RGB-D fijas o montadas en robots.
- Preentrenamiento y ajuste fino para tareas derivadas: el encoder RGB-D preentrenado en ImageNet-1K con profundidad puede reutilizarse como backbone en detección de objetos, segmentación de instancias o estimación de superficies en dominios interiores.

## Benchmarks y rendimiento

| Benchmark | Metrica | DFormer-L |
|---|---|---|
| NYUv2 | mIoU (single-scale) | 57,2 |

No se han publicado en la información disponible resultados de benchmarks adicionales (otras escalas, otros datasets RGB-D como SUN RGB-D, ablaciones o comparativas numéricas con modelos alternativos). El único dato reportado por los autores en la model card es el mIoU de 57,2 en NYUv2 a escala única.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 39 M de parámetros (unos 156 MB en FP32 y unos 78 MB en FP16); con activaciones para una entrada de resolución típica de NYUv2 (640x480) el consumo se mantiene por debajo de 1-2 GB en FP16, aunque la cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento o ajuste fino se recomienda RTX 4090, A100 o H100.
- Cabe holgadamente en GPUs de consumo (GTX 1650, RTX 3050 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: al ser un modelo PyTorch con código oficial en GitHub, el despliegue se realiza mediante el repositorio VCIP-RGBD/DFormer; no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje). Es posible exportar a ONNX o TensorRT para producción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-L (este) | 39,0 M | RGB + profundidad | 57,2 (single-scale) | MIT | Hugging Face (espejo) y GitHub oficial |
| DFormer-S / DFormer-B | no disponible en la informacion | RGB + profundidad | no disponible en la informacion | MIT | GitHub oficial |
| Otros modelos RGB-D para NYUv2 | no disponible | RGB + profundidad | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de cifras comparativas verificadas frente a alternativas como CMX, GeminiFusion o TokenFusion, por lo que no se incluyen datos numéricos que no estén respaldados por la model card.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de escenas interiores; no generaliza a texto, código ni tareas de lenguaje.
- Entrenado y evaluado en NYUv2 (interiores, 40 clases); el rendimiento puede degradarse en escenas exteriores, dominios visuales distintos o con sensores de profundidad diferentes a los del dataset.
- Requiere un mapa de profundidad alineado con la imagen RGB; sin profundidad de calidad la fusión geométrica pierde eficacia.
- Riesgo de errores en clases poco representadas del dataset y en objetos ocluidos o de pequeño tamaño.
- Sesgos potenciales derivados de la distribución del dataset NYUv2 (escenas de interior de determinadas regiones y tipos de vivienda), no documentados cuantitativamente en la model card.
- Licencia MIT permite uso comercial, pero el espejo no es un release oficial: para producción conviene verificar contra el repositorio original de VCIP-RGBD.
- El checkpoint `.pth.tar` del encoder almacena argumentos de entrenamiento y requiere `weights_only=False` al cargarse, lo que implica riesgos de seguridad si la fuente no es de confianza.
- No se documentan cuantizaciones oficiales ni recetas de exportación a ONNX/TensorRT; el soporte de despliegue depende del código oficial.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/dformer-large-nyuv2
- Repositorio oficial de código: https://github.com/VCIP-RGBD/DFormer
- Paper (arXiv): https://arxiv.org/abs/2309.09668
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
