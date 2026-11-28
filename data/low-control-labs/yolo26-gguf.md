# low-control-labs/yolo26.gguf

## Resumen

YOLO26 es un modelo de deteccion de objetos publicado por low-control-labs en formato GGUF bajo el identificador `low-control-labs/yolo26.gguf`. Se trata de la conversión a GGUF de los pesos de un modelo YOLO de la generación 26, orientado a inferencia de deteccion visual, no a generación de texto. El repositorio tiene un tamaño de 0,3 GB y 63.428.096 parametros, lo que lo situa en la gama de modelos de visión ligeros aptos para despliegue en CPU y GPUs de consumo.

El modelo se distribuye exclusivamente en formato GGUF, lo que indica que su destino principal es el motor de inferencia propio del autor, `yolo.cpp`, alojado en GitHub. No se trata de un modelo de lenguaje: no procesa ni genera texto, sino que recibe imagenes y devuelve detecciones (cajas delimitadoras y clases). Por tanto, las secciones de esta ficha relativas a contexto, tool calling o razonamiento multilingüe no aplican y se marcan como no disponibles.

La relevancia actual del modelo radica en su empaquetado GGUF para un runtime en C++ específico, lo que facilita el despliegue en entornos sin dependencias de Python ni de frameworks pesados. La licencia AGPL-3.0 impone obligaciones copyleft estrictas que condicionan su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deteccion de objetos de la familia YOLO; detalles de capas no publicados) |
| Parametros totales | 63.428.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos GGUF; no se especifican los niveles de cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. Por la denominación YOLO26 y el tamaño de 63,4 millones de parametros, se trata presumiblemente de una red de deteccion de objetos de una etapa, pero no se detallan la columna vertebral (backbone), la cabeza de deteccion, las funciones de perdida ni las tecnicas de asignacion de etiquetas empleadas.

Tampoco hay datos sobre el conjunto de entrenamiento (número de imagenes, composición del dataset, resoluciones), ni sobre si se aplicaron tecnicas de aumento de datos, destilación o ajuste fino posteriores. La model card es mínima y solo remite al repositorio de inferencia `yolo.cpp` del mismo autor. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, etc.) sería especulativa y no se incluye.

## Capacidades

- Deteccion de objetos en imagenes: el modelo está diseñado para localizar y clasificar objetos, aunque no se especifican las clases del dataset de entrenamiento.
- Inferencia en formato GGUF: pensado para ejecutarse con el runtime `yolo.cpp`, lo que permite despliegue en C++ sin dependencias de Python.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de la infraestructura de Hugging Face, aunque no se detalla el esquema de entrada/salida.
- Generación de texto, razonamiento, codigo, matematicas, vision multimodal, tool calling, agentes y capacidades multilingües: no disponibles; el modelo no es de lenguaje ni multimodal generativo.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos de borde: el tamaño de 63,4 millones de parametros y el formato GGUF permiten ejecutar el modelo en CPUs y GPUs de gama baja dentro de pipelines de visión embebida, siempre que se integre con `yolo.cpp`.
- Preprocesado en sistemas de videovigilancia: el modelo puede usarse para localizar personas u objetos en flujos de video, delegando la lógica de alertas a un sistema externo.
- Automatización de inventario en retail: detección de productos en estanterías a partir de imagenes fijas, con el runtime en C++ para integrarse en sistemas de punto de venta.
- Control de calidad industrial: localización de defectos o piezas en lineas de fabricación donde se requiere baja latencia y despliegue sin Python.
- Análisis de imagenes satelitales o dron: detección de elementos en fotogramas aéreos, aprovechando el reducido tamaño del modelo para procesamiento por lotes en servidores modestos.
- Prototipado de aplicaciones de visión en C++: al estar empaquetado como GGUF y acompañado de un runtime propio, sirve para experimentar con deteccion de objetos en entornos nativos sin depender de PyTorch o TensorFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 63,4 millones de parametros, los pesos en FP32 ocuparían unos 254 MB y en FP16 unos 127 MB, mas el espacio de activaciones y buffers de inferencia.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable en tarjetas como GTX 1650, RTX 3050 o superiores, aunque no confirmado por el autor.
- Opciones de despliegue: el runtime previsto es `yolo.cpp` (GitHub de low-control-labs). No se indica soporte para llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| YOLO26 (este) | 63.428.096 | GGUF | AGPL-3.0 | Runtime propio `yolo.cpp`; model card minima |
| YOLOv8 (Ultralytics) | variable (n/s/m/l/x) | PyTorch, ONNX | AGPL-3.0 | Ecosistema amplio, benchmarks publicos |
| YOLOv10 | variable | PyTorch | AGPL-3.0 | Deteccion sin NMS, benchmarks publicos |
| RT-DETR | variable | PyTorch | Apache-2.0 / MIT segun variante | Transformer de deteccion, alternativo a YOLO |

No se dispone de datos de rendimiento del modelo YOLO26 para establecer una comparación cuantitativa con YOLOv8, YOLOv10 o RT-DETR. La comparación se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso en ese sentido es inviable.
- Model card practicamente vacía: no se documentan clases, resoluciones de entrada, umbrales de confianza ni métricas de precision (mAP).
- Licencia AGPL-3.0: el uso en servicios en red obliga a publicar el codigo fuente derivado; no es apta para productos propietarios sin cumplir el copyleft.
- Dependencia de un runtime no estandar (`yolo.cpp`): no hay soporte confirmado en ecosistemas como ONNX Runtime, TensorRT o OpenVINO, lo que limita la portabilidad.
- Riesgo de sesgos y alucinaciones: en deteccion de objetos, el equivalente son falsos positivos y falsos negativos; no se ha publicado ninguna evaluacion al respecto.
- Idiomas y contexto: no aplica, pero conviene subrayar que la ausencia de metadatos impide conocer el dominio de entrenamiento.
- Sin garantías de mantenimiento: el repositorio tiene 180 descargas y 0 likes, lo que sugiere un proyecto incipiente con soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/low-control-labs/yolo26.gguf
- Repositorio de inferencia: https://github.com/low-control-labs/yolo.cpp
