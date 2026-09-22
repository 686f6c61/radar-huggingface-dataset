# Renesas/ResNet50-ONNX

## Resumen

ResNet50-ONNX es un paquete de despliegue publicado por Renesas que contiene la red convolucional ResNet50 V1 en formato ONNX FP32, derivada del modelo `onnxmodelzoo/resnet50-v1-12` del ONNX Model Zoo. El repositorio no aporta pesos nuevos: su valor esta en la integracion con la plataforma Renesas R-Car X5H y su NPU NPX6, para la que se documentan latencias y precision medidas sobre silicio real. Resuelve el problema de llevar un clasificador de imagenes estandar a un acelerador embebido sin pasar por un proceso manual de cuantizacion.

El modelo tiene 25,63 millones de parametros, una unica entrada fija de 3 x 224 x 224 pixeles y una salida de 1000 clases correspondientes al conjunto ImageNet ILSVRC2012. El artefacto publicado es unicamente FP32 ONNX; tanto ONNX Runtime con el Execution Provider NPU de Renesas como el runtime MWMX convierten el modelo a INT8 automaticamente en tiempo de carga o compilacion, de modo que no se distribuye un fichero cuantizado aparte.

Su relevancia actual es acotada y muy especifica: es una referencia de rendimiento y precision para quien integre vision por computador en la NPU NPX6-48K de la R-Car X5H, no un modelo de proposito general. Con 0 descargas y 0 likes en el momento de la consulta, se trata de material de soporte al ecosistema de hardware de Renesas mas que de un modelo destinado a la comunidad de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet50 v1, 50 capas con bloques bottleneck y conexiones residuales) |
| Parametros totales | 25,63 M (contados a partir de los inicializadores de `fp32/resnet50_v1_12.onnx`) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No aplica: entrada de imagen fija de 3 x 224 x 224 pixeles |
| Tipos de cuantizacion | FP32 (artefacto distribuido); INT8 con auto-cast en tiempo de carga por el runtime (ONNX Runtime NPU EP) o en compilacion por la toolchain MWMX. No se publica fichero cuantizado separado |
| Idiomas soportados | No aplica: clasificacion de imagenes, sin componente textual |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |
| Tarea | Clasificacion de imagenes, 1000 clases (ImageNet ILSVRC2012) |
| Entrada | Tensor `data`, forma (1, 3, 224, 224), dtype float32, normalizado estilo ImageNet |
| Salida | Tensor de puntuaciones de forma (1, 1000) |
| Modelo base | onnxmodelzoo/resnet50-v1-12 (ONNX Model Zoo, `resnet50-v1-12`) |
| Hardware objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-06-30 / 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es la ResNet50 v1 clasica de He et al. (2015): una red convolucional de 50 capas organizada en cuatro etapas de bloques residuales tipo bottleneck (1x1, 3x3, 1x1), con normalizacion por lotes, activaciones ReLU y un cabezal de clasificacion con pooling global y capa densa de 1000 salidas. El modelo no introduce modificaciones arquitectonicas respecto al original: la aportacion del repositorio esta en el empaquetado y en la integracion con la NPU, no en el diseno de la red.

No se documentan en la informacion disponible detalles del entrenamiento (numero de tokens o imagenes, composicion exacta del dataset, si hubo ajuste fino, RLHF o DPO), mas alla de que el modelo base del ONNX Model Zoo esta entrenado sobre ImageNet ILSVRC2012 para las 1000 clases estandar. Al tratarse de un modelo de vision, no hay fases de alineacion tipo RLHF/DPO. El repositorio solo adjunta el artefacto FP32; no incluye informacion sobre datasets de calibracion para el paso a INT8, que queda delegado al runtime.

