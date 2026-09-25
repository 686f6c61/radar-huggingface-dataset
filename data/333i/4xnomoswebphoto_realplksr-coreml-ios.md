# 333i/4xNomosWebPhoto_RealPLKSR-coreml-ios

## Resumen

Esta ficha describe `333i/4xNomosWebPhoto_RealPLKSR-coreml-ios`, una conversión a Core ML del modelo de superresolución y restauración fotográfica `Phips/4xNomosWebPhoto_RealPLKSR`, desarrollado originalmente por Philip Hofmann (Helaman). No se trata de un modelo de lenguaje, sino de un modelo image-to-image de reescalado 4x orientado a fotografía, con arquitectura RealPLKSR. La conversión ha sido publicada por el usuario 333i y su único propósito es facilitar la ejecución nativa en dispositivos Apple (iOS 16 o superior y macOS 13 o superior) mediante Core ML, sin modificar los pesos originales.

El modelo base fue entrenado sobre el dataset Nomos-v2 (6000 imágenes, sin aumentos on-the-fly) e incorpora degradaciones realistas como ruido, desenfoque de lente y recomposición JPEG y WebP, lo que lo hace adecuado para restaurar fotografías comprimidas o degradadas procedentes de la web. La conversión mantiene fp16 como precisión de cómputo y expone una interfaz de entrada fija de 512 x 512 píxeles RGB con salida de 2048 x 2048 píxeles RGB (factor 4x). Las imágenes mayores se procesan por teselas solapadas con feathering.

