# qualcomm/Beit

## Resumen

Beit es un modelo de clasificacion de imagenes basado en la arquitectura BEiT (BERT Pre-Training of Image Transformers), publicado por Qualcomm como parte de su catalogo Qualcomm AI Hub Models. Se trata de un transformer de vision entrenado para clasificar imagenes del dataset ImageNet y tambien utilizable como backbone para tareas de vision mas complejas. El repositorio no contiene un modelo entrenado por Qualcomm desde cero, sino una exportacion optimizada del modelo BEiT de referencia (implementacion de microsoft/unilm) para ejecutarse en dispositivos con aceleracion NPU de Qualcomm.

El modelo cuenta con aproximadamente 92 millones de parametros, procesa entradas de 224x224 pixeles y ocupa 351 MB en precision float. Qualcomm lo distribuye en varios formatos listos para despliegue (ONNX, QNN_DLC y TFLite) con dos niveles de precision (float y cuantizacion w8a16), de modo que pueda integrarse en moviles, portatiles y plataformas embebidas con chipsets Snapdragon y Dragonwing.

Su relevancia actual reside en que es un ejemplo de modelo de vision optimizado de extremo a extremo para inferencia en el borde (edge), con tiempos de inferencia medidos entre 2 y 18 ms sobre NPU segun chipset y precision, y con licencia BSD-3-Clause permisiva. No es un modelo generativo ni de lenguaje: es un clasificador de imagenes de proposito especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (BEiT, basado en ViT) |
| Parametros totales | 92,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no procesa secuencias de texto; entrada fija de imagen 224x224) |
| Tipos de cuantizacion | float, w8a16 |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE |
| Resolucion de entrada | 224x224 |
| Checkpoint | ImageNet |
| Tamano del modelo (float) | 351 MB |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

BEiT es un transformer de vision (Vision Transformer, ViT) que adapta el esquema de preentrenamiento enmascarado de BERT al dominio de la imagen. La idea central del paper original (arXiv:2106.08254) es enmascarar parches de la imagen y predecir tokens visuales discretos (obtenidos mediante un tokenizador dVAE), en lugar de predecir pixeles. Este modelo concreto esta basado en la implementacion oficial de BEiT del repositorio microsoft/unilm y ha sido entrenado/ajustado sobre el dataset ImageNet para clasificacion, con una cabeza de clasificacion sobre el token CLS.

Qualcomm no aporta en la informacion disponible detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset mas alla de ImageNet, ni si se aplicaron tecnicas de ajuste fino adicionales (RLHF, DPO u otras). La contribucion de Qualcomm es la adaptacion del modelo a hardware: exportacion a ONNX, QNN_DLC y TFLite, compilacion y perfilado mediante Qualcomm AI Hub Workbench, y generacion de artefactos optimizados para la NPU de sus chipsets, incluyendo una variante cuantizada w8a16.

## Capacidades

- Clasificacion de imagenes: asigna una clase del conjunto ImageNet a una imagen de entrada de 224x224.
- Uso como backbone: puede servir como extractor de caracteristicas para modelos de vision de mayor complejidad (deteccion, segmentacion u otras cabezas especificas).
- Inferencia acelerada en NPU: pensado para ejecucion local en dispositivos Qualcomm (Snapdragon, Dragonwing) con bajo consumo.
- Ejecucion en el borde (on-device): no requiere conexion a la nube ni GPU de servidor.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica (no procesa texto).
- Capacidades especiales (thinking mode, vision, audio): unicamente vision, limitada a clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles: el modelo puede etiquetar fotos directamente en el dispositivo con latencias de 2 a 18 ms sobre NPU, evitando enviar datos a la nube y mejorando la privacidad.
- Preprocesado en pipelines de camara: filtrado o categorizacion rapida de fotogramas antes de tareas de vision mas costosas, aprovechando su bajo coste computacional.
- Control de calidad industrial embebido: clasificacion de productos sobre imagenes capturadas por camaras conectadas a plataformas Dragonwing o Snapdragon en linea de produccion.
- Backbone para modelos personalizados: partiendo de la variante pre-exportada o reexportando con pesos ajustados, se puede usar como base de clasificadores especificos de dominio (por ejemplo, diagnostico visual o reconocimiento de objetos propietarios).
- Clasificacion en dispositivos IoT: etiquetado de imagenes en hardware de bajo consumo con NPU (Qualcomm QCS o Dragonwing), donde no es viable una GPU.
- Moderacion de contenido visual on-device: deteccion de categorias de imagen en el propio terminal para filtrar contenido antes de subirlo o procesarlo.
- Prototipado con Qualcomm AI Hub: servir como modelo de referencia para validar el flujo de exportacion, compilacion y despliegue en dispositivos Qualcomm antes de pasar a modelos mas grandes.
- Extraccion de embeddings para busqueda visual: uso del backbone para generar representaciones de imagen reutilizables en sistemas de recuperacion, si se adapta la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de exactitud top-1 sobre ImageNet). Lo que si se aporta son metricas de rendimiento de inferencia medidas sobre NPU por chipset.

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 7,498 | 1 - 307 | NPU |
| ONNX | float | Snapdragon 8 Elite for Galaxy Mobile | 8,485 | 0 - 299 | NPU |
| ONNX | float | Snapdragon X2 Elite | 7,379 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 15,29 | 184 - 184 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 10,605 | 1 - 445 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 14,066 | 1 - 415 | NPU |
| ONNX | w8a16 | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 2,293 | 0 - 212 | NPU |
| ONNX | w8a16 | Snapdragon 8 Elite for Galaxy Mobile | 3,919 | 0 - 309 | NPU |
| ONNX | w8a16 | Snapdragon X2 Elite | 2,559 | 1 - 1 | NPU |
| ONNX | w8a16 | Snapdragon X Elite | 6,669 | 96 - 96 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 4,566 | 0 - 417 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 7,421 | 0 - 299 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite for Galaxy Mobile | 8,457 | 1 - 294 | NPU |

