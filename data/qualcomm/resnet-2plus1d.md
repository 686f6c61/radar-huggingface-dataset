# qualcomm/ResNet-2Plus1D

## Resumen

ResNet-2Plus1D es una red neuronal convolucional para clasificacion de video publicada por Qualcomm en HuggingFace dentro de su catalogo de modelos optimizados para dispositivos con hardware Qualcomm. No es un modelo de lenguaje: se trata de un backbone discriminativo de vision que recibe un clip de video y devuelve una etiqueta de accion entre las 400 clases del dataset Kinetics-400. Su arquitectura factoriza la convolucion 3D en una convolucion espacial 2D seguida de una convolucion temporal 1D, enfoque introducido en el paper arXiv:1711.11248 y disponible tambien en la implementacion de referencia de torchvision.

El modelo tiene 31,5 millones de parametros y una entrada fija de 112x112 pixeles. Qualcomm distribuye pesos pre-exportados en varios formatos (ONNX, QNN_DLC para QAIRT y TFLite) tanto en precision float como cuantizados w8a8 (int8 en pesos y activaciones), con tamanos de 120 MB y 30,8 MB respectivamente. El objetivo del repositorio no es entrenar desde cero, sino ofrecer artefactos listos para ejecutar en la NPU de chipsets Snapdragon y Dragonwing.

