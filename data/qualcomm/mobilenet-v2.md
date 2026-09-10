# qualcomm/MobileNet-v2

## Resumen

MobileNet-v2 es un modelo de clasificacion de imagenes publicado por Qualcomm en HuggingFace, distribuido como parte del catalogo Qualcomm AI Hub Models. No se trata de un modelo entrenado desde cero por Qualcomm, sino de una reexportacion optimizada de la implementacion de MobileNetV2 disponible en el repositorio `tonylins/pytorch-mobilenet-v2`, con pesos preentrenados en ImageNet (1000 clases). Su proposito es servir tanto como clasificador de imagenes listo para produccion como backbone para tareas de vision mas complejas (deteccion, segmentacion, extraccion de caracteristicas).

El modelo ocupa 13,3 MB en precision float y 4,39 MB en cuantizacion w8a16, con 3,49 millones de parametros y una resolucion de entrada fija de 224x224 pixeles. La propuesta de valor del repositorio no es el modelo en si —MobileNetV2 es una arquitectura de 2018 ampliamente conocida— sino los artefactos preexportados para ejecutarse en la NPU de chipsets Qualcomm Snapdragon y Dragonwing, con tiempos de inferencia medidos entre 0,27 ms y 0,95 ms segun el SoC.

Es relevante ahora porque cubre el nicho de inferencia de vision en el borde (edge): cargas de trabajo de clasificacion en tiempo real en movil, IoT industrial y PCs con Snapdragon, donde el consumo energetico y el uso de memoria (rangos de 0 a 59 MB de pico) importan mas que la precision maxima. La licencia Apache 2.0 facilita su integracion comercial sin fricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (bloques de residuos invertidos con cuellos de botella lineales y convoluciones separables en profundidad) |
| Parametros totales | 3,49 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 224x224) |
| Tipos de cuantizacion | float, w8a16, w8a16_mixed_int16, w8a8 |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch, ONNX, QNN_DLC, TFLITE |
| Resolucion de entrada | 224 x 224 |
| Checkpoint | ImageNet |
| Tamano del modelo (float) | 13,3 MB |
| Tamano del modelo (w8a16) | 4,39 MB |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 324 / 10 |
| Fecha de creacion | 2024-02-25 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional disenada para eficiencia computacional en dispositivos moviles. Su elemento distintivo son los bloques de residuos invertidos (inverted residuals) combinados con cuellos de botella lineales (linear bottlenecks): en lugar de expandir y comprimir canales como en un residual clasico, el bloque expande los canales con una convolucion 1x1, aplica una convolucion separable en profundidad 3x3 y proyecta de nuevo a un espacio de menor dimensionalidad, eliminando la no linealidad en la proyeccion final para preservar informacion. Esto reduce el numero de operaciones y de parametros frente a arquitecturas convolucionales convencionales manteniendo capacidad representativa. La referencia tecnica es el articulo arXiv 1801.04381 ("MobileNetV2: Inverted Residuals and Linear Bottlenecks", Sandler et al., 2018).

Este repositorio concreto no documenta el proceso de entrenamiento: no se detallan el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset mas alla del checkpoint de ImageNet, ni si hubo tecnicas de ajuste como RLHF o DPO (no aplicables a un clasificador de vision). El autor indica que la implementacion base proviene de `tonylins/pytorch-mobilenet-v2` y que los artefactos incluidos son exportaciones optimizadas para dispositivos Qualcomm, compiladas y perfiladas mediante Qualcomm AI Hub Workbench. La innovacion practica del repositorio reside en el pipeline de exportacion: permite recompilar el modelo con pesos personalizados, formas de entrada propias y configuraciones de runtime especificas por dispositivo.

## Capacidades

