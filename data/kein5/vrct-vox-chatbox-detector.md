# kein5/vrct-vox-chatbox-detector

## Resumen

VRCT-VOX chatbox detector es un modelo de deteccion de objetos basado en YOLOX-Tiny, desarrollado por kein5 para el proyecto VRCT-VOX. Su funcion es localizar los bocadillos de chat (chatboxes) que aparecen sobre los avatares en capturas de pantalla de VRChat, de modo que el pipeline de OCR posterior pueda leer unicamente el texto del chat y descartar nombres, carteles y menus de la interfaz. No es un modelo de lenguaje ni un OCR completo: es un detector de una sola clase (`chatbox`) que actua como etapa de preprocesado.

El modelo se distribuye como un unico fichero ONNX de 20.184.371 bytes (aproximadamente 20 MB) con pesos en float32. Se trata de una red convolucional YOLOX-Tiny (depth 0.33, width 0.375) afinada desde los pesos COCO originales de Megvii, con una unica clase de salida. El contexto, los idiomas y los parametros totales no se especifican en la model card; el dato de tamano disponible es el del fichero de pesos.

Es relevante para desarrolladores que construyan herramientas de captura o transcripcion de VRChat, porque resuelve un problema muy concreto de delimitacion de region de interes con un modelo ligero (20 MB), licencia MIT y verificación de integridad por SHA-256 en el cliente que lo consume.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Tiny (depth 0.33, width 0.375), red convolucional detectora |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (el fichero publicado es float32) |
| Idiomas soportados | no disponible (detector visual independiente del idioma del texto) |
| Licencia | MIT (pesos base YOLOX bajo Apache-2.0) |
| Formato de pesos | ONNX, opset 17, float32 |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Entrada | `images`: float32 `[1, 3, H, W]`, BGR, rango 0-255 sin normalizacion; H y W dinamicos, multiplos de 32 |
| Preprocesado | Letterbox hasta lado largo 1280, relleno inferior y derecho con valor 114 |
| Salida | `output`: `[1, anchors, 6]` = cx, cy, w, h, objectness, class score, en pixeles de entrada |
| Postprocesado | Score = objectness × class score; NMS no incluido en el grafo; umbral 0.7 y NMS a IoU 0.65 en el cliente VRCT-VOX |
| Clases | 1 (`chatbox`) |
| Tamano del fichero | 20.184.371 bytes |
| SHA-256 | `2fab797de821cc5d1985ede27acc55dd97ea46a1ce2b6aee5c775347e5a501f6` |

## Arquitectura y entrenamiento

La arquitectura es YOLOX-Tiny, un detector de una etapa con cabeza desacoplada (decoupled head) y asignacion de etiquetas tipo SimOTA, en su variante reducida con factor de profundidad 0.33 y de anchura 0.375. Los pesos base son `yolox_tiny.pth` entrenados sobre COCO por Megvii (Apache-2.0), y el afinamiento se realizo con el framework YOLOX en el commit `6ddff48`. La red se exporto a ONNX con opset 17 en float32, con entrada de resolucion dinamica y sin NMS integrado en el grafo.

El conjunto de entrenamiento consta de 631 fotogramas capturados en un mundo de prueba privado, con los clientes de VRChat del propio mantenedor y sin otras personas presentes. El texto del chat se envio por OSC y el hablante cambiaba de avatar cada pocos mensajes. Las cajas se etiquetaron automaticamente a partir de las lineas de texto de PP-OCR que coincidian con el mensaje enviado. El split separa 549 fotogramas para entrenamiento (440 con chatbox) y 82 para validacion (68 con chatbox), tomando bloques completos de un minuto para evitar que fotogramas casi identicos aparezcan en ambos conjuntos. El entrenamiento uso entrada de 1280, 80 epocas, mosaic 0.3, sin mixup, volteo horizontal y jitter HSV. Las imagenes no se publican porque los avatares y escenas pertenecen a sus creadores.

## Capacidades

