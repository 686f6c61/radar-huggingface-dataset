# circulus/deeplabv3-mobilenet-int8-ov

## Resumen

`circulus/deeplabv3-mobilenet-int8-ov` es un artefacto de inferencia publicado en Hugging Face que contiene una exportacion a OpenVINO IR del modelo de segmentacion semantica `torchvision/deeplabv3_mobilenet_v3_large`, cuantizado a INT8 mediante compresion de pesos con NNCF. El repositorio no incluye pesos en formato PyTorch ni safetensors: unicamente el par `.xml`/`.bin` propio del formato IR de OpenVINO, con un tamano total de 11 MB. La salida del grafo es `[1, 21, H, W]`, correspondiente a las 21 clases del dataset PASCAL VOC, y las dimensiones espaciales son dinamicas, por lo que acepta entradas de imagen de distinta resolucion sin recompilar el modelo.

El modelo lo firma el usuario `circulus` y se enmarca en el material del curso ARCademy de OpenVINO: la propia model card lo etiqueta como "Lesson 02 Hello semantic segmentation" y se genera con el script `convert/convert_all.py` del citado courseware. No es, por tanto, un modelo entrenado desde cero ni un modelo de lenguaje: es un artefacto docente y de despliegue orientado a ejecutar segmentacion semantica en CPU Intel con el runtime de OpenVINO.

Su relevancia es practica y de perfil bajo: no compite en benchmarks de estado del arte, sino que sirve como ejemplo reproducible de un pipeline completo (modelo torchvision, exportacion a IR, cuantizacion INT8, compresion a 11 MB) y como punto de partida para prototipos de vision por computador en hardware sin GPU dedicada. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la model card no publica metricas de precision ni de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV3-Large (CNN con convoluciones atroces/ASPP para segmentacion semantica densa) |
| Parametros totales | no disponible en la model card (el artefacto INT8 ocupa 11 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen y las dimensiones espaciales H y W son dinamicas) |
| Tipos de cuantizacion | INT8 por compresion de pesos con NNCF (weight compression) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other (sin texto de licencia detallado en la informacion disponible) |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) |
| Tarea | Segmentacion semantica densa |
| Numero de clases de salida | 21 (taxonomia de PASCAL VOC) |
| Forma de salida | `[1, 21, H, W]`, dimensiones espaciales dinamicas |
| Modelo base | `torchvision/deeplabv3_mobilenet_v3_large` |
| Tamano del repositorio | 0.0 GB (artefacto declarado de 11 MB) |
| Autor | circulus |
| Creado / actualizado | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo subyacente es DeepLabV3 sobre una columna vertebral MobileNetV3-Large, la implementacion clasica de segmentacion semantica de torchvision. DeepLabV3 combina un backbone convolucional con modulos de convolucion atroz (dilated/atrous) y un modulo ASPP (Atrous Spatial Pyramid Pooling) que captura contexto a multiples escalas mediante tasas de dilatacion distintas; el resultado se proyecta a un mapa de 21 canales seguido de una interpolacion bilineal hasta la resolucion espacial de entrada. MobileNetV3-Large aporta un diseno eficiente en numero de operaciones (bloques con convoluciones separables en profundidad, activaciones h-swish y ajuste de canales por busqueda de arquitectura), lo que explica que el artefacto cuantizado quede en 11 MB.

Sobre el entrenamiento no hay informacion en la model card: no se indica el numero de tokens o imagenes, la composicion del dataset, ni si hubo ajuste fino posterior. Se asume que el artefacto hereda los pesos del modelo de torchvision, que a su vez se distribuye preentrenado por el equipo de PyTorch; no obstante, esta ficha no dispone de ese detalle en la informacion proporcionada y no se afirma ninguna cifra. La innovacion tecnica del repositorio es exclusivamente de despliegue: la exportacion a OpenVINO IR y la cuantizacion INT8 por compresion de pesos con NNCF, que reduce el peso del artefacto y permite ejecucion en CPU sin requerir una GPU.

## Capacidades

