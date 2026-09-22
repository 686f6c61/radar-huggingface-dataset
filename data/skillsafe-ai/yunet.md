# skillsafe-ai/yunet

## Resumen

YuNet es un detector de caras convolucional ligero publicado por Shiqi Yu y distribuido a traves del repositorio OpenCV Zoo. El artefacto que nos ocupa no es el entrenamiento original, sino una importacion reproducible alojada por SkillSafe en HuggingFace (`skillsafe-ai/yunet`) que empaqueta el fichero ONNX `face_detection_yunet_2026may.onnx` para su uso directo en navegador mediante `onnxruntime-web`.

El modelo resuelve una tarea acotada: localizar rostros en una imagen y devolver, para cada deteccion, una caja delimitadora, una puntuacion de objeto, una puntuacion de clase y cinco puntos clave faciales (ojos, nariz y comisuras de la boca). Su relevancia actual no esta en la generacion de texto ni en el razonamiento, sino en su tamano: 0,22 MB en float32, inferencia en CPU del orden de 1,5 ms y una ventana de entrada totalmente dinamica (`[1, 3, height, width]`), lo que permite ejecutarlo integramente en el cliente sin enviar imagenes a un servidor.

La arquitectura es una red convolucional con cabezas de deteccion ancoradas en tres escalas (strides 8, 16 y 32) y exportacion a ONNX opset 11. No dispone de variantes cuantizadas publicadas, no soporta tool calling ni agentes, y no es un modelo de lenguaje: no tiene idiomas ni ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional ligera con deteccion ancorada multi-escala (cabezas en strides 8, 16 y 32); no es transformer, MoE ni SSM |
| Parametros totales | no disponible; el artefacto ONNX en float32 ocupa 0,22 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen con altura y anchura dinamicas (verificada con 320x320) |
| Tipos de cuantizacion | no disponible; el unico fichero publicado es float32. El formato ONNX admite cuantizacion posterior con herramientas de ONNX Runtime, pero no se distribuye ninguna variante |
| Idiomas soportados | no aplica (no es un modelo de lenguaje ni de texto) |
| Licencia | MIT (pesos, Copyright (c) 2020 Shiqi Yu); la receta de conversion y la model card pertenecen a SkillSafe. OpenCV Zoo se distribuye bajo Apache-2.0 |
| Formato de pesos | ONNX, opset 11, float32 (fichero `face_detection_yunet_2026may.onnx`) |
| Autor del artefacto | skillsafe-ai |
| Origen de los pesos | OpenCV Zoo, commit `47534e27c9851bb1128ccc0102f1145e27f23f98` |
| SHA-256 del fichero | `ebafce4e3c118d6554634be5c27ab333b4c047a9a8c3faf1d7cf93101c22f0f0` |
| Fecha de creacion del repo | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento original; solo documenta la importacion. El artefacto se ha importado tal cual se publico en origen ("no conversion"), es decir, el fichero ONNX es byte a byte el del upstream, verificado por SHA-256 y validado con `onnx.checker` y una ejecucion de humo en CPU con entradas rellenas de ceros y las formas declaradas.

Lo que si se deduce del contrato de entrada y salida es la estructura de la red: una entrada `input` float32 de forma `[1, 3, 'height', 'width']` y doce salidas agrupadas en tres escalas. Para cada escala hay una clasificacion (`cls_8`, `cls_16`, `cls_32`), una puntuacion de objeto (`obj_8`, `obj_16`, `obj_32`), una regresion de caja de cuatro valores (`bbox_8`, `bbox_16`, `bbox_32`) y diez valores de puntos clave, correspondientes a cinco landmarks faciales (`kps_8`, `kps_16`, `kps_32`). Con una entrada de 320x320, la escala de stride 8 produce 1600 anclas, la de stride 16 produce 400 y la de stride 32 produce 100, lo que confirma un esquema tipo anchor-based multi-escala sin necesidad de piramide de caracteristicas explicita. El toolchain declarado es Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64; el dataset de entrenamiento, el numero de tokens o imagenes y el uso de RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Deteccion de rostros en imagenes: devuelve cajas delimitadoras con puntuacion de objeto y de clase.
- Regresion de cinco puntos clave faciales por rostro (10 valores float32 por ancla), aptos para alineacion posterior.
- Deteccion multi-escala gracias a las tres cabezas (strides 8, 16 y 32), lo que permite localizar caras de distintos tamanos relativos.
- Entrada de resolucion dinamica: la altura y la anchura son dimensiones simbolicas del grafo ONNX, no fijas.
- Inferencia en navegador con WebGPU o WASM mediante `onnxruntime-web`, sin backend servidor.
- Inferencia en CPU con ONNX Runtime, OpenCV DNN u otros runtimes compatibles con ONNX opset 11.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni generacion de texto.
- No tiene modo thinking, vision general, audio ni ninguna capacidad multimodal mas alla de la deteccion facial.

