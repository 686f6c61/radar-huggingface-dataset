# CoreEpoch/xcit-tiny12-p8-int8-imagenet

## Resumen

XCiT-Tiny-12/P8 INT8 es un clasificador de imágenes de 1000 clases (ImageNet-1K) distribuido en formato ONNX cuantizado a INT8. Lo publica CoreEpoch, que parte del modelo base `timm/xcit_tiny_12_p8_224.fb_dist_in1k` (arquitectura XCiT, Cross-Covariance Image Transformer, propuesta por El-Nouby et al. en 2021 y entrenada originalmente por Facebook AI con destilación sobre ImageNet-1K). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión post-entrenamiento a INT8 mediante el cuantizador propietario Kenosis.

El interés principal está en la relación precisión/tamano: el fichero cuantizado ocupa 8,59 MB y conserva un 81,16% de top-1 en la validación de ImageNet-1K, frente al 81,22% del original en FP32 (27,0 MB). Es decir, una pérdida de 0,06 puntos porcentuales a cambio de reducir el peso del modelo aproximadamente a un tercio, con calibración sobre solo 128 imágenes y sin reentrenamiento.

El resultado es un modelo pensado para inferencia en CPU o en dispositivos sin acelerador, ejecutable con ONNX Runtime u OpenVINO, con entrada fija de 1x3x224x224 y salida de logits [1,1000]. No es un modelo generativo ni multimodal: es exclusivamente un clasificador de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XCiT (Cross-Covariance Image Transformer), variante tiny de 12 capas y patch de 8x8, entrada 224x224 (segun la nomenclatura del modelo base `timm/xcit_tiny_12_p8_224.fb_dist_in1k`) |
| Parametros totales | no disponible de forma explicita; el fichero FP32 (27,0 MB) y el INT8 (8,59 MB) sugieren un orden de magnitud de 6,8 millones de parametros, sin confirmacion en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes con entrada fija 1x3x224x224) |
| Tipos de cuantizacion | INT8, cuantizacion post-entrenamiento con 128 imagenes de calibracion y sin reentrenamiento (cuantizador Kenosis); no se especifica si se cuantizan solo pesos o tambien activaciones |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero unico `xcit_tiny12_p8_224_int8_kenosis.onnx`, 8.589.884 bytes, SHA-256 `1D655EAD9B9A9438F58E46B151CC78FA304D420A56F904D692B43089837CE194`) |

## Arquitectura y entrenamiento

El modelo base es un XCiT, un transformer de vision que sustituye la autoatencion sobre tokens por una atencion de covarianza cruzada (cross-covariance attention) que opera sobre los canales de las caracteristicas. Esto reduce el coste computacional a una complejidad lineal respecto al numero de tokens, lo que explica que una variante "tiny" de 12 capas y parches de 8x8 sea tan compacta en parametros y en memoria. El checkpoint de referencia (`fb_dist_in1k`) fue entrenado por Facebook AI sobre ImageNet-1K con destilacion, y esta disponible en la libreria `timm`.

Sobre ese checkpoint, CoreEpoch aplica una cuantizacion post-entrenamiento a INT8 con 128 imagenes de calibracion, sin reentrenamiento ni ajuste fino y sin que el conjunto de calibracion se solape con las 49.872 imagenes de validacion usadas para medir la precision. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de `imagenet-1k`, ni sobre el esquema interno de cuantizacion (por tensor o por canal, pesos y activaciones). No se emplearon tecnicas de RLHF ni DPO, que no aplican a una tarea de clasificacion supervisada.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1K: entrada RGB de 1x3x224x224, salida de logits [1,1000] en orden sorted-synset.
- Inferencia en CPU sin acelerador mediante ONNX Runtime (`CPUExecutionProvider`) o OpenVINO; tambien admite ejecucion en GPU a traves de los execution providers de ONNX Runtime.
- Ejecucion con un unico fichero ONNX de 8,59 MB, sin dependencias de framework de entrenamiento (PyTorch no es necesario en inferencia).
- Preprocesado documentado y reproducible: redimensionado del lado corto a 224 con interpolacion BICUBIC, recorte central de 224x224, division por 255 y normalizacion con media/desviacion tipica de ImageNet (0.485, 0.456, 0.406 / 0.229, 0.224, 0.225).
- Reproducibilidad verificable: scripts `run_classify.py` y `eval_imagenet.py` incluidos en el repositorio, y hash SHA-256 publicado para el binario.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de imagen a etiqueta.
- No hay capacidades multilingues ni procesamiento de lenguaje de ningun tipo.

