# moonbox-dev/BiRefNet_lite-ONNX

## Resumen

BiRefNet_lite-ONNX es una compilación en formato ONNX del modelo BiRefNet_lite, una variante ligera de BiRefNet (Bilateral Reference Network), una arquitectura de segmentación dicotómica de imágenes de alta resolución orientada a la eliminación de fondos y la generación de mattes de alta calidad. El modelo original lo desarrolla Peng Zheng y colaboradores (Universidad de Nankai, Universidad Politécnica del Noroeste, entre otras instituciones), y esta compilación la publica moonbox-dev para su uso en dispositivos con ONNX Runtime (CUDA, DirectML y CPU).

El modelo resuelve la tarea de segmentación de primer plano y fondo con un único grafo que produce directamente un matte (máscara alfa con sigmoide aplicada). Su interés práctico reside en que ofrece tres precisiones cuantizadas (fp16, int8 e int4) con tamaños de entre 82 y 114 MB, lo que permite ejecutarlo en entornos con recursos limitados manteniendo una calidad muy próxima al grafo fp32 de referencia.

La arquitectura subyacente es BiRefNet_lite, que emplea un backbone Swin-T (Swin Transformer Tiny) y es aproximadamente cuatro veces más pequeña que el BiRefNet completo. La entrada es de 1024 x 1024 píxeles RGB normalizada con estadísticas de ImageNet. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet_lite (Bilateral Reference Network con backbone Swin-T) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1024 x 1024) |
| Tipos de cuantizacion | fp32 (referencia), fp16, int8 (weight-only, QDQ estático), int4 (MatMulNBits, bloque 32) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` por carpeta de precisión) |

## Arquitectura y entrenamiento

BiRefNet_lite se basa en una arquitectura de referencia bilateral para segmentación dicotómica de imágenes de alta resolución. El backbone es Swin-T (Swin Transformer Tiny), lo que reduce el tamaño del modelo aproximadamente cuatro veces respecto al BiRefNet completo. El grafo ONNX publicado produce una única salida: el matte con sigmoide ya aplicada, con una entrada RGB de 1024 x 1024 normalizada con media y desviación típica de ImageNet.

Las versiones cuantizadas se generaron a partir de un grafo ONNX fp32 oficial (`BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx`, publicado en la release v1 del repositorio GitHub de BiRefNet). La versión fp16 se obtuvo con onnxconverter-common manteniendo entradas y salidas en fp32; la int8 con cuantización estática QDQ de ONNX Runtime (pesos int8 por canal, activaciones uint8, calibración MinMax sobre imágenes fuera del conjunto de evaluación); y la int4 con MatMulNBits de ONNX Runtime (weight-only, bloque 32) para las multiplicaciones matriciales, dejando el resto de pesos convolucionales en int8 weight-only. No se publicó bf16 porque el proveedor CUDA de ONNX Runtime no dispone de convolución en bf16. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Segmentación dicotómica de imágenes: separación de primer plano y fondo con generación de matte alfa de alta calidad.
- Eliminación de fondos: produce una máscara alfa directamente utilizable para recortes con transparencia.
- Segmentación de alta resolución: entrada de 1024 x 1024 con salida redimensionable a la resolución original.
- Inferencia en dispositivo: compatible con ONNX Runtime en CUDA, DirectML y CPU.
- Tres precisiones disponibles con distinto equilibrio entre tamaño y fidelidad respecto a fp32.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Eliminación de fondos en aplicaciones de fotografía: el modelo genera un matte alfa directamente a partir de una imagen RGB de 1024 x 1024, adecuado para herramientas de edición que necesitan recortes con transparencia en local.
- Procesamiento por lotes en servidores con GPU: con la versión fp16 se obtienen tiempos de unos 372 ms por imagen en una RTX 3080 Laptop, lo que permite procesar catálogos de productos de forma masiva.
- Edición de imagen en dispositivo (móvil o escritorio): la versión int8 (92 MB) o int4 (82 MB) permite integrar la eliminación de fondos en aplicaciones locales sin depender de la nube, usando ONNX Runtime con DirectML o CPU.
- Generación de recortes para comercio electrónico: separación del producto respecto al fondo para composición sobre fondos blancos o plantillas, con una calidad medida de S-measure 0.939 y max F 0.945 en DIS5K.
- Preprocesado para pipelines de visión por computador: generación de máscaras de primer plano que alimenten etapas posteriores de detección, clasificación o composición.
- Creación de contenido y vídeo: extracción de mattes por fotograma para composición o superposición de elementos, con la versión int8 como opción de compromiso entre velocidad (420 ms) y fidelidad (IoU 0.9972 frente a fp32).
- Prototipado rápido con ONNX Runtime: el formato de grafo único simplifica la integración en aplicaciones Python o C++ sin necesidad de frameworks de deep learning completos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos de test de DIS5K (250 imágenes: DIS-TE1 a DIS-TE4 y DIS-VD, 50 cada uno), con ONNX Runtime 1.30 y proveedor CUDA sobre una RTX 3080 Laptop. Las máscaras se redujeron a un máximo de 2048 px en el lado largo y se evaluaron con PySODMetrics.

| Precision | Tamano | vs fp32 (IoU de máscara, MAE) | MAE | S-measure | max F | Tiempo por imagen | VRAM pico |
|---|---|---|---|---|---|---|---|
| fp32 (referencia, no publicado) | 224 MB | - | 0.0171 | 0.939 | 0.945 | 438 ms | 6.7 GB |
| fp16 | 114 MB | IoU 0.9981, MAE 0.0002 | 0.0171 | 0.939 | 0.945 | 372 ms | 5.8 GB |
| int8 | 92 MB | IoU 0.9972, MAE 0.0004 | 0.0171 | 0.939 | 0.945 | 420 ms | 6.4 GB |
| int4 | 82 MB | IoU 0.9762, MAE 0.0034 | 0.0172 | 0.939 | 0.944 | 422 ms | 6.5 GB |

No se han publicado en la información disponible resultados comparativos con otros modelos de segmentación (por ejemplo, U2-Net o el BiRefNet completo) más allá de la referencia al tamaño relativo (BiRefNet_lite es unas cuatro veces más pequeño que BiRefNet).

## Requisitos de hardware

- VRAM estimada para inferencia: 5.8 GB en fp16, 6.4 GB en int8 y 6.5 GB en int4 (medidos como pico en RTX 3080 Laptop a 1024 x 1024); el grafo fp32 de referencia requiere 6.7 GB.
- GPU recomendadas: RTX 3080 Laptop es la referencia medida; por el uso de memoria, se recomienda al menos 8 GB de VRAM para ejecución en GPU con comodidad.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de consumo con 8 GB o más de VRAM; también puede ejecutarse en CPU mediante el proveedor CPUExecutionProvider de ONNX Runtime, y en Windows mediante DirectML.
- Opciones de despliegue: ONNX Runtime (CUDAExecutionProvider, DirectMLExecutionProvider, CPUExecutionProvider). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: entre 372 ms (fp16) y 438 ms (fp32) por imagen de 1024 x 1024 en RTX 3080 Laptop; int8 e int4 rondan los 420 ms. No se publican cifras de throughput agregado ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet_lite-ONNX (este) | no disponible (backbone Swin-T) | Imagen 1024 x 1024 | DIS5K: MAE 0.0171, S 0.939, max F 0.945 (fp16/int8) | MIT | Hugging Face, formato ONNX |
| BiRefNet (completo) | no disponible | Imagen de alta resolución | no disponible en la información proporcionada | MIT (según el modelo original) | Hugging Face / GitHub |
| BiRefNet_lite (original) | no disponible (Swin-T) | Imagen 1024 x 1024 | no disponible en la información proporcionada | MIT | Hugging Face |

No se dispone de datos de benchmarks de alternativas como U2-Net u otros modelos de eliminación de fondos en la información proporcionada, por lo que la comparación cuantitativa con ellos queda como no disponible.

## Limitaciones y advertencias

- Alucinación y errores de segmentación: como todo modelo de segmentación, puede producir mattes incorrectos en imágenes con bordes ambiguos, objetos transparentes, pelo fino o fondos de color similar al sujeto; el MAE de 0.0171 en DIS5K indica un error medio no despreciable.
- Resolución de entrada fija: el grafo espera 1024 x 1024; el matte debe redimensionarse a la resolución original, lo que puede introducir pérdida de detalle en imágenes muy grandes.
- Sesgos del dataset: no se dispone de información sobre la composición del conjunto de entrenamiento ni sobre posibles sesgos demográficos o de dominio (tipos de objeto, iluminación, etc.).
- Limitaciones de idioma: no aplica, ya que el modelo no procesa texto; no obstante, no se documentan capacidades multilingües.
- Licencia: MIT, que permite uso comercial y modificación, pero los archivos son un derivado del modelo original y heredan su licencia; debe conservarse el aviso de copyright correspondiente.
- Cuantización int4: la fidelidad frente a fp32 cae a IoU 0.9762 y MAE 0.0034, un deterioro mayor que en fp16 e int8; para producción con requisitos estrictos de calidad se recomienda fp16 o int8.
- Ausencia de bf16: no se publica versión bf16 por limitaciones del proveedor CUDA de ONNX Runtime para convoluciones.
- Advertencia de producción: las cifras de latencia y VRAM se midieron en una GPU concreta (RTX 3080 Laptop); el rendimiento puede variar en otros hardware y proveedores de ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet_lite-ONNX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Paper (arXiv:2401.03407): https://arxiv.org/abs/2401.03407
- Repositorio GitHub de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Release v1 de BiRefNet (grafo ONNX fp32 de origen): https://github.com/ZhengPeng7/BiRefNet/releases/tag/v1
- Dataset DIS5K: https://github.com/xuebinqin/DIS
