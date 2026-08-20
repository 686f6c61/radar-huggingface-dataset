# software-mansion/react-native-executorch-deeplab-v3

## Resumen

Este repositorio aloja un modelo DeepLabV3 de segmentación semántica, exportado al formato `.pte` de ExecuTorch para su uso en la librería React Native ExecuTorch. El modelo está diseñado para ejecutarse en dispositivos móviles y embebidos mediante el runtime ExecuTorch de Meta, permitiendo tareas de segmentación de imágenes en tiempo real sin conexión a servidores. La exportación se realizó con la versión 1.1.0 de ExecuTorch, por lo que no se garantiza compatibilidad con versiones anteriores del runtime.

El repositorio, mantenido por Software Mansion, forma parte de un ecosistema más amplio de modelos optimizados para React Native, con soporte para LLMs y modelos de visión. Con un tamaño de 1,4 GB, el modelo está pensado para integrarse en aplicaciones móviles mediante la librería `react-native-executorch`, que ofrece una API declarativa para cargar y ejecutar modelos de IA en el dispositivo. La licencia MIT permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 (segmentación semántica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato `.pte` específico de ExecuTorch) |
| Idiomas soportados | no aplicable (procesamiento de imágenes) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

DeepLabV3 es una arquitectura de segmentación semántica basada en redes neuronales convolucionales, que utiliza convoluciones atrous (dilatadas) para capturar contexto multiescala sin perder resolución espacial. El modelo original se entrena sobre datasets como COCO o Pascal VOC, aunque no se dispone de detalles específicos sobre el conjunto de datos o el proceso de entrenamiento de esta versión particular. El repositorio solo proporciona el modelo exportado a formato `.pte`, sin información sobre los pesos originales, el backbone (ResNet u otro) ni el proceso de cuantización.

La exportación a ExecuTorch implica una compilación del grafo computacional para el backend XNNPACK, optimizado para CPUs móviles y de bajo consumo. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que se trata de un modelo de visión, no generativo.

## Capacidades

- Segmentación semántica de imágenes en tiempo real, asignando una etiqueta de clase a cada píxel (por ejemplo, persona, coche, fondo).
- Ejecución completamente en el dispositivo, sin necesidad de conexión a internet.
- Compatible con el runtime ExecuTorch, lo que permite integración en aplicaciones React Native mediante la librería `react-native-executorch`.
- Soporte para backend XNNPACK, optimizado para CPUs ARM y x86 en dispositivos móviles.
- No se documentan capacidades de generación de texto, tool calling, agentes o razonamiento multilingüe, al ser un modelo exclusivamente de visión.

## Casos de uso

- Realidad aumentada en aplicaciones móviles: el modelo puede segmentar objetos y escenas en tiempo real para superponer elementos virtuales, gracias a su ejecución local y baja latencia.
- Accesibilidad para personas con discapacidad visual: una app puede describir el entorno segmentando objetos (sillas, mesas, personas) y generando audio descriptivo, sin enviar imágenes a la nube.
- Moderación de contenido en fotos: segmentación de regiones problemáticas (por ejemplo, piel o armas) para aplicar desenfoque o bloqueo automático en aplicaciones de mensajería.
- Edición de imágenes en el dispositivo: separar el fondo del primer plano para aplicar filtros, recortes o reemplazo de fondo, todo localmente.
- Navegación autónoma en robots o drones de bajo coste: el modelo puede ejecutarse en una Raspberry Pi o un teléfono móvil para detectar obstáculos y caminos.
- Análisis agrícola de campo: segmentación de cultivos o maleza en fotografías tomadas con un móvil, permitiendo estimaciones de cobertura vegetal sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como mIoU, precisión o velocidad de inferencia para este modelo específico.

## Requisitos de hardware

- El modelo ocupa 1,4 GB en disco (formato `.pte`), lo que sugiere un tamaño de pesos considerable, probablemente sin cuantización agresiva.
- VRAM estimada: no disponible, pero al ser para XNNPACK se espera que funcione en CPUs móviles sin GPU dedicada.
- GPU recomendadas: no aplicable, el backend XNNPACK está diseñado para CPUs.
- Compatible con dispositivos Android e iOS mediante React Native ExecuTorch, siempre que tengan suficiente RAM (se recomienda al menos 3-4 GB para cargar el modelo en memoria).
- Opciones de despliegue: exclusivamente a través de ExecuTorch runtime, ya sea con la librería React Native o con el runtime nativo de ExecuTorch.
- Latencia y throughput: no disponibles. Dependerán del dispositivo y de la resolución de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de segmentación semántica (como U-Net, SegNet o Mask R-CNN) en este contexto específico. La principal diferencia es el formato de exportación y el soporte para ExecuTorch, que limita la comparación a modelos también exportados a este runtime. Se recomienda consultar la documentación de React Native ExecuTorch para ver otros modelos disponibles.

## Limitaciones y advertencias

- El modelo fue exportado con ExecuTorch 1.1.0 y no hay compatibilidad garantizada con versiones anteriores del runtime; si se usa fuera de React Native ExecuTorch, hay que verificar la compatibilidad.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre posibles sesgos en las clases segmentadas (por ejemplo, sesgos de género, raza o entorno).
- Al ser un modelo de segmentación semántica, no es adecuado para tareas de generación de texto, razonamiento o comprensión del lenguaje.
- El tamaño del repositorio (1,4 GB) puede ser excesivo para aplicaciones móviles con restricciones de almacenamiento; se recomienda evaluar cuantización o modelos más ligeros.
- No se documentan limitaciones específicas de precisión en condiciones de iluminación baja, oclusiones o clases poco representadas.
- La licencia MIT permite uso comercial, pero el modelo subyacente (DeepLabV3) puede tener restricciones adicionales según la implementación de PyTorch; se recomienda revisar la licencia de los pesos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-deeplab-v3
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Sitio oficial de React Native ExecuTorch: https://executorch.swmansion.com/
- Repositorio GitHub de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
- Documentación de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Referencia de DeepLabV3 en PyTorch: https://docs.pytorch.org/vision/main/models/deeplabv3.html
