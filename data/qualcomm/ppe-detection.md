# qualcomm/PPE-Detection

## Resumen

PPE-Detection es un modelo de deteccion de objetos desarrollado por Qualcomm para identificar en tiempo real si una persona lleva puesto equipo de proteccion individual (EPI/PPE) en entornos industriales. La arquitectura, denominada internamente Gear Guard Net, fue disenada por Qualcomm y entrenada sobre un dataset propietario de la compania, aunque el modelo resultante puede aplicarse a imagenes arbitrarias. Con 6,19 millones de parametros y una resolucion de entrada de 320x192 pixeles, esta optimizado para ejecutarse en la NPU de los chipsets Snapdragon y Dragonwing mediante el runtime QNN de Qualcomm AI Engine Direct.

El modelo se distribuye como artefactos preexportados (ONNX, QNN_DLC y TFLITE) en precisiones float, w8a16 y w8a8, listos para desplegar en dispositivos moviles, IoT industrial y plataformas embebidas con aceleracion hardware de Qualcomm. Su relevancia actual radica en la demanda de vision artificial en el borde (edge) para seguridad laboral: detectar cascos, chalecos y otra proteccion sin depender de la nube, con latencias inferiores al milisegundo en los chipsets mas recientes.

La ficha se basa exclusivamente en la model card publicada en Hugging Face y en los resultados de rendimiento que Qualcomm reporta para distintos SoCs. No se dispone de informacion sobre el dataset de entrenamiento, los benchmarks de precision (mAP) ni los idiomas soportados, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gear Guard Net (detector de objetos, diseno propio de Qualcomm) |
| Parametros totales | 6,19 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float, w8a16, w8a8 |
| Idiomas soportados | no disponible (modelo de vision, sin componente linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (artefactos preexportados); PyTorch como libreria base |
| Resolucion de entrada | 320x192 |
| Clases de salida | 2 |
| Tamano del modelo (float) | 23,6 MB |
| Tamano del modelo (w8a16) | 6,65 MB |
| Tamano del modelo (w8a8) | 6,23 MB |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La model card indica que la arquitectura fue desarrollada por Qualcomm bajo el nombre Gear Guard Net, pero no detalla si se trata de un detector de una etapa (tipo YOLO o SSD) o de dos etapas, ni especifica el backbone, el mecanismo de atencion o la cabeza de deteccion. Tampoco se documenta el numero de tokens de entrenamiento (no aplica en vision, pero si el volumen de imagenes), la composicion del dataset ni si se emplearon tecnicas de aumento de datos, destilacion o ajuste fino. El unico dato disponible es que el entrenamiento se realizo sobre un dataset propietario de Qualcomm.

La innovacion tecnica destacable no esta en la arquitectura del modelo en si, sino en el pipeline de exportacion y optimizacion para hardware Qualcomm: los artefactos QNN_DLC se compilan con QAIRT 2.51 y se ejecutan en la NPU del chipset, con variantes cuantizadas w8a16 y w8a8 que reducen el tamano del modelo de 23,6 MB a 6,23 MB y mejoran la latencia entre un 30 % y un 40 % en los SoCs probados. El modelo se integra en la libreria Qualcomm AI Hub Models (version 0.67.0), que permite reexportar con pesos personalizados, formas de entrada a medida y configuraciones de dispositivo y runtime propias.

## Capacidades

- Deteccion de objetos en tiempo real orientada a la verificacion de equipo de proteccion individual (EPI/PPE) en imagenes.
- Clasificacion binaria de dos clases de salida (la model card no especifica cuales son; presumiblemente presencia/ausencia de proteccion).
- Inferencia en el dispositivo (edge) sobre NPU de Qualcomm, sin necesidad de conexion a la nube.
- Ejecucion en multiples runtimes: ONNX Runtime 1.30.0, QNN (QAIRT 2.51) y TensorFlow Lite.
- Soporte de cuantizacion post-entrenamiento en w8a16 y w8a8 para reducir huella de memoria y latencia.
- Exportacion personalizada mediante la libreria Qualcomm AI Hub Models (pesos ajustados, formas de entrada, dispositivos objetivo).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es un modelo puramente visual de deteccion.

## Casos de uso

- Monitorizacion de seguridad en obra y planta industrial: el modelo se ejecuta en camaras IP con SoC Snapdragon o Dragonwing y detecta en cada fotograma si los operarios llevan casco o chaleco, con latencias de 0,37 a 2,1 ms segun chipset, lo que permite alertas en tiempo real sin enviar video a la nube.
- Control de acceso a zonas de riesgo: integrado en tornos o puertas con vision embebida, verifica que el trabajador lleva la proteccion exigida antes de permitir el paso, usando la variante w8a8 de 6,23 MB que cabe en memoria de dispositivos de bajo consumo.
- Inspeccion en drones industriales: al ser un modelo de 6,19 M de parametros y 23,6 MB en float, puede embarcarse en payloads con Snapdragon X Elite o Dragonwing IQ-9075 para sobrevolar instalaciones y auditar el cumplimiento de EPI en zonas de dificil acceso.
- Auditoria de grabaciones de videovigilancia: procesamiento por lotes de archivos de video en un servidor con acelerador Qualcomm Cloud AI o en un PC con Snapdragon X Elite, usando ONNX float para maximizar precision y revisar cumplimiento normativo a posteriori.
- Wearables y cascos inteligentes: la variante TFLITE w8a8 (6,23 MB) permite ejecutar el detector en un casco con camara integrada y SoC de bajo consumo, alertando al propio trabajador cuando se lo quita en zona de riesgo.
- Analitica de cumplimiento para EHS (Environment, Health and Safety): el modelo puede alimentar dashboards que agreguen detecciones por turno y planta, exportando las cajas delimitadoras a un backend para calcular tasas de cumplimiento y generar informes regulatorios.
- Prototipado rapido con Qualcomm AI Hub Workbench: los equipos de desarrollo pueden subir el modelo a la plataforma alojada de Qualcomm y perfilarlo en dispositivos reales antes de comprometerse con un hardware concreto, gracias a los artefactos preexportados y a la API de la libreria.

## Benchmarks y rendimiento

La model card no publica metricas de precision (mAP, recall, precision por clase) sobre un conjunto de validacion publico. Si se publican latencias de inferencia y rangos de memoria pico por chipset y runtime. Se reproducen a continuacion los datos disponibles para ONNX en precision float y w8a16:

| Chipset | Precision | Inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | float | 0,508 | 1 - 54 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 0,554 | 0 - 56 | NPU |
| Snapdragon 8 Elite Gen 6 Mobile | float | 0,662 | 0 - 45 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | float | 0,676 | 0 - 56 | NPU |
| Dragonwing Q-8750 | float | 0,676 | 0 - 56 | NPU |
| Snapdragon 8 Gen 3 Mobile | float | 0,863 | 0 - 69 | NPU |
| Dragonwing QCS8550 (Proxy) | float | 1,253 | 0 - 72 | NPU |
| Snapdragon X Elite | float | 1,297 | 13 - 13 | NPU |
| Dragonwing IQ-X7181 | float | 1,297 | 13 - 13 | NPU |
| Dragonwing IQ-9075 | float | 1,726 | 1 - 4 | NPU |
| Dragonwing IQ-8275 | float | 1,820 | 1 - 5 | NPU |
| Snapdragon 8 Gen 1 Mobile | float | 2,123 | 1 - 57 | NPU |
| QCS8450 | float | 2,123 | 1 - 57 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | w8a16 | 0,370 | 0 - 46 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | w8a16 | 0,450 | 0 - 50 | NPU |
| Snapdragon X2 Elite | w8a16 | 0,394 | 1 - 1 | NPU |
| Snapdragon X Elite | w8a16 | 0,938 | 6 - 6 | NPU |
| Snapdragon 8 Gen 3 Mobile | w8a16 | 0,579 | no disponible en el extracto | NPU |

La cuantizacion w8a16 reduce la latencia entre un 20 % y un 30 % respecto a float en los SoCs comparables (por ejemplo, 0,554 ms a 0,370 ms en Snapdragon 8 Elite Gen 5 For Galaxy Mobile). El resto de combinaciones runtime/chipset estan disponibles en la pagina de Qualcomm AI Hub del modelo. No se han publicado resultados de benchmarks de precision (mAP, F1) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en NPU con memoria pico entre 0 y 72 MB segun chipset y precision. En float ocupa 23,6 MB de pesos; en w8a8, 6,23 MB.
- GPU recomendadas: no se documenta soporte GPU; el modelo esta optimizado para NPU de Qualcomm (Hexagon) via QNN. En PC con Snapdragon X Elite se ejecuta en NPU.
- Cabe en GPU consumer: no es el caso de uso; el objetivo son SoCs moviles y embebidos. En una RTX 4090 se podria ejecutar via ONNX Runtime en CPU/GPU, pero no es la ruta soportada ni optimizada.
- Opciones de despliegue: ONNX Runtime 1.30.0, QNN (QAIRT 2.51), TensorFlow Lite, y la libreria Qualcomm AI Hub Models para exportacion personalizada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector visual).
- Latencia y throughput: latencias de 0,37 a 2,12 ms por inferencia en NPU de los SoCs listados; a 0,37 ms se superan las 2.700 inferencias por segundo en teoria, aunque el throughput real dependera del pipeline de captura y preprocesado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precision del modelo, por lo que una comparativa cuantitativa con alternativas como YOLOv8n, YOLOv5n o MobileNet-SSD no es posible con la informacion proporcionada. A continuacion se comparan solo los atributos documentados:

