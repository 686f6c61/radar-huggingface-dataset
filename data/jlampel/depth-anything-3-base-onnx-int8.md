# jlampel/depth-anything-3-base-onnx-int8

## Resumen

`jlampel/depth-anything-3-base-onnx-int8` es una exportación cuantizada a 8 bits del modelo de estimación de profundidad Depth Anything 3 Base (DA3-BASE) de ByteDance Seed, empaquetada en un único fichero ONNX de 123 MB (frente a los 412 MB del export en fp32). El objetivo declarado por el autor es ejecutar el modelo en la CPU de un teléfono mediante ONNX Runtime; de hecho, es el modelo que alimenta el ajuste "Generative Depth" de Unprocess, un editor de fotografía móvil gratuito.

No se trata de un modelo nuevo ni de un reentrenamiento: los pesos y la matemática del grafo son idénticos al export original (fp32) de `onnx-community/depth-anything-v3-base`; solo cambia cómo se almacenan los pesos. Los MatMul se guardan como enteros de 8 bits con el operador `MatMulNBits` de ONNX Runtime y el resto de pesos fp32 de 1024 elementos o más se guardan en fp16, con un `Cast` a fp32 al inicio del grafo.

Es relevante ahora por dos motivos: la licencia Apache-2.0 (a diferencia de los checkpoints Large, Giant y Nested de DA3, que son CC BY-NC 4.0) y el tamaño reducido, que lo hace desplegable en dispositivos móviles sin GPU dedicada. La contrapartida es la dependencia estricta de ONNX Runtime, ya que `MatMulNBits` es un operador contrib que otros runtimes ONNX no cargan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (exportacion ONNX de Depth Anything 3 Base; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada `[1, 1, 3, H, W]` con H y W multiplos de 14 |
| Tipos de cuantizacion | INT8 en pesos MatMul (`MatMulNBits`, block size 128, simetrico) + FP16 en el resto de pesos fp32 de 1024 o mas elementos |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX en un unico fichero (`da3_base_int8.onnx`, sin datos externos), 123.243.519 bytes |
| Operador requerido | `MatMulNBits` (contrib de ONNX Runtime; probado con la version 1.30) |
| Entrada | `pixel_values`: float32, `[1, 1, 3, H, W]` (batch, vistas, RGB, alto, ancho), normalizada con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` de ImageNet |
| Salida | `predicted_depth`: float32, `[1, 1, H, W]` |
| SHA-256 | `86dd3200ed2506fe4d394b6526691f5c4591d88f51d3f42520aaee0b85387aaf` |
| Modelo base | `depth-anything/DA3-BASE` (relacion: quantized) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de Depth Anything 3 Base ni sus datos de entrenamiento; la model card de esta exportacion se limita a documentar el proceso de cuantizacion. Lo unico verificable es que el grafo ONNX realiza exactamente las mismas operaciones que el export fp32 de referencia, en fp32, y que la unica diferencia es el almacenamiento de pesos: INT8 para los MatMul y FP16 para el resto de tensores grandes.

El proceso de conversion esta automatizado en el script `make_depth_model.py`, incluido en el repositorio, que descarga el export fp32 y genera el fichero de forma reproducible ("byte for byte the same each run"). Dependencias declaradas: `onnx`, `onnxruntime`, `onnx_ir`, `numpy` y `pillow`. El script admite un modo `--check photo.jpg` que compara la salida con la del export fp32 sobre una imagen de prueba. El modelo original se distribuye bajo Apache-2.0 unicamente en los checkpoints Small, Base (y Metric y Mono Large), segun indica el autor; este repositorio deriva exclusivamente de Base.

## Capacidades

- Estimacion de profundidad densa por pixel a partir de una imagen RGB, con salida a la misma resolucion espacial que la entrada.
- Entrada con dimension de vistas (`[batch, views, 3, H, W]`), lo que permite alimentar una o varias vistas en el mismo tensor.
- Resolucion de entrada flexible: cualquier alto y ancho multiplo de 14, sin reentrenamiento.
- Inferencia en CPU de dispositivos moviles mediante ONNX Runtime (caso de uso real en la app Unprocess).
- Ejecucion en un unico fichero de 123 MB, sin ficheros de datos externos, lo que simplifica el empaquetado en aplicaciones.
- Capacidades de texto, tool calling, agentes, razonamiento multi-paso, vision general, audio o modo "thinking": no disponibles (el modelo solo produce mapas de profundidad).

## Casos de uso

- Edicion fotografica movil: integracion en apps de retoque para generar una mascara de profundidad y aplicar desenfoque de fondo, gradientes de nitidez o efectos de bokeh sintetico en el propio dispositivo, sin enviar la imagen a un servidor.
- Reemplazo de fondo y recorte semiautomatico: el mapa de profundidad permite separar sujeto y fondo en tiempo de ejecucion con un coste de 123 MB de almacenamiento, lo que encaja en el limite de tamano tipico de una app movil.
- Realidad aumentada y oclusion: usar la profundidad estimada para ocluir objetos virtuales detras de elementos reales en visores o aplicaciones de camara, aprovechando la inferencia en CPU.
- Previsualizacion ligera en pipelines 3D: generar mapas de profundidad aproximados para pruebas de composicion antes de lanzar un render o una reconstruccion fotogrametrica completa.
- Relighting y efectos de postproceso: modular la intensidad de la luz o de un "depth haze" segun la distancia estimada de cada pixel, directamente en el editor de imagen.
- Procesamiento por lotes en servidores sin GPU: al ser un ONNX de 123 MB, se puede ejecutar en contenedores de CPU para tareas de etiquetado o enriquecimiento de catalogos de imagenes.
- Prototipado rapido y demos: el fichero unico y el script reproducible facilitan validar variantes de preprocesado o comparar contra el export fp32 antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de profundidad (AbsRel, RMSE, delta) ni comparaciones cuantitativas frente al export fp32 o frente a otros modelos de profundidad. Solo se documenta el tamano (123 MB frente a 412 MB del fp32) y la equivalencia funcional del grafo.

## Requisitos de hardware

- Almacenamiento: 123 MB para el fichero ONNX unico; el export fp32 de referencia ocupa 412 MB.
- Inferencia validada en CPU de telefono con ONNX Runtime 1.30 (dato aportado por el autor); no se documentan latencias concretas.
- VRAM para GPU: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles; el caso de uso declarado es CPU movil, no aceleracion en GPU.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: ONNX Runtime con soporte del operador contrib `MatMulNBits`. Otros runtimes ONNX no cargaran el fichero. No hay versiones GGUF, ni integracion declarada con llama.cpp, Ollama, vLLM o TGI (son frameworks orientados a modelos de lenguaje y no aplican aqui).
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato y tamano | Peso de los MatMul | Licencia | Notas |
|---|---|---|---|---|
| `jlampel/depth-anything-3-base-onnx-int8` (esta ficha) | ONNX, 123 MB, fichero unico | INT8 (`MatMulNBits`, block 128) + FP16 en el resto | Apache-2.0 | Requiere ONNX Runtime por el operador contrib |
| `onnx-community/depth-anything-v3-base` | ONNX (export fp32 de referencia) | FP32 | Apache-2.0 | Revision `c56b234c94b459a116d5dc782edf4f2db5889276`; 412 MB |
| `depth-anything/DA3-BASE` | Pesos originales (formato no detallado en la informacion) | No aplica | Apache-2.0 | Checkpoint de origen de la cuantizacion |
| Otros modelos de estimacion de profundidad | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion recibida |

Dentro de la familia DA3, los checkpoints Large, Giant y Nested se distribuyen bajo CC BY-NC 4.0, por lo que no son equivalentes en terminos de uso comercial.

## Limitaciones y advertencias

- Dependencia estricta de ONNX Runtime: `MatMulNBits` es un operador contrib; el fichero no cargara en otros runtimes ONNX, lo que limita la portabilidad del despliegue.
- Precision: la cuantizacion INT8 de los pesos MatMul y el almacenamiento en FP16 de parte de los tensores puede introducir diferencias numericas frente al export fp32; el autor proporciona `--check photo.jpg` para comparar, pero no publica el error medio.
- Resolucion restringida: alto y ancho deben ser multiplos de 14; no se documenta el comportamiento con resoluciones muy altas ni el consumo de memoria asociado.
- Normalizacion obligatoria: omitir la media y desviacion de ImageNet indicadas degradara la salida sin aviso de error.
- Riesgo de profundidades poco fiables en escenas fuera de distribucion (superficies reflectantes, transparentes, texturas repetitivas o poca iluminacion): no se documentan evaluaciones especificas, pero es un caveat habitual en estimacion monoculo que conviene validar con datos propios.
- Sesgos: no disponible; no se aporta informacion sobre la composicion del dataset de entrenamiento ni evaluaciones de sesgo.
- Licencia: Apache-2.0 para este derivado y para el checkpoint Base, lo que permite uso comercial. Los checkpoints Large, Giant y Nested de DA3 son CC BY-NC 4.0 y no deben mezclarse en un producto comercial.
- Madurez: repositorio con 0 descargas y 0 "likes" en el momento de la consulta, creado y actualizado el 17 de octubre de 2026 (segunda actualizacion 15 minutos despues de la creacion). No hay historial de mantenimiento ni issues documentadas.
- Sin garantias de soporte: el autor no documenta versionado semantico, pruebas en distintas versiones de ONNX Runtime (solo 1.30) ni planes de actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlampel/depth-anything-3-base-onnx-int8
- Script de conversion (`make_depth_model.py`): https://huggingface.co/jlampel/depth-anything-3-base-onnx-int8/blob/main/make_depth_model.py
- Modelo base DA3-BASE: https://huggingface.co/depth-anything/DA3-BASE
- Export ONNX fp32 de referencia: https://huggingface.co/onnx-community/depth-anything-v3-base
- Paper (arXiv:2511.10647): https://arxiv.org/abs/2511.10647
- Codigo oficial: https://github.com/ByteDance-Seed/Depth-Anything-3
- ONNX Runtime: https://onnxruntime.ai
