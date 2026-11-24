# qualcomm/ResNet50

## Resumen

ResNet50 es una red neuronal convolucional (CNN) para clasificación de imágenes, originalmente publicada por Kaiming He et al. en 2015 (paper arXiv:1512.03385) y aquí redistribuida por Qualcomm como modelo pre-exportado y optimizado para ejecutarse en dispositivos con aceleración NPU de Qualcomm (Snapdragon y Dragonwing). El repositorio no contiene un modelo nuevo, sino los artefactos compilados (ONNX, QNN_DLC y TFLite, en precisión float y w8a8) listos para desplegar sobre el stack QAIRT 2.51, además de la integración con la librería `ai-hub-models` para reexportar con pesos o formas de entrada personalizadas.

El modelo resuelve clasificación de imágenes sobre ImageNet a 224x224 píxeles y puede reutilizarse como backbone en arquitecturas de visión más complejas (detección, segmentación, embeddings visuales). Con 25,5 millones de parámetros, un tamaño de 97,4 MB en float y 25,1 MB en cuantización w8a8, está pensado para inferencia de muy baja latencia en el borde: entre 0,9 y 2,9 ms en float y entre 0,4 y 2,8 ms en w8a8 según el chipset, siempre ejecutando en NPU.

Su relevancia actual es la de un baseline maduro y ampliamente conocido que Qualcomm mantiene empaquetado para su ecosistema de cómputo en el borde. No es un modelo generativo ni compite con los transformers multimodales: es una pieza de infraestructura para pipelines de visión en móvil, IoT industrial y automoción, con licencia BSD-3-Clause que permite uso comercial sin fricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet-50, bloques bottleneck con conexiones skip) |
| Parametros totales | 25,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 px) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite (float y w8a8); checkpoint original PyTorch vía torchvision |
| Tamano del modelo | 97,4 MB (float), 25,1 MB (w8a8) |
| Resolucion de entrada | 224x224 |
| Dataset de referencia | ImageNet (checkpoint de clasificación) |
| Runtime / SDK | QAIRT 2.51, ONNX Runtime 1.30.0 |
| Unidad de computo | NPU (Hexagon) en todos los chipsets medidos |

## Arquitectura y entrenamiento

ResNet-50 es una red convolucional profunda de 50 capas con conexiones residuales, compuesta por un stem convolucional seguido de cuatro etapas de bloques bottleneck (1x1, 3x3, 1x1) y una cabeza de clasificación con pooling global y capa fully-connected. Las conexiones skip mitigan el problema de desvanecimiento del gradiente y permiten entrenar redes profundas de forma estable; el diseño original se publicó en "Deep Residual Learning for Image Recognition" (He et al., 2015).

El entrenamiento original se realizó sobre ImageNet (1,28 M de imágenes de entrenamiento, 1000 clases), con aumentos de datos estándar y sin etapas de RLHF ni ajuste por preferencias, ya que es un modelo supervisado de clasificación. Qualcomm no aporta detalles adicionales sobre el proceso de entrenamiento: su contribución es la exportación y compilación para NPU, no el entrenamiento. La innovación técnica del repositorio es la cadena de despliegue: exportación a ONNX, compilación a QNN_DLC para el runtime QAIRT y conversión a TFLite, con variantes cuantizadas w8a8 que reducen el tamaño a un cuarto y aproximadamente duplican la velocidad de inferencia en NPU.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet a partir de entradas RGB de 224x224.
- Extracción de características: la salida del pooling global sirve como embedding visual para tareas posteriores (búsqueda por similitud, clustering, clasificación con cabeza propia).
- Uso como backbone en arquitecturas de detección, segmentación o reconocimiento que requieran un extractor convolucional preentrenado.
- Inferencia en NPU de Qualcomm con latencias sub-3 ms en float y sub-1 ms en w8a8 en los chipsets de gama alta medidos.
- Soporte de cuantización w8a8 lista para producción, con artefactos precompilados descargables.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- No tiene capacidades multilingües ni procesamiento de lenguaje.

## Casos de uso