- Segmentacion semantica densa en 21 clases de PASCAL VOC (persona, vehiculos, animales, mobiliario urbano, fondo, etc.).
- Entrada de imagen con resolucion variable en una o ambas dimensiones espaciales (dinamicas), sin necesidad de recompilar el modelo.
- Inferencia en CPU gracias al runtime de OpenVINO y al formato IR compilable.
- Modelo de vision puro: no genera texto, no razona, no ejecuta codigo ni matematicas.
- Sin soporte de tool calling, function calling ni agentes.
- Sin capacidades multilingues (no procesa lenguaje natural).
- Sin modo "thinking", sin entrada de audio y sin capacidades multimodales mas alla de la imagen.
- Uso previsto como componente de un pipeline mayor (preprocesado de imagenes, enmascarado, analisis de escenas), no como modelo autonomo.

## Casos de uso

- Segmentacion en tiempo real en CPU de bajo coste: al ser un grafo INT8 de 11 MB ejecutable con OpenVINO Runtime, se puede integrar en servicios que corren en servidores sin GPU o en equipos de escritorio con CPU Intel, segmentando cada fotograma de un flujo de video. Adecuado cuando la prioridad es el coste por inferencia y no la precision maxima.
- Docencia y formacion en OpenVINO: el repositorio se genero para la leccion "02 Hello semantic segmentation" del courseware ARCademy, de modo que sirve como ejemplo reproducible de exportacion a IR, cuantizacion con NNCF y ejecucion de un grafo con dimensiones dinamicas.
- Preprocesado de datasets de vision: usar el modelo para generar mascaras semanticas preliminares sobre imagenes sin etiquetar, que luego un anotador humano corrige. Reduce el tiempo de etiquetado en proyectos de segmentacion.
- Control de calidad industrial ligero: deteccion de regiones de interes (por ejemplo, separar pieza de fondo o localizar superficies) en cadenas de inspeccion donde el modelo se ejecuta en un PC industrial o en un dispositivo de borde con CPU.
- Analisis de imagenes aereas o de satelite a escala: su salida con resolucion espacial dinamica permite procesar teselas de distinto tamano para obtener mascaras de cobertura (vegetacion, vias, edificaciones segun las clases VOC mas cercanas), aunque la taxonomia VOC limita la precision semantica en dominios muy especificos.
- Prototipado rapido de vision en robotica educativa: integrado como nodo de percepcion en un robot de bajo coste, aportando una mascara semantica basica sin necesidad de GPU ni de contenedores pesados.
- Linea base para comparar cuantizacion: permite medir la degradacion de precision INT8 frente al modelo base en FP32 dentro de un mismo pipeline OpenVINO, como experimento de referencia en un curso o informe tecnico.
- Segmentacion en aplicaciones de escritorio o moviles con OpenVINO: el artefacto puede empaquetarse junto a una aplicacion local para funciones de recorte automatico, fondos virtuales o filtrado de imagen, siempre que las categorias requeridas esten cubiertas por VOC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de mIoU, pixel accuracy, latencia ni throughput, ni comparaciones con el modelo base en FP32. No se dispone tampoco de la ficha de evaluacion del modelo `torchvision/deeplabv3_mobilenet_v3_large` en el material proporcionado, por lo que no se reproducen cifras de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecucion en CPU (el artefacto pesa 11 MB y las activaciones dependen de la resolucion de entrada). En GPU Intel integrada o dedicada, el consumo de memoria es del orden de decenas de MB, aunque no hay cifras publicadas.
- GPU recomendadas: no se especifica ninguna. El artefacto esta pensado para CPU Intel con OpenVINO; tambien puede ejecutarse en iGPU Intel (Iris Xe o superior) y en NPU Intel de generaciones recientes compatibles con OpenVINO.
- Cabe en GPU de consumo: si, cualquier GPU soportada por OpenVINO, y con enorme holgura; tambien en CPU de portatil sin GPU dedicada. No se han publicado pruebas en RTX 4090, A100 o H100 para este artefacto.
- Opciones de despliegue: OpenVINO Runtime (Python, C++ o C), OpenVINO Model Server (OVMS), y flujos de Hugging Face que acepten artefactos OpenVINO. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen de la CPU, del numero de hilos, de la resolucion de entrada y del backend de ejecucion (CPU, iGPU o NPU).
- Nota de integracion: la descarga se realiza con `snapshot_download("circulus/deeplabv3-mobilenet-int8-ov")`, y el modelo debe cargarse con `openvino.runtime`/`openvino.Core` indicando el `.xml` del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| `circulus/deeplabv3-mobilenet-int8-ov` | no disponible (artefacto de 11 MB) | imagen con H y W dinamicos; salida 21 clases VOC | INT8 (NNCF, compresion de pesos) | other | OpenVINO IR |
| `torchvision/deeplabv3_mobilenet_v3_large` (modelo base) | no disponible en la informacion proporcionada | imagen; salida 21 clases VOC | FP32 | la del repositorio de torchvision, no detallada aqui | PyTorch (`.pth`) |
| `deeplabv3_resnet50` (torchvision) | no disponible en la informacion proporcionada | imagen; salida 21 clases VOC | FP32 | la del repositorio de torchvision, no detallada aqui | PyTorch (`.pth`) |
| `fcn_resnet50` (torchvision, alternativa mas simple) | no disponible en la informacion proporcionada | imagen; salida 21 clases VOC | FP32 | la del repositorio de torchvision, no detallada aqui | PyTorch (`.pth`) |

