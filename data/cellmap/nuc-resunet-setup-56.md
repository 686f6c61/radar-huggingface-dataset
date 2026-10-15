# cellmap/nuc-resunet-setup-56

## Resumen

nuc-resunet-setup-56 es un modelo de segmentacion semantica 3D desarrollado por el equipo CellMap (Janelia Research Campus, Howard Hughes Medical Institute) para detectar nucleos (nuc) en volúmenes de microscopia electronica FIB-SEM a una resolucion de vóxel de 128 nm. El modelo pertenece a la familia de modelos publicados por la organizacion cellmap en HuggingFace y se distribuye bajo la libreria `cellmap-models`, con pesos exportados simultaneamente a torch.export, TorchScript y ONNX.

Arquitecturalmente es un `ResUNet3DValid`: una U-Net residual tridimensional con normalizacion InstanceNorm y convoluciones validas (sin padding), lo que reduce el campo de salida respecto a la entrada (300x300x300 vóxeles de entrada producen 212x212x212 de salida, es decir, 88 vóxeles de contexto perdidos por eje). La red tiene 1 canal de entrada y 1 canal de salida, y devuelve logits crudos sobre los que debe aplicarse una sigmoid posteriormente.

El checkpoint corresponde al setup 56 del experimento `exp_mito` y fue entrenado durante 350.000 iteraciones. Su relevancia practica esta en el campo de la conectomica y la biologia celular cuantitativa: permite obtener mascaras de nucleos en volumen de forma automatizada sobre imagenes de EM, una tarea tradicionalmente manual y muy costosa en tiempo de anotacion. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet3DValid (U-Net residual 3D, InstanceNorm, convoluciones validas) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; ventana de entrada fija de 300x300x300 vóxeles, con 88 vóxeles de contexto perdidos por eje |
| Tipos de cuantizacion | no disponible (pesos exportados en precision nativa, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | torch.export (`model.pt2`), TorchScript (`model.ts`), ONNX (`model.onnx` + `model.onnx.data`), y `metadata.json` |
| Dimensiones espaciales | 3 |
| Canales de entrada / salida | 1 / 1 |
| Etiqueta de canal | nuc |
| Tamano de vóxel (entrada y salida) | 128 x 128 x 128 nm |
| Forma de entrada en inferencia | 300 x 300 x 300 |
| Forma de salida en inferencia | 212 x 212 x 212 |
| Normalizacion de entrada | min-max con min = -1.0 y max = 1.0 |
| Activacion de salida | sigmoid, aplicada despues del modelo (`apply_after_model: true`) |
| Iteracion de entrenamiento | 350.000 |
| Framework | PyTorch |
| Libreria | cellmap-models |
| Tamano del repositorio | 0,1 GB |
| Autor del modelo | Marwan Zouinkhi |
| Fecha de creacion (metadatos) | 2026-10-15 |
| Fecha de actualizacion (metadatos) | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo implementa una U-Net residual 3D (`ResUNet3DValid`) con bloques residuales y normalizacion InstanceNorm en lugar de BatchNorm, eleccion habitual en segmentacion de volumenes de microscopia electronica porque el tamano de lote efectivo suele ser muy pequeno (a menudo 1) y las estadisticas por instancia son mas estables. La variante "Valid" implica convoluciones sin padding: cada capa reduce las dimensiones espaciales, de modo que la red no rellena bordes con ceros y evita artefactos de frontera. El coste es que la salida es 88 vóxeles menor por eje que la entrada (300 a 212), lo que obliga a solapar bloques y ensamblar el volumen final por mosaico.

La red opera sobre un unico canal de entrada (la intensidad de la imagen FIB-SEM normalizada de forma min-max al rango [-1, 1]) y produce un unico canal de logits que debe transformarse con una sigmoid para obtener probabilidades de nucleo. El entrenamiento corresponde al setup 56 del experimento `exp_mito`, con 350.000 iteraciones completadas. No se dispone de informacion en la documentacion proporcionada sobre el numero exacto de tokens/vóxeles de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de aumento de datos, ni si hubo alguna fase de ajuste fino con refuerzo o preferencias (no aplicable en segmentacion). Tampoco se documenta el numero de parametros de la red ni el detalle de los bloques residuales (profundidad, numero de canales por nivel).

## Capacidades

- Segmentacion semantica 3D de nucleos celulares en imagenes de microscopia electronica FIB-SEM a 128 nm de resolucion.
- Salida binaria por vóxel (canal unico `nuc`), en forma de logits crudos que requieren sigmoid posterior.
- Procesamiento de volumenes 3D completos mediante ventanas de 300x300x300 vóxeles, con ensamblaje por mosaico para cubrir muestras mayores.
- Exportacion multiplataforma: el mismo modelo puede ejecutarse en PyTorch (TorchScript o torch.export) y en ONNX Runtime, incluida una version web (`cellmap/onnx-web-models/setup_56`).
- Reentrenamiento y ajuste fino: la version `model.pt2` cargada con `torch.export` se puede convertir en entrenable mediante `CellmapModel.train()`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de vision 3D.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.

## Casos de uso

- Segmentacion automatizada de nucleos en volumenes de FIB-SEM: el modelo recibe bloques de 300x300x300 vóxeles y devuelve mascaras 212x212x212, que se ensamblan con solape para reconstruir el volumen completo de una muestra biologica.
- Conteo y morfometria nuclear: a partir de la mascara binaria se pueden calcular numero de nucleos, volumen individual, esfericidad y posicion en el tejido, tareas habituales en estudios de proliferacion y densidad celular.
- Aceleracion de la anotacion manual en pipelines de conectomica: las predicciones se usan como propuesta inicial que un anotador corrige, reduciendo el tiempo de etiquetado respecto a la anotacion desde cero.
- Generacion de datos de entrenamiento para modelos posteriores: las mascaras producidas pueden servir como pseudo-etiquetas para entrenar segmentadores mas ligeros o especificos de una modalidad.
- Analisis de morfologia mitocondrial y contexto celular: el setup 56 pertenece al experimento `exp_mito`, por lo que su salida de nucleos es util como referencia espacial al estudiar la distribucion de mitocondrias respecto al nucleo.
- Integracion en entornos con restricciones de framework: al disponer de exportacion ONNX, el modelo puede desplegarse en servicios de inferencia basados en ONNX Runtime o en aplicaciones web sin dependencia de PyTorch.
- Reproducibilidad de experimentos CellMap: investigadores que comparan variantes de la familia `cellmap-models` pueden ejecutar este checkpoint (setup 56) y contrastarlo con otros setups bajo la misma interfaz `CellmapModel`.
- Investigacion en segmentacion 3D de imagenes cientificas: sirve como punto de partida (`model.pt2` entrenable) para adaptar la red a otras estructuras celulares o a otras resoluciones de vóxel mediante ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de validacion (IoU, Dice, precision, recall, F1) ni comparaciones numericas con otros modelos. Tampoco se documentan tiempos de inferencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El coste dominante no son los pesos (el repositorio completo ocupa 0,1 GB e incluye tres formatos de exportacion), sino las activaciones de la U-Net 3D a resolucion casi completa. Como referencia de calculo, un unico tensor de 300x300x300 en float32 ocupa aproximadamente 108 MB; los mapas de caracteristicas con decenas de canales a esa resolucion escalan ese valor de forma lineal con el numero de canales.
- Estimacion orientativa: dado que los pesos son pequenos pero las activaciones a resolucion completa son grandes, se puede inferir que el modelo cabe en GPUs de gama alta de consumo, si bien no hay medidas publicadas que lo confirmen.
- GPUs recomendadas: no disponible. Por geometria de entrada (300x300x300) y naturaleza 3D del calculo, son razonables GPU con amplia memoria y buen rendimiento en float32, pero no se dispone de datos especificos del autor.
- Cabe en GPU de consumo: no confirmado; depende del numero de canales por nivel, que no se documenta. Se recomienda probar con volúmenes de entrada progresivamente mayores para medir el consumo real.
- Opciones de despliegue: ONNX Runtime (`onnxruntime.InferenceSession("model.onnx")`), PyTorch con TorchScript (`torch.jit.load("model.ts")`), PyTorch con torch.export (`torch.export.load("model.pt2")`) y la libreria `cellmap-models` mediante `CellmapModel`. No aplican vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. A continuacion se recogen las alternativas identificables y lo que se conoce de cada una; las celdas sin datos se marcan como "no disponible".

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cellmap/nuc-resunet-setup-56 | ResUNet3DValid, segmentacion de nucleos en FIB-SEM | no disponible | 300x300x300 vóxeles | BSD-3-Clause | HuggingFace + ONNX web + `cellmap-models` |
| cellmap/onnx-web-models (setup_56) | Misma red en formato ONNX para web | no disponible | no disponible | no disponible | HuggingFace |
| Otros setups de la familia `cellmap-models` | ResUNet3D para distintas estructuras y experimentos | no disponible | no disponible | no disponible | HuggingFace / GitHub |
| Segmentadores 3D genericos de microscopia (por ejemplo, enfoques tipo Cellpose o nnU-Net) | Segmentacion celular generalista | no disponible | no disponible | no disponible | no disponible |

No se ha localizado en la informacion proporcionada ninguna comparacion oficial entre este checkpoint y las alternativas del sector.

## Limitaciones y advertencias

- Modelo monodominio: esta entrenado para nucleos en FIB-SEM a 128 nm. Su aplicacion a otras modalidades (microscopia optica, criomicroscopia, tomografia) o a otras resoluciones de vóxel no esta validada y probablemente degrade el rendimiento.
- Salida restringida: solo produce el canal `nuc`. No segmenta otras estructuras ni ofrece etiquetas multi-clase.
- Perdida de contexto por convoluciones validas: la salida es 88 vóxeles menor por eje que la entrada. Ignorar este margen al ensamblar mosaicos puede generar costuras o zonas sin prediccion.
- Normalizacion obligatoria: la entrada debe normalizarse de forma min-max al rango [-1, 1]. Omitir este paso o usar otra normalizacion invalida las predicciones, ya que los pesos asumen esa distribucion.
- Activacion posterior obligatoria: el modelo devuelve logits, no probabilidades. Es necesario aplicar una sigmoid despues de la inferencia antes de umbralizar.
- Riesgo de falsos positivos y falsos negativos: al no publicarse metricas de validacion, no es posible cuantificar el error esperado ni fijar un umbral optimo sin una evaluacion propia sobre datos del usuario.
- Sin informacion sobre sesgos del dataset: se desconoce la composicion del conjunto de entrenamiento (especies, tipos de tejido, condiciones de adquisicion), por lo que no se puede evaluar su representatividad ni su comportamiento en dominios fuera de distribucion.
- Numero de descargas y likes nulo: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.
- Fechas de metadatos anomalas: la creacion y actualizacion figuran como 2026-10-15, una fecha futura respecto a la mayoria de referencias; conviene verificar la vigencia del repositorio.
- Licencia permisiva pero con condiciones: BSD-3-Clause permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad, y que no se use el nombre de los titulares para promocionar derivados sin permiso.
- Sin garantias de produccion: no se documentan pruebas de robustez, versionado de pesos ni politica de mantenimiento del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/nuc-resunet-setup-56
- Version ONNX para web (setup 56): https://huggingface.co/cellmap/onnx-web-models
- Repositorio de codigo cellmap-models: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia): https://www.janelia.org/project-team/cellmap
