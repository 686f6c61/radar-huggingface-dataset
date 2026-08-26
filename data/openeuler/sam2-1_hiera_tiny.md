# openEuler/sam2.1_hiera_tiny

## Resumen

El modelo `openEuler/sam2.1_hiera_tiny` es un paquete de despliegue del Segment Anything Model 2.1 (SAM2.1) con backbone Hiera-Tiny, preparado por openEuler para el framework IB-Robot, una plataforma de robótica orientada a inteligencia artificial en el borde. Se trata de un modelo de segmentación de imágenes basado en prompts (puntos o cajas) que genera máscaras de instancia, y está optimizado para ejecutarse en hardware Ascend (310B y 310P) además de CPU y GPU NVIDIA. Su relevancia actual reside en la creciente demanda de sistemas de visión por computador en robótica y aplicaciones de edge computing, donde la latencia y el consumo de recursos son críticos. El repositorio incluye artefactos convertidos a formato OM (Open Model) para Ascend y los pesos originales en PyTorch, manteniendo la licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera-Tiny (encoder) + decoder de máscaras |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 1024x1024) |
| Tipos de cuantizacion | no disponible (se mencionan artefactos OM, pero no se especifica cuantización) |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) y OM (Open Model) para Ascend |

## Arquitectura y entrenamiento

El modelo se basa en el checkpoint oficial de Meta AI `facebook/sam2.1-hiera-tiny`, que utiliza una arquitectura Hiera-Tiny como encoder de visión y un decoder de máscaras con predicción de IoU. Los pesos originales son los publicados por Meta para SAM2.1, sin modificaciones en el entrenamiento; openEuler los ha convertido a formato OM para los aceleradores Ascend y los ha empaquetado para el framework IB-Robot. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre técnicas adicionales como RLHF o DPO, ya que se trata de un modelo de segmentación y no de un modelo de lenguaje. La integración en IB-Robot se realiza mediante un pipeline de dos etapas: encoder y decoder, con entradas y salidas definidas en el manifiesto de inferencia.

## Capacidades

- Segmentación de imágenes mediante prompts de puntos o cajas.
- Generación de máscaras de instancia (logits de máscara, máscaras de baja resolución y predicción de IoU).
- Diseñado para despliegue en tiempo real en hardware de borde (Ascend 310B y 310P).
- Compatible con backends de CPU y GPU (NVIDIA) mediante PyTorch.
- Integración con el framework IB-Robot para tareas de robótica (percepción, interacción, etc.).
- Capacidad de procesar imágenes a resolución 1024x1024.
- No incluye capacidades de procesamiento de lenguaje natural, visión por vídeo ni generación de texto.

## Casos de uso

- **Robótica móvil**: el modelo puede segmentar obstáculos u objetos en tiempo real en un robot con hardware Ascend, permitiendo la navegación autónoma en entornos dinámicos. Su baja latencia en el edge lo hace adecuado para esta tarea.
- **Inspección industrial**: en líneas de producción, se puede usar para segmentar defectos en piezas o componentes, alimentando sistemas de control de calidad con máscaras precisas.
- **Interacción humano-robot**: para detectar y segmentar manos u objetos en escenas, facilitando la manipulación colaborativa en entornos de fabricación.
- **Sistemas de vigilancia**: la segmentación de personas o vehículos en cámaras de seguridad puede integrarse en sistemas de monitorización, con la ventaja de ejecutarse en hardware de bajo consumo.
- **Agricultura de precisión**: segmentación de plantas o frutos en imágenes de campo para la estimación de cosechas, con despliegue en dispositivos embebidos.
- **Investigación en visión por computador**: como base para experimentos de segmentación semántica o de instancias en entornos académicos, gracias a su licencia abierta y su compatibilidad con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Backends soportados**:
  - Ascend 310B1 (batch=1, artefactos OM en `artifacts/ascend_310b/`).
  - Ascend 310P1 (batch=4, artefactos OM en `artifacts/ascend_310p/`).
  - CPU (PyTorch, sin batch específico).
  - NVIDIA GPU (PyTorch, sin batch específico).
- **VRAM estimada**: no disponible, aunque el tamaño del repositorio es de 0.3 GB, lo que sugiere que los pesos son ligeros y caben en GPUs de gama media (p. ej., RTX 3060 o superiores) y en memorias de aceleradores de edge.
- **GPU recomendadas**: para despliegue en GPU, cualquier NVIDIA con al menos 4 GB de VRAM es suficiente (por ejemplo, RTX 3060, 4060). En Ascend, los modelos 310B y 310P están diseñados para inferencia en el borde.
- **Opciones de despliegue**: vLLM no es aplicable (modelo de visión); se puede usar PyTorch directamente o el runtime de IB-Robot. No se mencionan contenedores ni otros runtimes.
- **Latencia y throughput**: no se proporcionan datos numéricos en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación en la información proporcionada. El modelo es esencialmente el mismo que el `facebook/sam2.1-hiera-tiny` original, pero empaquetado para IB-Robot y con artefactos adicionales para Ascend. No se conocen alternativas en el mismo formato.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la información proporcionada.
- El modelo es de segmentación de imágenes, por lo que no procesa texto ni lenguaje natural.
- Depende del modelo base SAM2.1, que puede presentar sesgos en la segmentación según los datos de entrenamiento (aunque no se detallan aquí).
- El despliegue en Ascend requiere los artefactos OM incluidos en el repositorio; no se garantiza compatibilidad con otros formatos de hardware.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de la licencia original de SAM2 (Apache-2.0 también).
- No se incluyen herramientas de evaluación de rendimiento ni scripts de benchmarking en el repositorio.

## Enlaces

- Repositorio HuggingFace: [openEuler/sam2.1_hiera_tiny](https://huggingface.co/openEuler/sam2.1_hiera_tiny)
- Modelo base: [facebook/sam2.1-hiera-tiny](https://huggingface.co/facebook/sam2.1-hiera-tiny)
- Framework IB-Robot: [https://gitcode.com/openeuler/IB_Robot](https://gitcode.com/openeuler/IB_Robot)
- Paper SAM 2: [arXiv:2408.00714](https://arxiv.org/abs/2408.00714)
