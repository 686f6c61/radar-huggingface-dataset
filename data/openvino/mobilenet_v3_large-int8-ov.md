# OpenVINO/mobilenet_v3_large-int8-ov

## Resumen

`mobilenet_v3_large-int8-ov` es una versión optimizada del clasificador de imágenes MobileNetV3-Large, originalmente desarrollado por el equipo de torchvision (PyTorch) y convertido al formato Intermediate Representation (IR) de OpenVINO por Intel. El modelo resultante emplea cuantización INT8 tanto en pesos como en activaciones, lo que reduce significativamente el tamaño del artefacto y acelera la inferencia en hardware Intel (CPU, iGPU, NPU) sin requerir reentrenamiento.

MobileNetV3-Large es una red neuronal convolucional diseñada específicamente para entornos con recursos limitados, combinando búsqueda de arquitectura neuronal (NAS) con bloques de atención squeeze-and-excitation y convoluciones depthwise separables. Está pensada para clasificación de imágenes en 1000 clases (ImageNet-1k), con una resolución de entrada típica de 224x224 píxeles.

La relevancia de esta ficha radica en su orientación a despliegue en producción: al estar en formato OpenVINO IR con INT8, es directamente consumible por el runtime de OpenVINO 2026.1.0 o superior y por la Model API de OpenVINO, lo que la convierte en una opción práctica para visión por computador en edge, AI PCs y sistemas embebidos Intel donde el consumo energético y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV3-Large, basada en NAS + bloques depthwise separables y squeeze-and-excitation) |
| Parametros totales | no disponible (el modelo original MobileNetV3-Large tiene ~5,4 M de parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8 (pesos y activaciones), Post-Training Quantization (PTQ) via nncf.quantize |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (Intermediate Representation) con pesos comprimidos a INT8 |

## Arquitectura y entrenamiento

MobileNetV3-Large es una red convolucional diseñada mediante Neural Architecture Search (NAS) combinada con optimizaciones manuales. Su bloque fundamental es el bottleneck invertido con convoluciones depthwise separables, al que se añaden módulos de squeeze-and-excitation para recalibración de canales. La arquitectura emplea funciones de activación h-swish y h-sigmoid, más eficientes computacionalmente que sus equivalentes estándar, y está optimizada para un equilibrio entre precisión y latencia en dispositivos móviles y edge.

El modelo original fue entrenado por el equipo de torchvision sobre el conjunto de datos ImageNet-1k (1000 clases). Esta versión concreta no ha sido reentrenada: se trata de una conversión del checkpoint de torchvision al formato OpenVINO IR, seguida de una cuantización post-entrenamiento (PTQ) con la librería NNCF de Intel. La cuantización se aplica tanto a pesos como a activaciones en INT8, lo que reduce el tamaño del modelo y acelera la inferencia en hardware Intel compatible con las instrucciones VNNI y AMX. No se documenta en la información disponible si se aplicó fine-tuning posterior a la cuantización ni qué algoritmo de calibración se utilizó.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Inferencia optimizada para hardware Intel (CPU, iGPU, NPU) mediante el runtime de OpenVINO.
- Ejecución en modo INT8 con pesos y activaciones cuantizados, lo que reduce el uso de memoria y acelera el cómputo.
- Compatible con OpenVINO Model API 0.4.0 o superior, que facilita la carga, inferencia y visualización de resultados.
- Integrable en pipelines de visión por computador mediante OpenCV y otras librerías estándar de Python.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos edge: el modelo puede procesar fotogramas de una cámara en un AI PC o dispositivo embebido Intel, clasificando el contenido en una de las 1000 categorías de ImageNet con latencia baja gracias a la cuantización INT8.
- Moderación de contenido visual: integrado en un pipeline que recibe imágenes subidas por usuarios, el modelo puede etiquetar automáticamente el contenido para filtrar categorías no deseadas antes de un análisis más profundo.
- Indexado y etiquetado automático de bibliotecas de imágenes: en aplicaciones de gestión de activos digitales, el modelo asigna etiquetas semánticas a cada imagen, facilitando la búsqueda y organización sin intervención manual.
- Preprocesamiento en sistemas de visión industrial: como primer clasificador en una cadena de inspección, puede descartar imágenes que no contienen el objeto de interés antes de pasar a modelos más costosos.
- Aplicaciones móviles y de escritorio con inferencia local: al ser un modelo compacto y cuantizado, puede ejecutarse en portátiles con CPU Intel sin GPU dedicada, habilitando clasificación de imágenes offline en aplicaciones de escritorio.
- Prototipado rápido de pipelines de visión: gracias a su integración con OpenVINO Model API y OpenCV, sirve como componente de referencia para validar arquitecturas de despliegue antes de sustituirlo por modelos más específicos.
- Clasificación de imágenes en sistemas de vigilancia: puede etiquetar eventos visuales (personas, vehículos, animales) en flujos de vídeo de baja resolución en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de ~5,4 M de parámetros en INT8, el peso del modelo es del orden de unos pocos megabytes, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información proporcionada. El modelo está optimizado para hardware Intel (CPU con VNNI/AMX, iGPU Intel, NPU Intel), aunque el runtime de OpenVINO también soporta GPU discretas.
- Compatibilidad con GPU consumer: sí, por el reducido tamaño del modelo es probable que quepa en cualquier GPU consumer, aunque no se documentan requisitos mínimos específicos.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior), OpenVINO Model API (0.4.0 o superior), Optimum Intel, vLLM con backend OpenVINO (para otros modelos), y potencialmente Torch.compile y ExecuTorch mediante integración con OpenVINO.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenet_v3_large-int8-ov | ~5,4 M (no confirmado) | no aplica | OpenVINO IR INT8 | BSD-3-Clause | Hugging Face |
| mobilenet-v3-large-1.0-224-tf (OpenVINO OMZ) | no disponible | no aplica | OpenVINO IR | Apache 2.0 (segun OMZ) | Open Model Zoo |
| MobileNetV3-Large original (torchvision) | ~5,4 M | no aplica | PyTorch (safetensors/pth) | BSD-3-Clause | torchvision |
| EfficientNet-B0 (referencia) | ~5,3 M | no aplica | Multiples | Apache 2.0 | Multiples |

