# qualcomm/Swin-Base

## Resumen

Swin-Base es un modelo de visión por computador desarrollado originalmente por Microsoft Research (paper arXiv:2103.14030) y redistribuido por Qualcomm dentro de su catálogo Qualcomm AI Hub Models, con pesos preexportados y optimizados para ejecutarse en dispositivos con NPU Hexagon. Se trata de un clasificador de imágenes entrenado sobre ImageNet que también puede emplearse como backbone para tareas de visión más complejas (detección, segmentación, extracción de características). La versión publicada por Qualcomm parte de la implementación incluida en `torchvision.models.swin_transformer`.

La arquitectura es un transformer de visión jerárquico con atención de ventana desplazada (shifted window attention), que reduce el coste computacional de la atención de cuadrático a lineal respecto al tamaño de la imagen. El modelo tiene 88,8 millones de parámetros, acepta entradas de 224x224 píxeles y se distribuye en versiones float (339 MB) y cuantizada w8a16 (90,2 MB).

Su relevancia actual reside en el despliegue en el borde: Qualcomm proporciona artefactos ya compilados en ONNX, QNN_DLC y TFLITE, con tiempos de inferencia medidos entre 6,1 y 108,6 ms según el chipset, ejecutándose íntegramente en NPU. Esto lo convierte en una opción práctica para clasificación de imágenes en móvil, IoT industrial y computación embebida sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer jerarquico con atencion de ventana desplazada (Swin Transformer) |
| Parametros totales | 88,8 millones |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada de imagen de 224x224) |
| Tipos de cuantizacion | float y w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint original), ONNX, QNN_DLC, TFLITE |
| Resolucion de entrada | 224x224 |
| Tamano del modelo | 339 MB (float), 90,2 MB (w8a16) |

## Arquitectura y entrenamiento

Swin-Base es un transformer de visión jerárquico que construye representaciones en cuatro etapas con resoluciones decrecientes (de 56x56 a 7x7 para una entrada de 224x224). Cada etapa aplica atención local dentro de ventanas de 7x7 píxeles y alterna el desplazamiento de dichas ventanas entre bloques consecutivos, lo que permite propagar información entre ventanas vecinas sin recurrir a atención global. Este diseño reduce la complejidad computacional de la atención de cuadrática a lineal respecto al número de píxeles y mantiene el coste acotado en imágenes de alta resolución. La versión de `torchvision` emplea normalización LayerNorm pre-attention y una cabeza de clasificación lineal sobre el embedding global.

En cuanto al entrenamiento, la model card de Qualcomm indica únicamente que el checkpoint corresponde a ImageNet. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet, ni si se aplicaron fases de ajuste con RLHF, DPO u otras técnicas de alineación (habitualmente ausentes en modelos de clasificación de visión). Tampoco se detalla el pipeline de destilación o regularización empleado. Los artefactos publicados por Qualcomm no modifican los pesos originales, sino que consisten en exportaciones y compilaciones optimizadas para los runtimes QAIRT, ONNX Runtime y TensorFlow Lite, con soporte de cuantización w8a16.

## Capacidades