| Modelo | Parametros | Entrada | Licencia | Formatos | Optimizado para NPU Qualcomm |
|---|---|---|---|---|---|
| PPE-Detection (Gear Guard Net) | 6,19 M | 320x192 | BSD-3-Clause | ONNX, QNN_DLC, TFLITE | Si (QAIRT 2.51) |
| YOLOv8n | no disponible en esta ficha | no disponible | AGPL-3.0 | PyTorch, ONNX | No de forma nativa |
| YOLOv5n | no disponible en esta ficha | no disponible | GPL-3.0 | PyTorch, ONNX | No de forma nativa |
| MobileNet-SSD | no disponible en esta ficha | no disponible | Apache-2.0 | Caffe, TFLITE | Parcial via TFLITE |

La ventaja diferencial de PPE-Detection es la disponibilidad de artefactos QNN_DLC precompilados y perfilados para una amplia gama de SoCs Qualcomm, algo que las alternativas genericas no ofrecen. La desventaja es la falta de metricas de precision publicas y el sesgo hacia un caso de uso muy concreto (EPI).

## Limitaciones y advertencias

- No se publican metricas de precision (mAP, recall, F1) ni el proceso de validacion, por lo que no es posible evaluar la calidad de deteccion antes de desplegar.
- El dataset de entrenamiento es propietario y no se documenta su composicion, cobertura demografica, condiciones de iluminacion ni variedad de EPI; existe riesgo de sesgo hacia los escenarios representados en dicho dataset.
- El modelo tiene solo dos clases de salida y la model card no especifica cuales son; hay que verificar en la implementacion de referencia antes de usarlo en produccion.
- No se documentan los idiomas ni si el modelo incluye metadatos o etiquetas en algun idioma concreto.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: sin metricas publicadas no se puede acotar; en un contexto de seguridad laboral, un falso negativo (no detectar la ausencia de casco) tiene consecuencias graves.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero el modelo se distribuye "tal cual" y Qualcomm no ofrece garantias; conviene revisar los terminos de QAIRT y de los runtimes de terceros (ONNX Runtime, TensorFlow Lite).
- El modelo esta optimizado para NPU Qualcomm; ejecutarlo en otros hardware (GPU NVIDIA, CPU x86) es posible via ONNX, pero sin las optimizaciones ni las latencias reportadas.
- El repositorio ocupa 2,4 GB por incluir todos los artefactos preexportados; conviene descargar solo la variante necesaria.
- No hay informacion sobre el mantenimiento a largo plazo ni sobre versiones futuras mas alla de la version 0.67.0 de la libreria referenciada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/PPE-Detection
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gear_guard_net
- Repositorio Qualcomm AI Hub Models (Gear Guard Net): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/gear_guard_net
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-onnx-float.zip
- Descarga ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-onnx-w8a16.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-qnn_dlc-float.zip
- Descarga QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-qnn_dlc-w8a16.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-qnn_dlc-w8a8.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-tflite-float.zip
- Descarga TFLITE w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/releases/v0.67.0/gear_guard_net-tflite-w8a8.zip
- Demo visual: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gear_guard_net/web-assets/model_demo.png
