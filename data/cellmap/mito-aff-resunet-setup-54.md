# cellmap/mito-aff-resunet-setup-54

## Resumen

mito_aff_resunet_setup_54 es un modelo de segmentacion de mitocondrias en volumenes de microscopia electronica FIB-SEM, desarrollado por Marwan Zouinkhi dentro del proyecto CellMap del Janelia Research Campus (HHMI). No es un modelo de lenguaje: se trata de una red neuronal convolucional 3D que predice afinidades direccionales entre voxeles, que despues se agrupan mediante post-proceso para obtener instancias de mitocondrias individuales.

El modelo sigue la arquitectura ResUNet3DValid, una U-Net residual tridimensional con normalizacion InstanceNorm y convoluciones validas (sin padding), lo que implica que cada inferencia descarta 88 voxeles de contexto por eje: una entrada de 300x300x300 voxeles produce una salida de 212x212x212. Trabaja sobre imagenes FIB-SEM con tamano de voxel isotropico de 16 nm y genera tres canales de afinidad (mito_aff_z, mito_aff_y, mito_aff_x) como logits crudos.

Su relevancia actual es practica para la comunidad de connectomics y biologia celular cuantitativa: se distribuye en formatos PyTorch, TorchScript y ONNX, con licencia permisiva BSD-3-Clause, y existe una version ejecutable en navegador. El checkpoint corresponde al setup_54 del experimento exp_mito, entrenado durante 260000 iteraciones. No se han publicado resultados de benchmarks ni detalles sobre la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet3DValid (U-Net residual 3D con InstanceNorm y convoluciones validas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D; ventana espacial de inferencia de 300x300x300 voxeles) |
| Tipos de cuantizacion | no disponible (se distribuye en precision FP32; no se documenta cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | BSD-3-Clause |
| Formato de pesos | torch.export (model.pt2), TorchScript (model.ts), ONNX (model.onnx + model.onnx.data), metadata.json |
| Dimensiones espaciales | 3 |
| Canales de entrada | 1 |
| Canales de salida | 3 (mito_aff_z, mito_aff_y, mito_aff_x) |
| Tamano de voxel de entrada | 16, 16, 16 nm |
| Tamano de voxel de salida | 16, 16, 16 nm |
| Forma de entrada en inferencia | 300, 300, 300 |
| Forma de salida en inferencia | 212, 212, 212 |
| Normalizacion de entrada | min_max con min = -1.0 y max = 1.0 |
| Activacion de salida | sigmoide aplicada despues del modelo (el modelo emite logits crudos) |
| Iteraciones de entrenamiento | 260000 |
| Framework | torch |
| Biblioteca | cellmap-models |
| Tamano del repositorio | 0.1 GB |
| Fecha de publicacion (metadatos HF) | 2026-10-15 |

## Arquitectura y entrenamiento

La red es una U-Net residual tridimensional clasica con dos decisiones de diseno relevantes. La primera es el uso de convoluciones validas en lugar de convoluciones con padding: al no rellenar bordes, cada capa reduce las dimensiones espaciales, de modo que la salida completa (212^3) ocupa una region central del volumen de entrada (300^3) y deja fuera 88 voxeles de contexto por eje. Esto obliga a procesar los volumenes grandes por teselas solapadas y a descartar o ponderar las zonas de borde de cada tesela. La segunda es el uso de InstanceNorm, habitual en segmentacion de imagenes de microscopia electronica por su estabilidad ante variaciones de intensidad entre muestras, y la presencia de conexiones residuales, que facilitan el entrenamiento de una red profunda sobre volumenes 3D.

El modelo predice tres mapas de afinidad, uno por eje (z, y, x), que codifican la probabilidad de que dos voxeles contiguos pertenezcan a la misma mitocondria. La salida son logits crudos y la sigmoide se aplica fuera del modelo, tal como se indica en la model card. El checkpoint corresponde al setup_54 del experimento exp_mito y se entreno durante 260000 iteraciones, aunque no se especifican la composicion del dataset, el numero de volumenes de entrenamiento, la funcion de perdida, el esquema de aumento de datos ni si hubo ajuste fino posterior. Tampoco se documenta ningun proceso de alineacion con preferencias humanas, algo que no aplica a un modelo discriminativo de segmentacion.

## Capacidades

- Segmentacion 3D de mitocondrias en imagenes de microscopia electronica de bloque serializado por haz focalizado (FIB-SEM) con resolucion de 16 nm.
- Prediccion de afinidades direccionales en los tres ejes espaciales, base para la aglomeracion de instancias mediante watershed u otros algoritmos de post-proceso.
- Procesamiento de volumenes de entrada de 300x300x300 voxeles con un canal, con salida de 212x212x212 voxeles y tres canales.
- Ejecucion en CPU y GPU mediante ONNX Runtime, y en PyTorch mediante torch.export o TorchScript.
- Fine-tuning sobre datos propios: la model card documenta explicitamente el paso a modelo entrenable con `CellmapModel.train()`.
- Despliegue en navegador: existe una exportacion ONNX web publicada en `cellmap/onnx-web-models/setup_54`.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de generacion de texto, codigo, matematicas ni audio.
- No se documenta soporte explicito de volumenes con anisotropia distinta de 16 nm isotropico.

## Casos de uso

- Segmentacion de mitocondrias en pipelines de connectomics: el modelo genera los mapas de afinidad que alimentan un post-proceso de aglomeracion, permitiendo reconstruir mitocondrias instancia a instancia en volumenes de tejido neuronal adquiridos por FIB-SEM. Es adecuado porque su entrenamiento esta especificamente orientado a esta modalidad y resolucion.
- Analisis morfometrico cuantitativo: una vez segmentadas las instancias, se puede medir volumen, superficie, elongacion y numero de mitocondrias por celula o por region de tejido, lo que resulta util en estudios de metabolismo energetico y neurodegeneracion.
- Pre-anotacion para anotacion humana: el modelo puede generar una segmentacion inicial sobre la que un experto corrige, reduciendo el coste de producir nuevos conjuntos de datos de referencia para reentrenar el propio modelo o variantes posteriores.
- Fine-tuning para nuevos tejidos o preparaciones: partiendo de `model.pt2` y del metodo `CellmapModel.train()`, un laboratorio puede adaptar el checkpoint a un tipo de muestra distinto, aprovechando el conocimiento ya aprendido sobre morfologia mitocondrial.
- Inferencia en el navegador o en aplicaciones de escritorio: la exportacion ONNX y el reducido tamano del repositorio (0.1 GB) permiten ejecutar la segmentacion de una tesela en el cliente, sin necesidad de infraestructura de servidor, para demos interactivas o herramientas de inspeccion rapida.
- Control de calidad durante la adquisicion: procesar teselas de 300x300x300 en paralelo con la microscopia permitiria detectar degradacion de la imagen (desenfoque, deriva, baja relacion senal-ruido) a partir de la coherencia de las afinidades predichas.
- Analisis de poblaciones en cribados de alto rendimiento: al ser un modelo de 0.1 GB exportable a ONNX, se puede desplegar en multiples nodos con GPU modestas para procesar grandes lotes de volumenes y comparar la morfologia mitocondrial entre condiciones experimentales.
- Segmentacion auxiliar en estudios de enfermedad mitocondrial: la comparacion de las instancias obtenidas entre muestras control y mutantes permite caracterizar alteraciones morfologicas de la red mitocondrial, siempre que las imagenes compartan la misma modalidad y resolucion de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (por ejemplo, IoU, Dice o variacion de informacion) ni comparaciones con otros modelos, y tampoco se han encontrado articulos o informes tecnicos asociados en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion del autor. Como referencia de calculo, un tensor de activacion a resolucion completa de 300x300x300 en FP32 ocupa 108 MB por canal, de modo que la memoria pico depende del numero de canales del primer nivel del encoder. Con decenas de canales, la inferencia de una tesela completa requiere varios gigabytes de VRAM. Esta estimacion es propia y no esta confirmada por el autor.
- Pesos del modelo: el repositorio completo ocupa 0.1 GB, por lo que los pesos en si son pequenos (del orden de decenas de MB) y residen sin problema en memoria de CPU.
- GPU recomendadas: no hay recomendacion oficial. Cualquier GPU con 8 GB o mas de VRAM deberia poder ejecutar una tesela de 300^3 en FP32; tarjetas como A100, H100 o RTX 4090 reducen el tiempo por volumen en procesamiento por lotes. No se dispone de datos medidos.
- Cabe en GPU de consumo: probablemente si en modelos con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), aunque no esta verificado por el autor. Si la memoria es ajustada, se puede reducir el tamano de tesela, teniendo en cuenta que la salida se reduce en 88 voxeles por eje respecto a la entrada.
- Opciones de despliegue: PyTorch con `torch.export.load("model.pt2")`, TorchScript con `torch.jit.load("model.ts")`, ONNX Runtime con `onnxruntime.InferenceSession("model.onnx")` (CPU o CUDA) y la biblioteca `cellmap-models`. Entornos como vLLM, llama.cpp, Ollama o TGI no aplican, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia por tesela ni voxeles por segundo.
- Detalles de integracion a tener en cuenta: la entrada debe normalizarse con min_max en el rango [-1, 1] y la sigmoide debe aplicarse despues del modelo, ya que la salida son logits crudos.

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados para este checkpoint ni para alternativas directas, por lo que la comparacion es necesariamente cualitativa y con numerosos campos no disponibles.