- Clasificación de imágenes sobre las 1.000 clases de ImageNet a partir de entradas RGB de 224x224.
- Extracción de características (feature extraction) como backbone para modelos de visión posteriores: detección de objetos, segmentación semántica, clasificación multi-etiqueta o recuperación de imágenes.
- Ajuste fino sobre dominios específicos mediante la librería Qualcomm AI Hub Models, que permite reexportar con pesos personalizados.
- Ejecución en NPU de dispositivos Qualcomm (Hexagon) con los artefactos precompilados.
- Soporte de cuantización w8a16 para reducir el tamaño del modelo de 339 MB a 90,2 MB, con ganancias de latencia de entre el 10 % y el 25 % según el chipset.
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes y capacidades multilingües: no aplicable, es un modelo exclusivamente de visión.
- Capacidades especiales (modo thinking, visión-lenguaje, audio): no disponible.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede etiquetar fotografías en el propio dispositivo con latencias de 6 a 28 ms en chipsets Snapdragon de gama alta, evitando enviar imágenes a la nube y reduciendo el consumo de red y los problemas de privacidad.
- Control de calidad en fabricación industrial: integrado en cámaras con módulos Dragonwing (por ejemplo, QCS8550 o IQ-8275), permite detectar defectos visuales en línea de producción con inferencias de 14 a 20 ms y sin conexión permanente a un servidor central.
- Backbone para sistemas de detección de objetos en el borde: al ser un transformer jerárquico con salidas multiescala, se puede acoplar a cabezas de detección o segmentación y ejecutar en NPU mediante los artefactos ONNX o QNN_DLC.
- Moderación automática de contenido visual: clasificación rápida de imágenes subidas por usuarios para filtrar contenido no deseado antes de su publicación, aprovechando la ventana de entrada estándar de 224x224 y el bajo coste por inferencia.
- Indexado y búsqueda visual en grandes catálogos: el modelo actúa como extractor de embeddings para organizar bibliotecas de imágenes por similitud, con la ventaja de que la inferencia puede distribuirse en muchos dispositivos finales.
- Automatización de inventario y logística: reconocimiento de producto o estado de embalaje en dispositivos portátiles industriales, con despliegue TFLITE u ONNX sobre hardware Qualcomm ya presente en los terminales.
- Preprocesado en pipelines de robótica y vehículos autónomos: clasificación de escenas a bordo con latencias por debajo de 30 ms y ejecución en NPU, liberando la CPU y la GPU para otras tareas.
- Investigación en eficiencia de modelos: el repositorio de AI Hub Models permite exportar configuraciones personalizadas y medir el impacto de la cuantización w8a16 frente a float en distintos chipsets, útil para estudios de compromiso precisión-latencia.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (top-1, top-5, MMLU u otros) en la información disponible. La model card de Qualcomm únicamente proporciona métricas de latencia y memoria por dispositivo. Se reproduce una selección de las mediciones disponibles:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Gen 5 for Galaxy | 7,624 | 0 - 388 | NPU |
| ONNX | float | Snapdragon 8 Elite for Galaxy | 9,433 | 1 - 371 | NPU |
| ONNX | float | Snapdragon X2 Elite | 7,812 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 19,095 | 175 - 175 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 | 12,56 | 0 - 528 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 | 28,179 | 1 - 520 | NPU |
| ONNX | float | Dragonwing IQ-8275 | 20,457 | 0 - 5 | NPU |
| ONNX | float | Dragonwing QCS8550 (proxy) | 18,522 | 0 - 194 | NPU |
| ONNX | w8a16 | Snapdragon 8 Elite Gen 5 for Galaxy | 6,143 | 0 - 414 | NPU |
| ONNX | w8a16 | Snapdragon 8 Elite for Galaxy | 7,966 | 0 - 399 | NPU |
| ONNX | w8a16 | Snapdragon X2 Elite | 6,313 | 1 - 1 | NPU |
| ONNX | w8a16 | Snapdragon X Elite | 16,391 | 93 - 93 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 3 | 10,723 | 0 - 538 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 1 | 20,247 | 0 - 537 | NPU |
| ONNX | w8a16 | Dragonwing QCS6490 | 39,041 | 0 - 4 | NPU |
| ONNX | w8a16 | Dragonwing IQ-8275 | 14,394 | 0 - 4 | NPU |
| ONNX | w8a16 | Dragonwing QCS8550 (proxy) | 15,89 | 0 - 518 | NPU |
| ONNX | w8a16 | Dragonwing Q-6690 | 108,62 | 0 - 667 | NPU |
| ONNX | w8a16 | Dragonwing Q-7790 | 17,916 | 0 - 613 | NPU |

## Requisitos de hardware