La cuantizacion w8a16 reduce el tiempo de inferencia aproximadamente a la mitad respecto a float en los chipsets mas recientes (por ejemplo, 2,293 ms frente a 7,498 ms en Snapdragon 8 Elite Gen 5). La tabla completa de medidas por dispositivo esta disponible en Qualcomm AI Hub.

## Requisitos de hardware

- Memoria para pesos: 351 MB en precision float; la variante w8a16 reduce considerablemente este valor (la memoria pico registrada por inferencia oscila entre decenas y cientos de MB segun chipset).
- GPU recomendadas: no aplica como requisito; el modelo esta optimizado para NPU de Qualcomm (Hexagon). Puede ejecutarse en CPU o GPU generica a traves de ONNX Runtime o PyTorch, pero sin las optimizaciones de NPU.
- Compatibilidad con GPU de consumo: si cabe en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) dado su tamano de 0,35 GB, si bien el objetivo del artefacto es el despliegue en el borde.
- Chipsets soportados: Snapdragon 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, 7 Gen 4, X2 Elite, X Elite; Qualcomm Dragonwing QCS6490, QCS8550, QCS8450, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750.
- Opciones de despliegue: Qualcomm QAIRT SDK 2.50, ONNX Runtime 1.30.0, QNN_DLC, TensorFlow Lite, Qualcomm AI Hub Workbench; exportacion personalizada mediante la libreria qai_hub_models.
- Frameworks de servicio de LLM: no aplican (vLLM, llama.cpp, Ollama, TGI estan orientados a modelos generativos de lenguaje; este modelo no es de ese tipo).
- Latencia y throughput estimados: entre 2,293 ms y 62,269 ms por inferencia segun chipset, runtime y precision (ver tabla de rendimiento). No se dispone de cifras de throughput por lote.

## Comparativa con modelos similares

Beit compite en la categoria de clasificadores de imagen ligeros para despliegue en el borde. La informacion disponible no incluye metricas de exactitud para establecer comparaciones de calidad, por lo que muchos campos quedan como no disponibles.

| Modelo | Parametros | Resolucion de entrada | Contexto/secuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qualcomm Beit | 92,0 M | 224x224 | entrada fija de imagen | BSD-3-Clause | HuggingFace + Qualcomm AI Hub |
| ViT-Base (referencia general) | ~86 M | 224x224 | parches de imagen | Apache-2.0 (segun implementacion) | amplia en HuggingFace |
| EfficientNet-B0 (referencia general) | ~5,3 M | 224x224 | no aplica (CNN) | Apache-2.0 (referencia) | amplia |
| MobileNetV3-Large (referencia general) | ~5,4 M | 224x224 | no aplica (CNN) | Apache-2.0 (referencia) | amplia |

Nota: los valores de modelos alternativos son referencias generales de la literatura y no se han verificado contra la informacion proporcionada en esta ficha; los datos de exactitud comparada no estan disponibles. Si se requiere una comparacion rigurosa de calidad, debe consultarse la documentacion de cada modelo.

## Limitaciones y advertencias

- Modelo de proposito especifico: solo realiza clasificacion de imagenes (o extraccion de caracteristicas como backbone); no genera texto ni mantiene conversaciones.
- Sesgos conocidos: al estar ajustado sobre ImageNet, hereda los sesgos de ese dataset en cuanto a clases, representacion geografica y cultural; no se documentan analisis de sesgo especificos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero puede producir clasificaciones erroneas o poco fiables con alta confianza en imagenes fuera de la distribucion de ImageNet.
- Limitaciones de contexto e idioma: la entrada es una imagen fija de 224x224; no procesa texto ni admite entradas variables. Las imagenes deben redimensionarse o adaptarse a ese formato.
- Restricciones de licencia: BSD-3-Clause es permisiva y permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad. No obstante, conviene verificar las condiciones de los artefactos precompilados y del modelo BEiT original de Microsoft.
- Dependencia de hardware Qualcomm: los artefactos QNN_DLC estan optimizados para NPU de Qualcomm; en otras plataformas habra que recurrir a ONNX o TFLite y se perdera parte del rendimiento.
- Trazabilidad limitada: la model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de ImageNet ni el proceso de ajuste, lo que dificulta auditar el modelo.
- Adopcion reducida: el repositorio registra 18 descargas y 0 likes en el momento de la consulta, por lo que el soporte de la comunidad es escaso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Beit
- Beit en Qualcomm AI Hub: https://aihub.qualcomm.com/models/beit
- Repositorio Qualcomm AI Hub Models (Beit): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/beit
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Paper BEiT (arXiv:2106.08254): https://arxiv.org/abs/2106.08254
- Implementacion de referencia BEiT (microsoft/unilm): https://github.com/microsoft/unilm/tree/master/beit
- Demo (imagen): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/beit/web-assets/model_demo.png
- Artefactos pre-exportados (ONNX float): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/beit/releases/v0.64.0/beit-onnx-float.zip
- Artefactos pre-exportados (ONNX w8a16): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/beit/releases/v0.64.0/beit-onnx-w8a16.zip
- Artefactos pre-exportados (QNN_DLC float): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/beit/releases/v0.64.0/beit-qnn_dlc-float.zip
- Artefactos pre-exportados (TFLITE float): https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/beit/releases/v0.64.0/beit-tflite-float.zip
- Registro en Qualcomm (sign up): https://myaccount.qualcomm.com/signup
- Web corporativa de Qualcomm: https://www.qualcomm.com/
