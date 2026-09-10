# qualcomm/EfficientNet-Lite4

## Resumen

EfficientNet-Lite4 es un modelo de clasificacion de imagenes desarrollado originalmente por Google (paper "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks", arXiv:1905.11946) y redistribuido por Qualcomm en su repositorio de HuggingFace como parte de Qualcomm AI Hub Models. Se trata de la variante mas grande de la familia EfficientNet-Lite, una version adaptada de EfficientNet pensada para inferencia en dispositivos moviles y de borde, con 13,01 millones de parametros y una resolucion de entrada fija de 300x300 pixeles. El modelo llega preentrenado sobre el checkpoint de ImageNet y se publica junto con artefactos ya exportados para su despliegue en hardware Qualcomm.

El problema que resuelve es la clasificacion de imagenes en 1000 clases de ImageNet con latencias de milisegundos y bajo consumo de memoria, aprovechando la unidad de procesamiento neuronal (NPU) de los SoC Snapdragon, Dragonwing y QCS de Qualcomm. Ademas de la tarea de clasificacion directa, la model card lo presenta explicitamente como backbone reutilizable para construir modelos mas complejos (deteccion, segmentacion, extraccion de caracteristicas) en casos de uso especificos.

Su relevancia actual no esta en la novedad arquitectonica, sino en la distribucion: Qualcomm publica pesos optimizados y compilados para ONNX Runtime, QNN_DLC (Qualcomm AI Engine Direct) y TFLite, en precision float y cuantizada w8a8, junto con el flujo de trabajo de Qualcomm AI Hub Workbench para compilar, perfilar y evaluar el modelo en dispositivos reales alojados. Esto elimina buena parte del trabajo de conversion y optimizacion que normalmente exige llevar un modelo de vision a la NPU de un telefono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite (red neuronal convolucional con compound scaling) |
| Parametros totales | 13,01 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 300x300 pixeles) |
| Tipos de cuantizacion | float y w8a8 (int8 en pesos y activaciones) |
| Idiomas soportados | no disponible (clasificacion de imagenes; las 1000 clases de ImageNet estan etiquetadas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (float, w8a8), QNN_DLC (float, w8a8), TFLITE (float, w8a8); checkpoint original en PyTorch |
| Resolucion de entrada | 300x300 |
| Tamano del modelo (float) | 51,9 MB |
| Dataset del checkpoint | ImageNet |
| Runtime soportado | QAIRT 2.45, ONNX Runtime 1.27.1 |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

EfficientNet-Lite4 es una CNN de la familia EfficientNet, cuyo principio central es el compound scaling: en lugar de escalar solo la profundidad, el ancho o la resolucion de forma aislada, se escalan las tres dimensiones de manera conjunta mediante un coeficiente compuesto. La variante "Lite" sustituye las operaciones no soportadas de forma eficiente por hardware movil (en particular, elimina la activacion swish y las convoluciones con funcion de activacion compuesta) por alternativas compatibles con cuantizacion int8 y con aceleradores de baja precision, manteniendo la estructura de bloques MBConv con Squeeze-and-Excitation, aunque con menos componentes no lineales.

El checkpoint distribuido esta entrenado sobre ImageNet para clasificacion en 1000 clases y se presenta como backbone generico: la salida de las capas convolucionales puede reutilizarse como extractor de caracteristicas para tareas posteriores. La implementacion de referencia citada por el autor es el repositorio de RangiLyu (EfficientNet-Lite). No se detallan en la informacion proporcionada el numero exacto de tokens o imagenes visto durante el entrenamiento, la composicion completa del dataset mas alla de ImageNet, ni si hubo etapas de ajuste fino con RLHF o DPO (tecnicas por otra parte no habituales ni aplicables a un clasificador de imagenes). La innovacion destacable en esta publicacion concreta no es el entrenamiento, sino el pipeline de exportacion y compilacion: el modelo se entrega ya convertido a ONNX, TFLite y QNN_DLC, perfilado sobre NPU de Qualcomm y disponible tambien mediante la libreria `ai-hub-models` (version v0.62.0) para reexportar con pesos ajustados, formas de entrada personalizadas y configuraciones de dispositivo objetivo.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet con una unica pasada hacia delante y salida de probabilidades por clase.
- Extraccion de caracteristicas (backbone) para construir modelos posteriores de deteccion, segmentacion, recuperacion de imagenes o clasificacion con cabezas personalizadas.
- Inferencia acelerada en NPU de Qualcomm mediante artefactos QNN_DLC, con soporte de precision float y w8a8.
- Despliegue multiplataforma a traves de ONNX Runtime y TFLite, ademas del runtime propietario QAIRT.
- Ajuste fino y reexportacion desde el repositorio `ai-hub-models`, con control sobre formas de entrada y pesos personalizados.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, modo thinking, audio ni vision generativa. Es exclusivamente un clasificador convolucional de imagen.
- No se documentan capacidades multimodales ni procesamiento de lenguaje natural.

## Casos de uso

- Clasificacion de fotos en aplicaciones moviles: el modelo cabe en 51,9 MB en float y se ejecuta en la NPU con latencias de 1,145 ms a 2,736 ms en SoC de gama alta (Snapdragon 8 Elite Gen 5 y X Elite), lo que permite etiquetar imagenes de la galeria en tiempo real sin enviar datos a la nube.
- Preprocesado en camara y fotografia computacional: clasificar la escena capturada para activar modos automaticos (retrato, paisaje, noche) dentro del pipeline de la ISP, gracias a la latencia sub-3 ms en NPU.
- Moderacion de contenido en el dispositivo: filtrar categorias concretas de ImageNet de forma local antes de subir imagenes a un servicio, reduciendo coste de ancho de banda y mejorando la privacidad.
- Backbone para modelos de vision personalizados: reutilizar las caracteristicas convolucionales como entrada de cabezas de deteccion o segmentacion en proyectos de robotica, inspeccion industrial o agricultura de precision.
- Inspeccion visual en el borde industrial: ejecutar clasificacion de defectos en dispositivos con SoC QCS8550 o Dragonwing IQ-8275 (1,24-1,335 ms en w8a8), donde el consumo y la latencia deterministica importan mas que la precision absoluta.
- Procesamiento por lotes en servidores con ONNX Runtime: usar la version w8a8 para indexar y etiquetar grandes volumenes de imagenes reduciendo el coste por inferencia frente a modelos convolucionales de mayor tamano.
- Aplicaciones de accesibilidad: describir o etiquetar objetos en la camara del telefono en tiempo real, alimentando un modulo de texto a voz con las clases detectadas.
- Prototipado rapido con Qualcomm AI Hub Workbench: compilar y perfilar variantes del modelo en dispositivos alojados sin disponer fisicamente del hardware, util para validar presupuestos de latencia y memoria antes de la integracion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1, top-5 de ImageNet) en la informacion disponible. La model card solo aporta mediciones de latencia y memoria pico por dispositivo, ejecutadas con el runtime ONNX y unidad de computo principal NPU.

