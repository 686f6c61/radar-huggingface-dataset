# chenmohan/web-sdk-pp-detection

## Resumen

El modelo `chenmohan/web-sdk-pp-detection` es un detector de objetos basado en PicoDet-L-320, un modelo ligero de una etapa desarrollado originalmente por PaddleDetection. Este repositorio concreto contiene un candidato a archivo ONNX en FP32 (`picodet-l-320-fp32.onnx`) que ha sido limpiado del postprocesado oficial, con el objetivo de integrarse en un SDK TypeScript para navegador mediante ONNX Runtime Web. El autor, chenmohan, lo presenta como un recurso reproducible local, no como un lanzamiento oficial estable: el `manifest.json` lo mantiene en estado `labs/blocked` y no se ha completado la verificación de licencias ni la compatibilidad total con WebGPU.

La relevancia actual radica en su enfoque: permitir detección de objetos en tiempo real dentro del navegador, sin servidor, usando WASM o WebGPU. Sin embargo, al ser un candidato en fase de validación, su uso en producción no está recomendado hasta que se complete la evidencia de compatibilidad y licencia. No se dispone de información sobre el tamaño del modelo en parámetros, ni sobre el dataset de entrenamiento, ni sobre la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PicoDet-L (backbone LCNet, detector de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (unico archivo ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

PicoDet es una familia de detectores de objetos de una etapa optimizados para eficiencia en dispositivos edge. La variante L-320 utiliza un backbone LCNet (Lightweight Convolutional Network) y una cabeza de detección con anclas, diseñada para equilibrar latencia y precisión en resoluciones de entrada de 320x320 píxeles. El archivo aquí presente es una conversión a ONNX del modelo oficial postprocesado, con el postprocesado eliminado para que el SDK pueda gestionar las salidas de forma flexible.

No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens (no aplica) ni sobre técnicas de alineación como RLHF o DPO. El autor indica que el archivo es un candidato reproducible local, con evidencia de paridad CPU/ORT en tres fixtures, pero no se ha completado la verificación de licencias ni la compatibilidad total con navegadores (solo hay un smoke test en Windows HeadlessChrome con WASM/CPU, sin adapter WebGPU disponible).

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica objetos dentro de una imagen, devolviendo cajas delimitadoras y etiquetas.
- Entrada flexible: el SDK asociado acepta imagenes, Canvas, ImageData, HTMLVideoElement, VideoFrame y Worker, lo que permite integrarse con camaras, video y elementos DOM.
- Salida estructurada: devuelve informacion de modelo, runtime y tiempos de ejecucion, util para depuracion y telemetria.
- Ejecucion en navegador: gracias a ONNX Runtime Web, puede ejecutarse via WASM o WebGPU, sin necesidad de backend.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la deteccion visual.

## Casos de uso

- Deteccion de objetos en aplicaciones web de realidad aumentada: el modelo puede procesar frames de video en tiempo real desde `HTMLVideoElement` o `VideoFrame`, permitiendo superponer anotaciones sobre objetos detectados en el navegador.
- Moderacion de contenido visual en el cliente: al ejecutarse localmente, se pueden filtrar imagenes antes de subirlas a un servidor, reduciendo costes de ancho de banda y latencia.
- Conteo de objetos en imagenes estaticas: util para inventarios o analisis de imagenes medicas, donde se necesita una deteccion rapida sin enviar datos a la nube.
- Prototipado de sistemas de vigilancia ligera: el SDK permite construir demos de deteccion de personas o vehiculos en entornos controlados, con la ventaja de no requerir infraestructura de servidor.
- Educacion y experimentacion: al ser un modelo ONNX, se puede integrar en notebooks o aplicaciones de demostracion para ensenar conceptos de deteccion de objetos y despliegue en edge.
- Integracion con pipelines de vision por computador en el navegador: combinado con otros modelos del mismo autor (como OCR), se pueden construir flujos completos de extraccion de informacion visual sin salir del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona un archivo `picodet-parity.json` con evidencia de paridad CPU/ORT en tres fixtures, pero no se ofrecen metricas de precision (mAP) ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo ONNX FP32, puede ejecutarse en CPU mediante WASM en cualquier navegador moderno, aunque la latencia dependera del dispositivo.
- Para aceleracion por GPU, se requiere un navegador con soporte WebGPU (por ejemplo, Chrome en Windows con adapter disponible). En el smoke test realizado, no habia adapter WebGPU, por lo que solo se valido la ruta WASM/CPU.
- No se dispone de datos de VRAM ni de requisitos de GPU especificos. Al ser un modelo de 320x320, el consumo de memoria es moderado, pero no se cuantifica.
- Opciones de despliegue: el SDK TypeScript usa ONNX Runtime Web, por lo que se integra con bundlers como Vite o Webpack. No se menciona compatibilidad con vLLM, llama.cpp u otros backends de servidor.
- Latencia y throughput: no disponibles. Dependen del hardware del cliente y de la ruta de ejecucion (WASM vs WebGPU).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de deteccion (como YOLO-NAS, EfficientDet o SSD MobileNet) en terminos de rendimiento o precision. El modelo es un candidato no oficial, por lo que no se puede establecer una comparativa fiable sin benchmarks publicados.

## Limitaciones y advertencias

- Estado inmaduro: el archivo es un candidato local reproducible, no un lanzamiento oficial. El `manifest.json` lo mantiene en `labs/blocked`, lo que indica que no debe usarse como modelo estable en produccion.
- Licencia no definida: no se indica la licencia del modelo ni de los pesos. Esto impide su uso comercial sin una verificacion legal previa.
- Compatibilidad de navegador limitada: solo se ha realizado un smoke test en Windows HeadlessChrome con WASM/CPU. No hay evidencia de funcionamiento en WebGPU ni en otros navegadores (Firefox, Safari, etc.).
- Riesgo de sesgos y alucinaciones: al ser un modelo de deteccion, puede fallar en condiciones de iluminacion adversa, oclusiones o clases no representadas en su entrenamiento. No se dispone de informacion sobre el dataset, por lo que no se pueden evaluar sesgos.
- Sin garantias de precision: no se publican metricas de mAP ni resultados en benchmarks estandar, por lo que el rendimiento real es desconocido.
- Dependencia de ONNX Runtime Web: el modelo requiere esta libreria para ejecutarse, lo que anade una dependencia externa y posibles problemas de versionado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chenmohan/web-sdk-pp-detection
- Repositorio GitHub (SDK y documentacion): https://github.com/chenmohan123/web-sdk-PP-Detection
- Documentacion de API (en ingles): https://github.com/chenmohan123/web-sdk-PP-OCRv6/blob/main/docs/en/api.md (referencia del SDK relacionado)
- Perfil del autor en Hugging Face: https://huggingface.co/chenmohan