## Casos de uso

- Clasificacion en el edge sin GPU: el modelo cabe en 8,59 MB y se ejecuta con ONNX Runtime sobre CPU, por lo que puede desplegarse en dispositivos embebidos, gateways industriales o mini-PC donde no hay acelerador disponible y el consumo energetico es una restriccion.
- Moderacion y filtrado de contenido en pipelines de subida: clasificar cada imagen entrante contra las 1000 clases de ImageNet permite descartar o marcar categorias no permitidas antes de almacenar el fichero, con un coste de memoria minimo por instancia.
- Etiquetado automatico de catalogos de producto: para articulos que encajen en las clases de ImageNet (animales, vehiculos, utensilios, electrodomesticos, plantas), el modelo puede preasignar una categoria y reducir el trabajo manual de etiquetado en back-office.
- Procesamiento por lotes de grandes volumenes en servidores CPU-only: al no requerir GPU, se pueden levantar multiples workers en el mismo servidor o en contenedores ligeros y clasificar archivos historicos sin aprovisionar hardware especializado.
- Clasificacion en tiempo de captura dentro de aplicaciones moviles o de escritorio: el fichero ONNX puede embeberse en la aplicacion y ejecutarse localmente, evitando enviar imagenes a un servicio externo por motivos de privacidad o de latencia de red.
- Baseline y comparacion de tecnicas de cuantizacion: al publicar la precision FP32 y la INT8 con el mismo protocolo de evaluacion y el mismo conjunto de validacion, sirve como referencia reproducible para medir el impacto de otros cuantizadores post-entrenamiento.
- Destilacion o generacion de pseudoetiquetas: las predicciones sobre un corpus no etiquetado pueden usarse como etiquetas debiles para entrenar un modelo aun mas pequeno o especifico de dominio, dado el bajo coste de ejecucion del modelo cuantizado.
- Investigacion sobre XCiT en entornos con recursos limitados: permite reproducir y experimentar con la arquitectura XCiT sin necesidad de GPU, ya que la version de referencia en FP32 exige mas memoria y herramientas de entrenamiento.

## Benchmarks y rendimiento

Unica evaluacion publicada en la informacion disponible: validacion de ImageNet-1K con 49.872 imagenes, disjunta de las 128 imagenes de calibracion.

| Modelo | Top-1 | Delta frente a FP32 | Tamano |
|---|---|---|---|
| Baseline FP32 | 81,22% | — | 27,0 MB |
| Kenosis INT8 | 81,16% | −0,06 puntos porcentuales | 8,59 MB |

No se han publicado resultados de benchmarks adicionales (latencia, throughput, robustez, evaluacion por subgrupos o dominios fuera de distribucion) en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: 8,59 MB en INT8 (frente a 27,0 MB en FP32). El consumo de memoria es de decenas de MB contando runtime, activaciones y buffer de entrada.
- VRAM estimada para inferencia: minima; cualquier GPU con unos cientos de MB libres es suficiente. No hay cifras de consumo medido en la informacion proporcionada.
- GPU recomendadas: no requiere A100, H100 ni modelos de gama alta. Cualquier GPU compatible con los execution providers de ONNX Runtime (CUDA, DirectML) sirve; el caso de uso declarado es CPU.
- CPU y edge: es el escenario objetivo. Ejecutable con `CPUExecutionProvider` de ONNX Runtime o con OpenVINO, tanto en x86 como en plataformas embebidas compatibles.
- GPU de consumo: si, cabe con margen amplisimo en cualquier GPU de consumo, e incluso en GPUs integradas y en telefonos moviles mediante ONNX Runtime Mobile.
- Opciones de despliegue: ONNX Runtime y OpenVINO, segun la model card. No se mencionan vLLM, llama.cpp, TGI ni Ollama, que no aplican a un modelo de clasificacion de imagenes.
- Latencia y throughput estimados: no disponible. La model card no publica tiempos de inferencia ni imagenes por segundo en ninguna plataforma.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar el modelo cuantizado con su propio baseline en FP32. No se aportan cifras verificables de otras alternativas de la misma categoria.