La innovacion tecnica destacable del paquete es el flujo de despliegue: el runtime recibe el ONNX FP32 y realiza el auto-cast a INT8 internamente, eliminando un paso de cuantizacion manual en el flujo del desarrollador. Se documentan dos rutas de ejecucion (ONNX Runtime con Execution Provider NPU personalizado de Renesas y el runtime nativo MWMX) mas una herramienta de estimacion software (PPA Estimator) que proyecta el rendimiento a partir de las caracteristicas del modelo y la configuracion de hardware.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet ILSVRC2012, con salida softmax de Top-1 y Top-5.
- Inferencia sobre NPU NPX6-48K con precision INT8 derivada automaticamente del modelo FP32.
- Ejecucion con lote 1 y entrada fija de 3 x 224 x 224; no se documenta soporte de formas dinamicas ni de otros tamaños de entrada.
- Uso como extractor de caracteristicas o backbone convolucional para tareas posteriores (ajuste fino en clasificacion, deteccion o segmentacion), aunque el repositorio no proporciona cabezales alternativos.
- Despliegue en dos runtimes documentados: ONNX Runtime con Custom NPU Execution Provider y Renesas MWMX Runtime, mas estimacion con PPA Estimator.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision-lenguaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingue por naturaleza: no procesa ni genera lenguaje.
- No hay modo thinking, audio, video ni capacidades multimodales mas alla de la clasificacion de imagen estatica.
- No se documentan capacidades de deteccion de objetos, localizacion, segmentacion ni etiquetado multi-etiqueta.

## Casos de uso

- Clasificacion de imagenes embarcada en automocion: la R-Car X5H es una plataforma de computo para automocion y sistemas empotrados, y este modelo ofrece 243,9 a 303,0 fps por NPU a 850 MHz, lo que permite clasificar fotogramas de camara en tiempo real dentro del presupuesto termico y energetico del vehiculo.
- Multiples flujos de video por NPU: a 303 fps medidos, una sola NPU puede sostener teoricamente en torno a diez flujos simultaneos a 30 fps con lote 1 (estimacion derivada del throughput publicado); util en sistemas de conteo, clasificacion de escenas o filtrado previo al envio por red.
- Inspeccion visual en linea de produccion: con latencias de 3,23 a 4,54 ms por inferencia, el modelo puede clasificar cada pieza en cintas de alta cadencia, descartando unidades defectuosas por categoria y alimentando estadisticas de calidad en tiempo real.
- Autoetiquetado de datasets de imagen: el modelo puede preclasificar grandes volumenes de imagenes con las 1000 categorias de ImageNet y dejar solo la revision humana de los casos de baja confianza, reduciendo el coste de anotacion en proyectos de vision.
- Backbone preentrenado para ajuste fino: al ser un ONNX del ResNet50 v1 estandar con pesos ImageNet, sirve como punto de partida congelado para tareas downstream con pocos datos etiquetados, extrayendo caracteristicas antes de la capa densa final.
- Filtrado y moderacion de contenido en pipelines de subida: clasificacion rapida de imagenes entrantes para enrutar categorias antes de un segundo modelo mas costoso, ejecutandose en hardware de borde sin GPU dedicada.
- Analitica de retail en el borde: clasificacion de productos o categorias visuales en camaras de tienda con inferencia local en la NPU, evitando enviar video a la nube por motivos de privacidad y ancho de banda.
- Robotica movil y dispositivos con restricciones de energia: al ejecutarse en la NPU de un SoC y no en una GPU, el modelo es adecuado para plataformas donde el consumo y el espacio son limitantes, con la precision INT8 como contrapartida.

## Benchmarks y rendimiento

Configuracion declarada: una NPU, un nucleo de IA, entrada 3 x 224 x 224, lote 1. La latencia es la mediana de 1000 inferencias consecutivas con cache caliente; el throughput se calcula como 1000 / latencia_ms.

