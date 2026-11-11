# Intel/face-matching

## Resumen

Face Matching es un caso de uso de analitica de video (etiquetado como "Metro Analytics") publicado por Intel en Hugging Face bajo licencia MIT. No se trata de un modelo generativo ni de un transformer, sino de una pipeline de vision por computador compuesta por dos modelos clasicos del Open Model Zoo de Intel: `face-detection-adas-0001` para la deteccion de rostros y `face-reidentification-retail-0095` para el calculo de embeddings faciales de 256 dimensiones. El objetivo es la verificacion uno-a-uno: dada una imagen de referencia, localizar a esa persona concreta dentro de una escena con multiples individuos y resaltar unicamente la coincidencia.

La relevancia del repositorio es practica mas que cientifica: empaqueta una receta reproducible de inferencia sobre OpenVINO (CPU, GPU integrada y NPU), con scripts de descarga, cuantizacion y un ejemplo en Python, orientada a despliegues en el borde (edge AI) con DLStreamer. Es util para quien necesite montar un sistema de control de acceso, verificacion documental o confirmacion de reidentificacion sin depender de APIs en la nube ni de modelos de gran tamano.

El repositorio tiene un tamano de 0.0 GB (solo scripts y metadatos; los pesos se descargan desde el Open Model Zoo) y un uso muy limitado en la comunidad (23 descargas, 2 likes en el momento de la consulta). La model card advierte explicitamente de que se trata de un stack de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no de una version estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de rostros (face-detection-adas-0001) + extractor de embeddings (face-reidentification-retail-0095) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | FP32, FP16 |
| Idiomas soportados | en (metadato de la model card) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin); modelos base originales en Caffe / PyTorch |
| Framework de inferencia | OpenVINO |
| Hardware soportado | CPU, GPU, NPU |
| Salida de embeddings | 256 dimensiones por rostro |
| Libreria declarada | openvino |
| Pipeline en Hugging Face | image-classification |

## Arquitectura y entrenamiento

La solucion no es un unico modelo entrenado de extremo a extremo, sino una composicion de dos redes convolucionales del Open Model Zoo. La primera, `face-detection-adas-0001`, es un detector de rostros orientado a conduccion autonoma (ADAS) que devuelve cajas delimitadoras con una puntuacion de confianza; el ejemplo aplica un umbral de confianza de 0.5. La segunda, `face-reidentification-retail-0095`, toma cada recorte facial y produce un vector de embedding de 256 dimensiones normalizado, sobre el que se calcula similitud coseno entre la referencia y cada rostro detectado.

La comparacion se resuelve seleccionando el rostro con mayor similitud coseno siempre que supere un umbral de coincidencia (0.5 en el ejemplo). No hay mantenimiento de galeria ni base de datos de identidades: el alcance es la verificacion de una unica referencia. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion o aumentacion mas alla de lo que documenta el Open Model Zoo. Tampoco se documenta RLHF, DPO ni innovaciones de decodificacion, por la naturaleza no generativa del sistema.

## Capacidades

- Deteccion de rostros en imagenes y fotogramas de video con cajas delimitadoras y puntuacion de confianza.
- Extraccion de embeddings faciales de 256 dimensiones por rostro detectado.
- Verificacion uno-a-uno mediante similitud coseno contra una imagen de referencia.
- Seleccion y resaltado del rostro coincidente en escenas con multiples personas.
- Ejecucion en CPU, GPU integrada y NPU mediante el parametro `device` de OpenVINO.
- Integracion con Intel DLStreamer para pipelines de analitica de video.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No soporta vision general (solo rostros), audio ni modo "thinking".

## Casos de uso