No se dispone de resultados de mIoU ni de latencia para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparativa se limita a arquitectura, formato, licencia y disponibilidad. En terminos cualitativos, la variante MobileNetV3-Large frente a las variantes ResNet50 prioriza eficiencia y tamano reducido sobre precision, y la version aqui descrita anade la ventaja de un artefacto INT8 listo para OpenVINO, a cambio de una licencia "other" sin texto explicito.

## Limitaciones y advertencias

- Licencia "other" sin texto disponible en la informacion proporcionada: antes de cualquier uso comercial es imprescindible localizar y leer los terminos exactos del repositorio y los del modelo base de torchvision. No se puede asumir uso comercial libre.
- El modelo segmenta unicamente 21 clases de PASCAL VOC. Cualquier clase fuera de esa taxonomia (por ejemplo, tipos concretos de defectos industriales o categorias medicas) no se reconoce de forma fiable.
- Riesgo de degradacion por cuantizacion: la compresion de pesos a INT8 puede reducir la precision respecto al modelo en FP32, especialmente en clases minoritarias o en contornos finos. No hay evaluacion publicada que cuantifique esa perdida.
- Objetos pequenos y bordes: como cualquier DeepLabV3 sobre backbone ligero, la resolucion efectiva del mapa de caracteristicas limita la delimitacion precisa de objetos de pocos pixeles.
- Sin datos de entrenamiento ni de evaluacion en la model card: no se puede evaluar sesgo, cobertura del dominio ni calidad del etiquetado heredado del modelo base.
- Dependencia del ecosistema OpenVINO: el artefacto no es utilizable directamente en PyTorch, TensorFlow ni ONNX sin conversion adicional.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por parte de la comunidad. No debe tratarse como un artefacto de produccion validado.
- La model card no especifica pipeline en Hugging Face, idiomas ni parametros del modelo, por lo que varios campos quedan como "no disponible".
- Advertencia sobre la busqueda web: las consultas realizadas devolvieron exclusivamente resultados de foros sin relacion alguna con el modelo (contenido no tecnico y no fiable). No se ha utilizado ningun dato de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/circulus/deeplabv3-mobilenet-int8-ov
- Modelo base (pesos PyTorch de referencia): https://huggingface.co/torchvision/deeplabv3_mobilenet_v3_large
- Documentacion de modelos de torchvision (referencia de la arquitectura DeepLabV3 y del backbone MobileNetV3): https://pytorch.org/vision/stable/models.html
- OpenVINO (runtime y documentacion oficial): https://docs.openvino.ai
- NNCF (Neural Network Compression Framework, herramienta de cuantizacion citada): https://github.com/openvinotoolkit/nncf
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; las consultas devolvieron unicamente foros sin relacion tecnica con el artefacto.
