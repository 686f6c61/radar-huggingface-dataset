# Renesas/MobilenetV2-ONNX

## Resumen

Renesas/MobilenetV2-ONNX es el modelo de clasificacion de imagenes MobileNetV2 distribuido por Renesas en formato ONNX FP32, empaquetado especificamente para ejecutarse sobre la NPU NPX6-48K integrada en el SoC Renesas R-Car X5H. El modelo resuelve la tarea de clasificacion de imagenes en 1000 clases de ImageNet (ILSVRC2012) y su proposito es servir como referencia funcional y de rendimiento para el stack de inferencia de Renesas en hardware embebido.

Se trata de una red convolucional ligera basada en convoluciones separables en profundidad, con 3,49 millones de parametros, una entrada fija de 3 x 224 x 224 y salida de 1000 puntuaciones de clase. Los pesos derivan del modelo onnxmodelzoo/mobilenetv2-12 publicado en el ONNX Model Zoo; Renesas unicamente los redistribuye en FP32, dejando que los runtimes propios (ONNX Runtime con Custom NPU Execution Provider y MWMX Runtime) realicen la conversion automatica a INT8 en tiempo de carga.

Su relevancia actual es acotada pero clara: no es un modelo novedoso en terminos de arquitectura, sino una pieza de validacion para desarrolladores que trabajan con el R-Car X5H, ya que aporta cifras de latencia y throughput medidas sobre silicio real (hasta 1.425,1 fps con MWMX) y datos de exactitud tras la conversion a INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2: red convolucional con convoluciones separables en profundidad |
| Parametros totales | 3,49 M (3,5 M segun la model card, contados a partir de los inicializadores de `fp32/mobilenetv2-12.onnx`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 3 x 224 x 224) |
| Tipos de cuantizacion | FP32 (artefacto provisto); INT8 mediante conversion automatica en tiempo de carga por el runtime |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`fp32/mobilenetv2-12.onnx`) |
| Tarea | Clasificacion de imagenes (ImageNet ILSVRC2012, 1000 clases) |
| Modelo de origen | `onnxmodelzoo/mobilenetv2-12` (ONNX Model Zoo v1.12) |
| Hardware objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Runtimes soportados | ONNX Runtime con Renesas NPU Custom Execution Provider; Renesas MWMX Runtime; PPA Estimator (solo estimacion) |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional disenada para ser ligera y adecuada para inferencia en dispositivos con recursos limitados. Se apoya en convoluciones separables en profundidad, que reducen el coste computacional frente a convoluciones estandar, y produce una clasificacion sobre 1000 clases de ImageNet. La model card no detalla la composicion exacta del dataset de entrenamiento mas alla de la referencia a ImageNet ILSVRC2012, ni indica si se aplicaron fases de ajuste fino, destilacion o tecnicas de regularizacion especificas. Tampoco se documenta el numero de tokens o imagenes de entrenamiento, ni el proceso de entrenamiento seguido por el autor original del modelo.

La innovacion relevante de este repositorio no esta en el entrenamiento sino en el flujo de despliegue. El artefacto publicado es un unico fichero ONNX en FP32; tanto ONNX Runtime (con el Execution Provider de NPU de Renesas) como el runtime MWMX lo convierten automaticamente a INT8 durante la carga o compilacion, de modo que no se distribuye ningun fichero cuantizado independiente ni se exige al usuario ejecutar un paso de cuantizacion. La ejecucion final tiene lugar sobre la NPU NPX6-48K del R-Car X5H, con configuracion de benchmark de una NPU, un nucleo de IA, entrada 3 x 224 x 224 y tamano de lote 1.

## Capacidades

- Clasificacion de imagenes sobre las 1000 clases de ImageNet ILSVRC2012, con salida de 1000 puntuaciones por imagen.
- Inferencia acelerada en NPU NPX6-48K del SoC Renesas R-Car X5H, con conversion automatica de FP32 a INT8 en tiempo de carga.
- Compatibilidad con dos runtimes de Renesas: ONNX Runtime con Custom NPU Execution Provider y MWMX Runtime.
- Entrada normalizada de ImageNet con forma fija (1, 3, 224, 224) y tipo float32.
- Rendimiento medido de hasta 1.425,1 fps (0,70 ms de latencia) con MWMX Runtime sobre hardware fisico.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un clasificador de vision, no un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No ofrece modo de pensamiento, vision generativa ni procesamiento de audio; la unica modalidad de entrada es imagen.

