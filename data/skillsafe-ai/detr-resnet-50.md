# skillsafe-ai/detr-resnet-50

## Resumen

skillsafe-ai/detr-resnet-50 es un paquete de artefactos ONNX listos para navegador del detector de objetos DETR con backbone ResNet-50, publicado por el usuario skillsafe-ai dentro del ecosistema SkillSafe. No es un modelo entrenado desde cero: es un import reproducible del repositorio Xenova/detr-resnet-50 (a su vez una exportacion a ONNX del facebook/detr-resnet-50 de Meta AI), empaquetado junto con una receta de conversion, hashes SHA-256 por fichero y un manifiesto de procedencia. El repositorio ocupa 0,2 GB y contiene unicamente el modelo en formato ONNX (fp32 y cuantizado a 8 bits), el `config.json` y el `preprocessor_config.json`.

El modelo resuelve deteccion de objetos sobre las 91 categorias de COCO (92 salidas con la clase "sin objeto"), con una arquitectura transformer encoder-decoder sobre caracteristicas extraidas por ResNet-50 y asignacion bipartita de predicciones, sin necesidad de anchors ni de supresion de no maximos. Su relevancia practica esta en el formato: al estar exportado a ONNX con opset 12 y verificado con `onnx.checker`, se puede ejecutar en el navegador mediante `onnxruntime-web` con aceleracion WebGPU o WASM, lo que permite inferencia de vision por computador en el cliente sin enviar imagenes a un servidor.

