# ipsilondev/depth-anything-v2-small-onnx

## Resumen

`ipsilondev/depth-anything-v2-small-onnx` es un espejo (mirror) de los pesos ONNX del modelo Depth Anything V2 Small, publicado originalmente por el equipo de Depth Anything y convertido a ONNX por la organizacion `onnx-community`. El repositorio no introduce ninguna modificacion: los ficheros son byte-identicos a los del upstream, tal y como el propio autor documenta con hashes SHA-256. Se trata, por tanto, de un artefacto de distribucion orientado a despliegue en inferencia, no de un modelo entrenado desde cero.

El modelo subyacente, Depth Anything V2 Small, es un estimador de profundidad monocular basado en un encoder DINOv2 de tamano Small con un decoder de profundidad ligero. Dado un fotograma RGB, produce un mapa de profundidad inversa relativa (valores mayores indican mayor cercania) a la resolucion de entrada redondeada a multiplos de 14. El contexto de esta ficha es la variante ONNX cuantizada, pensada para ejecucion en CPU y en entornos sin GPU.

Su relevancia practica es doble: por un lado, ofrece dos variantes (fp16 e int8) con tamanos de 49,6 MB y 27,3 MB respectivamente, lo que permite inferencia en dispositivos modestos; por otro, la model card documenta un problema concreto de compatibilidad de la variante fp16 con el nivel de optimizacion por defecto de ONNX Runtime, un dato operativo relevante para quien vaya a desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DINOv2 Small + decoder de profundidad (Depth Anything V2) |
| Parametros totales | no disponible (el repositorio no publica el recuento; el modelo base es la variante Small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, no secuencia de texto) |
| Tipos de cuantizacion | fp16 e int8 (dos ficheros ONNX independientes) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`, `model_int8.onnx`) y `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2, presentado en el articulo de Yang et al. en NeurIPS 2024. La arquitectura combina un backbone transformer DINOv2 (en esta variante, el tamano Small) que actua como encoder de caracteristicas visuales, con un decoder especifico de estimacion de profundidad que produce un mapa denso de profundidad relativa inversa. La entrada es un tensor NCHW `pixel_values` de tipo float32 cuyas dimensiones de alto y ancho deben ser multiplos de 14; la salida es `predicted_depth`, de forma `[batch, 14*floor(height/14), 14*floor(width/14)]` y tambien float32.