| Modelo | Tipo | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cellmap/mito-aff-resunet-setup-54 | ResUNet3DValid, afinidades de mitocondria | 1 canal, 300x300x300 voxeles a 16 nm | BSD-3-Clause | HuggingFace (PyTorch, TorchScript, ONNX) | Checkpoint exp_mito setup_54, 260000 iteraciones |
| cellmap/onnx-web-models (setup_54) | Misma red exportada a ONNX | Igual que el anterior | no disponible en la informacion consultada | HuggingFace | Version orientada a ejecucion web del mismo experimento |
| nnU-Net (framework) | Framework de segmentacion 3D auto-configurado | Depende del dataset | Apache-2.0 | Codigo abierto, sin pesos preentrenados de mitocondria | Requiere reentrenar sobre datos propios; no comparable en pesos |
| Cellpose 3.0 | Segmentacion de celulas generalista | 2D y volumenes apilados | BSD-3-Clause (segun su repositorio) | Codigo abierto y pesos publicos | Orientado a microscopia optica y de fluorescencia; su aplicacion a FIB-SEM no esta garantizada |

La comparacion con alternativas genericas debe tomarse con cautela: sin metricas publicadas por el autor, no es posible afirmar que este checkpoint sea mejor o peor que una red entrenada a medida con nnU-Net sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Dominio de aplicacion restringido: el modelo esta entrenado sobre FIB-SEM a 16 nm isotropicos. Aplicarlo a otra modalidad (por ejemplo, TEM, SEM de superficie o microscopia de fluorescencia) u otra resolucion probablemente degrade gravemente los resultados.
- Especificidad de clase: predice unicamente afinidades de mitocondrias. No segmenta otras organelas, membranas, sinapsis ni nucleos.
- Salida no instanciada: el resultado son mapas de afinidad, no etiquetas de instancia. Es obligatorio un post-proceso de aglomeracion o watershed, y la calidad final depende tanto del modelo como de ese paso.
- Perdida de bordes por convoluciones validas: cada inferencia descarta 88 voxeles por eje. Sin solapamiento entre teselas se producen discontinuidades en las fronteras, lo que puede fragmentar o fusionar mitocondrias en el volumen completo.
- Riesgo de falsos positivos y negativos: en regiones de bajo contraste, imagenes ruidosas o cortes defectuosos, las afinidades pueden ser erroneas. No existe una medida publicada de calibracion ni de incertidumbre.
- Sesgo de dataset desconocido: no se documenta la composicion del conjunto de entrenamiento (especie, tejido, numero de volumenes, balance de clases), por lo que no se puede evaluar su generalizacion a preparaciones distintas de las usadas en exp_mito.
- Modelo sin validacion externa publica: registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y no se han encontrado articulos, informes tecnicos ni evaluaciones independientes.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad. No incluye concesion de patentes y se distribuye sin garantia alguna.
- Requisito de preprocesado estricto: la normalizacion debe ser min_max con min = -1.0 y max = 1.0, y la sigmoide debe aplicarse fuera del modelo. Omitir cualquiera de los dos pasos produce salidas incorrectas.
- Ausencia de datos de cuantizacion: no se documenta ninguna version en FP16, BF16 o INT8, por lo que reducir la precision en produccion queda bajo responsabilidad del integrador y debe validarse empiricamente.
- Fechas de metadatos anomalas: los campos de creacion y actualizacion del repositorio en HuggingFace indican 2026-10-15, lo que conviene verificar antes de citar el modelo con una fecha concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/mito-aff-resunet-setup-54
- Exportacion ONNX para web: https://huggingface.co/cellmap/onnx-web-models (subcarpeta setup_54)
- Repositorio cellmap-models: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia Research Campus): https://www.janelia.org/project-team/cellmap
- Paper o informe tecnico asociado: no disponible
- Demo publica independiente: no disponible
