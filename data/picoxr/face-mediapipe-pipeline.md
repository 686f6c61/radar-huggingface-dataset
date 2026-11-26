# picoxr/face-mediapipe-pipeline

## Resumen

Face MediaPipe Spatial Pipeline es un paquete precompilado de SpatialML publicado por picoxr que empaqueta el modelo MediaPipe Face detection en formato TFLite junto con las definiciones de pipeline necesarias para ejecutarlo en modo espacial mediante SecureMR. No se trata de un modelo de lenguaje ni de un modelo generativo: es un artefacto de despliegue orientado a la deteccion de rostros en aplicaciones de realidad mixta construidas con el Spatial SDK de PICO.

El paquete resuelve un problema de integracion: en lugar de obligar al desarrollador a ensamblar manualmente el modelo, el preprocesado, la inferencia LiteRT y el postprocesado SSD, el repositorio entrega un ZIP con el modelo serializado, dos pipelines JSON (`detection` y `display`), metadatos de manifiesto y recursos glTF de renderizado. El cargador de paquetes del SDK lee el `manifest.json`, valida el soporte del modo `spatial` y materializa los tensores globales de entrada y salida.

La relevancia es acotada pero concreta: permite incorporar deteccion facial con proyeccion a espacio 3D de camara en apps Android de Spatial SDK sin escribir el grafo de inferencia desde cero. El repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y no declara pipeline en Hugging Face, por lo que debe tratarse como un recurso de integracion mas que como un modelo publicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MediaPipe Face detection (detector SSD sobre backbone convolucional, inferido via LiteRT/TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `face_detector.tflite`; no se detalla el esquema de cuantizacion interna) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) empaquetado en ZIP junto con JSON de pipeline y glTF |
| Entrada del modelo | Tensor RGB float de 256x256 generado a partir de la imagen de la camara izquierda VST |
| Salida | Tensor `post_det` con la mejor deteccion SSD decodificada |
| Modos de runtime | `spatial` (declarado en `runtime.supported_modes`) |
| Version de esquema del manifiesto | schema v2 |
| Libreria | spatialml |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El artefacto no entrena ningun modelo nuevo: reutiliza el modelo MediaPipe Face detection en TFLite, un detector tipo SSD que opera sobre una imagen de entrada de 256x256 en RGB float. El paquete define dos pipelines de SpatialML. El pipeline `detection` accede a los tensores de la camara VST, aplica preprocesado afin y conversion de color sobre la imagen de la camara izquierda, ejecuta la inferencia LiteRT y decodifica la mejor deteccion SSD escribiendo el tensor `post_det`.

El pipeline `display` consume `post_det` junto con la imagen VST, la marca de tiempo y los tensores de matriz de camara, convierte el centro del rostro detectado en espacio de imagen a espacio 3D de camara y emite `frame_pose` y `frame_gltf` para el renderizado. El recurso `gltf/frame.gltf` se ancla a la pose calculada, de modo que el marco visual sigue al rostro en el espacio volumetrico. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo esperable al tratarse de un detector de vision preentrenado y no de un modelo generativo.

## Capacidades

- Deteccion de rostros en imagenes de camara VST con entrada RGB de 256x256.
- Decodificacion de detecciones SSD y seleccion de la mejor deteccion por frame.
- Proyeccion del centro del rostro detectado desde espacio de imagen a espacio 3D de camara.
- Generacion de una pose (`frame_pose`) para anclar geometria glTF al rostro.
- Renderizado de un asset glTF (`frame.gltf`) siguiendo la pose calculada.
- Integracion con el cargador de paquetes de SpatialML mediante `loadPipelinePackageFromAssets`.
- Ejecucion en modo espacial con sesiones volumetricas y `.addPortal()` para mostrar la vista de camara.
- Orquestacion por frame mediante encadenamiento de tareas (`submit` con dependencia de la tarea anterior).
- No soporta generacion de texto, razonamiento, codigo, tool calling ni capacidades multilingues.

## Casos de uso

