# software-mansion/react-native-executorch-fast-sam

## Resumen

Este repositorio aloja modelos de segmentación de instancias FastSAM exportados al formato `.pte` para su ejecución en dispositivos móviles mediante el runtime ExecuTorch, dentro del ecosistema de la librería React Native ExecuTorch de Software Mansion. El modelo original, FastSAM, es una solución de segmentación de imágenes desarrollada por Ultralytics que combina la detección de objetos con la segmentación de regiones, ofreciendo una alternativa ligera al modelo SAM original. La exportación a `.pte` con el backend `xnnpack` permite ejecutar el modelo en tiempo real en dispositivos Android e iOS sin necesidad de conexión a internet, lo que resulta relevante para aplicaciones de visión por computador en el ámbito móvil.

El repositorio en Hugging Face, creado el 5 de mayo de 2026 y actualizado el 19 de agosto de 2026, contiene los pesos en formato ExecuTorch listos para usar. El tamaño total del repositorio es de 2.0 GB, lo que sugiere la inclusión de múltiples versiones o cuantizaciones del modelo. No se especifica la variante concreta de FastSAM (p. ej., `fastsam-s` o `fastsam-x`), ni se proporcionan detalles sobre el dataset de entrenamiento o el número de parámetros. La licencia es AGPL-3.0, heredada de Ultralytics.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastSAM (segmentación de instancias, basado en YOLOv8-seg) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (exportado para `xnnpack` en formato `.pte`) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

FastSAM es un modelo de segmentación de instancias que combina una red de detección de objetos basada en YOLOv8-seg con un módulo de segmentación de propuestas. La arquitectura original utiliza un backbone de tipo CNN y una cabeza de segmentación que produce máscaras de instancia para cada objeto detectado. El modelo se entrena con imágenes anotadas con máscaras de segmentación, aunque en este repositorio no se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO (en este caso no aplican por ser un modelo de visión).

La exportación a ExecuTorch se realiza con la versión 1.2.0 del framework, y se ha optimizado para el backend `xnnpack`, que es el acelerador de inferencia para dispositivos móviles (especialmente en CPU y NPU). No se indica si se ha realizado una cuantización específica (p. ej., int8) o si se ha aplicado poda; la información disponible solo menciona la exportación a `.pte`.

## Capacidades

- Segmentación de instancias: identifica y segmenta objetos individuales en una imagen, devolviendo máscaras binarias por objeto.
- Segmentación de todo lo que se ve (segment anything): a diferencia de la segmentación semántica, FastSAM puede segmentar cualquier objeto de la imagen sin necesidad de entrenamiento específico para categorías concretas.
- Inferencia en tiempo real en dispositivos móviles gracias a la optimización para `xnnpack` y la exportación a ExecuTorch.
- Integración declarativa con React Native: el modelo se puede cargar y ejecutar mediante la librería `react-native-executorch`, lo que simplifica el despliegue en aplicaciones móviles.
- Compatibilidad con el runtime de ExecuTorch: los archivos `.pte` están listos para ser usados en cualquier runtime compatible con la versión 1.2.0 de ExecuTorch.
- No soporta texto, audio ni visión multimodal; es un modelo puramente de visión.

## Casos de uso

- Edición de imágenes en aplicaciones móviles: separar el fondo del sujeto o eliminar objetos concretos de una fotografía, usando las máscaras generadas por el modelo para aplicar efectos de recorte o reemplazo de fondo.
- Realidad aumentada: segmentar objetos en tiempo real para superponer elementos virtuales sobre ellos, por ejemplo en juegos o herramientas de diseño.
- Análisis de imágenes médicas: segmentar estructuras anatómicas en radiografías o ecografías capturadas con el móvil, siempre que se haya entrenado o ajustado el modelo con datos médicos específicos (el modelo base no está entrenado para este dominio).
- Automatización de inventario visual: detectar y segmentar productos en fotografías tomadas con el móvil para contar unidades o verificar stock en almacenes.
- Asistente de accesibilidad: segmentar objetos en la imagen para ayudar a personas con discapacidad visual a entender la escena, por ejemplo resaltando el objeto principal en la cámara.
- Interfaz de usuario basada en gestos: segmentar la mano o el cuerpo del usuario para implementar controles por gestos en aplicaciones de fitness o juegos.
- Creación de stickers personalizados: extraer siluetas de objetos o personas para convertirlas en pegatinas animadas o estáticas en apps de mensajería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como mAP, IoU o tiempos de inferencia para este modelo específico. Tampoco se comparan con otros modelos de segmentación en el repositorio.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en dispositivos móviles (iOS y Android) mediante el runtime ExecuTorch, por lo que no requiere GPU dedicada.
- Se recomienda un dispositivo con al menos 2 GB de RAM y soporte para el backend `xnnpack` (la mayoría de los smartphones modernos).
- El formato `.pte` está optimizado para CPU, aunque también puede aprovechar NPU en dispositivos que lo soporten.
- Para integración en React Native, se necesita la librería `react-native-executorch` y la configuración del runtime correspondiente.
- No hay datos de latencia o throughput; la velocidad dependerá del dispositivo concreto y de la resolución de entrada. En general, FastSAM es considerablemente más rápido que SAM, pero no se proporcionan cifras específicas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño (params) | Formato de exportación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este repositorio** | FastSAM (YOLOv8-seg) | no disponible | `.pte` (ExecuTorch) | AGPL-3.0 | Hugging Face |
| MobileSAM | Transformer (ViT) ligero | 10 M aprox. | PyTorch, ONNX | Apache 2.0 | Repos oficiales |
| SAM original | Transformer (ViT) | 93 M (ViT-B) | PyTorch | Apache 2.0 | Repos oficiales |

No se dispone de datos de rendimiento comparativo en el repositorio. FastSAM suele ser más rápido que SAM original, pero menos preciso en segmentación de objetos complejos. MobileSAM es una alternativa más ligera con licencia permisiva, mientras que este modelo está bajo AGPL-3.0.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial requiere que cualquier aplicación que lo integre publique su código fuente bajo la misma licencia, lo que puede ser un impedimento para proyectos propietarios.
- No se proporciona información sobre el entrenamiento del modelo, por lo que se desconocen los sesgos potenciales o la calidad de segmentación en dominios específicos.
- Al ser un modelo de visión, no soporta tareas de texto ni lenguaje natural; su uso se limita exclusivamente a la segmentación de imágenes.
- La compatibilidad con ExecuTorch está limitada a la versión 1.2.0; versiones posteriores del runtime podrían no ser compatibles, aunque el repositorio indica que no se garantiza compatibilidad hacia adelante.
- El tamaño del repositorio (2.0 GB) sugiere que puede haber varios modelos o pesos de gran tamaño, lo que puede afectar al tiempo de descarga y al espacio de almacenamiento en el dispositivo.
- No se proporcionan instrucciones de uso fuera del entorno React Native ExecuTorch; para otros runtimes de ExecuTorch, el usuario debe asegurar la compatibilidad manualmente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/software-mansion/react-native-executorch-fast-sam)
- [Repositorio GitHub de react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- [Documentación de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Página oficial de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Documentación oficial de ExecuTorch (PyTorch)](https://pytorch.org/executorch/stable/index.html)
- [Documentación de FastSAM en Ultralytics](https://docs.ultralytics.com/models/fast-sam/)