## Casos de uso

- Deteccion facial en el navegador con privacidad por diseno: la imagen nunca sale del dispositivo porque la inferencia se ejecuta con WebGPU o WASM; encaja en aplicaciones de bienestar digital, filtros o analitica local donde enviar fotos a un servidor es un riesgo legal.
- Preprocesado para reconocimiento facial: las cinco coordenadas de puntos clave permiten alinear y recortar el rostro antes de pasarlo a un modelo de embedding, reduciendo la variabilidad de pose en el pipeline.
- Analitica de aforo y conteo de personas: sobre flujos de video ya capturados, el detector aporta el numero de rostros por fotograma con un coste de CPU de milisegundos, suficiente para paneles de ocupacion en comercios o edificios.
- Moderacion de contenido subida por usuarios: como primera etapa de un pipeline que descarte o marque imagenes con personas, reduciendo el volumen que llega a modelos mas caros.
- Automatizacion de videollamadas y grabaciones: encuadre automatico, difuminado de fondo o censura de rostros en tiempo real, gracias a los 1,5 ms por inferencia en CPU medidos en la verificacion.
- Aplicaciones moviles y edge sin conectividad: al ocupar 0,22 MB, el modelo cabe en el binario de una app o en una PWA cacheada, y funciona offline en dispositivos con recusos limitados.
- Pruebas automatizadas de vision por computador: su contrato estable de entradas y salidas lo hace util como componente de referencia en suites de CI que validen pipelines de preprocesado de imagen.
- Sustitucion de detectores mas pesados en prototipos: para validar una idea de producto antes de invertir en infraestructura GPU, un detector de 0,22 MB permite iterar en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WIDER FACE ni de ninguna otra evaluacion en la model card ni en el repositorio.

Los unicos datos numericos de rendimiento disponibles son los de la verificacion de SkillSafe, que no constituyen un benchmark de calidad sino una comprobacion de que el grafo se ejecuta:

| Prueba | Entrada | Salidas | Tiempo |
|---|---|---|---|
| Smoke run en CPU con ONNX Runtime, entradas de ceros | `input[1, 3, 320, 320]` | `cls_8[1,1600,1]`, `cls_16[1,400,1]`, `cls_32[1,100,1]`, `obj_8[1,1600,1]`, `obj_16[1,400,1]`, `obj_32[1,100,1]`, `bbox_8[1,1600,4]`, `bbox_16[1,400,4]`, `bbox_32[1,100,4]`, `kps_8[1,1600,10]`, `kps_16[1,400,10]`, `kps_32[1,100,10]` | 1,5 ms |

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable. El fichero de pesos ocupa 0,22 MB; con buffers de activaciones a 320x320 el consumo total queda por debajo de las decenas de MB, dominado por el propio runtime.
- GPU recomendadas: cualquier GPU compatible con WebGPU sirve para el despliegue en navegador. En servidor, cualquier acelerador (A100, H100, L4, RTX 4090, RTX 3060) es sobredimensionado para este modelo; el cuello de botella sera la transferencia de la imagen, no el computo.
- GPU de consumo: cabe en cualquier GPU de consumo e integrada, y tambien en GPU de movil via WebGPU o via ejecucion en CPU.
- CPU: la verificacion reporta 1,5 ms por inferencia a 320x320 con ONNX Runtime en un equipo Apple Silicon (Darwin arm64). En CPUs mas modestas el coste sera mayor, pero el modelo esta disenado para ejecutarse sin acelerador.
- Dispositivos edge: viable en Raspberry Pi, moviles de gama media y navegadores de escritorio, dado el tamano del artefacto.
- Opciones de despliegue: `onnxruntime-web` (execution providers `webgpu` y `wasm`), ONNX Runtime para Python/C++/C#, OpenCV DNN mediante `FaceDetectorYN`, y cualquier runtime compatible con ONNX opset 11. No aplica llama.cpp, Ollama, vLLM ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: solo se conoce el dato de 1,5 ms por inferencia en CPU de la verificacion. No hay cifras publicadas de FPS, throughput en lote ni latencia en WebGPU.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni de parametros de otros detectores de caras, por lo que la comparacion solo puede ser cualitativa y con la mayoria de celdas marcadas como no disponibles. La categoria de referencia es la de detectores faciales ligeros aptos para edge y navegador.