- Seguimiento facial en apps de realidad mixta: el pipeline `display` proyecta el centro del rostro a espacio 3D y ancla el `frame.gltf`, lo que permite superponer marcos o etiquetas que siguen al usuario en el espacio volumetrico.
- Efectos de realidad aumentada sobre el rostro: usando `frame_pose` como transformacion, se pueden colocar mascaras, filtros o insignias glTF que se mantienen alineadas con la deteccion por frame.
- Telepresencia y videollamadas espaciales: la deteccion por frame permite recortar, centrar o resaltar la region facial en la vista de camara VST antes de transmitirla.
- Analitica de atencion en entornos controlados: contar rostros detectados por frame y registrar su posicion 3D para estudiar patrones de presencia en una sala o exposicion.
- Prototipado rapido de experiencias Spatial SDK: el paquete se extrae en `app/src/main/assets/SpatialML/face-mediapipe-pipeline/` y se carga con el loader, lo que reduce el trabajo de integracion a la orquestacion de tareas por frame.
- Base para pipelines propios de vision: los JSON `face_detection_pipeline.json` y `face_display_pipeline.json` sirven como plantilla para sustituir el modelo TFLite por otro detector o para anadir etapas de postprocesado manteniendo el esquema de manifiesto v2.
- Validacion de integracion SecureMR: util para verificar que el runtime espacial, la sesion volumetrica y el encadenado de tareas funcionan correctamente antes de incorporar logica de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision, recall, latencia ni throughput, y no se declaran comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un detector TFLite de vision de 256x256, la huella de memoria es reducida, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible. El paquete esta orientado a dispositivos PICO con Spatial SDK y runtime SecureMR; no se especifican modelos de GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible. El despliegue previsto es en hardware espacial PICO, no en GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: SpatialML con SecureMR en modo `spatial`, cargando el paquete mediante `SpatialMLSession.loadPipelinePackageFromAssets` desde los assets de la app Android. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles. El SDK requiere esperar a que `SpatialMLInstance.ready` sea verdadero antes de crear la sesion y encadena las tareas `detection`, `display` y `framePipeline` por frame, pero no se publican tiempos medidos.
- Requisito de SDK: el ejemplo de la model card indica que el SDK 6.1.9 requiere una escena explicita para el tensor canonico `is_gltf`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picoxr/face-mediapipe-pipeline | Paquete SpatialML con detector MediaPipe Face en TFLite | Imagen VST RGB 256x256 | `post_det`, `frame_pose`, `frame_gltf` | Apache 2.0 | Hugging Face, 0 descargas |
| MediaPipe Face Detection (Google) | Modelo TFLite original | Imagen RGB | Cajas y keypoints faciales | Apache 2.0 | Distribucion oficial de MediaPipe |
| Alternativas de deteccion facial en TFLite (p. ej. BlazeFace) | Detectores ligeros | Imagen RGB | Cajas y keypoints | Apache 2.0 | Disponibles en repositorios publicos |

La comparativa se limita al ambito de detectores faciales ligeros en TFLite. No se dispone de datos de rendimiento del paquete de picoxr frente a esas alternativas, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes multi-step. Cualquier uso en esos escenarios es inadecuado.
- No se publican metricas de precision, recall ni falsos positivos del detector, por lo que no se puede evaluar su calidad en produccion.
- El paquete declara soporte unicamente para el modo `spatial`; no se documenta compatibilidad con otros modos del runtime.
- Depende de una version concreta del Spatial SDK: la model card menciona que el SDK 6.1.9 exige una escena explicita para el tensor `is_gltf`, lo que puede romper la integracion con otras versiones.
- La deteccion se realiza sobre la camara izquierda VST y una entrada fija de 256x256, lo que limita la resolucion efectiva para rostros lejanos o pequenos.
- Riesgo de sesgo del detector subyacente de MediaPipe en cuanto a demografia, iluminacion y oclusiones; no se documenta ninguna evaluacion de sesgo en este paquete.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado en Hugging Face, lo que indica ausencia de validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el desarrollador debe verificar las condiciones de uso del modelo MediaPipe original y del runtime SecureMR de PICO.
- No se especifican requisitos de memoria ni latencia, lo que dificulta dimensionar el despliegue sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/picoxr/face-mediapipe-pipeline
- Paquete principal: https://huggingface.co/picoxr/face-mediapipe-pipeline/blob/main/face-mediapipe-pipeline.zip
- MediaPipe Face Detection (modelo original): https://developers.google.com/mediapipe/solutions/vision/face_detector
- Documentacion de MediaPipe: https://developers.google.com/mediapipe
- LiteRT (runtime TFLite): https://ai.google.dev/edge/litert
- Spatial SDK de PICO: https://developer.picoxr.com/