El repositorio no contiene informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre si se aplicaron tecnicas de refinamiento posteriores (RLHF, DPO u otras), ya que se limita a replicar los pesos convertidos. La unica innovacion tecnica documentada en esta ficha es la conversion a ONNX y la cuantizacion: ambas variantes mantienen entradas y salidas en float32, de modo que la conversion de precision (fp16 o int8) ocurre dentro del grafo y no requiere manipulacion en el host. El autor verifica la equivalencia numerica entre ambas variantes con una correlacion de 0,997-0,998 sobre un tensor aleatorio.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una unica imagen RGB.
- Salida de profundidad inversa relativa (valores mayores indican mayor cercania), no profundidad metrica absoluta.
- Procesamiento por lotes (dimension `batch` en la entrada y la salida).
- Entrada de resolucion flexible, siempre que alto y ancho sean multiplos de 14; el preprocesado de referencia redimensiona el lado largo a unos 518 pixeles.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Dos niveles de precision intercambiables (fp16 e int8) con alta correlacion entre sus salidas.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el mapa de profundidad relativa por fotograma sirve como entrada para pipelines de estructura-a-movimiento o generacion de nubes de puntos, con la ventaja de que la variante int8 de 27 MB puede ejecutarse en el mismo equipo que captura las imagenes.
- Segmentacion por profundidad en edicion de imagen: separar primer plano y fondo usando el mapa normalizado a [0, 1] como mascara de recorte, con preprocesado bicubico y normalizacion ImageNet ya documentados.
- Robotica de bajo coste y prototipado: estimacion de distancia relativa en tiempo de ejecucion sobre CPU (1,5-2,2 s por fotograma con int8 en un escritorio de referencia), suficiente para tareas de avoidance o navegacion lenta sin GPU dedicada.
- Realidad aumentada en navegador o aplicacion de escritorio: el formato ONNX permite integracion con ONNX Runtime Web o con runtimes nativos, y el tamano reducido del fichero int8 facilita su empaquetado dentro de la aplicacion (el autor menciona que InkTrial distribuye `model_int8.onnx`).
- Generacion de mapas de profundidad para datasets de vision: procesar lotes de imagenes para anadir canales de profundidad a conjuntos de entrenamiento de otros modelos, aprovechando el soporte de batch.
- Control de calidad en captura de video: detectar cambios bruscos en el mapa de profundidad entre fotogramas como senal de oclusion o movimiento de camara, usando la salida de baja latencia de la variante fp16 (0,9-1,4 s con optimizacion basica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de tiempo de ejecucion en CPU (onnxruntime-python 1.24.1, escritorio, entrada 518x392):

| Variante | Tamano | Tiempo por ejecucion | Notas de carga |
|---|---|---|---|
| `model_int8.onnx` | 27.258.801 bytes | 1,5-2,2 s | Carga con todos los niveles de optimizacion |
| `model_fp16.onnx` | 49.642.442 bytes | 0,9-1,4 s | Falla con el nivel de optimizacion por defecto; requiere `ORT_ENABLE_BASIC` o `ORT_DISABLE_ALL` |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para inferencia en CPU y su tamano (27-50 MB) permite ejecucion en memoria RAM convencional.
- GPU recomendadas: no disponibles en la informacion proporcionada; al ser un modelo ONNX de vision de pequeno tamano, cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) seria tecnicamente viable, pero no hay datos de rendimiento en GPU.
- Cabe en GPU de consumo: si, por el tamano de los pesos, aunque no se documentan pruebas.
- Opciones de despliegue: ONNX Runtime (probado con onnxruntime-python 1.24.1 en CPU); el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: 1,5-2,2 s por inferencia con int8 y 0,9-1,4 s con fp16 en un escritorio de referencia a 518x392; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ipsilondev/depth-anything-v2-small-onnx` | no disponible (variante Small) | Imagen, multiplos de 14 | ONNX fp16/int8 | Apache-2.0 | Hugging Face (mirror) |
| `depth-anything/Depth-Anything-V2-Small` | no disponible (variante Small) | Imagen | Safetensors (upstream) | Apache-2.0 | Hugging Face |
| `onnx-community/depth-anything-v2-small` | no disponible (variante Small) | Imagen | ONNX (multiples variantes) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la correlacion de salidas (0,997-0,998) reportada por el autor entre fp16 e int8.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa, no metrica: el rango medido en un tensor aleatorio fue aproximadamente 1,7-3,8, dependiente de la escena; es necesario normalizar por imagen a [0, 1] antes de usarla.
- La variante fp16 falla al cargar con el nivel de optimizacion por defecto de ONNX Runtime (`GetIndexFromName ... InsertedPrecisionFreeCast_/blocks.0/norm1/Constant_output_0`, fusion SimplifiedLayerNorm); hay que usar `ORT_ENABLE_BASIC` o `ORT_DISABLE_ALL`. La variante int8 no presenta este problema.
- El repositorio es un mirror sin conversion propia: no se ejecuto ningun proceso de cuantizacion local, por lo que la calidad de la cuantizacion depende del upstream.
- No hay informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos (imagenes medicas, nocturnas, submarinas).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de mapas de profundidad incorrectos en escenas fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar la atribucion al modelo base y al articulo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; es un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipsilondev/depth-anything-v2-small-onnx
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Conversion ONNX upstream: https://huggingface.co/onnx-community/depth-anything-v2-small
- Codigo oficial: https://github.com/DepthAnything/Depth-Anything-V2
- Paper: Yang et al., "Depth Anything V2", NeurIPS 2024
