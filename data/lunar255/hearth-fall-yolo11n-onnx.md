# Lunar255/hearth-fall-yolo11n-onnx

## Resumen

`Lunar255/hearth-fall-yolo11n-onnx` es un export en formato ONNX del modelo de deteccion de caidas `melihuzunoglu/human-fall-detection`, basado en YOLO11 en su variante nano. No se trata de un modelo nuevo: el autor declara explicitamente que no ha reentrenado nada, sino que ha convertido los mismos pesos (`best.pt`, SHA-256 `3f56ad30358d5c63bf8dbc0c1299cf68818c3d291dfb10c94107b94110aadd4c`) a ONNX para poder ejecutarlos con TensorRT 8.2 en una Jetson Nano de 2 GB dentro del proyecto Hearth (Knight Hacks IX).

El modelo resuelve una tarea de deteccion de objetos con tres clases: `0 = fallen` (caido), `1 = sitting` (sentado) y `2 = standing` (de pie). Su relevancia practica esta en el objetivo de despliegue: al publicarse como ONNX con entrada fija y sin NMS embebido en el grafo, se puede integrar en pipelines de inferencia ligeros sobre hardware embebido con JetPack 4.6, un escenario donde los pesos en PyTorch no son directamente utilizables.

Se distribuyen dos variantes segun la resolucion de entrada, `best_640.onnx` (640 x 640) y `best_416.onnx` (416 x 416), ambas bajo licencia AGPL-3.0 heredada del modelo base. El repositorio figura con 0 descargas y 0 likes, y su tamano declarado es de 0,0 GB, por lo que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (variante nano, `yolo11n`), red de deteccion de objetos de una sola etapa; exportada a grafo ONNX de opset 12 |
| Parametros totales | no disponible (el autor no publica el recuento; la nomenclatura `n` corresponde a la variante nano de YOLO11) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision con entrada de imagen fija de 640 x 640 o 416 x 416 píxeles |
| Tipos de cuantizacion | no disponible; el repositorio publica unicamente exports ONNX en float32. La model card menciona TensorRT como destino de ejecucion, pero no documenta variantes FP16 ni INT8 |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | AGPL-3.0, segun la declaracion del autor del modelo base |
| Formato de pesos | ONNX (opset 12, entrada fija, sin NMS en el grafo). El modelo base se distribuye en `.pt` de PyTorch |

Detalle de los ficheros publicados:

| Fichero | Entrada | Entrada -> salida | Diferencia maxima frente a PyTorch |
|---|---|---|---|
| `best_640.onnx` | 640 x 640 | `[1, 3, 640, 640]` -> `[1, 7, 8400]` | 8,2e-04 |
| `best_416.onnx` | 416 x 416 | `[1, 3, 416, 416]` -> `[1, 7, 3549]` | 4,9e-04 |

Contrato de entrada y salida: la entrada se llama `images`, es float32 con forma `1x3xHxW` en RGB, con valores normalizados en el rango 0..1 y con letterbox aplicado (se conserva la relacion de aspecto y se rellena con gris de valor 114). La salida se llama `output0` y tiene forma `1 x (4 + 3) x N`: las cuatro primeras componentes son el centro x, el centro y, la anchura y la altura de la caja en píxeles de la imagen de entrada, seguidas de las puntuaciones de las tres clases (`fallen`, `sitting`, `standing`).

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 en su variante nano, un detector de objetos de una sola etapa que predice cajas y puntuaciones de clase de forma directa sobre una rejilla de posiciones candidatas (8400 para 640 x 640 y 3549 para 416 x 416). El autor no aporta detalles sobre el backbone, el cuello de agregacion de caracteristicas ni la cabeza de deteccion, mas alla de la designacion `yolo11n`. El grafo ONNX se exporto con opset 12, con tamano de entrada fijo y sin supresion de no maximos (NMS) embebida: el filtrado de cajas debe realizarse despues de la inferencia, en el codigo de la aplicacion.

