# OpenVINO/rfdetr_medium-fp16-ov

## Resumen

`rfdetr_medium-fp16-ov` es la conversión a formato OpenVINO IR con pesos en FP16 del modelo de detección de objetos RF-DETR Medium, publicada por el equipo de OpenVINO en HuggingFace. RF-DETR (Roboflow Detection Transformer) es un detector basado en arquitectura transformer desarrollado originalmente por Roboflow, y esta variante ha sido procesada por Geti (plataforma de Intel para el ciclo de vida de modelos de visión) para su despliegue optimizado en hardware Intel mediante el toolkit OpenVINO.

El modelo resuelve la tarea de detección de objetos en imágenes, devolviendo cajas delimitadoras y clases sobre una fotografía de entrada. Su relevancia radica en que combina la calidad de un detector DETR moderno con un formato de inferencia (OpenVINO IR) pensado para ejecución de baja latencia en CPU, GPU integrada y NPU de plataformas Intel, tanto en la nube como en el borde. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja la compresión FP16 de los pesos.

La ficha se basa únicamente en la información disponible en la model card y en la documentación pública de OpenVINO; los detalles sobre arquitectura interna, datos de entrenamiento y benchmarks no están publicados en el repositorio y se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para detección de objetos (RF-DETR, variante Medium); formato de despliegue OpenVINO IR |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16 (pesos comprimidos); el repositorio no publica otras variantes |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), FP16 |

## Arquitectura y entrenamiento

RF-DETR es un detector de objetos basado en transformer, en la línea de la familia DETR (DEtection TRansformer), que sustituye componentes clásicos de detección como las anchor boxes y el non-maximum suppression por un mecanismo de atención que predice directamente el conjunto de objetos. La variante Medium se sitúa en un punto intermedio de la escala de tamaños del proyecto RF-DETR original de Roboflow; sin embargo, la model card no detalla el número de capas, dimensión de embeddings ni configuración exacta del backbone.

Esta publicación concreta no incluye información sobre el dataset de entrenamiento, el número de tokens o imágenes procesadas, ni si hubo etapas de ajuste fino supervisado adicionales. Lo que sí documenta el autor es el proceso de conversión: los pesos originales se transformaron a OpenVINO IR y se comprimieron a FP16 para reducir el tamaño y acelerar la inferencia en hardware Intel. Geti ofrece además la posibilidad de reentrenar el modelo con datasets propios y reexportarlo al mismo formato.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras con clase asociada sobre una imagen de entrada.
- Inferencia optimizada para hardware Intel (CPU, GPU integrada, NPU) mediante OpenVINO.
- Integración con Model API 0.4.0 o superior para carga, preprocesado y postprocesado estandarizados.
- Visualización de resultados incluida en Model API (`Visualizer`).
- Reentrenamiento con datasets personalizados a través de la plataforma Geti.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la detección visual.

## Casos de uso

- Inspección visual en líneas de producción: el modelo puede detectar defectos o piezas en imágenes de cámaras industriales, desplegado sobre CPU o NPU Intel en el propio equipo de planta, con la ventaja de que el formato OpenVINO reduce la latencia sin necesidad de GPU dedicada.
- Videovigilancia y analítica de borde: detección de personas u objetos en streams de cámara en dispositivos con CPU Intel, donde el tamaño reducido del modelo (0,1 GB) y la compresión FP16 permiten ejecución en tiempo real en hardware modesto.
- Automatización de inventario en retail: conteo y localización de productos en estanterías a partir de fotografías, reentrenando el modelo con Geti sobre el catálogo concreto de la tienda.
- Procesamiento de imágenes en AI PCs: aplicaciones de escritorio que aprovechan la NPU o GPU integrada de portátiles Intel para tareas de detección sin enviar datos a la nube, útil por privacidad y coste.
- Detección en drones y robótica móvil: el bajo peso del modelo y la compatibilidad con OpenVINO lo hacen apto para plataformas embebidas Intel donde el consumo energético es crítico.
- Preetiquetado de datasets: usar el modelo para generar cajas iniciales sobre imágenes nuevas y acelerar la anotación manual antes de un ajuste fino con Geti.
- Control de calidad en agricultura: detección de frutos, plagas o daños en imágenes de campo capturadas por dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 0,1 GB en FP16, por lo que la huella de pesos es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la model card. Al ser un modelo OpenVINO IR, el objetivo principal es hardware Intel (CPU, GPU integrada, NPU); también puede ejecutarse en GPU dedicadas mediante los plugins de OpenVINO.
- Cabe en GPU consumer: sí, por el reducido tamaño de pesos; cualquier GPU con al menos unos cientos de MB libres puede alojarlo.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y Model API 0.4.0 o superior; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| rfdetr_medium-fp16-ov | Detector DETR (Medium) | OpenVINO IR FP16 | Apache-2.0 | Imagen | HuggingFace (OpenVINO) |
| RF-DETR Medium original | Detector DETR (Medium) | PyTorch | Apache-2.0 | Imagen | GitHub (Roboflow) |
| Otros detectores DETR de tamaño medio | Detector DETR | PyTorch / ONNX | variable | Imagen | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original para las limitaciones; no se detallan sesgos específicos en este repositorio.
- Riesgo de alucinación en el sentido de falsos positivos o cajas mal localizadas, inherente a cualquier detector; no hay métricas publicadas que permitan cuantificarlo.
- El modelo está pensado para detección de objetos; no procesa texto ni mantiene contexto conversacional.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo original en el repositorio de Roboflow para confirmar condiciones adicionales.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores no son compatibles.
- El rendimiento óptimo se obtiene en hardware Intel; en otras plataformas la ventaja de OpenVINO puede no materializarse.
- No se publican detalles sobre el dataset de entrenamiento, lo que dificulta evaluar la cobertura de dominios y el posible sesgo de clases.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/rfdetr_medium-fp16-ov
- Modelo original RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Geti (Intel): https://github.com/open-edge-platform/geti
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Licencia del modelo original: https://roboflow.com/licensing
