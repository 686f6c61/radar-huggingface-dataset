# software-mansion/react-native-executorch-yolo26-seg

## Resumen

Este repositorio aloja los modelos de segmentación de instancias YOLO26, exportados en formato `.pte` para el runtime ExecuTorch, listos para su uso en la librería `react-native-executorch` de Software Mansion. YOLO26 es la última iteración de la familia YOLO de Ultralytics, especializada en tareas de detección y segmentación de objetos. El problema que resuelve es la ejecución de modelos de visión por computadora directamente en el dispositivo móvil, sin depender de servidores externos, lo que garantiza privacidad y baja latencia. Su relevancia actual radica en la creciente demanda de aplicaciones de IA en el edge con React Native, y en la madurez del runtime ExecuTorch de Meta para este propósito.

El repositorio incluye únicamente los ficheros `.pte` exportados con la versión 1.1.0 de ExecuTorch, sin garantía de compatibilidad hacia adelante. La licencia es AGPL-3.0, lo que impone condiciones copyleft para su redistribución o modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (segmentación de instancias) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantización | no disponible (solo se indica exportación para backend xnnpack) |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pte` (formato propio de ExecuTorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26 de Ultralytics, que hereda el diseño de las versiones anteriores (YOLOv8, YOLOv5) pero incorpora mejoras en la extracción de características y en la cabeza de segmentación. No se dispone de detalles sobre el entrenamiento (número de imágenes, dataset, etc.) en la información proporcionada. La exportación se realizó con ExecuTorch 1.1.0, lo que implica que la red está compilada a un formato optimizado para ejecutarse en dispositivos móviles y embebidos mediante el backend `xnnpack`. No se mencionan innovaciones técnicas adicionales como atención lineal o decodificación especulativa, ya que no aplican a este tipo de modelo.

## Capacidades

- Segmentación de instancias: es capaz de generar máscaras de segmentación a nivel de píxel para cada objeto detectado en una imagen.
- Detección de objetos: YOLO26 incluye detección de cajas delimitadoras además de las máscaras.
- Inferencia en el dispositivo: diseñado para ejecutarse en dispositivos móviles mediante ExecuTorch, sin necesidad de conexión a servidores.
- Compatibilidad con React Native: integración directa con la librería `react-native-executorch` de Software Mansion.
- Soporte de backend `xnnpack`: optimizado para CPU en dispositivos con arquitecturas ARM y x86.

## Casos de uso

- **Aplicaciones de conteo de objetos en tiempo real**: en un supermercado o almacén, se puede usar para contar productos en una estantería a través de la cámara del móvil, obteniendo resultados inmediatos y sin enviar imágenes a un servidor.
- **Herramientas de realidad aumentada**: para superponer máscaras de segmentación sobre objetos reales en la vista de la cámara, útil en aplicaciones de interiorismo o probadores virtuales.
- **Accesibilidad**: ayudar a personas con discapacidad visual a identificar objetos en su entorno, describiendo la escena a través de la segmentación.
- **Clasificación de residuos**: segmentar y clasificar diferentes tipos de materiales en una imagen para guiar al usuario en el reciclaje, todo en el dispositivo para preservar la privacidad.
- **Diagnóstico agrícola**: detectar y segmentar hojas o frutos en imágenes de campo para evaluar el estado de los cultivos, sin depender de conexión a internet.
- **Filtrado de imágenes en aplicaciones sociales**: recortar automáticamente el fondo de una foto o aplicar efectos solo al sujeto segmentado, todo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión (mAP, IoU) ni de velocidad (FPS) para este modelo específico.

## Requisitos de hardware

- **Dispositivos móviles**: el modelo está diseñado para ejecutarse en smartphones con soporte para el backend `xnnpack` de ExecuTorch. No se especifica una GPU o CPU mínima.
- **Plataformas**: Android e iOS, siempre que se pueda compilar la librería `react-native-executorch`.
- **Espacio en disco**: el repositorio ocupa 2.7 GB, pero el tamaño de cada modelo `.pte` individual no se indica.
- **Despliegue**: se integra con React Native mediante la librería `react-native-executorch`. No se mencionan otros runtimes como vLLM o llama.cpp, que no aplican a modelos de visión.
- **Latencia**: no se han publicado datos de throughput o latencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de segmentación (como YOLOv8-seg, YOLOv5-seg o Mask R-CNN) en términos de rendimiento o precisión, ya que no se han proporcionado resultados de benchmarks. La principal diferencia con otros repositorios es que este está específicamente exportado para ExecuTorch y React Native, mientras que otros modelos suelen distribuirse en formatos como PyTorch o ONNX.

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: la licencia copyleft implica que si se modifica el modelo o se integra en un servicio, el código fuente derivado debe ser distribuido bajo la misma licencia. Esto puede ser incompatible con aplicaciones comerciales cerradas.
- **Compatibilidad**: los ficheros `.pte` fueron exportados con ExecuTorch 1.1.0 y no se garantiza compatibilidad con versiones anteriores. Si se usan con otras versiones del runtime, puede fallar.
- **Tamaño del modelo**: aunque no se especifica el tamaño de cada fichero, el repositorio completo es de 2.7 GB, lo que puede ser excesivo para aplicaciones con restricciones de descarga o almacenamiento.
- **Sin garantía de compatibilidad hacia adelante**: las versiones futuras de ExecuTorch pueden no ser capaces de cargar estos ficheros.
- **Sin información sobre sesgos**: no se proporciona ningún dato sobre sesgos del modelo o su comportamiento en escenarios del mundo real.

## Enlaces

- [HuggingFace - software-mansion/react-native-executorch-yolo26-seg](https://huggingface.co/software-mansion/react-native-executorch-yolo26-seg)
- [Documentación de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
- [GitHub - software-mansion/react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- [Documentación de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Web de React Native ExecuTorch](https://executorch.swmansion.com/)
