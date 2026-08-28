# OpenExplorer/maptr_henet_tinym_bevformer

## Resumen

MapTR+HENet (BevFormer) es un modelo de visión por computador desarrollado por Horizon Robotics bajo el nombre de OpenExplorer, diseñado para la construcción de mapas vectorizados en línea a partir de imágenes de múltiples cámaras. El modelo combina el backbone HENet-tiny, preentrenado dentro del ecosistema HEAL de Horizon, con el transformador de vista y el codificador BEV de BevFormer (versión de un solo fotograma) y el decodificador de MapTR, que predice elementos de mapa vectorizados como divisores, cruces peatonales y bordes de carretera. Esta tarea es fundamental para sistemas de conducción autónoma y asistencia avanzada, ya que permite generar representaciones geométricas precisas del entorno sin depender de sensores LiDAR.

El modelo está optimizado para los chips de la serie Journey (J6M, J6P, J6B) de Horizon, con métricas de latencia y rendimiento específicas para cada plataforma. Aunque el repositorio no especifica el número total de parámetros, el tamaño del archivo (1.2 GB) sugiere una arquitectura de tamaño medio. La licencia se indica como "other", por lo que se deben revisar los términos de uso antes de cualquier aplicación comercial. El modelo se publicó en agosto de 2026 y no cuenta con descargas ni valoraciones en HuggingFace, lo que indica que es una versión reciente o de acceso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HENet-tiny (backbone) + FPN (neck) + SingleFrameBevFormerViewTransformer + SingleFrameBEVFormerEncoder + decodificador MapTR con consultas de polilínea fija (20 puntos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | float (FP32), calibración (INT8), HBM (despliegue en hardware Horizon) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | no disponible (probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de percepción BEV para conducción autónoma. La entrada son seis imágenes de cámaras (una por dirección) con resolución 480×800. El backbone HENet-tiny extrae características multi-vista, que luego se combinan mediante un FPN. La transformación de vista se realiza con `SingleFrameBevFormerViewTransformer`, que proyecta las características 2D a un espacio BEV (Bird's Eye View) de 50×100 celdas, cubriendo un rango de [-30, -15, -10] a [30, 15, 10] metros. El codificador BEV de un solo fotograma procesa estas características, y el decodificador de MapTR genera tres clases de elementos de mapa (divider, ped_crossing, boundary), cada uno representado como una polilínea de 20 puntos.

El entrenamiento se realiza con la herramienta HEAL de Horizon, que incluye etapas de cuantización y calibración. La model card indica que no hay etapa de QAT (Quantization Aware Training) para esta tarea. El backbone HENet está preentrenado, pero no se especifican los datos de entrenamiento ni el número de tokens (al ser un modelo de visión, no aplica). No se menciona el uso de RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en la integración de HENet con el framework BevFormer y MapTR, optimizada para el hardware de Horizon.

## Capacidades

- Detección de elementos de mapa vectorizados: divisores de carril, cruces peatonales y bordes de carretera, cada uno representado como una polilínea de 20 puntos.
- Entrada multi-cámara: procesa simultáneamente seis imágenes de cámaras (frontal, trasera, laterales, etc.) para generar una vista BEV unificada.
- Construcción de mapas en línea: genera el mapa vectorizado en tiempo real a partir de un solo fotograma, sin necesidad de acumulación temporal (queue_length=1).
- Salida geométrica: produce coordenadas (x, y) para cada punto de las polilíneas, lista para su uso en planificación de trayectorias o control.
- Optimización para hardware Horizon: el modelo está calibrado y compilado para los chips J6M, J6P y J6B, con soporte para cuantización INT8 y HBM.
- Sin capacidades de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento multimodal en el sentido de texto-imagen.

## Casos de uso

- Percepción para conducción autónoma: el modelo puede integrarse en el stack de percepción de un vehículo autónomo para detectar carriles, cruces peatonales y bordes en tiempo real, alimentando al módulo de planificación de ruta.
- Sistemas ADAS (asistencia avanzada al conductor): útil para alertas de cambio de carril, mantenimiento de carril y frenado de emergencia en cruces peatonales, gracias a su baja latencia (9.3 ms en J6M).
- Mapeo HD en línea: permite actualizar mapas de alta definición de forma dinámica sin depender de LiDAR, reduciendo costes de sensorización.
- Simulación de conducción: puede usarse en entornos simulados para generar mapas vectorizados a partir de imágenes sintéticas de cámaras, facilitando el desarrollo de algoritmos.
- Generación de mapas para vehículos de reparto autónomo: en entornos urbanos o de campus, el modelo puede crear mapas de carriles y zonas peatonales a partir de cámaras montadas en el vehículo.
- Investigación en visión BEV: sirve como referencia para estudiar la combinación de backbones ligeros (HENet) con arquitecturas BEV, especialmente en plataformas embebidas.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión para la tarea de construcción de mapas vectorizados, medidas con el indicador chamfer mAP (MAP). Los resultados se obtuvieron en el chip J6M con el compilador hbdk4 4.11.11 y las versiones de HEAL 0.0.2 y horizon_plugin_pytorch 3.3.10.

| March | Métrica | Float | Calibración | QAT | HBM |
|---|---|---|---|---|---|
| J6M | chamfer mAP | 0.6626 | 0.6588 | — | 0.6315 |

No se dispone de benchmarks comparativos con otros modelos (como MMLU, HumanEval, etc.) porque el modelo es específico para visión y no para tareas de lenguaje. Tampoco se publican resultados frente a alternativas como MapTR original u otros detectores de carriles.

Además, se reportan métricas de rendimiento en diferentes chips de la serie Journey:

| March | Latencia (ms) | FPS | Memoria DDR (MB) |
|---|---|---|---|
| J6M | 9.30 | 111.22 | 88.40 |
| J6P | 6.16 | 663.68 | 83.30 |
| J6B | 33.28 | 30.85 | 80.00 |

La latencia se mide con un solo núcleo y un solo hilo; el FPS se mide con 8 hilos en un solo núcleo. La memoria es el pico de uso de DDR.

## Requisitos de hardware

- El modelo está diseñado para los chips de la serie Journey de Horizon (J6M, J6P, J6B). No se proporcionan requisitos para GPUs convencionales (NVIDIA, AMD).
- En J6M, la latencia es de 9.30 ms y el consumo de memoria DDR es de 88.40 MB; en J6P, la latencia baja a 6.16 ms y el FPS alcanza 663.68; en J6B, la latencia sube a 33.28 ms y el FPS es de 30.85.
- No hay información sobre si el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) ni sobre la VRAM necesaria en esos entornos.
- Las opciones de despliegue están ligadas al toolchain de Horizon: HEAL para entrenamiento y cuantización, y hbdk4 para compilación. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- El tamaño del repositorio (1.2 GB) sugiere que los pesos completos en float ocupan aproximadamente ese espacio; tras la cuantización INT8 o HBM, el tamaño se reduciría, pero no se especifica.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos en la información disponible. Sin embargo, se puede contextualizar frente a la arquitectura original de MapTR (referencia https://arxiv.org/abs/2208.14437), que utiliza un backbone diferente (por ejemplo, ResNet o Swin Transformer) en lugar de HENet. La principal diferencia es que HENet está desarrollado dentro del ecosistema HEAL de Horizon, lo que permite una integración más eficiente con el hardware J6. No se dispone de datos numéricos de comparación de precisión o rendimiento con otras variantes de MapTR ni con modelos como BEVFormer original o HDMapNet. Por tanto, la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos de uso; es necesario contactar con Horizon Robotics o revisar los archivos del repositorio para conocer las restricciones de uso comercial, modificación o redistribución.
- El modelo solo detecta tres clases de elementos de mapa (divider, ped_crossing, boundary); no cubre señales de tráfico, marcas viales adicionales u otros objetos relevantes para la conducción.
- La entrada está fijada a seis cámaras con resolución 480×800; cualquier cambio en el número de cámaras o en la resolución requeriría reentrenamiento o adaptación.
- No se proporcionan datos sobre el comportamiento en condiciones climáticas adversas (lluvia, nieve, noche) ni sobre la robustez frente a oclusiones o cambios de iluminación.
- Al ser un modelo de visión, no presenta riesgos de alucinación textual, pero sí puede generar falsos positivos o negativos en la detección de elementos de mapa, lo que debe validarse en entornos de producción.
- La precisión reportada (chamfer mAP 0.6626 en float) se obtuvo en un entorno específico (J6M); el rendimiento puede variar en otros hardware o con diferentes configuraciones de cámaras.
- No se incluyen instrucciones detalladas para reproducir el entrenamiento ni los datos utilizados, lo que limita la capacidad de auditar o mejorar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/maptr_henet_tinym_bevformer
- Repositorio oficial de MapTR: https://github.com/hustvl/MapTR
- Paper de MapTR (arXiv): https://arxiv.org/abs/2208.14437
- Blog de Horizon sobre despliegue en chips J6: https://developer.horizon.auto/blog/14100
- Documentación del toolchain OpenExplorer (ejemplo de entrenamiento MapTR): https://doc.oe.horizon.auto/3.5.0/en/guide/advanced_content/hat/examples/maptroe.html
