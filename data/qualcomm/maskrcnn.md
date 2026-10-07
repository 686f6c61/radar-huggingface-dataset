# qualcomm/MaskRCNN

## Resumen

MaskRCNN de Qualcomm es un modelo de segmentacion de instancias (instance segmentation) publicado por Qualcomm en HuggingFace dentro de su catalogo Qualcomm AI Hub Models. Se trata de una version optimizada y pre-exportada del conocido Mask R-CNN, la arquitectura propuesta por He et al. (arXiv:1703.06870) que extiende Faster R-CNN anadiendo una rama paralela que predice una mascara de segmentacion de alta calidad para cada objeto detectado, ademas de su caja delimitadora. El checkpoint de partida declarado en la model card es Mask R-CNN ResNet-50 FPN V2, procedente de la implementacion de referencia de torchvision.

El modelo resuelve el problema clasico de deteccion y segmentacion instancia a instancia: dada una imagen de entrada, devuelve para cada objeto detectado su clase, su caja y una mascara binaria por pixel. Cuenta con 46,4 millones de parametros, un tamano en float de 177 MB y 91 clases de salida, con una resolucion de entrada fija de 800x800 pixeles. Se distribuye en dos submodulos diferenciados, `proposal_generator` (la red de propuestas de region) y `roi_head` (la cabeza de clasificacion, regresion de cajas y mascaras).

Su relevancia actual no esta en la novedad algorimica, sino en el empaquetado: Qualcomm publica assets ya compilados para ejecutarse en la NPU de sus chipsets Snapdragon y Dragonwing, con dos runtimes disponibles (ONNX y QNN_DLC) en precision float, y con tiempos de inferencia medidos sobre dispositivos reales a traves de Qualcomm AI Hub Workbench. Esto lo convierte en una pieza util para quien necesite segmentacion de instancias en movil, automocion o edge industrial sin tener que abordar el proceso de conversion y optimizacion por su cuenta. La licencia es BSD-3-Clause, permisiva y apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN (Faster R-CNN de dos etapas con rama adicional de mascaras); backbone ResNet-50 con FPN |
| Parametros totales | 46,4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 800x800 px) |
| Tipos de cuantizacion | no disponible; los assets publicados en esta ficha son en precision float (ONNX float y QNN_DLC float) |
| Idiomas soportados | no disponible; las etiquetas de clase son las del dataset COCO, en ingles |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX y QNN_DLC (assets pre-exportados); PyTorch / torchvision como origen |
| Resolucion de entrada | 800x800 |
| Numero de clases de salida | 91 |
| Tamano del modelo (float) | 177 MB |
| Submodulos | proposal_generator, roi_head |
| Checkpoint de referencia | Mask R-CNN ResNet-50 FPN V2 |
| Fecha de publicacion en HuggingFace | 2026-03-12 (actualizado el 2026-10-07) |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

Mask R-CNN es un detector de dos etapas. La primera etapa, encapsulada aqui en el submodulo `proposal_generator`, es una Region Proposal Network (RPN) que genera propuestas de region candidatas sobre el mapa de caracteristicas. La segunda etapa, el submodulo `roi_head`, clasifica cada propuesta, refina su caja delimitadora y predice en paralelo una mascara binaria por instancia. El backbone declarado es ResNet-50 combinado con una Feature Pyramid Network (FPN) en su variante V2 de torchvision, lo que permite explotar caracteristicas multiescala y mejora la deteccion de objetos de tamanos muy distintos.

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni si se aplicaron tecnicas de ajuste fino posteriores. Tampoco se documentan en la informacion disponible procesos de RLHF o DPO, algo que en cualquier caso no aplica a un modelo discriminativo de vision. Lo que si se especifica es el origen del checkpoint (la implementacion de torchvision) y el proceso de optimizacion realizado por Qualcomm: compilacion y perfilado mediante Qualcomm AI Hub Workbench para su ejecucion en la NPU de los chipsets soportados, con exportacion a ONNX y a QNN_DLC. El trabajo de Qualcomm es, por tanto, de despliegue y optimizacion por hardware, no de entrenamiento desde cero.

## Capacidades

- Segmentacion de instancias: genera una mascara binaria por pixel para cada objeto detectado, ademas de la caja delimitadora y la etiqueta de clase.
- Deteccion de objetos: la salida incluye cajas con clase y puntuacion, por lo que puede usarse como detector aunque no se exploten las mascaras.
- Clasificacion sobre 91 clases de salida, correspondientes al esquema de categorias de COCO.
- Procesamiento de imagen unica a resolucion fija de 800x800 pixeles.
- Ejecucion acelerada en NPU: los assets compilados estan pensados para el NPU de los chipsets Snapdragon y Dragonwing, con runtimes ONNX y QNN_DLC.
- Despliegue en Android: la etiqueta `android` del repositorio indica que el flujo de despliegue objetivo es el movil.
- No soporta generacion de texto, razonamiento linguistico, tool calling, function calling ni comportamiento agentico: es un modelo puramente visual.
- No dispone de capacidades multilingues en el sentido de procesamiento de lenguaje; las etiquetas de clase estan en ingles.
- No incorpora modos especiales tipo thinking mode, vision-lenguaje, audio ni video.

