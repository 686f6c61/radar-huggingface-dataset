# moonbox-dev/ormbg-ONNX

## Resumen

ORMBG ONNX es una compilacion del modelo Open Remove Background Model (ormbg) en formato ONNX, publicada por moonbox-dev para su uso en dispositivo con ONNX Runtime (CUDA, DirectML y CPU). El modelo original, desarrollado por schirrmacher, es un removedor de fondos completamente open source optimizado para imagenes de personas, basado en la investigacion Highly Accurate Dichotomous Image Segmentation (DIS). Esta compilacion no modifica la arquitectura ni los pesos: solo exporta y cuantiza el grafo para facilitar el despliegue en entornos sin PyTorch.

El modelo resuelve la tarea de segmentacion de imagen orientada a la generacion de mattes alfa (recorte con transparencia) en retratos y fotografias con personas. Se distribuye en dos precisiones, fp16 (88 MB) e int8 (44 MB), ambas derivadas de un grafo fp32 de referencia de 176 MB. La entrada es una imagen RGB de 1024 x 1024 normalizada a 0-1 y la salida principal (salida 0) es el matte; las demas salidas son ramas laterales y caracteristicas internas.

Es relevante ahora porque permite ejecutar un removedor de fondos de calidad en portatiles y estaciones de trabajo con GPU de consumo, con un consumo de VRAM inferior a 1 GB en fp16 y tiempos de inferencia en torno a 176-194 ms por imagen en una RTX 3080 Laptop. La licencia Apache-2.0 y la disponibilidad de los pesos en un unico grafo ONNX simplifican su integracion en aplicaciones de escritorio, movil y pipelines de edicion de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentacion dicotoma basada en la investigacion DIS (Highly Accurate Dichotomous Image Segmentation); grafo ONNX unico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 1024 x 1024) |
| Tipos de cuantizacion | fp32 (referencia, no publicada), fp16, int8 (weight-only con DequantizeLinear, pesos int8 por canal de salida y activaciones en float) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` por carpeta de precision) |

## Arquitectura y entrenamiento

La arquitectura subyacente sigue la linea de investigacion DIS (Highly Accurate Dichotomous Image Segmentation), orientada a la extraccion de mattes de alta precision con bordes finos. El grafo ONNX es unico y expone multiples salidas: la salida 0 es el matte final y el resto son salidas laterales y caracteristicas. La entrada es fija de 1024 x 1024 píxeles en RGB normalizado a 0-1. En esta compilacion no se ha reentrenado el modelo: se parte del `ormbg.onnx` oficial en fp32 y se generan las variantes fp16 (con onnxconverter-common, manteniendo entradas y salidas en fp32) e int8 (con cuantizacion estatica QDQ de ONNX Runtime, pesos int8 por canal y activaciones uint8 con calibracion MinMax sobre imagenes fuera del conjunto de evaluacion). No se genero int4 porque el grafo no contiene pesos MatMul, ni bf16 porque el proveedor CUDA de ONNX Runtime no soporta convolucion en bf16.

El entrenamiento original, segun la model card del autor, comenzo con imagenes sinteticas del Human Segmentation Dataset generadas con LayerDiffuse, pero el modelo mostraba dificultades en imagenes reales debido a la brecha entre dominios sintetico y real, tal como documenta el trabajo PEOPLESANSPEOPLE (2022). Las siguientes iteraciones del autor contemplan ampliar el dataset con imagenes sinteticas y reales y explorar funciones de perdida del estado del arte. No se dispone de datos sobre el numero de tokens, la composicion exacta del dataset final ni el uso de RLHF o DPO, que no aplican a un modelo de segmentacion.

## Capacidades

- Segmentacion de imagen y generacion de mattes alfa para recorte de fondos.
- Especializado en retratos y fotografias con personas; el propio autor advierte que rinde mal en objetos generales.
- Salida de matte con valores normalizados y posibilidad de redimensionar el alfa al tamano original de la imagen.
- Multiples salidas en el grafo (matte principal, salidas laterales y caracteristicas) que pueden aprovecharse para postprocesado o analisis.
- Ejecucion en ONNX Runtime con proveedores CUDA, DirectML y CPU, lo que permite despliegue en GPU, Windows nativo y CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un modelo puramente visual.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Recorte de retratos para estudios fotograficos: el modelo genera un matte alfa de alta precision en 1024 x 1024 que puede aplicarse sobre la imagen original redimensionada, adecuado para catalogos de fotografia de personas y avatares profesionales.
- Edicion de imagen en aplicaciones de escritorio: al ejecutarse con ONNX Runtime en DirectML o CPU, puede integrarse en herramientas nativas de Windows o macOS sin depender de PyTorch, con un grafo de 44-88 MB facil de empaquetar.
- Procesamiento por lotes en servidores con GPU de consumo: con 0,8 GB de VRAM en fp16 y unos 176 ms por imagen en una RTX 3080 Laptop, es viable procesar lotes de cientos de retratos en una sola GPU.
- Generacion de avatares y fotos de perfil: el matte permite sustituir fondos por colores corporativos o plantillas, con una calidad de borde adecuada para imagenes de personas segun las metricas DIS5K reportadas.
- Integracion en pipelines de comercio electronico: para fotografia de moda y personas, el modelo puede automatizar la eliminacion de fondos antes de publicar fichas de producto, siempre que las imagenes contengan personas y no solo objetos.
- Preprocesado para modelos generativos: el matte alfa sirve como mascara para tareas de inpainting, composicion o entrenamiento de modelos de difusion que requieren separar figura y fondo en retratos.
- Aplicaciones moviles y de borde: la variante int8 de 44 MB y la fp16 de 88 MB permiten despliegue en dispositivos con recursos limitados mediante ONNX Runtime, aunque el rendimiento dependera del hardware concreto.

## Benchmarks y rendimiento

Los datos publicados en la model card se evaluan sobre los conjuntos de test de DIS5K (250 imagenes: DIS-TE1..4 y DIS-VD, 50 cada uno), con ONNX Runtime 1.30 y proveedor CUDA en una RTX 3080 Laptop GPU. Las mascaras se reducen a un maximo de 2048 px en el lado largo y se puntuan con PySODMetrics. La columna "vs fp32" mide la concordancia de cada precision con el grafo fp32 de referencia (IoU de mascaras a 0,5 y diferencia absoluta media).

| Precision | Tamano | vs fp32 (IoU, MAE) | MAE | S-measure | max F | Tiempo por imagen | VRAM pico |
|---|---|---|---|---|---|---|---|
| fp32 (referencia, no publicada) | 176 MB | - | 0,1462 | 0,720 | 0,673 | 197 ms | 1,7 GB |
| fp16 | 88 MB | IoU 0,9986, MAE 0,0003 | 0,1461 | 0,720 | 0,673 | 176 ms | 0,8 GB |
| int8 | 44 MB | IoU 0,9785, MAE 0,0030 | 0,1467 | 0,719 | 0,673 | 194 ms | 1,9 GB |

No se han publicado comparaciones con otros modelos de segmentacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0,8 GB en fp16, 1,9 GB en int8 y 1,7 GB en fp32 (referencia) segun las mediciones del autor en una RTX 3080 Laptop.
- GPU recomendadas: cualquier GPU compatible con CUDA o DirectML; el autor reporta mediciones en RTX 3080 Laptop. No se especifican requisitos minimos adicionales.
- Cabe en GPU de consumo: si, con menos de 2 GB de VRAM en todas las precisiones publicadas.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML y CPU; el modelo se distribuye como un unico `model.onnx` por carpeta de precision.
- Latencia y throughput: 176 ms por imagen en fp16, 194 ms en int8 y 197 ms en fp32 sobre RTX 3080 Laptop, con entrada de 1024 x 1024. No se publican cifras de throughput por lote ni latencias en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORMBG ONNX (este modelo) | no disponible | 1024 x 1024 fijo | DIS5K: MAE 0,1461 (fp16), S-measure 0,720 | Apache-2.0 | ONNX en Hugging Face; fp16 e int8 |
| schirrmacher/ormbg (original) | no disponible | 1024 x 1024 fijo | Base del modelo; mismas metricas de referencia | Apache-2.0 | Pesos originales en Hugging Face; demo en Spaces |
| Modelos DIS (investigacion) | no disponible | no disponible | Origen metodologico del modelo; no se dispone de metricas comparables en la informacion | no disponible | Repositorio de investigacion DIS |

No se dispone de datos suficientes para comparar con alternativas de removedores de fondos comerciales o de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado para imagenes con personas y rinde mal en objetos generales, como indican los propios numeros de DIS5K y la advertencia del autor.
- La brecha entre datos sinteticos y reales documentada por el autor puede provocar errores en condiciones de iluminacion, oclusion o escalas no representadas en el entrenamiento.
- Riesgo de bordes imprecisos en pelo, ropa fina o elementos semitransparentes, habitual en modelos de matting; no se han publicado evaluaciones especificas de estos casos.
- La entrada es fija de 1024 x 1024, por lo que imagenes de mayor resolucion requieren redimensionado y posterior escalado del matte, con posible perdida de detalle.
- No se dispone de informacion sobre sesgos demograficos, de genero o de tono de piel en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero los archivos son una obra derivada del modelo original y heredan su licencia, que gobierna su uso.
- No se publican resultados de benchmarks frente a otros modelos, por lo que la comparacion de calidad con alternativas no puede establecerse con los datos disponibles.
- El modelo no procesa texto ni lenguaje; cualquier uso linguistico queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/ormbg-ONNX
- Modelo base original: https://huggingface.co/schirrmacher/ormbg
- Demo del modelo original: https://huggingface.co/spaces/schirrmacher/ormbg
- Dataset de entrenamiento: https://huggingface.co/datasets/schirrmacher/humans
- Repositorio de investigacion DIS: https://github.com/xuebinqin/DIS
- Paper PEOPLESANSPEOPLE (2022): https://arxiv.org/pdf/2112.09290
- LayerDiffuse: https://github.com/layerdiffusion/LayerDiffuse
- Grupo de Discord de investigacion: https://discord.gg/YYZ3D66t
