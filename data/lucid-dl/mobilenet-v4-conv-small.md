# lucid-dl/mobilenet-v4-conv-small

## Resumen

mobilenet-v4-conv-small es un clasificador de imagenes publicado por el usuario lucid-dl en HuggingFace. No es un modelo entrenado desde cero: se trata de un port a la libreria Lucid del checkpoint `timm/mobilenetv4_conv_small.e2400_r224_in1k`, convertido a safetensors nativos de Lucid y validado con una carga estricta ("strict load") contra un modelo Lucid construido desde cero. El modelo subyacente procede del paper *MobileNetV4: Universal Models for the Mobile Ecosystem* (Qin et al., ECCV 2024, arXiv:2404.10518).

Se trata de la variante mas pequena de la familia MobileNetV4, con 3,8 millones de parametros y un peso en disco de 14,52 MB. Es una red convolucional pura (el sufijo "Conv" la distingue de las variantes hibridas con atencion) pensada para inferencia en el borde: moviles, sistemas embebidos y CPU. Declara un 73,756 % de accuracy top-1 y un 91,43 % de accuracy top-5 sobre ImageNet-1k, cifras que en el model-index aparecen como no verificadas.

Su relevancia es practica mas que cientifica: ofrece un backbone de clasificacion de 3,8 M de parametros, con licencia Apache-2.0 y en un formato (safetensors) cargable sin depender de PyTorch pickle. Para quien trabaje con la libreria Lucid, evita tener que convertir manualmente los pesos de timm. Para el resto de la comunidad, el checkpoint original de timm sigue siendo la opcion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (MobileNetV4, variante Conv-Small, basada en bloques Universal Inverted Bottleneck) |
| Parametros totales | 3,8 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224 x 224 px) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los 14,52 MB del repo son coherentes con FP32) |
| Idiomas soportados | no aplica (clasificacion de imagenes; las 1000 etiquetas de ImageNet-1k estan en ingles) |
| Licencia | Apache-2.0 (heredada de los pesos originales) |
| Formato de pesos | safetensors (nativo de Lucid) |
| Numero de clases | 1000 (ImageNet-1k) |
| Resolucion de entrada | 224 x 224 px (segun el sufijo `r224` del checkpoint original) |
| GFLOPs | no disponible (la tabla del autor lo deja en blanco) |
| Tamano del repositorio | 0,0 GB |
| Libreria de carga | `lucid` (via `lucid.models`) |
| Dataset de entrenamiento | ImageNet-1k |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de la familia MobileNetV4 (Qin et al., 2024). Dentro de esa familia, la variante Conv-Small es la mas pequena y la unica puramente convolucional: el paper define bloques Universal Inverted Bottleneck (UIB) y un bloque de atencion Mobile MQA que se emplea en las variantes hibridas de mayor tamano, no en esta. Al ser un modelo discriminativo, no hay RLHF, DPO ni ninguna fase de alineacion: se entrena con aprendizaje supervisado sobre etiquetas de clase.

El entrenamiento se realizo sobre ImageNet-1k (1,28 M de imagenes de entrenamiento y 50.000 de validacion, 1000 clases). El identificador `e2400_r224_in1k` del checkpoint de timm sigue su convencion de nombres: 2400 epocas de entrenamiento, resolucion de entrada de 224 x 224 y dataset ImageNet-1k. La model card de este port no detalla la composicion exacta del dataset, el recetario de aumento de datos, si hubo destilacion desde un modelo mayor ni el numero total de tokens/imagenes vistas, por lo que esos extremos quedan como no disponibles.

La unica aportacion tecnica de este repositorio concreto es la conversion: los pesos de timm se transformaron a safetensors nativos de Lucid mediante `python -m tools.convert_weights mobilenet_v4_conv_small --tag E2400_R224_IN1K`, verificando el conjunto de claves, las formas de los tensores y una carga estricta contra un modelo Lucid recien construido. El preprocesado (transforms) viaja asociado a los pesos y se obtiene con `weights.transforms()`, lo que reduce el riesgo de desajustes entre normalizacion y checkpoint.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k, devolviendo logits de forma `(B, num_classes)`.
- Inferencia por lotes: la API acepta tensores con dimension de batch (`model(preprocess(image)[None])`).
- Preprocesado integrado: las transformaciones de imagen acompanan al objeto de pesos (`MobileNetV4ConvSmallWeights.E2400_R224_IN1K.transforms()`).
- Carga mediante tag explicito, ya sea por enum o por cadena (`pretrained="E2400_R224_IN1K"`).
- Uso potencial como extractor de caracteristicas (backbone) por su naturaleza convolucional, aunque la model card no documenta ni ejemplifica ese uso.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni tool calling.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No realiza deteccion de objetos, segmentacion, captioning ni respuesta a preguntas visuales: solo asigna una etiqueta de clase a la imagen completa.
- No hay capacidades multilingues ni ninguna modalidad de entrada distinta de la imagen RGB.

## Casos de uso