No hubo reentrenamiento ni ajuste fino. Los pesos son identicos a los del modelo base `melihuzunoglu/human-fall-detection` en la revision `97261b03632a9715a27481b2cfdac6a78e26d2d9`; la unica transformacion es el cambio de formato. La validacion realizada por el autor consiste en ejecutar la misma fotografia a traves de PyTorch y de ONNX Runtime y comprobar que las decisiones por encima de un umbral de puntuacion de 0,25 coinciden en todas las posiciones, con diferencias en los valores crudos atribuibles unicamente al redondeo en coma flotante (columnas de diferencia maxima de la tabla anterior). No se detallan los datos de entrenamiento, el numero de imagenes, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos o ajuste por refuerzo; la model card remite a la ficha del modelo base para esa informacion.

La innovacion tecnica relevante aqui no esta en la arquitectura, sino en el empaquetado: la exportacion permite ejecutar el modelo con TensorRT 8.2 sobre JetPack 4.6, un entorno en el que las versiones modernas de PyTorch y de las herramientas de Ultralytics no estan disponibles de forma sencilla.

## Capacidades

- Deteccion de objetos con tres clases: persona caida (`fallen`), persona sentada (`sitting`) y persona de pie (`standing`).
- Localizacion espacial: devuelve cajas delimitadoras en coordenadas de píxel de la imagen de entrada, lo que permite situar a la persona dentro del encuadre.
- Inferencia sobre imagen fija: la entrada es un tensor `1x3xHxW` normalizado, apto para procesar fotogramas individuales capturados por una camara.
- Ejecucion sin dependencia de PyTorch: al ser un grafo ONNX, se puede desplegar con ONNX Runtime o convertir a TensorRT sin la pila de entrenamiento.
- Dos resoluciones de trabajo: 640 x 640 y 416 x 416, lo que permite intercambiar precision por coste computacional segun el hardware.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de modo de razonamiento, capacidad de agente, entrada de audio ni procesamiento multilingue.

## Casos de uso

- Monitorizacion doméstica de personas mayores: el modelo procesa fotogramas de una camara fija en una habitacion y marca posibles caidas para revision humana, con las tres clases disponibles permitiendo distinguir entre una persona caida y una persona sentada o de pie en el suelo.
- Despliegue en hardware embebido de bajo coste: es el escenario declarado por el autor; el export ONNX esta pensado para ejecutarse con TensorRT 8.2 en una Jetson Nano de 2 GB con JetPack 4.6, lo que habilita nodos de vigilancia sin GPU de servidor.
- Sistema de alertas con umbral configurable: al no incluir NMS en el grafo, la aplicacion puede aplicar su propia supresion de no maximos y su propio umbral de puntuacion (el autor valida coherencia de decisiones a partir de 0,25), ajustando la sensibilidad según la tasa de falsos positivos tolerable.
- Investigacion y prototipado en vision por computador: sirve como punto de partida reproducible para comparar tecnicas de deteccion de caidas, ya que los pesos y el hash del fichero original estan documentados.
- Preservacion de la privacidad mediante procesamiento en el borde: al ejecutarse localmente en un dispositivo embebido, el flujo de video no necesita salir del domicilio, lo que reduce la exposicion de datos personales en el marco del RGPD.
- Integracion en pipelines de video existentes: la salida `1 x 7 x N` es un tensor plano facil de consumir desde OpenCV, GStreamer o DeepStream para encadenar deteccion y logica de alerta.
- Evaluacion comparativa de formatos de exportacion: permite medir en un caso real la diferencia numerica entre PyTorch y ONNX Runtime (del orden de 1e-04 a 1e-03) y el impacto en latencia de pasar a TensorRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de deteccion como mAP, precision, recall ni F1 sobre el dataset de validacion del modelo base.

El unico dato cuantitativo publicado es la desviacion numerica entre la ejecucion en PyTorch y en ONNX Runtime:

| Fichero | Entrada | Salida | Diferencia maxima frente a PyTorch | Coincidencia de decisiones (umbral 0,25) |
|---|---|---|---|---|
| `best_640.onnx` | 640 x 640 | `[1, 7, 8400]` | 8,2e-04 | Si, en todas las posiciones |
| `best_416.onnx` | 416 x 416 | `[1, 7, 3549]` | 4,9e-04 | Si, en todas las posiciones |