## Casos de uso

- Clasificacion de imagenes en sistemas de automocion: el R-Car X5H es un SoC orientado a vehiculo y el modelo permite clasificar fotogramas de camara a mas de 950 fps con MWMX, lo que habilita reconocimiento de escenas y objetos a alta cadencia sin cargar la CPU.
- Inspeccion visual industrial en linea de produccion: con latencias de 0,70 a 2,02 ms por imagen, el modelo puede clasificar piezas a velocidades compatibles con cadenas de fabricacion de alta cadencia, siempre que las clases relevantes esten cubiertas por las 1000 categorias de ImageNet o se reentrene la cabeza de clasificacion.
- Pre-filtrado en pipelines de vision por computador: al ser una red de 3,49 M de parametros, puede actuar como primera etapa que descarte candidatos evidentes antes de invocar modelos de deteccion o segmentacion mas costosos en el mismo SoC.
- Camaras inteligentes y dispositivos de borde: el modelo cabe holgadamente en memoria (aproximadamente 14 MB en FP32 y 3,5 MB en INT8), por lo que es viable en sistemas embebidos con memoria limitada que dispongan de NPU compatible.
- Robotica movil y AGV: clasificacion de escenas o de objetos detectados por la camara de a bordo para alimentar logica de navegacion o de manipulacion, aprovechando la ventana de latencia inferior a 3 ms medida sobre NPU.
- Analitica de retail: conteo y clasificacion de productos o de categorias genericas a partir de imagenes de estanteria, con procesamiento local que evita enviar video a la nube.
- Validacion y ajuste de rendimiento del stack NPU: el repositorio sirve como carga de trabajo de referencia para medir latencia, throughput y exactitud tras la conversion a INT8 en R-Car X5H, comparando ONNX Runtime frente a MWMX y frente a las estimaciones del PPA Estimator.

## Benchmarks y rendimiento

Latencia y throughput medidos y estimados sobre Renesas R-Car X5H (una NPU, un nucleo de IA, entrada 3 x 224 x 224, lote 1):

| Runtime | Precision | Dispositivo | Latencia (ms) | Throughput (fps) | Tipo |
|---|---|---|---|---|---|
| ORT Custom NPU EP | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 2,02 | 495,0 | Medido |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 1,05 | 952,4 | Medido |
| PPA Estimator | INT8 | X5H, 1 NPU, 1 nucleo, 1066 MHz | 1,1 | no disponible | Estimado |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 0,70 | 1.425,1 | Medido (2026-09-16) |

Exactitud sobre el conjunto de validacion de ImageNet ILSVRC2012 (50.000 imagenes):

| Runtime / precision | Top-1 | Top-5 | Notas |
|---|---|---|---|
| FP32 de referencia | 75,1 % | 92,3 % | ORT, ejecucion nativa en FP32 |
| ORT Custom NPU EP (INT8) | 74,0 % | 93,0 % | Conversion automatica a INT8, ejecucion en NPU |
| MWMX Runtime (INT8) | no disponible | no disponible | Aun no medido |

Metodologia declarada: ejecuciones hardware-in-the-loop sobre silicio fisico con NPU a 850 MHz; latencia como mediana de 1000 inferencias consecutivas con cache caliente; throughput calculado como 1000 / latencia_ms. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no aplican a este modelo.

## Requisitos de hardware

