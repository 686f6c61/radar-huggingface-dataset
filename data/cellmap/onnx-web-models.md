# cellmap/onnx-web-models

## Resumen

CellMap ONNX web models es una colección de seis redes neuronales convolucionales 3D tipo U-Net de pequeño tamaño, desarrolladas por el proyecto cellmap y distribuidas en formato ONNX para segmentación de orgánulos en imágenes de microscopía electrónica de barrido con haz de iones focalizado (FIB-SEM). Los modelos cubren tres dianas biológicas concretas: mitocondrias (representadas mediante mapas de afinidad direccional mito_aff_z, mito_aff_y y mito_aff_x), núcleos (nuc) y retículo endoplasmático (er). El objetivo es ejecutar la segmentación directamente en el navegador mediante onnxruntime-web y WebGPU, sin necesidad de enviar los volúmenes de imagen a un servidor.

El repositorio incluye dos arquitecturas base: ResUNet3DValid (10,7 millones de parámetros) y Unet3dIso (5,6 millones de parámetros), con checkpoints que van desde los 20.000 hasta los 340.000 pasos de entrenamiento y valores de F1 de validación entre 0,645 y 0,958 según la tarea. Cada modelo se ofrece en cuatro variantes de compresión (fp32, fp16, int8w e int8w_fp16) y en dos disposiciones de grafo funcionalmente equivalentes: una con convoluciones Conv3d nativas y otra en la que cada Conv3d se ha reescrito como Conv2d sobre un lote plegado en profundidad, lo que acelera la inferencia en WebGPU aproximadamente 16 veces.