| Modelo | Parametros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| YuNet (este artefacto) | no disponible; fichero de 0,22 MB | Dinamica `[1, 3, height, width]`, verificada a 320x320 | MIT | ONNX opset 11 en HuggingFace; upstream en OpenCV Zoo |
| RetinaFace | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| SCRFD | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| BlazeFace / deteccion facial de MediaPipe | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de cifras comparativas de precision ni de latencia entre estas alternativas en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de ese tipo es un error de catalogacion.
- Solo detecta caras. No las identifica ni las reconoce: no produce embeddings ni permite distinguir personas.
- No hay resultados de precision publicados en la informacion disponible (ni WIDER FACE ni validaciones propias), por lo que no es posible estimar su tasa de falsos positivos o negativos en produccion.
- El dataset de entrenamiento, su composicion demografica y sus posibles sesgos no estan documentados en la informacion proporcionada. Es esperable un comportamiento desigual en rostros con oclusion, poses extremas, iluminacion pobre o baja resolucion, pero no hay mediciones que lo cuantifiquen.
- La resolucion de entrada es dinamica, pero resoluciones de inferencia muy bajas degradaran la deteccion de caras pequenas y muy altas incrementaran el coste sin garantia de mejora.
- Dependencia de ONNX opset 11: el runtime de destino debe soportar ese opset. Un runtime antiguo o con cobertura parcial de operadores puede fallar al cargar el grafo.
- No se distribuyen variantes cuantizadas (int8, fp16) ni formatos alternativos (GGUF, TensorRT, Core ML). Cualquier optimizacion de ese tipo corre por cuenta de quien integra el modelo.
- Licencia MIT para los pesos, con obligacion de mantener la atribucion a Shiqi Yu (Copyright (c) 2020). OpenCV Zoo se distribuye bajo Apache-2.0 y la receta de SkillSafe bajo su propia licencia; hay que revisar las tres capas antes de redistribuir.
- Uso de datos biometricos: aunque el modelo no identifique personas, el tratamiento de imagenes faciales esta sujeto al RGPD y a normativa equivalente. La ejecucion local en el navegador mitiga el riesgo, pero no elimina las obligaciones de informacion y base juridica.
- El repositorio presenta 0 descargas y 0 likes y fue creado el 2026-09-22, por lo que no cuenta con validacion de la comunidad. La unica garantia de integridad es el SHA-256 publicado y el manifiesto del repositorio.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos correspondian a contenido sin relacion (tramites de trafico en turco) y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/yunet
- Fichero ONNX directo: https://huggingface.co/skillsafe-ai/yunet/resolve/main/face_detection_yunet_2026may.onnx
- Upstream (OpenCV Zoo, YuNet): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- Fichero upstream congelado por commit: https://media.githubusercontent.com/media/opencv/opencv_zoo/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet/face_detection_yunet_2026may.onnx
- Licencia upstream: https://github.com/opencv/opencv_zoo/blob/47534e27c9851bb1128ccc0102f1145e27f23f98/models/face_detection_yunet/LICENSE
- Recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) sobre este modelo.