| Runtime | Precision | Dispositivo | Latencia (ms) | Throughput (fps) | Tipo |
|---|---|---|---|---|---|
| ORT Custom NPU EP | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 4,54 | 243,9 | Medido |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 3,23 | 303,0 | Medido |
| PPA Estimator | INT8 | X5H, 1 NPU, 1 nucleo, 1066 MHz | 5,9 | No disponible | Estimado |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 3,36 | 297,4 | Medido (2026-09-16) |

Precision sobre el conjunto de validacion de ImageNet ILSVRC2012 (50 000 imagenes):

| Runtime / precision | Top-1 | Top-5 | Notas |
|---|---|---|---|
| FP32 de referencia | 81,3 % | 93,9 % | ORT, ejecucion FP32 nativa |
| ORT Custom NPU EP (INT8) | 73,0 % | 94,0 % | Auto-cast a INT8, ejecucion en NPU |
| MWMX Runtime (INT8) | No disponible | No disponible | Aun no medido |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible, ya que no son aplicables a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada: para FP32, 25,63 M de parametros equivalen a unos 102,5 MB de pesos; en INT8, unos 25,6 MB. A lote 1 y 224 x 224 las activaciones son pequenas, por lo que el modelo cabe holgadamente en cualquier memoria de dispositivo actual (estimacion derivada del recuento de parametros, no publicada por el autor).
- Hardware de referencia: Renesas R-Car X5H con NPU NPX6-48K, una NPU y un nucleo de IA. Los resultados medidos se tomaron a 850 MHz y la estimacion a 1066 MHz.
- GPU dedicadas tipo A100, H100 o RTX 4090: no disponible. El autor no publica cifras para esas plataformas y el modelo esta orientado a la NPU de Renesas, no a GPU de centro de datos.
- GPU de consumo: no disponible. No hay mediciones publicadas para tarjetas consumer; en teoria el ONNX podria ejecutarse con ONNX Runtime sobre CUDA o CPU, pero sin datos de latencia ni precision.
- Opciones de despliegue documentadas: ONNX Runtime con Renesas Custom NPU Execution Provider (formato de entrada FP32 ONNX, ejecucion INT8 en la NPU) y Renesas MWMX Runtime (el modelo FP32 se ingiere y compila con la toolchain MWMX para ejecucion INT8). Tambien se menciona el PPA Estimator como herramienta de estimacion, no de ejecucion.
- Alternativa de respaldo: el Execution Provider de CPU de ONNX Runtime aparece como proveedor secundario en el ejemplo de codigo, sin cifras de rendimiento asociadas.
- Latencia y throughput: 3,23 ms / 303,0 fps con MWMX a 850 MHz; 4,54 ms / 243,9 fps con ORT Custom NPU EP a 850 MHz; 5,9 ms estimados con PPA Estimator a 1066 MHz. El usuario debe aportar la placa R-Car X5H, el runtime correspondiente y la CLI de HuggingFace para descargar el modelo.

## Comparativa con modelos similares

Comparativa orientativa con alternativas de la misma categoria (clasificacion de imagen en el borde). Los datos de los modelos alternativos no forman parte de la informacion proporcionada en esta ficha y se marcan como no disponibles cuando no procede citarlos.

| Modelo | Parametros | Entrada | Top-1 ImageNet | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Renesas/ResNet50-ONNX | 25,63 M | 3 x 224 x 224 fija | 81,3 % (FP32) / 73,0 % (INT8 en NPU) | Apache 2.0 | ONNX FP32, NPU NPX6 / MWMX |
| ResNet-50 (torchvision) | 25,6 M (misma arquitectura) | 3 x 224 x 224 | No disponible en la informacion proporcionada | BSD-3-Clause | PyTorch, GPU/CPU |
| EfficientNet-B0 | No disponible en la informacion proporcionada | 3 x 224 x 224 | No disponible en la informacion proporcionada | Apache 2.0 | PyTorch / ONNX |
| MobileNetV3-Large | No disponible en la informacion proporcionada | 3 x 224 x 224 | No disponible en la informacion proporcionada | Apache 2.0 | PyTorch / TFLite / ONNX |