## Casos de uso

- Segmentacion en tiempo real en aplicaciones moviles de fotografia: el modelo puede aislar sujetos (personas, animales, vehiculos) pixel a pixel para recorte de fondo o aplicacion de efectos selectivos, con latencias del orden de 40 a 110 ms por submodulo en chipsets Snapdragon de gama alta.
- Automocion y ADAS: los chipsets Qualcomm SA8295P, SA8650P y SA8255P aparecen soportados en la tabla de rendimiento, lo que habilita segmentacion de peatones, vehiculos y senalizacion a bordo, con la mascara aportando informacion de forma util para planificacion de trayectorias.
- Inspeccion visual en linea de produccion: con plataformas industriales como Dragonwing IQ-8275, IQ-9075 o QCS8550 se puede integrar la segmentacion de instancias en un pipeline de control de calidad para delimitar y medir defectos superficiales.
- Robotica y navegacion autonoma: las mascaras por instancia mejoran la comprension de escena frente a la mera deteccion por cajas, algo relevante para agarre, evitacion de obstaculos y manipulacion.
- Realidad aumentada: la mascara permite anclar contenido virtual respetando la silueta real del objeto segmentado en lugar de una caja rectangular.
- Analitica de retail y aforo: conteo y localizacion precisa de personas u objetos en estanterias o espacios comerciales, ejecutado en el propio dispositivo para evitar enviar video a la nube.
- Vision por computador en drones y dispositivos IoT industriales, aprovechando los chipsets Dragonwing de bajo consumo.
- Prototipado rapido en investigacion: dado que se puede exportar con configuraciones propias (pesos ajustados, formas de entrada personalizadas) mediante la libreria ai-hub-models, sirve como base para experimentar con checkpoints fine-tuned sobre NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP, IoU ni similares) en la informacion disponible. La model card unicamente proporciona metricas de latencia y memoria pico por dispositivo. Se reproduce a continuacion una seleccion representativa de la tabla de rendimiento publicada:

| Submodulo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|---|
| proposal_generator | ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 41,885 | 124 - 1350 |
| proposal_generator | QNN_DLC | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 41,682 | 7 - 1444 |
| proposal_generator | ONNX | float | Snapdragon X2 Elite | 35,289 | 272 - 272 |
| proposal_generator | QNN_DLC | float | Snapdragon X2 Elite | 41,472 | 7 - 7 |
| proposal_generator | ONNX | float | Snapdragon 8 Gen 3 Mobile | 53,215 | 140 - 2776 |
| proposal_generator | QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 107,846 | 2 - 2591 |
| proposal_generator | QNN_DLC | float | Qualcomm Dragonwing IQ-8275 | 116,65 | 7 - 73 |
| roi_head | ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 48,329 | 223 - 588 |
| roi_head | ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 62,73 | 227 - 591 |
| roi_head | ONNX | float | Snapdragon X2 Elite | 44,381 | 310 - 310 |
| roi_head | ONNX | float | Snapdragon 8 Gen 3 Mobile | 70,548 | no disponible (dato truncado en la informacion) |