Su relevancia actual radica en que permite desplegar un modelo de restauración fotográfica de calidad en el propio dispositivo, sin depender de servidores ni de frameworks de Python, aprovechando CPU, GPU y Neural Engine a través de Core ML. La verificación reportada indica que la salida Core ML coincide con la referencia de PyTorch a 58 dB PSNR o mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RealPLKSR (modelo de superresolucion/restauracion de imagen), convertido a ML Program de Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija de 512 x 512 px) |
| Tipos de cuantizacion | fp16 (ML Program de Core ML); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlpackage` (programa Core ML fp16) y `.mlmodelc` compilado en `.zip`; el modelo original se distribuye como safetensors y `.pth` |
| Escala de reescalado | 4x |
| Entrada | `image`, RGB, 512 x 512 |
| Salida | `upscaled`, RGB, 2048 x 2048 |
| Sistema minimo | iOS 16 / macOS 13 |
| Unidades de computo | Todas (CPU, GPU y Neural Engine) |
| Modelo base | Phips/4xNomosWebPhoto_RealPLKSR |

## Arquitectura y entrenamiento

La arquitectura del modelo original es RealPLKSR, una familia de redes de superresolucion basada en convoluciones de kernel grande con conexiones parciales (partial large kernel), disenada para ofrecer buena calidad de restauracion con un coste computacional contenido. Segun la informacion de OpenModelDB, fue entrenada sobre el dataset Nomos-v2, con un tamano de 6000 imagenes y sin aumentos on-the-fly, y parte de un modelo preentrenado identificado como `4x_realplksr_gan_pretrain`, lo que indica que se empleo entrenamiento adversario (GAN) para mejorar la nitidez percibida. La fecha de publicacion original es el 28.05.2024.

El modelo esta especializado en fotografias degradadas con ruido realista, desenfoque de lente y recompresion JPEG y WebP, lo que lo orienta a la restauracion de imagenes procedentes de la web. La conversion a Core ML se realizo con coremltools 9.0, cargando el checkpoint original en safetensors a traves de spandrel. El envoltorio define la entrada como imagen RGB escalada a [0, 1] y la salida como imagen RGB recortada (clamp) y reescalada de vuelta a [0, 255], de modo que Vision pueda devolver directamente un `VNPixelBufferObservation`. No se ha publicado informacion sobre el numero de parametros, la composicion detallada del dataset ni el numero de tokens o pasos de entrenamiento.

## Capacidades

- Superresolucion de imagen con factor de escala 4x (entrada 512 x 512, salida 2048 x 2048).
- Restauracion fotografica: reduccion de ruido realista, correccion de desenfoque de lente y atenuacion de artefactos de recompresion JPEG y WebP.
- Procesamiento por teselas: las imagenes de mayor tamano se dividen en teselas de 512 x 512 con solapamiento y se recomponen mediante feathering.
- Ejecucion en dispositivo (on-device) mediante Core ML, con acceso a CPU, GPU y Neural Engine.
- Integracion con el framework Vision de Apple para devolver directamente observaciones de pixel buffer.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni generacion de texto, al ser un modelo puramente de vision.

## Casos de uso

- Restauracion de fotos antiguas o degradadas en apps de iOS: el modelo puede recuperar detalle y reducir ruido y artefactos de compresion en fotografias escaneadas o compartidas por mensajeria, ejecutandose localmente gracias a Core ML.
- Edicion fotografica en dispositivo: integrado en una app de retoque, permite aplicar un reescalado 4x sin enviar la imagen a un servidor, preservando la privacidad del usuario.
- Mejora de miniaturas y material grafico web: util para aumentar la resolucion de imagenes de baja calidad descargadas de la web, dado que el modelo fue entrenado especificamente con recompresion JPEG y WebP.
- Procesamiento por lotes en macOS: mediante un script que recorra carpetas y aplique el `.mlmodelc` con teselado solapado, se puede restaurar un catalogo fotografico completo en un Mac con chip M-series.
- Previsualizacion en tiempo real en apps de camara: con un coste aproximado de 135 ms por tesela en un Mac M-series, es viable una previsualizacion interactiva sobre recortes de la imagen.
- Pipelines de impresion o ampliacion fisica: al obtener una salida 4x de 2048 x 2048 por tesela, la imagen resultante puede emplearse en impresion de mayor tamano manteniendo detalle.
- Funcion dentro de una app de escaneo de documentos o fotografias: el modelo puede actuar como paso final de mejora tras el recorte y la correccion de perspectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de superresolucion (PSNR/SSIM/LPIPS frente a otros modelos) en la informacion disponible. El unico dato de rendimiento aportado es la fidelidad de la conversion:

| Metrica | Valor |
|---|---|
| PSNR Core ML vs. referencia PyTorch | 58 dB o mejor en las teselas de prueba |
| Diferencia maxima por canal | 3/255 (dentro del redondeo de fp16) |
| Tiempo por tesela (Mac M-series, todas las unidades) | ~135 ms |

## Requisitos de hardware

- Inferencia en dispositivo Apple: iOS 16 o superior, macOS 13 o superior.
- Unidades de computo: CPU, GPU y Neural Engine (configuracion "All").
- Precision de ejecucion: fp16.
- No requiere VRAM dedicada ni GPUs NVIDIA; el modelo se ejecuta sobre el hardware Apple (Neural Engine y GPU integrada).
- No aplica el despliegue mediante vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Carga en dispositivo mediante `MLModel(contentsOf:)` con el `.mlmodelc` precompilado, o mediante coremltools/Xcode con el `.mlpackage`.
- Rendimiento de referencia: aproximadamente 135 ms por tesela de 512 x 512 en un Mac con chip M-series con todas las unidades habilitadas.
- No se dispone de datos de consumo de memoria, latencia en iPhone ni throughput agregado en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Escala | Licencia | Ejecucion | Notas |
|---|---|---|---|---|---|
| 333i/4xNomosWebPhoto_RealPLKSR-coreml-ios | Core ML (.mlpackage / .mlmodelc) | 4x | CC BY 4.0 | On-device Apple (iOS/macOS) | Conversion; pesos identicos al original |
| Phips/4xNomosWebPhoto_RealPLKSR (original) | safetensors / .pth | 4x | CC BY 4.0 | PyTorch (GPU/CPU) | Modelo de referencia, misma calidad |
| Real-ESRGAN (familia) | .pth / ONNX / otros | 4x | BSD-3 (segun variante) | Multiples backends | Alternativa de restauracion general; no se dispone de comparacion cuantitativa en esta informacion |

No se dispone de datos comparativos de PSNR, SSIM o rendimiento entre este modelo y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de imagen, no genera texto ni mantiene conversaciones; no debe evaluarse con criterios de modelos de lenguaje.
- La entrada esta fijada a teselas de 512 x 512 px; las imagenes mayores requieren teselado con solapamiento y feathering, lo que puede introducir costuras si la implementacion no es cuidadosa.
- El modelo esta especializado en fotografia con degradaciones web (ruido, desenfoque, JPEG, WebP); su comportamiento en otros dominios (ilustracion, capturas de pantalla, imagenes medicas) no esta documentado.
- No se han publicado evaluaciones de sesgos, alucinacion visual ni casos de fallo.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya la autoria a Philip Hofmann y se mantenga la misma licencia en obras derivadas. Es obligatorio conservar el credito.
- La conversion no modifica los pesos, pero el rendimiento puede variar ligeramente respecto a PyTorch debido al redondeo en fp16 (diferencia maxima declarada de 3/255 por canal).
- Requiere iOS 16 / macOS 13 o superior; no es compatible con versiones anteriores.
- No se documenta soporte para GPU NVIDIA, CUDA, ROCm ni despliegues en servidor, por lo que su uso queda restringido al ecosistema Apple.

## Enlaces

- Hugging Face (conversion Core ML): https://huggingface.co/333i/4xNomosWebPhoto_RealPLKSR-coreml-ios
- Modelo original en Hugging Face: https://huggingface.co/Phips/4xNomosWebPhoto_RealPLKSR
- Ficha en OpenModelDB: https://openmodeldb.info/models/4x-NomosWebPhoto-RealPLKSR
- Release en GitHub de los pesos originales: https://github.com/Phhofm/models/releases/tag/4xNomosWebPhoto_RealPLKSR
- Checkpoint en GitHub (espejo, mlx-models): https://github.com/ziyu4huang/video_generation/blob/main/mlx-models/upscale/4x-nomos-webphoto-realplksr/4xNomosWebPhoto_RealPLKSR.pth
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