No hay datos de latencia, throughput ni consumo energetico en la informacion proporcionada. Tampoco se publican comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el consumo de memoria. El hecho de que el modelo se ejecute en una Jetson Nano de 2 GB indica que el modelo y su runtime caben en ese presupuesto, pero no se detalla el reparto entre pesos, activaciones y sistema.
- GPU objetivo declarada: Jetson Nano 2 GB con JetPack 4.6 y TensorRT 8.2.
- GPUs compatibles: cualquier GPU NVIDIA con soporte de TensorRT o de ONNX Runtime con execution provider CUDA. Una RTX 4090, una A100 o una H100 serian enormemente sobredimensionadas para un detector de la variante nano.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en GPU integradas o en CPU mediante ONNX Runtime, aunque no se aportan cifras de latencia que lo confirmen.
- Opciones de despliegue: ONNX Runtime (utilizado por el autor para la validacion) y TensorRT 8.2 sobre JetPack 4.6. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.
- Tamano de los ficheros: no disponible; el repositorio figura con un tamano declarado de 0,0 GB, lo que impide estimar el peso de los dos ficheros ONNX.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Lunar255/hearth-fall-yolo11n-onnx` | Deteccion de caidas (3 clases) | no disponible | 640 x 640 y 416 x 416 | ONNX opset 12 | AGPL-3.0 | HuggingFace, 0 descargas |
| `melihuzunoglu/human-fall-detection` | Deteccion de caidas (3 clases) | no disponible | no disponible | PyTorch `.pt` | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| YOLO11n preentrenado en COCO | Deteccion de objetos genericos (80 clases) | no disponible en la informacion proporcionada | configurable | PyTorch, ONNX y otros | AGPL-3.0 (Ultralytics) | Publico |

La comparacion cuantitativa no es posible con los datos disponibles: no se publican metricas de precision ni de latencia para ninguno de los tres. La diferencia principal entre este modelo y el modelo base es exclusivamente el formato de pesos, ya que comparten los mismos valores numericos. Frente a un YOLO11n generico preentrenado en COCO, la diferencia esta en la cabeza de clasificacion: tres clases especificas de postura frente a ochenta clases genericas.

## Limitaciones y advertencias

- No es un dispositivo medico ni ha sido validado clinicamente. El autor lo indica de forma explicita en la model card.
- Una persona tumbada de forma intencionada produce la misma salida que una caida real. El modelo no distingue intencionalidad ni contexto temporal.
- No se publican metricas de precision, recall ni falsos positivos sobre la camara objetivo. El propio autor senala que la precision en la camara de destino tiene que medirse.
- El modelo solo mira fotogramas individuales: no hay memoria temporal, por lo que no puede distinguir una caida de una postura estatica mantenida.
- Limitacion de encuadre: la model card lo describe como una demostracion de monitorizacion de una sola habitacion con camara fija.
- La salida no incluye NMS: si se consume el tensor crudo sin filtrar, se obtendran multiples cajas solapadas por objeto. Es responsabilidad de la aplicacion aplicar la supresion de no maximos.
- Tamano de entrada fijo: solo se admiten 640 x 640 o 416 x 416; otras resoluciones requieren reexportar el modelo.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en un servicio accesible por red puede obligar a liberar el codigo fuente de la aplicacion que lo integra. Conviene revisar las implicaciones antes de un despliegue comercial o propietario.
- No hay datos sobre sesgos del dataset de entrenamiento, composicion demografica de las imagenes ni condiciones de iluminacion cubiertas.
- Riesgo de privacidad: se trata de un sistema de videovigilancia sobre personas. Cualquier despliegue real debe cumplir el RGPD y la normativa aplicable sobre tratamiento de imagenes en el hogar o en residencias.
- Publicacion sin traccion: 0 descargas y 0 likes, sin issues ni validacion externa conocida. La fiabilidad en produccion no esta contrastada por terceros.
- Fecha de creacion declarada en el repositorio: 2026-10-10, con actualizacion el mismo dia. No hay historial de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lunar255/hearth-fall-yolo11n-onnx
- Modelo base: https://huggingface.co/melihuzunoglu/human-fall-detection
- Revision concreta del modelo base usada para el export: `97261b03632a9715a27481b2cfdac6a78e26d2d9`
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Las URLs devueltas por la busqueda no guardan relacion con el modelo, su arquitectura ni su dominio de aplicacion, por lo que se descartan.