- Clasificacion en el borde (edge computing): con 3,8 M de parametros y 14,52 MB en FP32, el modelo cabe en un movil, una Raspberry Pi o un microcontrolador de gama alta, y puede ejecutar inferencia sin conexion a red.
- Etiquetado automatico de corpus de imagenes: util como primer paso de un pipeline de curacion de datos para asignar una de las 1000 clases de ImageNet a millones de imagenes antes de un filtrado o entrenamiento posterior.
- Filtrado previo en sistemas de moderacion de contenido: por su bajo coste computacional, sirve como clasificador de primera linea que descarta o marca imagenes antes de enviarlas a un modelo mayor y mas caro.
- Preentrenamiento de transferencia: al ser una CNN estandar entrenada en ImageNet-1k, se puede afinar (fine-tuning) sobre datasets de dominio especifico (inspeccion industrial, clasificacion de productos, imagenes medicas) con requisitos de hardware minimos.
- Backbone para deteccion o segmentacion: truncando la cabeza de clasificacion, la red puede integrarse en arquitecturas tipo detector o segmentador que necesiten un extractor ligero para uso en tiempo real.
- Procesamiento de video en tiempo real: su tamano permite clasificar fotogramas a alta frecuencia en GPU de gama media, algo inasumible para clasificadores de cientos de millones de parametros.
- Pruebas y CI de modelos de vision: sirve como modelo de referencia barato en tests de integracion de la propia libreria Lucid (conversion de pesos, formas de salida, preprocesado).
- Aplicaciones web en el navegador: exportado a un formato adecuado (ONNX, WebAssembly), es candidato a ejecucion en cliente sin backend, aunque esta ficha no documenta dicha exportacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| ImageNet-1k | clasificacion de imagenes | acc@1 | 73,756 % | no |
| ImageNet-1k | clasificacion de imagenes | acc@5 | 91,43 % | no |

No se han publicado otros resultados de benchmarks en la informacion disponible (ni ImageNet-V2, ni ImageNet-R/A, ni metricas de latencia o throughput). Tampoco se proporcionan cifras de los modelos de comparacion para establecer una tabla cruzada.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en cualquier configuracion. Con 3,8 M de parametros, el peso del modelo es de ~15,2 MB en FP32 y ~7,6 MB en FP16; el grueso del consumo proviene de las activaciones, no de los pesos.
- CPU: ejecutable en CPU sin aceleracion, incluidos portatiles y dispositivos embebidos. Es el escenario de despliegue natural de esta familia.
- GPU de consumo: cabe con enorme margen en cualquier GPU, desde una GTX 1050 hasta una RTX 4090. No requiere GPU dedicada.
- GPU de datacenter: A100, H100 y similares estan sobredimensionadas para un unico forward; solo tienen sentido para procesar lotes masivos en paralelo.
- Aceleradores de borde: TPU de Coral, NPU integradas en SoC moviles o Intel Neural Compute Stick son objetivos plausibles por tamano, si bien la model card no documenta artefactos compilados para ellos.
- Opciones de despliegue: la via oficial es la libreria Lucid (`lucid.models.mobilenet_v4_conv_small_cls`). Como el checkpoint original vive en timm, tambien se puede cargar `timm/mobilenetv4_conv_small.e2400_r224_in1k` con PyTorch/timm. No se documentan en esta ficha integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje; TGI soporta algunos modelos de vision, pero no se menciona aqui).
- Latencia y throughput: no disponibles. No se publican mediciones de milisegundos por imagen ni de imagenes por segundo en ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato | acc@1 (ImageNet-1k) | acc@5 (ImageNet-1k) |
|---|---|---|---|---|---|---|
| lucid-dl/mobilenet-v4-conv-small (esta ficha) | 3,8 M | 224 x 224 | Apache-2.0 | safetensors (Lucid) | 73,756 % | 91,43 % |
| timm/mobilenetv4_conv_small.e2400_r224_in1k (origen) | 3,8 M | 224 x 224 | Apache-2.0 | safetensors (PyTorch) | 73,756 % | 91,43 % |
| Otras variantes de MobileNetV4 (Conv-Medium, Conv-Large, hibridas) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas moviles de la misma categoria (MobileNetV3-Small, EfficientNet-B0, ResNet-18) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante y documentada es con el checkpoint original de timm: se trata de los mismos pesos y, por tanto, de la misma exactitud. La diferencia es el runtime: este repositorio requiere la libreria Lucid, mientras que el original funciona con PyTorch y timm, mucho mas extendidos. Para el resto de alternativas moviles no se dispone de cifras en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas acc@1 y acc@5 figuran con `verified: false` en el model-index: son declaraciones del autor, no resultados reproducidos de forma independiente.
- Alcance cerrado a las 1000 clases de ImageNet-1k. No detecta objetos, no localiza regiones, no genera descripciones y no admite clases arbitrarias sin reentrenar la cabeza de clasificacion.
- Degradacion esperada fuera de la distribucion de ImageNet: imagenes con iluminacion, angulos o dominios muy distintos (radiologia, satelite, microscopia) requieren fine-tuning.
- Sesgos heredados de ImageNet-1k: sobrerrepresentacion de determinadas culturas, geografias y contextos, y etiquetas problematicas en categorias de personas o profesiones.
- No se publican datos de robustez (ImageNet-V2, ImageNet-R, ImageNet-A), calibracion ni comportamiento ante imagenes adversarias.
- No hay informacion sobre cuantizacion, compilacion a ONNX/TensorRT/TFLite ni soporte en aceleradores concretos dentro de este repositorio.
- Dependencia de la libreria Lucid, poco extendida: en produccion conviene valorar si merece la pena adoptarla frente a timm.
- Licencia Apache-2.0, heredada de los pesos originales: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.
- Los metadatos indican una fecha de creacion (2026-09-24) incoherente con la publicacion del paper (2024); conviene verificar la procedencia y el estado real del repositorio.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a empresas homonimas ("Lucid Motors", "Lucid Trading", "Lucidchart") y no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/mobilenet-v4-conv-small
- Checkpoint original en timm: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Paper MobileNetV4 (Qin et al., ECCV 2024): https://arxiv.org/abs/2404.10518
- Repositorio de la libreria Lucid: https://github.com/ChanLumerico/lucid
- Repositorio de timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Resultados de la busqueda web: sin enlaces relevantes (solo apariciones de empresas homonimas: lucidmotors.com, lucidtrading.com, lucid.co)
