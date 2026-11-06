# software-mansion/U2NetP-ExecuTorch

## Resumen

U²-Netp (U2NetP) es una versión ligera del modelo de segmentación de objetos salientes U²-Net, exportada por Software Mansion como programas ExecuTorch `.pte` listos para ejecutarse en dispositivos móviles mediante la librería React Native ExecuTorch. El modelo predice una máscara suave del objeto en primer plano más saliente de una imagen (personas, animales o productos), sin clasificar categorías ni separar instancias individuales.

Su relevancia reside en el nicho de la segmentación en el dispositivo (on-device) para aplicaciones React Native en iOS y Android: los pesos ocupan entre 2,4 y 5,5 MB según la variante, lo que permite integrar recorte de fondos y composición de imágenes en apps móviles sin depender de servicios en la nube. El repositorio ofrece variantes para los backends CoreML (fp16/fp32), XNNPACK (fp32 e int8 selectivo) y Vulkan (fp16), con mediciones de latencia en Apple M1 Pro y Galaxy S20+.

El modelo original se basa en una arquitectura U-Net en anidada (nested U-structure) descrita en el paper de U²-Net; la revisión exportada es `ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29` del repositorio upstream. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net (U-Net anidada) para deteccion de saliencia |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | fp32, fp16, int8 selectivo (cuatro convoluciones con activaciones INT8 estaticas y pesos INT8 por canal) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (programas serializados por backend) |

## Arquitectura y entrenamiento

U²-Net es una arquitectura de tipo encoder-decoder basada en bloques RSU (Residual U-blocks), que anidan estructuras U-Net dentro de cada bloque para capturar contexto multi-escala con un coste computacional bajo. La variante "p" (petite) es la reduccion ligera del modelo original, pensada para ejecucion eficiente en movil. La exportacion a ExecuTorch integra en el grafo el escalado por maximo de la imagen y la normalizacion con estadisticas de ImageNet.

La entrada es un tensor RGB float32 de forma `[1,3,320,320]` con valores en `[0,1]`, y la salida un mapa de logits de primer plano de forma `[1,1,320,320]`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens/imagenes ni el proceso de entrenamiento del modelo upstream; el repositorio solo documenta la exportacion. La variante INT8 cuantiza de forma selectiva cuatro convoluciones costosas (activaciones INT8 estaticas, pesos INT8 por canal), manteniendo en FP32 las capas sensibles y las skip connections, con tipos de entrada y salida sin cambios. La cuantizacion INT8 de la red completa no se ha publicado porque pierde detalle sustancial del primer plano.

## Capacidades

- Segmentacion de objetos salientes: genera una mascara suave (soft mask) del primer plano mas prominente, incluyendo personas, animales y productos.
- Salida lista para composicion: React Native ExecuTorch aplica sigmoide y devuelve una mascara RGBA en escala de grises opaca; la intensidad del primer plano puede usarse como canal alfa para recortar y componer la imagen original.
- Preprocesamiento integrado en el grafo: escalado por maximo y normalizacion ImageNet incluidos en la exportacion.
- Ejecucion multiplataforma en dispositivo: variantes para CoreML (iOS/macOS), XNNPACK (CPU) y Vulkan (GPU Android).
- No clasifica categorias de objetos ni separa instancias multiples: produce una sola mascara de saliencia.

## Casos de uso

- Recorte de fondo en apps moviles: la mascara alfa generada permite componer el sujeto sobre fondos nuevos directamente en React Native, sin subir imagenes a un servidor, gracias a los 2,4-5,5 MB de tamano del modelo.
- E-commerce: recorte automatico de productos fotografiados por el usuario para generar imagenes de catalogo con fondo uniforme.
- Edicion fotografica en el dispositivo: seleccion de sujetos (personas, animales) para aplicar efectos, desenfoque de fondo o stickers.
- Videoconferencia o camara con fondo virtual: segmentacion de la persona en primer plano como paso previo a la sustitucion del fondo, aprovechando la variante INT8 selectiva (189 ms de mediana en Galaxy S20+).
- Creacion de avatares y retratos: extraccion del sujeto para composiciones en apps sociales.
- Preprocesamiento para pipelines de vision en movil: la mascara de saliencia como entrada a modelos posteriores de reconocimiento o clasificacion sobre el objeto recortado.
- Prototipado rapido de funciones de segmentacion en React Native: integracion con una sola llamada (`useSemanticSegmenter` con `models.semanticSegmentation.U2NETP.DEFAULT`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.), al tratarse de un modelo de segmentacion. Los datos disponibles son mediciones de latencia y de concordancia entre exportaciones:

| Medicion | Valor |
|---|---|
| XNNPACK int8 selectivo vs fp32 (Apple M1 Pro, mediana) | 87 ms vs 156 ms (1,78x mas rapido; 30 ejecuciones tras 5 de calentamiento) |
| IoU medio de la mascara int8 vs fp32 (13 imagenes fuera de calibracion, umbral 0,5) | 0,9953 (minimo 0,9868) |
| Vulkan fp16, Galaxy S20+ (mediana) | 337 ms |
| XNNPACK fp32, Galaxy S20+ (mediana) | 316 ms |
| XNNPACK int8 selectivo, Galaxy S20+ (mediana) | 189 ms |
| IoU medio de la mascara Vulkan fp16 vs fp32 (13 imagenes) | 0,9945 (minimo 0,9854) |

Estas cifras miden la concordancia entre exportaciones, no la precision frente a mascaras ground-truth.

## Requisitos de hardware

- Tamano de los pesos: entre 2,4 MB (Vulkan fp16) y 5,5 MB (CoreML fp32); no requiere GPU de servidor, esta pensado para ejecucion en dispositivo movil.
- iOS/macOS: la variante CoreML requiere iOS 18 o macOS 15 o posteriores; dispositivos con chip Apple (las mediciones de referencia son sobre Apple M1 Pro).
- Android: la variante XNNPACK ejecuta en CPU de cualquier dispositivo Android razonablemente moderno; la variante Vulkan requiere GPU compatible (mediciones de referencia en Galaxy S20+ con Mali).
- No aplica VRAM de servidor ni GPUs tipo A100/H100/RTX 4090: el consumo de memoria en movil no se detalla en la documentacion.
- Despliegue: exclusivamente mediante el runtime ExecuTorch v1.4.1 (sin garantia de compatibilidad con runtimes anteriores) y, de forma integrada, a traves de la libreria React Native ExecuTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 87 ms (int8 selectivo) a 156 ms (fp32) por imagen en Apple M1 Pro; 189-337 ms por imagen en Galaxy S20+ segun variante.

## Comparativa con modelos similares

| Modelo | Tarea | Tamano pesos | Backend/plataforma | Licencia |
|---|---|---|---|---|
| U2NetP-ExecuTorch (este) | Segmentacion de saliencia en movil | 2,4-5,5 MB | ExecuTorch (iOS/Android) | Apache 2.0 |
| U²-Net (upstream) | Deteccion de saliencia (SOD) | no disponible | PyTorch, escritorio/servidor | no disponible en la informacion proporcionada |
| MobileNet-based salient object detection | Segmentacion ligera | no disponible | variado | no disponible |

No se dispone de datos de rendimiento comparables publicados en la informacion proporcionada para otras alternativas.

## Limitaciones y advertencias

- Puede omitir estructuras finas en la mascara; no es adecuado cuando se requiere precision extrema en los bordes sin revision posterior.
- La variante fp16 favorece velocidad y puede desplazar los limites de la mascara; fp32 preserva mejor la referencia.
- La cuantizacion INT8 de la red completa no esta disponible porque pierde detalle sustancial del primer plano; solo existe la version selectiva.
- No clasifica categorias de objetos ni separa instancias multiples; si se necesita segmentacion por instancias, este modelo no es suficiente.
- Las mediciones de latencia son especificas de Apple M1 Pro y Galaxy S20+; el rendimiento variara en otros dispositivos y requiere validacion en el hardware objetivo.
- ExecuTorch no ofrece garantia de compatibilidad hacia adelante: un runtime anterior a v1.4.1 puede no cargar los ficheros `.pte`.
- La variante CoreML exige iOS 18 / macOS 15 o superior.
- Las metricas de IoU miden concordancia entre exportaciones, no precision frente a ground-truth.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar la licencia del modelo upstream U²-Net para el entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/software-mansion/U2NetP-ExecuTorch
- Repositorio upstream U²-Net: https://github.com/xuebinqin/U-2-Net
- React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de React Native ExecuTorch (descarga de modelos): https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