El modelo se publico con licencia Apache-2.0, no tiene descargas ni likes registrados y no declara idiomas soportados. La model card incide en la reproducibilidad de la conversion (toolchain con Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin arm64) y en que ningun byte fue editado a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (DETR) con backbone convolucional ResNet-50 |
| Parametros totales | no disponible (la model card no declara recuento) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 800 x 800) |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`, 159,06 MB) y q8 / 8 bits (`onnx/model_quantized.onnx`, 41,11 MB) |
| Idiomas soportados | no disponible; las etiquetas resultantes corresponden a las 91 clases de COCO, en ingles |
| Licencia | Apache-2.0 (pesos bajo licencia de Meta AI; receta y model card bajo licencia del repositorio SkillSafe) |
| Formato de pesos | ONNX (opset 12); no se incluyen safetensors, GGUF ni pesos PyTorch |
| Salidas | `logits` float32 `[batch_size, num_queries, 92]` y `pred_boxes` float32 `[batch_size, num_queries, 4]` |
| Entradas | `pixel_values` float32 `[batch_size, num_channels, height, width]` y `pixel_mask` int64 `[batch_size, 64, 64]` |
| Consultas del decoder | 100 consultas por imagen |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | transformers.js |
| Modelo base | Xenova/detr-resnet-50 (commit 8be7ab59ff663484ee9ba2e8d8f267330d5ad03e) |
| Fecha de creacion / actualizacion | 2026-09-22T21:53:13Z / 2026-09-22T21:53:38Z |

## Arquitectura y entrenamiento

DETR combina un backbone ResNet-50, que extrae un mapa de caracteristicas de la imagen, con un transformer encoder-decoder que produce un conjunto fijo de 100 predicciones por imagen. Cada prediccion incluye una distribucion de probabilidad sobre 92 clases (91 clases reales de COCO mas la clase "sin objeto") y una caja delimitadora de 4 coordenadas. El entrenamiento original de Meta AI utiliza una perdida de asignacion bipartita (algoritmo hungaro) que empareja cada prediccion con una anotacion real, lo que elimina la necesidad de generar propuestas de regiones, de anchors y de aplicar supresion de no maximos en la inferencia.

Este repositorio concreto no contiene entrenamiento ni ajuste fino: segun la model card, los artefactos se importaron tal cual desde el origen fijado ("Imported as published upstream (no conversion)") y se verificaron con `onnx.checker` mas una ejecucion de humo en CPU con `onnxruntime` sobre entradas de ceros con las formas declaradas. La receta de conversion queda registrada en `recipes/detr-resnet-50.yaml` con hash SHA-256 propio, y el `manifest.json` del repositorio recoge la receta, las fuentes, el toolchain (incluido el hash de `uv.lock`) y los numeros de verificacion por fichero. Los ficheros se clasifican como `bundle` (configuracion y preprocesado, empaquetados en la aplicacion) o `registry` (parametros servidos desde `models.skillsafe.ai` una vez validados).

## Capacidades

- Deteccion de objetos: predice hasta 100 cajas delimitadoras por imagen con su clase y una puntuacion de confianza, sobre las 91 categorias de COCO (persona, vehiculo, animal, utensilio, mueble, etc.).
- Deteccion sin anchors ni NMS: al formular la deteccion como una prediccion de conjunto con asignacion bipartita, no requiere postprocesado de supresion de no maximos.
- Inferencia en navegador: el formato ONNX con opset 12 permite ejecutar el modelo con `onnxruntime-web` usando `webgpu` o `wasm` como execution provider.
- Ejecucion en CPU: se ha verificado una ejecucion de humo con `onnxruntime` en CPU sin GPU dedicada.
- Cuantizacion a 8 bits: variante `model_quantized.onnx` de 41,11 MB, aproximadamente una cuarta parte del peso del modelo en fp32.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es exclusivamente un modelo de vision.
- No soporta tool calling ni function calling, ni flujos de agente multi-paso.
- No se declara soporte multilingue ni capacidades multimodales de entrada de texto.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni segmentacion de instancias.

## Casos de uso

- Deteccion de objetos en aplicaciones web sin backend: una aplicacion React o Vue puede cargar `onnx/model_quantized.onnx` con `onnxruntime-web` y ejecutar la deteccion directamente en el dispositivo del usuario, evitando subir imagenes a un servidor y reduciendo costes de inferencia.
- Anonimizacion en el cliente: al detectar categorias como "persona" sobre imagenes que el usuario va a compartir, se puede aplicar desenfoque o difuminado local antes de cualquier envio de datos, lo que simplifica el cumplimiento de normativa de privacidad.
- Catalogacion automatica de imagenes: etiquetado de fotos por categorias COCO para organizar bibliotecas, inventarios visuales o colecciones de producto con recuento de objetos por imagen.
- Extension de navegador para accesibilidad: descripcion de escenas fotografiadas por el usuario indicando que objetos aparecen y donde, con procesamiento local.
- Preprocesado en pipelines de vision: generacion de regiones de interes para alimentar un segundo modelo mas especializado (OCR sobre recortes de texto detectado, clasificacion fina de recortes, etc.).
- Demostraciones y prototipado docente: ejemplo autocontenido para explicar deteccion de objetos basada en transformer y exportacion a ONNX en cursos o talleres, sin dependencias de Python en el cliente.
- Verificacion de integridad en cadena de suministro de modelos: el repositorio sirve como caso practico de pin por SHA-256 de origen, receta reproducible y comprobacion con `onnx.checker`, util para equipos que auditan procedencia de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion sobre COCO (AP, AP50, AP75 ni metricas por tamano de objeto), y tampoco hay comparaciones con otros detectores.

Lo unico medido y publicado son tiempos de una ejecucion de humo en CPU, con entradas de ceros y en hardware no especificado (Darwin 25.6.0 arm64, onnxruntime 1.30.0). No equivalen a un benchmark de calidad ni a una medicion de rendimiento representativa:

| Fichero | Entradas | Salidas | Tiempo (ms) |
|---|---|---|---|
| `onnx/model.onnx` (fp32) | `pixel_values[1, 3, 800, 800]`, `pixel_mask[1, 64, 64]` | `logits[1, 100, 92]`, `pred_boxes[1, 100, 4]` | 123,8 |
| `onnx/model_quantized.onnx` (q8) | `pixel_values[1, 3, 800, 800]`, `pixel_mask[1, 64, 64]` | `logits[1, 100, 92]`, `pred_boxes[1, 100, 4]` | 99,7 |

## Requisitos de hardware

- VRAM estimada: no disponible como medicion. Como referencia derivada del tamano de los artefactos, el modelo fp32 ocupa 159,06 MB y el cuantizado q8 41,11 MB, por lo que el peso en memoria es del orden de centenares de MB una vez anadidos los buffers de activaciones y del runtime.
- GPU recomendadas: no disponible. El formato es ONNX y esta pensado para `onnxruntime-web` con WebGPU sobre la GPU integrada o dedicada del equipo cliente; no se documenta soporte especifico para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, el caso de uso declarado es el navegador, de modo que cabe en cualquier equipo con un navegador compatible con WebGPU; como alternativa existe la ruta WASM en CPU.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) segun la model card; tambien es viable `onnxruntime` en servidor al tratarse de ONNX estandar con opset 12. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision en este formato.
- Latencia y throughput: los unicos datos disponibles son 123,8 ms para fp32 y 99,7 ms para q8 en la ejecucion de humo en CPU descrita arriba. No hay mediciones en GPU, en WebGPU ni con lotes mayores de 1.
- Almacenamiento: el repositorio completo ocupa 0,2 GB; en despliegue web conviene servir solo el fichero ONNX necesario, ya que los `registry` files se sirven por separado desde `models.skillsafe.ai`.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skillsafe-ai/detr-resnet-50 | ONNX fp32 y q8 | 159,06 MB / 41,11 MB | Apache-2.0 | HuggingFace + `models.skillsafe.ai` | Paquete para navegador con hashes y receta de importacion |
| Xenova/detr-resnet-50 | ONNX / transformers.js | no disponible | Apache-2.0 (heredada) | HuggingFace | Fuente directa del paquete anterior |
| facebook/detr-resnet-50 | PyTorch | no disponible | Apache-2.0 | HuggingFace | Pesos originales de Meta AI (Carion et al.) |
| Otros detectores ONNX para navegador (por ejemplo familias YOLO o RT-DETR exportadas) | ONNX | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada que permitan una comparacion de rendimiento |

No se dispone de cifras de precision, latencia ni consumo comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card, pero al derivar de un modelo entrenado sobre COCO hereda las limitaciones de cobertura y representacion de ese conjunto de datos (91 categorias, fuerte desequilibrio entre clases, sesgos geograficos y culturales del corpus de imagenes).
- Riesgo de alucinacion: DETR puede emitir cajas con clase distinta a la real o detectar objetos inexistentes en imagenes ambiguas; al no aplicar supresion de no maximos, conviene filtrar por umbral de confianza en la capa de aplicacion.
- Limite de objetos: el decoder produce exactamente 100 consultas por imagen, por lo que no esta pensado para escenas con muchos mas objetos que ese limite.
- Resolucion de entrada: el contrato declarado fija `pixel_values` a 800 x 800 en la verificacion; el preprocesado debe respetar `preprocessor_config.json` para obtener resultados coherentes.
- Idiomas: no se declara soporte de idiomas y las etiquetas de clase estan en ingles; cualquier interfaz multilingue requiere traduccion externa.
- Licencia: Apache-2.0 permite uso comercial, pero la propia model card recuerda que los pesos conservan la licencia del origen (Meta AI, Apache-2.0) y que la receta y la model card quedan bajo la licencia del repositorio SkillSafe; conviene revisar el aviso enlazado antes de redistribuir.
- Madurez del repositorio: 0 descargas, 0 likes y un unico commit de importacion; no hay garantia de mantenimiento ni de soporte.
- Ausencia de evaluacion: no hay metricas de calidad publicadas para este paquete, de modo que cualquier decision de produccion deberia acompanarse de una evaluacion propia sobre el dominio objetivo.
- Uso de los ficheros `registry` y `bundle`: los primeros se sirven desde `models.skillsafe.ai` una vez validados, lo que introduce una dependencia de infraestructura externa si no se alojan localmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/detr-resnet-50
- Modelo base en HuggingFace: https://huggingface.co/Xenova/detr-resnet-50
- Commit fijado del origen: https://huggingface.co/Xenova/detr-resnet-50/tree/8be7ab59ff663484ee9ba2e8d8f267330d5ad03e
- Pesos originales de Meta AI: https://huggingface.co/facebook/detr-resnet-50
- Aviso de licencia del modelo original: https://huggingface.co/facebook/detr-resnet-50/blob/main/README.md
- Repositorio SkillSafe con las recetas de conversion: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Servicio de ficheros de parametros: https://models.skillsafe.ai
- Articulo de DETR (Carion et al., Meta AI): https://arxiv.org/abs/2005.12872
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