La comparativa se limita a alternativas de la misma categoría (clasificadores CNN ligeros). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está limitado a clasificación de imágenes en 1000 clases de ImageNet; no realiza detección de objetos, segmentación ni generación.
- La cuantización INT8 puede introducir una pérdida de precisión respecto al modelo original en FP32, aunque no se documenta la magnitud de esta degradación.
- No se especifican sesgos conocidos en la información proporcionada; el modelo hereda los sesgos del dataset ImageNet-1k y del entrenamiento original de torchvision.
- Riesgo de alucinación no aplica (modelo discriminativo), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero se recomienda revisar los términos del modelo original en torchvision.
- El modelo requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores no son compatibles.
- No se proporcionan datos sobre el proceso de calibración de la cuantización, lo que dificulta evaluar su robustez en dominios distintos a ImageNet.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el repositorio está vacío; se recomienda verificar antes de su uso en producción.

## Enlaces

- [Hugging Face: OpenVINO/mobilenet_v3_large-int8-ov](https://huggingface.co/OpenVINO/mobilenet_v3_large-int8-ov)
- [Repositorio original de torchvision](https://github.com/pytorch/vision)
- [Documentación de MobileNetV3-Large en torchvision](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.mobilenet_v3_large.html)
- [Formato OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [Guía de optimización de modelos OpenVINO (cuantización)](https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html)
- [OpenVINO Model API](https://github.com/open-edge-platform/model_api)
- [Documentación de OpenVINO Model API](https://open-edge-platform.github.io/model_api/latest/)
- [Repositorio OpenVINO Toolkit](https://github.com/openvinotoolkit/openvino)
- [Documentación de OpenVINO](https://docs.openvino.ai/)
- [Intel Distribution of OpenVINO Toolkit](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html)
- [Modelo mobilenet-v3-large-1.0-224-tf en Open Model Zoo](https://docs.openvino.ai/2023.3/omz_models_model_mobilenet_v3_large_1_0_224_tf.html)