| Modelo | Parametros | Top-1 ImageNet | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XCiT-Tiny-12/P8 INT8 (este modelo) | no disponible (estimado ~6,8 M por tamano de fichero) | 81,16% | 8,59 MB | Apache-2.0 | HuggingFace, ONNX |
| XCiT-Tiny-12/P8 FP32 (modelo base) | no disponible | 81,22% | 27,0 MB | Apache-2.0 | HuggingFace (`timm`) |
| Alternativas compactas tipo MobileNetV3, EfficientNet-B0 o DeiT-Tiny | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre modelos comparables, por lo que no se pueden contrastar cifras de terceros sin salir de la informacion disponible.

## Limitaciones y advertencias

- Alcance restringido a 1000 clases de ImageNet: no cubre taxonomias personalizadas, deteccion de objetos, segmentacion, OCR ni descripcion de imagenes. Adaptarlo a otro conjunto de etiquetas exigiria sustituir la cabeza y reentrenar, algo no documentado ni soportado por el repositorio.
- Perdida de precision por cuantizacion: −0,06 puntos porcentuales en ImageNet-1K. El impacto en dominios fuera de distribucion (imagenes medicas, satelite, industrial, baja luminosidad) no esta medido.
- Proceso de cuantizacion propietario: el cuantizador Kenosis no es abierto y no se detalla el esquema (granularidad, si se cuantizan activaciones). El binario publicado es verificable por hash, pero el procedimiento completo no es reproducible con herramientas publicas.
- Preprocesado sensible: la model card insiste en que el transform medido es lado corto a 224 mas recorte central. Desviarse de ese pipeline (por ejemplo, redimensionado directo a 224x224 o distinto interpolado) puede degradar la precision sin aviso.
- Salida cruda en orden sorted-synset: los logits no incluyen etiquetas legibles; el integrador debe mapear los indices a nombres de clase con su propio fichero de synsets.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion son atipicas (2026). No hay evidencia de uso en produccion por terceros ni evaluaciones independientes.
- Sin datos de sesgo o robustez: no se publican evaluaciones por subgrupos, por clases, ni analisis de falsos positivos en categorias sensibles (personas, razas animales, objetos potencialmente ofensivos), algo relevante si se usa para moderacion de contenido.
- Licencia: el modelo base es Apache-2.0 y esa licencia se mantiene, lo que permite uso comercial y modificacion. Aun asi, la model card remite a CoreEpoch para consultas de licencia y cuantizacion a medida, por lo que conviene verificar los terminos si se pretende redistribuir el binario o usarlo en un producto comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CoreEpoch/xcit-tiny12-p8-int8-imagenet
- Modelo base (timm): https://huggingface.co/timm/xcit_tiny_12_p8_224.fb_dist_in1k
- Sitio de CoreEpoch: https://coreepoch.dev
- Cuantizador Kenosis: https://coreepoch.dev/kenosis/
- Contacto indicado en la model card: core@coreepoch.email
- Paper de XCiT (El-Nouby et al., 2021): citado en la model card, sin URL incluida en la informacion proporcionada
- Resultados de la busqueda web: no se encontro ninguna referencia util sobre el modelo (los resultados obtenidos correspondian a paginas de ayuda de YouTube TV y no guardan relacion con el contenido)
