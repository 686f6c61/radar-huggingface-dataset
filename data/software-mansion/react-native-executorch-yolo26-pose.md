# software-mansion/react-native-executorch-yolo26-pose

## Resumen

El repositorio `software-mansion/react-native-executorch-yolo26-pose` aloja un modelo de detección de objetos y estimación de pose basado en YOLO26, exportado al formato `.pte` de ExecuTorch para su ejecución en dispositivos móviles dentro del ecosistema React Native. El modelo es distribuido por Software Mansion, la empresa detrás de la librería `react-native-executorch`, que permite ejecutar modelos de IA on-device en aplicaciones React Native. La versión exportada utiliza el backend XNNPACK y está preparada para integrarse directamente con el runtime de ExecuTorch.

Este modelo es relevante porque facilita la incorporación de capacidades de visión por computador en aplicaciones móviles sin depender de la nube, garantizando privacidad y baja latencia. Sin embargo, la información técnica detallada sobre arquitectura, número de parámetros o rendimiento no está disponible en la documentación pública del repositorio. Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero, ya que el peso original proviene de la familia YOLO26 de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detección de objetos y estimación de pose) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato `.pte` con backend XNNPACK) |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK) |

## Arquitectura y entrenamiento

YOLO26 es la última iteración de la familia YOLO de Ultralytics, diseñada para tareas de detección de objetos, segmentación y estimación de pose. La arquitectura exacta (número de capas, ancho, etc.) no se especifica en la información proporcionada. El modelo se exportó con ExecuTorch versión 1.2.0, usando el backend XNNPACK, que optimiza la ejecución en CPUs de dispositivos móviles. No se proporcionan detalles sobre los datos de entrenamiento ni el proceso de entrenamiento del modelo original, ya que este repositorio se centra en la exportación y el empaquetado para React Native, no en el entrenamiento.

## Capacidades

- Detección de objetos: identificación y localización de múltiples objetos en una imagen, con bounding boxes.
- Estimación de pose: detección de puntos clave del cuerpo humano (por ejemplo, articulaciones) para aplicaciones de seguimiento de movimiento.
- Ejecución on-device: diseñado para funcionar en dispositivos móviles sin conexión a internet, gracias a la integración con ExecuTorch.
- Compatible con React Native: se integra mediante la librería `react-native-executorch` para su uso en aplicaciones móviles multiplataforma.
- No incluye soporte de tool calling ni generación de texto, ya que es un modelo de visión.

## Casos de uso

- Aplicaciones de fitness y rehabilitación: el modelo puede detectar la pose del usuario en tiempo real para contar repeticiones o evaluar la ejecución de ejercicios, todo en el dispositivo.
- Realidad aumentada: superponer objetos virtuales sobre personas detectadas en la cámara del móvil, con seguimiento de pose.
- Control por gestos: usar la detección de pose para interpretar gestos de la mano o del cuerpo como comandos de interfaz.
- Análisis de vídeo en streaming: procesar frames de vídeo para detectar objetos y poses sin enviar datos a un servidor, reduciendo latencia y costes.
- Aplicaciones de seguridad y vigilancia: detección de personas y objetos en entornos privados, cumpliendo requisitos de privacidad.
- Herramientas de accesibilidad: reconocer objetos y personas para ayudar a personas con discapacidad visual, por ejemplo, describiendo la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, latencia ni throughput específicos para este modelo exportado.

## Requisitos de hardware

- Dado que el modelo está optimizado para ExecuTorch con backend XNNPACK, está pensado para ejecutarse en CPU de dispositivos móviles.
- No se especifica VRAM mínima; el tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo ligero, pero no se conoce el tamaño exacto en memoria.
- Compatible con smartphones Android e iOS mediante React Native y la librería `react-native-executorch`.
- No requiere GPU dedicada; la inferencia se realiza en la CPU del dispositivo.
- Opciones de despliegue: se usa directamente en React Native a través de la librería, o en cualquier runtime de ExecuTorch compatible.
- No se ofrecen datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de detección de pose o de objetos en la información del repositorio. Para contexto, otros modelos de pose como MediaPipe Pose o MoveNet también ofrecen ejecución on-device, pero no hay datos objetivos de comparación con este modelo específico.

## Limitaciones y advertencias

- La licencia AGPL-3.0 tiene implicaciones para uso comercial: si se modifica el modelo o se integra en un servicio que se distribuye, puede ser obligatorio liberar el código fuente bajo la misma licencia. Es recomendable revisar las condiciones antes de usarlo en productos propietarios.
- El modelo se exportó con ExecuTorch 1.2.0 y no hay compatibilidad hacia adelante garantizada. Si se actualiza el runtime, puede ser necesario re-exportar el modelo.
- No se proporciona información sobre sesgos o riesgos de alucinación, pero como modelo de visión, los errores de detección pueden ocurrir en condiciones de poca luz, oclusiones o ángulos inusuales.
- El modelo está pensado para dispositivos móviles; su precisión puede ser menor que la de modelos más grandes que requieren GPU de escritorio.
- No se especifican los idiomas porque es un modelo de visión, pero no tiene capacidad de procesamiento de texto.

## Enlaces

- [HuggingFace: software-mansion/react-native-executorch-yolo26-pose](https://huggingface.co/software-mansion/react-native-executorch-yolo26-pose)
- [Repositorio GitHub de react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- [Documentación de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Sitio web de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Documentación oficial de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
- [Página de tareas de pose de Ultralytics YOLO](https://docs.ultralytics.com/tasks/pose/)