En todos los casos la unidad de computo principal reportada es la NPU. La tabla completa, con mas de veinte combinaciones de chipset y runtime, esta disponible en la model card original.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en la NPU de chipsets Qualcomm, no en GPU de escritorio. El hardware objetivo son Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, Snapdragon X Elite y X2 Elite, ademas de las plataformas Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8550, QCS8450 y Q-8750, y los SoC de automocion SA8295P, SA8255P y SA8650P.
- Memoria: los pesos en float ocupan 177 MB. La memoria pico medida durante la inferencia varia mucho segun runtime y chipset, desde 7 MB en el mejor caso (QNN_DLC sobre Snapdragon X2 Elite) hasta 2776 MB en el peor registrado (ONNX sobre Snapdragon 8 Gen 3).
- VRAM estimada en GPU de escritorio: no disponible, porque el modelo no se distribuye con un flujo de despliegue orientado a GPU. A modo de referencia, los 46,4 M de parametros en fp32 equivalen a unos 186 MB de pesos, por lo que cabria en cualquier GPU consumer, aunque sin las optimizaciones de NPU el rendimiento no seria representativo del publicado.
- GPU recomendadas: no aplica; no se han publicado mediciones sobre A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: ONNX Runtime 1.30.0 con los assets ONNX, o QAIRT 2.50 con los assets QNN_DLC. La exportacion personalizada se realiza con la libreria Qualcomm AI Hub Models (version v0.64.0 en la informacion disponible) y el perfilado con Qualcomm AI Hub Workbench.
- No aplica el despliegue mediante vLLM, llama.cpp, Ollama o TGI: son herramientas para modelos de lenguaje, no para segmentacion de instancias.
- Latencia: entre 35,3 ms y 122,2 ms por submodulo segun chipset y runtime. Al ser un modelo de dos etapas, el coste total por imagen es la suma de `proposal_generator` y `roi_head`, tipicamente por debajo de los 200 ms en los chipsets mas recientes.
- Throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de precision ni de latencia de modelos alternativos, por lo que la comparacion numerica no es posible. Se ofrece una comparacion cualitativa con la referencia directa del propio modelo.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/MaskRCNN | 46,4 M | imagen 800x800, 91 clases | solo latencia publicada (35-122 ms por submodulo en NPU Qualcomm); mAP no disponible | BSD-3-Clause | assets ONNX y QNN_DLC en HuggingFace y Qualcomm AI Hub |
| Mask R-CNN ResNet-50 FPN V2 de torchvision | 46,4 M (mismo checkpoint de origen) | imagen, esquema de 91 clases | no disponible en la informacion proporcionada | BSD-3-Clause | pesos PyTorch en torchvision |
| Otras familias de segmentacion de instancias (por ejemplo, variantes de YOLO con cabeza de segmentacion o SAM) | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia relevante frente al checkpoint original de torchvision no es de arquitectura ni de precision, sino de empaquetado: Qualcomm entrega el modelo compilado y perfilado para NPU, con artefactos listos para desplegar en Android y en plataformas embebidas.

## Limitaciones y advertencias

- No se han publicado metricas de precision (mAP de cajas o de mascaras) en la informacion disponible, por lo que no es posible estimar la calidad real de las segmentaciones sin evaluarla uno mismo.
- Solo se distribuyen assets en precision float. No hay versiones cuantizadas publicadas en esta ficha, lo que limita la reduccion de memoria y el aprovechamiento de aceleracion entera en algunos目标的.
- La resolucion de entrada esta fijada en 800x800 en la configuracion por defecto; cambiarla requiere reexportar el modelo con la libreria ai-hub-models.
- El modelo esta limitado al esquema de 91 clases de COCO. No detectara categorias fuera de ese vocabulario sin un ajuste fino previo.
- Riesgo de falsos negativos y mascaras imprecisas en objetos muy pequenos, muy solapados o parcialmente ocluidos, una limitacion inherente a la arquitectura de dos etapas con propuestas de region.
- Las etiquetas de clase y el vocabulario de salida estan en ingles; no hay soporte multilingue ni procesamiento de texto.
- El termino alucinacion no aplica en el sentido generativo, pero si existe el riesgo equivalente de predicciones espurias: detecciones falsas con mascaras plausibles en escenas ambiguas.
- Sesgos conocidos: no se documentan en la model card analisis de sesgo por genero, tono de piel u origen etnico. Si el checkpoint se entreno sobre COCO, hereda los sesgos de representacion y anotacion de ese dataset.
- Licencia BSD-3-Clause: permisiva, permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright y la clausula de no endorsement. Conviene verificar tambien las condiciones aplicables al checkpoint de origen de torchvision.
- El modelo esta atado al ecosistema Qualcomm para obtener el rendimiento publicado; en hardware de otro fabricante las cifras no seran extrapolables.
- El repositorio registra 0 descargas y 1 like, por lo que la validacion por parte de la comunidad es practicamente nula en el momento de redactar esta ficha.
- Los assets estan compilados contra versiones concretas de runtime (QAIRT 2.50, ONNX Runtime 1.30.0); desplegar con otras versiones puede requerir recompilacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/MaskRCNN
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/maskrcnn
- Repositorio de la libreria ai-hub-models, entrada de MaskRCNN: https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/maskrcnn
- Descarga de assets ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/maskrcnn/releases/v0.64.0/maskrcnn-onnx-float.zip
- Descarga de assets QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/maskrcnn/releases/v0.64.0/maskrcnn-qnn_dlc-float.zip
- Qualcomm AI Hub Workbench (requiere registro): https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
- Paper original de Mask R-CNN (arXiv:1703.06870): https://arxiv.org/abs/1703.06870
- Implementacion de referencia en torchvision: https://github.com/pytorch/vision
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