- Clasificacion de imagenes en las 1000 clases del dataset ImageNet.
- Uso como backbone de extraccion de caracteristicas para modelos de vision mas complejos (deteccion de objetos, segmentacion, clasificacion con cabezas personalizadas).
- Inferencia en tiempo real: tiempos medidos por debajo de 1 ms en NPU de chipsets Snapdragon y Dragonwing.
- Exportacion a multiples runtimes: ONNX (con ONNX Runtime 1.27.1), QNN_DLC y TFLITE, compilados con QAIRT 2.45.
- Soporte de cuantizacion post-entrenamiento en varias precisiones (float, w8a16, w8a16_mixed_int16, w8a8) para reducir huella de memoria.
- Capacidad de reexportacion con pesos ajustados (fine-tuning) y formas de entrada personalizadas mediante la libreria Qualcomm AI Hub Models.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, vision multimodal, audio ni soporte multilingue: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Clasificacion de imagenes en tiempo real en movil: con 0,42 ms de inferencia en Snapdragon 8 Gen 3, el modelo puede procesar fotogramas de camara a multiples FPS dentro de una app Android, etiquetando la escena sin bloquear el hilo de interfaz.
- Preprocesado visual en asistentes de camara: filtrado previo de fotos en el dispositivo (por ejemplo, separar documentos de paisajes o de personas) antes de subirlas a servicios en la nube, reduciendo consumo de red y mejorando la privacidad.
- Backbone para deteccion de objetos en el borde: se puede conectar una cabeza tipo SSD o YOLO ligera sobre las caracteristicas extraidas por MobileNetV2 para vigilancia industrial o control de calidad en linea de produccion.
- Clasificacion de productos en comercio minorista: reconocimiento de articulos en estanterias o en cajas de autoservicio mediante modelos ajustados sobre el backbone, con cuantizacion w8a8 para caber en memoria reducida.
- Vision para IoT industrial: inspeccion de defectos en cadenas de montaje usando chipsets Dragonwing IQ-8275 o Q-8750, donde el pico de memoria de 2 a 4 MB permite ejecutarlo junto a otras tareas en el mismo SoC.
- Agricultura de precision: clasificacion de estados de cultivos o plagas desde drones o dispositivos de campo con conectividad limitada, aprovechando la inferencia local y el bajo consumo energetico de la NPU.
- Prototipado rapido de pipelines de vision: gracias a las exportaciones ONNX listas para usar, un equipo puede validar la precision de su caso de uso en servidor con ONNX Runtime antes de portar a dispositivo Qualcomm.
- Funcion auxiliar en PC con Snapdragon X Elite: etiquetado automatico de capturas o indexado de imagenes locales con 0,631 ms por inferencia y un consumo de memoria despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1 o top-5 en ImageNet) en la informacion disponible. La model card si incluye mediciones de latencia y memoria pico por chipset, con runtime ONNX y unidad de computo NPU:

| Chipset | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| Snapdragon X2 Elite | float | 0,307 | 2 - 2 |
| Snapdragon X2 Elite | w8a16 | 0,270 | 1 - 1 |
| Snapdragon X Elite | float | 0,631 | 7 - 7 |
| Snapdragon X Elite | w8a16 | 0,561 | 0 - 0 |
| Snapdragon 8 Gen 3 Mobile | float | 0,424 | 0 - 50 |
| Snapdragon 8 Gen 3 Mobile | w8a16 | 0,375 | no disponible (dato truncado en la fuente) |
| Snapdragon 8 Gen 1 Mobile | float | 0,946 | 1 - 59 |
| Snapdragon 8 Elite Mobile | float | 0,337 | 0 - 28 |
| Snapdragon 8 Elite Gen 5 Mobile | float | 0,278 | 0 - 30 |
| Qualcomm Dragonwing IQ-8275 | float | 0,858 | 0 - 4 |
| Qualcomm Dragonwing IQ-9075 | float | 0,853 | 1 - 3 |
| Qualcomm Dragonwing IQ-X7181 | float | 0,631 | 7 - 7 |
| Qualcomm Dragonwing Q-8750 | float | 0,337 | 0 - 28 |
| Qualcomm Dragonwing QCS8550 (Proxy) | float | 0,626 | 0 - 9 |
| Qualcomm QCS8450 | float | 0,946 | 1 - 59 |

