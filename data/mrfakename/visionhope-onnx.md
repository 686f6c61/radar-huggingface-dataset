# mrfakename/VisionHOPE-ONNX

## Resumen

VisionHOPE-ONNX es un conjunto de exportaciones a formato ONNX del modelo de vision PSRben/VisionHOPE, publicadas por el usuario mrfakename. Su proposito es permitir la ejecucion del modelo directamente en el navegador mediante onnxruntime-web sobre WebGPU, evitando dependencias de servidor. Se distribuye en tres variantes de tamano (tiny, small y base) y cubre dos tareas: clasificacion de imagenes sobre ImageNet-1k y segmentacion semantica sobre ADE20K con cabecera UPerNet.

El repositorio no contiene pesos de un modelo de lenguaje, sino grafos ONNX estaticos en fp32 (opset 17) pensados para inferencia de vision por computador. Cada modelo se exporto desde un port en PyTorch puro del modelo oficial, y se preoptimizo con el nivel basico de onnxruntime (constant folding) para que las sesiones arranquen en segundos. Los grafos alimentan la demo web mrfakename/visionhope-webgpu, que se ejecuta en Chrome con onnxruntime-web y WebGPU.

La relevancia actual radica en que demuestra un flujo de despliegue de modelos de vision en el cliente (edge/browser) sin backend, con numeros de paridad verificados frente a la implementacion en PyTorch. La licencia es MIT, lo que facilita su reutilizacion, aunque el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no publica resultados de benchmarks absolutos (accuracy, mIoU), solo verificaciones de paridad numerica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (exportacion ONNX de un modelo de vision; el paper asociado menciona un "SRNL scan" desplegado por chunks de fila/columna) |
| Parametros totales | no disponible (el repositorio no declara el recuento; tamanos de fichero: 129 MB tiny, 248 MB small, 407 MB base en clasificacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija) |
| Tipos de cuantizacion | no disponible (los pesos exportados estan en fp32) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, fp32, shapes estaticas) |

## Arquitectura y entrenamiento

La informacion disponible describe las exportaciones, no el entrenamiento del modelo base. Los grafos son fruto de un port a PyTorch puro del modelo oficial PSRben/VisionHOPE, en el que el mecanismo de "SRNL scan" se despliega de forma explicita recorriendo la matriz por chunks de fila y columna (unrolled). Posteriormente se aplico constant folding de onnxruntime para fijar las formas y acelerar el arranque. El resultado son grafos de entre 52.889 y 195.050 nodos, con formas estaticas, salidas deterministas y sin etapas dinamicas.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF o DPO, dado que no es un modelo de lenguaje. La deteccion de objetos (Mask R-CNN) no se exporto porque sus etapas de NMS y RoI dinamico no encajan bien en un grafo estatico para WebGPU. La validacion del port se hizo contra la implementacion oficial (mmcv/mmseg/timm con kernels CUDA), obteniendo logits de clasificacion con diferencias inferiores a 1e-5 y una coincidencia de pixeles en ADE20K igual o superior a 0,99998.

## Capacidades

- Clasificacion de imagenes sobre ImageNet-1k (1.000 clases): entrada `pixel_values` float32 [1,3,224,224], salida `logits` [1,1000].
- Segmentacion semantica sobre ADE20K con cabecera UPerNet (150 clases): entrada `pixel_values` float32 [1,3,512,512], salidas `logits` [1,150,128,128] y `labels` uint8 [1,512,512].
- Ejecucion en navegador sobre WebGPU mediante onnxruntime-web, sin backend de servidor.
- Ejecucion en CPU con onnxruntime (probado sobre 16 vCPU).
- No incluye deteccion de objetos ni instancias (Mask R-CNN descartado por incompatibilidad con grafos estaticos).
- No ofrece soporte de tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Demo interactiva en navegador: la variante tiny de clasificacion (129 MB) permite ejecutar la inferencia en el propio navegador del usuario sobre WebGPU, habilitando pruebas de clasificacion sin infraestructura de backend.
- Segmentacion de imagenes en aplicaciones web ligeras: el modelo base de segmentacion ADE20K (589 MB) puede generar mapas de 512x512 de 150 clases directamente en el cliente, util para herramientas de etiquetado o edicion de imagen en el navegador.
- Prototipado rapido de pipelines de vision: gracias al formato ONNX estatico y a tiempos de arranque de sesion de pocos segundos, sirve para validar integraciones de onnxruntime en entornos de desarrollo.
- Despliegue en dispositivos sin GPU dedicada: la variante tiny en clasificacion se ejecuta en CPU (0,9 s/imagen sobre 16 vCPU), adecuada para procesamiento por lotes en servidores modestos.
- Clasificacion de contenido en backend: la version small o base ofrece mayor capacidad que tiny (248 MB y 407 MB respectivamente) manteniendo compatibilidad con el mismo runtime, util para moderacion o taxonomia de imagenes.
- Referencia para portabilidad de modelos de vision: el repositorio documenta el procedimiento de exportacion y los numeros de paridad, por lo que sirve como plantilla para exportar otros modelos de vision a ONNX con verificacion numerica.
- Segmentacion semantica para analisis de escenas: la salida de 150 clases de ADE20K se puede usar en tareas de comprension de escenas interiores y exteriores, siempre que se acepten las diferencias de preprocesado respecto a la evaluacion oficial del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks absolutos (accuracy de ImageNet, mIoU de ADE20K) en la informacion disponible. Lo que si se publica es una tabla de paridad numerica entre la exportacion ONNX sobre onnxruntime CPU y el port en PyTorch:

