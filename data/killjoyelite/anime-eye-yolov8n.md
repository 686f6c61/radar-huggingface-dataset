# killjoyelite/anime-eye-yolov8n

## Resumen

Anime Eye Detector es un modelo de deteccion de objetos basado en YOLOv8, desarrollado por el usuario killjoyelite y publicado en Hugging Face. Su proposito es concreto: localizar los ojos en ilustraciones de personajes de estilo anime y semi-realista, devolviendo cajas delimitadoras (bounding boxes) sobre cada ojo visible. No es un modelo generativo ni un LLM, sino un detector de una sola clase (`eye`) pensado como componente auxiliar dentro de flujos de trabajo de generacion e inpainting de imagenes.

El modelo se ofrece en dos variantes: `yolov8n` (nano) y `yolov8s` (small), ambas derivadas de los pesos preentrenados de Ultralytics y afinadas sobre un conjunto de datos propio de 286 imagenes (version 2.0) generadas por el autor y etiquetadas manualmente. Su relevancia practica radica en que se integra directamente con ComfyUI y el Impact Pack, replicando el rol que cumplen detectores genericos como `face_yolov8n.pt` o `hand_yolov8n.pt`, pero especializado en la region ocular de personajes anime.

La ficha se centra en las dos variantes documentadas por el autor. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su redistribucion dentro de pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de objetos de una etapa, CNN) |
| Parametros totales | no disponible (variantes nano y small de YOLOv8; cifras exactas no publicadas en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` de Ultralytics; no se documentan variantes ONNX, TensorRT o cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; el dominio visual es anime y semi-realista) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, formato Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 de Ultralytics, un detector de objetos de una sola etapa con backbone CNN y cabecera de deteccion anclada sin anchors (anchor-free), optimizada para velocidad y precision en tareas de deteccion en tiempo real. La tarea es deteccion de objetos con una unica clase (`eye`), de modo que la salida son cajas delimitadoras con su puntuacion de confianza, sin clasificacion multi-clase.

El ajuste fino se realizo sobre un conjunto de 286 imagenes (version 2.0) de estilo anime y semi-realista, generadas por el propio autor (principalmente personajes femeninos) y etiquetadas manualmente con cajas alrededor de cada ojo visible. La configuracion de entrenamiento documentada es de 100 epocas, tamano de imagen 640 y batch size 8. No se detalla en la model card el uso de tecnicas de aumento de datos, funciones de perdida especificas ni procesos de validacion cruzada mas alla de la particion de validacion. No se menciona RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector visual.

## Capacidades

- Deteccion de ojos en ilustraciones de estilo anime y semi-realista, con una unica clase de salida (`eye`).
- Localizacion mediante cajas delimitadoras de cada ojo visible, apta para recortes y regiones de inpainting.
- Integracion nativa con ComfyUI mediante `UltralyticsDetectorProvider` y el Impact Pack.
- Funcionamiento con `Detailer (SEGS)` para redibujar o corregir la region ocular sin alterar el resto de la imagen.
- Dos variantes de compromiso precision/velocidad: nano (`yolov8n`) y small (`yolov8s`).
- Uso como detector auxiliar en pipelines de generacion de imagenes (por ejemplo, cambio de color de ojos o correccion de detalles).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Correccion de ojos en generacion de imagenes con ComfyUI: se detectan las cajas oculares y se pasa la region a `Detailer (SEGS)` con `guide_size` 512 y `denoise` entre 0,5 y 0,7 para redibujar el ojo segun el prompt sin tocar el resto del lienzo.
- Cambio de color de ojos: el detector aísla la region ocular y un inpainting guiado por prompt modifica el color manteniendo la identidad del personaje y el resto de la ilustracion intactos.
- Post-procesado de lotes de ilustraciones anime: ejecutar el detector sobre carpetas de imagenes para localizar y corregir ojos defectuosos de forma automatizada antes de la entrega.
- Integracion en herramientas de edicion asistida: usar las cajas detectadas para ofrecer al usuario selecciones precisas de la region ocular en un editor grafico.
- Entrenamiento y evaluacion de pipelines de deteccion facial en dominios de animacion: sirve como componente especializado frente a detectores genericos de cara.
- Generacion de datasets etiquetados: emplear el detector para pre-anotar ojos en nuevas imagenes y acelerar el etiquetado manual posterior.
- Prototipado rapido en entornos con recursos limitados: la variante nano permite inferencia en GPU de consumo con baja latencia para pruebas y demos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la particion de validacion:

| Metrica | Nano (yolov8n) | Small (yolov8s) |
|---|---|---|
| mAP50 | 0,982 | 0,989 |
| mAP50-95 | 0,663 | 0,670 |
| Precision | 0,997 | 0,981 |
| Recall | 0,964 | 0,954 |

No se han publicado comparaciones con otros detectores especializados en el dominio anime en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de las variantes nano y small de YOLOv8, la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponibles en la model card; cualquier GPU compatible con PyTorch y Ultralytics deberia poder ejecutar el modelo.
- Cabe en GPU de consumo: si, por el tamano reducido de las variantes nano y small; no se especifican modelos concretos.
- Opciones de despliegue: Ultralytics (Python), ComfyUI con Impact Pack; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clase(s) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Anime Eye Detector (yolov8n/s) | YOLOv8, deteccion | `eye` | no disponible | no aplica | MIT | Hugging Face |
| `face_yolov8n.pt` (Impact Pack) | YOLOv8, deteccion | cara | no disponible | no aplica | segun distribucion de Impact Pack | Incluido en Impact Pack |
| `hand_yolov8n.pt` (Impact Pack) | YOLOv8, deteccion | mano | no disponible | no aplica | segun distribucion de Impact Pack | Incluido en Impact Pack |

La comparacion se limita a detectores auxiliares del ecosistema ComfyUI/Impact Pack, ya que no se dispone de datos de otros detectores especializados en ojos de anime en la informacion proporcionada. No se han publicado metricas comparativas entre estos modelos.

## Limitaciones y advertencias

- La deteccion en ojos de personajes masculinos, aunque mejorada en la version 2.0, sigue siendo menos fiable que en personajes femeninos.
- El conjunto de entrenamiento es reducido (286 imagenes en la version 2.0); las metricas de validacion son altas, pero la robustez frente a estilos no vistos puede degradarse.
- El modelo fue entrenado con imagenes anime y semi-realistas; el autor indica que tambien funciona en estilos realistas, pero sin validacion extensa en todos los estilos artisticos.
- Riesgo de falsos positivos o detecciones incompletas en ojos parcialmente ocultos, cerrados o muy estilizados.
- No es un modelo de lenguaje: no procesa texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Licencia MIT, que permite uso comercial y redistribucion; el autor recomienda verificar de forma independiente las condiciones de licencia de cualquier checkpoint base usado para generar imagenes de entrenamiento o inferencia.
- No se documentan sesgos demograficos mas alla de la limitacion de genero indicada; al tratarse de arte generado, los sesgos reflejan la distribucion del dataset del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/killjoyelite/anime-eye-yolov8n
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI Impact Pack: https://github.com/ltdrdata/ComfyUI-Impact-Pack
- Ultralytics (framework YOLOv8): no se incluye enlace explicito en la model card; referencia general en https://github.com/ultralytics/ultralytics
