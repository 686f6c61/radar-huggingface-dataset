# software-mansion/react-native-executorch-rfdetr-nano-segmentation

## Resumen

Este repositorio aloja el modelo RFDetr Nano, un modelo de segmentación de instancias basado en la arquitectura RF-DETR desarrollada por Roboflow, exportado específicamente para su uso en el entorno de ejecución ExecuTorch dentro de la biblioteca React Native ExecuTorch de Software Mansion. El modelo se distribuye en formato `.pte` con backend XNNPack, lo que permite su ejecución en dispositivos móviles y embebidos con aceleración de hardware.

La relevancia actual radica en la creciente demanda de modelos de visión por computador ligeros y desplegables en producción móvil. Este modelo ofrece una solución lista para integrar en aplicaciones React Native, sin necesidad de gestionar manualmente la exportación ni la compatibilidad del runtime. Su licencia Apache-2.0 facilita su uso comercial, y el repositorio está mantenido por Software Mansion, una empresa conocida por su ecosistema de herramientas para React Native.

La información técnica disponible en la tarjeta del modelo es limitada: no se especifican parámetros, contexto, ni detalles de entrenamiento. Se sabe que fue exportado con ExecuTorch versión 1.1.0 y que el tamaño del repositorio es de 0.4 GB, lo que sugiere un modelo de tamaño reducido, adecuado para inferencia en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (basada en DETR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (formato `.pte` con backend XNNPACK) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR, un modelo de detección de objetos basado en el paradigma DETR (DEtection TRansformer). No se dispone de información pública sobre el tamaño exacto de la variante nano, la composición del dataset de entrenamiento, ni el número de tokens o imágenes utilizadas. Tampoco se especifica si se emplearon técnicas de ajuste como RLHF o DPO, que no son habituales en modelos de visión.

La innovación principal de este repositorio es la exportación a formato `.pte` con backend XNNPACK, optimizado para ejecución en CPU de dispositivos móviles y de borde. La versión de ExecuTorch utilizada (1.1.0) no garantiza compatibilidad con versiones anteriores, por lo que se recomienda usar la biblioteca React Native ExecuTorch para asegurar la compatibilidad del runtime.

## Capacidades

- Segmentación de instancias en imágenes: identifica y delimita objetos individuales en una imagen.
- Detección de objetos: localiza y clasifica objetos, aunque la salida principal es la segmentación.
- Ejecución en dispositivos móviles: gracias al formato `.pte` y al backend XNNPACK, el modelo puede correr en tiempo real en dispositivos Android y iOS a través de React Native.
- Integración con React Native: el modelo está preparado para usarse con la biblioteca `react-native-executorch`, que proporciona constantes de compatibilidad y utilidades de carga.
- Sin dependencias de servidor: la inferencia se realiza localmente en el dispositivo, lo que reduce latencia y protege la privacidad de los datos.

## Casos de uso

- Aplicaciones de realidad aumentada: el modelo puede segmentar objetos en tiempo real para superponer contenido virtual, por ejemplo, en herramientas de medición o decoración de interiores.
- Clasificación y recuento de inventario: en aplicaciones de logística, se puede usar para identificar y contar productos en estanterías mediante la cámara del móvil.
- Asistencia visual para personas con discapacidad: la segmentación de objetos permite describir el entorno en tiempo real, ayudando en la navegación o en la identificación de objetos.
- Diagnóstico agrícola: análisis de imágenes de plantas para detectar plagas o enfermedades mediante la segmentación de hojas o frutos.
- Control de calidad en fabricación: inspección de piezas en una línea de producción usando la cámara de un dispositivo móvil, detectando defectos o irregularidades.
- Aplicaciones de realidad aumentada: segmentar el fondo de una imagen para aplicaciones de edición fotográfica o filtros de realidad aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión en conjuntos estándar como COCO, ni comparaciones con otros modelos de segmentación. El único dato de rendimiento indirecto es el tamaño del repositorio (0.4 GB), que sugiere un modelo pequeño, pero no se conoce su velocidad de inferencia ni su exactitud en tareas específicas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo nano y optimizado para móvil, se espera que funcione en dispositivos con memoria RAM compartida (típicamente 2-4 GB).
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para CPU móvil con XNNPACK, que acelera la inferencia en dispositivos ARM.
- Compatibilidad con consumer GPU: no aplica, ya que el formato `.pte` está orientado a dispositivos móviles.
- Opciones de despliegue: se usa a través de la biblioteca `react-native-executorch` en aplicaciones React Native. No se mencionan otros runtimes como vLLM o llama.cpp, ya que no son aplicables a este tipo de modelo.
- Latencia y throughput: no se proporcionan datos concretos. Se asume que la ejecución en tiempo real es viable para aplicaciones móviles, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de segmentación de instancias en formato ExecuTorch. No hay información sobre alternativas como YOLO-Seg o Mask R-CNN en formato móvil. Se recomienda consultar la documentación oficial de Roboflow para obtener benchmarks del modelo RF-DETR original, pero no se incluyen en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos en el modelo base, pero al ser un modelo de visión puede presentar sesgos en la detección de ciertas clases o grupos demográficos si el dataset de entrenamiento no es equilibrado.
- Riesgo de alucinación: en visión, el riesgo es de falsos positivos o segmentaciones incorrectas en condiciones de baja iluminación, oclusión o variación de dominio.
- Limitaciones de contexto: el modelo solo procesa imágenes, no tiene capacidad de lenguaje ni contexto textual.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificación y redistribución con atribución, pero sin garantías.
- Compatibilidad de runtime: el modelo está exportado con ExecuTorch 1.1.0 y no hay compatibilidad hacia adelante; versiones anteriores del runtime pueden no funcionar.
- Tamaño de entrada: no se especifica la resolución de entrada máxima, pero los modelos nano suelen tener limitaciones de resolución para mantener el rendimiento móvil.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-segmentation
- Repositorio del modelo original (Roboflow): https://github.com/roboflow/rf-detr
- Documentación de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Biblioteca npm de React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