Su relevancia actual esta en el despliegue en el borde: los tiempos de inferencia medidos por Qualcomm van de 1,959 ms a 20,939 ms segun chipset y precision, con un consumo de memoria muy bajo. Esto lo hace util para clasificacion de acciones en tiempo real en movil, camaras inteligentes y dispositivos IoT industriales sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet con convoluciones (2+1)D (factorizacion de convolucion 3D en 2D espacial + 1D temporal) |
| Parametros totales | 31,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision con entrada fija de clip 112x112 |
| Tipos de cuantizacion | float y w8a8 (int8 en pesos y activaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC (QAIRT), TFLite y pesos PyTorch del repositorio |
| Numero de clases | 400 (checkpoint Kinetics-400) |
| Tamano del modelo | 120 MB en float; 30,8 MB en w8a8 |
| Runtime soportado | ONNX Runtime 1.30.0, QAIRT 2.50 |

## Arquitectura y entrenamiento

La red sigue el diseno ResNet aplicado a video con convoluciones (2+1)D. En lugar de una unica convolucion 3D de tamano 3x3x3, cada bloque separa el calculo en una convolucion espacial 2D de 1x3x3 y una convolucion temporal 1D de 3x1x1 aplicadas de forma sucesiva, con una no linealidad intermedia. Esta factorizacion aumenta el numero de no linealidades de la red, duplica aproximadamente el numero de parametros respecto a una convolucion 3D equivalente en profundidad de capas y facilita la optimizacion, segun el paper de referencia (arXiv:1711.11248). El checkpoint publicado corresponde a un entrenamiento sobre Kinetics-400, un dataset de acciones humanas en video.

Qualcomm no publica en la informacion disponible el numero de tokens o frames de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste fino adicionales. Tampoco se documenta el proceso de cuantizacion mas alla de la indicacion de que los artefactos se compilan y perfilan con Qualcomm AI Hub Workbench. El repositorio de HuggingFace ocupa 8,5 GB porque incluye los distintos assets exportados (ONNX, QNN_DLC y TFLite en float y w8a8), no porque el modelo tenga un tamano elevado.

## Capacidades

- Clasificacion de acciones en video: asigna uno de los 400 labels de Kinetics-400 a un clip de entrada de 112x112.
- Extraccion de caracteristicas (backbone): al ser un modelo etiquetado como backbone, puede usarse como extractor de embeddings espacio-temporales para tareas posteriores.
- Inferencia acelerada en NPU de Qualcomm mediante los formatos QNN_DLC y TFLite exportados.
- Ejecucion en precision float o cuantizada w8a8, con una reduccion de ~4x en el tamano de pesos (120 MB a 30,8 MB).
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de razonamiento, vision-lenguaje ni procesamiento de audio.

## Casos de uso

- Videovigilancia e instalaciones inteligentes: clasificacion de acciones (correr, caerse, forcejear) sobre el flujo de camaras IP directamente en el dispositivo, evitando enviar video a la nube gracias a los tiempos de inferencia de 2 a 20 ms por clip en NPU.
- Analisis deportivo automatico: etiquetado de acciones en grabaciones de partidos o sesiones de entrenamiento para generar indices y estadisticas por tipo de movimiento.
- Aplicaciones de fitness en movil: deteccion del ejercicio realizado (sentadilla, salto, etc.) sobre los 400 conceptos de Kinetics-400 usando ONNX o TFLite en la NPU del telefono.
- Control de calidad industrial: deteccion de acciones anormales o manipulaciones incorrectas en lineas de produccion con camaras conectadas a modulos Dragonwing.
- Seguridad y asistencia en el hogar: deteccion de caidas o situaciones de riesgo en tiempo real en dispositivos de bajo consumo, con huella de memoria inferior a 300 MB.
- Indexado y busqueda de bibliotecas de video: generacion de etiquetas de accion para catalogar grandes volumenes de contenido antes de una busqueda semantica posterior.
- Robotica y drones con Snapdragon: modulo de percepcion de acciones como entrada a un sistema de navegacion o interaccion, al ejecutarse integramente en la NPU.
- Base para tareas downstream: uso como backbone congelado para deteccion temporal de acciones o clasificacion con vocabulario propio tras un ajuste fino de la cabeza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1 o top-5 sobre Kinetics-400) en la informacion disponible. Los unicos datos de rendimiento facilitados por Qualcomm son medidas de latencia y memoria maxima en distintos chipsets.

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| ResNet-2Plus1D | ONNX | float | Snapdragon 8 Elite Gen 5 for Galaxy | 5,812 | 2 - 200 | NPU |
| ResNet-2Plus1D | ONNX | float | Snapdragon 8 Elite for Galaxy | 7,03 | 0 - 195 | NPU |
| ResNet-2Plus1D | ONNX | float | Snapdragon 8 Gen 3 | 9,203 | 0 - 270 | NPU |
| ResNet-2Plus1D | ONNX | float | Snapdragon 8 Gen 1 | 20,939 | 1 - 251 | NPU |
| ResNet-2Plus1D | ONNX | float | Dragonwing IQ-8275 | 23,578 | 2 - 9 | NPU |
| ResNet-2Plus1D | ONNX | w8a8 | Snapdragon 8 Elite Gen 5 for Galaxy | 1,959 | 0 - 178 | NPU |
| ResNet-2Plus1D | ONNX | w8a8 | Snapdragon 8 Elite for Galaxy | 2,572 | 0 - 177 | NPU |
| ResNet-2Plus1D | ONNX | w8a8 | Snapdragon 8 Gen 3 | 3,234 | 0 - 212 | NPU |
| ResNet-2Plus1D | ONNX | w8a8 | Snapdragon 8 Gen 1 | 5,681 | 1 - 212 | NPU |
| ResNet-2Plus1D | ONNX | w8a8 | Dragonwing IQ-8275 | 4,385 | 0 - 4 | NPU |

La cuantizacion w8a8 reduce la latencia aproximadamente a la mitad respecto a float en los chipsets moviles medidos (por ejemplo, 1,959 ms frente a 5,812 ms en Snapdragon 8 Elite Gen 5 for Galaxy). La tabla completa de dispositivos esta en la pagina del modelo en Qualcomm AI Hub.

## Requisitos de hardware