- Verificacion de credenciales en tornos de acceso: comparar en tiempo real la cara capturada por la camara de entrada con la fotografia de la tarjeta del empleado, usando el embedding de 256 dimensiones y un umbral de similitud coseno; el despliegue en NPU permite ejecutarlo en equipos de borde sin GPU dedicada.
- Verificacion documental: contrastar la fotografia de un pasaporte o documento de identidad con la imagen del titular capturada en el mostrador, como paso previo a un proceso de alta o embarque.
- Deteccion de duplicados en registros: comprobar si dos fichas con fotografias distintas corresponden a la misma persona calculando la similitud entre sus embeddings, util en tareas de depuracion de bases de datos.
- Confirmacion de reidentificacion: validar manualmente o de forma automatica una alerta generada por un sistema de busqueda previo, comparando la referencia marcada con los rostros presentes en el fotograma.
- Analitica de aforo y presencia en entornos metro: localizar a una persona concreta dentro de una escena con varias personas, integrado en un pipeline de DLStreamer sobre video en directo.
- Prototipado rapido en borde: construir demos de reconocimiento facial sobre portatiles o mini-PC con CPU Intel y NPU, sin necesidad de infraestructura cloud, gracias al ejemplo en Python y al script de descarga y cuantizacion incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; los modelos del Open Model Zoo son ligeros y estan pensados para inferencia en CPU, GPU integrada y NPU, sin necesidad de memoria dedicada.
- GPU recomendadas: no se especifican modelos concretos; la model card remite a la matriz de validacion de dispositivos del repositorio para resultados medidos en CPU, GPU y NPU.
- Cabe en hardware consumer: si, al ejecutarse sobre CPU Intel y NPU/GPU integradas; no requiere GPU dedicada.
- Opciones de despliegue: OpenVINO Runtime (CPU, GPU, NPU), Intel DLStreamer para pipelines de video, y scripts propios en Python con OpenCV para preprocesado.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisitos de software: Python 3.11+, OpenVINO y DLStreamer; el stack objetivo es DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030, marcado como entorno de desarrollo y no estable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intel/face-matching | Pipeline deteccion + reidentificacion (OpenVINO) | no disponible | no aplica | MIT | Hugging Face + Open Model Zoo |
| Intel/facial-recognition (mismo autor) | Pipeline de reconocimiento facial con galeria | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Modelos de reconocimiento facial genericos (p. ej. ArcFace, FaceNet) | Red de embeddings faciales | no disponible | no aplica | variable segun implementacion | Repositorios academicos y frameworks |

La diferencia principal frente a `facial-recognition` del mismo autor es el alcance: face-matching verifica una unica identidad de referencia sin mantener una base de datos de galeria, mientras que el reconocimiento facial completo compara contra un conjunto de identidades registradas. Frente a redes de embeddings como ArcFace o FaceNet, este repositorio no aporta un modelo nuevo, sino una receta de despliegue con OpenVINO y DLStreamer sobre modelos ya existentes del Open Model Zoo.

## Limitaciones y advertencias

- Se trata de un stack de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no de una version estable; no se recomienda para produccion sin validacion previa.
- Uso de datos biometricos: la model card exige cumplir con la normativa aplicable (GDPR, BIPA y equivalentes) y disponer de mecanismos de consentimiento.
- El umbral de coincidencia (0.5 en el ejemplo) es un valor de demostracion; en produccion debe calibrarse con datos propios para controlar falsos positivos y falsos negativos.
- Solo verifica una identidad de referencia; no mantiene galeria ni resuelve identificacion uno-a-muchos.
- Los modelos base estan orientados a deteccion de rostros en entornos ADAS y retail; el rendimiento puede degradarse con oclusiones, angulos extremos, iluminacion adversa o resoluciones bajas.
- El metadato de idioma es "en"; no se documenta soporte multilingue, aunque al ser un modelo de vision el idioma no afecta a la inferencia.
- No se han publicado benchmarks ni metricas de precision en la informacion disponible, por lo que no es posible comparar su exactitud con alternativas.
- Licencia MIT para el repositorio; conviene revisar las licencias de los modelos base del Open Model Zoo antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Intel/face-matching
- Modelo base de deteccion: https://docs.openvino.ai/2024/omz_models_model_face_detection_adas_0001.html
- Modelo base de reidentificacion: https://docs.openvino.ai/2024/omz_models_model_face_reidentification_retail_0095.html
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Caso de uso hermano (facial-recognition): https://huggingface.co/Intel/facial-recognition