- Deteccion de bocadillos de chat de VRChat en capturas de pantalla, con una unica clase `chatbox`.
- Salida de cajas delimitadoras en coordenadas de la imagen de entrada, lista para recortar la region que se enviara a OCR.
- Entrada de resolucion dinamica (H y W multiplos de 32), lo que permite adaptar el coste computacional al tamano de la captura.
- Delimitacion de region de interes para descartar nameplates, carteles y menus antes del OCR.
- Integracion prevista como etapa de preprocesado en el pipeline de VRCT-VOX, con descarga bajo consentimiento del usuario y verificacion SHA-256.
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingues propias ni modos de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Transcripcion de chat en VRChat: el detector localiza el bocadillo sobre el avatar y el OCR posterior lee solo esa region, evitando transcribir nombres de usuario o texto de la interfaz. Es adecuado por su tamano reducido y su entrenamiento especifico sobre capturas reales del cliente.
- Herramientas de accesibilidad para personas con dificultades de lectura: recortar y ampliar el texto del chat detectado antes de pasarlo a un sintetizador de voz o a un lector de pantalla.
- Registro y archivo de conversaciones: en sesiones de grabacion, procesar fotogramas periodicamente, detectar el chatbox y almacenar el texto transcrito con marca temporal.
- Moderacion y analisis de contenido: alimentar un pipeline que extraiga el texto de los chatboxes para clasificacion posterior de mensajes, reduciendo falsos positivos al excluir carteles y menus.
- Traduccion en tiempo real: detectar la burbuja, recortarla, aplicar OCR y enviar el texto a un modelo de traduccion, mostrando el resultado superpuesto en la captura.
- Investigacion sobre interacciones sociales en mundos virtuales: extraer de forma automatizada el texto de los chats en conjuntos de capturas para estudios de conducta o de dinamica conversacional.
- Preprocesado en pipelines de vision con ONNX Runtime: al ser un grafo ONNX sin NMS, se puede ejecutar en CPU o GPU con el runtime preferido y aplicar el postprocesado en el cliente, lo que facilita su integracion en aplicaciones de escritorio.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion del autor sobre el split de validacion:

| Metrica | Valor |
|---|---|
| COCO AP (IoU 0.50:0.95), validacion | 0.844 |

Con los ajustes de VRCT-VOX (score 0.7, coincidencia a IoU 0.5 o superior):

| Conjunto de validacion | Chatboxes | Encontrados | Perdidos | Falsos positivos | IoU medio |
|---|---|---|---|---|---|
| Tercera captura (48 fotogramas) | 38 | 38 | 0 | 0 | 0.907 |
| Segunda captura (34 fotogramas) | 30 | 30 | 0 | 0 | 0.918 |

No se han publicado comparaciones con otros detectores ni resultados en conjuntos externos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un fichero de pesos de aproximadamente 20 MB en float32, la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o TensorRT; el modelo es lo bastante pequeno para ejecutarse en GPUs integradas o incluso en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas conocidas dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT tras conversion, o cualquier runtime compatible con ONNX opset 17. No se distribuye en GGUF ni en formatos para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con otros detectores en la informacion disponible. Como referencia estructural, el modelo se basa en YOLOX-Tiny (Megvii, Apache-2.0), pero no se dispone de datos que permitan comparar su rendimiento con el de otros detectores de chatboxes o de burbujas de texto.

| Modelo | Arquitectura | Clases | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| VRCT-VOX chatbox detector | YOLOX-Tiny | 1 (`chatbox`) | MIT | ONNX | AP 0.844 en validacion propia |
| YOLOX-Tiny (COCO, Megvii) | YOLOX-Tiny | 80 | Apache-2.0 | PyTorch / ONNX | no disponible en esta ficha |
| Modelo de chatbox de VRCT upstream | no disponible | no disponible | no disponible | no disponible | no disponible; el autor indica que no se reutilizaron sus pesos ni salidas |

## Limitaciones y advertencias

- Todos los fotogramas de entrenamiento y validacion provienen de un unico mundo de prueba con ocho fondos, dos clientes y el estilo de chatbox por defecto; mundos con iluminacion inusual, postprocesado, chatboxes muy lejanos o mods que alteren el chatbox pueden degradar los resultados.
- El conjunto de datos es muy reducido (631 fotogramas) y las cajas se generaron automaticamente a partir de OCR, lo que puede introducir ruido en las etiquetas.
- Las imagenes de entrenamiento no se publican, lo que dificulta la reproducibilidad y la evaluacion independiente.
- No se incluye NMS en el grafo ONNX: el cliente debe aplicar el postprocesado (umbral de score 0.7 y NMS a IoU 0.65 en la configuracion de referencia) para obtener detecciones utiles.
- La entrada exige formato BGR, rango 0-255 sin normalizacion y dimensiones multiplos de 32; un preprocesado incorrecto invalida las detecciones.
- El modelo solo detecta la clase `chatbox`; no lee texto ni distingue hablantes. Cualquier tarea de transcripcion requiere una etapa de OCR adicional.
- No hay datos publicados sobre sesgos, idiomas o comportamiento en produccion mas alla de la validacion del autor.
- Licencia MIT para este modelo; los pesos base derivan de YOLOX bajo Apache-2.0, por lo que conviene conservar las atribuciones correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kein5/vrct-vox-chatbox-detector
- Repositorio VRCT-VOX: https://github.com/kein5/VRCT-VOX
- Proyecto VRCT upstream: https://github.com/misyaguziya/VRCT
- YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