- VRAM para inferencia en GPU: los pesos en float32 ocupan aproximadamente 355 MB (88,8 M de parámetros), a los que se suman las activaciones; un presupuesto realista es inferior a 2 GB. En w8a16 el peso baja a unos 90 MB más activaciones.
- GPU recomendadas para servidor: cualquier GPU con soporte CUDA puede ejecutar el modelo; no se requieren A100 ni H100, ya que su tamaño es reducido. Una NVIDIA T4 o L4 bastan sobradamente para lotes moderados.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna, incluidas RTX 3060, RTX 4060 y RTX 4090, e incluso en iGPU con soporte ONNX Runtime.
- Hardware objetivo principal: NPU Hexagon de Qualcomm, con latencias medidas de 6,1 a 108,6 ms según chipset y precisión. Los chipsets con mejor rendimiento son Snapdragon 8 Elite Gen 5, Snapdragon X2 Elite y Snapdragon 8 Elite.
- Opciones de despliegue: Qualcomm AI Hub Workbench con QAIRT 2.50, ONNX Runtime 1.30.0 (artefactos ONNX float y w8a16), QNN_DLC float y w8a16, y TFLITE float. En el ecosistema PyTorch se puede ejecutar directamente el checkpoint original con `torchvision`.
- Throughput y latencia: para lotes de tamaño 1, las latencias oscilan entre 6,143 ms (w8a16, Snapdragon 8 Elite Gen 5) y 108,62 ms (w8a16, Dragonwing Q-6690). La cuantización w8a16 reduce la latencia entre un 10 % y un 25 % en la mayoría de los chipsets comparados.
- Memoria pico: entre 1 y 667 MB según dispositivo y precisión, lo que permite ejecución concurrente con otras cargas en el mismo SoC.

## Comparativa con modelos similares

No se dispone de resultados de exactitud de Swin-Base en la información proporcionada, por lo que la comparación se limita a parámetros, entrada, licencia y disponibilidad. Las cifras de los modelos alternativos corresponden a sus configuraciones estándar publicadas por sus autores.

| Modelo | Parametros | Entrada | Arquitectura | Licencia |
|---|---|---|---|---|
| Swin-Base (Qualcomm) | 88,8 M | 224x224 | Transformer jerarquico con ventana desplazada | BSD-3-Clause |
| ViT-B/16 | 86 M | 224x224 | Transformer de visión plano con atencion global | Apache 2.0 / BSD segun implementacion |
| ResNet-50 | 25,6 M | 224x224 | CNN residual | BSD-3-Clause |
| ConvNeXt-Base | 89 M | 224x224 | CNN modernizada con diseno tipo transformer | MIT |

La ventaja diferencial de la versión de Qualcomm frente a las implementaciones de referencia no es la exactitud, sino la disponibilidad de artefactos preexportados y perfilados para NPU Hexagon, con métricas de latencia y memoria por chipset y soporte de cuantización w8a16. Las licencias de los cuatro modelos permiten uso comercial sin restricciones relevantes, aunque conviene revisar los términos de cada implementación concreta.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada. Al estar entrenado sobre ImageNet, es previsible que herede los sesgos de representación y etiquetado de dicho dataset, pero no hay análisis publicado en la model card.
- Riesgo de alucinación: no aplicable en el sentido generativo; sin embargo, un clasificador puede asignar con alta confianza clases incorrectas ante entradas fuera de distribución, especialmente con imágenes de dominios no representados en ImageNet.
- Limitaciones de contexto: la entrada está fijada a 224x224 en la configuración publicada. Aunque la arquitectura admite resoluciones mayores, habría que reexportar el modelo con la forma de entrada personalizada.
- Limitaciones de idioma: no aplicable, el modelo no procesa texto.
- Advertencia sobre cuantización: la información proporcionada describe la variante w8a16, pero no incluye métricas de degradación de exactitud tras la cuantización. Es imprescindible validar la precisión en el dominio de destino antes de desplegar en producción.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, modificación y redistribución con conservación del aviso de copyright y exención de responsabilidad. El acceso a los artefactos precompilados requiere cuenta en Qualcomm AI Hub, cuyos términos de uso deben revisarse por separado.
- Dependencia del hardware: los artefactos QNN_DLC y las métricas publicadas están vinculados a la plataforma QAIRT 2.50 y a chipsets Qualcomm. En hardware de otros fabricantes el rendimiento será diferente y habrá que usar las variantes ONNX o TFLITE.
- Caveat de producción: el repositorio tiene un tamaño de 33 GB, muy superior al del checkpoint (339 MB), porque incluye múltiples artefactos y dependencias; conviene descargar únicamente el paquete necesario.
- Sin datos de validación: no hay métricas de exactitud publicadas, por lo que cualquier comparación con otros backbones en una tarea concreta debe realizarse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Swin-Base
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/swin_base
- Repositorio Qualcomm AI Hub Models (Swin-Base): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/swin_base
- Repositorio Qualcomm AI Hub Models (general): https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper Swin Transformer: https://arxiv.org/abs/2103.14030
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/swin_transformer.py
- Web de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
- Wikipedia (Qualcomm): https://en.wikipedia.org/wiki/Qualcomm
