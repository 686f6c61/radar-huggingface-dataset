# neptun-org/wam-onnx

## Resumen

El modelo `neptun-org/wam-onnx` es una exportación a ONNX del checkpoint MIT de Watermark Anything (WAM), un sistema de marcas de agua invisibles desarrollado por Meta AI. Este repositorio proporciona los grafos de inferencia del embedder y del detector en formato ONNX, lo que permite ejecutar el modelo de forma nativa con ONNX Runtime sin necesidad de un entorno Python/PyTorch. La relevancia de esta conversión radica en que facilita la integración de capacidades de watermarking en aplicaciones de producción escritas en C++, Rust, Java u otros lenguajes, así como en entornos edge o embebidos donde la dependencia de frameworks pesados es inviable.

El modelo original, `facebook/watermark-anything`, está diseñado para insertar y detectar marcas de agua imperceptibles en imágenes, con aplicaciones en protección de derechos de autor, trazabilidad y autenticidad visual. La versión ONNX mantiene la paridad funcional con el checkpoint PyTorch, con diferencias máximas absolutas de 0.0001873 en el embedder y 0.000016 en el detector, lo que garantiza un comportamiento prácticamente idéntico. El tamaño total del repositorio es de 0.4 GB, con un detector de 373 MB y un embedder de 4.6 MB, ambos con entradas estáticas de 256x256 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (corresponde al modelo Watermark Anything de Meta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportacion ONNX estandar) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se detalla en la documentación proporcionada. Se trata de una conversión directa del checkpoint `wam_mit.pth` del proyecto Watermark Anything de Meta, que emplea una red neuronal para insertar y detectar marcas de agua invisibles en imágenes. El entrenamiento del modelo original se realizó sobre el dataset SA-1B bajo licencia MIT, aunque no se especifican los detalles del proceso de entrenamiento (número de tokens, composición del dataset, técnicas de optimización). La exportación a ONNX se ha verificado localmente contra PyTorch, con diferencias máximas absolutas de 0.0001873 (embedder) y 0.000016 (detector), lo que confirma una paridad numérica muy alta.

Los grafos exportados utilizan entradas estáticas de 256x256 píxeles. El embedder recibe una imagen `[1, 3, 256, 256]` y un mensaje de 32 bits `[1, 32]`, y produce un delta de marca de agua `[1, 3, 256, 256]` que se suma a la imagen original. El detector recibe una imagen y devuelve un mapa de predicciones `[1, 33, 256, 256]`, donde las 32 primeras canales corresponden a los bits del mensaje y la última a la probabilidad de presencia de marca de agua.

## Capacidades

- Insercion de marcas de agua invisibles en imagenes de 256x256 píxeles mediante el embedder.
- Deteccion de marcas de agua y extraccion del mensaje de 32 bits mediante el detector.
- Soporte de mensajes binarios de hasta 32 bits por imagen.
- Inferencia nativa con ONNX Runtime, sin dependencias de PyTorch ni Python.
- Compatible con multiples lenguajes de programacion a traves de las APIs de ONNX Runtime (C++, C#, Java, Rust, etc.).
- Operacion determinista con entradas de tamano fijo, adecuada para pipelines de produccion.

## Casos de uso

- Proteccion de contenido visual en bancos de imagenes: el embedder puede insertar un identificador unico de cliente en cada imagen vendida, permitiendo rastrear filtraciones o usos no autorizados mediante el detector.
- Trazabilidad de imagenes generadas por IA: plataformas que publican imagenes sinteticas pueden marcar cada salida con un codigo de lote, facilitando la auditoria y el cumplimiento de regulaciones de transparencia.
- Verificacion de autenticidad en periodismo: medios de comunicacion pueden marcar sus fotografias antes de publicarlas, y cualquier copia posterior puede verificarse con el detector para confirmar su origen.
- Deteccion de fugas de informacion en entornos corporativos: documentos internos con imagenes marcadas permiten identificar al empleado o canal responsable de una filtracion.
- Autenticacion de documentos escaneados: certificados, contratos o titulos pueden llevar una marca de agua invisible que se verifica con el detector, anadiendo una capa de seguridad frente a falsificaciones.
- Marcado de imagenes en redes sociales: creadores de contenido pueden insertar su identificador en las imagenes que comparten, y luego demostrar la autoría en caso de plagio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento indicada es la diferencia maxima absoluta respecto al modelo PyTorch original, que es de 0.0001873 para el embedder y 0.000016 para el detector, lo que demuestra una paridad numerica casi exacta.

## Requisitos de hardware

- El detector pesa 373 MB y el embedder 4.6 MB, por lo que la inferencia puede ejecutarse en CPU con ONNX Runtime sin problemas de memoria.
- Para aceleracion por GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, dado el tamano reducido del modelo y la resolucion fija de 256x256.
- No se han publicado requisitos oficiales de hardware, pero por las dimensiones del modelo se puede ejecutar en dispositivos edge como Raspberry Pi o sistemas embebidos con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), posible integracion con TensorRT mediante conversion, o uso en aplicaciones moviles con ONNX Runtime Mobile.
- La latencia estimada es de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no se proporcionan datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (watermarking invisible con exportacion ONNX). El modelo original `facebook/watermark-anything` es la referencia directa, pero no se han encontrado alternativas equivalentes en el ecosistema ONNX. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Resolucion fija de 256x256: cualquier imagen debe redimensionarse a este tamano antes de aplicar el embedder o el detector, lo que puede degradar la calidad en imagenes de alta resolucion.
- Solo soporta imagenes, no video ni audio.
- El mensaje esta limitado a 32 bits, lo que restringe la cantidad de informacion que se puede codificar por imagen.
- No se han documentado sesgos especificos, pero al ser un modelo de vision, su rendimiento puede verse afectado por variaciones en iluminacion, compresion o transformaciones geometricas de la imagen.
- La licencia MIT permite uso comercial sin restricciones, pero es responsabilidad del usuario asegurarse de que el uso de marcas de agua cumple con las leyes de propiedad intelectual aplicables.
- La paridad con PyTorch no es exacta (diferencias del orden de 1e-4), por lo que en aplicaciones criticas se recomienda validar los resultados con el modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/neptun-org/wam-onnx
- Repositorio original de Watermark Anything: https://github.com/facebookresearch/watermark-anything
- Model card original de facebook/watermark-anything: https://huggingface.co/facebook/watermark-anything
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
