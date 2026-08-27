# OpenExploer/petr_efficientnetb3

## Resumen

PETR (Position Embedding Transformer) es un modelo de detección de objetos 3D en entorno BEV (Bird's Eye View) desarrollado por Megvii Research, adaptado aquí por el autor OpenExploer con un backbone EfficientNet-b3. El modelo procesa imágenes multivista de seis cámaras y predice cajas de detección 3D directamente mediante un decodificador Transformer con codificación posicional 3D, sin necesidad de construir explícitamente una representación BEV. Esta implementación concreta está optimizada para su despliegue en los chips Horizon Journey (J6), como indican las métricas de rendimiento y las herramientas de compilación mencionadas en la model card.

La relevancia actual de este modelo radica en su aplicación en sistemas de conducción autónoma y percepción 3D, donde la detección precisa de objetos en el espacio tridimensional a partir de cámaras es fundamental. Al emplear EfficientNet-b3 como extractor de características, se reduce el coste computacional respecto a backbones más pesados, manteniendo un rendimiento competitivo en métricas como NDS y mAP. El modelo está diseñado para ejecutarse en hardware embebido de Horizon Robotics, lo que lo hace interesante para despliegues en vehículos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PETR (Transformer con codificación posicional 3D) con backbone EfficientNet-b3 |
| Parametros totales | no disponible (el tamaño del repositorio es 1.1 GB, pero no se especifica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | se mencionan calibración, QAT y HBM en las métricas, pero no se detallan los formatos exactos |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | no disponible (no se indica si es safetensors, ONNX, etc.) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PETR original: EfficientNet-b3 extrae características de imágenes multivista (6 cámaras), que se asocian con posiciones espaciales 3D mediante una codificación posicional senoidal 3D (SinePositionalEncoding3D). El decodificador PETRTransformer utiliza 900 queries y 6 vistas, con dimensiones de embedding de 256, para predecir directamente cajas de detección 3D. No hay un neck independiente; las características del backbone alimentan directamente a la cabeza de detección PETRHead. La función de pérdida combina FocalLoss para clasificación y L1Loss para regresión, con emparejamiento húngaro tipo Detr3dTarget.

No se proporcionan detalles sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La model card indica que el backbone es EfficientNet-b3, mientras que el repositorio oficial de PETR utiliza un backbone diferente, lo que sugiere una adaptación específica para este despliegue. Las métricas de precisión se miden con la configuración `march = March.NASH_M` (J6M) y se reportan tanto en float como tras calibración, QAT y HBM.

## Capacidades

- Detección de objetos 3D en entorno BEV a partir de imágenes multivista de 6 cámaras.
- Predicción de cajas 3D con 10 clases de objetos y 11 parámetros de regresión (centro xyz, tamaño wlh, orientación sin/cos y velocidad vxvy).
- Salida de 900 queries por imagen, lo que permite detectar múltiples objetos simultáneamente.
- Soporte para despliegue en hardware Horizon J6 (J6M, J6P) con compilación mediante hbdk4-compiler y horizon_plugin_pytorch.
- Optimización para inferencia en tiempo real: 30.51 FPS en J6M y 186.12 FPS en J6P (según la metodología de medición indicada).
- No se mencionan capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Conducción autónoma: el modelo puede integrarse en sistemas de percepción de vehículos para detectar vehículos, peatones y otros objetos en 3D a partir de cámaras, proporcionando información espacial precisa para la planificación de trayectorias.
- Sistemas avanzados de asistencia al conductor (ADAS): su baja latencia (21.56 ms en J6P) lo hace adecuado para alertas en tiempo real de colisión o cambio de carril.
- Robótica móvil: robots que operan en entornos dinámicos pueden usar la detección 3D para evitar obstáculos y navegar de forma segura.
- Vigilancia y monitoreo de tráfico: análisis de escenas urbanas con múltiples cámaras para contar vehículos, detectar infracciones o gestionar flujos de tráfico.
- Investigación en percepción 3D: como implementación de referencia de PETR con EfficientNet-b3, puede servir para comparar arquitecturas o estudiar el impacto del backbone en el rendimiento.
- Despliegue en hardware embebido: al estar optimizado para chips Horizon J6, es un candidato para integración en sistemas de bajo consumo donde las GPUs no son viables.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión y rendimiento para la configuración J6M (March.NASH_M). No se incluyen comparaciones con otros modelos en la información disponible.

| Metrica | float | calibracion | QAT | HBM |
|---|---|---|---|---|
| NDS | 0.3881 | 0.3679 | 0.38 | 0.38 |
| mAP | 0.3031 | 0.2807 | 0.2942 | 0.2942 |

| March | latencia (ms) | FPS | Uso de memoria (pico DDR) |
|---|---|---|---|
| J6M | 33.13 | 30.51 | 101.00 |
| J6P | 21.56 | 186.12 | 105.30 |
| J6B | no disponible | no disponible | no disponible |

Nota: la metodología de medición indica que FPS se mide con un solo núcleo y ocho hilos, mientras que la latencia se mide con un solo núcleo y un solo hilo. El uso de memoria es el pico de DDR.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en los chips Horizon Journey J6 (J6M, J6P, J6B). No se especifican requisitos de VRAM para GPUs convencionales.
- En J6M se logran 30.51 FPS con 101 MB de uso de memoria DDR; en J6P se alcanzan 186.12 FPS con 105.3 MB.
- No se indica si es compatible con GPUs de consumo (RTX, etc.) ni con soluciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para el despliegue se requiere el stack de Horizon: hbdk4-compiler, horizon_plugin_pytorch y la versión HEAL 0.0.2, según la model card.
- No se proporcionan datos de latencia o throughput en otros hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo original PETR (con backbone ResNet) existe en el repositorio oficial, pero no se ofrecen métricas comparativas aquí. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia es "other", lo que implica que los términos de uso no están claramente definidos; se debe contactar con el autor o consultar la documentación original antes de un uso comercial.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, ya que es un modelo de visión y no de lenguaje.
- El modelo está optimizado para hardware Horizon J6; su rendimiento en otras plataformas no está documentado y podría degradarse significativamente.
- Las métricas de precisión (NDS 0.3881, mAP 0.3031) son moderadas en comparación con modelos de última generación, aunque no se dispone de comparaciones directas.
- La entrada requiere 6 imágenes de cámaras con una forma específica (3,512,1408) tras un proceso de redimensionado y recorte; cualquier cambio en la configuración de cámaras afectaría al funcionamiento.
- No se especifica el número de parámetros del modelo, lo que dificulta estimar su huella de memoria en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenExploer/petr_efficientnetb3
- Repositorio oficial de PETR: https://github.com/megvii-research/PETR
- Paper de PETR: https://arxiv.org/abs/2203.05625
- Referencia de despliegue en chips J6: https://developer.horizon.auto/blog/10373
