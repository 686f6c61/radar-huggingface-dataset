# BashirEmran/ScoreVision

## Resumen

ScoreVision es un detector de objetos de tipo YOLO publicado por BashirEmran en Hugging Face, orientado especificamente a la deteccion de bebidas en imagenes: vasos (cup), latas (can) y botellas (bottle). El modelo se distribuye como un unico fichero `weights.onnx` de aproximadamente 0,1 GB y se complementa con un script de inferencia (`miner.py`) que ejecuta el modelo en CPU mediante onnxruntime. Su proposito declarado es servir como componente de deteccion para el pipeline `manak0/Detect-beverage-detect`, no como un modelo de lenguaje generativo.

Tecnicamente se trata de un detector de una sola escala (stride 8) con entrada RGB de 864x864 pixeles y salida en forma de tensor `[1, 7, N]`: cuatro coordenadas de caja (cx, cy, w, h en pixeles de entrada) mas tres puntuaciones sigmoideas por clase (cup, can, bottle). El postprocesado incluye letterbox, NMS por clase y una compuerta (`gate`) que descarta imagenes sin bebidas cuando la mejor candidata no supera un umbral configurable.

La relevancia de este modelo es acotada: no es un modelo fundacional ni compite en la categoria de LLM o VLM, sino que es una pieza de vision por computador especializada y ligera, pensada para ejecutarse en CPU con latencias del orden de decenas de milisegundos. La informacion disponible es escasa (sin licencia, sin idiomas, sin benchmarks publicados) y la model card es fundamentalmente una descripcion del formato de pesos y del script de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos estilo YOLO, una sola escala (stride 8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`) |
| Entrada | Imagen RGB 864x864 (letterbox) |
| Salida | Tensor `[1, 7, N]`: cx, cy, w, h + 3 puntuaciones sigmoideas (cup, can, bottle) |
| Clases | cup, can, bottle |
| Tamano del repo | 0,1 GB |
| Runtime de referencia | onnxruntime en CPU, 2 hilos intra-op |

## Arquitectura y entrenamiento

La arquitectura es un detector de objetos de tipo YOLO con una unica escala de prediccion (stride 8), lo que implica que la rejilla de salida tiene una resolucion relativamente alta respecto a la entrada de 864x864. La cabeza produce, por cada ancla o punto de la rejilla, cuatro valores de caja en pixeles de entrada y tres puntuaciones independientes con activacion sigmoidea, una por clase (cup, can, bottle). No se trata de un transformer ni de un modelo multimodal: es un detector convolucional especializado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, la composicion de clases, el esquema de aumentacion ni si se aplicaron tecnicas de destilacion o ajuste fino a partir de un checkpoint previo. La model card unicamente describe el formato de pesos y el pipeline de inferencia, por lo que cualquier detalle sobre el proceso de entrenamiento debe considerarse no disponible. Tampoco se documentan innovaciones tecnicas destacables mas alla del diseno de una sola escala y del mecanismo de compuerta (`gate`) para descartar imagenes sin bebidas.

## Capacidades

- Deteccion de tres clases de objetos relacionados con bebidas: vasos (cup), latas (can) y botellas (bottle).
- Salida de cajas delimitadoras con coordenadas en pixeles de la imagen de entrada (tras letterbox).
- Puntuaciones de confianza por clase mediante sigmoide, lo que permite umbralizar de forma independiente.
- Postprocesado integrado en `miner.py`: letterbox al tamano de entrada del modelo, NMS por clase y seleccion del conjunto de cajas con mayor puntuacion esperada.
- Mecanismo de compuerta (`gate`): si la mejor candidata no supera el umbral configurado, no se envia ninguna deteccion (util para imagenes sin bebidas).
- Inferencia determinista en CPU con onnxruntime y numpy, sin dependencias de GPU.
- Ejecucion por lotes (`predict_batch`) con latencias documentadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la deteccion de las tres clases citadas.

## Casos de uso

- Inventario automatico en hosteleria: procesar fotos de barras o estanterias para contar vasos, latas y botellas presentes, usando `predict_batch` sobre lotes de imagenes y la compuerta para descartar tomas sin bebidas.
- Control de stock en almacenes de bebidas: integracion del detector en un pipeline de vision industrial que analice imagenes de palets o lineas de envasado y reporte recuentos por clase.
- Verificacion de pedidos en reparto: dado que el modelo distingue cup, can y bottle, puede usarse para comprobar de forma aproximada que un pedido contiene los tipos de envase esperados a partir de una foto.
- Moderacion o clasificacion de contenido en plataformas: filtrar imagenes que contienen bebidas (por ejemplo, para cumplir politicas de publicidad de alcohol) apoyandose en la compuerta para no marcar imagenes irrelevantes.
- Analisis de aforo y consumo en eventos: procesar imagenes de mesas o zonas comunes para estimar la presencia de envases y apoyar tareas de limpieza o logistica.
- Preprocesado para pipelines mayores: usar ScoreVision como etapa de deteccion que recorta regiones de interes (vasos, latas, botellas) antes de pasarlas a un clasificador o a un VLM, aprovechando su bajo coste en CPU (61 ms por imagen de 1024x1024 en 2 nucleos EPYC 7542).
- Prototipado en entornos sin GPU: al ejecutarse con onnxruntime en CPU con 2 hilos, es adecuado para pruebas en portatiles, contenedores ligeros o dispositivos edge donde no hay acelerador disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento documentado es la latencia de `predict_batch` en 2 nucleos de CPU fijados (AMD EPYC 7542): 61 ms por imagen de 1024x1024 de media, 72 ms incluyendo decodificacion PNG, con p95 de 75 ms. No se proporcionan metricas de precision (mAP, recall, precision) sobre ningun conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo de referencia, que es CPU-only con onnxruntime; en GPU el consumo seria minimo por el tamano del modelo (repo de 0,1 GB), pero no se documenta.
- GPU recomendadas: no disponible; el autor no publica configuracion GPU.
- Compatibilidad con GPU de consumo: previsiblemente cualquier GPU moderna podria ejecutar el ONNX, pero no hay datos publicados que lo confirmen.
- CPU de referencia: AMD EPYC 7542 con 2 nucleos fijados y 2 hilos intra-op en onnxruntime.
- Opciones de despliegue: onnxruntime en CPU (documentado); el formato ONNX permite en teoria otros runtimes (TensorRT, OpenVINO, DirectML), aunque no se documentan.
- Latencia: 61 ms por imagen de 1024x1024 en el hardware de referencia; 72 ms con decodificacion PNG; p95 de 75 ms.
- Throughput: no disponible de forma explicita, aunque a partir de la latencia media se puede estimar en torno a 16 imagenes por segundo por instancia con 2 nucleos, sin contar el coste de decodificacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores (por ejemplo, variantes de YOLO de tamano similar) ni datos de rendimiento que permitan establecer una comparativa rigurosa. Tampoco se identifican en la model card modelos alternativos de la misma categoria o del mismo autor.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es un riesgo relevante para produccion.
- No se documentan sesgos conocidos, pero al ser un detector entrenado sobre un dataset no descrito, puede presentar sesgos de dominio (iluminacion, angulos, tipos de envase, geografia) imposibles de evaluar.
- Riesgo de falsos positivos y falsos negativos en imagenes con oclusiones, envases parcialmente visibles o clases visualmente similares (por ejemplo, un vaso transparente frente a una botella).
- La compuerta (`gate`) mitiga los envios en imagenes sin bebidas, pero su calibracion no se documenta y podria descartar detecciones validas si el umbral es demasiado alto.
- El modelo solo detecta tres clases; no reconoce otras categorias ni proporciona atributos adicionales (marca, color, tamano).
- La resolucion de entrada esta fijada en 864x864 con letterbox, lo que puede degradar la deteccion de objetos muy pequenos.
- No hay informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura ni la calidad de las anotaciones.
- No se publican metricas de precision; no se recomienda su uso en produccion sin una validacion propia sobre el dominio objetivo.
- El pipeline de referencia usa versiones de paquetes concretas (`chute_config.yml`); cambios de version en onnxruntime podrian alterar el comportamiento numerico.
- El modelo esta pensado como componente de `manak0/Detect-beverage-detect`; su uso aislado fuera de ese contexto no esta documentado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BashirEmran/ScoreVision
- Pipeline de referencia mencionado en la model card: `manak0/Detect-beverage-detect` (no se proporciona URL directa en la informacion disponible)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