| Dispositivo | Precision | Latencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| Snapdragon X2 Elite | float | 1,448 | 1 |
| Snapdragon X2 Elite | w8a8 | 0,646 | 1 |
| Snapdragon X Elite | float | 2,736 | 29 |
| Snapdragon X Elite | w8a8 | 1,283 | 15 |
| Snapdragon 8 Gen 3 Mobile | float | 1,913 | 0-102 |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 0,874 | 0-110 |
| Snapdragon 8 Gen 1 Mobile | float | 5,536 | 0-100 |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 2,077 | 0-117 |
| Snapdragon 8 Elite Mobile | float | 1,499 | 0-55 |
| Snapdragon 8 Elite Gen 5 Mobile | float | 1,145 | 0-58 |
| Dragonwing IQ-8275 | float | 4,631 | 1-5 |
| Dragonwing IQ-8275 | w8a8 | 1,335 | 0-4 |
| Dragonwing IQ-9075 | float | 4,145 | 1-4 |
| Dragonwing IQ-9075 | w8a8 | 1,422 | 0-3 |
| Dragonwing IQ-X7181 | float | 2,736 | 29 |
| Dragonwing IQ-X7181 | w8a8 | 1,283 | 15 |
| Dragonwing Q-8750 | float | 1,499 | 0-55 |
| Dragonwing QCS8550 (proxy) | float | 2,623 | 0-33 |
| Dragonwing QCS8550 (proxy) | w8a8 | 1,24 | 0-18 |
| Dragonwing QCS6490 | w8a8 | 5,978 | 0-3 |
| QCS8450 | float | 5,536 | 0-100 |
| QCS8450 | w8a8 | 2,077 | 0-117 |