- Clasificación de imágenes en tiempo real en móvil: con 0,4-1,0 ms por inferencia en w8a8 sobre Snapdragon 8 Elite, permite clasificar fotogramas de cámara a 30-60 fps sin agotar la batería, ejecutando todo en la NPU y liberando la CPU.
- Preprocesado en pipelines de cámara computacional: usar el modelo como filtro previo que etiqueta escenas (interior/exterior, tipo de objeto dominante) antes de invocar modelos más costosos, reduciendo el cómputo total del sistema.
- Backbone para modelos de visión personalizados: partir de los pesos ImageNet y sustituir la cabeza de clasificación para tareas específicas (detección de defectos en fabricación, clasificación de productos en lineales), reexportando con `ai-hub-models` y pesos ajustados.
- Visión en IoT industrial: sobre Qualcomm Dragonwing IQ-8275 o QCS8550, con latencias de 0,9-3,1 ms, permite inspección visual en cadenas de producción con requisitos de tiempo real estricto.
- Moderación y etiquetado automático de contenido visual a gran escala: clasificación de imágenes en servidores con aceleradores Qualcomm o en el borde antes de subir a la nube, reduciendo ancho de banda y coste de almacenamiento.
- Extracción de embeddings para búsqueda visual: la representación del pooling global permite indexar imágenes y recuperar similares por distancia coseno en catálogos de e-commerce o archivos fotográficos.
- Automoción y sistemas de asistencia: clasificación de escenas y objetos como componente auxiliar de bajo consumo dentro de un pipeline ADAS sobre plataformas Snapdragon Ride.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. La model card solo proporciona métricas de latencia y memoria por chipset. Se reproduce una selección representativa:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 | ONNX | float | 0,919 | 1-51 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | float | 1,066 | 0-53 | NPU |
| Snapdragon X2 Elite | ONNX | float | 0,960 | 2-2 | NPU |
| Snapdragon 8 Gen 3 | ONNX | float | 1,434 | 0-82 | NPU |
| Snapdragon 8 Gen 1 | ONNX | float | 2,899 | 0-69 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | w8a8 | 0,556 | 0-57 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 0,405 | 1-1 | NPU |
| Snapdragon 8 Gen 3 | ONNX | w8a8 | 0,674 | 0-89 | NPU |
| Snapdragon 8 Gen 1 | ONNX | w8a8 | 1,054 | 0-91 | NPU |
| Dragonwing QCS6490 | ONNX | w8a8 | 2,805 | 0-3 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a8 | 0,901 | 0-4 | NPU |

La cuantización w8a8 reduce la latencia aproximadamente a la mitad en todos los chipsets medidos y el tamaño del modelo de 97,4 MB a 25,1 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResNet50 (qualcomm) | 25,5 M | 224x224 | Clasificación ImageNet | BSD-3-Clause | HF + AI Hub |
| ResNet18 (torchvision) | 11,7 M | 224x224 | Clasificación ImageNet | BSD-3-Clause | PyTorch Hub |
| MobileNetV3-Large (torchvision) | 5,4 M | 224x224 | Clasificación ImageNet | BSD-3-Clause | PyTorch Hub |
| EfficientNet-B0 (torchvision) | 5,3 M | 224x224 | Clasificación ImageNet | BSD-3-Clause | PyTorch Hub |

Los datos de parámetros y licencia de las alternativas provienen de sus implementaciones de referencia en torchvision; no se dispone en la información proporcionada de comparativas de precisión ni de latencia entre estos modelos.

## Limitaciones y advertencias

- Solo clasifica las 1000 clases de ImageNet; cualquier uso fuera de ese vocabulario requiere reentrenamiento de la cabeza (o fine-tuning completo).
- No procesa texto, audio ni vídeo de forma nativa; el vídeo requeriría inferencia fotograma a fotograma.
- Riesgo de sesgo heredado del dataset ImageNet: desequilibrios demográficos y de representación de categorías que pueden producir clasificaciones injustas en contextos sensibles.
- Riesgo de alucinación en el sentido de predicciones de alta confianza sobre clases incorrectas cuando la imagen está fuera de distribución; conviene calibrar umbrales de confianza en producción.
- Los artefactos precompilados están ligados a QAIRT 2.51 y a ONNX Runtime 1.30.0; versiones distintas del SDK pueden requerir reexportación.
- El rendimiento medido corresponde exclusivamente a NPU de Qualcomm; en CPU o GPU de otros fabricantes las latencias no son representativas.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y no avala a los autores; verificar la cadena de atribución al redistribuir.
- El repositorio ocupa 10,2 GB por incluir múltiples artefactos compilados; conviene descargar solo la variante necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/ResNet50
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/resnet50
- Repositorio ai-hub-models (ResNet50): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/resnet50
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py
- Paper original de ResNet: https://arxiv.org/abs/1512.03385
- Documentación de QAIRT: no disponible en la información proporcionada
