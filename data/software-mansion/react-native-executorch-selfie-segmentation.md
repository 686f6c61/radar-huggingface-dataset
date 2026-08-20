# software-mansion/react-native-executorch-selfie-segmentation

## Resumen

Este repositorio aloja un modelo de segmentación de selfies (selfie segmentation) preparado para ejecutarse en dispositivos móviles mediante el runtime ExecuTorch, desarrollado por Meta. El modelo está exportado en formato `.pte` (ExecuTorch) y optimizado para el backend XNNPACK, lo que permite su uso en aplicaciones React Native a través de la librería `react-native-executorch` de Software Mansion.

Se trata de un modelo de visión por computadora, no de un modelo de lenguaje, y su propósito principal es separar la silueta de una persona del fondo en imágenes o vídeo en tiempo real. Está pensado para integrarse en aplicaciones móviles con requisitos de privacidad y baja latencia, ya que la inferencia se realiza completamente en el dispositivo.

La relevancia actual radica en la creciente demanda de funcionalidades como fondos virtuales, desenfoque de fondo o efectos de realidad aumentada en aplicaciones móviles, sin depender de servicios en la nube. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes, probablemente basado en MediaPipe Selfie Segmentation) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (exportado para XNNPACK, posiblemente cuantizado a int8) |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de optimización. El README solo indica que los archivos `.pte` fueron exportados con ExecuTorch versión 1.1.0 y que están preparados para el backend XNNPACK, lo que sugiere una cuantización orientada a dispositivos con CPU ARM. No se menciona si se aplicaron técnicas como destilación, pruning o cuantización post-entrenamiento.

## Capacidades

- Segmentación de siluetas humanas en imágenes o vídeo, específicamente orientada a selfies (detección de la persona en primer plano).
- Inferencia en tiempo real en dispositivos móviles gracias a la optimización para XNNPACK y el formato ExecuTorch.
- Ejecución 100% on-device, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Integración declarativa con React Native mediante la librería `react-native-executorch`, que abstrae la gestión del runtime y la carga del modelo.
- Compatible con el ecosistema ExecuTorch de Meta, lo que permite su uso fuera de React Native si se garantiza la compatibilidad de versiones del runtime.

## Casos de uso

- Fondos virtuales en aplicaciones de videollamada: el modelo puede separar a la persona del fondo en tiempo real y sustituirlo por una imagen o vídeo elegido por el usuario, funcionando completamente en el dispositivo para garantizar privacidad.
- Desenfoque de fondo (modo retrato): aplicable en apps de cámara o edición de fotos para generar un efecto bokeh sin depender de servicios cloud.
- Filtros de realidad aumentada: integración con motores de AR para superponer efectos sobre la silueta detectada, por ejemplo en redes sociales o aplicaciones de maquillaje virtual.
- Eliminación de fondo en herramientas de diseño: utilidad para que los usuarios recorten su propia imagen de un fondo sin necesidad de editores complejos, directamente en una app móvil.
- Videoconferencia con fondos personalizados: incorporación en aplicaciones de reuniones móviles para reemplazar el entorno del usuario, con latencia mínima al ejecutarse localmente.
- Pruebas de vestuario virtual: en apps de moda, el modelo puede aislar el cuerpo del usuario para simular prendas o accesorios sobre la imagen en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de precisión (IoU, mAP) ni de rendimiento (FPS, latencia) para este modelo concreto.

## Requisitos de hardware

- Diseñado para ejecución en dispositivos móviles con CPU ARM (Android y iOS) mediante el backend XNNPACK de ExecuTorch.
- No requiere GPU dedicada; la inferencia se realiza en CPU con cuantización, lo que lo hace adecuado para la mayoría de smartphones modernos.
- El tamaño del repositorio es de 0.0 GB según HuggingFace, lo que sugiere que el archivo `.pte` es muy ligero (probablemente pocos megabytes).
- Para su uso en React Native, se integra a través de la librería `react-native-executorch` (disponible en npm), que gestiona la carga del modelo y la ejecución.
- No se especifican requisitos mínimos de RAM ni versión de sistema operativo, pero al estar optimizado para XNNPACK se espera un consumo reducido de recursos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa técnica con otros modelos de segmentación (como MediaPipe Selfie Segmentation original o modelos de segmentación semántica como DeepLab). La única diferencia clara es el formato de distribución: este modelo está específicamente exportado para ExecuTorch y para su uso con React Native, mientras que MediaPipe ofrece su propio runtime y formatos (`.tflite`). No se pueden comparar métricas de rendimiento ni precisión por falta de datos.

## Limitaciones y advertencias

- No hay información pública sobre la precisión del modelo en condiciones adversas (iluminación baja, oclusiones, múltiples personas, fondos complejos).
- El modelo está orientado a selfies, es decir, a una persona en primer plano; su rendimiento con escenas más complejas o múltiples sujetos puede degradarse.
- Los archivos `.pte` fueron exportados con ExecuTorch 1.1.0 y no se garantiza compatibilidad hacia adelante con versiones futuras del runtime. Si se usa fuera de React Native ExecuTorch, hay que verificar la versión del runtime.
- Al ser un modelo de visión, no aplica la advertencia de alucinación típica de los LLM, pero sí puede producir errores de segmentación (por ejemplo, recortar partes del cuerpo o incluir objetos del fondo).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original de MediaPipe si se deriva de él, ya que MediaPipe Selfie Segmentation tiene su propia licencia (Apache 2.0 también, pero conviene verificar).
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos (por ejemplo, rendimiento desigual en distintos tonos de piel o tipos de peinado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-selfie-segmentation
- Repositorio GitHub de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
- Documentación oficial de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Página web del proyecto: https://executorch.swmansion.com/
- Paquete npm: https://www.npmjs.com/package/react-native-executorch
- Documentación de ExecuTorch (Meta): https://pytorch.org/executorch/stable/index.html