Diferencias relevantes que si se desprenden de la documentacion: este paquete es el unico de la tabla que publica latencia y throughput medidos sobre silicio (R-Car X5H) y el unico que delega la cuantizacion a INT8 en el runtime, a costa de depender de hardware y runtimes propietarios de Renesas. Las alternativas de la tabla son ejecutables en GPU de proposito general y CPU, pero no ofrecen datos de rendimiento para la NPU NPX6.

## Limitaciones y advertencias

- Perdida de precision con INT8: el Top-1 cae de 81,3 % en FP32 a 73,0 % con el auto-cast a INT8 en ORT sobre NPU, una degradacion de 8,3 puntos. Es una caida notable que debe validarse contra el caso de uso concreto antes de desplegar en produccion.
- El Top-5 apenas varia (93,9 % FP32 frente a 94,0 % INT8) mientras el Top-1 se desploma, un patron que sugiere problemas de calibracion o de ranking en la primera posicion. Conviene auditar la distribucion de errores, no solo las metricas agregadas.
- La precision del runtime MWMX en INT8 no estaba medida en el momento de publicar la informacion, pese a ser la ruta mas rapida (3,23 ms). No hay garantia de que su comportamiento en precision sea equivalente al de ORT.
- Solo se distribuye el artefacto FP32 ONNX. Cualquier INT8 es el resultado de un auto-cast del runtime, por lo que la precision en plataformas distintas a las documentadas no esta garantizada ni medida.
- No se documenta la calibracion de la cuantizacion (dataset, metodo, numero de muestras), lo que dificulta reproducir o corregir la degradacion de Top-1.
- Entrada fija de 3 x 224 x 224 y lote 1: no se documentan formas dinamicas, resoluciones alternativas ni optimizaciones para lotes mayores.
- Cobertura limitada a 1000 clases de ImageNet ILSVRC2012: no hace clasificacion abierta, deteccion, localizacion, segmentacion ni etiquetado multi-etiqueta.
- Arquitectura de 2015: ResNet50 v1 ha sido superada en eficiencia y precision por familias posteriores (EfficientNet, ConvNeXt, vision transformers). Su eleccion se justifica por soporte y madurez en la NPU, no por ser el estado del arte.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en clases visualmente similares o fuera de dominio.
- Sesgos: no se documenta analisis alguno de sesgos. Los modelos entrenados sobre ImageNet heredan los desequilibrios de ese dataset y su tratamiento desigual de determinadas categorias, incluidas las que representan personas.
- Detalles de preprocesado incompletos: la model card indica "imagen normalizada estilo ImageNet" y dtype float32, pero no especifica el orden de canales (RGB o BGR) ni la media y desviacion exactas, algo critico para reproducir las cifras de precision publicadas.
- Dependencia de hardware y software propietarios: las cifras reportadas exigen una placa R-Car X5H con NPU NPX6 y los runtimes de Renesas. No hay datos de rendimiento en GPU o CPU de proposito general.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero la licencia del modelo base `onnxmodelzoo/resnet50-v1-12` no se explicita en la informacion disponible; conviene verificarla antes de un despliegue comercial.
- Validacion de la comunidad practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que limita el contraste independiente de los resultados.
- Erratas en la documentacion oficial: el ejemplo de codigo de la model card nombra el proveedor como `ReneasNPUExecutionProvider`, con una errata en "Renesas". Es probable que no coincida con el nombre real del Execution Provider y haya que consultar la documentacion del runtime.
- Fechas del repositorio y de las mediciones (2026) deben confirmarse contra el estado real del repositorio antes de citarlas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Renesas/ResNet50-ONNX
- Modelo base en HuggingFace: https://huggingface.co/onnxmodelzoo/resnet50-v1-12
- Repositorio del ONNX Model Zoo: https://github.com/onnx/models
- Sitio de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Empleo en Renesas: https://jobs.renesas.com/