En todos los casos medidos la unidad de computo principal es la NPU. La comparativa de precision frente a otras implementaciones de MobileNetV2 no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- Huella de memoria: entre 13,3 MB de pesos en float y 4,39 MB en w8a16; la memoria pico medida oscila entre 0 MB y 59 MB segun chipset y precision.
- Hardware objetivo: NPU de Qualcomm Snapdragon (X Elite, X2 Elite, 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5) y plataformas Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750) y QCS8450/QCS8550.
- VRAM en GPU de escritorio: no aplica al caso de uso objetivo; al ser un modelo de 3,49 M de parametros puede ejecutarse en cualquier GPU consumer (RTX 3060 o superior) mediante ONNX Runtime, pero no se han publicado mediciones de latencia en GPU en la informacion disponible.
- Cabe en cualquier dispositivo movil o embebido moderno, incluidas plataformas sin GPU dedicada, gracias a sus tamanos de 4,39 MB a 13,3 MB.
- Opciones de despliegue: ONNX Runtime 1.27.1, QNN_DLC sobre QAIRT 2.45 y TensorFlow Lite; la compilacion y el perfilado se realizan con Qualcomm AI Hub Workbench. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Throughput estimado: con tiempos de 0,27 a 0,95 ms por inferencia, el modelo puede superar las 1000 inferencias por segundo en los chipsets mas rapidos, siempre que el pipeline de entrada de imagen no sea el cuello de botella.
- Latencia y throughput en CPU o GPU no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye mediciones comparativas frente a otras arquitecturas. A continuacion se comparan categorias de modelos equivalentes, marcando como "no disponible" los datos que no constan en la fuente:

| Modelo | Parametros | Contexto / entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNet-v2 (Qualcomm) | 3,49 M | imagen 224x224 | no disponible | Apache 2.0 | Pesos PyTorch, ONNX, QNN_DLC y TFLITE preexportados en HuggingFace |
| MobileNetV1 | no disponible | imagen 224x224 | no disponible | Apache 2.0 (implementacion original) | Multiples implementaciones publicas |
| MobileNetV3 (Large/Small) | no disponible | imagen 224x224 | no disponible | Apache 2.0 (implementacion original) | Multiples implementaciones publicas |
| EfficientNet-Lite | no disponible | imagen 224x224 y superiores | no disponible | Apache 2.0 (implementacion original) | Multiples implementaciones publicas |

La ventaja diferencial de esta ficha frente a las alternativas no esta en el numero de parametros ni en la precision, sino en la disponibilidad de artefactos ya compilados y perfilados para NPU de Qualcomm, con licencia permisiva y metadatos de rendimiento por chipset.

## Limitaciones y advertencias

- Solo clasifica imagenes en las 1000 clases de ImageNet; cualquier caso de uso fuera de ese vocabulario requiere ajuste fino con datos propios.
- No se documentan metricas de precision (top-1/top-5) para validar la calidad real del checkpoint reexportado frente al original.
- Hereda los sesgos del dataset ImageNet, incluidas desequilibrios demograficos y geograficos en las clases de personas, objetos y escenas.
- La cuantizacion a w8a8 o w8a16 puede degradar la precision respecto a float; la model card no cuantifica esa perdida, por lo que se recomienda evaluar en el caso de uso concreto antes de desplegar en produccion.
- La resolucion de entrada esta fijada en 224x224; imagenes con relaciones de aspecto muy distintas requeriran redimensionado y posible recorte, con la consiguiente perdida de informacion.
- Riesgo de falsos positivos con alta confianza en clases visualmente similares, comportamiento tipico de clasificadores ImageNet; conviene aplicar umbrales de confianza y validacion posterior.
- No dispone de capacidad multilingue, conversacional ni de razonamiento; no debe emplearse como sustituto de un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no se ofrecen garantias explicitas de idoneidad ni de exactitud sobre los artefactos cuantizados.
- Los tiempos de inferencia publicados corresponden a mediciones con QAIRT 2.45 y ONNX Runtime 1.27.1; versiones distintas de SDK o cambios en el pipeline de preprocesado pueden alterar el rendimiento.
- El repositorio ocupa 1,6 GB debido a los multiples formatos y precisiones incluidos, lo que puede ser relevante en flujos de integracion continua con ancho de banda limitado.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/MobileNet-v2
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mobilenet_v2
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Repositorio Qualcomm AI Hub Models (v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/mobilenet_v2
- Implementacion base en PyTorch: https://github.com/tonylins/pytorch-mobilenet-v2/tree/master
- Articulo original MobileNetV2: https://arxiv.org/abs/1801.04381
- Web de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
- Relaciones con inversores de Qualcomm: https://investor.qualcomm.com/overview/default.aspx
