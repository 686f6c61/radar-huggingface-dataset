# ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-int8-uint8-onnx

## Resumen

El modelo `ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-int8-uint8-onnx` es una versión cuantizada de MobileNetV2, una arquitectura de red neuronal convolucional ligera diseñada para clasificación de imágenes. Desarrollado por la comunidad de ONNX Model Zoo y adaptado por el usuario ketiswp, este modelo se distribuye en formato ONNX con operadores QOperator, lo que permite una inferencia eficiente en dispositivos con recursos limitados. La cuantización estática a 8 bits (INT8 para pesos y UINT8 para activaciones) reduce el tamaño del modelo y acelera la ejecución en CPU y hardware especializado, a costa de una pequeña pérdida de precisión.

El modelo está entrenado en el conjunto de datos ImageNet, que abarca 1000 categorías de objetos y escenas. Su relevancia actual radica en su idoneidad para despliegues en entornos de producción donde el consumo de memoria y la latencia son críticos, como aplicaciones móviles, sistemas embebidos o servicios de inferencia en tiempo real. Al estar disponible bajo licencia Apache 2.0, puede integrarse libremente en proyectos comerciales y académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (bloques residuales invertidos con convoluciones depthwise) |
| Parametros totales | No disponible (arquitectura base MobileNetV2, ~3.5 millones en FP32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 (pesos) y UINT8 (activaciones), QOperator |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional que utiliza bloques residuales invertidos: en lugar de expandir primero el número de canales, reduce la dimensionalidad mediante convoluciones depthwise y pointwise. Esta estructura permite reducir drásticamente el número de parámetros y operaciones en comparación con redes tradicionales como VGG o ResNet, manteniendo un buen rendimiento en clasificación de imágenes. El modelo original fue entrenado en ImageNet-1K, con 1,28 millones de imágenes de entrenamiento y 50.000 de validación, durante aproximadamente 200 épocas.

La versión cuantizada se ha generado mediante cuantización estática: los pesos se convierten a INT8 y las activaciones a UINT8, utilizando el formato QOperator de ONNX. Esto implica que las operaciones convolucionales y de activación se ejecutan con aritmética de enteros, lo que reduce la huella de memoria y permite el uso de instrucciones SIMD en CPUs modernas. No se han publicado detalles sobre el proceso de entrenamiento o calibración específico de esta cuantización, más allá de que se parte del modelo FP32 de ONNX Model Zoo.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet (incluye objetos, animales, vehiculos, escenas naturales, etc.).
- Extraccion de caracteristicas de nivel medio y alto para tareas de vision por computador (si se usa como backbone).
- Inferencia eficiente en CPU gracias a la cuantizacion INT8/UINT8, con latencia reducida y menor consumo de memoria.
- Compatible con ONNX Runtime, lo que permite ejecucion en multiples plataformas (Windows, Linux, macOS, iOS, Android, web mediante WebAssembly).
- No incluye capacidades de deteccion de objetos ni segmentacion; es exclusivamente un clasificador de imagenes.
- No soporta tool calling, agentes ni razonamiento multilingue.

## Casos de uso

- **Clasificacion de imagenes en aplicaciones moviles**: El modelo puede integrarse en apps de Android o iOS mediante ONNX Runtime Mobile, permitiendo clasificar fotos en tiempo real sin conexion a internet. Su tamano reducido (menos de 10 MB en INT8) es ideal para entornos con memoria limitada.
- **Sistemas de moderacion de contenido**: En plataformas que reciben imagenes de usuarios, el modelo puede filtrar automaticamente contenido no apropiado clasificando las imagenes en categorias como violencia, desnudez o spam. Su baja latencia permite procesar miles de solicitudes por segundo en un servidor CPU.
- **Control de calidad industrial**: En fabricas, el modelo puede clasificar piezas o productos en lineas de produccion, detectando defectos o categorizando productos segun su aspecto. La cuantizacion permite ejecutarlo en PLC o sistemas embebidos con CPUs de bajo consumo.
- **Automatizacion de procesos de archivo**: Organizacion de bibliotecas de imagenes en empresas o instituciones, clasificando fotos por contenido (paisaje, personas, vehiculos) para su posterior etiquetado y busqueda. La inferencia se puede integrar en pipelines de procesamiento por lotes con Python.
- **Asistencia a personas con discapacidad visual**: El modelo puede servir como base para aplicaciones de descripcion de imagenes, clasificando la escena y luego generando una descripcion textual mediante un modelo de lenguaje, todo en un dispositivo movil.
- **Prototipado rapido de sistemas de vision**: Al ser un modelo de clasificacion de referencia, se puede usar como baseline para comparar tecnicas de cuantizacion o como modulo inicial en un pipeline de vision por computadora antes de sustituirlo por un modelo mas complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precision (top-1 o top-5 en ImageNet), latencia ni throughput para esta version cuantizada. La precision esperada es ligeramente inferior a la del modelo FP32 original, que alcanza un top-1 del 71,8 % y top-5 del 91,0 % en ImageNet, pero no se ha verificado experimentalmente en este modelo.

## Requisitos de hardware

- **VRAM**: No requiere VRAM dedicada si se ejecuta en CPU. El modelo completo en INT8 ocupa aproximadamente 4 MB de RAM, aunque el tamano exacto no esta especificado en el repositorio.
- **GPU recomendadas**: No necesita GPU; funciona en cualquier CPU con soporte para instrucciones AVX2 o NEON (ARM). En GPU, puede ejecutarse en CUDA, pero no es el caso de uso principal.
- **Compatibilidad con GPU de consumo**: Si se desea usar GPU, funciona en GPUs antiguas como NVIDIA GTX 1060 o superiores, pero la cuantizacion no ofrece una ventaja significativa frente a FP32 en GPU.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#, Java), ONNX Runtime Web (WebAssembly), ONNX Runtime Mobile para Android/iOS, y tambien puede convertirse a TensorRT o OpenVINO para optimizaciones adicionales.
- **Latencia y throughput estimados**: No disponibles. En una CPU moderna (Intel Core i7 de 8 generacion), se espera una latencia de inferencia de 1-5 ms por imagen, con un throughput de 200-500 imagenes por segundo en batch, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Cuantizacion | Licencia | Precision (top-1) |
|---|---|---|---|---|---|---|
| **MobileNetV2 INT8 (este)** | MobileNetV2 | ~3.5M | ONNX | INT8/UINT8 | Apache 2.0 | No disponible |
| **MobileNetV2 FP32 (ONNX Model Zoo)** | MobileNetV2 | ~3.5M | ONNX | FP32 | Apache 2.0 | 71.6 % |
| **ResNet-50 INT8** | ResNet-50 | 25.6M | ONNX | INT8 | Apache 2.0 | ~75 % |
| **EfficientNet-Lite0** | EfficientNet | 4.7M | ONNX | FP32 | Apache 2.0 | 77.0 % |

La comparativa muestra que MobileNetV2 es mas ligero que ResNet, pero con menor precision. La version cuantizada no tiene datos de precision publicados, por lo que no se puede comparar directamente con las versiones FP32.

## Limitaciones y advertencias

- **Pérdida de precision por cuantizacion**: La cuantizacion INT8 introduce una degradacion de la precision respecto al modelo FP32 original, que puede ser de 1-2 puntos porcentuales en top-1, aunque no se ha medido en este modelo.
- **Solo clasificacion**: No realiza deteccion de objetos ni segmentacion semantica. Para esas tareas es necesario un modelo diferente.
- **Limitacion de clases**: Solo reconoce las 1000 categorias de ImageNet. No cubre objetos fuera de ese conjunto.
- **Sesgos de ImageNet**: El modelo puede mostrar sesgos culturales y de representacion presentes en el dataset, como sobrerrepresentacion de objetos y escenas de paises occidentales.
- **Riesgo de alucinacion**: No aplica, al ser un modelo discriminativo sin generacion de texto.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base de ONNX Model Zoo proviene de Google, que tambien esta bajo Apache 2.0. No hay restricciones adicionales.
- **Documentacion incompleta**: No se especifican el proceso de calibracion para la cuantizacion ni los scripts de validacion, lo que dificulta reproducir los resultados o evaluar la calidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-int8-uint8-onnx)
- [Version FP32 del modelo](https://huggingface.co/ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-fp32-onnx)
- [ONNX Model Zoo (repositorio original)](https://github.com/onnx/models)
- [Archivo original del modelo MobileNetV2-12](https://github.com/onnx/models/blob/main/validated/vision/classification/mobilenet/model/mobilenetv2-12.onnx)
- [Pagina de ONNX Runtime Models](https://onnxruntime.ai/models)