La relevancia actual del paquete radica en que demuestra que la segmentación volumétrica de orgánulos, tradicionalmente dependiente de GPU de servidor, puede ejecutarse de forma interactiva en el propio cliente con una pérdida de precisión prácticamente nula (0,0 % de voxels con decisión de umbral distinta respecto a fp32 en las pruebas publicadas). Todo el material se distribuye con la librería onnx, ocupa 2,9 GB en el repositorio y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes U-Net 3D con convoluciones válidas; dos variantes: ResUNet3DValid y Unet3dIso |
| Parametros totales | 5,6 M (Unet3dIso: setup_53, setup_55) y 10,7 M (ResUNet3DValid: setup_54, setup_56, setup_61, setup_67) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (bloque de entrada fijo por fichero, _in\<N\> = N³ voxels) |
| Tipos de cuantizacion | fp32, fp16, int8w (int8 por canal en pesos, desquantizados al cargar), int8w_fp16 |
| Idiomas soportados | no aplicable (modelo de segmentación de imágenes, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (variantes fp32, fp16, int8w, int8w_fp16) |

## Arquitectura y entrenamiento

Los modelos son U-Nets tridimensionales con convoluciones válidas (sin padding), de modo que la salida resulta en N−88 voxels por eje para un bloque de entrada de N³. La entrada de cada fichero es un tensor float32 de forma [1, 1, z, y, x] y la salida son logits en crudo float32 de forma [1, C, z', y', x'], a los que hay que aplicar sigmoid o bien umbralizar en 0. La normalización de entrada es uint8/255*2−1, definida en la model card como MinMaxNormalizer (min_value 0, max_value 255) seguido de LambdaNormalizer (2*x−1). Existen dos familias de arquitectura: ResUNet3DValid, con conexiones residuales, y Unet3dIso, isótropa en cuanto a resolución de trabajo. Los checkpoints indicados cubren 20.000, 200.000, 260.000, 330.000, 340.000 y 350.000 pasos según el setup.

La innovación técnica principal está en las reescrituras de grafo orientadas a WebGPU, verificadas contra el modelo original de PyTorch y con matemáticas y pesos idénticos. La primera reescribe cada Conv3d como una suma de Conv2d, una por cada tap de profundidad, sobre el volumen reorganizado a [depth, C, H, W]; como onnxruntime-web ejecuta las Conv3d con un shader WebGPU sin optimizar pero las Conv2d con kernels de matmul ajustados, el resultado es aproximadamente 16 veces más rápido (en setup_54, bloque de 148³ sobre GPU Apple M-series: de 20,9 s a 1,3 s). La segunda sustituye la ConvTranspose 3D de los decodificadores de Unet3dIso por una convolución 1×1×1 más una operación depth-to-space, porque el execution provider de WebGPU no dispone de ConvTranspose 3D. La model card no detalla la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de ajuste como RLHF o DPO, algo esperable por tratarse de un problema de segmentación supervisada.

## Capacidades

- Segmentación de mitocondrias en volúmenes FIB-SEM mediante predicción de mapas de afinidad direccional (mito_aff_z, mito_aff_y, mito_aff_x) a vóxel de 16 nm.
- Segmentación de núcleos celulares a vóxel de 128 nm (setup_55 y setup_56) y a vóxel de 256 nm (setup_61).
- Segmentación de retículo endoplasmático a vóxel de 8 nm (setup_67).
- Inferencia en navegador con onnxruntime-web, con soporte de WebGPU y respaldo WASM (CPU) para las variantes fp32 e int8w.
- Ejecución en runtime nativo con las variantes conv3d/setup_XX para onnxruntime CUDA/CPU y TensorRT.
- Salida de logits en crudo que permite al usuario aplicar sigmoid o umbralizar en 0 según su flujo de posprocesado.
- Cuatro niveles de compresión que permiten ajustar el equilibrio entre tamaño de descarga, memoria de activaciones y precisión.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Segmentación interactiva en el navegador para biólogos e investigadores: el cliente serverless cellmap-flow carga los volúmenes OpenOrganelle y ejecuta la inferencia en WebGPU sin subir datos a un servidor, gracias a la reescritura Conv3d→Conv2d que reduce el tiempo por bloque a poco más de un segundo en GPU Apple M-series.
- Anotación asistida en pipelines de reconstrucción de tejido: los mapas de afinidad de mitocondrias (val F1 de 0,958 en setup_54) permiten preetiquetar volúmenes antes de la revisión manual, reduciendo el coste de anotación de secciones de hígado o músculo.
- Análisis morfométrico de mitocondrias en estudios de metabolismo: la salida direccional mito_aff_z/y/x facilita la separación de instancias y el cálculo de volúmenes y elongaciones celda a celda.
- Cuantificación de núcleos en cribados de imagen de alto rendimiento: setup_56 a vóxel de 128 nm ofrece F1 de 0,765 con solo 10,7 M de parámetros, adecuado para conteo y caracterización de núcleos en grandes series de FIB-SEM.
- Trazado del retículo endoplasmático en estudios de tráfico vesicular: setup_67 a 8 nm de vóxel (F1 0,806) permite reconstruir una red tubular fina que otras aproximaciones de menor resolución no resuelven.
- Despliegue edge o en portátiles sin GPU dedicada: las variantes int8w y fp32 funcionan en WASM, lo que permite ejecutar segmentación en máquinas sin WebGPU a cambio de mayor latencia.
- Integración en visores web de microscopía: al devolver logits en formato estándar ONNX, los resultados pueden conectarse a capas de visualización volumétrica existentes sin adaptadores específicos.
- Procesamiento por lotes en servidores con TensorRT u onnxruntime CUDA usando las variantes conv3d/setup_XX, que aprovechan las convoluciones 3D nativas de esos runtimes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La columna «vs PyTorch» es la máxima diferencia absoluta muestreada frente al modelo original; «flip % vs fp32» es el porcentaje de voxels cuya decisión con logit > 0 difiere de la variante fp32 en WebGPU. Medido en Chrome 154 sobre macOS, GPU Apple (WebGPU metal-3) y onnxruntime-web 1.27.0-dev.20260506, mejor de 3 ejecuciones tras un calentamiento, sobre datos reales de EM (jrc_mus-liver, OpenOrganelle).

| Modelo | Bloque | Variante | ms / bloque | Voxels de salida / s | Max abs vs PyTorch | Flip % vs fp32 |
|---|---|---|---|---|---|---|
| setup_54 | 148³ | fp32 | 1203 | 179.551 | 0,001 | — |
| setup_54 | 148³ | fp16 | 905 | 238.674 | 0,082 | 0,0 |
| setup_54 | 148³ | int8w | 1216 | 177.632 | 0,106 | 0,0 |
| setup_54 | 148³ | int8w_fp16 | 879 | 245.734 | 0,153 | 0,0 |
| setup_54 | 132³ | fp32 | 796 | 107.015 | 0,0 | — |
| setup_54 | 132³ | fp16 | 573 | 148.663 | 0,072 | 0,0 |
| setup_54 | 132³ | int8w | 1096 | 77.723 | 0,096 | 0,0 |
| setup_54 | 132³ | int8w_fp16 | 558 | 152.659 | 0,09 | 0,0 |
| setup_54 | 116³ | fp32 | 516 | 42.543 | 0,001 | — |
| setup_54 | 116³ | fp16 | 323 | 67.963 | 0,048 | 0,0 |
| setup_54 | 116³ | int8w | 531 | 41.341 | 0,103 | 0,0 |
| setup_54 | 116³ | int8w_fp16 | 328 | 66.927 | 0,101 | 0,0 |
| setup_53 | 172³ | fp32 | 1137 | 521.288 | 0,001 | — |
| setup_53 | 172³ | fp16 | 741 | 799.870 | 0,071 | 0,0 |
| setup_53 | 172³ | int8w | 1013 | 585.098 | 0,208 | 0,0 |
| setup_53 | 172³ | int8w_fp16 | 737 | 804.212 | 0,166 | 0,0 |
| setup_53 | 140³ | fp32 | 533 | 263.805 | 0,0 | — |
| setup_53 | 140³ | fp16 | 336 | 418.476 | 0,076 | 0,0 |
| setup_53 | 140³ | int8w | 494 | 284.632 | 0,268 | 0,0 |
| setup_53 | 140³ | int8w_fp16 | 328 | 428.683 | 0,225 | 0,0 |
| setup_53 | 124³ | fp32 | 348 | 134.069 | 0,0 | — |
| setup_53 | 124³ | fp16 | 157 | 297.172 | 0,073 | 0,0 |
| setup_53 | 124³ | int8w | 317 | 147.180 | 0,194 | 0,0 |
| setup_53 | 124³ | int8w_fp16 | 160 | 291.600 | 0,201 | 0,0 |
| setup_56 | 148³ | fp32 | 1208 | 178.808 | 0,001 | — |
| setup_56 | 148³ | fp16 | 921 | 234.528 | 0,2 | 0,0 |
| setup_56 | 148³ | int8w | 1219 | 177.194 | 0,379 | 0,0 |
| setup_56 | 148³ | int8w_fp16 | 880 | 245.455 | 0,34 | 0,0 |
| setup_56 | 132³ | fp32 | 811 | 105.036 | 0,001 | — |
| setup_56 | 132³ | fp16 | 574 | 148.404 | 0,16 | 0,0 |
| setup_56 | 132³ | int8w | 822 | 103.630 | 0,447 | 0,0 |
| setup_56 | 132³ | int8w_fp16 | 559 | 152.386 | 0,266 | 0,0 |
| setup_56 | 116³ | fp32 | 527 | 41.655 | 0,001 | — |
| setup_56 | 116³ | fp16 | 324 | 67.753 | 0,119 | 0,0 |
| setup_56 | 116³ | int8w | 526 | 41.734 | 0,342 | 0,0 |
| setup_56 | 116³ | int8w_fp16 | 326 | 67.337 | 0,332 | 0,0 |
| setup_55 | 172³ | fp32 | 1080 | 548.800 | 0,001 | — |
| setup_55 | 172³ | fp16 | 758 | 781.931 | 0,117 | 0,0 |
| setup_55 | 172³ | int8w | 989 | 599.296 | no disponible (dato truncado en la model card) | no disponible |

F1 de validación por modelo (declarado por el autor): setup_54 = 0,958; setup_53 = 0,955; setup_61 = 0,738; setup_56 = 0,765; setup_55 = 0,645; setup_67 = 0,806. No se detallan en la información disponible las métricas de setup_67 en la tabla de benchmark de navegador.

## Requisitos de hardware

- El pico de memoria está dominado por las activaciones, no por los pesos: el mayor tensor individual ocupa aproximadamente 40×N³ valores en ResUNet y 32×(N−2)³ en Unet3dIso. Como referencia, con N=148 eso equivale a 259 MB en fp16 y 519 MB en fp32.
- WebGPU: se ha medido en Chrome 154 sobre macOS con GPU Apple (metal-3) e onnxruntime-web 1.27.0-dev.20260506. Cabe en cualquier GPU con WebGPU siempre que el maxBufferSize no sea inferior al tamaño del mayor tensor; si lo es, hay que reducir el bloque.
- Las variantes fp16 e int8w_fp16 requieren WebGPU, ya que el soporte de fp16 en WASM es deficiente. fp32 e int8w funcionan en WebGPU y en WASM (CPU).
- GPUs de servidor: las variantes conv3d/setup_XX están pensadas para runtimes con Conv3d rápida (onnxruntime CUDA/CPU, TensorRT), donde no aplica la limitación de WebGPU.
- Throughput de referencia en GPU Apple M-series: setup_53 a 172³ con fp16 alcanza 799.870 voxels/s; setup_55 a 172³ con fp16 llega a 781.931 voxels/s; setup_54 a 148³ con int8w_fp16 rinde 245.734 voxels/s.
- Latencia por bloque en el mismo hardware: entre 157 ms (setup_53, 124³, fp16) y 1219 ms (setup_56, 148³, int8w).
- Opciones de despliegue documentadas: onnxruntime-web (WebGPU y WASM) en el navegador, y onnxruntime CUDA/CPU o TensorRT para las variantes Conv3d nativas. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- No se especifican requisitos mínimos de VRAM ni GPU recomendadas concretas más allá de la GPU Apple empleada en las mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (segmentación de orgánulos en FIB-SEM) ni datos de rendimiento de terceros para establecer una comparación. Las únicas alternativas documentadas son las dos arquitecturas dentro del propio paquete, que se pueden comparar entre sí: ResUNet3DValid (10,7 M de parámetros, F1 de 0,958 en mitocondrias) frente a Unet3dIso (5,6 M de parámetros, F1 de 0,955 en mitocondrias), con la primera ofreciendo mejor precisión a costa de mayor coste computacional, y la segunda siendo aproximadamente el doble de ligera y más rápida en WebGPU.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible, por lo que no puede confirmarse si el uso comercial está permitido. Conviene contactar con el autor antes de utilizarlo en producción.
- Los modelos solo cubren tres dianas (mitocondrias, núcleos y retículo endoplasmático); no segmentan otras estructuras celulares.
- La salida son logits en crudo, no máscaras segmentadas: el usuario debe aplicar sigmoid o umbralizar en 0 y, en el caso de mitocondrias, resolver los tres canales de afinidad para obtener instancias.
- Las convoluciones son válidas, por lo que la salida pierde 88 voxels por eje respecto al bloque de entrada; hay que solapar bloques o tenerlo en cuenta al ensamblar volúmenes grandes.
- El tamaño de bloque está fijado por fichero (_in\<N\>), de modo que no se puede ajustar libremente sin cambiar de fichero.
- Las variantes fp16 e int8w_fp16 no funcionan correctamente en WASM; solo son viables en WebGPU. int8w reduce el tamaño de descarga pero desquantiza los pesos al cargar, por lo que no ahorra memoria de activaciones.
- La cuantización introduce desviaciones numéricas respecto a PyTorch (hasta 0,447 de diferencia absoluta máxima en setup_56 con int8w), aunque el porcentaje de voxels con decisión de umbral distinta respecto a fp32 es 0,0 % en todas las pruebas publicadas.
- La reescritura Conv3d→Conv2d solo aporta la aceleración indicada en WebGPU; en runtimes con Conv3d nativa conviene usar la carpeta conv3d/.
- No se documentan sesgos del modelo (es un modelo de visión, no de lenguaje) ni análisis de generalización fuera del conjunto jrc_mus-liver empleado en las pruebas.
- No hay información sobre la composición del dataset de entrenamiento, el preprocesado exacto de las imágenes FIB-SEM ni la procedencia de las anotaciones, lo que dificulta evaluar su comportamiento en dominios distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/onnx-web-models
- Cliente serverless cellmap-flow: https://github.com/mzouink/cellmap-flow/tree/serverless
- onnxruntime-web: https://onnxruntime.ai/
- Datos públicos OpenOrganelle (jrc_mus-liver): no disponible como enlace en la información proporcionada
- Paper del modelo: no disponible en la información proporcionada
- Blog o demo adicionales: no disponible en la información proporcionada
