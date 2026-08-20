# software-mansion/react-native-executorch-yolo26

## Resumen

Este repositorio aloja los modelos de detección de objetos YOLO26 de Ultralytics, exportados al formato `.pte` de ExecuTorch para su uso directo en la biblioteca React Native ExecuTorch. El modelo está desarrollado por Software Mansion, el equipo responsable de la librería `react-native-executorch`, que permite ejecutar modelos de IA en dispositivos móviles de forma declarativa y sin depender de servicios en la nube. Su relevancia actual reside en la creciente demanda de soluciones de visión por computador en tiempo real dentro de aplicaciones móviles, con privacidad y latencia mínima.

El modelo se distribuye como un único archivo `.pte` (1,9 GB) exportado con ExecuTorch versión 1.1.0, optimizado para el backend `xnnpack` (CPU). Está pensado para ejecutarse en entornos React Native mediante la API de la biblioteca, aunque también puede integrarse en cualquier runtime ExecuTorch compatible. No se proporcionan detalles sobre la arquitectura interna del modelo YOLO26 más allá de la referencia a la documentación oficial de Ultralytics.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics) - no se especifican detalles de la red |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | exportado para xnnpack (cuantizacion especifica no documentada) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo YOLO26, el número de parámetros ni los datos de entrenamiento. Se sabe que pertenece a la familia YOLO de Ultralytics, orientada a la detección de objetos en una sola pasada. El repositorio se centra exclusivamente en la exportación del modelo a formato `.pte` para su ejecución en ExecuTorch, no en el proceso de entrenamiento.

La exportación se realizó con ExecuTorch 1.1.0 y el backend `xnnpack`, lo que indica una optimización para CPU en dispositivos móviles. No se proporcionan detalles sobre técnicas como cuantización específica, pruning o destilación.

## Capacidades

- Detección de objetos: identifica y localiza objetos en imágenes mediante bounding boxes, con las clases definidas por el modelo YOLO26 original (no se listan las clases concretas en la documentación).
- Ejecución en dispositivo: al estar exportado para ExecuTorch, funciona completamente offline en dispositivos móviles sin conexión a servidores.
- Integración con React Native: puede usarse directamente desde la biblioteca `react-native-executorch`, que ofrece una API declarativa para cargar y ejecutar el modelo.
- Compatibilidad con backend xnnpack: optimizado para CPU de dispositivos móviles, lo que permite inferencia sin GPU dedicada.

## Casos de uso

- Inspección visual en tiempo real en aplicaciones de inventario: una app de comercio electrónico puede usar el modelo para contar productos en una estantería capturada con la cámara del móvil, sin enviar imágenes al servidor.
- Asistencia a personas con discapacidad visual: una aplicación React Native puede detectar objetos del entorno (personas, sillas, vehículos) y proporcionar retroalimentación por voz en tiempo real.
- Control de calidad en entornos industriales: técnicos pueden fotografiar piezas y recibir detección de defectos o componentes en campo, con la ventaja de que el modelo funciona sin conectividad.
- Automatización de tareas de etiquetado en apps de logística: detección de paquetes o códigos de barras en imágenes capturadas por el operario, con resultados locales.
- Filtrado de contenido en aplicaciones de cámara: detección de objetos para aplicar efectos o recortes automáticos, todo en el dispositivo.
- Prototipado rápido de soluciones de visión: desarrolladores de React Native pueden integrar detección de objetos en su app sin necesidad de infraestructura de servidor ni APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de precisión, velocidad de inferencia ni comparativas con otros modelos.

## Requisitos de hardware

- El modelo se ejecuta en CPU mediante el backend `xnnpack` de ExecuTorch, por lo que no requiere GPU dedicada.
- Dirigido a dispositivos móviles: se espera que funcione en smartphones con arquitectura ARM y al menos 2 GB de memoria libre, dado que el archivo `.pte` pesa 1,9 GB (el peso en memoria puede ser similar).
- Compatible con la biblioteca React Native ExecuTorch, que gestiona la carga y ejecución del modelo.
- No se proporcionan datos de latencia ni throughput. Se recomienda probar en el dispositivo objetivo para medir el rendimiento real.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas como YOLOv8 o YOLO11 en cuanto a parámetros, precisión o velocidad. La falta de datos de benchmark y la especificidad del formato `.pte` limitan la comparación directa. Se recomienda consultar la documentación de Ultralytics para conocer las características del modelo YOLO26 original y evaluar si la exportación a ExecuTorch mantiene las prestaciones.

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: el uso comercial del modelo y de los archivos exportados está sujeto a los términos de la Affero General Public License, que puede implicar obligaciones de divulgación del código fuente si se ofrece el servicio a través de una red.
- **Compatibilidad con ExecuTorch**: los archivos `.pte` fueron exportados con la versión 1.1.0 de ExecuTorch y no se garantiza compatibilidad hacia adelante. Si se usan fuera de React Native ExecuTorch, el runtime debe ser exactamente compatible.
- **Sin documentación del modelo**: no se proporcionan detalles sobre las clases de objetos, el dataset de entrenamiento ni los sesgos asociados. El usuario debe asumir las limitaciones del modelo YOLO26 original.
- **Tamaño del archivo**: 1,9 GB es un peso considerable para una app móvil; puede requerir gestión de descarga y almacenamiento.
- **Rendimiento variable**: la latencia dependerá de las capacidades del dispositivo; no se garantiza tiempo real en hardware antiguo.

## Enlaces

- [HuggingFace - software-mansion/react-native-executorch-yolo26](https://huggingface.co/software-mansion/react-native-executorch-yolo26)
- [GitHub - react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- [Documentación de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Sitio web de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Documentación de ExecuTorch de PyTorch](https://pytorch.org/executorch/stable/index.html)
- [Documentación de detección de objetos de Ultralytics YOLO26](https://docs.ultralytics.com/tasks/detect/)