- Pesos en float: 120 MB. Pesos en w8a8: 30,8 MB.
- Memoria pico observada en inferencia: entre 0 y 270 MB segun chipset y precision.
- Cabe holgadamente en cualquier dispositivo movil actual; no requiere GPU dedicada ni VRAM de escritorio.
- Hardware objetivo: NPU de chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite) y plataformas Dragonwing (QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-8750).
- Latencia medida: 1,959 ms (mejor caso, w8a8 sobre Snapdragon 8 Elite Gen 5 for Galaxy) hasta 23,578 ms (float sobre Dragonwing IQ-8275).
- Despliegue mediante QAIRT 2.50 (QNN_DLC), ONNX Runtime 1.30.0, TFLite y PyTorch/Qualcomm AI Hub Models.
- No aplican opciones de servidor de LLM como vLLM, TGI, llama.cpp u Ollama: el modelo no es generativo ni basado en transformers de lenguaje.
- El repositorio de Qualcomm AI Hub Models permite reexportar con pesos personalizados, formas de entrada propias y configuraciones de dispositivo y runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ResNet-2Plus1D (qualcomm/ResNet-2Plus1D) | 31,5 M | 112x112 | BSD-3-Clause | HuggingFace + Qualcomm AI Hub, exportado a ONNX/QNN_DLC/TFLite | Precision float y w8a8; latencias medidas en NPU Qualcomm |
| Implementacion de referencia de torchvision (r2plus1d) | no disponible | 112x112 | BSD-3-Clause | Repositorio de torchvision | Base arquitectonica de la que deriva este modelo; sin artefactos preexportados para NPU |
| I3D (Inflated 3D ConvNet) | no disponible | no disponible | no disponible | Implementaciones de terceros | Alternativa clasica de convolucion 3D; datos de rendimiento no disponibles |
| SlowFast | no disponible | no disponible | no disponible | Implementaciones de terceros | Modelo de dos vias para reconocimiento de acciones; datos de rendimiento no disponibles |
| X3D | no disponible | no disponible | no disponible | Implementaciones de terceros | Familia de bajo coste computacional para video; datos de rendimiento no disponibles |

No se dispone de datos comparativos de precision entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a la disponibilidad de artefactos optimizados para hardware Qualcomm, que es el principal diferenciador de esta publicacion.

## Limitaciones y advertencias

- Modelo discriminativo de vision: no genera texto ni mantiene conversaciones; cualquier expectativa de uso como LLM es incorrecta.
- Vocabulario cerrado de 400 clases (Kinetics-400). Las etiquetas fuera de ese conjunto no se reconocen sin ajuste fino de la cabeza de clasificacion.
- Entrada fija de 112x112. No se documenta en la informacion disponible el numero de frames por clip ni la estrategia de muestreo temporal.
- No se publican metricas de precision (top-1/top-5) ni la perdida de exactitud introducida por la cuantizacion w8a8. Es imprescindible validar ambos aspectos en el caso de uso concreto antes de pasar a produccion.
- Las mediciones de latencia y memoria corresponden a hardware Qualcomm y a configuraciones concretas (QAIRT 2.50, ONNX Runtime 1.30.0); no son extrapolables a otras plataformas.
- Sesgos potenciales heredados de Kinetics-400: predominio de ciertos dominios visuales, desequilibrio entre clases y posible infrarrepresentacion de determinadas actividades o contextos culturales. No se documentan analisis de sesgo.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversa, oclusiones, camaras en movimiento o acciones poco representadas.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion de copyright y sin uso del nombre del titular para respaldar el producto derivado. Conviene revisar las condiciones de los datasets de entrenamiento subyacentes si se redistribuye el modelo.
- El repositorio ocupa 8,5 GB por acumulacion de assets exportados; el modelo en si es pequeno y no requiere ese espacio para una sola variante.
- No se declaran idiomas soportados porque no aplica; la interfaz del modelo es exclusivamente visual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/ResNet-2Plus1D
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/resnet_2plus1d
- Codigo y recetas de exportacion en Qualcomm AI Hub Models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/resnet_2plus1d
- Implementacion de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/video/resnet.py
- Paper de las convoluciones (2+1)D: https://arxiv.org/abs/1711.11248
- Plataforma Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro de cuenta Qualcomm para ejecutar modelos en dispositivo alojado: https://myaccount.qualcomm.com/signup
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion de la empresa en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
