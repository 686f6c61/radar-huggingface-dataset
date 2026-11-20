# software-mansion/react-native-executorch-ssdlite320-mobilenet-v3-large

## Resumen

El modelo `ssdlite320-mobilenet-v3-large` publicado por Software Mansion es una exportación del detector de objetos SSDLite320 con backbone MobileNetV3-Large, originalmente definido en `torchvision`, empaquetado como programas ExecuTorch (`.pte`) para su ejecución en dispositivo dentro de la librería React Native ExecuTorch. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional de detección de objetos de una sola etapa (single-shot) pensada para inferencia en movil y en el borde, con un tamaño de repositorio de 0,1 GB y artefactos que van de 8,1 MB (CoreML fp16) a 13,3 MB (XNNPACK fp32).

El modelo resuelve el problema de llevar deteccion de objetos a aplicaciones React Native sin depender de servidores ni de SDK nativos complejos: los `.pte` se cargan directamente en el runtime ExecuTorch y se integran en pipelines de la libreria. Es relevante para desarrolladores de apps moviles que necesitan deteccion en tiempo real con un coste de integracion bajo y un footprint de memoria reducido, y para quienes evaluan alternativas on-device frente a soluciones en la nube.

La informacion disponible es limitada: la model card solo documenta las variantes exportadas, los backends y la compatibilidad con el runtime. No se publican parametros totales, contexto, idiomas ni resultados de benchmarks en la informacion proporcionada, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSDLite320 (detector single-shot) con backbone MobileNetV3-Large; exportado como programa ExecuTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de tokens) |
| Tipos de cuantizacion | fp16 (backend CoreML) y fp32 (backend XNNPACK); no se publican variantes int8 |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase dependen del dataset de entrenamiento upstream) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (CoreML fp16 de 8,1 MB; XNNPACK fp32 de 13,3 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SSDLite320 con backbone MobileNetV3-Large, tal como se define en `torchvision.models.detection.ssdlite320_mobilenet_v3_large`. SSDLite es una variante ligera de SSD que sustituye las convoluciones estandar de la cabeza de prediccion por convoluciones separables en profundidad, reduciendo el coste computacional para despliegue movil. El backbone MobileNetV3-Large aporta bloques con activaciones h-swish y modulos de atencion por squeeze-and-excitation. La entrada se redimensiona a 320 px, de ahi el nombre del modelo.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de imagenes, el numero de clases ni si hubo tecnicas de aumento de datos o destilacion. El autor publica exclusivamente los artefactos de exportacion para ExecuTorch v1.4.1, no el proceso de entrenamiento. La innovacion tecnica relevante aqui no esta en el modelo en si, sino en el pipeline de exportacion: se generan variantes para los backends CoreML (fp16) y XNNPACK (fp32), y se documenta explicitamente un backend MLX que fue exportado pero no publicado, con una nota `NOTES.md` que registra el fallo. El runtime ExecuTorch no ofrece garantia de compatibilidad hacia delante, por lo que los `.pte` estan atados a la version v1.4.1.

## Capacidades

- Deteccion de objetos en imagenes: salida de cajas delimitadoras (bounding boxes) con etiquetas de clase y puntuaciones de confianza.
- Inferencia on-device: ejecucion local en el dispositivo mediante el runtime ExecuTorch, sin llamadas a servidor.
- Compatibilidad con React Native: integracion directa en la libreria React Native ExecuTorch pasando la constante del registro de modelos a la pipeline de tarea correspondiente.
- Soporte de dos backends: CoreML (fp16, para plataformas Apple) y XNNPACK (fp32, backend CPU generico).
- No soporta tool calling ni function calling: es un modelo de vision, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion sobre imagen.

## Casos de uso

- Deteccion de objetos en tiempo real en apps moviles: el modelo procesa imagenes de 320 px con un backbone MobileNetV3-Large optimizado para movil, lo que permite ejecutar deteccion fotograma a fotograma en el dispositivo sin latencia de red.
- Escaneo de documentos y productos en apps React Native: integrado en la pipeline de object detection de React Native ExecuTorch, puede localizar regiones de interes (productos, codigos, elementos de formulario) antes de recortarlas para OCR o lectura de codigos de barras.
- Moderacion de contenido visual en el borde: clasificacion y localizacion de objetos en imagenes subidas por usuarios antes de enviarlas a un servidor, reduciendo trafico y preservando privacidad.
- Automatizacion de inventario con camara: deteccion de articulos en estanterias o almacenes mediante capturas periodicas, con el modelo ejecutandose localmente en dispositivos de bajo coste.
- Asistencia a personas con discapacidad visual: localizacion de obstaculos y objetos cotidianos en el flujo de camara, aprovechando la inferencia on-device y el footprint reducido (8,1-13,3 MB).
- Prototipado rapido de funciones de vision en apps React Native: al venir empaquetado para la libreria, permite validar una funcionalidad de deteccion en pocas horas sin montar infraestructura de servidor.
- Procesamiento por lotes en dispositivos sin GPU dedicada: la variante XNNPACK fp32 funciona sobre CPU generica, adecuada para entornos donde CoreML no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano de los artefactos (8,1 MB fp16 y 13,3 MB fp32) el modelo esta disenado para ejecutarse en memoria de dispositivo movil, no en GPU de servidor.
- GPU recomendadas: no aplica en el sentido habitual; el backend CoreML aprovecha la GPU/NPU de dispositivos Apple y el backend XNNPACK se ejecuta en CPU.
- Cabe en consumer GPU: si, por footprint, pero el destino previsto es movil y embebido; no se documentan requisitos de GPU de escritorio.
- Opciones de despliegue: runtime ExecuTorch v1.4.1 (obligatorio por falta de compatibilidad hacia delante) y la libreria React Native ExecuTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Formato | Contexto / idiomas |
|---|---|---|---|---|---|
| ssdlite320-mobilenet-v3-large (esta ficha) | SSDLite320 + MobileNetV3-Large | 320 px | BSD-3-Clause | ExecuTorch `.pte` (CoreML fp16, XNNPACK fp32) | no disponible |
| Otras exportaciones ExecuTorch de deteccion del mismo autor | no disponible | no disponible | no disponible | ExecuTorch `.pte` | no disponible |
| Detector equivalente en torchvision (upstream) | SSDLite320 + MobileNetV3-Large | 320 px | BSD-3-Clause (torchvision) | PyTorch `.pt` | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos alternativos comparables con metricas; la comparativa se limita a formato, licencia y origen.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; dependen del dataset de entrenamiento upstream de torchvision, que no se documenta en esta model card.
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos y cajas mal localizadas; no se publican curvas de precision ni umbrales recomendados.
- Limitaciones de contexto o idioma: no aplica ventana de contexto; las clases detectables estan fijadas por el modelo upstream y no se enumeran en la informacion disponible.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con obligacion de conservar el aviso de copyright y la clausula de exencion; conviene verificar tambien la licencia del modelo upstream de torchvision.
- Compatibilidad de runtime: los `.pte` estan publicados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia delante; un runtime mas antiguo puede fallar al cargarlos.
- Backend MLX no publicado: existe un directorio `mlx` con `NOTES.md` que documenta un fallo de exportacion; no hay artefacto utilizable para ese backend.
- Ausencia de datos de evaluacion: no se publican benchmarks, latencias ni metricas de precision, lo que dificulta validar el modelo para produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-ssdlite320-mobilenet-v3-large
- Libreria React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Modelo upstream en torchvision: https://pytorch.org/vision/main/models/generated/torchvision.models.detection.ssdlite320_mobilenet_v3_large.html#ssdlite320-mobilenet-v3-large
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-ssdlite320-mobilenet-v3-large/blob/main/mlx/NOTES.md