- Para la ruta de NPU es obligatorio disponer de una placa Renesas R-Car X5H con NPU NPX6 y del runtime correspondiente (ONNX Runtime con Renesas NPU Custom Execution Provider o el paquete MWMX Runtime).
- VRAM/RAM estimada para los pesos: aproximadamente 14 MB en FP32 (3,49 M de parametros x 4 bytes) y aproximadamente 3,5 MB en INT8, sin contar activaciones ni el coste del runtime.
- Por tamano, cabe sin problema en cualquier GPU de consumo actual e incluso en CPU; la model card no documenta latencias sobre GPU de consumo, por lo que no hay cifras comparables.
- No se especifican GPU recomendadas del tipo A100, H100 o RTX 4090; el modelo esta disenado para la NPU NPX6, no para esos aceleradores.
- Opciones de despliegue documentadas: ONNX Runtime con Custom NPU Execution Provider, MWMX Runtime y PPA Estimator (solo estimacion, no ejecucion sobre silicio).
- Al ser un modelo ONNX estandar, es tecnicamente ejecutable con ONNX Runtime convencional en CPU o GPU, aunque la model card no valida ni documenta esa ruta.
- Latencia y throughput conocidos: 2,02 ms / 495,0 fps (ORT NPU EP), 1,05 ms / 952,4 fps (MWMX) y 0,70 ms / 1.425,1 fps (MWMX, medicion de 2026-09-16); estimacion de 1,1 ms con PPA Estimator a 1066 MHz.
- Requisitos de software adicionales: CLI de HuggingFace para la descarga (`huggingface-cli download Renesas/MobileNetV2-ONNX fp32/mobilenetv2-12.onnx`).

## Comparativa con modelos similares

Los datos de modelos alternativos no constan en la informacion proporcionada; se indica "no disponible" en los campos no documentados.

| Modelo | Parametros | Entrada | Top-1 ImageNet | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| MobileNetV2-ONNX (Renesas) | 3,49 M | 3 x 224 x 224 | 75,1 % FP32 / 74,0 % INT8 en NPU | apache-2.0 | ONNX, HuggingFace |
| onnxmodelzoo/mobilenetv2-12 | mismo modelo de origen | 3 x 224 x 224 | no disponible | no disponible | ONNX Model Zoo |
| MobileNetV3 (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| EfficientNet-B0 | no disponible | no disponible | no disponible | no disponible | no disponible |
| ResNet-50 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas pertinente y con datos verificables es contra el propio modelo de origen del ONNX Model Zoo: se trata de los mismos pesos, pero el repositorio de Renesas anade validacion de ejecucion en NPU, cifras de latencia y exactitud tras la conversion a INT8, y una ruta de despliegue especifica para el SoC R-Car X5H.

## Limitaciones y advertencias

- Modelo cerrado a 1000 clases de ImageNet: no reconoce categorias fuera de ese vocabulario sin reentrenamiento o sustitucion de la cabeza de clasificacion.
- No es un modelo generativo ni de lenguaje; no puede emplearse para texto, codigo, razonamiento, tool calling ni tareas de agente.
- La conversion automatica a INT8 introduce una perdida de exactitud medible: 74,0 % de Top-1 frente a 75,1 % en FP32, es decir, 1,1 puntos porcentuales menos.
- La exactitud del runtime MWMX en INT8 no se ha medido todavia, por lo que no hay garantia documentada de equivalencia con la ruta de ONNX Runtime.
- Requiere hardware Renesas R-Car X5H para la ruta de NPU; fuera de ese entorno las cifras de rendimiento publicadas no son aplicables.
- El benchmark se realizo con lote 1 y entrada fija de 3 x 224 x 224; no se documenta el comportamiento con otros tamanos de lote o resoluciones.
- El modelo hereda los sesgos presentes en ImageNet ILSVRC2012, tanto en la distribucion de clases como en la representacion de personas y contextos.
- Riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de dominio o con condiciones de iluminacion, oclusion o resolucion distintas de las de entrenamiento.
- La licencia apache-2.0 permite uso comercial, pero el repositorio no incluye garantias ni soporte; conviene verificar los terminos del modelo de origen en el ONNX Model Zoo.
- Adopcion practicamente nula en HuggingFace (0 descargas, 0 likes) y repositorio de 0,0 GB, lo que implica comunidad y soporte comunitario limitados.
- No se documenta el conjunto exacto de datos ni el procedimiento de entrenamiento, lo que dificulta auditar el origen y las caracteristicas del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Renesas/MobileNetV2-ONNX
- Modelo de origen: https://huggingface.co/onnxmodelzoo/mobilenetv2-12
- ONNX Model Zoo (repositorio GitHub): https://github.com/onnx/models
- Renesas Electronics (sitio oficial): https://www.renesas.com/
- Renesas Electronics, catalogo de productos: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Renesas Careers: https://jobs.renesas.com/