| Modelo | Nodos | Tamano | Imagenes | Coincidencia | Diferencia abs. max (logits) | ORT CPU s/img |
|---|---|---|---|---|---|---|
| visionhope_tiny_cls.onnx | 52.889 | 129 MB | 6 | top-1 6/6, top-5 6/6 | 1,9e-05 | 0,9 |
| visionhope_small_cls.onnx | 80.510 | 248 MB | 6 | top-1 6/6, top-5 6/6 | 2,8e-05 | 1,7 |
| visionhope_base_cls.onnx | 80.510 | 407 MB | 6 | top-1 6/6, top-5 6/6 | 3,7e-05 | 2,9 |
| visionhope_tiny_ade20k_512.onnx | 128.179 | 278 MB | 4 | pixeles >= 99,9996% | 4,0e-05 | 4,2 |
| visionhope_small_ade20k_512.onnx | 195.050 | 420 MB | 4 | pixeles >= 99,9996% | 4,8e-05 | 6,1 |
| visionhope_base_ade20k_512.onnx | 195.050 | 589 MB | 4 | pixeles 100% | 4,8e-05 | 7,4 |

Estas cifras miden la fidelidad de la exportacion frente al port en PyTorch, no la calidad predictiva. La referencia son imagenes de COCO val2017, sobre onnxruntime 1.20.1 en CPU con 16 vCPU. La coincidencia en segmentacion es la proporcion de etiquetas argmax identicas sobre el mapa de 512x512, y la diferencia absoluta se mide sobre los logits de 128x128.

## Requisitos de hardware

- Huella de almacenamiento por variante: 129 MB (tiny cls), 248 MB (small cls), 407 MB (base cls), 278 MB (tiny ade20k), 420 MB (small ade20k) y 589 MB (base ade20k).
- VRAM estimada para inferencia: al ser grafos fp32 con shapes estaticas, la memoria de activaciones es acotada; los pesos ocupan lo indicado arriba y el consumo total es del orden de esos tamanos mas los tensores intermedios, por lo que cabe holgadamente en cualquier GPU consumer con WebGPU.
- Cabe en GPU consumer: si. Cualquier GPU con soporte WebGPU y alrededor de 2 GB de memoria disponible puede ejecutar las variantes tiny y base.
- Ejecucion en CPU: viable; los tiempos medidos son 0,9 a 2,9 s/imagen en clasificacion y 4,2 a 7,4 s/imagen en segmentacion sobre 16 vCPU.
- Opciones de despliegue: onnxruntime (Python/C++) en servidor y onnxruntime-web con WebGPU en navegador. Los seis modelos se probaron en Chrome headless con onnxruntime-web sobre WebGPU.
- Frameworks no aplicables: vLLM, TGI y Ollama estan orientados a modelos de lenguaje y no son el cauce natural para estos grafos de vision.
- Latencia y throughput: no se publican mediciones de throughput en GPU ni de latencia en WebGPU; solo los tiempos en CPU citados.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. Se ofrece una comparacion estructural entre las propias variantes y frente a alternativas genericas de vision en formato ONNX:

| Criterio | VisionHOPE-ONNX tiny/small/base | Alternativas tipicas (ViT, DeiT, SegFormer ONNX) |
|---|---|---|
| Tarea | Clasificacion ImageNet-1k + segmentacion ADE20K | Clasificacion y/o segmentacion |
| Parametros | no disponible | no disponible |
| Contexto de entrada | Imagen fija 224x224 (cls) y 512x512 (seg) | Depende del modelo |
| Licencia | MIT | Variable (habitualmente Apache-2.0 o MIT) |
| Formato | ONNX opset 17 fp32, shapes estaticas | ONNX con frecuencia shapes parcialmente dinamicas |
| Enfoque de despliegue | Optimizado para onnxruntime-web y WebGPU en navegador | Depende de la exportacion |

Las cifras concretas de accuracy y mIoU de VisionHOPE frente a esas alternativas no estan disponibles en la informacion facilitada.

## Limitaciones y advertencias

- No se publican datos de sesgo del modelo base; al ser un modelo de vision entrenado sobre ImageNet-1k y ADE20K, hereda los sesgos de dichos conjuntos (categorias y escenas sobrerrepresentadas).
- Riesgo de error en clases poco frecuentes de ImageNet-1k y en las 150 categorias de ADE20K, sin metricas de robustez publicadas.
- El preprocesado de segmentacion difiere de la evaluacion oficial del paper: se redimensiona a 512x512 sin mantener la relacion de aspecto y se normaliza en espacio 0-255, mientras que la evaluacion oficial usa keep-ratio, lado corto 512 e inferencia deslizante o completa. Por tanto, las puntuaciones no coincidiran exactamente con las del paper.
- La deteccion de objetos (Mask R-CNN) no esta incluida, lo que limita el uso a clasificacion y segmentacion semantica.
- Los grafos tienen formas estaticas, por lo que no admiten entradas de resolucion arbitraria sin reexportar.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base PSRben/VisionHOPE antes de explotarlo en produccion.
- El repositorio registra 0 descargas y 0 likes, y no publica benchmarks absolutos; su madurez para produccion no esta contrastada por la comunidad.
- Al ser un modelo de vision, no ofrece capacidades de texto, tool calling, agentes ni multilingues, por lo que no debe evaluarse con criterios de modelos de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrfakename/VisionHOPE-ONNX
- Modelo base: https://huggingface.co/PSRben/VisionHOPE
- Paper: https://arxiv.org/abs/2609.33325
- Codigo: https://github.com/PSRben/VisionHOPE
- Demo en navegador (Space): https://huggingface.co/spaces/mrfakename/visionhope-webgpu