La cuantizacion w8a8 reduce la latencia de forma sistematica, aproximadamente a la mitad o menos en todos los dispositivos comparables, a cambio de una perdida de precision no cuantificada en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo ocupa 51,9 MB en float y menos en w8a8, por lo que la memoria pico reportada en NPU va de 1 MB a 118 MB segun dispositivo y precision.
- GPU recomendadas: la publicacion esta orientada a NPU de Qualcomm (Snapdragon 8 Gen 1/3/Elite, Dragonwing IQ-8275/9075/X7181/Q-8750, QCS6490/8450/8550). No se aportan cifras para A100, H100 o RTX 4090; en esas GPU puede ejecutarse la version ONNX float sin optimizaciones especificas, pero no hay datos de rendimiento publicados.
- Cabe sobradamente en cualquier GPU de consumo e incluso en CPU y en microcontroladores de gama alta: 13,01 M de parametros y 51,9 MB en float.
- Opciones de despliegue: ONNX Runtime (float y w8a8), QNN_DLC con QAIRT 2.45 sobre NPU Qualcomm, TFLite (float y w8a8), y la libreria `ai-hub-models` v0.62.0 para compilacion y exportacion personalizadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de vision.
- Latencia: 0,646 ms (mejor caso, Snapdragon X2 Elite en w8a8) hasta 5,978 ms (peor caso documentado, Dragonwing QCS6490 en w8a8); en float, de 1,145 ms a 5,536 ms.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de precision ni de latencia frente a alternativas, por lo que las cifras de rendimiento relativo se marcan como no disponibles.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EfficientNet-Lite4 (este) | 13,01 M | 300x300 px | apache-2.0 | HuggingFace, Qualcomm AI Hub, GitHub | Exportaciones ONNX, QNN_DLC y TFLITE en float y w8a8 |
| EfficientNet-Lite0 a Lite3 | no disponible | no disponible | no disponible | implementacion de referencia en GitHub (RangiLyu) | Variantes menores de la misma familia; datos concretos no incluidos en la informacion disponible |
| EfficientNet-B0 a B7 (original) | no disponible | no disponible | no disponible | TensorFlow/Keras, multiples repositorios | Familia original sin las adaptaciones para cuantizacion movil; comparativa numerica no disponible |
| MobileNetV3 | no disponible | no disponible | no disponible | TensorFlow, PyTorch, ONNX | Alternativa habitual en clasificacion movil; no se aportan metricas comparativas en la informacion disponible |
| ResNet-50 | no disponible | no disponible | no disponible | amplia disponibilidad | Referencia clasica de clasificacion; sin datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Es un clasificador cerrado: solo predice las 1000 clases de ImageNet. Cualquier objeto fuera de ese vocabulario se asignara a la clase mas parecida, con el consiguiente riesgo de etiquetado erroneo.
- No se documentan evaluaciones de sesgo. Al estar entrenado sobre ImageNet, hereda los desequilibrios de representacion de ese dataset en cuanto a categorias, contextos geograficos y demografia.
- La calibracion de confianza no esta verificada: en aplicaciones criticas conviene aplicar umbrales y validacion propia antes de actuar sobre las predicciones.
- No se publican metricas de precision (top-1/top-5) ni la degradacion introducida por la cuantizacion w8a8, por lo que la eleccion entre float y w8a8 debe validarse empiricamente en el caso de uso concreto.
- La resolucion de entrada es fija en 300x300; imagenes de otras proporciones requieren redimensionado y recorte, lo que puede afectar a objetos pequenos o a escenas con relaciones de aspecto extremas.
- El modelo esta optimizado y perfilado para NPU de Qualcomm. En otros aceleradores o GPU el rendimiento puede ser sustancialmente distinto y no hay cifras publicadas.
- Aunque la licencia apache-2.0 permite uso comercial, la redistribucion de artefactos compilados puede estar sujeta a los terminos del SDK de Qualcomm (QAIRT) y del propio runtime QNN; conviene revisar esas condiciones antes de un despliegue en producto.
- Los pesos distribuidos estan pensados para inferencia; no se documentan recetas de ajuste fino dentro de esta tarjeta, solo la posibilidad de reexportar desde el repositorio de `ai-hub-models`.
- No existe soporte de texto, dialogo ni agentes: intentar usarlo como modelo de lenguaje no es viable.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/EfficientNet-Lite4
- Repositorio de archivos en HuggingFace: https://huggingface.co/qualcomm/EfficientNet-Lite4/tree/main
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/efficientnet_lite4
- Qualcomm AI Hub (computo y perfiles): https://aihub.qualcomm.com/compute/models/efficientnet_lite4
- GitHub, carpeta del modelo en ai-hub-models (v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/efficientnet_lite4
- GitHub, carpeta del modelo en la rama main: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/efficientnet_lite4
- GitHub, definicion del modelo (model.py): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/efficientnet_lite4/model.py
- Paper de EfficientNet (arXiv:1905.11946): https://arxiv.org/abs/1905.11946
- Implementacion de referencia EfficientNet-Lite (RangiLyu): https://github.com/RangiLyu/EfficientNet-Lite
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
