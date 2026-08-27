# OpenExploer/bevformer_tiny_resnet50_detection

## Resumen

BEVFormer-tiny (ResNet-50) es un modelo de detección de objetos 3D en visión por computador para conducción autónoma, desarrollado por los equipos de SenseTime y la Universidad de Tsinghua. Su objetivo es transformar secuencias de imágenes de múltiples cámaras en una representación unificada en vista de pájaro (BEV, Bird's-Eye-View) mediante mecanismos de atención espacio-temporal aprendibles, lo que permite detectar objetos tridimensionales (vehículos, peatones, etc.) sin depender de sensores LiDAR. Esta versión "tiny" está optimizada para despliegue eficiente en plataformas de borde, como los chips Horizon J6, y se basa en un backbone ResNet-50 con FPN y un decodificador estilo DETR.

El modelo es relevante porque aborda un problema crítico en la percepción autónoma: la fusión de múltiples vistas de cámara en un espacio BEV unificado, con un coste computacional reducido que permite su ejecución en hardware embebido. La arquitectura combina atención temporal (para aprovechar la información de frames anteriores) y atención cruzada espacial (para relacionar las proyecciones de las cámaras), logrando un equilibrio entre precisión y eficiencia. El repositorio de HuggingFace contiene los pesos del modelo (1,4 GB) junto con métricas de despliegue para los chips J6M y J6P, lo que facilita su integración en sistemas de conducción autónoma de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (backbone) + FPN (neck) + BEVFormerEncoder (atención temporal y espacial) + BEVFormerDetDecoder (decodificador DETR) |
| Parametros totales | no disponible (tamaño del repo: 1,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imágenes) |
| Tipos de cuantizacion | no disponible (se mencionan métricas para calibración, QAT y HBM en la model card) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | other (no se especifica la licencia exacta) |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

BEVFormer-tiny sigue el diseño del BEVFormer original, presentado en el paper "BEVFormer: Learning Bird's-Eye-View Representation from Multi-Camera Images via Spatiotemporal Transformers" (ECCV 2022). La arquitectura se compone de:

- **Backbone**: ResNet-50 preentrenado en ImageNet (sin capa de clasificación final) que extrae características de cada imagen de cámara.
- **Neck**: FPN (Feature Pyramid Network) que produce mapas de características multi-escala, con salida de stride 32 y 256 canales.
- **BEVFormerEncoder**: módulo que combina Temporal Self-Attention (para fusionar información de frames anteriores) y Spatial Cross-Attention (para proyectar características de las cámaras al espacio BEV). Este encoder genera una representación BEV unificada.
- **BEVFormerDetDecoder**: decodificador estilo DETR con 900 queries y 10 clases, que predice cajas 3D (centro, tamaño, orientación) mediante asignación húngara y pérdida combinada de FocalLoss y L1Loss.

El modelo se entrena en el dataset nuScenes, con secuencias de 6 cámaras. Durante el entrenamiento se usa una cola de 3 frames (queue_length=3) para la atención temporal, mientras que en evaluación se usa un solo frame. La entrada es una secuencia de imágenes de 6 cámaras con resolución 480×800 (tras redimensionar desde 900×1600 y aplicar padding). No se dispone de información sobre el número total de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, ya que es un modelo de visión supervisado.

## Capacidades

- Detección de objetos 3D en vista de pájaro (BEV) a partir de múltiples cámaras, con salida de cajas 3D (clase, centro, tamaño, orientación).
- Fusión temporal: utiliza información de frames anteriores para mejorar la detección en escenarios dinámicos.
- Soporte multi-cámara: procesa simultáneamente 6 vistas de cámara y las integra en una representación BEV unificada.
- Optimizado para despliegue en hardware de borde (chips Horizon J6), con métricas de latencia y FPS publicadas.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es exclusivamente un modelo de percepción visual.

## Casos de uso

- Percepción en vehículos autónomos: el modelo puede integrarse en el pipeline de percepción de un vehículo para detectar vehículos, peatones y otros objetos en 3D a partir de las cámaras del vehículo, proporcionando información de posición y orientación en el espacio BEV.
- Sistemas avanzados de asistencia a la conducción (ADAS): su baja latencia (21,8 ms en J6M, 14,07 ms en J6P) permite su uso en tiempo real para funciones como frenado de emergencia o control de crucero adaptativo.
- Plataformas de robótica móvil: cualquier robot con múltiples cámaras puede beneficiarse de la detección 3D en BEV para navegación y evitación de obstáculos, especialmente en entornos con restricciones de energía y cómputo.
- Simulación y validación de sistemas de conducción: el modelo puede usarse en entornos simulados para generar ground truth de detección 3D a partir de cámaras virtuales, reduciendo la dependencia de sensores LiDAR.
- Edge computing en infraestructura vial: desplegado en unidades de carretera (RSU) para monitorizar intersecciones y detectar objetos en 3D desde múltiples cámaras fijas, con el fin de mejorar la seguridad vial.
- Investigación en fusión de sensores: sirve como referencia para comparar arquitecturas de detección 3D basadas solo en cámaras frente a enfoques multimodales, gracias a su implementación pública y su diseño modular.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión y rendimiento para el despliegue en chips Horizon J6. No se incluyen comparaciones con otros modelos en la información disponible.

**Precisión (NDS, NuScenes Detection Score) según configuración de marcha J6M:**

| Configuracion | NDS |
|---|---|
| float | 0,3739 |
| calibracion | 0,3607 |
| qat | 0,3734 |
| hbm | 0,3669 |

**Rendimiento en chips Horizon:**

| March | Latencia (ms) | FPS | Memoria (DDR, MB) |
|---|---|---|---|
| J6M | 21,80 | 46,62 | 108,20 |
| J6P | 14,07 | 277,01 | 108,60 |
| J6B | no disponible | no disponible | no disponible |

Nota: el FPS se mide con un solo núcleo y 8 hilos; la latencia es de un solo núcleo y un solo hilo. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo está diseñado específicamente para los chips Horizon J6 (J6M, J6P, J6B). Las métricas publicadas indican que en J6M alcanza 46,62 FPS con 108,2 MB de memoria DDR, y en J6P 277,01 FPS con 108,6 MB.
- No se proporcionan requisitos de VRAM para GPU convencionales. Dado el tamaño del repo (1,4 GB), se estima que podría ejecutarse en GPUs con al menos 4 GB de VRAM en FP32, pero no hay datos oficiales.
- Para despliegue en GPU, se podría usar el framework original (MMDetection3D) o la implementación en PyTorch puro disponible en GitHub, aunque no se documentan opciones de inferencia como vLLM, llama.cpp u Ollama (no aplicables a un modelo de visión).
- La latencia en J6M (21,8 ms) y J6P (14,07 ms) es adecuada para aplicaciones en tiempo real en vehículos, pero en GPUs de consumo el rendimiento dependerá de la implementación y de la resolución de entrada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección 3D BEV en la documentación proporcionada. Modelos como DETR3D, BEVFormer-base o PETR podrían ser comparables, pero no se han publicado datos de rendimiento relativo en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia se indica como "other", lo que implica que no se especifica una licencia estándar (Apache 2.0, MIT, etc.). Es necesario contactar con el autor o revisar el repositorio original para conocer las restricciones de uso comercial.
- El modelo está optimizado para hardware Horizon J6; su rendimiento en otras plataformas (GPU, CPU) no está documentado y podría degradarse significativamente.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de visión, los riesgos típicos incluyen errores en condiciones de baja iluminación, oclusiones o climas adversos, que no están cuantificados.
- La precisión NDS de 0,3739 en float es modesta en comparación con modelos más grandes (p. ej., BEVFormer-base), lo que puede limitar su uso en aplicaciones que requieran alta exactitud.
- El modelo solo procesa imágenes de 6 cámaras con una resolución fija (480×800); no se documenta soporte para otros números de cámaras o resoluciones.
- No se incluyen instrucciones de instalación ni ejemplos de uso en la model card, lo que puede dificultar su integración para desarrolladores no familiarizados con el ecosistema Horizon.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/bevformer_tiny_resnet50_detection
- Repositorio oficial (BEVFormer): https://github.com/fundamentalvision/BevFormer
- Paper (arXiv): https://arxiv.org/abs/2203.17270
- Documentación de despliegue en APLUX: https://docs.aidlux.com/en/software/tutorial/ai-dev/bevformer_tiny_aidlite
- Implementación en PyTorch puro (educativa): https://github.com/akashprakas/bevformer_tiny
- Ficha del modelo en AIoT APLUX: https://aiot.aidlux.com/en/models/detail/297
- Blog de Horizon sobre despliegue en chips J6: https://developer.horizon.auto/blog/10006
